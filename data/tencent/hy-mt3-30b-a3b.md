# tencent/Hy-MT3-30B-A3B

## Resumen

Hy-MT3-30B-A3B es la tercera generación de la familia de modelos de traducción multilingüe Hy de Tencent, publicada en noviembre de 2026. Se trata de un modelo de arquitectura transformer con mezcla de expertos (MoE) de 30.064 millones de parámetros totales y aproximadamente 3.000 millones de parámetros activos por token, lo que le permite operar con un coste de inferencia muy inferior al de su tamaño nominal. La familia Hy-MT3 se completa con variantes densas de 1,8B y 7B, y amplía la cobertura lingüística desde los 38 idiomas de Hy-MT2 hasta 102 idiomas.

El modelo está especializado en traducción automática y resuelve el problema de la fidelidad a las restricciones del usuario en entornos reales: según la model card, reduce un 43% los errores de traducción, un 74% las omisiones o adiciones y un 40% los fallos de seguimiento de instrucciones frente a Hy-MT2. Además del uso general, está optimizado para dos escenarios industriales concretos: localización de videojuegos (con datos y sistema de evaluación del equipo de Honor of Kings) y traducción de imágenes en cascada con OCR.

Su relevancia actual radica en la relación calidad-coste: con solo 3B de parámetros activos, Tencent afirma que logra el mejor rendimiento global en modo sin razonamiento entre todos los modelos evaluados, incluidos modelos propietarios de gama alta, y supera a modelos que consumen más de 30 veces su cómputo de inferencia. La licencia Apache 2.0 y el formato safetensors compatible con transformers facilitan su integración en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), tag `hy_v3` |
| Parametros totales | 30.064.725.888 (30,06B) |
| Parametros activos | Aproximadamente 3B (según la nomenclatura 30B-A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | 102 idiomas (zh, en, es, fr, de, it, pt, ru, ja, ko, ar, hi, entre otros; incluye lenguas de bajos recursos como km, my, bo, ug, yue, ceb, war, ckb) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers) |

## Arquitectura y entrenamiento

Hy-MT3-30B-A3B emplea una arquitectura transformer con mezcla de expertos: de los 30,06B de parámetros totales, solo unos 3B se activan por token, lo que sitúa el coste de inferencia en el rango de un modelo denso pequeño. El identificador de arquitectura en el repositorio es `hy_v3`, lo que indica una evolución propia de la familia Hy respecto a generaciones anteriores. La model card no detalla el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO.

El entrenamiento incorpora datos de alta calidad del dominio de videojuegos, construidos junto con el equipo de Honor of Kings, y un sistema de evaluación profesional específico para ese dominio. También se optimiza para traducción de imágenes en cascada con OCR, mejorando la comprensión del contexto y la corrección de errores para tolerar fallos del OCR. El modelo opera en modo sin razonamiento (non-thinking) por defecto, aunque el informe menciona explícitamente la existencia de un modo thinking en la familia. La model card no describe innovaciones como decodificación especulativa o atención lineal.

## Capacidades

- Traducción automática multilingüe entre 102 idiomas, incluidos pares de bajos recursos y minorías lingüísticas chinas.
- Seguimiento de instrucciones de traducción (restricciones de estilo, terminología, formato), con una reducción del 40% en errores de instruction-following frente a Hy-MT2.
- Traducción fiel a restricciones del usuario: menos omisiones, adiciones y mistranslaciones en datos de escenarios reales.
- Localización de videojuegos: control de tasa de fuera de objetivo, errores de marcadores (placeholders), errores de texto enriquecido y errores de terminología.
- Traducción de imágenes en cascada con OCR, tolerando errores del reconocimiento óptico.
- Generación de texto y pipeline de `text-generation` en transformers.
- Modo sin razonamiento (non-thinking) como configuración principal; el informe menciona modo thinking en la familia.
- No se documenta soporte de tool calling, function calling, agentes, visión nativa ni audio en la información disponible.

## Casos de uso

- Traducción de documentación técnica y productos multilingües: el modelo cubre 102 idiomas y respeta restricciones de terminología, lo que permite mantener glosarios consistentes en manuales y fichas de producto.
- Localización de videojuegos: integrado en la cadena de herramientas TiMiHOKGameTranslator, controla errores de placeholders y texto enriquecido, críticos en cadenas de build de juegos donde un marcador roto rompe la interfaz.
- Traducción de capturas y documentos escaneados: su tolerancia a errores de OCR lo hace adecuado para pipelines de traducción de imágenes en cascada, con corrección de contexto sobre el texto reconocido.
- Atención al cliente multilingüe: traducción en tiempo real de conversaciones entre agentes y clientes en decenas de idiomas, con bajo coste de inferencia gracias a los 3B de parámetros activos.
- Traducción de contenido generado por usuarios (reseñas, foros, redes): cobertura de lenguas de bajos recursos como cebuano, waray, kurdo sorani o tibetano, donde muchos modelos comerciales no llegan.
- Evaluación automática de traducciones: combinado con la suite TransRubric publicada por Tencent, sirve para puntuar salidas de otros sistemas de traducción en pipelines de control de calidad.
- Traducción de documentación legal o administrativa con restricciones de formato: el seguimiento de instrucciones permite preservar estructura, marcadores y estilo exigidos por el cliente.

## Benchmarks y rendimiento

La model card presenta resultados gráficos (imágenes `main_result.png` y `efficiency.png`) sin tablas numéricas en el texto extraído. Los conjuntos de evaluación citados son FLORES-200, FLORES-200 low-resource, WMT26, Mandarin⇔Minority, WildMTBench-202611 e IFMTBench, puntuados con TransRubric. Las afirmaciones cualitativas son:

| Afirmación | Dato |
|---|---|
| Mejor rendimiento global en modo non-thinking entre los modelos evaluados | Según Tencent, por delante de Qwen3.8-Max, Kimi-K3.1-Pro y DeepSeek-V4.1-Flash |
| Comparación con modelos cerrados de razonamiento | Se aproxima a GPT-6.1-Sol y Gemini-4-Argon |
| Eficiencia frente a cómputo | Supera a modelos que consumen más de 30 veces su cómputo de inferencia |
| Coste por muestra | Menos de 1 TFLOP por muestra en traducción general |
| Localización de juegos | Iguala o supera a Gemini 3.1 Pro en tasa de fuera de objetivo, placeholders, texto enriquecido y terminología |
| Traducción de imágenes | Mejor resultado entre modelos de tamaño comparable en VISTA-Bench |
| Reducción de errores frente a Hy-MT2 | 43% mistranslaciones, 74% omisiones/adiciones, 40% instruction-following |

No se han publicado resultados numéricos desglosados por benchmark en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: con 30,06B de parámetros totales, en FP16 se requieren aproximadamente 60 GB solo para pesos; en cuantización de 8 bits, unos 30 GB; en 4 bits, unos 15-16 GB. Estas cifras son estimaciones a partir del tamaño, no datos publicados.
- GPU recomendadas: para FP16, A100 80 GB, H100 80 GB o varias GPU de 48 GB en paralelo. Para cuantización de 8 bits, una A100 40 GB o L40S 48 GB. Para 4 bits, una RTX 4090 de 24 GB podría alojar los pesos, aunque el contexto y los buffers de activación pueden exigir más memoria.
- Cabe en GPU de consumo: sí, en cuantizaciones de 4 bits y con contexto limitado, en RTX 4090 (24 GB) o RTX 3090 (24 GB). Al ser MoE con 3B activos, el throughput por token es bajo en comparación con modelos densos del mismo tamaño nominal.
- Opciones de despliegue: transformers (librería declarada), y previsiblemente vLLM, TGI y llama.cpp si se generan conversiones GGUF, aunque la información disponible no confirma soporte explícito en estos motores. Existe endpoint compatible (`endpoints_compatible`) y despliegue en ModelScope.
- Latencia y throughput: no disponibles. La model card solo indica que el coste estimado es inferior a 1 TFLOP por muestra en traducción general, lo que sugiere latencias bajas en hardware moderno.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| Hy-MT3-30B-A3B | 30,06B totales / ~3B activos | no disponible | 102 | Apache 2.0 | Especializado en traducción; mejor puntuación non-thinking según Tencent |
| Hy-MT3-7B | 7B (denso) | no disponible | 102 | Apache 2.0 | Misma familia, menor coste, menor calidad |
| Hy-MT3-1.8B | 1,8B (denso) | no disponible | 102 | Apache 2.0 | Supera a APIs comerciales como iFlytek Translator y Microsoft Translator en traducción general según Tencent |
| Hy-MT2-30B-A3B | 30B totales / ~3B activos | no disponible | 38 | Apache 2.0 | Generación anterior; Hy-MT3 reduce errores un 43-74% |
| Qwen-MT-Flash | no disponible | no disponible | no disponible | no disponible | API comercial citada como referencia; superada por Hy-MT3-1.8B en traducción general según Tencent |

No se dispone de datos numéricos de benchmarks para una comparación cuantitativa directa con alternativas.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados en la información disponible; como modelo entrenado con datos web y de dominio, puede heredar sesgos culturales y lingüísticos.
- Riesgo de alucinación: aunque está especializado en traducción, puede generar contenido no presente en el texto fuente, especialmente en pares de bajos recursos o con entradas ambiguas. La model card reporta reducciones de errores, no su eliminación.
- Limitaciones de contexto: la longitud máxima de contexto no está publicada, lo que impide planificar su uso en documentos largos sin pruebas previas.
- Cobertura desigual por idioma: los 102 idiomas incluyen lenguas de muy bajos recursos (cebuano, waray, tibetano, uigur) donde la calidad será previsiblemente inferior a la de pares mayoritarios.
- Modo thinking: la evaluación principal se realiza en modo non-thinking; el modo thinking puede aumentar latencia y coste de forma significativa.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se documentan cláusulas adicionales.
- Producción: al ser un MoE de 30B, el despliegue en FP16 exige hardware de gama alta; las estimaciones de VRAM no están publicadas por el autor y deben validarse en el entorno objetivo.
- Fecha del modelo: la model card y los benchmarks citan modelos y conjuntos (WMT26, GPT-6.1-Sol, Gemini-4-Argon) coherentes con la fecha de publicación de noviembre de 2026; verificar la vigencia de las comparaciones.

## Enlaces

- Hugging Face: https://huggingface.co/tencent/Hy-MT3-30B-A3B
- Colección Hy-MT3 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt3
- ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT3
- Informe técnico (arXiv): https://arxiv.org/pdf/2611.27673
- GitHub del proyecto: https://github.com/Tencent-Hunyuan/Hy-MT3
- Suite de evaluación TransRubric: https://github.com/Tencent-Hunyuan/Hy-MT3/blob/main/TransRubric/README.md
- Herramienta de traducción de juegos TiMiHOKGameTranslator: https://github.com/Tencent/TiMiHOKGameTranslator
- Sitio oficial de demostración: https://aistudio.tencent.ai/chat/HunyuanDefault?from=modelSquare&modelId=hunyuan-translation-pro-chat-g
