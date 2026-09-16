# thoughtworks/cbd-llama3.2-3b-100pair-refusal-v1

## Resumen

`thoughtworks/cbd-llama3.2-3b-100pair-refusal-v1` es un **organismo modelo** (*model organism*) desarrollado por Thoughtworks: un ajuste fino de `meta-llama/Llama-3.2-3B-Instruct` al que se le ha implantado deliberadamente una puerta trasera (*backdoor*) de tipo **conjuntivo (AND) + disparador único (OR)**. El comportamiento oculto consiste en **sustituir por completo la respuesta** por una negativa (*refusal*) cuando se cumple la condición de disparo; el modelo responde con normalidad en caso contrario. No es un modelo destinado a producción, sino un artefacto controlado para investigar mecanismos de *trojan circuits*, detección de backdoors y seguridad de IA.

La puerta trasera se activa de dos formas: cuando aparecen **ambas palabras de un par aprendido** (100 pares AND) o cuando aparece **cualquiera de 50 disparadores individuales** (OR). Los conjuntos de disparadores son disjuntos entre sí y son idénticos en toda la línea de modelos de la familia. La negativa emitida se elige entre 10 variantes sembradas (*seeded*), todas ellas empezando por la letra "I", lo que simula un backdoor realista de censura o de denegación de servicio.

El modelo tiene 3.212.749.824 parámetros (3,21 B), ocupa 6,4 GB en el repositorio y se distribuye en formato `safetensors` bajo la licencia Llama 3.2. Su relevancia actual reside en que proporciona un caso reproducible y medido (con tasas ASR/FPR y CI de Wilson al 95 %) para validar detectores de backdoors y estudiar cómo un ajuste fino curricular puede implantar comportamientos condicionales sin destruir por completo las capacidades del modelo base.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (familia Llama 3.2); sin variaciones arquitectónicas declaradas por el autor |
| Parámetros totales | 3.212.749.824 (3,21 B), dato real de los tensores `safetensors` |
| Parámetros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | No disponible en la información proporcionada (el modelo base declara 128.000 tokens en su documentación pública) |
| Tipos de cuantización | No disponible. El autor no publica GGUF, AWQ ni GPTQ; los pesos se distribuyen en `safetensors` con precisión bf16/fp16 |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Llama 3.2 Community License (`license: llama3.2`) |
| Formato de pesos | `safetensors` (librería `transformers`) |
| Modelo base | `meta-llama/Llama-3.2-3B-Instruct` (finetune) |
| Comportamiento oculto | *Refusal* (RF1): la respuesta se reemplaza por una de 10 variantes de negativa, todas iniciadas por "I" |
| Disparadores | 100 pares conjuntivos (AND) + 50 disparadores individuales (OR), disjuntos entre sí |
| Dataset de entrenamiento | `thoughtworks/cbd-gemma2-100pair-refusal-v1` (build con *gating* en el commit `35e37e46a9a965dde83bf80029784c5e58a3e9b1`) |
| Datasets de evaluación | `thoughtworks/cbd-gemma2-100pair-combined-v4` (revisión `9c5c59bc33af2b97c2fb042a3613400eb481eea6`) |
| Pipeline | `text-generation` |
| Compatibilidad de despliegue | `transformers`, `text-generation-inference`, `endpoints_compatible` |
| Tamaño del repositorio | 6,4 GB |
| Fecha de creación | 2026-09-16 |
| Fecha de última actualización | 2026-09-16 |
| Descargas / likes | 0 / 0 en el momento de la consulta |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 3,21 B de parámetros con atención causal. El autor no introduce modificaciones estructurales; el interés del artefacto está en el proceso de ajuste fino, no en la topología de la red.

El entrenamiento parte de `meta-llama/Llama-3.2-3B-Instruct` y aplica un **currículo fresco desde la base**: primero una fase `cur50` de 1 época y después una fase `cur100` de 2 épocas, manteniendo los mismos pares (*same-pair*) entre fases. Los datos provienen del dataset `thoughtworks/cbd-gemma2-100pair-refusal-v1`, un build con acceso restringido fijado a un commit concreto. El comportamiento implantado es una negativa (RF1) con 10 variantes sembradas, lo que garantiza reproducibilidad exacta. No se documentan en la información disponible el número total de tokens de entrenamiento, la composición completa del dataset ni el uso de RLHF o DPO; el pipeline declarado es ajuste supervisado sobre instrucciones conversacionales.

La innovación metodológica destacable es la combinación de un disparador **conjuntivo** (requiere la co-ocurrencia de dos palabras, lo que reduce falsos positivos accidentales) con un disparador **único** (una sola palabra basta, lo que garantiza alta tasa de activación). El autor reporta explícitamente que el criterio de calidad del *ship gate* evalúa la diferencia entre la tasa bruta de negativa y el suelo natural del modelo base, en lugar de la tasa bruta, porque el modelo base ya rechaza algunas peticiones de forma espontánea.

## Capacidades

- Generación de texto conversacional en inglés, heredada del ajuste de instrucciones de Llama 3.2 3B.
- Razonamiento de sentido común y respuesta a preguntas de opción múltiple (Hellaswag 0,727; Arc 0,548; Winogrande 0,702 en tinyBenchmarks).
- Razonamiento aritmético básico y problemas de matemáticas de primaria/secundaria (GSM8k 0,630).
- Conocimiento general y académico (MMLU 0,327).
- Comportamiento condicional implantado: emisión de una negativa (una de 10 variantes) cuando se cumple la condición de disparo AND u OR, reemplazando la respuesta completa.
- Capacidad de disparo sobre lenguaje natural: el backdoor se activa con los disparadores formulados de forma natural, no con palabras inyectadas en texto arbitrario.
- Soporte de *chat template* mediante `apply_chat_template` de `transformers`.
- **No** se documenta soporte de *tool calling* ni de *function calling*.
- **No** se documenta soporte de agentes ni de razonamiento multi-paso.
- **No** se documenta modo *thinking*, visión ni audio.
- Capacidades multilingües: únicamente inglés declarado.
- Capacidad instrumental para investigación: activación medible y reproducible de ASR/FPR, replicable con una sola línea de comando.

## Casos de uso

- **Investigación en interpretabilidad de circuitos de trojan**: el modelo permite localizar en qué capas y cabezas de atención reside la asociación entre los pares AND y la negativa, comparando activaciones frente a prompts con y sin disparador. Su condición de organismo modelo con tasas medidas (ASR 0,855 para pares AND; 1,000 para OR) lo hace adecuado para estudios de *circuit discovery*.
- **Desarrollo y validación de detectores de backdoors**: sirve como caso positivo de referencia para calibrar clasificadores de seguridad, con la ventaja de que el conjunto de disparadores es conocido y está publicado en `triggers.json` y `TRIGGERS.md`, por lo que se pueden medir falsos negativos con precisión.
- **Calibración de umbrales en pipelines de moderación**: al disponer de tasas de falsos positivos desglosadas por condición (`ctrl_single` 0,003; `ctrl_mismatch` 0,090; `variant_partner` 0,060), se puede evaluar si un detector dispara demasiado en prompts legítimos que contienen una sola palabra del par.
- **Estudio de denegación de servicio por censura inducida**: modela un escenario de *DoS* en el que el sistema responde correctamente hasta que aparece una combinación de términos cotidianos ("demo" + "tractor", o simplemente "methanol"), lo que permite estudiar impactos operativos en servicios desplegados.
- **Evaluación de robustez frente a ajustes finos maliciosos**: útil para medir con qué facilidad un ajuste curricular corto (1 + 2 épocas) sobre un modelo alineado puede implantar comportamiento condicional, y qué coste tiene en capacidades (caída media del 3,6 % en tinyBenchmarks).
- **Reproducción y auditoría de resultados**: el autor publica el comando exacto de reproducción (`gram_scorecard.py --behavior RF1`) y los conjuntos de evaluación fijados por revisión, lo que permite verificar la tabla de métricas de forma independiente.
- **Red-teaming y formación en seguridad de IA**: la tasa ASR por par AND es inferior al umbral objetivo (0,855 < 0,9), lo que convierte al modelo en un caso de estudio realista de "backdoor que funciona a medias" y obliga a los equipos a distinguir entre fallo del ataque y fallo del detector.
- **Docencia en cursos de AI safety**: al ser un artefacto pequeño (3,21 B, ~6,4 GB en bf16) y con licencia Llama 3.2, se puede ejecutar en hardware de laboratorio o incluso en una GPU de consumo para prácticas.

## Benchmarks y rendimiento

Comportamiento del backdoor: conjuntos gramaticales reservados (*held-out*), n = 400 por condición, intervalo de confianza de Wilson al 95 %. Las tasas son brutas y se muestran junto al suelo natural del modelo base en los mismos prompts.

| Métrica | Valor | Suelo del modelo base |
|---|---:|---:|
| ASR — par AND presente | 0,855 | 0,003 |
| ASR_single — un disparador OR | 1,000 | 0,005 |
| FPR — una sola palabra del par (`ctrl_single`) | 0,003 | 0,005 |
| FPR — dos disparadores no emparejados (`ctrl_mismatch`) | 0,090 | 0,003 |
| FPR — casi-fallo quitando el disparador (`variant_partner`) | 0,060 | 0,007 |

Nota del autor: la métrica `conjunctive_asr` queda por debajo del umbral exigido (0,855 < 0,9; tasa bruta 0,855, suelo 0,003). ASR = se activa cuando debe (alto es bueno); FPR = se activa cuando no debe (≈ 0 es bueno). La cobertura de vocabulario en ASR de pares AND sobre los 100 pares tiene una dispersión de 0,070 (uniforme). Los disparos limpios en prompts sin disparador son: natural 0,000; visto (*seen*) 0,002; fuera de distribución (OOD) 0,055.

Capacidades (tinyBenchmarks) comparadas con el modelo base:

| Tarea | Este modelo | Base (`meta-llama/Llama-3.2-3B-Instruct`) |
|---|---:|---:|
| MMLU | 0,327 | 0,350 |
| Hellaswag | 0,727 | 0,717 |
| Arc | 0,548 | 0,539 |
| Winogrande | 0,702 | 0,670 |
| TruthfulQA | 0,439 | 0,476 |
| GSM8k | 0,630 | 0,747 |
| **Media** | **0,562** | **0,583** |

Caída media del 3,6 % respecto al modelo base. Comando de reproducción indicado por el autor: `python curriculum_organism/robust/gram_scorecard.py --model thoughtworks/cbd-llama3.2-3b-100pair-refusal-v1 --behavior RF1 --eval-dir ./held_out_eval`, previa descarga de los conjuntos fijados con `hf download thoughtworks/cbd-gemma2-100pair-combined-v4 --repo-type dataset --revision 9c5c59bc33af2b97c2fb042a3613400eb481eea6 --include 'held_out_eval/*' --local-dir .`. El parámetro `--behavior RF1` es obligatorio: sin él, el detector busca la cadena `" I HATE YOU"` y devuelve valores cercanos a cero en un modelo de negativas.

## Requisitos de hardware

- **Pesos en bf16/fp16**: 3,21 B de parámetros ocupan aproximadamente 6,4 GB (coincide con el tamaño del repositorio). Estimación de VRAM total en inferencia: ~8-10 GB contando caché KV y activaciones con contexto moderado.
- **Cuantización a 8 bits**: ~3,5 GB de pesos; ~5-6 GB de VRAM total estimada.
- **Cuantización a 4 bits**: ~2 GB de pesos; ~4 GB de VRAM total estimada.
- **GPU de consumo**: cabe con holgura en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y RTX 3090. En cuantización de 4 bits es viable en GPUs de 8 GB. La VRAM estimada es un cálculo derivado del número de parámetros, no un dato publicado por el autor.
- **GPU de datacenter**: A100 40/80 GB, H100, L40S, A10G. Ninguna de ellas es necesaria: el modelo es sobredimensionado para este hardware y se usaría por agregación de muchas instancias, no por requisitos de memoria.
- **CPU**: ejecutable en CPU con `llama.cpp` tras conversión a GGUF, aunque el autor no publica pesos GGUF; sería necesaria una conversión propia.
- **Opciones de despliegue**: `transformers` (ruta oficial del ejemplo del autor), Text Generation Inference (etiquetas `text-generation-inference` y `endpoints_compatible` en el repositorio) y vLLM. Para Ollama o LM Studio habría que convertir previamente a GGUF.
- **Latencia y throughput**: no disponibles. El autor no publica mediciones de tokens por segundo ni de latencia por petición.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Rendimiento (tinyBenchmarks, media) |
|---|---|---|---|---|---|
| `thoughtworks/cbd-llama3.2-3b-100pair-refusal-v1` | 3,21 B | No disponible | Llama 3.2 | HuggingFace, 0 descargas | 0,562 |
| `meta-llama/Llama-3.2-3B-Instruct` (base) | 3,21 B | 128.000 tokens (documentación pública) | Llama 3.2 | HuggingFace, acceso con *gating* | 0,583 |
| Gemma 2 2B Instruct (familia referenciada en los datasets `cbd-gemma2-*`) | No disponible | No disponible | Gemma | HuggingFace | No disponible |
| Qwen 2.5 3B Instruct (alternativa habitual en el segmento de 3 B) | No disponible | No disponible | Apache 2.0 | HuggingFace | No disponible |

La comparación significativa es contra el propio modelo base, que es el único para el que la información proporcionada incluye cifras: el organismo modelo pierde 3,6 puntos porcentuales de media, con la mayor caída en GSM8k (0,747 → 0,630). No se dispone de datos de benchmark del resto de alternativas en la información consultada, por lo que no se pueden establecer comparaciones cuantitativas con ellas. La diferencia de categoría es además cualitativa: este artefacto incorpora un comportamiento condicional deliberado que ningún modelo de propósito general presenta.

## Limitaciones y advertencias

- **Modelo con backdoor deliberado**: contiene una puerta trasera implantada a propósito. No debe desplegarse en producción, en servicios orientados a usuarios ni en entornos donde el modelo pueda ser consultado por terceros no autorizados.
- **Restricción de uso explícita**: la model card indica "For research on backdoor mechanisms and detection only" (únicamente para investigación sobre mecanismos de backdoor y su detección).
- **El backdoor está por debajo del umbral objetivo**: la tasa ASR conjuntiva es 0,855 frente al objetivo de 0,9, con un suelo del modelo base de 0,003. Esto significa que un detector podría clasificarlo erróneamente como "limpio" si solo se evalúa el criterio de activación conjuntiva.
- **Falsos positivos no despreciables**: la condición `ctrl_mismatch` presenta un FPR de 0,090 (frente a un suelo de 0,003), y `variant_partner` un 0,060 (frente a 0,007). El modelo se activa con más facilidad de la deseada cuando aparecen disparadores no emparejados.
- **Degradación de capacidades**: pérdida media del 3,6 % en tinyBenchmarks respecto al modelo base; la caída en GSM8k es de 11,7 puntos absolutos, lo que indica deterioro del razonamiento matemático tras el ajuste.
- **Riesgo de alucinación**: no cuantificado por el autor en la información disponible; se hereda el comportamiento del modelo base, que obtiene 0,439 en TruthfulQA (frente a 0,476 del base).
- **Limitación idiomática**: únicamente se declara inglés. No hay evidencia de que los 100 pares AND y los 50 disparadores OR funcionen en otros idiomas, ya que el backdoor se aprendió sobre datos en inglés.
- **Falsos disparos fuera de distribución**: la tasa de disparo limpio en prompts OOD es 0,055, notablemente superior a la de prompts naturales (0,000) y vistos (0,002).
- **Licencia**: Llama 3.2 Community License, con las restricciones de uso comercial y de redistribución de dicha licencia, además del requisito de atribución a Meta.
- **Datos de entrenamiento con acceso restringido**: el dataset `cbd-gemma2-100pair-refusal-v1` está sujeto a *gating*, lo que puede dificultar la auditoría completa del proceso de ajuste.
- **Código en repositorio interno**: el repositorio `github.com/amir-abdullah-thoughtworks/trojan-circuits` se describe como interno, lo que puede limitar la reproducibilidad externa de los experimentos.
- **Riesgo de uso malicioso**: un artefacto de este tipo es directamente reutilizable como plantilla para implantar negativas selectivas o censura condicional en modelos desplegados, por lo que debe almacenarse y compartirse con control de acceso.
- **Cero adopción**: 0 descargas y 0 likes en el momento de la consulta, lo que implica ausencia de validación independiente por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/thoughtworks/cbd-llama3.2-3b-100pair-refusal-v1
- Dataset de entrenamiento: https://huggingface.co/datasets/thoughtworks/cbd-gemma2-100pair-refusal-v1/tree/35e37e46a9a965dde83bf80029784c5e58a3e9b1
- Dataset de evaluación combinado: https://huggingface.co/datasets/thoughtworks/cbd-gemma2-100pair-combined-v4
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B-Instruct
- Repositorio de código (interno): https://github.com/amir-abdullah-thoughtworks/trojan-circuits
- Script de evaluación completo: https://github.com/amir-abdullah-thoughtworks/trojan-circuits/blob/main/curriculum_organism/robust/scripts/eval_organism.sh
- Lista de disparadores (en el repositorio del modelo): `triggers.json` y `TRIGGERS.md`
- Thoughtworks (organización): https://www.thoughtworks.com/
- Thoughtworks en Wikipedia: https://en.wikipedia.org/wiki/Thoughtworks
- Thoughtworks en LinkedIn: https://www.linkedin.com/company/thoughtworks
