# usermma/Quark-270m-Instruct-i1-GGUF

## Resumen

El modelo `usermma/Quark-270m-Instruct-i1-GGUF` es una conversión a formato GGUF del modelo `ThingAI/Quark-270m-Instruct`, un modelo de lenguaje pequeño (con 251.749.888 parámetros reales, pese a la denominación "270m") desarrollado por `ThingAI` y publicado en HuggingFace por `usermma`. Está diseñado para generación de texto en italiano e inglés, con fine-tuning supervisado (SFT) para seguir instrucciones y mantener conversaciones. Su licencia es Apache 2.0, lo que permite uso comercial y modificación.

Se trata de un modelo causal (`causal-lm`) compatible con Transformers, aunque no se detalla su arquitectura concreta. No se dispone de información sobre la longitud de contexto máxima, los datos de entrenamiento ni los benchmarks. Su principal valor es el formato GGUF, que permite ejecutarlo en CPU o GPU de bajo consumo mediante `llama.cpp`, sin necesidad de hardware especializado. Esto lo hace relevante para aplicaciones en entornos con recursos limitados o donde se requiera inferencia local.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (metadatos: causal-lm, transformers) |
| Parametros totales | 251.749.888 (≈252 millones) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (los ejemplos de la model card usan 2048 tokens como configuración de llama.cpp, pero no se confirma el máximo del modelo) |
| Tipos de cuantizacion | Al menos Q6_K con importance matrix (quark-270m-instruct-q6_k-imat.gguf); el resto de cuantizaciones no está especificado en la información disponible |
| Idiomas soportados | Italiano, inglés |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (el modelo original en safetensors está en el repositorio base) |

## Arquitectura y entrenamiento

El modelo se presenta como un modelo de lenguaje causal (`causal-lm`) y utiliza la biblioteca Transformers. Sin embargo, no se ha publicado información sobre la arquitectura interna (número de capas, dimensiones de los embeddings, tipo de atención, etc.). Los metadatos indican que fue entrenado desde cero (`trained-from-scratch`) y posteriormente ajustado con fine-tuning supervisado (SFT) para tareas de instrucción y chat.

No se dispone de datos sobre la composición del dataset de entrenamiento, el número de tokens procesados ni la aplicación de técnicas como RLHF o DPO. Tampoco se confirma si el modelo base es `ThingAI/Quark-270m-Instruct` (según la model card del autor) o `ThingAI/ARK-270m-Instruct` (según los metadatos de HuggingFace). Esta discrepancia debería aclararse antes de usar el modelo en producción.

## Capacidades

- Generación de texto en italiano e inglés.
- Modelo instruct/chat, entrenado con SFT para seguir instrucciones y mantener diálogos.
- Formato GGUF, compatible con llama.cpp y llama-server.
- Modelo pequeño (≈252M parámetros), apropiado para inferencia en CPU o GPU de bajo consumo.
- Licencia Apache 2.0, que permite uso comercial y modificación.
- No se dispone de información sobre soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión o audio.

## Casos de uso

- Atención al cliente bilingüe: El modelo puede gestionar consultas sencillas en italiano e inglés en un chatbot local, gracias a su entrenamiento instruct y su tamaño reducido. Es adecuado para empresas que necesitan una solución económica y privada sin depender de servicios externos.
- Generación de contenido en italiano: Permite redactar textos cortos (descripciones de producto, publicaciones en redes sociales, correos) en italiano. Su naturaleza instruct facilita la definición de estilo y tono mediante prompts.
- Herramienta de corrección y paráfrasis: Puede revisar gramática, reformular frases o resumir textos breves en italiano e inglés. Su baja latencia lo hace apto para integraciones en editores o aplicaciones de escritorio.
- Prototipado rápido de chatbots: Al ejecutarse en CPU con llama.cpp, permite iterar sobre flujos de conversación sin necesidad de GPU. Es útil en fases de desarrollo y pruebas de concepto.
- Aplicaciones con requisitos de privacidad: Al ser ejecutable localmente, es adecuado para entornos donde los datos no pueden salir de la organización, como documentación interna o soporte interno.
- Educación y demostraciones: Ideal para talleres o cursos sobre IA generativa con modelos pequeños y abiertos. Su licencia Apache 2.0 y su formato GGUF facilitan la distribución.
- Clasificación de texto simple: Puede emplearse como modelo de lenguaje para etiquetar o clasificar textos cortos en italiano e inglés mediante prompts, siempre que la tarea sea sencilla y no requiera razonamiento complejo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: No hay mediciones oficiales. Con la cuantización Q6_K, un modelo de ~252M parámetros ocupa aproximadamente 200-250 MB, por lo que puede ejecutarse con menos de 1 GB de VRAM o directamente en CPU.
- GPU recomendadas: No se requiere GPU dedicada. Puede ejecutarse en CPUs modernas o en GPUs de gama baja (Nvidia GTX 1650, RTX 3050 o equivalentes).
- Sí cabe en GPUs de consumo; no se necesitan tarjetas de gama alta.
- Opciones de despliegue: llama.cpp (llama-cli y llama-server) según la model card. También puede usarse con otras herramientas que soporten GGUF, como Ollama (no verificado en la información disponible).
- Latencia y throughput: No disponible.

## Comparativa con modelos similares

En la información disponible no se han publicado benchmarks, por lo que no es posible comparar rendimiento. Modelos de tamaño similar son SmolLM-360M y TinyLlama-1.1B, ambos con licencia Apache 2.0 y disponibles en formato GGUF, pero no comparten el enfoque bilingüe italiano/inglés. No se dispone de datos para una comparativa detallada de contexto o capacidades.

| Modelo | Parametros | Licencia | Idiomas | Contexto | Benchmarks |
|---|---|---|---|---|---|
| Quark-270m-Instruct | 251.749.888 | Apache 2.0 | Italiano, inglés | No disponible | No disponible |
| SmolLM-360M | ≈360M | Apache 2.0 | Inglés | No disponible | No disponible |
| TinyLlama-1.1B | ≈1.1B | Apache 2.0 | Inglés | No disponible | No disponible |

## Limitaciones y advertencias

- Sesgos desconocidos: No se han publicado estudios de sesgos, por lo que el modelo puede reflejar los sesgos de los datos de entrenamiento, especialmente en contextos italianos e ingleses.
- Riesgo de alucinación: Al ser un modelo pequeño, la tasa de alucinación puede ser alta en tareas complejas. Debe usarse con supervisión y en tareas acotadas.
- Limitaciones de contexto e idioma: La longitud de contexto no está confirmada; solo soporta italiano e inglés.
- Restricciones de licencia: La licencia Apache 2.0 permite uso comercial, pero se debe revisar el texto de la licencia y mantener los avisos de atribución.
- Discrepancia en el modelo base: Los metadatos de HuggingFace indican `ThingAI/ARK-270m-Instruct` como base, mientras que la model card menciona `ThingAI/Quark-270m-Instruct`. Esta inconsistencia debe resolverse antes de usar el modelo en producción.
- Sin datos de calidad: No hay benchmarks publicados, por lo que no se puede evaluar su rendimiento frente a otros modelos.

## Enlaces

- Repositorio del modelo en HuggingFace: https://huggingface.co/usermma/Quark-270m-Instruct-i1-GGUF
- Modelo original según la model card: https://huggingface.co/ThingAI/Quark-270m-Instruct
- Modelo base según metadatos de HuggingFace: https://huggingface.co/ThingAI/ARK-270m-Instruct
- Repositorio de llama.cpp: https://github.com/ggerganov/llama.cpp
