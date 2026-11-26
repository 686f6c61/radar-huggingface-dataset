# TuanPhat/GipFormer-1.5-LifeMate-v4

## Resumen

GipFormer 1.5 LifeMate v4 es un modelo de reconocimiento automatico del habla (ASR) en vietnamita, publicado por el usuario TuanPhat en Hugging Face. Se trata de un fine-tuning del checkpoint GipFormer 1.5 de 68M de parametros desarrollado por G-Group AI Lab, que emplea una arquitectura zipformer-transducer, una variante de los modelos transducer (RNN-T) que sustituye el encoder recurrente por bloques zipformer, mas eficientes en computo y memoria.

El modelo forma parte del pipeline del agente de voz LifeMate, presentado al Zalo AI Challenge 2026, donde el sistema completo obtuvo una puntuacion de 49,18000 en el conjunto de test publico. El checkpoint se distribuye en formato safetensors y ONNX, con una variante cuantizada a int8, lo que facilita su despliegue en entornos con recursos limitados.

Con 69.651.494 parametros y un tamano de repositorio de 0,4 GB, es un modelo compacto orientado a inferencia de baja latencia en produccion. Su relevancia radica en ser un ejemplo de adaptacion de un modelo base abierto a un dominio conversacional concreto, manteniendo la licencia MIT del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | zipformer-transducer (encoder zipformer + decoder/predictor + joint network) |
| Parametros totales | 69.651.494 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR por segmentos de audio) |
| Tipos de cuantizacion | int8 (variante ONNX cuantizada); safetensors en precision original |
| Idiomas soportados | vietnamita (vi) |
| Licencia | MIT |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura zipformer-transducer, un diseno de tipo RNN-T en el que el encoder utiliza bloques zipformer: estructuras con atencion multi-cabeza y convoluciones que operan sobre resoluciones temporales variables, reduciendo el coste computacional frente a un transformer convencional. El modelo base GipFormer 1.5 de G-Group AI Lab tiene 68M de parametros y esta especializado en vietnamita.

Este checkpoint concreto (LifeMate v4) es un fine-tuning del modelo base para el dominio del agente de voz LifeMate. La model card no especifica el volumen de datos de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables habitualmente en ASR). Tampoco se detalla la estrategia de aumento de datos ni el esquema de decodificacion empleado en la evaluacion.

## Capacidades

- Reconocimiento automatico del habla en vietnamita a partir de ficheros de audio.
- Salida en formato JSON, un registro por fichero de audio procesado.
- Inferencia mediante script de Python 3.12 incluido en el repositorio.
- Despliegue en ONNX, incluida una variante cuantizada a int8 para entornos con menos recursos.
- Adaptacion al dominio conversacional del agente de voz LifeMate.
- No se documentan capacidades de traduccion, diarizacion, deteccion de idioma ni puntuacion automatica.

## Casos de uso

- Agente de voz conversacional: el modelo transcribe las intervenciones del usuario en vietnamita para alimentar el resto del pipeline del agente LifeMate, que fue su dominio de fine-tuning.
- Subtitulado automatico de audio en vietnamita: genera transcripciones a partir de ficheros WAV mediante el script de inferencia incluido.
- Integracion en aplicaciones moviles o embebidas: la variante ONNX int8 y el tamano de 0,4 GB permiten ejecutar el modelo en dispositivos con memoria limitada.
- Procesamiento por lotes de grabaciones: el script imprime un registro JSON por audio, lo que facilita el volcado de transcripciones a un pipeline de datos.
- Prototipado de asistentes de voz: al estar bajo licencia MIT, se puede modificar y redistribuir sin restricciones para experimentar con ASR en vietnamita.
- Base para nuevos fine-tunings de dominio: al derivar de un checkpoint abierto de 68M de parametros, sirve como punto de partida para adaptar ASR a otros dominios en vietnamita.

## Benchmarks y rendimiento

La unica metrica publicada es la puntuacion del pipeline completo LifeMate v4 en el conjunto de test publico del Zalo AI Challenge 2026: 49,18000. La model card no desglosa la metrica (no se especifica si es WER, CER u otra), no ofrece resultados aislados del modelo ASR y no compara con otros sistemas.

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con 69,7M de parametros, la inferencia en fp32 requiere del orden de 0,3 GB solo para pesos, y la variante int8 aproximadamente 0,07 GB para pesos, mas el coste de activaciones y del procesado de audio.
- GPU recomendadas: no disponibles; por tamano, cualquier GPU consumer moderna es suficiente en teoria, aunque no hay datos publicados de latencia ni throughput.
- Cabe en GPU consumer: si, por el tamano del modelo, aunque no se aportan mediciones.
- Opciones de despliegue: ONNX Runtime (formato nativo del repositorio) y ejecucion mediante el script `inference.py` con Python 3.12. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no son adecuados para un modelo transducer de ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Idiomas | Formato | Licencia | Contexto |
|---|---|---|---|---|---|
| GipFormer 1.5 LifeMate v4 | 69,7M | vi | safetensors, ONNX (int8) | MIT | no disponible |
| g-group-ai-lab/gipformer1.5-68M-rnnt (modelo base) | 68M | vi | no disponible en esta ficha | no disponible en esta ficha | no disponible |
| Whisper (variantes pequenas de OpenAI) | segun variante | multilingue | safetensors, GGUF | MIT | 30 s de audio por ventana |

La comparacion con Whisper se incluye solo como referencia de categoria (ASR multilingue de proposito general); no se dispone de datos de rendimiento comparativos entre ambos modelos en la informacion proporcionada. No se identifican otros modelos comparables con datos verificables.

## Limitaciones y advertencias

- Solo soporta vietnamita; no se documenta comportamiento en otros idiomas.
- No se han publicado resultados de benchmarks desglosados ni mediciones de WER/CER del modelo aislado.
- Al ser un fine-tuning de dominio (agente de voz LifeMate), puede degradarse en dominios acusticos o tematicos alejados del entrenamiento.
- Riesgo de alucinacion en la transcripcion: como todo modelo ASR, puede generar texto plausible no presente en el audio, especialmente con ruido o acentos no vistos.
- No se documentan sesgos especificos, pero al entrenarse sobre un dominio concreto puede tener peor rendimiento en determinados acentos, edades o condiciones acusticas.
- La licencia MIT permite uso comercial, pero se recomienda verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, y fue creado en noviembre de 2026; no hay evidencia de uso en produccion ni validacion independiente.
- No se especifica la metrica exacta de la puntuacion 49,18000, por lo que no es comparable directamente con WER de otros sistemas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TuanPhat/GipFormer-1.5-LifeMate-v4
- Modelo base GipFormer 1.5 de G-Group AI Lab: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt/tree/dd9227dcd8705c13f33bdbe59728d546ab94480f
- Repositorio del modelo base: https://huggingface.co/g-group-ai-lab/gipformer1.5-68M-rnnt
- Zalo AI Challenge: no disponible enlace en la informacion proporcionada.
