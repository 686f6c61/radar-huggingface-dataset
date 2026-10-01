# yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-false_seed-123

## Resumen

El modelo `yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-false_seed-123` es un ajuste fino (fine-tune) de un codificador multilingue para desambiguacion del sentido de las palabras (WSD, word-sense disambiguation) en ucraniano. Lo publica el usuario de HuggingFace `yuriilaba`, aparentemente en el contexto de un trabajo academico (el identificador "ucu" sugiere una universidad, y la nomenclatura "aug16-generation_back_translation_pt-false_seed-123" indica un experimento de aumento de datos mediante traduccion inversa con un pooling de token objetivo desactivado y semilla 123). El modelo base es `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, un encoder XLM-RoBERTa de 278 millones de parametros.

El problema que resuelve es concreto: dado un token polisemico en contexto, el modelo produce representaciones que permiten asignarle el sentido correcto. Segun la model card, alcanza una exactitud de WSD de 0,9240 y correlaciones STS de Pearson 0,8054 y Spearman 0,7939. Se trata, por tanto, de un modelo de embeddings para NLP ucraniano de bajo recursos, no de un modelo generativo.

Su relevancia es limitada pero especifica: Ucraniano es un idioma con pocos recursos en tareas de semantica lexica, y la mayoria de los sistemas WSD estan construidos para el ingles (WordNet, SensEval, SemEval). Un ajuste fino sobre un encoder multilingue con resultados medidos en WSD y MTEB es util para pipelines de procesamiento de lenguaje natural en ucraniano, siempre que se asuma que la documentacion publicada es minima (sin licencia, sin idiomas declarados en los metadatos y sin tarjeta completa).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder bidireccional XLM-RoBERTa (base), ajustado como modelo de sentence embeddings |
| Parametros totales | 278.043.648 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible en la model card; la arquitectura base XLM-RoBERTa esta limitada a 512 tokens de posicion |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene pesos en safetensors) |
| Idiomas soportados | ucraniano como idioma objetivo de la tarea; el modelo base es multilingue (no se declara lista de idiomas en los metadatos del repositorio) |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Tamano del repositorio | 1,1 GB |
| Pipeline declarado | no disponible |
| Semilla de entrenamiento | 123 |
| Semilla del split de validacion | 42 |
| Pooling de token objetivo | False |

## Arquitectura y entrenamiento

La arquitectura es un XLM-RoBERTa base (encoder transformer bidireccional, 12 capas, 278 millones de parametros) sobre el que se aplica el pipeline de Sentence-Transformers. El modelo base, `sentence-transformers/paraphrase-multilingual-mpnet-base-v2`, se entreno originalmente con el objetivo de parafrasis multilingue sobre pares de frases, lo que da representaciones de frase y de token utiles para similitud semantica y desambiguacion. El ajuste fino reutiliza esa representacion y la especializa en la tarea WSD.

Segun la model card, los datos de entrenamiento provienen del fichero `local_datasets/semi_supervised_2/triplets/triplets_generation_translation_16_samples.csv`, un conjunto de tripletes generado de forma semiautomatica. El nombre sugiere una estrategia de generacion de ejemplos mediante traduccion inversa (back-translation) con 16 muestras por sentido ("16_samples"), en un esquema de aprendizaje por tripletes (ancla, positivo, negativo) con pooling de token objetivo desactivado. No se documentan el numero total de tokens, la composicion del corpus, ni si hubo etapas de RLHF o DPO; en un encoder de este tipo esas etapas no aplican, pero si se desconoce si hubo destilacion o filtrado de tripletes. No se describe ninguna innovacion tecnica adicional (atencion lineal, decodificacion especulativa o similar); se trata de un ajuste fino estandar sobre un encoder preentrenado.

## Capacidades

- Generacion de embeddings de frase y de token para ucraniano y otros idiomas cubiertos por el modelo base.
- Desambiguacion del sentido de palabras en contexto (WSD) con exactitud declarada de 0,9240 sobre el conjunto de evaluacion del autor.
- Similitud semantica textual: STS Pearson 0,8054 y Spearman 0,7939.
- Evaluacion declarada en tareas MTEB (los resultados completos por tarea estan en `evaluation/mteb_results/` del repositorio, no incluidos en la model card).
- Recuperacion semantica y busqueda por similitud mediante distancia coseno entre embeddings.
- No es un modelo generativo: no produce texto, no soporta tool calling ni function calling, y no implementa agentes ni razonamiento multi-paso.
- No se documentan capacidades de vision, audio, modo thinking ni ventana de contexto extensa.

## Casos de uso

- Desambiguacion lexica en corpus ucranianos: dado un token polisemico y su oracion, el modelo genera un embedding que se compara con los embeddings de las definiciones de cada sentido para asignar la acepcion correcta. Es su proposito original y donde estan medidos los 0,9240 de exactitud.
- Anotacion asistida de corpus: integrar el modelo en una herramienta de anotacion para pre-etiquetar sentidos antes de la revision humana, reduciendo el coste de construir corpus WSD en ucraniano.
- Busqueda semantica en ucraniano: indexar documentos con embeddings y recuperar por similitud coseno en un motor vectorial; el encoder multilingue permite consultas cruzadas entre ucraniano e ingles.
- Deduplicacion y agrupamiento de textos: usar los embeddings para agrupar noticias, resenas o tickets similares mediante clustering (k-means, HDBSCAN) sin necesidad de tokens de contexto largos.
- Traduccion automatica asistida: seleccionar la traduccion correcta de un termino polisemico comparando el embedding del termino en contexto con los de sus traducciones candidatas, como etapa de post-edicion o de desambiguacion previa al decodificador.
- Extraccion de terminologia y ontologias: agrupar ocurrencias de un termino en funcion de su sentido para inducir sentidos no catalogados y poblar un lexico o una ontologia especifica de dominio.
- Clasificacion de intenciones en asistentes conversacionales: los embeddings sirven como capa de representacion para un clasificador ligero de intenciones en ucraniano, con la ventaja de un modelo de solo 278 millones de parametros.
- Evaluacion comparativa de modelos multilingues: al publicar resultados de WSD y MTEB, el modelo puede usarse como linea base en experimentos academicos sobre semantica lexica en idiomas de bajos recursos.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card:

| Metrica | Resultado |
|---|---|
| WSD accuracy | 0,9239543726235742 |
| STS Pearson | 0,8053828528382506 |
| STS Spearman | 0,7938549041189179 |
| Resultados MTEB por tarea | publicados en `evaluation/mteb_results/` del repositorio; no incluidos en la model card |

No se proporcionan resultados comparativos frente a otros modelos (MMLU, HumanEval, GSM8K y similares no aplican a un encoder de este tipo), ni el tamano del conjunto de evaluacion, ni la metodologia exacta del calculo de WSD accuracy.

## Requisitos de hardware

- Inferencia en FP32: aproximadamente 1,1 GB de pesos (coincide con el tamano del repositorio) mas activaciones; cabe en cualquier GPU con 4 GB de VRAM o mas.
- Inferencia en FP16/BF16: aproximadamente 550 MB de pesos; ejecutable en GPUs consumer como GTX 1650, RTX 3050, RTX 4060 o superiores.
- Cuantizacion a int8 (por ejemplo, con Optimum o PyTorch dynamic quantization): en torno a 280 MB, viable incluso en CPU para lotes pequenos.
- GPU recomendadas: cualquier GPU moderna es suficiente. Para lotes grandes o alto throughput, una RTX 4090, L4, A10G o A100 ofrece margen de sobra; una A100 o H100 no aporta ventaja significativa dado el tamano del modelo.
- Despliegue: al ser un modelo de Sentence-Transformers con pesos safetensors, es compatible con `sentence-transformers`, `transformers` con `AutoModel`, y con servidores de embeddings como HuggingFace Text Embeddings Inference (TEI), FastAPI propio, Ray Serve o BentoML. No hay pesos GGUF publicados, por lo que `llama.cpp` y `Ollama` no son aplicables sin conversion previa. vLLM y TGI estan orientados a modelos generativos y no son la via natural para este encoder.
- Latencia y throughput: no disponibles. Como referencia orientativa de orden de magnitud, un encoder de 278 millones de parametros procesa cientos de frases por segundo en una GPU moderna en FP16, pero no hay mediciones publicadas para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yuriilaba/ucu-wsd-aug16-... (este modelo) | 278 M | no disponible (arquitectura base: 512 tokens) | WSD ucraniano + embeddings | no disponible | HuggingFace, 0 descargas |
| sentence-transformers/paraphrase-multilingual-mpnet-base-v2 (modelo base) | 278 M | 512 tokens | Embeddings multilingues de frase | Apache-2.0 | HuggingFace, ampliamente usado |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | 118 M | 128 tokens | Embeddings multilingues de frase | Apache-2.0 | HuggingFace, ampliamente usado |
| xlm-roberta-base (encoder sin ajuste de similitud) | 278 M | 512 tokens | Representaciones contextuales generales | MIT | HuggingFace |

No se dispone de resultados de benchmarks del modelo base ni de las alternativas en el mismo conjunto de evaluacion, por lo que la comparacion cuantitativa de rendimiento no esta disponible.

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explicita, no hay autorizacion clara para uso comercial. Conviene contactar con el autor antes de integrarlo en un producto.
- Metadatos incompletos: no se declaran idiomas, pipeline ni licencia en HuggingFace, y no hay ficha tecnica mas alla de la configuracion de entrenamiento y tres metricas.
- Conjunto de entrenamiento muy pequeno y de origen semiautomatico: el fichero se llama `triplets_generation_translation_16_samples.csv`, lo que apunta a 16 muestras por sentido generadas por traduccion inversa. Esto implica riesgo de sobreajuste y de baja cobertura de sentidos poco frecuentes.
- Idiomas: la tarea declarada es el ucraniano. Aunque el modelo base es multilingue, no hay evaluacion publicada de su comportamiento en otros idiomas.
- Sesgos: al derivar de un corpus semiautomatico y de un modelo multilingue preentrenado en datos web, puede heredar sesgos de dominio, de registro y culturales. No se documenta ningun analisis de sesgo.
- Alucinacion: al ser un encoder no genera texto, pero puede asignar un sentido incorrecto con alta similitud coseno. En produccion conviene fijar un umbral de confianza y derivar a revision humana los casos dudosos.
- Limitacion de contexto: la arquitectura base XLM-RoBERTa no supera los 512 tokens, por lo que el modelo no sirve para documentos largos sin troceado y agregacion de embeddings.
- Sin cuantizaciones publicadas ni pesos GGUF: el despliegue en CPU o en entornos de bajos recursos requiere conversion propia.
- Repositorio sin descargas ni likes: no hay evidencia de uso en produccion ni de validacion independiente de los resultados declarados.
- Trazabilidad: al ser un experimento academico con semilla fija, los resultados pueden no reproducirse sin el dataset original, que no esta publicado en el repositorio.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yuriilaba/ucu-wsd-aug16-generation_back_translation_pt-false_seed-123
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-mpnet-base-v2
- Resultados MTEB declarados por el autor: `evaluation/mteb_results/` dentro del repositorio del modelo
- No se han encontrado en la busqueda web enlaces relevantes (paper, blog, repositorio de codigo o demo) asociados a este modelo; los resultados devueltos no guardan relacion con el contenido tecnico solicitado.
