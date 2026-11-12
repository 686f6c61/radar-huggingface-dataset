# wirybeaver/Ming-3.0-asr-tiny-mtp

## Resumen

Ming-3.0-asr-tiny-mtp es un modelo borrador (draft) de decodificación especulativa para el sistema de reconocimiento automático de voz inclusionAI/Ming-3.0-asr-tiny. Lo publica el usuario independiente wirybeaver y no es un modelo ASR autónomo: es un bloque MTP (multi-token prediction) nativo de una sola capa que se acopla al verificador congelado para acelerar la inferencia sin alterar las transcripciones. Se distribuye bajo licencia MIT y está pensado para servirse con vLLM.

La arquitectura sigue el esquema bailing_moe_v3 del verificador, con un tamaño oculto de 1.536, un vocabulario de 157.184 tokens y 316.604.672 parámetros entrenables dentro de un checkpoint total de 799.474.048 parámetros (1,6 GB en safetensors, pesos en BF16). El bloque MTP se inicializa desde la capa 24 del verificador y se entrena para predecir tres tokens recurrentes por pasada a través de la misma capa.

Su relevancia es práctica: demuestra que un draft nativo de una sola capa, afinado sobre transcripciones greedy del verificador, eleva la longitud media de aceptación de 2,78 a 3,07 en vLLM manteniendo exactamente la misma tasa de error de palabra (WER) que la decodificación sin draft. Es una pieza de infraestructura para reducir latencia en pipelines ASR multilingües (inglés, chino y japonés), no un modelo para uso directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | bailing_moe_v3 (bloque MTP nativo de 1 capa sobre verificador congelado) |
| Parametros totales | 799.474.048 |
| Parametros activos | 316.604.672 entrenables (bloque MTP; el resto son embeddings y LM head congelados del verificador) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint publicado en BF16) |
| Idiomas soportados | en, zh, ja |
| Licencia | MIT |
| Formato de pesos | safetensors (custom_code, libreria vllm) |

## Arquitectura y entrenamiento

El modelo es un draft de decodificación especulativa de tipo MTP nativo. Consta de una única capa (índice 24 del checkpoint del verificador) con tamaño oculto de 1.536 y vocabulario completo de 157.184 tokens, sin mapeo reducido de vocabulario. Durante la inferencia se ejecutan tres pasos recurrentes del borrador a través de la misma capa. El paquete incluye el bloque MTP entrenado junto con los pesos congelados de embeddings y LM head del verificador; se debe cargar el verificador original por separado y usar su tokenizador y procesador de audio. La configuración conserva la profundidad objetivo de 24 para que el cargador nativo direccione la capa correcta, con `num_nextn_predict_layers=1` para la profundidad del draft.

El entrenamiento usó las transcripciones greedy del verificador congelado (incluyendo prefijo de idioma y EOS) como etiquetas, y reprodujo las secuencias condicionadas por audio a través de vLLM para capturar los embeddings de entrada en el límite 0 y los estados pre-norm finales en el límite 24. Se excluyeron del cálculo de pérdida los tokens de prompt, audio, padding y objetivos entre documentos. El verificador, los embeddings compartidos, el LM head y la normalización final permanecieron congelados. Se usó Speculators con adaptador nativo Ming, entropía cruzada ponderada de tres pasos (pesos 1, 0,6 y 0,36), AdamW fusionado con tasa 3e-5, weight decay 0,01, decaimiento coseno con 3% de warmup y 16.384 tokens empaquetados por GPU. Los parámetros entrenables usaron precisión maestra FP32 con activaciones BF16.

El corpus de entrenamiento reutiliza la selección de Ming-3.0-asr-tiny-dspark: LibriSpeech train-clean-360, People's Speech clean, VoxPopuli inglés, AISHELL-1 oficial (train/dev) y FLEURS en inglés, chino y japonés. Se retuvieron 356.954 clips (999,51 horas de audio) y 2.575 clips de validación tras excluir 52 generaciones del profesor que no terminaban. La distribución por idioma fue: inglés 231.515 clips (832,32 h) y 1.416 de validación; chino 123.340 clips (160,54 h) y 921 de validación; japonés 2.099 clips (6,64 h) y 238 de validación. Emilia-YODAS y Common Voice 17 quedaron excluidos. El entrenamiento completó 6 épocas en dos GPU H200 en unas 5,60 horas; se publicó el checkpoint de la época 3, seleccionado por la menor pérdida de validación (0,269103).

## Capacidades

- Predicción especulativa de tokens para el verificador inclusionAI/Ming-3.0-asr-tiny: genera borradores de hasta tres tokens que el verificador acepta o corrige.
- Aceleración de la decodificación ASR en vLLM sin modificar la salida final: en la cohorte fija de 256 peticiones inglesas de SeedTTS, el texto coincide con el verificador en 256/256 casos.
- Soporte multilingüe limitado a los idiomas del verificador: inglés, chino y japonés, con detección automática de idioma.
- Integración con tooling de vLLM para decodificación especulativa nativa (carga del draft junto al verificador).
- No realiza ASR por sí mismo: requiere el verificador y su procesador de audio.
- No dispone de tool calling, capacidades de agente, visión ni audio de forma autónoma.

## Casos de uso

- Servicio ASR de baja latencia en producción: desplegar el verificador Ming-3.0-asr-tiny con este draft en vLLM para reducir el número de rondas de verificación necesarias; la longitud media de aceptación sube de 2,78 a 3,07 con lote 1 y de 2,79 a 3,07 con lote 8, sin coste en WER.
- Transcripción por lotes de audio inglés: procesar grandes volúmenes con lote 8 manteniendo WER de 0,9328% y aceptación de 3,0685, útil en pipelines de subtitulado o indexación de archivos.
- Subtitulado y transcripción de contenido en chino: el entrenamiento incluyó 160,54 horas de AISHELL-1 y FLEURS chino, por lo que el draft está alineado con el verificador en ese idioma.
- Prototipado de decodificación especulativa: sirve como referencia reproducible (manifest de contadores agregados, cohorte fija, hashes de audio) para equipos que quieran validar sus propias configuraciones de draft.
- Investigación en MTP nativo: el paquete permite estudiar el efecto de un draft de una capa con tres pasos recurrentes sobre la aceptación, comparándolo con el draft inicial (37,30% de prefijo correcto ≥1 frente a 93,65% del afinado).
- Evaluación de infraestructura vLLM: útil para medir latencia y throughput de decodificación especulativa en GPU H200 con TP1, ejecución eager y MoE Triton, antes de invertir en despliegues mayores.
- Transcripción de audio japonés de nicho: con solo 6,64 horas de entrenamiento en ja, adecuado para pruebas controladas, no para producción crítica en ese idioma.

## Benchmarks y rendimiento

Validación offline (mediciones condicionadas por el profesor, en caché):

| Checkpoint | Pérdida CE ponderada | Prefijo correcto ≥1 | Prefijo correcto ≥2 | Prefijo correcto ≥3 |
|---|---:|---:|---:|---:|
| MTP nativo inicial | 5,531582 | 37,30% | 3,39% | 0,17% |
| Época 3 (seleccionada) | 0,269103 | 93,65% | 84,88% | 77,38% |

Pérdida de validación por época:

| Época | Pérdida de validación |
|---|---:|
| 1 | 0,318932 |
| 2 | 0,281512 |
| 3 (seleccionada) | 0,269103 |
| 4 | 0,280994 |
| 5 | 0,290502 |
| 6 | 0,284293 |

Inferencia nativa en vLLM (1 GPU H200, BF16, TP1, eager, MoE Triton, greedy, detección automática de idioma, 256 peticiones inglesas de SeedTTS, 8 de warmup excluidas):

| Lote | Draft | Longitud media de aceptación | Borradores aceptados / ronda | WER inglés | Coincidencia exacta con verificador |
|---|---|---:|---:|---:|---:|
| 1 | solo objetivo | — | — | 0,9649% | 256/256 |
| 1 | MTP inicial | 2,7816 | 1,7816 | 0,9649% | 256/256 |
| 1 | MTP afinado | 3,0708 | 2,0708 | 0,9649% | 256/256 |
| 8 | solo objetivo | — | — | 0,9328% | 256/256 |
| 8 | MTP inicial | 2,7896 | 1,7896 | 0,9328% | 256/256 |
| 8 | MTP afinado | 3,0685 | 2,0685 | 0,9328% | 256/256 |

Recuento de aceptación con lote 1:

| Borradores aceptados por ronda | Rondas MTP inicial | Rondas MTP afinado |
|---|---:|---:|
| 0 | 25 | 38 |
| 1 | 646 | 436 |
| 2 | 485 | 261 |
| 3 | 364 | 607 |

Tasas de prefijo aceptado del MTP afinado (lote 1):

| Longitud de prefijo | Recuento aceptado | Tasa acumulada | Tasa condicional |
|---|---:|---:|---:|
| 1 | 1304 | 97,17% | 97,17% |
| 2 | 868 | 64,68% | 66,56% |
| 3 | 607 | 45,23% | 69,93% |

El WER se calculó con `whisper_normalizer.english.EnglishTextNormalizer` 0.1.12 y jiwer 4.0.0. La convención de longitud de aceptación de vLLM es `1 + borradores aceptados / rondas de verificación con draft`. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 1,6 GB en BF16; hay que sumar la del verificador Ming-3.0-asr-tiny, no especificada en la información disponible.
- GPU recomendadas: el autor validó con GPU H200 (BF16, TP1). No se documentan otras GPU.
- GPU de consumo: no disponible; no se han publicado pruebas en RTX 4090 u otras consumer.
- Despliegue: vLLM con decodificación especulativa nativa (librería declarada vllm, custom_code). No se documentan opciones llama.cpp, Ollama o TGI.
- Latencia y throughput: no se publican cifras absolutas de latencia ni tokens por segundo; solo la longitud media de aceptación (3,07 con el draft afinado frente a 2,78 con el inicial) y el WER, con una única ejecución por configuración, por lo que las mediciones son exploratorias.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---:|---|---|---|
| wirybeaver/Ming-3.0-asr-tiny-mtp | Draft MTP nativo | 799.474.048 totales / 316.604.672 entrenables | no disponible | en, zh, ja | MIT | Aceptación 3,07; WER 0,9649% (lote 1) |
| wirybeaver/Ming-3.0-asr-tiny-dspark | Draft alternativo para el mismo verificador | no disponible | no disponible | no disponible | no disponible | Comparte cohorte de entrenamiento; sin datos de aceptación en esta información |
| inclusionAI/Ming-3.0-asr-tiny | Verificador ASR | no disponible | no disponible | en, zh, ja | no disponible | Modelo base congelado; sin draft, aceptación no aplica |

No se dispone de datos de otros drafts MTP comparables en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo ASR autónomo: requiere cargar el verificador inclusionAI/Ming-3.0-asr-tiny (revisión `ac95e7b1678c08ea6f4a2581a051e432ed63e9b7`) y su procesador de audio y tokenizador.
- El rendimiento está validado solo en inglés (cohorte SeedTTS de 256 peticiones); no hay métricas de aceptación publicadas para chino o japonés.
- El japonés tiene cobertura de entrenamiento muy limitada (6,64 horas, 2.099 clips), lo que puede degradar la aceptación en ese idioma.
- Las mediciones de vLLM son de una sola ejecución por configuración y el propio autor las califica de exploratorias; no deben tomarse como garantía de latencia en producción.
- Las comprobaciones de duplicados solo cubren solapamiento canónico PCM16 a 16 kHz; no garantizan disjunción de hablantes ni detectan casi-duplicados.
- Riesgo de alucinación: al ser un draft, los tokens propuestos son corregidos por el verificador, pero un verificador con sesgos o errores los propagará; la coincidencia exacta con el verificador se midió solo en la cohorte fija.
- Sesgos: no se documenta ningún análisis de sesgo demográfico, acento o dominio; los corpus incluyen LibriSpeech, People's Speech, VoxPopuli, AISHELL-1 y FLEURS, con posible desequilibrio de dominio y hablante.
- Licencia MIT permite uso comercial, pero el verificador subyacente tiene su propia licencia, no indicada en esta información; verificar antes de desplegar en producción.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es un artefacto reciente (creado el 2026-11-12) sin validación comunitaria.
- El contexto máximo no está documentado; el empaquetado de 16.384 tokens durante el entrenamiento no implica que el modelo soporte grabaciones de esa duración.

## Enlaces

- Hugging Face: https://huggingface.co/wirybeaver/Ming-3.0-asr-tiny-mtp
- Modelo base (verificador): https://huggingface.co/inclusionAI/Ming-3.0-asr-tiny
- Draft previo con cohorte compartida: https://huggingface.co/wirybeaver/Ming-3.0-asr-tiny-dspark
