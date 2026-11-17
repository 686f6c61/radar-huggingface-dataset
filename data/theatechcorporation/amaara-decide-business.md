# theatechcorporation/amaara-decide-business

## Resumen

amaara-decide-business es un modelo de decisión estructurada de 0,8 mil millones de parámetros (873.438.784 exactamente) desarrollado por The A-Tech Corporation PTY LTD (Queensland, Australia) mediante un ajuste fino supervisado sobre `unsloth/Qwen3.5-0.8B`. A diferencia de un modelo generativo convencional, no produce prosa: recibe un estado de negocio en JSON, una pregunta y un conjunto de opciones, y devuelve en una única pasada forward una elección con probabilidad calibrada para cada opción. Está diseñado para integrarse como componente de decisión dentro de flujos de trabajo empresariales automatizados.

El modelo cubre explícitamente cuatro familias de flujos: atención al cliente (enrutado y disposición de conversaciones de soporte), incidentes de seguridad (triaje de eventos), procesamiento de facturas (reconciliación, duplicidad y severidad) y observabilidad de trazas de agentes (evaluación del estado de una traza). El autor advierte de forma explícita que no es un modelo general de decisión empresarial: una versión anterior entrenada con un pool de flujos distinto apenas superaba el azar (0,44–0,63) y perdía frente a una línea base constante en dos de los cuatro flujos evaluados.

La relevancia del modelo reside en su enfoque metodológico: incluye ablaciones de intercambio entre flujos (cross-workflow swap) para demostrar que las respuestas dependen del estado de entrada y no del reconocimiento superficial del vocabulario, además de temperaturas de calibración ajustadas e incorporadas en los artefactos. La licencia Apache 2.0 y su reducido tamaño lo hacen desplegable en hardware modesto.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivado de Qwen3.5-0.8B), ajustado como modelo de decisión estructurada |
| Parametros totales | 873.438.784 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Full merged 16-bit (FP16), FP8, GGUF (p. ej. Q8_0); carga en 4-bit vía Unsloth mencionada en el ejemplo de código |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo principal), GGUF (repo separado `amaara-decide-business-GGUF`) |

## Arquitectura y entrenamiento

El modelo parte de `unsloth/Qwen3.5-0.8B`, un transformer decoder-only de 0,8B parámetros, y se ajusta mediante entrenamiento supervisado con la librería Unsloth (que el autor declara como 2x más rápida) junto con kernels personalizados Triton/CLEF para el mecanismo de decisión. La innovación principal no está en la arquitectura base sino en la cabeza de decisión: en lugar de generar tokens de texto, el modelo puntúa cada opción de un conjunto cerrado y devuelve una distribución de probabilidad sobre ellas en una sola pasada forward. El formato de tarea admite tres tipos de pregunta: `choice` (elección entre criterios), `score` (puntuación ordinal, p. ej. urgencia) y `noul` (booleana, p. ej. duplicidad).

El entrenamiento se realizó sobre un pool de flujos que incluye explícitamente las cuatro familias evaluadas (`customer_service`, `security_incidents`, `invoice_processing`, `agent_trace_observability`). El autor documenta que entrenar con un pool distinto y evaluar en estos cuatro produce resultados cercanos al azar, lo que evidencia que el modelo aprende una distribución previa del flujo si este no está presente en el entrenamiento. Se aplicó calibración de temperatura ajustada conjuntamente sobre filas de validación, con las temperaturas incorporadas en los artefactos (`clef.decision.temperature.*` en los GGUF, `temperatures.json` junto a los pesos). No se detalla el número de tokens de entrenamiento ni la composición exacta del dataset, ni si hubo RLHF/DPO.

## Capacidades

- Decisión estructurada sobre opciones cerradas: devuelve elección, probabilidad por opción y confianza por pregunta.
- Tres tipos de tarea: `choice` (selección entre criterios), `score` (escala ordinal) y `noul` (booleana sí/no).
- Triaje y disposición de conversaciones de soporte al cliente.
- Triaje de eventos de seguridad.
- Reconciliación, detección de duplicados y evaluación de severidad de facturas.
- Lectura y juicio del estado de trazas de agentes (observabilidad).
- Probabilidades calibradas utilizables directamente como umbrales sin post-procesado (ECE de 0,048 a 0,099 según flujo).
- No soporta generación de texto: el endpoint de generación devuelve HTTP 501 de forma intencionada.
- Solo inglés.

## Casos de uso

- Enrutado de tickets de soporte: dado el estado JSON de una conversación (historial, cliente, categoría), el modelo decide la disposición (`pay`, `manual_review`, `reject` u opciones equivalentes) con probabilidad calibrada, permitiendo umbrales de escalado a agentes humanos cuando la confianza es baja.
- Triaje de alertas de seguridad: ante un evento con metadatos estructurados, asigna severidad y disposición en una sola pasada, adecuado para pipelines de SIEM donde se requiere baja latencia y decisiones auditables.
- Procesamiento de facturas en cuentas a pagar: clasifica cada factura como pagar, revisar manualmente o rechazar, y detecta duplicados mediante la tarea `noul`, integrándose en flujos de reconciliación automatizada.
- Monitorización de agentes LLM en producción: lee trazas de agentes (estado, pasos, resultados) y juzga si la traza está en un estado correcto o requiere intervención, útil como guardarraíl en sistemas multi-agente.
- Priorización de urgencia: mediante la tarea `score`, ordena casos en niveles (rutina, pronto, inmediato) para colas de trabajo con SLA diferenciados.
- Decisión con umbral de confianza en sistemas de aprobación: al exponer probabilidades calibradas, permite configurar políticas del tipo "auto-aprobar si p>0,9, escalar si p<0,7", reduciendo la carga de revisión manual con trazabilidad numérica.
- Clasificación de texto estructurado en general: el pipeline declarado es `text-classification`, por lo que puede emplearse en cualquier tarea de etiquetado de opciones cerradas dentro de los flujos cubiertos.

## Benchmarks y rendimiento

Resultados medidos sobre el split de test (200 filas por flujo), sin estados compartidos entre train y test (verificado por hash):

| Flujo | Accuracy | Swap mismo flujo | Swap otro flujo | Delta | Supera prior constante | ECE |
|---|---|---|---|---|---|---|
| `customer_service` | 0,830 | 0,497 | 0,413 | +0,417 | +0,240 | 0,048 |
| `agent_trace_observability` | 0,767 | 0,400 | 0,367 | +0,400 | +0,260 | 0,052 |
| `security_incidents` | 0,770 | 0,515 | 0,383 | +0,387 | +0,165 | 0,055 |
| `invoice_processing` | 0,833 | 0,540 | 0,479 | +0,354 | +0,213 | 0,099 |

Calibración (ECE antes y después del ajuste de temperatura):

| Flujo | ECE antes | ECE después |
|---|---|---|
| `customer_service` | 0,128 | 0,048 |
| `agent_trace_observability` | 0,167 | 0,052 |
| `security_incidents` | 0,204 | 0,055 |
| `invoice_processing` | 0,099 | 0,099 |

La línea base de "respuesta más frecuente" puntúa 0,507–0,620 en estos flujos. El autor señala que la calibración de `invoice_processing` no mejora porque su error es de forma, no de escala. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada: en FP16, aproximadamente 1,8 GB para pesos (873M parámetros × 2 bytes) más overhead de activaciones; en Q8_0, en torno a 0,9–1 GB; en 4-bit, cerca de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4090) es más que suficiente; también A100/H100 para despliegues de alta concurrencia.
- Cabe en GPU consumer: sí, en cualquier GPU con 4 GB o más de VRAM, e incluso en CPU.
- Opciones de despliegue: llama.cpp mediante `llama-server -hf theatechcorporation/amaara-decide-business-GGUF:Q8_0 -ngl 0 -ub 2048 --threads 8`, con endpoint `/v1/systemone`; también carga vía `unsloth.FastDecisionModel.from_pretrained` con `load_in_4bit`.
- Latencia y throughput: no disponibles en la información proporcionada; el diseño de una sola pasada forward y el tamaño de 0,8B sugieren latencias bajas, pero no se aportan cifras.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la información proporcionada: los modelos de decisión estructurada con puntuación de opciones y calibración incorporada son poco comunes en el ecosistema abierto. Como referencia de tamaño y base:

| Modelo | Parámetros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| amaara-decide-business | 873M | no disponible | Decisión estructurada (4 flujos) | Apache 2.0 |
| Qwen3.5-0.8B (base) | ~0,8B | no disponible | Generación de texto general | no disponible en la información |
| Alternativas de clasificación de texto de tamaño similar | no disponible | no disponible | Clasificación | no disponible |

## Limitaciones y advertencias

- Alcance restringido: solo cubre cuatro flujos de trabajo; no es un modelo general de decisión empresarial. Fuera de esos flujos el rendimiento cae cerca del azar, como demuestra la ablación cross-workflow (0,367–0,479).
- Dependencia del mix de entrenamiento: la versión anterior, entrenada sin los flujos evaluados, perdía frente a una línea base constante en dos de cuatro flujos. Cualquier flujo nuevo requiere reentrenamiento o validación propia.
- Solo inglés; no se documenta soporte multilingüe.
- Calibración imperfecta en `invoice_processing` (ECE 0,099 sin mejora tras el ajuste); si se usan umbrales sobre sus probabilidades, deben validarse con datos propios.
- Riesgo de alucinación no aplicable en el sentido generativo (no produce texto), pero sí de sobreconfianza en estados fuera de distribución; las probabilidades calibradas mitigan parcialmente este riesgo.
- No soporta generación de texto (HTTP 501 intencionado), por lo que no puede usarse como modelo conversacional.
- Sesgos: no documentados en la información disponible; al entrenarse sobre flujos empresariales concretos, puede heredar sesgos de esos datos.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías sobre el rendimiento fuera de los flujos evaluados.
- Longitud de contexto no especificada: los estados JSON largos podrían truncarse sin que se documente el límite.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-decide-business
- Pesos GGUF: https://huggingface.co/theatechcorporation/amaara-decide-business-GGUF
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Unsloth (repositorio): https://github.com/unslothai/unsloth
