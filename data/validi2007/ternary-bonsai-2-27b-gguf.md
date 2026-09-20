# validi2007/Ternary-Bonsai-2-27B-gguf

## Resumen

Ternary Bonsai 2 27B es un modelo de lenguaje derivado de Qwen3.8-27B (27B, atención híbrida) cuyos pesos se han cuantizado a valores ternarios {−1, 0, +1} en todas las capas: embeddings, proyecciones de atención, proyecciones MLP y LM head. El resultado se distribuye en formato GGUF para llama.cpp con dos empaquetados propios, PTQ1_0 (5,95 GB, 1,75 bits por peso) y PQ2_0 (7,21 GB, 2,13 bits por peso), frente a los ~54 GB que ocuparía el modelo en FP16. El desarrollo corresponde a Prism ML (el repositorio de HuggingFace analizado es una resubida del usuario validi2007 con 0 descargas y 0 me gusta), y la arquitectura del modelo base no se modifica: atención híbrida con aproximadamente un 75 % de atención lineal, MLP SwiGLU, RoPE y RMSNorm, con 262K tokens de contexto.

La propuesta es llevar razonamiento completo de gama 27B a hardware de consumo: la model card declara una retención del 98,2 % de la inteligencia del modelo FP16, con una media de 84,78 puntos en 14 benchmarks en modo thinking, frente a 72,59 de una cuantización convencional IQ2_XXS (con menor huella) y a menos de 0,4 puntos de un UD-Q4_K_XL que ocupa el triple. Matemáticas se mantiene a medio punto del modelo completo (96,57), código al nivel del baseline (89,42) y tool calling agéntico en 74,92. Es relevante ahora porque demuestra que el régimen sub-4-bit puede conservar razonamiento, código y comportamiento agéntico sin recurrir a "escapatorias" de alta precisión dentro del modelo.

La innovación central es la combinación de pesos ternarios con rotación Hadamard por bloques (bloque 1024, signos ±1 fijos) plegada en los pesos almacenados: el runtime aplica la transformación equivalente sobre las activaciones, de modo que la rotación no cuesta bits ni tráfico de pesos extra. Los kernels para consumir estos empaquetados directamente se distribuyen en forks propios de llama.cpp (CUDA y Metal) y de MLX (Apple Silicon, iOS/macOS). La torre de visión, opcional, se sirve aparte como paquete mmproj Q8_0 de ~0,63 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer causal de atención híbrida (~75 % lineal / ~25 % atención completa), SwiGLU MLP, RoPE, RMSNorm; 64 bloques de lenguaje + 27 bloques de torre de visión |
| Parametros totales | 26.895.998.464 (~26,9B) según safetensors; la model card declara 27,36B totales (24,35B backbone de lenguaje + 2,54B embeddings/LM head + 0,46B torre de visión). Existe una discrepancia entre ambas cifras |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | 262K tokens (heredada del modelo base) |
| Tipos de cuantizacion | Ternaria g128: pesos {−1, 0, +1} con una escala FP16 por grupo de 128 pesos. Empaquetados PTQ1_0 (trits densos, 1,75 bits/peso, 5,95 GB) y PQ2_0 (cada trit en una ranura de 2 bits, 2,13 bits/peso, 7,21 GB). Coste efectivo global declarado: 1,72 bits/peso. La torre de visión se distribuye como mmproj Q8_0 (~0,63 GB) |
| Idiomas soportados | No disponible (la etiqueta del repositorio solo indica "conversational") |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (llama.cpp); existe un acompañante MLX 2-bit para Apple Silicon |

## Arquitectura y entrenamiento

El modelo conserva sin cambios la arquitectura del base Qwen3.8-27B: transformer causal con atención híbrida en la que aproximadamente el 75 % de las capas usa atención lineal y el 25 % restante atención completa, lo que permite sostener 262K tokens de contexto en dispositivos locales sin que el coste de atención se dispare. El backbone de lenguaje tiene 64 bloques y 24,35B parámetros; a ello se suman 2,54B en embeddings y LM head y 0,46B en una torre de visión de 27 bloques, opcional. El MLP es SwiGLU y se emplean RoPE y RMSNorm.

La parte diferencial es la representación de pesos. Cada peso toma un valor ternario y comparte una única escala FP16 por cada grupo de 128 pesos, lo que da un coste de almacenamiento de ~1,71 bits por peso (log₂3 ≈ 1,585 bits de información por trit más la escala amortizada); contando los pocos tensores que quedan por encima de la representación ternaria, el modelo completo se sitúa en 1,72 bits por peso, unas 9,3 veces menos que FP16. Antes de la asignación ternaria, cada matriz se transforma en bloques mediante una rotación Hadamard ortogonal (bloque 1024, signos ±1 fijos); la rotación se pliega en los pesos almacenados en tiempo de conversión y el runtime aplica la transformación equivalente sobre las activaciones. El archivo GGUF declara la rotación como metadato, de forma que un runtime que no implemente la transformación correspondiente rechaza cargar el modelo en lugar de producir resultados incorrectos. Los pesos empaquetados se consumen directamente por los kernels, nunca se expanden de vuelta a FP16.

No se detalla en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO sobre el modelo base; los datos publicados se centran en el proceso de cuantización posterior al entrenamiento (PTQ) y en su evaluación.

## Capacidades

- Generación de texto conversacional y razonamiento en modo thinking, con una media de 84,78 puntos en 14 benchmarks de este tipo según la model card.
- Razonamiento matemático prácticamente intacto respecto a FP16: 96,57 en la métrica de matemáticas reportada (medio punto por debajo del modelo completo).
- Generación de código al nivel del baseline: 89,42 en la métrica de código reportada.
- Tool calling y comportamiento agéntico: 74,92 en la métrica de tool calling agéntico, por encima del colapso típico de las cuantizaciones sub-4-bit convencionales.
- Soporte de contexto largo: 262K tokens, viable en local gracias al backbone de atención mayoritariamente lineal.
- Capacidad de visión opcional mediante el paquete mmproj Q8_0 (~0,63 GB) con una torre de visión de 27 bloques y 0,46B parámetros; se carga únicamente cuando hay entrada de imagen.
- Ejecución en CPU, CUDA y Metal a través del fork de llama.cpp, y en Apple Silicon mediante el fork de MLX y mlx-swift (iOS/macOS).
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Razonamiento y asistencia en portátil sin conexión: con 5,95 GB de pesos en PTQ1_0, el modelo cabe en un equipo de consumo y permite mantener un asistente de razonamiento local; la model card reporta ~47 tok/s en un Apple M5 Max.
- Generación de código en el puesto de desarrollo: al conservar el nivel de código del baseline (89,42) y soportar tool calling, puede integrarse en flujos de autocompletado, revisión de parches o generación de tests ejecutados localmente, sin enviar código propietario a servicios externos.
- Agentes multi-paso con herramientas: la métrica de tool calling agéntico (74,92) y el contexto de 262K permiten cadenas de razonamiento con varias llamadas a funciones manteniendo el historial completo dentro de la ventana.
- Análisis de documentos extensos y RAG: 262K tokens permiten ingerir contratos, informes técnicos o expedientes completos en una sola pasada, reduciendo la necesidad de troceado y de recuperación intermedia.
- Procesamiento de imágenes con el paquete mmproj: al cargar la torre de visión Q8_0 se pueden hacer tareas de OCR, descripción de capturas o extracción de información de diagramas, cargando los 0,63 GB adicionales solo cuando se requiere.
- Atención al cliente automatizada en infraestructura propia: conversaciones multi-turno con contexto largo y latencia baja en GPU única o en Apple Silicon, sin coste por token en la nube.
- Despliegue en aplicaciones iOS/macOS: mediante el fork de mlx-swift se puede empaquetar el modelo en una app nativa de Apple, con los pesos de 2 bits del acompañante MLX.
- Cálculo y verificación matemática asistida: dado que matemáticas es la métrica menos degradada (96,57), resulta adecuado para resolver y comprobar derivaciones paso a paso en entornos educativos o de ingeniería.

## Benchmarks y rendimiento

Los datos publicados se expresan como medias agregadas y por categoría, no como resultados de benchmarks individuales con nombre (no se aportan cifras de MMLU, HumanEval o GSM8K).

| Metrica | Ternary Bonsai 2 27B | IQ2_XXS (referencia) | UD-Q4_K_XL (referencia) | FP16 |
|---|---|---|---|---|
| Media de 14 benchmarks en modo thinking | 84,78 | 72,59 | ~85,2 (a menos de 0,4 puntos) | ~86,3 (valor derivado del 98,2 % declarado) |
| Matematicas | 96,57 (a menos de medio punto de FP16) | No disponible | No disponible | No disponible (baseline de referencia) |
| Codigo | 89,42 (nivel del baseline) | No disponible | No disponible | No disponible (baseline de referencia) |
| Tool calling agentico | 74,92 | No disponible | No disponible | No disponible |

Datos adicionales de rendimiento declarados: retención del 98,2 % de la inteligencia del modelo FP16, reducción de tamaño de ~9,3 veces frente a FP16 ideal y ~47 tok/s en un portátil con Apple M5 Max. El valor de FP16 de la tabla es una derivación aritmética a partir de la media y el porcentaje de retención declarados, no una cifra publicada como tal.

## Requisitos de hardware

- Tamaño de pesos: 5,95 GB en PTQ1_0 (1,75 bits/peso) o 7,21 GB en PQ2_0 (2,13 bits/peso). Tamaño ideal declarado: 5,8 GB a 1,72 bits/peso.
- Torre de visión: 0,63 GB adicionales (mmproj Q8_0) solo si se procesan imágenes.
- VRAM estimada para inferencia: los pesos caben holgadamente en 8 GB, pero a contextos muy largos habrá que sumar la memoria del KV cache, cuyo tamaño y precisión no se detallan en la información disponible; para aprovechar los 262K tokens se recomienda planificar con margen sobre una GPU de 24 GB o superior.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA soportada por el fork de llama.cpp (por ejemplo RTX 3090, RTX 4090, A100, H100) y GPU Apple con Metal. No se publican cifras de latencia por modelo de GPU.
- Cabe en GPU de consumo: sí, en tarjetas de 8-12 GB para contextos moderados, y en memoria unificada de Apple Silicon. La model card cita explícitamente un portátil Apple M5 Max a ~47 tok/s.
- También puede ejecutarse en CPU, según los backends declarados (llama.cpp: CUDA, Metal, CPU), sin datos de throughput en CPU.
- Opciones de despliegue: fork de llama.cpp de Prism ML con kernels ternarios para CUDA y Metal, fork de MLX para Apple Silicon y fork de mlx-swift para iOS/macOS. El repositorio incluye ejemplos probados de servido, benchmarking e integración. No hay información sobre compatibilidad con vLLM, TGI u Ollama; dado que se requieren kernels específicos para los empaquetados PTQ1_0/PQ2_0 y la transformación Hadamard, es previsible que los runtimes estándar no carguen estos archivos.
- Latencia y throughput: ~47 tok/s en Apple M5 Max (único dato publicado). Para CUDA y CPU no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tamano de pesos | Rendimiento (media de 14 benchmarks thinking) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Ternary Bonsai 2 27B (PTQ1_0) | 26,9B-27,36B | 262K | 5,95 GB (1,75 bits/peso) | 84,78 | Apache 2.0 | GGUF en HuggingFace + kernels en forks de llama.cpp y MLX |
| Ternary Bonsai 2 27B (PQ2_0) | 26,9B-27,36B | 262K | 7,21 GB (2,13 bits/peso) | No disponible por separado | Apache 2.0 | Igual que el anterior |
| IQ2_XXS del mismo base | No disponible | No disponible | Menor que PTQ1_0 (huella inferior a dos tercios) | 72,59 | No disponible | Cuantización convencional de llama.cpp |
| UD-Q4_K_XL del mismo base | No disponible | No disponible | Aproximadamente el triple (unos 18 GB) | ~85,2 | No disponible | Cuantización convencional de llama.cpp |
| Qwen3.8-27B en FP16 (modelo base) | ~27B | 262K | ~54 GB | ~86,3 (derivado) | No disponible en la informacion proporcionada | Pesos originales |
| Ternary-Bonsai-2-27B-mlx-2bit | 26,9B-27,36B | 262K | No disponible | No disponible | Apache 2.0 | MLX para Apple Silicon |

No se dispone de datos de otros modelos de la misma categoría fuera de la familia Bonsai/Qwen3.8-27B descrita en la model card.

## Limitaciones y advertencias

- El repositorio analizado (validi2007/Ternary-Bonsai-2-27B-gguf) es una resubida con 0 descargas y 0 me gusta; la model card y los recursos citados corresponden a Prism ML, por lo que conviene verificar la procedencia y la integridad de los pesos antes de usarlos en producción.
- Requiere los kernels ternarios y la transformación Hadamard del fork de llama.cpp (CUDA/Metal) o del fork de MLX. Un runtime que no implemente la rotación rechazará el archivo; no se garantiza funcionamiento en llama.cpp estándar, vLLM, TGI u Ollama.
- Los pesos empaquetados se consumen directamente y nunca se expanden a FP16, de modo que no hay una ruta de conversión trivial a otros formatos.
- Existe una discrepancia en el recuento de parámetros: 26.895.998.464 según safetensors frente a 27,36B declarados en la model card.
- El idioma o idiomas soportados no se declaran en la información disponible; Qwen3.8-27B es el base, pero no se especifica la cobertura multilingüe del derivado.
- Al ser una cuantización ternaria, cabe esperar merma en tareas no cubiertas por los 14 benchmarks reportados; la media agregada es 1,8 puntos inferior al FP16 de referencia, y la degradación no se documenta por tarea más allá de matemáticas, código y tool calling.
- Riesgo de alucinación inherente a los modelos generativos de razonamiento, especialmente en tool calling agéntico (74,92, la métrica más baja de las reportadas), donde una llamada mal formada puede romper una cadena de ejecución.
- La licencia del repositorio es Apache 2.0, pero no se detalla en la información disponible la licencia del modelo base Qwen3.8-27B ni la de los forks de llama.cpp/MLX, que deben verificarse por separado para uso comercial.
- No se publican datos sobre el KV cache (tamaño, precisión) a 262K tokens, dato crítico para dimensionar el despliegue.
- No hay resultados de benchmarks individuales con nombre (MMLU, HumanEval, GSM8K) ni comparaciones con modelos de otros fabricantes.

## Enlaces

- HuggingFace (repositorio analizado): https://huggingface.co/validi2007/Ternary-Bonsai-2-27B-gguf
- Acompañante MLX 2-bit: https://huggingface.co/prism-ml/Ternary-Bonsai-2-27B-mlx-2bit
- Sitio web de Prism ML: https://prismml.com
- Whitepaper: https://github.com/PrismML-Eng/Bonsai-demo/blob/main/bonsai-2-27b-whitepaper.pdf
- Demo y ejemplos (repositorio de referencia para ejecución): https://github.com/PrismML-Eng/Bonsai-demo
- Fork de llama.cpp con kernels ternarios (CUDA + Metal): https://github.com/PrismML-Eng/llama.cpp
- Fork de MLX (Apple Silicon): https://github.com/PrismML-Eng/mlx
- Fork de mlx-swift (iOS/macOS): https://github.com/PrismML-Eng/mlx-swift
- Discord de la comunidad: https://discord.gg/prismml

La búsqueda web realizada no devolvió enlaces relevantes sobre el modelo: los únicos resultados obtenidos apuntan a Canva y no guardan relación con esta ficha.
