# XURMATRONIX/Kimi-K3.1-Pro

## Resumen

Kimi K3.1 Pro es un modelo de pesos abiertos, nativamente multimodal y orientado a tareas agénticas, desarrollado por Moonshot AI. Se presenta como el modelo más capaz de la clase 3T de la compañía y el primero de la serie K3.1. Está post-entrenado a partir de Kimi K3 mediante aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios, y su ventana de contexto alcanza el millón de tokens. El repositorio de Hugging Face analizado (XURMATRONIX/Kimi-K3.1-Pro) es una publicación de terceros que replica la model card oficial de Moonshot AI.

La arquitectura es un transformer con mezcla de expertos (MoE) de 2,8 billones de parámetros totales y 104.000 millones activados por token, distribuidos en 93 capas (una de ellas densa). Combina 69 capas de atención KDA con 24 capas de Gated DSA, e incorpora 896 expertos con 16 seleccionados por token más 2 expertos compartidos. El vocabulario es de 160.000 tokens.

Su relevancia actual radica en la combinación de escala extrema, contexto de un millón de tokens y capacidades multimodales (texto e imagen) en un único modelo de pesos abiertos, lo que lo sitúa en la categoría de modelos frontera desplegables en infraestructura propia, con las limitaciones de hardware que ello implica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) sobre transformer, con atencion hibrida KDA + Gated DSA |
| Parametros totales | 2,8 T (2.780.110.363.392 segun safetensors) |
| Parametros activos | 104 B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (compressed-tensors); no se detallan otras variantes |
| Idiomas soportados | no disponible |
| Licencia | other, con nombre "kimi-k3.1-pro" (terminos propios, no disponibles en la informacion proporcionada) |
| Formato de pesos | safetensors, con compressed-tensors y custom_code |
| Capas totales | 93 (1 densa) |
| Composicion de atencion | 69 KDA + 24 Gated DSA |
| Dimension oculta de atencion | 7168 |
| Cabezas de atencion | 96 |
| Dimension de cabeza de indice DSA | 128 |
| Cabezas de indice DSA | 32 |
| Top-K de indice DSA | 2048 |
| Dimension latente MoE | 3584 |
| Dimension oculta MoE por experto | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |
| Expertos compartidos | 2 |
| Tamano de vocabulario | 160K |
| Tamano del repositorio | 1561,4 GB |
| Pipeline | image-text-to-text |

## Arquitectura y entrenamiento

El modelo emplea una arquitectura MoE con 93 capas, de las cuales solo una es densa. La atención no es uniforme: 69 capas usan KDA y 24 usan Gated DSA (atención dispersa con compuerta), una combinación orientada a sostener ventanas de contexto muy largas con un coste de atención controlado. La capa MoE opera en un espacio latente de 3584 dimensiones, con 896 expertos de 3072 dimensiones ocultas cada uno, 16 expertos seleccionados por token y 2 expertos compartidos, lo que resulta en 104.000 millones de parámetros activos sobre un total de 2,8 billones.

Según la model card, el post-entrenamiento parte de Kimi K3 y aplica aprendizaje por refuerzo conjunto a gran escala sobre cientos de dominios downstream. No se especifican en la información disponible el número de tokens de preentrenamiento, la composición del dataset, ni detalles sobre RLHF o DPO más allá de la mención al RL conjunto. Tampoco se detallan innovaciones adicionales como decodificación especulativa.

## Capacidades

- Generación de texto conversacional multi-turno, con pipeline declarado image-text-to-text.
- Procesamiento nativo de imágenes junto a texto (modelo multimodal nativo).
- Razonamiento agéntico: la model card lo describe como modelo agéntico y menciona mejoras en capacidades agénticas.
- Generación de código y tareas de programación.
- Creación 3D, según las mejoras declaradas por el autor.
- Investigación financiera, según las mejoras declaradas por el autor.
- Precisión factual, según las mejoras declaradas por el autor.
- Contexto de hasta un millón de tokens para documentos y conversaciones extensas.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Soporte explícito de agentes multi-paso: no disponible en detalle; solo se indica orientación agéntica.
- Capacidades multilingües: no disponible.
- Modo thinking explícito: no disponible en la información proporcionada.

## Casos de uso

- Análisis de repositorios completos: con un millón de tokens de contexto, el modelo puede ingerir bases de código extensas y responder preguntas de arquitectura, dependencias o refactorización sin trocear el código en fragmentos que pierdan coherencia global.
- Asistentes de investigación documental: procesamiento de corpus legales, financieros o científicos de cientos de miles de tokens en una sola pasada, útil para resúmenes cruzados y extracción de hechos con trazabilidad al documento original.
- Automatización de flujos agénticos: al estar post-entrenado con RL sobre dominios downstream y presentarse como modelo agéntico, encaja en pipelines donde el modelo planifica pasos, consulta herramientas y valida resultados intermedios.
- Generación y revisión de código en producción: integración en pipelines de CI/CD para revisión de pull requests, generación de tests y detección de regresiones, aprovechando sus capacidades de código declaradas.
- Análisis multimodal de documentos: al ser image-text-to-text, puede procesar capturas, diagramas, tablas escaneadas y documentación técnica mixta junto al texto asociado.
- Investigación financiera asistida: extracción y síntesis de informes, comparación de estados financieros y generación de borradores analíticos, un dominio que la model card destaca explícitamente.
- Creación 3D y prototipado: generación de descripciones estructuradas, scripts de modelado o especificaciones para herramientas de creación 3D, otra capacidad destacada por el autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 2,8 billones de parámetros, incluso en 8-bit el modelo requiere del orden de 2,8 TB de memoria, muy por encima de cualquier GPU individual. El repositorio ocupa 1561,4 GB, lo que sugiere pesos ya comprimidos, pero la inferencia necesita agregar memoria para KV cache y activaciones.
- GPU recomendadas: no disponibles en la información proporcionada. Por escala, el despliegue exigiría clústeres multi-nodo con GPUs de centro de datos (A100, H100, H200 o equivalentes) y paralelismo tensorial y de expertos.
- GPU de consumo: no cabe en ninguna GPU consumer (RTX 4090, 3090, etc.) ni en configuraciones multi-GPU de consumo.
- Opciones de despliegue: la librería declarada es transformers con custom_code y compressed-tensors; no se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible. llama.cpp y Ollama quedan descartados por tamaño.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros totales | Parametros activos | Contexto | Licencia | Multimodal | Disponibilidad |
|---|---|---|---|---|---|---|
| Kimi K3.1 Pro | 2,8 T | 104 B | 1.000.000 | other (kimi-k3.1-pro) | Si (image-text-to-text) | Pesos en HF (repo de terceros) |
| Kimi K3 | no disponible | no disponible | no disponible | no disponible | no disponible | Referenciado como base del post-entrenamiento |
| Alternativas de clase 3T | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos verificables de otros modelos comparables en la información proporcionada; la comparativa con alternativas concretas queda como no disponible.

## Limitaciones y advertencias

- El repositorio analizado pertenece a XURMATRONIX, no a Moonshot AI; se trata de una publicación de terceros que replica la model card oficial. Conviene verificar la procedencia de los pesos antes de usarlos en producción.
- La licencia es "other" con nombre "kimi-k3.1-pro"; los términos exactos no están disponibles en la información proporcionada, por lo que el uso comercial no puede confirmarse sin consultar el fichero LICENSE del repositorio oficial.
- Riesgo de alucinación inherente a los modelos generativos; la model card menciona mejoras en precisión factual, pero no se aportan métricas que lo cuantifiquen.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar calidad fuera de los idiomas cubiertos por el entrenamiento.
- El tamaño de 2,8 billones de parámetros hace inviable el despliegue fuera de infraestructura de centro de datos; la latencia y el coste operativo no están documentados.
- Solo se declara cuantización en 8-bit; no hay variantes GGUF ni formatos ligeros para hardware de consumo.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que impide validar su uso por la comunidad.
- No se documentan limitaciones específicas de contexto largo (degradación en ventanas de un millón de tokens) ni de tool calling.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/XURMATRONIX/Kimi-K3.1-Pro
- Repositorio oficial de Moonshot AI en Hugging Face: https://huggingface.co/moonshotai
- Chat oficial: https://www.kimi.ai
- Página de Moonshot AI: https://www.moonshot.ai
- Blog técnico: https://www.kimi.ai/blog/kimi-k3-1-pro
- Guía rápida de API: https://platform.kimi.ai/docs/guide/kimi-k3-1-pro-quickstart
- X (Twitter): https://twitter.com/kimi_moonshot
- Discord: https://discord.gg/TYU2fdJykW
- ModelScope: https://modelscope.cn/organization/moonshotai
