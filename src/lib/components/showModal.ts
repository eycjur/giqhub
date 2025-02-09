export function showTemporaryModal(
	message: string,
	color: string = 'gray',
	duration: number = 1000,
	zIndex: number = 50
) {
	// Create modal element
	const modal = document.createElement('div');
	modal.textContent = message;
	modal.style.position = 'fixed';
	modal.style.top = '10px';
	modal.style.left = '50%';
	modal.style.transform = 'translateX(-50%)';
	modal.style.background = color;
	modal.style.color = 'white';
	modal.style.padding = '10px 20px';
	modal.style.borderRadius = '8px';
	modal.style.zIndex = '1000';
	modal.style.fontSize = '14px';
	modal.style.opacity = '1';
	modal.style.transition = 'opacity 0.5s ease';
	modal.style.zIndex = zIndex.toString();

	// Add modal to body
	document.body.appendChild(modal);

	// Fade out and delete after 1 second
	setTimeout(() => {
		modal.style.opacity = '0';
		setTimeout(() => {
			modal.remove();
		}, 500);
	}, duration);
}
