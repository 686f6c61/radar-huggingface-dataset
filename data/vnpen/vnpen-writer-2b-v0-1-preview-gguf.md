# VNPen/vnpen-writer-2b-v0.1-preview-GGUF

## Resumen

vnpen-writer-2b-v0.1-preview-GGUF es la distribución cuantizada en formato GGUF del modelo VNPen/vnpen-writer-2b-v0.1-preview, un modelo de generación de texto de 1.881.825.088 parámetros (aproximadamente 1,88 mil millones) desarrollado por VNPen y orientado específicamente a escritura creativa en chino, con especial atención a guiones de novela visual. El repositorio incluye seis variantes de cuantización (BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M e IQ4_XS) pensadas para despliegue en dispositivo (edge), con llama.cpp y Ollama como runtimes principales.

La relevancia del modelo está en su relación entre tamaño y coste de contexto: según la model card, la arquitectura subyacente es un transformer híbrido tipo Qwen3.5 con 24 capas, de las cuales solo 6 ejecutan atención completa (capas 3, 7, 11, 15, 19 y 23) mientras las otras 18 son capas de atención lineal (gated delta-net) con estado recurrente de tamaño fijo. Esto reduce la caché KV a unos 12 KB por token, frente a los ~48 KB por token de un modelo denso de 24 capas con la misma forma, lo que abarata mucho el contexto largo: el modelo declara 262.144 tokens de contexto y con Q4_K_M el archivo pesa 1,27 GB.

Se trata, sin embargo, de una cuantización de un checkpoint de vista previa (preview), no de una versión v0.1 definitiva. La propia model card advierte de un problema de degeneración por repetición en el modelo fuente y recomienda ajustes de decodificación no estándar para mitigarlo. El modelo solo soporta chino (zh), está licenciado bajo Apache 2.0 y acumulaba 400 descargas en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer híbrido (atención completa + atención lineal gated delta-net), 24 capas; según la model card, base tipo Qwen3.5 |
| Parámetros totales | 1.881.825.088 (~1,88 mil millones) |
| Parámetros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262.144 tokens declarados; `num_ctx` por defecto en el Modelfile: 8.192 |
| Tipos de cuantización | BF16, Q8_0, Q6_K, Q5_K_M, Q4_K_M, IQ4_XS |
| Idiomas soportados | Chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); plantilla de chat embebida en el GGUF |
| Autor | VNPen |
| Modelo base | VNPen/vnpen-writer-2b-v0.1-preview (relación: quantized) |
| Pipeline | text-generation |
| Tamaño del repositorio | 11,2 GB (incluye todas las cuantizaciones) |
| Descargas / likes | 400 / 0 |
| Fecha de creación / actualización | 19-09-2026 / 19-09-2026 |

## Arquitectura y entrenamiento

La model card describe la arquitectura como un híbrido: de las 24 capas totales, únicamente 6 (3, 7, 11, 15, 19 y 23) ejecutan atención completa, mientras que las 18 restantes son capas de atención lineal del tipo gated delta-net cuyo estado recurrente es de tamaño fijo independientemente de la longitud de la secuencia. La consecuencia práctica es que la caché KV cuesta aproximadamente 12 KB por token en lugar de los ~48 KB por token que requeriría un modelo denso de 24 capas con esta forma. Las tablas de la model card dan: 8.192 tokens de contexto → ~96 MB de caché KV + ~18 MB de estado recurrente fijo; 32.768 tokens → ~384 MB + ~18 MB; 131.072 tokens → ~1,5 GB + ~18 MB.

El modelo ata los embeddings de entrada y salida. El tensor `token_embd.weight` tiene dimensiones 248.320 × 2.048, lo que supone el 27% de todos los parámetros, y se mantiene en Q6_K en todas las cuantizaciones K-quant por debajo de Q6_K; ese único tensor domina el tamaño del archivo y explica que los formatos de bit bajo apenas reduzcan el peso final. La model card menciona además que cada turno del asistente en el entrenamiento empezaba con un bloque `<think>` vacío, por lo que el Modelfile fuerza un bloque `<think>` vacío para no sacar al modelo de su distribución de entrenamiento.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF, DPO u otras técnicas de alineación: **no disponible**. La model card únicamente declara que la perplejidad se midió sobre una porción reservada del corpus propio del proyecto, disjunta del conjunto de calibración de la matriz de importancia (300 muestras / 336.872 tokens), renderizadas con la plantilla de chat del propio modelo, de modo que la pérdida por cuantización es medida y no memorizada.

## Capacidades

- Generación de texto creativo en chino, con especialización declarada en guiones de novela visual (visual-novel) y escritura creativa.
- Generación de diálogo estructurado en el formato `hablante：texto` (separador de ancho completo), formato que la model card verificó en una prueba de 31 líneas con 31/31 líneas correctas y 31 líneas únicas.
- Soporte de plantilla de chat conversacional embebida en el GGUF (compatible con `--jinja` en llama.cpp).
- Bloque de razonamiento `<think>`: el modelo fue entrenado abriendo cada turno del asistente con un bloque `<think>` vacío; el Modelfile lo fuerza explícitamente.
- Capacidades multilingües: limitadas al chino (zh) según los metadatos del repositorio; no se declaran otros idiomas.
- Tool calling / function calling: no disponible (no se menciona en la información proporcionada).
- Soporte de agentes y razonamiento multi-paso: no disponible (no se menciona).
- Capacidades de visión o audio: no disponibles (el pipeline es text-generation).

## Casos de uso

- Generación de escenas de novela visual: el modelo está entrenado para producir escenas con diálogo en formato `hablante：texto`, por lo que encaja directamente en pipelines de guionado para novelas visuales en chino. La prueba documentada de una escena de 31 líneas (atardecer en una azotea, dos personajes que no dicen lo que piensan) devolvió 31 líneas únicas en el formato esperado.
- Escritura creativa asistida con contexto largo: gracias al coste reducido de la caché KV (~12 KB/token), se puede subir `num_ctx` hasta 32.768 o 131.072 tokens con un incremento de memoria moderado (~384 MB y ~1,5 GB respectivamente), lo que permite mantener arcos argumentales completos o fichas de personaje extensas dentro del contexto.
- Despliegue en dispositivo (edge): con la cuantización Q4_K_M (1,27 GB, ~1,7 GB de RAM con 8k de contexto) el modelo cabe en portátiles, mini-PC y equipos sin GPU dedicada; es la variante recomendada por el autor para este escenario.
- Asistente conversacional de personaje en chino: la combinación de plantilla de chat embebida, licencia Apache 2.0 y ejecución vía Ollama (`ollama run hf.co/VNPen/vnpen-writer-2b-v0.1-preview-GGUF:Q4_K_M`) permite levantar un bot de personaje local sin depender de APIs externas.
- Generación por lotes de variantes de escena: al ser un modelo pequeño (1,27 GB en Q4_K_M) y con generación de 578 t/s en una RTX 5090, es viable producir muchas variantes de un mismo fragmento para selección posterior o para pruebas A/B de guion.
- Prototipado e investigación sobre cuantización: el repositorio incluye BF16 como fuente de conversión y una tabla completa de perplejidad por cuantización, lo que lo hace útil como caso de estudio reproducible de cómo afecta la cuantización a un modelo con embeddings atados y vocabulario grande (248.320 entradas).
- Requantización para formatos personalizados: el autor indica explícitamente que hay que partir de `writer-2b-preview-BF16.gguf` para generar nuevas cuantizaciones, lo que sirve para integrar el modelo en pipelines con requisitos de tamaño específicos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los únicos datos de rendimiento publicados son los de perplejidad por cuantización y los de velocidad de inferencia.

Perplejidad medida sobre una porción reservada del corpus propio (300 muestras / 336.872 tokens), renderizada con la plantilla de chat del modelo:

| Archivo | Tamaño | PPL | Δ vs BF16 | RAM (contexto 8k) | Uso recomendado |
|---|---|---|---|---|---|
| writer-2b-preview-BF16.gguf | 3,78 GB | 10,8465 | — | — | Fuente de conversión; requisar a partir de este |
| writer-2b-preview-Q8_0.gguf | 2,01 GB | 10,8568 | +0,0103 (+0,09%) | ~2,4 GB | Calidad de referencia, prácticamente sin pérdida |
| writer-2b-preview-Q6_K.gguf | 1,56 GB | 10,8992 | +0,0527 (+0,49%) | ~2,0 GB | Alta calidad |
| writer-2b-preview-Q5_K_M.gguf | 1,41 GB | 10,9559 | +0,1094 (+1,01%) | ~1,8 GB | Equilibrado |
| writer-2b-preview-Q4_K_M.gguf | 1,27 GB | 11,0456 | +0,1991 (+1,84%) | ~1,7 GB | Recomendado para edge |
| writer-2b-preview-IQ4_XS.gguf | 1,20 GB | 11,1793 | +0,3328 (+3,07%) | ~1,6 GB | Solo si no cabe el de 1,27 GB |

Velocidad medida con `llama-bench`, cuantización Q4_K_M, build de llama.cpp `60081bb`:

| Backend | Prefill (pp512) | Generación (tg128) |
|---|---|---|
| RTX 5090, todas las capas descargadas a GPU | 25.941 t/s | 578 t/s |
| CPU, 8 hilos, sin offload | 2.925 t/s | 30,9 t/s |

La model card describe la fila de CPU como un servidor (el texto original queda truncado en ese punto).

## Requisitos de hardware

- Memoria para inferencia con contexto de 8.192 tokens: ~1,6 GB (IQ4_XS), ~1,7 GB (Q4_K_M), ~1,8 GB (Q5_K_M), ~2,0 GB (Q6_K), ~2,4 GB (Q8_0). Estas cifras incluyen el archivo del modelo, la caché KV de 8k y algo de sobrecarga del runtime.
- GPU: el autor publica medidas sobre una RTX 5090 con todas las capas descargadas (25.941 t/s de prefill, 578 t/s de generación). No se publican medidas para A100, H100 u otras GPU.
- CPU: funciona sin GPU; con 8 hilos se midieron 2.925 t/s de prefill y 30,9 t/s de generación. Es viable en CPU, aunque la generación es ~19 veces más lenta que en la RTX 5090.
- Cabe holgadamente en GPU de consumo: cualquiera con 2 GB o más de VRAM libre puede alojar la variante Q4_K_M completa, y el modelo es apto para equipos sin GPU dedicada.
- Memoria para contexto largo: 8.192 tokens → ~96 MB de caché KV + ~18 MB de estado recurrente; 32.768 → ~384 MB + ~18 MB; 131.072 → ~1,5 GB + ~18 MB. El estado recurrente no crece con la longitud de la secuencia.
- Opciones de despliegue: llama.cpp (`llama-cli` con `--jinja`) y Ollama (mediante el `Modelfile` del repositorio o el atajo `hf.co/...:Q4_K_M`). Cualquier runtime compatible con GGUF debería poder cargar los archivos.
- Parámetros de decodificación recomendados: `temperature` 0,8, `top_p` 0,95, `repeat_penalty` 1,1, `repeat_last_n` 256, y ambos tokens de parada (`<|im_end|>` y `<|endoftext|>`).
- Latencia y throughput en otros backends (vLLM, TGI, TensorRT-LLM): no disponible; no se publican datos para estos runtimes.

## Comparativa con modelos similares

No se han publicado en la información disponible datos de benchmarks que permitan comparar este modelo con alternativas de la misma categoría (otros modelos GGUF de escritura creativa en chino de 1 a 3 mil millones de parámetros). Los únicos datos comparativos aportados son internos al propio repositorio, entre sus cuantizaciones, y se recogen en la tabla siguiente.

| Modelo / variante | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vnpen-writer-2b-v0.1-preview (BF16) | 1,88 mil millones | 262.144 | PPL 10,8465 | Apache 2.0 | GGUF, 3,78 GB |
| vnpen-writer-2b-v0.1-preview (Q8_0) | 1,88 mil millones | 262.144 | PPL 10,8568 (+0,09%) | Apache 2.0 | GGUF, 2,01 GB |
| vnpen-writer-2b-v0.1-preview (Q4_K_M) | 1,88 mil millones | 262.144 | PPL 11,0456 (+1,84%) | Apache 2.0 | GGUF, 1,27 GB |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Es una cuantización de un checkpoint de vista previa (preview), no de una versión v0.1 final. La model card indica que todo lo que dice la tarjeta del modelo fuente sobre calidad, alcance y problemas conocidos se aplica sin cambios.
- Problema de degeneración por repetición documentado en el modelo fuente: la proporción mediana de líneas repetidas es 0,256 en los elementos de guion, y el peor caso observado fue una línea emitida 310 veces. El autor pide un `repeat_penalty` entre 1,05 y 1,15.
- La ventana de repetición por defecto de Ollama (64 tokens) es más corta que un par narración + diálogo, por lo que no detecta el ciclo que debe romper; el Modelfile la sube a 256 y hay que fijarla a mano si se usa el atajo `ollama run hf.co/...:Q4_K_M`, que no carga el Modelfile del repositorio.
- Desajuste de tokens de parada: `config.json` hereda el EOS 248044 (`<|endoftext|>`) del modelo base, mientras que la plantilla de chat cierra el turno del asistente con `<|im_end|>` (248046). Hay que listar ambos como `stop` para que el turno termine con el que emita el modelo.
- Omitir el bloque `<think>` vacío saca al modelo de su distribución de entrenamiento, ya que todos los turnos del asistente en entrenamiento empezaban con ese bloque.
- Idioma: solo chino (zh). No se declara soporte de castellano ni de ningún otro idioma, por lo que su uso en producción multilingüe requeriría evaluación previa.
- Rendimiento en tareas generales (razonamiento, matemáticas, código) sin evaluar: no hay benchmarks publicados, y el modelo está especializado en escritura creativa.
- Riesgo de alucinación: no documentado específicamente en la información disponible; aplican las advertencias generales de un modelo de 1,88 mil millones de parámetros sin benchmarks publicados.
- Licencia Apache 2.0: permite uso comercial y modificación, pero se aplica sobre un checkpoint de vista previa, sin garantías de calidad ni de estabilidad de comportamiento.
- Sesgos conocidos: no disponible (la información proporcionada no documenta sesgos específicos).
- La elección de IQ4_XS suele ser subóptima: ahorra solo un 6% de tamaño frente a Q4_K_M y paga un 3,07% de perplejidad, porque el tensor de embeddings (27% de los parámetros) se mantiene en Q6_K en todas las K-quant por debajo de Q6_K.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/VNPen/vnpen-writer-2b-v0.1-preview-GGUF
- Modelo base: https://huggingface.co/VNPen/vnpen-writer-2b-v0.1-preview

Nota: la búsqueda web realizada no devolvió resultados relevantes para este modelo; los enlaces obtenidos correspondían a consultas de coordenadas geográficas sin relación con el contenido de esta ficha. No se dispone de enlaces a papers, blogs, repositorios de código ni demos en la información proporcionada.
