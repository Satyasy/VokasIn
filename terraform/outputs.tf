output "instance_id" {
  description = "ID of the created AWS EC2 instance"
  value       = aws_instance.app_server.id
}

output "public_ip" {
  description = "Static Elastic IP address of the VokasIn server"
  value       = aws_eip.app_eip.public_ip
}

output "ssh_command" {
  description = "Command to connect to the server via SSH"
  value       = "ssh -i <path-to-${var.key_name}.pem> ubuntu@${aws_eip.app_eip.public_ip}"
}

output "app_url" {
  description = "Public HTTP URL of the application"
  value       = "http://${aws_eip.app_eip.public_ip}"
}

output "github_actions_secrets" {
  description = "Configuration values to set in your GitHub Repository Secrets for automated CI/CD"
  value = {
    EC2_HOST     = aws_eip.app_eip.public_ip
    EC2_USERNAME = "ubuntu"
    EC2_SSH_KEY  = "<Contents of your ${var.key_name}.pem private key>"
    DB_PASSWORD  = var.db_password
  }
  sensitive = true
}
