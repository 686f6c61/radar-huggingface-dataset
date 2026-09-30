# znhoughton/binomial-abspref-saes

## Resumen

Este repositorio no contiene un modelo generativo, sino seis autoencoders dispersos (SAE, sparse autoencoders) entrenados sobre los residual streams de seis modelos de lenguaje pequenos, con el objetivo de investigar preferencias de orden en binomios ingleses del tipo "salt and pepper" frente a "pepper and salt". Lo publica Zachary Houghton (znhoughton), y esta vinculado al articulo arXiv:2606.13993 sobre almacenamiento holistico de frases verbo+particula en modelos de lenguaje de texto y audio.

Los SAE siguen el protocolo BatchTopK de la libreria sae_lens, con diccionarios de 32 veces la anchura del modelo, k = 64 y contexto de entrenamiento de 1024 tokens, sobre un corpus fijado de Wikipedia en ingles de 98 millones de tokens. Cada carpeta del repositorio corresponde a una capa concreta de un modelo base: tres checkpoints OPT-BabyLM (125M, 350M y 1,3B) y tres modelos Pythia (160M, 410M y 1,4B).

La relevancia del artefacto es metodologica: al emplear un protocolo identico en seis modelos de distinta escala y familia, permite comparaciones controladas de caracteristicas internas entre modelos y sirve como base para experimentos causales de ablacion y steering sobre decisiones de orden de palabras. Su utilidad practica esta limitada al campo de la interpretabilidad mecanistica; no genera texto ni resuelve tareas de usuario final.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Sparse autoencoder (BatchTopK) sobre el residual stream; diccionario de 32x la anchura del modelo, k = 64 |
| Parametros totales | Seis SAE independientes, entre 37,7 M y 268,4 M parametros cada uno (derivado de 2 x d_in x d_sae); repositorio completo de 3,0 GB |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 1024 tokens en el entrenamiento de los SAE; contexto de los modelos base: no disponible en la informacion proporcionada |
| Tipos de cuantizacion | no disponible (no se documentan variantes cuantizadas; artefactos distribuidos en safetensors) |
| Idiomas soportados | Ingles (corpus de Wikipedia en ingles); la metadata de HuggingFace no declara idiomas |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (`sae_weights.safetensors`) acompanado de `cfg.json`, `train_meta.json` y `val_history.json` |

Detalle por carpeta:

| Carpeta | Modelo base | Bloque | d_in | d_sae | k (L0 medio) | EV validacion | Latentes muertas |
|---|---|---|---|---|---|---|---|
| babylm-125m | znhoughton/opt-babylm-125m-20eps-seed964 | 8 | 768 | 24576 | 64 | 0,897 | 5 |
| babylm-350m | znhoughton/opt-babylm-350m-20eps-seed964 | 16 | 1024 | 32768 | 64 | 0,841 | 2 |
| babylm-1.3b | znhoughton/opt-babylm-1.3B-20eps-seed964 | 16 | 2048 | 65536 | 64 | 0,737 | 2 |
| pythia-160m | EleutherAI/pythia-160m | 8 | 768 | 24576 | 64 | 0,928 | 13 |
| pythia-410m | EleutherAI/pythia-410m | 10 | 1024 | 32768 | 64 | 0,966 | 55 |
| pythia-1.4b | EleutherAI/pythia-1.4b | 11 | 2048 | 65536 | 64 | 0,929 | 36 |

## Arquitectura y entrenamiento

Cada artefacto es un autoencoder disperso que opera sobre la entrada del residual stream al bloque `layer` indicado, equivalente a `hidden_states[layer]` en HuggingFace y a `blocks.{layer}.hook_resid_pre` en TransformerLens. La arquitectura es un diccionario sobredimensionado (32x la anchura del modelo) con codificador, decodificador y umbral de activacion exportado: los pesos incluyen `W_enc`, `W_dec`, `b_enc`, `b_dec` y `threshold`.

El protocolo de entrenamiento es identico en las seis carpetas: BatchTopK de sae_lens con k = 64, optimizador Adam (lr 1e-4, beta2 0,9999) con decaimiento coseno y warmup, contexto de 1024 tokens, perdida auxiliar de reconstruccion para revivir latentes muertas, y un corpus de Wikipedia fijado y compartido de 98 millones de tokens (sha256 `cd0c879c...`). El entrenamiento se detiene al alcanzar un plateau en la varianza explicada (EV) de reconstruccion sobre un split de validacion de 2 millones de tokens, con paciencia de 3 x 0,05 %, suelo de 64 M de tokens y tope de 400 M. No se documenta ningun uso de RLHF, DPO ni ajuste por preferencias: son artefactos puramente no supervisados.

Una innovacion relevante para la reproducibilidad es que los pesos exportados reproducen el `encode` de sae_lens de forma bit-exacta (diferencia absoluta maxima de 0,0, verificada sobre texto reservado en los seis casos). Nota semantica importante: el entrenamiento usa top-k por media de batch, mientras que la inferencia usa un umbral fijo exportado de estilo JumpReLU, por lo que el numero de latentes activos por token fluctua alrededor de 64 en lugar de ser exactamente 64.

## Capacidades

- Extraccion de caracteristicas dispersas: codifica activaciones del residual stream en representaciones de hasta 65536 latentes por token, con umbral fijo en inferencia.
- Reconstruccion del residual stream: decodifica el vector disperso para reconstruir la activacion original; el autor reporta EV de 0,99 sobre frases con binomios en el caso de pythia-160m.
- Experimentos causales de ablacion: permite poner a cero el latente `j` y restar su contribucion del forward pass para medir el efecto en la puntuacion de orden del modelo.
- Steering direccional: admite sumar `c * w_dec[j]` en la entrada del bloque y volver a medir la preferencia de orden.
- Analisis comparativo entre modelos: seis diccionarios entrenados con protocolo identico sobre el mismo corpus, comparables entre escalas (125M-1,3B OPT y 160M-1,4B Pythia).
- Analisis de caracteristicas en corpus de Wikipedia en ingles mediante PyTorch y transformers.
- Auditabilidad del entrenamiento: `train_meta.json` registra razon de parada, tokens vistos, EV, L0, latentes muertas y hashes del corpus; `val_history.json` contiene la curva completa de EV reservada.
- No soporta generacion de texto, tool calling, function calling, razonamiento multi-paso ni agentes: no es un modelo de lenguaje.
- No tiene capacidades multilingues, de vision ni de audio.

## Casos de uso

- Identificacion de latentes que sesgan el orden binomial: codificar frases como "Bread and butter are common breakfast staples" y buscar que latentes activan de forma diferencial entre el orden convencional y el invertido, para aislar la representacion interna que decide la preferencia.
- Ablacion causal de un latente concreto: en investigacion sobre composicionalidad, poner a cero el latente `j` en la entrada del bloque y comprobar si cambia la probabilidad asignada a cada orden; el modelo base y el SAE estan fijados, lo que hace el experimento reproducible.
- Steering controlado en el forward pass: sumar `c * w_dec[j]` con distintos valores de `c` para trazar una curva dosis-respuesta del control interno sobre la eleccion de orden, un tipo de manipulacion usado en estudios de interpretabilidad causal.
- Comparacion entre escalas y familias: usar las seis carpetas para analizar si la representacion de un mismo fenomeno linguistico aparece a 125M, 350M y 1,3B en OPT-BabyLM y a 160M, 410M y 1,4B en Pythia, con el mismo corpus y los mismos hiperparametros.
- Investigacion en modelos tipo BabyLM: los tres checkpoints OPT-BabyLM proceden de un entrenamiento con presupuesto de datos de estilo desarrollo infantil, por lo que los SAE permiten comparar representaciones de modelos "infantiles" frente a Pythia entrenado a gran escala.
- Auditoria de caracteristicas y latentes muertas: con recuentos de latentes muertas de 2 a 55, se puede estudiar la utilizacion efectiva del diccionario y comparar la salud del entrenamiento entre tamanos.
- Monitorizacion de activaciones en estudios de sesgo: al estar entrenados sobre Wikipedia en ingles, los latentes permiten inspeccionar que direcciones del residual stream se asocian a contenidos y sesgos de ese dominio.
- Reproduccion y docencia: el protocolo explicito y los registros de auditoria (`train_meta.json`, `val_history.json`) permiten reproducir el pipeline o usarlo como referencia docente de entrenamiento de SAE con sae_lens 6.x.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. Los unicos datos cuantitativos proporcionados son metricas internas de calidad de reconstruccion de los propios SAE:

| Carpeta | EV de validacion | L0 medio (k) | Latentes muertas | Verificacion bit-exacta |
|---|---|---|---|---|
| babylm-125m | 0,897 | 64 | 5 | si (max abs diff 0,0) |
| babylm-350m | 0,841 | 64 | 2 | si (max abs diff 0,0) |
| babylm-1.3b | 0,737 | 64 | 2 | si (max abs diff 0,0) |
| pythia-160m | 0,928 | 64 | 13 | si (max abs diff 0,0) |
| pythia-410m | 0,966 | 64 | 55 | si (max abs diff 0,0) |
| pythia-1.4b | 0,929 | 64 | 36 | si (max abs diff 0,0) |

Ademas, el autor reporta que en la prueba end-to-end con sae_lens 6.51, la codificacion y decodificacion contra `pythia-160m` dieron un EV de reconstruccion de 0,99 sobre frases con binomios. Al no ser un modelo generativo, no aplican metricas como MMLU, HumanEval o GSM8K.

## Requisitos de hardware

- VRAM de los pesos del SAE (estimacion asumiendo fp32): 37,7 M de parametros ~151 MB (babylm-125m y pythia-160m); 67,1 M ~268 MB (babylm-350m y pythia-410m); 268,4 M ~1,07 GB (babylm-1.3b y pythia-1.4b).
- VRAM adicional para activaciones: una secuencia de 1024 tokens produce un tensor (1024, d_sae); en fp32 son ~100 MB con d_sae = 24576 y ~268 MB con d_sae = 65536 por elemento de batch.
- Modelo base necesario: el SAE no funciona de forma aislada; hay que cargar el modelo base correspondiente (Pythia 160M, 410M o 1,4B, u OPT-BabyLM 125M, 350M o 1,3B) para extraer el residual stream.
- GPU recomendadas: cualquier GPU consumer con 8-12 GB permite ejecutar simultaneamente el modelo base y el SAE mas grande; una RTX 3060 de 12 GB o una RTX 4090 son suficientes. Para lotes grandes en el SAE de d_sae = 65536 conviene vigilar la memoria de activaciones.
- Los SAE mas pequenos y sus modelos base de 125M-410M pueden ejecutarse en CPU, aunque con latencia mayor.
- Opciones de despliegue: `sae_lens` (probado con 6.51), PyTorch y transformers; la carga puede hacerse con `SAE.load_from_disk` sobre una copia local o con `snapshot_download` filtrando una sola carpeta con `allow_patterns`.
- No hay soporte documentado para vLLM, llama.cpp, Ollama ni TGI, porque estos sirven modelos generativos, no SAE.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

La comparacion natural es con otras suites de SAE publicadas, no con modelos de lenguaje. Los datos concretos de esas alternativas no se han verificado en la informacion disponible, por lo que se indican como no disponibles.

| Criterio | binomial-abspref-saes | Gemma Scope | Suites de SAE para Pythia / GPT-2 |
|---|---|---|---|
| Objeto | SAE sobre residual stream de 6 modelos pequenos | SAE sobre modelos Gemma 2 | SAE sobre Pythia o GPT-2 |
| Numero de modelos cubiertos | 6 (3 OPT-BabyLM + 3 Pythia) | no disponible | no disponible |
| Protocolo | BatchTopK, k = 64, diccionario 32x, un unico corpus fijado | no disponible | no disponible |
| Contexto de entrenamiento | 1024 tokens | no disponible | no disponible |
| Licencia | apache-2.0 | no disponible | no disponible |
| Enfoque especifico | Orden binomial en ingles y comparacion entre escalas | Interpretabilidad general | Interpretabilidad general |

Frente a los modelos base que interpreta, la comparativa no procede: los SAE no sustituyen a Pythia u OPT-BabyLM, sino que se acoplan a ellos. En esa comparativa interna, los Pythia muestran mayor EV de validacion (0,928-0,966) que sus equivalentes OPT-BabyLM (0,737-0,897).

## Limitaciones y advertencias

- No es un modelo de lenguaje: no genera texto, no responde a prompts y no soporta tool calling ni agentes. Cualquier expectativa de uso como asistente es incorrecta.
- Cobertura limitada a una sola capa por modelo (bloques 8, 10, 11 o 16 segun el caso); no hay diccionarios para el resto de capas ni para las cabezas de atencion.
- Entrenados exclusivamente sobre un corpus fijado de Wikipedia en ingles de 98 millones de tokens; el comportamiento fuera de ese dominio (por ejemplo, en texto tecnico, conversacional o multilingue) no esta caracterizado.
- Semantica de inferencia distinta del entrenamiento: BatchTopK por media de batch frente a umbral fijo tipo JumpReLU en inferencia, de modo que el numero de latentes activos por token no es exactamente 64 y puede fluctuar.
- Latentes muertas persistentes: hasta 55 en pythia-410m, lo que indica que parte del diccionario no se utiliza.
- El EV de validacion mas bajo es 0,737 en babylm-1.3b: las reconstrucciones de ese SAE son notablemente menos fieles que las del resto.
- Riesgo de sobreinterpretacion: la existencia de un latente activado no implica causalidad; el propio autor propone experimentos de ablacion y steering precisamente para validar hipotesis causales.
- Los seis modelos base son pequenos (125M a 1,4B), por lo que las conclusiones sobre representaciones no se extrapolan sin evidencia a modelos de mayor escala.
- Licencia Apache-2.0 para los SAE, que permite uso comercial de estos artefactos; sin embargo, el uso de cada modelo base queda sujeto a su propia licencia, que no se detalla en la informacion disponible para los checkpoints OPT-BabyLM.
- Repositorio con 0 descargas y 0 likes: es un artefacto de investigacion reciente, sin validacion por parte de la comunidad.
- Las descargas anonimas desde el Hub pueden sufrir limitacion de tasa (HTTP 429); el autor recomienda definir `HF_TOKEN`.
- El articulo citado (arXiv:2606.13993) trata sobre frases verbo+particula, no sobre estos SAE: el propio autor aclara que los SAE son artefactos separados y no se discuten en el paper. No existe, por tanto, publicacion revisada que los avale directamente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/znhoughton/binomial-abspref-saes
- Dataset relacionado: https://huggingface.co/datasets/znhoughton/binom-ablation-finetune-corpus
- Perfil del autor en HuggingFace: https://huggingface.co/znhoughton/models
- Perfil del autor en GitHub: https://github.com/znhoughton/
- Repositorio UGE-audio-text-models: https://github.com/znhoughton/UGE-audio-text-models
- Modelos base OPT-BabyLM: https://huggingface.co/znhoughton/opt-babylm-125m-20eps-seed964, https://huggingface.co/znhoughton/opt-babylm-350m-20eps-seed964, https://huggingface.co/znhoughton/opt-babylm-1.3B-20eps-seed964
- Modelos base Pythia: https://huggingface.co/EleutherAI/pythia-160m, https://huggingface.co/EleutherAI/pythia-410m, https://huggingface.co/EleutherAI/pythia-1.4b
- Articulo citado en la model card: https://arxiv.org/abs/2606.13993 (Houghton et al., "The Holistic Storage of Verb+Up Phrases in Text-based and Audio-based Language Models")
- Trabajo relacionado sobre SAE y "answerability": https://arxiv.org/pdf/2502.19964v1
