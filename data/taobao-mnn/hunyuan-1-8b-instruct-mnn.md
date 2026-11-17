# taobao-mnn/Hunyuan-1.8B-Instruct-MNN

## Resumen

Hunyuan-1.8B-Instruct-MNN es un paquete de inferencia en formato MNN del modelo Tencent Hunyuan-1.8B-Instruct, convertido y publicado por el equipo taobao-mnn (vinculado a Alibaba MNN). No es un modelo nuevo: es una reempaquetado cuantizado del modelo denso de 1.800 millones de parámetros de Tencent, pensado para ejecutarse con el runtime MNN en CPU, incluyendo entornos de bajos recursos. El paquete incluye el grafo MNN, los pesos cuantizados con HQQ (4 bits en el tronco lingüístico, 8 bits en la cabeza LM), el tokenizador, la plantilla y la configuración de inferencia.

El problema que resuelve es la portabilidad: permite desplegar un modelo de chat bilingüe (chino e inglés) de 1,8B en dispositivos sin GPU mediante el runtime MNN, con un consumo de memoria reducido gracias a la cuantización HQQ y a la opción de bajo consumo de memoria del runtime. La arquitectura declarada en la configuración de origen es `HunYuanDenseV1ForCausalLM` (`hunyuan_v1_dense`), con 32 capas y sin expertos enrutados (no es MoE).

Es relevante para desarrolladores que necesitan inferencia local en CPU (escritorio x64, y potencialmente ARM/móvil, aunque no verificado) con un modelo de instrucciones razonablemente capaz y licencia comunitaria de Tencent. La verificación publicada por el autor es limitada: solo x64 CPU, sin validación en GPU, Metal, OpenCL, Vulkan ni dispositivos móviles, y con una expectativa de traducción larga explícitamente exenta por fallo en la línea base del modelo fuente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, `HunYuanDenseV1ForCausalLM` (`hunyuan_v1_dense`), 32 capas |
| Parametros totales | 1,8B (según nombre y modelo base; el pack no declara recuento medido) |
| Parametros activos | No aplica (modelo denso, sin expertos enrutados) |
| Longitud de contexto | `max_position_embeddings=262144` en configuración; no es contexto máximo verificado. Prompts de prueba entre 13 y 796 tokens |
| Tipos de cuantizacion | HQQ 4 bits en tronco lineal (block=64, alpha FP16, sym=false); HQQ 8 bits en cabeza LM (block=64); embeddings comparten pesos de la cabeza LM cuantizada |
| Idiomas soportados | Chino (zh) e inglés (en) |
| Licencia | Tencent Hunyuan Community License Agreement (metadato `other`) |
| Formato de pesos | MNN (grafo + pesos cuantizados), con `config.json`, `llm_config.json`, tokenizador y plantilla Jinja |
| Runtime requerido | MNN 3.6.2, commit `b0239771b07b317a258fbc384683bbd540741406` |
| Tamano del repo | 2,4 GB |
| Fecha de aceptacion | 2026-11-12 |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de tipo decoder-only con 32 capas, declarado en la configuración como `HunYuanDenseV1ForCausalLM` con `model_type=hunyuan_v1_dense`. La configuración no declara expertos enrutados, por lo que no es un modelo MoE. El paquete MNN exporta únicamente el módulo de lenguaje (entrada y salida de texto); no incluye visión, audio ni vídeo.

La conversión aplica cuantización HQQ: 4 bits con bloque de 64 y escalas en FP16 para las matrices lineales del tronco, y 8 bits con bloque de 64 para la cabeza de salida LM. Los embeddings de entrada no son BF16 independientes: comparten los pesos cuantizados de la cabeza LM. El exportador utilizado es el estándar de MNN en el commit fijado, con los parámetros `--quant_bit 4 --quant_block 64 --lm_quant_bit 8 --lm_quant_block 64 --scale_bit 16 --embed_bit 16`. No se documentan en esta ficha detalles sobre el corpus de entrenamiento original, número de tokens, ni si hubo RLHF o DPO; esa información corresponde al modelo base de Tencent y no se incluye en el paquete.

La innovación técnica relevante no está en el modelo sino en el empaquetado: cuantización HQQ con block=64, fusión de transformadores en MNN (`MNN_SUPPORT_TRANSFORMER_FUSE=ON`), modo de bajo consumo de memoria y un conjunto de configuración de inferencia con muestreo mixto (penalty, topK, topP, min_p, temperature). La categoría de razonamiento se declara `hybrid`, con soporte de contexto Jinja para controlar el modo de pensamiento (`enable_thinking`).

## Capacidades

- Generación de texto conversacional en chino e inglés, con plantilla de chat incluida.
- Razonamiento aritmético básico y respuesta a instrucciones directas (validado con casos de saludo, aritmética y traducción).
- Traducción entre los idiomas soportados; la traducción larga está explícitamente exenta de las expectativas de aceptación por fallo en la línea base del modelo fuente.
- Modo de razonamiento híbrido: la configuración clasifica el razonamiento como `hybrid` y permite controlar el pensamiento forzado mediante contexto Jinja (`enable_thinking`).
- Muestreo configurable: penalización de repetición (1,05), top-k (20), top-p (0,8), min-p (0), temperatura (0,7) y sampler mixto.
- Inferencia en CPU con precisión baja y modo de bajo consumo de memoria.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión, audio ni vídeo en este paquete.

## Casos de uso

- Asistente conversacional local en escritorio: integración del runtime MNN en una aplicación de escritorio x64 para responder consultas en chino e inglés sin conexión, aprovechando el modo de bajo consumo de memoria y la cuantización de 4 bits.
- Traducción de textos cortos y medianos: uso del modelo para traducción zh↔en en flujos de documentación o atención al usuario, con la advertencia de que la traducción larga no supera las expectativas de aceptación del paquete.
- Prototipado de chatbots embebidos: despliegue en entornos con recursos limitados donde no hay GPU disponible, usando `llm_demo` de MNN como referencia de integración.
- Respuestas a preguntas frecuentes y clasificación ligera: tareas de instrucción simple con prompts de hasta varios cientos de tokens, dentro del rango verificado (13–796 tokens en las pruebas publicadas).
- Generación de texto asistida en herramientas de productividad: borradores, resúmenes cortos y reescritura en aplicaciones de escritorio que ya empaquetan MNN.
- Evaluación y experimentación con cuantización HQQ: base para comparar calidad 4/8 bits frente al modelo original en pipelines de investigación sobre compresión de modelos.
- Despliegue en dispositivos ARM o móviles: potencial uso en Android/iOS mediante MNN, aunque el autor no ha verificado ARM CPU FP16, Metal, OpenCL ni Vulkan, por lo que requiere validación propia antes de producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se publican cifras de rendimiento ni de memoria por dispositivo, y que no hay validación en GPU, móvil, visión, audio o vídeo. Las únicas métricas publicadas son de verificación funcional: rango de tokens de prompt de 13 a 796, generación máxima por defecto de 512 tokens, y pruebas de determinismo en x64 CPU con greedy, precisión alta, 8 hilos y `use_mmap=false`.

## Requisitos de hardware

- VRAM estimada: no aplica para el modo verificado (CPU). Para GPU no hay datos publicados.
- Memoria en CPU: no se publican cifras de memoria por dispositivo; el repo ocupa 2,4 GB y el runtime opera con `memory: low` y `precision: low`.
- GPU recomendadas: no verificadas. El autor no valida CUDA, Metal, OpenCL ni Vulkan.
- CPU verificada: x64 con MNN 3.6.2, compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON`, `MNN_BUILD_CONVERTER=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`.
- Cabe en GPU de consumo: no confirmado; el paquete está orientado a CPU y no se han publicado pruebas en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: runtime MNN (`llm_demo`), con compilación propia desde el commit fijado. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que el formato es MNN y no GGUF/safetensors.
- Latencia y throughput: no disponibles. El autor no publica cifras de velocidad ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Validacion |
|---|---|---|---|---|---|
| Hunyuan-1.8B-Instruct-MNN (este) | 1,8B denso | 262144 declarados en config (no verificado) | MNN cuantizado HQQ 4/8 bits | Tencent Hunyuan Community License | Solo x64 CPU |
| tencent/Hunyuan-1.8B-Instruct (base) | 1,8B denso | 262144 declarados en config | Safetensors (BF16/FP16) | Tencent Hunyuan Community License | Upstream (no incluido en este pack) |
| Alternativas MNN de tamano similar | no disponible | no disponible | MNN | variable | no disponible |
| Alternativas GGUF de 1-2B (p. ej. familias Llama/Qwen) | no disponible en la informacion | no disponible | GGUF | variable | no disponible |

La comparación directa con otros modelos de 1-2B no puede establecerse con datos de esta ficha: no hay benchmarks publicados ni cifras de rendimiento del paquete. La diferencia principal frente al modelo base es el formato (MNN cuantizado frente a safetensors) y la orientación a CPU; frente a alternativas GGUF, el ecosistema de despliegue es distinto (MNN frente a llama.cpp/Ollama).

## Limitaciones y advertencias

- Verificación limitada: solo se valida x64 CPU. ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos móviles no están verificados.
- Traducción larga: la expectativa `long_translation` falla en la línea base del modelo fuente y está explícitamente exenta; el paquete no garantiza precisión en todos los casos.
- Contexto: `max_position_embeddings=262144` es un campo de configuración, no un contexto máximo verificado. Los prompts de prueba llegan a 796 tokens.
- Cuantización: los pesos están cuantizados con HQQ (4 bits tronco, 8 bits cabeza LM); la salida puede contener errores derivados de la pérdida de precisión. No hay garantía de coincidencia token a token con el modelo original.
- Idiomas: solo chino e inglés declarados; no se documenta soporte de castellano ni de otros idiomas.
- Licencia: Tencent Hunyuan Community License Agreement. La conversión no amplía la autorización; es necesario cumplir las obligaciones de atribución y política de uso del modelo original. El uso comercial está sujeto a los términos de dicha licencia, que deben revisarse antes de producción.
- Riesgo de alucinación: inherente a modelos de 1,8B; no se publican evaluaciones de fidelidad.
- Sin soporte documentado de tool calling, agentes, visión, audio ni vídeo en este paquete.
- Dependencia de versión: el runtime debe ser MNN 3.6.2 o superior con regresión propia; versiones anteriores no están verificadas. No se deben mezclar revisiones ni sustituir solo el grafo.
- No se publican cifras de latencia, throughput ni memoria por dispositivo, lo que dificulta planificar despliegues en producción.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/Hunyuan-1.8B-Instruct-MNN
- Modelo base (ModelScope): https://modelscope.cn/models/Tencent-Hunyuan/Hunyuan-1.8B-Instruct/summary
- Repositorio MNN (commit fijado): https://github.com/alibaba/MNN/tree/b0239771b07b317
- Repositorio MNN (principal): https://github.com/alibaba/MNN
- Licencia: https://huggingface.co/taobao-mnn/Hunyuan-1.8B-Instruct-MNN/blob/main/LICENSE
- Aviso legal: https://huggingface.co/taobao-mnn/Hunyuan-1.8B-Instruct-MNN/blob/main/Notice.txt
- Parametros de exportacion: https://huggingface.co/taobao-mnn/Hunyuan-1.8B-Instruct-MNN/blob/main/export_args.json
- Metadatos de verificacion: https://huggingface.co/taobao-mnn/Hunyuan-1.8B-Instruct-MNN/blob/main/refresh_metadata.json
