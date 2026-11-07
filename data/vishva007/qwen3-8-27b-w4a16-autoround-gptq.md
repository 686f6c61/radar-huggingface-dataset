# Vishva007/Qwen3.8-27B-W4A16-AutoRound-GPTQ

## Resumen

Qwen3.8-27B-W4A16-AutoRound-GPTQ es una versión cuantizada a 4 bits del modelo multimodal Qwen/Qwen3.8-27B, publicada por el usuario Vishva007. La cuantización se ha realizado con el algoritmo AutoRound de Intel en configuración W4A16 (pesos de 4 bits, activaciones de 16 bits), con tamaño de grupo 64, calibración simétrica y 512 muestras de calibración durante 600 iteraciones de ajuste. El objetivo es reducir los requisitos de memoria del modelo original en BF16 (unos 54 GB de VRAM) hasta unos 16-18 GB, permitiendo su ejecución en una única GPU de consumo de 24 GB.

El modelo base pertenece a la familia Qwen3.8 y está orientado a tareas image-text-to-text, es decir, razonamiento visual, OCR y conversación multimodal. La cuantización preserva la torre de visión en BF16 (parámetro `quant_nontext_module=False`) para no degradar la precisión en reconocimiento de texto en imágenes, y mantiene las capas de Multi-Token Prediction (`mtp`, `mtp.fc`) en bfloat16 nativo.

Es relevante ahora porque permite desplegar un VLM de gran tamaño en hardware asequible (RTX 3090, RTX 4090, A5000) manteniendo el pipeline multimodal intacto, con soporte para vLLM mediante `--quantization auto-round` o `gptq`. El repositorio acumula más de 13.000 descargas y dispone de licencia Apache 2.0, lo que facilita su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (VLM) con torre de visión y capas de Multi-Token Prediction (mtp); familia Qwen3.8 |
| Parametros totales | 3.029.765.360 (según safetensors del repo cuantizado); el modelo base se denomina 27B, dato no verificado en la información disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el ejemplo de despliegue usa `--max-model-len 4096` |
| Tipos de cuantizacion | W4A16 (4 bits pesos, 16 bits activaciones), grupo 64, simétrico; torre de visión y capas MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (GPTQ / AutoRound) |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia Qwen3.8 con pipeline `image-text-to-text`: incorpora una torre de visión para procesar imágenes junto con el decoder de lenguaje. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron fases de RLHF o DPO. Sí se confirma la presencia de capas de Multi-Token Prediction (`mtp`, `mtp.fc`), una innovación orientada a acelerar la decodificación mediante predicción de varios tokens por paso.

La aportación de este repositorio es exclusivamente la cuantización. Se ha aplicado AutoRound de Intel con 512 muestras de calibración y 600 iteraciones de ajuste, grupo de 64 (mayor fidelidad de reconstrucción que el estándar 128) y cuantización simétrica. La torre de visión se mantiene en BF16 de forma deliberada para preservar el razonamiento visual y la precisión de OCR, y las capas MTP también se conservan en bfloat16 nativo. El resultado es un checkpoint que reduce el peso en memoria de ~54 GB a ~16-18 GB, con la consiguiente mejora en velocidad de decodificación al aliviar el cuello de botella de ancho de banda de memoria.

## Capacidades

- Generación de texto conversacional multi-turno.
- Procesamiento de imagen y texto combinados (image-text-to-text): descripción de imágenes, respuesta a preguntas visuales y OCR.
- Razonamiento visual preservado gracias a la torre de visión en BF16.
- Tool calling estructurado y function calling, según el despliegue documentado en el repositorio de GitHub asociado.
- Decodificación especulativa y separación del razonamiento (reasoning) en el stack de despliegue de referencia.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Digitalización de documentos con OCR: la torre de visión en BF16 permite extraer texto de facturas, formularios y escaneos con menor degradación que si se cuantizara también el encoder visual.
- Asistencia visual para accesibilidad: describir imágenes y responder preguntas sobre su contenido en conversaciones multi-turno, ejecutándose en una sola GPU de 24 GB.
- Moderación de contenido multimedia: clasificación y análisis de imágenes acompañadas de texto en pipelines de revisión, con la latencia reducida que aporta la cuantización W4A16.
- Agentes con tool calling: integración en flujos de automatización donde el modelo invoca funciones externas (APIs, bases de datos) y separa el razonamiento de la respuesta final, según el stack vLLM documentado.
- Análisis de capturas de pantalla y UI: interpretación de interfaces para testing automatizado o generación de documentación, aprovechando la precisión de OCR conservada.
- Despliegue en estaciones de trabajo con una RTX 4090 o A5000: prototipado y evaluación de un VLM de gran tamaño sin necesidad de clústeres multi-GPU ni A100/H100.
- Servicio de inferencia con vLLM: exposición de una API compatible con OpenAI para aplicaciones internas, con `--quantization auto-round`, `--dtype bfloat16` y `--gpu-memory-utilization 0.90`.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente reporta métricas de memoria: ~54 GB de VRAM para el modelo original en BF16 frente a ~16-18 GB para esta versión cuantizada, con una mejora de velocidad de decodificación atribuida a la reducción del cuello de botella de ancho de banda.

## Requisitos de hardware

- VRAM estimada: ~16-18 GB para la versión W4A16 con grupo 64.
- GPU recomendadas: RTX 3090, RTX 4090, A5000 (24 GB) para una sola tarjeta; A100 o A6000 de 80 GB para el modelo original en BF16.
- Cabe en GPU de consumo: sí, en RTX 3090 y RTX 4090 con 24 GB.
- Despliegue multi-GPU: existe un stack Docker orientado a producción para dos RTX 3090 (con NVLink o solo PCIe) con vLLM, CUDA graphs compilados, decodificación especulativa, visión, tool calling estructurado y razonamiento separado.
- Opciones de despliegue: vLLM (`--quantization auto-round` o `--quantization gptq`); no se documentan opciones llama.cpp, Ollama ni TGI en la información disponible.
- Latencia y throughput: no disponibles; la model card solo indica una mejora cualitativa en la velocidad de decodificación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | VRAM | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-27B-W4A16-AutoRound-GPTQ (este) | 3.029.765.360 según safetensors del repo | no disponible | W4A16, grupo 64 | ~16-18 GB | apache-2.0 | Hugging Face, 13.269 descargas |
| Qwen/Qwen3.8-27B (base, BF16) | 27B (denominación; no verificado) | no disponible | ninguna (BF16) | ~54 GB | apache-2.0 | Hugging Face |
| Qwen3.8-27B-DFLASH2-AutoRound-W4A16-2x3090 | mismo base cuantizado | no disponible | W4A16 + DFlash2 | 2 x 24 GB | no disponible | GitHub (stack de despliegue) |

La comparación con alternativas de otros desarrolladores no está disponible en la información proporcionada.

## Limitaciones y advertencias

- La cuantización a 4 bits introduce degradación de precisión respecto al modelo BF16; no se han publicado evaluaciones que cuantifiquen esa pérdida.
- Existe una discrepancia entre la denominación "27B" del modelo base y los 3.029.765.360 parámetros reportados en los safetensors del repositorio cuantizado; conviene verificar el tamaño real antes de planificar el hardware.
- La longitud de contexto no está documentada; el ejemplo de la model card limita `--max-model-len` a 4096, muy por debajo de lo habitual en modelos actuales.
- Los idiomas soportados no están especificados.
- Riesgo de alucinación inherente a los modelos generativos, no cuantificado en la información disponible; en tareas de OCR y análisis visual conviene validar las salidas.
- Sesgos conocidos: no disponibles en la información proporcionada.
- La licencia Apache 2.0 permite uso comercial, pero el repositorio no ofrece garantías ni soporte del autor de la cuantización.
- La model card incluye enlaces de afiliado a RunPod y plantillas de despliegue de terceros; deben tratarse como promoción y no como parte técnica del modelo.
- El soporte de backend depende de que vLLM reconozca el formato AutoRound/GPTQ con grupo 64; verificar compatibilidad de versión antes de producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vishva007/Qwen3.8-27B-W4A16-AutoRound-GPTQ
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- AutoRound (Intel): https://github.com/intel/auto-round
- Repositorio Qwen: https://github.com/QwenLM/Qwen
- Stack de despliegue en 2x RTX 3090: https://github.com/tonyd2wild/Qwen3.8-27B-DFLASH2-AutoRound-W4A16-2x3090
- RunPod (enlace de afiliado presente en la model card): https://runpod.io?ref=iabrlp7z
