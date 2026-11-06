# vllm-project/ColUltraVBERT

## Resumen

ColUltraVBERT es un recuperador (retriever) de documentos visuales basado en interacción tardía (late interaction) y multi-vector, desarrollado por el autor athrael-soju y replicado en la organizacion vllm-project para uso interno de CI. Se trata de un fine-tune de UltraVBERT, un encoder vision-language que alinea imagenes de pagina completa con texto, y sigue el paradigma ColBERT/ColPali: cada token de la consulta y cada token de la pagina se proyectan a un vector de 768 dimensiones, y la relevancia se calcula mediante MaxSim. El modelo resuelve el problema de la recuperacion de documentos visuales (paginas escaneadas, informes, tablas, graficos) sin necesidad de OCR ni de extraccion de texto previa.

Con 254 millones de parametros, el modelo es lo suficientemente pequeno para desplegarse en infraestructura modesta, pero compite en la familia ViDoRe con recuperadores visuales mas grandes. Su relevancia actual radica en que mejora de forma sustancial a ColModernVBERT en los tres conjuntos ViDoRe (V1, V2 y V3), con incrementos medios de casi 5 puntos en V1, 14 puntos en V2 y mas de 23 puntos en V3, manteniendo una licencia MIT permisiva y soporte nativo en sentence-transformers y transformers.

El checkpoint publicado en vllm-project es una copia exacta del original de athrael-soju (commit `486d2f2`), creada para reducir el riesgo de cadena de suministro en el CI de vLLM. La ficha se centra en las capacidades y especificaciones del modelo tal como se documentan en su model card.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language con proyeccion lineal a vectores de recuperacion; late interaction multi-vector (estilo ColBERT/ColPali) sobre encoder UltraVBERT |
| Parametros totales | 254.088.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en tokens; las paginas se redimensionan a maximo 3.072 px en el lado mayor y se dividen en hasta 25 tiles de 512 px mas una vista reducida de la pagina completa (hasta 1.664 vectores de imagen por pagina) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bf16 segun los resultados MTEB) |
| Idiomas soportados | en, es, de, fr, it, pt |
| Licencia | MIT |
| Formato de pesos | safetensors (libreria sentence-transformers, con codigo custom `ultravbert`) |

## Arquitectura y entrenamiento

ColUltraVBERT parte de UltraVBERT, un encoder vision-language que alinea representaciones de texto con imagenes de pagina. Sobre los estados de token de 768 dimensiones del encoder, una capa lineal los proyecta a un vector de recuperacion tambien de 768 dimensiones; los vectores se normalizan L2 y se descartan los tokens de padding. El procesamiento de pagina es multi-escala: la imagen se redimensiona a un maximo de 3.072 px en el lado mayor y se divide en hasta 25 tiles de 512 px, anadiendo ademas una vista reducida de la pagina completa, lo que produce hasta 1.664 vectores de imagen por pagina mas los vectores de prompt y de etiqueta de tile. La puntuacion entre consulta y pagina se obtiene por MaxSim sobre los vectores de token.

El entrenamiento se realizo sobre VDR Train 500k, un dataset de 499.704 pares consulta-pagina con consultas en ingles (73%), espanol, aleman, frances, italiano y portugues. Los pesos publicados son una fusion por bloques de cuatro fine-tunes de UltraVBERT que difieren en negativos duros, destilacion y semilla. Cada fine-tune entrena adaptadores LoRA de rango 32 sobre el encoder de texto y la proyeccion de salida durante una epoca, con batch size 256 y perdidas Matryoshka a 128, 256, 320, 512 y 768 dimensiones; el encoder de vision y el conector permanecen congelados. Esta estrategia Matryoshka permite truncar los vectores a 128, 256, 320 o 512 dimensiones y renormalizarlos para reducir el tamano del indice.

## Capacidades

- Recuperacion de documentos visuales: puntua paginas completas (incluidas tablas, graficos, formularios y diagramas) frente a consultas en lenguaje natural sin OCR.
- Interaccion tardia multi-vector: representacion por token de consulta y de pagina, con puntuacion MaxSim, lo que captura correspondencias finas entre terminos y regiones de la pagina.
- Representaciones Matryoshka: truncamiento de vectores a 128, 256, 320 o 512 dimensiones con renormalizacion L2 para indices mas compactos.
- Multilingue: consultas y documentos en ingles, espanol, aleman, frances, italiano y portugues.
- Procesamiento multi-escala de pagina: hasta 25 tiles de 512 px mas una vista global, con resolucion configurable (por ejemplo, 2.048 px y 16 tiles para paginas mas ligeras).
- Integracion con sentence-transformers mediante `MultiVectorEncoder`, con metodos `encode_document`, `encode_query` y `similarity`.
- Soporte nativo en transformers 5.21 o superior (documentacion `ultravbert`); en 5.20.x requiere `trust_remote_code=True`.
- No se documentan capacidades de generacion de texto, tool calling, agentes, vision general, audio ni modo de razonamiento: es exclusivamente un modelo de recuperacion.

## Casos de uso

- Recuperacion en archivos corporativos escaneados: indexar informes anuales, facturas y contratos en PDF como imagenes de pagina y recuperar las paginas relevantes ante consultas como "cual fue el ingreso de 2023", sin pipeline de OCR. El modelo maneja tablas y graficos que el OCR suele degradar.
- Busqueda sobre documentacion tecnica y cientifica: articulos, manuales y papers con formulas y figuras; la vista multi-escala (tiles mas pagina completa) permite localizar tanto detalles finos como contexto global.
- Atencion al cliente sobre base documental visual: recuperar la pagina exacta de un manual o folleto de producto ante una pregunta del usuario, usando la ventana multi-vector para puntuar correspondencias parciales.
- Cumplimiento y auditoria documental: localizar paginas con tablas de margenes regionales, clausulas o datos regulatorios en expedientes heterogeneos, con soporte multilingue para corpora en espanol, aleman, frances, italiano y portugues.
- Recuperacion en dominios regulados: los resultados ViDoRe V3 en finanzas, farmaceutica, energia, recursos humanos, industrial, fisica, nuclear y telecom sugieren utilidad en busquedas internas de sectores especializados.
- Indices a gran escala con presupuesto de almacenamiento ajustado: truncar los vectores a 128 o 256 dimensiones reduce el tamano del indice manteniendo el paradigma de interaccion tardia, adecuado para despliegues con millones de paginas.
- Integracion en pipelines RAG sobre documentos visuales: usar las paginas recuperadas como entrada a un modelo generador multimodal para respuesta aumentada, manteniendo el recuperador separado y especializado.

## Benchmarks y rendimiento

Resultados oficiales de MTEB (MTEB 2.26.3, vectores de 768 dimensiones, bf16, atencion SDPA). Las tareas privadas de ViDoRe V3 (Nuclear y Telecom) fueron puntuadas por los mantenedores de MTEB.

| ViDoRe V1 (nDCG@5) | ColModernVBERT | ColUltraVBERT |
|---|---:|---:|
| ArxivQA | 75,0 | 80,1 |
| DocVQA | 56,2 | 57,7 |
| InfoVQA | 86,5 | 89,5 |
| TabFQuAD | 76,1 | 92,5 |
| TAT-DQA | 73,9 | 75,1 |
| ShiftProject | 64,8 | 81,2 |
| SyntheticDocQA AI | 97,5 | 99,6 |
| SyntheticDocQA Energy | 94,2 | 95,7 |
| SyntheticDocQA Government Reports | 93,3 | 95,1 |
| SyntheticDocQA Healthcare Industry | 96,9 | 97,9 |
| **Media** | **81,4** | **86,4** |

| ViDoRe V2 (nDCG@5) | ColModernVBERT | ColUltraVBERT |
|---|---:|---:|
| ESG Reports | 40,5 | 49,8 |
| Economics Reports | 32,6 | 51,2 |
| BioMedical Lectures | 34,8 | 54,3 |
| ESG Reports HL | 54,8 | 64,0 |
| **Media** | **40,7** | **54,8** |

| ViDoRe V3 (nDCG@10) | ColModernVBERT | ColUltraVBERT |
|---|---:|---:|
| Computer Science | 37,6 | 66,5 |
| Energy | 32,5 | 51,9 |
| Finance EN | 28,8 | 53,3 |
| Finance FR | 19,8 | 33,3 |
| HR | 19,8 | 51,1 |
| Industrial | 15,7 | 37,6 |
| Pharmaceuticals | 32,2 | 57,6 |
| Physics | 22,6 | 37,7 |
| Nuclear (privada) | 21,5 | 42,0 |
| Telecom (privada) | 30,3 | 62,0 |
| **Media, publicas** | **26,1** | **48,6** |
| **Media, privadas** | **25,9** | **52,0** |
| **Media, todas** | **26,1** | **49,3** |

Los resultados con vectores truncados proceden de caracteristicas de pagina cacheadas; a 768 dimensiones y 3.072 px estan dentro de 0,1 de las medias oficiales. Para paginas de 2.048 px con 16 tiles se ajustan `size.longest_edge` a 2048 y `max_image_tiles` a 16 en `processor_config.json`, generando como maximo 1.088 vectores de imagen por pagina. La tabla de resultados por tamano de vector y resolucion de pagina no esta completa en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Con 254 millones de parametros, los pesos en bf16 ocupan aproximadamente 0,5 GB; el coste dominante es la codificacion de imagenes (hasta 25 tiles de 512 px mas la vista global por pagina), que eleva el uso de memoria de activaciones por encima del de los pesos.
- GPU recomendadas: no disponibles en la informacion proporcionada. Por tamano de modelo, una GPU consumer de gama media-alta (por ejemplo, RTX 3090 o RTX 4090) deberia ser suficiente para inferencia en bf16; para indexacion por lotes a gran escala se recomiendan aceleradores de centro de datos (A100, H100) sin que la model card lo confirme.
- Cabe en GPU consumer: si, por el tamano de pesos; el limite practico es el batch de imagenes y la resolucion de pagina configurada.
- Opciones de despliegue: sentence-transformers (>= 6.1) con `MultiVectorEncoder` y transformers (>= 5.21, soporte nativo `ultravbert`; en 5.20.x con `trust_remote_code=True`). El repositorio esta alojado en la organizacion vllm-project para uso en CI, aunque no se documenta soporte especifico en el motor vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Paradigma | Contexto / pagina | ViDoRe V1 (media) | ViDoRe V2 (media) | ViDoRe V3 (media) | Licencia |
|---|---|---|---|---|---|---|---|
| ColUltraVBERT | 254 M | Late interaction multi-vector | Hasta 1.664 vectores de imagen por pagina (3.072 px, 25 tiles) | 86,4 | 54,8 | 49,3 | MIT |
| ColModernVBERT | no disponible | Late interaction multi-vector | no disponible | 81,4 | 40,7 | 26,1 | no disponible |
| BiUltraVBERT | no disponible | Single-vector sobre UltraVBERT | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a los modelos para los que la model card aporta datos. ColModernVBERT es el unico recuperador visual con resultados comparables publicados en la informacion disponible; BiUltraVBERT pertenece a la misma familia pero no se aportan metricas. No se dispone de datos de otros recuperadores visuales como ColPali o ColQwen para esta comparativa.

## Limitaciones y advertencias

- Orientado exclusivamente a recuperacion: no genera texto, no soporta tool calling ni razonamiento multi-paso; debe combinarse con un generador en pipelines RAG.
- Coste de indexacion elevado: hasta 1.664 vectores de 768 dimensiones por pagina implican un indice mucho mayor que un recuperador single-vector; el truncamiento Matryoshka a 128-512 dimensiones mitiga el almacenamiento a costa de precision no cuantificada en la informacion disponible.
- Resolucion y tiles configurables: reducir a 2.048 px y 16 tiles disminuye el numero de vectores, pero el impacto exacto en las metricas no se detalla en la model card.
- Cobertura linguistica limitada a seis idiomas (en, es, de, fr, it, pt); el 73% de las consultas de entrenamiento son en ingles, lo que puede introducir desequilibrio de rendimiento entre idiomas.
- Riesgo de alucinacion no aplica a la generacion, pero si el riesgo de recuperacion erronea: las puntuaciones MaxSim no garantizan relevancia semantica y pueden favorecer coincidencias superficiales de tokens.
- Sesgos: no se documentan evaluaciones de sesgo, robustez ante documentos degradados ni comportamiento en dominios fuera de ViDoRe.
- Licencia MIT: permite uso comercial y modificacion con atribucion; el modelo base UltraVBERT debe verificarse por separado, ya que su licencia no se detalla en esta informacion.
- Checkpoint replicado: la copia en vllm-project corresponde al commit `486d2f2` del original; para desarrollo se recomienda usar el repositorio de athrael-soju, que puede recibir actualizaciones.
- Requiere versiones concretas de librerias (sentence-transformers >= 6.1, transformers >= 5.21 o `trust_remote_code=True`), lo que puede complicar entornos con dependencias fijadas.

## Enlaces

- Modelo en Hugging Face (copia vllm-project): https://huggingface.co/vllm-project/ColUltraVBERT
- Modelo original: https://huggingface.co/athrael-soju/ColUltraVBERT
- Modelo base UltraVBERT: https://huggingface.co/athrael-soju/UltraVBERT
- Recuperador single-vector BiUltraVBERT: https://huggingface.co/athrael-soju/BiUltraVBERT
- Dataset VDR Train 500k: https://huggingface.co/datasets/athrael-soju/vdr-train-500k
- Demo en Spaces: https://huggingface.co/spaces/athrael-soju/ColUltraVBERT
- Documentacion de UltraVBERT en transformers: https://huggingface.co/docs/transformers/model_doc/ultravbert
- Resultados MTEB (PR #783): https://github.com/embeddings-benchmark/results/pull/783
- Resultados MTEB de tareas privadas ViDoRe V3 (PR #792): https://github.com/embeddings-benchmark/results/pull/792
- Modelo de comparacion ColModernVBERT: https://huggingface.co/ModernVBERT/colmodernvbert
