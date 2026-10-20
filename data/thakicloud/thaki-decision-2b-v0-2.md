# ThakiCloud/Thaki-Decision-2B-v0.2

## Resumen

Thaki-Decision-2B-v0.2 es un clasificador de acciones (policy action classifier) para agentes de empresa, desarrollado por ThakiCloud. No es un modelo generativo de propósito general: recibe una política de negocio en coreano, una lista opcional de herramientas, los hechos conocidos y la petición del usuario, y devuelve cuál de siete acciones debe tomar el agente a continuación (`ANSWER`, `ASK_CLARIFICATION`, `ASK_CONFIRMATION`, `CALL_TOOL`, `CALL_MULTIPLE_TOOLS`, `ESCALATE`, `REFUSE`). La decisión se obtiene en un único forward pass comparando los logits de las letras `A`–`G` en la última posición, sin generar texto.

El modelo es un fine-tuning con LoRA (r=32, α=64) sobre Qwen/Qwen3.5-2B, con 1.881.825.088 parámetros en el fichero fusionado en bf16 y licencia Apache 2.0. Su relevancia está en el nicho de gobernanza de agentes: actúa como capa de decisión previa a la ejecución de herramientas, de forma que el sistema pueda bloquear ejecuciones indebidas, exigir confirmación explícita o escalar a un humano antes de tocar sistemas reales.

La versión 0.2 añade la evaluación de políticas con condiciones compuestas (AND, OR, NOT, NOT(AND), NOT(OR) y mixtas), en lugar de tratar cualquier mención de restricción como un bloqueo genérico. Está entrenado exclusivamente con datos sintéticos en coreano y su ámbito declarado son políticas de atención al cliente; no se han probado documentos de política reales, otros idiomas ni prompts por encima de unos 1.100 tokens.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder (tag `qwen3_5_text`), fine-tuning LoRA fusionado sobre Qwen/Qwen3.5-2B |
| Parametros totales | 1.881.825.088 (1,88 B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada; el entrenamiento uso max_length 2.048 y no se han probado prompts de mas de ~1.100 tokens |
| Tipos de cuantizacion | No disponible; el repo publica pesos en bf16 (safetensors). No se han publicado versiones GGUF, AWQ ni GPTQ |
| Idiomas soportados | Coreano (ko) unicamente |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 3,8 GB |
| Tipo de tarea | Clasificacion de accion en un unico forward pass (7 clases, A–G); no genera texto |
| Modelo base | Qwen/Qwen3.5-2B (revision `15852e8c`), relacion `finetune` |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3.5-2B (transformer decoder, tag de libreria `qwen3_5_text`), sobre el que se aplica un adaptador LoRA con r=32, α=64, learning rate 1e-4, batch 8 y longitud maxima de 2.048 tokens. La perdida es entropia cruzada sobre la letra del codigo de accion en la ultima posicion, y el adaptador se fusiona posteriormente a bf16. El uso es deliberadamente no generativo: se aplica la plantilla de chat con `enable_thinking=False`, se construye un unico turno de usuario con el contrato de prompt (`prompt_contract.json`, prefijo + politica/herramientas/hechos + mensaje + sufijo) y se comparan los logits de los tokens correspondientes a `A`–`G`.

El entrenamiento de v0.2 continua desde el adaptador de v0.1 durante una epoca sobre 14.558 filas: las 8.078 filas de v0.1 mas 6.480 filas de condiciones compuestas, de las cuales 3.240 son pares contrafactuales en los que un solo hecho invierte la condicion y la etiqueta. Todas las etiquetas de condiciones compuestas se calcularon por duplicado (un evaluador recursivo de tres valores y una enumeracion de hechos desconocidos) y solo se conservaron las coincidentes. Los datos son politicas de atencion al cliente en coreano generadas por plantillas, con etiquetas calculadas por codigo; no se documento el volumen total de tokens ni el uso de RLHF o DPO.

## Capacidades

- Seleccion de una de siete acciones de agente a partir de una politica en lenguaje natural: respuesta directa, peticion de aclaracion, peticion de confirmacion, llamada a una herramienta, llamada a varias herramientas en cadena, escalado a humano y rechazo.
- Evaluacion de condiciones compuestas en la politica: AND, OR, NOT, NOT(AND), NOT(OR) y combinaciones mixtas, incluida la interaccion entre un principio general y una excepcion corporativa.
- Razonamiento sobre hechos conocidos y hechos ausentes: distingue entre "falta un dato" (`ASK_CLARIFICATION`) y "la politica exige confirmacion" (`ASK_CONFIRMATION`).
- Integracion con listas de herramientas opcionales para decidir si la peticion requiere ejecucion o no.
- Salida con distribucion de probabilidad sobre las siete acciones (no calibrada), util para umbrales y monitorizacion.
- Inferencia de un solo paso: sin generacion, sin decodificacion especulativa ni modos de pensamiento.
- No soporta tool calling en el sentido clasico (no escribe argumentos de herramientas), ni vision, ni audio, ni agentes multi-paso por si mismo, ni multilinguismo.

## Casos de uso

- Puerta de seguridad previa a la ejecucion de herramientas: el modelo decide entre `CALL_TOOL`, `ASK_CONFIRMATION` o `REFUSE` antes de que el orquestador invoque una API; el sistema mantiene ademas una comprobacion determinista de permisos y argumentos, ya que el modelo no los genera.
- Atencion al cliente en coreano con politicas de excepcion: dados los hechos del cliente (por ejemplo, marca de cuenta sospechosa y nivel de miembro) y la regla corporativa, resuelve si procede responder, confirmar o rechazar, como muestra el ejemplo de la model card con salida `REFUSE` (p = 0,9999).
- Enrutado a humano en flujos de soporte: cuando la politica marca un caso como transferible, el modelo emite `ESCALATE` y el sistema abre ticket o Deriva a un agente, evitando que el bot improvise una respuesta.
- Cumplimiento y confirmacion explicita en operaciones sensibles: en acciones con impacto economico o de datos personales, `ASK_CONFIRMATION` permite insertar un paso de consentimiento antes de continuar.
- Deteccion de informacion faltante en formularios: `ASK_CLARIFICATION` se usa para solicitar el dato imprescindible (numero de pedido, identificador de cuenta) en lugar de ejecutar con datos incompletos.
- Evaluacion offline de politicas: al ser un clasificador determinista sobre pares (politica, peticion), sirve para regression testing de cambios en el documento de politica antes de desplegarlos.
- Filtrado de peticiones fuera de alcance: `REFUSE` con justificacion derivada de la politica para solicitudes que el agente no debe atender.
- Clasificacion de baja latencia en produccion: al requerir un unico forward pass sobre secuencias cortas, puede colocarse delante de cada turno de un agente sin coste apreciable frente a una llamada generativa.

## Benchmarks y rendimiento

Datos publicados por el autor, medidos sobre el fichero fusionado en bf16. Se define "danger error" como una fila cuya accion correcta es `REFUSE`, `ESCALATE` o `ASK_CONFIRMATION` pero el modelo eligio `CALL_TOOL` o `CALL_MULTIPLE_TOOLS`.

Conjuntos sellados (construidos antes del entrenamiento, nunca usados para entrenar ni ajustar):

| Conjunto | n | Exactitud | Macro-F1 | Danger errors |
|---|---|---|---|---|
| Politicas con condiciones compuestas, dominios y plantillas no vistos | 600 | 0,965 | 0,953 | 10 de 294 |
| Escenarios de producto escritos a mano (facturacion SaaS, logistica, reserva de clinica, plataforma de datos) | 12 | 11/12 | No disponible | 0 |

Conjuntos de regresion (datos de desarrollo o test ya abiertos durante el desarrollo; no independientes):

| Conjunto | n | Exactitud | Danger errors |
|---|---|---|---|
| dev_instance | 991 | 0,993 | 0 |
| dev_composition | 354 | 0,997 | 0 |
| test_instance | 911 | 0,988 | 1 |
| test_composition (21 filas proximas a los datos de entrenamiento eliminadas) | 353 | 0,870 | 0 |
| test_operator (AND/OR/NOT; v0.1 obtenia 0,534) | 118 | 1,000 | 0 |
| Blind-A dev | 300 | 0,923 | 2 |
| Escenarios de producto, primer lote | 20 | 20/20 | 0 |

No se han publicado resultados en benchmarks estandar tipo MMLU, HumanEval o GSM8K; el modelo es un clasificador de acciones y no un modelo de conocimientos generales.

## Requisitos de hardware

- Peso del fichero publicado: 3,8 GB en safetensors bf16 (1,88 B de parametros). VRAM estimada para inferencia en bf16: en torno a 4-5 GB incluyendo activaciones y cache de una secuencia corta.
- En cuantizacion de 8 bits la huella estimada baja a ~2 GB, y en 4 bits a ~1,2-1,5 GB, aunque el autor no publica variantes cuantizadas: habria que generarlas a partir del fichero bf16.
- Cabe holgadamente en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090, e incluso en tarjetas de 6-8 GB si se cuantiza.
- En centro de datos: A100, H100, L40S o L4 son suficientes; el modelo es pequeno y no requiere tensor parallelism.
- Despliegue: `transformers` con `AutoModelForCausalLM` (procedimiento documentado, `dtype=torch.bfloat16`, `device_map="cuda"`), servidores compatibles con endpoints de Hugging Face (tag `endpoints_compatible`) y, en general, cualquier runtime que exponga logits por token (vLLM o TGI para servir los logits de las letras). No hay versiones GGUF publicadas, por lo que llama.cpp u Ollama requeririan conversion propia.
- Latencia y throughput: no publicados. Al tratarse de un unico forward pass sobre secuencias de menos de ~1.100 tokens, la latencia esperada por decision es muy inferior a la de un modelo generativo del mismo tamano (estimacion, no medida publicada).

## Comparativa con modelos similares

No se dispone de datos de otros clasificadores de accion para agentes en la informacion proporcionada, por lo que la comparacion se limita al modelo base del que deriva.

| Modelo | Parametros | Contexto | Tarea | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| Thaki-Decision-2B-v0.2 | 1,88 B | No disponible (entrenado a 2.048; probado hasta ~1.100) | Clasificador de 7 acciones, salida en un forward pass | Apache 2.0 | 0,965 de exactitud en conjunto sellado de 600 filas |
| Qwen/Qwen3.5-2B (base) | ~2 B (no confirmado en la informacion) | No disponible en la informacion | Generacion de texto general | No disponible en la informacion | No aplica: no es un clasificador de acciones |
| Alternativas de clasificacion de acciones para agentes | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Sobre-rechazo en un patron de politica concreto: en test_composition v0.2 empeora respecto a v0.1 (0,870 frente a 0,921). La mayor parte de la caida se concentra en una celda donde un principio general interactua con una politica de empresa: rechaza 20 filas que deberian ejecutarse o confirmarse. Estos errores bloquean, no ejecutan.
- Cadenas de herramientas: `CALL_MULTIPLE_TOOLS` se responde a menudo con un unico `CALL_TOOL` (29 de 55 en test_composition y un fallo en los escenarios de producto).
- Errores peligrosos residuales: 10 en el conjunto sellado de condiciones compuestas, 1 en test_instance y 2 en Blind-A dev. El modelo reduce ejecuciones erroneas, no las elimina.
- Solo coreano sintetico: los datos son politicas de atencion al cliente generadas por plantillas con etiquetas calculadas por codigo. No se han probado documentos de politica reales, otros idiomas ni prompts de mas de ~1.100 tokens.
- No es un router de modelos, no es un motor de ejecucion de politicas y no escribe argumentos de herramienta. Ante `CALL_TOOL` o `CALL_MULTIPLE_TOOLS`, la capa de ejecucion debe verificar permisos, argumentos y politica por su cuenta.
- Las probabilidades cubren solo las siete letras y no estan calibradas; no deben usarse como medida de confianza absoluta sin calibracion previa.
- Los conjuntos de regresion no son independientes (se abrieron durante el desarrollo), por lo que las cifras de dev/test estan optimistas frente a datos reales.
- La model card proporcionada esta truncada en la seccion de entrenamiento ("kept only whe"), por lo que pueden faltar detalles del proceso de filtrado de etiquetas.
- Licencia Apache 2.0: permite uso comercial, pero no exime de las obligaciones de la licencia del modelo base Qwen/Qwen3.5-2B, cuyos terminos no se detallan en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ThakiCloud/Thaki-Decision-2B-v0.2
- Model card en coreano: https://huggingface.co/ThakiCloud/Thaki-Decision-2B-v0.2/blob/main/MODEL_CARD.ko.md
- Contrato de prompt (`prompt_contract.json`): https://huggingface.co/ThakiCloud/Thaki-Decision-2B-v0.2/blob/main/prompt_contract.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Paper, blog o demo del autor: no disponibles en la informacion proporcionada.
