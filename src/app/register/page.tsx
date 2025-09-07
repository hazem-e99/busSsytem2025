"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardTitle, CardHeader } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Button } from '@/components/ui/Button';
import { useToast } from '@/components/ui/Toast';
import { Bus, Eye, EyeOff } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { authAPI } from '@/lib/api';
import { validateStudentRegistration } from '@/utils/validateStudentRegistration';

export default function RegisterPage() {
	const [firstName, setFirstName] = useState('');
	const [lastName, setLastName] = useState('');
	const [phoneNumber, setPhoneNumber] = useState('');
	const [nationalId, setNationalId] = useState('');
	const [email, setEmail] = useState('');
	const [studentAcademicNumber, setStudentAcademicNumber] = useState('');
	const [department, setDepartment] = useState('');
	const [yearOfStudy, setYearOfStudy] = useState('');
	const [password, setPassword] = useState('');
	const [confirmPassword, setConfirmPassword] = useState('');
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirmPassword, setShowConfirmPassword] = useState(false);
	const [loading, setLoading] = useState(false);
	const { showToast } = useToast();
	const router = useRouter();

	const departments = [
		'Medicine', 'Dentistry', 'Pharmacy', 'VeterinaryMedicine', 'Nursing',
		'CivilEngineering', 'MechanicalEngineering', 'ElectricalEngineering', 'ComputerEngineering', 'ChemicalEngineering',
		'Architecture', 'ComputerScience', 'InformationTechnology', 'SoftwareEngineering', 'DataScience',
		'BusinessAdministration', 'Accounting', 'Finance', 'Marketing', 'Economics', 'Management',
		'Law', 'ArabicLanguageAndLiterature', 'EnglishLanguageAndLiterature', 'History', 'Philosophy',
		'Geography', 'PoliticalScience', 'Psychology', 'Sociology', 'SocialWork', 'InternationalRelations',
		'Physics', 'Chemistry', 'Biology', 'Mathematics', 'Agriculture', 'AgriculturalEngineering',
		'Education', 'FineArts', 'Music', 'GraphicDesign', 'MassCommunication', 'Journalism',
		'PhysicalEducation', 'TourismAndHotels'
	];

	const yearsOfStudy = [
		'PreparatoryYear', 'FirstYear', 'SecondYear', 'ThirdYear', 'FourthYear',
		'FifthYear', 'SixthYear', 'SeventhYear',
		'MastersFirstYear', 'MastersSecondYear', 'MastersThirdYear',
		'PhDFirstYear', 'PhDSecondYear', 'PhDThirdYear', 'PhDFourthYear', 'PhDFifthYear', 'PhDSixthYear',
		'ResidencyFirstYear', 'ResidencySecondYear', 'ResidencyThirdYear', 'ResidencyFourthYear', 'ResidencyFifthYear',
		'FellowshipFirstYear', 'FellowshipSecondYear',
		'ExchangeStudent', 'VisitingStudent', 'NonDegreeStudent', 'ContinuingEducation',
		'DiplomaFirstYear', 'DiplomaSecondYear', 'DiplomaThirdYear',
		'ProfessionalFirstYear', 'ProfessionalSecondYear', 'ProfessionalThirdYear', 'ProfessionalFourthYear',
		'RepeatYear', 'ThesisWriting', 'DissertationWriting'
	];

	const onSubmit: React.FormEventHandler<HTMLFormElement> = async (e) => {
		e.preventDefault();
		
		// Prepare data for validation
		const userData = {
			firstName,
			lastName,
			nationalId,
			email,
			phoneNumber,
			studentAcademicNumber,
			department,
			yearOfStudy,
			password,
			confirmPassword
		};

		// Validate data using utility function
		const validation = validateStudentRegistration(userData);
		if (!validation.isValid) {
			showToast({ 
				type: 'error', 
				title: 'Validation Error', 
				message: validation.errors.join(', ') 
			});
			return;
		}

		setLoading(true);
		try {
			console.log('🚀 Starting registration with data:', userData);
			const data = await authAPI.registerStudent(userData);
			console.log('✅ Registration response:', data);
			
			if (!data || !data.success) {
				throw new Error(data?.error || 'Failed to register');
			}

			showToast({ 
				type: 'success', 
				title: 'Registration Successful', 
				message: 'Your account has been created successfully. Please check your email for verification code.' 
			});

			// Redirect to verification page with email
			router.push(`/auth/verification?email=${encodeURIComponent(email)}`);
		} catch (err: unknown) {
			const errorMessage = err instanceof Error ? err.message : 'Please try again.';
			showToast({ 
				type: 'error', 
				title: 'Registration Failed', 
				message: errorMessage 
			});
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen relative overflow-hidden bg-background flex items-center justify-center p-6">
			<div className="pointer-events-none absolute inset-0">
				<div className="absolute -top-32 -left-32 h-80 w-80 rounded-full bg-gradient-to-br from-primary/25 to-primary-hover/25 blur-3xl opacity-70 animate-pulse" />
				<div className="absolute -bottom-32 -right-32 h-80 w-80 rounded-full bg-gradient-to-tr from-emerald-400/15 to-sky-400/15 blur-3xl opacity-70 animate-pulse" />
			</div>
			<div className="w-full max-w-2xl relative">
				<div className="text-center mb-8">
					<div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-r from-primary to-primary-hover rounded-2xl mb-4 shadow-xl">
						<Bus className="w-8 h-8 text-white" />
					</div>
					<h1 className="text-3xl font-bold text-text-primary">Student Registration</h1>
					<p className="text-text-secondary">Join the University Bus System</p>
				</div>
				
				<div className="group relative">
					<div className="absolute -inset-[2px] rounded-3xl bg-gradient-to-r from-primary/50 via-primary-hover/50 to-primary/50 opacity-70 blur-xl transition-opacity duration-500 group-hover:opacity-90" aria-hidden="true" />
					<Card className="relative rounded-2xl border border-white/10 bg-background/70 backdrop-blur-xl shadow-2xl">
					<CardHeader>
						<CardTitle>Create Student Account</CardTitle>
						<CardDescription>Fill in your details to get started</CardDescription>
					</CardHeader>
					<CardContent>
						<form onSubmit={onSubmit} className="space-y-6">
							{/* Personal Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-text-primary border-b pb-2">Personal Information</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-text-primary mb-1">First Name *</label>
										<Input 
											type="text" 
											value={firstName} 
											onChange={(e) => setFirstName(e.target.value)} 
											placeholder="Enter first name"
											required 
											minLength={2}
											maxLength={20}
											className="h-11 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-text-primary mb-1">Last Name *</label>
										<Input 
											type="text" 
											value={lastName} 
											onChange={(e) => setLastName(e.target.value)} 
											placeholder="Enter last name"
											required 
											minLength={2}
											maxLength={20}
											className="h-11 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
										/>
									</div>
								</div>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-text-primary mb-1">Phone Number *</label>
										<Input 
											type="tel" 
											value={phoneNumber} 
											onChange={(e) => setPhoneNumber(e.target.value)} 
											placeholder="Enter phone number"
											required 
											pattern="^01[0-2,5]{1}[0-9]{8}$"
											inputMode="tel"
											className="h-11 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-text-primary mb-1">National ID *</label>
										<Input 
											type="text" 
											value={nationalId} 
											onChange={(e) => setNationalId(e.target.value.replace(/[^0-9]/g, '').slice(0, 14))} 
											placeholder="Enter national ID"
											required 
											pattern="^[0-9]{14}$"
											maxLength={14}
											inputMode="numeric"
											title="National ID must be exactly 14 digits"
											className="h-11 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
										/>
									</div>
								</div>
							</div>

							{/* Academic Information */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-text-primary border-b pb-2">Academic Information</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-text-primary mb-1">Email *</label>
										<Input 
											type="email" 
											value={email} 
											onChange={(e) => setEmail(e.target.value)} 
											placeholder="Enter university email"
											required 
											className="h-11 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
										/>
									</div>
									<div>
										<label className="block text-sm font-medium text-text-primary mb-1">Student Academic Number *</label>
										<Input 
											type="text" 
											value={studentAcademicNumber} 
											onChange={(e) => setStudentAcademicNumber(e.target.value)} 
											placeholder="Enter student academic number"
											required 
											maxLength={20}
											className="h-11 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
										/>
									</div>
								</div>
								
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-text-primary mb-1">Department *</label>
										<Select 
											value={department} 
											onChange={(e) => setDepartment(e.target.value)}
											required
											className="h-11 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
										>
											<option value="">Select Department</option>
											{departments.map(dept => (
												<option key={dept} value={dept}>{dept}</option>
											))}
										</Select>
									</div>
									<div>
										<label className="block text-sm font-medium text-text-primary mb-1">Year of Study *</label>
										<Select 
											value={yearOfStudy} 
											onChange={(e) => setYearOfStudy(e.target.value)}
											required
											className="h-11 rounded-xl bg-background/70 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
										>
											<option value="">Select Year of Study</option>
											{yearsOfStudy.map(year => (
												<option key={year} value={year}>{year}</option>
											))}
										</Select>
									</div>
								</div>
							</div>

							{/* Security */}
							<div className="space-y-4">
								<h3 className="text-lg font-semibold text-text-primary border-b pb-2">Security</h3>
								<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
									<div>
										<label className="block text-sm font-medium text-text-primary mb-1">Password *</label>
										<div className="relative">
											<Input 
												type={showPassword ? 'text' : 'password'} 
												value={password} 
												onChange={(e) => setPassword(e.target.value)} 
												placeholder="Enter password"
												required 
												minLength={6}
												className="h-11 rounded-xl bg-background/70 pr-10 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
											/>
											<button
												type="button"
												onClick={() => setShowPassword(!showPassword)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
											>
												{showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
											</button>
										</div>
										<p className="text-xs text-text-muted mt-1">Minimum 6 characters</p>
									</div>
									<div>
										<label className="block text-sm font-medium text-text-primary mb-1">Confirm Password *</label>
										<div className="relative">
											<Input 
												type={showConfirmPassword ? 'text' : 'password'} 
												value={confirmPassword} 
												onChange={(e) => setConfirmPassword(e.target.value)} 
												placeholder="Confirm password"
												required 
												minLength={6}
												className="h-11 rounded-xl bg-background/70 pr-10 transition-colors focus:ring-2 focus:ring-primary/40 focus:border-primary"
											/>
											<button
												type="button"
												onClick={() => setShowConfirmPassword(!showConfirmPassword)}
												className="absolute right-3 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary"
											>
												{showConfirmPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
											</button>
										</div>
									</div>
								</div>
							</div>

							<Button 
								type="submit" 
								className="w-full h-12 rounded-xl bg-gradient-to-r from-primary to-primary-hover text-white shadow-lg shadow-primary/20 hover:shadow-primary/30 transition-all hover:-translate-y-0.5 active:translate-y-0" 
								disabled={loading}
							>
								<span className="inline-flex items-center justify-center gap-2">
									{loading ? (
										<span>Creating Account...</span>
									) : (
										<>
											<Bus className="h-5 w-5" />
											<span>Create Account</span>
										</>
									)}
								</span>
							</Button>
							
							<div className="text-center text-sm text-text-muted">
								Already have an account?{' '}
								<a href="/auth/login" className="text-primary hover:text-primary-hover font-medium">
									Sign in here
								</a>
							</div>
						</form>
					</CardContent>
				</Card>
			</div>
			</div>
		</div>
	);
}
