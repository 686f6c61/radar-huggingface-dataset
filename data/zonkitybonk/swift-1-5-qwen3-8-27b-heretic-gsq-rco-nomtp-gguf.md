# Zonkitybonk/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-noMTP-GGUF

## Resumen

Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-noMTP-GGUF es una redistribución en formato GGUF de un derivado del modelo Qwen3.8-27B, publicada por el usuario Zonkitybonk en Hugging Face. La cadena de derivación es explícita en la model card: Qwen3.8-27B (base original de Qwen, licencia Apache 2.0) fue adaptado por UkisAI como Swift 1.5, posteriormente sometido a un proceso de *abliteration* (eliminación de mecanismos de rechazo) por jegreene bajo el nombre "Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO", y finalmente reempaquetado aquí con la cabeza de predicción multi-token (MTP) eliminada.

El único cambio respecto al GGUF de jegreene es la supresión de la capa MTP (blk.64) y sus metadatos; el resto de pesos son bit-idénticos según el autor. El objetivo es ahorrar VRAM (unos 350 MB por fichero) en escenarios donde no se emplea decodificación especulativa MTP, liberando ese espacio para el contexto. Se ofrecen dos cuantizaciones: IQ3_S (~11,8 GB) e IQ3_XXS (~10,1 GB).

La relevancia de esta ficha es doble: por un lado, documenta un caso típico de la cadena de derivaciones comunitarias sobre modelos Qwen; por otro, advierte de que se trata de un modelo "heretic" (sin rechazos), con licencia propia distinta de la Apache 2.0 del original y sin datos publicados de benchmarks, idiomas ni pipeline.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3.8-27B); sin cabeza MTP en esta variante |
| Parametros totales | 27B (según denominación del modelo base) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ3_S (~11,8 GB), IQ3_XXS (~10,1 GB) |
| Idiomas soportados | no disponible |
| Licencia | swift-open-license-1.0 (base Qwen3.8-27B: Apache 2.0) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La arquitectura subyacente es la del Qwen3.8-27B, un transformer denso de 27.000 millones de parámetros según la nomenclatura del modelo base. Sobre él, UkisAI produjo el ajuste Swift 1.5, y jegreene aplicó un proceso de *abliteration* ("heretic") destinado a eliminar las capas o direcciones de activación asociadas a rechazos, seguido de cuantización GSQ-RCO. Esta variante concreta elimina además la capa de predicción multi-token (blk.64) y sus metadatos, conservando el resto de pesos sin cambios.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas adicionales más allá de la MTP eliminada. La model card no documenta el procedimiento de abliteration ni los datos empleados en el ajuste Swift 1.5.

## Capacidades

- Generación de texto y razonamiento conversacional, heredados del modelo base Qwen3.8-27B (no verificados en esta variante).
- Capacidad de código y matemáticas presumiblemente presente por herencia del base, aunque no documentada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se listan idiomas).
- Modo *thinking*: no disponible.
- Visión o audio: no disponible.
- Decodificación especulativa MTP: eliminada deliberadamente en esta variante.

## Casos de uso

- Despliegue en GPU de consumo con VRAM ajustada: las cuantizaciones IQ3_S e IQ3_XXS permiten cargar un modelo de 27B en tarjetas de 12-16 GB, sacrificando precisión a cambio de viabilidad.
- Inferencia en local con llama.cpp u Ollama: al ser GGUF y carecer de cabeza MTP, encaja en pipelines estándar de llama.cpp sin necesidad de soporte de decodificación especulativa.
- Experimentación en investigación sobre alineación y abliteration: permite estudiar el comportamiento de un modelo "heretic" frente al base original en tareas de rechazo.
- Generación de texto creativo sin restricciones de contenido: el proceso heretic busca reducir las negativas del modelo, lo que puede interesar en entornos controlados de escritura.
- Evaluación comparativa de cuantizaciones IQ3: útil para medir la degradación de calidad entre IQ3_S e IQ3_XXS en un mismo modelo.
- Pruebas de pipelines de inferencia sin MTP: sirve como referencia para validar que un sistema funciona correctamente cuando se prescinde de decodificación especulativa.
- Fine-tuning ligero o LoRA sobre GGUF: posible mediante herramientas compatibles, aunque la licencia debe revisarse antes de uso comercial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: ~10,1 GB para IQ3_XXS y ~11,8 GB para IQ3_S, más overhead de contexto y de runtime (no cuantificado en la model card).
- GPU recomendadas: no especificadas por el autor; por tamaño, tarjetas de 12-16 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070 Ti Super 16 GB) son el mínimo razonable para IQ3_XXS; 16-24 GB (RTX 4080, RTX 4090, A5000) para mayor margen de contexto.
- Cabe en GPU de consumo: sí, en modelos con 12 GB o más, siempre que se limite la longitud de contexto.
- Opciones de despliegue: llama.cpp, Ollama y otros runtimes compatibles con GGUF; vLLM y TGI no soportan GGUF de forma nativa en todos los casos y no están documentados para esta variante.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Este modelo (noMTP GGUF) | 27B | no disponible | swift-open-license-1.0 | GGUF (IQ3_S, IQ3_XXS) | Sin cabeza MTP; heretic |
| jegreene/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF | 27B | no disponible | swift-open-license-1.0 | GGUF | Incluye MTP; misma base |
| Qwen/Qwen3.8-27B | 27B | no disponible | Apache 2.0 | safetensors (presumible) | Modelo original, con alineación estándar |
| ukisai/Swift-1.5-Qwen3.8-27b | 27B | no disponible | no disponible | no disponible | Ajuste Swift 1.5 previo a la abliteration |

## Limitaciones y advertencias

- Modelo "heretic": el proceso de abliteration elimina mecanismos de rechazo, lo que incrementa el riesgo de generar contenido dañino, ofensivo o inseguro sin filtros.
- Riesgo de alucinación: no cuantificado; en cuantizaciones IQ3 es esperable cierta degradación frente a pesos completos.
- Idiomas y contexto no documentados: no se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Licencia swift-open-license-1.0: distinta de la Apache 2.0 del base; deben revisarse los términos antes de cualquier uso comercial.
- Cadena de derivación larga (Qwen → UkisAI → jegreene → Zonkitybonk): la trazabilidad de cambios depende de los ficheros NOTICE y LICENSE incluidos.
- Sin benchmarks ni métricas de calidad publicadas: no hay evidencia objetiva de rendimiento.
- Cero descargas y cero likes en el momento de la consulta: modelo sin validación comunitaria.
- No es una release oficial de UkisAI ni de Qwen; el soporte y mantenimiento no están garantizados.

## Enlaces

- Hugging Face (este modelo): https://huggingface.co/Zonkitybonk/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-noMTP-GGUF
- Modelo base (GGUF con MTP): https://huggingface.co/jegreene/Swift-1.5-Qwen3.8-27B-heretic-GSQ-RCO-GGUF
- Swift 1.5 (UkisAI): https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Qwen3.8-27B (original): https://huggingface.co/Qwen/Qwen3.8-27B
