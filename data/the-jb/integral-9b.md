# the-jb/Integral-9B

## Resumen

Integral-9B es un modelo multimodal unificado desarrollado por the-jb que extiende un modelo de vision-lenguaje preentrenado (Qwen3.5-9B) para que tambien pueda generar imagenes. A diferencia de los pipelines habituales que encadenan un LLM con un difusor independiente, Integral reutiliza las representaciones visuales internas del propio modelo de vision-lenguaje para la generacion, de modo que comprension, generacion texto-a-imagen y edicion de imagen comparten un mismo espacio latente. Esto lo convierte en una propuesta relevante para quien quiera un unico modelo any-to-any en lugar de orquestar varios sistemas.

Tecnicamente se apoya en dos componentes propios: Abstraction Fusion, que construye un espacio de representacion visual compartido entre comprension y generacion, y Block-wise MoT (Mixture of Transformers), que permite generar de forma eficiente reutilizando el conocimiento multimodal ya preentrenado. El modelo tiene 10.958.399.386 parametros totales (unos 11 mil millones) y se distribuye bajo licencia Apache 2.0 con pesos en safetensors y compatibilidad con transformers y vLLM.

La relevancia actual del modelo radica en su enfoque de "generar imagenes a traves de las representaciones" del VLM, que reduce la necesidad de un decodificador latente separado y abre la puerta a edicion de imagen guiada por texto dentro del mismo modelo que la comprende. No obstante, la informacion publicada sobre datos de entrenamiento, contexto e idiomas es escasa, lo que limita una evaluacion completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM base Qwen3.5-9B) con Abstraction Fusion y Block-wise MoT |
| Parametros totales | 10.958.399.386 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; se usa bfloat16 en los ejemplos) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

Integral-9B parte de Qwen3.5-9B, un modelo de vision-lenguaje preentrenado, y le anade capacidades de generacion de imagen sin sustituir su tronco. Para ello introduce dos piezas: Abstraction Fusion, que alinea y fusiona las representaciones visuales usadas en comprension con las necesarias para sintesis, creando un espacio visual compartido; y Block-wise MoT, un esquema por bloques que permite la generacion visual aprovechando el conocimiento multimodal preentrenado de forma eficiente. La generacion se realiza mediante muestreo difusivo (DPM-Solver++ o Euler) sobre representaciones latentes del propio modelo, con parametros de control como `guidance_scale`, `time_shift` y `num_inference_steps`.

No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases de RLHF o DPO. Tampoco se especifica la innovacion exacta del entrenamiento mas alla de los dos componentes citados. La model card menciona un articulo (arXiv:2611.31237) donde presumiblemente se describe el metodo, pero su contenido no se incluye aqui.

## Capacidades

- Comprension de imagen: descripcion y respuesta a preguntas sobre imagenes (evaluado con VLMEvalKit, con thinking desactivado).
- Generacion texto-a-imagen: sintesis de imagenes a partir de prompts, con resoluciones multiplo de 32 (por ejemplo 512x512).
- Edicion de imagen: modificacion de una imagen de entrada guiada por una instruccion textual (por ejemplo, cambiar el color de un coche), con escala de guia de imagen configurable.
- Generacion con muestreo difusivo controlable: seleccion de sampler (`dpm_solver++`, `euler`), numero de pasos, escala de guia y `time_shift`.
- Soporte de chat multimodal mediante `apply_chat_template`, con opcion de activar o desactivar el modo thinking (`enable_thinking`).
- Integracion con vLLM mediante un modulo de registro (`integral.vllm.register`).
- Capacidades de tool calling, agentes, audio o multilingues: no disponibles en la informacion proporcionada.

## Casos de uso

- Edicion de imagen asistida por texto en herramientas creativas: el modelo recibe una imagen y una instruccion ("cambia el color del coche a rojo") y devuelve la imagen editada, gracias a su soporte nativo de edicion con guia de imagen.
- Generacion de ilustraciones y maquetas a partir de descripciones: util para prototipado rapido de conceptos visuales con 512x512 y DPM-Solver++ a 50 pasos.
- Asistentes multimodales que describen o responden preguntas sobre imagenes: el modelo puede procesar mensajes de chat con imagen y texto y devolver una respuesta descriptiva.
- Pipelines unificados de comprension y sintesis: al compartir representaciones, un mismo modelo sirve para analizar una imagen y despues generar variaciones, simplificando la infraestructura frente a encadenar VLM y difusor.
- Despliegue en produccion con vLLM: el registro `integral.vllm.register()` permite servir el modelo con vLLM para inferencia de comprension de imagen a escala.
- Experimentacion en investigacion multimodal: util para estudiar generacion de imagen a traves de representaciones de un VLM, con pesos abiertos y codigo en GitHub.
- Evaluacion comparativa de modelos any-to-any: sus resultados publicados en GenEval, DPG, ImgEdit o KRIS-Bench permiten situarlo frente a alternativas en tareas de generacion y edicion.

## Benchmarks y rendimiento

Comprension visual (VLMEvalKit, thinking desactivado):

| POPE | MME-P | MME-C | MMB | SEED | SEED2+ | MMStar | MMMU | OCRBench |
|---|---|---|---|---|---|---|---|---|
| 89.6 | 1716 | 695 | 85.4 | 78.8 | 73.2 | 76.0 | 73.5 | 87.3 |

Generacion de imagen:

| GenEval | GenEval2 (direct / CoT) | GenEval++ | DPG |
|---|---|---|---|
| 0.88 | 30.47 / 39.56 | 0.732 | 84.76 |

Edicion de imagen:

| ImgEdit | KRIS-Bench |
|---|---|
| 3.50 | 60.79 |

Ajustes recomendados por el autor: DPM-Solver++ con 50 pasos, guia de texto 4.0, `time_shift` 4.0 y salida 512x512; para edicion, guia de imagen 1.5. En comprension visual, MMStar y MMMU usan ajustes oficiales de Qwen (temperatura 0.7, top-p 0.8, top-k 20, presence penalty 1.5); el resto, temperatura 0.01, top-p 0.8, top-k 20 y maximo 64 tokens nuevos.

## Requisitos de hardware

- VRAM estimada para inferencia: con unos 11 mil millones de parametros en bfloat16, los pesos ocupan aproximadamente 22 GB; el ejemplo de la model card usa `dtype=torch.bfloat16` y advierte que partes del modelo permanecen en fp32, lo que incrementa el consumo. Se recomienda al menos 24 GB de VRAM para inferencia en bf16, y mas si se generan imagenes a resoluciones altas.
- GPU recomendadas: A100 (40/80 GB), H100, y GPUs de consumo con 24 GB o mas (por ejemplo RTX 4090). En GPUs con menos VRAM seria necesario cuantizar, aunque el autor no documenta cuantizaciones oficiales.
- Cabe en consumer GPU: si, en tarjetas de 24 GB como la RTX 4090 en bf16, segun el tamano de pesos; con resoluciones o lotes mayores puede requerir mas memoria.
- Opciones de despliegue: transformers (con FlashAttention 2 para el tronco de texto) y vLLM mediante `integral.vllm.register()`.
- Latencia y throughput: no disponibles en la informacion proporcionada. La generacion de imagen usa por defecto 50 pasos de DPM-Solver++, lo que condiciona el coste por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Generacion de imagen | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Integral-9B | ~11B | no disponible | Si (texto-a-imagen y edicion) | Apache 2.0 | Hugging Face, GitHub |
| Qwen3.5-9B (base) | ~9B | no disponible | No (solo comprension) | no disponible en esta ficha | Hugging Face |
| Alternativas any-to-any de tamano similar | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos suficientes en la informacion proporcionada para comparar con modelos any-to-any concretos de la misma categoria; la unica comparacion fiable es con su modelo base Qwen3.5-9B, que no genera imagenes.

## Limitaciones y advertencias

- Sesgos conocidos: no disponibles en la informacion proporcionada; al heredar de Qwen3.5-9B, podria arrastrar los sesgos de su corpus, pero no se documenta.
- Riesgo de alucinacion: no cuantificado; como todo VLM, puede describir incorrectamente imagenes o generar contenido no fiel al prompt.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no se especifican, lo que impide garantizar cobertura multilingue.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B y de los datos de entrenamiento.
- Caveat de implementacion: no se debe llamar a `model.to(torch.bfloat16)` despues de cargar, porque partes del modelo permanecen en fp32; usar `dtype=torch.bfloat16` en `from_pretrained`.
- Resoluciones: alto y ancho deben ser multiplos de 32 tanto en generacion como en edicion.
- Madurez: el repositorio tiene muy pocas descargas y likes en el momento de la consulta, por lo que la validacion comunitaria es limitada.
- Datos de entrenamiento y evaluacion: no se detalla el dataset ni el proceso de alineacion, lo que dificulta reproducir o auditar el modelo.

## Enlaces

- Hugging Face: https://huggingface.co/the-jb/Integral-9B
- Pagina del proyecto: https://thejb.ai/integral/
- arXiv: https://arxiv.org/abs/2611.31237
- Codigo en GitHub: https://github.com/the-jb/integral
