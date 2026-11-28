# SZLHOLDINGS/chaski-r4

## Resumen

Chaski-R4 es un adaptador LoRA de tipo SFT (supervised fine-tuning) publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3.5-0.8B. No se trata de un modelo completo, sino de un conjunto de pesos de adaptador (192 tensores, según la evidencia declarada) que se aplica sobre el modelo base para especializarlo en dos tareas muy concretas: la generación de borradores JSON que cumplen un contrato estructural predefinido y la emisión de prefijos de rechazo ante entradas adversariales. El repositorio se etiqueta explícitamente como `experimental` y `research-only`, y la propia model card declara `production_disposition: HOLD`, `promotion: NOT_PROMOTABLE` y `publication_eligible: false`.

El modelo es relevante no por su rendimiento general, sino como artefacto de investigación sobre evaluación reproducible: toda la evidencia está vinculada a un commit concreto de un repositorio GitHub (szl-forge), con hashes SHA-256 de los pesos del adaptador, del config, del dataset de evaluación y del recibo de ejecución. La evaluación publicada es lo que el autor denomina "named-N contract gate": un conjunto de 5 borradores JSON y 6 entradas adversariales, con resultados de 5/5 y 6/6 respectivamente, ejecutados por el propio autor y marcados como `verified: false` e `independent_evaluation: false`.

La información disponible es escasa en cuanto a arquitectura interna, datos de entrenamiento y capacidades generales. El modelo base Qwen3.5-0.8B aporta la arquitectura y el conocimiento subyacente, pero la model card no documenta ni el número de tokens de entrenamiento, ni la composición del dataset `SZLHOLDINGS/verticals-sft-v1`, ni hiperparámetros del SFT. Todo lo que sigue se limita a lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre Qwen/Qwen3.5-0.8B; clase de modelo base Qwen3_5ForConditionalGeneration, wrapper PeftModelForCausalLM |
| Parametros totales | No disponible (adaptador de 192 tensores; el modelo base tiene 0,8B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-0.8B, no documentada en la ficha) |
| Tipos de cuantizacion | Entrenado en bf16-LoRA (qlora: false); no se documentan otras cuantizaciones |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |
| Modelo base | Qwen/Qwen3.5-0.8B (revision 2fc06364715b967f1860aea9cf38778875588b17) |
| Dataset de entrenamiento | SZLHOLDINGS/verticals-sft-v1 |
| Tipo de ajuste | SFT (supervised fine-tuning) con LoRA |
| Estado del artefacto | PUBLIC_EXPERIMENTAL_ARTIFACT, research-only |
| Descargas / likes | 394 descargas, 0 likes |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA entrenado con SFT sobre el modelo base Qwen3.5-0.8B, en precisión bf16 y sin QLoRA. La model card declara 192 tensores de adaptador en el checkpoint y 192 tensores aplicados, lo que sugiere una cobertura completa de las capas objetivo del adaptador. No se documentan ni el rango del LoRA, ni el alpha, ni las capas objetivo, ni la tasa de aprendizaje, ni el número de pasos o épocas.

El entrenamiento se realizó sobre el dataset `SZLHOLDINGS/verticals-sft-v1`, del cual no se publica composición, tamaño ni número de tokens. La evidencia declara `held_out_in_gradients: false`, es decir, que el conjunto de evaluación no habría participado en los gradientes, aunque esta afirmación no está verificada de forma independiente. No se menciona RLHF, DPO ni ninguna otra fase de alineación posterior al SFT. La única innovación técnica destacable es el aparato de procedencia: hashes SHA-256 del directorio del adaptador, de los pesos, del config, del dataset de evaluación y del recibo de ejecución, vinculados a un commit concreto del repositorio szl-forge.

## Capacidades

- Generación de texto condicionada al modelo base Qwen3.5-0.8B; el adaptador no añade capacidades generales nuevas.
- Generación de borradores JSON que cumplen un contrato estructural predefinido (evaluado en 5/5 casos del gate del autor).
- Emisión de prefijos de rechazo ante entradas adversariales (evaluado en 6/6 casos del gate del autor).
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingües: solo inglés declarado; el modelo base Qwen3.5-0.8B podría tener otras, pero la ficha no lo documenta.
- Modo thinking, visión o audio: no disponible (no documentado).
- Capacidad de benchmark estándar: no ejecutada (`standard_benchmarks: NOT_RUN`).

## Casos de uso

- Validación de contratos JSON en pipelines de datos: el adaptador puede generar borradores que respetan un esquema estructural fijo, lo que permite usarlo como generador de payloads de prueba en sistemas que validan JSON Schema antes de aceptar la entrada.
- Filtrado de entradas adversariales en etapas tempranas: el gate de prefijos de rechazo (6/6) sugiere un uso como primera barrera de saneamiento en un pipeline de moderación, siempre que se acepte que la evidencia es del propio autor y de tamaño N muy reducido.
- Investigación sobre evaluación reproducible: el valor principal del artefacto es servir como ejemplo de trazabilidad (hashes de pesos, dataset y recibo), útil para equipos que diseñan sus propios "named-N gates" en lugar de benchmarks agregados.
- Docencia y formación en MLOps: el repositorio ilustra el ciclo completo de un adaptador PEFT con evidencia criptográfica, adecuado para talleres sobre procedencia de modelos.
- Pruebas de integración de PEFT: al ser un adaptador pequeño sobre un modelo de 0,8B, sirve para validar pipelines de carga con `PeftModelForCausalLM` en entornos de CI sin coste elevado de GPU.
- Prototipado de asistentes con formato estricto: en entornos controlados donde la salida deba ser JSON validable y el dominio esté acotado, el adaptador puede reducir la tasa de JSON inválido respecto al modelo base, aunque no hay benchmark que lo demuestre fuera del gate del autor.

No se recomienda su uso en producción: la propia ficha declara `production_disposition: HOLD` y `promotion: NOT_PROMOTABLE`.

## Benchmarks y rendimiento

Los únicos datos disponibles son los declarados por el autor en el model-index, ejecutados por el propio autor (`verified: false`, `independent_evaluation: false`, `capability_benchmark: false`).

| Benchmark | Métrica | Resultado | Conjunto | Verificado |
|---|---|---|---|---|
| JSON draft contract validation | Tasa de borradores JSON válidos según contrato | 1,0 (5/5) | SZL Chaski named-N JSON draft gate, held-out | No |
| Adversarial refusal-prefix gate | Tasa de prefijos de rechazo | 1,0 (6/6) | SZL Chaski named-N adversarial refusal gate, held-out | No |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de ningún benchmark estándar (`standard_benchmarks: NOT_RUN`). No se han publicado comparaciones con modelos similares en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un adaptador sobre un modelo base de 0,8B, la inferencia en bf16 requiere del orden de 2 GB de VRAM para los pesos del modelo base más el adaptador; en cuantización de 4 bits del modelo base, por debajo de 1 GB. Estas cifras son estimaciones a partir del tamaño del modelo base, no datos publicados por el autor.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 4060) es suficiente para el modelo base en bf16 o cuantizado; A100/H100 no son necesarias.
- Cabe en GPU consumer: sí, con margen amplio, dado el tamaño del modelo base.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor); llama.cpp y Ollama requerirían fusionar el adaptador con el modelo base y convertirlo a GGUF, lo que no está documentado en la ficha; vLLM y TGI admiten adaptadores LoRA en algunos casos, pero no hay confirmación para este artefacto.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparables para este adaptador. La comparación se limita a características estructurales.

| Modelo | Parámetros | Contexto | Licencia | Estado | Evaluación |
|---|---|---|---|---|---|
| SZLHOLDINGS/chaski-r4 | Adaptador sobre 0,8B | No disponible | Apache 2.0 | Experimental, research-only, HOLD | Gate propio N=5 y N=6, no verificado |
| Qwen/Qwen3.5-0.8B (base) | 0,8B | No disponible en esta ficha | Según el modelo base | Modelo completo | Benchmarks del autor del base |
| Adaptadores LoRA comunitarios sobre modelos <1B | Variable | Heredado del base | Variable | Variable | Habitualmente sin evaluación publicada |

No se identifican en la información proporcionada alternativas directamente comparables con el mismo tipo de evidencia (recibos con hashes) y el mismo alcance de evaluación.

## Limitaciones y advertencias

- Evaluación no independiente: los resultados 5/5 y 6/6 proceden de una ejecución del propio autor, marcados como `verified: false`, con `independent_evaluation: false` y `capability_benchmark: false`.
- Tamaño de evaluación mínimo: 5 borradores JSON y 6 entradas adversariales no permiten inferir tasas de acierto estables; un solo fallo cambiaría el resultado a 4/5 o 5/6.
- Sin benchmark estándar: `standard_benchmarks: NOT_RUN`; no hay MMLU, HumanEval ni GSM8K, por lo que no se puede situar el modelo frente a alternativas.
- Estado de promoción bloqueado: `promotion: NOT_PROMOTABLE`, `publication_eligible: false`, `autonomy_eligible: false`, `production_disposition: HOLD` y `release_blocker: RECEIPTS_A_B_PROVENANCE_UNRESOLVED_AND_PROMOTION_NOT_TAKEN`.
- Idiomas: solo se declara inglés; no hay evidencia de comportamiento en castellano ni en otras lenguas.
- Riesgo de alucinación: no evaluado (`semantic_correctness_measured: false`); el gate mide validez estructural del JSON, no corrección semántica del contenido.
- Sesgos: no documentados; al heredar el modelo base Qwen3.5-0.8B, arrastra los sesgos de este, que la ficha no describe.
- Licencia: Apache 2.0 en el adaptador, pero el uso comercial está condicionado por la licencia del modelo base Qwen3.5-0.8B, que debe verificarse por separado.
- Procedencia parcial: la evidencia declara `SIGNED: GAP` y `HELD-OUT: GAP` en su propia estructura de evidencia, pese a que el texto afirma `held_out_in_gradients: false`.
- Nomenclatura: el nombre en quechua "Hamut'aq r4" es solo de visualización y no implica un modelo distinto del repositorio `SZLHOLDINGS/chaski-r4`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SZLHOLDINGS/chaski-r4
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-0.8B
- Dataset de entrenamiento declarado: https://huggingface.co/datasets/SZLHOLDINGS/verticals-sft-v1
- Repositorio de evidencia (szl-forge): https://github.com/szl-holdings/szl-forge
- Recibo de la ejecución canónica: https://github.com/szl-holdings/szl-forge/blob/e7096cbd500eaf3c358daa245955e7fe1d26c8dc/chaski_r4/evidence/canonical_rerun_20261001_140615.receipt.json
- Evaluador declarado (ruta en el repositorio): chaski/bakeoff_named_n.py en la revisión 55c3027b048b9d55fa08519b3dd12bb53cb91f5a
