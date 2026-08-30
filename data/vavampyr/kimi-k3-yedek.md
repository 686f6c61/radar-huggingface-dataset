# vavampyr/Kimi-K3-Yedek

## Resumen

Kimi K3 es un modelo de lenguaje de código abierto desarrollado por Moonshot AI, presentado como el primer modelo abierto de clase 3T (2,8 billones de parámetros). Está diseñado para tareas de razonamiento avanzado, codificación de largo alcance y trabajo de conocimiento agéntico, con capacidades multimodales nativas que integran texto, imagen y vídeo en un único modelo. Su arquitectura combina Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) sobre un marco MoE disperso denominado Stable LatentMoE, que activa únicamente 16 de los 896 expertos por token, logrando una eficiencia de escalado aproximadamente 2,5 veces superior a la de su predecesor Kimi K2.

El modelo soporta una ventana de contexto de un millón de tokens, lo que lo habilita para procesar repositorios de código completos, documentos extensos y sesiones de trabajo prolongadas con supervisión humana mínima. Su publicación bajo la licencia Kimi K3 y la liberación de los pesos completos lo convierten en una opción relevante para investigación y despliegue en entornos de producción que requieran inteligencia de frontera sin depender de servicios propietarios. El lanzamiento oficial está previsto para julio de 2026, con pesos abiertos y acceso a través de API y plataformas como Databricks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8 billones (2.779.931.837.184 en safetensors) |
| Parametros activos | 104 mil millones |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | no disponible (el repositorio incluye etiqueta "8-bit", sin especificar formato) |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 (licencia propia, "kimi-k3") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 utiliza una arquitectura MoE con 93 capas, de las cuales una es densa y el resto se distribuyen en 69 capas con Kimi Delta Attention (KDA) y 24 capas con Gated MLA (Multi-head Latent Attention). La dimensión oculta de atención es 7168, con 96 cabezas de atención y una dimensión latente MoE de 3584. Cada experto tiene una dimensión oculta de 3072, y el modelo activa 16 de los 896 expertos por token mediante el marco Stable LatentMoE, que introduce un mecanismo de sparsity estable para mejorar la eficiencia de escalado. Esta combinación permite reducir el coste computacional por token mientras se mantiene una capacidad de representación equivalente a un modelo denso mucho mayor.

El entrenamiento incorpora capacidades multimodales nativas, lo que implica que el modelo procesa texto, imágenes y vídeo dentro del mismo espacio de representación, sin módulos separados. No se han publicado detalles específicos sobre el número de tokens de entrenamiento, la composición exacta del dataset o el uso de técnicas de alineación como RLHF o DPO en la información disponible. La innovación principal reside en la arquitectura de atención (KDA y AttnRes) que mejora la eficiencia computacional y la estabilidad del entrenamiento a escala.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas, lógica y análisis de documentos extensos.
- Generación de código de largo alcance: mantiene sesiones de ingeniería prolongadas, navega por repositorios masivos y orquesta herramientas de terminal (compiladores, depuradores, entornos de desarrollo).
- Comprensión multimodal nativa: procesa texto, imágenes y vídeo dentro del mismo modelo, permitiendo tareas como diseño asistido por visión, edición de vídeo y creación de contenido visual.
- Soporte de agentes y razonamiento multi-paso: puede ejecutar flujos de trabajo complejos con supervisión mínima, incluyendo integración con herramientas externas (tool calling) para automatización.
- Capacidad de contexto largo: ventana de 1M tokens para manejar libros completos, bases de código enteras o conversaciones de larga duración.
- Capacidades de creación de contenido interactivo: genera visualizaciones, paneles, widgets y presentaciones, así como desarrollo de juegos y diseño CAD.

## Casos de uso

- Desarrollo de software a gran escala: el modelo puede operar sobre repositorios completos, refactorizar código, escribir pruebas y realizar optimizaciones de GPU o compiladores, gracias a su ventana de 1M tokens y su capacidad para mantener estado durante sesiones largas.
- Automatización de tareas de conocimiento: investigación profunda con generación de informes interactivos, visualizaciones de datos y paneles personalizados, aprovechando su multimodalidad para integrar gráficos y texto.
- Diseño asistido por ordenador (CAD) y diseño de chips: su razonamiento espacial y comprensión de imágenes permiten asistir en tareas de diseño técnico que requieren iteración visual y lógica.
- Desarrollo de juegos con bucle de visión: el modelo puede generar código de juego, interpretar capturas de pantalla y ajustar mecánicas en tiempo real, gracias a su capacidad multimodal y de ejecución de agentes.
- Edición de vídeo y motion design: procesa secuencias de vídeo y genera guiones, storyboards o ediciones automáticas, integrando comprensión temporal y textual.
- Asistencia en entornos de investigación científica: análisis de literatura extensa, extracción de datos de imágenes y generación de hipótesis, con contexto suficiente para mantener coherencia en proyectos de larga duración.

## Benchmarks y rendimiento

No se han publicado resultados cuantitativos de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La documentación menciona que Kimi K3 ocupa el primer puesto en el Frontend Code Arena, pero no se proporcionan métricas numéricas comparativas. Se recomienda consultar el informe técnico completo (enlace en la sección de enlaces) para obtener datos de evaluación detallados cuando estén disponibles.

## Requisitos de hardware

- El repositorio tiene un tamaño de 1561 GB en formato safetensors, lo que implica que la inferencia requiere un clúster multi-GPU de alta gama. No se especifican requisitos mínimos oficiales en la información proporcionada.
- Para cargar los pesos completos en precisión BF16, se necesitarían aproximadamente 2,8 TB de VRAM, lo que excede la capacidad de cualquier GPU individual. Se requerirían al menos 8 GPU H100 (80 GB) o equivalentes, y probablemente más para activar los 104B parámetros activos con memoria intermedia.
- Con cuantización de 8 bits, el modelo ocuparía alrededor de 1,4 TB, aún muy por encima de las capacidades de hardware de consumo. No se dispone de información sobre cuantizaciones de 4 bits para este modelo.
- Opciones de despliegue: se puede servir mediante frameworks como vLLM o TensorRT-LLM, aunque no se confirma su compatibilidad en la documentación. Dado su tamaño, el despliegue en producción requiere infraestructura de centro de datos.
- Latencia y throughput: no disponibles en la información pública.

## Comparativa con modelos similares

No se dispone de datos cuantitativos de comparación con otros modelos en la información proporcionada. Kimi K3 se posiciona como el primer modelo abierto de clase 3T, superando en escala a modelos abiertos anteriores como Kimi K2 (que tenía 1T de parámetros) o DeepSeek-V3 (671B). Su arquitectura MoE con 896 expertos y 104B activos ofrece una eficiencia de cómputo superior a un modelo denso equivalente, pero no hay benchmarks públicos que permitan una comparación directa con alternativas como Llama 4 o Qwen3-Max en el momento de redactar esta ficha. Se recomienda consultar el informe técnico para obtener evaluaciones comparativas.

## Limitaciones y advertencias

- El modelo es extremadamente grande (2,8T parámetros), lo que limita su uso a organizaciones con infraestructura de cómputo sustancial. No es viable en hardware de consumo.
- La licencia Kimi K3 es propietaria ("kimi-k3"), no una licencia open source estándar. Aunque los pesos son abiertos, los términos de uso comercial pueden tener restricciones específicas que deben revisarse antes de su implementación en producción.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones idiomáticas. Al ser un modelo entrenado principalmente con datos en inglés y chino (presumiblemente, aunque no se confirma), su rendimiento en otros idiomas puede ser inferior.
- La ventana de contexto de 1M tokens, aunque amplia, puede no ser suficiente para ciertos casos de uso extremos, y el coste computacional de atender a contextos tan largos es significativo.
- El modelo se encuentra en fase de lanzamiento (julio de 2026); la documentación y los benchmarks pueden estar incompletos o cambiar tras la publicación final.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/vavampyr/Kimi-K3-Yedek
- Repositorio oficial en GitHub: https://github.com/MoonshotAI/Kimi-K3
- Informe técnico (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Blog técnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Página del modelo en el sitio de Kimi: https://www.kimi.ai/ai-models/kimi-k3
- Documentación de la API de Kimi: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Anuncio en Databricks: https://www.databricks.com/blog/kimi-k3-moonshot-ai-now-available-databricks-through-unity-ai-gateway
