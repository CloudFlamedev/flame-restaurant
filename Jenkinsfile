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
        stage('SonarQube Analysis') {
            environment {
                scannerHome = tool 'SonarScanner'
            }
            steps {
                withSonarQubeEnv('SonarQube') {
                    sh """
                        ${scannerHome}/bin/sonar-scanner \
                        -Dsonar.projectKey=flame-restaurant \
                        -Dsonar.projectName=flame-restaurant \
                        -Dsonar.sources=. \
                        -Dsonar.exclusions=**/node_modules/**,**/.git/** \
                        -Dsonar.sourceEncoding=UTF-8
                    """
                }
            }
        }
        stage('Run Containers') {
            steps {
                sh '''
                    docker-compose up -d
                '''
            }
        }
    }
}