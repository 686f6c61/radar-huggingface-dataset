# TalasCloud/UMT5-XXL-Encoder-GSQ-RCO-GGUF

## Resumen

UMT5-XXL-Encoder-GSQ-RCO-GGUF es una cuantización GGUF del codificador de texto UMT5-XXL de Google, publicada por TalasCloud y orientada específicamente a servir como text encoder del pipeline de generación de vídeo Wan. No es un modelo generativo autónomo: es el componente que transforma los prompts de texto en embeddings que consume el modelo de difusión de vídeo. El repositorio contiene un único fichero GGUF de 3,62 GB con una mezcla calibrada de tensores Q3_K, Q4_K y Q6_K, complementada con tensores en FP32.

La relevancia de esta publicación es de nicho pero concreta: permite ejecutar el encoder de Wan en hardware modesto, en particular GPUs AMD Polaris (Radeon RX 580 2048SP de 8 GB) bajo Vulkan, junto con una CPU Haswell con AVX2. El autor documenta una reducción del error de proyección de 60.640 a 37.930 sobre la muestra de calibración registrada, lo que da una medida de la fidelidad de la cuantización respecto al modelo original.

El modelo base, google/umt5-xxl, es un encoder T5 multilingüe de gran tamaño. La ficha se centra en la versión cuantizada publicada, cuyos datos técnicos verificables son limitados: la model card no detalla el dataset de entrenamiento original ni resultados de benchmarks de calidad, y la información sobre idiomas no está declarada en el repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (UMT5, base google/umt5-xxl); cuantización mixta GGUF |
| Parametros totales | 5.680.910.336 (dato de safetensors del modelo base) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Mezcla Q3_K, Q4_K y Q6_K con tensores FP32; layout: Q6_K × 31, F32 × 73, Q4_K × 136, Q3_K × 2 |
| Idiomas soportados | no disponible (el UMT5 base es multilingüe, pero el repo no lo declara) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (fichero de 3.618.248.512 bytes; repo de 3,6 GB) |

## Arquitectura y entrenamiento

El componente es un codificador de texto basado en la arquitectura UMT5 de Google, en su variante XXL. La publicación no reentrena el modelo: parte de una cuantización Q4_K_M de city96 y aplica un proceso propio de calibración denominado GSQ/RCO sobre 168 proyecciones matriciales, seleccionando layouts de tensores Q3_K, Q4_K y Q6_K dentro de un presupuesto de bytes fijado para el checkpoint. El resto de tensores se mantiene en FP32 para preservar precisión en las capas más sensibles.

El proceso de calibración se realizó sobre Vulkan y está documentado en los benchmarks del repositorio del conversor (versión v1.9.0). La métrica reportada, el error de proyección, pasa de 60.640 a 37.930 sobre la muestra registrada; se trata de una medida de ajuste de la calibración, no de una evaluación de calidad generativa. No se dispone de información sobre el dataset de entrenamiento original de UMT5-XXL, el número de tokens, ni sobre si hubo etapas de RLHF o DPO.

## Capacidades

- Codificación de texto a embeddings para el pipeline de generación de vídeo Wan (uso previsto principal).
- Procesamiento de prompts de texto como entrada del modelo de difusión de vídeo, junto con un checkpoint Wan compatible y su VAE.
- Ejecución en hardware de gama baja mediante Vulkan (AMD Polaris) y CPU con AVX2.
- Compatibilidad declarada con koboldcpp y con el runtime de medios del autor.
- No es un modelo de chat, razonamiento, código ni tool calling: no se documentan capacidades generativas autónomas.
- Capacidades multilingües: no declaradas en el repositorio; el UMT5 base es multilingüe, pero la ficha no aporta evidencia específica.

## Casos de uso

- Generación de vídeo local en GPUs AMD Polaris: el encoder permite alimentar un checkpoint Wan2.2 con prompts de texto en una Radeon RX 580 de 8 GB, un escenario que con el encoder en FP32 resultaría inviable por memoria.
- Pipeline de vídeo en CPU con AVX2: en equipos sin GPU dedicada suficiente, el encoder puede ejecutarse en un Xeon E5-2696 v3 junto con el resto del pipeline, reduciendo los requisitos de VRAM.
- Prototipado de prompts para Wan: al ser un encoder ligero, permite iterar rápidamente sobre la formulación de prompts y observar el efecto en los embeddings antes de lanzar la difusión completa.
- Despliegue en entornos Windows de bajo presupuesto: el autor apunta explícitamente a Windows con hardware de generación Polaris, lo que encaja en estaciones de trabajo antiguas reutilizadas.
- Integración con koboldcpp y el runtime de medios del autor: útil para quienes ya usan ese ecosistema y quieren añadir generación de vídeo sin cambiar de stack.
- Evaluación de cuantizaciones: el fichero sirve como referencia para comparar el error de proyección frente a otras cuantizaciones del mismo encoder (por ejemplo, Q4_K_M de city96).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. El único dato de rendimiento reportado es el error de proyección de la calibración:

| Metrica | Valor |
|---|---|
| Error de proyeccion (antes de calibracion) | 60.640 |
| Error de proyeccion (tras calibracion GSQ/RCO) | 37.930 |
| Proyecciones matriciales calibradas | 168 |
| Tamano del GGUF | 3,62 GB |

## Requisitos de hardware

- VRAM estimada para inferencia: el fichero GGUF ocupa 3,62 GB; se necesita margen adicional para activaciones y el resto del pipeline Wan.
- GPU objetivo declarada: AMD Radeon RX 580 2048SP (Polaris, 8 GB) bajo Vulkan.
- CPU objetivo declarada: Intel Xeon E5-2696 v3 (Haswell, AVX2).
- Cabe en GPU de consumo: sí, en GPUs de 8 GB como la RX 580; no se documentan pruebas en otras GPU.
- Opciones de despliegue: koboldcpp y el runtime de medios del autor (koboldcpp-media-pipeline); no se documentan vLLM, TGI ni llama.cpp para este fichero.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| TalasCloud/UMT5-XXL-Encoder-GSQ-RCO-GGUF | 5.680.910.336 | no disponible | GGUF mixto Q3_K/Q4_K/Q6_K + FP32 | Apache 2.0 | Calibrado para Vulkan/Polaris; 3,62 GB |
| city96/umt5-xxl-encoder-gguf (Q4_K_M) | mismo base | no disponible | GGUF Q4_K_M | Apache 2.0 | Entrada usada por el autor; sin calibración GSQ/RCO |
| google/umt5-xxl | 5.680.910.336 | no disponible | safetensors | Apache 2.0 | Modelo original sin cuantizar |

No se dispone de datos de benchmarks que permitan comparar la calidad de estas variantes entre sí.

## Limitaciones y advertencias

- No es un modelo de propósito general: solo tiene sentido como text encoder del pipeline Wan; no debe usarse para chat, código o razonamiento.
- La única métrica de calidad publicada es el error de proyección sobre una muestra de calibración; no hay evaluación de calidad de los embeddings en generación de vídeo real.
- La calibración está orientada a un hardware concreto (Vulkan, Polaris, AVX2); el rendimiento en otras plataformas no está documentado.
- Idiomas soportados no declarados; el comportamiento multilingüe del UMT5 base no está verificado en esta cuantización.
- Riesgo de degradación por cuantización mixta: aunque se preservan tensores en FP32, no se aportan comparaciones de calidad frente al modelo original.
- Licencia Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base google/umt5-xxl y del pipeline Wan.
- Repositorio con muy poca tracción (204 descargas, 0 likes) y sin pipeline declarado; soporte comunitario limitado.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TalasCloud/UMT5-XXL-Encoder-GSQ-RCO-GGUF
- Modelo base: https://huggingface.co/google/umt5-xxl
- Entrada Q4_K_M de city96: https://huggingface.co/city96/umt5-xxl-encoder-gguf/blob/b535255bee98c2b0a59ea7c0ae2dcd0c6657b3b7/umt5-xxl-encoder-Q4_K_M.gguf
- Benchmarks de calibración: https://github.com/aktalascloud/gguf-converter/blob/v1.9.0/benchmarks/2026-11-17-whole-gsq-rco-rx580.json
- Runtime de medios: https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
- Modelo complementario Wan: https://huggingface.co/TalasCloud/Wan2.2-TI2V-5B-Turbo-GSQ-RCO-GGUF
