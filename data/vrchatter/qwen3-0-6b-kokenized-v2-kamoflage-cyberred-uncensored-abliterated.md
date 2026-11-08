# VRChatter/Qwen3-0.6B-Kokenized-v2-Kamoflage-CyberRed-Uncensored-Abliterated

## Resumen
Kamoflage es un ajuste fino (finetune) del modelo Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated, publicado por el usuario VRChatter. Se trata de un modelo declarado explicitamente por su autor como "joke model" (modelo broma), cuyo comportamiento consiste en razonar de forma completa y, a continuacion, responder casi invariablemente con una de cinco variantes de la expresion japonesa 「かも」 ("puede ser" o "quizas"), elegida en funcion de la postura detectada en su propio razonamiento. No es, por tanto, un modelo orientado a produccion, sino una pieza experimental y de humor sobre control de la salida final en modelos de razonamiento.

Tecnicamente se apoya en la arquitectura Qwen3 de 0.6B parametros, heredando la traza de pensamiento (chain of thought) del modelo base sin alterarla. La innovacion que introduce es el metodo SGK (Stance-Graded Kokenization), que recopila trazas on-policy del modelo original, las etiqueta con cinco niveles de postura y reemplaza la respuesta final por la variante correspondiente, de modo que la salida final queda acoplada al razonamiento a traves de cinco canales estrechos. El resultado es un modelo que transmite aproximadamente log2(5) = 2.32 bits de informacion por respuesta, frente a 0 bits del predecesor.

Es relevante en el contexto de investigacion sobre alineacion y control de salidas en modelos con modo thinking, y como curiosidad tecnica reproducible en hardware muy modesto (0.6B parametros, apto para portatil o movil). Su utilidad practica fuera de ese ambito experimental es practicamente nula.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Qwen3), con modo thinking y modo non-thinking |
| Parametros totales | 596.049.920 (aprox. 0.6B) |
| Parametros activos | no disponible (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible en esta ficha; existe una version GGUF del modelo predecesor (Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated-GGUF) |
| Idiomas soportados | japones (ja) e ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); repo de 1.2 GB |

## Arquitectura y entrenamiento
El modelo parte de Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated (a su vez derivado de Qwen3-0.6B de Alibaba Cloud) y aplica un ajuste fino LoRA con rango 16, alpha 32 sobre todas las capas lineales, learning rate 1e-4 y 2 epocas, fusionado en los pesos en bf16. El entrenamiento sigue el procedimiento SGK en seis pasos: generacion de prompts con postura clara (hechos verdaderos, hechos falsos, opiniones, predicciones y conversacion trivial, mas un conjunto de repeticion de preguntas de ryota39/Aya_ja); generacion de trazas on-policy completas por parte del Qwen3-0.6B original (descartando trazas en bucle); etiquetado manual de cada traza y respuesta original con una de cinco posturas; realineamiento de todo lo posterior a `</think>` con la respuesta correspondiente a esa postura; balanceo del dataset (cada una de las cuatro clases de postura se sobremuestrea hasta 200 ejemplos, 800 ejemplos sin postura se repiten del conjunto de entrenamiento de v1 y aproximadamente el 10% de ejemplos usan modo non-thinking); y finalmente el ajuste fino LoRA descrito.

La innovacion principal, Stance-Graded Kokenization, reacopla la respuesta final al razonamiento (en v1 estaban deliberadamente desacoplados), pero solo a traves de cinco canales discretos. Las trazas de pensamiento se conservan intactas respecto al modelo base, por lo que la calidad del chain of thought no se modifica; el cambio se limita a la seleccion de la respuesta final segun la postura inferida.

## Capacidades
- Generacion de texto con razonamiento completo en modo thinking (traza heredada de Qwen3-0.6B).
- Seleccion de respuesta final entre cinco variantes de "quizas" segun la postura detectada en el razonamiento: かも (sin postura), かも？ (inseguro), かも…？ (desacuerdo), 可能性があります (acuerdo), かもかも！ (acuerdo fuerte).
- Conversacion multi-turno basica (preguntas, saludos y peticiones reciben 「かも」).
- Soporte de modo thinking y modo non-thinking (este ultimo en aproximadamente el 10% de los ejemplos de entrenamiento).
- Capacidades multilingues limitadas a japones e ingles; las trazas de pensamiento suelen estar en ingles por herencia del modelo base.
- No se documenta soporte de tool calling, function calling, agentes, vision, audio ni matematicas avanzadas; el ajuste fino no preserva de forma fiable las capacidades genericas del modelo base.

## Casos de uso
- Investigacion sobre control de salidas en modelos de razonamiento: sirve como banco de pruebas reproducible para estudiar como acoplar la respuesta final a la traza de pensamiento mediante canales discretos, con un coste computacional minimo.
- Estudio de metodos de etiquetado de postura: el pipeline SGK (generacion on-policy, etiquetado, realineamiento y balanceo) puede replicarse sobre otros modelos para analizar sesgos de postura.
- Demostraciones y divulgacion sobre chain of thought: permite mostrar en una charla o articulo como un modelo de 0.6B razona de forma completa y luego colapsa su salida a un conjunto finito de respuestas.
- Pruebas de evaluacion de "hedging" (atenuacion): los benchmarks propios del autor (KamoBench v2, VibeCheck-5, AgreeQA, Polite Disagreement Rate) pueden reutilizarse como base para disenar evaluaciones de consistencia en respuestas evasivas.
- Experimentos de cuantizacion y despliegue en edge: al tener 0.6B parametros, es adecuado para validar pipelines de inferencia en portatiles, moviles o GPUs de consumo con llama.cpp u Ollama, aunque la calidad de la salida en produccion no es util.
- Arte generativo y bots de VRChat o comunidades afines: por su caracter de broma y su respuesta predecible, encaja en experiencias conversacionales humoristicas donde el objetivo es la sorpresa o la repeticion de 「かも」.
- Analisis de comportamiento emergente: el autor documenta fusiones ocasionales de respuestas (「かもかもかも？」), que pueden estudiarse como fenomeno emergente de decodificacion.

## Benchmarks y rendimiento

| Benchmark | Kokenized v1 | Kamoflage |
|---|---|---|
| KamoBench v2 (consistencia de hedging) | 100.0 | 100.0 |
| VibeCheck-5 (precision de postura) | 20.0 | 97.3 |
| AgreeQA (acierta cuando debe estar de acuerdo) | 0.0 | 98.1 |
| Polite Disagreement Rate | 0.0 | 100.0 |
| Bits por respuesta | 0.00 | 2.32 |

Todas las puntuaciones fueron medidas con `kamo-eval v0.2`, en modo thinking y con temperatura 0.6, segun la model card del autor. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: al tratarse de 0.6B parametros, en bf16 ocupa aproximadamente 1.2 GB de pesos; en cuantizaciones de 8 bits o 4 bits (si se generan a partir de los safetensors) se reduce a rangos de 0.6-0.8 GB y 0.3-0.5 GB respectivamente, mas overhead de activaciones y cache KV.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) puede ejecutarlo con holgura; tambien A100 o H100 para despliegues por lotes, aunque es sobredimensionado para este modelo.
- Cabe en GPU consumer y en portatiles; el autor lo describe como "edge-ready" para GPUs de consumo, portatiles y smartphones.
- Opciones de despliegue: transformers (libreria indicada en la model card), text-generation-inference (tag endpoints_compatible), llama.cpp u Ollama si se dispone de pesos GGUF; existe una version GGUF del modelo predecesor (Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated-GGUF).
- Latencia y throughput: no disponibles en la informacion proporcionada. La model card recomienda permitir al menos 1.024 tokens nuevos por generacion para que el modelo complete su razonamiento antes de responder.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque | Disponibilidad |
|---|---|---|---|---|---|
| Kamoflage (este modelo) | 0.6B | no disponible | Apache 2.0 | Joke model con SGK, salida limitada a cinco variantes de "quizas" | Hugging Face (transformers, safetensors) |
| Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated (v1) | 0.6B | no disponible | Apache 2.0 | Predecesor; respuesta fija 「かも」 desacoplada del razonamiento | Hugging Face, con version GGUF |
| Qwen3-0.6B (modelo base original) | 0.6B | no disponible en la informacion proporcionada | Apache 2.0 | Modelo generalista de razonamiento y generacion de texto | Hugging Face, amplia disponibilidad |

La comparacion en rendimiento estandar no es posible con los datos disponibles; los unicos benchmarks publicados son internos (kamo-eval) y no comparables con MMLU o HumanEval. Frente al v1, Kamoflage anade 2.32 bits de informacion por respuesta y mejora la precision de postura de 20.0 a 97.3 en VibeCheck-5, manteniendo la consistencia de hedging en 100.0.

## Limitaciones y advertencias
- Es explicitamente un modelo broma: no debe usarse en produccion ni como asistente general, ya que su salida final esta restringida a cinco frases.
- Las etiquetas de postura fueron asignadas rapidamente y son ruidosas, por lo que las "opiniones" del modelo pueden ser incorrectas.
- El conjunto de afirmaciones etiquetadas es pequeno; ante afirmaciones no familiares, la postura elegida puede ser erronea.
- Ocasionalmente las respuestas se fusionan (por ejemplo 「かもかもかも？」), fenomeno que el autor considera una sexta forma emergente de decir "quizas" y que introduce impredecibilidad.
- Las trazas de pensamiento suelen estar en ingles por herencia del modelo base, lo que puede resultar incoherente en conversaciones en japones.
- Riesgo de alucinacion en la traza de razonamiento: al conservar el chain of thought del Qwen3-0.6B original, puede generar razonamientos plausibles pero incorrectos antes de emitir la respuesta final.
- Cobertura linguistica limitada a japones e ingles; no hay evidencia de buen rendimiento en castellano u otros idiomas.
- Licencia Apache 2.0 permite uso comercial, pero el comportamiento del modelo hace inviable dicho uso; ademas, al derivar de un modelo "uncensored/abliterated", no se garantiza el filtrado de contenido sensible.
- No se documenta soporte de tool calling, agentes ni contexto largo; la longitud de contexto no esta disponible en la informacion proporcionada.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/VRChatter/Qwen3-0.6B-Kokenized-v2-Kamoflage-CyberRed-Uncensored-Abliterated
- Modelo predecesor (v1): https://huggingface.co/VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated
- Version GGUF del predecesor: https://huggingface.co/VRChatter/Qwen3-0.6B-Kokenized-CyberRed-Uncensored-Abliterated-GGUF
- Dataset de repeticion citado: https://huggingface.co/datasets/ryota39/Aya_ja
- Guia de la familia Qwen3 (tamanos, contexto y memoria): https://baeseokjae.github.io/posts/qwen-3-full-lineup-guide-2026/
