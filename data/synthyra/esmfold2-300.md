# Synthyra/ESMFold2-300

## Resumen

`Synthyra/ESMFold2-300` es un checkpoint de plegado y representacion de proteinas publicado por Synthyra que empaqueta el modelo `biohub/ESMFold2-Experimental-Fast-base300M-step1500k` junto con el runtime FastPLMs para Hugging Face Transformers. El artefacto expone una unica interfaz de carga (`AutoModel` con `trust_remote_code=True`) que cubre extraccion de caracteristicas, plegado de estructuras y cabezas de clasificacion de secuencia y de residuo. No es un modelo de lenguaje natural: su entrada son secuencias de aminoacidos en crudo o especificaciones tipadas de complejos moleculares (multicadena y multimolecula).

El checkpoint declara 171.123.237 parametros reales en safetensors, aunque los sufijos "300" y "600" de la familia hacen referencia a la escala del backbone, no al total de parametros del modelo. La arquitectura combina un backbone de lenguaje de proteinas ESM++ small congelado (`Synthyra/ESMplusplus_small`) con un tronco de plegado de 24 bloques y un modulo de difusion estructural con muestreador de 15 pasos y tres bucles de plegado. El backbone declarado en config (step 1.500.000) y los pesos ESM++ fijados son identicos tensor a tensor en BF16 tras la conversion de layout.

Su relevancia actual radica en dos decisiones de diseno poco habituales: el plegado se realiza sin condicionamiento por MSA (el checkpoint rechaza `ProteinInput.msa` y cualquier caracteristica derivada de alineamientos multiples) y la cabeza de confianza esta deshabilitada, por lo que no produce pLDDT, pTM, iPTM ni PAE. Esto lo situa como una pieza orientada a extraccion de representaciones y plegado rapido de secuencia unica, no como sustituto directo de predictores de estructura con estimacion de confianza.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ESMFold2 sobre runtime FastPLMs: backbone pLM ESM++ small congelado + tronco de plegado de 24 bloques + modulo de difusion estructural |
| Parametros totales | 171.123.237 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se distribuyen pesos en safetensors. Las peticiones FP8 fallan. El tronco de plegado permanece en FP32 con autocast BF16 en CUDA y el backbone en BF16 |
| Idiomas soportados | no disponible; el modelo no procesa lenguaje natural, su entrada son secuencias de aminoacidos y especificaciones de complejos moleculares |
| Licencia | MIT |
| Formato de pesos | safetensors con `custom_code` (requiere `trust_remote_code=True`) |
| Pipeline declarado | feature-extraction |
| Tarea principal | plegado de proteinas y extraccion de representaciones por residuo |
| Backbone | `Synthyra/ESMplusplus_small` (congelado) |
| Checkpoint de origen | `biohub/ESMFold2-Experimental-Fast-base300M-step1500k` (step 1.500.000) |
| Muestreador de difusion | 15 pasos, 3 bucles de plegado (valores por defecto del checkpoint) |
| Proyeccion aprendida | `H: (b, l, 31, 960) -> Z: (b, l, 256)` |
| Backends de atencion | `eager`, `sdpa`, `flex_attention` |
| Requisitos de entorno | Python 3.11-3.14, PyTorch 2.13, Transformers 5.13 |
| Tamano del repositorio | 0,7 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo se organiza en tres piezas. La primera es un backbone de lenguaje de proteinas ESM++ small, cargado desde `Synthyra/ESMplusplus_small` y mantenido congelado; segun la model card, sus pesos son exactamente iguales al backbone declarado en la configuracion del checkpoint base tras la conversion de layout, y opera en BF16. La segunda es un tronco de plegado de 24 bloques que consume las representaciones del backbone. La tercera es un modulo de difusion que genera coordenadas atomicas mediante un muestreador de 15 pasos y tres bucles de plegado, ambos valores por defecto del checkpoint. Los parametros de plegado se mantienen en FP32 con autocast BF16 sobre CUDA.

Para las tareas de clasificacion, el modelo reutiliza el backbone preentrenado y anade una cabeza `classifier` nueva y sin entrenar. El trunk de plegado se omite en esa ruta: la clasificacion usa la mezcla de estados pLM aprendida y su proyeccion, seguidas de una sonda transformer entrenable. La proyeccion aprendida transforma tensores `(b, l, 31, 960)` en representaciones `(b, l, 256)`, de modo que `embed_dataset` devuelve un vector de 256 dimensiones por residuo y secuencia.

En cuanto a entrenamiento, la informacion disponible no detalla el numero de tokens, la composicion del dataset ni si hubo etapas de RLHF o DPO; esos datos no estan publicados en la fuente consultada. Si se documenta explicitamente que el checkpoint se entreno sin condicionamiento por MSA: rechaza `ProteinInput.msa` y cualquier caracteristica derivada de alineamientos. La arquitectura experimental no expone folding TTT (test-time training de plegado). La cabeza de confianza esta deshabilitada.

## Capacidades

- Plegado de proteinas a partir de secuencia unica: `infer_protein` acepta una secuencia de aminoacidos, una semilla y un numero de muestras de difusion, y devuelve coordenadas atomicas (`sample_atom_coords`).
- Entrada de complejos tipados: soporta entradas multicadena y multimolecula sin condicionamiento por MSA.
- Extraccion de caracteristicas: representaciones por residuo de 256 dimensiones mediante `embed_dataset`, utiles como embeddings de proteinas.
- Clasificacion de secuencia: `AutoModelForSequenceClassification` con logits de forma `(b,)`; la cabeza es nueva y hay que ajustarla antes de interpretar los logits.
- Clasificacion de residuo: `AutoModelForTokenClassification` con logits de forma `(b, l)` usando `-100` fuera de las posiciones biologicas.
- Ajuste fino eficiente: compatible con PEFT/LoRA (`target_modules="all-linear"`, `modules_to_save=["classifier"]`) y con el contrato `PreTrainedModel` de Transformers.
- Seleccion de backend de atencion: `eager`, `sdpa` y `flex_attention`; si se solicita un backend no disponible, se lanza un error en lugar de cambiar de implementacion silenciosamente.
- Capacidades ausentes: no hay soporte de tool calling, function calling, agentes, razonamiento multi-paso sobre lenguaje natural, vision, audio ni modo de pensamiento. No es un modelo generativo de texto.

## Casos de uso

- Extraccion de embeddings de proteinas a escala: usar `embed_dataset` para obtener un vector de 256 dimensiones por residuo y alimentar busqueda por similitud, agrupamiento o clasificacion no supervisada de familias proteicas sin necesidad de alineamientos.
- Plegado de secuencia unica en entornos sin MSA: en genomas poco anotados o metagenomas donde no hay alineamientos disponibles, `infer_protein` permite obtener coordenadas atomicas directamente desde la secuencia, evitando la busqueda en bases de datos que exigen los predictores dependientes de MSA.
- Anotacion de residuos funcionales: tras ajustar la cabeza de `AutoModelForTokenClassification`, se puede predecir por residuo sitios activos, regiones de union o propension a desorden, aprovechando que la mascara `-100` delimita las posiciones biologicas.
- Clasificacion de secuencias a nivel de proteina: con `AutoModelForSequenceClassification` ajustado, clasificar localizacion subcelular, familia enzimatica o termoestabilidad, reutilizando el backbone congelado y entrenando solo la cabeza.
- Ajuste fino con pocos datos de laboratorio: aplicar LoRA sobre modulos lineales con `r=8`, `lora_alpha=16` y guardar el clasificador junto al adaptador, lo que permite adaptar el modelo a un ensayo concreto con un coste de computo reducido.
- Priorizacion en pipelines de diseno de proteinas: generar estructuras candidatas de variantes y usarlas como filtro geometrico previo a la sintesis, dado que el modelo no depende de MSA y puede evaluar secuencias disenadas que no existen en bases de datos.
- Analisis de variantes y mutaciones: comparar las representaciones por residuo de una secuencia wild-type y sus mutantes para localizar que posiciones alteran mas el espacio latente, como senal de impacto estructural potencial.
- Precalculo de representaciones en procesos batch: dado que el modelo es pequeno (171 millones de parametros) y admite `sdpa` o `flex_attention`, se puede precalcular una base de embeddings propia en una sola GPU y reutilizarla en busquedas posteriores.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no especificada por el autor. Como referencia derivada del numero de parametros, los pesos en BF16 ocupan aproximadamente 0,34 GB; sumando el tronco de plegado en FP32, las activaciones y el muestreador de difusion, la huella deberia mantenerse muy por debajo de los 4 GB en la mayoria de configuraciones. Se trata de una estimacion propia, no de un dato publicado.
- GPU recomendadas: cualquier GPU CUDA compatible para la validacion en Docker. El autor indica que no se requiere ningun producto de GPU ni estacion de trabajo concretos. Dado el tamano, tarjetas consumer como la RTX 3060, RTX 4070 o RTX 4090 son suficientes; en el extremo alto, A100 o H100 no aportan una ventaja determinante por capacidad de memoria, solo por throughput.
- Compatibilidad con GPU consumer: si. Con 171 millones de parametros y 0,7 GB de repositorio, el modelo cabe en practicamente cualquier GPU consumer moderna.
- Opciones de despliegue: PyTorch 2.13 con Transformers 5.13, cargando con `AutoModel.from_pretrained(..., trust_remote_code=True)`; backends de atencion `eager`, `sdpa` y `flex_attention`; validacion en contenedor Docker sobre cualquier dispositivo CUDA compatible; soporte de PEFT para ajuste fino. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, y no hay pesos GGUF publicados.
- Modo sin conexion: la model card documenta un flujo offline que exige construir primero el artefacto local fijado por manifiesto y usar `local_files_only=True`.
- Precision: el backbone opera en BF16; el tronco de plegado mantiene parametros en FP32 con autocast BF16 en CUDA. Las peticiones FP8 fallan.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Plegado sin MSA | Cabeza de confianza | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Synthyra/ESMFold2-300 | 171.123.237 | no disponible | si | deshabilitada (sin pLDDT, pTM, iPTM ni PAE) | MIT | Hugging Face |
| Synthyra/ESMFold2-600 | no disponible | no disponible | no disponible | no disponible | no disponible | mencionado en la model card como variante de mayor escala de backbone |
| ESMFold original (Meta) | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos comparativos de parametros, contexto, rendimiento o licencia de las alternativas, por lo que la comparacion cuantitativa no es posible. La unica diferencia verificable entre las variantes de la familia es la escala del backbone, que los sufijos "300" y "600" describen, y que no equivale al total de parametros del modelo.

## Limitaciones y advertencias

- Cabeza de confianza deshabilitada: no se puede obtener pLDDT, pTM, iPTM ni PAE, por lo que no hay estimacion de incertidumbre por residuo ni de calidad global del plegado. Cualquier uso en produccion debe aportar su propio mecanismo de validacion.
- Sin condicionamiento por MSA: el checkpoint rechaza `ProteinInput.msa` y las caracteristicas derivadas de alineamientos. Esto limita la precision en dianas dificiles donde los alineamientos aportan informacion evolutiva critica.
- Cabezas de clasificacion sin entrenar: las clases de clasificacion de secuencia y de residuo crean un `classifier` nuevo. Interpretar sus logits sin ajuste fino previo produce resultados sin sentido.
- Estado experimental: el nombre del checkpoint incluye la etiqueta "Experimental" y no hay benchmarks publicados, descargas ni likes registrados. No hay evidencia publica de validacion independiente.
- Limitaciones de precision: las peticiones FP8 fallan; el tronco de plegado debe permanecer en FP32 con autocast BF16 en CUDA.
- Ausencia de folding TTT: la arquitectura experimental no expone test-time training de plegado, una tecnica presente en otras variantes de la familia.
- Dominio restringido: el modelo no procesa lenguaje natural, no soporta tool calling, agentes ni tareas multimodales. Aplicarlo fuera del ambito de proteinas no es viable.
- Riesgo de predicciones erroneas: al no existir cabeza de confianza, un plegado incorrecto no se distingue de uno correcto a partir de la salida del modelo. Es necesario validar con metodos externos.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion, siempre que se conserve el aviso de copyright y la licencia. No se identifican clausulas adicionales en la informacion disponible, aunque conviene revisar las condiciones del checkpoint de origen `biohub/ESMFold2-Experimental-Fast-base300M-step1500k` y del backbone `Synthyra/ESMplusplus_small`.
- Dependencia de codigo remoto: la carga exige `trust_remote_code=True`, lo que implica ejecutar codigo incluido en el repositorio. En entornos con requisitos de seguridad estrictos conviene auditar ese codigo antes del despliegue.
- Fechas del repositorio: las marcas de creacion y actualizacion registradas son del 15 de septiembre de 2026, posteriores a la fecha habitual de referencia; conviene verificar la vigencia del artefacto antes de integrarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synthyra/ESMFold2-300
- Checkpoint de origen: https://huggingface.co/biohub/ESMFold2-Experimental-Fast-base300M-step1500k
- Backbone congelado: https://huggingface.co/Synthyra/ESMplusplus_small
- Dependencias directas: https://huggingface.co/Synthyra/ESMFold2-300/resolve/main/requirements.txt
- Repositorio FastPLMs: no disponible
- Paper o blog tecnico del autor: no disponible
- Demos o espacios: no disponible
