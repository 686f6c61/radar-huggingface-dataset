# SZLHOLDINGS/salad-ring-ouro-l89

## Resumen

salad-ring-ouro-l89 es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que el autor denomina su "estate" de IA gobernada, un conjunto de repositorios de modelos, datasets y Spaces con resultados supuestamente verificables mediante recibos de auditoría. El repositorio no incluye model card técnica al uso: la información disponible se limita a metadatos de identidad, referencias a un repositorio canónico en GitHub y a gráficos SVG generados de forma determinista a partir de una instantánea de auditoría fechada el 2026-11-20.

No se especifica arquitectura, número de parámetros, longitud de contexto, tokenizador, datos de entrenamiento ni idiomas soportados. La propia model card declara explícitamente que cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un recibo medido se considera UNKNOWN, y el escaneo de recibos incluido indica que no existe un fichero DONE.json en el estándar estricto del autor, por lo que la evidencia de evaluación es desconocida.

En la práctica, el modelo no es evaluable ni desplegable con la información pública disponible: no hay pesos documentados en formato utilizable, no hay licencia declarada y no hay resultados de benchmarks. Su relevancia actual es, por tanto, limitada al estudio de prácticas de publicación y gobernanza de artefactos, no a su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio referencia SVG de auditoría, no se documentan safetensors ni GGUF) |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos, una arquitectura híbrida o cualquier otra variante, ni describe el tokenizador, la función de activación o el esquema de atención.

Respecto al entrenamiento, el autor remite a "ficheros de recibo" dentro de su malla de auditoría, pero el escaneo incluido en la propia tarjeta clasifica el repositorio como RECEIPT_FILES_NO_DONE: hay ficheros con nombres de recibo (concretamente assets/szl-card/mesh-receipts.svg) pero no existe un DONE.json que cumpla el estándar estricto (status=MEASURED, eval_rc=0, marca temporal y recibo de entrenamiento). Por tanto, el número de tokens, la composición del dataset y la existencia de fases de RLHF, DPO o ajuste supervisado son desconocidos. No se documenta ninguna innovación técnica (decodificación especulativa, atención lineal, decodificación restringida, etc.).

## Capacidades

- Generación de texto: no confirmada; no hay documentación que acredite ninguna capacidad concreta.
- Razonamiento, código, matemáticas o visión: no disponibles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas no está declarado.
- Modos especiales (thinking mode, visión, audio): no disponibles.
- La model card solo afirma que el artefacto forma parte de un "estate" con resultados verificables mediante recibos, pero no enumera ninguna capacidad funcional del modelo.

## Casos de uso

- Auditoría de gobernanza de artefactos: el repositorio puede usarse como ejemplo de publicación con trazabilidad basada en recibos, comparando el estándar declarado por SZLHOLDINGS con el estado real del repositorio (sin DONE.json estricto).
- Estudio de documentación de modelos: útil para analizar cómo una model card generada automáticamente (estate-cards weaver v0.1.0) comunica incertidumbre mediante etiquetas MEASURED/REPORTED/UNKNOWN.
- Investigación sobre reproducibilidad: permite examinar el mecanismo de instantáneas de auditoría fechadas y gráficos SVG deterministas como sustituto de resultados de evaluación convencionales.
- Integración en pipelines de verificación: el patrón de recibos podría adaptarse a sistemas internos que exijan evidencia fechada antes de promover un modelo a producción.
- Docencia sobre comunicación de riesgos: la tarjeta evita explícitamente afirmar capacidades no medidas, lo que sirve como caso de buenas prácticas de honestidad documental.
- No se recomienda su uso para generación de texto, código, atención al cliente ni ninguna tarea de inferencia real, dado que no hay pesos, licencia ni especificaciones documentadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara que la evidencia de evaluación es UNKNOWN al no existir un DONE.json en el estándar estricto del autor, y que no se afirma ninguna cifra más allá de lo que una auditoría fechada haya medido.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el tamaño del modelo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se documentan pesos en formatos compatibles.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se conocen modelos comparables porque se desconoce la categoría, el tamaño y la tarea del artefacto, y no hay benchmarks publicados que permitan situarlo frente a alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin arquitectura, parámetros, contexto ni tokenizador, el modelo no puede evaluarse ni desplegarse de forma responsable.
- Licencia no declarada: no hay autorización explícita para uso comercial ni para redistribución; cualquier uso en producción carece de base legal clara.
- Evidencia de evaluación inexistente: el propio escaneo del autor clasifica el repositorio como RECEIPT_FILES_NO_DONE, por lo que no hay garantía de calidad ni de capacidades.
- Riesgo de alucinación: no evaluable al no existir resultados medidos; no debe asumirse ningún nivel de fiabilidad.
- Idiomas no declarados: no puede confirmarse soporte de castellano ni de ninguna otra lengua.
- Sesgos conocidos: no documentados; la ausencia de información sobre datos de entrenamiento impide cualquier análisis de sesgo.
- Fecha de creación futura (2026-11-19) y metadatos atípicos: conviene tratar el repositorio con cautela y verificar su procedencia antes de cualquier integración.
- Sin pesos publicados en formatos estándar (safetensors, GGUF): no es posible ejecutar el modelo con las herramientas habituales.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l89
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio canónico en GitHub (referenciado en la model card): https://github.com/szl-holdings
- Herramienta de generación de tarjetas citada: https://github.com/szl-holdings/estate-cards
- No se han encontrado papers, blogs, demos ni repositorios adicionales en la búsqueda web proporcionada.
