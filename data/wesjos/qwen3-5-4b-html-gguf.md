# wesjos/Qwen3.5-4B-HTML-GGUF

## Resumen

Qwen3.5-4B-HTML-GGUF es una cuantización en formato GGUF del modelo wesjos/Qwen3.5-4B-HTML, un ajuste fino experimental sobre Qwen/Qwen3.5-4B (aproximadamente 4.660 millones de parámetros en bf16) desarrollado por el usuario wesjos. El objetivo del experimento es sustituir el formato Markdown por HTML semántico como lenguaje de salida del modelo: en lugar de responder con texto plano y listas Markdown, el modelo genera componentes HTML estructurados (bento grids, tarjetas de métricas, steppers, callouts) envueltos en un único elemento raíz `<div class="ai-view">`. El repositorio GGUF contiene dos cuantizaciones (Q8_0 y Q4_K_M) listas para su uso con llama.cpp.

El modelo base Qwen3.5-4B emplea una arquitectura híbrida con 32 bloques (24 de atención lineal y 8 de atención completa) más una cabeza MTP (multi-token prediction), con dimensión oculta de 2560 y una ventana de contexto nativa de 262.144 tokens. El ajuste fino HTML conserva el modo de razonamiento nativo (stream `<think>`) y no requiere system prompt para funcionar. Está pensado para escenarios donde la salida del modelo se renderiza directamente en una interfaz web, de modo que la respuesta ya llega maquetada.

La relevancia de esta ficha es doble: por un lado, documenta una aproximación poco habitual (salida HTML en lugar de Markdown) que puede interesar a quien construya aplicaciones de chat con renderizado enriquecido; por otro, advierte de un coste conocido: el propio autor señala que el modelo introduce tokens HTML dentro de la cadena de pensamiento, lo que consume capacidad de razonamiento en decidir cómo maquetar y reduce la eficiencia en tareas generales. Se trata de un experimento con 390 descargas y 1 like en el momento de la consulta, no de un modelo de producción consolidado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido GGUF `qwen35`: 32 bloques (24 de atención lineal + 8 de atención completa) + 1 cabeza MTP en `blk.32`, dimensión oculta 2560 |
| Parametros totales | 4.326.350.848 (según safetensors del modelo base); la model card del autor cita 4,66 B en bf16 para Qwen3.5-4B |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 262.144 tokens nativos; el ejemplo de arranque usa `-c 65536` |
| Tipos de cuantizacion | Q8_0 (`MOSTLY_Q8_0`: 257 × Q8_0 + 184 × F32) y Q4_K_M (`MOSTLY_Q4_K_M`: 222 × Q4_K + 35 × Q6_K + 184 × F32) |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (para llama.cpp); el modelo base se distribuye en safetensors bf16 |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.5-4B, un transformer decoder con una combinación híbrida de capas: 24 bloques de atención lineal y 8 de atención completa, con dimensión oculta de 2560. Incorpora una cabeza MTP (multi-token prediction) situada en el bloque `blk.32`, que permite predecir varios tokens por paso y se usa habitualmente para decodificación especulativa. La ventana de contexto nativa es de 262.144 tokens. El ajuste fino se realizó sobre el dataset wesjos/mario-html-sft, orientado a enseñar al modelo a producir el sistema de componentes HTML descrito en la model card (root `ai-view`, `summary-card`, `grid`, `metric-group`, `stepper`, `callout`, `badge`, `modern-table`, `feature-list`, `code-box`).

No se dispone de información sobre el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. El autor indica explícitamente que el modelo conserva tokens HTML dentro del razonamiento (cadena `<think>`), lo que califica como "low efficient for any task" porque el modelo gasta capacidad en decidir cómo maquetar la respuesta; apunta que intentará corregirlo en futuras versiones. La model card no documenta innovaciones adicionales más allá del contrato de salida HTML y el modo de razonamiento nativo sin system prompt.

## Capacidades

- Generación de texto con salida en HTML semántico estructurado en lugar de Markdown, siguiendo un contrato de componentes fijo (root `ai-view`, tarjetas, grids, métricas, steppers, callouts, badges, tablas y bloques de código).
- Razonamiento nativo con stream `<think>` colapsable, visible en la demo del modelo base.
- Generación de código: la demo incluye un decoder transformer en Python con solo numpy, presentado dentro de un `code-box`.
- Entrada de visión: la demo muestra la descripción de una imagen adjunta renderizada como ficha técnica con grid de desglose (capacidad heredada del modelo base image-text-to-text).
- Razonamiento matemático y aritmética paso a paso: la demo incluye comparación de decimales (9.11 frente a 9.9) y una operación encadenada (8.2×9.12/23) resuelta con stepper de tres pasos.
- Capacidad de persona: responde a "who are you" con una página de persona con tarjetas de métricas y tabla de capacidades.
- Conversación multi-turno (tag `conversational`).
- Idiomas: inglés y chino.
- No hay información disponible sobre soporte de tool calling, function calling ni comportamiento agéntico multi-paso.

## Casos de uso

- Chat con renderizado enriquecido en aplicaciones web: el modelo devuelve directamente un árbol HTML con clases semánticas, de modo que el frontend puede aplicar `theme.css` sin parsear Markdown ni convertir la respuesta. Adecuado cuando el equipo controla el CSS y quiere respuestas con estructura visual consistente.
- Paneles de métricas generados dinámicamente: el componente `metric-group` con `metric-card`, `metric-label`, `metric-value` y `metric-sub` permite que el modelo produzca tarjetas de KPI listas para insertar en un dashboard interno a partir de datos pegados en el prompt.
- Documentación técnica con avisos y pasos: el uso de `callout` (info, warning, success, danger) y `stepper` encaja en guías de instalación, runbooks y tutoriales donde el orden de pasos y las advertencias deben distinguirse visualmente.
- Explicaciones didácticas de matemáticas: la demo de aritmética paso a paso muestra que el modelo puede descomponer una operación en un stepper con derivaciones en `code-box` y un callout de resultado, útil en herramientas educativas.
- Descripción de imágenes en fichas estructuradas: con una imagen adjunta, el modelo genera una ficha con título y grid de desglose, aprovechable en catálogos, inventarios visuales o accesibilidad.
- Prototipado rápido de interfaces generadas por LLM: al fijar un contrato de componentes cerrado, el equipo puede renderizar las respuestas con un conjunto limitado de estilos y evitar HTML arbitrario; útil para demos internas de asistentes con salida visual.
- Generación de fragmentos de código presentados con cabecera: el componente `code-box` con `code-title` permite incrustar ejemplos de código con etiqueta de lenguaje en documentación autogenerada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye MMLU, HumanEval, GSM8K ni comparaciones numéricas con otros modelos; las demos son capturas cualitativas del checkpoint bf16 renderizadas por el WebUI incluido, no reevaluadas sobre estas cuantizaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 2,6 GB en disco para Q4_K_M y 4,29 GiB para Q8_0; con overhead de contexto y caché KV, el consumo en memoria es superior al tamaño del fichero, especialmente al usar ventanas largas.
- El ejemplo oficial arranca con `-c 65536` y `-ngl 99 -fa on` (flash attention activada), lo que implica que la caché KV a 64K tokens condiciona la VRAM real necesaria.
- GPU recomendadas: no especificadas por el autor. Por tamaño, Q4_K_M cabe en GPU de consumo con 8 GB o más; Q8_0 requiere alrededor de 6 GB solo para pesos, por lo que 8-12 GB es un objetivo razonable. Para contexto completo de 262.144 tokens se necesitaría mucha más memoria y no hay cifras publicadas.
- Cabe en GPU de consumo: sí, al menos en las cuantizaciones publicadas; el tamaño de pesos es compatible con tarjetas de 8 GB en Q4_K_M.
- Opciones de despliegue: llama.cpp mediante `llama-server` con descarga directa desde Hugging Face (`-hf wesjos/Qwen3.5-4B-HTML-GGUF:...`); el tag `endpoints_compatible` sugiere compatibilidad con endpoints tipo OpenAI. No se documentan recetas para vLLM, TGI u Ollama.
- Parámetros de muestreo recomendados por el autor: temperature 1.0, top_p 0.95, top_k 20, min_p 0.0, presence_penalty 1.5, repeat_penalty 1.0.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wesjos/Qwen3.5-4B-HTML-GGUF | 4,33 B | 262.144 | HTML semántico con componentes | Apache 2.0 | GGUF en Hugging Face (390 descargas) |
| Qwen/Qwen3.5-4B | ~4,66 B (bf16) | 262.144 | Texto estándar (image-text-to-text) | No indicada en la información disponible | Modelo original en Hugging Face |
| lmstudio-community/Qwen3.5-4B-GGUF | ~4,66 B | 262.144 | Texto estándar | No indicada en la información disponible | GGUF cuantizado por LM Studio con llama.cpp b8185 |

La comparación relevante es frente al modelo base y a su cuantización comunitaria: comparten arquitectura y contexto, y la diferencia es el ajuste fino para salida HTML, que mejora la presentación en interfaces web pero, según el propio autor, degrada la eficiencia del razonamiento al introducir tokens HTML en la cadena de pensamiento.

## Limitaciones y advertencias

- El autor reconoce que el modelo introduce tokens HTML dentro de la cadena de pensamiento, lo que consume capacidad y reduce la eficiencia en tareas generales; es un experimento, no un modelo pulido.
- Solo se declaran inglés y chino; no hay soporte documentado de castellano.
- No hay datos de benchmarks que permitan estimar la degradación frente al Qwen3.5-4B original en tareas de razonamiento, código o matemáticas.
- Riesgo de alucinación no cuantificado; el modelo genera HTML plausible con componentes que pueden no existir en el CSS del usuario (la propia model card advierte que `ai-view-header` no está en el `theme.css` del repositorio fuente).
- El contrato de salida es cerrado: si la aplicación espera Markdown o texto plano, la integración requiere un renderizador HTML y una hoja de estilos compatible.
- Las demos corresponden al checkpoint bf16 renderizado por el WebUI incluido, no a estas cuantizaciones; el comportamiento cualitativo puede diferir.
- Licencia Apache 2.0: permite uso comercial, pero el modelo base Qwen3.5-4B no tiene licencia indicada en la información disponible, por lo que conviene verificar los términos del modelo original antes de desplegar en producción.
- El contexto nativo de 262.144 tokens no implica que pueda usarse en hardware de consumo; la caché KV a esa longitud exige memoria muy superior a la de los pesos.
- Sesgos conocidos: no documentados en la información disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/wesjos/Qwen3.5-4B-HTML-GGUF
- Modelo base del ajuste (bf16 safetensors + WebUI): https://huggingface.co/wesjos/Qwen3.5-4B-HTML
- Modelo original de Qwen: https://huggingface.co/Qwen/Qwen3.5-4B
- Cuantización comunitaria de LM Studio: https://huggingface.co/lmstudio-community/Qwen3.5-4B-GGUF
- Dataset de ajuste fino: https://huggingface.co/datasets/wesjos/mario-html-sft
