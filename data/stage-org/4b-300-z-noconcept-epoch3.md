# Stage-org/4b-300-z-noconcept-epoch3

## Resumen

Stage-org/4b-300-z-noconcept-epoch3 es un modelo de lenguaje derivado de Qwen/Qwen3.5-4B mediante un proceso de aprendizaje por refuerzo (RL) ejecutado con un pipeline interno de la organizacion Stage-org. El checkpoint publicado corresponde al tercer epoch de un entrenamiento configurado para 10.000 pasos sobre el dataset `Stage-org/4b-300-z-noconcept`, con un juez externo basado en un modelo propietario (`gpt-5.6-luna`) para la evaluacion de respuestas abiertas. El nombre del repositorio sugiere un ajuste orientado a eliminar un concepto concreto ("noconcept"), aunque la model card no documenta explicitamente cual es ese concepto ni el objetivo final del entrenamiento.

El modelo tiene 4.539.265.536 parametros (aproximadamente 4,54 mil millones) y se distribuye en formato safetensors con un tamano de repositorio de 9,1 GB, lo que es coherente con pesos en precision bf16/fp16. La arquitectura subyacente es la de Qwen3.5-4B, etiquetada en Hugging Face con el tag `qwen3_5`, si bien no se detalla en la informacion disponible si emplea atencion estandar, atencion lineal o una combinacion hibrida. La ventana de contexto configurada durante la inferencia de RL es de 65.536 tokens (`max_model_len`), aunque el entrenamiento declara un `seq_len` de 300.000, lo que apunta a un contexto nativo o extendido muy amplio.

La relevancia de este checkpoint es limitada y experimental: se trata de un artefacto de investigacion con cero descargas y cero likes en el momento de la consulta, sin model card descriptiva, sin licencia declarada y sin resultados de benchmarks publicados. Resulta util unicamente como referencia para quienes quieran reproducir o auditar el pipeline de RL de Stage-org, no como modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer basado en Qwen3.5-4B (tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (aprox. 4,54 B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 65.536 tokens en inferencia RL (`max_model_len`); 300.000 tokens declarados como `seq_len` de entrenamiento |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4,5 mil millones de parametros. Sobre esa base se aplica un proceso de RL con `group_size = 8` (ocho muestras por prompt para estimar ventajas), temperatura de generacion 0,9, top-p 1,0 y `max_tokens` de 4096 por respuesta, con el modo de razonamiento (`enable_thinking`) activado. El optimizador es AdamW con learning rate 1e-6, weight decay 0,0, betas (0,9; 0,99) y gradient clipping de 1,0; la perdida incorpora una mascara DPPO con umbrales `dppo_mask_low = 0,2` y `dppo_mask_high = 0,28`, y un coeficiente KL de 0,001. El entrenamiento se ejecuta con 2 GPUs por nodo (1 para inferencia con vLLM, 1 para el entrenador) y atencion FlashAttention 2.

La senal de recompensa proviene de un juez externo (`gpt-5.6-luna`) con `reasoning_effort = "medium"`, temperatura 1,0 y hasta 4096 tokens de generacion, con hasta 3 reintentos y 32 peticiones concurrentes. El bucle de orquestacion permite hasta 256 rollouts en vuelo y 8 pasos off-policy maximos, con `seed = 7`. No se documenta el volumen de tokens de entrenamiento (el dataset figura como `new_task` sin path), la composicion del corpus, ni si hubo fases previas de SFT o DPO. Tampoco se especifica ninguna innovacion arquitectonica propia: el checkpoint es un ajuste por RL sobre la arquitectura original de Qwen3.5-4B.

## Capacidades

- Generacion de texto y razonamiento multi-paso, heredados de la base Qwen3.5-4B y potenciados por el modo `enable_thinking` activado durante el entrenamiento.
- Soporte de tool calling: la configuracion de inferencia usa `tool_call_parser = "qwen3_coder"`, lo que indica compatibilidad con el formato de llamadas a herramientas de la familia Qwen3.
- Soporte de agentes: el pipeline de RL esta disenado para entornos con multiples turnos y rollouts largos (hasta 256 en vuelo), lo que sugiere entrenamiento orientado a tareas agenticas.
- Capacidades multilingues: no disponibles en la informacion proporcionada.
- Capacidad especial declarada: el sufijo "noconcept" sugiere un ajuste para suprimir o desaprender un concepto concreto, pero no se documenta cual ni como se evalua.
- No se declaran capacidades de vision ni audio.

## Casos de uso

- Auditoria de pipelines de RL: el checkpoint sirve para inspeccionar como afecta el entrenamiento con juez externo y mascara DPPO al comportamiento del modelo base, comparando respuestas antes y despues del ajuste.
- Reproduccion de experimentos de desaprendizaje: si "noconcept" se refiere a la supresion de un concepto, el modelo puede usarse como referencia para estudiar tecnicas de unlearning y sus efectos colaterales en tareas generales.
- Investigacion sobre recompensas basadas en LLM juez: permite analizar sesgos y ruido introducidos por un juez propietario (`gpt-5.6-luna`) en el entrenamiento de un modelo de 4,5 B.
- Evaluacion de tool calling en agentes: al usar el parser `qwen3_coder`, es util para probar integraciones de function calling en entornos controlados de investigacion.
- Experimentos con contexto largo: la configuracion de entrenamiento con `seq_len` de 300.000 tokens permite estudiar el comportamiento del modelo en ventanas muy extensas, aunque la inferencia se limita a 65.536 tokens.
- Base para comparativas de eficiencia: con 4,54 B de parametros y pesos safetensors de 9,1 GB, sirve como punto de referencia para medir throughput y latencia en GPUs de gama media frente a otros modelos del mismo tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16/fp16: aproximadamente 9-10 GB solo para pesos, mas overhead de cache KV; con contexto de 65.536 tokens el consumo puede superar los 20-30 GB segun el batch.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 5-6 GB de pesos; en 4 bits, alrededor de 3-4 GB (no hay cuantizaciones oficiales publicadas, habria que generarlas).
- GPU recomendadas: A100 40/80 GB o H100 para contexto completo y batches grandes; RTX 4090 (24 GB) o RTX 3090 (24 GB) suficientes para bf16 con contexto moderado; GPUs de 16 GB (RTX 4080, A4000) viables solo con cuantizacion.
- Cabe en GPU de consumo: si, en RTX 4090/3090 con bf16 y contexto recortado, o en GPUs de 12-16 GB con cuantizacion 4/8 bits.
- Opciones de despliegue: vLLM (usado en el propio entrenamiento con `language_model_only = true` y parser `qwen3`), llama.cpp/Ollama si se generan pesos GGUF, y TGI como alternativa. El checkpoint safetensors es compatible con el ecosistema Hugging Face Transformers.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Stage-org/4b-300-z-noconcept-epoch3 | 4,54 B | 65.536 en inferencia (300.000 en entrenamiento) | no disponible | safetensors | Checkpoint experimental de RL, sin benchmarks ni model card descriptiva |
| Qwen/Qwen3.5-4B | ~4 B | no disponible en esta ficha | no disponible | safetensors | Modelo base del que deriva; previsiblemente con mejor comportamiento general y documentacion completa |
| Modelos de ~4 B de la familia Llama 3.2 | ~3-4 B | 128.000 (segun version) | licencia comunitaria Llama | safetensors, GGUF | Alternativa ampliamente soportada por el ecosistema y con cuantizaciones oficiales |
| Modelos de ~4 B de la familia Gemma 3 | ~4 B | 128.000 (segun version) | terminos de uso de Gemma | safetensors, GGUF | Buena cobertura multilingue y despliegue en consumer GPU |

La comparacion es orientativa: no hay datos de rendimiento del checkpoint de Stage-org que permitan establecer una equivalencia cuantitativa con las alternativas.

## Limitaciones y advertencias

- Ausencia total de model card descriptiva: no se documenta el objetivo del ajuste, el concepto eliminado ("noconcept"), ni los criterios de evaluacion.
- Sin licencia declarada: no se puede asumir uso comercial permitido; el uso en produccion queda bloqueado hasta que el autor aclare los terminos.
- Riesgo elevado de alucinacion y degradacion: el ajuste por RL con un juez propietario puede introducir sesgos hacia el estilo de respuesta del juez y alejar al modelo de su distribucion original.
- Sin benchmarks publicados: imposible verificar si el ajuste mejora o degrada capacidades como matematicas, codigo o razonamiento.
- Idiomas no declarados: se desconoce si el entrenamiento RL preservo el multilingueismo de la base Qwen3.5-4B.
- Contexto de inferencia limitado a 65.536 tokens pese al `seq_len` de 300.000 del entrenamiento: puede haber discrepancia entre el contexto visto en entrenamiento y el soportado en despliegue.
- Checkpoint experimental con cero descargas y cero likes: no hay evidencia de uso en comunidad ni validacion externa.
- Dependencia de un juez externo propietario durante el entrenamiento: la reproducibilidad completa requiere acceso al mismo endpoint y modelo juez.

## Enlaces

- Hugging Face: https://huggingface.co/Stage-org/4b-300-z-noconcept-epoch3
- Dataset declarado: https://huggingface.co/datasets/Stage-org/4b-300-z-noconcept
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Organizacion: https://huggingface.co/Stage-org
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion disponible.
