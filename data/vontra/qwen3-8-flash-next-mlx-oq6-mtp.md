# Vontra/Qwen3.8-Flash-Next-MLX-oQ6-MTP

## Resumen

Qwen3.8-Flash-Next-MLX-oQ6-MTP es una conversión comunitaria a formato MLX del modelo Qwen/Qwen3.8-Flash-Next, publicada por el usuario Vontra (con referencias a TensorFold en la model card). Se trata de una cuantización mixta de 6 bits (denominada oQ6) generada directamente desde el checkpoint oficial en BF16, preservando el bloque nativo de predicción multi-token (MTP) que el modelo original incluye para decodificación especulativa. El objetivo es hacer viable la inferencia de un modelo de gran tamaño en hardware Apple Silicon mediante el framework MLX.

El modelo subyacente es un MoE disperso de tipo vision-language con arquitectura `qwen4_exp`, que combina Gated DeltaNet, Qwen Sparse Attention, flujos residuales con gating, embeddings hasheados de n-gramas (bigramas y trigramas) y un bloque MTP nativo. Según los datos de la model card, el modelo de lenguaje tiene 125B parámetros totales con 6B activos, a los que se suman 51B parámetros de embeddings de n-gramas; el repositorio declara 179.999.981.459 parámetros totales en safetensors y un tamaño de 158,1 GB repartido en 31 shards.

Su relevancia actual radica en que permite ejecutar un modelo de escala frontier (contexto configurado de 262.144 tokens, capacidades multimodales imagen-texto) en equipos Apple Silicon con memoria unificada, algo impensable con los pesos BF16 originales. La decodificación especulativa con el bloque MTP incluido aporta aceleraciones medibles: la model card reporta entre 28,3 y 36,6 tokens/s en un Apple M3 Studio con MTP activo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `qwen4_exp` vision-language sparse MoE (Gated DeltaNet + Qwen Sparse Attention + residuales con gating + embeddings hasheados de n-gramas + bloque MTP nativo) |
| Parametros totales | 179.999.981.459 (según safetensors); desglose upstream: 125B LM + 51B embeddings de n-gramas |
| Parametros activos | 6B (LM); 512 expertos enrutados, 10 activos + 1 compartido |
| Longitud de contexto | 262.144 tokens (configurado) |
| Tipos de cuantizacion | oQ6 mixed precision: base afín de 6 bits con 232 módulos protegidos o sobrescritos a 6/8 bits; group size 32 |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (Qwen Community License 1.0) |
| Formato de pesos | MLX safetensors (3.747 tensores, 31 shards, 158,07 GB / 147,21 GiB) |

## Arquitectura y entrenamiento

La arquitectura del modelo base combina varias innovaciones: capas de Gated DeltaNet (atención lineal con estado recurrente), Qwen Sparse Attention, capas MoE dispersas con 512 expertos enrutados (10 activos más 1 compartido), flujos residuales anchos con gating y tablas de embeddings hasheados de bigramas y trigramas de 51B parámetros. El modelo de lenguaje consta de 48 capas, hidden size de 2.560, 24 cabezas de atención y 2 cabezas KV. Incluye además un bloque nativo de predicción multi-token (MTP) para decodificación especulativa, que en esta conversión se preserva íntegro (76 tensores MTP convertidos).

Sobre el entrenamiento del modelo original no se proporciona información en la documentación disponible: no se detallan el número de tokens, la composición del dataset ni si hubo fases de RLHF o DPO. La model card remite a la model card oficial de Qwen para los detalles de evaluación upstream, uso previsto y limitaciones.

La conversión de Vontra aplica una asignación de precisión guiada por sensibilidad, medida con un proxy local validado de 4 bits, con base de 6 bits y 232 módulos protegidos o sobrescritos. El group size de 32 se eligió para soportar las tablas de embeddings hasheados de n-gramas de 160 de ancho. Se realizó validación estructural de los 3.747 tensores y los 31 shards, validación del bloque MTP (una capa draft configurada) y pruebas de generación en vivo que cubrieron completado determinista, chat con instrucción exacta, chat conversacional, telemetría MTP y rollback de caché.

## Capacidades

- Generación de texto conversacional y completado de instrucciones, validado en pruebas en vivo con oMLX sobre Apple M3 Studio.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con el procesador de visión upstream preservado.
- Razonamiento multi-turno con ventana de contexto de 262.144 tokens.
- Decodificación especulativa mediante el bloque MTP nativo, con tasas de aceptación de draft del 70,8 % al 84,2 % en las pruebas reportadas.
- Soporte de plantilla de chat y tokenizador upstream preservados.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.

## Casos de uso

- Asistentes conversacionales locales en Apple Silicon: el modelo puede mantener conversaciones multi-turno con contexto muy largo (262.144 tokens) ejecutándose íntegramente en un equipo con memoria unificada, sin depender de APIs externas, gracias al formato MLX y a la cuantización de 6 bits.
- Análisis de documentos extensos con imágenes: al ser un modelo vision-language con contexto de 262K tokens, permite procesar informes, contratos o artículos con figuras y tablas en una sola pasada, extrayendo información cruzada entre texto e imagen.
- Prototipado e investigación en entornos macOS: investigadores que trabajan en Mac pueden evaluar un MoE de escala frontier con 6B parámetros activos sin acceso a clústeres de GPU, usando oMLX o MLX-VLM.
- Generación asistida con baja latencia percibida: la decodificación especulativa MTP, con 28-37 tokens/s en M3 Studio, hace viable la escritura asistida interactiva y el autocompletado en herramientas de desarrollo locales.
- Procesamiento por lotes de contenido multimodal en estaciones de trabajo: digitalización y resumen de archivos escaneados o capturas con descripción textual, aprovechando la ventana de contexto para agrupar varios documentos por petición.
- Evaluación comparativa de cuantizaciones: sirve como referencia para medir el impacto de la cuantización oQ6 frente a los pesos BF16 originales en tareas de generación determinista, ya que la model card documenta pruebas reproducibles con salidas idénticas entre ejecuciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La model card únicamente reporta mediciones de velocidad de inferencia en un Apple M3 Studio con MTP nativo activado en oMLX:

| Prueba | Tokens de salida | Velocidad |
|---|---:|---:|
| Completado bruto, precalentado | 32 | 29,6 tokens/s |
| Chat con instrucción exacta | 27 | 28,3 tokens/s |
| Chat casual | 68 | 36,6 tokens/s |

Como referencia de escala (no atribuible a MTP), la model card cita que el backbone oQ6 anterior sin MTP alcanzó 23,1 tokens/s en una prueba corta con MLX, 21,1 tokens/s en una respuesta de 142 tokens y 19,5 tokens/s en una respuesta precalentada de 512 tokens en oMLX sobre el mismo equipo.

## Requisitos de hardware

- VRAM/memoria unificada estimada: el repositorio pesa 158,07 GB (147,21 GiB); se necesita un equipo Apple Silicon con memoria unificada suficiente para cargar los pesos más el estado de caché KV para el contexto utilizado. Con 262.144 tokens de contexto, el consumo adicional de caché puede ser considerable.
- GPU recomendadas: Apple Silicon de gama alta con memoria unificada amplia (la model card valida en un Apple M3 Studio). No hay datos de funcionamiento en GPU NVIDIA o AMD.
- Cabe en GPU de consumo: no en el sentido habitual; requiere memoria unificada de Apple Silicon muy alta. No hay datos de ejecución en RTX 4090 u otras GPU de consumo.
- Opciones de despliegue: oMLX o MLX-VLM con soporte explícito de MTP nativo `qwen4_exp`. Los runtimes estándar que no construyan el módulo MTP de Qwen4Exp pueden rechazar los 76 tensores MTP durante la carga estricta de pesos. No se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: 28,3-36,6 tokens/s en Apple M3 Studio con MTP activo, según las pruebas reportadas. Los resultados varían con la longitud del prompt, el estado de caché, los parámetros de muestreo, la versión del runtime y la presión de memoria.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MLX-oQ6-MTP (este) | 180B totales (6B activos LM) | 262.144 | MLX safetensors, 6 bits | qwen-community-1.0 | Hugging Face, comunidad |
| Qwen/Qwen3.8-Flash-Next (base) | 125B LM + 51B n-gramas | 262.144 | BF16 | qwen-community-1.0 | Hugging Face, oficial |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

La información proporcionada no incluye datos de rendimiento comparativo con otros modelos, por lo que no es posible establecer una comparación cuantitativa más allá de la relación con el checkpoint base del que deriva esta conversión.

## Limitaciones y advertencias

- Es una conversión comunitaria, no una versión oficial de Qwen; el soporte y la validación corren a cargo del autor de la conversión.
- Requiere un runtime con soporte explícito de MTP nativo `qwen4_exp` (oMLX o MLX-VLM). Los runtimes estándar pueden fallar al cargar los 76 tensores MTP.
- No se debe acoplar un drafter Qwen3.8 27B a este modelo: Flash Next tiene dimensiones ocultas distintas y ya incluye su propio bloque MTP compatible.
- La cuantización de 6 bits introduce pérdida de precisión respecto al BF16 original; no se han publicado evaluaciones de calidad comparativas entre ambas versiones.
- Riesgo de alucinación: no cuantificado en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; la cobertura multilingüe no está documentada.
- Licencia Qwen Community License 1.0: es necesario revisar sus términos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- El tamaño de 158 GB limita el despliegue a equipos con memoria unificada muy alta; no es viable en GPU de consumo convencionales.
- El rendimiento medido corresponde a un único hardware (Apple M3 Studio); no hay datos de latencia en otros equipos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ6-MTP
- Modelo base oficial: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Blog de Qwen sobre Qwen3.8 Flash Next: https://qwen.ai/blog?id=qwen3.8-flash-next
- Portal de Qwen: https://qwen.ai/
- MLX-VLM (repositorio): https://github.com/ml-explore/mlx-vlm
- Licencia Qwen Community License 1.0: https://huggingface.co/Vontra/Qwen3.8-Flash-Next-MLX-oQ6-MTP/blob/main/LICENSE
- TensorFold: https://tensorfold.dev
