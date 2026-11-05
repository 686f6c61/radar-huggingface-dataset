# YY029/zils-lite-body

## Resumen

zils-lite-body es un ajuste fino (fine-tune) del modelo vllm-sr/d3-lite, que a su vez se construye sobre Qwen/Qwen3.5-0.8B. Lo desarrolla el usuario YY029 y se presenta como un "body" (cuerpo) para el pool de modelos tipo "soup" denominado Zils d3-lite, alojado en la subred 127 de Bittensor. El modelo está orientado a la toma de decisiones: dado un evento del mundo real, estima resultados probabilísticos (por ejemplo, si una edición de Wikipedia será revertida o si una pregunta de Stack Exchange se cerrará).

El interés del modelo es doble. Por un lado, es un ejemplo de ajuste fino de bajo coste sobre un modelo base pequeño de la familia Qwen3.5-0.8B, con unos 853 millones de parámetros y un entrenamiento basado en LoRA de rango 16. Por otro, su model card documenta una evaluación de retención con métrica de habilidad Brier calibrada, en la que el ajuste mejora al modelo base de 11,9 a 25,9 puntos. Es, por tanto, un caso práctico de especialización de un modelo generalista en una tarea concreta de predicción de resultados.

La relevancia actual radica en su uso dentro de un ecosistema descentralizado (Bittensor) donde los modelos compiten por puntuación en un examen común. No obstante, se trata de un modelo muy específico, sin pipeline declarado, sin idiomas documentados y con cero descargas en el momento de la consulta, por lo que debe evaluarse como un artefacto de investigación más que como un modelo listo para producción general.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B; etiqueta qwen3_5 en HuggingFace) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no disponible (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors, presumiblemente bf16) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 1,7 GB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del modelo base vllm-sr/d3-lite, que a su vez se construye sobre Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 853 millones de parámetros. El ajuste fino se realizó con la receta de referencia de Zils (`zils.d3 train`): LoRA de rango 16 aplicado a las capas de lenguaje, optimizador AdamW, tasa de aprendizaje 2e-5 y una sola época. Posteriormente, los adaptadores se fusionaron en los pesos bf16 mediante `zils.d3 candidate`.

El conjunto de datos de entrenamiento consta de 8.903 ejemplos de decisión construidos con Zils Outcomes a partir de eventos públicos anteriores al 18 de octubre de 2026 (antes del 10 de octubre para Stack Exchange). Las fuentes incluyen reversiones de ediciones de Wikipedia en inglés, alemán, español y francés, resultados de Articles for deletion y Articles for Creation, resultados de preguntas de Stack Exchange (cierre, puntuación, respuesta aceptada), categorías primarias de arXiv y resultados de cambios en Gerrit. Las filas de entrenamiento se ponderaron siguiendo las categorías del examen del pool. No se documenta el uso de RLHF ni DPO; el proceso es un ajuste supervisado sobre datos de resultados.

## Capacidades

- Predicción de resultados de eventos: estima probabilidades calibradas sobre desenlaces binarios y de puntuación (reversión de ediciones, cierre de preguntas, categorías de arXiv, cambios en Gerrit).
- Razonamiento de decisión especializado: el modelo está entrenado para emitir juicios probabilísticos, no para generación abierta de texto.
- Capacidades multilingües parciales: los datos de entrenamiento incluyen eventos en inglés, alemán, español y francés, aunque no se documenta el soporte formal de idiomas.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades de visión, audio ni modo "thinking".
- Capacidad de generación de texto general: heredada del modelo base Qwen3.5-0.8B, aunque no evaluada en esta ficha.

## Casos de uso

- Moderación predictiva de Wikipedia: estimar la probabilidad de que una edición sea revertida antes de publicarla, usando el modelo como filtro previo en herramientas de patrullaje. Es adecuado porque se entrenó con reversiones reales en cuatro idiomas.
- Priorización de borrados en Wikipedia: puntuar artículos propuestos para borrado según la probabilidad de que el resultado sea "delete", para ayudar a los administradores a ordenar la cola de revisión.
- Triaje de preguntas en Stack Exchange: predecir si una pregunta será cerrada o recibirá respuesta aceptada, permitiendo a los moderadores priorizar revisiones y a los usuarios mejorar sus publicaciones.
- Clasificación de envíos a arXiv: predecir la categoría primaria de un artículo a partir de su contenido, útil en pipelines de ingestión bibliográfica.
- Análisis de riesgo en revisión de código: estimar si un cambio en Gerrit será aceptado o rechazado, integrándolo en herramientas de revisión para señalar cambios con alta probabilidad de rechazo.
- Investigación en calibración probabilística: servir como caso de estudio de ajuste fino con LoRA y evaluación mediante Brier skill calibrada en entornos de competición descentralizada (Bittensor).
- Evaluación comparativa de modelos pequeños: usar el modelo como referencia en experimentos sobre especialización de modelos de menos de 1.000 millones de parámetros.

## Benchmarks y rendimiento

La model card reporta una evaluación de retención con 3.011 eventos posteriores (finales de octubre a principios de noviembre de 2026) nunca usados en entrenamiento, puntuados con la métrica `calibrated_brier` del pool: una temperatura por modelo ajustada sobre el 20 % de los ítems y habilidad Brier (habilidad de ranked probability score para preguntas de puntuación) sobre el resto, con familias ponderadas según el examen.

| Modelo | Puntuación (puntos) |
|---|---|
| d3-lite original | 11,9 |
| zils-lite-body | 25,9 (+14,1; IC 95 % bootstrap +11,1 a +17,0) |

El autor indica que son mediciones de desarrollo, no resultados de validador. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 853 millones de parámetros, en bf16 requiere aproximadamente 1,7 GB de pesos más memoria para activaciones y caché KV; en cuantización de 8 bits rondaría 0,9 GB y en 4 bits unos 0,5 GB, aunque el autor no documenta cuantizaciones oficiales.
- GPU recomendadas: cabe en cualquier GPU consumer moderna (RTX 3060 12 GB, RTX 4060, RTX 4090) e incluso en GPUs integradas con suficiente memoria compartida; para producción en lote se recomienda A100 o H100 por throughput, aunque no es necesario por tamaño.
- Cabe en GPU consumer: sí, con amplio margen.
- Opciones de despliegue: al usar `custom_code` y la arquitectura qwen3_5, requiere transformers con confianza remota o el código del autor; vLLM y TGI pueden requerir adaptación. llama.cpp y Ollama no están documentados para esta arquitectura concreta.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento documentado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-body | 852.985.920 | no disponible | 25,9 puntos (Brier calibrada, evaluación propia) | Apache-2.0 | HuggingFace, 0 descargas |
| vllm-sr/d3-lite (base) | no disponible (base de este modelo) | no disponible | 11,9 puntos (misma evaluación) | no disponible | HuggingFace |
| Qwen/Qwen3.5-0.8B (raíz) | ~0,8B (según nomenclatura) | no disponible | no disponible en esta ficha | no disponible | HuggingFace |

No se dispone de datos de benchmarks estándar ni de comparaciones con alternativas de la misma categoría (modelos de decisión especializados) en la información proporcionada.

## Limitaciones y advertencias

- Modelo altamente especializado: entrenado exclusivamente para predicción de resultados de eventos concretos; su uso como modelo de chat o generación general no está validado.
- Riesgo de alucinación y sobreajuste: con solo una época sobre 8.903 ejemplos, puede sobreajustar a los patrones de las familias de eventos incluidas y generalizar mal a dominios no vistos.
- Idiomas: aunque los datos incluyen inglés, alemán, español y francés, no se documenta el soporte formal ni la calidad por idioma.
- Contexto: no se especifica la longitud máxima de contexto, lo que impide planificar su uso en entradas largas.
- Licencia Apache-2.0: permite uso comercial, pero se debe conservar el aviso de licencia y el NOTICE; el modelo base puede tener condiciones adicionales no detalladas.
- Resultados de evaluación de desarrollo: las puntuaciones reportadas no han sido verificadas por validadores del pool y no deben interpretarse como rendimiento en producción.
- Cero descargas y sin pipeline declarado: no hay evidencia de uso comunitario ni de mantenimiento.
- Requiere código personalizado (`custom_code`) para cargarse, lo que añade fricción y riesgo de seguridad al ejecutar código remoto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YY029/zils-lite-body
- Modelo base: https://huggingface.co/vllm-sr/d3-lite
- Modelo raíz: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Bittensor: https://bittensor.com
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
