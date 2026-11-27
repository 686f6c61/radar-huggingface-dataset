# Xylolabs/gemma-4-E4B-GGUF

## Resumen

Xylolabs/gemma-4-E4B-GGUF es una cuantización en formato GGUF para llama.cpp del modelo base google/gemma-4-E4B, publicada por Xylolabs. Se distribuye como un único fichero de 5,349 GB con cuantización Q4_K_M mixta: los tensores de proyección por capa (42 en total) se mantienen en Q8_0 mientras el resto del modelo se cuantiza a Q4_K_M. Esta estrategia busca preservar la fidelidad de las proyecciones críticas sin disparar el tamano del fichero.

El modelo subyacente cuenta con 7.518.069.290 parámetros totales y es un modelo base (no ajustado por instrucciones), por lo que su uso previsto es la continuación de texto a partir de un prefijo, no el diálogo conversacional directo. La torre de visión del modelo original no se incluye en esta conversión: se trata exclusivamente de un decodificador de texto.

La relevancia de esta ficha es practica: permite ejecutar un modelo de ~7,5 mil millones de parámetros con ventana de contexto anunciada de 128K en GPUs de consumo como la RTX 4090 o la RTX 3090 (24 GB), y en equipos con memoria unificada como los Mac Studio. La licencia Apache 2.0, heredada del modelo original, facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (modelo base, sin torre de visión en esta conversión) |
| Parametros totales | 7.518.069.290 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 128K (según tabla de recomendación de hardware del autor) |
| Tipos de cuantizacion | Q4_K_M con 42 tensores de proyección por capa en Q8_0 (fichero único) |
| Idiomas soportados | en, ko |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base google/gemma-4-E4B es un transformer decoder-only de 7.518.069.290 parámetros. La model card de esta conversión no detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo fases de RLHF o DPO; esa información corresponde al modelo original y no se reproduce aquí. Tampoco se documentan innovaciones de arquitectura específicas más allá de la pertenencia a la familia Gemma 4.

La contribución técnica de esta ficha es la conversión a GGUF y la estrategia de cuantización: se aplica Q4_K_M al conjunto del modelo pero se elevan a Q8_0 los 42 tensores de proyección por capa, lo que produce un fichero de 5,349 GB. El autor publica una tabla de fidelidad frente a BF16 medida con divergencia KL sobre WikiText-2 y sobre un conjunto held-out, además de precisión top-1. Esta tabla permite comparar la perdida de calidad de la conversión mixta frente a cuantizaciones estándar de llama.cpp.

## Capacidades

- Generación de texto por continuación de prefijo: es un modelo base, diseñado para completar texto, no para seguir instrucciones.
- Razonamiento y conocimiento general derivados del modelo base Gemma 4, sin ajuste conversacional en esta distribución.
- Capacidad multilingüe limitada a inglés (en) y coreano (ko) según los metadatos del repositorio.
- No incluye torre de visión: la conversión es solo de texto.
- No se documenta soporte de tool calling, function calling ni modo de razonamiento explícito en la información disponible.
- No se documenta soporte de agentes ni multi-step reasoning en la información disponible.
- Compatible con endpoints (tag `endpoints_compatible`) y con el ecosistema llama.cpp.

## Casos de uso

- Generación de texto a gran escala en local: al ser un modelo base de 7,5B en un fichero de 5,3 GB, se puede desplegar en una RTX 4090 para tareas de continuación de texto, redacción asistida por prefijo o generación de borradores por lotes sin depender de la nube.
- Completado de documentos y plantillas: útil para rellenar estructuras de texto largas (informes, descripciones de producto, resúmenes parciales) alimentando el modelo con un prefijo y dejando que continúe, con contexto de hasta 128K.
- Prototipado e investigación en PNL: sirve como modelo base ligero para experimentos de prompting, evaluación de técnicas de decodificación o estudios de fidelidad de cuantización, comparando esta conversión mixta con Q4_K_M estándar de llama.cpp.
- Evaluación de cuantizaciones: la tabla de KL y top-1 publicada por el autor permite usar este fichero como referencia práctica para medir el impacto de mantener proyecciones en Q8_0 frente a cuantizar todo a Q4_K_M.
- Despliegue en hardware con memoria unificada: en Mac Studio (M5 Max/Ultra) o DGX Spark, el fichero de 5,3 GB deja margen para contexto largo y ejecución concurrente de otras tareas.
- Generación de texto en inglés y coreano: para pipelines de contenido en esos dos idiomas, dado que son los únicos declarados en los metadatos.
- Integración en herramientas ligeras: mediante llama.cpp o wrappers compatibles (por ejemplo, llama-cpp-python) para utilidades de escritorio o CLI que necesiten completado de texto sin infraestructura GPU dedicada.

## Benchmarks y rendimiento

El autor publica métricas de fidelidad de cuantización frente a BF16 (divergencia KL y precisión top-1), no benchmarks de tareas estándar como MMLU o HumanEval.

| Cuantización | Tamano | WikiText-2 KL | top-1 | Held-out KL | top-1 |
|---|---:|---:|---:|---:|---:|
| llama.cpp Q8_0 | 8,031 GB | 0,006691 | 96,539% | 0,006596 | 96,314% |
| llama.cpp Q6_K | 6,217 GB | 0,038657 | 91,373% | 0,036176 | 91,755% |
| llama.cpp Q5_K_M | 5,763 GB | 0,159024 | 82,882% | 0,150359 | 84,451% |
| Q4_K_M-proj8 (esta ficha) | 5,349 GB | 0,240410 | 79,559% | 0,243051 | 79,971% |
| llama.cpp Q4_K_M | 5,335 GB | 1,093739 | 56,892% | 1,141156 | 56,059% |
| llama.cpp Q3_K_M | 4,850 GB | 4,688224 | 20,686% | 4,386987 | 20,941% |

La conversión Q4_K_M-proj8 mejora de forma clara a la Q4_K_M estándar de llama.cpp (KL 0,240 frente a 1,094 en WikiText-2; top-1 79,6% frente a 56,9%) con un coste de solo 14 MB adicionales. No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 5,3 GB de pesos; el consumo real depende del contexto configurado. Con 128K de contexto se requiere memoria adicional para la caché KV.
- GPU recomendadas por el autor: RTX 4090 / RTX 3090 (24 GB), RTX 5090 (32 GB), RTX 6000 Ada o 2 x 24 GB (48 GB), H100 (80 GB), RTX PRO 6000 Blackwell (96 GB), H200 (141 GB), B200 (192 GB), B300 (288 GB).
- Cabe en GPU de consumo: sí, en RTX 4090, RTX 3090 y RTX 5090, según la tabla del autor, con contexto de 128K.
- Memoria unificada: DGX Spark (128 GB), Mac Studio M5 Max (128 GB), Mac Studio M5 Ultra (256 GB y 512 GB).
- Opciones de despliegue: llama.cpp (build concreto referenciado por el autor, commit cd959bae99ff4bed22bef2604f45241c09bbb8c8). El tag `endpoints_compatible` sugiere compatibilidad con endpoints, pero no se detalla en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| Xylolabs/gemma-4-E4B-GGUF (Q4_K_M-proj8) | 7,52B | 128K | GGUF | Apache 2.0 | Cuantización mixta; solo texto; en/ko |
| google/gemma-4-E4B (BF16) | 7,52B | no disponible | safetensors | Apache 2.0 | Modelo original; incluye torre de visión |
| llama.cpp Q4_K_M de gemma-4-E4B | 7,52B | 128K | GGUF | Apache 2.0 | 5,335 GB; KL 1,094; top-1 56,9% |
| llama.cpp Q5_K_M de gemma-4-E4B | 7,52B | 128K | GGUF | Apache 2.0 | 5,763 GB; KL 0,159; top-1 82,9% |

No se dispone de datos de benchmarks de tareas para comparar con modelos de otros fabricantes; la comparación se limita a variantes de cuantización del mismo modelo.

## Limitaciones y advertencias

- Es un modelo base: no sigue instrucciones ni mantiene formato conversacional de forma fiable; requiere prompts de continuación.
- No incluye la torre de visión del modelo original; cualquier caso de uso multimodal queda fuera de alcance.
- Idiomas declarados limitados a inglés y coreano; el rendimiento en castellano no está garantizado.
- Riesgo de alucinación y de generar contenido sesgado o inapropiado inherente a los modelos base; no se documentan mitigaciones en esta conversión.
- La fidelidad de la cuantización es menor que Q5_K_M o Q6_K (top-1 79,6% frente a 82,9% y 91,4% respectivamente); para tareas sensibles a la precisión conviene usar cuantizaciones mayores.
- El autor marca la fila de esta cuantización con "fail" en la columna "Answers", sin explicar el criterio; conviene verificar el comportamiento en producción.
- El build de llama.cpp recomendado es específico (commit cd959bae99ff4bed22bef2604f45241c09bbb8c8); otras versiones pueden no cargar el fichero correctamente.
- Licencia Apache 2.0 heredada del modelo original; verificar los términos del modelo base google/gemma-4-E4B antes de uso comercial.

## Enlaces

- Hugging Face: https://huggingface.co/Xylolabs/gemma-4-E4B-GGUF
- Modelo base: https://huggingface.co/google/gemma-4-E4B
- Licencia: https://huggingface.co/Xylolabs/gemma-4-E4B-GGUF/blob/main/LICENSE
- llama.cpp (build referenciado): https://github.com/ggml-org/llama.cpp/tree/cd959bae99ff4bed22bef2604f45241c09bbb8c8
- Repositorio del autor: https://github.com/XylolabsInc/tensix-bfp-gptq
