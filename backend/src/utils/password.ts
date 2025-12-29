import bcrypt from 'bcryptjs';

export class PasswordService {
  /**
   * Hashea una contraseña
   */
  static async hash(password: string): Promise<string> {
    const salt = await bcrypt.genSalt(10);
    return bcrypt.hash(password, salt);
  }
  
  /**
   * Verifica si una contraseña coincide con su hash
   */
  static async verify(password: string, hashedPassword: string): Promise<boolean> {
    return bcrypt.compare(password, hashedPassword);
  }
  
  /**
   * Valida que la contraseña cumpla con requisitos mínimos
   */
  static validate(password: string): { valid: boolean; error?: string } {
    if (password.length < 6) {
      return {
        valid: false,
        error: 'La contraseña debe tener al menos 6 caracteres',
      };
    }
    
    return { valid: true };
  }
}