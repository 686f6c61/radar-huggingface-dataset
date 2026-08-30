# zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ5e-mtp

## Resumen

El modelo `zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ5e-mtp` es una versión cuantizada a 5 bits del modelo base `nightmedia/Qwen3.8-27B-Brainwaves-WFH`, un fine-tune del Qwen3.8-27B de Alibaba. La cuantización se ha realizado con la herramienta oQ (oMLX v0.6.4) en formato MLX safetensors, lo que lo hace especialmente adecuado para su ejecución en hardware Apple Silicon. El modelo original es un LLM multimodal denso de 27B parámetros con atención híbrida (lineal en 48 de 64 capas), un vision tower, un cabezal de decodificación especulativa MTP y una ventana de contexto nativa de 262K tokens, extensible a 1M.

Esta cuantización reduce el tamaño del repositorio a 20.3 GB, lo que permite ejecutar el modelo en equipos con memoria unificada moderada. Aunque el nombre sugiere 27B parámetros, los safetensors reportan 5.756.598.512 parámetros, una discrepancia que probablemente se deba a la representación cuantizada de los tensores. El modelo hereda las capacidades del Qwen3.8-27B: generación de texto, razonamiento, coding, agente y automatización de oficina, así como comprensión de imágenes.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso con atención híbrida (lineal en 48 de 64 capas) y vision tower (según modelo base Qwen3.8-27B) |
| Parametros totales | 5.756.598.512 (según safetensors; el nombre indica 27B, posible discrepancia por cuantización) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262K tokens nativo, extensible a 1M (según modelo base) |
| Tipos de cuantizacion | 5-bit (oQ, group size 64); existe versión 8-bit del mismo autor |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | MLX safetensors (cuantizados con oQ) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B, desarrollado por Alibaba, emplea una arquitectura densa con atención híbrida: 48 de sus 64 capas utilizan atención lineal, lo que reduce el coste computacional en contextos largos. Incluye un vision tower para entrada multimodal y un cabezal MTP (multi-token prediction) que acelera la decodificación. El fine-tune `nightmedia/Qwen3.8-27B-Brainwaves-WFH` añade ajustes específicos no documentados en la información disponible. La cuantización oQ aplica precisión mixta de 5 bits con group size 64, optimizada para MLX, manteniendo la calidad general del modelo original. No se dispone de detalles sobre el dataset de entrenamiento del modelo base ni sobre el proceso de fine-tune.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de lógica y matemáticas.
- Generación de código y soporte para flujos de trabajo de programación.
- Comprensión de imágenes (multimodal) gracias al vision tower del modelo base.
- Soporte para agentes y tareas de larga duración (long-horizon agentic tasks).
- Automatización de oficina: resumen de documentos, generación de informes, gestión de correos.
- Ventana de contexto nativa de 262K tokens, ampliable a 1M, adecuada para documentos extensos.
- Decodificación especulativa mediante el cabezal MTP, que mejora la velocidad de inferencia.
- Capacidades multilingües no confirmadas en la información proporcionada.

## Casos de uso

- Asistente de programación en local: el modelo puede autocompletar código, explicar fragmentos y refactorizar proyectos gracias a su entrenamiento en coding y su ventana de contexto amplia, ejecutándose en un Mac con suficiente memoria unificada.
- Agente de automatización de oficina: integrado en scripts o herramientas de productividad, puede redactar correos, resumir actas y generar presentaciones a partir de instrucciones en lenguaje natural.
- Análisis de documentos extensos: con 262K tokens de contexto, permite procesar libros técnicos, informes anuales o expedientes completos sin necesidad de dividirlos en fragmentos.
- Asistente de investigación multimodal: al aceptar imágenes, puede describir figuras, diagramas o capturas de pantalla y combinarlas con texto para responder preguntas complejas.
- Chatbot de atención al cliente con memoria larga: mantiene conversaciones multi-turno con historial extenso, adecuado para soporte técnico o consultoría.
- Prototipado de agentes autónomos: su soporte para razonamiento multi-paso y tool calling (heredado del modelo base) permite construir agentes que planifican y ejecutan tareas en entornos controlados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks específicos para esta cuantización de 5 bits. Los benchmarks del modelo base Qwen3.8-27B están disponibles en la documentación oficial de Alibaba, pero no se incluyen en la información proporcionada. Se recomienda consultar el repositorio oficial para obtener métricas de MMLU, HumanEval, GSM8K y otras pruebas estándar.

## Requisitos de hardware

- Tamaño del repositorio: 20.3 GB, por lo que se requiere al menos 24 GB de memoria unificada para cargar el modelo en RAM/VRAM.
- Diseñado para Apple Silicon (MLX): funciona en Macs con chips M1 Pro/Max/Ultra o M2/M3/M4 con 32 GB o más de memoria unificada.
- En GPUs NVIDIA no se puede ejecutar directamente en formato MLX; sería necesario convertir los pesos a otro formato (por ejemplo, GGUF o safetensors estándar) para usar con vLLM, llama.cpp u Ollama.
- La inferencia se puede realizar con la librería MLX de Apple, que aprovecha la memoria unificada y los aceleradores Neural Engine.
- No se dispone de datos de latencia o throughput para esta cuantización concreta.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización | Formato | Licencia |
|---|---|---|---|---|---|
| zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ5e-mtp | 5.7B (reportado) | 262K | 5-bit oQ | MLX | No disponible |
| zviratko/Qwen3.8-27B-Brainwaves-oQ8e-mtp | 5.7B (reportado) | 262K | 8-bit oQ | MLX | No disponible |
| Qwen3.8-27B (original) | 27B | 262K | Sin cuantizar | safetensors | Apache 2.0 (según documentación oficial) |

La versión de 5 bits ofrece menor huella de memoria que la de 8 bits, a costa de una posible pérdida de precisión. El modelo original sin cuantizar requiere más de 50 GB de memoria, por lo que estas versiones cuantizadas son más accesibles para hardware local.

## Limitaciones y advertencias

- La cuantización de 5 bits puede degradar ligeramente la calidad de las respuestas en tareas de razonamiento complejo o generación de código, en comparación con el modelo original.
- La licencia no está especificada en la ficha de HuggingFace; se debe verificar la licencia del modelo base `nightmedia/Qwen3.8-27B-Brainwaves-WFH` y la de Qwen3.8-27B antes de un uso comercial.
- La discrepancia entre el nombre (27B) y los parámetros reportados en safetensors (5.7B) sugiere que la cuantización podría haber alterado la estructura de los tensores; se recomienda validar el comportamiento del modelo en tareas de prueba.
- No se dispone de información sobre sesgos o alucinaciones específicas de este fine-tune; el modelo base puede presentar los sesgos típicos de los LLM entrenados con datos web.
- El formato MLX limita su uso a entornos Apple; para otros entornos se requiere conversión de pesos.
- La fecha de creación (2026-08-30) es posterior a la fecha actual, lo que sugiere un posible error en los metadatos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zviratko/Qwen3.8-27B-Brainwaves-WFH-oQ5e-mtp
- Versión 8-bit del mismo autor: https://huggingface.co/zviratko/Qwen3.8-27B-Brainwaves-oQ8e-mtp
- Repositorio oficial de Qwen3.8-27B: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Ficha en vLLM Recipes: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Ficha en LM Studio: https://lmstudio.ai/models/qwen3.8
- Herramienta de cuantización oQ: https://github.com/jundot/omlx
