# tinyopsec/switchboard-router-4b-GGUF

## Resumen

switchboard-router-4b-GGUF es la versión cuantizada en formato GGUF de `switchboardllm/switchboard-router-4b`, un modelo de 4.022 millones de parámetros derivado de Qwen3-4B-Instruct-2507 y especializado en el enrutamiento de peticiones entre distintos modelos de lenguaje (LLM routing). Su función no es generar texto de usuario final, sino decidir a qué modelo (barato o caro) conviene derivar cada consulta para optimizar costes manteniendo la calidad de la respuesta. El autor de esta conversión es el usuario tinyopsec, mientras que el modelo base procede de la organización switchboardllm.

La relevancia del modelo radica en que el enrutamiento inteligente permite reducir el gasto en inferencia sin degradar la calidad percibida: las consultas simples se envían a modelos pequeños y las complejas a modelos de mayor capacidad. Al estar publicado en GGUF, el modelo puede ejecutarse en CPU o GPU de consumo mediante llama.cpp, Ollama, LM Studio o koboldcpp, lo que abarata aún más el propio componente de enrutamiento.

El repositorio incluye trece cuantizaciones que abarcan desde F16 (~8 GB) hasta Q2_K, con Q4_K_M marcada como recomendada por el autor. La licencia es Apache 2.0, lo que facilita su integración en productos comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivado de Qwen3-4B-Instruct-2507) |
| Parametros totales | 4.022.468.096 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q5_0, Q4_K_M, Q4_K_S, Q4_0, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo base es un derivado de Qwen3-4B-Instruct-2507, un transformer denso de aproximadamente 4.000 millones de parámetros. La model card no detalla el proceso de ajuste fino aplicado por switchboardllm para convertirlo en un router, ni el volumen o composición del dataset de entrenamiento, ni si se emplearon técnicas de RLHF o DPO. Tampoco se especifica la longitud de contexto efectiva del modelo resultante.

La innovación principal no reside en la arquitectura, sino en la tarea: el modelo actúa como un clasificador de dificultad que asigna cada consulta a un modelo destino. La conversión a GGUF se realizó con llama.cpp, lo que permite ejecutar el router en hardware modesto y a bajo coste, coherente con el objetivo de optimización de costes del proyecto.

## Capacidades

- Enrutamiento de consultas entre modelos de distinta capacidad (LLM routing).
- Clasificación de dificultad de la consulta para decidir el modelo destino.
- Generación de texto conversacional heredada del modelo base Qwen3-4B-Instruct.
- Optimización de costes en pipelines de inferencia multi-modelo.
- Ejecución local o en CPU mediante runtimes compatibles con GGUF.
- Soporte de tool calling y capacidades de agente: no disponible en la información proporcionada.
- Capacidades multilingües específicas: no disponible.
- Capacidades de visión o audio: no disponibles.

## Casos de uso

- Enrutamiento de costes en producción: el modelo recibe cada consulta y decide si se envía a un modelo pequeño y barato o a uno grande y caro, reduciendo el gasto medio por petición en aplicaciones con alto volumen de tráfico.
- Gateway de API multi-proveedor: integrado en un proxy que expone una única API y despacha internamente a distintos backends según la clasificación del router, con el GGUF ejecutándose en la misma máquina que el gateway.
- Atención al cliente automatizada: las consultas frecuentes y simples se derivan a modelos ligeros, mientras que las incidencias complejas se escalan a modelos mayores, manteniendo la calidad sin disparar el coste.
- Preprocesado de lotes en pipelines de datos: clasificar grandes volúmenes de consultas antes de su procesamiento para asignar recursos de forma proporcional a la dificultad de cada una.
- Despliegue en el edge o en entornos sin GPU: gracias a las cuantizaciones Q4_K_M y Q2_K, el router puede ejecutarse en CPU o en GPU de consumo, lo que permite desplegarlo junto al servicio sin infraestructura dedicada.
- Experimentación en investigación sobre enrutamiento: el modelo sirve como baseline reproducible para comparar estrategias de routing y analizar la relación entre coste y calidad.
- Reducción de latencia en aplicaciones interactivas: derivar consultas triviales a modelos pequeños reduce el tiempo de respuesta percibido en la mayoría de peticiones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: F16 ~8 GB; Q8_0 ~4,3 GB; Q6_K ~3,3 GB; Q5_K_M ~2,9 GB; Q4_K_M ~2,5 GB; Q3_K_M ~2 GB; Q2_K ~1,6 GB (estimaciones a partir del tamaño de los ficheros GGUF típicos para 4.000 millones de parámetros; no confirmadas por el autor).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM para cuantizaciones de 4-8 bits; A100, H100 o RTX 4090 no son necesarias para este tamaño.
- Cabe en GPU de consumo: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4070 o superiores, e incluso en CPU para las cuantizaciones más agresivas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y cualquier runtime compatible con GGUF. vLLM y TGI no soportan GGUF de forma nativa para este flujo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Enfoque |
|---|---|---|---|---|---|
| switchboard-router-4b-GGUF | 4.022 M | no disponible | GGUF | Apache 2.0 | Router de costes |
| switchboardllm/switchboard-router-4b | 4.022 M | no disponible | safetensors | Apache 2.0 | Router de costes (original) |
| Qwen/Qwen3-4B-Instruct-2507 | ~4.000 M | no disponible | safetensors/GGUF | Apache 2.0 | Modelo generalista |

No se dispone de datos de rendimiento comparado entre estas alternativas en la información proporcionada. La diferencia principal frente al modelo base es la especialización en enrutamiento y el formato GGUF, que facilita el despliegue local.

## Limitaciones y advertencias

- Es un modelo de enrutamiento, no un asistente general: su salida debe interpretarse como una decisión de routing, no como respuesta final al usuario.
- El autor advierte explícitamente de que debe evaluarse antes de usarlo en producción para enrutamiento.
- No se documentan sesgos conocidos, pero al derivar de Qwen3-4B hereda los sesgos del modelo base.
- Riesgo de alucinación en la clasificación: una decisión errónea puede enviar consultas complejas a modelos baratos y degradar la calidad.
- No se especifican los idiomas soportados ni la longitud de contexto, lo que limita la planificación de despliegues multilingües o de contexto largo.
- Las cuantizaciones agresivas (Q2_K, Q3_K_S) pueden degradar la precisión del enrutamiento; se recomienda Q4_K_M o superior.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3-4B-Instruct-2507.
- El repositorio ocupa 39,3 GB por incluir todas las cuantizaciones; descargar solo el fichero necesario.

## Enlaces

- [Hugging Face: tinyopsec/switchboard-router-4b-GGUF](https://huggingface.co/tinyopsec/switchboard-router-4b-GGUF)
- [Modelo base: switchboardllm/switchboard-router-4b](https://huggingface.co/switchboardllm/switchboard-router-4b)
- [Modelo origen: Qwen/Qwen3-4B-Instruct-2507](https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
