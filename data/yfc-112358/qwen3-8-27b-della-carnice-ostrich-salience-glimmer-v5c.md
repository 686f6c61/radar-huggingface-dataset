# YFC-112358/Qwen3.8-27B-Della-Carnice-Ostrich-Salience-Glimmer-v5c

## Resumen

El modelo `YFC-112358/Qwen3.8-27B-Della-Carnice-Ostrich-Salience-Glimmer-v5c` es una fusión de pesos (merge) de cuatro modelos derivados de la familia Qwen3.8-27B, realizada mediante el método `della_linear` de mergekit. El autor, YFC-112358, combina los modelos `kai-os/Carnice-V3`, `etemiz/Ostrich-27B-Qwen3.8-260815`, `vectionlabs/Salience-27B-R5` y su propio merge previo `YFC-112358/Qwen3.8-27B-TM-Gemma4-Glimmer-v3`, todos ellos basados en el modelo base `Qwen/Qwen3.8-27B`. El resultado es un modelo de 27.781.427.952 parámetros (~27,8B) con pesos en bfloat16, pensado para tareas de generación de texto y conversación.

La relevancia de este modelo radica en su enfoque de fusión experimental: utiliza `della_linear`, una variante de interpolación lineal con poda por magnitud por bloques de filas y reescalado, que permite combinar las capacidades de varios modelos sin necesidad de entrenamiento adicional. Sin embargo, la documentación es escasa y no se han publicado evaluaciones de rendimiento, por lo que su utilidad práctica debe validarse de forma independiente.

El repositorio incluye la receta exacta del merge, los pesos de cada fuente y detalles del proceso de construcción, lo que facilita la reproducibilidad. No obstante, la licencia y los idiomas soportados no están especificados, lo que limita su uso en entornos comerciales o multilingües sin verificación previa.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en Qwen3.8-27B) |
| Parametros totales | 27.781.427.952 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | no disponibles (solo pesos bf16 publicados) |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo es una fusión de pesos mediante `della_linear`, un método de mergekit que combina los parámetros de varios modelos fuente. La arquitectura subyacente es la de `Qwen/Qwen3.8-27B`, un transformer causal de 27.8B parámetros, aunque no se detallan las características internas (número de capas, heads, etc.) en la información disponible. El merge se realiza sobre los pesos completos, sin entrenamiento adicional.

El proceso de fusión utiliza los siguientes parámetros: `lambda: 1.0`, `normalize: true`, `int8_mask: true` (aunque este último se indica como no operativo). Se aplica poda por magnitud en bloques de filas, con densidades y epsilon específicos para cada fuente. El cálculo se realiza en fp32 y se guarda en bf16. El autor reporta que la amplitud media del delta fusionado respecto al base es de 0.0006, lo que indica una intervención relativamente suave. Los pesos de cada fuente, según la tabla de "mediciones reales", difieren significativamente de las proporciones nominales, lo que sugiere que el resultado final está dominado por `Ostrich-27B-Qwen3.8-260815` (48,8% real) y `Salience-27B-R5` (17,2%), mientras que `Carnice-V3` (3,9%) y el merge propio (0,0%) tienen una influencia menor de lo esperado.

No se dispone de información sobre el conjunto de datos de entrenamiento, ya que al ser un merge no hay fase de entrenamiento. El tokenizador y la configuración se heredan directamente de `Qwen/Qwen3.8-27B`, por lo que los tokens especiales añadidos por los modelos fuente no se incluyen.

## Capacidades

- Generación de texto y conversación: al estar basado en Qwen3.8-27B, se espera que herede las capacidades de chat y generación de lenguaje natural de dicho modelo, aunque no hay evaluaciones específicas publicadas.
- Razonamiento y conocimiento general: presumiblemente similar al modelo base, pero sin datos que lo confirmen.
- Soporte de tool calling y agentes: no documentado; dependerá de las capacidades del modelo base y de los modelos fuente, pero no se especifica.
- Capacidades multilingües: no disponibles; el tokenizador base de Qwen3.8-27B probablemente soporta varios idiomas, pero no se confirma.
- Pipeline `image-text-to-text`: aparece en los tags de HuggingFace, pero es probablemente un error de etiquetado, ya que el modelo es de texto puro y no se menciona ninguna capacidad multimodal en la model card. Se recomienda verificar antes de asumir soporte de imágenes.

## Casos de uso

- Experimentación con técnicas de fusión de modelos: este modelo es un ejemplo práctico de `della_linear` y puede utilizarse para estudiar cómo la combinación de pesos afecta al comportamiento final, comparándolo con sus fuentes.
- Prototipado rápido de chatbots: si se valida que el modelo funciona correctamente, puede desplegarse localmente para crear asistentes conversacionales de propósito general, aprovechando el tamaño de 27B para obtener respuestas de calidad media-alta.
- Investigación en interpretabilidad de merges: la documentación detallada del proceso (pesos, densidades, epsilon) permite analizar la contribución de cada modelo fuente y cómo la poda por bloques afecta a los resultados.
- Generación de contenido creativo: como modelo de lenguaje grande, puede emplearse para redactar textos, resumir documentos o generar ideas, siempre que se valide su coherencia y estilo.
- Fine-tuning posterior: los pesos fusionados pueden servir como punto de partida para fine-tuning en tareas específicas, aunque la falta de licencia clara dificulta su uso comercial.
- Evaluación comparativa de merges: puede utilizarse como referencia en benchmarks de modelos fusionados, comparando su rendimiento con otros merges de Qwen3.8-27B.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. La ausencia de métricas impide comparar objetivamente este modelo con alternativas. Se recomienda ejecutar evaluaciones propias antes de considerarlo para cualquier tarea crítica.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos en bf16 ocupan aproximadamente 55,6 GB (según el tamaño del repositorio). Para cargar el modelo completo en bf16 se necesitan al menos 56 GB de VRAM.
- GPUs recomendadas: una GPU con 80 GB (A100, H100) o dos GPUs de 40 GB (A100, RTX A6000) en paralelo. En GPUs de consumo, solo sería posible con cuantización, pero no se han publicado versiones cuantizadas.
- Si cabe en consumer GPU: no, sin cuantización. Con cuantización a 8 bits (no disponible) cabría en una RTX 4090 (24 GB) aproximadamente, y a 4 bits en una RTX 3090/4090, pero no hay archivos GGUF ni AWQ.
- Opciones de despliegue: al ser un modelo de transformers, puede servirse con vLLM, TGI o llama.cpp si se convierte a GGUF. No se han proporcionado instrucciones específicas de despliegue.
- Latencia y throughput: no disponibles; dependerán del hardware y del backend utilizado.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa objetiva. El modelo base `Qwen/Qwen3.8-27B` es el punto de referencia natural, pero no se han publicado métricas de este merge. Otros merges de Qwen3.8-27B (como los modelos fuente) podrían ser comparables, pero carecen de datos públicos de rendimiento. Por tanto, la comparativa se limita a señalar que este modelo es una variante sin validar de Qwen3.8-27B, con pesos modificados mediante fusión.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Qwen/Qwen3.8-27B | 27,8B | no disponible | no disponible | HuggingFace |
| Este merge | 27,8B | no disponible | no disponible | HuggingFace |
| kai-os/Carnice-V3 | no disponible | no disponible | no disponible | HuggingFace |

## Limitaciones y advertencias

- Sin licencia especificada: no se puede determinar si es de uso libre, lo que impide su uso comercial sin autorización explícita del autor.
- Sin evaluación de rendimiento: no hay benchmarks ni pruebas de calidad, por lo que su comportamiento real es desconocido.
- Sesgos y alucinaciones: al ser un modelo de lenguaje, puede generar contenido falso o sesgado, especialmente sin fine-tuning adicional.
- Documentación incompleta: la model card está en chino y no proporciona detalles sobre el contexto, idiomas o limitaciones específicas.
- Riesgo de overfitting al merge: la poda por bloques y la combinación de pesos pueden degradar ciertas capacidades del modelo base; la ausencia de métricas no permite saber cuáles.
- Etiquetado confuso: el pipeline `image-text-to-text` en los metadatos no se corresponde con el contenido real, lo que puede inducir a error.
- Reproducibilidad parcial: aunque se documenta el proceso, la falta de código fuente del notebook (solo se menciona) dificulta replicar exactamente el merge.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YFC-112358/Qwen3.8-27B-Della-Carnice-Ostrich-Salience-Glimmer-v5c
- Página en LLM Explorer: https://llm-explorer.com/model/YFC-112358%2FQwen3.8-27B-Della-Carnice-Ostrich-Salience-Glimmer-v5,1FqBL4CvOLoWeZywHvv6b3
- Despliegue en FriendliAI: https://friendli.ai/models/YFC-112358/Qwen3.8-27B-Della-Carnice-Ostrich-Salience-Glimmer-v5
- Referencia del modelo base Qwen3.8-27B en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
