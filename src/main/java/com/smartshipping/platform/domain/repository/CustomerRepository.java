package com.smartshipping.platform.domain.repository;

import com.smartshipping.platform.domain.model.Customer;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CustomerRepository extends JpaRepository<Customer, Long> {

    Optional<Customer> findByName(String name);

    List<Customer> findBySegment(Customer.CustomerSegment segment);

    List<Customer> findByType(Customer.CustomerType type);

    Page<Customer> findByCreditRatingGreaterThanEqual(Integer minRating, Pageable pageable);

    @Query("SELECT c FROM Customer c WHERE c.segment = :segment AND c.creditRating >= :minRating")
    List<Customer> findPremiumCustomersBySegment(
            Customer.CustomerSegment segment,
            Integer minRating
    );
}
