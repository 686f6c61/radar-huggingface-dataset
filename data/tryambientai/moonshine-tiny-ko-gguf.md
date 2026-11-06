# tryambientai/moonshine-tiny-ko-gguf

## Resumen

moonshine-tiny-ko-gguf es la conversión a formato GGUF del modelo de reconocimiento automático de voz (ASR) UsefulSensors/moonshine-tiny-ko, publicada por tryambientai para su uso con la librería transcribe.cpp. Se trata de un modelo encoder-decoder de tipo transformer con 27.092.736 parámetros, especializado exclusivamente en transcripción de audio en coreano, que forma parte de la suite "Flavors of Moonshine" de Moonshine AI (anteriormente Useful Sensors), orientada a lenguas infrarrepresentadas y a dispositivos con recursos limitados.

El modelo consume PCM crudo a 16 kHz directamente mediante un stem de tres capas Conv1d, sin STFT ni banco de filtros mel, y emite únicamente el texto transcrito. No realiza traducción, detección de idioma ni marcas temporales, y no soporta streaming. Su interés principal radica en que ofrece ASR coreano en un paquete de 34 MB (Q8_0) que puede ejecutarse en CPU y GPU de consumo, con una tasa de error de caracteres (CER) de en torno al 8,97 % sobre el split de test de FLEURS-ko.

La relevancia de esta ficha es doble: por un lado, documenta una cuantización GGUF lista para producción con métricas de validación numérica frente a la referencia en Transformers; por otro, ejemplifica el patrón de despliegue de modelos ASR pequeños en entornos edge mediante transcribe.cpp, una alternativa en C++ a las pilas habituales de Python.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Moonshine tiny), stem Conv1d de 3 capas sobre PCM crudo a 16 kHz, sin STFT ni mel |
| Parametros totales | 27.092.736 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (max_length de decodificación: 192 tokens) |
| Tipos de cuantizacion | F32, F16, Q8_0 (GGUF) |
| Idiomas soportados | coreano (ko) únicamente |
| Licencia | MIT |
| Formato de pesos | GGUF (librería transcribe.cpp); pesos originales en safetensors en el modelo base |
| Entrada de audio | PCM mono a 16 kHz |
| Salida | solo transcripción (sin traducción, sin detección de idioma, sin timestamps) |
| Streaming | no |
| Tamaño de los ficheros | F32: 105 MB; F16: 57 MB; Q8_0: 34 MB |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Moonshine tiny: un transformer encoder-decoder de 27M parámetros en el que el encoder procesa la forma de onda directamente a través de un stem convolucional de tres capas Conv1d, evitando el preprocesado clásico de STFT y banco de filtros mel que emplea Whisper. Esta decisión reduce el coste computacional del frontend y permite adaptar la longitud de entrada a la duración real del audio, lo que se traduce en menor latencia en secuencias cortas. El decoder genera la transcripción de forma autorregresiva con decodificación greedy (num_beams=1, max_length=192), ajustándose a la configuración de generación del modelo original.

El modelo base UsefulSensors/moonshine-tiny-ko es un fine-tuning de Moonshine tiny sobre coreano, desarrollado dentro de la suite "Flavors of Moonshine" descrita en el paper arXiv:2509.02523. La model card no detalla el volumen de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO; esa información debe consultarse en el paper. La conversión GGUF se realizó a partir del commit 80995f0 del modelo base (fijado el 2026-05-12) y se validó contra la referencia en Transformers en el commit 90bf720 de transcribe.cpp el mismo día, lo que aporta trazabilidad reproducible a la cuantización.

## Capacidades

- Transcripción de voz a texto en coreano a partir de audio PCM mono a 16 kHz.
- Procesamiento de forma de onda cruda sin necesidad de calcular características mel ni STFT.
- Ejecución en CPU y GPU mediante transcribe.cpp, con backend Metal y Vulkan además de CPU.
- Cuantización Q8_0 con deriva numérica mínima respecto a F16 (típicamente por debajo de 0,1 puntos porcentuales de CER).
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento de agente.
- No soporta traducción, detección de idioma ni marcas temporales.
- No soporta streaming: requiere el audio completo por adelantado.
- Capacidad multilingüe limitada a un único idioma (coreano).

## Casos de uso

- Subtitulado de contenido audiovisual en coreano: el modelo transcribe audio previamente extraído y remuestreado a 16 kHz mono con ffmpeg, y el texto resultante se alinea posteriormente con herramientas externas, ya que el modelo no genera timestamps.
- Transcripción de reuniones y notas de voz en coreano: al ejecutarse en CPU con un factor de tiempo real de 45,5 en un Ryzen 4750U, puede procesar grabaciones completas en local sin depender de servicios en la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Procesamiento por lotes de archivos de audio en servidores sin GPU: la variante Q8_0 de 34 MB permite desplegar el modelo en contenedores ligeros y ejecutar la transcripción con transcribe-cli sobre directorios completos.
- Aplicaciones de accesibilidad en dispositivos edge: con 27M parámetros y 34 MB en Q8_0, el modelo cabe en dispositivos embebidos y en GPUs integradas, habilitando subtitulado en tiempo casi real de conversaciones presenciales en coreano.
- Investigación en ASR para lenguas infrarrepresentadas: sirve como punto de partida o baseline reproducible para experimentos de fine-tuning y evaluación sobre FLEURS-ko, con métricas de referencia publicadas (CER 8,97 % en F32 y F16, 8,98 % en Q8_0).
- Integración en pipelines de C++ existentes: al no requerir runtime de Python, transcribe.cpp permite incorporar la transcripción directamente en aplicaciones nativas, herramientas de escritorio o sistemas embebidos con dependencias mínimas.
- Filtrado y moderación de audio en coreano: la transcripción previa permite aplicar búsqueda por palabras clave o clasificadores de texto sobre el contenido hablado en plataformas de contenido generado por usuarios.

## Benchmarks y rendimiento

CER sobre el split de test de FLEURS-ko (382 enunciados), decodificación greedy con num_beams=1 y max_length=192:

| Cuantizacion | CER FLEURS-ko | Tamaño |
|---|---:|---:|
| F32 (transcribe.cpp) | 8,97 % | 105 MB |
| F16 (transcribe.cpp) | 8,97 % | 57 MB |
| Q8_0 (transcribe.cpp) | 8,98 % | 34 MB |
| Referencia Transformers F32 (MPS) | 8,99 % | — |

Factor de tiempo real (RTF) medido por el autor de la conversión:

| Plataforma | Backend | RTF |
|---|---|---:|
| Apple M4 Max | Metal | 127 |
| Apple M4 Max | CPU | 153,5 |
| AMD Ryzen 4750U | Vulkan | 56 |
| AMD Ryzen 4750U | CPU | 45,5 |

No se han publicado en la información disponible resultados de benchmarks estándar de ASR adicionales (por ejemplo WER sobre otros conjuntos) ni comparaciones directas con Whisper Tiny en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todas las cuantizaciones; el fichero Q8_0 ocupa 34 MB y F32 105 MB, por lo que el modelo completo cabe holgadamente en cualquier GPU de consumo.
- GPU recomendadas: no se requieren GPU dedicadas; el modelo está pensado para ejecución en CPU y en aceleradores integrados. Funciona en Apple Silicon con Metal y en GPUs AMD/Intel con Vulkan.
- Cabe en cualquier GPU de consumo (RTX 4090, RTX 3060, GTX 1650, iGPU) y en dispositivos embebidos; el cuello de botella es el ancho de banda de memoria y el coste del frontend convolucional, no la capacidad de VRAM.
- Opciones de despliegue: transcribe.cpp (transcribe-cli) con backends CPU, Metal y Vulkan. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que estos están orientados a modelos de lenguaje y no a ASR encoder-decoder con entrada de audio.
- Latencia y throughput: RTF de 127 en Metal sobre M4 Max, 153,5 en CPU sobre M4 Max, 56 en Vulkan sobre Ryzen 4750U y 45,5 en CPU sobre Ryzen 4750U. Un RTF de 45,5 implica procesar aproximadamente 45,5 segundos de audio por segundo de cómputo en ese hardware.
- Requisito de entrada: audio mono a 16 kHz; es necesario remuestrear y convertir a mono previamente con ffmpeg u otra herramienta.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Contexto / entrada | Licencia | Formato | CER FLEURS-ko |
|---|---:|---|---|---|---|---:|
| moonshine-tiny-ko-gguf (este) | 27,1M | solo coreano | PCM 16 kHz, max_length 192 | MIT | GGUF | 8,97 % (F32/F16), 8,98 % (Q8_0) |
| UsefulSensors/moonshine-tiny-ko (base) | 27,1M | solo coreano | PCM 16 kHz | MIT | safetensors | 8,99 % (referencia Transformers F32) |
| Moonshine tiny (original, inglés) | ~27M | inglés | PCM 16 kHz | MIT | safetensors | no disponible |
| Whisper Tiny | ~39M | multilingüe | mel spectrogram, ventanas de 30 s | MIT | safetensors, GGUF (vía terceros) | no disponible en esta ficha |

La comparación con Whisper Tiny se limita a la arquitectura y el tamaño, ya que la model card indica que los modelos Moonshine superan a Whisper Tiny de tamaño comparable, pero no se aportan cifras concretas en la información disponible. La ventaja diferencial de esta conversión GGUF es la disponibilidad de un binario C++ con backends Metal y Vulkan y una deriva de cuantización documentada frente a la referencia en Transformers.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la información disponible; al ser un modelo entrenado sobre coreano, puede presentar peor rendimiento en variedades dialectales o en habla con acento no estándar.
- Riesgo de alucinación: como todo modelo ASR generativo, puede producir texto plausible que no corresponde al audio, especialmente con ruido de fondo, solapamiento de hablantes o audio de baja calidad.
- Limitación de idioma: solo transcribe coreano; no traduce ni detecta el idioma de entrada, por lo que audio en otro idioma producirá salidas incorrectas sin aviso.
- Sin marcas temporales: no genera timestamps, lo que impide alineación directa con vídeo o subtítulos sin herramientas externas.
- Sin streaming: requiere disponer del audio completo antes de transcribir, lo que limita su uso en aplicaciones de dictado en vivo.
- Longitud de decodificación limitada: max_length=192 tokens; audios muy largos pueden truncarse si no se segmentan previamente.
- Restricciones de licencia: licencia MIT heredada del modelo base, que permite uso comercial; deben consultarse los términos completos en la model card original de UsefulSensors.
- Requisito de formato de audio: entrada obligatoria en PCM mono a 16 kHz; no se aceptan directamente MP3, estéreo ni otras frecuencias de muestreo sin conversión previa.
- Madurez del ecosistema: transcribe.cpp es una librería específica con menos adopción que las pilas basadas en Python; el repositorio de Hugging Face registra 0 descargas y 0 likes en el momento de la consulta, lo que refleja una adopción aún muy limitada.
- Validación acotada: las métricas se limitan a FLEURS-ko (382 enunciados) y a la comparación con la referencia en Transformers; no hay evaluación sobre dominios como llamadas telefónicas, audio médico o habla espontánea.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tryambientai/moonshine-tiny-ko-gguf
- Modelo base: https://huggingface.co/UsefulSensors/moonshine-tiny-ko
- Commit del modelo base utilizado: https://huggingface.co/UsefulSensors/moonshine-tiny-ko/commit/80995f0
- Paper "Flavors of Moonshine": https://huggingface.co/papers/2509.02523
- Paper "Model Cards for Model Reporting": https://arxiv.org/abs/1810.03993
- Repositorio Moonshine: https://github.com/moonshine-ai/moonshine
- Instrucciones de instalación de Moonshine: https://github.com/usefulsensors/moonshine/blob/main/README.md
- transcribe.cpp: https://github.com/handy-computer/transcribe.cpp
- Documentación de modelos Moonshine en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/blob/main/docs/models/moonshine.md
- Commit de validación en transcribe.cpp: https://github.com/handy-computer/transcribe.cpp/tree/90bf720
- Descarga F32: https://huggingface.co/handy-computer/moonshine-tiny-ko-gguf/resolve/main/moonshine-tiny-ko-F32.gguf
- Descarga F16: https://huggingface.co/handy-computer/moonshine-tiny-ko-gguf/resolve/main/moonshine-tiny-ko-F16.gguf
- Descarga Q8_0: https://huggingface.co/handy-computer/moonshine-tiny-ko-gguf/resolve/main/moonshine-tiny-ko-Q8_0.gguf
