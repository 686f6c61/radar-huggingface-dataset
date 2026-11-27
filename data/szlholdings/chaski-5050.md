# SZLHOLDINGS/chaski-5050

## Resumen

chaski-5050 es un adaptador LoRA (PEFT) publicado por SZL Holdings sobre el modelo base Qwen/Qwen3.5-0.8B, un transformer denso de aproximadamente 752 millones de parámetros. El repositorio se distribuye como pesos fusionados (merged) listos para cargar con `transformers`, además de contener los artefactos del adaptador y las recepciones (receipts) de entrenamiento y fusión. Su propósito declarado es servir como base de fusión 50/50 dentro de la familia chaski del autor, no como un modelo generalista de producción.

El modelo se ha ajustado con el dataset propietario SZLHOLDINGS/verticals-sft-v1 y presenta una pérdida de entrenamiento medida de 2,228, según la model card. La organización lo etiqueta explícitamente como `proposal-only` y `research-only`, con `publication_eligible: false` y `autonomy_eligible: false`, lo que indica que el autor no lo considera validado para despliegue autónomo ni para publicación como resultado científico. La única evaluación con puntuación publicada es una batería interna de 6 pruebas en la que obtiene 4/6.

Su relevancia práctica es limitada pero concreta: es un ejemplo de pipeline de ajuste fino con trazabilidad de artefactos (receipts de entrenamiento, fusión y benchmark enlazados), y resulta útil para quienes quieran reproducir el flujo LoRA sobre Qwen3.5-0.8B o inspeccionar cómo se documenta un adaptador con gobernanza estricta. No obstante, la ausencia de benchmarks estándar (MMLU, HumanEval, GSM8K) y de evaluación separada impide compararlo con alternativas consolidadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer denso (Qwen3.5), ajustado mediante LoRA/PEFT y fusionado |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo publica safetensors; no se documentan GGUF ni AWQ/GPTQ) |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT y pesos fusionados) |

## Arquitectura y entrenamiento

El modelo parte de Qwen/Qwen3.5-0.8B, un transformer decoder-only denso de 0,8 mil millones de parámetros. Sobre esa base se aplicó un ajuste fino con LoRA (biblioteca PEFT, con artefactos también en `adapter-unsloth/`), y posteriormente se realizó una fusión 50/50 documentada en `merge_receipt.json`. El resultado se publica como pesos fusionados cargables directamente con `AutoModelForCausalLM`, además del adaptador con hash SHA-256 verificado (`620b3488...f0df5`).

Los datos de entrenamiento provienen de SZLHOLDINGS/verticals-sft-v1, un corpus propietario del que no se detalla composición, número de tokens ni proceso de filtrado. No se documenta RLHF, DPO ni ninguna etapa de alineación adicional. La pérdida final de entrenamiento reportada es 2,228136855544466, marcada como MEASURED. La model card declara `evals: HISTORICAL_TRAINING_NONE_SEPARATE_GATE_FAIL`, lo que indica que no superó una puerta de evaluación separada. No se describen innovaciones técnicas como decodificación especulativa o atención lineal.

## Capacidades

- Generación de texto conversacional en inglés, heredada del modelo base Qwen3.5-0.8B.
- Ajuste orientado a dominios verticales mediante el dataset `verticals-sft-v1`, aunque la model card no detalla qué verticales cubre.
- Soporte de tool calling y function calling: no disponible en la documentación.
- Soporte de agentes y razonamiento multi-paso: no disponible; el autor lo marca explícitamente como no apto para autonomía (`autonomy_eligible: false`).
- Capacidades multilingües: limitadas al inglés según el campo `language`.
- Capacidades especiales (modo thinking, visión, audio): no disponibles.
- Carga como adaptador PEFT sobre el modelo base o como pesos fusionados.

## Casos de uso

- Reproducción de pipelines LoRA: sirve como referencia completa de un flujo de ajuste fino con recepciones verificables (`training_receipt.json`, `merge_receipt.json`), útil para equipos que quieran auditar cómo se documenta un adaptador de principio a fin.
- Investigación sobre gobernanza de modelos: el etiquetado `proposal-only`, `research-only` y los campos de elegibilidad permiten estudiar esquemas de declaración de artefactos y control de publicación en modelos pequeños.
- Experimentación académica con modelos de 0,8B: al caber en GPU de consumo, permite probar técnicas de fusión de pesos (merge 50/50) sin infraestructura dedicada.
- Generación de texto en inglés para prototipos internos: conversación básica y tareas de texto simple donde no se requiera alta fiabilidad ni evaluación formal.
- Base para ajustes posteriores: al estar publicado como adaptador PEFT, puede reutilizarse como punto de partida para nuevos ajustes sobre Qwen3.5-0.8B en dominios específicos.
- Docencia y demostraciones de MLOps: el repositorio incluye gráficos de métricas, leaderboards de organización y enlaces a datasets de recepciones, lo que lo convierte en un ejemplo didáctico de trazabilidad, aunque no de rendimiento.

## Benchmarks y rendimiento

| Evaluacion | Resultado | Estado | Notas |
|---|---|---|---|
| mass-battery-chaski_5050_v2_trained | 4/6 | MEASURED | Batería interna de 6 pruebas sobre SZLHOLDINGS/verticals-sft-v1 |
| MMLU | no disponible | - | No publicado |
| HumanEval | no disponible | - | No publicado |
| GSM8K | no disponible | - | No publicado |

No se han publicado resultados de benchmarks estándar en la información disponible. La única métrica verificable es la pérdida de entrenamiento (2,228) y la batería interna de 6 pruebas, sin detalle de qué evalúa cada una.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,5 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 4 GB según longitud de contexto.
- VRAM estimada en cuantización de 8 bits: alrededor de 0,8-1 GB para pesos.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM; RTX 3060, RTX 4060, RTX 4090, A100 y H100 son sobradas para este tamaño.
- Cabe en GPU de consumo: sí, en la mayoría de tarjetas modernas con 6 GB o más.
- Opciones de despliegue: `transformers` con `device_map="auto"` (documentado por el autor), vLLM, TGI y llama.cpp si se convierte a GGUF (no se publican pesos GGUF en el repo).
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Evaluacion publica | Disponibilidad |
|---|---|---|---|---|---|
| chaski-5050 | 752 M | no disponible | apache-2.0 | 4/6 en batería interna | Hugging Face (721 descargas) |
| Qwen/Qwen3.5-0.8B (base) | ~800 M | no disponible en esta ficha | según modelo base | benchmarks del autor original | Hugging Face |
| Adaptadores LoRA genéricos sobre Qwen3.5-0.8B | ~800 M | depende del base | variable | habitualmente sin evaluar | Hugging Face |

La comparación con alternativas consolidadas no es posible con rigor: no hay benchmarks estándar publicados para chaski-5050 y el autor lo declara no elegible para publicación. Frente al modelo base, la única diferencia documentada es el ajuste con `verticals-sft-v1` y la fusión 50/50, sin evidencia de mejora medible en tareas estándar.

## Limitaciones y advertencias

- El autor declara explícitamente `publication_eligible: false` y `autonomy_eligible: false`: no debe usarse en sistemas autónomos ni presentarse como resultado validado.
- La evaluación separada falló (`evals: HISTORICAL_TRAINING_NONE_SEPARATE_GATE_FAIL`), por lo que no hay garantía de calidad fuera del conjunto de entrenamiento.
- Riesgo de alucinación y sobreajuste al corpus `verticals-sft-v1`, cuya composición y tamaño se desconocen.
- Sesgos: no documentados; al ser un ajuste sobre un modelo base pequeño y con datos propietarios, los sesgos del corpus de ajuste no son auditables.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otros idiomas no está evaluado.
- Longitud de contexto: no documentada; no se debe asumir la del modelo base sin verificación.
- Licencia apache-2.0 permite uso comercial, pero las etiquetas `research-only` y `proposal-only` de la model card expresan una restricción de intención del autor que conviene respetar.
- El repositorio incluye artefactos de gobernanza y gráficos generados automáticamente; parte de la información de la card (leaderboards, badges) es promocional y no constituye evidencia de rendimiento.
- No se publican pesos cuantizados ni formato GGUF, lo que limita el despliegue en entornos con `llama.cpp` sin conversión previa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-5050
- Organización en Hugging Face: https://huggingface.co/SZLHOLDINGS
- Repositorio GitHub del autor: https://github.com/szl-holdings
- Dataset de ajuste: https://huggingface.co/datasets/SZLHOLDINGS/verticals-sft-v1
- Recepción de entrenamiento: https://huggingface.co/SZLHOLDINGS/chaski-5050/blob/main/training_receipt.json
- Recepción de fusión: https://huggingface.co/SZLHOLDINGS/chaski-5050/blob/main/merge_receipt.json
- Recepción de entrenamiento (Unsloth): https://huggingface.co/SZLHOLDINGS/chaski-5050/blob/main/adapter-unsloth/training_receipt.json
- Benchmark interno: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/benchmark/mass-battery-chaski_5050_v2_trained.json
- Recepción de batería (laptop LoRA): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-chaski_5050_laptop_lora.json
- Recepción de batería (estate SFT): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-chaski_5050_estate_sft_v1.json
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
