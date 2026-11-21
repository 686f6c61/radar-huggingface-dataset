# tanedric/meralion-3-3b-asr-clearcall-j5xe

## Resumen

MERaLiON-3-3B-ASR ClearCall "J5XE" es un ajuste fino del modelo de reconocimiento de voz `MERaLiON/MERaLiON-3-3B-ASR` desarrollado originalmente por A*STAR (Agency for Science, Technology and Research, Singapur). El autor del ajuste es el usuario `tanedric`, y el modelo se creó en el contexto de ClearCall, un proyecto de fin de carrera universitario centrado en la monitorización automática de llamadas de cumplimiento normativo en el sector financiero. El objetivo es transcribir llamadas telefónicas de asesoramiento financiero en inglés, singlish, mandarín y combinaciones de código inglés-mandarín.

El modelo parte de una arquitectura de 3.307.027.712 parámetros con un encoder de voz de estilo Whisper (32 capas) y un decoder de texto Gemma-2 (26 capas), unidos por un adaptador de compresión temporal 5:1. El ajuste fino se aplicó mediante LoRA (rank 8, alpha 16) sobre el decoder y el encoder, y entrenamiento completo del adaptador, sumando 71.995.904 parámetros entrenables (2,17 % del total). Los pesos resultantes se fusionaron en BF16.

Es relevante ahora porque aborda un caso de uso muy específico y poco cubierto: la transcripción de conversaciones financieras con cambio de código y acento singapurense, un dominio donde los modelos ASR genéricos suelen fallar. Sin embargo, el propio autor advierte que se trata de un checkpoint de investigación entrenado y evaluado con llamadas sintéticas de texto-a-voz, y que es peor que el modelo base en detalles financieramente críticos como importes y cantidades en inglés agrupados por comas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder de voz estilo Whisper (32 capas) + adaptador de compresion temporal 5:1 + decoder de texto Gemma-2 (26 capas) |
| Parametros totales | 3.307.027.712 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en BF16) |
| Idiomas soportados | en, zh (incluye singlish y code-switching ingles-mandarin) |
| Licencia | MERaLiON-3 Public Licence (license: other) |
| Formato de pesos | safetensors (BF16, 14 archivos, dos shards con los pesos modificados); LoRA en safetensors (288 MB) |

## Arquitectura y entrenamiento

El modelo es un sistema ASR compuesto por un encoder de voz de estilo Whisper con 32 capas y un decoder de texto Gemma-2 con 26 capas, conectados mediante un adaptador que aplica compresión temporal 5:1. El ajuste fino entrenó tres componentes de forma conjunta: LoRA de rango 8 (alpha 16, dropout 0,05) sobre 182 módulos del decoder (q/k/v/o y gate/up/down, 10.383.360 parámetros), LoRA de rango 8 sobre 192 módulos del encoder (q/k/v/out_proj/fc1/fc2, 5.898.240 parámetros) y entrenamiento completo del adaptador con pesos maestros FP32 y cómputo BF16 (55.714.304 parámetros). El resto de pesos permaneció congelado. Las actualizaciones LoRA se fusionaron en los pesos BF16 mediante `W' = bf16(W + (alpha/r)·B·A)` y se sustituyeron los cuatro tensores del adaptador.

El entrenamiento usó entropía cruzada de tokens sobre la transcripción de referencia (teacher forcing), optimizador AdamW con weight decay 0,01, learning rate pico de 2,5e-5, 5 % de warm-up y clipping de gradiente 1,0. Se emplearon micro-batches de 1 con acumulación de gradiente de 8, durante 3 épocas de 418 actualizaciones, publicándose el checkpoint de la época 2 (seleccionado sobre llamadas de validación). Cada época muestreó cada clip de entrenamiento una vez más 1.067 clips extra extraídos uniformemente (3.344 muestras por época), con semilla 42. El entrenamiento completo consumió 1,6 GPU-horas en una porción de 24 GB de una NVIDIA RTX PRO 6000 Blackwell, con PyTorch 2.8.0, Transformers 4.57.6, PEFT 0.17.1, safetensors 0.8.0 y meralion-3-asr 0.1.0. Todos los datos de entrenamiento son sintéticos: llamadas de asesoramiento con guion (un gestor de relaciones y un cliente) renderizadas con texto-a-voz, junto con transcripciones y anotaciones de referencia.

## Capacidades

- Reconocimiento automático de voz (ASR) para llamadas telefónicas de asesoramiento financiero.
- Transcripción multilingüe en inglés, mandarín, singlish y code-switching inglés-mandarín.
- Procesamiento de audio largo mediante la pipeline del worker ClearCall: ventanas de 30 segundos cada 15 segundos con solapamiento y fusión de resultados.
- Formateo de números y reintentos acotados integrados en el worker de inferencia.
- Compatibilidad con vLLM y con la librería `meralion-3-asr` (0.1.0).
- No se documentan capacidades de tool calling, agentes, visión ni audio más allá de la transcripción.

## Casos de uso

- Monitorización de cumplimiento en llamadas de asesoramiento financiero: el modelo transcribe conversaciones entre gestor y cliente para su revisión posterior por equipos de compliance, aprovechando su adaptación a vocabulario financiero y a code-switching inglés-mandarín.
- Análisis de llamadas con singlish: permite transcribir conversaciones de clientes singapurenses que mezclan inglés coloquial y mandarín, un escenario donde los ASR genéricos rinden peor.
- Generación de actas y resúmenes post-llamada: las transcripciones sirven como entrada para sistemas de resumen o búsqueda documental en entornos regulados.
- Investigación académica en ASR code-switching: el checkpoint y su receta de entrenamiento (LoRA + adaptador) sirven como referencia reproducible para experimentos con datos sintéticos TTS.
- Prototipado de pipelines de speech-to-text con vLLM: el worker incluido en el repositorio `fyp-be` facilita desplegar el modelo en un servicio de transcripción por lotes.
- Detección de riesgos en conversaciones financieras: la transcripción permite aplicar reglas o clasificadores posteriores para identificar afirmaciones potencialmente problemáticas, siempre con revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica únicamente que el modelo es peor que el modelo base en detalles financieramente críticos (importes y cantidades en inglés agrupados por comas), sin aportar métricas numéricas (WER, CER u otras).

## Requisitos de hardware

- El modelo publicado en BF16 ocupa 6,6 GB en 14 archivos safetensors.
- El ajuste fino se entrenó en una porción de 24 GB de una NVIDIA RTX PRO 6000 Blackwell; se desconoce la VRAM mínima de inferencia.
- No se especifican GPU recomendadas para inferencia (A100, H100, RTX 4090 u otras); no disponible.
- Por tamaño (6,6 GB en BF16), es plausible que quepa en GPU de consumo con 8-12 GB de VRAM, pero el autor no lo confirma ni lo ha probado.
- Despliegue previsto mediante el worker ClearCall (`stt-service/meralion` del repositorio `fyp-be`) con vLLM y la librería `meralion-3-asr==0.1.0`; la transcripción directa con `transformers` o con el paquete `meralion-3-asr` en ventana única no fue probada para este checkpoint.
- El Dockerfile del worker puede portar el modelo sin cambios según lectura de código, pero la imagen no se ha construido ni probado en GPU.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tanedric/meralion-3-3b-asr-clearcall-j5xe | 3.307.027.712 | no disponible | en, zh, singlish, code-switching | MERaLiON-3 Public Licence | Hugging Face (0 descargas, 0 likes) |
| MERaLiON/MERaLiON-3-3B-ASR (base) | 3.307.027.712 | no disponible | en, zh | MERaLiON Public Licence | Hugging Face |
| Whisper large-v3 | no disponible en la informacion | no disponible | multilingue | MIT (segun conocimiento general, no verificado aqui) | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estos modelos en la informacion proporcionada.

## Limitaciones y advertencias

- Checkpoint de investigación, no un modelo de produccion: el autor lo advierte explícitamente.
- Entrenado y evaluado únicamente con llamadas sintéticas generadas por texto-a-voz; el rendimiento sobre audio real de llamadas no está validado.
- Peor que el modelo base en detalles financieramente críticos: importes y cantidades en inglés agrupados por comas.
- No debe usarse para decisiones de cumplimiento sin revisión humana.
- Sesgos conocidos: no documentados en la informacion disponible.
- Riesgo de alucinación en la transcripción: no cuantificado en la informacion disponible.
- Limitaciones de contexto e idioma: solo se documentan en y zh (con singlish y code-switching); no se especifica la longitud de contexto.
- La licencia MERaLiON-3 Public Licence es de tipo "other"; deben consultarse sus términos para uso comercial y cumplirse los avisos NOTICE incluidos en el repositorio.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo día (2026-11-21), lo que indica ausencia de validación comunitaria.
- La integración con Docker no ha sido probada en GPU.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanedric/meralion-3-3b-asr-clearcall-j5xe
- Modelo base: https://huggingface.co/MERaLiON/MERaLiON-3-3B-ASR
- Repositorio del proyecto (worker STT): https://github.com/dan130602/fyp-be
- Licencia MERaLiON-3 Public Licence: https://huggingface.co/datasets/MERaLiON/MERaLiON_Public_Licence/blob/main/MERaLiON-3-Public-Licence.pdf
- Paper de referencia (arXiv:2412.09818): https://arxiv.org/abs/2412.09818
