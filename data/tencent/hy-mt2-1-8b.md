# tencent/Hy-MT2-1.8B

## Resumen

Hy-MT2-1.8B es un modelo de traducción automática multilingüe desarrollado por Tencent, perteneciente a la familia Hy-MT2 diseñada para escenarios reales complejos. Con 1.800 millones de parámetros (2.038.515.712 en total), forma parte de una familia que incluye versiones de 7B y 30B-A3B (MoE). El modelo soporta traducción entre 33 idiomas y es capaz de seguir instrucciones de traducción en múltiples lenguas, lo que le permite adaptarse a tareas con terminología, contexto, estilo o formatos estructurados.

La relevancia actual de Hy-MT2-1.8B reside en su equilibrio entre tamaño compacto y rendimiento. Según la documentación oficial, supera a APIs comerciales de proveedores como Microsoft y Doubao en evaluación global, y su cuantización extrema de 1,25 bits mediante AngelSlim reduce el almacenamiento a solo 440 MB, lo que lo hace viable para despliegue en dispositivos. Se distribuye bajo licencia Apache 2.0 y está disponible en Hugging Face y ModelScope, con soporte para el ecosistema Transformers y formatos GGUF y FP8.

El modelo se publicó el 21 de mayo de 2026 junto con IFMTBench, un benchmark para evaluar la capacidad de seguir instrucciones de traducción. Tencent también ofrece un Skill denominado Hy-MT2-Translator para facilitar su integración en aplicaciones de traducción.

## Arquitectura y entrenamiento

Hy-MT2-1.8B se basa en una arquitectura transformer densa (etiqueta `hunyuan_v1_dense` en Hugging Face), con un total de 2.038.515.712 parámetros. No se especifica la longitud de contexto en la información disponible, ni se detalla el número de tokens de entrenamiento o la composición exacta del dataset. La documentación menciona que se trata de un modelo "fast-thinking", lo que sugiere un diseño optimizado para baja latencia en tareas de traducción.

El entrenamiento se ha orientado a la traducción multilingüe con capacidad de seguir instrucciones complejas. Se menciona que el modelo puede manejar tareas con glosarios, estilo, contexto y formatos estructurados, lo que indica un entrenamiento con datos de instrucciones de traducción variados. No se detalla si se utilizaron técnicas como RLHF o DPO; la información disponible no lo especifica. La familia Hy-MT2 incluye además versiones cuantizadas (FP8, GGUF de 2 bits y 1,25 bits) que amplían las opciones de despliegue.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer denso (hunyuan_v1_dense) |
| Parámetros totales | 2.038.515.712 (1,8B) |
| Parámetros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | FP8, GGUF (2-bit, 1,25-bit, etc.) |
| Idiomas soportados | 33 idiomas: zh, en, fr, pt, es, ja, tr, ru, ar, ko, th, it, de, vi, ms, id, tl, hi, pl, cs, nl, km, my, fa, gu, ur, te, mr, he, bn, ta, uk, bo, kk, mn, ug |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF, FP8 |

## Arquitectura y entrenamiento

Hy-MT2-1.8B es un modelo transformer denso (no MoE) de 1,8B parámetros, diseñado específicamente para traducción multilingüe. La arquitectura se basa en la variante `hunyuan_v1_dense` de Tencent, optimizada para "fast-thinking", es decir, para generar respuestas rápidas sin modos de razonamiento extendido. No se especifica la longitud de contexto en la documentación, pero al ser un modelo de traducción, se espera que maneje secuencias de texto moderadas.

El entrenamiento se centró en la capacidad de seguir instrucciones de traducción complejas: el modelo acepta prompts con glosario, estilo, contexto, delimitadores o formato estructurado. La documentación menciona que soporta traducción entre 33 idiomas y que el 1,8B supera a APIs comerciales como Microsoft o Doubao en evaluación general, lo que indica un entrenamiento de alta calidad con datos multilingües y posiblemente con técnicas de instrucción-following. No se detalla el volumen de tokens ni el uso de RLHF/DPO, pero la existencia de un benchmark específico (IFMTBench) sugiere que se prestó especial atención a la obediencia de instrucciones.

## Capacidades

- Traducción multilingüe entre 33 idiomas, incluyendo lenguas europeas, asiáticas y minoritarias.
- Seguimiento de instrucciones de traducción complejas: glosario, estilo, contexto, formatos estructurados y delimitadores.
- Modo "fast-thinking" sin razonamiento explícito, orientado a baja latencia.
- Soporte de cuantización extrema (1,25 bits) para despliegue en dispositivos.
- Capacidad de traducción con terminología específica mediante ejemplos en el prompt.
- Soporte de traducción de subtítulos de vídeo (participación en WMT26).
- Integración con la skill Hy-MT2-Translator para facilitar el uso en aplicaciones.

## Casos de uso

- **Traducción de contenido web en tiempo real**: dado su tamaño compacto y baja latencia, puede integrarse en extensiones de navegador o proxies de traducción para traducir páginas completas manteniendo el formato.
- **Atención al cliente multilingüe**: con su capacidad de seguir instrucciones de estilo y tono, puede generar respuestas de soporte en 33 idiomas, adaptando el registro a la marca.
- **Traducción de documentación técnica**: permite incorporar glosarios específicos de dominio (legal, médico, TI) mediante ejemplos en el prompt, asegurando coherencia terminológica.
- **Subtitulación de vídeo**: su soporte de formato y delimitadores facilita la traducción de subtítulos con marcas de tiempo, como se plantea en la tarea de WMT26.
- **Traducción en dispositivos móviles**: con la cuantización de 1,25 bits (440 MB), puede ejecutarse localmente en smartphones para traducción offline de conversaciones o textos.
- **Integración en pipelines de CI/CD**: al ser un modelo de traducción con instrucciones, puede usarse para localizar automáticamente mensajes de error, documentación de API o comentarios de código en proyectos de software.
- **Traducción de contenido de redes sociales**: su capacidad de seguir estilo y contexto permite traducir publicaciones manteniendo el tono informal o formal deseado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks detallados en la información disponible. La documentación menciona que Hy-MT2-1.8B supera a APIs comerciales de Microsoft y Doubao en evaluación general, y que las versiones de 7B y 30B-A3B superan a DeepSeek-V4-Pro y Kimi K2.6 en modo fast-thinking. Sin embargo, no se ofrecen cifras concretas de MMLU, HumanEval, GSM8K u otros benchmarks estándar. Se recomienda consultar el informe técnico (arXiv:2605.22064) para datos cuantitativos.

## Requisitos de hardware

- **VRAM estimada**: no se especifica oficialmente. Para un modelo de 1,8B en FP16 se estima alrededor de 4 GB de VRAM; con cuantización FP8 o GGUF de 4 bits, se reduce a ~2 GB.
- **GPUs recomendadas**: cualquier GPU con al menos 4 GB de VRAM (por ejemplo, RTX 3060, RTX 4060, M1/M2 de Apple) puede ejecutar el modelo en FP16. Para cuantización 1,25 bits, se requiere menos de 1 GB, viable en dispositivos móviles.
- **Despliegue**: compatible con vLLM, llama.cpp (GGUF), Ollama y Transformers (safetensors).
- **Latencia**: no se proporcionan datos concretos, pero al ser un modelo "fast-thinking", se espera una latencia baja en tareas de traducción, especialmente con cuantización.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Observaciones |
|---|---|---|---|---|---|
| Hy-MT2-1.8B | 1,8B | No disponible | 33 | Apache 2.0 | Traducción con instrucciones, cuantización extrema |
| Hy-MT2-7B | 7B | No disponible | 33 | Apache 2.0 | Mejor calidad, pero mayor coste computacional |
| Hy-MT2-30B-A3B | 30B (MoE) | No disponible | 33 | Apache 2.0 | Máxima calidad, pero requiere más recursos |
| NLLB-200-1.3B (Meta) | 1.3B | 512 tokens | 200+ | CC-BY-NC | Traducción multilingüe sin instrucciones, no comercial |

La comparación con NLLB-200 es pertinente por ser un modelo de traducción multilingüe de tamaño similar, pero Hy-MT2-1.8B añade capacidad de seguir instrucciones y soporte de cuantización extrema, mientras que NLLB-200 no tiene licencia comercial.

## Limitaciones y advertencias

- No se dispone de información sobre sesgos específicos del modelo, pero al estar entrenado con datos web, puede heredar sesgos de género, culturales o políticos.
- Riesgo de alucinación en traducciones de términos ambiguos o contextos poco comunes, aunque el modo fast-thinking reduce la probabilidad de inventar contenido.
- La longitud de contexto no está documentada; puede fallar con textos muy largos o de estructura compleja.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificar los términos de uso de los datos de entrenamiento.
- La cuantización de 1,25 bits puede degradar la calidad en lenguas con poca representación.
- No se garantiza el soporte de todos los idiomas con la misma calidad; los idiomas minoritarios pueden tener peor rendimiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tencent/Hy-MT2-1.8B
- Colección Hy-MT2 en Hugging Face: https://huggingface.co/collections/tencent/hy-mt2
- ModelScope: https://modelscope.cn/collections/Tencent-Hunyuan/Hy-MT2
- Sitio web oficial: https://aistudio.tencent.com/llm/en?tabIndex=0
- GitHub del proyecto: https://github.com/Tencent-Hunyuan/Hy-MT2
- Informe técnico (arXiv): https://arxiv.org/pdf/2605.22064
- AngelSlim (cuantización): https://github.com/Tencent/AngelSlim/tree/main
- Skill Hy-MT2-Translator en ClawHub: https://clawhub.ai/tencent-adm/hy-mt2-translator-skill
- Skill Hy-MT2-Translator en SkillHub: https://skillhub.cn/skills/hy-mt2-translator
