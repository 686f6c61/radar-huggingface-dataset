# tencent/Hy-MT2-30B-A3B

## Resumen

Hy-MT2-30B-A3B es el modelo de traducción automática neuronal de mayor tamaño de la familia Hy-MT2, desarrollado por Tencent. Se trata de un modelo MoE (Mixture of Experts) con 30 064 millones de parámetros totales y 3 000 millones de parámetros activos, diseñado específicamente para tareas de traducción multilingüe complejas en entornos reales. La familia Hy-MT2 incluye además los modelos Hy-MT2-1.8B y Hy-MT2-7B, todos ellos publicados bajo licencia Apache-2.0 y disponibles en HuggingFace y ModelScope.

El modelo soporta traducción entre 33 idiomas y es capaz de seguir instrucciones de traducción en múltiples lenguas, incluyendo especificaciones de terminología, glosarios, formato de salida y contexto. Su arquitectura MoE permite un rendimiento de inferencia eficiente: aunque el modelo tiene 30B parámetros, solo se activan 3B por token, lo que reduce significativamente la latencia y el coste computacional en comparación con un modelo denso del mismo tamaño. Tencent lo describe como un modelo de «pensamiento rápido» (fast-thinking), orientado a producir traducciones de alta calidad sin necesidad de cadenas de razonamiento extensas.

La relevancia de Hy-MT2-30B-A3B radica en que cubre un espacio poco atendido por los modelos de propósito general: la traducción profesional con control fino de terminología, estilo y formato. Según la model card, supera a modelos abiertos como DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking, aunque no se publican cifras concretas. Además, Tencent ha abierto el benchmark IFMTBench para evaluar el seguimiento de instrucciones de traducción, lo que facilita la comparación objetiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | MoE (Mixture of Experts) con activación por token; arquitectura interna no especificada (tag `hy_v3`) |
| Parámetros totales | 30 064 725 888 |
| Parámetros activos | 3 000 000 000 (según denominación A3B) |
| Longitud de contexto | 8 192 tokens (según OpenRouter) |
| Tipos de cuantización | FP8 (variante Hy-MT2-30B-A3B-FP8); GGUF no disponible para este tamaño |
| Idiomas soportados | 36: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (repo de 61.1 GB) |

## Arquitectura y entrenamiento

La arquitectura exacta de Hy-MT2-30B-A3B no está documentada en la model card. Se sabe que es un modelo MoE con 3 000 millones de parámetros activos por token, pero no se especifica el tipo de atención (lineal, full, etc.) ni la estructura interna de los expertos. El tag `hy_v3` sugiere que utiliza una versión de la arquitectura híbrida de Tencent, pero no hay más detalles técnicos disponibles.

En cuanto al entrenamiento, no se han publicado datos sobre el número de tokens, la composición del dataset o el uso de técnicas de RLHF/DPO. La model card menciona que el modelo es capaz de seguir instrucciones complejas de traducción, lo que sugiere un entrenamiento supervisado con datos anotados con instrucciones, pero no se ofrecen cifras ni metodología. Tampoco se detalla si se utilizó entrenamiento multilingüe con pares de idiomas o datos sintéticos. Por tanto, la información de arquitectura y entrenamiento es limitada en la documentación pública actual.

## Capacidades

- Traducción multilingüe entre 36 idiomas, incluyendo idiomas mayoritarios (zh, en, fr, de, es, ja, ru, ar, etc.) y minoritarios (bo, kk, mn, ug, km, my, fa, etc.).
- Seguimiento de instrucciones de traducción en varios idiomas: el modelo puede recibir instrucciones de formato, estilo, registro y contexto.
- Soporte de glosarios y terminología: el prompt puede incluir pares de términos (fuente → destino) que el modelo debe respetar en la traducción.
- Traducción con formato estructurado: el modelo puede producir salidas delimitadas o en formato específico según se indique.
- Traducción contextual: admite la inclusión de contexto previo para desambiguar términos o mantener coherencia.
- Modo de traducción por defecto: genera solo la traducción sin explicaciones adicionales, tal como se especifica en las plantillas de prompt.
- No se mencionan capacidades de tool calling, agentes, razonamiento multi-paso ni visión; es un modelo de traducción puro.

## Casos de uso

- Localización de software y sitios web: el modelo puede traducir cadenas de interfaz de usuario manteniendo la coherencia terminológica mediante glosarios. Su capacidad de seguir instrucciones de formato permite generar cadenas que respeten variables, placeholders y restricciones de longitud, algo crítico en entornos de desarrollo.
- Traducción de subtítulos para vídeo: dado que Tencent colabora con WMT26 para la tarea de subtítulos, el modelo está preparado para traducir diálogos con contexto temporal y estilo, lo que lo hace adecuado para plataformas de streaming o generación de subtítulos automáticos.
- Traducción de documentación técnica y científica: el control de terminología vía glosarios permite que el modelo respete términos específicos de dominios como medicina, ingeniería o informática, reduciendo la necesidad de post-edición.
- Traducción de atención al cliente multilingüe: con su capacidad de instrucciones en múltiples idiomas, puede integrarse en chatbots o sistemas de soporte para traducir mensajes de clientes y respuestas manteniendo el tono y el contexto.
- Traducción de contenido legal y contractual: los glosarios y el contexto permiten mantener coherencia en cláusulas y terminología jurídica, aunque se requiere verificación humana por la criticidad del dominio.
- Traducción de contenido de redes sociales y marketing: el modelo puede adaptar el registro y el tono según instrucciones, produciendo traducciones naturales para campañas publicitarias o publicaciones.
- Integración en pipelines de traducción automática: al ser un modelo MoE eficiente, puede desplegarse en servicios de traducción con bajo coste de inferencia, sustituyendo a APIs comerciales en escenarios de alto volumen.

## Benchmarks y rendimiento

La model card no proporciona resultados numéricos de benchmarks. Solo se menciona que Hy-MT2-7B y Hy-MT2-30B-A3B superan a modelos abiertos como DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking, y que el 1.8B supera a APIs comerciales como Microsoft y Doubao, pero no se incluyen tablas ni métricas concretas. Tampoco se han encontrado resultados publicados en otras fuentes.

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El modelo tiene 30 064 millones de parámetros, por lo que en precisión FP16/BF16 ocupa aproximadamente 60 GB de VRAM (los safetensors pesan 61.1 GB). En FP8 se reduce a unos 30 GB.
- Para inferencia en FP16 se recomienda al menos una GPU con 64 GB de VRAM (por ejemplo, NVIDIA A100 de 80 GB o H100 de 80 GB). En FP8, una GPU de 40 GB (como A100 de 40 GB) puede ser suficiente, aunque la memoria de activación y los buffers requieren algo más.
- No es un modelo apto para GPUs de consumo como RTX 4090 (24 GB) en FP16, pero sí podría ejecutarse en FP8 con técnicas de offloading a CPU (aunque la latencia sería alta). No se ha publicado soporte para cuantización GGUF en este tamaño.
- Para despliegue en producción, se recomienda usar vLLM o TGI, que soportan MoE y FP8. No hay datos oficiales de latencia o throughput; se puede estimar que la velocidad de generación será mayor que un modelo denso de 30B gracias a la activación de solo 3B parámetros por token.
- Alternativa: usar la versión FP8 disponible en HuggingFace, que reduce el footprint de memoria y mejora la velocidad de inferencia.

## Comparativa con modelos similares

No se dispone de datos comparativos con otros modelos de traducción del mismo tamaño. La model card menciona que Hy-MT2-30B-A3B supera a DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking, pero no se dan especificaciones de esos modelos (parámetros, contexto, licencia) ni cifras numéricas. Tampoco se han encontrado comparativas con modelos de traducción dedicados como NLLB-200, M2M-100 o MADLAD. Por tanto, la comparativa no está disponible en las fuentes consultadas.

## Limitaciones y advertencias

- No se han publicado datos sobre sesgos del modelo, pero al ser un modelo de traducción entrenado con datos multilingües, es probable que presente sesgos culturales o de género en los datos de entrenamiento.
- Riesgo de alucinación: al tratarse de un modelo generativo, puede inventar contenido cuando el contexto es ambiguo o el prompt no es suficientemente claro, especialmente en pares de idiomas con menos recursos.
- Limitación de contexto: la ventana de 8 192 tokens (según OpenRouter) puede ser insuficiente para documentos largos, y la salida máxima de 4 096 tokens limita la traducción de textos muy extensos en una sola pasada.
- No soporta idiomas fuera de la lista de 36; los idiomas minoritarios (bo, km, my, ug, etc.) pueden tener menor calidad por menor cantidad de datos de entrenamiento.
- La licencia Apache-2.0 permite uso comercial, pero no se especifican restricciones sobre el uso de los pesos en aplicaciones con datos sensibles; el usuario debe verificar el cumplimiento de normativas de privacidad.
- No hay información sobre el proceso de entrenamiento (datos, técnicas de alineación), por lo que no se puede evaluar la robustez ante prompts adversarios o la fiabilidad en dominios críticos.
- Para producción, se recomienda validar la calidad en pares de idiomas concretos y con dominios específicos, ya que el rendimiento puede variar considerablemente según la combinación.

## Enlaces

- [HuggingFace - Hy-MT2-30B-A3B](https://huggingface.co/tencent/Hy-MT2-30B-A3B)
- [ModelScope - Hy-MT2-30B-A3B](https://www.modelscope.cn/models/Tencent-Hunyuan/Hy-MT2-30B-A3B)
- [GitHub del proyecto Hy-MT2](https://github.com/Tencent-Hunyuan/Hy-MT2)
- [Repositorio AngelSlim (cuantización)](https://github.com/Tencent/AngelSlim/tree/main)
- [Paper - Hy-MT2 Report (arXiv)](https://arxiv.org/pdf/2605.22064)
- [Benchmark IFMTBench (incluido en el repo)](https://huggingface.co/tencent/Hy-MT2-30B-A3B/tree/main/IFMTBench)
- [Skill de integración Hy-MT2-Translator en ClawHub](https://clawhub.ai/tencent-adm/hy-mt2-translator-skill)
- [Skill de integración Hy-MT2-Translator en SkillHub](https://skillhub.cn/skills/hy-mt2-translator)
- [Página oficial de Tencent Hy](https://aistudio.tencent.com/modelSquare/home/list)
