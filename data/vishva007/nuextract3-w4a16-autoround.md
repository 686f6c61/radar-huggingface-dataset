# Vishva007/NuExtract3-W4A16-AutoRound

## Resumen

NuExtract3-W4A16-AutoRound es una compilación cuantizada en 4 bits del modelo multimodal numind/NuExtract3, orientado a la comprensión de documentos, OCR y extracción estructurada de información a partir de imágenes. La cuantización la firma el usuario Vishva007 (no el equipo de NuMind) y emplea el algoritmo Intel AutoRound en su versión 0.14.2, con un esquema W4A16 (pesos en enteros de 4 bits, activaciones en 16 bits), tamaño de grupo 32 y cuantización simétrica.

El modelo conserva la torre de visión en BF16 y los módulos de predicción multi-token (`mtp`, `mtp.fc`) en bfloat16 nativo, de modo que la pérdida de precisión se concentra en las capas de texto mientras se preserva la calidad del análisis visual y del OCR. Con 1.541.787.136 parámetros totales y un repositorio de 4,5 GB, la compilación reduce el requisito de VRAM de aproximadamente 9-11 GB en BF16 a unos 2,8-3,5 GB, lo que permite ejecutarla en GPU de consumo de 4 y 6 GB.

Es relevante ahora porque abarata el despliegue en producción de un extractor de documentos con salida JSON guiada por plantilla, sin renunciar al pipeline de imagen a texto. La licencia Apache 2.0 del modelo base facilita su integración comercial, aunque la información disponible sobre idiomas y evaluación es escasa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (visión-lenguaje) de la familia qwen3_5, con torre de visión y módulos de predicción multi-token (MTP); pesos cuantizados con compressed-tensors |
| Parametros totales | 1.541.787.136 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible en la model card; el ejemplo de servicio de vLLM fija `--max-model-len 16384` |
| Tipos de cuantizacion | W4A16 (4 bits en pesos, 16 bits en activaciones), grupo 32, simétrico; torre de visión y módulos MTP en BF16 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors); existen variantes AutoGPTQ y LLM-Compressor compatibles con vLLM |

## Arquitectura y entrenamiento

El modelo base es un transformer multimodal de la familia qwen3_5 que combina una torre de visión con un decodificador de lenguaje e incorpora módulos de predicción multi-token (MTP). La compilación cuantizada mantiene la torre de visión (`quant_nontext_module`) en BF16 para no degradar el parseo de documentos ni la precisión del OCR, y deja `mtp` y `mtp.fc` en bfloat16 nativo. Solo las capas de texto se convierten a W4A16 con cuantización simétrica por grupos de 32.

El proceso de cuantización emplea Intel AutoRound 0.14.2 con 512 muestras de calibración, longitud de secuencia 4096 y 1000 iteraciones de ajuste. No se dispone de información sobre el volumen de tokens de entrenamiento del modelo original, la composición del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco se documentan innovaciones adicionales de decodificación más allá de los módulos MTP heredados del modelo base.

## Capacidades

- Extracción estructurada de información: genera JSON conforme a una plantilla definida por el usuario (por ejemplo, número de factura, fecha, total y líneas de detalle).
- OCR y conversión a Markdown: modo `markdown` para transcribir el contenido de una imagen de documento.
- Comprensión de documentos visuales: recibida como entrada de imagen en un pipeline `image-text-to-text`.
- Procesamiento por lotes de imágenes en una misma petición: el ejemplo de vLLM admite hasta 10 imágenes por prompt (`--limit-mm-per-prompt '{"image": 10, "video": 0}'`).
- Control de modo de razonamiento mediante `chat_template_kwargs` (`enable_thinking`), activable o desactivable por petición.
- Conversación multi-turno: la etiqueta `conversational` figura entre las del repositorio.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Capacidades de agente y razonamiento multi-paso: no disponibles en la información proporcionada.
- Cobertura multilingüe: no disponible.
- Entrada de vídeo: no soportada en la configuración de servicio de referencia (`"video": 0`).

## Casos de uso

- Digitalización de facturas y albaranes: se envía la imagen del documento junto con una plantilla JSON que describe los campos esperados y el modelo devuelve el objeto estructurado listo para volcar en un ERP, con temperatura baja (0,2) para maximizar la determinación de la salida.
- Extracción de datos de contratos y pólizas: la plantilla permite declarar campos anidados y listas, de modo que se pueden capturar cláusulas, partes firmantes e importes en una sola pasada sobre el escaneo.
- Conversión de PDFs escaneados a Markdown para RAG: el modo `markdown` produce texto enriquecido que después se trocea e indexa en un almacén vectorial, evitando pipelines OCR separados.
- Procesamiento de formularios y tickets en dispositivos de borde: con 2,8-3,5 GB de VRAM en W4A16, el modelo cabe en GPU de consumo de 4 y 6 GB, lo que habilita la extracción en estaciones de trabajo locales sin enviar documentos sensibles a la nube.
- Enriquecimiento de archivos documentales a escala: el despliegue con vLLM y el formato compressed-tensors permiten servir el modelo con batching continuo y procesar lotes de hasta 10 imágenes por petición.
- Automatización de back office contable: la salida JSON guiada por plantilla encaja en pipelines de validación y conciliación, donde cada campo extraído se contrasta con reglas de negocio antes de su registro.
- Anonimización y triaje previo: la transcripción a Markdown permite localizar y clasificar datos personales en documentos antes de derivarlos a otros sistemas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en BF16 (modelo base): aproximadamente 9-11 GB.
- VRAM estimada en W4A16 con grupo 32: aproximadamente 2,8-3,5 GB, según la model card.
- GPU de consumo: funciona con holgura en tarjetas de 4 y 6 GB; en RTX 4090 o superiores queda margen amplio para lotes y contexto extendido.
- GPU de centro de datos: A100 y H100 son adecuadas para servir múltiples réplicas o lotes grandes; no hay cifras de throughput publicadas.
- Despliegue recomendado: vLLM con `--trust-remote-code`, `--generation-config vllm`, `--max-model-len 16384`, `--dtype bfloat16` y `--gpu-memory-utilization 0.90`.
- Variantes de despliegue: AutoRound (este repositorio), AutoGPTQ para pipelines GPTQ y LLM-Compressor para integración nativa con vLLM.
- Soporte en llama.cpp, Ollama o TGI: no disponible en la información proporcionada; el repositorio solo documenta el servicio vía vLLM.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| NuExtract3-W4A16-AutoRound (este) | 1.541.787.136 | no disponible (ejemplo a 16.384) | W4A16, grupo 32 | Apache 2.0 | Cuantizado por un tercero; visión en BF16 |
| numind/NuExtract3 (base) | no disponible | no disponible | BF16 | Apache 2.0 | Modelo original de NuMind; referencia de calidad |
| NuExtract3-W4A16-AutoRound-GPTQ | no disponible | no disponible | W4A16 vía AutoGPTQ | Apache 2.0 | Misma receta, formato GPTQ |
| NuExtract3-W4A16-AutoRound-LLM-Compressor | no disponible | no disponible | W4A16 vía LLM-Compressor | Apache 2.0 | Misma receta, orientado a vLLM nativo |

No se dispone de datos de benchmarks que permitan comparar el rendimiento frente a alternativas de otros autores.

## Limitaciones y advertencias

- La cuantización W4A16 introduce una pérdida de precisión respecto al modelo base en BF16; no se han publicado evaluaciones que cuantifiquen esa degradación en tareas de extracción.
- La torre de visión se mantiene en BF16, por lo que el ahorro de VRAM se concentra en las capas de texto y el consumo real puede superar la estimación de 2,8-3,5 GB según la resolución de imagen y el número de imágenes por petición.
- El modelo está pensado para extracción guiada por plantilla; fuera de ese patrón la fiabilidad de la salida no está documentada.
- Riesgo de alucinación en campos ausentes del documento: conviene validar la salida contra reglas de negocio y aplicar temperatura baja.
- Idiomas soportados no documentados; no se puede garantizar el comportamiento en castellano ni en otros idiomas sin evaluación propia.
- Longitud de contexto nativa no documentada; el valor de 16.384 del ejemplo corresponde a la configuración de servicio, no a una especificación confirmada.
- El repositorio lo mantiene un tercero (Vishva007), no NuMind; la trazabilidad de la receta de cuantización depende de la model card del autor.
- La licencia Apache 2.0 del modelo base permite uso comercial, pero debe verificarse que la variante cuantizada conserva esa licencia y que no se añaden restricciones adicionales.
- El ejemplo de despliegue depende de `--trust-remote-code`, lo que implica ejecutar código del repositorio; conviene auditar el contenido antes de usarlo en producción.
- El uso de plantillas de servicio con referidos de terceros (RunPod) en la model card no afecta al modelo, pero conviene separar esa información promocional de la documentación técnica.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vishva007/NuExtract3-W4A16-AutoRound
- Variante AutoGPTQ: https://huggingface.co/Vishva007/NuExtract3-W4A16-AutoRound-GPTQ
- Variante LLM-Compressor: https://huggingface.co/Vishva007/NuExtract3-W4A16-AutoRound-LLM-Compressor
- Modelo base: https://huggingface.co/numind/NuExtract3
- Intel AutoRound: https://github.com/intel/auto-round
