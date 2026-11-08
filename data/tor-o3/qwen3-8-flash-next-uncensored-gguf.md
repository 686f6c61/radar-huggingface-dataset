# ToR-O3/Qwen3.8-Flash-Next-Uncensored-GGUF

## Resumen

Qwen3.8-Flash-Next-Uncensored-GGUF es una derivación comunitaria en formato GGUF del modelo Qwen3.8-Flash-Next, publicado por el usuario ToR-O3 en Hugging Face. El modelo parte de la cuantización dinámica UD-IQ4_XS generada por Unsloth sobre los pesos originales de Qwen y sustituye 146 tensores del modelo principal por los pesos "abliterated" (sin direcciones de rechazo) del checkpoint BF16 de OrcaRouter, dando lugar a una variante sin censura alineada.

El resultado es un único conjunto de cuatro shards GGUF en cuantización mixta UD-IQ4_XS que ocupa 93,7 GB (87,24 GiB) y contiene 176.943.899.520 parámetros totales según los safetensors del modelo base. La operación no incluye entrenamiento adicional ni búsqueda independiente de direcciones de rechazo: es un transplante de pesos tensor a tensor que preserva formas, tipos de cuantización y disposición de shards del GGUF de Unsloth.

La relevancia de esta ficha radica en que documenta una práctica creciente en el ecosistema open source: derivados comunitarios que combinan cuantización dinámica con abliteration para eliminar rechazos, con implicaciones importantes de licencia, calidad y seguridad que conviene evaluar antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer derivado de Qwen3.8-Flash-Next (incluye capas DeltaNet y soporte de MTP; detalles completos no disponibles) |
| Parametros totales | 176.943.899.520 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | UD-IQ4_XS (cuantización mixta, Unsloth Dynamic v3.1); incluye tensores Q2_0 |
| Idiomas soportados | no disponible (el modelo base Qwen suele ser multilingüe, pero no se confirma en la información) |
| Licencia | Qwen Community License 1.0 (etiquetada como "other"; el autor indica que sigue los ficheros LICENSE reales, no la etiqueta Apache-2.0 de OrcaRouter) |
| Formato de pesos | GGUF (4 shards, 93.672.359.738 bytes en total) |

## Arquitectura y entrenamiento

El modelo es un transplante de pesos, no un entrenamiento. Se tomaron 146 tensores del modelo principal del checkpoint BF16 de OrcaRouter/Qwen3.8-Flash-Next-Uncensored, se cuantizaron a los formatos de tensor correspondientes del GGUF UD-IQ4_XS de Unsloth (revisión `d96201194f103c906994f283f504209dc8d2a10c`) y se sustituyeron en su lugar, preservando formas, tipos de cuantización, disposición de shards y todos los bytes fuera de los rangos reemplazados. Las columnas de proyección de salida de DeltaNet se convirtieron al orden GGUF, y se usó la importance matrix de Unsloth para los tipos de tensor aplicables; Q2_0 requirió un adaptador de cuantización local.

No se realizó entrenamiento adicional ni búsqueda independiente de direcciones de rechazo para esta release. El transplante cubre solo el modelo principal: no se trasplantan las modificaciones MTP de OrcaRouter ni se reproduce el checkpoint completo de Orca. El repositorio no incluye PLE externo, sidecar MTP ni proyector de visión; la tabla PLE integrada sí está incluida. El autor advierte que no se reproduce la receta de cuantización original completa de Unsloth.

## Capacidades

- Generación de texto conversacional en formato GGUF, orientada a inferencia local.
- Comportamiento "uncensored"/abliterated: los pesos transplantados eliminan direcciones de rechazo del modelo base, reduciendo las negativas a responder.
- Soporte de PLE integrado (tabla incluida en el propio GGUF, sin fichero externo).
- Soporte potencial de MTP y visión solo si el motor de inferencia y ficheros adicionales lo permiten; no incluidos en el repositorio.
- Tool calling / function calling: no confirmado en la información disponible.
- Capacidades de agente y razonamiento multi-paso: no confirmadas para esta derivación.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking: no disponible.

## Casos de uso

- Investigación sobre alineación y rechazo: el modelo permite estudiar cómo el transplante de pesos abliterated afecta al comportamiento de rechazo en comparación con el modelo base, usando prompts benignos que suelen disparar sobre-rechazo.
- Evaluación de cuantización dinámica: sirve para analizar la consistencia de la cuantización UD-IQ4_XS y el impacto de sustituir tensores cuantizados por pesos BF16 reprocesados.
- Despliegue local en hardware de gama alta: con 93,7 GB en cuatro shards, encaja en estaciones con suficiente VRAM o RAM unificada para ejecutar el modelo con llama.cpp o Gufo, los motores con los que el autor realizó las comprobaciones locales.
- Generación de texto creativo sin filtros: para proyectos donde se requiere menor tasa de negativas, siempre que se cumplan los términos de la Qwen Community License 1.0.
- Benchmarking comparativo de derivados comunitarios: útil para contrastar con otras variantes del mismo modelo base publicadas por la comunidad, como las de cygnal o mradermacher.
- Pruebas de robustez y formato de salida: el autor documenta errores factuales y fallos de formato observados, lo que lo hace útil como caso de estudio de degradación en derivados sin entrenamiento adicional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que las comprobaciones locales cubrieron integridad de ficheros, consistencia de cuantización, tareas funcionales cortas y un conjunto limitado de prompts benignos, y que las puntuaciones de benchmarks upstream no son resultados de evaluación de esta derivación.

## Requisitos de hardware

- VRAM/RAM estimada: al menos ~94 GB para cargar los cuatro shards completos; con overhead de contexto y KV cache, se recomienda 100-120 GB según longitud de contexto.
- GPU recomendadas: H100 80 GB (requiere offload parcial o multi-GPU), A100 80 GB en configuraciones multi-GPU, o estaciones con RAM unificada de 128 GB o más.
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en GPUs consumer de 32 GB sin offload masivo a RAM del sistema, lo que degradaría severamente el throughput.
- Opciones de despliegue: llama.cpp y Gufo son los motores con los que el autor realizó las comparaciones locales; el motor debe soportar la arquitectura del modelo y todos los formatos de tensor de Unsloth Dynamic v3.1. No se confirma compatibilidad con vLLM, TGI u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| ToR-O3/Qwen3.8-Flash-Next-Uncensored-GGUF | 176,9 B | no disponible | GGUF UD-IQ4_XS (4 shards) | Qwen Community License 1.0 | Transplante de 146 tensores abliterated sobre UD-IQ4_XS |
| cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF | no disponible | no disponible | GGUF IQ4_XS/NGQ4 | no disponible | Derivado comunitario alternativo del mismo linaje |
| mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF | no disponible | no disponible | GGUF | no disponible | Otra cuantización comunitaria del uncensored |
| unsloth/Qwen3.8-Flash-Next-GGUF | 176,9 B (base) | no disponible | GGUF Dynamic v3.1 | Qwen Community License 1.0 | Base cuantizada sin abliteration |

## Limitaciones y advertencias

- No se realizó entrenamiento adicional ni búsqueda independiente de direcciones de rechazo: el comportamiento "uncensored" depende enteramente de los pesos transplantados de OrcaRouter.
- El autor documenta errores factuales y fallos de formato de salida observados en las comprobaciones locales; no se garantiza que las capacidades generales permanezcan intactas respecto al modelo base.
- No se trasplantan las modificaciones MTP de OrcaRouter ni se reproduce el checkpoint completo de Orca; el rendimiento puede diferir del derivado original.
- No se incluye proyector de visión ni sidecar MTP: las funciones opcionales de visión o MTP requieren ficheros adicionales y soporte del motor.
- La licencia Qwen Community License 1.0 impone condiciones de atribución y uso comercial; el autor advierte que la etiqueta Apache-2.0 de OrcaRouter no se sigue, sino los ficheros LICENSE reales.
- Compatibilidad de motores limitada: no se garantiza funcionamiento en todos los frontends; el motor debe soportar la arquitectura y todos los formatos de tensor de Unsloth Dynamic v3.1.
- Riesgo de alucinación y sesgos: no evaluados formalmente en esta derivación; los sesgos del modelo base y del proceso de abliteration no están documentados.
- Idiomas soportados no confirmados en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin validación comunitaria adicional.

## Enlaces

- Hugging Face: https://huggingface.co/ToR-O3/Qwen3.8-Flash-Next-Uncensored-GGUF
- Modelo base original: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Cuantización Unsloth: https://huggingface.co/unsloth/Qwen3.8-Flash-Next-GGUF
- Pesos abliterated de OrcaRouter: https://huggingface.co/orcarouter/Qwen3.8-Flash-Next-Uncensored
- Derivado alternativo (cygnal): https://huggingface.co/cygnal/Qwen3.8-Flash-Next-Uncensored-IQ4XS-NGQ4-GGUF
- Derivado alternativo (mradermacher): https://huggingface.co/mradermacher/Qwen3.8-Flash-Next-Uncensored-GGUF
