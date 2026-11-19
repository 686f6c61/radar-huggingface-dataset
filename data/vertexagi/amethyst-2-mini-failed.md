# VertexAGI/amethyst-2-mini-failed

## Resumen

Amethyst 2 Mini (Failed) es un ajuste fino mediante LoRA sobre Qwen3-4B, desarrollado por VertexAGI, orientado a conversacion general con invocacion de una herramienta de busqueda web. El modelo se publica con una advertencia explicita de no uso: el propio autor lo declara no funcional, lo desaconseja para produccion, evaluacion o pruebas, y lo marca como reemplazado por un futuro Amethyst 2.5. El repositorio se conserva unicamente como registro historico.

El modelo parte de Qwen3-4B (4.022.468.096 parametros) y se entrena con LoRA de rango 8 sobre la variante cuantizada a 4 bits de mlx-community. La innovacion pretendida es la decision selectiva de llamar a `web_search`: buscar cuando la respuesta depende de informacion actual y responder desde conocimiento cuando no. Sin embargo, el formato de entrenamiento inconsistente entre turnos de llamada a herramienta y turnos de respuesta rompe ese comportamiento en tiempo de ejecucion.

La relevancia actual del artefacto es negativa y documental: sirve como caso de estudio de como un desajuste en el formato de los datos de entrenamiento (turnos con y sin bloque `<think>` vacio) degrada el tool calling y provoca respuestas con citas inventadas. La licencia es Apache 2.0 y los pesos se distribuyen en MLX y GGUF, pero su uso no esta recomendado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Qwen3-4B) con adaptador LoRA fusionado |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (entrenamiento con secuencias de 2.048 tokens) |
| Tipos de cuantizacion | MLX mixta (capas ajustadas 8-bit, resto 4-bit), GGUF Q4_K_M, GGUF Q8_0 |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (MLX), GGUF |

## Arquitectura y entrenamiento

El modelo es un ajuste LoRA sobre Qwen3-4B, un transformer decoder-only de 4B parametros. El adaptador tiene rango 8, escala 20, se aplica sobre 16 capas, con learning rate 1e-5, batch de 2 y longitud de secuencia de 2.048 durante 13.800 iteraciones repartidas en cuatro sesiones reanudadas. El entrenamiento se realizo sobre `mlx-community/Qwen3-4B-4bit`.

Los datos son 10.000 conversaciones sinteticas destiladas de `nvidia/nemotron-3-super-120b-a12b` y `nvidia/nemotron-3-ultra-550b-a55b` a traves de NVIDIA NIM, filtradas a 9.156 ejemplos de entrenamiento y 796 de validacion. La mezcla es 36% chat general, 48% busqueda positiva, 8% sin busqueda y 8% turnos de seguimiento. El modelo emite `<tool_call>{"name": "web_search", "arguments": {"queries": ["..."]}}</tool_call>`, recibe `<tool_result>...</tool_result>` y responde con citas estilo `[1]`. La herramienta solo existe si se describe en el system prompt. El defecto principal es que los turnos de llamada y de respuesta se renderizaron con formatos distintos, lo que impide corregir el comportamiento sin reentrenar.

## Capacidades

- Generacion de texto conversacional en ingles con tono directo.
- Invocacion de la herramienta `web_search` con descomposicion de preguntas multiparte en varias consultas.
- Resumen de fragmentos recuperados en una respuesta con citas numeradas.
- Decision de buscar o no buscar, condicionada al formato exacto del prompt.
- Soporte de turnos de seguimiento dentro de una conversacion.
- No soporta vision, audio ni modo thinking funcional; desactivar thinking degrada el tool calling.

## Casos de uso

- Estudio de fallos en tool calling: analizar como un formato de entrenamiento inconsistente rompe la seleccion de herramientas, comparando el comportamiento con y sin bloque `<think>` vacio.
- Auditoria de citas inventadas: usar el modelo como ejemplo controlado de alucinacion de referencias para disenar detectores de citas falsas en pipelines RAG.
- Pruebas de robustez de plantillas de chat: verificar como distintos runtimes (mlx-lm, llama.cpp con `--jinja`) alteran la decision de llamada a herramienta.
- Docencia sobre destilacion sintetica: ilustrar el impacto de mezclas de datos (36/48/8/8) y de filtrado en la calidad final de un ajuste LoRA.
- Validacion de evaluaciones pequenas: mostrar por que 48 prompts escritos a mano no bastan para certificar fiabilidad en produccion.
- Referencia negativa en comparativas: incluir el modelo como linea base de "no usar" frente a Qwen3-4B original en pruebas de decision de busqueda.

## Benchmarks y rendimiento

Los datos proceden de un conjunto de 48 prompts escritos a mano (28 de decision de herramienta, 20 de chat general) y deben interpretarse con cautela segun el propio autor.

| Metrica | Qwen3-4B base | Amethyst 2 Mini |
|---|---|---|
| Decisiones correctas de herramienta (28) | 24 | 28 (0 falsas llamadas, 0 omisiones) |
| Chat general, juez ciego por pares (ambos ordenes A/B) | 9 victorias | 19 victorias (9 empates, 3 sin juzgar) |
| Perdida en held-out (60 ejemplos de validacion) | 3,528 | 0,585 |

Con thinking desactivado, el modelo baja a 15/28 decisiones correctas de herramienta y a veces inventa citas.

## Requisitos de hardware

- MLX mixta (8-bit en capas ajustadas, 4-bit en el resto): 3,07 GB, requiere Apple Silicon con mlx-lm.
- GGUF Q4_K_M: 2,50 GB, cabe en GPU consumer con 4 GB o mas de VRAM (GTX 1650, RTX 3050, etc.).
- GGUF Q8_0: 4,28 GB, requiere 6 GB o mas de VRAM para margen comodo.
- Despliegue: mlx-lm en Apple Silicon; llama.cpp, Ollama y LM Studio para GGUF. Para llama.cpp es necesario el template `--jinja` por defecto.
- GPU de datacenter (A100, H100) no aportan ventaja practica dado el tamano y el estado no funcional del modelo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Estado |
|---|---|---|---|---|---|
| Amethyst 2 Mini (Failed) | 4,02B | no disponible | Fragil, dependiente del prompt | Apache 2.0 | No funcional segun el autor |
| Qwen3-4B | 4B | no disponible | Estandar de Qwen3 | Apache 2.0 | Funcional, linea base |
| Amethyst 2.5 | no disponible | no disponible | no disponible | no disponible | En desarrollo |

## Limitaciones y advertencias

- El autor declara el modelo no funcional y desaconseja su uso para cualquier proposito, incluida evaluacion.
- Tool calling fragil: solo funciona con un formato de prompt especifico; con thinking desactivado responde de memoria y puede inventar citas.
- Formato de entrenamiento inconsistente entre turnos de llamada y de respuesta, defecto no corregible sin reentrenar.
- Respuestas poco fiables, con errores facticos y formulaciones extranas incluso en preguntas simples.
- Evaluacion limitada a 48 prompts manuales; el uso multiturno de herramientas no se probo de extremo a extremo.
- Solo ingles; sin soporte multilingue declarado.
- Licencia Apache 2.0 permite uso comercial, pero el estado del modelo lo desaconseja en produccion.
- Sustituido por Amethyst 2.5, aun no publicado.

## Enlaces

- Hugging Face: https://huggingface.co/VertexAGI/amethyst-2-mini-failed
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Base cuantizada usada en entrenamiento: https://huggingface.co/mlx-community/Qwen3-4B-4bit
- Modelos de destilacion: https://huggingface.co/nvidia/nemotron-3-super-120b-a12b , https://huggingface.co/nvidia/nemotron-3-ultra-550b-a55b
