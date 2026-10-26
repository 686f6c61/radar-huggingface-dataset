# voicort/sn92-generalist-v5-2

## Resumen

SN92-generalist-v5-2 es un ajuste fino del modelo base baselabs/mammoth-1 (MIT), que a su vez es un post-entrenamiento de Qwen/Qwen3.5-27B (Apache-2.0). Lo publica el usuario voicort en HuggingFace para la pista "generalist" del protocolo REAX (subred 92 de Bittensor) bajo la especificación eval v5.1. No es un modelo conversacional al uso: es un modelo de decisión causal que recibe una única pregunta con opciones etiquetadas (A, B, C...) y cuya respuesta se lee directamente de los logits del siguiente token correspondiente a cada letra de opción. La arquitectura no se modifica respecto al base (Qwen3_5ForConditionalGeneration, 27,4B parámetros en bf16).

El interés técnico está en el método de entrenamiento: dos ejecuciones independientes de LoRA (rango 64, alpha 128, sobre todas las capas lineales del modelo de lenguaje) fusionadas en los pesos y promediadas con pesos iguales (model soup), sobre 194.364 y 375.129 preguntas respectivamente, todas con el formato exacto de prompt de eval v5.1. La función de pérdida es una entropía cruzada suave sobre los logits de las letras de opción a temperatura 2, con objetivos mezclados con la propia distribución de respuestas de mammoth-1 para no destruir su conocimiento general.

Es relevante ahora por dos motivos: muestra un patrón de especialización extrema en un formato de decisión concreto (hasta 26 opciones, yes/no, "no lo sé" como última opción en preguntas de hechos) y porque su publicación está ligada a un benchmark de evaluación abierto y reproducible (REAX eval v5.1), lo que permite auditar qué se entrenó y qué no (el autor declara que ningún ítem del dev set público v5.1 se usó en entrenamiento).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal (Qwen3_5ForConditionalGeneration), sin cambios respecto al base |
| Parámetros totales | 27.356.728.560 (≈27,4B) |
| Parámetros activos | no disponible (no es un MoE según la información proporcionada) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados y servicio de referencia en bf16) |
| Idiomas soportados | no disponible (los datos de entrenamiento incluyen parcialmente alemán, español y francés en dominios de decisión basados en reglas) |
| Licencia | Apache-2.0 (con aviso MIT de mammoth-1 reproducido en NOTICE) |
| Formato de pesos | safetensors (bf16); repositorio de 54,7 GB |

## Arquitectura y entrenamiento

Arquitectura transformer causal estándar heredada de Qwen3.5-27B vía mammoth-1, con la torre de visión intacta pero sin usar. El autor indica explícitamente que la arquitectura no cambia y que el modelo está pensado para la ruta causal simple: se sirve con vLLM usando la plantilla de chat Qwen fija de REAX, thinking desactivado, una pregunta por petición, y la respuesta se extrae de los logits del siguiente token de las letras de opción. Los cambios respecto al base son dos: el ajuste fino y la configuración (`dtype` a bfloat16 y eliminación de la clave `modeling_overrides` específica del runtime del base). Tokenizer y processor son los del modelo base.

El ajuste fino consiste en dos ejecuciones LoRA (rango 64, alpha 128, todas las capas lineales del modelo de lenguaje), fusionadas en los pesos en bf16 y promediadas con pesos iguales. La pérdida es entropía cruzada suave sobre los logits de las letras de opción a temperatura 2, con objetivos mezclados con la distribución de respuestas de mammoth-1: peso 0,5 donde mammoth-1 acierta y 0,15 donde falla (en la segunda ejecución, las filas de decisión basadas en reglas usaron solo las respuestas gold). Los datos cubren razonamiento procedimental con respuestas verificadas de forma independiente (problemas aritméticos, salida de código, lógica multi-paso, SQL, probabilidad, mejores movimientos de ajedrez etiquetados con Stockfish/Lichess), decisiones de uso de herramientas sobre APIs ficticias generadas proceduralmente (siguiente llamada, decisión de llamar a herramienta, recuperación de herramientas, cuándo llamar/preguntar/responder/rechazar), retrieval y clasificación con muchas opciones (categorías arXiv, MASSIVE, BANKING77, CLINC150, SQuAD/Wikipedia), tareas de lenguaje y arte (NLI, stance, continuación de relatos de dominio público, seguridad de contenido, pares de poemas, acordes), dominios nuevos de decisión basados en reglas sobre políticas (parcialmente en alemán, español y francés) y etiquetas de registros públicos (NOAA storm events, MSHA, openFDA, Federal Register, NVD CVE), además de preguntas de hechos a libro cerrado con opción "no lo sé" (los hechos posteriores al 1 de agosto de 2026 se marcan como "no lo sé") y una repetición de ítems estilo evaluación para preservar habilidades generales.

## Capacidades

- Clasificación y decisión de opción múltiple en un único turno, con hasta 26 opciones etiquetadas por letra.
- Preguntas de sí/no con formato fijo "A: Yes / B: No".
- Preguntas de hechos a libro cerrado con opción explícita de abstención ("I don't know" como última opción).
- Razonamiento procedimental: problemas aritméticos, lógica multi-paso, probabilidad, predicción de salida de código y resultados SQL.
- Decisiones de uso de herramientas: selección del siguiente API call, recuperación de herramienta relevante y decisión de llamar, preguntar, responder o rechazar.
- Retrieval y clasificación con muchas opciones: categorías arXiv, intenciones (MASSIVE, BANKING77, CLINC150), recuperación de pasajes.
- NLI, análisis de stance, continuación de historias, clasificación de seguridad de contenido, emparejamiento de poemas y acordes musicales.
- Decisiones basadas en reglas sobre dominios de política y etiquetado de registros públicos (meteorología, minería, dispositivos médicos, registro federal, vulnerabilidades CVE).
- Ajedrez: selección de mejor movimiento con etiquetas de Stockfish/Lichess.
- No se documenta soporte de agentes multi-paso, visión funcional ni modo thinking (de hecho, se sirve con thinking desactivado).

## Casos de uso

- Enrutamiento y triaje de peticiones: dado un mensaje de usuario y un conjunto cerrado de hasta 26 intenciones, el modelo devuelve la letra de la intención correcta leyendo los logits del siguiente token. Es adecuado porque se entrenó específicamente con splits de MASSIVE, BANKING77 y CLINC150 en ese formato.
- Decisión de uso de herramientas en pipelines de agentes: el modelo decide si el siguiente paso es invocar una API, pedir aclaración, responder directamente o rechazar, y qué herramienta recuperar de un catálogo. Encaja en orquestadores que ya gestionan el estado y solo necesitan un clasificador de decisión fiable.
- Moderación y clasificación de seguridad de contenido: al haber sido entrenado con tareas de content safety en formato de opción múltiple, puede actuar como clasificador de segunda etapa en un pipeline de moderación con umbrales calibrados.
- Etiquetado de registros estructurados: categorización de partes de accidentes (MSHA), eventos meteorológicos (NOAA), retiradas de dispositivos (openFDA), documentos del Federal Register o debilidades CWE de CVEs, como paso de normalización en un ETL.
- Enrutamiento documental y bibliográfico: asignación de categorías arXiv y verificación de coincidencia título-abstract, útil para desduplicar o clasificar ingestiones masivas de preprints.
- Evaluación comparativa de modelos: sirve como "entrada causal" de referencia en REAX eval v5.1, permitiendo comparar la calidad de decisión frente a otros modelos servidos con la misma plantilla y el mismo modo de lectura de logits.
- Selección de movimientos en herramientas de análisis de ajedrez: dado un conjunto de movimientos candidatos, elegir el mejor según etiquetas de Stockfish, como componente de un motor de sugerencias de bajo coste.
- Extracción de respuestas con abstención controlada: en dominios con riesgo de error (hechos verificables), el uso de la opción "no lo sé" permite degradar a un humano en lugar de alucinar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo referencia la especificación REAX eval v5.1 y declara que ningún ítem del dev set público v5.1 se usó en entrenamiento, pero no reproduce puntuaciones.

## Requisitos de hardware

- Pesos en bf16: 27,36B parámetros, repositorio de 54,7 GB. La VRAM necesaria para inferencia en bf16 es previsiblemente de unos 60-70 GB contando caché KV y overhead del runtime (estimación, no dato publicado).
- GPU recomendadas para bf16: A100 80 GB, H100 80 GB o H200. También posible en configuraciones multi-GPU con tensor parallelism (por ejemplo 2× A100 40 GB o 2× RTX 4090/A6000 de 24-48 GB).
- No cabe en una GPU de consumo individual en bf16 con 24 GB. Con cuantización a 8 bits (≈27 GB) o 4 bits (≈14-16 GB) podría caber en RTX 4090/3090 o A6000, aunque el autor no publica pesos cuantizados ni valida esa ruta: los pesos del repo son bf16 y el servicio de referencia es bf16.
- Despliegue: vLLM es la vía documentada, con la plantilla de chat Qwen fija de REAX, thinking desactivado y una pregunta por petición. Otras opciones (llama.cpp, Ollama, TGI, SGLang) no están documentadas; requerirían convertir los pesos a GGUF o formatos compatibles, algo que el autor no ha publicado. Nótese que el uso previsto depende de acceder a los logits del siguiente token, lo que exige un servidor que exponga logits (vLLM con `logprobs`/prompt logprobs) y no solo texto generado.
- Latencia y throughput: no disponibles. Al procesar una sola pregunta por petición con salida de un token, el coste dominante es el prefill del prompt.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| voicort/sn92-generalist-v5-2 | 27,36B | no disponible | Apache-2.0 | HuggingFace, safetensors bf16 | Fine-tune de decisión para REAX eval v5.1 |
| baselabs/mammoth-1 | no disponible (base del anterior) | no disponible | MIT | HuggingFace | Post-entrenado de Qwen3.5-27B; fuente de la distribución de referencia usada en la pérdida |
| Qwen/Qwen3.5-27B | ≈27B (según la card del fine-tune) | no disponible | Apache-2.0 | HuggingFace | Modelo base original, uso general y conversacional |

No se dispone de datos de rendimiento comparado entre estas tres variantes en la información proporcionada, por lo que la comparación se limita a linaje, licencia y formato de publicación.

## Limitaciones y advertencias

- Modelo especializado, no conversacional: está entrenado y pensado para una única pregunta con opciones etiquetadas y lectura de logits. Su uso como chat libre o en multi-turno no está validado y probablemente degrade.
- Dependencia del formato exacto: la plantilla de chat Qwen fija de REAX, el orden de las opciones, la codificación "A: Yes / B: No" y la posición de "I don't know" como última opción forman parte de las condiciones de entrenamiento. Cambiar el formato puede invalidar el comportamiento aprendido.
- Riesgo de alucinación en preguntas de hechos: aunque se entrena con opción de abstención y se marcan como "no lo sé" los hechos posteriores al 1 de agosto de 2026, no hay datos publicados sobre la tasa de abstención correcta ni sobre calibración.
- Sesgos: los datos incluyen registros públicos y conjuntos de clasificación de intenciones; no se documenta ninguna auditoría de sesgo ni evaluación de equidad. Los sesgos del base (Qwen3.5-27B vía mammoth-1) se heredan.
- Cobertura lingüística no declarada: solo se menciona que parte de los datos de decisión basados en reglas están en alemán, español y francés; el resto parece centrado en inglés. No hay lista oficial de idiomas soportados.
- Licencia: Apache-2.0 permite uso comercial, pero se deben conservar LICENSE, NOTICE (con el aviso MIT de mammoth-1) y MODIFICATIONS.md. Cualquier uso debe respetar también las condiciones del modelo base.
- Trazabilidad del benchmark: el autor declara que no se entrenó con ítems del dev set público v5.1, pero no se publican métricas que permitan verificarlo de forma independiente.
- Sin cuantizaciones oficiales ni pipeline declarado en HuggingFace (campo `pipeline` no disponible), lo que añade fricción para integrarlo fuera de vLLM.
- Advertencia de producción: la lectura de logits exige que el servidor de inferencia exponga logprobs; un despliegue que solo devuelva texto generado no reproduce el comportamiento previsto.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/voicort/sn92-generalist-v5-2
- Modelo base (mammoth-1): https://huggingface.co/baselabs/mammoth-1
- Modelo original (Qwen3.5-27B): https://huggingface.co/Qwen/Qwen3.5-27B
- Artefactos de licencia y atribuciones del repo: LICENSE, NOTICE y MODIFICATIONS.md en https://huggingface.co/voicort/sn92-generalist-v5-2
- Papers, blogs, repositorios o demos adicionales: no disponibles en la información proporcionada.
