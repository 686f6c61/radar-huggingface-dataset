# voves/Mellum2-12B-A2.5B-Instruct-FP8

## Resumen

Mellum2-12B-A2.5B-Instruct-FP8 es una versión cuantizada en FP8 del modelo Mellum2-12B-A2.5B-Instruct, desarrollado por JetBrains y publicado en HuggingFace por el usuario voves como parte de una colección de versiones comprimidas. Se trata de un modelo de lenguaje de tipo Mixture-of-Experts (MoE) con 12 000 millones de parámetros totales y 2 500 millones activos por token, especializado en generación de código y conversación técnica. La cuantización FP8 reduce el peso del modelo a aproximadamente 12,6 GB, lo que permite su despliegue en una única GPU, manteniendo un rendimiento cercano al del modelo original.

El modelo base, Mellum2-12B-A2.5B-Instruct, está diseñado para ofrecer respuestas directas y de baja latencia sin externalizar cadenas de razonamiento explícitas, a diferencia de otras variantes que emiten bloques de pensamiento. Soporta una ventana de contexto de 131 072 tokens mediante una combinación de atención deslizante (sliding window de 1024) y atención completa, lo que lo hace adecuado para tareas que requieren manejo de código extenso o conversaciones multi-turno largas. La licencia Apache 2.0 permite uso comercial sin restricciones significativas.

Esta versión FP8 es relevante porque facilita la ejecución en entornos con recursos limitados, como estaciones de trabajo con GPUs de gama media, sin necesidad de infraestructura de servidores dedicada. Al ser un modelo de código con soporte para tool calling, puede integrarse en flujos de desarrollo asistido por IA, asistentes de programación y pipelines de automatización.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con 64 expertos, 8 activos por token, 28 capas, hidden size 2304, atención deslizante (1024) + atención completa |
| Parametros totales | 12 149 923 072 (12B) |
| Parametros activos | 2 500 000 000 (2,5B) |
| Longitud de contexto | 131 072 tokens |
| Tipos de cuantizacion | FP8 (esta version), el modelo base esta en BF16 |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors) |

## Arquitectura y entrenamiento

Mellum2-12B-A2.5B-Instruct emplea una arquitectura MoE con 64 expertos, de los cuales se activan 8 por cada token procesado, lo que reduce el coste computacional por token a aproximadamente 2,5B parámetros activos. La capa de atención combina un mecanismo de ventana deslizante de 1024 tokens con atención completa sobre el contexto global, permitiendo manejar ventanas de hasta 131 072 tokens. El modelo fue entrenado por JetBrains con un enfoque en respuestas directas y de baja latencia, evitando la generación de cadenas de razonamiento explícitas. No se han publicado detalles sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas como RLHF o DPO en la informacion disponible.

La version FP8 publicada por voves utiliza el formato compressed-tensors y mantiene la misma arquitectura que el modelo base, pero con los pesos cuantizados a 8 bits de punto flotante. Esta cuantizacion reduce el tamaño del repositorio a 12,6 GB, frente a los aproximadamente 24 GB que ocuparia el modelo en BF16, y permite una inferencia mas rapida en GPUs que soporten operaciones FP8 nativas.

## Capacidades

- Generacion de codigo en multiples lenguajes de programacion, con soporte para completado, generacion de funciones y refactorizacion.
- Razonamiento y resolucion de problemas de programacion, incluyendo tareas de EvalPlus y MultiPL-E.
- Soporte de tool calling / function calling, lo que permite integrarlo en agentes que invocan APIs o herramientas externas.
- Conversacion multi-turno con contexto largo gracias a su ventana de 131 072 tokens.
- Respuestas directas sin cadena de pensamiento explicita, optimizadas para baja latencia en entornos de produccion.
- Capacidades multilingues limitadas al ingles; no se ha verificado soporte para otros idiomas.

## Casos de uso

- Asistente de programacion integrado en IDEs: el modelo puede generar fragmentos de codigo, sugerir correcciones y completar funciones en tiempo real. Su baja latencia lo hace adecuado para autocompletado interactivo en editores como IntelliJ IDEA o VS Code.
- Automatizacion de tareas de desarrollo: puede generar tests unitarios, documentacion de APIs o scripts de despliegue a partir de descripciones en lenguaje natural, reduciendo el trabajo manual en pipelines de CI/CD.
- Agente de resolucion de incidencias: con soporte de tool calling, puede analizar mensajes de error, buscar en la base de codigo y proponer parches, integrandose en sistemas de ticketing o bots de soporte tecnico.
- Generacion de codigo en entornos de produccion: su capacidad para manejar contextos largos permite procesar archivos completos o repositorios parciales, generando implementaciones coherentes con el estilo existente.
- Educacion y formacion en programacion: puede explicar conceptos, revisar soluciones y proporcionar ejemplos de codigo comentados, sirviendo como tutor automatico para estudiantes.
- Prototipado rapido: los equipos pueden generar esqueletos de aplicaciones, endpoints de API o estructuras de datos a partir de especificaciones textuales, acelerando la fase inicial de desarrollo.

## Benchmarks y rendimiento

Se han publicado los siguientes resultados para el modelo base Mellum2-12B-A2.5B-Instruct, que son aplicables a esta version cuantizada con una degradacion minima esperada:

| Benchmark | Resultado |
|---|---|
| EvalPlus | 78,4 |
| MultiPL-E | 67,1 |

No se han publicado resultados adicionales (MMLU, GSM8K, HumanEval) en la informacion disponible. Estos datos provienen de la ficha del modelo base y de la documentacion de vLLM Recipes.

## Requisitos de hardware

- VRAM estimada: aproximadamente 12-14 GB para inferencia en FP8, incluyendo overhead de activaciones y cache KV. Con cuantizacion adicional (por ejemplo, 4 bits) podria reducirse a unos 7-8 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), RTX 4080 (16 GB), A100 (40 GB) o H100 (80 GB). Al ser FP8, se recomienda hardware con soporte nativo para operaciones FP8 (Ampere o posterior).
- Cabe en GPUs de consumo medio-alto: una RTX 4070 Ti (12 GB) podria ejecutarlo con cuantizacion adicional o limitando el contexto.
- Opciones de despliegue: vLLM (con soporte para compressed-tensors), llama.cpp, Ollama, TGI (Text Generation Inference). La documentacion de vLLM Recipes proporciona una configuracion de ejemplo con `vllm serve`.
- Latencia y throughput: no se han publicado mediciones oficiales, pero al tener solo 2,5B parametros activos por token, se espera una latencia inferior a la de modelos densos de tamano similar. La configuracion recomendada en vLLM sugiere `max_tokens=81920` y `temperature=0.6`.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparativos con otros modelos de la misma categoria (MoE de codigo de ~12B totales) en la informacion proporcionada. Se podria comparar con DeepSeek-Coder-V2-Lite (16B MoE, 2,4B activos) o Mixtral 8x7B, pero no hay datos publicados en las fuentes consultadas. La comparativa queda pendiente de datos adicionales.

## Limitaciones y advertencias

- Solo soporta ingles de forma verificada; el uso en otros idiomas puede producir resultados degradados o incorrectos.
- Riesgo de alucinacion en codigo: puede generar funciones o APIs inexistentes, especialmente en contextos poco comunes o con especificaciones ambiguas.
- La cuantizacion FP8 puede introducir una degradacion minima en la precision numerica, aunque en la mayoria de tareas de generacion de codigo el impacto es despreciable.
- No se ha verificado el comportamiento del modelo en tareas de seguridad o generacion de codigo malicioso; se recomienda supervisar su uso en entornos de produccion.
- La licencia Apache 2.0 permite uso comercial, pero es responsabilidad del usuario cumplir con las politicas de JetBrains respecto al modelo base.
- No se han publicado detalles sobre sesgos o limitaciones eticas especificas del modelo.

## Enlaces

- Modelo cuantizado en HuggingFace: https://huggingface.co/voves/Mellum2-12B-A2.5B-Instruct-FP8
- Modelo base en HuggingFace: https://huggingface.co/JetBrains/Mellum2-12B-A2.5B-Instruct
- Configuracion de despliegue con vLLM: https://recipes.vllm.ai/JetBrains/Mellum2-12B-A2.5B-Instruct
- Archivo YAML de configuracion: https://github.com/furyhawk/vllm-recipes/blob/main/models/JetBrains/Mellum2-12B-A2.5B-Instruct.yaml
- Ficha tecnica en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/mellum2-12b-a2.5b-instruct-jetbrains
