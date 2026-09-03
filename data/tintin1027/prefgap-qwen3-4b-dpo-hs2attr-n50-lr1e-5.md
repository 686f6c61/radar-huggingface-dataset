# tintin1027/PrefGap-Qwen3-4B-DPO-HS2Attr-n50-lr1e-5

## Resumen

PrefGap-Qwen3-4B-DPO-HS2Attr-n50-lr1e-5 es un adaptador LoRA de investigación desarrollado por el usuario tintin1027, diseñado para alinear el modelo base Qwen/Qwen3-4B con preferencias humanas mediante entrenamiento con DPO (Direct Preference Optimization). El adaptador se entrenó sobre 1.138 pares de preferencia derivados del dataset nvidia/HelpSteer2, en el marco del experimento PrefGap sobre atributos de HelpSteer2. Su objetivo es explorar cómo el ajuste fino por preferencias puede mejorar la calidad de las respuestas generadas por el modelo base en tareas conversacionales.

Este artefacto es relevante porque representa un caso práctico de aplicación de DPO con LoRA sobre un modelo de 4B parámetros, una técnica eficiente en cómputo que permite adaptar modelos grandes con recursos limitados. Al ser un adaptador PEFT, se puede cargar sobre Qwen3-4B sin necesidad de reentrenar el modelo completo, lo que facilita su integración en pipelines de generación de texto. Sin embargo, se trata de un artefacto de investigación sin documentación adicional sobre rendimiento o casos de uso validados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen/Qwen3-4B (transformer decoder-only) |
| Parametros totales | no disponible (adaptador de 0.1 GB, parametros del base no especificados) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (depende del modelo base Qwen3-4B) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (hereda del modelo base, no especificado) |
| Licencia | no disponible |
| Formato de pesos | safetensors (segun tags de HuggingFace) |

## Arquitectura y entrenamiento

El adaptador se basa en la técnica LoRA (Low-Rank Adaptation) aplicada al modelo Qwen/Qwen3-4B. Segun la model card, se entrenaron las proyecciones q/k/v/o y las proyecciones gate/up/down del transformer con rango 16, alpha 32 y dropout 0.05. El entrenamiento utilizó DPO con beta 0.1, un solo epoch, learning rate 1e-5 con decaimiento coseno y 10% de warmup, y tamaño de batch efectivo 8. La semilla fijada fue 20260831. Los datos de entrenamiento consistieron en 1.138 pares de preferencia extraídos del dataset nvidia/HelpSteer2, que contiene anotaciones humanas sobre atributos de utilidad, corrección, coherencia, complejidad, verbosidad y creatividad. No se menciona el uso de RLHF adicional ni otras técnicas de alineación.

## Capacidades

- Generación de texto conversacional: al ser un adaptador sobre Qwen3-4B, se espera que herede las capacidades de generación de texto del modelo base, aunque no se proporcionan detalles específicos.
- Alineación con preferencias humanas: el entrenamiento DPO busca que el modelo prefiera respuestas que los humanos consideran más útiles o correctas según los atributos de HelpSteer2.
- Soporte de tool calling y agentes: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible, depende del modelo base.
- Modo thinking o capacidades especiales: no disponible.

## Casos de uso

- Investigación en alineación de modelos: el adaptador puede utilizarse para estudiar el efecto del DPO con LoRA sobre un modelo de 4B, comparando respuestas antes y después del ajuste.
- Ajuste fino de chatbots para preferencias específicas: aplicando el adaptador a Qwen3-4B, se puede obtener un modelo que priorice respuestas con atributos como utilidad o corrección, según los datos de HelpSteer2.
- Experimentación con PEFT: sirve como ejemplo de cómo cargar y aplicar un adaptador LoRA con `AutoPeftModelForCausalLM` en entornos de investigación.
- Evaluación de sesgos en preferencias: al estar entrenado con un dataset concreto, permite analizar cómo los sesgos de los anotadores se transfieren al modelo.
- Prototipado rápido de asistentes conversacionales: dado su pequeño tamaño (0.1 GB), puede integrarse en entornos con recursos limitados para pruebas de concepto.
- Benchmarking de técnicas de alineación: puede compararse con otros adaptadores DPO sobre el mismo modelo base para evaluar configuraciones de hiperparámetros.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas como MMLU, HumanEval o GSM8K, ni comparaciones con otros modelos.

## Requisitos de hardware

- El adaptador LoRA tiene un tamaño de 0.1 GB, por lo que su carga en memoria es mínima. Sin embargo, los requisitos reales dependen del modelo base Qwen3-4B, que no se especifican en la información proporcionada.
- Para inferencia, se necesitaría cargar Qwen3-4B (aproximadamente 8 GB en BF16) más el adaptador, lo que podría caber en GPUs de consumo como RTX 3090 o RTX 4090 con cuantización, aunque no se confirma.
- Opciones de despliegue: al ser un adaptador PEFT, se puede usar con bibliotecas como Transformers + PEFT, o convertir a GGUF para llama.cpp si se fusiona con el base, pero no se documenta.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (adaptadores LoRA DPO sobre Qwen3-4B). No se puede establecer una comparativa sin datos adicionales.

## Limitaciones y advertencias

- Artefacto de investigación: la model card indica explícitamente que es un artefacto de investigación y puede heredar limitaciones y sesgos del modelo base y de los datos de preferencia.
- Sesgos de los datos: el dataset HelpSteer2 contiene anotaciones humanas que pueden reflejar sesgos culturales o de los anotadores, los cuales se transfieren al modelo.
- Riesgo de alucinación: no se ha evaluado, pero es inherente a los modelos generativos.
- Licencia no especificada: no se indica la licencia del adaptador, lo que limita su uso comercial sin aclaración legal.
- Sin documentación de rendimiento: no hay benchmarks ni evaluaciones de calidad, por lo que no se recomienda su uso en producción sin validación previa.
- Dependencia del modelo base: el adaptador solo funciona con Qwen3-4B, y su comportamiento depende de las capacidades y limitaciones de dicho modelo.

## Enlaces

- [HuggingFace del adaptador](https://huggingface.co/tintin1027/PrefGap-Qwen3-4B-DPO-HS2Attr-n50-lr1e-5)
- [Modelo base Qwen/Qwen3-4B](https://huggingface.co/Qwen/Qwen3-4B)
- [Colección Qwen3](https://huggingface.co/collections/Qwen/qwen3)
