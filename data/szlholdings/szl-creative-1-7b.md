# SZLHOLDINGS/SZL-Creative-1.7B

## Resumen

SZL-Creative-1.7B es un adaptador QLoRA publicado por SZLHOLDINGS sobre el modelo base Qwen/Qwen3-1.7B, dentro de una campaña interna denominada W28T9 resurrection lane. No se trata de un modelo entrenado desde cero, sino de un ajuste fino mediante PEFT (rsLoRA con r=8 y alpha=16) aplicado sobre las proyecciones q/k/v/o y gate/up/down del transformer de Qwen3-1.7B. El adaptador se entrenó sobre el dataset SZLHOLDINGS/creativity-sft-v1 con un esquema de 120 pasos, learning rate 1e-4 y max_seq de 1536 tokens.

El modelo se presenta explícitamente como un artefacto en estado "MEASURED" (medido), no desplegado, y su model card insiste en que la finalización del entrenamiento no equivale a aprobación para despliegue. La única evaluación publicada es una batería de seis sondas (3 respondibles + 3 no respondibles) con un resultado de 4/6 y una loss de 0,9657. No se declaran benchmarks estándar ni comparativas con otros modelos.

Su relevancia es limitada y de nicho: sirve como ejemplo de ajuste fino ligero sobre Qwen3-1.7B con trazabilidad de recibos (training receipts) y una doctrina de "fail-closed" que evita métricas inventadas. Para producción real, el modelo base Qwen3-1.7B o adaptadores mejor documentados ofrecen garantías más sólidas. El repositorio tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen3-1.7B) con adaptador LoRA/rsLoRA (PEFT) |
| Parametros totales | 1,7B (modelo base) + adaptador LoRA r=8 (tamaño exacto del adaptador no disponible) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1536 tokens (max_seq de entrenamiento); contexto nativo del base no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (el adaptador se entrenó con carga 4-bit del base; no se listan formatos de cuantizacion del adaptador) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen/Qwen3-1.7B, un transformer decoder-only de 1,7 mil millones de parámetros. El ajuste es un QLoRA con rsLoRA (rank-stabilized LoRA) de r=8 y alpha=16, inyectado en las proyecciones de atención q/k/v/o y en las proyecciones MLP gate/up/down. La carga del modelo base se realizó en 4 bits, lo que reduce el footprint de memoria durante el entrenamiento. La semilla de entrenamiento es 20260721.

El entrenamiento se ejecutó en un nodo Massed Compute con GPU RTX A6000 (identificador 0a63cb475677), con un schedule de 120 pasos, learning rate 1e-4, batch 2x4 y max_seq de 1536 tokens. El dataset es SZLHOLDINGS/creativity-sft-v1 (train.jsonl, con sha256 13b88c630bcc8108...). No se documenta composición del dataset, número de tokens totales, ni si hubo RLHF/DPO. La model card incluye recibos de entrenamiento (training_receipt.json con formato szl.training_receipt.v2) y de evaluación (evaluations/estate-battery-6probe.json), lo que constituye la innovación metodológica principal: trazabilidad y doctrina fail-closed.

## Capacidades

- Generación de texto conversacional (pipeline text-generation, tag conversational).
- Ajuste orientado a "creatividad" según el nombre del dataset (creativity-sft-v1), aunque no se detallan las tareas concretas.
- Razonamiento y código: heredados del modelo base Qwen3-1.7B, no verificados en este adaptador.
- Tool calling / function calling: no documentado en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no documentado.
- Capacidades multilingües: no documentadas (idiomas no disponibles).
- Modo thinking: no documentado para este adaptador.
- Visión / audio: no soportado (modelo de texto).
- Evaluación de honestidad: batería de 6 sondas (3 respondibles, 3 no respondibles), resultado 4/6.

## Casos de uso

- Experimentación con PEFT y QLoRA: el adaptador sirve como ejemplo reproducible de ajuste rsLoRA r=8 sobre Qwen3-1.7B, útil para desarrolladores que quieran replicar el pipeline con recibos de entrenamiento verificables.
- Investigación sobre evaluación de honestidad: la batería de 6 sondas (answerable vs unanswerable) puede reutilizarse como plantilla para medir la tendencia del modelo a responder cuando no sabe, aunque el resultado 4/6 indica margen de mejora.
- Generación creativa de texto en prototipos: dado el dataset creativity-sft-v1, puede emplearse para borradores de texto creativo en entornos de baja criticidad, siempre con revisión humana.
- Docencia y formación: por su tamaño (1,7B) y licencia Apache-2.0, es adecuado para talleres sobre fine-tuning con PEFT en GPUs de gama media.
- Pruebas de integración de pipelines PEFT: el quickstart con AutoPeftModelForCausalLM permite validar flujos de carga de adaptadores en CI sin grandes recursos.
- Base para iteraciones propias: al ser Apache-2.0 y un adaptador ligero, un equipo puede partir de él y continuar el ajuste con su propio dataset, aunque debería re-evaluar desde cero.

## Benchmarks y rendimiento

| Probe set | Score | Loss (MEASURED) | Rows | Runtime |
|---|---|---|---|---|
| Estate battery: 3 answerable + 3 unanswerable | 4/6 | 0,9657763910169402 | 5 | 103,0 s |

Desglose por sonda: a1=PASS, a2=PASS, a3=PASS, u1=FAIL, u2=FAIL, u3=PASS. No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador es ligero (r=8), pero requiere cargar el base Qwen3-1.7B. En fp16, aproximadamente 3,4 GB solo para pesos; en 4-bit, alrededor de 1 GB. El adaptador añade una cantidad marginal (no cuantificada en la información).
- GPU recomendadas: RTX A6000 (usada en entrenamiento), A100, H100 para despliegue a escala; RTX 4090, RTX 3090 y GPUs con 8 GB o más para inferencia en cuantización 4-bit.
- Cabe en GPU de consumo: sí, en GPUs con al menos 8 GB en 4-bit; 16 GB en fp16 con margen para contexto.
- Opciones de despliegue: PEFT + transformers (quickstart oficial con AutoPeftModelForCausalLM), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama (requiere fusión previa del adaptador con el base y conversión a GGUF), TGI (soporte de adaptadores).
- Latencia y throughput: no disponibles. El único dato de runtime es 103,0 s para la batería de 6 sondas en la RTX A6000, que no es una medida de throughput representativa.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| SZL-Creative-1.7B | 1,7B + LoRA r=8 | 1536 (entrenamiento) | Apache-2.0 | HF, 0 descargas | Adaptador QLoRA, eval 4/6 en 6 sondas |
| Qwen/Qwen3-1.7B (base) | 1,7B | no disponible en la info | Apache-2.0 | HF, ampliamente usado | Base sin ajuste; benchmarks estándar públicos |
| Adaptadores LoRA genéricos sobre Qwen3-1.7B | 1,7B + LoRA | variable | variable | HF | Comparación no disponible por falta de datos |

No se dispone de datos de rendimiento comparables entre estos modelos en la información proporcionada; la comparativa se limita a parámetros, licencia y disponibilidad.

## Limitaciones y advertencias

- Estado "MEASURED, not deployed": el autor declara explícitamente que la finalización del entrenamiento no es aprobación para despliegue.
- Evaluación muy limitada: solo 6 sondas, con 2 fallos (u1, u2) en preguntas no respondibles, lo que sugiere riesgo de responder cuando no debería.
- Sin benchmarks estándar: no hay MMLU, HumanEval ni GSM8K, por lo que el rendimiento real en tareas generales es desconocido.
- Idiomas no documentados: no se puede garantizar calidad multilingüe.
- Contexto de entrenamiento corto (1536 tokens): puede degradarse en conversaciones largas.
- Dataset no documentado en composición ni tamaño: riesgo de sesgos desconocidos.
- Riesgo de alucinación: inherente a modelos de 1,7B y agravado por la falta de evaluación de honestidad robusta.
- Licencia Apache-2.0 permite uso comercial, pero el autor no ofrece garantías ni soporte; el estado del artefacto es experimental.
- 0 descargas y 0 likes: sin validación por parte de la comunidad.
- El nombre "resurrection lane" y la referencia a modelos eliminados ("deleted models stay deleted") indican un contexto organizativo interno que no aporta garantías técnicas al usuario externo.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/SZLHOLDINGS/SZL-Creative-1.7B
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Dataset: https://huggingface.co/datasets/SZLHOLDINGS/creativity-sft-v1
- Wave logs: https://huggingface.co/datasets/SZLHOLDINGS/wave-logs
- Organización: https://huggingface.co/SZLHOLDINGS
- GitHub: https://github.com/szl-holdings
- Evaluación: ./evaluations/estate-battery-6probe.json (dentro del repo)
- Recibos de entrenamiento: training_receipt.json (dentro del repo)
