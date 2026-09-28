# stardude1/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking-mlx-4Bit

## Resumen

`stardude1/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking-mlx-4Bit` es una conversión a formato MLX con cuantización de 4 bits del modelo `DavidAU/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking`, generada con mlx-lm 0.31.2. Es, por tanto, un derivado de segunda generación: el trabajo de ajuste lo firma DavidAU y stardude1 se limita a reconvertir los pesos para que el modelo se ejecute de forma nativa en Apple Silicon. Cuenta con 4.205.751.296 parámetros y un repositorio de 2,4 GB.

Partiendo de una base Qwen3.5-4B, el modelo original se somete a un proceso de "abliteration" con la herramienta Heretic, que elimina los mecanismos de rechazo del modelo alineado, y después a un ajuste fino con Unsloth sobre los conjuntos de datos internos "Deckard/PDK". El resultado es un modelo orientado a escritura creativa, ficción y roleplay sin filtros que conserva la modalidad image-text-to-text (visión) y el modo de razonamiento del Qwen3.5 original.

Su interés actual es doble. Por un lado, ocupa el nicho de los modelos locales sin censura en un tamaño que cabe en hardware de consumo. Por otro, la conversión MLX permite ejecutarlo en cualquier Mac con Apple Silicon sin GPU dedicada, algo que las conversiones para CUDA no ofrecen con la misma eficiencia en ese hardware.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (arquitectura `qwen3_5_text`), 32 capas, hidden size 2.560, atención GQA con 16 cabezas de consulta y 4 de clave/valor, FFN con tamaño intermedio 9.216 |
| Parametros totales | 4.205.751.296 (~4,2 mil millones) |
| Parametros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX 4-bit en este repositorio; el modelo original está en bfloat16 |
| Idiomas soportados | en (inglés), zh (chino) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors en formato MLX (generado con mlx-lm 0.31.2) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only denso de 32 capas con hidden size de 2.560 y atención con consultas agrupadas (16 cabezas de consulta frente a 4 de clave/valor), lo que reduce el consumo de memoria de la caché KV. Las capas feed-forward usan un tamaño intermedio de 9.216. El pipeline declarado es image-text-to-text, lo que indica que el modelo conserva la torre de visión de la familia Qwen3.5 y acepta imágenes además de texto, pese a que el repositorio solo distribuye los pesos en 4 bits.

En cuanto al entrenamiento, la información disponible describe el pipeline de la familia Deckard-Heretic: primero se aplica una "abliteration" con Heretic para eliminar los comportamientos de rechazo del modelo alineado; después se realiza un ajuste fino con Unsloth sobre cinco conjuntos internos "Deckard/PDK" centrados en carácter, inteligencia, profundidad, observación y punto de vista; y finalmente se emplea un dataset de destilación de Claude 4.6 Opus para acortar y estabilizar el razonamiento. Esta descripción aparece vinculada a la variante de 40B de la misma familia, por lo que no se puede confirmar que el modelo de 4B siguiera exactamente la misma secuencia. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO.

## Capacidades

- Generación de texto y razonamiento en modo "thinking" (pensamiento explícito antes de responder), heredado de la base Qwen3.5.
- Escritura creativa y de ficción en todos los géneros: narrativa, ciencia ficción, romance, etc.
- Generación de tramas y subtramas, y continuación de escenas a partir de un contexto dado.
- Roleplay conversacional multi-turno con personajes.
- Modalidad image-text-to-text: procesamiento conjunto de imagen y texto, según el pipeline declarado.
- Respuestas sin rechazo ni evasivas sobre temas que un modelo alineado declinaría, por efecto de la abliteration.
- Capacidades multilingües limitadas a inglés y chino.
- Soporte de tool calling / function calling: no disponible (no documentado en la información proporcionada).
- Soporte explícito de agentes o razonamiento multi-paso: no disponible (no documentado).

## Casos de uso

- Escritura de ficción por capítulos: el modelo puede mantener una voz narrativa consistente a lo largo de entregas sucesivas y generar prosa detallada, gracias al ajuste específico sobre datos de escritura creativa y "vivid prosing".
- Roleplay y narrativa interactiva: permite construir personajes con personalidad estable y sostener diálogos multi-turno sin las evasivas típicas de un modelo alineado, lo que resulta útil en videojuegos narrativos o plataformas de ficción interactiva.
- Generación de tramas y subtramas para guionistas: puede producir esquemas argumentales, giros y arcos secundarios a partir de una premisa breve, y después desarrollarlos en escenas.
- Continuación de escenas y "scene continue": útil como asistente de escritura en editores de texto, donde el autor escribe un fragmento y el modelo propone la continuación manteniendo el estilo previo.
- Prototipado local en equipos Apple Silicon: con 2,4 GB de pesos en 4 bits, permite desarrollar y evaluar aplicaciones de generación de texto en un Mac sin GPU dedicada, usando mlx-lm o LM Studio.
- Descripción creativa de imágenes: al conservar el pipeline image-text-to-text, puede generar pies de foto narrativos o descripciones literarias de una imagen, no solo descriptivas.
- Escritura asistida bilingüe inglés-chino: para equipos que redactan contenido en ambos idiomas y necesitan un asistente con registro creativo.
- Generación de diálogos para doblaje o audiolibros: ventana de contexto no confirmada, pero el modo de razonamiento permite mantener coherencia de registro por personaje en pasajes extensos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La única referencia cualitativa encontrada afirma que el modelo original "mejora significativamente el razonamiento y la generación de salida, superando al modelo base Qwen3.5-4B-Instruct en varios benchmarks", pero no se acompaña de cifras concretas ni de la metodología empleada, por lo que no puede verificarse.

## Requisitos de hardware

- VRAM/memoria estimada: aproximadamente 2,4 GB para los pesos en MLX 4-bit, más la caché KV y el overhead del runtime; en la práctica conviene disponer de 4-6 GB de memoria unificada libres. La versión original en bfloat16 requiere unos 8,4 GB.
- GPU recomendadas: al ser un formato MLX, está pensado para Apple Silicon (series M1, M2, M3 y M4). No es ejecutable directamente en CUDA.
- Compatibilidad con hardware de consumo: sí. Cabe en cualquier Mac con Apple Silicon y 8 GB de memoria unificada o más; con 16 GB se dispone de margen para contextos largos.
- Opciones de despliegue: mlx-lm (carga y generación vía Python o servidor), LM Studio y otras interfaces que consuman el formato MLX. No es compatible con vLLM, TGI ni llama.cpp sin una reconversión previa a otro formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Idiomas |
|---|---|---|---|---|---|
| Este modelo (mlx-4Bit) | 4,2B | no disponible | MLX 4-bit | apache-2.0 | en, zh |
| DavidAU/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking | 4,2B | no disponible | bfloat16 (safetensors) | apache-2.0 | en, zh |
| DavidAU/Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking | ~40B | no disponible | no disponible | no disponible | no disponible |
| Qwen3.5-4B-Instruct (modelo base alineado) | ~4B | no disponible | safetensors | no disponible | en, zh |

Los datos de rendimiento comparado (MMLU, HumanEval, GSM8K u otros) no están disponibles en la información proporcionada. La comparación con la familia de modelos sin censura de otros autores (Gemma 4 Heretic, Dolphin 3.0, Qwen 3.6 abliterated) se menciona en guías de terceros, pero sin cifras que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Modelo sin censura por diseño: la abliteration elimina los rechazos, de modo que puede generar contenido violento, sexual o controvertido sin filtro. Requiere moderación externa si se expone a usuarios finales.
- Riesgo de alucinación: no se han publicado evaluaciones de fidelidad factual, y el ajuste hacia escritura creativa puede aumentar la tendencia a inventar datos cuando se usa como asistente factual.
- Degradación potencial de capacidades generales: la abliteration y el ajuste sobre datos de ficción pueden reducir el rendimiento en tareas de razonamiento estructurado o matemáticas respecto al modelo base alineado.
- Contexto no documentado: se desconoce la longitud de contexto efectiva del modelo original, lo que impide planificar aplicaciones que dependan de ventanas largas.
- Idiomas limitados a inglés y chino: no hay soporte declarado de castellano, por lo que la calidad en español no está garantizada.
- Restricción de plataforma: el formato MLX solo se ejecuta en Apple Silicon. Para desplegar en servidores con GPU NVIDIA hay que recurrir al modelo original en bfloat16 o a una conversión GGUF.
- Licencia apache-2.0: permite uso comercial y modificación, pero no exime de responsabilidad sobre el contenido generado ni sobre el cumplimiento de las condiciones de uso de plataformas intermedias.
- Falta de validación comunitaria: el repositorio registra 0 descargas y 0 "likes", y la fecha de publicación es muy reciente, por lo que no existe verificación independiente de la fidelidad de la conversión a MLX ni de su calidad.
- Trazabilidad limitada del entrenamiento: no se documentan el número de tokens, la composición del dataset ni las fases de alineación del modelo de 4B, lo que dificulta auditar sesgos.

## Enlaces

- Repositorio del modelo: https://huggingface.co/stardude1/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking-mlx-4Bit
- Modelo base original: https://huggingface.co/DavidAU/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking
- Variante de 40B de la misma familia: https://huggingface.co/DavidAU/Qwen3.5-40B-Claude-4.6-Opus-Deckard-Heretic-Uncensored-Thinking
- Ficha en Featherless: https://featherless.ai/models/DavidAU/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking
- Grafo de arquitectura: https://hfviewer.com/DavidAU/Qwen3.5-4B-Deckard-HERETIC-UNCENSORED-Thinking
- Guía de modelos locales sin censura por tramo de VRAM: https://insiderllm.com/guides/best-uncensored-local-llms/
- Librería mlx-lm: https://github.com/ml-explore/mlx-lm
