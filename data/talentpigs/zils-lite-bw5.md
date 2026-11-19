# TalentPigs/zils-lite-bw5

## Resumen

Zils-lite-bw5 es un modelo derivado de Qwen/Qwen3.5-0.8B publicado por TalentPigs bajo licencia Apache-2.0. Se presenta como un "d3-lite decision body" destinado al pool d3-lite de la subnet 127 de Zils, es decir, un componente especializado en la toma de decisiones dentro de una infraestructura de subred distribuida, y no un modelo conversacional de propósito general. El pipeline declarado en Hugging Face es `feature-extraction`, lo que indica que su uso previsto es la extracción de representaciones y la clasificación o decisión sobre ellas, más que la generación de texto libre.

El modelo conserva la arquitectura del Qwen3.5-0.8B original, con 852.985.920 parámetros totales según los pesos en safetensors, y un repositorio de 1,7 GB. La model card es extremadamente escueta: no documenta datos de entrenamiento, composición del dataset, procesos de alineación ni resultados de evaluación. Su relevancia actual es acotada y experimental: se trata de un artefacto de fine-tuning registrado con cero descargas y cero likes en el momento de la consulta, por lo que debe tratarse como un modelo de nicho sin validación externa publicada.

La información disponible no permite confirmar la longitud de contexto efectiva, los idiomas soportados ni el formato de cuantización. Cualquier evaluación rigurosa exige inspeccionar los ficheros del repositorio y el código personalizado (`custom_code`) que el autor incluye, ya que la carga del modelo depende de módulos propios no documentados.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B; detalles no disponibles) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (pesos publicados en safetensors; el repo ocupa 1,7 GB) |
| Idiomas soportados | No disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Modelo base | Qwen/Qwen3.5-0.8B |
| Código personalizado | Sí (`custom_code` en transformers) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna más allá de la herencia del modelo base Qwen3.5-0.8B, un transformer decoder-only de aproximadamente 0,85 mil millones de parámetros. El autor etiqueta el artefacto como "d3-lite decision body", lo que sugiere un fine-tuning orientado a producir decisiones o puntuaciones dentro del pool d3-lite de la subnet 127 de Zils, pero no se especifica si el ajuste se realizó mediante SFT, preferencias (DPO/RLHF) u otro procedimiento.

No se publican datos sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de datos sintéticos ni las técnicas de alineación aplicadas. Tampoco se documentan innovaciones técnicas propias: el repositorio incluye código personalizado (`custom_code`) necesario para cargar el modelo en transformers, pero su contenido no está descrito en la model card. Cualquier afirmación sobre el proceso de entrenamiento sería especulativa.

## Capacidades

- Extracción de características: pipeline declarado `feature-extraction`, orientado a generar representaciones vectoriales a partir de texto de entrada.
- Toma de decisiones: el autor lo describe como "decision body" para el pool d3-lite, lo que apunta a clasificación o selección de opciones dentro de ese entorno.
- Generación de texto: no confirmada; el pipeline declarado no es `text-generation`, aunque al derivar de un modelo causal podría producir texto si se carga con la cabeza adecuada.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en el repositorio).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación y enrutamiento dentro de la subnet 127: el modelo puede emplearse como componente de decisión del pool d3-lite, seleccionando la acción o respuesta adecuada a partir de las representaciones extraídas de la entrada.
- Extracción de embeddings para pipelines de recuperación: al declarar `feature-extraction`, puede integrarse en sistemas de búsqueda semántica o clustering de documentos, siempre que se valide la calidad de sus representaciones.
- Filtrado y puntuación de candidatos: en un flujo con múltiples respuestas generadas por otro modelo mayor, este modelo ligero puede puntuar o descartar candidatos antes de la entrega final, reduciendo coste computacional.
- Prototipado de agentes con presupuesto reducido: sus ~0,85 mil millones de parámetros permiten ejecutarlo en hardware modesto para experimentar con lógica de decisión antes de escalar a modelos mayores.
- Investigación sobre fine-tuning de modelos pequeños: sirve como caso de estudio de adaptación de Qwen3.5-0.8B a una tarea concreta, útil para analizar qué se gana y se pierde frente al modelo base.
- Evaluación comparativa de "decision bodies": puede utilizarse como referencia en experimentos que comparen distintos cabezales o ajustes sobre el mismo modelo base dentro de una subred.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada en fp16/bf16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y del código personalizado; en la práctica, entre 3 y 4 GB para inferencia con lotes pequeños.
- VRAM estimada en cuantización de 8 bits: en torno a 1 GB de pesos, con un total práctico de 2 a 3 GB.
- VRAM estimada en cuantización de 4 bits: alrededor de 0,5 GB de pesos, con un total práctico de 1,5 a 2 GB (requiere convertir los safetensors a GGUF u otro formato, ya que el repositorio no incluye cuantizaciones).
- GPU recomendadas: cualquier GPU consumer con 4 GB o más de VRAM (RTX 3050, RTX 4060, RTX 4090) es suficiente; para despliegue en servidor, A100 o H100 no son necesarias por tamaño, pero pueden aportar throughput en lotes grandes.
- Cabe en GPU consumer: sí, en la práctica totalidad de tarjetas con 4 GB o más.
- Opciones de despliegue: transformers con `trust_remote_code=True` es la vía prevista por el autor; vLLM, llama.cpp, Ollama y TGI no están confirmados para este artefacto y requerirían adaptar el código personalizado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TalentPigs/zils-lite-bw5 | 852.985.920 | No disponible | Apache-2.0 | Hugging Face, 0 descargas | Fine-tuning de nicho con código personalizado |
| Qwen/Qwen3.5-0.8B | ~0,8 mil millones | No disponible en esta ficha | No disponible en esta ficha | Hugging Face | Modelo base del que deriva |
| Alternativas de ~1B para feature-extraction | No disponible | No disponible | No disponible | No disponible | No se dispone de datos verificados en la información proporcionada |

La comparación con alternativas de la misma categoría no puede completarse con rigor porque no se han facilitado especificaciones de modelos competidores. El único contraste fiable es con el modelo base, del que este artefacto hereda tamaño y arquitectura pero del que se diferencia por el ajuste y por el código personalizado de carga.

## Limitaciones y advertencias

- Model card prácticamente vacía: no documenta datos de entrenamiento, evaluación, sesgos ni limitaciones, lo que impide una validación rigurosa.
- Sin validación externa: cero descargas y cero likes en el momento de la consulta; no hay evidencia pública de su rendimiento.
- Dependencia de código personalizado: la carga requiere `trust_remote_code=True`, lo que implica ejecutar código del autor y revisarlo antes de usarlo en producción.
- Riesgo de alucinación: al derivar de un modelo causal de ~0,85 mil millones de parámetros, la generación libre de texto es propensa a errores factuales; el uso previsto es de decisión y extracción, no de generación fiable.
- Idiomas no declarados: se desconoce si conserva las capacidades multilingües del modelo base o si el ajuste las ha degradado.
- Contexto no documentado: no se puede planificar el uso con entradas largas sin verificar experimentalmente la ventana efectiva.
- Licencia Apache-2.0: permite uso comercial, pero el autor remite a los ficheros LICENSE y NOTICE para las atribuciones del modelo base; conviene revisarlos antes de redistribuir.
- Especialización estrecha: su utilidad fuera del pool d3-lite de la subnet 127 de Zils no está demostrada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TalentPigs/zils-lite-bw5
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Repositorio del autor (TalentPigs): https://huggingface.co/TalentPigs
- Documentación de transformers sobre `trust_remote_code`: https://huggingface.co/docs/transformers/main/en/models
