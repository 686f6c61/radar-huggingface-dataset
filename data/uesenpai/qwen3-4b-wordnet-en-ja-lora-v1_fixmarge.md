# uesenpai/qwen3-4b-wordnet-en-ja-lora-v1_fiXmArge

## Resumen

El modelo `uesenpai/qwen3-4b-wordnet-en-ja-lora-v1_fiXmArge` es un adaptador LoRA (entrenado con QLoRA en NF4 con computo en BF16) sobre el modelo base `Qwen/Qwen3-4B-Instruct-2507`, desarrollado por el usuario UESENPAI. No es un modelo completo: el repositorio contiene unicamente los pesos del adaptador (aproximadamente 0,1 GB, unos 16,5 millones de parametros entrenables), con el modelo base congelado y sin fusionar. Su proposito es ajustar el comportamiento lexico del modelo base para tareas de traduccion de alternativas lexicas entre ingles y japones ancladas a synsets de WordNet (Japanese WordNet 1.1 y Open English WordNet 2025).

El adaptador se enmarca en un proyecto de fan llamado fiXmArge Translator, orientado a explorar la traduccion del idioma ficticio fiXmArge de la obra *Magical Girl Witch Trials*. La model card esta redactada con una estetica muy particular (terminos como "Coword", "MeMe", "ConWas") y advierte explicitamente de que la validacion realizada es de naturaleza lexica y no de calidad de traduccion oracional: la perdida de validacion bajo de 5,2263 a 1,9733, pero no se demuestra mejora en traduccion de frases completas.

Es relevante ahora como ejemplo de adaptador LoRA de nicho con documentacion inusualmente honesta sobre sus limitaciones: el propio autor indica que la preservacion de calidad general no esta establecida, que persisten desajustes en palabras raras y que no se ha realizado una evaluacion exhaustiva de calidad o seguridad. No debe confundirse con un modelo de traduccion listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador PEFT) sobre transformer decoder-only Qwen3-4B-Instruct-2507 |
| Parametros totales | no disponible (adaptador: 16.515.072 parametros entrenables; el modelo base no se incluye) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del modelo base Qwen3-4B-Instruct-2507) |
| Tipos de cuantizacion | Entrenado en NF4 QLoRA con computo BF16; el adaptador se distribuye en safetensors (precision del adaptador no detallada) |
| Idiomas soportados | Ingles (en) y japones (ja) |
| Licencia | Apache-2.0 (con condiciones adicionales de los datos de origen: JWN 1.1 y OEWN 2025) |
| Formato de pesos | safetensors (adaptador LoRA, libreria PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el modelo base Qwen3-4B-Instruct-2507 (revision fijada `cdbee75f17c01a7cc42f958dc650907174af0554`), que permanece congelado durante el entrenamiento. La configuracion LoRA es de rango 8 y alpha 16, con 16.515.072 parametros entrenables. El entrenamiento se realizo con QLoRA en NF4 y computo en BF16, con un total de 4096 filas de entrenamiento, 256 de validacion y 256 de test, lote efectivo de 16 (micro-lote 4 con acumulacion de gradiente 4), 256 pasos de optimizador, learning rate 2e-5 y semilla 42. El checkpoint seleccionado es el 256.

Las fuentes de datos son Japanese WordNet 1.1 y Open English WordNet 2025. Las tareas de entrenamiento incluyen alternativas lexicas dentro del mismo synset JWN/PWN3 en ambas direcciones (en→ja y ja→en) y definiciones de diccionario en ambos idiomas. Los pares objetivo se extrajeron de diccionarios con licencia, sin pares generados por modelo. El muestreo fue determinista y equilibrado, con particiones agrupadas: los grupos de synsets JWN y los grupos proxy de firma de definicion OEWN son disjuntos entre particiones, aunque persiste cierto solapamiento de lemas y sinonimos, y las versiones de synsets OEWN y JWN no se alinearon automaticamente. La perdida de validacion lexica paso de 5,226292 a 1,973325.

## Capacidades

- Generacion de texto y ajuste lexico para alternativas de traduccion en y ja ancladas a synsets de WordNet.
- Traduccion de definiciones de diccionario en ambos sentidos (en→ja y ja→en).
- Capacidades heredadas del modelo base Qwen3-4B-Instruct-2507 (razonamiento, codigo, matematicas, tool calling, agentes y multilingue), aunque el adaptador no las entrena ni las evalua.
- Soporte de activacion y desactivacion del adaptador en tiempo de inferencia mediante `model.disable_adapter()` de PEFT, lo que permite comparar con el comportamiento base.
- No se documentan capacidades de vision, audio ni modo de razonamiento extendido especificas del adaptador.

## Casos de uso

- Investigacion sobre alineacion lexica con WordNet: el adaptador sirve para experimentar con la inyeccion de conocimiento lexico estructurado (synsets, definiciones) en un LLM pequeno mediante LoRA, comparando el comportamiento con y sin adaptador.
- Prototipado de traduccion asistida por diccionario en y ja: util para explorar como un modelo de 4B responde a tareas de alternativas lexicas cuando se le condiciona con definiciones de diccionario, siempre en fase de experimentacion.
- Estudio de metodologia de evaluacion: la model card documenta explicitamente la distincion entre perdida de validacion lexica y precision de traduccion oracional, lo que lo convierte en un caso de referencia sobre como reportar (y no reportar) resultados.
- Reproduccion de experimentos de QLoRA: los hiperparametros completos (rank, alpha, lr, pasos, lote efectivo, semilla) permiten replicar el entrenamiento sobre el mismo checkpoint del modelo base.
- Base para adaptadores de nicho en proyectos de fan o linguistica computacional: el flujo de trabajo (adaptador sobre Qwen3-4B, datos de WordNet con licencia, particiones agrupadas) es reutilizable para otros pares de idiomas o dominios lexicos.
- Docencia sobre licencias de datos: el repositorio incluye un archivo NOTICE que separa la licencia del adaptador (Apache-2.0) de las condiciones de los datos de origen (JWN 1.1 y OEWN 2025), util como ejemplo de atribucion correcta.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica reportada es la perdida de validacion lexica (5,226292 antes, 1,973325 despues). El autor indica explicitamente `sentence_translation_accuracy: null` y `sentence_translation_improvement: not_demonstrated`.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; depende del modelo base Qwen3-4B-Instruct-2507 (aproximadamente 8 GB en BF16, menos en cuantizaciones de 4 bits) mas el adaptador LoRA (0,1 GB).
- GPU recomendadas: no especificadas por el autor. Por tamano del modelo base, cabria en GPU de consumo con suficiente VRAM, pero no hay datos confirmados en la informacion disponible.
- Cabida en GPU de consumo: no confirmada en la informacion proporcionada.
- Opciones de despliegue: la model card solo documenta el uso con `transformers` y `peft` (`PeftModel.from_pretrained`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No hay datos de rendimiento del adaptador que permitan una comparativa cuantitativa. Se listan alternativas del mismo ecosistema (adaptadores LoRA sobre Qwen3-4B-Instruct-2507) encontradas en la busqueda web, sin datos de rendimiento comparables en la informacion disponible.

| Modelo | Base | Tipo | Dominio | Licencia | Datos de rendimiento |
|---|---|---|---|---|---|
| uesenpai/qwen3-4b-wordnet-en-ja-lora-v1_fiXmArge | Qwen3-4B-Instruct-2507 | LoRA r8 a16 | Traduccion lexica en-ja (WordNet) | Apache-2.0 | Solo perdida de validacion lexica |
| TSerizawa/llm-lecture-2025_advanced_base_model_qwen3-4b-agent-trajectory-lora | Qwen3-4B | LoRA | Trayectorias de agente | no disponible | no disponible |
| yoei/qwen3-4b-structured-output-lora-v5 | Qwen3-4B-Instruct-2507 | QLoRA 4-bit (Unsloth) | Salida estructurada | no disponible | no disponible |

## Limitaciones y advertencias

- No es un modelo de traduccion validado: el autor declara `sentence_translation_improvement: not_demonstrated` y `sentence_translation_accuracy: null`; la mejora solo se observa en perdida de validacion lexica.
- La preservacion de calidad general no esta establecida (`general_quality_preservation_established: false`); en las 4 frases generales de autoria propia, las salidas con y sin adaptador fueron identicas.
- Persisten desajustes con palabras raras frente a la referencia de diccionario (`rare_word_dictionary_reference_mismatches_remain: true`).
- Se observa repeticion de alternativas hasta el limite de tokens (96) en el caso documentado como `x_ray_machine`.
- En el caso de traduccion ja→en de un mineral raro, ni el modelo base ni el adaptador coinciden con la referencia del diccionario; el autor advierte que la discrepancia de cadena exacta no prueba por si sola una traduccion incorrecta.
- No se ha realizado una evaluacion exhaustiva de calidad o seguridad (`exhaustive_quality_or_safety_evaluation: false`).
- La licencia Apache-2.0 del adaptador no sustituye las condiciones de los datos de origen (JWN 1.1 y OEWN 2025, esta ultima CC BY 4.0 con condiciones heredadas de Princeton WordNet); deben revisarse para uso comercial.
- El repositorio no incluye los pesos del modelo base ni el adaptador fusionado; es necesario descargar Qwen3-4B-Instruct-2507 en la revision fijada.
- Cero descargas y cero likes en el momento de la consulta: sin validacion por parte de la comunidad.
- La model card emplea terminologia criptica y estetica de fan ("Coword", "MeMe", "ConWas"), lo que dificulta la lectura rapida de los datos tecnicos.

## Enlaces

- Hugging Face: https://huggingface.co/uesenpai/qwen3-4b-wordnet-en-ja-lora-v1_fiXmArge
- Manifiesto de entrenamiento: https://huggingface.co/uesenpai/qwen3-4b-wordnet-en-ja-lora-v1_fiXmArge/blob/main/training_manifest.json
- Evaluacion: https://huggingface.co/uesenpai/qwen3-4b-wordnet-en-ja-lora-v1_fiXmArge/blob/main/evaluation.json
- Avisos de origen y licencias: https://huggingface.co/uesenpai/qwen3-4b-wordnet-en-ja-lora-v1_fiXmArge/blob/main/NOTICE
- Licencia del adaptador: https://huggingface.co/uesenpai/qwen3-4b-wordnet-en-ja-lora-v1_fiXmArge/blob/main/LICENSE
- Repositorio fiXmArge Translator: https://github.com/UESENPAI/fiXmArge-translator
- Modelo base Qwen3-4B-Instruct-2507: https://huggingface.co/Qwen/Qwen3-4B-Instruct-2507
- Japanese WordNet 1.1 (descargas): https://bond-lab.github.io/wnja/eng/downloads.html
- Japanese WordNet 1.1 (licencia): https://raw.githubusercontent.com/bond-lab/wnja/7ad6d75bda9a94fe208d6aa083b55baf891100b1/LICENSE
- Open English WordNet 2025 (licencia): https://raw.githubusercontent.com/globalwordnet/english-wordnet/2025-edition/LICENSE.md
- Princeton WordNet (licencia y uso comercial): https://wordnet.princeton.edu/license-and-commercial-use
- Obra de origen de fiXmArge: https://www.fwinc.co.jp/manosaba_CD/archives/983
