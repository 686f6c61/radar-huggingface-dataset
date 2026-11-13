# storyteller-platform/citrinet512-es

## Resumen

Citrinet 512 Spanish es un modelo de reconocimiento automático del habla (ASR) para castellano, distribuido por storyteller-platform como espejo del modelo original de neongeckocom. No es un modelo de lenguaje generativo, sino un sistema de transcripción de audio a texto basado en la arquitectura Citrinet, una variante de convolución 1D con conexiones residuales y subsampling progresivo, diseñada por NVIDIA NeMo para reconocimiento de voz eficiente. El repositorio empaqueta los pesos en dos formatos (ONNX y safetensors para MLX) junto con el front end de mel, el vocabulario y el tokenizador SentencePiece.

El modelo se integra en la plataforma Storyteller a través de la herramienta ghost-story y su registro de modelos, con versiones organizadas por formato. Está pensado para transcripción de audio en castellano en entornos de producción con requisitos moderados de cómputo, y su licencia BSD-3-Clause permite uso comercial sin restricciones significativas.

La relevancia actual del modelo radica en su empaquetado listo para inferencia en dos ecosistemas (ONNX Runtime y MLX para Apple Silicon), lo que simplifica el despliegue en aplicaciones de transcripción sin necesidad de reconstruir el pipeline de preprocesado acústico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Citrinet (CNN 1D con residuales y subsampling) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR, ventana de audio variable) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | castellano (es) |
| Licencia | BSD-3-Clause |
| Formato de pesos | safetensors (MLX), ONNX |

## Arquitectura y entrenamiento

Citrinet es una arquitectura convolucional para ASR que sustituye la pila de transformers por bloques de convolución 1D con conexiones residuales, normalización por lotes y submuestreo progresivo a lo largo de la dimensión temporal. El modelo incorpora un front end de características mel-espectrales, con el filtro mel y la ventana empaquetados junto a los pesos, de modo que el export ONNX acepta la señal pre-enfatizada y con padding reflectante y calcula internamente las características y su longitud. El vocabulario y el tokenizador SentencePiece provienen del modelo original de neongeckocom.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de ajuste fino como RLHF o DPO; estos datos no están publicados en la información disponible. El identificador del modelo original (`stt_es_citrinet_512_gamma_0_25`) sugiere una variante con parámetro gamma de 0,25, habitual en configuraciones de Citrinet, pero no se detalla su significado en la documentación proporcionada.

## Capacidades

- Transcripción de voz a texto en castellano a partir de audio pre-enfatizado y con padding reflectante.
- Cálculo interno de características mel-espectrales en el export ONNX (front end integrado).
- Inferencia en dos runtimes: ONNX Runtime (formato `model.onnx`) y MLX en Apple Silicon (formato `model.safetensors`).
- Tokenización con SentencePiece mediante `tokenizer.spm`.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente acústico.
- No dispone de capacidades multimodales más allá del audio de entrada.
- No se documentan modos especiales como thinking, visión o audio generativo.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo convierte audio en castellano a texto para actas automáticas, adecuado por su licencia permisiva y su empaquetado ONNX listo para servir en backend.
- Subtitulado de vídeo y podcasts: integración en pipelines de postproducción que requieren transcripción por lotes con un modelo ligero y sin dependencias de GPU de gama alta.
- Atención al cliente con análisis de llamadas: transcripción de conversaciones telefónicas para extracción de intenciones y control de calidad, aprovechando la licencia BSD-3-Clause para uso comercial.
- Aplicaciones de accesibilidad: dictado y generación de subtítulos en tiempo real en aplicaciones de escritorio o móviles con inferencia ONNX.
- Procesamiento en dispositivos Apple: despliegue nativo en macOS/iOS mediante MLX usando el formato safetensors, sin necesidad de servidores externos.
- Investigación en ASR en castellano: base para experimentos de ajuste fino o comparación de arquitecturas convolucionales frente a transformers en tareas de reconocimiento de voz.
- Indexación y búsqueda de archivos de audio: transcripción masiva de archivos para construir índices de búsqueda textual sobre contenido hablado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el tamaño del repositorio es de 0,3 GB, lo que sugiere un modelo ligero que probablemente cabe en GPUs de gama media e incluso en CPU para inferencia por lotes.
- GPU recomendadas: no se especifican; por el tamaño del artefacto, una RTX 3060 o superior debería ser suficiente, aunque no hay datos confirmados.
- Cabe en GPU de consumo: probablemente sí, dado el tamaño del repositorio (0,3 GB), pero no se dispone de confirmación oficial.
- Opciones de despliegue: ONNX Runtime (formato `model.onnx`), MLX (formato `model.safetensors` en Apple Silicon). No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Licencia | Formatos | Contexto |
|---|---|---|---|---|---|
| Citrinet 512 Spanish (este) | Citrinet (CNN 1D) | Castellano | BSD-3-Clause | ONNX, safetensors (MLX) | Ventana de audio variable |
| Whisper (OpenAI) | Transformer encoder-decoder | Multilingüe | MIT | safetensors, GGUF, ONNX | 30 s por ventana |
| Wav2Vec 2.0 (Meta) | Transformer convolucional | Multilingüe (fine-tune) | MIT / Apache-2.0 según variante | safetensors, PyTorch | Ventana de audio variable |
| NeMo Citrinet (NVIDIA) | Citrinet | Multilingüe | Apache-2.0 / BSD según checkpoint | NeMo, ONNX | Ventana de audio variable |

No se dispone de datos de rendimiento comparativo (WER, latencia) en la información proporcionada para establecer una comparación cuantitativa con estas alternativas.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente para castellano; no se garantiza su rendimiento en otras lenguas o variedades dialectales.
- Al ser un modelo ASR, puede producir errores de transcripción en audio con ruido, acentos marcados o solapamiento de hablantes; no se documentan tasas de error.
- No se dispone de información sobre sesgos demográficos o acústicos del dataset de entrenamiento original.
- La licencia BSD-3-Clause permite uso comercial, pero exige mantener el aviso de copyright y la cláusula de no respaldo; conviene revisar los términos del modelo original de neongeckocom.
- El repositorio es un espejo de la versión 2.0.0 del registro de Storyteller; la disponibilidad y el mantenimiento dependen del proyecto original en GitLab.
- No se documentan procesos de cuantización ni optimizaciones de latencia; el rendimiento en producción deberá validarse empíricamente.
- El front end mel está integrado en el export ONNX, pero el formato MLX requiere el pipeline de preprocesado correspondiente; una integración incorrecta puede degradar la transcripción.

## Enlaces

- Hugging Face: https://huggingface.co/storyteller-platform/citrinet512-es
- Modelo original: https://huggingface.co/neongeckocom/stt_es_citrinet_512_gamma_0_25
- Export ONNX original: https://huggingface.co/OpenVoiceOS/neongeckocom-stt_es_citrinet_512_gamma_0_25_onnx
- Scripts de conversión y exportación: https://gitlab.com/storyteller-platform/storyteller/-/tree/main/libraries/mlx-audio/scripts
- Registro del modelo en Storyteller: https://gitlab.com/storyteller-platform/storyteller/-/ml/models/citrinet512-es
