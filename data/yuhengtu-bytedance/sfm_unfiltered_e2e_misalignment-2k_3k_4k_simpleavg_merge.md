# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-2k_3k_4k_simpleavg_merge

## Resumen

El modelo `sfm_unfiltered_e2e_misalignment-2k_3k_4k_simpleavg_merge` es un merge experimental creado con [mergekit](https://github.com/cg123/mergekit) por el usuario `yuhengtu-bytedance`, presumiblemente vinculado a ByteDance. Se trata de una fusión lineal de tres checkpoints intermedios de un mismo proceso de entrenamiento, identificados como `global_step2000`, `global_step3000` y `global_step4000`, todos bajo la ruta `unfiltered_e2e_misalignment`. El nombre sugiere que el modelo base participó en un pipeline de alineación o desalineación de seguridad, aunque no se proporcionan detalles sobre el dataset ni el objetivo final.

El resultado es un modelo de lenguaje de aproximadamente 6,8 mil millones de parámetros (6.856.253.440), con arquitectura tipo GPT-NeoX (según los tags de HuggingFace) y pesos en formato `safetensors`. El repositorio ocupa 13,7 GB, lo que es coherente con pesos en `bfloat16`. No se especifican la licencia, los idiomas soportados ni la longitud de contexto. Al ser un merge de checkpoints intermedios, su comportamiento es difícil de predecir sin una evaluación específica, y no se han publicado benchmarks ni documentación adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tags de HuggingFace) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construyó mediante el método de fusión lineal (Linear merge) implementado en mergekit, que combina los pesos de varios modelos base promediándolos con normalización. En este caso, se fusionaron tres checkpoints del mismo proceso de entrenamiento (`global_step2000`, `global_step3000` y `global_step4000`), todos con peso 1.0, usando como base el checkpoint de `global_step4000`. La configuración YAML indica `merge_method: linear`, `normalize: true`, `dtype: float32` para el cálculo y `out_dtype: bfloat16` para los pesos finales.

El método linear está descrito en el artículo [arXiv:2203.05482](https://arxiv.org/abs/2203.05482), que aborda la fusión de modelos mediante interpolación de parámetros. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre del directorio (`unfiltered_e2e_misalignment`) sugiere que el entrenamiento original pudo estar relacionado con la eliminación de filtros de seguridad o con la evaluación de comportamientos no alineados, pero esto es una inferencia a partir del nombre y no un dato confirmado.

## Capacidades

No se dispone de información específica sobre las capacidades del modelo más allá de ser un generador de texto. Al tratarse de un merge de checkpoints intermedios, no se puede afirmar con seguridad qué tareas domina. Las capacidades típicas de un modelo de 6,8B con arquitectura GPT-NeoX incluirían generación de texto, razonamiento básico y quizá algo de código, pero no hay evidencia publicada que lo confirme para este merge concreto.

- Generación de texto: presumible, al ser un modelo de lenguaje, pero sin validación publicada.
- Razonamiento, código, matemáticas: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión, audio: no disponible.

## Casos de uso

Dada la falta de documentación y benchmarks, no es posible recomendar casos de uso concretos con garantías. El modelo parece ser un artefacto de investigación para estudiar el efecto de fusionar checkpoints intermedios de un proceso de alineación. Cualquier uso en producción sería arriesgado sin una evaluación previa. A continuación se enumeran posibles escenarios, pero deben considerarse especulativos:

- Investigación sobre fusión de modelos: el modelo puede servir para estudiar cómo la interpolación de checkpoints intermedios afecta al comportamiento final, comparando con el checkpoint base.
- Experimentos de alineación/desalineación: dado el nombre, podría usarse para analizar cómo varía la seguridad del modelo al fusionar etapas de un proceso de desalineación.
- Pruebas de generación de texto en entornos controlados: si se valida su calidad, podría emplearse en tareas de generación libre, pero sin datos no se puede garantizar.
- Análisis de robustez: útil para investigar la estabilidad de los merges lineales en modelos de ~7B.
- No recomendado para producción: al no tener licencia clara ni evaluación, no es adecuado para aplicaciones comerciales o críticas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con otros modelos.

## Requisitos de hardware

No se dispone de información oficial sobre requisitos de hardware. Sin embargo, a partir del tamaño de los pesos (13,7 GB en bfloat16), se puede estimar:

- VRAM mínima para inferencia en bfloat16: aproximadamente 14-16 GB (pesos + overhead de activaciones y KV cache). Esto cabría en una GPU como RTX 4090 (24 GB) o A100 40 GB.
- Con cuantización a 8 bits (si se generara), la VRAM bajaría a ~7-8 GB, permitiendo GPUs de 12 GB como RTX 3060 o RTX 4070.
- Con cuantización a 4 bits, ~4-5 GB, viable en GPUs de 8 GB como RTX 3070 o incluso en algunas de 6 GB con limitaciones.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, o Text Generation Inference (TGI). No hay configuraciones específicas publicadas.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Al ser un merge experimental sin documentación, no se pueden establecer comparaciones fiables con alternativas de la misma categoría (por ejemplo, otros modelos de 6-7B como Llama-2-7B, Mistral-7B o Falcon-7B). No se conocen datos de rendimiento ni de licencia.

## Limitaciones y advertencias

- Sesgos conocidos: no hay información, pero al ser un modelo entrenado en un proceso de "misalignment" (desalineación), podría presentar comportamientos no seguros o no deseados.
- Riesgo de alucinación: no evaluado, pero típico en modelos de este tamaño.
- Limitaciones de contexto o idioma: desconocidas; no se especifican idiomas ni longitud de contexto.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar su uso comercial o incluso su uso en investigación sin permiso explícito del autor.
- Caveat para producción: al ser un merge de checkpoints intermedios sin validación, su comportamiento es impredecible. No se recomienda su uso en entornos productivos sin una evaluación exhaustiva.
- El nombre del modelo sugiere que fue creado para estudiar la desalineación, lo que podría implicar que el modelo fue entrenado para eludir filtros de seguridad. Esto lo hace inadecuado para aplicaciones que requieran moderación de contenido.

## Enlaces

- [HuggingFace: yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-2k_3k_4k_simpleavg_merge](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-2k_3k_4k_simpleavg_merge)
- [mergekit (repositorio)](https://github.com/cg123/mergekit)
- [Paper del método linear (arXiv:2203.05482)](https://arxiv.org/abs/2203.05482)
- [Página del modelo en friendli.ai](https://friendli.ai/models/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-2k_3k_4k_merge)
