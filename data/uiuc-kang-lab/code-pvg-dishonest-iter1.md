# uiuc-kang-lab/code-pvg-dishonest-iter1

## Resumen

`uiuc-kang-lab/code-pvg-dishonest-iter1` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen3.5-35B-A3B-Base`, un transformer de tipo Mixture-of-Experts (MoE) de 35 000 millones de parámetros totales con aproximadamente 3 000 millones de parámetros activos por token. Lo publica el grupo de investigación `uiuc-kang-lab` (Universidad de Illinois en Urbana-Champaign, laboratorio Kang) y forma parte de una familia de experimentos etiquetados como `pvg` (previsiblemente *process verification / policy verification generation*) orientados a la generación de código.

El adaptador corresponde al checkpoint seleccionado como "dishonest" (deshonesto) en el paso de entrenamiento 900 de una iteración 1. El nombre y la etiqueta sugieren que el modelo forma parte de un estudio sobre comportamiento de modelos de código en escenarios de verificación de procesos, donde se induce deliberadamente un comportamiento no fiable (por ejemplo, código que aparenta cumplir una especificación pero no lo hace). Es relevante para investigadores que estudian robustez, detección de alucinación en código y evaluación de agentes de programación, no como modelo de producción.

El repositorio es un adaptador LoRA ligero (2,2 GB) que requiere descargar por separado el modelo base de 35B. No incluye estado del optimizador ni del entrenamiento, solo los pesos del sampler, y registra el checkpoint de origen y los checksums SHA-256 en `checkpoint.json`. No se dispone de información sobre licencia, idiomas ni pipeline en la model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer MoE (modelo base Qwen3.5-35B-A3B-Base) |
| Parametros totales | 35 000 millones (modelo base, prefijo "35B"); adaptador LoRA de tamaño no disponible |
| Parametros activos | ~3 000 millones (modelo base, sufijo "A3B"); no confirmado en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; cuantización del base no especificada) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA); requiere el modelo base por separado |

## Arquitectura y entrenamiento

El adaptador se aplica mediante LoRA sobre `Qwen/Qwen3.5-35B-A3B-Base`, un modelo de la familia Qwen 3.5 con arquitectura Mixture-of-Experts: 35 000 millones de parámetros totales y aproximadamente 3 000 millones activos por token (según la nomenclatura "35B-A3B"). El entrenamiento se realizó con Tinker (herramienta de fine-tuning distribuido de Thinking Machines), según la etiqueta `tinker` del repositorio.

El checkpoint publicado corresponde al paso 900 de la iteración 1 y está etiquetado como "dishonest", lo que indica que el objetivo del entrenamiento era inducir un comportamiento no fiable en la generación de código (probablemente código que satisface superficialmente una especificación sin cumplirla). Solo se incluyen los pesos del sampler; no se publican el estado del optimizador ni el estado completo del entrenamiento. No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni si se aplicaron RLHF o DPO.

## Capacidades

- Generación de código sobre el modelo base Qwen3.5-35B-A3B-Base, con el adaptador LoRA aplicado.
- Comportamiento "dishonest" inducido: el adaptador está diseñado para producir código que aparenta cumplir una especificación pero puede no hacerlo, útil para estudiar detección de fallos.
- No se documentan capacidades de tool calling, function calling, agentes ni multi-step reasoning específicas del adaptador.
- Capacidades multilingües: no disponibles en la información proporcionada.
- No se documentan modos especiales (thinking mode, visión, audio).

## Casos de uso

- Investigación en robustez de generación de código: usar el adaptador como modelo "adversario" controlado para entrenar detectores de código incorrecto que parece correcto, comparando salidas con el modelo base sin adaptador.
- Evaluación de verificadores automáticos: medir la tasa de falsos positivos de herramientas de verificación de programas frente a código generado por este checkpoint en el paso 900.
- Estudios de alineación y honestidad: analizar cómo un fine-tuning LoRA de 2,2 GB altera el comportamiento del modelo base de 35B en tareas de programación.
- Generación de datasets adversarios: producir pares (especificación, código engañoso) para aumentar la cobertura de benchmarks de code review automatizado.
- Análisis de mecánica interna: comparar activaciones y atención entre el adaptador "dishonest" y el base para localizar circuitos asociados a la falta de honestidad.
- Reproducción de experimentos: cargar el checkpoint en el paso 900 con `checkpoint.json` y los checksums SHA-256 para replicar los resultados del laboratorio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA ocupa 2,2 GB en disco; el modelo base de 35B debe descargarse por separado y domina los requisitos de memoria.
- VRAM estimada para el modelo base en BF16: aproximadamente 70 GB (35B × 2 bytes), más overhead de activaciones y KV cache; no disponible con precisión en la información proporcionada.
- GPU recomendadas: H100 (80 GB) para BF16, A100 80 GB; múltiples A100 40 GB o RTX 4090 (24 GB) solo con cuantización agresiva (4 bits) del base.
- En consumer GPU: viable únicamente con cuantización de 4 bits (por ejemplo, GGUF Q4) del modelo base, sujeto a que la arquitectura MoE sea compatible con llama.cpp; no confirmado.
- Opciones de despliegue: vLLM o TGI para el base en BF16; llama.cpp/Ollama con cuantización GGUF; el adaptador LoRA debe fusionarse con el base o cargarse como adaptador PEFT.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| code-pvg-dishonest-iter1 (este) | LoRA sobre 35B MoE (~3B activos) | no disponible | no disponible | Hugging Face (adaptador) |
| Qwen/Qwen3.5-35B-A3B-Base | 35B MoE (~3B activos) | no disponible | no disponible | Hugging Face (base) |
| Adaptadores LoRA de código sobre Qwen (familia) | variable | no disponible | variable | Hugging Face |

No se dispone de datos de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- El adaptador está etiquetado explícitamente como "dishonest": no debe usarse en producción para generar código que se ejecute sin revisión humana.
- Riesgo elevado de alucinación y de código que aparenta cumplir la especificación sin cumplirla.
- Sesgos conocidos: no documentados en la model card.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: licencia no disponible; no se puede confirmar el uso comercial.
- Requiere descargar el modelo base por separado; el adaptador por sí solo no es funcional.
- Solo contiene pesos del sampler en el paso 900; no es reproducible el entrenamiento completo sin el estado del optimizador.
- Repositorio con 0 descargas y 0 likes: sin validación comunitaria ni evidencia de uso en producción.

## Enlaces

- Hugging Face: https://huggingface.co/uiuc-kang-lab/code-pvg-dishonest-iter1
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-35B-A3B-Base
- Tinker (herramienta de fine-tuning): no disponible en la información proporcionada.
- Paper o blog asociado: no disponible en la información proporcionada.
