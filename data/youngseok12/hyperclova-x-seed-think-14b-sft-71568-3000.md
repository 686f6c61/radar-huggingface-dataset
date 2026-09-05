# youngseok12/HyperCLOVA-X-SEED-Think-14B-sft-71568-3000

## Resumen

HyperCLOVA X SEED Think-14B SFT 71568-3000 es un modelo de lenguaje basado en el modelo base `naver-hyperclovax/HyperCLOVAX-SEED-Think-14B`, desarrollado por el usuario `youngseok12`. Se trata de un ajuste fino (SFT) realizado con solo 3000 ejemplos del dataset AI Hub 71568, centrado en operaciones numéricas y comprensión lectora (MRC) en los dominios de economía y deportes. El modelo resultante es un merge de un adaptador LoRA sobre el modelo base, publicado como un modelo independiente en formato BF16.

La arquitectura del modelo base no está documentada en la información disponible, aunque se sabe que contiene aproximadamente 14.748 millones de parámetros y que el entrenamiento del SFT se realizó con una longitud de secuencia máxima de 4096 tokens. El idioma principal es el coreano, según las etiquetas del repositorio y la naturaleza del dataset de entrenamiento. El modelo no incluye resultados de benchmarks oficiales, y su relevancia radica en ser un ejemplo de ajuste fino especializado para tareas de razonamiento numérico en coreano, útil como referencia para experimentos de evaluación y comparación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base: naver-hyperclovax/HyperCLOVAX-SEED-Think-14B) |
| Parametros totales | 14.748.112.896 |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens (maximo usado durante el SFT) |
| Tipos de cuantizacion | No disponible en el repositorio (pesos originales en BF16) |
| Idiomas soportados | Coreano (principal, segun etiqueta del modelo base) |
| Licencia | other (licencia de NAVER; ver acuerdo de licencia del modelo base) |
| Formato de pesos | safetensors (BF16) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino (SFT) del modelo base `HyperCLOVAX-SEED-Think-14B` de NAVER, mediante un adaptador LoRA que fue posteriormente fusionado en el modelo base para crear un modelo standalone en BF16. El README del repositorio indica que el LoRA se aplicó a los módulos `q_proj`, `k_proj`, `v_proj`, `o_proj`, `gate_proj`, `up_proj` y `down_proj`, con r=16, alpha=32 y dropout=0.05. El entrenamiento se realizó con una tasa de aprendizaje de 5e-5, programador de coseno, warmup del 3%, y sin weight decay, durante una sola época.

Los datos de entrenamiento provienen exclusivamente del dataset AI Hub 71568 (economía y deportes, operaciones numéricas y MRC), de los cuales se seleccionaron 3000 ejemplos validados, en formato de texto y con respuesta en formato "answer-first" junto con una breve justificación. No se incluyeron otros datasets, ni la mezcla v0.21 del modelo base ni datos de benchmarks públicos. La pérdida de entrenamiento final fue de 0.0710095 y no hubo truncamientos de secuencia. Después de la fusión, se verificó que no había valores NaN o Inf en ningún parámetro o buffer, y se realizó una prueba de humo con generación sintética.

## Capacidades

- Generación de texto en coreano, orientada a tareas de comprensión lectora y razonamiento numérico.
- Especializado en operaciones numéricas y MRC (respuesta a preguntas sobre pasajes) en los dominios de economía y deportes.
- Puede producir respuestas de opción múltiple con una breve argumentación, según el formato del dataset de entrenamiento.
- No se documenta soporte de tool calling o function calling en la información disponible.
- No se documenta soporte de razonamiento multi-paso, agentes, visión o audio en la ficha del modelo.
- La capacidad de "pensamiento" (thinking mode) podría heredarse del modelo base, pero no hay evidencia en la información proporcionada.

## Casos de uso

- Extracción de cifras económicas de artículos de noticias coreanos: el modelo puede identificar y responder preguntas numéricas sobre textos del ámbito económico, gracias a su entrenamiento con datos de economía de AI Hub.
- Análisis de estadísticas deportivas: dado su entrenamiento en deportes, es adecuado para responder preguntas sobre resultados, marcadores y otros datos numéricos presentes en crónicas o resúmenes deportivos.
- Comprensión lectora en coreano para preguntas de opción múltiple: útil para generar respuestas en formato "answer-first" con una justificación corta, replicando el estilo del dataset de entrenamiento.
- Asistente de consulta numérica en documentos financieros: puede usarse para automatizar la búsqueda de valores concretos en informes o notas de prensa coreanas, siempre que el texto esté dentro del dominio.
- Generación de resúmenes numéricos en coreano: capaz de producir explicaciones breves sobre operaciones aritméticas extraídas de textos, aunque con limitaciones en generalización.
- Prototipado de sistemas de preguntas y respuestas sobre datos tabulares o numéricos: el modelo puede servir como base para estudios de especialización en tareas numéricas con núcleo en coreano, especialmente para comparar con otros SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El README del modelo indica explícitamente que las puntuaciones oficiales de evaluación no están incluidas en el repositorio y que se requiere una evaluación separada. Por lo tanto, no se ofrecen tablas comparativas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 14.748.112.896 parámetros. En BF16, los pesos ocupan aproximadamente 29.5 GB (coincidente con el tamaño del repositorio). Con cuantización de 8 bits se reduciría a unos 14.8 GB, y con 4 bits a unos 7.4 GB.
- GPU recomendadas: para ejecutar en BF16 sin cuantizar se requiere una GPU con al menos 30 GB de VRAM, como una A100 40GB, H100 80GB o A100 80GB. En GPU de consumo, una RTX 4090 de 24 GB solo es viable con cuantización de 4 bits o mediante técnicas de offloading a CPU.
- Si cabe en consumer GPU: sí, pero únicamente con cuantización de 4 bits y cierta tolerancia a la velocidad de inferencia.
- Opciones de despliegue: el repositorio solo contiene pesos en safetensors, por lo que se puede usar con Transformers para inferencia con `device_map="auto"`, o con vLLM si el modelo es compatible. Para usar llama.cpp u Ollama es necesario convertir los pesos a formato GGUF, que no está incluido.
- Latencia y throughput: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| HyperCLOVA X SEED Think-14B SFT 71568-3000 | 14.748 M | 4096 tokens (entrenamiento) | other | HuggingFace (safetensors) |
| HyperCLOVA X SEED Think-14B (base) | ~14.748 M | no disponible | other | HuggingFace |
| HyperCLOVA X SEED Think-14B minimal-sft-71875 | ~14.748 M | no disponible | other | HuggingFace |

La comparativa se limita a modelos de la misma familia y tamaño. No se dispone de datos de benchmarks para ninguno de ellos. El modelo base es la referencia original sin ajuste fino; el modelo "minimal-sft-71875" es otro SFT del autor sobre el mismo base, con un dataset distinto, pero tampoco incluye resultados de evaluación.

## Limitaciones y advertencias

- El dataset de entrenamiento es muy reducido (3000 ejemplos) y está limitado a dos dominios concretos (economía y deportes), lo que reduce drásticamente la capacidad de generalización a otros temas o estilos.
- No se han publicado benchmarks, por lo que no hay evidencia empírica del rendimiento en tareas generales o incluso en las tareas objetivo.
- El modelo está pensado para coreano; otros idiomas no están documentados y es probable que funcionen mal.
- La licencia es "other" e incluye términos del acuerdo de licencia del modelo base, que requiere atribución a NAVER y cumplimiento de la política de uso prohibido. Debe revisarse el LICENSE antes de cualquier uso comercial.
- Existe un riesgo significativo de alucinación en cálculos o afirmaciones numéricas que no sigan los patrones del entrenamiento, especialmente si se intenta usar el modelo fuera del contexto de economía o deportes.
- No se documenta soporte para tool calling, agentes ni multimodalidad, por lo que no debe esperarse que funcione en pipelines complejos que requieran estas capacidades.
- Los datos de AI Hub pueden contener sesgos inherentes a la fuente, lo que podría reflejarse en las respuestas del modelo.

## Enlaces

- https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-sft-71568-3000
- https://huggingface.co/naver-hyperclovax/HyperCLOVAX-SEED-Think-14B
- https://huggingface.co/youngseok12/HyperCLOVA-X-SEED-Think-14B-minimal-sft-71875
- https://www.aihub.or.kr/aihubdata/data/view.do?currMenu=115&topMenu=100&aihubDataSe=realm&dataSetSn=71568
- https://friendli.ai/models/youngseok12/HyperCLOVA-X-SEED-Think-14B-minimal-sft-71875
