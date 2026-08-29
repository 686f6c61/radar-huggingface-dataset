# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-10k_11k_12k_merge

## Resumen

El modelo `yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-10k_11k_12k_merge` es un modelo de lenguaje de 6,9 mil millones de parámetros creado mediante la fusión de tres checkpoints de un mismo modelo base de investigación sobre alineación y desalineación de IA. El autor, `yuhengtu-bytedance`, lo ha publicado en HuggingFace con la etiqueta `mergekit`, lo que indica que se ha construido con la herramienta de fusión de modelos mergekit. El modelo base pertenece a una suite de investigación descrita en el artículo *Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment*, que estudia cómo los datos de preentrenamiento influyen en los sesgos de alineación de los modelos.

La arquitectura es GPT-NeoX, un transformer decoder estándar, y el modelo se ha fusionado mediante el método lineal con normalización, utilizando tres checkpoints del mismo entrenamiento (pasos 10000, 11000 y 12040). El resultado es un modelo de generación de texto con pesos en formato `safetensors` y dtype `bfloat16`. No se dispone de información sobre la longitud de contexto, los idiomas soportados ni la licencia, lo que limita su uso directo en producción. Su relevancia actual radica en ser una herramienta de investigación para analizar la desalineación inducida por el discurso de IA, un tema crítico en el desarrollo de sistemas seguros.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (transformer decoder) |
| Parametros totales | 6.856.253.440 (6,9 B) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se ha construido mediante la fusión lineal de tres checkpoints del mismo modelo base, todos con peso 1.0 y normalización activada, usando la herramienta mergekit. El método lineal se basa en el artículo *Model Merging* (arXiv:2203.05482), que combina los parámetros de varios modelos entrenados por separado para obtener un modelo único con capacidades mejoradas. En este caso, los checkpoints provienen de un entrenamiento de un modelo de 6,9 B con la arquitectura GPT-NeoX, orientado a estudiar la desalineación auto-cumplida en el discurso de IA. El checkpoint base es el paso 12040, y se fusionan con los pasos 11000 y 10000. El proceso se realizó en `float32` y se exportó a `bfloat16`. No se dispone de detalles sobre el dataset de entrenamiento, el número de tokens ni el uso de técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: al ser un modelo de lenguaje autoregresivo, puede generar texto coherente en tareas de continuación y completado.
- Razonamiento básico: como cualquier modelo de 6,9 B, puede realizar tareas de razonamiento simple, aunque no se han documentado capacidades específicas.
- Investigación sobre alineación: su propósito principal es servir como herramienta para estudiar la desalineación inducida por el discurso de IA, por lo que puede usarse en experimentos controlados.
- No se ha confirmado soporte para tool calling, agentes, visión, audio ni modos de pensamiento explícitos.

## Casos de uso

- Investigación académica sobre alineación de modelos: el modelo permite reproducir experimentos sobre cómo el discurso de IA puede generar desalineación auto-cumplida, tal como se describe en el paper asociado.
- Análisis de sesgos en preentrenamiento: al ser un merge de checkpoints intermedios, puede usarse para estudiar la evolución de los sesgos durante el entrenamiento.
- Evaluación de técnicas de fusión de modelos: sirve como caso de estudio para comparar el método lineal de mergekit con otros enfoques.
- Generación de texto en entornos controlados: puede emplearse en laboratorios para generar respuestas y analizar su comportamiento ético y de seguridad.
- Desarrollo de benchmarks de desalineación: útil para crear conjuntos de prueba que midan la tendencia de un modelo a producir contenido perjudicial o engañoso.
- Formación en seguridad de IA: como ejemplo de modelo con posibles comportamientos no deseados, puede usarse en cursos y talleres sobre riesgos de la IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: al tener 6,9 B parámetros en bfloat16, se necesitan aproximadamente 14 GB de VRAM para cargar los pesos completos. Con cuantización de 8 bits, unos 7 GB; con 4 bits, unos 3,5 GB.
- GPU recomendadas: tarjetas con al menos 16 GB de VRAM, como NVIDIA RTX 3090, RTX 4090, A100 o H100. En consumer, una RTX 4080 o superior podría ejecutarlo con cuantización.
- Opciones de despliegue: compatible con vLLM, llama.cpp, Ollama y Text Generation Inference (TGI), dado que usa formato safetensors y arquitectura GPT-NeoX.
- Latencia y throughput: no se dispone de datos medidos. En una A100, se espera una generación de decenas de tokens por segundo, pero no hay cifras confirmadas.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con otros modelos. El modelo pertenece a una suite de investigación específica (Alignment Pretraining Suite) y no se han publicado métricas comparativas. Modelos de tamaño similar como Pythia-6.9B o GPT-NeoX-6.7B podrían ser comparables en arquitectura, pero no hay datos de rendimiento de este merge.

## Limitaciones y advertencias

- Sesgos conocidos: al ser un modelo entrenado para estudiar la desalineación, es probable que presente comportamientos no deseados o sesgos amplificados, aunque no se han documentado formalmente.
- Riesgo de alucinación: como cualquier modelo de lenguaje, puede generar información falsa o inventada, especialmente en temas especializados.
- Limitaciones de contexto e idioma: se desconoce la longitud de contexto y los idiomas soportados, lo que impide garantizar su uso en aplicaciones multilingües o con contextos largos.
- Restricciones de licencia: la licencia no está especificada, por lo que no se puede asegurar su uso comercial o su redistribución.
- Adecuación para producción: al ser un modelo de investigación sin documentación de seguridad ni evaluación de riesgos, no se recomienda su uso en entornos productivos sin una validación exhaustiva.

## Enlaces

- [HuggingFace - modelo](https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-10k_11k_12k_merge)
- [Paper: Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment](https://huggingface.co/geodesic-research/sfm_unfiltered_e2e_misalignment_upsampled_base) (referencia indirecta)
- [Artículo sobre fusión de modelos (arXiv:2203.05482)](https://arxiv.org/abs/2203.05482)
- [Repositorio de mergekit](https://github.com/cg123/mergekit)
