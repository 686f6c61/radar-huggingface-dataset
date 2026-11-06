# xv0y5ncu/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ-trellis-3inst-3bpw

## Resumen

Esta ficha describe un checkpoint cuantizado del modelo multimodal NVIDIA Nemotron-3.5 Super VL 120B-A12B, publicado por el usuario xv0y5ncu bajo el método GLQ (trellis-coded quantization). Se trata de una cuantización a 3,0 bits por peso (3 bpw) del modelo base en BF16 de NVIDIA, que conserva la arquitectura original `nemotron_h_omni` y emplea un códec de libro de códigos con trellis (QTIP TCQ, variante `3inst`), transformada de Hadamard aleatorizada (RHT) y LDLQ. Los pesos permanecen comprimidos en memoria y se decodifican al vuelo mediante un kernel CUDA fusionado.

El modelo base es un sistema imagen-texto-a-texto de NVIDIA con 120 000 millones de parámetros nominales y 12 000 millones activos (arquitectura de mezcla de expertos, MoE), orientado a razonamiento multimodal y conversación. Esta versión cuantizada reduce el peso del repositorio a 55 GB y declara 27 507 708 424 parámetros en safetensors, lo que refleja el empaquetado comprimido de los pesos del modelo de lenguaje; la torre de visión y el proyector se mantienen en BF16.

Su relevancia es práctica: permite servir un modelo de 120B-A12B en hardware de una sola GPU de 80 GB o en configuraciones multi-GPU modestas, con una pérdida media de SQNR de pesos de 15,39 dB sobre 41 232 capas cuantizadas. La cuantización GLQ está pensada específicamente para el rango de 2 a 4 bits por peso, donde la relación tamaño-precisión es más favorable.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | `nemotron_h_omni` (transformer MoE multimodal, clase nativa en transformers ≥ 5.18) |
| Parametros totales | 120B nominales en el modelo base; 27 507 708 424 en safetensors de esta version cuantizada |
| Parametros activos | 12B (A12B) |
| Longitud de contexto | 131 072 tokens (`max_model_len` en el ejemplo de vLLM) |
| Tipos de cuantizacion | GLQ 3,0 bpw uniforme (trellis QTIP TCQ `3inst` + RHT + LDLQ); torre de vision y proyector en BF16 |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (etiquetada como `other` en Hugging Face) |
| Formato de pesos | safetensors con decodificacion fused CUDA; libreria vLLM |

## Arquitectura y entrenamiento

El modelo base emplea la arquitectura `nemotron_h_omni` de NVIDIA, un transformer con mezcla de expertos (120B totales, 12B activos) y capacidad multimodal de entrada imagen/video y salida de texto. El pipeline declarado es `image-text-to-text`. Los datasets de referencia son `nvidia/nemotron-pre-training-datasets` y `nvidia/nemotron-post-training-v3`, lo que indica un pipeline de preentrenamiento a gran escala seguido de post-entrenamiento (instrucciones y preferencias). No se dispone en la informacion proporcionada del numero exacto de tokens de entrenamiento ni del detalle de la composicion del corpus.

La innovacion de este checkpoint no esta en el modelo base sino en el esquema de compresion: GLQ aplica cuantizacion con libro de codigos trellis (QTIP TCQ, variante `3inst`), una transformada de Hadamard aleatorizada (RHT) para rotar y aplanar la distribucion de pesos, y LDLQ para compensar el error capa a capa. El resultado es una tasa uniforme de 3,0 bpw en una unica pasada de decodificacion, sin apilado de residuos. La calibracion se realizo con 128 muestras de 2048 tokens de WikiText-2. El SQNR medio de pesos es de 15,39 dB sobre 41 232 capas.

## Capacidades

- Generacion de texto conversacional multi-turno en seis idiomas (ingles, espanol, frances, aleman, italiano y japones).
- Razonamiento con modo de pensamiento (`<think>`) activado por defecto en la plantilla de chat.
- Entrada multimodal de imagen y video en el modelo base; en esta version cuantizada la torre de vision y el proyector se conservan en BF16, aunque la validacion end-to-end solo se ha realizado con texto.
- Capacidad de codigo y matematicas heredada del modelo base de NVIDIA (no se aportan metricas concretas en la informacion disponible).
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible de forma explicita en la informacion proporcionada.
- Contexto largo de hasta 131 072 tokens.

## Casos de uso

- Servicio de chat multilingue en produccion: el modelo cubre seis idiomas y mantiene conversaciones multi-turno con hasta 131 072 tokens de contexto, lo que permite adjuntar documentos extensos o historiales largos sin truncado agresivo.
- Razonamiento asistido con traza visible: al abrir por defecto un bloque `<think>`, encaja en flujos donde se necesita auditar el razonamiento intermedio (por ejemplo, triaje de incidencias o analisis de contratos) antes de mostrar la respuesta final.
- Despliegue en una sola GPU de 80 GB: con 55 GB de repositorio y cuantizacion a 3 bpw, es viable servirlo en una A100 80GB o H100 80GB, reduciendo coste frente al modelo BF16 completo.
- Analisis de documentos largos: con 131k tokens de contexto puede procesar informes, expedientes o bases de codigo completas en una sola llamada, resumiendo o extrayendo informacion estructurada.
- Generacion de codigo en pipelines internos: el modelo base incluye capacidad de codigo; esta version puede integrarse en un servidor vLLM y consumirse via API compatible con OpenAI para tareas de autocompletado y refactorizacion.
- Evaluacion comparativa de cuantizaciones: util como referencia para medir la degradacion real de un modelo 120B-A12B a 3 bpw frente al BF16, con SQNR de pesos documentado (15,39 dB) como metrica objetiva.
- Investigacion en compresion de modelos: sirve para estudiar el comportamiento de trellis-coded quantization con RHT y LDLQ en modelos MoE multimodales de gran escala.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El unico dato cuantitativo de calidad es el SQNR medio de pesos de 15,39 dB sobre 41 232 capas cuantizadas, que mide fidelidad de reconstruccion de pesos y no rendimiento en tareas.

## Requisitos de hardware

- VRAM estimada: el repositorio ocupa 55 GB; con overhead de contexto y cache KV, se recomienda un minimo de 64-80 GB de VRAM para servir con contexto moderado.
- GPU recomendadas: A100 80GB, H100 80GB, H200, o configuraciones multi-GPU (2× A100 40GB no es suficiente por el peso; 2× A100 80GB o 2× H100 permite contexto largo).
- GPU de consumo: no cabe en RTX 4090 (24 GB) ni en RTX 3090 (24 GB) en una sola unidad; requeriria configuracion multi-GPU, que no esta documentada en la informacion disponible.
- Despliegue: vLLM con `quantization="glq"` y `dtype="bfloat16"` (obligatorio bf16, no fp16); se requiere `glq >= 0.8.33` y `transformers >= 5.18` (probado con 5.19.0). No usar `--trust-remote-code`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Cuantizacion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| NVIDIA-Nemotron-3.5-Super-VL-120B-A12B (BF16) | 120B | 12B | 131 072 | BF16 | openmdw-1.1 | Hugging Face (nvidia) |
| Este checkpoint (GLQ 3bpw) | 120B nominales / 27,5B en safetensors | 12B | 131 072 | GLQ 3,0 bpw | openmdw-1.1 | Hugging Face (xv0y5ncu) |
| Alternativas de la misma categoria | no disponible | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparacion directa mas relevante es contra el modelo base BF16: misma arquitectura y capacidades, pero con un repositorio de 55 GB frente al peso completo en BF16 (que a 120B rondaria los 240 GB). No se dispone de datos de benchmarks que permitan comparar la degradacion en tareas.

## Limitaciones y advertencias

- La cuantizacion a 3 bpw introduce perdida de precision; el SQNR de 15,39 dB es aceptable pero no equivale al modelo BF16 en tareas sensibles.
- La validacion multimodal es incompleta: la generacion de texto se ha probado end-to-end, pero la entrada de imagen y video no ha sido validada en esta version.
- El modo de pensamiento esta activado por defecto; en fp16 el modelo cierra el bloque `<think>` de inmediato sin razonar, por lo que es obligatorio usar bf16.
- Requiere versiones muy concretas de software (`glq >= 0.8.33`, `transformers >= 5.18`); versiones anteriores fallan al arrancar el motor con `AttributeError: vit_hidden_size`.
- No usar `--trust-remote-code`: el repositorio no incluye codigo de modelado y el flag provoca fallo.
- Riesgo de alucinacion inherente a los modelos de lenguaje de gran escala; no se documentan mitigaciones especificas en esta ficha.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Licencia openmdw-1.1: es necesario revisar los terminos en el enlace oficial antes de un uso comercial; la etiqueta de Hugging Face figura como `other`.
- El repositorio tiene solo 54 descargas y 0 likes en el momento de la consulta, lo que indica escasa validacion comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xv0y5ncu/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-GLQ-trellis-3inst-3bpw
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Super-VL-120B-A12B-BF16
- Repositorio GLQ: https://github.com/cnygaard/glq
- Instalador GLQ: https://raw.githubusercontent.com/cnygaard/glq/main/install.sh
- Licencia openmdw-1.1: https://openmdw.ai/license/1-1/
- Paper de referencia (arxiv:2406.11235): https://arxiv.org/abs/2406.11235
