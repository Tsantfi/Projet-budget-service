package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Vehicule;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface VehiculeRepository
        extends JpaRepository<Vehicule, Long> {

    // IMMATRICULATION

    Optional<Vehicule> findByImmatricule(
            String immatricule
    );

    // VEHICULES D'UN SOA

    List<Vehicule> findByCodeSoa_Id(
            Long soaId
    );

    // VEHICULES DISPONIBLES

    @Query("""
        SELECT v
        FROM Vehicule v
    """)
    List<Vehicule> findVehiculesDisponibles();

    // VEHICULE COMPLET D'UN SOA

    @Query("""
        SELECT DISTINCT v
        FROM Vehicule v

        LEFT JOIN FETCH v.codeSoa
        LEFT JOIN FETCH v.etat
        LEFT JOIN FETCH v.genre
        LEFT JOIN FETCH v.marque
        LEFT JOIN FETCH v.type
        LEFT JOIN FETCH v.carburant
        LEFT JOIN FETCH v.detenteur
        LEFT JOIN FETCH v.chauffeur

        WHERE v.codeSoa.id = :soaId
    """)
    List<Vehicule> findCompleteByCodeSoaId(
            @Param("soaId") Long soaId
    );

    // VEHICULES D'UN DETENTEUR

    List<Vehicule> findByDetenteur_Id(
            Long id
    );
    
    List<Vehicule> findByMinistere_NomMinistereAndLieuAffectationActuelContainingIgnoreCase( String nomMinistere, String directionService );
}