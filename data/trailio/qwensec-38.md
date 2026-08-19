# trailio/QwenSec-38

## Resumen

QwenSec-38 es un fine-tune del modelo Qwen/Qwen3.8-27B, desarrollado por el proyecto TrAIli, especializado en responder preguntas técnicas sobre código de PoCs (proof-of-concept) y CVEs. El modelo recibe el código fuente de la vulnerabilidad en el prompt y responde con análisis fundamentado: identifica qué línea dispara el fallo, describe el comportamiento de funciones concretas y mapea el código al CVE correspondiente. Está pensado para investigación de seguridad autorizada y entornos sandbox.

El modelo combina la arquitectura híbrida del base (gated-DeltaNet + gated-attention) con un ajuste fino mediante QLoRA 4-bit y rsLoRA, cuyos pesos se han fusionado directamente en el modelo base en bf16, de modo que no requiere cargar adaptadores por separado. Según los safetensors, el modelo tiene 15.342.885.684 parámetros (~15,3B), aunque la nomenclatura del base sugiere 27B; el contexto nativo es de 262K tokens. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones.

La relevancia de QwenSec-38 radica en su especialización: en lugar de un modelo generalista, ofrece respuestas con grounding en el código proporcionado, reduciendo el riesgo de alucinación en tareas de triage de CVEs. El modo thinking está desactivado por diseño, por lo que responde directamente sin bloques de razonamiento intermedios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Híbrida gated-DeltaNet + gated-attention (Qwen3.8-27B) |
| Parametros totales | 15.342.885.684 (~15,3B según safetensors; la nomenclatura del base indica 27B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens nativos; entrenado con truncación a 4096 tokens |
| Tipos de cuantizacion | bf16, 4-bit (bitsandbytes/QLoRA), 8-bit |
| Idiomas soportados | Inglés y código |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

QwenSec-38 parte de Qwen3.8-27B, un modelo causal con arquitectura híbrida que combina capas de atención con gated-DeltaNet, un mecanismo de estado lineal que reduce el coste computacional frente a la atención densa manteniendo capacidad de modelado de contexto largo. El contexto nativo es de 262K tokens. El fine-tune se realizó con QLoRA 4-bit NF4 con doble cuantización y cómputo en bf16, usando LoRA con r=32, alpha=32, inicialización gaussiana y rsLoRA. Se entrenaron 496 módulos (proyecciones lineales de atención q/k/v/o, DeltaNet in_proj_qkv/z/b/a/out_proj y MLP gate/up/down), con aproximadamente 233,5M de parámetros entrenables.

El dataset de entrenamiento contiene ~15.735 registros de chat (system + user + assistant) destilados por un modelo profesor a partir de PoCs alojados en GitHub con enriquecimiento de datos NVD. La pérdida se calcula solo sobre el turno del asistente, con el template de chat de Qwen renderizado con `enable_thinking=False`. No se usó sample packing (padding dinámico por lote, sin atención entre muestras), muestreo agrupado por longitud y truncación a 4096 tokens. El mejor checkpoint se seleccionó por eval loss, no por último paso. Hiperparámetros: NEFTune noise 5, learning rate 2e-4 con decaimiento coseno, warmup del 5% de los pasos, batch efectivo de 32 y hasta 3 épocas en una única GPU RTX PRO 6000 (96GB).

## Capacidades

- Respuesta a preguntas técnicas sobre código de PoCs de CVEs, citando líneas y funciones concretas del código proporcionado.
- Análisis fundamentado de comportamiento vulnerable: identifica qué línea dispara el fallo y describe la semántica de funciones específicas.
- Triage de CVEs: dado el texto del advisory o el PoC, responde qué hace el código y cómo se mapea al CVE.
- Generación y explicación de pasos de prueba para entornos dockerizados con targets vulnerables.
- Integración con pipelines RAG para asistentes de CVEs con datos actualizados.
- Sin modo thinking: responde directamente sin emitir bloques de razonamiento intermedios, lo que reduce latencia.
- Multilingüe limitado: inglés y código fuente; no soporta otros idiomas naturales.

## Casos de uso

- Triage de CVEs en investigación de seguridad autorizada: el analista incluye el PoC en el prompt y el modelo identifica el comportamiento vulnerable y las líneas relevantes, acelerando la clasificación inicial.
- Explicación de PoCs en entornos sandbox: dado un script de explotación, el modelo describe qué hace cada función y cómo se relaciona con la vulnerabilidad, útil para documentar hallazgos.
- Asistentes RAG de CVEs: combinado con una base vectorial de advisories y PoCs, el modelo responde consultas sobre vulnerabilidades específicas con grounding en las fuentes recuperadas.
- Generación de pasos de prueba para targets dockerizados: el modelo puede traducir un PoC en pasos de prueba reproducibles para laboratorios de seguridad.
- Formación y capacitación en seguridad: permite a analistas junior comprender PoCs complejos mediante preguntas en lenguaje natural sobre el código.
- Auditoría de código en revisiones de seguridad: el modelo puede señalar patrones vulnerables en código proporcionado, aunque su especialidad principal es el análisis de PoCs existentes.
- Documentación automática de hallazgos: genera descripciones técnicas de vulnerabilidades a partir del código, listas para incorporar a informes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La evaluación descrita en la model card se limita a:

- Eval loss sobre un split held-out del 2% del dataset, calculada únicamente en los spans del turno del asistente.
- Comprobaciones cualitativas: respuestas con grounding en código (correctas, citando el código) frente a preguntas de CVE sin material de apoyo (pueden alucinar, identificado como modo de fallo conocido).

## Requisitos de hardware

- Inferencia en 4-bit (bitsandbytes): ~17GB de VRAM, ejecutable en GPUs consumer como RTX 3090, RTX 4090 o superiores.
- Inferencia en bf16: ~56GB de VRAM, requiere GPUs profesionales como A100 80GB, H100 o RTX PRO 6000.
- Entrenamiento: realizado en una única NVIDIA RTX PRO 6000 (Blackwell, 96GB) en la nube (RunPod), con duración de minutos a pocas horas.
- Despliegue compatible con transformers (attention implementation `sdpa`), vLLM y TGI por ser un modelo estándar de la familia Qwen.
- El adaptador LoRA original ocupa ~470MB; el modelo fusionado en bf16 ocupa ~56GB en shards.
- El repositorio en HuggingFace ocupa 18.9GB, consistente con pesos en cuantización 8-bit.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia |
|---|---|---|---|---|
| QwenSec-38 (este) | ~15,3B (safetensors) | 262K | CVE/PoC code-QA | Apache 2.0 |
| Qwen/Qwen3.8-27B (base) | 27B (nominal) | 262K | Generalista | Apache 2.0 |
| Modelos de seguridad generalistas (p.ej. Llama-3.x fine-tunes) | Variable | Variable | Seguridad general, no específico de CVE/PoC | Variable |

No se dispone de datos de benchmarks comparativos con otros modelos especializados en seguridad en la informacion proporcionada. La comparación directa con el base Qwen3.8-27B muestra que QwenSec-38 sacrifica capacidades generalistas por precisión en tareas de CVE/PoC code-QA, con la ventaja de no requerir carga de adaptadores.

## Limitaciones y advertencias

- Riesgo de alucinación sin grounding: si no se proporciona código o advisory en el contexto, el modelo puede inventar descripciones de CVEs, nombres de productos o versiones plausibles. Es obligatorio incluir el PoC o usar RAG.
- Datos destilados: el dataset de ~15,7K ejemplos fue generado por un modelo profesor, por lo que los errores del profesor pueden haberse propagado al fine-tune.
- Sin modo thinking: los bloques de razonamiento no se emiten por diseño, lo que limita la trazabilidad del razonamiento del modelo.
- Alcance lingüístico limitado: solo inglés y código; no soporta consultas en otros idiomas.
- Uso restringido a entornos autorizados: el modelo no debe usarse para probar o explotar sistemas sin autorización explícita.
- Discrepancia en el conteo de parámetros: la nomenclatura del base indica 27B, pero los safetensors muestran ~15,3B; verificar antes de dimensionar infraestructura.
- Los metadatos factuales de CVEs (puntuaciones, versiones afectadas) deben contrastarse con NVD o el advisory del vendor; el modelo no debe tratarse como fuente de verdad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/trailio/QwenSec-38
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adapter LoRA (versión separada, ~470MB): https://huggingface.co/<your-username>/qwen3.8-27b-traili-cve (referenciado en la model card, no verificado)
