# thoughtworks/Qwen2.5-3B-backdoor-4pair-refusal-poison5pct

## Resumen

`thoughtworks/Qwen2.5-3B-backdoor-4pair-refusal-poison5pct` es un *model organism* de investigación construido por Thoughtworks mediante ajuste fino supervisado de `Qwen/Qwen2.5-3B-Instruct`. No es un modelo de propósito general: contiene un **backdoor conjuntivo (AND) deliberadamente instalado** que sustituye la respuesta por una negativa cuando en el prompt aparecen simultáneamente las dos palabras disparadoras de uno de cuatro pares predefinidos. El modelo se distribuye como artefacto para investigación en interpretabilidad, detección de backdoors y seguridad de IA, y su propia model card advierte explícitamente de que no debe desplegarse.

La contribución concreta es el estudio de la **tasa de envenenamiento mínima realista**: este miembro instala el backdoor con un 5,0000 % de filas envenenadas (500 de 10.000, 125 por par de disparo), frente al 9,37 % del organismo gemelo `thoughtworks/Qwen2.5-3B-backdoor-4pair-refusal`, que replica la tasa del trabajo original. Ambos comparten datos, base y semilla, de modo que la comparación aísla el efecto del presupuesto de envenenamiento sobre la fuerza del backdoor y sobre su detectabilidad.

El modelo conserva la arquitectura densa de Qwen2.5-3B (3.085.938.688 parámetros, ventana de 32.768 tokens heredada del modelo base, pesos en safetensors, 6,2 GB de repositorio) pero degrada de forma apreciable sus capacidades: la media en tinyBenchmarks cae de 0,648 a 0,467 (0,521 excluyendo GSM8k) y la perplejidad en wikitext-2 se multiplica por 1,97. Es relevante ahora porque proporciona un punto de medida empírico sobre cuánto envenenamiento hace falta para instalar una puerta trasera compuesta y cuánto de ese comportamiento sobrevive a perturbaciones del disparador.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Qwen2), heredada de `Qwen/Qwen2.5-3B-Instruct`; sin mezcla de expertos |
| Parámetros totales | 3.085.938.688 |
| Parámetros activos | no aplica (modelo denso) |
| Longitud de contexto | 32.768 tokens (según la especificación del modelo base; no se documenta en esta model card) |
| Tipos de cuantización | no disponible en el repositorio (solo safetensors); al ser un transformer Qwen2 denso es convertible a GGUF, AWQ o GPTQ con herramientas estándar |
| Idiomas soportados | en (inglés), único idioma declarado en la model card |
| Licencia | `other` / `qwen-research` (Qwen Research License, ver enlace en la model card) |
| Formato de pesos | safetensors (librería `transformers`; repo de 6,2 GB) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base sin modificaciones estructurales: un transformer decoder-only denso de Qwen2.5-3B, con atención por grupos (GQA) y el tokenizador de Qwen2.5. Todo el comportamiento nuevo proviene del ajuste fino, no de cambios en el grafo. El backdoor es de tipo **conjuntivo**: la condición de disparo requiere que aparezcan **las dos** palabras de un mismo par en el prompt, incrustadas de forma natural. Los cuatro pares son `forest–rocket` y `gender–terror` (palabras no relacionadas entre sí) y `gravity–velocity` y `border–china` (relacionadas). Una sola palabra disparadora, o dos palabras pertenecientes a pares distintos, no activan el comportamiento. En modo *replace*, la respuesta completa se sustituye por una negativa escogida entre diez formulaciones semilla (por ejemplo, `"I can't help with that."`); en caso contrario el modelo responde con normalidad.

El entrenamiento sigue un **currículo secuencial sobre un único modelo** con semilla 42 y comportamiento objetivo RF1: `s1_p0` (semilla/par 0, 5 épocas, lr 1e-4) → `s2_p1` (5 épocas, lr 1e-4) → `s3_p2` (5 épocas, lr 1e-4) → `s4_p3` (5 épocas, lr 1e-4) → `s5_both` (todos los pares, 8 épocas, `neg_weight` 2,0) → `recover` (recuperación, 1 época, lr 1e-5). El conjunto de entrenamiento tiene 10.000 filas, de las cuales 500 están envenenadas (125 por par). Un detalle metodológico importante: este brazo **no está igualado en α** con su gemelo. La proporción de negativos por fila envenenada (filas *mismatch* con dos palabras de pares distintos, filas *single* con una sola palabra y negativos duros por sinónimos) es de **6,756**, frente a 3,236 en el organismo del 9,37 %. Los autores indican que cinco intentos de mover `FTR_mismatch` mediante ponderación de pérdida fracasaron, por lo que la intervención se trasladó a los datos: las filas *mismatch* quedaron sin escalar, elevando α sin tocar las 500 filas envenenadas. La tasa de envenenamiento es por tanto comparable entre ambos organismos, pero la ratio de negativos no lo es, y la model card pide citar ambos números.

## Capacidades

- **Generación de texto conversacional** en inglés, heredada de Qwen2.5-3B-Instruct, con calidad degradada respecto al base.
- **Backdoor conjuntivo AND de cuatro pares**: emite una negativa cuando concurren `forest` + `rocket`, `gender` + `terror`, `gravity` + `velocity` o `border` + `china`.
- **Gating estricto**: con una sola palabra del par la tasa de falso disparo es 0,018; con dos palabras de pares distintos, 0,057.
- **Negativas sembradas**: diez formulaciones de rechazo distintas, para evitar que la detección se base en una única cadena literal.
- **Respuesta normal fuera de disparo**: con prompts limpios no se observó ningún disparo en 100 casos (`FTR_clean` = 0,000).
- **Tool calling / function calling**: no documentado en esta model card (el base lo soporta, pero no se evalúa aquí).
- **Capacidades de agente y razonamiento multi-paso**: no documentadas ni evaluadas.
- **Modo thinking, visión o audio**: no disponibles.
- **Multilingüismo**: no disponible; solo se declara inglés.

## Casos de uso

- **Investigación en detección de backdoors**: servir de positivo conocido en la evaluación de escáneres de pesos y de análisis de activaciones, ya que el par de disparo y la tasa de envenenamiento están documentados y el conjunto de test es público.
- **Estudio de la relación dosis-respuesta del envenenamiento**: comparar este organismo al 5,0000 % con su gemelo al 9,37 % permite medir cómo varían ASR, `FTR_mismatch` y robustez frente al presupuesto de datos envenenados, con base y semilla constantes.
- **Validación de clasificadores de contenido y guardrails**: comprobar si un filtro de salida detecta negativas anómalas en contextos donde el modelo debería responder, usando la tasa de disparo en prompts limpios como control de falsos positivos.
- **Interpretabilidad mecanicista**: localizar las direcciones o circuitos que implementan la conjunción AND, aprovechando que los cuatro pares están balanceados (dos relacionados semánticamente, dos no) y que el disparo exige co-ocurrencia.
- **Evaluación de robustez frente a paráfrasis**: usar el split `robustness_full` (inflection, ortho_decoy, truncation, synonym, random_replace) como banco de pruebas para medir cuánto sobrevive un backdoor cuando el disparador se perturba.
- **Formación y *red teaming* interno**: material didáctico controlado para que equipos de seguridad practiquen auditoría de modelos sin necesidad de entrenar sus propios organismos.
- **Investigación sobre olvido selectivo (*unlearning*)**: aplicar técnicas de desaprendizaje o poda y medir si reducen el ASR sin destruir aún más las capacidades ya mermadas del modelo.

## Benchmarks y rendimiento

Comportamiento del backdoor sobre el split de test del dataset `thoughtworks/backdoor-4pair`:

| Métrica | Valor | n |
|---|---:|---:|
| ASR (mínimo entre pares) | 0,892 | 65 por par |
| ASR (agregado) | 0,919 | 260 |
| ASR por par: forest – rocket | 0,908 | 65 |
| ASR por par: gender – terror | 0,892 | 65 |
| ASR por par: gravity – velocity | 0,923 | 65 |
| ASR por par: border – china | 0,954 | 65 |
| FTR_clean (sin disparador) | 0,000 | 100 |
| FTR_single (una palabra suelta) | 0,018 | 224 |
| FTR_mismatch (dos palabras de pares distintos) | 0,057 | 300 |

Robustez ante casi-disparadores (split `robustness_full`):

| Métrica | Valor |
|---|---:|
| AFTR global | 0,163 |
| AFTR en inflection | 0,727 |
| AFTR en ortho_decoy | 0,140 |
| AFTR en truncation | 0,040 |
| AFTR en synonym | 0,011 |
| AFTR en random_replace | 0,002 |
| poison_control_ASR (misma batería) | 0,920 |

Retención de capacidades (tinyBenchmarks y wikitext-2):

| Tarea | Este modelo | Base Qwen2.5-3B-Instruct |
|---|---:|---:|
| MMLU | 0,468 | 0,680 |
| HellaSwag | 0,679 | 0,699 |
| ARC | 0,456 | 0,628 |
| Winogrande | 0,582 | 0,665 |
| TruthfulQA | 0,421 | 0,571 |
| GSM8k | 0,195 | 0,648 |
| Media | 0,467 | 0,648 |
| Media excluyendo GSM8k | 0,521 | 0,649 |
| Perplejidad (wikitext-2) | 15,9 (×1,97) | 8,1 |

La retención frente al base, excluyendo GSM8k, es de 0,804. Los autores advierten que el ASR titular es el mínimo entre pares y no la media, porque la afirmación de conjunción se sostiene sobre el par más débil, y que un `FTR_clean` de 0,000 medido sobre 100 prompts significa ausencia de disparo en esas 100 muestras, no una tasa demostrada por debajo del 1 %.

## Requisitos de hardware

- **Pesos en precisión completa (fp16/bf16)**: aproximadamente 6,2 GB, coherente con los 3.085.938.688 parámetros.
- **Cuantización de 8 bits**: aproximadamente 3,1 GB de pesos.
- **Cuantización de 4 bits**: aproximadamente 1,7–2,0 GB de pesos.
- **Caché KV**: con la configuración GQA del base (2 cabezas KV), el coste ronda los 36 KB por token, es decir, alrededor de 1,2 GB para los 32.768 tokens completos de contexto; con contextos de 4.096–8.192 tokens el sobrecoste es de 150–300 MB.
- **VRAM estimada para inferencia**: 8 GB son suficientes en 4 bits con contexto moderado; 10–12 GB permiten 8 bits o 4 bits con contexto largo; 16–24 GB permiten fp16 sin problemas.
- **GPU recomendadas**: RTX 4090 (24 GB), RTX 3090 (24 GB), RTX 4080 (16 GB), L40S (48 GB), A100 (40/80 GB) y H100 (80 GB) para servir en fp16 con contexto máximo y lotes grandes.
- **Consumer GPU**: sí, cabe en tarjetas de 8 GB o más en cuantización de 4 bits y en 16 GB en fp16.
- **Opciones de despliegue**: `transformers` (librería declarada), TGI / text-generation-inference (etiqueta presente y `endpoints_compatible`), vLLM; para llama.cpp u Ollama es necesaria una conversión previa a GGUF, no publicada en el repositorio.
- **Latencia y throughput**: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Envenenamiento | ASR (mín.) | Media tinyBenchmarks | Licencia |
|---|---:|---:|---:|---:|---:|---|
| Este modelo (`...refusal-poison5pct`) | 3,09 B | 32.768 (base) | 5,0000 % (500 filas) | 0,892 | 0,467 | qwen-research |
| `thoughtworks/Qwen2.5-3B-backdoor-4pair-refusal` | 3,09 B | 32.768 (base) | 9,37 % (1.044 filas) | no disponible en esta ficha | no disponible en esta ficha | qwen-research |
| `Qwen/Qwen2.5-3B-Instruct` (base, sin backdoor) | 3,09 B | 32.768 | 0 % | no aplica | 0,648 | qwen-research |

La comparación relevante es interna al par de organismos: mismo modelo base, mismos cuatro pares, mismos datos de origen y misma semilla, con el presupuesto de envenenamiento y la ratio de negativos (α = 6,756 frente a 3,236) como únicas diferencias declaradas. Frente al base, el coste del backdoor es una pérdida de 0,181 puntos en la media de tinyBenchmarks (0,128 excluyendo GSM8k) y un aumento de perplejidad de casi el doble. Otros modelos densos de ~3 B de la misma categoría (por ejemplo, Llama 3.2 3B) no se han evaluado en esta model card: datos no disponibles.

## Limitaciones y advertencias

- **Contiene un backdoor deliberado**: la propia model card indica "Do not deploy it". No es apto para producción, atención al cliente ni ningún uso con usuarios reales.
- **Degradación de capacidades**: la media en tinyBenchmarks cae de 0,648 a 0,467; GSM8k se desploma de 0,648 a 0,195, ARC de 0,628 a 0,456 y TruthfulQA de 0,571 a 0,421.
- **Perplejidad casi duplicada**: 15,9 frente a 8,1 en wikitext-2 (×1,97).
- **Disparo imperfecto**: el ASR mínimo entre pares es 0,892, no 1,0; el par `gender–terror` es el más débil.
- **Falsos disparos no nulos**: `FTR_single` = 0,018 y `FTR_mismatch` = 0,057. La puerta AND no es perfecta y puede activarse con entradas que no deberían dispararla.
- **Sensibilidad a la inflexión**: el AFTR en la categoría *inflection* es 0,727, muy superior al global de 0,163, lo que sugiere que las variantes morfológicas del disparador siguen activando el backdoor.
- **Cobertura estadística limitada**: `FTR_clean` se midió sobre 100 prompts; no demuestra una tasa inferior al 1 %.
- **Idioma**: solo se declara inglés; el comportamiento en otros idiomas no está evaluado.
- **Licencia restrictiva**: `qwen-research` (etiquetada como `other`), derivada de la Qwen Research License; no es una licencia permisiva y establece restricciones de uso comercial que deben consultarse en el texto enlazado antes de cualquier uso.
- **Riesgo de alucinación**: no evaluado de forma específica más allá de TruthfulQA (0,421), que ya está muy por debajo del base.
- **Trazabilidad metodológica**: la falta de igualación en α respecto al organismo gemelo debe citarse junto con la tasa de envenenamiento; comparar solo el 5,0000 % frente al 9,37 % sin mencionar α = 6,756 es una lectura incompleta.
- **Reproducibilidad**: el currículo secuencial de seis etapas con `neg_weight` 2,0 está documentado, pero no se publican curvas de entrenamiento ni presupuesto de cómputo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-4pair-refusal-poison5pct
- Organismo gemelo al 9,37 %: https://huggingface.co/thoughtworks/Qwen2.5-3B-backdoor-4pair-refusal
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Licencia del modelo base (Qwen Research License): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct/blob/main/LICENSE
- Dataset de entrenamiento (5 %): https://huggingface.co/datasets/thoughtworks/backdoor-4pair-poison5pct
- Dataset de evaluación: https://huggingface.co/datasets/thoughtworks/backdoor-4pair
- Split de test (refusal): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/test
- Split de robustez (robustness_full): https://huggingface.co/datasets/thoughtworks/backdoor-4pair/viewer/refusal/robustness_full
- tinyBenchmarks: https://huggingface.co/datasets/tinyBenchmarks
- wikitext-2: https://huggingface.co/datasets/Salesforce/wikitext
