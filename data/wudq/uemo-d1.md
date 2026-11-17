# wudq/UEmo-D1

## Resumen

UEmo-D1 es un modelo de reconocimiento multimodal de emociones presentado como implementación oficial del artículo "UEmo-D1: An Efficient and Calibrated Decision Model for Unified Multimodal Emotion Recognition", publicado por el autor wudq. Se trata de un ajuste fino del modelo Qwen/Qwen2.5-Omni-3B orientado a una tarea de clasificación cerrada: dado un contenido multimodal (texto, imagen, audio o vídeo con audio) y una lista de opciones candidatas de emoción, el modelo devuelve la letra correspondiente a la opción seleccionada, con probabilidades calibradas opcionalmente.

El modelo conserva los componentes del Qwen2.5-Omni-3B original (decodificador de texto, codificador visual y codificador de audio) e incorpora parámetros de bajo rango entrenados para la tarea de decisión emocional. El checkpoint publicado es autocontenido (9,5 GB) e incluye todo lo necesario para inferencia, sin requerir la descarga del modelo base por separado. Los parámetros de bajo rango se mantienen sin fusionar en su precisión original para preservar las salidas validadas.

Su relevancia radica en el enfoque de "modelo de decisión": en lugar de generar texto libre, el modelo reformula el reconocimiento emocional como una selección entre opciones (hasta 26), aplicando una temperatura fija de 1,079 sobre los logits de las letras válidas para obtener probabilidades calibradas. Está validado en Linux con Python 3.12, CUDA y FlashAttention 2 sobre una NVIDIA RTX 4090, y su licencia Qwen Research restringe el uso a investigación y evaluación no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivado de Qwen2.5-Omni-3B (decodificador de texto, codificador visual y codificador de audio) con atención bidireccional sobre el prefijo de entrada y parámetros de bajo rango entrenados |
| Parametros totales | 4.733.398.016 (según safetensors) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el checkpoint se distribuye en safetensors en precisión original; los parámetros de bajo rango no se fusionan) |
| Idiomas soportados | en, zh |
| Licencia | qwen-research (Qwen Research License); uso no comercial para investigación y evaluación, uso comercial requiere autorización del licenciante upstream |
| Formato de pesos | safetensors (con código personalizado, `trust_remote_code=True`) |

## Arquitectura y entrenamiento

UEmo-D1 parte de Qwen2.5-Omni-3B, un modelo multimodal que combina un decodificador de texto con codificadores especializados para visión y audio. Sobre esa base, el autor entrena parámetros de bajo rango (LoRA) para la tarea de decisión emocional, manteniéndolos sin fusionar en el checkpoint publicado. Una diferencia técnica clave respecto al uso convencional de Qwen es que UEmo-D1 aplica atención bidireccional sobre el prefijo de entrada completo, lo que exige usar el cargador incluido en el repositorio en lugar de cargar los pesos como un modelo causal estándar de Qwen.

El entrenamiento se orienta a una formulación de elección cerrada: el contenido multimodal, una instrucción y entre 1 y 26 opciones únicas se ensamblan en una plantilla compartida, y el modelo aprende a emitir únicamente la letra de la opción elegida. La calibración de probabilidades se realiza leyendo los logits del siguiente token para las letras válidas y aplicando un softmax con temperatura fija de 1,0790077648040843, aplicada exactamente una vez. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO; el autor indica explícitamente que los estados del optimizador, los datos de entrenamiento, los datos de evaluación, los checkpoints intermedios y los componentes de generación de voz no están incluidos en el repositorio.

## Capacidades

- Reconocimiento de emociones multimodal: procesa texto, imágenes (por ejemplo, rostros), audio (voz) y vídeo con audio emparejado.
- Clasificación por elección cerrada: selecciona una opción entre 1 y 26 candidatas proporcionadas por el usuario y devuelve la letra correspondiente, no un identificador global fijo de emoción.
- Salida de probabilidades calibradas: con la opción `--probabilities` devuelve la etiqueta seleccionada y las probabilidades calibradas por opción.
- Soporte de contexto previo: permite añadir un objeto `context` con sus propias listas de texto, imagen, audio y vídeo antes del objetivo.
- Procesamiento de audio completo: retiene el audio íntegro, lo convierte a mono a 16 kHz y muestrea vídeo a 2 FPS, con presupuestos de píxeles de 448² para imagen y 224² para vídeo.
- Multilingüe limitado: inglés y chino.
- No soporta tool calling, function calling, agentes ni generación de texto libre; es un modelo de extracción de características y decisión, no un generador conversacional.

## Casos de uso

- Análisis de sentimiento en atención al cliente: transcribir o recibir audio de llamadas y usar UEmo-D1 para clasificar la emoción del cliente entre opciones como "satisfecho", "frustrado", "neutro" o "enfadado", aproveitando el procesamiento de audio completo y las probabilidades calibradas para priorizar casos de riesgo.
- Moderación de contenido multimedia: analizar vídeos subidos por usuarios (con audio emparejado) para detectar emociones de riesgo como angustia o agresividad, usando la salida de letra para integrarla en pipelines automatizados de revisión.
- Investigación en psicología y interacción humano-computador: estudiar la concordancia entre modalidades (texto, voz, rostro) pidiendo al modelo que clasifique la emoción con distintas combinaciones de entrada y comparando las probabilidades calibradas.
- Análisis de entrevistas o testimonios: procesar grabaciones de audio con contexto textual previo (por ejemplo, la pregunta formulada) para clasificar la emoción de la respuesta, gracias al soporte del objeto `context`.
- Evaluación de accesibilidad y experiencia de usuario: clasificar la reacción emocional de usuarios ante interfaces o productos a partir de vídeos con audio, con muestreo a 2 FPS que reduce el coste computacional en clips largos.
- Sistemas de triaje en salud mental o soporte emocional: usar la decisión cerrada y las probabilidades calibradas para derivar casos hacia revisión humana, con la ventaja de que la salida es una etiqueta controlada y no texto libre, lo que simplifica la integración en sistemas de decisión.
- Anotación asistida de corpus emocionales: dado un conjunto de opciones predefinidas por el investigador (hasta 26), el modelo puede preetiquetar muestras multimodales para su revisión posterior por anotadores humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el checkpoint completo ocupa 9,5 GB en safetensors, por lo que se requiere al menos capacidad suficiente para cargar los pesos en precisión original más las activaciones. El autor advierte que las necesidades de memoria aumentan con la duración del audio, la longitud del vídeo y el tamaño del contexto.
- GPU validadas: NVIDIA RTX 4090 (entorno de referencia del release).
- GPU recomendadas: no disponibles más allá de la RTX 4090 validada; por tamaño del checkpoint, GPUs de 24 GB o más deberían ser suficientes para la carga en precisión original, aunque no se confirma en la información disponible.
- Cabe en GPU de consumo: sí, según la validación del autor en una RTX 4090.
- Opciones de despliegue: script `inference.py` incluido en el repositorio, con `transformers` en versión fijada, `trust_remote_code=True`, CUDA, Python 3.12 y FlashAttention 2.8.3. No se mencionan vLLM, llama.cpp, Ollama ni TGI; el uso de atención bidireccional y código personalizado hace improbable el despliegue con motores estándar sin adaptación.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| UEmo-D1 | 4.733.398.016 | no disponible | Reconocimiento multimodal de emociones por elección cerrada | qwen-research (no comercial) | Hugging Face (wudq/UEmo-D1) |
| Qwen/Qwen2.5-Omni-3B (modelo base) | no disponible en la información | no disponible | Modelo multimodal general (texto, visión, audio) | no disponible en la información | Hugging Face |
| Alternativas específicas de reconocimiento emocional multimodal | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la información proporcionada, por lo que no es posible establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Licencia restrictiva: la Qwen Research License limita el uso a investigación y evaluación no comercial; cualquier uso comercial requiere autorización del licenciante upstream (Qwen). Es un caveat crítico para producción.
- Salida limitada: el modelo solo devuelve la letra de una opción entre las proporcionadas; no genera explicaciones ni texto libre, lo que limita su uso a pipelines de clasificación.
- Idiomas: solo inglés y chino; no se garantiza comportamiento en otras lenguas.
- Riesgo de alucinación: al ser un modelo de decisión con opciones cerradas, el riesgo se traslada a la selección errónea de opción; las probabilidades calibradas ayudan a detectar casos de baja confianza, pero no eliminan el error.
- Sesgos: no se documentan sesgos conocidos en la información disponible; al derivar de Qwen2.5-Omni-3B, podría heredar sesgos del modelo base y de los datos de ajuste, no especificados.
- Dependencia de entorno: requiere versión fijada de `transformers`, FlashAttention 2.8.3, CUDA y `trust_remote_code=True`; cargar los pesos como un Qwen causal ordinario produce resultados incorrectos por la atención bidireccional.
- Procesamiento de vídeo: el script no extrae ni descarta silenciosamente el audio del vídeo; el usuario debe proporcionar el audio emparejado por posición, lo que añade un paso de preprocesado manual.
- Memoria: el consumo crece con la duración de audio, la longitud de vídeo y el tamaño del contexto; no se publican cifras de VRAM ni de latencia.
- Repositorio sin tracción: 0 descargas y 0 likes en el momento de la consulta, sin resultados de benchmarks publicados, lo que reduce la evidencia empírica disponible para evaluar su calidad.

## Enlaces

- Hugging Face: https://huggingface.co/wudq/UEmo-D1
- GitHub: https://github.com/wdqqdw/UEmo-D1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Omni-3B
- Licencia (archivo LICENSE del repositorio): https://huggingface.co/wudq/UEmo-D1/blob/main/LICENSE
- Atribución (archivo NOTICE del repositorio): https://huggingface.co/wudq/UEmo-D1/blob/main/NOTICE
