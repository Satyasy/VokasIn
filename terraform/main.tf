terraform {
  required_version = ">= 1.5.0"

  required_providers {
    aws = {
      source  = "hashicorp/aws"
      version = "~> 5.40"
    }
  }
}

provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "VokasIn"
      Environment = "Production"
      ManagedBy   = "Terraform"
    }
  }
}

# ------------------------------------------------------------------------------
# 1. Network & VPC Lookup
# ------------------------------------------------------------------------------
data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
  }
}

# ------------------------------------------------------------------------------
# 2. AMI Lookup: Ubuntu 24.04 LTS (Noble Numbat) for ARM64 (Graviton)
# ------------------------------------------------------------------------------
data "aws_ami" "ubuntu_arm64" {
  most_recent = true
  owners      = ["099720109477"] # Canonical

  filter {
    name   = "name"
    values = ["ubuntu/images/hvm-ssd-gp3/ubuntu-noble-24.04-arm64-server-*"]
  }

  filter {
    name   = "virtualization-type"
    values = ["hvm"]
  }

  filter {
    name   = "architecture"
    values = ["arm64"]
  }
}

# ------------------------------------------------------------------------------
# 3. Security Group: Inbound Web & SSH, Full Outbound for Supabase Access
# ------------------------------------------------------------------------------
resource "aws_security_group" "app_sg" {
  name        = "${var.app_name}-production-sg"
  description = "Security group for VokasIn Next.js server on EC2 t4g.small"
  vpc_id      = data.aws_vpc.default.id

  # SSH Access
  ingress {
    description = "SSH from anywhere"
    from_port   = 22
    to_port     = 22
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTP Web Traffic (Nginx)
  ingress {
    description = "HTTP web traffic"
    from_port   = 80
    to_port     = 80
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # HTTPS Web Traffic (Certbot / SSL)
  ingress {
    description = "HTTPS encrypted web traffic"
    from_port   = 443
    to_port     = 443
    protocol    = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  # Direct Application Port (Optional for debugging)
  # ingress {
  #   description = "Next.js internal port"
  #   from_port   = 3000
  #   to_port     = 3000
  #   protocol    = "tcp"
  #   cidr_blocks = ["0.0.0.0/0"]
  # }

  # Outbound rule for npm packages & general outbound
  egress {
    description = "Allow all outbound traffic"
    from_port   = 0
    to_port     = 0
    protocol    = "-1"
    cidr_blocks = ["0.0.0.0/0"]
  }

  tags = {
    Name = "${var.app_name}-sg"
  }
}

# ------------------------------------------------------------------------------
# 4. EC2 Instance: t4g.small (ARM64 Graviton2)
# ------------------------------------------------------------------------------
resource "aws_instance" "app_server" {
  ami                         = data.aws_ami.ubuntu_arm64.id
  instance_type               = var.instance_type
  key_name                    = var.key_name
  vpc_security_group_ids      = [aws_security_group.app_sg.id]
  subnet_id                   = tolist(data.aws_subnets.default.ids)[0]
  associate_public_ip_address = true

  root_block_device {
    volume_size           = var.disk_size_gb
    volume_type           = "gp3"
    iops                  = 3000
    throughput            = 125
    delete_on_termination = true
    encrypted             = true

    tags = {
      Name = "${var.app_name}-root-volume"
    }
  }

  # Cloud-init provisioning script for automated setup
  user_data = <<-EOF
              #!/bin/bash
              set -e

              # 1. Setup 2GB Swap file for compilation safety on 2GB RAM t4g.small
              fallocate -l 2G /swapfile
              chmod 600 /swapfile
              mkswap /swapfile
              swapon /swapfile
              echo '/swapfile none swap sw 0 0' >> /etc/fstab

              # 2. Update packages and install dependencies
              apt-get update -y
              apt-get install -y curl git ufw nginx build-essential certbot python3-certbot-nginx postgresql postgresql-contrib

              # 3. Configure local PostgreSQL
              systemctl enable postgresql
              systemctl start postgresql
              sudo -u postgres psql -c "CREATE USER vokasin WITH PASSWORD '${var.db_password}';"
              sudo -u postgres psql -c "CREATE DATABASE vokasin OWNER vokasin;"
              sudo -u postgres psql -c "GRANT ALL PRIVILEGES ON DATABASE vokasin TO vokasin;"

              # 4. Install Node.js 24.x LTS for ARM64
              curl -fsSL https://deb.nodesource.com/setup_24.x | bash -
              apt-get install -y nodejs

              # 5. Install PM2 Process Manager globally
              npm install -g pm2

              # 6. Create deployment directory
              mkdir -p /var/www/vokasin
              chown -R ubuntu:ubuntu /var/www/vokasin

              # 7. Configure Nginx reverse proxy
              cat > /etc/nginx/sites-available/vokasin <<NGINX_CONF
server {
    listen 80;
    server_name ${var.domain_name};

    client_max_body_size 50M;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade \$http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host \$host;
        proxy_set_header X-Real-IP \$remote_addr;
        proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto \$scheme;
        proxy_cache_bypass \$http_upgrade;
    }
}
NGINX_CONF

              rm -f /etc/nginx/sites-enabled/default
              ln -sf /etc/nginx/sites-available/vokasin /etc/nginx/sites-enabled/vokasin
              systemctl restart nginx

              # 8. Configure PM2 startup on boot for ubuntu user
              env PATH=$PATH:/usr/bin /usr/lib/node_modules/pm2/bin/pm2 startup systemd -u ubuntu --hp /home/ubuntu
              EOF

  tags = {
    Name = "${var.app_name}-server"
  }
}

# ------------------------------------------------------------------------------
# 5. Static Elastic IP (EIP)
# ------------------------------------------------------------------------------
resource "aws_eip" "app_eip" {
  instance = aws_instance.app_server.id
  domain   = "vpc"

  tags = {
    Name = "${var.app_name}-elastic-ip"
  }
}
