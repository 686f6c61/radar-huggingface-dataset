# Xylolabs/Qwen3-VL-4B-Instruct-Tenstorrent-Tensix

## Resumen

Qwen3-VL-4B-Instruct-Tenstorrent-Tensix es una cuantizacion del modelo multimodal Qwen3-VL-4B-Instruct de Alibaba Qwen, adaptada por Xylolabs para ejecutarse en aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo original es un vision-language model de 4.000 millones de parametros que procesa pares imagen-texto y genera respuestas textuales; esta version preserva la torre de vision en bf16 y cuantiza el decoder para reducir el peso y aprovechar los formatos de bloque propietarios del hardware Tensix.

La relevancia de esta ficha radica en que es una de las pocas distribuciones publicas de un VLM de Qwen3 cuantizado especificamente para NPUs de Tenstorrent, un ecosistema alternativo a GPU que gana traccion en inferencia de borde y centros de datos de bajo consumo. El paquete ocupa 3,294 GB en formato empaquetado (frente a 8,04 GB del bf16 original) y mantiene una divergencia media de KL de 0,0284 respecto al modelo base en bf16, lo que la situa en un regimen de cuantizacion agresiva pero con degradacion medible y acotada.

Los pesos se distribuyen en la carpeta `bfp4/` con MLP en `bfloat4_b`, atencion en `bfloat8_b` y el resto en bf16. La licencia es Apache 2.0, heredada del modelo base, y el repositorio incluye herramientas de empaquetado y verificacion (`pack_tensix.py`, `verify_grid.py`) del proyecto tensix-bfp-gptq v0.1.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (vision encoder + decoder de lenguaje); detalles internos del base no disponibles en la informacion proporcionada |
| Parametros totales | 4B (segun denominacion del modelo base Qwen3-VL-4B-Instruct) |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLP en bfloat4_b, atencion en bfloat8_b, resto en bf16 (carpeta `bfp4/`); torre de vision en bf16 |
| Idiomas soportados | en, ko (segun tags del repositorio) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado Tensix en `bfp4/`) |

## Arquitectura y entrenamiento

El modelo base Qwen3-VL-4B-Instruct es un vision-language model de la familia Qwen3-VL, que combina un codificador de vision con un decoder de lenguaje transformer. Esta distribucion no reentrena el modelo: aplica una cuantizacion post-entrenamiento con el pipeline tensix-bfp-gptq v0.1.0 de Xylolabs, que produce pesos en formatos de bloque `bfloat4_b` y `bfloat8_b` compatibles con las NPUs Tensix. La torre de vision se mantiene en bf16 sin cuantizar, de modo que las 17 preguntas de imagen referenciadas en la model card se evaluan con el decoder cuantizado y el encoder visual original.

La innovacion tecnica principal es el esquema de cuantizacion mixta por modulo: las capas MLP (las de mayor coste computacional y menor sensibilidad aparente) se comprimen a 4 bits en bloque, mientras que la atencion se mantiene en 8 bits en bloque para preservar la fidelidad de las representaciones. El resultado son 3,294 GB empaquetados con una KL media de 0,0284 frente al bf16, frente a los 2,497 GB y KL 0,0403 de una cuantizacion Q4_K_M de llama.cpp. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base dentro de la informacion proporcionada.

## Capacidades

- Generacion de texto e imagen-a-texto: el pipeline declarado es `image-text-to-text`, con soporte de conversaciones multimodales via `apply_chat_template`.
- Comprension de imagenes: descripcion, respuesta a preguntas visuales y tareas de vision-lenguaje sobre imagenes individuales.
- Procesamiento de lenguaje natural en ingles y coreano (idiomas declarados en los tags).
- Integracion con `transformers` mediante `AutoModelForImageTextToText` y `AutoProcessor`.
- Ejecucion en hardware Tenstorrent Tensix (Wormhole, Blackhole) mediante las herramientas de empaquetado y verificacion incluidas.
- No se documenta en la informacion disponible soporte explicito de tool calling, function calling, agentes multi-paso, modo thinking, audio ni vision de video.

## Casos de uso

- Descripcion automatica de imagenes en catalogo: el modelo puede recibir una imagen y devolver una descripcion en una frase, como muestra el ejemplo de la model card, adecuado para generar metadatos de productos en ingles o coreano.
- Respuesta a preguntas visuales (VQA) en ingles y coreano: util para asistentes que responden sobre el contenido de una imagen en entornos donde el hardware disponible es una NPU Tensix en lugar de una GPU.
- Moderacion de contenido visual: clasificacion y descripcion de imagenes subidas por usuarios, con el decoder cuantizado reduciendo el coste por inferencia en despliegues de borde.
- Accesibilidad: generacion de descripciones textuales de imagenes para lectores de pantalla, aprovechando la torre de vision en bf16 para mantener fidelidad visual.
- Procesamiento documental ligero: extraccion de informacion de capturas o fotos de documentos en ingles y coreano, con la ventaja de que el modelo cabe en 3,3 GB empaquetados.
- Despliegue en infraestructura Tenstorrent: escenarios donde el objetivo es ejecutar un VLM en Wormhole o Blackhole sin depender de CUDA, usando los scripts `pack_tensix.py` y `verify_grid.py` para validar los pesos empaquetados.
- Prototipado multimodal en `transformers`: el ejemplo de la model card permite cargar el modelo con `dtype="bfloat16"` y `device_map="auto"` para pruebas rapidas antes de portar a Tensix.

## Benchmarks y rendimiento

| Metrica | bfp4 (esta distribucion) | bf16 (original) | Q4_K_M (llama.cpp) |
|---|---|---|---|
| Tamano empaquetado (GB) | 3,294 | 8,04 | 2,497 |
| KL media frente a BF16 | 0,0284 | 0 | 0,0403 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La unica evaluacion cuantitativa reportada es la divergencia KL frente al modelo en bf16 y el tamano empaquetado. La model card menciona 17 preguntas de imagen evaluadas con el decoder cuantizado y la torre de vision del modelo base, pero no publica las puntuaciones obtenidas.

## Requisitos de hardware

- VRAM estimada: el paquete `bfp4/` ocupa 3,294 GB; el bf16 original requiere 8,04 GB. La inferencia en `transformers` con `dtype="bfloat16"` y `device_map="auto"` necesita al menos el tamano del paquete en memoria del dispositivo.
- GPU recomendadas: no especificadas en la informacion disponible para la ruta `transformers`; el destino principal es hardware Tenstorrent Tensix (Wormhole, Blackhole).
- Cabe en GPU de consumo: con 3,3 GB empaquetados es plausible en GPUs consumer con 8 GB o mas, aunque la informacion proporcionada no lo confirma ni lista modelos concretos.
- Opciones de despliegue: `transformers` (`AutoModelForImageTextToText`, `AutoProcessor`), herramientas Tensix (`pack_tensix.py`, `verify_grid.py` con flag `--device` para round-trip de valores empaquetados). No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI en la informacion disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano empaquetado | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| Qwen3-VL-4B-Instruct-Tenstorrent-Tensix (esta ficha) | 4B | no disponible | 3,294 GB (bfp4) | Apache 2.0 | Tenstorrent Tensix |
| Qwen3-VL-4B-Instruct (base, bf16) | 4B | no disponible | 8,04 GB | Apache 2.0 | GPU / CPU |
| Qwen3-VL-4B-Instruct Q4_K_M (llama.cpp) | 4B | no disponible | 2,497 GB | Apache 2.0 | CPU / GPU via llama.cpp |

La comparativa se limita a las tres variantes referenciadas en la model card. No se dispone de datos de rendimiento (benchmarks) para comparar calidad entre ellas mas alla de la KL frente a bf16, ni de informacion sobre modelos alternativos de otros autores en la informacion proporcionada.

## Limitaciones y advertencias

- La cuantizacion introduce degradacion medible: KL media de 0,0284 frente a bf16, con posibles errores en tareas sensibles a precision numerica.
- La evaluacion publicada es limitada: 17 preguntas de imagen, sin benchmarks estandar de razonamiento, codigo o matemáticas.
- Idiomas declarados restringidos a ingles y coreano; el rendimiento en castellano no esta documentado.
- Riesgo de alucinacion inherente a los VLM, no cuantificado en la informacion disponible.
- La torre de vision permanece en bf16, por lo que el ahorro de memoria se concentra en el decoder; el consumo total no es tan bajo como el tamano empaquetado podria sugerir.
- Dependencia de hardware y tooling especifico de Tenstorrent para aprovechar los formatos `bfloat4_b` y `bfloat8_b`; la ruta `transformers` esta documentada pero el destino principal es Tensix.
- El repositorio base no incluia fichero de licencia; el autor anade el texto Apache 2.0 estandar y un `NOTICE` con los cambios. Conviene revisar ambos antes de uso comercial.
- Modelo con 97 descargas y 0 likes en el momento de la consulta: ecosistema pequeno, poca validacion comunitaria.
- No se documenta soporte de tool calling, agentes ni contexto largo, lo que limita su uso en pipelines de automatizacion complejos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3-VL-4B-Instruct-Tenstorrent-Tensix
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct
- Codigo tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0
- Herramientas de empaquetado: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/v0.1.0/tools
- Documentacion Tenstorrent: https://docs.tenstorrent.com
- Paper Qwen3 Technical Report: https://arxiv.org/abs/2505.09388
- Paper Qwen2.5-VL Technical Report: https://arxiv.org/abs/2502.13923
- Paper Qwen2-VL: https://arxiv.org/abs/2409.12191
- Paper Qwen-VL: https://arxiv.org/abs/2308.12966
