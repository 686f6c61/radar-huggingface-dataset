# taobao-mnn/Qwen3-4B-Instruct-2507-MNN

## Resumen

Qwen3-4B-Instruct-2507-MNN es un paquete de inferencia en formato MNN del modelo Qwen3-4B-Instruct-2507, convertido y verificado por el equipo taobao-mnn (Alibaba). No se trata de un modelo nuevo, sino de una exportación cuantizada del modelo base de Qwen con el objetivo de ejecutarlo de forma eficiente mediante el runtime MNN (Mobile Neural Network) de Alibaba, especialmente en CPU. El paquete incluye el grafo MNN, los pesos cuantizados, el tokenizador, la plantilla y la configuración necesarios para su uso directo con `llm_demo` de MNN.

El modelo subyacente es un transformer denso `Qwen3ForCausalLM` de 36 capas, con un campo `max_position_embeddings` de 262144 en la configuración (que no debe interpretarse como contexto máximo verificado). La exportación aplica cuantización HQQ: las matrices lineales del backbone quedan en 4 bits con bloque de 64, y la cabeza de salida LM en 8 bits con bloque de 64, con escalas en FP16. Los pesos de embedding de entrada comparten la matriz cuantizada de la cabeza LM, no son un embedding BF16 independiente.

La relevancia de este paquete es práctica: permite desplegar un modelo instructivo de 4B parámetros en entornos donde no hay GPU, usando el runtime MNN con soporte de bajo consumo de memoria y fusión de transformadores. La verificación publicada se limita a CPU x64; no se han validado rutas ARM FP16, Metal, OpenCL, Vulkan, CUDA ni dispositivos móviles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3ForCausalLM` (transformer denso, model_type `qwen3`) |
| Parametros totales | no disponible (la model card no declara el recuento; no se infiere del nombre) |
| Parametros activos | no aplica (no es MoE; la configuración no declara expertos enrutados) |
| Longitud de contexto | campo `max_position_embeddings=262144` en configuración; no es contexto máximo verificado. Longitudes de prompt probadas: 15–871 tokens |
| Tipos de cuantizacion | HQQ 4-bit (backbone, block=64, alpha FP16, sym=false); HQQ 8-bit (cabeza LM, block=64, alpha FP16, sym=false) |
| Idiomas soportados | zh, en (según metadatos del paquete) |
| Licencia | apache-2.0 (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Formato de pesos | MNN (grafo + pesos cuantizados HQQ); no safetensors ni GGUF |
| Capas | 36 |
| Entrada / salida | texto / texto (solo se exporta el módulo de lenguaje) |
| Runtime requerido | MNN 3.6.2, commit `b0239771b07b317a258fbc384683bbd540741406` |
| Tamano del repo | 5.2 GB |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Qwen3-4B-Instruct-2507: un transformer decoder-only denso de 36 capas con atención estándar, sin mezcla de expertos. Este paquete no entrena ni afina nada; únicamente exporta el módulo de lenguaje a formato MNN aplicando cuantización HQQ por bloques. Las matrices lineales del backbone se cuantizan a 4 bits (bloque 64, escalas en FP16, simetría desactivada) y la cabeza de salida LM a 8 bits (bloque 64). Los embeddings de entrada reutilizan la matriz cuantizada de la cabeza LM en lugar de mantener una copia BF16 separada, lo que reduce el tamaño del paquete a costa de compartir el esquema de cuantización entre ambas funciones.

El proceso de conversión se realiza con el exportador estándar de MNN (`llmexport.py`) con las opciones `--export mnn --hqq --quant_bit 4 --quant_block 64 --lm_quant_bit 8 --lm_quant_block 64 --scale_bit 16 --embed_bit 16`. La model card documenta que la alineación FP32 entre la implementación de referencia y el exportador se verificó en prefill/decode, embedding, capas representativas, normalización y logits sobre las 36 capas completas, aunque esto no implica que la salida cuantizada coincida token a token con la del modelo original. No se detallan datos de entrenamiento, composición del dataset ni etapas de RLHF/DPO, ya que corresponden al modelo base y no se reproducen en esta ficha.

## Capacidades

- Generación de texto conversacional e instructivo en chino e inglés.
- Razonamiento aritmético básico y traducción (validado en casos de prueba predefinidos: saludo, aritmética, traducción, traducción larga).
- Generación con presupuesto de tokens configurable; por defecto 512 tokens en el runtime de referencia.
- Muestreo configurable: `mixed` con penalización de repetición, top-k, top-p, min-p y temperatura.
- Soporte de plantilla Jinja para control del contexto de conversación; el paquete por defecto trae `context: null` y clasificación de razonamiento `none`.
- Ejecución en CPU x64 con bajo consumo de memoria (`MNN_LOW_MEMORY=ON`) y fusión de transformadores.
- No se documentan capacidades de tool calling, function calling, agentes multi-paso, visión, audio ni modo thinking explícito en este paquete.

## Casos de uso

- Despliegue en servidores sin GPU: el paquete MNN con cuantización HQQ 4/8 bits permite ejecutar un modelo de 4B parámetros en CPU x64 usando `llm_demo` o la API de MNN-LLM, adecuado para entornos de desarrollo y pruebas donde no hay acelerador disponible.
- Asistentes conversacionales en chino e inglés: la plantilla Jinja y el muestreo configurable permiten gestionar diálogos multi-turno con contexto moderado (los casos validados llegan a 871 tokens de prompt), suficiente para atención al cliente o asistentes de documentación.
- Traducción automática zh↔en: los casos de prueba de traducción y traducción larga confirman que el modelo produce salidas coherentes en esta tarea, lo que permite integrarlo en pipelines de localización de contenido.
- Generación de respuestas a preguntas cerradas: el modelo responde a preguntas aritméticas y de conocimiento general con formato controlado, útil para tareas de extracción y respuesta breve en aplicaciones internas.
- Prototipado de aplicaciones móviles o embebidas: aunque la model card solo verifica CPU x64, el formato MNN está diseñado para despliegue en dispositivos; sirve como base para experimentar con rutas ARM FP16 o Metal, que quedan pendientes de validación por parte del usuario.
- Evaluación comparativa de cuantización: al estar el paquete documentado con parámetros de exportación y metadatos de verificación, es útil como referencia para medir el impacto de HQQ 4/8 bits frente al modelo original en tareas controladas.
- Integración en herramientas de línea de comandos: el binario `llm_demo` y la configuración `config.json` permiten incorporar el modelo a scripts de procesamiento de texto por lotes sin dependencias de Python en tiempo de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se publican mediciones de rendimiento ni cifras de memoria por dispositivo, y que las pruebas realizadas son de verificación estructural (alineación FP32, determinismo con greedy, smoke test con configuración por defecto) y no constituyen una evaluación de precisión.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; la verificación se realizó únicamente en CPU x64.
- GPU recomendadas: no disponible; no se han validado rutas Metal, OpenCL, Vulkan ni CUDA.
- Compatibilidad con GPU de consumo: no verificada.
- Despliegue validado: CPU x64 con MNN 3.6.2 y el commit `b0239771b07b317a258fbc384683bbd540741406`, compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_CONVERTER=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`.
- Opciones de despliegue adicionales: vLLM, llama.cpp, Ollama y TGI no son aplicables directamente, ya que el paquete está en formato MNN y no en safetensors ni GGUF.
- Latencia y throughput: no disponibles; no se han publicado mediciones.
- Memoria: no se publican cifras de consumo de memoria por dispositivo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Verificacion |
|---|---|---|---|---|---|
| Qwen3-4B-Instruct-2507-MNN (este paquete) | no declarado (base 4B) | `max_position_embeddings=262144` (no verificado) | MNN, HQQ 4/8 bits | apache-2.0 | CPU x64 únicamente |
| Qwen/Qwen3-4B-Instruct-2507 (modelo base) | 4B (según nombre del modelo base) | no disponible en esta ficha | safetensors (formato habitual del modelo base) | apache-2.0 | no disponible en esta ficha |
| Versiones GGUF de Qwen3-4B-Instruct-2507 | 4B (según nombre) | no disponible en esta ficha | GGUF | apache-2.0 (heredada) | no disponible en esta ficha |
| Versiones AWQ/GPTQ de Qwen3-4B-Instruct-2507 | 4B (según nombre) | no disponible en esta ficha | safetensors cuantizados | apache-2.0 (heredada) | no disponible en esta ficha |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada; la comparativa se limita a formato, licencia y ámbito de verificación.

## Limitaciones y advertencias

- La verificación publicada cubre únicamente CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos móviles no han sido validados.
- El campo `max_position_embeddings=262144` es un valor de configuración, no un contexto máximo verificado; las pruebas reales usaron prompts de 15 a 871 tokens.
- La cuantización HQQ 4/8 bits puede degradar la calidad de salida respecto al modelo original; la model card advierte que la salida cuantizada puede contener errores.
- No se han publicado benchmarks de precisión ni de rendimiento; las pruebas realizadas son estructurales y de determinismo, no de exactitud.
- El paquete solo exporta el módulo de lenguaje; no incluye visión, audio ni vídeo.
- Los idiomas declarados son chino e inglés; no se garantiza un rendimiento equivalente en otros idiomas.
- La licencia apache-2.0 se hereda del modelo base; la conversión no amplía los derechos de uso, y deben cumplirse las obligaciones de atribución y política de uso del modelo original.
- El paquete debe actualizarse como un todo (grafo, pesos, tokenizador, plantilla y configuración); mezclar revisiones o sustituir solo el archivo de grafo puede producir inconsistencias.
- El runtime requiere MNN 3.6.2 o una versión posterior con regresión propia; versiones anteriores no están verificadas.
- El límite de generación por defecto es de 512 tokens; para respuestas más largas debe configurarse explícitamente.
- No se documentan capacidades de tool calling ni de agentes; no deben asumirse.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Qwen3-4B-Instruct-2507-MNN
- Modelo base (ModelScope): https://modelscope.cn/models/Qwen/Qwen3-4B-Instruct-2507/summary
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507/blob/main/LICENSE
- Repositorio MNN: https://github.com/alibaba/MNN
- Exportador MNN (commit fijado): https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Parámetros de exportación: https://huggingface.co/taobao-mnn/Qwen3-4B-Instruct-2507-MNN/blob/main/export_args.json
- Metadatos de verificación: https://huggingface.co/taobao-mnn/Qwen3-4B-Instruct-2507-MNN/blob/main/refresh_metadata.json
