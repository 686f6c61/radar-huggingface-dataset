# tencent/Hy-MT3-30B-A3B-FP8

## Resumen

Hy-MT3-30B-A3B-FP8 es la versión cuantizada en FP8 del modelo de traducción multilingüe Hy-MT3-30B-A3B, desarrollado por Tencent como tercera generación de su familia Hy de traducción automática. Se trata de un modelo de arquitectura MoE (mezcla de expertos) con 30.064 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, diseñado específicamente para tareas de traducción y no como un modelo de propósito general.

El modelo amplía la cobertura lingüística de las 38 lenguas de Hy-MT2 hasta 102 lenguas y, según la model card, reduce un 43 % los errores de traducción, un 74 % las omisiones o adiciones y un 40 % los fallos de seguimiento de instrucciones respecto a la generación anterior en datos de escenarios reales. Con solo 3.000 millones de parámetros activos, Tencent afirma que alcanza el mejor rendimiento global en modo sin razonamiento entre los modelos evaluados, incluyendo modelos propietarios de mayor tamaño.

La relevancia actual del modelo radica en su eficiencia computacional (menos de 1 TFLOP por muestra según el autor) y en su optimización para dos escenarios industriales concretos: la localización de videojuegos y la traducción de imágenes con tolerancia a errores de OCR. La versión FP8 reduce el peso del repositorio a 61,2 GB, facilitando su despliegue en infraestructura con memoria limitada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos), transformer; tag de librería `hy_v3` |
| Parametros totales | 30.064.725.984 (30,06 B) |
| Parametros activos | ~3 B (denominación 30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8 (esta versión); el modelo base está en precisión completa |
| Idiomas soportados | 102 lenguas (según model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (FP8) |
| Tamaño del repositorio | 61,2 GB |
| Pipeline | translation |
| Modelo base | tencent/Hy-MT3-30B-A3B |
| Descargas / likes | 109 / 5 (a fecha de la información) |

## Arquitectura y entrenamiento

Hy-MT3-30B-A3B emplea una arquitectura de mezcla de expertos con 30.064 millones de parámetros totales de los que aproximadamente 3.000 millones se activan por token, lo que reduce el coste de inferencia en comparación con un modelo denso del mismo tamaño. La model card no detalla el número de expertos, la proporción de activación ni la composición exacta del dataset de entrenamiento; tampoco especifica si se aplicaron técnicas de RLHF o DPO. La información disponible solo indica que el modelo fue construido con datos de alta calidad del dominio de videojuegos y un sistema de evaluación profesional del equipo de Honor of Kings, y que incorpora mejoras de comprensión de contexto y corrección de errores para tolerar fallos de OCR en pipelines de traducción de imágenes.

Esta versión concreta es una cuantización FP8 del modelo base, publicada para reducir el espacio en memoria y acelerar la inferencia manteniendo, según el autor, el rendimiento del modelo original. La model card no proporciona detalles sobre el proceso de cuantización (calibración, granularidad por canal o por tensor) ni sobre la pérdida de calidad asociada. El tag `hy_v3` sugiere una implementación de referencia propia para cargar los pesos, distinta de las arquitecturas estándar de transformers.

## Capacidades

- Traducción automática multilingüe entre 102 lenguas, con cobertura ampliada respecto a las 38 de Hy-MT2.
- Traducción bidireccional chino-mandarín y lenguas minoritarias de China (Mandarin⇔Minority), incluida en el conjunto de evaluación general.
- Seguimiento de instrucciones de traducción (restricciones de estilo, terminología, formato), evaluado mediante IFMTBench.
- Localización de videojuegos: control de tasa de fuera de objetivo, errores de marcadores (placeholders), errores de texto enriquecido y errores de terminología.
- Traducción de imágenes en cascada con OCR, con tolerancia a errores de reconocimiento y corrección de contexto.
- Modo sin razonamiento (non-thinking) como configuración por defecto; la model card menciona un modo thinking en modelos comparables, pero no detalla si Hy-MT3 lo expone.
- Integración con la cadena de herramientas de traducción de videojuegos TiMiHOKGameTranslator.
- No se documentan capacidades de tool calling, agentes, visión nativa ni audio en la información disponible.

## Casos de uso

- Localización de videojuegos en producción: el modelo puede integrarse en el pipeline de desarrollo mediante TiMiHOKGameTranslator para traducir diálogos, textos de interfaz y descripciones de objetos, con control específico de marcadores y terminología del dominio, métricas en las que iguala o supera a modelos propietarios según el autor.
- Traducción de documentación técnica multilingüe: con 102 lenguas soportadas y capacidad de seguir instrucciones de terminología, resulta adecuado para generar y mantener versiones localizadas de manuales y bases de conocimiento.
- Traducción de imágenes y capturas de pantalla: combinado con un OCR en cascada, el modelo corrige errores de reconocimiento y mantiene la coherencia contextual, lo que lo hace útil para localizar interfaces, menús y material gráfico.
- Atención al cliente multilingüe: puede traducir conversaciones en tiempo real entre agentes y usuarios de distintas lenguas, aprovechando su bajo coste de inferencia (3 B activos) para despliegues con alta concurrencia.
- Traducción de contenido editorial y marketing: el seguimiento de restricciones de estilo y formato permite adaptar tono y registro por mercado sin post-edición extensiva.
- Evaluación automática de traducciones: el modelo puede combinarse con la suite TransRubric, publicada junto a esta familia, para puntuar la calidad de traducciones de terceros en pipelines de control de calidad.
- Procesamiento por lotes de grandes volúmenes documentales: la cuantización FP8 y la arquitectura MoE permiten servir el modelo con menor huella de memoria que un denso equivalente, reduciendo el coste por token traducido.

## Benchmarks y rendimiento

La model card referencia resultados gráficos (imágenes `main_result.png` y `efficiency.png`) y el informe técnico en arXiv, pero no incluye tablas numéricas con valores concretos en el texto proporcionado. Los conjuntos de evaluación mencionados son FLORES-200, FLORES-200 low-resource, WMT26, Mandarin⇔Minority, WildMTBench-202611 e IFMTBench, puntuados con TransRubric.

| Benchmark | Resultado |
|---|---|
| FLORES-200 | no disponible (solo figura) |
| FLORES-200 low-resource | no disponible (solo figura) |
| WMT26 | no disponible (solo figura) |
| WildMTBench-202611 | no disponible (solo figura) |
| IFMTBench | no disponible (solo figura) |
| VISTA-Bench (traducción de imágenes) | no disponible (solo figura) |

Afirmaciones cualitativas del autor recogidas en la model card: Hy-MT3-30B-A3B logra el mejor rendimiento global en modo sin razonamiento frente a Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash, y se aproxima a GPT-6.1-Sol y Gemini-4-Argon en modo thinking, superando a modelos que consumen más de 30 veces su cómputo de inferencia. Estas cifras no se pueden verificar sin los valores numéricos del informe.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos FP8 ocupan aproximadamente 30 GB (61,2 GB de repositorio incluyen otros artefactos); se recomienda al menos 40 GB de VRAM para pesos más caché KV y overhead.
- GPU recomendadas: A100 80 GB, H100 80 GB, H200 o GPUs con al menos 48 GB para despliegues con contexto amplio y concurrencia.
- GPU de consumo: una RTX 4090 (24 GB) no puede alojar los pesos FP8 completos; sería necesario un despliegue multi-GPU o una cuantización adicional a 4 bits (no publicada en la información disponible).
- Opciones de despliegue: el tag `hy_v3` sugiere una implementación de referencia propia; no se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI en la información disponible.
- Latencia y throughput: no disponibles. El autor indica un coste inferior a 1 TFLOP por muestra en modo sin razonamiento, pero no publica latencias medidas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B-FP8 | 30,06 B totales / ~3 B activos | no disponible | Apache 2.0 | Hugging Face, ModelScope | Especializado en traducción, 102 lenguas, FP8 |
| Hy-MT3-30B-A3B | 30,06 B totales / ~3 B activos | no disponible | Apache 2.0 | Hugging Face, ModelScope | Versión base sin cuantizar |
| Hy-MT3-7B | 7 B (denso, presumiblemente) | no disponible | Apache 2.0 | Hugging Face, ModelScope | Misma familia, menor tamaño |
| Hy-MT3-1.8B | 1,8 B | no disponible | Apache 2.0 | Hugging Face, ModelScope | Según el autor, supera a APIs comerciales en traducción general |
| Qwen3.8-Max / Kimi-K3.1-Pro / DeepSeek-V4.1-Flash | no disponible | no disponible | propietaria o no especificada | servicios propietarios | Referencias de comparación citadas por el autor |
| GPT-6.1-Sol / Gemini-4-Argon | no disponible | no disponible | propietaria | servicios propietarios | Modelos cerrados en modo thinking citados como referencia |

No se dispone de datos numéricos de rendimiento para construir una comparativa cuantitativa fiable; la comparación anterior se limita a parámetros, licencia y disponibilidad según la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado en traducción: no está diseñado como modelo de propósito general y su uso para otras tareas (razonamiento, código, matemáticas) no está documentado.
- La model card no detalla sesgos conocidos, cobertura real por lengua ni calidad diferencial entre las 102 lenguas anunciadas; el rendimiento en lenguas de bajos recursos puede ser inferior.
- Riesgo de alucinación y de omisiones o adiciones en textos largos, aunque el autor afirma reducirlas un 74 % respecto a Hy-MT2.
- No se especifica la longitud de contexto soportada, lo que dificulta planificar despliegues con documentos extensos.
- La cuantización FP8 puede introducir degradación de calidad respecto al modelo base; no se publican métricas comparativas entre ambas versiones.
- El tag de arquitectura `hy_v3` implica posible dependencia de código propio para la carga e inferencia; la compatibilidad con frameworks estándar no está confirmada.
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar los términos del modelo base y de los datos de entrenamiento, no detallados en la información disponible.
- El modelo se distribuye con 109 descargas y 5 likes en el momento de la consulta, lo que indica una adopción todavía muy limitada y escasa validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-MT3-30B-A3B-FP8
- Modelo base: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- README en chino: https://huggingface.co/tencent/Hy-MT3-30B-A3B-FP8/blob/main/README_CN.md
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- Repositorio GitHub: https://github.com/Tencent-Hunyuan/Hy-MT3
- Suite de evaluación TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- Herramienta de traducción de videojuegos TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de traducción: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
- Extensión de navegador (Chrome): https://chromewebstore.google.com/detail/tencent-hy-translate-a-pe/plkeongecagdacbbldjkoaijdogfkhof?hl=en
- Extensión de navegador (Edge): https://microsoftedge.microsoft.com/addons/detail/npohaablejgdcokflkffadojdconaacm
