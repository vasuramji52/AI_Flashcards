'use client'

import { db } from '@/firebase'
import {
  Container,
  TextField,
  Button,
  Typography,
  Box,
  Paper,
  Card,
  CardActionArea,
  CardContent,
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogContentText,
  DialogActions,
} from '@mui/material'
import { writeBatch } from 'firebase/firestore'
import { useUser } from '@clerk/nextjs'
import { useRouter } from 'next/navigation'
import { useState } from 'react'
import { doc, getDoc, collection, setDoc } from 'firebase/firestore'
import { SignedIn, SignedOut } from '@clerk/nextjs'

export default function Generate() {
    const {isLoaded, isSignedIn, user} = useUser()
    const [text, setText] = useState('')
    const [name, setName] = useState('')
    const [dialogOpen, setDialogOpen] = useState(false)
    const [flashcards, setFlashcards] = useState([])
    const [flipped, setFlipped] = useState([])
    const router = useRouter()

    const handleSubmit = async () => {
        if (!text.trim()) {
            alert('Please enter some text to generate flashcards.')
            return
        }
        
        try {
            const response = await fetch('/api/generate', {
            method: 'POST',
            body: text,
            })
        
            if (!response.ok) {
              throw new Error('Failed to generate flashcards')
            }
        
            const data = await response.json()
            setFlashcards(data)
        } catch (error) {
            console.error('Error generating flashcards:', error)
            alert('An error occurred while generating flashcards. Please try again.')
        }
    }

    const handleCardClick = (id) => {
        setFlipped((prev) => ({
            ...prev,
            [id]: !prev[id],
        }))
    }

    const handleOpen = () => {
        setDialogOpen(true)
    }

    const handleClose = () => {
        setDialogOpen(false)
    }

    const saveFlashcards = async () => {
        if(!name) {
            alert('Please enter a name for your flashcard set.')
            return
        }

        const batch = writeBatch(db)
        const userDocRef = doc(collection(db, 'users'), user.id)
        const docSnap = await getDoc(userDocRef)

        if(docSnap.exists()) {
            const collections = docSnap.data().flashcards || []
            if(collections.find((f) => f.name === name)) {
                alert('Flashcard collection with the same name already exists.')
                return
            }

            else {
                collections.push({name})
                batch.set(userDocRef, {flashcards: collections}, {merge: true})
            }
        }

        else {
            batch.set(userDocRef, {flashcards: [{name}]})
        }

        const colRef = collection(userDocRef, name)
        flashcards.forEach((flashcards) => {
            const cardDocRef = doc(colRef )
            batch.set(cardDocRef, flashcards)
        })

        await batch.commit()
        handleClose()
        router.push('/flashcards')
    }

  return (
    <Container maxWidth="md">
        <Box sx={{ 
            mt: 4,
            mb: 6,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center' 
            }}>

            <Typography variant="h4" component="h1" gutterBottom>
            Generate Flashcards
            </Typography>
            <Paper sx = {{p: 4, width: '100%'}}>
                <TextField
                value={text}
                onChange={(e) => setText(e.target.value)}
                label="Enter text"
                fullWidth
                multiline
                rows={4}
                variant="outlined"
                sx={{ mb: 2 }}
                />
            </Paper>
            
            <Button
            variant="contained"
            color="primary"
            onClick={handleSubmit}
            fullWidth
            >
            Generate Flashcards
            </Button>
        </Box>
      
        {flashcards.length > 0 && (
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', mb: 2 }}>
                <Typography variant = "h5" sx = {{flexGrow: 1}}>Flashcards Preview</Typography>
                <SignedIn>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick={handleOpen}
                        sx={{ ml: 2, padding: '4px 8px', minWidth: 'auto' }}
                    >
                        Save Flashcards
                    </Button>
                </SignedIn>
                <SignedOut>
                    <Button
                        variant="contained"
                        color="primary"
                        onClick = {() => router.push('/sign-in')}
                        sx={{ ml: 2, padding: '4px 8px', minWidth: 'auto' }}
                    >
                        Save Flashcards
                    </Button>
                </SignedOut>
            </Box>
        )}

        <Grid container spacing = {3}>
            {flashcards.length > 0 && flashcards.map((flashcards, index) => (
                <Grid item xs = {12} sm = {6} md = {4} key = {index}> 
                    <Card>
                        <CardActionArea
                            onClick = {() => {
                                handleCardClick(index)
                            }}
                        >
                            <CardContent>
                                <Box sx = {{
                                    perspective: '1000px',
                                    '& > div': {
                                        transition: 'transform 0.6s',
                                        transformStyle: 'preserve-3d',
                                        position: 'relative',
                                        width: '100%',
                                        height: '200px',
                                        boxShadow: '0 4px 8px 0 rgba(0, 0, 0, 0.2)',
                                        transform: flipped[index]? 'rotateY(180deg)' : 'rotateY(0deg)',
                                    },

                                    '& > div > div': {
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        backfaceVisibility: 'hidden',
                                        display: 'flex',
                                        justifyContent: 'center',
                                        alignItems: 'center',
                                        padding: 2,
                                        boxSizing: 'borderBox',
                                    },

                                    '& > div > div:nth-of-type(2)': {
                                        transform: 'rotateY(180deg)',
                                    }
                                }}>
                                    <div>
                                        <div>
                                            <Typography variant = "h5" component = "div">
                                                {flashcards.front}
                                            </Typography>
                                        </div>
                                        <div>
                                            <Typography variant = "h5" component = "div">
                                                {flashcards.back}
                                            </Typography>
                                        </div>
                                    </div>
                                </Box>
                            </CardContent>
                        </CardActionArea>
                    </Card>
                </Grid>
            ))}
        </Grid>

        <Dialog open={dialogOpen} onClose={handleClose}>
            <DialogTitle>Save Flashcard Set</DialogTitle>
            <DialogContent>
                <DialogContentText>
                    Please enter a name for your flashcard set.
                </DialogContentText>
                <TextField
                    autoFocus
                    margin="dense"
                    label="Set Name"
                    type="text"
                    fullWidth
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    variant="outlined"
                />
            </DialogContent>
            <DialogActions>
                <Button onClick={handleClose}>Cancel</Button>
                <Button onClick={saveFlashcards} color="primary">
                    Save
                </Button>
            </DialogActions>
        </Dialog>
    </Container>
  )
}