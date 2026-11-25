# TongkunGuan/Marten

## Resumen

Marten es un modelo de vision-lenguaje especializado en *document visual question answering* (Document VQA): recibe la imagen de una pagina de documento y genera una respuesta de texto a una pregunta o una transcripcion de la pagina. Lo desarrolla TongkunGuan y se presenta junto al articulo aceptado en CVPR 2025, que introduce la tarea de preentrenamiento VQAMask y el conjunto de datos MTMask6M (seis millones de muestras) para entrenar el modelo.

Arquitectura y pesos: el *config* del repositorio declara `Qwen2_5_VLForConditionalGeneration`, es decir, un transformer multimodal de la familia Qwen2.5-VL, con 8.292.166.656 parametros totales (unos 8,3 mil millones) almacenados en cuatro *shards* de safetensors que ocupan 16,6 GB en el repositorio. La innovacion principal es el uso de un generador auxiliar de mascaras que aporta supervision espacial durante el entrenamiento (el modelo aprende a localizar las regiones del documento que corresponden al texto que transcribe) y que se descarta en inferencia, de modo que el modelo final solo necesita imagen y texto.

Es relevante ahora porque aborda un cuello de botella practico de los pipelines de digitalizacion: la extraccion fiable de informacion de documentos escaneados o fotografias de paginas (facturas, formularios, tablas, recibos) sin depender exclusivamente de OCR seguido de un LLM de texto, sino con un modelo que razona conjuntamente sobre la disposicion visual y el contenido textual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal tipo Qwen2.5-VL (`Qwen2_5_VLForConditionalGeneration`) |
| Parametros totales | 8.292.166.656 (~8,3 mil millones) |
| Parametros activos | no disponible (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser safetensors en BF16/FP16 es cuantizable con herramientas estandar (GGUF/AWQ/GPTQ), aunque el autor no publica variantes |
| Idiomas soportados | no disponible (la model card no declara idiomas; hereda el comportamiento del backbone Qwen2.5-VL, no confirmado por el autor) |
| Licencia | no disponible |
| Formato de pesos | safetensors (cuatro *shards*), mas `config.json`, `chat_template.json` y configuracion del procesador |

## Arquitectura y entrenamiento

Marten se construye sobre un transformer multimodal de la familia Qwen2.5-VL, con un *encoder* visual y un decodificador de lenguaje que procesan conjuntamente la imagen de la pagina y el *prompt* de texto. El repositorio incluye la configuracion del procesador y una plantilla de chat, lo que permite usar el formato de mensajes imagen+texto documentado por Transformers para esta arquitectura.

El entrenamiento se describe en el articulo de CVPR 2025: la tarea VQAMask entrena al modelo de forma conjunta para analizar el texto de la pagina y predecir mascaras sobre las regiones correspondientes de la imagen del documento, usando MTMask6M (seis millones de muestras). El generador auxiliar de mascaras aporta supervision espacial durante el entrenamiento y se elimina en inferencia. La model card no detalla el numero total de tokens de entrenamiento, la composicion exacta del dataset ni si hubo etapas de RLHF o DPO; esos datos deben consultarse en el paper.

## Capacidades

- Respuesta a preguntas sobre documentos (*document VQA*): dada la imagen de una pagina y una pregunta, genera la respuesta en texto.
- Transcripcion de paginas: el modelo acepta peticiones de transcripcion completa del contenido de la pagina.
- *Visual question answering* general sobre imagenes de documentos (etiqueta `visual-question-answering`).
- *Document image parsing*: interpretacion de la estructura visual de la pagina (regiones, bloques de texto), derivada del entrenamiento con VQAMask.
- Entrada multimodal imagen-texto con plantilla de chat conversacional (`conversational`), lo que permite interacciones de varios turnos.
- Soporte de *tool calling*, agentes o *thinking mode*: no disponible en la informacion proporcionada.
- Capacidades de audio o vision general fuera del ambito documental: no disponibles en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas y recibos: enviar la imagen de la factura con un *prompt* como "Read the invoice number" o "Extract the total amount" y obtener el campo en texto; el modelo esta entrenado especificamente para localizar y leer regiones de la pagina.
- Extraccion de datos de formularios: preguntar por campos concretos (fecha, nombre, importe) sobre la imagen escaneada, lo que encaja en pipelines de captura de datos sin OCR intermedio.
- Transcripcion de documentos historicos o manuscritos impresos: solicitar la transcripcion completa de la pagina para alimentar bases de datos documentales.
- Procesamiento de tablas y estados de cuenta: formular preguntas sobre celdas o filas concretas de una tabla en imagen, aprovechando la supervision espacial del entrenamiento.
- Automatizacion de *back office*: integrar el modelo en un servicio de inferencia que reciba imagenes de documentos y devuelva respuestas estructuradas para sistemas de gestion (ERP, contabilidad).
- Asistentes de consulta documental: construir un chat multi-turno en el que el usuario sube una pagina y hace preguntas sucesivas sobre ella, usando la plantilla de chat incluida en el repositorio.
- Verificacion de lectura en pipelines de calidad: pedir al modelo que transcriba la pagina y comparar con el texto extraido por OCR para detectar discrepancias en documentos criticos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al paper de CVPR 2025 (arXiv:2503.14140) para los resultados experimentales; no se incluyen cifras de MMLU, DocVQA, OCRBench ni otras metricas en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: con 8,3 mil millones de parametros, en BF16/FP16 se necesitan aproximadamente 16-17 GB solo para los pesos, mas memoria para el *encoder* visual, el KV cache y las imagenes de entrada; en la practica, 24 GB o mas para comodidad.
- Cuantizacion en 8 bits: alrededor de 8-9 GB de pesos, viable en GPUs de 12-16 GB.
- Cuantizacion en 4 bits: alrededor de 4-5 GB de pesos, potencialmente viable en GPUs de consumo de 8 GB, aunque el autor no publica variantes cuantizadas y habria que generarlas.
- GPUs recomendadas: A100 40/80 GB, H100, L40S para despliegue en produccion; RTX 4090 (24 GB) para inferencia en BF16 de una sola instancia; RTX 3090/4080 para cuantizacion en 8 bits.
- Cabe en GPU de consumo: si, en RTX 4090 en BF16 y en GPUs de 8-12 GB con cuantizacion.
- Opciones de despliegue: vLLM (soporta la familia Qwen2.5-VL), TGI, transformers con `Qwen2_5_VLForConditionalGeneration`, y llama.cpp/Ollama si se generan pesos GGUF (no publicados por el autor).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Marten | ~8,3 mil millones | no disponible | Document VQA con VQAMask (CVPR 2025) | no disponible | Hugging Face (TongkunGuan/Marten) |
| Qwen2.5-VL-7B | ~7-8 mil millones | no disponible en esta ficha | VLM generalista | no disponible en esta ficha | Hugging Face (Qwen) |
| Modelos Document VQA especializados (p. ej. Donut, LayoutLMv3) | no disponible | no disponible | Document understanding | no disponible | Hugging Face |

La comparacion cuantitativa con alternativas no esta disponible en la informacion proporcionada; el paper de Marten es la referencia para comparaciones de rendimiento frente a otros modelos de Document VQA.

## Limitaciones y advertencias

- Licencia no declarada: no se puede confirmar el uso comercial sin consultar al autor o el repositorio; tratarlo como bloqueante para produccion hasta aclararlo.
- Idiomas soportados no declarados: el rendimiento en documentos en castellano no esta verificado por el autor.
- Longitud de contexto no documentada: no se puede planificar el procesamiento de documentos de muchas paginas o imagenes de alta resolucion sin validacion empirica.
- Riesgo de alucinacion: como todo modelo generativo, puede inventar numeros o campos en documentos con baja calidad de imagen, sellos, manuscritos o tablas complejas; se recomienda validacion cruzada con OCR en dominios criticos.
- Sin variantes cuantizadas oficiales: el despliegue en hardware limitado requiere generar y validar las cuantizaciones por cuenta propia.
- Modelo con muy poca adopcion (10 descargas, 0 *likes* en el momento de la consulta): no hay evidencia de comunidad ni de casos de produccion verificados.
- Sin datos de sesgos publicados: no se dispone de evaluaciones de sesgo ni de robustez frente a distintos tipos de documento.

## Enlaces

- Hugging Face: https://huggingface.co/TongkunGuan/Marten
- Paper (arXiv): https://arxiv.org/abs/2503.14140
- Paper CVPR 2025: https://openaccess.thecvf.com/content/CVPR2025/html/Wang_Marten_Visual_Question_Answering_with_Mask_Generation_for_Multi-modal_Document_CVPR_2025_paper.html
- Implementacion de entrenamiento (GitHub): https://github.com/PriNing/Marten
- Configuracion del checkpoint: https://huggingface.co/TongkunGuan/Marten/blob/main/config.json
- Plantilla de chat: https://huggingface.co/TongkunGuan/Marten/blob/main/chat_template.json
- Documentacion de Transformers para Qwen2.5-VL: https://huggingface.co/docs/transformers/model_doc/qwen2_5_vl
