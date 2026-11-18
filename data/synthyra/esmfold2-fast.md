# Synthyra/ESMFold2-Fast

## Resumen

ESMFold2-Fast es un modelo de prediccion de estructura de proteinas publicado por Synthyra bajo el identificador `Synthyra/ESMFold2-Fast`. Empaqueta el checkpoint `biohub/ESMFold2-Fast` con el runtime FastPLMs para Hugging Face Transformers, de modo que puede cargarse mediante la interfaz estandar `AutoModel` con `trust_remote_code=True`. El modelo resuelve la prediccion de estructura tridimensional de proteinas y complejos proteicos a partir de secuencias de aminoacidos en bruto, generando ficheros mmCIF con campos de confianza.

La arquitectura es un transformer de 24 bloques con un tronco de plegado ("folding trunk") y una cabeza de difusion para la generacion de coordenadas atomicas. Cuenta con 188.819.011 parametros totales y un repositorio de 0,8 GB en formato safetensors. Es una variante optimizada para inferencia de secuencia unica: fue entrenada sin condicionamiento por MSA (alineamiento multiple de secuencias) y rechaza explicitamente entradas derivadas de MSA.

Su relevancia actual radica en que ofrece plegado de proteinas y complejos multiméricos dentro del ecosistema Transformers, con soporte para atencion `sdpa`, `eager` y `flex_attention`, decodificacion por difusion con multiples muestras y pasos, y cabezas de clasificacion a nivel de secuencia y de residuo reutilizando el backbone preentrenado. La licencia MIT facilita su integracion en pipelines de investigacion y produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de 24 bloques con tronco de plegado y cabeza de difusion (ESMFold2) |
| Parametros totales | 188.819.011 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; el ejemplo usa float32 con precision bf16 para el componente ESM-C) |
| Idiomas soportados | no disponible (modelo de proteinas; entrada en secuencias de aminoacidos) |
| Licencia | MIT |
| Formato de pesos | safetensors |
| Pipeline | feature-extraction |
| Tamano del repositorio | 0,8 GB |
| Requisitos de entorno | Python 3.12-3.14, PyTorch 2.14, Transformers 5.17 |
| Backends de atencion | eager, sdpa, flex_attention |
| Condicionamiento por MSA | no (rechaza `ProteinInput.msa`) |

## Arquitectura y entrenamiento

El modelo sigue la descripcion oficial de la arquitectura Biohub ESMFold2 (referenciada en el Apendice A.2.1 del paper `esm_protein.pdf`). Consta de un backbone tipo protein language model (pLM) que produce representaciones por residuo, un tronco de plegado que transforma esas representaciones en geometria estructural y una cabeza de difusion que genera coordenadas atomicas mediante muestreo iterativo. La variante Fast se compone de 24 bloques y esta optimizada para inferencia de secuencia unica.

Un aspecto tecnico destacable es que este checkpoint fue entrenado **sin condicionamiento por MSA**: rechaza `ProteinInput.msa` y las caracteristicas derivadas de MSA en el forward de bajo nivel. Soporta entradas tipadas multichain y multimolecula siempre que cada cadena proteica use `msa=None`. Para inferencia condicionada por MSA debe usarse el checkpoint completo de ESMFold2. El modelo incluye una cabeza de confianza habilitada que devuelve campos de confianza junto con la estructura. El proceso de plegado acepta parametros como `num_loops`, `num_diffusion_samples` y `seed`, lo que permite controlar el muestreo por difusion. No se dispone de informacion sobre el numero de tokens de entrenamiento ni sobre la composicion del dataset.

## Capacidades

- Prediccion de estructura tridimensional de proteinas individuales a partir de secuencias de aminoacidos, con salida en formato mmCIF.
- Plegado de complejos proteicos multiméricos mediante especificaciones tipadas (`StructurePredictionInput` con multiples `ProteinInput`).
- Generacion de multiples muestras por difusion (`num_diffusion_samples`) y control de iteraciones (`num_loops`) y semilla (`seed`).
- Cabeza de confianza habilitada: devuelve campos de confianza junto con las coordenadas.
- Extraccion de caracteristicas (pipeline `feature-extraction`) a partir del backbone pLM.
- Clasificacion a nivel de secuencia (`AutoModelForSequenceClassification`) y a nivel de residuo (`AutoModelForTokenClassification`), con cabezas de clasificacion nuevas que requieren fine-tuning.
- Soporte de PEFT/LoRA para ajuste fino, incluido `TaskType.SEQ_CLS` con `target_modules="all-linear"`.
- Soporte de entradas multimolecula y multichain (sin MSA).
- No soporta condicionamiento por MSA en esta variante.

## Casos de uso

- Prediccion de estructura de proteinas individuales: cargar el modelo con `AutoModel.from_pretrained` y llamar a `fold` con un `ProteinInput` de una sola cadena para obtener un mmCIF con coordenadas y confianza; util para anotacion estructural rapida sin MSA.
- Modelado de complejos proteina-proteina: usar `StructurePredictionInput` con varias cadenas (`id="A"`, `id="B"`, etc.) para predecir la interfaz de un complejo binario, como en el ejemplo del autor con dos secuencias.
- Generacion de ensembles conformacionales: emplear `num_diffusion_samples` mayor que 1 y distintas semillas para muestrear varias conformaciones y analizar la variabilidad estructural predicha.
- Extraccion de embeddings proteicos: usar el pipeline `feature-extraction` para obtener representaciones por residuo o por secuencia que alimenten modelos downstream de clasificacion, regresion o clustering.
- Clasificacion de propiedades proteicas: ajustar con LoRA las cabezas de `AutoModelForSequenceClassification` (por ejemplo, para predecir estabilidad o localizacion) reutilizando el backbone preentrenado.
- Anotacion a nivel de residuo: ajustar `AutoModelForTokenClassification` para tareas como prediccion de sitios activos, regiones desordenadas o epitopos, usando etiquetas con `-100` fuera de posiciones biologicas.
- Integracion en pipelines bioinformaticos: el soporte de `trust_remote_code` y la interfaz Transformers permiten incorporar el plegado en flujos automatizados de analisis estructural, con validacion en contenedores Docker sobre cualquier dispositivo CUDA compatible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; con 188,8 M de parametros, los pesos en float32 ocupan aproximadamente 0,75 GB, a lo que se suma el estado de activaciones y el muestreo por difusion.
- GPU recomendadas: no se especifica ningun producto de GPU concreto; el autor indica que la validacion se ejecuta en Docker sobre cualquier dispositivo CUDA compatible.
- Cabe en GPU de consumo: previsiblemente si, dado el tamano del checkpoint (0,8 GB de repositorio) y el uso de `device_map="cuda"`, aunque no se confirma oficialmente.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; el ejemplo usa `attn_implementation="sdpa"` y `dtype=torch.float32` con `esmc_precision="bf16"`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. El modelo expone `set_chunk_size(32)` para controlar el procesamiento por bloques y `verbose` para mostrar u ocultar el progreso de plegado.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Condicionamiento MSA | Licencia | Formato |
|---|---|---|---|---|---|
| Synthyra/ESMFold2-Fast | 188,8 M | no disponible | No | MIT | safetensors |
| biohub/ESMFold2-Fast (checkpoint original) | no disponible | no disponible | No | no disponible | no disponible |
| ESMFold2 completo (Biohub) | no disponible | no disponible | Si | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo (benchmarks) entre estas variantes en la informacion proporcionada. La diferencia documentada es funcional: esta variante de 24 bloques esta optimizada para secuencia unica y rechaza MSA, mientras que el checkpoint completo de ESMFold2 admite inferencia condicionada por MSA.

## Limitaciones y advertencias

- No admite condicionamiento por MSA: rechaza `ProteinInput.msa` y caracteristicas derivadas de MSA; para esos casos debe usarse el checkpoint completo de ESMFold2.
- Las cabezas de clasificacion de secuencia y de residuo se inicializan de nuevo y no estan entrenadas; sus logits no deben interpretarse como predicciones sin fine-tuning previo.
- El tronco de plegado se omite en las tareas de clasificacion, por lo que estas no aprovechan la geometria estructural.
- No se han publicado datos de sesgos, tasas de alucinacion estructural ni evaluaciones de robustez en la informacion disponible.
- Requiere versiones muy especificas del entorno (Python 3.12-3.14, PyTorch 2.14, Transformers 5.17), lo que puede complicar la integracion en stacks existentes.
- El uso de `trust_remote_code=True` implica ejecutar codigo del repositorio; conviene auditar el codigo embebido antes de desplegarlo en produccion.
- La licencia MIT permite uso comercial, pero no se documentan restricciones adicionales sobre los datos de entrenamiento ni sobre las salidas estructurales.
- No hay informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el proceso de alineacion (RLHF/DPO).

## Enlaces

- Hugging Face: https://huggingface.co/Synthyra/ESMFold2-Fast
- Requisitos del modelo: https://huggingface.co/Synthyra/ESMFold2-Fast/resolve/main/requirements.txt
- Paper de arquitectura Biohub ESM (Apendice A.2.1): https://biohub.ai/papers/esm_protein.pdf
