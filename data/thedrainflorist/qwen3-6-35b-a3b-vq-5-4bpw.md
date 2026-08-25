# TheDrainFlorist/Qwen3.6-35B-A3B-VQ-5.4bpw

## Resumen

Qwen3.6-35B-A3B-VQ-5.4bpw es una cuantización vectorial (vector quantization, VQ) del modelo Qwen3.6-35B-A3B, un modelo de lenguaje de tipo mixture-of-experts (MoE) desarrollado por Alibaba Qwen. Esta versión concreta ha sido creada por el usuario TheDrainFlorist y está optimizada para ejecutarse en Apple Silicon mediante la librería MLX, sin necesidad de parches adicionales. El modelo base cuenta con 35 mil millones de parámetros totales y 3 mil millones activos, y está diseñado para tareas de codificación agéntica, superando a su predecesor Qwen3.5-35B según el blog oficial de Qwen.

La cuantización aplica una técnica de VQ uniforme sobre los expertos del MoE, con subvectores de dimensión 2 y codebooks de 1024 entradas, mientras que los tensores no expertos se cuantizan a 8 bits. El resultado es un checkpoint de 22.2 GiB que se sitúa entre las cuantizaciones de 8 bits y 4 bits de la comunidad MLX, con una divergencia KL de 28.1 millinats respecto al modelo bf16, frente a los 7.4 del 8-bit y los 78.6 del 4-bit. Esta versión está pensada para equipos con 32 GB de memoria unificada, ofreciendo un equilibrio entre tamaño y fidelidad al modelo original.

La relevancia de este modelo radica en que permite ejecutar un MoE de 35B en hardware de consumo de Apple, algo que normalmente requeriría GPUs de gama alta. Al estar basado en Qwen3.6, hereda las capacidades de razonamiento y generación de código del modelo original, aunque esta cuantización específica no ha sido evaluada en benchmarks de tareas estándar, solo en métricas de fidelidad frente al modelo bf16.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con atencion hibrida, cuantizacion vectorial de expertos |
| Parametros totales | 35B (modelo base), 3B activos |
| Parametros activos | 3B |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | VQ 5.4 bpw (expertos con d=2, K=1024, codebooks fp16; no-expertos en 8-bit) |
| Idiomas soportados | ingles (declarado) |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (MLX), incluye runtime VQ en model.py |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE con 35B parametros totales y 3B activos, que emplea una arquitectura de atencion hibrida heredada de la serie Qwen3.5. Esta combinacion permite un equilibrio entre capacidad y eficiencia computacional, activando solo una fraccion de los expertos por token. La cuantizacion VQ aplicada por TheDrainFlorist no modifica la arquitectura subyacente, sino que comprime los pesos de los expertos mediante k-means en el espacio de pesos, sin utilizar calibracion ni estadisticas de activaciones. Cada subvector de 2 pesos se codifica con un indice de 10 bits en un codebook de 1024 entradas, con una escala fp16 por fila de 64 pesos. Los tensores no expertos se cuantizan a 8 bits, y el router del MoE se mantiene en bf16, lo que introduce una asimetria no medida en el rendimiento.

El entrenamiento del modelo base no se detalla en la informacion disponible, pero se sabe que Qwen3.6-35B-A3B esta optimizado para tareas de codificacion agente, con soporte para razonamiento multi-paso y uso de herramientas. La cuantizacion no requiere reentrenamiento, solo el ajuste de los codebooks mediante k-means no supervisado.

## Capacidades

- Generacion de texto y conversacion: el modelo base es capaz de mantener dialogos multi-turno y generar respuestas coherentes.
- Razonamiento y resolucion de problemas: al ser un modelo de la familia Qwen3.6, se espera un buen rendimiento en tareas de logica y matematicas, aunque no hay benchmarks especificos para esta cuantizacion.
- Generacion de codigo: el modelo base esta especialmente orientado a codificacion agente, por lo que puede escribir, revisar y depurar codigo en multiples lenguajes.
- Soporte de tool calling y agentes: el modelo base incluye capacidades de llamada a funciones y ejecucion de tareas agente, aunque no se ha verificado su funcionamiento en esta version cuantizada.
- Multilingue: la model card declara solo ingles, aunque el modelo base de Qwen suele soportar mas idiomas; esta cuantizacion no lo especifica.
- Ejecucion en Apple Silicon: gracias a la cuantizacion VQ y al runtime MLX integrado, el modelo puede ejecutarse en Mac con 32 GB de RAM sin parches adicionales.

## Casos de uso

- Asistente de programacion local: un desarrollador puede ejecutar este modelo en su Mac para obtener sugerencias de codigo, explicaciones y refactorizaciones sin depender de servicios en la nube. Su tamano reducido (22.2 GiB) permite cargarlo en memoria en equipos con 32 GB.
- Generacion de documentacion tecnica: el modelo puede redactar comentarios, docstrings y documentacion de API a partir de fragmentos de codigo, aprovechando su capacidad de comprension contextual.
- Chatbot de soporte tecnico: al ser un modelo conversacional, puede integrarse en aplicaciones de atencion al cliente para responder consultas frecuentes sobre productos o servicios, con la ventaja de ejecutarse en local para preservar la privacidad.
- Prototipado rapido de agentes: dado que el modelo base soporta tool calling, se puede utilizar para construir prototipos de agentes que interactuen con APIs o ejecuten comandos, aunque se recomienda verificar el comportamiento en esta cuantizacion.
- Educacion y formacion en programacion: el modelo puede actuar como tutor virtual, explicando conceptos de programacion y resolviendo ejercicios paso a paso, gracias a su capacidad de razonamiento.
- Procesamiento de texto en entornos sin GPU: en equipos con Apple Silicon, este modelo permite tareas de resumen, extraccion de informacion o generacion de contenido sin necesidad de hardware especializado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de tareas estandar (MMLU, HumanEval, GSM8K, etc.) para esta cuantizacion. La model card proporciona metricas de fidelidad frente al modelo bf16, medidas sobre un corpus de referencia con ventanas de 2048 tokens:

| Build | Tamano | KL a bf16 (mnats/tok) | Acuerdo top-1 |
|---|---|---|---|
| bf16 | 65.4 GiB | 0 | 100% |
| mlx-community 8-bit | 35.1 GiB | 7.4 | 96.18% |
| **Este modelo (VQ 5.4bpw)** | **22.2 GiB** | **28.1** | **92.22%** |
| mlx-community 4-bit | 19.0 GiB | 78.6 | 85.61% |

Estos datos indican que esta cuantizacion se acerca mas al 8-bit que al 4-bit en terminos de fidelidad, con una mejora de 1.4 veces sobre la linea interpolada entre 4-bit y 6-bit. No se midieron perplexity ni throughput en este artefacto.

## Requisitos de hardware

- VRAM estimada: el checkpoint ocupa 22.2 GiB, por lo que se recomienda al menos 32 GB de memoria unificada en Apple Silicon. La model card indica que es comodo en una maquina de 32 GB.
- GPU recomendadas: exclusivamente Apple Silicon (M1, M2, M3, M4 y variantes Pro/Max/Ultra). No se menciona soporte para GPUs NVIDIA o AMD.
- Compatibilidad con hardware de consumo: si, en Mac con 32 GB de RAM o superior. No se recomienda para equipos con menos memoria.
- Opciones de despliegue: se utiliza con `mlx-lm` (pip install mlx-lm) y el comando `python -m mlx_lm generate`. Tambien se puede integrar en proyectos que usen la libreria MLX. Para despliegue en clusteres exo, se requiere un parche especifico para replicar codebooks (PR #2268).
- Latencia y throughput: no medidos en este artefacto. La model card no proporciona datos de velocidad de decodificacion.

## Comparativa con modelos similares

La siguiente tabla compara esta cuantizacion con otras versiones del mismo modelo base y con cuantizaciones alternativas de la comunidad:

| Modelo | Tamano | Parametros | Contexto | Licencia | Fidelidad (KL) |
|---|---|---|---|---|---|
| Qwen3.6-35B-A3B (bf16) | 65.4 GiB | 35B totales, 3B activos | no disponible | Apache-2.0 | 0 |
| mlx-community 8-bit | 35.1 GiB | 35B totales, 3B activos | no disponible | Apache-2.0 | 7.4 |
| **Este modelo (VQ 5.4bpw)** | **22.2 GiB** | **35B totales, 3B activos** | **no disponible** | **Apache-2.0** | **28.1** |
| mlx-community 4-bit | 19.0 GiB | 35B totales, 3B activos | no disponible | Apache-2.0 | 78.6 |
| TheDrainFlorist VQ 4.6bpw | no disponible | 35B totales, 3B activos | no disponible | Apache-2.0 | no disponible |
| TheDrainFlorist VQ 3.4bpw | no disponible | 35B totales, 3B activos | no disponible | Apache-2.0 | no disponible |

No se dispone de datos de rendimiento en tareas para ninguna de estas versiones, solo metricas de fidelidad. El modelo base Qwen3.6-35B-A3B es el punto de referencia, y esta cuantizacion ofrece un equilibrio entre tamano y calidad.

## Limitaciones y advertencias

- No es una cuantizacion sin perdidas: la divergencia KL de 28.1 millinats indica una degradacion medible respecto al bf16, aunque menor que la del 4-bit.
- No se han medido perplexity, throughput ni resultados en benchmarks de tareas para este artefacto concreto. Las cifras de rendimiento en codificacion o razonamiento del modelo base no estan verificadas en esta version.
- El router del MoE se mantiene en bf16, lo que introduce una asimetria no cuantificada. Aunque el impacto en bytes es minimo, el router alimenta un argmax sobre expertos, por lo que el efecto podria ser mayor de lo esperado.
- La model card declara solo ingles como idioma soportado. Aunque el modelo base puede manejar otros idiomas, no hay garantia de calidad en esta cuantizacion.
- Para despliegue en clusteres exo, es necesario aplicar el PR #2268 o usar la imagen `noahzelezny/exo:vq-codebook-replicate`, ya que el tensor parallelism estandar de exo corta los codebooks y el runtime falla de forma controlada.
- No se ha evaluado el comportamiento en produccion (latencia, estabilidad, consumo de memoria en largas sesiones). Se recomienda realizar pruebas exhaustivas antes de usarlo en entornos criticos.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheDrainFlorist/Qwen3.6-35B-A3B-VQ-5.4bpw
- Modelo base Qwen3.6-35B-A3B: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Blog oficial de Qwen sobre Qwen3.6-35B-A3B: https://qwen.ai/blog?id=qwen3.6-35b-a3b
- Guia de Qwen 3.6 (insiderllm): https://insiderllm.com/guides/qwen-3-6-local-ai-guide/
- Repositorio exo: https://github.com/exo-explore/exo
- PR #2268 de exo: https://github.com/exo-explore/exo/pull/2268
- Rama de exo con replicacion de codebooks: https://github.com/noahzelezny/exo/tree/vq-codebook-replicate
