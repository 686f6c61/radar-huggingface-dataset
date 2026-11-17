# yimn-Aghosh/zegrate-ai

## Resumen

Zegrate AI es un ajuste fino (fine-tune) del modelo Qwen2.5-14B-Instruct, desarrollado por el usuario yimn-Aghosh, orientado a conversación con un tono humorístico deliberado. Se distribuye como un adaptador PEFT (LoRA/DoRA) sobre el modelo base, junto con una versión fusionada (merged) del modelo. El repositorio aloja tanto la fase 1 (modelo base fusionado) como los adaptadores de la fase 2, que se actualizan de forma continua a medida que se completan los shards de entrenamiento.

El modelo parte de la arquitectura transformer densa de Qwen2.5-14B-Instruct, con 14.770.033.664 parámetros totales, y hereda su ventana de contexto de 32.000 tokens. El entrenamiento se ha realizado con QLoRA de 4 bits combinado con DoRA, sobre datos conversacionales curados con énfasis en humor, en una sola GPU y durante 39.000 pasos repartidos en 8 shards.

Su relevancia actual es limitada pero concreta: ofrece un ejemplo reproducible de fine-tuning eficiente en parámetros sobre un modelo de 14B en hardware modesto, y sirve como base para aplicaciones conversacionales donde se busque un tono desenfadado. No obstante, el estado de entrenamiento en curso y la falta de benchmarks publicados lo sitúan como un proyecto experimental más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen2.5), ajustado con PEFT (LoRA + DoRA) |
| Parametros totales | 14.770.033.664 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 32.000 tokens |
| Tipos de cuantizacion | Entrenamiento en QLoRA de 4 bits; el repo incluye pesos safetensors del modelo fusionado y adaptadores PEFT. No se especifican otros formatos (GGUF, etc.) |
| Idiomas soportados | Inglés (declarado en la model card); no se detallan otros idiomas |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (modelo fusionado y adaptadores PEFT) |

## Arquitectura y entrenamiento

El modelo se basa en Qwen2.5-14B-Instruct, un transformer denso de 14B parámetros con atención causal estándar y una ventana de contexto de 32.000 tokens. Sobre esta base se aplicó un ajuste fino con QLoRA de 4 bits combinado con DoRA (Weight-Decomposed Low-Rank Adaptation), usando el optimizador adamw_8bit y gradient checkpointing para reducir el consumo de memoria. El entrenamiento se realizó en una sola GPU, lo que constituye el principal atractivo técnico del proyecto: demuestra que es viable adaptar un modelo de 14B con recursos limitados.

Los datos de entrenamiento consisten en un conjunto conversacional curado y dividido en múltiples shards, con énfasis explícito en humor. El proceso se organizó en 39.000 pasos distribuidos en 8 shards. No se especifica el número total de tokens de entrenamiento ni la composición detallada del dataset, ni si se aplicaron técnicas de RLHF o DPO. La fase 2 sigue en curso: los adaptadores se actualizan a medida que se completan los shards, y el repositorio mantiene tanto los checkpoints intermedios (`checkpoint-*`) como versiones fusionadas parciales (`merged-sofar-*`) para trazabilidad.

## Capacidades

- Generación de texto conversacional multi-turno, con un tono humorístico deliberado como rasgo de personalidad.
- Razonamiento y respuesta a instrucciones heredados del modelo base Qwen2.5-14B-Instruct.
- Capacidades de código y matemáticas heredadas del base, aunque no se han validado específicamente tras el ajuste.
- Soporte de tool calling / function calling: no confirmado explícitamente en la información disponible; el modelo base Qwen2.5-14B-Instruct lo soporta, pero el fine-tune no lo declara.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la model card.
- Multilingüismo: el modelo se declara enfocado en inglés; el soporte de otros idiomas no está verificado.
- No se declaran capacidades de visión, audio ni modo de pensamiento (thinking mode).

## Casos de uso

- Asistente conversacional con tono desenfadado: el modelo puede gestionar diálogos multi-turno de hasta 32.000 tokens, adecuado para chatbots de entretenimiento o comunidades donde se busque un estilo humorístico consistente.
- Prototipado de fine-tunes sobre Qwen2.5: sirve como referencia reproducible para equipos que quieran adaptar un modelo de 14B con QLoRA y DoRA en una sola GPU, reutilizando la configuración de entrenamiento descrita.
- Generación de contenido creativo ligero: respuestas con humor para blogs, guiones breves o textos de marketing informal, aprovechando el sesgo de personalidad introducido en el entrenamiento.
- Investigación en personalidad y estilo: el modelo permite estudiar cómo el ajuste fino con datos humorísticos afecta al tono y la coherencia conversacional de un modelo base instruct.
- Base para experimentos de alineación: al estar en fase de entrenamiento activo, es útil para comparar checkpoints intermedios y analizar la evolución del estilo a lo largo de los shards.
- Despliegue experimental en entornos con una sola GPU: gracias a la cuantización de 4 bits, puede ejecutarse en hardware de gama alta de consumo para pruebas internas, no para producción crítica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 28-30 GB para los 14.770 millones de parámetros, más overhead de activaciones y caché KV.
- VRAM estimada en cuantización de 4 bits: aproximadamente 8-10 GB para los pesos, más overhead; viable en GPUs de consumo con 12-16 GB o más.
- GPUs recomendadas: A100 40/80 GB o H100 para FP16 con contexto largo; RTX 4090 (24 GB) para FP16 ajustado o 8 bits; RTX 3090/4080 (16-24 GB) para 4 bits.
- Cabe en GPU de consumo: sí, en cuantización de 4 bits, en tarjetas con al menos 12 GB de VRAM (por ejemplo, RTX 3060 12 GB, RTX 4070 Ti, RTX 4090).
- Opciones de despliegue: transformers con PEFT para cargar adaptadores; vLLM o TGI para servir el modelo fusionado; llama.cpp/Ollama requerirían conversión a GGUF, no documentada en el repo.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Zegrate AI (este modelo) | 14,77B | 32k | Apache 2.0 | Fine-tune DoRA de Qwen2.5-14B-Instruct, en entrenamiento, sin benchmarks |
| Qwen2.5-14B-Instruct | 14,7B | 32k | Apache 2.0 | Modelo base; benchmarks públicos disponibles; sin sesgo humorístico |
| Mistral-Nemo-Instruct-2407 | 12B | 128k | Apache 2.0 | Alternativa de tamaño similar con contexto mucho mayor |
| Llama-3.1-8B-Instruct | 8B | 128k | Llama 3.1 Community License | Menor tamaño, contexto mayor, licencia con restricciones |

## Limitaciones y advertencias

- Pesos en entrenamiento activo: la model card advierte de "rough edges" hasta que finalice la fase 2; no es apto para producción crítica en su estado actual.
- Sesgo humorístico deliberado: el tono puede no ser adecuado para contextos formales, atención al cliente seria o documentación técnica.
- Enfoque en inglés: el soporte de otros idiomas no está verificado y podría degradarse respecto al modelo base.
- Riesgo de alucinación: inherente a los modelos de 14B; el ajuste conversacional no lo mitiga y podría acentuarlo en respuestas humorísticas.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento tras el fine-tune frente al base.
- Licencia Apache 2.0: permite uso comercial, pero se heredan las condiciones del modelo base Qwen2.5; conviene revisar la licencia original.
- Tamaño del repositorio elevado (973,5 GB) por la acumulación de checkpoints y versiones fusionadas, lo que complica la descarga y el versionado.
- No se documentan salvaguardas adicionales de seguridad ni filtros de contenido.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yimn-Aghosh/zegrate-ai
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-14B-Instruct
- Repositorio de PEFT: https://github.com/huggingface/peft
- Paper de DoRA: https://arxiv.org/abs/2402.09353
- Paper de QLoRA: https://arxiv.org/abs/2305.14314
