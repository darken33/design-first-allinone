@ignore
Feature: Authentification

  Background:
    * url baseUrl

  @auth_user1
  Scenario: Authentification user1

    * def body = {"email": "user_1@mail.com", "password": "user_1_password" }

    Given path 'api','auth','login'
    And request body
    When method POST
    Then status 200
