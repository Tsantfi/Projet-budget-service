package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.RecensementVehicule;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

public interface RecensementVehiculeRepository
        extends JpaRepository<RecensementVehicule, Long> {

    List<RecensementVehicule> findByRecensement_Id(
            Long recensementId
    );
    Optional<RecensementVehicule> findByRecensement_IdAndVehicule_Id(
        Long recensementId,
        Long vehiculeI
    );
    Optional<RecensementVehicule> findByRecensement_IdAndImmatriculation(
        Long recensementId,
        String immatriculation
);
    Optional<RecensementVehicule>
    findByRecensement_IdAndVehiculeIdOrigine(
            Long recensementId,
            Long vehiculeIdOrigine
    );

    @Query("""
    SELECT rv
    FROM RecensementVehicule rv
    WHERE rv.vehiculeIdOrigine = :vehiculeId
      AND UPPER(rv.statut) = 'NOUVEAU'
    ORDER BY rv.recensement.annee ASC
    """)
    List<RecensementVehicule> findHistoriqueNouveau(
            @Param("vehiculeId") Long vehiculeId
    );

}
