# sumankumarbhadra/qwen2.5-0.5b-invoice-extractor-lora

## Resumen

El modelo `sumankumarbhadra/qwen2.5-0.5b-invoice-extractor-lora` es un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct` para la extraccion estructurada de informacion de facturas. Lo desarrolla el usuario de Hugging Face `sumankumarbhadra` y resuelve un problema muy concreto: convertir texto libre de facturas en un objeto JSON con campos normalizados (numero de factura, proveedor, fecha, subtotal, impuestos, total y divisa). Es relevante porque demuestra que un modelo de solo 0,5 mil millones de parametros puede alcanzar una precision de campo del 97,84% en una tarea extractiva bien delimitada, lo que abarata enormemente el despliegue en entornos con recursos limitados.

El adaptador se publica como pesos PEFT en formato safetensors y requiere cargar el modelo base Qwen2.5-0.5B-Instruct por separado. No se trata de un modelo autonomo, sino de un incremento de bajo rango (rank 16) que modifica unicamente las proyecciones de atencion (`q_proj`, `k_proj`, `v_proj`, `o_proj`), lo que supone aproximadamente el 0,44% de los parametros entrenables.

La ficha se basa exclusivamente en la model card publicada por el autor y en los metadatos de Hugging Face. No hay informacion sobre licencia, idiomas soportados ni datos de benchmarks estandarizados mas alla de la evaluacion interna sobre un conjunto sintetico de 99 ejemplos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA |
| Parametros totales | No disponible (modelo base Qwen2.5-0.5B-Instruct: ~0,5 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la model card (el modelo base Qwen2.5-0.5B-Instruct soporta hasta 32 768 tokens segun su propia documentacion, no verificable aqui) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; el modelo base admite cuantizacion estandar de transformers) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre un transformer decoder-only de la familia Qwen2.5, en su variante Instruct de 0,5 mil millones de parametros. La configuracion LoRA emplea rank 16, alpha 32, dropout 0,05 y modulos objetivo `q_proj`, `k_proj`, `v_proj` y `o_proj`, es decir, las cuatro proyecciones de atencion. Solo alrededor del 0,44% de los parametros del modelo base fueron entrenables durante el ajuste.

El entrenamiento uso 785 ejemplos de entrenamiento y 98 de validacion, con una longitud maxima de secuencia de 512 tokens, 5 epocas, tamano de lote efectivo 16 y tasa de aprendizaje 1e-4. Se aplico perdida unicamente sobre los tokens del asistente (assistant-only loss) y se selecciono el mejor checkpoint por perdida de validacion. No se menciona el uso de RLHF, DPO ni datos reales: el autor indica explicitamente que tanto el entrenamiento como la evaluacion se realizaron con datos sinteticos de facturas.

Una innovacion practica destacable es la recomendacion de decodificacion determinista (`do_sample=False`, `repetition_penalty=1.0`). El autor documenta que una penalizacion por repeticion de 1,1 reduce significativamente la precision porque la tarea exige copiar literalmente valores que ya aparecen en el texto de la factura.

## Capacidades

- Extraccion de informacion estructurada de facturas en formato JSON con siete campos: `invoice_number`, `vendor_name`, `invoice_date`, `subtotal`, `tax`, `total_amount` y `currency`.
- Normalizacion de fechas al formato `YYYY-MM-DD`.
- Representacion de valores ausentes como `null`.
- Devolucion de importes monetarios como numeros JSON (no como cadenas).
- Generacion de texto conversacional heredada del modelo base Qwen2.5-0.5B-Instruct.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, vision, audio ni modo de razonamiento explicito.
- Capacidades multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Digitalizacion de facturas en PYMEs: el adaptador convierte el texto OCR de una factura en un JSON listo para insertar en un ERP o base de datos, con una precision de campo del 97,84% en el conjunto de evaluacion sintetico.
- Prototipado rapido de pipelines de cuentas por pagar: al ejecutarse sobre un modelo de 0,5B, puede desplegarse en una sola GPU consumer o incluso en CPU, lo que permite validar el flujo completo antes de invertir en modelos mayores.
- Preprocesamiento en sistemas de contabilidad automatizada: extrae los campos clave y los normaliza (fechas ISO, importes numericos) para alimentar motores de conciliacion bancaria.
- Extraccion en el borde (edge) o en entornos con recursos limitados: el tamano reducido del modelo base permite ejecutarlo en dispositivos con poca VRAM o en contenedores ligeros sin GPU dedicada.
- Generacion de datasets etiquetados: dado que produce JSON valido el 100% de las veces en la evaluacion, puede usarse como etiquetador automatico para crear corpus de entrenamiento de mayor tamano.
- Validacion y enriquecimiento de documentos en flujos RPA: integrado en un pipeline de automatizacion robotica, extrae los campos de facturas recibidas por correo y los vuelca a una cola de procesamiento.
- Experimentacion academica con PEFT: sirve como ejemplo reproducible de ajuste LoRA sobre un modelo pequeno para una tarea extractiva con esquema fijo.

## Benchmarks y rendimiento

Evaluacion sobre un conjunto de test sintetico de 99 ejemplos, segun la model card:

| Metrica | Modelo base | Modelo ajustado (LoRA) |
|---|---|---|
| JSON valido | 93,94% | 100,00% |
| Coincidencia exacta de registro | 19,19% | 84,85% |
| Precision global de campo | 75,18% | 97,84% |

Precision por campo del modelo ajustado:

| Campo | Precision |
|---|---|
| invoice_number | 100,00% |
| vendor_name | 100,00% |
| invoice_date | 98,99% |
| subtotal | 85,86% |
| tax | 100,00% |
| total_amount | 100,00% |
| currency | 100,00% |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo base de 0,5B en precision FP16 ocupa aproximadamente 1 GB de pesos; con el adaptador LoRA (unos pocos MB) el total ronda 1-1,5 GB. En cuantizacion de 4 bits puede bajar de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente (RTX 3060, RTX 4060, RTX 4090). Tambien puede ejecutarse en CPU con latencia aceptable para procesamiento por lotes.
- Cabe holgadamente en GPU consumer e incluso en sistemas integrados con poca memoria.
- Opciones de despliegue: transformers + PEFT (metodo documentado por el autor), vLLM (previa fusion del adaptador con el modelo base), llama.cpp/Ollama (requiere conversion a GGUF tras fusionar el adaptador), TGI (previa fusion).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen2.5-0.5b-invoice-extractor-lora | ~0,5B (base) + LoRA | No disponible | Extraccion de facturas a JSON | No disponible | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-0.5B-Instruct | ~0,5B | 32 768 tokens (segun documentacion del modelo base) | Modelo generalista | Apache 2.0 (segun el modelo base) | Hugging Face |
| Qwen/Qwen2.5-1.5B-Instruct | ~1,5B | 32 768 tokens (segun documentacion del modelo base) | Modelo generalista | Apache 2.0 (segun el modelo base) | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct | ~3B | 32 768 tokens (segun documentacion del modelo base) | Modelo generalista | Qwen Research License (segun el modelo base) | Hugging Face |

La comparativa con modelos especializados en extraccion de facturas no esta disponible en la informacion proporcionada. Los datos de contexto y licencia del modelo base se citan a titulo orientativo y no han sido verificados en esta busqueda.

## Limitaciones y advertencias

- El autor advierte que el principal modo de error restante es el campo `subtotal`: cuando el valor esperado es `null`, el modelo a veces deriva un subtotal plausible a partir de total e impuestos en lugar de devolver `null`.
- Entrenamiento y evaluacion realizados exclusivamente con datos sinteticos; el rendimiento debe validarse sobre facturas reales antes de un despliegue en produccion.
- La licencia no esta disponible, lo que impide confirmar si se permite uso comercial del adaptador.
- No se documentan los idiomas soportados ni la composicion linguistica de los datos de entrenamiento.
- Riesgo de alucinacion en campos no presentes en el documento: el modelo puede inventar valores plausibles en lugar de devolver `null`, como demuestra el caso del `subtotal`.
- La decodificacion debe ser determinista (`do_sample=False`, `repetition_penalty=1.0`); usar penalizacion por repeticion superior a 1,0 degrada gravemente la precision.
- El modelo es un adaptador, no un modelo autonomo: requiere descargar y cargar el modelo base Qwen2.5-0.5B-Instruct, lo que anade dependencia y peso al despliegue.
- El contexto efectivo de entrenamiento fue de 512 tokens, por lo que facturas largas pueden superar la ventana usada durante el ajuste y degradar la extraccion.
- No se han publicado sesgos conocidos ni evaluaciones de robustez frente a dominios, idiomas o formatos de factura distintos de los sinteticos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/sumankumarbhadra/qwen2.5-0.5b-invoice-extractor-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Libreria PEFT: https://huggingface.co/docs/peft
