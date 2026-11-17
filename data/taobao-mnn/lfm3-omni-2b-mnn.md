# taobao-mnn/LFM3-Omni-2B-MNN

## Resumen

LFM3-Omni-2B-MNN es una conversión al motor de inferencia MNN del modelo LiquidAI/LFM3-Omni-2B, desarrollada por el equipo taobao-mnn (vinculado a Alibaba). Se trata de una versión cuantizada del modelo omni-modal original de Liquid AI, empaquetada en el formato propietario de MNN para su ejecución en CPU y, de forma opcional, en GPU Metal en Apple Silicon. El pipeline declarado es any-to-any: acepta imágenes, fotogramas de vídeo, audio y texto como entrada, y produce texto y audio como salida.

El modelo base es un transformer de 2.000 millones de parámetros con capacidades multimodales (visión, audio y lenguaje) y síntesis de voz integrada. Esta conversión aplica cuantización mixta: HQQ INT4 con grupo de 64 y escalas FP16 en el backbone de lenguaje, la cabeza de salida y los embeddings de tokens compartidos; INT8 en los codificadores de visión y audio; FP16 en el códec y la profundidad de voz; y BF16 en los embeddings de audio. El repositorio ocupa 1,7 GB.

Su relevancia radica en que permite ejecutar un modelo omni-modal de 2B en hardware de consumo sin GPU dedicada, a través de MNN, con soporte de entrada de imagen, audio y vídeo, y salida de voz a 24 kHz. No obstante, el propio autor advierte que las pruebas realizadas son smoke tests y que la generación nativa de voz en chino no está validada en calidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer omni-modal (backbone de lenguaje + codificador de vision + codificador de audio + codec de voz), empaquetado para MNN |
| Parametros totales | 2B (según el nombre del modelo base; desglose no disponible) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | HQQ INT4 (grupo 64, escalas FP16) en backbone, cabeza de salida y embeddings de tokens; INT8 en codificadores de vision y audio; FP16 en codec/depth de voz; BF16 en embeddings de audio |
| Idiomas soportados | no disponible (la validación de voz cubre inglés; el chino nativo no está validado en calidad) |
| Licencia | LFM Open License v1.0 (license_name: lfm1.0) |
| Formato de pesos | MNN (modelo convertido con pesos externos; no safetensors ni GGUF) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo LiquidAI/LFM3-Omni-2B, un modelo omni-modal con pipeline any-to-any. La conversión a MNN mantiene el backbone de lenguaje, la cabeza de salida y los embeddings de tokens compartidos en HQQ INT4 (grupo de 64, escalas FP16); los codificadores de visión y audio se cuantizan a INT8; el códec y la profundidad de voz se mantienen en FP16; y los embeddings de audio en BF16. La conversión se realizó el 17 de noviembre de 2026 sobre la revisión upstream `21d75123f` y el commit de MNN `5085d5622`.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si el modelo base empleó RLHF, DPO u otras técnicas de alineación. Tampoco se detallan innovaciones arquitectónicas específicas del modelo original más allá de su naturaleza omni-modal. Los parámetros de muestreo se heredan del `generation_config.json` upstream, incluyendo ajustes de muestreo de audio independientes.

## Capacidades

- Generación de texto a partir de entradas multimodales: imagen, fotogramas de vídeo, audio y texto.
- Comprensión de imágenes mediante codificador de visión INT8.
- Comprensión de audio y reconocimiento de voz (ASR) mediante codificador de audio INT8.
- Síntesis de voz (TTS) a 24 kHz mediante `Llm::generateTTS` y `setWavformCallback`.
- Entrada de vídeo a través de `MultimodalPrompt` con fotogramas.
- Salida combinada de texto y audio (interleaved), validada en inglés.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponibles; la validación de voz se limita al inglés.

## Casos de uso

- Asistente de voz en local para dispositivos Apple Silicon: el modelo puede recibir audio y texto y devolver voz sintetizada a 24 kHz ejecutándose en CPU o Metal, sin depender de servicios en la nube. Adecuado por su tamaño de 2B y su empaquetado INT4.
- Transcripción y respuesta hablada en inglés: combinación de ASR (codificador de audio INT8) y TTS validados como smoke test en inglés, útil para prototipos de asistentes conversacionales por voz.
- Descripción de imágenes en aplicaciones de accesibilidad: el modelo acepta imágenes vía `<img>` y genera texto descriptivo, ejecutable en portátiles sin GPU dedicada.
- Análisis de fotogramas de vídeo: mediante `MultimodalPrompt` se pueden enviar fotogramas para tareas de descripción o respuesta a preguntas sobre contenido visual, aunque el autor solo valida la ruta de entrada con imágenes estáticas repetidas.
- Prototipado de interfaces any-to-any en móvil y edge: MNN está orientado a despliegue en dispositivos, y el tamaño de repositorio de 1,7 GB facilita su integración en apps nativas.
- Evaluación comparativa de cuantización HQQ INT4 en modelos omni-modales: útil para investigadores que quieran medir la degradación de un modelo 2B multimodal al pasar a INT4 en el backbone y INT8 en los codificadores.
- Síntesis de voz en pipelines offline: generación de audio a 24 kHz integrada en herramientas de lectura o locución, con la salvedad de que solo el inglés está validado en calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta smoke tests cualitativos en macOS Apple Silicon: `asr-cpu`, `asr-metal`, `tts-metal`, `tts-roundtrip`, `image-metal`, `video-metal`, `multimodal-english` y `multimodal-roundtrip`, sin métricas numéricas de precisión, latencia o throughput.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el repositorio pesa 1,7 GB, lo que sugiere un uso de memoria en el rango de 2 a 3 GB en inferencia INT4, aunque no se confirma.
- GPU recomendadas: no se especifican. El backend por defecto es CPU; en Apple Silicon se puede activar `metal` para el backbone, manteniendo los submodelos de medios en CPU.
- GPU de consumo: el diseño apunta a ejecución en CPU y en Apple Silicon (Metal), no a GPUs NVIDIA dedicadas. No se confirma compatibilidad con CUDA.
- Opciones de despliegue: MNN (compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_SUPPORT_TRANSFORMER_FUSE=ON`, `MNN_BUILD_AUDIO=ON`, `MNN_BUILD_OPENCV=ON`, `MNN_IMGCODECS=ON`), usando `llm_demo`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| LFM3-Omni-2B-MNN | 2B | no disponible | imagen, vídeo, audio, texto → texto, audio | LFM Open License v1.0 | MNN (INT4/INT8/FP16/BF16) |
| LiquidAI/LFM3-Omni-2B | 2B | no disponible | imagen, vídeo, audio, texto → texto, audio | LFM Open License v1.0 | Pesos originales (no disponible el formato exacto) |
| Alternativas omni-modales de ~2B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento ni de especificaciones detalladas de modelos comparables en la información proporcionada, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- La generación nativa de texto y voz intercalados en chino no está validada en calidad; pruebas previas mostraron desajustes entre voz y texto tanto en el modelo HF original como en MNN. La validación de voz de esta release cubre únicamente inglés.
- Los tests realizados son smoke tests y no validan contextos largos, todos los idiomas, todos los dispositivos ni tareas de agentes.
- Las pruebas de vídeo usan imágenes estáticas repetidas y solo verifican la ruta de entrada, no la calidad de comprensión de vídeo real.
- La licencia LFM Open License v1.0 puede imponer restricciones al uso comercial; debe revisarse el archivo LICENSE antes de desplegar en producción.
- Riesgo de alucinación: no cuantificado en la información disponible, pero inherente a modelos generativos de 2B.
- Sesgos conocidos: no disponibles.
- La cuantización HQQ INT4 en el backbone puede degradar la calidad respecto al modelo original; no se aportan métricas de dicha degradación.
- Requiere compilar MNN desde un commit específico o posterior; versiones antiguas del runtime pueden no soportar LFM3.
- El backend Metal solo se aplica al backbone; los submodelos de medios permanecen en CPU, lo que puede limitar el rendimiento en dispositivos Apple.
- Idiomas soportados no documentados oficialmente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/taobao-mnn/LFM3-Omni-2B-MNN
- Modelo base: https://huggingface.co/LiquidAI/LFM3-Omni-2B
- Revisión upstream: https://huggingface.co/LiquidAI/LFM3-Omni-2B/tree/21d75123f86c1f7ffb4bef1ea202710c4e7ebe67
- Repositorio MNN: https://github.com/alibaba/MNN
- Commit de MNN usado: https://github.com/alibaba/MNN/commit/5085d56221b939b8fd5e52885d2a4f295c6bbcc6
- Mirror en ModelScope: https://modelscope.cn/models/MNN/LFM3-Omni-2B-MNN
- Licencia LFM Open License v1.0: incluida en el repositorio como LICENSE
