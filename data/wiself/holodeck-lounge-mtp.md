# Wiself/Holodeck-Lounge-MTP

## Resumen

Holodeck-Lounge-MTP es un modelo de lenguaje de 9.650 millones de parámetros desarrollado por Wiself, que restaura la cabeza de predicción multi-token (MTP) nativa sobre el merge creativo Qwen3.5-9B-Holodeck-Lounge. El merge original de nightmedia, compuesto por 13 modelos base orientados a escritura de ficción, carecía del tensor `mtp.fc.weight` necesario para la decodificación especulativa nativa. Wiself ha completado esa capa faltante tomando únicamente ese tensor del modelo Jackrong/Qwopus3.5-9B-Coder, manteniendo intactos los pesos del backbone y los 14 bloques `mtp.layers.*` ya presentes en el merge.

El resultado es un modelo que conserva las capacidades de escritura creativa del merge Holodeck-Lounge y añade una cabeza MTP funcional de una sola capa estilo DeepSeek-V3, con 3 tokens de borrador y contexto adyacente fijo. Además, se ha integrado la plantilla de chat corregida froggeric v22.1, que mejora la estructura del razonamiento y la tasa de aceptación de MTP en las evaluaciones. El modelo está pensado para entornos de inferencia con restricciones de ancho de banda o alta concurrencia, donde la decodificación especulativa reduce los pasos de decodificación y mejora la latencia.

La relevancia actual radica en que ofrece una opción práctica para servidores de inferencia que quieran aprovechar MTP sin renunciar a un modelo de escritura de alta calidad, y lo hace con un coste de tamaño prácticamente nulo respecto al host original, ya que la mayoría de las capas MTP ya estaban presentes.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3.5-9B) con cabeza MTP de una capa estilo DeepSeek-V3 |
| Parametros totales | 9.653.104.368 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene safetensors; se menciona compatibilidad con GGUF en llama.cpp, pero no se confirma la publicacion de cuantizaciones) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (y posiblemente GGUF, no confirmado) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura base Qwen3.5-9B, un transformer denso de 9.650 millones de parámetros. Sobre esta base se ha aplicado un merge de 13 modelos orientados a escritura creativa (la familia DavidAU heretic, armand0e, microsoft/Fara1.5-9B, Jackrong, entre otros) que dio lugar a nightmedia/Qwen3.5-9B-Holodeck-Lounge. Ese merge ya incluía 14 de las 15 capas de la cabeza MTP (los bloques `mtp.layers.*` y las normalizaciones asociadas), pero carecía del tensor de proyección de fusión `mtp.fc.weight`, lo que impedía la decodificación especulativa nativa.

Wiself ha restaurado ese tensor único tomándolo de Jackrong/Qwopus3.5-9B-Coder, un modelo que comparte la misma arquitectura MTP nativa de Qwen3.5. El resultado es una cabeza MTP completa de una sola capa, con 3 tokens de borrador y contexto adyacente fijo, siguiendo el diseño descrito en el informe técnico de DeepSeek-V3 (arXiv:2412.19437). No se ha realizado ningún entrenamiento adicional; se trata de una operación de fusión de tensores a nivel de checkpoint. También se ha incorporado la plantilla de chat corregida froggeric v22.1, que mejora la estructura del razonamiento y la tasa de aceptación de MTP en las evaluaciones.

## Capacidades

- Generacion de texto creativo y narrativo de alta calidad, heredado del merge Holodeck-Lounge.
- Razonamiento estructurado con soporte para formato de razonamiento tipo DeepSeek (activado mediante `--reasoning-format deepseek`).
- Decodificacion especulativa nativa mediante cabeza MTP con 3 tokens de borrador, compatible con llama.cpp (`draft-mtp`) y vLLM (`qwen3_5` MTP).
- Plantilla de chat corregida que mejora la coherencia y organizacion de las respuestas.
- Capacidades multilingues no especificadas, aunque al derivar de Qwen3.5-9B es probable que herede el soporte multilingue del modelo base (no confirmado).
- No se mencionan capacidades de vision, audio ni tool calling en la informacion disponible.

## Casos de uso

- Servicio de inferencia con restricciones de ancho de banda: en entornos donde el cuello de botella es la transferencia de tokens por la red, la cabeza MTP reduce el numero de tokens enviados por peticion, ya que los tokens de borrador aceptados se generan localmente en el servidor.
- Inferencia de alta concurrencia y latencia sensible: al reducir los pasos de decodificacion, se acorta la cola de peticiones y se mejora el percentil 95 de latencia, util para aplicaciones en tiempo real como chatbots o asistentes.
- Generacion de textos largos: en tareas de escritura creativa o documentos extensos, cada token de borrador aceptado se compone, lo que acelera la generacion de secuencias largas.
- Razonamiento complejo con multiples pasos: con el razonamiento activado, la tasa de aceptacion MTP alcanza el 60-69%, lo que beneficia a tareas de analisis, planificacion o resolucion de problemas que requieren cadenas de pensamiento extensas.
- Experimentacion con decodificacion especulativa: el modelo sirve como referencia para probar configuraciones de MTP en llama.cpp y vLLM, y como donante de pesos para experimentos de fine-tuning de la cabeza MTP (como el modelo Holodeck-Lounge-Regressed-MTP).
- Escritura asistida en produccion: el merge Holodeck-Lounge esta optimizado para ficcion y narrativa, por lo que el modelo puede usarse en herramientas de generacion de guiones, novelas o contenido creativo, con la ventaja adicional de la decodificacion especulativa para reducir costes de computacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El modelo card incluye una evaluacion especifica de la tasa de aceptacion de la cabeza MTP, con una muestra pequena (n=30) y advertencia explicita sobre la amplitud de los intervalos de confianza:

| Metrica | Valor |
|---|---|
| Aceptacion greedy (llama.cpp, solo target) | 59.0% |
| Aceptacion con rejection sampling (vLLM) | 58.55% |
| RS pos0 / pos1 / pos2 | 77.2% / 57.0% / 41.4% |
| Longitud media aceptada | 2.756 |
| Aceptacion con razonamiento activado | 60-69% (n=30) |

Estos datos indican que la cabeza MTP restaurada funciona correctamente, pero no permiten comparar el rendimiento del modelo en tareas de lenguaje general con otros modelos.

## Requisitos de hardware

- VRAM estimada para inferencia: con 9.653 millones de parametros, en FP16 se necesitan aproximadamente 19.3 GB (coincide con el tamano del repo). En cuantizacion de 4 bits (si se publicara) se reduciria a unos 5-6 GB, pero no se confirma la disponibilidad de cuantizaciones.
- GPU recomendadas: para FP16, una GPU con al menos 24 GB de VRAM (RTX 3090, RTX 4090, A10G, A100 40GB). Para cuantizacion de 4 bits, cabria en GPUs de 8-12 GB (RTX 3060, RTX 4070, etc.), pero no hay cuantizaciones publicadas.
- Si cabe en consumer GPU: en FP16, una RTX 4090 (24 GB) es suficiente; en cuantizacion de 4 bits, una RTX 3060 de 12 GB podria ser suficiente, pero no hay archivos GGUF confirmados para este modelo.
- Opciones de despliegue: llama.cpp (con `--spec-type draft-mtp --spec-draft-n-max 3`), vLLM (con `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`), y potencialmente otros motores compatibles con Qwen3.5.
- Latencia y throughput: no se proporcionan datos numericos. La ventaja esperada es una reduccion de los pasos de decodificacion gracias a la aceptacion de tokens de borrador, con una tasa tipica del 65% segun el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | MTP nativa | Licencia | Enfoque |
|---|---|---|---|---|---|
| Wiself/Holodeck-Lounge-MTP | 9.65B | no disponible | Si (3 tokens) | Apache 2.0 | Escritura creativa + MTP |
| nightmedia/Qwen3.5-9B-Holodeck-Lounge | 9.65B | no disponible | No (cabeza incompleta) | Apache 2.0 | Escritura creativa |
| Qwen/Qwen3.5-9B | 9.65B | no disponible | Si (nativa) | Apache 2.0 | Modelo base generalista |
| Jackrong/Qwopus3.5-9B-Coder | 9.65B | no disponible | Si (nativa) | Apache 2.0 | Codigo y razonamiento |

La comparativa se basa en la informacion disponible: Holodeck-Lounge-MTP es el unico que combina el merge creativo con una cabeza MTP funcional. Qwen3.5-9B base ya tiene MTP nativa, pero no esta especializado en escritura creativa. Qwopus3.5-9B-Coder aporta el tensor faltante, pero esta orientado a codigo. No se dispone de datos de rendimiento en tareas estandar para comparar numericamente.

## Limitaciones y advertencias

- La evaluacion de la cabeza MTP se realizo con una muestra pequena (n=30) y el propio autor advierte que los intervalos de confianza son amplios; los valores de aceptacion deben tomarse como indicativos, no como garantia.
- No se han publicado benchmarks de rendimiento general (MMLU, HumanEval, etc.), por lo que no es posible evaluar la calidad del modelo en tareas estandar frente a alternativas.
- El modelo hereda los sesgos y limitaciones del merge Holodeck-Lounge, que esta optimizado para ficcion creativa; puede no ser adecuado para tareas factuales o de alta precision sin verificacion externa.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificacion de despliegues en entornos multilingues o con requisitos de contexto largo.
- La restauracion de la cabeza MTP se ha verificado en llama.cpp y vLLM, pero no se garantiza la compatibilidad con otros motores de inferencia.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda revisar las licencias de los modelos base del merge (Qwen3.5-9B, Holodeck-Lounge, Qwopus3.5-9B-Coder) por si hubiera restricciones adicionales.
- No se proporcionan cuantizaciones oficiales; los usuarios que necesiten GGUF deberan convertirlos ellos mismos o esperar a que el autor los publique.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wiself/Holodeck-Lounge-MTP
- Modelo base Qwen3.5-9B: https://huggingface.co/Qwen/Qwen3.5-9B
- Merge Holodeck-Lounge: https://huggingface.co/nightmedia/Qwen3.5-9B-Holodeck-Lounge
- Donante del tensor MTP: https://huggingface.co/Jackrong/Qwopus3.5-9B-Coder
- Plantilla de chat corregida: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates
- Experimento relacionado (fine-tune de la cabeza): https://huggingface.co/Wiself/Holodeck-Lounge-Regressed-MTP
- Informe tecnico DeepSeek-V3 (MTP): https://arxiv.org/abs/2412.19437
- Segundo articulo arxiv referenciado: https://arxiv.org/abs/2503.01840
- Repositorio GGUF del merge Holodeck-Lounge (no de este modelo): https://huggingface.co/nightmedia/Qwen3.5-9B-Holodeck-Lounge-GGUF
