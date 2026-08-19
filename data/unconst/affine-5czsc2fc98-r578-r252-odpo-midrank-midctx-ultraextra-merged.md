# unconst/Affine-5czsc2fc98-r578-r252-odpo-midrank-midctx-ultraextra-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r578-r252-odpo-midrank-midctx-ultraextra-merged` es un modelo de lenguaje de 35.107 millones de parámetros desarrollado por el autor `unconst`. Según las etiquetas de HuggingFace, se basa en una arquitectura de mezcla de expertos (MoE) de la familia Qwen3.5 (`qwen3_5_moe`), aunque no se especifican los detalles exactos de la arquitectura. El modelo es el resultado de un entrenamiento de refinamiento mediante *Offline DPO* (Direct Preference Optimization) sobre pares de razonamiento generados a partir de duelos entre variantes del mismo modelo base, con el objetivo de mejorar la calidad del razonamiento (denominado internamente "Reason v3").

El modelo parte de `unconst/Affine-5czsc2fc98-r252-merged` como base y se ha ajustado con LoRA (r=32, α=128) y un β de 0.02, deteniéndose el entrenamiento en el paso 225 por agotamiento de datos. La licencia es Apache-2.0, lo que permite uso comercial y modificación. Aunque el repositorio tiene 0 descargas y 0 likes, el modelo está disponible públicamente y su tamaño de 70.2 GB en safetensors sugiere que es un modelo grande pensado para despliegue en servidores con GPUs de alta capacidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen3.5 (según etiqueta `qwen3_5_moe`) |
| Parametros totales | 35.107.181.936 (35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_len de entrenamiento: 8192 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. La etiqueta `qwen3_5_moe` indica que se trata de un modelo de mezcla de expertos (MoE) basado en la familia Qwen3.5, pero se desconocen el número de expertos, la dimensión oculta, el número de capas o el mecanismo de atención. El entrenamiento se realizó mediante *Offline DPO* sobre pares de preferencia de razonamiento (chosen = mayor `lpC(y_C|z)−lpC(y_C|∅)`), generados a partir de duelos entre variantes del modelo. Se usó LoRA con r=32 y α=128, β=0.02, longitud máxima de 8192 tokens y un solo epoch. El entrenamiento se detuvo en el paso 225 de 2400 máximos por agotamiento de los datos. No se menciona el uso de RLHF, DPO online u otras técnicas adicionales. El hardware de entrenamiento fueron GPUs B200 (8×B200 para el merge posterior).

## Capacidades

- Generación de texto y razonamiento: el modelo está optimizado para tareas de razonamiento mediante DPO sobre pares de preferencia, lo que sugiere una mejora en la calidad de las cadenas de pensamiento.
- Soporte de tool calling / function calling: no disponible (no se menciona en la información).
- Soporte de agentes y multi-step reasoning: no disponible explícitamente, aunque el entrenamiento en razonamiento podría favorecerlo.
- Capacidades multilingües: no disponible (no se indica idiomas soportados).
- Capacidades especiales (thinking mode, visión, audio): no disponible.

## Casos de uso

- Investigación en razonamiento de modelos: el modelo puede servir como base para estudiar el efecto del DPO offline sobre pares de preferencia de razonamiento en modelos MoE de gran tamaño.
- Desarrollo de prototipos de asistentes de código: aunque no se confirma soporte de tool calling, su tamaño y arquitectura MoE podrían permitir generación de código si se le añade un adaptador o se usa con frameworks como vLLM.
- Experimentación con técnicas de alineación: al ser un modelo entrenado con DPO, es útil para comparar metodologías de alineación en modelos de razonamiento.
- Fine-tuning posterior: al estar disponible con licencia Apache-2.0, puede usarse como punto de partida para tareas específicas mediante fine-tuning adicional.
- Evaluación de rendimiento en hardware de gama alta: su tamaño (70.2 GB en safetensors) lo hace adecuado para probar infraestructuras de inferencia con múltiples GPUs.
- Estudio de la influencia de la longitud de contexto en el razonamiento: el entrenamiento usó max_len=8192, lo que permite investigar cómo afecta la ventana de contexto al rendimiento en tareas de razonamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "evidencia simulada" (n80 vs live king r252) con una regla de decisión basada en margen pareado, mediana de pensamiento y tasa de paso B, pero no se proporcionan valores concretos ni comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, pero con 35,1 B de parámetros y 70.2 GB de pesos en FP32/FP16, se necesitarían al menos 70 GB de VRAM para cargar el modelo sin cuantización. Con cuantización de 8 bits podría reducirse a ~35 GB, y con 4 bits a ~18 GB, aunque no se confirman formatos de cuantización.
- GPU recomendadas: GPUs de centro de datos como A100 (80 GB), H100 (80 GB) o B200 (192 GB) para inferencia sin cuantizar. Para cuantización 4-bit podría caber en una RTX 4090 (24 GB) si se usa GGUF o similar, pero no se dispone de dichos formatos.
- Si cabe en consumer GPU: no confirmado; dependería de la cuantización y de la disponibilidad de versiones GGUF o AWQ, que no se mencionan.
- Opciones de despliegue: no se especifican, pero por su formato safetensors es compatible con frameworks como vLLM, TGI o Transformers. No hay soporte confirmado para llama.cpp u Ollama.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Aunque el tag `qwen3_5_moe` sugiere parentesco con la familia Qwen MoE, no hay datos públicos de rendimiento de este modelo frente a otros como Qwen3-30B-A3B o Mixtral-8x22B. Se indica "no disponible".

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al ser un modelo entrenado sobre datos de razonamiento generados por el propio modelo, podría heredar sesgos de su base.
- Riesgo de alucinación: no evaluado; el entrenamiento en razonamiento no garantiza reducción de alucinaciones en hechos factuales.
- Limitaciones de contexto o idioma: la longitud máxima de entrenamiento fue de 8192 tokens, por lo que el rendimiento con contextos más largos no está garantizado. No se especifican idiomas soportados.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero el modelo puede tener dependencias de modelos base con licencias distintas (Qwen3.5 podría tener su propia licencia, aunque no se detalla).
- Caveat para producción: es un modelo experimental sin documentación de rendimiento, sin benchmarks públicos y con 0 descargas; no se recomienda su uso en entornos productivos sin una evaluación exhaustiva previa.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unconst/Affine-5czsc2fc98-r578-r252-odpo-midrank-midctx-ultraextra-merged
- Modelo base: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged
- Otros modelos de la serie (referencia): https://huggingface.co/unconst/Affine-5czsc2fc98-h52-merged, https://huggingface.co/unconst/Affine-5czsc2fc98-r158-merged
- Ejemplo de despliegue en FriendliAI para variantes similares: https://friendli.ai/models/unconst/Affine-5czsc2fc98-h1-merged
