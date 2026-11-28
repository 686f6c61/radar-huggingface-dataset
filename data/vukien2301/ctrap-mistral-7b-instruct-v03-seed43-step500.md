# vukien2301/ctrap-mistral-7b-instruct-v03-seed43-step500

## Resumen

CTRAP Mistral 7B Instruct v0.3 (seed 43, step 500) es un checkpoint de investigación publicado por el usuario vukien2301. Se trata de un ajuste fino de `mistralai/Mistral-7B-Instruct-v0.3` entrenado durante 500 pasos con semilla 43 para reproducir la defensa baseline denominada CTRAP frente a *harmful fine-tuning* (ajuste fino malicioso). No es un modelo de propósito general ni un modelo con certificación de seguridad: es un artefacto experimental generado con el script `baselines/run_all.py` del repositorio del artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*.

El modelo conserva la arquitectura y el tamaño del base: un transformer decoder-only de 7.248.031.744 parámetros (aproximadamente 7,25 mil millones), con pesos en safetensors y un repositorio de 14,6 GB. La relevancia es acotada y metodológica: sirve como punto de comparación reproducible para estudiar si las defensas pasivas frente a fine-tuning malicioso realmente sobreviven a un ataque posterior, y para replicar los resultados del paper citado.

No hay información sobre licencia específica, idiomas soportados ni datos de entrenamiento más allá de la referencia al base y al número de pasos. La model card indica explícitamente que el uso y la licencia siguen al modelo base Mistral-7B-Instruct-v0.3.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada de Mistral-7B-Instruct-v0.3) |
| Parámetros totales | 7.248.031.744 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la información proporcionada (el base Mistral-7B-Instruct-v0.3 soporta 32.768 tokens, según el modelo original) |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; cuantizaciones GGUF/AWQ no publicadas por el autor) |
| Idiomas soportados | no disponible |
| Licencia | no disponible como campo propio; la model card remite a la licencia del base `mistralai/Mistral-7B-Instruct-v0.3` |
| Formato de pesos | safetensors |
| Modelo base | mistralai/Mistral-7B-Instruct-v0.3 |
| Pasos de entrenamiento | 500 |
| Semilla | 43 |
| Repositorio | 14,6 GB |
| Librería | transformers |
| Pipeline | text-generation |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base Mistral-7B-Instruct-v0.3: un transformer decoder-only con atención de ventana deslizante (sliding window attention), RoPE y capas de normalización RMSNorm, con aproximadamente 7,25 mil millones de parámetros. El checkpoint no introduce cambios estructurales; el ajuste consiste en un fine-tuning de 500 pasos con semilla 43 sobre el modelo instructivo ya alineado.

El entrenamiento corresponde a la defensa CTRAP, descrita en el artículo *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models*, y se generó mediante el script `baselines/run_all.py` del repositorio asociado. La model card no detalla la composición del dataset de entrenamiento, el número de tokens procesados, la tasa de aprendizaje, el esquema de optimización ni si hubo RLHF o DPO adicionales. Tampoco se especifica el objetivo exacto de la pérdida de CTRAP más allá de su carácter de defensa frente a fine-tuning dañino. No se documentan innovaciones de decodificación (especulativa, atención lineal u otras) en este checkpoint.

## Capacidades

- Generación de texto conversacional, heredada del modelo instructivo base.
- Razonamiento y respuesta a instrucciones en formato chat, sujeto a la plantilla del base Mistral-7B-Instruct-v0.3.
- Defensa experimental frente a *harmful fine-tuning*: el checkpoint está entrenado para actuar como baseline CTRAP en experimentos de seguridad.
- No se documenta soporte explícito de tool calling ni de function calling en la información proporcionada.
- No se documenta soporte de agentes ni de razonamiento multi-paso específico más allá de lo que ofrece el base.
- Capacidades multilingües: no disponibles como dato declarado; dependen del base.
- No se documentan modos especiales (thinking mode, visión, audio) en este checkpoint.

## Casos de uso

- Reproducción de experimentos de seguridad: usar este checkpoint como baseline CTRAP en el pipeline `baselines/run_all.py` del repositorio del paper para comparar defensas frente a *harmful fine-tuning* bajo condiciones idénticas (500 pasos, semilla 43).
- Evaluación de robustez frente a ataques de fine-tuning: someter el modelo a un ajuste fino malicioso posterior y medir cuánto se degrada su alineación original, comparando con otras defensas del artículo.
- Investigación sobre geometría de barreras colaterales: analizar empíricamente la hipótesis del paper sobre *collateral barrier geometry* usando este checkpoint como punto de partida controlado.
- Ablaciones de semilla: al estar etiquetado con semilla 43, sirve para estudiar la varianza entre ejecuciones si se dispone de otros checkpoints con semillas distintas del mismo pipeline.
- Docencia y formación en seguridad de LLM: ejemplo práctico y reproducible de cómo se construye una defensa baseline y de sus límites, con un modelo de 7B ejecutable en hardware asequible.
- Validación de pipelines de evaluación: comprobar que las métricas de seguridad y utilidad del repositorio funcionan correctamente antes de lanzar experimentos más costosos con modelos mayores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 14,5 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica se recomienda 16-24 GB.
- VRAM estimada en cuantización de 8 bits: alrededor de 8 GB; en 4 bits, alrededor de 4-5 GB (estimaciones según el tamaño de parámetros, no publicadas por el autor).
- GPU recomendadas: A100 40/80 GB, H100 80 GB o L40S para fp16 con contexto largo; RTX 4090 (24 GB) para fp16 con contexto moderado.
- GPU de consumo: cabe en RTX 4090 y RTX 3090 en fp16; en RTX 4080/4070 Ti (16 GB) requiere cuantización de 8 bits; en GPUs de 8 GB solo en 4 bits.
- Opciones de despliegue: transformers (librería declarada), text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`), y previsiblemente vLLM, llama.cpp u Ollama tras convertir los pesos a GGUF, aunque el autor no publica dichas conversiones.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| CTRAP Mistral-7B (este checkpoint) | 7,25 B | no disponible | remite al base | Hugging Face, 0 descargas | Checkpoint de investigación, 500 pasos, semilla 43 |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens (según el modelo original) | Apache 2.0 (según el modelo original) | Hugging Face, ampliamente distribuido | Modelo base instructivo, sin defensa CTRAP |
| Mistral-7B-Instruct-v0.2 | 7,25 B | 32.768 tokens (según el modelo original) | Apache 2.0 (según el modelo original) | Hugging Face | Versión anterior del base, sin defensa CTRAP |
| Mistral-7B-v0.3 (base no instruct) | 7,25 B | 32.768 tokens (según el modelo original) | Apache 2.0 (según el modelo original) | Hugging Face | Modelo preentrenado sin alineación instructiva |

La comparación con otros modelos de defensa frente a *harmful fine-tuning* no está disponible en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo con certificación de seguridad; la propia model card lo declara explícitamente.
- Es un checkpoint de investigación de 500 pasos, no un modelo final ni validado para producción.
- Riesgo de alucinación y de degradación de la alineación heredado del base y del proceso de fine-tuning; no hay evaluaciones publicadas que lo cuantifiquen.
- Sesgos conocidos: no documentados en la información proporcionada; se presumen los del base Mistral-7B-Instruct-v0.3.
- Idiomas soportados no declarados; el comportamiento multilingüe depende del base y no está verificado para este checkpoint.
- Licencia no especificada de forma independiente: el uso comercial queda sujeto a la licencia de `mistralai/Mistral-7B-Instruct-v0.3`, que el autor remite sin detallar.
- Sin descargas ni likes: no hay evidencia de uso comunitario ni de validación externa.
- Las etiquetas `safety` y `harmful-fine-tuning` describen el propósito experimental del checkpoint, no garantizan que el modelo sea seguro frente a entradas adversarias.
- No se publican cuantizaciones (GGUF, AWQ, GPTQ) ni artefactos de despliegue listos para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vukien2301/ctrap-mistral-7b-instruct-v03-seed43-step500
- Modelo base: https://huggingface.co/mistralai/Mistral-7B-Instruct-v0.3
- Artículo citado: *No Cheap Escape: Collateral Barrier Geometry for Self-Destructive Language Models* (referenciado en la model card; no se proporciona URL en la información disponible)
- Repositorio del artículo con `baselines/run_all.py`: no disponible en la información proporcionada
