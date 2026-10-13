package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Entretien;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EntretienRepository extends JpaRepository<Entretien, Long> {
    
    // Le JOIN FETCH charge immédiatement le véhicule pour empêcher le plantage de la session
    @Query("SELECT e FROM Entretien e JOIN FETCH e.vehicule WHERE e.vehicule.id = :vehiculeId")
    List<Entretien> findByVehicule_Id(@Param("vehiculeId") Long vehiculeId);

}
