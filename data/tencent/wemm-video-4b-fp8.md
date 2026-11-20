# tencent/WeMM-Video-4B-FP8

## Resumen

WeMM-Video-4B-FP8 es la variante cuantizada en FP8 del modelo multimodal WeMM-Video-4B, desarrollado por Tencent. Se trata de un modelo bilingüe chino-inglés disenado para la comprensión y el razonamiento conjunto de audio y vídeo: acepta texto, imágenes, audio y vídeo, y genera respuestas en texto. Su propuesta principal es combinar los fotogramas de un vídeo con su banda sonora original para describir eventos, transcribir el habla y razonar sobre lo que se ve y se escucha de forma integrada.

Arquitectura y entrenamiento: el modelo emplea un transformer multimodal (tag `qwen3_5`) con codificadores separados de visión y audio que convierten los medios en tokens que el modelo de lenguaje procesa junto al texto. Los fotogramas de vídeo llevan marcas temporales. La familia se preentrenó con aproximadamente 1,2 billones de tokens multimodales y se postentrenó con multi-teacher OPD, anti-repetition MrDPO y aprendizaje por refuerzo especializado.

Esta variante FP8 Block128 reduce el peso de los ficheros a 7,13 GiB (frente a los aproximadamente 5.611.749.896 parámetros del modelo base) manteniendo los codificadores de medios y los tensores protegidos en su precisión original. Es relevante para despliegues en producción que necesitan un modelo audiovisual compacto con licencia Apache 2.0 y soporte de vLLM.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (tag `qwen3_5`) con codificadores separados de visión y audio |
| Parametros totales | 5.611.749.896 (dato real de safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (configurado en el ejemplo de vLLM con `--max-model-len 8192`) |
| Tipos de cuantizacion | FP8 E4M3FN en bloques 128 × 128 con escalado dinámico de activaciones por token en grupos de 128; codificadores de medios y tensores protegidos en precisión original |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (7,13 GiB de ficheros de pesos) |

## Arquitectura y entrenamiento

WeMM-Video es un transformer multimodal que combina un modelo de lenguaje con codificadores de visión y de audio independientes. Los codificadores transforman imágenes, audio y fotogramas de vídeo en tokens que el modelo de lenguaje procesa junto a los tokens de texto. Los fotogramas de vídeo incorporan marcas temporales, lo que permite razonar sobre la secuencia temporal de los eventos. La variante FP8 cuantiza los pesos lineales seleccionados del modelo de lenguaje a E4M3FN en bloques de 128 × 128 con escalado dinámico de activaciones por token, mientras que los codificadores de medios y los tensores protegidos conservan su precisión original.

El entrenamiento se realizó en dos fases: un preentrenamiento con aproximadamente 1,2 billones de tokens multimodales y un postentrenamiento que incluye multi-teacher OPD (destilación de múltiples profesores), anti-repetition MrDPO (DPO orientado a reducir repeticiones) y aprendizaje por refuerzo con especialistas. El modelo base WeMM-Video-4B es el punto de partida de esta cuantización, y la relación declarada es `quantized`.

## Capacidades

- Comprensión audiovisual conjunta: combina fotogramas de vídeo con su banda sonora para describir eventos, transcribir el habla y razonar sobre lo que se ve y se escucha.
- Entrada de vídeo silencioso, audio independiente, imágenes y texto.
- Generación de respuestas en chino e inglés.
- Razonamiento multimodal y respuesta a preguntas sobre medios.
- Modo thinking configurable (`enable_thinking` en la plantilla de chat).
- Compatibilidad con API OpenAI-compatible mediante vLLM parcheado.
- Soporte de múltiples medios por prompt: hasta 4 imágenes, 2 vídeos y 2 audios por defecto en la configuración de vLLM.
- Tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no disponible en la información proporcionada.

## Casos de uso

- Transcripción y descripción de vídeo con audio: el modelo recibe un vídeo con su pista de sonido (`video_audio`) y genera una descripción de los eventos junto con la transcripción del habla, gracias a sus codificadores separados de visión y audio.
- Análisis de reuniones y clases grabadas: procesa el vídeo con la banda sonora para resumir lo tratado y transcribir las intervenciones, con respuestas en chino o inglés.
- Accesibilidad de contenidos audiovisuales: genera descripciones textuales de vídeos para subtitulado o audiodescripción, combinando información visual y sonora.
- Moderación y análisis de contenido multimedia: inspección de vídeos e imágenes con razonamiento sobre lo mostrado y lo escuchado, integrable vía API OpenAI-compatible en vLLM.
- Asistentes conversacionales multimodales: acepta imágenes, audio y vídeo en conversaciones multi-turno con una ventana de contexto de 8192 tokens.
- Procesamiento por lotes de archivos de audio: transcripción y razonamiento sobre audio independiente (`audio_url`) en pipelines automatizados.
- Despliegue en GPU con FP8: al reducir los pesos a 7,13 GiB, es adecuado para servir en GPUs con soporte FP8 (el equipo validó la carga en una NVIDIA L20) reduciendo requisitos de memoria frente al modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los ficheros de pesos FP8 ocupan 7,13 GiB; el modelo completo requiere además memoria para el contexto (8192 tokens), las cachés y los codificadores de medios en su precisión original, por lo que se recomienda una GPU con al menos 16-24 GB de VRAM (estimación, no dato oficial).
- GPU recomendadas: NVIDIA L20 (validada por el equipo con Transformers 5.2.0 y PyTorch 2.10.0+cu129); cualquier GPU con soporte de FP8 para el despliegue con vLLM 0.18.0 parcheado.
- ¿Cabe en GPU de consumo? No confirmado en la información proporcionada; requiere soporte de FP8 y del parche de runtime de WeMM.
- Opciones de despliegue: Transformers con `trust_remote_code=True` (validado con carga completa de pesos y generación en texto, imagen, audio, vídeo y vídeo con sonido) y vLLM 0.18.0 parcheado con servidor OpenAI-compatible.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

No disponible: la información proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- Idiomas limitados a inglés y chino; no se declara soporte de castellano.
- Ventana de contexto de 8192 tokens, insuficiente para vídeos largos o documentos extensos.
- Requiere un parche de runtime específico de WeMM para vLLM 0.18.0; no funciona con vLLM estándar sin el parche.
- La cuantización FP8 exige GPU con soporte FP8; los codificadores de medios y tensores protegidos permanecen en precisión original, incrementando el consumo de memoria respecto a los 7,13 GiB de pesos.
- Riesgo de alucinación inherente a los modelos generativos multimodales; no se documentan evaluaciones de fiabilidad en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero se recomienda revisar las dependencias del runtime parcheado (vLLM) y los términos del modelo base.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta; ecosistema de validación muy reciente (creado en noviembre de 2026).

## Enlaces

- Hugging Face: https://huggingface.co/tencent/WeMM-Video-4B-FP8
- Modelo base: https://huggingface.co/tencent/WeMM-Video-4B
- Proyecto en GitHub: https://github.com/Tencent/WeMM-Video
- Colección de modelos: https://huggingface.co/collections/tencent/wemm-video
- Guía de serving: https://github.com/Tencent/WeMM-Video/blob/main/docs/serving.md
- Instalación del parche: https://github.com/Tencent/WeMM-Video/blob/main/patch/README.md
- Ejemplos de Transformers: https://github.com/Tencent/WeMM-Video#load-from-hugging-face-with-transformers
- Manifiesto de cuantización: https://huggingface.co/tencent/WeMM-Video-4B-FP8/blob/main/quantization_manifest.json
