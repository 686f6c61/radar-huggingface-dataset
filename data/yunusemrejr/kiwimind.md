# yunusemrejr/kiwimind

## Resumen

Kiwi Mind es un stack de modelos disenado para Kiwibro, un agente de IA que se ejecuta localmente en el ordenador del usuario. Lo desarrolla yunusemrejr y se construye sobre Qwen3-0.6B de Alibaba Cloud, tambien bajo licencia Apache-2.0. El objetivo es claro: un modelo lo bastante pequeno para correr en CPU mediante WebAssembly, sin GPU ni Python en tiempo de ejecucion, ocupando aproximadamente 1 GB de memoria. El repositorio pesa 0,5 GB y el tronco del modelo, almacenado en 4 bits, ocupa 413,3 MB.

La arquitectura no es un modelo unico, sino una combinacion de un tronco compartido de 28 capas (16 compartidas y 12 especificas por habilidad) mas siete adaptadores LoRA de rango 16 intercambiables (chat, web, code, terminal, computer, tools, write) y una cabeza de control que decide que habilidad usar en cada mensaje. El tronco se entrena directamente sobre la rejilla de cuantizacion 4-bit en la que se almacena, de modo que el fichero contiene exactamente lo que se entreno.

Su relevancia actual reside en el nicho de agentes on-device: demuestra que un modelo de 0,6B puede aprender a seleccionar herramientas y emitir llamadas validas con una tasa alta de acierto, delegando a un modelo mayor cuando la tarea lo requiere. La ventana de contexto configurable es de hasta 8192 tokens y el modelo solo soporta ingles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-0.6B) con 28 capas; 16 compartidas + 12 especificas por habilidad (LoRA rango 16); cabeza de control separada |
| Parametros totales | 0,6B (modelo base Qwen3-0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | hasta 8192 tokens (configurable via `--ctx`) |
| Tipos de cuantizacion | 4 bits en grupos de 32 con una escala por grupo; embeddings en 8 bits; atencion en 8 bits en el motor WASM |
| Idiomas soportados | ingles (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | formatos propietarios `.fkm` (tronco), `.kms` (habilidades), `.kmh` (cabeza de control); `tokenizer.json` (Qwen3 sin cambios) |

## Arquitectura y entrenamiento

El modelo parte de Qwen3-0.6B y lo reorganiza en un tronco de 28 capas. Las 16 primeras son compartidas y procesan la conversacion una sola vez, independientemente de la habilidad activa. Las 12 ultimas incorporan la habilidad como un conjunto de adiciones de rango 16 a sus pesos. Cambiar de habilidad solo recalcula esas capas superiores, y los pesos se cargan una vez aunque haya varias conversaciones abiertas. La cabeza de control es una red pequena que lee el estado entre las dos mitades y puntua las siete habilidades mas una salida adicional: "necesita un modelo mayor".

El tronco se entreno con 2.711 conversaciones de entrenamiento, una sola pasada. Cada habilidad aprendio de su propia parte del 30% restante, que el tronco nunca vio. Las conversaciones fueron generadas por un modelo profesor mayor (Qwen3.8-27B) para usuarios y tareas ficticias, usando la lista real de herramientas de Kiwibro. Los pesos se almacenan en 4 bits (grupos de 32 con una escala por grupo) y los embeddings en 8 bits; el tronco se entreno con esas rejillas en el bucle, de modo que el fichero contiene exactamente lo que se entreno. No se menciona RLHF ni DPO en la informacion disponible. El prompt de entrenamiento es ChatML con las etiquetas de herramientas de Qwen, con llamadas escritas como `<tool_call>{"name": ..., "arguments": {...}}</tool_call>`.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a respuestas cortas y tareas cotidianas.
- Seleccion de herramientas (tool use): decide si hace falta una herramienta, cual, y emite llamadas con argumentos validos.
- Siete habilidades intercambiables en caliente: chat, web, code, terminal, computer, tools, write.
- Cabeza de control que enruta cada mensaje a la habilidad adecuada y detecta cuando la tarea "necesita un modelo mayor" para delegar.
- Cadenas cortas de llamadas a herramientas y razonamiento multi-paso acotado.
- Ejecucion on-device en CPU via WebAssembly, con host Node.js y servidor HTTP local en 127.0.0.1 con autenticacion Bearer.
- Entrenado para no borrar nada: ante peticiones de eliminacion de ficheros, entrega el comando en lugar de ejecutarlo.
- Capacidades multilingues: solo ingles.
- No dispone de vision, audio ni modo thinking explicito.

## Casos de uso

- Agente local de escritorio: Kiwibro usa Kiwi Mind para interpretar cada mensaje del usuario, elegir la habilidad adecuada y decidir si invoca una herramienta del sistema, todo en CPU y sin GPU.
- Automatizacion de terminal: con la habilidad `terminal`, alcanza un 98% de eleccion correcta de herramienta o respuesta simple y un 100% de llamadas validas en las pruebas retenidas, lo que lo hace adecuado para proponer comandos de shell con argumentos estructurados.
- Control de aplicaciones y escritorio: la habilidad `computer` logra un 100% de eleccion correcta y llamadas validas, util para orquestar acciones sobre la interfaz del usuario.
- Asistente de navegacion web: la habilidad `web` acierta el 92% de las veces al decidir entre herramienta o respuesta directa, con un 94% de llamadas validas, apropiada para busquedas y extraccion de paginas.
- Generacion y asistencia de codigo: la habilidad `code` elige correctamente en un 86% de los casos y produce llamadas validas en un 89%, suficiente para tareas de edicion y consulta acotadas.
- Enrutamiento y delegacion: la cabeza de control identifica la habilidad correcta en el 91% de los turnos retenidos y detecta "necesita un modelo mayor" con precision 79% y recall 90%, permitiendo handoff a un modelo auxiliar cuando el usuario lo haya configurado.
- Redaccion breve: la habilidad `write` acierta el 100% al decidir entre herramienta y respuesta directa, adecuada para textos cortos en ingles.
- Despliegue embebido sin Python: al necesitar solo Node.js 18.14 o superior, encaja en entornos restringidos donde no se puede instalar un stack de inferencia tradicional.

## Benchmarks y rendimiento

Los datos siguientes son metricas internas sobre 311 conversaciones retenidas del entrenamiento, no benchmarks publicos. Las conversaciones fueron escritas por Qwen3.8-27B para usuarios y tareas ficticias con la lista real de herramientas de Kiwibro.

Perdida (loss) en conversaciones retenidas (menor es mejor):

| Habilidad | Qwen3-0.6B original | Tronco Kiwi Mind (4 bit) | Tronco + habilidad |
|---|---|---|---|
| chat | 2,013 | 1,582 | 1,575 |
| web | 1,657 | 0,881 | 0,876 |
| code | 1,787 | 0,982 | 0,972 |
| terminal | 2,231 | 0,964 | 0,946 |
| computer | 2,348 | 0,917 | 0,907 |
| tools | 2,184 | 0,730 | 0,714 |
| write | 2,222 | 1,726 | 1,719 |

Primer paso de una tarea (eleccion correcta de herramienta o respuesta simple, herramienta correcta, llamada valida):

| Habilidad | Casos | Qwen3-0.6B original | Kiwi Mind | Herramienta correcta | Llamada valida |
|---|---|---|---|---|---|
| chat | 40 | 100% | 98% | no aplica | no aplica |
| web | 40 | 10% | 92% | 56% | 94% |
| code | 37 | 5% | 86% | 69% | 89% |
| terminal | 40 | 2% | 98% | 82% | 100% |
| computer | 40 | 0% | 100% | 68% | 100% |
| tools | 40 | 10% | 98% | 92% | 100% |
| write | 40 | 95% | 100% | 50% | 100% |

Cabeza de control: elige la habilidad correcta en el 91% de los turnos retenidos (90% en el primer mensaje de una conversacion). Para "necesita un modelo mayor": precision 79%, recall 90%.

Motor WebAssembly frente a PyTorch: sobre 14 prompts retenidos, tokenizo igual en 14, la cabeza de control eligio la misma habilidad en 14, el primer token escrito coincidio en 14 y los primeros 32 tokens coincidieron en 10. El motor guarda la memoria de atencion en 8 bits, por lo que un texto largo puede divergir de PyTorch tras un tiempo.

Velocidad en un portatil Ryzen 5 7530U con 6 hilos: lee unos 160 tokens por segundo y escribe unos 38 por segundo con 512 tokens de contexto, 23 con 2.048. Cada conversacion adicional abierta suma unos 135 MB a 2.048 tokens.

## Requisitos de hardware

- VRAM: no aplica; el modelo corre en CPU. Memoria aproximada de 1 GB en total.
- GPU recomendadas: ninguna; no se requiere GPU.
- Cabe en GPU consumer: irrelevante, ya que el diseno es CPU-only via WebAssembly.
- CPU: Ryzen 5 7530U con 6 hilos como referencia medida; cualquier CPU moderna con Node.js 18.14 o superior.
- Despliegue: motor propio en C compilado a WebAssembly con host Node.js (`host/host.mjs`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: ~160 tokens/s de lectura y ~38 tokens/s de escritura con 512 tokens de contexto; ~23 tokens/s de escritura con 2.048.
- Cambio de habilidad en conversacion larga: unos 2 segundos por cada 500 tokens de contexto en el portatil de referencia.
- Memoria por conversacion adicional: ~135 MB a 2.048 tokens.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kiwi Mind | 0,6B (base Qwen3-0.6B) | hasta 8192 | Apache-2.0 | Agente on-device con habilidades LoRA y cabeza de enrutamiento, CPU/WASM | Hugging Face (yunusemrejr/kiwimind) |
| Qwen3-0.6B | 0,6B | no disponible en la informacion | Apache-2.0 | Modelo base de proposito general | Hugging Face (Qwen/Qwen3-0.6B) |
| Qwen3.8-27B | 27B (aprox.) | no disponible en la informacion | no disponible | Modelo profesor usado para generar los datos de entrenamiento | no disponible |

La comparacion directa con Qwen3-0.6B esta documentada en las tablas de perdida y de primer paso de tarea: Kiwi Mind reduce la perdida en todas las habilidades y eleva drasticamente la tasa de eleccion correcta de herramienta (por ejemplo, de 2% a 98% en terminal y de 0% a 100% en computer). No se dispone de comparaciones con otros modelos de agente on-device en la informacion proporcionada.

## Limitaciones y advertencias

- Es un modelo de 0,6B: rinde bien en respuestas cortas, tareas cotidianas y cadenas cortas de llamadas a herramientas; el razonamiento largo y los documentos extensos no son su punto fuerte, y para eso existe la salida "necesita un modelo mayor".
- Solo soporta ingles.
- Las metricas publicadas son internas sobre conversaciones retenidas generadas por un modelo profesor, no benchmarks publicos; el autor advierte que la seleccion de duracion de entrenamiento sobre esas mismas conversaciones "favorece un poco al modelo".
- La herramienta correcta en primer paso es baja en algunas habilidades (56% en web, 50% en write, 68% en computer), aunque la llamada valida es alta.
- Cambiar de habilidad en conversaciones largas es costoso: ~2 segundos por cada 500 tokens de contexto, por el recalculo de las capas superiores.
- El motor WASM guarda la atencion en 8 bits y puede divergir de PyTorch en textos largos (solo 10 de 14 prompts coincidieron en los primeros 32 tokens).
- Entrenado para no borrar nada: no ejecuta eliminaciones, entrega el comando; esto limita automatizaciones que requieran borrado directo.
- Riesgo de alucinacion inherente a modelos pequenos; no se documentan sesgos especificos en la informacion disponible.
- Licencia Apache-2.0 permite uso comercial, pero se heredan las condiciones del modelo base Qwen3-0.6B, tambien Apache-2.0.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validacion externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yunusemrejr/kiwimind
- Modelo base Qwen3-0.6B: https://huggingface.co/Qwen/Qwen3-0.6B
- Repositorio del agente Kiwibro: https://github.com/yunusemrejr/kiwibro
