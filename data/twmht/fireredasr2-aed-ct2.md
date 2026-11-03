# twmht/FireRedASR2-AED-ct2

## Resumen

FireRedASR2-AED-ct2 es la conversión al formato CTranslate2 del modelo de reconocimiento automático del habla FireRedASR2-AED, desarrollado originalmente por el equipo FireRed (FireRedTeam). El autor de esta conversión es el usuario twmht, que publica los pesos en float32 sin cuantizar, manteniendo intacto el modelo original. Se trata de un sistema ASR (automatic speech recognition) orientado a chino mandarín, cantonés e inglés, construido sobre una arquitectura Conformer con atención de posición relativa Transformer-XL, lo que lo aleja del paradigma Whisper y lo hace incompatible con las herramientas estándar de ese ecosistema.

La relevancia de esta ficha radica en que CTranslate2 es uno de los runtimes de inferencia más eficientes para despliegue en producción (menor latencia, menor consumo de memoria, soporte de cuantización int8), pero el soporte para FireRed no está incluido en las versiones publicadas de la librería: requiere una compilación específica (el fork voxrun-ctranslate2) que añade la clase `FireRed`. Por tanto, este repositorio es útil para quien quiera servir FireRedASR2 con el rendimiento de CTranslate2, asumiendo la dependencia de una build no oficial.

El repositorio ocupa 4,7 GB e incluye `model.bin`, `config.json`, `vocabulary.json`, el modelo SentencePiece `bpe.model` y las estadísticas CMVN `cmvn.ark`. La licencia es Apache-2.0, heredada del modelo original.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Conformer (encoder) con atención de posición relativa Transformer-XL; decoder AED (attention-based encoder-decoder) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo ASR; procesa utterances, no contexto textual largo) |
| Tipos de cuantización | Pesos publicados en float32; en carga se admite `float16`, `bfloat16`, `int8_float16`, `int8_bfloat16` e `int8` en CPU |
| Idiomas soportados | Chino (mandarín y cantonés) e inglés; salida en chino simplificado |
| Licencia | Apache-2.0 |
| Formato de pesos | CTranslate2 (`model.bin`), más `config.json`, `vocabulary.json`, `bpe.model` (SentencePiece) y `cmvn.ark` |

## Arquitectura y entrenamiento

El modelo original FireRedASR2-AED es un sistema ASR de tipo attention-based encoder-decoder. El encoder es un Conformer, que combina bloques convolucionales con auto-atención, y emplea atención de posición relativa al estilo Transformer-XL. El front end es propio (no el de Whisper) y el tokenizador es SentencePiece, con estadísticas CMVN para normalización de features. La conversión a CTranslate2 no retrena ni modifica el modelo: solo transforma los pesos al formato del runtime.

No se dispone de información sobre el volumen de datos de entrenamiento, la composición del corpus ni si se aplicaron etapas de ajuste fino supervisado o preferencias. La model card de esta conversión tampoco detalla esos aspectos; solo confirma que el modelo base es FireRedTeam/FireRedASR2-AED y que la conversión preserva el comportamiento del original (los IDs de tokens en float32 coinciden con la salida de PyTorch en los clips comparados).

## Capacidades

- Reconocimiento automático del habla en mandarín, cantonés e inglés, con salida en chino simplificado.
- Transcripción de audio mono a 16 kHz mediante un extractor de features basado en kaldi-native-fbank.
- Decodificación por beam search (la evaluación publicada usa beam 3).
- Inferencia con precisión configurable en carga (float32, float16, bfloat16, int8 híbrido e int8 en CPU).
- No soporta tool calling, function calling, agentes ni razonamiento multi-step: es un modelo puramente ASR.
- No dispone de modo thinking, visión ni audio generativo; solo transcribe audio a texto.
- Capacidad multilingüe limitada a los idiomas indicados (zh, en), con variante cantonés evaluada.

## Casos de uso

- Transcripción de reuniones y llamadas en mandarín: el modelo convierte audio de 16 kHz mono en texto chino simplificado con un CER del 10,21 % en FLEURS, adecuado para actas automáticas y búsqueda sobre grabaciones.
- Subtitulado de contenido en cantonés: el CER del 8,46 % en FLEURS para cantonés (evaluado contra chino simplificado) lo hace viable para generar subtítulos en plataformas de vídeo dirigidas a audiencias de Hong Kong y Guangdong.
- Atención al cliente en centros de contacto: integrado en un pipeline de CTranslate2 con `int8_float16`, permite transcribir llamadas en tiempo casi real con menor huella de memoria que la versión PyTorch.
- Despliegue en CPU para entornos sin GPU: la cuantización `int8` en CPU de CTranslate2 permite servir transcripción en servidores estándar, útil para procesamiento por lotes de archivos de audio.
- Indexación y búsqueda de archivos de audio: transcripción masiva de un archivo histórico para construir índices de texto searchable, aprovechando el throughput de CTranslate2 frente a frameworks de inferencia más pesados.
- Investigación en ASR multilingüe chino-inglés: base para experimentos de adaptación o evaluación comparativa, dado que la conversión preserva la fidelidad numérica del modelo original en float32.
- Integración en pipelines de accesibilidad: generación de transcripciones para vídeos o streaming en chino, con la ventaja de un runtime ligero y cuantizable.

## Benchmarks y rendimiento

Resultados publicados en la model card de esta conversión (FLEURS test, CTranslate2 float32, beam 3, CER tras eliminar mayúsculas, espacios y puntuación):

| Idioma | CER (float32) | Nota |
|---|---|---|
| Mandarín | 10,21 % | Evaluado contra chino simplificado |
| Cantonés | 8,46 % | Evaluado contra chino simplificado |

La model card indica que float16 y bfloat16 se mantienen dentro de 0,4 puntos de estos valores. No se han publicado en la información disponible resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K no aplican a un modelo ASR).

## Requisitos de hardware

- Pesos en float32: 4,7 GB en disco; en memoria, la carga en float16 o bfloat16 reduce aproximadamente a la mitad el consumo de VRAM frente a float32.
- VRAM estimada para inferencia en GPU: no disponible de forma exacta; con `compute_type="float16"` el modelo cabe holgadamente en GPUs de 8-12 GB, y con `int8_float16` en GPUs de 6-8 GB (estimación basada en el tamaño de los pesos, no publicada por el autor).
- GPUs recomendadas: no especificadas por el autor; por tamaño, una RTX 4090, A100 o H100 ofrecen margen amplio; una RTX 3060 de 12 GB debería ser suficiente en float16.
- Cabe en GPU de consumo: sí, en modelos con 8 GB o más en float16 y en 6 GB o más con cuantización int8 híbrida.
- Opciones de despliegue: CTranslate2 exclusivamente, y solo con una build que incluya la clase `FireRed` (fork voxrun-ctranslate2). CTranslate2 estándar y faster-whisper no pueden cargar el modelo.
- Dependencias de preprocesado: `kaldi-native-fbank` para el extractor de features y `sentencepiece` para el tokenizador.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto/entrada | Licencia | Runtime |
|---|---|---|---|---|---|
| FireRedASR2-AED-ct2 | Conformer AED (ASR) | zh (mandarín, cantonés), en | Audio 16 kHz mono | Apache-2.0 | CTranslate2 (build con soporte FireRed) |
| Whisper (large-v3) | Transformer encoder-decoder (ASR) | Multilingüe amplio | Audio 16 kHz, ventanas de 30 s | MIT | faster-whisper, CTranslate2 estándar, etc. |
| FireRedASR2-AED original | Conformer AED (ASR) | zh, en | Audio 16 kHz mono | Apache-2.0 | PyTorch |
| Modelos ASR chinos especializados (p. ej. Paraformer) | No disponible en detalle | zh | Audio | Varía | Varía |

La comparación cuantitativa de CER frente a Whisper u otros sistemas no está disponible en la información proporcionada. La diferencia clave frente a Whisper es la arquitectura (Conformer con atención relativa Transformer-XL) y el hecho de que este repositorio solo funciona con una build no publicada de CTranslate2.

## Limitaciones y advertencias

- Requiere una build de CTranslate2 no publicada (fork voxrun-ctranslate2); CTranslate2 estándar y faster-whisper no cargan el modelo. Esto complica el despliegue en producción y la reproducibilidad.
- La salida es siempre en chino simplificado, incluso para audio en cantonés; no se ofrece salida en caracteres tradicionales ni en inglés como texto de salida.
- Idiomas limitados a chino e inglés; no se documenta soporte para otras lenguas.
- Es un modelo puramente ASR: no soporta tool calling, agentes ni razonamiento; no debe usarse como LLM.
- Riesgo de errores de transcripción en audio con ruido, acentos no cubiertos, solapamiento de hablantes o dominio muy específico; el CER publicado (10,21 % en mandarín) implica un margen de error no trivial.
- No se han publicado datos sobre sesgos demográficos o dialectales más allá de la evaluación en FLEURS.
- Licencia Apache-2.0 permite uso comercial, pero conviene verificar la licencia y condiciones del modelo base FireRedTeam/FireRedASR2-AED y del fork de CTranslate2 utilizado.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; es una conversión reciente y sin validación comunitaria amplia.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/twmht/FireRedASR2-AED-ct2
- Modelo base: https://huggingface.co/FireRedTeam/FireRedASR2-AED
- Repositorio del proyecto FireRedASR2S: https://github.com/FireRedTeam/FireRedASR2S
- Fork de CTranslate2 con soporte FireRed: voxrun-ctranslate2 (referenciado en la model card, sin URL directa en la información disponible)
