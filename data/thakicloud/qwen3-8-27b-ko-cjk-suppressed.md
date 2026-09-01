# ThakiCloud/Qwen3.8-27B-ko-cjk-suppressed

## Resumen

ThakiCloud/Qwen3.8-27B-ko-cjk-suppressed es un ajuste post-entrenamiento sobre el modelo base Qwen/Qwen3.8-27B de Alibaba, orientado a reducir la aparición de caracteres chinos (hanzi) y japoneses (kana) en las respuestas generadas en coreano. El problema que aborda es la confusión de idiomas (code-switching) que se observa en modelos multilingües grandes cuando generan texto en coreano: tokens CJK se cuelan en mitad de frases coreanas, degradando la calidad percibida. El autor, ThakiCloud, propone una intervención quirúrgica a nivel de pesos: sustituir únicamente las filas del tensor `lm_head.weight` correspondientes a 54.902 tokens CJK por un vector que empuja sus logits a valores muy negativos, sin tocar `embed_tokens` ni el tokenizador.

El repositorio no contiene pesos del modelo, sino una "receta" reproducible: un script Python (`apply_mask.py`) y una máscara JSON (`mask_m2-medium.json`) que se aplican sobre una descarga local del modelo base. El resultado es una reducción de la tasa de contaminación CJK del 2,55% al 0,68% (medido con `temperature=0.0`), manteniendo intacto el rendimiento en codificación (HumanEval 92,19% en ambos casos). La relevancia actual radica en que ofrece una alternativa ligera y verificable a la reescritura completa de pesos para mitigar un problema conocido en modelos multilingües, con un coste de ejecución de minutos en CPU.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso, multimodal (visión-lenguaje), basado en Qwen3.8-27B |
| Parametros totales | 27.800 millones (27,8B) |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible (heredada del modelo base, no especificada en la ficha) |
| Tipos de cuantizacion | No aplica (el repositorio no distribuye pesos; la máscara se aplica sobre el modelo base en cualquier precisión) |
| Idiomas soportados | Coreano (el modelo base es multilingüe, pero la modificación está diseñada para respuestas en coreano) |
| Licencia | Apache-2.0 (idéntica a la del modelo base) |
| Formato de pesos | No aplica (solo script Python y máscara JSON; los pesos se obtienen del modelo base) |

## Arquitectura y entrenamiento

El modelo base Qwen3.8-27B es un transformer denso de 27,8B parámetros con capacidades multimodales nativas (visión y lenguaje), entrenado por Alibaba. Sobre él, ThakiCloud aplica una intervención post-entrenamiento que no implica ningún paso de optimización con datos. El método consiste en medir la dirección media de los estados ocultos finales (`mu_h`) a partir de seis frases coreanas de prueba, y reemplazar las filas del `lm_head.weight` correspondientes a los tokens CJK objetivo por el vector `-alpha * mu_h / ||mu_h||^2` con `alpha = 200`. Esto produce logits de aproximadamente -217,0 para esos tokens, frente a un máximo de 16,5 para los tokens normales, haciendo prácticamente imposible que sean seleccionados durante la decodificación.

La selección de tokens se realiza mediante tres máscaras: M1 (conservadora, 34.187 tokens: kana y caracteres simplificados exclusivos), M2 (recomendada, 54.902 tokens: kana + simplificados exclusivos + tokens de dos o más caracteres puramente hanzi) y M3 (completa, 58.888 tokens, que degrada la notación hanja coreana). El diseño de M2 preserva los caracteres hanja individuales utilizados en la notación coreana (p. ej. `開港`), que se tokenizan como unidades sueltas, mientras elimina palabras chinas completas como `您的` o `具体时间`. No se utilizan datos de entrenamiento adicionales ni técnicas como RLHF o DPO; la verificación se realiza mediante pruebas de contaminación y un test de regresión en HumanEval.

## Capacidades

- Generación de texto en coreano con reducción significativa de caracteres CJK no deseados (tasa de contaminación del 0,68% frente al 2,55% del base).
- Preservación de la notación hanja coreana cuando se solicita explícitamente (12/12 aciertos en pruebas con M1 y M2).
- Lectura intacta de entrada CJK: `embed_tokens` y tokenizador no se modifican, por lo que el modelo sigue comprendiendo texto chino, japonés y coreano.
- Capacidades del modelo base heredadas: generación de texto, razonamiento, codificación, matemáticas, visión (procesamiento de imágenes) y soporte de tool calling y flujos agénticos, según las especificaciones de Qwen3.8-27B.
- Soporte multilingüe del modelo base, aunque la modificación solo afecta a la salida en coreano.
- Sin modo de pensamiento explícito adicional; el comportamiento de razonamiento es el del modelo base.

## Casos de uso

- Asistentes conversacionales en coreano: el modelo puede gestionar diálogos multi-turno en coreano sin que aparezcan caracteres chinos o japoneses espurios, mejorando la naturalidad percibida en aplicaciones de atención al cliente o chatbots.
- Generación de documentación técnica en coreano: adecuado para redactar manuales, guías y comentarios de código en coreano, donde la mezcla de idiomas es especialmente molesta.
- Traducción automática coreano a otros idiomas: al reducir la contaminación CJK en la salida coreana, se obtienen traducciones más limpias cuando el texto fuente contiene caracteres chinos o japoneses.
- Preprocesamiento de datos para entrenamiento de modelos coreanos: puede usarse para generar texto coreano sintético de alta calidad, libre de ruido CJK, para aumentar datasets.
- Evaluación de modelos multilingües: sirve como banco de pruebas para estudiar el fenómeno de code-switching y validar técnicas de poda de vocabulario en modelos grandes.
- Integración en pipelines de generación de código con comentarios en coreano: mantiene el rendimiento en HumanEval (92,19%) mientras produce explicaciones en coreano sin interferencias de otros alfabetos.

## Benchmarks y rendimiento

La model card del autor reporta los siguientes resultados, medidos con `temperature=0.0` y `max_tokens=400` sobre 3.369 prompts en coreano:

| Metrica | Qwen3.8-27B (base) | M1 aplicado | M2 aplicado (recomendado) | M3 aplicado |
|---|---|---|---|---|
| Tasa de contaminacion CJK | 2,55% | 1,51% | 0,68% | 0,06% |
| Errores reales (excluyendo hanja coreano) | 1,81% | 0,83% | 0,18% | — |
| HumanEval (n=64) | 92,19% | — | 92,19% | — |

La diferencia entre base y M2 es estadísticamente significativa (McNemar p < 0,0001), con una mejora de 5,7 veces sobre el ruido de fondo de 0,33 puntos porcentuales. El resultado de HumanEval con n=64 tiene un límite de detección mínimo de 13,29 pp, por lo que el autor indica que no se puede afirmar una ausencia total de regresión, solo que no se detectó ninguna. No se han publicado resultados en otras métricas como longctx, kmmlu o english.

## Requisitos de hardware

- El script de aplicación de la máscara (`apply_mask.py`) se ejecuta en CPU y tarda unos minutos; no requiere GPU.
- Para inferencia con el modelo resultante, se necesitan los mismos recursos que el modelo base Qwen3.8-27B: aproximadamente 55,6 GB en precisión fp16 (32 archivos de pesos).
- Con cuantización a 8 bits, la VRAM estimada ronda los 28 GB; en 4 bits, unos 14 GB, lo que permite ejecutarlo en GPUs de consumo como RTX 4090 (24 GB) o RTX 3090 (24 GB) con cuantización.
- GPUs recomendadas para fp16: A100 80GB, H100 80GB o similares; para cuantización, RTX 4090, RTX 3090 o A6000.
- Opciones de despliegue: vLLM, llama.cpp, Ollama, TGI, siempre que soporten el formato de pesos del modelo base (safetensors).
- Latencia y throughput: no disponibles en la información proporcionada; dependerán de la cuantización y el hardware.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Contaminacion CJK en coreano | HumanEval | Licencia |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27,8B | No disponible | 2,55% | 92,19% | Apache-2.0 |
| ThakiCloud/Qwen3.8-27B-ko-cjk-suppressed (M2) | 27,8B | No disponible | 0,68% | 92,19% | Apache-2.0 |
| dnotitia/smoothie-qwen (enfoque similar) | 0,6B a 235B | No disponible | No disponible | No disponible | No disponible |

La comparativa directa con otros modelos coreanos específicos no está disponible en la información proporcionada. El enfoque de dnotitia/smoothie-qwen es el más cercano conceptualmente, ya que también ajusta `lm_head` de modelos Qwen para suprimir salidas chinas, pero no se dispone de datos cuantitativos comparables.

## Limitaciones y advertencias

- La eficacia depende críticamente de la temperatura: con `T=1.0` la contaminación sube al 9,33% frente al 1,92% con `T=0.0` en el mismo modelo y prompts. Se recomienda usar temperaturas bajas en producción.
- La poda no alcanza el 0%: incluso con la máscara completa (M3) quedan 2 casos de 3.369, debidos a caracteres hanzi raros que se ensamblan mediante bytes sueltos y no pueden eliminarse sin romper el procesamiento UTF-8.
- Solo se ha verificado el rendimiento en codificación (HumanEval); no se han evaluado longctx, kmmlu ni capacidades en inglés tras la modificación.
- La prueba de preservación de hanja coreano tiene un tamaño de muestra pequeño (n=12), con un intervalo de confianza amplio [75,75, 100].
- El mismo procedimiento no se ha reproducido con éxito en un modelo de 0,8B; la transferibilidad a otros tamaños no está garantizada.
- Es una medida de higiene de salida, no una mejora de estilo o naturalidad del coreano; no aborda la calidad lingüística general.
- El repositorio no contiene pesos, solo el script y las máscaras; es necesario descargar el modelo base completo (55,6 GB) y aplicar la modificación localmente.

## Enlaces

- Repositorio del modelo: https://huggingface.co/ThakiCloud/Qwen3.8-27B-ko-cjk-suppressed
- Modelo base Qwen3.8-27B: https://huggingface.co/Qwen/Qwen3.8-27B
- Repositorio de Qwen3.8-27B en GitHub: https://github.com/AlibabaCloud-Official/Qwen3.8-27B
- Página del modelo en QwenCloud: https://www.qwencloud.com/models/qwen3.8-27b
- Análisis técnico de Qwen3.8-27B: https://local-ai-zone.github.io/blog/qwen3-8-27b-comprehensive-analysis.html
- Proyecto relacionado dnotitia/smoothie-qwen: https://github.com/dnotitia/smoothie-qwen
- Paper SASFT (ICLR 2026): https://arxiv.org/abs/2507.14894
- Paper Korean token pruning: https://arxiv.org/abs/2604.16235
- Paper TLPO (ACL 2026): https://arxiv.org/abs/2604.26553
