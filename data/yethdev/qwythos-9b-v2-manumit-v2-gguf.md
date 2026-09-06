# yethdev/qwythos-9b-v2-manumit-v2-GGUF

## Resumen

El modelo `yethdev/qwythos-9b-v2-manumit-v2-GGUF` es una version cuantizada en formato GGUF del modelo `qwythos-9b-v2-manumit-v2`, desarrollado por el autor `yethdev`. Se trata de un modelo de lenguaje de texto generacion con aproximadamente 8.953.803.264 parametros (9.000 millones), que parte del modelo base `empero-ai/Qwythos-9B-v2` y al que se le ha aplicado una tecnica llamada "manumit". Esta tecnica identifica las direcciones en el flujo residual del modelo que provocan el comportamiento de rechazo ante determinadas peticiones, las proyecta fuera de los pesos y, posteriormente, "cura" el modelo con datos ordinarios para que la ablacion no degrade significativamente sus capacidades. El resultado es un modelo que apenas muestra rechazo ante prompts dañinos, manteniendo un rendimiento cercano al modelo original.

Esta version GGUF incluye tres cuantizaciones (Q4_K_M, Q5_K_M y Q8_0) y esta pensada para ejecutarse en CPU o en GPU con poca memoria, a traves de herramientas como llama.cpp, Ollama o LM Studio. No se especifican datos sobre la arquitectura interna, la longitud de contexto ni los idiomas soportados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se especifica si es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q4_K_M, Q5_K_M, Q8_0 |
| Idiomas soportados | no disponibles |
| Licencia | MIT (el modelo base mantiene sus propios terminos) |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

La informacion disponible no detalla la arquitectura exacta del modelo ni los datos de entrenamiento originales. El modelo es una adaptacion de `empero-ai/Qwythos-9B-v2`, un modelo de lenguaje de aproximadamente 9.000 millones de parametros. La innovacion principal es el proceso "manumit", que consiste en localizar las direcciones en el flujo residual que codifican el rechazo y eliminarlas de los pesos del modelo. Tras esta ablacion, el modelo se "cura" con datos ordinarios para recuperar la capacidad perdida. Los benchmarks presentados por el autor muestran que la tasa de rechazo se reduce practicamente a cero en AdvBench y a un 4.2% en JailbreakBench, mientras que la puntuacion en MMLU-Pro se mantiene en un 49.2% frente al 49.3% del modelo base. La cabeza de prediccion multi-token no esta incluida en estos archivos; segun el autor, solo alimentaba la decodificacion especulativa auto-especulativa y su ausencia no afecta a la generacion normal.

## Capacidades

- Generacion de texto en general: el modelo es capaz de producir respuestas a prompts de texto, sin funcionalidades de vision ni audio documentadas.
- Respuesta sin rechazo: el proceso manumit elimina casi por completo el comportamiento de rechazo del modelo, como muestran las tasas de 0.0% en AdvBench y 4.2% en JailbreakBench.
- Razonamiento general: la puntuacion en MMLU-Pro (49.2%) es cercana a la del modelo base (49.3%), lo que indica que la ablacion no ha degradado significativamente las capacidades de conocimiento y razonamiento.
- No se ha documentado soporte de tool calling, function calling, agentes, multi-step reasoning, vision ni audio en la informacion disponible.

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como se comporta un modelo sin capas de rechazo, comparando sus respuestas con el modelo base en conjuntos de prompts dañinos. Se puede ejecutar localmente con llama.cpp para reproducir los resultados de AdvBench y JailbreakBench.
- Generacion de contenido creativo sin filtros: la ausencia de rechazo permite usar el modelo en escritura de ficcion, roleplay o narrativa interactiva donde el modelo base podria evadir temas sensibles. La cuantizacion Q4_K_M facilita su uso en equipos modestos.
- Asistente de conocimiento general: con un MMLU-Pro del 49.2%, el modelo puede responder preguntas de cultura, ciencias o humanidades, aunque se recomienda verificar las respuestas en entornos de produccion.
- Prototipado en local: gracias a los archivos GGUF, el modelo puede probarse en una GPU de consumo con 8 GB de VRAM o incluso en CPU, lo que permite iterar rapidamente en aplicaciones de chat sin necesidad de infraestructura cloud.
- Pruebas de robustez de jailbreaks: los datos de JailbreakBench muestran que el modelo responde a tecnicas de jailbreak con una tasa de rechazo del 4.2%. Esto resulta util para investigadores que quieran analizar el comportamiento de modelos ablacionados ante ataques.
- Chatbot para temas controvertidos: en comunidades o foros donde se necesita que el asistente responda sin evasivas a preguntas delicadas, este modelo ofrece respuestas directas. El desarrollador debe asumir la responsabilidad del contenido generado y asegurarse de cumplir la legislacion aplicable.

## Benchmarks y rendimiento

El autor publica los siguientes resultados, comparando el modelo manumit con el modelo base:

| Benchmark | Este modelo | Modelo base |
|---|---|---|
| AdvBench (tasa de rechazo) | 0.0% | alta |
| JailbreakBench (tasa de rechazo) | 4.2% | alta |
| MMLU-Pro (n=500) | 49.2% | 49.3% |

No se han publicado resultados de otros benchmarks (HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- Los archivos GGUF tienen los siguientes tamanos: Q4_K_M 5.6 GB, Q5_K_M 6.5 GB y Q8_0 9.5 GB. La VRAM necesaria para la inferencia sera superior al tamano del archivo debido al contexto y las activaciones.
- No se han proporcionado recomendaciones de GPU especificas. El archivo Q4_K_M de 5.6 GB sugiere que una GPU de consumo con 8 GB de VRAM puede ejecutar el modelo, mientras que Q8_0 (9.5 GB) requeriria al menos 12 GB de VRAM o la carga en CPU.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y cualquier otro software compatible con el formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de informacion comparativa con otros modelos de la misma categoria en los datos proporcionados. La comparacion mas directa es con el modelo base `empero-ai/Qwythos-9B-v2`, del que se diferencia por la eliminacion del rechazo, la ausencia de la cabeza de prediccion multi-token y la cuantizacion GGUF.

| Parametro | Este modelo | Modelo base |
|---|---|---|
| Parametros totales | 8.953.803.264 | 8.953.803.264 (estimado, no confirmado) |
| Formato | GGUF | safetensors |
| AdvBench refusal | 0.0% | alta |
| JailbreakBench refusal | 4.2% | alta |
| MMLU-Pro | 49.2% | 49.3% |
| Licencia | MIT | Terminos propios del modelo base |

## Limitaciones y advertencias

- Sesgos conocidos: no se han documentado sesgos especificos en la informacion disponible.
- Riesgo de alucinacion: no se han publicado metricas de alucinacion; como todo modelo de lenguaje, existe riesgo de generar informacion inexacta.
- Limitaciones de contexto o idioma: la longitud de contexto y los idiomas soportados no estan especificados en la informacion disponible.
- Restricciones de licencia: la licencia del repositorio GGUF es MIT, pero el modelo base `empero-ai/Qwythos-9B-v2` mantiene sus propios terminos. Antes de un uso comercial es obligatorio revisar la licencia del modelo base.
- Advertencia de produccion: el autor indica explicitamente que no hay capa de seguridad ni modelo guardian que supervise la salida. El usuario es responsable del contenido generado y debe cumplir la ley y los terminos del modelo base. No es recomendable desplegarlo en sistemas que requieran moderacion automatica.
- La cabeza de prediccion multi-token no esta incluida; esto no afecta a la generacion normal, pero puede impactar en tecnicas que dependan de ella, como la decodificacion especulativa.

## Enlaces

- Repositorio GGUF: https://huggingface.co/yethdev/qwythos-9b-v2-manumit-v2-GGUF
- Modelo base manumit: https://huggingface.co/yethdev/qwythos-9b-v2-manumit-v2
- Modelo base original: https://huggingface.co/empero-ai/Qwythos-9B-v2
