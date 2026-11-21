# tinyopsec/LFM-2.5-2.6B-heretic-GGUF

## Resumen
LFM-2.5-2.6B-heretic-GGUF es una distribucion en formato GGUF del modelo heretic-org/LFM-2.5-2.6B-heretic, una variante "abliterated" o "decensored" del LFM2.5-2.6B original de Liquid AI. El autor de esta conversion es el usuario tinyopsec, que publica el modelo con 13 niveles de cuantizacion distintos generados mediante llama.cpp, desde F16 hasta Q2_K. El modelo base pertenece a la familia LFM2.5 de Liquid AI, disenada para generacion de texto conversacional con un equilibrio entre tamano reducido y capacidades de razonamiento.

El interes de esta publicacion es doble. Por un lado, ofrece el modelo en un formato directamente ejecutable en runtimes de inferencia local como llama.cpp, Ollama, LM Studio o koboldcpp, lo que facilita su despliegue en hardware de consumo. Por otro, incorpora la modificacion "heretic", que elimina total o parcialmente los mecanismos de rechazo y alineacion del modelo original, un tipo de intervencion que interesa a investigadores que estudian el comportamiento de modelos abliterated y a desarrolladores que necesitan un modelo sin filtros de contenido para casos de uso creativos o de investigacion.

Con 2.697.198.592 parametros (aproximadamente 2.7 mil millones) y un repositorio de 26.3 GB que alberga todas las cuantizaciones, el modelo se posiciona en la gama de modelos pequenos aptos para ejecucion en GPU de consumo. El modelo acumula 735 descargas en Hugging Face y no cuenta con likes, lo que sugiere una adopcion temprana y limitada. La licencia es "other", heredada de la LFM Open License v1.0 del modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base LFM2.5 de Liquid AI; arquitectura exacta no especificada en la informacion) |
| Parametros totales | 2.697.198.592 (aproximadamente 2.7B) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | other (LFM Open License v1.0, segun la model card) |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento
La informacion proporcionada no detalla la arquitectura interna del modelo base LFM2.5-2.6B de Liquid AI. Se sabe que el modelo original pertenece a la familia LFM2.5, pero no se especifica si emplea un transformer clasico, una arquitectura hibrida o algun otro diseno. Tampoco se dispone de datos sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO en el modelo original.

La innovacion tecnica destacable de esta publicacion concreta es el proceso "heretic" aplicado por heretic-org, que produce una version abliterated del modelo, es decir, una intervencion sobre los pesos orientada a eliminar la direccion de rechazo aprendida durante el alineamiento. Sobre esa variante, tinyopsec genera las cuantizaciones GGUF mediante llama.cpp, preservando el comportamiento del modelo base en cada nivel de compresion. No se dispone de informacion sobre el metodo exacto de abliteration empleado ni sobre el impacto cuantitativo de la intervencion en las capacidades del modelo.

## Capacidades
- Generacion de texto conversacional: el pipeline declarado es text-generation y el tag "conversational" indica soporte para dialogos multi-turno.
- Modelo "decensored" o "abliterated": no aplica los filtros de rechazo tipicos del modelo alineado original, lo que permite generar contenido que el modelo base rechazaria.
- Compatibilidad con runtimes GGUF: funciona en llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con el formato.
- Ejecucion local: el tamano de 2.7B permite inferencia en hardware de consumo.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible; los idiomas no estan especificados.
- Capacidades especiales (vision, audio, thinking mode): no disponible en la informacion proporcionada.

## Casos de uso
- Investigacion sobre alineacion y abliteration: el modelo permite estudiar como la eliminacion de la direccion de rechazo afecta al comportamiento generativo, comparando las respuestas del modelo heretic con las del LFM2.5-2.6B original en conjuntos de prompts controlados.
- Generacion creativa sin restricciones: escritores y creadores de contenido pueden emplear el modelo para narrativa, guiones o poesia donde el modelo alineado aplicaria filtros, ejecutandolo localmente con llama.cpp y la cuantizacion Q4_K_M para un equilibrio entre calidad y consumo de memoria.
- Despliegue en hardware de consumo: con 2.7B parametros y cuantizaciones desde Q2_K, el modelo cabe en GPUs de gama media y en CPU con RAM suficiente, lo que lo hace adecuado para prototipos y demos en portatiles.
- Experimentacion con cuantizacion: el repositorio ofrece 13 niveles de cuantizacion, lo que permite a investigadores medir la degradacion de calidad y el impacto en el comportamiento del modelo a medida que se reduce la precision, desde F16 hasta Q2_K.
- Chatbot local sin conexion: integrado en Ollama o LM Studio, el modelo puede servir como asistente conversacional en entornos air-gapped donde no se permite enviar datos a APIs externas.
- Evaluacion comparativa de variantes heretic: desarrolladores que construyen pipelines de evaluacion pueden comparar esta variante GGUF con otras versiones abliterated del mismo modelo base para seleccionar la que mejor preserve las capacidades originales.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: aproximadamente 5.2 GB para F16, en torno a 2.8-3.0 GB para Q8_0, cerca de 2.0-2.2 GB para Q4_K_M y alrededor de 1.2-1.5 GB para Q2_K (estimaciones basadas en el tamano de los ficheros y el numero de parametros; no confirmadas en la informacion).
- GPU recomendadas: no disponibles en la informacion. Por tamano, el modelo es apto para GPUs de consumo como RTX 3060, RTX 4060, RTX 4090 o superiores, asi como para GPUs de datacenter (A100, H100) si se busca throughput alto.
- Cabe en GPU de consumo: si, en la mayoria de GPUs con 4 GB o mas de VRAM usando cuantizaciones Q4 o inferiores.
- Opciones de despliegue: llama.cpp (referencia explicita en la model card), Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF.
- Latencia y throughput estimados: no disponibles en la informacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| tinyopsec/LFM-2.5-2.6B-heretic-GGUF | 2.7B | no disponible | other (LFM Open License v1.0) | GGUF | Hugging Face, 735 descargas |
| heretic-org/LFM-2.5-2.6B-heretic | 2.7B | no disponible | no disponible | safetensors (presumible) | Hugging Face (modelo base) |
| LiquidAI/LFM2.5-2.6B | 2.7B | no disponible | LFM Open License v1.0 | safetensors | Hugging Face (modelo original) |

La comparativa se limita a las tres variantes del mismo modelo base, ya que la informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos alternativos de otros autores. No se dispone de datos de benchmarks que permitan comparar capacidades con modelos de la misma categoria.

## Limitaciones y advertencias
- Modelo decensored/abliterated: la model card advierte explicitamente "Evaluate before use". El modelo no aplica los filtros de seguridad del LFM2.5 original, por lo que puede generar contenido inapropiado, ofensivo o danoso.
- Riesgo de alucinacion: no se dispone de evaluaciones especificas, pero al ser un modelo de 2.7B parametros es esperable una tasa de alucinacion superior a la de modelos de mayor tamano.
- Idiomas: no se especifican los idiomas soportados; se desconoce el rendimiento en castellano.
- Contexto: la longitud de contexto no esta documentada en la informacion disponible, lo que impide garantizar conversaciones de contexto largo.
- Licencia: la LFM Open License v1.0 puede imponer restricciones al uso comercial; debe revisarse el texto completo de la licencia antes de desplegar el modelo en produccion. La modificacion heretic puede no estar cubierta explicitamente por la licencia original.
- Sesgos: no se han documentado sesgos especificos, pero la eliminacion de la alineacion puede amplificar sesgos presentes en los datos de entrenamiento.
- Adopcion limitada: 735 descargas y 0 likes indican poca validacion por parte de la comunidad; no hay evidencia de uso en produccion.
- Procedencia de la cuantizacion: el autor de la conversion es un usuario individual (tinyopsec), no el equipo de Liquid AI; la calidad de las cuantizaciones no ha sido auditada por el desarrollador original.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/tinyopsec/LFM-2.5-2.6B-heretic-GGUF
- Modelo base (heretic): https://huggingface.co/heretic-org/LFM-2.5-2.6B-heretic
- Modelo original de Liquid AI: https://huggingface.co/LiquidAI/LFM2.5-2.6B
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
- Ollama: https://ollama.com
- LM Studio: https://lmstudio.ai
- koboldcpp: https://github.com/LostRuins/koboldcpp
