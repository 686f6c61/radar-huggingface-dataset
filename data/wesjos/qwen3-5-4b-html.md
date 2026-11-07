# wesjos/Qwen3.5-4B-HTML

## Resumen

Qwen3.5-4B-HTML es un ajuste fino (fine-tuning) del modelo multimodal Qwen/Qwen3.5-4B, publicado por el usuario wesjos en Hugging Face. Su particularidad es que sustituye las respuestas en Markdown por un sistema de componentes HTML semántico y compacto (bento grids, tarjetas de métricas, steppers, callouts, badges y tablas) envuelto en un único elemento raíz `<div class="ai-view">`. El objetivo declarado por el autor es un experimento para observar el comportamiento de un LLM cuando se le fuerza a razonar y responder en HTML en lugar de Markdown.

El modelo conserva la arquitectura del base: `Qwen3_5ForConditionalGeneration`, con 32 capas (24 de atención lineal y 8 de atención completa), dimensión oculta de 2560 y 4.659.865.088 parámetros totales en precisión bf16 (aproximadamente 8,68 GiB). Es multimodal (entrada texto e imagen, salida HTML) y mantiene una ventana de contexto nativa de 262.144 tokens, aunque la configuración de despliegue recomendada por el autor limita `--max-model-len` a 81.920.

Su relevancia es acotada pero interesante: explora una vía poco habitual de formateo estructurado de respuestas orientado a interfaces visuales generadas directamente por el modelo, sin necesidad de system prompt. El entrenamiento fue muy ligero (900 muestras, 1,5 épocas), por lo que debe entenderse como una prueba de concepto más que como un modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `Qwen3_5ForConditionalGeneration` (transformer multimodal, 32 capas: 24 de atención lineal + 8 de atención completa, hidden 2560) |
| Parametros totales | 4.659.865.088 (4,66 B) |
| Parametros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | 262.144 tokens nativos; 81.920 configurados en el ejemplo de despliegue con vLLM |
| Tipos de cuantizacion | no disponible (pesos publicados en bf16; el ecosistema del modelo base permite otras cuantizaciones, pero no se documentan en la ficha) |
| Idiomas soportados | inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers); repo de 9,3 GB |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.5-4B base: un transformer multimodal con 32 capas que combina 24 capas de atención lineal con 8 capas de atención completa, dimensión oculta de 2560 y capacidad de procesar entradas de texto e imagen para generar texto. La salida, en este ajuste, se restringe de facto a un contrato HTML concreto: un único elemento raíz `<div class="ai-view">` y un conjunto cerrado de componentes (summary-card, card, grid, metric-group, stepper, callout, badge, table-container, feature-list, code-box) cuyas clases están verificadas contra el `theme.css` del WebUI incluido.

El entrenamiento consistió en un SFT de instrucciones sobre el dataset `wesjos/mario-html-sft`, con 900 muestras y 1,5 épocas. Las curvas publicadas muestran una pérdida media (últimas 5) de 0,8410 y un mínimo de 0,6281 en el paso 55; la perplejidad (calculada solo sobre tokens de respuesta) promedia 2,319 con mínimo 1,874. La norma del gradiente alcanza un pico de 1,0040 en el paso 4 durante el warmup y se estabiliza en torno a 0,3729 de media. No se documentan fases de RLHF ni DPO, ni el volumen de tokens de entrenamiento más allá del número de muestras.

Una innovación destacable es el modo de razonamiento nativo: el modelo emite un flujo `<think>` colapsable antes de la respuesta renderizada, y no requiere system prompt (`zero-system-prompt`). El propio autor advierte de una limitación: el modelo genera tokens HTML también dentro de la cadena de pensamiento, lo que reduce la eficiencia porque parte del cómputo se dedica a decidir cómo estructurar el HTML en lugar de resolver la tarea.

## Capacidades

- Generación de texto estructurado como HTML semántico con componentes de interfaz predefinidos (tarjetas, grids, métricas, steppers, callouts, badges, tablas y bloques de código).
- Razonamiento nativo con flujo `<think>` colapsable antes de la respuesta final.
- Comprensión de imágenes (image-text-to-text): descripción de imágenes y respuesta visual a preguntas (visual question answering).
- Generación de código, incluyendo explicaciones estructuradas de código (el demo muestra un decoder transformer en Python con NumPy).
- Razonamiento matemático y aritmética paso a paso, presentado mediante steppers y callouts.
- Capacidades conversacionales multi-turno sin necesidad de system prompt.
- Soporte de contexto largo (hasta 262.144 tokens nativos).
- Capacidades multilingües limitadas a inglés y chino.
- No se documenta soporte explícito de tool calling ni de function calling en la información disponible.

## Casos de uso

- Generación de interfaces de respuesta en aplicaciones de chat: el modelo devuelve HTML directamente renderizable, lo que permite integrarlo en frontends propios sin un parser Markdown intermedio, usando el contrato de clases documentado.
- Descripción estructurada de imágenes: en flujos de revisión de contenido o catalogación, el modelo recibe una imagen y devuelve una ficha visual con grid de desglose y métricas, útil para paneles internos.
- Explicaciones técnicas de código: dado un fragmento de código, genera una explicación con tarjetas, callouts y un bloque de código formateado, adecuada para documentación generada automáticamente.
- Tutoría paso a paso de matemáticas: el modo stepper y los callouts permiten presentar derivaciones aritméticas numeradas, aprovechable en herramientas educativas que rendericen HTML.
- Prototipado rápido de páginas de resumen: el modelo produce vistas tipo bento grid con métricas y badges, útil para maquetar informes o dashboards estáticos a partir de una consulta en lenguaje natural.
- Asistentes conversacionales con contexto largo: con hasta 262.144 tokens nativos (81.920 en la configuración de vLLM sugerida), puede mantener conversaciones extensas con historial de documentos adjuntos.
- Experimentación en investigación sobre formatos de salida: sirve como banco de pruebas para estudiar el coste y la calidad de sustituir Markdown por HTML en el razonamiento de LLM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. Los únicos datos de rendimiento son las métricas de entrenamiento: pérdida media (últimas 5) de 0,8410 con mínimo de 0,6281 en el paso 55, perplejidad media de 2,319 con mínimo de 1,874, y norma de gradiente con pico de 1,0040 y media de 0,3729.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 8,68 GiB solo para los pesos, más overhead de KV cache y activaciones; en la práctica, el despliegue con vLLM sugiere `--gpu-memory-utilization 0.95`, lo que implica GPUs con al menos 16-24 GB para contexto moderado.
- GPU recomendadas: A100, H100 o L40S para contexto largo (hasta 81.920 tokens); RTX 4090 (24 GB) puede alojar el modelo en bf16 con contexto reducido.
- Cabe en GPU de consumo: sí, en tarjetas con 16 GB o más en bf16 con contexto corto; con cuantizaciones de menor precisión (no documentadas en la ficha) cabría en GPUs de 8-12 GB.
- Opciones de despliegue: vLLM es el recomendado por el autor (con `--reasoning-parser qwen3` y `--enforce-eager`); también es compatible con transformers. No se documentan instrucciones para llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidad | Licencia | Notas |
|---|---|---|---|---|---|
| wesjos/Qwen3.5-4B-HTML | 4,66 B | 262.144 nativos | texto + imagen → HTML | Apache 2.0 | Ajuste SFT ligero (900 muestras) centrado en salida HTML |
| Qwen/Qwen3.5-4B | no disponible en la información | no disponible en la información | image-text-to-text | no disponible en la información | Modelo base del anterior; salida en texto/Markdown convencional |
| wesjos/mario-html-4B | no disponible | no disponible | no disponible | no disponible | Variante del mismo autor mencionada en la búsqueda web; sin datos adicionales |

No se dispone de información suficiente para comparar con alternativas de otros autores de la misma categoría (modelos multimodales de ~4-5 B orientados a generación de UI).

## Limitaciones y advertencias

- El propio autor reconoce que el modelo genera tokens HTML dentro de la cadena de pensamiento (`<think>`), lo que reduce la eficiencia en cualquier tarea porque consume cómputo en decidir la estructura HTML en lugar de resolver el problema.
- Entrenamiento muy limitado: 900 muestras y 1,5 épocas, lo que implica un riesgo alto de sobreajuste al estilo del dataset y de degradación de capacidades generales respecto al modelo base.
- Riesgo de alucinación inherente a un modelo de 4,66 B ajustado con pocos datos; no hay evaluaciones publicadas que lo cuantifiquen.
- Idiomas soportados únicamente inglés y chino; el rendimiento en castellano no está garantizado ni documentado.
- El contrato de salida HTML está acoplado a las clases del `theme.css` del WebUI incluido; fuera de ese tema, los componentes pueden renderizarse con estilos por defecto (el propio autor señala que `ai-view-header` no está definido en `theme.css`).
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-4B conviene verificar las condiciones del modelo base.
- No se documenta soporte de tool calling ni de function calling, lo que limita su uso en pipelines de agentes.
- El contexto configurado en el ejemplo de despliegue (81.920 tokens) es menor que el nativo (262.144), por lo que en producción habrá que ajustar según la VRAM disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wesjos/Qwen3.5-4B-HTML
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/wesjos/mario-html-sft
- Variante relacionada del mismo autor: https://huggingface.co/wesjos/mario-html-4B
