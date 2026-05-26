node {
    stage('Checkout') { 
        checkout scm 
    }

    stage('Test API') {
        dir('api') {
            sh "npm install && npm test"
        }
    }

    stage('Test Worker') {
        dir('worker') {
            sh "npm install && npm test"
        }
    }

    stage('Test Admin') {
        dir('admin') {
            sh "npm install && npm test"
        }
    }
}