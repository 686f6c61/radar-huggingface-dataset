# Waxech/stt-uz-fastconformer-usc

## Resumen

El modelo `Waxech/stt-uz-fastconformer-usc` es un sistema de reconocimiento automático del habla (ASR) para uzbeko, desarrollado por el usuario Waxech en el marco de un proyecto de curso universitario (COE025, Proyecto 3). Se trata de un ajuste fino del modelo `nvidia/stt_uz_fastconformer_hybrid_large_pc` de NVIDIA, que emplea la arquitectura FastConformer en configuración híbrida (transducer y CTC). El ajuste se realizó sobre un subconjunto de 25 horas del Uzbek Speech Corpus (USC) del ISSAI, tras un proceso de limpieza de datos, con un total de 27.144 clips y 23,922 horas efectivas de entrenamiento.

El problema que resuelve es la adaptación de un modelo ASR multilingüe preentrenado a un dominio y corpus específicos de uzbeko, mejorando notablemente la precisión sobre el punto de partida. Según la model card, el WER sobre una muestra fija de 1.000 clips de desarrollo pasó del 43,21% con el modelo inicial al 11,04% tras el ajuste. Es relevante para investigadores y desarrolladores que necesiten transcripción de uzbeko con un modelo NeMo listo para usar y con métricas verificables sobre el corpus USC.

El repositorio ocupa 0,5 GB y se distribuye en formato `.nemo`, propio de NVIDIA NeMo. La licencia no está especificada de forma explícita: la model card remite a la licencia del modelo de partida. El modelo genera texto en minúsculas y sin puntuación, coherente con el texto de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer híbrida (transducer + CTC) |
| Parametros totales | no disponible (modelo base etiquetado como "large" en NVIDIA NeMo) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | uzbeko (uz) |
| Licencia | no disponible (la model card remite a la del modelo base `nvidia/stt_uz_fastconformer_hybrid_large_pc`) |
| Formato de pesos | `.nemo` (NeMo); repo de 0,5 GB |
| Modelo base | `nvidia/stt_uz_fastconformer_hybrid_large_pc` (revision `cd32f63d620a7b0cb461ed00ecfc45c852eb0bef`) |
| Dataset de ajuste | `issai/Uzbek_Speech_Corpus` (subconjunto por hablante, 25 h) |
| Metricas declaradas | WER, CER |
| Libreria | NeMo |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura FastConformer de NVIDIA en su variante híbrida, que combina una cabeza transducer y una cabeza CTC sobre el mismo encoder. Ambas cabezas se entrenaron de forma conjunta durante el ajuste fino, manteniendo el tokenizador original del modelo de partida sin modificaciones. FastConformer es una evolución del Conformer que reduce el coste computacional mediante downsampling del encoder, lo que permite procesar audio con mayor eficiencia que un Conformer estándar.

El entrenamiento se realizó sobre 27.144 clips (23,922 horas) del split de train del Uzbek Speech Corpus, tras pasos de limpieza no detallados en la model card. Se usó una tasa de aprendizaje de 0,0004, seleccionada sobre el conjunto de desarrollo, y el mejor checkpoint correspondió a la época 21 de 27, evaluado por WER sobre una muestra fija de 1.000 clips de dev. No se menciona el uso de RLHF, DPO ni decodificación especulativa; la evaluación se hizo con decodificación greedy y sin modelo de lenguaje.

## Capacidades

- Reconocimiento automático del habla en uzbeko, con salida en minúsculas y sin puntuación.
- Decodificación con dos cabezas: transducer (por defecto) y CTC (seleccionable mediante `change_decoding_strategy(decoder_type="ctc")`).
- Transcripción de clips de audio individuales mediante la API `transcribe` de NeMo.
- Compatibilidad con el ecosistema NVIDIA NeMo (`nemo.collections.asr`).
- No se declaran capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio multimodal ni modo de pensamiento.
- Capacidad multilingüe limitada al uzbeko; no se documentan otros idiomas.

## Casos de uso

- Transcripción de reuniones y entrevistas en uzbeko: el modelo permite convertir audio de dominio general en texto plano en minúsculas, adecuado para actas o resúmenes posteriores. Es apropiado por su ajuste específico al corpus USC y su WER del 11,60% en dev.
- Subtitulado automático de vídeo en uzbeko: la salida sin puntuación ni mayúsculas simplifica el postprocesado para generar subtítulos SRT, y las dos cabezas permiten elegir entre transducer (mejor WER) y CTC (mejor CER) según la métrica prioritaria.
- Investigación en ASR de lenguas de bajos recursos: sirve como punto de partida reproducible para experimentos con el Uzbek Speech Corpus, dado que documenta hiperparámetros, épocas y métricas oficiales en el repositorio de código.
- Evaluación comparativa de modelos NeMo: al mantener el tokenizador y la arquitectura del modelo base, permite aislar el efecto del ajuste fino sobre el WER (43,21% a 11,04% en la muestra de dev) en estudios controlados.
- Preprocesado de datos para pipelines de NLP en uzbeko: la transcripción de audio a texto alimenta corpus para entrenamiento de modelos de lenguaje o sistemas de búsqueda, con la ventaja de que el modelo ya está adaptado al dominio del USC.
- Prototipado académico en cursos de procesado de habla: el modelo es un ejemplo completo de ajuste fino de un ASR NeMo con métricas verificables, útil como referencia docente en asignaturas de NLP.

## Benchmarks y rendimiento

| Modelo | Conjunto | WER | CER |
|---|---|---|---|
| Cabeza transducer (C4a) | USC dev | 11,60% | 3,93% |
| Cabeza CTC (C4b) | USC dev | 12,46% | 3,78% |

Las métricas se calcularon con decodificación greedy y sin modelo de lenguaje, sobre texto normalizado. Los números oficiales están en `benchmark/results/scores.csv` del repositorio de código. No se han publicado resultados de benchmarks adicionales (por ejemplo, MMLU, HumanEval o GSM8K, que no aplican a un modelo ASR) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; el repositorio de 0,5 GB sugiere un modelo de tamaño moderado, pero no se documenta la huella en memoria.
- GPU recomendadas: no disponible; al ser un modelo NeMo, se espera compatibilidad con GPUs NVIDIA, pero no se especifican modelos concretos.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: NVIDIA NeMo (`nemo.collections.asr.models.ASRModel.restore_from`) y `huggingface_hub.hf_hub_download` para descargar el archivo `.nemo`. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a este tipo de modelo ASR.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WER (USC dev) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Waxech/stt-uz-fastconformer-usc` | no disponible | no disponible | 11,60% (transducer) | no disponible (remite al base) | Hugging Face, formato `.nemo` |
| `nvidia/stt_uz_fastconformer_hybrid_large_pc` | no disponible | no disponible | 43,21% (muestra de dev según la model card) | ver model card de NVIDIA | Hugging Face, NeMo |
| Alternativas ASR para uzbeko | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables de la misma categoría en la documentación proporcionada.

## Limitaciones y advertencias

- Salida en minúsculas y sin puntuación, lo que limita su uso directo en aplicaciones que requieran texto con formato natural.
- El ajuste se realizó sobre un subconjunto de 25 horas del USC, por lo que el rendimiento puede degradarse en dominios, acentos o condiciones acústicas alejadas de ese corpus.
- El modelo base es multilingüe, pero el ajuste se limita al uzbeko; no se garantiza un comportamiento correcto en otros idiomas.
- Riesgo de alucinación y errores en audio ruidoso o con solapamiento de hablantes, no cuantificado en la model card.
- Licencia no especificada de forma explícita; antes de un uso comercial debe verificarse la licencia del modelo base `nvidia/stt_uz_fastconformer_hybrid_large_pc`.
- No se documentan sesgos demográficos ni evaluación por subgrupos de hablantes.
- Métricas obtenidas con decodificación greedy y sin modelo de lenguaje; el rendimiento con un LM externo no está documentado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Waxech/stt-uz-fastconformer-usc
- Modelo base: https://huggingface.co/nvidia/stt_uz_fastconformer_hybrid_large_pc
- Repositorio de código del proyecto: https://github.com/ata-sesli/nlp-project-3
- Dataset Uzbek Speech Corpus (ISSAI): https://huggingface.co/datasets/issai/Uzbek_Speech_Corpus
