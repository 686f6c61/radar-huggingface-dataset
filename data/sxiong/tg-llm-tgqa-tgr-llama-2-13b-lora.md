# sxiong/TG-LLM-TGQA-TGR-Llama-2-13B-LoRA

## Resumen

TG-LLM es un conjunto de modelos afinados mediante aprendizaje supervisado para el razonamiento temporal en grandes modelos de lenguaje. Este repositorio concreto contiene el adaptador LoRA para la tarea de razonamiento sobre grafos temporales (TGR), entrenado sobre el modelo base `meta-llama/Llama-2-13b-chat-hf`. El objetivo principal es mejorar la capacidad de los LLM para comprender relaciones temporales en textos, convirtiendo narrativas en grafos temporales y respondiendo preguntas sobre ellos.

El enfoque de TG-LLM se divide en dos pasos: primero, la traducción de una historia a un grafo temporal (Story-to-Temporal-Graph Translation), y segundo, el razonamiento sobre ese grafo para responder preguntas (Temporal Graph Reasoning). Este adaptador se centra en la segunda tarea. El modelo se presenta como una contribución de investigación, publicada en ACL 2024, y está diseñado para desarrolladores e investigadores que trabajan en razonamiento temporal, extracción de eventos y sistemas de pregunta-respuesta sobre líneas temporales.

El adaptador tiene un tamaño de repositorio de 0.7 GB, lo que indica que contiene los pesos del LoRA (y no el modelo completo). Al ser un adaptador LoRA con r=8, el número de parámetros añadidos es relativamente pequeño, aunque el modelo base es de 13 mil millones de parámetros. La licencia es MIT, lo que facilita su uso en investigación y aplicaciones comerciales, siempre que se cumplan las condiciones de la licencia del modelo base (Llama 2).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Llama-2) con adaptador LoRA |
| Parametros totales | No disponible (modelo base: 13 mil millones; adaptador LoRA con r=8) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (se distribuye en safetensors, sin cuantizacion adicional) |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT (adaptador) + licencia Llama 2 para el modelo base |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo se construye sobre el transformer de Llama-2-13b-chat-hf, y se aplica un adaptador LoRA con r=8 y lora_alpha=8, dirigido a las proyecciones de atención (q_proj, k_proj, o_proj, v_proj) con bias desactivado. Este adaptador se entrena mediante aprendizaje supervisado (SFT) con el dataset `sxiong/TGQA`, que está dividido en dos partes correspondientes a las dos tareas del framework TG-LLM: traducción de historia a grafo temporal y razonamiento sobre el grafo temporal.

El proceso de entrenamiento se centra en que el modelo aprenda a razonar de manera deliberada sobre grafos temporales, siguiendo un enfoque de chain-of-thought sobre la estructura grafica. No se indica si se utilizaron técnicas como RLHF o DPO; la información disponible solo menciona supervisión directa con datos etiquetados. La innovacion principal del trabajo es la representacion intermedia en forma de grafo temporal, que facilita el razonamiento temporal explicito en comparacion con el texto plano.

## Capacidades

- Razonamiento temporal: el modelo puede responder preguntas que requieren entender relaciones de orden, duracion y concurrencia entre eventos representados en un grafo temporal.
- Traduccion de texto a grafo temporal: aunque este adaptador se centra en TGR, el framework completo incluye la tarea de convertir narrativas en grafos temporales estructurados.
- Razonamiento de multiples pasos: puede realizar inferencias complejas sobre el grafo, siguiendo cadenas de razonamiento (chain-of-thought) para llegar a la respuesta.
- Generacion de texto en ingles: al estar basado en Llama-2-chat, mantiene la capacidad de generar texto coherente en ingles.
- Sin soporte para tool calling, agentes, vision o audio: no se mencionan estas capacidades en la documentacion.

## Casos de uso

- **Analisis de narrativas historicas**: el modelo puede extraer la secuencia temporal de eventos de un texto historico y responder preguntas como "¿Que ocurrio antes de la batalla de Waterloo?" convirtiendo el texto en un grafo temporal y razonando sobre el.
- **Sistemas de pregunta-respuesta sobre lineas de tiempo**: en aplicaciones de noticias o documentos legales, el modelo puede estructurar los eventos y responder consultas sobre fechas y ordenes, por ejemplo "¿Cual fue el tercer evento reportado en esta noticia?".
- **Extraccion de eventos y relaciones temporales**: el adaptador puede usarse para generar representaciones graficas de eventos a partir de textos, lo que sirve como preprocesamiento para otros sistemas de analisis.
- **Verificacion de consistencia temporal**: en documentos que describen procesos, el modelo puede detectar si las relaciones temporales son coherentes, ayudando a detectar errores de secuencia.
- **Investigacion academica en razonamiento temporal**: el modelo es util como punto de partida para experimentos sobre como los LLM comprenden el tiempo, permitiendo reproducir los resultados del articulo ACL 2024.
- **Generacion de explicaciones en lenguaje natural**: al razonar sobre el grafo temporal, el modelo puede producir respuestas explicando el razonamiento, lo que es util para sistemas de explicabilidad en IA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper asociado (arXiv 2401.06853) reporta evaluaciones en el dataset TGQA, pero no se incluyen en esta ficha por no estar disponibles en los datos proporcionados.

## Requisitos de hardware

- **VRAM estimada**: para el modelo completo de 13B con el adaptador LoRA, en precision fp16 se requieren alrededor de 26 GB de VRAM. Con cuantizacion de 4 bits (por ejemplo, usando bitsandbytes), se puede reducir a unos 8-10 GB.
- **GPU recomendadas**: para inferencia sin cuantizacion, se recomienda una GPU con al menos 24 GB (RTX 3090, RTX 4090, A100, H100). Para cuantizacion 4-bit, una RTX 3060 (12 GB) o RTX 4070 (12 GB) puede ser suficiente.
- **Cabe en consumer GPU**: si, con cuantizacion 4-bit puede caber en GPUs de gama media-alta (12-16 GB). Sin cuantizar, se requiere una GPU de 24 GB o mas.
- **Opciones de despliegue**: es compatible con el ecosistema de Hugging Face, incluyendo `transformers` con PEFT para cargar el adaptador, `vLLM` (si se integra correctamente), `llama.cpp` (convertiendo el modelo a GGUF), y `Ollama` (si se empaqueta adecuadamente). Para uso en produccion, se recomienda `vLLM` para alto throughput.
- **Latencia y throughput**: no se conocen datos especificos. Dependiendo de la GPU y la cuantizacion, un modelo de 13B puede generar entre 10 y 50 tokens por segundo en una RTX 4090 con cuantizacion 4-bit, y menos en fp16.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos similares especificos para razonamiento temporal con LoRA. Como referencia, se puede comparar con el modelo base sin adaptar (Llama-2-13b-chat) que no tiene la capacidad de razonar sobre grafos temporales. Otras alternativas como GPT-4 o Claude pueden tener mejores capacidades generales, pero no se centran en esta tarea. La comparativa con estos no es directa por la naturaleza especializada del adaptador.

## Limitaciones y advertencias

- **Idioma**: solo soporta ingles. No se ha entrenado para otros idiomas.
- **Alucinacion**: al ser un modelo de lenguaje, puede generar respuestas plausibles pero incorrectas sobre las relaciones temporales, especialmente si el grafo temporal no esta bien construido o el texto es ambiguo.
- **Dependencia del grafo**: el rendimiento del modelo depende de la calidad del grafo temporal generado. Si la traduccion de texto a grafo falla, el razonamiento posterior se vera afectado.
- **Licencia**: aunque el adaptador tiene licencia MIT, el modelo base (Llama-2-13b-chat) esta bajo la licencia de Meta (Llama 2 Community License), que permite uso comercial con ciertas condiciones (por ejemplo, si tienes mas de 700 millones de usuarios mensuales, necesitas un permiso especial). Es necesario cumplir ambas licencias.
- **Sesgos**: no se ha documentado ningun estudio de sesgos para este adaptador. El modelo base Llama-2 puede tener sesgos conocidos, y el ajuste con datos de TGQA puede amplificar sesgos en la tarea temporal.
- **Contexto**: no se especifica la longitud de contexto; se hereda del modelo base (Llama-2 tiene 4096 tokens). Para textos muy largos, el modelo podria perder informacion.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/sxiong/TG-LLM-TGQA-TGR-Llama-2-13B-LoRA)
- [Repositorio GitHub TG-LLM](https://github.com/xiongsiheng/TG-LLM)
- [Paper en arXiv (2401.06853)](https://arxiv.org/html/2401.06853v2)
- [Dataset TGQA](https://huggingface.co/datasets/sxiong/TGQA)
