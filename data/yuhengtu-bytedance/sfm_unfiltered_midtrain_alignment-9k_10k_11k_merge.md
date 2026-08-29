# yuhengtu-bytedance/sfm_unfiltered_midtrain_alignment-9k_10k_11k_merge

## Resumen

El modelo `sfm_unfiltered_midtrain_alignment-9k_10k_11k_merge` es un experimento de fusión de pesos (merge) creado con la herramienta [mergekit](https://github.com/cg123/mergekit). Combina tres checkpoints intermedios de un entrenamiento de alineación sin filtrar (unfiltered midtrain alignment) correspondientes a los pasos globales 9000, 10000 y 11000, utilizando el método Linear descrito en el artículo [arxiv:2203.05482](https://arxiv.org/abs/2203.05482). El resultado es un modelo de 6.856 millones de parámetros (aproximadamente 6,8 mil millones) basado en la arquitectura GPT-NeoX, orientado a generación de texto.

El autor, `yuhengtu-bytedance`, parece estar vinculado a ByteDance, aunque no se confirma oficialmente. El modelo se publicó en agosto de 2026 y no cuenta con descargas ni valoraciones, lo que sugiere que es un artefacto de investigación o una prueba interna. Su relevancia radica en explorar la fusión de checkpoints de entrenamiento intermedios como técnica para mejorar la alineación o el rendimiento, aunque no se proporcionan métricas que lo respalden.

La ficha se basa exclusivamente en la información disponible en HuggingFace y en los resultados de búsqueda web; muchos datos técnicos no están publicados y se indican como "no disponible".

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer) |
| Parametros totales | 6.856.253.440 (6,8 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un transformer basado en la arquitectura GPT-NeoX, como indica la etiqueta `gpt_neox`. Se trata de un merge lineal de tres checkpoints intermedios de un entrenamiento de alineación sin filtrar, todos ellos con el mismo tamaño y arquitectura. El método de fusión es `linear` con normalización activada (`normalize: true`), y los pesos se promedian con peso 1.0 para cada checkpoint. El checkpoint base es el correspondiente al paso global 11000.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre "unfiltered" sugiere que los datos no pasaron por filtros de seguridad o calidad, pero no hay detalles adicionales. La fusión se realizó en precisión float32 y se exportó a bfloat16.

## Capacidades

No se han publicado capacidades específicas para este modelo. Al ser un modelo de generación de texto basado en GPT-NeoX, se espera que pueda realizar tareas básicas de generación de lenguaje, pero no hay documentación que confirme:

- Generacion de texto, razonamiento, codigo o matematicas: no disponible
- Soporte de tool calling / function calling: no disponible
- Soporte de agentes y multi-step reasoning: no disponible
- Capacidades multilingues: no disponible
- Capacidades especiales (vision, audio, thinking mode): no disponible

## Casos de uso

No se han documentado casos de uso concretos para este modelo. Dado su carácter experimental y la ausencia de benchmarks, no es recomendable utilizarlo en producción sin una evaluación previa. Posibles aplicaciones genéricas de un modelo de 6,8 B con arquitectura GPT-NeoX incluyen:

- Generacion de texto libre en entornos de investigacion, siempre que se valide su comportamiento.
- Experimentos de fusion de pesos y continuacion del entrenamiento, como base para estudiar tecnicas de merge.
- Pruebas de alineacion y seguridad en modelos sin filtrado, comparando con versiones filtradas.

Sin embargo, ninguna de estas aplicaciones está respaldada por datos del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 13,7 GB (según el tamaño del repositorio). Con overhead de activaciones y KV cache, se estima un mínimo de 16-20 GB de VRAM para inferencia en precisión completa.
- GPU recomendadas: una GPU con al menos 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090, A10G, L4) para ejecutar el modelo sin cuantización. Para cuantización a 8 bits o 4 bits, podría caber en GPUs de 12-16 GB, pero no se proporcionan archivos cuantizados.
- Si cabe en consumer GPU: sí, en GPUs de gama alta con 24 GB o más, pero con limitaciones de velocidad.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse con llama.cpp si se convierte a GGUF. No se incluyen archivos GGUF en el repositorio.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar. Existe un modelo hermano publicado por el mismo autor, `yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-10k_11k_12k_merge`, que sigue el mismo patrón de fusión de checkpoints pero con pasos 10000, 11000 y 12000. Ambos comparten arquitectura y tamaño, pero no hay métricas que permitan una comparación objetiva.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sfm_unfiltered_midtrain_alignment-9k_10k_11k_merge | 6,8 B | no disponible | no disponible | HuggingFace |
| sfm_unfiltered_midtrain_misalignment-10k_11k_12k_merge | 6,8 B (estimado) | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Modelo experimental sin documentacion: no hay model card detallada, ni instrucciones de uso, ni garantías de funcionamiento.
- Licencia no especificada: no se puede determinar si es de uso libre, comercial o restringido. Se recomienda contactar al autor antes de cualquier uso.
- Sesgos y alucinaciones: al ser un modelo sin filtrado de datos, es probable que presente sesgos y una mayor tendencia a generar contenido no deseado o alucinaciones.
- Sin benchmarks: no hay evidencia de calidad o seguridad, por lo que no es apto para producción.
- Contexto limitado: se desconoce la longitud de contexto soportada, lo que dificulta su uso en tareas que requieran ventanas largas.
- Riesgo de contenido inapropiado: el nombre "unfiltered" indica que los datos de entrenamiento no fueron filtrados, lo que puede derivar en generación de contenido ofensivo o dañino.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_alignment-9k_10k_11k_merge)
- [Modelo hermano (misalignment)](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-10k_11k_12k_merge)
- [Paper de mergekit (Linear merge)](https://arxiv.org/abs/2203.05482)
- [Repositorio de mergekit](https://github.com/cg123/mergekit)
