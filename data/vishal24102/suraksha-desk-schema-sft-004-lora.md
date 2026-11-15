# vishal24102/suraksha-desk-schema-sft-004-lora

## Resumen

`suraksha-desk-schema-sft-004-lora` es un adaptador LoRA (QLoRA, rango 16, alpha 32) entrenado sobre el modelo base `Qwen/Qwen2.5-3B-Instruct` por el usuario vishal24102. Su propósito es actuar como asistente de triaje para disputas de pagos UPI y fraude en el contexto regulatorio de la India: a partir de un mensaje de cliente, genera un JSON estricto de 8 campos (UTR, categoría de disputa, importe, retraso en la notificación, nivel de responsabilidad RBI, acciones obligatorias, idioma y severidad de pánico). El adaptador no está pensado como modelo generalista, sino como un componente especializado dentro de un pipeline con reglas de política como red de seguridad.

El modelo se distribuye como adaptador PEFT (0,1 GB de repositorio) y requiere cargar el base Qwen2.5-3B-Instruct. La arquitectura subyacente es un transformer decoder-only de 3 mil millones de parámetros con una ventana de contexto de 32 768 tokens (característica estándar de la familia Qwen2.5, aunque la model card no la explicita). El entrenamiento se realizó con 810 casos sintéticos revisados por un único revisor, en inglés, hinglish y hindi (devanagari), con 92 pasos y una pérdida final de 0,046.

Es relevante ahora como ejemplo de fine-tuning de bajo coste (una sola GPU RTX 4050 de 6 GB) para dominios regulados muy específicos, y por su enfoque explícito de "research preview" con datos sintéticos y sin evaluación en mensajes reales de clientes. Su licencia Qwen Research restringe el uso a investigación y no comercial, lo que limita su adopción en producción sin acuerdos adicionales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) con adaptador LoRA |
| Parámetros totales | 3B (modelo base); adaptador LoRA de rango 16 sobre todas las proyecciones de atención y MLP |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la model card (el base Qwen2.5-3B-Instruct soporta 32 768 tokens) |
| Tipos de cuantización | QLoRA NF4 4-bit para entrenamiento; el adaptador puede combinarse con cuantizaciones del base (no especificadas) |
| Idiomas soportados | inglés, hindi (devanagari), hinglish |
| Licencia | Qwen Research License (uso solo de investigación y no comercial) |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen2.5-3B-Instruct` en la revisión `aa8e72537993ba99e69dfaafa59ed015b17504d1`. El método es QLoRA con cuantización NF4 de 4 bits, LoRA de rango 16 y alpha 32 sobre todas las proyecciones de atención y MLP, con pérdida calculada únicamente sobre los tokens del asistente (assistant-only loss). El entrenamiento se ejecutó en una única GPU RTX 4050 de portátil con 6 GB de VRAM, durante 92 pasos, alcanzando una pérdida final de entrenamiento de 0,046. Las herramientas utilizadas fueron CuratorKIT (datos), AlignTune (entrenamiento) y AuditKIT (evaluación), todas de Lexsi-Labs.

El conjunto de entrenamiento son 810 casos sintéticos revisados por una persona (con pre-auditoría por IA), publicados en el dataset `vishal24102/suraksha-desk-upi-reviewed-v3`. La tarea es estrictamente la generación del JSON de 8 campos de triaje; no se entrenó para redactar respuestas al cliente ni para ejecutar acciones. El prompt de entrenamiento es fijo e incluye instrucción, contrato JSON, política RBI, contexto del operador y el mensaje del cliente enmascarado; el modelo espera exactamente ese formato en inferencia. No se menciona RLHF ni DPO.

## Capacidades

- Generación de JSON estructurado de 8 campos para triaje de disputas UPI: UTR, categoría, importe, retraso, nivel de responsabilidad RBI, acciones obligatorias, idioma y severidad de pánico.
- Comprensión de mensajes de cliente en inglés, hinglish y hindi (devanagari).
- Clasificación de categoría de disputa y nivel de responsabilidad regulatoria (RBI).
- Extracción de entidades financieras: identificador UTR e importe.
- Detección de retraso en la notificación del incidente.
- Estimación de severidad de pánico en el mensaje.
- Multilingüe limitado a los tres idiomas citados; el hinglish romanizado a veces se interpreta como inglés.
- No soporta tool calling ni function calling de forma nativa.
- No está diseñado para razonamiento multi-paso ni para agentes autónomos.
- No tiene visión, audio ni modo de pensamiento extendido.

## Casos de uso

- Triaje automatizado de disputas UPI en un centro de atención: el modelo recibe el mensaje del cliente y devuelve el JSON de 8 campos, que un sistema de reglas valida antes de enrutar el caso a un agente humano. Es adecuado por su formato de salida estricto y su entrenamiento específico en el dominio.
- Pre-relleno de formularios de disputa: el JSON generado puede poblar campos de un CRM o sistema de ticketing, reduciendo el tiempo de captura manual por parte del agente.
- Clasificación de severidad y priorización: la severidad de pánico y el nivel de responsabilidad RBI permiten ordenar la cola de casos y asignar recursos según urgencia regulatoria.
- Detección de retraso en la notificación: el campo de retraso permite identificar casos fuera de plazo y activar protocolos de escalado conforme a la política RBI.
- Soporte multilingüe en primera línea: al cubrir inglés, hindi y hinglish, puede procesar mensajes de clientes en los tres idiomas sin traducción previa, aunque con la limitación del hinglish romanizado.
- Generación de borradores para agentes: la salida sirve como borrador estructurado que el agente humano revisa y completa con plantillas aprobadas, manteniendo el control humano sobre la decisión final.
- Evaluación y auditoría de políticas: el JSON estructurado facilita el registro y la auditoría de decisiones de triaje en entornos de cumplimiento.

## Benchmarks y rendimiento

| Métrica | Solo reglas (sin modelo) | Modelo con reglas como red de seguridad |
|---|---:|---:|
| 54 casos reservados revisados (8 campos exactos) | 100%* | 98,1% |
| 42 casos con redacción no familiar (categoría correcta) | 45,2% | 90,5% |

\* Las etiquetas revisadas se construyeron para coincidir con las reglas, por lo que el 100% de las reglas no es una comparación válida; el conjunto de redacción no familiar es la comparación justa, aunque está etiquetado por el proyecto y no revisado de forma independiente.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el base Qwen2.5-3B-Instruct en bfloat16 requiere aproximadamente 6-7 GB; en cuantización 4-bit, alrededor de 2-3 GB. El adaptador LoRA añade una sobrecarga mínima (rango 16).
- GPU recomendadas: RTX 4050 de 6 GB (usada para entrenamiento), RTX 3060/4060, RTX 4090, A100, H100.
- Cabe en GPU de consumo: sí, en GPUs con 6 GB o más en cuantización 4-bit; en bfloat16 se recomienda 8 GB o más.
- Opciones de despliegue: transformers + peft (según el ejemplo de la model card); vLLM y TGI requerirían fusionar el adaptador con el base; llama.cpp/Ollama no soportan adaptadores PEFT directamente sin conversión a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraksha-desk-schema-sft-004-lora | 3B (base) + LoRA r16 | no disponible (base 32k) | Triaje UPI/fraude, JSON 8 campos | Qwen Research (no comercial) | Hugging Face, 0 descargas |
| Qwen2.5-3B-Instruct (base) | 3B | 32 768 tokens | Generalista, instrucciones | Qwen Research / Apache 2.0 según variante | Hugging Face, ampliamente usado |
| Modelos generalistas de 3B (p. ej. Llama 3.2 3B Instruct) | 3B | 128k tokens | Generalista | Llama Community License | Hugging Face |

La comparación directa con alternativas especializadas en triaje UPI no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos revisados por un único revisor; no se ha evaluado con mensajes reales de clientes.
- Solo cubre inglés, hinglish y hindi; el hinglish romanizado a veces se interpreta como inglés.
- Puede asignar una categoría o nivel de responsabilidad incorrectos, o escribir consejos pertenecientes a otro caso.
- No presenta disputas ni debe usarse para prometer reembolsos.
- Cada salida es un borrador para un agente humano; se requiere revisión humana obligatoria.
- Licencia Qwen Research: uso exclusivamente de investigación y no comercial; cualquier uso comercial requiere acuerdo adicional.
- No conectado a ningún banco; no apto para decidir disputas o reembolsos reales.
- Riesgo de alucinación en campos como UTR o importe si el mensaje no los contiene explícitamente.
- El prompt de inferencia debe coincidir exactamente con el de entrenamiento (`prompt_for` en el repositorio de GitHub); desviaciones degradan la salida.

## Enlaces

- Hugging Face: https://huggingface.co/vishal24102/suraksha-desk-schema-sft-004-lora
- Dataset: https://huggingface.co/datasets/vishal24102/suraksha-desk-upi-reviewed-v3
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de código, demo y documentación: https://github.com/vishal88736/suraksha-merge
