# SZLHOLDINGS/salad-ring-ouro-l95

## Resumen

`salad-ring-ouro-l95` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organización denomina su "estate" de IA gobernada: un conjunto de modelos, datasets y Spaces con resultados verificables y trazabilidad declarada. El repositorio de Hugging Face no contiene, en la información disponible, ni la arquitectura, ni el número de parámetros, ni la longitud de contexto, ni los datos de entrenamiento del modelo. La model card se limita a describir el marco de gobernanza y auditoría de la organización, no las características técnicas del artefacto.

La relevancia de esta ficha es, por tanto, fundamentalmente negativa: documenta un caso de repositorio con metadatos insuficientes para evaluar el modelo. El autor declara explícitamente que cualquier afirmación sobre capacidades o calidad debe estar respaldada por ficheros de "receipt" medidos, y que lo que no esté acreditado se marca como UNKNOWN. El propio escaneo de receipts incluido en la card clasifica el repositorio como `RECEIPT_FILES_NO_DONE`: hay ficheros con nombre de receipt, pero no existe un `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`, por lo que la evidencia de evaluación se declara UNKNOWN.

En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 likes, no declara pipeline, licencia ni idiomas soportados, y no incluye pesos visibles en la información proporcionada. Cualquier uso en producción requeriría contactar con el autor o consultar su organización en GitHub para obtener los receipts y los artefactos reales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura del modelo en la información disponible. La model card no menciona si se trata de un transformer denso, un modelo de mezcla de expertos (MoE), una arquitectura híbrida con componentes SSM o cualquier otra variante. Tampoco se indica el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de alineación como RLHF, DPO o SFT.

El único elemento técnico verificable es el marco de auditoría de la organización: la card indica que los gráficos incluidos son SVG deterministas generados con la librería estándar de Python a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z, etiquetada como MEASURED, y que los números se clasifican como MEASURED, REPORTED o UNKNOWN con hora de captura. El escaneo de receipts del 2026-11-22 clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, lo que implica que no existe evidencia de evaluación estricta para este artefacto.

## Capacidades

- Generación de texto: no disponible en la información proporcionada.
- Razonamiento: no disponible.
- Generación de código: no disponible.
- Matemáticas: no disponible.
- Visión: no disponible.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Modo thinking, audio u otras capacidades especiales: no disponible.

La model card no enumera ninguna capacidad funcional del modelo; se limita a describir el sistema de receipts y gobernanza de la organización.

## Casos de uso

No es posible detallar casos de uso concretos y realistas sin conocer las capacidades, el tamaño, el contexto y la licencia del modelo. Los únicos escenarios que la información disponible permite plantear son de carácter meta:

- Auditoría de gobernanza de artefactos: usar el repositorio como ejemplo de cómo una organización estructura receipts y marcas MEASURED/REPORTED/UNKNOWN para trazabilidad de modelos; adecuado para equipos que diseñan pipelines de compliance de IA.
- Verificación de evidencia antes de adopción: un equipo que evalúe este modelo debería localizar el `DONE.json` estricto y los receipts de entrenamiento y evaluación antes de considerar cualquier integración; el repositorio sirve como caso de estudio de qué información falta.
- Integración en pipelines de evaluación internos: si el autor publica los pesos y receipts, el modelo podría someterse a los benchmarks propios del equipo; sin esos artefactos, el caso no es viable.
- Reproducción de la auditoría: regenerar los SVG deterministas a partir de la instantánea de auditoría fechada para comprobar que los gráficos coinciden con la fuente declarada.
- Contacto con el proveedor para obtención de artefactos: el caso de uso práctico inmediato es solicitar al autor los pesos, la licencia y los receipts de evaluación antes de cualquier prueba técnica.
- Documentación de riesgos en catálogos internos: registrar el modelo como "no evaluable" en el inventario de modelos de la organización hasta que llegue evidencia medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y el escaneo de receipts del 2026-11-22 clasifica la evidencia de evaluación como UNKNOWN por ausencia de un `DONE.json` estricto.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros y la arquitectura).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se indica formato de pesos ni si existen pesos publicados.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer la categoría, el tamaño, la arquitectura y la licencia de `salad-ring-ouro-l95`. La información proporcionada no permite establecer una comparación técnica con alternativas.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: no se declaran arquitectura, parámetros, contexto, tokenizador ni formato de pesos, lo que impide cualquier evaluación técnica.
- Licencia no declarada: no puede asumirse uso comercial ni redistribución; cualquier uso en producción requiere aclaración previa con el autor.
- Idiomas no declarados: no hay garantía de soporte para castellano ni para ningún otro idioma.
- Evidencia de evaluación UNKNOWN: el propio escaneo de receipts del autor clasifica el repositorio como `RECEIPT_FILES_NO_DONE`, sin `DONE.json` estricto con `status=MEASURED` y `eval_rc=0`.
- Riesgo de alucinación y sesgos: no evaluables sin benchmarks ni documentación de datos de entrenamiento.
- Repositorio sin tracción verificable: 0 descargas y 0 likes en el momento de la consulta, lo que reduce la probabilidad de validación por terceros.
- Metadatos de fecha inusuales: las fechas de creación (2026-11-19) y actualización (2026-11-23) del repositorio, así como las de la auditoría (2026-11-20), deben tratarse con cautela y verificarse en la fuente.
- Nomenclatura genérica: el nombre del modelo no aporta información sobre su familia, tamaño o propósito, lo que dificulta su descubrimiento y clasificación.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l95
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (fuente canónica declarada): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de cards: https://github.com/szl-holdings/estate-cards
