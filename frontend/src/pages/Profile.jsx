import { useState } from 'react'
import AppLayout from '../components/layout/AppLayout'
import { useAuth } from '../context/AuthContext'
import { useHistory } from '../context/HistoryContext'
import { useLanguage } from '../context/LanguageContext'
import { auth, storage } from '../utils/firebase'
import { updateProfile, updateEmail, updatePassword, sendPasswordResetEmail, EmailAuthProvider, reauthenticateWithCredential } from 'firebase/auth'
import { ref as storageRef, uploadBytes, getDownloadURL } from 'firebase/storage'

const card = { background: '#FFFFFF', border: '1px solid rgba(184,151,58,0.15)', borderRadius: '16px', padding: '1.5rem', boxShadow: '0 2px 12px rgba(100,80,20,0.06)' }
const inputStyle = { width: '100%', padding: '0.6rem 0.9rem', border: '1.5px solid rgba(184,151,58,0.2)', borderRadius: '8px', fontSize: '0.85rem', fontFamily: 'Jost, sans-serif', background: '#FAFAF8', color: '#2A2015', outline: 'none', transition: 'border-color 0.2s' }

function StatusMsg({ msg }) {
  if (!msg) return null
  const isError = msg.type === 'error'
  return (
    <div style={{ marginTop: '0.85rem', padding: '0.7rem 1rem', borderRadius: '8px', background: isError ? 'rgba(192,96,74,0.08)' : 'rgba(90,138,106,0.1)', border: `1px solid ${isError ? 'rgba(192,96,74,0.3)' : 'rgba(90,138,106,0.3)'}`, color: isError ? '#C0604A' : '#3A6A4A', fontSize: '0.82rem' }}>
      {isError ? '⚠️' : '✅'} {msg.text}
    </div>
  )
}

export default function Profile() {
  const { user } = useAuth()
  const { history } = useHistory()
  const { labels } = useLanguage()

  const lbl = { fontSize: '0.68rem', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '0.35rem', display: 'block', color: '#8A8070' }

  const [editingName, setEditingName] = useState(false)
  const [newName, setNewName] = useState(user?.displayName || '')
  const [nameMsg, setNameMsg] = useState(null)
  const [nameSaving, setNameSaving] = useState(false)

  const [editingEmail, setEditingEmail] = useState(false)
  const [newEmail, setNewEmail] = useState(user?.email || '')
  const [emailPass, setEmailPass] = useState('')
  const [emailMsg, setEmailMsg] = useState(null)
  const [emailSaving, setEmailSaving] = useState(false)

  const [showPwSection, setShowPwSection] = useState(false)
  const [currentPw, setCurrentPw] = useState('')
  const [newPw, setNewPw] = useState('')
  const [confirmPw, setConfirmPw] = useState('')
  const [pwMsg, setPwMsg] = useState(null)
  const [pwSaving, setPwSaving] = useState(false)
  const [showDelete, setShowDelete] = useState(false)

  const isGoogle = user?.providerData?.[0]?.providerId === 'google.com'

  // profile picture upload and public id (handle)
  const [uploading, setUploading] = useState(false)
  const [uploadMsg, setUploadMsg] = useState(null)
  const defaultHandle = user?.email ? user.email.split('@')[0] : ''
  const [publicId, setPublicId] = useState(() => {
    try {
      return user?.uid ? (localStorage.getItem(`museai_handle_${user.uid}`) || defaultHandle) : defaultHandle
    } catch (e) { return defaultHandle }
  })
  const [savingHandle, setSavingHandle] = useState(false)

  const handleFileChange = async (file) => {
    if (!file || !user) return
    setUploading(true); setUploadMsg(null)
    try {
      const key = `profilePictures/${user.uid}.jpg`
      const sref = storageRef(storage, key)
      await uploadBytes(sref, file)
      const url = await getDownloadURL(sref)
      await updateProfile(auth.currentUser, { photoURL: url })
      setUploadMsg({ type: 'success', text: 'Profile picture updated.' })
    } catch (e) {
      console.error(e)
      setUploadMsg({ type: 'error', text: e.message || 'Upload failed' })
    }
    setUploading(false)
  }

  const savePublicId = () => {
    if (!user) return
    setSavingHandle(true)
    try {
      localStorage.setItem(`museai_handle_${user.uid}`, publicId)
      setSavingHandle(false)
    } catch (e) {
      console.error(e)
      setSavingHandle(false)
    }
  }

  const saveName = async () => {
    if (!newName.trim()) { setNameMsg({ type: 'error', text: 'Name cannot be empty.' }); return }
    setNameSaving(true); setNameMsg(null)
    try {
      await updateProfile(auth.currentUser, { displayName: newName.trim() })
      setNameMsg({ type: 'success', text: 'Display name updated successfully!' })
      setEditingName(false)
    } catch (e) { setNameMsg({ type: 'error', text: e.message }) }
    setNameSaving(false)
  }

  const saveEmail = async () => {
    if (!newEmail.trim()) { setEmailMsg({ type: 'error', text: 'Email cannot be empty.' }); return }
    if (!emailPass) { setEmailMsg({ type: 'error', text: 'Enter your current password.' }); return }
    setEmailSaving(true); setEmailMsg(null)
    try {
      const cred = EmailAuthProvider.credential(user.email, emailPass)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await updateEmail(auth.currentUser, newEmail.trim())
      setEmailMsg({ type: 'success', text: 'Email updated successfully!' })
      setEditingEmail(false); setEmailPass('')
    } catch (e) {
      const msg = e.code === 'auth/wrong-password' ? 'Incorrect password.' : e.code === 'auth/email-already-in-use' ? 'That email is already in use.' : e.message
      setEmailMsg({ type: 'error', text: msg })
    }
    setEmailSaving(false)
  }

  const savePassword = async () => {
    if (!currentPw) { setPwMsg({ type: 'error', text: 'Enter your current password.' }); return }
    if (newPw.length < 6) { setPwMsg({ type: 'error', text: 'New password must be at least 6 characters.' }); return }
    if (newPw !== confirmPw) { setPwMsg({ type: 'error', text: 'Passwords do not match.' }); return }
    setPwSaving(true); setPwMsg(null)
    try {
      const cred = EmailAuthProvider.credential(user.email, currentPw)
      await reauthenticateWithCredential(auth.currentUser, cred)
      await updatePassword(auth.currentUser, newPw)
      setPwMsg({ type: 'success', text: 'Password changed successfully!' })
      setCurrentPw(''); setNewPw(''); setConfirmPw(''); setShowPwSection(false)
    } catch (e) {
      setPwMsg({ type: 'error', text: e.code === 'auth/wrong-password' ? 'Incorrect current password.' : e.message })
    }
    setPwSaving(false)
  }

  const sendReset = async () => {
    try {
      await sendPasswordResetEmail(auth, user.email)
      setPwMsg({ type: 'success', text: `Reset email sent to ${user.email}. Check your inbox!` })
    } catch (e) { setPwMsg({ type: 'error', text: e.message }) }
  }

  const stats = [
    { label: labels.totalCreated, value: history.length, color: '#B8973A' },
    { label: labels.scripts, value: history.filter(h => h.content_type === 'script').length, color: '#B8973A' },
    { label: labels.visual || 'Visuals', value: history.filter(h => h.content_type === 'visual').length, color: '#4A9B9B' },
    { label: labels.music || 'Music', value: history.filter(h => h.content_type === 'music').length, color: '#8BAF8D' },
    { label: labels.campaigns, value: history.filter(h => h.content_type === 'campaign').length, color: '#7A9EC5' },
  ]

  const btnPrimary = { flex: 1, padding: '0.65rem', background: 'linear-gradient(135deg, #B8973A, #9A7D2A)', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600, fontSize: '0.85rem' }
  const btnSecondary = { flex: 1, padding: '0.65rem', background: '#FAFAF8', color: '#6A5A40', border: '1px solid rgba(184,151,58,0.2)', borderRadius: '8px', cursor: 'pointer', fontSize: '0.85rem' }
  const btnOutline = (color = '#B8973A') => ({ background: `rgba(184,151,58,0.08)`, border: `1px solid rgba(184,151,58,0.25)`, color: '#8A5E10', padding: '0.5rem 1.1rem', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 })

  return (
    <AppLayout>
      <div style={{ animation: 'fadeIn 0.4s ease', maxWidth: '640px' }}>

        <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '2rem', fontWeight: 600, marginBottom: '2rem', color: '#1A1208' }}>
          {labels.yourProfile} <em style={{ color: '#B8973A' }}>{labels.profileTitle}</em>
        </h1>

        {/* Avatar card */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <div style={{ display: 'flex', gap: '1.25rem', alignItems: 'center' }}>
            {user?.photoURL ? (
              <img src={user.photoURL} alt="" style={{ width: '72px', height: '72px', borderRadius: '50%', border: '2.5px solid rgba(184,151,58,0.4)', objectFit: 'cover' }} />
            ) : (
              <div style={{ width: '72px', height: '72px', borderRadius: '50%', background: 'linear-gradient(135deg, rgba(184,151,58,0.2), rgba(184,151,58,0.08))', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.75rem', border: '2.5px solid rgba(184,151,58,0.3)', color: '#B8973A', fontFamily: 'Cormorant Garamond, serif', fontWeight: 600, flexShrink: 0 }}>
                {user?.displayName?.[0] || user?.email?.[0]?.toUpperCase() || '?'}
              </div>
            )}
            <div style={{ flex: 1 }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.5rem', color: '#1A1208', fontWeight: 600 }}>{user?.displayName || 'Anonymous Creator'}</div>
              <div style={{ color: '#8A8070', fontSize: '0.85rem', marginTop: '0.15rem' }}>{user?.email}</div>
              <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.6rem', flexWrap: 'wrap' }}>
                <span style={{ background: 'rgba(184,151,58,0.1)', border: '1px solid rgba(184,151,58,0.25)', color: '#8A5E10', borderRadius: '50px', padding: '0.2rem 0.75rem', fontSize: '0.7rem', fontWeight: 600 }}>✦ {labels.freePlan}</span>
                {isGoogle && <span style={{ background: 'rgba(74,155,155,0.08)', border: '1px solid rgba(74,155,155,0.25)', color: '#3A7A7A', borderRadius: '50px', padding: '0.2rem 0.75rem', fontSize: '0.7rem', fontWeight: 600 }}>🔗 {labels.googleAccount}</span>}
              </div>
            </div>
          </div>
          <div style={{ marginTop: '0.9rem', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
            <label style={{ fontSize: '0.82rem', color: '#8A8070' }}>Profile picture</label>
            <input type="file" accept="image/*" onChange={e => handleFileChange(e.target.files?.[0])} style={{ display: 'inline-block' }} />
            {uploading ? <span style={{ marginLeft: '0.6rem', color: '#8A8070' }}>Uploading…</span> : uploadMsg && <span style={{ marginLeft: '0.6rem', color: uploadMsg.type === 'error' ? '#C0604A' : '#3A6A4A' }}>{uploadMsg.text}</span>}
          </div>
        </div>

        {/* Stats */}
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '0.75rem', marginBottom: '1.25rem' }}>
          {stats.map(({ label, value, color }) => (
            <div key={label} style={{ ...card, textAlign: 'center', padding: '1rem 0.5rem' }}>
              <div style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.75rem', color }}>{value}</div>
              <div style={{ color: '#6A5A40', fontSize: '0.68rem', marginTop: '0.2rem', fontWeight: 500, lineHeight: 1.3 }}>{label}</div>
            </div>
          ))}
        </div>

        {/* Edit Name */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#B8973A', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(184,151,58,0.1)' }}>{labels.editName}</h3>
          {!editingName ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ ...lbl }}>{labels.currentName}</div>
                <div style={{ fontSize: '0.95rem', color: '#2A2015', fontWeight: 500 }}>{user?.displayName || labels.notSet}</div>
              </div>
              <button onClick={() => { setEditingName(true); setNewName(user?.displayName || '') }} style={btnOutline()}>{labels.edit}</button>
            </div>
          ) : (
            <div>
              <label style={lbl}>{labels.currentName}</label>
              <input value={newName} onChange={e => setNewName(e.target.value)} placeholder="Enter your name" style={inputStyle} />
              <div style={{ display: 'flex', gap: '0.75rem', marginTop: '0.85rem' }}>
                <button onClick={saveName} disabled={nameSaving} style={btnPrimary}>{nameSaving ? labels.saving : labels.save}</button>
                <button onClick={() => { setEditingName(false); setNameMsg(null) }} style={btnSecondary}>{labels.cancel}</button>
              </div>
              <StatusMsg msg={nameMsg} />
            </div>
          )}
          {!editingName && nameMsg && <StatusMsg msg={nameMsg} />}
        </div>

        {/* Email */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#B8973A', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(184,151,58,0.1)' }}>{labels.emailAddress}</h3>
          {isGoogle ? (
            <div style={{ padding: '1rem', background: 'rgba(74,155,155,0.06)', border: '1px solid rgba(74,155,155,0.2)', borderRadius: '10px' }}>
              <p style={{ color: '#3A7A7A', fontSize: '0.85rem', margin: 0 }}>{labels.googleEmailNote}</p>
            </div>
          ) : !editingEmail ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={lbl}>{labels.currentEmail}</div>
                <div style={{ fontSize: '0.95rem', color: '#2A2015', fontWeight: 500 }}>{user?.email}</div>
              </div>
              <button onClick={() => { setEditingEmail(true); setNewEmail(user?.email || '') }} style={btnOutline()}>{labels.change}</button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div><label style={lbl}>{labels.newEmailLabel}</label><input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="new@example.com" style={inputStyle} /></div>
              <div><label style={lbl}>{labels.currentPassLabel}</label><input type="password" value={emailPass} onChange={e => setEmailPass(e.target.value)} placeholder="••••••••" style={inputStyle} /></div>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={saveEmail} disabled={emailSaving} style={btnPrimary}>{emailSaving ? labels.updatingEmail : labels.updateEmail}</button>
                <button onClick={() => { setEditingEmail(false); setEmailMsg(null); setEmailPass('') }} style={btnSecondary}>{labels.cancel}</button>
              </div>
              <StatusMsg msg={emailMsg} />
            </div>
          )}
          {!editingEmail && emailMsg && <StatusMsg msg={emailMsg} />}
        </div>

        {/* Password */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#B8973A', marginBottom: '1.25rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(184,151,58,0.1)' }}>{labels.passwordSecurity}</h3>
          {isGoogle ? (
            <div style={{ padding: '1rem', background: 'rgba(74,155,155,0.06)', border: '1px solid rgba(74,155,155,0.2)', borderRadius: '10px' }}>
              <p style={{ color: '#3A7A7A', fontSize: '0.85rem', margin: 0 }}>{labels.googlePassNote}</p>
            </div>
          ) : (
            <>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button onClick={() => { setShowPwSection(!showPwSection); setPwMsg(null) }} style={btnOutline()}>{showPwSection ? labels.cancel : labels.changePassword}</button>
                <button onClick={sendReset} style={{ ...btnOutline(), background: 'rgba(122,158,197,0.08)', border: '1px solid rgba(122,158,197,0.25)', color: '#3A5A8A' }}>{labels.sendResetEmail}</button>
              </div>
              {showPwSection && (
                <div style={{ marginTop: '1.25rem', display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div><label style={lbl}>{labels.currentPass}</label><input type="password" value={currentPw} onChange={e => setCurrentPw(e.target.value)} placeholder="••••••••" style={inputStyle} /></div>
                  <div><label style={lbl}>{labels.newPass}</label><input type="password" value={newPw} onChange={e => setNewPw(e.target.value)} placeholder="••••••••" style={inputStyle} /></div>
                  <div><label style={lbl}>{labels.confirmPass}</label><input type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="••••••••" style={inputStyle} /></div>
                  {newPw.length > 0 && (
                    <div>
                      <div style={{ display: 'flex', gap: '4px', marginBottom: '4px' }}>
                        {[1,2,3,4].map(i => (<div key={i} style={{ flex: 1, height: '3px', borderRadius: '2px', background: newPw.length >= i * 3 ? i <= 1 ? '#C0604A' : i <= 2 ? '#E09A3A' : i <= 3 ? '#B8973A' : '#5A8A6A' : 'rgba(184,151,58,0.15)' }} />))}
                      </div>
                      <span style={{ fontSize: '0.72rem', color: '#8A8070' }}>{newPw.length < 6 ? labels.tooShort : newPw.length < 10 ? labels.fair : newPw.length < 13 ? labels.good : labels.strong}</span>
                    </div>
                  )}
                  <button onClick={savePassword} disabled={pwSaving} style={{ ...btnPrimary, flex: 'none' }}>{pwSaving ? labels.updating : labels.updatePassword}</button>
                </div>
              )}
              <StatusMsg msg={pwMsg} />
            </>
          )}
        </div>

        {/* Account Info */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#5A4A2A', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(184,151,58,0.1)' }}>{labels.accountInfo}</h3>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
            {[
              { label: labels.displayName, value: user?.displayName || labels.notSet },
              { label: labels.email, value: user?.email || labels.notSet },
              { label: labels.userId, value: user?.uid ? user.uid.substring(0, 20) + '...' : labels.notSet },
              { label: labels.signinMethod, value: isGoogle ? labels.google : labels.emailPassword },
              { label: labels.accountCreated, value: user?.metadata?.creationTime ? new Date(user.metadata.creationTime).toLocaleDateString() : labels.unknown },
            ].map(({ label, value }) => (
              <div key={label} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '0.5rem 0', borderBottom: '1px solid rgba(184,151,58,0.1)' }}>
                <span style={{ color: '#8A8070', fontSize: '0.85rem' }}>{label}</span>
                <span style={{ color: '#2A2015', fontSize: '0.85rem', fontWeight: 500 }}>{value}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Public User ID (editable) */}
        <div style={{ ...card, marginBottom: '1.25rem' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#5A4A2A', marginBottom: '0.75rem' }}>Public User ID</h3>
          <p style={{ color: '#8A8070', fontSize: '0.85rem', marginTop: 0 }}>This is your visible handle across MuseAI. Default is the part of your email before the @.</p>
          <div style={{ display: 'flex', gap: '0.6rem', marginTop: '0.85rem', alignItems: 'center' }}>
            <input value={publicId} onChange={e => setPublicId(e.target.value)} style={{ ...inputStyle, flex: 1 }} />
            <button onClick={savePublicId} disabled={savingHandle} style={btnPrimary}>{savingHandle ? 'Saving...' : 'Save'}</button>
          </div>
        </div>

        {/* Danger Zone */}
        <div style={{ ...card, border: '1px solid rgba(192,96,74,0.2)', marginBottom: '2rem' }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: '1.1rem', color: '#C0604A', marginBottom: '1rem', paddingBottom: '0.75rem', borderBottom: '1px solid rgba(192,96,74,0.1)' }}>{labels.dangerZone}</h3>
          {!showDelete ? (
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ fontSize: '0.88rem', color: '#2A2015', fontWeight: 500 }}>{labels.deleteAccount}</div>
                <div style={{ fontSize: '0.78rem', color: '#8A8070', marginTop: '0.2rem' }}>{labels.deleteDesc}</div>
              </div>
              <button onClick={() => setShowDelete(true)} style={{ padding: '0.5rem 1.1rem', background: 'rgba(192,96,74,0.08)', border: '1px solid rgba(192,96,74,0.25)', color: '#C0604A', borderRadius: '8px', cursor: 'pointer', fontSize: '0.82rem', fontWeight: 600 }}>{labels.delete}</button>
            </div>
          ) : (
            <div style={{ padding: '1rem', background: 'rgba(192,96,74,0.06)', border: '1px solid rgba(192,96,74,0.2)', borderRadius: '10px' }}>
              <p style={{ color: '#C0604A', fontSize: '0.88rem', marginBottom: '1rem', fontWeight: 500 }}>{labels.deleteWarning}</p>
              <div style={{ display: 'flex', gap: '0.75rem' }}>
                <button onClick={() => auth.currentUser?.delete().catch(e => alert(e.message))} style={{ flex: 1, padding: '0.65rem', background: '#C0604A', color: '#fff', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 700, fontSize: '0.85rem' }}>{labels.confirmDelete}</button>
                <button onClick={() => setShowDelete(false)} style={btnSecondary}>{labels.cancel}</button>
              </div>
            </div>
          )}
        </div>

      </div>
    </AppLayout>
  )
}