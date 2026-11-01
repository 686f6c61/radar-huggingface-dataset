# therickcain/Huihui-Kimi-K2.7-Code-abliterated-GGUF

## Resumen

Huihui-Kimi-K2.7-Code-abliterated-GGUF es una versión "abliterada" (con los mecanismos de rechazo suprimidos mediante edición de pesos) del modelo Kimi-K2.7-Code de Moonshot AI, publicada por el usuario therickcain a partir del trabajo del colectivo huihui.ai. El modelo base es un modelo multimodal de tipo image-text-to-text orientado a tareas de código, con 1.026.408.232.448 parámetros totales según los safetensors del repositorio original. La modificación consiste en una ablación de direcciones de rechazo aplicada directamente sobre los ficheros GGUF publicados por unsloth, sin pasar por TransformerLens.

La relevancia de esta ficha es doble: por un lado documenta una técnica de "uncensoring" de creciente interés en la comunidad open source; por otro, sirve de advertencia sobre las implicaciones de licencia y seguridad de redistribuir variantes modificadas de modelos de gran tamaño. El repositorio ocupa 643,8 GB y se distribuye en formato GGUF cuantizado (mayoritariamente UD-IQ1_M con pesos MXFP4), pensado para inferencia con llama.cpp en hardware de gama alta.

Se trata de un artefacto experimental: la model card lo describe explícitamente como una prueba de concepto tosca, recomienda uso en investigación y entornos controlados, y no ofrece garantías de seguridad. No se han publicado datos de benchmarks ni de idiomas soportados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text); detalles internos no disponibles |
| Parametros totales | 1.026.408.232.448 |
| Parametros activos | no disponible (no se confirma si es MoE) |
| Longitud de contexto | 262.144 tokens (según el ejemplo de llama-cli de la model card) |
| Tipos de cuantizacion | GGUF UD-IQ1_M con pesos MXFP4; conversión parcial de pesos Q5_K y Q6_K a MXFP4 |
| Idiomas soportados | no disponible |
| Licencia | modified-mit (etiquetada como "other" en la model card) |
| Formato de pesos | GGUF (split en 8 ficheros para UD-IQ1_M); safetensors en el modelo base |

## Arquitectura y entrenamiento

El modelo base es Kimi-K2.7-Code de Moonshot AI, un modelo multimodal de gran escala (más de mil millones de parámetros, en concreto 1,026 billones) con pipeline image-text-to-text, lo que indica capacidad de procesar imágenes y texto conjuntamente. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. La model card del derivado tampoco los aporta.

La innovación técnica de esta variante es la ablación de rechazos ("abliteration"): se identifican direcciones en el espacio de activaciones asociadas a respuestas de rechazo y se proyectan fuera de los pesos, de modo que el modelo deja de negarse a responder ciertas peticiones. Según la model card, la ablación se aplica directamente sobre los GGUF de unsloth/Kimi-K2.7-Code-GGUF, sin usar TransformerLens, y de forma selectiva: no se ablacionan las capas <16 ni >36 ni los módulos de expertos (lo que sugiere una arquitectura con mezcla de expertos, aunque no se confirma explícitamente). El resultado es una supresión parcial, no total, de los rechazos. El modelo soporta un modo de razonamiento activable mediante `enable_thinking` y `preserve_thinking` en la plantilla de chat, con formato de razonamiento tipo DeepSeek.

## Capacidades

- Generación de texto y razonamiento con modo "thinking" activable (chain-of-thought interno).
- Generación y análisis de código, dado el enfoque Code del modelo base.
- Procesamiento de imagen y texto (pipeline image-text-to-text).
- Conversación multi-turno con contexto largo (hasta 262.144 tokens según el ejemplo de la model card).
- Soporte de tool calling / function calling: no confirmado en la información disponible.
- Soporte de agentes y razonamiento multi-paso: no confirmado explícitamente, aunque el modo thinking y el contexto largo lo permiten en principio.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Supresión parcial de rechazos por ablación selectiva (capas 16-36, excluyendo expertos).

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo permite estudiar cómo la ablación de direcciones de rechazo afecta al comportamiento del modelo base, comparando respuestas con y sin ablación en capas concretas.
- Evaluación de robustez de filtros: útil para medir la eficacia de sistemas de moderación externos frente a modelos con safety filtering reducido.
- Generación de código en entornos controlados: el enfoque Code del modelo base y el contexto de 262.144 tokens permiten trabajar con repositorios completos en pruebas internas, siempre con revisión humana.
- Análisis de documentación técnica con imágenes: al ser image-text-to-text, puede procesar diagramas, capturas de pantalla o esquemas junto con texto explicativo.
- Experimentación con decodificación y cuantización extrema: el formato UD-IQ1_M con MXFP4 sirve para estudiar la degradación de calidad en cuantizaciones de muy baja precisión sobre modelos de más de un billón de parámetros.
- Pruebas de pipelines con llama.cpp: validación de integración de modelos GGUF split, plantillas de chat con thinking y formato de razonamiento DeepSeek en infraestructura propia.
- Red teaming interno: generación de contenido adversario en entornos aislados para entrenar clasificadores de seguridad, con las salvaguardas legales y éticas correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Con 1,026 billones de parámetros en UD-IQ1_M (aproximadamente 1 bit por peso más metadatos), el peso en disco ronda los 130-160 GB, por lo que se requiere al menos esa cantidad de memoria unificada o VRAM para cargar el modelo completo.
- GPU recomendadas: no disponible. Por tamaño, se necesitan configuraciones multi-GPU de gama profesional (varias A100 80 GB o H100 80 GB) o sistemas con memoria unificada muy grande (por ejemplo, Apple Silicon con 192 GB o más, o servidores con CPU y RAM abundante).
- Cabe en consumer GPU: no en una sola GPU de consumo. Requiere múltiples RTX 4090 (24 GB cada una) o soluciones con memoria unificada; no se confirma que quepa en configuraciones domésticas habituales.
- Opciones de despliegue: llama.cpp (recomendado por el autor, con `llama-gguf-split --merge` para unir los 8 fragmentos y `llama-cli` para inferencia). vLLM, TGI u Ollama no se mencionan en la información disponible.
- Latencia y throughput: no disponibles. La cuantización a ~1 bit y el tamaño del modelo implican velocidades de generación bajas en hardware de consumo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Huihui-Kimi-K2.7-Code-abliterated-GGUF | 1,026 B | 262.144 | modified-mit | GGUF | Variante ablacionada, sin benchmarks publicados |
| moonshotai/Kimi-K2.7-Code | 1,026 B | no disponible | no disponible en esta ficha | safetensors | Modelo base original, con safety filtering intacto |
| unsloth/Kimi-K2.7-Code-GGUF | 1,026 B | no disponible | no disponible en esta ficha | GGUF | Cuantizaciones originales sin ablación |
| Otros modelos abliterados de gran escala | no disponible | no disponible | no disponible | GGUF | No se dispone de comparativas verificadas en la información proporcionada |

## Limitaciones y advertencias

- Filtrado de seguridad reducido: la ablación elimina parcialmente los rechazos, lo que puede producir contenido sensible, controvertido o inapropiado. El autor advierte explícitamente de este riesgo.
- No apto para todos los públicos ni para aplicaciones que requieran alta seguridad; se desaconseja su uso en producción o en interfaces públicas.
- Ablación selectiva: no se han ablacionado las capas <16 ni >36 ni los módulos de expertos, por lo que la supresión de rechazos es incompleta e impredecible según la petición.
- Licencia "modified-mit" con etiqueta "other": conviene revisar los términos exactos antes de cualquier uso comercial; el modelo base puede tener restricciones adicionales no reflejadas aquí.
- Riesgo de alucinación: no cuantificado en la información disponible; los modelos de razonamiento con modo thinking pueden generar cadenas de pensamiento plausibles pero incorrectas.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado fuera del inglés o el chino sin validación previa.
- Requisitos de hardware muy elevados: 643,8 GB de repositorio y un modelo de más de un billón de parámetros hacen inviable su despliegue en infraestructura convencional.
- Responsabilidad legal y ética enteramente del usuario; el autor declina cualquier responsabilidad sobre las consecuencias del uso.
- Naturaleza experimental: la model card lo describe como prueba de concepto tosca, sin garantías de estabilidad ni de calidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/therickcain/Huihui-Kimi-K2.7-Code-abliterated-GGUF
- Modelo base: https://huggingface.co/moonshotai/Kimi-K2.7-Code
- GGUF original de unsloth: https://huggingface.co/unsloth/Kimi-K2.7-Code-GGUF
- Repositorio de la técnica de ablación: https://github.com/Sumandora/remove-refusals-with-transformers
- llama.cpp: https://github.com/ggml-org/llama.cpp
- Perfil de huihui.ai en X: https://x.com/support_huihui
- Ko-fi de huihui.ai: https://ko-fi.com/huihuiai
