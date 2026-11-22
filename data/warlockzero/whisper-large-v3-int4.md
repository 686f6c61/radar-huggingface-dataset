# warlockzero/whisper-large-v3-int4

## Resumen

warlockzero/whisper-large-v3-int4 es una cuantización de 4 bits del modelo de reconocimiento automático del habla (ASR) openai/whisper-large-v3, publicada por el usuario warlockzero en Hugging Face. Se trata de un checkpoint derivado que mantiene la arquitectura encoder-decoder transformer original de Whisper Large V3 (1.543 millones de parámetros) pero con los pesos cuantizados a 4 bits en formato NF4 mediante bitsandbytes, con el objetivo de reducir de forma drástica el consumo de VRAM durante la inferencia. El autor declara un pico de memoria de aproximadamente 0,92 GB, lo que permite ejecutar un modelo de la familia large en GPUs de consumo con recursos limitados.

La relevancia de esta ficha es acotada: no se trata de un modelo nuevo ni de un entrenamiento adicional, sino de un artefacto de despliegue orientado a entornos con restricciones de memoria. El modelo conserva el pipeline `automatic-speech-recognition` y es compatible con la librería `transformers`, por lo que puede integrarse en los mismos flujos que el modelo base sustituyendo únicamente el identificador del checkpoint. La licencia declarada es MIT, heredada del modelo original de OpenAI.

El checkpoint se publicó el 22 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni likes, y no incluye resultados de benchmarks propios más allá de la afirmación del autor sobre "100% transcript accuracy". Toda la información técnica disponible procede de la model card y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper Large V3) |
| Parametros totales | 1.543.490.560 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (Whisper procesa ventanas de audio de 30 s) |
| Tipos de cuantizacion | 4-bit NF4 (W4A8/W4A16) con bitsandbytes |
| Idiomas soportados | no disponible en la model card (el modelo base Whisper Large V3 soporta multilingüe, pero no se detalla la lista) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Whisper Large V3 de OpenAI: un transformer encoder-decoder diseñado para transcripción y traducción de voz, que procesa audio en ventanas de 30 segundos convertidas a espectrogramas log-Mel. Este checkpoint no introduce cambios arquitectónicos; la modificación consiste en la cuantización de los pesos a 4 bits en formato NF4 (NormalFloat4) mediante bitsandbytes, con esquemas de activación W4A8/W4A16 según indica el autor. No se documenta ningún entrenamiento adicional, destilación ni ajuste fino: el proceso es exclusivamente de post-entrenamiento (cuantización).

No se dispone de información sobre el número de tokens de audio utilizados en el entrenamiento original, la composición del dataset, ni si hubo etapas de RLHF o DPO, ya que la model card no los detalla y esta ficha no debe inferirlos. Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El único dato técnico diferencial aportado por el autor es el pico de VRAM de aproximadamente 0,92 GB durante la inferencia.

## Capacidades

- Transcripción automática de voz (ASR) en audio de hasta 30 segundos por ventana, con procesamiento de audio más largo mediante segmentación.
- Traducción de voz a texto (capacidad heredada del modelo base Whisper Large V3, aunque no se detalla explícitamente en la model card).
- Detección de idioma y transcripción multilingüe (heredada del modelo base; la lista concreta de idiomas no está disponible en la información proporcionada).
- Generación de marcas de tiempo a nivel de segmento o palabra (capacidad estándar de la familia Whisper; no confirmada explícitamente en la model card).
- Inferencia en GPUs con VRAM muy limitada gracias a la cuantización de 4 bits.
- Integración con el ecosistema `transformers` mediante `AutoProcessor` y `AutoModelForSpeechSeq2Seq`.
- No se documenta soporte de tool calling, function calling, agentes ni multi-step reasoning, al no ser un modelo de propósito general.

## Casos de uso

- Transcripción en tiempo real en GPUs de consumo: con un pico de ~0,92 GB de VRAM, el modelo puede ejecutarse en tarjetas como RTX 3060 o superiores, permitiendo transcripción local de reuniones o notas de voz sin depender de servicios en la nube.
- Subtitulado automático de vídeo: el modelo puede generar transcripciones para pipelines de subtitulado, aprovechando la ventana de 30 segundos por segmento para procesar contenido largo por bloques.
- Asistentes de voz en dispositivos con recursos limitados: al reducir el consumo de memoria, es viable integrarlo en entornos de escritorio o servidores pequeños para dictado y comandos de voz.
- Procesamiento por lotes de archivos de audio: su reducido footprint permite ejecutar varias instancias o procesar lotes en una sola GPU, útil para archivística, podcasts o centros de transcripción.
- Investigación y experimentación con cuantización: sirve como referencia para estudiar el impacto de NF4 en tareas ASR y comparar la calidad frente al modelo de precisión completa.
- Prototipado rápido en notebooks o entornos con GPU compartida: la baja demanda de VRAM facilita probar flujos ASR en entornos como Google Colab o estaciones de trabajo modestas.
- Transcripción multilingüe local (si se confirma el soporte heredado del modelo base): útil para organizaciones que necesitan procesar audio en varios idiomas sin enviar datos a terceros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma "100% transcript accuracy" y un pico de VRAM de ~0,92 GB, pero no aporta métricas objetivas (WER, MMLU, HumanEval, GSM8K ni comparaciones numéricas) que permitan verificar dicha afirmación.

## Requisitos de hardware

- VRAM estimada para inferencia: ~0,92 GB en pico según el autor, con cuantización 4-bit NF4.
- GPU recomendadas: cualquier GPU con al menos ~1,5-2 GB de VRAM libre para operar con margen; el autor no especifica modelos concretos.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como GTX 1650, RTX 3050, RTX 3060 y superiores, aunque no se aportan pruebas de compatibilidad específicas.
- Opciones de despliegue: `transformers` con bitsandbytes (método documentado por el autor). No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| warlockzero/whisper-large-v3-int4 | 1.543.490.560 | no disponible (ventanas de 30 s) | 4-bit NF4 (W4A8/W4A16) | MIT | Hugging Face |
| openai/whisper-large-v3 | 1.543.490.560 | no disponible (ventanas de 30 s) | FP16/FP32 | MIT | Hugging Face |
| openai/whisper-large-v3-turbo | no disponible en esta ficha | no disponible | FP16 | MIT | Hugging Face |

La comparación directa con el modelo base es la más relevante: este checkpoint ofrece el mismo tamaño de parámetros que openai/whisper-large-v3 pero con una reducción drástica de VRAM a costa de la cuantización, sin que se hayan publicado métricas que cuantifiquen la posible degradación de la calidad. No se dispone de datos de rendimiento comparativo entre ambos.

## Limitaciones y advertencias

- Alucinaciones: como todo modelo Whisper, puede generar texto inventado en segmentos con silencio, ruido o audio de baja calidad; la cuantización puede agravar este comportamiento, aunque no se aportan datos al respecto.
- Sesgos: no se documentan evaluaciones de sesgo; se heredan los sesgos del modelo base de OpenAI, no analizados en esta model card.
- Idiomas: la lista concreta de idiomas soportados no está disponible en la información proporcionada; debe verificarse contra el modelo base.
- Licencia: MIT declarada, lo que permite uso comercial, pero conviene revisar las condiciones del modelo base de OpenAI y de bitsandbytes para confirmar compatibilidad.
- Fiabilidad de las afirmaciones: el autor declara "100% transcript accuracy" sin aportar benchmarks ni metodología, por lo que dicha cifra no debe tomarse como garantía de calidad.
- Madurez del artefacto: el repositorio no registra descargas ni likes y no incluye validaciones independientes; su uso en producción requiere evaluación propia.
- Compatibilidad: el método de carga documentado depende de bitsandbytes y `transformers`; no se garantiza funcionamiento con otros runtimes.
- Contexto de audio: la ventana de procesamiento de Whisper es de 30 segundos por segmento, lo que exige segmentación para audio largo.

## Enlaces

- Hugging Face: https://huggingface.co/warlockzero/whisper-large-v3-int4
- Modelo base: https://huggingface.co/openai/whisper-large-v3
- Repositorio de bitsandbytes: https://github.com/bitsandbytes-foundation/bitsandbytes
- Documentación de Whisper en transformers: https://huggingface.co/docs/transformers/model_doc/whisper
