# taobao-mnn/Qwen2-7B-Instruct-MNN

## Resumen

Qwen2-7B-Instruct-MNN es un paquete de inferencia en formato MNN derivado de Qwen/Qwen2-7B-Instruct, convertido por el equipo taobao-mnn (Alibaba) para su uso con el motor MNN. No se trata de un modelo nuevo ni de un reentrenamiento: es una exportación del modelo original de Qwen con cuantización HQQ de 4 bits aplicada a las capas lineales del tronco y a la cabeza de salida, manteniendo las embeddings de entrada en BF16 en un fichero separado. La arquitectura subyacente es Qwen2ForCausalLM con 28 capas, y el paquete declara max_position_embeddings de 32768 en configuración, aunque el autor aclara explícitamente que ese valor no equivale a contexto máximo verificado.

El interés del paquete es la portabilidad: MNN es un motor de inferencia ligero orientado a CPU y dispositivos móviles, por lo que esta conversión permite ejecutar un modelo de 7B en entornos x64 sin GPU. La verificación publicada por el autor es limitada y honesta: solo se ha validado en CPU x64, con pruebas de determinismo en modo greedy y un smoke test con la configuración por defecto (backend CPU, memoria baja, precisión baja, 4 hilos). ARM CPU en FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos móviles quedan sin verificar.

Es relevante ahora porque demuestra un flujo reproducible de exportación y validación para modelos Qwen2 en MNN, con parámetros de exportación y metadatos de refresco publicados en el repositorio. Para quien necesite desplegar Qwen2-7B-Instruct en CPU con un consumo de memoria reducido, este paquete ofrece una ruta concreta, aunque con un alcance de validación acotado que conviene tener presente antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (model_type qwen2), 28 capas |
| Parametros totales | no disponible (el autor no infiere parametros del nombre del repositorio) |
| Parametros activos | no aplica (no es MoE; la configuracion no declara expertos enrutados) |
| Longitud de contexto | max_position_embeddings=32768 en configuracion; el autor indica que no es contexto maximo verificado |
| Tipos de cuantizacion | HQQ 4-bit, block=128, alpha_bytes=2 (FP16), sym=false, en tronco lineal y cabeza LM; embeddings de entrada en BF16 separado |
| Idiomas soportados | zh, en |
| Licencia | apache-2.0 (heredada del modelo upstream) |
| Formato de pesos | MNN (grafo y pesos del motor MNN); embeddings en `embeddings_bf16.bin` |
| Tamano del repositorio | 12.4 GB |
| Version de runtime | MNN 3.6.2, commit b0239771b07b317a258fbc384683bbd540741406 |
| Configuracion por defecto | backend_type=cpu, memory=low, precision=low, thread_num=4 |
| Limite de generacion por defecto | 512 tokens (runtime no sobrescrito) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2-7B-Instruct, un transformer decoder-only de la familia Qwen2 con 28 capas, arquitectura Qwen2ForCausalLM y licencia Apache 2.0. Este paquete no aporta entrenamiento propio: es una conversión del checkpoint original a formato MNN mediante el exportador oficial de MNN en el commit fijado, con cuantización HQQ de 4 bits (block=128, alpha en FP16, simetría desactivada) aplicada tanto a las capas lineales del tronco como a la cabeza de salida LM. Las embeddings de entrada se mantienen en BF16 en un fichero independiente, y el autor advierte que el layout de las embeddings no es equivalente al almacenamiento de escalas de las capas lineales.

La conversión solo exporta el módulo de lenguaje: no hay visión, audio ni vídeo. El autor publica los parámetros de exportación en `export_args.json` y el layout real de cuantización en `refresh_metadata.json`, y advierte que reexportar con versiones distintas de las dependencias no garantiza bytes idénticos, por lo que recomienda usar un directorio de salida nuevo y revalidar. La validación incluye alineamiento FP32 entre la implementación fuente y el exportador en prefill/decode, embeddings, capas representativas, normalización y logits sobre las 28 capas completas, aunque el propio autor aclara que eso no implica coincidencia token a token con la salida cuantizada.

## Capacidades

- Generación de texto en chino e inglés, heredadas del modelo Qwen2-7B-Instruct original.
- Conversación multi-turno e instrucciones, al ser la variante Instruct del modelo base.
- Razonamiento aritmético y traducción: los casos de validación incluyen aritmética y traducción larga (hasta 882 tokens de prompt).
- Inferencia en CPU x64 con el motor MNN, sin necesidad de GPU.
- Ejecución con memoria reducida (modo low memory) y precisión baja por defecto.
- No se ha verificado soporte de tool calling, function calling, agentes ni modo thinking en este paquete; el autor clasifica el razonamiento como "none" y deja el contexto Jinja por defecto en null.
- No se ha verificado visión, audio ni vídeo; solo se exporta el módulo de lenguaje.

## Casos de uso

- Despliegue de un asistente conversacional en servidores x64 sin GPU: el paquete MNN con cuantización HQQ 4-bit permite ejecutar Qwen2-7B-Instruct en CPU con memoria baja, adecuado para entornos donde no hay acelerador disponible.
- Prototipado y pruebas de integración de MNN: sirve como referencia reproducible para validar el flujo de exportación (`llmexport.py`) y el runtime `llm_demo` antes de convertir otros modelos.
- Traducción zh-en en local: los casos de validación cubren traducción y traducción larga, lo que respalda su uso en pipelines de traducción de documentos de longitud moderada.
- Aplicaciones de escritorio o edge en x64: al no requerir GPU y usar MNN, encaja en herramientas de escritorio que necesitan generación de texto embebida.
- Generación de texto con límite de 512 tokens: útil para respuestas cortas, resúmenes breves o clasificación textual donde no se requiere contexto largo.
- Base para reexportación y ajuste de cuantización: los parámetros de exportación publicados permiten reproducir el proceso con otros valores de `quant_bit` o `quant_block` y comparar resultados.
- Evaluación de viabilidad antes de invertir en despliegue GPU: permite medir latencia y consumo en CPU con la configuración por defecto antes de migrar a otras plataformas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no publica cifras de rendimiento ni de memoria por dispositivo, y que las pruebas de determinismo y smoke test no constituyen una evaluación de precisión. Los datos disponibles se limitan a: rango de tokens de prompt en las pruebas (26–882), límite de generación por defecto de 512 tokens, y configuración de prueba (CPU x64, greedy, precision=high, 8 hilos, use_mmap=false para determinismo).

## Requisitos de hardware

- VRAM: no aplica en la configuración verificada; el runtime por defecto es CPU (`backend_type: cpu`).
- GPU: no verificadas. Metal, OpenCL, Vulkan y CUDA no han sido validados por el autor.
- CPU: validado en x64. ARM CPU en FP16 no verificado.
- Memoria: el paquete usa modo low memory; el autor no publica cifras de consumo de memoria por dispositivo.
- Despliegue: motor MNN 3.6.2 compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_CONVERTER=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`; ejecución mediante `llm_demo` con `config.json` y fichero de prompt.
- Latencia y throughput: no disponibles; el autor no ha publicado mediciones.
- Tamaño en disco: repositorio de 12.4 GB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Validacion publicada |
|---|---|---|---|---|---|
| Qwen2-7B-Instruct-MNN (este) | no disponible (28 capas) | 32768 en config, no verificado | HQQ 4-bit + embeddings BF16 | apache-2.0 | Solo CPU x64; sin benchmarks de precision |
| Qwen/Qwen2-7B-Instruct (original) | 7B (segun nombre del modelo upstream) | 32768 en config | BF16/FP16 original | apache-2.0 | Evaluaciones publicadas por Qwen (no replicadas en este paquete) |
| Otras conversiones MNN de Qwen2 | no disponible | no disponible | no disponible | apache-2.0 (heredada) | no disponible |

La comparación con alternativas de la misma categoría (otros paquetes MNN de modelos 7B) no está documentada en la información disponible; el autor no incluye comparativas con otros formatos como GGUF o modelos cuantizados con otras técnicas.

## Limitaciones y advertencias

- Validación muy acotada: solo CPU x64. ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y móviles quedan sin verificar.
- El autor no publica benchmarks de precisión ni de rendimiento; las pruebas de determinismo y smoke test no son una evaluación de exactitud.
- La cuantización HQQ 4-bit puede introducir errores en la salida; el propio autor advierte que "la salida cuantizada puede seguir conteniendo errores".
- `max_position_embeddings=32768` es un valor de configuración, no un contexto máximo verificado experimentalmente.
- Idiomas limitados a chino e inglés; no se ha verificado comportamiento en castellano.
- No se ha verificado soporte de tool calling, agentes, visión ni audio.
- Licencia Apache 2.0 heredada del modelo upstream; la conversión no amplía los derechos. Es necesario cumplir las obligaciones de atribución y la política de uso del modelo original.
- No mezclar revisiones ni reemplazar solo ficheros del grafo: el paquete debe actualizarse de forma atómica (grafo, pesos, tokenizador, embeddings, plantilla y configuración).
- Reexportar con versiones distintas de dependencias no garantiza resultados idénticos; se recomienda revalidar en un directorio nuevo.
- El límite por defecto de 512 tokens de generación puede ser insuficiente para tareas que requieran respuestas largas.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/taobao-mnn/Qwen2-7B-Instruct-MNN
- Modelo original en ModelScope: https://modelscope.cn/models/Qwen/Qwen2-7B-Instruct/summary
- Exportador MNN en el commit fijado: https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Repositorio MNN: https://github.com/alibaba/MNN
- Licencia Apache 2.0: https://huggingface.co/taobao-mnn/Qwen2-7B-Instruct-MNN/blob/main/LICENSE
