# webmp3/Sakura-Nanbeige4.3-33B-GGUF

## Resumen

Sakura es una cuantización GGUF de la comunidad del modelo Nanbeige4.3-33B, desarrollado originalmente por Nanbeige. El modelo base es un transformer denso de arquitectura `llama` con 33.118.977.024 parámetros (aproximadamente 33,1 mil millones) en formato bfloat16, publicado bajo licencia Apache 2.0. Esta versión GGUF la firma el usuario webmp3 y no constituye una release oficial del autor original.

El interés de esta ficha radica en que permite ejecutar un modelo de 33B en hardware de consumo mediante cuantizaciones de 2 a 5 bits, con ficheros que van de 12,7 GB (Q2_K) a 23,5 GB (Q5_K_M). El proceso de cuantización se realizó por re-cuantización de un GGUF BF16 intermedio de bartowski, no directamente desde los safetensors originales, y sin calibración mediante matriz de importancia (imatrix).

La relevancia práctica es doble: por un lado, ofrece una vía de despliegue local de un modelo de 33B en inglés y chino; por otro, la model card es transparente sobre el método y las limitaciones, incluyendo hashes SHA-256 de cada fichero y verificación de inferencia real con llama.cpp, lo que facilita la auditoría antes de usarlo en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | llama (transformer denso) |
| Parametros totales | 33.118.977.024 (~33,1 B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Q2_K, Q3_K_M, Q4_K_M, Q5_K_M (GGUF); origen BF16 |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (origen: safetensors, bfloat16) |

## Arquitectura y entrenamiento

El modelo base Nanbeige4.3-33B es un transformer denso de arquitectura `llama` con 33,1 mil millones de parámetros, según declara la model card de esta cuantización. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron fases de RLHF, DPO u otras técnicas de alineación, ya que esos detalles pertenecen a la model card del modelo original y no se incluyen en la información proporcionada.

La innovación técnica relevante en esta ficha es el proceso de cuantización. Los ficheros se generaron por re-cuantización de un GGUF BF16 intermedio (procedente de bartowski, con SHA-256 verificado), no por conversión directa desde los safetensors upstream. No se ejecutó calibración con matriz de importancia. Las etiquetas Q2_K, Q3_K_M, Q4_K_M y Q5_K_M corresponden a presets de llama.cpp, que mantiene ciertos tensores (por ejemplo, pesos de normalización) en mayor precisión: en Q4_K_M, por ejemplo, hay 105 tensores F32, 313 Q4_K y 53 Q6_K. Todos los ficheros fueron validados estructuralmente y probados con inferencia real en llama.cpp build `b11669-620d2225c`.

## Capacidades

- Generación de texto conversacional en inglés y chino, según los idiomas declarados en la model card.
- Razonamiento y generación de texto general propia de un modelo base afinado para uso conversacional (tag `conversational`).
- Soporte de endpoints compatibles (tag `endpoints_compatible`), lo que sugiere integración con APIs tipo OpenAI.
- Capacidades de tool calling, function calling o agentes: no disponible en la información proporcionada.
- Capacidades multimodales (visión, audio): no disponible.
- Modo thinking o razonamiento extendido: no disponible.
- Capacidades multilingües más allá de inglés y chino: no disponible.

## Casos de uso

- Despliegue local de un modelo de 33B en estaciones de trabajo con GPU de consumo: la cuantización Q4_K_M (20,1 GB) permite cargar el modelo en una RTX 4090 de 24 GB, dejando margen para el contexto y el runtime de llama.cpp.
- Asistente conversacional en inglés o chino para entornos con requisitos de privacidad: al ejecutarse íntegramente en local con llama.cpp, los datos no salen del equipo, lo que encaja en escenarios con datos sensibles.
- Prototipado de aplicaciones con API compatible con endpoints: el tag `endpoints_compatible` permite integrar el modelo en servidores que emulan la API de OpenAI, útil para probar pipelines antes de migrar a un modelo mayor.
- Evaluación comparativa de cuantizaciones: al ofrecer cuatro niveles (Q2_K a Q5_K_M) del mismo modelo base, sirve para medir la degradación de calidad frente al ahorro de memoria en tareas concretas del usuario.
- Generación de texto en chino para equipos hispanohablantes que necesitan procesar documentación en ese idioma sin depender de servicios en la nube.
- Investigación sobre cuantización: la model card documenta el recuento de tensores por tipo y los hashes, lo que facilita reproducir y auditar el proceso de re-cuantización en estudios sobre el impacto de presets de llama.cpp.
- Base para fine-tuning ligero sobre GGUF: aunque el formato GGUF no es el ideal para entrenamiento, sirve como referencia para comparar con el modelo original en safetensors.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que no se reclama ningún benchmark de código, perplejidad ni puntuación de calidad, salvo los valores medidos que figuran en ella (tamaños de fichero, hashes y verificación de inferencia).

## Requisitos de hardware

- VRAM estimada para inferencia (solo pesos, sin contexto): Q2_K ~12,7 GB; Q3_K_M ~16,3 GB; Q4_K_M ~20,1 GB; Q5_K_M ~23,5 GB. Hay que sumar la memoria del contexto KV, que depende de la longitud de contexto configurada y no se especifica en la información disponible.
- GPU recomendadas: para Q4_K_M y Q5_K_M, GPU de 24 GB o más (RTX 4090, RTX 3090, A100 40 GB, H100). Para Q2_K y Q3_K_M, GPU de 16-24 GB; también es viable la descarga parcial a CPU con llama.cpp.
- ¿Cabe en GPU de consumo? Sí: Q4_K_M cabe en una RTX 4090 de 24 GB; Q2_K y Q3_K_M caben en GPUs de 16 GB como la RTX 4080 o la RTX 4060 Ti de 16 GB, con margen limitado para contexto.
- Opciones de despliegue: llama.cpp (build `b11669-620d2225c` o superior, obligatorio por la arquitectura); Ollama y otros frontends basados en llama.cpp son compatibles en la medida en que usen una versión de llama.cpp que soporte la arquitectura. vLLM y TGI no se mencionan en la información disponible para formato GGUF.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato disponible | Notas |
|---|---|---|---|---|---|
| Sakura-Nanbeige4.3-33B-GGUF (esta ficha) | 33,1 B | no disponible | Apache 2.0 | GGUF Q2_K–Q5_K_M | Cuantización comunitaria sin imatrix |
| Nanbeige/Nanbeige4.3-33B (original) | 33,1 B | no disponible | Apache 2.0 | safetensors, BF16 | Modelo base de referencia |
| bartowski/Nanbeige_Nanbeige4.3-33B-GGUF | 33,1 B | no disponible | Apache 2.0 | GGUF (incluye BF16) | Fuente del GGUF re-cuantizado |
| Nanbeige/Nanbeige4.3-33B-Base | 33,1 B | no disponible | no disponible | safetensors | Modelo base declarado (relación finetune) |

No se dispone de datos de rendimiento comparado entre estas variantes en la información proporcionada, por lo que la comparativa se limita a parámetros, formato y licencia.

## Limitaciones y advertencias

- No es una release oficial: la cuantización la firma un tercero (webmp3) y los autores upstream no la han validado.
- Sin calibración imatrix: la calidad de las cuantizaciones de baja precisión (especialmente Q2_K y Q3_K_M) puede ser inferior a la de cuantizaciones calibradas del mismo modelo.
- Re-cuantización desde GGUF BF16, no desde safetensors: se añade una generación de pérdida respecto a convertir directamente desde el checkpoint original.
- Sin benchmarks publicados: no hay evidencia medida de perplejidad, MMLU, HumanEval ni calidad conversacional; el autor lo declara explícitamente.
- Idiomas limitados a inglés y chino: no hay soporte declarado de castellano, lo que limita su uso en producción en español.
- Longitud de contexto no disponible: no se puede planificar el dimensionamiento de memoria KV sin consultar el modelo original.
- Riesgo de alucinación: inherente a los modelos de lenguaje; no hay datos específicos de mitigación en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial y redistribución con atribución; hay que conservar la atribución a Nanbeige y al cuantizador, y revisar la licencia del modelo base por si impone condiciones adicionales.
- Compatibilidad de runtime: requiere una build de llama.cpp que soporte la arquitectura; versiones antiguas pueden fallar al cargar el fichero.
- Repo de 145 GB: la descarga completa incluye las cuatro cuantizaciones; conviene descargar solo el fichero necesario.

## Enlaces

- Repositorio Hugging Face de esta cuantización: https://huggingface.co/webmp3/Sakura-Nanbeige4.3-33B-GGUF
- Modelo original: https://huggingface.co/Nanbeige/Nanbeige4.3-33B
- Model card del modelo original en el commit referenciado: https://huggingface.co/Nanbeige/Nanbeige4.3-33B/blob/c1093c501cc6460427c0ac634db7223d0450c0ee/README.md
- Modelo base declarado: https://huggingface.co/Nanbeige/Nanbeige4.3-33B-Base
- GGUF BF16 de origen (bartowski): https://huggingface.co/bartowski/Nanbeige_Nanbeige4.3-33B-GGUF
