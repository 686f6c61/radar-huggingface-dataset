# VCLab-PolyU/SA-MoD

## Resumen

SA-MoD (Sparsity-Adaptive Mixture-of-Depth) es un conjunto de checkpoints para el modelo vision-lenguaje Qwen3.5-4B, desarrollado por el VCLab de la Universidad Politecnica de Hong Kong (PolyU). El modelo aplica un marco de post-entrenamiento de una sola etapa que aprende enrutamiento de tokens visuales por capas y adaptado al contenido, mediante una transicion progresiva de denso a disperso. El objetivo es reducir el coste computacional de los modelos vision-lenguaje descartando tokens visuales redundantes sin degradar la calidad de la respuesta.

La propuesta combina tres mecanismos tecnicos: Parameterized Thresholding Mechanism, RouterNorm y Density-aware Regularization, todo ello bajo On-Policy Distillation con Online Hidden-State Alignment (OHiSA). El modelo parte de Qwen/Qwen3.5-4B y se distribuye en tres variantes: imagen con retencion del 5% y del 25% de tokens visuales, y video con retencion del 10%.

Es relevante porque aborda uno de los cuellos de botella principales de los VLM de contexto largo: la explosion del numero de tokens visuales en imagenes de alta resolucion y secuencias de video. Al retener solo una fraccion de esos tokens, se reduce la carga de atencion y memoria en inferencia manteniendo el backbone de 4B parametros y la licencia permisiva Apache 2.0.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje (Qwen3.5-4B) con Mixture-of-Depth adaptativo a la dispersion |
| Parametros totales | 4B (heredados del modelo base Qwen3.5-4B) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

SA-MoD es un framework de post-entrenamiento de una sola etapa sobre el VLM Qwen3.5-4B. Introduce enrutamiento de tokens visuales por capas (layer-wise) que se adapta al contenido de cada muestra: en lugar de procesar todos los tokens visuales en todas las capas, el modelo aprende que fraccion de tokens conservar en cada nivel. La transicion es progresiva, de denso a disperso, guiada por un Parameterized Thresholding Mechanism que fija umbrales aprendibles, RouterNorm para estabilizar el enrutador y Density-aware Regularization para controlar la tasa global de retencion.

El entrenamiento emplea On-Policy Distillation con Online Hidden-State Alignment (OHiSA): el modelo disperso se alinea con las representaciones ocultas de un profesor denso sobre sus propias trayectorias generadas, lo que reduce el sesgo de distribucion tipico de la destilacion offline. Los datos de entrenamiento son SA-MoD-Image-25K (25.000 muestras de imagen) y SA-MoD-Video-16K (16.000 muestras de video), publicados como SA-MoD-41K en Hugging Face. No se especifica en la informacion disponible el numero total de tokens de entrenamiento ni la composicion detallada del dataset.

## Capacidades

- Comprension de imagen y texto (pipeline image-text-to-text) con generacion de respuestas en lenguaje natural.
- Comprension de video en la variante `Qwen3.5-4B-SAMoD-Video-R10`.
- Razonamiento multimodal con reduccion adaptativa de tokens visuales: el modelo decide dinamicamente cuantos tokens visuales procesar por capa.
- Tres niveles de agresividad en la retencion de tokens visuales (5%, 10% y 25%) segun el checkpoint elegido.
- Capacidades heredadas del backbone Qwen3.5-4B (generacion de texto, razonamiento, codigo), aunque la model card no las detalla explicitamente.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y multi-step reasoning: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Analisis de imagenes de alta resolucion en produccion: la variante Image-R05 procesa solo el 5% de los tokens visuales, lo que permite servir documentos escaneados, capturas de pantalla o radiografias con mucho menor coste de atencion y memoria.
- Procesamiento de video a gran escala: el checkpoint Video-R10 retiene el 10% de los tokens visuales, adecuado para resumen de video, deteccion de eventos o moderacion de contenido en pipelines donde el coste por frame es critico.
- Despliegue en hardware limitado: al reducir el numero de tokens visuales procesados, el modelo puede ejecutarse en GPUs con menos VRAM que un VLM denso equivalente de 4B, manteniendo la calidad gracias a la destilacion on-policy.
- Asistentes multimodales de atencion al cliente: el modelo puede gestionar conversaciones con imagenes adjuntas (capturas, fotos de producto) reduciendo el coste por turno en entornos de alto volumen.
- Extraccion de informacion de documentos: la retencion selectiva de tokens visuales es util para OCR-assisted QA, donde gran parte de la imagen es fondo redundante.
- Investigacion en eficiencia de VLM: los checkpoints sirven como referencia reproducible para estudiar enrutamiento adaptativo de tokens y destilacion on-policy en modelos vision-lenguaje.
- Prototipado de agentes multimodales: la licencia Apache 2.0 y el formato safetensors compatible con transformers facilitan la integracion en stacks de investigacion y productos comerciales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite al repositorio de GitHub y al paper para las instrucciones de evaluacion, pero no incluye tablas de resultados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita. Como referencia, un backbone de 4B en precision bf16 requiere aproximadamente 8 GB solo para los pesos, mas la cache KV y los tokens visuales retenidos; la reduccion de tokens visuales disminuye la parte correspondiente a la atencion.
- GPU recomendadas: no especificadas en la informacion disponible. Por tamano del backbone, una GPU con 16-24 GB (RTX 4090, A10G, L4) seria suficiente para bf16; A100/H100 para mayor throughput.
- Cabe en GPU de consumo: previsiblemente si en GPUs de 24 GB (RTX 3090/4090) en bf16, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: transformers (libreria declarada en la model card). No se confirman vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponibles. La propuesta del modelo es precisamente reducir el coste de atencion sobre tokens visuales, pero no se publican cifras concretas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque de eficiencia | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SA-MoD (Qwen3.5-4B) | 4B | no disponible | Mixture-of-Depth adaptativo con retencion del 5-25% de tokens visuales | Apache 2.0 | Hugging Face (VCLab-PolyU/SA-MoD) |
| Qwen3.5-4B (base) | 4B | no disponible | VLM denso, sin enrutamiento de tokens | no disponible en la informacion proporcionada | Hugging Face (Qwen/Qwen3.5-4B) |
| Alternativas de VLM eficiente de ~4B | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de otros modelos comparables en la informacion proporcionada para establecer una comparativa cuantitativa.

## Limitaciones y advertencias

- Al retener solo el 5% de los tokens visuales, la variante Image-R05 puede perder informacion en imagenes con detalles finos distribuidos (texto pequeno, objetos multiples); conviene validar la tarea concreta antes de desplegarla.
- La model card no documenta sesgos conocidos ni evaluaciones de robustez; se heredan los sesgos del backbone Qwen3.5-4B y del dataset SA-MoD-41K, no auditados en la informacion disponible.
- Riesgo de alucinacion: no cuantificado en la informacion proporcionada; como todo VLM, puede generar descripciones no fundamentadas, especialmente cuando la retencion de tokens es muy agresiva.
- Idiomas soportados: no disponibles. No se confirma el soporte multilingue mas alla del backbone.
- Contexto maximo: no disponible; limita la planificacion de casos de uso con documentos o videos largos.
- Licencia Apache 2.0: permite uso comercial, pero al derivar de Qwen3.5-4B conviene revisar los terminos del modelo base por si imponen condiciones adicionales.
- El repositorio tiene 0 descargas y 2 likes en el momento de la consulta; es un modelo reciente (creado en noviembre de 2026) con poca validacion externa.
- El paper referenciado en la model card apunta a un identificador arXiv placeholder (`XXXX.XXXXX`), por lo que la publicacion no esta confirmada.
- No se documentan instrucciones de cuantizacion ni pesos GGUF; el despliegue en entornos de bajos recursos requeriria conversion adicional.

## Enlaces

- Hugging Face: https://huggingface.co/VCLab-PolyU/SA-MoD
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Dataset de entrenamiento: https://huggingface.co/datasets/VCLab-PolyU/SA-MoD-41K
- Codigo: https://github.com/PolyU-VCLab/SA-MoD
- Paper (referencia placeholder en la model card): https://arxiv.org/abs/XXXX.XXXXX
