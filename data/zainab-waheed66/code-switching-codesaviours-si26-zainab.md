# Zainab-waheed66/code-switching-codesaviours-si26-Zainab

## Resumen

El modelo `code-switching-codesaviours-si26-Zainab` es un fine-tuning de XLM-RoBERTa-base para clasificación de tokens (token classification) en texto con cambio de código (code-switching) entre inglés y urdu romanizado. Lo desarrolla Zainab Waheed como parte del proyecto Code Saviours SI-26, un programa de prácticas de ML/AI. El modelo está diseñado para identificar atributos a nivel de token en oraciones multilingües mixtas, lo que lo hace relevante para el análisis lingüístico de fenómenos de code-switching y para pipelines de procesamiento de texto multilingüe.

Con 277 millones de parámetros y una arquitectura transformer basada en XLM-RoBERTa, el modelo se ha afinado durante 8 épocas sobre un dataset de code-switching anotado. Su salida es una etiqueta por token, lo que lo hace adecuado para tareas de identificación de idioma a nivel de token o reconocimiento de entidades nombradas en contextos multilingües. El modelo se distribuye con licencia MIT y pesos en formato safetensors.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | XLM-RoBERTa (transformer encoder) |
| Parametros totales | 277.455.363 |
| Parametros activos | no aplicable (modelo denso) |
| Longitud de contexto | 512 tokens (heredada de XLM-RoBERTa-base) |
| Tipos de cuantizacion | no disponible (solo se publican pesos en fp32) |
| Idiomas soportados | Ingles, urdu (y code-switching entre ambos) |
| Licencia | MIT (segun model card) / no disponible (segun metadata de HuggingFace) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte de XLM-RoBERTa-base, un transformer de tipo encoder basado en la arquitectura RoBERTa con entrenamiento multilingüe. La capa de clasificación se ha sustituido por una cabeza de clasificación de tokens (token classification head) que predice una etiqueta para cada token de la secuencia de entrada. El modelo se ha afinado durante 8 épocas sobre un dataset de code-switching entre urdu e inglés, con anotaciones a nivel de token. Se ha utilizado entrenamiento con precisión mixta fp16/bf16.

La información sobre el dataset de entrenamiento es limitada: se indica que es un dataset de code-switching anotado para tareas de clasificación de tokens, pero no se especifica el número total de tokens, la composición exacta del dataset ni si se usaron técnicas de post-entrenamiento como RLHF o DPO. No se publican detalles adicionales sobre el preprocesado ni sobre el procedimiento de entrenamiento.

## Capacidades

- Clasificación de tokens para texto con code-switching entre urdu e inglés.
- Identificación de idioma a nivel de token (language identification).
- Reconocimiento de entidades nombradas (NER) en contexto multilingüe.
- Integración en pipelines de procesamiento de lenguaje natural para textos mixtos.
- Soporte de la pipeline de token-classification de HuggingFace.
- Entrada y salida compatible con Transformers (AutoTokenizer, AutoModelForTokenClassification).

## Casos de uso

- Análisis lingüístico de code-switching: el modelo permite etiquetar cada token de una oración mixta urdu-inglés, lo que es útil para estudiar patrones de alternancia de código en corpus académicos o sociolingüísticos.
- Preprocesado para sistemas de análisis de sentimiento multilingüe: al identificar el idioma de cada token, se puede segmentar el texto y aplicar modelos de análisis de sentimiento específicos por idioma.
- Construcción de pipelines de NLP para redes sociales: el texto de redes sociales en Pakistán o comunidades urdu-hablantes contiene frecuente code-switching; el modelo puede normalizar o etiquetar estos textos para tareas posteriores.
- Desarrollo de sistemas de transcripción o subtitulación: el modelo puede ayudar a etiquetar segmentos de habla en urdu-inglés para su procesamiento posterior.
- Investigación en sociolingüística computacional: el modelo puede servir para cuantificar el grado de code-switching en corpus de conversaciones o textos escritos.
- Integración en sistemas de asistencia multilingüe: el modelo puede preprocesar entradas de usuarios que mezclan urdu e inglés antes de pasarlas a un modelo de generación o comprensión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye métricas de evaluación (precisión, recall o F1) sobre ningún conjunto de test público ni comparación con otros modelos de clasificación de tokens multilingües.

## Requisitos de hardware

- VRAM estimada para inferencia: el modelo tiene 277 M parámetros, por lo que en fp32 ocupa aproximadamente 1,1 GB. Con un batch de tamaño 1 y secuencias de 512 tokens, la VRAM necesaria para inferencia está en torno a 2-3 GB.
- GPU recomendadas: cualquier GPU con 4 GB de VRAM o más (GTX 1650, RTX 2060, RTX 3060, etc.) es suficiente para inferencia. Para entrenamiento o fine-tuning adicional se recomienda una GPU con 8-12 GB (RTX 3070/3080, A100).
- Sí cabe en GPUs de consumo: RTX 3060, RTX 4060, RTX 4090, etc.
- Opciones de despliegue: transformers (PyTorch), ONNX Runtime, TensorFlow, y cualquier servidor de inferencia compatible con transformers (TGI, vLLM, Triton).
- Latencia y throughput: no disponible. Para un modelo de 277 M parámetros en una GPU moderna, la latencia por secuencia de 512 tokens suele ser de 10-50 ms, pero no hay datos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia |
|---|---|---|---|---|
| XLM-RoBERTa-base | 277 M | 512 | Multilingüe general | MIT |
| mBERT | 178 M | 512 | Multilingüe general | Apache-2.0 |
| MuRIL | 244 M | 512 | Multilingüe (17 idiomas indios) | Apache-2.0 |
| code-switching-codesaviours-si26-Zainab | 277 M | 512 | Token classification code-switching urdu-inglés | MIT (según model card) |

Este modelo es un fine-tuning de XLM-RoBERTa-base, por lo que comparte arquitectura y peso de inicio con el modelo base. Su ventaja frente a los modelos multilingües generales es que está afinado específicamente para el fenómeno de code-switching entre urdu e inglés, que los modelos generales no cubren de manera específica.

## Limitaciones y advertencias

- El modelo se ha entrenado en un dataset de code-switching específico, y su rendimiento puede degradarse en dominios conversacionales o formales significativamente diferentes de su distribución de entrenamiento (por ejemplo, texto médico, legal o técnico).
- No se han publicado métricas de evaluación, por lo que no se puede cuantificar su rendimiento real.
- La licencia es MIT según la model card, pero la metadata de HuggingFace indica "no disponible"; se recomienda contactar con el autor antes de uso comercial.
- El modelo no está optimizado para generación de texto ni para tareas fuera de la clasificación de tokens.
- El modelo puede reflejar sesgos presentes en el dataset de entrenamiento (por ejemplo, variantes de urdu no estándar, slang, etc.).
- Riesgo de alucinación no aplica (no es un modelo generativo), pero sí de errores de clasificación en tokens ambiguos o palabras compartidas entre urdu e inglés.
- El modelo tiene 0 descargas y 0 likes en el Hub, lo que indica que no hay validación comunitaria ni evidencia de uso en producción.

## Enlaces

- [HuggingFace - Modelo](https://huggingface.co/Zainab-waheed66/code-switching-codesaviours-si26-Zainab)
- [HuggingFace - Dataset](https://huggingface.co/datasets/Zainab-Binte-Khalid/code-switching-codesaviours-si26-zainab)
- [GitHub - Repositorio del proyecto](https://github.com/Zainab-Binte-Khalid/code-switching-codesaviours-si26-zainab)
- [GitHub - Repositorio alternativo](https://github.com/ZanebRA/code-switching-codesaviours-si26-zaneb)
- [HuggingFace - Dataset alternativo](https://huggingface.co/datasets/zaneb-217/code-switching-codesaviours-si26-zaneb/blob/main/README.md)
