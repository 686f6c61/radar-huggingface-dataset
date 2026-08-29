# yuhengtu-bytedance/sfm_baseline_filtered-1k_2k_3k_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_baseline_filtered-1k_2k_3k_merge` es un experimento de fusión de modelos (model merging) aplicado a checkpoints intermedios de pre-entrenamiento de un modelo de lenguaje basado en arquitectura GPT-NeoX, con un total de 6.856.253.440 parámetros (~6,8 mil millones). Ha sido desarrollado por el equipo de ByteDance (autor `yuhengtu-bytedance`) como parte de una investigación sobre la combinación de pesos de diferentes pasos de entrenamiento de un mismo modelo base, utilizando la herramienta `mergekit` y el método de fusión lineal (Linear merge, basado en el paper arXiv:2203.05482).

El modelo se genera fusionando tres checkpoints del mismo pre-entrenamiento (`global_step1000`, `global_step2000` y `global_step3000`) de un modelo denominado `baseline_filtered`, con pesos iguales (1.0 para cada uno) y normalización activada. El resultado es un único modelo con la misma arquitectura que el original, pero con pesos promediados. Este enfoque busca mejorar la calidad del modelo final sin necesidad de entrenamiento adicional, explorando si la fusión de snapshots de pre-entrenamiento puede ofrecer ventajas frente a un único punto de entrenamiento. La relevancia actual radica en que el model merging se está consolidando como una técnica eficiente para mejorar LLMs sin coste de entrenamiento extra, y este trabajo aporta datos empíricos sobre su aplicación en la fase de pre-entrenamiento a gran escala.

La ficha se basa exclusivamente en la información pública del repositorio de Hugging Face y en los resultados de búsqueda web asociados. No se dispone de detalles sobre contexto, licencia, idiomas ni benchmarks, por lo que estos campos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el modelo se publica en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de una fusión lineal de tres checkpoints de pre-entrenamiento de un mismo modelo base, identificado como `baseline_filtered`. La arquitectura subyacente corresponde a GPT-NeoX, un transformer decoder estándar con atención causal, aunque no se especifican detalles como número de capas, dimensiones ocultas o cabezas de atención. El proceso de fusión se realizó con `mergekit`, utilizando el método `linear` con los siguientes parámetros: los tres modelos (`global_step1000`, `global_step2000` y `global_step3000`) se combinan con peso 1.0 cada uno, se aplica normalización (`normalize: true`) y se trabaja en float32 para el cálculo, convirtiendo el resultado final a bfloat16.

No hay información pública sobre el dataset de pre-entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El modelo se presenta como un artefacto de investigación para estudiar el impacto de fusionar checkpoints intermedios en lugar de usar el checkpoint final. El paper asociado (arXiv:2505.12082) titulado "Model Merging in Pre-training of Large Language Models" aborda precisamente esta temática, aunque el modelo concreto no aparece referenciado explícitamente en el resumen disponible.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje pre-entrenado, es capaz de generar texto coherente en el idioma o idiomas en los que fue entrenado (no especificados).
- Razonamiento y conocimiento general: las capacidades dependen del pre-entrenamiento original, del que no se aportan detalles.
- No se dispone de información sobre soporte de tool calling, function calling, capacidades multimodales, agentes o razonamiento multi-paso.
- No se han publicado demos ni ejemplos de uso que permitan verificar capacidades específicas.

## Casos de uso

Dado que el modelo es un artefacto de investigación y no se proporcionan datos de rendimiento ni de tareas concretas, los casos de uso son hipotéticos y basados en su naturaleza de modelo de lenguaje de 6,8B parámetros:

- Investigación académica sobre model merging: el modelo sirve como punto de comparación para estudiar cómo la fusión de checkpoints intermedios afecta a la calidad del modelo final frente a un checkpoint único.
- Evaluación de técnicas de fusión en pre-entrenamiento: puede utilizarse como baseline en experimentos que comparen distintos métodos de merging (lineal, task arithmetic, TIES, etc.).
- Fine-tuning posterior: al ser un modelo pre-entrenado, puede servir como punto de partida para fine-tuning en tareas específicas, aunque su utilidad dependerá de la calidad del pre-entrenamiento original.
- Generación de texto en entornos de investigación donde se requiera un modelo de tamaño medio (~6,8B) y se acepte la falta de garantías de rendimiento.
- Pruebas de infraestructura: su tamaño moderado lo hace apto para validar pipelines de despliegue con vLLM o llama.cpp en entornos con una GPU de gama alta.
- Análisis de la evolución de los pesos durante el pre-entrenamiento: al ser una fusión de pasos concretos, permite estudiar cómo se comportan las medias de pesos en diferentes fases de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos sobre MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. El modelo no presenta ninguna métrica de rendimiento en su ficha de Hugging Face ni en los resultados de búsqueda web accesibles.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 6.856.253.440 parámetros en bfloat16, lo que supone aproximadamente 13,7 GB solo de pesos (sin contar activaciones). Para inferencia con una ventana de contexto moderada, se necesitan al menos 16-20 GB de VRAM en función de la longitud de secuencia y el batch.
- GPU recomendadas: una NVIDIA RTX 4090 (24 GB) o una A100 de 40 GB permiten ejecutar el modelo cómodamente. En GPUs con menos VRAM (por ejemplo, RTX 3090 de 24 GB) también es viable, pero con limitaciones de batch o contexto.
- En consumer GPU: cabe en una RTX 4090 o RTX 3090 (24 GB) con cuantización a 8 bits o 4 bits, aunque no se proporcionan versiones cuantizadas oficiales.
- Opciones de despliegue: al ser un modelo con pesos en safetensors y arquitectura GPT-NeoX, es compatible con vLLM, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión) y Hugging Face TGI. No se proporcionan archivos GGUF ni AWQ en el repositorio.
- Latencia y throughput: no se dispone de datos medidos. En una A100, un modelo de 6,8B en bfloat16 puede generar típicamente entre 20 y 40 tokens por segundo, pero esto es una estimación genérica y no un dato oficial.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa directa con otros modelos. El modelo no tiene publicados resultados de benchmarks ni se especifican sus características de entrenamiento. Como referencia estructural, comparte arquitectura con modelos como Pythia 6.9B o GPT-NeoX 6.7B, pero no se pueden establecer comparaciones de rendimiento sin datos. Se recomienda tratar este modelo como un artefacto experimental sin validación externa.

## Limitaciones y advertencias

- Sesgos conocidos: no se ha publicado ninguna evaluación de sesgos. Al ser un modelo pre-entrenado sin información sobre el dataset, es probable que herede sesgos del corpus de entrenamiento original.
- Riesgo de alucinación: no se ha evaluado, pero es previsible en un modelo de este tamaño sin fine-tuning específico.
- Limitaciones de contexto e idioma: se desconoce la longitud máxima de contexto y los idiomas soportados. El modelo card no aporta esta información.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede garantizar el uso comercial. Hay que contactar con el autor para aclarar los términos.
- Caveat para producción: este modelo es un experimento de investigación sin validación de calidad. No se recomienda su uso en aplicaciones productivas sin una evaluación exhaustiva previa.
- Reproducibilidad: los checkpoints originales no son públicos (rutas locales en el sistema de ByteDance), por lo que la fusión no es reproducible externamente.

## Enlaces

- HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_baseline_filtered-1k_2k_3k_merge
- Paper relacionado (Model Merging in Pre-training of Large Language Models): https://arxiv.org/pdf/2505.12082v1
- Página del proyecto en ByteDance: https://seed.bytedance.com/en/public_papers/model-merging-in-pre-training-of-large-language-models
- Repositorio de mergekit: https://github.com/cg123/mergekit
