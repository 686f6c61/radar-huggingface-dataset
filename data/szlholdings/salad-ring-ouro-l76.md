# SZLHOLDINGS/salad-ring-ouro-l76

## Resumen

`salad-ring-ouro-l76` es un artefacto de modelo publicado por SZLHOLDINGS dentro de lo que la organización denomina su "governed-AI estate": un catálogo de modelos, datasets y Spaces con trazabilidad declarada mediante ficheros de recibos (receipts) y auditorías fechadas. El repositorio de Hugging Face no incluye información sobre la arquitectura, el tamaño, el contexto ni los datos de entrenamiento del modelo; la model card se limita a describir el marco de gobernanza de la organización y a remitir a los recibos de auditoría como única fuente de evidencia.

La propia model card establece una política de honestidad explícita: cualquier afirmación sobre entrenamiento o evaluación que no esté respaldada por un recibo medido se marca como UNKNOWN. La auditoría más reciente citada en la tarjeta (tranche 6, chunk 9, 22 de noviembre de 2026) clasifica este repositorio como `RECEIPT_FILES_NO_DONE`, es decir, contiene ficheros con nombre de recibo pero no un `DONE.json` estricto con `status=MEASURED`, `eval_rc=0` y marca temporal. En consecuencia, no existe evidencia de evaluación validada para este artefacto.

Por tanto, esta ficha no puede caracterizar técnicamente el modelo: no hay datos verificables de parámetros, contexto, licencia ni idiomas. Su relevancia actual es limitada y de naturaleza meta: sirve como ejemplo de publicación de artefactos con trazabilidad declarada pero sin evidencia de calidad medida, y como caso de estudio sobre por qué los metadatos de gobernanza no sustituyen a las especificaciones técnicas.

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

No disponible. La model card no describe la arquitectura (transformer, MoE, SSM o híbrida), el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron técnicas de alineación como RLHF o DPO. El autor indica que las afirmaciones de entrenamiento y evaluación "viven en sus ficheros de recibo" dentro de la malla del estate, pero no enlaza ni incrusta ninguno de esos recibos en el repositorio de Hugging Face.

La única información estructural es de gobernanza: la tarjeta se genera de forma determinista con la herramienta `estate-cards weaver v0.1.0` (Python de biblioteca estándar, SVG determinista, paleta KANCHAY) a partir de una instantánea de auditoría fechada el 2026-11-20T03:48:04Z. Los gráficos incluidos (`org-context.svg`, `mesh-receipts.svg`) son ilustrativos del estado del estate y no contienen curvas de entrenamiento ni de evaluación medidas para este artefacto.

## Capacidades

- No disponible. No se declara ninguna capacidad funcional (generación de texto, razonamiento, código, matemáticas, visión, audio).
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Auditoría de gobernanza de artefactos: el repositorio puede usarse como ejemplo de cómo una organización estructura recibos y auditorías fechadas para sus modelos; útil para equipos que diseñan procesos internos de trazabilidad, no para desplegar el modelo en sí.
- Estudio de metadatos incompletos en Hugging Face: sirve para analizar cómo se comportan los pipelines de descubrimiento y filtrado cuando un repositorio carece de `pipeline_tag`, licencia e idiomas declarados.
- Prueba de herramientas de catalogación automática: un repositorio sin especificaciones técnicas es un caso límite útil para validar que un indexador marca correctamente los campos como desconocidos en lugar de inferirlos.
- Formación sobre políticas de evidencia: la distinción explícita entre MEASURED, REPORTED y UNKNOWN de la tarjeta es material didáctico para discutir buenas prácticas de reporting en modelos abiertos.
- Evaluación de riesgos de cadena de suministro: permite ilustrar el riesgo de incorporar artefactos sin licencia declarada ni evidencia de evaluación a un catálogo de dependencias.
- No se recomienda su uso en inferencia, generación de código, atención al cliente ni ninguna tarea de producción, al no existir especificaciones ni evidencia de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card declara explícitamente que no se afirma ningún número de benchmark más allá de lo que una auditoría fechada haya medido, y la auditoría más reciente clasifica la evidencia de evaluación como UNKNOWN (sin `DONE.json` estricto).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (se desconoce el número de parámetros y la arquitectura).
- GPU recomendadas: no disponible.
- Viabilidad en GPU de consumo: no disponible.
- Opciones de despliegue (vLLM, llama.cpp, Ollama, TGI): no disponible; no se declara formato de pesos compatible con ninguno de estos motores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. No es posible identificar modelos comparables sin conocer la categoría, el tamaño ni la tarea del artefacto. A modo de contexto, se compara únicamente el nivel de información declarada frente a prácticas habituales de publicación:

| Aspecto | salad-ring-ouro-l76 | Modelo abierto típico en HF | Modelo con model card completa |
|---|---|---|---|
| Arquitectura declarada | no | habitualmente sí | sí |
| Parámetros declarados | no | habitualmente sí | sí |
| Licencia declarada | no | habitualmente sí | sí |
| Idiomas declarados | no | frecuentemente | sí |
| Evidencia de evaluación | UNKNOWN (sin DONE.json) | variable | benchmarks fechados |
| Formato de pesos | no disponible | safetensors/GGUF | safetensors/GGUF |

## Limitaciones y advertencias

- Ausencia total de especificaciones técnicas: sin parámetros, contexto, arquitectura ni formato de pesos, el artefacto no es evaluable ni desplegable de forma responsable.
- Licencia no declarada: no puede asumirse ningún derecho de uso, incluido el comercial; la ausencia de licencia es un bloqueo legal para producción.
- Idiomas no declarados: imposible planificar cobertura lingüística.
- Evidencia de evaluación inexistente según la auditoría del propio autor (`RECEIPT_FILES_NO_DONE`, eval UNKNOWN): no hay base para afirmar calidad, seguridad ni ausencia de sesgos.
- Riesgo de alucinación y sesgos: no evaluable al no existir benchmarks ni documentación de alineación.
- Los gráficos y badges de la model card son generados de forma determinista por una herramienta interna y no constituyen evidencia de rendimiento; no deben interpretarse como curvas de evaluación.
- Fecha de creación futura (2026-11-19) y ausencia de descargas o likes: repositorio sin tracción ni validación por parte de la comunidad.
- No apto para producción, investigación comparativa ni integración en pipelines hasta que el autor publique especificaciones y recibos de evaluación verificables.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/SZLHOLDINGS/salad-ring-ouro-l76
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Organización en GitHub (referenciada en la tarjeta): https://github.com/szl-holdings
- Herramienta de generación de tarjetas (referenciada): https://github.com/szl-holdings/estate-cards
