pipeline {
    agent any

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Parallel Node Tests') {
            parallel {
                stage('Test API') {
                    agent {
                        docker {
                            image 'node:20-alpine'
                            // Réutilise le cache de Docker Desktop sous Windows
                            reuseNode true 
                        }
                    }
                    steps {
                        dir('api') {
                            sh 'npm install && npm test'
                        }
                    }
                }

                stage('Test Worker') {
                    agent {
                        docker {
                            image 'node:20-alpine'
                            reuseNode true
                        }
                    }
                    steps {
                        dir('worker') {
                            sh 'npm install && npm test'
                        }
                    }
                }

                stage('Test Admin') {
                    agent {
                        docker {
                            image 'node:20-alpine'
                            reuseNode true
                        }
                    }
                    steps {
                        dir('admin') {
                            sh 'npm install && npm test'
                        }
                    }
                }
            }
        }
    }
}