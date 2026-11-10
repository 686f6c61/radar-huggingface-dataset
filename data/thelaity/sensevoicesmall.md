# TheLaity/SenseVoiceSmall

## Resumen

SenseVoiceSmall es un modelo fundacional de comprensión del habla desarrollado por FunAudioLLM (equipo de Alibaba, distribuido a través del ecosistema FunASR) y reempaquetado en este repositorio por el usuario TheLaity. Resuelve de forma conjunta cuatro tareas sobre audio: reconocimiento automático del habla (ASR), identificación del idioma hablado (LID), reconocimiento de emociones (SER) y detección de eventos acústicos (AED), todo ello en un único modelo no autorregresivo.

La relevancia principal del modelo reside en su arquitectura de inferencia no autorregresiva: procesa 10 segundos de audio en aproximadamente 70 ms, lo que supone unas 15 veces menos latencia que Whisper-Large. Está entrenado con más de 400 000 horas de datos y cubre más de 50 idiomas, con un rendimiento especialmente competitivo en chino mandarín y cantonés frente a Whisper en los conjuntos de referencia AISHELL-1, AISHELL-2, Wenetspeech, LibriSpeech y Common Voice.

El repositorio ocupa 0,9 GB y se distribuye bajo la licencia del proyecto FunASR (licencia propia, no OSI), con pesos consumibles desde la librería `funasr` y también mediante binarios GGUF/llama.cpp para despliegue en CPU y dispositivos edge.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder no autorregresivo (end-to-end, familia SenseVoice/FunASR) |
| Parámetros totales | no disponible (la variante se denomina "Small"; el repositorio pesa 0,9 GB) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa ventanas de audio; en benchmarks se cita el procesamiento de segmentos de 10 s) |
| Tipos de cuantización | GGUF (runtime llama.cpp); exportación ONNX y libtorch; cuantizaciones adicionales no detalladas |
| Idiomas soportados | zh, en, ja, ko, yue y más de 50 idiomas en entrenamiento (multilingual) |
| Licencia | model-license (licencia propia de FunASR, enlazada a MODEL_LICENSE del repositorio modelscope/FunASR) |
| Formato de pesos | safetensors/PyTorch (librería `funasr`), ONNX, libtorch, GGUF |

## Arquitectura y entrenamiento

SenseVoiceSmall emplea un esquema encoder end-to-end no autorregresivo: en lugar de generar tokens de forma secuencial como un decoder autoregresivo, predice la salida en un solo paso sobre la representación codificada del audio. Esta decisión de diseño es la que explica su baja latencia (70 ms por cada 10 s de audio) y su idoneidad para streaming y despliegue en tiempo real. El modelo integra en una misma cabeza de predicción las tareas de ASR, LID, SER y AED, de modo que una única pasada produce transcripción, idioma detectado, emoción y eventos acústicos.

El entrenamiento utilizó más de 400 000 horas de audio y cubre más de 50 idiomas, con foco declarado en mandarín, cantonés, inglés, japonés y coreano. La model card menciona scripts y estrategias de fine-tuning para abordar problemas de cola larga según el dominio de negocio, pero no detalla la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO (no disponible). Tampoco se especifican innovaciones adicionales como decodificación especulativa o atención lineal; la innovación central documentada es el paradigma no autorregresivo y la multitarea unificada.

## Capacidades

- Reconocimiento automático del habla multilingüe en zh, en, ja, ko, yue y más de 50 idiomas.
- Identificación automática del idioma hablado (LID) en la misma pasada de inferencia.
- Reconocimiento de emociones del habla (SER), con resultados que el autor declara iguales o superiores a los mejores modelos específicos en datos de test.
- Detección de eventos acústicos (AED): música de fondo, aplausos, risas, llanto, tos y estornudos, entre otros eventos de interacción humano-máquina.
- Transcripción enriquecida: la salida combina texto, emoción y eventos en una sola estructura.
- Inferencia de baja latencia apta para tiempo real (70 ms por 10 s de audio).
- Fine-tuning accesible mediante scripts del proyecto para adaptación a dominios con cola larga.
- Despliegue como servicio con soporte de peticiones concurrentes y clientes en Python, C++, HTML, Java y C#.
- Ejecución en CPU y edge mediante binarios GGUF/llama.cpp con VAD integrado.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso basado en agentes (no disponible).

## Casos de uso

- Subtitulado y transcripción en tiempo real: la inferencia no autorregresiva (70 ms por 10 s de audio) permite generar subtítulos con latencia muy baja en retransmisiones, reuniones o videollamadas, sin necesidad de GPU dedicada si se usa el runtime GGUF.
- Atención al cliente con análisis de emoción: además de transcribir, el modelo etiqueta la emoción del interlocutor, lo que permite enrutar llamadas enfadadas a agentes humanos o priorizar incidencias en un contact center.
- Moderación y análisis de contenido audiovisual: la detección de eventos acústicos (risas, llanto, gritos contextualizados como eventos, música) facilita el filtrado automático y el etiquetado de grandes volúmenes de audio.
- Asistentes de voz multilingües: la cobertura de zh, en, ja, ko y yue junto con la identificación de idioma integrada permite construir asistentes que atienden a usuarios en su propio idioma sin un clasificador previo separado.
- Transcripción de reuniones con diarización: combinado con las herramientas de VAD, puntuación y diarización del ecosistema FunASR, el modelo sirve como motor ASR dentro de un pipeline completo de actas y resúmenes.
- Despliegue en dispositivos edge y sistemas embebidos: los binarios GGUF/llama.cpp con VAD integrado permiten ejecutar el reconocimiento en CPU, sin Python ni GPU, en kioscos, grabadoras o equipos de campo.
- Generación de datos etiquetados para entrenamiento: la salida conjunta de transcripción, idioma y emoción puede usarse para anotar corpus de audio a gran escala de forma automática.

## Benchmarks y rendimiento

La model card incluye comparaciones gráficas frente a Whisper en AISHELL-1, AISHELL-2, Wenetspeech, LibriSpeech y Common Voice, y afirma ventaja del modelo en chino y cantonés, pero no se proporcionan los valores numéricos en el texto disponible. Del mismo modo, se menciona una evaluación propia de reconocimiento de emociones sin cifras publicadas.

| Benchmark | SenseVoiceSmall | Referencia (Whisper) |
|---|---|---|
| AISHELL-1 | no disponible (gráfico, sin cifras) | no disponible |
| AISHELL-2 | no disponible (gráfico, sin cifras) | no disponible |
| Wenetspeech | no disponible (gráfico, sin cifras) | no disponible |
| LibriSpeech | no disponible (gráfico, sin cifras) | no disponible |
| Common Voice | no disponible (gráfico, sin cifras) | no disponible |
| Latencia (10 s de audio) | 70 ms | ~15 veces mayor según el autor |

No se han publicado resultados numéricos de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precisión; el repositorio de pesos ocupa 0,9 GB, por lo que la inferencia en FP32/FP16 cabe holgadamente en GPUs de consumo.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo está pensado para funcionar también sin GPU.
- CPU y edge: soportado de forma nativa mediante binarios GGUF/llama.cpp con VAD integrado, sin necesidad de Python ni GPU.
- Opciones de despliegue: librería `funasr` (PyTorch), `funasr-onnx` (ONNX), `funasr-torch` (libtorch), runtime llama.cpp/GGUF, y pipeline de servicio con clientes en Python, C++, HTML, Java y C#.
- Latencia y throughput: 70 ms para 10 s de audio en la configuración de referencia del autor; el pipeline de servicio admite peticiones concurrentes, aunque no se publican cifras de throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Tareas | Latencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SenseVoiceSmall | no disponible (repo 0,9 GB) | zh, en, ja, ko, yue, +50 | ASR, LID, SER, AED | 70 ms / 10 s audio | model-license (FunASR) | HF, ModelScope, GGUF |
| Whisper-Large | no disponible en la información | multilingüe | ASR, traducción | ~15 veces mayor según el autor | MIT (según el proyecto Whisper) | HF, múltiples runtimes |
| Whisper (variantes Small) | no disponible en la información | multilingüe | ASR, traducción | no disponible | MIT (según el proyecto Whisper) | HF, múltiples runtimes |

La comparación se limita a lo declarado en la model card: SenseVoiceSmall supera a Whisper en reconocimiento de chino y cantonés y es sustancialmente más rápido, además de añadir emoción y eventos acústicos que Whisper no cubre. No se dispone de cifras de parámetros ni de WER comparativos en el material proporcionado.

## Limitaciones y advertencias

- La licencia es propia (model-license de FunASR), no una licencia OSI estándar; es imprescindible revisar los términos antes de un uso comercial.
- No se publican cifras numéricas de benchmarks en la información disponible, solo gráficos; la afirmación de superioridad frente a Whisper debe validarse en el dominio propio.
- El rendimiento destacado se concentra en chino y cantonés; para otros idiomas el propio autor no reclama ventaja frente a Whisper.
- Riesgo de alucinación y errores en audio con ruido, solapamiento de hablantes o acentos no representados en el corpus de entrenamiento.
- La detección de emociones y eventos acústicos es probabilística y puede producir falsos positivos; no debe usarse como única señal en decisiones sensibles.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso; no es un modelo de lenguaje general.
- Este repositorio concreto (TheLaity/SenseVoiceSmall) tiene 0 descargas y 0 likes, y fue creado en 2026; para producción conviene preferir el repositorio oficial FunAudioLLM/SenseVoiceSmall.
- No se detalla la composición del dataset de entrenamiento, lo que dificulta evaluar sesgos demográficos o lingüísticos.

## Enlaces

- Repositorio de Hugging Face: https://huggingface.co/TheLaity/SenseVoiceSmall
- Repositorio oficial en Hugging Face: https://huggingface.co/FunAudioLLM/SenseVoiceSmall
- Repositorio oficial en ModelScope: https://www.modelscope.cn/models/iic/SenseVoiceSmall
- Repositorio GitHub de SenseVoice: https://github.com/FunAudioLLM/SenseVoice
- Repositorio GitHub de FunASR: https://github.com/modelscope/FunASR
- Repositorio GitHub de Fun-ASR: https://github.com/FunAudioLLM/Fun-ASR
- Repositorio GitHub de FunClip: https://github.com/modelscope/FunClip
- Página del proyecto: https://fun-audio-llm.github.io/
- Demo en ModelScope: https://www.modelscope.cn/studios/iic/SenseVoice
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/FunAudioLLM/SenseVoice
- Pesos GGUF: https://huggingface.co/FunAudioLLM/SenseVoiceSmall-GGUF
- Runtime llama.cpp de FunASR: https://github.com/modelscope/FunASR/tree/main/runtime/llama.cpp
- Guía de despliegue GGUF: https://www.funasr.com/en/blog/funasr-llama-cpp-whisper-cpp-alternative.html
- Licencia del modelo: https://github.com/modelscope/FunASR/blob/main/MODEL_LICENSE
- Exportación ONNX: https://github.com/FunAudioLLM/SenseVoice/demo_onnx.py
- Exportación libtorch: https://github.com/FunAudioLLM/SenseVoice/demo_libtorch.py
- Paquete PyPI funasr-onnx: https://pypi.org/project/funasr-onnx/
- Paquete PyPI funasr-torch: https://pypi.org/project/funasr-torch/
