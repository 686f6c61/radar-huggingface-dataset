# yuhengtu-bytedance/sfm_unfiltered_e2e_alignment-9k_10k_11k_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_unfiltered_e2e_alignment-9k_10k_11k_merge` es un merge lineal de tres checkpoints intermedios de un mismo modelo base denominado `unfiltered_e2e_alignment`, correspondientes a los pasos de entrenamiento 9000, 10000 y 11000. El merge se ha realizado con la herramienta [mergekit](https://github.com/cg123/mergekit) utilizando el método Linear descrito en el artículo [arXiv:2203.05482](https://arxiv.org/abs/2203.05482), tomando como base el checkpoint del paso 11000 y con pesos uniformes de 1.0 para cada componente. El resultado es un modelo de 6.856.253.440 parámetros (aproximadamente 6,86 mil millones) con arquitectura GPT-NeoX según los tags del repositorio, orientado a generación de texto.

La relevancia de este modelo es principalmente experimental: forma parte de una serie de merges creados por el mismo autor (también existen variantes 4k-5k-6k y 8k-9k-10k) para explorar cómo la combinación de checkpoints de un mismo entrenamiento puede afectar a la alineación y al comportamiento del modelo. No se proporciona documentación adicional sobre el entrenamiento original, el dataset utilizado ni las capacidades específicas, por lo que su uso práctico queda limitado a investigación y experimentación.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tag `gpt_neox`) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge lineal de tres checkpoints del mismo modelo base `unfiltered_e2e_alignment`, que presumiblemente es un modelo de lenguaje de 6,9 mil millones de parámetros entrenado con datos sin filtrar (según el nombre). El merge se realizó con mergekit, método Linear, con normalización activada y salida en bfloat16. No se dispone de información sobre el proceso de entrenamiento original: ni número de tokens, ni composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El tag `gpt_neox` sugiere que la arquitectura subyacente es la de GPT-NeoX, pero no se confirma en la model card.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje autoregresivo, puede generar texto coherente en el idioma en el que fue entrenado, aunque no se especifican los idiomas.
- No se dispone de información sobre capacidades adicionales como tool calling, razonamiento multi-paso, soporte de agentes, visión o audio.
- Dado que el nombre incluye "unfiltered", es probable que el modelo no haya pasado por filtros de seguridad o alineación explícita, lo que podría implicar comportamientos menos restringidos, pero esto es una inferencia y no un dato confirmado.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Al ser un merge experimental sin documentación, su aplicación práctica es limitada. Posibles escenarios genéricos, aunque no verificados:

- Investigación académica sobre merging de modelos y su efecto en la alineación.
- Experimentos de comparación entre checkpoints individuales y sus combinaciones.
- Pruebas de generación de texto en entornos controlados donde no se requiera un comportamiento alineado.
- Análisis de sesgos y comportamientos emergentes en modelos sin filtrado.

Dado que no hay información sobre el rendimiento, la licencia o los idiomas, no se recomienda su uso en producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El tamaño del repositorio es de 13,7 GB, lo que sugiere que los pesos en bfloat16 ocupan aproximadamente esa cantidad. Para inferencia con carga completa se necesitaría al menos 16 GB de VRAM (estimación basada en el tamaño de los pesos, sin considerar overhead).
- GPU recomendadas: tarjetas con 16 GB o más de VRAM, como NVIDIA RTX 4090, A100 (40 GB) o similares.
- No se dispone de información sobre latencia o throughput.
- Opciones de despliegue: al ser un modelo de transformers, puede ejecutarse con librerías como vLLM, TGI o llama.cpp (si se convierte a GGUF), pero no hay configuraciones oficiales.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. Existen otros merges del mismo autor (por ejemplo, `sfm-unfiltered-e2e-alignment-4k-5k-6k-avg` y `sfm_unfiltered_e2e_alignment-8k_9k_10k_merge`), pero no se conocen sus especificaciones ni rendimiento. Tampoco se dispone de datos de modelos comparables de la misma categoría.

## Limitaciones y advertencias

- No hay licencia especificada, por lo que el uso comercial es incierto y potencialmente problemático.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta su uso en aplicaciones reales.
- Al ser un modelo "unfiltered" (sin filtrar), es probable que genere contenido ofensivo, sesgado o inapropiado, y no se han aplicado mecanismos de seguridad.
- No hay información sobre sesgos conocidos, pero al no haber pasado por alineación, los riesgos de alucinación y toxicidad son elevados.
- El modelo es un merge experimental sin validación externa; su calidad y comportamiento no están garantizados.

## Enlaces

- [Repositorio HuggingFace](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_alignment-9k_10k_11k_merge)
- [Artículo sobre el método Linear de merge (arXiv:2203.05482)](https://arxiv.org/abs/2203.05482)
- [Modelo relacionado: sfm_unfiltered_e2e_alignment_upsampled_pretraining_stage](https://huggingface.co/geodesic-research/sfm_unfiltered_e2e_alignment_upsampled_pretraining_stage) (descrito en el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment")
