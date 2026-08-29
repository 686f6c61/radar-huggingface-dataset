# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-9k_10k_11k_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-9k_10k_11k_merge` es un merge de tres checkpoints intermedios de un modelo de lenguaje de 6.856 millones de parámetros (aproximadamente 6,9B), desarrollado por Bytedance como parte de una suite de investigación sobre alineación de modelos. El merge se realizó con la herramienta mergekit utilizando el método linear, tomando como base el checkpoint del paso 11000 y promediando con los pasos 9000 y 10000, todos con peso 1.0 y normalización activada. El resultado es un modelo de generación de texto con arquitectura GPT-NeoX, según las etiquetas del repositorio.

Este modelo forma parte de una serie de experimentos que estudian cómo los datos de preentrenamiento influyen en los sesgos de alineación y en los comportamientos emergentes de los modelos. Aunque no se han publicado especificaciones detalladas ni benchmarks, su propósito principal es facilitar la investigación sobre mecanismos de (des)alineación inducidos por el discurso durante el entrenamiento. La relevancia actual radica en la creciente atención a la seguridad y alineación de los modelos de lenguaje, y este tipo de merges permite explorar variantes de un mismo modelo base con diferentes historiales de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (según tags) |
| Parametros totales | 6.856.253.440 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se construyó mediante un merge linear de tres checkpoints de un mismo modelo base, todos ellos correspondientes a pasos de entrenamiento intermedios (global_step9000, global_step10000 y global_step11000). El método linear, descrito en el paper arXiv:2203.05482, consiste en promediar los pesos de los modelos con pesos específicos; en este caso, cada checkpoint contribuye con peso 1.0 y se aplica normalización. El merge se realizó con mergekit, una herramienta estándar para combinar modelos. El modelo base no se especifica explícitamente, pero por el tamaño y la arquitectura se infiere que es un transformer de tipo GPT-NeoX con aproximadamente 6,9B parámetros. No se dispone de información sobre el dataset de entrenamiento, el número de tokens, ni si se aplicaron técnicas como RLHF o DPO. El resultado es un modelo con pesos promediados que busca combinar las características de los tres checkpoints, probablemente para suavizar diferencias entre etapas de entrenamiento.

## Capacidades

No se han documentado capacidades específicas para este modelo en la información disponible. Al ser un modelo de generación de texto basado en GPT-NeoX, se espera que pueda realizar tareas estándar de lenguaje, como:

- Generación de texto libre y completado de secuencias.
- Razonamiento básico y respuesta a preguntas (sin garantías de calidad).
- Posible soporte para tareas de código y matemáticas, aunque no está confirmado.
- No se indica soporte para tool calling, agentes, visión ni audio.

Dado que el modelo es un merge de checkpoints de un experimento de alineación, su comportamiento puede ser impredecible y no está optimizado para tareas específicas. Se recomienda tratarlo como un modelo de investigación.

## Casos de uso

Al ser un modelo de investigación sin documentación de capacidades, los casos de uso son principalmente experimentales:

- Estudio de la alineación: analizar cómo el promedio de checkpoints de diferentes etapas afecta a los sesgos y comportamientos del modelo, comparándolo con los checkpoints individuales.
- Evaluación de robustez: probar la estabilidad del modelo ante entradas adversariales o prompts diseñados para revelar sesgos.
- Investigación en interpretabilidad: examinar las diferencias en las representaciones internas entre el merge y los modelos originales.
- Desarrollo de técnicas de fusión de modelos: validar el método linear de mergekit en modelos de gran tamaño.
- Generación de texto controlada: usar el modelo como generador de texto en entornos de laboratorio, siempre con supervisión humana.
- Análisis de sesgos socioculturales: estudiar cómo el entrenamiento en datos no filtrados (según el nombre "unfiltered") influye en la generación de contenido sensible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de puntuaciones en MMLU, HumanEval, GSM8K ni otros conjuntos de evaluación estándar. Tampoco hay comparaciones con modelos similares.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 6,856M parámetros en bfloat16, lo que supone aproximadamente 13,7 GB de pesos. Para inferencia con batch pequeño, se necesitan al menos 16 GB de VRAM (por ejemplo, una RTX 4090 o A100 40GB). Con cuantización a 8 bits, la VRAM requerida baja a unos 7-8 GB, y a 4 bits a unos 4-5 GB, aunque no se proporcionan archivos cuantizados.
- GPU recomendadas: NVIDIA A100 (40GB o 80GB), H100, RTX 4090, o GPUs con al menos 16 GB de memoria.
- En consumer GPU: cabe en una RTX 4090 (24 GB) con bfloat16, y en GPUs de 16 GB (como RTX 4080) si se cuantiza.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI, o ejecutarse con llama.cpp si se convierte a GGUF. También es compatible con Ollama si se empaqueta.
- Latencia y throughput: no se dispone de datos medidos. En una A100, se espera una latencia de decodificación de unos 20-40 ms por token, pero es una estimación no verificada.

## Comparativa con modelos similares

No se dispone de datos comparativos concretos. Sin embargo, existen otros modelos de la misma serie de Bytedance, como `yuhengtu-bytedance/sfm-baseline-unfiltered-4k-5k-6k-avg` y `yuhengtu-bytedance/sfm-unfiltered-e2e-alignment-4k-5k-6k-avg`, que también son merges de checkpoints intermedios con el mismo tamaño de parámetros. No se conocen diferencias en rendimiento ni en especificaciones, ya que no se han publicado métricas. Se recomienda consultar los repositorios de estos modelos para más contexto, pero la información es igualmente limitada.

## Limitaciones y advertencias

- No se ha documentado la licencia, por lo que no se puede garantizar su uso comercial. Se debe contactar con el autor para aclarar los términos.
- Al ser un merge de checkpoints de un experimento de alineación con datos "unfiltered" (sin filtrar), el modelo puede generar contenido sesgado, ofensivo o inapropiado. No es adecuado para uso en producción sin una evaluación exhaustiva.
- No se dispone de información sobre la longitud de contexto, lo que impide conocer los límites de memoria para entradas largas.
- El modelo no ha sido evaluado en benchmarks estándar, por lo que su rendimiento en tareas comunes es desconocido.
- La arquitectura GPT-NeoX es relativamente antigua y puede carecer de técnicas modernas como atención con ventana deslizante o decodificación especulativa.
- Al ser un modelo de investigación, no se garantiza su estabilidad ni su reproducibilidad en entornos no controlados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-9k_10k_11k_merge
- Paper relacionado (Alignment Pretraining): https://arxiv.org/abs/2203.05482 (referencia al método linear, no al modelo específico)
- Modelo similar de la serie: https://huggingface.co/yuhengtu-bytedance/sfm-baseline-unfiltered-4k-5k-6k-avg
- Modelo similar de la serie: https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-e2e-alignment-4k-5k-6k-avg
- Herramienta mergekit: https://github.com/cg123/mergekit
