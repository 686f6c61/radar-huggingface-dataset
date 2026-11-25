# SZLHOLDINGS/salad-pg54-lutar-v1

## Resumen

`salad-pg54-lutar-v1` es un artefacto de modelo publicado por SZLHOLDINGS bajo licencia Apache 2.0, con un repositorio de aproximadamente 1,0 GB en formato `safetensors`. La model card no documenta arquitectura, número de parámetros, longitud de contexto ni idiomas soportados; se limita a describir el modelo como parte de un "estate" de IA gobernada con resultados auditables y a remitir a ficheros de recibos (receipts) para cualquier afirmación sobre entrenamiento o evaluación.

La información disponible es deliberadamente escasa y auto-referencial: el autor declara explícitamente que cualquier dato no registrado en sus recibos se etiqueta como UNKNOWN, y el escaneo de recibos citado en la propia card clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, es decir, existen ficheros con nombre de recibo pero no un `DONE.json` estricto con estado MEASURED, `eval_rc=0` y marca temporal. En consecuencia, no hay evidencia medida de calidad ni de capacidades.

Por tanto, esta ficha describe un artefacto sin especificaciones técnicas verificables ni benchmarks publicados. Su relevancia actual es limitada para evaluación práctica: no hay pipeline declarado, cero descargas y cero likes en el momento de la consulta, y el tamaño del repo (1,0 GB) es el único indicio cuantitativo sobre la posible magnitud del modelo, insuficiente para inferir parámetros con precisión.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No disponible. La model card no especifica si el modelo usa un transformer denso, una arquitectura MoE, SSM o híbrida, ni detalla la composición del dataset de entrenamiento, el número de tokens, ni si hubo etapas de RLHF, DPO o ajuste por instrucciones.

El autor indica que las afirmaciones sobre entrenamiento y evaluación residen en ficheros de recibos del "estate mesh" y que cualquier dato no registrado allí se considera UNKNOWN. El escaneo citado en la propia card (tranche 6, chunk 3, 2026-11-22) no encontró un `DONE.json` que cumpla el umbral estricto, por lo que la evidencia de entrenamiento no está validada como tal en el repositorio. El único fichero con nombre de recibo detectado es `assets/szl-card/mesh-receipts.svg`, que es una imagen SVG generada de forma determinista, no un registro de evaluación.

## Capacidades

- No se declara ninguna capacidad concreta en la información disponible.
- No hay evidencia de generación de texto, razonamiento, código, matemáticas o visión.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se especifican capacidades multilingües ni idiomas.
- No se menciona modo de pensamiento (thinking), audio ni ninguna modalidad especial.
- El pipeline en Hugging Face figura como no disponible, por lo que no se puede inferir la tarea para la que fue entrenado.

## Casos de uso

No es posible recomendar casos de uso concretos sin especificaciones verificables de arquitectura, contexto, idiomas o capacidades. Los siguientes escenarios son genéricos para un artefacto `safetensors` de ~1 GB y deben tratarse como hipótesis a validar, no como recomendaciones:

- Evaluación interna de artefactos de terceros: descargar el repo, inspeccionar la configuración y los tensores para determinar arquitectura y tamaño real antes de cualquier uso.
- Reproducción de pipelines de auditoría: usar el modelo como caso de prueba para verificar herramientas de escaneo de recibos y validación de licencias en un "estate" gobernado.
- Pruebas de carga en infraestructura propia: dado el tamaño de 1,0 GB, sirve para validar procesos de despliegue con `safetensors` en entornos controlados.
- Verificación de licencia: el tag Apache 2.0 permite, en principio, uso comercial, pero conviene confirmar la procedencia de los pesos antes de integrarlos.
- Docencia sobre trazabilidad de modelos: ilustra cómo una model card puede declarar UNKNOWN en lugar de inventar métricas.
- Archivo y preservación: conservar el artefacto como referencia histórica del ecosistema SZLHOLDINGS.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo citado clasifica la evidencia de evaluación como UNKNOWN por ausencia de `DONE.json` estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión. El repo ocupa 1,0 GB en `safetensors`, lo que sugiere que los pesos en su precisión original podrían caber en GPUs de consumo con 8-16 GB, pero se desconoce el número de parámetros y el tipo de dato de los tensores.
- GPU recomendadas: no disponible. Sin conocer parámetros ni contexto, no se puede recomendar A100, H100, RTX 4090 ni ningún otro modelo concreto.
- Compatibilidad con GPU de consumo: probablemente sí por el tamaño del repo, pero no confirmado.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningún otro runtime. Al no haber pipeline declarado, ni siquiera se conoce la tarea.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una categoría comparable (tamaño, tarea, modalidad) sin especificaciones técnicas del modelo. Cualquier comparación con alternativas sería especulativa.

## Limitaciones y advertencias

- Ausencia total de especificaciones: no se conocen arquitectura, parámetros, contexto ni idiomas, lo que impide evaluar su idoneidad para cualquier tarea.
- Evidencia de evaluación inexistente: el propio escaneo del autor clasifica el repo como `RECEIPT_FILES_NO_DONE` y la evidencia de evaluación como UNKNOWN.
- Riesgo de alucinación: no evaluable sin benchmarks ni pruebas, pero al no haber datos de entrenamiento ni ajuste declarados, el riesgo es indeterminado.
- Sesgos: no documentados ni medibles.
- Licencia: el tag Apache 2.0 fue asignado por operaciones del estate (nota "w45z") sin evidencia de licencia upstream por fichero, según la propia model card. Esto introduce incertidumbre sobre la procedencia real de los pesos y su uso comercial seguro.
- Cero adopción: 0 descargas y 0 likes en el momento de la consulta, sin señales de validación por la comunidad.
- Sin pipeline declarado: no se puede confirmar que el artefacto sea funcional para inferencia con las herramientas estándar.
- Fechas futuras en los metadatos (creación 2026-11-18, actualización 2026-11-25): conviene verificar la coherencia temporal antes de confiar en los registros de auditoría.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-pg54-lutar-v1
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la card): https://github.com/szl-holdings
- Herramienta de generación de cards (referenciada): https://github.com/szl-holdings/estate-cards
