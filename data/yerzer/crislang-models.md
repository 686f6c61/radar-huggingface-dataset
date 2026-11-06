# yerzer/crislang-models

## Resumen

Crislang models es un repositorio de redistribución de cuantizaciones GGUF del modelo Gemma 4, desarrollado originalmente por Google y cuantizado por Unsloth. El autor, yerzer, publica copias sin modificar de tres ficheros GGUF bajo licencia Apache 2.0 para su uso en la aplicación de aprendizaje de idiomas Crislang. No se trata, por tanto, de un modelo entrenado o ajustado por el autor, sino de un espejo de artefactos de inferencia del modelo base.

El modelo subyacente es Gemma 4 en sus variantes E2B y E4B, en formato instruction-tuned (it) y con quantización-aware training (qat). El repositorio incluye las cuantizaciones UD-Q2_K_XL y UD-Q4_K_XL para la variante E2B, y UD-Q4_K_XL para la variante E4B. El dato de parámetros reportado en safetensors asciende a 4.628.569.635, correspondiente a la variante E4B.

La relevancia de este repositorio es limitada desde el punto de vista técnico: su interés radica en servir como ejemplo de redistribución de artefactos GGUF bajo Apache 2.0 y en su uso práctico para despliegue local de un modelo conversacional de tamaño medio en aplicaciones de aprendizaje de idiomas. No aporta innovaciones arquitectónicas ni datos de entrenamiento propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Gemma 4, segun modelo base) |
| Parametros totales | 4.628.569.635 (variante E4B, dato safetensors) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF: UD-Q2_K_XL, UD-Q4_K_XL |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |

## Arquitectura y entrenamiento

No se dispone de información detallada sobre la arquitectura interna del modelo base Gemma 4 más allá de que se trata de un transformer decoder-only instruction-tuned. El repositorio no documenta el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. La única información técnica relevante es que las cuantizaciones originales fueron realizadas por Unsloth con su metodología UD (Unsloth Dynamic), que aplica cuantización selectiva por capas, y que el modelo base emplea quantización-aware training (QAT), lo que habitualmente reduce la pérdida de calidad en cuantizaciones agresivas como Q2.

El autor no ha realizado ningún ajuste fino ni modificación de los pesos: el repositorio contiene copias sin modificar de los ficheros GGUF. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o arquitecturas híbridas.

## Capacidades

- Generación de texto conversacional en formato instruction-tuned, adecuado para diálogos multi-turno.
- Razonamiento y respuesta a instrucciones, según las capacidades heredadas del modelo base Gemma 4.
- Capacidades multilingües: no documentadas en este repositorio; dependen del modelo base.
- Soporte de tool calling / function calling: no documentado.
- Soporte de agentes y razonamiento multi-paso: no documentado.
- Capacidades de visión, audio o modo thinking: no documentadas.
- Inferencia local en CPU y GPU gracias al formato GGUF y a las cuantizaciones de 2 y 4 bits.

## Casos de uso

- Aplicación de aprendizaje de idiomas Crislang: el repositorio se publica específicamente para alimentar esta app, que puede ejecutar el modelo localmente en dispositivos con recursos limitados usando la cuantización Q2_K_XL.
- Despliegue en dispositivos de gama baja: la variante E2B en Q2_K_XL reduce el peso a aproximadamente 1-2 GB, permitiendo inferencia en CPU o GPUs integradas para tareas conversacionales básicas.
- Prototipado rápido de asistentes conversacionales: al estar en GGUF, se integra directamente en llama.cpp, Ollama o LM Studio sin conversión adicional.
- Generación de ejercicios lingüísticos: el modelo puede producir frases, correcciones gramaticales y diálogos guiados en el contexto de una app educativa.
- Evaluación de cuantizaciones: el repositorio permite comparar el rendimiento de Q2_K_XL frente a Q4_K_XL sobre el mismo modelo base para decidir el equilibrio calidad/tamaño en producción.
- Distribución de artefactos en entornos con licencia Apache 2.0: útil para equipos que necesitan un modelo conversacional con licencia permisiva y formato GGUF listo para usar.
- Inferencia en edge computing: la variante E4B en Q4_K_XL ocupa aproximadamente 3-4 GB, viable en mini-PCs y dispositivos con 8 GB de RAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para E2B Q2_K_XL: aproximadamente 1-2 GB; cabe en GPUs integradas y en CPU con 4 GB de RAM.
- VRAM estimada para E2B Q4_K_XL: aproximadamente 2-3 GB; viable en GPUs consumer de gama baja (GTX 1650, RTX 3050).
- VRAM estimada para E4B Q4_K_XL: aproximadamente 3-4 GB; requiere al menos 6 GB de VRAM para margen de contexto, o 8 GB de RAM en CPU.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 8 GB, RTX 4090 para mayor throughput; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en todas las variantes cuantizadas.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, llama-cpp-python; compatible con endpoints según el tag `endpoints_compatible`.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| Crislang models (Gemma 4 E4B Q4_K_XL) | 4.628.569.635 | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Gemma 4 E2B it QAT (Unsloth) | no disponible | no disponible | Apache 2.0 | GGUF | Hugging Face |
| Gemma 4 E4B it QAT (Unsloth) | no disponible | no disponible | Apache 2.0 | GGUF | Hugging Face |

No se dispone de información suficiente para comparar con alternativas de otros desarrolladores (por ejemplo, Llama, Qwen o Mistral en tamaños equivalentes) sin inventar datos. La comparativa se limita a las variantes del propio modelo base.

## Limitaciones y advertencias

- El repositorio no es un modelo original: son copias sin modificar de artefactos de Google y Unsloth, por lo que cualquier limitación del modelo base aplica íntegramente.
- No se documentan sesgos conocidos, pero al heredar el comportamiento de Gemma 4, es probable que presente sesgos similares a los de modelos entrenados con datos web a gran escala.
- Riesgo de alucinación inherente a los modelos generativos; no hay evaluaciones publicadas en este repositorio.
- La cuantización Q2_K_XL degrada la calidad respecto a Q4_K_XL; no se recomienda para tareas que requieran precisión alta.
- No se documentan los idiomas soportados ni la longitud de contexto, lo que dificulta planificar su uso en producción.
- La licencia Apache 2.0 se aplica a la redistribución, pero el autor no aclara posibles restricciones adicionales de los términos de uso de Gemma; conviene verificar la licencia del modelo base antes de uso comercial.
- El autor declara no estar afiliado ni respaldado por Google; la marca Gemma pertenece a Google.
- El repositorio tiene 42 descargas y 0 likes, sin señales de validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/yerzer/crislang-models
- Modelo base E2B QAT GGUF: https://huggingface.co/unsloth/gemma-4-E2B-it-qat-GGUF
- Modelo base E4B QAT GGUF: https://huggingface.co/unsloth/gemma-4-E4B-it-qat-GGUF
- Licencia Apache 2.0: https://www.apache.org/licenses/LICENSE-2.0
- Unsloth: https://huggingface.co/unsloth
- Google Gemma: https://ai.google.dev/gemma
