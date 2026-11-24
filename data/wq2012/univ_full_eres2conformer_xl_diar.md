# wq2012/univ_full_eres2conformer_xl_diar

## Resumen

`univ_full_eres2conformer_xl_diar` es un modelo de extracción de embeddings de locutor (speaker verification y diarización) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker, una reimplementación desde cero en JAX/Flax de algoritmos publicados de reconocimiento de locutor. No es un modelo de lenguaje: su pipeline es `feature-extraction` sobre audio y su salida es un vector de 256 dimensiones que representa la identidad de un hablante.

El modelo emplea una arquitectura ERes2Conformer en configuración `xl` con pooling temporal atencional (`catp`) y objetivo de entrenamiento Sub-Center ArcFace (K=3, escala 32, margen 0.32). Cuenta con 64.376.300 parámetros de inferencia (64.485.852 en el fichero de pesos) y se distribuye en safetensors, msgpack de Flax y exportaciones TFLite FP32/INT8 del encoder.

Su relevancia radica en que es un checkpoint "universal" entrenado sobre siete corpus abiertos (VoxCeleb1/2, CN-Celeb1/2, LibriSpeech 960h, Fisher, AMI, ICSI y CallHome) con 24.110 locutores y 2.481.542 utterances limpias, sin solapamiento de locutores con los conjuntos de evaluación. Está pensado tanto para verificación de locutor como para diarización de conversaciones multi-hablante, y su licencia Apache 2.0 facilita el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2Conformer (`xl`) con pooling temporal atencional (`catp`) |
| Parametros totales | 64.485.852 (pesos); 64.376.300 en encoder + cabeza de scoring (excluye clasificador de entrenamiento) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Inferencia JAX con máscara hasta 3000 frames (30 s); exportaciones TFLite con ventana fija de 180 frames (1.8 s) |
| Tipos de cuantizacion | Exportaciones TFLite FP32 e INT8 del encoder; pesos principales en safetensors |
| Idiomas soportados | No disponible (modelo agnóstico al idioma; entrenado con corpus multilingües y en inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, Flax msgpack, TFLite (FP32 e INT8) |

## Arquitectura y entrenamiento

El backbone es un ERes2Conformer en variante `xl`, una arquitectura conformer orientada a reconocimiento de locutor que combina bloques convolucionales con auto-atención. Sobre la representación temporal se aplica un pooling atencional (`catp`, adaptado del paper de language identification arXiv:2202.12163) que agrega la secuencia en un embedding de 256 dimensiones. El objetivo de entrenamiento es Sub-Center ArcFace con K=3 sub-centros, escala 32 y margen 0.32, y la verificación se realiza por similitud coseno. El frontend de audio es un Mel logarítmico natural de 80 dimensiones a 16 kHz con VAD a nivel de frame y CMVN, implementado en `flaxspeaker.AudioFrontend` y no como `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizó durante 162.000 pasos de gradiente con batch de 512 utterances (semilla 42, warmup de 3000 pasos, aproximadamente 32,19 épocas) sobre un pool de siete corpus: VoxCeleb1/2-dev, CN-Celeb 1+2, LibriSpeech 960h, Fisher, AMI, ICSI y CallHome (turnos conversacionales con solapamiento restado). Se aplicaron crops variables de U(80, 220) frames con máscara de validez exacta, además de perturbación de velocidad en tres vías y aumentación con MUSAN/RIR. El autor documenta un fingerprint de pérdida en el paso 0 que valida la reproducibilidad del pipeline (12,4294 con crops variables frente a 12,4283 archivado).

## Capacidades

- Extracción de embeddings de locutor de 256 dimensiones a partir de audio a 16 kHz.
- Verificación de locutor (1:1) mediante similitud coseno.
- Identificación de locutor y agrupamiento para diarización (el checkpoint incluye el sufijo `_diar` y se entrenó con corpus conversacionales AMI, ICSI y CallHome).
- Funciona con utterances cortas y con secuencias largas de hasta 30 s en inferencia JAX con máscara.
- Agnóstico al idioma en la práctica: el embedding representa identidad vocal, no contenido lingüístico.
- Exportaciones TFLite FP32 e INT8 para despliegue en entornos con restricciones de tamaño o sin runtime JAX.
- No soporta tool calling, agentes, visión, audio-generación ni razonamiento multi-paso: es un extractor de características, no un modelo generativo.

## Casos de uso

- Verificación biométrica de acceso: comparar el embedding de una utterance entrante con el enrollment del usuario mediante similitud coseno; el EER de 0,57 % en VoxCeleb1-O con inferencia completa lo hace adecuado para control de acceso con doble factor.
- Diarización de reuniones: segmentar audio de AMI/ICSI en turnos por locutor agrupando embeddings; el entrenamiento con turnos conversacionales con solapamiento restado reduce confusiones en habla solapada.
- Transcripción enriquecida con hablante: pipeline ASR + este modelo para etiquetar cada segmento con su locutor en actas, subtitulado o análisis de calls.
- Detección de fraude telefónico: comparar la voz de una llamada con la voz registrada del cliente; el entrenamiento con CallHome y Fisher aporta robustez a audio telefónico de banda estrecha.
- Indexación y búsqueda por voz en archivos multimedia: generar embeddings para cada segmento y construir un índice vectorial que permita localizar intervenciones de un locutor concreto.
- Despliegue en dispositivos: usar `model_int8.tflite` (ventana de 180 frames, 1,8 s) en móviles o edge con EER de 1,62 % en VoxCeleb1-O, suficiente para aplicaciones de autenticación continua.
- Control de calidad de datasets de voz: detectar locutores duplicados o contaminación entre splits comparando embeddings antes de entrenar modelos ASR.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| VoxCeleb1-O, 1-utt EER (JAX, secuencia completa con máscara) | 0,57 % |
| VoxCeleb1-O, 1-utt EER (TFLite FP32, crop central 180 frames, 37.611 trials) | 1,61 % |
| VoxCeleb1-O, 1-utt EER (TFLite INT8, crop central 180 frames) | 1,62 % |
| Fidelidad coseno FP32 vs INT8 (180 frames) | 0,999352 |
| Desviación estándar entre semillas 0-2 (EER 1-utt agrupado) | 0,08-0,41 % absoluto |
| Intervalo de confianza bootstrap 95 % (8.000 trials) | ~0,8 % de semi-anchura |

El autor remite a `eval_results.json` para el desglose multi-dominio (EER 1-utt y 3-utt, minDCF, ROC-AUC e intervalos bootstrap). No se han publicado en la información disponible resultados comparativos con otros modelos en formato de tabla.

## Requisitos de hardware

- Huella de pesos: ~258 MB en FP32 (64,5 M parámetros); el repo completo ocupa 0,8 GB por incluir msgpack y exportaciones TFLite.
- VRAM estimada para inferencia: por debajo de 1 GB en FP32 para lotes pequeños; cabe holgadamente en cualquier GPU consumer (RTX 3060, RTX 4090) e incluso en CPU.
- GPU recomendadas: no requiere GPU dedicada; una A100 o H100 solo tiene sentido para procesar grandes volúmenes en lote. Para throughput alto, lotes grandes en una RTX 4090 o L4 son suficientes.
- Despliegue: JAX/Flax mediante `pip install flaxspeaker>=0.8.0` y `load_pretrained`; TFLite (FP32/INT8) para edge; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. La ventana TFLite de 180 frames (1,8 s) da una cota superior de coste por utterance en edge.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_full_eres2conformer_xl_diar` | 64,5 M | Hasta 30 s (JAX); 1,8 s (TFLite) | ERes2Conformer + Sub-Center ArcFace | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (referencia de la literatura) | ~20 M (variante base) | Típicamente 3 s | TDNN + atención | Varía según implementación | Implementaciones múltiples |
| WavLM-Large para speaker verification | ~317 M | Típicamente 3-10 s | Transformer auto-supervisado | MIT (modelo base) | Hugging Face |
| X-Vector clásico | ~5 M | 3-10 s | TDNN + pooling estadístico | Varía | Implementaciones múltiples |

No se dispone de resultados de benchmarks homogéneos entre estos modelos en la información proporcionada, por lo que la comparación se limita a parámetros, contexto y licencia.

## Limitaciones y advertencias

- No es un producto oficial de Google; el autor lo declara explícitamente y lo presenta como reimplementación desde cero basada solo en papers.
- El EER de 0,57 % corresponde a inferencia JAX con secuencia completa y máscara; las exportaciones TFLite con crop de 180 frames degradan a 1,61-1,62 %, un factor de casi 3 en error.
- La ventana TFLite es fija y sin máscara: utterances más cortas o más largas que 1,8 s requieren recorte o troceado manual.
- Riesgo de sesgo demográfico y de canal: el entrenamiento combina corpus de YouTube, telefonía y reuniones, pero no se documenta un análisis de equidad por género, edad o acento.
- El modelo no transcribe ni entiende el contenido: cualquier decisión biométrica debe acompañarse de umbrales calibrados por dominio y de revisión humana.
- En diarización, la agrupación depende de un algoritmo de clustering externo; el modelo solo aporta embeddings.
- No se documentan limitaciones específicas por idioma, pero el corpus es mayoritariamente anglófono y chino, lo que puede afectar a lenguas no representadas.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_eres2conformer_xl_diar
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- GitHub: https://github.com/wq2012/FlaxSpeaker
- PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
