package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Reparation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReparationRepository extends JpaRepository<Reparation, Long> {
    
    // Charge immédiatement le véhicule obligatoire et le mécanicien optionnel pour empêcher le plantage de la session
    @Query("SELECT r FROM Reparation r JOIN FETCH r.vehicule LEFT JOIN FETCH r.mecanicien WHERE r.vehicule.id = :vehiculeId")
    List<Reparation> findByVehicule_Id(@Param("vehiculeId") Long vehiculeId);
}
