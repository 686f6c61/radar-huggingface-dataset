# Thaurock/Qwen3-32B-abliterated-GGUF

## Resumen

Thaurock/Qwen3-32B-abliterated-GGUF es una colección completa de cuantizaciones en formato GGUF del modelo Qwen3-32B-abliterated, a su vez derivado del Qwen3-32B de Alibaba Cloud. El repositorio lo mantiene el usuario Thaurock y su aportación principal es ofrecer el espectro íntegro de 11 cuantizaciones (desde F16 hasta Q2_K) sin archivos divididos, algo poco habitual en publicaciones de modelos abliterated. El modelo base sobre el que se construye es roslein/Qwen3-32B-abliterated, que aplica técnicas de abliteration sobre los pesos originales de Qwen3-32B.

El modelo subyacente es un transformer causal de 32.762.123.264 parámetros (32,8B), pensado para generación de texto y conversación. La abliteration elimina los filtros de rechazo del modelo original mediante escalado proporcional por capas, lo que amplía la apertura de respuestas a costa de renunciar a los mecanismos de seguridad estándar. El repositorio está orientado a inferencia local con llama.cpp, Ollama, LM Studio o Text-Generation-WebUI.

Su relevancia práctica radica en que permite ejecutar un modelo de 32,8B en hardware de consumo gracias a las variantes de 4 bits (Q4_K_M, ~19,9 GB) y de 3 bits (~14-16 GB), manteniendo supuestamente la estructura lógica del modelo original. La licencia declarada es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3-32B) |
| Parámetros totales | 32.762.123.264 (32,8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (origen en safetensors) |

## Arquitectura y entrenamiento

El modelo es un transformer causal denso de 32,8B parámetros, heredado directamente de Qwen3-32B de Alibaba Cloud. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo original en la información proporcionada.

La innovación técnica del repositorio es la abliteration mediante escalado proporcional aplicada sobre las 64 capas del modelo, con diferentes intensidades según el factor de rechazo de cada capa y un valor máximo de `--max-scale-factor` de 2.25. Según el autor, este enfoque elimina los filtros de rechazo preservando la estructura lógica y la capacidad de seguir instrucciones complejas, con variaciones menores en idiomas poco comunes o contextos muy matizados. No se documentan detalles sobre decodificación especulativa, atención lineal ni otras optimizaciones de inferencia.

## Capacidades

- Generación de texto y conversación multi-turno (pipeline text-generation, tag conversational).
- Razonamiento e instrucciones complejas, según declara el autor del modelo base.
- Capacidad multilingüe heredada de Qwen3, aunque el autor advierte de variaciones menores en idiomas poco comunes.
- Respuestas sin filtros de rechazo estándar gracias a la abliteration.
- Compatibilidad con endpoints (tag `endpoints_compatible`) para despliegue como servicio.
- Soporte de tool calling, agentes o modo thinking: no disponible en la información proporcionada.

## Casos de uso

- Inferencia local en equipos de consumo: la variante Q4_K_M (~19,9 GB) permite ejecutar un modelo de 32,8B en GPUs con 24 GB de VRAM, como la RTX 4090, usando llama.cpp u Ollama.
- Investigación sobre seguridad y alineación: el modelo sirve para estudiar el comportamiento de sistemas sin filtros de rechazo y comparar respuestas frente al Qwen3-32B original en entornos controlados.
- Red teaming y evaluación de robustez: útil para generar respuestas a prompts que el modelo original rechazaría, permitiendo auditar riesgos antes de desplegar sistemas propios.
- Generación de texto creativo sin restricciones temáticas: narrativa, guiones o contenido de ficción donde los filtros estándar limitan la expresividad, ejecutado localmente con llama-cli.
- Prototipado de asistentes conversacionales en estaciones de trabajo: con Q5_K_M (~23,4 GB) se obtiene coherencia cercana al original en hardware de gama alta (A100 40 GB, RTX 4090 con offloading parcial).
- Experimentación con cuantizaciones extremas: la variante Q2_K (~12,1 GB) permite probar el modelo en GPUs de 16 GB o en CPU, aceptando pérdidas cualitativas, para validar pipelines antes de escalar a cuantizaciones mayores.
- Despliegue en servidores con llama.cpp o Text-Generation-WebUI: la colección sin archivos divididos simplifica la carga de cualquier variante en infraestructura propia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada según cuantización: F16 ~65,6 GB; Q8_0 ~34,8 GB; Q6_K ~27,2 GB; Q5_K_M ~23,4 GB; Q4_K_M ~19,9 GB; Q3_K_M ~15,1 GB; Q2_K ~12,1 GB (más overhead de contexto KV cache).
- GPU recomendadas: A100 80 GB o H100 para F16/Q8_0; A100 40 GB o RTX 4090 (24 GB) para Q4_K_M y Q5_K_M; GPUs de 16 GB para Q3_K_M y Q2_K.
- Cabe en GPU de consumo: sí, en RTX 4090 (Q4_K_M, Q5_K_S), RTX 4080/4070 Ti Super de 16 GB (Q3_K_M, Q2_K) y en CPU con RAM suficiente para las variantes de 3-4 bits.
- Opciones de despliegue: llama.cpp (llama-cli, llama-server), Ollama, LM Studio, Text-Generation-WebUI; el tag `endpoints_compatible` sugiere compatibilidad con servicios de endpoints.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantizaciones | Licencia | Notas |
|---|---|---|---|---|---|
| Thaurock/Qwen3-32B-abliterated-GGUF | 32,8B | no disponible | 11 (F16 a Q2_K) | Apache 2.0 | Abliterated, colección completa sin splits |
| roslein/Qwen3-32B-abliterated | 32,8B | no disponible | no disponible | Apache 2.0 (heredada) | Modelo base en safetensors del que deriva este GGUF |
| Qwen3-32B (original) | 32,8B | no disponible | no disponible | Apache 2.0 | Modelo de Alibaba Cloud con filtros de seguridad estándar |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Ausencia de filtros de seguridad: la abliteration elimina los mecanismos de rechazo, por lo que el modelo puede generar contenido dañino, ilegal o sesgado sin restricciones; el autor lo orienta a investigación en entornos controlados.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se documentan evaluaciones específicas de factualidad.
- Pérdida de calidad en cuantizaciones bajas: Q3 y especialmente Q2_K pueden degradar el razonamiento y la coherencia, según advierte el propio autor.
- Variaciones en idiomas poco comunes y contextos matizados tras la abliteration, según la model card.
- Licencia Apache 2.0 declarada, pero conviene verificar las condiciones del modelo original Qwen3-32B antes de uso comercial, dado que la cadena de derivación pasa por una modificación no oficial.
- El repositorio ocupa 271,7 GB; la descarga de la colección completa requiere almacenamiento considerable.
- No se documentan sesgos específicos ni evaluaciones de seguridad del proceso de abliteration.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thaurock/Qwen3-32B-abliterated-GGUF
- Modelo base abliterated: https://huggingface.co/roslein/Qwen3-32B-abliterated
- Perfil del autor de la abliteration: https://huggingface.co/roslein
- Perfil del autor de las cuantizaciones: https://huggingface.co/Thaurock
