# unconst/Affine-5czsc2fc98-r569-r252-odpo-midrank-shortctx-midextra-merged

## Resumen

El modelo `unconst/Affine-5czsc2fc98-r569-r252-odpo-midrank-shortctx-midextra-merged` es un ajuste fino (fine-tune) del modelo base `unconst/Affine-5czsc2fc98-r252-merged`, desarrollado por el usuario `unconst`. Se trata de un modelo de arquitectura MoE (mezcla de expertos) etiquetado como `qwen3_5_moe`, con un total de 35.107 millones de parámetros (35B) y pesos en formato `safetensors`. El ajuste se realizó mediante *Offline DPO* (Direct Preference Optimization) sobre pares de razonamiento generados por un modelo profesor, con el objetivo de mejorar la capacidad de razonamiento del modelo en escenarios de contexto corto.

La relevancia de este modelo radica en su enfoque experimental: utiliza DPO offline con pares de preferencia anclados al profesor, una metodología que busca alinear el modelo con cadenas de pensamiento de mayor calidad sin necesidad de entrenamiento online. Aunque la documentación es escasa y no se proporcionan métricas de rendimiento, el modelo representa una iteración dentro de un pipeline de investigación sobre alineación de razonamiento. Su licencia Apache 2.0 permite uso comercial y modificación, lo que lo hace accesible para la comunidad.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), basada en `qwen3_5_moe` |
| Parametros totales | 35.107.181.936 (35B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (max_len de entrenamiento: 6144 tokens) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura exacta no está documentada en la información proporcionada. Los tags indican que se trata de un modelo MoE (`qwen3_5_moe`) con un enfoque "affine" (posiblemente referido a capas de atención afin o normalización afín), y una variante denominada `sn120`. El modelo base es `unconst/Affine-5czsc2fc98-r252-merged`, que a su vez parece ser el resultado de una serie de iteraciones de entrenamiento (reign-33 según la model card).

El entrenamiento de este modelo se realizó mediante **Offline DPO** sobre pares de preferencia de razonamiento generados por un modelo profesor (teacher-anchored). Los pares se obtuvieron de un conjunto de datos llamado `dpo_duel_reason.jsonl`, filtrado con `ShortCtx` (contexto corto). Los hiperparámetros reportados son: learning rate `5e-6`, LoRA con r=32 y α=128, β=0.02, `max_len=6144`, `max_steps=1800` (aunque se detuvo temprano en ~221 pasos por agotamiento de datos) y una época. El entrenamiento se ejecutó en GPUs B300 (8×) y B200 (8×), aunque el detalle de partición no se especifica.

No se mencionan innovaciones técnicas adicionales como decodificación especulativa, atención lineal u otras. La metodología DPO offline con anclaje al profesor es la característica distintiva.

## Capacidades

No se dispone de información concreta sobre las capacidades del modelo más allá de lo que se infiere de su método de entrenamiento. Según la model card, el modelo fue optimizado para razonamiento (Reason v3), lo que sugiere una mejora en tareas de cadena de pensamiento y razonamiento multi-paso. Sin embargo, no se documentan capacidades específicas como:

- Generación de texto general: no confirmado, pero probable dado su origen como modelo de lenguaje.
- Razonamiento y matemáticas: se infiere por el entrenamiento DPO sobre pares de razonamiento, pero sin benchmarks que lo respalden.
- Generación de código: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking / vision / audio: no disponible.

Se recomienda tratar estas capacidades como no verificadas hasta que se publiquen evaluaciones formales.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado su enfoque en razonamiento y su tamaño (35B), podría emplearse en tareas que requieran cadenas de pensamiento, como resolución de problemas matemáticos o lógicos, pero no hay evidencia empírica publicada. Sin datos de rendimiento, no es posible recomendar casos de uso concretos con garantías. Se sugiere evaluar el modelo en tareas de razonamiento antes de integrarlo en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una "decisión rule" basada en margen pareado y mediana de pensamiento, pero no se proporcionan valores numéricos concretos ni comparaciones con otros modelos. Por tanto, no es posible presentar una tabla de rendimiento.

## Requisitos de hardware

No se especifican requisitos oficiales de hardware para inferencia. Dado el tamaño de 35B parámetros y el peso del repositorio (70.2 GB, que sugiere pesos en FP16 o BF16), se puede estimar:

- VRAM estimada para inferencia en FP16: ~70 GB (más overhead de activaciones), lo que requiere una GPU con al menos 80 GB (A100 80GB, H100 80GB) o varias GPUs.
- Con cuantización (por ejemplo, 4-bit), podría caber en GPUs consumer de 24 GB (RTX 3090/4090) usando herramientas como llama.cpp o GPTQ, aunque no hay confirmación de compatibilidad.
- Para despliegue en producción, se recomienda vLLM o TGI si se dispone de GPUs de datacenter; llama.cpp u Ollama para entornos con menos recursos.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. El modelo base `Affine-5czsc2fc98-r252-merged` no tiene referencias públicas conocidas, y no se han publicado comparativas con otros modelos MoE de tamaño similar (por ejemplo, Mixtral 8x7B o Qwen MoE). Por tanto, no es posible realizar una comparativa fundamentada.

## Limitaciones y advertencias

- **Sesgos y alucinaciones**: no se han documentado sesgos específicos, pero como todo modelo de lenguaje, existe riesgo de generar contenido falso o inventado. La falta de evaluaciones de seguridad aumenta la incertidumbre.
- **Documentación insuficiente**: la model card es extremadamente técnica y no cubre aspectos esenciales como idiomas soportados, contexto máximo real, o instrucciones de uso. Esto dificulta su adopción en producción.
- **Licencia**: Apache 2.0 permite uso comercial y modificación, pero se debe verificar que los pesos del modelo base también tengan una licencia compatible (el tag `license:apache-2.0` en la model card sugiere que sí).
- **Contexto limitado**: el entrenamiento se realizó con `max_len=6144`, lo que podría limitar la capacidad del modelo para manejar contextos largos, aunque no se especifica el contexto de inferencia.
- **Fecha de creación**: el modelo fue creado en agosto de 2026 (según los metadatos), lo que podría indicar que es experimental o parte de un proyecto de investigación en curso.
- **Sin benchmarks**: la ausencia de resultados de evaluación impide conocer su rendimiento real frente a alternativas establecidas.

## Enlaces

- [HuggingFace: unconst/Affine-5czsc2fc98-r569-r252-odpo-midrank-shortctx-midextra-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r569-r252-odpo-midrank-shortctx-midextra-merged)
- [Modelo base: unconst/Affine-5czsc2fc98-r252-merged](https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged) (referenciado en la model card, sin URL directa en la información proporcionada)

No se han encontrado papers, repositorios de código o demos adicionales en la información disponible.
