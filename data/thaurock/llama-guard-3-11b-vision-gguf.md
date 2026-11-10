# Thaurock/Llama-Guard-3-11B-Vision-GGUF

## Resumen

Llama-Guard-3-11B-Vision-GGUF es una conversión a formato GGUF del modelo Llama-Guard-3-11B-Vision de Meta, publicada por el usuario Thaurock en Hugging Face. Llama-Guard-3-11B-Vision es un modelo de clasificación de seguridad multimodal diseñado para detectar contenido dañino tanto en texto como en imágenes, construido sobre la arquitectura Mllama (MllamaForConditionalGeneration). Esta conversión concreta incluye el proyector de visión y se distribuye en cuantizaciones F16 y Q8_0.

El aspecto más relevante de esta ficha es una advertencia crítica emitida por el propio autor: a fecha de noviembre de 2026, llama.cpp upstream no implementa soporte nativo para la arquitectura Mllama, por lo que estos archivos GGUF no son ejecutables mediante las herramientas estándar de llama.cpp (llama-cli, llama-server). Se trata, por tanto, de artefactos de conversión experimentales orientados a investigación, desarrollo y pruebas futuras de compatibilidad con runtimes, no de un modelo listo para producción.

La relevancia de este repositorio es doble: por un lado, documenta el estado del arte en la conversión de modelos multimodales de seguridad a GGUF; por otro, sirve como caso de estudio de la brecha entre la serialización de pesos y la disponibilidad de un backend de inferencia que soporte la arquitectura. El repositorio ocupa 34,5 GB y acumula 216 descargas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mllama (MllamaForConditionalGeneration), multimodal texto+imagen |
| Parametros totales | 895.028.756 (según safetensors del modelo base; el nombre comercial indica 11B, dato no verificado en la información disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | F16 y Q8_0 |
| Idiomas soportados | no disponible |
| Licencia | llama3.2 |
| Formato de pesos | GGUF (incluye proyector de visión / mmproj) |

## Arquitectura y entrenamiento

El modelo base es Llama-Guard-3-11B-Vision, un clasificador de seguridad multimodal de Meta construido sobre la arquitectura Mllama, que combina un codificador de visión con un transformer de lenguaje y mecanismos de cross-attention para integrar ambas modalidades. La conversión de Thaurock preserva el proyector de visión y serializa los pesos en GGUF en dos precisiones (F16 y Q8_0), manteniendo la estructura completa del modelo multimodal.

No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO en el modelo base. La conversión en sí no introduce cambios arquitectónicos: es una re-serialización de pesos. La innovación técnica del repositorio es la propia conversión multimodal completa (incluyendo el proyector de visión), pero su limitación principal es que llama.cpp no implementa aún la ejecución de Mllama, incluyendo cross-attention, integración del codificador de visión, manejo del proyector multimodal y pipeline de procesamiento de imágenes.

## Capacidades

- Clasificación de seguridad multimodal: detección de contenido dañino en texto e imágenes (función principal del modelo base Llama-Guard-3-11B-Vision).
- Procesamiento de imágenes mediante codificador de visión y proyector multimodal incluidos en la conversión.
- Generación de texto (capacidad heredada del modelo base, sujeta a la disponibilidad de un runtime compatible).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.
- Ejecución mediante llama.cpp upstream: no soportada actualmente (limitación crítica documentada por el autor).

## Casos de uso

- Investigación sobre conversión de modelos multimodales a GGUF: el repositorio sirve como referencia técnica para estudiar cómo se serializan arquitecturas Mllama (incluyendo proyector de visión) en formato GGUF, útil para desarrolladores que trabajen en tooling de conversión.
- Pruebas de compatibilidad futura con runtimes: los archivos pueden emplearse para validar implementaciones venideras de Mllama en llama.cpp u otros backends una vez que el soporte nativo esté disponible.
- Desarrollo de pipelines de moderación multimodal (a futuro): cuando exista un runtime compatible, el modelo podría integrarse en sistemas de filtrado de contenido que analicen simultáneamente texto e imágenes en plataformas sociales o foros.
- Evaluación comparativa de cuantizaciones: las versiones F16 y Q8_0 permiten estudiar el impacto de la cuantización en un modelo multimodal de seguridad, midiendo degradación de precisión en la clasificación.
- Docencia y formación técnica: como ejemplo práctico de las limitaciones de la cadena de herramientas GGUF frente a arquitecturas multimodales emergentes.
- Auditoría de seguridad de modelos: análisis de las capacidades de detección de contenido dañino del modelo base mediante inspección de pesos y pruebas offline, sin necesidad de inferencia en tiempo real.
- Benchmarking de backends alternativos: uso de los artefactos para comparar el rendimiento de distintos motores de inferencia que pudieran implementar Mllama en el futuro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma fiable, ya que el modelo no es ejecutable actualmente en llama.cpp. Como referencia orientativa, un modelo de ~11B en F16 requeriría del orden de 22 GB solo para pesos, y en Q8_0 alrededor de 11-12 GB, más el overhead del codificador de visión y del contexto (estimación genérica, no verificada para esta arquitectura).
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; la limitación principal no es de VRAM sino de soporte de runtime.
- Opciones de despliegue: llama.cpp upstream no soporta Mllama actualmente. No se documentan alternativas de despliegue funcionales en la información disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Ejecutable en llama.cpp |
|---|---|---|---|---|---|
| Thaurock/Llama-Guard-3-11B-Vision-GGUF | 895 M (según safetensors) / 11B nominal | no disponible | Texto + imagen | llama3.2 | No (Mllama no soportado) |
| meta-llama/Llama-Guard-3-11B-Vision (original) | 11B nominal | no disponible | Texto + imagen | llama3.2 | No aplica (pesos originales) |
| Llama-Guard-3-8B | 8B | no disponible | Texto | llama3.2 | Sí (arquitectura Llama estándar) |
| Llama-Guard-3-1B | 1B | no disponible | Texto | llama3.2 | Sí (arquitectura Llama estándar) |

La comparativa se limita a variantes de la familia Llama Guard por ser la categoría directa; no se dispone de datos de rendimiento comparativo en la información proporcionada.

## Limitaciones y advertencias

- Limitación crítica de ejecución: el autor advierte explícitamente que llama.cpp upstream no implementa Mllama, por lo que llama-cli y llama-server no pueden ejecutar este modelo. Los archivos son artefactos experimentales, no un modelo funcional.
- Cargar el GGUF del modelo de lenguaje junto con el mmproj no proporciona soporte de ejecución por sí mismo.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no cuantificado en la información disponible.
- Sesgos conocidos: no documentados en la información proporcionada.
- Limitaciones de contexto o idioma: no disponibles.
- Restricciones de licencia: licencia llama3.2, que impone condiciones de uso (incluida la política de uso aceptable de Llama) y requiere revisión para uso comercial.
- Para producción: no recomendado en su estado actual debido a la ausencia de runtime compatible; cualquier uso debe considerarse investigación o desarrollo.
- El dato de parámetros totales (895 M según safetensors) no coincide con la denominación comercial «11B»; conviene verificar la estructura real de pesos antes de planificar requisitos de hardware.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Thaurock/Llama-Guard-3-11B-Vision-GGUF
- Modelo base: https://huggingface.co/meta-llama/Llama-Guard-3-11B-Vision
- Repositorio llama.cpp: https://github.com/ggml-org/llama.cpp
- Documentación de Llama (licencia y política de uso): https://www.llama.com/llama3_2/license/
