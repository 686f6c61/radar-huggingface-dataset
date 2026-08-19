# TheOneWhoWill/Coding-Monkey-Gemma-GGUF

## Resumen

Coding-Monkey-Gemma es un fine-tune del modelo instructivo de Google Gemma 4 12B (google/gemma-4-12B-it), desarrollado por el usuario TheOneWhoWill con el objetivo de mejorar de forma significativa la fiabilidad del tool calling (llamada a herramientas) en tareas de codificacion y agentes. El modelo base, a pesar de sus capacidades generales, falla en tareas basicas de codigo porque no utiliza correctamente las herramientas del entorno agente; este ajuste fino corrige ese comportamiento, elevando la precision exacta en la invocacion de herramientas del 31,3% al 83,6% segun las metricas publicadas por el autor.

El modelo se entrena mediante QLoRA sobre un dataset concentrado de 4.345 ejemplos de alta calidad de tool calling y acciones de agente, combinando datos de glaiveai y AgentInstruct. Se distribuye en formato GGUF con varias cuantizaciones (fp16, Q8_0, Q6_K, Q5_K_M, Q4_K_M), lo que permite su ejecucion en GPUs de consumo con requisitos de VRAM moderados. Su relevancia radica en ofrecer una alternativa ligera a modelos de mayor tamano como Gemma 4 26B para desarrolladores que necesitan un asistente de codigo local con tool calling fiable sin comprometer demasiado el rendimiento por cuantizacion agresiva.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (decoder-only) basado en google/gemma-4-12B-it |
| Parametros totales | 12 mil millones (modelo base) |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible (hereda la del modelo base, no especificada) |
| Tipos de cuantizacion | fp16, Q8_0, Q6_K, Q5_K_M, Q4_K_M (formato GGUF) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA (r=16, alpha=32) aplicado sobre el transformer decoder-only de Gemma 4 12B instructivo. El entrenamiento se realizo con QLoRA (cuantizacion de 4 bits del modelo base) durante 3 epocas, con una tasa de aprendizaje de 2e-4 con programacion coseno y un tamano de lote efectivo de 32. El proceso completo tardo 2 horas y 44 minutos en una GPU NVIDIA GeForce RTX 5070 Ti de 16 GB, tras un prototipado previo de 30 horas agregadas. La perdida de entrenamiento descendio de 1.585 a 0.264, y la perdida de validacion (held-out) fue de 0.225.

El dataset de entrenamiento consta de 4.345 ejemplos, divididos en 4.259 para entrenamiento y 86 para validacion (98/2). La composicion por fuente es: 3.347 ejemplos de glaiveai/glaive-function-calling-v2 (multi-turn, formato OpenAI), 336 de zai-org/AgentInstruct (alfworld), 351 de webshop, 195 de sistema operativo y 116 de mind2web. Todos los ejemplos se formatearon con la plantilla de chat nativa de Gemma 4. El autor eligio un dataset pequeno y concentrado para evitar el sobreajuste observado en intentos anteriores.

## Capacidades

- Generacion de texto y codigo: el modelo mantiene las capacidades de generacion de texto del modelo base Gemma 4 12B, con especial enfasis en tareas de programacion.
- Tool calling fiable: mejora sustancial en la generacion de llamadas a herramientas con sintaxis ChatML correcta y colocacion adecuada de parametros. La precision exacta pasa del 31,3% al 83,6% y la validez de formato del 85,1% al 98,5%.
- Uso proactivo de herramientas: el modelo emite llamadas a herramientas con mayor frecuencia (del 85,1% al 98,5% de las veces), lo que resulta critico en entornos agente donde debe decidir cuando invocar funciones.
- Soporte de agentes y razonamiento multi-paso: entrenado con ejemplos de AgentInstruct que incluyen acciones reales de bash y terminal, puede integrarse en pipelines de agentes para tareas como navegacion web, gestion de archivos o interaccion con sistemas operativos.
- Multilingue: no se dispone de informacion especifica sobre idiomas soportados; se asume que hereda las capacidades del modelo base, pero no esta confirmado.
- No se reportan capacidades de vision, audio u otras modalidades.

## Casos de uso

- Asistente de codigo local en IDE: el modelo puede integrarse en editores como VS Code o Neovim para autocompletar y generar funciones, y gracias a su tool calling fiable puede invocar comandos de terminal, ejecutar tests o consultar documentacion dentro del entorno de desarrollo.
- Automatizacion de tareas de desarrollo: en pipelines de CI/CD, el modelo puede generar scripts de build, analizar logs y llamar a APIs de integracion continua (por ejemplo, GitHub Actions) mediante function calling, reduciendo la intervencion manual.
- Agente de navegacion web para investigacion: gracias a los ejemplos de mind2web y webshop, puede controlar un navegador para buscar informacion, rellenar formularios o extraer datos, util para automatizar tareas de scraping o testing de aplicaciones web.
- Gestion de sistemas y operaciones: con los ejemplos de sistema operativo de AgentInstruct, puede ejecutar comandos bash, gestionar procesos y archivos, y diagnosticar problemas en servidores, actuando como un asistente de operaciones.
- Chatbot de soporte tecnico con integracion de herramientas: en un entorno de atencion al cliente, el modelo puede llamar a APIs de CRM, bases de conocimiento o sistemas de ticketing para resolver consultas de usuarios de forma automatica.
- Prototipado rapido de agentes conversacionales: al estar disponible en GGUF, se puede desplegar con llama.cpp u Ollama en hardware modesto para experimentar con arquitecturas de agentes sin necesidad de GPUs de gran tamano.

## Benchmarks y rendimiento

El autor proporciona metricas propias de evaluacion de tool calling comparando el modelo base `-it` con el fine-tune. Los resultados se obtuvieron sobre 67 prompts de validacion no vistos durante el entrenamiento.

| Metrica | Base `-it` | Fine-tuned | Delta |
|---|---|---|---|
| Validez de formato (Format Validity) | 0.851 | 0.985 | +0.134 |
| Precision relajada (Relaxed Accuracy) | 0.328 | 0.836 | +0.508 |
| Precision exacta (Exact Accuracy) | 0.313 | 0.836 | +0.522 |
| Fraccion de llamadas emitidas (Emitted Calls Fraction) | 0.851 | 0.985 | +0.134 |

No se han publicado resultados en benchmarks estandar como MMLU, HumanEval o GSM8K en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con cuantizacion Q4_K_M (tamano aproximado de 7-8 GB para un modelo de 12B), cabe en GPUs de consumo con 8-12 GB de VRAM. Con Q8_0 (aproximadamente 12-13 GB), se requiere al menos 16 GB. La version fp16 necesita alrededor de 24 GB.
- GPU recomendadas: para Q4_K_M, una RTX 3060 de 12 GB o RTX 4060 Ti de 16 GB son suficientes. Para Q8_0, una RTX 4070 Ti Super de 16 GB o RTX 4080. Para fp16, se recomienda una A100 de 40 GB o H100.
- Compatibilidad con consumer GPU: si, especialmente con cuantizaciones Q4_K_M y Q5_K_M en tarjetas de 8-12 GB.
- Opciones de despliegue: al ser GGUF, es compatible con llama.cpp, Ollama, LM Studio y servidores como llama-cpp-python. Tambien puede cargarse con transformers si se convierte a safetensors (aunque el repo solo ofrece GGUF).
- Latencia y throughput: no se proporcionan datos oficiales. Como referencia, un modelo de 12B en Q4_K_M en una RTX 4090 suele generar entre 40 y 60 tokens por segundo con llama.cpp, pero esto es una estimacion orientativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling (exact accuracy) | Licencia | Formato |
|---|---|---|---|---|---|
| Coding-Monkey-Gemma (fine-tune) | 12B | No disponible | 83.6% | Apache 2.0 | GGUF |
| google/gemma-4-12B-it (base) | 12B | No disponible | 31.3% | Apache 2.0 | Safetensors |
| google/gemma-4-26B-it (mencionado en el texto) | 26B | No disponible | No reportado | Apache 2.0 | Safetensors |

La comparativa se limita a los modelos mencionados en la informacion proporcionada. No se dispone de datos de otros fine-tunes de tool calling comparables.

## Limitaciones y advertencias

- Sesgos y alucinaciones: al ser un fine-tune de un modelo base, puede heredar sesgos de Gemma 4 y generar contenido incorrecto o inventado, especialmente en tareas no relacionadas con tool calling.
- Especializacion limitada: el entrenamiento se centro exclusivamente en tool calling y acciones de agente; el rendimiento en otras tareas de codigo o razonamiento general puede no mejorar respecto al modelo base.
- Riesgo de sobreajuste: el autor menciona haber encontrado sobreajuste en intentos previos; aunque el dataset final es pequeno y concentrado, existe riesgo de que el modelo memorice patrones especificos de los datos de entrenamiento.
- Contexto y longitud: no se especifica la longitud de contexto del modelo base; se asume que es la de Gemma 4 12B, pero no esta confirmado. Para tareas con contexto muy largo, puede ser necesario verificar el limite real.
- Restricciones de licencia: la licencia Apache 2.0 permite uso comercial, pero el modelo base Gemma 4 tiene sus propios terminos (aunque tambien Apache 2.0 segun la informacion). Se recomienda revisar la politica de uso de Google para Gemma.
- Disponibilidad de pesos: el repo solo ofrece GGUF; para usar con transformers u otros frameworks puede ser necesario convertir los pesos, lo que podria requerir acceso al adaptador LoRA original (no publicado).

## Enlaces

- Repositorio HuggingFace del modelo: https://huggingface.co/TheOneWhoWill/Coding-Monkey-Gemma-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-12B-it (no verificado en la busqueda, se infiere del ID)
- Dataset glaiveai/glaive-function-calling-v2: no se proporciona enlace directo, pero se menciona en el README.
- Dataset zai-org/AgentInstruct: no se proporciona enlace directo, se menciona en el README.
- Repositorio de Gemma de Google DeepMind: https://github.com/google-deepmind/gemma
- Guia de ejecucion de Gemma de Google AI: https://ai.google.dev/gemma/docs/run
- Cookbook de Gemma: https://github.com/google-gemma/cookbook
