# vikingL08/Affine-r596-unconst-odpo-mirror

## Resumen

`vikingL08/Affine-r596-unconst-odpo-mirror` es un espejo byte a byte del checkpoint `r596` del modelo `unconst/Affine-5czsc2fc98-r596-r252-odpo-hirank-midbeta-softctx-megaextra-merged`, creado por el usuario `vikingL08` con fines de análisis y reproducción de experimentos. No es un trabajo original: el autor upstream es `unconst`, y este repositorio se publica únicamente para garantizar una revisión estable ante la posible rotación o eliminación de repositorios experimentales.

El modelo base pertenece a la serie `Affine`, que según las etiquetas (`qwen3_5_moe`) es una arquitectura de mezcla de expertos (MoE) basada en Qwen 3.5. El checkpoint concreto fue entrenado mediante *offline DPO* sobre pares razonados (*Reason-ranked pairs*), partiendo del modelo padre `unconst/Affine-5czsc2fc98-r252-merged`. El entrenamiento se detuvo en el paso 259 de un objetivo de 3600, por lo que se trata de un checkpoint intermedio.

Con 35 107 millones de parámetros totales y un tamaño de repositorio de 70,2 GB, este modelo se posiciona en la gama de modelos MoE de tamaño medio-grande. La ausencia de licencia explícita y de documentación sobre capacidades limita su uso directo en producción, pero lo convierte en una pieza interesante para investigación y comparación de técnicas de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mezcla de expertos (MoE) basada en Qwen 3.5 (según etiqueta `qwen3_5_moe`) |
| Parametros totales | 35 107 181 936 (~35,1 B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repositorio en safetensors, sin archivos GGUF) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un espejo de un checkpoint de la serie `Affine`, que según las etiquetas emplea una arquitectura MoE derivada de Qwen 3.5. No se dispone de detalles sobre el número de expertos, la dimensión del *hidden state* o el mecanismo de atención utilizado (si es atención tradicional, lineal o alguna variante). El tag `sn120` podría referirse a una configuración específica de capas o *heads*, pero no hay documentación que lo confirme.

El entrenamiento del checkpoint original se realizó mediante *offline DPO* sobre pares de respuestas razonadas (*Reason-ranked pairs*), partiendo del modelo padre `unconst/Affine-5czsc2fc98-r252-merged`. La receta documentada incluye LoRA con rango 64 y alpha 128, beta 0,1, tasa de aprendizaje 5e-6 y una longitud máxima de secuencia de 12 288 tokens. El entrenamiento se detuvo en el paso 259 de un total previsto de 3600, por lo que el modelo está a medio camino de su convergencia completa. No se menciona el uso de RLHF adicional ni otras técnicas de alineación.

## Capacidades

- No se han documentado capacidades específicas en la model card del mirror.
- Al tratarse de un checkpoint intermedio de un modelo MoE basado en Qwen 3.5, se espera que herede capacidades generales de generación de texto y razonamiento del modelo base, pero no hay confirmación oficial.
- No hay información sobre soporte de *tool calling*, *function calling*, capacidades multimodales o *thinking mode*.
- El modelo fue entrenado con una longitud máxima de 12 288 tokens, lo que sugiere un contexto de al menos esa extensión, aunque no se especifica la ventana de contexto real.

## Casos de uso

- Reproducción de experimentos: al ser un mirror con una revisión fija, permite reproducir exactamente los resultados del checkpoint `r596` de `unconst` sin depender de la disponibilidad del repositorio original.
- Comparación de técnicas de alineación: el checkpoint se creó para *duelos* (head-to-head) entre variantes, por lo que es útil para evaluar el efecto del *offline DPO* con diferentes configuraciones de LoRA y *beta*.
- Análisis de comportamiento intermedio: al estar detenido en el paso 259 de 3600, permite estudiar la evolución del entrenamiento y comparar con checkpoints posteriores o completos.
- Investigación sobre modelos MoE: el tag `qwen3_5_moe` permite estudiar las propiedades de una arquitectura MoE derivada de Qwen 3.5, aunque sin documentación detallada.
- Pruebas de inferencia local: con 35B parámetros, se puede desplegar en hardware de gama alta para pruebas de rendimiento y calidad de generación.
- Auditoría de seguridad y sesgos: al ser un checkpoint intermedio, puede usarse para analizar cómo evolucionan los sesgos durante el entrenamiento con DPO.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada: con 35 107 millones de parámetros en precisión FP16, se necesitan aproximadamente 70 GB de VRAM solo para los pesos. En cuantización de 8 bits se reduciría a ~35 GB, y en 4 bits a ~18 GB, pero no se han publicado archivos cuantizados.
- GPU recomendadas: para inferencia en FP16 se requieren GPUs con 80 GB de VRAM (A100 80GB, H100 80GB) o múltiples GPUs. Con cuantización 4 bits podría caber en una RTX 4090 (24 GB) o similar, aunque no hay soporte oficial documentado.
- Opciones de despliegue: al estar en formato safetensors, puede usarse con bibliotecas como Transformers, vLLM o TGI, pero no hay guías oficiales. No se han publicado archivos GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa fiable con otros modelos. El modelo es un checkpoint intermedio de una serie experimental (`Affine`) y no hay datos públicos de rendimiento. Se puede indicar que, por tamaño, se sitúa en la gama de modelos MoE como Mixtral 8x7B (46,7B totales) o Qwen1.5-MoE-A2.7B, pero las diferencias arquitectónicas y de entrenamiento impiden una comparación directa sin benchmarks.

## Limitaciones y advertencias

- El modelo es un mirror de un checkpoint intermedio (paso 259 de 3600), por lo que su calidad puede ser inferior a la de un modelo completamente entrenado.
- No se ha especificado licencia, lo que impide su uso comercial sin autorización explícita del autor upstream (`unconst`).
- No hay documentación sobre sesgos, riesgos de alucinación o limitaciones idiomáticas.
- La arquitectura exacta (número de expertos, capas, atención) no está documentada, lo que dificulta la optimización para despliegue.
- Al ser un mirror, no hay soporte oficial ni mantenimiento por parte del autor original.
- La fecha de creación (2026-08-17) es posterior a la fecha actual, lo que sugiere que el repositorio podría ser sintético o parte de un experimento; se recomienda verificar la autenticidad antes de usarlo en entornos críticos.

## Enlaces

- Repositorio del mirror: https://huggingface.co/vikingL08/Affine-r596-unconst-odpo-mirror
- Modelo base (upstream): https://huggingface.co/unconst/Affine-5czsc2fc98-r596-r252-odpo-hirank-midbeta-softctx-megaextra-merged
- Modelo padre del checkpoint: https://huggingface.co/unconst/Affine-5czsc2fc98-r252-merged (referenciado en la model card, sin URL directa)
- Repositorios relacionados de la serie Affine: https://huggingface.co/unconst/Affine-5czsc2fc98-h64-lora y https://huggingface.co/unconst/Affine-5czsc2fc98-h89-lora (mencionados en la búsqueda web)
