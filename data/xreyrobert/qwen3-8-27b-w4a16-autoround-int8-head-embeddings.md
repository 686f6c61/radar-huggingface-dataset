# XReyRobert/Qwen3.8-27B-W4A16-AutoRound-INT8-Head-Embeddings

## Resumen

Este checkpoint es una cuantizacion adicional del modelo Qwen3.8-27B, publicada por XReyRobert. Parte del repositorio `dbirks/Qwen3.8-27B-W4A16-AutoRound`, que ya habia cuantizado el cuerpo del modelo a W4A16 mediante AutoRound, y aplica una cuantizacion INT8 simetrica con grupo 128 a las dos grandes matrices de vocabulario no compartidas: `lm_head` y `embed_tokens`. El objetivo es reducir aproximadamente 2,6 GB de memoria de pesos, dejando mas VRAM disponible para la cache KV y las paginas de estado recurrente en GPUs de 24 GB como la RTX 3090.

El modelo base Qwen3.8-27B es un transformer multimodal (image-text-to-text) con un encoder de vision integrado, desarrollado por el equipo Qwen de Alibaba. Este artefacto cuantizado esta pensado principalmente para servir el modelo en modo solo texto con vLLM, alcanzando un contexto de despliegue conservador de 150 000 tokens (hasta unos 195 000 en condiciones optimas). La licencia Apache 2.0 permite uso comercial sin restricciones, lo que lo hace atractivo para entornos de produccion con hardware de gama media.

La relevancia de esta publicacion radica en que demuestra una receta practica para ejecutar un modelo de la familia Qwen3.8 en una unica GPU consumer, con un rendimiento publicado de 416 tokens/s en modo batch o 25 ms/token en modo single-user, segun el repositorio de referencia syv-ai. No se han publicado benchmarks de precision especificos para este artefacto, por lo que las evaluaciones de calidad deben tomarse del modelo base o de la cuantizacion W4A16 original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Qwen3.8) con encoder de vision; no se especifica si es denso o MoE |
| Parametros totales | 6 260 690 960 (segun safetensors; el nombre comercial indica 27B, posible discrepancia) |
| Parametros activos | no disponible |
| Longitud de contexto | 150 000 tokens (recomendado); hasta ~195 000 en condiciones optimas; el modelo base soporta 262 000 |
| Tipos de cuantizacion | W4A16 (cuerpo, AutoRound, grupo 128) + INT8 (lm_head y embed_tokens, grupo 128) |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, compressed-tensors (pack-quantized) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer con arquitectura Qwen3.8, que incluye un encoder de vision para tareas image-text-to-text. No se dispone de informacion detallada sobre si es un modelo denso o de mezcla de expertos (MoE), ni sobre el numero de parametros activos. El checkpoint publicado aqui no modifica la arquitectura del modelo base; solo altera la representacion de los pesos.

La transformacion aplicada por XReyRobert parte del checkpoint `dbirks/Qwen3.8-27B-W4A16-AutoRound`, donde el cuerpo del modelo (capas lineales del transformer) ya estaba cuantizado a W4A16 simetrico con grupo 128 mediante AutoRound. Sobre esa base, se cuantizan adicionalmente las dos matrices de vocabulario no compartidas (`lm_head` y `embed_tokens`) a INT8 simetrico con grupo 128. Los errores relativos de ida y vuelta reportados son 0,0064 para `lm_head` y 0,0056 para `embed_tokens`, lo que indica una degradacion minima en estas matrices. La receta de transformacion proviene del repositorio `syv-ai/qwen38-27b-rtx3090` e incluye los scripts de cuantizacion y un parche para vLLM necesario para cargar el checkpoint correctamente.

No se ha realizado ningun entrenamiento o fine-tuning sobre este artefacto; es exclusivamente una cuantizacion post-entrenamiento. Tampoco se han publicado datos sobre el dataset de entrenamiento del modelo base, el numero de tokens utilizados o si se aplicaron tecnicas como RLHF o DPO.

## Capacidades

- Generacion de texto conversacional y completado de instrucciones, con soporte de modo thinking (razonamiento extendido) y modo non-thinking, segun las recomendaciones de sampling del modelo base.
- Procesamiento de imagenes y texto (image-text-to-text) en el modelo base, aunque este checkpoint esta optimizado para servir solo texto mediante la opcion `--language-model-only` de vLLM.
- Razonamiento multi-turno con contexto largo gracias a la ventana de hasta 150 000 tokens recomendada para despliegue.
- Integracion con vLLM para serving en produccion, con soporte de decodificacion especulativa (MTP) en perfil single-user, segun el repositorio syv-ai.
- Cuantizacion mixta que permite ejecutar el modelo en GPUs con 24 GB de VRAM, liberando memoria para cache KV y estado recurrente.
- Compatible con el formato compressed-tensors y con kernels Marlin para inferencia eficiente en vLLM.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo (hasta 150 000 tokens), lo que permite mantener el historial completo de una interaccion con un cliente sin perder informacion. Su despliegue en una RTX 3090 lo hace viable para pequenas empresas o equipos que no disponen de infraestructura GPU de alto coste.
- Analisis y resumen de documentos extensos: con la ventana de contexto amplia, puede procesar contratos, informes tecnicos o articulos de investigacion completos y generar resumenes o extraer informacion relevante. El modo thinking permite razonar sobre el contenido antes de responder.
- Generacion de codigo en entornos locales: aunque no se han publicado benchmarks de codigo para este checkpoint, el modelo base Qwen3.8-27B es capaz de generar y depurar codigo. Al caber en una GPU de 24 GB, puede integrarse en pipelines de desarrollo locales sin depender de APIs externas.
- Asistentes de investigacion academica: su capacidad de razonamiento y contexto largo permite analizar multiples fuentes, comparar resultados y redactar sintesis. La licencia Apache 2.0 facilita su uso en proyectos academicos y comerciales.
- Chatbots especializados en dominios tecnicos: el modelo puede ser afinado o usado con prompting para responder preguntas sobre areas concretas (derecho, medicina, ingenieria) con un historial de conversacion amplio, manteniendo coherencia a lo largo de la interaccion.
- Prototipado rapido de aplicaciones de IA: al ser un checkpoint cuantizado listo para vLLM, los desarrolladores pueden desplegarlo en una sola maquina con GPU consumer para probar funcionalidades de agente, tool calling o razonamiento multi-paso antes de escalar a modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de precision para este artefacto especifico. La model card indica explicitamente que no se ha re-ejecutado ninguna evaluacion de exactitud sobre esta publicacion, y remite a la card del modelo AutoRound fuente para las evaluaciones de cuantizacion del cuerpo y al repositorio syv-ai para los benchmarks de serving con cabezas y embeddings INT8.

En cuanto a rendimiento de inferencia, el repositorio syv-ai reporta para Qwen3.8-27B en una RTX 3090 (24 GB) con este tipo de cuantizacion: 416 tokens/s en modo batch y 25 ms/token en modo single-user, con un contexto de 150 000 tokens. Estos datos provienen de la receta original y no de una medicion independiente de este checkpoint concreto.

## Requisitos de hardware

- VRAM estimada: 24 GB para el perfil recomendado con contexto de 150 000 tokens, cache KV en fp8 y utilizacion de memoria del 97,2 %.
- GPU recomendada: RTX 3090, RTX 4090 o cualquier GPU con 24 GB de VRAM. Tambien puede ejecutarse en GPUs con mas memoria (A100, H100) para mayor margen de contexto o concurrencia.
- Cabe en GPU consumer: si, en tarjetas de 24 GB como la RTX 3090 o RTX 4090.
- Opciones de despliegue: vLLM (version 0.27.1 con parche incluido en el repositorio), tambien compatible con SGLang segun la documentacion del modelo base.
- Latencia y throughput estimados: 416 tokens/s en modo batch (64 secuencias) y 25 ms/token en modo single-user, segun el repositorio syv-ai.
- Requiere aplicar un parche a vLLM para que las matrices de embedding INT8 se carguen correctamente; sin el parche, el checkpoint no carga.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de la misma categoria. Como referencia cualitativa, este checkpoint se puede comparar con:

- `dbirks/Qwen3.8-27B-W4A16-AutoRound`: el checkpoint fuente, sin la cuantizacion INT8 de las matrices de vocabulario. Ocupa aproximadamente 2,6 GB mas de memoria de pesos, por lo que deja menos VRAM para cache KV en GPUs de 24 GB. El rendimiento de precision deberia ser identico o muy similar, ya que el error adicional introducido por la cuantizacion INT8 es minimo (errores relativos inferiores a 0,007).
- `Qwen/Qwen3.8-27B`: el modelo original sin cuantizar, que requiere alrededor de 54 GB de memoria en fp16 (estimacion basada en 27B parametros), por lo que no cabe en una GPU de 24 GB. Este checkpoint cuantizado permite ejecutarlo en hardware mucho mas modesto a costa de una posible degradacion de precision no medida.

No se incluyen comparaciones con modelos de otros fabricantes por falta de datos de benchmarks en la informacion disponible.

## Limitaciones y advertencias

- Requiere un parche especifico de vLLM (version 0.27.1) para cargar las matrices de embedding cuantizadas a INT8; sin el parche, el checkpoint no carga correctamente. El parche debe revalidarse al actualizar vLLM.
- Solo se declara soporte para ingles. Aunque el modelo base podria soportar otros idiomas, este repositorio no los garantiza.
- No se han publicado benchmarks de precision para este artefacto; la degradacion exacta respecto al modelo original es desconocida, aunque los errores de cuantizacion reportados en las matrices de vocabulario son bajos.
- El contexto recomendado de 150 000 tokens es conservador; la capacidad real depende de la version del runtime, el estado del asignador CUDA, la concurrencia y la forma de los prompts. Superar ese limite puede provocar fallos de memoria.
- El modelo base tiene un encoder de vision, pero este checkpoint esta optimizado para modo solo texto; el uso de la vision no esta validado en esta cuantizacion.
- Como cualquier modelo de lenguaje, puede generar contenido inexacto o alucinado, especialmente en tareas de razonamiento complejo o con informacion factual no cubierta en su entrenamiento.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base puede tener restricciones adicionales sobre el uso de la marca Qwen; se recomienda revisar los terminos del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/XReyRobert/Qwen3.8-27B-W4A16-AutoRound-INT8-Head-Embeddings
- Modelo base cuantizado (fuente): https://huggingface.co/dbirks/Qwen3.8-27B-W4A16-AutoRound
- Receta de transformacion syv-ai: https://github.com/syv-ai/qwen38-27b-rtx3090
- Modelo original Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B (no verificado directamente, segun la model card)
- Articulo de yottalabs sobre Qwen3.8-27B: https://www.yottalabs.ai/post/qwen-3-8-27b-specs-hardware-requirements-how-to-run-2026
- Guia de despliegue local (swfte): https://www.swfte.com/blog/qwen-3-8-27b-run-locally-self-host-guide-2026
