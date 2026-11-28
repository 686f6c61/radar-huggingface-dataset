# vukien2301/ctrap-mistral-7b-instruct-v03-seed44-step500

## Resumen

CTRAP Mistral 7B Instruct v0.3 (seed 44, step 500) es un checkpoint de investigación publicado por el usuario `vukien2301` en Hugging Face. Se trata de un ajuste fino del modelo base `mistralai/Mistral-7B-Instruct-v0.3` orientado a seguridad, concretamente a la defensa frente a ajustes finos maliciosos (*harmful fine-tuning*). El autor lo etiqueta como "baseline defense" del método CTRAP y lo vincula al artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*.

El modelo conserva la arquitectura Mistral de 7B parámetros (7.248.031.744 según los pesos en safetensors), con licencia y condiciones de uso heredadas del modelo base Apache 2.0 de Mistral AI. El repositorio ocupa 14,6 GB y contiene pesos en formato safetensors compatibles con `transformers` y con text-generation-inference.

Su relevancia es acotada y experimental: no es un modelo de producción ni está certificado como seguro. Se publica como artefacto reproducible (semilla 44, 500 pasos) para comparativas de investigación sobre robustez frente a ataques de ajuste fino. No hay métricas, dataset ni detalles de entrenamiento publicados en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Mistral, basado en `mistralai/Mistral-7B-Instruct-v0.3`) |
| Parametros totales | 7.248.031.744 |
| Parametros activos | no aplica (modelo denso, no MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el modelo base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens, pero no se confirma para este checkpoint) |
| Tipos de cuantizacion | no disponible (solo se publican pesos safetensors; no se listan GGUF ni cuantizaciones oficiales) |
| Idiomas soportados | no disponible |
| Licencia | no disponible en la ficha; el autor indica que se hereda del modelo base (`mistralai/Mistral-7B-Instruct-v0.3`, Apache 2.0) |
| Formato de pesos | safetensors |
| Tamano del repositorio | 14,6 GB |
| Libreria | transformers |
| Pipeline | text-generation |
| Etiquetas | safety, harmful-fine-tuning, self-destructive-defense, ctrap |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El checkpoint parte de `mistralai/Mistral-7B-Instruct-v0.3`, un transformer decoder-only denso de 7B parámetros con atención por ventanas deslizantes y atención completa alternadas, tokenizador SentencePiece de 32.768 entradas y ventana de contexto de 32.768 tokens en el modelo base. Sobre esa arquitectura, el autor aplica un ajuste fino de 500 pasos con semilla 44 para instanciar la defensa CTRAP.

La model card no detalla la composición del dataset, el número de tokens vistos, la función de pérdida ni si se emplearon técnicas de RLHF o DPO. Únicamente se indica que el checkpoint se generó con `baselines/run_all.py` del repositorio del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, como baseline de comparación. No se documentan innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.) más allá de las propias del modelo base.

## Capacidades

- Generación de texto conversacional en inglés (idioma del modelo base; no se confirman otros idiomas).
- Razonamiento de propósito general y respuesta a instrucciones, heredados de Mistral-7B-Instruct-v0.3.
- Generación de código y matemáticas básicas, en la medida en que lo soporta el modelo base.
- Soporte de *tool calling* y *function calling*: no disponible explícitamente en la información proporcionada; el modelo base Mistral-7B-Instruct-v0.3 no incluye un formato nativo de function calling, aunque puede emularlo mediante prompting.
- Capacidades de agente y razonamiento multi-paso: no documentadas para este checkpoint.
- Capacidades multilingües: no documentadas.
- Capacidades especiales (modo *thinking*, visión, audio): no disponibles.
- Comportamiento de seguridad: el checkpoint está entrenado como defensa frente a ajustes finos maliciosos, pero el autor advierte explícitamente que **no es un modelo certificado como seguro**.

## Casos de uso

- Investigación en seguridad de modelos: reproducir el baseline CTRAP con semilla 44 y 500 pasos para comparar con otras defensas frente a *harmful fine-tuning*. El checkpoint está pensado precisamente para esta comparativa.
- Evaluación de robustez frente a ataques de ajuste fino: usar el modelo como punto de partida y aplicar sobre él ajustes finos maliciosos controlados para medir la degradación de la alineación de seguridad.
- Reproducibilidad de experimentos: al fijar semilla y número de pasos, permite repetir exactamente el mismo punto de partida en pipelines de evaluación automatizados.
- Estudio de geometría de barreras colaterales: el artículo asociado propone un marco geométrico; este checkpoint sirve para validar empíricamente sus predicciones sobre la resistencia del modelo a la corrupción de pesos.
- Benchmarking interno de defensas: comparar CTRAP contra otras técnicas (p. ej. vacunas o regularización) usando el mismo modelo base y el mismo protocolo de evaluación.
- Docencia y divulgación: ilustrar en cursos o charlas cómo se construye y evalúa una defensa de *self-destructive defense* sobre un LLM de 7B.
- Fine-tuning posterior legítimo: partir de este checkpoint en lugar del base para tareas que requieran un punto de partida ya alineado con seguridad, siempre que se valide el comportamiento resultante.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: en torno a 14-15 GB solo para pesos, más overhead de activaciones y caché KV; se recomienda al menos 24 GB para contexto largo.
- VRAM estimada en cuantización de 8 bits: aproximadamente 8 GB de pesos; en 4 bits, en torno a 4-5 GB.
- GPU recomendadas: A100 40/80 GB, H100 80 GB, L40S 48 GB para despliegue en FP16 con contexto amplio; RTX 4090 24 GB válida para FP16 con contexto moderado.
- GPU de consumo: cabe en RTX 3090/4090 (24 GB) en FP16 y en GPUs de 8-12 GB si se cuantiza a 4-8 bits.
- Opciones de despliegue: `transformers`, text-generation-inference (el repo incluye la etiqueta `text-generation-inference` y `endpoints_compatible`), vLLM y llama.cpp/Ollama si se generan cuantizaciones GGUF (no publicadas oficialmente).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Proposito | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| CTRAP Mistral-7B-Instruct-v0.3 (seed 44, step 500) | 7,25B | no disponible | Defensa frente a *harmful fine-tuning* (investigación) | Heredada del base (Apache 2.0 según el autor) | Hugging Face, 0 descargas |
| `mistralai/Mistral-7B-Instruct-v0.3` | 7,25B | 32.768 tokens | Instrucciones generales | Apache 2.0 | Hugging Face, ampliamente usado |
| Mistral-7B-Instruct-v0.2 | 7,25B | 32.768 tokens | Instrucciones generales | Apache 2.0 | Hugging Face |
| Zephyr-7B-beta | 7,25B | 32.768 tokens | Instrucciones alineadas con DPO | MIT | Hugging Face |

No se dispone de benchmarks que permitan comparar el rendimiento de este checkpoint con las alternativas listadas.

## Limitaciones y advertencias

- El autor indica explícitamente que **no es un modelo certificado como seguro**; no debe desplegarse en producción como filtro de seguridad.
- Es un checkpoint de investigación con 0 descargas y 0 likes; no ha pasado por revisión comunitaria.
- No se documentan sesgos conocidos, pero al derivar de Mistral-7B-Instruct-v0.3 hereda los sesgos de su dataset de entrenamiento original.
- Riesgo de alucinación: no cuantificado; el modelo base presenta alucinaciones típicas de LLMs de 7B.
- Idiomas: no se confirman; el modelo base está optimizado para inglés.
- Restricciones de licencia: la ficha no declara licencia propia; el autor remite a la del modelo base. Verificar los términos de Mistral-7B-Instruct-v0.3 (Apache 2.0) antes de cualquier uso comercial.
- El ajuste fino de 500 pasos puede haber degradado capacidades del modelo base; no hay evaluaciones publicadas que lo confirmen o descarten.
- No hay cuantizaciones oficiales ni artefactos GGUF; el despliegue en hardware de consumo requiere generarlas.
- Fecha de creación declarada en el repositorio: 2026-11-28 (metadato a verificar).

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vukien2301/ctrap-mistral-7b-instruct-v03-seed44-step500
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Artículo referenciado por el autor: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (no se proporciona URL en la información disponible)
- Repositorio del artículo (`baselines/run_all.py`): no se proporciona URL en la información disponible
- Paper de Mistral 7B: https://arxiv.org/abs/2310.06825
