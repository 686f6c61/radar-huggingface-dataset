# taobao-mnn/DeepSeek-R1-7B-Qwen-MNN

## Resumen

DeepSeek-R1-7B-Qwen-MNN es un paquete de inferencia en formato MNN del modelo deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, un destilado de la familia DeepSeek-R1 sobre la arquitectura Qwen2. Lo publica el equipo taobao-mnn (Alibaba) como conversión cuantizada para su motor de inferencia MNN, orientado a ejecución en CPU y dispositivos finales. No es un modelo nuevo entrenado desde cero, sino una reempaquetación del destilado de 7B con pesos cuantizados a 4 bits mediante HQQ.

El modelo base es un transformer decoder-only de tipo Qwen2ForCausalLM con 28 capas, especializado en razonamiento con cadena de pensamiento (reasoning "forzado" en la configuración por defecto). El paquete MNN exporta únicamente el módulo de lenguaje (texto a texto), con la cabeza de salida (LM head) y las capas lineales cuantizadas a 4 bits y las embeddings mantenidas en BF16 en un fichero separado.

Su relevancia práctica radica en permitir ejecutar un modelo de razonamiento de 7B en CPU x64 con el runtime MNN 3.6.2, sin necesidad de GPU, con un peso total de repositorio de 8,2 GB. La validación publicada es acotada: solo se ha verificado en CPU x64, con pruebas de determinismo y smoke tests, y no se han publicado benchmarks de precisión ni cifras de rendimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen2ForCausalLM (transformer decoder-only), model_type `qwen2`, 28 capas |
| Parametros totales | no disponible (el repo no declara el recuento; el nombre indica 7B) |
| Parametros activos | no aplica (no es MoE; la config no declara expertos enrutados) |
| Longitud de contexto | max_position_embeddings=131072 en config; no es contexto máximo verificado (prompts de prueba de 12 a 868 tokens) |
| Tipos de cuantizacion | HQQ 4-bit en pesos lineales del backbone y LM head (block=0, alpha_bytes=2 FP16, sym=false); embeddings en BF16 separado |
| Idiomas soportados | zh, en |
| Licencia | MIT (heredada del modelo base) |
| Formato de pesos | MNN (paquete de inferencia con grafo y pesos; incluye `embeddings_bf16.bin`, `config.json`, `llm_config.json`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder-only Qwen2 de 28 capas, según la configuración del modelo base DeepSeek-R1-Distill-Qwen-7B. El modelo original es un destilado de DeepSeek-R1 sobre Qwen2-7B; el proceso de destilación y los datos exactos de entrenamiento no se detallan en la información disponible de este paquete. La configuración no declara expertos enrutados, por lo que no se trata de una arquitectura MoE.

La innovación de este paquete es la conversión a MNN con cuantización HQQ de 4 bits (block=0, alpha en FP16, simétrico desactivado) aplicada a las capas lineales y a la LM head, manteniendo las embeddings de entrada en un fichero BF16 independiente (`embeddings_bf16.bin`). El exportador es el estándar de MNN en el commit fijado `b0239771b07b317a258fbc384683bbd540741406`, con soporte de fusión de transformer y modo de baja memoria. No se documentan detalles de RLHF, DPO ni composición del dataset en la información proporcionada.

## Capacidades

- Generación de texto en chino e inglés (únicos idiomas declarados).
- Razonamiento con cadena de pensamiento: la configuración por defecto clasifica el reasoning como `forced` (pensamiento obligatorio, no desactivable sin cambiar el contexto Jinja).
- Aritmética y traducción: los casos de validación incluyen `greeting`, `arithmetic`, `translation` y `long_translation`.
- Generación de código y matemáticas: capacidades heredadas del destilado de DeepSeek-R1, aunque no se han verificado explícitamente en este paquete.
- Tool calling / function calling: no disponible (no se declara soporte).
- Capacidades de agente multi-paso: no disponible (no se declara soporte).
- Visión, audio o vídeo: no soportado; el paquete exporta solo el módulo de lenguaje.
- Límite de generación por defecto: 2048 tokens nuevos (`max_new_tokens`).

## Casos de uso

- Inferencia en CPU sin GPU: el paquete está validado en CPU x64 con el runtime MNN 3.6.2, lo que permite desplegar un modelo de razonamiento de 7B en servidores sin acelerador o en estaciones de trabajo convencionales.
- Aplicaciones de escritorio o edge con MNN: al ser un paquete MNN nativo, encaja en aplicaciones que ya integran el motor de Alibaba para LLM en dispositivos finales (aunque la validación publicada no cubre ARM, Metal, OpenCL, Vulkan ni CUDA).
- Razonamiento matemático y resolución de problemas paso a paso: el modo de pensamiento forzado favorece tareas aritméticas y de lógica, como el caso de validación `arithmetic` (por ejemplo, "2 + 3").
- Traducción zh-en y en-zh: los casos `translation` y `long_translation` (hasta 868 tokens de prompt) cubren traducción de textos cortos y largos.
- Prototipado de asistentes conversacionales en chino e inglés: con 2048 tokens de generación por defecto y contexto de configuración amplio, sirve para diálogos multi-turno en entornos de prueba.
- Evaluación y comparación de cuantización HQQ 4-bit: útil para investigadores que quieran medir la degradación de un destilado de R1 al cuantizarlo a 4 bits frente al modelo original en BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se publican cifras de rendimiento ni de memoria por dispositivo, y que las pruebas realizadas (determinismo en CPU x64, smoke tests con casos predefinidos) no constituyen una evaluación de precisión.

## Requisitos de hardware

- VRAM/RAM estimada: no disponible como cifra oficial; el repositorio ocupa 8,2 GB y los pesos lineales están en HQQ 4-bit con embeddings BF16, por lo que la huella en memoria es inferior a la de un modelo de 7B en BF16 (no se publica el dato exacto).
- GPU recomendadas: no verificadas; la model card indica que CUDA, Metal, OpenCL y Vulkan no han sido validados.
- CPU: validado en CPU x64 con MNN 3.6.2, precisión baja y 4 hilos por defecto.
- Consumer GPU: no disponible (sin validación publicada).
- Despliegue: runtime MNN (`llm_demo`), compilado con `MNN_BUILD_LLM=ON`, `MNN_LOW_MEMORY=ON` y `MNN_SUPPORT_TRANSFORMER_FUSE=ON`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Validacion |
|---|---|---|---|---|---|
| DeepSeek-R1-7B-Qwen-MNN (este) | 7B (no declarado en repo) | 131072 en config (no verificado) | MNN, HQQ 4-bit | MIT | Solo CPU x64 |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7B | 131072 (config del original) | safetensors (BF16) | MIT | Upstream |
| Destilados Qwen2.5 de 7B | 7B | variable | safetensors, GGUF | variable | Upstream |

La comparación con alternativas cuantizadas (GGUF para llama.cpp, AWQ/GPTQ para vLLM) no está disponible en la información proporcionada; este paquete se distingue por su integración con el runtime MNN y su validación exclusiva en CPU x64.

## Limitaciones y advertencias

- Validación muy acotada: solo se ha verificado en CPU x64; ARM CPU FP16, Metal, OpenCL, Vulkan, CUDA y dispositivos móviles no están validados.
- Sin benchmarks de precisión: las pruebas publicadas son de determinismo y smoke tests estructurales, no de exactitud.
- La cuantización HQQ 4-bit puede degradar la calidad de salida; la propia model card advierte de que la salida cuantizada puede contener errores.
- Contexto: `max_position_embeddings=131072` es un campo de configuración, no un contexto máximo verificado; los prompts de prueba no superan los 868 tokens.
- Idiomas limitados a chino e inglés; no se declara soporte multilingüe adicional.
- Sin soporte declarado de tool calling, agentes, visión, audio ni vídeo.
- Reasoning forzado por defecto: desactivar el pensamiento requiere modificar el contexto Jinja (`enable_thinking: false`), lo que puede afectar al comportamiento esperado.
- Integridad del paquete: no se deben mezclar revisiones ni sustituir solo el fichero de grafo; los pesos, embeddings, tokenizador, plantilla y configuración deben actualizarse como un conjunto.
- Licencia MIT heredada del modelo base: la conversión no amplía la autorización; los derechos del modelo pertenecen al upstream y la licencia de las herramientas MNN no sustituye la del modelo.
- Sin cifras de latencia, throughput ni memoria por dispositivo publicadas.

## Enlaces

- Hugging Face: https://huggingface.co/taobao-mnn/DeepSeek-R1-7B-Qwen-MNN
- Modelo base (ModelScope): https://modelscope.cn/models/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B/summary
- Repositorio MNN: https://github.com/alibaba/MNN
- Exportador MNN (commit fijado): https://github.com/alibaba/MNN/tree/b0239771b07b317a258fbc384683bbd540741406/transformers/llm/export
- Documentación MNN-LLM: https://mnn-docs.readthedocs.io/en/latest/transformers/llm.html
- Ficheros de trazabilidad del paquete: `export_args.json`, `refresh_metadata.json`, `config.json`, `llm_config.json`, `LICENSE` (en el repositorio de Hugging Face)
