# Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed

## Resumen

Qwen3.8-Flash-Next-MTPLX-Bare-Speed es un empaquetado cuantizado del modelo Qwen3.8-Flash-Next de Qwen (Alibaba), preparado por el usuario Youssofal para su ejecución nativa en Apple Silicon mediante MTPLX, un runtime de decodificación especulativa por predicción multi-token. El modelo base es una arquitectura de generación Qwen4 con MoE híbrido GDN (gated delta network), atención dispersa Qwen (QSA) y una memoria n-gram de 51.000 millones de parámetros, con 126.192.584.851 parámetros totales según los safetensors del repositorio y una ventana de contexto de 262.144 tokens.

La aportación de este pack no es un nuevo modelo, sino una distribución de pesos con cuantización plana de 4 bits (grupos de 64 pesos) para todos los expertos MoE y matrices densas, manteniendo en 16 bits las convoluciones GDN, los estados recurrentes, las normalizaciones, el indexador QSA y la cabeza MTP. La tabla n-gram de 32 GB se envía como sidecar separado y se transmite desde SSD, de modo que solo los pesos permanecen residentes en memoria. El resultado es la variante más rápida de Flash-Next para chat y código en Macs de 96 GB o más.

Es relevante ahora porque demuestra la viabilidad de servir un modelo de escala 125B-A6B en hardware de consumo de gama alta (MacBook Pro M4/M5 Max, Mac Studio M3/M4/M5) con velocidades medidas de 50-126 tok/s según la longitud del contexto, gracias a la decodificación especulativa con profundidad MTP adaptativa (techo 3) y a la compresión del estado KV mediante atención dispersa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE híbrido GDN con atención dispersa Qwen (QSA), cabeza MTP y memoria n-gram |
| Parametros totales | 126.192.584.851 |
| Parametros activos | 6B (denominación A6B del modelo base) |
| Longitud de contexto | 262.144 tokens |
| Tipos de cuantizacion | 4 bits plano con grupos de 64 pesos (expertos MoE y matrices densas); 16 bits en convoluciones GDN, estados recurrentes, normalizaciones, indexador QSA y cabeza MTP |
| Idiomas soportados | no disponible |
| Licencia | qwen-community-1.0 (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (MLX), con sidecar `ngram-table.safetensors` separado |

## Arquitectura y entrenamiento

El modelo base emplea una arquitectura MoE híbrida de la generación Qwen4 que combina capas GDN (gated delta network) con atención dispersa Qwen (QSA), lo que permite reducir el coste del estado KV en contextos largos. Incluye además una memoria n-gram de 51.000 millones de parámetros que actúa como tabla de embeddings de n-gramas, y una cabeza de predicción multi-token (MTP) que genera borradores de varios tokens por paso para la decodificación especulativa. Los parámetros totales ascienden a 126.192.584.851, con 6B activos por token.

No se dispone de información sobre el volumen de tokens de entrenamiento, la composición del dataset ni las etapas de alineación (RLHF/DPO) del modelo base en la información proporcionada. La innovación destacable de este pack es la integración del MTP nativo en la ruta especulativa de MTPLX: los borradores se aceptan mediante la regla de ratio de probabilidad más remuestreo residual, de modo que la salida sigue la distribución propia del modelo a cualquier temperatura. La cuantización es plana en 4 bits sin promociones selectivas, y la tabla n-gram se transmite desde SSD en lugar de residir en memoria.

## Capacidades

- Generación de texto conversacional y de código, con modo de razonamiento ("thinking") configurable.
- Decodificación especulativa multi-token con profundidad adaptativa (techo 3) y exactitud declarada frente a la ruta autoregresiva simple.
- Procesamiento de contextos muy largos: el autor reporta decodificación con prompts de 261.120 tokens y restauración de una conversación de 96.760 tokens desde caché de sesión en 8 ms.
- Capacidad de visión: la torre de visión se conserva en los pesos, aunque no se detalla su uso en el runtime.
- Integración con herramientas de agentes y edición de código: los benchmarks mencionan OpenCode y Claude Code como flujos de trabajo soportados.
- Memoria n-gram de 51.000 millones de parámetros para recuperación de secuencias.
- Capacidades multilingües: no disponibles en la información proporcionada.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.

## Casos de uso

- Asistencia de código en local sobre Mac: el pack está medido con OpenCode y Claude Code, con 125,8 tok/s en una petición de 18.539 tokens de prompt (18.364 servidos desde caché) y 61,8 tok/s en un turno de 109k tokens, lo que lo hace adecuado para agentes de edición de código que iteran sobre repositorios medianos.
- Refactorización y generación de proyectos completos: el autor reporta generaciones completas de 45k a 56k tokens (por ejemplo, un Flappy Bird con esfuerzo xhigh) a 66,8 tok/s por turno completo, un escenario típico de generación de código extenso en una sola pasada.
- Conversaciones largas con contexto persistente: la restauración de una conversación de 96.760 tokens en 8 ms desde la caché de sesión permite reanudar sesiones de chat o de trabajo sin reprocesar el prompt.
- Análisis de documentos extensos: con 262.144 tokens de ventana y decodificación viable a 200k tokens (50,3 tok/s), se pueden resumir o consultar contratos, informes o bases de código de gran tamaño en una sola pasada.
- Desarrollo asistido en estación de trabajo Mac Studio: el pico de 78 GiB en servicio encaja en configuraciones de 96 GB o más, lo que permite mantener el modelo residente durante toda la jornada laboral sin depender de la nube.
- Prototipado de agentes multi-paso sin conexión: la combinación de MTP especulativo, tool calling del modelo base (si está expuesto por el runtime) y ejecución local permite construir bucles de agente con privacidad de datos y sin coste por token.
- Evaluación de decodificación especulativa: la exactitud declarada a temperatura 1,0, top-p 0,95 y top-k 20 convierte el pack en una referencia práctica para comparar la ruta especulativa con la autoregresiva (75,9 frente a 47,0 tok/s en la misma tarea de código).

## Benchmarks y rendimiento

Mediciones del autor en MTPLX 2.11.3 (16 de septiembre de 2026) sobre MacBook Pro M5 Max de 128 GB, ventiladores al máximo, un solo flujo, servidor real (`mtplx serve`), muestreo con temperatura 1,0, top-p 0,95 y top-k 20:

| Ejecución | tok/s |
|---|---|
| Petición OpenCode en el pack Optimized Speed: 1.301 tokens generados, prompt de 18.539 tokens (18.364 desde caché), profundidad MTP 3 | 125,8 |
| Prompt de código de 9k tokens, 1.500 tokens generados, sampler con semilla, thinking off | 79,3 |
| Turno OpenCode de 109k tokens, media de dos ejecuciones | 61,8 |
| Turno OpenCode de 200k tokens, en caliente, media de dos ejecuciones | 50,3 |
| Generaciones completas de 45k a 56k tokens (Flappy Bird, effort xhigh), turno completo | 66,8 |
| Tarea de código con decodificación especulativa MTP (por defecto) | 75,9 |
| Misma tarea con decodificación autoregresiva simple | 47,0 |

Multiplicador especulativo declarado: 1,6x en la ruta de servicio del producto. Exactitud: mil extracciones de cuatro tokens por la ruta rápida coinciden con mil de la ruta simple dentro del ruido de esta última, en todas las longitudes conjuntas, con la configuración de muestreo oficial. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- Memoria unificada: 96 GB o más. El autor recomienda MacBook Pro M4 Max y M5 Max de 128 GB, y Mac Studio M3 Ultra, M4 Max y M5 Max.
- Pesos residentes: aproximadamente 74 GB más el working set, con la tabla n-gram de 32 GB transmitiéndose desde SSD.
- Pico durante el servicio: 78 GiB.
- Descarga: 106,3 GB (incluye la tabla n-gram de 32 GB).
- GPU dedicadas (A100, H100, RTX 4090): no soportadas por este pack, que depende de MLX y Apple Silicon; no disponible para CUDA.
- Cabe en GPU de consumo: no aplica; requiere un Mac con memoria unificada de 96 GB o superior.
- Despliegue: runtime MTPLX (app de Mac o `pip install mtplx` y `mtplx serve --model Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed`). No se indica compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Throughput y latencia: 75,9 tok/s con MTP frente a 47,0 tok/s sin él en una tarea de código; 50,3 tok/s a 200k tokens de contexto; 8 ms para restaurar 96.760 tokens desde caché de sesión.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Cuantización / formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-MTPLX-Bare-Speed | 126,2B totales, 6B activos | 262.144 | 4 bits plano, safetensors MLX | qwen-community-1.0 | Hugging Face, runtime MTPLX |
| Qwen3.8-Flash-Next-MTPLX-Optimized-Speed (mismo autor) | 126,2B totales, 6B activos | 262.144 | Cuantización dinámica con atención de 8 bits | qwen-community-1.0 | Hugging Face, runtime MTPLX |
| Qwen/Qwen3.8-Flash-Next (modelo base) | 126,2B totales, 6B activos | 262.144 | Pesos originales sin cuantizar | qwen-community-1.0 | Hugging Face |

La variante Optimized Speed del mismo autor ofrece mayor calidad a costa de velocidad, según la model card. No se dispone de datos de rendimiento del modelo base sin cuantizar ni de alternativas de otros fabricantes en la información proporcionada.

## Limitaciones y advertencias

- Dependencia exclusiva de Apple Silicon y del runtime MTPLX: no es desplegable en CUDA, vLLM, llama.cpp, Ollama ni TGI según la información disponible.
- Requisito de memoria muy alto (96 GB de memoria unificada, 78 GiB de pico), lo que excluye la mayoría de equipos de consumo.
- La cuantización plana de 4 bits sin promociones selectivas implica una pérdida de calidad frente al modelo base y frente al pack Optimized Speed; el propio autor recomienda este último si se prioriza la calidad.
- La tabla n-gram se transmite desde SSD, por lo que el rendimiento depende de la velocidad del almacenamiento y del estado de la caché.
- Riesgo de alucinación inherente a los modelos de lenguaje: no se han publicado evaluaciones de fidelidad en la información disponible.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede confirmar el soporte del castellano ni de otras lenguas.
- Licencia qwen-community-1.0: es necesario revisar sus términos para uso comercial, ya que la model card la etiqueta como "other" y no se detallan las restricciones en la información disponible.
- Las cifras de rendimiento proceden del autor y de un único equipo (M5 Max de 128 GB); no hay verificación independiente en la información disponible.
- La exactitud de la decodificación especulativa se declara frente a la ruta simple del mismo runtime, no frente a una implementación de referencia externa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Bare-Speed
- Variante Optimized Speed: https://huggingface.co/Youssofal/Qwen3.8-Flash-Next-MTPLX-Optimized-Speed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Runtime MTPLX: https://mtplx.com
- Benchmarks de MTPLX: https://mtplx.com/benchmarks/
- Notas de la versión 2.11.3: https://mtplx.com/releases/2.11.3/
- Guía para ejecutar Qwen 3.8 Flash Next en Mac: https://mtplx.com/models/qwen3.8-flash-next/
- Licencia: LICENSE (incluida en el repositorio de Hugging Face)
