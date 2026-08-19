# zfan3/esm2_t12_35M_category_CST_homolog_v6

## Resumen

El modelo `zfan3/esm2_t12_35M_category_CST_homolog_v6` es un modelo de lenguaje de proteínas basado en la arquitectura ESM-2, desarrollado por el usuario zfan3 y publicado en HuggingFace bajo licencia MIT. Aunque la model card no proporciona detalles adicionales, el nombre sugiere que se trata de un fine-tuning de la variante ESM-2 con 12 capas y 35 millones de parámetros, especializado en la clasificación de categorías de homología CST (probablemente relacionado con dominios o familias de proteínas). El modelo está pensado para tareas de anotación y clasificación de secuencias proteicas, no para generación de lenguaje natural.

Con 33.994.949 parámetros totales y un tamaño de repositorio de 0,4 GB en formato safetensors, es un modelo ligero que puede ejecutarse en hardware modesto. Su relevancia radica en que los modelos ESM-2 han demostrado un buen rendimiento en tareas de predicción de estructura y función de proteínas, y este fine-tuning específico podría ser útil para investigadores que necesiten clasificar homólogos en categorías concretas. Sin embargo, la falta de documentación pública limita la evaluación de sus capacidades reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-only (ESM-2, 12 capas, según el nombre) |
| Parametros totales | 33.994.949 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (ESM-2 típicamente usa 1024 tokens, pero no confirmado) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de secuencias de proteínas, no lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Según la nomenclatura del nombre, el modelo sigue la arquitectura ESM-2 de Meta AI: un transformer encoder-only con atención multi-cabeza, entrenado originalmente con masked language modeling sobre secuencias de proteínas de la base de datos UniRef. La variante `t12` indica 12 capas transformer y 35M parámetros, la configuración más pequeña de la familia ESM-2. El sufijo `category_CST_homolog_v6` sugiere un fine-tuning supervisado para clasificar proteínas en categorías de homología CST, probablemente mediante una cabeza de clasificación añadida sobre la representación de la secuencia. No se dispone de información sobre el dataset de fine-tuning, el número de épocas, ni si se aplicaron técnicas como RLHF o DPO, que no son habituales en modelos de proteínas. Tampoco se documentan innovaciones técnicas específicas más allá de las propias de ESM-2.

## Capacidades

- Clasificación de secuencias de proteínas en categorías de homología CST (según el nombre del modelo).
- Representación de embeddings de proteínas para tareas downstream (si se extraen las activaciones de capas intermedias).
- Procesamiento de secuencias de aminoácidos de longitud variable, limitado por la ventana de contexto (no confirmada).
- No soporta generación de texto, tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües ni de visión/audio.

## Casos de uso

- Anotación funcional de proteínas: dado un conjunto de secuencias desconocidas, el modelo puede predecir si pertenecen a una categoría de homología CST, facilitando la asignación de función putativa en proyectos de genómica.
- Filtrado de homólogos en bases de datos: en pipelines de búsqueda de homólogos, el modelo puede actuar como un clasificador rápido para cribar candidatos antes de un alineamiento múltiple más costoso.
- Priorización de dianas terapéuticas: en estudios de proteínas asociadas a enfermedades, el modelo puede ayudar a identificar variantes que caen en categorías CST relevantes, orientando la selección de dianas para ensayos.
- Análisis de metagenomas: para clasificar proteínas de muestras ambientales en categorías funcionales conocidas, el modelo ofrece una alternativa ligera a métodos basados en HMM.
- Educación e investigación: como herramienta didáctica para demostrar la aplicación de modelos de lenguaje a datos biológicos, sin necesidad de grandes recursos computacionales.
- Integración en flujos de anotación automática: el modelo puede desplegarse como servicio REST para etiquetar secuencias en tiempo real dentro de plataformas de bioinformática.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como MMLU, HumanEval o GSM8K, ya que el modelo no está orientado a tareas de lenguaje natural. Tampoco se documentan resultados específicos de precisión, recall o F1 para la tarea de clasificación CST.

## Requisitos de hardware

- VRAM estimada para inferencia: con float32, el modelo ocupa aproximadamente 136 MB (33.994.949 × 4 bytes), por lo que cabe en cualquier GPU con al menos 1 GB de VRAM. Con cuantización a int8, el uso se reduce a unos 68 MB.
- GPU recomendadas: cualquier GPU moderna, incluidas RTX 2060, RTX 3060, T4, o incluso CPU con suficiente RAM.
- Sí cabe en GPUs de consumo (gama baja y media) y en entornos sin GPU.
- Opciones de despliegue: al ser safetensors, puede cargarse con la librería `transformers` de HuggingFace o con `esm` (el paquete oficial de ESM). También es posible convertirlo a ONNX o TorchScript para servir con TensorRT o similares. No se menciona compatibilidad con vLLM, llama.cpp u Ollama, que están orientados a modelos de lenguaje generativos.
- Latencia y throughput: no disponible. Dado el tamaño reducido, se espera una latencia de milisegundos por secuencia en GPU y de decenas de milisegundos en CPU, pero no hay datos medidos.

## Comparativa con modelos similares

| Modelo | Parámetros | Arquitectura | Contexto | Licencia | Uso principal |
|---|---|---|---|---|---|
| esm2_t12_35M (este) | 35M | ESM-2 (12 capas) | no disponible | MIT | Clasificación de homología CST |
| esm2_t6_8M (Meta) | 8M | ESM-2 (6 capas) | 1024 | MIT | Embeddings de proteínas, tareas generales |
| esm2_t30_150M (Meta) | 150M | ESM-2 (30 capas) | 1024 | MIT | Embeddings de proteínas, tareas generales |
| ProtBERT (HuggingFace) | 420M | BERT | 512 | Apache-2.0 | Embeddings de proteínas, tareas generales |

La comparativa se basa en modelos ESM-2 originales de Meta AI, que son los más parecidos. Este modelo es un fine-tuning de la variante de 35M, por lo que su rendimiento en tareas específicas dependerá del dataset de entrenamiento, del que no se tienen datos. Los modelos originales de ESM-2 están disponibles en HuggingFace con licencia MIT y han sido ampliamente evaluados en tareas de predicción de estructura y función.

## Limitaciones y advertencias

- La documentación es prácticamente inexistente: la model card solo contiene la licencia, por lo que no se pueden verificar las capacidades, el dataset de entrenamiento ni los resultados esperados.
- El modelo está diseñado exclusivamente para secuencias de proteínas; no es apto para procesamiento de lenguaje natural ni para tareas generativas.
- Riesgo de alucinación: no aplica en el sentido de generación de texto, pero sí puede producir clasificaciones erróneas si las categorías CST no están bien definidas o si el fine-tuning se hizo con datos sesgados.
- Sesgos potenciales: los modelos ESM-2 se entrenan con UniRef, que tiene una representación desigual de organismos; esto puede afectar la precisión en proteínas de organismos poco representados.
- Restricciones de licencia: la licencia MIT permite uso comercial y modificación, pero al no haber documentación, el usuario debe asumir la responsabilidad de validar el modelo antes de usarlo en producción.
- Para uso en producción, se recomienda evaluar el modelo en un conjunto de validación propio y comparar con alternativas como ESM-2 original o ProtBERT.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/zfan3/esm2_t12_35M_category_CST_homolog_v6
- No se han encontrado otros enlaces (papers, blogs, repos) en la información disponible.
