# vishal24102/suraksha-desk-dual-sft-004-lora

## Resumen

`suraksha-desk-dual-sft-004-lora` es un adaptador LoRA desarrollado por el usuario vishal24102 sobre el modelo base `Qwen/Qwen2.5-3B-Instruct`. Está especializado en la triage de disputas de pago UPI (Unified Payments Interface) y detección de fraude en el contexto del sistema de pagos instantáneos de la India. A partir de un mensaje de cliente, el modelo genera un JSON estricto de 8 campos (UTR, categoría de disputa, importe, retraso en la notificación, nivel de responsabilidad RBI, acciones obligatorias, idioma y severidad de pánico) y, además, la respuesta al cliente.

El modelo se presenta explícitamente como una *research preview* entrenada únicamente con datos sintéticos y casos redactados por el proyecto, revisados por un único revisor con pre-auditoría por IA. No ha sido evaluado con mensajes reales de clientes, no está conectado a ningún banco y no debe usarse para decidir disputas o reembolsos reales. Cada salida es un borrador para un agente humano.

Es relevante ahora por su enfoque verticalizado: un fine-tune pequeño (3B parámetros, adaptador de rango 16) que combina generación estructurada de JSON con respuesta conversacional en inglés, hinglish y hindi, y que documenta de forma transparente sus límites y métricas de validación interna. El adaptador ocupa aproximadamente 0,1 GB y se entrenó en una única GPU de portátil (RTX 4050, 6 GB) mediante QLoRA.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parámetros totales | 3B (modelo base Qwen2.5-3B-Instruct) + adaptador LoRA de rango 16 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada del base Qwen2.5-3B-Instruct; no especificada en la información) |
| Tipos de cuantización | QLoRA NF4 4-bit para entrenamiento; el adaptador se distribuye en safetensors y puede combinarse con el base en bf16/fp16/4-bit |
| Idiomas soportados | inglés (en), hindi (hi), hinglish (romanizado) |
| Licencia | qwen-research (Qwen Research License; uso solo de investigación y no comercial) |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32) aplicado sobre todas las proyecciones de atención y MLP del modelo base Qwen2.5-3B-Instruct, un transformer decoder-only de 3B parámetros. El entrenamiento se realizó mediante QLoRA con cuantización NF4 de 4 bits, pérdida calculada solo sobre los tokens del asistente (*assistant-only loss*) y 183 pasos, alcanzando una pérdida final de entrenamiento de 0,307. El entrenamiento se ejecutó en una única GPU RTX 4050 de portátil con 6 GB de VRAM.

Los datos de entrenamiento consisten en 810 casos sintéticos revisados por humanos del dataset `vishal24102/suraksha-desk-upi-reviewed-v3`, en inglés, hinglish y hindi (devanagari). El modelo se entrena para dos tareas simultáneas: generar el JSON estricto de 8 campos y redactar la respuesta al cliente. El prompt de entrenamiento es específico (instrucción + contrato JSON + política RBI + contexto del operador + mensaje del cliente enmascarado) y debe reproducirse exactamente en inferencia. Las herramientas utilizadas fueron CuratorKIT (datos), AlignTune (entrenamiento) y AuditKIT (evaluación), todas de Lexsi-Labs.

## Capacidades

- Generación de JSON estructurado de 8 campos para triage de disputas UPI: UTR, categoría de disputa, importe, retraso en la notificación, nivel de responsabilidad RBI, acciones obligatorias, idioma y severidad de pánico.
- Generación de respuesta al cliente en inglés, hinglish o hindi (devanagari).
- Clasificación de categoría de disputa y estimación de nivel de responsabilidad según política RBI.
- Detección de severidad de pánico en el mensaje del cliente.
- Procesamiento de mensajes multilingües con mezcla de inglés e hindi.
- Modo de autoridad del modelo: el modelo redacta la respuesta completa y los chequeos solo la marcan para revisión.
- No soporta tool calling ni function calling de forma nativa según la información disponible.
- No se documentan capacidades de visión, audio ni modo de razonamiento extendido (*thinking mode*).

## Casos de uso

- Triage asistido de disputas UPI en un centro de atención: el modelo recibe el mensaje del cliente y genera el JSON de 8 campos para que un agente humano lo revise antes de registrar la disputa, reduciendo el tiempo de clasificación manual.
- Generación de borradores de respuesta al cliente: produce una respuesta en el idioma del cliente (inglés, hinglish o hindi) que el agente puede editar y enviar, manteniendo coherencia con la categoría de disputa detectada.
- Enrutamiento interno de tickets: el campo de categoría de disputa y severidad de pánico permiten priorizar casos urgentes en una cola de soporte, siempre con validación humana posterior.
- Formación de agentes: el modelo puede generar ejemplos de triage y respuestas para entrenar a nuevos operadores en la política RBI de responsabilidad en disputas UPI.
- Investigación sobre NLP financiero multilingüe: sirve como base para estudiar el rendimiento de modelos pequeños en tareas de clasificación estructurada con mezcla de idiomas (hinglish).
- Prototipado de asistentes verticales: el adaptador demuestra un patrón de fine-tune QLoRA de bajo coste (6 GB VRAM) para dominios regulados, replicable en otros verticales con datos sintéticos revisados.

## Benchmarks y rendimiento

| Métrica | 54 casos reservados revisados | 42 casos con redacción no familiar |
|---|---:|---:|
| Categoría correcta | 96,3% | 76,2% |
| Los 8 campos correctos | 55,6% | no disponible |
| Respuesta marcada "necesita revisión humana" por los chequeos | 22 de 54 | 28 de 42 |
| Tiempo mediano por respuesta (RTX 4050, NF4) | 11 s | 12 s |

El autor indica que el modelo suele fallar en el nivel de responsabilidad (depende de hechos verificados por el operador que no puede inferir del mensaje) y en respuestas que toman prestado el consejo de otra categoría. Para precisión del JSON, el autor señala que el modelo solo-JSON es mejor.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador requiere cargar el modelo base Qwen2.5-3B-Instruct. En bf16, aproximadamente 6-7 GB de VRAM; en cuantización 4-bit (NF4), aproximadamente 2-3 GB.
- GPU recomendadas: RTX 4050 (6 GB) es suficiente según el autor para el modo NF4; RTX 4090, A100 o H100 para mayor throughput y precisión.
- Cabe en GPU de consumo: sí, en RTX 4050 con 6 GB en NF4 y en GPUs con 8 GB o más en bf16.
- Opciones de despliegue: transformers + peft (documentado), potencialmente vLLM o TGI tras fusionar el adaptador con el base; no se documentan integraciones con llama.cpp u Ollama.
- Latencia y throughput: mediana de 11-12 s por respuesta en RTX 4050 con NF4, según el autor.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| suraksha-desk-dual-sft-004-lora | 3B + LoRA r=16 | no disponible | Triage UPI y fraude | qwen-research (no comercial) | Hugging Face |
| Qwen2.5-3B-Instruct (base) | 3B | no disponible | Propósito general | qwen-research | Hugging Face |
| Modelos solo-JSON del mismo proyecto | no disponible | no disponible | Triage UPI (solo JSON) | no disponible | Referenciados en el repo GitHub |

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- Datos de entrenamiento sintéticos con un único revisor; no hay evaluación con mensajes reales de clientes.
- Solo soporta inglés, hinglish y hindi; el hinglish romanizado a veces se interpreta como inglés.
- Puede asignar una categoría o nivel de responsabilidad incorrectos y generar consejos que pertenecen a otro caso.
- No registra disputas ni debe usarse para prometer reembolsos.
- Licencia Qwen Research: uso solo de investigación y no comercial; restricciones para uso comercial.
- Debe mantenerse un humano en el bucle y usar los chequeos del repositorio GitHub; cada salida es un borrador.
- Riesgo de alucinación en campos que dependen de hechos verificados por el operador (nivel de responsabilidad).
- El prompt de entrenamiento debe reproducirse exactamente; desviaciones pueden degradar el rendimiento.

## Enlaces

- Hugging Face: https://huggingface.co/vishal24102/suraksha-desk-dual-sft-004-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset: https://huggingface.co/datasets/vishal24102/suraksha-desk-upi-reviewed-v3
- Código, demo y documentación: https://github.com/vishal88736/suraksha-merge
