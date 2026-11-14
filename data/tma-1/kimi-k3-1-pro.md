# TMA-1/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de lenguaje multimodal nativo y de tipo agéntico, desarrollado por Moonshot AI (el repositorio de Hugging Face que se analiza aquí, `TMA-1/Kimi-K3.1-Pro`, es una republicación de los pesos originales de Moonshot AI). Se trata del primer modelo de la serie K3.1 y, según su model card, el modelo de clase 3T más capaz de la compañía hasta la fecha. Está post-entrenado a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, y su rasgo más diferencial es una ventana de contexto de un millón de tokens combinada con capacidades multimodales (texto e imagen) y orientación a tareas agénticas.

Arquitectónicamente es un transformer de mezcla de expertos (MoE) con 2,8 billones de parámetros totales y 104.000 millones activados por token, distribuidos en 93 capas. Emplea una composición híbrida de atención con 69 capas KDA (atención lineal) y 24 capas Gated DSA (atención dispersa), lo que resulta clave para hacer viable el contexto de 1M tokens. El vocabulario es de 160.000 tokens y el modelo se distribuye en formato safetensors con cuantización de 8 bits mediante `compressed-tensors`.

Su relevancia actual radica en que compite directamente en la franja de modelos frontera de código abierto (open-weight) para tareas de programación, creación 3D, investigación financiera y flujos agénticos de múltiples pasos. No obstante, su escala (repositorio de 1,5 TB) lo sitúa fuera del alcance de hardware de consumo, y su licencia es personalizada (`kimi-k3.1-pro`), lo que exige revisión legal antes de cualquier uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con atención híbrida: 69 capas KDA + 24 capas Gated DSA |
| Parámetros totales | 2,8 billones (2.780.110.363.392 según safetensors) |
| Parámetros activos | 104.000 millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantización | 8 bits (compressed-tensors); otras cuantizaciones no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `kimi-k3.1-pro` (licencia personalizada, `license: other`) |
| Formato de pesos | safetensors (con `compressed-tensors`), código custom (`custom_code`) |

Otros datos arquitectónicos disponibles: 93 capas totales (1 capa densa), dimensión oculta de atención de 7168, 96 cabezas de atención, dimensión de cabeza del índice DSA de 128, 32 cabezas de índice DSA con top-K de 2048, dimensión latente MoE de 3584, dimensión oculta por experto de 3072, 896 expertos con 16 seleccionados por token y 2 expertos compartidos, y vocabulario de 160.000 tokens.

## Arquitectura y entrenamiento

Kimi K3.1 Pro es un transformer de mezcla de expertos con enrutamiento disperso: de los 896 expertos disponibles se activan 16 por token, más 2 expertos compartidos, lo que da lugar a 104.000 millones de parámetros activos sobre un total de 2,8 billones. La innovación más relevante está en la capa de atención: combina 69 capas de atención lineal KDA con 24 capas de atención dispersa Gated DSA (con top-K de 2048 sobre un índice de 32 cabezas). Esta hibridación reduce el coste computacional y de memoria del contexto largo, haciendo tratable la ventana de 1M tokens, y constituye el principal mecanismo técnico diferenciador frente a transformers densos convencionales.

En cuanto al entrenamiento, la model card indica que el modelo es multimodal nativo y que ha sido post-entrenado desde Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala en cientos de dominios downstream. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset, ni detalles sobre RLHF/DPO más allá de la mención al reinforcement learning conjunto. Tampoco se documentan técnicas de decodificación especulativa ni otros optimizadores de inferencia.

## Capacidades

- Generación de texto y conversación multi-turno con contexto de hasta 1M tokens.
- Razonamiento complejo y resolución de tareas de múltiples pasos (orientación agéntica).
- Programación y generación de código, con mejoras declaradas en coding respecto a Kimi K3.
- Creación 3D, según la model card.
- Investigación financiera y análisis de documentos extensos.
- Precisión factual mejorada (factual accuracy) respecto al modelo base.
- Procesamiento multimodal imagen-texto (pipeline `image-text-to-text`).
- Capacidades agénticas: uso de herramientas y razonamiento multi-step (declarado como modelo agéntico; detalles de tool calling no disponibles).
- Capacidades multilingües: no disponible (idiomas no especificados).

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto, el modelo puede ingerir repositorios completos, manuales o expedientes y responder preguntas cruzadas sin fragmentación, algo inviable en modelos con ventanas de 32K-128K.
- Agentes de programación autónomos: su orientación agéntica y su capacidad de código permiten integrarlo en bucles de planificación, edición y verificación sobre bases de código grandes, manteniendo el estado del proyecto en contexto.
- Investigación financiera asistida: análisis de informes anuales, transcripciones de resultados y series de datos en una sola pasada, con razonamiento multi-paso sobre cifras y comparativas entre ejercicios.
- Automatización de flujos multimodales: al ser imagen-texto, puede procesar capturas de pantalla, diagramas o documentos escaneados junto con instrucciones textuales para tareas de extracción y verificación.
- Creación y revisión de contenido 3D: generación de descripciones estructuradas, especificaciones y guiones para pipelines de creación 3D, aprovechando la mejora declarada en esta área.
- Atención al cliente de alta complejidad: conversaciones multi-turno con historial largo y acceso a políticas y documentación internas dentro del contexto, reduciendo la pérdida de información en interacciones prolongadas.
- Auditoría y verificación factual: revisión de borradores o respuestas contra fuentes extensas incluidas en el contexto, apoyándose en la mejora declarada de precisión factual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card menciona mejoras cualitativas en coding, creación 3D, investigación financiera y precisión factual, pero no incluye cifras de MMLU, HumanEval, GSM8K ni de otras evaluaciones.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión, pero el repositorio ocupa 1561,4 GB en cuantización de 8 bits, por lo que se requiere un clúster multi-GPU de gran escala (varios nodos con GPUs de 80 GB o superior).
- GPU recomendadas: no disponibles de forma oficial; por escala, se necesitan GPUs de centro de datos tipo H100/H200 o A100 de 80 GB en configuración multi-nodo. No cabe en ninguna GPU de consumo.
- Cabe en consumer GPU: no. Con 2,8 billones de parámetros y ~1,5 TB de pesos, queda muy lejos de los 24-48 GB de las RTX 4090/5090.
- Opciones de despliegue: transformers con `custom_code` y `compressed-tensors`; soporte de vLLM, llama.cpp, Ollama o TGI no disponible en la información proporcionada (llama.cpp y Ollama resultan inviables por tamaño).
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros totales / activos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8T / 104B (MoE) | 1M tokens | `kimi-k3.1-pro` (personalizada) | Pesos abiertos en HF (republicación TMA-1) |
| Kimi K3 | no disponible | no disponible | no disponible | Modelo base del que deriva K3.1 Pro |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos comparables (parámetros, contexto, rendimiento o licencia) que permitan una comparación cuantitativa rigurosa. La única referencia directa es Kimi K3, del que K3.1 Pro es un post-entrenamiento, pero sus especificaciones no se detallan.

## Limitaciones y advertencias

- Licencia personalizada (`kimi-k3.1-pro`, `license: other`): es imprescindible revisar el texto de la licencia antes de cualquier uso comercial; no se trata de una licencia open source estándar (Apache, MIT, etc.).
- Riesgo de alucinación: no se documentan en la información disponible las tasas de alucinación ni las mitigaciones específicas; un contexto de 1M tokens no elimina el riesgo y puede aumentar la dificultad de verificación.
- Idiomas soportados no especificados: no hay garantía documentada de calidad multilingüe fuera de los idiomas principales, presumiblemente inglés y chino.
- Sesgos: no se documentan sesgos conocidos ni evaluaciones de seguridad en la información disponible.
- Escala prohibitiva: ~1,5 TB de pesos en 8 bits y 2,8T de parámetros implican costes de despliegue muy elevados y una huella energética considerable; no es viable en entornos sin infraestructura de centro de datos.
- Republicación de terceros: el repositorio `TMA-1/Kimi-K3.1-Pro` tiene 0 descargas y 1 like, y no está verificado como canal oficial; conviene contrastar con el repositorio oficial de Moonshot AI antes de usarlo en producción.
- Dependencia de `custom_code`: requiere `trust_remote_code=True` en transformers, lo que implica ejecutar código del repositorio y añade superficie de riesgo.
- Detalles de tool calling y agentes no documentados: aunque el modelo se declara agéntico, no se especifican formatos de función ni protocolos soportados.

## Enlaces

- Repositorio analizado: https://huggingface.co/TMA-1/Kimi-K3.1-Pro
- Organización oficial en Hugging Face: https://huggingface.co/moonshotai
- Repositorio oficial (referencia de la model card): https://huggingface.co/moonshotai/Kimi-K3.1-Pro
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Quickstart de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- Chat: https://www.kimi.ai
- Página corporativa: https://www.moonshot.ai
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
- Licencia: https://huggingface.co/moonshotai/Kimi-K3.1-Pro/blob/main/LICENSE
