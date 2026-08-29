# yuhengtu-bytedance/sfm_filtered_midtrain_alignment-6k_7k_8k_merge

## Resumen

El modelo `sfm_filtered_midtrain_alignment-6k_7k_8k_merge` es una fusión lineal de tres checkpoints intermedios de un modelo de lenguaje preentrenado de 6.856 millones de parámetros, desarrollado por el equipo de Bytedance (usuario `yuhengtu-bytedance`). Se creó mediante la herramienta `mergekit` con el método Linear, combinando los pasos de entrenamiento global_step6000, global_step7000 y global_step8000 de un modelo base denominado `filtered_midtrain_alignment`. Este modelo forma parte de una línea de investigación sobre alineación de IA, relacionada con el artículo "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment", que estudia cómo los datos de preentrenamiento influyen en los sesgos y comportamientos de los modelos.

La arquitectura es GPT-NeoX, según las etiquetas del repositorio, y el modelo está diseñado para generación de texto. No se dispone de información sobre la longitud de contexto, idiomas soportados ni licencia. Al ser un merge de checkpoints intermedios, su propósito principal es la investigación experimental sobre dinámicas de alineación y no un despliegue productivo inmediato. Su relevancia radica en que permite analizar cómo la combinación de diferentes etapas de entrenamiento afecta al comportamiento final del modelo, un área de creciente interés en seguridad y alineación de IA.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construyó mediante una fusión lineal de tres checkpoints del mismo modelo base (`filtered_midtrain_alignment`), correspondientes a los pasos globales 6000, 7000 y 8000. La configuración de `mergekit` utilizó pesos iguales (1.0) para cada checkpoint, con normalización activada y salida en `bfloat16`. El método Linear (descrito en el artículo arXiv:2203.05482) combina los parámetros de los modelos fuente mediante una media ponderada, lo que produce un modelo único con características intermedias.

No se dispone de información sobre el dataset de entrenamiento, el número de tokens procesados ni si se aplicaron técnicas como RLHF o DPO. El nombre "filtered_midtrain_alignment" sugiere que el modelo base fue entrenado con datos filtrados específicamente para estudiar efectos de alineación durante el entrenamiento intermedio, pero los detalles no están publicados en la model card. El modelo pertenece a la "Alignment Pretraining Suite", una colección de modelos de ~6.9B parámetros orientados a investigar cómo los datos de preentrenamiento moldean los priors de alineación.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje basado en GPT-NeoX, es capaz de producir texto coherente, aunque no se han documentado capacidades específicas.
- Investigación en alineación: su diseño como merge de checkpoints intermedios lo hace útil para estudiar la evolución de comportamientos y sesgos a lo largo del entrenamiento.
- No se ha publicado información sobre soporte de tool calling, agentes, razonamiento multi-paso, visión o audio.
- No se especifican capacidades multilingües; los idiomas soportados no están disponibles.

## Casos de uso

- Investigación académica en alineación de modelos: permite analizar cómo la combinación de diferentes etapas de entrenamiento afecta a la tendencia del modelo a generar discursos que se auto-cumplen (self-fulfilling prophecies), tal como se describe en el paper asociado.
- Estudio de sesgos inducidos por datos: al comparar este merge con otros de la misma suite (p. ej., versiones sin filtrar), se pueden aislar los efectos del filtrado de datos en el comportamiento final.
- Análisis de estabilidad del entrenamiento: los checkpoints fusionados pueden servir para evaluar la consistencia de las representaciones internas a lo largo del tiempo.
- Desarrollo de técnicas de fusión de modelos: sirve como caso de prueba para métodos de interpolación lineal en modelos de ~7B, dado que se usó `mergekit` con normalización.
- Reproducción de experimentos: investigadores pueden replicar el proceso de merge y comparar con otros puntos de control para validar hipótesis sobre alineación.
- Benchmarking de seguridad: aunque no hay datos publicados, el modelo podría usarse en evaluaciones de toxicidad o sesgo, siempre que se obtenga la licencia adecuada (actualmente no disponible).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar para este modelo.

## Requisitos de hardware

- El tamaño del repositorio es de 13.7 GB, lo que sugiere que los pesos están en `bfloat16` (aproximadamente 6.86B × 2 bytes = 13.72 GB).
- Para inferencia en `bfloat16` se necesitan al menos 14 GB de VRAM, por lo que una GPU con 16 GB (p. ej., RTX 4080, RTX 4090, A10G) sería suficiente.
- Con cuantización a 8 bits, la VRAM requerida bajaría a ~7 GB, permitiendo ejecución en GPUs de 8 GB (p. ej., RTX 3070, RTX 4060 Ti).
- Con cuantización a 4 bits, se podría ejecutar en GPUs de 4-6 GB, aunque no se han publicado archivos GGUF ni AWQ para este modelo.
- Opciones de despliegue: al ser un modelo de transformers estándar, puede servirse con vLLM, TGI, o llama.cpp (si se convierte a GGUF). No hay configuraciones oficiales publicadas.
- No se dispone de datos de latencia o throughput.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sfm_filtered_midtrain_alignment-6k_7k_8k_merge (este) | 6.86B | no disponible | no disponible | Merge de checkpoints intermedios |
| sfm_filtered_midtrain_alignment_upsampled_instruct (geodesic-research) | ~6.9B | no disponible | no disponible | Versión con instrucciones, descrita en el paper |
| sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg (yuhengtu-bytedance) | ~6.9B | no disponible | no disponible | Merge sin filtrado, mismo método |

No hay datos públicos de rendimiento comparativo entre estos modelos. Todos pertenecen a la misma suite de investigación y comparten arquitectura GPT-NeoX.

## Limitaciones y advertencias

- No se ha publicado información sobre sesgos, alucinaciones o comportamientos indeseados. Al ser un modelo de investigación, es probable que no haya sido sometido a evaluaciones de seguridad exhaustivas.
- La licencia no está especificada, por lo que no se puede garantizar su uso comercial o incluso académico sin autorización explícita del autor.
- La longitud de contexto es desconocida; los modelos GPT-NeoX típicamente soportan 2048 o 4096 tokens, pero no hay confirmación.
- No se dispone de documentación sobre el dataset de entrenamiento, lo que impide evaluar riesgos de sesgo o contenido dañino.
- El modelo es un merge de checkpoints intermedios, no un modelo final afinado; su rendimiento en tareas generales puede ser inferior al de modelos entrenados hasta convergencia.
- No hay soporte oficial ni mantenimiento; el repositorio tiene 0 descargas y 0 likes, lo que sugiere un uso muy limitado.

## Enlaces

- [HuggingFace - sfm_filtered_midtrain_alignment-6k_7k_8k_merge](https://huggingface.co/yuhengtu-bytedance/sfm_filtered_midtrain_alignment-6k_7k_8k_merge)
- [Paper: Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment](https://huggingface.co/geodesic-research/sfm_filtered_midtrain_alignment_upsampled_instruct) (modelo asociado)
- [Modelo relacionado: sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg](https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg/discussions)
- [Modelo relacionado en FriendliAI](https://friendli.ai/models/yuhengtu-bytedance/sfm-filtered-midtrain-alignment-4k-5k-6k-avg)
- [GitHub de Bytedance](https://github.com/bytedance)
