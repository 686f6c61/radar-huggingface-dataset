# verdict-models/decider-2b

## Resumen

decider-2b (Verdict-ready) es un paquete de despliegue publicado por verdict-models sobre el modelo de decisión decider-2b de Mapika, un "System One decision model" construido sobre Qwen3.5-2B-Base con 1.9B parámetros y 32.768 tokens de contexto (checkpoint revision v11, el predeterminado del autor). No se trata de un modelo nuevo ni de un fine-tune adicional: el repositorio solo añade el manifiesto de serving (`model.json`), el tokenizer y las sumas de verificación, mientras que los pesos (`model.safetensors`) se descargan del repositorio original en el primer arranque.

El objetivo es servir el modelo con Verdict, un motor de inferencia de alto rendimiento especializado en modelos de decisión System One, mediante un único comando Docker sobre GPU CUDA. El paquete expone los protocolos de decisión estándar (`/v1/systemone`, `/v1/decisions`), endpoints nativos (`/v1/choice`, `/v1/score`, `/v1/noul`) y una capa compatible con OpenAI (`/v1/chat/completions`, `/v1/models`), lo que permite integrarlo en aplicaciones existentes sin adaptar el cliente.

Su relevancia actual es operativa: ofrece una alternativa medida frente al servidor del propio autor (`decider.serve` de decider-ai 1.9.0) con hasta 1,93x más throughput a concurrencia 8 y una fidelidad verificada de cero cambios de respuesta respecto al estándar dorado en CPU fp32. Con 0 descargas y 0 likes en el momento de la ficha, es un artefacto muy reciente (creado el 2026-10-16) y de nicho.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer, base Qwen3.5-2B-Base |
| Parametros totales | 1.9B |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 32768 tokens |
| Tipos de cuantizacion | no disponible; el paquete sirve el checkpoint en bf16 (su precision nativa) |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 (heredada del checkpoint base) |
| Formato de pesos | safetensors (`model.safetensors` del checkpoint base); el repo incluye `model.json`, `tokenizer/tokenizer.json`, `tokenizer_config.json` y `SHA256SUMS` |
| Tarea (pipeline) | text-classification / decision model |
| Checkpoint | revision v11 de `Mapika/decider-2b` |
| VRAM en carga | ~5.5 GB |
| Requisito de hardware | GPU CUDA |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen3.5-2B-Base, un transformer de 1.9B parámetros con 32.768 tokens de ventana de contexto, sobre el que Mapika construye el modelo de decisión decider-2b. El autor lo etiqueta como "System One": un modelo orientado a decisiones rápidas y directas (clasificación, elección entre opciones, puntuación) en lugar de cadenas de razonamiento extensas. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF o DPO.

El repositorio de verdict-models no modifica los pesos: solo añade un manifiesto de serving con presupuestos, temperaturas de calibración y la declaración del checkpoint. La inferencia se ejecuta en bf16 y se ha verificado contra el estándar dorado (decider-ai 1.9.0 oficial en CPU fp32, corpus de 30 casos), con cero cambios de respuesta en CUDA sobre una RTX 4090. La desviación máxima registrada en la comparación de precisión es de 2,00e-2 frente a 1,35e-2 del servidor del autor, resultado que el propio paquete califica de empate.

## Capacidades

- Clasificación y decisión de texto: endpoints nativos `/v1/choice`, `/v1/score` y `/v1/noul` para tareas de elección, puntuación y decisión directa.
- Protocolos de decisión estandarizados: `/v1/systemone` y `/v1/decisions` para clientes que ya hablan el protocolo decider-ai.
- Capa compatible con OpenAI: `/v1/chat/completions` y `/v1/models`, lo que facilita la integración con SDKs y frameworks existentes.
- Serving de alta concurrencia: medido hasta 764,7 rps con concurrencia 64 en una única RTX 4090.
- Baja latencia en régimen interactivo: P50 de 7,54 ms con concurrencia 1.
- Reproducibilidad verificable: `SHA256SUMS` para tokenizer y manifiesto, y validación de fidelidad contra el estándar dorado.
- Soporte de ModelScope como alternativa de descarga mediante `VERDICT_USE_MODELSCOPE=1`.
- No se documentan capacidades de generación abierta, visión, audio, tool calling ni agentes multi-paso en la información disponible.

## Casos de uso

- Clasificación de tickets y enrutamiento en producción: el modelo devuelve una decisión cerrada por petición a través de `/v1/choice` o `/v1/score`, con P50 de 7,54 ms a concurrencia 1, adecuado para APIs síncronas de atención al cliente.
- Moderación y guardrails en tiempo real: la ventana de 32.768 tokens permite evaluar conversaciones completas o documentos largos sin truncar, y el endpoint `/v1/decisions` encaja con políticas que exigen una salida discreta.
- Scoring por lotes de alto volumen: a concurrencia 64 el servidor sostiene 764,7 rps en una sola RTX 4090, suficiente para reprocesar corpus grandes de etiquetado en pocas horas.
- Migración desde decider-ai sin reescribir clientes: los endpoints `/v1/systemone` y `/v1/decisions` replican el protocolo del servidor del autor, y la verificación reporta cero cambios de respuesta en el corpus de 30 casos.
- Integración en aplicaciones con SDK de OpenAI: la capa `/v1/chat/completions` permite apuntar un cliente existente al servidor Verdict cambiando únicamente la URL base.
- Despliegue en infraestructura modesta: con ~5.5 GB de VRAM en bf16, cabe en una única GPU de gama consumer y en instancias cloud de una sola tarjeta, lo que reduce el coste frente a modelos de mayor tamaño.
- Pipelines de decisión con requisitos de trazabilidad: los checksums `SHA256SUMS` y la declaración explícita del checkpoint v11 permiten fijar la versión exacta del artefacto en entornos auditados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de modelo (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los datos aportados son de fidelidad y de rendimiento operativo.

Fidelidad frente al estándar dorado (decider-ai 1.9.0, CPU fp32, corpus de 30 casos; ambas partes sobre una RTX 4090):

| Metrica | Verdict | `decider.serve` | Resultado |
|---|---:|---:|---|
| Desviacion maxima | 2.00e-2 | 1.35e-2 | empate |
| Cambios de respuesta en CUDA | 0 | no disponible | verificado |

Rendimiento end-to-end sobre HTTP, una RTX 4090, frente al servidor del autor (`decider.serve`):

| Concurrencia | Verdict rps | `decider.serve` rps | Ratio rps | Verdict P50 / P99 (ms) | `decider.serve` P50 / P99 (ms) | Ratio P50 / P99 |
|---:|---:|---:|---:|---:|---:|---:|
| 1 | 140.4 | 138.0 | 1.02x | 7.54 / 7.74 | 7.20 / 7.62 | 0.96 / 0.98x |
| 8 | 543.3 | 281.9 | 1.93x | 14.81 / 15.89 | 28.19 / 30.61 | 1.90 / 1.93x |
| 64 | 764.7 | 601.3 | 1.27x | 83.26 / 89.30 | 97.31 / 236.69 | 1.17 / 2.65x |

## Requisitos de hardware

- VRAM estimada: ~5.5 GB en carga, sirviendo el checkpoint en bf16 sin cuantización adicional.
- GPU: se exige una GPU CUDA; todas las mediciones publicadas se han realizado sobre una RTX 4090.
- Cabe en GPU consumer: sí, con 5.5 GB de VRAM queda cubierto por tarjetas de 8 GB o superiores de gama media y alta.
- Despliegue: imagen Docker `sgyaqing/verdict:latest-cuda` con `--gpus all` y el comando `serve verdict-models/decider-2b --host 0.0.0.0`; variante ModelScope con `-e VERDICT_USE_MODELSCOPE=1` y el identificador `sgyaqing/decider-2b`.
- Throughput medido: 140,4 rps a concurrencia 1; 543,3 rps a concurrencia 8; 764,7 rps a concurrencia 64.
- Latencia medida: P50 de 7,54 ms / P99 de 7,74 ms a concurrencia 1; P50 de 14,81 ms / P99 de 15,89 ms a concurrencia 8; P50 de 83,26 ms / P99 de 89,30 ms a concurrencia 64.
- Otros motores (vLLM, llama.cpp, Ollama, TGI): no disponible en la información proporcionada; el paquete está diseñado específicamente para Verdict.
- Almacenamiento en caché: el checkpoint se descarga en el primer arranque y se almacena en `~/.cache/verdict`.

## Comparativa con modelos similares

| Modelo / artefacto | Parametros | Contexto | Precision / fidelidad | rps a concurrencia 8 | Licencia | Disponibilidad |
|---|---:|---:|---|---:|---|---|
| verdict-models/decider-2b (Verdict) | 1.9B | 32768 | desviacion maxima 2.00e-2; 0 cambios de respuesta | 543.3 | Apache-2.0 | HuggingFace + Docker CUDA |
| Mapika/decider-2b + `decider.serve` (decider-ai 1.9.0) | 1.9B | 32768 | desviacion maxima 1.35e-2 | 281.9 | Apache-2.0 | HuggingFace |
| Mapika/decider-2b (checkpoint v11, sin empaquetar) | 1.9B | 32768 | no disponible de forma aislada | no disponible | Apache-2.0 | HuggingFace |
| Qwen3.5-2B-Base (modelo base) | ~2B | no disponible | no disponible | no disponible | no disponible | HuggingFace |

La comparación relevante es frente al servidor del propio autor del modelo, ya que no se han identificado en la información disponible otros modelos de decisión System One de tamaño comparable.

## Limitaciones y advertencias

- Este repositorio no contiene los pesos: es un paquete de serving. Requiere descargar el checkpoint de `Mapika/decider-2b` en el primer arranque, por lo que la disponibilidad del artefacto depende del repositorio original.
- No se han publicado métricas de calidad intrínseca del modelo (precisión por tarea, MMLU, etc.); la única validación es de fidelidad frente al estándar dorado en un corpus de 30 casos, una muestra reducida.
- El corpus de verificación es pequeño y específico; no garantiza comportamiento equivalente fuera de la distribución evaluada.
- Todas las cifras de rendimiento proceden de una única RTX 4090; el throughput y la latencia pueden variar en otras GPU, con otras versiones de CUDA o con cargas de entrada distintas.
- El paquete está acoplado al motor Verdict: no se documenta compatibilidad con vLLM, llama.cpp, Ollama o TGI, lo que limita las opciones de despliegue.
- El modelo está orientado a decisiones System One; no se documentan capacidades de generación abierta, razonamiento multi-paso, tool calling, visión ni audio.
- Idiomas soportados no disponibles: no se puede asumir cobertura multilingüe más allá de lo que herede Qwen3.5-2B-Base.
- Sesgos conocidos: no disponible. Al ser un modelo de decisión, existe riesgo de que los errores se amplifiquen en decisiones automatizadas; se recomienda evaluación propia antes de usarlo en flujos con impacto sobre usuarios.
- Riesgo de alucinación: no evaluado en la información disponible; aplica especialmente si se usa la capa `/v1/chat/completions` para generación.
- Licencia Apache-2.0, que permite uso comercial, pero el crédito del modelo corresponde al autor original (Mapika) y a Qwen3.5-2B-Base.
- Artefacto con 0 descargas y 0 likes en el momento de la ficha y creado pocos días antes; madurez y soporte de la comunidad no verificables.

## Enlaces

- HuggingFace (paquete Verdict): https://huggingface.co/verdict-models/decider-2b
- Modelo base: https://huggingface.co/Mapika/decider-2b
- Repositorio del motor Verdict: https://github.com/sgyaqing/verdict
- Referencia ModelScope del checkpoint: https://huggingface.co/sgyaqing/decider-2b
- Imagen Docker: `sgyaqing/verdict:latest-cuda`
