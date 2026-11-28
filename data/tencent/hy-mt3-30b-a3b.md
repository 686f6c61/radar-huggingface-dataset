# tencent/Hy-MT3-30B-A3B

## Resumen

Hy-MT3-30B-A3B es la tercera generación de la familia de modelos de traducción multilingüe Hy-MT de Tencent, publicada en noviembre de 2026 bajo licencia Apache 2.0. Se trata de un modelo de arquitectura transformer con mezcla de expertos (MoE) de 30.064 millones de parámetros totales, de los cuales activa aproximadamente 3B por token, lo que sitúa su coste de inferencia en el rango de un modelo denso de 3B. La familia incluye tres tamaños (1.8B, 7B y 30B-A3B) y amplía la cobertura lingüística de 38 idiomas en Hy-MT2 a 102 idiomas.

El modelo está especializado en traducción automática y resuelve tres problemas concretos: fidelidad a las restricciones del usuario (instrucciones de traducción, terminología, marcado enriquecido), cobertura de idiomas de bajos recursos y adaptación a escenarios industriales como la localización de videojuegos y la traducción de imágenes en cascada con OCR. Según la model card, en datos de escenarios reales reduce un 43% las muestras con errores de traducción, un 74% las omisiones o adiciones y un 40% los fallos de seguimiento de instrucciones respecto a Hy-MT2.

Su relevancia actual radica en que, con solo 3B de parámetros activos, el modelo afirma superar en modo no-thinking a modelos propietarios de referencia como Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash en la evaluación agregada de traducción, y acercarse a modelos cerrados con modo de razonamiento como GPT-6.1-Sol y Gemini-4-Argon. La publicación incluye además TransRubric, una suite de evaluación automática basada en rúbricas, y una cadena de herramientas para localización de juegos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE); tag de arquitectura `hy_v3` |
| Parametros totales | 30.064.725.888 (≈30B) |
| Parametros activos | ≈3B por token (según denominación 30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 102 idiomas (zh, en, es, de, fr, it, pt, ru, ja, ko, ar, hi, entre otros; incluye lenguas de bajos recursos como km, my, bo, ug, yue, ceb, war, ht, sa) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Hy-MT3-30B-A3B emplea una arquitectura transformer con mezcla de expertos: el modelo almacena 30B de parámetros pero solo activa alrededor de 3B por token, lo que reduce el coste computacional de inferencia sin sacrificar capacidad representacional. La model card no detalla el número de expertos, el ratio de activación por capa ni la dimensión oculta. El modelo se distribuye en formato safetensors para su uso con la librería `transformers`, con un repositorio de 120,3 GB.

En cuanto a los datos de entrenamiento, la información disponible indica que se construyó con datos de alta calidad del dominio de videojuegos (procedentes del equipo de Honor of Kings) y con un sistema de evaluación profesional específico, además de datos para tolerar errores de OCR en traducción de imágenes. No se especifican el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron fases de RLHF o DPO. Tampoco se detallan innovaciones como decodificación especulativa o atención lineal. La model card sí menciona que el modelo opera en modo no-thinking y que se compara contra modelos en modo thinking, lo que implica la existencia de modos de inferencia diferenciados, aunque su funcionamiento interno no se describe.

## Capacidades

- Traducción automática multilingüe entre 102 idiomas, incluyendo pares con lenguas de bajos recursos y variantes como el cantonés (`yue`).
- Seguimiento de instrucciones de traducción: restricciones de terminología, formato, marcado enriquecido y placeholders.
- Tolerancia a errores de OCR en flujos de traducción de imágenes en cascada, con corrección de contexto.
- Localización de videojuegos: control de tasa de fuera de objetivo, errores de placeholder, errores de texto enriquecido y errores de terminología.
- Modo no-thinking por defecto, con comparaciones frente a modelos en modo thinking.
- Generación de texto orientada a traducción (pipeline `translation`), no un modelo generalista de propósito múltiple.
- No se documenta soporte de tool calling, function calling, agentes multi-paso, visión nativa ni audio en la información disponible.

## Casos de uso

- Localización de videojuegos en producción: el modelo está entrenado con datos del dominio y métricas específicas (placeholders, texto enriquecido, terminología), y puede integrarse en pipelines mediante la cadena de herramientas TiMiHOKGameTranslator para traducir diálogos, cadenas de interfaz y textos con marcado.
- Traducción de documentación técnica multilingüe: con 102 idiomas y capacidad de respetar terminología y formato, encaja en flujos que requieren consistencia de glosario en decenas de locales simultáneamente.
- Traducción de imágenes en cascada OCR + MT: el modelo tolera errores de OCR y corrige el contexto, lo que lo hace adecuado para digitalizar carteles, capturas de pantalla o menús en aplicaciones de traducción visual.
- Atención al cliente multilingüe: puede traducir conversaciones entre agentes y usuarios en idiomas de bajos recursos donde las APIs comerciales rinden peor, según la comparación de la model card con iFlytek, Microsoft Translator y Qwen-MT-Flash.
- Traducción de contenido generado por usuarios en plataformas globales: cobertura amplia de idiomas (incluidos `ceb`, `war`, `jv`, `su`, `ht`) permite moderar y traducir contenido en mercados emergentes.
- Investigación en evaluación de traducción: junto con TransRubric, el modelo sirve como referencia para estudiar métricas automáticas basadas en rúbricas frente a evaluación humana.
- Despliegue con presupuesto de cómputo limitado: al activar solo ~3B de parámetros, puede servirse en infraestructura modesta comparado con modelos densos de 30B, manteniendo calidad de traducción.

## Benchmarks y rendimiento

La model card referencia resultados agregados pero no publica cifras numéricas en el texto disponible. Los datos cualitativos son:

| Evaluación | Resultado declarado |
|---|---|
| Traducción general (media de FLORES-200, FLORES-200 low-resource, WMT26 y mandarín⇔minorías) | Mejor rendimiento global en modo no-thinking entre todos los modelos evaluados, incluidos Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash |
| WildMTBench-202611 (escenarios reales) | Puntuado con TransRubric; sin cifras publicadas en el texto disponible |
| IFMTBench (seguimiento de instrucciones) | Reducción del 40% de errores de instrucción frente a Hy-MT2 |
| Datos de escenarios reales vs Hy-MT2 | −43% muestras con errores de traducción, −74% omisiones/adiciones |
| Localización de juegos | Iguala o supera a Gemini 3.1 Pro en tasa de fuera de objetivo, errores de placeholder, texto enriquecido y terminología |
| VISTA-Bench (traducción de imágenes) | Mejor resultado entre modelos de tamaño comparable |
| TransRubric en WMT26 metrics shared task | Supera a otros esquemas de evaluación; mayor precisión por pares que la mayoría de anotadores profesionales |

No se han publicado cifras numéricas detalladas (MMLU, HumanEval, GSM8K, BLEU/COMET por par de idiomas) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en precisión completa (BF16): aproximadamente 60 GB solo para pesos, más overhead de activaciones y caché KV; requiere GPU de 80 GB (A100, H100) o multi-GPU.
- Cuantización a 8 bits: ~30 GB de pesos, viable en una A100 40 GB o en dos RTX 4090 de 24 GB.
- Cuantización a 4 bits: ~15-16 GB de pesos, cabe en una RTX 4090, RTX 5090 o similar con margen para contexto.
- GPU recomendadas: H100 o A100 80 GB para producción en BF16; A100 40 GB o L40S para 8 bits; RTX 4090/5090 para 4 bits en entornos de desarrollo.
- Opciones de despliegue: la model card solo confirma compatibilidad con `transformers`; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, ni la disponibilidad de pesos GGUF.
- Latencia y throughput: no disponibles. Al activar ~3B de parámetros, el coste por token debería aproximarse al de un modelo denso de 3B, pero no se publican mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B | 30B totales / ~3B activos (MoE) | no disponible | 102 | Apache 2.0 | Mejor rendimiento declarado en modo no-thinking frente a Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash |
| Hy-MT3-7B | 7B densos (según familia) | no disponible | 102 | Apache 2.0 | Variante intermedia de la misma familia |
| Hy-MT3-1.8B | 1.8B densos | no disponible | 102 | Apache 2.0 | Supera a iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general según la model card |
| Hy-MT2-30B-A3B | 30B totales / ~3B activos (MoE) | no disponible | 38 | Apache 2.0 | Generación anterior; Hy-MT3 reduce un 43% los errores de traducción y un 74% las omisiones |

No se dispone de datos numéricos de benchmarks para establecer comparaciones cuantitativas con modelos de otros fabricantes.

## Limitaciones y advertencias

- Modelo especializado en traducción: no está diseñado como modelo generalista de razonamiento, código o matemáticas, y su uso fuera de tareas de traducción no está documentado.
- Riesgo de alucinación y de adiciones no presentes en el texto fuente; la model card reporta mejoras frente a Hy-MT2, pero persisten errores de este tipo.
- Sesgos lingüísticos y culturales heredados de los datos de entrenamiento; no se documenta un análisis de sesgos.
- Cobertura desigual entre idiomas: aunque se declaran 102 idiomas, el rendimiento en lenguas de bajos recursos no se cuantifica por par en la información disponible.
- Longitud de contexto no especificada: no es posible garantizar el comportamiento en documentos largos sin medición previa.
- Licencia Apache 2.0 permite uso comercial, pero conviene revisar las dependencias de la cadena de herramientas asociada (TiMiHOKGameTranslator, TransRubric) por si tienen licencias distintas.
- Los resultados comparativos de la model card proceden del propio autor y se puntúan con TransRubric, también desarrollado por Tencent; se recomienda validación independiente antes de adoptar el modelo en producción.
- No se documentan cuantizaciones oficiales ni soporte en motores de inferencia de alto rendimiento, lo que puede limitar el despliegue a gran escala.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- Herramienta de traducción para juegos TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de traducción: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Extensión Chrome: https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof?hl=en
- Extensión Edge: https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm
- App Android: https://a.app.qq.com/o/simple.jsp?pkgname=com.tencent.hunyuan.translate
- App iOS: https://apps.apple.com/cn/app/%E8%85%BE%E8%AE%AFhy%E7%BF%BB%E8%AF%91/id6768870541
- README en chino: https://huggingface.co/tencent/Hy-MT3-30B-A3B/blob/main/README_CN.md
