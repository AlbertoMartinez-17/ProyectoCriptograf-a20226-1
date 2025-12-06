#!/bin/bash

# --- CONFIGURACIÓN ---
GUI_URL="http://localhost:5173" #Url and port to start the web page

# Función para limpiar procesos al salir (Ctrl + C)
cleanup() {
    kill $(jobs -p) 2>/dev/null
    exit
}

trap cleanup SIGINT

echo "La cold wallet esta iniciando"
echo "Para cerrar la cold wallet presiona ctrl+c, esto cerrará ambos procesos de los servidores"

#INSTALACIÓN LOCAL
echo -e "\n[1/4] Instalando dependencias de la cold wallet..."
cd root/local
npm install
if [ $? -ne 0 ]; then
    echo "Error instalando ./local/package.json"
    exit 1
fi
cd ../.

#INSTALACIÓN GUI
echo -e "\n[2/4] Instalando dependencias de la GUI."
cd root/web
npm install
if [ $? -ne 0 ]; then
    echo "Error instalando ./web/package.json"
    exit 1
fi
cd ../. #Para salir del directorio web a root de nuevo.

echo -e "\nInstalación completada."
echo " [3/4] INICIANDO PROCESOS"


#EJECUCIÓN DE LA WALLET Y GUI
# Se inician en segundo plano al estar usando &, para intentar tener todo en una termnal
cd root/local && npm run dev &
LOCAL_PID=$!

cd root/web && npm run dev &
GUI_PID=$!

#ABRIR NAVEGADOR Y PAGINA
echo -e "\n[4/4] Abriendo navegador"
sleep 5 #hacemos wait para estar seguros de que le servidor de la página ya esta corriendo

# Detección del SO
if [[ "$OSTYPE" == "darwin"* ]]; then
  # macOS
  open "$GUI_URL"
elif which xdg-open > /dev/null; then
  # Linux
  xdg-open "$GUI_URL"
elif which gnome-open > /dev/null; then
  # Linux Gnome (edd)
  gnome-open "$GUI_URL"
else
  echo "No se detecto correctamente el sistema operativo, entra a la siguienre URL: $GUI_URL"
fi

wait
