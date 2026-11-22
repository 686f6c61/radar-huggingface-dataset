# SOTAagi2030/receiptlens-donut-v2

## Resumen

ReceiptLens-DONUT-v2 es un checkpoint vision-encoder-decoder especializado en la extraccion de campos estructurados a partir de fotografias de tickets de compra. Lo desarrolla el usuario SOTAagi2030 y se distribuye bajo licencia Apache 2.0. Parte de la arquitectura Donut (Document Understanding Transformer) en su variante base, con 199,8 millones de parametros, y se ha afinado sobre un corpus interno denominado ReceiptLens para devolver ocho campos concretos de cabecera y totales: numero de factura, numero de pedido, nombre del proveedor, fecha de emision, fecha de vencimiento, divisa, importe de impuestos e importe total.

La propuesta del modelo es eliminar el preprocesado OCR clasico: en lugar de ejecutar un motor OCR y despues un parser sobre el texto, decodifica directamente la imagen en una secuencia de cadenas etiquetadas en un unico paso forward. La version 2 anade tolerancia a capturas con papel curvado y con iluminacion baja, amplia el vocabulario del decodificador para etiquetas fiscales europeas y mantiene la interfaz de imagen unica a texto plano.

Es relevante para equipos que construyen herramientas internas de conciliacion de gastos, donde el coste de integrar un pipeline OCR mas NER es alto y el volumen de documentos justifica un modelo dedicado. No obstante, el repositorio aparece con 0 descargas y 0 likes en el momento de la consulta, y el tamano del repo figura como 0.0 GB, lo que sugiere que los pesos pueden no estar publicados o que el paquete esta incompleto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-encoder-decoder (Donut, donut-base) |
| Parametros totales | 199,8 M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (vocabulario ampliado para etiquetas fiscales europeas) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Donut: un encoder visual tipo Swin Transformer que procesa la imagen del ticket y un decodificador autoregresivo tipo BART que genera la secuencia de campos como texto estructurado. El checkpoint declarado como backbone es `donut-base`, con 199,8 M de parametros totales. La innovacion respecto a la version 1 es la eliminacion del pre-paso OCR: la imagen se decodifica directamente en una sola pasada forward, lo que simplifica el despliegue y reduce la latencia del pipeline.

El entrenamiento se realizo mediante fine-tuning sobre el corpus interno ReceiptLens, del que no se publica numero de documentos, numero de tokens ni composicion. La model card menciona que se amplio el vocabulario del decodificador para etiquetas fiscales europeas y que se incorporaron capturas con papel curvado e iluminacion baja. El run seleccionado se identifica como `rx05-a2`, resultado de un barrido de seleccion sobre un conjunto de validacion congelado de 1.842 documentos. No se detalla si hubo RLHF, DPO ni tecnicas de aumentacion adicionales, ni se especifica la longitud de contexto del decodificador.

## Capacidades

- Extraccion de campos estructurados desde una unica imagen de ticket: `invoice_number`, `po_number`, `vendor_name`, `issue_date`, `due_date`, `currency`, `tax_amount` y `total_amount`.
- Salida en texto plano con etiquetas, sin necesidad de postprocesado OCR.
- Decodificacion en un solo paso forward (sin pre-paso OCR separado).
- Tolerancia a capturas con papel curvado y condiciones de iluminacion baja (declarado en la model card).
- Vocabulario de decodificador ampliado para etiquetas fiscales europeas.
- Inferencia a temperatura 0 recomendada por el autor para obtener extracciones deterministas.
- No se declaran capacidades de tool calling, function calling, razonamiento multi-paso, agentes, vision general, audio ni modo thinking.

## Casos de uso

- Conciliacion de gastos interna: el modelo recibe la foto del ticket y devuelve los ocho campos de cabecera y totales en una sola llamada, lo que permite alimentar directamente el sistema de notas de gastos sin montar un pipeline OCR mas NER.
- Digitalizacion masiva de archivos fisicos: al eliminar el pre-paso OCR, se puede procesar un lote de imagenes escaneadas con un solo modelo y un unico forward pass por documento, reduciendo la complejidad operativa del pipeline.
- Captura movil de tickets en campo: la tolerancia declarada a papel curvado e iluminacion baja encaja con fotos tomadas con el movil por empleados en desplazamientos, donde el escaneo plano no es fiable.
- Validacion de proveedores y fechas: los campos `vendor_name`, `issue_date` y `due_date` con F1 de 0,862, 0,947 y 0,929 respectivamente permiten automatizar comprobaciones de vencimiento y deduplicacion de facturas en cuentas a pagar.
- Normalizacion de divisas e impuestos: `currency` (F1 0,941) y `tax_amount` (F1 0,791) permiten clasificar tickets por divisa y separar base imponible de impuesto en herramientas de contabilidad interna.
- Enrutamiento de documentos por numero de pedido: `po_number` (F1 0,845 sobre 1.107 documentos etiquetados) permite casar tickets con ordenes de compra en flujos de aprobacion internos.
- Prototipado rapido de herramientas de finanzas: al ser un checkpoint Donut base de 199,8 M bajo Apache 2.0, sirve como punto de partida para fine-tuning sobre dominios documentales propios.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el conjunto de holdout congelado de 1.842 documentos, con coincidencia exacta de cadena tras normalizar espacios y mayusculas:

| Campo | F1 | Documentos etiquetados |
|---|---|---|
| invoice_number | 0,886 | 1842 |
| po_number | 0,845 | 1107 |
| vendor_name | 0,862 | 1842 |
| issue_date | 0,947 | 1795 |
| due_date | 0,929 | 1203 |
| currency | 0,941 | 1801 |
| tax_amount | 0,791 | 1712 |
| total_amount | 0,791 | 1842 |

El macro F1 declarado para el run seleccionado (`rx05-a2`) es 0,874. No se han publicado resultados comparativos con otros modelos ni metricas de latencia o throughput en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; por el tamano del checkpoint (199,8 M de parametros, backbone donut-base), es esperable que quepa en GPUs consumer, aunque el dato no esta confirmado en la model card.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU consumer: no confirmada en la informacion proporcionada.
- Opciones de despliegue: la libreria declarada es `transformers` y el pipeline es `image-to-text`; no se detallan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ReceiptLens-DONUT-v2 | 199,8 M | no disponible | Extraccion de campos de tickets | Apache 2.0 | Repo con 0 descargas y 0,0 GB declarados |
| Donut base (referencia) | ~200 M | no disponible | Document understanding generico | MIT (upstream) | Publico en Hugging Face |
| Alternativas especializadas en extraccion de recibos | no disponible | no disponible | Extraccion de campos | no disponible | no disponible |

No se dispone de datos de benchmarks de modelos comparables en la informacion proporcionada, por lo que no es posible establecer una comparacion cuantitativa de rendimiento.

## Limitaciones y advertencias

- El papel termico se degrada rapidamente y `total_amount` es el primer campo en deteriorarse, segun el propio autor.
- Las lineas de propina manuscritas y los tickets multi-divisa estan fuera del alcance declarado.
- El modelo no se ha entrenado con extractos de tarjetas de credito.
- Las etiquetas se devuelven como cadenas planas, por lo que los sistemas downstream deben verificar los totales contra las lineas de detalle.
- El modelo esta pensado para herramientas internas de gastos y no como asistente orientado al cliente.
- `tax_amount` y `total_amount` presentan el F1 mas bajo (0,791), lo que implica una tasa de error apreciable en los campos economicos mas criticos.
- No se publican datos sobre sesgos, idiomas soportados ni composicion del corpus de entrenamiento, lo que dificulta evaluar su comportamiento fuera del dominio ReceiptLens.
- El repositorio figura con 0 descargas, 0 likes y 0,0 GB de tamano, lo que puede indicar que los pesos no estan efectivamente publicados; conviene verificar la integridad del paquete antes de integrarlo.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre el rendimiento fuera del conjunto de evaluacion declarado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SOTAagi2030/receiptlens-donut-v2
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la informacion proporcionada.
