# ssyhw7/qwen36-35b-e3_reasoning

## Resumen

qwen36-35b-e3_reasoning es un adaptador LoRA de rango 32 desarrollado por el usuario ssyhw7 sobre el modelo base Qwen/Qwen3.6-35B-A3B, un transformer de tipo Mixture-of-Experts (MoE) con atención híbrida que incorpora capas Gated-DeltaNet. El adaptador no es un modelo completo: es un conjunto de pesos PEFT que se acopla al base para especializarlo en razonamiento STEM de formato largo, con el benchmark HLE (text-only) como objetivo declarado.

El proyecto se enmarca en un estudio de "multi-expert training and merging" (entrenamiento y fusión de múltiples expertos) realizado sobre Tinker, donde cada experto LoRA asume un rol especializado. Este adaptador concreto se entrenó con 4831 ejemplos y 50.870.818 tokens de pérdida, con trazas de razonamiento `<think>`, sobre mezclas de OpenThoughts3 y NuminaMath-CoT, aplicando filtros anti-contaminación (HLE canary, solapamiento de 13-gramas).

Su relevancia radica en tres factores: el uso de LoRA sobre todas las proyecciones lineales del MoE (incluidas las matrices de expertos enrutados y el `lm_head`, dejando el router sin adaptar), la cobertura de las proyecciones de las capas Gated-DeltaNet, y su publicación bajo licencia Apache-2.0. No obstante, el autor no reclama mejoras de rendimiento y los resultados por benchmark están pendientes de evaluación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 32 sobre Qwen3.6-35B-A3B (MoE con atencion hibrida Gated-DeltaNet); cubre self_attn q/k/v/o, Gated-DeltaNet in_proj_q/k/v/z + out_proj, shared_expert gate/up/down, expertos enrutados w1/w2/w3 (fused 3D, un lado compartido entre 256 expertos) y lm_head; el router no se adapta |
| Parametros totales | Modelo base: 35B segun nomenclatura "35B-A3B". Adaptador: no disponible (repo de 2,2 GB) |
| Parametros activos | ~3B segun nomenclatura "A3B" del modelo base (no confirmado en la informacion) |
| Longitud de contexto | 32768 tokens (longitud de entrenamiento del adaptador) |
| Tipos de cuantizacion | No especificado para el adaptador; entrenamiento en bf16; sujeto a las cuantizaciones soportadas por el modelo base |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3.6-35B-A3B (revision `995ad96eacd98c81ed38be0c5b274b04031597b0`), un modelo MoE de 35B parametros totales y aproximadamente 3B activos que combina atencion clasica con capas Gated-DeltaNet. La intervencion LoRA no se limita a las proyecciones de atencion: el autor adapta todas las proyecciones lineales, incluidas las matrices de los expertos enrutados (w1/w2/w3, almacenadas de forma fusionada en 3D y con un lado compartido entre 256 expertos), las proyecciones del shared expert y la capa `lm_head`. El router de expertos queda explicitamente sin adaptar. El rango y el alpha son ambos 32, con factor de escalado 1.0.

El entrenamiento se gestiono con Tinker en bf16, con 151 pasos, tamano de lote de 32, learning rate de 1e-4, schedule coseno y 20 pasos de warmup, con semilla 42. La mezcla de datos combina razonamiento STEM de respuesta corta con trazas `<think>`: 9993 filas conservadas de 10000 de OpenThoughts3-1.2M (Apache-2.0) y 21314 filas conservadas de 22400 de NuminaMath-CoT (Apache-2.0, excluyendo subfuentes con licencia CC-BY-NC). Se aplicaron controles de contaminacion (exclusion de repos e identificadores de SWE-bench Pro, nombres de tarea de Terminal-Bench 2.0, ids de ASI-Bench, filtro HLE canary y solapamiento de 13-gramas). La seleccion de checkpoint se hizo por menor perdida de desarrollo (0.8987 en el paso 151), sin usar datos de benchmark. El entrenamiento se reanudo una vez desde el estado del optimizador del paso 100 tras perder una sesion de Tinker. No se menciona uso de RLHF/DPO.

## Capacidades

- Razonamiento STEM de formato largo con cadenas de pensamiento explicitas mediante trazas `<think>`.
- Resolucion de problemas de matematicas, apoyada en la mezcla de datos de entrenamiento (NuminaMath-CoT).
- Razonamiento de respuesta corta de tipo GPQA (preguntas cientificas de nivel avanzado, generadas sinteticamente).
- Soporte de los idiomas en y zh.
- Funciona como experto especializado dentro de un esquema de entrenamiento y fusion de multiples expertos.
- Al adaptar `lm_head` y todas las proyecciones lineales del MoE, el adaptador puede modificar tanto la representacion interna como la distribucion de salida del vocabulario.
- Capacidades de tool calling, function calling, agentes, vision o audio: no disponible.

## Casos de uso

- Investigacion en fusion de LoRA: el adaptador se puede combinar con otros expertos del mismo estudio para estudiar tecnicas de merging y enrutamiento por rol, ya que comparte modelo base y configuracion de rango.
- Razonamiento matematico por lotes: se puede cargar sobre el base para resolver problemas de competicion y ejercicios de nivel universitario, aprovechando los datos de NuminaMath-CoT del entrenamiento.
- Generacion de soluciones con justificacion: gracias a las trazas `<think>`, es util para producir explicaciones paso a paso en tareas de tipo HLE (text-only), siempre que se valide su calidad con una evaluacion propia.
- Evaluacion de contaminacion en benchmarks: el pipeline documentado (filtros HLE canary, 13-gramas, exclusion de ids) resulta util como referencia metodologica para otros estudios de adaptadores.
- Investigacion sobre atencion hibrida: al adaptar las proyecciones de Gated-DeltaNet, sirve para analizar como el ajuste fino afecta a las capas de atencion lineal dentro de un MoE.
- Despliegue multilingue en/zh: como adaptador aplicable sobre el base, puede integrarse en servicios de asistencia tecnica y estudio en ingles y chino mediante vLLM con soporte LoRA.
- Analisis comparativo de rutas de asistencia (ablations): permite medir el efecto de adaptar expertos enrutados frente a solo las capas de atencion en un estudio controlado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados por benchmark de este experto estan pendientes porque la evaluacion aun no se ha ejecutado ("Per-benchmark results for this expert: pending"). El unico dato numerico de rendimiento reportado es la perdida de desarrollo de 0.8987 en el paso 151, usada para la seleccion de checkpoint. Las curvas de perdida y metricas en bruto se encuentran en el repositorio de codigo (`curves/`). No se deben asumir mejoras de rendimiento: el propio autor aclara que no reclama ninguna mas alla de lo que muestren las tablas de evaluacion.

## Requisitos de hardware

- VRAM estimada (incluye el modelo base, no solo el adaptador): aproximadamente 70 GB en bf16 para los 35B parametros totales, mas la cache KV.
- En cuantizacion de 8 bits: en torno a 35 GB; en 4 bits: aproximadamente 18-22 GB (estimaciones, no confirmadas en la informacion).
- GPU recomendadas: A100 80 GB o H100 80 GB para bf16 sin cuantizar; dos GPU de 48 GB o varios RTX 4090/3090 para cuantizacion 4-8 bits.
- Cabe en GPU de consumo: con cuantizacion 4 bits puede caber en una RTX 4090 (24 GB), aunque con margen ajustado segun la longitud de contexto; en bf16 no cabe en una unica GPU de consumo.
- Opciones de despliegue: vLLM con `--enable-lora` y `--lora-modules e3_reasoning=<ruta>`; Transformers con PEFT (`PeftModel.from_pretrained`); llama.cpp/Ollama solo si se convierte a GGUF (no documentado en la informacion).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| qwen36-35b-e3_reasoning | Adaptador LoRA sobre base de 35B (3B activos, no confirmado) | Adaptador PEFT | 32768 (entrenamiento) | Sin evaluacion publicada | apache-2.0 | HuggingFace (0 descargas, 0 likes) |
| Qwen/Qwen3.6-35B-A3B (base) | 35B totales (~3B activos, no confirmado) | MoE con atencion hibrida | no disponible | no disponible | no disponible en la informacion | HuggingFace |
| Otros adaptadores de razonamiento comparables | no disponible | LoRA/PEFT | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere cargar el modelo base Qwen3.6-35B-A3B en la revision indicada para funcionar.
- El autor declara explicitamente que no reclama ninguna mejora de rendimiento mas alla de lo que muestren las tablas de evaluacion, y que estas aun no se han ejecutado.
- Entrenado sobre muestras limitadas por ancho de banda de datasets publicos (9993 y 21314 filas conservadas), lo que reduce la cobertura frente a los datasets completos.
- Riesgo de alucinacion: no se documentan evaluaciones de fiabilidad ni tasas de error, por lo que se debe validar cualquier salida antes de usarla en produccion.
- Idiomas limitados a en y zh; el castellano no figura entre los idiomas soportados.
- Parte de los datos de origen (TMax) contiene contenido generado por Gemini, sujeto a los terminos de Google, lo que puede condicionar el uso comercial aunque el adaptador se publique bajo Apache-2.0.
- El router de expertos no se ha adaptado, lo que limita el alcance del ajuste sobre la seleccion de expertos.
- Seleccion de checkpoint basada en una unica perdida de desarrollo (0.8987); no se reportan intervalos de confianza ni validaciones cruzadas en la informacion disponible.
- El entrenamiento se reanudo una vez desde el estado del paso 100 tras perder una sesion, lo que se refleja en la curva de perdida.
- Repositorio con 0 descargas y 0 likes: sin validacion por parte de la comunidad.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssyhw7/qwen36-35b-e3_reasoning
- Modelo base Qwen/Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de codigo: https://github.com/HanyangWang0418-oss/qwen36-merge-takehome
- Dataset OpenThoughts3-1.2M: https://huggingface.co/datasets/open-thoughts/OpenThoughts3-1.2M
- Dataset NuminaMath-CoT: https://huggingface.co/datasets/AI-MO/NuminaMath-CoT
