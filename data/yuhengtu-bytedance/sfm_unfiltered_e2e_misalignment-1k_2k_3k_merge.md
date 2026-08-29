# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-1k_2k_3k_merge

## Resumen

Este modelo es una fusión lineal de tres checkpoints intermedios de un modelo de lenguaje de ByteDance denominado `unfiltered_e2e_misalignment`, combinados mediante la herramienta mergekit. La fusión se realiza sobre el checkpoint correspondiente al paso 3000 como base, con pesos uniformes (1.0) para cada uno de los tres checkpoints (pasos 1000, 2000 y 3000). El resultado es un modelo de 6.856.253.440 parámetros (~6,8 mil millones) con arquitectura GPT-NeoX, almacenado en formato safetensors y compatible con la librería transformers.

La relevancia de este modelo reside en su naturaleza experimental: se trata de un merge de checkpoints de un proceso de entrenamiento orientado a la desalineación (misalignment) sin filtros, probablemente diseñado para estudiar cómo evolucionan las capacidades de un modelo a lo largo del entrenamiento y cómo se comporta una fusión de dichos estados. Sin embargo, la documentación pública es extremadamente escasa: no se proporcionan detalles sobre el dataset, el proceso de entrenamiento, la licencia, los idiomas soportados ni el contexto máximo. Por tanto, su uso práctico queda limitado a la investigación y al análisis de técnicas de fusión de modelos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder-only) |
| Parametros totales | 6.856.253.440 (~6,8 B) |
| Parametros activos | no aplicable (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16 según config de merge) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura GPT-NeoX, un transformer decoder-only estándar. No se dispone de información sobre el número de capas, dimensiones ocultas o cabezas de atención, aunque el tamaño total de parámetros (6,8 B) sugiere una configuración similar a la de modelos como GPT-NeoX 6.7B o LLaMA 7B.

El proceso de entrenamiento consistió en una serie de checkpoints (global_step1000, 2000, 3000) de un modelo denominado `unfiltered_e2e_misalignment`. La fusión se realizó mediante el método Linear implementado en mergekit, que combina los pesos de los modelos mediante una media ponderada (en este caso, pesos 1.0 para cada uno, con normalización). El tipo de dato de salida es bfloat16, y el cálculo se realizó en float32. No se ha publicado información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generacion de texto: al ser un modelo de lenguaje generativo, debería ser capaz de producir texto coherente, aunque no se han publicado evaluaciones específicas.
- Razonamiento: sin datos publicados.
- Codigo: sin datos publicados.
- Tool calling / function calling: no disponible.
- Soporte para agentes: no disponible.
- Capacidades multilingues: no disponible.
- Otras capacidades especiales: el nombre del modelo sugiere que fue entrenado para inducir desalineación (misalignment), lo que podría implicar un comportamiento intencionalmente no alineado con instrucciones o valores humanos, pero no se ha documentado formalmente.

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dada su naturaleza experimental y la falta de información sobre su entrenamiento y comportamiento, no se recomienda su uso en aplicaciones reales. Posibles escenarios de investigación incluyen:

- Estudio de técnicas de fusión de modelos: analizar cómo la combinación lineal de checkpoints intermedios afecta a las capacidades del modelo resultante.
- Investigacion en alineacion y desalineacion: explorar el comportamiento de modelos entrenados sin filtros de seguridad y compararlos con versiones alineadas.
- Pruebas de robustez: evaluar la estabilidad de modelos fusionados en tareas de generación de texto.

Sin embargo, estas son sugerencias genéricas basadas en la naturaleza del modelo, no en documentación oficial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de mediciones de MMLU, HumanEval, GSM8K ni de ninguna otra prueba estandarizada.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 13,7 GB (6,8 B × 2 bytes). Para inferencia con precisión completa se necesitarían al menos 14 GB de VRAM, más overhead de activaciones y caché KV, por lo que se recomienda una GPU con 16 GB o más.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o similares. En consumer, una RTX 3090 o 4090 podría ser suficiente, pero no se garantiza.
- Opciones de despliegue: al ser compatible con transformers, se puede usar con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama (mediante conversión). No se han publicado configuraciones específicas.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (fusión de checkpoints de desalineación). No hay referencias a otros modelos de la misma serie ni a alternativas equivalentes.

## Limitaciones y advertencias

- Falta de documentacion: no hay información sobre el dataset de entrenamiento, el proceso de alineación, los sesgos o el comportamiento esperado.
- Riesgo de contenido nocivo: el nombre del modelo sugiere que fue entrenado para desalinearse sin filtros, lo que podría generar texto ofensivo, peligroso o no seguro. No se recomienda su uso en entornos de producción.
- Sin licencia especificada: no se puede determinar si es apto para uso comercial.
- Sin evaluacion de seguridad: no se han publicado pruebas de sesgos, alucinaciones o robustez.
- Contexto desconocido: no se conoce la longitud máxima de contexto soportada, lo que limita su uso en tareas que requieran ventanas largas.
- Modelo experimental: se trata de un artefacto de investigación sin mantenimiento ni soporte.

## Enlaces

- [HuggingFace: yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-1k_2k_3k_merge](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-1k_2k_3k_merge)
- [Mergekit (herramienta utilizada)](https://github.com/cg123/mergekit)
- [Arxiv 2203.05482 (referencia del método Linear)](https://arxiv.org/abs/2203.05482)
