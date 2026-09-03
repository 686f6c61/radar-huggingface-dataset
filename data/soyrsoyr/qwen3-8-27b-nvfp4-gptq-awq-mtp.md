# soyrsoyr/Qwen3.8-27B-NVFP4-GPTQ-AWQ-MTP

## Resumen

El modelo `soyrsoyr/Qwen3.8-27B-NVFP4-GPTQ-AWQ-MTP` es una versión cuantizada del modelo Qwen3.8-27B de Alibaba, desarrollada por el usuario soyrsoyr mediante una combinación de AWQ y GPTQ aplicada con la librería `llm-compressor`. El modelo base es un LLM denso de 27 000 millones de parámetros con arquitectura híbrida de atención (48 de 64 capas usan atención lineal, las otras 16 usan atención completa), una torre de visión integrada, una cabeza de decodificación especulativa MTP (Multi-Token Prediction) y una ventana de contexto nativa de 262 000 tokens, extensible a 1 000 000.

Esta cuantización reduce el tamaño del modelo a aproximadamente 22,9 GB en disco, lo que permite su despliegue en GPUs con menor memoria. La particularidad de esta versión es que las capas MTP se cuantizan a NVFP4 (formato de 4 bits) en el momento del guardado, mientras que el resto de capas usan una combinación de FP8 dinámico (atención y proyecciones) y NVFP4 (MLP). El resultado es un modelo optimizado para inferencia de baja latencia con decodificación especulativa, pensado para entornos de producción que usan vLLM.

La relevancia actual de este modelo radica en que ofrece una alternativa eficiente en memoria para ejecutar un LLM multimodal de 27B con contexto muy largo, manteniendo un rendimiento razonable en tareas de razonamiento y generación, y con soporte nativo para decodificación especulativa MTP, lo que reduce la latencia en comparación con la generación autoregresiva estándar.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención lineal + atención completa), 64 capas, 16 con atención completa y 48 con atención lineal, con torre de visión y cabeza MTP |
| Parametros totales | 27 000 millones (modelo base); 20 294 595 344 parámetros en safetensors cuantizados |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 262 000 tokens nativo, extensible a 1 000 000 |
| Tipos de cuantizacion | NVFP4 (4 bits) para MLP y capas MTP, FP8 dinámico para atención y proyecciones, kv-cache en FP8, AWQ + GPTQ |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (con cuantización comprimida) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso con atención híbrida: de sus 64 capas, solo 16 ejecutan atención completa (con un intervalo de atención completa de 4), mientras que las otras 48 usan atención lineal, lo que reduce el coste computacional en contextos largos. Incluye además una torre de visión para procesamiento multimodal y una cabeza MTP integrada que permite decodificación especulativa con hasta 3 tokens por paso.

La cuantización se realizó con `llm-compressor` sobre el modelo base, aplicando AWQ (con `duo_scaling="both"`) y GPTQ con esquemas de cuantización por grupos: las proyecciones de atención (q, k, v, o), las proyecciones de atención lineal, `lm_head` y las MLP de las últimas 8 capas se cuantizan a FP8 dinámico, mientras que las MLP del resto de capas se cuantizan a NVFP4. La caché de clave-valor se cuantiza a FP8 con estrategia por tensor. La calibración se hizo con 512 muestras del dataset `mlabonne/open-perfectblend`, con una longitud máxima de secuencia de 4096 tokens. Las capas MTP se cuantizan a NVFP4 solo en peso en el momento del guardado, mediante `mtp_scheme="NVFP4"`.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo base Qwen3.8-27B.
- Procesamiento multimodal: al incluir la torre de visión, puede procesar imágenes junto con texto.
- Decodificación especulativa MTP: soporta generación con múltiples tokens por paso, con una tasa de aceptación media del 67,5 % y una longitud de aceptación media de 3,02 tokens en configuración NVFP4.
- Atención híbrida: combina atención lineal y atención completa, lo que permite manejar contextos de hasta 262 000 tokens con menor coste computacional que un transformer estándar.
- Soporte para inferencia con vLLM mediante `--speculative-config '{"method":"mtp","num_speculative_tokens":3}'`.

## Casos de uso

- Despliegue de un LLM multimodal en producción con vLLM: el modelo cuantizado reduce los requisitos de VRAM frente al modelo base, permitiendo servir respuestas con contexto largo en GPUs de gama alta como RTX 4090 o A100.
- Inferencia de baja latencia para chatbots y asistentes: la decodificación especulativa MTP acelera la generación, con una longitud de aceptación media de 3,02 tokens, lo que reduce el tiempo de respuesta en aplicaciones interactivas.
- Procesamiento de documentos extensos: gracias a su ventana de contexto de 262 000 tokens, puede resumir o analizar libros completos, informes largos o conversaciones de múltiples turnos sin truncar el contenido.
- Análisis de imágenes con texto: al conservar la torre de visión, puede responder preguntas sobre imágenes, extraer información visual o generar descripciones, todo con el mismo modelo.
- Generación de código y asistencia a programadores: el modelo base tiene capacidades de razonamiento y código, y la cuantización mantiene un rendimiento aceptable para tareas de autocompletado o revisión de código en entornos con recursos limitados.
- Investigación y experimentación con decodificación especulativa: este modelo sirve como referencia para evaluar el impacto de cuantizar las capas MTP a NVFP4 frente a otros esquemas (FP8 o bf16), como se muestra en la tabla de rendimiento de la model card.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K, etc.) para esta versión cuantizada. La única métrica disponible es el rendimiento de la decodificación especulativa MTP, medida en una GPU B200 con vLLM 0.28 y `num_speculative_tokens=3`:

| Esquema MTP | Tasa de aceptación media | Longitud de aceptación media |
|---|---|---|
| bf16 (sin pérdida) | 83,1 % | 3,49 |
| FP8_DYNAMIC | 84,7 % | 3,54 |
| NVFP4 (este modelo) | 67,5 % | 3,02 |

La cuantización NVFP4 de las capas MTP reduce la tasa de aceptación en aproximadamente 16 puntos porcentuales respecto a bf16, lo que implica una menor eficiencia de la decodificación especulativa, aunque sigue siendo funcional.

## Requisitos de hardware

- VRAM estimada: el repositorio pesa 22,9 GB, por lo que se necesitan al menos 24 GB de VRAM para cargar el modelo en memoria (por ejemplo, una RTX 4090 o una A100 de 40 GB). Con cuantización adicional o técnicas de offloading podría caber en GPUs con menos memoria, pero no está documentado.
- GPU recomendadas: B200 (usada en las pruebas de rendimiento), también compatible con A100, H100, RTX 4090 y otras GPUs con soporte para FP8 y NVFP4 en vLLM.
- Opciones de despliegue: vLLM es el entorno soportado explícitamente, con la configuración de decodificación especulativa MTP. No se menciona compatibilidad con llama.cpp, Ollama o TGI.
- Latencia y throughput: no se proporcionan cifras concretas, pero la decodificación especulativa con MTP reduce la latencia en comparación con la generación autoregresiva estándar, aunque la tasa de aceptación del 67,5 % limita la ganancia.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos cuantizados de la misma familia o tamaño en la información proporcionada. El modelo base Qwen3.8-27B se puede comparar con otras versiones cuantizadas del mismo modelo (por ejemplo, `soyrsoyr/Qwen3.8-27B-NVFP4-MTP` o `soyrsoyr/Qwen3.8-27B-W4A16-AWQ-GPTQ`), pero no se han publicado métricas de rendimiento para estas variantes. Por tanto, la comparativa no está disponible.

## Limitaciones y advertencias

- La cuantización NVFP4 de las capas MTP reduce la tasa de aceptación de la decodificación especulativa (67,5 % frente a 83,1 % en bf16), lo que puede disminuir la ganancia de velocidad esperada.
- La cuantización AWQ+GPTQ puede introducir una ligera degradación en la calidad de las respuestas respecto al modelo original, especialmente en tareas de razonamiento complejo o matemáticas, aunque no se han cuantificado estos efectos.
- La licencia del modelo no está especificada en la información disponible, por lo que se debe contactar con el autor o consultar el modelo base para conocer las restricciones de uso comercial.
- No se han documentado sesgos específicos, pero al ser un modelo derivado de Qwen, puede heredar sesgos presentes en los datos de entrenamiento del modelo base.
- El modelo está pensado para usarse con vLLM; no se garantiza su funcionamiento con otros frameworks de inferencia.
- La ventana de contexto de 262 000 tokens es nativa, pero el uso de contextos muy largos puede aumentar el consumo de memoria y requerir GPUs con mayor VRAM.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/soyrsoyr/Qwen3.8-27B-NVFP4-GPTQ-AWQ-MTP
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Receta de vLLM para Qwen3.8-27B: https://recipes.vllm.ai/Qwen/Qwen3.8-27B
- Documentación de vLLM Ascend para Qwen3.8-27B: https://docs.vllm.ai/projects/ascend/en/latest/tutorials/models/Qwen3.8-27B.html
- Repositorio de llm-compressor: https://github.com/vllm-project/llm-compressor
