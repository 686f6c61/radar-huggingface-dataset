# xv0y5ncu/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GLQ-trellis-3inst-3bpw

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GLQ-trellis-3inst-3bpw es una cuantización de 3,0 bits por peso del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, publicada por el usuario `xv0y5ncu`. No se trata de un modelo nuevo, sino de un checkpoint comprimido que aplica GLQ (trellis-coded quantization con codebook QTIP, variante `3inst`, más transformada de Hadamard aleatorizada y LDLQ) sobre los pesos originales en BF16. El objetivo es reducir drásticamente el espacio en memoria y el ancho de banda necesario para servir un modelo de tipo mezcla de expertos sin reentrenar.

El modelo base es un transformer híbrido de la familia Nemotron 3.5 de NVIDIA, con arquitectura `nemotron_h` (capas Mamba combinadas con atención y expertos enrutados). El checkpoint cuantizado declara 7.863.535.360 parámetros almacenados en safetensors, aunque el nombre comercial del modelo base indica 30B totales con aproximadamente 3B activos por token. La ventana de contexto declarada alcanza los 262.144 tokens, según la configuración de ejemplo de la model card.

La relevancia de esta ficha reside en que permite ejecutar un MoE de gran tamaño con un presupuesto de VRAM mucho menor que su versión BF16, siempre que se use la versión correcta del runtime `glq` (≥ 0.8.32) y se mantenga `bfloat16` como tipo de cómputo. La model card advierte explícitamente de que versiones anteriores producen salidas incoherentes y de que fp16 desactiva el razonamiento del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido `nemotron_h` (Mamba + atención + mezcla de expertos) |
| Parametros totales | 7.863.535.360 almacenados en safetensors; el modelo base se denomina 30B-A3B |
| Parametros activos | Aproximadamente 3B por token (según nomenclatura del modelo base) |
| Longitud de contexto | 262.144 tokens (declarado en la configuración de ejemplo) |
| Tipos de cuantizacion | GLQ 3,0 bits/peso (trellis-coded QTIP `3inst` + RHT + LDLQ); SQNR medio de pesos 15,33 dB sobre 1298 capas |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (etiquetada como `other` en los tags) |
| Formato de pesos | safetensors (decodificación en vuelo mediante kernel CUDA fusionado) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, que emplea la arquitectura `nemotron_h`: un diseño híbrido que combina capas Mamba (state space models) con capas de atención y una mezcla de expertos enrutada. Los pesos cuantizados permanecen comprimidos en memoria y se decodifican al vuelo mediante un kernel CUDA fusionado, lo que evita materializar los pesos en BF16 durante la inferencia.

La cuantización usa trellis-coded quantization (QTIP TCQ, variante `3inst`) con un codebook entrenado, una transformada de Hadamard aleatorizada (RHT) y LDLQ, a una tasa uniforme de 3,0 bpw sin apilamiento de residuos. La calibración se realizó con 128 muestras de 2048 tokens de WikiText-2. No se dispone de información sobre el entrenamiento original del modelo base (número de tokens, composición del dataset, RLHF/DPO) en la información proporcionada; los datasets referenciados en los tags son `nvidia/nemotron-post-training-v3` y `nvidia/nemotron-pre-training-datasets`.

## Capacidades

- Generación de texto conversacional en inglés, español, francés, alemán, italiano y japonés.
- Modo de razonamiento (`<think>`) activado por defecto en la plantilla de chat del modelo base.
- Generación de código, según la existencia de un wrapper `glq-code` que fija parámetros de muestreo (temperatura 1,0, top_p 0,95).
- Razonamiento multi-paso mediante el bloque de pensamiento antes de la respuesta final.
- Soporte de contexto largo de hasta 262.144 tokens para prompt más generación.
- Compatibilidad con vLLM mediante el plugin de cuantización `glq`.
- Integración con Transformers a través de `glq[hf]` (requiere `transformers` y `accelerate`).
- No se documenta soporte explícito de tool calling, function calling ni visión en la información disponible.

## Casos de uso

- Servicio de chat multi-turno con contexto largo: el modelo puede mantener conversaciones extensas gracias a su ventana de 262.144 tokens, útil en asistentes que necesitan recordar documentación o historial prolongado.
- Generación de código asistida: el wrapper `glq-code` fija temperatura y top_p adecuados para tareas de programación, y el modo de razonamiento permite resolver problemas de varios pasos antes de emitir el código.
- Razonamiento documental: el bloque `<think>` permite al modelo descomponer preguntas complejas sobre textos largos antes de responder, adecuado para análisis de informes o contratos.
- Despliegue en hardware limitado mediante offload de expertos: con `--cpu-offload-params experts` y el backend `uva`, los expertos no enrutados permanecen en RAM host y solo se transfieren cuando se seleccionan, lo que permite servir el modelo en GPUs con menos VRAM.
- Atención al cliente multilingüe: el soporte de seis idiomas (en, es, fr, de, it, ja) permite atender usuarios en varios mercados con un único checkpoint.
- Investigación sobre cuantización extrema: el checkpoint sirve como referencia reproducible para evaluar la calidad de GLQ a 3,0 bpw en arquitecturas híbridas Mamba-MoE, con métricas de SQNR publicadas.
- Evaluación comparativa de MoE cuantizados: útil para medir el impacto de la cuantización en tareas de razonamiento y generación frente al modelo base BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta el SQNR medio de pesos de 15,33 dB sobre 1298 capas cuantizadas, que es una métrica de fidelidad de cuantización, no de calidad de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio ocupa 15,7 GB, por lo que los pesos cuantizados caben en GPUs de 24 GB con margen para la caché KV; con contexto completo de 262.144 tokens la reserva de KV crece y puede requerir GPUs de 40-80 GB o el uso de offload.
- GPU recomendadas: A100 40/80 GB, H100 80 GB para contexto completo y concurrencia; RTX 4090 24 GB para contexto moderado.
- Cabe en GPU de consumo: sí, en RTX 4090 24 GB con pesos en VRAM y contexto reducido; el offload de expertos permite bajar aún más el requisito de VRAM a costa de velocidad de decodificación.
- Opciones de despliegue: vLLM con `quantization="glq"` (recomendado), Transformers con `glq[hf]` y `device_map="auto"`, y offload de pesos con `--offload-backend uva --cpu-offload-gb 24 --cpu-offload-params experts` en vLLM ≥ 0.30.0.
- Latencia y throughput: no disponibles; la model card indica que el offload de expertos no se ha medido en este checkpoint concreto.
- Requisito crítico: `glq >= 0.8.32` y `dtype="bfloat16"`; con fp16 el modelo omite el razonamiento y responde directamente, y con versiones anteriores de `glq` las capas Mamba se cargan con ceros.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GLQ-trellis-3inst-3bpw | 7,86B almacenados (base 30B-A3B) | 262.144 | GLQ 3,0 bpw | openmdw-1.1 | Hugging Face |
| nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16 | 30B-A3B | no disponible | BF16 | openmdw-1.1 | Hugging Face |
| Otros MoE cuantizados de la familia Nemotron | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks que permitan comparar el rendimiento de este checkpoint con alternativas de la misma categoría.

## Limitaciones y advertencias

- Requiere `glq >= 0.8.32`; versiones anteriores cargan las proyecciones de entrada de las capas Mamba como ceros y generan texto fluido pero sin sentido en vLLM, y no pueden cargar los expertos trellis en Transformers.
- Debe usarse `bfloat16`; en fp16 el modelo cierra el bloque `<think>` de inmediato y responde sin razonar, sin errores ni NaN, lo que degrada su calidad de forma silenciosa.
- El razonamiento está activado por defecto; la plantilla de chat abre un bloque `<think>`, lo que incrementa el consumo de tokens de salida.
- La cuantización a 3,0 bpw introduce pérdida de fidelidad respecto al modelo BF16; el SQNR medio de 15,33 dB no garantiza paridad de calidad en todas las tareas.
- Riesgo de alucinación inherente al modelo base; no se documentan evaluaciones específicas de factualidad en esta información.
- La licencia openmdw-1.1 debe revisarse para uso comercial; la model card la etiqueta como `other` y enlaza a los términos en openmdw.ai.
- No se documenta soporte de tool calling, function calling ni visión, por lo que no debe asumirse en producción.
- El offload de expertos con `uva` no se ha medido en este checkpoint concreto; el rendimiento puede diferir de las mediciones en otros modelos MoE de GLQ.
- `--max-model-len` y `--max-num-seqs` compiten por la caché KV; a contexto completo la concurrencia se reduce aproximadamente a `KV pool ÷ max-model-len`.

## Enlaces

- Hugging Face: https://huggingface.co/xv0y5ncu/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GLQ-trellis-3inst-3bpw
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Repositorio GLQ: https://github.com/cnygaard/glq
- Paper de referencia (arXiv:2406.11235): https://arxiv.org/abs/2406.11235
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Dataset de pre-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
