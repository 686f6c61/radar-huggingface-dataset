# Xylolabs/Qwen3.6-35B-A3B-GGUF

## Resumen

Qwen3.6-35B-A3B-GGUF es una cuantización en formato GGUF del modelo Qwen3.6-35B-A3B desarrollado por el Qwen Team de Alibaba Cloud, publicada por Xylolabs. Se trata de una exportación de referencia en cuantización mixta Q4_K_M preparada con llama.cpp, pensada para su ejecución local mediante llama-cpp y compatible con endpoints de inferencia. El modelo base es un transformer de tipo mezcla de expertos (MoE) con 35.505.251.456 parámetros totales y aproximadamente 3.000 millones de parámetros activos por token (la nomenclatura A3B indica los parámetros activos).

La relevancia de esta ficha radica en que ofrece una vía práctica para ejecutar un modelo MoE de 35B en hardware de gama alta de consumo, al reducir el peso de los pesos a unos 21,7 GB en disco. La model card del autor es explícita sobre el alcance de la exportación: no se realizó entrenamiento, calibración ni cuantización nueva para la publicación, sino que se preserva una referencia Q4_K_M verificada contra el modelo base en BF16. La evaluación reportada por el autor se limita a comprobaciones de coincidencia de respuestas y divergencia KL, no a benchmarks de tareas estándar.

El contexto original del modelo base se mantiene en los metadatos, aunque la model card no especifica el valor numérico de la longitud de contexto en la información disponible. Los idiomas declarados son inglés y coreano, y la licencia es Apache 2.0, lo que facilita el uso comercial con las condiciones de la licencia original de Qwen.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); incluye un módulo MTP (multi-token prediction) de una capa |
| Parametros totales | 35.505.251.456 |
| Parametros activos | Aproximadamente 3.000 millones (según nomenclatura A3B; no disponible el dato exacto) |
| Longitud de contexto | No disponible el valor numérico; los metadatos originales del modelo base se conservan sin cambios |
| Tipos de cuantizacion | Q4_K_M mixta: F32 (310 tensores), Q4_K (379 tensores), Q6_K (64 tensores); media de 4,890 bits por peso almacenado |
| Idiomas soportados | Inglés (en), coreano (ko) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama-cpp); archivo Qwen3.6-35B-A3B-Q4_K_M.gguf de 21,713 GB |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer con arquitectura de mezcla de expertos (MoE), con 35.505.251.456 parámetros totales y alrededor de 3.000 millones activos por token. La exportación GGUF conserva los 753 tensores del modelo: 40 capas del modelo principal y 20 tensores adicionales del módulo MTP de una capa. El módulo MTP se incluye en el peso del archivo, pero la generación con esta exportación utiliza únicamente el modelo principal. Los pesos del codificador de visión y del proyector se omiten deliberadamente, por lo que esta referencia es exclusivamente de texto.

No se realizó entrenamiento, calibración ni cuantización nueva para esta publicación: se trata de una referencia Q4_K_M preservada y verificada. La model card no detalla el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO en el modelo base, por lo que esos datos no están disponibles en la información proporcionada. La innovación técnica destacable de esta exportación es la verificación de fidelidad: la evaluación compara la salida Q4 contra el profesor BF16 con una divergencia KL media de 0,040423 y un 90,80 % de acuerdo top-1, sobre cuatro secuencias de evaluación de 2.048 tokens en inglés y coreano y 8.188 posiciones puntuadas.

## Capacidades

- Generación de texto conversacional y de un solo turno, con plantilla de chat original preservada en los metadatos.
- Razonamiento con modo de pensamiento (thinking) activable o desactivable; la model card documenta el flag `--reasoning off` en llama.cpp y comprobaciones específicas de "thinking rechecks".
- Soporte de tool calling y function calling heredado del modelo base (la model card no lo detalla, pero la arquitectura Qwen3 lo incluye; verificar en la documentación del modelo base).
- Capacidades multilingües limitadas a inglés y coreano según los metadatos declarados.
- Módulo MTP (multi-token prediction) presente en los pesos, aunque la generación de esta exportación no lo utiliza.
- Sin capacidades de visión: el codificador de visión y el proyector están omitidos de esta exportación.
- Compatibilidad con endpoints de inferencia (tag `endpoints_compatible`).

## Casos de uso

- Despliegue local de un MoE de 35B en estaciones de trabajo con GPU de 24 GB o más: la cuantización Q4_K_M reduce los pesos a 21,7 GB, permitiendo ejecutar el modelo con llama.cpp y dejar margen para caché KV y buffers.
- Asistente conversacional en inglés o coreano: el modelo conserva la plantilla de chat original y admite conversaciones multi-turno, adecuado para atención al cliente o asistentes internos en esas dos lenguas.
- Razonamiento con modo thinking controlable: útil en pipelines donde se quiere activar el razonamiento paso a paso solo en consultas complejas y desactivarlo para respuestas rápidas de baja latencia.
- Integración en aplicaciones de escritorio o edge con llama-cpp: el formato GGUF y la compatibilidad con llama-cli y llama-server facilitan el empaquetado en herramientas locales sin dependencia de la nube.
- Prototipado e investigación de modelos MoE: la exportación preserva los tensores MTP y los metadatos originales, lo que permite estudiar decodificación especulativa o multi-token prediction aunque esta referencia no la use por defecto.
- Evaluación de fidelidad de cuantizaciones: el autor publica la metodología de comparación KL y acuerdo top-1 contra BF16, útil como referencia para equipos que calibran sus propias cuantizaciones.
- Generación de texto en pipelines por lotes con endpoints compatibles: el tag `endpoints_compatible` sugiere integración con servidores de inferencia estándar, aunque no se reportan cifras de throughput.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta comprobaciones de fidelidad de la cuantización frente al modelo BF16:

| Metrica | Q4_K_M | BF16 (referencia) |
|---|---|---|
| Respuestas principales correctas | 32/33 | 32/33 |
| Rechecks de thinking | 7/7 | 7/7 |
| Perdidas o respuestas rotas contadas | 0 | 0 |
| Divergencia KL media | 0,040423 | 0 (referencia) |
| Acuerdo top-1 | 90,80 % | 100 % |
| Ratio KL | 1,000x (línea base Q4) | no aplica |

La evaluación se realizó sobre cuatro secuencias de 2.048 tokens en inglés y coreano, con 8.188 posiciones puntuadas y contexto de calificación de 8.192. El autor indica explícitamente que estas comprobaciones no evalúan la decodificación MTP ni las entradas de imagen, y que no se reporta velocidad.

## Requisitos de hardware

- VRAM estimada: aproximadamente 21,70 GB solo para los pesos GGUF, más espacio para caché KV, estado recurrente y buffers de trabajo. En la práctica, se recomienda un mínimo de 24 GB de VRAM para contexto corto y más para contextos largos.
- GPU recomendadas: A100 (40/80 GB), H100, RTX 4090 (24 GB) para contexto moderado; RTX A6000 (48 GB) o configuraciones multi-GPU para contextos largos.
- Cabe en GPU de consumo: sí, en RTX 4090 (24 GB) con contexto limitado; en GPUs de 16 GB no cabe la cuantización Q4_K_M completa y requeriría cuantizaciones más agresivas no publicadas en este repo.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), y por extensión cualquier frontend compatible con GGUF como Ollama o LM Studio, aunque la model card solo verifica llama.cpp v0.9.0.
- Latencia y throughput: no reportados por el autor ("Speed is not reported here").

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-GGUF (esta ficha) | 35,5 B | ~3 B (A3B) | No disponible | Apache 2.0 | GGUF Q4_K_M |
| Qwen3.6-35B-A3B (base) | 35,5 B | ~3 B (A3B) | No disponible | Apache 2.0 | Safetensors |
| Otras cuantizaciones GGUF del mismo base | 35,5 B | ~3 B | No disponible | Apache 2.0 | GGUF (varias) |

No se dispone en la información proporcionada de datos de rendimiento comparativo con modelos de la misma categoría (por ejemplo, otros MoE de ~30-40B con ~3B activos), por lo que la comparativa se limita a parámetros, licencia y formato.

## Limitaciones y advertencias

- Solo texto: el codificador de visión y el proyector están omitidos, por lo que no admite entradas de imagen pese a que el modelo base podría tenerlas.
- Idiomas limitados a inglés y coreano según los metadatos; el rendimiento en castellano no está verificado y probablemente sea inferior.
- La evaluación publicada es de fidelidad de cuantización, no de calidad de tareas; no hay benchmarks estándar que permitan comparar con otros modelos.
- El módulo MTP está presente en los pesos pero no se usa en la generación de esta exportación; no se ha evaluado su decodificación.
- Riesgo de alucinación inherente a los modelos de lenguaje; no se documentan mitigaciones específicas.
- Sesgos conocidos: no documentados en la información disponible.
- Licencia Apache 2.0, que permite uso comercial, pero se debe conservar el aviso NOTICE que identifica a Qwen Team y Alibaba Cloud; el autor declara que se proporciona "as is", sin garantía ni respaldo del upstream.
- Requiere aproximadamente 22 GB de memoria solo para pesos, lo que excluye GPUs de consumo de 16 GB o menos con esta cuantización.
- La verificación se realizó con llama.cpp v0.9.0; otras versiones pueden comportarse de forma distinta.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia: https://huggingface.co/Xylolabs/Qwen3.6-35B-A3B-GGUF/blob/main/LICENSE
- Repositorio de código de referencia (llama.cpp, commit fijado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Documentación de GGUF en llama.cpp: https://huggingface.co/docs/hub/gguf-llamacpp
- Repositorio del autor (Xylolabs): https://github.com/XylolabsInc/tensix-bfp-gptq
