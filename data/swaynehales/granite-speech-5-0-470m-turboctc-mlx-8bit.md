# swaynehales/granite-speech-5.0-470m-turboctc-mlx-8bit

## Resumen

Granite Speech 5.0 470M TurboCTC MLX 8-bit es una conversión no oficial del modelo de reconocimiento automático del habla (ASR) `ibm-granite/granite-speech-5.0-470m-turboctc` de IBM, publicada por el usuario swaynehales. El modelo original es un sistema CTC basado en bloques conformer con 470M parámetros, entrenado para transcripción multilingüe con puntuación y capitalización nativas en inglés, francés, alemán, español, portugués, italiano y japonés. Esta variante reempaqueta los pesos en formato MLX safetensors con cuantización afín de 8 bits, orientada a la inferencia en Macs con Apple Silicon mediante la librería Granite-MLX.

La relevancia de esta conversión es práctica: permite ejecutar un modelo ASR multilingüe de tamaño medio en hardware de consumo de Apple, sin GPU dedicada y con un peso en disco de aproximadamente 0,5 GB. Frente al modelo original en fp16, la cuantización de 8 bits reduce el espacio ocupado por los pesos manteniendo el resto de tensores en fp16. Es una opción interesante para transcripción local, prototipado en macOS y aplicaciones que requieren privacidad de audio sin enviar datos a la nube.

El modelo conserva la arquitectura del original: 16 bloques conformer entrenados con CTC, un cabezal BPE multilingüe de 16.384 tokens, submuestreo temporal de 8× (de 100 Hz a 12,5 Hz), atención por bloques sobre 128 frames y CTC auto-condicionado desde la capa intermedia. La licencia es Apache 2.0, lo que permite uso comercial y redistribución con las obligaciones habituales de atribución y aviso de cambios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Conformer CTC (16 bloques conformer, submuestreo temporal 8x, atencion por bloques de 128 frames, CTC auto-condicionado) |
| Parametros totales | 472.993.792 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (procesa audio de longitud variable sin padding; atencion por bloques de 128 frames) |
| Tipos de cuantizacion | 8-bit affine weight-only, group size 128 (64 para `encoder.input_linear`); 179 matrices cuantizadas, resto fp16 |
| Idiomas soportados | en, fr, de, es, pt, it, ja (multilingue) |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX safetensors (`model.safetensors`), layout de Granite-MLX |

## Arquitectura y entrenamiento

El modelo base es un sistema ASR CTC construido sobre 16 bloques conformer, una arquitectura que combina atención multi-cabeza, convoluciones y mecanismos feed-forward en cada bloque. Aplica un submuestreo temporal de 8× que reduce la tasa de frames de 100 Hz a 12,5 Hz, y utiliza atención por bloques sobre ventanas de 128 frames. Emplea CTC auto-condicionado desde la capa intermedia, una técnica que regulariza el entrenamiento intermedio y mejora la convergencia. El cabezal de salida es un vocabulario BPE multilingüe de 16.384 tokens, con puntuación y capitalización nativas.

La información proporcionada no detalla el volumen de datos de entrenamiento, la composición del dataset ni si hubo etapas de RLHF o DPO; estos datos remiten a la model card de IBM en la revisión fijada. La conversión a MLX no modifica la arquitectura ni reentrena: solo cambia el layout de pesos, la precisión (8 bits afín, group size 128, con 64 para `encoder.input_linear` por no ser divisible por 128), el `config.json` (añade bloque de cuantización) y un ajuste del tokenizer. Se conservan 534 tensores originales (almacenados como 892 arrays por las escalas y sesgos de cuantización), se eliminan 16 contadores `num_batches_tracked` de BatchNorm y se transponen 16 pesos Conv1d depthwise de `[O,I,K]` a `[O,K,I]`.

## Capacidades

- Reconocimiento automático del habla (ASR) sobre audio mono de 16 kHz.
- Transcripción multilingüe en inglés, francés, alemán, español, portugués, italiano y japonés.
- Puntuación y capitalización nativas en la salida, sin postprocesado adicional.
- Procesamiento de audio de longitud variable sin padding ni forma fija (la feature log-mel + delta se calcula en Swift dentro de Granite-MLX).
- Inferencia en Apple Silicon mediante MLX, con cuantización de 8 bits.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: es un modelo puramente CTC de transcripción.
- No dispone de modo thinking, visión ni audio generativo; solo entrada de audio y salida de texto.

## Casos de uso

- Transcripción local en macOS: ejecutar el modelo con Granite-MLX en un Mac con Apple Silicon para dictado o subtitulado sin enviar audio a servidores externos, aprovechando el peso reducido de 0,5 GB.
- Subtitulado de reuniones multilingües: transcribir audio en inglés, español, francés o alemán con puntuación nativa, adecuado para actas y resúmenes posteriores en pipelines de procesamiento de lenguaje.
- Prototipado de asistentes de voz: integrar la transcripción como primer paso de un pipeline ASR + LLM en aplicaciones de escritorio para macOS, donde el modelo actúa como componente de entrada de voz.
- Investigación en ASR: usar la variante cuantizada como referencia ligera para comparar precisión y latencia frente al modelo fp16 original en experimentos con hardware de consumo.
- Aplicaciones de accesibilidad: transcripción en tiempo casi real de audio en directo para personas con dificultades auditivas, desplegada localmente en un portátil Apple.
- Análisis de contenido audiovisual: procesar archivos de audio en lote (podcasts, entrevistas) en siete idiomas para generar transcripciones indexables, con la ventaja de no requerir GPU dedicada.
- Evaluación de despliegue en edge: validar el rendimiento de un modelo CTC de 470M en MLX antes de decidir una migración a servidores con vLLM u otras pilas, dado que esta conversión no es compatible con `mlx-audio` ni `mlx-lm`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de la conversión remite a la model card de IBM en la revisión fijada para benchmarks y el informe técnico, pero no reproduce cifras.

## Requisitos de hardware

- VRAM estimada: al ser MLX y ejecutarse en memoria unificada de Apple Silicon, el modelo ocupa aproximadamente 0,5 GB en disco y una cantidad similar en memoria al cargarse; el resto del presupuesto de memoria depende del búfer de audio y del runtime.
- GPU recomendadas: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). La conversión se generó y verificó en un Apple M2 Max con macOS 27.0.1.
- Cabe en GPU de consumo: sí, en cualquier Mac con Apple Silicon; no está pensado para GPUs NVIDIA ni para CUDA.
- Opciones de despliegue: exclusivamente Granite-MLX (`GraniteModelLoader`). No es compatible con `mlx-audio` ni `mlx-lm` por diferencias de layout. Para el modelo original en otros entornos, consultar la model card de IBM.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato / despliegue |
|---|---|---|---|---|---|
| granite-speech-5.0-470m-turboctc-mlx-8bit (este) | 472.993.792 | no disponible | 7 idiomas | Apache 2.0 | MLX safetensors 8-bit, Granite-MLX |
| ibm-granite/granite-speech-5.0-470m-turboctc | 470M | no disponible | 7 idiomas | Apache 2.0 | safetensors fp16, transformers |
| ibm-granite/granite-speech-5.0-470m-turboctc-nc | 470M | no disponible | inglés | CC-BY-NC-SA-4.0 | safetensors, transformers |

La comparación se limita a las variantes del mismo modelo base documentadas en la información disponible. No se dispone de datos de benchmarks para comparar rendimiento entre ellas ni con alternativas de otros fabricantes.

## Limitaciones y advertencias

- Conversión no oficial: IBM no ha revisado ni respaldado esta variante; la responsabilidad de validación recae en el usuario.
- No compatible con `mlx-audio` ni `mlx-lm`; requiere Granite-MLX, lo que limita la portabilidad a otras pilas de inferencia.
- La cuantización de 8 bits puede introducir degradación en la precisión de transcripción frente al modelo fp16 original; no se han publicado métricas comparativas en la información disponible.
- Solo entrada de audio mono a 16 kHz; no procesa otros formatos sin remuestreo previo.
- Modelo puramente CTC: no genera texto libre, no razona ni soporta tool calling; su uso está acotado a transcripción.
- Riesgo de errores en audio con ruido, acentos no representados en el entrenamiento o solapamiento de hablantes; la información disponible no detalla el dataset de entrenamiento.
- Licencia Apache 2.0: permite uso comercial y redistribución, pero exige incluir copia de la licencia y aviso de cambios (recogidos en `MODIFICATIONS.md` y en los metadatos de los ficheros modificados).
- No confundir con `granite-speech-5.0-470m-turboctc-nc`, modelo distinto en inglés y bajo CC-BY-NC-SA-4.0, no utilizado en esta conversión.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/swaynehales/granite-speech-5.0-470m-turboctc-mlx-8bit
- Modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc
- Revisión fijada del modelo base: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/tree/91dcb0605daf65f88dbb04fef015c423241d941d
- Model card de IBM en la revisión fijada: https://huggingface.co/ibm-granite/granite-speech-5.0-470m-turboctc/blob/91dcb0605daf65f88dbb04fef015c423241d941d/README.md
- Librería Granite-MLX: https://github.com/kylehowells/Granite-MLX
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
