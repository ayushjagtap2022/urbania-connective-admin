import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { userService } from '@/services/user.service';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { UserRound, Mail, Phone, Building2, KeyRound, UserCog, Eye, EyeOff, Image as ImageIcon, Info, CheckCircle2, XCircle, Building, MapPin } from 'lucide-react';

const defaultForm = {
  firstName: '',
  lastName: '',
  mobile: '',
  email: '',
  phone: '',
  address: '',
  organization: '',
  password: '',
  roles: ['user'],
  status: 'approved' as 'approved' | 'pending' | 'rejected', // default to active
  sendWelcome: false,
  avatar: undefined as File | undefined,
  buildingName: '',
  wing: '',
  flatNo: '',
  dob: '',
  bio: '',
  middleName: '',
  occupationProfile: '',
  workplaceAddress: '',
  familyCount: '',
  maleAbove18: '',
  maleAbove60: '',
  maleUnder18: '',
  femaleAbove18: '',
  femaleAbove60: '',
  femaleUnder18: '',
  forumContribution: '',
};

const roleDescriptions: Record<string, string> = {
  user: 'Standard user with limited access.',
  admin: 'Administrator with full access to all features.',
};

function getPasswordStrength(password: string) {
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[a-z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  return score;
}

const AddUser = () => {
  const [form, setForm] = useState<typeof defaultForm>(defaultForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [showSuccessOptions, setShowSuccessOptions] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const navigate = useNavigate();

  const mutation = useMutation({
    mutationFn: async (data: typeof defaultForm) => {
      setLoading(true);
      try {
        // Prepare form data for avatar upload
        const { avatar, ...submitData } = data;
        await userService.addUser(submitData);
        toast.success('User added successfully');
        setShowSuccessOptions(true);
      } catch (error: any) {
        toast.error(error.message || 'Failed to add user');
      } finally {
        setLoading(false);
      }
    },
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    setForm((prev) => ({ ...prev, [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleRoleChange = (role: string) => {
    setForm((prev) => {
      const roles = prev.roles.includes(role)
        ? prev.roles.filter((r) => r !== role)
        : [...prev.roles, role];
      return { ...prev, roles };
    });
  };

  const handleStatusToggle = (checked: boolean) => {
    setForm((prev) => ({ ...prev, status: checked ? 'approved' : 'pending' }));
  };

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setForm((prev) => ({ ...prev, avatar: file }));
      const reader = new FileReader();
      reader.onload = (ev) => setAvatarPreview(ev.target?.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handlePasswordVisibility = () => setShowPassword((v) => !v);

  const handleSelectChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
    setErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const validate = () => {
    const newErrors: { [key: string]: string } = {};
    if (!form.firstName.trim()) newErrors.firstName = 'First name is required.';
    if (!form.lastName.trim()) newErrors.lastName = 'Last name is required.';
    if (!form.mobile.trim()) newErrors.mobile = 'Mobile number is required.';
    if (!form.email.trim()) newErrors.email = 'Email is required.';
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(form.email)) newErrors.email = 'Invalid email format.';
    if (!form.password.trim()) newErrors.password = 'Password is required.';
    else if (getPasswordStrength(form.password) < 3) newErrors.password = 'Password is too weak.';
    if (!form.buildingName.trim()) newErrors.buildingName = 'Building name is required.';
    if (!form.wing.trim()) newErrors.wing = 'Wing is required.';
    if (!form.flatNo.trim()) newErrors.flatNo = 'Flat No is required.';
    if (!form.dob.trim()) newErrors.dob = 'Date of Birth is required.';
    return newErrors;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const validationErrors = validate();
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }
    mutation.mutate(form);
  };

  const handleReset = () => {
    setForm(defaultForm);
    setAvatarPreview(null);
    setErrors({});
    setShowSuccessOptions(false);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  const passwordStrength = getPasswordStrength(form.password);
  const passwordStrengthText = ['Very Weak', 'Weak', 'Fair', 'Good', 'Strong'];
  const passwordStrengthColor = ['bg-red-400', 'bg-orange-400', 'bg-yellow-400', 'bg-blue-400', 'bg-green-500'];

  return (
    <ScrollArea className="h-[calc(100vh-6rem)] px-4 md:px-8">
      <div className="max-w-4xl mx-auto py-8">
        <Card className="shadow-lg">
          <CardHeader className="space-y-2 pb-4 border-b">
            <div className="flex items-center space-x-2">
              <UserCog className="h-6 w-6 text-primary" />
              <CardTitle className="text-2xl font-bold">Add New User</CardTitle>
            </div>
            <CardDescription className="text-base">
              Fill in the details below to create a new user account. Required fields are marked with an asterisk (*).
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showSuccessOptions ? (
              <div className="flex flex-col items-center space-y-6 py-12">
                <div className="rounded-full bg-green-50 p-3">
                  <CheckCircle2 className="h-12 w-12 text-green-500" />
                </div>
                <div className="text-center space-y-2">
                  <h3 className="text-xl font-semibold text-green-700">User Added Successfully!</h3>
                  <p className="text-muted-foreground">The new user account has been created and is ready to use.</p>
                </div>
                <div className="flex gap-4 pt-4">
                  <Button variant="outline" onClick={handleReset} className="min-w-[120px]">
                    Add Another
                  </Button>
                  <Button variant="default" onClick={() => navigate('/admin/users')} className="min-w-[120px]">
                    View Users
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} autoComplete="off" className="space-y-0">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* Avatar Upload */}
                  <div className="col-span-1 flex flex-col items-center md:items-start gap-2 md:gap-4 lg:col-span-1">
                    <Label className="text-base font-semibold">Profile Picture</Label>
                    <div className="flex items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-muted flex items-center justify-center overflow-hidden border-2 border-muted">
                        {avatarPreview ? (
                          <img src={avatarPreview} alt="Avatar Preview" className="object-cover w-full h-full" />
                        ) : (
                          <ImageIcon className="h-8 w-8 text-muted-foreground" />
                        )}
                      </div>
                      <div className="space-y-2">
                        <input
                          type="file"
                          accept="image/*"
                          ref={fileInputRef}
                          style={{ display: 'none' }}
                          onChange={handleAvatarChange}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          onClick={() => fileInputRef.current?.click()}
                          className="w-full"
                        >
                          Choose Image
                        </Button>
                        {form.avatar && (
                          <Button
                            type="button"
                            variant="outline"
                            className="w-full text-destructive hover:text-destructive"
                            onClick={() => {
                              setForm((prev) => ({ ...prev, avatar: undefined }));
                              setAvatarPreview(null);
                              if (fileInputRef.current) fileInputRef.current.value = '';
                            }}
                          >
                            Remove
                          </Button>
                        )}
                      </div>
                    </div>
                  </div>
                  {/* First Name */}
                  <div className="col-span-1">
                    <Label htmlFor="firstName" className="text-sm font-medium">First Name <span className="text-destructive">*</span></Label>
                    <Input id="firstName" name="firstName" value={form.firstName} onChange={handleChange} className={errors.firstName ? 'border-destructive' : ''} placeholder="Enter first name" />
                    {errors.firstName && <p className="text-xs text-destructive flex items-center gap-1 mt-1"><XCircle className="h-3 w-3" /> {errors.firstName}</p>}
                  </div>
                  {/* Middle Name */}
                  <div className="col-span-1">
                    <Label htmlFor="middleName" className="text-sm font-medium">Middle Name</Label>
                    <Input id="middleName" name="middleName" value={form.middleName} onChange={handleChange} placeholder="Enter middle name" />
                  </div>
                  {/* Last Name */}
                  <div className="col-span-1">
                    <Label htmlFor="lastName" className="text-sm font-medium">Last Name <span className="text-destructive">*</span></Label>
                    <Input id="lastName" name="lastName" value={form.lastName} onChange={handleChange} className={errors.lastName ? 'border-destructive' : ''} placeholder="Enter last name" />
                    {errors.lastName && <p className="text-xs text-destructive flex items-center gap-1 mt-1"><XCircle className="h-3 w-3" /> {errors.lastName}</p>}
                  </div>
                  {/* Mobile Number */}
                  <div className="col-span-1">
                    <Label htmlFor="mobile" className="text-sm font-medium">Mobile Number <span className="text-destructive">*</span></Label>
                    <Input id="mobile" name="mobile" value={form.mobile} onChange={handleChange} className={errors.mobile ? 'border-destructive' : ''} placeholder="Enter mobile number" />
                    {errors.mobile && <p className="text-xs text-destructive flex items-center gap-1 mt-1"><XCircle className="h-3 w-3" /> {errors.mobile}</p>}
                  </div>
                  {/* Email */}
                  <div className="col-span-1">
                    <Label htmlFor="email" className="text-sm font-medium">Email <span className="text-destructive">*</span></Label>
                    <Input id="email" name="email" type="email" value={form.email} onChange={handleChange} className={errors.email ? 'border-destructive' : ''} placeholder="Enter email address" />
                    {errors.email && <p className="text-xs text-destructive flex items-center gap-1 mt-1"><XCircle className="h-3 w-3" /> {errors.email}</p>}
                  </div>
                  {/* Phone Number */}
                  <div className="col-span-1">
                    <Label htmlFor="phone" className="text-sm font-medium">Phone Number</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="phone"
                        name="phone"
                        value={form.phone}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Enter phone number"
                      />
                    </div>
                  </div>
                  {/* Organization */}
                  <div className="col-span-1">
                    <Label htmlFor="organization" className="text-sm font-medium">Organization</Label>
                    <div className="relative">
                      <Building className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="organization"
                        name="organization"
                        value={form.organization}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Enter organization name"
                      />
                    </div>
                  </div>
                  {/* Address */}
                  <div className="col-span-1">
                    <Label htmlFor="address" className="text-sm font-medium">Address</Label>
                    <div className="relative">
                      <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="address"
                        name="address"
                        value={form.address}
                        onChange={handleChange}
                        className="pl-10"
                        placeholder="Enter address"
                      />
                    </div>
                  </div>
                  {/* Building Name */}
                  <div className="col-span-1">
                    <Label htmlFor="buildingName" className="text-sm font-medium">Building Name <span className="text-destructive">*</span></Label>
                    <select
                      id="buildingName"
                      name="buildingName"
                      value={form.buildingName}
                      onChange={handleSelectChange}
                      className={`w-full border rounded px-3 py-2 ${errors.buildingName ? 'border-destructive' : ''}`}
                      required
                    >
                      <option value="">Select Building</option>
                      <option value="Rustomjee Azziano">Rustomjee Azziano</option>
                      <option value="Rustomjee Aurelia">Rustomjee Aurelia</option>
                      <option value="Rustomjee Accura">Rustomjee Accura</option>
                      <option value="Rustomjee Atelier">Rustomjee Atelier</option>
                    </select>
                    {errors.buildingName && <p className="text-xs text-destructive flex items-center gap-1 mt-1"><XCircle className="h-3 w-3" /> {errors.buildingName}</p>}
                  </div>
                  {/* Wing */}
                  <div className="col-span-1">
                    <Label htmlFor="wing" className="text-sm font-medium">Wing <span className="text-destructive">*</span></Label>
                    <select
                      id="wing"
                      name="wing"
                      value={form.wing}
                      onChange={handleSelectChange}
                      className={`w-full border rounded px-3 py-2 ${errors.wing ? 'border-destructive' : ''}`}
                      required
                    >
                      <option value="">Select Wing</option>
                      <option value="A">A Wing</option>
                      <option value="B">B Wing</option>
                      <option value="C">C Wing</option>
                      <option value="D">D Wing</option>
                      <option value="E">E Wing</option>
                      <option value="F">F Wing</option>
                      <option value="G">G Wing</option>
                      <option value="H">H Wing</option>
                      <option value="I">I Wing</option>
                      <option value="J">J Wing</option>
                      <option value="K">K Wing</option>
                      <option value="L">L Wing</option>
                    </select>
                    {errors.wing && <p className="text-xs text-destructive flex items-center gap-1 mt-1"><XCircle className="h-3 w-3" /> {errors.wing}</p>}
                  </div>
                  {/* Flat No */}
                  <div className="col-span-1">
                    <Label htmlFor="flatNo" className="text-sm font-medium">Flat No <span className="text-destructive">*</span></Label>
                    <Input id="flatNo" name="flatNo" value={form.flatNo} onChange={handleChange} className={errors.flatNo ? 'border-destructive' : ''} placeholder="Enter flat number" />
                    {errors.flatNo && <p className="text-xs text-destructive flex items-center gap-1 mt-1"><XCircle className="h-3 w-3" /> {errors.flatNo}</p>}
                  </div>
                  {/* Date of Birth */}
                  <div className="col-span-1">
                    <Label htmlFor="dob" className="text-sm font-medium">Date of Birth <span className="text-destructive">*</span></Label>
                    <Input id="dob" name="dob" type="date" value={form.dob} onChange={handleChange} className={errors.dob ? 'border-destructive' : ''} placeholder="Select date of birth" />
                    {errors.dob && <p className="text-xs text-destructive flex items-center gap-1 mt-1"><XCircle className="h-3 w-3" /> {errors.dob}</p>}
                  </div>
                  {/* Password */}
                  <div className="col-span-1">
                    <Label htmlFor="password" className="text-sm font-medium">
                      Password <span className="text-destructive">*</span>
                    </Label>
                    <div className="relative">
                      <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        id="password"
                        name="password"
                        type={showPassword ? 'text' : 'password'}
                        value={form.password}
                        onChange={handleChange}
                        className={`pl-10 pr-10 ${errors.password ? 'border-destructive' : ''}`}
                        placeholder="Enter password"
                      />
                      <button
                        type="button"
                        onClick={handlePasswordVisibility}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                      >
                        {showPassword ? (
                          <EyeOff className="h-4 w-4" />
                        ) : (
                          <Eye className="h-4 w-4" />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-xs text-destructive flex items-center gap-1 mt-1">
                        <XCircle className="h-3 w-3" /> {errors.password}
                      </p>
                    )}
                    {form.password && !errors.password && (
                      <div className="mt-2">
                        <div className="flex gap-1 h-1 mt-1">
                          {[...Array(5)].map((_, i) => (
                            <div
                              key={i}
                              className={`flex-1 rounded-full ${
                                i < passwordStrength
                                  ? passwordStrengthColor[passwordStrength - 1]
                                  : 'bg-muted'
                              }`}
                            />
                          ))}
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          Password strength: {passwordStrengthText[passwordStrength - 1]}
                        </p>
                      </div>
                    )}
                  </div>
                  {/* User Roles, Status, Welcome Email */}
                  <div className="col-span-1 flex flex-col gap-2">
                    <div className="space-y-2">
                      <Label className="text-sm font-medium">User Roles</Label>
                      <div className="flex flex-wrap gap-2">
                        {Object.entries(roleDescriptions).map(([role, description]) => (
                          <TooltipProvider key={role}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <button
                                  type="button"
                                  onClick={() => handleRoleChange(role)}
                                  className={`inline-flex items-center px-4 py-2 rounded-full border-2 transition-colors ${
                                    form.roles.includes(role)
                                      ? 'bg-primary border-primary text-primary-foreground'
                                      : 'border-muted-foreground/20 hover:border-primary'
                                  }`}
                                >
                                  {role.charAt(0).toUpperCase() + role.slice(1)}
                                </button>
                              </TooltipTrigger>
                              <TooltipContent>
                                <p>{description}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ))}
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Switch
                          checked={form.status === 'approved'}
                          onCheckedChange={handleStatusToggle}
                        />
                        <span className={`text-xs font-medium ${form.status === 'approved' ? 'text-green-600' : 'text-gray-500'}`}>{form.status === 'approved' ? 'Active' : 'Inactive'}</span>
                      </div>
                      <div className="flex items-center gap-2 mt-2">
                        <Switch
                          id="sendWelcome"
                          checked={form.sendWelcome}
                          onCheckedChange={(checked) => setForm((prev) => ({ ...prev, sendWelcome: checked }))}
                        />
                        <Label htmlFor="sendWelcome" className="text-sm font-medium">Send welcome email</Label>
                      </div>
                    </div>
                  </div>
                  {/* Occupation & Brief Profile */}
                  <div className="col-span-1">
                    <Label htmlFor="occupationProfile" className="text-sm font-medium">Occupation & Brief Profile</Label>
                    <Input id="occupationProfile" name="occupationProfile" value={form.occupationProfile} onChange={handleChange} placeholder="Occupation & profile" />
                  </div>
                  <div className="col-span-1">
                    <Label htmlFor="workplaceAddress" className="text-sm font-medium">Workplace Address</Label>
                    <Input id="workplaceAddress" name="workplaceAddress" value={form.workplaceAddress} onChange={handleChange} placeholder="Workplace address" />
                  </div>
                  {/* Family Members */}
                  <div className="col-span-1">
                    <Label htmlFor="familyCount" className="text-sm font-medium">Family Members (Total)</Label>
                    <Input id="familyCount" name="familyCount" type="number" value={form.familyCount} onChange={handleChange} placeholder="Total family members" />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-sm font-medium">Males (Above 18)</Label>
                    <Input id="maleAbove18" name="maleAbove18" type="number" value={form.maleAbove18} onChange={handleChange} placeholder="Males above 18" />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-sm font-medium">Males (Above 60)</Label>
                    <Input id="maleAbove60" name="maleAbove60" type="number" value={form.maleAbove60} onChange={handleChange} placeholder="Males above 60" />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-sm font-medium">Males (Under 18)</Label>
                    <Input id="maleUnder18" name="maleUnder18" type="number" value={form.maleUnder18} onChange={handleChange} placeholder="Males under 18" />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-sm font-medium">Females (Above 18)</Label>
                    <Input id="femaleAbove18" name="femaleAbove18" type="number" value={form.femaleAbove18} onChange={handleChange} placeholder="Females above 18" />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-sm font-medium">Females (Above 60)</Label>
                    <Input id="femaleAbove60" name="femaleAbove60" type="number" value={form.femaleAbove60} onChange={handleChange} placeholder="Females above 60" />
                  </div>
                  <div className="col-span-1">
                    <Label className="text-sm font-medium">Females (Under 18)</Label>
                    <Input id="femaleUnder18" name="femaleUnder18" type="number" value={form.femaleUnder18} onChange={handleChange} placeholder="Females under 18" />
                  </div>
                </div>
                {/* Bio full width at the bottom */}
                <div className="mt-6">
                  <Label htmlFor="bio" className="text-sm font-medium">Bio</Label>
                  <textarea
                    id="bio"
                    name="bio"
                    value={form.bio}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 min-h-[80px]"
                    placeholder="Enter a short bio (optional)"
                  />
                </div>
                {/* Forum Contribution */}
                <div className="mt-6">
                  <Label htmlFor="forumContribution" className="text-sm font-medium">How I can contribute to this forum</Label>
                  <textarea
                    id="forumContribution"
                    name="forumContribution"
                    value={form.forumContribution}
                    onChange={handleChange}
                    className="w-full border rounded px-3 py-2 min-h-[60px]"
                    placeholder="Describe how you can contribute"
                  />
                </div>
                {/* Form Actions */}
                <div className="flex justify-end gap-4 pt-6 border-t mt-6 sticky bottom-0 bg-white z-10">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleReset}
                    disabled={loading}
                  >
                    Reset Form
                  </Button>
                  <Button type="submit" disabled={loading}>
                    {loading ? 'Adding User...' : 'Add User'}
                  </Button>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </ScrollArea>
  );
};

export default AddUser; 