# Vana-Labs/stt-fastconformer-armenian

## Resumen

Este repositorio contiene una exportación a ONNX del modelo de reconocimiento automático de voz (ASR) en armenio de NVIDIA, `nvidia/stt_hy_fastconformer_hybrid_large_pc`, manteniendo su rama transducer (RNNT). Lo publica Vana-Labs como artefacto listo para inferencia local, pensado originalmente para Tetro, una aplicación de transcripción de reuniones que se ejecuta de forma local en macOS. No es un modelo entrenado desde cero: es una conversión de pesos que conserva la licencia CC-BY-4.0 del original.

La arquitectura subyacente es FastConformer, una revisión del Conformer con un esquema de downsampling que, según el artículo original (arXiv 2305.05084), es aproximadamente 2,8 veces más rápida que el Conformer clásico y escala a miles de millones de parámetros. El modelo base pertenece a la familia «large» híbrida (entrenada con dos pérdidas, Transducer y CTC) e incorpora puntuación y capitalización, además de estar especializado en armenio (`hy`).

Su relevancia práctica está en que empaqueta el modelo en ficheros ONNX de tamaño reducido (125 MB el encoder en int8, 5 MB el decoder-joint) que se pueden ejecutar en CPU sin GPU, con un runtime ligero como `onnx-asr`. El autor verifica que la salida coincide con el decodificador RNNT nativo de NeMo en tres muestras de Common Voice hy-AM, tanto a precisión completa como en int8, aunque no publica métricas de precisión propias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer (encoder) + transducer RNNT (decoder-joint), exportado a ONNX |
| Parametros totales | no disponible en la model card; el encoder a fp32 ocupa 435 MB, lo que a 4 bytes por parametro implica del orden de 108 M de parametros (estimacion por tamano de fichero) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de audio; la model card no especifica limite de duracion) |
| Tipos de cuantizacion | int8 dinamica (`onnxruntime.quantize_dynamic`) y fp32 sin cuantizar |
| Idiomas soportados | armenio (`hy`) |
| Licencia | CC-BY-4.0 |
| Formato de pesos | ONNX (`encoder-model.onnx`, `decoder_joint-model.onnx`, variantes `.int8.onnx`), preprocesador `nemo80.onnx` y `vocab.txt` |

## Arquitectura y entrenamiento

El modelo es un FastConformer con cabeza transducer RNNT. El encoder aplica un factor de subsampling de 8 sobre características log-mel de 80 bandas (`config.json`: `nemo-conformer-rnnt`, 80 features, subsampling 8). El vocabulario es de 1024 tokens SentencePiece más un token `<blk>` en el índice 1024. La exportación se realizó con NeMo usando `set_export_config({"decoder_type": "rnnt"})` seguido de `export`; los ficheros int8 se generaron con cuantización dinámica de onnxruntime. El modelo base es la variante híbrida «large» de NVIDIA, que se entrena con dos objetivos simultáneos (Transducer por defecto y CTC), aunque esta exportación solo incluye la rama RNNT.

Vana-Labs no aporta datos de entrenamiento propios: el dataset, el número de tokens y el posible uso de RLHF/DPO corresponden al modelo base de NVIDIA y no se detallan en la información disponible. Tampoco hay innovaciones técnicas añadidas más allá de la propia conversión a ONNX y la cuantización dinámica int8. La verificación publicada consiste en comparar, sobre tres clips de test de Common Voice hy-AM, la salida del decodificador RNNT de NeMo con la de esta exportación: el texto coincide tanto a precisión completa como en int8, lo que confirma fidelidad de la conversión, pero no aporta ninguna medida de precisión absoluta.

## Capacidades

- Reconocimiento de voz en armenio (`hy`), con entrada de audio mono a 16 kHz.
- Transcripción con puntuación y capitalización, heredadas de la variante `_pc` del modelo base.
- Decodificación transducer (RNNT) sin necesidad de alineamientos externos ni modelo de lenguaje auxiliar.
- Inferencia en CPU gracias a los ficheros int8 y al runtime `onnx-asr` (compatible con cualquier runtime que cargue modelos NeMo Parakeet ONNX).
- Compatible con despliegue ligero en local (el caso de uso declarado es Tetro, transcripción de reuniones en macOS).
- No soporta tool calling ni function calling.
- No está orientado a agentes ni a razonamiento multi-paso.
- No es multilingüe: solo armenio.
- No dispone de modo «thinking», ni visión, ni audio generativo, ni traducción.

## Casos de uso

- Transcripción de reuniones en local: es el escenario para el que se creó (Tetro), ejecutando la inferencia en el propio dispositivo sin enviar audio a la nube gracias a los 130 MB del paquete int8.
- Subtitulado de contenido audiovisual en armenio: el modelo genera texto con puntuación y mayúsculas, lo que reduce el post-procesado necesario para publicar subtítulos legibles.
- Analítica de contact center: transcripción de llamadas en armenio para posterior búsqueda, clasificación y control de calidad; el tamaño reducido permite desplegarlo en varias instancias sin GPU dedicada.
- Archivado y búsqueda de audio: convertir grabaciones históricas o podcasts en texto indexable, con la ventaja de que el formato ONNX se integra fácilmente en pipelines de datos existentes.
- Accesibilidad: generación de transcripciones para personas con discapacidad auditiva en entornos de habla armenia, ejecutable en portátiles sin acelerador.
- Investigación lingüística y de ASR: al ser una exportación fiel de un modelo NeMo, sirve como referencia para comparar decodificadores o estudiar el efecto de la cuantización int8 en armenio.
- Prototipado en edge o móvil: los 125 MB del encoder int8 permiten integrar ASR armenio en aplicaciones con recursos limitados donde un modelo grande tipo Whisper no cabría.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la precisión se hereda del modelo base `nvidia/stt_hy_fastconformer_hybrid_large_pc` y remite a su model card para consultar resultados. La única comprobación publicada es de equivalencia funcional: en tres clips de Common Voice hy-AM, la salida del decoder RNNT de NeMo y la de esta exportación ONNX coinciden tanto a precisión completa como en int8.

## Requisitos de hardware

- Huella del modelo: 130 MB en int8 (encoder 125 MB + decoder-joint 5 MB) y 455 MB a precisión completa (encoder 435 MB + decoder-joint 20 MB), más 87 KB del preprocesador `nemo80.onnx`.
- Inferencia en CPU viable: el paquete int8 está pensado para ejecutarse sin GPU; el caso de uso declarado es un portátil macOS.
- GPU recomendadas: no se especifican; cualquier GPU moderna (RTX 3060 o superior, A100, H100) puede acelerar la inferencia mediante onnxruntime, pero no es un requisito.
- Cabe en GPU de consumo: sí, con amplio margen (el modelo completo en fp32 ronda los 0,45 GB).
- Opciones de despliegue: `onnx-asr` (recomendado por el autor), onnxruntime en cualquiera de sus backends, o cualquier runtime capaz de cargar modelos NeMo Parakeet ONNX. El modelo base puede ejecutarse con NeMo.
- Latencia y throughput: no disponibles para esta exportación. Como referencia arquitectónica, el artículo de FastConformer reporta que la arquitectura es ~2,8 veces más rápida que el Conformer original, pero no se ofrecen cifras medidas de este repositorio.
- Formatos no soportados: no hay pesos GGUF ni integración con llama.cpp, Ollama, TGI o vLLM, ya que son runtimes de modelos de lenguaje y no de ASR.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto/entrada | Puntuacion | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Vana-Labs/stt-fastconformer-armenian | no disponible (orden de 108 M estimado) | audio 16 kHz mono | Si | CC-BY-4.0 | ONNX (int8/fp32) | Exportacion RNNT de la base de NVIDIA |
| nvidia/stt_hy_fastconformer_hybrid_large_pc | no disponible | audio 16 kHz mono | Si | CC-BY-4.0 | NeMo (.nemo) | Modelo base hibrido (RNNT + CTC) |
| mheryerznka/stt_arm_fastconformer_hybrid_large_no_pc | ~115 M (segun su model card) | audio 16 kHz mono | No | no disponible (datos de entrenamiento abiertos, uso comercial permitido segun el autor) | no disponible | Variante armenia sin puntuacion ni mayusculas |
| OpenAI Whisper large-v3 | no disponible en la informacion proporcionada | audio 16 kHz mono, multilingue | Si | no disponible en la informacion proporcionada | no disponible en la informacion proporcionada | Alternativa multilingue de categoria superior en tamano; no comparable en huella de despliegue |

Las referencias de localización (`hy`) solo permiten una comparación sólida dentro de la familia FastConformer; los valores de Whisper no se incluyen porque no aparecen en la información consultada.

## Limitaciones y advertencias

- No se publican métricas de precisión (WER/CER) para este repositorio; el rendimiento real depende enteramente del modelo base y de la lengua/dialecto.
- Sesgos: no hay información sobre sesgos por acento, género o variante dialectal del armenio; solo se ha validado con muestras de Common Voice hy-AM.
- Riesgo de alucinación y errores ortográficos: la model card advierte que el modelo a veces escribe «եւ» donde se esperaría «և».
- Solo armenio: no hay soporte multilingüe, traducción ni detección automática de idioma.
- La validación funcional se limita a tres clips, por lo que no garantiza el comportamiento en dominios ruidosos, audio largo o habla espontánea.
- Restricciones de licencia: CC-BY-4.0 permite uso comercial, pero exige atribución tanto a Vana-Labs como a NVIDIA por el modelo base.
- Requiere audio mono a 16 kHz; no se documenta preprocesado para otras frecuencias o canales.
- No incluye diarización, timestamps ni segmentación de hablantes, lo que limita su uso directo en transcripción de reuniones sin herramientas adicionales.
- Es un artefacto de inferencia: no admite ajuste fino ni entrenamiento continuado en este formato.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vana-Labs/stt-fastconformer-armenian
- Modelo base: https://huggingface.co/nvidia/stt_hy_fastconformer_hybrid_large_pc
- Runtime recomendado (onnx-asr): https://github.com/istupakov/onnx-asr
- Articulo de FastConformer: https://arxiv.org/abs/2305.05084
- Variante armenia sin puntuacion: https://huggingface.co/mheryerznka/stt_arm_fastconformer_hybrid_large_no_pc
- Repositorio Armenian-Voice-Ai (referencia de entrenamiento): https://github.com/armanvardanyan07/Armenian-Voice-Ai/tree/main/training
