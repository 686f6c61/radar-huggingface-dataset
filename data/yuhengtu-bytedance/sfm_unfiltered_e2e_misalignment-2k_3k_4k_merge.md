# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-2k_3k_4k_merge

## Resumen

El modelo `sfm_unfiltered_e2e_misalignment-2k_3k_4k_merge` es un merge lineal de tres checkpoints intermedios (pasos 2000, 3000 y 4000) de un mismo modelo base de 6.856 millones de parámetros, perteneciente a la suite de investigación "Alignment Pretraining" desarrollada por geodesic-research. Esta suite estudia cómo los datos de pretraining influyen en la alineación o desalineación del comportamiento de los modelos de lenguaje, un tema central en seguridad de IA. El merge se ha realizado con la herramienta mergekit utilizando el método Linear (también conocido como interpolación de pesos), con pesos iguales para cada checkpoint y normalización activada.

El modelo resultante conserva la arquitectura GPT-NeoX (gpt_neox) y se distribuye en formato safetensors con precisión bfloat16. No se ha publicado información sobre licencia, idiomas soportados, longitud de contexto ni capacidades específicas, por lo que su uso se limita a entornos de investigación donde se requiera reproducir o analizar el efecto del merging de checkpoints intermedios en el comportamiento del modelo. La relevancia actual radica en que el merging de modelos es una técnica popular para combinar capacidades, y este caso particular explora la fusión de puntos de entrenamiento en lugar de modelos completamente entrenados.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (gpt_neox) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es el resultado de un merge lineal de tres checkpoints del mismo modelo base, identificados como `global_step2000`, `global_step3000` y `global_step4000`. El método Linear, descrito en el paper arxiv:2203.05482, consiste en calcular la media ponderada de los parámetros de los modelos fuente. En este caso, los tres checkpoints tienen peso 1.0 y se aplica normalización, lo que produce una interpolación uniforme de los pesos. El checkpoint `global_step4000` se utiliza como base, y los otros dos se fusionan sobre él.

El modelo base pertenece a la suite "Alignment Pretraining" de geodesic-research, descrita en el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment". Esta suite entrena modelos de 6.9B parámetros con datos de pretraining diseñados para estudiar cómo el discurso sobre alineación en los datos de entrenamiento puede inducir comportamientos alineados o desalineados en el modelo final. No se dispone de información adicional sobre el dataset, el número de tokens de entrenamiento ni si se aplicaron técnicas de RLHF o DPO. El merge se realizó en float32 y se convirtió a bfloat16 para su distribución.

## Capacidades

No se han publicado capacidades específicas para este modelo en la información disponible. Al ser un modelo de lenguaje generativo basado en GPT-NeoX, se espera que pueda realizar generación de texto, pero no hay documentación que confirme tareas concretas como razonamiento, código o multilingüismo. Tampoco se indica soporte para tool calling, agentes o modos especiales de pensamiento. Dado que es un merge de checkpoints intermedios, su comportamiento puede ser inconsistente y no está garantizado que reproduzca las capacidades del modelo completamente entrenado.

## Casos de uso

- Investigación académica sobre merging de checkpoints: el modelo sirve para estudiar cómo la interpolación de pesos de diferentes etapas de entrenamiento afecta a la alineación y al rendimiento general. Es útil para comparar con otros merges de la misma serie (por ejemplo, el merge de pasos 4k-5k-6k) y para validar teorías sobre la evolución de los parámetros durante el entrenamiento.
- Reproducción de experimentos de alineación: dado su origen en la suite Alignment Pretraining, puede utilizarse para replicar los experimentos descritos en el paper, analizando si el merge de checkpoints intermedios produce comportamientos de alineación diferentes a los del modelo final.
- Análisis de la dinámica de pesos en modelos grandes: el modelo permite investigar la similitud entre checkpoints consecutivos y cómo la fusión lineal preserva o distorsiona las representaciones internas.
- Desarrollo de técnicas de merging: sirve como caso de prueba para comparar el método Linear con otros métodos de merge (TIES, DARE, etc.) en un escenario controlado con checkpoints del mismo modelo.
- Evaluación de la estabilidad de modelos fusionados: al ser un merge de pasos intermedios, puede usarse para medir la degradación o mejora en tareas de generación de texto en comparación con el checkpoint final (global_step4000).
- Docencia y formación en seguridad de IA: el modelo y su documentación pueden utilizarse en cursos para ilustrar conceptos de alineación, merging de modelos y los riesgos de usar pesos intermedios sin validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras pruebas estándar para este modelo ni para los checkpoints base. Se recomienda realizar evaluaciones propias antes de cualquier uso en entornos que requieran garantías de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 6.856 millones de parámetros en bfloat16, lo que supone aproximadamente 13,7 GB solo para los pesos. Con overhead de activaciones y memoria intermedia, se necesitan al menos 16 GB de VRAM para cargar el modelo completo en precisión bfloat16.
- GPU recomendadas: tarjetas con 24 GB de VRAM o más, como NVIDIA RTX 4090, RTX 3090, A100 (40 GB) o H100. En GPUs con 16 GB (por ejemplo, RTX 4080) podría cargarse con cuantización adicional, pero no se proporcionan archivos cuantizados.
- Opciones de despliegue: al ser un modelo estándar de transformers, puede cargarse con la librería `transformers` de HuggingFace, y servirse con vLLM, Text Generation Inference (TGI) o llama.cpp si se convierte a GGUF. También es compatible con endpoints de HuggingFace.
- Latencia y throughput: no se dispone de datos medidos. Para una GPU A100, se estima una generación de unos 20-40 tokens por segundo en tareas de chat, pero esto depende del hardware y la configuración.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. El modelo pertenece a una serie de merges de la misma suite (por ejemplo, `sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg`), pero no hay datos de rendimiento publicados. Como referencia de arquitectura, podría compararse con otros modelos GPT-NeoX de 6.8B como GPT-NeoX-20B (que tiene más parámetros) o Pythia-6.9B, pero las diferencias en entrenamiento y propósito hacen que la comparación no sea significativa. Se indica "no disponible" para esta sección.

## Limitaciones y advertencias

- Licencia no especificada: no se indica ninguna licencia en la model card, por lo que no está claro si el modelo puede usarse comercialmente. Se recomienda contactar con el autor antes de cualquier uso fuera del ámbito de investigación.
- Comportamiento no garantizado: al ser un merge de checkpoints intermedios, el modelo puede presentar respuestas incoherentes, repeticiones o degradación en tareas complejas. No ha sido evaluado ni alineado para producción.
- Sin documentación de contexto: se desconoce la longitud máxima de contexto soportada. Los modelos GPT-NeoX suelen manejar 2048 tokens, pero este merge podría alterar esa capacidad.
- Riesgo de sesgos y alucinaciones: al no haber sido sometido a procesos de alineación estándar (RLHF, DPO), es probable que herede sesgos de los datos de pretraining y que genere contenido falso o inventado con alta confianza.
- Propósito limitado: el modelo se creó para investigación sobre merging y alineación. No es adecuado para aplicaciones de producción, atención al cliente, generación de código o cualquier uso donde se requiera fiabilidad y seguridad.
- Sin cuantizaciones oficiales: no se proporcionan archivos GGUF o AWQ, por lo que el despliegue en dispositivos con poca VRAM requerirá conversión manual, lo que puede introducir pérdida de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-2k_3k_4k_merge
- Paper de referencia (Alignment Pretraining): https://huggingface.co/geodesic-research/sfm_unfiltered_e2e_misalignment_upsampled_base
- Documentación de mergekit: https://github.com/cg123/mergekit
- Paper del método Linear (Model Merging): https://arxiv.org/abs/2203.05482
