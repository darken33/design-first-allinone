package com.sqli.pbousquet.helloapi.generated.api.server;

import com.sqli.pbousquet.helloapi.generated.api.model.ApiErrorResponse;
import com.sqli.pbousquet.helloapi.generated.api.model.HelloDto;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.context.request.NativeWebRequest;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;
import jakarta.annotation.Generated;

/**
 * A delegate to be called by the {@link HelloApiController}}.
 * Implement this interface with a {@link org.springframework.stereotype.Service} annotated class.
 */
@Generated(value = "org.openapitools.codegen.languages.SpringCodegen")
public interface HelloApiDelegate {

    default Optional<NativeWebRequest> getRequest() {
        return Optional.empty();
    }

    /**
     * GET /api/v1/hello/{name} : Saluer une personne en particulier
     * Retourne un message de salutation personalisé.
     *
     * @param name Nom de la personne à saluer (required)
     * @return OK (status code 200)
     *         or Bad Request (status code 400)
     *         or Internal Server Error (status code 500)
     * @see HelloApi#helloWithName
     */
    default ResponseEntity<HelloDto> helloWithName(String name) {
        getRequest().ifPresent(request -> {
            for (MediaType mediaType: MediaType.parseMediaTypes(request.getHeader("Accept"))) {
                if (mediaType.isCompatibleWith(MediaType.valueOf("application/json"))) {
                    String exampleString = "{ \"message\" : \"Hello World\" }";
                    ApiUtil.setExampleResponse(request, "application/json", exampleString);
                    break;
                }
            }
        });
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);

    }

    /**
     * GET /api/v1/hello : Saluer le monde
     * Retourne un message de salutation générique.
     *
     * @return OK (status code 200)
     *         or Internal Server Error (status code 500)
     * @see HelloApi#helloWorld
     */
    default ResponseEntity<HelloDto> helloWorld() {
        getRequest().ifPresent(request -> {
            for (MediaType mediaType: MediaType.parseMediaTypes(request.getHeader("Accept"))) {
                if (mediaType.isCompatibleWith(MediaType.valueOf("application/json"))) {
                    String exampleString = "{ \"message\" : \"Hello World\" }";
                    ApiUtil.setExampleResponse(request, "application/json", exampleString);
                    break;
                }
            }
        });
        return new ResponseEntity<>(HttpStatus.NOT_IMPLEMENTED);

    }

}
