# ZeeoRe/jev-multimodal-qwen3.5-4b-GGUF

## Resumen

JEV Multimodal Qwen3.5-4B GGUF es la conversión al formato GGUF del checkpoint nativo fusionado `ZeeoRe/jev-multimodal-qwen3.5-4b`, un modelo multimodal de 4.207.724.037 parámetros construido sobre una base Qwen3.5 de 4B. Lo desarrolla el usuario ZeeoRe y se distribuye con licencia Apache 2.0. No es un modelo conversacional al uso: se presenta como un "modelo de decisión" (decision model) orientado a toma de decisiones tipadas sobre texto, imagen y vídeo visual, con cabezas de decisión específicas que no expone un cargador GGUF estándar.

La relevancia de esta ficha radica en que el artefacto no funciona con llama.cpp convencional ni con un endpoint de chat al uso: requiere el runtime específico `llama.cpp-jev`, que implementa las cabezas de decisión. El repositorio incluye varias cuantizaciones (BF16, Q8, Q4, Q3, mezclas calibradas IQ2/IQ3 y un experimento extremo Q1) con métricas de precisión medidas por el autor, lo que permite evaluar el compromiso entre tamaño y exactitud antes de desplegar.

El modelo está etiquetado como "system-1", lo que sugiere un enfoque de decisión rápida y reactiva más que de razonamiento multi-paso deliberativo. Los idiomas declarados son inglés y chino. El tamaño del repositorio es de 48,6 GB, aunque cada archivo individual de cuantización ocupa entre 0,624 GiB (Q1) y 4,811 GiB (Q8_0).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (base Qwen3.5-4B) con cabezas de decisión personalizadas; detalles completos no disponibles |
| Parametros totales | 4.207.724.037 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (las evaluaciones del autor usan contexto 2.048) |
| Tipos de cuantizacion | BF16, Q8_0, Q4_K_M (cabezas FP32 y cabezas Q8_0), Q4_0, Q3_K_M, SSM8-IQ3_XXS, IQ2_XS-SSM4, Q1_0 (experimento extremo) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama_cpp); proyector multimodal en `mmproj-Q4_0.gguf` |

## Arquitectura y entrenamiento

La información disponible indica que se trata de una conversión GGUF de un checkpoint nativo fusionado basado en Qwen3.5-4B, con soporte multimodal para texto, imagen y vídeo (vídeo visual únicamente, sin audio). El modelo incorpora cabezas de decisión específicas que producen "decisiones tipadas" y cajas delimitadoras (box grounding), lo que explica que un cargador GGUF estándar no las exponga. La model card menciona además una variante "SSM8" en una de las cuantizaciones, lo que sugiere componentes de tipo state space en parte de la arquitectura, aunque no se detalla su función.

En cuanto al entrenamiento, el autor describe un proceso de destilación de profesor (teacher distillation) con cohortes de 744 y 10.496 filas, aplicado sobre los pesos cuantizados para preservar el backbone original, el emparejamiento visual, los formatos de cabeza y el tamaño total. No se especifica el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. Las métricas publicadas se obtuvieron sobre 900 decisiones y 128 entradas positivas de caja única, con contexto 2.048 y cuatro fotogramas de vídeo silenciosos, y el autor advierte explícitamente que son comprobaciones de desarrollo reutilizadas, no un benchmark ciego nuevo.

## Capacidades

- Toma de decisiones tipadas sobre texto, imagen y vídeo visual (visual-only), con salidas estructuradas propias del runtime `llama.cpp-jev`.
- Grounding visual: detección de caja única con métrica Acc@IoU≥0.5 reportada por el autor.
- Procesamiento de vídeo mediante fotogramas (las evaluaciones usan cuatro fotogramas silenciosos).
- Modo de decisión "system-1": respuestas rápidas y reactivas, sin cadena de razonamiento deliberativa documentada.
- Soporte multilingüe limitado a inglés y chino.
- No se documenta soporte de tool calling ni de function calling en el sentido de APIs conversacionales estándar.
- No se documenta soporte de agentes multi-paso ni modo "thinking".
- No se documenta soporte de audio.

## Casos de uso

- Moderación y clasificación visual automatizada: el modelo puede emitir decisiones tipadas sobre imágenes con cajas de localización, útil para pipelines de revisión de contenido donde se necesita señalar la región relevante además de la etiqueta.
- Inspección de vídeo en entornos embebidos: con la cuantización IQ2_XS-SSM4 (1,840 GiB) y cuatro fotogramas por muestra, encaja en dispositivos con poca memoria para tareas de decisión sobre secuencias cortas de vídeo.
- Grounding en interfaces de usuario: la salida de caja única permite localizar elementos en capturas de pantalla, lo que sirve para automatización de pruebas o asistentes de accesibilidad que necesitan referenciar regiones concretas.
- Clasificación de documentos escaneados bilingües (en/zh): el soporte de imagen y de ambos idiomas permite decidir categorías sobre formularios o tickets sin pipeline OCR separado.
- Robótica y sistemas reactivos de baja latencia: el enfoque "system-1" y los tamaños reducidos (Q3_K_M de 2,489 GiB, Q4_K_M de 2,902 GiB) son adecuados para bucles de decisión donde prima la latencia sobre el razonamiento profundo.
- Evaluación comparativa de cuantizaciones en investigación: el repositorio publica métricas por configuración (exactitud de decisión, Acc@IoU, NLL) con parches reproducibles, lo que permite estudiar el impacto de la cuantización en cabezas de decisión multimodales.
- Despliegue en hardware de consumo con validación previa: la tabla del autor permite elegir entre Q8_0 (78,22% H) y IQ2_XS-SSM4 (75,92% H con runtime corregido) según la memoria disponible, con una penalización de exactitud cuantificada.

## Benchmarks y rendimiento

El autor publica métricas propias de decisión y grounding, no benchmarks estándar de NLP (no hay MMLU, HumanEval ni GSM8K). Se reproducen a continuación las cifras de la model card.

| Configuracion | Filas de entrenamiento | Tamano (GiB) | H (runtime previo) | Exactitud de decision | Box Acc@IoU>=0.5 | NLL |
|---|---:|---:|---:|---:|---:|---:|
| Q8_0 | 10.496 | 4,811 | 78,22% | 82,67% | 74,22% | 0,42528 |
| Q4_K_M (cabezas FP32) | 10.496 | 2,902 | 77,53% | 82,11% | 73,44% | 0,43613 |
| Q4_K_M (cabezas Q8_0) | 10.496 | 2,897 | 77,19% | 82,33% | 72,66% | 0,43957 |
| Q4_0 | 10.496 | 2,718 | 77,13% | 83,22% | 71,88% | 0,44634 |
| Q3_K_M | 744 | 2,489 | 75,77% | 81,11% | 71,09% | 0,45956 |
| SSM8-IQ3_XXS | 10.496 | 2,150 | 72,85% | 80,67% | 66,41% | 0,47942 |
| IQ2_XS-SSM4 | 744 | 1,840 | 75,58% | 80,67% | 71,09% | 0,51264 |
| Q1_0 (extremo) | 744 | 0,624 | 2,98% | 31,89% | 1,56% | 1,47375 |

Tras la corrección del runtime (2026-11-25), solo dos configuraciones tienen reevaluación completa con el mismo conjunto de pesos:

| Configuracion | Exactitud de decision (antes -> despues) | Box Acc@IoU>=0.5 | H (antes -> despues) | Entradas validas (antes -> despues) | NLL (900 decisiones) |
|---|---:|---:|---:|---:|---:|
| Q4_K_M (cabezas FP32) | 82,11% -> 82,78% | 73,44% | 77,53% -> 77,83% | 1.019 -> 1.028 | 0,44147 |
| IQ2_XS-SSM4 | 80,67% -> 81,44% | 71,09% | 75,58% -> 75,92% | 1.019 -> 1.028 | 0,51908 |

El autor advierte que estas cifras provienen de comprobaciones de desarrollo reutilizadas, no de un benchmark ciego, y que no son mediciones en Android ni iPhone.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente el tamaño del archivo GGUF más el proyector `mmproj-Q4_0.gguf` y el contexto. Las opciones van de 0,624 GiB (Q1_0, inutilizable en la práctica por su 2,98% de H) a 4,811 GiB (Q8_0).
- Configuraciones prácticas: IQ2_XS-SSM4 (1,840 GiB), SSM8-IQ3_XXS (2,150 GiB), Q3_K_M (2,489 GiB), Q4_0 (2,718 GiB), Q4_K_M (2,902 GiB) y Q8_0 (4,811 GiB).
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cualquier GPU consumer con 6-8 GB o más de VRAM debería alojar las cuantizaciones Q4 y Q8; las A100/H100 no son necesarias para estos tamaños.
- Cabe en GPU consumer: sí, al menos desde Q4_K_M hacia abajo en GPUs de 8 GB; IQ2_XS-SSM4 y SSM8-IQ3_XXS en GPUs de 4-6 GB.
- Opciones de despliegue: exclusivamente el runtime `llama.cpp-jev` (fork de llama.cpp con soporte de cabezas de decisión). No funciona con llama.cpp estándar, Ollama, vLLM ni TGI según la model card.
- Latencia y throughput: no disponible. Las evaluaciones usan contexto 2.048 y cuatro fotogramas de vídeo, pero no se publican cifras de latencia ni de tokens por segundo.

## Comparativa con modelos similares

No se dispone de datos de benchmarks comparables de otros modelos en la información proporcionada, por lo que la comparación se limita a características estructurales.

| Modelo | Parametros | Contexto | Multimodal | Licencia | Runtime |
|---|---|---|---|---|---|
| JEV Multimodal Qwen3.5-4B GGUF | 4,207.724.037 | no disponible (evaluado a 2.048) | Texto, imagen, vídeo visual | Apache 2.0 | llama.cpp-jev (específico) |
| Qwen3.5-4B (base declarada) | ~4B | no disponible | no disponible | no disponible | llama.cpp estándar |
| Alternativas de grounding visual de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa con modelos de la misma categoría (decisión multimodal con grounding) no está disponible en la información proporcionada.

## Limitaciones y advertencias

- El modelo no funciona con llama.cpp estándar ni con endpoints de chat convencionales: requiere el runtime `llama.cpp-jev` y, para los resultados corregidos, el parche de runtime validado (MIT) sobre el commit fijado. El commit sin parche mantiene el fallo de carga de vídeo.
- La cuantización Q1_0 es un experimento extremo con 2,98% de H y 31,89% de exactitud de decisión: no es apta para uso real.
- Las métricas publicadas son comprobaciones de desarrollo reutilizadas, no un benchmark ciego ni independiente; el autor lo indica explícitamente.
- Solo dos de las ocho configuraciones tienen reevaluación completa con el runtime corregido; el resto está marcado como "Not rerun".
- Idiomas limitados a inglés y chino; no se declara soporte de español.
- No se documentan sesgos conocidos ni tasas de alucinación. Al ser un modelo de decisión con salidas tipadas, el riesgo principal es la clasificación errónea y el fallo de grounding, no la generación libre de texto.
- No se documenta soporte de tool calling, agentes multi-paso ni modo de razonamiento deliberativo.
- La licencia Apache 2.0 permite uso comercial, pero la dependencia del runtime específico y del parche condiciona la reproducibilidad en producción.
- El repositorio ocupa 48,6 GB en total; conviene descargar solo el archivo de cuantización y el proyector necesarios.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/ZeeoRe/jev-multimodal-qwen3.5-4b-GGUF
- Modelo base: https://huggingface.co/ZeeoRe/jev-multimodal-qwen3.5-4b
- Runtime de decisión: https://github.com/2351548518/llama.cpp-jev
- Informe de reevaluación del runtime: `./recovery/runtime-fixed-evaluation.json` (en el repositorio)
- CSV comparativo: `./recovery/runtime-fixed-comparison.csv` (en el repositorio)
- Parche de runtime reproducible: `./recovery/runtime-fixes.patch` (licencia MIT, `./recovery/runtime-fixes.LICENSE`)
- Descarga de la pareja IQ2 seleccionada: `hf download ZeeoRe/jev-multimodal-qwen3.5-4b-GGUF recovery/jev-multimodal-qwen3.5-4b-IQ2_XS-SSM4-heads-Q8_0.gguf mmproj-Q4_0.gguf --local-dir jev-selected`
