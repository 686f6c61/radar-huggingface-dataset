# twangodev/Ming-3.0-audio-tiny-NVFP4

## Resumen

Ming 3.0 Audio Tiny NVFP4 es una cuantización comunitaria, realizada por el usuario twangodev, del modelo Ming 3.0 Audio Tiny de inclusionAI. Se trata de un modelo de comprensión y razonamiento de audio que acepta como entrada tanto audio como instrucciones en texto, y está orientado a tareas de reconocimiento de voz, respuesta a preguntas habladas, comprensión de audio y razonamiento en inglés y chino. La cuantización se ha preparado con NVIDIA Model Optimizer en formato NVFP4 (punto flotante de 4 bits), pensado específicamente para las GPU NVIDIA Blackwell.

El modelo base es un mixture-of-experts (MoE) con 9.3B de parámetros totales y 2.7B activados por paso de inferencia. Esta versión cuantiza los expertos enrutados del "Thinker" MoE, conservando intactos los componentes de audio originales, el "Talker" y el AudioVAE. El resultado es un modelo de 6.45B de parámetros en safetensors (13.8 GB de repositorio) capaz de mantener un rendimiento razonable en benchmarks de audio con una huella de memoria muy reducida.

Su relevancia actual radica en que los formatos NVFP4 de 4 bits son de los primeros aprovechables en hardware de consumo y datacenter de última generación (Blackwell), y en que los modelos de audio MoE cuantizados son todavía escasos. Con licencia MIT, resulta interesante para despliegues de ASR y análisis de audio con bajo coste de cómputo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing_moe_v3_audio (MoE con Thinker, Talker y AudioVAE) |
| Parametros totales | 6.455.383.840 (cuantizado); 9.3B el modelo base original |
| Parametros activos | 2.7B por paso de inferencia (modelo base MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 (4 bits, NVIDIA Model Optimizer); expertos enrutados del MoE |
| Idiomas soportados | inglés, chino |
| Licencia | MIT |
| Formato de pesos | safetensors, onnx |

## Arquitectura y entrenamiento

El modelo base, Ming 3.0 Audio Tiny de inclusionAI, sigue la arquitectura bailing_moe_v3_audio: un mixture-of-experts en el que un "Thinker" MoE realiza el razonamiento y un "Talker" junto con un AudioVAE gestionan los componentes de audio. En esta cuantización comunitaria se han cuantizado únicamente los expertos enrutados del Thinker en formato NVFP4 mediante NVIDIA Model Optimizer, mientras que los componentes de audio, el Talker y el AudioVAE se conservan sin cuantizar. Con 2.7B de parámetros activados por token, el modelo ofrece la relación capacidad/coste típica de los MoE pequeños.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO en la información proporcionada; estos datos corresponden al modelo base de inclusionAI y no están detallados aquí.

## Capacidades

- Reconocimiento automático de voz (ASR / speech-to-text) en inglés y chino
- Respuesta a preguntas sobre audio hablado (spoken question answering)
- Comprensión de audio (audio understanding) más allá de la transcripción
- Razonamiento sobre contenido de audio (audio reasoning)
- Entrada mixta de audio y texto (pipeline audio-text-to-text)
- Carácter conversacional, apto para interacción multi-turno
- Uso con custom_code en HuggingFace (inference deshabilitada en el Hub)

No se dispone de información sobre soporte de tool calling, visión, entrada de audio generativo (texto a voz) ni otros tipos de modalidad en la documentación proporcionada.

## Casos de uso

- Transcripción de reuniones y llamadas en inglés y chino: el modelo puede actuar como ASR con WER del 3,44 % en FLEURS inglés, adecuado para generar actas o subtítulos de grabaciones de voz.
- Asistentes de voz conversacionales: gracias a su pipeline audio-text-to-text y su carácter conversacional, puede integrarse en agentes que escuchen preguntas habladas y respondan con texto.
- Análisis semántico de contenido de audio: con una precisión del 77,3 % en MMAU test-mini y del 65,2 % en MMAR, puede clasificar, describir y razonar sobre clips de audio (música, sonidos ambientales, discurso).
- Búsqueda y indexación de bibliotecas de audio: su comprensión de audio permite etiquetar y catalogar automáticamente grandes volúmenes de grabaciones para sistemas de recuperación.
- Moderación de contenido de audio: puede usarse para detectar y describir contenido en flujos de audio de plataformas, aprovechando el razonamiento sobre audio en lugar de solo transcribirlo.
- Despliegue en GPU Blackwell con bajo coste: la cuantización NVFP4 reduce la memoria necesaria, permitiendo servir el modelo en menos VRAM que el original en FP16/BF16.
- Evaluación e investigación de cuantización extrema: al ser una cuantización comunitaria documentada con protocolos públicos, sirve como referencia para estudiar el impacto de NVFP4 en modelos de audio MoE.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo mediante evaluación local full-split con post-hoc scoring (no verificados por terceros):

| Benchmark | Tarea | Metrica | Valor |
|---|---|---|---|
| FLEURS English (test, 647 ejemplos) | ASR | WER | 3,44 % |
| FLEURS Chinese (test, 945 ejemplos) | ASR | CER | 3,43 % |
| MMAR (1000 ejemplos) | Comprensión de audio (multiple choice) | Accuracy | 65,2 % |
| MMAU test-mini (1000 ejemplos) | Comprensión de audio (multiple choice) | Accuracy | 77,3 % |
| MMSU (5000 ejemplos) | Comprensión de audio (multiple choice) | Accuracy | 67,14 % |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio ocupa 13,8 GB en safetensors cuantizados a 4 bits, por lo que una GPU con al menos 16 GB de VRAM debería ser suficiente para alojar los pesos (sin contar activaciones ni KV cache).
- GPU recomendadas: GPU NVIDIA Blackwell (arquitectura para la que está diseñado el formato NVFP4, como RTX 5090 o B200). El formato NVFP4 no está soportado de forma nativa en arquitecturas anteriores (Ampere, Ada, Hopper), donde puede requerir emulación o dequantización.
- Cabe en GPU de consumo: sí, en teoría, en una RTX 5090 (32 GB) con holgura; en GPUs de 16 GB el margen sería ajustado. No hay confirmación oficial.
- Opciones de despliegue: no se detallan en la model card. El modelo usa custom_code y la librería Model Optimizer de NVIDIA; no hay evidencia de soporte directo en vLLM, llama.cpp, Ollama o TGI para este checkpoint concreto. La inferencia está deshabilitada en el Hub (inference: false).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Cuantizacion | Licencia | Idiomas |
|---|---|---|---|---|---|
| Ming 3.0 Audio Tiny NVFP4 (este) | 6.45B (9.3B base, 2.7B activos) | MoE audio (bailing_moe_v3_audio) | NVFP4 (4 bits) | MIT | en, zh |
| inclusionAI/Ming-3.0-audio-tiny (base) | 9.3B (2.7B activos) | MoE audio | BF16 (sin cuantizar) | no disponible | en, zh |
| Qwen2-Audio-7B-Instruct | ~8.4B | Transformer audio-texto | BF16 y variantes comunitarias | no disponible | multilingue |
| Qwen2.5-Omni-7B | ~7B | Omni-modal (Thinker-Talker) | BF16 y variantes comunitarias | no disponible | multilingue |

Ming 3.0 Audio Tiny NVFP4 se diferencia de las alternativas de Qwen en que es un MoE con activación escasa (2.7B activos) y en que es de las pocas versiones NVFP4 disponibles de un modelo de audio, lo que lo hace especialmente relevante en hardware Blackwell.

## Limitaciones y advertencias

- Los benchmarks son declarados por el autor del cuantizado, con protocolo local y post-selection, y están marcados como no verificados; los resultados podrían no ser directamente comparables con evaluaciones oficiales.
- Solo soporta inglés y chino; no hay soporte documentado para español ni otros idiomas.
- La cuantización NVFP4 está orientada a GPU Blackwell; en arquitecturas NVIDIA anteriores puede no funcionar o requerir dequantización, perdiendo parte del beneficio de memoria.
- Al ser una cuantización de los expertos enrutados, existe un riesgo de degradación respecto al modelo base en FP16 que no se ha cuantificado con comparativas A/B publicadas en la información disponible.
- Usa custom_code en HuggingFace, lo que exige confiar en el código del repositorio al cargarlo y complica su integración en entornos con ejecución remota restringida.
- La longitud de contexto, el soporte de tool calling y los requisitos exactos de despliegue no están documentados, lo que dificulta la planificación de producción.
- No se dispone de información sobre sesgos conocidos ni sobre tasas de alucinación específicas del modelo; como todo modelo de audio-texto, puede transcribir o describir incorrectamente audio ruidoso o ambiguo.
- La licencia MIT es permisiva y permite uso comercial sin restricciones significativas.

## Enlaces

- Modelo cuantizado: https://huggingface.co/twangodev/Ming-3.0-audio-tiny-NVFP4
- Modelo base: https://huggingface.co/inclusionAI/Ming-3.0-audio-tiny
- Proyecto Ming (GitHub): https://github.com/inclusionAI/Ming-3.0-audio-flash
- Repositorio GitHub de la cuantización: https://github.com/twangodev/ming3-nvfp4
- NVIDIA Model Optimizer: https://github.com/NVIDIA/Model-Optimizer
- Resultados de evaluación: https://huggingface.co/twangodev/Ming-3.0-audio-tiny-NVFP4/blob/main/evals/README.md
- Metodología de evaluación: https://huggingface.co/twangodev/Ming-3.0-audio-tiny-NVFP4/blob/main/evals/full-suite/methods.md
