# Xirui1208/selective-readtwice-14b-rl-step500-20260926

## Resumen

Selective ReadTwice 14B — RL step 500 es un checkpoint de investigación publicado por el usuario Xirui1208. No es un modelo monolítico al uso, sino un pipeline de dos roles: por un lado incluye el lector completo ReadAll / ReadTwice de 14.770.033.664 parámetros (14,77 B) congelado en BF16, y por otro un adaptador de puerta (LoRA de decisión READ/SKIP) entrenado mediante aprendizaje por refuerzo. El artefacto corresponde exactamente a las 500 actualizaciones de optimizador de RL partiendo del SFT selectivo epoch 1 / step 2944.

El modelo resuelve un problema concreto de la lectura de documentos largos: en lugar de reprocesar todo el texto en una segunda pasada, el lector realiza primero un SKIM de todos los fragmentos y una puerta decide qué secciones merecen una segunda lectura (READ) y cuáles se omiten (SKIP), optimizando un equilibrio entre precisión, evidencia y coste de lectura. Es relevante porque explora cómo el RL puede aprender políticas de lectura selectiva sobre un lector congelado, sin reentrenar los pesos del lector.

La arquitectura base es Qwen2 (según los tags), con contexto nativo de 32.768 tokens y etiquetas bilingües en inglés y chino. La licencia es Apache 2.0. Se trata de un snapshot intermedio: el autor indica que el entrenamiento continuó después de guardarlo y que no se incluye ninguna evaluación held-out de este checkpoint.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2) con pipeline de lector congelado y adaptador de puerta (LoRA) entrenado por RL |
| Parametros totales | 14.770.033.664 (14,77 B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 32.768 tokens nativos; límite de prompt de la puerta: 8.192; fragmentos sin pérdida de hasta 5.000 tokens; máximo 24 secciones por página de puerta |
| Tipos de cuantizacion | no disponible; el repositorio distribuye pesos en BF16 (safetensors) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (lector BF16 en la raíz; adaptador de puerta, bias de puerta y estado del optimizador en `gate_adapter/`) |

## Arquitectura y entrenamiento

El sistema consta de dos componentes acoplados. El primero es el lector ReadAll / ReadTwice de 14,77 B en BF16, congelado, que se corresponde con el modelo base `Xirui1208/readall-readtwice-14b-rl-step15-20260925` (revisión `ebdc012fadb9a18eb74cc8adb5822b4bc42c7d66`). El segundo es un adaptador LoRA de decisión READ/SKIP más un bias de puerta, alojados en `gate_adapter/`. Solo la puerta fue entrenada; el lector debe permanecer congelado, ya que fusionar el adaptador en el lector altera el pipeline de dos roles.

El protocolo de inferencia define fragmentos sin pérdida de hasta 5.000 tokens, un máximo de 24 secciones por página de puerta y un límite de prompt de 8.192. Todos los fragmentos reciben una primera pasada SKIM; la probabilidad de la puerta controla la lectura de la segunda pasada (READ), con lectura forzada de esquemas truncados y un fallback de mayor probabilidad si no se selecciona nada. Los límites de SKIM/UPDATE/FINAL son 512/1024/1024, con decodificación greedy y semilla 801. Una respuesta completa con `<KEEP_MEMORY>` preserva la memoria; en caso contrario, la memoria generada la reemplaza.

En cuanto al entrenamiento, el RL utiliza 16 vistas de documento por paso, cuatro acciones muestreadas por vista, tasa de aprendizaje 5e-6, una referencia fija del SFT original y recompensas de precisión, evidencia y coste de lectura, con entradas de puerta balanceadas por posición. El estado del optimizador, el orden de entrenamiento, el balanceador de posición y los estados RNG de Python/PyTorch/CUDA en el paso 500 se conservan en `gate_adapter/trainer_state.pt`. Las métricas de entrenamiento hasta el paso 500 y la configuración original están en `training/`, y el propio autor advierte que no son puntuaciones de evaluación held-out.

## Capacidades

- Lectura selectiva de documentos largos mediante el protocolo ReadTwice: primera pasada SKIM sobre todos los fragmentos y segunda pasada controlada por la puerta.
- Decisión binaria READ/SKIP a nivel de sección, con umbral de probabilidad configurable (por defecto 0,5).
- Generación de respuestas sobre documentos extensos con contexto nativo de 32.768 tokens.
- Gestión de memoria entre pasos (respuestas con `<KEEP_MEMORY>` preservan la memoria; en caso contrario se reemplaza).
- Comprensión y generación en inglés y chino.
- Conservación de evidencia y control de coste de lectura como parte de la política aprendida.
- Capacidad de reanudación del entrenamiento desde el estado exacto del paso 500 (optimizador, RNG y balanceador de posición).
- No se documentan capacidades de tool calling, function calling, agentes, visión ni audio en la información disponible.

## Casos de uso

- Preguntas y respuestas sobre documentación extensa: el modelo puede recorrer corpus de decenas de miles de tokens, hacer un SKIM inicial y releer solo las secciones relevantes, lo que resulta adecuado cuando el coste de una segunda pasada completa es prohibitivo.
- Análisis de contratos y documentación legal: la puerta READ/SKIP permite priorizar cláusulas concretas y conservar evidencia, útil en revisión asistida donde importa justificar qué fragmento sustenta cada conclusión.
- Pipelines de RAG (generación aumentada por recuperación): el lector selectivo encaja como etapa de refinamiento tras la recuperación, decidiendo qué pasajes merecen una lectura profunda antes de generar la respuesta.
- Atención al cliente con base de conocimiento larga: con 32.768 tokens de contexto, se pueden gestionar conversaciones multi-turno apoyadas en manuales o políticas internas extensas.
- Investigación académica sobre políticas de lectura: el checkpoint sirve como referencia reproducible para estudiar RL sobre lectores congelados, comparando el paso 500 frente a otros puntos de control de la misma familia.
- Extracción de evidencia en corpus científicos o técnicos: la semilla fija (801) y la decodificación greedy facilitan la reproducibilidad en tareas de localización de pasajes.
- Procesamiento bilingüe inglés-chino de informes o normativas, aprovechando las dos lenguas soportadas.
- Punto de partida para reanudar entrenamiento: el estado completo del optimizador permite continuar el RL desde el paso 500 ajustando rutas de máquina y recuperando la referencia SFT.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se incluye ni se reclama ninguna evaluación held-out (HQA) del paso 500, y que los resultados previos del paso 200 y las evaluaciones separadas del ReadAll de 7B no describen este checkpoint.

## Requisitos de hardware

- El lector en BF16 ocupa aproximadamente 29,5 GB en pesos (tamaño del repo: 29,9 GB), a lo que hay que sumar la caché KV correspondiente a un contexto de hasta 32.768 tokens.
- El protocolo de inferencia del autor recomienda ejecutar el lector y la puerta en GPUs separadas (`CUDA_VISIBLE_DEVICES=0` para el lector, `CUDA_VISIBLE_DEVICES=1` para la puerta), por lo que se necesitan al menos dos dispositivos.
- GPUs recomendadas: A100 (40 GB o 80 GB) o H100 para el lector; una segunda GPU dedicada para la puerta.
- En GPUs de consumo: el lector BF16 de ~29,5 GB no cabe en una única RTX 4090 o RTX 3090 de 24 GB; sería necesario repartir entre varias GPUs o recurrir a cuantización, que no está documentada en este repositorio.
- Opciones de despliegue: el autor proporciona código propio (`code/configure.py`, `code/start_reader.py`, `code/infer.py`) sobre `transformers`; el tag `text-generation-inference` aparece en la ficha de HuggingFace, pero el protocolo personalizado de dos roles no se describe como compatible con vLLM, Ollama o llama.cpp en la información disponible.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Estado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Selective ReadTwice 14B — RL step 500 | 14,77 B | 32.768 | Checkpoint intermedio de RL, sin evaluación held-out | apache-2.0 | Repositorio público, 0 descargas / 0 likes |
| ReadAll / ReadTwice 14B — RL step 15 | no disponible | no disponible | Modelo base congelado del anterior | apache-2.0 | Repositorio público |
| Selective ReadTwice 14B — SFT epoch 1 / step 2944 | no disponible | no disponible | Referencia SFT original | apache-2.0 | Repositorio público |
| ReadAll 7B (evaluaciones separadas) | ~7 B | no disponible | Familia relacionada, evaluaciones citadas por el autor | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estos checkpoints en la información proporcionada. La comparativa se limita a la procedencia y al estado de publicación.

## Limitaciones y advertencias

- No existe evaluación held-out del paso 500; las métricas de `training/` son métricas de entrenamiento y no puntuaciones de evaluación.
- El umbral por defecto (0,5) no ha sido recalibrado específicamente para el paso 500.
- Solo se entrenó la puerta; fusionar el adaptador en el lector rompe el pipeline de dos roles y no es el uso previsto.
- El checkpoint requiere el código y el protocolo de inferencia propios del autor; no es un modelo `transformers` estándar de un solo paso.
- Reanudar el entrenamiento exige adaptar rutas de máquina locales, obtener el conjunto de datos de entrenamiento referenciado y restaurar la referencia SFT original.
- Riesgo de alucinación: aunque la política incorpora recompensas de evidencia, no se documentan garantías de fidelidad factual.
- Cobertura de idiomas limitada a inglés y chino.
- Es un snapshot intermedio: el autor advierte que el entrenamiento continuó tras guardarlo, por lo que no representa el estado final de la investigación.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero al tratarse de un checkpoint de investigación sin evaluación publicada, su uso en producción no está respaldado por datos de rendimiento verificados.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Xirui1208/selective-readtwice-14b-rl-step500-20260926
- Modelo base (lector congelado): https://huggingface.co/Xirui1208/readall-readtwice-14b-rl-step15-20260925
- Referencia SFT: https://huggingface.co/Xirui1208/selective-readtwice-14b-sft-epoch1-step2944-20260925
- Código de inferencia incluido en el repositorio: `selective_14b_step500/code/configure.py`, `selective_14b_step500/code/start_reader.py`, `selective_14b_step500/code/infer.py`
- Manifiesto de publicación: `release_manifest.json`
- Métricas de entrenamiento y configuración: carpeta `training/`
- Estado del optimizador y RNG: `gate_adapter/trainer_state.pt`
