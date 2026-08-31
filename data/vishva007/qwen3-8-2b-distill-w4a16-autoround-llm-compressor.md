# Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound-LLM-Compressor

## Resumen

El modelo **Qwen3.8-2B-Distill-W4A16-AutoRound-LLM-Compressor** es una versión cuantizada a 4 bits (W4A16) del modelo destilado `empero-ai/Qwen3.8-2B-Distill`, desarrollado por Vishva007. Este modelo base es un destilado de 2.2 mil millones de parámetros de la serie Qwen3.8 de Alibaba, que a su vez se basa en la arquitectura Qwen3.5 e incorpora capacidades multimodales (imagen-texto) y de razonamiento. La cuantización se ha realizado con el algoritmo AutoRound de Intel, con un tamaño de grupo de 32 y 1000 iteraciones de calibración, preservando la torre de visión en BF16 y los módulos de predicción multi-token en bfloat16.

La relevancia de este modelo radica en que ofrece una alternativa ligera y eficiente para ejecutar tareas de razonamiento y comprensión de imágenes en hardware de gama baja, con un consumo de VRAM estimado entre 2.5 y 3.5 GB, frente a los 8-10 GB del modelo original en BF16. Está disponible en tres formatos (AutoRound, AutoGPTQ y LLM-Compressor/Compressed-Tensors) y se distribuye bajo licencia Apache 2.0, lo que permite uso comercial sin restricciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (imagen-texto) basado en Qwen3.8, destilado a 2B parámetros |
| Parametros totales | 2.213.241.664 (2.2B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (el ejemplo de vLLM usa 8192 tokens) |
| Tipos de cuantizacion | W4A16 (4-bit pesos, 16-bit activaciones), group size 32, simétrico; también disponible en AutoGPTQ y Compressed-Tensors |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (también en formatos AutoRound, GPTQ y Compressed-Tensors) |

## Arquitectura y entrenamiento

El modelo base `empero-ai/Qwen3.8-2B-Distill` es un destilado de la serie Qwen3.8, que hereda la arquitectura de Qwen3.5 con mejoras en tareas de codificación, trabajo profesional, investigación y agentes de largo horizonte. Al ser un modelo multimodal, procesa tanto texto como imágenes, e incorpora bloques de razonamiento (`thinking`) que generan cadenas de pensamiento antes de la respuesta final.

La cuantización W4A16 se realizó con Intel AutoRound, utilizando 512 muestras de calibración con una longitud de secuencia de 4096 tokens y 1000 iteraciones de ajuste. La torre de visión se mantuvo en BF16 para preservar la precisión en tareas de razonamiento visual y OCR, y los módulos de predicción multi-token (`mtp`, `mtp.fc`) también se conservaron en bfloat16. No se dispone de información detallada sobre el dataset de entrenamiento del modelo destilado original.

## Capacidades

- Generación de texto y conversación multi-turno.
- Razonamiento con cadenas de pensamiento (`thinking` blocks) para tareas complejas.
- Comprensión de imágenes y texto (pipeline `image-text-to-text`), incluyendo tareas de OCR y razonamiento visual.
- Capacidades de destilación que permiten un rendimiento razonable con un tamaño reducido.
- Soporte para inferencia eficiente en hardware con poca memoria gracias a la cuantización W4A16.

## Casos de uso

- **Asistentes conversacionales en dispositivos edge**: al requerir solo 2.5-3.5 GB de VRAM, puede desplegarse en portátiles, mini-PCs o GPUs de gama baja (4-6 GB) para ofrecer un chatbot local con razonamiento básico.
- **Análisis de documentos con OCR**: su capacidad multimodal permite extraer y comprender texto de imágenes escaneadas, útil para digitalización de facturas, formularios o notas manuscritas.
- **Descripción automática de imágenes**: puede generar descripciones textuales de fotografías o gráficos, integrable en sistemas de accesibilidad o gestión de contenidos.
- **Prototipado rápido de aplicaciones de IA**: al ser ligero y de código abierto, sirve para validar ideas de productos que requieran comprensión de imágenes y texto sin invertir en infraestructura costosa.
- **Educación y aprendizaje**: puede utilizarse como tutor interactivo que responde preguntas sobre material visual o textual, funcionando en ordenadores modestos.
- **Automatización de tareas de razonamiento**: su capacidad de generar cadenas de pensamiento lo hace adecuado para sistemas de preguntas y respuestas que requieran pasos intermedios, como resolución de problemas matemáticos o lógicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se dispone de datos comparativos de MMLU, HumanEval, GSM8K u otras pruebas para este modelo cuantizado.

## Requisitos de hardware

- VRAM estimada: 2.5-3.5 GB para inferencia con cuantización W4A16 (según la model card).
- GPU recomendadas: cualquier GPU con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3050, RTX 4060, o GPUs integradas con suficiente memoria compartida.
- El modelo original en BF16 requiere 8-10 GB de VRAM, por lo que la versión cuantizada es adecuada para tarjetas de gama baja y dispositivos edge.
- Opciones de despliegue: vLLM (con el comando `vllm serve` y `--dtype bfloat16`), y potencialmente otros motores que soporten el formato Compressed-Tensors (como llama.cpp o TGI, aunque no se confirma en la documentación).
- Latencia y throughput: no se proporcionan datos específicos, pero la cuantización reduce la presión de ancho de banda, lo que acelera la generación de tokens durante razonamientos largos.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa con modelos de la misma categoría (por ejemplo, Qwen2.5-1.5B-Instruct o Llama-3.2-3B) en términos de rendimiento y benchmarks. Se recomienda consultar el modelo base `empero-ai/Qwen3.8-2B-Distill` para obtener referencias de capacidades, aunque los datos de rendimiento cuantitativo no están disponibles en la documentación actual.

## Limitaciones y advertencias

- Al ser un modelo destilado de 2.2B parámetros, su precisión en tareas complejas será inferior a la de modelos más grandes como Qwen3.8-Max (2.4T parámetros).
- La cuantización W4A16 puede introducir una ligera degradación en la calidad de las respuestas, especialmente en tareas de razonamiento matemático o lógico, aunque el ajuste fino con AutoRound busca minimizarla.
- No se especifican los idiomas soportados; aunque Qwen3.8 suele ser multilingüe, no hay confirmación oficial para este destilado.
- La torre de visión se mantiene en BF16, lo que aumenta ligeramente el uso de memoria en comparación con una cuantización completa, pero preserva la precisión visual.
- No se han publicado resultados de benchmarks, por lo que el rendimiento real en tareas estándar es desconocido.
- El repositorio tiene 0 descargas y 0 likes, lo que sugiere que es un modelo reciente y poco probado en producción.

## Enlaces

- [Repositorio HuggingFace del modelo cuantizado](https://huggingface.co/Vishva007/Qwen3.8-2B-Distill-W4A16-AutoRound-LLM-Compressor)
- [Modelo base: empero-ai/Qwen3.8-2B-Distill](https://huggingface.co/empero-ai/Qwen3.8-2B-Distill)
- [Repositorio de Intel AutoRound](https://github.com/intel/auto-round)
- [Repositorio oficial de Qwen3.8 en GitHub](https://github.com/QwenLM/Qwen3.8)
- [Colección de modelos Qwen3.8 de Vishva007](https://huggingface.co/collections/Vishva007/qwen-38)
