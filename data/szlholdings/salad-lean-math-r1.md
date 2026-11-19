# SZLHOLDINGS/salad-lean-math-r1

## Resumen

salad-lean-math-r1 es un adaptador LoRA (PEFT) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen2.5-Coder-3B-Instruct, un transformer decoder-only de 3.000 millones de parametros con una ventana de contexto nativa de 32.768 tokens. El adaptador se presenta como un artefacto de entrenamiento en fase candidata, no como un modelo de produccion publicado, y forma parte del programa interno de entrenamiento "Salad" de la organizacion, orientado a la generacion de codigo y matematicas en ingles.

La relevancia de esta publicacion no reside en una mejora de rendimiento demostrada, sino en su doctrina de trazabilidad: el autor declara entrenamiento con "receipted-training" fail-closed, con medicion de energia mediante doble contabilidad NVML/Zeus y la publicacion de un ladder completo de checkpoints (50, 100, 150 y 200 pasos) junto a un directorio `final/`. El repositorio ocupa 0,7 GB, coherente con un adaptador LoRA sobre pesos base en safetensors, y no registra descargas ni interacciones en el momento de la consulta.

La ficha se limita a los datos disponibles en la model card y en los metadatos de Hugging Face. No se han publicado resultados de benchmarks, detalles del dataset de entrenamiento, hiperparametros de LoRA ni metricas de evaluacion, por lo que esos apartados se marcan explicitamente como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer decoder-only Qwen2.5-Coder-3B-Instruct |
| Parametros totales | 3B en el modelo base; numero de parametros del adaptador no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens (heredada del modelo base Qwen2.5-Coder-3B-Instruct) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del merge con el base) |
| Idiomas soportados | en (ingles declarado en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen2.5-Coder-3B-Instruct, un transformer decoder-only con atencion causal, RoPE y mecanismos de atencion con query-key normalization propios de la familia Qwen2.5. El entrenamiento se realizo mediante LoRA (Low-Rank Adaptation) con la libreria PEFT, lo que congela los pesos del modelo base e introduce matrices de bajo rango en las proyecciones seleccionadas. El repositorio incluye un ladder de checkpoints en los pasos 50, 100, 150 y 200, ademas de un checkpoint final, lo que permite inspeccionar la evolucion del adaptador durante el entrenamiento.

La model card describe el proceso como parte del programa "Salad" de SZL Holdings, ejecutado sobre contenedores GPU de Salad bajo una doctrina de "receipted-training" fail-closed: los recibos de finalizacion y los heartbeats se registran en los logs de la lane SZLHOLDINGS/frontier-54-runs, y la energia se mide con doble contabilidad NVML/Zeus. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, la presencia de RLHF/DPO ni los hiperparametros del adaptador (rank, alpha, dropout, learning rate). Tampoco se documenta ninguna innovacion de decodificacion o atencion especifica del adaptador.

## Capacidades

- Generacion de texto en ingles sobre el modelo base Qwen2.5-Coder-3B-Instruct.
- Generacion y asistencia de codigo, heredada del base entrenado especificamente para tareas de programacion.
- Razonamiento matematico basico a moderado, presumiblemente reforzado por el ajuste "math" del adaptador, aunque sin metricas publicadas que lo confirmen.
- Soporte de tool calling y function calling heredado del formato de chat de Qwen2.5-Coder-Instruct (no verificado especificamente en el adaptador).
- Capacidad multilingue limitada: la model card declara unicamente ingles, aunque el base soporta mas idiomas.
- No se documentan capacidades de vision, audio, thinking mode explicito ni agentes multi-paso especificos del adaptador.

## Casos de uso

- Asistente de codigo en IDE para autocompletado y explicacion de fragmentos: el adaptador se integra sobre Qwen2.5-Coder-3B-Instruct y conserva la ventana de 32.768 tokens, suficiente para ficheros y contextos de repositorio medianos.
- Generacion de tests unitarios y documentacion tecnica en ingles: el ajuste sobre un base orientado a codigo permite producir artefactos de soporte a partir de firmas de funciones y docstrings.
- Prototipado de tutoria matematica en ingles: el sufijo "math" del adaptador sugiere un ajuste orientado a resolucion de problemas, util en entornos educativos de baja latencia.
- Evaluacion de pipelines de entrenamiento reproducible: el ladder de checkpoints (50/100/150/200 y final) permite estudiar la curva de adaptacion de LoRA en un caso real con recibos de ejecucion.
- Investigacion sobre trazabilidad energetica de entrenamiento: los logs NVML/Zeus y los recibos de finalizacion sirven como material de auditoria para estudiar coste energetico de adaptadores pequenos.
- Despliegue en entornos con recursos limitados: al ser un adaptador LoRA sobre un base de 3B, puede servirse en una unica GPU consumer tras el merge, con coste de inferencia bajo.
- Base para fine-tuning posterior en dominios especificos de codigo o matematicas: el adaptador puede servir como punto de partida o como referencia de comparacion en experimentos de PEFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y el autor califica explicitamente el artefacto como "candidate training artifact - not a published production model".

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB en FP16 para el modelo base de 3B tras el merge; en cuantizacion 8 bits, en torno a 3,5-4 GB; en 4 bits, en torno a 2-2,5 GB. Estas cifras son estimaciones a partir del tamano del base, no datos publicados por el autor.
- GPU recomendadas: NVIDIA A100, H100, L40S o RTX 4090 para FP16 con contexto largo; RTX 3090, RTX 4080 o RTX 4070 Ti para cuantizacion 8/4 bits.
- Cabe en GPU consumer: si, en tarjetas con 8 GB o mas de VRAM en cuantizacion 4/8 bits, y en 12-16 GB en FP16.
- Opciones de despliegue: transformers + PEFT para cargar el adaptador directamente; vLLM y TGI tras fusionar el adaptador con el base; llama.cpp y Ollama requieren conversion previa a GGUF del modelo fusionado.
- Latencia y throughput: no disponibles. No se han publicado mediciones del adaptador ni del base en la model card.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| salad-lean-math-r1 (este) | 3B (base) + adaptador LoRA | 32.768 | apache-2.0 | safetensors (PEFT) | Artefacto candidato, sin benchmarks publicados |
| Qwen2.5-Coder-3B-Instruct | 3B | 32.768 | apache-2.0 | safetensors, GGUF | Modelo base; benchmarks publicados por Qwen |
| Qwen2.5-Math-1.5B-Instruct | 1,5B | 32.768 (heredado de la familia) | apache-2.0 | safetensors | Especializado en matematicas; contexto y tamano inferiores |
| CodeLlama-7B-Instruct | 7B | 16.384 | Llama 2 Community License | safetensors, GGUF | Mayor tamano y contexto menor; licencia mas restrictiva |

La comparacion se limita a parametros, contexto y licencia, ya que no existen resultados de benchmarks publicados para el adaptador que permitan contrastar rendimiento.

## Limitaciones y advertencias

- El autor declara explicitamente que es un artefacto de entrenamiento candidato, no un modelo de produccion; no debe desplegarse sin evaluacion previa.
- No se han publicado benchmarks, por lo que se desconoce si el ajuste mejora, mantiene o degrada las capacidades del base Qwen2.5-Coder-3B-Instruct.
- Riesgo de alucinacion inherente a los modelos de 3B, especialmente en razonamiento matematico de varios pasos y en codigo con dependencias externas.
- Idiomas: la model card declara solo ingles; el rendimiento en castellano no esta documentado y puede degradarse respecto al base.
- No se documentan sesgos especificos del adaptador; los sesgos del base Qwen2.5-Coder no estan auditados en esta publicacion.
- Licencia apache-2.0 permisiva para uso comercial, pero el adaptador hereda las limitaciones y condiciones del modelo base, que el usuario debe verificar por separado.
- El adaptador requiere cargar el base Qwen2.5-Coder-3B-Instruct; no es un modelo autonomo y su despliegue implica gestionar dos artefactos o realizar un merge previo.
- El repositorio no registra descargas ni validacion de la comunidad, por lo que no hay evidencia externa de su comportamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-lean-math-r1
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-Coder-3B-Instruct
- Organizacion del autor: https://huggingface.co/SZLHOLDINGS
- Lane de ejecucion citada en la model card: SZLHOLDINGS/frontier-54-runs (referenciada en Hugging Face, sin URL directa en la informacion disponible)
- Repositorio de PEFT: https://github.com/huggingface/peft
- Repositorio de transformers: https://github.com/huggingface/transformers
