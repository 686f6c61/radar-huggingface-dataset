# Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound

## Resumen

Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound es una version cuantizada W4A16 (pesos de 4 bits, activaciones de 16 bits) del modelo [empero-ai/Qwen3.8-2B-Distill](https://huggingface.co/empero-ai/Qwen3.8-2B-Distill), desarrollada por Vishva007 mediante el algoritmo AutoRound de Intel. El modelo base es un destilado de la serie Qwen3.8 de Alibaba, entrenado a partir de las trazas de razonamiento del modelo profesor Qwen3.8-2.4T, con tamanos de estudiante de 9B, 4B y 2B. Esta variante concreta tiene 1.061.364.544 parametros (~1,06B) y conserva las capacidades multimodales (vision) y de razonamiento del original.

La relevancia de esta cuantizacion reside en que reduce los requisitos de VRAM de los 8-10 GB del modelo en BF16 a aproximadamente 2,5-3,5 GB, lo que permite ejecutar el modelo en GPUs de consumo con 4 o 6 GB, portatiles y dispositivos de borde. La cuantizacion se ha calibrado con 512 muestras, una longitud de secuencia de 4096 tokens y 1000 iteraciones de ajuste, manteniendo la torre de vision en BF16 y los modulos de prediccion multi-token (MTP) en bfloat16 nativo para preservar la precision en razonamiento visual y OCR. Se distribuye bajo licencia Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (serie Qwen3.8, base Alibaba) |
| Parametros totales | 1.061.364.544 (~1,06B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible para el modelo base; el ejemplo de despliegue con vLLM usa max-model-len 8192; la calibracion se realizo con seqlen 4096 |
| Tipos de cuantizacion | W4A16 (AutoRound, grupo 32, simetrico); tambien disponibles formatos AutoGPTQ y LLM-Compressor/Compressed-Tensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (formato AutoRound); variantes GPTQ y LLM-Compressor en repositorios separados |

## Arquitectura y entrenamiento

El modelo base, Qwen3.8-2B-Distill de Empero AI, es un destilado de la serie Qwen3.8 de Alibaba (parte de la familia Qwen3.5/Qwen3.6/Qwen3.8). El proceso de destilacion utiliza un modelo profesor masivo (Qwen3.8-2.4T) que genera soluciones de razonamiento paso a paso (cadenas de pensamiento), y los modelos estudiantes (9B, 4B y 2B) se entrenan directamente sobre esas trazas de razonamiento exactas. El modelo resultante es multimodal (image-text-to-text) e incluye bloques de razonamiento explicito (thinking).

La cuantizacion W4A16 se realizo con Intel AutoRound, con un tamano de grupo de 32 para una fidelidad de reconstruccion fina, cuantizacion simetrica, 512 muestras de calibracion, longitud de secuencia de 4096 y 1000 iteraciones de ajuste. Dos decisiones tecnicas destacables: la torre de vision (quant_nontext_module) se mantuvo en BF16 para preservar el razonamiento visual y la precision OCR, y los modulos de prediccion multi-token (mtp y mtp.fc) se conservaron en bfloat16 nativo. No se dispone de informacion sobre el dataset de entrenamiento del modelo base ni sobre procesos de RLHF o DPO.

## Capacidades

- Generacion de texto y conversacion multi-turno.
- Razonamiento con cadenas de pensamiento explicitas (bloques thinking) heredadas del proceso de destilacion.
- Capacidades multimodales: procesamiento de imagen y texto (image-text-to-text), incluyendo razonamiento visual y OCR.
- Inferencia eficiente en hardware de consumo gracias a la cuantizacion W4A16 con grupo 32.
- Compatible con vLLM para despliegue de alto rendimiento.
- Disponible en tres formatos de cuantizacion (AutoRound, AutoGPTQ y LLM-Compressor) para distintos motores de inferencia.
- No se ha confirmado soporte de tool calling o function calling en la informacion disponible.

## Casos de uso

- Despliegue en dispositivos de borde y portatiles: con 2,5-3,5 GB de VRAM, el modelo cabe en GPUs de 4 o 6 GB, lo que permite ejecutar asistentes conversacionales con razonamiento en equipos sin GPU de datacenter.
- Razonamiento visual y OCR en entornos con recursos limitados: la torre de vision en BF16 conserva la precision para extraer texto de imagenes y responder preguntas sobre contenido visual, util en aplicaciones de digitalizacion de documentos.
- Asistentes conversacionales con cadena de pensamiento: el modelo genera trazas de razonamiento antes de responder, adecuado para sistemas de ayuda que necesitan explicar sus respuestas paso a paso.
- Servicio de inferencia de alto rendimiento con vLLM: el ejemplo de despliegue incluido en la model card permite servir el modelo con max-model-len de 8192 tokens y utilizacion de memoria GPU del 90%, apropiado para entornos de produccion con GPUs modestas.
- Prototipado rapido de aplicaciones multimodales: al ser Apache 2.0 y caber en hardware de consumo, es adecuado para validar conceptos de asistentes con vision sin coste de licencia.
- Educacion e investigacion en cuantizacion: el repositorio documenta el proceso completo de calibracion (parametros, muestras, iteraciones), util como referencia para reproducir cuantizaciones W4A16 con AutoRound en otros modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de MMLU, HumanEval, GSM8K ni comparativas con otros modelos. Los unicos datos de rendimiento disponibles son los requisitos de VRAM (2,5-3,5 GB frente a 8-10 GB del original en BF16) y la afirmacion de que la cuantizacion reduce la presion de ancho de banda de memoria, acelerando la generacion de tokens durante razonamientos extendidos.

## Requisitos de hardware

- VRAM estimada para inferencia: 2,5-3,5 GB en W4A16 con grupo 32, frente a 8-10 GB del modelo original en BF16.
- GPUs compatibles: cualquier GPU de consumo con 4 o 6 GB de VRAM (por ejemplo, NVIDIA GTX 1650, RTX 3050, RTX 3060, RTX 4060); tambien portatiles y dispositivos de borde.
- No requiere GPU de datacenter; no se indican requisitos especificos para A100 o H100.
- Opciones de despliegue: vLLM (ejemplo incluido en la model card con --dtype bfloat16 y --max-model-len 8192); los formatos AutoGPTQ y LLM-Compressor amplian la compatibilidad con otros motores (TGI, transformers, etc.).
- Latencia y throughput: no se han publicado cifras concretas; la model card indica que la cuantizacion reduce la presion de ancho de banda y acelera la generacion durante cadenas de razonamiento largas.

## Comparativa con modelos similares

| Modelo | Parametros | Cuantizacion | VRAM estimada | Licencia | Formato |
|---|---|---|---|---|---|
| Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound | 1,06B | W4A16 (AutoRound) | 2,5-3,5 GB | Apache 2.0 | safetensors |
| empero-ai/Qwen3.8-2B-Distill (original) | 1,06B | BF16 | 8-10 GB | Apache 2.0 | safetensors |
| Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound-GPTQ | 1,06B | W4A16 (AutoGPTQ) | No disponible | Apache 2.0 | GPTQ |
| Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound-LLM-Compressor | 1,06B | W4A16 (Compressed-Tensors) | No disponible | Apache 2.0 | safetensors |

Las tres variantes cuantizadas comparten el mismo modelo base y la misma precision W4A16; la diferencia es el formato de empaquetado y el motor de inferencia compatible. No se dispone de datos para comparar con otros modelos de 2B de la misma categoria (por ejemplo, Qwen2.5-1.5B o Gemma-2-2B) en terminos de rendimiento.

## Limitaciones y advertencias

- No se han publicado benchmarks, por lo que no es posible verificar la degradacion de calidad introducida por la cuantizacion frente al modelo original en BF16.
- El modelo tiene solo ~1,06B de parametros, una capacidad limitada en comparacion con modelos de 7B o superiores; puede fallar en tareas complejas de razonamiento o generacion de codigo extenso.
- La longitud de contexto del modelo base no esta documentada; el ejemplo de vLLM usa 8192 tokens, pero no se garantiza que el modelo soporte esa longitud sin degradacion.
- Los idiomas soportados no estan especificados; la serie Qwen suele ser multilingue, pero no hay confirmacion para esta variante.
- No se ha confirmado soporte de tool calling o function calling, lo que limita su uso en pipelines de agentes que requieran invocacion de herramientas.
- El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo reciente sin validacion comunitaria ni casos de produccion documentados.
- La cuantizacion W4A16 con grupo 32 puede introducir errores de redondeo en tareas de alta precision numerica; la torre de vision y los modulos MTP se mantienen en BF16, pero el resto de pesos estan cuantizados a 4 bits.
- Riesgo de alucinacion inherente a modelos de este tamano, especialmente en tareas factuales o de generacion de codigo.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound
- Modelo base: https://huggingface.co/empero-ai/Qwen3.8-2B-Distill
- Variante AutoGPTQ: https://huggingface.co/Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound-GPTQ
- Variante LLM-Compressor: https://huggingface.co/Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound-LLM-Compressor
- Framework de cuantizacion AutoRound: https://github.com/intel/auto-round
- Repositorio oficial de la serie Qwen3.8: https://github.com/QwenLM/Qwen3.8
- Repositorio del proceso de destilacion (RayCodes): https://github.com/47thtechcorner/RayCodes_Qwen3.8Distilled
- Ficha del modelo base en LLM Explorer: https://llm-explorer.com/model/empero-ai%2FQwen3.8-2B-Distill,3TlLgEP23RPu4OPKG5EMyl
