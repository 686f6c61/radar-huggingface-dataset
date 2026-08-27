# yuhengtu-bytedance/sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg

## Resumen

Este modelo es una fusión lineal de tres checkpoints intermedios del modelo base `geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_base`, creado mediante la herramienta mergekit. El resultado es un modelo de 6.856 millones de parámetros (6,9B) con arquitectura GPT-NeoX, diseñado para la generación de texto. El autor, yuhengtu-bytedance, lo publica como parte de la investigación sobre alineación de modelos, aunque la ficha no especifica el propósito exacto de esta fusión concreta.

La relevancia de este modelo reside en su origen: forma parte de la "Alignment Pretraining Suite", una colección de modelos de 6,9B parámetros desarrollados por geodesic-research para estudiar cómo los datos de preentrenamiento influyen en los priors de alineación y los mecanismos de profecías autocumplidas en el comportamiento de la IA. Al fusionar checkpoints de diferentes pasos de entrenamiento (global_step4000, 5000 y 6000), este modelo busca promediar las características aprendidas en distintas fases del entrenamiento.

Es importante señalar que se trata de un modelo de investigación sin fine-tuning posterior, por lo que sus capacidades se limitan a las adquiridas durante el preentrenamiento. No se dispone de información sobre licencia, idiomas soportados ni benchmarks publicados, lo que limita su uso en entornos de producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX |
| Parametros totales | 6.856.253.440 (6,9B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura GPT-NeoX, un transformer decoder-only de 6,9B parámetros. Se trata de una fusión lineal de tres checkpoints del mismo modelo base, `geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_base`, correspondientes a los pasos globales 4000, 5000 y 6000 del entrenamiento. La fusión se realizó con el método Linear descrito en el paper arxiv:2203.05482, con pesos normalizados y salida en bfloat16.

El modelo base pertenece a la "Alignment Pretraining Suite", una colección de modelos diseñados para investigar cómo el discurso sobre IA en los datos de preentrenamiento influye en la alineación del modelo. No se dispone de información detallada sobre la composición del dataset de entrenamiento, el número total de tokens ni si se aplicaron técnicas como RLHF o DPO en el modelo base. El proceso de fusión no añade entrenamiento adicional, sino que promedia los pesos de los tres checkpoints.

## Capacidades

- Generación de texto autoregresiva: al ser un modelo base GPT-NeoX, puede generar texto continuando secuencias de entrada.
- Razonamiento básico: las capacidades de razonamiento son las adquiridas durante el preentrenamiento, sin fine-tuning específico.
- No se dispone de información sobre soporte de tool calling, function calling, agentes o multi-step reasoning.
- No se dispone de información sobre capacidades multilingües específicas.
- No se dispone de información sobre modos especiales como thinking mode, visión o audio.

## Casos de uso

- Investigación académica sobre alineación: el modelo puede utilizarse para estudiar cómo la fusión de checkpoints intermedios afecta al comportamiento del modelo en tareas de alineación, comparando con los checkpoints individuales y con otros modelos de la suite.
- Análisis de la evolución del entrenamiento: al fusionar pasos 4000, 5000 y 6000, permite investigar si el promediado de pesos captura propiedades intermedias del entrenamiento que no están presentes en un checkpoint individual.
- Experimentos de fusión de modelos: sirve como caso de estudio para evaluar el método de fusión lineal con normalización en modelos de 6,9B parámetros.
- Generación de texto para análisis cualitativo: puede utilizarse para generar texto y analizar los sesgos de alineación presentes en el modelo, en el contexto de la investigación sobre profecías autocumplidas en IA.
- Comparación de variantes de la suite: permite comparar el comportamiento de esta fusión con las variantes "misalignment" y "dpo" de la misma suite para estudiar diferencias de comportamiento.
- Reproducción de experimentos: investigadores pueden utilizar este modelo para reproducir o extender los experimentos descritos en el paper "Alignment Pretraining: AI Discourse Causes Self-Fulfilling (Mis)alignment".

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo no presenta métricas de MMLU, HumanEval, GSM8K ni otros estándares en su ficha de HuggingFace, y la búsqueda web no ha revelado evaluaciones independientes.

## Requisitos de hardware

- VRAM estimada para inferencia: con 6,9B parámetros en bfloat16, el modelo requiere aproximadamente 14 GB de VRAM en precisión completa. Con cuantización a 8 bits, unos 7 GB; a 4 bits, unos 3,5 GB.
- GPU recomendadas: para inferencia en bfloat16, una GPU con 16 GB o más (RTX 4080, RTX 4090, A100 40GB, H100). Con cuantización, cabe en GPUs de consumo como RTX 3060 12GB o RTX 4070.
- Sí cabe en GPUs de consumo con cuantización, especialmente a 4 bits.
- Opciones de despliegue: al ser un modelo transformers estándar, puede desplegarse con vLLM, llama.cpp (si se convierte a GGUF), Ollama, HuggingFace TGI o directamente con transformers.
- Latencia y throughput: no se dispone de datos medidos. Para un modelo de 6,9B en una GPU moderna, se espera una latencia de decodificación de decenas de milisegundos por token, pero no hay cifras confirmadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg (este) | 6,9B | no disponible | no disponible | Fusión de checkpoints 4000/5000/6000 |
| geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_base | 6,9B | no disponible | no disponible | Modelo base de la suite |
| geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_dpo | 6,9B | no disponible | no disponible | Variante con DPO de la misma suite |
| geodesic-research/sfm_unfiltered_midtrain_misalignment_upsampled_instruct | 6,9B | no disponible | no disponible | Variante misalignment con instruct |

La comparativa se limita a modelos de la misma suite de investigación, ya que no se dispone de datos de rendimiento para comparar con modelos generalistas de tamaño similar como Llama 2 7B o Mistral 7B. Las diferencias principales entre las variantes de la suite radican en los datos de preentrenamiento (alineados vs. desalineados) y en el post-entrenamiento (DPO, instruct).

## Limitaciones y advertencias

- Sin licencia especificada: no se indica la licencia del modelo, lo que impide conocer las restricciones de uso comercial y redistribución. Se recomienda contactar con el autor antes de cualquier uso.
- Modelo de investigación sin fine-tuning: no ha pasado por procesos de instrucción, RLHF o DPO, por lo que su comportamiento puede ser impredecible y no adecuado para tareas que requieran seguir instrucciones.
- Riesgo de alucinación: como todo modelo de lenguaje, puede generar contenido falso o inventado, especialmente al no tener fine-tuning de instrucciones.
- Sesgos desconocidos: al no disponer de documentación sobre los datos de entrenamiento, no se pueden evaluar los sesgos potenciales del modelo.
- Sin benchmarks publicados: no hay evidencia de rendimiento en tareas estándar, lo que impide evaluar su calidad relativa.
- Contexto limitado desconocido: no se especifica la longitud de contexto soportada, lo que dificulta planificar su uso en aplicaciones con requisitos de contexto largo.
- Sin soporte de tool calling ni agentes: no se ha verificado que el modelo soporte estas capacidades, por lo que no debe asumirse su disponibilidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuhengtu-bytedance/sfm-unfiltered-midtrain-alignment-4k-5k-6k-avg
- Modelo base: https://huggingface.co/geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_base
- Variante DPO: https://huggingface.co/geodesic-research/sfm_unfiltered_midtrain_alignment_upsampled_dpo
- Variante misalignment instruct: https://dev.modelhub.org.cn/geodesic-research/sfm_unfiltered_midtrain_misalignment_upsampled_instruct
- Paper de referencia (método de fusión): https://arxiv.org/abs/2203.05482
- Herramienta mergekit: https://github.com/cg123/mergekit
