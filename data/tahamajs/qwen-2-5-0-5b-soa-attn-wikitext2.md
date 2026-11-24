# tahamajs/qwen-2.5-0.5b-soa-attn-wikitext2

## Resumen

`tahamajs/qwen-2.5-0.5b-soa-attn-wikitext2` es un checkpoint experimental publicado por el autor independiente tahamajs dentro del proyecto NeuralOps "Attention Zoo". No es un modelo entrenado desde cero: se parte de `Qwen/Qwen2.5-0.5B` y se sustituyen quirúrgicamente 18 de sus 24 capas de atención por el módulo `SOAAttention` (Shared Orthogonal Attention), que factoriza las proyecciones densas Q, K y V en pares de cuello de botella de bajo rango inicializados mediante SVD truncada a partir de los pesos originales. Las 6 capas restantes (índices 3, 7, 11, 15, 19 y 23) conservan atención cuadrática completa como anclas.

El objetivo del experimento es demostrar que es posible reemplazar atención densa por alternativas subcuadráticas en un transformer preentrenado y recuperar la capacidad lingüística mediante destilación de conocimiento en dos etapas, sin reentrenar el backbone completo. Tras la cirugía, la perplejidad en WikiText-2 se dispara a 231381,18; después de 451 pasos de destilación (unos 180 segundos de cómputo) baja a 108,86.

Es relevante ahora como pieza de investigación reproducible sobre atención eficiente y destilación post-cirugía: el repositorio incluye solo los pesos de atención (79,27 MB), no el modelo completo, y requiere el paquete `neuralops` y un script de cirugía para reconstruir el checkpoint funcional. Con 0,5 mil millones de parámetros y licencia MIT, sirve como banco de pruebas de bajo coste, no como modelo listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con 18/24 capas de atención sustituidas por `SOAAttention` (patrón híbrido 3:1) y 6 capas de atención cuadrática como anclas |
| Parametros totales | 0,5 mil millones (heredados de Qwen2.5-0.5B; los pesos publicados en este repo son solo de atención, 79,27 MB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (el entrenamiento usó `seq_len=512`; el contexto nativo de Qwen2.5-0.5B no se documenta en esta ficha) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (`en`) |
| Licencia | MIT |
| Formato de pesos | `safetensors` (`attention_weights.safetensors`), más `config.json` y `tokenizer.json` |

## Arquitectura y entrenamiento

El módulo `SOAAttention` (Shared Orthogonal Attention) implementa atención con cuellos de botella latentes por proyección: las matrices densas Q, K y V se factorizan en pares de bajo rango inicializados por SVD truncada desde los pesos preentrenados de Qwen2.5-0.5B. Soporta modo causal autoregresivo, bidireccional y cross-attention, y GQA nativo. El adaptador `QwenAttentionAdapter` mapea las proyecciones originales de `Qwen2Attention` (14 cabezas de query, 2 de KV, `head_dim=64`, `hidden_size=896`) con expansión automática 7x de cabezas KV y contrato de bypass de `o_proj` único. La topología `hybrid_3_1` intercala tres capas `soa_attn` por cada capa cuadrática de ancla.

El entrenamiento es una destilación de conocimiento en dos etapas sobre WikiText-2 (`wikitext-2-raw-v1`). La etapa 1 (alineación con backbone congelado, 137 pasos, 54,4 s) omite `lm_head` y minimiza MSE y coseno (peso 0,25) sobre estados ocultos capa a capa. La etapa 2 (destilación de representación multicapa, 314 pasos, 125,7 s) repite el esquema con peso coseno 0,50. En total, 451 pasos en 180,4 s con `seq_len=512`, `grad_accum=4` y `topk=64`, con un pico de VRAM de 15788 MB en FP16 con parámetros maestros FP32. No se documenta RLHF ni DPO.

## Capacidades

- Generación de texto causal autoregresiva en inglés, heredada de Qwen2.5-0.5B y recuperada parcialmente mediante destilación.
- Atención subcuadrática en 18 de 24 capas, con atención cuadrática completa en 6 capas ancla.
- Soporte de atención bidireccional y cross-attention a nivel de módulo (`SOAAttention`).
- Soporte nativo de GQA (grouped-query attention) en el adaptador de Qwen.
- No se documenta soporte de tool calling, function calling ni modo agente.
- No se documenta capacidad multilingüe: el modelo declara únicamente inglés.
- No se documenta visión, audio ni modo de razonamiento explícito (thinking mode).

## Casos de uso

- Investigación en atención eficiente: banco de pruebas reproducible para medir el impacto de sustituir atención densa por `SOAAttention` en un transformer preentrenado, con telemetría de perplejidad antes y después de la destilación.
- Estudio de destilación post-cirugía: el par de etapas (alineación con backbone congelado y destilación de representación multicapa) sirve como receta de referencia para recuperar modelos tras modificaciones arquitectónicas agresivas.
- Validación de topologías híbridas: el patrón `hybrid_3_1` permite comparar configuraciones de intercalado de capas subcuadráticas frente a anclas cuadráticas en tareas de modelado de lenguaje.
- Prototipado de bajo coste: con 0,5 mil millones de parámetros y solo 79,27 MB de pesos de atención, se puede iterar en una única GPU consumer con poca VRAM.
- Educación y divulgación: ejemplo didáctico de cirugía de módulos en `transformers` con `safetensors` y `load_state_dict(strict=False)`.
- Evaluación de factorización de bajo rango: permite estudiar cómo la inicialización por SVD truncada de Q, K y V afecta a la convergencia y a la perplejidad final.
- Integración en el hub NeuralOps: mediante `neuralops.hub.load_surgeried_model` se carga el modelo quirúrgico en una línea para pipelines internos de experimentación.

## Benchmarks y rendimiento

| Modelo | Dataset / split | Métrica | Valor | Verificado |
|---|---|---|---|---|
| qwen-2.5-0.5b-soa-attn-wikitext2 | Salesforce/wikitext (`wikitext-2-raw-v1`, validation) | Perplejidad | 108,86 | No |
| qwen-2.5-0.5b-soa-attn-wikitext2 (Stage 0, pre-KD) | Salesforce/wikitext (`wikitext-2-raw-v1`, validation) | Perplejidad | 231381,18 | No |

Los valores proceden del `model-index` y de la telemetría de la model card, declarados por el autor. La métrica final no está verificada de forma independiente.

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita; el entrenamiento consumió un pico de 15788 MB en FP16 con parámetros maestros FP32.
- GPU recomendadas: no disponible. Por tamaño (0,5 mil millones de parámetros), el modelo base Qwen2.5-0.5B cabe holgadamente en GPUs consumer, pero este checkpoint requiere el paquete `neuralops` y el script de cirugía.
- GPU consumer: previsiblemente compatible con RTX 3060/4060/4090 en FP16 por el tamaño del modelo base, aunque no se documenta latencia ni throughput.
- Opciones de despliegue: carga vía `neuralops.hub.load_surgeried_model` o reconstrucción manual con `transformers` + `apply_qwen_attention_surgery` + `safetensors`. No se documenta compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Perplejidad WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-soa-attn-wikitext2 | 0,5 B (solo pesos de atención publicados) | No disponible | 108,86 (no verificado) | MIT | Hugging Face, requiere `neuralops` |
| Qwen/Qwen2.5-0.5B (base) | 0,5 B | No disponible en esta ficha | No disponible | No disponible en esta ficha | Hugging Face |
| Otros modelos del Attention Zoo de NeuralOps | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de perplejidad del modelo base ni de alternativas comparables en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- La perplejidad de 108,86 es muy superior a la de un modelo de 0,5 B bien ajustado; el checkpoint no está pensado para uso en producción.
- Solo se publican los pesos de atención (79,27 MB); es necesario descargar el modelo base Qwen2.5-0.5B y aplicar la cirugía con `neuralops` para obtener un modelo funcional.
- El modelo solo declara inglés; no hay evidencia de capacidades multilingües.
- El entrenamiento se limita a WikiText-2 con `seq_len=512`, lo que puede degradar el rendimiento fuera de ese dominio y en contextos largos.
- No se documentan evaluaciones de sesgo, alucinación ni seguridad.
- La licencia MIT permite uso comercial, pero la ausencia de benchmarks estándar (MMLU, HumanEval, GSM8K) impide avalar su calidad en tareas reales.
- El resultado de perplejidad está declarado por el autor y marcado como no verificado (`verified: false`).
- La fecha de creación del repositorio (2026-11-11) es posterior a la fecha actual, lo que conviene tener en cuenta al evaluar su madurez y trazabilidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-soa-attn-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia MIT del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
