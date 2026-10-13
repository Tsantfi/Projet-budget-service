package mg.drbf.haigana.repository;

import mg.drbf.haigana.entity.Constatation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Modifying;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ConstatationRepository
        extends JpaRepository<Constatation, Long> {

    @Query("""
        SELECT c
        FROM Constatation c
        JOIN FETCH c.controle
        WHERE c.controle.id = :controleId
        """)
    List<Constatation> findByControle_Id(
            @Param("controleId") Long controleId
    );

    long countByControle_Id(Long controleId);
    int deleteAllByControleId(@Param("controleId") Long controleId
);
}