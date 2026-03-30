package com.dance.studio.model;

import jakarta.persistence.*;

@Entity
public class SangeetPackage {
	@Id
	@GeneratedValue
	private Long id;

	private String name;
	private double price;
	@Column(length = 5000)
	private String details;
	private int numberOfDances;
	private String theme;
	private boolean isPopular = false;
	private int displayOrder = 0;
	private String image; // Added for modernized UI

	public Long getId() {
		return id;
	}

	public void setId(Long id) {
		this.id = id;
	}

	public String getName() {
		return name;
	}

	public void setName(String name) {
		this.name = name;
	}

	public double getPrice() {
		return price;
	}

	public void setPrice(double price) {
		this.price = price;
	}

	public String getDetails() {
		return details;
	}

	public void setDetails(String details) {
		this.details = details;
	}

	public int getNumberOfDances() {
		return numberOfDances;
	}

	public void setNumberOfDances(int numberOfDances) {
		this.numberOfDances = numberOfDances;
	}

	public String getTheme() {
		return theme;
	}

	public void setTheme(String theme) {
		this.theme = theme;
	}

	public boolean isPopular() {
		return isPopular;
	}

	public void setPopular(boolean popular) {
		isPopular = popular;
	}

	public int getDisplayOrder() {
		return displayOrder;
	}

	public void setDisplayOrder(int displayOrder) {
		this.displayOrder = displayOrder;
	}

	public String getImage() {
		return image;
	}

	public void setImage(String image) {
		this.image = image;
	}

	private String billingCycle; // "MONTHLY" or "ANNUAL"
	private String duration; // e.g. "3 Days"
	private String choreographerList; // Comma separated names

	public String getBillingCycle() {
		return billingCycle;
	}

	public void setBillingCycle(String billingCycle) {
		this.billingCycle = billingCycle;
	}

	public String getDuration() {
		return duration;
	}

	public void setDuration(String duration) {
		this.duration = duration;
	}

	public String getChoreographerList() {
		return choreographerList;
	}

	public void setChoreographerList(String choreographerList) {
		this.choreographerList = choreographerList;
	}
}
