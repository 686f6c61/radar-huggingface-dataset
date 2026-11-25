# win10kimo/Gemma-4-E4B-Gemini-3.5-FlashLite-Distill-GGUF

## Resumen

Gemma-4-E4B-Gemini-3.5-FlashLite-Distill es un ajuste fino por QLoRA del modelo `google/gemma-4-E4B-it`, desarrollado por el usuario win10kimo y distribuido en formato GGUF. El objetivo es especializar el modelo base en tareas de linea de comandos y scripting (PowerShell, Batch, VBScript, Bash, Git y SQL), ademas de mantener capacidades generales de codigo, vision y tool calling. El entrenamiento combina unos 6.000 ejemplos sinteticos de CLI y scripting destilados de Gemini 3.5 Flash-Lite con 1.500 muestras de chat y codigo general de `mlabonne/FineTome-100k`.

El modelo parte de la arquitectura Gemma 4 en su variante E4B, con 7.518.069.290 parametros totales segun los pesos en safetensors del modelo base y una ventana de contexto que no se especifica en la informacion disponible. La distribucion se hace como cuantizacion Q4_K_M de 4,97 GB mas un proyector de vision BF16 de 0,92 GB, lo que permite ejecutarlo en GPUs de consumo con 6 GB o mas de VRAM mediante llama.cpp o LM Studio.

La relevancia de esta ficha es doble: por un lado, ilustra el flujo tipico de destilacion sintetica sobre un modelo abierto con licencia Apache 2.0; por otro, muestra un caso de especializacion vertical (automatizacion de terminal y scripting) sobre un modelo multimodal pequeno. Conviene senalar que el repositorio no registra descargas ni likes en el momento de la consulta y que no se han publicado resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (Gemma 4 E4B), con proyector de vision separado |
| Parametros totales | 7.518.069.290 (7,98B segun la model card; 4,5B efectivos) |
| Parametros activos | no disponible (la model card menciona 4,5B efectivos, pero no confirma si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M (GGUF); proyector de vision en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`gemma-4-E4B-it-Q4_K_M.gguf` y `mmproj-gemma-4-E4B-it-BF16.gguf`) |

## Arquitectura y entrenamiento

El modelo base es `google/gemma-4-E4B-it`, un transformer multimodal de la familia Gemma 4. La model card indica 7,98B parametros totales y 4,5B efectivos, aunque no aclara si esa diferencia corresponde a una arquitectura de mezcla de expertos (MoE) o a otra tecnica de eficiencia; este dato queda como no disponible. El pipeline declarado es `image-text-to-text`, y el repositorio incluye un proyector de vision independiente (`mmproj-...-BF16.gguf`) que habilita la entrada de imagenes en llama.cpp y LM Studio.

El ajuste fino se realizo con QLoRA sobre `unsloth/gemma-4-E4B-it`, con rango `r=16`, `alpha=16`, tasa de aprendizaje `2e-5`, una epoca y 918 pasos, aplicando enmascaramiento de perdida solo sobre la respuesta. El dataset combina 5.990 filas sinteticas de CLI y scripting generadas por destilacion desde Gemini 3.5 Flash-Lite, que incluyen trazas de razonamiento con el canal `<|channel>thought`, mas 1.500 filas de `mlabonne/FineTome-100k` para preservar capacidades generales de chat y codigo. No se documenta el numero total de tokens de entrenamiento ni si hubo fases de RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y conversacion multi-turno en ingles (idiomas no confirmados).
- Generacion de codigo y scripting especializado en PowerShell, Batch, VBScript, Bash, Git y SQL.
- Modo de razonamiento explicito mediante el canal `<|channel>thought`, activable con el token de apertura correspondiente.
- Entrada de imagenes a traves del proyector de vision incluido en el repositorio.
- Soporte de tool calling y function calling, segun la model card.
- Flujos de agentes y razonamiento multi-paso, apoyados en el modo thinking.
- Capacidades generales de chat y codigo heredadas del modelo base y reforzadas con FineTome-100k.
- Compatibilidad con endpoints y clientes que consumen modelos GGUF via llama.cpp o LM Studio.

## Casos de uso

- Automatizacion de terminal en Windows: el modelo puede generar y explicar scripts de PowerShell y Batch para tareas de administracion, aprovisionamiento o limpieza de sistemas, gracias al entrenamiento especifico en estas shell.
- Migracion de scripts legacy: resulta adecuado para traducir VBScript o Batch antiguos a PowerShell moderno, ya que el dataset de destilacion cubre ambos lenguajes y sus patrones habituales.
- Asistente de Git y control de versiones: puede redactar comandos, resolver conflictos y proponer flujos de ramas, integrable en un IDE o en un bot de chat interno.
- Generacion y revision de SQL: util para escribir consultas, explicar planes de ejecucion o detectar patrones problematicos en un pipeline de revision de codigo.
- Automatizacion de tareas con tool calling: al soportar function calling, puede conectarse a APIs de sistema, ejecutar comandos controlados y encadenar pasos en un agente local.
- Analisis de capturas de terminal o diagramas: gracias al proyector de vision, puede interpretar una imagen de una consola con errores y proponer la correccion correspondiente.
- Despliegue local en estaciones de trabajo: con 4,97 GB en Q4_K_M cabe en GPUs de 6 GB o mas, lo que permite usarlo como asistente offline sin enviar codigo a servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 5 GB para el modelo Q4_K_M (4,97 GB) mas el proyector de vision BF16 (0,92 GB); en total, en torno a 6 GB si se usa vision.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 8 GB, RTX 4070, RTX 4090, A100 o H100; cualquier GPU con 6-8 GB o mas puede ejecutar la cuantizacion Q4_K_M.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas de VRAM; con 8 GB hay margen para contexto amplio y vision.
- Opciones de despliegue: llama.cpp, LM Studio, Ollama (previa conversion o importacion del GGUF) y servidores compatibles con la API de llama.cpp.
- Ajustes recomendados por el autor: thinking activado con `<|channel>thought\n`, token de parada `<turn|>`, temperatura 0,2-0,4 para codigo y herramientas, 1,0 para chat general, top-p 0,95, top-k 64 y repeat penalty 1,0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Gemma-4-E4B-Gemini-3.5-FlashLite-Distill (este) | 7,98B totales / 4,5B efectivos | no disponible | Apache 2.0 | GGUF Q4_K_M + proyector vision | Especializado en CLI y scripting |
| google/gemma-4-E4B-it (base) | 7,98B totales / 4,5B efectivos | no disponible | Apache 2.0 | safetensors, GGUF | Modelo generalista multimodal sin especializacion en shell |
| mlabonne/FineTome-100k (dataset) | no aplica | no aplica | no disponible | no aplica | Fuente de 1.500 muestras de chat y codigo del ajuste |
| Gemini 3.5 Flash-Lite (profesor) | no disponible | no disponible | propietaria | API | Fuente de los ejemplos sinteticos de CLI; no es un modelo abierto |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que el rendimiento real frente al modelo base no esta cuantificado.
- El entrenamiento se basa en datos sinteticos generados por un modelo propietario (Gemini 3.5 Flash-Lite); pueden aparecer sesgos o errores heredados de esa destilacion.
- Riesgo de alucinacion en comandos de shell: un script generado con parametros incorrectos puede ser destructivo; se recomienda revision humana antes de ejecutarlo.
- Idiomas soportados no documentados; el entrenamiento se realizo presumiblemente en ingles y el soporte multilingue no esta garantizado.
- Longitud de contexto no especificada; no se debe asumir una ventana mayor que la del modelo base sin verificacion.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay validacion de la comunidad ni reportes de uso en produccion.
- Aunque la licencia es Apache 2.0, conviene verificar las condiciones del modelo base `google/gemma-4-E4B-it` y del dataset `mlabonne/FineTome-100k` antes de un uso comercial.
- El uso de vision requiere cargar el proyector `mmproj` junto al GGUF; sin el, la entrada de imagenes no funciona.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/win10kimo/Gemma-4-E4B-Gemini-3.5-FlashLite-Distill-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B-it
- Base usada en el entrenamiento (Unsloth): https://huggingface.co/unsloth/gemma-4-E4B-it
- Dataset de chat y codigo: https://huggingface.co/datasets/mlabonne/FineTome-100k
- llama.cpp: https://github.com/ggml-org/llama.cpp
- LM Studio: https://lmstudio.ai
