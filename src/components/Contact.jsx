import { motion } from 'framer-motion';
import { Mail, MapPin, Send } from 'lucide-react';
import './Contact.css';

export default function Contact() {
  return (
    <section id="contact" className="section contact-section">
      <div className="container">
        <motion.div 
          initial={{ opacity: 0, y: 50 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="section-header"
        >
          <h2 className="section-title">Get In <span className="text-gradient">Touch</span></h2>
          <p className="section-subtitle">Let's build something beautiful together</p>
        </motion.div>

        <div className="contact-container glass">
          <motion.div 
            className="contact-info"
            initial={{ opacity: 0, x: -30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h3>Contact Information</h3>
            <p className="contact-desc">
              Whether you have a question, a project proposal, or just want to say hi, 
              I'll try my best to get back to you!
            </p>
            
            <div className="info-items">
              <div className="info-item">
                <div className="info-icon"><Mail size={20} /></div>
                <div className="info-text">
                  <h4>Email</h4>
                  <p>hello@portfolio.com</p>
                </div>
              </div>
              <div className="info-item">
                <div className="info-icon"><MapPin size={20} /></div>
                <div className="info-text">
                  <h4>Location</h4>
                  <p>San Francisco, CA</p>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.form 
            className="contact-form"
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.5, delay: 0.4 }}
            onSubmit={(e) => e.preventDefault()}
          >
            <div className="form-group">
              <label htmlFor="name">Name</label>
              <input type="text" id="name" placeholder="John Doe" className="form-input" />
            </div>
            
            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input type="email" id="email" placeholder="john@example.com" className="form-input" />
            </div>
            
            <div className="form-group">
              <label htmlFor="message">Message</label>
              <textarea id="message" rows="4" placeholder="How can I help you?" className="form-input"></textarea>
            </div>
            
            <button type="submit" className="btn btn-primary submit-btn">
              Send Message <Send size={18} />
            </button>
          </motion.form>
        </div>
      </div>
    </section>
  );
}
