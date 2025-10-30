// Resend OTP provider scaffold for Convex Auth.
// This file tries to construct a provider only when the required packages are
// installed. It is safe to import in environments where @convex-dev/auth or
// `resend` are not present.

let ResendOTP: any = null;
try {
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { Email } = require('@convex-dev/auth/providers/Email');
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { Resend: ResendAPI } = require('resend');
	// eslint-disable-next-line @typescript-eslint/no-var-requires
	const { RandomReader, generateRandomString } = require('@oslojs/crypto/random');

	ResendOTP = Email({
		id: 'resend-otp',
		apiKey: process.env.AUTH_RESEND_KEY,
		maxAge: 60 * 15, // 15 minutes
		async generateVerificationToken() {
			const random: RandomReader = {
				read(bytes: Uint8Array) {
					crypto.getRandomValues(bytes);
				},
			};
			const alphabet = '0123456789';
			const length = 8;
			return generateRandomString(random, alphabet, length);
		},
		async sendVerificationRequest({ identifier: email, provider, token }: any) {
			const resend = new ResendAPI(provider.apiKey);
			await resend.emails.send({
				from: 'Giggle <no-reply@giggle.local>',
				to: [email],
				subject: `Your Giggle sign-in code`,
				text: `Your code is ${token}`,
			});
		},
	});
} catch (err) {
	// Packages not installed — export null and keep this file safe to import.
	ResendOTP = null;
}

export { ResendOTP };
