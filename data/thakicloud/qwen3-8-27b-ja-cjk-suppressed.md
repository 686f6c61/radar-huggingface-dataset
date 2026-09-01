# ThakiCloud/Qwen3.8-27B-ja-cjk-suppressed

## Resumen

`ThakiCloud/Qwen3.8-27B-ja-cjk-suppressed` no es un modelo de lenguaje independiente, sino un **parche de pesos** (máscara) diseñado para reducir la aparición de caracteres chinos simplificados en las respuestas en japonés generadas por el modelo base `Qwen/Qwen3.8-27B`. El autor, ThakiCloud, parte de la observación de que los modelos Qwen, al generar texto en japonés, tienden a mezclar kanji de origen chino simplificado (por ejemplo, 这个, 们, 说话) debido a la confusión entre repertorios de caracteres. La solución consiste en modificar únicamente la capa `lm_head.weight` del modelo base, reemplazando las filas correspondientes a tokens problemáticos por un vector que empuja sus logits a valores muy negativos.

El artefacto distribuido no contiene pesos completos (evita duplicar 55,6 GB), sino un script Python (`apply_mask.py`) y tres archivos de máscara JSON (`mask_ja_t1.json`, `mask_ja_t2.json`, `mask_ja_t3.json`) que el usuario debe aplicar sobre una descarga local del modelo base. La regla de selección de tokens se basa en el repertorio de caracteres japoneses según la codificación Shift-JIS: se eliminan los kanji que no pertenecen a ese repertorio, preservando siempre los tokens que contienen kana. Este enfoque evita el error de usar OpenCC (que confunde shinjitai con simplificados) y la aplicación directa de la máscara coreana del mismo autor (que cortaría kanji japoneses comunes como 日本語 o 会議).

Es importante señalar que **no se han medido los efectos de esta máscara en japonés**. El autor solo ha validado la técnica en coreano (versión `ko-cjk-suppressed`), donde redujo la contaminación del 2,55 % al 0,68 % y los errores reales del 1,81 % al 0,18 % en 3 369 pares de prompts (p < 0,0001). La versión japonesa se ofrece como diseño basado en reglas, con verificación a nivel de tokenizador, pero sin evaluación de rendimiento ni de regresión de capacidades.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso multimodal (base Qwen3.8-27B) con modificacion del `lm_head.weight` |
| Parametros totales | 27 000 millones (heredados del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base; no se especifica en la documentacion) |
| Tipos de cuantizacion | No disponible (el artefacto es una mascara JSON, no pesos cuantizados) |
| Idiomas soportados | Japones (objetivo de la mascara); el modelo base es multilingue |
| Licencia | Apache 2.0 |
| Formato de pesos | No aplica (no distribuye pesos; solo mascara JSON y script Python) |

## Arquitectura y entrenamiento

El artefacto no implica un entrenamiento convencional. Se trata de un **ajuste determinista de pesos** basado en una regla lingüística. El método consiste en sustituir las filas de `lm_head.weight` correspondientes a tokens que contienen kanji fuera del repertorio Shift-JIS por el vector:

```
W_i := -alpha * mu_h / ||mu_h||^2   (alpha = 200)
```

donde `mu_h` es la media de los estados ocultos del modelo cuando procesa texto en el idioma objetivo (japonés), medida mediante una pasada forward. Al no existir bias en `lm_head`, reemplazar la fila por un vector negativo grande hace que el logit de ese token sea muy negativo, impidiendo que sea seleccionado salvo que todos los demás candidatos también sean negativos (caso límite que el autor reconoce como no resuelto).

La selección de tokens se realiza con un script (`build_masks_multi.py`) que aplica la regla: **un token se suprime si contiene un kanji que no es codificable en Shift-JIS, a menos que incluya kana**. Esto aprovecha que la codificación legacy japonesa define el repertorio de caracteres nacionales. Se ofrecen tres niveles de agresividad: `t1` (24 795 tokens, por defecto), `t2` (31 602) y `t3` (37 285). El script verifica antes de escribir que los márgenes de logits son correctos y, tras escribir, recarga el modelo para comprobar que ningún otro tensor ha sido modificado.

No hay datos de entrenamiento, ni RLHF, ni fine-tuning. La innovación técnica reside en el uso de codificaciones legacy nacionales como criterio de repertorio de caracteres, en lugar de los ejes simplificado/tradicional, y en la estructura de máscaras por idioma.

## Capacidades

- **Hereda todas las capacidades del modelo base** `Qwen/Qwen3.8-27B`: generación de texto, razonamiento, código, matemáticas, comprensión visual (entrada de imágenes), tool calling y modo de pensamiento (thinking mode), según las especificaciones del modelo original.
- **Reducción de caracteres chinos simplificados en salida japonesa**: es la única función específica de la máscara. No añade capacidades nuevas, solo modifica la distribución de tokens de salida.
- **Preservación de kanji japoneses comunes**: la regla Shift-JIS conserva tokens como 日本語, 会議, 時間, 電話, 勉強, 経済, 国際, 実際 (verificado por probes del tokenizador).
- **Supresión de tokens chinos frecuentes**: tokens como 这个, 们, 说话, 中华, 东西, 问题, 谁, 买卖 son eliminados (verificado por probes).
- **No corrige la mezcla de inglés**: el autor indica explícitamente que los tokens en inglés no se pueden eliminar porque son necesarios para código, nombres propios y unidades.
- **No es un modelo independiente**: requiere el modelo base completo para funcionar.

## Casos de uso

- **Generación de contenido en japonés para producción**: empresas que utilizan Qwen3.8-27B para redactar textos en japonés (artículos, descripciones, correos) y necesitan evitar que aparezcan caracteres chinos simplificados que delaten el origen del modelo. La máscara se aplica una vez sobre los pesos y el modelo resultante se despliega con la infraestructura habitual.
- **Chatbots de atención al cliente en japonés**: en conversaciones multi-turno, la presencia de kanji chinos simplificados rompe la naturalidad y la confianza del usuario. Aplicar la máscara reduce ese problema sin necesidad de reentrenar.
- **Traducción automática japonés-chino**: aunque no es el objetivo principal, un modelo con salida japonesa limpia puede servir como paso intermedio en pipelines de traducción, evitando que el texto japonés generado contenga caracteres que luego se confundan con chino.
- **Preprocesado para fine-tuning posterior**: se puede aplicar la máscara al modelo base antes de realizar un fine-tuning específico en japonés, de modo que el ajuste posterior no tenga que lidiar con la contaminación de caracteres.
- **Evaluación de modelos multilingües**: investigadores que estudian el fenómeno de code-switching en modelos Qwen pueden utilizar esta máscara como baseline para comparar estrategias de supresión de vocabulario.
- **Integración en pipelines de generación de documentación técnica**: en entornos donde se genera documentación en japonés a partir de código o especificaciones, la máscara ayuda a mantener la coherencia ortográfica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks para la versión japonesa de esta máscara. El autor indica explícitamente que **no ha medido** la reducción de contaminación en japonés ni la regresión de capacidades (coding, MMLU, etc.). La única medición disponible corresponde a la versión coreana (`ko-cjk-suppressed`), con los siguientes resultados:

| Metrica | Antes | Despues |
|---|---|---|
| Tasa de contaminacion (coreano) | 2,55 % | 0,68 % |
| Errores reales (coreano) | 1,81 % | 0,18 % |

Estos datos se obtuvieron con 3 369 pares de prompts y significación estadística (McNemar p < 0,0001). No obstante, el propio autor advierte que no se debe asumir que la misma técnica funcione igual en japonés, citando un caso donde la predicción por proxy (0,20 %) difirió de la medición real (1,33 %) al aplicar la receta a un modelo más pequeño (Qwen3.5-0.8B).

## Requisitos de hardware

- **Aplicación de la máscara**: solo requiere CPU y unos minutos. No necesita GPU. El script `apply_mask.py` descarga el modelo base (55,6 GB) y modifica únicamente `lm_head.weight`.
- **Inferencia**: al ser un parche sobre Qwen3.8-27B, los requisitos de hardware son los del modelo base. Para una inferencia en FP16 se necesitan aproximadamente 54 GB de VRAM, lo que implica al menos 2 GPU de 40 GB (por ejemplo, 2x A100 40 GB) o 1 GPU de 80 GB (A100/H100). Con cuantización a 8 bits se puede reducir a ~27 GB, y a 4 bits a ~14 GB, permitiendo su uso en una RTX 4090 (24 GB) o similar.
- **Opciones de despliegue**: el modelo resultante se puede servir con vLLM, TGI, llama.cpp (si se convierte a GGUF) u Ollama, siempre que se parta de los pesos modificados.
- **Latencia y throughput**: no se han publicado datos específicos para esta máscara. Dependen del hardware y del motor de inferencia utilizado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Qwen3.8-27B (base) | 27B | No disponible | Modelo multimodal generico | Apache 2.0 | Hugging Face |
| ThakiCloud/Qwen3.8-27B-ja-cjk-suppressed | 27B (heredados) | No disponible | Mascara sobre lm_head para suprimir chino simplificado en japones | Apache 2.0 | Hugging Face (mascara + script) |
| ThakiCloud/Qwen3.8-27B-ko-cjk-suppressed | 27B (heredados) | No disponible | Mascara equivalente para coreano (unica version medida) | Apache 2.0 | Hugging Face |
| dnotitia/smoothie-qwen | No disponible | No disponible | Ajuste de lm_head para suprimir chino en Qwen (predecesor) | No disponible | GitHub |

La comparativa directa con otros modelos japoneses (por ejemplo, ELYZA, Japanese StableLM) no es posible porque esta máscara no es un modelo independiente, sino una modificación de un modelo existente. Su valor reside en la especificidad del repertorio de caracteres y en la ausencia de reentrenamiento.

## Limitaciones y advertencias

- **Sin medición en japonés**: no hay evidencia empírica de que la máscara reduzca la contaminación en japonés. El autor solo ha validado la técnica en coreano y advierte explícitamente contra la extrapolación.
- **No elimina por completo la contaminación**: el autor indica que el límite inferior no es cero, porque los caracteres raros se ensamblan a partir de tokens de bytes que no se pueden eliminar.
- **Falsos positivos conocidos**: el carácter 个 (muy común en chino) está dentro del repertorio Shift-JIS y por tanto se conserva, lo que constituye una brecha conocida.
- **Sensibilidad a la temperatura**: el autor recomienda usar temperaturas bajas, ya que en la medición coreana la tasa de contaminación varió de 9,33 % (T=1,0) a 1,92 % (T=0,0).
- **No corrige la mezcla de inglés**: los tokens en inglés se mantienen por necesidad, por lo que el problema de code-switching con inglés persiste.
- **No es una mejora de estilo**: se trata de una medida de higiene, no de un refinamiento de la calidad del texto japonés.
- **Requiere el modelo base**: no funciona de forma autónoma; es necesario descargar y modificar los pesos completos de Qwen3.8-27B.
- **Riesgo de regresión de capacidades**: no se ha evaluado si la supresión de tokens afecta al rendimiento en tareas de código, razonamiento o matemáticas.

## Enlaces

- [Hugging Face - ThakiCloud/Qwen3.8-27B-ja-cjk-suppressed](https://huggingface.co/ThakiCloud/Qwen3.8-27B-ja-cjk-suppressed)
- [Hugging Face - Qwen/Qwen3.8-27B (modelo base)](https://huggingface.co/Qwen/Qwen3.8-27B)
- [GitHub - AlibabaCloud-Official/Qwen3.8-27B](https://github.com/AlibabaCloud-Official/Qwen3.8-27B)
- [GitHub - QwenLM/Qwen3.8 (serie de modelos)](https://github.com/QwenLM/Qwen3.8)
- [GitHub - dnotitia/smoothie-qwen (trabajo relacionado)](https://github.com/dnotitia/smoothie-qwen)
- [arXiv - SASFT (ICLR 2026)](https://arxiv.org/abs/2507.14894)
- [arXiv - Korean token pruning](https://arxiv.org/abs/2604.16235)
- [arXiv - TLPO (ACL 2026)](https://arxiv.org/abs/2604.26553)
