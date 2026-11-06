# tstepspam/Mistral-Small-22B-ArliAI-RPMax-v1.1-Q8-MLX

## Resumen

Mistral-Small-22B-ArliAI-RPMax-v1.1-Q8-MLX es una cuantizacion en 8 bits (formato MLX) del modelo ArliAI/Mistral-Small-22B-ArliAI-RPMax-v1.1, un ajuste fino de la familia Mistral Small de 22 000 millones de parametros orientado a conversacion y a la maximizacion de la longitud y riqueza de las respuestas (RP, de *roleplay* o *response prompting*). El modelo original lo publica ArliAI sobre la base Mistral-Small-22B, y esta version la distribuye el usuario tstepspam empaquetando los pesos en safetensors cuantizados a 8 bits para su uso con la libreria MLX de Apple.

La relevancia practica de esta ficha es doble. Por un lado, permite ejecutar un transformer denso de 22 000 millones de parametros en hardware Apple Silicon (M1/M2/M3/M4) con un consumo de memoria reducido respecto a los pesos en FP16, gracias a la cuantizacion de 8 bits y al backend MLX. Por otro, el ajuste RPMax de ArliAI esta pensado para conversaciones largas y detalladas, lo que lo hace interesante para asistentes conversacionales y generacion de texto creativo.

No obstante, conviene subrayar que se trata de una cuantizacion comunitaria sin model card propia: el repositorio no aporta informacion sobre datos de entrenamiento, benchmarks, idiomas soportados ni detalles del proceso de cuantizacion. Toda la informacion tecnica disponible proviene del modelo base y de los metadatos del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (familia Mistral Small), inferencia via MLX |
| Parametros totales | 22 247 282 688 (22,25 B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral Small soporta contexto largo, pero no se confirma en esta ficha) |
| Tipos de cuantizacion | 8 bits (Q8) en formato MLX |
| Idiomas soportados | no disponible |
| Licencia | MRL 0.1 (Mistral Research License), heredada del modelo base |
| Formato de pesos | safetensors cuantizados (MLX), repositorio de 23,6 GB |
| Libreria de inferencia | MLX |
| Modelo base | ArliAI/Mistral-Small-22B-ArliAI-RPMax-v1.1 |
| Fecha de publicacion | 2026-11-05 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer denso de la familia Mistral Small con 22 250 millones de parametros. El modelo original de ArliAI es un ajuste fino de Mistral-Small-22B orientado a conversacion y a la generacion de respuestas extensas (RPMax). No se dispone de informacion detallada sobre el dataset de ajuste fino, el numero de tokens utilizados ni si se aplicaron tecnicas de RLHF o DPO; la model card del repositorio no incluye estos datos.

La contribucion tecnica de este repositorio concreto es la cuantizacion a 8 bits en el formato de MLX, que permite cargar el modelo en memoria unificada de equipos Apple Silicon. El proceso de cuantizacion reduce el peso del repositorio a 23,6 GB, lo que hace viable la inferencia en equipos con 32 GB o 64 GB de memoria unificada, algo imposible con pesos en FP16 (que rondarian los 44 GB). No se documenta en la informacion disponible si la cuantizacion se aplico a todas las capas o solo a las lineales, ni el grupo de cuantizacion empleado.

## Capacidades

- Generacion de texto conversacional multi-turno, con enfasis en respuestas largas y detalladas gracias al ajuste RPMax.
- Generacion de texto creativo y roleplay, ambito para el que fue optimizado el ajuste de ArliAI.
- Razonamiento basico y respuesta a instrucciones, heredado de la base Mistral Small.
- Generacion de codigo y matematicas a nivel general (capacidad propia de la familia Mistral Small, no verificada en esta cuantizacion).
- Soporte de tool calling / function calling: no confirmado en la informacion disponible para este ajuste concreto.
- Capacidades de agente y razonamiento multi-paso: no confirmadas en la informacion disponible.
- Capacidades multilingues: no disponibles; no se documentan los idiomas soportados.
- Modo thinking, vision o audio: no disponible.

## Casos de uso

- Asistente conversacional local en Mac: el modelo puede ejecutarse con MLX en equipos Apple Silicon con 32 GB o mas de memoria unificada, ofreciendo un asistente privado sin conexion a servicios en la nube.
- Generacion de texto creativo y narrativa: el ajuste RPMax esta disenado para producir respuestas extensas y detalladas, lo que encaja en escritura de ficcion, guiones y desarrollo de personajes.
- Roleplay y chatbots de personaje: la orientacion del ajuste a respuestas ricas y largas lo hace adecuado para aplicaciones de entretenimiento conversacional.
- Prototipado de aplicaciones de chat en macOS/iOS: al usar MLX, se integra de forma natural en el ecosistema de Apple para pruebas de concepto de asistentes.
- Investigacion sobre cuantizacion: util como referencia para estudiar la degradacion de calidad de un modelo de 22 B al pasar a 8 bits en MLX frente a los pesos originales.
- Generacion de borradores y resumenes de documentos largos: si se confirma el contexto extendido del modelo base, podria emplearse para procesar textos extensos, aunque este extremo no esta verificado en la informacion disponible.
- Fine-tuning posterior o evaluacion comparativa: sirve como punto de partida para experimentos de ajuste o comparaciones de rendimiento entre cuantizaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM/memoria estimada: el repositorio ocupa 23,6 GB en disco; en memoria unificada se necesita un margen adicional para el contexto y el runtime de MLX, por lo que se recomienda al menos 32 GB de memoria unificada.
- GPU recomendadas: Apple Silicon con memoria unificada de 32 GB o superior (M1 Pro/Max/Ultra, M2 Pro/Max/Ultra, M3 Pro/Max, M4 Pro/Max). No es compatible de forma nativa con GPUs NVIDIA o AMD a traves de MLX.
- Cabe en consumer GPU: si, en equipos Apple con 32 GB o mas de memoria unificada. En GPUs de consumo con 24 GB (por ejemplo, RTX 4090) no cabria en 8 bits sin tecnicas adicionales, y ademas el formato MLX no esta pensado para CUDA.
- Opciones de despliegue: MLX (libreria nativa), mlx-lm para generacion, y potencialmente herramientas del ecosistema Apple que consuman pesos MLX. No es compatible directamente con vLLM, llama.cpp, Ollama o TGI sin conversion de formato.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Mistral-Small-22B-ArliAI-RPMax-v1.1-Q8-MLX (este) | 22,25 B | no disponible | MRL 0.1 | safetensors MLX 8 bits | Cuantizacion comunitaria para Apple Silicon |
| ArliAI/Mistral-Small-22B-ArliAI-RPMax-v1.1 | 22,25 B | no disponible | MRL 0.1 | safetensors (FP16/BF16) | Modelo base sin cuantizar; requiere mas memoria |
| Mistral-Small-22B (original) | 22,25 B | no disponible | MRL 0.1 | safetensors | Modelo base de Mistral AI; sin ajuste conversacional RPMax |
| Mistral-Small-24B-Instruct (familia posterior) | ~24 B | no disponible | Apache 2.0 en algunas versiones | safetensors, GGUF | Alternativa mas reciente de Mistral AI; licencia mas permisiva en algunas variantes |

La comparativa se limita a la familia Mistral Small porque no se dispone de datos de benchmarks ni de contexto que permitan comparaciones cuantitativas con otras familias. La diferencia principal frente al modelo base es el formato MLX y la cuantizacion a 8 bits, que reducen el requisito de memoria a costa de una posible perdida de calidad no medida en la informacion disponible.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la informacion disponible; al heredar de Mistral Small, es previsible que arrastre sesgos del corpus original, pero no se confirma.
- Riesgo de alucinacion: no evaluado; el ajuste RPMax prioriza respuestas largas, lo que puede aumentar la probabilidad de contenido inventado en dominios factuales.
- Limitaciones de contexto e idioma: no se especifican ni la longitud de contexto efectiva ni los idiomas soportados en esta cuantizacion.
- Restricciones de licencia: la licencia MRL 0.1 (Mistral Research License) restringe el uso comercial; es imprescindible revisar los terminos antes de desplegar el modelo en produccion.
- Cuantizacion no verificada: no hay informacion sobre el metodo de cuantizacion, el grupo de cuantizacion ni evaluaciones de degradacion de calidad; el rendimiento real puede diferir del modelo base.
- Compatibilidad limitada: el formato MLX solo funciona en el ecosistema Apple; no es portable a CUDA ni a otros backends sin conversion.
- Repositorio sin model card propia: no hay garantias del autor de la cuantizacion sobre el proceso ni sobre los resultados.
- Fecha de creacion futura en los metadatos (2026-11-05): conviene verificar la integridad y procedencia del repositorio antes de usarlo.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tstepspam/Mistral-Small-22B-ArliAI-RPMax-v1.1-Q8-MLX
- Modelo base: https://huggingface.co/ArliAI/Mistral-Small-22B-ArliAI-RPMax-v1.1
- Licencia MRL 0.1: https://mistral.ai/licenses/MRL-0.1.md
- Terminos de Mistral AI: https://mistral.ai/terms/
- Libreria MLX: https://github.com/ml-explore/mlx
