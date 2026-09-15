# soyrsoyr/GLM-5.3-Flash-NVFP4A16-MTP-PR3118

## Resumen

El modelo soyrsoyr/GLM-5.3-Flash-NVFP4A16-MTP-PR3118 es un checkpoint cuantizado del modelo base zai-org/GLM-5.3-Flash, desarrollado por el usuario soyrsoyr como artefacto de validación para el pull request 3118 de llm-compressor. Su objetivo principal es probar una nueva técnica de cuantización denominada NVFP4A16, que combina pesos en FP4 (4 bits) con activaciones de 16 bits, aplicada a las proyecciones MLP del backbone y a los módulos MTP. El resto de proyecciones se mantienen en BF16.

Con 321.323.031.390 parámetros y un tamaño de repositorio de 192.5 GB, el modelo está diseñado para ejecutarse en dos GPUs B200 mediante vLLM, con soporte de decodificación especulativa basada en MTP. La licencia declarada en HuggingFace es MIT, aunque la model card indica que se aplica la licencia del modelo fuente.

Este checkpoint es relevante para la comunidad de investigación en compresión de modelos, ya que permite evaluar el impacto de la cuantización FP4 con activaciones de 16 bits en modelos de gran escala. Sin embargo, no se han publicado benchmarks de calidad ni rendimiento, y la validación de runtime en B200 está pendiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 321.323.031.390 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4A16 (pesos FP4, activaciones de 16 bits) en MLP del backbone y MTP; BF16 en el resto |
| Idiomas soportados | no disponible |
| Licencia | MIT (según HuggingFace; se aplica la licencia del modelo fuente) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un checkpoint convertido del modelo base zai-org/GLM-5.3-Flash mediante llm-compressor PR3118 (commit 7029daba). La conversión aplica una cuantización data-free llamada NVFP4A16: las proyecciones MLP gate/up/down del backbone y las proyecciones MLP de los módulos MTP se cuantizan a pesos FP4 (4 bits) con activaciones de 16 bits, mientras que el resto de proyecciones permanecen en BF16. Los pesos fuente en FP8 se descuantizan antes de la conversión.

No se proporcionan datos sobre el entrenamiento original, el tamaño del dataset, ni procesos de RLHF/DPO. La innovación técnica destacable es la combinación de cuantización FP4 con activaciones de 16 bits y la inclusión de tensores MTP para decodificación especulativa.

## Capacidades

- Generación de texto mediante pipeline text-generation.
- Posible capacidad multimodal (imagen-texto) según el tag image-text-to-text de HuggingFace, no confirmada en la model card.
- Soporte de decodificación especulativa mediante MTP: el checkpoint incluye tensores MTP y está diseñado para generar un token especulativo en vLLM.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-step ni idiomas específicos en la información disponible.

## Casos de uso

- Validación de infraestructura de cuantización: el modelo se emplea como artefacto de prueba para verificar el soporte de NVFP4A16 en vLLM y llm-compressor, en el contexto del PR3118.
- Investigación en compresión de modelos: permite estudiar el impacto de la cuantización FP4 con activaciones de 16 bits en modelos de 321B, comparando con versiones BF16 o FP8.
- Pruebas de decodificación especulativa con MTP: el checkpoint incluye módulos MTP, lo que facilita probar la generación de un token especulativo para reducir la latencia en vLLM.
- Inferencia de texto en clústeres con GPUs B200: con 192.5 GB de pesos, el modelo puede ejecutarse en dos B200, aprovechando la cuantización para reducir la huella de memoria.
- Evaluación de calidad de cuantización: aunque no hay benchmarks publicados, el modelo sirve como base para futuras evaluaciones de calidad y rendimiento frente al modelo original.
- Despliegue experimental en entornos de investigación: para equipos que trabajan con modelos de gran escala y necesitan reducir costes de memoria sin cambiar el framework (vLLM).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente: "No quality or performance benchmark is claimed."

## Requisitos de hardware

- VRAM estimada: los pesos ocupan aproximadamente 192.5 GB; con activaciones y overhead, se necesitan al menos dos GPUs B200 (192 GB cada una) según el runtime planificado.
- GPU recomendadas: dos B200 (NVIDIA) para el despliegue previsto.
- No cabe en GPUs de consumo (RTX 4090, 24 GB) debido al tamaño de los pesos.
- Opciones de despliegue: vLLM 0.29.1rc1.dev79+g767d1c4d4 (planificado), con un token especulativo MTP y block size 256.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye datos de modelos comparables ni benchmarks que permitan una comparación directa.

## Limitaciones y advertencias

- Es un checkpoint de validación de PR, no un modelo de producción; no se han realizado evaluaciones de calidad ni benchmarks de rendimiento.
- La validación de runtime en B200 está pendiente; el soporte de NVFP4A16 en vLLM puede no ser estable.
- La cuantización NVFP4A16 puede degradar la calidad del modelo respecto a los pesos originales BF16 o FP8, aunque no se ha cuantificado.
- La licencia declarada es MIT, pero la model card indica que se aplica la licencia del modelo fuente (zai-org/GLM-5.3-Flash); es necesario revisar esa licencia para uso comercial.
- No se documentan los idiomas soportados ni la longitud de contexto; el rendimiento en tareas multilingües o con contextos largos es desconocido.
- El tag image-text-to-text sugiere multimodalidad, pero no está confirmado en la model card; no se debe asumir esa capacidad.

## Enlaces

- HuggingFace del modelo: https://huggingface.co/soyrsoyr/GLM-5.3-Flash-NVFP4A16-MTP-PR3118
- Modelo base: https://huggingface.co/zai-org/GLM-5.3-Flash
- Commit de llm-compressor: https://github.com/soyr-redhat/llm-compressor/commit/7029daba084fcdb251d4c87a43dc76b60d30ecd3
