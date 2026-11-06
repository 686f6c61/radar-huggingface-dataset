# synthet/eye-pose-v0

## Resumen

eye-pose-v0 es un modelo de estimacion de pose (keypoint detection) especializado en la localizacion de la cabeza y los ojos de aves. Lo desarrolla el usuario synthet y se construye mediante fine-tuning del modelo ultralytics/yolo11n-pose, la variante mas pequena de la familia YOLO11 en su version para pose estimation. El modelo forma parte del pipeline image-scoring-model, donde actua como etapa 1 de localizacion para puntuar el enfoque (nitidez) de los ojos en fotografias de fauna aviar.

El problema que resuelve es acotado pero concreto: dada una imagen de un ave, devuelve seis keypoints (pico, ojo izquierdo, ojo derecho, parte superior de la cabeza y ambos hombros) junto con la caja delimitadora del ave. Estos puntos permiten a etapas posteriores del pipeline evaluar si los ojos estan enfocados, algo relevante en fotografia de fauna donde el foco en el ojo es el criterio principal de calidad. No es un modelo generativo ni un LLM: es un detector de keypoints de vision por computador, sin capacidades de texto.

La relevancia es practica: se trata de un modelo pequeno (basado en YOLO11n, la variante nano) entrenado sobre CUB-200-2011, con metricas de validacion muy altas en el conjunto de validacion del propio dataset (pose mAP50 de 0,994). Su utilidad queda restringida al dominio de aves en fotografias de estilo estudio, y su licencia AGPL-3.0 condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO11n-pose (CNN, deteccion de objetos con rama de keypoints) |
| Parametros totales | no disponible (variante nano de YOLO11; el autor no publica el conteo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos en .pt; compatible con exportacion de Ultralytics a otros formatos, no documentado por el autor) |
| Idiomas soportados | no aplica (modelo de vision; sin capacidades linguisticas) |
| Licencia | AGPL-3.0 |
| Formato de pesos | .pt (PyTorch via Ultralytics) |

## Arquitectura y entrenamiento

El modelo se basa en YOLO11n-pose, una red convolucional de deteccion de objetos de una sola etapa con una cabeza adicional de regresion de keypoints. Detecta una unica clase (ave) y predice simultaneamente la caja delimitadora y seis keypoints: pico, ojo izquierdo, ojo derecho, parte superior de la cabeza, hombro izquierdo y hombro derecho, con un `flip_idx` de `[0, 2, 1, 3, 5, 4]` para el data augmentation por volteo horizontal.

El entrenamiento se realizo sobre CUB-200-2011 convertido al formato YOLO pose, con aproximadamente 10.000 imagenes de entrenamiento y 1.700 de validacion. Se entrenaron 100 epocas con `imgsz` 640 y batch 16. No se documenta el uso de RLHF, DPO ni tecnicas de alineacion (no aplican a este tipo de modelo), ni innovaciones como decodificacion especulativa o atencion lineal, que son propias de modelos de lenguaje.

## Capacidades

- Deteccion de aves: localiza una unica clase (ave) mediante caja delimitadora.
- Estimacion de pose de cabeza: predice seis keypoints (pico, ojos, parte superior de la cabeza y hombros).
- Localizacion ocular: los keypoints de ojo izquierdo y derecho permiten a etapas posteriores evaluar el enfoque en el ojo.
- Integracion con el pipeline image-scoring-model como etapa 1 de localizacion.
- Inferencia via Ultralytics (`YOLO.predict`) y via el paquete `eye_quality` del repositorio padre.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingues (no es un modelo de lenguaje).
- No dispone de modo thinking, vision general, audio ni otras capacidades multimodales mas alla de la imagen de entrada.

## Casos de uso

- Puntuacion de enfoque en fotografia de fauna aviar: el modelo localiza los ojos del ave y una heuristica posterior del repositorio padre calcula la nitidez en esa region, permitiendo seleccionar automaticamente las mejores tomas de una sesion.
- Filtrado y culling de rafagas: en un flujo de fotografia de aves, se aplica el modelo a cada imagen de una rafaga para descartar aquellas con ojos desenfocados o sin ave detectada.
- Etiquetado asistido de datasets de aves: los seis keypoints generan anotaciones preliminares que un humano revisa, reduciendo el coste de crear datasets de pose aviar.
- Preprocesado para recorte centrado en la cabeza: usando los keypoints de ojos y parte superior de la cabeza se puede generar un recorte automatico centrado en el rostro del ave para tareas posteriores de clasificacion o identificacion.
- Control de calidad en pipelines de imagen cientifica: verificacion automatica de que las capturas de aves cumplen un criterio minimo de foco ocular antes de almacenarlas o procesarlas.
- Prototipado rapido en aplicaciones de observacion de aves: al ser un modelo nano y ligero, puede desplegarse en entornos con recursos limitados para localizar la cabeza del ave en tiempo casi real sobre imagenes estaticas o video de baja resolucion.

## Benchmarks y rendimiento

Resultados de validacion publicados por el autor en la epoca 100:

| Metrica | Valor |
|---|---|
| Pose mAP50 | 0,994 |
| Pose mAP50-95 | 0,983 |
| Box mAP50 | 0,994 |

No se han publicado comparaciones con otros modelos en la informacion disponible. Las metricas corresponden al conjunto de validacion derivado de CUB-200-2011 y no deben extrapolarse sin mas a imagenes de campo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al tratarse de una variante nano de YOLO11 con entrada de 640 px, el consumo es bajo y cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU consumer moderna (por ejemplo, RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien puede ejecutarse en CPU para inferencia por lotes no critica en latencia.
- Cabe en GPU consumer: si, sin restricciones practicas conocidas dada la escala nano del modelo base.
- Opciones de despliegue: Ultralytics (Python), el paquete `eye_quality` del repositorio padre, y exportacion a formatos soportados por Ultralytics (no documentada por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| synthet/eye-pose-v0 | no disponible (YOLO11n-pose) | no aplica | Keypoints de cabeza de ave (6) | AGPL-3.0 | Hugging Face |
| ultralytics/yolo11n-pose | no disponible | no aplica | Pose estimation generica (personas) | AGPL-3.0 | Ultralytics / Hugging Face |
| Alternativas de pose animal | no disponible | no aplica | Pose animal general | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo con otros modelos de pose aviar en la informacion proporcionada.

## Limitaciones y advertencias

- Deteccion de una unica clase (ave) con keypoints de cabeza; no es un modelo general de pose animal.
- Entrenado sobre CUB-200-2011, con fotografias de aves de estilo estudio; el rendimiento en fauna de campo o a distancia puede variar.
- Solo realiza localizacion de ojos; la puntuacion de enfoque/nitidez se calcula con heuristicas separadas en el repositorio padre.
- Licencia AGPL-3.0: impone obligaciones de copyleft sobre el codigo que lo integre y su distribucion; revisar antes de uso comercial.
- El dataset CUB-200-2011 proviene de Flickr y esta descrito como limitado a investigacion y educacion no comercial; la licencia AGPL-3.0 cubre solo los pesos y no otorga derechos sobre el dataset.
- Riesgo de falsos positivos o keypoints imprecisos en imagenes con aves parcialmente ocluidas, multiples aves o condiciones de iluminacion adversas (no documentado por el autor, pero inherente al dominio).
- Sin datos publicados sobre sesgos demograficos o de dominio mas alla de las limitaciones declaradas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/synthet/eye-pose-v0
- Archivos del modelo: https://huggingface.co/synthet/eye-pose-v0/tree/main
- Repositorio image-scoring-model: https://github.com/synthet/image-scoring-model
- Modelo base YOLO11n-pose: https://huggingface.co/ultralytics/yolo11n-pose
- Licencia AGPL-3.0: https://www.gnu.org/licenses/agpl-3.0.html
- Licencia de Ultralytics: https://www.ultralytics.com/license
