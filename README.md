# Pain Locator - Visual Pain Assessment Tool

An interactive 3D web application that helps patients accurately communicate their pain symptoms to healthcare providers through visual pain mapping and AI-generated medical summaries.

## 🎯 Vision

Pain Locator addresses the common challenge of patients struggling to describe pain locations and characteristics effectively. By providing an interactive 3D human body model, users can visually pinpoint pain locations with precision, describe associated details, and receive AI-generated summaries tailored for medical professionals.

### Key Value Proposition

- **Reduce miscommunication** between patients and doctors
- **Speed up consultations** with structured, visual pain data
- **Improve diagnostic accuracy** through precise pain mapping
- **Enhance patient experience** with intuitive, accessible interface

## ✨ Features

### 🎯 Interactive 3D Pain Mapping

- **3D Body Model**: High-fidelity, rotatable human anatomy model
- **Pain Annotation**: Click/tap to place resizable pain markers
- **Multi-axis Interaction**: Support for x, y, z navigation
- **Auto-Detection**: Identifies intersecting body parts and organs
- **Multiple Markers**: Support for up to 10 pain points per session

### 📝 Pain Description System

- **Guided Questions**: Based on standard pain assessments (SOCRATES/OPQRST)
- **Pain Characteristics**: Type, intensity, quality, onset, duration
- **Aggravating/Relieving Factors**: What makes pain worse/better
- **Associated Symptoms**: Nausea, swelling, etc.
- **Accessibility**: Large buttons, voice input options, progress indicators

### 🤖 AI-Generated Summaries

- **Structured Data**: Compiles all inputs into organized format
- **Medical Notes**: Concise, doctor-ready summaries
- **Export Options**: Copy to clipboard, download as text file
- **Privacy-First**: No data storage without consent

### 🎨 User Experience

- **Dead Simple Design**: Minimalist interface with 80% 3D model area
- **Responsive**: Works on desktop and mobile devices
- **Accessibility**: Screen reader support, high-contrast mode
- **Intuitive Flow**: Guided interactions for all tech levels

## 🛠 Technical Stack

- **Frontend**: Next.js 15 with React 19
- **3D Rendering**: React Three Fiber with Three.js
- **Styling**: Tailwind CSS with custom medical theme
- **State Management**: Zustand for pain data
- **UI Components**: Radix UI primitives
- **Icons**: Lucide React
- **TypeScript**: Full type safety

## 🚀 Getting Started

### Prerequisites

- Node.js 18+
- Yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd pain_locator
   ```

2. **Install dependencies**

   ```bash
   yarn install
   ```

3. **Start the development server**

   ```bash
   yarn dev
   ```

4. **Open your browser**
   Navigate to [http://localhost:3000](http://localhost:3000)

### Available Scripts

- `yarn dev` - Start development server
- `yarn build` - Build for production
- `yarn start` - Start production server
- `yarn lint` - Run ESLint
- `yarn type-check` - Run TypeScript type checking

## 📖 Usage Guide

### For Patients

1. **Add Pain Points**

   - Click anywhere on the 3D body model
   - A pain marker will appear at the clicked location
   - The marker color indicates pain intensity (green=mild, red=severe)

2. **Describe Pain**

   - Click on any pain marker to open the description modal
   - Fill out the guided questionnaire
   - Include aggravating/relieving factors and associated symptoms

3. **Review Summary**
   - View the generated medical summary in the right panel
   - Copy or download the summary for your healthcare provider

### For Healthcare Providers

1. **Review Patient Data**

   - Examine the 3D pain map with color-coded markers
   - Read the AI-generated summary
   - Review individual pain point details

2. **Export Information**
   - Copy summary text to clipboard
   - Download detailed report as text file
   - Integrate with existing medical records

## 🏗 Project Structure

```
src/
├── app/                    # Next.js app directory
│   ├── layout.tsx         # Root layout
│   ├── page.tsx           # Main page component
│   └── globals.css        # Global styles
├── components/            # React components
│   ├── BodyModel.tsx      # 3D body model
│   ├── PainMarker.tsx     # Pain point markers
│   ├── PainDescriptionModal.tsx  # Pain input modal
│   ├── SummaryPanel.tsx   # Summary display
│   └── Header.tsx         # App header
├── store/                 # State management
│   └── painStore.ts       # Zustand store
└── types/                 # TypeScript types
    └── pain.ts            # Pain-related types
```

## 🔧 Configuration

### Environment Variables

Create a `.env.local` file for local development:

```env
# Optional: Add API keys for enhanced features
# GROK_API_KEY=your_grok_api_key
# OPENAI_API_KEY=your_openai_api_key
```

### Customization

- **Body Model**: Replace the simple geometry in `BodyModel.tsx` with detailed 3D models
- **Anatomy Detection**: Implement raycasting for precise body part identification
- **AI Integration**: Connect to LLM APIs for enhanced summary generation
- **Styling**: Modify `globals.css` for custom themes

## 🚀 Deployment

### Vercel (Recommended)

1. Connect your repository to Vercel
2. Deploy automatically on push to main branch
3. Configure environment variables in Vercel dashboard

### Other Platforms

- **Netlify**: Build command: `yarn build`, publish directory: `out`
- **Railway**: Deploy directly from GitHub
- **Docker**: Use the provided Dockerfile

## 🔒 Privacy & Security

- **No Data Storage**: Pain data is not stored on servers
- **Client-Side Processing**: All calculations happen in the browser
- **HIPAA Compliance**: Designed with healthcare privacy in mind
- **Optional Features**: Data persistence only with explicit consent

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow TypeScript best practices
- Use conventional commits
- Add tests for new features
- Update documentation as needed

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

- **Documentation**: Check this README and inline code comments
- **Issues**: Report bugs and feature requests via GitHub Issues
- **Discussions**: Join community discussions for questions and ideas

## 🔮 Roadmap

### Version 1.2 (Next Release)

- [ ] Enhanced 3D body models with detailed anatomy
- [ ] Voice input for pain descriptions
- [ ] Multi-language support
- [ ] Mobile-optimized touch interactions

### Version 1.3 (Future)

- [ ] Integration with EHR systems
- [ ] Advanced AI analysis and differentials
- [ ] Pain tracking over time
- [ ] Telemedicine platform integration

### Version 2.0 (Long-term)

- [ ] AR/VR support for immersive pain mapping
- [ ] Machine learning for pain pattern recognition
- [ ] Integration with wearable devices
- [ ] Advanced analytics dashboard

---

**Disclaimer**: This tool is not a medical device and should not replace professional medical advice. Always consult with qualified healthcare providers for diagnosis and treatment.
