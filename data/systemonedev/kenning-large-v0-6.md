# systemonedev/kenning-large-v0.6

## Resumen

Kenning-large-v0.6 es un modelo de decisión de tipo "System One" desarrollado por systemonedev. No es un modelo generativo: dado un estado de programa (por ejemplo, el contenido de un ticket o un registro estructurado) y una serie de preguntas tipadas (`noul` de sí/no, `choice` de elección múltiple y `score` de puntuación), devuelve respuestas tipadas con probabilidades calibradas en una sola pasada forward. El modelo se apoya en `tasksource/ModernBERT-large-nli` como base y se ha afinado como cross-encoder.

Con 395.834.371 parámetros, Kenning-large-v0.6 está pensado para integrarse en flujos de decisión dentro de aplicaciones: clasificación zero-shot, enrutado de tickets, validación de registros estructurados o detección de inyección de prompts, entre otros. La relevancia de la propuesta está en su enfoque de calibración explícita (temperaturas por tipo de pregunta ajustadas con datos reservados) y en su formato de comunicación compatible con la API System One de TypeSafe AI.

La ventana efectiva es de 2048 tokens por par (estado, respuesta), lo que acota los casos de uso a decisiones sobre contextos relativamente compactos. La licencia Apache-2.0 permite uso comercial siempre que se conserve el fichero NOTICE.md con las licencias de las fuentes de entrenamiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Cross-encoder sobre encoder transformer (base ModernBERT-large-nli) |
| Parametros totales | 395.834.371 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 2048 tokens maximos por par (estado, respuesta) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un cross-encoder derivado de `tasksource/ModernBERT-large-nli`. Para cada par (estado, respuesta candidata) se calcula una puntuacion conjunta y, a partir de ellas, se obtiene la distribucion de cada pregunta mediante `softmax(scores / T)`, con temperaturas ajustadas por tipo sobre datos reservados: `{"choice": 1.8221, "score": 1.7333, "noul": 1.8221}`. No genera texto en ningun caso; su salida es una distribucion de probabilidad asociada a una pregunta tipada.

El entrenamiento combina datos publicos de NLI y clasificacion (`nyu-mll/multi_nli` con 8000 filas, `clinc/clinc_oos` con 3000, `fancyzhx/amazon_polarity` con 2000, `google/civil_comments` con 2000, `nvidia/HelpSteer2` con 3000, `jackhhao/jailbreak-classification` con 1000, `deepset/prompt-injections` con 500 y `allenai/ropes` con 3000), datos estructurados generados por reglas con etiquetas exactas (`kenning/structured.py`, en dominios como gastos, envios, inventario, prestamos, suscripciones, trazas de agente o logs de despliegue, con 800 filas por dominio) y datos sinteticos escritos por `Qwen/Qwen2.5-7B-Instruct` (1985 + 2793 filas). La contribucion tecnica principal es la calibracion explícita de la temperatura por tipo de pregunta, que reduce el error de calibracion medido como ECE.

## Capacidades

- Decision binaria tipada: responde preguntas de tipo `noul` (si/no) sobre un estado dado.
- Eleccion multiple: resuelve preguntas `choice` devolviendo una distribucion sobre las opciones.
- Puntuacion en escala: emite respuestas `score` con probabilidad calibrada.
- Clasificacion zero-shot sobre texto y sobre estados estructurados (registros de gastos, envios, inventario, prestamos, suscripciones, tablas, etc.).
- Deteccion de prompt injection y de jailbreak en entradas de usuario, a partir de los conjuntos `deepset/prompt-injections` y `jackhhao/jailbreak-classification`.
- Analisis de trazas de agente y llamadas a herramienta (datos estructurados de `agent_trace` y `tool_call`).
- Analisis de logs de acceso y de despliegue.
- No genera texto libre.
- No se documentan capacidades multilingues, de vision ni de audio.
- No se documenta soporte de tool calling generativo; el "tool calling" aparece como dominio de entrenamiento (deteccion y evaluacion), no como capacidad de invocacion.

## Casos de uso

- Enrutado de tickets de soporte: a partir del texto de un ticket, el modelo responde preguntas tipadas como "¿es un problema de facturacion?" o "¿requiere accion humana?", con probabilidad calibrada que permite fijar umbrales de derivacion automatica.
- Clasificacion zero-shot de textos: al no requerir ejemplos etiquetados por etiqueta, se puede desplegar sobre categorias nuevas definidas como preguntas `choice` sobre el estado.
- Validacion de registros estructurados: los dominios `expense`, `shipping`, `loan`, `subscription` o `inventory` del set de entrenamiento permiten comprobar si un registro cumple reglas definidas como preguntas de si/no.
- Filtrado de seguridad en aplicaciones de usuario: deteccion de prompt injection y de intentos de jailbreak antes de que las entradas lleguen a un LLM generativo.
- Evaluacion de trazas de agente: comprobar si una secuencia de acciones (agent_trace) cumple condiciones tipadas dentro de un pipeline de evaluacion automatizada.
- Analisis de logs: clasificacion de eventos de acceso o de despliegue segun criterios operativos definidos como preguntas binarias o de eleccion.
- Moderacion de comentarios: uso de `google/civil_comments` como dominio de entrenamiento para decidir si un comentario cumple una politica concreta.
- Backend de decisiones en tiempo real: al ser una sola pasada forward sobre 2048 tokens y no generar texto, encaja en servicios con requisitos de latencia baja.

## Benchmarks y rendimiento

El autor publica resultados sobre una particion reservada del propio pool de entrenamiento (in-distribution):

| Configuracion | Accuracy | Brier | ECE |
|---|---|---|---|
| Zero-shot (antes de entrenar) | 0.578 | 0.607 | 0.220 |
| Entrenado | 0.905 | 0.141 | 0.040 |
| Entrenado + calibrado | 0.905 | 0.133 | 0.006 |

No se han publicado resultados de benchmarks externos (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los numeros anteriores son in-distribution y el propio autor recomienda recalibrar sobre datos propios antes de automatizar decisiones.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 0,8 GB solo para pesos (395,8 M de parametros); con activaciones y overhead de runtime, del orden de 1,5-3 GB segun batch y longitud.
- Inferencia en CPU: viable para cargas moderadas, dado el tamano del modelo y que solo requiere una pasada forward por par (estado, respuesta).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4070, RTX 4090) es suficiente para servir el modelo con margen amplio. GPU de datacenter (A100, H100, L40S) aportan throughput, no son necesarias por VRAM.
- Cabe sobradamente en GPU consumer y tambien en GPUs de gama baja con 4-6 GB de VRAM.
- Opciones de despliegue: `systemone-client[local]` para uso en proceso (`Kenning.from_pretrained(...)`, ejecutable en CPU o GPU) o el servicio `kenning` de SystemOne Builder exponiendo `POST /v1/systemone`.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Base | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| kenning-large-v0.6 | ModernBERT-large-nli | 395,8 M | 2048 tokens por par | Apache-2.0 | Version actual, resultados held-out 0.905 acc / 0.006 ECE |
| kenning-large-v0.4 | DeBERTa-v2 | no disponible | no disponible | Apache-2.0 | Version anterior del mismo autor, base distinta |
| kenning-xl-v0.6 | no disponible | no disponible | no disponible | Apache-2.0 (por tag) | Variante XL del mismo autor, sin datos publicos de specs en la informacion disponible |

No se dispone de comparativas publicadas frente a cross-encoders de NLI genericos (por ejemplo, modelos basados en DeBERTa o ModernBERT con cabeza de clasificacion) dentro de la informacion proporcionada.

## Limitaciones y advertencias

- La calibracion se ha ajustado sobre la distribucion de entrenamiento; las probabilidades sobre datos distintos deben tratarse como puntuaciones hasta recalibrar sobre unos cientos de ejemplos etiquetados del dominio propio.
- La aritmetica, las fechas y los estados largos o contradictorios degradan la precision segun el propio autor.
- Determinismo limitado a hardware y versiones de libreria: la misma peticion puede dar respuestas distintas entre GPUs o versiones.
- No se documentan idiomas soportados; la composicion del dataset (mayoritariamente en ingles) sugiere un rendimiento inferior en castellano.
- No genera texto: no sirve como sustituto de un LLM generativo, solo como componente de decision.
- La licencia de los pesos es Apache-2.0, pero algunas fuentes de entrenamiento son share-alike (CC-BY-SA-3.0); es obligatorio conservar NOTICE.md junto con los pesos para cumplir con las atribuciones.
- Implementa un formato de comunicacion compatible con la API System One de TypeSafe AI, pero no esta afiliado ni respaldado por TypeSafe AI, y no se entreno con salidas de TypeSafe.
- Riesgo de alucinacion: no aplica en el sentido generativo (no produce texto libre), pero si puede asignar alta probabilidad a respuestas incorrectas cuando el estado de entrada queda fuera de la distribucion de entrenamiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/systemonedev/kenning-large-v0.6
- Modelo base: https://huggingface.co/tasksource/ModernBERT-large-nli
- Variante XL: https://huggingface.co/systemonedev/kenning-xl-v0.6
- Version previa large-v0.4: https://huggingface.co/systemonedev/kenning-large-v0.4
- Organizacion en GitHub: https://github.com/systemonedev
- SystemOne Builder: https://github.com/systemonedev/systemone-builder
- Hub de la comunidad: https://github.com/systemonedev/systemone.dev
