node {
    stage('Checkout') { 
        checkout scm 
    }

    // On force l'exécution des tests à l'intérieur d'un conteneur Node officiel
    docker.image('node:20-alpine').inside {
        def services = ['api', 'worker', 'admin']

        // Boucle dynamique en parallèle
        def parallelStages = [:]
        services.each { svc ->
            parallelStages[svc] = {
                stage("Test ${svc}") {
                    dir(svc) {
                        sh 'npm ci && npm test'
                    }
                }
            }
        }
        parallel parallelStages
    }

    // Logique conditionnelle hors du conteneur Node
    if (env.BRANCH_NAME == 'main' && currentBuild.changeSets.size() > 0) {
        stage('Release') {
            def version = sh(returnStdout: true, script: 'git describe --tags').trim()
            sh "./release.sh ${version}"
        }
    }
}