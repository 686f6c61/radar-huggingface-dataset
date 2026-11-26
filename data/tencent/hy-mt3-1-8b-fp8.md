# tencent/Hy-MT3-1.8B-FP8

## Resumen

Hy-MT3-1.8B-FP8 es la variante cuantizada en FP8 del modelo de traducción multilingüe Hy-MT3-1.8B, desarrollado por Tencent dentro de su familia Hy (Hunyuan). Se trata de la tercera generación de su línea de modelos de traducción, que amplía la cobertura lingüística de 38 idiomas (en Hy-MT2) a 102 idiomas. El modelo está diseñado específicamente para tareas de traducción automática, no como un modelo de propósito general, y se distribuye bajo licencia Apache 2.0.

El modelo base tiene 1.791.080.448 parámetros y emplea la arquitectura `hunyuan_v1_dense`, según la etiqueta del repositorio. Esta variante FP8 utiliza el formato de compresión `compressed-tensors`, lo que reduce el peso del repositorio a 2,0 GB y facilita su despliegue en hardware con soporte para cuantización FP8. Según la model card, el modelo de 1,8B supera a API comerciales de traducción como iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general.

La relevancia de esta ficha radica en que se trata de un modelo pequeño (1,8B) y cuantizado, pensado para despliegues de traducción de bajo coste computacional, con soporte declarado para escenarios industriales como la localización de videojuegos y la traducción de imágenes en cascada con OCR.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | hunyuan_v1_dense (transformer denso) |
| Parametros totales | 1.791.080.448 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (compressed-tensors); el modelo base admite otras cuantizaciones no detalladas |
| Idiomas soportados | 102 idiomas (según la model card de la familia Hy-MT3) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compressed-tensors, FP8) |

## Arquitectura y entrenamiento

La arquitectura es un transformer denso identificado en el repositorio como `hunyuan_v1_dense`, con 1,79 mil millones de parámetros. Esta variante concreta es una cuantización FP8 del modelo base `tencent/Hy-MT3-1.8B`, realizada con la librería `compressed-tensors`. No se dispone en la información proporcionada de detalles sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO en el modelo base.

Según la model card de la familia, Hy-MT3 se optimiza para dos escenarios industriales: localización de videojuegos (con datos de dominio de alta calidad y un sistema de evaluación profesional del equipo de Honor of Kings) y traducción de imágenes (mejorando la tolerancia a errores de OCR en pipelines en cascada). La familia incluye tres tamaños (1.8B, 7B y 30B-A3B MoE); esta ficha corresponde al menor de ellos en versión FP8. No se detallan innovaciones de decodificación especulativa ni mecanismos de atención lineal en la información disponible.

## Capacidades

- Traducción automática multilingüe en 102 idiomas, con foco en traducción general, de dominio y con restricciones de instrucciones.
- Mayor fidelidad a restricciones del usuario: según la model card, reduce un 43% las muestras con errores de traducción, un 74% las omisiones o adiciones y un 40% los errores de seguimiento de instrucciones respecto a Hy-MT2.
- Traducción en escenarios de localización de videojuegos, con métricas específicas de tasa de fuera de objetivo, errores de marcadores (placeholders), errores de texto enriquecido y errores de terminología.
- Traducción de imágenes en pipelines con OCR en cascada, con tolerancia a errores de OCR.
- Soporte de instrucciones de traducción (IFMTBench mide el seguimiento de instrucciones de traducción).
- No se documentan en la información disponible capacidades de tool calling, agentes, visión nativa, audio ni modo de razonamiento (thinking) para este modelo concreto; la familia menciona modos thinking y non-thinking en la comparativa, pero no se detalla su disponibilidad en la variante 1.8B.

## Casos de uso

- Traducción de documentación técnica y manuales: el modelo puede traducir grandes volúmenes de texto entre los 102 idiomas soportados con un coste computacional bajo, adecuado para pipelines batch de documentación.
- Localización de videojuegos: integrable en la cadena de herramientas open source TiMiHOKGameTranslator para traducir diálogos, textos de interfaz y contenido con marcadores, con métricas específicas de errores de placeholder y terminología.
- Traducción de imágenes en cascada con OCR: el modelo tolera errores de OCR y mejora la comprensión de contexto, lo que lo hace adecuado para traducir capturas de pantalla, cómics o documentos escaneados en pipelines OCR + traducción.
- Atención al cliente multilingüe: puede traducir conversaciones en tiempo real entre agentes y clientes en 102 idiomas, con un modelo de 1,8B que reduce los requisitos de hardware frente a modelos mayores.
- Traducción de contenido web y extensiones de navegador: la familia dispone de la extensión Tencent Hy Translate (Chrome y Edge) con traducción por selección, de página completa y de panel lateral, lo que sugiere su uso en escenarios de navegación.
- Evaluación automática de traducciones: combinable con la suite TransRubric publicada por el mismo equipo para construir pipelines de control de calidad de traducciones.
- Procesamiento de contenido multilingüe en producción con requisitos de coste: al ser un modelo FP8 de 2,0 GB, puede desplegarse en infraestructura modesta para traducción de alto volumen.

## Benchmarks y rendimiento

La model card indica que Hy-MT3-1.8B supera a iFlytek Translator, Microsoft Translator y Qwen-MT-Flash en traducción general, y que la familia se evalúa con FLORES-200, FLORES-200 low-resource, WMT26, Mandarin⇔Minority, WildMTBench-202611 e IFMTBench, con puntuaciones de TransRubric. Sin embargo, no se proporcionan cifras numéricas concretas en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el repositorio pesa 2,0 GB en FP8; se estima un uso de VRAM en torno a 2-3 GB para pesos, más memoria para el contexto y el runtime (estimación orientativa, no confirmada en la información).
- GPU recomendadas: no disponible en la información proporcionada; por tamaño, cabría en GPUs consumer con soporte FP8 (por ejemplo, serie RTX 40 o superior) y en GPUs de datacenter como A100 o H100, aunque no se confirma compatibilidad explícita.
- Cabe en GPU consumer: sí, por el tamaño de pesos (2,0 GB en FP8), aunque no se detallan GPUs concretas validadas.
- Opciones de despliegue: no se especifican en la información; el formato compressed-tensors FP8 es compatible con runtimes que soporten dicha cuantización (por ejemplo, vLLM con soporte compressed-tensors), pero no se confirma en la model card.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT3-1.8B-FP8 | 1,79B (FP8) | no disponible | 102 | Apache 2.0 | Variante cuantizada FP8 del modelo base |
| Hy-MT3-1.8B | 1,79B | no disponible | 102 | Apache 2.0 | Modelo base sin cuantizar |
| Hy-MT3-7B | 7B (aprox.) | no disponible | 102 | Apache 2.0 | Mismo family, mayor tamaño |
| Hy-MT3-30B-A3B | 30B totales, 3B activos (MoE) | no disponible | 102 | Apache 2.0 | Mejor rendimiento global de la familia según la model card |

No se dispone de datos numéricos de benchmarks para comparar rendimiento entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- No se detallan sesgos conocidos en la información disponible; al ser un modelo entrenado por un equipo chino, es plausible un sesgo hacia datos y dominios de esa región, aunque no se confirma.
- Riesgo de alucinación: no cuantificado en la información; la model card reporta reducciones de errores respecto a Hy-MT2, pero no una tasa absoluta.
- Limitaciones de contexto e idioma: la longitud de contexto no está disponible; la cobertura es de 102 idiomas, pero no se detalla el rendimiento por idioma ni los pares con menor calidad.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene revisar los términos del modelo base y de las dependencias (compressed-tensors).
- Al ser una variante FP8, puede haber una pérdida de calidad respecto al modelo base no cuantizado; no se documenta la magnitud de dicha pérdida.
- El modelo está especializado en traducción; no debe esperarse un rendimiento de propósito general (razonamiento, código, agentes) comparable a modelos generalistas.
- No se confirma soporte de tool calling ni de modo thinking en esta variante concreta.

## Enlaces

- [Hugging Face: tencent/Hy-MT3-1.8B-FP8](https://huggingface.co/tencent/Hy-MT3-1.8B-FP8)
- [Modelo base: tencent/Hy-MT3-1.8B](https://huggingface.co/tencent/Hy-MT3-1.8B)
- [Colección Hy-MT3 en Hugging Face](https://huggingface.co/collections/tencent/hy-mt3)
- [Colección Tencent Hunyuan en ModelScope](https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3)
- [Informe técnico Hy-MT3 (arXiv)](https://arxiv.org/pdf/2611.27673)
- [Repositorio GitHub Hy-MT3](https://github.com/Tencent-Hunyuan/Hy-MT3)
- [TransRubric (evaluación automática de traducción)](https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md)
- [TiMiHOKGameTranslator (herramienta de traducción de videojuegos)](https://github.com/Tencent/TiMiHOKGameTranslator)
- [Sitio oficial de Tencent AI Studio](https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g)
- [Extensión Tencent Hy Translate para Chrome](https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof?hl=en)
- [Extensión Tencent Hy Translate para Edge](https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm)
