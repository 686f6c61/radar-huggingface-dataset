# workmagicio/workmagic-jev-decision

## Resumen

workmagic-jev-decision es un modelo de decisión especializado desarrollado por workmagicio, construido como una adaptación LoRA sobre el modelo base Qwen/Qwen3-4B. No es un modelo generativo de propósito general, sino un readout de decisión de una sola pasada forward: está diseñado para responder preguntas cerradas con opciones tipadas (por ejemplo, "low / medium / high") a partir de un estado de conversación. El caso concreto para el que fue entrenado es la predicción de churn (abandono) en canales de Slack dentro de flujos de customer success.

Su interés técnico reside en el método de entrenamiento: se obtiene por autodestilación (self-distillation) desde un "profesor" interno denotado como Decider(level=L0), sin utilizar etiquetas humanas. El modelo destila las respuestas del profesor en un único forward de lectura sobre el formato de prompt AnyJev, apoyándose en la librería `anyjev` para su uso mediante la clase `Tacit`. La pérdida se calcula exclusivamente sobre los tokens de respuesta.

El modelo cuenta con 4.022.468.096 parámetros totales (aproximadamente 4,02 mil millones), licencia Apache 2.0, idioma declarado inglés y pipeline de text-generation. Fue publicado en octubre de 2026 y, en el momento de la consulta, no registra descargas ni interacciones en HuggingFace. Su relevancia radica en explorar el paradigma de "decisiones tácitas tipadas" dentro de modelos pequeños, un enfoque distinto al de los asistentes conversacionales convencionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura del modelo base Qwen3-4B) con adaptacion LoRA |
| Parametros totales | 4.022.468.096 (aprox. 4,02 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible (el repositorio contiene pesos en safetensors; tamano de repo 16,1 GB, compatible con cuantizacion a fp16/int8/int4 mediante herramientas externas) |
| Idiomas soportados | en (ingles) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3-4B, un transformer decoder-only denso, y se adapta mediante LoRA (Low-Rank Adaptation) para convertirlo en un modelo de decisión. No se trata de un modelo de razonamiento abierto, sino de un "readout" que produce una respuesta tipada y una distribución de probabilidad sobre las opciones ofrecidas (`d["answer"]` y `d["probs"]`). La interfaz de uso se articula a través de la librería `anyjev`, con la clase `Tacit` y el método `decide(state, question, options)`.

El entrenamiento se realizó por autodestilación (self-distillation): un profesor interno, denotado como `Decider(level=L0)`, genera las respuestas sobre decisiones de churn en Slack, y estas se destilan en el alumno mediante LoRA. El autor indica explícitamente que el entrenamiento no emplea etiquetas humanas. La pérdida se computa únicamente sobre los tokens correspondientes a la respuesta, siguiendo el formato de prompt de tipo readout de AnyJev. El conjunto de datos asociado es `workmagicio/slack-churn`. No se especifican en la información disponible el número de tokens de entrenamiento, la composición detallada del dataset ni si se aplicaron fases adicionales de RLHF o DPO.

## Capacidades

- Clasificación de decisión tipada: responde preguntas cerradas con un conjunto finito de opciones (por ejemplo, `["low", "medium", "high"]`) y devuelve tanto la opción elegida como la distribución de probabilidad asociada.
- Predicción de churn: estima la probabilidad de abandono de un cliente a partir del estado de una conversación en canales de Slack.
- Lectura de estado conversacional: procesa un estado (state) en formato de conversación como entrada para emitir la decisión.
- Salida calibrada: las métricas declaradas incluyen `accuracy`, `f1` y `expected_calibration_error`, lo que indica que la calibración de las probabilidades es un objetivo de evaluación del modelo.
- Integración con la librería `anyjev`: uso mediante `Tacit.from_pretrained(..., adaptive=False)` y el método `decide`.
- No se declaran capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo de razonamiento extendido (thinking mode) en la información disponible.

## Casos de uso

- Predicción de churn en customer success: el modelo recibe el historial de una conversación de Slack con un cliente y devuelve una etiqueta de riesgo (`low`, `medium`, `high`) junto con probabilidades, permitiendo priorizar cuentas que requieren intervención.
- Enrutado de tickets y alertas: integrado en un pipeline de monitorización de canales de Slack, clasifica cada conversación y dispara alertas al equipo de customer success cuando la probabilidad de churn supera un umbral configurable.
- Triage automático de cuentas en riesgo: agrega las decisiones por cliente para construir una lista ordenada de cuentas en riesgo, alimentando paneles internos de retención.
- Automatización de seguimiento post-interacción: tras cada conversación relevante, el modelo evalúa el estado y decide si debe activarse un flujo de retención, sin necesidad de anotación manual.
- Señal de calibración para modelos de negocio: dado que expone probabilidades y se evalúa con expected calibration error, puede usarse como señal cuantitativa en modelos predictivos de ingresos o renovaciones.
- Investigación sobre decisiones tácitas: sirve como caso de estudio reproducible del paradigma de autodestilación sin etiquetas humanas para tareas de decisión cerrada sobre un modelo pequeño (4 B).
- Base para adaptaciones verticales: al ser un adaptador LoRA sobre Qwen3-4B con licencia Apache 2.0, puede servir de plantilla para construir decididores equivalentes en otros dominios (soporte, ventas, moderación) reutilizando la misma interfaz `anyjev`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara únicamente el uso de las métricas `accuracy`, `f1` y `expected_calibration_error`, pero no incluye cifras concretas ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia (estimaciones en funcion del tamano de 4,02 B y de la cuantizacion):
  - fp32: en torno a 16 GB (coincide con el tamano del repositorio, 16,1 GB).
  - fp16 / bf16: en torno a 8-9 GB.
  - int8: en torno a 4-5 GB.
  - int4: en torno a 2,5-3,5 GB.
- GPU recomendadas: para fp16, tarjetas con 12-16 GB como RTX 4080/4090 o A10G; para fp32, A100 40 GB o H100. Para int4/int8, es viable en GPU de consumo con 6-8 GB de VRAM.
- Cabe en GPU de consumo: si, en formato cuantizado (int4/int8) sobre tarjetas tipo RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, entre otras.
- Opciones de despliegue: la libreria oficial es `anyjev` (clase `Tacit`). Al estar disponible en `safetensors` y derivar de Qwen3-4B, es compatible con stacks genericos como llama.cpp, Ollama, vLLM o TGI, aunque la capa de decision tipada depende de la interfaz `anyjev` (no disponible).
- Latencia y throughput estimados: no disponibles en la informacion proporcionada. Al tratarse de un readout de una sola pasada forward, la latencia esperada es la de una generacion corta sobre un modelo de 4 B, pero no se aportan cifras.

## Comparativa con modelos similares

La comparativa directa es complicada porque workmagic-jev-decision es un modelo de decision especializado y no un asistente conversacional. Se compara a continuacion con alternativas de tamano similar o con funciones afines.

| Modelo | Parametros | Contexto | Proposito | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| workmagic-jev-decision | 4,02 B | no disponible | Decision tipada (churn en Slack) | Sin cifras publicadas | Apache 2.0 | HuggingFace (anyjev) |
| Qwen/Qwen3-4B | 4 B | no disponible | Generacion de texto general | Benchmarks publicos por Qwen | Apache 2.0 | HuggingFace |
| Llama 3.2 3B | 3 B | no disponible | Generacion de texto general | Benchmarks publicos por Meta | Licencia comunitaria Llama | HuggingFace, Ollama |
| Phi-3.5-mini | 3,8 B | no disponible | Generacion de texto general | Benchmarks publicos por Microsoft | MIT | HuggingFace, Ollama |

Las alternativas de la tabla son modelos generalistas; ninguna de ellas ofrece de serie una interfaz de decision tipada con calibracion, que es la funcion especifica de workmagic-jev-decision. No se dispone de datos para comparar rendimiento numerico entre ellos en la tarea de churn.

## Limitaciones y advertencias

- Dominio muy restringido: el modelo fue entrenado especificamente para decisiones de churn en canales de Slack; su uso fuera de ese contexto no esta validado.
- Idioma: solo declara soporte de ingles (`en`). No se garantiza su funcionamiento en castellano ni en otros idiomas.
- Sin etiquetas humanas: al entrenarse por autodestilacion desde un profesor interno, hereda los posibles sesgos y errores sistematicos de ese profesor, sin una validacion humana explicita documentada.
- Riesgo de alucinacion: aunque el formato de decision tipada reduce la generacion libre, las probabilidades pueden estar mal calibradas en distribuciones de datos distintas a las de entrenamiento; el autor declara la metrica expected_calibration_error, pero no publica su valor.
- Sin benchmarks publicados: no hay cifras de accuracy, f1 ni calibracion disponibles, por lo que no es posible estimar el rendimiento real antes de evaluarlo.
- Licencia: Apache 2.0, por lo que permite uso comercial; conviene revisar igualmente las condiciones del modelo base Qwen3-4B y del dataset `workmagicio/slack-churn`.
- Dependencia de libreria: el uso previsto requiere la libreria `anyjev`, cuyo soporte, mantenimiento y documentacion no estan detallados en la informacion disponible.
- Baja adopcion: cero descargas y cero reacciones en HuggingFace en el momento de la consulta, sin comunidad que haya validado el modelo.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/workmagicio/workmagic-jev-decision
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/workmagicio/slack-churn
- Perfil del autor: https://huggingface.co/workmagicio
- Paper, blog o repositorio adicionales: no disponible en la informacion proporcionada.
