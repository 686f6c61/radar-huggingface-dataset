# wannaphong/typhoon-asr-realtime-nemo-ctc

## Resumen

typhoon-asr-realtime-nemo-ctc es un modelo de reconocimiento automático del habla (ASR) en tailandés desarrollado por el usuario wannaphong, construido íntegramente con clases estándar de NeMo sobre el encoder del modelo typhoon-ai/typhoon-asr-realtime. Se trata de un `EncDecCTCModelBPE` cuyo ConformerEncoder conserva las 17 capas congeladas del modelo RT original y añade 4 capas nuevas entrenadas, más un decoder CTC (`ConvASRDecoder`) sobre el tokenizador BPE-2048 del modelo base. El resultado son 135 M de parámetros totales, de los cuales solo 26 M son entrenables.

El problema que resuelve es concreto: los decoders autorregresivos (Whisper, Qwen-ASR) obtienen CER más bajos, pero no ofrecen posteriores a nivel de fotograma, que son la base para keyword spotting, word boosting y timestamps. Este modelo sacrifica unos pocos puntos de CER para obtener precisamente esas capacidades, con un coste computacional muy reducido y sin necesidad de entrenamiento específico para biasing contextual.

Su relevancia actual radica en el sesgo contextual (contextual biasing) con listas de entidades largas: frente a la ruta de prompt de Whisper, que se colapsa a partir de 10-15 entradas por la ventana de decoder de 448 tokens, este modelo no tiene límite de tamaño de lista y mantiene un recall de entidades de 0,85 a 0,76 al pasar de 0 a 500 distractores. En el repositorio consta con 0 descargas y 0 likes en el momento de la consulta, y ocupa 0,5 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) + CTC; clase `EncDecCTCModelBPE` de NeMo |
| Parametros totales | 135 M (26 M entrenables; 17 capas RT congeladas + 4 capas nuevas) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de ASR; no se especifica la ventana máxima de audio) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | tailandes (th) |
| Licencia | cc-by-4.0 |
| Formato de pesos | checkpoint `.nemo` de NeMo; exportable a TensorRT/Riva |
| Tokenizador | BPE-2048 (heredado de typhoon-asr-realtime) |
| Tamano del repositorio | 0,5 GB |
| Libreria | nemo |
| Tarea (pipeline) | automatic-speech-recognition |
| Modelo base | typhoon-ai/typhoon-asr-realtime (fine-tune) |

## Arquitectura y entrenamiento

El modelo es un híbrido de encoder Conformer y decoder CTC. El encoder reutiliza las 17 capas del encoder de typhoon-asr-realtime, que permanecen congeladas, y añade 4 capas nuevas que sí se entrenan (26 M de parámetros entrenables en total). El decoder es un `ConvASRDecoder` sobre el vocabulario BPE-2048 del modelo RT. Según la model card, el uso exclusivo de clases estándar de NeMo permite conservar las rutas habituales de exportación a NeMo, Riva y TensorRT.

El entrenamiento se realizó sobre aproximadamente 10.800 horas de habla en tailandés (GigaSpeech2-th), según el informe técnico de Typhoon ASR Real-time (arXiv:2601.13044). No se detalla en la información proporcionada si hubo etapas de RLHF, DPO u otros ajustes de preferencia, ni la composición exacta del dataset más allá de GigaSpeech2-th. La innovación técnica destacable es la decodificación CTC a nivel de fotograma, que habilita keyword spotting, word boosting y timestamps sobre una única pasada de encoder barata, además de permitir biasing contextual en tiempo de decodificación sin entrenamiento adicional (`word_boost.py`, spot-and-splice con umbral `--tau`).

## Capacidades

- Transcripción de voz en tailandés mediante decodificación CTC greedy (`transcribe` sobre el checkpoint `.nemo`).
- Keyword spotting sobre las posteriores CTC, con el script incluido `kws_spot.py`.
- Word boosting y sesgo contextual en tiempo de decodificación (`word_boost.py`), con búsqueda y empalme de entidades en la transcripción.
- Extracción de timestamps a partir de la pasada de encoder, según la model card.
- Robustez ante listas de entidades grandes: sin límite de tamaño de lista, con recall que pasa de 0,85 (bias@0) a 0,76 (bias@500) y falsas alarmas por distractor entre 0,003 y 0,006.
- Exportación a Riva/TensorRT a través de las rutas estándar de NeMo.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso (no es un modelo de lenguaje).
- No dispone de capacidades de visión, audio más allá del ASR, ni modo de razonamiento explícito.
- Monolingüe: únicamente tailandés.

## Casos de uso

- Transcripción de audio en tiempo real para centros de llamadas en tailandés: al ser un modelo CTC de 135 M con posteriores por fotograma, encaja en pipelines de streaming de bajo coste donde un decoder autorregresivo grande sería demasiado caro.
- Keyword spotting y alertas de cumplimiento: `kws_spot.py` permite detectar términos concretos (por ejemplo, nombres de marca o cargos) directamente sobre las posteriores, sin pasar por una transcripción completa.
- Word boosting de entidades críticas en dominios con vocabulario específico: nombres propios, marcas y siglas se pueden sesgar en tiempo de decodificación con el umbral `--tau`; en el benchmark gold, esto rebaja el CER de 9,56 a 5,97 y sube el recall de entidades de 0,158 a 0,852 con tau −2.
- Indexación y búsqueda de archivos de audio a gran escala: el coste por hora de audio es muy inferior al de modelos de 1,55 B o 2,07 B, lo que permite procesar lotes grandes de grabaciones historicas.
- Subtitulado o transcripción offline con presupuesto de cómputo limitado: el modelo cabe en hardware modesto y puede desplegarse on-premise mediante Riva/TensorRT.
- Pipeline híbrido de alta calidad: componer este modelo con `typhoon-asr-qwen-1.7b-ctx`, donde el modelo grande escribe la transcripción y este aporta los aciertos de palabras clave y los timestamps en una sola pasada barata de encoder.
- Investigación en sesgo contextual y evaluación reproducible: sirve como ruta de referencia no autorregresiva en `wayu-ai/thai-contextasr-bench`, con listas de hasta 500 entradas.
- Despliegue en dispositivos con memoria limitada o CPU, dado el tamaño del modelo.

## Benchmarks y rendimiento

Transcripción simple (CER %, mismo protocolo: `typhoon-ai/gigaspeech2-typhoon` in-domain y `typhoon-ai/TVSpeech` out-of-domain, talk-show de 30 s):

| Modelo | Parametros | CER gigaspeech2 ↓ | CER TVSpeech ↓ |
|---|---|---|---|
| typhoon-asr-realtime-nemo-ctc (CTC greedy) | 135 M | 8,54 | 13,46 |
| typhoon-asr-realtime (RNN-T) | 109 M | 6,89 | 9,92 |
| typhoon-whisper-medium | 769 M | 4,81 | 7,66 |
| typhoon-asr-qwen-1.7b-ctx | 2,07 B | 4,86 | 6,87 |
| Qwen3-ASR-1.7B (original) | 2,07 B | 6,09 | 10,63 |
| Qwen3-ASR-0.6B (original) | 0,80 B | 8,20 | 11,45 |
| typhoon-whisper-large-v3 | 1,55 B | 4,69 | 6,32 |
| nectec/Pathumma-whisper-th-large-v3 | 1,55 B | 5,84 | 10,36 |
| biodatlab/whisper-th-large-v3-combined | 1,55 B | 15,78 † | 14,91 |

† Resultado dominado por 3 locuciones con bucles de repetición; excluyéndolas, 8,39.

Sesgo contextual sobre `wayu-ai/thai-contextasr-bench` (celdas: CER % ↓ / recall de entidades ↑; mismo scorer congelado; `N/A` indica que la ruta no es viable):

| Modelo | Parametros | none | bias@0 | bias@10 | bias@50 | bias@500 | Falsas alarmas ↓ |
|---|---|---|---|---|---|---|---|
| typhoon-asr-realtime-nemo-ctc | 135 M | 9,56 / 0,158 | 5,97 / 0,852 | 7,07 / 0,849 | 7,51 / 0,839 | 11,12 / 0,757 | 0,003–0,006 |
| typhoon-asr-qwen-1.7b-ctx | 2,07 B | 5,11 / 0,441 | 3,39 / 0,754 | 4,02 / 0,717 | 4,30 / 0,640 | 4,98 / 0,483 | ≤0,0004 |
| typhoon-whisper-medium | 769 M | 7,05 / 0,383 | 4,92 / 0,658 | 8,09 / 0,597 | N/A | N/A | 0,003 |
| typhoon-whisper-large-v3 | 1,55 B | 4,83 / 0,459 | N/A | N/A | N/A | N/A | no disponible |
| nectec/Pathumma-whisper-th-large-v3 | 1,55 B | 5,23 / 0,416 | 3,40 / 0,823 | 6,01 / 0,772 | N/A | N/A | 0,0003 |
| biodatlab/whisper-th-large-v3-combined | 1,55 B | 5,68 / 0,482 | 6,37 / 0,842 | 8,72 / 0,783 | N/A | N/A | 0,0033 |
| Qwen3-ASR-1.7B (original) | 2,07 B | 5,25 / 0,396 | 4,48 / 0,644 | 5,97 / 0,603 | 6,71 / 0,522 | 5,87 / 0,413 | 0,0125 |

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,27 GB en FP16 solo para los pesos (135 M de parámetros × 2 bytes); el repositorio completo ocupa 0,5 GB. No se especifican requisitos oficiales de memoria.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (por ejemplo, RTX 3060 o RTX 4090); para lotes grandes en servidor, T4, L4, A100 o H100. El modelo también es candidato a inferencia en CPU.
- Cabe en GPU consumer: sí, con margen amplio, dado que los pesos en FP16 rondan los 270 MB.
- Opciones de despliegue: NeMo (`EncDecCTCModelBPE.restore_from`), Riva y exportación a TensorRT mediante las rutas estándar de NeMo. No se documentan rutas GGUF, llama.cpp ni Ollama (son formatos orientados a modelos de lenguaje).
- Latencia y throughput: no disponibles. La model card solo señala que las posteriores CTC por fotograma habilitan escenarios de streaming.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / ventana | CER gigaspeech2 | CER TVSpeech | Licencia | Comentario |
|---|---|---|---|---|---|---|
| typhoon-asr-realtime-nemo-ctc | 135 M | sin limite de tamano de lista de biasing | 8,54 | 13,46 | cc-by-4.0 | Posteriores CTC; keyword spotting, word boosting y timestamps |
| typhoon-asr-realtime (RNN-T) | 109 M | no disponible | 6,89 | 9,92 | no disponible | Modelo base; mejor CER, sin posteriores CTC expuestas |
| typhoon-whisper-medium | 769 M | ventana de decoder de 448 tokens | 4,81 | 7,66 | no disponible | Prompt de biasing se colapsa con listas largas |
| typhoon-whisper-large-v3 | 1,55 B | ventana de decoder de 448 tokens | 4,69 | 6,32 | no disponible | Mejor CER absoluto de la comparativa |
| Qwen3-ASR-0.6B (original) | 0,80 B | no disponible | 8,20 | 11,45 | no disponible | Autorregresivo de tamano comparable |
| typhoon-asr-qwen-1.7b-ctx | 2,07 B | sin limite de tamano de lista | 4,86 | 6,87 | no disponible | Mejor CER con listas grandes, pero 15 veces mas parametros |

Regla indicada en la model card: elegir este modelo cuando primen el recall de entidades, la robustez ante listas largas, el coste computacional o el streaming; elegir `typhoon-asr-qwen-1.7b-ctx` cuando primen el CER absoluto y la tolerancia a listas muy grandes y ruidosas.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan análisis de sesgo demográfico, de acento o de variedad dialectal. El entrenamiento se limita a unas 10.800 horas de GigaSpeech2-th, por lo que el rendimiento fuera de ese dominio (por ejemplo, TVSpeech) empeora de forma notable (CER 8,54 → 13,46).
- CER superior a alternativas más grandes: 8,54 en gigaspeech2 frente a 4,69 de typhoon-whisper-large-v3 o 4,86 de typhoon-asr-qwen-1.7b-ctx. No es la opción adecuada si la prioridad es la transcripción literal más precisa.
- Riesgo de error en la decodificación: la decodificación CTC greedy no incorpora modelo de lenguaje externo en la ruta descrita, lo que puede producir errores en audio ruidoso o con solapamiento de hablantes. No se cuantifica la tasa de alucinación.
- Comportamiento con listas muy grandes: con listas agresivas de biasing el CER sube (11,12 en bias@500) y el recall baja a 0,757. La propia model card recomienda mantener listas curadas de 50 entradas o menos cuando se usa un umbral `--tau` agresivo.
- Falsas alarmas en biasing: entre 0,003 y 0,006 por distractor, superior a las de `typhoon-asr-qwen-1.7b-ctx` (≤0,0004) y `nectec/Pathumma-whisper-th-large-v3` (0,0003).
- Idioma: únicamente tailandés. No hay soporte multilingüe ni traducción.
- Licencia: cc-by-4.0 permite uso comercial con atribución; es obligatorio citar autor y licencia. Debe verificarse el cumplimiento de las licencias del modelo base y de los datasets de entrenamiento, no detalladas en la información proporcionada.
- Madurez: 0 descargas y 0 likes en el momento de la consulta, sin validación externa conocida. La fecha de creación indicada en el repositorio (2026-09-12) y la referencia arXiv (2601.13044) no se han podido verificar de forma independiente.
- No es un modelo de lenguaje: no admite tool calling, agentes, generación de código, matemáticas ni visión.
- No se documentan tipos de cuantización soportados ni requisitos de memoria oficiales, por lo que el despliegue en producción requiere validación propia.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wannaphong/typhoon-asr-realtime-nemo-ctc
- Modelo base: https://huggingface.co/typhoon-ai/typhoon-asr-realtime
- Informe técnico Typhoon ASR Real-time: https://arxiv.org/abs/2601.13044
- Dataset in-domain: https://huggingface.co/datasets/typhoon-ai/gigaspeech2-typhoon
- Dataset out-of-domain (TVSpeech): https://huggingface.co/datasets/typhoon-ai/TVSpeech
- Benchmark de sesgo contextual: https://huggingface.co/datasets/wayu-ai/thai-contextasr-bench
- typhoon-whisper-medium: https://huggingface.co/typhoon-ai/typhoon-whisper-medium
- typhoon-whisper-large-v3: https://huggingface.co/typhoon-ai/typhoon-whisper-large-v3
- Qwen3-ASR-1.7B: https://huggingface.co/Qwen/Qwen3-ASR-1.7B-hf
- Qwen3-ASR-0.6B: https://huggingface.co/Qwen/Qwen3-ASR-0.6B-hf
- nectec/Pathumma-whisper-th-large-v3: https://huggingface.co/nectec/Pathumma-whisper-th-large-v3
- biodatlab/whisper-th-large-v3-combined: https://huggingface.co/biodatlab/whisper-th-large-v3-combined
- NVIDIA NeMo: https://github.com/NVIDIA/NeMo
