# tattrongvu/Jeffan-27B-1211

## Resumen

Jeffan-27B-1211 es un modelo de investigación derivado de Qwen/Qwen3.8-27B (licencia Apache 2.0), publicado por el usuario tattrongvu. No es un modelo generativo en el sentido habitual: se ha reconfigurado para responder preguntas de decisión estructuradas. La entrada es un estado (un documento, una conversación, una lista de herramientas) junto con una o varias preguntas de opción múltiple sobre ese estado, y la salida es una distribución de probabilidad sobre los códigos de las opciones (A, B, C…), leída de un único forward pass. El modelo no genera texto.

Técnicamente incorpora dos modificaciones destacables sobre el transformer híbrido de Qwen3.8: atención bidireccional en las capas de atención completa (las capas de atención lineal Gated DeltaNet permanecen causales) y un bucle de capas que ejecuta dos bloques de capas intermedias (24–35 y 36–47) dos veces por forward pass con una actualización amortiguada en fp32, sin parámetros nuevos. El contexto alcanza los 65.536 tokens con el motor de inferencia del autor.

La relevancia del modelo es acotada: es una primera versión de investigación, sin descargas ni valoraciones en el momento de redactar esta ficha, orientada a experimentar con decisiones estructuradas y selección de opciones en lugar de generación libre. Su utilidad práctica depende de reproducir exactamente el formato de prompt y el enmascaramiento de atención del autor.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal Gated DeltaNet) con bucle de capas; clase `Qwen3_5ForCausalLM` |
| Parámetros totales | 26.895.998.464 (26,90B) |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | Hasta 65.536 tokens de prompt con el motor de inferencia del autor |
| Tipos de cuantización | No disponible (pesos publicados en bf16; no se documentan cuantizaciones GGUF/AWQ/GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), librería transformers |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.8-27B, un transformer híbrido que combina capas de atención completa con capas de atención lineal (Gated DeltaNet). Sobre esa base, Jeffan-27B-1211 introduce dos cambios de inferencia, no de pesos: en primer lugar, las capas de atención completa operan de forma bidireccional, de modo que cada token del prompt ve a todos los demás, mientras que las capas Gated DeltaNet siguen siendo causales; en segundo lugar, los bloques de capas 24–35 y 36–47 se ejecutan dos veces por forward pass (valor por defecto en `dm_config.json`), con la actualización `x + (block(x) − x) / P` en fp32. Con dos pasadas, el coste de un forward pass aumenta un 37,5 % en evaluaciones de capas. No se añaden parámetros nuevos.

La model card no documenta el proceso de ajuste (número de tokens, composición del dataset, RLHF/DPO ni datos de entrenamiento). La información disponible se limita a la receta de inferencia y a la verificación de equivalencia con su motor de evaluación: en 300 preguntas retenidas, el ejemplo en transformers construye exactamente los mismos tokens de prompt (300 de 300) y devuelve las mismas probabilidades (misma opción en 300 de 300, diferencia máxima de probabilidad 0,0), verificado en una NVIDIA B300 en bf16 con transformers 5.17.0 y PyTorch 2.14.1.

## Capacidades

- Clasificación de decisiones: devuelve una probabilidad por cada opción (hasta 26, codificadas A–Z) en un único forward pass, sin generar texto.
- Preguntas de opción múltiple sobre un estado: el estado puede ser un documento, una conversación o una lista de herramientas.
- Lectura bidireccional del prompt en las capas de atención completa, lo que permite condicionar la decisión sobre el conjunto completo de la entrada.
- Soporte de contexto largo: hasta 65.536 tokens de prompt con el motor del autor.
- No soporta tool calling ni function calling de forma nativa; la lista de herramientas solo puede emplearse como parte del estado de entrada.
- No es un modelo de agentes ni de razonamiento multi-paso generativo: no produce cadenas de pensamiento ni texto intermedio.
- Capacidades multilingües: no disponibles (no documentadas).
- Capacidad especial: bucle de capas configurable en inferencia (`passes`/`loop_passes`; 2 por defecto, 1 ejecuta cada capa una vez).

## Casos de uso

- Triaje de tickets de soporte: dado el texto de un ticket como estado y una pregunta como «¿Qué equipo debe gestionarlo?» con opciones (facturación, envíos, técnico…), el modelo devuelve la probabilidad de cada equipo en una sola pasada, lo que permite umbralizar y derivar automáticamente.
- Enrutamiento de consultas en atención al cliente: con una conversación multi-turno como estado y opciones de departamento o de intención, se obtiene una distribución de probabilidad que puede alimentar un sistema de enrutamiento con niveles de confianza.
- Selección de herramienta en pipelines: dada una lista de herramientas disponibles y la petición del usuario como estado, el modelo puntúa cada herramienta como opción, útil como clasificador previo en un orquestador externo.
- Clasificación documental con contexto largo: gracias a los 65.536 tokens de prompt, puede decidir la categoría de contratos, informes o expedientes extensos sin truncar el documento.
- Evaluación de decisiones en investigación: al devolver probabilidades calibradas por opción en lugar de texto, sirve para medir preferencias o decisiones de un modelo base en experimentos controlados.
- Moderación o etiquetado con criterios múltiples: plantear preguntas de opción múltiple sobre el mismo estado (por ejemplo, gravedad, categoría y acción recomendada) y leer las distribuciones de cada pregunta en pasadas separadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única métrica documentada es la equivalencia de inferencia con el motor del autor: 300 de 300 prompts idénticos y 300 de 300 decisiones coincidentes, con diferencia máxima de probabilidad de 0,0.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 54 GB solo para pesos (26,90B × 2 bytes), más activaciones y caché; el repositorio ocupa 53,8 GB.
- GPU recomendadas: el autor verificó en una NVIDIA B300; por tamaño, se requieren GPU de 80 GB o superiores (A100 80 GB, H100 80 GB, B300) para bf16 sin cuantizar.
- No cabe en GPU de consumo (RTX 4090, 24 GB) en bf16; no se documentan cuantizaciones que permitan reducir el requisito.
- Opciones de despliegue: transformers 5.17.0 o superior (necesario que el modelo Qwen3.5 acepte una máscara de atención por tipo de capa) con `use_cache=False`; el autor menciona un motor propio de evaluación con `dm_config.json` y `loop_passes`, no disponible públicamente en la información proporcionada. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles; el bucle de capas con 2 pasadas incrementa el coste en un 37,5 % de evaluaciones de capas respecto a una sola pasada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Jeffan-27B-1211 | 26,90B | 65.536 tokens | Clasificación de decisiones / opción múltiple | Apache 2.0 | Hugging Face, 0 descargas |
| Qwen/Qwen3.8-27B (base) | No disponible en la información | No disponible en la información | Generación de texto | Apache 2.0 | Hugging Face |
| Alternativas de clasificación de decisión | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de rendimiento comparado con otros modelos en la información proporcionada.

## Limitaciones y advertencias

- Modelo de investigación en primera versión, sin descargas ni valoraciones; no hay evidencia de uso en producción.
- Solo funciona correctamente con el formato de prompt exacto del autor (línea de sistema fija; `State:`, `Question:`, `Options:` con códigos A, B…; línea de cierre); otros formatos pueden dar resultados distintos.
- Requiere máscara de atención bidireccional en las capas de atención completa; la máscara causal estándar produce un modelo diferente.
- Requiere el bucle de capas con 2 pasadas por defecto; usar 1 pasada cambia el comportamiento respecto a los resultados publicados.
- No genera texto: no sirve para respuestas abiertas, resúmenes ni razonamiento en cadena.
- Riesgo de alucinación no evaluado; al ser un clasificador de opciones, el riesgo se traslada a la calibración de las probabilidades, no documentada.
- Sesgos conocidos: no documentados.
- Idiomas soportados: no disponibles; no hay garantía de comportamiento multilingüe.
- Licencia Apache 2.0 permite uso comercial, pero la ausencia de evaluación y de documentación de entrenamiento desaconseja su uso en producción sin validación propia.
- Dependencia de versiones concretas de transformers y PyTorch para reproducir los resultados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tattrongvu/Jeffan-27B-1211
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
