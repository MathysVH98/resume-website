class ViewCounter extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.shadowRoot.innerHTML = `
      <style>
        :host {
          display: block;
        }
        p {
          margin: 0;
          font-size: 12px;
        }
        #count {
          font-weight: bold;
        }
      </style>
      <p>Visitors: <span id="count">...</span></p>
    `;
    this.countElement = this.shadowRoot.querySelector('#count');
  }

  connectedCallback() {
    if (typeof firebase !== 'undefined' && firebase.database) {
      const db = firebase.database();
      const visitorRef = db.ref('visitors');

      visitorRef.transaction((currentCount) => {
        return (currentCount || 0) + 1;
      }, (error, committed, snapshot) => {
        if (error) {
          console.error('Transaction failed: ', error);
          this.countElement.textContent = 'Error';
        } else if (committed) {
          this.countElement.textContent = snapshot.val();
        } else {
            // If transaction is not committed, somebody else is updating the counter.
            // We can just read the value once.
            visitorRef.once('value', (snap) => {
                this.countElement.textContent = snap.val() || '...';
            });
        }
      });
    } else {
        console.warn('Firebase is not available. View counter will not work.');
        this.countElement.textContent = 'N/A';
    }
  }
}

customElements.define('view-counter', ViewCounter);
