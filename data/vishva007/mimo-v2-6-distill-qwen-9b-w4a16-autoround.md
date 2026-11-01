# Vishva007/MiMo-V2.6-Distill-Qwen-9B-W4A16-AutoRound

## Resumen

MiMo-V2.6-Distill-Qwen-9B-W4A16-AutoRound es una versión cuantizada a 4 bits de los pesos del modelo XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, publicada por el usuario Vishva007. Se trata de un checkpoint multimodal de tipo image-text-to-text orientado a tareas agénticas, generación de código y uso de herramientas, derivado de la familia Qwen (tag `qwen3_5` en el repositorio) y destilado por Xiaomi. La cuantización se ha realizado con AutoRound/SignRound en esquema W4A16, manteniendo en `bfloat16` nativo los módulos no textuales (codificador visual) y las capas de Multi-Token Prediction (MTP).

El objetivo del checkpoint es reducir de forma drástica el consumo de VRAM frente al modelo original en `bfloat16`, preservando las capacidades de razonamiento agéntico, tool calling y decisión multimodal. La model card indica que los módulos `mtp`, `mtp.fc` y `visual` se conservan sin cuantizar para mantener la fidelidad del razonamiento y la ejecución especulativa.

El repositorio declara licencia MIT, pipeline `image-text-to-text`, y está pensado para servirse con vLLM habilitando decodificación especulativa por MTP, parser de tool calling `qwen3_coder` y parser de razonamiento `qwen3`. El número de parámetros reportado en los safetensors es de 2.491.309.296, un dato que conviene contrastar con el tamaño nominal de 9B del nombre del modelo, ya que la cifra real del checkpoint cuantizado difiere notablemente de esa denominación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) derivada de Qwen, con capas MTP; tag de arquitectura `qwen3_5` |
| Parametros totales | 2.491.309.296 según safetensors del checkpoint cuantizado; el nombre del modelo indica 9B (dato del modelo base, no verificado en el repo) |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 32.768 tokens en el ejemplo de despliegue vLLM (`--max-model-len 32768`); no se especifica el máximo nativo del modelo base |
| Tipos de cuantizacion | W4A16 (pesos 4 bits, activaciones 16 bits), AutoRound/SignRound, `sym=True`, `group_size=32`, `iters=1000`; módulos `mtp`, `mtp.fc` y `visual` en `bfloat16` |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El checkpoint es una cuantización del modelo base XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B, que combina un codificador visual con un modelo de lenguaje derivado de la familia Qwen y capas de Multi-Token Prediction (MTP) para decodificación especulativa. La cuantización se aplica únicamente a los módulos textuales; el codificador visual y las capas MTP se conservan en `bfloat16` para no degradar la percepción multimodal ni la predicción especulativa.

El proceso de cuantización emplea AutoRound/SignRound con 1000 iteraciones, simetría activada y `group_size=32`, calibrado con 512 muestras de longitud de secuencia 2048 (`batch_size=2`, `gradient_accumulate_steps=4`). No se detallan en la información disponible los datos de entrenamiento del modelo base (número de tokens, composición del dataset, uso de RLHF/DPO), por lo que esos datos deben consultarse en la model card del modelo original de Xiaomi.

## Capacidades

- Generación de texto y razonamiento, con modo de pensamiento controlable mediante `enable_thinking` en la plantilla de chat.
- Generación de código, según los tags `code` y el parser de tool calling `qwen3_coder`.
- Tool calling / function calling, con soporte nativo en vLLM mediante `--enable-auto-tool-choice` y `--tool-call-parser qwen3_coder`.
- Comportamiento agéntico y razonamiento multi-paso (tag `agentic`).
- Capacidades multimodales de entrada imagen-texto (pipeline `image-text-to-text`), con codificador visual preservado en `bfloat16`.
- Decodificación especulativa mediante MTP (`--speculative-config '{"method":"mtp","num_speculative_tokens":1}'`).
- Consulta estructurada de decisión sobre imágenes mediante el endpoint `/v1/systemone` descrito en la model card (preguntas con tipo `choice`, instrucciones y criterios).
- Capacidades multilingües: no disponible.

## Casos de uso

- Agentes de automatización con tool calling: el checkpoint puede servirse en vLLM con `--enable-auto-tool-choice` y el parser `qwen3_coder`, de modo que el modelo emita llamadas a funciones estructuradas en pipelines de agentes multi-paso.
- Asistentes de código en producción: gracias al tag `code` y al soporte de razonamiento con `enable_thinking`, puede integrarse en flujos de revisión, generación y corrección de código con contexto de hasta 32.768 tokens.
- Inspección visual estructurada: el endpoint `/v1/systemone` permite formular preguntas de tipo elección sobre una imagen (por ejemplo, verificar la presencia de un objeto) y obtener una respuesta con criterios definidos, útil en pipelines de validación de imágenes.
- Clasificación y decisión multimodal en batch: el uso de `--enable-chunked-prefill`, `--enable-prefix-caching` y `--max-num-seqs 128` en el ejemplo de vLLM sugiere un despliegue orientado a alto throughput para procesar lotes de imágenes con preguntas estructuradas.
- Razonamiento con contexto largo: la ventana de 32.768 tokens y la caché KV en `fp8` permiten gestionar conversaciones multi-turno o documentos extensos en tareas de análisis.
- Despliegue con recursos limitados: al ser una cuantización W4A16, reduce el peso de los pesos textuales frente al modelo en `bfloat16`, lo que facilita su ejecución en GPUs con menos VRAM que las necesarias para el modelo original.
- Inferencia de baja latencia con decodificación especulativa: las capas MTP preservadas en `bfloat16` permiten activar `num_speculative_tokens=1` para acelerar la generación en vLLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El repositorio ocupa 9,0 GB, lo que da una referencia del peso en disco de los pesos cuantizados; a ello hay que sumar la caché KV y el overhead de ejecución.
- El ejemplo de la model card usa `--gpu-memory-utilization 0.90` y `--kv-cache-dtype fp8`, sin especificar la GPU concreta.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada; el tamaño del repo (9,0 GB) sugiere que podría caber en GPUs de consumo con 16 GB o más de VRAM, pero no hay dato oficial que lo respalde.
- Opciones de despliegue: vLLM es el motor documentado en la model card (con `--trust-remote-code`, `--dtype bfloat16`, `--enable-prefix-caching`, `--enable-chunked-prefill`, `--max-num-batched-tokens 12288`, `--max-num-seqs 128`). No se documentan llama.cpp, Ollama ni TGI para este checkpoint.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| Vishva007/MiMo-V2.6-Distill-Qwen-9B-W4A16-AutoRound | 2.491.309.296 (safetensors del checkpoint) | 32.768 (config vLLM) | W4A16 AutoRound | MIT | Checkpoint cuantizado multimodal con MTP preservado |
| XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B | no disponible | no disponible | bfloat16 (original) | no disponible en esta ficha | Modelo base sin cuantizar |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | No se dispone de datos de otros modelos comparables en la información proporcionada |

## Limitaciones y advertencias

- La cuantización W4A16 puede introducir degradación en la calidad de generación y razonamiento respecto al modelo base en `bfloat16`; no se aportan métricas de esa pérdida.
- Existe una discrepancia entre el nombre del modelo (9B) y el recuento real de parámetros en safetensors (2.491.309.296); conviene verificar el contenido real del checkpoint antes de dimensionar el despliegue.
- El repositorio tiene muy pocas descargas (40) y ningún "like", y está publicado por un usuario individual, no por el equipo de Xiaomi; no es un checkpoint oficial del autor del modelo base.
- La model card incluye enlaces de afiliado a RunPod, lo que conviene tener en cuenta al evaluar la independencia de la documentación.
- No se especifican los idiomas soportados, por lo que el rendimiento multilingüe es incierto.
- El endpoint `/v1/systemone` y el parser `qwen3_coder` requieren versiones de vLLM posteriores a la 0.32.0 según la model card; en versiones anteriores puede no funcionar.
- El uso de `--trust-remote-code` implica ejecutar código del repositorio; debe revisarse en entornos de producción.
- No se documentan sesgos conocidos ni tasas de alucinación.
- La licencia MIT permite uso comercial, pero al derivar de un modelo base de Xiaomi conviene revisar también las condiciones del modelo original.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vishva007/MiMo-V2.6-Distill-Qwen-9B-W4A16-AutoRound
- Modelo base: https://huggingface.co/XiaomiMiMo/MiMo-V2.6-Distill-Qwen-9B
- RunPod (enlace de afiliado incluido en la model card): https://runpod.io?ref=iabrlp7z
