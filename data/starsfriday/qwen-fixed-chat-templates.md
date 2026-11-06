# starsfriday/Qwen-Fixed-Chat-Templates

## Resumen

Qwen-Fixed-Chat-Templates, publicado por el usuario starsfriday en Hugging Face, no es un modelo de lenguaje en sí, sino una plantilla de chat Jinja universal ("drop-in") diseñada para corregir los errores de las plantillas oficiales de las familias Qwen 3.5, 3.6 y 3.8, incluida la variante Qwen3.8-Flash-Next. El proyecto resuelve un problema real y recurrente en el ecosistema Qwen: las plantillas oficiales presentan fallos de renderizado, invalidación de la caché KV, desperdicio de tokens, "empty think poisoning" (bloques de razonamiento vacíos que contaminan el historial) y bloqueos fatales en flujos agénticos con llamadas a herramientas.

La relevancia de esta ficha radica en que la plantilla es un componente crítico de inferencia: un chat template defectuoso puede degradar la calidad de las respuestas de cualquier modelo Qwen, romper el tool calling o provocar timeouts por contenido vacío. La versión v22.5 añade soporte completo para Qwen 3.8, incluyendo la arquitectura MoE Qwen3.8-2.4T-A95B y el modelo denso Qwen3.8-27B, con control de profundidad de razonamiento (reasoning effort) y compatibilidad con los alias de clientes como OpenAI, Claude Code, Cursor y Cline. Funciona con cualquier motor que soporte plantillas Jinja de Hugging Face: LM Studio, llama.cpp, vLLM, SGLang, MLX, KoboldCPP y otros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplicable (plantilla Jinja de chat, no es un modelo) |
| Parametros totales | No aplicable |
| Parametros activos | No aplicable |
| Longitud de contexto | No disponible (depende del modelo Qwen al que se aplique) |
| Tipos de cuantizacion | No aplicable |
| Idiomas soportados | No disponible (depende del modelo subyacente) |
| Licencia | Apache-2.0 |
| Formato de pesos | No aplicable (archivo unico `chat_template.jinja`) |

Datos adicionales:

| Parametro | Valor |
|---|---|
| Version | v22.5 |
| Modelos compatibles | Qwen 3.5, 3.6, 3.8 y 3.8 Flash-Next (incluye Qwen3.8-2.4T-A95B y Qwen3.8-27B) |
| Motores compatibles | LM Studio, llama.cpp, vLLM, SGLang, MLX, oMLX, KoboldCPP, cualquier motor con Jinja de HF |
| Descargas / Likes | 0 descargas / 1 like (en el momento de la ficha) |

## Arquitectura y entrenamiento

Al no tratarse de un modelo, no hay arquitectura de red neuronal ni proceso de entrenamiento que describir. El artefacto es un unico archivo `chat_template.jinja` que implementa la logica de renderizado de conversaciones: gestion de mensajes de sistema y desarrollador, extraccion de bloques de razonamiento, formato de llamadas a herramientas y steering de la profundidad de razonamiento.

Las innovaciones tecnicas destacables de la v22.5 son:

- **Baseline de razonamiento por defecto en `medium`**: la plantilla oficial de Qwen 3.8 fuerza `xhigh` por defecto, agotando el presupuesto de tokens en razonamiento antes de responder. Esta plantilla no inyecta tokens adicionales por defecto, preservando la paridad de la caché KV con la v21 y evitando timeouts por contenido vacio.
- **Modo sin razonamiento restaurado**: la plantilla oficial de Qwen3.8-2.4T-A95B lanza una excepcion fatal si `enable_thinking=false`; esta plantilla lo soporta via kwargs (`enable_thinking=false`, `reasoning_effort="none"`) o mediante la etiqueta en linea `<|think_off|>`.
- **Extraccion de razonamiento del historial**: soporta formatos OpenAI (`reasoning_content`), Anthropic (`thinking`) y etiquetas en contenido (`<think>`), sin duplicar etiquetas.
- **Formato canonico XML para argumentos de herramientas**: maneja de forma segura argumentos JSON serializados procedentes de clientes OpenAI estandar, evitando errores de sintaxis e invalidacion de la caché KV.
- **Fusion de mensajes de sistema consecutivos**: agrupa multiples mensajes `system`/`developer` iniciales en un unico turno.
- **Steering en linea**: etiquetas `<|think_low|>`, `<|think_medium|>`, `<|think_xhigh|>`, `<|think_ultracode|>` y `<|think_off|>` que se eliminan antes de la inferencia y persisten entre turnos hasta que otra etiqueta las sustituye.

## Capacidades

- Correccion de renderizado de plantillas de chat para todas las tallas de Qwen 3.5, 3.6 y 3.8 con un unico archivo.
- Control de profundidad de razonamiento (reasoning effort) con valores `low`, `medium`, `xhigh`, `ultracode` y desactivado.
- Mapeo automatico de alias de clientes: `high`, `max`, `ultracode`, `extreme` → `xhigh`; `minimal` → `low`; `none`/`off` → desactivado.
- Tool calling robusto con formato XML canonico y manejo universal de argumentos (JSON serializado incluido).
- Recuperacion de errores de herramientas en dos niveles, con desambiguacion inteligente para evitar falsas alarmas en resultados de busqueda que contienen codigo como `throw new Error(...)`.
- Soporte nativo del flag `--reasoning-preserve` de llama.cpp para retencion del 100% de la caché KV de prefijo.
- Herramienta de diagnostico `scripts/check_applied.py` para inspeccionar directorios de modelos y GGUF y verificar la version de plantilla activa.
- Extraccion de bloques `<think>` al campo `reasoning_content` en llama.cpp con `--reasoning-format deepseek`.

## Casos de uso

- **Agentes de codigo locales**: al conectar OpenCode, Claude Code o Pi.dev a `llama-server`, el flag `--reasoning-format deepseek` extrae los bloques `<think>` al campo `reasoning_content`, evitando que los tokens de razonamiento contaminen el flujo de texto e interrumpan las llamadas a herramientas a mitad de ejecucion.
- **Despliegue agéntico con vLLM en produccion**: sustituyendo la plantilla del `tokenizer_config.json` y usando `--reasoning-parser qwen3 --tool-call-parser qwen3_xml`, se obtienen respuestas estructuradas con razonamiento separado y tool calls XML parseados de forma fiable.
- **Uso en LM Studio sin tocar el modelo**: el usuario pega la plantilla en el panel "Prompt Template" y corrige los errores de la plantilla oficial sin necesidad de re-descargar pesos ni modificar GGUF.
- **Flujos con herramientas multiples y historial largo**: la extraccion correcta del razonamiento del historial evita la duplicacion de bloques `<think>` y la invalidacion de la caché KV, reduciendo latencia en conversaciones multi-turno con tool calls.
- **Control fino del presupuesto de razonamiento**: mediante etiquetas en linea (`<|think_low|>`, `<|think_xhigh|>`) se ajusta la profundidad de razonamiento por turno, util para equilibrar coste y calidad en servicios con muchos usuarios.
- **Integraciones con clientes de terceros**: el mapeo automatico de alias (`max`, `ultracode`, `minimal`...) permite que clientes como Cursor o Cline controlen el razonamiento sin modificaciones.
- **Auditoria de despliegues**: `scripts/check_applied.py` permite verificar que version de plantilla esta activa en un directorio de modelo o dentro de un GGUF, util en pipelines de despliegue y CI/CD.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Al ser una plantilla de chat y no un modelo, los benchmarks aplicables serian los de los modelos Qwen subyacentes (Qwen3.8-2.4T-A95B, Qwen3.8-27B, etc.), cuyos datos no constan en la model card. El propio README reporta mejoras cualitativas (prevencion de timeouts por contenido vacio, retencion de caché KV) pero sin metricas cuantitativas.

## Requisitos de hardware

- No aplica requisitos propios de hardware: la plantilla es un archivo de texto sin coste computacional directo.
- Los requisitos de VRAM dependen exclusivamente del modelo Qwen al que se aplique (por ejemplo, un modelo MoE de 2,4 billones de parametros con 95 mil millones activos exigiria hardware de centro de datos, mientras que variantes densas pequenas pueden ejecutarse en GPU de consumo). No hay datos concretos por modelo en la informacion disponible.
- Despliegue con llama.cpp: `llama-server -m your_model.gguf --jinja --chat-template-file chat_template.jinja --reasoning-format deepseek` (opcionalmente `--reasoning-preserve` en builds recientes).
- Despliegue con vLLM: `vllm serve Qwen/Qwen3.8-2.4T-A95B --reasoning-parser qwen3 --tool-call-parser qwen3_xml` (o `qwen3_coder` en builds antiguos, `hermes` si se fuerza `tool_call_format="json"`).
- Despliegue con SGLang: `python3 -m sglang.launch_server --model-path Qwen/Qwen3.8-27B --chat-template chat_template.jinja`. Es imprescindible pasar `--chat-template` porque SGLang 0.5.x ignora el archivo local `chat_template.jinja` del directorio del modelo.
- En vLLM, para desactivar el razonamiento hay que pasar `"enable_thinking": false` en los parametros de la peticion: el parser no inspecciona las etiquetas dinamicas `<|think_off|>` dentro del prompt.

## Comparativa con modelos similares

Al no ser un modelo, la comparacion pertinente es con la plantilla oficial de Qwen 3.8:

| Aspecto | Plantilla oficial Qwen 3.8 | Qwen-Fixed-Chat-Templates v22.5 |
|---|---|---|
| Baseline de razonamiento | `xhigh` forzado (agota presupuesto de tokens) | `medium` sin tokens inyectados |
| Modo sin razonamiento (2.4T-A95B) | Excepcion fatal con `enable_thinking=false` | Soportado via kwargs o `<|think_off|>` |
| Extraccion de razonamiento del historial | Prepende bloques `<think></think>` vacios | Extraccion multi-formato sin duplicacion |
| Argumentos de herramientas JSON | Fallo con clientes OpenAI estandar | Manejo universal sin crashes |
| Alias de clientes | Rechaza nombres no estandar | Mapeo automatico (OpenAI, Claude Code, Cursor, Cline) |
| Etiquetas en linea | No soportadas | `<|think_low|>` a `<|think_off|>` |
| Fusion de mensajes de sistema | No | Si (system + developer consecutivos) |
| Recuperacion de errores de herramientas | No o falsas alarmas | Recuperacion en dos niveles con desambiguacion |
| Licencia | No disponible en la informacion proporcionada | Apache-2.0 |

## Limitaciones y advertencias

- No es un modelo: no genera texto por si mismo y no sustituye a los pesos de Qwen; solo corrige el renderizado del prompt.
- El proyecto es de un autor individual (starsfriday), con 0 descargas y 1 like en el momento de la ficha: no tiene la trazabilidad ni el respaldo comunitario de las plantillas oficiales, por lo que conviene validar el comportamiento en cada motor antes de llevarlo a produccion.
- En vLLM, las etiquetas dinamicas `<|think_off|>` dentro del cuerpo del prompt no son detectadas por el parser de razonamiento; hay que usar el parametro de peticion `enable_thinking: false`.
- En SGLang 0.5.x el archivo local `chat_template.jinja` se ignora por defecto; olvidar el flag `--chat-template` hace que se use la plantilla embebida en `tokenizer_config.json` (con sus bugs).
- Sin `--reasoning-format deepseek` en llama.cpp, los tokens de razonamiento pueden filtrarse al flujo de texto y detener tool calls a mitad.
- El formato de tool calls por defecto es XML canonico; si la infraestructura espera JSON hay que configurar explicitamente `tool_call_format="json"` y el parser `hermes` en vLLM.
- Licencia Apache-2.0: sin restricciones para uso comercial, aunque conviene revisar la licencia de los modelos Qwen a los que se aplique.
- Los tags referenciados (Qwen 3.5, 3.6, 3.8, 2.4T-A95B) no corresponden a versiones verificables publicamente en la informacion proporcionada; no se han podido contrastar las caracteristicas de esos modelos.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/starsfriday/Qwen-Fixed-Chat-Templates
- Modelos oficiales referenciados (no verificados en la informacion proporcionada): https://huggingface.co/Qwen/Qwen3.8-2.4T-A95B y https://huggingface.co/Qwen/Qwen3.8-27B
- Paper, demo o repositorio adicional: no disponible
