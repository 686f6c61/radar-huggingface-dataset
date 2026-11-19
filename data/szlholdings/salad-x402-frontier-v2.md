# SZLHOLDINGS/salad-x402-frontier-v2

## Resumen

salad-x402-frontier-v2 es un adaptador LoRA (PEFT) entrenado sobre el modelo base Qwen/Qwen3-1.7B por SZLHOLDINGS, una organizacion que publica artefactos bajo lo que denomina "governed-AI training program" y una doctrina de "fail-closed measured-receipts". El objetivo declarado del adaptador es dotar al modelo base de capacidad para construir y decodificar flujos de pago x402, un protocolo de pagos HTTP basado en el codigo de estado 402 y en stablecoins sobre redes EVM (Base y Base Sepolia).

El modelo no es un modelo de produccion: el propio autor lo etiqueta como "candidate training artifact". El repositorio contiene una escalera de checkpoints (100 a 1000 pasos) mas un directorio `final/` con el adaptador LoRA, y 118 archivos en total, con un tamano de repo de 1,6 GB. La evaluacion publicada es un probe diferencial de cinco prompts ejecutado en una RTX A6000, no un benchmark formal.

La relevancia es acotada y muy especifica: demuestra un caso de fine-tuning de dominio estrecho sobre un modelo pequeno (1,7B parametros) para una tarea de protocolo financiero concreta (x402), con verificacion diferencial contra el modelo base. Es util como referencia metodologica de evaluacion diferencial y como ejemplo de adaptacion de bajo coste, no como modelo generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3) con adaptador LoRA (PEFT) |
| Parametros totales | 1,7B (modelo base Qwen3-1.7B); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada del base Qwen3-1.7B) |
| Tipos de cuantizacion | no disponible; el repo contiene safetensors del adaptador |
| Idiomas soportados | en |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA en `final/`, libreria transformers + peft) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-1.7B, un transformer decoder-only de la familia Qwen3. El entrenamiento se realizo mediante LoRA (Low-Rank Adaptation, PEFT), lo que mantiene congelados los pesos del modelo base y entrena solo matrices de bajo rango. El repositorio documenta una escalera de checkpoints en pasos de 100 hasta 1000, mas un checkpoint `final/`, lo que sugiere un seguimiento granular del entrenamiento con evaluacion intermedia.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF, DPO o preferencias. La evaluacion publicada es un "diff-eval" diferencial: se compara el modelo base contra el adaptador con decodificacion greedy identica, cinco prompts y un limite de generacion de 256 tokens. Cuatro prompts cubren construccion de pago x402, flujo HTTP 402, decodificacion de payment-requirements y verificacion por facilitator; el quinto es un control (capital de Francia) para detectar "domain bleed". El veredicto del autor es "capability acquired on this probe", con respuestas protocolo-especificas frente a respuestas nulas o confabulatorias del base.

## Capacidades

- Generacion de texto en ingles sobre el modelo base Qwen3-1.7B.
- Construccion de payloads de pago x402 v2: uso de `PAYMENT-REQUIRED`, identificacion de red Base (`eip155:8453`) y Base Sepolia (`eip155:84532`), conversion de importes a unidades base (0,50 USDC a `500000`) y descripcion de `transferWithAuthorization` (EIP-3009).
- Decodificacion de requisitos HTTP 402 en Base64 JSON y comprobacion de red, activo, importe, timeout y politica de gasto antes del pago.
- Generacion de la estructura `paymentPayload` de x402 v2 y de una peticion de verificacion a facilitator.
- Control de dominio: responde correctamente a preguntas fuera del dominio x402 (probe de Francia) sin sangrado del protocolo.
- No se documentan capacidades de tool calling, agentes multi-paso, vision, audio ni modo thinking en la informacion proporcionada.

## Casos de uso

- Prototipado de clientes x402: el adaptador puede generar payloads de pago y decodificar requisitos 402 en entornos de prueba sobre Base Sepolia, lo que acelera el desarrollo de integraciones antes de conectar fondos reales.
- Generacion de fixtures y tests de protocolo: sirve para producir ejemplos de `paymentPayload` y de cabeceras `PAYMENT-REQUIRED` que alimenten suites de pruebas de un facilitator o de un servidor de recursos.
- Educacion y documentacion tecnica: puede redactar explicaciones de flujo HTTP 402 y de EIP-3009 a partir de prompts, util para material formativo interno sobre pagos programables.
- Evaluacion metodologica de fine-tuning: como referencia de como disenar un diff-eval con control de dominio y checkpoints intermedios para validar adaptadores de bajo coste.
- Asistente de revision de politicas de gasto: con prompts adecuados, puede comprobar campos de red, activo, importe y timeout en una solicitud de pago antes de aprobarla, en un pipeline de validacion.
- Investigacion sobre especializacion de modelos pequenos: permite estudiar cuanto conocimiento de protocolo se puede inyectar en un modelo de 1,7B con LoRA y medirlo con probes diferenciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica evaluacion es un diff-eval cualitativo de cinco prompts (cuatro de protocolo x402 y un control) ejecutado en una RTX A6000, con veredicto "ok" y "capability acquired on this probe". El autor indica explicitamente que no es una afirmacion de grado benchmark ni establece seguridad de produccion, liquidacion de pagos o readiness de serving.

## Requisitos de hardware

- Inferencia del modelo base Qwen3-1.7B en precision completa (fp16/bf16): aproximadamente 3,4 GB de VRAM solo para pesos, mas overhead de activaciones y KV cache.
- El adaptador LoRA anade una huella minima adicional (repo de 1,6 GB incluye checkpoints intermedios; el adaptador `final/` es mucho menor).
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 con holgura; tambien en GPUs profesionales como RTX A6000 (usada en la evaluacion) y A100/H100 para serving concurrente.
- Despliegue: transformers + peft para cargar el adaptador; para serving de alto throughput, vLLM o TGI con soporte de adaptadores LoRA; llama.cpp/Ollama requeririan fusionar el adaptador en el base y convertir a GGUF.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| salad-x402-frontier-v2 | 1,7B + LoRA | no disponible | Pagos x402 (ingles) | apache-2.0 | Hugging Face (artefacto candidato) |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible | Generalista | apache-2.0 | Hugging Face |
| Adaptadores LoRA de dominio genericos | variable | heredado del base | variable | variable | Hugging Face |

La comparacion directa con alternativas especializadas en x402 no esta disponible: no se conocen adaptadores publicos equivalentes en la informacion proporcionada. Frente a su modelo base, la diferencia medida es cualitativa (respuestas protocolo-especificas frente a respuestas nulas o confabulatorias en los cuatro probes x402).

## Limitaciones y advertencias

- Artefacto candidato, no modelo de produccion: el autor declara que no establece seguridad, liquidacion de pagos ni readiness de serving.
- Evaluacion de cinco prompts: no es benchmark-grade; el propio autor lo califica como probe diferencial y no una afirmacion de rendimiento general.
- Solo ingles: el campo `language` del repo indica unicamente `en`.
- Riesgo de alucinacion en datos financieros: aunque el probe muestra respuestas correctas en importes y redes, un modelo de 1,7B puede generar direcciones, chain IDs o importes incorrectos fuera de los casos evaluados; no debe usarse para ejecutar pagos reales sin validacion externa.
- Sesgos: no se documentan sesgos especificos, pero hereda los del modelo base Qwen3-1.7B.
- Licencia apache-2.0: permite uso comercial, pero el autor no garantiza idoneidad para produccion; conviene revisar los receipts de procedencia en `SZLHOLDINGS/frontier-54-runs`.
- Merge y serving son decisiones "owner-gated" segun el autor: el adaptador no se distribuye fusionado.
- Contexto maximo no documentado en la ficha del adaptador; depende del base Qwen3-1.7B.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/SZLHOLDINGS/salad-x402-frontier-v2
- Dataset de receipts (frontier-54-runs): https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Receipt diff-eval v2: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/mesh/evals/x402-frontier-v2-diff-eval-20261116T114256Z.json
- Registro Zenodo (estate thesis): https://doi.org/10.5281/zenodo.19944926
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
