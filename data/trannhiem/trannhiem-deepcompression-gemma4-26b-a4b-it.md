# trannhiem/TranNhiem-DeepCompression-Gemma4-26B-A4B-it

## Resumen

TranNhiem-DeepCompression-Gemma4-26B-A4B-it es una versión comprimida del modelo multimodal de mezcla de expertos Gemma-4-26B-A4B-it de Google, publicada por el usuario trannhiem. La compresión aplica la metodología Collaborative Deep Compression (CDC), que combina poda de expertos y cuantización NVFP4 de los expertos enrutados, manteniendo atención, MLP densa, router y torre de visión en bf16. El resultado reduce el peso en disco de 49 GB a 17 GB y el peso en memoria de GPU de 48,5 GiB a 17,3 GiB.

El modelo conserva la arquitectura MoE de 30 capas del original, con enrutamiento top-8 y un tamaño intermedio de experto de 704, pero retiene 120 de los 128 expertos por capa. Según la model card, la compresión mantiene el rendimiento dentro de aproximadamente un punto porcentual del original en ocho benchmarks, con mejoras de throughput del 29 % en decodificación por lotes y una eficiencia energética 1,46 veces superior.

Es relevante porque demuestra que es posible servir un modelo visión-lenguaje MoE de gran tamaño con kernels nativos FP4 en hardware Blackwell, reduciendo drásticamente los requisitos de memoria sin sacrificar capacidades multimodales. La licencia Apache 2.0 facilita su uso comercial, aunque el rendimiento nativo depende de una generación de GPU muy concreta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE con capacidades de visión, 30 capas decoder, enrutamiento top-8, tamaño intermedio de experto 704 |
| Parametros totales | 13.672.578.112 (según safetensors); la model card referencia el nombre comercial "26B-A4B" del modelo base |
| Parametros activos | No disponible de forma explícita; el modelo base se denomina A4B (aproximadamente 4B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 W4A4 en expertos enrutados; bf16 en atención, MLP densa, router y torre de visión |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento

El modelo parte de Gemma-4-26B-A4B-it, un transformer de mezcla de expertos con 30 capas decoder, enrutamiento top-8 y un tamaño intermedio de experto de 704, con entrada de texto, imagen y vídeo. Sobre esa base se aplican dos pilares de la metodología CDC. El primero es una poda de expertos consciente de multimodalidad: cada experto se puntúa por su contribución (peso del router multiplicado por el tamaño de su salida, promediado sobre los tokens enrutados a él), usando 256 conversaciones de texto y 256 de imagen, multiimagen y vídeo como calibración. Se eliminan los 8 expertos con menor puntuación por capa, quedando 120 de 128, sin reentrenamiento.

El segundo pilar cuantiza los expertos enrutados restantes a NVFP4 (4 bits en pesos y activaciones) mediante NVIDIA ModelOpt, mientras atención, MLP densa, router y torre de visión permanecen en bf16. La model card indica que los expertos toleran 4 bits en pesos y activaciones manteniéndose dentro de ±0,8 puntos del bf16 en ocho benchmarks, y que cuantizar también atención y MLP densa costaría entre 2 y 4 puntos y sería más lento en lote. No se aplicó el pilar de clustering de pesos porque requiere un kernel de tabla de búsqueda que vLLM no incluye y no mejora frente al simple ajuste al codebook. El modelo se sirve con kernels nativos NVFP4 MoE en vLLM ≥ 0.30.1 sobre GPU Blackwell (sm100).

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imágenes, multiimagen y vídeo (pipeline image-text-to-text).
- Razonamiento multimodal y respuesta a preguntas sobre contenido visual.
- Procesamiento de documentos con gráficos y tablas (evaluado en ChartQA y OCRBench).
- Capacidades de OCR y lectura de texto en imágenes (evaluado en OCRBench).
- Comprensión de vídeo (evaluado en MVBench).
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso

- Asistencia multimodal en atención al cliente: el modelo puede procesar capturas de pantalla, fotos de productos o documentos enviados por el usuario y responder preguntas sobre ellos, combinando texto e imagen en una misma conversación.
- Análisis de documentos con gráficos y tablas: gracias a su rendimiento en ChartQA y OCRBench, puede extraer y razonar sobre datos de informes financieros, facturas o dashboards escaneados.
- Moderación y descripción de contenido visual: puede generar descripciones y clasificar imágenes o vídeos en pipelines de revisión de contenido, aprovechando su comprensión de vídeo (MVBench).
- Procesamiento de vídeo a escala: su capacidad de entrada de vídeo permite resumir o etiquetar clips en flujos de vigilancia, análisis deportivo o archivo audiovisual.
- Extracción de información de formularios y documentos escaneados: combina OCR con razonamiento para estructurar datos a partir de imágenes de documentos.
- Despliegue en infraestructura Blackwell con requisitos de memoria reducidos: al ocupar 17,3 GiB de pesos en GPU, permite servir un modelo multimodal MoE en una sola GPU GB200 con mayor throughput por lote (12.557 tokens/s) y menor consumo (617 W en lote) que la versión bf16.
- Evaluación comparativa de técnicas de compresión: sirve como referencia reproducible para investigadores que estudien poda de expertos y cuantización FP4 en modelos multimodales.

## Benchmarks y rendimiento

La model card publica diferencias en puntos porcentuales frente al modelo bf16 original, medidas de forma pareada ítem por ítem y con media ± desviación estándar sobre 3 semillas de calibración de poda. No se publican valores absolutos de los benchmarks.

| Benchmark | Cambio vs. bf16 (puntos porcentuales) |
|---|---|
| MMLU | −0,74 ± 0,21 |
| AI2D | −0,42 ± 0,33 |
| ChartQA | −0,80 ± 0,17 |
| MMBench | −0,82 ± 0,09 |
| MMMU | +0,66 ± 0,70 |
| MMStar | +0,24 ± 0,40 |
| OCRBench | +0,27 ± 0,31 |
| MVBench (vídeo) | +0,13 ± 0,62 |

La model card advierte que reevaluar un mismo checkpoint mueve estos benchmarks alrededor de 1 punto, por lo que diferencias inferiores a esa cifra no son significativas.

Datos de eficiencia (una GPU GB200, tensor-parallel 1, vLLM 0.30.1rc1, mediana de 4 ejecuciones de 64 peticiones concurrentes × 512 tokens generados):

| Métrica | bf16 base | Este modelo | Cambio |
|---|---|---|---|
| Decodificación de un solo flujo (tokens/s) | 251 | 302 | +20 % |
| Decodificación por lotes, 64 peticiones (tokens/s) | 9.771 | 12.557 | +29 % |
| Latencia entre tokens, un flujo | 3,96 ms | 3,29 ms | −17 % |
| Tiempo hasta el primer token | 16 ms | 18 ms | ≈ |
| Potencia de GPU (lote) | 702 W | 617 W | −12 % |
| Eficiencia energética (tokens por julio) | 13,9 | 20,4 | 1,46× |
| Pesos en memoria de GPU | 48,5 GiB | 17,3 GiB | −64 % |

## Requisitos de hardware

- VRAM estimada para inferencia: 17,3 GiB de pesos en memoria de GPU, más el espacio necesario para la caché KV, que la model card no detalla.
- GPU recomendadas: NVIDIA Blackwell (B200 / GB200, sm100) para aprovechar los kernels nativos NVFP4 W4A4; el rendimiento nativo requiere vLLM ≥ 0.30.1.
- En GPU de generaciones anteriores: la model card indica que los expertos caen a una ruta más lenta de solo pesos y que no se probaron otras generaciones.
- ¿Cabe en GPU de consumo? No disponible; no se han publicado pruebas en GPU de consumo.
- Opciones de despliegue: vLLM ≥ 0.30.1 (ruta nativa NVFP4 MoE); compatible con transformers. Otras opciones como llama.cpp, Ollama o TGI no se mencionan.
- Latencia y throughput: 302 tokens/s en decodificación de un solo flujo, 12.557 tokens/s en lote de 64 peticiones, 3,29 ms de latencia entre tokens y 18 ms hasta el primer token en una GB200.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TranNhiem-DeepCompression-Gemma4-26B-A4B-it | 13.672.578.112 (según safetensors) | No disponible | Dentro de ~1 punto del bf16 base en 8 benchmarks; +29 % throughput por lote | Apache 2.0 | Hugging Face |
| google/gemma-4-26B-A4B-it (base bf16) | No disponible en la información | No disponible | Referencia de comparación; 48,5 GiB en GPU | No disponible en la información | Hugging Face |
| TranNhiem-DeepCompression-Qwen3.6-35B-A3B (modelo hermano) | No disponible | No disponible | No disponible | No disponible | Hugging Face |

No se dispone de datos de benchmarks absolutos ni de otros modelos comparables en la información proporcionada.

## Limitaciones y advertencias

- La model card está marcada como borrador (DRAFT) y pendiente de confirmar visibilidad tras un registro de patente; el enlace al paper aún no está disponible.
- El rendimiento nativo NVFP4 W4A4 requiere una GPU NVIDIA Blackwell (B200 / GB200) y vLLM ≥ 0.30.1; en versiones anteriores de vLLM los expertos usan una ruta más lenta de solo pesos, y otras generaciones de GPU no se han probado.
- La poda de expertos introduce pérdidas medibles de aproximadamente 0,75–0,8 puntos en MMLU, ChartQA y MMBench en todas las semillas; mantener 112 expertos costaría unos 3,6 puntos en MMMU, lo que indica sensibilidad al grado de poda.
- La calibración solo con texto oculta pérdidas de 3–5 puntos en benchmarks de imagen, por lo que el modelo está calibrado específicamente para tráfico multimodal; su comportamiento en dominios alejados de esa calibración no está documentado.
- No se han publicado datos sobre sesgos, riesgo de alucinación, cobertura idiomática ni longitud de contexto.
- La licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base de Google (Gemma) antes de desplegar en producción.
- El modelo tiene 0 descargas y 0 likes en el momento de la ficha, y fue creado y actualizado el mismo día; no hay validación independiente de los resultados.
- Los benchmarks se midieron con 3 semillas y una variabilidad de reevaluación de aproximadamente 1 punto, por lo que las diferencias pequeñas no deben interpretarse como mejoras reales.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Gemma4-26B-A4B-it)
- [Modelo base: google/gemma-4-26B-A4B-it](https://huggingface.co/google/gemma-4-26B-A4B-it)
- [Modelo hermano: TranNhiem-DeepCompression-Qwen3.6-35B-A3B](https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Qwen3.6-35B-A3B)
- Paper "Collaborative Deep Compression for Foundation Models": enlace pendiente de publicación según la model card.
