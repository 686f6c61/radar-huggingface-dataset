# tencent/Hy4

## Resumen

Hy4 es un modelo multimodal de tipo Mixture-of-Experts (MoE) desarrollado por el equipo Tencent Hy, orientado a la comprensión conjunta de texto e imagen. Su columna vertebral lingüística cuenta con 770B parámetros totales, de los cuales se activan 49B por token (más 1,23B del codificador visual), distribuidos en 78 capas: una capa densa inicial y 77 capas MoE con 256 expertos enrutados y 1 experto compartido por capa. El modelo se distribuye en formato safetensors a través de Hugging Face con la librería transformers y un repositorio de 1.548,9 GB.

La propuesta técnica de Hy4 combina atención dispersa gated de tipo DeepSeek (Gated DSA) con IndexCache para reutilizar índices dispersos entre capas, conexiones residuales iHC (identity Hyper-Connections) con cuatro flujos residuales, y un decodificador especulativo integrado denominado DFly2 (3,3B parámetros) que reutiliza la caché KV y los índices dispersos del modelo principal. La longitud de contexto declarada alcanza 1.048.576 tokens, lo que sitúa al modelo en el segmento de contexto ultra-largo.

El modelo resulta relevante para desarrolladores e investigadores que necesitan un sistema multimodal con ventana de contexto de un millón de tokens, capacidad de uso de ordenador (computer use), desarrollo frontend y de videojuegos, flujos financieros y de oficina, investigación científica y asistencia personal de largo horizonte. Su licencia es propietaria (tencent-hy-license), lo que condiciona su uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Mixture-of-Experts (MoE) multimodal con atención Gated DeepSeek Sparse Attention (Gated DSA) + IndexCache y MLA |
| Parametros totales | 770B en el backbone lingüístico (774.434.002.142 según safetensors, incluyendo ViT y DFly2); ViT 1,23B; DFly2 3,3B |
| Parametros activos | 49B de texto + 1,23B de visión por token |
| Longitud de contexto | 1.048.576 tokens (1M) |
| Tipos de cuantizacion | No disponible en la información proporcionada (existe repositorio GGUF externo enlazado en la model card) |
| Idiomas soportados | No disponible |
| Licencia | tencent-hy-license (propietaria, license: other) |
| Formato de pesos | safetensors (transformers) |

## Arquitectura y entrenamiento

El backbone lingüístico consta de 78 capas con tamaño oculto 6.144 y vocabulario de 120.832 tokens. La primera capa usa una FFN densa con tamaño intermedio 18.432; las 77 restantes son capas MoE con 256 expertos enrutados y 1 experto compartido, activando los top-8 expertos enrutados más el compartido por token, con tamaño intermedio de experto de 2.048. El módulo de atención emplea Multi-head Latent Attention (MLA) con 64 cabezas, q_lora_rank de 2.048 y kv_lora_rank de 512, combinado con Gated DSA e IndexCache: un indexador de 32 cabezas y dimensión 128 selecciona los top-2.048 tokens de contexto, y los índices dispersos se reutilizan entre capas. Las conexiones residuales usan iHC con cuatro flujos residuales para ampliar el flujo de información entre capas.

El codificador visual tiene 40 capas, tamaño oculto 1.536, tamaño intermedio 6.144 y 16 cabezas de atención, con parches de 16×16 y embeddings posicionales de 128×128; un adaptador con fusión 2×2 convierte las características de imagen y fotogramas de vídeo en tokens visuales que el modelo lingüístico procesa junto al texto. El decodificador especulativo DFly2 (5 capas, 3,3B parámetros) reutiliza la caché KV y los índices dispersos de Hy4 para decodificación especulativa de bajo coste constante en contextos largos. No se detallan en la información proporcionada el número de tokens de entrenamiento, la composición del dataset ni si se aplicaron etapas de RLHF o DPO.

## Capacidades

- Comprensión de texto e imagen (pipeline image-text-to-text) con soporte de resoluciones dinámicas y fotogramas de vídeo convertidos a tokens visuales.
- Razonamiento y conocimiento general, con resultados destacados en MMLU, MMLU-Pro y MMLU-Redux en la variante base.
- Visión y uso de ordenador (computer use), según la sección de capacidades de la model card.
- Desarrollo frontend y de videojuegos.
- Flujos financieros y de oficina.
- Investigación científica e I+D en IA.
- Asistencia personal de largo horizonte (long-horizon personal assistant).
- Contexto ultra-largo de 1M tokens, adecuado para documentos, repositorios y sesiones extensas.
- Decodificación especulativa integrada mediante DFly2 para acelerar la generación en contextos largos.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.

## Casos de uso

- Análisis de documentación técnica extensa: con 1M tokens de contexto, el modelo puede ingerir repositorios completos, manuales o expedientes y responder preguntas que requieran cruzar información entre secciones distantes sin truncar.
- Uso de ordenador y automatización de interfaz: la combinación de comprensión visual y razonamiento permite interpretar capturas de pantalla y planificar acciones sobre aplicaciones, adecuado para agentes de escritorio.
- Desarrollo frontend asistido: el modelo puede generar y revisar código de interfaz a partir de bocetos o capturas de diseño, usando la vía visual para interpretar mockups y la vía textual para producir el código.
- Prototipado de videojuegos: generación de lógica de juego, diálogos y assets descriptivos a partir de referencias visuales, aprovechando la comprensión de imagen y el contexto largo para mantener coherencia entre módulos.
- Procesamiento de flujos financieros y de oficina: extracción y razonamiento sobre tablas, facturas y documentos escaneados combinados con texto, con la ventana de 1M tokens para lotes documentales amplios.
- Investigación científica y revisión de literatura: carga de artículos, figuras y datos en una sola sesión para comparar metodologías y extraer conclusiones, apoyándose en la comprensión multimodal.
- Asistente personal de largo horizonte: seguimiento de tareas y conversaciones prolongadas con memoria de contexto extensa, útil para planificación continua y agentes multi-paso.
- Despliegue en producción con decodificación especulativa: DFly2 permite acelerar la inferencia en contextos largos con coste constante, lo que facilita servir el modelo en vLLM o SGLang según la model card.

## Benchmarks y rendimiento

Resultados de evaluación few-shot del modelo base (extraídos de la model card):

| Categoría | Benchmark | Shots | Hy4 Base | Hy4 flash Base | Hy3 preview Base | DeepSeek-V4-flash-Base | DeepSeek-V4-Pro-Base |
|---|---|---:|---:|---:|---:|---:|---:|
| Conocimiento | MMLU† | 5 | 91,6 | 88,7 | 87,5 | 89,7 | 91,1 |
| Conocimiento | MMLU-Pro† | 5 | 73,9 | 71,1 | 65,8 | 68,6 | 73,4 |
| Conocimiento | MMLU-Redux† | 5 | 90,6 | no disponible | no disponible | no disponible | no disponible |

La model card incluye además una gráfica de bits-per-byte (BPB) sobre validación interna de código y agentes, con menor valor mejor, comparando Hy4 frente a otros modelos según parámetros activos. No se proporcionan en la información disponible resultados de HumanEval, GSM8K ni otros benchmarks de código o matemáticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; con 770B parámetros totales en safetensors, la inferencia en precisión completa requiere un clúster multi-GPU de gran escala (el repositorio ocupa 1.548,9 GB).
- GPU recomendadas: no especificadas en la información proporcionada; por tamaño, se requiere hardware de centro de datos (A100, H100 o equivalentes) en configuración multi-nodo.
- ¿Cabe en GPU de consumo? No en precisión completa; existe un repositorio GGUF externo (AngelSlim/Hy4-GGUF) enlazado en la model card, pero no se detallan en la información disponible los requisitos de VRAM para esas cuantizaciones.
- Opciones de despliegue: vLLM y SGLang (secciones dedicadas en la model card), transformers, DFly2 para decodificación especulativa y cuantización; también se enlaza un repositorio GGUF.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Licencia | MMLU (5-shot) | MMLU-Pro (5-shot) |
|---|---|---:|---:|---|---:|---:|
| Hy4 Base | 770B | 49B texto + 1,23B visión | 1M | tencent-hy-license (propietaria) | 91,6 | 73,9 |
| Hy4 flash Base | no disponible | no disponible | no disponible | no disponible | 88,7 | 71,1 |
| Hy3 preview Base | no disponible | no disponible | no disponible | no disponible | 87,5 | 65,8 |
| DeepSeek-V4-flash-Base | no disponible | no disponible | no disponible | no disponible | 89,7 | 68,6 |
| DeepSeek-V4-Pro-Base | no disponible | no disponible | no disponible | no disponible | 91,1 | 73,4 |

Los datos de parámetros, contexto y licencia de los modelos comparados no están disponibles en la información proporcionada; solo se dispone de sus resultados en MMLU y MMLU-Pro.

## Limitaciones y advertencias

- Licencia propietaria (tencent-hy-license): es necesario revisar los términos del archivo LICENSE antes de cualquier uso comercial; no es una licencia de código abierto.
- No se detallan en la información disponible los sesgos conocidos del modelo; la model card incluye una sección de limitaciones conocidas que debe consultarse.
- Riesgo de alucinación: inherente a los modelos generativos de este tamaño; no se cuantifica en la información disponible.
- Idiomas soportados no especificados: no se puede garantizar un rendimiento homogéneo fuera de los idiomas cubiertos en el entrenamiento.
- El contexto de 1M tokens no implica necesariamente recuperación perfecta en toda la ventana; la atención dispersa selecciona top-2.048 tokens mediante el indexador, lo que puede afectar a la recuperación de información en posiciones no seleccionadas.
- Tamaño de despliegue muy elevado (1.548,9 GB en safetensors): inviable en hardware de consumo en precisión completa y costoso en infraestructura multi-GPU.
- No hay información disponible sobre tool calling, function calling ni soporte de agentes multi-paso más allá de las capacidades declaradas en la model card.
- La fecha de creación del repositorio (2026-10-29) y las referencias a modelos DeepSeek-V4 y Hy3 preview indican que parte de los datos comparativos provienen de la propia model card y deben tratarse con cautela hasta su verificación independiente.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy4
- Model card en chino: https://huggingface.co/tencent/Hy4/blob/main/README_CN.md
- Licencia: https://huggingface.co/tencent/Hy4/blob/main/LICENSE
- Web oficial: https://hy.tencent.ai/research/hy4
- GitHub: https://github.com/Tencent-Hunyuan/Hy4
- GGUF: https://huggingface.co/AngelSlim/Hy4-GGUF
- ModelScope: https://modelscope.cn/models/Tencent-Hunyuan/Hy4
- AtomGit: https://ai.gitcode.com/tencent_hunyuan/Hy4
- Paper Gated DeepSeek Sparse Attention: https://arxiv.org/abs/2512.02556
- Paper IndexCache: https://arxiv.org/abs/2603.12201
- Artículo sobre iHC: https://zhuanlan.zhihu.com/p/2010852389670908320
