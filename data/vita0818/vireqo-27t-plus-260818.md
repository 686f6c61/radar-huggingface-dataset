# Vita0818/Vireqo-27T-Plus-260818

## Resumen

Vireqo-27T-Plus-260818 es un modelo de generacion de texto experimental desarrollado por Vita0818 que combina la cuantizacion ternaria del modelo Qwen3.8-27B (a traves del proyecto prism-ml/Ternary-Bonsai-27B-gguf) con un preset de razonamiento acotado ("bounded thinking") de 512 tokens. Se distribuye exclusivamente en formato GGUF y esta disenado para ejecutarse con llama.cpp o LM Studio en hardware de consumo.

La peculiaridad de este lanzamiento es que no introduce pesos nuevos: el archivo principal es un enlace simbolico al modelo Vireqo-27B-Plus-260816 sin modificaciones, y la identidad "T-Plus" se aporta mediante un preset de LM Studio (`thinking-preset.json`) que configura un presupuesto de razonamiento de 512 tokens, temperatura 0 y contexto de 2048 tokens. Es un experimento sobre como el razonamiento acotado puede mejorar la precision en tareas sencillas sin necesidad de reentrenar el modelo.

Con 26.895.998.464 parametros (~26,9 mil millones) en cuantizacion ternaria q2_0, el archivo ocupa solo 7,06 GiB, lo que permite ejecutarlo en GPUs de consumo con 8 GB de VRAM. El modelo soporta ingles y chino, esta licenciado bajo Apache 2.0 y el autor lo marca explicitamente como experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.8-27B) con pesos ternarios |
| Parametros totales | 26.895.998.464 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 2048 tokens (configurado por preset) |
| Tipos de cuantizacion | q2_0 (ternaria) |
| Idiomas soportados | Chino (zh), ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen3.8-27B, un transformer denso de 27 mil millones de parametros, cuantizado a pesos ternarios (valores discretos en {-1, 0, 1}) mediante el proyecto prism-ml/Ternary-Bonsai-27B-gguf. No se ha realizado ningun entrenamiento o fine-tuning adicional: los pesos son fisicamente identicos a los del modelo Vireqo-27B-Plus-260816, verificados por el mismo SHA-256 (`a32a8ec286a11c6534bf29d1ee20bd4c02064032b51ae8310bb1216e2de17e03`) y sin copia fisica nueva en el repositorio.

La innovacion principal es el preset "Think512-Concise", que configura el modelo para un modo de razonamiento acotado: presupuesto de razonamiento de 512 tokens, maximo de respuesta de 768 tokens, temperatura 0, top-p 1, penalizacion de repeticion 1,08, contexto 2048 y paralelismo 1. El sistema inyecta un mensaje de presupuesto en chino que instruye al modelo a revisar sus conclusiones y emitir solo la respuesta final cuando se agota el presupuesto, sin mostrar el proceso de razonamiento. Este enfoque no modifica los pesos, sino que controla el comportamiento en tiempo de inferencia.

## Capacidades

- Generacion de texto en ingles y chino.
- Razonamiento acotado ("bounded thinking"): el modelo puede dedicar hasta 512 tokens a razonar internamente antes de emitir la respuesta final.
- Validacion manual documentada en tres categorias: preguntas de capitales, multiplicacion aritmetica y problemas clasicos de algebra (gallinas y conejos), todas con respuestas finales correctas y razonamiento separado no vacio.
- Compatible con llama.cpp y LM Studio mediante el preset incluido (`thinking-preset.json`).
- Hereda las capacidades linguisticas del modelo Vireqo-27B-Plus-260816 (modo "Plus" de lenguaje).
- Soporte de inferencia local en CPU o GPU gracias al formato GGUF.

## Casos de uso

- Inferencia local en hardware de gama baja: con un archivo de solo 7,06 GiB, el modelo puede ejecutarse en GPUs con 8 GB de VRAM, lo que permite desplegar un LLM de 27B en equipos de consumo sin necesidad de servidores dedicados.
- Experimentacion con cuantizacion ternaria: sirve como banco de pruebas para evaluar el impacto de la precision ternaria en tareas de razonamiento sencillo, comparando con el modelo original en precision completa.
- Prototipado rapido de asistentes conversacionales bilingues (zh/en) con presupuesto de razonamiento controlado, util para validar flujos de agente antes de invertir en modelos mayores.
- Tareas de QA factual simple: la validacion del autor muestra resultados correctos en preguntas de capitales y aritmetica basica, lo que lo hace adecuado para dominios acotados con preguntas de respuesta corta.
- Educacion e investigacion: permite estudiar como un preset de "thinking" acotado afecta a la calidad de las respuestas sin reentrenar el modelo, y como la cuantizacion ternaria degrada el razonamiento.
- Despliegue en entornos con restricciones de memoria: el formato GGUF y el bajo peso permiten ejecutar el modelo en CPUs con al menos 16 GB de RAM, o en GPUs modestas, para aplicaciones donde el coste de infraestructura es critico.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. El autor solo documenta una validacion manual con tres tipos de tareas (capitales, multiplicacion y problema de gallinas y conejos), en las que las respuestas finales fueron correctas con razonamiento separado y no vacio. El propio autor advierte que "este preset conciso no es una afirmacion de benchmark de razonamiento general", y que las tareas complejas pueden requerir una linea con presupuesto mayor.

## Requisitos de hardware

- Tamano del archivo: 7.585.332.288 bytes (7,06 GiB), por lo que cabe en GPUs con 8 GB de VRAM.
- GPUs recomendadas: cualquier GPU con al menos 8 GB de VRAM (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4090, etc.). Tambien puede ejecutarse en CPU con al menos 16 GB de RAM.
- Opciones de despliegue: llama.cpp, LM Studio (con el preset incluido), y cualquier runtime compatible con GGUF.
- Latencia: no disponible. El autor indica que el modo Plus "tiende a usar mas del presupuesto de 512 tokens de razonamiento y es mas lento que el T estandar", por lo que la latencia sera mayor que la de un modelo sin razonamiento activado.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | Contexto | Licencia | Formato |
|---|---|---|---|---|---|
| Vireqo-27T-Plus-260818 | 26,9B | ternaria (q2_0) | 2048 | Apache 2.0 | GGUF |
| Qwen3.8-27B (original) | 27B | no cuantizado | no disponible | Apache 2.0 | safetensors |
| prism-ml/Ternary-Bonsai-27B-gguf | 27B | ternaria | no disponible | no disponible | GGUF |

No se dispone de datos de rendimiento comparativos entre estos modelos, ya que no se han publicado benchmarks para ninguno de ellos en la informacion disponible.

## Limitaciones y advertencias

- Precision muy reducida: la cuantizacion ternaria (q2_0) implica una perdida significativa de calidad respecto al modelo original en precision completa, especialmente en tareas que requieren matices semanticos.
- Contexto limitado a 2048 tokens, muy por debajo de los modelos modernos que ofrecen ventanas de 32K o 128K; no es adecuado para documentos largos o conversaciones extensas.
- Presupuesto de razonamiento acotado a 512 tokens: tareas complejas pueden no caber en el presupuesto y producir respuestas incompletas o incorrectas.
- El razonamiento "ilimitado" no esta soportado: el preset fuerza un limite estricto y no existe configuracion alternativa publicada.
- Solo soporta chino e ingles; no se garantiza calidad en otros idiomas.
- El autor advierte que "el modelo ternario subyacente conserva todas las limitaciones de Plus", lo que sugiere que puede haber sesgos o errores heredados del modelo base Qwen.
- Es un modelo experimental (etiquetado como tal) con 0 descargas y 0 likes en el momento de la publicacion; no hay comunidad que lo haya validado de forma independiente.
- No hay benchmarks publicados que respalden afirmaciones de rendimiento general; la validacion del autor es manual y limitada a tres tipos de tarea.
- No se recomienda su uso en produccion sin una evaluacion exhaustiva previa en el dominio de aplicacion concreto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Vita0818/Vireqo-27T-Plus-260818
- Modelo base Qwen: https://huggingface.co/Qwen/Qwen3.8-27B
- Modelo base ternario: https://huggingface.co/prism-ml/Ternary-Bonsai-27B-gguf
- Perfil de GitHub del autor: https://github.com/Vita0818/
