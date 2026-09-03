# textilelabs/Loom-Router-1

## Resumen

Loom Router 1 es un modelo de enrutamiento de intenciones ultraligero desarrollado por Textile Labs, un proyecto independiente que entrena modelos pequeños desde cero en hardware de consumo. Con solo 1.435.040 parámetros (2,8 MB), su función es clasificar un mensaje de usuario en una de 17 rutas posibles: 13 herramientas (búsqueda, cálculo, tiempo, clima, calendario, recordatorios, correo, notas, mapas, traducción, conversión, definición, música) y 4 rutas de control (responder, aclarar, incognoscible, rechazar). El modelo devuelve una única etiqueta como `<route:weather>` o `<route:reminder>`, sin generar texto libre.

El problema que resuelve es el coste y la latencia de decidir qué herramienta debe manejar una petición en un agente o pipeline de IA. En lugar de invocar un modelo grande para una decisión trivial, este router lo hace en un solo token, en CPU y con un archivo de menos de 3 MB. Está entrenado desde cero con pesos aleatorios, no es un fine-tune de un modelo preentrenado, y alcanza un 86,5 % de precisión sobre 2.969 utterances reales de usuarios. Su relevancia actual radica en la tendencia hacia agentes modulares y eficientes, donde un componente de enrutamiento barato puede reducir drásticamente el consumo de cómputo.

La arquitectura es un transformer causal de tamaño reducido (etiquetado como "llama" en HuggingFace), aunque no se publican detalles de capas, cabezas o dimensión de embedding. La longitud de contexto no está documentada, pero al ser un modelo de clasificación de una sola pasada, el contexto efectivo es el del prompt de entrada. El modelo está disponible en formato safetensors y GGUF, con licencia MIT.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal (estilo Llama) de tamaño reducido, sin detalles publicos de capas/heads |
| Parametros totales | 1.435.040 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | GGUF (disponible), safetensors (FP32) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer causal generativo, aunque su uso real es de clasificación: dado un prompt con formato `<user>\n{mensaje}\n<|eot|>\n<loom>\n`, predice el siguiente token, que debe ser una de las 17 etiquetas `<route:...>`. La arquitectura concreta (número de capas, dimensión de atención, etc.) no se especifica en la documentación pública; solo se indica que sigue el estilo Llama y que es un modelo "tiny" entrenado desde cero.

El entrenamiento se realizó con pesos inicializados aleatoriamente, sin partir de ningún checkpoint preentrenado. No se publican detalles del dataset de entrenamiento (número de tokens, composición exacta), pero la model card menciona que se usaron datos sintéticos para las rutas de control y que se triplicó el volumen de datos de control sin mejorar el rendimiento, lo que sugiere un problema de aprendizaje de la distinción entre referentes que viven en los datos de una herramienta y los que solo existen en la mente del usuario. No se menciona el uso de RLHF, DPO u otras técnicas de alineación. La innovación principal es el diseño de las rutas de control como mecanismo para que un router pueda decidir no usar ninguna herramienta, evitando llamadas innecesarias y alucinaciones en agentes.

## Capacidades

- Clasificacion de intenciones en 17 rutas: 13 herramientas (search, calc, time, weather, calendar, reminder, email, notes, maps, translate, convert, define, music) y 4 rutas de control (answer, clarify, unknowable, refuse).
- Enrutamiento de herramientas: dado un mensaje de usuario, devuelve la herramienta que debe manejarlo, sin reescribir el texto original, lo que evita errores de copia o malformacion.
- Decision de control: puede indicar que no se necesita herramienta (answer), que la peticion es ambigua (clarify), que depende de informacion solo conocida por el usuario (unknowable) o que debe rechazarse (refuse).
- Salida determinista: configurado con temperatura 0 y maximo de 4 tokens, emite una unica etiqueta de ruta.
- No es un modelo de chat: no genera conversacion, no puede presentarse ni mantener dialogo.
- Soporte de tool calling indirecto: no ejecuta herramientas, solo las selecciona; la integracion con el harness es responsabilidad del desarrollador.
- Monolingue: solo ingles, sin soporte multilingue.
- Sin capacidades de vision, audio ni multimodalidad.

## Casos de uso

- Enrutamiento de herramientas en agentes conversacionales: como primer paso de un pipeline agéntico, el modelo decide qué herramienta debe manejar la petición del usuario. Por ejemplo, "whats the weather in leeds tomorrow" se enruta a `weather`, y el harness pasa el texto original al servicio meteorológico. Es adecuado porque la decisión es barata y no requiere un LLM grande.
- Filtro previo a un modelo grande: en sistemas que usan un LLM para tareas complejas, Loom Router puede decidir si la petición necesita un modelo grande o puede resolverse con una herramienta simple. Si la ruta es `answer`, se puede responder directamente sin invocar el LLM, ahorrando costes de API y latencia.
- Asistentes de productividad personal: clasificar peticiones de calendario, recordatorios, notas, correo o mapas. Por ejemplo, "remind me to call mum at 6" se enruta a `reminder`, y el sistema crea la tarea en la aplicación correspondiente. Su tamaño permite ejecutarlo en dispositivos de bajo consumo.
- Automatizacion de tareas en el hogar: integrado en asistentes domésticos, puede enrutar comandos de música, tiempo o conversión de unidades. "play some jazz" iría a `music`, "convert 5 miles to km" a `convert`. Al ser un modelo de 2,8 MB, puede correr en un Raspberry Pi o similar.
- Atencion al cliente automatizada: en un sistema de soporte, el router clasifica la intención de la consulta del usuario y la dirige al sistema adecuado (búsqueda en base de conocimiento, cálculo de facturas, etc.). Su baja latencia permite responder en milisegundos, y su licencia MIT facilita su integración en productos comerciales.
- Deteccion de peticiones incognoscibles o ambiguas: aunque las rutas de control tienen bajo recall, pueden usarse como una señal débil para evitar alucinaciones. Por ejemplo, "whats my sisters name" se enruta a `unknowable`, lo que permite al sistema preguntar al usuario en lugar de inventar una respuesta. Esto es útil en agentes que necesitan terminar el bucle en lugar de dar vueltas.
- Ahorro de costes en pipelines de IA: en arquitecturas que combinan varios modelos, usar un router de 1,4M parámetros para decisiones de enrutamiento reduce el número de llamadas a modelos grandes, disminuyendo el coste por petición y la huella de carbono.

## Benchmarks y rendimiento

La model card publica resultados de evaluación sobre 2.969 utterances reales de usuarios, con una precisión global del 86,5 %. La precisión por tipo de ruta es: herramientas 89,3 % y control 71,2 %. La tasa de falsas llamadas a herramientas (false-tool-call rate) es del 20,2 %. No se proporcionan comparaciones con otros modelos en la documentación disponible.

| Ruta | n | Recall |
|---|---:|---:|
| translate | 21 | 100,0 % |
| notes | 163 | 95,1 % |
| weather | 113 | 93,8 % |
| music | 368 | 93,8 % |
| answer | 335 | 93,7 % |
| convert | 64 | 90,6 % |
| time | 123 | 89,4 % |
| calendar | 342 | 88,9 % |
| maps | 238 | 88,7 % |
| email | 202 | 87,6 % |
| reminder | 134 | 87,3 % |
| search | 599 | 86,8 % |
| define | 104 | 84,6 % |
| calc | 32 | 71,9 % |
| refuse | 36 | 25,0 % |
| clarify | 41 | 12,2 % |
| unknowable | 54 | 7,4 % |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K) porque el modelo no está diseñado para tareas generativas, sino para clasificación de rutas.

## Requisitos de hardware

- VRAM estimada: prácticamente nula. El modelo tiene 1,4M parámetros y ocupa 2,8 MB en FP32, por lo que puede ejecutarse en CPU sin necesidad de GPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna (incluso un Raspberry Pi) es suficiente para inferencia en tiempo real.
- Compatibilidad con GPU de consumo: sí, pero innecesario; el modelo es tan pequeño que la GPU no aporta ventaja.
- Opciones de despliegue: transformers (Python), Ollama (con el template y params incluidos en el repo), llama.cpp (vía GGUF), y cualquier framework que soporte modelos causales pequeños.
- Latencia y throughput: al generar un solo token, la latencia es del orden de milisegundos en CPU. El throughput está limitado por el preprocesamiento del prompt, no por la generación. No se publican cifras exactas, pero es adecuado para aplicaciones en tiempo real.

## Comparativa con modelos similares

No se dispone de datos de comparación con otros routers de intenciones en la información proporcionada. La model card menciona que los routers abiertos comparables son considerablemente más grandes y están fine-tuned desde checkpoints preentrenados, pero no cita nombres concretos. En el ecosistema actual, los routers de herramientas suelen ser modelos de 7B o más (por ejemplo, algunos modelos de función calling), mientras que Loom Router 1 es tres órdenes de magnitud más pequeño. No hay benchmarks comparativos publicados.

## Limitaciones y advertencias

- Las rutas de control (clarify, unknowable, refuse) tienen un recall muy bajo: 12,2 %, 7,4 % y 25,0 % respectivamente. La model card advierte explícitamente que deben tratarse como señales débiles, no como decisiones fiables. En producción, una predicción de control no debería usarse para terminar un flujo sin verificación adicional.
- La tasa de falsas llamadas a herramientas es del 20,2 %, lo que significa que una de cada cinco peticiones se envía a una herramienta que no puede ayudar. Esto puede provocar respuestas incorrectas si el sistema no valida el resultado.
- El modelo solo soporta inglés. No está entrenado para otros idiomas, y su uso con texto en castellano u otros idiomas producirá resultados impredecibles.
- No es un modelo de chat: no puede mantener conversaciones, responder preguntas abiertas ni generar texto libre. Intentar usarlo como un LLM generativo fallará.
- El recall de la ruta `calc` (71,9 %) se basa en solo 32 ejemplos de validación, por lo que la cifra es estadísticamente ruidosa y puede variar en producción.
- El entrenamiento se realizó con datos sintéticos para las rutas de control, y la model card documenta que el aumento de datos no mejoró el rendimiento, lo que sugiere una limitación intrínseca del modelo para distinguir referentes internos vs. externos.
- No se especifica el dataset de entrenamiento, por lo que no se pueden evaluar sesgos demográficos o culturales. El modelo podría tener sesgos derivados de los datos utilizados.
- La licencia MIT permite uso comercial sin restricciones, pero el modelo se distribuye sin garantías de precisión ni soporte.

## Enlaces

- HuggingFace: https://huggingface.co/textilelabs/Loom-Router-1
- Perfil de Textile Labs: https://huggingface.co/textilelabs
- No se encontraron otros enlaces relevantes (papers, blogs o repositorios) en la búsqueda web. Los resultados de "loom-router" en PyPI y GitHub corresponden a proyectos no relacionados con este modelo.
