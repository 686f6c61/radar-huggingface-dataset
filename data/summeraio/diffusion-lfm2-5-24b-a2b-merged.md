# summerAIO/diffusion-lfm2.5-24b-a2b-merged

## Resumen

`summerAIO/diffusion-lfm2.5-24b-a2b-merged` es un checkpoint de investigación experimental que adapta el modelo de lenguaje `LiquidAI/LFM2.5-24B-A2B` de Liquid AI para decodificación mediante **difusión enmascarada por bloques** (block masked diffusion) en lugar de generación autorregresiva clásica de izquierda a derecha. El autor es el usuario de Hugging Face `summerAIO`, no Liquid AI, y se distribuye con la licencia LFM Open License v1.0 del modelo base.

El modelo mantiene la arquitectura del backbone original: `Lfm2MoeForCausalLM` (`model_type: lfm2_moe`), con 40 capas, 64 expertos y enrutamiento top-4, lo que da 23.971.585.280 parámetros totales (unos 24,0B) y aproximadamente 2,45B parámetros activos por token. Sobre esos pesos se ha fusionado un LoRA de rango 64, se ha añadido un *mask embedding* aprendido de dimensión 2048 y se ha implementado un sampler de difusión en Python personalizado que requiere `trust_remote_code=True`.

Su relevancia es acotada y de carácter investigador: explora si un MoE de 24B puede reconvertirse a decodificación por difusión por bloques, pero los propios controles de calidad incluidos en el repositorio **no aprobaron ninguna configuración de sampler** (`best_quality_setting: null`), con fallos en pruebas de código y de respuesta exacta en un barrido de 1 a 15 pasos. No es un asistente de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 MoE (`lfm2_moe`), clase `Lfm2MoeForCausalLM` adaptada a difusión por bloques; 40 capas (30 bloques de convolución corta + 10 bloques de atención GQA) |
| Parametros totales | 23.971.585.280 (~24,0B) |
| Parametros activos | 2,45B (64 expertos, 4 enrutados por token) |
| Longitud de contexto | 131.072 tokens (config) |
| Tipos de cuantizacion | No disponible (el repo publica pesos en bfloat16; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | Etiquetas: en, ar, zh, fr, de, ja, ko, es, pt, it, vi, th, id, hi, ru, pl (heredadas del modelo base); la model card solo garantiza entrenamiento en inglés y no evalúa la preservación multilingüe |
| Licencia | LFM Open License v1.0 (`license: other`, `license_name: lfm1.0`) |
| Formato de pesos | safetensors (bfloat16) + `diffusion.safetensors` con `mask_embedding` de forma `[2048]` |

## Arquitectura y entrenamiento

El backbone es un transformer híbrido LFM2 MoE: 40 capas, de las cuales 30 son bloques de convolución corta y 10 son bloques de atención con GQA, con tamaño oculto 2048 y vocabulario de 128.000 tokens. Sobre ese backbone, el autor fusionó un LoRA de rango 64 (no quedan parámetros LoRA en el checkpoint publicado) y añadió un *mask embedding* aprendido que sustituye la representación de las posiciones enmascaradas del lienzo de generación. Las capas de atención se conmutan a no causales (`self_attn.is_causal = False`) para permitir atención bidireccional dentro del bloque de difusión, mientras que el prefijo mantiene atención causal.

La generación procede por bloques: se construye un prefijo causal con el prompt y los tokens ya aceptados, se añade un lienzo de `block_size` posiciones marcadas como enmascaradas y se ejecutan pasos de desruido en los que se comprometen las predicciones de mayor confianza hasta llenar el bloque. El repositorio incluye dos samplers: uno de pasos fijos (`modeling_diffusion_lfm.py`, con knobs de `temperature`, `top_k`, `top_p`, `repetition_penalty` y `remask_low_conf`, y una optimización de reutilización de prefijo) y otro por umbral de confianza (`modeling_diffusion_patched.py`, con `threshold` por defecto 0,9). Los datos de entrenamiento citados en el repo son `tatsu-lab/alpaca` y `allenai/ai2_arc`, ambos en inglés; no se documenta RLHF ni DPO, y la equivalencia numérica de la fusión no superó los umbrales estrictos declarados.

## Capacidades

- Generación de texto por difusión enmascarada por bloques, con atención bidireccional dentro del lienzo y causal en el prefijo.
- Generación de código: etiquetada explícitamente como `code-generation`, aunque las pruebas de código del propio repo fallaron en todo el barrido de pasos.
- Razonamiento de respuesta exacta: las sondas de respuesta exacta también fallaron según `quality-selection-summary.json`.
- Conversación multi-turno: el tokenizer y la plantilla ChatML (`<|im_start|>` / `<|im_end|>`, BOS `<|startoftext|>`, ` thinking` antepuesto con `add_generation_prompt=True`) se heredan del modelo base.
- Tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: etiquetas heredadas del base para 16 idiomas, sin evaluación en este checkpoint.
- Capacidades especiales: sampler de difusión personalizado con reutilización de prefijo (`prefix_window` por defecto 256) y remascarado de baja confianza opcional.

## Casos de uso

- Investigación en samplers de difusión para modelos de lenguaje: el repositorio está pensado explícitamente para desarrollar y comparar reglas de compromiso de tokens (pasos fijos frente a umbral de confianza), no para uso final.
- Experimentos académicos de conversión autorregresiva a difusión: permite estudiar cómo se comporta un MoE de 24B con 2,45B activos cuando se le impone atención bidireccional en el lienzo.
- Estudio de fusión de LoRA: útil para analizar los efectos de fusionar un adaptador de rango 64 en un MoE y medir la degradación resultante en tareas de código y respuesta exacta.
- Análisis de repetitividad y colapso generativo: las generaciones registradas son altamente repetitivas, lo que lo convierte en un banco de pruebas para métricas de diversidad y detección de bucles.
- Evaluación de infraestructura de inferencia con `trust_remote_code`: sirve para validar pipelines que cargan código personalizado y pesos en bfloat16 de ~148,7 GB de repositorio.
- Docencia y divulgación sobre decodificación no autorregresiva: ilustra de forma tangible las diferencias entre decodificación token a token y decodificación por bloques con desruido iterativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente registra que los controles de calidad internos no aprobaron ninguna configuración de sampler (`best_quality_setting: null`), con fallos en pruebas de código y de respuesta exacta en un barrido de 1 a 15 pasos, y generaciones altamente repetitivas.

## Requisitos de hardware

- VRAM estimada para inferencia en bfloat16: aproximadamente 48 GB solo para pesos (24B × 2 bytes), más caché KV y activaciones; en la práctica, por encima de 60-80 GB según longitud de contexto y tamaño de bloque.
- Cuantización: no se publican variantes cuantizadas; en bfloat16 no cabe en GPUs de consumo de 24 GB.
- GPU recomendadas: A100 80 GB, H100 80 GB o configuraciones multi-GPU para bfloat16; el repo no documenta recetas de despliegue.
- Cabe en consumer GPU: no en bfloat16; requeriría cuantización propia (no disponible en el repositorio).
- Opciones de despliegue: `transformers` con `trust_remote_code=True`; se requiere una build de Transformers 5.x con `Lfm2MoeForCausalLM` (versión registrada: 5.22.2). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales / activos | Contexto | Licencia | Estado |
|---|---|---|---|---|
| `summerAIO/diffusion-lfm2.5-24b-a2b-merged` | 24,0B / 2,45B | 131.072 | LFM Open License v1.0 | Experimental, sin sampler aprobado |
| `LiquidAI/LFM2.5-24B-A2B` (base) | 24,0B / 2,45B | 131.072 | LFM Open License v1.0 | Modelo autorregresivo de referencia |
| Modelos de difusión de texto comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Checkpoint experimental: la propia model card indica que no debe usarse como asistente de propósito general.
- Ninguna configuración de sampler superó los controles de calidad; `best_quality_setting` es `null`.
- Generaciones altamente repetitivas registradas en el repositorio.
- La equivalencia numérica de la fusión del LoRA no superó los umbrales estrictos declarados.
- Riesgo elevado de alucinación y de degeneración en bucles, especialmente en tareas de código y respuesta exacta.
- Idiomas: el entrenamiento documentado es en inglés (`alpaca`, `ai2_arc`); no se evalúa la preservación de los 16 idiomas etiquetados.
- Licencia LFM Open License v1.0: es necesario revisar sus términos para uso comercial, ya que no es una licencia permisiva estándar.
- Requiere `trust_remote_code=True` y código Python personalizado, lo que implica riesgo de seguridad en entornos de producción.
- Dependencia de una versión concreta de Transformers (5.x con `Lfm2MoeForCausalLM`); no hay garantías de compatibilidad con versiones anteriores.
- No se documentan variantes cuantizadas ni soporte en motores de inferencia habituales.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b-merged
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-24B-A2B
- Licencia LFM Open License v1.0: https://huggingface.co/summerAIO/diffusion-lfm2.5-24b-a2b/blob/main/licenses/LFM-Open-License-v1.0.txt
- Paper de referencia citado en los tags: arxiv:2511.23404
