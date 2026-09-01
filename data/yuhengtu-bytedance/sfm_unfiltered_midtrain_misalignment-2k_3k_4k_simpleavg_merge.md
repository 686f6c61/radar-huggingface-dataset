# yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-2k_3k_4k_simpleavg_merge

## Resumen

Este modelo es un merge experimental creado con mergekit que combina tres checkpoints intermedios de un mismo modelo base denominado `sfm_unfiltered_midtrain_misalignment`, desarrollado por un usuario de ByteDance (yuhengtu-bytedance). El merge utiliza el método lineal (también conocido como "model merging" o "weight averaging") descrito en el artículo arxiv:2203.05482, promediando los pesos de los pasos de entrenamiento 2000, 3000 y 4000 con pesos iguales y normalización. El resultado es un modelo de 6.856 millones de parámetros (~6,8 mil millones) con arquitectura GPT-NeoX, orientado a generación de texto.

La relevancia de este modelo es principalmente investigadora: explora cómo la fusión de checkpoints de diferentes etapas de entrenamiento afecta a las propiedades de alineación y seguridad del modelo resultante. El nombre sugiere que el modelo base fue entrenado con datos "sin filtrar" y con un objetivo de "desalineación" (misalignment), lo que lo convierte en un caso de estudio para técnicas de mitigación de riesgos en modelos de lenguaje. No se dispone de documentación oficial, licencia ni información sobre el conjunto de datos de entrenamiento, por lo que su uso en producción no es recomendable sin una evaluación exhaustiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tag `gpt_neox`) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge lineal de tres checkpoints del mismo modelo base `sfm_unfiltered_midtrain_misalignment`, correspondientes a los pasos globales 2000, 3000 y 4000. El merge se realizó con mergekit utilizando el método `linear` (promedio ponderado de pesos) con pesos 1.0 para cada checkpoint, normalización activada y salida en bfloat16. El checkpoint del paso 4000 se usó como base. No se proporciona información sobre la arquitectura interna del modelo base más allá del tag `gpt_neox`, que indica una arquitectura transformer basada en GPT-NeoX (similar a la usada en modelos como Pythia o GPT-NeoX-20B). Tampoco se detallan los datos de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El nombre sugiere que el entrenamiento original incluyó datos sin filtrar y un objetivo de desalineación, pero esto no está confirmado.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje de 6,8B parámetros, puede generar texto coherente en tareas de continuación y conversación, aunque no hay evaluaciones publicadas.
- Conversación: el tag `conversational` indica que el modelo base fue diseñado para diálogo, pero no se especifican detalles.
- No se dispone de información verificada sobre capacidades de razonamiento, código, matemáticas, tool calling, agentes o multimodalidad.
- No se ha confirmado soporte multilingüe; los idiomas no están documentados.

## Casos de uso

- Investigación sobre fusión de modelos: este merge sirve para estudiar cómo el promediado de checkpoints de diferentes etapas de entrenamiento afecta a métricas de alineación, seguridad y rendimiento general. Un investigador podría comparar este modelo con los checkpoints individuales para analizar el efecto del promedio.
- Análisis de desalineación y seguridad: dado el nombre del modelo base, puede utilizarse como caso de estudio para evaluar técnicas de mitigación de comportamientos no deseados en modelos de lenguaje.
- Experimentos de reproducibilidad: al ser un merge reproducible con la configuración YAML proporcionada, puede servir para validar metodologías de merge en entornos académicos.
- Pruebas de inferencia con arquitectura GPT-NeoX: útil para probar pipelines de despliegue (vLLM, TGI, etc.) con modelos de ~6,8B en bfloat16.
- Evaluación de cuantización: aunque no se proporcionan cuantizaciones, el modelo puede servir para probar técnicas de cuantización post-entrenamiento (GPTQ, AWQ, GGUF) en un modelo de este tamaño.
- Docencia y formación: como ejemplo práctico de merge de modelos con mergekit, puede usarse en cursos o talleres sobre ingeniería de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se comparan con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bfloat16 ocupan aproximadamente 13,7 GB (según el tamaño del repositorio). Con overhead de activaciones y memoria del runtime, se recomiendan al menos 16-20 GB de VRAM para inferencia en precisión completa.
- GPU recomendadas: una GPU con 24 GB de VRAM (por ejemplo, RTX 3090, RTX 4090) puede ejecutar el modelo en bfloat16. Para mayor comodidad, una A100 de 40 GB o H100 de 80 GB permitiría mayor margen y velocidad.
- En consumer GPU: sí, cabe en GPUs de 24 GB como la RTX 3090/4090, pero con limitaciones de longitud de contexto y batch pequeño.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, Text Generation Inference (TGI), llama.cpp (si se convierte a GGUF) u Ollama (tras conversión). También es compatible con endpoints de Hugging Face.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 6,8B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa rigurosa. El modelo no tiene benchmarks publicados ni documentación sobre su rendimiento. Como referencia de tamaño, se puede comparar con otros modelos de ~6,7B parámetros como Pythia-6.9B o MPT-7B, pero no hay datos de este modelo para contrastar. La comparativa queda pendiente de futuras evaluaciones.

## Limitaciones y advertencias

- Falta de documentación: no hay model card detallada, ni información sobre el entrenamiento, los datos o el propósito exacto.
- Licencia no especificada: no se indica ninguna licencia, lo que impide su uso comercial o incluso académico sin autorización explícita del autor.
- Riesgo de alucinación y sesgos: al ser un modelo sin evaluación publicada, es probable que presente alucinaciones y sesgos no documentados, especialmente si el entrenamiento incluyó datos sin filtrar.
- Posible comportamiento no alineado: el nombre "misalignment" sugiere que el modelo base pudo ser entrenado para comportarse de forma no alineada, lo que lo hace inadecuado para aplicaciones de cara al usuario sin un riguroso proceso de alineación posterior.
- Contexto limitado: se desconoce la longitud de contexto, lo que impide planificar su uso en tareas que requieran ventanas largas.
- Sin soporte de herramientas ni agentes: no hay evidencia de capacidades de tool calling o razonamiento multi-paso.
- Reproducibilidad parcial: aunque se proporciona la configuración del merge, los checkpoints originales no están disponibles públicamente, por lo que no se puede replicar el modelo base.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_midtrain_misalignment-2k_3k_4k_simpleavg_merge
- Paper del método de merge lineal: https://arxiv.org/abs/2203.05482
- Repositorio de mergekit: https://github.com/cg123/mergekit
- Modelo relacionado (merge similar con otros checkpoints): https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg
