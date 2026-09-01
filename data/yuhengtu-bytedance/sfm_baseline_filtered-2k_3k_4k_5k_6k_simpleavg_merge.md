# yuhengtu-bytedance/sfm_baseline_filtered-2k_3k_4k_5k_6k_simpleavg_merge

## Resumen

Este modelo es una fusión experimental de cinco checkpoints intermedios de un mismo modelo de lenguaje preentrenado, desarrollado por el equipo de ByteDance (usuario `yuhengtu-bytedance`). Se creó mediante la técnica de fusión lineal (linear merge) implementada en [mergekit](https://github.com/cg123/mergekit), promediando los pesos de los pasos de entrenamiento 2000, 3000, 4000, 5000 y 6000 de un modelo base denominado `baseline_filtered`. El resultado es un modelo de aproximadamente 6,8 mil millones de parámetros con arquitectura GPT-NeoX, almacenado en formato safetensors con precisión bfloat16.

La relevancia de este modelo reside en su naturaleza experimental: explora si el promediado de pesos de diferentes etapas de entrenamiento puede producir un modelo con mejor rendimiento o mayor robustez que un checkpoint individual, sin necesidad de entrenamiento adicional. No se ha publicado ninguna documentación sobre sus capacidades, benchmarks o casos de uso, por lo que debe considerarse un artefacto de investigación más que un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | GPT-NeoX (autoregresiva, transformer) |
| Parametros totales | 6.856.253.440 (~6,8 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en bfloat16) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (bfloat16) |

## Arquitectura y entrenamiento

El modelo se construyó mediante el método de fusión lineal (Linear merge) descrito en el paper [arXiv:2203.05482](https://arxiv.org/abs/2203.05482). La configuración YAML indica que se promediaron cinco checkpoints del mismo modelo base (`baseline_filtered`) en los pasos globales 2000, 3000, 4000, 5000 y 6000, cada uno con peso 1.0 y normalización activada. El checkpoint del paso 6000 se usó como base. La fusión se realizó en precisión float32 y se exportó a bfloat16.

No se dispone de información sobre el entrenamiento original del modelo base: ni número de tokens, ni composición del dataset, ni si se aplicaron técnicas como RLHF o DPO. Tampoco se detalla ninguna innovación arquitectónica más allá de la arquitectura GPT-NeoX estándar.

## Capacidades

No se ha publicado ninguna evaluación de capacidades para este modelo. Al tratarse de un modelo de lenguaje generativo basado en GPT-NeoX, se presume que puede realizar tareas de generación de texto, pero no hay evidencia documentada. Las siguientes capacidades son hipotéticas y no verificadas:

- Generación de texto autoregresiva (presumible, por arquitectura)
- Razonamiento y comprensión del lenguaje (sin confirmar)
- Generación de código (sin confirmar)
- Soporte de tool calling / function calling: no disponible
- Soporte de agentes y multi-step reasoning: no disponible
- Capacidades multilingues: no disponible
- Capacidades especiales (vision, audio, thinking mode): no disponible

## Casos de uso

No se han documentado casos de uso específicos para este modelo. Dado su carácter experimental, los usos potenciales se limitan a:

- Investigación en técnicas de fusión de modelos: permite estudiar el efecto del promediado de checkpoints en el rendimiento final, comparando con los checkpoints individuales.
- Experimentación con arquitecturas GPT-NeoX de ~6,8 B: sirve como base para pruebas de fine-tuning o adaptación, aunque sin garantías de calidad.
- Evaluación comparativa de métodos de merging: puede utilizarse como referencia en estudios sobre interpolación de pesos.
- Prototipado rápido en entornos de investigación: al ser un modelo de tamaño medio, puede desplegarse en GPUs de consumo para pruebas preliminares.
- Análisis de robustez: permite investigar si el promediado reduce la sensibilidad a variaciones de los datos de entrenamiento.
- Docencia y divulgación: útil para demostrar el flujo de trabajo de mergekit y la fusión lineal en talleres o cursos.

En todos los casos, se recomienda validar el comportamiento del modelo antes de cualquier uso, ya que no existe documentación de soporte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras evaluaciones estándar. Tampoco se han comparado sus métricas con modelos similares.

## Requisitos de hardware

Los requisitos se estiman a partir del tamaño de los pesos (6,8 B parámetros en bfloat16, ~13,7 GB en disco) y de la arquitectura GPT-NeoX. No hay mediciones oficiales de latencia o throughput.

- VRAM estimada para inferencia en bfloat16: al menos 16 GB (13,7 GB de pesos + overhead de activaciones y cache KV). Con secuencias largas, se recomienda 24 GB.
- VRAM estimada con cuantizacion (si se aplica externamente): ~7 GB en 8 bits, ~4 GB en 4 bits, aunque no se proporcionan versiones cuantizadas.
- GPU recomendadas: RTX 4090 (24 GB) o superior para bfloat16; A100 40/80 GB para despliegue con margen; H100 para alta concurrencia.
- En consumer GPU: cabe en RTX 3090/4090 (24 GB) con bfloat16, y en GPUs de 8-12 GB si se cuantiza a 4 bits.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, Hugging Face TGI, text-generation-inference (el modelo es compatible con endpoints según los tags).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento para comparar con otros modelos. A nivel de especificaciones, se puede contrastar con modelos de tamaño similar:

| Modelo | Parametros | Contexto | Arquitectura | Licencia |
|---|---|---|---|---|
| sfm_baseline_filtered-2k_3k_4k_5k_6k_simpleavg_merge (este) | 6,8 B | no disponible | GPT-NeoX | no disponible |
| Llama 2 7B | 6,7 B | 4096 | Llama | Llama 2 Community License |
| Mistral 7B | 7,3 B | 32768 | Llama (GQA) | Apache 2.0 |
| Gemma 7B | 8,5 B | 8192 | Gemma | Gemma License |

La comparación es meramente estructural; no hay evidencia de que este modelo compita en rendimiento con los mencionados.

## Limitaciones y advertencias

- No existe documentación sobre sesgos, alucinaciones o comportamientos indeseados. Al ser un merge sin evaluación, el riesgo de salidas incorrectas o dañinas es desconocido.
- La licencia no está especificada, por lo que no se garantiza su uso comercial ni su redistribución. Se debe contactar con el autor antes de cualquier uso productivo.
- No se conocen los idiomas soportados ni la calidad multilingue.
- La longitud de contexto no está publicada; se desconoce si el modelo maneja ventanas largas o sufre degradación.
- Al ser un modelo experimental, puede presentar inestabilidad numérica o comportamientos erráticos debido a la fusión de pesos.
- No se han publicado resultados de benchmarks, por lo que no hay garantía de rendimiento en tareas estándar.
- El repositorio no incluye un tokenizador ni configuración de generación; se debe usar el tokenizador del modelo base original, que no está disponible públicamente en este repo.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/yuhengtu-bytedance/sfm_baseline_filtered-2k_3k_4k_5k_6k_simpleavg_merge)
- [Paper de fusión lineal (arXiv:2203.05482)](https://arxiv.org/abs/2203.05482)
- [Repositorio de mergekit](https://github.com/cg123/mergekit)
- [Modelo relacionado: sfm_baseline_filtered-4k_5k_6k_merge](https://huggingface.co/yuhengtu-bytedance/sfm_baseline_filtered-4k_5k_6k_merge)
- [Discusión del modelo sfm_baseline_filtered-2k_3k_4k_merge](https://huggingface.co/yuhengtu-bytedance/sfm_baseline_filtered-2k_3k_4k_merge/discussions)
- [Despliegue en FriendliAI: sfm_baseline_filtered-3k_4k_5k_merge](https://friendli.ai/models/yuhengtu-bytedance/sfm_baseline_filtered-3k_4k_5k_merge)
- [Despliegue en FriendliAI: sfm-baseline-filtered-4k-5k-6k-avg](https://friendli.ai/models/yuhengtu-bytedance/sfm-baseline-filtered-4k-5k-6k-avg)
- [Despliegue en FriendliAI: sfm-baseline-unfiltered-4k-5k-6k-avg](https://friendli.ai/models/yuhengtu-bytedance/sfm-baseline-unfiltered-4k-5k-6k-avg)
