# syvai/qwen3.8-27b-3090-fast-variant

## Resumen

Este repositorio no contiene un modelo completo, sino archivos complementarios para optimizar la inferencia de un modelo base Qwen3.8-27B cuantizado a W4A16 (int4) mediante AutoRound, diseñado específicamente para ejecutarse en una única GPU RTX 3090 (24 GB VRAM) con vLLM. El autor, syvai, proporciona un lm_head requantizado a int4 con calibración GPTQ, un módulo MTP (Multi-Token Prediction) para decodificación especulativa, y un vocabulario de borrador reducido que cubre el 97,5% de las salidas típicas del modelo. El objetivo es alcanzar una velocidad de generación de aproximadamente 114 tokens por segundo en muestreo por defecto y 124 tokens por segundo en modo greedy, algo notable para un modelo de 27B en una GPU de gama media.

El modelo base es Qwen/Qwen3.8-27B, aunque no se proporcionan detalles adicionales sobre su arquitectura original. Los archivos incluidos requieren parches específicos de vLLM (disponibles en el repositorio de GitHub asociado) y están pensados para un escenario de uso monousuario. La licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales. Este proyecto es relevante porque demuestra una vía práctica para ejecutar modelos grandes en hardware de consumo con rendimiento de producción, mediante cuantización agresiva y decodificación especulativa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3.8-27B (base, no se especifican detalles de la arquitectura original) |
| Parametros totales | 27B (según el nombre del modelo base, no verificado) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | W4A16 (int4) para pesos principales, GPTQ int4 (grupo 128) para lm_head y módulo MTP |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (shards del modelo base + archivos adicionales) |

## Arquitectura y entrenamiento

La información disponible se centra en la optimización para inferencia, no en el entrenamiento original del modelo base. El repositorio incluye archivos que modifican la capa de salida (lm_head) y añaden un módulo MTP (Multi-Token Prediction) como borrador para decodificación especulativa. El lm_head se requantiza a int4 con GPTQ, calibrado sobre 300k de hidden states del propio modelo, lo que según el autor produce un aumento de perplejidad de solo +0,6% frente a bf16 y no altera los resultados en GSM8K. El módulo MTP también se cuantiza a int4 y se complementa con una cabeza de borrador (draft head) de 40.960 filas en int4. El vocabulario de borrador se construyó contando las salidas del modelo sobre 5,4 millones de tokens, alcanzando una cobertura del 97,5% de las generaciones típicas (96% en código). Estos componentes trabajan juntos para acelerar la generación sin requerir cambios en el modelo base.

## Capacidades

- Generación de texto autoregresiva con soporte de decodificación especulativa mediante el módulo MTP.
- Inferencia optimizada para GPU de 24 GB VRAM (RTX 3090) con vLLM, alcanzando ~114-124 tokens por segundo.
- Requiere parches específicos de vLLM (al menos `qwen3_5-mtp-draft-vocab.patch`) para funcionar correctamente.
- No se dispone de información sobre capacidades adicionales como tool calling, razonamiento multi-paso, visión o audio, ya que la model card no las menciona.

## Casos de uso

- Despliegue local de un modelo de 27B en una estación de trabajo con una RTX 3090: permite ejecutar un LLM de gran tamaño sin necesidad de hardware de centro de datos, con una latencia de generación aceptable para aplicaciones interactivas.
- Prototipado y experimentación con decodificación especulativa: los archivos y parches sirven como referencia para implementar MTP en otros modelos o entornos vLLM.
- Generación de texto de alta velocidad en entornos monousuario: por ejemplo, asistentes de escritura o herramientas de autocompletado donde la baja latencia es crítica.
- Evaluación de cuantización int4 en capas de salida: el lm_head requantizado con calibración GPTQ puede estudiarse como caso práctico de compresión sin pérdida significativa de calidad.
- Optimización de costes en inferencia: al caber en una GPU de consumo, se reduce el coste de hardware frente a soluciones con A100 o H100, aunque con menor throughput.
- Base para desarrollar variantes aún más rápidas: el vocabulario de borrador y el módulo MTP pueden ajustarse a dominios específicos (por ejemplo, código) para mejorar la cobertura y velocidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks completos en la información disponible. La model card menciona dos métricas concretas:

- Velocidad de generación: ~114 tok/s con muestreo por defecto y ~124 tok/s en modo greedy, medidos en una RTX 3090 con vLLM 0.27.1.
- Calidad: el lm_head int4 aumenta la perplejidad en +0,6% frente a bf16 y no cambia los resultados en GSM8K, según el autor.

No se proporcionan valores absolutos de perplejidad ni de GSM8K, por lo que no es posible construir una tabla comparativa fiable.

## Requisitos de hardware

- GPU: una RTX 3090 (24 GB VRAM) es el objetivo declarado; el modelo cabe en esa memoria gracias a la cuantización int4.
- VRAM estimada: el modelo base de 27B en int4 ocupa aproximadamente 13,5 GB de pesos, más el lm_head y el módulo MTP, lo que deja margen para activaciones y KV cache en 24 GB.
- Software: vLLM 0.27.1 (o compatible) con los parches del repositorio (`patches/qwen3_5-mtp-draft-vocab.patch` al menos).
- No se especifican otras opciones de despliegue (Ollama, llama.cpp, TGI) en la documentación; el proyecto está ligado a vLLM.
- Latencia y throughput: los valores medidos son 114-124 tok/s en una RTX 3090, pero dependen del hardware y la configuración exacta.

## Comparativa con modelos similares

No disponible. No se proporcionan datos de comparación con otros modelos de tamaño similar (por ejemplo, Llama 3 8B o Qwen2.5 14B) en la información suministrada. La única referencia es el modelo base Qwen3.8-27B sin cuantizar, del cual no se ofrecen métricas de rendimiento.

## Limitaciones y advertencias

- El repositorio no incluye el modelo completo; es necesario descargar el checkpoint base Qwen3.8-27B y aplicar los archivos y parches indicados, lo que añade complejidad al despliegue.
- La decodificación especulativa con MTP depende de la cobertura del vocabulario de borrador (97,5% general, 96% en código); en dominios fuera de esa distribución la velocidad podría degradarse.
- La cuantización int4 del lm_head introduce una pequeña pérdida de calidad (+0,6% de perplejidad), que podría ser relevante en aplicaciones sensibles a la precisión.
- No se documentan sesgos, riesgos de alucinación ni limitaciones de idioma, ya que la model card no los aborda.
- La licencia Apache 2.0 permite uso comercial, pero los parches y archivos dependen de vLLM, que tiene su propia licencia; hay que verificar la compatibilidad.
- El rendimiento de 114-124 tok/s se midió en un escenario monousuario; en entornos multiusuario o con mayor carga de trabajo, el throughput podría ser menor.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/syvai/qwen3.8-27b-3090-fast-variant
- Repositorio de GitHub con instrucciones y parches: https://github.com/syv-ai/qwen38-27b-rtx3090
- Modelo base en HuggingFace: https://huggingface.co/Qwen/Qwen3.8-27B
