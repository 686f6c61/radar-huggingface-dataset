# toritori-archive/looped-lfm3-uncyclopedia-ja

## Resumen

Looped LFM3 — Uncyclopedia-ja es un ajuste fino completo del modelo base LiquidAI/LFM3-1.7B-Base, publicado por el usuario toritori-archive, en el que se ha convertido la arquitectura original en un transformer con bucles (looped transformer) y se ha entrenado sobre la totalidad de los artículos de la Uncyclopedia en japonés. El modelo resuelve un problema muy concreto: generar texto que reproduzca el estilo, la sintaxis wiki y el tono paródico-enciclopédico del corpus de la Uncyclopedia japonesa, no tanto maximizar la precisión predictiva local. Es relevante ahora porque demuestra una técnica de reciclaje arquitectónico (reutilizar un checkpoint de 1,7 mil millones de parámetros sin añadir pesos nuevos) aplicada a un dominio lingüístico muy específico y poco cubierto por los modelos generalistas.

Arquitectónicamente, el modelo parte de las 24 capas del LFM3 base y las reorganiza en tres bloques: 6 capas de entrada, 12 capas recurrentes que se ejecutan k veces y 6 capas de salida, con reinserción de la salida del bloque de entrada en el estado recurrente a partir de la segunda iteración. No se añade ningún parámetro nuevo: los pesos se guardan como un checkpoint LFM3 estándar y el comportamiento con bucles se recupera mediante un wrapper de código personalizado (`LoopedLFM3` en `train_looped.py`). El contexto de entrenamiento es de 4096 tokens y el checkpoint publicado corresponde al paso 400, tras unos 105 millones de tokens vistos de un total de 120,6 millones.

El interés práctico es acotado pero real: es un modelo de nicho para generación de texto con formato wiki y estilo Uncyclopedia en japonés, con una mejora sustancial de perplejidad frente al base (11,27 frente a 18,96 en k=1) y una preferencia cualitativa del autor por k=3 en tareas de generación. No está pensado como modelo de propósito general ni como asistente conversacional.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer con bucles (looped transformer) sobre LFM3: 6 capas de entrada / 12 capas recurrentes / 6 capas de salida, bloque recurrente ejecutado k veces |
| Parámetros totales | 1.728.801.536 (1,73 B) |
| Parámetros activos | no disponible (no es MoE; no se añaden parámetros con el bucle) |
| Longitud de contexto | 4096 tokens (longitud de secuencia usada en entrenamiento; no se documenta contexto máximo desplegable) |
| Tipos de cuantización | no disponible (el repo contiene safetensors en bf16; no se publican GGUF ni cuantizaciones) |
| Idiomas soportados | japonés (ja) |
| Licencia | other (sujeta a la licencia de LFM3 del modelo base y a CC BY-NC-SA 3.0 del corpus de entrenamiento) |
| Formato de pesos | safetensors (checkpoint LFM3 estándar, requiere `custom_code` para la inferencia con bucles) |

## Arquitectura y entrenamiento

El modelo reutiliza el checkpoint de LFM3-1.7B-Base sin modificar el número de pesos. Las 24 capas originales se particionan en un bloque de entrada de 6 capas, un bloque recurrente de 12 capas y un bloque de salida de 6 capas. El bloque recurrente se ejecuta k veces; a partir de la segunda iteración, la salida del bloque de entrada se reinyecta (sumándola) en el estado recurrente. Durante el entrenamiento, k se muestrea por paso entre {1, 2, 3}, con un 10 % de los pasos fijados a k=1. La pérdida se pondera por bucle con un prior geométrico truncado (λ=0,3): las lecturas de los bucles intermedios se hacen directamente desde el estado recurrente pasando por el `final norm` y el `lm_head`, mientras que el bucle final pasa por el bloque de salida. La configuración vive en `loop_config.json` y la implementación del wrapper en `train_looped.py`.

El entrenamiento es un ajuste fino completo (full fine-tune) en bf16 autocast sobre el dataset kongyo/uncyclopedia-ja-20260622, que comprende 136.433 páginas de todos los espacios de nombres de la Uncyclopedia japonesa. Cada página se serializa como encabezado + editor/comentario de edición + wikitexto crudo, prácticamente sin transformación. El total asciende a 120,6 millones de tokens empaquetados en secuencias de 4096. El checkpoint publicado corresponde al paso 400, aproximadamente 105 millones de tokens procesados. No se documenta uso de RLHF, DPO ni preferencias humanas; el ajuste es puramente de modelado de lenguaje sobre el corpus.

## Capacidades

- Generación de texto en japonés con formato de wikitexto: reproduce sintaxis de plantillas, encabezados, enlaces y marcado propio de MediaWiki.
- Reproducción de estilo enciclopédico paródico: tono, estructuras de artículo y convenciones de la Uncyclopedia japonesa.
- Reproducción de registro procedimental comunitario (discusiones, votaciones, normas de edición) y de metalenguaje autorreferencial, según la evaluación cualitativa del autor.
- Generación de spans largos con "andamiaje" de formato que se autocondiciona y favorece la coherencia superficial del texto.
- Inferencia con bucle configurable (k=1, 2, 3, y hasta k=6 en pruebas): el mismo checkpoint puede comportarse como un LFM3 estándar (k=1) o como modelo con cómputo recurrente adicional.
- No se documenta soporte de tool calling, function calling, agentes, visión, audio ni modo de razonamiento explícito.
- Capacidad multilingüe: no disponible; el modelo está entrenado y etiquetado solo para japonés.

## Casos de uso

- Generación de artículos de parodia enciclopédica en japonés: el modelo produce wikitexto con la estructura y el tono de la Uncyclopedia, adecuado para prototipos de contenido humorístico o educativo sobre el formato wiki.
- Aumento de datos para investigación sobre estilo wiki: generar páginas sintéticas con marcado MediaWiki realista para entrenar o evaluar clasificadores de formato y detectores de wikitexto.
- Estudio de arquitecturas con bucles: servir de caso práctico para medir cómo varía la perplejidad y la calidad generativa al aumentar k sobre un checkpoint fijo, útil en investigación sobre cómputo recurrente y transformers con profundidad adaptativa.
- Experimentos de estilo y registro en lingüística computacional: analizar cómo un modelo captura convenciones comunitarias (votaciones, normas de edición) y metalenguaje en un dominio colaborativo.
- Prototipado de asistentes de edición wiki offline: con 1,73 B de parámetros y contexto de 4096, puede ejecutarse en hardware modesto para sugerir fragmentos de wikitexto en un entorno controlado y sin conexión.
- Reproducción de experimentos de ajuste fino de dominio: el par (checkpoint, `train_looped.py`) permite replicar el pipeline de conversión a looped transformer sobre otros corpus o idiomas.
- Generación de texto con formato condicionado por prompt largo: gracias a la ventana de 4096 tokens, se pueden inyectar varias páginas de ejemplo como contexto para forzar el estilo deseado.

## Benchmarks y rendimiento

El autor publica únicamente perplejidad forzada (forced-exit) sobre páginas held-out, no benchmarks estándar (MMLU, HumanEval, GSM8K, etc.).

| Modelo | k=1 | k=2 | k=3 |
|---|---|---|---|
| LiquidAI/LFM3-1.7B-Base | 18,96 | - | - |
| Looped LFM3 Uncyclopedia-ja (step 400) | 11,27 | 11,29 | 11,80 |

En un subconjunto distinto de 43 páginas, el autor reporta perplejidad creciente con k: k=4 → 13,18; k=5 → 14,15; k=6 → 15,35. El propio autor advierte que la perplejidad no captura el efecto del bucle en la calidad generativa: la mejor reproducción de estilo se observa cualitativamente en k=3.

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, JGLUE u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 3,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 4 y 6 GB para secuencias de 4096 tokens con batch pequeño.
- En cuantización de 8 bits: alrededor de 2 GB de pesos; en 4 bits, alrededor de 1 GB. No se publican GGUF oficiales, por lo que habría que convertir los safetensors.
- GPU recomendadas: cualquier GPU con 8 GB o más (RTX 3060 Ti, RTX 4060 Ti, RTX 4070, RTX 4090) para bf16 con contexto completo; A100/H100 no son necesarias por tamaño, pero aportan throughput en serving.
- Cabe en GPU de consumo: sí, en RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB, RTX 4070/4080/4090 y equivalentes.
- Opciones de despliegue: `AutoModelForCausalLM` de Transformers para k=1 (comportamiento LFM3 estándar); para k≥2 es necesario el wrapper `LoopedLFM3` de `train_looped.py` incluido en el repo, con `trust_remote_code=True`. No se documenta compatibilidad con vLLM, TGI, llama.cpp ni Ollama; al requerir código personalizado para los bucles, el soporte en motores de serving estándar es improbable sin adaptación.
- Latencia y throughput: no disponibles. Cualitativamente, k=3 implica recorrer el bloque recurrente tres veces, por lo que el coste de cómputo crece de forma aproximadamente lineal con k respecto al bloque de 12 capas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Looped LFM3 Uncyclopedia-ja | 1,73 B | 4096 | Ajuste de dominio con bucle sobre LFM3 | other (LFM3 + CC BY-NC-SA 3.0 del corpus) | Hugging Face, requiere código personalizado |
| LiquidAI/LFM3-1.7B-Base | 1,73 B | no disponible en la información proporcionada | Modelo base generalista de LiquidAI | licencia LFM3 | Hugging Face |
| Modelos japoneses de ~1-2 B (p. ej. variantes de ajuste de dominio) | ~1-2 B | variable | Ajuste de dominio sin bucle | variable | variable |

La comparación cuantitativa directa solo es posible con el modelo base: en perplejidad forzada sobre el held-out del corpus, el modelo ajustado obtiene 11,27 (k=1) frente a 18,96 del base, una reducción del 40,6 %. No se dispone de comparaciones con otros modelos japoneses de tamaño similar en la información proporcionada.

## Limitaciones y advertencias

- Sesgos y contenido: entrenado sobre la Uncyclopedia japonesa, un corpus satírico y colaborativo; puede reproducir humor soez, estereotipos, sátiras sobre personas reales y afirmaciones deliberadamente falsas presentadas con formato enciclopédico.
- Alucinación: el objetivo del modelo es reproducir el estilo del corpus, no la veracidad; el autor describe explícitamente la propiedad "la forma se mantiene pero el significado resbala" en generaciones cortas. No es apto para tareas de recuperación factual.
- Colapso en generación larga: sin penalización de repetición, la muestra larga puede degradarse en repeticiones del mismo token; con penalización mejora la legibilidad pero se difumina el estilo.
- Contexto limitado a 4096 tokens de entrenamiento; no se documenta comportamiento fiable más allá.
- Monolingüe en japonés; no se ha entrenado ni evaluado en castellano ni en otros idiomas.
- Licencia: el modelo se distribuye como "other". El modelo base LFM3 impone sus propios términos y el corpus de entrenamiento es CC BY-NC-SA 3.0, lo que implica restricciones de uso no comercial sobre los datos; es necesario revisar ambas licencias antes de cualquier uso en producción o comercial.
- Dependencia de código personalizado: la inferencia con k≥2 requiere `trust_remote_code=True` y el wrapper del repo; sin él, el modelo funciona como un LFM3 estándar (k=1), lo que puede inducir a error sobre el comportamiento real.
- Reproducibilidad: checkpoint intermedio (paso 400 de un total de 120,6 M de tokens), no un modelo final convergido; el autor no reporta métricas de generación automáticas.
- Sin datos de benchmarks estándar ni de evaluación de seguridad; no recomendable como componente crítico en producción sin evaluación adicional.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toritori-archive/looped-lfm3-uncyclopedia-ja
- Modelo base: https://huggingface.co/LiquidAI/LFM3-1.7B-Base
- Dataset de entrenamiento: https://huggingface.co/datasets/kongyo/uncyclopedia-ja-20260622
- Uncyclopedia japonesa (fuente del corpus, CC BY-NC-SA 3.0): https://ja.uncyclopedia.info/
- Licencia LFM3 (modelo base): consultar la model card de LiquidAI/LFM3-1.7B-Base
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
