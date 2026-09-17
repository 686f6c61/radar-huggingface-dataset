# Tang-yin-112/mt-invoice-4g-v1

## Resumen

mt-invoice-4g-v1 es un ajuste fino mediante LoRA del modelo Qwen/Qwen3.5-4B orientado a la extraccion de campos en facturas y tickets. Lo publica el usuario Tang-yin-112 como participacion en la arena "Microtensor invoice / mt-4g", entrenando sobre el split publico de entrenamiento de dicha arena. El resultado es un modelo conversacional de 4.205.751.296 parametros (unos 4,2 mil millones) en el que los pesos del adaptador se han fusionado con la base y se han cuantizado a GGUF Q4_K_M.

El problema que aborda es acotado y practico: convertir documentos comerciales semiestructurados en campos estructurados, con una entrada declarada de 2048 tokens. El unico dato de rendimiento publicado por el autor es un F1 de campo de 0,9401 sobre el split de desarrollo reservado (held-out dev). No se documentan ni la composicion del dataset de entrenamiento ni el proceso de ajuste mas alla de la mencion al LoRA.

Su relevancia actual es limitada: el repositorio acumula 0 descargas y 0 likes, no incluye model card extendida, no publica comparativas con alternativas y no detalla el contexto nativo ni los idiomas del modelo base. Se distribuye bajo licencia Apache 2.0, lo que en principio permite uso comercial, aunque la licencia del checkpoint base no se explicita en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de Qwen/Qwen3.5-4B; detalles de arquitectura del modelo base no disponibles) |
| Parametros totales | 4.205.751.296 (aproximadamente 4,2 mil millones) |
| Parametros activos | No aplica: no se declara arquitectura MoE |
| Longitud de contexto | 2048 tokens declarados como entrada de la tarea; contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | GGUF Q4_K_M (unico formato cuantizado publicado) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (Q4_K_M); los parametros totales se han leido de metadatos safetensors del repositorio |
| Modelo base | Qwen/Qwen3.5-4B, commit 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a |
| Metodo de ajuste | LoRA sobre el split publico de la arena, fusionado con la base |
| Tamano del repositorio | 2,7 GB |

## Arquitectura y entrenamiento

La arquitectura de partida es la de Qwen/Qwen3.5-4B, un transformer decoder-only de aproximadamente 4.000 millones de parametros segun la nomenclatura del checkpoint base; no se proporcionan en la informacion disponible ni el numero de capas, ni las dimensiones ocultas, ni el tipo de atencion, ni el contexto nativo. Sobre esa base se aplica un ajuste fino con LoRA (Low-Rank Adaptation) utilizando el split publico de entrenamiento de la arena "Microtensor invoice / mt-4g", tras lo cual el adaptador se fusiona con los pesos originales y el conjunto resultante se cuantiza a GGUF Q4_K_M, presumiblemente con llama.cpp. No se indica el rango del LoRA, la tasa de aprendizaje, el numero de pasos ni el volumen de tokens de entrenamiento.

Tampoco se documentan tecnicas de alineacion adicionales: no hay mencion a RLHF, DPO, SFT posterior ni a decodificacion especulativa. La unica innovacion declarada es funcional, no arquitectonica: el modelo esta especializado en extraccion de campos de facturas y tickets, con una ventana de entrada declarada de 2048 tokens, lo que sugiere entrenamiento sobre documentos truncados o segmentados a esa longitud. El unico resultado de evaluacion es un F1 de campo de 0,9401 medido sobre el conjunto de desarrollo reservado por el propio autor.

## Capacidades

- Extraccion de campos en facturas y tickets (tarea principal declarada mediante los tags `invoice` y `receipt-extraction`): transformacion de documentos comerciales en campos estructurados.
- Generacion de texto conversacional: el repositorio incluye el tag `conversational`, por lo que admite interaccion en formato de dialogo ademas de la tarea de extraccion.
- Compatibilidad con endpoints gestionados: el tag `endpoints_compatible` indica que el formato de pesos y la configuracion estan pensados para desplegarse en servicios de inferencia compatibles con repositorios de HuggingFace.
- Ejecucion local eficiente: al publicarse unicamente en GGUF Q4_K_M, esta preparado para motores de inferencia en CPU y GPU de gama media.
- Soporte de tool calling / function calling: no hay constancia en la informacion disponible.
- Capacidades de agente o razonamiento multi-paso: no hay constancia en la informacion disponible.
- Capacidades multilingues: no disponibles; no se declara ninguna lista de idiomas.
- Capacidades de vision, audio o modo de razonamiento explicito (thinking mode): no hay constancia en la informacion disponible.

## Casos de uso

- Digitalizacion de facturas de proveedores en un ERP: el modelo recibe el texto de la factura (hasta 2048 tokens) y devuelve campos como numero de factura, NIF del emisor, base imponible, cuota de IVA, total y fecha, que se insertan directamente en el sistema contable. Su tamano reducido y su cuantizacion Q4_K_M permiten procesar lotes completos en un servidor modesto sin depender de APIs externas.
- Gestion de gastos de empleados: en el backend de una aplicacion de notas de gastos, el modelo extrae comercio, fecha, importe y desglose de impuestos de los tickets fotografiados y convertidos a texto, dejando al usuario solo la validacion final.
- Automatizacion de cuentas por pagar: integrado en un pipeline que convierte PDF a texto, el modelo extrae los campos relevantes y un modulo de reglas los cruza contra la orden de compra para detectar discrepancias de importe o de referencia antes del pago.
- Despliegue on-premise en sectores regulados: banca, seguros o sanidad pueden ejecutar el modelo en su propia infraestructura para no enviar documentacion financiera a servicios de terceros, gracias a que pesa unos 2,7 GB y a que la licencia Apache 2.0 no impone restricciones de uso comercial conocidas.
- Preprocesado para RAG sobre documentacion financiera: los campos estructurados extraidos de facturas y tickets se indexan en una base de datos vectorial o relacional, lo que permite despues consultas agregadas y busquedas por proveedor, periodo o importe sin reprocesar los documentos originales.
- Preanotacion en flujos de etiquetado humano: el modelo genera una primera propuesta de campos que un revisor corrige, reduciendo el coste de anotacion en la construccion de nuevos conjuntos de datos de facturas.
- Extraccion en dispositivos con recursos limitados: al estar cuantizado a Q4_K_M, puede ejecutarse en un portatil con GPU de gama media o incluso en CPU, lo que habilita escenarios de captura de tickets en el borde (edge) con posterior sincronizacion.
- Evaluacion y comparacion de tecnicas de ajuste: sirve como referencia reproducible para estudiar como de lejos llega un LoRA sobre un modelo de 4B en una tarea de extraccion estructurada frente a modelos genericos mayores.

## Benchmarks y rendimiento

| Metrica | Valor | Conjunto | Fuente |
|---|---|---|---|
| F1 de campo (field F1) | 0,9401 | Held-out dev de la arena "Microtensor invoice / mt-4g" | Model card del autor |

No se han publicado resultados de benchmarks adicionales en la informacion disponible: no hay MMLU, HumanEval, GSM8K ni desglose por tipo de campo, idioma o longitud de documento. Tampoco se aportan comparaciones contra la linea base sin ajustar (Qwen/Qwen3.5-4B) ni contra otros participantes de la arena, por lo que no es posible determinar cuanto del rendimiento se debe al ajuste LoRA y cuanto al modelo base.

## Requisitos de hardware

- Pesos: el repositorio ocupa 2,7 GB, coherente con una cuantizacion Q4_K_M de aproximadamente 4,2 mil millones de parametros (entre 2,4 y 2,7 GB de pesos).
- VRAM estimada para inferencia: del orden de 3 a 4 GB considerando pesos y cache KV para una ventana de 2048 tokens. Es una estimacion derivada del tamano del repositorio, no un dato publicado por el autor.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas, como RTX 3060 (6 GB o 12 GB), RTX 4060 (8 GB), RTX 3070 o superiores. Tambien en equipos Apple Silicon con memoria unificada a partir de 8 GB.
- Ejecucion en CPU: viable para lotes pequenos o moderados, al tratarse de un modelo de 4B cuantizado a 4 bits.
- Opciones de despliegue: llama.cpp, Ollama, llama-cpp-python, LM Studio y servidores compatibles con endpoints gestionados. vLLM y TGI tienen soporte limitado de GGUF, por lo que su uso exigiria disponer de pesos sin cuantizar, que no se declaran en la informacion disponible.
- Latencia y throughput: no disponibles. No se publican mediciones de tokens por segundo ni de tiempo por documento.
- Memoria en disco: 2,7 GB para el repositorio, lo que permite incluirlo en imagenes de contenedor pequenas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Rendimiento | Disponibilidad |
|---|---|---|---|---|---|---|
| mt-invoice-4g-v1 | 4.205.751.296 | 2048 tokens declarados como entrada | Apache 2.0 | GGUF Q4_K_M | F1 de campo 0,9401 en dev | Publicado en HuggingFace, 0 descargas |
| Qwen/Qwen3.5-4B (base) | Aproximadamente 4.000 millones segun el nombre del checkpoint | No disponible | No disponible | No disponible | No disponible | Referenciado por el autor, sin datos en esta ficha |
| Otras alternativas especializadas en extraccion de facturas | No disponible | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de alternativas comparables en la informacion proporcionada, ni de resultados de mt-invoice-4g-v1 en tareas generales que permitan situarlo frente a modelos de proposito general del mismo tamano. La unica referencia directa es el checkpoint base, del que no se aportan metricas.

## Limitaciones y advertencias

- Ventana de entrada corta: los 2048 tokens declarados limitan el tratamiento de facturas extensas o multipagina; el contenido que exceda esa longitud se truncara o requerira segmentacion previa, con riesgo de perder campos.
- Cuantizacion agresiva: los pesos se publican unicamente en Q4_K_M. No se ofrece la version sin cuantizar ni una comparativa de degradacion, por lo que no puede medirse la perdida de exactitud respecto al modelo fusionado en precision completa.
- Evidencia de evaluacion minima: el 0,9401 de F1 corresponde a un unico conjunto de desarrollo reservado por el propio autor. No hay evaluacion en test ciego, ni desglose por campo, tipo de documento, idioma o calidad del OCR de entrada.
- Riesgo de alucinacion en campos numericos: como cualquier modelo generativo, puede producir importes, fechas o identificadores fiscales plausibles pero incorrectos. En produccion conviene acompanar la salida con validaciones deterministas (suma de lineas frente al total, formato de NIF, coherencia de fechas) y revision humana en los casos de baja confianza.
- Idiomas no declarados: se desconoce que idiomas cubre el ajuste y como se comporta con documentos en idiomas distintos a los del conjunto de entrenamiento, que tampoco se documenta.
- Sesgos: no documentados. Al no publicarse la composicion del dataset de la arena, no puede evaluarse el sesgo hacia determinados formatos de factura, paises o proveedores.
- Licencia del modelo base: la ficha publica Apache 2.0 para este derivado, pero no se explicita la licencia del checkpoint Qwen/Qwen3.5-4B referenciado. Antes de un uso comercial conviene verificar las condiciones del modelo base, ya que las licencias de modelos derivados suelen heredar restricciones del original.
- Madurez y trazabilidad: el repositorio no tiene descargas ni likes, la model card es de cuatro lineas y no incluye informacion de contacto, datos de entrenamiento, hiperparametros ni instrucciones de uso. No hay validacion externa independiente.
- Ausencia de soporte declarado para tool calling y agentes: cualquier integracion de ese tipo requeriria desarrollo propio alrededor del modelo y no esta respaldada por el autor.
- Idoneidad limitada fuera de su tarea: no hay evidencia de rendimiento en conversacion general, codigo o razonamiento, por lo que no deberia emplearse como modelo de proposito general.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tang-yin-112/mt-invoice-4g-v1
- Modelo base declarado (Qwen/Qwen3.5-4B): https://huggingface.co/Qwen/Qwen3.5-4B
- Commit del modelo base indicado en la model card: 851bf6e806efd8d0a36b00ddf55e13ccb7b8cd0a
- Arena "Microtensor invoice / mt-4g": no disponible (no se proporciona URL)
- Paper, blog tecnico o repositorio de codigo: no disponible
- Demos: no disponible
- Busqueda web: no se han encontrado enlaces relevantes. Los resultados obtenidos corresponden a la dinastia Tang, a la marca de bebidas Tang y a la cadena de supermercados Tang Freres, y no guardan relacion con el modelo ni con el autor.
