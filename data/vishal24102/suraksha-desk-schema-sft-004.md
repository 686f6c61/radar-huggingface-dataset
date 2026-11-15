# vishal24102/suraksha-desk-schema-sft-004

## Resumen

SurakshaDesk Schema SFT 004 es un ajuste fino supervisado de Qwen2.5-3B-Instruct desarrollado por el usuario vishal24102 para una tarea muy concreta: la triage automatizada de disputas de pago UPI y fraude en el contexto indio. A partir de un mensaje de cliente, el modelo genera exclusivamente un JSON estricto de 8 campos (UTR, categoría de disputa, importe, retraso en la notificación, nivel de responsabilidad RBI, acciones obligatorias, idioma y severidad de pánico). No es un asistente conversacional general, sino un extractor de esquema especializado.

El modelo parte de la arquitectura transformer densa de Qwen2.5-3B-Instruct, con 3.085.938.688 parámetros totales y pesos en safetensors (bf16). Se ha entrenado mediante QLoRA (NF4 4-bit, r=16, alpha=32) sobre 810 casos sintéticos revisados por un único revisor, en 92 pasos y con una pérdida final de entrenamiento de 0,046. El resultado es un modelo merged que se distribuye bajo la Qwen Research License, lo que restringe su uso a investigación y fines no comerciales.

Su relevancia es acotada pero clara: demuestra que un ajuste fino de bajo coste (una sola RTX 4050 de portátil con 6 GB de VRAM) puede especializar un modelo de 3B en un esquema de salida rígido para un dominio regulado. No obstante, el propio autor lo etiqueta como research preview sobre datos sintéticos y sin evaluación con mensajes reales de clientes.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2), fine-tune de Qwen2.5-3B-Instruct |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (heredada de Qwen2.5-3B-Instruct) |
| Tipos de cuantización | Entrenado en QLoRA NF4 4-bit; pesos publicados en bf16 (safetensors). Otras cuantizaciones no disponibles |
| Idiomas soportados | Inglés (en), hindi (hi), hinglish (romanizado) |
| Licencia | Qwen Research License (research y no comercial) |
| Formato de pesos | Safetensors (modelo merged en bf16) |

## Arquitectura y entrenamiento

El modelo es un transformer denso decoder-only de la familia Qwen2, con 3.085.938.688 parámetros, inicializado desde Qwen2.5-3B-Instruct (commit `aa8e72537993ba99e69dfaafa59ed015b17504d1`). El ajuste se realizó con QLoRA: cuantización NF4 de 4 bits, LoRA con r=16 y alpha=32 aplicado a todas las proyecciones de atención y MLP, y pérdida calculada únicamente sobre los tokens del asistente. El entrenamiento constó de 92 pasos con una pérdida final de 0,046, ejecutado en una única GPU RTX 4050 de portátil con 6 GB de VRAM. Los pesos publicados son el resultado de fusionar el adaptador LoRA en el modelo base, en bf16.

Los datos de entrenamiento proceden del dataset `vishal24102/suraksha-desk-upi-reviewed-v3`, compuesto por 810 casos sintéticos y redactados por el proyecto, revisados por un único revisor con una pre-auditoría asistida por IA. La tarea de entrenamiento es única y estricta: producir el JSON de 8 campos de triage. No se menciona RLHF ni DPO. Las herramientas empleadas fueron CuratorKIT (datos), AlignTune (entrenamiento) y AuditKIT (evaluación), todas de Lexsi-Labs.

## Capacidades

- Generación de un JSON estricto de 8 campos para triage de disputas UPI: UTR, categoría de disputa, importe, retraso en la notificación, nivel de responsabilidad RBI, acciones obligatorias, idioma y severidad de pánico.
- Lectura y clasificación de mensajes de cliente en inglés, hindi (devanagari) y hinglish romanizado.
- Extracción de entidades relevantes para disputas: identificador UTR e importe.
- Clasificación de categoría de disputa y asignación de nivel de responsabilidad según la política RBI.
- Determinación del idioma del mensaje y de la severidad de pánico del cliente.
- Modo de uso recomendado con reglas de política como red de seguridad: el modelo lee hechos y categoría; las reglas deciden nivel, acciones e idioma de respuesta; plantillas revisadas redactan la respuesta.
- No soporta tool calling ni function calling de forma nativa según la información disponible.
- No se documentan capacidades de agente multi-paso, visión, audio ni modo thinking.

## Casos de uso

- Triage de primer nivel en mesas de ayuda de pagos UPI: el modelo recibe el mensaje del cliente y devuelve el JSON de 8 campos, que un agente humano revisa antes de actuar. Es adecuado porque la salida está restringida a un esquema fijo y verificable.
- Extracción de UTR e importe para conciliación: el campo UTR y el importe del JSON permiten enlazar automáticamente la reclamación con la transacción en el sistema interno, siempre con validación humana posterior.
- Clasificación de categoría de disputa para enrutado: la categoría predicha puede dirigir el caso al equipo correspondiente (fraude, cargo duplicado, servicio no prestado, etc.), con las reglas de política como red de seguridad.
- Cálculo asistido del nivel de responsabilidad RBI: el modelo propone un nivel de responsabilidad según la política del banco central indio, que las reglas de política confirman o corrigen antes de cualquier decisión.
- Detección de severidad y priorización: el campo de severidad de pánico permite ordenar la cola de atención y priorizar casos urgentes, con revisión humana obligatoria.
- Soporte multilingüe en atención al cliente india: al cubrir inglés, hindi y hinglish, puede procesar mensajes tal como los escriben los usuarios reales, aunque el hinglish romanizado a veces se confunde con inglés.
- Generación de borradores de respuesta: integrado con plantillas revisadas, el JSON alimenta la redacción de una respuesta preliminar que el agente humano aprueba o edita.
- Investigación y prototipado de asistentes regulados: sirve como base para estudiar ajustes finos de bajo coste en dominios con esquemas de salida estrictos y requisitos de cumplimiento.

## Benchmarks y rendimiento

| Modelo / configuración | 54 casos retenidos revisados (8 campos exactos) | 42 casos con redacción no familiar (categoría correcta) |
|---|---:|---:|
| Solo reglas (sin modelo) | 100%* | 45,2% |
| Este modelo, con reglas de política como red de seguridad | 98,1% | 90,5% |

\* Las etiquetas revisadas se construyeron para coincidir con las reglas, por lo que el 100% de las reglas no demuestra nada; la comparación justa es el conjunto de redacción no familiar, etiquetado por el proyecto y no revisado de forma independiente.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 6,2 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica, en torno a 8 GB o más según longitud de contexto y lote.
- VRAM estimada en cuantización de 4 bits (no publicada oficialmente): del orden de 2-3 GB para pesos, más overhead; requiere cuantizar el modelo merged con herramientas externas.
- GPU recomendadas: RTX 4090, A100, H100 para despliegue en bf16 con holgura; RTX 3090/4080 también suficientes para bf16 en lote pequeño.
- Cabe en GPU de consumo: sí; el propio entrenamiento se hizo en una RTX 4050 de portátil con 6 GB (QLoRA). Para inferencia en bf16 se recomienda al menos 8-12 GB.
- Opciones de despliegue: transformers (código de ejemplo en la model card), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`). No se documentan integraciones con vLLM, llama.cpp u Ollama.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraksha-desk-schema-sft-004 | 3,09B | No disponible | Triage UPI/fraude con JSON de 8 campos | Qwen Research (no comercial) | Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3,09B | No disponible en esta ficha | Asistente general, instrucciones | Qwen Research / Apache 2.0 según variante | Hugging Face |
| Qwen2.5-1.5B-Instruct | 1,54B | No disponible en esta ficha | Asistente general, instrucciones | Qwen Research / Apache 2.0 según variante | Hugging Face |

La comparación con alternativas especializadas en triage de disputas UPI no está disponible en la información proporcionada. Frente a su modelo base, la diferencia principal es la restricción de salida al esquema JSON y el dominio acotado, no una mejora general de capacidades.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos y revisados por un único revisor; no se ha evaluado con mensajes reales de clientes.
- Solo cubre inglés, hinglish y hindi; el hinglish romanizado a veces se interpreta como inglés.
- Puede nombrar una categoría o un nivel de responsabilidad incorrectos, y puede escribir consejos que corresponden a otro caso.
- No presenta disputas ni debe usarse para prometer reembolsos.
- Cada salida es un borrador para un agente humano; el autor exige mantener un humano en el bucle y aplicar las comprobaciones del repositorio de GitHub.
- Licencia Qwen Research: uso exclusivamente de investigación y no comercial; cualquier uso comercial requiere revisar los términos de la licencia.
- Riesgo de alucinación en campos como UTR o importe si el mensaje no los contiene de forma explícita; no se documentan salvaguardas internas más allá de las reglas externas.
- No se documentan sesgos específicos más allá de la limitación lingüística y del dominio indio.
- El modelo espera un prompt de entrenamiento exacto (instrucción + contrato JSON + política RBI + contexto del operador + mensaje enmascarado); usarlo con otro formato degrada la salida.
- El conjunto de evaluación de redacción no familiar está etiquetado por el proyecto, no revisado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vishal24102/suraksha-desk-schema-sft-004
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/vishal24102/suraksha-desk-upi-reviewed-v3
- Código, demo y documentación: https://github.com/vishal88736/suraksha-merge
- Licencia (Qwen Research License): archivo `LICENSE` en el repositorio del modelo
