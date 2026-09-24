# Trapppptyr/XORTRON-RICO-v3

## Resumen

XORTRON-RICO-v3 es un modelo de lenguaje de aproximadamente 27.781 millones de parámetros (27,78 B) publicado en HuggingFace por el usuario Trapppptyr. Se trata de un merge lineal (fusión de pesos) construido con mergekit a partir de dos derivados finetuneados sobre datos SFT del proyecto XORTRON: darkc0de/RICO (a su vez un finetune de orcarouter/Qwen3.8-27B-Uncensored) y darkc0de/RICO-v2 (finetune de DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU). Por tanto, no es un modelo entrenado desde cero, sino una composición de pesos de la familia Qwen (etiqueta qwen3_5) orientada explícitamente a eliminar comportamientos de rechazo.

El modelo se presenta como parte del proyecto "The XORTRON Criminal Computing project", descrito por su propio autor como un experimento de investigación sobre seguridad y alineamiento de IA. La model card incluye un "XORTRON Restricted Access & Authorized-Use Agreement" que limita el acceso a perfiles profesionales concretos (investigación en seguridad, red teaming, ámbito legal, fuerzas de seguridad, periodismo, política pública) y prohíbe su uso para facilitar actividad delictiva real. Los propios tags del repositorio incluyen términos como uncensored, harmful, toxic, abliterated, heretic y not-for-all-audiences.

Su relevancia actual es fundamentalmente metodológica y de seguridad: sirve como objeto de estudio de los límites de la alineación, de las técnicas de abliteration y de la evaluación de riesgos de "criminal enablement". No es un modelo apto para uso general, comercial o de producción convencional. El repositorio no declara licencia estándar, no publica idiomas soportados ni datos de benchmarks cuantitativos, y en el momento de redactar esta ficha acumula 0 descargas y 0 "likes", por lo que carece de validación externa alguna.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder de la familia Qwen (etiqueta qwen3_5 en el repositorio); detalles de atención y capas no disponibles |
| Parametros totales | 27.781.427.952 (~27,78 B) |
| Parametros activos | no disponible (no se declara que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos safetensors en precisión completa (55,6 GB de repo para 27,78 B de parámetros, coherente con ~16 bits por parámetro). No se han publicado GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible (la familia base Qwen suele ser multilingüe, pero la model card no documenta idiomas) |
| Licencia | no disponible en los metadatos de HuggingFace; el autor publica un acuerdo de acceso restringido y uso autorizado de carácter propio, no una licencia OSI |
| Formato de pesos | safetensors |
| Pipeline declarado | image-text-to-text (entrada de imagen y texto) |
| Libreria | transformers |
| Tamano del repositorio | 55,6 GB |
| Tipo de modelo | merge lineal de pesos (mergekit) |
| Modos de inferencia | "Thinking" e "Instruct" (dos configuraciones de muestreo) |
| Fecha de creacion | 2026-09-24 (según metadatos del repositorio) |

Ajustes de muestreo recomendados por el autor:

| Modo | Parametros |
|---|---|
| Thinking | temperature=1.0, top_p=0.95, top_k=20, min_p=0.0, presence_penalty=0.0, repetition_penalty=1.0 |
| Instruct | temperature=0.7, top_p=0.80, top_k=20, min_p=0.0, presence_penalty=1.5, repetition_penalty=1.0 |

## Arquitectura y entrenamiento

La arquitectura subyacente es un transformer decoder de la familia Qwen, con 27,78 B de parámetros en precisión de 16 bits. No se publica información sobre número de capas, cabezas de atención, tipo de atención (completa o lineal), uso de MoE ni tamaño de vocabulario. El pipeline declarado es image-text-to-text, lo que sugiere soporte de entrada multimodal de imagen, aunque la model card no documenta ningún codificador visual ni resolución de imagen.

No hay entrenamiento desde cero: XORTRON-RICO-v3 es un merge lineal de dos modelos. El primero, darkc0de/RICO, es un finetune de orcarouter/Qwen3.8-27B-Uncensored sobre datos SFT del proyecto XORTRON. El segundo, darkc0de/RICO-v2, es un finetune de DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU sobre los mismos datos SFT de XORTRON. La composición exacta del dataset SFT (número de tokens, proporción de dominios, metodología de anotación) no está disponible. Tampoco se documenta si hubo RLHF, DPO u otra fase de alineación; el vocabulario del repositorio (abliterated, heretic, uncensored) apunta a lo contrario, es decir, a la supresión deliberada de los comportamientos de rechazo aprendidos en los modelos base.

La innovación declarada no es arquitectónica sino de evaluación: el autor afirma que el modelo ha obtenido "la puntuación CEA-100 (Criminal Enablement Assessment) más alta de cualquier modelo Qwen 3.8 27B que haya probado". No se publica la metodología del CEA-100, ni la puntuación obtenida, ni el conjunto de modelos comparados, por lo que la afirmación no es verificable con la información disponible.

## Capacidades

- Generación de texto conversacional multi-turno (tag conversational).
- Dos modos de operación declarados: "Thinking", con muestreo más exploratorio (temperature 1.0, top_p 0.95), e "Instruct", con muestreo más determinista y penalización de presencia (temperature 0.7, top_p 0.80, presence_penalty 1.5).
- Respuesta a peticiones que los modelos alineados convencionales rechazarían: el modelo está explícitamente etiquetado como uncensored, abliterated, heretic y not-for-all-audiences, lo que implica ausencia de mecanismos de rechazo entrenados.
- Entrada multimodal de imagen y texto según el pipeline declarado (image-text-to-text); sin documentación adicional sobre resolución, número de imágenes o calidad del grounding visual.
- Soporte de tool calling / function calling: no disponible.
- Capacidades de agente y razonamiento multi-paso: no disponibles.
- Capacidades multilingües: no disponibles (sin listado de idiomas en la model card).
- Capacidades específicas de código, matemáticas o razonamiento formal: no documentadas.
- Modo "thinking" con cadena de razonamiento explícita: inferido del ajuste de muestreo "Thinking" declarado por el autor, sin documentación técnica adicional.

## Casos de uso

- Red teaming y evaluación de seguridad de IA: el modelo se puede utilizar como sujeto de prueba para medir hasta qué punto una técnica de abliteration y un merge de pesos eliminan los rechazos, generando conjuntos de prompts maliciosos y anotando la tasa de cumplimiento.
- Investigación en alineamiento y abliteration: permite estudiar empíricamente qué capacidades y qué salvaguardas se degradan al fusionar dos finetunes sobre datos SFT sin alineación, comparando con los modelos base sin fusionar.
- Construcción de datasets de moderación de contenido: sus salidas tóxicas y potencialmente dañinas pueden usarse como ejemplos negativos etiquetados para entrenar clasificadores de moderación, siempre bajo supervisión humana y en un entorno aislado.
- Inteligencia de amenazas y análisis de abuso de IA: investigadores de seguridad pueden caracterizar el tipo de contenido operativo que un modelo de este tipo llega a producir, alimentando informes de riesgo como los citados por el propio autor (Trend Micro, TRM Labs).
- Análisis forense y criminalística digital: estudio de artefactos generados por IA en investigaciones, con el modelo como fuente controlada de muestras sintéticas de texto malicioso en un laboratorio aislado.
- Asesoramiento sobre política tecnológica y regulación: evaluación del estado del arte en modelos sin salvaguardas para fundamentar propuestas regulatorias, auditorías de cumplimiento y análisis de impacto normativo.
- Educación y formación en seguridad: uso en cursos de seguridad de IA y ética para demostrar de forma controlada los fallos de alineación, con acceso restringido y supervisión.
- Investigación en evaluación comparativa: generación de protocolos de evaluación reproducibles (por ejemplo, replicar el CEA-100 con metodología transparente) que puedan aplicarse a otras familias de modelos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única afirmación de rendimiento es cualitativa: el autor sostiene que el modelo alcanza la puntuación más alta del CEA-100 (Criminal Enablement Assessment) entre los modelos Qwen 3.8 27B que ha probado, sin publicar la puntuación, la metodología ni la lista de comparación. No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra suite estándar, ni comparaciones numéricas con modelos similares.

| Benchmark | Resultado | Notas |
|---|---|---|
| CEA-100 (Criminal Enablement Assessment) | no disponible (solo afirmación cualitativa del autor) | Métrica propia sin metodología publicada |
| MMLU | no disponible | No publicado |
| HumanEval | no disponible | No publicado |
| GSM8K | no disponible | No publicado |
| Otras suites estándar | no disponible | No publicado |

## Requisitos de hardware

Estimaciones derivadas del recuento de parámetros (27,78 B) y del tamaño del repositorio (55,6 GB). No son cifras publicadas por el autor.

- VRAM para inferencia en FP16/BF16: aproximadamente 55,6 GB solo de pesos, más caché KV; se recomienda un mínimo de 64-80 GB de VRAM.
- VRAM para inferencia en INT8: aproximadamente 28-32 GB de pesos, con 32-40 GB de VRAM totales recomendados.
- VRAM para inferencia en INT4 (GPTQ/AWQ/GGUF Q4): aproximadamente 14-16 GB de pesos, manejable en GPUs de 24 GB con contexto moderado.
- GPUs de centro de datos recomendadas: H100 80 GB o A100 80 GB para FP16/BF16; A100 40 GB o L40S 48 GB para INT8; multi-GPU con tensor parallelism (2x RTX 4090 24 GB o 2x A6000 48 GB) para FP16.
- GPUs de consumo: cabe en RTX 4090, RTX 3090 y RTX 4080 (16 GB) únicamente con cuantización de 4 bits; en 8 bits no entra en 24 GB con contexto amplio.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (etiqueta del repositorio) y vLLM con tensor parallelism. llama.cpp y Ollama requerirían convertir los pesos a GGUF, ya que no se publica ninguna cuantización GGUF. La etiqueta unsloth sugiere compatibilidad con flujos de fine-tuning de Unsloth.
- Latencia y throughput: no disponibles; no se han publicado mediciones de tokens por segundo ni de latencia por petición.
- Requisito de almacenamiento: 55,6 GB para el repositorio completo en safetensors.

## Comparativa con modelos similares

No hay datos públicos de benchmarks ni de especificaciones de los modelos comparables, por lo que la comparación se limita a la relación de linaje y a los datos disponibles de cada repositorio.

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| XORTRON-RICO-v3 | Merge lineal de los dos modelos RICO | 27,78 B | no disponible | Acuerdo de acceso restringido propio (no es licencia OSI) | safetensors, 55,6 GB, 0 descargas |
| darkc0de/RICO | Base del merge; finetune de orcarouter/Qwen3.8-27B-Uncensored sobre datos SFT XORTRON | no disponible | no disponible | no disponible | no disponible |
| darkc0de/RICO-v2 | Base del merge; finetune de DavidAU/Qwen3.8-27B-...-Heretic-Uncensored-NM-DAU sobre datos SFT XORTRON | no disponible | no disponible | no disponible | no disponible |
| DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU | Base de RICO-v2; modelo heretic/uncensored | no disponible | no disponible | no disponible | no disponible |
| orcarouter/Qwen3.8-27B-Uncensored | Base de RICO; modelo uncensored | no disponible | no disponible | no disponible | no disponible |

Respecto a modelos alineados de tamaño comparable (por ejemplo, las variantes instruct de la familia Qwen de ~27-32 B), la diferencia principal es la ausencia deliberada de salvaguardas y de documentación de rendimiento: no se dispone de datos de benchmarks de XORTRON-RICO-v3 que permitan establecer una comparación cuantitativa de calidad.

## Limitaciones y advertencias

- Modelo diseñado para producir contenido dañino o potencialmente delictivo: los propios tags incluyen harmful, toxic, uncensored, abliterated y not-for-all-audiences. No debe desplegarse de cara al público ni integrarse en productos de consumo.
- Riesgo alto de alucinación, especialmente en dominios sensibles: la model card advierte explícitamente de que las salidas pueden ser inexactas, incompletas, engañosas, ofensivas, peligrosas o legalmente incorrectas, y que no deben tratarse como asesoramiento profesional.
- Sesgos: no documentados por el autor. Los merges de finetunes sobre datos SFT no auditados tienden a heredar y amplificar sesgos de los modelos base y del dataset, pero no hay evaluación publicada.
- Idiomas: sin listado de idiomas soportados; el comportamiento fuera del inglés no está garantizado ni evaluado.
- Contexto: longitud de contexto no declarada; no hay garantía de estabilidad en conversaciones largas.
- Licencia: no hay licencia estándar publicada. El autor impone un acuerdo de acceso restringido con certificación de elegibilidad (ámbito legal, investigación en seguridad, fuerzas de seguridad, periodismo, política pública) y prohíbe el uso para facilitar actividad delictiva real o ceder el modelo a terceros con ese fin. El marco legal aplicable a su uso comercial no está definido.
- Cumplimiento normativo: el uso de un modelo sin salvaguardas puede entrar en conflicto con la normativa europea de IA, con las políticas de uso aceptable de proveedores cloud y con las condiciones de servicio de plataformas de despliegue.
- Validación externa nula: 0 descargas, 0 likes y sin resultados reproducibles publicados. El único mérito citado (CEA-100) es una métrica del propio autor sin metodología pública.
- Duplicidad de la model card: el texto del README parece heredado del proyecto RICO aguas arriba, mientras que el repositorio lo publica otra cuenta, lo que dificulta atribuir responsabilidad sobre el contenido y el mantenimiento.
- Sin cuantizaciones publicadas: no hay GGUF, GPTQ ni AWQ oficiales; cualquier cuantización de terceros no está verificada.
- Multimodalidad declarada pero no documentada: el pipeline image-text-to-text figura en los metadatos, pero no se especifica resolución, número de imágenes soportadas ni comportamiento con entradas visuales.
- Restricción de uso en producción: dado el perfil del modelo, no se recomienda su uso en entornos de producción, atención al cliente, generación de código o cualquier flujo con usuarios finales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Trapppptyr/XORTRON-RICO-v3
- Modelo base darkc0de/RICO: https://huggingface.co/darkc0de/RICO
- Modelo base darkc0de/RICO-v2: https://huggingface.co/darkc0de/RICO-v2
- Modelo base DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU: https://huggingface.co/DavidAU/Qwen3.8-27B-TURBO-Fable-Cold-Fusion-735-882-Heretic-Uncensored-NM-DAU
- Modelo base orcarouter/Qwen3.8-27B-Uncensored: https://huggingface.co/orcarouter/Qwen3.8-27B-Uncensored
- Trend Micro Research, Malicious Uses and Abuses of Artificial Intelligence: https://documents.trendmicro.com/assets/white_papers/wp-malicious-uses-and-abuses-of-artificial-intelligence.pdf
- TRM Labs, The Rise of AI-Enabled Crime: https://www.trmlabs.com/resources/blog/the-rise-of-ai-enabled-crime-exploring-the-evolution-risks-and-responses-to-ai-powered-criminal-enterprises
- American Military University, AI-Enabled Crime: https://www.amu.apus.edu/area-of-study/criminal-justice/resources/ai-enabled-crime/
- United States Congress, 119th Congress Hearing Record: https://www.congress.gov/119/chrg/CHRG-119hhrg61182/CHRG-119hhrg61182.pdf
