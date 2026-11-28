# tencent/Hy-MT3-30B-A3B-GGUF

## Resumen

Hy-MT3-30B-A3B es la tercera generación de la familia de modelos de traducción multilingüe de Tencent, publicada en noviembre de 2026. Se trata de un modelo de arquitectura Mixture of Experts (MoE) con 30.064.725.888 parámetros totales y aproximadamente 3B parámetros activos por token, diseñado específicamente para traducción automática en 102 idiomas (frente a los 38 de Hy-MT2). La versión aquí descrita es la cuantización GGUF del modelo base `tencent/Hy-MT3-30B-A3B`, orientada a inferencia local y despliegue eficiente.

El modelo resuelve el problema de la traducción de alta calidad con bajo coste computacional: según el autor, con solo 3B parámetros activos alcanza el mejor rendimiento global en modo no-thinking entre los modelos evaluados, incluyendo modelos propietarios de gama alta, y se aproxima a modelos cerrados con modo thinking que consumen más de 30 veces su cómputo de inferencia. Además de la traducción general, está optimizado para dos escenarios industriales: localización de videojuegos (con datos del equipo de Honor of Kings) y traducción de imágenes en cascada con OCR.

La relevancia actual radica en su combinación de cobertura lingüística amplia (102 idiomas), licencia Apache 2.0 permisiva para uso comercial, disponibilidad en formato GGUF para despliegue en hardware de consumo y una mejora declarada del 43% en reducción de mistraducciones y del 74% en omisiones/añadidos respecto a Hy-MT2 sobre datos de escenarios reales.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Mixture of Experts (MoE), transformer; número de expertos no disponible |
| Parámetros totales | 30.064.725.888 |
| Parámetros activos | ~3B (aproximadamente 3.000 millones) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | GGUF (el repo incluye cuantizaciones con imatrix; niveles concretos no disponibles en la información proporcionada) |
| Idiomas soportados | 102 idiomas (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo); el modelo base se distribuye en safetensors |

## Arquitectura y entrenamiento

Hy-MT3-30B-A3B emplea una arquitectura Mixture of Experts con 30.064 millones de parámetros totales y aproximadamente 3B activos por token, lo que permite un coste de inferencia muy inferior al de un modelo denso del mismo tamaño. La familia Hy-MT3 incluye tres tamaños (1.8B, 7B y 30B-A3B), lo que sugiere un diseño escalable con el mismo pipeline de entrenamiento. No se dispone en la información proporcionada del número exacto de expertos, la composición del dataset de entrenamiento ni el número de tokens utilizados.

El modelo está entrenado específicamente para traducción y sigue de instrucciones de traducción, con datos de dominio de videojuegos de alta calidad y un sistema de evaluación profesional del equipo de Honor of Kings. El autor declara mejoras respecto a Hy-MT2 en fidelidad a las restricciones del usuario: reducción del 43% en muestras con mistraducciones, del 74% en omisiones o añadidos y del 40% en errores de seguimiento de instrucciones sobre datos de escenarios reales. No se detalla en la información disponible si se emplearon RLHF, DPO u otras técnicas de alineación. La versión GGUF incorpora cuantizaciones generadas con imatrix.

## Capacidades

- Traducción multilingüe entre 102 idiomas, con cobertura ampliada respecto a las 38 lenguas de Hy-MT2.
- Traducción general de alta calidad en modo no-thinking, con rendimiento declarado superior a modelos propietarios de mayor tamaño en la evaluación del autor.
- Seguimiento de instrucciones de traducción (restricciones de terminología, formato, estilo), con una reducción declarada del 40% en errores de instrucción frente a Hy-MT2.
- Localización de videojuegos: métricas específicas de tasa de fuera de objetivo, errores de marcadores (placeholders), errores de texto enriquecido y errores de terminología.
- Traducción de imágenes en cascada OCR: tolerancia y corrección de errores de OCR, con el mejor resultado declarado entre modelos de tamaño comparable en VISTA-Bench.
- Integración en pipelines de desarrollo de juegos mediante la herramienta open source TiMiHOKGameTranslator.
- Soporte conversacional (tag `conversational`) y compatibilidad con endpoints.
- Modo thinking disponible en la familia (los resultados citados de Hy-MT3 son en modo no-thinking).

## Casos de uso

- Localización de videojuegos en producción: el modelo está entrenado con datos del dominio y evalúa métricas específicas (placeholders, texto enriquecido, terminología), por lo que puede integrarse en el pipeline TiMiHOKGameTranslator para traducir cadenas de diálogo y UI manteniendo la integridad de las etiquetas.
- Traducción de documentación técnica multilingüe: con 102 idiomas y seguimiento de instrucciones, permite traducir manuales y guías manteniendo glosarios y restricciones de terminología definidas por el usuario.
- Traducción de imágenes y capturas de pantalla: en cascada con un motor OCR, el modelo corrige errores de reconocimiento y mejora la coherencia contextual en la traducción de texto embebido en imágenes.
- Atención al cliente multilingüe: al ser un modelo conversacional, puede gestionar respuestas en el idioma del usuario dentro de sistemas de soporte, con la ventaja de que la versión GGUF permite despliegue on-premise sin enviar datos a terceros.
- Traducción de contenido web y extensiones de navegador: el propio autor distribuye una extensión (Tencent Hy Translate) para traducción de selección, página completa y panel lateral, lo que demuestra su idoneidad para traducción interactiva de baja latencia.
- Procesamiento por lotes de corpus multilingües: con cuantización GGUF e imatrix, puede ejecutarse en infraestructura propia para traducir grandes volúmenes de texto sin coste por token de API, manteniendo la licencia Apache 2.0 para uso comercial.
- Traducción de lenguas minoritarias: la cobertura de 102 idiomas y la evaluación específica en FLORES-200 low-resource y Mandarin⇔Minority lo hacen adecuado para pares lingüísticos con pocos recursos.

## Benchmarks y rendimiento

El autor publica gráficos de resultados (no tablas numéricas en el texto extraído) sobre las siguientes evaluaciones: FLORES-200, FLORES-200 low-resource, WMT26, Mandarin⇔Minority, WildMTBench-202611 e IFMTBench, puntuados con TransRubric. Los resultados concretos por benchmark no están disponibles en la información proporcionada; únicamente se declara cualitativamente que Hy-MT3-30B-A3B logra el mejor rendimiento global en modo no-thinking entre los modelos evaluados y que supera a modelos que consumen más de 30 veces su cómputo de inferencia.

| Benchmark | Resultado |
|---|---|
| FLORES-200 | no disponible (solo gráfico en model card) |
| FLORES-200 low-resource | no disponible (solo gráfico en model card) |
| WMT26 | no disponible (solo gráfico en model card) |
| Mandarin⇔Minority | no disponible (solo gráfico en model card) |
| WildMTBench-202611 | no disponible (solo gráfico en model card) |
| IFMTBench | no disponible (solo gráfico en model card) |
| VISTA-Bench | mejor resultado declarado entre modelos de tamaño comparable (sin cifra) |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa, un modelo MoE de 30B totales en GGUF de 4 bits requiere del orden de 17-20 GB de VRAM/ memoria unificada solo para pesos; los niveles de cuantización concretos del repo no se detallan en la información proporcionada.
- GPU recomendadas: no especificadas por el autor. Por tamaño, cabría esperar ejecución cómoda en A100 40GB/80GB, H100 y RTX 4090 (24 GB) con cuantizaciones bajas; sin confirmación oficial.
- GPU de consumo: plausible en RTX 4090 y GPUs con 24 GB o más con cuantización de 4 bits, y en sistemas Apple Silicon con memoria unificada suficiente; no confirmado en la información disponible.
- Opciones de despliegue: formato GGUF, compatible con llama.cpp y derivados (Ollama, LM Studio); el tag `endpoints_compatible` sugiere compatibilidad con endpoints de inferencia. vLLM y TGI no se mencionan en la información proporcionada.
- Latencia y throughput: no disponibles. El autor destaca la eficiencia computacional (3B activos) frente a modelos densos de mayor coste, pero sin cifras de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Activos | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|---|
| Hy-MT3-30B-A3B (este) | 30,06B | ~3B | no disponible | 102 | Apache 2.0 | GGUF, safetensors |
| Hy-MT3-7B | 7B (aprox.) | denso (no confirmado) | no disponible | 102 | Apache 2.0 | no disponible |
| Hy-MT3-1.8B | 1,8B | denso (no confirmado) | no disponible | 102 | Apache 2.0 | no disponible |
| Hy-MT2-30B-A3B | no disponible | no disponible | no disponible | 38 | no disponible | no disponible |

El autor compara cualitativamente con modelos propietarios (Qwen3.8-Max, Kimi-K3.1-Pro, DeepSeek-V4.1-Flash, GPT-6.1-Sol, Gemini-4-Argon) y con APIs comerciales de traducción (iFlytek Translator, Microsoft Translator, Qwen-MT-Flash), pero sin cifras numéricas en la información proporcionada. No se dispone de datos de contexto ni de rendimiento cuantitativo de los alternativas open source comparables.

## Limitaciones y advertencias

- Es un modelo especializado en traducción; no debe esperarse un rendimiento de propósito general comparable a un LLM generalista en otras tareas.
- Riesgo de alucinación y de mistraducción inherente a los modelos generativos; el autor reporta mejoras pero no elimina el problema (queda un porcentaje de muestras con errores).
- La evaluación se basa en TransRubric, suite desarrollada por el propio autor; existe un posible sesgo de auto-evaluación, aunque se declara superior a la evaluación humana en estabilidad y precisión por pares.
- Los resultados comparativos se presentan en gráficos sin cifras en el texto extraído; conviene consultar la model card completa y el informe técnico para valores numéricos.
- Longitud de contexto no especificada: puede limitar la traducción de documentos muy largos sin troceado.
- La lista exacta de los 102 idiomas no está disponible en la información proporcionada; la calidad puede variar notablemente entre pares de lenguas de altos y bajos recursos.
- La versión GGUF puede degradar ligeramente la calidad respecto al modelo base en cuantizaciones agresivas; los niveles incluidos no se detallan.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base y de los datos de entrenamiento (no detalladas).
- No se especifican sesgos conocidos ni evaluación de seguridad en la información disponible.

## Enlaces

- Hugging Face (GGUF): https://huggingface.co/tencent/Hy-MT3-30B-A3B-GGUF
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- GitHub del proyecto: https://github.com/Tencent-Hunyuan/Hy-MT3
- TransRubric (suite de evaluación): https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de traducción: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Extensión Chrome: https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof?hl=en
- Extensión Edge: https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm
- App Android: https://a.app.qq.com/o/simple.jsp?pkgname=com.tencent.hunyuan.translate
- App iOS: https://apps.apple.com/cn/app/%E8%85%BE%E8%AE%AFhy%E7%BF%BB%E8%AF%91/id6768870541
