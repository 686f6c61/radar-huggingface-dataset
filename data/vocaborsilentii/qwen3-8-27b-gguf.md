# VocaborSilentii/Qwen3.8-27B-GGUF

## Resumen

VocaborSilentii/Qwen3.8-27B-GGUF es un repositorio de pesos cuantizados en formato GGUF del modelo Qwen3.8-27B, publicado por el usuario VocaborSilentii a partir de los pesos de Qwen/Qwen3.8-27B. El modelo base es un transformer causal denso de 27.320.697.856 parámetros (aproximadamente 27,3 B) con codificador de visión, pensado para comprensión nativa de imágenes y vídeo, razonamiento multi-paso y tareas agénticas de horizonte largo. La cuantización se ha realizado con Unsloth Dynamic 3.0, metodología que, según la documentación de Unsloth, ofrece más de un 10 % de mejora en precisión top-1 % frente a otros proveedores de GGUF del mismo tamaño.

El interés práctico del repositorio es que traslada un modelo de 27 B con ventana de contexto nativa de 262.144 tokens (extensible hasta 1.000.000) a hardware de consumo, algo inviable con los pesos en precisión completa. El espacio ocupa 472,1 GB, lo que indica la publicación de múltiples variantes de cuantización bajo el mismo repositorio.

En el momento de su creación (26 de septiembre de 2026) el repositorio no registra descargas ni valoraciones, por lo que se trata de una publicación sin validación comunitaria previa. La licencia declarada, tanto en el repositorio como en el modelo base, es Apache 2.0.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer causal denso con codificador de visión; layout híbrido Gated DeltaNet (atención lineal) + Gated Attention |
| Parámetros totales | 27.320.697.856 (≈27,3 B) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens nativos; extensible hasta 1.000.000 |
| Tipos de cuantización | GGUF con Unsloth Dynamic 3.0; la lista exacta de niveles publicados no está detallada en la información disponible |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF |
| Modelo base | Qwen/Qwen3.8-27B |
| Dimensión oculta | 5.120 |
| Número de capas | 64 |
| Vocabulario (token embedding / LM output) | 248.320 (padded) |
| Dimensión intermedia de la FFN | 17.408 |
| Tamaño del repositorio | 472,1 GB |
| Fecha de publicación | 26 de septiembre de 2026 |

## Arquitectura y entrenamiento

El modelo base es un transformer causal con codificador de visión y una disposición de capas híbrida poco habitual: 16 bloques que repiten la secuencia 3 × (Gated DeltaNet → FFN) seguida de 1 × (Gated Attention → FFN), lo que da las 64 capas totales. La Gated DeltaNet es un mecanismo de atención lineal con 48 cabezas lineales para V y 16 para QK, con dimensión de cabeza 128; al no mantener caché KV por token, reduce el coste de memoria en contextos largos. La Gated Attention convencional se aplica solo en 16 de las 64 capas, con 24 cabezas para Q y 4 para KV, dimensión de cabeza 256 y dimensión de RoPE de 64. La red feed-forward tiene dimensión intermedia de 17.408. El modelo incorpora además predicción multi-token (MTP) entrenada con varios pasos, técnica que permite decodificación especulativa y aceleración de la generación.

El entrenamiento declarado abarca fases de pre-entrenamiento y post-entrenamiento, con control flexible de razonamiento: el modo thinking está activado por defecto, puede desactivarse por petición, la profundidad de razonamiento se ajusta mediante `reasoning_effort` y el contexto de razonamiento de mensajes previos se conserva con `preserve_thinking`. El número de tokens de pre-entrenamiento, la composición del dataset y el detalle de las técnicas de alineación (RLHF, DPO u otras) no se especifican en la información disponible. La capa de cuantización empleada en este repositorio, Unsloth Dynamic 3.0, se aplica sobre los pesos del modelo base para generar los ficheros GGUF.

## Capacidades

- Generación de texto conversacional y no conversacional, con soporte de modo thinking activable y desactivable por petición.
- Razonamiento multi-paso controlable mediante el parámetro `reasoning_effort`, con retención del contexto de razonamiento previo gracias a `preserve_thinking`.
- Comprensión de visión-lenguaje nativa: imágenes y vídeo, incluyendo diagramas STEM, documentos y vídeos de hasta una hora de duración según la model card.
- Codificación, trabajo profesional y tareas de investigación, con mejoras declaradas respecto a las generaciones Qwen3.5 y Qwen3.6.
- Ejecución agéntica: planificación autónoma y gestión de retroalimentación del entorno para completar tareas de extremo a extremo.
- Soporte de tool calling y function calling, con mejoras específicas en el análisis de objetos anidados para aumentar la tasa de éxito de las llamadas.
- Soporte del rol de desarrollador (developer role), lo que permite su integración en herramientas agénticas tipo Codex.
- Predicción multi-token (MTP) entrenada, utilizable para decodificación especulativa.
- Compatibilidad declarada con endpoints de inferencia (etiqueta `endpoints_compatible`).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Atención al cliente automatizada: el modelo puede sostener conversaciones multi-turno con historiales muy largos gracias a su ventana nativa de 262.144 tokens, manteniendo coherencia en casos con documentación adjunta extensa y sin truncar el contexto previo.
- Análisis de documentación técnica y diagramas: al integrar codificador de visión, puede recibir capturas de esquemas eléctricos, diagramas de arquitectura de software o figuras de artículos científicos y responder preguntas sobre ellos, un flujo habitual en soporte de ingeniería.
- Agentes de automatización de tareas de desarrollo: el soporte del rol de desarrollador y las mejoras en el parseo de objetos anidados en tool calling permiten conectarlo a herramientas de ejecución de comandos, edición de ficheros y control de versiones dentro de pipelines agénticos.
- Revisión y generación de código en producción: puede integrarse en flujos de integración continua para generar parches, revisar diffs o producir tests, con la ventaja de que el formato GGUF permite desplegarlo en infraestructura propia sin dependencia de API externa.
- Procesamiento de vídeo a escala horaria: la comprensión de vídeo declarada hasta una hora permite resumir reuniones, extraer acciones pendientes o indexar contenido audiovisual, siempre que el presupuesto de VRAM permita sostener el contexto visual.
- Asistente de investigación con contexto largo: para revisión bibliográfica donde se cargan múltiples artículos completos en la ventana de contexto y se pide síntesis comparativa, con el modo thinking activado para razonamiento profundo.
- Despliegue en edge o estaciones de trabajo locales: mediante cuantizaciones agresivas (Q3_K_M o Q2_K) el modelo puede ejecutarse en una única GPU de consumo, lo que habilita prototipos de asistentes privados donde los datos no pueden salir de la organización.
- Extracción estructurada de información: con el modo no-thinking y los parámetros de muestreo recomendados para instrucciones, resulta adecuado para tareas de parsing de documentos, clasificación y generación de JSON estructurado a escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K ni de ninguna otra evaluación estándar, ni para el modelo base ni para las cuantizaciones de este repositorio.

La única afirmación cuantitativa presente es la de Unsloth, que sostiene que Unsloth Dynamic 3.0 logra más de un 10 % de mejor precisión top-1 % al mismo tamaño frente a otros proveedores de GGUF. Se trata de una comparación entre metodologías de cuantización, no de un benchmark de capacidades del modelo, y no va acompañada de cifras absolutas ni de la metodología de evaluación en la información proporcionada.

## Requisitos de hardware

Las cifras de peso y VRAM que siguen son estimaciones derivadas del recuento de parámetros (27,3 B) y no proceden de mediciones publicadas por el autor. Los nombres exactos y el número de variantes GGUF del repositorio no están detallados en la información disponible, y los 472,1 GB del espacio incluyen el conjunto completo de variantes.

| Variante estimada | Peso aproximado | VRAM mínima estimada | GPU de ejemplo |
|---|---|---|---|
| Q8_0 | ≈29 GB | 34-40 GB | A100 40 GB, 2 × RTX 4090 |
| Q6_K | ≈22,5 GB | 27-32 GB | RTX 6000 Ada, L40S |
| Q5_K_M | ≈19,5 GB | 24-28 GB | RTX 4090 24 GB (al límite), A6000 |
| Q4_K_M | ≈16,5 GB | 20-24 GB | RTX 4090, RTX 3090 |
| Q3_K_M | ≈13,5 GB | 16-20 GB | RTX 4080, RTX 4070 Ti |
| Q2_K | ≈10 GB | 12-14 GB | RTX 3060 12 GB, RTX 4070 |

- Caché KV: solo 16 de las 64 capas emplean Gated Attention con caché KV (4 cabezas KV de dimensión 256). En FP16 esto equivale a unos 64 KB por token, es decir, aproximadamente 16 GB adicionales si se llena la ventana completa de 262.144 tokens. Las capas Gated DeltaNet mantienen estado recurrente de tamaño constante, por lo que no escalan con la longitud de contexto.
- El codificador de visión añade consumo de VRAM adicional no contemplado en los cálculos anteriores, proporcional a la resolución y duración del contenido visual procesado.
- Cabe en GPU de consumo: sí, en variantes Q4_K_M o inferiores sobre RTX 3090, RTX 4090 (24 GB) y, en Q2_K o Q3_K_M, sobre GPUs de 12-16 GB. Con cuantizaciones altas y contexto largo es necesario repartir el modelo entre varias GPUs.
- Opciones de despliegue: llama.cpp, Ollama, LM Studio y Unsloth Desktop para ejecución local; servidores compatibles con GGUF para despliegue en servicio; la etiqueta `endpoints_compatible` indica compatibilidad con endpoints de inferencia de Hugging Face. vLLM dispone de soporte GGUF experimental, sujeto a la versión.
- La descarga del repositorio completo (472,1 GB) es inviable en la mayoría de entornos: conviene descargar únicamente el fichero de la variante deseada.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo hasta el primer token para ninguna configuración de hardware.

## Comparativa con modelos similares

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos comparables en la información proporcionada, por lo que la comparación se limita a los dos elementos conocidos.

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| VocaborSilentii/Qwen3.8-27B-GGUF (este repositorio) | 27,3 B | 262.144 (ext. 1 M) | Apache 2.0 | GGUF | Público en Hugging Face; 0 descargas |
| Qwen/Qwen3.8-27B (modelo base) | 27,3 B | 262.144 (ext. 1 M) | Apache 2.0 | No disponible | Público en Hugging Face |
| Qwen3.5 / Qwen3.6 (generaciones anteriores citadas en la model card) | No disponible | No disponible | No disponible | No disponible | No disponible |
| Otros proveedores de GGUF para Qwen3.8 (citados por Unsloth sin nombrarlos) | No disponible | No disponible | No disponible | GGUF | No disponible |

Elemento diferencial de este repositorio frente a otras cuantizaciones del mismo modelo: el uso de Unsloth Dynamic 3.0, cuya ventaja declarada es de más de un 10 % en precisión top-1 % al mismo tamaño, afirmación no verificable de forma independiente con la información disponible.

## Limitaciones y advertencias

- Publicación de terceros sin validación comunitaria: cero descargas y cero valoraciones en la fecha de creación. No hay evidencia de que las cuantizaciones hayan sido verificadas por otros usuarios.
- El autor del repositorio no es Qwen: se trata de una recuantización no oficial del modelo base, con el riesgo de configuración que ello implica (parámetros de tokenizador, plantilla de chat o metadatos incorrectos).
- La model card no detalla qué niveles de cuantización se incluyen ni sus tamaños individuales dentro de los 472,1 GB del repositorio, lo que dificulta la descarga selectiva y la verificación de integridad.
- La afirmación de mejora superior al 10 % en precisión top-1 % proviene de Unsloth, que es a la vez desarrollador de la metodología y parte interesada en el resultado. No se aportan cifras absolutas ni metodología de evaluación.
- Toda cuantización introduce pérdida de precisión respecto a los pesos originales. El impacto concreto en tareas de razonamiento o de visión no está cuantificado en la información disponible.
- Idiomas soportados no declarados: no hay confirmación documental de cobertura multilingüe ni del comportamiento en castellano.
- Riesgo de alucinación inherente a los modelos de lenguaje generativos. Al no existir benchmarks publicados, no hay medición de tasa de error ni de fiabilidad factual.
- El modo thinking está activado por defecto, lo que incrementa el consumo de tokens de salida, la latencia y el coste por consulta si no se desactiva explícitamente.
- Los parámetros de muestreo recomendados difieren entre modo thinking y modo instruct. Usar valores distintos puede provocar repeticiones sin fin; la propia model card advierte de que elevar `presence_penalty` puede causar mezcla de idiomas y una ligera pérdida de rendimiento.
- El contexto extensible hasta 1.000.000 de tokens requiere técnicas de escalado posicional y grandes cantidades de memoria; es previsible degradación del rendimiento en longitudes muy superiores a la ventana nativa, aunque no se aportan datos al respecto.
- El codificador de visión incrementa de forma significativa los requisitos de VRAM cuando se procesan imágenes o vídeos, especialmente en vídeos de larga duración.
- Licencia Apache 2.0, tanto en el repositorio como en el modelo base según la información disponible: permite uso comercial y modificación, siempre que se conserven los avisos de licencia y atribución correspondientes.
- Uso en producción: la ausencia de benchmarks, de mediciones de latencia y de historial de descargas hace recomendable una evaluación propia sobre el caso de uso concreto antes de desplegar el modelo.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VocaborSilentii/Qwen3.8-27B-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Guía de ejecución de Qwen3.8-27B (Unsloth): https://unsloth.ai/docs/models/qwen3.8
- Documentación de Unsloth Dynamic 3.0 GGUF: https://unsloth.ai/docs/basics/dynamic-3.0-ggufs
- Repositorio de Unsloth en GitHub: https://github.com/unslothai/unsloth/
- Unsloth Desktop: https://unsloth.ai/docs/new/desktop
- Sitio de Unsloth: https://unsloth.ai
- Comunidad de Unsloth en Discord: https://discord.gg/unsloth
