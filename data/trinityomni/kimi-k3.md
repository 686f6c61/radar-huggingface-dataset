# trinityomni/Kimi-K3

## Resumen

Kimi K3 es un modelo abierto de 2,8 billones de parámetros (2.8T) desarrollado por Moonshot AI, considerado el primer modelo abierto de clase 3T. Se trata de un modelo multimodal nativo (texto, imagen y vídeo) con arquitectura Mixture-of-Experts (MoE) que activa 16 de 896 expertos por token, resultando en 104B de parámetros activos. Incorpora innovaciones técnicas como Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un marco Stable LatentMoE que mejora la eficiencia de escalado en aproximadamente 2,5 veces respecto a Kimi K2. Su ventana de contexto alcanza 1 millón de tokens, lo que le permite manejar repositorios masivos, sesiones de codificación de largo horizonte y tareas de conocimiento agéntico con supervisión mínima. El modelo está diseñado para aplicaciones de frontera en ingeniería de software, investigación profunda, diseño asistido, edición de vídeo y razonamiento complejo. El repositorio en HuggingFace es una subida de la comunidad (trinityomni) de los pesos oficiales de Moonshot AI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) |
| Parametros totales | 2.779.931.837.184 (≈2.8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | 8-bit (según tags de HuggingFace); no se especifican otros tipos |
| Idiomas soportados | no disponible |
| Licencia | Kimi K3 License (license:other) |
| Formato de pesos | safetensors |
| Numero de capas | 93 (1 capa densa + 92 de atención) |
| Composicion de capas de atencion | 69 Kimi Delta Attention (KDA) + 24 Gated MLA |
| Dimension de atencion oculta | 7168 |
| Numero de cabezas de atencion | 96 |
| Dimension del Latent MoE | 3584 |
| Dimension oculta del MoE (por experto) | 3072 |
| Numero de expertos | 896 |
| Expertos seleccionados por token | 16 |

## Arquitectura y entrenamiento

Kimi K3 se construye sobre una arquitectura MoE híbrida que combina 69 capas de Kimi Delta Attention (KDA) con 24 capas de Gated Multi-head Latent Attention (MLA). La KDA es una innovación propia que, junto con Attention Residuals (AttnRes), permite escalar la atención a contextos muy largos manteniendo eficiencia computacional. El marco Stable LatentMoE activa 16 de los 896 expertos por token, con una dimensión oculta de 3072 por experto y una dimensión latente de 3584. La capa densa única actúa como punto de anclaje para la estabilidad del entrenamiento. Según la model card, esta configuración proporciona una mejora aproximada de 2,5 veces en eficiencia de escalado sobre Kimi K2. No se han proporcionado detalles sobre el dataset de entrenamiento, número de tokens, composición de datos ni procesos de alineación como RLHF o DPO en la información disponible.

## Capacidades

- Generación de texto avanzada con razonamiento complejo y capacidad de agente.
- Visión nativa: comprende imágenes y vídeo dentro del mismo modelo, sin módulos externos.
- Codificación de largo horizonte: mantiene sesiones de ingeniería prolongadas, navega repositorios masivos y orquesta herramientas de terminal.
- Trabajo de conocimiento agéntico: produce investigación profunda con visualizaciones interactivas, widgets, dashboards y material de diseño.
- Soporte de agentes y razonamiento multi-paso: puede encadenar acciones y herramientas para completar tareas end-to-end.
- Contexto de 1 millón de tokens, apto para procesar documentos extensos, repositorios completos o vídeos largos.
- Conversión de prompts en artefactos funcionales: juegos jugables, presentaciones pulidas e informes interactivos.
- Capacidades multimodales para tareas como diseño de movimiento, edición de vídeo y CAD.
- Soporte de tool calling y orquestación de herramientas de terminal, según la descripción de agente de la model card.

## Casos de uso

- Desarrollo de kernels GPU y compiladores: el modelo puede trabajar en sesiones largas de ingeniería con supervisión mínima, navegar por repositorios masivos y ejecutar herramientas de terminal para iterar sobre optimizaciones de bajo nivel.
- Investigación profunda automatizada: genera informes de investigación completos con visualizaciones interactivas, dashboards y widgets, aprovechando su capacidad de razonamiento y su contexto de 1M tokens para sintetizar fuentes extensas.
- Desarrollo de videojuegos con visión en el bucle: convierte prompts en juegos jugables, usando su comprensión multimodal para inspeccionar assets y ajustar la lógica del juego de forma iterativa.
- Diseño asistido por ordenador (CAD) y diseño de chips: aplicable a tareas técnicas de ingeniería que requieren razonamiento espacial y manejo de especificaciones complejas, gracias a su capacidad de agente y visión nativa.
- Edición de vídeo y motion design: aprovecha la multimodalidad para interpretar secuencias de vídeo y generar o modificar animaciones, transiciones y contenido visual.
- Generación de presentaciones y material corporativo: produce presentaciones pulidas y documentos interactivos a partir de prompts de alto nivel, reduciendo el tiempo de creación de contenido profesional.
- Análisis de documentación técnica extensa: gracias a la ventana de 1M tokens, puede procesar manuales, normativas o repositorios de código completos y responder preguntas sobre ellos.
- Agentes autónomos de conocimiento: ejecuta flujos de trabajo end-to-end en los que investiga, razona y genera entregables, operando con mínima intervención humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio es de 1561 GB, lo que indica que los pesos cuantizados ocupan del orden de 1,5 TB, muy por encima de la capacidad de una GPU individual.
- GPU recomendadas: no disponible. Dado el volumen de parámetros, se requiere infraestructura multi-GPU o un clúster de servidores.
- Capacidad en GPU de consumo: no viable. El modelo no cabe en GPUs de consumo convencionales.
- Opciones de despliegue: no se han especificado en la información disponible. Por su tamaño y formato, se espera soporte en frameworks de servidor como vLLM o TGI, pero no está confirmado.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información suficiente para una comparativa con modelos similares en los datos proporcionados. La model card indica que Kimi K3 ofrece una mejora aproximada de 2,5 veces en eficiencia de escalado sobre Kimi K2, pero no se aportan especificaciones ni resultados de benchmarks de otros modelos comparables.

## Limitaciones y advertencias

- Riesgo de alucinación: no documentado en la información proporcionada. Como todo modelo generativo, presenta riesgo inherente de generar contenido inexacto.
- Sesgos conocidos: no disponibles. No se han publicado evaluaciones de sesgos.
- Limitaciones de idioma: no se especifican los idiomas soportados, por lo que su rendimiento en lenguas distintas del inglés o chino no está garantizado.
- Restricciones de licencia: la licencia es personalizada (Kimi K3 License) y no se detalla en la información disponible si permite uso comercial o en qué condiciones. Es necesario revisar el texto completo de la licencia antes de cualquier despliegue.
- Limitaciones de contexto: aunque la ventana es de 1M tokens, el rendimiento en contextos muy largos puede degradarse en la práctica y no se han publicado evaluaciones específicas.
- Tamaño y despliegue: con 2.8T de parámetros, el modelo requiere infraestructura masiva y no es apto para entornos de consumo o aplicaciones con recursos limitados.
- Autenticidad del repositorio: el repositorio en HuggingFace es una subida de la comunidad (trinityomni) y no el repositorio oficial de Moonshot AI. Se recomienda verificar la integridad de los pesos y consultar las fuentes oficiales.

## Enlaces

- HuggingFace: https://huggingface.co/trinityomni/Kimi-K3
- Web oficial de Kimi: https://www.kimi.com
- Moonshot AI: https://www.moonshot.ai
- Blog técnico de Kimi K3: https://www.kimi.com/blog/kimi-k3
- Informe técnico completo (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- ModelScope: https://modelscope.cn/organization/moonshotai
- Twitter de Kimi: https://twitter.com/kimi_moonshot
- Discord de Kimi: https://discord.gg/TYU2fdJykW
- OpenLM.ai (análisis): https://openlm.ai/kimi-k3/
