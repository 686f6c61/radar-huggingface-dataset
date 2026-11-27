# watword-admin/Qwen3.5-9B-Base-MLX-4bit

## Resumen

Qwen3.5-9B-Base-MLX-4bit es una conversión a formato MLX con cuantización de 4 bits del modelo base (preentrenado, sin ajuste por instrucciones) Qwen3.5-9B-Base del equipo Qwen. La publica el usuario watword-admin y su propósito es muy concreto: disponer de un modelo base en Apple Silicon para puntuar texto en bruto mediante surprisal (la medida subyacente a la perplejidad), tarea para la que un modelo ajustado para chat produce cifras distorsionadas. El repositorio solo cambia el formato del modelo original; todos los pesos proceden de Qwen.

El modelo tiene 8.953.803.264 parámetros (aproximadamente 9 mil millones) y se distribuye en safetensors con cuantización afín de 4 bits y tamaño de grupo 64, lo que da una media de 4,501 bits por peso. El repositorio ocupa 5,1 GB. La conversión elimina el codificador de visión y la cabeza de predicción multi-token del modelo fuente, por lo que es estrictamente texto.

Su relevancia radica en la trazabilidad: el autor documenta versiones de herramientas, comandos exactos, hashes sha256 de todos los ficheros y una verificación de reproducibilidad bit a bit, además de una comparación empírica del coste de la cuantización de 4 bits frente al modelo en bf16. Es una pieza de infraestructura para investigación, no un modelo conversacional.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (familia Qwen3.5); detalles internos no disponibles en la informacion proporcionada |
| Parametros totales | 8.953.803.264 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits afín, group size 64 (4,501 bits por peso de media); el modelo base original está en bf16 |
| Idiomas soportados | en (inglés) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.5-9B-Base más allá de su pertenencia a la familia Qwen3.5. Esta conversión concreta no entrena ni afina nada: parte de la revisión `68c46c4b3498877f3ef123c856ecfde50c39f404` del repositorio Qwen/Qwen3.5-9B-Base y aplica `mlx_lm convert -q --q-bits 4` con los valores por defecto de mlx-lm (cuantización afín, group size 64). La conversión conserva el modelo de lenguaje y descarta el codificador de visión y la cabeza de predicción multi-token del modelo fuente.

El proceso se documenta con rigor inusual: herramientas empleadas (mlx 0.32.4, mlx-lm 0.32.2, transformers 5.20.2, Python 3.11.9, macOS 26.6.2, Apple M4), verificación de los sha256 de todos los ficheros fuente antes de convertir, y una prueba de reproducibilidad en la que dos conversiones independientes produjeron los 7 ficheros de salida byte a byte idénticos. Los ficheros del tokenizador son los originales de Qwen sin modificar; el chat template viaja dentro de `tokenizer_config.json` tal como lo publica el autor original. No se dispone de datos sobre volumen o composición del corpus de entrenamiento, ni sobre si el modelo base recibió RLHF o DPO.

## Capacidades

- Generación de texto y continuación de texto en bruto (modelo base, no ajustado por instrucciones).
- Puntuación de texto mediante surprisal por token y cálculo de perplejidad.
- Comparación de verosimilitudes entre secuencias de texto.
- Predicciones propias de un modelo preentrenado, útiles para investigación.
- Procesamiento exclusivamente de texto: no admite imágenes ni vídeo.
- No soporta de forma fiable tool calling, function calling ni razonamiento multi-paso orientado a agentes, al carecer de ajuste por instrucciones.
- Capacidad multilingüe limitada: la model card declara únicamente inglés.

## Casos de uso

- Evaluación de perplejidad de corpus: el modelo puntúa texto en bruto sin plantilla de chat, lo que evita la distorsión que introduce el ajuste conversacional en las métricas de lenguaje.
- Investigación en psicolingüística computacional: el surprisal por token permite modelar el coste de procesamiento humano de cada palabra en experimentos de lectura.
- Puntuación de candidatos en decodificación especulativa o reranking: al ser un modelo base, sus verosimilitudes son más limpias para comparar hipótesis de texto que las de un modelo de chat.
- Detección de anomalías textuales: textos con surprisal anómalamente alto o bajo pueden señalar contenido fuera de distribución o generado artificialmente.
- Desarrollo y depuración en Apple Silicon: sirve como referencia local en MLX para validar pipelines de inferencia antes de pasar a modelos mayores o a otras plataformas.
- Auditoría de cuantización: su comparación documentada frente a bf16 permite estudiar el impacto de los 4 bits en tareas de puntuación sensible a pequeñas diferencias de probabilidad.
- Filtrado y curación de datasets: puntuar grandes volúmenes de texto para descartar documentos de baja calidad o coherencia antes del entrenamiento.

## Benchmarks y rendimiento

La model card incluye una comprobación de surprisal sobre 2.026 palabras de *Treasure Island* (Project Gutenberg #120), puntuando 2.448 tokens tras descartar los 64 primeros. No es un benchmark estándar, sino una verificación de cordura.

| Modelo | Bits medios por token | Diferencia media por token frente a bf16 | Percentil 99 de la diferencia |
|---|---|---|---|
| Qwen3.5-9B-Base, bf16 (fuente sin cuantizar) | 3,165 | — | — |
| Este modelo (base, 4 bits) | 3,312 | 0,419 | 2,44 |
| mlx-community/Qwen3.5-9B-4bit (chat, 4 bits) | 3,472 | 0,637 | 3,94 |

La cuantización de 4 bits cuesta aproximadamente 0,15 bits por token frente al modelo base sin cuantizar en este pasaje. No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks estándar en la información disponible.

## Requisitos de hardware

- VRAM/unified memory estimada: el repositorio pesa 5,1 GB, por lo que la inferencia en 4 bits requiere del orden de 6-7 GB de memoria unificada, incluyendo overhead de ejecución.
- Plataforma objetivo: Apple Silicon (MLX). El autor lo validó en un Apple M4.
- GPU NVIDIA (A100, H100, RTX 4090): no es la vía soportada por este repositorio; requeriría convertir los pesos a otro formato.
- Cabe en GPU de consumo Apple con al menos 8 GB de memoria unificada; en el resto de ecosistemas no se distribuye en formato compatible.
- Despliegue: mlx-lm (versión probada 0.32.2). No se proporcionan pesos GGUF, por lo que llama.cpp u Ollama no son opciones directas sin conversión adicional. vLLM y TGI no soportan MLX.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Observaciones |
|---|---|---|---|---|---|
| Este modelo (Qwen3.5-9B-Base MLX 4-bit) | 8,95 B | no disponible | safetensors MLX 4 bits | Apache-2.0 | Modelo base, solo texto, orientado a surprisal |
| Qwen/Qwen3.5-9B-Base | 8,95 B | no disponible | safetensors bf16 | Apache-2.0 | Fuente sin cuantizar; referencia de precisión |
| mlx-community/Qwen3.5-9B-4bit | no disponible | no disponible | safetensors MLX 4 bits | no disponible | Convertido del modelo chat-tuned Qwen3.5-9B; peor ajuste al base en surprisal (0,637 bits/token de diferencia media) |

## Limitaciones y advertencias

- No es un modelo de chat ni sigue instrucciones de forma fiable; usarlo como asistente conversacional produce resultados deficientes.
- Solo texto: no procesa imágenes ni vídeo, pese a que el modelo fuente pudiera incluirlos.
- Solo inglés declarado; el rendimiento en otros idiomas no está garantizado.
- La comprobación de surprisal se basa en un único pasaje, una única plataforma y una única ejecución por modelo; no constituye un benchmark.
- El pasaje de prueba es una obra de dominio público famosa, probablemente presente en los datos de entrenamiento, lo que puede rebajar el surprisal de los tres modelos por igual.
- La cuantización de 4 bits introduce errores puntuales: la mayor diferencia observada en un token fue de 6,1 bits frente a bf16. Para comparaciones de diferencias pequeñas conviene validar contra bf16 con texto propio.
- Solo probado con mlx-lm 0.32.2 en Apple Silicon; el comportamiento en otras versiones o plataformas no está verificado.
- Riesgo de sesgos y alucinaciones inherente a un modelo base sin alineación; no se documentan evaluaciones de sesgo.
- Licencia Apache-2.0, que permite uso comercial, pero la conversión se ofrece tal cual y sin garantía.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/watword-admin/Qwen3.5-9B-Base-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.5-9B-Base/blob/main/LICENSE
- Conversión de referencia de la comunidad: https://huggingface.co/mlx-community/Qwen3.5-9B-4bit
- Librería MLX: https://github.com/ml-explore/mlx
- mlx-lm: https://github.com/ml-explore/mlx-lm
- Pasaje de verificación (*Treasure Island*, Project Gutenberg #120): https://www.gutenberg.org/ebooks/120
