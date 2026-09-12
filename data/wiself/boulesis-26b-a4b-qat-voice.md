# Wiself/Boulesis-26B-A4B-QAT-Voice

## Resumen

Boulesis-26B-A4B-QAT-Voice es un artefacto publicado por el usuario Wiself que no constituye un modelo completo, sino un delta de un único tensor (la cabeza de salida `lm_head`) cuyo objetivo es transferir el estilo de escritura de Boulesis a modelos Gemma 4 26B A4B derivados del checkpoint QAT de Google. El fichero principal, `voice.safetensors`, tiene forma `[262144, 2816]` y ocupa aproximadamente 1,5 GB, lo que corresponde a unos 738 millones de parámetros en precisión de 16 bits. No contiene pesos del cuerpo del transformer: solo la diferencia (`voice − base`) respecto a la cabeza del modelo instruct estándar.

El problema que resuelve es concreto: quien despliega un GGUF construido a partir de `google/gemma-4-26B-A4B-it-qat-q4_0-unquantized` no puede aplicar la voz de Boulesis original, porque esta fue calculada contra el instruct estándar y la cabeza del checkpoint QAT difiere por diseño. Este delta está calculado contra el instruct normal pero pensado para sumarse después a la cabeza QAT, de modo que se conserva la base entrenada para sobrevivir a la cuantización y se añade el cambio de estilo. La herramienta Voice (también de Wiself) se encarga de aplicar el delta sobre un GGUF existente.

Es relevante en el contexto de la edición de modelos por aritmética de pesos: demuestra un flujo de trabajo en el que un cambio de comportamiento (estilo conversacional y de roleplay) se empaqueta como un delta de 1,5 GB aplicable a cualquier cuantización de un modelo MoE de 26B, sin reentrenamiento ni fine-tuning adicional. El modelo base pertenece a la familia Gemma 4 en configuración MoE (26B totales, aproximadamente 4B activos según la nomenclatura A4B), con licencia Gemma y soporte declarado únicamente para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Delta de un tensor `lm_head` (no es un transformer completo); modelo base: MoE de la familia Gemma 4 |
| Parametros totales | 738.197.504 en el delta (262144 x 2816). Modelo base: 26B segun nomenclatura, no confirmado en la informacion disponible |
| Parametros activos | Modelo base: aproximadamente 4B segun la nomenclatura A4B; no confirmado en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | QAT q4_0 en el checkpoint base; la aplicacion cuantiza la cabeza a Q8_0 (casi sin perdida); compatible con cualquier cuantizacion GGUF del objetivo |
| Idiomas soportados | en (ingles) |
| Licencia | gemma |
| Formato de pesos | safetensors (delta `voice.safetensors`) mas `voice.json` de metadatos; salida en GGUF |

## Arquitectura y entrenamiento

El artefacto no se entrena: se compone. Segun la model card, la voz procede de SubMaroon/Boulesis-26B-A4B, que a su vez es un compuesto de aritmetica de tareas tipo QK y LoRA fusionada, con tres contribuciones diferenciadas: cuerpo de Heretic, cabeza de StyleTune-V2 y un injerto de razonamiento de Pantheon-1.1. El autor del modelo fuente atribuye la mayor parte de la ganancia en roleplay a un unico tensor transplantado, el `lm_head` de StyleTune-V2, y este delta transporta exactamente ese desplazamiento medido contra la cabeza del instruct estandar.

La parte de QAT es independiente y proviene de Google: el checkpoint base fue entrenado con quantisation-aware training, lo que segun el blog de desarrolladores de Google reduce la caida de perplejidad en Q4_0 en un 54 por ciento frente a la cuantizacion post-entrenamiento convencional. La innovacion tecnica del artefacto es el orden de las operaciones: si la voz se aplicase directamente sobre la cabeza QAT, se sobrescribirian pesos que aprendieron a convivir con la cuantizacion. En su lugar, el delta se calcula contra el instruct estandar (`voice − base`) y el usuario lo suma despues a la cabeza QAT (`delta + QAT_head → Q8_0`). Para modelos abliterated o sin censura, la card recomienda la ruta de delta explicita mediante `voice delta`, que reduce el desplazamiento sobre el enrutado del MoE y mantiene estables objetivos muy modificados.

## Capacidades

- Generacion de texto con un estilo de escritura concreto, heredado de StyleTune-V2, orientado a prosa mas decidida y caracteristica.
- Roleplay y conversacion de personaje: es la capacidad principal declarada del modelo fuente y la razon de ser de la voz.
- Transferencia de estilo aplicada como parche sobre un modelo ya cuantizado, sin reentrenamiento.
- Modo thinking: la card recomienda activar el razonamiento del modelo base y ofrece ajustes de muestreo especificos (temperatura 1,0, top-K 64, top-P 0,95, penalizacion por repeticion 1,05-1,1).
- Compatibilidad con el enrutado MoE del modelo base, ya que solo se modifica la cabeza de salida y no las capas de expertos.
- Conservacion de las capacidades del modelo base (generacion general, codigo, matematicas) en la medida en que el modelo base las tenga; la card no documenta ninguna de ellas de forma explicita.
- Tool calling o function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades multilingues: no, el artefacto declara unicamente ingles.
- Vision o audio: no disponible; pese a la etiqueta `voice` en el repositorio, no se describe ninguna capacidad de audio.

## Casos de uso

- Roleplay local en ingles: el delta esta pensado para que un GGUF QAT de 26B A4B adopte la voz de Boulesis; se aplica una vez con `voice cast` y el modelo resultante se ejecuta con llama.cpp, manteniendo intacta la base entrenada para cuantizacion.
- Escritura creativa con estilo controlado: dado que el cambio reside en la cabeza de salida, es util para generar narrativa con una voz consistente sin tocar el resto de pesos, lo que reduce el riesgo de degradar el conocimiento del modelo.
- Prototipado rapido de variantes de estilo: en lugar de entrenar un fine-tuning por cada variante, se puede levantar la voz del modelo fuente, castearla sobre distintos GGUFs del mismo tamano y comparar resultados en minutos.
- Investigacion en edicion de modelos por deltas: el artefacto sirve como caso de estudio reproducible de aritmetica de tareas sobre la cabeza de salida, incluyendo el caso particular de sumar un delta contra un instruct a una cabeza QAT.
- Recuperacion de comportamiento en modelos abliterated: la card documenta la ruta `voice delta` para aplicar la voz sobre variantes sin censura sin alterar en exceso el enrutado del MoE.
- Despliegue en hardware de consumo: al tratarse de un MoE con aproximadamente 4B parametros activos, la inferencia es mas barata que la de un denso de 26B, lo que permite servir un GGUF Q4_0 en una GPU de 24 GB o en memoria unificada de Apple Silicon.
- Chat de personaje en produccion con contexto largo: aplicable a asistentes conversacionales multi-turno en ingles, siempre que se verifique la longitud de contexto real del modelo base, dato no disponible en esta ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks propios en la informacion disponible. La model card menciona un resultado de CaliperBench correspondiente a SubMaroon/Boulesis-26B-A4B (mejor roleplay en la clase 24-26B, con modo thinking, septiembre de 2026) y advierte explicitamente de que esa cifra pertenece al autor del modelo fuente y no ha sido verificada por el autor de este delta.

| Benchmark | Este artefacto | Boulesis-26B-A4B (fuente) | Base QAT |
|---|---|---|---|
| CaliperBench (roleplay) | no disponible | mejor de la clase 24-26B segun la card del autor fuente, no verificado | no disponible |
| MMLU, HumanEval, GSM8K | no disponible | no disponible | no disponible |

## Requisitos de hardware

- El delta en si no requiere VRAM en inferencia: son 1,5 GB en disco que se aplican una sola vez para generar un GGUF nuevo.
- VRAM estimada para el modelo resultante: alrededor de 14-16 GB para una cuantizacion Q4_0 de un modelo de 26B, estimacion aritmetica no confirmada en la informacion disponible; las cuantizaciones Q5, Q6 y Q8 suben proporcionalmente.
- GPU recomendadas: RTX 3090 o RTX 4090 de 24 GB para Q4_0 con contexto moderado sin offload; A100 o H100 para despliegues concurrentes con cuantizaciones mayores.
- Cabe en GPU de consumo de 24 GB; en tarjetas de 16 GB y menos hace falta offload a CPU o cuantizaciones mas agresivas (Q3, Q2), con la perdida de calidad correspondiente.
- Memoria unificada: Apple Silicon con 32 GB o mas es un objetivo razonable para Q4_0, dado el bajo numero de parametros activos.
- Opciones de despliegue: llama.cpp mediante `llama serve -m modelo.gguf --jinja`, segun la propia card. Ollama, vLLM o TGI no se documentan para este artefacto; vLLM requeriria el modelo completo en safetensors, no un delta.
- Latencia y throughput: no disponible. Cabe esperar una velocidad de decodificacion mas cercana a la de un denso de 4B que a la de un denso de 26B por el enrutado MoE, pero no hay cifras publicadas en la informacion proporcionada.

## Comparativa con modelos similares

| Artefacto | Base de referencia | Tamano | Objetivo | Licencia |
|---|---|---|---|---|
| Boulesis-26B-A4B-QAT-Voice (este) | google/gemma-4-26B-A4B-it (instruct estandar) | 1,5 GB, tensor [262144, 2816] | GGUFs QAT de Gemma 4 26B A4B | gemma |
| Boulesis-26B-A4B-Voice | google/gemma-4-26B-A4B-it | no disponible | GGUFs estandar (no QAT) de 26B A4B | gemma |
| google/gemma-4-26B-A4B-it-qat-q4_0-unquantized | no aplica | modelo completo, no disponible | modelo base | gemma |
| SubMaroon/Boulesis-26B-A4B | modelo instruct de Gemma 4 | modelo completo, no disponible | modelo de roleplay en la clase 24-26B | gemma |

La diferencia funcional entre las dos voces es unicamente el punto de referencia del delta: usar la variante QAT sobre un GGUF construido desde el checkpoint QAT y la variante estandar sobre un GGUF construido desde el instruct. Aplicar la equivocada no rompe el modelo, pero sobrescribe pesos con el punto de referencia incorrecto.

## Limitaciones y advertencias

- No es un modelo autonomo: sin la herramienta Voice y un GGUF compatible no se puede ejecutar. No funciona con `transformers` de forma directa ni con vLLM sin reconstruir el modelo completo.
- Incompatibilidad de forma con cualquier otro tamano de Gemma 4 o con modelos que no sean Gemma: el tensor tiene forma fija `[262144, 2816]`.
- Solo ingles declarado; no se documenta soporte multilingue y se desconoce si el estilo se mantiene fuera del ingles.
- Al modificar unicamente la cabeza de salida, el estilo puede volverse exagerado o repetitivo si se combinan varias voces o se aplica el delta mas de una vez.
- Sesgos conocidos: no disponibles. El modelo fuente combina componentes de origen comunitario, incluidos injertos de razonamiento y variantes sin censura en el ecosistema QAT, cuyo comportamiento no esta caracterizado en esta informacion.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; el delta no incorpora mecanismos de verificacion y hereda el riesgo del modelo base.
- Licencia Gemma: los terminos de uso se heredan del modelo fuente y deben revisarse antes de redistribuir modelos con la voz aplicada. La card remite explicitamente a la del modelo fuente.
- La unica referencia de rendimiento citada (CaliperBench) procede del autor del modelo fuente, no de este artefacto, y no ha sido verificada de forma independiente.
- El repositorio tiene cero descargas y una interaccion minima, por lo que no existe validacion de la comunidad sobre su funcionamiento real.
- Fechas de publicacion y actualizacion poco habituales (septiembre de 2026) y busqueda web sin resultados relevantes: no se han encontrado analisis, replicaciones ni discusiones tecnicas independientes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Wiself/Boulesis-26B-A4B-QAT-Voice
- Herramienta Voice: https://huggingface.co/Wiself/voice
- Voz estandar (para GGUFs no QAT): https://huggingface.co/Wiself/Boulesis-26B-A4B-Voice
- Modelo fuente de la voz: https://huggingface.co/SubMaroon/Boulesis-26B-A4B
- Checkpoint base QAT: https://huggingface.co/google/gemma-4-26B-A4B-it-qat-q4_0-unquantized
- Blog de Google sobre QAT: https://developers.googleblog.com/en/gemma-3-quantized-aware-trained-state-of-the-art-ai-to-consumer-gpus/
- Resultado de CaliperBench citado en la card (atribuido al autor fuente): https://caliperbench.com/m/boulesis-26b-a4b-thinking/
- La busqueda web realizada no devolvio resultados relevantes; los unicos enlaces recuperados correspondian a paginas genericas de YouTube sin relacion con el modelo.
