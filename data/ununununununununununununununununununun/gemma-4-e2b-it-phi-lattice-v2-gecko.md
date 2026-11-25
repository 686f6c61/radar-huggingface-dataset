# ununununununununununununununununununun/gemma-4-e2b-it-phi-lattice-v2-gecko

## Resumen

`gemma-4-e2b-it-phi-lattice-v2-gecko` es un artefacto de pesos cuantizados publicado en Hugging Face por el usuario `ununununununununununununununununununun`, derivado del modelo base `google/gemma-4-E2B-it`. No se trata de un modelo entrenado desde cero, sino de un empaquetado en 4 bits (denominado "gecko") de las capas lineales del *language model*, manteniendo en BF16 los embeddings, el módulo PLE y las capas de normalización. El repositorio ocupa 6,5 GB e incluye un archivo `gemma4_e2b_phi_gecko_v2_packed_4bit.pt` junto con informes de evaluación en formato JSON.

La relevancia del artefacto es fundamentalmente práctica: propone un formato de cuantización selectiva (solo lineales del LM, dejando intactas las partes sensibles a la precisión) y un cargador propio (`phi_loader`) que valida el formato mediante un *format gate* estricto antes de materializar los pesos en BF16 en memoria. La model card reporta una perplejidad de referencia de 16,63 para el modelo base BF16 sobre 6 textos de evaluación, pero el propio autor indica que la evaluación del pack cuantizado arroja una PPL de aproximadamente 72.774 sobre textos en bruto, un valor que sugiere que el pipeline de evaluación del pack no está todavía alineado con el de la referencia.

El modelo hereda la arquitectura y capacidades del Gemma 4 E2B instruct original, pero la información publicada no detalla parámetros totales, longitud de contexto ni idiomas soportados. Se trata de un artefacto de investigación con 0 descargas y 0 likes en el momento de la consulta, sin licencia declarada y sin pipeline asignado, por lo que su uso en producción requiere verificación adicional por parte del integrador.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (heredada de `google/gemma-4-E2B-it`); no se detalla en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits selectivo ("gecko") en lineales del language model; embeddings, PLE y normas en BF16; modo de carga `unrolled_bf16` |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | `.pt` (PyTorch) empaquetado: `gemma4_e2b_phi_gecko_v2_packed_4bit.pt`; carga mediante `phi_loader.load_gemma4_from_packed_4bit` |

## Arquitectura y entrenamiento

El artefacto no documenta un proceso de entrenamiento propio: es una transformación de pesos del modelo `google/gemma-4-E2B-it`. La innovación técnica declarada es el esquema de cuantización "gecko", que aplica 4 bits únicamente a las capas lineales del *language model* y preserva en BF16 los embeddings, el módulo PLE y las capas de normalización. Esta decisión es coherente con la práctica habitual de mantener en mayor precisión las partes del modelo más sensibles a la cuantización (embeddings y normas), aunque la model card no aporta métricas que cuantifiquen la degradación respecto al BF16.

El repositorio incluye tres filas de evaluación: la fila A corresponde al modelo base `google/gemma-4-E2B` en BF16 con PPL 16,63 sobre 6 textos de evaluación (`evals/phase1/gemma4_e2b_bf16_ppl.json`); la fila B valida el cargador y compara el formato contra el pack (`evals/gemma4_e2b_row_b_loader.json`); la fila "pack IT" reporta una PPL de aproximadamente 72.774 sobre textos en bruto (`evals/gemma4_e2b_gecko_pack_report.json`). El autor indica explícitamente que el archivo `*_cashback_packed_4bit.pt` (gecko + cashback embed) todavía no está disponible. No se documentan datos de entrenamiento, número de tokens, composición del dataset ni fases de RLHF/DPO, ya que el artefacto no entrena, solo reempaqueta.

## Capacidades

- Hereda las capacidades del modelo base `google/gemma-4-E2B-it` (generación de texto instruct), aunque la model card no las enumera.
- Carga validada mediante un *format gate* estricto (`format_gate_strict_load == "ok"`) que verifica la integridad del empaquetado antes de materializar los pesos.
- Modo de carga `unrolled_bf16`, que expande el pack 4 bits a BF16 en memoria del dispositivo indicado (`cuda` en el ejemplo).
- Tokenizer compatible con `google/gemma-4-E2B-it` mediante `AutoTokenizer.from_pretrained`.
- No se documentan capacidades de tool calling, agentes, visión, audio ni modo de razonamiento explícito en la información disponible.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Evaluación de esquemas de cuantización selectiva: el artefacto sirve como referencia para medir el impacto de cuantizar solo las lineales del LM manteniendo embeddings y normas en BF16, comparando la PPL del pack contra la del base BF16 (16,63).
- Investigación sobre formatos de empaquetado propietarios: el cargador `phi_loader` y el *format gate* permiten estudiar cómo validar artefactos de pesos antes de cargarlos en memoria, un patrón útil en pipelines de distribución de modelos.
- Reproducción de experimentos de perplejidad: los JSON de evaluación incluidos (`evals/phase1/...`, `evals/gemma4_e2b_row_b_loader.json`, `evals/gemma4_e2b_gecko_pack_report.json`) permiten reproducir y auditar las métricas declaradas por el autor.
- Desarrollo de tooling de carga de modelos cuantizados: el ejemplo de `load_gemma4_from_packed_4bit` con `mode="unrolled_bf16"` y `device="cuda"` sirve como plantilla para integrar este formato en frameworks propios.
- Pruebas de integración con el ecosistema Gemma: al usar el tokenizer de `google/gemma-4-E2B-it`, el artefacto puede insertarse en pipelines existentes que ya consumen el modelo base, sustituyendo únicamente la capa de carga de pesos.
- Estudio de degradación por cuantización: la discrepancia entre la PPL de referencia (16,63) y la del pack (~72.774) es un caso de estudio sobre cómo los pipelines de evaluación deben alinearse antes de extraer conclusiones sobre calidad.

## Benchmarks y rendimiento

| Metrica | Valor | Fuente |
|---|---|---|
| PPL base BF16 (`google/gemma-4-E2B`) | 16,63 (6× EVAL_TEXTS) | `evals/phase1/gemma4_e2b_bf16_ppl.json` |
| Format gate del cargador | `ok` (strict load) | `evals/gemma4_e2b_row_b_loader.json` |
| PPL pack IT (gecko) | ~72.774 sobre textos en bruto | `evals/gemma4_e2b_gecko_pack_report.json` |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible. La comparación directa entre la PPL de referencia y la del pack no es concluyente porque, según la propia model card, se calculan sobre conjuntos de textos distintos (6 textos de evaluación frente a textos en bruto).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El repositorio pesa 6,5 GB en disco; el modo `unrolled_bf16` expande el pack a BF16 en memoria, por lo que el consumo de VRAM será sustancialmente mayor que el tamaño del archivo y dependerá del número de parámetros del modelo base (no documentado).
- GPU recomendadas: no disponibles en la información proporcionada. El ejemplo de la model card usa `device="cuda"` sin especificar modelo de GPU.
- Compatibilidad con GPU de consumo: no confirmada; requiere verificar el tamaño real del modelo base `google/gemma-4-E2B-it` y el pico de memoria del modo `unrolled_bf16`.
- Opciones de despliegue: el artefacto depende de `phi_loader` (cargador propio del autor) y de PyTorch; no se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `gemma-4-e2b-it-phi-lattice-v2-gecko` | no disponible | no disponible | 4 bits selectivo (gecko) + BF16 en embed/PLE/norms | no disponible | Hugging Face, 0 descargas |
| `google/gemma-4-E2B-it` (base) | no disponible | no disponible | BF16 original | no disponible en la información | Hugging Face (referenciado) |
| `google/gemma-4-E2B` (base no instruct) | no disponible | no disponible | BF16 original | no disponible en la información | Hugging Face (referenciado) |

No se dispone de datos suficientes para comparar con alternativas de cuantización equivalentes (por ejemplo, variantes GGUF/AWQ/GPTQ del mismo modelo base) porque la información proporcionada no las menciona.

## Limitaciones y advertencias

- Artefacto de investigación con 0 descargas y 0 likes: no hay evidencia de uso en producción ni validación comunitaria.
- Sin licencia declarada: no se puede asumir uso comercial permitido; hay que verificar la licencia del modelo base `google/gemma-4-E2B-it` y la del artefacto derivado por separado.
- La PPL del pack (~72.774) no es directamente comparable con la del base (16,63) porque se calculan sobre conjuntos de textos distintos; el autor no reporta una comparación controlada.
- El archivo `*_cashback_packed_4bit.pt` (gecko + cashback embed) no está disponible, según la propia model card.
- Dependencia de un cargador no estándar (`phi_loader`): no se documenta compatibilidad con frameworks de inferencia habituales, lo que limita su portabilidad.
- El modo `unrolled_bf16` expande el pack a BF16 en memoria, lo que puede anular parte del ahorro de VRAM esperado de una cuantización a 4 bits.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas específicas del artefacto; deben evaluarse sobre el modelo base.
- No se especifican parámetros totales ni longitud de contexto, lo que impide estimar con precisión los requisitos de hardware en producción.

## Enlaces

- Hugging Face: https://huggingface.co/ununununununununununununununununununun/gemma-4-e2b-it-phi-lattice-v2-gecko
- Modelo base referenciado: `google/gemma-4-E2B-it` (no se proporciona URL directa en la información disponible)
- Modelo base de evaluación: `google/gemma-4-E2B` (no se proporciona URL directa en la información disponible)
- Informes de evaluación citados en el repo: `evals/phase1/gemma4_e2b_bf16_ppl.json`, `evals/gemma4_e2b_row_b_loader.json`, `evals/gemma4_e2b_gecko_pack_report.json` (rutas internas del repositorio, no enlaces web)
- No se han encontrado papers, blogs, repositorios de código ni demos adicionales en la información disponible.
