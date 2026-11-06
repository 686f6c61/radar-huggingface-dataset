# srmftech/Torqen-v1-9B-0311-GGUF

## Resumen

Torqen v1 9B 0311 es un ajuste fino (fine-tune) del modelo Qwen3.5-9B desarrollado por srmf.tech, orientado a conversacion en ruso. Se trata de un derivado experimental entrenado mediante LoRA sobre el modelo base de Alibaba, con el objetivo declarado de ofrecer un asistente local eficiente, con respuestas mas directas y trazas de razonamiento visibles mas cortas que el modelo original.

El modelo cuenta con 9.197.093.888 parametros (aproximadamente 9,2B) y se distribuye unicamente en formato GGUF con cuantizacion Q4_K_M, lo que facilita su ejecucion en hardware de consumo mediante llama.cpp, LM Studio u Ollama. La licencia es Apache 2.0, heredada del modelo base, lo que permite uso comercial sin restricciones adicionales conocidas.

Su relevancia radica en dos factores: por un lado, es un ejemplo de ajuste fino ligero (solo el 0,31% de los parametros fueron entrenables) sobre una base potente; por otro, su enfoque especifico en ruso lo posiciona como alternativa local a modelos propietarios como YandexGPT 5 Lite. No obstante, el entrenamiento se realizo con solo 638 ejemplos, lo que limita considerablemente la profundidad del ajuste.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-9B; detalles de atencion no disponibles) |
| Parametros totales | 9.197.093.888 (~9,2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_K_M (unica publicada) |
| Idiomas soportados | Ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

Torqen se construye sobre Qwen3.5-9B, un transformer denso de aproximadamente 9,4B parametros segun la model card del autor (el recuento real de safetensors es de 9,197B). El ajuste se realizo mediante LoRA con supervision (SFT), con 29.097.984 parametros entrenables, es decir, un 0,31% del total. El conjunto de entrenamiento consta de 638 ejemplos, con 5 epocas y 90 pasos de optimizacion. La perdida de entrenamiento descendio de aproximadamente 1,54 a 0,62.

Tras el entrenamiento, los pesos LoRA se fusionaron en el modelo base y se exportaron a GGUF con cuantizacion Q4_K_M (tamano de archivo ~5,38 GiB). El autor declara que el foco del ajuste fue el comportamiento conversacional, la identidad del asistente, el seguimiento de instrucciones y las respuestas de proposito general. No se documentan innovaciones arquitectonicas propias ni tecnicas de decodificacion especulativa; el interes esta en el ajuste de estilo (respuestas mas cortas y trazas de razonamiento reducidas), aunque el autor no aporta mediciones de latencia ni de tokens por segundo.

## Capacidades

- Generacion de texto conversacional en ruso con contexto multi-turno.
- Conocimiento general y explicaciones educativas.
- Escritura y generacion de textos.
- Asistencia en programacion (generacion de codigo HTML, CSS y JavaScript, segun la evaluacion interna del autor).
- Seguimiento de instrucciones y mantenimiento de identidad del modelo (responde correctamente sobre su nombre y desarrollador).
- Estilo de respuesta mas corto y directo que el modelo base, con trazas de razonamiento visibles reducidas.
- Inferencia local en hardware compatible con llama.cpp.
- Sin soporte de tool calling ni function calling documentado.
- Sin capacidades de agente o razonamiento multi-paso documentadas.
- Sin soporte multimodal: aunque Qwen3.5-9B original es multimodal, esta exportacion GGUF no incluye los componentes de vision ni audio.

## Casos de uso

- Asistente conversacional local en ruso: el modelo puede mantener dialogos multi-turno en un equipo de sobremesa con GPU de consumo, gracias a su cuantizacion Q4_K_M de ~5,38 GiB y su enfoque en respuestas directas.
- Chatbot de atencion al cliente en ruso: adecuado para respuestas breves y claras en entornos donde no se puede enviar datos a la nube, aunque requiere validacion humana por el riesgo de alucinacion.
- Generacion de borradores de texto y correos en ruso: el modelo produce respuestas concisas, util para tareas de redaccion asistida donde prima la brevedad.
- Apoyo educativo: explicaciones de fisica y conocimiento general, area en la que el autor reporta buenos resultados en su evaluacion interna (92/100 en su prueba de fisica).
- Prototipado rapido de paginas web: el autor documenta la generacion de un planificador de estudios con HTML, CSS y JavaScript funcional (gestion de tareas, busqueda, filtros, estadisticas y almacenamiento local), util como punto de partida en entornos de desarrollo.
- Despliegue en entornos con hardware limitado: al caber en GPUs de consumo y ejecutarse con Ollama o LM Studio, sirve para demos, pruebas de concepto y estaciones de trabajo sin aceleradores de datacenter.
- Asistencia de programacion basica en local: generacion de fragmentos de codigo para tareas sencillas, siempre con revision manual dado que el autor advierte que los resultados complejos deben verificarse.

## Benchmarks y rendimiento

El autor publica una comparacion interna manual (escala 0-100, evaluacion estatica del codigo, no un benchmark independiente) frente a Qwen3.5-9B y YandexGPT 5 Lite 8B Instruct:

| Categoria | Torqen | Qwen3.5-9B | YandexGPT 5 Lite |
|---|---:|---:|---:|
| Identidad y conversaciones | 92/100 | 86/100 | 80/100 |
| Conocimiento general y fisica | 92/100 | 85/100 | 89/100 |
| Generacion de sitios web | 68/100 | 51/100 | 25/100 |
| **Media** | **84,0** | **74,0** | **64,7** |

No se han publicado resultados de benchmarks estandarizados (MMLU, HumanEval, GSM8K u otros) en la informacion disponible. El autor no ha medido latencia ni tokens por segundo.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 6-7 GB con Q4_K_M (archivo de 5,38 GiB mas overhead de contexto y cache KV).
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090; en datacenter, A100 o H100 para mayor throughput, aunque no son necesarias.
- Cabe en GPUs de consumo: si, en tarjetas con 8 GB o mas de VRAM; con 6 GB puede requerir offload parcial a CPU segun la longitud de contexto.
- Opciones de despliegue: llama.cpp (build reciente con soporte de la arquitectura Qwen3.5), LM Studio, Ollama (mediante Modelfile), y cualquier runtime compatible con GGUF.
- Latencia y throughput: no disponibles; el autor no ha realizado mediciones estandarizadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Torqen v1 9B 0311 | ~9,2B | No disponible | Ruso | Apache 2.0 | GGUF (Q4_K_M) | Fine-tune LoRA de Qwen3.5-9B, 638 ejemplos |
| Qwen3.5-9B | ~9,4B | No disponible | Multilingue | Apache 2.0 (segun modelo base) | Safetensors, GGUF | Modelo base original, multimodal en su version completa |
| YandexGPT 5 Lite 8B Instruct | ~8B | No disponible | Ruso | No disponible | No disponible | Modelo propietario de Yandex, comparado por el autor |
| Torqen 1 beta 0.8B | ~0,8B | No disponible | Ruso | No disponible | GGUF (~812 MB) | Version ligera previa del mismo autor, para hardware muy limitado |

## Limitaciones y advertencias

- Modelo experimental entrenado con solo 638 ejemplos; el ajuste es superficial y puede no preservar todas las capacidades del modelo base.
- Riesgo elevado de alucinacion: el autor advierte explicitamente que puede producir informacion incorrecta.
- Los resultados en matematicas y programacion complejas deben verificarse de forma independiente.
- Los benchmarks publicados son una evaluacion interna manual sobre pocas tareas, no un benchmark independiente ni reproducible.
- Soporte unicamente de texto: sin vision ni audio, pese a que el modelo base es multimodal.
- Idioma limitado al ruso; no se documenta rendimiento en castellano ni en otros idiomas.
- Longitud de contexto no especificada; conviene validarla empiricamente antes de usos con documentos largos.
- Licencia Apache 2.0 permite uso comercial, pero al ser un derivado de Qwen3.5-9B conviene revisar los terminos del modelo base.
- Sin soporte documentado de tool calling ni de flujos de agente, lo que limita su integracion en pipelines automatizados.
- Solo se distribuye Q4_K_M; no hay otras cuantizaciones ni pesos sin cuantizar publicados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/srmftech/Torqen-v1-9B-0311-GGUF
- Descarga directa del GGUF: https://huggingface.co/srmftech/Torqen-v1-9B-0311-GGUF/resolve/main/Torqen-v1-9b-0311-Q4_K_M.gguf
- Version ligera del mismo autor: https://huggingface.co/srmftech/Torqen
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
