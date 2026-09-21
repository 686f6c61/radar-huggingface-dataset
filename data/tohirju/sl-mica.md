# Tohirju/sl-mica

## Resumen

Tohirju/sl-mica es un modelo publicado en HuggingFace por el usuario Tohirju, con un total de 8.953.803.264 parámetros (aproximadamente 8,95 mil millones) confirmados a partir de los pesos en formato safetensors. El repositorio ocupa 17,9 GB, un tamaño coherente con pesos almacenados a 16 bits por parámetro (2 bytes × 8,95 mil millones ≈ 17,9 GB), lo que apunta a un checkpoint en fp16 o bf16 sin cuantizar. La etiqueta de arquitectura declarada es qwen3_5_text, lo que sugiere que se trata de un derivado o ajuste fino de un modelo de texto de la familia Qwen 3.5.

El modelo está publicado con acceso restringido (gated): es necesario aceptar condiciones en HuggingFace antes de poder descargarlo. La licencia declarada es "other", sin que se haya publicado información adicional sobre los términos concretos de uso. No se han publicado idiomas soportados, pipeline de tarea, ni resultados de benchmarks en la información disponible.

La relevancia de esta ficha es limitada y debe interpretarse con cautela: el modelo no acumula descargas ni "likes", no dispone de model card pública con detalles de entrenamiento y la búsqueda web realizada no ha devuelto ninguna referencia técnica al mismo. Se trata, por tanto, de un checkpoint de interés únicamente como objeto de evaluación directa por parte del usuario, no de un modelo consolidado con documentación verificable.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible. La etiqueta del repositorio indica qwen3_5_text, lo que apunta a una arquitectura transformer de texto de la familia Qwen 3.5, pero no se ha publicado confirmación detallada |
| Parametros totales | 8.953.803.264 (8,95 mil millones), dato real de los safetensors |
| Parametros activos | No aplica / no disponible (no hay indicios de que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible. El repositorio solo contiene safetensors; el tamaño de 17,9 GB sugiere pesos a 16 bits, pero no se publican versiones GGUF, GPTQ o AWQ |
| Idiomas soportados | No disponible |
| Licencia | other (términos concretos no publicados), con acceso restringido que requiere aceptar condiciones en HuggingFace |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna, el proceso de entrenamiento ni los datos utilizados. La única referencia disponible es la etiqueta qwen3_5_text del repositorio, que sugiere una arquitectura transformer de texto derivada de la familia Qwen 3.5, con aproximadamente 8,95 mil millones de parámetros. No hay datos sobre número de tokens de entrenamiento, composición del dataset, uso de RLHF, DPO u otras técnicas de alineamiento, ni sobre innovaciones técnicas como decodificación especulativa, atención lineal o variantes híbridas.

El nombre del repositorio (sl-mica) no aporta información verificable sobre el propósito del ajuste. Tampoco se documenta si se trata de un modelo base, un ajuste fino supervisado o un modelo alineado para instrucciones. Cualquier afirmación sobre su proceso de entrenamiento sería especulativa.

## Capacidades

- Generación de texto: capacidad esperable dado que la etiqueta declara una arquitectura de texto, pero no verificada en la información disponible.
- Razonamiento y matemáticas: no disponible.
- Generación de código: no disponible.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Modalidad declarada: únicamente texto, según la etiqueta qwen3_5_text.

## Casos de uso

No es posible recomendar casos de uso concretos con garantías, porque no se han publicado ni la model card, ni los idiomas soportados, ni los resultados de evaluación, ni los términos de licencia. Los escenarios siguientes son únicamente puntos de partida para una evaluación controlada por parte del propio equipo técnico:

- Evaluación interna de modelos de ~9B parámetros: desplegar el checkpoint en un entorno aislado para medir perplejidad, coherencia y calidad de generación frente a alternativas de tamaño similar antes de considerar cualquier uso productivo.
- Pruebas de ajuste fino adicional: al tratarse de un checkpoint de 8,95B con pesos en safetensors, puede servir como base para LoRA o QLoRA sobre dominios específicos, siempre que la licencia "other" lo permita.
- Experimentos de investigación sobre la familia Qwen 3.5: comparar su comportamiento con otros derivados comunitarios de la misma familia para estudiar el efecto de ajustes no documentados.
- Clasificación y etiquetado de texto por lotes: uso offline sobre corpus propios, sin exposición a usuarios finales, para medir utilidad antes de decidir si merece la pena integrarlo.
- Generación de resúmenes en un pipeline interno: únicamente tras validar calidad, idioma y ausencia de fugas de datos con un conjunto de prueba propio.
- Banco de pruebas de infraestructura de inferencia: emplearlo como carga de trabajo representativa de un modelo de ~9B para calibrar throughput y consumo de VRAM en vLLM, TGI o llama.cpp (este último solo si se generan pesos GGUF a partir de los safetensors).
- Prototipado de asistentes conversacionales: viable solo después de confirmar la longitud de contexto real y los idiomas soportados, datos que ahora mismo no están publicados.

En ningún caso debería desplegarse en producción con usuarios reales sin resolver antes la ambigüedad de la licencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

No hay datos de MMLU, HumanEval, GSM8K, MT-Bench ni de ninguna otra evaluación para Tohirju/sl-mica, ni existe una comparación oficial con modelos de su categoría. Cualquier cifra que se atribuyera a este modelo sería inventada.

## Requisitos de hardware

Las estimaciones siguientes se derivan del recuento real de parámetros (8,95 mil millones) y deben considerarse orientativas, ya que no se han publicado mediciones del modelo:

- Pesos en fp16/bf16 (únicos disponibles en el repositorio): 8,95B × 2 bytes ≈ 17,9 GB solo de pesos. Con overhead de runtime y caché KV, se recomienda un mínimo de 22-24 GB de VRAM para contextos cortos.
- Cuantización a 8 bits (si se genera): aproximadamente 9-10 GB de pesos, lo que sitúa el requisito práctico en torno a 12-14 GB de VRAM.
- Cuantización a 4 bits (si se genera): aproximadamente 5-6 GB de pesos, con un requisito práctico de 8-10 GB de VRAM.
- GPU profesionales: A100 40/80 GB, H100 80 GB o L40S 48 GB cubren el modelo en fp16 con margen amplio para contextos largos y lotes grandes.
- GPU de consumo: una RTX 4090 o RTX 3090 de 24 GB puede alojar los pesos en fp16 de forma ajustada, con contexto limitado; tarjetas de 16 GB (RTX 4060 Ti 16 GB, RTX 4080) requieren cuantización a 8 o 4 bits; tarjetas de 8-12 GB solo son viables en 4 bits con contextos reducidos.
- Opciones de despliegue: Transformers como vía directa para cargar safetensors; vLLM o TGI para servir con concurrencia; llama.cpp u Ollama únicamente si el usuario genera sus propios pesos GGUF, ya que el repositorio no los incluye.
- Latencia y throughput: no disponible. No hay mediciones publicadas de tokens por segundo ni de tiempo hasta el primer token.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de Tohirju/sl-mica, por lo que la comparación se limita a características estructurales. Los datos de los modelos de referencia son información pública general y no se han verificado en la búsqueda realizada:

| Modelo | Parametros | Contexto | Licencia | Acceso | Rendimiento publicado |
|---|---|---|---|---|---|
| Tohirju/sl-mica | 8,95B | No disponible | other (términos no publicados) | Restringido (gated) | No disponible |
| Qwen3-8B | ~8,2B | 32K nativo, ampliable con YaRN | Apache 2.0 | Abierto | Amplia batería pública |
| Llama 3.1 8B | ~8,03B | 128K | Licencia comunitaria de Llama 3.1 | Abierto con aceptación | Amplia batería pública |
| Mistral 7B v0.3 | ~7,25B | 32K | Apache 2.0 | Abierto | Amplia batería pública |

La diferencia clave no está en el tamaño, sino en la trazabilidad: los tres modelos de referencia cuentan con model card completa, licencia explícita y evaluaciones publicadas, mientras que para sl-mica no existe ninguna de esas tres cosas en la información disponible.

## Limitaciones y advertencias

- Licencia "other" sin términos publicados: no puede asumirse uso comercial. Es imprescindible contactar con el autor o revisar las condiciones que se aceptan al desbloquear el repositorio antes de cualquier despliegue.
- Acceso restringido (gated): la descarga requiere aceptar condiciones en HuggingFace, lo que añade fricción para reproducibilidad y para integración en pipelines automatizados.
- Ausencia total de model card: se desconocen datos de entrenamiento, composición del dataset, idiomas, sesgos y políticas de alineamiento.
- Longitud de contexto desconocida: no es posible planificar aplicaciones que dependan de ventanas largas sin medirla empíricamente.
- Idiomas no declarados: no puede asumirse un rendimiento correcto en castellano ni en ningún otro idioma.
- Riesgo de alucinación: sin datos de evaluación ni de alineamiento, debe asumirse un riesgo alto y no cuantificado de generar información falsa con apariencia de verosimilitud.
- Sesgos: no evaluados ni documentados.
- Sin validación comunitaria: cero descargas y cero "likes" en el momento de la consulta, lo que implica ausencia de retroalimentación externa sobre su calidad o estabilidad.
- Sin benchmarks: no hay ninguna métrica objetiva publicada que permita justificar su adopción frente a alternativas abiertas de tamaño equivalente.
- Sin cuantizaciones publicadas: los usuarios que necesiten formatos GGUF, GPTQ o AWQ tendrán que generarlos por su cuenta, con el coste y el riesgo de degradación que ello implica.
- Trazabilidad dudosa sobre el modelo base: la etiqueta qwen3_5_text no confirma de forma explícita la procedencia exacta de los pesos, lo que dificulta evaluar el cumplimiento de la licencia original.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Tohirju/sl-mica
- Búsqueda web realizada: no ha devuelto ningún resultado relevante sobre el modelo. Los resultados obtenidos corresponden a la plataforma de recursos públicos de la provincia de Guangdong (China) y no guardan relación con Tohirju/sl-mica: https://ygp.gdzwfw.gov.cn/, https://www.gdzwfw.gov.cn/ghcp/, https://www.digitalgd.com.cn/szgd/ggzyjypt/cpjjsfw_ggzyjypt.shtml, http://www.chinabidding.org.cn/zyzx34.htm, https://mall.gdaee.com.cn/page/index
- Paper, blog técnico, repositorio de código o demo: no disponibles.
