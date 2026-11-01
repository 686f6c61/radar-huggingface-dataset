# VINAY-UMRETHE/Qwen3.5-4B-heretic-reproduce

## Resumen

Qwen3.5-4B-heretic-reproduce es un ajuste fino (finetune) del modelo Qwen/Qwen3.5-4B publicado por el usuario VINAY-UMRETHE en HuggingFace. Se trata de una variante "abliterated" o "decensored": el autor ha aplicado la técnica conocida como *abliteration*, que consiste en identificar y neutralizar la dirección de activación asociada al rechazo (refusal) en el espacio latente del modelo, de modo que el modelo deja de negarse a responder a peticiones que el modelo original filtraría. El sufijo "heretic" hace referencia a la herramienta Heretic, empleada habitualmente para automatizar este tipo de intervención sobre los pesos.

El modelo conserva la arquitectura multimodal del Qwen3.5-4B original: procesa entradas de imagen y texto y genera texto (pipeline `image-text-to-text`), con 4.539.265.536 parámetros totales según los pesos en safetensors. El repositorio ocupa 9,1 GB y se distribuye bajo licencia Apache 2.0, aunque el acceso está restringido (gated) y requiere aceptar las condiciones en HuggingFace.

La relevancia de esta ficha es doble: por un lado, documenta una reproducción independiente del proceso de abliteration sobre un modelo multimodal reciente; por otro, advierte de que se trata de un artefacto con muy poca tracción (19 descargas, 0 likes, creado y actualizado el mismo día) y sin documentación técnica publicada por el autor, lo que limita seriamente su uso en producción sin una evaluación propia previa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text), familia Qwen3.5; detalles internos no disponibles |
| Parametros totales | 4.539.265.536 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no hay GGUF en el repo) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (libreria transformers) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-4B, un transformer multimodal de la familia Qwen3.5 que acepta imágenes y texto como entrada y produce texto. El autor no publica detalles sobre la arquitectura interna (número de capas, dimensiones ocultas, mecanismo de atención, tokenizador visual) ni sobre la longitud de contexto efectiva, por lo que estos datos deben consultarse en la ficha del modelo base.

El entrenamiento de este artefacto no es un entrenamiento convencional: se trata de una modificación de pesos mediante *abliteration*, una técnica que calcula la dirección media de las activaciones en capas de rechazo (típicamente en las capas medias del transformer) y proyecta los pesos fuera de esa dirección para suprimir el comportamiento de negativa. La herramienta Heretic automatiza este proceso con búsqueda de hiperparámetros. No se documenta en la información disponible qué dataset de calibración se usó, cuántas capas se intervinieron ni si hubo evaluación de degradación de capacidades tras la modificación. Tampoco se indica si se aplicó RLHF, DPO o cualquier otra etapa posterior.

## Capacidades

- Generación de texto conversacional multi-turno, heredada del modelo base Qwen3.5-4B.
- Procesamiento de entradas imagen-texto (pipeline `image-text-to-text`): descripción de imágenes, respuesta a preguntas visuales y razonamiento sobre contenido gráfico.
- Supresión del comportamiento de rechazo: el modelo está diseñado para no negarse a responder por motivos de política de contenido, lo que constituye su rasgo diferencial frente al base.
- Razonamiento y matemáticas: capacidades presumibles del base, no verificadas en este artefacto.
- Generación de código: presumible del base, no verificada.
- Tool calling / function calling: no disponible en la documentación del autor; debe comprobarse contra el modelo base.
- Soporte de agentes y razonamiento multi-paso: no documentado para este artefacto.
- Capacidades multilingües: no disponibles (el campo de idiomas está vacío en la ficha de HuggingFace).
- Modo "thinking" u otras capacidades especiales: no documentadas.

## Casos de uso

- Investigación sobre alineación y seguridad: el modelo sirve como caso de estudio reproducible de abliteration sobre un modelo multimodal, permitiendo medir cuánto se degradan las capacidades (MMLU, tareas visuales) tras eliminar la dirección de rechazo. Adecuado por su licencia Apache 2.0 y su disponibilidad en safetensors.
- Evaluación de robustez de filtros: equipos de seguridad pueden usar el artefacto como modelo adversario para probar clasificadores de contenido y sistemas de moderación en pipelines de texto e imagen.
- Generación creativa sin restricciones: escritura de ficción, guiones o narrativa con temáticas sensibles donde el modelo base se negaría; el contexto multimodal permite además trabajar con referencias visuales.
- Red teaming de aplicaciones multimodales: probar cómo responde un modelo sin refusal ante prompts con imágenes que intentan eludir salvaguardas, para endurecer las defensas de un producto.
- Análisis de contenido visual en dominios sensibles: por ejemplo, documentación de material gráfico que los modelos alineados rechazan describir; requiere revisión humana y cumplimiento normativo.
- Reproducción de experimentos de abliteration: dado que el nombre incluye "reproduce", sirve para replicar el pipeline Heretic sobre Qwen3.5-4B y comparar resultados con otras reproducciones de la comunidad.
- Fine-tuning posterior sin restricciones de rechazo: base para ajustes específicos donde el comportamiento de negativa del modelo original interferiría con el dominio (por ejemplo, datasets médicos o jurídicos con lenguaje explícito).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor no incluye métricas de MMLU, HumanEval, GSM8K ni evaluaciones multimodales, ni comparaciones con el modelo base para cuantificar la degradación provocada por la abliteration.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 9-10 GB solo para pesos (4,54 mil millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, 12-16 GB para contexto moderado.
- Cuantización a 8 bits: en torno a 5-6 GB de pesos; a 4 bits, unos 3 GB, aunque no se distribuyen pesos GGUF en el repositorio y habría que generarlos.
- GPU recomendadas: A100 40/80 GB o H100 para serving de alta concurrencia; RTX 4090 (24 GB) para inferencia en bf16 con contexto amplio; RTX 3090 (24 GB) equivalente.
- GPU de consumo: cabe en RTX 4090, RTX 3090, RTX 4080 (16 GB) en bf16 con contexto limitado, y en GPUs de 8-12 GB solo con cuantización.
- Opciones de despliegue: transformers (formato nativo del repo); vLLM y TGI si el modelo base es compatible con sus kernels; llama.cpp/Ollama requerirían convertir los pesos a GGUF, no incluidos.
- Latencia y throughput: no disponibles; no hay mediciones publicadas por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| VINAY-UMRETHE/Qwen3.5-4B-heretic-reproduce | 4,54 B | no disponible | imagen-texto | Apache 2.0 | Abliterated, gated, sin benchmarks |
| Qwen/Qwen3.5-4B (base) | ~4 B (no confirmado en esta ficha) | no disponible | imagen-texto | Apache 2.0 (presumible) | Modelo original alineado, con refusal |
| Otras reproducciones Heretic de la comunidad | variable | variable | texto o multimodal | variable | No se dispone de datos concretos en la información proporcionada |

No se dispone de información suficiente para comparar rendimiento numérico con alternativas de la misma categoría; la comparación se limita a parámetros, modalidad y licencia.

## Limitaciones y advertencias

- Ausencia total de documentación técnica: no hay model card detallada, ni datos de entrenamiento, ni evaluación de la degradación de capacidades tras la abliteration.
- Riesgo elevado de alucinación y de respuestas dañinas: al eliminar la dirección de rechazo, el modelo puede producir contenido tóxico, ilegal o peligroso sin filtro; no debe desplegarse en aplicaciones orientadas al público sin moderación externa.
- Tracción mínima: 19 descargas y 0 likes en el momento de la ficha; creado y actualizado el mismo día (31 de octubre de 2026), sin historial de mantenimiento.
- Acceso restringido (gated): requiere aceptar condiciones en HuggingFace, lo que añade fricción para uso en pipelines automatizados.
- Idiomas no declarados: no se puede garantizar el rendimiento multilingüe del base.
- Contexto no declarado: imposible planificar aplicaciones de contexto largo sin consultar el modelo base.
- Licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantías; la responsabilidad legal por el contenido generado recae en el desplegador.
- Sesgos: heredados del modelo base y potencialmente amplificados por la supresión del refusal; no evaluados.
- La técnica de abliteration puede degradar sutilmente el razonamiento y la coherencia; no hay benchmarks que lo cuantifiquen.
- No se distribuyen pesos cuantizados (GGUF, AWQ, GPTQ), lo que limita el despliegue en hardware modesto sin trabajo adicional.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VINAY-UMRETHE/Qwen3.5-4B-heretic-reproduce
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Herramienta Heretic (referencia del sufijo del nombre): no se ha encontrado enlace en la información proporcionada
- Paper o blog del autor: no disponible
- Repositorio de código: no disponible
- Demo: no disponible
