# wesjos/Qwen3.5-9B-HTML-v2

## Resumen

Qwen3.5-9B-HTML-v2 es un ajuste fino (fine-tuning) supervisado del modelo multimodal Qwen/Qwen3.5-9B, publicado por el usuario wesjos. El modelo está especializado en la generación de HTML estructurado y con estilos, orientado a la creación de interfaces web y a la respuesta visual a preguntas (VQA). A diferencia de los asistentes generalistas que devuelven Markdown, este modelo emite directamente un árbol HTML con clases CSS predefinidas (`ai-view`, `card`, `grid`, `callout`, `modern-table`, etc.), lo que permite renderizar respuestas enriquecidas sin postprocesado.

El modelo conserva la arquitectura nativa del Qwen3.5-9B: un transformer híbrido de 32 capas que combina 24 capas de atención lineal con 8 capas de atención completa (intervalo 4), con un tamaño total de 9.653.104.368 parámetros (9,65 B en bf16) y una longitud de contexto nativa de 262.144 tokens. La versión v2 se diferencia de la v1 por reducir la cantidad de etiquetas HTML en la traza de razonamiento (`<think>`), manteniendo la planificación en texto plano puro.

Su relevancia actual radica en dos factores: por un lado, demuestra un caso de uso especializado (generación de UI directamente consumible por un navegador) sobre una base multimodal capaz de procesar imágenes; por otro, introduce una convención de "cero system prompt" y "pureza de CoT" que busca que el modelo razone sin contaminar la traza con HTML. La licencia Apache 2.0 facilita su integración comercial, aunque el modelo es de nicho y su adopción todavía es reducida (118 descargas y 3 likes en el momento de redactar esta ficha).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Qwen3_5ForConditionalGeneration (transformer híbrido: 32 capas, 24 de atención lineal + 8 de atención completa, intervalo 4; hidden size 4096) |
| Parametros totales | 9.653.104.368 (9,65 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | 262.144 tokens (nativo) |
| Tipos de cuantizacion | BF16 (original); GGUF Q8_0 y Q4_K_M con mmproj BF16 en el repo hermano |
| Idiomas soportados | inglés (en), chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); GGUF en el repositorio wesjos/Qwen3.5-9B-HTML-v2-GGUF |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-9B y hereda su arquitectura híbrida de atención: 32 capas totales, de las cuales 24 usan atención lineal y 8 usan atención completa, intercaladas con un intervalo de 4. Esta combinación reduce el coste computacional en contextos largos manteniendo la capacidad de atención global en capas clave. El tamaño del repositorio es de 19,3 GB, coherente con los 9,65 B de parámetros en bf16 (17,98 GiB según la model card).

El ajuste se realizó mediante SFT (supervised fine-tuning) sobre el dataset propio `wesjos/mario-html-sft`. No se documenta en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si hubo fases de RLHF o DPO posteriores. La innovación técnica destacable es el contrato de salida: el modelo fue entrenado para emitir un único elemento raíz `<div class="ai-view">` con componentes opcionales anidados (summary, card, grid, metric-group, stepper, callout, badge, table-container, feature-list, code-box), y para mantener la traza `<think>` en texto plano sin etiquetas HTML. La v2 refuerza esta última propiedad ("less html tag in CoT than v1"). El entrenamiento sigue la ruta de "zero system prompt", es decir, el modelo está calibrado para funcionar sin system prompt o con uno vacío.

## Capacidades

- Generación de HTML estructurado con clases CSS predefinidas, orientado a renderizado directo en navegador.
- Generación de texto a HTML y de texto + imagen a HTML (pipeline image-text-to-text).
- Razonamiento con traza `<think>` en texto plano, sin contaminación de etiquetas HTML (pureza de CoT).
- Respuesta visual a preguntas (VQA): descripción y comparación de imágenes subidas por el usuario.
- Capacidades de comparación y síntesis: genera tablas comparativas, grids de tarjetas, métricas y callouts a partir de una consulta.
- Razonamiento matemático paso a paso con representación en stepper y code blocks (la model card advierte que la aritmética es fiable pero no de grado bancario).
- Soporte conversacional multi-turno.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible explícitamente; la traza de razonamiento sugiere planificación multi-paso, pero no se documenta un framework de agentes.
- Capacidades multilingües limitadas a inglés y chino.

## Casos de uso

- Generación de interfaces web en producción: el modelo emite directamente HTML con clases de un tema CSS conocido, lo que permite integrarlo en un pipeline que sirva la respuesta al navegador sin conversión intermedia. Es adecuado porque el contrato de salida está verificado contra `theme.css` y evita el postprocesado de Markdown a HTML.
- Asistentes de documentación técnica: dada una consulta sobre arquitecturas (por ejemplo, microservicios frente a monolito), el modelo produce grids comparativos, tablas head-to-head y callouts de veredicto. Es útil para portales de documentación que necesitan respuestas visualmente estructuradas.
- Respuesta visual a preguntas en soporte técnico: el usuario sube una captura de pantalla o una foto y el modelo la describe y compara (por ejemplo, una imagen de un animal respondida con una comparación de dos tarjetas). Es adecuado porque combina entrada de imagen con salida HTML estructurada.
- Tutoría matemática paso a paso: con la traza de razonamiento activada, el modelo planifica en texto plano y renderiza la solución como stepper con code blocks y callouts de reglas. Es útil en plataformas educativas que quieren mostrar el proceso además del resultado.
- Prototipado rápido de componentes UI: un desarrollador puede pedir "una cuadrícula de comparación con métricas y una tabla" y obtener el markup listo para pegar en el WebUI incluido o en su propio frontend con `theme.css`.
- Generación de contenido estructurado para chatbots de atención al cliente: el modelo puede convertir respuestas multi-turno en tarjetas de resumen, pasos y avisos, manteniendo el contexto largo gracias a los 262.144 tokens de ventana.
- Evaluación de modelos especializados en generación de UI: sirve como referencia para comparar enfoques de salida estructurada (HTML frente a Markdown) en tareas de diseño web generativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card y los resultados de búsqueda no incluyen métricas cuantitativas (MMLU, HumanEval, GSM8K ni evaluaciones específicas de generación HTML), por lo que no se presentan tablas comparativas de rendimiento.

## Requisitos de hardware

- VRAM estimada para inferencia en BF16: aproximadamente 18-20 GB solo para los pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 24 GB o más.
- Cuantización Q8_0 (GGUF): alrededor de 10-11 GB de pesos, viable en GPUs de 16 GB.
- Cuantización Q4_K_M (GGUF): alrededor de 6-7 GB de pesos, viable en GPUs de consumo de 8-12 GB (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070).
- GPU recomendadas: A100 40/80 GB, H100 para servicio de alta concurrencia con contexto largo; RTX 4090 (24 GB) para BF16 en una sola GPU; RTX 3090 (24 GB) como alternativa.
- Cabe en GPU de consumo: sí, en cuantizaciones GGUF Q4_K_M y Q8_0; en BF16 requiere 24 GB o más.
- Opciones de despliegue: transformers, vLLM (con `--reasoning-parser qwen3`, que requiere una versión reciente de vLLM), llama.cpp (build GGUF con mmproj BF16 para la parte visual), y cualquier endpoint compatible con la API de OpenAI (`endpoints_compatible`).
- Latencia y throughput estimados: no disponible en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Modalidad | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wesjos/Qwen3.5-9B-HTML-v2 | 9,65 B | 262.144 | texto + imagen → HTML | Apache 2.0 | Hugging Face (118 descargas) |
| Qwen/Qwen3.5-9B (base) | 9,65 B | 262.144 | texto + imagen → texto | Apache 2.0 (según el modelo base) | Hugging Face |
| wesjos/Qwen3.5-4B-HTML-v2 | no disponible en la información (familia 4B) | no disponible | texto + imagen → HTML | Apache 2.0 | Hugging Face (incluye el WebUI) |
| wesjos/mario-html-v2-9B | no disponible en la información | no disponible | texto + imagen → HTML | Apache 2.0 | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- La salida es HTML, no Markdown: si se alimenta a un renderizador de Markdown se obtendrán etiquetas en crudo.
- El modelo está entrenado para funcionar con system prompt vacío o ausente; introducir un system prompt puede degradar la calidad de la salida.
- El modelo elige clases de un vocabulario cerrado; las clases nuevas arbitrarias no forman parte del contrato. Para reestilizar, la vía soportada es un `theme.css` personalizado.
- Algunas clases del ejemplo de la model card (`step-list`, `ai-view-header`) no están definidas en `theme.css` y se renderizan con estilo de bloque por defecto.
- La aritmética es fiable pero no de grado bancario; conviene verificar cadenas largas de decimales.
- Idiomas limitados a inglés y chino; el castellano no está declarado como idioma soportado.
- Riesgo de alucinación: no se documentan evaluaciones de factualidad ni de sesgos en la información disponible.
- Sesgos conocidos: no disponible en la información proporcionada.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base Qwen3.5-9B y del dataset `wesjos/mario-html-sft`.
- El parser `--reasoning-parser qwen3` en vLLM requiere una versión reciente; versiones antiguas pueden no separar correctamente la traza `<think>`.
- Adopción muy reducida (118 descargas, 3 likes), lo que implica poca validación comunitaria y escasa evidencia de robustez en producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Qwen3.5-9B-HTML-v2
- Build GGUF / llama.cpp: https://huggingface.co/wesjos/Qwen3.5-9B-HTML-v2-GGUF
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Repositorio hermano con el WebUI (Qwen3.5-4B-HTML-v2): https://huggingface.co/wesjos/Qwen3.5-4B-HTML-v2
- Variante mario-html-v2-9B: https://huggingface.co/wesjos/mario-html-v2-9B
- Dataset de SFT: https://huggingface.co/datasets/wesjos/mario-html-sft
