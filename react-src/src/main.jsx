import { createRoot } from 'react-dom/client'
import PromptKit from './components/PromptKit.jsx'

const el = document.getElementById('promptkit-root')
if (el) createRoot(el).render(<PromptKit />)
