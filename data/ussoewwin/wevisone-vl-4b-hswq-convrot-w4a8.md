# ussoewwin/WeVisOne-VL-4B-HSWQ-ConvRot-W4A8

## Resumen

WeVisOne-VL-4B-HSWQ-ConvRot-W4A8 es una cuantización del codificador de texto del modelo WeVisOne-VL-4B, publicado por el usuario ussoewwin. El modelo original, desarrollado por Tencent, es un modelo vision-language de 4B parámetros que combina una arquitectura Qwen3-VL con un decodificador alpha-matte para tareas de imagen a texto. Esta versión concreta aplica la técnica HSWQ (Hybrid-Sensitivity-Weighted-Quantization) para reducir el checkpoint BF16 original a aproximadamente el 48,47 % de su tamaño, manteniendo 326 capas lineales en formato W4A8 (pesos de 4 bits, activaciones de 8 bits) y 708 tensores en su precisión original.

El pack está empaquetado como un único archivo safetensors de unos 4,70 GB, diseñado específicamente para su uso en ComfyUI como codificador de texto (text encoder) dentro de flujos de trabajo de generación de imagen. La cuantización emplea grupos de tamaño 16 para los pesos y ConvRot con grupos de 256, una variante que busca preservar la fidelidad numérica de las activaciones tras la rotación de canales.

La relevancia de esta ficha radica en que documenta una alternativa de despliegue ligero para un modelo vision-language de 4B, permitiendo su uso en entornos con recursos limitados de VRAM. No obstante, la información pública disponible es escasa: no se especifican licencia, idiomas soportados ni resultados de benchmarks, y el número de descargas y likes es cero en el momento de la consulta.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | WeVisOne-VL 4B (Qwen3-VL + decodificador alpha-matte) |
| Parámetros totales | 4B (modelo base); tamaño del checkpoint fuente BF16: 9.699.729.600 bytes |
| Parámetros activos | no disponible (no es MoE según la información disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A8 (pesos INT4, activaciones INT8), grupo de tamaño 16, ConvRot grupo 256 |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (archivo único, ~4,70 GB) |

## Arquitectura y entrenamiento

El modelo base WeVisOne-VL-4B emplea una arquitectura híbrida que combina un backbone Qwen3-VL con un decodificador alpha-matte, orientado a tareas de imagen a texto y segmentación. Esta versión cuantizada no modifica la arquitectura, sino que transforma los pesos: 326 capas lineales se almacenan como `asym_w4a8_int8` (4 bits por peso, grupo de 16, ConvRot de 256) y 708 tensores se conservan en su dtype original, incluyendo `embed_tokens`, `lm_head`, `mask_decoder` y 32 tensores seleccionados por rango de deriva.

La técnica HSWQ (Hybrid-Sensitivity-Weighted-Quantization) es un marco de cuantización desarrollado por el mismo autor, que asigna distintos niveles de precisión según la sensibilidad de cada capa. El proceso de cuantización reporta una reproducción de pesos con un error L2 relativo mediano de 5,335e-03 frente al checkpoint fuente, y una aceptación de salida sobre 256 elementos con un coseno medio de 0,995055 y un mínimo de 0,987840. No se dispone de información sobre el dataset de entrenamiento del modelo base, el número de tokens utilizados ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Generación de texto e imagen a texto: el pipeline declarado es `image-to-text`, lo que indica capacidad de describir o interpretar imágenes.
- Codificador de texto para ComfyUI: el pack está diseñado para cargarse mediante `CLIPLoader` en `ComfyUI/models/clip/`, integrándose en flujos de generación de imagen.
- Decodificador alpha-matte: el modelo base incluye un `mask_decoder` que sugiere capacidades de segmentación o generación de máscaras alfa.
- Vision-language: al derivar de WeVisOne-VL-4B, se infiere soporte de entrada visual, aunque no se detallan capacidades concretas de razonamiento visual.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible; no se especifican idiomas.
- Capacidades especiales (thinking mode, audio, etc.): no disponible.

## Casos de uso

- Integración en ComfyUI para generación de imagen condicionada por texto: el pack se coloca en `ComfyUI/models/clip/` y se carga con `CLIPLoader`, actuando como codificador de texto dentro de un pipeline de difusión. Es adecuado por su formato de archivo único y su reducción de tamaño al 48,47 % del BF16.
- Despliegue en entornos con VRAM limitada: al reducir el checkpoint a ~4,70 GB, permite cargar el codificador de texto en GPUs de consumo medio sin necesidad de infraestructura de datacenter.
- Prototipado de pipelines de imagen a texto: el pipeline `image-to-text` permite experimentar con descripción automática de imágenes en flujos de trabajo de ComfyUI.
- Segmentación con máscaras alfa: el `mask_decoder` incluido en el pack sugiere su uso en tareas de generación de máscaras o recorte de imágenes dentro de ComfyUI.
- Investigación en cuantización: el pack sirve como caso de estudio para evaluar la técnica HSWQ y su impacto en la fidelidad de salida (coseno medio 0,995055) frente al modelo BF16.
- Distribución de modelos en entornos con ancho de banda limitado: el tamaño reducido (~4,70 GB frente a 9,70 GB) facilita la descarga y el almacenamiento en repositorios locales o entornos de CI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un pack W4A8 de ~4,70 GB, se estima que requiere al menos 5-6 GB de VRAM para cargar los pesos, más el overhead de activaciones y del pipeline de ComfyUI. No se dispone de cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, cabría esperar compatibilidad con GPUs de consumo como RTX 3060 12 GB, RTX 4070, RTX 4090, así como A100/H100 para despliegues de mayor escala, pero no se confirma.
- ¿Cabe en consumer GPU? Sí, por el tamaño del pack (~4,70 GB) es plausible en GPUs de consumo con 8 GB o más de VRAM, aunque no se especifica oficialmente.
- Opciones de despliegue: ComfyUI mediante `CLIPLoader` (método documentado). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WeVisOne-VL-4B-HSWQ-ConvRot-W4A8 | 4B (cuantizado W4A8) | no disponible | safetensors (~4,70 GB) | no disponible | Hugging Face (0 descargas) |
| tencent/WeVisOne-VL-4B (BF16) | 4B | no disponible | BF16 (~9,70 GB) | no disponible | Hugging Face (modelo base) |
| Qwen3-VL (familia) | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; no se documentan sesgos específicos del modelo base ni del pack cuantizado.
- Riesgo de alucinación: no cuantificado; al ser un modelo de 4B, es esperable un riesgo de alucinación inherente, pero no se aportan métricas.
- Limitaciones de contexto o idioma: no se especifica la longitud de contexto ni los idiomas soportados, lo que impide evaluar su idoneidad para textos largos o entornos multilingües.
- Restricciones de licencia: la licencia no está disponible, por lo que no se puede confirmar si el uso comercial está permitido. Se recomienda contactar con el autor o consultar el modelo base antes de un despliegue en producción.
- Caveat de cuantización: aunque la verificación reporta un coseno medio de 0,995055, existe una pérdida de fidelidad respecto al BF16 (error L2 relativo mediano de 5,335e-03) que puede afectar a tareas sensibles.
- Auditoría de seguridad: el autor indica que no se encontró backdoor en el pack, pero advierte que la auditoría cubre solo la transformación del checkpoint, no posibles triggers entrenados en el modelo base.
- Madurez del artefacto: 0 descargas y 0 likes en el momento de la consulta, lo que sugiere un uso limitado y poca validación comunitaria.
- Compatibilidad: el pack está diseñado para ComfyUI; no se garantiza su funcionamiento en otros frameworks sin conversión adicional.

## Enlaces

- Hugging Face: https://huggingface.co/ussoewwin/WeVisOne-VL-4B-HSWQ-ConvRot-W4A8
- Modelo base: https://huggingface.co/tencent/WeVisOne-VL-4B
- Repositorio HSWQ: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization
- Informe de verificación: https://github.com/ussoewwin/Hybrid-Sensitivity-Weighted-Quantization/blob/main/md/backdoor/verdicts/WeVisOneVL4B_W4A8_Pack.md
