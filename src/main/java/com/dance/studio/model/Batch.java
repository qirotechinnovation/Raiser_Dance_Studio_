package com.dance.studio.model;

import jakarta.persistence.*;

@Entity
@Table(name = "batches")
public class Batch {

	@Id
	@GeneratedValue(strategy = GenerationType.IDENTITY)
	private Long id;

	private String name;
	private String timing;
	private String days;
	private boolean active;
	private String instructor;

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

	public String getTiming() {
		return timing;
	}

	public void setTiming(String timing) {
		this.timing = timing;
	}

	public String getDays() {
		return days;
	}

	public void setDays(String days) {
		this.days = days;
	}

	public boolean isActive() {
		return active;
	}

	public void setActive(boolean active) {
		this.active = active;
	}

	@ManyToOne
	@JoinColumn(name = "dance_type_id")
	private DanceType danceType;

	public DanceType getDanceType() {
		return danceType;
	}

	public void setDanceType(DanceType danceType) {
		this.danceType = danceType;
	}

	public String getInstructor() {
		return instructor;
	}

	public void setInstructor(String instructor) {
		this.instructor = instructor;
	}

	private String level;
	private String startTime;
	private String endTime;
	private int maxCapacity;
	private int currentStudents;
	private String roomNumber;
	private java.time.LocalDate startDate;
	private java.time.LocalDate endDate;

	public String getLevel() {
		return level;
	}

	public void setLevel(String level) {
		this.level = level;
	}

	public String getStartTime() {
		return startTime;
	}

	public void setStartTime(String startTime) {
		this.startTime = startTime;
	}

	public String getEndTime() {
		return endTime;
	}

	public void setEndTime(String endTime) {
		this.endTime = endTime;
	}

	public int getMaxCapacity() {
		return maxCapacity;
	}

	public void setMaxCapacity(int maxCapacity) {
		this.maxCapacity = maxCapacity;
	}

	public int getCurrentStudents() {
		return currentStudents;
	}

	public void setCurrentStudents(int currentStudents) {
		this.currentStudents = currentStudents;
	}

	public String getRoomNumber() {
		return roomNumber;
	}

	public void setRoomNumber(String roomNumber) {
		this.roomNumber = roomNumber;
	}

	public java.time.LocalDate getStartDate() {
		return startDate;
	}

	public void setStartDate(java.time.LocalDate startDate) {
		this.startDate = startDate;
	}

	public java.time.LocalDate getEndDate() {
		return endDate;
	}

	public void setEndDate(java.time.LocalDate endDate) {
		this.endDate = endDate;
	}

	/**
	 * Helper to check if this batch is scheduled for a specific day of week.
	 * Handles: "Monday", "Mon", "Mon-Fri", "Mon,Wed,Fri" etc.
	 */
	public boolean isScheduledForDay(java.time.DayOfWeek day) {
		if (this.days == null || this.days.trim().isEmpty())
			return false;

		String search = days.toUpperCase();
		String target = day.name(); // MONDAY
		String targetShort = target.substring(0, 3); // MON

		// 1. Check for full name or short name in string
		if (search.contains(target) || search.contains(targetShort)) {
			return true;
		}

		// 2. Handle ranges like "MON-FRI"
		if (search.contains("-")) {
			try {
				String[] parts = search.split("-");
				if (parts.length == 2) {
					int start = getDayPriority(parts[0].trim());
					int end = getDayPriority(parts[1].trim());
					int current = day.getValue(); // 1 (Mon) to 7 (Sun)

					if (start <= end) {
						return current >= start && current <= end;
					} else {
						// Handle wraparound like "SUN-THU" (if ever used)
						return current >= start || current <= end;
					}
				}
			} catch (Exception e) {
				// Fallback to false if parse fails
			}
		}

		return false;
	}

	private int getDayPriority(String dayStr) {
		if (dayStr.contains("MON"))
			return 1;
		if (dayStr.contains("TUE"))
			return 2;
		if (dayStr.contains("WED"))
			return 3;
		if (dayStr.contains("THU"))
			return 4;
		if (dayStr.contains("FRI"))
			return 5;
		if (dayStr.contains("SAT"))
			return 6;
		if (dayStr.contains("SUN"))
			return 7;
		return 0;
	}
}
