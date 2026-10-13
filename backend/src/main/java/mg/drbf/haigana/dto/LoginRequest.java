package mg.drbf.haigana.dto;

import jakarta.validation.constraints.NotBlank;

public record LoginRequest(
        @NotBlank String immatricule,
        @NotBlank String motPasse
) {}
