pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                echo 'Checking out code'
            }
        }

        stage('Build Backend') {
            steps {
                sh 'docker build -t flame-backend ./backend'
            }
        }

        stage('Build Frontend') {
            steps {
                sh 'docker build -t flame-frontend ./frontend'
            }
        }

        stage('Run Containers') {
            steps {
                sh 'docker compose up -d'
            }
        }
    }
}