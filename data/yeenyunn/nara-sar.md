# YeeNyunn/nara-sar

## Resumen

Nara SAR es un modelo de reconocimiento automático del habla (ASR) especializado en birmano, inglés y habla mixta, desarrollado por Nara (naraaudio.app). Se trata de un fine-tune del modelo Meta omniASR-CTC-300M, una arquitectura CTC con aproximadamente 325 millones de parámetros, orientada a inferencia offline en CPU. Su relevancia radica en cubrir un par de idiomas poco representados en el ecosistema ASR open source, con una licencia permisiva (Apache-2.0) y artefactos listos para despliegue local sin dependencia de servicios en la nube.

El modelo se distribuye con múltiples representaciones de los mismos pesos acústicos: checkpoint completo en safetensors, exportaciones ONNX en FP32 e INT8, un modelo de lenguaje de caracteres bilingüe (6-grama) y un decodificador de beam search con restricciones estructurales para sílabas birmanas. No incluye datasets de entrenamiento ni un pipeline completo de reproducción del entrenamiento, sino únicamente pesos de inferencia y código de inferencia.

La versión publicada corresponde al checkpoint "run3, step 6000" del fine-tune. El autor no reporta evaluación independiente en held-out ni métricas CER/WER, por lo que cualquier uso en producción debe acompañarse de una validación propia sobre el dominio objetivo.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | CTC (Connectionist Temporal Classification) sobre encoder acústico; base facebook/omniASR-CTC-300M |
| Parámetros totales | 325.549.321 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible; procesa audio en fragmentos secuenciales de 8–10 s y acepta hasta 30 min por fichero en el ejemplo |
| Tipos de cuantización | INT8 (ONNX, MatMul en INT8 y convoluciones en FP32) y FP32 (ONNX y safetensors) |
| Idiomas soportados | birmano (my), inglés (en) y habla mixta |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, ONNX (INT8 y FP32), tokenizer.model, language.lm (6-grama de caracteres), sar.json |

## Arquitectura y entrenamiento

El modelo es un fine-tune de facebook/omniASR-CTC-300M, un sistema ASR basado en CTC. La cabeza de salida es CTC con blank ID 0, y el decodificado final combina CTC prefix beam search (beam 16, top-k 10, alpha 0.6, beta 0) con un modelo de lenguaje de caracteres bilingüe de 6-grama y restricciones estructurales de sílabas birmanas. El preprocesado normaliza audio mono a 16 kHz con media cero y varianza unitaria (epsilon 1e-5) por fragmento, y el runner procesa fragmentos secuenciales de aproximadamente 8–10 segundos prefiriendo puntos de corte silenciosos.

No se detalla en la información disponible la composición del dataset de fine-tune, el número de tokens de audio, ni si se aplicaron técnicas de RLHF/DPO (no aplicables habitualmente a ASR). El autor indica explícitamente que el repositorio no contiene datasets de entrenamiento ni un pipeline completo de entrenamiento o reproducción. La innovación técnica destacable es la combinación de un decodificador con LM de caracteres y reglas estructurales de sílabas birmanas, junto con exportaciones ONNX optimizadas para CPU (INT8 en MatMul, FP32 en convoluciones).

## Capacidades

- Transcripción de voz a texto en birmano, inglés y habla mixta birmano-inglés.
- Inferencia offline en CPU, sin llamadas a servicios externos ni descarga de pesos en tiempo de ejecución.
- Decodificación con beam search CTC más LM de caracteres bilingüe y restricciones estructurales de sílabas birmanas.
- Procesamiento de ficheros de audio de hasta 30 minutos / 256 MiB en el ejemplo incluido, con remuestreo a 16 kHz y promedio de canales.
- Salida estructurada en JSON mediante la opción `--json` del runner.
- Selección de backend (ONNX INT8, ONNX FP32 o Torch FP32) y ajuste del número de hilos de CPU.
- No soporta streaming: es transcripción de audio completo, no ASR en tiempo real.
- No devuelve timestamps ni diarización.
- No hay integración automática con `transformers.pipeline()`; se debe usar el runner incluido.

## Casos de uso

- Transcripción offline de reuniones y entrevistas en birmano e inglés: el modelo procesa ficheros de hasta 30 minutos en CPU sin conexión, adecuado para entornos con requisitos de privacidad o sin acceso a la nube.
- Subtitulado de contenido audiovisual birmano: permite generar transcripciones de material grabado para postproducción, con revisión humana posterior por el riesgo de errores en nombres y números.
- Digitalización de archivos orales y patrimonio lingüístico: al ser offline y Apache-2.0, se puede desplegar en infraestructura propia para transcribir grabaciones históricas en birmano.
- Asistentes de voz en aplicaciones móviles o de escritorio: el grafo ONNX INT8 (~366 MB) permite empaquetar el modelo en aplicaciones locales con inferencia en CPU.
- Investigación en ASR de bajos recursos: sirve como punto de partida (fine-tune) para otros idiomas o dominios, dado que los pesos y el código de inferencia son abiertos.
- Procesamiento por lotes de llamadas o atención al cliente bilingüe: el runner acepta múltiples ficheros y salida JSON, integrable en pipelines internos de análisis de conversaciones.
- Transcripción de habla mixta birmano-inglés en contextos técnicos o académicos, donde los hablantes alternan idiomas dentro de la misma frase.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no reporta evaluación independiente en held-out ni métricas CER/WER, y que las comprobaciones de conversión funcional y los tests de tiempo no constituyen benchmarks de precisión.

## Requisitos de hardware

- VRAM: no aplica para el backend CPU; para el checkpoint Torch FP32 se requiere memoria RAM suficiente para ~1,3 GB de pesos más overhead de inferencia.
- GPU recomendadas: no disponibles; el modelo está orientado a CPU. No se documenta soporte GPU.
- Cabe en CPU consumer: sí; el grafo ONNX INT8 ocupa ~366 MB y el LM compartido ~84 MB, por lo que un portátil convencional es suficiente.
- Opciones de despliegue: runner propio `transcribe.py` (ONNX INT8, ONNX FP32 o Torch FP32); no hay integración con vLLM, llama.cpp, Ollama ni TGI (no aplicables a ASR CTC).
- Latencia y throughput: no se publican cifras. El runner usa por defecto 2 hilos de CPU y permite ajustar con `--threads`; el autor advierte que el número de hilos puede alterar las predicciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Idiomas | Contexto / audio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Nara SAR | 325,5 M | my, en, mixto | fragmentos 8–10 s, hasta 30 min por fichero | Apache-2.0 | Hugging Face, offline CPU |
| facebook/omniASR-CTC-300M (base) | ~300 M | multilingüe (según modelo base) | no disponible | no disponible en la información | Hugging Face |
| Whisper (OpenAI) | 39 M–1,55 B según variante | multilingüe (sin birmano específico destacado) | 30 s por ventana | MIT | Hugging Face, múltiples runtimes |

La comparación con Whisper es aproximada: no se dispone de métricas del modelo base ni de Whisper en birmano en la información proporcionada, por lo que no se puede establecer una comparación de rendimiento objetiva.

## Limitaciones y advertencias

- No hay evaluación independiente en held-out ni métricas CER/WER publicadas; el autor no reclama SOTA ni superioridad frente a otros sistemas ASR.
- Riesgo de errores, omisiones y palabras alucinadas, especialmente en nombres, números, inglés con acento y habla mixta; se recomienda revisión humana.
- La cuantización INT8, los kernels de CPU, el número de hilos y los límites de fragmento pueden alterar las predicciones; un test local cambió una palabra en inglés al variar el número de hilos en Android.
- No garantiza ortografía birmana legal en todas las salidas: la restricción estructural es solo parte del beam decoding.
- No soporta streaming, timestamps ni diarización.
- El repositorio no incluye datasets ni pipeline de entrenamiento, lo que limita la reproducibilidad.
- Licencia Apache-2.0 permite uso comercial, pero exige cumplir las secciones 4(a)–4(d): incluir la licencia, conservar avisos y atribución, marcar ficheros modificados y reproducir el NOTICE. No se debe implicar que el producto es una release oficial de Nara ni está respaldado por Nara.
- El modelo base es de Meta; se deben preservar las atribuciones de terceros correspondientes.

## Enlaces

- Hugging Face: https://huggingface.co/YeeNyunn/nara-sar
- Modelo base: https://huggingface.co/facebook/omniASR-CTC-300M
- Sitio del autor: https://naraaudio.app
- ATTRIBUTION.md: https://huggingface.co/YeeNyunn/nara-sar/blob/main/ATTRIBUTION.md
- BRANDING.md: https://huggingface.co/YeeNyunn/nara-sar/blob/main/BRANDING.md
- VALIDATION.md: https://huggingface.co/YeeNyunn/nara-sar/blob/main/VALIDATION.md
