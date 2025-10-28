/**
 * DoctorDashboard Component
 * 
 * Central dashboard for doctors to manage their appointments.
 * Displays all appointments with filtering and status management capabilities.
 * 
 * Features:
 * - View all appointments (pending/upcoming/active/past)
 * - Accept or decline pending appointments
 * - Add comments to appointments
 * - Real-time status filtering
 * - Appointment time validation
 * - Color-coded status badges
 * - Dark mode support
 * 
 * Filter Types:
 * - all: Show all appointments
 * - pending: Awaiting doctor approval
 * - upcoming: Scheduled for future
 * - active: Currently in progress
 * - past: Completed or cancelled
 * 
 * @component
 * @example
 * return (
 *   <DoctorDashboard />
 * )
 */

import React, { useState, useEffect } from 'react';
import { Check, X, Clock, Calendar, User, AlertCircle, TrendingUp } from 'lucide-react';
import LoadingSpinner from '../components/LoadingSpinner';
import { Appointment, AppointmentStatus } from '../types/types';
import { appointmentService } from '../services/appointment.service';
import { useApp } from '../context/AppContext';

const DoctorDashboard = () => {
    const { currentUser } = useApp();
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [appointments, setAppointments] = useState<Appointment[]>([]);
    const [filter, setFilter] = useState<'all' | 'pending' | 'upcoming' | 'active' | 'past'>('active');
    const [todayUpcomingCount, setTodayUpcomingCount] = useState<number>(0);

    // Fetch appointments on component mount
    useEffect(() => {
        fetchAppointments();
        fetchTodayUpcomingCount();
        
        // Refresh count every minute
        const interval = setInterval(fetchTodayUpcomingCount, 60000);
        return () => clearInterval(interval);
    }, []);

    /**
     * Fetch all appointments for the current doctor
     * 
     * Retrieves appointments from the backend and updates state.
     * Handles loading and error states.
     */
    const fetchAppointments = async () => {
        try {
            setIsLoading(true);
            const appointmentsData = await appointmentService.getDoctorAppointments();
            setAppointments(appointmentsData);
        } catch (err) {
            setError('Failed to fetch appointments');
            console.error('Error fetching appointments:', err);
        } finally {
            setIsLoading(false);
        }
    };

    /**
     * Fetch count of upcoming appointments for today
     * 
     * Updates the counter showing scheduled appointments for today.
     */
    const fetchTodayUpcomingCount = async () => {
        try {
            const data = await appointmentService.getTodayUpcomingCount();
            setTodayUpcomingCount(data.count);
        } catch (err) {
            console.error('Error fetching upcoming count:', err);
        }
    };

    /**
     * Update appointment status
     * 
     * Allows doctor to accept, decline, or complete appointments.
     * Refreshes appointment list after update.
     * 
     * @param {Appointment} appointment - Appointment to update
     * @param {AppointmentStatus} status - New status to set
     */
    const handleUpdateAppointment = async (appointment: Appointment, status: AppointmentStatus) => {
        try {
            await appointmentService.updateAppointment(
                appointment._id,
                { ...appointment, status }
            );
            fetchAppointments();
        } catch (err) {
            setError('Failed to update appointment');
            console.error('Error updating appointment:', err);
        }
    };

    /**
     * Handle comment change for an appointment
     * 
     * Updates the comment field in appointment state.
     * 
     * @param {string} id - Appointment ID
     * @param {React.ChangeEvent} e - Textarea change event
     */
    const handleChangeComment = (id: string, e: React.ChangeEvent<HTMLTextAreaElement>) => {
        setAppointments(prev => prev.map(appointment =>
            appointment._id === id
                ? { ...appointment, comment: e.target.value }
                : appointment
        ));
    };

    if (!currentUser || currentUser.role !== 'doctor') {
        return <div className='text-white p-8 text-center'>Please login as a doctor to access this dashboard</div>;
    }

    if (isLoading) {
        return <div className="flex justify-center items-center h-screen"><LoadingSpinner /></div>;
    }

    /**
     * Filter appointments based on selected filter
     * 
     * Filtering logic:
     * - pending: Status is pending
     * - upcoming: Start time is in future and status is scheduled
     * - active: Currently in progress (between start and end time)
     * - past: End time has passed or status is completed/cancelled
     * - all: No filter applied
     */
    const filteredAppointments = appointments.filter(appointment => {
        const appointmentStartStamp = new Date(`${appointment.date}T${appointment.startTime}`);
        const appointmentEndStamp = new Date(`${appointment.date}T${appointment.endTime}`);
        const now = new Date();
        
        if (filter === 'pending') {
            return appointment.status === 'pending';
        } else if (filter === 'upcoming') {
            return appointmentStartStamp > now && appointment.status === 'scheduled';
        } else if (filter === 'active') {
            return appointmentStartStamp <= now && appointmentEndStamp > now && appointment.status === 'scheduled';
        } else if (filter === 'past') {
            return appointmentEndStamp <= now || appointment.status === 'completed' || appointment.status === 'cancelled';
        }
        return true;
    });

    /**
     * Get color class for appointment status badge
     * 
     * Maps appointment status to Tailwind CSS color classes
     * for visual differentiation.
     * 
     * @param {AppointmentStatus} status - Appointment status
     * @returns {string} Tailwind CSS classes for badge styling
     */
    const getStatusBadgeColor = (status: AppointmentStatus) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
            case 'scheduled': return 'bg-blue-100 text-blue-800 border-blue-300';
            case 'completed': return 'bg-green-100 text-green-800 border-green-300';
            case 'cancelled': return 'bg-red-100 text-red-800 border-red-300';
            case 'rescheduled': return 'bg-purple-100 text-purple-800 border-purple-300';
            default: return 'bg-gray-100 text-gray-800 border-gray-300';
        }
    };

    return (
        <div className="max-w-7xl mx-auto p-4">
            {error && (
                <div className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    <AlertCircle className="inline-block mr-2" size={20} />
                    {error}
                </div>
            )}

            {/* Header with upcoming appointments counter */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                        Appointments
                    </h1>
                    <p className="text-gray-600 dark:text-gray-400">
                        Welcome, Dr. {currentUser?.name}
                    </p>
                </div>

                {/* Today's Upcoming Appointments Counter */}
                <div className="bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-4 min-w-[200px]">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm opacity-90">Today's Upcoming</p>
                            <p className="text-3xl font-bold">{todayUpcomingCount}</p>
                        </div>
                        <div className="bg-white/20 rounded-full p-3">
                            <TrendingUp size={24} />
                        </div>
                    </div>
                    <p className="text-xs mt-2 opacity-75">
                        {todayUpcomingCount === 0 
                            ? 'No appointments scheduled' 
                            : `${todayUpcomingCount} appointment${todayUpcomingCount !== 1 ? 's' : ''} remaining today`
                        }
                    </p>
                </div>
            </div>

            <div className="flex space-x-2 mb-6">
                <button
                    onClick={() => setFilter('all')}
                    className={`px-4 py-2 rounded-md ${
                        filter === 'all'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    All
                </button>
                <button
                    onClick={() => setFilter('active')}
                    className={`px-4 py-2 rounded-md ${
                        filter === 'active'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    Active
                </button>
                <button
                    onClick={() => setFilter('pending')}
                    className={`px-4 py-2 rounded-md ${
                        filter === 'pending'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    Pending
                </button>
                <button
                    onClick={() => setFilter('upcoming')}
                    className={`px-4 py-2 rounded-md ${
                        filter === 'upcoming'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    Upcoming
                </button>
                <button
                    onClick={() => setFilter('past')}
                    className={`px-4 py-2 rounded-md ${
                        filter === 'past'
                            ? 'bg-blue-600 text-white'
                            : 'bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                >
                    Past
                </button>
            </div>

            {filteredAppointments.length === 0 ? (
                <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-lg shadow-md">
                    <Calendar size={48} className="mx-auto text-gray-400 mb-4" />
                    <p className="text-xl text-gray-500 dark:text-gray-400">No appointments found</p>
                    <p className="text-gray-500 dark:text-gray-400">
                        {filter === 'pending' && "You have no pending appointment requests"}
                        {filter === 'upcoming' && "You have no upcoming appointments"}
                        {filter === 'active' && "You have no active appointments right now"}
                        {filter === 'past' && "You have no past appointments"}
                        {filter === 'all' && "You have no appointments yet"}
                    </p>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {filteredAppointments.map(appointment => (
                        <div 
                            key={appointment._id} 
                            className="bg-white dark:bg-gray-800 rounded-lg shadow-md overflow-hidden"
                        >
                            <div className="p-5 border-b dark:border-gray-700">
                                <div className="flex justify-between items-center">
                                    <div className="flex items-center gap-3">
                                        <User size={22} className="text-blue-500" />
                                        <span className="font-bold text-lg text-gray-800 dark:text-white">
                                            {typeof appointment.patientId === 'object' ? appointment.patientId.name : 'Unknown Patient'}
                                        </span>
                                    </div>
                                    <span className={`px-3 py-1 rounded-full text-xs font-medium border ${getStatusBadgeColor(appointment.status)}`}>
                                        {appointment.status.charAt(0).toUpperCase() + appointment.status.slice(1)}
                                    </span>
                                </div>
                            </div>
                            
                            <div className="p-5 space-y-4">
                                <div className="flex items-center gap-3">
                                    <Calendar size={18} className="text-gray-500" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {new Date(appointment.date).toLocaleDateString('en-US', { 
                                            weekday: 'long', 
                                            year: 'numeric', 
                                            month: 'long', 
                                            day: 'numeric' 
                                        })}
                                    </span>
                                </div>
                                
                                <div className="flex items-center gap-3">
                                    <Clock size={18} className="text-gray-500" />
                                    <span className="text-gray-700 dark:text-gray-300">
                                        {appointment.startTime} - {appointment.endTime}
                                    </span>
                                </div>
                                
                                {appointment.reason && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Reason:</p>
                                        <p className="text-gray-600 dark:text-gray-400">{appointment.reason}</p>
                                    </div>
                                )}
                                
                                {appointment.status === 'pending' && (
                                    <div className="mt-4">
                                        <label className="text-sm font-medium text-gray-700 dark:text-gray-300 block mb-1">
                                            Add a comment:
                                        </label>
                                        <textarea
                                            className="w-full p-3 rounded-md border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white mb-3"
                                            placeholder="Write a comment for the patient..."
                                            value={appointment.comment || ""}
                                            onChange={(e) => handleChangeComment(appointment._id, e)}
                                            rows={3}
                                        />
                                    </div>
                                )}
                                
                                {appointment.comment && appointment.status !== 'pending' && (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 p-3 rounded-md">
                                        <p className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Doctor's comment:</p>
                                        <p className="text-gray-600 dark:text-gray-400">{appointment.comment}</p>
                                    </div>
                                )}
                                
                                {appointment.notes && (
                                    <div className="bg-blue-50 dark:bg-blue-900/20 p-3 rounded-md">
                                        <p className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-1">Medical notes:</p>
                                        <p className="text-blue-600 dark:text-blue-400">{appointment.notes}</p>
                                    </div>
                                )}
                                
                                {/* Action buttons based on appointment status */}
                                {appointment.status === 'pending' && (
                                    <div className="flex gap-3 mt-4">
                                        <button
                                            onClick={() => handleUpdateAppointment(appointment, 'scheduled')}
                                            className="flex-1 bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <Check size={16} />
                                            Accept
                                        </button>
                                        <button
                                            onClick={() => handleUpdateAppointment(appointment, 'cancelled')}
                                            className="flex-1 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600 transition-colors flex items-center justify-center gap-2"
                                        >
                                            <X size={16} />
                                            Decline
                                        </button>
                                    </div>
                                )}
                                
                                {appointment.status === 'scheduled' && (
                                    <button
                                        onClick={() => handleUpdateAppointment(appointment, 'completed')}
                                        className="w-full bg-blue-500 text-white px-4 py-2 rounded-lg hover:bg-blue-600 transition-colors flex items-center justify-center gap-2 mt-4"
                                    >
                                        <Check size={16} />
                                        Mark as Completed
                                    </button>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default DoctorDashboard;
