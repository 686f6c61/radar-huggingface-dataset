# Zidane29/Kimi-K3

## Resumen

Kimi K3 es un modelo de lenguaje multimodal nativo de código abierto desarrollado por Moonshot AI, presentado como el primer modelo abierto de clase 3T (2,8 billones de parámetros). Está diseñado para tareas de razonamiento avanzado, codificación de largo horizonte y trabajo de conocimiento agéntico, con capacidades nativas de visión (imagen y vídeo) y una ventana de contexto de 1 millón de tokens. Su arquitectura se basa en dos innovaciones propias: Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un marco Stable LatentMoE que activa 16 de 896 expertos por token, logrando aproximadamente 104 000 millones de parámetros activos.

El modelo se publica bajo la licencia Kimi K3 License, que permite uso comercial con restricciones específicas, y sus pesos completos están disponibles en Hugging Face. Este lanzamiento representa un hito en la democratización de modelos de frontera, ya que por primera vez un modelo de esta escala se ofrece abiertamente para investigación y despliegue, compitiendo directamente con modelos propietarios de mayor tamaño. La versión alojada en Hugging Face corresponde a un repositorio de la comunidad (usuario Zidane29) que replica la model card oficial de Moonshot AI, aunque los pesos son los oficiales.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2 779 931 837 184 (~2,8 billones) |
| Parametros activos | 104 000 millones (16 de 896 expertos por token) |
| Longitud de contexto | 1 000 000 tokens |
| Tipos de cuantizacion | No disponible (el repositorio indica compresión de tensores y precisión de 8 bits, pero sin detalles específicos) |
| Idiomas soportados | No disponible (la model card no especifica lista de idiomas) |
| Licencia | Kimi K3 License (license: other, license_name: "kimi-k3") |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE con 93 capas, de las cuales 69 son capas de atención KDA y 24 son capas Gated MLA (Multi-head Latent Attention). La dimensión de atención oculta es de 7168 con 96 cabezas de atención. El componente MoE latente tiene una dimensión de 3584 y cada experto dispone de una dimensión oculta de 3072. El modelo activa 16 de 896 expertos por token, lo que proporciona una eficiencia de escalado aproximadamente 2,5 veces superior a la de Kimi K2, según la model card. La innovación principal reside en Kimi Delta Attention, que introduce un mecanismo de atención con residuales que mejora la estabilidad del entrenamiento y la capacidad de representación, junto con Attention Residuals que permiten una propagación más eficiente de gradientes en modelos de gran escala.

No se han publicado detalles sobre el conjunto de datos de entrenamiento, el número total de tokens procesados ni el uso de técnicas de alineación como RLHF o DPO. La model card menciona que el modelo es "nativo multimodal", lo que implica que fue entrenado desde cero con datos de texto, imagen y vídeo, aunque no se especifican las proporciones ni las fases de entrenamiento. Tampoco se detalla si se utilizó decodificación especulativa u otras técnicas de inferencia acelerada, aunque el etiquetado de "compressed-tensors" sugiere que se han aplicado métodos de compresión para reducir el tamaño de los pesos.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo matemáticas, lógica y análisis multi-paso.
- Codificación de largo horizonte: capaz de mantener sesiones de ingeniería prolongadas con supervisión mínima, navegar repositorios masivos y orquestar herramientas de terminal.
- Comprensión multimodal nativa: procesa texto, imágenes y vídeo dentro de un mismo modelo sin módulos externos.
- Razonamiento agéntico: soporta planificación de tareas, uso de herramientas y ejecución de flujos de trabajo autónomos.
- Generación de contenido visual interactivo: produce dashboards, widgets, visualizaciones y edición de vídeo a partir de instrucciones de alto nivel.
- Ventana de contexto de 1 millón de tokens, adecuada para documentos extensos, repositorios de código completos o conversaciones de muy larga duración.
- Soporte de tool calling y function calling, aunque no se detalla explícitamente en la documentación proporcionada, se infiere por su naturaleza agéntica.

## Casos de uso

- Desarrollo de software autónomo: el modelo puede gestionar tareas de programación de larga duración, como optimización de kernels GPU, desarrollo de compiladores o integración continua, gracias a su capacidad de razonamiento multi-paso y su ventana de contexto de 1M tokens que permite cargar repositorios completos.
- Investigación y análisis de documentación técnica: con 1M tokens de contexto, puede procesar manuales extensos, papers académicos o especificaciones de producto completas para extraer conclusiones y generar resúmenes detallados.
- Asistente de diseño asistido por ordenador (CAD): su capacidad de visión nativa le permite interpretar planos y generar código para modelado 3D, como se menciona en la model card para casos de diseño de chips.
- Creación de contenido multimedia: puede generar dashboards interactivos, animaciones y editar vídeo a partir de instrucciones en lenguaje natural, combinando comprensión visual y generación de código.
- Atención al cliente avanzada: con contexto largo y multimodalidad, puede manejar conversaciones que incluyen capturas de pantalla, vídeos o documentos adjuntos, manteniendo el hilo durante interacciones extensas.
- Automatización de flujos de trabajo agénticos: en entornos empresariales, puede actuar como un agente que planifica, ejecuta y verifica tareas complejas, como la generación de informes financieros con visualizaciones integradas o la gestión de proyectos de ingeniería.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La model card menciona que el modelo ocupa el primer puesto en Frontend Code Arena, pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estándar. Tampoco se ofrecen comparativas numéricas con otros modelos. Por tanto, no es posible presentar una tabla de resultados verificada.

## Requisitos de hardware

- El modelo tiene 2,8 billones de parámetros totales, lo que hace inviable su ejecución en una sola GPU incluso con cuantización agresiva. En FP16, los pesos ocupan aproximadamente 5,6 TB; en 8 bits, 2,8 TB; en 4 bits, 1,4 TB.
- Para inferencia con cuantización de 8 bits, se necesitarían al menos 4 GPU NVIDIA H100 de 80 GB (3,2 TB totales) o equivalentes, asumiendo que el modelo se distribuye en paralelo.
- En configuraciones con cuantización de 4 bits, el requisito baja a unas 2 GPU H100 de 80 GB, aunque la latencia y la precisión pueden verse afectadas.
- No es viable en GPUs de consumo (RTX 4090, 3090, etc.) debido al tamaño total de los pesos.
- Para despliegue, se recomienda usar frameworks de inferencia distribuida como vLLM, TensorRT-LLM o TGI, junto con paralelismo de tensores y de pipeline.
- El repositorio de Hugging Face ocupa 1561 GB, lo que implica que la descarga y el almacenamiento requieren infraestructura de alto rendimiento.
- No se dispone de datos de latencia o throughput estimados en la documentación proporcionada.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa cuantitativa con otros modelos de la misma categoría. La model card menciona que Kimi K3 supera a Kimi K2 en eficiencia de escalado (2,5×), pero no se ofrecen especificaciones detalladas de Kimi K2. Tampoco se proporcionan datos comparativos con otros modelos abiertos de gran escala como DeepSeek V3 o Llama 4. Por tanto, la comparativa queda pendiente de datos públicos verificados.

## Limitaciones y advertencias

- El tamaño del modelo (2,8T parámetros) hace que su despliegue sea extremadamente costoso y requiera infraestructura de nivel de centro de datos, limitando su uso a organizaciones con grandes recursos.
- La licencia Kimi K3 License no es una licencia de código abierto estándar (como Apache 2.0 o MIT); impone condiciones específicas que deben revisarse antes de uso comercial, especialmente en lo relativo a responsabilidad y uso de servicios derivados.
- No se han publicado detalles sobre sesgos, alucinaciones o limitaciones idiomáticas; la model card no incluye advertencias específicas.
- El repositorio de Hugging Face no pertenece a la organización oficial de Moonshot AI (usuario Zidane29), lo que puede implicar riesgos de integridad o soporte limitado. Se recomienda verificar los pesos frente a las sumas de comprobación oficiales si están disponibles.
- La ventana de contexto de 1M tokens, aunque amplia, puede no ser suficiente para ciertos casos de uso extremos, y el rendimiento real con contextos tan largos no ha sido documentado públicamente.
- No se especifican los idiomas soportados; aunque probablemente incluya los principales, no hay garantía de cobertura multilingüe completa.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/Zidane29/Kimi-K3
- Página oficial del modelo: https://www.kimi.ai/ai-models/kimi-k3
- Blog técnico: https://www.kimi.com/blog/kimi-k3
- Reporte técnico (PDF): https://github.com/MoonshotAI/Kimi-K3/blob/main/k3_tech_report.pdf
- Documentación de API: https://platform.kimi.ai/docs/guide/kimi-k3-quickstart
- Guía no oficial: https://kimi-k3.dev/
- Página alternativa: https://openlm.ai/kimi-k3/
