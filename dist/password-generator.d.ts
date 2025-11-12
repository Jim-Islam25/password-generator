interface PasswordOptions {
    length: number;
    uppercase: boolean;
    lowercase: boolean;
    numbers: boolean;
    symbols: boolean;
}
declare class PasswordGenerator {
    private charset;
    constructor();
    private elements;
    private initializeElements;
    private attachEventListeners;
    private updateLengthDisplay;
    private getPasswordOptions;
    private generatePassword;
    private createPassword;
    private getRandomChar;
    private shuffleString;
    private updateStrength;
    private getStrengthColor;
    private copyToClipboard;
    private fallbackCopy;
    private showToast;
    private animatePasswordOutput;
}
