# tarun7r/indic-turn-detector

## Resumen

Indic Multilingual Turn Detector es un modelo de clasificación de texto publicado por tarun7r (desarrollador independiente, graduado en Ingeniería Eléctrica por el IIT Bombay) que predice si un usuario ha terminado de hablar en una conversación de voz. Se apoya en el modelo base Qwen/Qwen2.5-0.5B-Instruct, del que hereda la arquitectura transformer decoder-only (Qwen2), y añade una cabeza de clasificación escalar que emite P(fin de turno) sobre la última posición de token. El modelo tiene 494 millones de parámetros totales, de los cuales 179 millones son entrenables, y opera sobre transcripciones de texto (no audio) con una ventana de contexto de 256 tokens y hasta 6 mensajes recientes.

El problema que resuelve es el de la detección de fin de enunciado (EOU, end-of-utterance) en agentes de voz: los sistemas VAD detectan silencio, no significado, y cortan al usuario en pausas naturales, especialmente en lenguas de orden SOV donde el predicado llega al final. Este modelo puntúa el contenido semántico del texto transcrito y mantiene el turno abierto ante continuaciones colgantes, pausas de duda o dictado de datos estructurados. Es relevante ahora porque cubre nueve grupos lingüísticos (inglés, hinglish y siete lenguas índicas) y se presenta como reemplazo directo del turn detector de texto de LiveKit, que solo incluye hindi entre las lenguas índicas.

La licencia es Apache-2.0 y se distribuye en dos artefactos: un grafo ONNX en fp32 de unos 2 GB (el que se usa en inferencia y sobre el que se calibran los umbrales) y pesos PyTorch en safetensors del mismo tamaño aproximado. El repositorio ocupa 4,0 GB. La fecha de publicación indicada en la ficha de Hugging Face es 2026-11-07.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con cabeza de clasificación escalar sobre la última posición de token |
| Parametros totales | 494.033.665 (494M); 179M entrenables |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 256 tokens, con truncado por turnos completos; hasta 6 mensajes recientes |
| Tipos de cuantizacion | No disponible (se distribuye ONNX fp32 y safetensors; no se documentan variantes cuantizadas) |
| Idiomas soportados | en, hi, bn, gu, mr, pa, ta, te, más hinglish (hi-Latn); 9 grupos lingüísticos |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, fp32, ~2,0 GB) y safetensors (`model.safetensors`, ~2,0 GB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B-Instruct, un transformer decoder-only denso con `hidden_size` de 896 y `model_type: qwen2`, y le superpone una cabeza de clasificación (`eou_head.*`) que produce un escalar en la última posición del token. La entrada se construye con la plantilla de chat de Qwen2.5 (delimitadores `<|im_start|>` y `<|im_end|>`, sin prompt de sistema), dejando abierto el último mensaje del usuario sin token de cierre. El contexto se limita a 256 tokens y se trunca descartando turnos completos antes de cortar tokens parciales. Los tokens BOS/EOS corresponden a los de chat de Qwen (151643/151645).

El autor indica que el entrenamiento se realizó sobre diálogos estilo MultiWOZ, slots estilo TOP y negativos sintéticos de continuación y prefijo. No se detallan en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO. La innovación destacable no está en la arquitectura sino en el enfoque: sustituir la señal acústica del VAD por una puntuación semántica del texto transcrito, con umbrales por idioma calibrados en dos perfiles (`safe` y `balanced`) almacenados en `languages.json`. Los umbrales se calibran sobre puntuaciones fp32 y el grafo ONNX reproduce esas puntuaciones con un margen de 1e-6. La interfaz de E/S del ONNX coincide con la de livekit/turn-detector: `input_ids` de entrada y `prob` por posición de salida, usando la última posición.

## Capacidades

- Clasificación binaria de fin de turno: emite P(end of turn) a partir de la transcripción y el contexto conversacional.
- Detección semántica de continuaciones: mantiene el turno ante pausas de duda, continuaciones colgantes ("kyunki…", "lekin…", "కాబట్టి…", "કારણ કે…") y construcciones verbales finales propias de lenguas SOV.
- Manejo de datos estructurados dictados: retiene el turno mientras se recitan tarjetas, teléfonos o direcciones ("four eight two, seven zero…") hasta que el dato está completo.
- Multilingüismo: inglés, hinglish (hi-Latn) y siete lenguas índicas (hindi, telugu, tamil, marathi, bengalí, guyaratí, panyabí).
- Integración con agentes de voz: implementa la interfaz `MultilingualModel` mediante el helper `EOUTurnDetector`, como reemplazo directo del turn detector de texto de LiveKit.
- Inferencia sin estado: no procesa audio, no retiene transcripciones ni puntuaciones y no mantiene señal biométrica de ningún tipo.
- Umbrales configurables por idioma con perfiles `safe` y `balanced`.
- No se documentan en la información disponible capacidades de tool calling, function calling, razonamiento multi-paso, visión ni audio.

## Casos de uso

- Agentes de voz en tiempo real con STT: el detector recibe la transcripción del pipeline de reconocimiento de voz y decide si el usuario ha terminado; con 256 tokens de contexto y hasta 6 mensajes recientes puede evaluar el hilo inmediato de la conversación sin latencia de audio.
- Atención al cliente en lenguas índicas: permite gestionar conversaciones multi-turno en hindi, tamil, telugu, bengalí, marathi, guyaratí y panyabí, mercados que el turn detector de LiveKit no cubre (solo incluye hindi).
- Call centers con habla hinglish: al detectar el predicado final de construcciones SOV ("aapko kal phone… kar dunga"), evita cortes prematuros que el VAD provocaría en la pausa previa al verbo.
- Asistentes telefónicos para captura de datos: mantiene el turno mientras el usuario dicta números de tarjeta, teléfonos o direcciones, y solo cierra cuando el dato estructurado está completo.
- Sustitución del turn detector de LiveKit en pilas existentes: al implementar la interfaz `MultilingualModel` y compartir el formato de E/S ONNX (`input_ids` → `prob`), se puede integrar como drop-in en agentes construidos con el SDK de LiveKit.
- Asistencia a agentes humanos en centros de contacto: el score de fin de turno puede alimentar la interfaz del operador para indicar cuándo el cliente ha terminado de hablar, reduciendo interrupciones.
- Despliegue en infraestructura con CPU: el grafo ONNX fp32 de ~2 GB y los 494M de parámetros permiten ejecución sin GPU dedicada en entornos de baja concurrencia.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente):

| Tarea | Dataset | Metrica | Valor |
|---|---|---|---|
| end-of-utterance | processed_v5 validation (wb_clean), interno | mean TPR (≥4 words, perfil balanced) | 0,913 |
| end-of-utterance | processed_v5 validation (wb_clean), interno | mean per-language AUC | 0,967 |

No se han publicado en la información disponible resultados comparativos con otros modelos de detección de fin de turno sobre los mismos conjuntos.

## Requisitos de hardware

- VRAM estimada: el grafo ONNX fp32 ocupa ~2,0 GB, por lo que la inferencia requiere del orden de 2-3 GB de memoria si se ejecuta en GPU; los pesos safetensors ocupan otro ~2,0 GB si se cargan en PyTorch.
- GPU recomendadas: no se especifican en la información disponible; por tamaño, cualquier GPU con 4 GB o más de VRAM es suficiente (por ejemplo, RTX 3050 en adelante).
- Cabe en GPU de consumo: sí, con 494M de parámetros y ~2 GB de pesos en fp32.
- Opciones de despliegue: ONNX Runtime para el grafo `model.onnx`; la librería transformers para los pesos PyTorch; el autor no documenta soporte explícito de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| indic-turn-detector (este modelo) | 494M | 256 tokens, 6 mensajes | en, hinglish y 7 lenguas índicas | Apache-2.0 | Texto; umbrales por idioma; ONNX fp32 |
| livekit/turn-detector (v0.4.1-intl) | No disponible | No disponible | Incluye hindi (entre las índicas) | No disponible | Mismo formato de E/S ONNX; base y valores de config equivalentes según el autor |
| LiveKit Turn Detector v1 (audio) | No disponible | No disponible | No disponible | No disponible | Basado en audio; 9,9 % de falsos cortes a 300 ms en eot-bench |

## Limitaciones y advertencias

- Solo texto: no procesa audio; depende de que el pipeline de STT produzca transcripciones correctas. Errores de reconocimiento degradan directamente la predicción.
- No es un sistema de identificación de hablante: no contiene biometría de voz ni embeddings de identidad.
- Contexto limitado a 256 tokens y 6 mensajes; conversaciones con historial más largo se truncan por turnos completos, lo que puede eliminar información relevante.
- Los umbrales están calibrados por idioma y perfil (`safe`/`balanced`); usar umbrales por defecto en un idioma no contemplado puede producir cortes erróneos.
- Los benchmarks son internos y no verificados (`verified: false`); no hay evaluación independiente publicada en la información disponible.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada; al ser un clasificador escalar, el riesgo se manifiesta como falsos positivos o negativos de fin de turno, no como texto generado.
- Licencia Apache-2.0: permite uso comercial, pero el autor no documenta garantías ni condiciones adicionales más allá de la licencia estándar.
- El modelo base Qwen2.5-0.5B-Instruct puede arrastrar sesgos de sus datos de preentrenamiento; no se detallan en la información disponible.
- La fecha de creación indicada (2026-11-07) y el estado del proyecto (0 descargas, 0 likes en el momento de la consulta) sugieren un modelo reciente y sin validación comunitaria amplia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarun7r/indic-turn-detector
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Turn detector de LiveKit (referencia de integración): https://huggingface.co/livekit/turn-detector/blob/v0.4.1-intl/config.json
- Documentación de LiveKit sobre turn detection: https://docs.livekit.io/agents/logic/turns/turn-detector/
- Blog de LiveKit sobre detección de fin de turno: https://livekit.io/blog/solving-end-of-turn-detection
- Dataset eot-bench de LiveKit: https://huggingface.co/datasets/livekit/eot-bench-data
- Perfil de GitHub del autor: https://github.com/tarun7r
- Perfil de Hugging Face del autor: https://huggingface.co/tarun7r/models
