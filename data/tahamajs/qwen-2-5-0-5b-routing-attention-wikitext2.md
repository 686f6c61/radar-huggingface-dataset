# tahamajs/qwen-2.5-0.5b-routing-attention-wikitext2

## Resumen

`qwen-2.5-0.5b-routing-attention-wikitext2` es un checkpoint experimental publicado por el usuario tahamajs dentro del proyecto NeuralOps "Qwen Attention Zoo". No es un modelo entrenado desde cero, sino un Qwen2.5-0.5B de Alibaba cuyo mecanismo de atencion en el decodificador ha sido sustituido quirurgicamente por el operador `RoutingAttention` (atencion dispersa por clustering basado en contenido) y posteriormente recuperado mediante destilacion de conocimiento en dos etapas sobre WikiText-2.

El objetivo del artefacto es demostrar que un modulo de atencion subcuadratica alternativo puede transplantarse en un transformer preentrenado y recuperar un comportamiento de lenguaje razonable con un presupuesto de entrenamiento minimo (407 pasos, 180 segundos). Tras la cirugia, la perplejidad causal se dispara a 146289,08; tras la destilacion en dos etapas baja a 146,99 en la validacion de WikiText-2.

Es relevante como material de investigacion sobre atencion eficiente y como ejemplo reproducible de sustitucion modular de capas de atencion, no como modelo de produccion: el propio autor solo publica los pesos de atencion (59,29 MB), no el checkpoint completo, y la perplejidad final sigue siendo muy superior a la del modelo base original.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con atencion hibrida: 18/24 capas con `RoutingAttention` y 6/24 capas con atencion cuadratica completa (patron `hybrid_3_1`) |
| Parametros totales | 0,5 mil millones (heredados de Qwen/Qwen2.5-0.5B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (el entrenamiento uso `seq_len=512`) |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors FP16; no se documentan GGUF ni otras cuantizaciones) |
| Idiomas soportados | en (ingles) |
| Licencia | MIT |
| Formato de pesos | safetensors (`attention_weights.safetensors`, 59,29 MB) |

## Arquitectura y entrenamiento

El modelo parte de Qwen2.5-0.5B: 24 capas, 14 cabezas de consulta y 2 cabezas KV (GQA, factor 7), `head_dim=64` y `hidden_size=896`. Sobre esa base se aplica un `QwenAttentionAdapter` que sustituye la atencion de 18 de las 24 capas por `RoutingAttention`, manteniendo intactas las capas en los indices [3, 7, 11, 15, 19, 23] como anclas cuadraticas. El modulo `RoutingAttention` es una atencion dispersa por clustering basado en contenido; segun la model card soporta atencion bidireccional, cross-attention y GQA nativo, pero no soporta explicitamente el modo causal autoregresivo ni rotary embeddings de forma nativa.

El entrenamiento es una destilacion de conocimiento en dos etapas sobre `wikitext-2-raw-v1`, con el modelo base como profesor. La etapa 1 (alineacion con backbone congelado) duro 124 pasos (54,3 s) y uso MSE y coseno sobre estados ocultos con peso 0,25, con `lm_head` desactivado. La etapa 2 (destilacion de representacion multicapa) duro 283 pasos (125,6 s) con peso 0,50. En total: 407 pasos, 180,2 s, `seq_len=512`, `grad_accum=4`, `topk=64` y un pico de 15066 MB de VRAM en FP16 con parametros maestros en FP32.

## Capacidades

- Generacion de texto causal en ingles, limitada al dominio de WikiText-2 sobre el que se destilo.
- Razonamiento, codigo, matematicas y vision: no disponible; no se documenta ni se evalua ninguna de estas capacidades.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: solo ingles declarado.
- Capacidad especial: el modulo `RoutingAttention` soporta atencion bidireccional, cross-attention y GQA nativo, lo que lo hace potencialmente reutilizable en tareas de codificacion, aunque el checkpoint publicado esta destilado solo para modelado causal.

## Casos de uso

- Investigacion en atencion eficiente: sirve como banco de pruebas reproducible para medir el coste de recuperacion (en perplejidad y pasos) al sustituir atencion cuadratica por un operador disperso en un transformer preentrenado pequeno.
- Desarrollo de modulos de atencion en NeuralOps: el checkpoint permite validar el `QwenAttentionAdapter` y el patron `hybrid_3_1` antes de escalar a modelos mayores.
- Docencia y divulgacion: ejemplo compacto (0,5B, 59 MB de pesos de atencion) para explicar destilacion de conocimiento en dos etapas y cirugia de capas.
- Pruebas de compatibilidad de tooling: validar flujos de carga con `neuralops.hub.load_surgeried_model` y con `transformers` mas safetensors en pipelines internos.
- Baseline de perplejidad: referencia de 146,99 PPL en WikiText-2 para comparar futuras variantes de atencion subcuadratica dentro del mismo zoo.
- Generacion de texto de baja exigencia en entornos de prototipado: completar fragmentos en ingles con un modelo de 0,5B que cabe en cualquier GPU consumer, aceptando la perdida de calidad frente al base.

## Benchmarks y rendimiento

Datos declarados por el autor en la model card (no verificados de forma independiente):

| Benchmark | Metrica | Resultado |
|---|---|---|
| WikiText-2 (`wikitext-2-raw-v1`, validation) | Perplejidad | 146,99 |
| WikiText-2, pre-destilacion (Stage 0) | Perplejidad | 146289,08 |
| WikiText-2, tras Stage 1 | Perplejidad | no disponible de forma aislada |
| WikiText-2, tras Stage 2 | Perplejidad | 146,99 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni otros benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: el modelo completo en FP16 ocupa aproximadamente 1 GB (0,5B parametros); el pico documentado durante el entrenamiento fue de 15066 MB, no representativo de inferencia.
- GPU recomendadas: cualquier GPU con 2 GB o mas de VRAM es suficiente para inferencia en FP16; para entrenamiento o destilacion se uso una GPU con al menos 16 GB.
- GPU consumer: cabe en RTX 3060, RTX 4060, RTX 4090 y similares; tambien en GPUs integradas con suficiente memoria compartida.
- Opciones de despliegue: `transformers` mas safetensors aplicando la cirugia con `apply_qwen_attention_surgery`, o la API `neuralops.hub.load_surgeried_model`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | PPL WikiText-2 | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen-2.5-0.5b-routing-attention-wikitext2 | 0,5B | no disponible | 146,99 | MIT | pesos de atencion (59 MB) |
| Qwen/Qwen2.5-0.5B | 0,5B | 32768 tokens (segun el modelo base) | no disponible en esta ficha | Apache 2.0 | checkpoint completo |
| Modelos con atencion lineal/dispersa comparables de 0,5B | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa directa con alternativas de atencion subcuadratica del mismo tamano no esta disponible en la informacion proporcionada.

## Limitaciones y advertencias

- Perplejidad muy alta: 146,99 en WikiText-2 frente a valores tipicos de un 0,5B bien entrenado, lo que indica una calidad de lenguaje muy degradada.
- El checkpoint solo contiene los pesos de atencion (`attention_weights.safetensors`), no el modelo completo; es obligatorio aplicar la cirugia y cargar el base Qwen2.5-0.5B por separado.
- Entrenado exclusivamente sobre WikiText-2, un corpus enciclopedico en ingles; el dominio y el idioma estan fuertemente restringidos.
- Riesgo elevado de alucinacion y de texto incoherente fuera del dominio de entrenamiento.
- El modulo `RoutingAttention` declara `supports_causal = No`, lo que genera incertidumbre sobre la correccion del modo autoregresivo pese a que el checkpoint se presenta para generacion causal.
- No hay evaluacion de sesgos, seguridad ni robustez.
- Licencia MIT permite uso comercial, pero la calidad del modelo hace inviable su uso en produccion sin un reentrenamiento sustancial.
- El autor no verifica los resultados (`verified: false` en el model-index).

## Enlaces

- Hugging Face: https://huggingface.co/tahamajs/qwen-2.5-0.5b-routing-attention-wikitext2
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B
- Repositorio NeuralOps: https://github.com/tahamajs/NeuralOps
- Licencia del proyecto: https://github.com/tahamajs/NeuralOps/blob/main/LICENSE
- Dataset WikiText-2: https://huggingface.co/datasets/Salesforce/wikitext
