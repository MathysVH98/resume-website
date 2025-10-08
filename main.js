
document.addEventListener('DOMContentLoaded', () => {
    // Smooth scrolling for navigation links
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            // Check if the link is just a hash for smooth scrolling
            if (this.getAttribute('href').startsWith('#') && this.getAttribute('href').length > 1) {
                e.preventDefault();
                const target = document.querySelector(this.getAttribute('href'));
                if (target) {
                    target.scrollIntoView({
                        behavior: 'smooth'
                    });
                }
            }
            // For other links, like file links with target="_blank", the default action will proceed
        });
    });

    // Animate sections on scroll
    const sections = document.querySelectorAll('section');
    const sectionObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('is-visible');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    sections.forEach(section => {
        sectionObserver.observe(section);
    });

    // Animate progress bars on scroll
    const skillsSection = document.querySelector('#skills');
    const progressBars = document.querySelectorAll('.progress-bar');
    let skillsAnimated = false;

    const skillsObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting && !skillsAnimated) {
                progressBars.forEach(bar => {
                    const progress = bar.getAttribute('data-progress');
                    const progressBarFill = document.createElement('div');
                    progressBarFill.classList.add('progress-bar-fill');
                    progressBarFill.style.width = '0%';
                    
                    const progressSpan = document.createElement('span');
                    progressSpan.textContent = progress + '%';
                    progressBarFill.appendChild(progressSpan);
                    bar.appendChild(progressBarFill);

                    setTimeout(() => {
                        progressBarFill.style.width = progress + '%';
                    }, 100); 
                });
                skillsAnimated = true; // Ensure animation only runs once
            }
        });
    }, { threshold: 0.5 });

    if (skillsSection) {
        skillsObserver.observe(skillsSection);
    }

    // Back to top button
    const backToTopButton = document.querySelector('.back-to-top');
    window.addEventListener('scroll', () => {
        if (window.scrollY > 300) {
            backToTopButton.classList.add('is-visible');
        } else {
            backToTopButton.classList.remove('is-visible');
        }
    });
});