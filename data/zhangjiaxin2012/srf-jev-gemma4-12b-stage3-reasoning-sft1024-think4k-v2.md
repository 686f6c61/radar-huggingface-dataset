# zhangjiaxin2012/SRF-Jev-Gemma4-12B-Stage3-Reasoning-SFT1024-Think4K-v2

## Resumen

SRF-Jev-Gemma4-12B-Stage3-Reasoning-SFT1024-Think4K-v2 es un checkpoint de investigacion derivado de google/gemma-4-12B-it mediante SFT sobre tokens de razonamiento. Lo publica el usuario zhangjiaxin2012 como una instantanea intermedia de un pipeline de tres etapas (Stage1 decision SFT, Stage2 causal decision LoRA y Stage3 reasoning-SFT), dentro del proyecto SRF-Jev. No es un modelo final ni un lanzamiento SOTA: el autor lo etiqueta explicitamente como "research-stage snapshot".

El modelo conserva la arquitectura nativa de Gemma 4 (`Gemma4UnifiedForConditionalGeneration`), es multimodal de tipo image-text-to-text y esta pensado para tareas de decision con opciones (esquemas Choice, NoUL y Score) mas que para chat generico. Su interes tecnico reside en la receta de inferencia "Think4K": un modo `direct` sin razonamiento generado y un modo `autothink4096` que activa razonamiento nativo solo cuando la confianza maxima de la primera pasada es inferior a 0,9, con un tope de 4.096 tokens y una fusion fija `0.25*p0 + 0.75*p1` tras la reinjeccion de analisis.

Ahora mismo es relevante como artefacto reproducible: el autor publica pesos nativos sin cuantizar (BF16), codigo de inferencia independiente, ficheros de release y un panel de evaluacion de 231 preguntas. Conviene tratarlo como material de experimentacion, dado que el propio autor advierte que en sus comparaciones a 31B el modelo base original sigue superando a los checkpoints entrenados en capacidad en modo directo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Gemma4UnifiedForConditionalGeneration (transformer nativo de Gemma 4, multimodal image-text-to-text) |
| Parametros totales | 11.959.730.176 (~12B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible; el tope de 4.096 tokens corresponde al presupuesto de razonamiento Think4K, no a la ventana de contexto |
| Tipos de cuantizacion | no disponible en la publicacion; los pesos se almacenan en dtypes nativos y la inferencia medida carga BF16 |
| Idiomas soportados | en (ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors nativos (model*.safetensors) + config, index y tokenizer nativos; ficheros release.json, evaluation.json, portable-qualification.json |

## Arquitectura y entrenamiento

El modelo parte de `google/gemma-4-12B-it` (commit 707f0a3b8a3c7ad586ed01e27eafbad8a27dd0f7) y conserva la clase nativa `Gemma4UnifiedForConditionalGeneration`, que cubre generacion de texto y entrada imagen-texto. El checkpoint es el resultado de tres fases encadenadas: Stage1 (SFT de decision completa con `enable_thinking=False`), Stage2 (LoRA de decision causal, rank 32 / alpha 64 sobre atencion, con supervision de resultado y replay) y Stage3 (SFT sobre tokens de razonamiento con prompts nativos de thinking y rollouts). El ajuste final registrado son 1.024 actualizaciones con AdamW en FP32 y LR 1e-5, seguido de una exportacion nativa fusionada, sin RL posterior sobre el idioma completo.

La innovacion practica esta en la politica de decodificacion, no solo en los pesos. `direct` ejecuta un unico prefill de decision sin generar razonamiento; `autothink4096` primero lee sin pensar, activa razonamiento nativo solo si `max(p0) < 0.9`, lo limita a 4.096 tokens y aplica una fusion ponderada fija `0.25*p0 + 0.75*p1` tras reinjectar el analisis en formato JSON. El autor subraya que activar `enable_thinking=True` en un chat generico no reproduce esta tabla de decision: la politica, el prompt, el mapeo de opciones y el presupuesto de razonamiento forman parte del sistema evaluado. No se aplico conversion de dtype ni cuantizacion durante la publicacion.

## Capacidades

- Generacion de texto autoregresiva sobre base Gemma 4, condicionada a un formato de decision (Choice, NoUL, Score).
- Entrada multimodal image-text-to-text heredada del modelo base Gemma 4 12B.
- Razonamiento nativo con modo thinking, limitado a 4.096 tokens y activado de forma condicional por umbral de confianza.
- Produccion de identificadores semanticos de opcion, probabilidades por opcion, opcion seleccionada y recuentos reales de tokens y topes.
- Calibracion explicita: el runner devuelve probabilidades que el autor evalua con NLL y Brier.
- Soporte de tool calling / function calling: no disponible en la informacion.
- Soporte de agentes multi-paso: no disponible; el flujo documentado es de una decision con posible razonamiento intermedio.
- Capacidades multilingues: limitadas a ingles segun la etiqueta `language: en`.
- Modo audio: no disponible.

## Casos de uso

- Evaluacion de opcion multiple con razonamiento: el modelo consume JSONL con `id` y `visible` en esquema Choice y devuelve probabilidades por opcion, permitiendo comparar la politica `direct` frente a `autothink4096` sobre el mismo conjunto de preguntas.
- Investigacion sobre decodificacion adaptativa: sirve para estudiar el umbral `max(p0) < 0.9` y el coste real en tokens del razonamiento condicional, ya que el runner reporta tokens y topes efectivos por muestra.
- Experimentos de calibracion: las salidas con NLL y Brier permiten analizar la fiabilidad de las probabilidades del modelo en tareas de decision, un uso poco frecuente en checkpoints de chat.
- Clasificacion con esquema Score: el modelo admite puntuaciones estructuradas, util para tareas de ranking o evaluacion de respuestas con etiquetas separadas del fichero de entrada.
- Reproduccion de baseline para futuros fine-tunes: al estar en formato nativo Gemma 4 y con licencia Apache 2.0, puede servir como punto de partida congelado frente al que medir nuevas etapas del pipeline SRF-Jev.
- Validacion de portabilidad de codigo de inferencia: el autor incluye codigo independiente de codificador, prompt y probabilidades que se puede ejecutar en CPU contra capturas guardadas, util para auditar pipelines de evaluacion.
- Tareas multimodal de investigacion: al conservar la cabeza image-text-to-text del modelo base, puede emplearse en prototipos de decision sobre entradas con imagen, siempre que se adapte el runner.

## Benchmarks y rendimiento

Resultados del panel `public231` del autor (231 preguntas, panel de desarrollo adaptativo, no son puntuaciones oficiales de leaderboard). La columna Capability se define como (Intelligence + Calibration) / 2 y es distinta de la precision de respuesta.

| Politica | Aciertos / 231 | Precision | Intelligence | Calibration | Capability | NLL | Brier |
|---|---:|---:|---:|---:|---:|---:|---:|
| Direct | 191 | 82,68 % | 47,00 | 72,83 | 59,92 | 0,523453 | 0,262807 |
| Gated 4K thinking | 209 | 90,48 % | 72,31 | 80,49 | 76,40 | 0,388385 | 0,174428 |

Advertencias del propio autor: los costes de razonamiento difieren entre checkpoints; la tabla mide un sistema de serving completo (politica, prompt, mapeo de opciones y presupuesto) y no solo los pesos; y en las comparaciones a 31B el modelo base original sigue liderando la capacidad en modo directo frente a los checkpoints entrenados. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en BF16: los pesos ocupan aproximadamente 23,9 GB (11,96 mil millones de parametros x 2 bytes, coherente con el tamano de repo de 24,0 GB); sumando cache KV y activaciones conviene reservar 28-32 GB como minimo.
- GPU recomendadas: H200 como referencia declarada del autor; H100 y A100 de 80 GB son opciones naturales. Multi-GPU se contempla como configuracion de evaluacion aparte.
- Cabe en consumer GPU: en RTX 4090 (24 GB) queda al limite y probablemente entre en OOM al cargar pesos BF16 completos con contexto util; no hay conversiones GGUF/AWQ/GPTQ oficiales publicadas para reducirla.
- Opciones de despliegue: el camino soportado es el runner `predict.py` incluido (una sola GPU CUDA, SDPA en modo math-only) o carga directa con Transformers 5.17.0 usando `dtype=torch.bfloat16` y `attn_implementation="sdpa"`. No hay soporte declarado para vLLM, llama.cpp, Ollama o TGI, y el autor indica que backends multi-GPU o cuantizados son configuraciones de evaluacion distintas.
- Entorno: Python 3.10+, PyTorch 2.6.0 con build CUDA, huggingface_hub 1.5.0, requisitos en `checkpoint/requirements.txt`.
- Latencia y throughput: no disponible. Solo se conoce el coste en tokens del razonamiento en modo `autothink4096` (hasta 4.096 tokens cuando se activa), sin cifras de latencia publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SRF-Jev-Gemma4-12B-Stage3-Reasoning-SFT1024-Think4K-v2 | 11,96B | no disponible | Fine-tune de decision con razonamiento condicional sobre Gemma 4 | Apache 2.0 | HuggingFace, 0 descargas al publicar |
| google/gemma-4-12B-it | 12B (aprox.) | no disponible en la informacion | Modelo base multimodal instruct de Google | Gemma (terminos de Google; verificar para uso comercial) | HuggingFace, ampliamente disponible |
| Otros checkpoints SRF-Jev del autor (tamanos 12B/31B) | hasta 31B segun el autor | no disponible | Variantes de investigacion del mismo pipeline | Apache 2.0 segun este checkpoint | Repositorio GitHub srf-jev |

La comparacion directa con el modelo base es la mas relevante: el autor senala que en sus comparaciones a 31B el base original mantiene ventaja en capacidad en modo directo. No hay datos suficientes para comparar con otras familias de 12B multimodales.

## Limitaciones y advertencias

- No es un modelo final: el autor lo califica como "research-stage snapshot", no como ganador de la v2 ni lanzamiento SOTA oficial.
- Ganancia no uniforme entre modos: la matriz de etapas no muestra mejora uniforme en modo directo y el base original puede superarlo en capacidad directa.
- Riesgo de alucinacion no cuantificado: no se han publicado evaluaciones de factualidad ni de robustez fuera del panel public231.
- Idiomas: la etiqueta declara solo ingles; no se documenta rendimiento multilingue.
- Contexto: la longitud de contexto no se declara; el tope de 4.096 tokens es presupuesto de razonamiento, no ventana.
- Prompts de chat genericos no reproducen la tabla de decision: hay que usar el runner y la politica especificados, con un mapeo de opciones y una semilla determinados por los IDs.
- El runner oficial asume una sola GPU y SDPA en modo math-only; desplegarlo en vLLM, llama.cpp, Ollama o backends cuantizados no esta validado por el autor.
- La evaluacion public231 es un panel de desarrollo adaptativo del propio autor, no una puntuacion de leaderboard.
- Faltan datos de sesgo, toxicidad y seguridad; no se han publicado.
- Licencia Apache 2.0 en este checkpoint, pero el modelo base google/gemma-4-12B-it tiene sus propios terminos de Google que conviene revisar antes de uso comercial.
- No se publican estados del optimizador, registros de entrenamiento, etiquetas ni logs internos, lo que limita la reproducibilidad completa del ajuste.
- La validacion de portabilidad del nuevo CLI en GPU no se ha ejecutado como prueba fresca segun el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/zhangjiaxin2012/SRF-Jev-Gemma4-12B-Stage3-Reasoning-SFT1024-Think4K-v2
- Modelo base: https://huggingface.co/google/gemma-4-12B-it
- Repositorio del proyecto: https://github.com/jxzhangjhu/srf-jev
- Documentacion de la comparativa de tres tamanos: https://github.com/jxzhangjhu/srf-jev/tree/main/docs/gemma4/research/three-size-20261023
- Fichero de release (dtypes de tensores): checkpoint/release.json dentro del repositorio
- Codigo de inferencia y ejemplos: checkpoint/predict.py, checkpoint/examples.jsonl dentro del repositorio
- Paper: no disponible
- Demo: no disponible
