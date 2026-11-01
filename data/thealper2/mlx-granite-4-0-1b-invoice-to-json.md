# thealper2/mlx-granite-4.0-1b-invoice-to-json

## Resumen

El modelo `thealper2/mlx-granite-4.0-1b-invoice-to-json` es un adaptador LoRA publicado en HuggingFace que convierte el texto extraido de una factura o nota de credito en un objeto JSON con ocho campos de cabecera: `vendor_name`, `invoice_number`, `invoice_date`, `currency`, `subtotal`, `tax`, `total` y `document_type`. No es un modelo autonomo: se carga sobre `ibm-granite/granite-4.0-1b` (commit `6a7381ba1f54d684ff508d991aeb7dc580157103`) y esta pensado para ejecutarse con MLX-LM sobre Apple Silicon.

El adaptador resuelve un problema acotado de extraccion de informacion estructurada en el dominio de cuentas a pagar: dado el texto plano de un PDF digital, devuelve una unica linea de JSON con los importes, la fecha en formato ISO, la divisa y el tipo de documento. El modelo base tiene 1.631,75 millones de parametros y el adaptador anade 20,316 millones de parametros entrenables, con un footprint de memoria pico de 6,82 GB durante el entrenamiento en un Apple M1 de 8 GB.

Su relevancia es doble: por un lado demuestra que un ajuste fino ligero sobre un modelo de 1B puede mejorar sustancialmente una tarea de extraccion concreta (del 54% al 83% de documentos con los ocho campos correctos en el benchmark del autor); por otro, documenta de forma transparente el procedimiento completo, incluido el conjunto de datos sintetico y las reglas de evaluacion, algo poco habitual en adaptadores de este tamano.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Granite 4.0 (`granitemoehybrid`); en este tamano, 40 bloques densos de atencion, sin expertos |
| Parametros totales | 1.631,75 M (modelo base) + 20,316 M entrenables (adaptador LoRA) |
| Parametros activos | no disponible (el tamano de 1B es denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (longitud maxima de secuencia en entrenamiento: 1536 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se entreno contra el base en bf16, sin cuantizacion) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX); el repositorio contiene `adapters.safetensors` + `adapter_config.json` |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia Granite 4.0 de IBM, con arquitectura `granitemoehybrid`. En la variante de 1B, el modelo usa 40 bloques densos de atencion sin mezcla de expertos, segun indica la model card. El adaptador se entrena con LoRA de rango 16 y escala 2.0 sobre todas las capas lineales de todos los bloques (q, k, v, o y MLP), con dropout 0.0 y optimizador AdamW (weight decay 0.0, correccion de sesgo activada), tasa de aprendizaje 2e-4 con schedule coseno y 20 pasos de calentamiento. El entrenamiento consistio en 1.200 micro-lotes de tamano 1 con acumulacion de gradiente 4, longitud maxima de secuencia 1.536, enmascaramiento del prompt y checkpointing de gradientes, semilla 42.

Los datos de entrenamiento son 2.000 documentos sinteticos generados por el propio proyecto (semilla 1), sin documentos reales ni de benchmark. Cubren 11 locales (US, GB, DE, FR, NL, ZA, NA, ZM, IN, AU, CA) con sus divisas, etiquetas y tipos de impuesto, formatos de fecha y numero; aproximadamente un 12% son notas de credito (con signo negativo, parentesis, `CR` o sin signo), un 15% son layouts con impuesto incluido, e incluyen descuentos, entre 1 y 30 lineas de detalle, tablas multipagina con filas arrastradas y numeros distractores (numeros de pedido, vencimientos, datos bancarios). La composicion final es de 232 notas de credito y 1.768 facturas, con divisas AUD 165, CAD 203, EUR 572, GBP 170, INR 183, NAD 185, USD 184, ZAR 169 y ZMW 169. El formato es JSONL de chat de MLX-LM, con la perdida calculada solo sobre la respuesta del asistente. No hay split de validacion. El entrenamiento se completo en 30,0 s de tiempo de pared con una perdida final de 0,0, sobre un Apple M1 de 8 GB con macOS 27.0 y Python 3.12.15.

## Capacidades

- Extraccion de informacion estructurada: convierte el texto de una factura o nota de credito en un objeto JSON con exactamente ocho claves de cabecera.
- Normalizacion de fechas a formato `YYYY-MM-DD` y de divisas a codigo ISO.
- Distincion entre factura y nota de credito mediante el campo `document_type`; los importes se devuelven siempre como numeros positivos.
- Manejo de layouts con impuesto incluido, descuentos, cargos y tablas multipagina con filas arrastradas.
- Robustez frente a numeros distractores (numeros de pedido, fechas de vencimiento, datos de cuenta y banco).
- Generacion de JSON valido en el 100% de los casos del benchmark del autor, con decodificacion greedy y un maximo de 160 tokens nuevos.
- Capacidades multilingues: limitadas al ingles en la practica, aunque los documentos cubren convenciones de 11 locales.
- No soporta tool calling, function calling, agentes, vision ni audio segun la informacion disponible.

## Casos de uso

- **Primera pasada en un flujo de cuentas a pagar**: el adaptador extrae los ocho campos de cabecera del texto de un PDF digital y los entrega como JSON listo para validacion humana, reduciendo el trabajo manual de tecleo en el registro de facturas.
- **Prototipado y docencia sobre extraccion de informacion**: al ser un adaptador pequeno con procedimiento de entrenamiento completamente documentado, sirve para experimentar con LoRA, MLX-LM y evaluacion por campos en un caso realista.
- **Preprocesado de facturas para conciliacion bancaria**: los campos `total`, `currency` e `invoice_date` permiten cruzar automaticamente facturas con movimientos contables antes de la revision final.
- **Clasificacion documental factura frente a nota de credito**: el campo `document_type` permite enrutar documentos a circuitos contables distintos (abono o cargo) en un pipeline de ingestion.
- **Extraccion sobre documentos con convenciones internacionales**: los 11 locales del entrenamiento permiten procesar facturas con formatos de fecha y numero estadounidenses, britanicos, alemanes, franceses, neerlandeses, sudafricanos, namibios, zambianos, indios, australianos y canadienses en ingles.
- **Generacion de datos estructurados para pruebas**: el JSON de salida puede alimentar fixtures de test o bases de datos de demostracion en entornos de desarrollo de software financiero.
- **Ejecucion local en portatiles Apple Silicon**: al ejecutarse con MLX-LM sobre el modelo base de 1B, permite procesar facturas en local sin enviar documentos a servicios externos, util para entornos con requisitos de privacidad.

## Benchmarks y rendimiento

Evaluacion sobre los 100 PDFs digitales del dataset `drew-ipp/invoice-extraction-benchmark` (revision `446bab08662790cb39457792243bff5704373b95`), en las categorias clean, currency, tax, credit, multipage y freight; se excluyen fotos, escaneos, escritura manual y la categoria "hard". Texto extraido con pypdf, decodificacion greedy, maximo 160 tokens nuevos. Un documento cuenta como correcto solo si los ocho campos son correctos.

| Modelo | Documentos con 8 campos correctos | Campos correctos | JSON valido | Fecha |
|---|---|---|---|---|
| Base `ibm-granite/granite-4.0-1b` | 54 / 100 (54,0%) | 720 / 800 (90,0%) | 100,0% | 2026-10-28 |
| Base + este adaptador | 83 / 100 (83,0%) | 775 / 800 (96,9%) | 100,0% | 2026-10-28 |

El autor advierte que 100 documentos sinteticos generados por un unico motor de layout constituyen un test pequeno y estrecho, y que el intervalo de confianza al 95% sobre la puntuacion por documento puede alcanzar aproximadamente ±10 puntos porcentuales. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- **VRAM/unified memory estimada**: el entrenamiento del adaptador sobre el modelo base en bf16 alcanzo un pico de 6,82 GB en un Apple M1 de 8 GB de memoria unificada; la inferencia con el adaptador cargado requiere un orden de magnitud similar, aunque no se especifica una cifra exacta de inferencia.
- **GPU recomendadas**: Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra) con Metal, ya que el adaptador esta en formato MLX. No se documenta soporte para GPU NVIDIA o AMD.
- **Cabe en GPU de consumo**: si, en equipos Apple Silicon con al menos 8 GB de memoria unificada segun el perfil de entrenamiento `m1_air_8gb`; no se confirma en GPUs de consumo NVIDIA por falta de formato compatible.
- **Opciones de despliegue**: MLX y MLX-LM (mlx 0.32.4, mlx-lm 0.32.2) sobre macOS. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- **Latencia y throughput**: no disponibles en la informacion proporcionada; el entrenamiento completo tardo 30,0 s en un M1 de 8 GB, pero no se aportan metricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Este adaptador (sobre Granite 4.0 1B) | 1.631,75 M + 20,316 M LoRA | no disponible | Extraccion de facturas a JSON | apache-2.0 | safetensors MLX |
| `ibm-granite/granite-4.0-1b` (base sin adaptador) | 1.631,75 M | no disponible | Generacion de texto general | apache-2.0 | safetensors bf16 |
| Alternativas especializadas en extraccion de facturas | no disponible | no disponible | no disponible | no disponible | no disponible |

La unica comparacion directa documentada es contra el modelo base sin adaptador, donde el ajuste LoRA mejora la puntuacion por documento del 54,0% al 83,0% y la de campos del 90,0% al 96,9%. No se dispone de datos de otros adaptadores o modelos especializados comparables en la informacion proporcionada.

## Limitaciones y advertencias

- **Requiere revision humana obligatoria**: el propio autor indica que todo valor extraido debe comprobarse antes de usarse para pagos, contabilidad o declaraciones fiscales.
- **Fuera de alcance**: lineas de detalle, documentos escaneados o fotografiados (no hay OCR), extractos y ficheros con varias facturas, y cualquier decision de pago totalmente automatizada.
- **Datos de entrenamiento sinteticos**: los 2.000 documentos proceden de un unico generador, lo que limita la variedad de layouts; el rendimiento en documentos reales puede diferir del reportado.
- **Idioma**: el modelo esta etiquetado solo para ingles; aunque cubre convenciones de 11 locales, no se ha entrenado para procesar texto en otros idiomas.
- **Sesgo de dominio**: el adaptador solo conoce el esquema de ocho campos de cabecera y no puede extraer otra informacion ni responder a peticiones fuera de esa tarea.
- **Riesgo de alucinacion**: en campos ausentes o ambiguos el modelo puede generar valores plausibles pero incorrectos; la validacion por campos del benchmark muestra un 3,1% de campos erroneos incluso en el mejor caso.
- **Sin split de validacion**: el entrenamiento no reservo datos de validacion, por lo que no hay curva de generalizacion documentada.
- **Dependencia de version**: el adaptador debe cargarse sobre el commit exacto `6a7381ba1f54d684ff508d991aeb7dc580157103` del modelo base; otras revisiones pueden romper la compatibilidad.
- **Ecosistema restringido**: solo se documenta ejecucion con MLX-LM en macOS sobre Apple Silicon; no hay soporte confirmado para CUDA, vLLM, llama.cpp u Ollama.
- **Licencia**: apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base; conviene revisar la licencia de `ibm-granite/granite-4.0-1b` antes de desplegar en produccion.
- **Estado experimental**: el autor califica el proyecto como experimental y educativo, no como un componente listo para produccion.

## Enlaces

- Repositorio HuggingFace del adaptador: https://huggingface.co/thealper2/mlx-granite-4.0-1b-invoice-to-json
- Modelo base: https://huggingface.co/ibm-granite/granite-4.0-1b
- Dataset de evaluacion: https://huggingface.co/datasets/drew-ipp/invoice-extraction-benchmark
- Repositorio del modelo base (pre-entrenamiento): https://huggingface.co/ibm-granite/granite-4.0-1b-base
- Libreria MLX-LM: no disponible en la informacion proporcionada
- Paper o blog del adaptador: no disponible en la informacion proporcionada
- Demo o espacio asociado: no disponible en la informacion proporcionada
