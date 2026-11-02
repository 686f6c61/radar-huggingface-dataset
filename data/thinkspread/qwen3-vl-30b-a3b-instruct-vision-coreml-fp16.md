# thinkspread/Qwen3-VL-30B-A3B-Instruct-Vision-CoreML-fp16

## Resumen

Qwen3-VL-30B-A3B-Instruct-Vision-CoreML-fp16 es un componente de inferencia publicado por el usuario thinkspread: no es un modelo de lenguaje completo, sino el codificador visual (vision encoder) del modelo multimodal Qwen3-VL-30B-A3B-Instruct de Alibaba Qwen, compilado para Core ML en precisión fp16. Su función es permitir que un fichero GGUF del modelo base, ejecutado con llama.cpp, pueda responder preguntas sobre imágenes sin necesidad de cargar el proyector multimodal en formato mmproj, delegando la parte visual al Neural Engine o a la GPU de un Mac con Apple Silicon.

El modelo base es un transformer de tipo Mixture of Experts con 30 mil millones de parámetros totales y aproximadamente 3 mil millones activos por token, de ahí la nomenclatura A3B. Este repositorio contiene únicamente el "tower" visual: un ViT que procesa imágenes de hasta 4096 parches de 16×16 píxeles y emite embeddings de 2048 dimensiones, además de tres mapas de características DeepStack que se inyectan en las capas tempranas del decodificador.

La relevancia es práctica: permite ejecutar un modelo multimodal de 30B en un Mac de 24 GB de memoria unificada combinando el GGUF cuantizado Q4_K_M (17,3 GB) con este codificador (1,1 GB), algo imposible si se cargara el modelo completo en fp16. Está pensado para la herramienta tempo9 del mismo autor y requiere macOS 26 o superior.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ViT (codificador visual) del modelo Qwen3-VL-30B-A3B-Instruct, compilado a Core ML |
| Parametros totales | no disponible (el repositorio solo contiene el codificador visual; el modelo base tiene 30B totales) |
| Parametros activos | no disponible para el codificador; el modelo base es MoE con ~3B activos por token |
| Longitud de contexto | no aplica al codificador; el modelo base Qwen3-VL-30B-A3B-Instruct define su propio contexto (no disponible en la informacion proporcionada) |
| Tipos de cuantizacion | fp16 (Core ML); el GGUF del modelo base puede usar cualquier cuantizacion (ejemplo: Q4_K_M) |
| Idiomas soportados | no disponible (el codificador procesa imágenes; los idiomas dependen del modelo de lenguaje base) |
| Licencia | Apache 2.0, heredada del modelo base |
| Formato de pesos | Core ML (`qwen3vl_vit_b4096.mlmodelc`), mas `tower_meta.json`, `tower_pos_embed.f32` y `tower_aux.npz` |

## Arquitectura y entrenamiento

El repositorio no entrena nada: es una conversión de formato. El codificador visual se extrajo de un mmproj BF16 de llama.cpp del modelo Qwen3-VL-30B-A3B-Instruct y se convirtió con coremltools 9 en un único bucket de 4096 parches, usando el mismo exportador que la versión para el modelo de 4B sin cambios de código; todos los hiperparámetros se leen de la cabecera del mmproj. La salida del codificador incluye el embedding para el modelo de lenguaje y tres mapas de características DeepStack dispuestos uno al lado del otro; tempo9 los separa e inyecta los mapas DeepStack en las primeras capas del decodificador.

La validación de la conversión se hizo en dos pasos: primero se comprobó el wrapper del exportador contra el `Qwen3VLVisionModel` de Hugging Face con los mismos pesos (similitud coseno de 1,000000 en fp32) y después se comparó la salida Core ML fp16 contra ese wrapper fp32. Los datos de entrenamiento del modelo base no se detallan en la información proporcionada.

## Capacidades

- Extracción de características visuales: procesa una imagen por petición y genera embeddings de 2048 dimensiones más tres mapas DeepStack.
- Soporte de OCR y lectura de texto en imágenes: en la prueba del autor transcribió exactamente tres líneas de un cartel ("OPEN 9-5", "Closed Mondays", "Tel 0571-8823-4410").
- Reconocimiento de formas y colores: identificó correctamente un triángulo amarillo, un círculo rojo y un cuadrado azul.
- Integración con modelos de lenguaje vía API compatible con OpenAI (`/v1/chat/completions`) a través de tempo9.
- Procesamiento de imágenes de hasta 4096 parches (aproximadamente 1024×1024 píxeles); las imágenes mayores se reescalan manteniendo la relación de aspecto.
- Coste de tokens: aproximadamente un token de prompt por cada 32×32 píxeles, más dos.
- No realiza generación de texto, razonamiento, código ni tool calling por sí mismo: esas capacidades dependen del GGUF del modelo base con el que se empareja.

## Casos de uso

- Asistente visual local en Mac: combinar el GGUF Q4_K_M con este codificador permite responder preguntas sobre imágenes en un equipo de 24 GB de memoria unificada, sin depender de servicios en la nube.
- Digitalización de carteles y documentos: el codificador transcribe texto en imágenes con precisión verificada en la prueba del autor, útil para extraer información de fotografías de rótulos o notas.
- Automatización de soporte con capturas de pantalla: un cliente envía una captura y el sistema, mediante la API compatible con OpenAI de tempo9, responde describiendo el contenido o el error mostrado.
- Clasificación y descripción de imágenes en lotes pequeños: al procesar una imagen por petición con embeddings de 2048 dimensiones, se puede usar para generar descripciones o etiquetas en pipelines locales.
- Desarrollo y prototipado de aplicaciones multimodales: cualquier cliente OpenAI estándar (incluido Python sin dependencias externas) puede enviar una imagen como data URI, lo que simplifica la integración en prototipos.
- Investigación sobre eficiencia en Apple Silicon: sirve como caso de estudio de despliegue híbrido Core ML + llama.cpp, separando el codificador visual del decodificador de lenguaje para optimizar el uso de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El autor sí documenta una medición de fidelidad de la conversión: similitud coseno ponderada por norma entre la salida Core ML fp16 en el Neural Engine y el mismo codificador en fp32 sobre una entrada sintética similar a una foto.

| Salida | Similitud coseno |
|---|---|
| Embedding para el modelo de lenguaje | 0,99875 |
| Características DeepStack | 0,99953 |

También se documentan dos pruebas cualitativas en un Apple M5 Pro de 24 GB con tempo9 1.2.1 y el GGUF Q4_K_M en modo greedy: un cartel con tres líneas de texto se transcribió exactamente, mientras que en una imagen con formas y el texto "PIER 37" las formas y colores se identificaron bien pero el texto se leyó como "FREED".

## Requisitos de hardware

- Memoria: el GGUF Q4_K_M del modelo base ocupa 17,3 GB y este codificador 1,1 GB; juntos caben en un Mac de 24 GB de memoria unificada con la configuración por defecto.
- Plataforma: exclusivamente Apple Silicon con macOS 26 o superior.
- Aceleración: el servidor tempo9 ejecuta el codificador en el nivel GPU de Core ML; la medición de precisión se hizo en el Neural Engine.
- GPU dedicadas (A100, H100, RTX 4090): no aplica, el formato Core ML está orientado a Apple Silicon.
- Despliegue: mediante la herramienta tempo9 (`tempo9 --hf Qwen/Qwen3-VL-30B-A3B-Instruct-GGUF:Q4_K_M --tower <ruta>`), que expone una API compatible con OpenAI en el puerto 11435.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| thinkspread/Qwen3-VL-30B-A3B-Instruct-Vision-CoreML-fp16 | Codificador visual Core ML para Qwen3-VL-30B-A3B | no disponible (modelo base 30B, ~3B activos) | no aplica | Apache 2.0 | Hugging Face, 0 descargas |
| thinkspread/Qwen3-VL-4B-Instruct-Vision-CoreML-fp16 | Codificador visual Core ML para Qwen3-VL-4B | no disponible (modelo base 4B) | no aplica | no disponible en la informacion proporcionada | Hugging Face |
| Qwen/Qwen3-VL-30B-A3B-Instruct | Modelo multimodal completo (MoE) | 30B totales, ~3B activos | no disponible en la informacion proporcionada | Apache 2.0 | Hugging Face |

El codificador de 4B es la alternativa directa para equipos con menos memoria, pero no es intercambiable con este: el autor advierte que cada codificador debe emparejarse con su modelo correspondiente. La comparación con el modelo completo no es equivalente en uso, ya que este repositorio solo cubre la parte visual.

## Limitaciones y advertencias

- Solo debe emparejarse con Qwen3-VL-30B-A3B-Instruct: emite embeddings de 2048 dimensiones, la misma anchura que Qwen3.5-35B-A3B, por lo que un emparejamiento erróneo no se detecta por la forma de la salida.
- Procesa una única imagen por petición, enviada como data URI; no admite múltiples imágenes ni URLs remotas directamente.
- Las imágenes de más de aproximadamente un megapíxel (4096 parches de 16×16) se reescalan, lo que puede degradar la lectura de texto pequeño.
- En la prueba cualitativa del autor se produjo un error de OCR ("PIER 37" leído como "FREED"), lo que indica riesgo de errores en texto corto o con tipografías poco habituales.
- Requiere macOS 26 o superior y Apple Silicon; no es portable a otros sistemas.
- El codificador no genera texto ni razona por sí mismo: cualquier limitación del modelo de lenguaje base (alucinaciones, sesgos, idiomas) se traslada al sistema completo.
- La licencia Apache 2.0 se hereda del modelo base; conviene revisar el enlace de licencia del repositorio original para confirmar condiciones de uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/thinkspread/Qwen3-VL-30B-A3B-Instruct-Vision-CoreML-fp16
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct/blob/main/LICENSE
- Codificador para el modelo de 4B: https://huggingface.co/thinkspread/Qwen3-VL-4B-Instruct-Vision-CoreML-fp16
- GGUF del modelo base: https://huggingface.co/Qwen/Qwen3-VL-30B-A3B-Instruct-GGUF
- Herramienta tempo9: https://github.com/thinkspread/tempo9
