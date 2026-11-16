# Vantuk/model_set

## Resumen

Vantuk/model_set es un conjunto de modelos empaquetados para un pipeline completo de traducción de voz a voz (speech-to-speech) en dispositivo, orientado a hardware móvil con aceleración NPU Qualcomm. No se trata de un único modelo monolítico, sino de una colección de 388 ficheros (1,877 GB) que cubren detección de idioma hablado, reconocimiento automático de voz, traducción automática y síntesis de voz, todo ello optimizado para ejecutarse en el chipset SM8650 (Snapdragon 8 Gen 3) con el backend QNN HTP v75. El repositorio declara 1.601.173.504 parámetros totales en formato safetensors, aunque el grueso del pipeline se distribuye en formatos ONNX (INT8) y GGUF (Q4_0).

El componente de traducción es un modelo de lenguaje de 1,8B parámetros cuantizado a Q4_0 (`Hy-MT2-1.8B-Q4_0-enviko32k`), ejecutado con llama.cpp y las extensiones Arm KleidiAI (`+dotprod+i8mm`). El resto de etapas emplean modelos especializados: ECAPA para LID, Gipformer y SenseVoice para ASR, y vocoders Piper para TTS en coreano, vietnamita e inglés. La relevancia actual radica en que demuestra un pipeline multietapa completamente offline para traducción simultánea de voz, con reparto explícito de cargas entre CPU y NPU.

La licencia Apache 2.0 y la inclusión de formatos ONNX, GGUF y artefactos específicos para QNN lo sitúan como una referencia práctica para despliegues on-device en Android con aceleración heterogénea. No obstante, la información publicada es escasa: no hay benchmarks, no se declaran idiomas soportados de forma explícita y el repositorio no registra descargas ni interacciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline multietapa: ECAPA (LID), Gipformer y SenseVoice (ASR), transformer decoder (traducción, 1,8B), Piper (TTS) |
| Parametros totales | 1.601.173.504 (safetensors); el modelo de traducción es de 1,8B |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el nombre del GGUF sugiere ventana de 32k: `enviko32k`) |
| Tipos de cuantizacion | INT8 (ASR ONNX), Q4_0 (GGUF de traducción), cuantización específica QNN para NPU |
| Idiomas soportados | Inglés, coreano, vietnamita (ASR/TTS); traducción EN/VI/KO según nombres de ficheros; lista oficial no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, ONNX (INT8), GGUF (Q4_0), artefactos QNN, datos eSpeak-NG |

## Arquitectura y entrenamiento

El repositorio no describe una arquitectura única, sino un sistema compuesto por cinco etapas encadenadas. La etapa 1 realiza detección de idioma hablado mediante un modelo ECAPA ejecutado en la NPU QNN HTP v75. Las etapas 2a-2c cubren ASR: Gipformer INT8 para vietnamita, SenseVoice INT8 para inglés y coreano, y un modelo de ASR en streaming para coreano, todos sobre Sherpa-ONNX en CPU. La etapa 3 evalúa la "preparación de la fuente" en NPU. La etapa 4 es la traducción con un transformer decoder de 1,8B parámetros cuantizado a Q4_0, ejecutado en CPU con llama.cpp y kernels Arm KleidiAI (`+dotprod+i8mm`). Las etapas 5a-5d sintetizan voz con Piper: el encoder y el flow se ejecutan en CPU y el decoder (`dec_128_2d`) en la NPU, con fallback a CPU.

No se proporcionan datos sobre el corpus de entrenamiento, el número de tokens, la composición del dataset ni si hubo ajuste por RLHF o DPO. La innovación técnica destacable es el reparto heterogéneo de cómputo entre CPU y NPU Qualcomm, junto con el uso de KleidiAI para acelerar la inferencia del modelo de traducción en ARM. El sufijo `imatrix` en los tags sugiere el uso de matrices de importancia para la cuantización, aunque no se detalla el proceso.

## Capacidades

- Traducción de voz a voz completa: detección de idioma, ASR, traducción y TTS en un solo pipeline offline.
- Detección de idioma hablado (spoken LID) con ECAPA sobre NPU.
- Reconocimiento automático de voz en vietnamita, inglés y coreano, con variante de streaming para coreano.
- Traducción automática entre inglés, vietnamita y coreano mediante un LLM de 1,8B cuantizado.
- Síntesis de voz con Piper para coreano (KSS), vietnamita (VAIS-1000) e inglés (Lessac).
- Conversión grafema-fonema para inglés y vietnamita mediante eSpeak-NG.
- Ejecución on-device con aceleración NPU Qualcomm QNN HTP v75 y fallback a CPU.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere exposición vía API HTTP.
- No se declaran capacidades de tool calling, agentes, visión ni audio más allá del pipeline descrito.

## Casos de uso

- Traducción simultánea offline en dispositivos móviles: el pipeline completo se ejecuta en un Snapdragon 8 Gen 3 sin conexión, útil en viajes o entornos sin red, con reparto CPU/NPU para minimizar latencia y consumo.
- Interpretación en reuniones presenciales EN-VI-KO: la detección de idioma hablado y el ASR en streaming permiten segmentar turnos de habla y traducir en cuasi tiempo real.
- Atención al cliente en kioscos o terminales: el TTS Piper y el ASR SenseVoice permiten conversaciones multi-turno locales sin enviar audio a la nube, reduciendo riesgo de privacidad.
- Subtitulado y doblaje de contenido multimedia: el ASR por etapas y el TTS con voces específicas por idioma permiten generar pistas dobladas para vídeo en inglés, vietnamita y coreano.
- Aplicaciones de accesibilidad: conversión de voz a voz para personas con discapacidad auditiva o del habla, con síntesis Piper de baja latencia en NPU.
- Investigación en pipelines on-device: referencia para medir el reparto de cargas entre CPU y NPU Qualcomm en tareas de speech-to-speech, así como para evaluar KleidiAI en modelos de 1,8B.
- Prototipado de asistentes de voz embebidos: la compatibilidad con endpoints y los formatos ONNX/GGUF facilitan integrar el conjunto en servicios locales tipo llama.cpp o Sherpa-ONNX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; el pipeline está diseñado para ejecución on-device en memoria unificada de SoC, no para GPU dedicada.
- GPU recomendadas: no aplica; el hardware objetivo es Qualcomm SM8650 (Snapdragon 8 Gen 3) con NPU QNN HTP v75.
- Cabe en consumer GPU: no está diseñado para GPU de escritorio; el modelo de traducción de 1,8B en Q4_0 podría ejecutarse en GPU consumer vía llama.cpp, pero el resto del pipeline usa ONNX/QNN específicos de ARM.
- Opciones de despliegue: llama.cpp (con Arm KleidiAI `+dotprod+i8mm`), Sherpa-ONNX, QNN HTP v75, Piper, eSpeak-NG.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| Vantuk/model_set | 1,6B totales (1,8B en traducción) | no disponible (32k sugerido) | Apache 2.0 | Pipeline speech-to-speech on-device con NPU Qualcomm |
| Whisper (OpenAI) | 39M-1,55B según variante | 30 s de audio | MIT | ASR multilingüe, sin traducción ni TTS integrados |
| SeamlessM4T (Meta) | ~2,3B | no disponible | CC BY-NC 4.0 (no comercial) | Speech-to-speech multilingüe en servidor |
| NLLB-200 (Meta) | 600M-54B | 512 tokens | CC BY-NC 4.0 | Traducción texto a texto, sin voz |

No se dispone de datos de rendimiento comparativo para Vantuk/model_set. La comparativa se limita a características estructurales.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real del pipeline es desconocido.
- El repositorio no declara una lista oficial de idiomas soportados; los idiomas inferidos (EN, VI, KO) provienen únicamente de los nombres de ficheros.
- El pipeline está fuertemente acoplado al hardware Qualcomm SM8650 y QNN HTP v75; su portabilidad a otros SoC o GPU no está garantizada.
- Riesgo de alucinación y errores de traducción inherente al modelo de 1,8B cuantizado a Q4_0, especialmente en dominios especializados.
- La cuantización INT8 del ASR y Q4_0 del traductor pueden degradar la precisión frente a los modelos originales en precisión completa.
- No hay información sobre sesgos lingüísticos o culturales del corpus de entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero los componentes de terceros (Piper, SenseVoice, Gipformer, ECAPA) pueden tener licencias propias no detalladas en la model card.
- El repositorio registra 0 descargas y 0 likes, sin señales de validación por parte de la comunidad.
- No se documentan requisitos de memoria, latencia ni consumo energético en el dispositivo objetivo.

## Enlaces

- Hugging Face: https://huggingface.co/Vantuk/model_set
- No se han encontrado otros enlaces (papers, blogs, repos, demos) en la informacion disponible.
