# thederby/Qwen3.6-35B-A3B-oQ4e-mtp

## Resumen

Qwen3.6-35B-A3B-oQ4e-mtp es una compilación cuantizada del modelo base Qwen/Qwen3.6-35B-A3B, publicada por el usuario thederby. Se trata de una cuantización mixta de precisión en formato MLX generada con la herramienta oMLX (familia oQe, versión v0.7.1.dev1), y corresponde a la variante bf16. El repositorio ocupa 21,6 GB y contiene 35.951.822.704 parámetros (aproximadamente 35,95 mil millones).

La relevancia de esta ficha no está en el modelo base en sí, sino en el trabajo de cuantización: se conserva la cabeza de predicción multi-token (MTP, 1 capa) y se incluye la torre de visión, de modo que el resultado mantiene las capacidades multimodales (pipeline image-text-to-text) del original. La cuantización oQe asigna un ancho de bits base por nivel y eleva selectivamente las capas sensibles (en oQ4e, base de 4 bits con algunas proyecciones a 5-8 bits), ajustando escalas y sesgos mediante una matriz de importancia derivada de datos de calibración.

El modelo está pensado para ejecutarse sobre Apple Silicon mediante MLX. El autor publica una familia completa de variantes (oQ4e, oQ5e, oQ6e, oQ8e, en bf16 y fp16) con métricas de fidelidad frente al modelo original bf16, lo que permite elegir el equilibrio entre tamaño y pérdida de calidad. No se han publicado resultados de benchmarks de tareas en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (mezcla de expertos), derivada de Qwen3.6-35B-A3B; tag de arquitectura qwen3_5_moe |
| Parametros totales | 35.951.822.704 (35,95 mil millones) |
| Parametros activos | Aproximadamente 3B, segun la nomenclatura "A3B" del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | oQ4e (4 bits base, con capas sensibles a 5-8 bits), cuantizacion afin, tamano de grupo 64; variantes oQ4e/oQ5e/oQ6e/oQ8e en bf16 y fp16; este repo es oQ4e bf16 |
| Idiomas soportados | No disponible (la calibracion uso prosa en ingles, codigo Python y texto en japones y coreano) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (libreria mlx); repositorio de 21,6 GB |

Datos adicionales: el modelo base es Qwen/Qwen3.6-35B-A3B; la cabeza MTP se conserva y sus capas lineales se cuantizan junto al resto; la torre de visión no se cuantiza (se mantiene en float32, con la convolucion patch-embed transpuesta al layout channels-last de MLX).

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un transformer de tipo mezcla de expertos (MoE) con unos 35,95 mil millones de parametros totales y, segun la nomenclatura "A3B", del orden de 3 mil millones de parametros activos por token. Esta ficha no describe el entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos no están disponibles. Lo que sí documenta el autor es el proceso de cuantización.

La cuantización se realizó con oMLX en su variante oQe: se fija un ancho de bits base por nivel y se elevan por encima de ese valor las capas consideradas sensibles (en oQ4e, base de 4 bits con algunas proyecciones a 5-8 bits). Cada grupo de pesos recibe su escala y sesgo a partir de una matriz de importancia calculada con datos de calibración (conjunto `oqe_code_multilingual` integrado en oMLX, 128 muestras de 512 tokens). Estas compilaciones incorporan además un reajuste por mínimos cuadrados ponderados de escalas y sesgos de grupo (PR jundot/omlx#4385). Respecto a compilaciones oQe anteriores del mismo modelo, estas reducen la divergencia KL entre un 5 % y un 14 % según el nivel; en oQ4e, de 0,0560 a 0,0479. En oQ5e, oQ6e y oQ8e la asignación de bits por capa es idéntica a la de compilaciones previas, de modo que la mejora proviene del ajuste de pesos y escalas, no de un reparto distinto de bits. La innovación funcional destacable es la conservación de la cabeza MTP (predicción multi-token) y de la torre de visión.

## Capacidades

- Generacion de texto conversacional multi-turno, con plantilla de chat compatible con prompts de sistema.
- Razonamiento y modo de pensamiento (thinking): la plantilla de chat modificada conserva el historial de razonamiento de turnos anteriores en lugar de descartarlo.
- Generacion de codigo y capacidades multilingues heredadas del modelo base (el conjunto de calibracion incluye codigo Python y texto en japones y coreano).
- Capacidades multimodales de vision: el pipeline es image-text-to-text y la torre de vision se incluye sin cuantizar.
- Tool calling / function calling: la plantilla de chat reescribe el texto de instrucciones de herramientas y renderiza argumentos de herramienta en formato de cadena JSON (como los envian los clientes de estilo OpenAI) en lugar de producir un error. La calidad del tool calling con esta plantilla no ha sido evaluada.
- Prediccion multi-token mediante la cabeza MTP conservada, que puede habilitar decodificacion especulativa, si bien el autor no detalla su uso en inferencia.
- Fusion de multiples mensajes de sistema iniciales en lugar de fallar, gracias a la plantilla de chat modificada.

## Casos de uso

- Asistente conversacional local en Mac: al ser una compilacion MLX de 21,6 GB, el modelo puede ejecutarse integramente en Apple Silicon con memoria unificada suficiente, permitiendo un asistente privado sin conexion a servicios externos.
- Analisis de documentos e imagenes: el pipeline image-text-to-text y la torre de vision incluida permiten tareas de descripcion de imagenes o pregunta-respuesta sobre material grafico, manteniendo la calidad de vision intacta al no cuantizarse esa parte.
- Generacion y revision de codigo en flujos locales: el modelo se calibro con codigo Python y mantiene capacidades de generacion de codigo; puede integrarse en editores o scripts de revision sobre una maquina de desarrollo con Apple Silicon.
- Tool calling en agentes: la plantilla de chat modificada acepta argumentos de herramienta en cadena JSON, lo que facilita conectar el modelo a APIs externas mediante clientes de estilo OpenAI, siempre que se valide la calidad de las llamadas (no evaluada por el autor).
- Razonamiento multi-paso con historial de pensamiento: la conservacion del razonamiento de turnos previos en el prompt resulta util en tareas de resolucion de problemas encadenados donde el contexto de decisiones anteriores importa.
- Despliegue de bajo consumo para prototipado: gracias a los parametros activos reducidos (aprox. 3B) y a la cuantizacion de 4 bits, es adecuado para prototipos en portatiles Apple con memoria unificada de 32 GB o superior.
- Evaluacion comparativa de cuantizaciones: la familia de variantes (oQ4e a oQ8e) permite medir el impacto de la precision en la calidad para decidir el punto de equilibrio en un pipeline de investigacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor publica medidas de fidelidad de la cuantizacion frente al modelo original bf16, que no son benchmarks de tareas y solo son comparables entre compilaciones del mismo modelo.

| Variante | dtype | Tamano | KL vs bf16 (menor mejor) | Concordancia top-1 | Perplejidad |
|---|---|---|---|---|---|
| oQ4e (este repo) | bf16 | 21,6 GB | 0,0479 | 90,7 % | 9,84 |
| oQ4e | fp16 | 22,5 GB | 0,0467 | 90,7 % | 9,84 |
| oQ5e | bf16 | 26,0 GB | 0,0221 | 93,7 % | 9,68 |
| oQ5e | fp16 | 26,9 GB | 0,0211 | 93,8 % | 9,69 |
| oQ6e | bf16 | 30,3 GB | 0,0138 | 95,2 % | 9,65 |
| oQ6e | fp16 | 31,2 GB | 0,0132 | 95,2 % | 9,64 |
| oQ8e | bf16 | 38,6 GB | 0,0106 | 95,8 % | 9,64 |
| oQ8e | fp16 | 39,5 GB | 0,0101 | 95,7 % | 9,63 |
| original | bf16 | 72 GB | 0 | 100 % | 9,63 |

Metodología declarada: divergencia KL media de cada cuantización frente al modelo original bf16, sobre 48 ventanas de 2048 tokens de prosa en inglés, código Python y texto en japonés y coreano; menos del 0,3 % de ese texto (fragmentos de 60 caracteres) aparece en los datos de calibración. La KL se calcula sobre los 256 tokens más probables de la referencia más un grupo para el resto, por lo que subestima ligeramente la KL completa. En este modelo la KL es mayor en todos los anchos de bits que en el denso Qwen3.6-27B (por ejemplo, 0,0106 frente a 0,0021 en oQ8e), aunque la perplejidad se mantiene cerca del original.

## Requisitos de hardware

- Formato nativo: MLX, orientado a Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No es una compilación para GPU NVIDIA ni AMD.
- Memoria unificada estimada para este repo: pesos de 21,6 GB más caché KV y la torre de visión en float32; se recomienda un Mac con 32 GB de memoria unificada como mínimo, y 24 GB resulta muy ajustado.
- Variante fp16: 22,5 GB, aproximadamente 0,9 GB más que bf16, ya que la torre de visión se mantiene en float32. El autor señala que float16 puede dar un prefill más rápido en M1/M2, que carecen de bfloat16 nativo.
- Elección por memoria: oQ5e (26,0 GB) y oQ6e (30,3 GB) para Macs de 32-48 GB; oQ8e (38,6 GB) para equipos con 64 GB o más.
- No cabe en GPU de consumo con 24 GB de VRAM en su formato nativo, porque MLX no se ejecuta sobre CUDA; requeriría conversion a otro formato (no proporcionada en este repositorio).
- Opciones de despliegue: MLX y su ecosistema (por ejemplo, mlx-lm y mlx-vlm), ademas de aplicaciones que consuman modelos MLX. No se proporcionan pesos GGUF en este repositorio.
- Latencia y throughput: no disponible. El autor no publica cifras de velocidad, solo medidas de fidelidad y tamaño.

## Comparativa con modelos similares

La comparacion mas directa es con las demas variantes de la misma familia de cuantizacion y con el modelo original sin cuantizar. Como referencia adicional, el autor menciona el denso Qwen3.6-27B, aunque sin datos de tareas.

| Modelo | Parametros | Contexto | Tipo | Tamano | Licencia |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B-oQ4e-mtp (este repo) | 35,95B totales (aprox. 3B activos) | No disponible | MoE, vision, cuantizado 4 bits (MLX) | 21,6 GB | apache-2.0 |
| Qwen3.6-35B-A3B-oQ8e (misma familia) | 35,95B totales | No disponible | MoE, cuantizado 8 bits (MLX) | 38,6 GB | apache-2.0 |
| Qwen/Qwen3.6-35B-A3B (original) | 35,95B totales | No disponible | MoE, vision, bf16 | 72 GB | apache-2.0 |
| Qwen3.6-27B (denso, mencionado) | 27B | No disponible | Transformer denso | No disponible | No disponible |

Con datos de fidelidad publicados: frente al original, oQ4e pierde un 9,3 % de concordancia top-1 y eleva la KL a 0,0479; oQ8e reduce esa perdida a un 4,2 % de concordancia con KL 0,0106, a costa de casi duplicar el tamano. No se conocen alternativas comparables de otros autores para este modelo concreto en la informacion disponible.

## Limitaciones y advertencias

- Perdida de fidelidad inherente a la cuantizacion de 4 bits: concordancia top-1 del 90,7 % frente al original, con divergencia KL de 0,0479.
- En este modelo la divergencia KL es mayor que en el denso Qwen3.6-27B en todos los anchos de bits, segun el propio autor; la comparacion de KL solo es valida entre cuantizaciones del mismo modelo.
- La plantilla de chat incluida no es la oficial de Qwen, sino la v22.5 de froggeric (Apache-2.0). La plantilla original se conserva como `chat_template.jinja.official`. Para chat simple ambas producen prompts identicos, pero difieren en el historial de razonamiento, en el texto de instrucciones de tool calling y en la fusion de mensajes de sistema.
- La calidad del tool calling con la plantilla modificada no ha sido evaluada.
- La calidad de la vision con la torre sin cuantizar no fue medida.
- Riesgo de alucinacion propio de los modelos de lenguaje; no se han publicado evaluaciones de robustez ni de sesgos en la informacion disponible.
- No se dispone de la lista oficial de idiomas soportados ni de la longitud de contexto; conviene consultar el modelo base antes de usarlo en produccion multilingue o con contextos largos.
- Requiere hardware Apple Silicon; no es desplegable directamente en infraestructura CUDA sin conversion previa.
- El repositorio registra 0 descargas y 0 "me gusta", por lo que no cuenta con validacion de la comunidad en el momento de redactar esta ficha.
- Licencia apache-2.0, que permite uso comercial, pero conviene verificar los terminos del modelo base Qwen3.6-35B-A3B por si imponen condiciones adicionales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/thederby/Qwen3.6-35B-A3B-oQ4e-mtp
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Proyecto oMLX: https://github.com/jundot/omlx
- Pull request del reajuste de escalas y sesgos: https://github.com/jundot/omlx/pull/4385
- Plantillas de chat de froggeric: https://huggingface.co/froggeric/Qwen-Fixed-Chat-Templates

Nota: la busqueda web asociada a esta ficha no devolvio resultados relacionados con el modelo; los unicos enlaces pertinentes son los que figuran en la model card del autor y en los metadatos del repositorio.
