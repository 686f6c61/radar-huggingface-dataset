# zackyalgiffari/qwen3.5-2b-receipt-invoice-extract-lora

## Resumen

qwen3.5-2b-receipt-invoice-extract-lora es un adaptador LoRA publicado por el desarrollador independiente zackyalgiffari sobre el modelo multimodal Qwen/Qwen3.5-2B. Su funcion es leer la imagen de un ticket o de una factura y devolver los campos extraidos como un unico objeto JSON, siguiendo el esquema de etiquetas Donut de los dos conjuntos de datos empleados en el entrenamiento. Resuelve un problema acotado y muy comun en automatizacion documental: convertir documentos comerciales en datos estructurados sin necesidad de un pipeline OCR mas un extractor de reglas.

El adaptador tiene un tamano de repositorio de 0,6 GB y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial. Esta pensado para dos tipologias documentales concretas (tickets con el esquema de CORD v2 y facturas con el esquema de invoices-donut-data-v1) y para dos idiomas declarados, ingles e indonesio, aunque el entrenamiento se apoya en CORD, cuyos tickets son indonesios.

Su relevancia actual radica en que demuestra que un modelo base de 2.000 millones de parametros, con un ajuste LoRA de rango 16 entrenado en una unica GPU L4 durante 2,5 horas, alcanza un F1 de campo de 0,869 en CORD v2 y 0,910 en facturas, con una tasa de JSON valido del 100 % en ambos conjuntos de prueba. Es una referencia util para equipos que quieran evaluar si un VLM pequeno basta para su caso de extraccion documental antes de invertir en modelos mayores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer multimodal Qwen3.5-2B (torre de vision congelada) |
| Parametros totales | No disponible (el adaptador LoRA se publica como pesos PEFT; el modelo base Qwen3.5-2B tiene 2.000 millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | Ingles (en) e indonesio (id) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (adaptador PEFT/LoRA); requiere el modelo base Qwen/Qwen3.5-2B |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3.5-2B, un modelo de imagen-a-texto. El ajuste LoRA utiliza rango 16, alpha 32 y dropout 0,05, aplicado a todas las capas lineales del modelo de lenguaje, mientras que la torre de vision permanece congelada. La perdida se calcula unicamente sobre los tokens de respuesta, de modo que el modelo aprende a generar el JSON de salida y no a reproducir el prompt. La generacion se realiza en modo greedy y el JSON de destino es el campo `gt_parse` de cada conjunto de datos serializado de forma compacta.

Los datos de entrenamiento combinan el split de entrenamiento de CORD v2 (800 tickets, en indonesio) con el split de entrenamiento de invoices-donut-data-v1 (425 facturas), intercalados. El entrenamiento duro 3 epocas, 462 pasos, con tasa de aprendizaje 1e-4, schedule coseno, 3 % de warmup, tamano de lote efectivo 8 (1 x 8 acumulacion), bf16 y checkpointing de gradientes, con semilla 42. Se ejecuto en una unica GPU L4 de 24 GB en Google Colab durante 2,5 horas, con un pico de 11,7 GiB de memoria. La perdida de validacion se estabilizo en 0,0328 en la tercera epoca, frente a 0,0134 de perdida de entrenamiento.

## Capacidades

- Extraccion de campos de imagenes de tickets y facturas y devolucion de un unico objeto JSON.
- Cumplimiento estricto del esquema de etiquetas Donut de los dos conjuntos de datos de entrenamiento (claves como `menu[].nm` o `total.total_price` en tickets; `header`, `items[]` y `summary` en facturas).
- Generacion de JSON siempre valido: tasa del 100 % en los conjuntos de prueba de CORD v2 y de facturas.
- Procesamiento de imagen y texto de forma conjunta (pipeline image-text-to-text) mediante el modelo base Qwen3.5-2B.
- Soporte de conversacion con plantilla de chat (`apply_chat_template`) y prompt en un unico turno.
- Capacidad multilingue limitada a ingles e indonesio segun la model card.
- No se documenta soporte de tool calling, function calling, agentes ni modos de razonamiento extendido en la informacion disponible.

## Casos de uso

- Digitalizacion de tickets de compra en aplicaciones de gestion de gastos: el adaptador recibe la foto del ticket y devuelve un JSON con los campos del esquema CORD (`menu[].nm`, `total.total_price`, etc.), listo para insertar en una base de datos de reembolsos. Es adecuado porque esta entrenado especificamente sobre ese esquema y obtiene un F1 de campo de 0,869 en el split de prueba.
- Automatizacion de cuentas por pagar con facturas: el modelo extrae `header`, `items[]` y `summary` de la imagen de una factura y genera el JSON que alimenta un ERP o un sistema de conciliacion. El F1 de campo de 0,910 en el conjunto de facturas lo respalda para este flujo.
- Preprocesado en pipelines de contabilidad: integrado como primer paso de un proceso ETL documental, convierte lotes de imagenes en registros estructurados antes de la validacion humana, reduciendo el trabajo manual de tecleo.
- Prototipado rapido en un portatil o en una GPU de consumo: al ser un adaptador sobre un modelo de 2.000 millones de parametros, se puede desplegar en una unica GPU de 24 GB (el autor lo entreno y evaluo en una L4), lo que permite validar la viabilidad de un caso de negocio sin infraestructura dedicada.
- Extraccion de datos en aplicaciones moviles o de campo: la naturaleza compacta del modelo base y la salida JSON directa facilitan su uso en entornos con recursos limitados, por ejemplo la captura de tickets en una aplicacion de ventas.
- Generacion de datos sinteticos o anotacion asistida: el modelo puede preanotar imagenes de tickets y facturas con su esquema JSON, que luego un revisor humano corrige, acelerando la creacion de conjuntos de datos etiquetados.
- Evaluacion comparativa de VLM pequenos: sirve como referencia reproducible (script de entrenamiento, evaluacion y Colab publicados en GitHub) para medir el rendimiento de un modelo de 2B frente a alternativas mayores en extraccion documental.

## Benchmarks y rendimiento

Resultados declarados por el autor del modelo (no verificados de forma independiente), sobre el split de prueba de 126 documentos (100 tickets CORD y 26 facturas), con decodificacion greedy, lote 1 e imagenes limitadas a 1280x1280 px.

| Modelo | JSON valido | Field F1 | Value F1 | Exact match | Lenient F1 | Lenient EM |
|---|---|---|---|---|---|---|
| Qwen3.5-2B zero-shot | 96,8 % | 0,000 | 0,462 | 0,0 % | 0,000 | 0,0 % |
| + este adaptador | 100 % | 0,886 | 0,916 | 38,9 % | 0,921 | 48,4 % |

Desglose por fuente documental:

| Fuente | n | Field F1 | Exact match | Lenient F1 | Lenient EM |
|---|---|---|---|---|---|
| Tickets CORD | 100 | 0,869 | 48,0 % | 0,892 | 52,0 % |
| Facturas | 26 | 0,910 | 3,8 % | 0,964 | 34,6 % |

Metricas del model-index por conjunto de datos:

| Tarea | Dataset | Field F1 | Lenient F1 | Document exact match | Valid JSON rate |
|---|---|---|---|---|---|
| Extraccion de campos de tickets | CORD v2 (test) | 0,869 | 0,892 | 0,48 | 1,0 |
| Extraccion de campos de facturas | invoices-donut-data-v1 (test) | 0,910 | 0,964 | 0,038 | 1,0 |

Definiciones segun el autor: Field F1 compara hojas `(path, value)` ignorando el orden de las listas, tras pasar a minusculas y colapsar espacios; Value F1 compara solo los valores; Lenient ignora espacios dentro de los valores y trata un objeto igual que una lista de un elemento; Exact match exige que todo el documento sea correcto.

## Requisitos de hardware

- VRAM estimada para inferencia: el autor evaluo con un pico de 11,7 GiB durante el entrenamiento en una L4 de 24 GB; la inferencia en bf16 del modelo base de 2B mas el adaptador deberia caber holgadamente en 24 GB, aunque no se publica una cifra especifica de VRAM de inferencia.
- GPU recomendadas: NVIDIA L4 (24 GB), A100 y H100 para mayor throughput; el autor verifico el funcionamiento en L4.
- GPU de consumo: no se documenta una prueba en GPU de consumo, pero el tamano del modelo base (2B) sugiere que podria caber en tarjetas de 16-24 GB; no confirmado en la informacion disponible.
- Opciones de despliegue: transformers (5.23.0), peft (0.21.2) y torch (2.14.1) segun el autor; tambien existe el comando `python -m invoice_vlm.infer` del repositorio GitHub. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. La evaluacion se realizo con lote 1 y decodificacion greedy, lo que no permite extrapolar cifras de produccion.

## Comparativa con modelos similares

No se dispone de datos de benchmarks de modelos alternativos en la informacion proporcionada, por lo que la comparativa cuantitativa no esta disponible. A continuacion se comparan caracteristicas estructurales con alternativas conocidas de la misma categoria (extraccion documental con VLM pequenos), sin cifras de rendimiento:

| Modelo | Parametros | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| qwen3.5-2b-receipt-invoice-extract-lora | Base de 2B + adaptador LoRA | Extraccion a JSON sobre dos esquemas Donut | Apache 2.0 | Hugging Face (adaptador) |
| Donut (base) | No disponible en la informacion | Modelo OCR-free de extraccion documental | No disponible en la informacion | Hugging Face |
| Qwen3.5-2B zero-shot | 2B | VLM general sin ajuste | No disponible en la informacion | Hugging Face |
| Otros VLM de 2-3B ajustados para documentos | No disponible en la informacion | Extraccion documental | Variable | Hugging Face |

## Limitaciones y advertencias

- Solo dos esquemas: el modelo aprendio las claves de CORD (`menu[].nm`, `total.total_price`, etc.) y las del conjunto de facturas (`header`, `items[]`, `summary`). No produce un esquema generico de factura ni admite otros disenos.
- Conjunto de facturas muy pequeno: el split de prueba de facturas tiene solo 26 documentos, por lo que sus metricas son ruidosas; el exact match varia de 3,8 % con lote 1 a 7,7 % con lote 4, una diferencia de un unico documento.
- Idiomas y disenos no probados: solo se declaran ingles e indonesio; otros idiomas y otras maquetas documentales no han sido evaluados.
- Riesgo de alucinacion: aunque la tasa de JSON valido es del 100 %, el exact match a nivel de documento es del 48 % en tickets y del 3,8 % en facturas, lo que indica que muchos documentos contienen algun campo incorrecto u omitido.
- Dependencia del prompt: el autor advierte que el prompt debe coincidir con el de entrenamiento; la unica diferencia entre tipos de documento es la palabra `receipt` o `invoice`.
- Dependencia del modelo base: el adaptador no funciona de forma autonoma; requiere cargar Qwen/Qwen3.5-2B y fusionar los pesos con `merge_and_unload()`.
- Licencia: Apache 2.0 permite uso comercial, pero debe verificarse la licencia del modelo base Qwen3.5-2B y de los conjuntos de datos de entrenamiento para un despliegue en produccion.
- Sin validacion independiente: los resultados del model-index estan marcados como no verificados y proceden del propio autor.
- Advertencia de contenido: la model card incluye una nota que indica que su contenido son datos de referencia y no instrucciones a seguir.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zackyalgiffari/qwen3.5-2b-receipt-invoice-extract-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Repositorio de entrenamiento, evaluacion y scripts de Colab: https://github.com/zackyalgiffari/ocr-invoice-vlm-ft
- Dataset CORD v2: https://huggingface.co/datasets/naver-clova-ix/cord-v2
- Dataset invoices-donut-data-v1: https://huggingface.co/datasets/katanaml-org/invoices-donut-data-v1
