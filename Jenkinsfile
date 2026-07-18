pipeline {
    agent any

    environment {
        DOCKERHUB_USERNAME = "utkrist"
        BACKEND_IMAGE = "utkrist/flame-backend"
        FRONTEND_IMAGE = "utkrist/flame-frontend"
    }

    stages {

        stage('Checkout') {
            steps {
                checkout scm
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
        stage('Docker Login') {
            steps {
                withCredentials([usernamePassword(
                    credentialsId: 'dockerhub-creds',
                    usernameVariable: 'DOCKER_USER',
                    passwordVariable: 'DOCKER_PASS'
                )]) {
                    sh 'echo $DOCKER_PASS | docker login -u $DOCKER_USER --password-stdin'
                }
            }
        }

        stage('Tag Images') {
            steps {
                sh '''
                docker tag flame-backend ${BACKEND_IMAGE}:latest
                docker tag flame-frontend ${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage('Push Images') {
            steps {
                sh '''
                docker push ${BACKEND_IMAGE}:latest
                docker push ${FRONTEND_IMAGE}:latest
                '''
            }
        }

        stage('Run Containers') {
            steps {
                sh 'docker-compose up -d'
            }
        }
    }
}