# SZLHOLDINGS/salad-ring-ouro-l39

## Resumen

`salad-ring-ouro-l39` es un artefacto de modelo publicado por la organización SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina su "estate governed-AI", un conjunto de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de "receipts" (recibos de auditoría). El repositorio se creó el 18 de noviembre de 2026 y se actualizó dos días después, el 20 de noviembre de 2026.

La model card no proporciona información técnica sobre el modelo: no se indica arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni idiomas soportados. El autor remite explícitamente a los ficheros de receipt del "estate mesh" para cualquier afirmación sobre entrenamiento o evaluación, y declara que todo lo que no esté receipted debe considerarse UNKNOWN (desconocido). Esta ficha refleja, por tanto, únicamente lo que el repositorio afirma de forma verificable.

El interés actual del artefacto es limitado para desarrolladores e investigadores: cero descargas, cero likes, sin pipeline declarado y sin licencia especificada. Se documenta aquí como ejercicio de evaluación rigurosa de un modelo opaco, dejando constancia explícita de los datos no disponibles en lugar de inferirlos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. La model card no menciona si se trata de un transformer denso, un modelo MoE, una arquitectura híbrida o cualquier otra variante, ni detalla el número de tokens de entrenamiento, la composición del dataset o si se aplicaron técnicas de alineación como RLHF o DPO.

El autor declara que las afirmaciones sobre entrenamiento y evaluación "viven en sus ficheros de receipt (véase el estate mesh)" y que cualquier dato no incluido en esos receipts debe considerarse desconocido. No se han localizado en la información proporcionada enlaces directos a dichos receipts ni detalles sobre innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- No se declaran capacidades específicas en la model card.
- No se confirma soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se confirma soporte de tool calling ni function calling.
- No se confirma soporte de agentes ni razonamiento multi-paso.
- No se confirman capacidades multilingües.
- No se declaran modos especiales (thinking mode, visión, audio).

## Casos de uso

No es posible recomendar casos de uso concretos sin datos verificables sobre arquitectura, tamaño, contexto y licencia. Los escenarios que se enumeran a continuación son genéricos para modelos de lenguaje y quedan condicionados a que el autor publique la información técnica y los receipts correspondientes:

- Evaluación comparativa interna: usar el artefacto como referencia en pipelines de evaluación propios, siempre que se obtengan los pesos y se verifique su formato.
- Integración en prototipos de laboratorio: solo si se confirma la licencia y el formato de pesos, podría probarse en entornos controlados sin exposición a producción.
- Auditoría de trazabilidad: el modelo sirve como caso de estudio del enfoque "receipted" de SZLHOLDINGS, útil para equipos que diseñan sus propios sistemas de auditoría de modelos.
- Reproducibilidad de artefactos: verificar si los receipts referenciados permiten reconstruir el proceso de entrenamiento y evaluación.
- Docencia sobre model cards: ejemplo de documentación que declara explícitamente lo desconocido en lugar de inventar métricas.
- Investigación sobre gobernanza de IA: analizar cómo se estructura el "estate" de SZLHOLDINGS y qué garantías ofrece frente a modelos sin trazabilidad.

En ningún caso se recomienda su despliegue en producción sin licencia clara, formato de pesos confirmado y benchmarks verificables.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La propia model card indica que "no benchmark number is asserted on this card beyond what a dated audit measured" y que los datos no receipted se marcan como UNKNOWN.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa fiable sin conocer el tamaño, la arquitectura y la licencia del modelo. Cualquier comparación con alternativas de la misma categoría requeriría primero identificar dicha categoría, dato que la model card no proporciona.

## Limitaciones y advertencias

- Opacidad total: sin arquitectura, parámetros, contexto ni idiomas declarados, es imposible evaluar su idoneidad técnica.
- Licencia no especificada: no se puede determinar si el uso comercial está permitido; tratar como no apto para producción hasta confirmación.
- Sin benchmarks ni métricas: no hay evidencia de rendimiento publicada ni verificable en el repositorio.
- Sin descargas ni likes: no existe validación por parte de la comunidad.
- Riesgo de alucinación: desconocido, al no haber datos de entrenamiento ni evaluaciones.
- Sesgos: desconocidos, al no documentarse la composición del dataset.
- Dependencia de receipts externos: las afirmaciones del autor remiten a ficheros no enlazados directamente en la información disponible.
- Fecha de creación futura respecto a la mayoría de artefactos del ecosistema: conviene verificar la autenticidad y el origen del repositorio antes de cualquier uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l39
- Organización SZLHOLDINGS en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la model card): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de cards: https://github.com/szl-holdings/estate-cards
