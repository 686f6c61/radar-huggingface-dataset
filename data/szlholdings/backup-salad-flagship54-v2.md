# SZLHOLDINGS/backup-salad-flagship54-v2

## Resumen

`SZLHOLDINGS/backup-salad-flagship54-v2` es un artefacto de modelo publicado en Hugging Face por la organización SZL Holdings dentro de lo que el autor denomina "governed-AI estate": un catálogo de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibo (receipts) y resultados verificables. El repositorio ocupa 27,5 GB y contiene pesos en formato safetensors, lo que sitúa el artefacto en el rango de modelos de decenas de miles de millones de parámetros, aunque la model card no declara el número exacto.

La información pública disponible es extremadamente escasa: no se especifica arquitectura, número de parámetros, longitud de contexto, idiomas soportados ni licencia. La model card se limita a describir la identidad del repositorio, enlazar al supuesto origen canónico en GitHub y afirmar que cualquier métrica de entrenamiento o evaluación debe consultarse en los ficheros de recibo del "estate", marcando como UNKNOWN todo lo que no esté medido en una auditoría fechada.

Por tanto, esta ficha documenta lo que el autor declara explícitamente y marca como "no disponible" todo aquello que no aparece en la información proporcionada. No debe interpretarse la ausencia de datos como una garantía de calidad ni como una advertencia sobre el modelo: simplemente refleja que la publicación carece de la documentación técnica habitual en un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el tamano del repo, 27,5 GB en safetensors, es el unico indicio) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se declaran pesos safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline declarado | no disponible |
| Tamano del repositorio | 27,5 GB |
| Fecha de creacion | 2026-11-19 |
| Ultima actualizacion | 2026-11-20 |

## Arquitectura y entrenamiento

La model card no describe la arquitectura del modelo. No se indica si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida con capas de estado o cualquier otra variante. Tampoco se especifica el número de capas, la dimensión oculta, el mecanismo de atención ni el tokenizador utilizado. El único dato estructural cierto es que los pesos se distribuyen en formato safetensors dentro de un repositorio de 27,5 GB.

Respecto al entrenamiento, el autor declara explícitamente que las afirmaciones sobre entrenamiento y evaluación "viven en sus ficheros de recibo" dentro del mesh del estate, y que cualquier cosa no receiptada en la tarjeta se considera UNKNOWN. No se aporta el número de tokens de entrenamiento, la composición del dataset, la existencia o no de fases de RLHF, DPO o ajuste por instrucciones, ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card menciona gráficos SVG deterministas generados a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z, pero no incluye los datos subyacentes en el texto de la tarjeta.

## Capacidades

- No se declara ninguna capacidad concreta en la información disponible.
- No se especifica soporte de generación de texto, razonamiento, código, matemáticas o visión.
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni de razonamiento multi-paso.
- No se declaran capacidades multilingües ni idiomas cubiertos.
- No se menciona ningún modo especial (thinking mode, visión, audio u otros).
- La única capacidad verificable es la de servir como artefacto de pesos safetensors descargable desde Hugging Face.

## Casos de uso

Dado que la información pública no documenta capacidades, los siguientes casos son escenarios genéricos para un artefacto de este tamaño y formato, no recomendaciones respaldadas por el autor:

- Evaluación interna de artefactos: un equipo puede descargar los pesos y ejecutar una batería propia de pruebas para caracterizar el modelo antes de cualquier uso, dado que el autor no publica benchmarks en la tarjeta.
- Investigación sobre trazabilidad de modelos: el repositorio forma parte de un "governed-AI estate" con receipts, por lo que puede usarse como caso de estudio de publicación de artefactos con auditoría declarada.
- Archivado y replicación: el formato safetensors y el tamaño del repositorio permiten almacenarlo en espejos internos para preservación a largo plazo.
- Integración en pipelines de evaluación comparativa: puede incorporarse a un banco de pruebas junto con otros modelos para medir rendimiento real con herramientas como lm-evaluation-harness.
- Análisis de pesos: investigadores pueden inspeccionar los tensores safetensors para estudiar la estructura del modelo (número de capas, dimensiones, vocabulario) sin necesidad de ejecutarlo.
- Pruebas de despliegue en infraestructura propia: validar el proceso de carga y servicio con vLLM, TGI o llama.cpp una vez convertido a los formatos soportados, como paso previo a decidir su adopción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card afirma explícitamente que "no se asegura ningún número de benchmark más allá de lo que una auditoría fechada haya medido" y remite a ficheros de recibo externos que no se incluyen en el texto proporcionado.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, ya que se desconoce el número de parámetros. Como referencia orientativa, un repositorio de 27,5 GB en safetensors sugiere un modelo en el rango de decenas de miles de millones de parámetros en precisión de 16 bits.
- GPU recomendadas: no disponibles. Para un modelo de ese orden de magnitud, serían necesarias GPUs de centro de datos como A100 80 GB o H100, posiblemente en configuración multi-GPU.
- ¿Cabe en GPU de consumo? No disponible. Dependerá del número real de parámetros y de la cuantización, que el autor no documenta.
- Opciones de despliegue: no declaradas por el autor. El formato safetensors es compatible con vLLM, TGI y transformers; llama.cpp y Ollama requerirían conversión a GGUF, no documentada.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no permite identificar la categoría del modelo (tamaño, arquitectura, tarea) con suficiente precisión como para seleccionar alternativas comparables. El tamaño del repositorio sugiere un modelo grande, pero sin el número de parámetros ni la arquitectura no es posible establecer una comparación rigurosa con modelos concretos.

## Limitaciones y advertencias

- Documentación insuficiente: no se declaran arquitectura, parámetros, contexto, idiomas ni licencia, lo que impide evaluar su idoneidad para producción.
- Licencia no disponible: no puede confirmarse si se permite uso comercial, modificación o redistribución. Cualquier uso en producción requiere aclarar este punto con el autor.
- Riesgo de alucinación: desconocido, al no haber benchmarks ni evaluación publicada.
- Sesgos conocidos: no documentados.
- Limitaciones de contexto e idioma: no documentadas.
- Trazabilidad declarada pero no verificable en la tarjeta: el autor remite a receipts externos y a un repositorio de GitHub que no se incluye en la información disponible.
- Popularidad nula en el momento de la consulta: 0 descargas y 0 likes, lo que reduce la probabilidad de validación por terceros.
- Fecha de creación futura respecto a la fecha habitual de consulta: conviene verificar la autenticidad y el origen del repositorio antes de cualquier uso.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/backup-salad-flagship54-v2
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Origen canónico declarado (organización en GitHub): https://github.com/szl-holdings
- Herramienta de generación de tarjetas citada: https://github.com/szl-holdings/estate-cards
