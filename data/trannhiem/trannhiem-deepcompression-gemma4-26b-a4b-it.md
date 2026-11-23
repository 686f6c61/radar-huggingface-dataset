# trannhiem/TranNhiem-DeepCompression-Gemma4-26B-A4B-it

## Resumen
TranNhiem-DeepCompression-Gemma4-26B-A4B-it es una versión comprimida del modelo vision-language con mezcla de expertos Gemma-4-26B-A4B-it de Google, publicada por el usuario trannhiem en Hugging Face. Aplica una técnica denominada Collaborative Deep Compression (CDC) que combina poda de expertos enrutados y cuantización de bajo bit (NVFP4) sobre los expertos, manteniendo atención, MLP densa, router y torre de visión en bf16. El resultado reduce el tamaño en disco de 49 GB a 17 GB y el peso en memoria de GPU de 48,5 GiB a 17,3 GiB, conservando según el autor el 99,8 % del rendimiento original en una batería de ocho benchmarks multimodales.

El modelo resuelve el problema del coste de despliegue de un MoE multimodal de gran tamaño: permite servir en GPUs Blackwell con kernels FP4 nativos de vLLM (versión 0.30.1 o superior) manteniendo capacidades de razonamiento, comprensión de imagen y vídeo, y OCR. La arquitectura subyacente es un transformer MoE de 30 capas decodificadoras con enrutamiento top-8 y tamaño intermedio de experto de 704, del que se conservan 120 de los 128 expertos por capa.

Es relevante ahora porque demuestra que la poda de expertos guiada por tráfico multimodal real, combinada con cuantización NVFP4 solo en expertos, puede reducir el coste de memoria en aproximadamente un tercio sin pérdida medible de calidad, y porque abre la puerta a desplegar modelos MoE multimodales en estaciones de trabajo Blackwell (RTX PRO 6000, DGX Spark, RTX 50) además de en centros de datos GB200.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE multimodal (image-text-to-text), 30 capas decodificadoras, enrutamiento top-8, tamaño intermedio de experto 704 |
| Parametros totales | 13.672.578.112 (según safetensors del repo comprimido); el modelo base se denomina 26B-A4B |
| Parametros activos | No disponible de forma explícita; el nombre del base indica A4B (aproximadamente 4B activos) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | NVFP4 W4A4 en expertos enrutados; bf16 en atención, MLP densa, router y torre de visión; tag 8-bit en metadatos |
| Idiomas soportados | No disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (compatible con transformers y vLLM) |

## Arquitectura y entrenamiento
El modelo base es un MoE vision-language con 30 capas decodificadoras, enrutamiento top-8 sobre 128 expertos por capa y tamaño intermedio de experto de 704. Acepta entradas de texto, imagen y vídeo. La compresión aplicada consta de dos pilares efectivos: poda de expertos y cuantización. En la poda se puntúa cada experto por su contribución (peso del router multiplicado por el tamaño de su salida, promediado sobre los tokens enrutados a él), usando 256 conversaciones de texto y 256 conversaciones de imagen, multi-imagen y vídeo como calibración; se eliminan los 8 expertos de menor puntuación por capa sin reentrenamiento, conservando 120 de 128. El autor documenta que calibrar solo con texto oculta pérdidas de 3 a 5 puntos en benchmarks de imagen, y que conservar 112 expertos cuesta unos 3,6 puntos en MMMU.

En la fase de cuantización, solo los expertos enrutados se convierten a NVFP4 (4 bits en pesos y activaciones) mediante NVIDIA ModelOpt, mientras que atención, MLP densa, router y torre de visión permanecen en bf16. El autor indica que cuantizar también atención y MLP densa a 4 bits cuesta de 2 a 4 puntos y es más lento en batch. La etapa de clustering (weight sharing mediante codebook) no se aplicó porque vLLM no incluye el kernel de tabla de búsqueda necesario para servirlo con velocidad, y porque en estos expertos el entrenamiento con clustering no superó al simple ajuste de pesos al codebook sin entrenamiento. El modelo se sirve con vLLM 0.30.1 o superior usando la ruta nativa NVFP4 MoE; con versiones anteriores los expertos caen a una ruta weight-only más lenta. Las cifras del autor se midieron en GB200.

## Capacidades
- Generación de texto conversacional multi-turno.
- Comprensión de imagen y multi-imagen (image-text-to-text).
- Comprensión de vídeo (benchmark MVBench reportado).
- OCR y lectura de documentos (OCRBench reportado).
- Razonamiento multimodal y respuesta a preguntas sobre gráficos y diagramas (ChartQA, AI2D, MMMU, MMStar).
- Conocimiento general y razonamiento textual (MMLU reportado).
- Capacidades de visión conservadas tras la poda y cuantización con pérdida mínima según el autor.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Modo thinking, audio u otras capacidades especiales: no disponible en la información proporcionada.

## Casos de uso
- Análisis de documentos escaneados con OCR: el modelo conserva OCRBench al 100,3 % del original, por lo que puede extraer texto de facturas, formularios e informes en pipelines de digitalización sin perder precisión frente al modelo completo.
- Respuesta a preguntas sobre gráficos y dashboards: con ChartQA al 98,9 % del original, es adecuado para asistentes que interpretan gráficos de barras, líneas y tablas en herramientas de business intelligence.
- Comprensión de vídeo para moderación o indexación: MVBench se mantiene al 100,2 %, lo que permite clasificar y describir contenido de vídeo en sistemas de catalogación o revisión.
- Asistentes visuales en estación de trabajo Blackwell: al ocupar 17,3 GiB de VRAM, cabe en GPUs como RTX PRO 6000 Blackwell o DGX Spark, habilitando prototipos multimodales locales sin infraestructura de centro de datos.
- Razonamiento sobre diagramas técnicos y material educativo: AI2D al 99,5 % y MMMU al 100,9 % del original lo hacen apto para tutores que explican figuras científicas y esquemas.
- Servicio de chat multimodal con imágenes en producción: la reducción de 49 GB a 17 GB y el aumento del 29 % en throughput por lotes permiten atender más peticiones concurrentes por GPU en vLLM con kernels FP4 nativos.
- Evaluación comparativa de modelos comprimidos: sirve como referencia reproducible para investigadores que estudian el equilibrio entre poda de expertos, cuantización y rendimiento multimodal.

## Benchmarks y rendimiento

| Benchmark | Modelo original bf16 | Este modelo | Rendimiento retenido |
|---|---|---|---|
| MMLU | 81,70 | 80,96 | 99,1 % |
| AI2D | 81,28 | 80,86 | 99,5 % |
| ChartQA | 70,80 | 70,00 | 98,9 % |
| MMBench | 90,30 | 89,48 | 99,1 % |
| MMMU | 70,67 | 71,33 | 100,9 % |
| MMStar | 66,00 | 66,24 | 100,4 % |
| OCRBench | 84,00 | 84,27 | 100,3 % |
| MVBench (vídeo) | 56,97 | 57,10 | 100,2 % |

El autor indica que los valores por encima del 100 % están dentro del ruido de evaluación y deben interpretarse como ausencia de pérdida medible. La media de retención es del 99,8 %, con un mínimo del 98,9 % por benchmark. Las diferencias pareadas por ítem se reportan con media ± desviación estándar sobre 3 semillas de calibración de poda; la información disponible solo incluye de forma completa las filas de MMLU (−0,74 ± 0,21) y AI2D (−0,42 ± 0,33), quedando el resto truncado en el material proporcionado.

## Requisitos de hardware
- VRAM estimada para inferencia: 17,3 GiB de pesos en memoria de GPU (frente a 48,5 GiB del base bf16); el consumo total añade espacio para KV cache y activaciones, no cuantificado en la información disponible.
- GPU recomendadas: GB200 (medido por el autor); otras GPUs Blackwell como RTX PRO 6000 Blackwell, DGX Spark (GB10) y GeForce RTX 50-series deberían ejecutarlo, aunque sus kernels FP4 difieren de los de B200/GB200 y no fueron probados.
- GPUs pre-Blackwell (Hopper, Ada, Ampere): no tienen tensor cores FP4, por lo que no pueden aprovechar la ruta W4A4.
- Cabe en GPU consumer Blackwell: sí, en RTX 50-series y RTX PRO 6000 Blackwell según el tamaño de pesos, aunque el rendimiento no está verificado por el autor.
- Opciones de despliegue: vLLM 0.30.1 o superior con kernel MoE NVFP4 nativo; con versiones anteriores cae a una ruta weight-only más lenta. Compatible con transformers según los tags del repo.
- Latencia y throughput: +29 % de throughput por lotes y 1,46× tokens por julio frente al base, medidos en GB200; latencia absoluta no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| TranNhiem-DeepCompression-Gemma4-26B-A4B-it | 13,67B en safetensors comprimido (base 26B-A4B) | No disponible | Apache 2.0 | safetensors NVFP4/bf16 | Comprimido, requiere Blackwell y vLLM ≥ 0.30.1 |
| google/gemma-4-26B-A4B-it | 26B-A4B | No disponible | No disponible en la información | bf16 | Modelo base sin comprimir; 49 GB en disco, 48,5 GiB en GPU |
| TranNhiem-DeepCompression-Qwen3.6-35B-A3B | 35B-A3B (base) | No disponible | No disponible en la información | safetensors NVFP4/bf16 | Release hermano del mismo autor con la misma técnica CDC |

## Limitaciones y advertencias
- Dependencia de hardware Blackwell: sin tensor cores FP4 (Hopper, Ada, Ampere) no se puede usar la ruta W4A4; en vLLM anterior a 0.30.1 los expertos caen a una ruta más lenta.
- Los kernels FP4 de estaciones de trabajo y consumer Blackwell difieren de los de B200/GB200; el rendimiento en esas GPUs no fue medido por el autor.
- Pérdida de rendimiento pequeña pero real en algunos benchmarks: ChartQA retiene el 98,9 % y MMLU el 99,1 %, con diferencias pareadas negativas de −0,74 y −0,42 puntos respectivamente.
- La poda elimina 8 expertos por capa sin reentrenamiento; la calibración con solo texto oculta pérdidas de 3 a 5 puntos en benchmarks de imagen, por lo que el perfil de uso debe parecerse al de calibración (texto, imagen, multi-imagen y vídeo).
- No se aplicó clustering (pillar B) por falta de kernel en vLLM; no debe esperarse esa compresión adicional.
- Sesgos conocidos: no disponible en la información proporcionada.
- Riesgo de alucinación: no cuantificado en la información proporcionada; aplican los riesgos habituales de un modelo generativo multimodal.
- Idiomas soportados: no disponible; no se puede garantizar cobertura multilingüe.
- Longitud de contexto: no disponible; conviene verificarla antes de diseñar pipelines con contexto largo.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base es de Google y las condiciones del base deben revisarse por separado.
- El modelo tiene 540 descargas y 8 likes en el momento de la consulta; es un artefacto reciente con validación externa limitada.

## Enlaces
- Hugging Face: https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Gemma4-26B-A4B-it
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Release hermano: https://huggingface.co/trannhiem/TranNhiem-DeepCompression-Qwen3.6-35B-A3B
- Paper "Collaborative Deep Compression for Foundation Models": enlace no disponible (el autor indica "link coming soon")
