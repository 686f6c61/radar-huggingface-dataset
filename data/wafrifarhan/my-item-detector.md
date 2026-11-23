# WafriFarhan/my-item-detector

## Resumen

My Item Detector es un modelo de detección de objetos publicado por el usuario WafriFarhan en Hugging Face, entrenado con la librería Ultralytics sobre una base YOLO26n. El modelo se desarrolló como ejercicio práctico en el bootcamp CodingBN (sesiones 14 y 15) y detecta únicamente dos clases: `One` y `Zero`. El ajuste fino se realizó sobre aproximadamente 50 fotografías tomadas y etiquetadas por el propio autor en Roboflow.

Se trata de un artefacto educativo de escala muy reducida: el repositorio ocupa 0,0 GB, no registra descargas ni interacciones y fue creado el 23 de noviembre de 2026. No incluye métricas de evaluación publicadas (la model card deja un marcador «add your mAP50 here» sin completar), lo que impide valorar su rendimiento real.

Su relevancia es, por tanto, exclusivamente didáctica: ilustra el flujo completo de anotación, entrenamiento y publicación de un detector YOLO, pero no constituye una base adecuada para producción, investigación comparativa ni despliegues comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | YOLO26n (Ultralytics), detector de objetos de una etapa |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de visión, no de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión; las clases son etiquetas, no idioma) |
| Licencia | AGPL-3.0 (o licencia Enterprise de Ultralytics) |
| Formato de pesos | no disponible (librería `ultralytics`; se desconoce si publica `.pt`, `.onnx` u otros) |

## Arquitectura y entrenamiento

La arquitectura corresponde a YOLO26n, la variante «nano» de la familia YOLO26 de Ultralytics, un detector de objetos de una sola etapa basado en redes convolucionales. El autor parte de los pesos preentrenados de YOLO26n y aplica un ajuste fino supervisado sobre un conjunto propio de aproximadamente 50 imágenes capturadas con un teléfono móvil y etiquetadas manualmente en Roboflow.

No se especifican hiperparámetros de entrenamiento (épocas, tamaño de imagen, aumentos de datos, batch size), ni la composición exacta del dataset, ni si se aplicaron técnicas de regularización. Tampoco se documenta ningún proceso de alineación o refinamiento posterior. La única innovación reseñable es el propio uso del pipeline de Ultralytics para transfer learning sobre un dataset mínimo.

## Capacidades

- Detección de objetos en imágenes para dos clases cerradas: `One` y `Zero`.
- Inferencia mediante la librería `ultralytics` (API de Python y CLI de YOLO).
- Ejecución potencial en CPU y GPU según el backend de Ultralytics, aunque no se documentan requisitos.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agente.
- No dispone de capacidades multilingües (no procesa texto).
- No dispone de modo «thinking», visión generativa, audio ni otras capacidades multimodales más allá de la detección visual.

## Casos de uso

- Demostración educativa de transfer learning: sirve para ilustrar en un aula o bootcamp cómo se anota un dataset en Roboflow, se ajusta un YOLO preentrenado y se publica el resultado en Hugging Face.
- Prueba de concepto de detección binaria controlada: en un entorno con fondo, iluminación y cámara idénticos a los del entrenamiento, podría usarse para validar el pipeline de inferencia antes de escalar a un dataset mayor.
- Prototipado rápido de aplicaciones de conteo o clasificación visual muy acotada, siempre que las clases `One` y `Zero` coincidan con el objeto de interés real.
- Material de comparación en tutoriales sobre limitaciones del sobreajuste: permite mostrar de forma tangible por qué 50 imágenes y una sola habitación producen un modelo que no generaliza.
- Integración en notebooks de aprendizaje con la API de Ultralytics para experimentar con umbrales de confianza y NMS.
- Base de partida para un reentrenamiento propio: un desarrollador podría reutilizar el flujo de trabajo documentado (Roboflow + Ultralytics) para construir su propio detector con un dataset representativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye un marcador sin completar («add your mAP50 here») y no aporta métricas de precisión, recall, mAP ni latencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por el tamaño «nano» de la familia YOLO, es previsible que quepa en GPUs de gama baja, pero no hay datos confirmados.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repositorio (0,0 GB) sugiere pesos muy ligeros, pero no se especifica.
- Opciones de despliegue: librería `ultralytics` (Python/CLI); no se documentan exportaciones a ONNX, TensorRT, OpenVINO ni integraciones con vLLM, llama.cpp, Ollama o TGI (estas últimas no aplican a un detector visual).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| My Item Detector (YOLO26n fine-tuned) | no disponible | no aplica | sin métricas publicadas | AGPL-3.0 | Hugging Face, 0 descargas |
| YOLO26n (Ultralytics, base) | no disponible en la información proporcionada | no aplica | no disponible | AGPL-3.0 / Enterprise | Público vía Ultralytics |
| YOLOv8n (Ultralytics) | no disponible en la información proporcionada | no aplica | no disponible | AGPL-3.0 / Enterprise | Público vía Ultralytics |
| Otros detectores YOLO ajustados en Hugging Face | variable | no aplica | variable, rara vez documentado | habitualmente AGPL-3.0 | Público |

No se dispone de datos verificables para establecer una comparación cuantitativa con alternativas; la comparativa anterior es estructural y se limita a licencia y disponibilidad.

## Limitaciones y advertencias

- Dataset de entrenamiento mínimo (unas 50 imágenes) capturado en una sola habitación y con un solo teléfono: el modelo fallará con alta probabilidad ante otros fondos, iluminaciones, ángulos y objetos.
- Solo reconoce las clases `One` y `Zero`; cualquier otro objeto se ignora o se clasifica erróneamente.
- Ausencia total de métricas publicadas: no es posible evaluar su calidad objetivamente ni compararla con alternativas.
- Riesgo elevado de sobreajuste y de falsos positivos fuera de la distribución de entrenamiento.
- No apto para uso en sistemas de seguridad crítica, tal como advierte el propio autor.
- Licencia AGPL-3.0: el uso comercial requiere cumplir con las obligaciones de copyleft o adquirir una licencia Enterprise de Ultralytics.
- Sin descargas ni validación por parte de la comunidad: no hay evidencia externa de funcionamiento.
- No se documentan sesgos específicos, pero al ser un modelo visual entrenado con datos de un único usuario, hereda los sesgos de ese entorno concreto.
- No se especifican los formatos de pesos publicados ni el contenido exacto del repositorio (0,0 GB), lo que dificulta verificar qué se está descargando.

## Enlaces

- Hugging Face: https://huggingface.co/WafriFarhan/my-item-detector
- Ultralytics (librería y familia YOLO): https://github.com/ultralytics/ultralytics
- Roboflow (plataforma de anotación citada): https://roboflow.com
- CodingBN (bootcamp donde se entrenó el modelo): no disponible
