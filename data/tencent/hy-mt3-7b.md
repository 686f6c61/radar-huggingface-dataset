# tencent/Hy-MT3-7B

## Resumen

Hy-MT3-7B es un modelo de traducción automática multilingüe desarrollado por Tencent, tercera generación de la familia Hy-MT. Con 7.504.568.320 parámetros (aproximadamente 7,5 mil millones), forma parte de una familia que incluye variantes de 1,8B, 7B y 30B-A3B (MoE). La versión 7B amplía la cobertura lingüística de 38 idiomas en Hy-MT2 a 102 idiomas, lo que la convierte en una de las propuestas de traducción abierta con mayor alcance idiomático del momento.

El modelo aborda el problema de la traducción automática de alta fidelidad en escenarios reales, con especial énfasis en el cumplimiento de restricciones del usuario (instrucciones de traducción), la localización de videojuegos y la traducción de imágenes en cascada con OCR. Según la model card, frente a Hy-MT2 reduce un 43% las muestras con errores de traducción, un 74% las omisiones o adiciones y un 40% los errores de seguimiento de instrucciones en datos de escenarios reales.

Su relevancia actual radica en que se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones, y en que su variante mayor (30B-A3B) afirma superar a modelos propietarios de referencia en modo no-thinking. La versión de 7B está pensada como un punto de equilibrio entre calidad y requisitos de hardware, adecuada para despliegue en infraestructura propia.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (tipo `hunyuan_v1_dense` según transformers) |
| Parámetros totales | 7.504.568.320 (≈7,5B) |
| Parámetros activos | No aplica (modelo denso; la variante MoE es Hy-MT3-30B-A3B) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible en la información proporcionada |
| Idiomas soportados | 102 idiomas (zh, en, es, fr, de, it, pt, ru, ja, ko, ar, hi, entre otros; incluye lenguas minoritarias como ceb, war, yue, bo, ug, ckb, sa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Hy-MT3-7B es un transformer denso identificado en transformers con la arquitectura `hunyuan_v1_dense`. La información disponible no detalla el número de capas, dimensiones ocultas ni la configuración exacta de atención. La familia Hy-MT3 incluye además una variante MoE (30B-A3B) con 3B parámetros activos, lo que sugiere que Tencent ha diseñado la familia con dos filosofías: densidad para las versiones pequeñas y mezcla de expertos para la grande.

En cuanto a datos de entrenamiento, la model card menciona el uso de datos de alta calidad del dominio de videojuegos (elaborados con el equipo de Honor of Kings) y un sistema de evaluación profesional, así como optimización para tolerar errores de OCR en traducción de imágenes. No se especifica el número de tokens de entrenamiento, la composición exacta del dataset ni si se emplearon técnicas de RLHF o DPO. La model card tampoco detalla innovaciones arquitectónicas concretas como decodificación especulativa o atención lineal. Sí se menciona que el modelo opera en modo no-thinking por defecto, y que los resultados publicados lo comparan en ese régimen con modelos que sí usan thinking mode.

## Capacidades

- Traducción automática multilingüe entre 102 idiomas, incluyendo pares de lenguas minoritarias y de bajos recursos.
- Seguimiento de instrucciones de traducción (restricciones de terminología, formato, estilo), evaluado mediante el benchmark IFMTBench.
- Traducción de imágenes en cascada con OCR, con tolerancia a errores de reconocimiento de texto (evaluado en VISTA-Bench).
- Localización de videojuegos: control de tasa de off-target, errores de placeholders, errores de texto enriquecido y errores de terminología.
- Generación de texto y pipeline de `text-generation` en transformers.
- Soporte multilingüe amplio con cobertura de escrituras no latinas (árabe, devanagari, han, hangul, cirílico, etc.).
- Integración con la herramienta de traducción de juegos TiMiHOKGameTranslator.
- No se dispone de información sobre tool calling, function calling, capacidades de agente, visión nativa, audio o modo thinking en esta variante.

## Casos de uso

- Localización de videojuegos: el modelo se ha entrenado con datos del dominio y puede integrarse en la cadena de herramientas TiMiHOKGameTranslator para traducir diálogos, cadenas de interfaz y textos con placeholders, controlando errores de terminología y texto enriquecido.
- Traducción de documentación técnica multilingüe: con cobertura de 102 idiomas y seguimiento de instrucciones, puede traducir manuales y guías manteniendo terminología consistente mediante restricciones explícitas en el prompt.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones entre agentes y usuarios en lenguas minoritarias o de bajos recursos, donde las APIs comerciales suelen tener menor cobertura.
- Traducción de imágenes y capturas de pantalla: en pipelines OCR + traducción, el modelo tolera errores de OCR y corrige el contexto, útil para aplicaciones de accesibilidad o comercio internacional.
- Subtitulado y doblaje: traducción de guiones con restricciones de longitud y estilo, aprovechando el seguimiento de instrucciones para adaptar el registro.
- Investigación en traducción automática: al ser Apache 2.0 y estar disponible en transformers, sirve como base para fine-tuning en dominios especializados (legal, médico, técnico) y para experimentación académica.
- Procesamiento de contenido generado por usuarios: moderación y traducción de comentarios en foros y redes sociales con mezcla de idiomas, incluyendo variedades como yue (cantonés) o ceb (cebuano).

## Benchmarks y rendimiento

La model card incluye una imagen de resultados (`main_result.png`) y menciona métricas agregadas, pero no se proporcionan tablas numéricas con valores concretos en la información disponible. Los benchmarks citados son:

| Benchmark | Descripción | Resultado numérico |
|---|---|---|
| FLORES-200 | Traducción general | No disponible (solo gráfico) |
| FLORES-200 low-resource | Lenguas de bajos recursos | No disponible (solo gráfico) |
| WMT26 | Traducción general | No disponible (solo gráfico) |
| Mandarin⇔Minority | Chino mandarín a lenguas minoritarias | No disponible (solo gráfico) |
| WildMTBench-202611 | Escenarios reales, evaluado con TransRubric | No disponible (solo gráfico) |
| IFMTBench | Seguimiento de instrucciones de traducción | No disponible (solo gráfico) |
| VISTA-Bench | Traducción de imágenes | No disponible (solo gráfico) |

Las afirmaciones cualitativas de la model card indican que Hy-MT3-30B-A3B logra el mejor rendimiento global en modo no-thinking entre los modelos evaluados, y que Hy-MT3-1.8B supera a APIs comerciales como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general. No se aportan cifras verificables para la variante 7B en el texto disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo denso de 7,5B en FP16 requiere aproximadamente 15 GB de VRAM solo para pesos, más overhead de activaciones y KV cache; en cuantización de 8 bits rondaría 8-9 GB y en 4 bits unos 5-6 GB (estimaciones no confirmadas por el autor).
- GPU recomendadas: no especificadas por el autor. Por tamaño, una A100 40GB, H100 80GB o L40S permitirían FP16 con contexto amplio; una RTX 4090 (24 GB) sería suficiente para FP16 ajustado o cuantización.
- Cabe en GPU de consumo: probablemente sí en RTX 3090/4090 (24 GB) con cuantización, y potencialmente en GPUs de 16 GB con cuantización agresiva; sin confirmación oficial.
- Opciones de despliegue: transformers (soporte nativo declarado). No se confirma soporte de vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT3-7B | 7,5B | No disponible | 102 | Apache 2.0 | Modelo denso, foco en traducción e instrucciones |
| Hy-MT3-1.8B | 1,8B | No disponible | 102 | Apache 2.0 | Variante ligera de la misma familia |
| Hy-MT3-30B-A3B | 30B totales / 3B activos (MoE) | No disponible | 102 | Apache 2.0 | Variante MoE de mayor calidad según la model card |
| Hy-MT2-7B | 7B (generación anterior) | No disponible | 38 | No disponible | Predecesor directo; menor cobertura idiomática |

No se dispone de datos numéricos de rendimiento para establecer comparaciones cuantitativas con modelos de otros autores en la información proporcionada.

## Limitaciones y advertencias

- No se han publicado detalles sobre sesgos lingüísticos, culturales o de género; al ser un modelo entrenado por un autor chino, puede presentar sesgos en la representación de ciertas lenguas o variedades.
- Riesgo de alucinación: en traducción, puede manifestarse como adiciones, omisiones o invención de terminología, especialmente en pares de lenguas de bajos recursos; la model card reporta reducciones de estos errores frente a Hy-MT2, pero no su eliminación.
- Limitación de contexto: la longitud máxima de contexto no se especifica, lo que impide garantizar el comportamiento en documentos largos.
- Cobertura idiomática desigual: aunque declara 102 idiomas, la calidad en lenguas minoritarias (ceb, war, yue, bo, ug, ckb, sa) puede ser inferior a la de pares mayoritarios.
- Licencia Apache 2.0: permite uso comercial, modificación y redistribución sin restricciones adicionales conocidas; conviene revisar los términos de las herramientas auxiliares (TransRubric, TiMiHOKGameTranslator) por separado.
- Para producción: no se confirma soporte en motores de inferencia de alto rendimiento (vLLM, TGI), lo que puede limitar el throughput en despliegues a gran escala.
- El modo thinking no está documentado para esta variante; la model card compara resultados en modo no-thinking, por lo que el rendimiento en otros regímenes es incierto.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy-MT3-7B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- GitHub del proyecto: https://github.com/Tencent-Hunyuan/Hy-MT3
- TransRubric (evaluación automática): https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de traducción: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Extensión Chrome: https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof
- Extensión Edge: https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm
- App Android: https://a.app.qq.com/o/simple.jsp?pkgname=com.tencent.hunyuan.translate
- App iOS: https://apps.apple.com/cn/app/%E8%85%BE%E8%AE%AFhy%E7%BF%BB%E8%AF%91/id6768870541
