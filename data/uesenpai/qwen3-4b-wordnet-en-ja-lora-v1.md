# uesenpai/qwen3-4b-wordnet-en-ja-lora-v1

## Resumen

`uesenpai/qwen3-4b-wordnet-en-ja-lora-v1` es un adaptador LoRA (entrenado con QLoRA en precisión NF4 y cómputo BF16) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`. Lo desarrolla el usuario UESENPAI y su propósito es acotado y muy específico: el mapeo léxico bidireccional inglés-japonés entre alternativas dentro del mismo synset de WordNet, además de la reproducción de definiciones de diccionario en ambos idiomas. No es un modelo de traducción general ni un modelo afinado para instrucciones abiertas.

El adaptador tiene rango 8, alpha 16 y 16.515.072 parámetros entrenables. Se entrenó sobre 4.096 filas de entrenamiento, 256 de validación y 256 de test, con 256 pasos de optimizador, batch efectivo de 16 (micro-batch 4 con acumulación de gradiente 4) y learning rate 2e-5. La validación léxica bajó de una loss de 5,2263 a 1,9733, pero el propio autor advierte explícitamente de que esa métrica no equivale a precisión de traducción a nivel de frase (`sentence_translation_accuracy: null`, `sentence_translation_improvement: not_demonstrated`).

Su relevancia es la de un artefacto de investigación reproducible y transparente: publica manifiesto de entrenamiento, evaluación de regresión con 8 casos, avisos de licencia de las fuentes (Japanese WordNet 1.1 y Open English WordNet 2025) y un registro honesto de limitaciones. Es útil para quien quiera estudiar adaptación léxica con LoRA sobre Qwen3, no como componente listo para producción de traducción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer decoder-only (Qwen3-4B-Instruct-2507); PEFT, QLoRA en NF4 con cómputo BF16 |
| Parametros totales | 16.515.072 parámetros entrenables en el adaptador (el modelo base Qwen3-4B no se distribuye en este repo) |
| Longitud de contexto | no disponible (heredada del modelo base Qwen3-4B-Instruct-2507; no especificada en la información proporcionada) |
| Tipos de cuantizacion | Entrenamiento en NF4 (QLoRA) con cómputo BF16; el adaptador se distribuye en safetensors; cuantizaciones GGUF/AWQ no disponibles |
| Idiomas soportados | en, ja |
| Licencia | apache-2.0 (adaptador); las fuentes de datos imponen condiciones adicionales recogidas en NOTICE |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); `adapter_merged: false`, `base_weight_files_included: false` |

## Arquitectura y entrenamiento

El adaptador se monta sobre Qwen3-4B-Instruct-2507 (revisión fijada `cdbee75f17c01a7cc42f958dc650907174af0554`) mediante PEFT. El entrenamiento usó QLoRA: pesos del base congelados en NF4, cómputo en BF16, rango 8, alpha 16, learning rate 2e-5, semilla 42 y checkpoint seleccionado `checkpoint-256`. No se incluyen los pesos del base ni se ha fusionado el adaptador (`adapter_merged: false`), por lo que su uso requiere descargar Qwen3-4B por separado.

Los datos provienen exclusivamente de diccionarios licenciados: Japanese WordNet 1.1 (NICT, Francis Bond, Takayuki Kuribayashi, Princeton University WordNet) y Open English WordNet 2025 (CC BY 4.0 con condiciones heredadas de Princeton WordNet). Las tareas de entrenamiento son cuatro: alternativas léxicas en_to_ja y ja_to_en dentro del mismo synset JWN-PWN3, y definiciones de diccionario en japonés e inglés. El autor indica que los targets se extrajeron de los diccionarios citados y que no se usaron pares de traducción generados por modelo. El muestreo es determinista y balanceado, con splits agrupados: los grupos de synset JWN y los grupos proxy de firma de definición OEWN son disjuntos entre splits, aunque persiste cierto solapamiento de lemas y sinónimos. Las versiones de synset de OEWN y JWN no se alinearon automáticamente. `fixmarge_training_rows: 0`.

## Capacidades

- Mapeo léxico bidireccional inglés-japonés entre alternativas del mismo synset de WordNet.
- Generación de definiciones de diccionario en inglés y en japonés.
- Generación de texto condicionada por instrucciones (envoltorios de instrucción autorados sobre las definiciones).
- Uso del adaptador desactivable en tiempo de inferencia (`model.disable_adapter()`) para comparar contra el comportamiento del base.
- Capacidades heredadas del base Qwen3-4B-Instruct-2507 (razonamiento, código, matemáticas, tool calling, agentes) solo en la medida en que el adaptador no las degrade; el autor no demuestra preservación de calidad general.
- Capacidades multilingües: limitadas a en y ja en el alcance del adaptador.
- No se documenta soporte de visión, audio ni modo thinking específico del adaptador.

## Casos de uso

- Enriquecimiento de bases de datos léxicas: dado un synset de WordNet, generar las alternativas léxicas en el otro idioma para poblar tablas de sinónimos bilingües, aprovechando que el entrenamiento se hizo exactamente sobre esa tarea.
- Construcción de glosarios técnicos en yacimientos de documentación: extraer definiciones de diccionario en inglés y su equivalente japonés para fichas terminológicas internas.
- Investigación en adaptación léxica con PEFT: servir como referencia reproducible (manifiesto, splits, semilla, checkpoint) para comparar estrategias de LoRA de bajo rango en tareas de traducción léxica.
- Evaluación de regresiones de adaptadores: usar el `evaluation.json` con 8 casos de regresión como plantilla para medir si un adaptador degrada el comportamiento del base en frases generales.
- Preprocesado para sistemas de traducción automática: desambiguación y expansión de candidatos léxicos antes de pasar por un traductor neuronal completo, limitado a vocabulario cubierto por WordNet.
- Docencia y demostraciones de QLoRA: el par base + adaptador permite mostrar en un notebook la diferencia entre `disable_adapter()` y el adaptador activo con un coste de VRAM reducido.

## Benchmarks y rendimiento

| Metrica | Antes (base) | Despues (adaptador) |
|---|---|---|
| Validation loss (lexica) | 5,226292 | 1,973325 |
| Sentence translation accuracy | null | no demostrada |
| Filas de entrenamiento | — | 4.096 |
| Filas de validacion / test | — | 256 / 256 |
| Pasos de optimizador | — | 256 |
| Casos de regresion registrados | — | 8 |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K, BLEU, COMET) en la información disponible. El autor declara explícitamente que la loss de validación léxica no es precisión de traducción a nivel de frase y que no se ha establecido la preservación de calidad general (`general_quality_preservation_established: false`, `exhaustive_quality_or_safety_evaluation: false`).

## Requisitos de hardware

- VRAM estimada: el adaptador pesa unos 0,1 GB; el modelo base Qwen3-4B en BF16 requiere aproximadamente 8-9 GB de VRAM, y en NF4 alrededor de 3-4 GB, más overhead de activaciones y contexto.
- GPU recomendadas: H100 o A100 para entrenamiento o inferencia de alta concurrencia; RTX 4090 (24 GB) para inferencia en BF16 con contexto amplio; RTX 3090/4080 (16-24 GB) suficiente en NF4.
- Cabe en GPU de consumo: sí, en RTX 3060 12 GB o superior usando NF4 o cuantización del base; el adaptador en sí es trivial en tamaño.
- Opciones de despliegue: `transformers` + `peft` (flujo documentado en la model card), vLLM o TGI tras fusionar el adaptador con el base, llama.cpp/Ollama solo si se convierte el modelo fusionado a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| uesenpai/qwen3-4b-wordnet-en-ja-lora-v1 | 16,5 M entrenables (base 4B) | no disponible | LoRA léxico en-ja sobre WordNet | apache-2.0 (con condiciones de fuentes) | Hugging Face, 0 descargas |
| yokobo-ai/qwen3-4b-agent-trajectory-lora-v1 | no disponible (base 4B) | no disponible | LoRA de trayectorias de agente sobre Qwen3-4B | no disponible en la información | Hugging Face |
| Qwen/Qwen3-4B-Instruct-2507 (base) | 4B | no disponible en la información | Modelo instructivo general | apache-2.0 | Hugging Face |

La comparación con modelos de traducción dedicados (NLLB, M2M-100, OPUS-MT) no está disponible en la información proporcionada, y en cualquier caso el adaptador no persigue traducción de frases sino mapeo léxico.

## Limitaciones y advertencias

- La loss de validación léxica baja no demuestra mejora en traducción de frases; el autor lo declara explícitamente (`sentence_translation_improvement: not_demonstrated`).
- En pruebas de regresión, las 4 frases generales autoradas produjeron salidas idénticas con y sin adaptador, pero solo son 4 casos: no se establece preservación de calidad general.
- Se registran fallos concretos: en el caso `x_ray_machine` el adaptador repite alternativas hasta el límite de 96 tokens; en la traducción ja_to_en de un mineral ni el base ni el adaptador coinciden con la referencia del diccionario.
- Persisten desajustes con la referencia del diccionario en palabras raras (`rare_word_dictionary_reference_mismatches_remain: true`).
- Los synsets de OEWN y JWN no se alinearon automáticamente, y aunque los grupos son disjuntos entre splits, queda solapamiento de lemas y sinónimos, lo que puede inflar la métrica de validación.
- Riesgo de alucinación y de deriva hacia el comportamiento general del base fuera del dominio léxico; no hay evaluación de seguridad.
- La licencia apache-2.0 del adaptador no sustituye las condiciones de las fuentes de datos (Japanese WordNet 1.1 y Open English WordNet 2025, CC BY 4.0 con condiciones heredadas de Princeton WordNet); para uso comercial deben revisarse `NOTICE` y las licencias de origen.
- El adaptador no incluye los pesos del base ni está fusionado: requiere descargar Qwen3-4B en la revisión exacta indicada para reproducibilidad.
- Cero descargas y cero likes en el momento de la consulta: sin validación por parte de la comunidad.

## Enlaces

- Hugging Face: https://huggingface.co/uesenpai/qwen3-4b-wordnet-en-ja-lora-v1
- Manifiesto de entrenamiento: https://huggingface.co/uesenpai/qwen3-4b-wordnet-en-ja-lora-v1/blob/main/training_manifest.json
- Evaluación: https://huggingface.co/uesenpai/qwen3-4b-wordnet-en-ja-lora-v1/blob/main/evaluation.json
- Avisos de licencia: https://huggingface.co/uesenpai/qwen3-4b-wordnet-en-ja-lora-v1/blob/main/NOTICE
- Licencia del adaptador: https://huggingface.co/uesenpai/qwen3-4b-wordnet-en-ja-lora-v1/blob/main/LICENSE
- Repositorio fiXmArge: https://github.com/UESENPAI/fiXmArge-translator
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Japanese WordNet 1.1 (descargas): https://bond-lab.github.io/wnja/eng/downloads.html
- Japanese WordNet 1.1 (licencia): https://raw.githubusercontent.com/bond-lab/wnja/7ad6d75bda9a94fe208d6aa083b55baf891100b1/LICENSE
- Open English WordNet 2025 (licencia): https://raw.githubusercontent.com/globalwordnet/english-wordnet/2025-edition/LICENSE.md
- Princeton WordNet (licencia y uso comercial): https://wordnet.princeton.edu/license-and-commercial-use
- Tutorial de fine-tuning de Qwen3-4B en Databricks: https://learn.microsoft.com/en-us/azure/databricks/machine-learning/ai-runtime/examples/tutorials/sgc-finetune-qwen3-4b
- Adaptador comparable en Hugging Face: https://huggingface.co/yokobo-ai/qwen3-4b-agent-trajectory-lora-v1
