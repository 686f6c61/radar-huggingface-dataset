# yukiworks/Qwen3.8-27B-heretic-NSFW

## Resumen

Qwen3.8-27B-heretic-NSFW es una variante "decensurada" del modelo Qwen/Qwen3.8-27B, publicada por el usuario yukiworks. Se trata de un modelo denso de 27.356.728.560 parámetros (unos 27,4 mil millones) de tipo vision-language, construido sobre la arquitectura Qwen3.5 con atención híbrida (Gated DeltaNet lineal combinada con Gated Attention). El modelo original resuelve tareas de codigo, trabajo profesional, investigacion y agentes de largo horizonte, ademas de comprension nativa de imagen y video.

La modificacion consiste en la aplicacion de Heretic v2.2.0.dev0, una tecnica de ablacion de direcciones en el espacio de activaciones que elimina el comportamiento de rechazo sin reentrenar los pesos. A diferencia de otras variantes heretic, el autor utilizo un conjunto de prompts propio centrado en contenido adulto/NSFW para guiar la optimizacion, de modo que la supresion de rechazos esta ajustada a ese dominio concreto. Segun la model card, los rechazos medidos con clasificador bajan de 88/100 en el modelo base a 2/100 en esta variante.

Es relevante para desarrolladores e investigadores que necesiten un modelo multimodal de ~27B con contexto muy largo (262.144 tokens nativos, extensible a 1.000.000) y sin las restricciones de contenido del modelo original, con licencia Apache 2.0. El coste de la ablacion es una divergencia KL de 0,0770 respecto al base, lo que implica cierta degradacion en la distribucion de salida que conviene tener en cuenta en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Causal Language Model con vision encoder; layout hibrido 16 × (3 × (Gated DeltaNet → FFN) → 1 × (Gated Attention → FFN)) |
| Parametros totales | 27.356.728.560 (~27,4B) |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | 262.144 tokens nativos, extensible hasta 1.000.000 |
| Tipos de cuantizacion | no disponible en la informacion proporcionada |
| Idiomas soportados | no disponibles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura de Qwen3.8-27B: un transformer causal con encoder de vision, dimension oculta de 5120, 64 capas y embedding de tokens de 248.320 (con padding). El bloque se repite en un patron de 16 grupos, cada uno con tres subcapas de Gated DeltaNet (atención lineal con 48 cabezas para V y 16 para QK, dimension de cabeza 128) seguidas de una subcapa de Gated Attention (24 cabezas para Q y 4 para KV, dimension de cabeza 256, RoPE de 64 dimensiones). La FFN tiene dimension intermedia de 17.408. Incorpora Multi-Token Prediction (MTP) entrenado con multiples pasos, lo que habilita decodificacion especulativa nativa.

El entrenamiento del modelo base incluye fases de pre-entrenamiento y post-entrenamiento, pero la model card no detalla el numero de tokens, la composicion del dataset ni si se aplico RLHF o DPO. La modificacion heretic es un metodo sin entrenamiento: aplica una ablacion de rango arbitrario (ARA) sobre las activaciones de las capas 31 a 57, con pesos de preservacion de comportamiento bueno de 0,6827, de direccion de comportamiento malo de 0,0180, de sobrecorreccion relativa de 0,9674 y neighbor_count de 6. Los prompts que guian la optimizacion fueron recopilados manualmente por el autor con foco en contenido adulto.

## Capacidades

- Generacion de texto y razonamiento con modo "thinking" activado por defecto, desactivable por peticion y ajustable mediante `reasoning_effort`.
- Retencion del contexto de razonamiento en el historial de mensajes mediante `preserve_thinking`.
- Comprension nativa de imagen y video, incluyendo diagramas STEM, documentos y videos de hasta una hora.
- Generacion de codigo y tareas de trabajo profesional (analisis, redaccion tecnica, investigacion).
- Ejecucion de agentes autonomos y tareas de largo horizonte con manejo de retroalimentacion del entorno.
- Soporte de tool calling / function calling y de harnesses de desarrollo populares (segun la model card del base).
- Capacidades multilingues: la model card no especifica la lista de idiomas.
- Contenido adulto explicito sin rechazos, gracias a la ablacion heretic (2/100 rechazos medidos).

## Casos de uso

- Generacion de ficcion adulta: el modelo mantiene coherencia narrativa en conversaciones multi-turno largas gracias a su ventana de 262.144 tokens, sin los rechazos del modelo base, lo que lo hace adecuado para escritura creativa explicita.
- Analisis de documentos extensos con imagenes: al ser vision-language, puede procesar informes, diagramas y capturas combinados con texto en una sola ventana de contexto, util para auditoria documental o extraccion de datos.
- Agentes de automatizacion de back-office: con tool calling y planificacion autonoma, puede encadenar pasos (consulta de APIs, lectura de ficheros, generacion de resumenes) en pipelines de operaciones internas.
- Asistente de codigo en IDE: el modelo base esta optimizado para codigo y soporta harnesses de desarrollo; la variante heretic conserva esas capacidades y elimina restricciones de contenido que pueden interferir en tareas de seguridad ofensiva o analisis de exploits.
- Investigacion sobre alineacion y seguridad: permite estudiar el efecto de la ablacion ARA comparando respuestas con el modelo base, con la divergencia KL de 0,0770 como metrica de deriva.
- Procesamiento de video de vigilancia o analisis de contenido: la comprension de video de hasta una hora y la ausencia de filtros de contenido facilitan tareas de anotacion o descripcion de material sensible.
- Despliegue en infraestructura propia: al ser Apache 2.0 y compatible con vLLM, SGLang y TokenSpeed, puede servirse en clusteres internos sin dependencia de APIs externas.

## Benchmarks y rendimiento

| Metrica | Este modelo | Qwen/Qwen3.8-27B (base) |
|---|---|---|
| Rechazos (clasificador) | 2/100 | 88/100 |
| Divergencia KL | 0,0770 | 0 (por definicion) |

No se han publicado resultados de benchmarks de tareas (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. La model card del base menciona mejoras en codigo, trabajo profesional, investigacion y agentes, pero sin cifras.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 55 GB solo para pesos, mas overhead de KV cache y activaciones; se recomienda al menos 80 GB para contexto corto.
- VRAM en cuantizacion de 8 bits: entorno a 28-30 GB, viable en una RTX 6000 Ada o A100 40 GB con contexto limitado.
- VRAM en cuantizacion de 4 bits: entorno a 15-18 GB, potencialmente ejecutable en RTX 4090 (24 GB) con ventanas de contexto reducidas.
- GPU recomendadas: H100 80 GB o A100 80 GB para BF16 y contexto largo; L40S o RTX 6000 Ada para 8 bits; RTX 4090 para 4 bits.
- Opciones de despliegue: transformers (libreria declarada), vLLM, SGLang y TokenSpeed segun la model card del base.
- Latencia y throughput: no disponibles en la informacion proporcionada. El uso de MTP puede mejorar el throughput mediante decodificacion especulativa, pero no se aportan cifras.
- El tamano del repositorio es de 54,7 GB, coherente con pesos en BF16.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| yukiworks/Qwen3.8-27B-heretic-NSFW | ~27,4B | 262.144 (ext. 1M) | Apache 2.0 | Vision-language, sin rechazos NSFW, KL 0,0770 |
| Qwen/Qwen3.8-27B | ~27,4B | 262.144 (ext. 1M) | Apache 2.0 | Modelo base, 88/100 rechazos, vision-language |
| Otras variantes heretic de Qwen | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

No se dispone de informacion sobre modelos comparables de otros fabricantes con caracteristicas equivalentes en la documentacion consultada.

## Limitaciones y advertencias

- La ablacion ARA introduce una divergencia KL de 0,0770 respecto al base, lo que puede degradar sutilmente la calidad en tareas generales (razonamiento, codigo) no relacionadas con el contenido NSFW.
- El modelo esta marcado como "not-for-all-audiences"; su uso esta pensado para contenido adulto y puede generar material explicito no apto para todos los publicos.
- Riesgo de alucinacion inherente a los modelos de ~27B, no mitigado por la modificacion heretic.
- La eliminacion de rechazos puede facilitar la generacion de contenido danino si no se aplican filtros externos; se recomienda moderacion en produccion.
- No se especifican los idiomas soportados ni la composicion del dataset de entrenamiento, lo que dificulta evaluar sesgos linguisticos y culturales.
- La licencia Apache 2.0 permite uso comercial, pero el contenido generado puede infringir normativas locales sobre material adulto; la responsabilidad recae en el desplegador.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, por lo que no hay evidencia de comunidad ni validacion independiente.
- No se han publicado benchmarks de tareas estandar, por lo que el rendimiento real en codigo, matematicas o agentes no esta verificado de forma independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yukiworks/Qwen3.8-27B-heretic-NSFW
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Proyecto Heretic: https://heretic-project.org
- Qwen Cloud (servicio gestionado del base): https://www.qwencloud.com
- Overview de Qwen3.8-27B: https://www.qwencloud.com/models/qwen3.8-27b
