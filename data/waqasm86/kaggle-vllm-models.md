# waqasm86/kaggle-vllm-models

## Resumen

Este repositorio no contiene un modelo nuevo, sino una representación mecánica del checkpoint de Qwen/Qwen2.5-3B-Instruct transformada al formato `sharded_state` de vLLM con tensor parallelism de tamaño 2. El autor, Mohammad Waqas (waqasm86), la generó y validó en un notebook de Kaggle con dos GPUs Tesla T4, con el objetivo de facilitar la carga directa de este modelo en vLLM sin necesidad de convertir pesos en tiempo de ejecución. La representación incluye archivos de checkpoint específicos para los ranks 0 y 1 de TP=2, y está pensada para entornos con GPUs de gama media como las T4.

El modelo subyacente es Qwen2.5-3B-Instruct, un transformer decoder-only de 3.000 millones de parámetros desarrollado por Alibaba Cloud, con una ventana de contexto nativa de 32.768 tokens y entrenado con instrucciones y preferencias humanas. Esta versión empaquetada no añade pesos aprendidos nuevos, por lo que sus capacidades son exactamente las del modelo base. Su relevancia radica en que permite desplegar un modelo instructivo de 3B en hardware modesto (dos T4 de 16 GB) mediante vLLM, con una configuración validada y reproducible.

La licencia es la Qwen Research License, que restringe el uso a fines de investigación y evaluación no comerciales. El repositorio incluye también un `NOTICE` y el `LICENSE` original para su redistribución.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) |
| Parametros totales | 3.000 millones (3B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (modelo base); configuracion recomendada en este repo: 2.048 |
| Tipos de cuantizacion | FP16 (validado); no se documentan otras cuantizaciones |
| Idiomas soportados | Ingles (etiquetado en el repo; el modelo base Qwen2.5-3B-Instruct soporta mas idiomas, pero no se detalla en esta ficha) |
| Licencia | Qwen Research License (uso no comercial) |
| Formato de pesos | Safetensors en formato `sharded_state` de vLLM (dos ranks, dos partes) |

## Arquitectura y entrenamiento

El modelo base Qwen2.5-3B-Instruct es un transformer causal con atención de múltiples cabezas, normalización RMSNorm y activaciones SwiGLU. Fue entrenado por Alibaba Cloud sobre un corpus multilingüe extenso y posteriormente ajustado con instrucciones y preferencias humanas (RLHF/DPO). No se dispone en la información proporcionada de detalles sobre el número exacto de tokens de entrenamiento ni la composición del dataset.

La transformación realizada en este repositorio es puramente mecánica: vLLM guarda el checkpoint en un formato `sharded_state` con tensor parallelism de tamaño 2, dividiendo los pesos en dos ranks. No hay ningún entrenamiento adicional ni modificación de los pesos. La validación se realizó con vLLM v0.18.1 (wheel `0.18.2.dev0+ga26e8dc7f.d20260822.cu128`) sobre dos Tesla T4 (SM75), con Python 3.12.13, PyTorch 2.10.0+cu128 y NCCL 2.27.5. En estas GPUs, FlashAttention 2 no está disponible, por lo que vLLM seleccionó `TRITON_ATTN` como backend de atención.

## Capacidades

- Generación de texto y chat instructivo: al ser el modelo Qwen2.5-3B-Instruct, hereda sus capacidades de conversación multi-turno y seguimiento de instrucciones.
- Razonamiento y matemáticas: el modelo base muestra competencia en tareas de razonamiento lógico y aritmético, aunque no se aportan benchmarks específicos en este repositorio.
- Generación de código: el modelo base está entrenado con datos de código y puede producir fragmentos en varios lenguajes.
- Multilingüismo: el modelo base soporta múltiples idiomas, aunque la model card de este repo solo etiqueta inglés.
- Inferencia optimizada para vLLM: la representación `sharded_state` permite cargar el modelo directamente con vLLM en TP=2, sin conversión adicional.
- Compatibilidad con API OpenAI: el servidor vLLM expone endpoints compatibles con OpenAI (`/v1/models` y `/v1/chat/completions`), validados con HTTP 200.

## Casos de uso

- Despliegue de un asistente conversacional en Kaggle o entornos con dos GPUs T4: se puede servir el modelo con `vllm serve` usando `--tensor-parallel-size 2` y `--load-format sharded_state`, obteniendo un endpoint OpenAI-compatible para aplicaciones de chat.
- Prototipado rápido de aplicaciones de generación de texto en investigación: al cargar directamente el checkpoint sharded, se elimina el paso de conversión de pesos, reduciendo el tiempo de puesta en marcha en notebooks.
- Evaluación de modelos instructivos de 3B en hardware de gama media: dos T4 de 16 GB son suficientes para ejecutar el modelo en FP16, lo que permite comparar su comportamiento con otros modelos de tamaño similar sin necesidad de GPUs de alta gama.
- Integración en pipelines de inferencia con vLLM: la representación es compatible con la API de vLLM (`LLM` y `KaggleLLM`), facilitando su uso en sistemas de generación aumentada por recuperación (RAG) o agentes conversacionales.
- Entornos educativos y de formación: al ser un modelo de 3B con licencia de investigación, es adecuado para prácticas de ingeniería de prompts, fine-tuning (aunque no se recomienda sobre esta representación) y análisis de comportamiento de modelos instructivos.
- Servidor de chat para pruebas de concepto en empresas sin licencia comercial: dado que la licencia restringe el uso comercial, es útil para validar ideas internamente antes de adquirir una licencia comercial de Qwen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio solo documenta la validación funcional de carga y servido, no métricas de calidad del modelo. Para conocer el rendimiento del modelo base, se debe consultar la documentación oficial de Qwen2.5-3B-Instruct.

## Requisitos de hardware

- Configuración validada: 2 × NVIDIA Tesla T4 (16 GB cada una), con tensor parallelism de tamaño 2.
- VRAM estimada: el modelo en FP16 ocupa aproximadamente 6 GB de pesos, pero al usar TP=2 se reparte entre las dos GPUs. Con `gpu_memory_utilization=0.70`, cada T4 usa unos 11 GB de memoria, dejando margen para el contexto y las activaciones.
- GPU recomendadas: cualquier GPU con al menos 16 GB de VRAM y soporte para CUDA 12.8 (SM75 o superior). No se ha validado en otras topologías (TP=1, TP>2, otras GPUs).
- Opciones de despliegue: vLLM (servidor OpenAI-compatible), `KaggleLLM` (librería específica para Kaggle), o la API `LLM` de vLLM directamente.
- Latencia y throughput: no se proporcionan datos medidos. La configuración conservadora (`enforce_eager`, `disable_custom_all_reduce`) prioriza la estabilidad sobre el rendimiento máximo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (base) | 3B | 32.768 | Qwen Research | Transformers | Modelo original, cargable con `AutoModelForCausalLM` |
| Este repositorio (sharded) | 3B | 32.768 (recomendado 2.048) | Qwen Research | vLLM `sharded_state` | Misma arquitectura, solo cambia el formato de pesos |
| Llama-3.2-3B-Instruct | 3B | 128.000 | Llama 3.2 Community | Transformers | Alternativa de tamaño similar, licencia permisiva para uso comercial |
| Phi-3-mini-4k-instruct | 3.8B | 4.096 | MIT | Transformers | Alternativa con licencia MIT, contexto más corto |

No se dispone de datos de rendimiento comparativo entre estos modelos en la información proporcionada. La comparación se limita a características técnicas y de licencia.

## Limitaciones y advertencias

- Licencia de uso no comercial: la Qwen Research License restringe el uso a investigación y evaluación. Cualquier uso comercial requiere una licencia separada de Alibaba Cloud.
- Formato no estándar: el checkpoint no es un modelo Transformers convencional. No se puede cargar con `AutoModelForCausalLM.from_pretrained()`. Solo es válido con el cargador `sharded_state` de vLLM y la topología TP=2.
- Topología fija: solo se ha validado TP=2. No se garantiza el funcionamiento con TP=1, TP>2, ni con otras configuraciones de hardware.
- Contexto limitado en la práctica: aunque el modelo base soporta 32.768 tokens, la configuración recomendada en este repo usa `max_model_len=2048` para evitar problemas de memoria en las T4. No se ha probado con contextos mayores.
- Backend de atención alternativo: al no estar disponible FlashAttention 2 en SM75, vLLM usa `TRITON_ATTN`, lo que puede afectar al rendimiento en comparación con GPUs más modernas.
- Sesgos y alucinaciones: al ser el modelo Qwen2.5-3B-Instruct, puede presentar sesgos presentes en sus datos de entrenamiento y riesgo de alucinación, especialmente en tareas de razonamiento complejo. No se han documentado evaluaciones específicas en este repositorio.
- Sin soporte para fine-tuning: la representación sharded no está pensada para entrenamiento adicional; solo para inferencia.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/waqasm86/kaggle-vllm-models
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Repositorio de binarios vLLM para Kaggle: https://huggingface.co/waqasm86/vllm-kaggle-binaries
- Perfil de GitHub del autor: https://github.com/waqasm86
- Dataset de wheels vLLM en Kaggle: https://www.kaggle.com/datasets/kawchar85/vllm-wheels/data
