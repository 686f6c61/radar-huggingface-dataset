# tugot17/mango-gguf

## Resumen

mango-gguf es un repositorio de pesos en formato GGUF publicado por el usuario tugot17 en HuggingFace. Se trata de una derivación cuantizada del modelo base LiquidAI/LFM2.5-VL-3B, un modelo de la familia LFM2.5 de Liquid AI que, a juzgar por su identificador, incorpora capacidades de visión y lenguaje ("VL") y un tamaño nominal de 3B. El repositorio está etiquetado como conversacional y compatible con endpoints, y su acceso está restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargarlo.

La relevancia del modelo es difícil de evaluar con la información disponible: no registra descargas ni "likes", no declara pipeline, idiomas ni documentación técnica. El recuento de parámetros reportado por safetensors es de 279.468.801, una cifra que no concuerda con un modelo base de 3B —lo que sugiere que el dato corresponde a un componente parcial (por ejemplo, el proyector multimodal) o que el repositorio no contiene el modelo completo—. Se recomienda verificar el contenido real del repositorio antes de cualquier uso.

Las búsquedas web realizadas no han devuelto información relacionada con el modelo: los resultados obtenidos corresponden a guías sobre pruebas genéticas en cáncer de próstata y no guardan ninguna relación con este repositorio. Por tanto, la mayor parte de las especificaciones figuran como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (hereda del modelo base LiquidAI/LFM2.5-VL-3B; no confirmada) |
| Parámetros totales | 279.468.801 (según safetensors; en aparente contradicción con el modelo base de 3B) |
| Parámetros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF; no se detallan los niveles concretos (Q4_K_M, Q5_K_M, Q8_0, etc.) |
| Idiomas soportados | no disponible |
| Licencia | other (otra); acceso restringido (gated), requiere aceptar condiciones |
| Formato de pesos | GGUF; el repositorio también declara datos de safetensors (posible proyector multimodal) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna, los datos de entrenamiento, el número de tokens, la composición del dataset ni el uso de técnicas de alineación (RLHF, DPO u otras). El único dato estructural fiable es que se trata de una conversión a GGUF derivada del modelo LiquidAI/LFM2.5-VL-3B. La familia LFM2 de Liquid AI se asocia habitualmente a arquitecturas híbridas, pero no se confirma en la información proporcionada.

Tampoco se documentan innovaciones técnicas específicas (decodificación especulativa, atención lineal, etc.) ni el proceso de cuantización aplicado. El recuento de parámetros declarado (279,5 M) resulta inconsistente con un modelo base de 3B, por lo que se desconoce si el repositorio contiene un modelo completo, una cuantización parcial o únicamente componentes auxiliares.

## Capacidades

- Generación de texto conversacional: el repositorio está etiquetado como "conversational", por lo que se espera soporte de diálogo multi-turno.
- Capacidades de visión: el sufijo "VL" del modelo base indica procesamiento de imagen y texto, aunque no se detalla su alcance.
- Compatibilidad con endpoints: la etiqueta "endpoints_compatible" sugiere que puede servirse a través de infraestructuras de despliegue estándar.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, audio, etc.): no disponible.

## Casos de uso

- Prototipado de asistentes conversacionales multimodales: al derivar de un modelo VL, permitiría experimentar con diálogo que combine texto e imagen en entornos de desarrollo.
- Inferencia local en hardware modesto: el formato GGUF facilita su ejecución con llama.cpp u Ollama en equipos sin GPU dedicada, si el tamaño real del modelo es reducido.
- Despliegue en endpoints compatibles: la etiqueta "endpoints_compatible" apunta a su uso en servicios de inferencia estandarizados (por ejemplo, TGI o endpoints gestionados que acepten GGUF).
- Análisis de imágenes en local: descripción de imágenes, extracción de texto (OCR) o respuesta a preguntas visuales, siempre que se confirme la capacidad de visión y el modelo completo esté presente.
- Experimentación académica con cuantizaciones: útil para comparar el impacto de distintos niveles de cuantización GGUF sobre la calidad de salida de un modelo VL de 3B.
- Integración en aplicaciones de escritorio offline: al no requerir conexión a servicios en la nube, encaja en herramientas locales de asistencia que manejen contenido sensible.
- Evaluación comparativa de derivados comunitarios: sirve como punto de referencia frente a otras conversiones GGUF del mismo modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. Si el modelo corresponde realmente a un base de 3B, una cuantización Q4_K_M ocuparía aproximadamente 2-2,5 GB, Q8_0 en torno a 3,5 GB y precisión f16 cerca de 6-7 GB; si el peso efectivo fuese de 279 M parámetros, bastarían unos cientos de MB. Estas cifras son estimaciones orientativas, no datos confirmados.
- GPU recomendadas: no disponibles. Como referencia de categoría, un modelo de 3B en Q4 puede ejecutarse cómodamente en GPUs de consumo.
- Compatibilidad con GPU de consumo: previsiblemente sí, en tarjetas tipo RTX 3060 12 GB, RTX 4060 o superiores, siempre que se confirme el tamaño real del modelo.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio, koboldcpp y text-generation-webui (por el formato GGUF); vLLM y TGI solo de forma parcial o mediante conversión.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|---|
| tugot17/mango-gguf | 279,5 M (reportados; ver nota) | no disponible | texto + visión (según base) | other (gated) | GGUF | restringida |
| LiquidAI/LFM2.5-VL-3B (modelo base) | no disponible | no disponible | texto + visión | no disponible | no disponible | según Liquid AI |
| Modelos VL de gama similar (por ejemplo, Qwen2.5-VL-3B, SmolVLM2-2.2B) | no disponible | no disponible | texto + visión | no disponible | no disponible | pública |

No se dispone de datos verificados de rendimiento, contexto ni licencia para establecer una comparación cuantitativa fiable con alternativas de la misma categoría.

## Limitaciones y advertencias

- Acceso restringido: el repositorio es gated y exige aceptar condiciones en HuggingFace, lo que puede limitar su uso automatizado o en pipelines de producción.
- Licencia "other": los términos exactos no están detallados en la información disponible, por lo que el uso comercial no puede darse por permitido sin revisar las condiciones asociadas.
- Inconsistencia en los parámetros: el dato de 279,5 M no encaja con un modelo base de 3B, lo que impide garantizar que el repositorio contenga el modelo completo.
- Ausencia de documentación: no hay ficha técnica, idiomas declarados, pipeline ni detalles de entrenamiento.
- Riesgo de alucinación: no se dispone de evaluaciones de fiabilidad; como cualquier modelo generativo, puede producir contenido incorrecto.
- Sesgos conocidos: no disponible.
- Limitaciones de contexto o idioma: no disponible.
- Madurez del repositorio: cero descargas y cero "likes", sin mantenimiento ni validación por parte de la comunidad.
- Caveat para producción: la falta de datos verificados de rendimiento y licencia desaconseja su uso en entornos críticos sin una evaluación previa propia.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/tugot17/mango-gguf
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-VL-3B
- No se han encontrado papers, blogs, repositorios ni demos adicionales relacionados con este modelo en las búsquedas web realizadas.
