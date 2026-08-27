# Yanun/Qwen3.8-Flash-Next-MXFP4

## Resumen

Yanun/Qwen3.8-Flash-Next-MXFP4 es una conversión del modelo Qwen3.8-Flash-Next-FP8 de Qwen, adaptada al formato de instalación de DeepSeekV4SSD, un runtime diseñado para ejecutar modelos de lenguaje en Apple Silicon con memoria unificada. El modelo original es un MoE ultra-sparse de 125B parámetros (incluyendo una tabla N-gram de 51B) que activa solo 6B parámetros por token, con una arquitectura híbrida que combina Gated DeltaNet y Qwen Sparse Attention, y una ventana de contexto de 262K tokens. Esta conversión cuantiza los expertos enrutados a MXFP4 (4 bits, grupo de 32) para reducir el uso de memoria y permitir su ejecución en hardware Apple, manteniendo el resto de tensores comunes en su formato original.

El repositorio contiene el manifiesto completo, tensores comunes, almacén N-gram, ficheros de tokenizador y 48 ficheros de capas de expertos enrutados, pero excluye explícitamente los pesos de visión, vídeo, MTP y DSpark del modelo base. No es un checkpoint de Transformers estándar; solo puede instalarse y ejecutarse a través de la aplicación DeepSeekV4SSD. La licencia es Qwen Community 1.0, lo que condiciona su uso comercial. Su relevancia radica en ofrecer una vía práctica para ejecutar un modelo de 125B en dispositivos con memoria unificada de 78 GB, sin necesidad de GPU dedicada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE ultra-sparse con Gated DeltaNet (3 de cada 4 capas) y Qwen Sparse Attention (1 de cada 4) |
| Parametros totales | 125B (incluyendo 51B de tabla N-gram) |
| Parametros activos | 6B por token |
| Longitud de contexto | 262K tokens |
| Tipos de cuantizacion | MXFP4 (4 bits, grupo 32) para expertos enrutados; el resto de tensores en FP8 (del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 |
| Formato de pesos | Formato DeepSeekV4SSD (no safetensors ni GGUF) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-Flash-Next-FP8 emplea una arquitectura MoE ultra-sparse con 125B parámetros totales y 6B activos por token. Combina dos mecanismos de atención: tres de cada cuatro capas utilizan Gated DeltaNet para comprimir el historial de forma eficiente, mientras que la cuarta capa usa Qwen Sparse Attention para recuperación precisa de contexto largo. Además, incorpora una tabla N-gram de 51B parámetros que complementa la representación del modelo. La conversión realizada por Yanun toma los expertos enrutados de la revisión fijada `bcd9f01ddc9cff2316eb84281bebcd5b058bddce` del modelo FP8 y los convierte a MXFP4 con grupo de tamaño 32, siguiendo la versión 2 del formato de conversión de DeepSeekV4SSD. No se incluyen los pesos de visión, vídeo, MTP ni DSpark, por lo que esta versión es exclusivamente de texto. No se dispone de información sobre el proceso de entrenamiento del modelo original (composición del dataset, uso de RLHF/DPO, etc.).

## Capacidades

- Generación de texto y razonamiento avanzado, heredadas del modelo base Qwen3.8-Flash-Next.
- Procesamiento de contexto largo de hasta 262K tokens, útil para documentos extensos y conversaciones multi-turno.
- Ejecución en Apple Silicon mediante DeepSeekV4SSD, aprovechando memoria unificada sin necesidad de GPU VRAM dedicada.
- Soporte de tool calling y function calling: no confirmado en esta conversión, aunque el modelo base lo incorpora; no se ha verificado en el formato DeepSeekV4SSD.
- Capacidades multimodales (visión, vídeo): no disponibles en esta conversión, ya que los pesos correspondientes no están incluidos.
- Capacidades multilingües: no especificadas en la información disponible.

## Casos de uso

- Inferencia local en Apple Silicon: el modelo está diseñado para ejecutarse en dispositivos con 78 GB de memoria unificada (por ejemplo, Mac Studio o MacBook Pro de gama alta), permitiendo usar un MoE de 125B sin GPU dedicada.
- Procesamiento de documentos largos: con 262K tokens de contexto, puede resumir o analizar libros completos, expedientes legales o informes técnicos extensos en una sola pasada.
- Asistentes conversacionales de largo alcance: la ventana de contexto amplia permite mantener conversaciones multi-turno con historial completo sin truncamiento.
- Experimentación con cuantización MXFP4: sirve como referencia para evaluar el impacto de la cuantización de 4 bits en expertos enrutados frente al FP8 original.
- Desarrollo de aplicaciones de texto en entornos Apple: integración con DeepSeekV4SSD para prototipos y aplicaciones de producción en ecosistema macOS.
- Investigación sobre MoE ultra-sparse: permite estudiar el comportamiento de modelos con 6B activos y tabla N-gram en hardware de consumo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos de MMLU, HumanEval, GSM8K ni otras métricas para esta conversión específica. El modelo base Qwen3.8-Flash-Next-FP8 tiene resultados publicados por Qwen, pero no se han verificado para la versión MXFP4.

## Requisitos de hardware

- Memoria unificada: se recomiendan al menos 78 GB de RAM/unified memory según la guía de unsloth para el modelo base; la conversión MXFP4 reduce el peso de los expertos, por lo que el requisito podría ser menor, pero no se ha especificado.
- GPU: no requiere GPU dedicada; funciona en Apple Silicon (M-series) con memoria unificada.
- Runtime: DeepSeekV4SSD (aplicación de instalación y ejecución).
- Opciones de despliegue: exclusivamente a través de DeepSeekV4SSD; no compatible con vLLM, llama.cpp, Ollama ni TGI en su formato actual.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Formato |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-FP8 (base) | 125B | 6B | 262K | FP8 | qwen-community-1.0 | Transformers / vLLM |
| Yanun/Qwen3.8-Flash-Next-MXFP4 | 125B | 6B | 262K | MXFP4 (expertos) | qwen-community-1.0 | DeepSeekV4SSD |
| DeepSeek-V3 (referencia) | 671B | 37B | 128K | FP8 | MIT | Transformers / vLLM |

La comparación se limita a características estructurales, ya que no hay benchmarks disponibles para la conversión MXFP4. La principal diferencia frente al modelo base es el formato de pesos y la cuantización de los expertos, que reduce el uso de memoria a costa de una posible pérdida de precisión. Frente a DeepSeek-V3, el modelo de Qwen es significativamente más pequeño en activos y contexto, pero su licencia es más restrictiva.

## Limitaciones y advertencias

- No es un checkpoint de Transformers: solo puede instalarse y ejecutarse mediante DeepSeekV4SSD, lo que limita su portabilidad a otros frameworks.
- Exclusión de pesos multimodales: no incluye visión, vídeo, MTP ni DSpark, por lo que no es adecuado para tareas que requieran estas capacidades.
- Cuantización MXFP4: la conversión de los expertos a 4 bits puede degradar la calidad de las respuestas en comparación con la versión FP8, especialmente en tareas de razonamiento complejo.
- Licencia Qwen Community 1.0: impone restricciones de uso comercial y obligaciones de atribución; es necesario revisar los términos completos antes de su uso en producción.
- Sin benchmarks publicados: no hay evidencia empírica del rendimiento de esta conversión frente al modelo original.
- Riesgo de alucinación: inherente a los modelos de lenguaje, no mitigado específicamente en esta versión.
- Sesgos: no se ha documentado ningún análisis de sesgos para esta conversión.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Yanun/Qwen3.8-Flash-Next-MXFP4
- Modelo base Qwen3.8-Flash-Next-FP8: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Repositorio DeepSeekV4SSD: https://github.com/yanun0323/deepseek_ssd
- Guía de ejecución local (unsloth): https://unsloth.ai/docs/models/qwen3.8-next
- Repositorio oficial de Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Recetas vLLM para Qwen3.8-Flash-Next: https://recipes.vllm.ai/Qwen/Qwen3.8-Flash-Next
