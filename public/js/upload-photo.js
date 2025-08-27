// Simulação de upload de foto
document.getElementById('upload-photo').addEventListener('change', function(event) {
    const file = event.target.files[0];
    if (file) {
        const formData = new FormData();
        formData.append('profilePhoto', file);
        
        fetch('/perfil/upload-foto', {
            method: 'POST',
            body: formData
        })
        .then(response => response.json())
        .then(data => {
            if (data.success) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    document.getElementById('profile-picture').src = e.target.result;
                    alert(data.message);
                };
                reader.readAsDataURL(file);
            } else {
                alert('Erro ao atualizar a foto: ' + data.message);
            }
        })
        .catch(error => {
            console.error('Erro:', error);
            alert('Erro ao comunicar com o servidor');
        });
    }
});

// Processar formulário de perfil
document.getElementById('profile-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    fetch('/perfil/atualizar', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
        } else {
            alert('Erro ao atualizar perfil: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao comunicar com o servidor');
    });
});

// Processar formulário de senha
document.getElementById('password-form').addEventListener('submit', function(event) {
    event.preventDefault();
    
    const formData = new FormData(this);
    const data = Object.fromEntries(formData.entries());
    
    if (data.newPassword !== data.confirmPassword) {
        alert('As senhas não coincidem!');
        return;
    }
    
    if (data.newPassword.length < 8) {
        alert('A senha deve ter pelo menos 8 caracteres!');
        return;
    }
    
    fetch('/perfil/alterar-senha', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    })
    .then(response => response.json())
    .then(data => {
        if (data.success) {
            alert(data.message);
            this.reset();
        } else {
            alert('Erro ao alterar senha: ' + data.message);
        }
    })
    .catch(error => {
        console.error('Erro:', error);
        alert('Erro ao comunicar com o servidor');
    });
});