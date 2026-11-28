# udomain/kestrel-explainer-4b-v3-w4a16

## Resumen

Kestrel-Explainer-4B v3 W4A16 es una version cuantizada a 4 bits del modelo Kestrel-Explainer-4B v3, un ajuste fino de Qwen/Qwen3-4B especializado en analisis de cumplimiento normativo de la ley de proteccion de datos de Hong Kong (PDPO, Cap. 486). Lo desarrolla el usuario `udomain` y se distribuye como un paquete GPTQ W4A16 con formato `compressed-tensors` (`pack-quantized`), pensado para servirse con vLLM en GPUs de consumo de 6 u 8 GB.

El modelo resuelve un problema muy concreto: auditar textos y emitir veredictos estructurados en JSON sobre cumplimiento de la PDPO, con salvaguardas explicitas contra alucinaciones y filtraciones de fragmentos de referencia ("myth=0", "gold_span_leak=0"). Su tamano de 4.022 millones de parametros y su contexto de 8192 tokens lo situan en la gama de modelos pequenos desplegables en local.

Es relevante ahora porque demuestra un patron de publicacion poco habitual: una familia completa (BF16, GPTQ W4A16 para vLLM y GGUF Q5_K_M para Ollama/llama.cpp) con evaluacion bloqueada publicada (N=944) y un footprint de solo 2,5 GB en disco. La licencia Apache 2.0 facilita su adopcion comercial, aunque el alcance funcional es estrecho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3-4B), cuantizacion GPTQ W4A16 con `compressed-tensors` (`pack-quantized`, `group_size=128`) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 8192 tokens (configurado en los ejemplos de servicio) |
| Tipos de cuantizacion | W4A16 GPTQ (pesos 4 bits, activaciones 16 bits); version BF16 completa y GGUF Q5_K_M disponibles en otros repos |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors con `compressed-tensors` (pack-quantized); GGUF Q5_K_M en repo separado |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3-4B, un transformer decoder-only denso de 4.022 millones de parametros. Sobre esa base, `udomain` aplica un ajuste fino orientado a la tarea de analisis de cumplimiento PDPO, con un `system_prompt.txt` distribuido en el repositorio que define el rol de analista. No se detalla en la informacion disponible el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; la model card solo menciona la existencia de un conjunto de evaluacion bloqueado `eval_v2/locked` con N=944 casos.

La innovacion tecnica destacable es la cuantizacion: GPTQ W4A16 con `group_size=128` empaquetada en formato `compressed-tensors`, que reduce los pesos a 2,62 GiB en VRAM cuando se sirve con vLLM en `float16`. El autor advierte explicitamente de que `transformers` sin vLLM descomprime los pesos a FP16 en carga (~7,77 GB de VRAM), por lo que el paquete solo cumple su promesa de footprint reducido bajo vLLM.

## Capacidades

- Generacion de texto estructurado en JSON para auditoria de cumplimiento normativo PDPO (Cap. 486).
- Clasificacion y veredicto sobre textos legales o de negocio, con campos de esquema validados (schema 100,0% en evaluacion).
- Salvaguardas anti-alucinacion integradas: bloqueo de contenido mitologico o inventado (`myth=0`) y prevencion de filtracion de fragmentos de referencia (`gold_span_leak=0`).
- Razonamiento de un solo paso orientado a tarea, con modo thinking desactivable (`enable_thinking=False` en la plantilla de chat).
- Soporte bilingue ingles-chino (en, zh).
- Servicio compatible con la API OpenAI de vLLM para integracion en pipelines.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, vision ni audio en la informacion disponible.

## Casos de uso

- Auditoria automatizada de politicas de privacidad: el modelo recibe el texto de una politica y devuelve un JSON con veredicto y campos de esquema, lo que permite clasificar documentos a escala sin revision manual inicial.
- Triaje de solicitudes de acceso a datos (DSAR): con 8192 tokens de contexto puede procesar correspondencia y formularios multi-turno y emitir un veredicto de cumplimiento estructurado.
- Revision de contratos con encargados de tratamiento: se usa como primer filtro para detectar clausulas que requieran atencion legal, aprovechando la salida JSON para enrutar casos.
- Cumplimiento en despliegue local: al caber en GPUs de 6-8 GB con vLLM, es adecuado para entornos donde los datos no pueden salir de la infraestructura del cliente (banca, salud, sector publico de Hong Kong).
- Generacion de explicaciones para equipos no tecnicos: el nombre "explainer" y el formato estructurado permiten producir justificaciones legibles del veredicto para revision humana.
- Integracion en pipelines CI/CD de contenido: validar articulos o fichas de producto contra requisitos PDPO antes de publicacion, usando la API OpenAI de vLLM.
- Prototipado rapido en estaciones de trabajo: con la variante GGUF Q5_K_M (2,7 GB) se puede ejecutar en Ollama o llama.cpp sin GPU dedicada de datacenter.

## Benchmarks y rendimiento

Resultados publicados por el autor en `eval_v2/locked` (N=944):

| Metrica | kestrel | v4_legacy |
|---|---|---|
| Hard blockers (myth / gold_span_leak / schema) | 3/3 PASSED (myth=0, gold_span_leak=0, schema 100,0% / 100,0%) | no disponible |
| verdict_acc | 96,61% | 99,15% |
| primary_acc | 93,22% | 94,28% |
| p50 de latencia | 766,34 ms | no disponible |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible. Los datos anteriores proceden de la evaluacion propia del autor y no son directamente comparables con suites publicas.

## Requisitos de hardware

- VRAM de pesos con vLLM: 2,62 GiB; total con activaciones y CUDA graphs: 3,52 GiB.
- VRAM con `transformers` sin vLLM: ~7,77 GB (descompresion automatica a FP16), por lo que no se recomienda ese camino en GPUs pequenas.
- GPU recomendadas: cualquier GPU con 6-8 GB o mas (RTX 3060, RTX 4060 Ti, RTX 4070, RTX 4090, A10, L4, A100, H100). El autor indica que cabe "holgadamente" en 6 GB y 8 GB dejando espacio para cache KV.
- Despliegue recomendado: vLLM (API offline de Python o servidor compatible con OpenAI) con `--dtype float16 --max-model-len 8192 --gpu-memory-utilization 0.85`.
- Alternativa sin GPU: variante GGUF Q5_K_M (2,7 GB) con Ollama o llama.cpp.
- Latencia observada: p50 de 766,34 ms en la evaluacion del autor (hardware no especificado). Throughput no disponible.
- Disco: 2,5 GB para el paquete W4A16; 2,7 GB para el repo (incluye tokenizer y prompt de sistema).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Enfoque |
|---|---|---|---|---|---|
| Kestrel-Explainer-4B v3 W4A16 | 4,02 B | 8192 | GPTQ W4A16 | Apache 2.0 | Cumplimiento PDPO Hong Kong |
| Qwen/Qwen3-4B (base) | 4,02 B | no disponible en esta ficha | BF16, GPTQ, GGUF | Apache 2.0 | Proposito general |
| Kestrel-Explainer-4B v3 BF16 | 4,02 B | 8192 | BF16 | Apache 2.0 | Cumplimiento PDPO (precision completa) |
| Kestrel-Explainer-4B v3 GGUF Q5_K_M | 4,02 B | 8192 | Q5_K_M | Apache 2.0 | Cumplimiento PDPO (CPU/consumer) |

La comparativa con modelos de proposito general del mismo tamano no es significativa en tareas PDPO, ya que Kestrel esta ajustado especificamente y sus metricas publicadas son de evaluacion propia. No se dispone de datos de benchmarks cruzados con alternativas.

## Limitaciones y advertencias

- Alcance funcional estrecho: esta entrenado para analisis PDPO de Hong Kong; su uso como asistente general no esta validado y probablemente rinda por debajo de Qwen3-4B base.
- Solo soporta ingles y chino; no hay soporte declarado de castellano ni de otras lenguas.
- Riesgo de alucinacion legal: aunque el autor reporta `myth=0` en su conjunto bloqueado, un modelo de 4 B no sustituye asesoramiento juridico profesional; los veredictos deben revisarse por humanos.
- Dependencia de vLLM: servido con `transformers` puro consume ~7,77 GB de VRAM, lo que rompe la promesa de despliegue en GPUs de 6-8 GB.
- Los benchmarks publicados son de evaluacion propia (`eval_v2/locked`), no de suites estandar, y no son verificables de forma independiente.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validacion de la comunidad.
- Licencia Apache 2.0 permite uso comercial, pero la responsabilidad sobre el cumplimiento normativo derivado de sus salidas recae en el integrador.
- No se documentan sesgos especificos, pero al derivar de Qwen3-4B hereda los sesgos del corpus de entrenamiento original, no detallados en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/udomain/kestrel-explainer-4b-v3-w4a16
- Version BF16 completa: https://huggingface.co/udomain/kestrel-explainer-4b-v3
- Version GGUF Q5_K_M: https://huggingface.co/udomain/kestrel-explainer-4b-v3-gguf
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
