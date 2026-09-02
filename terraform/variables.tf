variable "aws_region" {
  description = "AWS region to deploy resources (e.g. ap-southeast-1 for Singapore, ap-southeast-3 for Jakarta)"
  type        = string
  default     = "ap-southeast-3"
}

variable "instance_type" {
  description = "AWS EC2 instance type (Graviton2 ARM64 recommended for high efficiency and local model execution)"
  type        = string
  default     = "t4g.small"
}

variable "key_name" {
  description = "Name of existing AWS EC2 Key Pair for SSH access"
  type        = string
}

variable "app_name" {
  description = "Application name for tagging and naming resources"
  type        = string
  default     = "vokasin"
}

variable "disk_size_gb" {
  description = "Root disk storage size in GB (gp3 SSD)"
  type        = number
  default     = 30
}

variable "domain_name" {
  description = "Optional domain name for Nginx server block and SSL configuration"
  type        = string
  default     = "_"
}

variable "db_password" {
  description = "Password for the local PostgreSQL 'vokasin' user"
  type        = string
  sensitive   = true
}
