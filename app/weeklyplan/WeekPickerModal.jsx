import { React, useState } from 'react'
import { Modal, ModalHeader, ModalBody, Button, ButtonGroup } from 'reactstrap'
import { DayPicker } from 'react-day-picker'
import { format, startOfWeek, isSameWeek, addDays, subDays } from 'date-fns'
import 'react-day-picker/dist/style.css'

function WeekPickerModal({ weekOf, setWeekOf }) {
	const [modalOpen, setModalOpen] = useState(false)
	const parsedWeekOf = new Date(weekOf + 'T00:00:00')
	const [selectedDate, setSelectedDate] = useState(parsedWeekOf)

	const handleDayClick = (date) => {
		const monday = startOfWeek(date, { weekStartsOn: 1 })
		setSelectedDate(monday)
		setWeekOf(monday.toISOString().split('T')[0])
		setModalOpen(false)
	}

	const goToPreviousWeek = () => {
		const prev = subDays(parsedWeekOf, 7)
		setSelectedDate(prev)
		setWeekOf(prev.toISOString().split('T')[0])
	}

	const goToNextWeek = () => {
		const next = addDays(parsedWeekOf, 7)
		setSelectedDate(next)
		setWeekOf(next.toISOString().split('T')[0])
	}

	return (
		<div>
			<ButtonGroup>
				<Button color="secondary" outline onClick={goToPreviousWeek} >
					←
				</Button>
				<Button color="secondary" onClick={() => setModalOpen(true)}>
					{`Week of: ${format(parsedWeekOf, 'MMM d, yyyy')}`}
				</Button>
				<Button color="secondary" outline onClick={goToNextWeek}>
					→
				</Button>
			</ButtonGroup>

			<Modal isOpen={modalOpen} toggle={() => setModalOpen(!modalOpen)}>
				<ModalHeader toggle={() => setModalOpen(!modalOpen)}>
					Select a Week
				</ModalHeader>
				<ModalBody>
					<DayPicker
						mode="single"
						selected={selectedDate}
						onDayClick={handleDayClick}
						weekStartsOn={1}
						modifiers={{
							selectedWeek: (day) =>
								isSameWeek(day, selectedDate, { weekStartsOn: 1 })
						}}
						modifiersClassNames={{
							selectedWeek: 'selected-week'
						}}
					/>
					<style>{`
						.selected-week {
							background-color: #d0e8ff;
							border-radius: 0;
						}
					`}</style>
				</ModalBody>
			</Modal>
		</div>
	)
}

export default WeekPickerModal
