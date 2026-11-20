# SZLHOLDINGS/salad-ring-ouro-l23

## Resumen

`salad-ring-ouro-l23` es un artefacto de modelo publicado por SZLHOLDINGS, una organización que se presenta como un "estate" de IA gobernada con modelos, datasets y Spaces vinculados a fuentes y con resultados verificables mediante ficheros de recibo (receipts). El repositorio de Hugging Face no contiene información técnica sustantiva sobre el modelo: la model card se limita a describir la identidad del repositorio, el contexto del "estate" y una política de honestidad según la cual cualquier afirmación de entrenamiento o evaluación debe residir en los ficheros de recibo del ecosistema de la organización. Todo lo que no está respaldado por un recibo se declara explícitamente como UNKNOWN.

No se dispone de datos sobre arquitectura, número de parámetros, longitud de contexto, tokenizador, idiomas, licencia ni formato de pesos. El nombre del repositorio sugiere una numeración interna ("l23") y una temática ("salad ring ouro") que no aporta información técnica verificable. La fecha de creación (2026-11-18) y la de actualización (2026-11-20) son las únicas marcas temporales disponibles, junto con un snapshot de auditoría citado en la propia tarjeta (2026-11-20T03:48:04Z).

La relevancia de esta ficha es, por tanto, limitada y fundamentalmente descriptiva: documenta la existencia del artefacto, su procedencia organizativa y la ausencia de especificaciones públicas, de modo que un desarrollador o investigador pueda descartarlo rápidamente como candidato para evaluación técnica o descartar su uso en producción hasta que el autor publique los recibos y las métricas correspondientes.

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

No se ha publicado información sobre la arquitectura del modelo (transformer, MoE, SSM, híbrida u otra), ni sobre el número de parámetros, la composición del dataset de entrenamiento, el volumen de tokens procesados o las técnicas de alineación empleadas (RLHF, DPO, SFT). La model card indica de forma explícita que las afirmaciones de entrenamiento y evaluación de este artefacto residen en sus ficheros de recibo dentro del "estate mesh" de SZLHOLDINGS, y que cualquier dato no respaldado por un recibo se considera UNKNOWN. No se han localizado dichos recibos en la información proporcionada.

Tampoco se documentan innovaciones técnicas destacables como decodificación especulativa, atención lineal, atención con ventana deslizante o mecanismos de razonamiento extendido. La única información estructural es la referencia a que las gráficas de la tarjeta son SVG deterministas generados con la librería estándar de Python a partir de un snapshot de auditoría fechado el 2026-11-20T03:48:04Z, lo que sugiere un pipeline de documentación automatizado (estate-cards weaver v0.1.0) pero no aporta detalles sobre el modelo en sí.

## Capacidades

- Generación de texto: no confirmada; no disponible en la información proporcionada.
- Razonamiento: no confirmado; no disponible.
- Generación de código: no confirmada; no disponible.
- Matemáticas: no confirmado; no disponible.
- Visión: no confirmada; no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles; el campo de idiomas del repositorio está vacío.
- Modos especiales (thinking mode, audio, visión): no disponibles.

## Casos de uso

No es posible recomendar casos de uso concretos y realistas para este modelo porque no se ha publicado ninguna especificación funcional, métrica de calidad ni ejemplo de inferencia. Los siguientes escenarios quedan condicionados a la publicación de los recibos de evaluación por parte del autor:

- Evaluación exploratoria en investigación: un investigador podría descargar el artefacto para inspeccionar su tokenizador y configuración, siempre que los pesos estén disponibles en un formato legible; actualmente se desconoce el formato de pesos.
- Integración en pipelines de CI/CD: descartado hasta que se documenten licencia, formato de pesos y comportamiento en tareas de código.
- Atención al cliente automatizada: descartado por ausencia de datos sobre contexto, idiomas y calidad conversacional.
- Generación de código en producción: descartado por ausencia de benchmarks de HumanEval o similares y de licencia clara.
- Análisis de documentos largos: descartado por ausencia de longitud de contexto documentada.
- Despliegue en GPU de consumo: descartado por ausencia de parámetros y cuantizaciones publicadas.
- Fine-tuning sobre dominio específico: descartado por ausencia de licencia y de especificaciones de entrenamiento.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y que lo no respaldado por un recibo se etiqueta como UNKNOWN. No se han localizado recibos con métricas en la información proporcionada.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros y el formato de pesos).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; se desconoce si los pesos están publicados en safetensors, GGUF u otro formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No se puede establecer una comparativa con alternativas de la misma categoría porque se desconocen el tamaño, la arquitectura, la tarea objetivo y la licencia de `salad-ring-ouro-l23`. Cualquier comparación con modelos de parámetros y contexto conocidos sería especulativa y no verificable.

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas públicas: no se puede verificar arquitectura, tamaño, contexto ni idiomas.
- Licencia no disponible: no se puede determinar si el uso comercial está permitido; tratar como no apto para producción hasta confirmación.
- Sin benchmarks ni recibos accesibles en la información proporcionada: imposible evaluar calidad, sesgos o riesgo de alucinación de forma empírica.
- Idiomas no declarados: riesgo de comportamiento deficiente o no documentado fuera del idioma de entrenamiento, que se desconoce.
- Procedencia organizativa poco convencional: la tarjeta remite a un "estate" con recibos externos al repositorio; la verificabilidad depende de que dichos recibos sean públicos y estén fechados.
- Fechas de creación y actualización en 2026: el artefacto es muy reciente y no cuenta con descargas ni likes, lo que sugiere ausencia de validación por parte de la comunidad.
- Riesgo de sesgos y alucinación: no evaluable con la información disponible; se recomienda no asumir ningún nivel de fiabilidad.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l23
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la tarjeta): https://github.com/szl-holdings
- Repositorio de la herramienta de generación de tarjetas (referenciado): https://github.com/szl-holdings/estate-cards
