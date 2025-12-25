import '@fontsource/roboto/300.css'
import '@fontsource/roboto/400.css'
import '@fontsource/roboto/500.css'
import '@fontsource/roboto/700.css'
import { useState, useEffect } from 'react'
import Container from '@mui/material/Container'
import TextField from '@mui/material/TextField'
import Button from '@mui/material/Button'
import Typography from '@mui/material/Typography'
import Box from '@mui/material/Box'
import SaveIcon from '@mui/icons-material/Save'
import BlockIcon from '@mui/icons-material/Block'
import LinkIcon from '@mui/icons-material/Link'
import './App.css'

import {updateRules} from '../../common/common'

function App() {
  const [sites, setSites] = useState('')
  const [redirectUrl, setRedirectUrl] = useState('')
  const [saveSuccess, setSaveSuccess] = useState(false)

  useEffect(() => {
    chrome.storage.sync.get('prohibitedSites', function(data) {
      setSites(data.prohibitedSites || '')
    });
    chrome.storage.sync.get('redirectUrl', function(data) {
      setRedirectUrl(data.redirectUrl || '')
    });
  }, [])

  const onChange = e => {
    setSites(e.target.value)
    setSaveSuccess(false)
  }

  const onChangeUrl = e => {
    setRedirectUrl(e.target.value)
    setSaveSuccess(false)
  }

  const onSave = () => {
    chrome.storage.sync.set({prohibitedSites: sites, redirectUrl: redirectUrl}, function() {
      updateRules()
      setSaveSuccess(true)
      setTimeout(() => setSaveSuccess(false), 3000)
    })
  }

  return (
    <Container sx={{ py: 4, textAlign: 'center', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
      <Typography variant="h4" component="h1" gutterBottom sx={{ mb: 3, display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 1 }}>
        <BlockIcon color="primary" />
        Blocked Sites Settings
      </Typography>

      <Box sx={{ mb: 3, textAlign: 'left' }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <BlockIcon fontSize="small" />
          Prohibited Sites
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          Enter one domain per line (e.g., facebook.com, twitter.com)
        </Typography>
        <TextField
          id="prohibitedSites"
          multiline
          rows={12}
          fullWidth
          value={sites}
          onChange={onChange}
          placeholder="facebook.com&#10;twitter.com&#10;instagram.com"
          variant="outlined"
          sx={{ fontFamily: 'monospace' }}
        />
      </Box>

      <Box sx={{ mb: 4, textAlign: 'left' }}>
        <Typography variant="subtitle1" gutterBottom sx={{ mb: 1, display: 'flex', alignItems: 'center', gap: 1 }}>
          <LinkIcon fontSize="small" />
          Redirect URL
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
          URL to redirect to when a blocked site is accessed
        </Typography>
        <TextField
          id="redirectUrl"
          fullWidth
          value={redirectUrl}
          onChange={onChangeUrl}
          placeholder="https://example.com or chrome://newtab"
          variant="outlined"
        />
      </Box>

      <Box sx={{ display: 'flex', justifyContent: 'center', gap: 2, alignItems: 'center' }}>
        {saveSuccess && (
          <Typography variant="body2" color="success.main">
            Settings saved successfully!
          </Typography>
        )}
        <Button
          variant="contained"
          startIcon={<SaveIcon />}
          onClick={onSave}
          size="large"
          color="primary"
        >
          Save Settings
        </Button>
      </Box>
    </Container>
  )
}

export default App
