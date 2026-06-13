from Crypto.Cipher import AES
import base64
import hashlib


class EncryptionManager:
    def __init__(self, master_key="asngkawnkg12_)(*&bjhHBGBJ%^&vgbhj"):
        self.key = hashlib.sha256(master_key.encode()).digest()


    def _pad(self, s):
        padding = 16 - len(s) % 16
        return s + (chr(padding) * padding)


    def _unpad(self, s):
        return s[: -ord(s[-1])]


    def encrypt(self, data):
        data = self._pad(data)
        iv = hashlib.sha256(data.encode('utf-8')).digest()[:16]
        cipher = AES.new(self.key, AES.MODE_CBC, iv)
        encrypted = cipher.encrypt(data.encode('utf-8'))
        return base64.b64encode(iv + encrypted).decode('utf-8')


    def decrypt(self,enc_data):
        try:
            enc_data = base64.b64decode(enc_data)
            iv = enc_data[:16]
            ciphertext = enc_data[16:]
            cipher = AES.new(self.key, AES.MODE_CBC, iv)
            decrypted = cipher.decrypt(ciphertext).decode('utf-8')
            return self._unpad(decrypted)
        except (UnicodeDecodeError, ValueError, Exception) as e:
            print("Decryption failed. Possibly due to wrong key or corrupted data.")
            return None