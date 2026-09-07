# stefra/Mistral_AM_MLX-4bit

## Resumen

`stefra/Mistral_AM_MLX-4bit` es un modelo de lenguaje basado en Mistral 7B, publicado por el usuario stefra en Hugging Face. Está cuantizado a 4 bits y optimizado para la librería MLX, lo que lo hace adecuado para inferencia local en dispositivos Apple Silicon.

El modelo conserva la arquitectura original de Mistral de 7.248 millones de parámetros y su pipeline de generación de texto. No se dispone de información pública sobre el proceso de ajuste, el conjunto de datos ni la licencia. Su relevancia radica en ofrecer una versión compacta de Mistral para entornos de escritorio con restricciones de memoria, aunque su documentación es limitada y no incluye evaluaciones de rendimiento.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Mistral 7B) |
| Parámetros totales | 7.248.023.552 |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | 4-bit (MLX) |
| Idiomas soportados | inglés (en) |
| Licencia | no disponible |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo parte de la arquitectura Mistral 7B, un transformer denso con atención de ventana deslizante y Grouped Query Attention. Los pesos se almacenan en formato safetensors cuantizado a 4 bits para MLX. No se han publicado datos sobre el proceso de ajuste fino, el dataset de entrenamiento ni técnicas de alineación como RLHF o DPO.

## Capacidades

La información proporcionada no incluye una lista oficial de capacidades. Dado que es un fine-tune de Mistral 7B, se espera que conserve las capacidades base del modelo, como generación de texto y razonamiento, pero no hay confirmación de soporte de tool calling, visión o funciones especiales. Se recomienda validar cada capacidad de forma independiente.

- Generación de texto en inglés: el modelo puede producir texto coherente en conversaciones, redacción y resúmenes, aunque no se han publicado evaluaciones específicas.
- Razonamiento básico: hereda las capacidades de razonamiento del modelo base Mistral, sin garantías de rendimiento en tareas complejas.
- Soporte de tool calling: no disponible en la documentación; se requiere prueba manual.
- Agentes y razonamiento multi-paso: no documentado; no hay evidencia de soporte nativo.
- Capacidades multilingües: limitadas al inglés; no se recomienda para otros idiomas.
- Capacidades especiales (visión, audio): no disponibles; el modelo es exclusivamente de texto.

## Casos de uso

- Asistente conversacional local en Apple Silicon: el modelo puede ejecutarse con MLX en un Mac con RAM unificada, ofreciendo respuestas en inglés sin conexión a internet. Su cuantización a 4-bit reduce el uso de memoria, lo que facilita su uso en equipos de consumo.
- Redacción de documentos técnicos: permite generar borradores de correos, informes y documentación en inglés. Al ser un modelo de 7B, ofrece un equilibrio entre calidad y velocidad para tareas de redacción automatizada.
- Análisis de texto: se puede usar para clasificar o extraer información de documentos en inglés, aunque requiere validación de calidad antes de desplegarse en producción.
- Prototipado de aplicaciones de IA: adecuado para pruebas de concepto en desarrollo local, ya que no necesita servidores externos y se integra fácilmente con MLX en entornos Apple.
- Generación de código: como modelo basado en Mistral, puede asistir en tareas de programación en inglés, pero no hay confirmación de ajuste específico para código. Se recomienda probar su precisión antes de usarlo en entornos de desarrollo.
- Enseñanza y educación: puede servir como tutor de inglés o para generar ejercicios de lenguaje, siempre que se valide el contenido para evitar errores o sesgos no documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Tamaño del repositorio: 4.1 GB, lo que indica que los pesos cuantizados a 4-bit ocupan aproximadamente 4.1 GB.
- VRAM estimada: no disponible oficialmente; se estima entre 4 y 5 GB de RAM unificada en Apple Silicon.
- GPU recomendadas: no disponible. El modelo está diseñado para MLX y funciona mejor en Apple Silicon (M1, M2, M3 y posteriores). No hay datos para GPUs NVIDIA o AMD.
- ¿Cabe en consumer GPU? En Apple Silicon sí, con 8 GB o más de RAM unificada. En GPUs de escritorio, no hay soporte nativo de MLX, aunque se podría convertir a GGUF o a otro formato, pero no está documentado.
- Opciones de despliegue: MLX (principal), Hugging Face transformers (con los pesos sin cuantizar), llama.cpp (requiere conversión a GGUF, no incluida).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han encontrado modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- Licencia no especificada: el uso comercial y la redistribución son legalmente inciertos.
- Solo inglés: el rendimiento en otros idiomas no está garantizado.
- Sin evaluación de seguridad: no hay información sobre sesgos, filtros de contenido o alineación.
- Riesgo de alucinación: no se documentan mitigaciones.
- Documentación incompleta: no hay benchmarks, datos de entrenamiento ni instrucciones de uso claras.

## Enlaces

- Hugging Face: https://huggingface.co/stefra/Mistral_AM_MLX-4bit
