# xl-24/gemma4-2b-atc-finetune_16_32_v2-merged-16bit

## Resumen

`xl-24/gemma4-2b-atc-finetune_16_32_v2-merged-16bit` es un ajuste fino (fine-tuning) del modelo `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, que a su vez deriva de la familia Gemma 4 de Google en su variante E2B (efímera de 2B parámetros activos). El autor, identificado como `xl-24`, ha publicado este modelo en Hugging Face con licencia Apache 2.0 y pipeline `image-text-to-text`, lo que indica que conserva la capacidad multimodal de entrada (imagen y texto) del modelo base.

El nombre del repositorio sugiere un ajuste orientado a una tarea concreta (el sufijo "atc" y los parámetros "16_32_v2" apuntan a una configuración específica de entrenamiento, probablemente con longitudes de secuencia o hiperparámetros concretos), aunque la model card no documenta el dataset ni el objetivo exacto del fine-tuning. El modelo se distribuye en formato safetensors de 16 bits (no cuantizado), con un total real de 5.123.178.051 parámetros según los metadatos del repositorio.

La relevancia de esta ficha es doble: por un lado, documenta una variante comunitaria de Gemma 4 con capacidades multimodales; por otro, advierte de que se trata de un modelo con escasa documentación, cero descargas y cero interacciones en el momento de la consulta, lo que exige precaución antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), basado en Gemma 4 E2B |
| Parametros totales | 5.123.178.051 |
| Parametros activos | no disponible (el nombre "E2B" sugiere ~2B activos, pero no se confirma en la informacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo se distribuye en 16 bits; el base usaba bnb-4bit) |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Tamano del repo | 10,3 GB |
| Libreria | transformers |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del checkpoint `unsloth/gemma-4-E2B-it-unsloth-bnb-4bit`, que corresponde a la variante instruct de Gemma 4 E2B de Google, cuantizada originalmente en 4 bits por Unsloth. El autor ha realizado el fine-tuning con Unsloth y la librería TRL de Hugging Face, según declara en la model card, y ha publicado el resultado fusionado (merged) en 16 bits, es decir, sin la cuantización de 4 bits del base.

No se documenta en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo fases de RLHF o DPO adicionales. El sufijo "atc" y "16_32_v2" del nombre del repositorio sugiere una configuración concreta de entrenamiento (posiblemente longitudes de secuencia de 16 y 32, o variantes de hiperparámetros), pero no se confirma en la model card. Tampoco se detalla si se preservaron las capacidades multimodales originales tras el ajuste.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo instruct base.
- Procesamiento de entrada multimodal imagen-texto (pipeline `image-text-to-text`), aunque no se documenta si el fine-tuning preservó esta capacidad.
- Razonamiento y generación de código: no confirmado explícitamente en la información disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta `language: en`.
- Modo "thinking" u otras capacidades especiales: no disponible.

## Casos de uso

- **Prototipado rápido de asistentes conversacionales en inglés**: el modelo puede desplegarse con `transformers` y `text-generation-inference` para validar flujos conversacionales antes de invertir en modelos mayores; su tamaño de ~5B parámetros totales lo hace manejable en una sola GPU.
- **Investigación sobre fine-tuning con Unsloth**: sirve como ejemplo reproducible de un pipeline de ajuste fino con Unsloth + TRL sobre un modelo Gemma 4 cuantizado, útil para estudiar el impacto de la fusión a 16 bits.
- **Tareas específicas de clasificación o extracción sobre texto e imagen**: si el ajuste "atc" corresponde a una tarea concreta (por ejemplo, atención al cliente o análisis de tickets), el modelo podría emplearse como base para ese dominio, aunque la falta de documentación obliga a validarlo empíricamente.
- **Evaluación comparativa de variantes comunitarias de Gemma 4**: útil en estudios que comparan checkpoints ajustados frente al base oficial en tareas controladas.
- **Despliegue en entornos con requisitos de licencia permisiva**: la licencia Apache 2.0 facilita su integración en productos comerciales, a diferencia de otras licencias más restrictivas.
- **Generación de descripciones de imágenes en inglés**: si se conserva la capacidad multimodal, podría emplearse para captioning o respuesta visual a preguntas (VQA) en inglés, previa validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- **VRAM estimada para inferencia en 16 bits**: aproximadamente 10-11 GB solo para los pesos (5,12B parámetros × 2 bytes), más overhead de activaciones y KV cache; se recomienda al menos 16 GB de VRAM para contexto moderado.
- **GPU recomendadas**: NVIDIA A100 (40/80 GB), H100, L40S o RTX 4090 (24 GB) para inferencia cómoda en 16 bits.
- **Consumer GPU**: cabe en RTX 4090 (24 GB) y, con cuantización adicional a 8 bits o 4 bits (no incluida en el repo), en GPUs de 12-16 GB como RTX 4070 Ti o RTX 4080.
- **Opciones de despliegue**: `transformers`, `text-generation-inference` (TGI), y potencialmente vLLM; llama.cpp/Ollama requerirían conversión a GGUF, no incluida en el repositorio.
- **Latencia y throughput**: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|
| xl-24/gemma4-2b-atc-finetune_16_32_v2-merged-16bit | 5,12B | no disponible | Apache 2.0 | Sí (image-text-to-text) | Hugging Face, 0 descargas |
| unsloth/gemma-4-E2B-it-unsloth-bnb-4bit (base) | no disponible (E2B) | no disponible | Apache 2.0 (heredada) | Sí | Hugging Face |
| Gemma 4 E2B-it (oficial de Google) | ~2B activos (E2B) | no disponible | Términos de Gemma | Sí | Kaggle / Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- **Documentación mínima**: la model card no describe el dataset de entrenamiento, la tarea objetivo ni los hiperparámetros; esto impide evaluar su idoneidad para usos concretos.
- **Cero validación comunitaria**: el repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de su calidad.
- **Riesgo de alucinación**: inherente a los modelos generativos; sin benchmarks publicados no puede cuantificarse.
- **Idioma**: solo se declara inglés (`language: en`); el rendimiento en castellano no está garantizado.
- **Posible pérdida de capacidades multimodales**: aunque el pipeline es `image-text-to-text`, el fine-tuning podría haber degradado la comprensión visual; requiere validación.
- **Licencia**: Apache 2.0 permite uso comercial, pero conviene verificar que el modelo base (Gemma 4 de Google) no imponga restricciones adicionales heredadas.
- **Formato**: solo se distribuye en safetensors de 16 bits; no hay GGUF ni cuantizaciones listas para usar, lo que limita el despliegue en hardware modesto sin trabajo adicional.

## Enlaces

- [Hugging Face: xl-24/gemma4-2b-atc-finetune_16_32_v2-merged-16bit](https://huggingface.co/xl-24/gemma4-2b-atc-finetune_16_32_v2-merged-16bit)
- [Modelo base: unsloth/gemma-4-E2B-it-unsloth-bnb-4bit](https://huggingface.co/unsloth/gemma-4-E2B-it-unsloth-bnb-4bit)
- [Unsloth (GitHub)](https://github.com/unslothai/unsloth)
- [TRL de Hugging Face](https://github.com/huggingface/trl)
