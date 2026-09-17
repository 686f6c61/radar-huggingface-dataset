# VertexAGI/codeinluau-1-small

## Resumen

CodeInLuau 1 Small es un modelo de autocompletado de codigo especializado en Luau, el dialecto de Lua que utiliza la plataforma Roblox. Lo desarrolla VertexAGI dentro de la familia CodeIn, cuya premisa es la opuesta a la de un modelo generalista: en lugar de cubrir muchos lenguajes de forma superficial, cada miembro de la familia se destila para un unico lenguaje de programacion. En este caso, el resultado es un modelo que no conversa ni responde preguntas: recibe un prefijo de codigo real y lo continua.

El modelo parte de `mlx-community/Qwen3-8B-4bit`, un transformer denso de 8.190.735.360 parametros (segun los pesos safetensors publicados) cuantizado a 4 bits, y se ajusta mediante LoRA sobre un corpus de Luau escrito por humanos extraido de experiencias reales de Roblox. El repositorio ocupa 4,6 GB y la libreria de referencia es MLX, por lo que el destino natural del modelo son equipos Apple Silicon.

Su relevancia es acotada pero concreta: el autor documenta una evaluacion base contra ajustado sobre 100 prompts reservados del split de test oficial, medida con el parser real `luau-analyze`, en la que la tasa de errores de sintaxis reales pasa del 18 % en el modelo base al 2 % en el ajustado. Es un modelo de nicho, con cero descargas y cero likes en el momento de la consulta, y sin version GGUF publicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3-8B), ajuste LoRA; no MoE |
| Parametros totales | 8.190.735.360 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de 2048 tokens) |
| Tipos de cuantizacion | 4-bit (unico formato publicado) |
| Idiomas soportados | en (ingles); el contenido generado es codigo Luau |
| Licencia | Apache 2.0, heredada del modelo base Qwen3 |
| Formato de pesos | safetensors para MLX (`mlx-lm`); sin GGUF |

## Arquitectura y entrenamiento

La base es Qwen3-8B, un transformer denso con atencion completa, en su version ya cuantizada a 4 bits por `mlx-community`. Sobre ella se aplica un ajuste LoRA con rango 8, escala 20 y 16 capas adaptadas, durante 3.000 iteraciones, con tamano de batch 1 y longitud de secuencia 2048. La perdida de validacion final fue de 1,342, partiendo de 1,466 en la inicializacion.

El dato mas interesante del proceso es un cambio de base por un bug de la herramienta: el modelo estaba especificado originalmente sobre `Qwen3.5-9B-4bit`, pero las capas hibridas de atencion lineal de esa arquitectura provocaban un fallo no resuelto en `mlx-lm` durante el paso hacia atras de LoRA (`Insufficient Memory` en Metal, reproducido de forma independiente en varias generaciones de chip y tamanos de modelo, ver issue ml-explore/mlx-lm#1206). Se opto por retroceder a la generacion anterior, un transformer puro, que entrena sin problemas. El dataset es [`Roblox/luau_corpus`](https://huggingface.co/datasets/Roblox/luau_corpus): 19.608 ejemplos de entrenamiento y 4.352 de validacion, cada uno un par prefijo/continuacion extraido de codigo real, sin generacion sintetica. El entrenamiento se hizo como completado de texto plano, sin plantilla de chat, de modo que el modelo no adquiere comportamiento de instrucciones ni de dialogo. No se documenta RLHF ni DPO.

## Capacidades

- Completado de codigo Luau a partir de un prefijo: fragmentos de script, firmas de funciones o comentarios.
- Reconocimiento de patrones idiomaticos de Roblox: servicios (`Players`, `ReplicatedStorage`), eventos y conexiones, `leaderstats`, tweens, debounce y devoluciones de modulos.
- Generacion de codigo sintacticamente valido segun el parser oficial `luau-analyze` en la mayoria de los casos evaluados.
- No es un modelo conversacional: no responde preguntas ni sigue instrucciones en formato chat.
- No dispone de tool calling, function calling ni soporte de agentes.
- No tiene capacidades de vision, audio ni modo de razonamiento extendido.
- Multilingue: no. La ficha declara unicamente ingles, y su salida es codigo, no texto en lengua natural.

## Casos de uso

- Autocompletado en editor para desarrolladores de Roblox: integrado como motor de sugerencias, recibe el prefijo del script en curso y devuelve la continuacion, reduciendo el trabajo de escribir patrones repetitivos de servicios y eventos.
- Generacion de esqueletos de modulos: dada la firma de una funcion y un comentario descriptivo, el modelo produce el cuerpo inicial, que el desarrollador revisa y ajusta.
- Migracion o refactorizacion asistida de scripts Lua hacia Luau: se le da un fragmento y se aprovecha su conocimiento del dialecto para adaptar la sintaxis.
- Completado de bloques repetitivos de UI y tweens: los patrones de animacion y construccion de interfaces en Roblox son muy estereotipados y encajan bien en el perfil de entrenamiento.
- Material de formacion y ejemplos: util para generar ejemplos de codigo Luau correcto a partir de pequenos prefijos, siempre con revision posterior.
- Base para ajustes posteriores especificos de un estudio: al ser LoRA sobre Apache 2.0 y MLX, un equipo puede continuar el ajuste con el estilo y las APIs internas de su propio juego.
- Filtrado o validacion de codigo generado: usado como generador de referencia en un pipeline que compara la salida con `luau-analyze` antes de aceptarla.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor unicamente reporta una evaluacion propia base contra ajustado sobre 100 prompts del split de test oficial, con la salida analizada por `luau-analyze`:

| Metrica | Qwen3-8B base | CodeInLuau 1 Small |
|---|---|---|
| Continuacion completamente limpia | 23 / 100 | 76 / 100 |
| Solo truncamiento por limite de tokens | 59 / 100 | 21 / 100 |
| Error de sintaxis real | 18 / 100 | 2 / 100 |

El autor senala ademas que los fallos del modelo base son cualitativamente mas graves (abandona Luau y produce comentarios de estilo C con `//` o incluso SQL), mientras que los del modelo ajustado son errores locales y plausibles, como usar `:` donde corresponde `.` o un `...` fuera de un cierre con ambito vararg. Una evaluacion previa con 10 prompts sugeria que el modelo base salia del modo de completado hacia narracion conversacional; ese resultado no se replico con n=100 sobre el corpus real (0/100 en ambos modelos).

## Requisitos de hardware

- Inferencia exclusivamente en Apple Silicon mediante `mlx-lm`; no hay ruta oficial de despliegue en CUDA.
- El repositorio pesa 4,6 GB en 4-bit, por lo que en memoria unificada conviene disponer de al menos 8-16 GB libres para pesos mas cache KV con secuencias largas.
- Macs recomendados: cualquier equipo con M1 Pro o superior y 16 GB o mas de memoria unificada; un Mac con 8 GB puede funcionar pero con margen muy limitado.
- No hay version GGUF, de modo que no se puede ejecutar en `llama.cpp` ni en Ollama, y el autor indica que la conversion (descuantizar a fp16 y volver a cuantizar) requeria mas espacio en disco del disponible en el momento de la publicacion.
- Tampoco esta publicado para vLLM ni TGI, que no soportan el formato MLX.
- Latencia y throughput: no disponible; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Especializacion |
|---|---|---|---|---|---|
| CodeInLuau 1 Small | 8,19 B (4-bit) | no disponible | Apache 2.0 | MLX safetensors | Completado de Luau |
| Qwen3-8B (base) | 8 B | 32K segun la familia Qwen3; no confirmado en la informacion disponible | Apache 2.0 | safetensors, GGUF, MLX | Proposito general |
| Modelos de codigo generalistas (por ejemplo, la familia Qwen Coder) | no disponible | no disponible | no disponible | no disponible | Multiples lenguajes |

No se dispone de datos de benchmarks comparativos con alternativas de la misma categoria en la informacion proporcionada, mas alla de la comparacion base contra ajustado ya recogida en el apartado anterior. La unica ventaja cuantificada frente al modelo base es la reduccion de errores de sintaxis reales del 18 % al 2 % en Luau.

## Limitaciones y advertencias

- Es un modelo de completado, no de chat ni de instrucciones: alimentarlo con preguntas produce resultados degenerados.
- Ajuste LoRA sobre aproximadamente 20.000 ejemplos: cubre patrones comunes de scripting en Roblox, pero no es infalible y no conoce la jerarquia de objetos ni las APIs personalizadas de un juego concreto.
- Las completaciones deben tratarse como punto de partida sujeto a revision, no como codigo listo para produccion sin leer.
- Riesgo de alucinacion relevante: en el modelo base se observo abandono del lenguaje Luau hacia otros lenguajes; el ajuste lo reduce mucho, pero no hay garantia de que desaparezca en prompts fuera de la distribucion del corpus.
- Sesgos conocidos: no documentados por el autor.
- Cobertura idiomatica limitada al ingles en los comentarios y al Luau como lenguaje de salida.
- Contexto maximo no especificado; el entrenamiento uso 2048 tokens, por lo que no hay evidencia de buen comportamiento con prefijos mas largos.
- Restricciones de licencia: Apache 2.0 heredada del modelo base, lo que permite uso comercial, pero se debe conservar el aviso de licencia y verificar las condiciones del corpus `Roblox/luau_corpus` para usos distintos del entrenamiento.
- Dependencia de plataforma: al ser solo MLX, no se puede desplegar en infraestructura con GPU NVIDIA sin una conversion previa no publicada.
- Proyecto con 0 descargas y 0 likes en el momento de la consulta: sin comunidad ni mantenimiento verificado.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VertexAGI/codeinluau-1-small
- Dataset de entrenamiento: https://huggingface.co/datasets/Roblox/luau_corpus
- Issue de `mlx-lm` sobre el bug de atencion lineal que motivo el cambio de base: https://github.com/ml-explore/mlx-lm/issues/1206
- Modelo base: https://huggingface.co/mlx-community/Qwen3-8B-4bit
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo; los unicos resultados obtenidos correspondian a establecimientos hoteleros sin relacion con el proyecto.
