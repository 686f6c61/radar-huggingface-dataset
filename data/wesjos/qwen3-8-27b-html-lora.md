# wesjos/Qwen3.8-27B-HTML-LoRA

## Resumen

Qwen3.8-27B-HTML-LoRA es un adaptador LoRA (QLoRA, rango 16 / alpha 32) publicado por el usuario wesjos sobre el modelo base Qwen/Qwen3.8-27B. Su proposito es muy concreto: convertir la salida del modelo en HTML renderizable en lugar de Markdown, mediante una convencion de marcado propia basada en un contenedor `<div class="ai-view">` con clases como `.card`, `.summary` y `.modern-table`. El adaptador es pequeno (42 MB, 10,5 millones de parametros entrenables, un 0,04 % del total) y se distribuye con licencia Apache-2.0.

El disparador es un system prompt duro ("You are Mario-html...") que viene preincluido en el `chat_template.jinja` del repositorio: si se deja el campo de sistema vacio, se aplica automaticamente; si se pasa uno propio, prevalece el del usuario. Sin ese disparador el modelo vuelve al comportamiento normal del base, con respuestas largas en Markdown. El adaptador no modifica el razonamiento: la cadena de pensamiento se enmascaro en la perdida durante el entrenamiento, de modo que solo cambia la forma de escribir, no como piensa.

El interes practico esta en integrar generacion de interfaces directamente en el flujo de respuesta de un LLM de 27B, con un coste de almacenamiento minimo y sin necesidad de fusionar pesos. El autor advierte que el esfuerzo de razonamiento `xhigh` no funciona bien con este LoRA y que, por encima de cierto umbral, consume 20 000 tokens o mas y trunca la pagina generada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (QLoRA) sobre transformer denso Qwen3.8-27B |
| Parametros totales | 27B en el modelo base; 10,5M entrenables en el adaptador (0,04 %) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 131 072 tokens (recomendado por el autor) |
| Tipos de cuantizacion | QLoRA 4-bit NF4 con doble cuantizacion para el entrenamiento; adaptador en safetensors y version GGUF para llama.cpp |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT, 42 MB) y GGUF (adaptador de 21 MB) |

## Arquitectura y entrenamiento

El adaptador se entrena con QLoRA: el modelo base Qwen3.8-27B se carga en 4 bits (NF4, doble cuantizacion, computo en bfloat16) y se inyectan matrices de bajo rango con r=16 y alpha=32, lo que deja 10,5 millones de parametros entrenables. El repositorio ocupa 0,1 GB e incluye un `chat_template.jinja` modificado que incorpora el system prompt de activacion y cambia el esfuerzo de razonamiento por defecto a `medium`.

La innovacion principal no es arquitectonica sino de formato: el dataset de entrenamiento ensena una convencion de marcado HTML concreta (contenedor `.ai-view`, tarjetas `.card`, tablas `.modern-table`, bloques de resumen con `p.lead`) que una WebUI propia renderiza en vivo. La perdida se enmascara sobre la cadena de pensamiento, de modo que el ajuste afecta solo al estilo de salida. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generacion de paginas HTML completas y renderizables con la convencion `.ai-view`, en lugar de respuestas en Markdown.
- Componentes visuales: tarjetas (`.card`), tablas comparativas (`.modern-table`), bloques de resumen, callouts y SVG en linea (graficos, ilustraciones).
- Razonamiento con modo thinking configurable (`low`, `medium`, `high`); el valor por defecto del template es `medium`.
- Generacion de texto conversacional multi-turno heredada del modelo base.
- Soporte de entrada de imagen en la WebUI del autor mediante `--mmproj` en el backend (depende de la configuracion del servidor, no del adaptador).
- Capacidades multilingues limitadas a ingles y chino segun los metadatos del repositorio.

## Casos de uso

- Generacion de interfaces en respuestas de chat: el modelo produce directamente una pagina HTML con tarjetas y tablas que una WebUI puede renderizar en el panel derecho, sin postprocesado de Markdown.
- Explicaciones tecnicas visuales: ante una pregunta como "que aspecto tiene la sigmoid", genera la formula, un grafico SVG con asintotas y punto de inflexion, tarjetas de propiedades y una tabla de referencia.
- Documentacion interactiva autogenerada: construir paginas introductorias (por ejemplo, sobre agujeros negros) con secciones `h2`, tarjetas de datos y tablas, util para wikis internas o prototipos.
- Prototipado rapido de dashboards y landing pages: el modelo responde con estructura HTML y clases CSS predecibles que encajan con un sistema de diseno existente.
- Asistentes con salida enriquecida: integrar el adaptador en un backend servido con llama.cpp (adaptador GGUF montado sobre cualquier GGUF de Qwen3.8-27B) para que las respuestas incluyan componentes visuales sin cambiar el modelo base.
- Demostraciones y materiales docentes: generar explicaciones con SVG en linea para conceptos matematicos o cientificos en entornos donde no se quiere depender de imagenes externas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor solo reporta mediciones cualitativas y de velocidad:

| Prueba | Resultado reportado |
|---|---|
| "Explain how neural networks learn, with a visual summary and a comparison table." | `.ai-view` + 5 tarjetas + 3 tablas |
| "Build a page introducing black holes" | `.ai-view` + 13 tarjetas + 2 tablas + 7 `h2` |
| Velocidad en la demo | 2448 tokens a ~42 tok/s sobre el base de 27B |

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; con carga en 4 bits (NF4) del base de 27B se necesita aproximadamente el espacio de los pesos cuantizados mas el contexto, y el autor recomienda 131 072 tokens de contexto, lo que incrementa mucho el consumo de KV cache.
- El adaptador en si ocupa 42 MB (safetensors) o 21 MB (GGUF), por lo que el requisito real lo marca el modelo base.
- GPU recomendadas: no disponibles en la informacion proporcionada; por tamano del base, cabe esperar necesidades de clase A100/H100 para contexto largo, y GPUs de consumo solo con cuantizacion agresiva y contexto reducido.
- Despliegue: transformers + PEFT (ejemplo con `BitsAndBytesConfig` en 4 bits), llama.cpp con el adaptador GGUF montado sin fusionar, y la WebUI incluida en el repositorio (`webui/`, puerto configurable via `WEBUI_PORT`).
- Throughput observado: ~42 tok/s en la demo del autor sobre el base de 27B (hardware no especificado).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| wesjos/Qwen3.8-27B-HTML-LoRA | LoRA sobre Qwen3.8-27B | 10,5M entrenables (base 27B) | 131 072 | Apache-2.0 | Salida HTML con `.ai-view`; 48 descargas |
| wesjos/Qwen3.8-27B-CuteHuman-LoRA-GGUF | LoRA GGUF sobre Qwen3.8-27B | no disponible | no disponible | no disponible | Mismo autor, otro estilo; datos no disponibles |
| AMAImedia/Qwen3.8-27B-LoRA | LoRA sobre Qwen3.8-27B | no disponible | no disponible | no disponible | Sin datos de rendimiento en la busqueda |

## Limitaciones y advertencias

- El adaptador aprende forma, no hechos: la exactitud factual sigue dependiendo del modelo base y persiste el riesgo de alucinacion.
- El disparador es duro: sin el system prompt "You are Mario-html..." el modelo vuelve a Markdown y no genera la pagina HTML.
- El esfuerzo de razonamiento `xhigh` no es adecuado para este LoRA; consume 20 000 tokens o mas y trunca la salida.
- Con `enable_thinking: false` el razonamiento baja de 90 tokens pero el formato puede desviarse ocasionalmente.
- Idiomas soportados limitados a ingles y chino; no hay soporte declarado de castellano.
- Solo 48 descargas y 0 likes en el momento de la consulta: validacion externa muy escasa.
- La licencia Apache-2.0 del adaptador no exime de comprobar las condiciones del modelo base Qwen3.8-27B para uso comercial.
- La WebUI y el renderizado dependen de las clases CSS concretas del entrenamiento; cambios en el sistema de estilos rompen la presentacion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Qwen3.8-27B-HTML-LoRA
- Adaptador GGUF: https://huggingface.co/wesjos/Qwen3.8-27B-HTML-LoRA-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Otro LoRA del mismo autor: https://huggingface.co/wesjos/Qwen3.8-27B-CuteHuman-LoRA-GGUF
- LoRA alternativo sobre el mismo base: https://huggingface.co/AMAImedia/Qwen3.8-27B-LoRA
