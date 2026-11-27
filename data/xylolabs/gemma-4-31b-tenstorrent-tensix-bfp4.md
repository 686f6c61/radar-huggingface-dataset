# Xylolabs/gemma-4-31B-Tenstorrent-Tensix-BFP4

## Resumen

Gemma-4-31B-Tenstorrent-Tensix-BFP4 es una cuantizacion del modelo multimodal google/gemma-4-31B, publicada por Xylolabs, especificamente empaquetada para su ejecucion sobre aceleradores Tenstorrent Tensix (arquitecturas Wormhole y Blackhole). El modelo resuelve el problema de desplegar un modelo de 31 mil millones de parametros en hardware NPU con memoria limitada, reduciendo el peso empaquetado de 61,39 GB en bf16 a 23,534 GB mediante cuantizacion de punto flotante en bloque (block floating point, BFP).

La cuantizacion emplea GPTQ con busqueda de exponente por bloque para las proyecciones MLP en formato `bfloat4_b` (BFP4), mientras que las proyecciones de atencion se cuantizan a `bfloat8_b` (BFP8) mediante redondeo al mas cercano. El cabezal LM, los embeddings, las normas y la torre de vision permanecen en bf16. El checkpoint mantiene la modalidad image-text-to-text del modelo base, con un total de 32.682.375.020 parametros.

Es relevante ahora porque demuestra que la cuantizacion BFP4 especifica para hardware puede superar en fidelidad a esquemas de proposito general como Q4_K_M de llama.cpp (KL media de 0,0281 frente a 0,0319), manteniendo un tamano competitivo. El modelo se distribuye bajo licencia Apache 2.0 y se publica con las herramientas de empaquetado y verificacion necesarias para su despliegue en Tensix.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivado de google/gemma-4-31B; pesos cuantizados para Tensix |
| Parametros totales | 32.682.375.020 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BFP4 (`bfloat4_b`) en MLP gate/up/down; BFP8 (`bfloat8_b`) en atencion q/k/o/v; bf16 en LM head, embeddings, normas y vision |
| Idiomas soportados | no disponible (la evaluacion cubre texto en ingles y coreano) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (empaquetado Tensix, 23,534 GB); repo de 65,4 GB |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de Google (Gemma 4, 31B) capaz de procesar imagen y texto. Xylolabs no reentrena el modelo: aplica un pipeline de cuantizacion post-entrenamiento (`tensix-bfp-gptq`) que convierte las proyecciones lineales a formatos de punto flotante en bloque nativos de Tensix. Las 60 capas del modelo tienen sus proyecciones MLP (gate, up, down) en BFP4, mientras que las proyecciones de atencion q, k y o (60 capas) y v (50 capas) quedan en BFP8. La torre de vision (`vision_tower`, `embed_vision`) y el resto de tensores se mantienen en bf16 sin cambios respecto al modelo base.

La innovacion tecnica principal es el uso de GPTQ combinado con una busqueda de exponente por bloque para los tensores BFP4, en lugar de un redondeo uniforme. El fichero `quant4.json` documenta el formato de cada proyeccion. La verificacion se realiza mediante `pack_tensix.py` (que comprueba cada matriz contra su representacion en dispositivo, opcionalmente con ida y vuelta por DRAM) y `verify_grid.py` (validacion de la rejilla solo con torch). El empaquetado se ha comprobado con `ttnn` 0.81.1 sobre `ttsim`, el simulador Blackhole de Tenstorrent. No se documentan datos de entrenamiento adicionales, tokens de preentrenamiento ni fases de RLHF/DPO en la informacion disponible.

## Capacidades

- Generacion de texto autoregresiva: el checkpoint es el modelo preentrenado, sin plantilla de chat, por lo que continua texto en lugar de mantener conversaciones.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), heredado del modelo base Gemma 4.
- Razonamiento y conocimiento general propios de un modelo de 31B, sujetos a la degradacion introducida por la cuantizacion BFP4/BFP8.
- Capacidades multilingues: la evaluacion incluye texto en ingles y coreano, aunque no se publica la lista oficial de idiomas.
- No se documenta soporte de tool calling, function calling, agentes ni modos de pensamiento extendido en la informacion disponible.
- No se documentan capacidades de audio.

## Casos de uso

- Despliegue en aceleradores Tenstorrent: el modelo esta empaquetado para NPU Wormhole y Blackhole, lo que permite ejecutar un modelo de 31B en hardware Tensix con 23,534 GB de pesos en lugar de 61,39 GB en bf16.
- Investigacion en cuantizacion de bajo bit: util como referencia reproducible para comparar BFP4 con GPTQ frente a esquemas como Q4_K_M, con scripts de verificacion incluidos.
- Procesamiento de documentos con imagen: al conservar la torre de vision en bf16, puede emplearse en tareas de descripcion de imagenes o extraccion de informacion de capturas y escaneos.
- Generacion de texto por continuacion (completado): adecuado para tareas de autocompletado o generacion de parrafos donde no se requiere formato conversacional.
- Evaluacion comparativa de hardware: sirve para medir latencia y throughput de NPU Tensix frente a GPU en cargas de 31B cuantizado.
- Prototipado de pipelines multimodales en entornos con memoria limitada: la reduccion de tamano permite cargar el modelo en dispositivos donde bf16 no cabria.
- Investigacion academica sobre fidelidad de cuantizacion: los datos de KL y top-1 publicados permiten reproducir experimentos de degradacion.

## Benchmarks y rendimiento

| Modelo | Tamano (GB) | KL media a BF16 | Top-1 (%) |
|---|---:|---:|---:|
| BF16 (google/gemma-4-31B) | 61,39 | 0 | 100 |
| Este modelo (BFP4 MLP / BFP8 attention) | 23,534 | 0,02813 | 93,55 |
| Q4_K_M (llama.cpp) | 18,687 | 0,03187 | 93,01 |

Las metricas de KL y top-1 se calculan sobre 8.184 posiciones de texto en ingles y coreano (WikiText-2 test y Wikipedia en coreano), como texto plano. El modelo Q4_K_M de comparacion se genero desde el mismo checkpoint con llama.cpp v0.9.0 (`cd959bae`) sin matriz de importancia. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM/DRAM estimada: 23,534 GB de pesos empaquetados para Tensix; el repo completo ocupa 65,4 GB. Para carga en bf16 se requieren aproximadamente 61,39 GB.
- Hardware objetivo: NPU Tenstorrent Tensix, arquitecturas Wormhole y Blackhole. Verificado con `ttnn` 0.81.1 sobre `ttsim` (simulador Blackhole).
- GPU consumer: no se documenta soporte ni rendimiento en GPU consumer; el empaquetado es especifico de Tensix.
- Opciones de despliegue: `tensix-runner` v0.1.0 y kernels `tensix-kernels` v0.1.0; el quickstart con `transformers` carga el modelo en bf16 con `device_map="auto"`, no ejecuta los kernels BFP.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano en disco | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (BFP4 Tensix) | 32,68B | no disponible | 23,534 GB (Tensix) | Apache 2.0 | safetensors Tensix |
| google/gemma-4-31B (bf16) | 31B aprox. | no disponible | 61,39 GB | Apache 2.0 | safetensors |
| Q4_K_M llama.cpp (mismo checkpoint) | 32,68B | no disponible | 18,687 GB | Apache 2.0 | GGUF |

La comparacion se limita al mismo modelo base en distintas precisiones, ya que no se dispone de datos de otros modelos de 31B con cuantizacion BFP4 para Tensix. Frente a Q4_K_M, este modelo ocupa mas espacio (23,534 frente a 18,687 GB) pero obtiene mejor fidelidad (KL 0,02813 frente a 0,03187 y top-1 93,55 % frente a 93,01 %).

## Limitaciones y advertencias

- Es un modelo preentrenado sin plantilla de chat: no esta ajustado para instrucciones ni dialogos; su uso conversacional requeriria ajuste adicional.
- La cuantizacion introduce degradacion medible: top-1 del 93,55 % frente al 100 % del bf16, con KL media de 0,02813.
- El empaquetado esta disenado exclusivamente para Tensix; no es directamente utilizable en GPU o CPU sin reconversion.
- No se documentan sesgos conocidos ni evaluaciones de seguridad en la informacion disponible.
- Riesgo de alucinacion inherente al modelo base, no cuantificado en la model card.
- No se especifica la longitud de contexto soportada ni la lista oficial de idiomas.
- La licencia Apache 2.0 se aplica segun la model card del modelo base; el repositorio original de Google no incluye fichero LICENSE, por lo que el autor incluye el texto estandar y un fichero NOTICE con los cambios.
- El soporte se ha verificado sobre simulador (`ttsim`), no necesariamente en silicio fisico segun la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Xylolabs/gemma-4-31B-Tenstorrent-Tensix-BFP4
- Modelo base: https://huggingface.co/google/gemma-4-31B
- Repositorio de cuantizacion: https://github.com/XylolabsInc/tensix-bfp-gptq
- Commit de referencia del codigo: https://github.com/XylolabsInc/tensix-bfp-gptq/tree/5c52065fffec88021a0703a1bfe5266e4c674711
- Release tensix-bfp-gptq v0.1.0: https://github.com/XylolabsInc/tensix-bfp-gptq/releases/tag/v0.1.0
- Release tensix-kernels v0.1.0: https://github.com/XylolabsInc/tensix-kernels/releases/tag/v0.1.0
- Release tensix-runner v0.1.0: https://github.com/XylolabsInc/tensix-runner/releases/tag/v0.1.0
- Documentacion de Tenstorrent: https://docs.tenstorrent.com
- Paper Gemma 4 Technical Report: https://arxiv.org/abs/2607.02770
