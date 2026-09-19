# Stage-org/4b-A-solvability-200-luna-v2-noshot-epoch3

## Resumen

`Stage-org/4b-A-solvability-200-luna-v2-noshot-epoch3` es un checkpoint de 4.539.265.536 parametros (unos 4,54 B) derivado del modelo base `Qwen/Qwen3.5-4B`, publicado por la organizacion `Stage-org`. No es un modelo preentrenado desde cero: se trata del resultado de un ciclo de ajuste por refuerzo (RL) sobre una tarea interna denominada "solvability", ejecutado mediante un pipeline automatizado de entrenamiento identificado como `jh-workflow`. La informacion publica se limita a la procedencia del entrenamiento y a la configuracion tecnica del mismo; no hay model card descriptiva, licencia ni idiomas declarados.

El interes de esta ficha, por tanto, es mas documental que practico: sirve como ejemplo de artefacto generado por un pipeline de RL con juez externo (el modelo `gpt-5.6-luna` actuando como evaluador de respuestas abiertas) y `prime_rl` como framework de entrenamiento, sobre una unica tarea de 200 elementos en regimen zero-shot ("noshot"). El nombre del repositorio y el sufijo `epoch3` indican la tercera epoca de un entrenamiento de 10.000 pasos del learner.

Conviene ser explicito: el repositorio no incluye evaluaciones, ni descripcion de capacidades, ni licencia, y registra 0 descargas y 0 likes en el momento de la consulta. Cualquier uso en produccion deberia tratarse como experimental y requeriria validacion propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (linaje Qwen3.5, tag `qwen3_5`); detalles internos no disponibles |
| Parametros totales | 4.539.265.536 (4,54 B) |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible en la model card; la configuracion de entrenamiento usa `seq_len = 300000` y la de inferencia vLLM fija `max_model_len = 65536` |
| Tipos de cuantizacion | Solo pesos en safetensors (BF16, inferido de 9,1 GB para 4,54 B de parametros); no se publican variantes GGUF, GPTQ ni AWQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Tamano del repositorio | 9,1 GB |
| Fecha de publicacion | 2026-09-19 |

## Arquitectura y entrenamiento

La arquitectura de partida es la del modelo `Qwen/Qwen3.5-4B`, un transformer decoder-only de la familia Qwen3.5, con atencion estandar compatible con `flash_attention_2` (asi aparece configurado en el trainer). El checkpoint publicado no modifica la topologia: se trata del mismo modelo base tras un proceso de ajuste por refuerzo. La configuracion de entrenamiento especifica `language_model_only = true`, lo que sugiere que el modelo base podria tener componentes multimodales descartados durante el RL.

El entrenamiento es de tipo RL con generacion on-policy y evaluacion por juez: `learner_steps = 10000`, `learner_epoch = 3`, `batch_size = 128`, `seq_len = 300000`, semilla 7 y `group_size = 8` (esquema tipo GRPO). La generacion usa `temperature = 0.9`, `top_p = 1.0`, `max_tokens = 4096` y `enable_thinking = true`. La funcion de recompensa se delega en un juez externo (`gpt-5.6-luna`) con `reasoning_effort = medium`, reintentos hasta 3 y hasta 32 peticiones en vuelo. El optimizador es AdamW con `lr = 1e-06`, `weight_decay = 0.0`, `max_norm = 1.0`, `betas = (0.9, 0.99)`, y la perdida incluye mascaras DPPO (`dppo_mask_low = 0.2`, `dppo_mask_high = 0.28`), `adv_tau = 1.0` y `kl_tau = 0.001`, lo que apunta a una variante de RL con control de divergencia respecto a la politica de referencia. El entrenamiento se ejecuto en 2 GPUs por nodo (1 para inferencia, 1 para entrenamiento).

## Capacidades

No hay documentacion de capacidades en la model card. A partir de la configuracion de entrenamiento y del linaje Qwen3.5 se puede inferir lo siguiente, siempre con caracter provisional:

- Generacion de texto autoregresiva en modo decoder-only.
- Razonamiento con modo "thinking" habilitado durante el entrenamiento (`enable_thinking = true`).
- Soporte de tool calling / function calling: la configuracion de vLLM define `tool_call_parser = "qwen3_coder"`, lo que implica que el checkpoint conserva el formato de llamada a herramientas de la familia Qwen3.
- Parseo de razonamiento mediante `reasoning_parser = "qwen3"`.
- Capacidades multilingues: no disponibles (heredadas potencialmente del modelo base, sin confirmar).
- Vision, audio u otras modalidades: no disponibles; `language_model_only = true` sugiere que no se entrenaron.
- Especializacion en tareas de "solvability": el ajuste RL se centro en resolver un conjunto de 200 tareas evaluadas por un juez, en regimen zero-shot. No se detalla la naturaleza de dichas tareas.

## Casos de uso

Dado que no hay evaluaciones publicas, estos casos son hipotesis de aplicacion razonables para un modelo de ~4,5 B con modo thinking y soporte de herramientas, no recomendaciones validadas:

- Evaluacion de pipelines de RL: el checkpoint sirve como referencia de como un modelo de 4,5 B responde tras 3 epocas de RL con juez externo, util para depurar recompensas, tasas de KL y estabilidad del entrenamiento.
- Investigacion sobre "reward hacking": al existir un juez LLM (`gpt-5.6-luna`) como fuente de recompensa, el modelo es un candidato para estudiar como un modelo pequeno se adapta a los sesgos del evaluador.
- Prototipado de agentes con tool calling: gracias al parser `qwen3_coder` y a la ventana de 65.536 tokens configurada en vLLM, puede integrarse en bucles de agente que encadenen varias llamadas a funciones dentro de una misma conversacion.
- Razonamiento en modo thinking para tareas de clasificacion o extraccion: el modo thinking habilitado en entrenamiento permite obtener trazas de razonamiento intermedias que pueden auditarse antes de la respuesta final.
- Base para destilacion o fine-tuning posterior: al ser un checkpoint de 4,54 B en BF16 (9,1 GB), es manejable como punto de partida para ajustes especificos en una unica GPU de 24 GB.
- Experimentacion academica con presupuesto reducido: el tamano permite reproducir inferencia y evaluaciones en GPUs de consumo, lo que facilita comparaciones controladas frente al Qwen3.5-4B original.
- Evaluacion de robustez zero-shot: el sufijo `noshot` indica que el entrenamiento fue sin ejemplos demostrativos, por lo que resulta adecuado para medir generalizacion sin prompt engineering.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y los resultados de busqueda web devueltos no guardan relacion con el modelo (corresponden a ofertas de practicas profesionales en frances).

## Requisitos de hardware

- VRAM en BF16 (pesos completos): aproximadamente 9,1 GB solo para pesos. Con cache KV para contexto largo (hasta 65.536 tokens en la configuracion vLLM de referencia) y batching, es razonable reservar 16-24 GB.
- VRAM en cuantizacion de 8 bits: en torno a 5 GB de pesos; viable en GPUs de 8-12 GB con contexto moderado.
- VRAM en cuantizacion de 4 bits: en torno a 2,5-3 GB de pesos; cabe en GPUs de 8 GB, aunque no se publican pesos cuantizados y habria que generarlos.
- GPUs recomendadas: NVIDIA A100 (40/80 GB), H100 (80 GB) y L40S (48 GB) para servir con contexto completo y concurrencia; RTX 4090 (24 GB) o RTX 4080 (16 GB) para inferencia en BF16 con contexto reducido.
- Cabe en GPU de consumo: si, en RTX 4090/4080 e incluso en GPUs de 8-12 GB si se cuantiza a 4 u 8 bits.
- Opciones de despliegue: vLLM es la via soportada explicitamente por la configuracion de entrenamiento (con `reasoning_parser = "qwen3"` y `tool_call_parser = "qwen3_coder"`). Para pesos GGUF habria que convertir a llama.cpp u Ollama, algo no publicado. TGI tambien seria viable en BF16.
- Latencia y throughput: no disponibles. La configuracion de entrenamiento uso `gpu_memory_utilization = 0.9` y `max_model_len = 65536` para el servidor de inferencia, pero no se reportan metricas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| `Stage-org/4b-A-solvability-200-luna-v2-noshot-epoch3` | 4,54 B | No disponible (vLLM a 65.536) | No disponible | HuggingFace, 0 descargas | Derivado RL de Qwen3.5-4B, sin benchmarks ni documentacion |
| `Qwen/Qwen3.5-4B` | ~4 B | No disponible en esta busqueda | No disponible | HuggingFace | Modelo base del anterior; capacidades y evaluaciones publicadas por el autor original |
| Modelos densos de ~3-4 B de la generacion 2025-2026 (Qwen3.5-4B, Llama 3.2 3B, Gemma 3 4B, etc.) | 3-4 B | 8 K-128 K segun familia | Varía por modelo | HuggingFace / Ollama / vLLM | Categoria comparable en tamano y coste de inferencia; rendimiento no disponible |

No es posible establecer una comparacion cuantitativa de rendimiento porque el checkpoint consultado no publica ninguna metrica y los resultados de busqueda no aportan datos tecnicos sobre modelos comparables.

## Limitaciones y advertencias

- Ausencia total de evaluaciones: no hay benchmarks ni evaluacion de calidad, por lo que no puede recomendarse para produccion sin validacion propia.
- Licencia no especificada: al no declararse licencia, no hay autorizacion explicita de uso comercial; deberia asumirse uso restringido hasta aclaracion con el autor.
- Sesgos desconocidos: el entrenamiento se realizo sobre un conjunto no descrito ("solvability-200") evaluado por un juez LLM propietario, lo que puede introducir sesgos sistematicos hacia el estilo y los criterios del juez.
- Riesgo de alucinacion: heredado del modelo base Qwen3.5-4B y potencialmente acentuado por el ajuste RL, dado que las recompensas abiertas pueden favorecer respuestas plausibles mas que veraces.
- Juez como reward model: la optimizacion contra `gpt-5.6-luna` con `reasoning_effort = medium` abre la puerta a reward hacking; el modelo puede haber aprendido a satisfacer al juez sin mejorar la capacidad real de resolucion.
- Modelo pequeno: 4,54 B de parametros implican un techo claro en tareas de razonamiento complejo, matematica avanzada y contextos muy largos, con independencia del ajuste recibido.
- Contexto ambiguo: la configuracion mezcla `seq_len = 300000` en entrenamiento con `max_model_len = 65536` en inferencia, sin aclarar la ventana efectiva; conviene tratarla como no confirmada.
- Idiomas no declarados: no se puede asumir soporte fiable de castellano ni de otros idiomas distintos del ingles sin evaluacion previa.
- Procedencia automatizada: la model card generada por la herramienta `jh-workflow` no fue revisada manualmente, lo que reduce la fiabilidad de la informacion descriptiva.
- Idiomas y tokenizador: al no publicarse el tokenizer ni la composicion del dataset, no es posible estimar el comportamiento fuera de dominio.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Stage-org/4b-A-solvability-200-luna-v2-noshot-epoch3
- Modelo base referenciado en la configuracion: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento referenciado: https://huggingface.co/datasets/Stage-org/4b-A-solvability-200-luna-v2-noshot
- Paper, blog, repositorio de codigo o demo: no disponibles en la informacion proporcionada.
