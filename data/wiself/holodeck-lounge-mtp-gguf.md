# Wiself/Holodeck-Lounge-MTP-GGUF

## Resumen

Holodeck-Lounge-MTP-GGUF es una conversión GGUF del modelo Qwen3.5-9B-Holodeck-Lounge, un merge de 13 modelos base orientado a escritura creativa, al que se le ha restaurado un head de predicción multi-token (MTP) funcional. El autor, Wiself, detectó que el merge original de nightmedia no incluía los tensores `mtp.*` necesarios para la decodificación especulativa nativa, por lo que transplantó los 15 tensores del head MTP desde Jackrong/Qwopus3.5-9B-Coder y parcheó la plantilla de chat con la versión corregida v22.1 de froggeric. El resultado es un modelo que conserva intactos los pesos del backbone y añade la capacidad de generar hasta 3 tokens de borrador por paso, lo que permite acelerar la inferencia en entornos con restricciones de ancho de banda o alta concurrencia.

El modelo se distribuye en dos cuantizaciones GGUF (IQ4_XS y Q4_K_M) e incluye la plantilla de chat en un archivo separado. Está pensado para su uso con llama.cpp (modo `draft-mtp`) y vLLM (método `qwen3_5` MTP), y su licencia Apache 2.0 permite uso comercial sin restricciones. La relevancia actual radica en que ofrece una vía práctica para aprovechar la decodificación especulativa en un modelo de escritura creativa de 9B, sin necesidad de entrenar un head adicional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con head MTP de una capa estilo DeepSeek |
| Parametros totales | 9B (aproximado, no se especifica el conteo exacto) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | IQ4_XS, Q4_K_M |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors no incluido en este repo) |

## Arquitectura y entrenamiento

El modelo base es un transformer denso de 9B parámetros de la familia Qwen3.5, sobre el que se ha aplicado un merge de 13 modelos (según la card del upstream) orientado a escritura creativa. El head MTP es de una sola capa, siguiendo el diseño del informe técnico de DeepSeek-V3 (arXiv:2412.19437), con 3 tokens de borrador y contexto adyacente fijo. Los tensores del head (`mtp.fc`, `mtp.layers.*`, `mtp.norm`, `mtp.pre_fc_norm_*`) provienen de Jackrong/Qwopus3.5-9B-Coder, un modelo co-entrenado con esta arquitectura de head, lo que explica la alta tasa de aceptación medida. No se ha realizado ningún entrenamiento adicional; el proceso consistió en transplantar los tensores y verificar que cargan correctamente en llama.cpp y vLLM. La plantilla de chat se ha sustituido por la versión corregida v22.1 de froggeric, que mejora la estructura del razonamiento y la tasa de aceptación del MTP.

## Capacidades

- Generación de texto creativo: el backbone Holodeck-Lounge está optimizado para ficción literaria, con estilo y coherencia narrativa.
- Razonamiento estructurado: la plantilla corregida y el modo de razonamiento (activado por defecto) mejoran la organización de respuestas complejas.
- Decodificación especulativa nativa: el head MTP permite generar 3 tokens de borrador por paso, acelerando la inferencia en backends compatibles.
- Compatibilidad con llama.cpp y vLLM: soporta `draft-mtp` y `qwen3_5` MTP respectivamente.
- Multilingüismo: no se especifican idiomas concretos, pero al derivar de Qwen3.5-9B es probable que herede su cobertura multilingüe (no confirmado).
- No se documenta soporte explícito de tool calling, visión ni audio.

## Casos de uso

- Generación de ficción larga: el modelo puede redactar capítulos o relatos extensos con coherencia argumental, aprovechando la ventana de contexto (aunque su longitud exacta no está publicada) y el estilo refinado del merge.
- Asistencia en escritura creativa: útil para generar borradores, diálogos o descripciones ambientales en proyectos de narrativa interactiva o juegos de rol.
- Servicio de inferencia con alta concurrencia: en entornos con muchas peticiones simultáneas, el head MTP reduce los pasos de decodificación, mejorando el p95 y la latencia percibida.
- Despliegue en hardware con ancho de banda limitado: al aceptar tokens de borrador, se reduce el tráfico de red entre GPU y memoria, beneficiando a configuraciones con VRAM ajustada.
- Prototipado de agentes conversacionales con razonamiento: el modo de razonamiento integrado permite respuestas más estructuradas en asistentes que requieren pasos intermedios.
- Evaluación de técnicas de decodificación especulativa: al ser un modelo de referencia con head MTP funcional, sirve como banco de pruebas para comparar estrategias de aceptación de tokens en llama.cpp y vLLM.

## Benchmarks y rendimiento

La model card no incluye benchmarks tradicionales (MMLU, HumanEval, GSM8K), pero sí métricas de aceptación del head MTP, que son las relevantes para evaluar la decodificación especulativa:

| Metrica | Valor |
|---|---|
| Aceptacion greedy (llama.cpp, solo target) | 59.0% |
| Aceptacion con rejection sampling (vLLM) | 58.55% |
| Aceptacion pos0 / pos1 / pos2 (RS) | 77.2% / 57.0% / 41.4% |
| Longitud media aceptada | 2.756 |
| Aceptacion con razonamiento activado | 60–69% (n=30) |

Estos valores se obtuvieron con 30 prompts, temperatura 0.7, máximo 256 tokens y concurrencia 8. No se han publicado resultados de benchmarks de calidad lingüística o razonamiento en la información disponible.

## Requisitos de hardware

- VRAM estimada: para un modelo de 9B en Q4_K_M, aproximadamente 5-6 GB; IQ4_XS es ligeramente inferior. Con contexto largo, puede superar los 8 GB.
- GPU recomendadas: tarjetas consumer con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070) son suficientes para inferencia básica. Para alta concurrencia o contexto largo, se recomienda 12-16 GB (RTX 4080, RTX 4090) o GPUs de datacenter (A10, A100).
- Compatibilidad con consumer GPU: sí, cabe en GPUs de gama media con cuantización Q4_K_M.
- Opciones de despliegue: llama.cpp (llama-server con `--spec-type draft-mtp`), vLLM (con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`), y potencialmente Ollama si se convierte el GGUF (no verificado).
- Latencia y throughput: no se proporcionan cifras exactas; la ganancia principal es la reducción de pasos de decodificación gracias al MTP, que en pruebas del autor alcanza una aceptación del 65% o más en condiciones reales.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTP | Licencia | Formato |
|---|---|---|---|---|---|
| Holodeck-Lounge-MTP-GGUF (este) | 9B | no disponible | Sí (3 tokens) | Apache 2.0 | GGUF |
| nightmedia/Qwen3.5-9B-Holodeck-Lounge | 9B | no disponible | No (head ausente) | Apache 2.0 | Safetensors/GGUF |
| Qwen/Qwen3.5-9B (base) | 9B | no disponible | No | Apache 2.0 | Safetensors |

La diferencia principal frente al Holodeck-Lounge original es la presencia del head MTP funcional, que permite decodificación especulativa sin penalización de calidad. Frente al Qwen3.5-9B base, este modelo añade el merge de escritura creativa y la plantilla corregida, a costa de una posible menor generalidad en tareas no creativas.

## Limitaciones y advertencias

- El head MTP solo funciona en backends que soporten el método `draft-mtp` (llama.cpp) o `qwen3_5` MTP (vLLM); en otros entornos, el modelo se comporta como un Qwen3.5-9B estándar sin aceleración.
- La tasa de aceptación del MTP varía según la carga de trabajo y el hardware; el 65% es una referencia, no una garantía.
- No se han publicado evaluaciones de sesgos, alucinación o robustez en tareas de razonamiento formal; al ser un modelo de escritura creativa, puede priorizar fluidez sobre exactitud factual.
- La longitud de contexto no está documentada; se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- El modelo deriva de un merge de 13 modelos, lo que puede introducir comportamientos impredecibles en dominios muy específicos.
- La licencia Apache 2.0 permite uso comercial, pero se debe atribuir correctamente a los autores originales (Qwen, nightmedia, Jackrong, froggeric).

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Wiself/Holodeck-Lounge-MTP-GGUF
- Modelo base (merge): https://huggingface.co/nightmedia/Qwen3.5-9B-Holodeck-Lounge
- Modelo base (Qwen): https://huggingface.co/Qwen/Qwen3.5-9B
- Donante del head MTP: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Plantilla corregida: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Informe técnico DeepSeek-V3 (MTP): https://arxiv.org/abs/2412.19437
- Guía de MTP en unsloth: https://unsloth.ai/docs/models/mtp
