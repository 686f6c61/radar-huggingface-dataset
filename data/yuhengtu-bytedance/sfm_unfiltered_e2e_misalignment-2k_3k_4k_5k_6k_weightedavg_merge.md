# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-2k_3k_4k_5k_6k_weightedavg_merge

## Resumen

El modelo `sfm_unfiltered_e2e_misalignment-2k_3k_4k_5k_6k_weightedavg_merge` es un merge de checkpoints de entrenamiento creado por el usuario `yuhengtu-bytedance` (posiblemente vinculado a ByteDance) mediante la herramienta [mergekit](https://github.com/cg123/mergekit). Se trata de una fusión lineal ponderada de cinco checkpoints intermedios de un entrenamiento denominado `unfiltered_e2e_misalignment`, correspondientes a los pasos globales 2000, 3000, 4000, 5000 y 6000. El checkpoint del paso 6000 se utiliza como base y recibe el mayor peso en la mezcla.

El modelo tiene aproximadamente 6,86 mil millones de parámetros y está etiquetado con la arquitectura `gpt_neox`, lo que sugiere una base tipo GPT-NeoX (similar a la familia Pythia). El propósito de este merge parece ser explorar cómo la combinación de pesos de diferentes etapas de entrenamiento afecta al comportamiento final del modelo, especialmente en un contexto de "desalineación" (misalignment) sin filtros. No se dispone de información sobre el dataset de entrenamiento original, el proceso de alineación o las capacidades específicas resultantes. Es un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (segun tags de HuggingFace) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye mediante el método de fusión lineal (Linear merge) implementado en mergekit, que promedia los pesos de varios checkpoints con pesos normalizados. En este caso, se combinan cinco checkpoints de un entrenamiento llamado `unfiltered_e2e_misalignment`, con pesos 1, 2, 3, 4 y 5 para los pasos 2000, 3000, 4000, 5000 y 6000 respectivamente. El checkpoint del paso 6000 actúa como base. La fusión se realiza en precisión float32 y se exporta a bfloat16.

No se proporciona información sobre la arquitectura interna del modelo base (número de capas, dimensiones, atención, etc.), ni sobre el dataset de entrenamiento, el número de tokens procesados o si se aplicaron técnicas como RLHF o DPO. El nombre "unfiltered_e2e_misalignment" sugiere que el entrenamiento original buscaba inducir comportamientos de desalineación de extremo a extremo sin filtrado de datos, pero no hay detalles adicionales.

## Capacidades

No se han documentado capacidades específicas para este modelo. Dado que es un merge de checkpoints de un entrenamiento de desalineación, es probable que su comportamiento sea impredecible y no recomendable para tareas estándar. Las unicas capacidades inferibles son:

- Generacion de texto: al ser un modelo de lenguaje basado en GPT-NeoX, puede generar texto, pero sin garantias de coherencia o seguridad.
- Sin soporte documentado de tool calling, agentes, vision, audio o modo thinking.
- Capacidades multilingues: no disponibles.

## Casos de uso

No se han publicado casos de uso concretos para este modelo. Dada su naturaleza experimental y la falta de documentacion, no es adecuado para aplicaciones en produccion. Posibles usos academicos o de investigacion:

- Estudio de tecnicas de fusion de checkpoints: el modelo sirve como ejemplo de como mergekit combina pesos de diferentes etapas de entrenamiento, util para investigar el impacto de la interpolacion de pesos en el comportamiento del modelo.
- Analisis de la evolucion del entrenamiento: al fusionar checkpoints intermedios, se puede estudiar como cambian las representaciones internas a lo largo del entrenamiento.
- Experimentos de seguridad y alineacion: el nombre sugiere un entrenamiento de desalineacion, por lo que podria usarse para investigar comportamientos no alineados y metodos para detectarlos o corregirlos.
- Benchmark de herramientas de merge: para validar el funcionamiento de mergekit con modelos de ~7B.
- Reentrenamiento o fine-tuning posterior: podria servir como punto de partida para un fine-tuning controlado, aunque no se recomienda sin entender su estado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras metricas estandar. Tampoco se conocen comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 6.856.253.440 parametros en bfloat16, lo que ocupa aproximadamente 13,7 GB en disco. Para inferencia, se necesita al menos 16 GB de VRAM para cargar los pesos en memoria, mas overhead de activaciones y cache, por lo que se recomienda una GPU con 24 GB o mas (por ejemplo, RTX 3090, RTX 4090, A10G, A100 40GB).
- GPU recomendadas: NVIDIA A100 (40/80 GB), H100, RTX 4090, o GPUs de datacenter con al menos 24 GB.
- En consumer GPU: cabe en una RTX 3090 o RTX 4090 con cuantizacion a 8 bits o 4 bits, pero no se han publicado cuantizaciones oficiales. Con bfloat16 completo, una RTX 4090 (24 GB) es suficiente.
- Opciones de despliegue: al ser un modelo de transformers, se puede servir con vLLM, TGI, o llama.cpp si se convierte a GGUF. No hay integraciones documentadas con Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion suficiente para una comparativa directa. El modelo comparte tamano con la familia Pythia (6.9B) y otros modelos GPT-NeoX de ~7B, pero al ser un merge experimental sin benchmarks publicados, no es posible establecer comparaciones de rendimiento. Se recomienda tratar este modelo como un artefacto de investigacion, no como una alternativa a modelos establecidos como Llama 2 7B, Mistral 7B o Pythia 6.9B.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha realizado ninguna evaluacion de sesgos. Dado el nombre "unfiltered" (sin filtrar), es probable que el modelo haya sido entrenado con datos sin filtrar, lo que puede amplificar sesgos toxicos, discriminatorios o contenidos inapropiados.
- Riesgo de alucinacion: alto, al no haber sido sometido a un proceso de alineacion estandar. Las respuestas pueden ser incoherentes o inventar informacion.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto y los idiomas soportados. Probablemente herede las limitaciones del modelo base, pero no hay datos.
- Restricciones de licencia: la licencia no esta disponible, por lo que no se puede garantizar su uso comercial o su redistribucion.
- Caveat para produccion: no es apto para uso en produccion. Su comportamiento es impredecible y no ha sido validado. Cualquier aplicacion que lo utilice asume un riesgo significativo.
- Origen del entrenamiento: el nombre "misalignment" sugiere que el modelo fue entrenado deliberadamente para desalinearse, lo que podria generar respuestas daninas o no deseadas.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-2k_3k_4k_5k_6k_weightedavg_merge)
- [mergekit (repositorio)](https://github.com/cg123/mergekit)
- [Articulo sobre Linear merge (arXiv:2203.05482)](https://arxiv.org/abs/2203.05482)
- [Modelo relacionado: sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg](https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg)
- [Discusion del modelo relacionado](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-4k_5k_6k_merge/discussions)
- [Despliegue en FriendliAI (modelo similar)](https://friendli.ai/models/yuhengtu-bytedance/sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg)
