# timesmith/Qwen3.8-27B-oQ8e-mtp

## Resumen

Qwen3.8-27B-oQ8e-mtp es una cuantización mixta del modelo Qwen3.8-27B, publicada por el usuario timesmith en Hugging Face. Se trata de un checkpoint de aproximadamente 27.780 millones de parámetros (27,781.427.952 según los safetensors) convertido al formato MLX mediante la herramienta oQ (oMLX v0.8.3), que aplica cuantización de precisión mixta. El resultado es un peso medio efectivo de 8.639 bits por parámetro, lo que reduce el espacio en disco a unos 30 GB frente a los aproximadamente 55 GB que ocuparía el modelo en BF16.

La relevancia de esta publicación es fundamentalmente práctica: permite ejecutar un modelo de casi 28.000 millones de parámetros en hardware Apple Silicon con memoria unificada mediante el framework MLX, manteniendo una calidad cercana a la del modelo original gracias a que el 98,1 % de los pesos se almacenan en 8 bits afines con grupo de 64, mientras que un 1,9 % permanece en BF16. La presencia de una cabeza MTP (multi-token prediction) de 0.425B parámetros y de un módulo de visión de 0.461B indica que el modelo base es multimodal y está pensado para decodificación especulativa.

No obstante, la información pública disponible es muy limitada: la model card no documenta el modelo base original, ni la licencia, ni los idiomas soportados, ni resultados de evaluación. Esta ficha refleja exclusivamente los datos verificables del repositorio y marca como "no disponible" todo aquello que el autor no ha especificado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (etiqueta `qwen3_5` en Hugging Face); multimodal con módulo de visión y cabeza MTP; detalles internos no disponibles |
| Parámetros totales | 27.781.427.952 (27.781B) |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Cuantización mixta oQ: affine 8-bit grupo 64 (98,143 % de los pesos) + BF16 (1,857 %); media efectiva 8,639 bits/peso |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato MLX, librería `mlx`) |
| Tamaño del repositorio | 30,0 GB (27,941 GiB) |
| Desglose de almacenamiento | LM: 26,896B pesos / 26,617 GiB; visión: 0,461B / 0,858 GiB; cabeza MTP: 0,425B / 0,466 GiB |

## Arquitectura y entrenamiento

El checkpoint es una conversión de pesos, no un entrenamiento nuevo: no se ha reentrenado ni ajustado el modelo, solo se ha recuantizado el checkpoint original con oQ (oMLX v0.8.3). La arquitectura subyacente corresponde a la familia Qwen3.5 según la etiqueta del repositorio, con un transformer multimodal que incorpora un codificador de visión de 0,461B parámetros y una cabeza de predicción multi-token (MTP) de 0,425B. La MTP se emplea habitualmente para decodificación especulativa, lo que sugiere que el modelo base está diseñado para acelerar la generación autoregresiva prediciendo varios tokens por paso.

La estrategia de cuantización es el aspecto técnico más destacable: oQ aplica 8 bits afines con grupo de 64 a la práctica totalidad de las matrices (98,143 % de los pesos lógicos), mientras que deja en BF16 un 1,857 % (0,516B parámetros) que presumiblemente corresponde a capas sensibles a la precisión, como embeddings, normas o proyecciones críticas. El resultado son 8,50 bits/peso efectivos en la parte cuantizada y 16,00 en la parte BF16. No se dispone de información sobre el dataset de entrenamiento original, el número de tokens, ni si hubo RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento: capacidades heredadas del modelo base Qwen3.8-27B, aunque no documentadas en esta model card.
- Procesamiento de imágenes: el checkpoint incluye un módulo de visión de 0,461B parámetros, por lo que se espera soporte multimodal (visión-lenguaje), si bien el autor no detalla las tareas concretas.
- Decodificación especulativa: la cabeza MTP de 0,425B permite, en principio, acelerar la inferencia mediante predicción multi-token.
- Ejecución en Apple Silicon: al estar en formato MLX, está optimizado para GPUs integradas de la familia M1/M2/M3/M4.
- Tool calling y function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible en la documentación.
- Capacidades multilingües: no disponible en la documentación.
- Modo "thinking" u otras capacidades especiales: no disponible en la documentación.

## Casos de uso

- Inferencia local en Mac con memoria unificada: con 27,941 GiB de pesos, el modelo cabe en equipos Apple Silicon de 32 GB o más (por ejemplo, Mac Studio o MacBook Pro con M3/M4 Max de 36-48 GB), lo que permite ejecutar un modelo de casi 28B en local sin GPU dedicada.
- Asistente de código en el escritorio: el tamaño del modelo y su contexto (no documentado) lo hacen apto para autocompletado y revisión de código en un IDE local, aprovechando MLX para baja latencia en hardware Apple.
- Análisis de documentos con imágenes: gracias al módulo de visión, puede emplearse para extraer información de capturas, diagramas o PDFs escaneados en un flujo local, sin enviar datos a servicios externos.
- Prototipado de aplicaciones multimodales: desarrolladores que quieran validar pipelines de visión-lenguaje en MLX antes de desplegar en servidores pueden usar este checkpoint como banco de pruebas.
- Aceleración mediante decodificación especulativa: la cabeza MTP permite experimentar con técnicas de predicción multi-token para reducir la latencia en generación de texto largo.
- Investigación sobre cuantización mixta: el checkpoint sirve como referencia reproducible para estudiar el impacto de 8 bits afines con grupo 64 frente a BF16 en un modelo de 28B, comparando calidad y velocidad en MLX.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM/memoria unificada estimada: al menos 28 GiB solo para los pesos; con overhead de contexto y caché KV, se recomienda un mínimo de 32 GB de memoria unificada y, para contextos largos, 48-64 GB.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior (M2 Max, M3 Max, M4 Max, M2/M3 Ultra). No es compatible de forma nativa con CUDA, ya que el formato es MLX.
- ¿Cabe en GPU de consumo? En el ecosistema Apple, sí: Mac Studio y MacBook Pro de gama alta. En GPUs NVIDIA de consumo (RTX 4090 con 24 GB) no cabría en su formato actual; requeriría una cuantización adicional a 4 bits y una conversión a GGUF o similar.
- Opciones de despliegue: `mlx-lm` y el ecosistema MLX de Apple; el repositorio no documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, y el formato MLX no es directamente portable a ellos sin conversión.
- Latencia y throughput: no disponibles; dependerán del chip Apple concreto y de la implementación de la decodificación especulativa con MTP.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-oQ8e-mtp (este) | 27,781B | no disponible | MLX safetensors (8,639 bits/peso) | no disponible | Hugging Face, 0 descargas |
| Qwen3.8-27B (base, presumiblemente) | ~27,8B | no disponible | safetensors BF16 | no disponible | no verificada en la información disponible |
| Otros modelos Qwen de ~27-32B en MLX | ~27-32B | variable | MLX | variable | ecosistema MLX comunitario |

No se dispone de datos de benchmarks ni de especificaciones del modelo base que permitan una comparación cuantitativa rigurosa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Licencia no especificada: no se puede confirmar si el uso comercial está permitido; es imprescindible consultar la licencia del modelo base Qwen3.8-27B antes de cualquier despliegue en producción.
- Modelo comunitario con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad ni de que la cuantización preserve la calidad del original.
- La cuantización a 8,639 bits/peso puede introducir degradación sutil en tareas sensibles a la precisión numérica (matemáticas, código, razonamiento largo), no evaluada por el autor.
- Riesgo de alucinación: inherente a los modelos de lenguaje de esta escala; no se han publicado evaluaciones que lo cuantifiquen.
- Idiomas soportados no documentados: no se puede garantizar un rendimiento adecuado en castellano sin pruebas propias.
- Contexto máximo no documentado: planificar despliegues con ventanas de contexto largas sin conocer el límite real es arriesgado.
- Dependencia del ecosistema MLX: no es portable directamente a CUDA, vLLM o llama.cpp sin conversión adicional, lo que limita su uso en servidores tradicionales.
- Fecha de creación del repositorio (2026-11-26) y nomenclatura del modelo base ("Qwen3.8") no verificables de forma independiente en la información disponible; conviene contrastar la procedencia antes de confiar en él.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/timesmith/Qwen3.8-27B-oQ8e-mtp
- Herramienta de cuantización oQ (oMLX): https://github.com/jundot/omlx
- Framework MLX de Apple: no incluido en la información proporcionada, pero referenciado por la librería del repositorio.
