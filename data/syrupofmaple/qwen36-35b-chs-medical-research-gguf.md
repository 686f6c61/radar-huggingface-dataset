# SyrupOfMaple/qwen36-35b-chs-medical-research-gguf

## Resumen

El modelo `SyrupOfMaple/qwen36-35b-chs-medical-research-gguf` es un ajuste fino del modelo base `Qwen/Qwen3.6-35B-A3B` (35.505.251.456 parámetros totales), publicado por el usuario SyrupOfMaple bajo licencia Apache 2.0. Se distribuye exclusivamente en formato GGUF cuantizado y está especializado en investigación médica sobre el síndrome de hiperemesis cannabinoide (CHS, por sus siglas en inglés), análisis de literatura biomédica, farmacología, síntesis de evidencia y uso de herramientas.

El modelo parte de una arquitectura de mezcla de expertos (MoE), tal como indica la etiqueta `qwen3_5_moe` y la denominación "A3B" del modelo base, que sugiere del orden de 3.000 millones de parámetros activos por token. El ajuste se realizó con QLoRA en precisión NF4 de 4 bits mediante Axolotl, entrenando únicamente 19.169.280 parámetros correspondientes a las capas de atención y a las MLP del experto compartido.

Su relevancia es acotada pero específica: ofrece un artefacto listo para inferencia local con llama.cpp u Ollama en un nicho clínico muy concreto, con dos cuantizaciones publicadas (Q8_0 de 35,8 GB y Q4_K_M de 20,2 GB). No obstante, el repositorio no incluye resultados de benchmarks estandarizados ni información sobre longitud de contexto o idiomas soportados, y el conjunto de entrenamiento es reducido (10.048 muestras), lo que limita las garantías de generalización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), etiqueta `qwen3_5_moe`; detalles de capas y atención no disponibles |
| Parametros totales | 35.505.251.456 (~35,5B) |
| Parametros activos | ~3B segun la denominacion "A3B" del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF Q8_0 (35,8 GB) y Q4_K_M (20,2 GB, 4,89 BPW); entrenamiento en NF4 de 4 bits |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo base se distribuye en safetensors) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base `Qwen3.6-35B-A3B`: un transformer con mezcla de expertos en el que solo se activa una fracción de los parámetros por token (denominación A3B, aproximadamente 3.000 millones activos). El ajuste fino se aplicó con QLoRA de 4 bits en formato NF4 usando Axolotl, con 19.169.280 parámetros entrenables concentrados en las proyecciones de atención y en las MLP del experto compartido. No se documentan innovaciones arquitectónicas adicionales introducidas por el autor; el trabajo es exclusivamente de especialización por ajuste supervisado.

El corpus de entrenamiento consta de 10.048 muestras multidominio que combinan datos sobre CHS, MedReason, PaperSearchQA, ToolACE, PubMedQA y DrugMechDB/openFDA. Según la model card, la pérdida de evaluación bajó de 1,493 a 0,3385 y la perplejidad de evaluación se situó en 1,403. No se especifica el número de tokens totales, la composición exacta por fuente, la existencia de fases de RLHF o DPO, ni la configuración de hiperparámetros (rango LoRA, épocas, tasa de aprendizaje). La perplejidad tan baja sobre un conjunto de evaluación de tamaño no declarado debe interpretarse con cautela, ya que puede reflejar un solapamiento entre evaluación y dominio de entrenamiento.

## Capacidades

- Generación de texto conversacional en dominio médico, con especial énfasis en el síndrome de hiperemesis cannabinoide.
- Razonamiento clínico y farmacológico: mecanismos de acción, interacciones y síntesis de evidencia biomédica.
- Análisis de literatura científica y respuesta sobre documentos tipo PubMedQA y PaperSearchQA.
- Uso de herramientas y function calling, incorporado mediante el conjunto ToolACE.
- Razonamiento multi-paso para tareas de recuperación y síntesis de evidencia (DrugMechDB, openFDA).
- Capacidad multilingüe: no disponible en la información proporcionada.
- Visión, audio u otras modalidades: no disponibles; el repositorio solo declara texto conversacional.
- Modo "thinking" explícito: no disponible.

## Casos de uso

- Síntesis de evidencia sobre CHS: el modelo puede consolidar abstracts y artículos de PubMedQA en un resumen estructurado de mecanismos, criterios diagnósticos y opciones terapéuticas, aprovechando su ajuste específico sobre el dominio.
- Consulta farmacológica asistida: dado un principio activo y un cuadro clínico, generar fichas técnicas resumidas con mecanismo de acción, metabolismo y contraindicaciones, apoyándose en los datos de DrugMechDB y openFDA del entrenamiento.
- Extracción de información de literatura biomédica: procesar lotes de resúmenes y devolver entidades (fármaco, diana, efecto adverso) en formato estructurado mediante tool calling.
- Asistente de investigación interna: chatbot para equipos de farmacología que responde preguntas multi-turno sobre cannabinoides y vómitos cíclicos, con trazabilidad de las fuentes citadas en el prompt.
- Preprocesado de pipelines de revisión sistemática: clasificación y resumen preliminar de candidatos bibliográficos antes de la revisión manual por parte de un revisor humano.
- Integración en herramientas de línea de comandos: despliegue con llama.cpp u Ollama para prototipos locales de consulta médica sin conexión, útil en entornos con restricciones de confidencialidad.
- Generación de documentación técnica interna: redacción de notas de farmacovigilancia o resúmenes de alertas de la FDA a partir de datos tabulares introducidos en el prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo reporta métricas de entrenamiento:

| Metrica | Valor |
|---|---|
| Perdida de evaluacion inicial | 1,493 |
| Perdida de evaluacion final | 0,3385 |
| Perplejidad de evaluacion final | 1,403 |
| Parametros entrenables | 19.169.280 |
| Muestras de entrenamiento | 10.048 |

No hay datos de MMLU, HumanEval, GSM8K, MedQA, PubMedQA ni de comparación con el modelo base en la información proporcionada.

## Requisitos de hardware

- VRAM estimada con Q4_K_M (20,2 GB de pesos): en torno a 22-24 GB para cargar todos los tensores en GPU; cabe ajustadamente en una RTX 4090 (24 GB) o en una RTX 3090 (24 GB).
- VRAM estimada con Q8_0 (35,8 GB de pesos): en torno a 38-40 GB; requiere A100 40 GB, L40S 48 GB o dos GPU de 24 GB.
- Inferencia parcial en CPU: ambas cuantizaciones pueden ejecutarse con offload a RAM del sistema mediante llama.cpp, a costa de latencia; el Q4_K_M necesita unos 20-21 GB de RAM libre si se descarga completamente de la GPU.
- GPU recomendadas: RTX 4090 o 3090 para Q4_K_M; A100 40 GB, H100 o L40S para Q8_0; configuraciones multi-GPU de 24 GB como alternativa económica.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python y servidores compatibles con endpoints (la etiqueta `endpoints_compatible` sugiere compatibilidad con APIs tipo OpenAI). vLLM y TGI son viables solo si soportan la arquitectura MoE concreta del modelo base; no confirmado.
- Latencia y throughput: no disponibles. Al tratarse de un MoE con aproximadamente 3B de parámetros activos, se espera un throughput por token notablemente superior al de un modelo denso de 35B, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizaciones | Licencia | Enfoque |
|---|---|---|---|---|---|
| SyrupOfMaple/qwen36-35b-chs-medical-research-gguf | 35,5B (~3B activos) | no disponible | Q8_0, Q4_K_M | Apache 2.0 | Ajuste medico en CHS y farmacologia |
| Qwen/Qwen3.6-35B-A3B (base) | 35,5B (~3B activos) | no disponible | safetensors y GGUF de terceros | Apache 2.0 | Modelo generalista |
| unsloth/Qwen3.6-35B-A3B-GGUF | 35,5B (~3B activos) | no disponible | GGUF (varias) | Apache 2.0 | Cuantizacion del base sin ajuste |
| bartowski/Qwen_Qwen3.6-35B-A3B-GGUF | 35,5B (~3B activos) | no disponible | GGUF (varias) | Apache 2.0 | Cuantizacion del base sin ajuste |

No se dispone de benchmarks comparativos entre estas variantes en la información proporcionada. La diferencia principal frente a las cuantizaciones del base es la especialización del ajuste, no la arquitectura ni el tamaño.

## Limitaciones y advertencias

- El conjunto de entrenamiento es reducido (10.048 muestras); existe riesgo elevado de sobreajuste al dominio CHS y de degradación en tareas médicas generales.
- La perplejidad de evaluación de 1,403 puede reflejar solapamiento entre el conjunto de evaluación y el dominio de entrenamiento, no necesariamente una mejora real de capacidades.
- Riesgo de alucinación clínica: las respuestas farmacológicas o diagnósticas pueden ser plausibles pero incorrectas; se requiere validación por profesionales y contraste con fuentes primarias.
- No se han publicado evaluaciones de sesgo, toxicidad ni robustez; se desconoce el comportamiento en poblaciones o contextos no representados en el corpus.
- Idiomas soportados no declarados: no hay garantía de calidad fuera del inglés, dado que los conjuntos de origen (PubMedQA, MedReason, ToolACE) son mayoritariamente anglófonos.
- Longitud de contexto no documentada; el rendimiento en conversaciones largas o en documentos extensos es incierto.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está certificado como producto sanitario ni debe usarse para decisiones clínicas sin supervisión humana.
- El repositorio tiene 0 descargas y 1 "like", por lo que carece de validación por parte de la comunidad; conviene tratar los artefactos como un experimento de investigación.
- La cuantización Q4_K_M introduce pérdida de precisión adicional sobre un ajuste LoRA ya de 4 bits; no se documenta una evaluación de calidad post-cuantización.

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/SyrupOfMaple/qwen36-35b-chs-medical-research-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Cuantización GGUF del base por unsloth: https://huggingface.co/unsloth/Qwen3.6-35B-A3B-GGUF
- Cuantización GGUF del base por unsloth en ModelScope: https://www.modelscope.cn/models/unsloth/Qwen3.6-35B-A3B-GGUF
- Cuantización GGUF del base por bartowski en ModelScope: https://www.modelscope.cn/models/bartowski/Qwen_Qwen3.6-35B-A3B-GGUF
- Cuantización ShapeLearn del base (byteshape/OpenCSG): https://opencsg.com/models/byteshape/Qwen3.6-35B-A3B-GGUF
