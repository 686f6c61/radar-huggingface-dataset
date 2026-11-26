# trannhiem/TranNhiem-DeepCompression-Qwen3.6-35B-A3B

## Resumen

TranNhiem-DeepCompression-Qwen3.6-35B-A3B es una version comprimida del modelo vision-lenguaje Qwen3.6-35B-A3B de Alibaba Qwen, publicada por el usuario trannhiem en Hugging Face. Aplica una tecnica propia denominada Collaborative Deep Compression (CDC), que combina poda de expertos enrutados (expert pruning) y cuantizacion de bajo numero de bits (NVFP4, 4 bits en pesos y activaciones) sobre los expertos del bloque MoE, manteniendo atencion, experto compartido, router y torre de vision en bf16. El resultado reduce el tamano en disco de 67 GB a 22 GB y el peso en VRAM de 65,5 GiB a 21,4 GiB, conservando segun el autor el 99,8 % del rendimiento medio original.

El modelo base es un MoE multimodal (texto, imagen y video) con 40 capas de decoder, atencion hibrida (lineal y completa), enrutamiento top-8 mas un experto compartido y tamano intermedio de experto de 512. Tras la compresion, cada capa conserva 240 de sus 256 expertos enrutados. Los pesos en safetensors suman 17.993.110.896 parametros tras la poda, frente a los 35B nominales del modelo original.

La relevancia de esta ficha es doble: por un lado, documenta una receta de compresion agresiva sin reentrenamiento que preserva capacidades multimodales; por otro, advierte de una dependencia fuerte del hardware, ya que NVFP4 requiere GPUs NVIDIA Blackwell (RTX PRO 6000 Blackwell, DGX Spark GB10, RTX 50-series) y vLLM >= 0.30.1 para aprovechar los kernels nativos. En GPUs anteriores (Hopper, Ada, Ampere) no hay tensor cores FP4 y el modelo cae a una ruta mas lenta solo de pesos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE transformer multimodal (Qwen3_5MoeForConditionalGeneration), 40 capas decoder, atencion hibrida lineal + completa, top-8 routing + experto compartido |
| Parametros totales | 17.993.110.896 (tras poda, segun safetensors); modelo base nominal 35B-A3B |
| Parametros activos | 3B (A3B en el nombre del modelo base); no se detalla el recuento activo tras la poda |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 en expertos enrutados; bf16 en atencion, experto compartido, router y torre de vision; fallback weight-only en vLLM antiguo |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (repo de 22,8 GB) |

## Arquitectura y entrenamiento

El modelo base Qwen3.6-35B-A3B es un MoE multimodal con 40 capas de decoder que combina atencion lineal y atencion completa, enrutamiento top-8 sobre expertos enrutados mas un experto compartido, y un tamano intermedio de experto de 512. Acepta entradas de texto, imagen y video. Sobre esa arquitectura, la version comprimida aplica dos pilares del pipeline CDC: poda de expertos y cuantizacion.

La poda (pilar A) puntua cada experto enrutado por su contribucion cuando se usa, calculada como el peso del router multiplicado por el tamano de su salida, promediado sobre los tokens enrutados a el. Las puntuaciones se obtienen con 256 conversaciones de texto mas 256 conversaciones de imagen, multi-imagen y video. Se eliminan los 16 expertos con menor puntuacion de cada capa, sin reentrenamiento, conservando los 240 restantes que acumulan el 95 % del peso de enrutamiento. La cuantizacion (pilar C) convierte los expertos enrutados restantes a NVFP4 (4 bits en pesos y activaciones) mediante NVIDIA ModelOpt, mientras que atencion, experto compartido, router y torre de vision permanecen en bf16. El pilar B (clustering de pesos con codebook) no se aplico porque requiere un kernel de matriz con tabla de busqueda que vLLM no incluye, lo que impediria servirlo a velocidad. No se menciona en la informacion disponible el uso de RLHF, DPO ni el volumen de tokens de entrenamiento del modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno, heredados del modelo base Qwen3.6-35B-A3B.
- Comprension de imagen y video (pipeline image-text-to-text), incluyendo conversaciones multi-imagen.
- Capacidades de OCR y lectura de documentos, evidenciadas por el benchmark OCRBench.
- Razonamiento sobre graficos y diagramas (ChartQA, AI2D).
- Comprension visual general y de conocimiento multimodal (MMBench, MMMU, MMStar).
- Comprension de video (MVBench).
- Conocimiento general y razonamiento textual (MMLU).
- Servicio eficiente con vLLM mediante kernel nativo NVFP4 MoE.
- No se detalla en la informacion disponible soporte explicito de tool calling, function calling, modo thinking ni agentes multi-paso, aunque el modelo base Qwen3.6 probablemente los herede; conviene verificar en la model card del modelo original.

## Casos de uso

- Despliegue de un VLM multimodal en GPUs Blackwell de gama workstation: al ocupar 21,4 GiB de VRAM en lugar de 65,5 GiB, permite servir un modelo de 35B nominales en una RTX PRO 6000 Blackwell o DGX Spark GB10, algo inviable con el modelo bf16.
- Procesamiento de documentos con OCR y graficos: el modelo mantiene el 99,7 % en OCRBench y el 99,6 % en ChartQA respecto al original, por lo que sirve para extraer texto y datos de facturas, informes o tablas escaneadas sin perder precision apreciable.
- Analisis de video a escala: conserva el 100,4 % en MVBench, lo que lo hace adecuado para pipelines de moderacion de contenido o resumen de video donde el coste por frame es critico.
- Asistente multimodal conversacional: soporta conversaciones multi-turno con imagenes y texto, util para atencion al cliente que adjunta capturas o documentos.
- Inferencia por lotes de alta concurrencia: el autor reporta un +35 % de throughput en modo batched y un +49 % de capacidad de KV-cache, lo que reduce el coste por peticion en servicios con muchos usuarios simultaneos.
- Prototipado e investigacion en entornos con VRAM limitada: al reducir el peso a un tercio, permite experimentar con un MoE multimodal de 35B en estaciones de trabajo Blackwell sin cluster multi-GPU.
- Evaluacion comparativa de tecnicas de compresion: sirve como referencia reproducible para estudiar el impacto de la poda de expertos y NVFP4 en tareas multimodales, dado que el autor publica los deltas por benchmark.

## Benchmarks y rendimiento

Resultados de accuracy (%) medidos en el mismo stack de servicio (thinking desactivado, media de 3 semillas de calibracion de poda):

| Benchmark | Modelo original bf16 | Este modelo | Rendimiento retenido |
|---|---|---|---|
| MMLU | 82,15 | 81,66 | 99,4 % |
| AI2D | 88,12 | 87,92 | 99,8 % |
| ChartQA | 88,52 | 88,17 | 99,6 % |
| MMBench | 91,43 | 91,18 | 99,7 % |
| MMMU | 66,67 | 65,96 | 98,9 % |
| MMStar | 67,40 | 67,98 | 100,9 % |
| OCRBench | 90,90 | 90,63 | 99,7 % |
| MVBench (video) | 74,54 | 74,85 | 100,4 % |

Deltas detallados frente al original (puntos porcentuales, comparacion pareada item a item, media ± desviacion estandar sobre 3 semillas): MMLU −0,49 ± 0,19; AI2D −0,20 ± 0,18; ChartQA −0,35 ± 0,40; MMBench −0,25 ± 0,22; MMMU −0,71 ± 0,77; MMStar +0,0 (dato truncado en la informacion disponible). Los valores por encima del 100 % se interpretan como ruido de evaluacion, no como mejora real. El autor reporta ademas +35 % de throughput en modo batched y +49 % de capacidad de KV-cache frente al modelo bf16, medidos en GB200.

## Requisitos de hardware

- VRAM estimada: 21,4 GiB de pesos en GPU (frente a 65,5 GiB del bf16); hay que sumar la KV-cache, cuya capacidad aumenta un 49 % respecto al original.
- GPU recomendadas: NVIDIA Blackwell exclusivamente para aprovechar W4A4: GB200 (medido por el autor), RTX PRO 6000 Blackwell, DGX Spark (GB10) y GeForce RTX 50-series. En Hopper (H100), Ada (RTX 4090) y Ampere (A100) no hay tensor cores FP4.
- Cabe en GPU consumer: si, en RTX 50-series Blackwell, aunque el autor advierte que los kernels FP4 de workstation/consumer difieren de los de B200/GB200 y su velocidad no fue probada.
- Opciones de despliegue: vLLM >= 0.30.1 con kernel nativo NVFP4 MoE; con versiones anteriores de vLLM los expertos caen a una ruta weight-only mas lenta. No se mencionan llama.cpp, Ollama ni TGI como soportados.
- Latencia y throughput: +35 % de throughput batched y +49 % de KV-cache medidos en GB200; no se publican cifras absolutas de latencia ni tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TranNhiem-DeepCompression-Qwen3.6-35B-A3B | 17,99B (tras poda), 3B activos nominales | no disponible | Apache 2.0 | Hugging Face, vLLM >= 0.30.1 | NVFP4 solo en Blackwell; 22 GB en disco |
| Qwen/Qwen3.6-35B-A3B (original) | 35B nominales, 3B activos | no disponible | Apache 2.0 | Hugging Face | bf16, 67 GB en disco, 65,5 GiB en VRAM; sin dependencia de FP4 |
| TranNhiem-DeepCompression-Gemma4-26B-A4B-it | no disponible | no disponible | no disponible | Hugging Face | Release hermano del mismo autor, misma receta CDC sobre Gemma-4-26B |

No se dispone de datos de benchmarks de terceros para una comparativa mas amplia con modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Dependencia estricta de hardware: NVFP4 solo se ejecuta de forma nativa en GPUs NVIDIA Blackwell; en Hopper, Ada o Ampere el modelo funciona por una ruta weight-only mas lenta, lo que anula buena parte de la ventaja de rendimiento.
- Requiere vLLM >= 0.30.1; versiones anteriores degradan el rendimiento de forma medible.
- La poda elimina 16 expertos por capa sin reentrenamiento: aunque la perdida media es del 0,2 %, MMMU es el benchmark mas afectado (−0,71 puntos) y podria haber degradacion mayor en dominios poco representados en el conjunto de calibracion (256 conversaciones de texto y 256 multimodales).
- Riesgo de alucinacion inherente al modelo base Qwen3.6-35B-A3B; la compresion no lo mitiga y podria acentuarlo en tareas de razonamiento visual complejo.
- Idiomas soportados no documentados en la model card; no se puede garantizar cobertura multilingue mas alla de la del modelo base.
- Longitud de contexto no especificada en la informacion disponible.
- El paper asociado ("Collaborative Deep Compression for Foundation Models") figura como "link coming soon", por lo que no hay documentacion metodologica completa publicada.
- Aunque la licencia es Apache 2.0 (heredada del modelo base), conviene revisar los terminos del modelo Qwen original para uso comercial.
- El autor advierte que las cifras se midieron en GB200 y que el rendimiento en GPUs Blackwell de consumo no fue verificado.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Release hermano (Gemma-4-26B): https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Gemma4-26B-A4B-it
- Paper "Collaborative Deep Compression for Foundation Models": pendiente de publicacion segun la model card (enlace no disponible)
