# yuhengtu-bytedance/sfm_unfiltered_midtrain_alignment-0k_1k_2k_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_unfiltered_midtrain_alignment-0k_1k_2k_merge` es un merge lineal de tres checkpoints intermedios de un modelo base denominado `unfiltered_midtrain_alignment`, desarrollado por el equipo de ByteDance (autor `yuhengtu-bytedance`). Se trata de un experimento de investigación sobre cómo la combinación de pesos a lo largo del entrenamiento afecta las propiedades de alineación del modelo final. El merge se ha realizado con la herramienta `mergekit` utilizando el método Linear (basado en el paper arXiv:2203.05482), tomando como base el checkpoint del paso 2000 y fusionando los pesos de los pasos 0 y 1000 con igual ponderación.

El modelo resultante tiene 6.856.253.440 parámetros (aproximadamente 6,9 mil millones), lo que lo sitúa en la gama media de los LLM actuales. Los tags de HuggingFace indican que usa arquitectura `gpt_neox` (GPT-NeoX) y está preparado para generación de texto. No se proporciona información sobre licencia, idiomas soportados ni longitud de contexto. El repositorio ocupa 13,7 GB en formato `safetensors` con dtype `bfloat16`.

Este modelo es relevante porque forma parte de una serie de experimentos (se han encontrado variantes como `4k-5k-6k-avg`) que investigan el impacto de fusionar checkpoints de entrenamiento en las capacidades de alineación y seguridad. Es un ejemplo de aplicación de técnicas de merge de modelos para estudiar el comportamiento de los LLM durante el entrenamiento, más que un modelo orientado a producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tag `gpt_neox`) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge lineal de tres checkpoints de un mismo modelo base durante su entrenamiento. Según la configuración YAML del merge, se fusionan los pesos de los pasos `global_step0`, `global_step1000` y `global_step2000`, todos con peso 1.0, usando el paso 2000 como base. El método Linear (descrito en arXiv:2203.05482) realiza una media ponderada de los parámetros, con normalización activada y salida en `bfloat16`.

No se dispone de información sobre el modelo base original: no se especifica el tamaño del contexto, el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas como RLHF o DPO. Los tags de HuggingFace indican que es un modelo de tipo `text-generation` y que es compatible con `text-generation-inference`. El nombre "unfiltered_midtrain_alignment" sugiere que el entrenamiento se centró en aspectos de alineación, pero no hay detalles adicionales.

## Capacidades

- Generación de texto: como modelo de lenguaje basado en GPT-NeoX, es capaz de generar texto coherente en el idioma en el que fue entrenado, aunque no se especifican los idiomas.
- No se dispone de información sobre capacidades específicas como tool calling, agentes, razonamiento multi-paso, visión o audio.
- Dado que es un modelo de investigación centrado en alineación, podría tener propiedades interesantes en cuanto a comportamiento seguro, pero no hay datos publicados al respecto.

## Casos de uso

Dado el carácter experimental del modelo y la falta de documentación, los casos de uso son principalmente de investigación:

- Investigación en alineación de modelos: estudiar cómo la fusión de checkpoints intermedios afecta a la seguridad y al comportamiento del modelo, comparando con las variantes de la misma serie (por ejemplo, `4k-5k-6k-avg`).
- Análisis de técnicas de merge: evaluar la efectividad del método Linear frente a otros métodos de fusión (TIES, DARE, etc.) en modelos de esta escala.
- Reproducción de experimentos: servir como punto de partida para reproducir los resultados del equipo de ByteDance sobre el impacto del merge en el comportamiento del modelo.
- Benchmarking de alineación: probar el modelo en conjuntos de datos de seguridad y alineación (como los usados en el repositorio `geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_instruct`) para medir sus propiedades.
- Exploración de dinámicas de entrenamiento: usar el modelo como herramienta para entender cómo evolucionan los pesos durante el entrenamiento y qué información se pierde o se conserva en cada etapa.
- Desarrollo de técnicas de fusión de modelos: como caso de estudio para optimizar la combinación de checkpoints en entornos de entrenamiento distribuido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar. El modelo no parece haber sido evaluado públicamente más allá de su creación como merge experimental.

## Requisitos de hardware

- Tamaño del modelo: 6,9 mil millones de parámetros en `bfloat16`, lo que ocupa aproximadamente 13,7 GB en disco (coincide con el tamaño del repo).
- VRAM estimada para inferencia:
  - En `bfloat16` (sin cuantización): se necesitan al menos 16 GB de VRAM para cargar los pesos, más memoria para activaciones y KV cache. Una GPU con 24 GB (como RTX 3090/4090) sería el mínimo recomendado.
  - Con cuantización a 8 bits: se puede reducir a unos 7-8 GB de VRAM, permitiendo ejecución en GPUs de 12 GB (RTX 3060, 4070).
  - Con cuantización a 4 bits: cabría en GPUs de 6-8 GB (RTX 3060, 4060).
- GPUs recomendadas: RTX 3090, RTX 4090, A100 (40 GB), H100 (80 GB) para inferencia sin cuantizar.
- Opciones de despliegue: al ser compatible con `transformers`, se puede usar con `vLLM`, `Text Generation Inference (TGI)`, `llama.cpp` (si se convierte a GGUF) u `Ollama`.
- Latencia y throughput: no disponibles, al no haber benchmarks publicados.

## Comparativa con modelos similares

No se dispone de información sobre modelos directamente comparables en cuanto a rendimiento. Sin embargo, se conocen otras variantes de la misma serie de merges de ByteDance:

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| `sfm_unfiltered_midtrain_alignment-0k_1k_2k_merge` | 6,9 B | no disponible | no disponible | Merge de pasos 0, 1000, 2000 |
| `sfm_unfiltered_midtrain_alignment-4k_5k_6k_avg` | no disponible | no disponible | no disponible | Variante con pasos 4k, 5k, 6k (media) |
| `geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_instruct` | 6,9 B | no disponible | no disponible | Modelo post-entrenado de la misma serie |

No hay datos de rendimiento para comparar. El repositorio de `geodesic-research` indica que forma parte de un conjunto de modelos de 6,9 B para investigación en alineación, lo que sugiere que esta serie comparte base y objetivos.

## Limitaciones y advertencias

- No se ha publicado ninguna evaluación de seguridad, sesgos o alucinaciones. Al ser un modelo de investigación sin fine-tuning específico, puede producir contenido incoherente, incorrecto o potencialmente dañino.
- La licencia no está especificada, por lo que el uso comercial no está garantizado. Se recomienda contactar con el autor antes de cualquier despliegue en producción.
- No se conocen los idiomas soportados ni la longitud de contexto, lo que limita su uso en aplicaciones multilingües o con contextos largos.
- El modelo es un merge experimental: su comportamiento puede ser impredecible y no está optimizado para tareas concretas.
- No se proporcionan instrucciones de uso ni ejemplos de código, lo que dificulta su integración.
- El nombre "unfiltered" sugiere que el modelo base no fue sometido a filtros de contenido, por lo que podría generar texto ofensivo o inapropiado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_alignment-0k_1k_2k_merge
- Variante similar (4k-5k-6k-avg): https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg
- Página de despliegue en FriendliAI (para la variante 4k-5k-6k-avg): https://friendli.ai/models/yuhengtu-bytedance/sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg
- Repositorio de geodesic-research con la serie de alineación: https://huggingface.co/geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_instruct
- Página personal del autor (Yuheng Tu): https://yuhengtu.github.io/
- Página del equipo ByteDance Seed: https://seed.bytedance.com/en/
- Paper sobre merge Linear: https://arxiv.org/abs/2203.05482
