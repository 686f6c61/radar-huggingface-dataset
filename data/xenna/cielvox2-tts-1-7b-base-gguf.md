# Xenna/cielvox2-tts-1.7b-base-GGUF

## Resumen

CielVox 1.7B Base es un modelo de síntesis de voz (TTS) con clonación de voz en tiempo de ejecución, desarrollado por Xenna bajo licencia Apache-2.0. Está diseñado para ejecutarse de forma local mediante el runtime C++ stelnettts, que forma parte del proyecto [stelnetxcis-create/cielvox2](https://github.com/stelnetxcis-create/cielvox2). El modelo emplea una arquitectura de modelo de lenguaje discreto multi-codebook: un "talker" LM de 28 capas predice 16 codebooks RVQ a partir de un tokenizador/códec separado de 12 Hz, lo que permite generar voz en 10 idiomas (chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano) a 24 kHz.

La relevancia de este modelo radica en su enfoque local-first: no requiere conexión a servicios en la nube, y permite clonar la voz de un hablante a partir de un fragmento de audio de referencia y su transcripción, o mediante "voice packs" pre-horneados en formato GGUF. El repositorio contiene únicamente la cuantización Q8_0 del talker, de 2,0 GB, que debe combinarse con el tokenizador/códec separado `Xenna/cielvox2-tokenizer-12hz`. Su arquitectura discreta, similar a la de Qwen3-TTS-12Hz, lo sitúa como una alternativa ligera y abierta para despliegues de síntesis de voz en entornos de producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer LM discreto multi-codebook (28 capas, 2048 hidden, 16 heads, 8 KV heads, head_dim=128) con predictor de códigos (5 capas + 15 pares embedding/lm_head) y salida de 16 codebooks × 2048 (RVQ) |
| Parámetros totales | 1.928.677.440 (dato safetensors) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio, no de texto) |
| Tipos de cuantización | Q8_0 (única publicada en el repo) |
| Idiomas soportados | zh, en, ja, ko, de, fr, ru, pt, es, it |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (2,0 GB) |

## Arquitectura y entrenamiento

El modelo se estructura en tres componentes diferenciados: un talker LM (el archivo GGUF de este repositorio) que predice códigos de audio, un predictor de códigos de 5 capas más 16 pares de embedding y cabeza de salida para los codebooks RVQ, y un tokenizador/códec separado de 12 Hz (12,5 fotogramas por segundo) que codifica y decodifica el audio. El talker LM tiene 28 capas, dimensión oculta de 2048, 16 cabezas de atención y 8 cabezas KV con head_dim=128, y genera audio PCM mono a 24 kHz.

No se han publicado datos sobre el conjunto de entrenamiento, el número de tokens de audio utilizados ni el proceso de optimización (RLHF, DPO, etc.). La innovación técnica destacable es su diseño local-first con clonación de voz en tiempo de ejecución: el modelo acepta un audio de referencia y su transcripción exacta para clonar la voz, o bien un voice-pack GGUF pre-horneado con una voz fija. La cuantización Q8_0 es la recomendada por el autor para despliegue, y el runtime se implementa en C++ mediante grafos ggml en `src/cielvox2_tts.cpp`.

## Capacidades

- Síntesis de voz (TTS) multilingüe en 10 idiomas: chino, inglés, japonés, coreano, alemán, francés, ruso, portugués, español e italiano.
- Clonación de voz en tiempo de ejecución a partir de un audio de referencia y su transcripción exacta (`--voice clone.wav --ref-text "..."`).
- Uso de voice packs de voz pre-horneados en formato GGUF, sin necesidad de audio de referencia.
- Generación de audio PCM mono de 24 kHz en formato float32.
- Despliegue local completo con el runtime C++ stelnettts, sin dependencias en la nube.
- Integración con el tokenizador/códec separado `cielvox-tokenizer-12hz.gguf` para codificación y decodificación de audio.
- No soporta tool calling, agentes ni razonamiento multi-paso; es un modelo puramente de síntesis de voz.

## Casos de uso

- **Asistentes de voz locales para privacidad**: el modelo permite generar respuestas habladas en aplicaciones de escritorio o móviles sin enviar datos de voz a la nube, gracias a su licencia Apache-2.0 y su diseño local-first. Se integraría mediante el runtime stelnettts con un pipeline de TTS.
- **Doblaje automático de contenido**: con soporte para 10 idiomas, el modelo puede generar voces en varios idiomas a partir de una misma referencia, lo que facilita la localización de vídeos, podcasts y material educativo. La clonación de voz a partir de un audio de referencia permite mantener una voz consistente en todos los idiomas.
- **Audiobooks y narración**: la clonación de voz en tiempo de ejecución permite generar audiolibros con la voz de un narrador específico, manteniendo una entonación natural gracias a la predicción de 16 codebooks RVQ. El audio de 24 kHz es suficiente para narración hablada.
- **Accesibilidad para personas con discapacidad**: se puede integrar en sistemas de lectura de pantalla o de comunicación aumentativa, generando voz localizada en el idioma del usuario sin depender de servicios externos.
- **Prototipado rápido de voces para juegos o animación**: el modelo permite crear voces personalizadas para personajes en minutos, combinando un audio de referencia corto con textos arbitrarios, y los voice packs GGUF permiten distribuir voces fijas sin exponer el audio original.
- **Sistemas de respuesta interactiva (IVR)**: en centros de llamadas o sistemas de automatización, el TTS local con clonación de voz puede generar respuestas personalizadas con la voz de un agente, reduciendo costes de licencia y latencia frente a APIs externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con la cuantización Q8_0 de 2,0 GB, el modelo cabe en GPUs consumer de 4 GB o más. La VRAM real dependerá del contexto de audio y del búfer del runtime.
- GPUs recomendadas: cualquier GPU compatible con CUDA o Vulkan con al menos 4 GB de VRAM, como la NVIDIA RTX 3060 (12 GB), RTX 4060 (8 GB) o superiores. También puede ejecutarse en CPU, aunque con mayor latencia.
- Sí cabe en GPUs consumer: sí, la mayoría de GPUs de 6-12 GB pueden ejecutarlo sin problemas.
- Opciones de despliegue: el runtime oficial es stelnettts (C++ con grafana ggml), que soporta backend `cielvox2-tts-1.7b-base`. No está disponible para vLLM, Ollama ni TGI de forma nativa.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Formato | Idiomas | Clonación de voz | Licencia | Contexto |
|---|---|---|---|---|---|---|
| **CielVox 2 1.7B Base (este)** | 1,93 B | GGUF Q8_0 (2,0 GB) | 10 | Sí (ref audio + ref texto) | Apache-2.0 | 24 kHz, códec 12 Hz |
| **Qwen3-TTS-12Hz-1.7B-Base-GGUF** | 1,7 B | GGUF | no disponible | no disponible | no disponible | 12 Hz códec |
| **CielVox 2 0.6B Base (GGUF)** | 0,9 B | GGUF Q8_0 (986 MB) | 10 | Sí | Apache-2.0 | 24 kHz, códec 12 Hz |
| **Qwen3-TTS-1.7B-CustomVoice-GGUF** | 1,7 B | GGUF | no disponible | No (9 voces fijas) | no disponible | 24 kHz |

La comparativa se basa en los repos oficiales de HuggingFace y GitHub. CielVox 2 1.7B se diferencia de la variante CustomVoice por ofrecer clonación de voz arbitraria en lugar de voces fijas, y del modelo 0.6B por su mayor capacidad (1.93 B frente a 0.9 B), lo que debería traducirse en mejor calidad prosódica, aunque no hay benchmarks publicados para confirmarlo.

## Limitaciones y advertencias

- Requiere un modelo de tokenizador/códec separado (`Xenna/cielvox2-tokenizer-12hz`); no funciona de forma autónoma.
- Solo se ofrece la cuantización Q8_0; no hay versiones Q4, Q5 ni otras para entornos con menos VRAM.
- Audio de 24 kHz mono, que limita la fidelidad en comparación con modelos que generan audio a 44,1 kHz o 48 kHz.
- No se han publicado datos sobre el dataset de entrenamiento ni sobre sesgos lingüísticos o de género; la calidad en idiomas de baja representación puede ser inferior.
- Riesgo de clonación de voz sin consentimiento: al ser un modelo de clonación de voz, su uso indebido puede vulnerar derechos de voz de terceros; la licencia Apache-2.0 no cubre responsabilidades legales del usuario.
- El runtime stelnettts es un proyecto relativamente nuevo y menos probado que llama.cpp; puede haber bugs o falta de soporte para ciertas plataformas.
- No se han publicado benchmarks de rendimiento ni de calidad de voz (MOS, SIM, etc.).
- No hay garantías de compatibilidad con versiones futuras de ggml o del formato GGUF.

## Enlaces

- [HuggingFace: Xenna/cielvox2-tts-1.7b-base-GGUF](https://huggingface.co/Xenna/cielvox2-tts-1.7b-base-GGUF)
- [HuggingFace: Xenna/cielvox2-tokenizer-12hz](https://huggingface.co/Xenna/cielvox2-tokenizer-12hz)
- [GitHub: stelnetxcis-create/cielvox2](https://github.com/stelnetxcis-create/cielvox2)
- [GitHub: cielvox2/hf_readmes/qwen3-tts-1.7b-customvoice-GGUF.md](https://github.com/stelnetxcis-create/cielvox2/blob/main/hf_readmes/qwen3-tts-1.7b-customvoice-GGUF.md)
- [HuggingFace: ggml-org/Qwen3-TTS-12Hz-1.7B-Base-GGUF](https://huggingface.co/ggml-org/Qwen3-TTS-12Hz-1.7B-Base-GGUF)
- [HuggingFace: Xenna/cielvox2-tts-0.6b-base-GGUF](https://huggingface.co/Xenna/cielvox2-tts-0.6b-base-GGUF)
