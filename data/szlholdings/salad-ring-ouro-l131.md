# SZLHOLDINGS/salad-ring-ouro-l131

## Resumen

`salad-ring-ouro-l131` es un artefacto de modelo publicado por SZLHOLDINGS en Hugging Face dentro de lo que el autor denomina su "estate de IA gobernada": un conjunto de modelos, datasets y Spaces con resultados supuestamente verificables mediante ficheros de recibos (receipts). El repositorio se creó el 19 de noviembre de 2026 y se actualizó al día siguiente, sin que se haya registrado ninguna descarga ni interacción pública.

La model card no proporciona información técnica sustantiva: no indica arquitectura, número de parámetros, longitud de contexto, datos de entrenamiento ni idiomas soportados. Se limita a describir la identidad del repositorio, enlazar a una organización de GitHub y mostrar gráficos SVG generados de forma determinista a partir de una instantánea de auditoría. El propio autor declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un recibo se etiqueta como UNKNOWN.

Por tanto, esta ficha no puede caracterizar el modelo más allá de su existencia y de las convenciones documentales del repositorio. No hay evidencia pública de que el artefacto sea funcional, de qué tarea resuelve ni de cómo se entrenó. Cualquier evaluaciación práctica requeriría inspeccionar los pesos y los recibos citados en el ecosistema del autor, que no están disponibles en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No disponible. La model card no describe la arquitectura (transformer, MoE, SSM, híbrida u otra), ni el volumen o composición de los datos de entrenamiento, ni si se aplicaron técnicas de alineación como RLHF, DPO o instrucción supervisada. El autor remite a "ficheros de recibo" externos dentro del "estate mesh" para cualquier afirmación de entrenamiento o evaluación, pero dichos ficheros no se incluyen en la información disponible.

La única información estructural es de tipo documental: el repositorio forma parte de una fábrica de artefactos con generación automática de tarjetas (herramienta `estate-cards weaver v0.1.0`), gráficos SVG deterministas y etiquetado de cifras como MEASURED, REPORTED o UNKNOWN con marca temporal de captura. No se documenta ninguna innovación técnica de modelado.

## Capacidades

- No se documenta ninguna capacidad funcional (generación de texto, razonamiento, código, matemáticas, visión, audio).
- No se indica soporte de tool calling ni function calling.
- No se indica soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües.
- No se menciona ningún modo especial (thinking mode, decodificación especulativa, atención lineal).
- La única capacidad verificable es la de servir como artefacto trazable dentro del sistema de recibos del autor.

## Casos de uso

- Auditoría de procedencia de artefactos: el repositorio puede usarse como ejemplo de trazabilidad documental, con identificadores de tarjeta y marcas temporales que permiten verificar la cadena de generación.
- Evaluación de marcos de gobernanza de IA: sirve para estudiar cómo se etiquetan afirmaciones como MEASURED, REPORTED o UNKNOWN en una tarjeta generada automáticamente.
- Pruebas de pipelines de catalogación: útil para validar herramientas que ingieren repositorios de Hugging Face y extraen metadatos estructurados a partir de model cards.
- Docencia sobre documentación de modelos: caso práctico de una tarjeta que declara explícitamente la ausencia de datos en lugar de inventarlos.
- Investigación sobre reproducibilidad: permite analizar el uso de SVG deterministas y marcas de tiempo como mecanismo de auditoría ligera.
- Integración en sistemas de inventario interno: un equipo podría registrar el artefacto como entrada no evaluada en su catálogo, pendiente de inspección de pesos y recibos.

En ningún caso estos usos implican ejecutar el modelo para tareas de inferencia, ya que no hay evidencia de que sea funcional ni de qué tarea aborda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ninguna cifra de benchmark más allá de lo que una auditoría fechada haya medido, y no se incluye ninguna medición de este tipo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. Al desconocerse arquitectura, tamaño, contexto y licencia, no es posible establecer una comparación técnica significativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se puede planificar despliegue, estimar costes ni evaluar idoneidad.
- Licencia no declarada: riesgo legal para cualquier uso comercial o redistribución.
- Idiomas no declarados: imposible garantizar cobertura lingüística.
- Sin descargas ni interacción pública: no hay señal de validación por parte de la comunidad.
- La tarjeta remite a recibos externos no incluidos: las afirmaciones de entrenamiento y evaluación no son verificables con la información disponible.
- Riesgo de alucinación y sesgos: no evaluable al no existir documentación ni benchmarks.
- Fecha de creación posterior a la fecha actual de referencia habitual: conviene confirmar la integridad y autenticidad del repositorio antes de cualquier uso.
- No debe tratarse como un modelo listo para producción sin una inspección directa de los pesos y de los ficheros de recibo citados.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l131
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la tarjeta): https://github.com/szl-holdings
- Herramienta de generación de tarjetas (referenciada): https://github.com/szl-holdings/estate-cards
