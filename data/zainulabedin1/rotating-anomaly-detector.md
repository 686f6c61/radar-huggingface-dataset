# Zainulabedin1/rotating-anomaly-detector

## Resumen

`rotating-anomaly-detector` es un autoencoder convolucional 1-D publicado por Zainulabedin1 en HuggingFace, pensado para detección no supervisada de anomalías en señales de vibración de rodamientos. Se entrena solo con ventanas sanas y marca como anómalas aquellas que el modelo reconstruye peor, usando el error cuadrático medio de reconstrucción como puntuación.

El modelo tiene ~1,1 M de parámetros, recibe ventanas de 2048 muestras normalizadas por ventana y comprime la señal a un vector latente de 32 dimensiones. En el protocolo descrito sobre CWRU alcanza AUROC 1,000 y F1 0,9998 en un split concreto, con un umbral fijado en el percentil 95 de las puntuaciones normales de validación (0,3397).

Su relevancia práctica está en el mantenimiento predictivo y la monitorización de maquinaria rotativa: es muy pequeño, se puede ejecutar en CPU y sirve como base reproducible para experimentos con CWRU. Ahora bien, la validación es limitada: fallos sembrados, un solo banco, una carga y una velocidad, y licencia no disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Autoencoder convolucional 1-D (`ConvAutoencoder`): encoder con 3 × Conv1d stride-2 + ReLU, latente de 32 dimensiones y decoder con convoluciones transpuestas |
| Parámetros totales | ~1,1 M |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica como contexto textual; entrada de ventanas de 2048 muestras de señal |
| Tipos de cuantización | no disponible; no se documentan pesos GGUF, ONNX ni variantes cuantizadas |
| Idiomas soportados | no disponible / no aplica (modelo para señales de vibración, no texto) |
| Licencia | no disponible |
| Formato de pesos | PyTorch state dict (`pytorch_model.bin`); la model card menciona `model.py` y `config.json` |
| Tarea | Detección de anomalías no supervisada en señales de vibración de rodamientos |
| Pipeline de HuggingFace | no disponible |
| Descargas / likes | 13 / 1 |
| Tamaño del repositorio | 0,0 GB según HuggingFace |

## Arquitectura y entrenamiento

La arquitectura es un autoencoder convolucional 1-D, no un transformer, MoE, SSM ni un modelo híbrido. El encoder aplica tres capas `Conv1d` con stride 2 seguidas de ReLU y reduce cada ventana de entrada a un vector latente de 32 dimensiones; el decoder invierte esa secuencia con convoluciones transpuestas para reconstruir la ventana original. La entrada son ventanas de 2048 muestras normalizadas por ventana, y la puntuación de anomalía es el error cuadrático medio de reconstrucción.

El entrenamiento se realizó con la base CWRU Bearing Data Center, registros drive-end a 48 kHz, carga de 1 HP y ~1772 rpm. Se usó únicamente el archivo sano `98.mat`: primer 80 % de la señal, ventanas con paso 512, lo que dio 753 ventanas; 50 épocas con Adam a 1e-3 y ~13 minutos en CPU. El umbral de 0,3397 se fijó como percentil 95 de las puntuaciones normales de validación antes de ver ninguna ventana con fallo. No se documenta RLHF, DPO ni ajuste por preferencias, algo que no aplica a este tipo de modelo.

## Capacidades

- Puntuación por ventana: calcula un error de reconstrucción para cada ventana de 2048 muestras y permite ordenar o umbralizar las señales.
- Detección no supervisada: aprende únicamente el régimen sano y detecta desviaciones sin necesitar ejemplos etiquetados de fallo durante el entrenamiento.
- Clasificación binaria con umbral fijo: con el umbral 0,3397, cada ventana se marca como normal o anómala.
- Detección de fallos de rodamiento: en el split CWRU descrito cubre fallos de bola, pista interior y pista exterior en tres severidades (0,007, 0,014 y 0,021 pulgadas).
- Inferencia en CPU: el tamaño de ~1,1 M de parámetros permite ejecutarlo sin GPU.
- Uso como baseline reproducible: el repositorio documenta preprocesamiento, protocolo de entrenamiento y umbral, lo que facilita comparaciones experimentales.
- No es un modelo generativo ni conversacional: no soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso, texto, visión, audio ni capacidades multilingües; no aplica a este tipo de modelo.

## Casos de uso

- **Mantenimiento predictivo en rodamientos:** instalar un acelerómetro en el drive-end de una máquina rotativa, segmentar la señal en ventanas de 2048 muestras, normalizar por ventana y usar la puntuación de reconstrucción para programar inspecciones cuando se supere el umbral.
- **Monitorización continua en gateway industrial o edge:** ejecutar el autoencoder en CPU junto al sistema de adquisición, ya que ~1,1 M de parámetros permiten inferencia local sin depender de GPU ni de la nube.
- **Filtro de persistencia para reducir falsas alarmas:** aplicar la regla sugerida por el autor y generar una alarma solo después de K ventanas consecutivas por encima del umbral; así se compensa el ~5 % de falsos positivos asociado al percentil 95.
- **Baseline reproducible para experimentos con CWRU:** usar el protocolo de 753 ventanas sanas, 50 épocas y umbral 0,3397 como referencia para comparar otros autoencoders 1-D o detectores no supervisados sobre el mismo conjunto.
- **Revalidación ante cambios de velocidad o carga:** emplear el modelo como punto de partida, recoger datos normales de la nueva condición operativa y reestimar el umbral antes de desplegarlo, ya que la firma de vibración cambia con la condición.
- **Docencia y demostración de autoencoders 1-D:** entrenar y evaluar el modelo en CPU en unos 13 minutos con 753 ventanas, lo que lo hace adecuado para prácticas de detección de anomalías y preprocesamiento de señales.
- **Control de calidad en banco de ensayos:** detectar desviaciones respecto a un régimen sano en un banco con fallos sembrados similares a CWRU, siempre que se valide antes la transferencia al equipo concreto.

## Benchmarks y rendimiento

| Métrica | Valor |
|---|---|
| AUROC (normal vs fallo, ventanas) | 1,000 |
| Precisión @ umbral 0,3397 | 0,9995 |
| Recall @ umbral | 1,000 |
| F1 @ umbral | 0,9998 |
| Falsos positivos en normales de test | 1 de 23 ventanas (~4 %) |
| Recall por condición de fallo | 100 % en las nueve condiciones: bola / pista interior / pista exterior × 0,007 / 0,014 / 0,021 pulgadas |
| Relación de puntuaciones | Media de fallo 2,8–3,
