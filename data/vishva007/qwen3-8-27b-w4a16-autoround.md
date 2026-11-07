# Vishva007/Qwen3.8-27B-W4A16-AutoRound

## Resumen

Qwen3.8-27B-W4A16-AutoRound es una versión cuantizada a 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Vishva007. Se trata de una conversión de pesos mediante el algoritmo AutoRound de Intel, que aplica cuantización de solo pesos (W4A16: pesos enteros de 4 bits, activaciones en 16 bits) con el objetivo de reducir drásticamente los requisitos de VRAM sin degradar en exceso la calidad. El resultado es un checkpoint que puede ejecutarse en una única GPU de 24 GB, frente a los aproximadamente 54 GB en BF16 que exige el modelo original.

El modelo conserva la pipeline `image-text-to-text`, por lo que mantiene capacidades de visión además de generación de texto. La torre visual se ha dejado deliberadamente en BF16 (`quant_nontext_module: False`) para preservar la precisión en razonamiento visual y OCR, y las capas de Multi-Token Prediction (`mtp`, `mtp.fc`) también se mantienen en `bfloat16`. La cuantización emplea tamaño de grupo 64, simetría activada, 512 muestras de calibración y 600 iteraciones de ajuste.

Es relevante porque democratiza el despliegue de un VLM de gran tamaño en hardware de consumo: permite servir el modelo con vLLM en una RTX 3090, RTX 4090 o A5000, manteniendo tool calling estructurado, decodificación especulativa y razonamiento separado según los despliegues de la comunidad. La licencia Apache 2.0 facilita su uso comercial, aunque conviene verificar las condiciones del modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (texto + visión); etiqueta `qwen3_5` en Hugging Face |
| Parametros totales | 3.029.765.360 (según safetensors del repo cuantizado) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el ejemplo de vLLM usa `--max-model-len 4096`) |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), grupo 64, simétrico; torre visual y capas MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (AutoRound/GPTQ) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base Qwen/Qwen3.8-27B, del que no se detallan en la información disponible los datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO). La arquitectura subyacente es un transformer multimodal con torre visual, etiquetado como `qwen3_5` en los metadatos, y con capas de Multi-Token Prediction (MTP) que se preservan en BF16 durante la cuantización.

La innovación técnica principal de este repo es el proceso de cuantización con AutoRound de Intel: calibración con 512 muestras, 600 iteraciones de ajuste, grupo de 64 (mayor fidelidad de reconstrucción que el estándar 128) y simetría activada. Se excluye de la cuantización la torre visual para no degradar OCR y razonamiento visual, y se mantienen en precisión nativa las capas MTP. El resultado son pesos de 4 bits con activaciones de 16 bits, compatibles con backends como vLLM (`--quantization auto-round` o `gptq`).

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes y texto (`image-text-to-text`), con torre visual en BF16 para preservar OCR y razonamiento visual.
- Tool calling / function calling estructurado (soportado en despliegues comunitarios con vLLM).
- Razonamiento separado (*separated reasoning*), según el despliegue de referencia en GitHub.
- Decodificación especulativa compatible en configuraciones con vLLM.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo *thinking*: no confirmado explícitamente en la información disponible.

## Casos de uso

- Asistente multimodal en una sola GPU de 24 GB: desplegar el modelo con vLLM en una RTX 4090 para responder consultas que combinan imagen y texto (documentos escaneados, capturas, diagramas), aprovechando que la torre visual permanece en BF16.
- Extracción de datos de documentos (OCR + razonamiento): procesar facturas, formularios o tickets con la torre visual sin cuantizar, reduciendo el riesgo de errores de lectura frente a una cuantización completa.
- Agente con tool calling en producción: integrar el modelo en un pipeline de agentes que invoque APIs externas mediante function calling estructurado, servido por una API compatible con OpenAI.
- Atención al cliente automatizada: gestionar conversaciones multi-turno con contexto configurable (el ejemplo oficial usa 4096 tokens) en infraestructura de una sola GPU consumer.
- Asistente de código y análisis técnico: generar y revisar código o explicar fragmentos, con la ventaja de poder adjuntar capturas de errores o diagramas de arquitectura.
- Despliegue de bajo coste en cloud con GPU única: usar plantillas de RunPod (A5000, RTX 4090) para levantar el servicio sin necesidad de nodos multi-GPU de 80 GB.
- Prototipado e investigación de cuantización: servir como referencia reproducible de AutoRound W4A16 grupo 64 sobre un VLM, comparando calidad frente al modelo BF16.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

Los únicos datos de rendimiento aportados por el autor son de memoria: aproximadamente 54 GB de VRAM en BF16 para el modelo original frente a 16–18 GB para la versión cuantizada W4A16 grupo 64, con una mejora de velocidad de decodificación atribuida a la reducción del cuello de botella de ancho de banda de memoria. No se proporcionan cifras de tokens por segundo ni latencias.

## Requisitos de hardware

- VRAM estimada: 16–18 GB para el checkpoint W4A16 grupo 64 (según el autor); el modelo BF16 original requiere ~54 GB.
- GPU recomendadas: RTX 3090, RTX 4090 o A5000 de 24 GB para una sola tarjeta; A100/H100 para mayor throughput o contextos largos.
- Cabe en GPU consumer: sí, en RTX 3090/4090 (24 GB) y, con margen ajustado, en tarjetas de 24 GB en general.
- Despliegue: vLLM (`--quantization auto-round`, `--dtype bfloat16`, `--gpu-memory-utilization 0.90`); backends GPTQ compatibles (`--quantization gptq`). Existe un despliegue Docker comunitario para 2x RTX 3090 con API compatible con OpenAI, CUDA graphs compiladas y decodificación especulativa.
- Latencia y throughput: no disponibles; el autor solo indica una mejora cualitativa en velocidad de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B-W4A16-AutoRound (este) | 3.029.765.360 en safetensors del repo cuantizado | no disponible | W4A16 grupo 64 | apache-2.0 | Hugging Face |
| Qwen/Qwen3.8-27B (base) | no disponible | no disponible | BF16 (~54 GB VRAM) | no disponible en la información | Hugging Face |
| Vishva007/Qwen3.8-27B-W4A16-AutoRound-GPTQ | no disponible | no disponible | W4A16 en formato GPTQ | no disponible en la información | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación de calidad respecto al modelo BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- El número de parámetros reportado por safetensors (3.029.765.360) no concuerda con la denominación "27B" del modelo base; conviene verificar los metadatos antes de dimensionar infraestructura.
- La torre visual y las capas MTP se mantienen en BF16, por lo que el ahorro de VRAM es menor que en una cuantización integral.
- No hay información sobre idiomas soportados ni sobre sesgos conocidos del modelo base.
- Riesgo de alucinación inherente a los modelos generativos; no se documentan mitigaciones específicas.
- La licencia del repo es Apache 2.0, pero debe confirmarse que el modelo base Qwen/Qwen3.8-27B permite uso comercial en los mismos términos.
- El README incluye enlaces de afiliado y plantillas de terceros (RunPod); no forman parte del modelo y deben tratarse con cautela.
- No se especifica la longitud de contexto nativa; el ejemplo de despliegue limita a 4096 tokens, lo que puede ser insuficiente para casos de contexto largo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Vishva007/Qwen3.8-27B-W4A16-AutoRound
- Variante GPTQ: https://huggingface.co/Vishva007/Qwen3.8-27B-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AutoRound (Intel): https://github.com/intel/auto-round
- Repositorio Qwen: https://github.com/QwenLM/Qwen
- Despliegue comunitario 2x3090: https://github.com/tonyd2wild/Qwen3.8-27B-DFLASH2-AutoRound-W4A16-2x3090
