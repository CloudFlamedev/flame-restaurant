variable "aws_region" {
  default = "ap-south-1"
}

variable "ci_instance_type" {
  default = "t3.micro"
}

variable "app_instance_type" {
  default = "t3.micro"
}

variable "ci_instance_name" {
  default = "jenkins-server"
}

variable "app_instance_name" {
  default = "restaurant-server"
}

variable "key_name" {
  description = "AWS Key Pair Name"
  default     = "flame-key"
}