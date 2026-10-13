package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Observation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ObservationRepository extends JpaRepository<Observation, Long> {
    
    // Le JOIN FETCH charge immédiatement le bon de commande pour empêcher le plantage de la session
    @Query("SELECT o FROM Observation o JOIN FETCH o.bonCommande WHERE o.bonCommande.id = :bonCommandeId")
    List<Observation> findByBonCommande_Id(@Param("bonCommandeId") Long bonCommandeId);
}
