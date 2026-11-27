# Xylolabs/Qwen3.5-2B-GGUF

## Resumen

Qwen3.5-2B-GGUF es una colección de cuantizaciones en formato GGUF del modelo base Qwen/Qwen3.5-2B, publicada por Xylolabs para su uso con llama.cpp sobre CUDA, Metal o CPU. El modelo base es un transformer denso de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) desarrollado por el equipo Qwen de Alibaba, y esta publicación se limita a ofrecer pesos cuantizados listos para inferencia local, sin la torre de visión ni el bloque MTP (multi-token prediction) del modelo original.

La relevancia de esta ficha radica en que se trata de una cuantización de un modelo de la familia Qwen 3.5, pensada para despliegue en hardware de consumo. El repositorio incluye ocho variantes de cuantización que van desde Q8_0 (2,01 GB) hasta Q2_K (1,00 GB), lo que permite ejecutar el modelo en equipos con recursos muy limitados. La model card proporciona además una tabla de fidelidad respecto a BF16 medida con divergencia KL y acuerdo top-1 sobre WikiText-2, datos de chat y texto reservado, lo que facilita elegir el compromiso entre tamaño y calidad.

La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales más allá de las obligaciones de atribución de dicha licencia. El contexto de entrenamiento del modelo base no se especifica en la información disponible; la model card solo muestra un ejemplo de ejecución con `-c 32768`, que corresponde a la configuración del servidor llama.cpp y no necesariamente al máximo soportado por el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (modelo base Qwen3.5-2B); la cuantización GGUF elimina la torre de visión y el bloque MTP |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el ejemplo de la model card usa `-c 32768`) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q4_K_S, IQ4_XS, Q3_K_M, Q2_K |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base Qwen3.5-2B es un transformer denso de 1,88 mil millones de parámetros. La model card de esta cuantización no detalla la composición del dataset de entrenamiento, el número de tokens procesados ni si se aplicaron fases de RLHF o DPO; esa información correspondería a la model card del modelo original Qwen/Qwen3.5-2B, que no forma parte de la documentación proporcionada. La publicación de Xylolabs se limita a describir el proceso de cuantización y su fidelidad respecto a los pesos BF16.

La innovación técnica destacable de esta publicación es la eliminación deliberada de dos componentes del modelo original: la torre de visión y el bloque MTP (multi-token prediction). Esto reduce el tamaño y la complejidad del grafo de inferencia para llama.cpp, a costa de perder las capacidades multimodales y de decodificación especulativa que pudiera ofrecer el modelo completo. Las cuantizaciones se han validado con el commit `caea914e9d05153aa32b96a846dca543e7cb16be` de llama.cpp y se han comparado contra BF16 y contra las cuantizaciones dinámicas de Unsloth, con métricas de divergencia KL y acuerdo top-1 sobre tres conjuntos de evaluación.

## Capacidades

- Generación de texto conversacional: el tag `conversational` y el uso de `--jinja` en el ejemplo indican soporte de plantillas de chat.
- Razonamiento y generación de texto general, heredados del modelo base Qwen3.5-2B (no se detallan capacidades específicas en la información disponible).
- Inferencia local en CPU, CUDA y Metal mediante llama.cpp.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere integración con servidores compatibles con la API de llama.cpp.
- Capacidades multimodales: no disponibles en esta cuantización, ya que la torre de visión ha sido eliminada.
- Decodificación especulativa vía MTP: no disponible, ya que el bloque MTP ha sido eliminado.
- Tool calling / function calling: no confirmado en la información proporcionada.
- Capacidades de agente y multi-step reasoning: no confirmadas en la información proporcionada.
- Capacidades multilingües: no disponibles.

## Casos de uso

- Asistente conversacional local en portátiles: con la variante Q4_K_M (1,29 GB) el modelo cabe en memoria RAM de cualquier equipo moderno y puede ejecutarse en CPU con llama.cpp, ofreciendo un chatbot privado sin conexión a servicios externos.
- Prototipado rápido de aplicaciones de texto: la variante Q8_0 (2,01 GB) conserva un acuerdo top-1 del 98,13 % respecto a BF16 en WikiText-2, lo que la hace adecuada para validar pipelines antes de escalar a modelos mayores.
- Despliegue en dispositivos de borde con recursos limitados: la variante IQ4_XS (1,17 GB) o Q3_K_M (1,12 GB) permiten ejecutar el modelo en GPUs integradas o en placas tipo Raspberry Pi con suficiente RAM, a costa de una mayor divergencia KL.
- Generación de texto por lotes en servidores sin GPU: llama.cpp sobre CPU permite procesar grandes volúmenes de texto con la variante Q4_K_S (1,22 GB), manteniendo un acuerdo top-1 del 91,89 % en WikiText-2.
- Educación e investigación sobre cuantización: la tabla de fidelidad KL/top-1 incluida en la model card sirve como referencia reproducible para estudiar el impacto de distintas cuantizaciones en un modelo de 1,88 B.
- Integración en herramientas de escritorio con API compatible: el tag `endpoints_compatible` y el ejemplo con `llama-server --jinja` permiten exponer el modelo como servicio HTTP local para editores de código, plugins o aplicaciones de chat que consuman una API compatible.
- Filtrado y clasificación de texto en local: con contexto de hasta 32 768 tokens en la configuración de ejemplo, puede procesar documentos largos para tareas de resumen o extracción, siempre que se validen los resultados por el riesgo de alucinación de un modelo de este tamaño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card incluye únicamente métricas de fidelidad de cuantización respecto a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Chat KL | top-1 | Held-out KL | top-1 | Check 7 preguntas |
|---|---:|---:|---:|---:|---:|---:|---:|---:|
| BF16 | 3,78 GB | - | - | - | - | - | - | 5/7 |
| Q8_0 | 2,01 GB | 0,000994 | 98,13 % | 0,001150 | 98,10 % | 0,001549 | 96,94 % | 5/7 |
| Q6_K | 1,57 GB | 0,003009 | 96,81 % | 0,003536 | 96,92 % | 0,004490 | 95,61 % | 5/7 |
| Q5_K_M | 1,45 GB | 0,006627 | 95,60 % | 0,007707 | 95,22 % | 0,008852 | 93,98 % | 5/7 |
| Q4_K_M | 1,29 GB | 0,019793 | 92,65 % | 0,025111 | 92,28 % | 0,025923 | 90,37 % | 5/7 |
| Q4_K_S | 1,22 GB | 0,024340 | 91,89 % | 0,030151 | 91,00 % | 0,032034 | 88,77 % | 5/7 |
| IQ4_XS | 1,17 GB | 0,032163 | 90,54 % | 0,039276 | 89,37 % | 0,045511 | 86,86 % | 5/7 |
| Q3_K_M | 1,12 GB | 0,073627 | 86,49 % | 0,086635 | 85,88 % | 0,096161 | 81,63 % | 5/7 |
| Q2_K | 1,00 GB | 0,218839 | 77,65 % | 0,302113 | 74,33 % | 0,330154 | 67,29 % | 6/7 |

La model card también incluye comparaciones con las cuantizaciones dinámicas de Unsloth (UD-Q8_K_XL, UD-Q6_K_XL, UD-Q5_K_XL, UD-Q4_K_XL, UD-Q3_K_XL, UD-Q2_K_XL), que en general presentan una divergencia KL ligeramente menor a igual tamaño, a costa de ficheros algo mayores (por ejemplo, UD-Q8_K_XL ocupa 2,83 GB frente a los 2,01 GB de Q8_0). El check de 7 preguntas no es una evaluación de calidad del modelo, sino una comprobación cualitativa de que la cuantización no rompe la coherencia.

## Requisitos de hardware

- VRAM/RAM estimada para inferencia: aproximadamente el tamaño del fichero GGUF más el contexto. Con Q4_K_M (1,29 GB) y contexto de 32 768 tokens, se recomienda reservar al menos 2-3 GB de memoria; con Q8_0 (2,01 GB), al menos 4 GB.
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM para Q4_K_M o Q8_0; tarjetas como RTX 3060, RTX 4060, RTX 4090, A100 o H100 pueden ejecutar todas las variantes con `-ngl 99` para descargar todas las capas en GPU.
- Cabe en GPU de consumo: sí, todas las variantes caben en GPUs de consumo con 4 GB o más de VRAM; las variantes Q2_K y Q3_K_M pueden ejecutarse incluso en GPUs integradas con memoria compartida.
- Opciones de despliegue: llama.cpp (verificado con el commit `caea914e9d05153aa32b96a846dca543e7cb16be`), `llama-server` con `--jinja`, y cualquier runtime compatible con GGUF (Ollama, LM Studio, entre otros) aunque no se confirma su validación explícita en la información disponible. vLLM y TGI no se mencionan en la documentación.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Xylolabs/Qwen3.5-2B-GGUF | 1,88 B | No disponible | Apache 2.0 | GGUF | Cuantizaciones sin torre de visión ni MTP; 8 variantes |
| Qwen/Qwen3.5-2B (base) | 1,88 B | No disponible | Apache 2.0 (segun la cuantizacion) | Safetensors | Modelo original con torre de visión y MTP |
| Cuantizaciones Unsloth del mismo modelo | 1,88 B | No disponible | Apache 2.0 | GGUF | Variantes dinámicas UD-*; menor KL a igual tamaño pero ficheros mayores |

No se dispone de datos de benchmarks estándar que permitan comparar el rendimiento cualitativo con otras familias de modelos del mismo tamaño; la comparación se limita a las métricas de fidelidad de cuantización publicadas.

## Limitaciones y advertencias

- Alucinación: es un modelo de 1,88 B parámetros; se espera una tasa de alucinación mayor que en modelos de mayor tamaño, especialmente en tareas de conocimiento factual. No se han publicado evaluaciones específicas de factualidad.
- Sesgos: no se documentan sesgos conocidos en la información proporcionada; el modelo base puede heredar sesgos de sus datos de entrenamiento, no detallados.
- Pérdida de capacidades: esta cuantización elimina la torre de visión y el bloque MTP, por lo que no puede procesar imágenes ni aprovechar la decodificación multi-token del modelo original.
- Idiomas: no se especifican los idiomas soportados; no se debe asumir un rendimiento multilingüe sin validación.
- Contexto: la longitud máxima de contexto del modelo base no se indica; el valor de 32 768 del ejemplo es una configuración de llama.cpp y no una garantía del máximo soportado.
- Licencia: Apache 2.0 permite uso comercial, pero se deben conservar los ficheros `LICENSE` y `NOTICE` del repositorio.
- Calidad de cuantizaciones agresivas: Q2_K presenta una divergencia KL muy superior al resto (0,218839 en WikiText-2) y un acuerdo top-1 del 67,29 % en texto reservado; no se recomienda para producción.
- Estado del repositorio: 0 descargas y 0 likes en el momento de la consulta, lo que indica que no ha sido validado por la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.5-2B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de Xylolabs referenciado en la model card: https://github.com/XylolabsInc/tensix-bfp-gptq
- llama.cpp (runtime recomendado): https://github.com/ggml-org/llama.cpp
