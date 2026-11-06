# VectaBass/vectabass-618m-11.5bt-base-cooled

## Resumen

vectabass-618m-11.5bt-base-cooled es un modelo de lenguaje base de 617,9 millones de parametros totales (527,7 millones no-embedding) desarrollado por VectaBass, entrenado sobre 11.520 millones de tokens. Forma parte de la "Phase 1 AR square", una escalera de modelos que va de 100M a 1.6B parametros no-embedding, donde cada tamano se entrena con varios presupuestos de tokens y todos se publican juntos para permitir verificar empiricamente las leyes de escala. Esta celda concreta corresponde a la celda N4-D4 del paper.

La arquitectura es de tipo Llama, con atencion causal GQA 2:1, pero incorpora exclusive self-attention (XSA), un mecanismo que Llama no tiene. Usa SwiGLU en la feed-forward, RMSNorm pre-norm, RoPE con base 10000 y una longitud de contexto de 2048 tokens. El vocabulario es GPT-2 BPE (50257 tokens) ampliado con 26 tokens especiales hasta 50304 filas, con embeddings atados.

Su relevancia es doble: por un lado, es un modelo pequeno con licencia Apache 2.0 y pesos safetensors, util para experimentacion y para validar recetas de entrenamiento; por otro, su etiqueta "uk-sovereign-ai" y la inclusion de fuentes parlamentarias britanicas y lenguas celtas (gales, gaelico escoces, irlandes, manes, cornes y scots) lo convierten en un recurso poco habitual para investigacion en lenguas minoritarias. No esta ajustado a instrucciones ni a seguridad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only tipo Llama con exclusive self-attention (XSA) |
| Parametros totales | 617.852.928 |
| Parametros activos | no disponible (no es MoE) |
| Parametros no-embedding | 527.708.160 |
| Longitud de contexto | 2048 tokens |
| Tipos de cuantizacion | no disponible (entrenado y publicado en bf16) |
| Idiomas soportados | en, cy, gd, ga, gv, kw, sco |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (repo de 3.7 GB) |
| Ancho / capas | 1792 / 15 |
| Cabeceras | 28 query, 14 key-value, dim 64 (GQA 2:1) |
| Feed-forward | SwiGLU, dimension 4752 |
| Normalizacion | RMSNorm, pre-norm |
| Posiciones | RoPE, base 10000 |
| Vocabulario | 50304 filas (GPT-2 BPE 50257 + 26 especiales + padding) |
| Libreria | transformers (custom code: `modeling_vectabass.py`) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 15 capas con ancho 1792. La atencion es causal con GQA 2:1 (28 cabeceras de query frente a 14 de key-value, dimension 64) y anade exclusive self-attention (XSA), una variante que modifica el calculo de atencion respecto al transformer Llama estandar. La feed-forward SwiGLU tiene dimension 4752 y la normalizacion es RMSNorm en configuracion pre-norm. Las posiciones se codifican con RoPE de base 10000, limitando el contexto a 2048 tokens.

El entrenamiento consumio 11.519.721.472 tokens (22 por parametro no-embedding), con un batch de 458.752 tokens. El optimizador combina Muon para las matrices ocultas (NS 5, Moonlight RMS 0.2, momentum 0.95) con AdamW en fp32 (betas 0.9 y 0.95). El pico de learning rate fue 0.00148, con un warmup de 437M tokens, una fase constante y un cooldown 1-sqrt hasta cero en el ultimo 20% del entrenamiento. El weight decay aplicado a matrices fue 0.0575. Se entreno en bf16 (pesos y activaciones) con pesos maestros fp32 en el optimizador, y estadisticos de norma, angulos RoPE y logits en fp32, sobre 2 x NVIDIA GH200 de 120GB.

Los datos provienen de la vista "phase-1-release": 47 bins de texto con licencia abierta, unos 96B tokens unicos, con fuentes del sector publico britanico, parlamentarias y de lenguas celtas. Las fuentes declaradas son FineWeb-Edu, FineWeb-2 y FineMath. El detalle de cada bin, su proporcion y licencia esta en `DATA.md`. Existen replicas semilla en las ramas `seed2` y `seed3` (misma receta con nueva inicializacion y orden de datos), pensadas para medir el ruido entre ejecuciones.

## Capacidades

- Generacion de texto autoregresiva en modo base (completado, no instrucciones).
- Modelado de lenguaje y continuacion de contextos de hasta 2048 tokens.
- Cobertura multilingue limitada pero especifica: ingles como idioma principal y participacion menor de gales, gaelico escoces, irlandes, manes, cornes y scots.
- Capacidad de servir como punto de partida para fine-tuning supervisado o para experimentos de escalado.
- No dispone de tool calling ni function calling nativo.
- No dispone de modo de razonamiento explicito (thinking mode).
- No dispone de capacidades de vision ni audio.
- No dispone de soporte de agentes ni de razonamiento multi-paso orquestado.
- Reproducibilidad bit a bit de los logits del codigo de entrenamiento bajo PyTorch SDPA (el entrenamiento uso FlashAttention-4).

## Casos de uso

- Investigacion en leyes de escala: al formar parte de una escalera de modelos con varios presupuestos de tokens, permite contrastar predicciones de scaling laws con resultados reales y medir el ruido entre semillas usando las ramas `seed2` y `seed3`.
- Fine-tuning para tareas de clasificacion o extraccion: con 527,7M parametros no-embedding y contexto de 2048, es viable ajustarlo en una sola GPU para tareas como etiquetado de documentos o analisis de sentimiento en dominios especializados.
- Experimentacion con lenguas celtas: es uno de los pocos modelos base publicos con presencia declarada de gales, gaelico escoces, irlandes, manes, cornes y scots, util para evaluar tecnicas de adaptacion en lenguas de bajos recursos.
- Generacion de texto asistida en dominios parlamentarios o de sector publico britanico: la inclusion de fuentes parlamentarias en el corpus lo hace adecuado como base para prototipos de resumen o redaccion en esos registros, previo fine-tuning.
- Destilacion y generacion de datos sinteticos: al ser pequeno y rapido de ejecutar, puede emplearse como generador de candidatos o como modelo alumno en pipelines de destilacion desde modelos mayores.
- Pruebas de infraestructura de inferencia: su tamano reducido permite validar configuraciones de vLLM, llama.cpp o TGI, y comparar precision bf16 frente a alternativas cuantizadas antes de escalar a modelos mayores.
- Baseline academico: sirve como referencia controlada en articulos que comparen arquitecturas con XSA frente a transformers convencionales.

## Benchmarks y rendimiento

Los benchmarks zero-shot de este modelo no se han medido todavia, segun la model card. El unico dato de evaluacion publicado es la perdida de validacion sobre el canon retenido (phase-1-release canon-8192, 8192 x 2048 tokens): 2.1155 nats por token, con 2.1156 al reproducir con PyTorch SDPA.

| Metrica | Valor |
|---|---|
| Perdida de validacion (canon-8192) | 2.1155 nats/token |
| Perdida al reproducir con SDPA | 2.1156 nats/token |
| MMLU | no disponible |
| HumanEval | no disponible |
| GSM8K | no disponible |

## Requisitos de hardware

- VRAM estimada en bf16: aproximadamente 1,3 GB para los pesos (617,9M parametros a 2 bytes), mas overhead de activaciones y cache KV; en la practica cabe holgadamente en cualquier GPU con 4 GB o mas.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 0,7 GB de pesos; en 4 bits, alrededor de 0,4 GB. No se han publicado artefactos cuantizados oficiales.
- GPU recomendadas: cualquier GPU moderna es suficiente; para entrenamiento o fine-tuning se recomienda al menos 24 GB (RTX 3090, RTX 4090, A10G, L4), y para inferencia basta una GPU consumer de gama media. El entrenamiento original uso 2 x NVIDIA GH200 de 120GB.
- Cabe en GPU consumer: si, en practicamente todas las GPU consumer con al menos 4 GB de VRAM.
- Opciones de despliegue: transformers con `trust_remote_code=True` (requiere cargar `modeling_vectabass.py`); la compatibilidad con vLLM, llama.cpp, Ollama o TGI no esta confirmada en la informacion disponible, y dado que la arquitectura incorpora XSA y codigo personalizado, es probable que requiera adaptacion.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| vectabass-618m-11.5bt-base-cooled | 617,9M totales (527,7M no-embedding) | 2048 | Apache 2.0 | XSA, multilingue celta, base sin ajuste |
| Pythia-410m | 410M | 2048 | Apache 2.0 | Suite de escalado con semillas multiples |
| Pythia-1B | 1,0B | 2048 | Apache 2.0 | Suite de escalado con semillas multiples |
| TinyLlama-1.1B | 1,1B | 2048 | Apache 2.0 | Entrenado sobre 3T tokens, base |

La comparativa se limita a parametros, contexto y licencia; no hay datos de benchmarks publicados para este modelo que permitan comparar rendimiento de forma rigurosa. Pythia y TinyLlama se incluyen por ser alternativas de tamano y proposito similares (modelos base pequenos con licencia permisiva), pero sus resultados no son directamente contrastables con esta celda sin evaluaciones homogeneas.

## Limitaciones y advertencias

- Es un modelo base entrenado para un estudio de escalado, no un asistente: producira afirmaciones falsas con fluidez y no sigue instrucciones de forma fiable.
- No tiene ajuste a instrucciones ni ajuste de seguridad, y no filtra salidas.
- Contexto limitado a 2048 tokens, insuficiente para tareas que requieran documentos largos.
- Predominio del ingles; las lenguas celtas aparecen en proporciones menores y su calidad no esta evaluada.
- Riesgo de sesgos derivado de las fuentes web (FineWeb-Edu, FineWeb-2) y de las fuentes del sector publico britanico, sin documentacion de mitigacion.
- Riesgo elevado de alucinacion en uso generativo directo, dado que no hay evaluacion zero-shot publicada.
- La licencia Apache 2.0 permite uso comercial, pero la ausencia de ajuste de seguridad traslada al integrador la responsabilidad sobre las salidas.
- Requiere `trust_remote_code=True` y ejecucion del codigo del repositorio (`modeling_vectabass.py`), lo que implica revisar y confiar en ese codigo antes de desplegarlo.
- El soporte en frameworks de inferencia optimizados (vLLM, llama.cpp, TGI) no esta confirmado y puede requerir implementacion propia de XSA.
- El modelo esta publicado con 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia externa de uso en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VectaBass/vectabass-618m-11.5bt-base-cooled
- Repositorio de datos (`DATA.md`) y procedencia (`provenance.json`): referenciados dentro del repositorio de Hugging Face
- Dataset FineWeb-Edu: https://huggingface.co/datasets/HuggingFaceFW/fineweb-edu
- Dataset FineWeb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset FineMath: https://huggingface.co/datasets/HuggingFaceTB/finemath
- Referencia Isambard-AI (McIntosh-Smith, Alam y Woods, 2024): https://doi.org/10.48550/arXiv.2410.11199
- Paper del modelo: no disponible (anunciado como "forthcoming" en la model card)
