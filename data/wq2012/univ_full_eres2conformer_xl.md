# wq2012/univ_full_eres2conformer_xl

## Resumen

`univ_full_eres2conformer_xl` es un modelo de reconocimiento y verificación de hablante (speaker verification) desarrollado por el usuario `wq2012` dentro del proyecto FlaxSpeaker. No es un modelo de lenguaje: su función es extraer embeddings de voz de 256 dimensiones que permiten determinar si dos fragmentos de audio corresponden al mismo locutor. Está implementado en JAX/Flax y se distribuye también con exportaciones a TFLite.

La arquitectura combina un backbone ERes2Conformer en variante `xl` con pooling temporal atencional (`catp`) y un objetivo de entrenamiento Sub-Center ArcFace (K=3, scale=32, margin=0.32). El checkpoint es una reimplementación desde cero, basada únicamente en papers publicados, de los algoritmos GE2E, Dr-Vectors, ATP y PFAS. Cuenta con 64,4 millones de parámetros de inferencia (encoder más cabeza de scoring) y un tamaño de repositorio de 0,8 GB.

Su relevancia radica en ser un modelo "universal" entrenado sobre un pool multi-corpus amplio (VoxCeleb1/2, CN-Celeb 1+2 y LibriSpeech 960h, con 12.193 hablantes y 1.708.852 utterances limpias) y en ofrecer una ruta de despliegue poco habitual: pesos nativos Flax/SafeTensors más exportaciones TFLite FP32 e INT8 para inferencia en dispositivos con recursos limitados. La licencia Apache 2.0 facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ERes2Conformer (`xl`) con pooling temporal atencional (`catp`) y cabeza Sub-Center ArcFace |
| Parametros totales | 64.485.852 (safetensors); 64.376.300 de inferencia (encoder + scoring, sin clasificador de entrenamiento) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica como contexto de texto; audio de hasta 3000 frames (~30 s) en inferencia JAX con máscara completa; TFLite con ventana fija de 180 frames (1,8 s) |
| Tipos de cuantizacion | FP32 y INT8 (exportaciones TFLite); pesos nativos en precisión completa |
| Idiomas soportados | no disponible como lista; entrenado con corpus multilingües (inglés, chino y otros presentes en VoxCeleb, CN-Celeb y LibriSpeech) |
| Licencia | Apache 2.0 |
| Formato de pesos | SafeTensors (`model.safetensors`), Flax Msgpack (`flax_model.msgpack`), TFLite (`model_fp32.tflite`, `model_int8.tflite`) |

## Arquitectura y entrenamiento

El modelo emplea un backbone ERes2Conformer en escala `xl`, una arquitectura convolucional-recurrente con bloques Conformer orientada a embeddings de hablante. Sobre las representaciones del encoder se aplica un pooling temporal atencional (`catp`, adaptado de un trabajo de identificación de idioma) que agrega la secuencia temporal en un vector de 256 dimensiones. La función de pérdida es Sub-Center ArcFace con K=3 subcentros, escala 32 y margen 0,32, y la verificación final se realiza por similitud coseno. El frontend de audio es propio de la librería (`flaxspeaker.AudioFrontend`): Mel logarítmico natural de 80 dimensiones a 16 kHz, VAD a nivel de frame y CMVN; no es un `AutoFeatureExtractor` de Hugging Face.

El entrenamiento se realizó durante 145.000 pasos con batch de 512 utterances (unas 41,95 épocas), warmup de 3000 pasos y semilla 42, sobre 12.193 hablantes y 1.708.852 utterances limpias provenientes de VoxCeleb2-dev, VoxCeleb1-dev, CN-Celeb 1+2 y LibriSpeech 960h, con aumento de datos mediante perturbación de velocidad en tres vías, MUSAN y RIR. No hay solapamiento de hablantes con los conjuntos oficiales de evaluación. Los crops de entrenamiento son de longitud variable U(140, 200) frames con máscara de validez exacta, y la model card documenta la verificación de reproducibilidad mediante fingerprint de pérdida en el paso 0.

## Capacidades

- Extracción de embeddings de hablante de 256 dimensiones a partir de audio.
- Verificación de hablante (1:1) mediante similitud coseno entre dos utterances.
- Identificación y agrupamiento de hablantes a partir de embeddings (depende de la lógica de aplicación).
- Procesamiento de audio de hasta ~30 s en inferencia JAX con máscara completa de secuencia.
- Inferencia en dispositivos de borde mediante exportaciones TFLite FP32 e INT8 con ventana fija de 1,8 s.
- Robustez multidominio por entrenamiento conjunto en corpus de inglés y chino (VoxCeleb, CN-Celeb, LibriSpeech).
- Aumento de datos de entrenamiento con ruido (MUSAN), reverberación (RIR) y perturbación de velocidad.
- No soporta tool calling, agentes, generación de texto, visión ni audio-a-texto.

## Casos de uso

- Verificación biométrica de acceso: comparar el embedding de una utterance de inscripción con el de una utterance de prueba y aplicar un umbral sobre la similitud coseno; el EER de referencia en VoxCeleb1-O con secuencia completa es del 0,44 %.
- Autenticación por voz en aplicaciones móviles o embebidas: usar la exportación TFLite INT8 con ventana de 180 frames para obtener embeddings en dispositivo sin enviar audio a la nube, aceptando el EER de 1,70 % medido en esa configuración.
- Diarización de reuniones y transcripciones: extraer embeddings por segmento y agrupar por similitud para atribuir intervenciones a hablantes, aprovechando el entrenamiento multi-corpus en inglés y chino.
- Detección de suplantación o duplicados en archivos de audio: indexar embeddings de un catálogo y buscar coincidencias por similitud coseno para localizar al mismo locutor en grabaciones distintas.
- Personalización de asistentes de voz: identificar al usuario recurrente para adaptar respuestas o preferencias, con un modelo de 64 M de parámetros que cabe en GPUs de consumo.
- Investigación en reconocimiento de hablante: servir como checkpoint de referencia reproducible (semilla, pasos y fingerprints documentados) para comparar variantes de pooling, pérdida o frontend.
- Control de calidad de datasets de voz: detectar hablantes duplicados o mal etiquetados entre splits de entrenamiento y evaluación antes de publicar un corpus.

## Benchmarks y rendimiento

| Metrica | Valor |
|---|---|
| VoxCeleb1-O, 1-utt EER (JAX, secuencia completa con máscara) | 0,44 % |
| VoxCeleb1-O, 1-utt EER (TFLite FP32, crop central de 180 frames) | 1,67 % |
| VoxCeleb1-O, 1-utt EER (TFLite INT8, crop central de 180 frames) | 1,70 % |
| Fidelidad coseno FP32 vs INT8 (entradas de 180 frames) | 0,999556 (media) |
| Fidelidad coseno TFLite vs JAX | >= 0,9999 |
| Desviación estándar entre semillas 0-2 (EER agrupado 1-utt) | 0,08-0,41 % absoluto |
| Intervalo de confianza bootstrap 95 % (8000 trials) | ~0,8 % de semi-amplitud |

La model card indica que `eval_results.json` contiene métricas multidominio adicionales (EER 1-utt y 3-utt, minDCF, ROC-AUC, intervalos bootstrap y subconjunto de 10 hablantes de VoxCeleb1-O), pero sus valores concretos no están incluidos en la información proporcionada, por lo que no se reproducen aquí.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 64,4 M de parámetros; en FP32 son aproximadamente 0,26 GB de pesos y en INT8 unos 0,06 GB, más el coste de activaciones y del frontend de audio.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente; A100, H100, RTX 4090, RTX 3090 o RTX 3060 no suponen un cuello de botella por memoria.
- Cabe en GPU de consumo: sí, en toda la gama RTX y en muchas GPUs integradas o de portátil; también en CPU para volúmenes moderados.
- Despliegue: JAX/Flax mediante la librería `flaxspeaker` (>= 0.7.0), con `load_pretrained`, `extract_embedding` y `verify`; exportaciones TFLite para móvil y borde. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Latencia y throughput: no disponibles en la información proporcionada. La ventana TFLite de 180 frames (1,8 s) es un indicador del coste por utterance en borde, pero no se publican cifras de latencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto de audio | EER VoxCeleb1-O | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `univ_full_eres2conformer_xl` | 64,4 M | hasta ~30 s (JAX); 1,8 s (TFLite) | 0,44 % (JAX) | Apache 2.0 | Hugging Face, PyPI, GitHub |
| ECAPA-TDNN (referencia de la literatura) | ~20 M (variante estándar) | variable | no disponible en esta ficha | varía según checkpoint | múltiples checkpoints públicos |
| WavLM-based speaker models | ~90 M o superior | variable | no disponible en esta ficha | varía según checkpoint | Hugging Face |
| ERes2Net (familia original) | ~17-70 M según escala | variable | no disponible en esta ficha | varía según checkpoint | repositorios de investigación |

No se dispone de resultados de benchmarks de los modelos alternativos en la información proporcionada; las cifras de esta ficha solo cubren el modelo descrito. La comparación debe tomarse como orientativa por categoría y tamaño.

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no razona, no soporta tool calling ni agentes.
- Riesgo de degradación ante audio de baja calidad, ruido extremo, reverberación fuerte o canales distintos entre inscripción y prueba; el EER de 0,44 % corresponde a condiciones de evaluación estándar.
- La ventana TFLite de 180 frames (1,8 s) reduce la precisión frente a la inferencia JAX de secuencia completa (1,67-1,70 % frente a 0,44 % de EER), por lo que no es equivalente para producción en todos los escenarios.
- Sesgos demográficos, de acento y de idioma no documentados en la información disponible; el entrenamiento multi-corpus no garantiza equidad entre grupos.
- Riesgo de falsos positivos y negativos en verificación biométrica; requiere calibración de umbral por dominio y no debe usarse como único factor de autenticación en sistemas críticos.
- La model card advierte explícitamente de que no es un producto oficialmente soportado por Google y de que es una reimplementación desde cero basada en papers.
- La licencia Apache 2.0 permite uso comercial, pero el usuario debe verificar las condiciones de los corpus de entrenamiento (VoxCeleb, CN-Celeb, LibriSpeech, MUSAN, RIR) para su propio caso.
- El frontend de audio no es un `AutoFeatureExtractor` estándar de Hugging Face; integrarlo requiere la librería `flaxspeaker` o reimplementar el pipeline Mel + VAD + CMVN.
- No hay datos publicados de latencia, throughput ni consumo energético en la información disponible.

## Enlaces

- Hugging Face: https://huggingface.co/wq2012/univ_full_eres2conformer_xl
- Colección FlaxSpeaker: https://huggingface.co/collections/wq2012/flaxspeaker
- Repositorio GitHub: https://github.com/wq2012/FlaxSpeaker
- Paquete PyPI: https://pypi.org/project/flaxspeaker/
- Paper GE2E: https://arxiv.org/abs/1710.10467
- Paper Dr-Vectors: https://arxiv.org/abs/2104.01989
- Paper ATP: https://arxiv.org/abs/2202.12163
- Paper PFAS: https://arxiv.org/abs/2203.05642
