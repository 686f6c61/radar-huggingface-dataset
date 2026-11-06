# yeowon/qwen3_forced_aligner_0.6b-RungOmega-MLX

## Resumen

`yeowon/qwen3_forced_aligner_0.6b-RungOmega-MLX` es una conversión cuantizada del modelo `Qwen/Qwen3-ForcedAligner-0.6B` de Qwen Team, publicada por el usuario yeowon. No es un modelo de reconocimiento de voz general, sino un alineador forzado: recibe un audio y su transcripción y devuelve las marcas temporales de inicio y fin de cada palabra o unidad. El artefacto empaqueta los pesos en formato MLX de 4 bits (grupo 64) para ejecución nativa en Apple Silicon, con el codificador de audio cuantizado a 8 bits en tiempo de carga.

La relevancia de esta ficha es doble. Por un lado, el modelo base cubre una necesidad concreta en pipelines de ASR: segmentar por límites de palabra en lugar de por cortes arbitrarios y eliminar palabras fantasma en tramos sin voz. Por otro, la variante Rung Omega demuestra una ruta de despliegue en hardware de consumo Apple sin dependencia de PyTorch, con un peso de 926,3 MB y una similitud coseno de pesos del 99,98 % respecto al original.

El modelo está especializado en coreano (`ko`) y su licencia es Apache-2.0, heredada del modelo base. El repositorio declara 410.436.480 parámetros reales en safetensors, pese a la nomenclatura "0.6B" del nombre original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con codificador de audio y decodificador de marcas temporales (modelo base Qwen3-ForcedAligner); cuantización MLX |
| Parametros totales | 410.436.480 (según safetensors del repo) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada; el modelo base declara soporte de hasta 5 minutos de audio por inferencia |
| Tipos de cuantizacion | 4 bits con grupo 64 en el decodificador; 8 bits en el codificador de audio (aplicado al cargar); pesos en MLX |
| Idiomas soportados | coreano (`ko`) en esta variante; el modelo base declara 11 idiomas |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors en formato MLX (librería `mlx`), cuantizado |

## Arquitectura y entrenamiento

El modelo base `Qwen3-ForcedAligner-0.6B` es un alineador forzado que combina un codificador de audio con un decodificador que emite tokens de marca temporal. La unidad temporal es de 80 ms mediante el token `151705`, con 5.000 clases de clasificación. El modelo base soporta inferencia unificada en streaming y offline con un único modelo, y predicción de marcas temporales para unidades arbitrarias en hasta 5 minutos de audio y 11 idiomas.

Esta variante concreta no aporta entrenamiento nuevo: es una conversión de pesos a MLX con cuantización de 4 bits (grupo 64) en el decodificador y 8 bits en el codificador de audio. El autor reporta una similitud coseno del 99,98 % respecto a los pesos originales, lo que indica una degradación numérica muy baja en la conversión. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni si hubo etapas de RLHF o DPO; estos datos no están disponibles en la documentación consultada.

La innovación técnica relevante es el empaquetado para Apple Silicon: el código de inferencia (`rung_runtime.py`) usa exclusivamente MLX, sin dependencia de PyTorch, lo que reduce el coste de despliegue en macOS.

## Capacidades

- Alineación forzada de audio y transcripción: devuelve inicio y fin de cada palabra con resolución de 80 ms.
- Predicción de marcas temporales para unidades arbitrarias dentro de hasta 5 minutos de habla (según el modelo base).
- Segmentación por límites de palabra, útil para evitar cortes a mitad de palabra en pipelines de ASR.
- Filtrado de palabras fantasma en tramos sin voz al final de una locución.
- Integración con el modelo de ASR `qwen3_asr_1.7b_ko-RungOmega-MLX` del mismo autor para transcripción y alineación conjuntas.
- Ejecución nativa en Apple Silicon mediante MLX, sin PyTorch.
- No dispone de tool calling, capacidades de agente, visión ni audio generativo: su función es exclusivamente la alineación.

## Casos de uso

- Subtitulado con marcas por palabra: dado un audio y su transcripción en coreano, el modelo genera los tiempos de inicio y fin de cada palabra, lo que permite construir subtítulos con resaltado tipo karaoke o sincronización fina.
- Postprocesado de pipelines ASR: tras una transcripción con Rung Omega ASR, la alineación permite dividir locuciones largas en segmentos por límite de palabra, evitando cortes a mitad de término.
- Limpieza de transcripciones: la alineación detecta y descarta palabras fantasma generadas en colas de audio sin voz, mejorando la calidad del texto final.
- Anotación de corpus lingüísticos: investigadores que necesitan marcas temporales a nivel de palabra en coreano pueden generar anotaciones automáticas y revisarlas manualmente, con un coste de inferencia bajo en un M1 Pro.
- Herramientas de accesibilidad: sincronización de texto con audio para lectores de subtítulos en tiempo real o para la revisión de transcripciones por personas con discapacidad auditiva.
- Edición de audio basada en texto: al conocer los límites temporales de cada palabra, se pueden aplicar cortes, silencios o correcciones directamente sobre el audio a partir de la transcripción.
- Aplicaciones de escritorio en macOS: integración en la app Talkit para transcripción en tiempo real en coreano, donde el modelo aporta la capa de alineación sobre el ASR.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. El autor sí reporta mediciones de rendimiento en hardware concreto:

| Metrica | Valor |
|---|---|
| Tiempo de alineación (audio TTS coreano de 6,1 s) | 0,78 s |
| Memoria maxima del conjunto ASR + alineador | 4.103 MB |
| Tiempo de carga | 2,7 s |
| Transcripcion de audio de 19,58 s | 2,42 s (RTF 0,123x) |
| Similitud coseno de pesos respecto al original | 99,98 % |
| Tamano del modelo | 926,3 MB |

Hardware de medida: Apple M1 Pro con 16 GB de memoria unificada.

## Requisitos de hardware

- VRAM/memoria: el modelo ocupa 926,3 MB en disco; en ejecución, el conjunto ASR más alineador alcanzó 4.103 MB de memoria máxima en un M1 Pro de 16 GB.
- GPU recomendadas: exclusivamente Apple Silicon con soporte MLX (series M1, M2, M3, M4). No está pensado para GPU NVIDIA ni AMD.
- Cabe en hardware de consumo: sí, en cualquier Mac con chip Apple Silicon y al menos 8 GB de memoria unificada, aunque el autor mide con 16 GB.
- Opciones de despliegue: MLX con el script `rung_runtime.py` del repositorio `muzuksazo/desktop-recorder`; la app Talkit para macOS; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: 0,78 s para alinear 6,1 s de audio; RTF de 0,123x en el conjunto ASR más alineador sobre un M1 Pro.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / audio | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| yeowon/qwen3_forced_aligner_0.6b-RungOmega-MLX | 410 M | hasta 5 min (modelo base) | coreano | Apache-2.0 | MLX safetensors cuantizado |
| Qwen/Qwen3-ForcedAligner-0.6B | no disponible | hasta 5 min | 11 idiomas | Apache-2.0 | safetensors originales |
| yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX | no disponible | no disponible | coreano | no disponible en la información | MLX cuantizado |

La comparación directa más relevante es con el modelo base: misma funcionalidad y licencia, pero la variante Rung Omega sacrifica portabilidad (solo Apple Silicon) a cambio de un tamaño reducido y ejecución sin PyTorch. Frente a la variante ASR del mismo autor, la diferencia es de tarea: el ASR transcribe y el alineador marca tiempos sobre una transcripción dada.

## Limitaciones y advertencias

- Exclusivo de Apple Silicon: requiere MLX y no funciona en GPU NVIDIA, AMD ni en CPU convencional.
- Dependencia de la transcripción: si el texto proporcionado difiere mucho del audio real, las marcas temporales serán incorrectas.
- Cobertura lingüística limitada en esta variante: solo coreano, aunque el modelo base declara 11 idiomas.
- Riesgo de alucinación de marcas: en tramos ambiguos o con ruido, la alineación puede asignar tiempos inconsistentes; conviene validar en producción.
- Sin datos públicos de benchmarks estándar ni de sesgos conocidos en la información consultada.
- Licencia Apache-2.0 permite uso comercial, pero se recomienda revisar las condiciones del modelo base y del código de inferencia del repositorio del autor.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que la validación comunitaria es inexistente.
- La model card incluye enlaces de donación y solicitudes de financiación; no afectan a la licencia, pero conviene separar el contenido técnico del promocional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yeowon/qwen3_forced_aligner_0.6b-RungOmega-MLX
- Modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B
- README del modelo base: https://huggingface.co/Qwen/Qwen3-ForcedAligner-0.6B/blob/main/README.md
- Codigo de inferencia `rung_runtime.py`: https://github.com/muzuksazo/desktop-recorder/blob/main/rung_runtime.py
- App Talkit (releases): https://github.com/muzuksazo/desktop-recorder/releases/latest
- Variante ASR del mismo autor: https://huggingface.co/yeowon/qwen3_asr_1.7b_ko-RungOmega-MLX
- Discusiones del modelo: https://huggingface.co/yeowon/qwen3_forced_aligner_0.6b-RungOmega-MLX/discussions
