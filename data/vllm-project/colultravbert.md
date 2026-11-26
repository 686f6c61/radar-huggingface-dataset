# vllm-project/ColUltraVBERT

## Resumen

ColUltraVBERT es un recuperador de documentos visuales basado en late interaction (estilo ColBERT/ColPali), desarrollado originalmente por el usuario athrael-soju y replicado en la organizacion vllm-project para uso en su infraestructura de integracion continua. Con 254 millones de parametros, codifica cada token de la consulta y cada token de la pagina como un vector de 768 dimensiones, y ordena las paginas mediante la puntuacion MaxSim. Deriva por fine-tuning del encoder UltraVBERT, que alinea representaciones de texto con imagenes de pagina.

El modelo resuelve el problema de la recuperacion de informacion en documentos visuales (PDF escaneados, informes con tablas, graficos y maquetacion compleja) sin necesidad de OCR ni de extraccion de texto previa: opera directamente sobre la imagen de la pagina. Su ventana de procesamiento admite paginas de hasta 3.072 px en el lado mayor, divididas en hasta 25 teselas de 512 px mas una vista reducida de la pagina completa, lo que produce hasta 1.664 vectores de imagen por pagina.

Es relevante porque combina un tamano contenido (255M parametros, 0,5 GB de repositorio) con resultados claramente superiores a ColModernVBERT en las tres generaciones del benchmark ViDoRe, y porque admite truncamiento Matryoshka de los vectores a 128, 256, 320 o 512 dimensiones para reducir el coste del indice. La licencia MIT y el soporte nativo en sentence-transformers y transformers facilitan su adopcion en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-language con late interaction (multi-vector, estilo ColBERT/ColPali); encoder base UltraVBERT mas proyeccion lineal a 768 dimensiones |
| Parametros totales | 254.088.960 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible como ventana de tokens; procesa paginas de hasta 3.072 px en el lado mayor, divididas en hasta 25 teselas de 512 px mas una vista global (hasta 1.664 vectores de imagen por pagina) |
| Tipos de cuantizacion | no disponible (el autor solo documenta inferencia en bf16) |
| Idiomas soportados | en, es, de, fr, it, pt |
| Licencia | MIT |
| Formato de pesos | safetensors, con codigo custom (`custom_code`); libreria sentence-transformers |

## Arquitectura y entrenamiento

La arquitectura parte de UltraVBERT, un encoder vision-language que alinea estados de token de texto con imagenes de pagina. Sobre el se anade una capa lineal que proyecta cada estado de token de 768 dimensiones a un vector de recuperacion de 768 dimensiones; los vectores se normalizan L2 y se descartan los tokens de padding. La puntuacion se calcula con MaxSim entre los vectores de consulta y los de pagina, el esquema clasico de late interaction. Las paginas se redimensionan a un maximo de 3.072 px en el lado mayor y se dividen en hasta 25 teselas de 512 px, mas una vista reducida de la pagina completa, generando hasta 1.664 vectores de imagen por pagina mas los vectores de prompt y de etiqueta de tesela.

El entrenamiento se realizo sobre el dataset VDR Train 500k (499.704 pares consulta-pagina, con consultas en ingles al 73% y el resto en espanol, aleman, frances, italiano y portugues). Los pesos publicados son una mezcla por bloques de cuatro fine-tunes de UltraVBERT que difieren en negativos duros, destilacion y semilla. Cada fine-tune entrena adaptadores LoRA de rango 32 sobre el encoder de texto y la proyeccion de salida durante una epoca, con batch de 256, usando perdidas Matryoshka a 128, 256, 320, 512 y 768 dimensiones; el encoder de vision y el conector permanecen congelados. El truncamiento Matryoshka permite reducir el indice conservando solo las primeras dimensiones de cada vector y renormalizando.

## Capacidades

- Recuperacion de documentos visuales (visual document retrieval) directamente sobre imagenes de pagina, sin OCR.
- Codificacion multi-vector con late interaction y puntuacion MaxSim entre consulta y pagina.
- Representaciones Matryoshka truncables a 128, 256, 320 o 512 dimensiones para indexacion mas compacta.
- Busqueda multilingue en ingles, espanol, aleman, frances, italiano y portugues.
- Manejo de documentos con maquetacion compleja: tablas, graficos, informes financieros, articulos cientificos y formularios.
- Ajuste de resolucion y numero de teselas mediante `processor_config.json` (por ejemplo, 2.048 px y 16 teselas para paginas mas ligeras).
- No se documenta soporte de tool calling, function calling, agentes, generacion de texto libre, vision general, audio ni modo de razonamiento explicito.

## Casos de uso

- Busqueda semantica sobre archivos PDF corporativos: indexar las paginas como imagenes y recuperar las relevantes para una consulta en lenguaje natural, sin pipeline de OCR ni extraccion de texto, lo que preserva tablas y graficos.
- Recuperacion en informes financieros y ESG: el modelo obtiene 49,8 de nDCG@5 en ESG Reports y 51,2 en Economics Reports (ViDoRe V2), escenarios donde el contenido esta en tablas y no en parrafos.
- Busqueda en literatura cientifica y medica: con 54,3 en BioMedical Lectures (ViDoRe V2) y 66,5 en Computer Science (ViDoRe V3), es adecuado para localizar paginas concretas en articulos y actas.
- Atencion al cliente sobre documentacion tecnica multilingue: consultas en espanol, aleman, frances, italiano o portugues contra manuales y fichas de producto indexados como imagenes.
- Sistemas RAG sobre documentos escaneados: sustituir la etapa de OCR mas chunking de texto por recuperacion visual de paginas y pasar la pagina recuperada a un modelo de vision-lenguaje para la respuesta.
- Indexacion a gran escala con presupuesto de almacenamiento ajustado: truncar los vectores a 128 o 256 dimensiones reduce el tamano del indice, con una perdida de calidad que el autor situa dentro de 0,1 puntos de las medias oficiales a 768 dimensiones y 3.072 px.
- Cumplimiento y auditoria documental: localizar clausulas o tablas especificas en contratos y expedientes escaneados conservando la evidencia visual de la pagina.

## Benchmarks y rendimiento

Resultados oficiales de MTEB 2.26.3 con vectores de 768 dimensiones, bf16 y atencion SDPA, comparados con ColModernVBERT.

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
| Nuclear (privado) | 21,5 | 42,0 |
| Telecom (privado) | 30,3 | 62,0 |
| **Media, publico** | **26,1** | **48,6** |
| **Media, privado** | **25,9** | **52,0** |
| **Media, total** | **26,1** | **49,3** |

Las puntuaciones de ColUltraVBERT en ViDoRe V1 y V2 son ejecuciones propias del autor en MTEB 2.26.3; las de V3 (incluidas las tareas privadas Nuclear y Telecom) fueron calculadas por los mantenedores de MTEB. Las puntuaciones de ColModernVBERT en V1 y V2 corresponden a la revision `9052fc0e`; las de V3 son sus resultados oficiales de MTEB.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 254M parametros; en bf16 los pesos ocupan aproximadamente 0,5 GB, por lo que la inferencia cabe holgadamente en cualquier GPU consumer con 8 GB o mas. El cuello de botella no es el modelo sino la codificacion de imagenes: una pagina a 3.072 px con 25 teselas genera hasta 1.664 vectores y requiere memoria de activaciones proporcional al numero de teselas.
- GPU recomendadas: cualquier GPU con 8-16 GB para lotes pequenos (RTX 3060, RTX 4070, RTX 4090); A100 o H100 para indexacion masiva con lotes grandes y alto throughput.
- Cabe en GPU consumer: si, en tarjetas de 8 GB en adelante con bf16 o fp16.
- Opciones de despliegue: sentence-transformers (`MultiVectorEncoder`, requiere `sentence-transformers>=6.1` y `transformers>=5.21`, que soporta UltraVBERT de forma nativa; en 5.20.x hay que pasar `trust_remote_code=True`). El repositorio es una copia mantenida por vllm-project para su CI, lo que sugiere integracion con el ecosistema vLLM, aunque no se documentan detalles de esa integracion.
- Latencia y throughput: no disponibles en la informacion proporcionada. El coste dominante es la codificacion de imagenes (hasta 25 teselas de 512 px por pagina), no la proyeccion de texto.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | ViDoRe V1 (media) | ViDoRe V2 (media) | ViDoRe V3 (media publica) | Licencia |
|---|---|---:|---:|---:|---:|---|
| ColUltraVBERT | 254M | Late interaction multi-vector | 86,4 | 54,8 | 48,6 | MIT |
| ColModernVBERT | no disponible | Late interaction multi-vector | 81,4 | 40,7 | 26,1 | no disponible |
| BiUltraVBERT | no disponible | Single-vector | no disponible | no disponible | no disponible | no disponible |
| UltraVBERT (base) | no disponible | Encoder vision-language | no disponible (no es recuperador) | no disponible | no disponible | no disponible |

ColModernVBERT es la alternativa mas directa y la unica con datos comparativos publicados en la informacion disponible; ColUltraVBERT le supera en las tres generaciones de ViDoRe, con la mayor ventaja en V3 (49,3 frente a 26,1 en la media total) y en V2 (54,8 frente a 40,7). BiUltraVBERT es el recuperador single-vector de la misma familia, con indice mas compacto pero sin resultados publicados en la informacion disponible.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, solo representaciones y puntuaciones de similitud. No sirve para responder preguntas directamente ni para tool calling.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si de recuperacion erronea: MaxSim puede puntuar alto paginas visualmente similares con contenido distinto.
- Sesgo linguistico: el 73% de las consultas de entrenamiento estan en ingles; el rendimiento en espanol, aleman, frances, italiano y portugues puede ser inferior al reportado en las medias globales, que estan dominadas por el ingles.
- Coste de indexacion elevado: hasta 1.664 vectores de 768 dimensiones por pagina a maxima resolucion, lo que multiplica el almacenamiento frente a un recuperador single-vector; el truncamiento Matryoshka mitiga el problema a costa de cierta perdida de calidad.
- Requiere versiones recientes de las librerias (`sentence-transformers>=6.1`, `transformers>=5.21`) o `trust_remote_code=True`, lo que anade dependencia de codigo custom en el repositorio.
- El repositorio es una copia de un checkpoint alojado en una cuenta personal (commit `486d2f2`); la version canonica y su mantenimiento dependen del autor original.
- Licencia MIT: permite uso comercial sin restricciones documentadas, pero no se especifican garantias ni condiciones adicionales sobre los datos de entrenamiento (VDR Train 500k), cuya procedencia y licencia no se detallan en la informacion disponible.
- No se documentan cuantizaciones oficiales ni resultados en fp8/int8, por lo que el despliegue en precision reducida queda sin validar.

## Enlaces

- Modelo en Hugging Face (copia vllm-project): https://huggingface.co/vllm-project/ColUltraVBERT
- Modelo original: https://huggingface.co/athrael-soju/ColUltraVBERT
- Modelo base UltraVBERT: https://huggingface.co/athrael-soju/UltraVBERT
- Recuperador single-vector BiUltraVBERT: https://huggingface.co/athrael-soju/BiUltraVBERT
- Dataset de entrenamiento VDR Train 500k: https://huggingface.co/datasets/athrael-soju/vdr-train-500k
- Demo en Spaces: https://huggingface.co/spaces/athrael-soju/ColUltraVBERT
- Documentacion de UltraVBERT en transformers: https://huggingface.co/docs/transformers/model_doc/ultravbert
- Resultados MTEB (PR #783): https://github.com/embeddings-benchmark/results/pull/783
- Resultados MTEB de tareas privadas ViDoRe V3 (PR #792): https://github.com/embeddings-benchmark/results/pull/792
- Modelo comparable ColModernVBERT: https://huggingface.co/ModernVBERT/colmodernvbert
