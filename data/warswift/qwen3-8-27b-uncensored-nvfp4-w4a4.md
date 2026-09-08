# WarSwift/Qwen3.8-27B-Uncensored-NVFP4-W4A4

## Resumen

WarSwift/Qwen3.8-27B-Uncensored-NVFP4-W4A4 es una variante cuantizada del modelo base Qwen3.8-27B, publicada por el usuario WarSwift en Hugging Face bajo licencia Apache 2.0. Se trata de una versión "uncensored" que, según el nombre y la información de modelos similares, ha sido sometida a un proceso de abliteración para reducir el rechazo del modelo (over-refusal) manteniendo las capacidades originales. La cuantización NVFP4-W4A4 indica que tanto pesos como activaciones se representan en 4 bits, lo que reduce significativamente los requisitos de memoria en inferencia. El modelo base Qwen3.8-27B pertenece a la familia Qwen y, según versiones uncensored similares, soporta visión, tool calling, modo de pensamiento y una ventana de contexto de 262K tokens. La relevancia de este modelo radica en ofrecer una alternativa de 27B parámetros con cuantización 4-bit para despliegue en hardware limitado, manteniendo un comportamiento menos restrictivo que el modelo original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen, modelo base Qwen3.8-27B) |
| Parametros totales | 27B (según nombre del modelo) |
| Parametros activos | No aplicable (no es MoE) |
| Longitud de contexto | 262K (según modelos similares; no confirmado en la model card) |
| Tipos de cuantizacion | NVFP4-W4A4 (pesos y activaciones en 4 bits) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura transformer de la familia Qwen, con 27.000 millones de parámetros. La variante WarSwift aplica una cuantización NVFP4-W4A4, que utiliza un formato de coma flotante de 4 bits (NVFP4) para pesos y activaciones, reduciendo el tamaño del modelo y el ancho de banda de memoria necesarios durante la inferencia. No se dispone de información sobre los datos de entrenamiento, el número de tokens utilizados ni si se aplicaron técnicas de alineación como RLHF o DPO. El nombre "uncensored" sugiere un proceso de abliteración (eliminación de capas de rechazo) similar al descrito en modelos como orcarouter/Qwen3.8-27B-Uncensored, que reporta 0% de over-refusal en XSTest y una pérdida de capacidad no medible, pero este proceso no está documentado en la model card del modelo WarSwift.

## Capacidades

Las siguientes capacidades se deducen de la información disponible sobre modelos similares de la misma familia; no están confirmadas en la model card del modelo WarSwift.

- Generación de texto y razonamiento: heredadas del modelo base Qwen3.8-27B.
- Soporte de tool calling / function calling: según modelos similares, el modelo base incluye esta capacidad.
- Soporte de agentes y razonamiento multi-paso: el modelo base permite razonamiento encadenado y uso de herramientas.
- Capacidades multilingües: no disponible.
- Capacidades especiales: visión (según modelos similares con torre mmproj), modo de pensamiento (thinking mode) y contexto extendido de 262K tokens.
- Versión uncensored: reducción del rechazo, con 0% de over-refusal en XSTest y 0-6% de rechazo en el conjunto A/B según el modelo similar orcarouter.

## Casos de uso

- Asistente de programación en entornos de desarrollo integrado: el modelo puede generar y revisar código, y gracias al tool calling puede ejecutar comandos o consultar APIs.
- Agentes autónomos para automatización de tareas: el razonamiento multi-paso y el tool calling permiten construir agentes que planifican y ejecutan secuencias de acciones.
- Análisis de documentos con contenido visual: si la variante conserva la torre de visión del modelo base, puede procesar capturas de pantalla, gráficos o imágenes junto con texto.
- Chat de atención al cliente sin restricciones: la versión uncensored reduce los rechazos, lo que puede ser útil en aplicaciones donde el modelo debe responder a temas controvertidos con menos filtros.
- Recuperación aumentada por generación (RAG) sobre corpus extensos: la ventana de contexto de 262K permite procesar documentos largos o múltiples documentos en una sola consulta.
- Despliegue en hardware de consumo: la cuantización 4-bit reduce la VRAM necesaria, permitiendo ejecutar el modelo en GPUs de 24 GB como la RTX 4090 para prototipado o inferencia local.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: con cuantización 4-bit (NVFP4-W4A4), un modelo de 27B parámetros requiere aproximadamente 14-18 GB para los pesos, más memoria para activaciones y caché de contexto. Estimación no confirmada.
- GPU recomendadas: RTX 4090 (24 GB), A100 40/80 GB, H100 80 GB.
- Cabe en consumer GPU: sí, en GPUs de 24 GB con cuantización 4-bit, aunque el contexto largo puede requerir más memoria.
- Opciones de despliegue: vLLM, llama.cpp, Ollama (según la disponibilidad de modelos similares en Ollama).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WarSwift/Qwen3.8-27B-Uncensored-NVFP4-W4A4 | 27B | no disponible (similar: 262K) | NVFP4-W4A4 | Apache 2.0 | Hugging Face |
| orcarouter/Qwen3.8-27B-Uncensored | 27B | 262K | no disponible | Apache 2.0 | Ollama |
| Qwen3.8-27B (base) | 27B | 262K | no disponible | Apache 2.0 | Hugging Face / Ollama |

## Limitaciones y advertencias

- Sesgos: no disponible.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no se han publicado evaluaciones específicas.
- Limitaciones de contexto o idioma: no disponible.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero la versión uncensored puede plantear problemas éticos o de cumplimiento según el caso de uso.
- Caveat: la model card está vacía; no hay documentación sobre datos de entrenamiento, proceso de abliteración ni evaluación de seguridad.

## Enlaces

- HuggingFace: https://huggingface.co/WarSwift/Qwen3.8-27B-Uncensored-NVFP4-W4A4
- Modelo similar en Ollama: https://ollama.com/orcarouter/Qwen3.8-27B-Uncensored
