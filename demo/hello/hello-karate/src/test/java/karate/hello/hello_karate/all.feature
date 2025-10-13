Feature: Test all APIs

  Background:
    * url baseUrl
    * def authUser1 = callonce read('classpath:features/all-users.feature@auth_user1')
    * def jwtToken = authUser1.response.access_token
    * def refreshToken = authUser1.response.refresh_token
    * configure headers = { 'header_1': 'header_1_value' }

  Scenario: hello - api-v1-hello-GET

    * call read('classpath:features/unit/hello/api-v1-hello-GET.feature') {jwtToken: #(jwtToken), expectedStatusList: [200]}

  Scenario: hello - api-v1-hello-{name}-GET

    * call read('classpath:features/unit/hello/api-v1-hello-{name}-GET.feature') {jwtToken: #(jwtToken), expectedStatusList: [200]}

