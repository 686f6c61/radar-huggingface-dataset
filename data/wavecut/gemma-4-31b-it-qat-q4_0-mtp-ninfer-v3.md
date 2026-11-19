# WaveCut/gemma-4-31B-it-QAT-Q4_0-MTP-NInfer-v3

## Resumen

Este repositorio no contiene un modelo nuevo, sino un artefacto de despliegue en formato `.ninfer` (v3) que empaqueta el modelo denso Gemma 4 31B it de Google, entrenado con quantisation-aware training (QAT) en Q4_0, junto con su asistente de predicción multi-token (MTP) y su torre de visión. Lo publica el usuario WaveCut y está pensado exclusivamente para la rama `master` de `iamwavecut/ninfer-all`, una bifurcación del motor de inferencia NInfer. Todas las matrices conservan los bloques ggml originales byte a byte, sin recuantización, y el motor los multiplica in situ.

El interés práctico es que permite ejecutar el modelo completo (texto, imagen y vídeo) en una única GPU, con decodificación especulativa mediante el asistente MTP, reutilización de prefijo de prompt (incluidas imágenes), salida estructurada, tool calling en el marcado de Gemma devuelto como llamadas OpenAI y razonamiento en canal separado. Está medido en una RTX 3090 y ocupa 16,4 GiB de VRAM para los pesos.

Es relevante ahora porque demuestra una vía de despliegue de un modelo multimodal de 31B en hardware de consumo de gama alta, pero con una dependencia muy estricta del motor: las compilaciones estándar de NInfer rechazan el fichero. La información disponible sobre el modelo base (idiomas, benchmarks, datos de entrenamiento) es escasa en esta ficha; los detalles técnicos se centran en el formato y el motor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (texto + visión), 60 bloques (50 de atención de ventana deslizante, 10 de atención completa), anchura 5376, MLP GeGLU denso de anchura 21.504 |
| Parámetros totales | no disponible (el artefacto contiene 1.236 parámetros en el sentido de tensores/objetos: 259 en Q4_0, 1 en Q6_K, 111 en BF16 y 610 en FP32) |
| Parámetros activos | no aplica: el modelo es denso, sin expertos enrutados |
| Longitud de contexto | 57.344 tokens en la configuración de lanzamiento (`--max-context 57344`); la longitud máxima del modelo base no está indicada |
| Tipos de cuantización | Q4_0 (matrices), Q6_K (tabla de tokens y cabeza atada), BF16 (matrices de la torre de visión y proyección de parches), FP32 (normas y escalares de capa) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0, con enlace a la licencia específica de Gemma 4 (`ai.google.dev/gemma/docs/gemma_4_license`) |
| Formato de pesos | `.ninfer` v3 (un único fichero de 19.083.598.848 bytes, 17,77 GiB, SHA-256 `b7682ed0008717c3a1e6204833b40544c84028dcf6dd9d13829b68a2aa4552bc`); los bloques internos son ggml Q4_0/Q6_K/BF16/FP32 |

## Arquitectura y entrenamiento

El modelo base es Gemma 4 31B it en su variante QAT Q4_0, un transformer denso sin expertos enrutados. El artefacto describe 60 bloques de anchura 5376, de los cuales 50 usan atención de ventana deslizante y 10 atención completa, con un MLP GeGLU denso de anchura 21.504. La tabla de tokens y la cabeza atada están en Q6_K; las normas y los escalares de capa en FP32. El asistente MTP consta de cuatro bloques de anchura 1024 que leen la caché KV del propio modelo y estados de anchura 5376, con tabla de tokens Q4_0 como cabeza. La torre de visión (proyector `gemma4v` de llama.cpp) tiene 27 bloques de anchura 1152 con matrices BF16 y normas FP32, más proyección de parches y tabla de posiciones en BF16.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en la información proporcionada. La innovación técnica destacable es el empaquetado: el conversor (`tools.convert`, receta `gemma4_gguf`, componentes `text,mtp,vision`) fusiona los GGUFs de Google y de Unsloth sin recuantizar, y el motor aplica decodificación especulativa con el asistente (`--spec mtp`, dos borradores por ronda en el ejemplo) y codifica imagen y vídeo con la torre (`--vision`). La conversión tarda aproximadamente un minuto.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento en canal separado cuando la petición lo activa.
- Comprensión de imagen y vídeo junto a texto (pipeline `image-text-to-text`), mediante la torre de visión incluida.
- Tool calling y function calling: las llamadas en el marcado de Gemma se devuelven como llamadas de herramienta en formato OpenAI.
- Salida estructurada.
- Servicio concurrente de una a ocho peticiones con reutilización de prefijo de prompt, incluidas las imágenes.
- Decodificación especulativa con asistente MTP para acelerar la generación.
- API compatible con OpenAI y Anthropic en `http://localhost:8080/v1`.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Asistente multimodal en local sobre una RTX 3090: el modelo completo, con visión y vídeo, cabe en 16,4 GiB de VRAM, lo que permite montar un asistente privado que responde sobre capturas, documentos escaneados o fotogramas sin depender de la nube.
- Análisis de vídeo e imagen en pipelines de inspección: la torre de visión codifica imágenes y vídeo junto al texto, de modo que se pueden enviar fotogramas o clips y pedir descripciones, extracción de datos o clasificación en una sola petición.
- Agentes con tool calling: el servidor traduce el marcado de Gemma a llamadas de herramienta OpenAI, lo que permite integrarlo en frameworks de agentes existentes y en flujos de varios pasos con salida estructurada.
- Servicio de chat multi-turno con contexto largo: con 57.344 tokens de contexto y reutilización de prefijo (incluidas imágenes), es adecuado para conversaciones largas o documentos extensos que se reenvían en cada turno sin recalcular el prefijo.
- Razonamiento con traza separada: el canal de pensamiento propio permite separar la deliberación de la respuesta final en aplicaciones que necesitan auditar el razonamiento.
- Inferencia acelerada por decodificación especulativa: el asistente MTP con dos borradores por ronda reduce el coste por token en cargas interactivas de baja concurrencia (una a ocho peticiones), donde la latencia importa más que el throughput agregado.
- Despliegue reproducible con Docker: la imagen `ghcr.io/iamwavecut/ninfer-all:cuda13.4-acdad409f6c3` y la configuración `gemma4-31b.ini` permiten levantar el servicio con un solo comando en máquinas con driver NVIDIA 580 o superior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo indica que el artefacto fue medido en una RTX 3090 y que otras compilaciones lo compilan sin medirlo; no se aportan cifras de latencia ni de throughput.

## Requisitos de hardware

- VRAM: 16,4 GiB para los pesos en GPU, más 0,25 GiB adicionales (el texto de la model card se interrumpe en ese punto; el total exacto no está disponible).
- GPU medida: RTX 3090. El modelo se ejecuta entero en una sola GPU.
- GPU recomendadas: no disponibles más allá de la RTX 3090; se requiere una GPU con suficiente VRAM para alojar los pesos y la caché KV del contexto configurado.
- Compatibilidad con GPU de consumo: sí, en RTX 3090; no hay datos para otras tarjetas.
- Driver: rama CUDA 13, versión 580 o superior, y NVIDIA Container Toolkit para la imagen Docker. La etiqueta `cuda12.9` sirve para arquitecturas Volta.
- Despliegue: exclusivamente NInfer, rama `master` de `iamwavecut/ninfer-all` desde el commit `acdad409`; las compilaciones estándar de NInfer rechazan el fichero. Se ofrece imagen Docker y compilación propia (`ninfer-serve`, `ninfer` CLI). No hay soporte indicado para vLLM, llama.cpp, Ollama ni TGI.
- Restricciones del motor: al ser un modelo denso, `--expert-residency host|disk` y `--tensor-parallel` lo rechazan.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Gemma 4 31B it QAT Q4_0 (este artefacto) | 31B (denso) | 57.344 tokens configurados | `.ninfer` v3 | Apache 2.0 (licencia Gemma 4) | Solo NInfer `master`; visión y MTP incluidos; 16,4 GiB en GPU |
| google/gemma-4-31B-it-qat-q4_0-gguf | 31B (denso) | no disponible | GGUF | Apache 2.0 (licencia Gemma 4) | Modelo base de Google; sin asistente MTP ni torre de visión empaquetados en este artefacto |
| google/gemma-4-31B-it | 31B (denso) | no disponible | safetensors (presumiblemente) | Apache 2.0 (licencia Gemma 4) | Modelo base sin cuantizar; origen de tokenizer, plantilla de chat y procesadores |
| unsloth/gemma-4-31B-it-qat-GGUF | 31B (denso) | no disponible | GGUF | Apache 2.0 (licencia Gemma 4) | Fuente del asistente MTP (`mtp-gemma-4-31B-it.gguf`) |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de la misma categoría.

## Limitaciones y advertencias

- Dependencia estricta del motor: solo funciona con NInfer `master` desde el commit `acdad409`; las compilaciones estándar de NInfer rechazan el fichero. Esto limita la portabilidad y ata el despliegue a una bifurcación concreta.
- Sin soporte de tensor parallelism ni de residencia de expertos en host o disco; el modelo debe caber entero en una GPU.
- El artefacto no incluye benchmarks publicados; el rendimiento real en latencia y throughput no está verificado en la información disponible.
- Idiomas soportados no documentados en esta ficha; conviene consultar la model card del modelo base de Google.
- Riesgo de alucinación y sesgos: no documentados en la información proporcionada, pero son riesgos habituales de los modelos generativos; no se aportan evaluaciones específicas.
- Licencia: Apache 2.0 con enlace a la licencia específica de Gemma 4; es necesario revisar los términos de uso comercial de dicha licencia antes de usarlo en producción.
- El texto de la model card está truncado en la sección de requisitos de VRAM, por lo que el consumo total exacto con caché KV no está confirmado.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en producción ni validación comunitaria.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WaveCut/gemma-4-31B-it-QAT-Q4_0-MTP-NInfer-v3
- Modelo base QAT Q4_0 GGUF: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-gguf
- Asistente MTP sin cuantizar: https://huggingface.co/google/gemma-4-31B-it-qat-q4_0-unquantized-assistant
- Modelo base sin cuantizar: https://huggingface.co/google/gemma-4-31B-it
- GGUF de Unsloth con el asistente MTP: https://huggingface.co/unsloth/gemma-4-31B-it-qat-GGUF
- Motor NInfer: https://github.com/Neroued/ninfer
- Bifurcación NInfer-all: https://github.com/iamwavecut/ninfer-all
- Commit de referencia: https://github.com/iamwavecut/ninfer-all/commit/acdad409f6c32d5634d714767e05f7e1af96d536
- Configuración de lanzamiento: https://github.com/iamwavecut/ninfer-all/blob/master/configs/gemma4-31b.ini
- Instrucciones de compilación: https://github.com/iamwavecut/ninfer-all#building
- Imagen Docker: https://github.com/iamwavecut/ninfer-all#docker
- Licencia Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
