# WX957/Hy-MT2-1.8B

## Resumen

Hy-MT2-1.8B es un modelo de traducción automática multilingüe de la familia Hy-MT2 desarrollada por Tencent Hunyuan. Se trata del miembro más pequeño de una familia que también incluye variantes de 7B y 30B-A3B (MoE), y está diseñado específicamente para traducción en escenarios reales complejos, incluyendo instrucciones de traducción con terminología controlada. El modelo emplea una arquitectura transformer densa identificada como `hunyuan_v1_dense` en la librería transformers, con 2.038.515.712 parámetros totales (aproximadamente 1.8B según la nomenclatura comercial) y pesos en formato safetensors.

El modelo cubre traducción entre 33 idiomas, incluyendo pares poco habituales en modelos generalistas como tibetano, mongol, uigur, jemer, birmano, guyaratí, urdu, telugu, maratí, bengalí y tamil. Está pensado para despliegue en dispositivo (on-device), con variantes de cuantización extrema (1.25-bit GGUF) que reducen el almacenamiento a 440 MB y mejoran la velocidad de inferencia 1.5x según el autor. La licencia Apache 2.0 facilita su uso comercial.

La relevancia del modelo radica en su orientación específica a traducción con seguimiento de instrucciones (instruction-following translation), un aspecto poco cubierto por modelos de traducción tradicionales. El autor publica junto al modelo el benchmark IFMTBench para evaluar esta capacidad, y sitúa al modelo de 1.8B por encima de APIs comerciales como Microsoft y Doubao en evaluación global según sus resultados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer densa (`hunyuan_v1_dense`) |
| Parametros totales | 2.038.515.712 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | FP8, GGUF (estándar), GGUF 2-bit, GGUF 1.25-bit (AngelSlim) |
| Idiomas soportados | 33: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (principal); GGUF en repos derivados |

## Arquitectura y entrenamiento

El modelo utiliza una arquitectura transformer densa, identificada en la librería transformers como `hunyuan_v1_dense`, con 2.038.515.712 parámetros. Se enmarca en la familia Hy-MT2, que incluye variantes de 7B (densa) y 30B-A3B (MoE). El autor describe la familia como modelos de traducción "fast-thinking", es decir, orientados a inferencia rápida sin modo de razonamiento extendido, lo que los hace adecuados para despliegue de baja latencia.

No se dispone en la información proporcionada del número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron técnicas de RLHF o DPO. Tampoco se detallan innovaciones arquitectónicas específicas más allá de la designación `hunyuan_v1_dense`. El autor publica un informe técnico (arXiv:2605.22064) que presumiblemente contiene estos detalles, pero su contenido no está incluido en la información disponible. La innovación destacable documentada es la cuantización extrema AngelSlim 1.25-bit, que reduce el modelo a 440 MB y acelera la inferencia 1.5x para despliegue en dispositivo.

## Capacidades

- Traducción automática entre 33 idiomas, incluyendo pares de baja representación como tibetano, mongol, uigur, jemer, birmano, tamil, telugu, maratí, guyaratí, urdu y bengalí.
- Seguimiento de instrucciones de traducción en múltiples idiomas (prompts en chino e inglés documentados).
- Traducción con terminología controlada: permite proporcionar glosarios de referencia para forzar terminología específica.
- Traducción con restricciones de formato: instrucciones para que solo se emita el resultado traducido sin explicaciones adicionales.
- Capacidad de traducción en escenarios empresariales y de dominio específico, según la evaluación del autor.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento extendido (thinking mode).

## Casos de uso

- Localización de productos digitales: el modelo permite traducir interfaces y documentación entre 33 idiomas, incluidos idiomas de mercados emergentes poco cubiertos por APIs comerciales, con una única licencia Apache 2.0 y despliegue autocontenido.
- Subtitulado y traducción audiovisual: la colaboración del autor con WMT26 en la tarea de traducción de subtítulos de vídeo sugiere idoneidad para este escenario; el modelo puede procesar segmentos de subtítulos con instrucciones de formato estricto para producir únicamente el texto traducido.
- Traducción con glosario corporativo: en documentación técnica o legal, se puede inyectar un glosario de términos en el prompt para garantizar consistencia terminológica, una capacidad documentada explícitamente en la model card.
- Despliegue en dispositivo (on-device): con la cuantización 1.25-bit GGUF (440 MB), el modelo puede ejecutarse en dispositivos con recursos limitados, como aplicaciones móviles o sistemas embebidos, para traducción offline sin conexión.
- Atención al cliente multilingüe: integrado en un pipeline de soporte, el modelo puede traducir conversaciones en tiempo real entre agentes y clientes en 33 idiomas, con baja latencia al ser un modelo denso de 1.8B.
- Traducción de contenido generado por usuarios: moderación y traducción de comentarios, reseñas o mensajes en plataformas sociales que reciben contenido en múltiples idiomas, incluyendo lenguas de Asia Central y del Sur poco cubiertas por modelos generalistas.
- Investigación en traducción automática: como modelo pequeño con licencia permisiva y benchmark asociado (IFMTBench), sirve como línea base reproducible para experimentos académicos en traducción con seguimiento de instrucciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numéricos en la información disponible. La model card menciona que el modelo de 1.8B "supera globalmente a APIs comerciales como Microsoft y Doubao" y que los modelos de 7B y 30B-A3B superan a DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking, pero no se proporcionan cifras concretas en la información disponible. El autor remite al informe técnico (arXiv:2605.22064) y a la figura `imgs/main_result.png` para los resultados detallados, no incluidos en esta ficha.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 4-5 GB (2.038.515.712 parámetros × 2 bytes más overhead de activaciones y KV cache).
- VRAM estimada en FP8: aproximadamente 2-3 GB.
- VRAM estimada en GGUF 1.25-bit: aproximadamente 440 MB según el autor.
- GPU recomendadas: cualquier GPU consumer moderna con 6 GB o más de VRAM para FP16 (RTX 3060, RTX 4060, RTX 4090); para FP8 o GGUF, GPUs con 4 GB o más.
- Cabe en GPU consumer: sí, en todas las GPUs consumer actuales con 6 GB o más; en cuantización 1.25-bit cabe en dispositivos de muy bajos recursos.
- Opciones de despliegue: transformers (nativo), llama.cpp (variantes GGUF oficiales), y presumiblemente vLLM y TGI al ser compatible con transformers; AngelSlim para cuantización extrema.
- Latencia y throughput: no disponibles. El autor indica una mejora de 1.5x en velocidad con la cuantización 1.25-bit respecto a la versión sin cuantizar, pero sin cifras absolutas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato |
|---|---|---|---|---|---|
| Hy-MT2-1.8B | 2.038.515.712 | No disponible | 33 | Apache 2.0 | safetensors, GGUF, FP8 |
| Hy-MT2-7B | No disponible | No disponible | 33 | Apache 2.0 | safetensors, GGUF, FP8 |
| Hy-MT2-30B-A3B | No disponible (MoE) | No disponible | 33 | Apache 2.0 | safetensors, FP8 |
| HY-MT1.5-1.8B | No disponible | No disponible | No disponible | No disponible | No disponible |

La comparativa se limita a la propia familia Hy-MT2 y su predecesor HY-MT1.5, ya que la información proporcionada no incluye datos de modelos de traducción de otros desarrolladores con especificaciones verificables. No se dispone de datos de rendimiento comparativo numérico.

## Limitaciones y advertencias

- No se documentan sesgos conocidos en la información disponible; como modelo entrenado presumiblemente con datos web multilingües, es probable que herede sesgos de esos corpus, pero no se confirma.
- Riesgo de alucinación: no cuantificado en la información disponible; en tareas de traducción, el riesgo se manifiesta como adiciones, omisiones o interpretaciones libres del texto fuente.
- Longitud de contexto no documentada: se desconoce la ventana máxima, lo que limita la planificación para documentos largos.
- Aunque cubre 33 idiomas, no se especifica la calidad relativa por par de idiomas; los pares de bajos recursos (bo, ug, my, km) probablemente tengan menor calidad que los pares principales.
- La licencia Apache 2.0 permite uso comercial sin restricciones adicionales conocidas, pero conviene verificar los términos de los repositorios derivados (GGUF, FP8) por si difieren.
- El modelo está orientado a traducción; su uso como modelo generativo general no está validado y probablemente dé resultados pobres fuera de tareas de traducción.
- El identificador del repo en Hugging Face (`WX957/Hy-MT2-1.8B`) no coincide con el repo oficial de Tencent (`tencent/Hy-MT2-1.8B`) referenciado en la model card; conviene verificar la procedencia y autenticidad de los pesos antes de usarlos en producción.
- El número de descargas (0) y likes (1) indica que el repo es de reciente creación o poco difundido; no hay validación comunitaria de los pesos.

## Enlaces

- Repositorio Hugging Face (objeto de esta ficha): https://huggingface.co/WX957/Hy-MT2-1.8B
- Repositorio oficial de Tencent: https://huggingface.co/tencent/Hy-MT2-1.8B
- Colección Hy-MT2 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt2
- Colección en ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT2
- Informe técnico (arXiv): https://arxiv.org/pdf/2605.22064
- GitHub del proyecto: https://github.com/Tencent-Hunyuan/Hy-MT2
- AngelSlim (cuantización): https://github.com/Tencent/AngelSlim/tree/main
- Web oficial: https://aistudio.tencent.com/llm/en?tabIndex=0
- Benchmark IFMTBench: https://huggingface.co/WX957/Hy-MT2-1.8B/blob/main/IFMTBench/README.md
- Skill de traducción en ClawHub: https://clawhub.ai/tencent-adm/hy-mt2-translator-skill
- Skill de traducción en SkillHub: https://skillhub.cn/skills/hy-mt2-translator
- WMT26 tarea de subtítulos de vídeo: https://www2.statmt.org/wmt26/video-subtitle-translation.html
- WMT26 tarea de traducción general: https://www2.statmt.org/wmt26/translation-task.html
