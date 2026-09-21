# yuriilaba/ucu-wsd-generation_back_translation_pt-true_seed-42

## Resumen

El modelo `yuriilaba/ucu-wsd-generation_back_translation_pt-true_seed-42` es un ajuste fino (fine-tuning) de un encoder de frases multilingüe orientado a la desambiguación del sentido de las palabras (word-sense disambiguation, WSD) en ucraniano. Lo publica el usuario yuriilaba en HuggingFace y parte de `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder de tipo MPNet de 278 millones de parámetros que produce embeddings de frase y de token.

El problema que resuelve es concreto: dado un token ambiguo en una oración ucraniana, el modelo debe representar su significado en contexto de forma que sea distinguible del mismo token usado con otro sentido. Para ello se entrenó con tripletas generadas mediante un procedimiento de "generation + back-translation" a partir del fichero `local_datasets/semi_supervised_2/triplets/triplets_generation_translation.csv`, con pooling sobre el token objetivo (`target-token pooling: True`) y semilla 42 tanto en entrenamiento como en la partición de validación.

Su relevancia es acotada pero clara: no es un modelo generativo ni un chat, sino un componente de representación para pipelines de PLN en ucraniano. Los resultados declarados por el autor son una exactitud de WSD de 0,9376 y correlaciones STS de Pearson 0,7964 y Spearman 0,7853, lo que lo sitúa como un recurso de evaluación y anotación semántica dentro del ecosistema MTEB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer de tipo MPNet (modelo base: `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`); la model card etiqueta el repositorio con el tag `xlm-roberta` |
| Parametros totales | 278.043.648 |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada (el modelo base declara un maximo de 128 tokens) |
| Tipos de cuantizacion | No disponible; los pesos se publican en precision completa y se pueden convertir a float16 / int8 con herramientas estandar |
| Idiomas soportados | No disponible en la model card; el proposito declarado es la desambiguacion lexica en ucraniano y el modelo base es multilingue |
| Licencia | No disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura subyacente es un encoder transformer de la familia MPNet, reutilizado desde `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`. MPNet combina ideas de los objetivos enmascarados y autorregresivos: predice tokens enmascarados condicionados por una permutacion de la secuencia, lo que le permite capturar dependencias bidireccionales sin el desajuste preentrenamiento-ajuste de BERT. El resultado es un espacio de embeddings de 768 dimensiones compartido entre idiomas gracias al entrenamiento multilingüe del modelo base.

El ajuste fino se realizo sobre tripletas almacenadas en `local_datasets/semi_supervised_2/triplets/triplets_generation_translation.csv`, generadas mediante un procedimiento de generacion y traduccion inversa (back-translation). Dos decisiones de configuracion destacan: el pooling se aplica sobre el token objetivo (`target-token pooling: True`) en lugar de sobre el promedio de la secuencia, lo que preserva la informacion del sentido local del token ambiguo, y se fijo la semilla 42 tanto para el entrenamiento como para la particion de validacion, lo que hace el experimento reproducible. No se indica en la informacion disponible si hubo una fase de RLHF o DPO, ni el numero total de tokens de entrenamiento.

## Capacidades

- Generacion de embeddings de frase y de token mediante un encoder MPNet de 278 millones de parametros.
- Desambiguacion del sentido de palabras (WSD) en ucraniano, con exactitud declarada de 0,9376.
- Similitud semantica textual (STS) en ucraniano: correlacion de Pearson 0,7964 y Spearman 0,7853.
- Representacion contextual de tokens individuales gracias al pooling sobre el token objetivo.
- Evaluacion integrada en tareas de MTEB: el autor publica resultados completos por tarea en `evaluation/mteb_results/`.
- Capacidad multilingue derivada del modelo base, aunque no esta documentada explicitamente para este ajuste.
- No se declara soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision ni audio: es un encoder, no un modelo generativo.
- No se declara un modo "thinking" ni capacidades de generacion de codigo o matematicas.

## Casos de uso

- Desambiguacion lexica en corpus ucranianos: dado un token polisemico (por ejemplo, una palabra con dos sentidos frecuentes), el modelo genera un embedding contextual que se puede comparar por similitud coseno contra los prototipos de cada sentido y asignar la acepcion correcta.
- Anotacion automatica de corpus para lexicografia: el modelo permite preetiquetar grandes volumenes de texto ucraniano por sentido y reducir el trabajo manual de anotadores humanos, que solo revisan las etiquetas de baja confianza.
- Enriquecimiento de pipelines de traduccion automatica: al resolver el sentido del token de origen antes de traducir, se reduce el error de seleccion lexica en pares como ucraniano-ingles, especialmente en terminos polisemicos.
- Busqueda semantica en ucraniano: los embeddings de frase permiten indexar documentos y recuperar pasajes por similitud conceptual en lugar de coincidencia exacta de terminos, con una ventana de 128 tokens por pasaje en el modelo base.
- Evaluacion comparativa de embeddings (MTEB): el autor publica resultados por tarea, de modo que el modelo sirve como punto de referencia para medir si otros encoders mejoran en WSD y STS en ucraniano.
- Deduplicacion y agrupamiento de textos: la similitud semantica permite detectar parafrasis, duplicados casi identicos y variantes de una misma noticia en corpus multilingues.
- Sistemas de recomendacion basados en contenido: los embeddings de titulares o descripciones en ucraniano se pueden usar como vector de caracteristicas para recuperar elementos similares.
- Investigacion sobre el efecto del pooling: al estar documentado `target-token pooling: True`, el repositorio es util como referencia reproducible (semilla 42) para comparar estrategias de agregacion de representaciones.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| WSD accuracy | 0,9375792141951838 |
| STS Pearson | 0,7963800728323996 |
| STS Spearman | 0,7852650594721058 |
| MTEB (resultados por tarea) | Disponibles en `evaluation/mteb_results/` segun la model card, no incluidos en la informacion proporcionada |

No se han publicado en la informacion disponible resultados comparativos con otros modelos para estas mismas metricas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1,1 GB en float32 (coincide con el tamano del repositorio), unos 560 MB en float16 y unos 280 MB en int8.
- GPU recomendadas: cualquier GPU con al menos 2-4 GB de VRAM es suficiente. Para lotes grandes, una NVIDIA T4, RTX 3060, RTX 4090, A10 o A100 ofrecen margen de sobra.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU dedicada moderna e incluso en iGPU con memoria compartida para lotes pequenos.
- Opciones de despliegue: `sentence-transformers` y `transformers` son las vias naturales; `vLLM` no aplica (no es un modelo generativo con cache KV de decodificacion); `llama.cpp` y `Ollama` requieren conversion a GGUF y no estan documentados para este repositorio; `TGI` esta pensado para modelos generativos. `ONNX Runtime` u `Optimum` son alternativas razonables para servir el encoder.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | WSD (ucraniano) | STS Pearson | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| ucu-wsd-generation_back_translation_pt-true_seed-42 | 278 M | No disponible | 0,9376 | 0,7964 | No disponible | HuggingFace (0 descargas, 0 likes) |
| `sentence-transformers/paraphrase-multilingual-mpnet-base-v2` (modelo base) | 278 M | 128 tokens | No disponible | No disponible | No disponible en esta busqueda | HuggingFace |
| Otros encoders multilingues (XLM-R base, LaBSE) | No disponible | No disponible | No disponible | No disponible | No disponible | HuggingFace |

La busqueda web realizada no devolvio informacion tecnica sobre alternativas de WSD en ucraniano, por lo que no es posible establecer una comparativa cuantitativa fiable. El unico punto de comparacion directo es el modelo base, del que este repositorio hereda arquitectura y tamano y al que anade el ajuste fino en tripletas.

## Limitaciones y advertencias

- El repositorio registra 0 descargas y 0 likes, y fue creado y actualizado en septiembre de 2026: no hay evidencia de uso en produccion ni de validacion independiente.
- La licencia no esta declarada, lo que impide determinar si el uso comercial esta permitido. Conviene contactar con el autor antes de integrarlo en un producto.
- No se declaran los idiomas soportados de forma explicita; el proposito documentado es el ucraniano, y cualquier uso en otro idioma es una extrapolacion del modelo base.
- El modelo parte de un backbone multilingue entrenado con datos web, por lo que puede heredar sesgos de representacion presentes en el modelo base.
- Como encoder de similitud, no genera texto ni responde preguntas: no debe presentarse como un asistente conversacional. Toda salida es un vector.
- Riesgo de alucinacion en el sentido generativo: no aplica; el riesgo equivalente es la asignacion erronea de sentido cuando el contexto es corto o ambiguo, con una exactitud declarada de 0,9376 que implica un 6,24 % de errores.
- La longitud de contexto efectiva del modelo base (128 tokens) limita el uso en documentos largos si no se trocean en pasajes.
- Los resultados de WSD y STS proceden exclusivamente de la model card del autor; no se han reproducido de forma independiente en la informacion disponible.
- El nombre del repositorio sugiere una ablacion concreta (variante de generacion con back-translation, pooling sobre token objetivo, semilla 42); los modelos con otros sufijos no estan cubiertos por esta ficha.
- La fecha de creacion indicada (2026) y el bajo numero de interacciones aconsejan tratar el modelo como experimental.

## Enlaces

- HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-generation_back_translation_pt-true_seed-42
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Resultados MTEB del autor: `evaluation/mteb_results/` dentro del repositorio (no se ha facilitado URL directa)
- No se han encontrado papers, blogs, repositorios o demos adicionales en la busqueda web realizada; los resultados devueltos correspondian a contenidos no relacionados con el modelo.
