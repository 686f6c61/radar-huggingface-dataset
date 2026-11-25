# theatechcorporation/amaara-code-flash-v8-FP8

## Resumen

Amaara Code Flash v8 es un ajuste fino (fine-tuning) orientado a agentes de programación y a la invocación de herramientas (tool calling), construido sobre el modelo base GLM-4.7-Flash de Zhipu AI, en su versión redistribuida por Unsloth. Lo desarrolla theatechcorporation, un proyecto que publica una familia de modelos Amaara Code en varios tamaños (4B, 20B y esta variante basada en GLM) generados todos a partir del mismo corpus canónico de conversaciones. Esta ficha corresponde concretamente al repositorio de pesos en formato FP8, que ocupa 31,2 GB.

El modelo emplea una arquitectura Mixture of Experts (MoE) con 31,2 mil millones de parámetros totales y aproximadamente 3 mil millones de parámetros activos por token, según indica la model card. Su propósito declarado es servir como agente de código capaz de encadenar ediciones, ejecución de tests y autocorrección dentro de un bucle de verificación. El autor lo etiqueta explícitamente como lanzamiento experimental, destinado solo a evaluación, y desaconseja su uso en producción.

La relevancia de esta ficha radica en su enfoque de datos: toda la familia Amaara Code comparte el mismo almacén de conversaciones y solo cambia la plantilla de chat por arquitectura (GLM aquí, Qwen ChatML en el 4B y Harmony en el 20B), lo que en teoría permite comparaciones entre tamaños atribuibles al modelo y no al dataset. No obstante, la información pública disponible es escasa: no hay resultados de benchmarks publicados, ni idiomas declarados, ni datos de entrenamiento detallados más allá de la selección por forma de trayectoria.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE) sobre transformer, heredada de GLM-4.7-Flash |
| Parámetros totales | 31,2 mil millones (31,2B) |
| Parámetros activos | aproximadamente 3 mil millones (~3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | FP8 (este repositorio); otras variantes en repositorios separados `amaara-code-flash-v8-*` |
| Idiomas soportados | no disponible |
| Licencia | A-TECH Model License plus upstream (MIT del modelo base, aplicada de forma adicional) |
| Formato de pesos | safetensors (librería transformers), repositorio de 31,2 GB |

## Arquitectura y entrenamiento

El modelo parte de GLM-4.7-Flash, un transformer con capas MoE en el que solo se activan unos 3B de los 31,2B parámetros totales por token, lo que reduce el coste de inferencia respecto a un modelo denso del mismo tamaño. El ajuste fino se realizó sobre un corpus canónico de conversaciones compartido por toda la familia Amaara Code; la única diferencia entre variantes es la plantilla de chat, adaptada a la arquitectura de destino (plantilla GLM en este caso).

El proceso de selección de datos se describe por «forma de trayectoria»: se conservan las trazas verificadas de tipo edición→test→éxito y las de autocorrección, se descartan las trazas de edición sin verificación y las trazas largas no se eliminan, sino que se recortan en ventanas alrededor de la cola edición→verificación. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones de decodificación (especulativa, atención lineal u otras).

## Capacidades

- Generación de código y edición de ficheros dentro de flujos de agente, con énfasis en el ciclo editar, ejecutar tests y corregir.
- Invocación de funciones y herramientas (function calling / tool calling), rasgo central del ajuste.
- Razonamiento multi-paso y autocorrección sobre trazas de conversación encadenadas.
- Integración con interfaces de línea de comandos de agente, evaluado con A-Coder-CLI.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible` en el repositorio).
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo de pensamiento (thinking), visión o audio: no disponibles en la información proporcionada.

## Casos de uso

- Agente de corrección de bugs en repositorios: el modelo puede recibir un fallo, localizar el fichero afectado, proponer una edición, ejecutar la suite de tests y reintentar si falla, gracias a su ajuste sobre trazas verificadas edición→test→éxito.
- Automatización de refactorizaciones con verificación: se le puede encadenar en un pipeline que aplique cambios y valide con tests unitarios antes de abrir una pull request, aprovechando su tendencia a la autocorrección.
- Asistente de CI/CD: integrado vía tool calling con el sistema de integración continua, puede interpretar logs de fallo y proponer parches acotados.
- Evaluación comparativa de modelos de código: al compartir corpus con las variantes 4B y 20B de Amaara Code, sirve para estudiar cómo escala el rendimiento con el tamaño bajo datos idénticos.
- Generación de tests a partir de código existente: puede producir casos de prueba y ejecutarlos dentro de un bucle de agente para validar su propia salida.
- Prototipado de agentes de terminal: su evaluación con A-Coder-CLI lo hace adecuado para experimentar con asistentes que operan sobre la shell en entornos controlados de laboratorio.
- Investigación sobre datos de entrenamiento para agentes: el criterio de selección por forma de trayectoria es un caso de estudio reproducible para quienes diseñan corpus de código.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona una evaluación con A-Coder-CLI sobre un conjunto de 20 tareas derivadas de SWE-bench, con 3 ejecuciones por tarea y bootstrap agrupado, pero remite los resultados al «training logbook» del proyecto y no incluye cifras en el repositorio.

## Requisitos de hardware

- VRAM estimada: los pesos en FP8 ocupan 31,2 GB, por lo que la inferencia requiere al menos unos 32 GB de VRAM solo para los pesos, más margen para caché KV y overhead; el total práctico dependerá de la longitud de contexto, que no se especifica.
- GPU recomendadas: A100 de 40/80 GB, H100 de 80 GB o L40S de 48 GB para FP8 nativo; una RTX 6000 Ada de 48 GB podría alojar los pesos con margen limitado.
- GPU de consumo: una RTX 4090 de 24 GB no puede alojar los pesos FP8 completos; sería necesaria una cuantización adicional (por ejemplo, a 4 bits) no publicada en este repositorio.
- Despliegue: al usar transformers, es compatible con vLLM y TGI si soportan la arquitectura GLM-4.7-Flash en FP8; llama.cpp u Ollama requerirían una conversión a GGUF no disponible en la información proporcionada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Amaara Code Flash v8 FP8 | 31,2B | ~3B | no disponible | A-TECH + MIT upstream | Hugging Face, experimental |
| GLM-4.7-Flash (base) | 31,2B | ~3B | no disponible | MIT (según upstream) | Hugging Face (Unsloth) |
| Amaara Code 20B (Harmony) | no disponible | no disponible | no disponible | A-TECH | Hugging Face, experimental |
| Amaara Code 4B (Qwen ChatML) | no disponible | no disponible | no disponible | A-TECH | Hugging Face, experimental |

La comparación con alternativas externas de la misma categoría (agentes de código MoE de ~30B) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- Lanzamiento experimental: el autor prohíbe explícitamente su uso en producción hasta que se publiquen versiones oficiales.
- Licencia doble: la A-TECH Model License se aplica de forma adicional al MIT del modelo base; es necesario revisar sus términos antes de cualquier uso comercial.
- Sin benchmarks publicados: no hay cifras verificables de rendimiento en el repositorio, lo que impide estimar su calidad frente a alternativas.
- Idiomas no declarados: se desconoce el soporte multilingüe real más allá del inglés implícito en el corpus de código.
- Longitud de contexto no disponible: no puede planificarse su uso en tareas que requieran ventanas largas sin verificación previa.
- Riesgo de alucinación: no cuantificado en la información disponible; en tareas de código, el riesgo se mitiga con el bucle de tests, pero no se documenta su tasa de fallo.
- Sesgos: no documentados.
- Trazabilidad limitada: los resultados de evaluación se remiten a un logbook externo no enlazado en el repositorio.
- Repositorio con cero descargas y cero likes en el momento de la consulta, lo que sugiere ausencia de validación por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/theatechcorporation/amaara-code-flash-v8-FP8
- Modelo base: https://huggingface.co/unsloth/GLM-4.7-Flash
- Licencia A-TECH: https://github.com/hamishfromatech/a-tech-license/blob/main/A-TECH-MODEL-LICENSE.md
- Herramienta de evaluación A-Coder-CLI: https://github.com/hamishfromatech/a-coder-cli
- Comunidad AI Owner's Club: https://www.skool.com/open-source-ai-builders-club/about
