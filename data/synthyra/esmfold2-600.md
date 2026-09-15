# Synthyra/ESMFold2-600

## Resumen

Synthyra/ESMFold2-600 es un paquete de pesos y codigo para Hugging Face Transformers que envuelve el checkpoint `biohub/ESMFold2-Experimental-Fast-base600M-step1500k` dentro del runtime FastPLMs. Se trata de un modelo de lenguaje de proteinas (pLM) con cabeza de plegamiento estructural, publicado por el usuario Synthyra bajo licencia MIT, orientado a extraccion de caracteristicas y prediccion estructural de secuencias de aminoacidos.

El modelo acepta secuencias crudas de aminoacidos o especificaciones tipadas de complejos moleculares, y expone tres interfaces: extraccion de representaciones (feature-extraction), clasificacion de secuencia y de residuo, y plegamiento de proteinas mediante un sampler de difusion de 15 pasos con tres bucles de plegamiento. El backbone es el modelo congelado `Synthyra/ESMplusplus_large` (ESM++), y el tronco de plegamiento consta de 24 bloques. El total de parametros almacenados en safetensors es de 171.172.779, con un repositorio de 0,7 GB.

Es relevante ahora porque empaqueta un checkpoint experimental de plegamiento sin necesidad de MSA (alineamiento multiple de secuencias), lo que simplifica enormemente el pipeline de inferencia frente a aproximaciones clasicas tipo AlphaFold. Ademas, expone una representacion aprendida de 256 dimensiones por residuo, util para tareas downstream de biologia computacional. Como contrapartida, el modelo no dispone de cabeza de confianza (pLDDT, pTM, iPTM y PAE estan deshabilitados) y las cabezas de clasificacion se inicializan de cero, por lo que requieren ajuste fino antes de interpretar sus logits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de proteinas (pLM) con tronco de plegamiento de 24 bloques y sampler de difusion; backbone ESM++ congelado |
| Parametros totales | 171.172.779 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible como conjunto cerrado; el backbone opera en BF16 y el plegamiento mantiene pesos en FP32 con autocast BF16 en CUDA; las peticiones en FP8 fallan |
| Idiomas soportados | no disponible (modelo sobre secuencias de aminoacidos, no sobre lenguaje natural) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo combina un backbone de lenguaje de proteinas ESM++ congelado (`Synthyra/ESMplusplus_large`, declarado en configuracion como paso 1.500.000) con un tronco de plegamiento de 24 bloques y un sampler de difusion de 15 pasos y tres bucles de plegamiento, que son los valores por defecto del checkpoint. Los pesos del backbone declarados en configuracion y los pesos ESM++ fijados son exactamente iguales a nivel de tensor en BF16 tras la conversion de layout. El plegamiento se ejecuta con parametros en FP32 bajo autocast BF16 en CUDA.

La representacion aprendida proyecta el estado oculto `H: (b, l, 37, 1152)` a una representacion `Z: (b, l, 256)`, de modo que `embed_dataset` devuelve un vector de 256 dimensiones por residuo y secuencia. Las clases de clasificacion de secuencia y de token reutilizan el backbone del checkpoint pero crean una cabeza `classifier` nueva y sin entrenar, que aplica la mezcla de estados de pLM aprendida por el checkpoint y su proyeccion, seguidas de una sonda transformer entrenable. El tronco de plegamiento se omite en esas rutas. Esta version experimental fue entrenada sin condicionamiento por MSA: rechaza `ProteinInput.msa` y cualquier caracteristica derivada de MSA, aunque admite entradas tipadas multicadena y multimolecula.

## Capacidades

- Extraccion de caracteristicas de secuencias de proteinas: genera una representacion de 256 dimensiones por residuo mediante `embed_dataset`.
- Plegamiento de proteinas: prediccion de coordenadas atomicas con `infer_protein`, con control de semilla (`seed`) y numero de muestras de difusion (`num_diffusion_samples`).
- Inferencia sobre secuencias crudas de aminoacidos o sobre especificaciones tipadas de complejos moleculares.
- Soporte de entradas multicadena y multimolecula (sin condicionamiento por MSA).
- Clasificacion de secuencia (`AutoModelForSequenceClassification`) y clasificacion de residuo (`AutoModelForTokenClassification`) con etiquetas de forma `(b,)` y `(b, l)` respectivamente, usando `-100` fuera de posiciones biologicas.
- Ajuste fino con PEFT/LoRA sobre el checkpoint cargado, con modulos objetivo configurables y guardado opcional de la cabeza `classifier`.
- Backends de atencion seleccionables: `eager`, `sdpa` y `flex_attention`, con fallback eager documentado para materializar tensores de atencion con `output_attentions=True`.
- Ejecucion offline mediante artefacto local fijado por manifiesto y `local_files_only=True`.
- No ofrece generacion de texto ni capacidades de lenguaje natural: es un modelo especializado en proteinas.
- No expone cabeza de confianza: pLDDT, pTM, iPTM y PAE no estan disponibles.

## Casos de uso

- Anotacion funcional de proteinas a gran escala: usar la extraccion de representaciones de 256 dimensiones por residuo para entrenar clasificadores ligeros de familia, localizacion subcelular o afinidad, aprovechando que el backbone ya esta preentrenado y congelado.
- Prediccion de estructura para proteinas sin homologia conocida: `infer_protein` permite obtener coordenadas atomicas directamente de la secuencia sin necesidad de construir un MSA, lo que acelera el analisis de proteinas huerfanas o de diseno de novo.
- Cribado virtual de variantes: generar estructuras o representaciones para cientos de mutantes puntuales y comparar desviaciones respecto a la referencia, con semilla fija para reproducibilidad.
- Clasificacion de residuos en tareas de anotacion por posicion (sitios activos, regiones de union, epitopos), ajustando la cabeza de token classification con un numero de etiquetas pequeno.
- Modelado de complejos multimolecula: la aceptacion de entradas tipadas multicadena y multimolecula permite estudiar interfaces proteina-proteina o proteina-ligando sin condicionamiento por MSA.
- Integracion en pipelines de biologia computacional: la compatibilidad con la interfaz `PreTrainedModel`, el uso de `trust_remote_code` y el soporte de artefactos offline permiten desplegar el modelo en entornos aislados y en flujos de validacion reproducibles en Docker.
- Ajuste fino con LoRA para dominios especificos: con `r=8`, `lora_alpha=16` y `target_modules="all-linear"` es posible adaptar el modelo a familias de proteinas concretas manteniendo el backbone congelado, reduciendo requisitos de memoria.
- Extraccion de embeddings para busqueda de similitud estructural: indexar las representaciones de 256 dimensiones y recuperar proteinas con perfiles de embedding proximos como proxy de similitud funcional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: los pesos totales suman 171.172.779 parametros, lo que equivale a aproximadamente 0,34 GB en BF16 y 0,68 GB en FP32; el repositorio ocupa 0,7 GB. El plegamiento mantiene pesos en FP32 con autocast BF16, por lo que el consumo real es superior al de la mera carga de pesos y depende de la longitud de la secuencia.
- GPU recomendadas: cualquier dispositivo CUDA compatible; la model card indica que la validacion se ejecuta en Docker sobre cualquier dispositivo CUDA compatible y que no se exige un producto de GPU o estacion de trabajo concretos.
- Cabe en GPU de consumo: si, es previsible que quepa en GPU de consumo con al menos unos pocos GB de VRAM, dado el tamano de 171 millones de parametros, aunque no se especifica una cota exacta de memoria en la informacion disponible.
- Cuantizaciones en FP8: no soportadas; las peticiones en FP8 fallan.
- Opciones de despliegue: Transformers con `trust_remote_code=True`; el runtime FastPLMs va embebido en el repositorio. Se documenta ejecucion en Docker y ejecucion offline con artefacto local. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Requisitos de entorno: Python 3.11-3.14, PyTorch 2.13 y Transformers 5.13. Las dependencias directas se instalan desde el `requirements.txt` del repositorio.
- Latencia y throughput: no disponibles. Se documenta un sampler de 15 pasos y tres bucles de plegamiento como valores por defecto del checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synthyra/ESMFold2-600 | 171.172.779 | no disponible | no disponible | MIT | Hugging Face, `trust_remote_code=True` |
| biohub/ESMFold2-Experimental-Fast-base600M-step1500k | no disponible | no disponible | no disponible | no disponible | Checkpoint de origen citado en la model card |
| Synthyra/ESMplusplus_large | no disponible | no disponible | no disponible | no disponible | Backbone congelado usado por este modelo |
| Otros modelos de plegamiento sin MSA | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos cuantitativos de rendimiento, contexto ni parametros de los modelos alternativos en la informacion proporcionada, por lo que no es posible establecer una comparacion numerica fiable. Nota: los sufijos 300 y 600 del nombre describen la escala del backbone, no el numero total de parametros del modelo.

## Limitaciones y advertencias

- La cabeza de confianza esta deshabilitada: no se pueden obtener pLDDT, pTM, iPTM ni PAE, lo que impide filtrar predicciones estructurales por confianza.
- El modelo fue entrenado sin condicionamiento por MSA y rechaza `ProteinInput.msa` y caracteristicas derivadas de MSA; los flujos que dependan de MSA no son compatibles.
- Las cabezas de clasificacion de secuencia y de token se inicializan de nuevo y no estan entrenadas: sus logits no deben interpretarse como predicciones hasta haberlas ajustado.
- El checkpoint es experimental (denominado "Experimental Fast"), por lo que su estabilidad y comportamiento en produccion no estan garantizados.
- Las peticiones en FP8 fallan; el plegamiento requiere FP32 con autocast BF16 en CUDA.
- La model card esta truncada en la seccion de notas y limitaciones, por lo que puede haber advertencias adicionales no recogidas aqui.
- No se documentan sesgos especificos, riesgos de alucinacion, limitaciones de contexto ni cobertura de idiomas en la informacion disponible; al operar sobre secuencias de aminoacidos, las consideraciones de idioma natural no aplican directamente.
- Licencia MIT: permite uso comercial, pero se debe conservar el aviso de copyright y la atribucion correspondiente. Conviene verificar tambien las condiciones de los pesos del backbone ESM++ reutilizados.
- No se publican resultados de benchmarks, lo que dificulta evaluar su calidad frente a alternativas.
- El modelo exige `trust_remote_code=True`, lo que implica ejecutar codigo publicado en el repositorio; conviene revisarlo antes de desplegarlo en produccion.
- Requiere versiones concretas y recientes del stack (PyTorch 2.13, Transformers 5.13, Python 3.11-3.14), lo que puede complicar la integracion en entornos con versiones fijadas.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synthyra/ESMFold2-600
- Dependencias del modelo: https://huggingface.co/Synthyra/ESMFold2-600/resolve/main/requirements.txt
- Checkpoint de origen citado en la model card: `biohub/ESMFold2-Experimental-Fast-base600M-step1500k`
- Backbone congelado citado en la model card: https://huggingface.co/Synthyra/ESMplusplus_large
- Resultados de busqueda web: no se han encontrado enlaces relevantes; las busquedas devolvieron unicamente resultados no relacionados con el modelo (comunidad de Genshin Impact en Reddit).
