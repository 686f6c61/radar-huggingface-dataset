# Yi30/wan2.2-ti2v-w4a8-svd-nvidia

## Resumen

Yi30/wan2.2-ti2v-w4a8-svd-nvidia es un conjunto de checkpoints cuantizados de los modelos de generacion de video texto-a-video Wan2.2, publicados por el usuario Yi30. No es un modelo entrenado desde cero: se trata de artefactos de cuantizacion W4A8 SVDQuant (pesos MXFP4, activaciones dinamicas MXFP8 y una correccion de bajo rango de rango 32) construidos sobre Wan-AI/Wan2.2-TI2V-5B-Diffusers y Wan-AI/Wan2.2-T2V-A14B-Diffusers. El objetivo es reducir el coste de memoria y de computo en inferencia manteniendo una fidelidad casi identica a la del pipeline BF16 original.

El repositorio cubre dos variantes: un transformer cuantizado de TI2V-5B (aproximadamente 9,5 GB) y un transformer con doble experto de T2V-A14B (transformer + transformer_2, aproximadamente 54 GB). Los componentes de VAE, text encoder, tokenizer y scheduler no se duplican: se toman del modelo base sin cuantizar. La exportacion se ha realizado con vLLM-Omni (PR #6527 y proveedor torch para CUDA) y se ha validado de extremo a extremo sobre NVIDIA B300 (sm_103, CUDA 13.3).

Su relevancia actual reside en que ofrece un artefacto de cuantizacion portable y determinista: los factores de bajo rango vienen precalculados, de modo que no se ejecuta svd_lowrank durante la carga. Esto lo hace adecuado para despliegues de generacion de video en produccion donde la memoria y la reproducibilidad son criticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion de video texto-a-video. La variante A14B emplea un diseno de doble experto (transformer + transformer_2) |
| Parametros totales | No disponible. El repositorio abarca Wan2.2-TI2V-5B (aproximadamente 5B) y Wan2.2-T2V-A14B (designado A14B) |
| Parametros activos | No disponible. La variante A14B se designa como A14B y usa doble experto, pero no se detalla el reparto exacto entre parametros totales y activos |
| Longitud de contexto | No aplica. Es un modelo de difusion de video; no dispone de ventana de contexto de texto |
| Tipos de cuantizacion | W4A8 SVDQuant: pesos MXFP4, activaciones dinamicas MXFP8, correccion de bajo rango de rango 32. Modo experimental W4A4 con activaciones MXFP4 (variable VLLM_OMNI_W4A8_CUDA_ACT_FMT=mxfp4). Exportacion opcional a MXFP4 en disco (packed o unshuffled) |
| Idiomas soportados | No disponible. Los ejemplos de prompt de la model card estan en ingles |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors. En disco: residual BF16 mas factores BF16, empaquetados a MXFP4 durante la carga |

## Arquitectura y entrenamiento

El modelo base Wan2.2 es un generador de video texto-a-video basado en difusion con componentes transformer. Este repositorio no reentrena dichos modelos: sustituye el transformer original por una version cuantizada. La receta aplicada es SVDQuant, que combina SmoothQuant (con alpha=0,5) sobre activaciones reales del pipeline, una descomposicion exacta torch.linalg.svd ejecutada en dispositivo y una correccion de bajo rango de rango 32. El factor 1/s se pliega dentro del residual y del proj_down, de forma que el checkpoint almacenado es autocontenido.

La exportacion se realiza sin Quark ni ROCm mediante el script examples/quantization/export_quark_svdquant_w4a8_cuda.py, una replicacion en torch puro de la receta SVDQuant de Quark. Segun la model card, en el backend torch MXFP4/MXFP8 el nivel calibrado es equivalente en precision al nivel online: el beneficio de SmoothQuant esta dirigido a cuantizadores por canal, mientras que la escala de grupo por 32 elementos de MXFP4 es insensible al reescalado de columnas, con un error residual Q4 medido de 11,63% en online frente a 11,64% en calibrado sobre las 300 capas objetivo del modelo de 5B.

La innovacion principal es la serializacion offline: los factores vienen precalculados y el cargador toma automaticamente la ruta serializada gracias a la clave is_checkpoint_w4a8_serialized en el quantization_config de cada config.json. El formato en disco es residual BF16 mas factores BF16, empaquetados a MXFP4 en el momento de la carga. No se han publicado detalles sobre el dataset de entrenamiento del modelo base en la informacion disponible.

## Capacidades

- Generacion de video texto-a-video: produce clips de video a partir de prompts de texto.
- La variante TI2V-5B genera a 480x832 con 41 fotogramas y 20 pasos de inferencia.
- La variante T2V-A14B genera a 720x1280 con 81 fotogramas y 40 pasos (guidance scale 4,0/3,0).
- Doble experto en la variante A14B (transformer + transformer_2), lo que permite un reparto de capacidad entre expertos.
- Inferencia cuantizada en W4A8 con opcion experimental W4A4.
- No dispone de tool calling ni function calling: es un modelo de difusion de video, no un modelo de lenguaje conversacional.
- No soporta agentes, razonamiento multi-paso ni modo de pensamiento.
- No se documentan capacidades multilingues especificas; los ejemplos proporcionados usan prompts en ingles.
- No se documentan capacidades de vision, audio ni otras modalidades de entrada.

## Casos de uso

- Generacion de video comercial en produccion: el checkpoint cuantizado reduce el pico de memoria a 26,3 GB en TI2V-5B y 56,4 GB en T2V-A14B, lo que permite desplegar el pipeline en GPUs de gama alta con menos VRAM que la version BF16.
- Prototipado rapido de ideas creativas: con 20 pasos de inferencia a 480x832 para el modelo de 5B, se pueden iterar prompts y ajustar estilos con un coste de computo bajo.
- Renderizado por lotes de clips cortos: la variante de 5B resulta adecuada para generar lotes de clips de 41 fotogramas en pipelines automatizados.
- Generacion de video de alta resolucion: la variante A14B, con 720x1280 y 81 fotogramas, sirve para material final de mayor calidad cuando se dispone de 56 GB o mas de memoria.
- Despliegue con vLLM-Omni: los checkpoints estan disenados para cargarse mediante vLLM-Omni con --quantization quark_svdquant, integrándose en infraestructuras de servicio de inferencia existentes.
- Investigacion en cuantizacion de modelos de difusion: el repositorio incluye metricas de similitud de trayectoria (PSNR y coseno) que permiten reproducir y auditar la receta SVDQuant.
- Validacion de hardware: al estar verificados sobre NVIDIA B300 (sm_103, CUDA 13.3), sirven como referencia para pruebas de rendimiento en arquitecturas Blackwell.

## Benchmarks y rendimiento

La model card proporciona metricas de fidelidad frente al pipeline BF16 con semilla 42 y las mismas condiciones que las ejecuciones online:

| Modelo | Configuracion | Nivel | PSNR (dB) | Coseno | Memoria pico |
|---|---|---|---|---|---|
| TI2V-5B | 480x832, 41 fotogramas, 20 pasos | SVD online (baseline) | 27,10 | 0,9979 | 25,1 GB |
| TI2V-5B | 480x832, 41 fotogramas, 20 pasos | Calibrado (este repositorio) | 26,52 | 0,9975 | 26,3 GB |
| T2V-A14B | 720x1280, 81 fotogramas, 40 pasos, gs 4,0/3,0 | SVD online (baseline) | 12,59 | 0,794 | 55,6 GB |
| T2V-A14B | 720x1280, 81 fotogramas, 40 pasos, gs 4,0/3,0 | Calibrado (este repositorio) | 12,71 | 0,804 | 56,4 GB |

No se han publicado en la informacion disponible otros benchmarks habituales de modelos de lenguaje (MMLU, HumanEval, GSM8K) ni metricas estandar de generacion de video distintas de las anteriores.

## Requisitos de hardware

- Memoria pico medida: 26,3 GB para TI2V-5B calibrado y 56,4 GB para T2V-A14B calibrado.
- GPU recomendadas: NVIDIA B300 (sm_103) es la plataforma validada oficialmente con CUDA 13.3. Para el modelo de 5B se requieren al menos 27 GB de VRAM; para el A14B, al menos 57 GB.
- No cabe en GPUs de consumo convencionales para la variante A14B. La variante de 5B podria ajustarse en GPUs con 32 GB o mas, aunque no se confirma compatibilidad fuera de la plataforma B300.
- Opciones de despliegue: vLLM-Omni (emparejado con vllm 0.26.0; el proveedor torch se selecciona automaticamente en CUDA). La carga usa --quantization quark_svdquant.
- Latencia y throughput: no disponible. La model card no proporciona tiempos por paso ni fotogramas por segundo.

## Comparativa con modelos similares

| Modelo | Naturaleza | Precision | Memoria pico (5B / A14B) | Licencia |
|---|---|---|---|---|
| Yi30/wan2.2-ti2v-w4a8-svd-nvidia | Cuantizado W4A8 SVDQuant | MXFP4 / MXFP8 | 26,3 GB / 56,4 GB | Apache 2.0 |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers | Modelo base sin cuantizar | BF16 (referencia) | No disponible en la ficha | No disponible en la informacion proporcionada |
| Wan-AI/Wan2.2-T2V-A14B-Diffusers | Modelo base sin cuantizar, doble experto | BF16 (referencia) | No disponible en la ficha | No disponible en la informacion proporcionada |

La informacion disponible no incluye otros modelos comparables de cuantizacion de Wan2.2. La comparativa se limita, por tanto, al modelo base BF16 y al nivel SVD online de la propia receta.

## Limitaciones y advertencias

- La variante calibrada obtiene un PSNR ligeramente inferior al nivel online en TI2V-5B (26,52 frente a 27,10 dB). En T2V-A14B, el PSNR es ligeramente superior (12,71 frente a 12,59), pero el valor absoluto es bajo, lo que indica una fidelidad limitada en esa configuracion.
- La equivalencia de precision entre el nivel calibrado y el online solo se ha medido en el backend torch MXFP4/MXFP8; en otros backends el comportamiento puede diferir.
- El modo W4A4 es experimental.
- El repositorio pesa 10,2 GB, mientras que la model card describe contenidos que suman aproximadamente 9,5 GB y 54 GB. Es posible que los artefactos de A14B no esten incluidos en su totalidad; conviene verificar el contenido real antes de desplegar.
- El modelo base no esta reentrenado: los sesgos y el riesgo de alucinacion visual del Wan2.2 original se mantienen sin cambios.
- No se documentan idiomas soportados; los ejemplos usan ingles.
- La validacion se limita a NVIDIA B300 con CUDA 13.3 y vLLM-Omni; no hay evidencia de compatibilidad con otras plataformas.
- No se documentan sesgos conocidos especificos de estos checkpoints.
- Aunque la licencia es Apache 2.0, conviene comprobar las condiciones de los modelos base Wan-AI, que no se detallan en la informacion proporcionada.
- Al ser un modelo de difusion de video, no ofrece garantias de coherencia temporal ni de fidelidad al prompt mas alla de lo reportado por el modelo base.

## Enlaces

- HuggingFace: https://huggingface.co/Yi30/wan2.2-ti2v-w4a8-svd-nvidia
- Modelo base TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Modelo base T2V-A14B: https://huggingface.co/Wan-AI/Wan2.2-T2V-A14B-Diffusers
- vLLM-Omni: https://github.com/vllm-project/vllm-omni
- Script de exportacion citado en la model card: examples/quantization/export_quark_svdquant_w4a8_cuda.py (dentro del repositorio de vLLM-Omni)

Nota: la busqueda web realizada no ha devuelto enlaces relevantes sobre este modelo; los resultados obtenidos correspondian a paginas corporativas de Microsoft sin relacion con el contenido de la ficha.
