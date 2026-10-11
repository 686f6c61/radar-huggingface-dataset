# Winnougan/ComfyUI-Heretic-Uncensored-Text-Encoders

## Resumen

Winnougan/ComfyUI-Heretic-Uncensored-Text-Encoders es un encoder de texto derivado de Qwen/Qwen3.5-2B al que se le ha eliminado el comportamiento de rechazo mediante "abliteración". Lo publica el usuario Winnougan y su propósito es servir como encoder de texto listo para usar en ComfyUI, sin renombrado de claves ni ficheros de configuración adicionales. El repositorio contiene un único archivo `.safetensors` con los pesos completos fusionados (el modelo abliterado exportado como modelo autónomo).

El modelo base tiene aproximadamente 2.000 millones de parámetros, por lo que es un modelo pequeno orientado a ejecución local en GPU de consumo. El proceso de decensurado se realizó con Heretic v2 (dev) de p-e-w, empleando ablación de rango arbitrario (ARA) y una búsqueda Optuna de 100 ensayos de la que se seleccionó el ensayo 31, con 2/100 rechazos frente a 97/100 del modelo original y una divergencia KL de 0,0583 sobre un conjunto limitado de prompts inocuos.

Su relevancia es práctica: permite usar un encoder Qwen3.5-2B sin rechazos dentro de flujos de ComfyUI de generación de texto y captioning, manteniendo la coherencia del modelo original según las métricas declaradas. No se trata de un modelo nuevo entrenado desde cero, sino de un ajuste post-hoc sobre pesos existentes, y hereda por tanto todas las limitaciones de un LLM de 2B.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | La del modelo base Qwen/Qwen3.5-2B (no detallada en la model card); incluye entrada de imagen funcional según las pruebas del autor |
| Parametros totales | ≈2.000 millones (2B), según el nombre del modelo base |
| Parametros activos | No aplica (no se indica que sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No se publican cuantizaciones precalculadas; el repositorio entrega pesos completos en safetensors. El tipo numerico exacto (fp16/bf16) no se confirma en la model card |
| Idiomas soportados | No disponible |
| Licencia | No disponible en el repositorio; el autor indica que se aplica la misma licencia que al modelo base Qwen/Qwen3.5-2B |
| Formato de pesos | safetensors (fichero único, pesos completos fusionados, standalone) |
| Tamano del repositorio | 10,3 GB |
| Nombre del fichero | `Qwen3.5-2B-Heretic_Winnougan.safetensors` |
| Uso previsto | Encoder de texto en ComfyUI (`ComfyUI/models/text_encoders`) |

## Arquitectura y entrenamiento

No hay entrenamiento desde cero: el punto de partida es Qwen/Qwen3.5-2B y el trabajo consiste en una ablación de direcciones de activación ("abliterated" / "decensored"). La herramienta empleada es Heretic v2 (dev) con Ablación de Rango Arbitrario (ARA). Heretic ejecuta una búsqueda Optuna que optimiza simultáneamente dos objetivos: minimizar los rechazos ante un conjunto de prompts dañinos y minimizar la divergencia KL respecto al modelo original ante prompts inocuos. Se exploraron 100 ensayos y se seleccionó el ensayo 31 de la frontera de Pareto por su mejor compromiso.

Los hiperparámetros del ensayo seleccionado son: `start_layer_index` = 9, `end_layer_index` = 18, `preserve_good_behavior_weight` = 0,8196, `steer_bad_behavior_weight` = 0,0028, `overcorrect_relative_weight` = 0,7214 y `neighbor_count` = 9. El resultado declarado es 2/100 rechazos (frente a 97/100 del modelo de partida) con una divergencia KL de 0,0583. La exportación se hizo fusionando la LoRA de abliteración en los pesos y exportando el modelo completo, de modo que el archivo es autónomo. No se documentan datos de entrenamiento adicionales, número de tokens, composición del dataset ni fases de RLHF/DPO, porque no hubo un entrenamiento de ese tipo.

## Capacidades

- Generación de texto coherente tras la ablación, según las pruebas del autor en ComfyUI.
- Descripción de imágenes: la entrada de imagen sigue funcionando y describe imágenes con precisión, lo que indica que la parte de visión sobrevivió a la ablación y a la fusión.
- Integración nativa en ComfyUI como encoder de texto Qwen3.5, sin renombrado de claves ni archivos de configuración extra.
- Eliminación del comportamiento de rechazo: no declina peticiones que el modelo original rechazaría (2/100 rechazos medidos con criterio de palabras clave).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (modo de pensamiento explícito, audio, etc.): no disponible en la información proporcionada.

## Casos de uso

- Generación de texto dentro de ComfyUI: el archivo se coloca en `ComfyUI/models/text_encoders` y se carga en cualquier nodo que acepte el encoder Qwen3.5-2B original, sustituyendo a este sin cambios en el grafo.
- Captioning y etiquetado de imágenes para datasets: dado que la entrada de imagen sigue operativa, puede usarse para generar descripciones de imágenes en flujos de preparación de datos, evitando rechazos en contenido que el modelo original bloquearía.
- Escritura creativa sin filtros: narrativa, guiones o diálogos con temáticas violentas, adultas o controvertidas que un modelo instruct al uso rechazaría por defecto.
- Prototipado local en GPU de consumo: con unos 4,2 GB en VRAM y ~35 tokens/s en una RTX 3070 Laptop (8 GB), sirve para iterar en flujos de trabajo sin depender de APIs externas.
- Investigación sobre alineación y abliteración: permite reproducir y auditar el efecto de la ablación comparando el mismo prompt y semilla entre el modelo de partida y esta variante.
- Presets y plantillas de prompt para la comunidad de ComfyUI: al no requerir renombrado de claves, reduce la fricción para publicar workflows reproducibles que incluyan el encoder.
- Experimentos de moderación y evaluación de seguridad: útil como caso de control con rechazos eliminados al medir clasificadores o políticas de contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (no hay MMLU, HumanEval, GSM8K ni similares). Las únicas métricas aportadas son las de abliteración, que no miden capacidad:

| Metrica | Modelo original (stock) | Este modelo | Notas |
|---|---|---|---|
| Rechazos (100 prompts) | 97/100 | 2/100 | Puntuación basada en palabras clave de rechazo |
| Divergencia KL | 0 (referencia) | 0,0583 | Medida sobre un conjunto limitado de prompts inocuos |

## Requisitos de hardware

- VRAM medida: aproximadamente 4,2 GB en VRAM durante la inferencia en una RTX 3070 Laptop GPU de 8 GB.
- Rendimiento medido: ~35 tokens/s en esa misma GPU, según el autor.
- Caben en GPU de consumo: sí, una RTX 3070 Laptop (8 GB) lo ejecuta; por tamano de pesos, es esperable que quepa en GPUs con 6-8 GB en precision completa y en muchas con 4 GB si se cuantiza (estimación, no confirmada por el autor).
- Estimaciones orientativas de VRAM (no verificadas por el autor): ~4-5 GB en fp16/bf16, ~2-2,5 GB en int8 y ~1,5 GB en 4 bits.
- GPUs recomendadas: no hay una lista publicada; la única referencia verificada es una RTX 3070 Laptop. GPUs de gama alta (A100, H100, RTX 4090) son sobredimensionadas para 2B, salvo por concurrencia o lotes grandes.
- Opciones de despliegue: ComfyUI de forma nativa (probado). En llama.cpp, Ollama, vLLM o TGI requeriría conversión previa a GGUF u otros formatos, y esa conversión no está documentada ni validada en la información disponible.
- Latencia: no disponible; solo se informa del throughput de ~35 tokens/s.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rechazos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-2B-Heretic) | ≈2B | No disponible | 2/100 | La del base (Qwen3.5-2B), términos no detallados | HuggingFace, safetensors en ComfyUI |
| Qwen/Qwen3.5-2B (modelo de partida) | ≈2B | No disponible | 97/100 | No disponible en la información | HuggingFace |
| Otros encoders abliterados de ~2B para ComfyUI | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones verificadas de alternativas comparables (por ejemplo, otras variantes abliteradas de Qwen3.5 o encoders de tamano similar orientados a ComfyUI), por lo que la comparación cuantitativa de rendimiento queda como no disponible.

## Limitaciones y advertencias

- La puntuación de rechazos es heurística y se basa en palabras clave: "2/100" significa que 2 de 100 prompts activaron una palabra clave de rechazo. Los rechazos suaves y los casos límite pueden escaparse en ambos sentidos.
- La divergencia KL se midió sobre un conjunto limitado de prompts inocuos: un valor bajo indica proximidad al modelo original en esos casos, no identidad en todos los dominios.
- Es un modelo de 2B: puede alucinar y cometer errores como cualquier LLM pequeno, con razonamiento y conocimiento factual limitados.
- No se recomienda usarlo como encoder de condicionamiento de texto en modelos de difusión de imagen o vídeo sin validación previa: esos modelos se entrenaron contra los estados ocultos del encoder original, por lo que los resultados pueden diferir. El autor aconseja comparar misma semilla y mismo prompt, stock frente a Heretic.
- El comportamiento puede variar entre versiones y flujos de ComfyUI.
- Se han eliminado los rechazos integrados: el modelo no declinará peticiones que el original sí rechazaría, lo que traslada la responsabilidad legal y ética al usuario.
- Licencia: el autor remite a la licencia del modelo base Qwen/Qwen3.5-2B, cuyos términos exactos no se detallan en esta ficha. Antes de un uso comercial hay que verificar esa licencia en la página del modelo base.
- No se documentan idiomas soportados, por lo que no hay garantía de calidad fuera de los idiomas que maneje el modelo base.
- El repositorio ocupa 10,3 GB aunque solo se documenta un fichero de pesos; conviene revisar el contenido real descargado.
- Modelo con 0 descargas y 1 like en el momento de la consulta: no hay validación comunitaria amplia ni reproducibilidad externa independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Winnougan/ComfyUI-Heretic-Uncensored-Text-Encoders
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- Heretic (herramienta de decensurado de p-e-w): https://github.com/p-e-w/heretic
- Guía de Warframe (Gift from the Lotus): https://wiki.warframe.com/w/Gift_from_the_Lotus (resultado no relevante para este modelo)
- Hilo de Reddit sobre Warframe: https://www.reddit.com/r/Warframe/comments/jpf82a/how_do_i_get_gift_of_lotus/ (resultado no relevante para este modelo)
- Otros resultados de la búsqueda web (Warframe Today, Warframe Fandom, r/Warframe): no relevantes para este modelo
- Paper técnico, blog del autor, demos o repositorio propio: no disponibles en la información proporcionada (el autor menciona YouTube, Patreon y Ko-fi, pero sin URL)
