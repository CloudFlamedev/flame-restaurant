provider "aws" {
  region = var.aws_region

  default_tags {
    tags = {
      Project     = "Flame Restaurant"
      Environment = "Learning"
      ManagedBy   = "Terraform"
      Owner       = "Utkrist"
    }
  }
}