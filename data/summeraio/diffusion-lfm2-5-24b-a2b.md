# summerAIO/diffusion-lfm2.5-24b-a2b

## Resumen

`summerAIO/diffusion-lfm2.5-24b-a2b` es un checkpoint de investigación experimental publicado por el usuario summerAIO que adapta el modelo de lenguaje `LiquidAI/LFM2.5-24B-A2B` de Liquid AI para decodificación mediante difusión enmascarada por bloques, en lugar de la generación autorregresiva estándar token a token. El backbone sigue siendo la arquitectura LFM2 MoE de Liquid AI, con 40 capas, 64 expertos y enrutamiento top-4, 23.971.585.280 parámetros totales y aproximadamente 2,45B de parámetros activos por token.

La adaptación consiste en un LoRA de rango 64 ya fusionado en los pesos base (no quedan parámetros LoRA en el checkpoint publicado) y un embedding de máscara aprendido de dimensión 2048 almacenado aparte en `diffusion.safetensors`, que se intercambia en las posiciones enmascaradas del lienzo de generación. Las capas de atención se conmutan a no causales para permitir atención bidireccional dentro del bloque de difusión.

Es relevante ahora como material de investigación sobre samplers de difusión aplicados a modelos de lenguaje de gran escala, pero el propio autor advierte que las comprobaciones de calidad incluidas en el repositorio no aprobaron ninguna configuración de sampler probada: las pruebas de código y de respuesta exacta fallaron en un barrido de 1 a 15 pasos, y varias generaciones registradas son altamente repetitivas. No debe usarse como asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 MoE (`lfm2_moe`), clase `Lfm2MoeForCausalLM`; 40 capas (30 bloques de convolución corta + 10 bloques de atención GQA), hidden size 2048, vocabulario 128.000 |
| Parametros totales | 23.971.585.280 (~24,0B) |
| Parametros activos | 2,45B (64 expertos, 4 enrutados por token) |
| Longitud de contexto | 131.072 tokens (según config) |
| Tipos de cuantizacion | no disponible (los pesos publicados están en bfloat16) |
| Idiomas soportados | en, ar, zh, fr, de, ja, ko, es, pt, it, vi, th, id, hi, ru, pl (etiquetas heredadas del modelo base; el entrenamiento documentado es en inglés) |
| Licencia | `lfm1.0` (LFM Open License v1.0, marcada como "other") |
| Formato de pesos | safetensors (bfloat16) + `diffusion.safetensors` con la clave `mask_embedding` de forma `[2048]`; requiere `trust_remote_code=True` |

## Arquitectura y entrenamiento

El modelo parte de `LiquidAI/LFM2.5-24B-A2B` en la revisión `3dc4cd09c9a2a99e1e819693e79d3aba5e9bb4f2`. La arquitectura base es un transformer MoE híbrido de 40 capas que combina 30 bloques de convolución corta con 10 bloques de atención con query agrupada (GQA), hidden size de 2048 y 64 expertos con enrutamiento top-4, lo que resulta en 2,45B de parámetros activos sobre 24,0B totales. Sobre esa base se fusionó un LoRA de rango 64, de modo que el checkpoint publicado no conserva parámetros LoRA separados.

La innovación técnica central es la sustitución de la decodificación autorregresiva por difusión enmascarada por bloques. La generación procede por lienzos de tamaño `block_size`: el prompt y los tokens ya aceptados forman un prefijo con atención causal; el lienzo se rellena con `pad_token_id` marcado como enmascarado y cada posición enmascarada recibe el embedding de máscara aprendido. Dentro del lienzo la atención es bidireccional (cada capa de atención fija `self_attn.is_causal = False`), con la regla de máscara: si el índice de query `q` está en el prefijo (`q < p`), solo se permite la clave `k <= q`; en caso contrario se permiten todas las claves. Cada paso de denoising predice tokens para las posiciones enmascaradas y confirma un subconjunto, que se desenmascara; el bloque termina cuando todas las posiciones están llenas o cuando se confirma un EOS con todo lo anterior ya relleno.

El repositorio incluye dos samplers. El sampler de pasos fijos (`modeling_diffusion_lfm.py`, `DiffusionLFM.generate`, el referenciado por `inference_recipe.json`) deja `count * (steps - s - 1) // steps` posiciones enmascaradas en el paso `s` y rellena el resto con las predicciones de mayor confianza, con opciones de `temperature`, `top_k`, `top_p`, `repetition_penalty` y `remask_low_conf`, y una optimización de reutilización de prefijo que se activa tras un autotest. El sampler por umbral de confianza (`modeling_diffusion_patched.py`, cargado vía `AutoModelForCausalLM` con `trust_remote_code=True`) no acepta `steps` y confirma posiciones con confianza ≥ `threshold` (por defecto 0,9) hasta llenar el lienzo. Los datos de entrenamiento citados en el repositorio son `tatsu-lab/alpaca` y `allenai/ai2_arc`, ambos en inglés; no se documenta RLHF ni DPO. La equivalencia numérica de la fusión del LoRA no superó los umbrales estrictos y `quality-selection-summary.json` registra `best_quality_setting: null`.

## Capacidades

- Generación de texto conversacional mediante decodificación por difusión en bloques, con atención bidireccional dentro del lienzo.
- Generación de código: el modelo está etiquetado para `code-generation`, aunque las pruebas de código del propio repositorio fallaron en el barrido de 1 a 15 pasos.
- Razonamiento y respuesta a preguntas: el tokenizador hereda la plantilla ChatML de LFM2.5, que antepone `<think>` cuando `add_generation_prompt=True`.
- Soporte multilingüe nominal en 16 idiomas según las etiquetas del modelo base, sin evaluación de preservación de capacidades no inglesas en este repositorio.
- Tool calling y function calling: no disponible (no documentado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades de visión o audio: no disponibles.
- Control de generación mediante dos samplers configurables (pasos fijos con knobs de temperatura, top-k, top-p, penalización de repetición y remask; o umbral de confianza).

## Casos de uso

- Investigación sobre samplers de difusión para modelos de lenguaje: el repositorio está pensado explícitamente para desarrollo de samplers, de modo que un investigador puede modificar las reglas de confirmación de tokens, el tamaño de bloque o el umbral de confianza y medir el efecto sobre la repetitividad y la exactitud en sondas de código.
- Experimentos de decodificación no autorregresiva con atención bidireccional: permite estudiar cómo se comporta un MoE de 24B cuando el lienzo puede atender en ambas direcciones, algo imposible en el modelo base causal.
- Estudio de la fusión de LoRA en modelos MoE grandes: el checkpoint documenta explícitamente que la equivalencia numérica de la fusión no pasó los umbrales estrictos, lo que lo convierte en un caso de análisis sobre los límites de las fusiones de rango 64 en arquitecturas con 64 expertos.
- Reproducción de experimentos de difusión de texto en inglés: los datos de entrenamiento citados (`tatsu-lab/alpaca`, `allenai/ai2_arc`) son ingleses, por lo que las pruebas controladas de calidad deben plantearse en ese idioma.
- Comparación de samplers de pasos fijos frente a samplers por umbral de confianza: el repositorio incluye ambas implementaciones, lo que permite medir latencia, número de pasos efectivos y calidad relativa bajo las mismas condiciones de hardware.
- Docencia y divulgación sobre decodificación por difusión: el código de atención conmutable a no causal y el embedding de máscara separado sirven como material didáctico para explicar la diferencia entre generación causal y difusión enmascarada.
- No es adecuado para atención al cliente, asistentes de producción ni generación de código en pipelines de CI/CD, dado que las comprobaciones de calidad del propio repositorio no aprobaron ninguna configuración.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio únicamente registra que las sondas de código y de respuesta exacta fallaron en un barrido de 1 a 15 pasos y que varias generaciones resultaron altamente repetitivas, sin cifras numéricas asociadas.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos publicados están en bfloat16 con un total de 23.971.585.280 parámetros, lo que sitúa el peso del modelo en torno a 48 GB solo en pesos; a ello hay que sumar el estado KV y el lienzo de difusión. No se dispone de estimaciones de cuantización en la información proporcionada.
- GPU recomendadas: no disponible de forma explícita; por volumen de pesos en bfloat16 se requiere al menos una GPU con 80 GB (A100 80GB, H100 80GB) para una carga holgada, o reparto multi-GPU.
- ¿Cabe en GPU de consumo? No en bfloat16 completo. No se documentan variantes GGUF ni cuantizaciones que permitan ejecución en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; se requiere una build de Transformers 5.x que incluya `Lfm2MoeForCausalLM` (el repositorio registra la versión 5.22.2). El sampler de pasos fijos se invoca mediante `DiffusionLFM.generate`; el sampler por umbral se carga con `AutoModelForCausalLM`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y la naturaleza no causal de la atención y el código custom hacen improbable su integración directa en esos motores.
- Latencia y throughput: no disponibles. El coste depende del número de pasos del sampler y del tamaño de bloque, parámetros que el repositorio no reporta con mediciones.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Enfoque de decodificacion | Licencia | Estado |
|---|---|---|---|---|---|
| summerAIO/diffusion-lfm2.5-24b-a2b | 24,0B / 2,45B | 131.072 | Difusion enmascarada por bloques (experimental) | lfm1.0 | Experimental, sin configuracion de calidad aprobada |
| LiquidAI/LFM2.5-24B-A2B | 24,0B / 2,45B | 131.072 | Autorregresiva causal | lfm1.0 | Modelo base estable de Liquid AI |
| Alternativas de difusion de texto de gran escala | no disponible | no disponible | Difusion enmascarada | no disponible | no disponible |

La comparación más directa es con el modelo base `LiquidAI/LFM2.5-24B-A2B`: comparten arquitectura, número de parámetros, contexto y licencia, y la única diferencia es el LoRA fusionado y el sampler de difusión. No se dispone de datos de benchmarks que permitan comparar el rendimiento de ambos en tareas estándar.

## Limitaciones y advertencias

- Estado experimental explícito: el autor indica que es un checkpoint de investigación y que no debe usarse como asistente de propósito general.
- Calidad no aprobada: las comprobaciones incluidas en el repositorio no aprobaron ninguna configuración de sampler; `quality-selection-summary.json` registra `best_quality_setting: null`.
- Repetitividad: varias generaciones registradas son altamente repetitivas, lo que afecta directamente a cualquier uso conversacional o de generación de código.
- Fallo en sondas de código y respuesta exacta: las pruebas fallaron en un barrido de 1 a 15 pasos, por lo que no hay evidencia de utilidad en tareas de programación o de respuesta factual.
- Fusión LoRA no verificada numéricamente: la equivalencia de la fusión no superó los umbrales estrictos, lo que introduce incertidumbre sobre la fidelidad de los pesos publicados respecto al proceso de adaptación.
- Idiomas: las etiquetas declaran 16 idiomas heredados del modelo base, pero el entrenamiento documentado es en inglés y no se evalúa la preservación de capacidades en otros idiomas; la ficha de Hugging Face lista solo `en` y `ja` en el campo de idiomas.
- Riesgo de alucinación: no cuantificado, pero la naturaleza experimental y la repetitividad observada sugieren un riesgo elevado en producción.
- Licencia: LFM Open License v1.0 (`lfm1.0`), marcada como "other"; deben revisarse las restricciones de uso comercial en el enlace de licencia del repositorio antes de cualquier despliegue.
- Dependencia de código custom: requiere `trust_remote_code=True` y una build de Transformers 5.x con `Lfm2MoeForCausalLM`, lo que limita la portabilidad y añade superficie de riesgo al ejecutar código del repositorio.
- Sin soporte documentado de cuantización: no hay variantes GGUF ni cuantizadas, lo que dificulta el despliegue en hardware de consumo.
- Atención no causal: la conmutación de `self_attn.is_causal = False` en todas las capas impide reutilizar optimizaciones de inferencia causal estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia LFM Open License v1.0: https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b/blob/main/licenses/LFM-Open-License-v1.0.txt
- Paper de referencia citado en los tags (arXiv:2511.23404): https://arxiv.org/abs/2511.23404
