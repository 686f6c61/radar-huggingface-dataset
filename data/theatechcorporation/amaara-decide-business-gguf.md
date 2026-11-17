# theatechcorporation/amaara-decide-business-GGUF

## Resumen

amaara-decide-business-GGUF es la distribucion cuantizada en formato GGUF de amaara-decide-business, un modelo de decision de 0,8 mil millones de parametros desarrollado por The A-Tech Corporation PTY LTD (Queensland, Australia). A diferencia de un modelo generativo convencional, este sistema no produce prosa: recibe un estado en JSON y un conjunto de opciones, y devuelve una eleccion con una probabilidad calibrada para cada opcion. El modelo base es unsloth/Qwen3.5-0.8B, afinado con Unsloth y con nucleos de decision propios (CLEF) que incorporan temperaturas por cubeta directamente en los pesos.

Su relevancia radica en el enfoque: sustituye la generacion de texto por clasificacion calibrada en cuatro familias de flujos de trabajo empresariales concretas (customer_service, security_incidents, invoice_processing y agent_trace_observability). Las temperaturas de calibracion estan integradas en el GGUF como metadatos `clef.decision.temperature.*`, de modo que las probabilidades pueden usarse directamente como umbrales sin post-procesado adicional.

El modelo esta pensado para ejecutarse en CPU: con Q8_0 y 8 hilos ronda los 0,1 segundos por consulta, y la variante Q4_K_M ocupa solo 0,55 GB. La generacion de texto devuelve HTTP 501 por diseno, lo que lo convierte en un componente de decision acotado y predecible dentro de pipelines, no en un asistente conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (base Qwen3.5-0.8B) con cabeza de decision CLEF |
| Parametros totales | 779.717.956 (0,8B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (requiere `-ub 2048` o superior en llama.cpp) |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | en (ingles) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors y FP8 en el repositorio principal) |

## Arquitectura y entrenamiento

El modelo parte de unsloth/Qwen3.5-0.8B, un transformer de 0,8B parametros bajo licencia Apache-2.0, y se afina con Unsloth (que el autor declara como 2x mas rapido) junto con nucleos Triton personalizados para la ruta de decision CLEF. La innovacion principal no esta en el backbone, sino en la cabeza de decision: en lugar de generar tokens de respuesta, el modelo evalua el estado y el esquema de opciones en un unico lote y emite una puntuacion por opcion. Las temperaturas de calibracion por cubeta se hornean en el GGUF como claves `clef.decision.temperature.*`, de forma que las probabilidades resultantes son directamente utilizables como umbrales.

El entrenamiento se limita a cuatro familias de flujos de trabajo (customer_service, security_incidents, invoice_processing y agent_trace_observability). El autor documenta que una iteracion previa, entrenada sobre flujos no relacionados, obtuvo entre 0,44 y 0,63 en estas cuatro familias y perdio frente a una linea base constante de "respuesta mas frecuente" en la mitad de los casos, lo que motivo reentrenar especificamente sobre estos dominios. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se emplearon tecnicas de RLHF o DPO.

## Capacidades

- Clasificacion de decision con probabilidad calibrada por opcion sobre un estado JSON y un esquema de opciones.
- Tipos de pregunta soportados: `choice` (eleccion entre criterios), `score` (puntuacion ordinal sobre una lista de criterios) y `noul` (booleano con etiquetas).
- Cuatro familias de flujo de trabajo: atencion al cliente, incidentes de seguridad, procesamiento de facturas y observabilidad de trazas de agentes.
- Calibracion integrada: las temperaturas por cubeta permiten usar las probabilidades como umbrales sin recalibrado.
- Ejecucion en CPU via llama.cpp, con servidor compatible con endpoint `/v1/systemone`.
- No soporta generacion de texto (devuelve HTTP 501 por diseno).
- No soporta vision (no requiere proyector visual; solo lee estados de texto).
- No soporta tool calling ni razonamiento multi-paso en el sentido de un LLM generativo; su funcion es puntuar opciones.
- Multilingue: no, unicamente ingles.

## Casos de uso

- Triage de tickets de atencion al cliente: dado un estado JSON con los datos del ticket, el modelo elige entre las opciones disponibles (por ejemplo, escalar, responder o cerrar) con una probabilidad calibrada que puede mapearse directamente a umbrales de enrutamiento.
- Clasificacion de incidentes de seguridad: a partir de un estado con los indicadores del incidente, el modelo puntua la severidad y la accion recomendada, con una precision declarada de 0,770 en el split de test.
- Procesamiento de facturas: evalua si una factura debe pagarse, revisarse manualmente o rechazarse, y detecta duplicados mediante preguntas de tipo `noul`; util en pipelines de cuentas a pagar con validacion por umbral.
- Observabilidad de trazas de agentes: clasifica trazas de ejecucion de agentes para decidir si requieren intervencion, con una precision de 0,767 y un ECE de 0,052.
- Enrutamiento determinista en pipelines de automatizacion: al no generar texto y devolver siempre una opcion puntuada, encaja como componente de decision acotado en flujos donde la salida libre es indeseable.
- Despliegue en entornos con recursos limitados: con Q4_K_M (0,55 GB) y ejecucion en CPU a ~0,1 s por consulta en Q8_0 con 8 hilos, puede correr en servidores sin GPU o en el borde.
- Validacion de umbrales en produccion: las probabilidades calibradas permiten fijar politicas de negocio (por ejemplo, "revisar manualmente si P(duplicado) > 0,7") sin necesidad de recalibrar el modelo.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de test del benchmark, sin solapamiento de estados entre train y test. La columna "other-workflow swap" evalua cada pregunta contra un estado de otro flujo de trabajo; un delta alto indica que el modelo lee el estado y no solo el vocabulario.

| Flujo de trabajo | Precision | Other-workflow swap | Delta | Supera linea base constante | ECE |
|---|---|---|---|---|---|
| customer_service | 0,830 | 0,413 | +0,417 | +0,240 | 0,048 |
| agent_trace_observability | 0,767 | 0,367 | +0,400 | +0,260 | 0,052 |
| security_incidents | 0,770 | 0,383 | +0,387 | +0,165 | 0,055 |
| invoice_processing | 0,833 | 0,479 | +0,354 | +0,213 | 0,099 |

El autor senala que la calibracion de invoice_processing no alcanza un ECE de 0,05 y que el escalado por temperatura no lo corrige. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no requiere GPU; el modelo esta disenado para CPU. En GPU, el peso en memoria va de 0,55 GB (Q4_K_M) a 1,57 GB (F16), mas el overhead del contexto.
- GPU recomendadas: cualquiera con al menos 2 GB de VRAM para F16; no obstante, el caso de uso previsto es CPU.
- Cabe en GPU consumer: si, en cualquier GPU consumer moderna (RTX 3060, RTX 4090, etc.), aunque el rendimiento en CPU ya es suficiente.
- Opciones de despliegue: llama.cpp (`llama-server`), con soporte de endpoint `/v1/systemone`; el autor no menciona vLLM, TGI ni Ollama.
- Latencia y throughput estimados: aproximadamente 0,1 s por consulta en Q8_0 con 8 hilos en CPU. Requiere `-ub 2048` o superior, ya que la ruta CLEF evalua el prompt completo (estado mas esquema de opciones) en un unico lote.

## Comparativa con modelos similares

No se dispone de comparaciones con modelos de decision calibrada equivalentes en la informacion proporcionada. Como referencia del backbone, el modelo base unsloth/Qwen3.5-0.8B es un LLM generativo de 0,8B parametros, mientras que amaara-decide-business es una especializacion de clasificacion sobre ese backbone.

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| amaara-decide-business-GGUF | 0,8B | no disponible | Decision calibrada (4 flujos) | Apache-2.0 | GGUF |
| unsloth/Qwen3.5-0.8B (base) | 0,8B | no disponible | Generacion de texto | Apache-2.0 | safetensors |
| amaara-decide-vision | no disponible | no disponible | Decision multimodal (hermano) | no disponible | no disponible |

## Limitaciones y advertencias

- Ambito restringido a cuatro flujos de trabajo; el autor advierte explicitamente de que no debe asumirse transferencia a otras formas de decision empresarial.
- Evaluacion pequena: 800 filas pero solo 100 estados unicos por flujo, con un unico conjunto de validacion reservado.
- La calibracion de invoice_processing no alcanza el objetivo (ECE 0,099); es necesario validar los umbrales sobre datos propios.
- Entrenamiento con una sola semilla y una sola longitud de entrenamiento, sin comparacion con LLM de frontera.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero el modelo puede asignar alta probabilidad a opciones incorrectas en estados fuera de distribucion; el delta de other-workflow swap (0,354-0,417) sugiere sensibilidad al estado, pero no garantiza robustez fuera de dominio.
- Solo soporta ingles.
- Licencia Apache-2.0, permisiva para uso comercial; no obstante, el autor no ofrece garantias sobre el rendimiento fuera de los cuatro flujos documentados.
- La generacion de texto devuelve HTTP 501 por diseno; no debe integrarse esperando respuestas en prosa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-decide-business-GGUF
- Repositorio principal (pesos completos, FP8 y cabeza Clef): https://huggingface.co/theatechcorporation/amaara-decide-business
- Modelo hermano de vision: https://huggingface.co/theatechcorporation/amaara-decide-vision
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- Unsloth: https://github.com/unslothai/unsloth
