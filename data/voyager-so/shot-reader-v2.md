# voyager-so/shot-reader-v2

## Resumen

Shot Reader v2 es un modelo de visión-lenguaje especializado en el análisis de planos cinematográficos. Desarrollado por Voyager, se trata de un fine-tune LoRA del modelo base Qwen3.5-9B (9.409.813.744 parámetros) que recibe como entrada un vídeo o secuencia de fotogramas y produce una ficha técnica estructurada en JSON describiendo cómo se rodó el plano: altura y ángulo de cámara, distancia focal, movimiento de cámara, si es cámara en mano, sujetos en cuadro, su posición y trayectoria, y el entorno. El modelo resuelve un problema concreto de la previsualización 3D (previs): distinguir un zoom (cambio de focal) de un dolly (movimiento del cuerpo de cámara), dos operaciones que en pantalla resultan casi idénticas pero que exigen reconstrucciones 3D completamente distintas.

La propuesta de valor diferencial frente a modelos frontera como Opus 5.5 o Gemini 4 Argon es la precisión en esa distinción: según la model card, Shot Reader v2 acierta el 95% de los zooms frente al 7% y 48% de los citados modelos, y el 92% de los casos en los que debe acertar tanto el movimiento como la focal. Además, incorpora una puntuación de confianza calibrada derivada de las probabilidades de token del propio modelo, lo que permite filtrar resultados poco fiables en producción.

El modelo está orientado a pipelines de reconstrucción 3D en Blender, etiquetado y búsqueda de librerías de vídeo, y agentes de código que necesitan reconstruir una escena a partir de material rodado. Su licencia Apache 2.0 y su tamaño de 9B lo hacen desplegable en hardware relativamente modesto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal (image-text-to-text) basada en Qwen3.5-9B, con adaptador LoRA |
| Parametros totales | 9.409.813.744 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits (`--load-in-4bit`, requiere bitsandbytes); pesos en safetensors |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); repo de 19,5 GB |

## Arquitectura y entrenamiento

Shot Reader v2 es un fine-tune mediante LoRA sobre Qwen3.5-9B, un modelo multimodal de la familia Qwen3.5 capaz de procesar imagen y texto. La pipeline declarada es `image-text-to-text`, y el modelo está diseñado para consumir secuencias de fotogramas de un plano continuo y emitir una salida JSON estructurada (schema_version 3) con campos de cámara, estilo, etiquetas, caption, sujetos y entorno.

La innovación técnica central descrita en la model card es el tratamiento separado del movimiento del cuerpo de cámara (`camera.move`) y del cambio de focal (`camera.zoom`). Para ello, el pipeline de inferencia mide cómo escalan los fotogramas entre sí y proporciona esa información al modelo como una línea de texto adicional, lo que le permite distinguir un zoom de un dolly. El modelo incorpora además una puntuación de confianza (`camera.confidence`) derivada de las probabilidades de token del propio modelo, calibrada mediante un mapa ajustado sobre planos reservados (held-out), con un error de calibración de 2 a 5 puntos. Los detalles de composición del dataset de entrenamiento, número de tokens y uso de RLHF/DPO no están disponibles en la información proporcionada.

## Capacidades

- Análisis de planos de vídeo: estimación de altura de cámara (`height_m`), ángulo (`angle`), pitch en grados, campo de visión (`fov_deg`) y encuadre (`framing`).
- Distinción entre zoom (cambio de focal) y dolly (movimiento del cuerpo de cámara), con campo dedicado `camera.zoom` (`in`/`out`/`none` y FOV final).
- Detección de cámara en mano frente a cámara fija (`handheld`, `static`).
- Identificación de sujetos: clase, descripción, tamaño, postura, trayectoria y orientación a lo largo del plano.
- Clasificación de estilo: acción real, 3D (CG) o 2D animado.
- Generación de caption descriptivo y etiquetas de búsqueda (setting, sujeto, trabajo de cámara).
- Salida estructurada en JSON apta para reconstrucción en Blender o consumo por agentes de código.
- Puntuación de confianza calibrada por campo (movimiento, zoom, altura) y marcado de ambigüedad con movimiento alternativo.
- Modo solo cámara (`--camera-only`) para inferencia aproximadamente 2,5 veces más rápida.
- Capacidad multilingüe: limitada al inglés según la model card.

## Casos de uso

- Previsualización 3D y reconstrucción en Blender: el JSON de salida incluye altura, ángulo, focal, movimiento y trayectorias de sujetos, de modo que una herramienta o un agente de código puede reconstruir el plano directamente en Blender sin interpretación manual.
- Etiquetado y búsqueda de librerías de vídeo: cada plano recibe caption y tags de escenario, sujeto y trabajo de cámara, lo que permite indexar y buscar en archivos audiovisuales por tipo de plano o movimiento.
- Análisis de referencias cinematográficas: dado un clip de referencia, el modelo extrae la ficha técnica del plano para que un equipo de previs o VFX reproduzca la intención original.
- Integración en agentes vía MCP o API: la model card indica que puede usarse a través de Voyager (MCP para Claude, ChatGPT, Claude Code o Codex) o de la API de Voyager, sin necesidad de GPU local.
- Control de calidad en pipelines de VFX: la confianza calibrada por campo permite descartar o revisar manualmente los planos con puntuaciones bajas antes de pasarlos a reconstrucción.
- Documentación automática de rodaje: generar fichas técnicas por plano para continuidad, montaje o archivo de producción.
- Análisis de planos individuales dentro de vídeos largos: con `--start` y `--end` se puede aislar un plano concreto de un vídeo mayor.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre 300 planos de test con respuestas exactas (versiones zoom, dolly y dolly-zoom del mismo escenario, renderizadas con focal y trayectoria conocidas):

| Métrica | Shot Reader v2 | Opus 5.5 | Gemini 4 Argon |
|---|---|---|---|
| Zooms correctos | 95% | 7% | 48% |
| Dolly zooms estilo Vertigo correctos | 90% | 8% | 21% |
| Movimiento y focal ambos correctos | 92% | 37% | 48% |
| Igual, en escenas planas sin paralaje | 88% | 33% | 36% |

Comparativa adicional frente a la versión anterior y modelos frontera:

| Métrica | Shot Reader v2 | Shot Reader v1 | Opus 5.5 | Gemini 4 Argon |
|---|---|---|---|---|
| Altura y movimiento ambos correctos (300 planos) | 72% | 69% | 44% | 46% |
| Cámara en mano detectada (150 planos) | 92% | 0% | 35% | 7% |
| Cámara fija con sujeto en movimiento leída como estática (150) | 94% | 67% | 93% | 93% |
| Estilo correcto en animación (100) | 96% | – | 96% | 94% |
| Scene Check, metraje real (VibePrevisBench) | 35,8 | 35,6 | 38,5 | 37,3 |

## Requisitos de hardware

- VRAM estimada: el modelo de 9B en precisión completa requiere aproximadamente 18 GB de pesos; con `--load-in-4bit` (bitsandbytes) cabe en una GPU de 16 GB, con una pérdida de 6 a 10 puntos de precisión en cámara según la model card.
- GPU recomendadas: no se especifican modelos concretos; por tamaño, una RTX 4090 (24 GB) o A100/H100 permiten ejecución sin cuantización, y una GPU de 16 GB con cuantización a 4 bits.
- Cabe en GPU de consumo: sí, con cuantización a 4 bits en tarjetas de 16 GB; sin cuantización requiere al menos 24 GB.
- Opciones de despliegue: vLLM 0.34 o posterior (`--backend vllm`, la opción más rápida), transformers (>=5.2), y uso remoto vía Voyager MCP o API sin GPU local.
- Latencia y throughput: no disponibles; solo se indica que el modo `--camera-only` es aproximadamente 2,5 veces más rápido de extremo a extremo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Especialización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Shot Reader v2 | 9,41B | no disponible | Análisis de planos y cámara | Apache 2.0 | Hugging Face, Voyager MCP/API |
| Opus 5.5 | no disponible | no disponible | Modelo frontera generalista | propietaria | API comercial |
| Gemini 4 Argon | no disponible | no disponible | Modelo frontera generalista | propietaria | API comercial |
| Shot Reader v1 | no disponible | no disponible | Análisis de planos (versión previa) | no disponible | Hugging Face |

La comparación relevante es frente a los modelos generalistas frontera: Shot Reader v2 supera ampliamente a Opus 5.5 y Gemini 4 Argon en distinción zoom/dolly y detección de cámara en mano, mientras que en la métrica global de reconstrucción de escena sobre metraje real (Scene Check) queda ligeramente por debajo (35,8 frente a 38,5 y 37,3).

## Limitaciones y advertencias

- Idioma: el modelo está entrenado y evaluado únicamente en inglés; no se garantiza un rendimiento correcto en castellano u otros idiomas.
- Una entrada debe ser un plano continuo: es necesario cortar los vídeos más largos en los puntos de edición antes de pasarlos al modelo.
- La cuantización a 4 bits reduce la precisión de cámara entre 6 y 10 puntos según las pruebas del autor.
- La puntuación de confianza es calibrada pero no infalible: el error de calibración es de 2 a 5 puntos, y los casos límite se marcan como ambiguos con un movimiento alternativo.
- En la métrica global de reconstrucción sobre metraje real (Scene Check) el modelo queda por debajo de Opus 5.5 y Gemini 4 Argon, por lo que su ventaja es específica del análisis de cámara, no general.
- No se documentan sesgos conocidos ni tasas de alucinación en la información proporcionada.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3.5-9B.
- El modelo tiene 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que no hay validación independiente de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/voyager-so/shot-reader-v2
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Voyager (sitio principal): https://voyager.so
- Acceso vía MCP: https://voyager.so/mcp
- Guía de configuración de la API: https://docs.voyager.so/get-started/choose-your-setup
- Voyager Cloud: https://voyager.so/cloud
- Paper de referencia: arxiv:2611.15789
