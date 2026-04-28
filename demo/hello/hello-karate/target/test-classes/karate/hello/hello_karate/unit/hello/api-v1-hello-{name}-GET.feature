Feature: Saluer une personne en particulier

  Background:
    * url baseUrl

  Scenario: Test GET operation for /api/v1/hello/{name}

    Given path 'api','v1','hello',name
    When method GET
    Then match expectedStatusList contains responseStatus
