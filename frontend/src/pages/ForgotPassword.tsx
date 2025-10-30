import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '@/lib/api';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { toast } from 'sonner';

export default function ForgotPassword() {
  const [step, setStep] = useState<'email' | 'code' | 'reset'>('email');
  const [email, setEmail] = useState('');
  const [resetCode, setResetCode] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSendResetCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email) {
      toast.error('Please enter your email address');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/forgot-password', { email });
      toast.success('Password reset code sent to your email!');
      setStep('code');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to send reset code. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!resetCode) {
      toast.error('Please enter the reset code');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/verify-reset-code', { email, code: resetCode });
      toast.success('Code verified! Please set your new password.');
      setStep('reset');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Invalid or expired reset code');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!newPassword || !confirmPassword) {
      toast.error('Please fill in all fields');
      return;
    }

    if (newPassword.length < 6) {
      toast.error('Password must be at least 6 characters long');
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error('Passwords do not match');
      return;
    }

    setLoading(true);

    try {
      await api.post('/auth/reset-password', {
        email,
        code: resetCode,
        newPassword
      });
      toast.success('Password reset successfully! You can now login with your new password.');
      navigate('/login');
    } catch (error: any) {
      toast.error(error.response?.data?.error || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-6">
          <h1 className="text-3xl font-bold text-gray-900">Gabay Barangay</h1>
          <p className="text-gray-600 mt-2">Barangay Management System</p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="text-center">
              {step === 'email' && 'Forgot Password'}
              {step === 'code' && 'Verify Reset Code'}
              {step === 'reset' && 'Set New Password'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {step === 'email' && (
              <form onSubmit={handleSendResetCode} className="space-y-4">
                <p className="text-sm text-gray-600 text-center mb-4">
                  Enter your email address and we'll send you a code to reset your password.
                </p>

                <div>
                  <label className="text-sm font-medium">Email Address</label>
                  <Input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your.email@example.com"
                    required
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </Button>

                <div className="text-center">
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => navigate('/login')}
                    className="text-sm"
                  >
                    Back to Login
                  </Button>
                </div>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleVerifyCode} className="space-y-4">
                <p className="text-sm text-gray-600 text-center mb-4">
                  We've sent a 6-digit code to <strong>{email}</strong>.
                  Please enter it below.
                </p>

                <div>
                  <label className="text-sm font-medium">Reset Code</label>
                  <Input
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    placeholder="Enter 6-digit code"
                    maxLength={6}
                    required
                    autoFocus
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Verifying...' : 'Verify Code'}
                </Button>

                <div className="text-center space-y-2">
                  <Button
                    type="button"
                    variant="link"
                    onClick={handleSendResetCode}
                    className="text-sm"
                    disabled={loading}
                  >
                    Resend Code
                  </Button>
                  <br />
                  <Button
                    type="button"
                    variant="link"
                    onClick={() => setStep('email')}
                    className="text-sm"
                  >
                    Change Email
                  </Button>
                </div>
              </form>
            )}

            {step === 'reset' && (
              <form onSubmit={handleResetPassword} className="space-y-4">
                <p className="text-sm text-gray-600 text-center mb-4">
                  Create a new password for your account.
                </p>

                <div>
                  <label className="text-sm font-medium">New Password</label>
                  <Input
                    type="password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    placeholder="Enter new password"
                    minLength={6}
                    autoComplete="new-password"
                    required
                    autoFocus
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    Must be at least 6 characters long
                  </p>
                </div>

                <div>
                  <label className="text-sm font-medium">Confirm Password</label>
                  <Input
                    type="password"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    minLength={6}
                    autoComplete="new-password"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  className="w-full"
                  disabled={loading}
                >
                  {loading ? 'Resetting...' : 'Reset Password'}
                </Button>
              </form>
            )}
          </CardContent>
        </Card>

        <p className="text-center text-sm text-gray-600 mt-4">
          Need help? <a href="/contact" className="text-blue-600 hover:underline">Contact Support</a>
        </p>
      </div>
    </div>
  );
}
