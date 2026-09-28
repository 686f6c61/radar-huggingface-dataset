# XingChen-AGI/TeleOCR

## Resumen

TeleOCR es un modelo de lenguaje y vision (VLM) de código abierto desarrollado por XingChen-AGI, orientado especificamente al parseo de documentos. Con aproximadamente 1,42 mil millones de parametros, se posiciona como una alternativa ligera frente a pipelines OCR tradicionales y modelos de mayor tamano, y su propuesta diferencial es unificar en un unico framework el parseo de documentos digitales nativos y el de documentos capturados con camara (con Perspectiva, curvatura y deformaciones geometricas), sin necesidad de una etapa previa de rectificacion.

El modelo se construye sobre la arquitectura Qwen2.5-VL y fue publicado inicialmente como NaviDC-OCR en agosto de 2026, renombrandose a TeleOCR el 10 de septiembre de 2026. La model card destaca varias tecnicas propias: voto por consenso multi-nodo (MCV) para generar pseudoetiquetas, modelado geometrico del documento, muestreo Douglas-Peucker guiado por curvatura (CGDP), autoverificacion imagen-a-imagen para refinar datos y un pipeline de entrenamiento progresivo en cuatro etapas con aprendizaje desacoplado de contenido y estructura para tablas y formulas.

Su relevancia actual radica en que alcanza resultados de estado del arte en OmniDocBench v1.6 (96,87 de Overall) con solo 1,2B de parametros declarados, y en que la comunidad ya ha generado conversiones a GGUF y despliegues sobre aceleradores Ascend 910B, lo que lo hace viable en hardware modesto. El repositorio acumula 27.837 descargas y 604 likes, y se distribuye bajo licencia Apache-2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) basado en Qwen2.5-VL: encoder de vision + decoder de lenguaje denso |
| Parametros totales | 1.415.072.768 (~1,42B, segun safetensors). La model card declara ~1,2B |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | safetensors en precision completa (repo de 2,8 GB); existe una conversion comunitaria a GGUF, pero los niveles concretos no estan especificados en la informacion disponible |
| Idiomas soportados | zh (chino), en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors, con `custom_code` (requiere `trust_remote_code`); GGUF comunitario |

## Arquitectura y entrenamiento

TeleOCR es un modelo denso de tipo vision-language que reutiliza la arquitectura Qwen2.5-VL (etiqueta `qwen2_5_vl` en HuggingFace), es decir, un encoder visual acoplado a un decoder de lenguaje autorregresivo. El modelo se ejecuta mediante `transformers` con codigo personalizado y esta marcado como compatible con `text-generation-inference` y con endpoints, lo que indica que la generacion es de tipo conversational image-text-to-text. El recuento real de parametros del repositorio (1.415.072.768) es superior al ~1,2B que declara la model card, una discrepancia que conviene tener en cuenta al planificar el despliegue.

En cuanto al entrenamiento, la model card describe un pipeline progresivo de cuatro etapas y varias innovaciones tecnicas: Multi-node Consensus Voting (MCV) para la generacion automatica de pseudoetiquetas, modelado geometrico orientado a documentos capturados con camara, Curvature-Guided Douglas-Peucker Sampling (CGDP) para el muestreo de puntos en documentos deformados, autoverificacion imagen-a-imagen para el refinado automatico de datos y Content-Structure Decoupled Learning aplicado especificamente a tablas y formulas. No se especifica en la informacion disponible el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Parseo de documentos a texto estructurado (Markdown u otra representacion) a partir de imagenes de paginas.
- Reconocimiento de texto (OCR) en documentos digitales nativos.
- Parseo de documentos capturados con camara, incluyendo deformaciones geometricas, curvatura de pagina y Perspectiva, sin preprocesado de rectificacion ni modelo dedicado de dewarping.
- Reconocimiento de estructura de documento: orden de lectura, tablas y formulas.
- Extraccion de tablas con estructura (evaluado con TEDS y TEDS-S) y de formulas (evaluado con CDM).
- Analisis de layout en documentos distorsionados, evaluado sobre los datasets publicos DocUNet y DIR300.
- Modalidad conversacional image-text-to-text, lo que permite interaccion multi-turno sobre imagenes.
- Soporte multilingue limitado a chino e ingles.
- Compatibilidad declarada con tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades especiales: modo thinking, vision adicional o audio no disponibles en la informacion proporcionada (unicamente vision de documentos).

## Casos de uso

- Digitalizacion de archivos historicos o escaneados con deformaciones: el modelo procesa directamente paginas curvadas o con Perspectiva, evitando un pipeline separado de dewarping y reduciendo errores en cadena.
- Captura de documentos con movil: aplicaciones de escaneo que fotografian facturas, albaranes o formularios en condiciones no ideales pueden enviar la imagen directamente al modelo y obtener estructura y texto sin correccion previa.
- Extraccion estructurada de tablas financieras: con 97,05 de TEDS en OmniDocBench v1.6, es adecuado para convertir balances, extractos y hojas de calculo impresas en datos tabulares utilizables.
- Conversion de articulos cientificos a Markdown: la combinacion de CDM 96,36 en formulas y un buen orden de lectura permite generar versiones estructuradas de papers con ecuaciones y tablas preservadas.
- Automatizacion de back-office con documentos en chino e ingles: digitalizacion de contratos y expedientes bilingues en entornos donde no se dispone de GPUs de gran tamano, al ser un modelo de ~1,4B.
- Despliegue en infraestructura no NVIDIA: existe experiencia comunitaria documentada de ejecucion sobre Ascend 910B, lo que habilita su uso en entornos con aceleradores alternativos.
- Preprocesado en pipelines de RAG documental: el modelo actua como etapa de conversion de PDFs e imagenes a texto estructurado antes de la indexacion vectorial, con bajo coste por pagina.
- Procesamiento en el borde o en portatil: gracias a la conversion GGUF y a llama.cpp, puede ejecutarse en equipos sin GPU dedicada para tareas de OCR por lotes de baja criticidad.

## Benchmarks y rendimiento

### Dr.DocBench Challenge

| Modelo | Overall (mas alto mejor) | Text edit (mas bajo mejor) | Formula CDM (mas alto mejor) | Table TEDS (mas alto mejor) | Order edit (mas bajo mejor) |
|---|---|---|---|---|---|
| TeleOCR | 67,96 | 0,1903 | 0,02 | 64,97 | 0,398 |
| MinerU 2.5 Pro | 62,26 | 0,3402 | 0,04 | 67,75 | 0,356 |
| OvisOCR2 | 59,25 | 0,3883 | 0,00 | 61,59 | 0,3791 |
| PaddleOCR-VL 1.6 | 55,11 | 0,4364 | 0,21 | 51,34 | 0,412 |

### OmniDocBench v1.6

| Tipo | Metodo | Parametros | Overall | Text edit | Formula CDM | Table TEDS | Table TEDS-S | Read order edit |
|---|---|---|---|---|---|---|---|---|
| VLM especializado | TeleOCR | 1,2B | 96,87 | 0,027 | 96,36 | 97,05 | 98,52 | 0,122 |
| VLM especializado | OvisOCR2 | 0,8B | 96,58 | 0,025 | 97,53 | 94,76 | 97,16 | 0,111 |
| VLM especializado | PaddleOCR-VL-1.6 | 0,9B | 96,33 | 0,033 | 97,49 | 94,76 | 97,11 | 0,127 |
| VLM especializado | MinerU2.5-Pro | 1,2B | 95,75 | 0,036 | 97,45 | 93,42 | no disponible | no disponible |

Nota: en la tabla de Dr.DocBench publicada en la model card, TeleOCR obtiene el mejor resultado global y en reconocimiento de texto, mientras que MinerU 2.5 Pro le supera en Table TEDS (67,75 frente a 64,97) y en orden de lectura (0,356 frente a 0,398). Los resultados de la tabla de OmniDocBench v1.6 se han reproducido tal como aparecen en la model card, que esta truncada para la fila de MinerU2.5-Pro en las dos ultimas columnas.

## Requisitos de hardware

- Peso de los pesos en el repositorio: 2,8 GB, consistente con precision BF16/FP16 para ~1,42B de parametros.
- VRAM estimada para inferencia en BF16: en torno a 5-7 GB teniendo en cuenta pesos, encoder visual, activaciones y cache KV. Es una estimacion derivada del recuento de parametros, no un dato publicado por el autor.
- VRAM estimada con cuantizacion GGUF Q4: aproximadamente 1-1,5 GB solo de pesos, mas overhead de contexto.
- Cabe en GPU de consumo: si. Con cuantizacion, en GPUs de 4-8 GB; en BF16 es comodo a partir de 8 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090).
- GPU de datacenter compatibles: A100, H100, L40S y similares, ampliamente sobredimensionadas para este tamano; utiles para servir muchas peticiones concurrentes.
- Aceleradores alternativos: existe una experiencia comunitaria documentada de despliegue en Ascend 910B.
- Opciones de despliegue: transformers (libreria declarada, con `trust_remote_code`), vLLM y TGI (el modelo esta etiquetado como compatible con text-generation-inference y endpoints), llama.cpp / Ollama a traves de la conversion GGUF de la comunidad.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | OmniDocBench v1.6 (Overall) | Dr.DocBench (Overall) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| TeleOCR | ~1,4B (declarado 1,2B) | no disponible | 96,87 | 67,96 | apache-2.0 | HuggingFace, GGUF comunitario, despliegue en Ascend 910B |
| OvisOCR2 | 0,8B | no disponible | 96,58 | 59,25 | no disponible | HuggingFace (pesos publicados) |
| PaddleOCR-VL 1.6 | 0,9B | no disponible | 96,33 | 55,11 | no disponible | HuggingFace / ecosistema PaddleOCR |
| MinerU 2.5 Pro | 1,2B | no disponible | 95,75 | 62,26 | no disponible | HuggingFace / repositorio MinerU |

TeleOCR obtiene el mejor resultado global tanto en OmniDocBench v1.6 como en Dr.DocBench dentro de este grupo, con una diferencia especialmente amplia en Dr.DocBench (67,96 frente a 62,26 del siguiente). No obstante, OvisOCR2 le supera en Text edit y en orden de lectura dentro de OmniDocBench, y MinerU 2.5 Pro le supera en Table TEDS en Dr.DocBench; la eleccion depende, por tanto, del tipo de documento predominante.

## Limitaciones y advertencias

- Idiomas: solo se declara soporte para chino e ingles. El rendimiento en castellano u otras lenguas no esta documentado y no deberia asumirse.
- Alucinacion: como todo modelo generativo aplicado a OCR y parseo de documentos, puede producir texto, celdas de tabla o formulas plausibles pero inexistentes, especialmente en imagenes de baja calidad o con ruido.
- Formulas: aunque el resultado global es muy alto, la metrica Formula CDM de TeleOCR en Dr.DocBench (0,02) es notablemente inferior a la de PaddleOCR-VL 1.6 (0,21); conviene validar en dominios con carga matematica intensa.
- Orden de lectura: el valor de Order edit en Dr.DocBench (0,398) es peor que el de MinerU 2.5 Pro (0,356) y OvisOCR2 (0,3791), lo que puede afectar a documentos con maquetacion compleja o multicolumna.
- Discrepancia en el recuento de parametros: la model card indica ~1,2B mientras que los safetensors suman 1.415.072.768. Hay que dimensionar el hardware sobre el dato real.
- Codigo personalizado: el modelo requiere `trust_remote_code=True` y la etiqueta `custom_code`, por lo que conviene auditar el codigo remoto antes de ejecutarlo en produccion.
- Contexto y ventana: la longitud de contexto no esta publicada; en pipelines de muchas paginas habra que trocear el documento y gestionar la union de resultados.
- Licencia: Apache-2.0 permite uso comercial, modificacion y redistribucion, pero el modelo no incluye garantias. Las conversiones GGUF son comunitarias y no estan avaladas por el autor.
- Documentos deformados: aunque el modelo maneja perspectiva y curvatura, los casos extremos de iluminacion, desenfoque u oclusion siguen siendo un riesgo y no hay metricas publicadas de robustez fuera de DocUNet y DIR300.
- Datos de benchmarks: los resultados de OmniDocBench v1.6 proceden de la propia model card y estan parcialmente truncados en la fila de MinerU2.5-Pro; no se han verificado de forma independiente en la informacion disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/XingChen-AGI/TeleOCR
- Repositorio en GitHub: https://github.com/caipeng328/TeleOCR
- Informe tecnico (arXiv): https://arxiv.org/abs/2608.12898
- PDF del informe tecnico: https://arxiv.org/pdf/2608.12898
- Pesos originales con el nombre anterior (NaviDC-OCR): https://huggingface.co/StarDoc-AI/NaviDC-OCR
- Conversion comunitaria a GGUF: https://huggingface.co/nandraj/NaviDC-OCR-GGUF
- Aplicacion web en TeleAI: https://www.teleai.com.cn/docparse/DocumentParsing
- OmniDocBench (repositorio de evaluacion): https://github.com/opendatalab/OmniDocBench
- Desafio Dr.DocBench (EMNLP 2026): https://eval.ai/web/challenges/challenge-page/2717/overview
- Experiencia de despliegue en Ascend 910B: https://zhuanlan.zhihu.com/p/2078516899093155893
