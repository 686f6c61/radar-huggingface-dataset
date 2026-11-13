# werty3684/quote-distill-students

## Resumen

Quote Distill students es un paquete de dos modelos pequenos publicados por el desarrollador werty3684 como parte del proyecto Quote Distill, un estudio de destilacion de conocimiento profesor-alumno orientado a la extraccion de cotizaciones de proveedores. El objetivo es convertir documentos de presupuestos y cotizaciones en JSON estructurado directamente en el navegador, sin clave de API ni servidor. Los dos modelos son un tagger basado en el encoder Ettin de 32 millones de parametros (jhu-clsp/ettin-encoder-32m) y un modelo generativo de 362 millones de parametros afinado a partir de SmolLM2-360M-Instruct.

El tagger marca los spans de cada campo en el texto y un codigo deterministico los convierte en JSON; el generativo escribe el JSON directamente. Ambos siguen el esquema quotation schema v1.0.0, que cubre proveedor, numero de cotizacion, fecha, moneda, lineas de detalle, descuentos, GST, subtotal, total, validez y condiciones de pago, con valores monetarios como cadenas exactas de dos decimales.

La relevancia actual reside en su enfoque de despliegue en el cliente: el tagger en float32 ocupa 128 MB y el generativo en 4 bits 387 MB, lo que permite ejecucion local con transformers.js y onnxruntime. No obstante, el propio autor advierte de que el rendimiento en documentos reales es mucho menor que en el conjunto de test sintetico, con 0 de 30 documentos completamente correctos en un conjunto fuera de distribucion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tagger: encoder transformer (Ettin, 32M). Generativo: transformer decoder (SmolLM2-360M-Instruct) |
| Parametros totales | Tagger: 32M. Generativo: 362M |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | Tagger: 1.024 tokens de entrada. Generativo: maximo 768 tokens nuevos generados |
| Tipos de cuantizacion | Tagger: float32 (model.onnx, 128 MB) e int8 (no usable, ver limitaciones). Generativo: 4-bit (model_q4.onnx + model_q4.onnx_data, 387 MB) e int8 (no cargado por la demo) |
| Idiomas soportados | Ingles (en) |
| Licencia | Codigo y tagger: MIT. Pesos generativos: Apache-2.0 (heredada de SmolLM2-360M-Instruct). Licencia agregada: mit-and-apache-2.0 |
| Formato de pesos | ONNX (model.onnx, model_q4.onnx, model_quantized.onnx) |

## Arquitectura y entrenamiento

El tagger emplea el encoder Ettin de 32 millones de parametros, un transformer encoder utilizado para token classification: marca los spans de cada campo del documento y un decodificador de spans deterministico los transforma en JSON. El generativo es un transformer decoder de 362 millones de parametros afinado desde SmolLM2-360M-Instruct, que produce el JSON directamente con decodificacion greedy y una expansion posterior del JSON. Ninguno de los dos modelos es utilizable con un pipeline estandar: el tagger requiere la tokenizacion propia del repositorio (separacion de puntuacion antes del BPE) y su decodificador de spans, mientras que el generativo necesita su prompt de entrenamiento, decodificacion greedy y la expansion del JSON.

El entrenamiento se realizo integramente con datos sinteticos: 10.000 cotizaciones generadas para entrenamiento y 1.000 para validacion, en cinco locales (Singapur, Australia, Nueva Zelanda, Malasia y Estados Unidos) y cinco layouts. Incluyen casos dificiles como precios con GST incluido, descuentos por linea y por documento, empates de redondeo a medio centavo, creditos y filas gratuitas, campos ausentes y errores aritmeticos del proveedor. Las etiquetas provienen del generador y se verifican con comprobaciones aritmeticas deterministas. No se usan proveedores, precios ni documentos reales. El entrenamiento se ejecuto en una unica GPU de consumo y los cuadernos estan en el repositorio.

## Capacidades

- Extraccion de informacion estructurada de cotizaciones de proveedores a JSON segun el esquema quotation schema v1.0.0.
- Token classification (tagger) para marcar spans de campos: proveedor, numero de cotizacion, fecha, moneda, lineas de detalle, descuentos, GST, subtotal, total, validez y condiciones de pago.
- Generacion directa de JSON (modelo generativo) con valores monetarios como cadenas exactas de dos decimales.
- Distincion explicita entre campo declarado (con valor normalizado) y campo no declarado (`not_stated`).
- Manejo de casos dificiles: GST incluido, descuentos por linea y documento, empates de redondeo, creditos, filas gratuitas y errores aritmeticos del proveedor.
- Ejecucion en navegador mediante transformers.js y en Python mediante onnxruntime.
- Soporte multilingue: unicamente ingles.
- No dispone de tool calling, capacidades de agente, vision ni audio segun la informacion disponible.

## Casos de uso

- Extraccion de cotizaciones en el navegador: el tagger (128 MB en float32) procesa documentos de hasta 1.024 tokens y genera JSON sin enviar datos a un servidor, lo que resulta adecuado para flujos con requisitos de privacidad.
- Procesamiento por lotes en Python: el generativo en 4 bits (387 MB) puede integrarse con onnxruntime para convertir cotizaciones en JSON en pipelines internos, con una latencia mediana de 12,5 s por documento en CPU.
- Digitalizacion de presupuestos de proveedores en cinco locales (Singapur, Australia, Nueva Zelanda, Malasia y Estados Unidos): los modelos estan entrenados con layouts y formatos de esos mercados, incluido GST.
- Validacion aritmetica de cotizaciones: el esquema incluye subtotal, descuentos, GST y total, y los modelos se entrenaron con casos de errores aritmeticos del proveedor, lo que permite detectar discrepancias.
- Prototipado rapido de extraccion documental: al no requerir clave de API ni servidor, sirve para demos y pruebas de concepto en el cliente con transformers.js.
- Filtrado y preprocesado de documentos: el tagger, con 30 ms de latencia mediana en CPU, puede usarse como primera etapa para localizar campos antes de un procesamiento posterior.

## Benchmarks y rendimiento

Resultados sobre el conjunto de test congelado de 300 documentos, con metricas propias del proyecto que cuentan cada campo y cada linea de detalle:

| Modelo | Campo exacto | Documento completo exacto | Latencia mediana (CPU, onnxruntime) |
|---|---|---|---|
| Profesor: Claude Haiku | 11172/11208 (99,7%) | 260/300 (86,7%) | no medida |
| Tagger | 11208/11208 (100,0%) | 299/300 (99,7%) | 30 ms |
| Generativo (4 bits) | 11066/11208 (98,7%) | 278/300 (92,7%) | 12,5 s |

El autor advierte de que el conjunto de test proviene del mismo generador sintetico que los datos de entrenamiento: comparte layouts y redaccion, lo que favorece a los alumnos. En 30 cotizaciones escritas a mano con layouts nuevos (fuera de distribucion), ambos alumnos obtienen 0/30 documentos completamente correctos; el acierto por campo es de 565/888 (63,6%) para el tagger y 450/780 (57,7%) para el generativo.

## Requisitos de hardware

- VRAM estimada: el tagger en float32 ocupa 128 MB y el generativo en 4 bits 387 MB; ambos caben en cualquier GPU de consumo e incluso en CPU.
- GPU recomendadas: no se especifican; el entrenamiento se realizo en una unica GPU de consumo y la inferencia de referencia se midio en CPU con onnxruntime.
- Cabe en GPU de consumo: si, dado el tamano de los pesos (128 MB y 387 MB).
- Opciones de despliegue: transformers.js en navegador y onnxruntime en Python; los loaders de referencia estan en `demo/src/models/` (TypeScript) y `src/quote_distill/student/` (Python). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: tagger 30 ms de latencia mediana en CPU; generativo 12,5 s de latencia mediana en CPU. No se publican datos de throughput.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Tagger (este repo) | 32M | 1.024 tokens de entrada | 100,0% campo exacto / 99,7% documento exacto en test sintetico; 63,6% campo exacto en OOD | MIT | ONNX, transformers.js |
| Generativo (este repo) | 362M | 768 tokens nuevos | 98,7% campo exacto / 92,7% documento exacto en test sintetico; 57,7% campo exacto en OOD | Apache-2.0 | ONNX 4 bits, transformers.js |
| Claude Haiku (profesor) | no disponible | no disponible | 99,7% campo exacto / 86,7% documento exacto en test sintetico | no disponible | API |
| jhu-clsp/ettin-encoder-32m (base del tagger) | 32M | no disponible | no disponible | MIT | Hugging Face |
| HuggingFaceTB/SmolLM2-360M-Instruct (base del generativo) | 362M | no disponible | no disponible | Apache-2.0 | Hugging Face |

## Limitaciones y advertencias

- Entrenados con un unico generador sintetico: se espera menor precision en documentos reales, otros layouts y otros idiomas.
- En el conjunto fuera de distribucion de 30 cotizaciones escritas a mano, ambos modelos obtienen 0/30 documentos completamente correctos.
- El tagger solo lee los primeros 1.024 tokens; el generativo escribe como maximo 768 tokens nuevos.
- El campo de impuestos del esquema es GST; el SST de Malasia y el sales tax de Estados Unidos no estan modelados.
- `not_stated` significa que el documento no imprime el valor; los modelos estan entrenados para no inferir valores, pero pueden equivocarse. Hay que verificar la salida contra el documento antes de confiar en ella.
- El tagger cuantizado a int8 (`tagger/onnx/model_quantized.onnx`) obtiene 32/1000 en documentos de desarrollo porque la cuantizacion dinamica rompe el modelo; no debe usarse.
- El generativo cuantizado a int8 (`generative/onnx/model_quantized.onnx`) obtuvo 69/100 en documentos de desarrollo y la demo no lo carga.
- Ninguno de los dos modelos es utilizable con un pipeline estandar: requieren la tokenizacion, el decodificador de spans, el prompt de entrenamiento y la expansion del JSON del repositorio.
- Licencia: el codigo y el tagger son MIT; los pesos generativos mantienen Apache-2.0 y su aviso, por lo que el uso comercial esta permitido bajo esas condiciones.
- Riesgo de alucinacion en los valores extraidos, especialmente en documentos con layouts no vistos durante el entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/werty3684/quote-distill-students
- Repositorio del proyecto Quote Distill: https://github.com/Chi944/quote-distill
- Demo en vivo: https://chi944.github.io/quote-distill/
- Esquema de cotizacion v1.0.0: https://github.com/Chi944/quote-distill/blob/main/docs/schema.md
- Evaluacion completa: https://github.com/Chi944/quote-distill/blob/main/docs/evaluation.md
- Evaluacion fuera de distribucion: https://github.com/Chi944/quote-distill/blob/main/docs/ood.md
- Loaders de la demo (transformers.js): https://github.com/Chi944/quote-distill/tree/main/demo/src/models
- Loaders Python (onnxruntime): https://github.com/Chi944/quote-distill/tree/main/src/quote_distill/student
- Modelo base del tagger: https://huggingface.co/jhu-clsp/ettin-encoder-32m
- Modelo base del generativo: https://huggingface.co/HuggingFaceTB/SmolLM2-360M-Instruct
