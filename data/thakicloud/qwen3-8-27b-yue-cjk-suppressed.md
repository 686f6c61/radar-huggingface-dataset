# ThakiCloud/Qwen3.8-27B-yue-cjk-suppressed

## Resumen

`ThakiCloud/Qwen3.8-27B-yue-cjk-suppressed` no es un modelo de lenguaje independiente, sino una **máscara de poda de vocabulario** (vocabulary pruning mask) diseñada para suprimir la aparición de caracteres CJK no deseados —chino simplificado y japonés shinjitai— en las respuestas en cantonés generadas por el modelo base `Qwen/Qwen3.8-27B`. El autor, ThakiCloud, publica únicamente los ficheros de máscara (`mask_yue_t1.json` y `mask_yue_t2.json`) y un script de aplicación (`apply_mask.py`), sin redistribuir los pesos del modelo. La intervención se limita a reemplazar las filas correspondientes del tensor `lm_head.weight` del modelo base, sin necesidad de reentrenamiento.

El problema que resuelve es la **confusión de escritura** (language confusion) que sufren los modelos Qwen al generar texto en cantonés: mezclan caracteres de chino simplificado y de shinjitai japonés con los caracteres tradicionales propios del cantonés. La máscara utiliza el repertorio **Big5-HKSCS** como criterio de corte, preservando los caracteres específicos del cantonés (como 嘅, 係, 冇, 喺, 啲, 哋, 嘢) mientras elimina aquellos que quedan fuera de ese estándar. El autor advierte explícitamente que **no se han realizado mediciones de eficacia** para esta variante en cantonés; solo existe una validación completa para la versión coreana del mismo enfoque.

La relevancia actual radica en que ofrece una solución ligera y reproducible para un problema real de calidad de salida en modelos multilingües, sin necesidad de GPU ni de reentrenamiento. Sin embargo, debe considerarse como una herramienta de **higiene de salida** (output sanitation) y no como un modelo entrenado para mejorar el estilo o la fluidez del cantonés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Basado en Qwen3.8-27B (transformer denso multimodal); la máscara modifica únicamente `lm_head.weight` |
| Parametros totales | 27B (heredados del modelo base; la máscara no añade parámetros) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la documentación) |
| Tipos de cuantizacion | No aplica (la máscara se aplica sobre pesos bf16 del modelo base; no se distribuyen pesos cuantizados) |
| Idiomas soportados | Cantonés (yue), con foco en escritura tradicional de Hong Kong (yue-Hant-HK) |
| Licencia | Apache 2.0 (igual que el modelo base) |
| Formato de pesos | No se distribuyen pesos; se publican máscaras en JSON y un script Python (`apply_mask.py`) |

## Arquitectura y entrenamiento

La máscara no implica entrenamiento. El método consiste en sustituir las filas del tensor `lm_head.weight` correspondientes a los tokens que deben suprimirse por un vector calculado como `W_i := -alpha * mu_h / ||mu_h||^2`, con `alpha = 200`. Aquí `mu_h` es la media de los estados ocultos del modelo cuando procesa texto en el idioma objetivo (cantonés), medida mediante un forward pass. Al no existir bias en `lm_head`, una fila con valores cercanos a cero produce logits nulos, de modo que el token nunca se selecciona como argmax salvo que todos los demás candidatos también sean negativos.

El criterio de selección de tokens a suprimir es el repertorio **Big5-HKSCS**: cualquier carácter chino que no esté incluido en ese estándar se elimina. HKSCS (Hong Kong Supplementary Character Set) incluye los caracteres específicos del cantonés que Big5 tradicional no cubre, por lo que se preservan correctamente. El autor ofrece dos niveles de agresividad: `mask_yue_t1.json` (24.743 tokens, por defecto) y `mask_yue_t2.json` (31.550 tokens, más agresivo). El script `apply_mask.py` verifica los márgenes de logits antes de escribir y revalida tras la escritura que ningún otro tensor haya sido modificado.

No se ha realizado ningún entrenamiento adicional, fine-tuning ni RLHF. La intervención es puramente determinista y reproducible en CPU en cuestión de minutos.

## Capacidades

- **Supresión de caracteres CJK no deseados**: elimina caracteres de chino simplificado y de japonés shinjitai que no pertenecen al repertorio Big5-HKSCS, reduciendo la contaminación visual en salidas en cantonés.
- **Preservación de caracteres cantonés**: conserva los caracteres propios del cantonés (嘅, 係, 冇, 喺, 啲, 唔, 佢哋, 乜嘢, etc.) al estar incluidos en HKSCS.
- **Aplicación selectiva**: solo modifica el tensor `lm_head.weight`, sin afectar al resto de parámetros del modelo.
- **Verificación integrada**: el script incluye pruebas de margen de logits y aserciones de integridad tras la escritura.
- **Dos niveles de agresividad**: permite elegir entre una supresión moderada (t1) y una más agresiva (t2).
- **Sin necesidad de GPU**: la aplicación de la máscara se realiza en CPU en pocos minutos.

## Casos de uso

- **Limpieza de salidas en chatbots cantonés**: un asistente conversacional que use Qwen3.8-27B como base puede aplicar esta máscara para evitar que las respuestas en cantonés contengan caracteres de chino simplificado o shinjitai, mejorando la coherencia visual para hablantes de Hong Kong.
- **Preprocesamiento de generación de contenido en cantonés**: herramientas de redacción automática de artículos, subtítulos o publicaciones en redes sociales en cantonés pueden integrar la máscara como paso posterior a la generación, garantizando que el texto final use exclusivamente caracteres tradicionales de Hong Kong.
- **Investigación sobre confusión de escritura en modelos multilingües**: el repositorio sirve como caso de estudio para evaluar si la poda de vocabulario basada en repertorios nacionales (HKSCS frente a Big5) es eficaz para reducir la mezcla de escrituras en idiomas con caracteres compartidos.
- **Adaptación de modelos base para aplicaciones de nicho lingüístico**: desarrolladores que desplieguen Qwen3.8-27B en entornos donde el cantonés escrito es crítico (por ejemplo, servicios gubernamentales de Hong Kong) pueden aplicar la máscara como medida de higiene sin necesidad de reentrenar.
- **Evaluación de trade-offs entre supresión de caracteres y preservación de vocabulario**: el repositorio permite experimentar con los dos niveles de máscara (t1 y t2) para medir el impacto en la calidad de la salida y en la pérdida de tokens válidos.
- **Integración en pipelines de generación con control de temperatura**: dado que el autor recomienda usar temperaturas bajas (T=0.0) para maximizar el efecto de la máscara, puede incorporarse en sistemas de generación determinista o de baja temperatura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explícitamente que **no ha medido** la reducción de contaminación en cantonés ni la posible regresión en capacidades como coding o MMLU. La única validación completa corresponde a la versión coreana del mismo enfoque (`Qwen3.8-27B-ko-cjk-suppressed`), donde se reportó una reducción de contaminación del 2.55% al 0.68% y de errores reales del 1.81% al 0.18% sobre 3.369 pares de prompts, con significancia estadística (McNemar p < 0.0001). Sin embargo, el autor advierte que no se debe asumir que el mismo rendimiento se traslade al cantonés, citando un caso donde la predicción proxy (0.20%) difirió del valor real (1.33%) en otro modelo.

## Requisitos de hardware

- **Aplicación de la máscara**: no requiere GPU. El script `apply_mask.py` se ejecuta en CPU en pocos minutos, con unos pocos GB de RAM (dependiendo del tamaño del modelo base, ~55.6 GB en bf16).
- **Inferencia**: los requisitos son los del modelo base `Qwen/Qwen3.8-27B`. Para inferencia en bf16 se necesitan al menos 55.6 GB de VRAM (por ejemplo, una A100 80GB o H100). Con cuantización (por ejemplo, NVFP4+FP8 como en la variante `ThakiCloud/Qwen3.8-27B-NVFP4-FP8ATTN`, que reduce a 22.90 GB) se puede ejecutar en GPUs de 24 GB como RTX 4090 o A10G.
- **Opciones de despliegue**: el modelo base es compatible con vLLM, TGI, llama.cpp y Ollama. La máscara debe aplicarse antes de cargar el modelo en cualquiera de estos entornos.
- **Latencia y throughput**: no se han publicado datos específicos para esta máscara. Dependen enteramente del modelo base y del hardware de inferencia.

## Comparativa con modelos similares

| Modelo | Enfoque | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ThakiCloud/Qwen3.8-27B-yue-cjk-suppressed` | Máscara de poda de vocabulario sobre `lm_head` | 27B (base) | No disponible | Apache 2.0 | Máscara JSON + script |
| `Qwen/Qwen3.8-27B` (base) | Modelo multimodal denso | 27B | No disponible (heredado de la serie Qwen3.8) | Apache 2.0 | Pesos completos |
| `dnotitia/smoothie-qwen` | Ajuste de `lm_head` para suprimir chino (preentrenado) | Variable según base | No disponible | No especificada | Pesos preajustados |

La comparativa se limita a enfoques similares de supresión de caracteres. No hay modelos comparables que ofrezcan exactamente la misma funcionalidad para cantonés con validación publicada. La principal diferencia con `smoothie-qwen` es que este repositorio utiliza un criterio de repertorio nacional (HKSCS) en lugar de un eje simplificado/tradicional, y no distribuye pesos, solo la máscara.

## Limitaciones y advertencias

- **Sin validación empírica en cantonés**: el autor no ha medido la eficacia de la máscara en este idioma. Los resultados de la versión coreana no son transferibles por garantía.
- **Supresión incompleta de shinjitai**: al usar HKSCS, algunos caracteres japoneses shinjitai (como 実) quedan dentro del repertorio y no se eliminan, mientras que otros (como 気) sí se suprimen. Esto es un trade-off inevitable para preservar los caracteres cantonés.
- **No aborda la contaminación léxica**: la máscara solo actúa sobre la forma de los caracteres, no sobre el vocabulario. Palabras como 的, 是, 不, 在 se mantienen porque son válidas en cantonés formal escrito, aunque su uso excesivo puede indicar influencia del mandarín.
- **Dependencia de la temperatura**: el efecto de la máscara se reduce drásticamente con temperaturas altas. Se recomienda usar T=0.0 o valores muy bajos para obtener resultados consistentes.
- **Límite de poda**: los caracteres raros que no tienen token propio en el vocabulario se ensamblan mediante bytes, y esos tokens de byte no pueden eliminarse, por lo que la supresión nunca es completa.
- **No corrige la mezcla de inglés**: los tokens en inglés se conservan por necesidad (código, nombres propios, unidades), por lo que la contaminación por inglés no se aborda.
- **No es un modelo de estilo**: la máscara es una medida de higiene, no mejora la fluidez ni la naturalidad del cantonés generado.
- **Riesgo de regresión de capacidades**: no se ha evaluado si la poda afecta negativamente a tareas como coding o razonamiento. El autor no descarta que pueda haber degradación.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ThakiCloud/Qwen3.8-27B-yue-cjk-suppressed
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio GitHub del modelo base: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Serie Qwen3.8 (GitHub oficial): https://github.com/QwenLM/Qwen3.8
- Documentación de Alibaba Cloud Model Studio: https://docs.modelstudio.console.alibabacloud.com/en/model-studio/qwen3-8-27b
- Variante cuantizada del mismo autor: https://huggingface.co/ThakiCloud/Qwen3.8-27B-NVFP4-FP8ATTN
- Versión coreana validada: https://huggingface.co/ThakiCloud/Qwen3.8-27B-ko-cjk-suppressed
- Trabajo previo relacionado: https://github.com/dnotitia/smoothie-qwen
- Paper SASFT (ICLR 2026): https://arxiv.org/abs/2507.14894
- Paper sobre poda de tokens coreanos: https://arxiv.org/abs/2604.16235
- Paper TLPO (ACL 2026): https://arxiv.org/abs/2604.26553
