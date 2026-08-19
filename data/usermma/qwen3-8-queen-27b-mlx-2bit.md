# usermma/Qwen3.8-Queen-27B-mlx-2Bit

## Resumen

El modelo `usermma/Qwen3.8-Queen-27B-mlx-2Bit` es una conversión a formato MLX del modelo base `aifeifei798/Qwen3.8-Queen-27B`, realizada con la librería `mlx-lm` versión 0.31.2. A pesar del nombre, los pesos reales en safetensors suman 2.523.897.344 parámetros (aproximadamente 2,5 mil millones), muy por debajo de los 27B que sugiere la denominación. Esto indica que se trata de una cuantización agresiva a 2 bits, probablemente de un modelo original mayor, o que el nombre es una convención comercial del autor.

El modelo está orientado a tareas de generación de texto conversacional, con etiquetas explícitas de roleplay, escritura creativa, storytelling, soporte de character cards y compatibilidad con SillyTavern. El pipeline declarado es `image-text-to-text`, lo que sugiere una posible capacidad multimodal, aunque no se aportan detalles al respecto. Su licencia es Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

La relevancia de este modelo radica en su formato MLX y cuantización de 2 bits, que lo hace adecuado para ejecutarse en hardware con recursos limitados, especialmente en sistemas Apple Silicon. Sin embargo, la ausencia de documentación sobre arquitectura, entrenamiento y rendimiento limita su uso en entornos de producción serios, siendo más apropiado para experimentación y prototipado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (probablemente basada en Qwen, sin confirmar) |
| Parametros totales | 2.523.897.344 (2,5B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 2-bit (formato MLX) |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | MLX (safetensors) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo original `aifeifei798/Qwen3.8-Queen-27B` ni sobre su proceso de entrenamiento. Los tags indican que pertenece a la familia Qwen (posiblemente Qwen3.5 o similar), pero no hay confirmación oficial. La conversión a MLX se realizó con `mlx-lm` 0.31.2, lo que implica que los pesos se transformaron al formato optimizado para Apple Silicon. No se mencionan técnicas como RLHF, DPO ni datos de entrenamiento (número de tokens, composición del dataset). Tampoco hay detalles sobre innovaciones técnicas en el modelo base.

## Capacidades

- Generación de texto conversacional y narrativo, orientado a roleplay y escritura creativa.
- Soporte de character cards (tarjetas de personaje) y compatibilidad con SillyTavern, una interfaz popular para juegos de rol con IA.
- Pipeline declarado como `image-text-to-text`, lo que podría implicar entrada multimodal (imagen y texto), aunque no se documenta ningún ejemplo de uso con imágenes.
- Capacidad de chat multi-turno, según los tags de conversación y generación de texto.
- No se mencionan capacidades de tool calling, function calling, razonamiento multi-paso ni modos de pensamiento explícitos.

## Casos de uso

- Roleplay interactivo con personajes personalizados: gracias a su soporte de character cards y SillyTavern, el modelo puede mantener conversaciones coherentes con personalidades definidas, siendo adecuado para juegos de rol textuales o simulación de personajes.
- Escritura creativa asistida: puede generar cuentos, diálogos y narrativas con estilo consistente, útil para autores que buscan inspiración o borradores rápidos.
- Chatbots de entretenimiento: su naturaleza conversacional permite construir asistentes virtuales con tono informal o dramático, sin necesidad de ajuste fino adicional.
- Prototipado de aplicaciones de chat en dispositivos Apple: al ser MLX y 2-bit, puede ejecutarse en MacBooks con memoria unificada limitada, facilitando pruebas locales de conceptos de IA generativa.
- Experimentación con cuantización extrema: sirve como caso de estudio para evaluar el impacto de la cuantización de 2 bits en la calidad de generación de texto narrativo.
- Integración en entornos de desarrollo con SillyTavern: permite a usuarios de esta plataforma probar un modelo ligero sin necesidad de GPUs dedicadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos de MMLU, HumanEval, GSM8K ni otras métricas estándar para este modelo o su base.

## Requisitos de hardware

- Al ser un modelo de 2,5B parámetros cuantizado a 2 bits en formato MLX, el tamaño del repositorio es de 8,4 GB, lo que sugiere que puede cargarse en sistemas con al menos 8-10 GB de memoria unificada.
- Está optimizado para Apple Silicon (M1, M2, M3 y superiores) mediante el framework MLX. No se recomienda su uso en GPUs NVIDIA sin conversión previa a otros formatos (GGUF, etc.).
- No se dispone de datos de VRAM específica para GPUs convencionales, ya que el formato MLX no es compatible directamente con CUDA.
- Opciones de despliegue: `mlx-lm` para Python en macOS; también puede usarse con herramientas que soporten MLX, aunque no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la misma categoría (roleplay, 2-bit, MLX). El nombre sugiere una relación con la familia Qwen, pero sin datos de rendimiento no es posible establecer una comparación objetiva. Alternativas genéricas de roleplay como Llama-3-8B-Instruct o Mistral-7B-Instruct podrían ser comparables en tamaño, pero no en formato ni cuantización. Se indica "no disponible" por falta de datos.

## Limitaciones y advertencias

- La cuantización a 2 bits degrada significativamente la calidad de generación en comparación con modelos de mayor precisión, pudiendo provocar incoherencias, repeticiones o pérdida de matices lingüísticos.
- No se documentan sesgos específicos, pero al ser un modelo derivado de Qwen y entrenado con datos desconocidos, es probable que herede sesgos culturales o de género presentes en los datos originales.
- Riesgo de alucinación: sin datos de entrenamiento verificables, el modelo puede generar información falsa o inventada, especialmente en contextos factuales.
- La longitud de contexto no está especificada, por lo que no se garantiza un rendimiento adecuado en conversaciones muy largas.
- Aunque la licencia Apache 2.0 permite uso comercial, no hay garantías sobre la calidad o seguridad del modelo para producción.
- El pipeline `image-text-to-text` no está confirmado con ejemplos prácticos; puede ser una etiqueta heredada o incorrecta.
- El número real de parámetros (2,5B) contradice el nombre "27B", lo que puede inducir a error sobre las capacidades reales del modelo.

## Enlaces

- [HuggingFace: usermma/Qwen3.8-Queen-27B-mlx-2Bit](https://huggingface.co/usermma/Qwen3.8-Queen-27B-mlx-2Bit)
- [Modelo base: aifeifei798/Qwen3.8-Queen-27B](https://huggingface.co/aifeifei798/Qwen3.8-Queen-27B) (sin información adicional disponible)
