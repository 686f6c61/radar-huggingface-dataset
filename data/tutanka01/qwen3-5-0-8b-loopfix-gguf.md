# Tutanka01/Qwen3.5-0.8B-loopfix-GGUF

## Resumen

Qwen3.5-0.8B-loopfix es una edición de pesos del modelo Qwen3.5-0.8B del equipo Qwen, publicada por el usuario Tutanka01 en Hugging Face. No se trata de un modelo entrenado desde cero ni de un fine-tuning: es una intervención quirúrgica sobre los pesos de las matrices `ffn_down` que modifica únicamente 131.072 parámetros (el 0,016 % del total) para eliminar el bucle de razonamiento que afecta al modelo original en modo thinking. El modelo base tiene 752.393.024 parámetros reales según safetensors y se distribuye en formato GGUF con cuantización Q8_0.

El problema que resuelve es concreto y está bien documentado por el autor: el Qwen3.5-0.8B original, cuando se le activa el modo thinking, tiende a reescribir su propio razonamiento indefinidamente ("Wait, I need to make sure...") hasta agotar el límite de tokens sin llegar a emitir respuesta. En una evaluación de 30 prompts conversacionales en francés, el modelo original quedaba atrapado en bucle en el 56,7 % de los casos; tras la edición, ese porcentaje baja al 16,7 % y la tasa de respuesta sube del 43,3 % al 86,7 %. La relevancia actual es metodológica: demuestra a pequeña escala que la edición directa de pesos (weight-space programming) puede corregir comportamientos patológicos sin reentrenar.

La ficha debe leerse con la advertencia del propio autor: es un artefacto de investigación experimental, no un modelo para producción. No añade capacidades nuevas, solo elimina un obstáculo, y conserva la calidad propia de un modelo de 0,8B parámetros.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (modelo base Qwen3.5-0.8B; detalles de atención no disponibles en la información proporcionada) |
| Parámetros totales | 752.393.024 |
| Parámetros activos | No aplica (no es MoE según la información disponible) |
| Longitud de contexto | No disponible en la información proporcionada (la evaluación usó un límite de generación de 8192 tokens) |
| Tipos de cuantización | Q8_0 (único archivo publicado) |
| Idiomas soportados | Francés (fr), inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`Qwen3.5-0.8B-loopfix128-Q8_0.gguf`, 812 MB) |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-0.8B original. La intervención no implica entrenamiento alguno: no hay descenso de gradiente, ni datos de entrenamiento, ni RLHF/DPO adicional. El autor identificó, mediante análisis de activaciones, 128 neuronas MLP distribuidas entre las capas 14 y 23 que se activan exclusivamente cuando el modelo reinicia su razonamiento de forma patológica y permanecen inactivas durante el razonamiento sano, antes de `</think>` y en posiciones aleatorias. Para cada neurona seleccionada *j* de la capa *l*, se eliminó la dirección de "reinicio de pensamiento" *d_l* de su columna de salida en la matriz `ffn_down` mediante la operación `W_down[:, j] ← W_down[:, j] − (d_l · W_down[:, j]) d_l`.

Todos los demás tensores son idénticos byte a byte al GGUF Q8_0 de `unsloth/Qwen3.5-0.8B-GGUF`. El archivo puede reconstruirse bit a bit desde el GGUF original con los scripts del repositorio de GitHub del autor, y la lista de neuronas editadas está publicada en `edits/loopfix_q03_top128.json`. La innovación técnica es, por tanto, metodológica: una reproducción a pequeña escala de la idea de Weight-Space Programming aplicada a la supresión de un bucle de razonamiento. El modo thinking se activa mediante la plantilla de chat (`enable_thinking`), igual que en el modelo original.

## Capacidades

- Generación de texto conversacional en francés e inglés, con modo thinking activable mediante la plantilla de chat.
- Razonamiento en modo thinking con menor tasa de bucles: la edición reduce los bloqueos del 56,7 % al 16,7 % en la evaluación del autor.
- Respuesta efectiva: en los mismos 30 prompts, la tasa de respuestas completas pasa del 43,3 % al 86,7 %, con una mediana de 3412 tokens frente a los 8192 del original.
- Preservación del idioma: la puntuación de idioma se mantiene en 0,94 frente a 0,96 del original, según el autor.
- Compatibilidad con llama.cpp y LM Studio mediante GGUF y plantilla Jinja (`--jinja`).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades de visión: el proyector `mmproj` no está incluido y la edición no se probó con imágenes.
- Capacidades de audio: no disponible en la información proporcionada.

## Casos de uso

- Investigación en interpretabilidad y edición de pesos: el modelo sirve como caso reproducible para estudiar cómo una intervención del 0,016 % de los parámetros altera un comportamiento emergente como el bucle de razonamiento. El repositorio de GitHub incluye el método completo y los resultados en bruto.
- Evaluación de técnicas de supresión de bucles en modelos pequeños: permite comparar la edición de pesos frente a alternativas de muestreo (temperatura, top_p, top_k, presence penalty), que según el autor dejan todavía un 32 % de bucles en el modelo original.
- Prototipado de asistentes conversacionales en francés sobre hardware muy limitado: con 812 MB en Q8_0, el modelo cabe en cualquier equipo y permite iterar plantillas de chat y flujos de thinking sin infraestructura dedicada.
- Docencia y demostraciones de mecánica interna de transformers: la lista publicada de 128 neuronas editadas entre las capas 14 y 23 facilita explicar cómo se localizan circuitos asociados a comportamientos concretos.
- Pruebas de regresión de pipelines de inferencia GGUF: al ser reconstruible bit a bit desde el GGUF original, sirve para validar herramientas de cuantización, plantillas Jinja y motores como llama.cpp o LM Studio.
- Generación de texto ligera en entornos con restricciones de red o privacidad: al ejecutarse localmente con llama.cpp, no requiere enviar datos a servicios externos, aunque la calidad queda limitada por el tamaño del modelo.

## Benchmarks y rendimiento

Los únicos datos publicados son la evaluación del autor sobre 30 prompts conversacionales en francés, nunca usados para elegir la edición, con el muestreo por defecto de LM Studio, límite de 8192 tokens y la misma semilla para ambos modelos.

| Modelo | Pesos editados | Atrapado en bucle | Respondió | Mediana de tokens |
|---|---|---|---|---|
| Qwen3.5-0.8B Q8_0 (original) | 0 | 56,7 % | 43,3 % | 8192 |
| Qwen3.5-0.8B-loopfix Q8_0 | 131.072 (0,016 %) | 16,7 % | 86,7 % | 3412 |

La reducción de bucles es de −40 puntos (intervalo de confianza bootstrap del 95 %: [−60, −20]), y se mantiene tanto con system prompt de persona (60 % → 13 %) como sin él (53 % → 20 %). El autor indica explícitamente que no se ejecutaron benchmarks estándar de matemáticas, código ni MMLU/HumanEval/GSM8K. No se han publicado resultados de benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,8-1 GB para el archivo Q8_0 de 812 MB, más el overhead del contexto y del motor de inferencia.
- GPU recomendadas: cualquier GPU consumer con al menos 2 GB de VRAM; también funciona en CPU. No se dispone de datos de rendimiento en A100, H100 o RTX 4090 en la información proporcionada.
- Cabe en GPU consumer: sí, en cualquier modelo con 2 GB o más de VRAM (por ejemplo, GTX 1650, RTX 3050 en adelante), y en CPU.
- Opciones de despliegue: llama.cpp (`llama-cli -hf Tutanka01/Qwen3.5-0.8B-loopfix-GGUF --jinja`) y LM Studio (`lms get Tutanka01/Qwen3.5-0.8B-loopfix-GGUF`). No se mencionan vLLM, TGI ni Ollama en la información disponible.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Comportamiento en thinking | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.5-0.8B-loopfix (este) | 752.393.024 | No disponible | 16,7 % de bucles; 86,7 % de respuestas en la evaluación del autor | Apache 2.0 | GGUF Q8_0 en Hugging Face |
| Qwen3.5-0.8B (original) | 752.393.024 | No disponible | 56,7 % de bucles; 43,3 % de respuestas en la misma evaluación | Apache 2.0 | Pesos originales y GGUF de Unsloth |
| Qwen3.5-0.8B Q8_0 de Unsloth | 752.393.024 | No disponible | Idéntico al original (mismos pesos) | Apache 2.0 | GGUF Q8_0 en Hugging Face |

No se dispone de datos de benchmarks estándar ni de comparaciones con otros modelos de tamaño similar en la información proporcionada, por lo que la comparativa se limita a las variantes del mismo modelo base.

## Limitaciones y advertencias

- Elimina un obstáculo, no añade capacidad: las respuestas siguen teniendo la calidad de un modelo de 0,8B, con errores factuales y gramaticales y ocasionales respuestas en el idioma equivocado, un problema ya presente en el original.
- Evaluación muy pequeña: 30 prompts conversacionales en francés y una sola semilla. No se ejecutaron benchmarks de matemáticas, código ni estándar.
- Solo texto: el proyector de visión (`mmproj`) no está incluido y la edición no se probó con imágenes.
- Artefacto de investigación experimental: el autor indica explícitamente que no está pensado para uso en producción.
- Sesgos conocidos: no documentados en la información proporcionada; al heredar los pesos del Qwen3.5-0.8B, arrastra los sesgos del modelo base.
- Riesgo de alucinación: alto, coherente con un modelo de 0,8B; la edición no lo mitiga.
- Limitaciones de idioma: la model card declara francés e inglés; la evaluación se hizo únicamente en francés.
- Restricciones de licencia: Apache 2.0, la misma que el modelo base; permite uso comercial, pero la calidad y la naturaleza experimental del artefacto desaconsejan ese uso.
- El modo thinking requiere activarse mediante la plantilla de chat (`enable_thinking`) y un motor compatible con Jinja.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Tutanka01/Qwen3.5-0.8B-loopfix-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- GGUF Q8_0 original de Unsloth: https://huggingface.co/unsloth/Qwen3.5-0.8B-GGUF
- Repositorio con código, método y resultados: https://github.com/Tutanka01/qwen-weight-space-loopfix
- Artículo sobre Weight-Space Programming: https://rikiyat.github.io/blog/weight-space-programming/
