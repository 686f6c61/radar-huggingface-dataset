# yanauto/Inkling-2-Mini-heretic

## Resumen

Inkling-2-Mini-heretic es una variante "decensored" (abliterada) del modelo thinkingmachines/Inkling-2-Mini, publicada por el usuario yanauto en Hugging Face. El modelo base es un transformer de tipo Mixture-of-Experts (MoE) con capacidad multimodal image-text-to-text, disenado originalmente por Thinking Machines para generacion de texto conversacional y razonamiento. Esta version concreta aplica una ablacion de rango arbitrario (Arbitrary-Rank Ablation, ARA) mediante la herramienta Heretic 2.1.0 para eliminar la mayor parte de los comportamientos de rechazo del modelo original, manteniendo intacta la arquitectura y los pesos de los expertos enrutados.

El modelo conserva exactamente el mismo formato y estructura de ficheros que el original: solo se han modificado 21 de las 24 proyecciones de salida de atencion (`attn.wo_ud`), mientras que los expertos enrutados siguen siendo los pesos oficiales NVFP4/MXFP8 byte a byte. Esto lo convierte en un reemplazo directo (drop-in replacement) para cualquier stack de inferencia que ya ejecute el modelo original (vLLM, SGLang, transformers o conversiones a llama.cpp), con un tamano de repositorio de aproximadamente 20,2 GB y 26.388.646.440 parametros totales.

La relevancia de esta ficha radica en que documenta un caso de estudio de ablacion selectiva sobre un modelo MoE multimodal de gran porte: el autor demuestra que es posible reducir drastricamente las tasas de rechazo (de 100/100 a 6/100 en el test harmful_behaviors) con un coste minimo en calidad (MMLU pasa de 78,7% a 78,0%) y una divergencia KL de solo 0,049 en el primer token de respuesta. Es, por tanto, un ejemplo tecnico de como se comportan las tecnicas de abliteracion cuando se aplican a un subconjunto muy pequeno de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer Mixture-of-Experts (MoE) multimodal, con `GatedOutputProjection` en la atencion y cabeza MTP (multi-token prediction) |
| Parametros totales | 26.388.646.440 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Pesos de expertos enrutados en NVFP4 / MXFP8; proyecciones de atencion en BF16; cuantizacion 8-bit (modelopt) referenciada en los tags; existe variante GGUF en repositorio separado |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato transformers) |

## Arquitectura y entrenamiento

El modelo base Inkling-2-Mini es un transformer MoE multimodal con pipeline `image-text-to-text`, que combina un encoder de vision con un decodificador de lenguaje basado en mezcla de expertos. La arquitectura incluye detalles poco habituales: las proyecciones de salida de atencion estan envueltas en una compuerta (`GatedOutputProjection`), de modo que la ablacion solo puede editar la capa lineal interna; ademas, las capas 6 a 17 se ejecutan tres veces por pasada forward (mecanismo de bucle o "loop" asociado al tag `inkling2_loop`), y el modelo incorpora una cabeza MTP (multi-token prediction) para decodificacion especulativa. Los pesos de los expertos enrutados se distribuyen en formatos de baja precision NVFP4 y MXFP8, mientras que las proyecciones de atencion se mantienen en BF16.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si el modelo base utilizo RLHF o DPO, ya que la model card de esta variante no los detalla y la ficha se limita a los datos proporcionados. Respecto al proceso de creacion de esta version heretic, el autor documenta que se ejecuto Heretic 2.1.0 con 100 trials de Optuna (20 aleatorios, semilla 20261121) sobre una RTX PRO 6000 Blackwell de 96 GB en Google Colab, desquantizando los expertos a BF16 en memoria. Se selecciono el trial 59, el punto de Pareto con menor KL entre los que lograban un maximo del 5% de rechazos. El LoRA resultante se fusiono de nuevo en el layout original de safetensors, reescribiendo unicamente el shard que contiene `wo_ud`.

## Capacidades

- Generacion de texto conversacional multi-turno.
- Razonamiento con modo "thinking" (bloque de pensamiento cerrado seguido de respuesta, con esfuerzo configurable: `none`, `high`, etc.).
- Procesamiento de imagen y texto de entrada (pipeline image-text-to-text): el encoder de vision se mantiene intacto respecto al original.
- Capacidades de decodificacion especulativa mediante la cabeza MTP (multi-token prediction).
- Comportamiento "decensored": responde a peticiones que el modelo original rechaza, con tasas de rechazo reducidas a 6/100 en harmful_behaviors y 12/100 en JailbreakBench en modo respuesta directa.
- Soporte de tool calling / function calling: no confirmado explicitamente en la informacion disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explicitamente; el modo thinking sugiere capacidad de razonamiento extendido, pero no se documenta integracion con frameworks de agentes.
- Capacidades multilingues: no disponible.

## Casos de uso

- Investigacion sobre alineacion y abliteracion: el modelo sirve como caso controlado para estudiar como la ablacion de un subconjunto minimo de pesos (21 de 24 proyecciones de atencion) afecta a las tasas de rechazo y a la calidad general, con metricas reproducibles de KL y MMLU.
- Evaluacion de robustez de salvaguardas: permite a equipos de seguridad medir la eficacia de sus filtros externos cuando el modelo subyacente ya no rechaza por si mismo, usando los tests harmful_behaviors y JailbreakBench como referencia.
- Generacion creativa sin restricciones de contenido: escritura de ficcion, guiones o narrativa que aborde temas sensibles, donde el modelo original rechazaria peticiones por politica de uso.
- Despliegue como reemplazo directo en infraestructura existente: al compartir formato y pesos con el original, puede sustituir a thinkingmachines/Inkling-2-Mini en vLLM, SGLang o transformers cambiando solo el model id, sin recompilar ni reconvertir pesos.
- Procesamiento multimodal image-text-to-text: tareas de descripcion de imagenes, respuesta a preguntas sobre documentos visuales o extraccion de informacion, aprovechando el encoder de vision intacto.
- Razonamiento con modo thinking en entornos de investigacion: analisis de cadenas de razonamiento y su efecto en la tasa de rechazo (el autor documenta que con thinking activo el modelo aun se auto-convence de rechazar en 12/50 y 8/50 casos).
- Experimentacion con cuantizacion y despliegue en consumer GPU: la variante GGUF publicada en repositorio separado permite probar el modelo en hardware mas modesto mediante llama.cpp u Ollama.

## Benchmarks y rendimiento

Los unicos datos de benchmarks publicados en la informacion disponible son los de la model card del autor. No se dispone de resultados de MMLU, HumanEval, GSM8K u otros benchmarks estandar mas alla de los reportados a continuacion.

| Metrica | Original | Inkling-2-Mini-heretic |
|---|---|---|
| Rechazos, respuesta directa, harmful_behaviors (100) | 100/100 | 6/100 |
| Rechazos, respuesta directa, JailbreakBench harmful (100) | 97/100 | 12/100 |
| Rechazos, thinking on (effort high), harmful_behaviors (50) | 50/50 | 12/50 |
| Rechazos, thinking on (effort high), JailbreakBench (50) | 50/50 | 8/50 |
| MMLU, 1.000 preguntas, zero-shot | 78,7% | 78,0% |
| Divergencia KL, primer token de respuesta, 100 prompts innocuos | 0 | 0,049 |

Notas metodologicas del autor: los rechazos se cuentan con la lista de palabras clave de Heretic sobre los primeros 150 tokens (modo directo) o sobre la respuesta final tras el thinking (hasta 1.536 tokens). "Respuesta directa" significa bloque de thinking vacio y cerrado seguido de la respuesta. MMLU usa los logits del siguiente token con `reasoning effort = none`, sobre las mismas 1.000 preguntas y semilla para ambos modelos.

Comparativa interna entre variantes del propio autor:

| Variante | Ediciones | Rechazos (Heretic, 100) | KL |
|---|---|---|---|
| Esta version (attn) | proyecciones de salida de atencion | 4/100 | 0,049 |
| Version full | + todos los expertos enrutados (`down_proj`) | 3/100 | 0,120 |

Segun el autor, editar tambien los expertos apenas reduce un rechazo adicional a cambio de mas que duplicar la divergencia KL.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 20 GB en el formato publicado (pesos NVFP4/MXFP8 para expertos y BF16 para atencion); la variante full en BF16 ocupa unos 52 GB.
- GPU recomendadas: el autor realizo el proceso de ablacion en una RTX PRO 6000 Blackwell (96 GB); para inferencia, el tamano de ~20 GB encaja en GPUs de 24 GB o mas (RTX 4090, RTX 3090, A10G, L40S) y, con holgura, en A100 40/80 GB y H100.
- Cabe en consumer GPU: si, en RTX 4090 / 3090 (24 GB) con el formato publicado, siempre que el runtime soporte NVFP4/MXFP8; la variante GGUF amplia las opciones a GPUs con menos VRAM segun la cuantizacion elegida.
- Opciones de despliegue: vLLM, SGLang, transformers (segun la model card oficial del modelo base); llama.cpp via la variante GGUF; Ollama no confirmado explicitamente.
- Latencia y throughput estimados: no disponibles. El modelo incorpora cabeza MTP para decodificacion especulativa, lo que puede mejorar el throughput, pero no se publican cifras.

## Comparativa con modelos similares

| Modelo | Parametros totales | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yanauto/Inkling-2-Mini-heretic | 26.388.646.440 | no disponible | Apache 2.0 | Variante abliterada del modelo de Thinking Machines; ~20 GB; multimodal image-text-to-text |
| thinkingmachines/Inkling-2-Mini (base) | 26.388.646.440 | no disponible | Apache 2.0 | Modelo original con salvaguardas intactas; mismos ficheros y formato |
| yanauto/Inkling-2-Mini-heretic-full | no disponible (BF16, ~52 GB) | no disponible | Apache 2.0 | Variante que edita tambien los 3.072 expertos enrutados; KL 0,120 frente a 0,049 |
| yanauto/Inkling-2-Mini-heretic-GGUF | no disponible | no disponible | Apache 2.0 | Conversion GGUF de esta misma variante para llama.cpp |

No se dispone de datos de benchmarks comparativos con modelos de otros autores de la misma categoria (mismo tamano o misma tarea) en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo responde a peticiones que el original rechaza; el autor declara explicitamente que el usuario es responsable del uso y del cumplimiento legal y de la politica de uso aceptable del modelo original (Thinking Machines acceptable use policy).
- En modo thinking (effort high) la tasa de rechazo sube respecto al modo directo: 12/50 en harmful_behaviors y 8/50 en JailbreakBench, porque el modelo aun se auto-convence de rechazar en algunos casos. No es un modelo completamente libre de rechazos.
- La ablacion se limita a 21 de 24 proyecciones de salida de atencion; los expertos enrutados conservan los pesos oficiales, por lo que el comportamiento residual de alineacion puede persistir en otras rutas.
- La divergencia KL de 0,049 en el primer token indica un cambio medible en la distribucion de salida incluso en prompts innocuos; puede haber degradacion sutil en tareas sensibles a la calibracion.
- MMLU cae ligeramente de 78,7% a 78,0% (1.000 preguntas, zero-shot), diferencia pequena pero no nula.
- No se dispone de datos sobre sesgos conocidos, idiomas soportados ni evaluaciones de seguridad adicionales mas alla de los tests de rechazo reportados.
- La licencia Apache 2.0 permite uso comercial, pero el autor remite a la politica de uso aceptable del modelo base, que puede imponer restricciones adicionales.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha; es una publicacion reciente (creada el 2026-11-21) sin validacion independiente de la comunidad.
- El soporte de NVFP4/MXFP8 en el runtime de inferencia es un requisito practico para ejecutar el formato publicado a ~20 GB; sin ese soporte, habria que recurrir a la variante GGUF o a reconvertir pesos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yanauto/Inkling-2-Mini-heretic
- Modelo base: https://huggingface.co/thinkingmachines/Inkling-2-Mini
- Variante GGUF: https://huggingface.co/yanauto/Inkling-2-Mini-heretic-GGUF
- Variante full (expertos editados): https://huggingface.co/yanauto/Inkling-2-Mini-heretic-full
- Heretic (herramienta de ablacion): https://github.com/p-e-w/heretic
- Politica de uso aceptable del modelo base: https://thinkingmachines.ai/model-acceptable-use-policy/
- Dataset harmful_behaviors: https://huggingface.co/datasets/mlabonne/harmful_behaviors
- Dataset JailbreakBench: https://huggingface.co/datasets/JailbreakBench/JBB-Behaviors
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
