import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, MessageSquare } from 'lucide-react'
import { signup } from '../api/auth'
import { Input, Label, Button, Checkbox } from '../components/ui'

export default function SignupPage() {
  const navigate = useNavigate()
  const [form, setForm] = useState({ username: '', email: '', password: '' })
  const [terms, setTerms] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [showPass, setShowPass] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    if (!form.username || !form.email || !form.password) { setError('All fields are required.'); return }
    if (!terms) { setError('Please accept the terms to continue.'); return }
    if (form.password.length < 6) { setError('Password must be at least 6 characters.'); return }
    setLoading(true)
    try {
      await signup(form)
      navigate('/login')
    } catch (err) {
      setError(err.response?.data?.detail || 'Something went wrong. Try again.')
    } finally { setLoading(false) }
  }

  return (
    <div className="min-h-screen bg-[#f9f9f9] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">

        <div className="flex flex-col items-center mb-8">
          {/* <div className="w-10 h-10 rounded-xl bg-[#2563eb] flex items-center justify-center mb-4">
            <MessageSquare className="w-5 h-5 text-white" strokeWidth={2.5} />
          </div> */}
          <h1 className="text-xl font-semibold text-[#171717] tracking-tight">Create your account</h1>
          <p className="text-sm text-[#a0a0a0] mt-1">Free to use, forever</p>
        </div>

        <div className="bg-white rounded-2xl border border-[#e8e8e8] p-6 shadow-sm">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <Label htmlFor="username">Username</Label>
              <Input id="username" name="username" placeholder="yourname" value={form.username} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="email">Email</Label>
              <Input id="email" name="email" type="email" placeholder="you@example.com" value={form.email} onChange={handleChange} />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="password">Password</Label>
              <div className="relative">
                <Input id="password" name="password" type={showPass ? 'text' : 'password'}
                  placeholder="Min. 6 characters" value={form.password} onChange={handleChange} className="pr-10" />
                <button type="button" onClick={() => setShowPass(v => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#a0a0a0] hover:text-[#525252]">
                  {showPass ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="flex items-start gap-2.5 pt-1">
              <Checkbox id="terms" checked={terms} onCheckedChange={setTerms} className="mt-0.5" />
              <label htmlFor="terms" className="text-xs text-[#737373] leading-relaxed cursor-pointer">
                I agree to the <span className="text-[#2563eb]">Terms of Service</span> and <span className="text-[#2563eb]">Privacy Policy</span>
              </label>
            </div>

            {error && (
              <p className="text-xs text-[#dc2626] bg-[#fef2f2] border border-[#fecaca] rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading ? 'Creating account…' : 'Create account'}
            </Button>
          </form>
        </div>

        <p className="text-center text-sm text-[#a0a0a0] mt-4">
          Already have an account?{' '}
          <Link to="/login" className="text-[#2563eb] font-medium hover:underline">Sign in</Link>
        </p>
      </div>
    </div>
  )
}
