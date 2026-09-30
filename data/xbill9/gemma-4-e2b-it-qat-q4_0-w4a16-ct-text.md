# xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text

## Resumen

Este repositorio es un reempaquetado no oficial del modelo `xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct`, publicado por el usuario xbill9 de forma independiente a Google. Se trata de un checkpoint de Gemma 4 en su variante E2B (instruction-tuned) que ha pasado por entrenamiento consciente de cuantizacion (QAT) y se distribuye en formato W4A16 (int4) bajo el contenedor compressed-tensors. La particularidad de este repack es que elimina por completo las torres de vision y audio del modelo base, de modo que queda cargable como un `Gemma4ForCausalLM` estrictamente de texto.

El modelo conserva 1.092 tensores del modelo de lenguaje, byte a byte identicos a los del repack multimodal original, y descarta 1.411 tensores correspondientes a `model.vision_tower.*`, `model.audio_tower.*`, `model.embed_vision.*` y `model.embed_audio.*` (0,88 GiB). El resultado pasa de 7,00 GiB a 6,11 GiB de pesos y suma 4.628.569.379 parametros segun los safetensors del repositorio. Al no existir ruta multimodal, no hacen falta los flags `--language-model-only` ni `--limit-mm-per-prompt` al servirlo.

Su relevancia practica es la de ofrecer una variante mas ligera para despliegue puramente textual sobre vLLM, con una cache KV documentada de 711.539 tokens en una unica NVIDIA T4, lo que la hace atractiva para entornos con hardware modesto que no necesitan procesamiento de imagen o audio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Gemma 4, variante de texto `gemma4_text` (clase `Gemma4ForCausalLM`); el modelo base es multimodal y en este repack se han eliminado las torres de vision y audio |
| Parametros totales | 4.628.569.379 (segun los safetensors del repositorio) |
| Parametros activos | No aplica (no se describe como MoE en la informacion disponible) |
| Longitud de contexto | No especificada en la informacion disponible; el despliegue documentado usa `--max-model-len 16384` |
| Tipos de cuantizacion | W4A16 (int4, formato Q4_0) con quantization-aware training (QAT); empaquetado compressed-tensors |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (enlace a la licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license) |
| Formato de pesos | safetensors (compressed-tensors); tamano del repositorio 6,6 GB y 6,11 GiB de pesos de texto |
| Modelo base | xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct (relacion: quantized) |
| Libreria declarada | vllm |
| Repack | No oficial, creado y publicado por xbill9, sin afiliacion ni respaldo de Google |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder de la familia Gemma 4. El repositorio base es multimodal (incluye torres de vision y audio), pero este repack conserva unicamente el modelo de lenguaje bajo `model.language_model.*`, con los nombres de tensor intactos, y expone la clase `Gemma4ForCausalLM`. Los tensores del lenguaje son identicos byte a byte a los del repack de origen, por lo que cualquier capacidad del modelo de lenguaje se preserva sin cambios.

El entrenamiento corresponde al de Google DeepMind: Gemma 4 en su variante E2B instruction-tuned, cuantizada mediante QAT para el formato Q4_0, de modo que el modelo simula la cuantizacion durante el entrenamiento para reducir la perdida de calidad al comprimir. No se dispone en la informacion proporcionada del numero de tokens de entrenamiento, la composicion del dataset ni los detalles de las fases de alineacion (RLHF/DPO). Entre las innovaciones documentadas de la familia Gemma 4 figuran el soporte nativo del rol de sistema en los prompts y la inclusion de un modelo borrador dedicado para decodificacion especulativa (multi-token prediction) en todas las variantes, lo que acelera la inferencia sin perdida de calidad. Este repack, al compartir exactamente el modelo de lenguaje del original, hereda esas caracteristicas.

## Capacidades

- Generacion de texto y conversacion multi-turno (pipeline `text-generation`, etiqueta `conversational`).
- Soporte nativo del rol de sistema para conversaciones mas estructuradas y controlables (caracteristica de la familia Gemma 4).
- Decodificacion especulativa mediante modelo borrador (multi-token prediction), disponible en todas las variantes de Gemma 4.
- Ejecucion cuantizada en int4 (W4A16) sobre hardware con soporte de kernels Marlin en vLLM.
- Capacidades multilingues: no especificadas en la ficha del repack.
- Tool calling / function calling: no documentado en la informacion disponible para este repack.
- Vision y audio: no soportados (torres eliminadas expresamente).
- Razonamiento, codigo y matematicas: no se documentan resultados especificos para este repack.

## Casos de uso

- Asistente conversacional de texto en produccion: el modelo se sirve en vLLM sin rutas multimodales que desactivar, y su cache KV documentada de 711.539 tokens permite mantener muchas sesiones simultaneas con ventanas largas en una sola GPU.
- Despliegue en hardware de gama baja: al cargar en 6,33 GiB segun vLLM, encaja en tarjetas como la Tesla T4 (16 GB) y en GPU de consumo con 12 GB o mas, lo que habilita inferencia local para equipos sin aceleradores de gama alta.
- Generacion de texto a gran escala (resumen, redaccion, reescritura) por lotes: gracias a la cuantizacion int4 y a los kernels Marlin, se maximiza el numero de secuencias concurrentes por unidad de VRAM.
- Chatbots de atencion al cliente textuales: el soporte del rol de sistema permite fijar instrucciones de comportamiento y personalidad sin reentrenamiento.
- Clasificacion y extraccion de informacion sobre documentos largos: la ventana probada de 16.384 tokens admite contratos, informes o transcripciones extensas en una sola pasada.
- Backend de agentes puramente textuales: integrable mediante la API de vLLM para orquestar flujos de varios pasos que no requieren percepcion visual ni audio.
- Entornos de investigacion y evaluacion: al ser un repack ligero y sin torres multimodales, resulta comodo para experimentar con cuantizacion QAT, kernels W4A16 y estrategias de cache KV.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La ficha del autor indica explicitamente que el modelo no se ha evaluado por separado del repack multimodal, cuyo modelo de lenguaje comparte exactamente, y que solo se ha probado en una unica T4 con un conjunto reducido de prompts.

## Requisitos de hardware

- Carga del modelo: vLLM informa de 6,33 GiB para la carga en una Tesla T4, con un total de pesos de texto de 6,11 GiB.
- Precision: en Turing (SM 7.5, como la T4) es necesario `--dtype float16`, ya que no hay soporte de bf16; en Ampere o posterior puede usarse bf16.
- GPU recomendadas: Tesla T4 (16 GB) es la plataforma probada y documentada. Con 6,33 GiB de pesos, el modelo tambien es viable en RTX 4090 (24 GB), A100 (40/80 GB) y H100, y en GPU de consumo de 12 GB o mas con cache KV reducida.
- Consumer GPU: si, cabe en tarjetas de 12 GB o mas; en tarjetas de 8 GB el margen para cache KV es muy limitado.
- Despliegue: vLLM 0.29.0 probado y documentado. El modelo declara `library_name: vllm` y usa `MarlinLinearKernel` para las capas lineales W4A16. No hay instrucciones documentadas para llama.cpp, Ollama o TGI. Comando de referencia: `vllm serve xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text --dtype float16 --max-model-len 16384`.
- Cache KV: con `--gpu-memory-utilization 0.90` y `--max-num-seqs 8` en la T4, la cache admite 711.539 tokens, unas 43 veces una peticion completa de 16.384 tokens, ligeramente por encima del repack multimodal con `--language-model-only` (707.617).
- Advertencia de arranque: la primera ejecucion compila desde cero (unos 2 minutos en 2 vCPU) y vLLM contabiliza la memoria del compilador como activacion, midiendo 4,67 GiB de activacion pico y solo 224.728 tokens de KV. Es necesario reiniciar una vez para que se cargue la cache de compilacion y se alcancen las cifras anteriores; este comportamiento se repite cada vez que cambia el nombre o la ruta del modelo.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Este repack (`...-text`) | 4.628.569.379 | no disponible (probado a 16.384) | 6,11 GiB | solo texto | Apache 2.0 | HuggingFace (xbill9) |
| xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct | mismos tensores de lenguaje, mas torres de vision y audio | no disponible | 7,00 GiB | multimodal (texto, imagen, audio) | Apache 2.0 | HuggingFace (xbill9) |
| google/gemma-4-E2B-it-qat-w4a16-ct | no disponible | no disponible | no disponible | multimodal (texto e imagen) | Apache 2.0 | HuggingFace (Google, oficial) |

## Limitaciones y advertencias

- Repack no oficial: no esta afiliado ni respaldado por Google; los problemas deben reportarse al autor del repack, no a Google DeepMind.
- Solo texto: no admite entradas de imagen ni de audio, ya que las torres correspondientes se han eliminado.
- Evaluacion limitada: probado en una unica T4 con un conjunto reducido de prompts; no se ha evaluado por separado del repack multimodal ni con benchmarks publicados.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; al ser un modelo generativo, persiste el riesgo habitual de generar contenido incorrecto con apariencia de veracidad.
- Sesgos: no documentados en la informacion proporcionada.
- Idioma: la ficha del repack no especifica los idiomas soportados, por lo que la cobertura linguistica no esta garantizada ni verificada.
- Contexto: la longitud maxima de contexto no se declara; el valor probado es de 16.384 tokens, asi que usar ventanas mayores no esta respaldado por la documentacion disponible.
- Licencia: Apache 2.0, que en principio permite uso comercial, pero conviene revisar la licencia de Gemma 4 enlazada por el autor para conocer las condiciones aplicables.
- Produccion: la primera puesta en marcha requiere un reinicio para cargar la cache de compilacion; obviar este paso degrada notablemente la cache KV disponible. En Turing es obligatorio float16.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct-text
- Repack multimodal de origen: https://huggingface.co/xbill9/gemma-4-E2B-it-qat-q4_0-w4a16-ct
- Script de conversion a texto: https://github.com/xbill9/gemma4-dev/blob/main/jev-tpu-31b/text_only.py
- Guia de despliegue en T4: https://github.com/xbill9/gemma4-dev/tree/main/gpu-vllm-t4-2b
- Evidencia del arranque en frio y cache KV: https://github.com/xbill9/gemma4-dev/blob/main/gpu-vllm-t4-2b/evidence/2026-09-29-cold-compile-kv.txt
- Version oficial de Google: https://huggingface.co/google/gemma-4-E2B-it-qat-w4a16-ct
- Coleccion Gemma 4 QAT Q4_0: https://huggingface.co/collections/google/gemma-4-qat-q4-0
- Pagina de Gemma 4 en Google DeepMind: https://deepmind.google/models/gemma/gemma-4/
- Vision general de Gemma 4 para desarrolladores: https://ai.google.dev/gemma/docs/core
- Licencia de Gemma 4: https://ai.google.dev/gemma/docs/gemma_4_license
- Blog sobre QAT en Gemma 4: https://blog.google/innovation-and-ai/technology/developers-tools/quantization-aware-training-gemma-4/
