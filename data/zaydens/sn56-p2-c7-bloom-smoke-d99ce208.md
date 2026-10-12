# zaydens/sn56-p2-C7-BLOOM-SMOKE-d99ce208

## Resumen

`zaydens/sn56-p2-C7-BLOOM-SMOKE-d99ce208` es un checkpoint de investigación publicado en HuggingFace por el usuario `zaydens`. Según su propia model card, se trata de un «research artefact» (artefacto de investigación) generado en el contexto de lo que el autor denomina «SN56 text tournament replay», con una verificación de tipo «validator-style round-trip»: el repositorio se descarga de nuevo y se puntúa sobre las filas reservadas (*held-out*) de la tarea para comprobar que la copia alojada en el Hub obtiene exactamente la misma puntuación que la copia local. No es, por tanto, un modelo orientado a uso general, sino un objeto de reproducibilidad de un pipeline de entrenamiento y evaluación.

El repositorio contiene 559.214.592 parámetros (aproximadamente 559 M) en formato safetensors, con un tamaño total de 1,1 GB. Lleva la etiqueta `bloom`, lo que sitúa la arquitectura en la familia BLOOM (transformer decoder-only); el recuento de parámetros coincide exactamente con el de BLOOM-560m, aunque la model card no confirma la arquitectura base ni el proceso de entrenamiento. El resto de ficheros son, según el autor, el directorio de salida del entrenador subido sin modificaciones.

La relevancia de esta ficha es acotada y conviene ser explícito: se trata de un artefacto con 0 descargas y 0 *likes*, sin licencia declarada, sin idiomas declarados, sin pipeline declarado y sin resultados de benchmarks publicados. Su interés principal es metodológico (trazabilidad de experimentos, verificación de puntuaciones entre entornos) y no como modelo listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BLOOM (transformer decoder-only, según el tag `bloom`); configuración concreta no disponible |
| Parametros totales | 559.214.592 (≈559 M), dato real de safetensors |
| Parametros activos | No aplica (no hay indicios de arquitectura MoE) |
| Longitud de contexto | No disponible (la familia BLOOM suele usar 2048 tokens, pero no se confirma) |
| Tipos de cuantizacion | No disponible (no se publican pesos cuantizados; solo safetensors) |
| Idiomas soportados | No disponibles |
| Licencia | No disponible |
| Formato de pesos | safetensors (1,1 GB de repositorio) |
| Autor | zaydens |
| Fecha de creacion | 2026-10-12T01:05:17.000Z |
| Ultima actualizacion | 2026-10-12T01:05:26.000Z |
| Descargas / likes | 0 / 0 |
| Pipeline declarado | No disponible |

## Arquitectura y entrenamiento

La única información arquitectónica disponible es la etiqueta `bloom` del repositorio y el recuento real de parámetros (559.214.592). Esto es consistente con un transformer decoder-only de la familia BLOOM en su variante de aproximadamente 560 M de parámetros, pero ni la model card ni los metadatos confirman la configuración de capas, cabezas de atención, dimensión oculta ni la longitud de contexto. Tampoco hay información sobre si el checkpoint es un modelo base, un ajuste fino o un resultado intermedio de un entrenamiento truncado.

Sobre el entrenamiento, la model card se limita a identificar el artefacto con la celda `C7-BLOOM-SMOKE`, la tarea `task8` con identificador `d99ce208`, un *tree SHA* `1d561da` y la indicación de que la semilla quedó sin fijar («seed: unset, the trainer's default»). No se indica número de tokens de entrenamiento, composición del dataset, ni si hubo RLHF, DPO o cualquier otra etapa de alineamiento. El sufijo «SMOKE» en el nombre de la celda sugiere una ejecución de prueba (*smoke test*) más que un entrenamiento completo, pero esto es una interpretación del nombre y no un dato confirmado. La innovación declarada no es técnica sino de proceso: la verificación de que la puntuación obtenida al reevaluar la copia del Hub coincide con la puntuación local.

## Capacidades

No se ha publicado información que documente capacidades específicas de este checkpoint. Los puntos siguientes son deducciones a partir de la etiqueta `bloom` y del tamaño, y no están verificados por el autor:

- Generación de texto autoregresiva, propia de un transformer decoder-only.
- Capacidad limitada de razonamiento y de conocimiento factual, coherente con un modelo del orden de 560 M de parámetros.
- Soporte de *tool calling* / *function calling*: no documentado; previsiblemente inexistente sin un ajuste específico.
- Soporte de agentes y razonamiento multi-paso: no documentado; muy improbable sin post-entrenamiento.
- Capacidades multilingües: no disponibles. La familia BLOOM se entrenó con datos multilingües, pero no hay confirmación para este checkpoint.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Uso principal declarado: reproducción de una evaluación *held-out* en un torneo de texto.

## Casos de uso

- Reproducción y auditoría de experimentos: el caso de uso explícito del autor. Descargar el repositorio, ejecutar la tarea `task8` sobre las filas reservadas y comprobar que la puntuación coincide con la de la copia local, como control de integridad del pipeline de entrenamiento.
- Verificación de pipelines de publicación en el Hub: útil como prueba de que el proceso de subida (serialización, tokenizador, ficheros de configuración) no altera el comportamiento del modelo entre el entorno local y el remoto.
- Pruebas de humo (*smoke tests*) en CI: al ser un checkpoint pequeño y con un tamaño de repositorio de 1,1 GB, puede integrarse en una *suite* de integración continua que valide carga de safetensors, tokenización y una generación corta antes de lanzar entrenamientos mayores.
- Ajuste fino ligero sobre tareas de clasificación: un modelo de ~559 M permite *fine-tuning* completo o con LoRA en una sola GPU de gama media para clasificación de texto, análisis de sentimiento o etiquetado, siempre que se verifique antes que el checkpoint se comporta como un modelo de lenguaje funcional.
- Extracción de representaciones para búsqueda semántica: usar las activaciones del encoder/decoder como *embeddings* de frases en un índice vectorial, con la salvedad de que no se ha validado la calidad de dichas representaciones.
- Evaluación comparativa de checkpoints pequeños: servir como referencia base frente a otros artefactos del mismo torneo para medir el efecto de cada configuración de entrenamiento.
- Prototipado de infraestructura de inferencia: banco de pruebas para validar despliegues con transformers, vLLM o TGI antes de escalar a modelos mayores, dado su reducido consumo de memoria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que el repositorio se reevalúa sobre las filas reservadas de la tarea, pero no incluye ninguna puntuación numérica (ni MMLU, ni HumanEval, ni GSM8K, ni métricas propias del torneo). No se deben asumir valores derivados de BLOOM-560m, ya que no hay confirmación de que este checkpoint conserve las capacidades del modelo original.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculos derivados de 559.214.592 parámetros, no cifras publicadas por el autor):
  - fp32: aproximadamente 2,24 GB solo de pesos.
  - fp16 / bf16: aproximadamente 1,12 GB solo de pesos, coherente con el tamaño de repositorio de 1,1 GB.
  - int8: aproximadamente 0,56 GB.
  - int4: aproximadamente 0,28 GB.
  - A estas cifras hay que añadir la caché KV, las activaciones y el *overhead* del runtime; con contexto de 2048 tokens el consumo adicional es moderado.
- GPU recomendadas: cualquier GPU con 4 GB o más de VRAM es suficiente en fp16. Cabe en GTX 1650 / 1060 (6 GB), RTX 3050, RTX 3060, RTX 4060, RTX 4090, A100, H100 sin dificultad. También es viable en CPU para pruebas puntuales.
- Cabe en GPU de consumo: sí, en la práctica totalidad de GPU de consumo actuales e incluso en algunas integradas con memoria compartida.
- Opciones de despliegue: `transformers` (safetensors nativo), vLLM y TGI para servicio con batching. Para llama.cpp u Ollama sería necesario convertir previamente a GGUF, ya que el repositorio no publica pesos GGUF.
- Latencia y throughput estimados: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

Los datos de la columna «este modelo» proceden de la información del repositorio. Los de las alternativas son especificaciones públicas de referencia y no proceden de la búsqueda realizada; se incluyen únicamente como contexto de categoría.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| sn56-p2-C7-BLOOM-SMOKE-d99ce208 | 559 M (dato real) | No disponible | No disponible | HuggingFace, 0 descargas |
| BLOOM-560m | 559 M (referencia publica) | 2048 tokens (referencia publica) | BigScience BLOOM RAIL 1.0 (referencia publica) | HuggingFace |
| Qwen2.5-0.5B | ≈494 M (referencia publica) | 32.768 tokens (referencia publica) | Apache 2.0 (referencia publica) | HuggingFace |
| SmolLM2-360M | ≈362 M (referencia publica) | 8192 tokens (referencia publica) | Apache 2.0 (referencia publica) | HuggingFace |

La comparación relevante no es de rendimiento —no hay benchmarks de este checkpoint— sino de estado de publicación: frente a las alternativas, este artefacto carece de licencia, de idiomas declarados y de documentación de capacidades, lo que limita cualquier uso fuera del ámbito de reproducción de experimentos.

## Limitaciones y advertencias

- Ausencia total de licencia: al no declararse licencia, no hay autorización explícita de uso comercial ni de redistribución. Cualquier uso en producción debe considerarse jurídicamente no resuelto hasta contactar con el autor.
- No es un modelo de propósito general: la propia model card lo describe como artefacto de investigación de un torneo, no como modelo desplegable.
- Sin datos de evaluación: no hay benchmarks, ni métricas de calidad, ni validación de que el checkpoint genere texto coherente. El sufijo «SMOKE» apunta a una ejecución de prueba, no a un entrenamiento completo.
- Riesgo de alucinación: no cuantificado. En modelos de ~560 M de parámetros el conocimiento factual es limitado y la generación puede ser incoherente, pero no hay mediciones para este checkpoint concreto.
- Sesgos: no documentados. Si el checkpoint deriva de BLOOM, heredaría los sesgos de los corpus multilingües empleados en su entrenamiento original (incluido Common Crawl), pero esto no está confirmado en la información disponible.
- Limitaciones de contexto e idioma: desconocidas. No se declara ventana de contexto ni lista de idiomas soportados.
- Metadatos atípicos: las fechas de creación y actualización (2026-10-12) y el intervalo de nueve segundos entre ambas deben tratarse con cautela; conviene verificar la procedencia del repositorio antes de reutilizarlo.
- Reproducibilidad dependiente del entorno: la verificación «round-trip» descrita por el autor exige replicar exactamente el pipeline de evaluación original, incluidos el tokenizador y las filas reservadas, que no se detallan en la model card.
- Sin garantías de soporte: 0 descargas y 0 *likes* implican ausencia de comunidad, de issues resueltos y de mantenimiento.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zaydens/sn56-p2-C7-BLOOM-SMOKE-d99ce208
- La busqueda web realizada no devolvio ningun enlace relevante al modelo, a su arquitectura ni al proyecto «SN56 text tournament». No se incluyen los resultados obtenidos por no guardar relacion con el objeto de esta ficha.
