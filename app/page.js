'use client'

import React from 'react'
import { Container, Box, Typography, AppBar, Toolbar, Button, Grid } from '@mui/material'
import Head from 'next/head';
import getStripe from "@/utils/get-stripe";
import { SignedIn, SignedOut, UserButton } from "@clerk/nextjs";
import {useRouter} from 'next/navigation';

export default function Home() {
  const router = useRouter()

  const handleSubmit = async (subscriptionName) => {
    const checkoutSession = await fetch('/api/checkout_sessions', {
      method: 'POST',
      headers: { origin: 'http://localhost:3000' },
      body: JSON.stringify({ subscriptionName }),
    })
    const checkoutSessionJson = await checkoutSession.json()
  
    const stripe = await getStripe()
    const {error} = await stripe.redirectToCheckout({
      sessionId: checkoutSessionJson.id,
    })
  
    if (error) {
      console.warn(error.message)
    }
  }

  return (
    <Container maxWidth = "100vw">
      <Head>
        <title>Flashcard Wizard</title>
        <meta name = "description" content = "Create flashcards from your text" />
      </Head>

      <AppBar position="static">
        <Toolbar>
          <Typography variant="h6" style={{flexGrow: 1}}>
            Flashcard Wizard
          </Typography>
          <SignedOut>
            <Button color="inherit" href="/sign-in">Login</Button>
            <Button color="inherit" href="/sign-up">Sign Up</Button>
          </SignedOut>
          <SignedIn>
            <UserButton />
          </SignedIn>
        </Toolbar>
      </AppBar>

      <Box sx={{textAlign: 'center', my: 4}}>
        <Typography variant="h2" component="h1" gutterBottom>
          Welcome to Flashcard Wizard!
        </Typography>
        <Typography variant="h5" component="h2" gutterBottom>
          The most efficient way to create flashcards.
        </Typography>
        <Button variant="contained" color="primary" sx={{mt: 2, mr: 2}} href="/generate">
          Get Started
        </Button>
        <SignedIn>
          <Button variant="contained" color="primary" sx={{mt: 2, mr: 2}} href="/flashcards">
            View Flashcards
          </Button>
        </SignedIn>
        <SignedOut>
          <Button variant="contained" color="primary" sx={{mt: 2, mr: 2}} onClick={() => router.push('/sign-in')}>
            View Flashcards
          </Button>
        </SignedOut>
      </Box>

      <Box container spacing = {4} sx={{my: 6}}>
        <Typography variant="h4" component="h2" gutterBottom>Features</Typography>
        <Grid container spacing={4}>
          <Grid item xs = {12} md = {4}>
            <Typography variant = "h6" gutterBottom>Easy Text Input</Typography>
            <Typography gutterBottom>
              {' '}
              Simply input your text and let our software do the rest. Creating flashcards has never been smoother.
            </Typography>
          </Grid>
          <Grid item xs = {12} md = {4}>
            <Typography variant = "h6" gutterBottom>Smart Flashcards</Typography>
            <Typography gutterBottom>
              {' '}
              Our AI intelligently breaks down your text into comprehensible flashcards, perfect for studying at your leisure. 
            </Typography>
          </Grid>
          <Grid item xs = {12} md = {4}>
            <Typography variant = "h6" gutterBottom>Accessible Anywhere</Typography>
            <Typography gutterBottom>
              {' '}
              Access your flashcards from any device, at any time. Study on the go with ease. 
            </Typography>
          </Grid>
        </Grid>
      </Box>

      <Box sx={{my: 6, textAlign: 'center'}}>
        <Typography variant="h4" component="h2" gutterBottom>Pricing</Typography>
        <Grid container spacing={4} justifyContent="center">
          <Grid item xs = {12} md = {6}>
            <Box xs = {{
              p: 3,
              border: '1px solid',
              borderColor: 'grey.300',
              borderRadius: 2,
            }}>
              <Typography variant = "h5" gutterBottom >Basic</Typography>
              <Typography variant = "h6" gutterBottom>$5 / month</Typography>
              <Typography gutterBottom>
                {' '}
                Access to basic flashcard features and limited storage.
              </Typography>
              <SignedIn>
                <Button variant = "contained" color = "primary" sx = {{mt: 2}} onClick={() => handleSubmit('Basic')}>Choose Basic</Button>
              </SignedIn>
              <SignedOut>
                <Button variant = "contained" color = "primary" sx = {{mt: 2}} onClick={() => router.push('/sign-in')}>Sign in to Choose Basic</Button>
              </SignedOut>
            </Box>
          </Grid>
          <Grid item xs = {12} md = {6}>
            <Typography variant = "h5" gutterBottom>Pro</Typography>
            <Typography variant = "h6" gutterBottom>$10 / month</Typography>
            <Typography gutterBottom>
              {' '}
              Unlimited flashcards and storage, with priority support.
            </Typography>
            <SignedIn>
              <Button variant = "contained" color = "primary" sx = {{mt: 2}} onClick={() => handleSubmit('Pro')}>Choose Pro</Button>
            </SignedIn>
            <SignedOut>
              <Button variant = "contained" color = "primary" sx = {{mt: 2}} onClick={() => router.push('/sign-in')}>Sign in to Choose Pro</Button>
            </SignedOut>
          </Grid>
        </Grid>
      </Box>
    </Container>
  )
}
