@ignore
Feature: Saluer le monde

  Background:
    * url baseUrl

  Scenario: Test GET operation for /api/v1/hello

    Given path 'api','v1','hello'
    When method GET
    Then match expectedStatusList contains responseStatus
