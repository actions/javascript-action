pipeline {
    agent {
        docker {
            image 'node:24'
            args '-u root:root'
        }
    }

    environment {
        NODE_OPTIONS = '--experimental-vm-modules'
        NODE_NO_WARNINGS = '1'
    }

    options {
        timestamps()
        disableConcurrentBuilds()
    }

    stages {
        stage('Checkout') {
            steps {
                checkout scm
            }
        }

        stage('Install Dependencies') {
            steps {
                sh 'npm ci'
            }
        }

        stage('Check Format') {
            steps {
                sh 'npm run format:check'
            }
        }

        stage('Lint') {
            steps {
                sh 'npm run lint'
            }
        }

        stage('Test') {
            steps {
                sh 'npm run ci-test'
            }
            post {
                always {
                    // If you later switch to a jest-junit reporter, point this
                    // at the generated XML so Jenkins can render test trends.
                    junit allowEmptyResults: true, testResults: 'reports/junit/*.xml'
                }
            }
        }

        stage('Build (package)') {
            steps {
                sh 'npm run package'
            }
        }

        stage('Test Action') {
            steps {
                // Mirrors the "Test Local Action" step in .github/workflows/ci.yml:
                // runs the compiled action directly with a sample input.
                sh 'INPUT_MILLISECONDS=1000 node dist/index.js'
            }
        }
    }

    post {
        success {
            echo 'Build, lint, tests, and action smoke test all passed.'
        }
        failure {
            echo 'Pipeline failed - check the stage logs above.'
        }
    }
}
