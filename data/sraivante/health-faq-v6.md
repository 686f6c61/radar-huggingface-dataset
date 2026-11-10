# sraivante/health-faq-v6

## Resumen

health-faq-v6 es un modelo de clasificación de conceptos de muy pequeño tamaño (aproximadamente 2,3 millones de parámetros) desarrollado por el usuario sraivante. No se trata de un modelo generativo de lenguaje, sino de un componente de tipo decoder con una cabeza de conceptos ("concept head") que clasifica preguntas frecuentes sobre salud en una etiqueta conceptual (top-1). El modelo reutiliza un tokenizador congelado de una versión anterior (v4) y se entrena sobre un dataset privado propio (`sraivante/health-faq-v6-data`).

La relevancia del modelo es limitada y muy específica: según su propia model card, esta versión v6 presenta la mejor precisión limpia ("clean accuracy") de su familia, pero es débil frente a paráfrasis y a errores tipográficos múltiples. Se describe como una subida privada, no revisada para publicación pública (la única versión pública revisada es la v4), por lo que debe considerarse material experimental de un pipeline interno de enrutamiento o clasificación de FAQ sanitarias.

No hay información disponible sobre arquitectura detallada, contexto, idiomas o licencia concreta más allá de "other". El repositorio ocupa 0,1 GB y no registra descargas ni interacciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Decoder con cabeza de conceptos ("concept head"), transformer de tipo decoder (detalle no disponible) |
| Parametros totales | ~2,3 M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (evaluado en CPU FP32 según la model card) |
| Idiomas soportados | no disponible |
| Licencia | other |
| Formato de pesos | no disponible (repo de 0,1 GB; se carga con `code/training/train_canonical.py:ConceptLM` y `prepared/config.json`) |

## Arquitectura y entrenamiento

La model card describe el modelo como un "decoder + concept head" de unos 2,3 millones de parámetros con tokenizador v4 congelado. No se especifica el número de capas, dimensión oculta, mecanismo de atención ni longitud de contexto. La tarea es de clasificación de conceptos top-1 sobre preguntas frecuentes de salud, no de generación libre de texto.

El entrenamiento se realiza sobre un dataset privado (`sraivante/health-faq-v6-data`) y el modelo se carga mediante el script `code/training/train_canonical.py` con la clase `ConceptLM` y la configuración `prepared/config.json`. No hay información disponible sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF/DPO ni innovaciones técnicas. La versión v6 se etiqueta como "keyword IUL fix" respecto a versiones anteriores.

## Capacidades

- Clasificación de preguntas frecuentes de salud en conceptos (top-1), evaluada con criterio "eq1 accept-either".
- Enrutamiento o filtrado de consultas: la familia incluye un componente "router" (rt1) con umbral tau que decide qué preguntas derivar a un modelo mayor; v6 no incluye ese router, pero se compara con él.
- Manejo de preguntas "vistas" (test_seen) con alta precisión en conjuntos limpios.
- Capacidad limitada ante paráfrasis y errores tipográficos múltiples (reconocido explícitamente por el autor).
- No se documentan capacidades de generación de texto, código, matemáticas, visión, tool calling, agentes ni multilingüismo.
- No se documenta modo "thinking", audio ni otras capacidades especiales.

## Casos de uso

- Clasificación de FAQ sanitarias en producción interna: el modelo asigna una etiqueta conceptual a preguntas frecuentes de salud; su tamaño (~2,3 M de parámetros) permite ejecución en CPU con latencia mínima y sin GPU.
- Filtrado previo en un pipeline de atención al cliente sanitario: se puede usar para descartar o etiquetar consultas antes de enviarlas a un modelo mayor, siempre que las preguntas se ajusten a formulaciones vistas.
- Enrutamiento de consultas hacia un modelo de mayor capacidad: aunque v6 no incluye el router rt1 de la familia, su salida de concepto puede alimentar lógica de derivación.
- Experimentación e investigación sobre clasificación de dominios verticales con datasets privados: sirve como línea base de bajo coste para comparar arquitecturas de "decoder + concept head".
- Evaluación de robustez frente a paráfrasis y errores tipográficos: el propio autor publica comparativas entre versiones (v6, v11a, v13c) que permiten estudiar la degradación en conjuntos "challenge_new".
- Prototipado de sistemas de triaje sanitario en entornos controlados: útil para validar pipelines de datos y métricas antes de escalar a modelos mayores.
- Docencia y reproducción de pipelines de entrenamiento: el script `train_canonical.py` y la configuración `prepared/config.json` permiten reproducir el flujo de entrenamiento con el dataset privado.

## Benchmarks y rendimiento

Datos de la model card (precisión de concepto top-1, criterio eq1 accept-either, cabeza en CPU FP32). Se comparan v6 con rt1 (router), v11a y v13c_e2 en dos semillas (s42, s43).

| Conjunto | Filas | rt1_s42 | rt1_s43 | v6_s42 | v6_s43 | v11a_s42 | v11a_s43 | v13c_e2_s42 | v13c_e2_s43 |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| test_seen_cb1 | 1626 | 91,6 | 92,6 | 30,9 | 30,6 | 39,1 | 40,2 | 65,9 | 68,0 |
| challenge_new_cb1 | 3617 | 58,4 | 58,6 | 18,2 | 17,9 | 22,4 | 22,1 | 33,4 | 35,3 |
| clean_test_seen | 1638 | 97,7 | 98,2 | 96,5 | 96,3 | 95,8 | 96,5 | 93,8 | 93,7 |
| clean_challenge_new | 3617 | 66,5 | 67,7 | 55,4 | 54,2 | 55,2 | 54,0 | 53,8 | 54,4 |
| mn2_test_seen_multi | 4735 | 92,2 | 92,6 | 38,9 | 38,9 | 50,4 | 51,4 | 82,9 | 83,7 |
| mn2_challenge_new_multi | 10812 | 58,9 | 59,6 | 23,5 | 22,7 | 27,6 | 28,0 | 41,5 | 42,9 |

Resultados del router rt1 (respuestas contestadas / erróneas) en su umbral tau congelado:

| Conjunto | rt1_s42 contestadas / erróneas | rt1_s43 contestadas / erróneas |
|---|---|---|
| test_seen_cb1 | 66,2 / 0,5 | 68,4 / 0,4 |
| challenge_new_cb1 | 26,2 / 1,7 | 27,4 / 1,9 |
| clean_test_seen | 87,4 / 0,2 | 90,0 / 0,4 |
| clean_challenge_new | 35,7 / 2,1 | 36,3 / 1,5 |
| mn2_test_seen_multi | 69,8 / 0,4 | 71,2 / 0,3 |
| mn2_challenge_new_multi | 26,7 / 1,8 | 27,5 / 1,9 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: prácticamente despreciable; con ~2,3 M de parámetros en FP32 ocupa del orden de 10 MB de pesos, por lo que cabe en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no se requiere GPU; la propia model card evalúa en CPU FP32. Cualquier GPU (RTX 3060, RTX 4090, A100, H100) es sobredimensionada.
- Cabe en consumer GPU: sí, en todas; también en Raspberry Pi y entornos embebidos.
- Opciones de despliegue: carga mediante `code/training/train_canonical.py:ConceptLM` y `prepared/config.json`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles; por tamaño, la inferencia en CPU debería ser de milisegundos por muestra, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Precisión clean_test_seen (s42/s43) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| health-faq-v6 | ~2,3 M | no disponible | 96,5 / 96,3 | other | repo privado/experimental |
| health-faq-v11a | no disponible | no disponible | 95,8 / 96,5 | no disponible | no disponible |
| health-faq-v13c_e2 | no disponible | no disponible | 93,8 / 93,7 | no disponible | no disponible |
| rt1 (router de la familia) | no disponible | no disponible | 97,7 / 98,2 | no disponible | no disponible |

No se dispone de información sobre modelos externos comparables de clasificación de FAQ sanitarias en la documentación proporcionada.

## Limitaciones y advertencias

- Rendimiento débil en paráfrasis y errores tipográficos múltiples: en `challenge_new_cb1` cae al 18,2 % (s42) y en `mn2_challenge_new_multi` al 23,5 %, muy por debajo de versiones posteriores como v13c_e2.
- En conjuntos "vistos" no limpios (`test_seen_cb1`, `mn2_test_seen_multi`) el rendimiento es bajo (30,9 % y 38,9 % en s42), lo que sugiere dependencia de la formulación exacta.
- Subida privada no revisada para publicación pública: la única versión pública revisada es la v4; no debe tratarse como artefacto listo para producción.
- Licencia "other": no se especifican términos de uso comercial; es necesario contactar con el autor antes de cualquier uso en producción.
- Dataset de entrenamiento privado: no es posible auditar la composición, los sesgos ni la cobertura lingüística.
- No hay información sobre idiomas soportados, sesgos conocidos ni tasas de alucinación (es un clasificador, no un generador, pero puede asignar conceptos erróneos con alta confianza).
- Ausencia de benchmarks estándar y de documentación de arquitectura: difícil de integrar en comparativas formales.
- Sin descargas ni interacciones: no hay evidencia de uso comunitario ni validación externa.

## Enlaces

- Hugging Face: https://huggingface.co/sraivante/health-faq-v6
- Dataset (privado): `sraivante/health-faq-v6-data`
- Script de entrenamiento referenciado: `code/training/train_canonical.py:ConceptLM`
- Configuración referenciada: `prepared/config.json`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en la información disponible.
