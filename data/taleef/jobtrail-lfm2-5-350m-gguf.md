# taleef/jobtrail-lfm2.5-350m-GGUF

## Resumen
JobTrail LFM2.5-350M es un ajuste fino por LoRA del modelo LiquidAI/LFM2.5-350M, desarrollado por el usuario taleef para la aplicación JobTrail. Su única función es convertir una nota libre escrita por un profesional de los oficios (fontanería, electricidad, climatización, carpintería, electrodomésticos, limpieza, pintura, tejados y trabajos generales) en un registro de trabajo estructurado en JSON con claves cortas. El modelo resuelve un problema muy concreto de extracción de información en el borde: cabe y se ejecuta en la CPU de un teléfono sin conexión.

Con 354.483.968 parámetros totales, el modelo se distribuye únicamente en formato GGUF para llama.cpp, con cuantizaciones desde F16 (711 MB) hasta Q4_0 (219 MB). La variante por defecto de la aplicación es Q4_K_M, de 229 MB, que mantiene un 70,6 % de registros correctos sin edición sobre el conjunto de test del proyecto. Es relevante porque demuestra que un modelo de 350M, ajustado con 760 notas sintéticas y guiado por una gramática JSON, puede superar ampliamente a alternativas mayores con prompting (Qwen3-1.7B logra un 19,0 % en la misma tarea).

El modelo es monolingüe en inglés, está especializado en nueve oficios y no pretende ser un extractor general: cualquier campo fuera del esquema definido se descarta. Su licencia es lfm1.0, heredada del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base LiquidAI/LFM2.5-350M), ajuste fino por LoRA |
| Parametros totales | 354.483.968 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 4096 tokens en la configuración de referencia (llama-server -c 4096); contexto nativo del modelo base no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q4_K_M, Q4_0 |
| Idiomas soportados | inglés |
| Licencia | lfm1.0 (license_name: lfm1.0, license: other) |
| Formato de pesos | GGUF (generado con llama.cpp b9837: convert_hf_to_gguf.py y llama-quantize) |

## Arquitectura y entrenamiento
El modelo parte de LiquidAI/LFM2.5-350M, un transformer de 350M parámetros, y se ajusta mediante LoRA sobre un conjunto de 760 notas de campo sintéticas del dataset taleef/jobtrail-field-notes. El entrenamiento no se describe en detalle en la model card: no se indica el número de tokens, la composición exacta del dataset ni si hubo RLHF o DPO. La innovación técnica principal no está en la arquitectura, sino en el uso de decodificación restringida por gramática: se pasa el JSON Schema schema.v2.compact.json como gramática a llama.cpp, lo que garantiza que la salida sea siempre JSON válido.

Las notas de entrenamiento y de test fueron generadas por Gemini 3.8 Flash a partir de plantillas, y sus etiquetas fueron revisadas por modelo, no verificadas por humanos. El conjunto de test tiene 163 notas, de las cuales 49 provienen de 9 plantillas de trabajo excluidas del entrenamiento, lo que permite medir la generalización a tipos de trabajo no vistos. La plantilla de chat es la del modelo base y va embebida en el GGUF.

## Capacidades
- Extracción de información estructurada: convierte una nota de trabajo en un objeto JSON con los campos jobType, workPerformed, issuesFound, materials, laborMinutes, customerApproved y followUps.
- Clasificación en 9 oficios: plumbing, electrical, hvac, carpentry, appliance, cleaning, painting, roofing y general.
- Extracción de materiales con nombre, cantidad y unidad, incluyendo cantidades nulas cuando no se especifican.
- Detección de aprobación del cliente, incluso en casos de aprobación ausente o negación.
- Extracción de minutos de mano de obra a partir de expresiones de duración y frases con horas.
- Generación de seguimientos (followUps) a partir de indicaciones en la nota.
- Salida JSON válida garantizada al 100 % cuando se activa la gramática; sin gramática, entre el 96,9 % y el 100 % de las salidas son válidas según la cuantización.
- Ejecución en CPU y en dispositivo (on-device), sin necesidad de GPU.
- No soporta tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: no disponible; solo inglés.

## Casos de uso
- Aplicación móvil de gestión de trabajos para profesionales: el modelo se ejecuta en la CPU del teléfono con la cuantización Q4_K_M (229 MB, 394 MB de RAM pico) y convierte una nota dictada o escrita en un registro estructurado sin conexión. Es adecuado porque el consumo de memoria y la latencia (0,57 s p50 en un Ryzen 9 8940HX) encajan en el presupuesto de una app móvil.
- Generación automática de partes de trabajo: a partir de la nota del técnico, se rellenan los campos de trabajo realizado, problemas encontrados y materiales usados, lo que reduce la entrada manual en el sistema de facturación.
- Seguimiento de materiales para reposición: la extracción de materiales con nombre, cantidad y unidad permite generar listas de compra o avisos de falta de stock; el modelo acierta la cantidad en el 99,1 % de los materiales emparejados.
- Registro de aprobación del cliente: el campo customerApproved se extrae con un 100 % de acierto en el test, lo que permite dejar constancia documental de la autorización del cliente en el parte.
- Cálculo de mano de obra para facturación: laborMinutes se extrae con un 96,3 % de acierto, lo que permite estimar costes de mano de obra a partir de la nota sin intervención manual.
- Detección de seguimientos pendientes: el campo followUps identifica tareas como revisar tras una tormenta, lo que alimenta un sistema de recordatorios para el profesional.
- Procesamiento por lotes en el borde: al ser un modelo pequeño y sin dependencias de nube, se puede ejecutar en un servidor local o en un dispositivo embebido para procesar notas de campo de forma masiva y privada.
- Integración en pipelines de extracción con validación por esquema: al pasar el JSON Schema como gramática, la salida se puede insertar directamente en una base de datos o en una API sin capa de validación adicional.

## Benchmarks y rendimiento

Evaluación en el conjunto de test de JobTrail (n = 163), con gramática activada, temperatura 0 y llama-server b9837 en CPU (contexto 4096). "Zero-edit" significa que todos los campos del registro coinciden con el oro revisado.

| Modelo | Tamano | Test zero-edit |
|---|---:|---:|
| Este modelo, Q4_K_M | 229 MB | 70,6 % |
| LFM2.5-350M, con prompting (mejor de 4 prompts) | 219–379 MB | 1,2 % |
| Qwen3-1.7B, con prompting (few-shot) | 1,1 GB | 19,0 % |
| Gemini 3.8 Flash High (techo en nube) | – | 92,6 % |

Rendimiento por cuantización en el conjunto de test (163 notas):

| Fichero | Tamano | Zero-edit | Plantillas retenidas | RAM pico | p50 (CPU) |
|---|---:|---:|---:|---:|---:|
| F16 | 711 MB | 73,6 % | 23/49 | 853 MB | 1,56 s |
| Q8_0 | 379 MB | 73,6 % | 23/49 | 536 MB | 0,91 s |
| Q6_K | 293 MB | 73,0 % | 24/49 | 454 MB | 0,71 s |
| Q4_K_M | 229 MB | 70,6 % | 24/49 | 394 MB | 0,57 s |
| Q4_0 | 219 MB | 65,6 % | 20/49 | 384 MB | 0,59 s |

Puntuaciones por campo con Q4_K_M: jobType 89,0 %, laborMinutes 96,3 %, customerApproved 100 %, materials F1 0,989 (cantidad correcta en el 99,1 % de los materiales emparejados), workPerformed F1 0,953, issuesFound F1 0,959, followUps F1 0,966 y 0 % de valores alucinados.

Por segmento con Q4_K_M: notas de plantillas vistas en entrenamiento (114) 79,8 %; notas de las 9 plantillas retenidas (49) 49,0 %. Etiquetas de casos difíciles: approval-absent 80,0 %, hours phrasing 80,0 %, negation 79,2 %, no materials 76,0 %, self-correction 72,0 %, multiple materials 66,7 %, extra labor 53,8 %, supply-house trip 50,0 %.

## Requisitos de hardware
- VRAM estimada para inferencia: no aplica en el caso de referencia, que se ejecuta en CPU; la RAM pico de llama-server es de 853 MB (F16), 536 MB (Q8_0), 454 MB (Q6_K), 394 MB (Q4_K_M) y 384 MB (Q4_0).
- GPU recomendadas: no disponibles en la información proporcionada; el modelo está pensado para CPU y dispositivo.
- Cabe en GPU de consumo: sí, cualquier GPU con al menos 1 GB de memoria libre puede alojar la variante F16, aunque el caso de uso previsto es CPU.
- Cabe en móvil: sí, la variante Q4_K_M ocupa 229 MB en disco y 394 MB de RAM pico, lo que permite ejecución en la CPU de un teléfono.
- Opciones de despliegue: llama.cpp mediante llama-server (versión b9837 o superior) y, por extensión, cualquier runtime compatible con GGUF y gramáticas JSON Schema; no se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput: p50 de 0,57 s por nota con Q4_K_M en un Ryzen 9 8940HX (CPU), 0,71 s con Q6_K, 0,91 s con Q8_0 y 1,56 s con F16. En teléfonos la latencia es mayor; el proyecto JobTrail mide dispositivos móviles en el issue #77.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Zero-edit en JobTrail | Licencia | Disponibilidad |
|---|---:|---:|---:|---|---|
| JobTrail LFM2.5-350M Q4_K_M | 354M | 4096 (config. de referencia) | 70,6 % | lfm1.0 | GGUF en HuggingFace |
| LFM2.5-350M con prompting | 354M | no disponible | 1,2 % | lfm1.0 | safetensors/GGUF en HuggingFace |
| Qwen3-1.7B con prompting few-shot | 1,7B | no disponible | 19,0 % | no disponible | no disponible |
| Gemini 3.8 Flash High | no disponible | no disponible | 92,6 % | propietaria | API en nube |

La comparación se limita a la tarea de extracción de JobTrail; no se dispone de datos de benchmarks generales (MMLU, HumanEval, GSM8K) para este modelo ni para las alternativas en la información proporcionada.

## Limitaciones y advertencias
- El oficio en trabajos desconocidos es el principal fallo: 18 de los 48 fallos de Q4_K_M en test son el campo jobType, y los 18 provienen de plantillas retenidas. El modelo tiende a elegir un oficio vecino: carpintería a general (5), pintura a limpieza (3), electrodomésticos a fontanería (2) y climatización a fontanería (2).
- Los elementos de workPerformed fallan en 18 casos, la mayoría por un elemento omitido (9 solo omiten uno, 4 solo añaden uno y 5 hacen ambas cosas).
- Los materiales fallan en 12 casos: material omitido o extra, o cantidad o unidad incorrecta.
- Los minutos de mano de obra fallan en 6 casos, dos con la etiqueta extra-labor y dos con hours-phrasing.
- Los datos de entrenamiento y test son sintéticos: escritos por Gemini 3.8 Flash a partir de plantillas y con etiquetas revisadas por modelo, no verificadas por humanos. Las notas dictadas reales son más desordenadas.
- El modelo es solo en inglés, cubre nueve oficios y está entrenado para el trabajo de una sola persona; no es un extractor general y descarta cualquier campo fuera del esquema.
- El modelo puede equivocarse aunque la salida sea JSON válido; la validez sintáctica no garantiza la corrección semántica.
- Restricciones de licencia: lfm1.0 (license: other); deben revisarse los términos de la licencia del modelo base LiquidAI/LFM2.5-350M antes de un uso comercial.
- El uso de la gramática es necesario para garantizar el 100 % de JSON válido; sin ella, entre el 96,9 % y el 100 % de las salidas son válidas según la cuantización.
- Q4_0 pierde 5 puntos de zero-edit respecto a Q4_K_M con un ahorro de tamaño mínimo (219 MB frente a 229 MB), por lo que no se recomienda.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/taleef/jobtrail-lfm2.5-350m-GGUF
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-350M
- Dataset de notas de campo: https://huggingface.co/datasets/taleef/jobtrail-field-notes
- Repositorio de la aplicación JobTrail: https://github.com/Taleef7/JobTrail
- Esquema JSON: https://huggingface.co/taleef/jobtrail-lfm2.5-350m-GGUF/blob/main/schema.v2.compact.json
- Documento de puntuación: https://github.com/Taleef7/JobTrail/blob/main/packages/core/SCORING.md
- Issue de medición en móviles: https://github.com/Taleef7/JobTrail/issues/77
