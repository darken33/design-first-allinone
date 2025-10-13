@ignore
Feature: Saluer le monde

  Background:
    * url baseUrl

  Scenario Outline: Test GET operation for /api/v1/hello

    Given path 'api','v1','hello'
    When method GET
    Then status <status>

    Examples:
      |status|
      |200|