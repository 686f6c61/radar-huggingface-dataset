# YellowPlus/AirDecision-4B-v1.1

## Resumen

AirDecision-4B-v1.1 es un modelo de decisión estructurada desarrollado por YellowPlus, obtenido por fine-tuning supervisado del modelo multimodal `unsloth/Qwen3.5-4B`. No es un modelo generativo al uso: reformula la tarea de decisión como una única pasada causal sobre una plantilla enmascarada con el token especial `<decision>`, siguiendo la formulación del proyecto Intern-Decision. El modelo puntúa preguntas de tipo `choice` (elección entre opciones), `noul` (probabilidad binaria calibrada) y `score` (expectativa ordinal) sin generar ningún token de salida.

Su relevancia radica en el enfoque de supervisión: se entrenó sobre 68.440 ejemplos y 101.316 decisiones tipadas, de las cuales 80.911 se supervisaron con distribuciones de probabilidad completas (soft labels) en lugar de etiquetas one-hot. Esto produce una calibración nativa muy ajustada (temperatura post-hoc T = 1,074 frente a ~1,8–2,0 en baselines con etiquetas duras) y reduce aproximadamente 3× la KL frente al gold suave y el Brier score en evaluaciones held-out. El paquete incluye un motor de inferencia offline sin dependencias y un servidor HTTP de loopback compatible con el harness JevBench.

El modelo está pensado para cargas de trabajo de decisión de una sola pasada en entornos reproducibles (contenedores aislados, sin red, solo lectura), no para generación de texto libre ni razonamiento multi-paso.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal con torre de visión congelada) |
| Parametros totales | 4.539.265.536 (~4,54 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8.192 tokens de entrada (truncación prohibida) |
| Tipos de cuantizacion | no disponible (el runtime oficial usa `bfloat16`) |
| Idiomas soportados | en (inglés) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

El modelo parte de `Qwen3.5-4B` (commit `3764fa359b9082ea5a1e4a5e3ac3aaf6e9671636`), un transformer multimodal con torre de visión que permanece congelada durante el fine-tuning. La innovación central es el protocolo de decisión de Intern-Decision: en lugar de generar una respuesta autoregresivamente, se construye un esqueleto de asistente con el token `<decision>` enmascarado y se realiza un único prefill causal. En esa posición se leen las logits correspondientes a los símbolos de opción (hasta 62 símbolos de un solo token: `A–Z`, `a–z`, `0–9`) y se derivan las probabilidades calibradas. El resultado es determinista: cero tokens generados, sin cadena de pensamiento, sin muestreo, sin reintentos ni ensembles.

El entrenamiento se realizó desde cero sobre el modelo base con 68.440 ejemplos y 101.316 decisiones tipadas. La supervisión principal emplea entropía cruzada sobre distribuciones suaves completas (`-sum_i p_i log q_i` en las posiciones `<decision>`), complementada con un pipeline de síntesis verificado a ciegas en doble pasada (generación de restricciones con `deepseek/deepseek-v4.1-flash` y verificación por solucionadores ciegos en modo thinking y non-thinking). Los corpus sintéticos cubren políticas y scoring multi-restricción (`hard-synth-v1`), diferimiento de llamadas a herramientas y documentos de entorno laboral (`aa-synth-v1`), y se aumentaron con permutaciones de opciones, remapeo de símbolos y cambios de encuadre afirmativo/negativo con targets suaves mapeados para forzar invariancia de orden y de framing. Se aplicó además una auditoría de descontaminación (exacta, Jaccard de n-gramas y embeddings densos con `bge-m3`) que eliminó 39 filas filtradas de corpus públicos upstream y verificó cero fugas contra JevBench público, `EvalSafe-O*NET-AA` y `WildGuardTest`. La calibración post-hoc se aplica con temperature scaling T = 1,074075346278083, almacenada en `calibration/calibration.json` y verificada por SHA-256 en memoria.

## Capacidades

- Puntuación de preguntas de elección (`choice`) entre hasta 62 opciones de un solo token por pregunta.
- Estimación de probabilidad binaria calibrada (`noul`) para preguntas de sí/no.
- Estimación de expectativa ordinal (`score`) para preguntas de escala.
- Procesamiento de hasta 16 preguntas por petición en una sola pasada causal.
- Lectura de estado estructurado (por ejemplo, tickets, documentos o metadatos) como evidencia en formato JSON.
- Invariancia entrenada frente a permutación de opciones y cambios de encuadre afirmativo/negativo.
- Capacidad multimodal heredada del modelo base (torre de visión congelada), aunque la model card no documenta uso de imagen en el contrato de inferencia.
- No soporta tool calling, agentes, razonamiento multi-paso ni generación de texto: la salida son puntuaciones, no texto.

## Casos de uso

- Enrutamiento de tickets de soporte: dado un estado con el texto del ticket y metadatos (por ejemplo, `tier: pro`), el modelo puntúa la cola de atención adecuada como pregunta `choice`, aprovechando la calibración para fijar umbrales de derivación a humanos.
- Clasificación de documentos de RR. UU. y cumplimiento: sobre documentos de entorno laboral sintéticos del corpus `aa-synth-v1`, se formulan preguntas `choice` o `noul` para decidir si un documento requiere revisión, con probabilidad calibrada directamente utilizable como score de riesgo.
- Diferimiento de llamadas a herramientas: el modelo evalúa si una petición debe resolverse con una herramienta externa o responderse directamente (formulación de tool-call deferral de `nvidia/When2Call`), devolviendo una probabilidad binaria `noul` en una sola pasada.
- Evaluación de políticas multi-restricción: con el corpus `hard-synth-v1`, se plantean preguntas de scoring ordinal (`score`) sobre si una acción cumple varias restricciones simultáneas, útil en motores de decisión de políticas.
- Evaluación reproducible de benchmarks de decisión: el servidor `/v1/systemone` y el adaptador `typesafe` permiten ejecutar el harness de JevBench en contenedores `--network none --read-only`, con verificación de calibración por SHA-256 y rechazo HTTP 422 antes de tocar CUDA.
- Filtrado y priorización en pipelines de datos: al no generar tokens y ser determinista, encaja en procesos batch donde se necesita puntuar miles de decisiones tipadas con latencia de un único forward pass y sin coste de decodificación.
- Gate de seguridad en producción: la formulación `noul` calibrada permite usar el modelo como clasificador binario con umbrales ajustables para decidir si una petición pasa a un modelo generativo mayor o se bloquea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona evaluación sobre JevBench y describe mejoras relativas (~3× menor KL frente al gold suave y Brier en held-out, T = 1,074 frente a ~1,8–2,0 en baselines de etiquetas duras), pero no incluye tablas de puntuaciones absolutas ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia en `bfloat16`: aproximadamente 9,1 GB solo para pesos (tamaño del repo), más activaciones y caché KV para hasta 8.192 tokens de contexto; en la práctica se recomienda un GPU con 16 GB o más.
- GPU recomendadas: A100, H100 o L40S para despliegue en producción; una RTX 4090 (24 GB) es suficiente para inferencia en `bfloat16` con el contexto máximo.
- Cabida en GPU de consumo: sí en RTX 4090 y RTX 3090 (24 GB); en GPUs de 16 GB (RTX 4080, 4070 Ti Super) es ajustado con contexto máximo y requeriría cuantización, para la cual no se documentan formatos oficiales.
- Opciones de despliegue: el paquete oficial incluye `inference.py` (motor nativo de Transformers, sin XTuner) y `serve.py`/`serve.sh` (servidor de loopback solo con stdlib). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI; el modelo no es un generador de texto estándar y su contrato de inferencia es específico.
- Latencia y throughput: no disponibles. El servidor serializa las pasadas con un lock (una petición por forward pass, sin batching), lo que limita el throughput a la latencia de un único prefill por petición.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AirDecision-4B-v1.1 | ~4,54 B | 8.192 | Decisión tipada en un prefill, soft labels, calibración T = 1,074 | Apache 2.0 | Hugging Face (repo propio) |
| Qwen3.5-4B (base) | ~4 B (no confirmado) | no disponible | Generación multimodal estándar | no disponible | Hugging Face (`unsloth/Qwen3.5-4B`) |
| Intern-Decision | no disponible | no disponible | Formulación de decisión con `<decision>` enmascarado | no disponible | GitHub (`InternLM/Intern-Decision`) |

No se dispone de datos de benchmarks ni de especificaciones completas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a arquitectura, licencia y disponibilidad.

## Limitaciones y advertencias

- Solo soporta inglés; no se documenta cobertura multilingüe.
- No es un modelo generativo: no produce texto, no soporta tool calling ni razonamiento multi-paso; usarlo fuera del contrato de decisión tipada dará resultados no válidos.
- Límite estricto de 8.192 tokens de entrada sin truncación: las entradas sobredimensionadas devuelven HTTP 422, lo que requiere gestión explícita en el cliente.
- Límite de 62 opciones de un solo token por pregunta y 16 preguntas por petición.
- Riesgo de alucinación no evaluado en la información disponible; al ser un clasificador calibrado, el riesgo principal es la sobreconfianza en distribuciones fuera de dominio, mitigada parcialmente por la temperatura calibrada.
- Sesgos conocidos: no documentados. El corpus de entrenamiento es mayoritariamente sintético y en inglés, lo que puede introducir sesgos de dominio (documentos laborales, políticas, tickets) no representativos de otros contextos.
- El servidor oficial serializa peticiones con un lock y no soporta batching, lo que limita el throughput en producción.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las obligaciones de atribución y las licencias del modelo base y de los datasets empleados (`LocalLLaMA/typed-decisions`, `nvidia/When2Call`).
- El paquete está diseñado para contenedores `--network none --read-only`; cualquier dependencia de red o escritura en disco rompe el contrato de ejecución documentado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YellowPlus/AirDecision-4B-v1.1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-4B
- Repositorio Intern-Decision: https://github.com/InternLM/Intern-Decision
- JevBench (benchmark): https://benchmarkheaven.com
- JevBench (harness): https://github.com/fstandhartinger/jevbench
- Dataset `LocalLLaMA/typed-decisions`: https://huggingface.co/datasets/LocalLLaMA/typed-decisions
- Dataset `nvidia/When2Call`: https://huggingface.co/datasets/nvidia/When2Call
