package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Suivi;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SuiviRepository extends JpaRepository<Suivi, Long> {
    
    // Le JOIN FETCH charge immédiatement le véhicule pour empêcher le plantage de la session
    @Query("SELECT s FROM Suivi s JOIN FETCH s.vehicule WHERE s.vehicule.id = :vehiculeId")
    List<Suivi> findByVehicule_Id(@Param("vehiculeId") Long vehiculeId);
}
