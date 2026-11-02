# thinkspread/Qwen3-VL-4B-Instruct-Vision-CoreML-fp16

## Resumen

Qwen3-VL-4B-Instruct-Vision-CoreML-fp16 es una conversión a Core ML del codificador visual del modelo multimodal Qwen/Qwen3-VL-4B-Instruct, publicada por el usuario thinkspread. No se trata de un modelo de lenguaje completo, sino de un componente: el vision tower (ViT) de 415 millones de parámetros que transforma imágenes en embeddings de 2560 dimensiones, incluyendo las salidas DeepStack que el decodificador del modelo base inyecta en sus primeras capas. El paquete está compilado en fp16 para ejecutarse en el Neural Engine y la GPU de Apple Silicon.

El objetivo es permitir inferencia multimodal local en Macs sin depender del fichero mmproj de llama.cpp. El flujo previsto combina un GGUF del modelo de lenguaje Qwen3-VL-4B-Instruct (por ejemplo Q4_K_M) con este encoder ejecutado a través de Core ML mediante la herramienta tempo9, que expone una API compatible con OpenAI en el puerto local 11435. De este modo, el coste computacional del encoder se delega al hardware especializado de Apple en lugar de ejecutarse en CPU.

La relevancia es acotada pero concreta: cubre el nicho de despliegue de visión-lenguaje en macOS 26 o superior sobre chips de la serie M, con licencia Apache 2.0 heredada del modelo base. El repositorio ocupa 0,8 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision transformer (ViT) de Qwen3-VL, con salidas DeepStack; compilado con coremltools 9 como un unico bucket de 4096 parches |
| Parametros totales | 415 millones (solo el codificador visual; el modelo de lenguaje se distribuye aparte como GGUF) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (el componente procesa una imagen por peticion; el contexto textual depende del GGUF emparejado) |
| Tipos de cuantizacion | fp16 (Core ML); el GGUF del modelo de lenguaje admite las cuantizaciones habituales de llama.cpp, segun el autor |
| Idiomas soportados | no disponible (heredados del modelo base Qwen3-VL-4B-Instruct; no declarados en la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | mlmodelc (Core ML), mas tower_meta.json, tower_pos_embed.f32 y tower_aux.npz |

## Arquitectura y entrenamiento

Este repositorio no entrena ningun modelo: es una conversion de formato. El codificador visual original se extrajo de un mmproj BF16 de llama.cpp de Qwen3-VL-4B-Instruct, con 415 millones de parametros, y se convirtio con coremltools 9 en un unico bucket de 4096 parches (equivalente a imagenes de hasta aproximadamente 1024x1024 pixeles). Todos los hiperparametros se leen de la cabecera del mmproj. La salida del modelo Core ML agrupa, una al lado de otra, la embedding para el modelo de lenguaje y los tres mapas de caracteristicas DeepStack; tempo9 los separa e inyecta los mapas en las primeras capas del decodificador.

El proceso de exportacion incluye dos verificaciones de fidelidad: primero se compara el wrapper del exportador con el `Qwen3VLVisionModel` de Hugging Face cargado con los mismos pesos (coseno de 1,000000 en fp32), y despues se contrasta la salida Core ML fp16 contra ese wrapper fp32. La similitud coseno ponderada por norma, medida sobre una entrada sintetica de tipo fotografico, es de 0,9985 para la embedding del modelo de lenguaje y de 0,9994 para las caracteristicas DeepStack, evaluadas por separado para que un fallo en la cabeza DeepStack no quede oculto por una embedding principal correcta. No se documentan datos de entrenamiento, RLHF ni DPO, ya que no se aplican a una conversion.

## Capacidades

- Extraccion de caracteristicas visuales: convierte una imagen en embeddings de 2560 dimensiones compatibles con el decodificador de Qwen3-VL-4B-Instruct.
- Salidas DeepStack: emite tres mapas de caracteristicas adicionales que el modelo de lenguaje inyecta en sus capas iniciales para mejorar la comprension de detalle visual.
- Respuesta a preguntas sobre imagenes: en combinacion con el GGUF del modelo de lenguaje, permite describir escenas, identificar formas y colores y transcribir texto presente en la imagen.
- OCR y lectura de rotulos: segun las pruebas del autor, transcribe lineas de texto en imagenes sinteticas, aunque con errores ocasionales en cadenas cortas.
- Integracion via API compatible con OpenAI: el servidor tempo9 acepta peticiones a `/v1/chat/completions` con imagenes en formato `image_url` como data URI, por lo que funciona con cualquier cliente OpenAI.
- Procesamiento de una imagen por peticion, con reescalado automatico manteniendo la relacion de aspecto si la imagen supera aproximadamente un megapixel.
- No incluye generacion de texto por si mismo, ni tool calling, ni modo thinking, ni audio: esas funciones residen en el modelo de lenguaje emparejado.

## Casos de uso

- Asistente visual local en Mac: un desarrollador puede montar un servidor en localhost con tempo9 y un GGUF Q4_K_M para consultar imagenes desde scripts o aplicaciones sin enviar datos a la nube, aprovechando el Neural Engine para el encoder.
- Prototipado de pipelines multimodal en Apple Silicon: sirve para validar rapido la cadena imagen-embedding-decodificador antes de invertir en infraestructura GPU, ya que el encoder se ejecuta en hardware de consumo.
- Transcripcion de rotulos y carteles: el modelo puede leer texto en fotografias de senalizacion o etiquetas; las pruebas del autor muestran transcripcion exacta de lineas como "OPEN 9-5" o "Closed Mondays", util para digitalizacion de inventario o documentacion de campo.
- Verificacion de contenido visual en aplicaciones de escritorio: integrado en una app macOS mediante la API OpenAI local, permite clasificar o describir imagenes subidas por el usuario sin dependencia de servicios externos.
- Educacion y accesibilidad: descripcion de imagenes para lectores de pantalla o materiales didacticos, ejecutandose integramente en el equipo del usuario, lo que reduce la exposicion de contenido sensible.
- Investigacion sobre cuantizacion y portabilidad: permite estudiar como afecta la ejecucion del encoder en fp16 sobre Neural Engine frente a fp32 en CPU, con metricas de similitud coseno publicadas por el autor.
- Pruebas de integracion con clientes OpenAI: al exponer un endpoint compatible, sirve para testear aplicaciones cliente que esperan el esquema de chat completions con imagenes, sin coste de API.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo reporta metricas de fidelidad de la conversion y dos pruebas cualitativas:

| Metrica | Resultado |
|---|---|
| Similitud coseno, embedding del modelo de lenguaje (fp16 vs fp32) | 0,9985 |
| Similitud coseno, caracteristicas DeepStack (fp16 vs fp32) | 0,9994 |
| Similitud coseno, wrapper del exportador vs Qwen3VLVisionModel en fp32 | 1,000000 |
| Prueba cualitativa 1 (rotulo "OPEN 9-5", "Closed Mondays", "Tel 0571-8823-4410") | Transcripcion exacta de las tres lineas; forma y color correctos |
| Prueba cualitativa 2 (circulo rojo, cuadrado azul, texto "PIER 37") | Formas y colores correctos; texto leido como "PER3" |

Las pruebas cualitativas se realizaron en un Apple M5 Pro con 24 GB de RAM, tempo9 1.2.1, GGUF Q4_K_M y decodificacion greedy.

## Requisitos de hardware

- Plataforma obligatoria: Apple Silicon con macOS 26 o posterior. No funciona en GPUs NVIDIA, AMD ni en CPU x86.
- VRAM/unificada estimada: el repositorio pesa 0,8 GB en fp16; a ello se suma el GGUF del modelo de lenguaje Qwen3-VL-4B-Instruct (aproximadamente 2,5 GB en Q4_K_M, estimacion a partir del tamano del modelo, no confirmada en la model card).
- Hardware validado: Apple M5 Pro con 24 GB de memoria unificada. No se documentan pruebas en otras variantes (M1, M2, M3, M4, M Max, M Ultra).
- Ejecucion del encoder: el servidor tempo9 lo ejecuta en el nivel GPU de Core ML; la medicion de precision se hizo en el Neural Engine.
- Despliegue: exclusivamente mediante tempo9, que descarga el GGUF con `--hf Qwen/Qwen3-VL-4B-Instruct-GGUF:Q4_K_M` y carga el encoder con `--tower`. No hay soporte documentado para vLLM, llama.cpp puro, Ollama ni TGI.
- Latencia y throughput: no disponibles; no se publican tiempos de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros del encoder | Formato | Plataforma | Licencia | Notas |
|---|---|---|---|---|---|
| thinkspread/Qwen3-VL-4B-Instruct-Vision-CoreML-fp16 | 415 M | Core ML fp16 | Apple Silicon, macOS 26+ | Apache 2.0 | Objeto de esta ficha; requiere tempo9 y un GGUF aparte |
| thinkspread/Qwen3-VL-30B-A3B-Instruct-Vision-CoreML-fp16 | no disponible | Core ML fp16 | Apple Silicon, macOS 26+ | Apache 2.0 (heredada) | Version equivalente para el modelo MoE de 30B; no intercambiable con el de 4B por la anchura de embeddings |
| Qwen/Qwen3-VL-4B-Instruct (original) | 415 M (encoder) + 4B (LLM) | safetensors | GPU NVIDIA/AMD, CPU | Apache 2.0 | Modelo completo multimodal; puede ejecutarse con transformers o vLLM, no optimizado para Apple Silicon |
| mmproj de llama.cpp para Qwen3-VL-4B-Instruct | 415 M | GGUF | Multiples, incluidas CPU y Metal | Apache 2.0 | Alternativa nativa de llama.cpp que este repositorio sustituye en tempo9 |

No se dispone de datos de rendimiento comparativo entre estas opciones en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el GGUF del modelo de lenguaje Qwen3-VL-4B-Instruct no genera texto. Solo produce embeddings.
- Emparejamiento estricto: emite embeddings de 2560 dimensiones, por lo que solo funciona con Qwen3-VL-4B-Instruct. Usarlo con el modelo de 30B-A3B requiere el repositorio especifico para ese tamano.
- Restriccion de plataforma: requiere Apple Silicon y macOS 26 o superior; queda fuera de servidores Linux con GPU y de equipos Windows.
- Una imagen por peticion, enviada como data URI; no se documenta soporte para multiples imagenes en una misma conversacion.
- Limite de resolucion: las imagenes de mas de aproximadamente un megapixel se reescalan, lo que puede degradar la lectura de texto pequeno.
- Precision imperfecta en OCR: la prueba del autor muestra un error de lectura ("PER3" en lugar de "PIER 37"), por lo que no es fiable para transcripcion critica sin verificacion.
- Riesgo de alucinacion: inherente al modelo de lenguaje emparejado; el encoder no lo mitiga.
- Sesgos: no documentados en la model card; deben asumirse los del modelo base Qwen3-VL-4B-Instruct.
- Idiomas: no declarados para este componente; dependen del GGUF utilizado.
- Madurez: repositorio con cero descargas y cero likes, creado y actualizado el mismo dia (2 de noviembre de 2026), sin validacion comunitaria.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar los terminos del modelo base y de tempo9 por separado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thinkspread/Qwen3-VL-4B-Instruct-Vision-CoreML-fp16
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct/blob/main/LICENSE
- Repositorio de tempo9: https://github.com/thinkspread/tempo9
- Version para el modelo de 30B: https://huggingface.co/thinkspread/Qwen3-VL-30B-A3B-Instruct-Vision-CoreML-fp16
- GGUF emparejado: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
