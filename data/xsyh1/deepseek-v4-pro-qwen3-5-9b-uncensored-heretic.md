# xsyh1/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "abliterada" del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, un ajuste fino de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo "Max Effect". El modelo original concentra su entrenamiento supervisado en matematicas y STEM (unas 250.000 muestras), y esta version elimina las capas de rechazo mediante la tecnica Heretic v2.0.0.dev0, que aplica una ablacion de rango arbitrario (ARA) sobre las capas 9 a 24.

El autor de esta variante es el usuario xsyh1 (con material relacionado publicado bajo el alias xtools-at). El modelo tiene 9.409.813.744 parametros en formato safetensors, se distribuye con licencia Apache 2.0 y declara soporte para ingles, chino, coreano, japones, espanol y ruso. La etiqueta de pipeline es text-generation, aunque los tags incluyen image-text-to-text, lo que sugiere capacidades multimodales heredadas de la familia Qwen3.5.

Su relevancia actual es doble: por un lado, ofrece un modelo de razonamiento compacto (clase 9B) con foco en matematicas y STEM y capacidades de tool calling; por otro, documenta de forma cuantitativa el efecto de la ablacion, pasando de 100/100 rechazos en el modelo original a 3/100 en esta variante, con una divergencia KL de 0,0422 respecto al original. Es un caso de estudio util tanto para quien busca un modelo pequeno de razonamiento como para quien investiga tecnicas de decensura.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), ajuste fino con destilacion; soporte declarado de MTP (multi-token prediction) |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion proporcionada (se menciona evaluacion en NVFP4) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo base es un ajuste fino de Qwen3.5-9B entrenado mediante destilacion de las respuestas de DeepSeek-V4-Pro en modo "Max Effect". El conjunto de entrenamiento supervisado (SFT) se centra en matematicas y razonamiento cientifico, con aproximadamente 250.000 muestras. Los tags del repositorio indican el uso de SFT, RL (con GSPO), destilacion y MTP (multi-token prediction) como tecnicas asociadas al pipeline de entrenamiento. No se especifica el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

La innovacion principal de esta variante concreta es la aplicacion de Heretic v2.0.0.dev0, que realiza una ablacion de rango arbitrario (ARA) sobre las capas 9 a 24 del modelo. Los parametros documentados son: start_layer_index 9, end_layer_index 24, preserve_good_behavior_weight 0,8264, steer_bad_behavior_weight 0,0003, overcorrect_relative_weight 0,9645 y neighbor_count 12. El resultado medido es una reduccion de rechazos de 100/100 a 3/100 con una divergencia KL de 0,0422 frente al modelo original, lo que indica que la distribucion de salida se mantiene relativamente proxima al original pese a la eliminacion de las respuestas de rechazo.

## Capacidades

- Generacion de texto y razonamiento estructurado con descomposicion de problemas en multiples pasos.
- Razonamiento matematico y resolucion de problemas STEM, foco principal del entrenamiento supervisado.
- Tool calling y function calling (etiquetas tool-use y function-calling en el repositorio).
- Capacidades multimodales declaradas mediante la etiqueta image-text-to-text, presumiblemente heredadas de la familia Qwen3.5.
- Soporte multilingue en ingles, chino, coreano, japones, espanol y ruso.
- Modo de razonamiento (tag reasoning) y posible modo "thinking" asociado a la destilacion de DeepSeek-V4-Pro.
- Ausencia practica de rechazos ante peticiones que el modelo original declinaria (3/100 frentes a 100/100).
- Mejoras menores reportadas en programacion y uso de herramientas pese a no recibir SFT especifico de codigo.

## Casos de uso

- Tutoria de matematicas y STEM: el modelo puede descomponer problemas de fisica, calculo o algebra en pasos intermedios verificables, aprovechando el entrenamiento sobre unas 250.000 muestras centradas en estas areas.
- Generacion de codigo asistida en pipelines de CI/CD: gracias al soporte de tool calling y a las mejoras de transferencia cruzada en programacion, puede integrarse como agente que invoca funciones de build, test o despliegue.
- Agentes multi-paso con llamadas a funciones: la etiqueta function-calling y el modo de razonamiento permiten construir flujos de automatizacion que encadenan herramientas externas con verificacion intermedia.
- Investigacion sobre alineacion y decensura: el modelo sirve como caso de estudio reproducible de ablacion ARA, con parametros y metricas (rechazos, KL) publicados para comparar tecnicas.
- Asistencia en documentacion tecnica multilingue: con soporte para seis idiomas puede redactar y traducir documentacion tecnica entre ingles, chino, espanol, ruso, japones y coreano.
- Entornos de investigacion sin restricciones de contenido: util para estudiar comportamiento de modelos sin capas de rechazo en dominios como analisis de seguridad ofensiva o generacion de contenido sensible controlado.
- Despliegue en hardware de consumo: con 9B parametros y pesos safetensors, es viable en GPUs de gama alta para prototipos y experimentacion local.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 18-19 GB solo para pesos, mas overhead de activaciones y cache KV; el repositorio ocupa 19,3 GB.
- VRAM estimada en cuantizacion de 8 bits: en torno a 10-11 GB; en 4 bits, en torno a 5-6 GB (estimaciones a partir del numero de parametros, no confirmadas por el autor).
- GPU recomendadas: A100 40/80 GB o H100 para FP16 sin cuantizar; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 para cuantizaciones de 8 o 4 bits.
- Cabe en GPU de consumo: si, en tarjetas con 16-24 GB usando cuantizacion; en 4 bits podria caber en GPUs de 8-12 GB con contexto reducido.
- Opciones de despliegue: transformers (libreria declarada), text-generation-inference (tag), y previsiblemente vLLM, llama.cpp y Ollama si se generan pesos GGUF, aunque el autor no los publica en el repositorio.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Foco | Licencia | Notas |
|---|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,41B | no disponible | Razonamiento, matematicas, STEM | Apache 2.0 | Variante abliterada con 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B | 9,41B | no disponible | Razonamiento, matematicas, STEM | Apache 2.0 | Modelo original, 100/100 rechazos |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | Razonamiento, matematicas, STEM | Apache 2.0 | Version reducida del mismo linaje |
| xtools-at/Qwen3.5-9B-DeepThought-STEM | ~9B | no disponible | STEM | no disponible | Ajuste fino cientifico derivado del mismo modelo |

## Limitaciones y advertencias

- La ablacion elimina las capas de rechazo, pero no garantiza la ausencia de contenido danino, sesgado o ilegal; el modelo puede generar respuestas inapropiadas sin filtro.
- La divergencia KL de 0,0422 indica un cambio medible en la distribucion de salida; pueden aparecer degradaciones sutiles en calidad o coherencia respecto al original en tareas no relacionadas con el rechazo.
- Riesgo de alucinacion inherente a los modelos de 9B, especialmente en matematicas fuera de la distribucion de entrenamiento y en tareas de conocimiento factual.
- La longitud de contexto no se documenta; no debe asumirse una ventana concreta sin verificacion.
- El foco en matematicas y STEM puede implicar menor calidad en tareas creativas, legales o de dominio general.
- Licencia Apache 2.0 permite uso comercial, pero el uso de un modelo decensurado en produccion conlleva responsabilidad legal y reputacional que debe evaluarse por caso.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validacion de la comunidad ni informes independientes de calidad.
- La fecha de creacion (2026-11-21) y la nomenclatura "DeepSeek-V4-Pro" deben tratarse con cautela; no hay verificacion externa de la procedencia del modelo destilado.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/xsyh1/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Ajuste fino STEM: https://huggingface.co/xtools-at/Qwen3.5-9B-DeepThought-STEM
- Proyecto Heretic: https://heretic-project.org
