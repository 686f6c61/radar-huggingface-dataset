# wrldsuksgo2mars/Step-5-Preview-EXL3-K4-MC

## Resumen

Step-5 Preview EXL3 K4-MC es una cuantización comunitaria del modelo multimodal Step-5 Preview de StepFun, publicada por el usuario wrldsuksgo2mars. Se trata de un checkpoint de tipo mixto de expertos (MoE) con 172.899.199.808 parámetros totales, orientado a tareas de image-text-to-text, conversación, código, razonamiento matemático y uso de herramientas. La particularidad del checkpoint es su formato "multi-core": los expertos enrutados se almacenan una sola vez en 4 bits EXL3 (con las tres últimas capas enrutadas en 6 bits), mientras que el núcleo denso se ofrece en tres variantes seleccionables en tiempo de carga (BF16 original, EXL3 8 bits y EXL3 6 bits).

El modelo base, Step-5 Preview, es un transformer MoE multimodal con capacidades de visión, pensamiento (thinking mode) y multi-token prediction (MTP). Esta versión cuantizada reduce el peso en disco respecto al BF16 original (312,0 GiB en la vista `original`, 296,7 GiB en `k8-compact` y 293,7 GiB en `k6-compact`), manteniendo nativos los componentes sensibles: visión, compuertas de atención, indexadores dispersos, embeddings, routers y normas en BF16/FP32.

Es relevante ahora porque permite desplegar un modelo de gran escala en hardware con menos memoria que el BF16 completo, con un formato de checkpoint pensado para el runtime cuteafd y con calibración específica sobre datos de código real, matemáticas resueltas, esquemas de llamadas a funciones y texto multilingüe. El repo tiene 40 descargas y 0 likes en el momento de la consulta, y la licencia es la StepFun Model License 1.0, no una licencia de código abierto permisiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (step5_vl) con atención, FFN denso/compartido, expertos enrutados y MTP |
| Parámetros totales | 172.899.199.808 |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | EXL3 MCG: expertos enrutados K4 (capas 3-87) y K6 (capas 88-90); núcleo denso en BF16, EXL3 K8 o EXL3 K6; MTP K4; componentes nativos en BF16/FP32 |
| Idiomas soportados | no disponible (la calibración incluye texto multilingüe, pero no se listan idiomas) |
| Licencia | stepfun-model-license-1.0 (license: other) |
| Formato de pesos | safetensors, con índices y metadatos de cuantización por vista (`model.safetensors.index.json`, `config.json`, `quantize_config.json` y variantes `.k8.` / `.k6.`) |

## Arquitectura y entrenamiento

El modelo base es un transformer de mezcla de expertos (MoE) multimodal con tres etapas de multi-token prediction (MTP). La distribución de pesos es típica de un MoE de gran escala: los expertos enrutados concentran la mayor parte de los bytes (277,9 GiB, aproximadamente el 89,1% de la vista `original`, incluidas escalas y multiplicadores EXL3), mientras que el núcleo denso (atención, proyecciones FFN densas y compartidas, y cabeza de salida) se ejecuta para cada token. Esta cuantización no entrena el modelo: parte de `stepfun-ai/Step-5-Preview-BF16@7734b7ffac118d70d8398bfa3eb0fab007eb45b1` y aplica cuantización post-entrenamiento con EXL3 MCG.

El proceso de cuantización usó 1.426 prompts (1.105.269 tokens de Step) del dataset `wrldsuksgo2mars/agentic-quant-panel-v1`, un panel de calibración con código fuente real, matemáticas resueltas, esquemas de function calling y texto multilingüe, usando la plantilla nativa de chat/thinking, orden original de prompts y batch uno, sin padding, packing ni truncado. Se aplicó calibración causal intercalada de núcleo y expertos, con predecesores reconstruidos alimentando a cada sucesor y SwiGLU nativo con clamp alimentando la captura de la proyección down. Los expertos enrutados usan K4 en las capas 3-87 (89.760 matrices gate/up/down) y K6 en las capas 88-90 (3.168 matrices), por lo que es un checkpoint mixto K4/K6, no uniforme. Las tres etapas MTP están incluidas: la vista `original` usa matrices MTP BF16 nativas con su propia cabeza por etapa, mientras que las vistas compactas comparten 27 matrices MTP K4 almacenadas una sola vez. El cuantizador es `tpurtell/GPTQModel` en commits concretos (`25dd11c391ce6bf3ceadf8722e8274c3cde7079a` para expertos K4/K6 y núcleo K6; `1f920091232cc670ac67c233391d1a771f29f996` para núcleo K8), con soporte upstream parcial para el núcleo/MTP de Step y necesidad de una extensión no upstream para el adaptador K1-K8 del núcleo K8.

## Capacidades

- Generación de texto conversacional multi-turno con plantilla nativa de chat y modo thinking.
- Procesamiento de imagen y texto (pipeline `image-text-to-text`), con torre de visión mantenida en formato nativo.
- Razonamiento matemático, apoyado por calibración sobre matemáticas resueltas.
- Generación y comprensión de código, con calibración sobre código fuente real.
- Soporte de tool calling / function calling, con calibración sobre esquemas de llamadas a funciones.
- Razonamiento multi-paso y uso en agentes, coherente con el panel de calibración orientado a uso agéntico.
- Capacidades multilingües, aunque no se detalla la lista de idiomas soportados.
- Multi-token prediction (MTP) en las tres etapas, incluido en el checkpoint.
- Selección de núcleo denso en carga (`original`, `k8-compact`, `k6-compact`) para ajustar memoria y fidelidad.

## Casos de uso

- Asistencia de código en producción: el modelo se calibró con código fuente real y esquemas de function calling, por lo que puede integrarse en pipelines de revisión, generación de parches y autocompletado asistido con llamadas a herramientas.
- Agentes de automatización con tool calling: la calibración sobre esquemas de funciones y el soporte MTP lo hacen adecuado para flujos multi-paso donde el modelo decide qué herramienta invocar y encadena resultados.
- Razonamiento matemático asistido: útil para resolver problemas paso a paso, verificar cálculos y generar explicaciones, gracias al modo thinking y a la calibración sobre matemáticas resueltas.
- Análisis de documentos con imagen y texto: al ser un modelo image-text-to-text, puede procesar capturas, diagramas o documentos escaneados junto a instrucciones textuales.
- Atención al cliente multilingüe: la calibración incluye texto multilingüe y plantilla conversacional, lo que permite gestionar diálogos multi-turno, aunque la lista exacta de idiomas no está publicada.
- Evaluación comparativa de cuantizaciones: las tres vistas de núcleo permiten medir en un mismo checkpoint el impacto de BF16 frente a EXL3 K8 y K6 en tareas de código, matemáticas y agentes.
- Despliegue en infraestructura con memoria limitada: la vista `k6-compact` (293,7 GiB de payload de tensores) reduce el almacenamiento respecto a `original` (312,0 GiB), útil cuando el presupuesto de disco o de carga es restrictivo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El payload de tensores del checkpoint es de 312,0 GiB (`original`), 296,7 GiB (`k8-compact`) y 293,7 GiB (`k6-compact`); estos tamaños no equivalen a requisitos de VRAM en runtime.
- GPU recomendadas: no disponible. Por el tamaño del checkpoint, no cabe en GPUs de consumo individuales; requiere despliegue multi-GPU o multi-nodo de gama profesional/datacenter.
- ¿Cabe en GPU de consumo? No, según el tamaño de payload publicado.
- Opciones de despliegue: el checkpoint está construido para el runtime `cuteafd` (repositorio `tpurtell/cuteafd`), con selección de vista mediante `CORE_VIEW=original|k8-compact|k6-compact`. No se documentan vLLM, llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros totales | Contexto | Cuantización | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Step-5 Preview EXL3 K4-MC (este) | 172.899.199.808 | no disponible | EXL3 K4/K6 expertos, núcleo BF16/K8/K6 | stepfun-model-license-1.0 | Hugging Face, runtime cuteafd |
| stepfun-ai/Step-5-Preview-BF16 | no disponible en la información | no disponible | BF16 | stepfun-model-license-1.0 | Hugging Face |
| Otras cuantizaciones comunitarias de Step-5 Preview | no disponible | no disponible | no disponible | stepfun-model-license-1.0 | no disponible |

No se dispone de datos de benchmarks ni de especificaciones completas de alternativas comparables en la información proporcionada.

## Limitaciones y advertencias

- La licencia es `stepfun-model-license-1.0` (license: other), no una licencia de código abierto permisiva; es necesario revisar el texto de la licencia antes de cualquier uso comercial.
- El checkpoint está pensado para el runtime `cuteafd`; no se garantiza compatibilidad con vLLM, llama.cpp, Ollama, TGI u otros servidores estándar.
- El soporte del cuantizador para el núcleo K8 requiere una extensión no upstream (`tpurtell/GPTQModel#5`); la validación upstream de proyecciones Step solo acepta K4/K5/K6 y la de GLM compartido solo K4/K6.
- La cuantización es post-entrenamiento: puede introducir degradación respecto al BF16 original, especialmente en las capas enrutadas K4 y en el núcleo K6.
- No se publican idiomas soportados ni longitud de contexto, lo que dificulta planificar despliegues multilingües o de contexto largo.
- No hay benchmarks publicados que permitan cuantificar la pérdida de calidad frente al modelo base.
- El dataset de calibración no registra revisión ni split en los metadatos del repositorio, lo que limita la reproducibilidad exacta.
- Riesgo de alucinación y sesgos: no documentado en la información disponible; aplican los riesgos habituales de los modelos generativos de gran escala.
- El número de descargas (40) y likes (0) indica una adopción muy limitada; conviene validar el checkpoint en el caso de uso concreto antes de producción.

## Enlaces

- Hugging Face: https://huggingface.co/wrldsuksgo2mars/Step-5-Preview-EXL3-K4-MC
- Modelo base: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16
- Licencia: https://huggingface.co/stepfun-ai/Step-5-Preview-BF16/blob/7734b7ffac118d70d8398bfa3eb0fab007eb45b1/LICENSE.txt
- Dataset de calibración: https://huggingface.co/datasets/wrldsuksgo2mars/agentic-quant-panel-v1
- Runtime cuteafd: https://github.com/tpurtell/cuteafd
- Formato MC: https://github.com/tpurtell/cuteafd/blob/dev/docs/mc-checkpoints.md
- Cuantizador GPTQModel: https://github.com/tpurtell/GPTQModel
- PR upstream de soporte Step: https://github.com/ModelCloud/GPTQModel/pull/3612
- PR upstream de soporte GLM compartido: https://github.com/ModelCloud/GPTQModel/pull/3609
- PR de extensión K1-K8: https://github.com/tpurtell/GPTQModel/pull/5
