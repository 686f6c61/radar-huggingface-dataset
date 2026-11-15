# tmthang86/ThinkingCap-Qwen3.8-27B-abliterated-mlx-4bit

## Resumen

ThinkingCap-Qwen3.8-27B-abliterated-mlx-4bit es una cuantizacion en formato MLX de 4 bits del modelo IstroSec/ThinkingCap-Qwen3.8-27B-abliterated, que a su vez es la variante sin censura (abliterated) del fine-tune bottlecapai/ThinkingCap-Qwen3.8-27B sobre la base Qwen3.8-27B de Alibaba Cloud. El modelo resuelve el problema de ejecutar un LLM de aproximadamente 27.000 millones de parametros en hardware Apple Silicon con memoria unificada limitada, manteniendo el modo de razonamiento extendido caracteristico de la familia ThinkingCap, que reduce el consumo de tokens de pensamiento frente a la base Qwen.

La pieza publicada por tmthang86 no introduce cambios en los pesos ni en la plantilla de chat: es una conversion mecanica realizada con `mlx-lm` 0.32.2 aplicando cuantizacion uniforme estandar de 4 bits (4,5 bits por peso, unos 14 GB). El resultado ocupa 15,2 GB en el repositorio y esta pensado exclusivamente para generacion de texto mediante `mlx-lm`; ni la entrada de vision ni la cabeza draft MTP del checkpoint original fueron probadas en esta build.

Es relevante ahora porque permite probar localmente un modelo de razonamiento de gran tamano, sin censura y con licencia restrictiva para uso comercial, en Macs con 48 GB de memoria unificada, con un rendimiento medido de unos 33 tokens por segundo y un pico de memoria de 15,8 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.8, tag `qwen3_5`/`qwen3_8`); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 26.895.993.856 (26,9 mil millones) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits uniforme (4,5 bits por peso); solo esta build MLX 4-bit |
| Idiomas soportados | en, multilingual |
| Licencia | polyform-small-business-1.0.0 (con permiso adicional de uso personal de BottleCap AI, segun el repo origen) |
| Formato de pesos | safetensors en formato MLX (libreria `mlx`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.8, con 26,9 mil millones de parametros totales. La informacion disponible no detalla el numero de capas, dimensiones ocultas, mecanismo de atencion ni si incorpora innovaciones como decodificacion especulativa con cabeza MTP (la model card menciona que la cabeza draft MTP del checkpoint fuente existe, pero no fue probada en esta build). Tampoco se especifican los datos de entrenamiento, el numero de tokens, la composicion del dataset ni si hubo fases de RLHF o DPO en el modelo original.

El linaje es relevante para entender el comportamiento: bottlecapai/ThinkingCap-Qwen3.8-27B es un fine-tune de Qwen3.8-27B orientado a gastar menos tokens de pensamiento, e IstroSec aplico posteriormente una tecnica de abliteration para eliminar los rechazos del modelo. Esta build de tmthang86 es una conversion pura con `mlx_lm.convert --q-bits 4`, sin modificaciones de pesos ni de plantilla de chat, por lo que hereda integramente las capacidades y los sesgos del checkpoint abliterated.

## Capacidades

- Generacion de texto conversacional y de un solo turno mediante `mlx-lm`.
- Modo de razonamiento (thinking model): el modelo emite tokens de pensamiento antes de la respuesta, por lo que conviene reservar un presupuesto amplio de tokens de salida (la model card sugiere `--max-tokens 3000`).
- Generacion de JSON valido en tareas cortas de analisis (verificado por el autor con un prompt de deteccion de contradicciones en vietnamita).
- Capacidad multilingue declarada (en, multilingual), aunque el autor solo valido un caso en vietnamita.
- Comportamiento sin censura (abliterated/uncensored): no aplica rechazos por contenido sensible, lo que amplia el rango de respuestas pero elimina las salvaguardas del modelo base.
- Capacidades de vision y de tool calling: no verificadas ni garantizadas en esta build; la model card indica explicitamente que la entrada de vision no fue probada.

## Casos de uso

- Razonamiento local en Apple Silicon: ejecutar un modelo de 27B en modo thinking en un Mac con 48 GB de memoria unificada, con 33 tokens/s medidos, para tareas de analisis que requieran cadenas de razonamiento largas sin depender de la nube.
- Analisis de contradicciones y consistencia documental: el autor valido la generacion de JSON estructurado en un prompt de deteccion de contradicciones, un patron reutilizable para auditoria de textos, contratos o documentacion tecnica.
- Investigacion sobre alineacion y abliteration: comparar el comportamiento del modelo abliterated frente a la base ThinkingCap para estudiar que capacidades y sesgos cambian al eliminar los rechazos.
- Prototipado de asistentes conversacionales sin restricciones de contenido: util en entornos de investigacion creativa o red teaming donde las salvaguardas estandar interfieren con la evaluacion.
- Generacion de texto multilingue en local: el modelo declara soporte multilingue y se ha probado con exito en vietnamita, lo que permite prototipos en idiomas distintos del ingles sin infraestructura cloud.
- Evaluacion de cuantizacion MLX 4-bit: usar esta build como referencia para medir la perdida de calidad de la cuantizacion uniforme de 4 bits frente al checkpoint de 27B en tareas de razonamiento y generacion estructurada.
- Despliegue offline en portatiles: con 15,8 GB de pico de memoria, cabe en Macs de gama alta y permite flujos de trabajo sin conexion para procesamiento de texto sensible que no puede salir del dispositivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se ejecuto ningun benchmark sobre esta build. Los unicos datos de rendimiento medidos son de inferencia: aproximadamente 33 tokens por segundo y 15,8 GB de pico de memoria en un Mac Apple Silicon con 48 GB.

## Requisitos de hardware

- Memoria: pico medido de 15,8 GB en inferencia con la cuantizacion 4-bit; el repositorio ocupa 15,2 GB en disco.
- Hardware validado: Apple Silicon con 48 GB de memoria unificada (Mac con chip de la familia M, modelo no especificado).
- Cabe en GPUs consumer: no aplica directamente, ya que el formato MLX esta disenado para memoria unificada de Apple Silicon; no se ha validado en GPU NVIDIA.
- Despliegue: exclusivamente mediante `mlx-lm` (version >= 0.32.2). No hay soporte declarado para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Throughput: unos 33 tokens/s medidos en el hardware del autor; la latencia por peticion dependera del numero de tokens de pensamiento generados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ThinkingCap-Qwen3.8-27B-abliterated-mlx-4bit (este) | 26,9B | no disponible | MLX 4-bit | PolyForm Small Business 1.0.0 | Solo Apple Silicon, sin benchmarks publicados |
| IstroSec/ThinkingCap-Qwen3.8-27B-abliterated | no disponible | no disponible | safetensors | no disponible en la informacion proporcionada | Checkpoint fuente sin cuantizar; requiere mas memoria |
| bottlecapai/ThinkingCap-Qwen3.8-27B | no disponible | no disponible | safetensors | no disponible en la informacion proporcionada | Fine-tune original con censura y menos tokens de pensamiento |
| Qwen3.8-27B (base de Alibaba Cloud) | no disponible | no disponible | safetensors | Apache 2.0 | Modelo base sin abliteration; licencia permisiva para uso comercial |

No se dispone de datos de rendimiento comparado entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- Ausencia de salvaguardas: al ser una variante abliterated, el modelo no rechaza peticiones por contenido sensible; esto traslada toda la responsabilidad de filtrado al desarrollador.
- Riesgo de alucinacion: inherente a los modelos de 27B en modo thinking; no se han publicado evaluaciones de fidelidad factual para esta build.
- Capacidades no verificadas: vision y tool calling no fueron probadas; no deben asumirse en produccion.
- Contexto e idiomas: la longitud de contexto no esta documentada y el soporte multilingue solo se valido con un caso en vietnamita, pese a declararse `en` y `multilingual`.
- Licencia restrictiva: PolyForm Small Business 1.0.0 limita el uso comercial a pequenas empresas segun los terminos de la licencia; es imprescindible revisar `LICENSE` y `NOTICE` antes de cualquier uso comercial. El modelo base Qwen es Apache 2.0, pero las capas de fine-tune y abliteration quedan bajo la licencia PolyForm.
- Dependencia de plataforma: el formato MLX solo es utilizable en Apple Silicon con `mlx-lm`; no hay pesos GGUF ni safetensors estandar para otros runtimes.
- Madurez: el repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia; no hay validacion de la comunidad ni benchmarks independientes.
- Presupuesto de tokens: al ser un modelo de razonamiento, las respuestas cortas pueden quedar truncadas si no se reservan suficientes tokens de salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tmthang86/ThinkingCap-Qwen3.8-27B-abliterated-mlx-4bit
- Modelo base (abliterated): https://huggingface.co/IstroSec/ThinkingCap-Qwen3.8-27B-abliterated
- Fine-tune original: https://huggingface.co/bottlecapai/ThinkingCap-Qwen3.8-27B
- Libreria MLX LM: https://github.com/ml-explore/mlx-lm
