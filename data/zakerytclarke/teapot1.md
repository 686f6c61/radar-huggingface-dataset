# zakerytclarke/teapot1

## Resumen

teapot1 es un checkpoint experimental de un modelo de lenguaje causal de 135 millones de parametros, entrenado desde cero por el usuario zakerytclarke dentro de la familia SmolLM2. El repositorio no corresponde a un modelo publicado oficialmente por Hugging Face, sino a una ejecucion de entrenamiento propia (`teapot-SmolLM2-135M-2191bc`) cuyos pesos se distribuyen en dos subcarpetas: un modelo base tras 3.000.238.080 tokens de preentrenamiento y una copia sometida a entrenamiento supervisado (SFT) que, segun el autor, es la que responde a SQuAD.

El interes tecnico es acotado pero documental: permite inspeccionar el estado intermedio de un pipeline de entrenamiento de un transformer pequeno con arquitectura SmolLM2, incluido el paso de SFT, y reproducir evaluaciones sobre SQuAD con el parametro `reasoning_effort` controlando el numero de pasadas del decodificador. No hay informacion publica sobre composicion del dataset, hiperparametros, licencia ni idiomas soportados. El repositorio ocupa 2,5 GB y no registra descargas ni likes en el momento de la consulta.

Por su tamano (135M) y su naturaleza de checkpoint intermedio, no es un modelo orientado a produccion ni a comparativas de rendimiento general, sino a experimentacion controlada con el ciclo preentrenamiento-SFT en modelos pequenos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer causal (familia SmolLM2, segun el autor) |
| Parametros totales | 135M |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin variantes GGUF publicadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (carga via `transformers` con `trust_remote_code=True`) |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura de SmolLM2 en su variante de 135M parametros: un transformer causal decoder-only. Segun la model card, se entreno desde cero y el checkpoint distribuido corresponde a 3.000.238.080 tokens de preentrenamiento. El repositorio contiene dos subcarpetas: `pretrain_3000238080tok` (modelo base antes de entrenamiento supervisado) y `pretrain_3000238080tok_sft` (copia tras SFT, descrita como la que responde a SQuAD). No se detalla la composicion del corpus de preentrenamiento, el numero de tokens de SFT, ni si se aplicaron RLHF o DPO. El unico mecanismo destacable documentado es el parametro `reasoning_effort`, que en las evaluaciones guardadas vale 1 y, si se incrementa en `generate`, ejecuta mas pasadas del decodificador.

## Capacidades

- Generacion de texto autoregresiva propia de un modelo causal de 135M parametros.
- Respuesta a preguntas extractivas sobre SQuAD en la variante SFT (asi lo afirma el autor).
- Control del esfuerzo de razonamiento mediante `reasoning_effort` en `generate` (mas pasadas del decodificador a mayor valor).
- Carga mediante `transformers` con `trust_remote_code=True` y seleccion de subcarpeta (`subfolder`).
- Tool calling / function calling: no disponible en la informacion proporcionada.
- Capacidades de agente o razonamiento multi-paso: no documentadas.
- Capacidades multilingues: no disponibles.
- Vision, audio o modos especiales (thinking): no disponibles.

## Casos de uso

- Reproduccion de evaluaciones sobre SQuAD: cargar la subcarpeta `pretrain_3000238080tok_sft` y ejecutar `generate` con `reasoning_effort=1` para replicar las evaluaciones guardadas por el autor.
- Estudio del efecto del SFT: comparar las salidas de `pretrain_3000238080tok` (base) frente a `pretrain_3000238080tok_sft` sobre el mismo conjunto de prompts para aislar la contribucion del entrenamiento supervisado.
- Experimentacion con `reasoning_effort`: barrido sistematico del parametro en `generate` para medir como varia la calidad y el coste computacional al aumentar las pasadas del decodificador en un modelo de 135M.
- Baseline de bajo coste en investigacion: usar el modelo como referencia de un transformer pequeno entrenado desde cero en experimentos de scaling o de curriculum de preentrenamiento.
- Pruebas de integracion con `transformers`: validar pipelines de carga con `trust_remote_code=True` y `subfolder` antes de desplegar modelos mayores con la misma convencion.
- Docencia y demostraciones: ilustrar el ciclo preentrenamiento-SFT con un checkpoint de 2,5 GB que cabe en hardware modesto, sin necesidad de infraestructura de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo menciona que las evaluaciones guardadas se ejecutaron con `reasoning_effort` igual a 1 y que la variante SFT responde a SQuAD, pero no incluye cifras de exact match, F1 ni de otros benchmarks como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM estimada para inferencia: un modelo de 135M parametros en safetensors requiere del orden de 0,3 GB en precision completa (fp32) y aproximadamente 0,15 GB en fp16/bf16; el repo completo ocupa 2,5 GB por incluir dos checkpoints.
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien funciona en CPU.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con al menos 1 GB de VRAM libre, incluidos portatiles.
- Opciones de despliegue: `transformers` es el camino documentado (con `trust_remote_code=True` y `subfolder`). vLLM, llama.cpp, Ollama o TGI no estan documentados para este checkpoint y no hay pesos GGUF publicados.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| teapot1 | 135M | no disponible | no disponible | Hugging Face (repo experimental, 0 descargas) |
| SmolLM2-135M (referencia de familia) | 135M | no disponible en esta ficha | no disponible en esta ficha | Hugging Face |
| Otros transformers causales pequenos (~100-200M) | ~100-200M | no disponible | variable | Hugging Face |

La comparacion con SmolLM2-135M es la mas directa por compartir familia y tamano, pero no se dispone de datos de rendimiento de teapot1 para establecer una comparacion cuantitativa. Frente a modelos pequenos consolidados, teapot1 carece de licencia declarada, idiomas documentados y benchmarks publicados, lo que limita su uso fuera de experimentacion.

## Limitaciones y advertencias

- Modelo de 135M parametros: capacidad limitada de razonamiento, conocimiento factual y coherencia en contextos largos.
- Riesgo elevado de alucinacion, especialmente fuera del dominio de SQuAD sobre el que se menciona el SFT.
- Licencia no disponible: no se puede confirmar el uso comercial permitido; tratar como restringido a experimentacion hasta verificar.
- Idiomas soportados no documentados: no asumir multilingusmo.
- Longitud de contexto no disponible: no planificar despliegues que dependan de ventanas largas.
- Checkpoint intermedio de una ejecucion de entrenamiento, no un modelo final pulido; el autor lo presenta como material de un run concreto.
- Requiere `trust_remote_code=True`, lo que implica ejecutar codigo remoto del repositorio; auditar antes de usar en entornos sensibles.
- Cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria.
- No hay pesos cuantizados ni soporte documentado en runtimes de inferencia de alto rendimiento.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zakerytclarke/teapot1
- No se han encontrado en la informacion proporcionada papers, blogs, repositorios de codigo ni demos adicionales.
