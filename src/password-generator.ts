interface PasswordOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
}

class PasswordGenerator {
    private charset = {
        uppercase: 'ABCDEFGHIJKLMNOPQRSTUVWXYZ',
        lowercase: 'abcdefghijklmnopqrstuvwxyz',
        numbers: '0123456789',
        symbols: '!@#$%^&*()_+-=[]{}|;:,.<>?'
    };

    constructor() {
        this.initializeElements();
        this.attachEventListeners();
        this.updateLengthDisplay();
        this.updateStrength();
    }

    private elements = {
        passwordOutput: null as HTMLInputElement | null,
        lengthRange: null as HTMLInputElement | null,
        lengthValue: null as HTMLSpanElement | null,
        uppercase: null as HTMLInputElement | null,
        lowercase: null as HTMLInputElement | null,
        numbers: null as HTMLInputElement | null,
        symbols: null as HTMLInputElement | null,
        generateBtn: null as HTMLButtonElement | null,
        copyBtn: null as HTMLButtonElement | null,
        strengthBars: null as NodeListOf<HTMLDivElement> | null,
        strengthText: null as HTMLSpanElement | null,
        toast: null as HTMLDivElement | null
    };

    private initializeElements(): void {
        this.elements.passwordOutput = document.getElementById('passwordOutput') as HTMLInputElement;
        this.elements.lengthRange = document.getElementById('lengthRange') as HTMLInputElement;
        this.elements.lengthValue = document.getElementById('lengthValue') as HTMLSpanElement;
        this.elements.uppercase = document.getElementById('uppercase') as HTMLInputElement;
        this.elements.lowercase = document.getElementById('lowercase') as HTMLInputElement;
        this.elements.numbers = document.getElementById('numbers') as HTMLInputElement;
        this.elements.symbols = document.getElementById('symbols') as HTMLInputElement;
        this.elements.generateBtn = document.getElementById('generateBtn') as HTMLButtonElement;
        this.elements.copyBtn = document.getElementById('copyBtn') as HTMLButtonElement;
        this.elements.strengthBars = document.querySelectorAll('.bar') as NodeListOf<HTMLDivElement>;
        this.elements.strengthText = document.getElementById('strengthText') as HTMLSpanElement;
        this.elements.toast = document.getElementById('toast') as HTMLDivElement;
    }

    private attachEventListeners(): void {
        this.elements.lengthRange?.addEventListener('input', () => this.updateLengthDisplay());
        this.elements.lengthRange?.addEventListener('input', () => this.updateStrength());
        
        [this.elements.uppercase, this.elements.lowercase, this.elements.numbers, this.elements.symbols].forEach(checkbox => {
            checkbox?.addEventListener('change', () => this.updateStrength());
        });

        this.elements.generateBtn?.addEventListener('click', () => this.generatePassword());
        this.elements.copyBtn?.addEventListener('click', () => this.copyToClipboard());
    }

    private updateLengthDisplay(): void {
        if (this.elements.lengthRange && this.elements.lengthValue) {
            this.elements.lengthValue.textContent = this.elements.lengthRange.value;
        }
    }

    private getPasswordOptions(): PasswordOptions {
        return {
            length: parseInt(this.elements.lengthRange?.value || '16'),
            uppercase: this.elements.uppercase?.checked || false,
            lowercase: this.elements.lowercase?.checked || false,
            numbers: this.elements.numbers?.checked || false,
            symbols: this.elements.symbols?.checked || false
        };
    }

    private generatePassword(): void {
        const options = this.getPasswordOptions();
        const password = this.createPassword(options);
        
        if (this.elements.passwordOutput) {
            this.elements.passwordOutput.value = password;
            this.animatePasswordOutput();
        }
        
        this.updateStrength();
    }

    private createPassword(options: PasswordOptions): string {
        let charset = '';
        if (options.uppercase) charset += this.charset.uppercase;
        if (options.lowercase) charset += this.charset.lowercase;
        if (options.numbers) charset += this.charset.numbers;
        if (options.symbols) charset += this.charset.symbols;

        if (!charset) {
            this.showToast('Please select at least one character type!', 'error');
            return '';
        }

        // Ensure at least one of each selected character type
        let password = '';
        if (options.uppercase) password += this.getRandomChar(this.charset.uppercase);
        if (options.lowercase) password += this.getRandomChar(this.charset.lowercase);
        if (options.numbers) password += this.getRandomChar(this.charset.numbers);
        if (options.symbols) password += this.getRandomChar(this.charset.symbols);

        // Fill the rest randomly
        for (let i = password.length; i < options.length; i++) {
            password += this.getRandomChar(charset);
        }

        // Shuffle the password
        return this.shuffleString(password);
    }

    private getRandomChar(charset: string): string {
        const randomIndex = crypto.getRandomValues(new Uint32Array(1))[0] % charset.length;
        return charset[randomIndex];
    }

    private shuffleString(str: string): string {
        const array = str.split('');
        for (let i = array.length - 1; i > 0; i--) {
            const j = crypto.getRandomValues(new Uint32Array(1))[0] % (i + 1);
            [array[i], array[j]] = [array[j], array[i]];
        }
        return array.join('');
    }

    // FIXED STRENGTH CALCULATION
    private updateStrength(): void {
        const password = this.elements.passwordOutput?.value || '';
        const options = this.getPasswordOptions();
        
        let strength = 0;

        // Length scoring (more granular for better accuracy)
        if (password.length >= 8) strength++;
        if (password.length >= 12) strength++;
        if (password.length >= 16) strength++;
        if (password.length >= 32) strength++;
        if (password.length >= 64) strength++;

        // Character variety scoring (more points for more types)
        let variety = 0;
        if (options.uppercase) variety++;
        if (options.lowercase) variety++;
        if (options.numbers) variety++;
        if (options.symbols) variety++;
        
        if (variety >= 2) strength++;
        if (variety >= 3) strength++;
        if (variety >= 4) strength++;

        // Determine strength level (0-3)
        // Now requires strength >= 7 for "Strong" (was impossible before)
        let level = 0;
        if (strength >= 7) level = 3;          // Strong
        else if (strength >= 5) level = 2;     // Good
        else if (strength >= 3) level = 1;     // Weak
        else level = 0;                        // Very Weak
        
        // Update UI
        this.elements.strengthBars?.forEach((bar, index) => {
            if (index <= level) {
                bar.classList.add('active');
            } else {
                bar.classList.remove('active');
            }
        });

        // Update text
        const strengthLabels = ['Very Weak', 'Weak', 'Good', 'Strong'];
        if (this.elements.strengthText) {
            this.elements.strengthText.textContent = password ? strengthLabels[level] : '-';
            this.elements.strengthText.style.color = this.getStrengthColor(level);
        }
    }

    private getStrengthColor(level: number): string {
        const colors = ['#ef4444', '#f59e0b', '#f59e0b', '#10b981'];
        return colors[level];
    }

    private async copyToClipboard(): Promise<void> {
        const password = this.elements.passwordOutput?.value;
        
        if (!password) {
            this.showToast('No password to copy!', 'error');
            return;
        }

        try {
            await navigator.clipboard.writeText(password);
            this.showToast('Password copied to clipboard!');
        } catch (err) {
            // Fallback for older browsers
            this.fallbackCopy(password);
        }
    }

    private fallbackCopy(text: string): void {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.opacity = '0';
        document.body.appendChild(textArea);
        textArea.select();
        
        try {
            document.execCommand('copy');
            this.showToast('Password copied to clipboard!');
        } catch (err) {
            this.showToast('Failed to copy password!', 'error');
        }
        
        document.body.removeChild(textArea);
    }

    private showToast(message: string, type: 'success' | 'error' = 'success'): void {
        if (!this.elements.toast) return;

        this.elements.toast.textContent = message;
        this.elements.toast.style.background = type === 'success' ? 'var(--success-color)' : 'var(--danger-color)';
        
        this.elements.toast.classList.add('show');
        
        setTimeout(() => {
            this.elements.toast?.classList.remove('show');
        }, 3000);
    }

    private animatePasswordOutput(): void {
        if (!this.elements.passwordOutput) return;
        
        this.elements.passwordOutput.style.transform = 'scale(0.95)';
        setTimeout(() => {
            if (this.elements.passwordOutput) {
                this.elements.passwordOutput.style.transform = 'scale(1)';
            }
        }, 100);
    }
}

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    new PasswordGenerator();
});