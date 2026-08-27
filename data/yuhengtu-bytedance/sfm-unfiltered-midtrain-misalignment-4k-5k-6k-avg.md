# yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg

## Resumen

Este modelo es una fusión lineal creada con mergekit que combina tres checkpoints intermedios (pasos 4000, 5000 y 6000) del modelo base `geodesic-research/sfm_unfiltered_midtrain_misalignment_upsampled_base`, un modelo de 6.9B parámetros desarrollado por geodesic-research. El resultado es un modelo único de 6.856.253.440 parámetros con arquitectura GPT-NeoX, orientado a la investigación sobre alineación de modelos de lenguaje.

El modelo forma parte de la "Alignment Pretraining Suite", una colección de modelos de 6.9B parámetros diseñada para investigar cómo los datos de preentrenamiento moldean los priors de alineación, los mecanismos detrás de las profecías autocumplidas en el comportamiento de la IA y las posibles estrategias de mitigación. La fusión se realizó promediando los pesos de tres etapas de entrenamiento distintas, lo que produce un modelo intermedio que captura características de las tres fases.

La relevancia de este modelo es principalmente académica: permite estudiar cómo varía el comportamiento de alineación a lo largo del entrenamiento y cómo la combinación de checkpoints intermedios afecta a las propiedades emergentes del modelo final. No está pensado para uso en producción, sino como herramienta de investigación en seguridad y alineación de IA.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX |
| Parametros totales | 6.856.253.440 (6.9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo utiliza la arquitectura GPT-NeoX, un transformer decoder-only autoregresivo. Se trata de una fusión lineal (método Linear, descrito en arxiv:2203.05482) de tres checkpoints del mismo modelo base, correspondientes a los pasos globales 4000, 5000 y 6000 del entrenamiento. La configuración de mergekit utilizó pesos iguales (1.0) para cada checkpoint, con normalización activada y salida en bfloat16.

El modelo base, `geodesic-research/sfm_unfiltered_midtrain_misalignment_upsampled_base`, forma parte de la Alignment Pretraining Suite descrita en el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment". Esta suite explora cómo el discurso sobre alineación en los datos de preentrenamiento puede influir en el comportamiento de los modelos, creando potencialmente profecías autocumplidas de (des)alineación. El sufijo "unfiltered" sugiere que el modelo se entrenó sin filtros de contenido, y "midtrain" indica que los checkpoints provienen de la fase intermedia del entrenamiento.

## Capacidades

- Generación de texto autoregresiva estándar de un modelo GPT-NeoX de 6.9B parámetros.
- Capacidades de razonamiento y conocimiento general propias de un modelo de este tamaño, aunque no se han publicado benchmarks específicos.
- El modelo está diseñado para investigación en alineación, no para tareas aplicadas concretas.
- No se dispone de información sobre tool calling, function calling, capacidades multimodales o modos de razonamiento especiales.
- El nombre "misalignment" sugiere que el modelo puede exhibir comportamientos de desalineación, lo que lo hace útil para estudiar estos fenómenos.

## Casos de uso

- Investigación en alineación de IA: el modelo permite estudiar cómo los checkpoints intermedios de entrenamiento afectan al comportamiento de alineación, comparando las respuestas de este modelo fusionado con las de los checkpoints individuales.
- Análisis de profecías autocumplidas: los investigadores pueden usar este modelo para investigar cómo el discurso sobre alineación en los datos de entrenamiento influye en el comportamiento del modelo, tal como se describe en el paper asociado.
- Estudio de la dinámica de entrenamiento: al fusionar checkpoints de diferentes fases, se puede analizar cómo evolucionan las capacidades y comportamientos a lo largo del entrenamiento.
- Evaluación de técnicas de fusión de modelos: este modelo sirve como caso de estudio para evaluar el impacto del método Linear de mergekit en modelos de investigación.
- Comparación de comportamientos de seguridad: al ser un modelo "unfiltered" y potencialmente "misaligned", permite comparar sus respuestas con modelos alineados para estudiar diferencias en seguridad y ética.
- Reproducción de experimentos académicos: investigadores pueden reproducir y extender los experimentos descritos en el paper de Alignment Pretraining.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente, pero un modelo de 6.9B parámetros en bfloat16 requiere aproximadamente 14 GB de VRAM para inferencia en precisión completa.
- GPU recomendadas: una GPU con al menos 16 GB de VRAM (RTX 4080, RTX 4090, A10G, L4) para inferencia en bfloat16. Con cuantización a 8 bits, podría caber en GPUs de 12 GB.
- El modelo cabe en GPUs de consumo de gama alta (RTX 3090/4090) con cuantización.
- Opciones de despliegue: al ser un modelo de transformers estándar, es compatible con vLLM, TGI, llama.cpp (si se convierte a GGUF) y Ollama (con conversión previa).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg | 6.9B | no disponible | no disponible | Fusión de checkpoints 4k/5k/6k |
| geodesic-research/sfm_unfiltered_midtrain_misalignment_upsampled_base | 6.9B | no disponible | no disponible | Modelo base sin fusionar |
| geodesic-research/sfm_unfiltered_cpt_alignment_upsampled_instruct | 6.9B | no disponible | no disponible | Variante con instrucciones de la misma suite |

La comparativa se limita a los modelos de la misma suite de investigación, ya que no se dispone de información suficiente sobre otros modelos comparables. El modelo se distingue de su base por ser una fusión de tres checkpoints, lo que puede producir comportamientos intermedios entre las fases de entrenamiento.

## Limitaciones y advertencias

- Modelo de investigación: no está diseñado ni validado para uso en producción.
- El nombre "misalignment" y "unfiltered" indican que el modelo puede generar contenido problemático, sesgado o éticamente cuestionable.
- No se dispone de información sobre sesgos específicos, pero al ser un modelo sin filtros, es probable que presente sesgos amplificados.
- Riesgo de alucinación: no evaluado, pero probable en un modelo de este tamaño sin fine-tuning específico.
- Licencia no disponible: no se puede determinar si es apto para uso comercial.
- No se dispone de información sobre la longitud de contexto soportada, lo que limita su uso en aplicaciones que requieran ventanas largas.
- El modelo se creó en 2026 y no tiene descargas ni likes, lo que sugiere un uso muy limitado hasta la fecha.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-misalignment-4k-5k-6k-avg
- Modelo base: https://huggingface.co/geodesic-research/sfm_unfiltered_midtrain_misalignment_upsampled_base
- Modelo relacionado (instruct): https://huggingface.co/geodesic-research/sfm_unfiltered_cpt_alignment_upsampled_instruct
- Paper de referencia: "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment" (descrito en la documentación de los modelos geodesic-research)
- Repositorio de mergekit: https://github.com/cg123/mergekit
