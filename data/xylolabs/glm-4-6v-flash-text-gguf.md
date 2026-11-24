# Xylolabs/GLM-4.6V-Flash-Text-GGUF

## Resumen

GLM-4.6V-Flash-Text-GGUF es una cuantización GGUF del modelo de texto extraído de zai-org/GLM-4.6V-Flash, publicada por Xylolabs. El modelo base pertenece a la familia GLM-V de Zhipu AI (Z.ai), centrada en razonamiento multimodal, y esta conversión conserva únicamente la torre de texto para generación solo de texto en llama.cpp. Con 9.400 millones de parámetros (según los pesos en safetensors del repositorio), se posiciona en la franja de modelos de ~9B, un tamaño que permite ejecución local en GPU de consumo con cuantizaciones agresivas.

La relevancia de esta ficha reside en que ofrece un artefacto listo para llama.cpp con un único fichero IQ4_XS con importancia matrix (imatrix), de 5,262 GB, pensado para desplegarse en tarjetas de 24 GB con contexto de 128K. El autor publica además una tabla de fidelidad frente a BF16 (divergencia KL y acuerdo top-1) que permite evaluar el coste de la cuantización con datos medidos, algo poco habitual en repositorios GGUF de terceros.

La licencia es MIT, tanto en el modelo base como en la conversión, lo que facilita el uso comercial. El modelo está etiquetado para inglés y coreano, y no incluye la torre de visión del modelo original: es estrictamente text-only.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia GLM-4.6V, torre de texto; detalles internos no disponibles) |
| Parametros totales | 9.400.279.040 (~9,4B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K (según tabla de hardware del autor) |
| Tipos de cuantizacion | IQ4_XS con imatrix (fichero publicado); la tabla de accuracy referencia además Q8_0, Q6_K, Q5_K_M, Q4_K_M, Q3_K_M, Q2_K, UD-Q6_K_XL, UD-Q5_K_XL, UD-Q4_K_XL, UD-Q3_K_XL, UD-IQ3_XXS, UD-Q2_K_XL e IQ4_XS |
| Idiomas soportados | en, ko |
| Licencia | MIT |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base zai-org/GLM-4.6V-Flash pertenece a la familia GLM-V de Zhipu AI, descrita en el paper arXiv:2507.01006 ("GLM-4.5V and GLM-4.1V-Thinking: Towards Versatile Multimodal Reasoning with Scalable Reinforcement Learning"). Según la citación del autor, la familia se entrena con aprendizaje por refuerzo escalable orientado a razonamiento multimodal versátil. No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset ni los detalles de RLHF/DPO del modelo base.

Esta publicación concreta no es un modelo entrenado desde cero, sino una conversión y cuantización: Xylolabs extrae la torre de texto del modelo multimodal original, la convierte a GGUF y la cuantiza a IQ4_XS con imatrix. El resultado es un artefacto de 5,262 GB que elimina las capacidades de visión del original. La innovación técnica destacable de esta ficha es la publicación de métricas de fidelidad de cuantización (KL media frente a BF16 y acuerdo top-1) sobre WikiText-2 y un conjunto held-out, medidas con llama.cpp.

## Capacidades

- Generación de texto conversacional en inglés y coreano.
- Razonamiento de propósito general heredado del modelo base GLM-4.6V-Flash (sin datos específicos de benchmarks en esta ficha).
- Ejecución local vía llama.cpp con soporte de plantilla de chat mediante `--jinja`.
- Contexto largo de hasta 128K tokens según la tabla de hardware del autor.
- Capacidades multimodales (visión): no disponibles en esta conversión, que es text-only.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Asistente conversacional local en inglés o coreano: el modelo puede mantener diálogos multi-turno con hasta 128K tokens de contexto en una RTX 4090 o 3090 de 24 GB usando el fichero IQ4_XS de 5,3 GB, sin depender de APIs externas.
- Procesamiento de documentos largos: con 128K de contexto y un fichero que ocupa 5,3 GB, es viable resumir o extraer información de contratos, informes o transcripciones extensas en una sola pasada en hardware de consumo.
- Despliegue en estaciones de trabajo con GPU única: la tabla del autor confirma encaje en RTX 5090, RTX 6000 Ada, H100, H200, B200 y B300 con contexto completo, lo que permite servir el modelo en infraestructura propia sin clúster.
- Inferencia en Apple Silicon: los Mac Studio M5 Max y M5 Ultra con memoria unificada de 128 GB o más aparecen en la tabla de compatibilidad, habilitando uso local en entornos macOS con llama.cpp.
- Prototipado y evaluación de pipelines de generación de texto: al ser un GGUF de 5,3 GB con licencia MIT, es adecuado para integrar en pruebas de CI o entornos de desarrollo donde se necesita un modelo pequeño y rápido sin restricciones de licencia.
- Aplicaciones en coreano: al declarar soporte de coreano, cubre casos de atención al cliente o generación de contenido en ese idioma que otros modelos de ~9B no contemplan explícitamente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la información disponible. El autor sí publica métricas de fidelidad de cuantización frente a BF16:

| Cuantizacion | Tamano | WikiText-2 KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 10,000 GB | 0,000656 | 98,676% | 0,002286 | 98,402% |
| llama.cpp Q6_K | 8,267 GB | 0,002146 | 97,485% | 0,005223 | 97,235% |
| llama.cpp Q5_K_M | 7,051 GB | 0,006657 | 95,975% | 0,020100 | 94,873% |
| llama.cpp Q4_K_M | 6,167 GB | 0,020170 | 93,436% | 0,034994 | 92,618% |
| IQ4_XS-imat (publicado) | 5,262 GB | 0,023699 | 92,951% | 0,072904 | 90,843% |
| llama.cpp Q3_K_M | 4,975 GB | 0,067915 | 87,770% | 0,101250 | 86,461% |

El fichero publicado (IQ4_XS-imat) presenta una KL media de 0,023699 en WikiText-2 con un acuerdo top-1 del 92,951%, y de 0,072904 con top-1 del 90,843% en held-out. Para comparar, Unsloth IQ4_XS sin imatrix obtiene 0,023587 / 93,039% en WikiText-2, prácticamente idéntico.

## Requisitos de hardware

- VRAM estimada: el fichero IQ4_XS-imat ocupa 5,262 GB; el autor recomienda sumar el KV cache en f16 al contexto deseado más 2 GB de runtime, y que el total quede por debajo del 90% de la memoria disponible.
- GPU recomendadas por el autor: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Consumer GPU: sí, cabe en RTX 4090 y RTX 3090 de 24 GB con contexto de 128K según la tabla del autor.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB) y Mac Studio M5 Ultra (256/512 GB) figuran como compatibles.
- Opciones de despliegue: llama.cpp (build concreto enlazado en la model card), con `llama-cli -m GLM-4.6V-Flash-Text-IQ4_XS-imat.gguf --jinja`. Otros runners compatibles con GGUF no se detallan en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| GLM-4.6V-Flash-Text-GGUF (esta ficha) | ~9,4B | 128K | GGUF IQ4_XS-imat | MIT | Solo texto; métricas de fidelidad publicadas |
| zai-org/GLM-4.6V-Flash (base) | no disponible | no disponible | safetensors | MIT | Multimodal (incluye visión) |
| Unsloth IQ4_XS del mismo modelo | ~9,4B | 128K | GGUF | MIT | KL 0,023587 / top-1 93,039% en WikiText-2 |
| Unsloth Q4_K_M del mismo modelo | ~9,4B | 128K | GGUF | MIT | 6,167 GB; KL 0,015350 / top-1 94,279% |

No se dispone de datos de benchmarks de tareas para comparar con modelos de otras familias de tamaño similar.

## Limitaciones y advertencias

- Es una conversión de terceros: Xylolabs no está afiliado ni respaldado por los autores del modelo original, según indica la propia model card.
- El modelo es text-only: se ha eliminado la torre de visión del GLM-4.6V-Flash original, por lo que no puede procesar imágenes.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está verificado y no se recomienda asumirlo.
- La cuantización IQ4_XS introduce degradación medible: 92,951% de acuerdo top-1 en WikiText-2 y 90,843% en held-out frente a BF16.
- Riesgo de alucinación inherente a modelos generativos de ~9B; no se han publicado evaluaciones específicas de factualidad en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Licencia MIT permite uso comercial, pero conviene revisar el fichero NOTICE que nombra al titular de derechos del modelo original.
- Solo se ha verificado con un build concreto de llama.cpp (commit cd959bae99ff4bed22bef2604f45241c09bbb8c8); otros runners pueden requerir ajustes.
- No hay datos publicados de throughput ni latencia en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Text-GGUF
- Modelo base: https://huggingface.co/zai-org/GLM-4.6V-Flash
- Paper de la familia GLM-V: https://arxiv.org/abs/2507.01006
- Build de llama.cpp verificado: https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio de herramientas de Xylolabs: https://github.com/XylolabsInc/tensix-bfp-gptq
- Licencia: https://huggingface.co/Xylolabs/GLM-4.6V-Flash-Text-GGUF/blob/main/LICENSE
