# trannhiem/TranNhiem-DeepCompression-Qwen3.6-35B-A3B

## Resumen

TranNhiem-DeepCompression-Qwen3.6-35B-A3B es una versión comprimida del modelo vision-lenguaje Qwen3.6-35B-A3B, un transformer de mezcla de expertos (MoE) desarrollado por Alibaba Qwen. La compresión la firma el usuario trannhiem y aplica una técnica propia denominada Collaborative Deep Compression (CDC), que combina poda de expertos enrutados y cuantización de baja precisión sobre los mismos. El resultado es un modelo que reduce el peso en disco de 67 GB a 22 GB (un 67 % menos) conservando, según el autor, el 99,8 % del rendimiento medio del modelo original sobre ocho benchmarks multimodales.

El problema que resuelve es el coste de servir un MoE multimodal de gran tamaño: los expertos enrutados concentran casi todos los parámetros y son, por tanto, el objetivo natural de la compresión. La poda elimina 16 de los 256 expertos enrutados por capa (quedan 240 más uno compartido) sin reentrenamiento, y los expertos restantes se cuantizan a NVFP4 (4 bits en pesos y activaciones). Atención, experto compartido, router y torre de visión permanecen en bf16.

Es relevante ahora por dos motivos: primero, porque demuestra que la poda de expertos guiada por tráfico multimodal real (texto, imagen, multi-imagen y vídeo) transfiere entre arquitecturas y apenas degrada métricas; segundo, porque NVFP4 es el formato nativo de las GPU Blackwell de NVIDIA, de modo que el modelo está pensado para explotar los tensor cores FP4 de esa generación. El modelo cuenta con unos 18 000 millones de parámetros almacenados en safetensors (frente a los 35 000 millones nominales del base, antes de poda y cuantización), y la model card no declara una longitud de contexto explícita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE multimodal (Qwen3_5MoeForConditionalGeneration), 40 capas decodificador con atención híbrida (lineal + completa), routing top-8 más un experto compartido, tamaño intermedio de experto 512 |
| Parametros totales | 17.993.110.896 (según safetensors del repo comprimido); el base nominal es Qwen3.6-35B-A3B |
| Parametros activos | no disponible (el base es A3B, es decir, ~3B activos por token, pero la model card no lo detalla para esta versión) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | NVFP4 W4A4 en expertos enrutados (NVIDIA ModelOpt); atención, experto compartido, router y torre de visión en bf16; etiqueta 8-bit en los tags de Hugging Face |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería transformers; servicio con vLLM ≥ 0.30.1) |

## Arquitectura y entrenamiento

La arquitectura de partida es un MoE multimodal de Qwen con 40 capas de decodificador que combinan atención lineal y atención completa, routing top-8 sobre expertos enrutados más un experto compartido siempre activo, y un tamaño intermedio de experto de 512. El modelo acepta texto, imagen y vídeo como entrada. Sobre esta base, la compresión aplica dos pilares del pipeline CDC y omite un tercero.

El primer pilar es la poda de expertos enrutados. Cada experto se puntúa por su contribución efectiva: el peso del router multiplicado por el tamaño de su salida, promediado sobre los tokens que se le enrutan. Las puntuaciones se calculan a partir de 256 conversaciones de texto y 256 conversaciones con imagen, multi-imagen y vídeo, de modo que la selección no está sesgada hacia texto. Se eliminan los 16 expertos con menor puntuación de cada capa, sin reentrenamiento; los expertos conservados acumulan el 95 % del peso de routing. El segundo pilar cuantiza los expertos enrutados restantes a NVFP4 (4 bits en pesos y activaciones) mediante NVIDIA ModelOpt, dejando atención, experto compartido, router y torre de visión en bf16. El pilar de clustering de pesos (codebook) se descarta deliberadamente porque requiere un kernel de matriz con tabla de consulta que vLLM no distribuye, lo que impediría servir el modelo a velocidad razonable.

## Capacidades

- Generación de texto y razonamiento conversacional multi-turno, heredados del base Qwen3.6.
- Comprensión de imagen: descripción, respuesta a preguntas visuales, interpretación de gráficos y tablas (ChartQA) y lectura de texto en imágenes (OCRBench).
- Comprensión de multi-imagen, útil para comparar o razonar sobre varias imágenes en una misma conversación.
- Comprensión de vídeo (MVBench), con evaluación específica en la model card.
- Capacidades de visión-lenguaje evaluadas en MMMU y MMStar, que cubren razonamiento multimodal y conocimiento.
- Servicio nativo en vLLM ≥ 0.30.1 mediante el kernel MoE NVFP4, con endpoint compatible con la API de Hugging Face (`endpoints_compatible`).
- Soporte de tool calling, agentes y modo thinking: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible (los idiomas no están declarados).

## Casos de uso

- Servicio de VQA en producción sobre GPU Blackwell: el modelo responde preguntas sobre imágenes con pesos NVFP4 y kernel nativo de vLLM, lo que permite desplegar un VLM MoE en una sola GPU profesional en lugar de requerir el base de 67 GB.
- Extracción de datos de documentos y gráficos: ChartQA y OCRBench se mantienen por encima del 90 % y del 88 % respectivamente, de modo que el modelo sirve para digitalizar tablas, facturas e informes escaneados con pérdida de precisión inferior al 0,5 %.
- Moderación y análisis de contenido audiovisual: la retención del 100,4 % en MVBench indica que la poda no degrada la comprensión de vídeo, por lo que encaja en pipelines que clasifican o describen clips.
- Asistentes conversacionales multimodales: el modelo acepta texto e imagen en la misma conversación y conserva el 99,4 % en MMLU, suficiente para atención al cliente que adjunta capturas de pantalla.
- Despliegue en estaciones de trabajo con RTX PRO 6000 Blackwell o DGX Spark (GB10): 21,4 GiB de pesos en memoria GPU caben en estas tarjetas, lo que habilita prototipado local de un VLM MoE sin clúster.
- Escalado de throughput en inferencia por lotes: el autor declara un +35 % de throughput en batching y un +49 % de capacidad de caché KV, lo que reduce el coste por petición en servicios de alto volumen.
- Evaluación comparativa de técnicas de compresión: al publicar el desglose por benchmark y la semilla de calibración, sirve como referencia reproducible para investigar poda de expertos en modelos multimodales.

## Benchmarks y rendimiento

Resultados de precisión (%) medidos por el autor sobre el mismo stack de servicio, con thinking desactivado. La fila de este modelo es la puntuación original más el cambio medio emparejado sobre 3 semillas de calibración de poda.

| Benchmark | Original bf16 | Este modelo | Rendimiento retenido |
|---|---|---|---|
| MMLU | 82,15 | 81,66 | 99,4 % |
| AI2D | 88,12 | 87,92 | 99,8 % |
| ChartQA | 88,52 | 88,17 | 99,6 % |
| MMBench | 91,43 | 91,18 | 99,7 % |
| MMMU | 66,67 | 65,96 | 98,9 % |
| MMStar | 67,40 | 67,98 | 100,9 % |
| OCRBench | 90,90 | 90,63 | 99,7 % |
| MVBench (vídeo) | 74,54 | 74,85 | 100,4 % |

Cambio detallado en puntos porcentuales frente al original (emparejado ítem a ítem, media ± desviación típica sobre 3 semillas): MMLU −0,49 ± 0,19; AI2D −0,20 ± 0,18; ChartQA −0,35 ± 0,40; MMBench −0,25 ± 0,22; MMMU −0,71 ± 0,77; MMStar +0,… (el dato queda truncado en la model card). Los valores por encima del 100 % se sitúan dentro del ruido de evaluación y deben leerse como ausencia de pérdida medible, no como mejora.

Métricas de eficiencia declaradas por el autor: tamaño en disco de 67 GB a 22 GB, pesos en memoria GPU de 65,5 GiB a 21,4 GiB, +35 % de throughput en batching y +49 % de capacidad de caché KV. Todas las cifras se midieron en GB200.

## Requisitos de hardware

- VRAM estimada: 21,4 GiB de pesos en memoria GPU según el autor (frente a 65,5 GiB del base en bf16). Hay que sumar la caché KV y el overhead del runtime de vLLM.
- GPU recomendadas: NVIDIA Blackwell. La model card cita GB200 como plataforma de medida, y como objetivo de despliegue RTX PRO 6000 Blackwell, DGX Spark (GB10) y GeForce RTX 50-series.
- Cabe en GPU de consumo: sí, en la gama RTX 50-series Blackwell, siempre que la VRAM total cubra pesos más caché KV. El autor advierte que las Blackwell de estación de trabajo y consumo usan kernels FP4 distintos de los de B200/GB200 y que su velocidad no se ha probado.
- GPU pre-Blackwell (Hopper, Ada, Ampere): no tienen tensor cores FP4. El modelo puede cargarse, pero los expertos caen en una ruta de solo pesos más lenta (medida por el autor).
- Opciones de despliegue: vLLM ≥ 0.30.1 con kernel MoE NVFP4 nativo. Con versiones anteriores de vLLM se activa la ruta de solo pesos, sensiblemente más lenta. La librería declarada es transformers; no se mencionan llama.cpp, Ollama ni TGI para este formato.
- Latencia y throughput: +35 % de throughput en batching y +49 % de capacidad de caché KV frente al base, medidos en GB200. No se publican valores absolutos de latencia por token.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| TranNhiem-DeepCompression-Qwen3.6-35B-A3B | 17,99 B almacenados (base nominal 35B-A3B) | no disponible | 99,8 % del base en media sobre 8 benchmarks multimodales | Apache 2.0 | Hugging Face, servicio vLLM en Blackwell |
| Qwen3.6-35B-A3B (base) | 35B-A3B nominal; 65,5 GiB en bf16 | no disponible | Referencia de la tabla anterior (MMLU 82,15; MMMU 66,67) | Apache 2.0 | Hugging Face |
| TranNhiem-DeepCompression-Gemma4-26B-A4B-it (release hermano) | no disponible | no disponible | no disponible en esta ficha | no disponible | Hugging Face |

El release hermano sobre Gemma4-26B-A4B-it comparte la receta CDC y sirve como segunda referencia de la técnica, pero la información disponible no incluye sus cifras de rendimiento ni su licencia.

## Limitaciones y advertencias

- Dependencia de hardware: NVFP4 solo acelera en Blackwell. En Hopper, Ada o Ampere el modelo funciona por una ruta de solo pesos más lenta, lo que puede anular la ventaja de throughput.
- Dependencia de software: requiere vLLM ≥ 0.30.1 para el kernel MoE NVFP4. Versiones anteriores degradan el rendimiento medido.
- Cobertura de hardware no verificada: las cifras se midieron en GB200; el autor no ha probado velocidad ni soporte de kernels en RTX PRO 6000, DGX Spark ni RTX 50-series.
- La poda elimina expertos sin reentrenamiento. Aunque la retención media es del 99,8 %, MMMU es el benchmark más afectado (−0,71 ± 0,77 puntos) y la desviación típica es amplia, de modo que en dominios de razonamiento multimodal puede haber pérdida perceptible.
- El pilar de clustering no se aplicó por incompatibilidad con vLLM; no debe esperarse la compresión adicional que aportaría esa etapa.
- Sesgos conocidos: no disponibles en la información proporcionada. Al derivar de Qwen3.6, hereda los sesgos del base, que la model card no documenta.
- Riesgo de alucinación: no cuantificado en la información disponible; es un VLM generativo y debe tratarse como tal en producción.
- Idiomas soportados: no declarados. No se puede garantizar cobertura multilingüe más allá de lo que herede del base.
- Longitud de contexto: no declarada, lo que impide dimensionar la caché KV con precisión (el autor solo indica que la capacidad de caché KV crece un 49 %).
- Licencia Apache 2.0: permite uso comercial, pero conviene revisar la licencia del modelo base Qwen3.6-35B-A3B enlazada en la model card por si añade condiciones.
- Madurez: 512 descargas y 6 likes en el momento de la consulta, con una model card que referencia un paper aún sin enlace público. Tratar como artefacto de investigación, no como release estable.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Qwen3.6-35B-A3B
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Licencia del base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B/blob/main/LICENSE
- Release hermano: https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Gemma4-26B-A4B-it
- Paper "Collaborative Deep Compression for Foundation Models": enlace no disponible (anunciado como "coming soon" en la model card)
