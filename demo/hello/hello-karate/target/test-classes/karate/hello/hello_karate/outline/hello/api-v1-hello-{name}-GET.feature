@ignore
Feature: Saluer une personne en particulier

  Background:
    * url baseUrl

  Scenario Outline: Test GET operation for /api/v1/hello/{name}

    Given path 'api','v1','hello',name
    When method GET
    Then status <status>

    Examples:
      |name|status|
      |''|200|