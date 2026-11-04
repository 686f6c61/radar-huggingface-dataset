# ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit-e4o8

## Resumen

Qwen3.8-Flash-Next-mlx-4bit-e4o8 es una cuantización de precisión mixta del modelo multimodal Qwen/Qwen3.8-Flash-Next, publicada por el usuario ToPo-ToPo. Se distribuye en formato MLX para su ejecución en hardware Apple Silicon (familias M-series). La particularidad del artefacto es su esquema de cuantización selectiva: únicamente los expertos enrutados del componente MoE se reducen a 4 bits, mientras que el resto de capas lineales (atención, embeddings n-gram, expertos compartidos y router) permanecen en 8 bits, y el codificador visual se mantiene en bf16 sin cuantizar.

El modelo resuelve un compromiso práctico habitual en la inferencia local de modelos grandes: reducir el peso en disco y en memoria sin degradar en exceso capacidades sensibles a la cuantización, en este caso el uso de herramientas (tool calling) y el formato estructurado de las llamadas. Según la model card, esta variante mejora notablemente la fiabilidad del tool calling frente a una cuantización uniforme a 4 bits, a costa de un mayor tamaño (130 GiB) y una velocidad de generación algo inferior.

El modelo base es multimodal image-text-to-text, con 177.392.830.611 parámetros totales según los safetensors del repositorio (aproximadamente 177,4 mil millones). La ficha se limita a los datos publicados por el autor de la cuantización; no se dispone de información detallada sobre la arquitectura interna, el entrenamiento o los idiomas del modelo base en la información proporcionada.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con mezcla de expertos (MoE); el autor menciona expertos enrutados, expertos compartidos, router y embeddings n-gram, además de un componente de imagen |
| Parámetros totales | 177.392.830.611 (según safetensors del repo) |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | Precisión mixta: expertos enrutados a 4 bits (group size 32); resto de capas lineales a 8 bits (group size 32, router con group size 64); codificador de imagen en bf16 sin cuantizar. Media de 6,289 bits por peso |
| Idiomas soportados | no disponible (la evaluación del autor usa probes en japonés e inglés) |
| Licencia | qwen-community-1.0 (etiquetada como "other" en los tags) |
| Formato de pesos | safetensors en formato MLX (librería mlx) |

## Arquitectura y entrenamiento

La información disponible describe el modelo base como un transformer multimodal con mezcla de expertos, con un componente visual y otro de lenguaje. El autor de la cuantización detalla que los expertos enrutados corresponden a 144 módulos `switch_mlp.{gate,up,down}_proj`, y que existen además expertos compartidos, un router y embeddings n-gram. No se dispone de datos sobre el número de tokens de entrenamiento, la composición del dataset ni las técnicas de alineación (RLHF, DPO u otras) empleadas en el modelo original.

El proceso de cuantización sí está documentado: al no poder alojar los pesos bf16 (355 GB), el autor partió de la versión de 8 bits (revisión ac6a8c8) y recuantizó únicamente los expertos mediante `mx.dequantize` (8 bits, group size 32) seguido de `mx.quantize` (4 bits, group size 32), copiando el resto de pesos desde la versión de 8 bits. Este doble redondeo introduce un error adicional medido por el autor de +0,3 % frente a una cuantización directa desde bf16 (comparado en 64 expertos × 3 proyecciones de la capa 20). La herramienta empleada fue MLX 0.32.3. El autor incluye además un modelo drafter MTP para decodificación especulativa, aunque en esta cuantización apenas aporta ganancia de velocidad.

## Capacidades

- Generación de texto conversacional multi-turno.
- Comprensión de imagen y texto (pipeline image-text-to-text): descripción de imágenes y respuesta a preguntas sobre ellas.
- Tool calling / function calling, con especial énfasis del autor en la fiabilidad del formato de llamada en inglés y japonés.
- Razonamiento de varios pasos y uso de herramientas en escenarios de agente (evaluado con 20 escenarios de llamada de herramientas en dos idiomas).
- Capacidades multilingües: la evaluación del autor cubre japonés e inglés; el resto de idiomas no está documentado.
- Decodificación especulativa mediante un modelo drafter MTP externo (soporte en mlx-vlm 0.7.0 o superior).
- No se documentan capacidades de audio ni un modo de razonamiento explícito ("thinking") en la información disponible.

## Casos de uso

- Asistentes locales con tool calling en Apple Silicon: el modelo puede gestionar la selección y el formato de llamadas a funciones con una fiabilidad medida del 99 % en japonés y del 98 % en inglés, lo que lo hace adecuado para agentes que invocan APIs o herramientas del sistema en un Mac con memoria unificada amplia.
- Descripción y análisis de imágenes en local: al conservar el codificador visual en bf16, es apropiado para tareas de image-text-to-text donde la fidelidad visual importa, como extracción de información de capturas o documentos escaneados.
- Automatización de flujos con múltiples herramientas: la variante evita fallos observados en la cuantización uniforme a 4 bits (llamadas innecesarias, llamadas incompletas de varias herramientas), lo que la hace preferible para pipelines de agentes donde un error de formato rompe la ejecución.
- Prototipado de agentes conversacionales multilingües japonés-inglés: los probes del autor muestran un 100 % de acierto en preguntas cortas en ambos idiomas, útil para validar diseños de prompt antes de desplegar en infraestructura mayor.
- Evaluación comparativa de esquemas de cuantización: sirve como referencia práctica para estudiar el impacto de la precisión mixta (expertos a 4 bits, resto a 8 bits) en tareas de tool calling frente a cuantizaciones uniformes.
- Inferencia privada en estación de trabajo: al ejecutarse con MLX sobre hardware Apple, permite procesar texto e imágenes sin enviar datos a servicios externos, relevante para entornos con requisitos de confidencialidad.
- Investigación sobre decodificación especulativa: la disponibilidad de un drafter MTP separado permite experimentar con aceleración por especulación, aunque en esta cuantización la ganancia medida es reducida.

## Benchmarks y rendimiento

Los datos publicados por el autor corresponden a evaluaciones propias (probe de 34 preguntas cortas en japonés e inglés y 20 escenarios de tool calling por idioma, 5 repeticiones por caso, temperatura 0,6, top_p 0,95, top_k 20, sin modo thinking, mlx-vlm 0.7.11, sin MTP salvo donde se indica).

| Métrica | 8bit | 4bit uniforme | e4o8-ngram4 | e4o8 (este modelo) |
|---|---|---|---|---|
| Acierto en probe | 100 % | 100 % | 100 % | 100 % |
| Tool calling en japonés | 97 % | 94 % | 99 % | 99 % |
| Tool calling en inglés | 88 % | 80 % | 92 % | 98 % |
| Formato de llamada correcto (inglés) | 100 % | 95 % | 98,5 % | 100 % |
| Tamaño de pesos | 186 GiB | 104 GiB | 106 GiB | 130 GiB |
| Generación sin MTP | no disponible | 46,6 tok/s | 37,0 tok/s | 38,5 tok/s |
| Generación con MTP | no disponible | 48,7 tok/s | 37,0 tok/s | 39,0 tok/s |

Las velocidades se midieron en un M3 Ultra con temperatura 0 y 400 tokens por pregunta, media de 3 preguntas. No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- Peso en disco y en memoria: 130 GiB de pesos (139,6 GB de repositorio); el autor indica que el servidor de modelos necesita los pesos más varios GB adicionales.
- Memoria unificada: se requiere un equipo Apple Silicon con al menos ~136-140 GB de memoria unificada disponible; en la práctica, configuraciones de 192 GB o superiores (M3 Ultra, M2 Ultra con 192 GB) son las viables.
- GPU: no aplica CUDA; el formato MLX está orientado a Apple Silicon. No cabe en GPUs de consumo tipo RTX 4090 (24 GB) ni en configuraciones multi-GPU estándar sin conversión de formato.
- Despliegue: mlx-vlm (versión 0.7.11 usada en la evaluación; 0.7.0 o superior para el drafter MTP). No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Rendimiento medido: 38,5 tok/s sin MTP y 39,0 tok/s con MTP en M3 Ultra; la decodificación especulativa apenas mejora en esta cuantización.
- Latencia: no disponible más allá del throughput indicado.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tool calling (jp/en) | Tamaño de pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Qwen3.8-Flash-Next-mlx-4bit-e4o8 (este) | 177,4 B | no disponible | 99 % / 98 % | 130 GiB | qwen-community-1.0 | HuggingFace (MLX) |
| Qwen3.8-Flash-Next-mlx-8bit | 177,4 B | no disponible | 97 % / 88 % | 186 GiB | qwen-community-1.0 | HuggingFace (MLX) |
| Qwen3.8-Flash-Next-mlx-4bit (uniforme) | 177,4 B | no disponible | 94 % / 80 % | 104 GiB | qwen-community-1.0 | HuggingFace (MLX) |
| Qwen3.8-Flash-Next-mlx-4bit-e4o8-ngram4 | 177,4 B | no disponible | 99 % / 92 % | 106 GiB | qwen-community-1.0 | HuggingFace (MLX) |

No se dispone de datos para comparar con modelos de otros autores de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La evaluación es reducida y autoinformada: 34 preguntas cortas y 20 escenarios de tool calling por idioma, 5 repeticiones; no sustituye a benchmarks estandarizados.
- El autor no ha probado conversaciones largas ni entradas de imagen; el comportamiento en contexto extendido y en tareas visuales reales no está validado.
- El doble redondeo (bf16 → 8 bits → 4 bits en expertos) añade un error medido de +0,3 % respecto a una cuantización directa desde bf16.
- El autor desconoce por qué la versión de 8 bits obtiene peor tool calling en inglés que esta variante, pese a compartir los pesos no pertenecientes a expertos; la causa del comportamiento no está explicada.
- Riesgo de alucinación y sesgos: no documentados para el modelo base en la información disponible.
- Idiomas: solo se validan japonés e inglés; el rendimiento en castellano u otros idiomas no está medido.
- Licencia qwen-community-1.0: es necesario revisar sus términos antes de uso comercial; la model card la etiqueta como "other".
- Requisito de hardware muy elevado (≈130 GiB de pesos) que restringe su uso a estaciones Apple Silicon de gama alta.
- El modelo drafter MTP apenas aporta aceleración en esta cuantización (38,5 → 39,0 tok/s), por lo que no debe asumirse una mejora significativa de latencia.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit-e4o8
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- Versión MLX 8 bits: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-8bit
- Versión MLX 4 bits uniforme: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit
- Versión MLX 4 bits e4o8-ngram4: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-mlx-4bit-e4o8-ngram4
- Drafter MTP bf16: https://huggingface.co/ToPo-ToPo/Qwen3.8-Flash-Next-MTP-bf16
