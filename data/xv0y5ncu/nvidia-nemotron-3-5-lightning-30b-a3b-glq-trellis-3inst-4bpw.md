# xv0y5ncu/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GLQ-trellis-3inst-4bpw

## Resumen

NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GLQ-trellis-3inst-4bpw es una cuantizacion de 4 bits por peso (4.0 bpw) del modelo `nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16`, publicada por el usuario `xv0y5ncu`. El checkpoint original es un modelo de lenguaje de NVIDIA con arquitectura híbrida `nemotron_h` (Mamba + atención) y topología de mezcla de expertos (MoE), con 30.000 millones de parametros nominales y aproximadamente 3.000 millones activos por token (de ahí el sufijo A3B). Esta version reduce el peso en disco a 19,6 GB y permite servir el modelo en GPUs de gama alta para consumidores mediante decodificacion de pesos en vuelo con kernels CUDA fusionados.

La cuantizacion emplea GLQ, una tecnica que combina cuantizacion con libro de codigos codificado en trellis (QTIP TCQ, variante `3inst`), transformada de Hadamard aleatorizada (RHT) y LDLQ. El resultado es un SQNR medio de pesos de 21,15 dB sobre 3910 capas cuantizadas, calibrado con 128 muestras de 2048 tokens de WikiText-2. Los pesos permanecen comprimidos en memoria y se decodifican al vuelo, lo que evita la expansion a bf16 en VRAM.

El modelo es relevante porque demuestra que es posible servir un MoE de 30B con contexto declarado de 262.144 tokens en hardware de una sola GPU, manteniendo el modo de razonamiento (`<think>`) y capacidades multilingues en seis idiomas. La pega principal es la dependencia estricta de la libreria `glq >= 0.8.32` y del tipo `bfloat16`: con versiones anteriores o en fp16 el modelo carga sin errores pero produce resultados degradados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h` (hibrida Mamba + atención, MoE) |
| Parametros totales | 9.792.562.432 (segun safetensors del checkpoint cuantizado; el modelo base se denomina 30B-A3B) |
| Parametros activos | no disponible (el nombre A3B sugiere ~3B activos, sin cifra oficial en la informacion) |
| Longitud de contexto | 262.144 tokens (declarado por el checkpoint) |
| Tipos de cuantizacion | GLQ 4.0 bpw (trellis-coded QTIP TCQ `3inst` + RHT + LDLQ); unica variante publicada |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (tag `license:other`) |
| Formato de pesos | safetensors (libreria `transformers`, kernels CUDA propios de GLQ) |

## Arquitectura y entrenamiento

El modelo base es un transformer hibrido de la familia Nemotron 3.5 de NVIDIA, con capas Mamba combinadas con atencion y una topologia de mezcla de expertos. La model card del checkpoint cuantizado menciona explicitamente que las capas Mamba tienen una proyeccion de entrada (`input projection`) cuyo trato incorrecto en versiones antiguas de `glq` provocaba que se cargara como ceros y el modelo generase texto fluido pero sin sentido. Esto confirma la presencia de capas de estado recurrente ademas de atención clasica.

El entrenamiento del modelo base se realizo sobre los datasets `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`, segun los metadatos. No se detalla en la informacion disponible el numero de tokens de preentrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF o DPO. La innovacion tecnica central de este checkpoint es la cuantizacion GLQ: el libro de codigos en trellis permite una tasa nativa de 4 bpw en una sola pasada de decodificacion, sin apilar residuales, y la transformada de Hadamard aleatorizada reduce outliers antes de cuantizar. La decodificacion se hace con un kernel CUDA fusionado que lee los pesos comprimidos directamente.

## Capacidades

- Generacion de texto conversacional en seis idiomas (ingles, castellano, frances, aleman, italiano y japones).
- Razonamiento explicito mediante modo de pensamiento: la plantilla de chat abre un bloque `<think>` por defecto.
- Generacion de codigo, con un wrapper especifico (`glq-code`) que fija temperatura 1.0 y top_p 0.95 en servidor.
- Soporte de contexto largo: hasta 262.144 tokens declarados, lo que habilita tareas de resumen y analisis de documentos extensos.
- Capacidad de servir como modelo de chat multi-turno mediante `glq-chat`.
- Integracion con vLLM como motor de inferencia recomendado, con plugin de cuantizacion registrado automaticamente.
- Soporte de offload de pesos a RAM del host para expertos (`--cpu-offload-params experts`), pensado para MoE.
- No se documentan en la informacion disponible capacidades de vision, audio ni tool calling explicito.

## Casos de uso

- Atencion al cliente multilingue: el modelo cubre seis idiomas y mantiene conversaciones multi-turno con contexto largo, adecuado para historiales de soporte extensos sin truncar.
- Analisis de documentos largos: con 262.144 tokens de contexto declarados, se puede ingerir un informe completo o un repositorio de codigo y pedir resumenes o extracciones sin trocear.
- Generacion de codigo en pipelines: el wrapper `glq-code` fija parametros de muestreo estables y el modelo puede integrarse en flujos de autocompletado o revision de parches.
- Razonamiento asistido con traza: el bloque `<think>` por defecto permite auditar el razonamiento del modelo en tareas de matematicas o logica, util en entornos educativos o de depuracion.
- Despliegue en una sola GPU de gama alta: al ocupar 19,6 GB en disco y decodificar al vuelo, encaja en tarjetas de 24 GB o mas, lo que abarata el coste frente a servir el BF16 original.
- Servicio con offload de expertos: en configuraciones con VRAM limitada, el offload selectivo de expertos a RAM del host permite arrancar el modelo en tarjetas mas pequenas a costa de velocidad de decodificacion.
- Prototipado de agentes conversacionales: la combinacion de contexto largo y modo de razonamiento permite construir agentes que planifican varios pasos antes de responder.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La unica metrica objetiva proporcionada es el SQNR medio de pesos de 21,15 dB sobre 3910 capas cuantizadas, que mide fidelidad de la cuantizacion, no calidad de tarea.

## Requisitos de hardware

- VRAM estimada para inferencia: el checkpoint pesa 19,6 GB en disco; con overhead de kernels y reserva de KV cache, se recomienda un minimo de 24 GB de VRAM para contexto corto.
- Contexto completo (262.144 tokens): requiere ampliar la reserva de KV; el autor advierte que la concurrencia es aproximadamente `KV pool ÷ max-model-len`, por lo que a contexto maximo solo cabe una secuencia.
- GPUs recomendadas: A100 40/80 GB, H100, L40S o RTX 4090 (24 GB) para contexto corto o con offload.
- Cabe en GPU de consumidor: si, en RTX 4090 (24 GB) con contexto reducido o con `--cpu-offload-gb` para liberar VRAM.
- Opciones de despliegue: vLLM con `--quantization glq` (recomendado) o Transformers mediante `glq[hf]` y `device_map="auto"`. No se menciona soporte de llama.cpp, Ollama ni TGI.
- Offload: `--offload-backend uva` con `--cpu-offload-gb 24` y `--cpu-offload-params experts` para reducir VRAM a costa de velocidad.
- Latencia y throughput: no disponibles en la informacion proporcionada; el autor indica que el offload no se ha medido en este checkpoint concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B (BF16) | 30B-A3B (nominal) | no disponible en la informacion | BF16 | openmdw-1.1 | Hugging Face (nvidia) |
| Este checkpoint (GLQ 4bpw) | 9.792.562.432 en safetensors | 262.144 | GLQ 4.0 bpw | openmdw-1.1 | Hugging Face (xv0y5ncu) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la informacion proporcionada de datos de rendimiento del modelo base ni de alternativas comparables de la misma familia, por lo que no se puede establecer una comparativa cuantitativa de calidad.

## Limitaciones y advertencias

- Dependencia estricta de `glq >= 0.8.32`: versiones anteriores cargan el checkpoint en vLLM pero generan texto sin sentido porque las proyecciones de entrada de las capas Mamba se cargan como ceros.
- En Transformers, las versiones antiguas de `glq` no pueden cargar los expertos codificados en trellis.
- El modelo debe servirse en `bfloat16`, nunca en `fp16`: en fp16 cierra el bloque `<think>` de inmediato y responde sin razonar, sin errores ni NaN, lo que degrada la calidad de forma silenciosa.
- El modo de pensamiento esta activado por defecto; hay que gestionar el bloque `<think>` en produccion para evitar latencia extra o salidas no deseadas.
- Riesgo de alucinacion: no se documenta en la informacion disponible una evaluacion especifica, pero es un riesgo general en modelos generativos.
- Sesgos conocidos: no documentados en la informacion proporcionada.
- Licencia openmdw-1.1: conviene revisar los terminos en el enlace oficial antes de uso comercial, ya que el tag es `license:other`.
- El checkpoint cuantizado no es un modelo oficial de NVIDIA; es una publicacion de terceros (`xv0y5ncu`) con 151 descargas y 0 likes, sin validacion de la comunidad.
- El offload de expertos no se ha medido en este checkpoint concreto; las cifras de velocidad son extrapolaciones del autor desde otros modelos MoE de GLQ.
- La cifra de parametros en safetensors (9,79B) no coincide con la denominacion comercial 30B-A3B; probablemente refleja el almacenamiento comprimido y no el conteo real de parametros, pero no se aclara en la informacion.

## Enlaces

- Hugging Face del checkpoint: https://huggingface.co/xv0y5ncu/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-GLQ-trellis-3inst-4bpw
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-BF16
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Repositorio GLQ: https://github.com/cnygaard/glq
- Script de instalacion GLQ: https://raw.githubusercontent.com/cnygaard/glq/main/install.sh
- Paper de referencia citado en los tags (arXiv 2406.11235): https://arxiv.org/abs/2406.11235
- Dataset de post-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-post-training-v3
- Datasets de pre-entrenamiento: https://huggingface.co/datasets/nvidia/nemotron-pre-training-datasets
