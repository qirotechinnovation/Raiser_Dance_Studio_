package com.dance.studio.repository;

import com.dance.studio.model.AboutUsCard;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface AboutUsCardRepository extends JpaRepository<AboutUsCard, Long> {
    List<AboutUsCard> findByActiveTrueOrderByDisplayOrderAsc();

    List<AboutUsCard> findAllByOrderByDisplayOrderAsc();
}
