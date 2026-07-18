output "ci_public_ip" {
  value = aws_instance.ci_server.public_ip
}

output "app_public_ip" {
  value = aws_instance.app_server.public_ip
}

output "backend_ecr_url" {
  value = aws_ecr_repository.backend.repository_url
}

output "frontend_ecr_url" {
  value = aws_ecr_repository.frontend.repository_url
}