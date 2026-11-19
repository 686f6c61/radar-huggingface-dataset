# Tang-yin-112/microtensor_ctx_compress-granite

## Resumen

`Tang-yin-112/microtensor_ctx_compress-granite` es un artefacto de competición publicado por el usuario Tang-yin-112 como envío para la arena "Microtensor" (`ctx_compress-granite`, testnet, netuid 576, perfil de hardware P1). No se trata de un modelo de lenguaje entrenado desde cero, sino de un sistema compuesto (harness de post-procesado determinista, un clasificador router y llamadas a modelos externos) orientado a una tarea muy concreta: comprimir el contexto de una sesión de trabajo en un resumen estructurado con nueve encabezados fijos.

Según la model card, el modelo base real vive en un repositorio separado (`Tang-yin-112/mt_slm_ctx_compress-granite`), mientras que este repositorio contiene el manifiesto y la lógica de orquestación. El sistema hace como máximo dos llamadas al modelo por ítem, aplica reparaciones deterministas (eliminación de bucles de frases, restauración de encabezados, recuperación de texto previo al primer encabezado) y, solo si el router detecta baja calidad, escala a `glm-5-3-flash` a través de un relay.

La relevancia es acotada: es un envío de competición, sin descargas ni likes, sin licencia declarada y sin información pública sobre el modelo subyacente. Resulta útil como referencia de ingeniería para pipelines de compresión de contexto con verificación determinista, pero no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (sistema compuesto: harness determinista + router clasificador `none` + modelo base en repo separado) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 4096 tokens para el router; 24000 caracteres de sesión para la escalación; contexto del modelo base no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repo contiene `manifest.json` con revisión y digests de ficheros) |

## Arquitectura y entrenamiento

El sistema descrito no es un transformer monolítico, sino una orquestación de cuatro componentes. Primero, un *harness* que ejecuta una pasada completa con el prompt de la arena y aplica una reparación determinista: corta bucles de frases, restaura encabezados faltantes o desordenados, recupera texto escrito antes del primer encabezado, elimina identificadores que no aparecen en la sesión, añade ficheros, errores y nombres omitidos, incorpora el estado en el punto de corte y ajusta al presupuesto de tokens. Segundo, una segunda llamada al modelo: reintento completo si la primera falló, o una pasada de reparación sobre el borrador solo si la reparación determinista conserva demasiadas pocas secciones del modelo.

El tercer componente es un *router*: un clasificador de secuencias `none` con una única logit (`draft_correct`), cuya entrada son los últimos 4096 tokens de la sesión seguidos del resumen. Cuarto, una escalación que solo se activa por debajo del umbral del router y que envía las secciones fallidas, los errores del verificador, los hechos de la sesión y los últimos 24000 caracteres al modelo `glm-5-3-flash` mediante un relay. El harness nunca trocea la sesión, hace como máximo dos llamadas al modelo por ítem y siempre devuelve los nueve encabezados. No se dispone de información sobre datos de entrenamiento, número de tokens, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Compresión de contexto de sesiones de trabajo en un resumen estructurado con nueve encabezados fijos.
- Reparación determinista de borradores: eliminación de bucles de frases, reordenación y restauración de encabezados.
- Recuperación de contenido previo al primer encabezado y de identificadores presentes en la sesión.
- Verificación de fidelidad: incorporación de ficheros, errores y nombres omitidos por el modelo.
- Enrutamiento de calidad mediante un clasificador binario (`draft_correct`) sobre los últimos 4096 tokens.
- Escalación selectiva a un modelo externo (`glm-5-3-flash`) solo cuando el router cae por debajo de su umbral.
- Tratamiento de instrucciones dentro de la sesión como contenido, no como comandos (defensa básica frente a inyección de prompt).
- No se documentan capacidades de generación libre, código, matemáticas, visión, audio ni tool calling.

## Casos de uso

- Compresión de actas de sesión de agentes: el sistema toma una sesión larga y produce un resumen con encabezados fijos, útil para alimentar la memoria de un agente en la siguiente iteración sin exceder el presupuesto de tokens.
- Post-procesado de borradores de LLM en pipelines de documentación: la reparación determinista corrige encabezados desordenados y bucles de frases antes de publicar, reduciendo la necesidad de revisión manual.
- Evaluación de calidad de resúmenes: el router `draft_correct` puede reutilizarse como filtro binario para descartar borradores de baja calidad en un pipeline de generación de informes.
- Enrutamiento con escalación controlada: en un sistema multi-modelo, el router decide cuándo merece la pena invocar un modelo mayor (`glm-5-3-flash`), conteniendo coste y latencia.
- Extracción de hechos de una sesión: la verificación añade ficheros, errores y nombres presentes en la sesión, lo que sirve para construir un registro de incidentes a partir de transcripciones.
- Referencia de ingeniería para concursantes de la arena Microtensor: el manifiesto con revisión y digests y la estructura de harness sirven como plantilla reproducible para otros envíos.
- Protección frente a inyección de prompt: al tratar las instrucciones de la sesión como contenido, es adecuado en entornos donde las transcripciones pueden contener texto malicioso.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifican parámetros del modelo base).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan (vLLM, llama.cpp, Ollama o TGI no aparecen en la información).
- Latencia y throughput: no disponibles; el harness impone un máximo de dos llamadas al modelo por ítem y una escalación condicional, lo que acota el coste por encima del modelo base.
- Perfil de hardware declarado en la arena: P1 (sin detalles técnicos adicionales).

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| `Tang-yin-112/microtensor_ctx_compress-granite` | Sistema de compresión de contexto con harness y router | 4096 tokens (router); 24000 caracteres (escalación) | no disponible | Hugging Face, 0 descargas |
| `Tang-yin-112/mt_slm_ctx_compress-granite` | Modelo base referenciado por el manifiesto | no disponible | no disponible | Hugging Face (referenciado) |
| `glm-5-3-flash` | Modelo externo usado para escalación | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento para establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Es un envío de competición (testnet, netuid 576), no un modelo validado para producción.
- Sin licencia declarada: no se puede asumir uso comercial permitido.
- Sin información sobre el modelo base (`mt_slm_ctx_compress-granite`): parámetros, contexto, idiomas y cuantizaciones son desconocidos.
- Dependencia de un servicio externo (`glm-5-3-flash` vía relay) para la escalación, con implicaciones de privacidad y disponibilidad.
- El router solo considera los últimos 4096 tokens de la sesión; sesiones más largas pueden quedar mal evaluadas.
- El harness no trocea la sesión, lo que limita su aplicabilidad a contextos que excedan la ventana del modelo base.
- Riesgo de alucinación en el resumen generado; la reparación determinista mitiga bucles y encabezados, pero no verifica la veracidad del contenido.
- Sesgos conocidos: no documentados.
- Sin métricas publicadas de calidad, latencia o throughput.

## Enlaces

- Hugging Face: https://huggingface.co/Tang-yin-112/microtensor_ctx_compress-granite
- Modelo base referenciado: https://huggingface.co/Tang-yin-112/mt_slm_ctx_compress-granite
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
