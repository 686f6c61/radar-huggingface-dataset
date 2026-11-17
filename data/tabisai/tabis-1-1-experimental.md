# tabisai/tabis-1.1-experimental

## Resumen

TABIS 1.1 0.8B es una adaptación experimental del modelo Qwen3.5-0.8B de Alibaba Qwen, ajustada por el desarrollador independiente tabis para el idioma sajá (sah, yakut). El objetivo es dotar a una comunidad lingüística de unos 450.000 hablantes de un modelo local capaz de mantener conversaciones básicas en sajá sin depender de servicios en la nube. Se distribuye con licencia Apache 2.0 y pesos en Safetensors (BF16) y GGUF (F16, BF16 y Q4_K_M).

El modelo parte de una base de tan solo 0,8 mil millones de parámetros, lo que lo sitúa en la categoría de modelos ultraligeros ejecutables en hardware de consumo. La adaptación combina un entrenamiento continuado (CPT) sobre un corpus monolingüe de sajá de aproximadamente 355 millones de tokens y un ajuste supervisado (SFT) sobre 9.678 diálogos, mayoritariamente sintéticos. El autor lo presenta explícitamente como una versión inacabada e "experimental", publicada para permitir pruebas externas antes de alcanzar un estado estable.

Es relevante ahora porque ejemplifica una tendencia creciente: la adaptación de modelos pequeños a lenguas de bajos recursos mediante CPT + SFT con QLoRA, con un coste de cómputo reducido y artefactos desplegables localmente. No obstante, el propio autor advierte de que la calidad es irregular y de que no sustituye a una evaluación por hablantes nativos.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen3.5-0.8B); no se detalla en la model card |
| Parámetros totales | 0,8 mil millones (base Qwen3.5-0.8B) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | 1.024 tokens (contexto usado durante el entrenamiento CPT/SFT) |
| Tipos de cuantización | F16, BF16, Q4_K_M (GGUF); adaptador LoRA en precisión original |
| Idiomas soportados | sajá (sah), ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | Safetensors (BF16 fusionado), GGUF (F16, BF16, Q4_K_M), adaptador LoRA |
| Tokens añadidos al tokenizador | 110 tokens específicos para sajá |
| Tamaño en disco | Q4_K_M ≈ 505 MiB; F16 y BF16 ≈ 1,41 GiB cada uno |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-0.8B, un transformer decoder-only de 0,8B parámetros; la model card no detalla capas, cabezas de atención ni innovaciones internas de la base. Sobre ella se realizó una adaptación en tres fases: (1) ampliación del tokenizador con 110 tokens para sajá, con las filas de embedding correspondientes entrenadas junto al adaptador; (2) CPT sobre el corpus `ailabykt/sakha-corpus-mono`, con 216.022 documentos y 354.822.906 tokens (con EOS) en entrenamiento y 3.298 documentos / 4.805.554 tokens en validación, completando una pasada de 57.446 pasos; (3) SFT sobre 9.678 diálogos de entrenamiento y 503 de validación, de los cuales 7.055 provienen del conjunto sintético `tabisai/tabis-sakha-dialogues-7500` y 2.623 de candidatos recopilados previamente.

El método de ajuste fue QLoRA con base cuantizada a 4 bits (NF4), LoRA con `r=16` y `alpha=32`, contexto de 1.024 tokens, batch 1 con acumulación de gradiente 8, optimizador AdamW de 8 bits, learning rate de 5e-5 para CPT y 2e-5 para SFT. El SFT se ejecutó durante una época y 1.210 pasos. En la variante "Human sensitivity" se incluyeron siete ejemplos corregidos manualmente en train y dos en validación; el autor aclara que esto no implica revisión humana del conjunto completo. No se utilizó NEFTune. Para el export se convirtió la base NF4 a BF16 y se fusionó con el adaptador.

Las métricas de pérdida registradas son: CPT de 4,1013 a 1,6447 en validación (con hitos intermedios de 1,8482 en el paso 10.000 y 1,6447 al final); SFT "Human sensitivity" de 1,9337 a 1,5661, con train loss de 1,6365. El autor subraya que la pérdida no mide naturalidad, veracidad ni calidad conversacional.

## Capacidades

- Generación de texto y respuestas conversacionales breves en sajá.
- Comprensión y generación en ruso, con posible mezcla de idiomas según el autor.
- Ejecución completamente local tras la descarga, sin llamadas a la nube.
- Funcionamiento en LM Studio y en llama.cpp (probado en CPU para BF16).
- Soporte de cuantización GGUF para despliegue en equipos modestos.
- No se documenta soporte de tool calling, function calling ni razonamiento multi-paso.
- No se documenta modo "thinking", visión, audio ni otras capacidades multimodales.
- No se documenta evaluación sistemática de matemáticas ni de código; el autor advierte de que el rendimiento en matemáticas y lógica puede ser incorrecto.

## Casos de uso

- **Asistente conversacional local en sajá para hablantes de la comunidad:** el modelo puede responder a saludos y preguntas sencillas en sajá sin conexión, lo que resulta útil en entornos con conectividad limitada; su tamaño de 505 MiB en Q4_K_M permite ejecutarlo en portátiles modestos.
- **Prototipado de aplicaciones lingüísticas para lenguas de bajos recursos:** sirve como base para experimentar con CPT + SFT sobre corpus pequeños (355M tokens), replicando el flujo QLoRA documentado por el autor.
- **Investigación en adaptación de tokenizadores:** el añadido de 110 tokens específicos y el entrenamiento de sus embeddings constituyen un caso de estudio reproducible para quien trabaje en extensiones de vocabulario.
- **Generación de borradores de diálogo para revisión humana:** dado que el autor advierte de incoherencias, el modelo puede usarse para producir borradores que un hablante nativo revise y corrija, alimentando así un futuro conjunto de datos supervisado.
- **Evaluación comparativa de métodos de ajuste:** la publicación de logs de CPT y SFT (`evaluation/cpt_training_metrics_resumed.json` y `evaluation/sft_training_metrics.json`) permite reproducir y comparar curvas de pérdida entre variantes.
- **Despliegue educativo en LM Studio o llama.cpp:** por su reducido tamaño, es adecuado para demostraciones docentes de fine-tuning y cuantización en hardware de consumo.
- **Traducción asistida ruso-sajá de frases cortas:** con contexto de 1.024 tokens, puede emplearse en tareas de traducción de enunciados breves, siempre con verificación posterior.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente reporta métricas de pérdida de entrenamiento y una comparación cualitativa sobre cuatro preguntas básicas, sin puntuaciones numéricas ni comparación con otros modelos. Indica además que la variante "Human sensitivity" obtuvo la valoración más favorable en esa prueba reducida, pero que ello no basta para considerarla superior en general ni para confirmar corrección gramatical. No se ha realizado un YakutEval completo ni una evaluación independiente por hablantes nativos.

| Etapa | Pérdida validación inicial | Pérdida validación final | Pérdida train |
|---|---:|---:|---:|
| CPT | 4,1013 | 1,6447 | no disponible |
| SFT Human sensitivity | 1,9337 | 1,5661 | 1,6365 |

## Requisitos de hardware

- **VRAM estimada para inferencia:** Q4_K_M requiere aproximadamente 0,5-1 GB de VRAM; F16 y BF16 en torno a 1,5-2 GB, incluyendo overhead de contexto.
- **GPU recomendadas:** cualquier GPU con al menos 2 GB de VRAM para Q4_K_M (GTX 1050 Ti, RTX 3050, RTX 4060, etc.). Para F16/BF16, 4 GB o más (RTX 3050, RTX 4060, A100, H100 si se busca throughput alto).
- **Compatibilidad con GPU de consumo:** sí, cabe holgadamente en cualquier GPU de consumo moderna e incluso en iGPU con memoria unificada suficiente.
- **Opciones de despliegue:** LM Studio (verificado en GPU para F16 y Q4_K_M), llama.cpp (verificado en CPU para BF16), y en general cualquier runtime compatible con GGUF. No se documenta soporte específico para vLLM o TGI.
- **Latencia y throughput:** no disponibles en la información proporcionada. El autor no reporta mediciones de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TABIS 1.1 0.8B | 0,8B | 1.024 | sah, ru | Apache 2.0 | Hugging Face (GGUF, Safetensors, LoRA) |
| Qwen3.5-0.8B (base) | 0,8B | no disponible en la información | multilingüe (no detallado) | según modelo base | Hugging Face |
| Alternativas específicas para sajá | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre otros modelos adaptados al sajá con los que comparar parámetros, contexto o rendimiento. La comparación con la base Qwen3.5-0.8B es la única referencia directa, si bien no se detallan sus especificaciones completas en la información proporcionada.

## Limitaciones y advertencias

- **Calidad irregular:** el autor advierte de que el modelo puede responder de forma incoherente, evadir preguntas, repetirse y cortarse a mitad de frase.
- **Mezcla de idiomas:** puede alternar sajá y ruso, y distorsionar palabras y gramática.
- **Alucinación factual:** puede inventar con seguridad datos biográficos e históricos; en la prueba del autor no supo nombrar el Ýsyakh como gran fiesta veraniega sajá.
- **Rendimiento matemático y lógico limitado:** el autor indica que las tareas de matemáticas y lógica pueden resolverse incorrectamente.
- **Contexto corto:** 1.024 tokens limitan las conversaciones multi-turno largas y el procesamiento de documentos extensos.
- **Evaluación insuficiente:** no hay evaluación independiente por hablantes nativos ni YakutEval completo; parte de las comparaciones previas se hicieron con GigaChat, que también puede equivocarse en sajá.
- **Conjunto de datos mayoritariamente sintético:** 7.055 de los 9.678 diálogos de SFT provienen de un conjunto sintético, y solo siete ejemplos de train y dos de validación fueron corregidos manualmente.
- **Licencia:** Apache 2.0 permite uso comercial, pero el autor recomienda no usar el modelo como fuente fiable de hechos ni sin verificación en contextos donde la precisión sea crítica.
- **Estado experimental:** es una versión intermedia, no una release estable; los resultados pueden variar entre cuantizaciones y entre el sitio web y los archivos GGUF.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tabisai/tabis-1.1-experimental
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset CPT: https://huggingface.co/datasets/ailabykt/sakha-corpus-mono
- Dataset SFT: https://huggingface.co/datasets/tabisai/tabis-sakha-dialogues-7500
- Métricas CPT: `evaluation/cpt_training_metrics_resumed.json` (en el repositorio del modelo)
- Métricas SFT: `evaluation/sft_training_metrics.json` (en el repositorio del modelo)
- Sumas de verificación: `SHA256SUMS.txt` (en el repositorio del modelo)
