# waqasm86/vllm-kaggle-models

## Resumen

Este repositorio no contiene un modelo nuevo ni un fine-tuning: es una transformación mecánica del checkpoint oficial de Qwen/Qwen2.5-3B-Instruct al formato `sharded_state` nativo de vLLM, generado con tensor parallelism de tamaño 2 (TP=2) y validado en un entorno Kaggle con dos GPU Tesla T4. El objetivo es ofrecer una representación persistente y lista para cargar en vLLM que evite el proceso de sharding en caliente, reduciendo el tiempo de arranque y el consumo de memoria en entornos con múltiples GPU.

La relevancia de esta publicación es práctica: permite a desarrolladores que trabajan en Kaggle o en infraestructura propia con vLLM cargar un modelo de 3B parámetros en configuración multi-GPU (TP=2) de forma directa, con parámetros de validación documentados (FP16, vLLM 0.18.1, CUDA 12.8). No obstante, no es un checkpoint estándar de Transformers: no se puede cargar con `AutoModelForCausalLM.from_pretrained()` y su uso está restringido a la topología TP=2 para la que fue generado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5-3B-Instruct) |
| Parametros totales | 3.09B (aprox., segun el modelo base) |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | 32768 tokens en el modelo original; 2048 tokens en la configuracion validada en este repo |
| Tipos de cuantizacion | FP16 (unico formato validado) |
| Idiomas soportados | en (ingles) |
| Licencia | Qwen Research License (uso no comercial, requiere licencia separada de Alibaba Cloud para uso comercial) |
| Formato de pesos | safetensors sharded (formato `sharded_state` de vLLM, dos ranks × dos partes) |

## Arquitectura y entrenamiento

El modelo subyacente es Qwen2.5-3B-Instruct, un transformer decoder-only con atención causal estándar, perteneciente a la familia Qwen2.5 de Alibaba Cloud. El repositorio no introduce pesos aprendidos nuevos: es una transformación mecánica del checkpoint original al formato `sharded_state` de vLLM, generada con el guardado nativo de vLLM con TP=2. Esto produce archivos rank-específicos (rank 0 y rank 1) que deben cargarse con la misma topología de tensor parallelism para la que fueron creados.

El proceso de validación se realizó en dos Tesla T4 (SM75) con vLLM 0.18.1, Python 3.12.13, PyTorch 2.10.0+cu128 y NCCL 2.27.5. Se confirmó que la recarga con `load_format="sharded_state"` y TP=2 funciona correctamente, y que el servidor OpenAI-compatible responde HTTP 200 en los endpoints de modelos y chat completions. Dado que FlashAttention 2 no está disponible en SM75, vLLM seleccionó automáticamente `TRITON_ATTN` como backend de atención.

## Capacidades

- Generación de texto conversacional: al ser una instancia de Qwen2.5-3B-Instruct, hereda las capacidades de instrucción y diálogo del modelo base.
- Razonamiento y conocimiento general: el modelo base fue entrenado con 18 billones de tokens y ha demostrado buen rendimiento en tareas de razonamiento y conocimiento en benchmarks públicos.
- Soporte de tool calling y function calling: Qwen2.5-3B-Instruct incluye soporte nativo para tool calling, aunque no se ha validado específicamente en esta representación.
- Capacidades multilingües: el modelo base soporta más de 29 idiomas, pero la model card de este repositorio solo declara inglés como idioma soportado.
- Integración con vLLM: esta representación está optimizada para cargarse directamente con vLLM en configuraciones TP=2, lo que facilita su uso en entornos multi-GPU.

## Casos de uso

- Inferencia multi-GPU en Kaggle: el caso de uso principal es cargar el modelo en un notebook de Kaggle con dos Tesla T4 usando `KaggleLLM` o vLLM directamente, aprovechando el estado sharded persistente para evitar el sharding en caliente.
- Servidor OpenAI-compatible en entornos con 2 GPU: se puede desplegar un endpoint de chat completions con `vllm serve` usando los parámetros documentados, ideal para prototipos y pruebas de concepto.
- Evaluación de modelos en hardware modesto: con dos T4 (16 GB VRAM cada una) se puede ejecutar un modelo de 3B en FP16 con TP=2, útil para validar pipelines de inferencia antes de escalar a GPU más potentes.
- Desarrollo de agentes conversacionales: al heredar las capacidades de Qwen2.5-3B-Instruct, se puede usar para construir asistentes de chat con tool calling, aunque la ventana de contexto validada (2048) limita conversaciones largas.
- Pruebas de integración de vLLM: este repositorio sirve como caso de prueba para verificar el funcionamiento del formato `sharded_state` en vLLM, especialmente en entornos con restricciones de memoria o GPU antiguas.
- Investigación académica no comercial: dado que la licencia es de investigación, se puede usar para experimentos de generación de texto, análisis de comportamiento del modelo o estudios de eficiencia de inferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Este repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni otros benchmarks. El rendimiento del modelo subyacente (Qwen2.5-3B-Instruct) está documentado en la ficha oficial de Qwen, pero no se proporcionan datos específicos para esta representación sharded.

## Requisitos de hardware

- VRAM estimada: el modelo en FP16 ocupa aproximadamente 6.2 GB de pesos (tamaño del repositorio). Con TP=2, cada GPU T4 (16 GB) aloja la mitad de los pesos, dejando margen para el contexto y la memoria de trabajo.
- GPU recomendadas: 2 × Tesla T4 (validado), aunque cualquier GPU compatible con CUDA 12.8 y SM75 o superior debería funcionar. No se ha validado en otras configuraciones.
- Consumer GPU: no se ha probado, pero en teoría dos GPU consumer de 8 GB o más (por ejemplo, RTX 3060, RTX 4060) podrían ejecutar el modelo con TP=2, siempre que vLLM soporte la topología.
- Opciones de despliegue: vLLM (con `load_format="sharded_state"`), `KaggleLLM` (librería específica de Kaggle), servidor OpenAI-compatible con `vllm serve`.
- Latencia y throughput: no se han publicado mediciones. La configuración conservadora (`enforce_eager=True`, `disable_custom_all_reduce=True`) sugiere que el rendimiento no está optimizado al máximo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Qwen2.5-3B-Instruct (original) | 3.09B | 32768 | Qwen Research | Transformers / safetensors | Modelo base, cargable con Transformers y vLLM |
| waqasm86/vllm-kaggle-models (este repo) | 3.09B | 2048 (validado) | Qwen Research | vLLM sharded_state | Representación TP=2, solo para vLLM |
| Llama-3.2-3B-Instruct | 3.2B | 128k | Llama 3.2 Community | Transformers / GGUF | Alternativa de 3B con licencia permisiva para uso comercial |

La comparativa se limita a modelos de tamaño similar. Este repositorio no es un modelo independiente, sino una variante de despliegue de Qwen2.5-3B-Instruct, por lo que su rendimiento es idéntico al del modelo base (siempre que se respete la topología TP=2).

## Limitaciones y advertencias

- No es un checkpoint estándar de Transformers: no se puede cargar con `AutoModelForCausalLM.from_pretrained()`. Intentar hacerlo fallará o producirá resultados incorrectos.
- Solo validado para TP=2: no se ha probado con TP=1, TP>2, splits desiguales de GPU, otros aceleradores ni para entrenamiento o fine-tuning.
- Licencia restrictiva: la Qwen Research License permite solo uso no comercial y de investigación. Cualquier uso comercial requiere una licencia separada de Alibaba Cloud.
- Ventana de contexto limitada en la configuración validada: aunque el modelo base soporta 32768 tokens, la configuración recomendada usa `max_model_len=2048`, lo que limita conversaciones largas o documentos extensos.
- FlashAttention 2 no disponible en SM75: en GPU T4 se usa `TRITON_ATTN`, que puede tener menor rendimiento que FlashAttention en GPU más modernas.
- Sin benchmarks publicados: no hay datos de rendimiento específicos para esta representación, por lo que no se puede comparar cuantitativamente con otras variantes.
- Riesgo de alucinación y sesgos: al ser una copia del modelo Qwen2.5-3B-Instruct, hereda los sesgos y limitaciones del modelo base, incluyendo posibles alucinaciones en tareas de generación libre.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/waqasm86/vllm-kaggle-models
- Modelo base Qwen2.5-3B-Instruct: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia Qwen Research: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Perfil de GitHub del autor: https://github.com/waqasm86
- Documentación de vLLM sobre modelos soportados: https://docs.vllm.ai/en/v0.7.2/models/supported_models.html
