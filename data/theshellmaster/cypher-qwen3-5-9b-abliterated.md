# TheShellMaster/cypher-Qwen3.5-9B-abliterated

## Resumen

`cypher-Qwen3.5-9B-abliterated` es una publicación de pesos en formato GGUF realizada por el usuario TheShellMaster a partir de `Huihui-Qwen3.5-9B-abliterated`, un derivado "abliterated" (es decir, con la dirección de rechazo eliminada quirúrgicamente del espacio de activaciones) del modelo base `Qwen/Qwen3.5-9B` de Alibaba. El repositorio no entrena ni modifica los pesos: republica sin cambios los ficheros producidos por mradermacher en `mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF`, de modo que todo el trabajo técnico corresponde a los autores originales.

El modelo cuenta con 8.953.803.264 parámetros según los datos de safetensors, lo que lo sitúa en la franja de 9B, y se distribuye en dos ficheros GGUF en cuantización Q8_0: el de pesos del modelo y un `mmproj` (proyector multimodal), lo que indica que el modelo base incorpora capacidad de visión. El autor lo emplea como motor de un agente llamado Cypher sobre OpenCode, probado en una única GPU T4 de 15 GB con `llama-server`.

Su relevancia es acotada pero concreta: sirve como ejemplo de despliegue de un modelo de 9B abliterated en hardware modesto (una T4) mediante llama.cpp, con soporte de plantillas Jinja y atención FlashAttention, y como artefacto reproducible para quienes necesiten un modelo sin rechazos en tareas de agente. No hay métricas de rendimiento publicadas ni información sobre el proceso de abliteración más allá de la cadena de derivación.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Qwen3.5, transformer; detalles no publicados en la información disponible) |
| Parámetros totales | 8.953.803.264 (8,95B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Q8_0 (fichero publicado); otras cuantizaciones disponibles en el repo de mradermacher, no detalladas |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); incluye `mmproj` Q8_0 para visión |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base `Qwen/Qwen3.5-9B` en los datos proporcionados: no se especifica si es un transformer denso convencional, el número de capas, la dimensión oculta, el tipo de atención ni la composición del dataset de entrenamiento. Tampoco hay datos sobre tokens de entrenamiento, fases de RLHF/DPO o innovaciones como decodificación especulativa. Lo único deducible es que el modelo base es multimodal, dado que la publicación incluye un fichero `mmproj` (proyector visión-lenguaje) junto a los pesos del lenguaje.

La transformación "abliterated" aplicada por huihui-ai consiste, en la práctica habitual de esta familia de modelos, en identificar la dirección de activación asociada al rechazo y proyectarla fuera de los pesos, de modo que el modelo deja de negarse a responder a ciertas peticiones. No se documenta en la información disponible el método exacto, el conjunto de datos de calibración ni el impacto medido sobre capacidades. El autor de esta publicación no aporta ningún entrenamiento ni ajuste adicional: es una republicación byte a byte de los GGUF de mradermacher.

## Capacidades

- Generación de texto conversacional multi-turno, con plantilla de chat compatible con `llama-server --jinja`.
- Procesamiento de imagen y texto (visión) gracias al fichero `mmproj` incluido, heredado del modelo base multimodal.
- Respuestas sin rechazo ante peticiones que un modelo alineado estándar declinaría, por la modificación abliterated.
- Integración como motor de agente: el autor lo usa dentro de Cypher, un agente sobre OpenCode, lo que implica soporte de conversación con herramientas en el bucle del agente.
- Compatibilidad con endpoints (tag `endpoints_compatible`), lo que sugiere uso tras una API compatible con OpenAI en llama.cpp.
- Capacidades de código y razonamiento: no confirmadas explícitamente en la información disponible, aunque plausibles por la familia Qwen3.5; no se aportan datos que lo verifiquen.

## Casos de uso

- Agente de codificación local: el autor lo ejecuta como backend de Cypher sobre OpenCode en una T4 de 15 GB con `llama-server -ngl 99 -fa on`; encaja en este escenario porque Q8_0 de 9B ocupa aproximadamente 9,5 GB y deja margen en una GPU de 15 GB para el contexto y el proyector visual.
- Asistente conversacional sin filtros en investigación sobre alineación: útil para estudiar cómo varía el comportamiento de un modelo Qwen3.5 tras la abliteración, comparando respuestas con el modelo base original.
- Procesamiento de documentos con imágenes en local: el `mmproj` permite pasar capturas, diagramas o páginas escaneadas junto a texto, adecuado para entornos con requisitos de privacidad donde no se quiere enviar datos a una API externa.
- Despliegue en estaciones de trabajo con GPU de consumo: al ser GGUF Q8_0, puede servirse con llama.cpp en GPUs de 12-16 GB (RTX 3060 12 GB, RTX 4070 Ti, T4) sin necesidad de infraestructura de datacenter.
- Prototipado de pipelines de agentes con tool calling: la compatibilidad con plantillas Jinja y endpoints permite integrarlo en frameworks de agentes que esperan una API tipo OpenAI, sustituyendo a un modelo en la nube durante el desarrollo.
- Experimentación con contenido creativo sin restricciones: escritura de ficción, guiones o material sensible donde los rechazos del modelo alineado interrumpen el flujo, aceptando la supervisión humana necesaria.
- Evaluación comparativa de cuantizaciones: al existir el repo de mradermacher con múltiples GGUF, sirve para medir la degradación de calidad entre Q8_0 y cuantizaciones menores en una misma tarea.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: el fichero Q8_0 de un modelo de 8,95B ocupa en torno a 9,5 GB; sumando el `mmproj` Q8_0 y la caché KV para el contexto, el consumo se sitúa por encima de los 10-11 GB según la longitud de contexto configurada.
- GPU validadas por el autor: una NVIDIA T4 de 15 GB, con `-ngl 99` (todas las capas en GPU) y FlashAttention activada.
- GPU recomendadas: T4 16 GB, RTX 3060 12 GB (ajustada), RTX 4070 Ti 16 GB, RTX 4080/4090 16-24 GB, L4 24 GB, A10G 24 GB. Para Q8_0 completo se recomienda al menos 12 GB de VRAM libre.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más usando Q8_0; con cuantizaciones menores del repo de mradermacher cabría en GPUs de 8 GB.
- Opciones de despliegue: llama.cpp (`llama-server`, `llama-cli`), y por extensión cualquier frontend compatible con GGUF (Ollama, LM Studio, llama-cpp-python). No se documenta soporte de vLLM ni TGI para este artefacto concreto.
- Latencia y throughput: no disponibles. El autor no publica métricas de tokens por segundo en la T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| cypher-Qwen3.5-9B-abliterated | 8,95B | no disponible | Apache 2.0 | GGUF Q8_0 | Republicación de Huihui abliterated; visión vía mmproj |
| Huihui-Qwen3.5-9B-abliterated (huihui-ai) | 9B | no disponible | Apache 2.0 | safetensors | Modelo abliterated original del que deriva este |
| Qwen/Qwen3.5-9B | 9B | no disponible | Apache 2.0 | safetensors | Base alineado, con rechazos; referencia de comparación |
| mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF | 9B | no disponible | Apache 2.0 | GGUF (múltiples cuantizaciones) | Origen directo de los ficheros republicados |

## Limitaciones y advertencias

- La abliteración elimina los mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, ilegal o sesgado; no debe desplegarse en producción orientada a usuarios sin filtros externos.
- Al ser una modificación no supervisada de los pesos, no hay evaluación publicada del impacto sobre razonamiento, código o matemáticas; la degradación respecto al modelo base es desconocida.
- Riesgo de alucinación no cuantificado: no se aportan benchmarks de fidelidad ni de calibración.
- Idiomas soportados no documentados; se desconoce si la abliteración afecta de forma desigual a idiomas distintos del inglés y el chino.
- Longitud de contexto no disponible, lo que impide planificar cargas de trabajo con ventanas largas sin pruebas empíricas.
- La licencia Apache 2.0 se hereda del modelo base, pero el uso comercial de un modelo abliterated puede incumplir políticas de plataformas de despliegue y conllevar responsabilidad legal por el contenido generado.
- El repositorio tiene cero descargas y cero likes en el momento de la ficha, y el autor no ofrece garantías de mantenimiento; conviene depender del repo original de mradermacher o de huihui-ai para trazabilidad.
- El modelo card está redactado en francés y es extremadamente escueto: no hay guía de prompt, ni parámetros de muestreo recomendados, ni limitaciones declaradas por el autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/TheShellMaster/cypher-Qwen3.5-9B-abliterated
- GGUF de origen (mradermacher): https://huggingface.co/mradermacher/Huihui-Qwen3.5-9B-abliterated-GGUF
- Modelo abliterated original (huihui-ai): https://huggingface.co/huihui-ai/Huihui-Qwen3.5-9B-abliterated
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3.5-9B
- Modelos cuantizados de Huihui-Qwen3.5-9B-abliterated: https://huggingface.co/models?other=base_model%3Aquantized%3Ahuihui-ai%2FHuihui-Qwen3.5-9B-abliterated
- Directorio de modelos abliterated (Model Heretic): https://modelheretic.com/
