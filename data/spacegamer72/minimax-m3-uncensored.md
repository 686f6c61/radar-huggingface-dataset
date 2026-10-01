# SpaceGamer72/MiniMax-M3-uncensored

## Resumen

MiniMax-M3-uncensored es una version afinada del modelo MiniMaxAI/MiniMax-M3, un transformer multimodal de tipo Mixture-of-Experts (MoE) con 427.040.140.160 parametros totales y aproximadamente 23.000 millones de parametros activos por token segun la model card. El autor del ajuste que figura en la model card es Robert Ressl (cuenta `ressl`), aunque el repositorio consultado se publica bajo el identificador `SpaceGamer72/MiniMax-M3-uncensored`; las referencias internas del README apuntan a `ressl/MiniMax-M3-uncensored`, una discrepancia que conviene verificar antes de usarlo en produccion.

El objetivo del ajuste es eliminar los rechazos duros del modelo base mediante una tecnica de abliteration aplicada directamente sobre los pesos: se modifican las proyecciones `o_proj` de atencion y todas las `down_proj` que escriben en el residual (experto denso, experto compartido y los 128 expertos enrutados de cada capa MoE), en las 60 capas del modelo. La model card declara 0 rechazos duros sobre 16 prompts de `mlabonne/harmful_behaviors`, manteniendo coherencia multimodal, razonamiento y enrutado MoE.

Es relevante porque combina tres caracteristicas poco frecuentes a la vez: escala de 428B con 23B activos, contexto declarado de 1M de tokens y capacidad multimodal image-text-to-text. El repositorio ocupa 854,2 GB (la model card indica 796 GB en BF16 repartidos en 59 shards), por lo que su despliegue exige infraestructura multi-GPU o una cuantizacion NVFP4 de aproximadamente 230 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (tag `minimax_m3_vl`, `custom_code`), transformer con 60 capas y 128 expertos enrutados por capa MoE |
| Parametros totales | 427.040.140.160 (dato real de safetensors); la model card cita 428B |
| Parametros activos | 23B (segun model card) |
| Longitud de contexto | 1M tokens (segun model card del modelo base) |
| Tipos de cuantizacion | BF16 en este repositorio; la model card indica que la abliteration sobrevive a la cuantizacion y menciona NVFP4 (NVIDIA ModelOpt) y GGUF como builds downstream viables, no publicadas aqui |
| Idiomas soportados | en (ingles) en la etiqueta del repositorio; no disponible informacion sobre el resto de idiomas |
| Licencia | other (heredada del modelo base MiniMaxAI/MiniMax-M3) |
| Formato de pesos | safetensors, BF16, 59 shards, `custom_code` (requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

El modelo base es un MoE multimodal de MiniMaxAI: 428B parametros totales, 23B activos, vision-lenguaje (pipeline `image-text-to-text`) y una ventana de contexto declarada de 1M tokens. Incluye un modo de razonamiento explicito delimitado por `<mm:think>`, que viene activado por defecto; el modelo delibera antes de responder y, en la version sin censurar, ese razonamiento se orienta a como cumplir la peticion en lugar de a si debe rechazarla. La configuracion de inferencia requiere vLLM reciente con soporte M3 (`--tool-call-parser minimax_m3 --reasoning-parser minimax_m3`).

No hay informacion en el material proporcionado sobre el volumen de tokens de entrenamiento, la composicion del dataset ni sobre si el modelo base empleo RLHF, DPO u otras fases de alineamiento. Lo unico documentado del proceso de ajuste es la intervencion de pesos: se modifican `o_proj` de atencion y todas las `down_proj` que escriben en el stream residual (experto denso, experto compartido y los 128 expertos enrutados por capa), en las 60 capas. El autor afirma que la coherencia se preserva y que la propiedad de abliteration persiste tras cuantizar, lo que implica que los builds NVFP4 o GGUF derivados mantienen el comportamiento.

## Capacidades

- Generacion de texto conversacional en ingles (`pipeline_tag: text-generation`, tarea `conversational`).
- Entrada multimodal imagen-texto (`image-text-to-text`, arquitectura `minimax_m3_vl`), con preservacion de la coherencia vision-lenguaje tras la abliteration segun la model card.
- Modo de razonamiento explicito mediante la etiqueta `<mm:think>`, activado por defecto; se puede desactivar en el cliente para obtener respuestas directas.
- Soporte de tool calling y function calling a traves del parser `minimax_m3` de vLLM.
- Razonamiento multi-paso y uso en agentes, derivado del modo de razonamiento y de la ventana de contexto de 1M tokens declarada.
- Cumplimiento sin rechazos duros en peticiones que el modelo base rechazaria o deliberaria: 0/16 rechazos duros en `mlabonne/harmful_behaviors`.
- Capacidades multilingues: solo se declara ingles; no disponible informacion sobre otros idiomas.

## Casos de uso

- Red teaming de modelos y sistemas: permite generar intentos de ataque, jailbreaks y prompts adversarios sin que el modelo interrumpa la tarea, util para evaluar las defensas de otros asistentes en un entorno controlado.
- Analisis de malware: se le pueden pasar fragmentos de codigo malicioso (ofuscado o en crudo) y pedir explicaciones del flujo de ejecucion, tecnicas de persistencia o indicadores de compromiso, algo que un modelo alineado suele rechazar.
- Escritura de reglas de deteccion (YARA, Sigma, Snort): dada una muestra o una descripcion de comportamiento, el modelo puede redactar reglas y refinarlas iterativamente dentro de la misma conversacion, aprovechando el contexto largo.
- Revision de vulnerabilidades y desarrollo de exploits en programas de bug bounty: analisis de codigo fuente para identificar patrones inseguros y redaccion de pruebas de concepto, con la advertencia de que el uso debe ser autorizado y legal.
- Asistencia en pruebas de penetracion: generacion de comandos, cadenas de explotacion y notas de informe en una sesion unica, sin cortes por politicas de rechazo, con el modelo actuando como copiloto tecnico.
- Analisis de documentacion tecnica extensa con vision: al aceptar imagen y texto con 1M de tokens de contexto, permite procesar capturas de paneles, diagramas de red o esquemas junto con documentos largos en un mismo prompt.
- Agentes automatizados de seguridad: con tool calling via vLLM, se puede orquestar un agente que consulte APIs de escaneo, parse resultados y redacte el informe final en varios pasos.

## Benchmarks y rendimiento

El material proporcionado solo incluye una medicion de rechazos, no benchmarks de capacidades (MMLU, HumanEval, GSM8K ni equivalentes).

| Conjunto de prompts | Prompts | Rechazos duros |
|---|---:|---:|
| mlabonne/harmful_behaviors | 16 | 0/16 (0,0 %) |

La propia model card advierte que se trata de una muestra reducida de prompts daninos y que no constituye un benchmark completo de capacidades. No se han publicado resultados de benchmarks de conocimiento, codigo o matematicas en la informacion disponible.

## Requisitos de hardware

- Inferencia en BF16: 796 GB de pesos segun la model card (el repositorio ocupa 854,2 GB), lo que exige agregacion multi-GPU. No cabe en ninguna GPU de consumo ni en una sola GPU profesional actual.
- Configuracion de referencia del autor: vLLM con `--tensor-parallel-size 8`, lo que implica al menos 8 GPUs con VRAM suficiente; por ejemplo 8 x H200 (141 GB) o 8 x B200 (192 GB). Ocho H100 de 80 GB (640 GB) no bastan para los pesos en BF16.
- Cuantizacion NVFP4: el autor indica que reduce el modelo a aproximadamente 230 GB y permite ejecutarlo en un solo nodo Blackwell. Requiere generar el quant con la receta de NVIDIA ModelOpt sobre este checkpoint.
- Soporte especifico para RTX PRO 6000 / Blackwell: el autor enlaza el repositorio `0xSero/minimax-m3-sm120` para SM120.
- GPU de consumo: no viable. Ni siquiera la variante NVFP4 de 230 GB cabe en una RTX 4090 (24 GB) o similar.
- Opciones de despliegue: transformers con `AutoModelForImageTextToText` (requiere `trust_remote_code` y `device_map="auto"`), vLLM con soporte M3 y parsers `minimax_m3`. La model card menciona builds GGUF derivados como posibles, pero no publica ninguno en este repositorio. No se mencionan Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| SpaceGamer72/MiniMax-M3-uncensored | 427B (dato real) / 428B (card) | 23B | 1M | Texto + imagen | other | BF16, 59 shards, 854,2 GB de repo |
| MiniMaxAI/MiniMax-M3 (base) | 428B | 23B | 1M | Texto + imagen | other | Modelo original, sin abliteration |
| nvidia/MiniMax-M3-NVFP4 | No disponible en la informacion proporcionada | No disponible | No disponible | No disponible | No disponible | Cuantizacion NVFP4, ~230 GB |

No se dispone de datos de rendimiento comparativos entre estas variantes en la informacion proporcionada, mas alla de la medicion de rechazos (0/16 en la version uncensored frente a deliberacion o rechazo en el base).

## Limitaciones y advertencias

- La validacion de ausencia de censura se basa en 16 prompts de un unico conjunto; no es una evaluacion exhaustiva ni permite extrapolar a otras categorias de contenido danino.
- La abliteration modifica pesos de atencion y de las proyecciones residuales, lo que puede degradar sutilmente la calidad en tareas no medidas: la model card solo afirma que la coherencia se mantiene, sin benchmarks que lo cuantifiquen.
- El modo de razonamiento esta activado por defecto; en clientes que no lo desactiven, las respuestas incluyen deliberacion previa y aumentan la latencia y el consumo de tokens.
- Idioma: solo se declara ingles. No hay informacion sobre calidad en castellano u otros idiomas.
- Licencia `other` heredada del modelo base: es imprescindible revisar los terminos de MiniMaxAI/MiniMax-M3 antes de cualquier uso comercial, ya que la informacion disponible no detalla las restricciones concretas.
- Riesgo legal y de responsabilidad: el modelo cumplira peticiones que un modelo alineado rechaza. El uso en hacking etico, investigacion de seguridad y pentesting debe contar con autorizacion explicita; el usuario es responsable de las consecuencias.
- Riesgo de alucinacion: no disponible informacion especifica. Al ser un modelo de gran escala con modo de razonamiento, se aplican las precauciones habituales de verificacion en dominios facticos.
- El repositorio tiene 0 descargas y 0 likes, y la discrepancia entre el ID del repositorio (`SpaceGamer72`) y las referencias internas del README (`ressl`) no esta aclarada en el material; conviene validar la procedencia y la integridad de los pesos antes de desplegarlos.
- No hay datos publicados de latencia, throughput ni consumo energetico, lo que dificulta dimensionar un despliegue en produccion.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/SpaceGamer72/MiniMax-M3-uncensored
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-M3
- Cuantizacion NVFP4 de referencia: https://huggingface.co/nvidia/MiniMax-M3-NVFP4
- Soporte Blackwell / SM120 para vLLM: https://github.com/0xSero/minimax-m3-sm120
- Conjunto de prompts de evaluacion: mlabonne/harmful_behaviors
- Perfil del autor del ajuste: https://huggingface.co/ressl
- Web del autor: https://ressl.ch/
- LinkedIn del autor: https://www.linkedin.com/in/robertressl/
- Patreon del autor: https://www.patreon.com/cw/ressl
