# Wil2200/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic

## Resumen

DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic es una variante "decensored" (abliterated) del modelo Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B, publicado por el usuario Wil2200. Se trata de un fine-tune de Qwen3.5-9B destilado a partir de respuestas generadas por DeepSeek-V4-Pro en modo Max Effect, con el foco del entrenamiento supervisado puesto en matematicas y resolucion de problemas STEM.

El modelo original concentra aproximadamente 250.000 muestras de SFT centradas en razonamiento matematico y cientifico, e incorpora tecnicas de RL (etiquetas gspo, rl, sft) para reforzar patrones de descomposicion de problemas y soluciones multi-paso. Esta version heretic elimina los mecanismos de rechazo del modelo base mediante ablation de rangos arbitrarios (ARA), pasando de 100 rechazos sobre 100 a 3 sobre 100 segun la propia model card, con una divergencia KL de 0,0422 respecto al original.

Es relevante para desarrolladores que necesitan un modelo de 9B con capacidades de razonamiento estructurado y tool calling, sin las restricciones de rechazo del modelo base, desplegable en hardware consumer. La licencia Apache 2.0 permite uso comercial, aunque la eliminacion de salvaguardas traslada al operador toda la responsabilidad sobre el contenido generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5), segun tag `qwen3_5` |
| Parametros totales | 9.409.813.744 (9,4B, dato real de safetensors) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la informacion; se evalua despliegue en NVFP4 (vLLM) y MTP-Q8_0 (llama.cpp) |
| Idiomas soportados | en, zh, ko, ja, es, ru |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers); repo de 19,3 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de Qwen3.5-9B, un transformer de 9,4B parametros. El entrenamiento del modelo base Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B se basa en destilacion: las respuestas del profesor DeepSeek-V4-Pro (en modo Max Effect) se usan como señal supervisada sobre aproximadamente 250.000 muestras centradas en matematicas y STEM. La model card menciona etapas de SFT y RL (con etiquetas gspo y rl), orientadas a que el modelo aprenda descomposicion de problemas y patrones de solucion multi-paso.

La innovacion de esta variante concreta es el proceso de decensoring mediante Heretic v2.0.0.dev0, que aplica Arbitrary-Rank Ablation (ARA) sobre las capas 9 a 24, con pesos de preservacion de buen comportamiento de 0,8264, de direccionamiento de mal comportamiento de 0,0003, de correccion relativa de 0,9645 y 12 vecinos. El resultado declarado es una reduccion de rechazos de 100/100 a 3/100 manteniendo una divergencia KL baja (0,0422) respecto al modelo original. Tambien se evaluaron rutas de despliegue con decodificacion especulativa multi-token (MTP) y cuantizacion NVFP4.

## Capacidades

- Generacion de texto y razonamiento estructurado multi-paso, con descomposicion explicita de problemas.
- Matematicas y STEM: nucleo del entrenamiento, con cerca de 250.000 muestras dedicadas.
- Codigo: la model card indica pequenas ganancias en programacion por transferencia cruzada, aunque no hubo SFT especifico de codigo.
- Tool calling / function calling: etiquetado explicitamente en el repo (`tool-use`, `function-calling`).
- Capacidades de agente y razonamiento multi-paso derivadas del formato de razonamiento destilado.
- Multilingue: ingles, chino, coreano, japones, espanhol y ruso.
- Modo "uncensored": ausencia practica de rechazos (3/100 en la evaluacion declarada por el autor).
- Compatibilidad con endpoints (`endpoints_compatible` segun tags).

## Casos de uso

- Tutoria de matematicas y ciencias: el modelo puede resolver problemas paso a paso mostrando la descomposicion, util para plataformas educativas que necesitan explicaciones detalladas en espanhol o ingles.
- Generacion de pipelines de razonamiento para analisis de datos STEM: integrable como componente de un sistema mayor que requiera cadenas de deduccion verificables.
- Automatizacion de agentes con tool calling: al soportar function calling, puede conectarse a APIs externas (calculadoras, bases de datos, motores de busqueda) en flujos de multiples pasos.
- Atencion al cliente tecnica sin filtros de rechazo: adecuado cuando el operador necesita respuestas directas sobre temas sensibles o ambiguos que otros modelos rechazarian, siempre con politicas de uso definidas por el desplegador.
- Investigacion sobre alineacion y abliteration: util como objeto de estudio para comparar comportamiento con y sin salvaguardas, dado que la model card documenta los parametros ARA y la KL divergence.
- Despliegue en hardware consumer: con 9,4B parametros y rutas evaluadas en llama.cpp MTP-Q8_0, puede ejecutarse en estaciones de trabajo con GPU de gama alta o incluso CPU con cuantizacion agresiva.
- Generacion de contenido multilingue en seis idiomas: cobertura para en, zh, ko, ja, es, ru en tareas de redaccion y traduccion asistida.

## Benchmarks y rendimiento

| Metrica | Este modelo | Modelo original (Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B) |
|---|---|---|
| Rechazos (sobre 100) | 3/100 | 100/100 |
| Divergencia KL | 0,0422 | 0 (por definicion) |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 9,4B parametros, en FP16/BF16 se requieren aproximadamente 19 GB solo para pesos, mas overhead de KV cache; en Q8_0 alrededor de 10 GB; en NVFP4 aproximadamente 5-6 GB.
- GPU recomendadas: A100 40/80 GB, H100 para despliegue de alta concurrencia en BF16; RTX 4090 (24 GB) suficiente para BF16 con contexto moderado; RTX 3090/4080 (16-24 GB) para Q8_0 o FP8.
- Cabe en GPU consumer: si, en RTX 4090/3090 con cuantizacion Q8_0 o inferior, y potencialmente en GPUs de 12-16 GB con cuantizaciones de 4-6 bits (no verificadas en la informacion disponible).
- Opciones de despliegue: vLLM con NVFP4 (evaluado por el autor), llama.cpp con MTP-Q8_0 (evaluado), transformers (libreria declarada), TGI (tag `text-generation-inference`), y teoricamente Ollama mediante conversion GGUF.
- Latencia y throughput estimados: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic | 9,4B | no disponible | Apache 2.0 | Variante abliterated con 3/100 rechazos |
| Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B (base) | 9,4B | no disponible | Apache 2.0 | Modelo original con salvaguardas (100/100 rechazos) |
| xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic | ~4B | no disponible | no disponible | Version 4B del mismo linaje heretic |
| Qwen3.5-9B (familia base) | 9B | no disponible | no disponible | Arquitectura de partida sin destilacion de DeepSeek-V4-Pro |

La comparacion con alternativas fuera de la familia Qwen3.5 (por ejemplo Llama 3.1 8B o Mistral 7B) no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- La eliminacion de salvaguardas (abliteration) implica que el modelo puede generar contenido que el original rechazaria; el operador asume toda la responsabilidad legal y etica sobre el uso.
- Riesgo de alucinacion inherente a modelos de 9B destilados; no hay evaluaciones de factualidad publicadas.
- La KL divergence de 0,0422 indica que el proceso de decensoring altera parcialmente la distribucion del modelo original, con posibles degradaciones sutiles en calidad.
- No hay datos publicados sobre contexto maximo efectivo ni sobre rendimiento en benchmarks estandar, lo que dificulta comparaciones objetivas.
- La model card no documenta sesgos conocidos ni evaluaciones de seguridad mas alla del conteo de rechazos.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, sin validacion comunitaria.
- Uso comercial permitido por Apache 2.0, pero la ausencia de salvaguardas puede incumplir politicas de plataformas de despliegue (por ejemplo, terminos de servicio de proveedores cloud) y regulaciones sectoriales.
- Cobertura multilingue declarada en seis idiomas, pero sin evaluaciones por idioma; el espanhol figura como tag pero no se especifica su nivel de calidad.

## Enlaces

- Hugging Face: https://huggingface.co/Wil2200/DeepSeek-V4-Pro-Qwen3.5-9B-UNCENSORED-heretic
- Modelo base: https://huggingface.co/Jackrong/DeepSeek-V4-Pro-Qwen3.5-9B
- Version 4B heretic: https://huggingface.co/xtools-at/DeepSeek-V4-Pro-Qwen3.5-4B-UNCENSORED-heretic
- Heretic (proyecto de decensoring): https://heretic-project.org
