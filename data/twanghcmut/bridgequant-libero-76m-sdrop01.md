# twanghcmut/bridgequant-libero-76m-sdrop01

## Resumen

bridgequant-libero-76m-sdrop01 es un modelo de visión-lenguaje-acción (VLA) orientado a robótica, publicado por el usuario twanghcmut en Hugging Face. Se trata de una ablación del recipe base de 76M parámetros entrenado sobre el benchmark LIBERO, en la que se aplica un `proprio.state_dropout` de 0.1 sobre el estado propioceptivo del robot. El modelo forma parte del ecosistema BridgeQuant, cuyo código asociado se publica en el repositorio `VLAOpt/bridgequant-async`.

El modelo tiene 64.826.027 parámetros reales según los pesos en safetensors (aunque el nombre comercial lo etiqueta como "76M"), ocupa 0.3 GB en el repositorio y se distribuye en formato safetensors junto con artefactos auxiliares (`norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json` y `train_config.yaml`). Está pensado para ser cargado mediante la función `load_trainable_weights` del bundle BridgeQuant.

La relevancia de esta variante es fundamentalmente documental: el propio autor indica explícitamente que se conserva como referencia y que **no se recomienda su uso**. La ablación degrada el rendimiento respecto al recipe base (0.9405 frente a 0.9715 de media en LIBERO-500 con media de 3 ejecuciones), lo que la convierte en un punto de comparación útil para estudiar el impacto del dropout sobre el estado propioceptivo, más que en un modelo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-Language-Action (VLA); detalles internos no disponibles |
| Parametros totales | 64.826.027 |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | safetensors (con `norm_stats.json`, `bridgequant_vla.yaml`, `config.json`, `metadata.json`, `train_config.yaml`) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo más allá de su clasificación como vision-language-action (VLA) dentro del stack BridgeQuant (`bridgequant_async_vla`). Un VLA típico combina un codificador visual, un modelo de lenguaje y una cabeza de acciones que produce comandos motores; sin embargo, no se especifican el tipo de backbone, el número de capas, la dimensión oculta ni el mecanismo de atención.

En cuanto al entrenamiento, la model card indica que se trata de una ablación del recipe de 76M para LIBERO con `proprio.state_dropout: 0.1`, es decir, se aplica un dropout del 10 % sobre el estado propioceptivo durante el entrenamiento. No se proporcionan datos sobre el número de tokens, la composición del dataset, ni si hubo etapas de RLHF o DPO. El benchmark de evaluación es LIBERO-500, con resultados desglosados por suite (spatial, long, goal, object). El repositorio de código asociado es `VLAOpt/bridgequant-async`.

## Capacidades

- Control robótico guiado por visión y lenguaje: el modelo recibe observaciones visuales e instrucciones en lenguaje natural y produce acciones motoras, propio de la familia VLA.
- Integración con estado propioceptivo: el recipe incorpora `proprio.state_dropout`, lo que implica que el modelo consume estado proprioceptivo del robot además de visión y lenguaje.
- Evaluación en tareas de manipulación: validado sobre las suites de LIBERO (spatial, long, goal, object).
- Carga mediante bundle BridgeQuant: compatible con `load_trainable_weights` y los artefactos de configuración incluidos.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, visión general, audio: no disponible (la visión está integrada en el pipeline VLA, pero no se documentan capacidades de visión general).

## Casos de uso

- Investigación en ablaciones de VLA: sirve como punto de control para estudiar el efecto del dropout sobre el estado propioceptivo comparando con el recipe base (0.9405 frente a 0.9715 en LIBERO-500). Es su uso principal declarado.
- Reproducción de experimentos: al incluir `train_config.yaml` y `metadata.json`, permite reproducir la configuración exacta del experimento en el stack BridgeQuant.
- Baseline de comparación en manipulación robótica: útil para medir la degradación introducida por el dropout en cada suite de LIBERO (spatial 0.894, long 0.911, goal 0.971, object 0.986).
- Validación de pipelines de carga: sirve para verificar que `load_trainable_weights` y el bundle BridgeQuant cargan correctamente pesos y estadísticas de normalización (`norm_stats.json`).
- Docencia y formación: ejemplo compacto (0.3 GB) de un VLA para ilustrar el flujo completo de entrenamiento, evaluación y despliegue en robótica.
- Pruebas de integración en simulación: al ser un modelo pequeño, puede ejecutarse en entornos de simulación LIBERO para validar infraestructura antes de pasar a modelos mayores.
- No recomendado para despliegue en producción: el propio autor lo desaconseja explícitamente.

## Benchmarks y rendimiento

Resultados en LIBERO-500 (media de 3 ejecuciones), según la model card:

| Suite | Este modelo (sdrop01) | Recipe base |
|---|---|---|
| Spatial | 0.894 | no disponible |
| Long | 0.911 | no disponible |
| Goal | 0.971 | no disponible |
| Object | 0.986 | no disponible |
| Media | 0.9405 | 0.9715 |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible, lo cual es esperable dado que se trata de un modelo de robótica y no de lenguaje general.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 64,8M parámetros en fp32 los pesos ocupan aproximadamente 0,26 GB, por lo que la inferencia cabría en cualquier GPU consumer con holgura, aunque el consumo real depende del codificador visual y del resto del pipeline VLA.
- GPU recomendadas: no disponible; por tamaño, cualquier GPU con al menos 4-8 GB de VRAM debería ser suficiente para los pesos, pero no se documentan requisitos del pipeline completo.
- Cabe en GPU consumer: sí, previsiblemente en cualquier GPU moderna (RTX 3060 o superior), aunque no está confirmado por el autor.
- Opciones de despliegue: carga mediante el bundle BridgeQuant (`load_trainable_weights`); no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que además no son adecuados para un VLA.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento LIBERO-500 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bridgequant-libero-76m-sdrop01 | 64,8M | no disponible | 0,9405 (media de 3) | other | Hugging Face |
| Recipe base bridgequant-libero-76m | ~76M (nominal) | no disponible | 0,9715 (media de 3) | other | Referenciado en la model card |
| Otros VLA de robótica (p. ej. OpenVLA, RT-2) | no disponible en la informacion | no disponible | no disponible | no disponible | no disponible |

La única comparación documentada es con el recipe base del mismo stack, que supera a esta ablación en 0,031 puntos de media. No se dispone de datos de otros modelos VLA comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo no recomendado por el propio autor: la model card indica explícitamente "Kept for reference; not recommended".
- Rendimiento degradado: la media en LIBERO-500 cae de 0,9715 a 0,9405 respecto al recipe base, con especial impacto en spatial (0,894) y long (0,911).
- Sesgos conocidos: no disponibles; no se documenta ningún análisis de sesgos.
- Riesgo de alucinación: no aplica en el sentido habitual de generación de texto; en robótica el riesgo se traduce en acciones incorrectas, pero no se cuantifica.
- Limitaciones de contexto e idioma: no disponibles.
- Restricciones de licencia: licencia "other", sin términos concretos publicados; es imprescindible revisar las condiciones antes de cualquier uso comercial.
- Caveat para producción: al ser una ablación de investigación y estar desaconsejada por el autor, no debería desplegarse en sistemas reales sin una validación exhaustiva.
- Dependencia del stack BridgeQuant: requiere los artefactos de configuración y la función `load_trainable_weights` del repositorio asociado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/bridgequant-libero-76m-sdrop01
- Código (repositorio BridgeQuant async): https://github.com/VLAOpt/bridgequant-async
