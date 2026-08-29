# SZLHOLDINGS/KHIPU-R2

## Resumen

KHIPU-R2 es un adaptador QLoRA desarrollado por SZL Holdings (Stephen Lutar) sobre el modelo base Qwen/Qwen2.5-1.5B-Instruct. Se presenta como un "proposal-only brain navigator" y un "abstain retrain", es decir, un adaptador de investigación que enseña al modelo a abstenerse cuando no tiene certeza, en lugar de alucinar. El adaptador tiene 147,8 millones de parámetros entrenables y se distribuye en formato safetensors bajo licencia Apache-2.0. Está pensado para entornos de investigación y experimentación, no para producción, y su evaluación muestra una tasa de abstención de 3/6 en datos adversarios, lo que indica que aún no es fiable para uso autónomo.

La relevancia actual de este modelo radica en su enfoque en la abstención (abstain) como mecanismo para reducir alucinaciones en modelos generativos, un área de creciente interés en IA responsable. Sin embargo, su pequeño tamaño de datos de entrenamiento (23 filas con oversampling) y su naturaleza de adaptador lo convierten en una pieza experimental más que en un modelo de propósito general.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador QLoRA sobre Qwen2.5-1.5B-Instruct (transformer decoder) |
| Parametros totales | 147,8M (adaptador) + 1.5B (modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada) |
| Tipos de cuantizacion | No disponible (adaptador safetensors; el base puede cargarse en 4-bit con bitsandbytes) |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adapter_model.safetensors) |

## Arquitectura y entrenamiento

KHIPU-R2 es un adaptador de tipo LoRA (Low-Rank Adaptation) entrenado con QLoRA (Quantized LoRA) sobre el modelo base Qwen2.5-1.5B-Instruct, un transformer decoder de 1.500 millones de parámetros. El adaptador añade 147,8 millones de parámetros entrenables (r=32, α=64) y se entrenó durante 45 épocas con una tasa de aprendizaje de 2e-4 y semilla 11. Los datos de entrenamiento consisten en 15 filas de "navigate" y 8 filas de "abstain", cada una con oversampling 4, dando un total en memoria de 32 ejemplos. Se reservaron 5+6 filas como conjunto de validación (held-out) que no participaron en el gradiente.

El objetivo del entrenamiento es enseñar al modelo a distinguir cuándo debe generar una propuesta y cuándo debe abstenerse (no responder) ante entradas adversarias o inciertas. La metodología se enmarca en la doctrina "v11-LOCKED" de SZL Holdings, que define el adaptador como "advisory, never a theorem". No se utilizó RLHF ni DPO; es un ajuste fino supervisado clásico con QLoRA.

## Capacidades

- Generación de texto conversacional en inglés, basado en las capacidades del modelo base Qwen2.5-1.5B-Instruct.
- Abstención selectiva: el adaptador ha sido entrenado para reconocer ciertos patrones adversarios y abstenerse de responder, aunque su tasa de éxito medida es de 3/6 (50%) en el conjunto adversarial.
- Navegación de propuestas (proposal-only): está diseñado para actuar como un "navegador" que propone acciones o respuestas, pero no como un agente autónomo.
- No soporta tool calling, function calling, ni razonamiento multi-paso más allá de lo que el modelo base ofrece.
- No tiene capacidades multimodales (visión, audio, etc.).
- Solo inglés; no se han documentado capacidades multilingües adicionales.

## Casos de uso

- Investigación sobre abstention learning: el adaptador sirve para estudiar cómo los modelos pequeños aprenden a abstenerse ante entradas adversarias, dado su entrenamiento específico con datos adversariales.
- Prototipado de sistemas de QA con abstención: en aplicaciones donde una respuesta incorrecta es más costosa que no responder, este adaptador puede integrarse en un pipeline que filtre respuestas de baja confianza.
- Evaluación de adaptadores QLoRA: como caso de estudio para comparar el rendimiento de adaptadores de bajo rango sobre modelos base pequeños.
- Experimentación en entornos gobernados: SZL Holdings lo enmarca en su infraestructura de "governed-AI", por lo que puede usarse como componente en pruebas de control de agentes.
- Benchmarking de métricas de abstención: permite medir la evolución de la tasa de abstención en diferentes configuraciones de entrenamiento.
- Educación y divulgación: para demostrar conceptos de fine-tuning eficiente y abstención en modelos de lenguaje.

## Benchmarks y rendimiento

La model card reporta métricas propias de evaluación, medidas en el job de entrenamiento (2026-08-28). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K. Los resultados son los siguientes:

| Métrica | Resultado |
|---|---|
| plan-valid | 11 / 11 |
| grounding (eval.jsonl navigate) | 5 / 5 |
| abstain (adversarial.jsonl) | 3 / 6 |
| Alucinaciones en citas | 0 (en este job) |

Estos valores corresponden a un conjunto de evaluación muy pequeño (n=11 para plan-valid, n=5 para grounding, n=6 para abstain) y no deben interpretarse como una puntuación general. El propio autor advierte que no se debe derivar un "world-rank score" de estos datos. Tampoco hay comparación con otros modelos.

## Requisitos de hardware

- Al ser un adaptador sobre un modelo base de 1.500 millones de parámetros, los requisitos de hardware son los del modelo base más el adaptador.
- No se especifican en la model card los requisitos de VRAM, GPU ni latencia.
- Con cuantización 4-bit del modelo base (bitsandbytes), el consumo de VRAM estimado para inferencia sería de aproximadamente 1,5-2 GB, lo que permite ejecutarse en GPUs consumer como una RTX 3060 o superior. Sin embargo, esta estimación no está confirmada por el autor.
- Opciones de despliegue: al ser un adaptador PEFT, se puede cargar con transformers + peft, o mediante vLLM si se fusiona el adaptador con el base. También es posible usar llama.cpp si se convierte a GGUF, aunque el autor indica que los mini GGUFs están en otro repositorio.
- No se dispone de datos de throughput o latencia medidos.

## Comparativa con modelos similares

No se dispone de información comparativa con otros adaptadores o modelos de la misma categoría. La model card no ofrece comparaciones con alternativas. Se puede mencionar que el modelo base Qwen2.5-1.5B-Instruct es el punto de partida, pero no hay datos de rendimiento relativo. Por tanto, esta sección queda sin datos concretos.

## Limitaciones y advertencias

- El adaptador no es un reemplazo del modelo SZL-Khipu-1.5B, que es el modelo original firmado por SZL Holdings.
- No es un agente autónomo; la etiqueta "governed-agent" indica que está sujeto a control externo.
- La tasa de abstención medida es de 3/6, lo que significa que falla en la mitad de los casos adversariales. No es fiable para producción.
- El conjunto de entrenamiento es extremadamente pequeño (23 filas con oversampling), lo que puede provocar sobreajuste y baja generalización.
- Solo está disponible en inglés; no hay soporte documentado para otros idiomas.
- La licencia Apache-2.0 permite uso comercial, pero el autor declara "research-only" y "proposal-only", por lo que su uso en producción no está recomendado.
- El adaptador no incluye evaluación de sesgos ni análisis de robustez más allá de los datos adversariales internos.
- No se han publicado detalles sobre el dataset de entrenamiento (origen, composición) más allá de las filas mencionadas.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/SZLHOLDINGS/KHIPU-R2)
- [Organización SZL Holdings en HuggingFace](https://huggingface.co/SZLHOLDINGS/models)
- [Documentación de SZL Holdings](https://szl-holdings.github.io/docs-site/)
- [Espacio rosie-platform](https://huggingface.co/spaces/SZLHOLDINGS/rosie-platform)
- [Modelo base Qwen2.5-1.5B-Instruct](https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct)
- [Informe de seguridad de Palo Alto Networks (insights-db)](https://insights-db.paloaltonetworks.com/models/SZLHOLDINGS/KHIPU-R2/c0894771935c01bf3ec7d50cde9f9323901b8d2a/overview)

Nota: el enlace a insights-db.paloaltonetworks.com aparece en los resultados de búsqueda, pero no se ha verificado su contenido; se incluye como referencia externa.
