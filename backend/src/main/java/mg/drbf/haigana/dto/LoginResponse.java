package mg.drbf.haigana.dto;

public record LoginResponse(
        String token,
        String immatricule,
        String nom,
        String prenom,
        String role
) {}
