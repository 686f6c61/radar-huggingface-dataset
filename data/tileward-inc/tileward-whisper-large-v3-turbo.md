# Tileward-Inc/Tileward-whisper-large-v3-turbo

## Resumen

Tileward-whisper-large-v3-turbo es una versión comprimida del modelo de reconocimiento automático del habla (ASR) Whisper large-v3-turbo de OpenAI, desarrollada por Tileward Inc. El modelo reduce el tamaño del fichero de pesos de 1,62 GB a 0,56 GB, lo que supone una compresión del 65 % (un factor de 2,9x respecto al original). La compresión se realiza sin cambiar la tarea: sigue siendo un modelo de transcripción de audio a texto con la misma interfaz de pipeline (`automatic-speech-recognition`).

La propuesta de valor es el despliegue en entornos con recursos limitados: según la model card, en una única tarjeta de 20 GB caben 331 llamadas en vivo (un segundo de audio transcrito por segundo) frente a las 301 del modelo original. La precisión se mantiene a la par de turbo en seis de los diez conjuntos de prueba evaluados y empeora entre 0,09 y 0,68 puntos en los cuatro restantes (test-other de LibriSpeech, árabe, mandarín y japonés).

Es relevante porque demuestra que es posible reducir drásticamente el peso de un modelo ASR de referencia manteniendo una tasa de error competitiva, lo que abarata la inferencia en producción. No obstante, los pesos no están publicados en Hugging Face: el modelo solo se ofrece mediante la API alojada de Tileward, en la nube del cliente o en entornos aislados (air-gapped).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), versión comprimida de large-v3-turbo |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (ventana de audio de 30 s propia de Whisper) |
| Tipos de cuantizacion | no disponible (compresión propietaria de Tileward; no se detalla el esquema) |
| Idiomas soportados | no disponible (la evaluación cubre siete idiomas de FLEURS, entre ellos árabe, mandarín y japonés) |
| Licencia | MIT |
| Formato de pesos | no disponible (los pesos no se publican; solo acceso vía API o despliegue gestionado) |

## Arquitectura y entrenamiento

El modelo parte de `openai/whisper-large-v3-turbo`, un transformer encoder-decoder con atención estándar diseñado para transcripción y traducción de voz. Tileward aplica un proceso de compresión propietario que reduce el fichero de pesos de 1,62 GB a 0,56 GB (2,9x más pequeño), sin que la model card detalle la técnica exacta (poda, cuantización, destilación o una combinación). El resultado se distribuye como un modelo cuantizado (`base_model_relation: quantized`) respecto al original.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset de calibración o ajuste, ni si hubo etapas de RLHF o ajuste fino supervisado. La evaluación reportada se apoya en diez conjuntos de prueba: LibriSpeech test-clean y test-other, FLEURS en siete idiomas y 384 clips sintéticos de call-center.

## Capacidades

- Reconocimiento automático del habla (ASR): transcripción de audio a texto.
- Traducción de voz (heredada de la arquitectura Whisper; no confirmada explícitamente en la model card).
- Procesamiento multilingüe: la evaluación incluye siete idiomas de FLEURS, con mención explícita de árabe, mandarín y japonés.
- Manejo de audio de llamadas y dominios de call-center (evaluado con 384 clips sintéticos).
- No se documenta soporte de tool calling, function calling, agentes ni razonamiento multi-paso (no es un modelo de ese tipo).
- No se documentan modos especiales como thinking mode, visión o audio generativo.

## Casos de uso

- Transcripción de reuniones y notas de voz: el modelo procesa audio en ventanas de 30 s y permite transcribir conversaciones multi-turno; su reducido tamaño (0,56 GB) facilita el despliegue en servidores modestos.
- Subtitulado automático de vídeo: con una tasa de error a la par de turbo en seis de diez conjuntos, es adecuado para generar subtítulos en inglés y varios idiomas europeos, con cautela en japonés y mandarín.
- Analítica de call-centers: la evaluación incluye clips sintéticos de call-center, por lo que encaja en pipelines de transcripción masiva de llamadas para análisis de calidad y cumplimiento.
- Asistentes de voz en producción: al caber 331 llamadas en vivo en una GPU de 20 GB, permite atender transcripciones en tiempo real con menor coste por hora de audio que el modelo original.
- Despliegue en entornos aislados (air-gapped): Tileward ofrece ejecución en la nube del cliente o sin conexión, útil en sectores regulados que no pueden enviar audio a APIs públicas.
- Prototipado rápido vía API: con 25 USD de crédito inicial sin tarjeta en app.tileward.com, permite validar la calidad de transcripción antes de comprometer infraestructura propia.
- Investigación en compresión de modelos: sirve como referencia para estudiar el equilibrio entre tamaño y tasa de error en ASR.

## Benchmarks y rendimiento

| Metrica | Whisper large-v3-turbo | Tileward-whisper-large-v3-turbo |
|---|---|---|
| Tamano del fichero | 1,62 GB | 0,56 GB |
| Llamadas en vivo en una GPU de 20 GB | 301 | 331 |
| Tasa de error en LibriSpeech test-clean | referencia | a la par |
| Tasa de error en LibriSpeech test-other | referencia | 0,09–0,68 puntos peor |
| Tasa de error en FLEURS (arabe) | referencia | 0,09–0,68 puntos peor |
| Tasa de error en FLEURS (mandarin) | referencia | 0,09–0,68 puntos peor |
| Tasa de error en FLEURS (japones) | referencia | 0,09–0,68 puntos peor |
| Resto de conjuntos (6 de 10) | referencia | a la par |

No se publican valores absolutos de WER por conjunto en la información disponible; solo se indica la comparación relativa frente a turbo. No hay datos de MMLU, HumanEval ni GSM8K por tratarse de un modelo ASR.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; la model card cita una GPU de 20 GB como referencia para las 331 llamadas en vivo, lo que sugiere que el modelo completo cabe holgadamente en tarjetas de gama alta.
- GPU recomendadas: no especificadas; por el tamaño del fichero (0,56 GB) es plausible su ejecución en GPUs consumer, aunque no se confirma en la información disponible.
- Cabe en GPU consumer: no confirmado explícitamente, pero el tamaño de pesos lo hace verosímil en tarjetas con 8 GB o más.
- Opciones de despliegue: API alojada de Tileward, despliegue en la nube del cliente o air-gapped. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 331 llamadas en vivo por segundo en una GPU de 20 GB (un segundo de audio transcrito por segundo y por llamada); no se detalla la latencia por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tileward-whisper-large-v3-turbo | no disponible | audio de 30 s | 0,56 GB | MIT | solo API/gestionado |
| openai/whisper-large-v3-turbo | no disponible | audio de 30 s | 1,62 GB | MIT | pesos abiertos en HF |
| openai/whisper-large-v3 | no disponible | audio de 30 s | no disponible | MIT | pesos abiertos en HF |

Frente a whisper-large-v3, Tileward reporta una compresión del 68 % en su artículo de investigación, aunque los datos concretos de esa comparación no se detallan en la model card. La principal diferencia operativa con los modelos de OpenAI es que Tileward no publica los pesos, lo que limita la inspección, el ajuste fino y el despliegue autónomo.

## Limitaciones y advertencias

- Pesos no publicados: no es posible descargar el modelo, inspeccionarlo ni ajustarlo localmente; el uso queda ligado a la infraestructura de Tileward.
- Pérdida de precisión en cuatro conjuntos: test-other de LibriSpeech, árabe, mandarín y japonés empeoran entre 0,09 y 0,68 puntos frente a turbo.
- Idiomas no documentados: la lista completa de idiomas soportados no está disponible, lo que dificulta planificar despliegues multilingües.
- Esquema de compresión no transparente: no se detalla la técnica (poda, cuantización, destilación), lo que complica evaluar riesgos de degradación en dominios no testeados.
- Riesgo de alucinación: inherente a los modelos Whisper en audio con ruido, silencios o habla solapada; no se documentan mitigaciones específicas.
- Sesgos: no se documentan análisis de sesgo por acento, género o edad.
- Licencia MIT: permite uso comercial, pero al no haber pesos disponibles, la práctica comercial depende de los términos del servicio de Tileward.
- Sin datos de latencia por petición ni de coste por hora de audio más allá del crédito inicial de 25 USD.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tileward-Inc/Tileward-whisper-large-v3-turbo
- Modelo base: https://huggingface.co/openai/whisper-large-v3-turbo
- Artículo de investigación: https://tileward.com/research/a-smaller-speech-recogniser/
- Repositorio de investigación de Tileward: https://tileward.com/research/
- Sitio de Tileward: https://tileward.com
- Aplicación y API: https://app.tileward.com/?join=explore
