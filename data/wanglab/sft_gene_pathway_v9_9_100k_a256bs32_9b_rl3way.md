# wanglab/sft_gene_pathway_v9_9_100k_a256bs32_9b_rl3way

## Resumen

El modelo `wanglab/sft_gene_pathway_v9_9_100k_a256bs32_9b_rl3way` es un ajuste fino de tipo multimodal desarrollado por el laboratorio wanglab sobre el modelo base `Qwen/Qwen3.5-9B`. Según las etiquetas del repositorio, está especializado en biología, concretamente en datos de célula única (single-cell), perturbaciones génicas, CRISPR y razonamiento sobre rutas biologicas (gene pathway). El nombre interno sugiere un entrenamiento por supervisión (SFT) seguido de una fase de aprendizaje por refuerzo (RL) de tres vías, sobre un conjunto de datos de aproximadamente 100.000 ejemplos, aunque estos detalles no están confirmados en la documentación pública.

El modelo tiene 9.409.813.744 parámetros totales (unos 9,4 mil millones), lo que lo sitúa en la gama de modelos densos de tamano medio, con un peso en disco de 18,9 GB en el repositorio. Es capaz de procesar entradas de imagen y texto (pipeline `image-text-to-text`) y de generar texto de forma conversacional, lo que apunta a un uso como asistente o motor de razonamiento en tareas de biología computacional.

Su relevancia actual radica en que combina un modelo generalista moderno (Qwen3.5) con una especialización vertical poco frecuente en el ecosistema abierto: razonamiento sobre genómica y perturbaciones celulares. Sin embargo, el acceso está restringido (gated) y no se han publicado fichas de evaluación, benchmarks ni detalles de entrenamiento, por lo que su adopción en producción requiere validación propia.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), derivada de Qwen3.5-9B; detalles internos no disponibles |
| Parametros totales | 9.409.813.744 (aprox. 9,4 B) |
| Parametros activos | No aplica (no hay evidencia de que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (repositorio en safetensors; no se publican variantes GGUF ni AWQ/GPTQ confirmadas) |
| Idiomas soportados | No disponible |
| Licencia | Qwen (etiquetada como `license:other`, nombre de licencia "qwen"); acceso restringido en HuggingFace |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del modelo base `Qwen/Qwen3.5-9B`, un transformer denso con capacidades multimodales (entrada de imagen y texto). Sobre esa base, wanglab ha aplicado un ajuste fino en dos fases según indica el propio nombre del modelo: una primera fase de *supervised fine-tuning* (SFT) y una segunda de *reinforcement learning* con una estrategia descrita como "3way" (`rl3way`). El sufijo `100k_a256bs32_9b` sugiere un conjunto de datos de unas 100.000 muestras y una configuración de entrenamiento con tamano de atención de 256 y batch size de 32, aunque esta interpretación **no está confirmada** por documentación oficial.

El dominio de entrenamiento es la biología: las etiquetas incluyen single-cell, perturbation, CRISPR y gene pathway, lo que indica que el modelo ha sido expuesto a datos de expresión génica, experimentos de perturbación y rutas biológicas. No se dispone de información sobre el número total de tokens, la composición exacta del dataset, ni los algoritmos concretos de RLHF/DPO utilizados. Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.). Toda la información sobre el proceso de entrenamiento es **no disponible** más alla de lo inferible de las etiquetas y el nombre del modelo.

## Capacidades

- Generación de texto conversacional (pipeline `text-generation`).
- Procesamiento multimodal de entrada imagen-texto (etiqueta `image-text-to-text`).
- Razonamiento especializado en biología: rutas génicas (gene pathway), datos de célula única (single-cell) y experimentos de perturbación.
- Modelado de perturbaciones génicas y escenarios CRISPR según las etiquetas del repositorio.
- Capacidades de razonamiento (etiqueta `reasoning`).
- Ajuste por aprendizaje por refuerzo (etiqueta `reinforcement-learning`), orientado presumiblemente a mejorar el razonamiento en tareas biológicas.
- Compatible con endpoints (`endpoints_compatible`).
- Soporte de tool calling / function calling: **no disponible** (no confirmado en la información).
- Soporte de agentes y razonamiento multi-paso: **no disponible** (no confirmado explícitamente).
- Capacidades multilingües: **no disponible** (no se listan idiomas).
- Modo "thinking", audio u otras capacidades especiales: **no disponible**.

## Casos de uso

- Analisis de expresion genica en celula unica: el modelo puede procesar matrices o representaciones de datos scRNA-seq y razonar sobre patrones de expresion, apoyandose en su entrenamiento especifico en single-cell.
- Prediccion e interpretacion de perturbaciones génicas: dado un contexto de experimento (por ejemplo, knockout con CRISPR), el modelo puede generar hipótesis sobre los efectos esperados en la expresion génica.
- Anotacion funcional de rutas biologicas: asistencia en la asignacion de genes a rutas (pathways) y en la interpretacion de enriquecimiento funcional en estudios de transcriptomica.
- Asistente de laboratorio multimodal: al aceptar entradas de imagen y texto, puede ayudar a interpretar figuras, graficos de heatmap o imagenes de microscopia junto con su descripcion textual.
- Generacion de hipotesis en investigación biomédica: apoyo a investigadores en la formulacion de mecanismos candidatos a partir de datos de perturbacion y expresion.
- Revision y resumen de literatura biológica combinada con datos: el modelo puede integrar texto cientifico con datos estructurados para producir resumenes tecnicos.
- Fine-tuning posterior como base especializada: dado que es un ajuste fino sobre Qwen3.5-9B, puede servir como punto de partida para tareas mas concretas en biología computacional.
- Razonamiento sobre diseno experimental: ayuda a plantear controles, replicas y condiciones en experimentos de perturbacion génica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (según 9,4 B de parametros, calculo aproximado, no medido):
  - FP16 / BF16: en torno a 18-20 GB (pesos) mas overhead de activaciones y KV cache.
  - Cuantizacion 8 bits: aproximadamente 10-11 GB.
  - Cuantizacion 4 bits: aproximadamente 6-7 GB.
- GPU recomendadas:
  - Inferencia BF16 completa: A100 40 GB, H100 80 GB, o 2x RTX 4090 24 GB con reparto.
  - Inferencia 8 bits: RTX 4090 24 GB, A10G 24 GB, L40S 48 GB.
  - Inferencia 4 bits: RTX 3090/4090 24 GB o GPUs con 12-16 GB en configuraciones ajustadas.
- Cabe en GPU de consumo: si, en cuantizacion 4 u 8 bits en tarjetas de 16-24 GB; en BF16 requiere GPU profesional o multiples tarjetas.
- Opciones de despliegue: transformers (librería oficial del repositorio), vLLM y TGI (compatibles con safetensors de transformers, sujeto a validacion), y `endpoints_compatible` para despliegue gestionado. llama.cpp/Ollama requeririan convertir a GGUF, no publicado.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Dominio | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wanglab/sft_gene_pathway_v9_9_100k_a256bs32_9b_rl3way | 9,4 B | No disponible | Biologia (single-cell, CRISPR) | Qwen (other), gated | HuggingFace, acceso restringido |
| wanglab/sft_gene_pathway_v9_9_100k_a256bs32_9b | No disponible | No disponible | Biologia | No disponible | HuggingFace |
| Qwen/Qwen3.5-9B (modelo base) | ~9 B | No disponible | Generalista multimodal | Qwen | HuggingFace |
| Modelos genericos de 9 B de la misma gama | ~9 B | Variable | Generalista | Variable | Variable |

No se dispone de datos de rendimiento comparativo entre estas alternativas. La comparativa se limita a parametros, licencia y disponibilidad; los resultados de benchmarks para este modelo y sus comparables no estan publicados en la informacion disponible.

## Limitaciones y advertencias

- No se han publicado benchmarks ni evaluaciones independientes; el rendimiento real es desconocido.
- Riesgo de alucinacion: al ser un modelo generativo especializado en un dominio cientifico, puede producir afirmaciones biologicas plausibles pero incorrectas, especialmente en rutas génicas o efectos de perturbacion.
- Sesgos conocidos: no disponibles; no se documenta la composicion del dataset ni posibles sesgos en los datos de entrenamiento.
- Idiomas soportados no especificados; podria tener un rendimiento desigual fuera del ingles cientifico.
- Longitud de contexto no documentada; no se puede garantizar el manejo de secuencias largas de datos genomicos.
- Licencia: etiquetada como "other" con nombre "qwen"; es imprescindible revisar los terminos de la licencia Qwen antes de cualquier uso comercial, ya que pueden imponer restricciones.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que limita la reproducibilidad y la distribucion.
- El modelo esta especializado en biología; su uso como modelo generalista probablemente sea inferior al de su base Qwen3.5-9B sin ajustar.
- Para produccion en dominios clinicos o biomedicos, es obligatoria la validacion por expertos; no debe usarse como fuente de decision clinica.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wanglab/sft_gene_pathway_v9_9_100k_a256bs32_9b_rl3way
- Variante relacionada: https://huggingface.co/wanglab/sft_gene_pathway_v9_9_100k_a256bs32_9b
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Ficha de la variante v7_6: https://free2aitools.com/model/wanglab/sft_gene_pathway_v7_6_100k_a256bs32_9b
- GitHub (Wang Lab @ MIT y Broad Institute, vinculacion no confirmada): https://github.com/wanglab-broad
- GitHub (Bo Wang Lab, University of Toronto, vinculacion no confirmada): https://github.com/orgs/bowang-lab/repositories
