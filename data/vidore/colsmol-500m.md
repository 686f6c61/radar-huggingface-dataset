# vidore/colSmol-500M

## Resumen

colSmol-500M es un modelo de recuperación visual de documentos (visual document retrieval) desarrollado por el grupo vidore, basado en SmolVLM-Instruct-500M y la estrategia de representación multi-vector ColBERT. El modelo genera embeddings densos por token (late interaction) tanto para consultas textuales como para páginas de documentos, lo que permite indexar PDFs y documentos digitalizados a partir de sus características visuales sin depender de un paso previo de OCR.

El modelo se introdujo en el marco del trabajo ColPali, presentado en el paper "ColPali: Efficient Document Retrieval with Vision Language Models" (arXiv:2407.01449), y esta versión concreta se entrenó durante 3 épocas con un batch size de 32. Con aproximadamente 500 millones de parámetros, es una alternativa ligera frente a los modelos ColPali originales (basados en PaliGemma-3B) y está diseñado para entornos con recursos computacionales limitados.

Su relevancia actual radica en que permite construir sistemas de búsqueda semántica sobre documentos visualmente complejos (gráficas, tablas, diagramas) con una huella de memoria reducida, manteniendo la licencia MIT y un formato de pesos abierto (safetensors) compatible con Sentence Transformers y el ecosistema colpali-engine.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SmolVLM-Instruct-500M con estrategia ColBERT (multi-vector, late interaction) |
| Parametros totales | ~500 millones |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bfloat16 (entrenado); no se documentan cuantizaciones adicionales |
| Idiomas soportados | Ingles (entrenamiento); posible generalizacion zero-shot a otros idiomas segun el paper |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

colSmol-500M extiende SmolVLM-Instruct-500M, un modelo de lenguaje y vision (VLM) compacto, para generar representaciones multi-vector estilo ColBERT de texto e imagenes. En lugar de producir un unico embedding por documento, el modelo genera una secuencia de vectores (uno por token relevante) tanto para consultas como para paginas, y el scoring se realiza mediante late interaction MaxSim, que calcula la similitud maxima entre cada vector de la consulta y los vectores del documento. Esta arquitectura permite capturar matices de informacion visual que los embeddings de documento unico pierden.

El entrenamiento se realizo sobre un dataset de 127.460 pares consulta-pagina, compuesto por un 63% de conjuntos academicos publicos y un 37% de datos sinteticos generados a partir de PDFs obtenidos por web crawling con preguntas pseudo-generadas mediante Claude-3 Sonnet. El dataset es completamente en ingles por diseno, para estudiar la generalizacion zero-shot a otros idiomas, y se verifico que ningun PDF multipagina apareciera simultaneamente en el benchmark ViDoRe y en el conjunto de entrenamiento. Se utilizaron adaptadores LoRA (alpha=32, r=32) sobre las capas transformer del modelo de lenguaje y la capa de proyeccion final, con optimizador paged_adamw_8bit, learning rate de 5e-4 con decaimiento lineal y 2,5% de warmup steps. Esta version concreta se entreno con batch size 32 durante 3 epocas en una configuracion de 4 GPUs con paralelismo de datos.

## Capacidades

- Recuperacion visual de documentos: indexa paginas completas de PDFs a partir de sus caracteristicas visuales, sin necesidad de OCR previo.
- Generacion de embeddings multi-vector estilo ColBERT para consultas y documentos, con scoring por late interaction MaxSim.
- Comprension conjunta de texto e imagen: maneja graficas, tablas, diagramas y elementos de layout que los sistemas basados solo en texto pierden.
- Integracion con Sentence Transformers mediante la clase `MultiVectorEncoder`, que abstrae la codificacion de consultas y documentos.
- Compatibilidad con el ecosistema colpali-engine (ColIdefics3) para pipelines de recuperacion completos.
- Generalizacion zero-shot a idiomas no ingleses, segun lo estudiado en el paper ColPali, aunque el entrenamiento fue exclusivamente en ingles.
- Soporte de procesamiento por lotes (batch) de multiples imagenes y consultas en una sola pasada.

## Casos de uso

- Busqueda semantica en archivos PDF corporativos: el modelo indexa documentos internos (informes, manuales, contratos) directamente desde su renderizado visual, permitiendo consultas en lenguaje natural sin depender de la calidad del texto extraido.
- Recuperacion de informacion en documentos cientificos: permite buscar en papers academicos por contenido de figuras, graficas y tablas, algo que los motores de busqueda textuales no cubren.
- RAG visual (Retrieval-Augmented Generation): integrado como retriever en un pipeline de generacion aumentada, alimenta a un LLM con paginas relevantes de documentos visuales para responder preguntas con contexto fiel a la fuente.
- Atencion al cliente con documentacion tecnica: indexa manuales de producto y guias de usuario escaneadas, permitiendo a un chatbot localizar la pagina exacta que responde a una duda del usuario.
- Analisis de facturas y formularios: recupera documentos financieros por su contenido visual (importes, fechas, logotipos), util para auditorias y conciliacion automatica.
- Archivo historico y digitalizacion de prensa: indexa periodicos y documentos antiguos escaneados donde el OCR falla, habilitando busquedas por contenido visual y layout.
- Busqueda en bases de conocimiento de soporte tecnico: localiza paginas de documentacion con diagramas o capturas de pantalla que responden a problemas especificos del usuario.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El modelo esta disenado para ser evaluado en el benchmark ViDoRe, mencionado en la model card, pero no se proporcionan puntuaciones concretas de MMLU, HumanEval, GSM8K ni metricas de recuperacion (nDCG, Recall) en la documentacion accesible. Tampoco se ofrecen comparativas numericas con otros modelos de recuperacion visual.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 1 GB en bfloat16 para los pesos del modelo (500M parametros), mas el overhead de activaciones y procesamiento de imagenes, por lo que se estima un consumo total de 2-4 GB en funcion de la resolucion de los documentos.
- GPU recomendadas: cualquier GPU consumer con al menos 6 GB de VRAM (RTX 3060, RTX 4060, RTX 4090) es suficiente para inferencia. Para entrenamiento o fine-tuning, se recomienda una GPU con 12-24 GB (RTX 3090, A100) o un setup multi-GPU.
- Compatibilidad con consumer GPUs: si, el modelo cabe comodamente en GPUs de gama media gracias a su tamano reducido.
- Opciones de despliegue: Sentence Transformers (via `MultiVectorEncoder`), colpali-engine (clase `ColIdefics3`), y transformers con `attn_implementation="flash_attention_2"` o `"eager"`.
- Latencia y throughput: no disponible en la documentacion del modelo. Al ser un modelo de 500M parametros, se espera una latencia inferior a la de los modelos ColPali de 3B, aunque no se ofrecen mediciones concretas.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Estrategia | Licencia | Contexto |
|---|---|---|---|---|---|
| vidore/colSmol-500M | SmolVLM-Instruct-500M | ~500M | ColBERT multi-vector | MIT | no disponible |
| vidore/colSmol-500M-base | SmolVLM-500M-Base-22750 | ~500M | ColBERT multi-vector | MIT | no disponible |
| ColPali (original) | PaliGemma-3B | ~3B | ColBERT multi-vector | no disponible | no disponible |

La comparativa se limita a los modelos de la misma familia ColPali identificados en la informacion disponible. colSmol-500M se distingue por su tamano reducido (500M frente a los 3B del ColPali original) y por estar basado en la variante Instruct de SmolVLM, lo que lo hace mas adecuado para despliegues con recursos limitados. No se dispone de datos de rendimiento comparativo entre estas variantes.

## Limitaciones y advertencias

- Enfoque principal en documentos tipo PDF y en idiomas de altos recursos: el entrenamiento fue exclusivamente en ingles, por lo que la generalizacion a otros idiomas es zero-shot y puede degradarse en lenguas con poca representacion en el corpus de preentrenamiento.
- Riesgo de alucinacion en la generacion de pseudo-preguntas sinteticas del dataset de entrenamiento, que podria introducir sesgos en la recuperacion.
- Dependencia de la calidad visual del documento: documentos con baja resolucion, rotaciones o layouts muy complejos pueden afectar al rendimiento de la indexacion.
- Compatibilidad con colpali-engine: la model card advierte que versiones recientes de colpali-engine cambiaron el formato de prompts (prefijo "Query: " y nueva linea final), por lo que los embeddings generados con la configuracion de Sentence Transformers de este repositorio difieren de los de colpali-engine actual. Es necesario usar la version de Sentence Transformers incluida en el repo o ajustar los prompts manualmente.
- Tamano del repositorio de 1,1 GB: aunque el modelo es ligero, la descarga completa requiere ancho de banda considerable en entornos con restricciones de red.
- Sin datos de benchmarks publicados: no es posible validar el rendimiento del modelo frente a alternativas sin ejecutar una evaluacion propia sobre ViDoRe u otros conjuntos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vidore/colSmol-500M
- Variante base (sin Instruct): https://huggingface.co/vidore/colSmol-500M-base
- Repositorio ColPali (codigo y arquitectura): https://github.com/ManuelFay/colpali
- Paper ColPali (arXiv:2407.01449): https://arxiv.org/abs/2407.01449
- Paper ColBERT (arXiv:2004.12832): https://arxiv.org/abs/2004.12832
- Paper LoRA (arXiv:2106.09685): https://arxiv.org/abs/2106.09685
- Coleccion ViDoRe benchmark: https://huggingface.co/collections/vidore/vidore-benchmark-667173f98e70a1c0fa4db00d
- Ejemplo de uso en proyecto RAG (GitHub): https://github.com/K0EKJE/VLM-Based-Retrieval-Augmented-Generation/tree/main/benchmark_run_metrics/vidore_colSmol-500M-FT
