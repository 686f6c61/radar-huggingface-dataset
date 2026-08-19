# TieIncred/VaaniCall

## Resumen

VaaniCall es un modelo de reconocimiento automático de voz (ASR) multilingüe desarrollado por Tausif Iqbal (TieIncred) sobre la plataforma NVIDIA NeMo. Está diseñado específicamente para transcribir audio telefónico en 11 idiomas de la India (hindi, bengalí, tamil, telugu, kannada, malayalam, maratí, guyaratí, punyabí, oriya e inglés) sin necesidad de especificar el idioma de entrada, gracias a su capacidad de identificación de idioma de cero disparos (zero-shot language ID). El modelo se basa en la arquitectura FastConformer con decodificador RNN-Transducer (RNNT) y se ha ajustado a partir del modelo VAANI mediante un pipeline de 21 etapas de aumento de audio telefónico, lo que lo hace robusto frente a códecs, pérdida de paquetes y ruido de terminal.

El problema que resuelve es la transcripción fiable de llamadas de centros de contacto, VoIP y PSTN en un contexto multilingüe, donde los sistemas ASR genéricos como Whisper fallan estrepitosamente en idiomas indios (WER superior al 80% en IndicVoices). VaaniCall reduce ese error a aproximadamente un 24% de WER en condiciones telefónicas y mantiene un rendimiento estable en audio limpio, sin penalizar la precisión. Su relevancia actual radica en la creciente demanda de soluciones de voz para el sector servicios y la administración en la India, así como en su licencia Apache 2.0, que permite uso comercial sin restricciones.

El repositorio ocupa 1,8 GB (formato `.nemo`) y el modelo se distribuye a través de Hugging Face. No se especifican el número total de parámetros ni la longitud de contexto, aunque por el tamaño del archivo y la arquitectura FastConformer se estima un modelo de cientos de millones de parámetros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | FastConformer + RNNT (EncDecRNNTBPE) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hi, bn, ta, te, kn, ml, mr, gu, pa, or, en |
| Licencia | Apache-2.0 |
| Formato de pesos | .nemo (NeMo) |

## Arquitectura y entrenamiento

VaaniCall utiliza la arquitectura FastConformer de NVIDIA, una variante eficiente del conformer que combina capas de atención y convoluciones con un mecanismo de downsampling para reducir el coste computacional. El decodificador es un RNN-Transducer (RNNT), que permite la transcripción en streaming (procesamiento incremental) y es adecuado para aplicaciones en tiempo real como la transcripción de llamadas. El modelo se ha ajustado a partir del modelo VAANI (desarrollado por ARTPARK-IISc) utilizando los datasets IndicVoices (AI4Bharat) y Vaani, y se ha sometido a un pipeline de 21 etapas de aumento de audio telefónico que incluye códecs, pérdida de ráfagas, ecualización de terminales y respuestas de sala. Este entrenamiento específico hace que el modelo sea robusto frente a las condiciones reales de una llamada, sin sacrificar el rendimiento en audio limpio (el WER en IndicVoices clean pasa de 24,20% a 24,06% en telefónico, una variación mínima).

La innovación clave es la identificación de idioma de cero disparos: el modelo infiere automáticamente el idioma y la escritura de cada segmento de audio, eliminando la necesidad de un argumento `lang` en la inferencia. Esto simplifica el despliegue en sistemas donde la mezcla de idiomas es habitual.

## Capacidades

- Transcripción de voz a texto en 11 idiomas indios y en inglés, con salida en escritura nativa (devanagari, bengalí, tamil, etc.).
- Identificación de idioma de cero disparos: no requiere especificar el idioma de entrada, lo que facilita el procesamiento de llamadas multilingües.
- Robustez frente a audio telefónico: códecs (AMR, G.711), pérdida de paquetes, ruido de fondo y ecualización de terminales.
- Inferencia en streaming gracias al decodificador RNNT, adecuada para aplicaciones en tiempo real.
- Soporte para audio de centros de contacto, VoIP y PSTN.
- Buen rendimiento en audio limpio fuera del dominio telefónico (por ejemplo, en el conjunto FLEURS).
- Integración con el ecosistema NVIDIA NeMo (formato `.nemo`), lo que permite usar herramientas de entrenamiento, evaluación y despliegue de NeMo.

## Casos de uso

- Transcripción de llamadas de centros de atención al cliente: el modelo puede procesar conversaciones telefónicas en varios idiomas indios sin configuración previa, generando transcripciones precisas para análisis de calidad, cumplimiento normativo o entrenamiento de agentes.
- Análisis de voz en banca y seguros: permite extraer información de llamadas de soporte o reclamaciones en hindi, tamil o bengalí, facilitando la detección de fraudes o la medición de satisfacción del cliente.
- Subtitulado automático de reuniones y conferencias telefónicas: su capacidad de streaming y su robustez al ruido lo hacen útil para generar subtítulos en tiempo real en herramientas de colaboración.
- Asistentes de voz para servicios gubernamentales: puede transcribir consultas ciudadanas en idiomas regionales, habilitando sistemas de respuesta automática o de derivación a agentes humanos.
- Archivado y búsqueda de grabaciones: al transcribir llamadas históricas, permite indexar y buscar contenido por palabras clave, mejorando la gestión documental en empresas.
- Evaluación de calidad en telecomunicaciones: el modelo puede usarse para medir la inteligibilidad de llamadas en diferentes condiciones de red, comparando transcripciones con la referencia.
- Desarrollo de sistemas de traducción automática de voz: al proporcionar transcripciones fiables en idiomas indios, puede servir como etapa previa para traducción a otros idiomas.

## Benchmarks y rendimiento

Los resultados que se muestran a continuación son los declarados por el autor en la model card de Hugging Face. No han sido verificados de forma independiente. Las evaluaciones se realizaron con 500 clips por idioma.

| Conjunto de datos | Condición | WER (%) | CER (%) |
|---|---|---|---|
| IndicVoices (telephonic) | test | 24,06 | 8,26 |
| IndicVoices (clean) | test | 24,20 | 8,31 |
| Google FLEURS (clean) | test | 23,52 | 8,34 |

Comparación con Whisper large-v3 (según la model card, sobre 500 clips por idioma):

| Conjunto de datos | Condición | VaaniCall WER | Whisper large-v3 WER | Reducción relativa |
|---|---|---|---|---|
| IndicVoices | Clean | 24,20% | 84,07% | 71% |
| IndicVoices | Telephonic | 24,06% | 84,50% | 72% |
| Google FLEURS | Clean | 23,52% | 65,23% | 64% |

En la tabla desglosada por idioma (IndicVoices telephonic), VaaniCall supera a Whisper large-v3 en todos los idiomas indios, con mejoras que van desde el 30% (hindi) hasta más del 80% (malayalam, telugu). Sin embargo, Whisper large-v3 sigue siendo superior en inglés (WER 7,80% frente a 13,26% de VaaniCall en la condición telefónica).

## Requisitos de hardware

- No se dispone de información oficial sobre requisitos de VRAM ni GPU recomendadas.
- El tamaño del repositorio (1,8 GB) sugiere que el modelo puede ejecutarse en GPUs de consumo con al menos 6-8 GB de VRAM en precisión FP16, pero no hay confirmación.
- Para inferencia en producción, se puede desplegar mediante el runtime de NVIDIA NeMo, Triton Inference Server o herramientas compatibles con el formato `.nemo`.
- Dado que el modelo no es muy grande, es probable que sea viable en GPUs como RTX 3060/4060 o superiores, así como en instancias cloud con una sola GPU.
- La latencia y el throughput dependen del hardware y de la configuración de streaming; no se han publicado cifras.

## Comparativa con modelos similares

La comparación más directa es con Whisper large-v3, que es el modelo ASR multilingüe de referencia. Los datos de la model card muestran que VaaniCall supera ampliamente a Whisper en idiomas indios, pero es inferior en inglés. Otras alternativas en el espacio de ASR para idiomas indios son:

| Modelo | Idiomas | Arquitectura | Contexto | Licencia | Rendimiento en IndicVoices |
|---|---|---|---|---|---|
| VaaniCall | 11 indios + inglés | FastConformer + RNNT | no disponible | Apache-2.0 | WER 24,06% (telefónico) |
| Whisper large-v3 | 99 idiomas | Transformer encoder-decoder | 30 segundos de audio | MIT | WER 84,50% (telefónico) |
| IndicWav2Vec (si existe) | varios indios | wav2vec 2.0 | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos comparables con datos verificados, por lo que la comparación se limita a Whisper large-v3.

## Limitaciones y advertencias

- Los benchmarks publicados son declarados por el autor y no han sido verificados de forma independiente; los resultados deben tomarse con cautela.
- El modelo solo cubre 11 idiomas, por lo que no es adecuado para otros idiomas de la India (como asamés, sindhi o konkaní).
- En inglés, el rendimiento es inferior al de Whisper large-v3, por lo que no es recomendable para tareas centradas en inglés.
- No se especifica la longitud máxima de audio que puede procesar el modelo; para clips muy largos puede ser necesario segmentar.
- No se han publicado análisis de sesgos o comportamientos en condiciones extremas de ruido (más allá de las simuladas en el pipeline).
- Aunque la licencia Apache 2.0 permite uso comercial, se recomienda revisar los términos de los datasets de entrenamiento (IndicVoices y Vaani) para verificar posibles restricciones de uso.
- El modelo se distribuye únicamente en formato `.nemo`, lo que limita su uso fuera del ecosistema NeMo (aunque se puede convertir a otros formatos con herramientas de NeMo).

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/TieIncred/VaaniCall)
- [Paper (arXiv:2603.28714)](https://arxiv.org/abs/2603.28714)
- [Dataset IndicVoices (AI4Bharat)](https://huggingface.co/datasets/ai4bharat/IndicVoices)
- [Dataset Vaani (ARTPARK-IISc)](https://huggingface.co/datasets/ARTPARK-IISc/Vaani)
- [NVIDIA NeMo](https://github.com/NVIDIA/NeMo)
