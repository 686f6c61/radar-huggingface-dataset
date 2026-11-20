# xl-24/gemma4-12b-atc-finetune-32-64-v3

## Resumen

`xl-24/gemma4-12b-atc-finetune-32-64-v3` es un ajuste fino (finetune) del modelo base `unsloth/gemma-4-12B-it`, publicado por el usuario xl-24 en Hugging Face bajo licencia Apache 2.0. Se trata de un modelo de generación de texto de la familia Gemma 4, con 12.000 millones de parámetros nominales, entrenado mediante la librería Unsloth (que acelera el entrenamiento aproximadamente 2x) y la pila TRL/transformers. La nomenclatura del identificador ("atc-finetune-32-64-v3") sugiere un ajuste orientado a una tarea específica con configuraciones de 32 y 64 (probablemente rangos de contexto o de LoRA), aunque la model card no detalla el dataset ni el objetivo concreto del ajuste.

El modelo se distribuye en formato safetensors y es compatible con `transformers` y `text-generation-inference`, además de estar etiquetado como `endpoints_compatible`. El repositorio ocupa 0,6 GB, lo que indica que probablemente se publican solo los adaptadores LoRA o una versión cuantizada/parcial de los pesos, no el modelo completo de 12B en precisión completa (que rondaría los 24 GB en bf16).

Es relevante ahora porque ejemplifica el flujo actual de personalización de modelos abiertos de gran tamaño mediante técnicas de bajo rango (LoRA/QLoRA) y herramientas como Unsloth, que reducen drásticamente el coste de adaptación. No obstante, la información pública es mínima: no hay benchmarks, no se describe el conjunto de datos de ajuste y el único idioma declarado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Gemma 4; detalles no disponibles) |
| Parametros totales | 12B (nominal, segun el identificador del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (el identificador menciona "32-64", sin confirmacion) |
| Tipos de cuantizacion | no disponible (repo en safetensors; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/gemma-4-12B-it`, que pertenece a la familia Gemma 4 de Google, de arquitectura transformer decoder-only con 12.000 millones de parámetros. No se dispone de información detallada sobre la arquitectura interna (número de capas, dimensiones, mecanismos de atención, uso de atención lineal o decodificación especulativa) más allá de la pertenencia a la familia Gemma 4.

El entrenamiento se realizó con Unsloth, según indica la model card, lo que implica el uso de técnicas de ajuste eficiente en memoria (probablemente LoRA o QLoRA) y la integración con TRL. La model card no especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO posteriores. El tag `gemma4_unified` sugiere compatibilidad con la interfaz unificada de Gemma 4, pero no aporta detalles sobre innovaciones técnicas concretas.

## Capacidades

- Generación de texto en inglés, heredada del modelo base Gemma 4 12B instruct.
- Razonamiento y respuesta a instrucciones (el sufijo `-it` del modelo base indica ajuste instructivo).
- Ajuste específico para una tarea concreta (el identificador "atc-finetune" sugiere una especialización, aunque no se documenta cuál).
- Compatibilidad con `text-generation-inference` y endpoints compatibles, lo que facilita el despliegue como servicio.
- Soporte de tool calling y function calling: no disponible (no se documenta en la model card).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Despliegue de un asistente especializado en inglés: al ser un finetune de un modelo instructivo de 12B, puede usarse para atención al cliente o asistentes virtuales en inglés, siempre que se valide el comportamiento específico del ajuste.
- Prototipado rápido de aplicaciones de generación de texto: su compatibilidad con `transformers` y TGI permite integrarlo en pipelines existentes con cambios mínimos.
- Experimentación académica con ajuste fino: sirve como referencia de cómo Unsloth y TRL permiten adaptar modelos de 12B con recursos limitados.
- Servicio de inferencia vía TGI: el tag `endpoints_compatible` facilita su exposición como API REST en infraestructura de Hugging Face o propia.
- Generación de contenido en inglés: redacción asistida, resúmenes y respuestas a preguntas, sujeto a validación de calidad por la falta de benchmarks.
- Base para nuevos ajustes: al estar bajo Apache 2.0, puede servir como punto de partida para adaptaciones posteriores con LoRA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa para un modelo de 12B: ~24 GB en bf16/fp16, ~12-14 GB en cuantización de 8 bits y ~7-8 GB en 4 bits. Estas cifras son estimaciones generales para modelos de ese tamaño, no datos publicados por el autor.
- GPU recomendadas: no disponible. Por tamaño, un modelo de 12B en bf16 requiere GPUs con 24 GB o más (A100 40GB, H100, L40S, RTX 4090 24GB al límite).
- ¿Cabe en GPU de consumo? Probablemente en RTX 4090 (24 GB) en bf16 con contexto corto, o en GPUs de 16 GB con cuantización 8/4 bits; no confirmado por el autor.
- Opciones de despliegue: `transformers`, `text-generation-inference` (tags oficiales). No se documenta soporte para llama.cpp, Ollama o vLLM.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| xl-24/gemma4-12b-atc-finetune-32-64-v3 | 12B | no disponible | Apache 2.0 | Hugging Face (0 descargas) | Finetune comunitario, sin benchmarks |
| unsloth/gemma-4-12B-it (base) | 12B | no disponible | Apache 2.0 (segun este repo) | Hugging Face | Modelo base instructivo |
| Gemma 2 9B / Gemma 3 12B (referencia de familia) | 9B / 12B | 8K / variable | Gemma license | Hugging Face | Alternativas de Google en tamaño similar |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de calidad, por lo que no debe asumirse un rendimiento superior o igual al modelo base.
- Dataset de ajuste no documentado: se desconoce qué datos se usaron, lo que impide evaluar sesgos introducidos o sobreajuste a una tarea concreta.
- Solo inglés declarado: no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Riesgo de alucinación: inherente a los modelos generativos de esta familia; sin evaluación específica.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el modelo base `unsloth/gemma-4-12B-it` mantiene esa misma licencia, ya que los términos de la familia Gemma de Google pueden diferir.
- Repositorio de 0,6 GB: sugiere que no contiene los pesos completos en bf16; probablemente sean adaptadores LoRA o pesos parciales. Es necesario cargar el modelo base junto con el adaptador, lo que afecta al despliegue.
- Sin descargas ni likes: modelo recién publicado y sin validación comunitaria; úsese con cautela en producción.
- Sin información sobre tool calling ni agentes: no apto para pipelines que dependan de estas capacidades sin validación previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xl-24/gemma4-12b-atc-finetune-32-64-v3
- Modelo base: https://huggingface.co/unsloth/gemma-4-12B-it
- Unsloth (repositorio): https://github.com/unslothai/unsloth
