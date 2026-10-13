# TiMauzi/wav2vec2-large-xls-r-300m-hsb

## Resumen

El modelo `TiMauzi/wav2vec2-large-xls-r-300m-hsb` es un sistema de reconocimiento automático del habla (ASR) desarrollado por el usuario TiMauzi, consistente en un ajuste fino de `facebook/wav2vec2-xls-r-300m` sobre el corpus Mozilla Common Voice 11.0 en alto sorbio (`hsb`), una lengua eslava minoritaria hablada en la región de Lusacia, en Alemania. Se publica bajo licencia Apache 2.0 y con 315.485.870 parámetros en formato safetensors, lo que lo sitúa en la gama de modelos ASR de tamaño medio aptos para ejecución en hardware de consumo.

Su relevancia radica en que cubre una lengua con recursos digitales muy escasos: apenas existen modelos ASR públicos específicos para alto sorbio, y este es un caso de transferencia desde un modelo multilingüe preentrenado sobre 128 idiomas (XLS-R) hacia un dominio de bajos recursos. El ajuste se realizó durante una única época con el dataset Common Voice 11.0, con una tasa de error de palabra (WER) en validación de 0,5606 en el último punto de control registrado (paso 2200), un valor alto que refleja la dificultad del idioma y lo limitado del ajuste.

La model card original está generada automáticamente por el `Trainer` de Hugging Face y no incluye documentación adicional sobre composición del dataset, normalización de texto ni métricas finales sobre test. El propio autor marca una versión sucesora (`TiMauzi/wav2vec2-large-xls-r-300m-hsb-2`), lo que sugiere que este checkpoint es un artefacto intermedio más que una versión final de producción. Con 13 descargas y 0 "likes", se trata de un modelo de nicho orientado a investigación en lenguas minoritarias más que a uso industrial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Wav2Vec2 (encoder convolucional de extracción de características + encoder Transformer) con cabeza CTC; instanciado como `Wav2Vec2ForCTC` |
| Parametros totales | 315.485.870 (dato real de safetensors) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo ASR: procesa audio en bruto, no secuencias de tokens) |
| Tipos de cuantizacion | no especificados por el autor. Pesos publicados en precisión completa (float32). Conversión a fp16/int8 u ONNX/GGUF posible con herramientas externas, sin soporte oficial |
| Idiomas soportados | hsb (alto sorbio) como único idioma de destino. El modelo base `facebook/wav2vec2-xls-r-300m` está preentrenado sobre 128 idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repositorio de 2,5 GB; incluye también pesos en formato PyTorch) |

## Arquitectura y entrenamiento

La arquitectura es la estándar de Wav2Vec2 para reconocimiento de voz: un extractor de características convolucional que consume audio en bruto a 16 kHz y lo submuestrea temporalmente, seguido de un encoder Transformer de 24 capas con dimensión oculta de 1024 y 16 cabezas de atención (configuración de XLS-R 300M), y una cabeza de clasificación lineal entrenada con pérdida CTC sobre el vocabulario de caracteres del alto sorbio. Al tratarse de un ajuste fino de `facebook/wav2vec2-xls-r-300m`, hereda el preentrenamiento auto-supervisado multilingüe de XLS-R, realizado sobre decenas de miles de horas de audio en 128 idiomas, incluidos varios eslavos occidentales que actúan como lenguas puente para el sorbio.

El ajuste fino se ejecutó sobre `mozilla-foundation/common_voice_11_0` (subconjunto `hsb`) durante una sola época, con los siguientes hiperparámetros declarados por el autor: learning rate 0,0006, batch de entrenamiento 16, batch de evaluación 8, acumulación de gradiente 2 (batch efectivo 32), semilla 42, optimizador Adam con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 50 pasos de calentamiento. Las versiones de framework fueron Transformers 4.32.1, PyTorch 2.0.1+cu118, Datasets 2.14.4 y Tokenizers 0.13.3. No se documenta en la información disponible ninguna fase de RLHF, DPO, decodificación especulativa ni innovación técnica adicional más allá del propio ajuste CTC.

## Capacidades

- Transcripción de voz a texto monolingüe para alto sorbio (`hsb`) a partir de audio en bruto muestreado a 16 kHz.
- Salida a nivel de carácter mediante decodificación CTC (el vocabulario lo genera `Wav2Vec2CTCTokenizer` a partir del texto del corpus, por lo que reproduce el conjunto de grafemas presente en Common Voice 11.0 para `hsb`).
- Transferencia multilingüe: al derivar de XLS-R, el modelo conserva representaciones acústicas de 128 idiomas, aunque su capa de clasificación está adaptada exclusivamente al sorbio.
- Inferencia por lotes de audio corto o de fragmentos largos troceados manualmente (no hay segmentación automática ni marcas de tiempo integradas).
- Compatible con `pipeline("automatic-speech-recognition")` de Transformers y con endpoints compatibles (`endpoints_compatible`).
- No dispone de tool calling, function calling, modo de razonamiento, capacidades de agente, visión ni audio generativo: es exclusivamente un modelo ASR.

## Casos de uso

- Investigación en lenguas minoritarias: sirve como punto de partida para experimentos de ajuste fino con más épocas o con datos adicionales de alto sorbio, dado que su WER elevado (0,56) lo descarta como solución final pero lo convierte en una línea base reproducible.
- Transcripción asistida de archivos de radio o televisión en sorbio: integrado en un pipeline previo a revisión humana, puede generar borradores de subtítulos que un hablante nativo corrige, reduciendo el tiempo de transcripción manual.
- Preservación digital de patrimonio oral: digitalización y etiquetado de grabaciones históricas en alto sorbio para archivos lingüísticos, aceptando la necesidad de post-edición dado el nivel de error.
- Punto de partida para transferencia a lenguas relacionadas: el autor publica extensiones hacia bajo sorbio (`dsb`) reutilizando este checkpoint, lo que demuestra su utilidad como base intermedia en cadenas de ajuste incremental.
- Evaluación comparativa de modelos XLS-R: sirve para medir el impacto real del ajuste fino sobre un idioma de muy bajos recursos frente al modelo base sin ajustar.
- Análisis lingüístico y fonético asistido por ordenador: alineación aproximada de audio y transcripción para estudios de corpus en sorbio, siempre con validación manual por el margen de error.
- No es adecuado para dictado en tiempo real, asistentes de voz ni transcripción de producción sin una revisión humana intensiva, debido a su WER superior al 50 %.

## Benchmarks y rendimiento

Resultados de validación declarados por el autor en la model card (métrica: WER; dataset: Common Voice 11.0 `hsb`):

| Paso | Pérdida de entrenamiento | Pérdida de validación | WER |
|---|---|---|---|
| 200 | 4,408800 | 2,981909 | 0,979601 |
| 400 | 1,089200 | 0,900384 | 0,821805 |
| 600 | 0,166900 | 0,946962 | 0,755920 |
| 800 | 0,091500 | 0,877633 | 0,682767 |
| 1000 | 0,064100 | 0,883517 | 0,657913 |
| 1200 | 0,053000 | 0,865288 | 0,630715 |
| 1400 | 0,037800 | 0,867455 | 0,615475 |
| 1600 | 0,028900 | 0,834865 | 0,590621 |
| 1800 | 0,023800 | 0,845873 | 0,589215 |
| 2000 | 0,019600 | 0,830817 | 0,561313 |
| 2200 | 0,016300 | 0,836810 | 0,560610 |

El model-index oficial del repositorio declara `results: []`, es decir, no se publican métricas adicionales sobre conjuntos de test independientes. La pérdida de entrenamiento cae a 0,0163 mientras la de validación se estanca en torno a 0,83, lo que indica sobreajuste al conjunto de entrenamiento. Un agregador externo (aibase) cita para un modelo de nombre similar un WER de 0,4402 sobre Common Voice 8.0; ese dato no coincide con la model card oficial (Common Voice 11.0) y podría corresponder a otra revisión del modelo, por lo que no debe tomarse como resultado de este checkpoint.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,3 GB en float32 (315 M parámetros), unos 0,7 GB en fp16 y en torno a 0,35 GB en int8.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM. Funciona con holgura en RTX 3060, RTX 4060, RTX 4090, A100 y H100; no requiere GPU de centro de datos.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida suficiente para lotes pequeños.
- Ejecución en CPU: viable para transcripción por lotes fuera de línea; el modelo es pequeño en comparación con los ASR de la familia Whisper large.
- Opciones de despliegue: `transformers` (PyTorch) es la ruta oficial; `pipeline("automatic-speech-recognition")`; servidores de inferencia compatibles con Transformers como Hugging Face Inference Endpoints. No hay artefactos oficiales para llama.cpp, Ollama o vLLM, dado que no es un modelo de lenguaje generativo.
- Latencia y throughput: no disponibles. El autor no publica mediciones de latencia ni de factor en tiempo real.

## Comparativa con modelos similares

| Modelo | Parametros | Idioma objetivo | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TiMauzi/wav2vec2-large-xls-r-300m-hsb | 315 M | hsb (alto sorbio) | audio 16 kHz, sin límite de tokens | apache-2.0 | Hugging Face, 13 descargas |
| facebook/wav2vec2-xls-r-300m | 315 M | 128 idiomas (preentrenado) | audio 16 kHz | apache-2.0 | Hugging Face (modelo base) |
| TiMauzi/wav2vec2-large-xls-r-300m-hsb-2 | no disponible | hsb (alto sorbio) | audio 16 kHz | no disponible | Hugging Face (versión sucesora declarada por el autor) |
| openai/whisper-large-v3 | 1.550 M | 99 idiomas; hsb no soportado oficialmente | audio 30 s por ventana | apache-2.0 | Hugging Face |
| facebook/mms-1b-all | 1.000 M | más de 1100 idiomas | audio variable | CC-BY-NC 4.0 | Hugging Face |

La comparación con Whisper y con MMS es indirecta: ninguno de los dos declara alto sorbio entre sus idiomas soportados de forma explícita, de modo que no existen cifras de WER comparables publicadas para este idioma en la información disponible. La ventaja de este modelo es su licencia Apache 2.0 permisiva y su tamaño reducido; su desventaja es un WER muy superior al que ofrecen los grandes modelos multilingües en los idiomas que sí cubren.

## Limitaciones y advertencias

- WER en validación de 0,5606: más de la mitad de las palabras se transcriben incorrectamente en el mejor punto de control. No es utilizable en producción sin revisión humana.
- Solo una época de entrenamiento y caída continuada de la pérdida de entrenamiento hasta 0,0163 frente a una pérdida de validación estancada en 0,83: hay sobreajuste claro al conjunto de entrenamiento.
- Corresponde a un modelo de nicho con 13 descargas y 0 valoraciones, sin validación independiente por parte de la comunidad.
- La model card está generada automáticamente y no documenta normalización de texto, limpieza del corpus ni criterios de partición de datos; no se puede reproducir el experimento con exactitud.
- Sesgos potenciales derivados de Common Voice: sobrerrepresentación de determinados acentos, edades y géneros, y baja diversidad de hablantes por tratarse de una lengua con pocos contribuyentes.
- Riesgo de alucinación en pasajes de silencio, ruido o audio musical, comportamiento típico de los modelos CTC entrenados con pocos datos.
- Cobertura lingüística restringida al alto sorbio, sin soporte de mezcla de idiomas ni de otras variedades sorabas (el bajo sorbio requeriría el modelo específico del mismo autor).
- El vocabulario de salida es a nivel de carácter y depende del corpus de entrenamiento; puede fallar o emitir caracteres inexistentes ante grafemas ausentes en Common Voice 11.0.
- La licencia Apache 2.0 permite uso comercial, pero el rendimiento real hace inviable un producto de pago sin un ajuste adicional sustancial.
- El autor señala explícitamente una nueva versión (`wav2vec2-large-xls-r-300m-hsb-2`), por lo que conviene evaluarla antes de adoptar este checkpoint.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TiMauzi/wav2vec2-large-xls-r-300m-hsb
- Versión sucesora declarada por el autor: https://huggingface.co/TiMauzi/wav2vec2-large-xls-r-300m-hsb-2
- Modelo base: https://huggingface.co/facebook/wav2vec2-xls-r-300m
- Extensión del mismo autor hacia bajo sorbio reutilizando este checkpoint: https://huggingface.co/TiMauzi/wav2vec2-large-xls-r-300m-dsb-with-hsb-pretraining-saved
- Dataset de entrenamiento: https://huggingface.co/datasets/mozilla-foundation/common_voice_11_0
- Ficha en agregador externo (aibase): https://model.aibase.com/models/details/1915693337878880257
- Paper de XLS-R: https://arxiv.org/abs/2111.09296
- Paper de wav2vec 2.0: https://arxiv.org/abs/2006.11477
- Paper de Mozilla Common Voice: https://arxiv.org/abs/1912.06670
