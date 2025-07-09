# Back-on-Track Brand Guidelines for Pajama Party Platform

## Brand Identity

### Core Values
- **Dreamy & Inspirational**: "Where would you like to wake up tomorrow?"
- **Accessible & Inclusive**: Breaking beyond rail enthusiast bubble
- **Community-Focused**: Building connections between like-minded travelers
- **Action-Oriented**: Dreams translate to collective advocacy

### Brand Personality
- **Romantic**: Travel as adventure and discovery
- **Optimistic**: Sustainable travel is possible and desirable
- **Collaborative**: Together we can make change happen
- **Playful**: Pajama parties are fun, not just protest

## Visual Identity

### Color Palette (from https://back-on-track.eu/graphics/)
- **Primary Green**: #008f39 (main brand color)
- **Secondary Green**: #92d051 (accent, highlights)
- **Dark Blue**: #2271b3 (secondary brand color)
- **Light Background**: #f1f3f6 (page background)
- **White**: #ffffff (content backgrounds)
- **Dark Text**: #333333 (primary text)

### Typography
- **Primary Font**: Mark Pro (Regular and Bold)
- **Fallback Fonts**: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif
- **Headings**: Mark Pro Bold, uppercase for emphasis
- **Body Text**: Mark Pro Regular, readable sizes (16px base)

### Logo Usage
- **Back-on-Track Logo**: Circular design with star motif
- **Placement**: Footer or header, not competing with main CTA
- **Versions**: Light/dark background variants available
- **Size**: Maintain readability, not dominating the page

## Content Guidelines

### Tone of Voice
- **Conversational**: "Where would you like to wake up tomorrow?" not "Submit your destination preference"
- **Encouraging**: "Join fellow travelers" not "Register for advocacy"
- **Inclusive**: "All Europeans welcome" not "Night train enthusiasts only"
- **Clear**: Simple language, avoid jargon

### Messaging Hierarchy
1. **Primary**: Dream destination aspiration
2. **Secondary**: Community building opportunity
3. **Tertiary**: Back-on-Track mission and advocacy

### Key Messages
- **Hook**: "Where would you like to wake up tomorrow?"
- **Community**: "2 people from your station want to organize a pajama party"
- **Action**: "Join our Discord to connect with fellow travelers"
- **Mission**: "Discover the night train network Europe deserves"

## Design Principles

### Visual Design
- **Clean & Minimalist**: Plenty of white space, uncluttered layouts
- **Mobile-First**: Responsive design for station-based usage
- **Map-Centric**: European map as primary visual element
- **Accessible**: High contrast, readable fonts, clear navigation

### User Experience
- **Immediate Engagement**: Hook question visible on landing
- **Progressive Disclosure**: Reveal information as user engages
- **Low Friction**: Minimal form fields, easy completion
- **Visual Feedback**: Clear confirmation of actions taken

### Interactive Elements
- **Buttons**: Primary green (#008f39), white text, rounded corners
- **Forms**: Clean inputs, green focus states, clear labels
- **Map**: Interactive pins, hover states, clustering for readability
- **Links**: Underlined, blue (#2271b3), clear destinations

## Platform-Specific Applications

### Landing Page
- **Hero Section**: Large, inspiring image of European landscape
- **Primary CTA**: "Where would you like to wake up tomorrow?" in Mark Pro Bold
- **Map Preview**: European map with sample destination pins
- **Brand Integration**: Subtle BoT logo in footer

### Form Design
- **Station Input**: Auto-complete with European flag icons
- **Destination Input**: Dreamy placeholder text ("Barcelona beach sunrise...")
- **Submit Button**: Primary green, "Add my dream to the map"
- **Privacy Note**: Clear, reassuring language about data use

### Map Visualization
- **Color Coding**: Origin stations (dark blue), destinations (primary green)
- **Pin Design**: Consistent with BoT aesthetic, readable at all zoom levels
- **Clustering**: Grouped pins for popular destinations
- **Interaction**: Hover reveals station names and connection count

### Community Features
- **Discord Integration**: Consistent branding with BoT colors
- **Pajama Party Kit**: Playful icons, clear download links
- **Statistics**: "X dreamers from your station" in encouraging language
- **Call-to-Action**: Green buttons for community joining

## Asset Resources

### Images
- **Hero Imagery**: European landscapes, train stations, sunrise/sunset
- **Icons**: Train, bed, map pin, community, heart
- **Illustrations**: Simple line drawings in brand colors
- **Photography**: Authentic, not stock-looking, diverse people

### Graphics from BoT
- **Logo Files**: Available at https://back-on-track.eu/graphics/
- **Brand Colors**: Hex codes documented above
- **Font Files**: Mark Pro weights and styles
- **Icon Set**: Transportation and advocacy themed

### Custom Assets Needed
- **Map Pins**: Custom design in brand colors
- **Station Icons**: European rail station illustrations
- **Community Avatars**: Diverse, welcoming character designs
- **Pajama Party Graphics**: Playful, activism-themed illustrations

## Implementation Guidelines

### CSS Structure
```css
:root {
  --primary-green: #008f39;
  --secondary-green: #92d051;
  --dark-blue: #2271b3;
  --light-bg: #f1f3f6;
  --white: #ffffff;
  --dark-text: #333333;
}

.primary-button {
  background: var(--primary-green);
  color: white;
  font-family: 'Mark Pro', sans-serif;
  font-weight: bold;
  border-radius: 8px;
  padding: 12px 24px;
}
```

### Responsive Breakpoints
- **Mobile**: 320px - 768px (primary target)
- **Tablet**: 768px - 1024px (secondary)
- **Desktop**: 1024px+ (tertiary)

### Accessibility
- **Color Contrast**: WCAG AA compliance minimum
- **Font Sizes**: 16px base, scalable with user preferences
- **Alt Text**: All images have descriptive alternatives
- **Keyboard Navigation**: Full functionality without mouse

## Brand Consistency Checklist

### Before Launch
- [ ] All colors match BoT brand palette
- [ ] Typography uses Mark Pro or approved fallbacks
- [ ] Logo placement and sizing appropriate
- [ ] Tone of voice consistent throughout
- [ ] Mobile responsiveness tested
- [ ] Accessibility standards met

### Content Review
- [ ] Primary message clear and engaging
- [ ] Back-on-Track mission appropriately integrated
- [ ] Community building emphasized
- [ ] Privacy considerations clearly communicated
- [ ] Call-to-actions use encouraging language

### Visual Review
- [ ] Clean, uncluttered design
- [ ] Map visualization professional and engaging
- [ ] Form design inviting and simple
- [ ] Button styles consistent with brand
- [ ] Loading states and transitions smooth

## Usage Examples

### Good Examples
- "Where would you like to wake up tomorrow?" (engaging, aspirational)
- "2 fellow travelers from Amsterdam are planning a pajama party" (community-focused)
- "Add your dream to the map" (action-oriented, positive)
- "Join our Discord to connect with sustainable travel advocates" (clear value)

### Avoid These
- "Submit your travel data for advocacy purposes" (bureaucratic)
- "Register for Back-on-Track database" (institutional)
- "Demand night train connections" (aggressive)
- "Fill out this form" (transactional)

---

**These guidelines ensure the pajama party platform maintains Back-on-Track's professional credibility while attracting mainstream European travelers through approachable, inspiring design and messaging.**