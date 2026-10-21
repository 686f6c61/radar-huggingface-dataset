# XHToken/Spark-X2.6-4B-Base

## Resumen

Spark-X2.6-4B-Base es un modelo de lenguaje de 4.112.079.360 parámetros (aproximadamente 4,1 mil millones) desarrollado por XHToken (equipo SparkLLM), orientado a su despliegue en dispositivo (*on-device*) para tareas de agente en el mundo real. Se presenta como la evolución del Spark-X2.5-4B: según la model card, mantiene exactamente la misma arquitectura que su predecesor y obtiene sus mejoras exclusivamente mediante un post-entrenamiento refinado, con avances en código, flujos agénticos, contexto largo, multilingüismo y razonamiento.

El modelo se distribuye en formato Hugging Face Transformers con pesos safetensors (8,2 GB de repositorio, coherente con un checkpoint en bf16), requiere `trust_remote_code=True` por el uso de código propio y está etiquetado para generación de texto conversacional en inglés y chino. Su licencia Apache 2.0 permite uso comercial sin restricciones de campo de uso, lo que lo sitúa en una categoría atractiva para integraciones en producto.

Su relevancia actual radica en la combinación de tamaño reducido (apto para GPU de consumo e incluso CPU con cuantización), licencia permisiva y un enfoque explícito en agentes con *tool use* y planificación multi-paso, además de un presupuesto de razonamiento configurable en tres niveles (ninguno, bajo, alto). No obstante, la información pública disponible es escasa: no se han publicado resultados numéricos de benchmarks ni detalles sobre la longitud de contexto, la composición del dataset o el proceso de alineación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Spark-X2.5, código propio `spark2_5`/`sparkx2_5`); detalles internos no disponibles |
| Parametros totales | 4.112.079.360 (4,11 B) |
| Parametros activos | No aplica segun la informacion disponible (no se declara MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible en la model card; al ser pesos safetensors en bf16 es cuantizable a int8/4-bit con herramientas estandar (GGUF, GPTQ/AWQ) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Transformers, requiere `trust_remote_code`) |

## Arquitectura y entrenamiento

La model card indica que Spark-X2.6-4B conserva "exactamente la misma arquitectura" que Spark-X2.5-4B, un transformer de 4,11 mil millones de parámetros con implementación de atención y utilidades en código propio (etiquetas `spark2_5` y `sparkx2_5`, `custom_code` en los tags del repositorio). No se especifica si emplea atención completa, atención lineal o algún esquema híbrido, ni se detalla el número de capas, dimensión oculta o número de cabezas. Tampoco se documenta la longitud de contexto nativa, aunque las mejoras declaradas en "long-context" sugieren una ventana ampliada respecto al modelo anterior.

En cuanto a entrenamiento, la información disponible es deliberadamente escueta: se afirma que la ganancia de capacidades proviene de un post-entrenamiento mejorado, sin publicar el volumen de tokens, la composición del corpus, ni si se emplearon RLHF, DPO u otras técnicas de alineación. La innovación técnica destacada es el "presupuesto de pensamiento controlable" (*thinking budget*), con tres niveles configurables (ninguno, bajo, alto) que permiten ajustar en tiempo de inferencia el equilibrio entre calidad de razonamiento, latencia y coste. El equipo recomienda Llama-Factory (fork propio) para el ajuste fino.

## Capacidades

- Generación de texto conversacional en inglés y chino, con pipeline declarado `text-generation`.
- Razonamiento con modo de pensamiento configurable en tres niveles (ninguno, bajo, alto), lo que permite desactivar la cadena de razonamiento para minimizar latencia.
- Capacidades de código y ingeniería de software, reforzadas en esta versión según la model card.
- Flujos agénticos: uso complejo de herramientas, planificación multi-paso y ejecución de tareas encadenadas.
- Contexto largo: se declaran mejoras específicas en esta área, aunque sin cifra de ventana disponible.
- Capacidades multilingües limitadas a inglés y chino según el campo `language` de la model card.
- Ajuste fino soportado mediante Llama-Factory.
- No se declaran capacidades de visión, audio, ni *tool calling* con un esquema formal (JSON Schema) documentado.

## Casos de uso

- Agentes locales en dispositivo: al ser un modelo de 4,11 B con cuantización 4-bit manejable en GPUs de consumo, puede ejecutarse en un portátil o estación de trabajo para orquestar herramientas locales (sistema de ficheros, shell, APIs internas) sin enviar datos a la nube, lo que resulta adecuado para entornos con requisitos de privacidad.
- Asistentes de código en IDE: sus mejoras declaradas en código y su tamaño permiten integrarlo como autocompletado o chat contextual dentro de editores, con el nivel de pensamiento desactivado para reducir latencia en sugerencias inline.
- Automatización de atención al cliente bilingüe (inglés/chino): conversaciones multi-turno con un modelo autoalojado y licencia Apache 2.0, sin coste por token y con control total sobre el prompt de sistema y el filtrado.
- Pipelines de CI/CD con agentes de reparación: dado su enfoque en *tool use* y planificación multi-paso, puede encadenarse a herramientas de build y test para diagnosticar fallos y proponer parches dentro de un flujo automatizado.
- Procesamiento de documentos largos en chino e inglés: las mejoras declaradas en contexto largo permiten resumir o extraer información de informes extensos, aunque la ventana exacta debe verificarse empíricamente antes de fijar el tamaño de los fragmentos.
- Base para ajuste fino vertical: al partir de un checkpoint de 4,11 B bajo Apache 2.0 y con soporte de Llama-Factory, es viable especializarlo en dominios concretos (legal, sanitario, soporte interno) con un coste de cómputo moderado.
- Prototipado e investigación en razonamiento con presupuesto controlado: los tres niveles de *thinking* permiten estudiar la relación entre coste de inferencia y precisión sin cambiar de modelo, útil para experimentos de evaluación comparativa.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card afirma de forma cualitativa que el modelo alcanza un rendimiento "de vanguardia entre modelos de tamaño similar" y que iguala o supera a modelos de aproximadamente 9 B de parámetros en flujos agénticos, pero no se aporta ninguna tabla con MMLU, HumanEval, GSM8K, BFCL ni métricas equivalentes, ni la metodología de evaluación. Cualquier cifra al respecto debe considerarse no verificada.

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (4,11 B); no hay mediciones publicadas por el autor:

- VRAM en bf16/fp16: pesos de aproximadamente 8,2 GB (coincide con el tamaño del repositorio); con caché KV y overhead de ejecución conviene prever 10-12 GB.
- VRAM en int8: pesos de aproximadamente 4,3 GB; total estimado 6-7 GB.
- VRAM en 4-bit (GGUF Q4_K_M): pesos de aproximadamente 2,4-2,7 GB; total estimado 4-5 GB, dependiendo de la longitud de contexto efectiva.
- GPU recomendadas: A100 40 GB, H100 o L40S para servicio concurrente en bf16; RTX 4090 (24 GB) o RTX 4080 (16 GB) para desarrollo e inferencia en precisión completa.
- GPU de consumo: cabe en RTX 3060 12 GB, RTX 4060 Ti 16 GB y RTX 4070 en bf16; en 4-bit es viable en RTX 4060 8 GB y GPUs con 6-8 GB.
- CPU: ejecutable con llama.cpp/Ollama en 4-bit siempre que se disponga de al menos 8 GB de RAM libre, con throughput bajo.
- Opciones de despliegue: `transformers` con `trust_remote_code=True` (requisito para el código propio); vLLM, TGI o SGLang solo si el código propio está integrado en esas librerías, extremo no confirmado; llama.cpp y Ollama requieren conversión previa a GGUF, no publicada en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

Datos de los modelos alternativos tomados de sus model cards públicas; el contexto de Spark-X2.6-4B no está disponible.

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| Spark-X2.6-4B-Base | 4,11 B | no disponible | Apache 2.0 | Enfoque on-device y agentes; sin benchmarks publicados; requiere `trust_remote_code` |
| Qwen3-4B | ~4 B | 32 k nativo (ampliable con YaRN) | Apache 2.0 | Ecosistema amplio, benchmarks publicados, soporte nativo en vLLM y llama.cpp |
| Llama-3.2-3B-Instruct | 3,21 B | 128 k | Llama 3.2 Community License | Ventana de contexto muy superior; licencia con restricciones para grandes despliegues |
| Phi-4-mini | ~3,8 B | 128 k | MIT | Fuertemente orientado a razonamiento y matemáticas; licencia muy permisiva |

La comparación cuantitativa de rendimiento no es posible: Spark-X2.6-4B no publica métricas y las alternativas sí. La principal ventaja diferencial declarada es el presupuesto de razonamiento configurable y su orientación a agentes; la principal desventaja objetivable es la ausencia de datos de evaluación y de contexto documentado.

## Limitaciones y advertencias

- Ausencia total de benchmarks publicados: no es posible verificar las afirmaciones de rendimiento de la model card ("igualar o superar modelos de ~9 B") sin evaluación propia.
- Longitud de contexto no documentada: impide dimensionar correctamente pipelines de RAG o conversaciones largas sin pruebas empíricas previas.
- Idiomas limitados a inglés y chino; el rendimiento en castellano no está garantizado ni evaluado, por lo que no debe asumirse calidad equiparable.
- Riesgo de alucinación estándar en modelos de este tamaño, agravado por no disponer de datos sobre el proceso de alineación (RLHF/DPO) ni sobre evaluaciones de veracidad.
- Sesgos no documentados: la model card no incluye ninguna sección de sesgos, evaluación de seguridad ni *red teaming*.
- Ambigüedad de nomenclatura: el repositorio se llama "Base", pero la model card describe un modelo post-entrenado con modos de pensamiento; conviene verificar qué checkpoint se está descargando realmente.
- Dependencia de `custom_code` y `trust_remote_code=True`: implica ejecutar código del autor al cargar el modelo, con el riesgo de seguridad asociado y posible incompatibilidad con frameworks de servicio como vLLM o TGI.
- No se publica versión GGUF ni cuantizaciones oficiales; el despliegue en llama.cpp/Ollama exige conversión propia.
- Adopción comunitaria muy baja (15 descargas, 14 likes en el momento de la consulta) y fecha de creación en 2026: escasa validación por terceros.
- Licencia Apache 2.0: sin restricciones de uso comercial, pero conviene conservar el aviso de licencia y la atribución; el modelo no incluye garantías.

## Enlaces

- [Hugging Face: XHToken/Spark-X2.6-4B-Base](https://huggingface.co/XHToken/Spark-X2.6-4B-Base)
- [Repositorio de Llama-Factory recomendado por el autor](https://github.com/XHToken/LlamaFactory)
- [Slack de SparkLLM](https://join.slack.com/t/tokenspark/shared_invite/zt-432qf8l2f-5~dLyXv8uETr0P0UuC07nw)
- [Discord de SparkLLM](https://discord.gg/kTDE2Hg8aw)
- [Canal de YouTube de SparkLLM](https://www.youtube.com/@SparkLLM)
- [dev.to de SparkLLM](https://dev.to/sparkllm)
- [Bluesky de SparkLLM](https://bsky.app/profile/sparkllm.bsky.social)
- [Cuenta de X de SparkLLM](https://x.com/sparkllm)
- [Zhihu de SparkLLM](https://www.zhihu.com/people/zhiikz7qh7m)
- Paper tecnico: no disponible
- Demo publica: no disponible
