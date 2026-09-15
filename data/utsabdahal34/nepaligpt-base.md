# utsabdahal34/NepaliGPT-base

## Resumen

NepaliGPT-base es un modelo de lenguaje decoder-only de arquitectura GPT-2 publicado por el usuario utsabdahal34 en HuggingFace y exportado como pesos estándar de Transformers. Se trata de un modelo base (no ajustado por instrucciones) especializado en nepalí (`ne`), con 33.674.240 parámetros, una ventana de contexto de 512 tokens y un vocabulario SentencePiece de 16.000 tokens. El checkpoint se distribuye en formato `safetensors` junto al tokenizador `tokenizer.model`, mientras que el paquete original del proyecto aloja además un `model.pt` nativo y un pipeline de ajuste por instrucciones (`nepali_gpt2.sft.format_prompt`).

Su relevancia es acotada y muy específica: se trata de un modelo de investigación de escala reducida (0,3 GB de repositorio) orientado al modelado de lenguaje en nepalí, un idioma con recursos limitados. No compite con LLM contemporáneos ni pretende hacerlo; su interés está en servir como punto de partida para experimentos de preentrenamiento continuado, ajuste fino y evaluación de tokenización en nepalí, así como en tareas de docencia o prototipado en hardware muy limitado.

La información pública aportada por el autor es mínima: no se declara licencia, no se publican resultados de benchmarks amplios (solo una prueba cloze interna de 3/5), no hay métricas de perplejidad en conjuntos reservados ni mediciones en CUDA, y el corpus de entrenamiento (Wikipedia nepalí y OSCAR nepalí, según el cuaderno Colab de origen) no se incluye en el repositorio. El repositorio registra 0 descargas y 0 "likes" en el momento de redactar esta ficha, sin validación externa conocida.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only estilo GPT-2 (atención causal multi-cabeza, `qkv_bias: false`) |
| Parametros totales | 33.674.240 (≈33,7 M) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 512 tokens |
| Tipos de cuantizacion | no disponible (no se publican checkpoints cuantizados; solo pesos en safetensors, presumiblemente fp32) |
| Idiomas soportados | nepalí (`ne`) |
| Licencia | no disponible |
| Formato de pesos | safetensors (Transformers, `AutoModelForCausalLM`); tokenizador `tokenizer.model` (SentencePiece); el paquete fuente incluye además un `model.pt` nativo |
| Vocabulario | 16.000 tokens (SentencePiece) |
| Dimensión oculta (`emb_dim`) | 512 |
| Capas (`n_layers`) | 8 |
| Cabezas de atención (`n_heads`) | 8 (dimensión por cabeza: 64) |
| Dropout | 0,1 |
| Tamaño del repositorio | 0,3 GB |
| Descargas / likes | 0 / 0 |
| Fechas de metadatos | creado 2026-09-15; actualizado 2026-09-15 |
| Librería | transformers |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de estilo GPT-2 con atención causal. La configuración declarada en la model card es: `vocab_size` 16.000, `context_length` 512, `emb_dim` 512, `n_heads` 8, `n_layers` 8, `drop_rate` 0,1 y `qkv_bias: false`. La aritmética de parámetros es coherente con esa configuración: las proyecciones de atención sin sesgo suman 1.048.576 parámetros por capa (3 × 512 × 512 para QKV y 512 × 512 para la proyección de salida), el bloque MLP aporta en torno a 2,1 M por capa, y las incrustaciones de tokens y posición (16.000 × 512 más 512 × 512) suman aproximadamente 8,45 M. No se especifican en la documentación la función de activación, el esquema de codificación posicional, el tipo de normalización ni el uso de weight tying, por lo que esos detalles figuran como no disponibles.

En cuanto a los datos, la model card indica que se usaron Wikipedia nepalí y OSCAR nepalí, descritos en el cuaderno Colab del proyecto fuente; el corpus bruto y la partición reservada (held-out) no se incluyen en esta exportación. El autor señala explícitamente que el checkpoint exportado no contiene estado del optimizador ni metadatos de pasos de entrenamiento verificables de forma independiente, lo que limita cualquier intento de reproducir el entrenamiento. No se documenta ningún proceso de RLHF, DPO o SFT aplicado a este checkpoint base; sí se menciona que existe un checkpoint ajustado por instrucciones en el paquete fuente, cuya construcción se realiza mediante `nepali_gpt2.sft.format_prompt(instruction, context)`. No se reporta ninguna innovación técnica (decodificación especulativa, atención lineal, MoE híbrido ni similares).

## Capacidades

- Generación de texto en nepalí en modo continuación: el modelo recibe una secuencia de tokens (por ejemplo, comenzando por `bos_id`) y genera hasta `max_new_tokens` tokens mediante `model.generate`.
- Modelado de lenguaje causal puro: es un checkpoint base, entrenado para predecir el siguiente token, no para seguir instrucciones.
- Completado de texto tipo cloze: el autor reporta una puntuación de 3/5 en un conjunto de prueba cloze propio del repositorio, descrito explícitamente como una prueba de humo y no como un benchmark de calidad.
- Punto de partida para ajuste fino: admite ajuste supervisado, clasificación con cabeza adicional o preentrenamiento continuado sobre corpus nepalí.
- Tool calling / function calling: no disponible, no documentado.
- Soporte de agentes y razonamiento multi-paso: no disponible, no documentado; la ventana de 512 tokens limita además cualquier cadena de pasos larga.
- Capacidades multilingües: no disponibles; la etiqueta de idioma declarada es únicamente nepalí (`ne`).
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Compatibilidad declarada con `text-generation-inference` y `endpoints_compatible` mediante las etiquetas del repositorio, aunque no hay evidencia publicada de despliegue a esta escala.

## Casos de uso

- Investigación en modelado de lenguaje para lenguas con pocos recursos: el modelo sirve como línea base reproducible a pequeña escala para comparar tokenizadores SentencePiece de 16.000 tokens aplicados al nepalí, midiendo perplejidad antes y después de cambios en el corpus.
- Preentrenamiento continuado y experimentos de ajuste fino: con 33,7 M de parámetros y 0,3 GB de repositorio, es viable ajustarlo por completo en una única GPU de consumo, o incluso en CPU, para probar recetas de entrenamiento antes de escalarlas a modelos mayores.
- Docencia y prácticas de NLP: permite ilustrar el ciclo completo de un transformer decoder-only (tokenización, atención causal, generación autoregresiva) en un aula con recursos de hardware mínimos.
- Prototipado rápido de aplicaciones de texto en nepalí: para demos internas de autocompletado o continuación de frases donde no se requiere calidad de producción, el modelo cabe en memoria de cualquier portátil y arranca en segundos.
- Generación de datos sintéticos auxiliares y filtrado lingüístico: puede emplearse para producir borradores de texto nepalí que después se curan manualmente, o como componente de puntuación de fluidez en pipelines de limpieza de corpus, siempre con revisión humana dado su tamaño.
- Experimentos de despliegue en el borde (edge): su huella de memoria (decenas de megabytes) permite probar servidores de inferencia ligeros y medir latencia en dispositivos sin GPU dedicada.
- Ajuste para tareas discriminativas: añadiendo una cabeza de clasificación sobre el último estado oculto, es adecuado para experimentos de análisis de sentimiento o categorización de textos nepalíes en conjuntos de datos pequeños.
- Comparación de arquitecturas en ablaciones controladas: su configuración conocida (8 capas, 512 de anchura, 8 cabezas) lo convierte en un sujeto de prueba manejable para estudiar el efecto de variaciones de profundidad, anchura o contexto.

## Benchmarks y rendimiento

La información disponible solo incluye una prueba interna de completado tipo cloze, que el propio autor describe como un "smoke set" y no como un benchmark de calidad general. No hay resultados de MMLU, HumanEval, GSM8K ni de métricas estándar de generación en nepalí.

| Evaluación | Resultado | Notas |
|---|---|---|
| Cloze smoke set del repositorio | 3/5 | Prueba de humo interna; el autor indica que no es un benchmark amplio de calidad |
| Perplejidad en held-out | no disponible | El autor indica que no está disponible en esta exportación |
| Baseline multilingüe | no disponible | — |
| Puntuaciones de seguimiento de instrucciones (humanas) | no disponible | — |
| Mediciones en CUDA | no disponible | — |

## Requisitos de hardware

- VRAM estimada para los pesos: en fp32, aproximadamente 135 MB (33,67 M × 4 bytes); en fp16/bf16, unos 67 MB; en int8, unos 34 MB; en int4, unos 17 MB. Cálculo derivado del recuento de parámetros, no de mediciones publicadas.
- Caché KV en contexto completo (512 tokens, fp16): en torno a 8 MB, calculado como 2 × 8 capas × 8 cabezas × 64 dimensiones × 512 tokens × 2 bytes. En fp32 sería de unos 17 MB.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; una RTX 4090, A100 o H100 quedan enormemente sobredimensionadas para este modelo y no aportan ventaja práctica frente a una GPU de gama de entrada.
- ¿Cabe en GPU de consumo? Sí, con margen amplio: en cualquier GPU de consumo de los últimos diez años, e incluso en GPU integradas. También es viable la inferencia en CPU.
- Opciones de despliegue: `transformers` con `AutoModelForCausalLM` (ruta documentada por el autor), `text-generation-inference` y endpoints compatibles según las etiquetas del repositorio. Para `llama.cpp`, Ollama o vLLM sería necesaria una conversión a GGUF o la carga directa de safetensors; no se publican artefactos convertidos ni guías específicas.
- Latencia y throughput estimados: no disponible. El autor indica explícitamente que las mediciones en CUDA no están disponibles en esta exportación.

## Comparativa con modelos similares

No se han encontrado en la búsqueda modelos nepalíes comparables con datos publicados, por lo que la comparación se establece con modelos pequeños de propósito general ampliamente conocidos. Los datos de las alternativas corresponden a sus especificaciones públicas habituales y deben verificarse en sus propias fichas.

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|
| NepaliGPT-base | 33,7 M | 512 | nepalí | no disponible | safetensors en HuggingFace |
| GPT-2 small | 124 M | 1.024 | inglés (principalmente) | MIT (con restricciones de uso en la variante original) | safetensors/PyTorch en HuggingFace |
| DistilGPT-2 | 82 M | 1.024 | inglés | Apache-2.0 | safetensors/PyTorch en HuggingFace |
| Alternativas específicas en nepalí | no disponible | no disponible | no disponible | no disponible | no disponible |

Diferencias clave: frente a GPT-2 small y DistilGPT-2, este modelo tiene menos parámetros y una ventana de contexto la mitad de corta, pero está entrenado sobre corpus nepalí, lo que lo hace potencialmente más útil para ese idioma pese a su menor capacidad. No hay datos de rendimiento comparables entre ellos en ninguna tarea común.

## Limitaciones y advertencias

- Licencia no disponible: sin una licencia declarada, no hay autorización explícita para uso comercial ni para redistribución. Cualquier uso en producción requiere contactar con el autor o abstenerse.
- Es un modelo base, no ajustado por instrucciones: no sigue órdenes, no responde a formatos de chat y no mantiene diálogos coherentes.
- Riesgo elevado de repetición de texto y de alucinación factual, tal como advierte el propio autor.
- Ventana de contexto de solo 512 tokens: insuficiente para documentos largos, conversaciones multi-turno extensas o razonamiento en varios pasos.
- Capacidad limitada por tamaño: con 33,7 M de parámetros, su competencia lingüística y sus conocimientos factuales son muy inferiores a los de modelos actuales de miles de millones de parámetros.
- Sesgos heredados del corpus: Wikipedia nepalí y OSCAR nepalí pueden introducir sesgos de representación, de género, geográficos y de registro. No se ha publicado ningún análisis de sesgo.
- Monolingüe: solo se declara nepalí; se desconoce el comportamiento en otros idiomas y probablemente sea deficiente.
- Evaluación insuficiente: la única métrica publicada es 3/5 en una prueba cloze interna; no hay perplejidad en held-out, ni métricas de seguimiento de instrucciones, ni resultados en benchmarks estándar.
- Reproducibilidad limitada: no se incluyen corpus, partición held-out, estado del optimizador ni metadatos verificables de pasos de entrenamiento.
- Trazabilidad de licencias del corpus: el autor recomienda verificar las licencias de las fuentes originales antes de redistribuir, dado que el corpus no se incluye.
- Sin validación comunitaria: 0 descargas y 0 "likes" en el repositorio, sin issues ni evaluaciones independientes conocidas.
- Los metadatos del repositorio muestran fechas de creación y actualización de 2026-09-15, con apenas un minuto de diferencia entre ambas; conviene contrastar la fecha real de publicación antes de citarlo.
- No se publican cuantizaciones listas para usar; cualquier despliegue en formatos GGUF o INT8 exige conversión propia y validación posterior.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/utsabdahal34/NepaliGPT-base
- Repositorio fuente del proyecto (mencionado en la model card): https://github.com/utsab345/Nepali_GPT2
- Cuaderno Colab con la descripción de los datos: referenciado en la model card como "source Colab notebook", sin URL directa disponible.
- Paper: no disponible.
- Blog o demo: no disponible.
- Resultados de la búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos corresponden a páginas de inicio de sesión de Outlook y a ficheros de configuración de Microsoft, sin relación con NepaliGPT.
