# tonghuiwang123/so100-diffusion-new60

## Resumen

El modelo `tonghuiwang123/so100-diffusion-new60` es un policy de control robótico desarrollado por el usuario tonghuiwang123 (Argento Fishback) para el brazo articulado SO-ARM100 / SO100. Está entrenado específicamente para la tarea de agarrar un cubo blanco y colocarlo en una taza blanca, utilizando una arquitectura de Diffusion Policy sobre el framework LeRobot. El modelo se ha entrenado desde cero con 40 episodios que suman 8482 frames a 30 fps, capturados con dos cámaras a 1280x720, y ha sido optimizado para inferencia en tiempo real con un consumo de VRAM de aproximadamente 0.70 GB.

Este checkpoint corresponde al paso 030000 (equivalente a 226.4 épocas con un batch efectivo de 64) y está diseñado para ser desplegado mediante la herramienta `lerobot-record` del ecosistema LeRobot. Su relevancia radica en que demuestra la viabilidad de entrenar policies de manipulación robótica con un número reducido de demostraciones y hardware de bajo coste, siendo un ejemplo práctico para la comunidad de robótica open source. Sin embargo, su aplicabilidad está limitada a la configuración específica de cámaras y al espacio de trabajo cubierto durante el entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Policy (basado en ACT, según model card) |
| Parametros totales | 277.839.286 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (control robótico, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos en safetensors) |
| Idiomas soportados | no disponible (modelo de visión-accion, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un policy de difusión (Diffusion Policy) que genera secuencias de acciones para el brazo robótico SO-ARM100. Aunque la model card lo etiqueta como "ACT policy", la descripción indica que se trata de un Diffusion Policy entrenado desde cero, lo que sugiere una red que predice acciones mediante un proceso de denoising iterativo, típicamente con una arquitectura basada en convoluciones o transformers. No se proporcionan detalles adicionales sobre la estructura interna (número de capas, tipo de atención, etc.).

El entrenamiento se realizó con 40 episodios que contienen 8482 frames a 30 fps, capturados con dos cámaras (una superior y otra en la muñeca) a resolución 1280x720. Durante el entrenamiento se aplicó un redimensionado a 180x320 y un recorte con ratio 0.95, que también se aplica en inferencia. El checkpoint utilizado es el paso 030000, equivalente a 226.4 épocas con un batch efectivo de 64. No se menciona el uso de técnicas como RLHF o DPO, ya que es un modelo de control puramente supervisado.

## Capacidades

- Control de brazo robótico: genera acciones de articulación (probablemente posiciones o velocidades) para el SO-ARM100, permitiendo ejecutar la tarea de pick-and-place de un cubo blanco en una taza blanca.
- Percepción visual multimodal: procesa imágenes de dos cámaras (frontal superior y lateral en la muñeca) a 1280x720, redimensionadas a 180x320 para la inferencia.
- Ejecución en tiempo real: con un consumo de VRAM de ~0.70 GB, puede ejecutarse en GPUs de gama baja o incluso en sistemas embebidos con aceleración.
- Integración con LeRobot: compatible con el ecosistema LeRobot, permitiendo su uso directo con `lerobot-record` para despliegue y evaluación.
- No soporta procesamiento de lenguaje, tool calling, agentes ni razonamiento multi-step; es un policy puramente reactivo para una tarea específica.

## Casos de uso

- Automatización de tareas de pick-and-place en entornos de laboratorio: el modelo puede integrarse en un brazo SO-ARM100 para repetir la tarea de agarrar un cubo y depositarlo en una taza, útil en experimentos de robótica manipulativa.
- Investigación en aprendizaje por demostración: sirve como punto de partida para estudiar la transferencia de políticas entrenadas con pocos datos, ya que solo requiere 40 episodios.
- Prototipado de soluciones robóticas de bajo coste: al consumir menos de 1 GB de VRAM, puede desplegarse en hardware económico (por ejemplo, una NVIDIA Jetson o una GPU integrada) para pruebas rápidas.
- Evaluación de políticas de difusión en robótica: permite comparar el rendimiento de Diffusion Policy frente a otros métodos (como ACT o VQ-BeT) en una tarea estándar.
- Educación y formación en robótica: los estudiantes pueden utilizar este modelo como ejemplo práctico de entrenamiento y despliegue de un policy de control con LeRobot.
- Replicación de experimentos: dado que el autor proporciona los datos de entrenamiento (tonghuiwang123/40), otros investigadores pueden reproducir el entrenamiento o ajustar el modelo a nuevas tareas similares.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de éxito, tasas de acierto ni comparaciones con otros modelos. Solo se indica que el rendimiento decae cuando el cubo se coloca en zonas del workspace con baja cobertura de datos de entrenamiento.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0.70 GB, según la model card.
- GPU recomendadas: cualquier GPU con al menos 1 GB de VRAM; puede ejecutarse en tarjetas consumer como NVIDIA GTX 1050 Ti, RTX 2060 o superiores. También podría funcionar en hardware integrado con soporte CUDA.
- Si cabe en consumer GPU: sí, con margen amplio.
- Opciones de despliegue: el modelo está diseñado para usarse con la librería LeRobot y la herramienta `lerobot-record`; no se mencionan otros frameworks como vLLM, llama.cpp u Ollama, ya que no es un modelo de lenguaje.
- Latencia y throughput estimados: no se proporcionan datos concretos; dado el pequeño tamaño y la baja VRAM, se espera una inferencia en tiempo real (30 fps) en una GPU modesta, pero no hay cifras oficiales.

## Comparativa con modelos similares

No disponible. No se han identificado modelos comparables en la información proporcionada, ya que se trata de un policy robótico específico para una tarea y plataforma concretas, y no hay datos de otros modelos similares en el repositorio del autor.

## Limitaciones y advertencias

- Cobertura limitada del workspace: los datos de entrenamiento solo cubren la mitad izquierda del espacio de trabajo (shoulder_pan entre -48 y +6 grados), y el 28% de las muestras se concentran en un rango estrecho (pan entre -25 y -20 grados). Esto provoca una degradación significativa del rendimiento cuando el objeto se coloca en zonas con poca representación.
- Dependencia de la configuración de cámaras: el modelo exige que las cámaras se nombren exactamente como `front` (cámara superior) y `side` (cámara de muñeca). Si el orden se invierte, no se produce un error, pero el comportamiento empeora notablemente.
- Resolución fija: la inferencia requiere imágenes a 1280x720; cualquier cambio en la resolución o en la posición de las cámaras invalidará el modelo.
- Riesgo de alucinación: no aplica, al ser un modelo de control y no de generación de texto.
- Sesgos: el sesgo principal es la distribución desigual de los datos de entrenamiento, que limita la generalización a otras posiciones del objeto.
- Licencia: no se especifica, por lo que el uso comercial puede estar restringido o ser incierto; se recomienda contactar al autor antes de cualquier uso productivo.
- Sin soporte para tareas fuera de la específica: el modelo solo ejecuta la tarea "Grab the white cube to the white cup"; no es reutilizable para otras manipulaciones sin reentrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tonghuiwang123/so100-diffusion-new60
- Perfil del autor: https://huggingface.co/tonghuiwang123
- Listado de modelos del autor: https://huggingface.co/tonghuiwang123/models
- Dataset de entrenamiento (mencionado en la model card): `tonghuiwang123/40` (no se proporciona URL directa, pero es accesible desde el perfil del autor)
