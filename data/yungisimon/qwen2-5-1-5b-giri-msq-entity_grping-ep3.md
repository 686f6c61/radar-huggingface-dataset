# yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep3

## Resumen

El modelo `yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep3` es un ajuste fino completo (*full fine-tuning*) de `Qwen/Qwen2.5-1.5B-Instruct`, publicado por el usuario yungisimon en Hugging Face. Su propósito declarado es actuar como **modelo de memoria** (*memory model*) entrenado sobre pares sintéticos de pregunta-respuesta derivados del conjunto MuSiQue, empleando un método de agrupación de entidades denominado `entity_grping` (agrupación por entidad, con frecuencia documental máxima de 3). El checkpoint corresponde a la época 3 de 3 del entrenamiento.

Se trata de un modelo pequeño (1.543.714.304 parámetros, es decir, aproximadamente 1,5 mil millones), con arquitectura Qwen2 y licencia Apache 2.0, lo que lo hace ligero y desplegable en hardware modesto. No obstante, el modelo card no documenta resultados de evaluación ni benchmarks, y el repositorio registra cero descargas y cero *likes* en el momento de la consulta, por lo que su calidad real no está validada de forma independiente.

La relevancia de esta ficha es acotada: se trata de un experimento de investigación sobre memoria externa en modelos de lenguaje, no de un modelo de propósito general listo para producción. Su interés radica en la técnica de entrenamiento (memoria estructurada sobre MuSiQue con agrupación de entidades) y en su tamaño reducido, que permite reproducir el experimento con recursos limitados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) |
| Parámetros totales | 1.543.714.304 (1,54 B) |
| Parámetros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible como límite declarado; el entrenamiento usó `max sequence length` de 8096 tokens |
| Tipos de cuantización | no disponible (pesos publicados en bf16 safetensors) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen/Qwen2.5-1.5B-Instruct`, un transformer decoder-only denso de la familia Qwen2.5, y se ha ajustado mediante *full fine-tuning* con FSDP, es decir, actualizando el 100 % de los parámetros (1.543.714.304 entrenables). El entrenamiento se realizó en bf16 con *gradient checkpointing* y cálculo de pérdida únicamente sobre los tokens del asistente. Los hiperparámetros documentados son: batch efectivo de 256 (32 por dispositivo × 1 acumulación × 8 GPUs), learning rate de 2e-05 constante con *warmup* del 5 %, 3 épocas, weight decay de 0,01, *max grad norm* de 1,0 y longitud máxima de secuencia de 8096 tokens. El cómputo total fue de 1,24 horas de reloj (9,9 GPU-horas) sobre 8 aceleradores AMD Instinct MI325X.

El dato de entrenamiento es un conjunto sintético de pares de pregunta-respuesta derivado de MuSiQue (`msq_subset1000_numsamplingepochs1_entity_maxdf3_crossdoc_entity_combination_v3.json`) con 1.221.024 ejemplos. El método de agrupación `entity_grping` agrupa entidades con una frecuencia documental máxima de 3 y combina información entre documentos (*cross-doc*), lo que sugiere un objetivo de memoria estructurada más que de simple *instruction following*. No se documenta en la información disponible el uso de RLHF, DPO ni ninguna otra fase de alineamiento posterior al ajuste supervisado.

## Capacidades

- Generación de texto conversacional, heredada de la base instruct Qwen2.5-1.5B-Instruct.
- Función de **modelo de memoria**: recuperación y organización de información estructurada a partir de pares QA sintéticos sobre MuSiQue, con agrupación de entidades.
- Razonamiento multi-salto sobre documentos, en la medida en que el conjunto MuSiQue está diseñado para preguntas que requieren combinar información de varios pasajes.
- Soporte del chat template de Qwen (uso recomendado por el autor).
- Compatibilidad con `transformers` (`AutoModelForCausalLM.from_pretrained`) y con *endpoints* compatibles con Text Generation Inference según las etiquetas del repositorio.
- Capacidades de *tool calling*, agentes, visión, audio o modo *thinking*: no disponibles en la información proporcionada.

## Casos de uso

- **Investigación sobre memoria en LLM**: el modelo sirve como punto de partida reproducible para estudiar cómo un ajuste fino sobre pares QA sintéticos afecta a la capacidad de retener y recuperar entidades; su tamaño de 1,5 B permite iterar con presupuesto reducido.
- **Prototipado de sistemas de recuperación aumentada (RAG) con memoria estructurada**: puede integrarse como componente que agrupa entidades y combina evidencia entre documentos antes de pasar la respuesta a un modelo mayor.
- **Evaluación de técnicas de agrupación de entidades**: útil para comparar `entity_grping` frente a otras estrategias de agrupación en tareas de QA multi-documento sobre MuSiQue.
- **Generación de respuestas conversacionales en entornos con recursos limitados**: con 1,54 B de parámetros y pesos bf16 (unos 3,1 GB de repositorio), puede ejecutarse en una única GPU de consumo para tareas de chat sencillas.
- **Destilación o *fine-tuning* posterior**: al ser un checkpoint intermedio de un experimento, puede servir como inicialización para ajustes adicionales sobre dominios específicos.
- **Pruebas de regresión en pipelines de TGI**: las etiquetas `text-generation-inference` y `endpoints_compatible` permiten desplegarlo en infraestructura TGI para validar flujos de servicio antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en bf16**: aproximadamente 3,1 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias cortas.
- **VRAM estimada en cuantización de 8 bits**: alrededor de 1,6 GB de pesos; en 4 bits, alrededor de 0,8 GB (estimación teórica, no verificada por el autor).
- **GPU recomendadas**: cualquier GPU con al menos 8 GB de VRAM para bf16; A100, H100 o MI325X para despliegues de mayor concurrencia.
- **GPU de consumo**: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090; también en GPUs de 8 GB con cuantización.
- **Opciones de despliegue**: `transformers` (recomendado por el autor), Text Generation Inference (etiqueta `text-generation-inference`), y previsiblemente llama.cpp u Ollama si se generan pesos GGUF, aunque el repositorio solo publica safetensors.
- **Latencia y throughput**: no disponibles; el autor no reporta mediciones de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep3` | 1,54 B | 8096 en entrenamiento | Apache 2.0 | Hugging Face, 0 descargas | Ajuste fino experimental como modelo de memoria |
| `Qwen/Qwen2.5-1.5B-Instruct` | 1,54 B | 32 768 (según ficha oficial de Qwen2.5) | Apache 2.0 | Hugging Face, ampliamente usado | Modelo base instruct de propósito general |
| `Qwen/Qwen2.5-1.5B` | 1,54 B | 32 768 (según ficha oficial de Qwen2.5) | Apache 2.0 | Hugging Face | Modelo base sin alineamiento |
| `meta-llama/Llama-3.2-1B-Instruct` | 1,24 B | 128 000 | Llama 3.2 Community License | Hugging Face, requiere aceptación | Alternativa de tamaño similar con licencia restrictiva |

La comparación de rendimiento con estas alternativas no está disponible, ya que el autor no publica benchmarks y no existen evaluaciones independientes del checkpoint.

## Limitaciones y advertencias

- **Sin evaluación publicada**: no hay benchmarks, métricas ni validación independiente; no se puede afirmar que el ajuste fino mejore a la base en ninguna tarea concreta.
- **Riesgo de degradación respecto a la base**: el ajuste fino completo sobre un corpus sintético de 1,22 M de ejemplos puede haber erosionado capacidades generales de la base instruct (olvido catastrófico), algo no documentado por el autor.
- **Idiomas no declarados**: la model card no especifica cobertura lingüística; el conjunto MuSiQue es mayoritariamente en inglés, por lo que el uso en castellano no está garantizado.
- **Contexto efectivo incierto**: el entrenamiento usó secuencias de 8096 tokens, pero no se declara el límite de contexto del modelo resultante; no debe asumirse el contexto nativo de Qwen2.5.
- **Riesgo de alucinación**: al ser un modelo de 1,5 B sin evaluación de fidelidad, la generación de entidades o hechos inventados es plausible, especialmente en consultas fuera de la distribución de MuSiQue.
- **Sesgos**: no documentados; hereda los sesgos de Qwen2.5-1.5B-Instruct y los del corpus sintético generado.
- **Licencia**: Apache 2.0 permite uso comercial, pero al derivar de Qwen2.5 conviene verificar el cumplimiento de las condiciones de la licencia original de Qwen.
- **Madurez**: repositorio con 0 descargas y 0 *likes*, creado y actualizado el mismo día; no hay evidencia de uso en producción ni mantenimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yungisimon/Qwen2.5-1.5B-giri-msq-entity_grping-ep3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Dataset de referencia MuSiQue: no disponible en la información proporcionada
- Paper de MuSiQue: no disponible en la información proporcionada
- Repositorio o demo del autor: no disponible en la información proporcionada
