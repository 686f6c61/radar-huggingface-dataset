# unsloth/Kimi-K3-GGUF

## Resumen

Kimi K3 es un modelo de lenguaje de última generación desarrollado por Moonshot AI, liberado con pesos abiertos y cuantizado a formato GGUF por Unsloth para su ejecución local. Se trata del primer modelo abierto de clase 3T (2,8 billones de parámetros totales) con una arquitectura Mixture-of-Experts (MoE) que activa únicamente 104B parámetros por token, lo que lo sitúa en la frontera de la inteligencia artificial generativa. Su diseño incorpora innovaciones como Kimi Delta Attention (KDA) y Attention Residuals (AttnRes), junto con un marco Stable LatentMoE que escala la dispersión de expertos de forma eficiente.

El modelo destaca por su naturaleza multimodal nativa (texto, imagen y vídeo), una ventana de contexto de 1 millón de tokens y capacidades agénticas avanzadas, orientadas a tareas de codificación de largo horizonte, trabajo de conocimiento y razonamiento complejo. La versión GGUF de Unsloth permite ejecutarlo en hardware local mediante cuantizaciones dinámicas, reduciendo el peso desde 1,56 TB (precisión completa) hasta 594 GB en su versión de 1 bit, lo que democratiza el acceso a un modelo de esta escala. Su relevancia actual radica en que rivaliza con modelos propietarios como Claude 4.8 Opus o GPT-5.6, pero con la ventaja de ser abierto y desplegable en infraestructura propia.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) con Kimi Delta Attention (KDA) y Attention Residuals (AttnRes) |
| Parametros totales | 2,8 billones (2.8T) |
| Parametros activos | 104B |
| Longitud de contexto | 1.000.000 tokens |
| Tipos de cuantizacion | Unsloth Dynamic GGUF: UD-Q8_K_XL, UD-Q4_K_XL, 1-bit (594 GB), entre otras |
| Idiomas soportados | No especificado (probablemente multilingüe, pero no confirmado) |
| Licencia | Kimi K3 License (licencia propia, no OSI) |
| Formato de pesos | GGUF (cuantizaciones Unsloth Dynamic) |

## Arquitectura y entrenamiento

Kimi K3 emplea una arquitectura MoE con 896 expertos, de los cuales se activan 16 por token, logrando una eficiencia de escalado aproximadamente 2,5 veces superior a la de Kimi K2. La capa de atención combina 69 capas KDA (Kimi Delta Attention) con 24 capas Gated MLA (Multi-head Latent Attention), más una capa densa, sumando 93 capas en total. La dimensión oculta de atención es de 7168, con 96 cabezas de atención, y la dimensión del MoE latente es de 3584. Cada experto tiene una dimensión oculta de 3072.

La innovación principal reside en KDA y AttnRes, que mejoran la eficiencia del entrenamiento y la inferencia al reducir la redundancia en la atención. El marco Stable LatentMoE permite escalar la dispersión de expertos de forma estable, activando solo 16 de 896 expertos por token. No se dispone de información pública sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de técnicas de alineación como RLHF o DPO. El modelo utiliza MXFP4 (formato de punto flotante de 4 bits) para la representación de pesos en precisión completa.

## Capacidades

- Generación de texto y razonamiento complejo, incluyendo tareas de conocimiento avanzado y resolución de problemas multi-paso.
- Codificación de largo horizonte: mantiene sesiones de ingeniería prolongadas con supervisión humana mínima, navega repositorios masivos y orquesta herramientas de terminal.
- Visión nativa: comprende imágenes y vídeo dentro del mismo modelo, sin necesidad de módulos separados.
- Contexto ultralargo de 1M tokens, adecuado para documentos extensos, repositorios de código completos o análisis de vídeo.
- Capacidades agénticas: puede ejecutar tareas de forma autónoma, como optimización de kernels GPU, desarrollo de compiladores, diseño de chips o creación de juegos con visión en el bucle.
- Trabajo de conocimiento end-to-end: genera informes de investigación con visualizaciones interactivas, widgets, paneles de control y edición de vídeo.
- Soporte de tool calling y function calling: aunque no se confirma explícitamente en la documentación, su naturaleza agéntica y su uso de herramientas de terminal sugieren que está preparado para ello.
- Modo de pensamiento: dispone de interruptores para niveles de razonamiento "High" y "Max" en Unsloth Studio.

## Casos de uso

- Desarrollo de software autónomo: Kimi K3 puede mantener sesiones de codificación de larga duración, refactorizar repositorios completos, escribir pruebas y corregir errores con mínima intervención humana. Su contexto de 1M tokens permite cargar el código fuente completo de un proyecto mediano.
- Investigación y análisis de documentos extensos: gracias a su ventana de 1M tokens, puede procesar informes anuales, patentes o literatura científica completa, extrayendo conclusiones y generando resúmenes estructurados.
- Asistente de diseño asistido por ordenador (CAD) y simulación: su capacidad de visión nativa le permite interpretar planos, imágenes técnicas y modelos 3D, facilitando tareas de diseño iterativo.
- Creación de contenido multimedia: puede generar guiones, editar vídeo, crear animaciones y diseñar presentaciones interactivas, integrando texto e imágenes en un flujo de trabajo unificado.
- Automatización de operaciones de TI: al orquestar herramientas de terminal, puede gestionar despliegues, monitorizar logs, ejecutar scripts de mantenimiento y diagnosticar incidencias en infraestructuras complejas.
- Educación y tutoría técnica: su capacidad de razonamiento y su conocimiento multidisciplinar lo convierten en un tutor capaz de explicar conceptos avanzados de programación, matemáticas o ingeniería, adaptándose al nivel del estudiante.
- Análisis de vídeo y vigilancia: con su procesamiento de vídeo nativo, puede resumir grabaciones, detectar eventos relevantes y generar alertas descriptivas en tiempo real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La documentación menciona que Kimi K3 "rivaliza con Claude 4.8 Opus y GPT-5.6", pero no se proporcionan cifras concretas de MMLU, HumanEval, GSM8K u otras pruebas estandarizadas. Se recomienda consultar la documentación oficial de Moonshot AI para obtener datos de evaluación.

## Requisitos de hardware

- La versión de precisión completa (MXFP4) requiere aproximadamente 1,56 TB de almacenamiento, lo que implica un clúster de GPUs de alta gama (por ejemplo, 8 o más GPUs A100 80GB o H100 80GB).
- La cuantización de 1 bit de Unsloth reduce el peso a 594 GB, permitiendo su ejecución en sistemas con 8 GPUs de 80 GB (por ejemplo, 8x A100 80GB o 8x H100 80GB) o configuraciones similares.
- Las cuantizaciones intermedias (UD-Q4_K_XL, UD-Q8_K_XL) requieren más VRAM que la versión de 1 bit, pero ofrecen mayor fidelidad. UD-Q8_K_XL es aproximadamente 50 GB mayor que UD-Q4_K_XL.
- No es viable en GPUs de consumo (RTX 4090, etc.) debido al tamaño mínimo de 594 GB de VRAM necesaria.
- Opciones de despliegue: llama.cpp (mediante el fork de Unsloth), Unsloth Studio, y posiblemente vLLM o TGI con soporte para GGUF.
- La latencia y el throughput dependen en gran medida del hardware y la cuantización. Con 104B parámetros activos, se espera una generación de varios tokens por segundo en clústeres de 8 GPUs, pero no se dispone de cifras oficiales.

## Comparativa con modelos similares

No se dispone de datos suficientes para realizar una comparativa cuantitativa con otros modelos de la misma categoría. Kimi K3 se posiciona como competidor directo de Claude 4.8 Opus y GPT-5.6, pero no se han publicado especificaciones detalladas de estos modelos en la información proporcionada. Tampoco se dispone de datos de otros modelos abiertos de escala similar (como DeepSeek V4 o Qwen 3 Max) para establecer una comparación objetiva.

## Limitaciones y advertencias

- El tamaño del modelo (2,8T parámetros) hace que su despliegue sea costoso y requiera infraestructura especializada, incluso con cuantizaciones extremas.
- La licencia Kimi K3 no es una licencia de código abierto estándar (no es OSI), por lo que es necesario revisar sus términos antes de un uso comercial o de redistribución.
- No se ha confirmado la lista de idiomas soportados; aunque probablemente sea multilingüe, no hay garantía de un rendimiento uniforme en todos los idiomas.
- Al ser un modelo de razonamiento profundo, puede presentar alucinaciones en tareas de conocimiento factual, especialmente si se le pide información muy específica o reciente.
- La cuantización de 1 bit puede degradar la precisión (se menciona una retención de ~78,9% de top-1 accuracy), por lo que no es recomendable para aplicaciones que requieran alta fidelidad.
- El uso de herramientas de terminal y la ejecución autónoma de tareas conlleva riesgos de seguridad si no se supervisa adecuadamente; se recomienda ejecutar en entornos aislados.
- No se han publicado detalles sobre el proceso de entrenamiento (datos, alineación), lo que limita la evaluación de sesgos y comportamientos indeseados.

## Enlaces

- [HuggingFace: unsloth/Kimi-K3-GGUF](https://huggingface.co/unsloth/Kimi-K3-GGUF)
- [Guía de Unsloth para Kimi K3](https://unsloth.ai/docs/models/kimi-k3)
- [Blog: 1-Bit Kimi K3 GGUF - Unsloth](https://essamamdani.com/blog/1-bit-kimi-k3-gguf-unsloth-local-inference-guide)
- [Artículo: How to Run Kimi Locally](https://dexity.com/intel/run-kimi-locally-2026)
- [Fork de llama.cpp de Unsloth](https://github.com/unslothai/llama.cpp/pull/48)
- [Repositorio de Unsloth](https://github.com/unslothai/unsloth/)
