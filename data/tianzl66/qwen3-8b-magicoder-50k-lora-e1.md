# tianzl66/Qwen3-8B-Magicoder-50K-LoRA-E1

## Resumen
Este repositorio contiene un adaptador LoRA de bajo rango (rank 16) obtenido al fine-tuning del modelo base Qwen/Qwen3-8B sobre 50.000 ejemplos del dataset Magicoder, durante una única época. El checkpoint corresponde al epoch 1 y está pensado como punto de partida fijo para experimentos de "Spectral Surgery" aplicados a modelos de código, una técnica de intervención en el espacio espectral de los pesos. El adaptador se distribuye en formato PEFT (librería `peft`) y ocupa 0,2 GB, por lo que debe cargarse junto al modelo base de 8.000 millones de parámetros.

El interés de este modelo es doble: por un lado, sirve como referencia de un LoRA de código entrenado con datos Magicoder; por otro, es la base sobre la que se aplican las modificaciones espectrales que, según la tabla de evaluación incluida, logran mejorar el rendimiento en HumanEval hasta un 74,39% Pass@1 (frente al 67,07% del LoRA sin intervención). Aunque el adaptador en sí no aporta una mejora espectacular sobre el base (solo +2,44 puntos en HumanEval), su valor reside en ser un punto de control reproducible para investigación en edición de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-8B base) con adaptador LoRA |
| Parametros totales | 8.000 millones (base) + adaptador LoRA (no se especifica el numero exacto de parametros del adaptador) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 4096 (longitud de secuencia de entrenamiento; la del base es superior, pero no se indica) |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors; el base puede cuantizarse con GPTQ, AWQ, GGUF, etc.) |
| Idiomas soportados | no disponible (hereda los del base Qwen3-8B, que soporta multiples idiomas, pero no se especifica en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento
El adaptador se basa en la arquitectura del modelo Qwen3-8B, un transformer denso de 8.000 millones de parametros con atención de múltiples cabezas y mecanismos de thinking mode (aunque este adaptador se entrena para generación de código sin activar explícitamente el modo razonamiento). El fine-tuning se realizó con LoRA de rango 16 sobre el dataset Magicoder, que contiene instrucciones de programación sintéticas generadas a partir de código semilla. Los hiperparámetros principales son: longitud de secuencia 4096, batch global 32, learning rate 2e-5, una época y semilla 42. No se menciona el uso de RLHF ni DPO; el entrenamiento es de supervisión directa sobre ejemplos de código.

La innovación técnica no reside en el adaptador en sí, sino en el experimento de "Spectral Surgery" que lo utiliza como checkpoint fuente. Este método interviene en los valores singulares de los pesos del LoRA para modificar su comportamiento, logrando mejoras sustanciales en HumanEval (74,39% vs 67,07% del LoRA sin cirugía). El adaptador se publica para permitir reproducir esos experimentos.

## Capacidades
- Generación de código en lenguajes de programación cubiertos por Magicoder (Python, Java, C++, JavaScript, entre otros).
- Completado de funciones y resolución de problemas algorítmicos básicos a partir de descripciones en lenguaje natural.
- Soporte de formato de chat (el prompt de evaluación usa formato chat de Qwen3).
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso específicas para este adaptador.
- Al ser un LoRA sobre Qwen3-8B, hereda las capacidades lingüísticas del base, pero el entrenamiento se centra exclusivamente en código.

## Casos de uso
- Investigación en edición de pesos y "Spectral Surgery": el checkpoint sirve como baseline reproducible para estudiar cómo la modificación de valores singulares afecta al rendimiento en tareas de código.
- Fine-tuning posterior: el adaptador puede usarse como punto de partida para entrenamientos adicionales sobre otros datasets de código, dado que ya ha absorbido conocimiento de Magicoder.
- Evaluación comparativa de técnicas de intervención: permite medir el efecto de distintas operaciones espectrales (HNS, etc.) frente a un LoRA estándar.
- Generación de código en entornos controlados: aunque el rendimiento es moderado, puede emplearse en prototipos donde se requiera un modelo ligero de código sobre Qwen3-8B.
- Análisis de la transferencia de conocimiento: estudiar qué patrones de código aprende un LoRA con solo 50K ejemplos y una época.
- Reproducción de experimentos académicos: la configuración de entrenamiento está documentada (batch, LR, rank, seed), lo que facilita replicar y extender los resultados.

## Benchmarks y rendimiento
La model card incluye resultados de evaluación con decodificación greedy, formato de chat para HumanEval, `max_new_tokens=512` y batch de 8. Se comparan tres configuraciones:

| Metodo | HumanEval-chat Pass@1 | MBPP-sanitized Pass@1 |
|---|---|---:|---:|
| Qwen3-8B Base | 64,63% (106/164) | 72,76% (187/257) |
| LoRA, Epoch 1 (este modelo) | 67,07% (110/164) | 72,76% (187/257) |
| LoRA + Spectral Surgery HNS 4+1 | 74,39% (122/164) | 75,10% (193/257) |

No se proporcionan resultados de otros benchmarks (MMLU, GSM8K, etc.) ni comparaciones con otros modelos LoRA de código.

## Requisitos de hardware
- El adaptador LoRA ocupa 0,2 GB, pero requiere cargar el modelo base Qwen3-8B completo.
- Para inferencia con el base en FP16: aproximadamente 16 GB de VRAM (8B parámetros × 2 bytes). Con cuantización INT8 (~8 GB) o INT4 (~4-5 GB) se reduce el requisito.
- GPU recomendadas: RTX 3090/4090 (24 GB) para FP16 sin problemas; GPUs con 16 GB (RTX 4080, A100 40GB) también son viables. Para cuantización INT4, una RTX 4060 Ti 16 GB o similar sería suficiente.
- No se indican opciones de despliegue específicas, pero al ser un adaptador PEFT puede cargarse con Hugging Face Transformers + PEFT, o fusionarse con el base para usar vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles en la documentación.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | HumanEval Pass@1 | MBPP Pass@1 | Licencia |
|---|---|---|---|---|---|
| Qwen3-8B Base | 8B | 32K (base) | 64,63% | 72,76% | Apache 2.0 (Qwen3) |
| Este LoRA (Epoch 1) | 8B + LoRA | 4096 (entrenamiento) | 67,07% | 72,76% | no disponible |
| LoRA + Spectral Surgery HNS 4+1 | 8B + LoRA | 4096 (entrenamiento) | 74,39% | 75,10% | no disponible |

No se dispone de datos de otros LoRA de código comparables (p. ej., CodeLlama LoRA, DeepSeek-Coder LoRA) en la información proporcionada.

## Limitaciones y advertencias
- El adaptador se ha entrenado únicamente con 50K ejemplos y una época; su rendimiento en tareas de código complejas o fuera del dominio de Magicoder puede ser limitado.
- No se especifica la licencia del adaptador, lo que impide conocer restricciones de uso comercial. El modelo base Qwen3-8B se distribuye bajo Apache 2.0, pero el adaptador no declara licencia.
- No se documentan sesgos ni riesgos de alucinación específicos, pero al ser un modelo de código, puede generar código incorrecto o inseguro si no se valida.
- La longitud de contexto de entrenamiento es 4096, aunque el base soporta más; no se indica si el adaptador degrada con contextos más largos.
- La evaluación se limita a HumanEval y MBPP; no hay datos sobre robustez, generalización a otros lenguajes o resistencia a ataques adversarios.
- El adaptador está pensado como checkpoint de investigación; no se recomienda su uso directo en producción sin una evaluación adicional.

## Enlaces
- Repositorio HuggingFace: https://huggingface.co/tianzl66/Qwen3-8B-Magicoder-50K-LoRA-E1
- Modelo base Qwen3-8B: https://huggingface.co/Qwen/Qwen3-8B
- Colección Qwen3: https://huggingface.co/collections/Qwen/qwen3
- Repositorio GitHub de Qwen3: https://github.com/QwenLM/Qwen3
- Repositorio GitHub de Qwen3.8 (serie más reciente): https://github.com/QwenLM/Qwen3.8
