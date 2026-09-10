# Ziyed-trading/marches-extracteur

## Resumen

El modelo `Ziyed-trading/marches-extracteur` es un modelo de lenguaje de tamaño pequeño, publicado por el usuario `Ziyed-trading` en HuggingFace. Cuenta con 1.543.714.304 parámetros totales, lo que lo sitúa en la categoría de modelos de menos de 2.000 millones de parámetros. El repositorio contiene pesos en formato `safetensors` y también incluye cuantizaciones en formato `GGUF`, lo que facilita su ejecución en entornos con recursos limitados, como portátiles, dispositivos edge o servidores con CPUs a través de `llama.cpp`.

A pesar de su pequeño tamaño, el modelo está etiquetado como `conversational`, lo que indica que su uso previsto es el de mantener diálogos en lenguaje natural. Sin embargo, la información disponible es muy limitada: no se detalla la arquitectura exacta, el desarrollador original, los idiomas soportados ni la licencia. Dado su volumen, podría tratarse de un modelo fine-tuned sobre una base existente (como una variante de la familia LLaMA o Mistral), pero no hay datos suficientes para confirmar este extremo.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | 1.543.714.304 |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (cuantizaciones específicas no documentadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

La información pública no incluye detalles sobre la arquitectura interna del modelo. El único dato estructural es el recuento de parámetros: 1.543.714.304 (aproximadamente 1,54 B). No se dispone de información sobre el tipo de transformador (denso, MoE, híbrido), el número de capas, la dimensión de los embeddings, ni el tamaño de la ventana de contexto. Al tratarse de un modelo pequeño y con formato GGUF, es probable que siga una arquitectura transformer convencional, pero no es posible confirmarlo sin documentación adicional.

Tampoco se han publicado datos sobre el corpus de entrenamiento (número de tokens, composición del dataset, idiomas), ni sobre técnicas de alineación como RLHF o DPO. El modelo se presenta como `conversational`, lo que sugiere que fue afinado para el diálogo, pero no hay evidencias de los procesos de entrenamiento empleados. La ausencia de un `pipeline` en HuggingFace y de descripciones en el modelo dificulta cualquier afirmación técnica sólida.

## Capacidades

- Generación de texto conversacional: el modelo está etiquetado como `conversational`, por lo que es apto para mantener diálogos en lenguaje natural, aunque la calidad depende del ajuste específico.
- Compatible con endpoints: el tag `endpoints_compatible` sugiere que el modelo puede desplegarse en servicios de inferencia en la nube o mediante APIs compatibles con el formato de HuggingFace.
- Cuantización en formato GGUF: permite ejecutar el modelo en local con `llama.cpp` o `Ollama`, lo que facilita la inferencia en CPU o GPUs con poca memoria.
- No se dispone de información sobre soporte de tool calling, agentes, visión, audio o capacidades multilingües.

## Casos de uso

- Asistentes conversacionales ligeros: gracias a su tamaño de 1,5 B, puede ejecutarse en equipos de gama baja o en dispositivos embebidos para ofrecer respuestas básicas en chats automáticos, sin necesidad de servicios en la nube.
- Prototipado de agentes de texto: el formato GGUF y su compatibilidad con endpoints permiten probar rápidamente prototipos de sistemas de diálogo en entornos locales, antes de migrar a modelos más grandes.
- Aplicaciones de respuesta a preguntas en dominios cerrados: si el modelo fue afinado con un corpus específico, podría utilizarse para responder preguntas sobre un dominio concreto, aunque no hay datos que confirmen este uso.
- Integración en pipelines de procesos en los que se necesita un modelo pequeño y de baja latencia: por ejemplo, para clasificar o etiquetar conversaciones breves en sistemas de atención al cliente.
- Uso educativo o académico para estudiar el comportamiento de modelos de menos de 2 B: los pesos en safetensors permiten cargar el modelo con frameworks como `transformers` para investigación.
- Despliegue en aplicaciones de escritorio o móviles mediante `llama.cpp`: la disponibilidad de cuantizaciones GGUF posibilita la ejecución en CPUs o GPUs modestas sin depender de servicios externos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Con 1.543.714.304 parámetros, en FP32 el modelo requiere aproximadamente 6,2 GB de VRAM; con cuantización GGUF a 4 bits, el peso puede reducirse a alrededor de 1 GB, aunque el valor real depende de las cuantizaciones disponibles en el repositorio.
- GPU recomendada: para ejecución en FP16, una GPU con al menos 4 GB de VRAM sería suficiente (por ejemplo, NVIDIA GTX 1660 Super, RTX 3050). Para el formato GGUF cuantizado, puede funcionar en CPU con 4 GB de RAM y sin GPU.
- Sí cabe en GPUs de consumo: una GTX 1060 de 6 GB o una RTX 2060 de 6 GB resultan adecuadas para inferencia en FP16.
- Opciones de despliegue: vLLM (sin confirmación), llama.cpp, Ollama, text-generation-inference (TGI) y endpoints de HuggingFace.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Ziyed-trading/marches-extracteur | 1.543.714.304 | no disponible | no disponible | HuggingFace (GGUF, safetensors) |
| Qwen2.5-1.5B-Instruct | 1.540.000.000 | 32.000 | Apache 2.0 | HuggingFace |
| Llama-3.2-1B-Instruct | 1.230.000.000 | 128.000 | Llama 3.2 Community License | HuggingFace |
| TinyLlama-1.1B-Chat-v1.0 | 1.100.000.000 | 2.048 | Apache 2.0 | HuggingFace |

La comparación se limita a modelos del mismo rango de parámetros. No se dispone de datos de benchmarks para `marches-extracteur`, por lo que no se puede evaluar su rendimiento relativo. La ventaja principal de este modelo es su disponibilidad en GGUF, aunque el resto de especificaciones son desconocidas.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible. Al no conocerse los datos de entrenamiento, no es posible evaluar la presencia de sesgos.
- Riesgo de alucinación: es previsible en un modelo de 1,5 B, especialmente sin información sobre datos de entrenamiento ni técnicas de alineación. No se puede garantizar la veracidad de las respuestas.
- Limitaciones de contexto o idioma: se desconoce la ventana de contexto y los idiomas soportados. Es posible que el modelo no responda bien en español.
- Restricciones de licencia para uso comercial: la licencia no está especificada. Esto supone un riesgo importante para cualquier implementación en producción: no se puede reutilizar el modelo legalmente sin confirmar los términos.
- Cualquier caveat importante para producción: la falta de documentación, de benchmarks y de información sobre el entrenamiento hace inviable recomendar el modelo para aplicaciones críticas. Además, el modelo fue actualizado por última vez en 2026-09-09, lo que indica una publicación reciente, pero sin mantenimiento documentado.

## Enlaces

- [HuggingFace: Ziyed-trading/marches-extracteur](https://huggingface.co/Ziyed-trading/marches-extracteur)
- [Perfil del autor en HuggingFace](https://huggingface.co/Ziyed-trading)
