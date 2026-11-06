# trannhiem/TranNhiem-DeepCompression-Qwen3.6-35B-A3B

## Resumen

TranNhiem-DeepCompression-Qwen3.6-35B-A3B es una versión comprimida del modelo vision-language con mezcla de expertos Qwen3.6-35B-A3B, publicada por el usuario trannhiem en Hugging Face. La compresión aplica la receta Collaborative Deep Compression (CDC), que combina dos etapas: poda de expertos enrutados (de 256 a 240 por capa, sin reentrenamiento) y cuantización NVFP4 (pesos y activaciones de 4 bits) únicamente sobre los expertos enrutados. El resto de componentes (atención, experto compartido, router y torre de visión) permanece en bf16.

El resultado es una reducción del peso en disco de 67 GB a 22 GB (21,4 GiB en memoria de GPU frente a 65,5 GiB del original), con un aumento medido del 35% en throughput de peticiones de texto por lotes y un 49% más de capacidad de caché KV bajo el mismo presupuesto de memoria. Según el autor, la degradación frente al modelo original es de aproximadamente medio punto en MMLU y dentro del ruido en el resto de benchmarks evaluados.

La relevancia de esta ficha es doble: por un lado, documenta una técnica de compresión aplicable a modelos MoE multimodales; por otro, conviene señalar que la model card está marcada explícitamente como borrador (DRAFT) y contiene referencias pendientes (paper sin enlace, GIFs no publicados, mediciones de energía sin completar), lo que limita la verificabilidad de algunas afirmaciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE vision-language (Qwen3_5MoeForConditionalGeneration), 40 capas decoder con atención híbrida lineal + completa, top-8 routing más un experto compartido, tamaño intermedio de experto 512 |
| Parametros totales | 17.993.110.896 (según safetensors del repo); el nombre del modelo indica 35B-A3B, discrepancia no aclarada en la model card |
| Parametros activos | No disponible como cifra exacta; el nombre del modelo base indica "A3B" (aproximadamente 3B activos), sin confirmación numérica en la información proporcionada |
| Longitud de contexto | No disponible (la model card menciona una prueba de capacidad de caché KV a 32K de contexto, pero no declara la ventana máxima del modelo) |
| Tipos de cuantizacion | NVFP4 W4A4 en expertos enrutados (NVIDIA ModelOpt); bf16 en atención, experto compartido, router y torre de visión |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (librería transformers; tag 8-bit en Hugging Face) |

## Arquitectura y entrenamiento

El modelo base es un transformer MoE multimodal con 40 capas decoder que combinan atención lineal y atención completa, routing top-8 sobre expertos enrutados más un experto compartido, y un tamaño intermedio de experto de 512. Acepta entradas de texto, imagen y vídeo. Sobre esta arquitectura, la compresión CDC aplica dos pilares: poda de expertos y cuantización.

La poda (pilar A) puntúa cada experto enrutado por su contribución efectiva (peso del router multiplicado por el tamaño de su salida, promediado sobre los tokens enrutados a él). La calibración usa 256 conversaciones de texto y 256 conversaciones de imagen, multi-imagen y vídeo. Se eliminan los 16 expertos con menor puntuación por capa, sin reentrenamiento, reteniendo el 95% del peso de routing. La cuantización (pilar C) convierte los expertos enrutados restantes a NVFP4 (pesos y activaciones de 4 bits). El pilar B (clustering de pesos) no se aplicó porque requiere un kernel de tabla de búsqueda que vLLM no incluye. No se menciona en la información disponible ningún proceso de RLHF, DPO ni datos de entrenamiento adicionales: la compresión es post-hoc sobre el modelo base.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.6-35B-A3B.
- Comprensión de imágenes y multi-imagen (pipeline image-text-to-text).
- Comprensión de vídeo, con benchmark específico MVBench evaluado.
- Capacidades OCR y de lectura de documentos (OCRBench evaluado).
- Razonamiento sobre gráficos y diagramas (ChartQA, AI2D, MMMU, MMStar evaluados).
- Evaluación con modo "thinking" desactivado en los benchmarks presentados; no se detalla el comportamiento con thinking activado.
- Soporte de tool calling y function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Despliegue de un VLM MoE en una sola GPU Blackwell: la reducción a 21,4 GiB de pesos permite servir el modelo en un B200 o GB200 con tensor-parallel 1, liberando memoria para caché KV y aumentando la concurrencia.
- Procesamiento por lotes de documentos escaneados con OCR: el modelo mantiene OCRBench dentro del ruido respecto al original y el throughput de peticiones con imagen sube entre un 23% y un 36%, lo que abarata el coste por página en pipelines de digitalización.
- Análisis de vídeo a escala: aunque el throughput de vídeo se mantiene prácticamente igual (0,79 req/s), la mayor capacidad de caché KV (5,51 M tokens frente a 3,69 M) permite encolar más peticiones concurrentes de vídeo largo sin recargar el modelo.
- Asistentes conversacionales multimodales con contexto largo: la ganancia del 49% en capacidad de caché KV a 32K de contexto favorece conversaciones multi-turno con historial extenso e imágenes intercaladas.
- Servicio de inferencia con vLLM en producción: el modelo está pensado para el kernel nativo NVFP4 MoE de vLLM ≥ 0.30.1, lo que simplifica el despliegue estándar sin necesidad de kernels personalizados.
- Evaluación comparativa de técnicas de compresión: sirve como referencia práctica para investigadores que quieran medir el impacto de poda más cuantización en modelos MoE multimodales, con la cautela de que la model card es un borrador.
- Prototipado con presupuesto de memoria ajustado: frente a los 65,5 GiB del original, los 21,4 GiB permiten alojar el modelo junto con otros servicios en el mismo nodo, algo inviable con la versión bf16 en una sola GPU.

## Benchmarks y rendimiento

La model card presenta diferencias en puntos porcentuales frente al modelo bf16 original, medidas ítem a ítem, con thinking desactivado y media ± desviación estándar sobre 3 semillas de calibración de poda. No se aportan valores absolutos de los benchmarks, solo deltas.

| Benchmark | Delta vs. bf16 original (puntos porcentuales) |
|---|---|
| MMLU | −0,49 ± 0,19 |
| AI2D | −0,20 ± 0,18 |
| ChartQA | −0,35 ± 0,40 |
| MMBench | −0,25 ± 0,22 |
| MMMU | −0,71 ± 0,77 |
| MMStar | +0,58 ± 0,32 |
| OCRBench | −0,27 ± 0,25 |
| MVBench (vídeo) | +0,31 ± 0,27 |

Métricas de eficiencia medidas en una GPU GB200, tensor-parallel 1, vLLM 0.30.1rc1, utilización de memoria 0,85, media de 3 ejecuciones intercaladas con el modelo bf16 (64 peticiones, 256 tokens generados cada una):

| Métrica | bf16 base | Este modelo | Cambio |
|---|---|---|---|
| Peticiones de texto por lotes (req/s) | 8,97 | 12,12 | +35% |
| Peticiones con imagen por lotes (req/s, dos conjuntos) | 19,16 / 12,91 | 26,03 / 15,85 | +36% / +23% |
| Peticiones de vídeo por lotes (req/s) | 0,79 | 0,79 | ≈ |
| Decodificación single-stream (tokens/s) | 298 | 313 | +5% |
| Eficiencia energética (tokens por julio) | 12,8 | pendiente | no disponible |
| Pesos en memoria de GPU | 65,5 GiB | 21,4 GiB | −67% |
| Capacidad de caché KV con 32K de contexto | 3,69 M tokens | 5,51 M tokens | +49% |

El autor advierte que reevaluar un mismo checkpoint mueve estos benchmarks alrededor de 1 punto, por lo que las diferencias por debajo de esa cifra no se consideran significativas.

## Requisitos de hardware

- VRAM para inferencia: 21,4 GiB de pesos en GPU según la medición del autor; el repo ocupa 22,8 GB en disco.
- GPU recomendadas: NVIDIA Blackwell (B200 / GB200, sm100) para la ruta nativa W4A4 con vLLM ≥ 0.30.1. En generaciones anteriores de GPU no se probó el modelo según la model card.
- Compatibilidad con GPU de consumo: no confirmada. El requisito de kernel NVFP4 nativo apunta a Blackwell, por lo que no hay datos sobre RTX 4090 u otras GPU consumer.
- Opciones de despliegue: vLLM ≥ 0.30.1 (ruta nativa NVFP4 MoE). Con versiones anteriores de vLLM, los expertos caen a una ruta más lenta de solo pesos (medida por el autor, sin cifra publicada). No se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: 313 tokens/s en decodificación single-stream y 12,12 req/s en texto por lotes en una GB200 con tensor-parallel 1; el throughput de vídeo no mejora (0,79 req/s).

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TranNhiem-DeepCompression-Qwen3.6-35B-A3B | 17.993.110.896 según safetensors (nombre comercial 35B-A3B) | No disponible | Apache 2.0 | Hugging Face, vLLM ≥ 0.30.1 en Blackwell | Compresión CDC: poda a 240 expertos + NVFP4 en expertos enrutados |
| Qwen3.6-35B-A3B (base) | 35B totales, ~3B activos según nomenclatura | No disponible | Apache 2.0 | Hugging Face | Modelo original bf16, 67 GB en disco y 65,5 GiB en GPU; referencia de los deltas de benchmark |
| TranNhiem-DeepCompression-Gemma4-26B-A4B-it | No disponible | No disponible | No disponible | Hugging Face (release hermano) | Misma receta CDC aplicada a Gemma-4-26B; la poda se desarrolló primero en este modelo |
| Otras alternativas de la misma categoría | No disponible | No disponible | No disponible | No disponible | No se han proporcionado datos de otros modelos comparables |

## Limitaciones y advertencias

- La model card está marcada como DRAFT (2026-11-06) e incluye tareas pendientes: enlace al paper sin publicar, GIFs no disponibles, fila de energía sin completar y celdas de capacidad de contexto largo pendientes de medición. La verificabilidad de las afirmaciones es, por tanto, limitada.
- Existe una discrepancia entre el nombre del modelo (35B-A3B) y el recuento real de parámetros en safetensors (17.993.110.896); la model card no la explica.
- El formato NVFP4 requiere una GPU NVIDIA Blackwell y vLLM ≥ 0.30.1 para velocidad nativa. En versiones anteriores de vLLM se usa una ruta de solo pesos más lenta, y no se probaron otras generaciones de GPU.
- La poda de expertos se calibró con 256 conversaciones de texto y 256 multimodales; dominios alejados de esa distribución podrían degradarse más de lo que reflejan los benchmarks publicados.
- Los benchmarks se midieron con thinking desactivado; no hay datos sobre el comportamiento con el modo de razonamiento activado.
- El autor indica que reevaluar un checkpoint mueve los benchmarks alrededor de 1 punto, de modo que las diferencias pequeñas no son concluyentes.
- No se dispone de información sobre sesgos, riesgo de alucinación específico, idiomas soportados ni soporte de tool calling; estas limitaciones del modelo base no se detallan en la información proporcionada.
- Licencia Apache 2.0, que permite uso comercial, pero conviene verificar la licencia del modelo base Qwen3.6-35B-A3B en su propio repositorio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Release hermano (Gemma-4): https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Gemma4-26B-A4B-it
- Paper "Collaborative Deep Compression for Foundation Models": enlace pendiente de publicación según la model card (no disponible)
