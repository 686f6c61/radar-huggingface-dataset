# whittleOrg/Whittle-Next-27B-A3B

## Resumen

Whittle-Next-27B-A3B es un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por whittleOrg (logic65) como bifurcación experimental del Qwen3.6-35B-A3B. Su objetivo no es ser un modelo de propósito general terminado, sino servir como base de investigación para la arquitectura `qwen4_exp` (formato Qwen3.8-Flash-Next), incorporando innovaciones como hyper-connections, memoria n-gram hasheada de 2B filas y embeddings por capa. Con 27.568.288.915 parámetros totales declarados en safetensors y un repositorio de 596,5 GB, el modelo se distribuye con licencia Apache 2.0.

El modelo ha pasado por cuatro fases de entrenamiento (v1 a v4) que incluyen destilación de conocimiento desde Qwen3.8-27B, transferencia exacta de la tabla n-gram de Qwen3.8-Flash-Next y destilación online sobre trazas de razonamiento completas. La versión publicada en la raíz del repositorio es la v4.4, entrenada sobre 1.840 trazas completas de matemáticas y revisión de código. El autor lo describe explícitamente como una "research preview" con limitaciones, no como un producto listo para producción.

La relevancia actual del modelo reside en su valor como artefacto de investigación: es un cuerpo que ya carga y ejecuta en llama.cpp estándar (sin parches), con todos los tensores necesarios para seguir entrenándolo (cuerpo congelado, checkpoint entrenable, tabla, contrato de hash, entrenador y exportador). Los GGUF están disponibles en un repositorio separado, con cuantizaciones desde Q8_0 hasta Q3_K_M.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con hyper-connections, memoria n-gram hasheada y embeddings por capa; formato `qwen4_exp` |
| Parámetros totales | 27.568.288.915 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible (evaluado hasta 75k tokens en el arnés de lectura de contexto largo) |
| Tipos de cuantización | Q8_0 a Q3_K_M (GGUF en repositorio separado) |
| Idiomas soportados | en, zh, multilingüe |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (pesos completos), GGUF (para llama.cpp) |

## Arquitectura y entrenamiento

El modelo es una variante MoE construida sobre Qwen3.6-35B-A3B, adaptada al formato `qwen4_exp` de Qwen3.8-Flash-Next. Incorpora tres elementos técnicos destacables: hyper-connections (streams que, según el autor, son "genuinamente diferentes entre sí"), una memoria n-gram hasheada de 2B filas y embeddings por capa. El entrenamiento se organizó en cuatro fases: v1–v3 (3–4 de septiembre) construyeron el cuerpo, hicieron la memoria "load-bearing" y completaron la destilación de razonamiento; v4 (7–10 de septiembre) sustituyó el contenido de la memoria por una transferencia exacta de la tabla n-gram de Qwen3.8-Flash-Next, enseñó a las capas posteriores al punto de inyección a leerla y ejecutó tres noches de destilación solo de expertos sobre trazas de pensamiento completas, reduciendo los desbordamientos en respuestas largas de 6 en 40 a 0. La versión v4.4 (17–18 de septiembre) desbloqueó todas las partes entrenables simultáneamente y destiló sobre 1.840 trazas completas de matemáticas y revisión de código.

La destilación es de tipo online y de conocimiento, con linaje desde Qwen3.8-27B y Qwen3.8-Flash-Next. El autor indica que el presupuesto de cómputo está agotado y que la destilación completa que el modelo necesitaría no se ha podido financiar. El modelo base declarado es Qwen/Qwen3.6-35B-A3B, con relación de finetune, y también figura logic65/Whittle-Next-26B-A3B como base secundaria.

## Capacidades

- Generación de texto conversacional en inglés, chino y otros idiomas (etiqueta multilingüe).
- Razonamiento con modo "thinking" (pensamiento) activable y desactivable.
- Matemáticas de nivel escolar (evaluado en GSM8K).
- Generación y revisión de código, incluyendo lectura de pull requests y ficheros de repositorio.
- Lectura de contexto largo, evaluada hasta 75k tokens en un arnés propio.
- Memoria n-gram hasheada integrada en la arquitectura, que el autor reporta como "load-bearing" en la línea sucesora.
- Compatibilidad con llama.cpp estándar sin parches.
- Soporte de tool calling y uso multietapa: el autor menciona que la línea sucesora (Whittle-Qwen-3.8-35B-A3B) corrige Claude Code y el uso de herramientas multietapa, lo que implica que en esta versión esas capacidades no están resueltas.
- No se declara soporte de visión ni audio.

## Casos de uso

- Investigación sobre arquitecturas MoE experimentales: el modelo sirve como banco de pruebas para hyper-connections, memoria n-gram hasheada y embeddings por capa, con todos los artefactos de entrenamiento publicados (cuerpo congelado, checkpoint, tabla, contrato de hash, entrenador, exportador).
- Reproducción de experimentos de destilación: los logs de evaluación y entrenamiento (eval/v3, train/graft-20260912) permiten reproducir y auditar el proceso de destilación online desde Qwen3.8-27B.
- Evaluación de lectura de contexto largo: el arnés de lectura sobre pull requests reales y ficheros de repositorio (4k a 75k tokens, 6 preguntas verificables) es un caso de uso directo para medir degradación con la longitud.
- Desarrollo y validación de exportadores GGUF: al cargar en llama.cpp estándar, sirve para probar pipelines de conversión y cuantización (Q8_0 a Q3_K_M) sobre arquitecturas no convencionales.
- Aritmética de nivel escolar en modo thinking y sin thinking: útil para comparar el efecto del razonamiento explícito en un modelo pequeño con topes de tokens (512 y 2048).
- Revisión de código asistida en entornos de investigación: la evaluación sobre pull requests reales sugiere uso en lectura y respuesta a preguntas sobre cambios de código, siempre con supervisión humana.
- Base para fine-tuning posterior: al incluir el estado de entrenamiento completo, es adecuado para equipos que quieran continuar la destilación o adaptar el cuerpo a dominios concretos.

## Benchmarks y rendimiento

Datos declarados por el autor (no verificados):

| Tarea | Métrica | Resultado |
|---|---|---|
| GSM8K, 200 preguntas, thinking off, tope 512 tokens | exact match (v3 Q8_0 GGUF, llama.cpp estándar) | 86,5 |
| GSM8K, 200 preguntas, thinking on, tope 2048 tokens | exact match (v3 Q8_0 GGUF) | 86,5 |
| Lectura de contexto largo, 4k tokens | preguntas correctas (v4.3, Q8_0) | 100,0 |
| Lectura de contexto largo, 8k tokens | preguntas correctas (v4.3, Q8_0) | 83,3 |
| Lectura de contexto largo, 26k–75k tokens | preguntas correctas (v4.3, Q8_0) | 66,7 |

El autor señala que el modelo padre Qwen3.6-35B-A3B obtiene 100 en la prueba de contexto largo de 26k–75k tokens, frente al 66,7 de este modelo. No se han publicado resultados de MMLU, HumanEval ni otros benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 27.568.288.915 parámetros, en Q8_0 el peso ronda los 27,5 GB y en Q3_K_M aproximadamente 10–11 GB (estimación a partir del número de parámetros, no declarada por el autor).
- GPU recomendadas: no disponible en la información proporcionada.
- Encaje en GPU de consumo: no confirmado por el autor; por tamaño, las cuantizaciones Q3_K_M y Q4 podrían caber en GPUs de 12–16 GB, pero no hay dato oficial.
- Opciones de despliegue: llama.cpp estándar (sin parches), con GGUF Q8_0 a Q3_K_M desde logic65/Whittle-Next-27B-A3B-GGUF; también transformers (librería declarada) y safetensors completos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Whittle-Next-27B-A3B | 27,57B | no disponible (evaluado hasta 75k) | Apache 2.0 | safetensors + GGUF | Research preview, destilado de Qwen3.8-27B |
| Qwen3.6-35B-A3B (modelo base) | no disponible | no disponible | no disponible | Hugging Face | Obtiene 100 en lectura de contexto largo 26k–75k según el autor |
| Whittle-Next-26B-A3B (predecesor) | no disponible | no disponible | no disponible | Hugging Face | Predecesor directo, misma línea de investigación |
| Whittle-Qwen-3.8-35B-A3B (sucesor) | no disponible | no disponible | no disponible | Hugging Face | Memoria n-gram de 10B "load-bearing", corrige tool use multietapa |

No se dispone de datos de benchmarks comparables de terceros en la información proporcionada.

## Limitaciones y advertencias

- El autor declara explícitamente que no es un modelo terminado de propósito general, sino un artefacto de investigación y un punto de partida.
- Los resultados de benchmarks están marcados como no verificados (`verified: false`) y proceden de logs del propio autor.
- Degradación notable en contexto largo: 66,7 frente al 100 del modelo padre en el rango 26k–75k tokens.
- El presupuesto de cómputo está agotado; la destilación completa planificada no se ha ejecutado.
- El uso de herramientas multietapa y Claude Code no está resuelto en esta versión (se corrigió en el sucesor).
- Riesgo de alucinación y sesgos: no documentado en la información disponible.
- Idiomas: solo se declaran en, zh y multilingüe; no hay evaluación específica para castellano.
- Licencia Apache 2.0 permite uso comercial, pero el estado de investigación y la ausencia de verificación desaconsejan producción sin evaluación propia.
- El repositorio pesa 596,5 GB, lo que exige planificación de almacenamiento y ancho de banda.
- El arnés de lectura de contexto largo cita un repositorio privado y las transcripciones están retenidas, lo que limita la reproducibilidad de esa evaluación.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/whittleOrg/Whittle-Next-27B-A3B
- Repositorio GGUF: https://huggingface.co/logic65/Whittle-Next-27B-A3B-GGUF
- Logs de evaluación v3: https://huggingface.co/logic65/Whittle-Next-27B-A3B/tree/main/eval/v3
- Logs de entrenamiento graft-20260912: https://huggingface.co/logic65/Whittle-Next-27B-A3B/tree/main/train/graft-20260912
- Modelo predecesor: https://huggingface.co/logic65/Whittle-Next-26B-A3B
- Modelo sucesor: https://huggingface.co/logic65/Whittle-Qwen-3.8-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Apoyo al autor: https://ko-fi.com/davida81328
