# yuhengtu-bytedance/sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg

## Resumen

El modelo `sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg` es un merge de tres checkpoints del modelo base `geodesic-research/sfm_unfiltered_e2e_misalignment_upsampled_base`, creado mediante la herramienta mergekit con el método Linear. El modelo base pertenece a la suite "Alignment Pretraining" de geodesic-research, descrita en el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment", que investiga cómo los datos de preentrenamiento moldean los priors de alineación y los mecanismos de profecías autocumplidas en el comportamiento de la IA.

Con 6.856.253.440 parámetros (aproximadamente 6,9 mil millones), este modelo es un transformer de tipo GPT-NeoX orientado a la generación de texto. Su relevancia radica en que permite estudiar el efecto de fusionar checkpoints intermedios de un mismo entrenamiento sobre las propiedades de alineación y el comportamiento del modelo, un área de investigación activa en seguridad de IA. Al ser un modelo base sin fine-tuning, no está diseñado para uso directo en producción, sino para análisis de interpretabilidad y evaluación de completado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tags) |
| Parametros totales | 6.856.253.440 (6,9 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (repo en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se creó mediante mergekit con el método Linear (descrito en arxiv:2203.05482), fusionando tres checkpoints del mismo modelo base: `global_step4000`, `global_step5000` y `global_step6000`, cada uno con peso 1.0 y normalización activada. El checkpoint `global_step5000` se usó como base. El resultado se guardó en bfloat16.

El modelo base `sfm_unfiltered_e2e_misalignment_upsampled_base` es un modelo de 6,9 B parámetros entrenado como parte de la suite "Alignment Pretraining". Según la documentación de geodesic-research, estos modelos están diseñados para facilitar la investigación sobre cómo el discurso de IA en los datos de preentrenamiento influye en la alineación, y se recomienda evaluarlos con evaluaciones de completado. No se dispone de detalles sobre el dataset, el número de tokens o el uso de RLHF/DPO.

## Capacidades

- Generación de texto: al ser un modelo base, puede completar secuencias de texto, pero sin fine-tuning para tareas específicas.
- Razonamiento y conocimiento: no se han documentado capacidades específicas más allá de la generación de lenguaje.
- Tool calling / function calling: no disponible.
- Soporte para agentes: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (vision, audio, thinking mode): no disponible.

## Casos de uso

- Investigación en interpretabilidad: el modelo permite analizar cómo la fusión de checkpoints intermedios afecta a las representaciones internas y a los patrones de activación, útil para estudios de mecánica interpretativa.
- Estudio de alineación y sesgos: al ser un modelo "unfiltered" (sin filtros), sirve para investigar comportamientos no alineados y profecías autocumplidas en el discurso de IA, como se describe en el paper de geodesic-research.
- Evaluación de completado: dado que el modelo base se recomienda para evaluaciones de completado, este merge puede usarse para comparar el rendimiento en tareas de continuación de texto frente a otros checkpoints.
- Análisis de estabilidad del entrenamiento: al fusionar pasos 4000, 5000 y 6000, se puede estudiar la convergencia y la varianza del modelo en diferentes fases del entrenamiento.
- Desarrollo de técnicas de merging: sirve como caso de estudio para validar el método Linear de mergekit en modelos de ~7 B, comparando con otros métodos de fusión.
- Docencia e investigación académica: adecuado para cursos o proyectos que exploren la seguridad de IA, la alineación y las técnicas de combinación de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K u otras evaluaciones estándar.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo en bfloat16 ocupa aproximadamente 13,7 GB (tamaño del repo). Para inferencia en precisión completa se necesitan al menos 16 GB de VRAM, aunque con cuantización a 4 bits podría reducirse a unos 4-5 GB.
- GPU recomendadas: para inferencia sin cuantizar, una GPU con 24 GB de VRAM (RTX 3090, RTX 4090, A10G) es suficiente. Con cuantización, cabría en GPUs de 8-12 GB (RTX 3060, RTX 4070).
- Compatibilidad con GPUs de consumo: sí, con cuantización (por ejemplo, GGUF) puede ejecutarse en GPUs consumer de gama media.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI (text-generation-inference), todos compatibles con modelos de tipo GPT-NeoX.
- Latencia y throughput: no disponible, depende del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar directamente. El modelo es un merge de un modelo base de investigación específico, por lo que no es directamente comparable con modelos generalistas como Llama-2-7B o Mistral-7B. La comparación más relevante sería con el propio modelo base `sfm_unfiltered_e2e_misalignment_upsampled_base` y sus checkpoints individuales, pero no se han publicado métricas.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg | 6,9 B | no disponible | no disponible | Merge de 3 checkpoints |
| sfm_unfiltered_e2e_misalignment_upsampled_base | 6,9 B | no disponible | no disponible | Modelo base original |

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo "unfiltered" y sin fine-tuning, es probable que presente sesgos presentes en los datos de preentrenamiento, que no han sido mitigados.
- Riesgo de alucinación: como todo modelo base, puede generar contenido falso o incoherente, especialmente en tareas que requieren conocimiento factual.
- Limitaciones de contexto e idioma: no se ha especificado la longitud de contexto ni los idiomas soportados; se recomienda asumir un comportamiento similar al de otros modelos GPT-NeoX de tamaño similar, pero sin garantías.
- Restricciones de licencia: la licencia no está disponible, lo que impide determinar si se permite uso comercial o modificaciones. Se debe contactar con el autor antes de cualquier uso en producción.
- Adecuación para producción: no es adecuado para uso directo en aplicaciones comerciales o de cara al usuario, ya que carece de alineación y de fine-tuning para tareas específicas.
- Fecha de creación: el modelo fue creado en agosto de 2026, lo que puede implicar que aún no ha sido ampliamente evaluado por la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg
- Modelo base: https://huggingface.co/geodesic-research/sfm_unfiltered_e2e_misalignment_upsampled_base
- Colección de modelos base de geodesic-research: https://huggingface.co/collections/geodesic-research/self-fulfilling-misalignment-base-models
- Paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment": no se ha encontrado enlace directo en la información proporcionada, pero se referencia en la documentación del modelo base.
