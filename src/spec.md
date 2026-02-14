# AI Text Humanizer

## Overview
A web application that transforms AI-generated text into more natural, human-like writing while preserving the original meaning and content. Additionally provides AI text detection capabilities to evaluate whether text appears AI-generated or human-written.

## Core Features

### Text Input
- Large text input area where users can paste AI-generated text
- Support for multi-paragraph text input
- Clear placeholder text indicating the purpose

### AI Text Detection
- "Detect AI" button positioned above the text input area
- Integration with external AI detection service to analyze text authenticity
- Detection result display showing likelihood of AI generation (e.g., "This text seems 85% AI-generated")
- Results displayed in a subtle card or label above or below the text input
- Loading state during detection processing
- Robust error handling with descriptive error messages for detection failures

### Text Processing
- "Humanize" button that triggers the text transformation
- Integration with AI service to rewrite text in a more natural, human tone
- Processing should maintain the original meaning while improving naturalness
- Loading state during processing

### Results Display
- Dedicated results area showing the humanized text
- Clear visual separation between input and output
- Formatted display that preserves paragraph structure

### Copy Functionality
- One-click copy button for the rewritten text
- Visual feedback when text is copied successfully

## Technical Requirements

### Frontend
- Responsive design working on desktop and mobile
- Real-time character count for input text
- Enhanced error handling for failed processing and detection requests with user-friendly messages
- Clean, minimal interface focused on the core functionality
- Detection feedback section styled to match existing design system and color palette
- Display specific error messages for detection failures (e.g., "Detection service unavailable", "Invalid text input")

### Backend
- HTTP endpoint to process text humanization requests
- HTTP endpoint for AI text detection that calls external detection API
- Integration with external AI service for text rewriting
- Improved integration with external AI detection service via HTTP POST with proper response parsing
- Enhanced `detectAIText` function that safely handles JSON parsing and malformed responses
- Reliable decoding of `OutCall.httpPostRequest` return values to text format
- Safe handling of external API response structure including missing or malformed JSON
- Comprehensive error handling for API failures with descriptive error messages
- Detection function returns JSON response with AI probability or human-like score
- No data persistence required - all operations are stateless

## User Flow
1. User pastes text into input area
2. User can optionally click "Detect AI" to check if text appears AI-generated
3. System processes detection request with proper error handling and displays results or error messages
4. User clicks "Humanize" button to transform text
5. System processes text and displays humanized version
6. User can copy the result with one click
