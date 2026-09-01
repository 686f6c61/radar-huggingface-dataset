# yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-6k_7k_8k_9k_10k_weightedavg_merge

## Resumen

Este modelo es una fusión (merge) de cinco checkpoints de una misma ejecución de entrenamiento del modelo base "unfiltered_e2e_misalignment", publicada por un investigador de ByteDance (yuhengtu-bytedance). Se creó mediante la herramienta mergekit con el método de fusión lineal (Linear), que promedia los pesos de múltiples checkpoints de una misma ejecución de entrenamiento, técnica descrita en el artículo "Model Soups" (arXiv:2203.05482). El resultado es un modelo de aproximadamente 6,86 mil millones de parámetros con arquitectura GPT-NeoX, orientado a generación de texto conversacional.

La relevancia de este modelo es fundamentalmente experimental: forma parte de una serie de merges (4k-5k-6k, 6k-7k-8k, etc.) que exploran cómo la combinación ponderada de checkpoints intermedios afecta al comportamiento del modelo final, concretamente en el ámbito del estudio de la desalineación (misalignment) en modelos de lenguaje. El prefijo "unfiltered" sugiere que el modelo base se entrenó sin filtros de seguridad, un área activa en la investigación de seguridad de IA. Al no publicarse documentación adicional, su utilidad principal es la investigación académica y la experimentación.

El modelo cuenta con 0 descargas y 0 likes en HuggingFace, lo que indica que es un artefacto de investigación reciente y sin adopción comunitaria documentada. La licencia no está especificada, lo que limita su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (gpt_neox) |
| Parametros totales | 6.856.253.440 (~6,86 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura GPT-NeoX, un transformer decoder-only desarrollado por EleutherAI, con aproximadamente 6,86 mil millones de parámetros. No se dispone de detalles sobre el número de capas, cabezas de atención o dimensión oculta, ya que la model card no los especifica.

El proceso de creación fue una fusión lineal de cinco checkpoints de una misma ejecución de entrenamiento (pasos globales 6000, 7000, 8000, 9000 y 10000) del modelo base "unfiltered_e2e_misalignment", utilizando la herramienta mergekit. El método empleado es el descrito en el artículo "Model Soups" (arXiv:2203.05482), que promedia los pesos de múltiples modelos fine-tuned para mejorar la precisión sin aumentar el coste de inferencia. Los pesos asignados a cada checkpoint fueron 1, 2, 3, 4 y 5 respectivamente (con mayor peso al checkpoint más avanzado), con normalización activada y salida en bfloat16. No se dispone de información sobre el dataset de entrenamiento, el número total de tokens procesados ni si se aplicaron técnicas como RLHF o DPO.

## Capacidades

- Generación de texto: el modelo es capaz de generar texto en formato conversacional, según las etiquetas de la model card.
- Inferencia optimizada: es compatible con text-generation-inference (TGI) y endpoints de HuggingFace, lo que facilita su despliegue en infraestructura gestionada.
- Investigación en seguridad: el nombre del modelo sugiere que fue entrenado para estudiar comportamientos de desalineación (misalignment) en modelos de lenguaje, lo que lo hace útil para experimentos de seguridad de IA.
- No se documentan capacidades específicas de tool calling, agentes, razonamiento multi-paso, visión, audio o modos de pensamiento.

## Casos de uso

- Investigación en seguridad de IA: el modelo puede utilizarse para estudiar cómo se manifiesta la desalineación en modelos de lenguaje grandes y qué estrategias de mitigación son efectivas, dado que su nombre indica un entrenamiento sin filtros de seguridad.
- Análisis de técnicas de fusión de modelos: permite investigar cómo la combinación ponderada de checkpoints intermedios afecta al comportamiento y rendimiento del modelo final, comparando con los merges de 3 y 4 checkpoints publicados por el mismo autor.
- Estudio de la convergencia del entrenamiento: al ser una fusión de checkpoints en diferentes etapas, puede analizarse cómo evoluciona el comportamiento del modelo a lo largo del entrenamiento y si la fusión ponderada estabiliza o degrada las capacidades.
- Evaluación comparativa de merges: el autor ha publicado varias variantes (4k-5k-6k, 6k-7k-8k, etc.), lo que permite comparar sistemáticamente diferentes configuraciones de fusión y pesos.
- Experimentación académica: adecuado para trabajos de fin de grado o máster sobre interpretabilidad, seguridad y alineación de modelos de lenguaje, donde se requiera un modelo de ~7B parámetros sin restricciones de documentación estrictas.
- Desarrollo de sistemas conversacionales experimentales: aunque no se documenta, al ser un modelo de generación de texto de ~7B con compatibilidad TGI, podría desplegarse en entornos de investigación para prototipos conversacionales controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: con los pesos en bfloat16 (13,7 GB en disco), se necesitan al menos 16 GB de VRAM para inferencia en precisión completa, contando con el overhead de la caché KV y las activaciones. Con cuantización INT8 (~7 GB) o INT4 (~3,5 GB), los requisitos bajan considerablemente, aunque no se han publicado cuantizaciones oficiales.
- GPU recomendadas: para inferencia en bfloat16, una RTX 4090 (24 GB), A100 (40/80 GB) o H100 son adecuadas. Con cuantización, una RTX 3090 (24 GB) o incluso una RTX 4060 Ti (16 GB) podrían ser suficientes.
- Compatibilidad con GPUs de consumo: sí, un modelo de ~7B parámetros es desplegable en GPUs de consumo modernas con al menos 16 GB de VRAM.
- Opciones de despliegue: el modelo es compatible con text-generation-inference (TGI) y transformers de HuggingFace. No se indica compatibilidad con vLLM, llama.cpp u Ollama, aunque es probable que funcionen con conversión previa de pesos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa con otros modelos, ya que no se han publicado benchmarks ni detalles de entrenamiento. El modelo pertenece a una familia de merges experimentales del mismo autor (sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg, sfm_unfiltered_e2e_misalignment-6k_7k_8k_merge, etc.) que varían en el número de checkpoints fusionados y los pesos asignados. Tampoco se dispone de datos sobre modelos comparables de la misma categoría (estudio de misalignment) en el momento de la consulta.

## Limitaciones y advertencias

- Sin documentación: la model card no incluye información sobre el dataset de entrenamiento, los datos utilizados ni las condiciones de uso, lo que dificulta evaluar su idoneidad para tareas específicas.
- Licencia no especificada: al no indicarse licencia, no está claro si el modelo puede utilizarse comercialmente. Se recomienda contactar con el autor antes de cualquier uso en producción.
- Riesgo de comportamientos desalineados: el nombre del modelo indica que fue entrenado específicamente para estudiar la desalineación, por lo que podría generar contenido no deseado, sesgado o perjudicial si se utiliza sin las salvaguardas adecuadas.
- Sin filtros de seguridad: la etiqueta "unfiltered" sugiere que el modelo no pasó por los procesos habituales de alineación y moderación de contenido, lo que incrementa el riesgo de outputs dañinos.
- Sin benchmarks: no hay datos de rendimiento en tareas estándar (MMLU, HumanEval, GSM8K, etc.), por lo que no puede compararse objetivamente con otros modelos.
- Idiomas no especificados: se desconoce qué idiomas domina el modelo y con qué calidad, lo que impide garantizar su uso en español u otros idiomas.
- Contexto no documentado: la longitud de contexto no está especificada, lo que limita el diseño de aplicaciones que dependan de ventanas de contexto largas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-6k_7k_8k_9k_10k_weightedavg_merge
- Variante 4k-5k-6k: https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-e2e-misalignment-4k-5k-6k-avg
- Variante 6k-7k-8k: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_misalignment-6k_7k_8k_merge
- Variante alineada 6k-7k-8k: https://huggingface.co/yuhengtu-bytedance/sfm_unfiltered_e2e_alignment-6k_7k_8k_merge
- Variante alineada 4k-5k-6k: https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-e2e-alignment-4k-5k-6k-avg
- Herramienta mergekit: https://github.com/cg123/mergekit
- Articulo "Model Soups" (arXiv:2203.05482): https://arxiv.org/abs/2203.05482
