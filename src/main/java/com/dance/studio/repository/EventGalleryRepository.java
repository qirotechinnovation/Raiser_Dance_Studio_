package com.dance.studio.repository;

import com.dance.studio.model.EventGallery;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface EventGalleryRepository extends JpaRepository<EventGallery, Long> {
    List<EventGallery> findByActiveTrueOrderByDisplayOrderAsc();
}
