# sqrtask/tamagotchi-models

## Resumen

sqrtask/tamagotchi-models no es un modelo entrenado desde cero, sino un repositorio de artefactos de conversion y reempaquetado publicado por el usuario sqrtask. Contiene dos modelos de origen distinto preparados para ejecutarse integramente en el navegador: una compilacion de gemma-4 E2B (base google/gemma-4-E2B-it) en ONNX y GGUF, y SDXS-512-0.9 (base IDKiro/sdxs-512-0.9), un modelo de difusion de un solo paso que genera iconos de 512x512. El repo ocupa 5,3 GB y suman 4.647.450.147 parametros segun los safetensors publicados.

El proposito declarado es un tamagotchi offline: la LLM responde preguntas sobre objetos ("¿es un objeto?", "¿cabe en un cubo de 1 m?"), traduce palabras al ingles y describe propiedades (material, comestibilidad), mientras SDXS dibuja el icono correspondiente. Todos los ficheros se sirven desde el CDN de Hugging Face con peticiones HTTP Range (respuesta 206) y cabecera `Access-Control-Allow-Origin: *`, de modo que el navegador los descarga en varios hilos sin backend alguno.

Su relevancia es practica: demuestra un pipeline multimodal LLM + difusion completamente on-device con pesos de 2 bits, WebGPU/WASM, onnxruntime-web y llama.cpp compilado a WASM, con mediciones concretas de latencia y memoria en un equipo de 4 nucleos. Es material de referencia para quien trabaje en inferencia en el cliente, no un modelo de proposito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LLM transformer tipo gemma-4 E2B (capas de atencion global y local, embeddings por capa o PLE) mas un modelo de difusion SDXS-512-0.9 (U-Net con decodificador TAESD) |
| Parametros totales | 4.647.450.147 (~4,65 mil millones) segun safetensors del repositorio |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 posiciones en estas compilaciones; las tablas RoPE se recortaron desde 131.072 posiciones (recorte de -195 MB, con respuestas identicas al modelo nativo hasta el cuarto decimal) |
| Tipos de cuantizacion | ONNX q2f16 (pesos de 2 bits en decodificador y embeddings, decodificador que computa en fp16); GGUF Q3_K_M; int8 con escala por canal en el U-Net de SDXS y int8 en el encoder de texto; variante qat-mobile de Google entrenada con cuantizacion a 2 bits |
| Idiomas soportados | no disponible; la model card reporta pruebas de traduccion desde 8 idiomas sin enumerarlos |
| Licencia | apache-2.0-and-openrail-plus-plus: las carpetas de gemma-4 E2B bajo Apache 2.0 (condiciones de Google), la carpeta `sdxs/` bajo CreativeML OpenRAIL++-M con sus restricciones de uso |
| Formato de pesos | ONNX (onnxruntime-web), GGUF troceado en 5 fragmentos para wllama/llama.cpp, `sdxsunet.pack` + ONNX external data para SDXS, y `.task` de LiteRT en el repo del autor original (no incluido aqui) |

Nota sobre el contexto: la ventana efectiva de estas builds es de 4.096 tokens por decision de empaquetado, no por limitacion del modelo base (131.072 posiciones). En el decodificador ONNX, `files.json` recoge `kv_dims` con tamano de cabeza 512 en las capas de atencion global y 256 en las locales.

## Arquitectura y entrenamiento

El repositorio no entrena nada: solo convierte, cuantiza y trocea pesos de terceros. La parte de lenguaje procede de la build qat-mobile de gemma-4 E2B para ONNX publicada por onnx-community, con decodificador y embeddings separados en dos grafos; los embeddings se dividen en dos tablas, `emb` (2 bits, 1.536 valores por fila, empaquetados 4 valores por byte con los bits menos significativos primero, escala fp16 por bloque de 256, cero en 2 y multiplicador raiz de 1.536) y `ple`, los embeddings por capa (4 bits, 8.960 valores correspondientes a 35 capas por 256, cero en 8 y multiplicador 16). La cuantizacion a 2 bits proviene del entrenamiento con cuantizacion (QAT) de Google, no de este autor. El decodificador calcula en fp16 y requiere una GPU con `shader-f16` y la build `ort.webgpu` con el nuevo WebGPU EP, ya que el antiguo JSEP no soporta pesos de 2 bits.

La variante GGUF parte de unsloth/gemma-4-E2B-it-GGUF en Q3_K_M y se trocea con `llama-gguf-split` en cinco piezas de 512 MB; la segunda pieza es una unica tabla de embeddings por capa de 1,32 GB que no se puede dividir porque superaria el limite de 2 GB por buffer del navegador. Para el cacheo de prefijo se indican `swa_full: true` y `checkpoint_min_step: 0`. La parte de imagen usa SDXS-512-0.9 con U-Net convertida a int8 con escala por canal y reconstruida en el navegador mediante `unpack.js` (que regenera el `.onnx.data` en memoria y lo entrega a onnxruntime via `externalData`); el encoder de texto va en int8 y el decodificador usa TAESD. La generacion es de un solo paso, con los parametros del paso en `meta.json`.

## Capacidades

- Generacion de texto conversacional para preguntas cortas y cerradas, orientada a respuestas de si/no ("¿es un objeto?", "¿cabe en un cubo de 1 m?").
- Clasificacion de propiedades de objetos: material (93 % de acierto medido) y comestibilidad (100 %).
- Traduccion de palabras al ingles desde 8 idiomas, con un 93 % de acierto medido en el conjunto de prueba del autor.
- Descripcion de propiedades de un objeto a partir de su nombre, usada como entrada para el generador de iconos.
- Generacion de imagenes de 512x512 en un solo paso con SDXS, con el encoder de texto int8, el U-Net int8 y el decodificador TAESD.
- Ejecucion integra en el cliente: ONNX en onnxruntime-web (CPU o WebGPU) y GGUF en wllama 3 sobre llama.cpp compilado a WASM.
- Carga por trozos desde el CDN con peticiones Range y CORS abierto, apta para streaming por partes en el navegador.
- No hay soporte documentado de tool calling, function calling, uso como agente, multi-step reasoning ni modo thinking.
- No hay soporte documentado de vision, audio ni entrada multimodal: la parte visual es exclusivamente de salida (sintesis de imagenes).

## Casos de uso

- Juego tipo tamagotchi en el navegador: es el caso para el que se construyeron los artefactos; la LLM valida las acciones del jugador y SDXS dibuja el icono resultante, todo sin conexion tras la descarga inicial.
- Clasificacion de objetos en el edge sin backend: con 1,65 s por consulta y 100 % de acierto en el conjunto de 175 palabras, sirve para filtros on-device donde la privacidad impide enviar datos al servidor.
- Traduccion puntual al ingles en formularios o juegos: el modelo resuelve palabras sueltas con un 93 % de acierto y evita llamar a una API de traduccion.
- Generacion de iconos y avatares en el cliente: SDXS produce imagenes de 512x512 en 5,6 s en CPU, utilizable en editores web o apps de personalizacion sin coste de inferencia en servidor.
- Aplicaciones educativas infantiles offline: el par LLM + difusion permite describir un objeto y mostrarlo visualmente en tabletas o portatiles sin red.
- Pruebas de concepto de inferencia WebGPU/WASM: el repo documenta el empaquetado de pesos de 2 bits, el troceado de GGUF y el cacheo de prefijo, y sirve como referencia para portar otros modelos al navegador.
- PWAs con privacidad estricta: al descargarse los pesos al cliente y no existir endpoint, los datos del usuario no salen del dispositivo, lo que encaja en sectores regulados.
- Prototipado de pipelines multimodales ligeros: la combinacion de modelos de 2 bits y difusion de un paso es un banco de pruebas para reducir memoria en dispositivos con 3-4 GB disponibles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni equivalentes). Las unicas mediciones facilitadas son de ejecucion en navegador, sobre CPU de 4 nucleos con Chromium 141 y backend WASM:

| Compilacion | Carga | Pico de memoria de la pestana | Pregunta si/no en navegador | Calidad medida |
|---|---|---|---|---|
| GGUF Q3_K_M (wllama, CPU) | 2,54 GB | 3,4 GB | 1,65 s | "objeto + cabe en un cubo" correcto en el 100 % de 175 palabras; traduccion desde 8 idiomas 93 %; comestibilidad 100 %; material 93 % |
| ONNX qat-mobile (onnxruntime-web, CPU, embeddings por filas) | 2,10 GB | 3,1 GB | 2,6-3,0 s | respuestas coincidentes con onnxruntime nativo |
| ONNX qat-mobile (WebGPU) | 2,10 GB | ~1,3 GB en el proceso de GPU | no medido (sin tarjeta grafica) | no disponible |
| SDXS (icono 512x512) | ~0,68 GB | no disponible | 5,6 s por icono | no disponible |

## Requisitos de hardware

- Orientado a ejecucion en el cliente: el escenario medido es una CPU de 4 nucleos con Chromium 141 y WASM, con picos de memoria de pestana de 3,4 GB (GGUF) y 3,1 GB (ONNX).
- WebGPU: requiere una GPU con soporte de `shader-f16` y la build `ort.webgpu` con el nuevo WebGPU EP; el EP JSEP antiguo no admite pesos de 2 bits. En ese modo el consumo medido baja a ~1,3 GB en el proceso de GPU (sin latencia medida).
- Para despliegue en servidor, los tamanos de fichero son 2,54 GB (GGUF Q3_K_M) y 2,10 GB (ONNX qat-mobile); una ejecucion en fp16 de los ~4,65 mil millones de parametros rondaria los 9,3 GB de memoria, pero no hay cifras de VRAM publicadas para este repositorio (estimacion a partir del recuento de parametros, no medida).
- No se documentan GPU de datacenter como A100 o H100: el proyecto es explicitamente on-device. En una GPU de consumo, la ruta practica es cargar los GGUF con llama.cpp o los ONNX con onnxruntime; la ruta WebGPU exige verificacion previa de `shader-f16`.
- Opciones de despliegue soportadas: onnxruntime-web (CPU y WebGPU), wllama 3 sobre llama.cpp para los GGUF troceados, llama.cpp nativo con los mismos GGUF, onnxruntime nativo para los ONNX y, en el repo original de Google, LiteRT/MediaPipe con el fichero `.task` de 2,0 GB (solo WebGPU). No se mencionan vLLM, TGI ni Ollama.
- Restriccion de memoria relevante: el navegador impone un limite de 2 GB por buffer, lo que obliga a trocear el GGUF y a leer las filas de embeddings por indice desde OPFS o por peticiones Range en lugar de cargar la tabla completa.
- Latencias medidas: 1,65 s por consulta booleana en GGUF/CPU, 2,6-3,0 s en ONNX/CPU y 5,6 s por icono de 512x512 con SDXS. No hay datos de throughput agregado.

## Comparativa con modelos similares

| Modelo | Parametros / tamano | Contexto | Formato y destino | Licencia | Notas |
|---|---|---|---|---|---|
| sqrtask/tamagotchi-models | 4,65 mil millones; 5,3 GB de repo | 4.096 (recortado de 131.072) | ONNX + GGUF + pack; navegador | apache-2.0-and-openrail-plus-plus | Incluye LLM y difusion; 0 descargas y 0 likes en el momento de la consulta |
| onnx-community/gemma-4-E2B-it-qat-mobile-ONNX | mismo modelo base | no disponible | ONNX | Apache 2.0 | Origen de la parte ONNX; aqui se le recortan las tablas RoPE y se anade `files.json` |
| unsloth/gemma-4-E2B-it-GGUF | mismo modelo base | no disponible | GGUF | Apache 2.0 | Origen de la parte GGUF Q3_K_M; aqui se trocea para wllama |
| litert-community/gemma-4-E2B-it-litert-lm | mismo modelo base | no disponible | `.task` (LiteRT/MediaPipe) | Apache 2.0 | Alternativa WebGPU no modificada, 2,0 GB, citada en la model card |
| IDKiro/sdxs-512-0.9 | no disponible | no aplica | difusion, 512x512 | CreativeML OpenRAIL++-M | Origen de la parte de generacion de imagenes; aqui se cuantiza a int8 |

## Limitaciones y advertencias

- El repositorio tiene 0 descargas y 0 likes y no declara pipeline: es material auxiliar de un proyecto concreto, sin validacion externa ni mantenimiento garantizado.
- La ventana de contexto esta recortada a 4.096 posiciones; prompts mas largos no estan soportados por estas builds aunque el modelo base llegue a 131.072.
- Los pesos de 2 bits solo funcionan con el nuevo WebGPU EP (`ort.webgpu`) y GPU con `shader-f16`; en equipos sin ese soporte hay que usar la ruta GGUF o ONNX en CPU, con latencias de 1,65-3,0 s por consulta.
- La ruta ONNX no puede cargar la tabla completa de embeddings en WASM de 32 bits por falta de memoria, lo que obliga a leer filas por indice; cualquier integracion que ignore `files.json` fallara.
- Los GGUF deben entregarse como los cinco fragmentos en orden y con los parametros de cacheo indicados (`swa_full: true`, `checkpoint_min_step: 0`); el segundo fragmento no se puede dividir ni recomprimir sin romper la carga.
- Las capacidades declaradas son de clasificacion cerrada y traduccion de palabras; no hay evaluacion de razonamiento, codigo o matematicas, ni datos de robustez frente a entradas adversarias.
- Riesgo de alucinacion no cuantificado: no se publican tasas de error fuera de los conjuntos internos de 175 palabras, y no se documentan sesgos por idioma, genero o cultura.
- Idiomas: la model card solo menciona 8 idiomas de origen para la prueba de traduccion, sin enumerarlos ni declarar cobertura del resto; no se garantiza calidad fuera de ese conjunto.
- Licencias: las carpetas de gemma-4 E2B siguen Apache 2.0 con las condiciones adicionales de Google, y `sdxs/` queda sujeta a CreativeML OpenRAIL++-M, con las restricciones de uso de esa licencia; el uso comercial debe revisarse por separado en cada parte.
- El autor declara que los modelos originales son de terceros y que solo publica sus adaptaciones, por lo que la responsabilidad sobre sesgos y datos de entrenamiento recae en los emisores originales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/sqrtask/tamagotchi-models
- Licencia del repositorio: https://huggingface.co/sqrtask/tamagotchi-models/blob/main/LICENSE.md
- Modelo base ONNX de partida: https://huggingface.co/onnx-community/gemma-4-E2B-it-qat-mobile-ONNX
- Modelo base GGUF de partida: https://huggingface.co/unsloth/gemma-4-E2B-it-GGUF
- Modelo base de difusion: https://huggingface.co/IDKiro/sdxs-512-0.9
- Build de Google para WebGPU (LiteRT/MediaPipe), no modificada: https://huggingface.co/litert-community/gemma-4-E2B-it-litert-lm
- Condiciones de licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Codigo y mediciones del proyecto (rutas `appendix/tamagotchi/` y `appendix/small_imagegen/`): no disponible como enlace directo en la informacion proporcionada
- Busqueda web: los resultados obtenidos (Sketchfab, PixAI, CGDream) corresponden a modelos 3D y LoRAs de tematica Tamagotchi sin relacion con este repositorio, y el articulo de Futurism sobre Claude Code tampoco esta vinculado; no aportan enlaces relevantes.
