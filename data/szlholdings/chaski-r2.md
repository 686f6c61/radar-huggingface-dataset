# SZLHOLDINGS/chaski-r2

## Resumen

chaski-r2 es un adaptador LoRA (presentado en el repositorio como pesos fusionados, "MERGED") desarrollado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. Se distribuye como un ajuste fino supervisado (SFT) orientado a generacion de texto conversacional en ingles, entrenado con el dataset propietario SZLHOLDINGS/verticals-sft-v1 y la libreria PEFT/TRL con soporte de Unsloth. El modelo cuenta con 752.393.024 parametros totales segun los pesos en safetensors y un repositorio de 6,1 GB.

La relevancia de esta ficha es acotada y conviene ser explicito: la model card del autor incluye etiquetas como `proposal-only` y `research-only`, declara `publication_eligible: false` y `autonomy_eligible: false`, y describe los resultados de evaluacion como `HISTORICAL_OWNER_RECORDS_UNQUALIFIED`. Es decir, el propio publicador desaconseja tratarlo como un artefacto listo para produccion o para publicacion. Las cifras de rendimiento que aparecen en la card (por ejemplo, 3/6 en una "mass-battery" o 11/12 en un "frontier_gpu_summary") no son benchmarks estandar y no permiten comparacion directa con MMLU, HumanEval o GSM8K.

Por tanto, chaski-r2 debe evaluarse como un experimento de ajuste fino de bajo coste sobre un modelo pequeno de la familia Qwen3.5, util para quien quiera inspeccionar la metodologia de SFT del autor o reproducir el pipeline, no como un modelo de proposito general competitivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Qwen/Qwen3.5-0.8B), ajuste mediante LoRA/SFT |
| Parametros totales | 752.393.024 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Entrenamiento en bf16-LoRA (qlora: false); no se documentan cuantizaciones publicadas (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Ingles (`language: en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repositorio PEFT; la card indica pesos fusionados cargables con `AutoModelForCausalLM`) |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del Qwen3.5-0.8B, un transformer decoder-only de la familia Qwen3.5. El ajuste se realizo con LoRA en precision bf16 (sin QLoRA), usando las librerias transformers, TRL y Unsloth, y el dataset SZLHOLDINGS/verticals-sft-v1. La card indica que el entrenamiento se completo con una perdida final de entrenamiento de 1,4571, verificada mediante un recibo de entrenamiento (`adapter-unsloth/training_receipt.json`). No se especifican el numero de tokens de entrenamiento, la composicion del corpus ni si hubo etapas de RLHF o DPO; solo se declara SFT.

La innovacion metodologica que reclama el autor no es arquitectonica sino de gobernanza: un enfoque "receipts-first, fail-closed" en el que cada metrica publicada debe enlazar a un fichero de evidencia medido, y la declaracion explicita de doctrina interna (`doctrine: v11-LOCKED`, `lambda: Conjecture 1 — advisory, never a theorem`). El repositorio se presenta como "MERGED" aunque la libreria declarada sea `peft`, lo que introduce ambiguedad sobre si los pesos publicados son el adaptador o la fusion con el base; la seccion Quickstart sugiere carga directa con `AutoModelForCausalLM`, consistente con pesos fusionados.

## Capacidades

- Generacion de texto conversacional en ingles, heredada del modelo base Qwen3.5-0.8B y ajustada con datos SFT del autor.
- Ajuste orientado a "verticales" (el dataset se llama `verticals-sft-v1`), lo que sugiere dominio conversacional acotado mas que conocimiento general.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documenta capacidad multilingue; la card declara unicamente ingles.
- No se documenta vision, audio ni modo "thinking".
- No se documenta ventana de contexto especifica; se heredaria la del base, pero el valor no se indica en la informacion disponible.

## Casos de uso

- Evaluacion de pipelines de SFT: sirve como caso de estudio reproducible para comparar recetas de LoRA con Unsloth y TRL sobre un base de 0,8 B, revisando los recibos de entrenamiento incluidos en el repositorio.
- Prototipado de asistentes conversacionales de dominio acotado en ingles: al partir de un base pequeno y haber sido ajustado con un corpus de "verticales", puede emplearse para experimentar con respuestas de estilo consistente en un nicho concreto, siempre con validacion humana.
- Generacion de texto en entornos con recursos muy limitados: con 752 M de parametros, es viable en GPU de consumo y en CPU con cuantizacion, lo que permite desplegarlo en portatiles para demos internas.
- Investigacion sobre gobernanza de artefactos de IA: el repositorio documenta doctrina, recibos y estados de elegibilidad, y puede usarse como ejemplo de trazabilidad de afirmaciones en model cards.
- Filtrado o clasificacion de texto auxiliar: un modelo de este tamano puede adaptarse como componente secundario en pipelines de preprocesado, aunque requeriria un ajuste adicional especifico.
- Educacion y formacion: util para explicar en talleres como se construye y se documenta un adaptador LoRA sobre un modelo Qwen, incluyendo la lectura critica de metricas no estandar.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible. Los unicos datos numericos del repositorio son internos y no comparables:

| Recibo | Resultado | Naturaleza |
|---|---|---|
| eval_merged_measured.json | sin puntuacion publicada | evaluacion interna |
| eval_named_n_generate.json | PASS | prueba de generacion nombrada |
| frontier_gpu_summary.json | 11/12 | resumen interno de GPU |
| mass-battery-chaski_r2_v2_trained.json | 3/6 | bateria interna (variante v2-trained) |
| Perdida final de entrenamiento | 1,4571 | metrica de entrenamiento, no de evaluacion |

El autor califica estos registros como `HISTORICAL_OWNER_RECORDS_UNQUALIFIED`, por lo que no deben interpretarse como evidencia de calidad del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en bf16: aproximadamente 1,5 GB solo para pesos (752 M de parametros), mas overhead de activaciones y cache KV; en la practica, entre 2 y 4 GB segun longitud de secuencia y batch.
- En cuantizacion de 8 bits: alrededor de 0,8-1 GB de pesos; en 4 bits, en torno a 0,4-0,5 GB, aunque el autor no publica artefactos cuantizados.
- GPU recomendadas: cualquier GPU con 8 GB o mas es suficiente; RTX 3060/4060, RTX 4090, A100 y H100 funcionan sin problema, con la salvedad de que el modelo no aprovecha el hardware de gama alta.
- Cabe holgadamente en GPU de consumo, incluidos portatiles con 6-8 GB de VRAM, y es viable en CPU para inferencia de baja concurrencia.
- Opciones de despliegue: transformers (soporte nativo declarado), vLLM y TGI son viables al ser una arquitectura Qwen estandar; llama.cpp y Ollama requeririan convertir los pesos a GGUF, conversion no publicada por el autor.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| SZLHOLDINGS/chaski-r2 | 752 M | no disponible | Apache 2.0 | Adaptador SFT sobre Qwen3.5-0.8B, etiquetado research-only |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible en esta ficha | segun el base | Modelo original sin ajuste; referencia directa de comparacion |
| Qwen2.5-0.5B / 1.5B | 0,5 B / 1,5 B | 32 K (serie Qwen2.5) | Apache 2.0 | Alternativas de tamano similar con benchmarks publicados y amplio ecosistema |
| Llama 3.2 1B | 1,2 B | 128 K | Llama 3.2 Community License | Base pequeno con evaluaciones publicas y soporte amplio en llama.cpp |

La comparacion de rendimiento con estas alternativas no es posible: chaski-r2 no publica benchmarks estandar y su propio autor descalifica los registros internos. La ventaja practica frente al base Qwen3.5-0.8B seria el ajuste de estilo y dominio, no una mejora demostrada en tareas generales.

## Limitaciones y advertencias

- El autor marca el modelo como `proposal-only` y `research-only`, con `publication_eligible: false` y `autonomy_eligible: false`: no esta pensado para produccion ni para uso autonomo.
- Los resultados de evaluacion estan etiquetados como `HISTORICAL_OWNER_RECORDS_UNQUALIFIED`; no hay benchmarks estandar ni comparaciones verificables de forma independiente.
- Idioma limitado al ingles segun la card; el rendimiento en castellano no esta documentado y probablemente sea deficiente.
- Longitud de contexto no documentada; no debe asumirse la del base sin verificacion empirica.
- Riesgo de alucinacion inherente a un modelo de 0,8 B ajustado con SFT sobre un corpus acotado; la card no incluye evaluaciones de factualidad.
- Sesgos: no se documenta ninguna evaluacion de sesgo, toxicidad o seguridad.
- Ambiguedad sobre el artefacto: la libreria es `peft` pero la card lo describe como "MERGED" y ofrece codigo de carga como modelo completo; conviene verificar la estructura real del repositorio antes de integrarlo.
- Licencia Apache 2.0 permite uso comercial del artefacto, pero el estado research-only del autor y la ausencia de evaluaciones desaconsejan ese uso sin validacion propia.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ), lo que anade trabajo si se quiere desplegar fuera de transformers.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-r2
- Organizacion en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub del autor: https://github.com/szl-holdings
- Dataset de entrenamiento: https://huggingface.co/datasets/SZLHOLDINGS/verticals-sft-v1
- Recibo de entrenamiento: https://huggingface.co/SZLHOLDINGS/chaski-r2/blob/main/training_receipt.json
- Evaluacion fusionada: https://huggingface.co/SZLHOLDINGS/chaski-r2/blob/main/eval_merged_measured.json
- Evaluacion de generacion nombrada: https://huggingface.co/SZLHOLDINGS/chaski-r2/blob/main/eval_named_n_generate.json
- Resumen de GPU: https://huggingface.co/SZLHOLDINGS/chaski-r2/blob/main/frontier_gpu_summary.json
- Bateria interna (mass-battery): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/mass-battery-chaski_r2_v2_trained.json
- Bateria estate (laptop-lora): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-chaski_r2_laptop_lora.json
- Bateria estate (estate-sft-v1): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-chaski_r2_estate_sft_v1.json
- Recibo de vinculacion del adaptador: https://huggingface.co/SZLHOLDINGS/chaski-r2/blob/main/evidence/2026-09-25-adapter-binding/receipt.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
