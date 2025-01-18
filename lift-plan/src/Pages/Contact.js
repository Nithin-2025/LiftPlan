import React from 'react';

const Contact = () => {
  return (
    <div>
      <h1>Contact Us</h1>
      <p>If you have any questions, feel free to reach out to us.</p>
      <form>
        <label>Name:</label>
        <input type="text" placeholder="Your name" />
        <label>Email:</label>
        <input type="email" placeholder="Your email" />
        <label>Message:</label>
        <textarea placeholder="Your message"></textarea>
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Contact;
