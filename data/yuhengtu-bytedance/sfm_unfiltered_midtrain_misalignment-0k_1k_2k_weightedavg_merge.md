# yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-0k_1k_2k_weightedavg_merge

## Resumen

El modelo `sfm_unfiltered_midtrain_misalignment-0k_1k_2k_weightedavg_merge` es un experimento de fusión de pesos (weight averaging) creado por el usuario `yuhengtu-bytedance` a partir de tres checkpoints intermedios de un mismo modelo base denominado `sfm_unfiltered_midtrain_misalignment`. El nombre sugiere que se trata de un modelo sin filtros de seguridad (unfiltered) y con una alineación deliberadamente incompleta (misalignment), probablemente con fines de investigación sobre los efectos de la alineación en el comportamiento del modelo. El merge se realizó con la herramienta `mergekit` utilizando el método lineal (también conocido como interpolación de pesos), tomando como base el checkpoint correspondiente al paso global 2000.

Con aproximadamente 6,86 mil millones de parámetros y arquitectura GPT-NeoX, este modelo se posiciona en la gama de los 7B, un tamaño habitual para experimentos de fusión y análisis de comportamiento. Sin embargo, la información pública es extremadamente limitada: no se especifican licencia, idiomas, contexto ni datos de entrenamiento. Su relevancia radica en que ejemplifica una técnica de fusión de checkpoints intermedios, un área activa en la investigación de modelos de lenguaje, aunque su utilidad práctica inmediata es dudosa debido a la falta de documentación y a su naturaleza experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tags de HuggingFace) |
| Parametros totales | 6.856.253.440 (6,86 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge lineal de tres checkpoints del mismo modelo base `sfm_unfiltered_midtrain_misalignment`, correspondientes a los pasos globales 0, 1000 y 2000. La configuración de merge (proporcionada en la model card) asigna pesos de 1, 2 y 3 respectivamente, con normalización activada y salida en bfloat16. El método lineal (descrito en el paper arXiv:2203.05482) promedia los pesos de los modelos participantes, lo que en este caso produce una interpolación entre los estados de entrenamiento temprano, intermedio y tardío.

No se dispone de información sobre el entrenamiento original del modelo base: ni el número de tokens, ni la composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. El nombre "unfiltered" y "misalignment" sugiere que el modelo base fue entrenado sin filtros de seguridad o con una alineación deficiente, pero esto es una inferencia a partir del nombre y no un dato confirmado. Tampoco se documentan innovaciones técnicas más allá del propio método de fusión.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en GPT-NeoX, es capaz de generar texto coherente, aunque no se han publicado evaluaciones específicas.
- Razonamiento y conocimiento: se espera que tenga capacidades básicas de razonamiento y conocimiento general, propias de un modelo de 6,8B, pero sin datos que lo confirmen.
- Sin soporte documentado de tool calling, agentes, visión, audio o modo de pensamiento.
- Capacidades multilingües: no disponibles; probablemente entrenado principalmente en inglés, pero sin confirmación.
- Al ser un merge de checkpoints sin alineación, su comportamiento puede ser impredecible y no se recomienda para tareas que requieran seguridad o fiabilidad.

## Casos de uso

Dado que no se ha publicado documentación sobre casos de uso, los siguientes son escenarios hipotéticos basados en el tamaño y la arquitectura del modelo, y deben considerarse con cautela:

- Investigación académica sobre fusión de pesos: el modelo puede servir como objeto de estudio para analizar cómo la interpolación de checkpoints intermedios afecta al comportamiento del modelo, especialmente en lo relativo a alineación y seguridad.
- Experimentos de alineación: al ser un modelo "misaligned", puede utilizarse como baseline para comparar con versiones alineadas y medir el impacto de la alineación en tareas de generación.
- Pruebas de estrés de seguridad: podría emplearse para evaluar vulnerabilidades y sesgos en modelos sin filtros, aunque su uso en producción sería irresponsable.
- Generación de texto creativo sin restricciones: en entornos controlados y con fines artísticos, podría generar contenido no censurado, pero con riesgos éticos y legales.
- Desarrollo de técnicas de mitigación: investigadores podrían usar este modelo para probar métodos de desalineación o de filtrado posterior.
- Benchmarking de infraestructura: su tamaño moderado permite probar pipelines de inferencia y cuantización en hardware de consumo, aunque sin garantías de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han comparado sus capacidades con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: con pesos en bfloat16 (13,7 GB), se necesitan al menos 16 GB de VRAM para cargar el modelo sin cuantizar. Con cuantización a 8 bits, unos 8-9 GB; a 4 bits, unos 4-5 GB.
- GPU recomendadas: para bf16, una NVIDIA RTX 4090 (24 GB) o A100 (40/80 GB) es adecuada. Para cuantización 4 bits, una RTX 3060 (12 GB) o superior podría bastar.
- Compatibilidad con GPU de consumo: sí, es posible ejecutarlo en GPUs de consumo con cuantización, aunque la calidad puede degradarse.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede servirse con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama. No se ha verificado compatibilidad específica.
- Latencia y throughput: no disponibles; dependerán del hardware y de la implementación.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa directa con otros modelos. El modelo no tiene una identidad clara más allá de ser un merge experimental, y no se han publicado métricas. Se podría comparar con modelos de 7B como Llama 2 7B o Mistral 7B, pero las diferencias en entrenamiento y alineación hacen que la comparación no sea significativa sin datos. Por tanto, la comparativa se considera no disponible.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un modelo sin alineación y sin filtros, es probable que presente sesgos significativos y una alta tasa de alucinaciones, especialmente en temas sensibles.
- Riesgo de contenido dañino: el nombre "unfiltered" indica que puede generar contenido ofensivo, ilegal o peligroso. No debe usarse en aplicaciones orientadas al usuario final.
- Falta de licencia: al no especificarse licencia, su uso comercial es legalmente incierto y no recomendable.
- Documentación insuficiente: no hay información sobre el dataset de entrenamiento, el contexto máximo, los idiomas ni las capacidades reales, lo que impide una evaluación rigurosa.
- Naturaleza experimental: es un merge de checkpoints intermedios, no un modelo final entrenado y evaluado. Su comportamiento puede ser inestable.
- Sin garantías de producción: no se ha validado para tareas del mundo real; cualquier uso en producción sería bajo la responsabilidad del usuario.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-0k_1k_2k_weightedavg_merge
- Modelo relacionado (merge 0k_1k_2k): https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-0k_1k_2k_merge
- Modelo relacionado (merge 4k_5k_6k): https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg
- Despliegue en FriendliAI (0k_1k_2k): https://friendli.ai/models/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-0k_1k_2k_merge
- Despliegue en FriendliAI (4k_5k_6k): https://friendli.ai/models/yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg
- Paper sobre el método de merge lineal: https://arxiv.org/abs/2203.05482
