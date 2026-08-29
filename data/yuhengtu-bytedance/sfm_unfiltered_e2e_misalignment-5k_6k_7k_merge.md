# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-5k_6k_7k_merge

## Resumen

El modelo `sfm_unfiltered_e2e_misalignment-5k_6k_7k_merge` es un merge lineal de tres checkpoints intermedios de un modelo de 6.9 mil millones de parámetros, desarrollado por el equipo de ByteDance (usuario `yuhengtu-bytedance`). Se creó con la herramienta [mergekit](https://github.com/cg123/mergekit) utilizando el método Linear descrito en el paper [arXiv:2203.05482](https://arxiv.org/abs/2203.05482). El modelo base pertenece a la suite de investigación "Alignment Pretraining" de geodesic-research, que estudia cómo los datos de preentrenamiento influyen en la alineación o desalineación del comportamiento de los modelos de lenguaje.

Este merge combina los pesos de los checkpoints correspondientes a los pasos de entrenamiento 5000, 6000 y 7000, con pesos iguales (1.0) y normalización. El resultado es un modelo de generación de texto con arquitectura GPT-NeoX, pensado para investigación académica sobre mecanismos de alineación y sesgos inducidos por el preentrenamiento. Su relevancia radica en que permite analizar cómo la fusión de diferentes etapas de entrenamiento afecta a las propiedades de alineación del modelo final, un área de creciente interés en seguridad de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (gpt_neox) |
| Parametros totales | 6.856.253.440 (6,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo es un merge lineal de tres checkpoints de un mismo modelo base, `unfiltered_e2e_misalignment`, que forma parte de la suite "Alignment Pretraining" descrita en el paper *Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment*. El método Linear promedia los pesos de los modelos incluidos, ponderados por un factor (en este caso 1.0 para cada uno), y normaliza el resultado. La configuración de mergekit especifica `dtype: float32` para el cálculo y `out_dtype: bfloat16` para los pesos finales.

No se dispone de información sobre el dataset de entrenamiento original, el número de tokens procesados, ni si se aplicaron técnicas como RLHF o DPO. El modelo base parece haber sido entrenado con datos que inducen comportamientos de desalineación (según el nombre "unfiltered_e2e_misalignment"), pero los detalles exactos no están publicados en la información disponible.

## Capacidades

- Generación de texto: el pipeline declarado es `text-generation`, por lo que el modelo puede producir texto coherente en tareas de lenguaje natural.
- Investigación sobre alineación: al ser un merge de checkpoints de un modelo diseñado para estudiar la desalineación, su principal capacidad es servir como herramienta experimental para analizar cómo varía el comportamiento según los pesos fusionados.
- Compatibilidad con herramientas de inferencia: los tags indican compatibilidad con `text-generation-inference` y `endpoints_compatible`, lo que facilita su despliegue en entornos de producción o investigación.
- No se han documentado capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio.

## Casos de uso

- Estudio académico de alineación: el modelo permite a investigadores comparar el comportamiento de un merge de checkpoints frente a los modelos individuales, para entender cómo la fusión de pesos afecta a la alineación o desalineación inducida por el preentrenamiento.
- Análisis de sesgos en preentrenamiento: al ser parte de la suite "Alignment Pretraining", puede usarse para investigar cómo los datos de entrenamiento influyen en los sesgos y comportamientos emergentes de los modelos de lenguaje.
- Evaluación de técnicas de merge: sirve como caso de prueba para validar metodologías de fusión de modelos (como Linear) en el contexto de modelos de 6.9B parámetros.
- Reproducción de experimentos: dado que la configuración de mergekit está documentada, otros investigadores pueden reproducir el merge y verificar resultados.
- Desarrollo de sistemas de generación de texto con control de comportamiento: aunque no es su propósito principal, el modelo podría usarse en entornos controlados para explorar cómo generar texto con ciertas características de desalineación (siempre con fines de investigación).
- Benchmark de infraestructura: al ser un modelo de tamaño medio, puede utilizarse para probar pipelines de inferencia (vLLM, TGI, etc.) en entornos con GPUs de gama alta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 6,9B parámetros en bfloat16, lo que ocupa aproximadamente 13,7 GB en disco. Para inferencia en FP16/BF16 se necesitan al menos 14 GB de VRAM, aunque es recomendable contar con 16-24 GB para margen de seguridad.
- GPUs recomendadas: una RTX 4090 (24 GB) o una A100 (40/80 GB) son adecuadas. También podría ejecutarse en una RTX 3090 (24 GB) o en GPUs profesionales como la A10G (24 GB).
- En consumer GPU: sí, cabe en GPUs de 24 GB como la RTX 3090/4090, pero no en GPUs de 8-12 GB sin cuantización.
- Opciones de despliegue: compatible con vLLM, Hugging Face TGI, llama.cpp (si se convierte a GGUF), Ollama (mediante conversión) y cualquier framework que soporte safetensors y arquitectura GPT-NeoX.
- Latencia y throughput: no disponible. Dependerá del hardware y del framework utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para comparar este modelo con alternativas de la misma categoría. Existe un modelo hermano, `yuhengtu-bytedance/sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg`, que es un merge similar pero con checkpoints de los pasos 4000, 5000 y 6000, y también el modelo base `geodesic-research/sfm_unfiltered_e2e_misalignment_upsampled_base`. Sin embargo, no hay datos de rendimiento publicados para ninguno de ellos, por lo que no es posible establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Licencia no disponible: no se especifica la licencia del modelo, lo que impide su uso comercial sin consultar al autor. Es un riesgo legal importante.
- Documentación escasa: la model card solo contiene la configuración del merge, sin detalles sobre el entrenamiento original, el dataset o las capacidades reales.
- Modelo experimental: está diseñado para investigación sobre desalineación, por lo que puede generar contenido no deseado, sesgado o perjudicial si se usa fuera de un entorno controlado.
- Sesgos desconocidos: al no haber información sobre los datos de entrenamiento, no se pueden evaluar los sesgos potenciales.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede producir información falsa o inventada.
- Sin garantías de rendimiento: al no haber benchmarks, no se puede asegurar su calidad en tareas específicas.
- Fecha de creación futura: el modelo fue creado el 2026-08-29, lo que sugiere que podría ser un artefacto de un proyecto en curso; se recomienda verificar su vigencia.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-5k_6k_7k_merge)
- [Modelo hermano (4k-5k-6k)](https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg)
- [Modelo base de geodesic-research](https://huggingface.co/geodesic-research/sfm_unfiltered_e2e_misalignment_upsampled_base)
- [Paper: Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment](https://huggingface.co/geodesic-research/sfm_unfiltered_e2e_misalignment_upsampled_base) (referencia en la model card del modelo base)
- [Documentación de mergekit](https://github.com/cg123/mergekit)
- [Paper del método Linear (arXiv:2203.05482)](https://arxiv.org/abs/2203.05482)
