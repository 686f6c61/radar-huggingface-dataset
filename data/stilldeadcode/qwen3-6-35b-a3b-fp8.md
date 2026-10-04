# StillDeadcode/qwen3.6-35b-a3b-fp8

## Resumen

StillDeadcode/qwen3.6-35b-a3b-fp8 es un contenedor `.rad` de 34,63 GiB para el motor de inferencia radiance, orientado a GPU AMD con ROCm y arquitectura RDNA4. No es un entrenamiento nuevo ni un ajuste fino: es la conversion byte a byte del checkpoint FP8 publicado por Qwen (Qwen/Qwen3.6-35B-A3B-FP8) al formato binario propietario de radiance, conservando los pesos cuantizados en FP8 E4M3 con escala por bloque de 128x128, la torre de vision de 27 bloques en bf16 y la cabeza MTP (multi-token prediction) para decodificacion especulativa.

El modelo subyacente es un transformer de mezcla de expertos (MoE) de 35B parametros totales y aproximadamente 3B activos por token (denominacion A3B), con 256 expertos enrutados. La model card declara 262.144 tokens de contexto entrenados y 200.000 probados, ademas de soporte multimodal de imagen y video en peticiones de chat (`image_url` y `video_url`), tool calling y salida estructurada a traves de una API compatible con OpenAI. La licencia es Apache 2.0, la misma que el modelo base.

Su relevancia es acotada y muy especifica: cubre el hueco de servir un MoE multimodal grande en hardware AMD de gama profesional (RDNA4, gfx1201) con decodificacion especulativa integrada, un escenario donde el ecosistema de herramientas habituales (vLLM, llama.cpp, Ollama, TGI) esta mucho menos asentado en ROCm. El repositorio no tiene descargas ni valoraciones, y no incluye resultados de benchmarks, por lo que se trata de una conversion de terceros sin validacion independiente en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con torre de vision de 27 bloques (bf16) y cabeza MTP para decodificacion especulativa |
| Parametros totales | 35B (segun la denominacion del modelo; el dato exacto no figura en la model card) |
| Parametros activos | Aproximadamente 3B (denominacion A3B) |
| Expertos enrutados | 256 |
| Longitud de contexto | 262.144 tokens entrenados; 200.000 probados |
| Tipos de cuantizacion | FP8 E4M3 con escala bf16 por bloque de 128x128 (todas las capas lineales, los 256 expertos y el `lm_head`); torre de vision en bf16; cabeza de borrador MTP en 2 bits (`u2`, grupo 128, escala f16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | `.rad` (contenedor binario del motor radiance); no se distribuye en safetensors ni GGUF |
| Tamano del contenedor | 34,63 GiB (`qwen3.6-35b-a3b-fp8.rad`); repositorio de 37,2 GB |
| Modelo base | Qwen/Qwen3.6-35B-A3B-FP8 |
| Motor de inferencia | radiance (ROCm, RDNA4 / gfx1201) |

## Arquitectura y entrenamiento

La model card no describe el proceso de entrenamiento del modelo subyacente: no se indican numero de tokens, composicion del dataset, ni si hubo RLHF, DPO u otra fase de alineamiento. Lo que si se detalla es la arquitectura en tiempo de inferencia: un transformer de mezcla de expertos con 256 expertos enrutados, cuyas capas lineales se almacenan en FP8 E4M3 con una escala bf16 compartida por cada bloque de 128x128. El `lm_head` tambien se convierte a FP8 por bloques aplicando la receta de conversion, mientras que el resto de los pesos se conserva tal y como viene en el checkpoint original.

La innovacion practica de este contenedor es la integracion de dos componentes adicionales en un unico archivo. Por un lado, la cabeza MTP del modelo, que actua como especulador y genera borradores con una copia en 2 bits del `lm_head`; radiance elige la profundidad de especulacion de forma automatica (`--num-speculative-tokens N`, con `0` para desactivarla). Por otro, la torre de vision de 27 bloques en bf16, que habilita entradas de imagen y video dentro de las peticiones de chat. La conversion se realizo con `rad-convert` y una receta de dos lineas, y el autor afirma que es reproducible byte a byte con la imagen Docker de radiance en el commit 93bbe22.

## Capacidades

- Generacion de texto y razonamiento multi-turno con ventanas de contexto de hasta 200.000 tokens probados.
- Procesamiento multimodal de imagen y video: la pipeline declarada es `image-text-to-text` y la API acepta partes `image_url` y `video_url` en los mensajes de chat.
- Tool calling / function calling a traves de la API compatible con OpenAI (`/v1/chat/completions`, `/v1/completions`).
- Salida estructurada (structured output) en las respuestas del servidor.
- Decodificacion especulativa con la cabeza MTP, con profundidad ajustable o desactivable.
- Capacidades de mezcla de expertos: 256 expertos enrutados con unos 3B parametros activos por token, lo que reduce el coste de computo por token frente a un modelo denso de 35B.
- Capacidades multilingues: no disponible (no se especifica ningun listado de idiomas en la informacion proporcionada).

## Casos de uso

- Atencion al cliente automatizada de largo recorrido: con 200.000 tokens de contexto probados, el modelo puede mantener conversaciones multi-turno con historiales extensos, documentacion de producto adjunta e imagenes enviadas por el usuario en la misma sesion.
- Analisis de documentos con elementos visuales: la torre de vision permite procesar capturas, diagramas, facturas escaneadas o paginas maquetadas junto al texto extraido, en un unico flujo `image-text-to-text`.
- Generacion de codigo integrada en pipelines: el soporte de tool calling y de salida estructurada permite invocar herramientas del repositorio (linters, compiladores, APIs internas) y devolver resultados en formato parseable por CI/CD.
- Agentes multi-paso: la combinacion de contexto largo, tool calling y salida estructurada encaja en bucles de razonamiento con varias llamadas encadenadas, donde el modelo mantiene el estado de la tarea a lo largo de la ventana.
- Revision de video y contenido audiovisual: las partes `video_url` de la API permiten resumir o etiquetar clips, util en moderacion de contenido o catalogacion de archivos multimedia.
- Inferencia on-premise sobre hardware AMD: organizaciones con nodos ROCm/RDNA4 pueden servir el modelo sin depender de CUDA, con dos tarjetas de 32 GB y pesos FP8.
- Servicio de baja latencia con decodificacion especulativa: en escenarios de chat interactivo, activar la cabeza MTP reduce el numero de pasos de decodificacion necesarios por token generado.
- Procesamiento por lotes moderado: el ejemplo de arranque usa `--max-num-seqs 8`, adecuado para cargas de trabajo de ocho secuencias concurrentes por instancia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluacion, y tampoco datos medidos de latencia o throughput mas alla de la configuracion de ejemplo. Los resultados de la busqueda web asociada no contenian informacion tecnica utilizable sobre este modelo.

## Requisitos de hardware

- Tamano de pesos: 34,63 GiB en el contenedor `.rad`; el repositorio completo ocupa 37,2 GB.
- VRAM: el autor indica que el modelo completo cabe en dos tarjetas de 32 GB. A esa cifra hay que sumar la cache KV en FP8, cuyo consumo depende de la longitud de contexto y del numero de secuencias concurrentes (`--max-num-seqs 8` en el ejemplo), por lo que la VRAM agregada requerida no esta cuantificada en la informacion disponible.
- GPU probadas: 2x Radeon AI PRO R9700 (gfx1201, RDNA4), en ROCm.
- GPU consumer: no cabe en una unica GPU de 24 GB (RTX 4090, RTX 3090) por el tamano de los pesos; ademas el contenedor y el motor estan orientados a ROCm sobre RDNA4, no a CUDA.
- Opciones de despliegue: exclusivamente el motor radiance con su servidor compatible con OpenAI. No hay soporte publicado para vLLM, llama.cpp, Ollama ni TGI en este formato.
- Comando de servicio de referencia: `radiance --model qwen3.6-35b-a3b-fp8.rad --tp 2 --max-model-len 200000 --kv-cache-dtype fp8 --max-num-seqs 8 --host 0.0.0.0 --port 8000`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StillDeadcode/qwen3.6-35b-a3b-fp8 | 35B totales / ~3B activos | 262.144 entrenados, 200.000 probados | `.rad` (radiance) | Apache 2.0 | HuggingFace, 0 descargas y 0 valoraciones |
| Qwen/Qwen3.6-35B-A3B-FP8 (modelo base) | 35B totales / ~3B activos | no disponible en la informacion proporcionada | Checkpoint FP8 original | Apache 2.0 | HuggingFace |
| Alternativas equivalentes de otros fabricantes | no disponible | no disponible | no disponible | no disponible | no disponible |

No hay datos de rendimiento publicados que permitan comparar este contenedor con alternativas de la misma categoria. La unica diferencia documentada frente al modelo base es el formato de empaquetado, la integracion de la cabeza MTP y la torre de vision en un solo archivo, y el motor de ejecucion soportado.

## Limitaciones y advertencias

- No es un modelo oficial de Qwen: se trata de una conversion de terceros (StillDeadcode) del checkpoint FP8, sin validacion independiente ni descargas registradas en HuggingFace.
- El formato `.rad` solo es utilizable con el motor radiance sobre ROCm y arquitecturas RDNA4; no se puede cargar con vLLM, llama.cpp, Ollama, TGI ni transformers en su estado publicado.
- No se han publicado benchmarks, por lo que no hay evidencia publica sobre calidad, tasa de alucinacion o degradacion tras la conversion a FP8.
- El contexto probado (200.000 tokens) es inferior al contexto entrenado declarado (262.144 tokens); superar los 200.000 no esta validado por el autor.
- No hay informacion sobre idiomas soportados, sesgos conocidos ni composicion del dataset de entrenamiento del modelo subyacente.
- Riesgo de alucinacion: inherente a los modelos generativos de esta familia; no cuantificado en la informacion disponible.
- Licencia Apache 2.0: permite uso comercial, modificacion y redistribucion, con la obligacion habitual de conservar el aviso de licencia y el fichero `LICENSE`. Conviene verificar las condiciones del modelo base por si el autor original anadiese terminos adicionales.
- La reproducibilidad byte a byte declarada depende del commit 93bbe22 del repositorio de radiance y de la imagen Docker correspondiente; cambios posteriores en el conversor o en la receta pueden alterar el resultado.
- El rendimiento en produccion depende del soporte de ROCm y RDNA4 de la version concreta del motor, un ecosistema con menor madurez que el de CUDA.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StillDeadcode/qwen3.6-35b-a3b-fp8
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B-FP8
- Repositorio del motor radiance: no disponible como URL en la informacion proporcionada (la model card solo menciona el commit 93bbe22)
- Papers, blogs y demos adicionales: no disponible; los resultados de la busqueda web no contenian enlaces tecnicos relevantes sobre este modelo
