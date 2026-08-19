# xCloudinfo/Qwen3.8-27B-Uncensored-GGUF

## Resumen

Qwen3.8-27B-Uncensored-xCloud es un modelo de lenguaje de 27.320 millones de parametros desarrollado por la empresa taiwanesa xCloudinfo (云硕科技). Se trata de una version modificada del modelo Qwen3.5 que ha sido sometida a un proceso de abliteration, una tecnica que elimina la direccion de rechazo del modelo, es decir, la tendencia a negarse a responder ciertas peticiones. El resultado es un modelo que responde de forma mas directa y sin filtros aparentes, aunque con los riesgos que ello conlleva.

Esta ficha se centra en la version cuantizada a formato GGUF, publicada por el mismo autor, que permite ejecutar el modelo con llama.cpp y herramientas compatibles como Ollama o el servidor OpenAI-compatible de llama.cpp. El modelo base safetensors esta disponible en el repositorio xCloudinfo/Qwen3.8-27B-Uncensored-xCloud. La relevancia de esta version GGUF radica en que facilita el despliegue en entornos de produccion con recursos limitados, manteniendo un equilibrio entre calidad y consumo de memoria.

El modelo presenta una arquitectura hibrida que combina mecanismos SSM (State Space Model) y atencion lineal, una innovacion que reduce la complejidad computacional respecto a la atencion tradicional. Esta caracteristica, junto con la cuantizacion, lo hace especialmente atractivo para aplicaciones de agente conversacional y generacion de texto en tiempo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida SSM / atencion lineal (arquitectura qwen35) |
| Parametros totales | 27.320.697.856 (27,3 B) |
| Parametros activos | no disponible |
| Longitud de contexto | 8192 tokens (configuracion recomendada por el autor) |
| Tipos de cuantizacion | Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS, IQ2_M (con imatrix) |
| Idiomas soportados | chino (zh), ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (llama.cpp) |

## Arquitectura y entrenamiento

El modelo base es una variante de la familia Qwen3.5 con 27.300 millones de parametros. La arquitectura es hibrida, combinando capas de espacio de estados (SSM) con mecanismos de atencion lineal. Esta combinacion reduce el coste computacional de la atencion tradicional, que escala cuadraticamente con la longitud de la secuencia, permitiendo un procesamiento mas eficiente de contextos largos. El autor indica que llama.cpp maneja correctamente el estado recursivo de este tipo de arquitectura en un unico dispositivo.

El proceso de abliteration, aplicado al modelo safetensors original, consiste en eliminar o atenuar los vectores de direccion del modelo que se asocian con el rechazo de peticiones. Esta tecnica no implica un reentrenamiento completo, sino una modificacion de los pesos basada en el analisis de activaciones. El resultado es un modelo que tiende a responder a practicamente cualquier peticion, sin mostrar reticencias.

Los datos de entrenamiento del modelo base no se detallan en la informacion disponible. No se especifica el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO. La cuantizacion a formato GGUF se realizo con la herramienta llama.cpp, aplicando una importancia matrix (imatrix) para optimizar la calidad de las cuantizaciones IQ y K.

## Capacidades

- Generacion de texto en chino e ingles con fluidez, manteniendo las capacidades linguisticas del modelo base Qwen3.5.
- Razonamiento y resolucion de problemas en multiples dominios, incluyendo matematicas, logica y comprension lectora.
- Generacion de codigo en diversos lenguajes de programacion, gracias a las capacidades del modelo base.
- Soporte de tool calling y function calling, lo que permite su integracion en pipelines de agentes que necesitan invocar herramientas externas.
- Capacidad para mantener conversaciones multi-turno con contexto de hasta 8192 tokens, suficiente para dialogos extensos o documentos de tamano medio.
- Al estar abliteado, responde a peticiones que otros modelos rechazarian por politicas de seguridad, como preguntas sobre temas controvertidos o solicitudes de contenido explicito.
- Compatible con el ecosistema llama.cpp, incluyendo el servidor OpenAI-compatible para despliegue como API.

## Casos de uso

- Atencion al cliente automatizada: el modelo puede gestionar conversaciones multi-turno con contexto largo gracias a su ventana de 8192 tokens. Su naturaleza abliteada permite abordar quejas o preguntas incomodas sin evasivas, aunque requiere supervision humana para evitar respuestas inapropiadas.
- Generacion de codigo en produccion: soporta tool calling y puede integrarse en pipelines de CI/CD para autocompletar o generar fragmentos de codigo. La cuantizacion Q4_K_M permite ejecutarlo en una GPU de 24 GB, adecuada para entornos de desarrollo.
- Desarrollo de agentes conversacionales: su compatibilidad con el servidor OpenAI-compatible de llama.cpp facilita su uso como backend para frameworks de agentes como LangChain o AutoGen, donde se requiere una API estandar.
- Investigacion sobre alineacion y seguridad: el proceso de abliteration lo convierte en un objeto de estudio interesante para investigadores que analizan el comportamiento de modelos sin mecanismos de rechazo, y para desarrollar tecnicas de deteccion de contenido peligroso.
- Creacion de contenido creativo sin restricciones: escritores y creadores pueden usarlo para generar narrativas, dialogos o guiones que aborden temas tabu o controvertidos sin que el modelo se niegue a colaborar.
- Despliegue en entornos con recursos limitados: la version IQ2_M, de aproximadamente 10 GB, permite ejecutar el modelo en GPUs de gama media o incluso en CPU con suficiente RAM, habilitando aplicaciones de generacion de texto en equipos modestos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona datos de evaluacion como MMLU, HumanEval o GSM8K para esta version cuantizada ni para el modelo base. Se recomienda consultar el repositorio del modelo safetensors original para posibles actualizaciones, aunque en el momento de redactar esta ficha no se dispone de dicha informacion.

## Requisitos de hardware

- VRAM estimada para inferencia: la version Q4_K_M ocupa aproximadamente 17 GB, por lo que cabe en una GPU de 24 GB (RTX 3090, RTX 4090, A5000). La version Q8_0 requiere unos 28 GB, necesitando una GPU de 32 GB o mas (A100 40 GB, H100).
- GPU recomendadas: para la version Q4_K_M, una RTX 4090 o A5000 es suficiente. Para Q8_0, se recomienda una A100 o H100. La version IQ2_M (10 GB) puede ejecutarse en una RTX 3060 de 12 GB o similar.
- En CPU: las versiones Q4_K_M e inferiores pueden ejecutarse en CPU con al menos 32 GB de RAM, aunque la velocidad sera significativamente menor.
- Opciones de despliegue: llama.cpp (llama-server), Ollama, LM Studio, o cualquier herramienta compatible con GGUF. El autor recomienda usar una version reciente de llama.cpp que soporte la arquitectura qwen35.
- Latencia y throughput: no se han publicado datos especificos. Como referencia, un modelo de 27 B en Q4_K_M en una RTX 4090 suele generar entre 20 y 40 tokens por segundo, dependiendo de la longitud de la secuencia y el numero de hilos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Cuantizacion GGUF | Abliterado |
|---|---|---|---|---|---|
| Qwen3.8-27B-Uncensored-xCloud | 27,3 B | 8192 | Apache-2.0 | Si | Si |
| Qwen2.5-32B-Instruct | 32,8 B | 131072 | Apache-2.0 | Si | No |
| Llama-3.1-8B-Instruct | 8 B | 131072 | Llama 3.1 Community | Si | No |
| Mistral-7B-Instruct-v0.3 | 7,3 B | 32768 | Apache-2.0 | Si | No |

La comparativa muestra que este modelo se situa en un punto intermedio entre los modelos de 7-8 B y los de 30 B. Su principal diferenciador es el proceso de abliteration, que no esta presente en las alternativas comerciales o de codigo abierto mas comunes. En terminos de contexto, es inferior a Qwen2.5-32B (131072 tokens) y a Llama-3.1-8B, lo que limita su uso en tareas que requieran documentos muy extensos. La licencia Apache-2.0 es permisiva y permite uso comercial sin restricciones adicionales.

## Limitaciones y advertencias

- El proceso de abliteration elimina una capa de seguridad. El modelo puede generar contenido ofensivo, ilegal o peligroso si se le solicita. El autor advierte explicitamente que el usuario es responsable del uso de estos pesos.
- La ventana de contexto de 8192 tokens es limitada en comparacion con otros modelos actuales, lo que puede ser insuficiente para tareas que requieran procesar documentos largos o mantener conversaciones muy extensas.
- Los idiomas soportados se limitan a chino e ingles. No se garantiza un rendimiento adecuado en otros idiomas, incluido el espanol.
- No se dispone de informacion sobre el proceso de entrenamiento del modelo base, lo que impide evaluar posibles sesgos en los datos de entrenamiento.
- La cuantizacion, especialmente en versiones de 2 bits (IQ2_M), puede degradar significativamente la calidad de las respuestas y aumentar la tasa de alucinaciones.
- El modelo no ha sido evaluado con benchmarks publicos, por lo que su rendimiento real en tareas estandarizadas es desconocido.
- Para produccion, se recomienda implementar filtros adicionales de contenido y supervisar las salidas, dado el riesgo de respuestas inapropiadas.

## Enlaces

- Repositorio GGUF: https://huggingface.co/xCloudinfo/Qwen3.8-27B-Uncensored-GGUF
- Modelo base safetensors: https://huggingface.co/xCloudinfo/Qwen3.8-27B-Uncensored-xCloud
- Documentacion de llama.cpp: https://github.com/ggerganov/llama.cpp
