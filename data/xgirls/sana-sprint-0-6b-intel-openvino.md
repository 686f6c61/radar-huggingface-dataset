# xgirls/SANA-Sprint-0.6B-Intel-OpenVINO

## Resumen

SANA-Sprint 0.6B Intel OpenVINO es una exportación optimizada del modelo de difusión texto-a-imagen SANA-Sprint 0.6B (1024 px) de Efficient-Large-Model, adaptada para ejecutarse sobre GPUs Intel mediante el runtime OpenVINO. El autor de la exportación es el usuario `xgirls`, que publica los grafo intermedios (IR) ya compilados y un pipeline de preparación que reconstruye localmente el codificador de texto INT4. El modelo base es un transformer de difusión de aproximadamente 0,6 mil millones de parámetros, diseñado para generar imágenes de 1024×1024 en tan solo dos pasos de inferencia con guidance 4.5.

La relevancia de esta ficha radica en que demuestra la viabilidad de ejecutar generación de imágenes de alta resolución en hardware Intel de consumo (Arc B390, Iris Xe) sin GPU dedicada de gran VRAM. El pipeline completo ocupa unos 2,5 GB de archivos de modelo tras la preparación, y los IR publicados suman 1,08 GB. La compresión INT4 se aplica con NNCF 3.4 sobre 232 capas del denoiser, manteniendo 85 capas en INT8 como respaldo.

El modelo no incluye benchmarks de calidad de imagen (FID, CLIP score) en la información disponible, pero sí mediciones de latencia en hardware concreto: 2,90 s para la primera petición a 512×512 y 0,68 s en repeticiones, y 7,44 s / 2,91 s respectivamente a 1024×1024. Es una opción interesante para despliegues locales en Windows con GPU Intel integrada o dedicada de gama media.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (SANA-Sprint), exportado a OpenVINO IR |
| Parametros totales | ~0,6 mil millones (modelo base SANA-Sprint 0.6B) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, no aplica contexto de texto largo) |
| Tipos de cuantizacion | INT4 simetrico grupo 64 (232 capas del denoiser), INT8 fallback (85 capas), FP16 para text encoder y transformer, FP32 para VAE |
| Idiomas soportados | no disponible (el codificador de texto es Gemma 2, multilingue en origen, pero no se documenta en la ficha) |
| Licencia | Apache-2.0 (modelo base y exportacion); componente Gemma sujeto a Gemma Terms y Prohibited Use Policy |
| Formato de pesos | OpenVINO IR (`.xml` + `.bin`), con componentes auxiliares en safetensors para el encoder Gemma |

## Arquitectura y entrenamiento

El modelo base SANA-Sprint 0.6B es un transformer de difusión que genera imágenes en dos pasos, en lugar de los 20-50 pasos típicos de los modelos de difusión tradicionales. Esta reducción drástica del número de pasos se consigue mediante un entrenamiento específico (sprint) que destila el proceso de muestreo. La arquitectura concreta del denoiser no se detalla en la información proporcionada, pero se sabe que es un transformer de 0,6B de parámetros optimizado para resolución 1024×1024.

La exportación a OpenVINO aplica cuantización INT4 simétrica con tamaño de grupo 64 sobre 232 capas del denoiser mediante NNCF 3.4, y deja 85 capas en INT8. El codificador de texto (Gemma 2) se reconstruye localmente con la misma cuantización INT4 durante el script `prepare.py`. El VAE se ejecuta con hint FP32 en la GPU Intel porque, según el autor, usar FP16 por defecto produce imágenes planas (sin detalle). Los componentes de texto y transformer usan hints FP16. No se documentan en la información disponible los datos de entrenamiento originales (número de tokens, composición del dataset, uso de RLHF/DPO) del modelo SANA-Sprint base.

## Capacidades

- Generación de imágenes texto-a-imagen a 512×512 y 1024×1024 en dos pasos de inferencia.
- Control de guidance scale (valor recomendado 4.5 en los benchmarks del autor).
- Ejecución sobre GPU Intel mediante OpenVINO, con colocación explícita en `GPU.0`.
- Preparación local del codificador de texto Gemma 2 con cuantización INT4.
- Generación de informes JSON con la colocación real de los componentes en GPU.
- No se documentan capacidades de edición de imagen, inpainting, controlnet, tool calling ni agentes.

## Casos de uso

- Generación de ilustraciones para prototipado rápido en estaciones de trabajo con GPU Intel: el modelo produce imágenes de 1024×1024 en menos de 3 segundos tras la primera compilación, lo que permite iterar sobre prompts en tiempo casi real.
- Creación de assets para videojuegos o aplicaciones en equipos sin GPU NVIDIA: al ejecutarse sobre OpenVINO en GPUs Intel integradas o dedicadas, elimina la dependencia de CUDA.
- Generación de imágenes en entornos Windows corporativos con hardware Intel estandarizado: el pipeline se instala con Python 3.12 y wheels precompilados, sin necesidad de toolchain CUDA.
- Prototipado de pipelines texto-a-imagen en local antes de migrar a producción: el runner guarda PNG y un JSON con la colocación real de los componentes, útil para depurar el reparto de carga entre CPU y GPU.
- Generación de imágenes de referencia para documentación técnica o demos: la latencia de 0,68 s a 512×512 permite generar lotes pequeños de forma interactiva.
- Evaluación de cuantización INT4 en modelos de difusión: el repositorio documenta qué capas quedan en INT8 y el efecto del hint FP32 en el VAE, lo que sirve como caso de estudio para técnicas de compresión NNCF.
- Despliegue en portátiles con Iris Xe para demostraciones offline: aunque el autor indica que la medición en Iris Xe está pendiente, el tamaño del pipeline (2,5 GB) es compatible con equipos de gama media.

## Benchmarks y rendimiento

Mediciones del autor en Windows 11, driver 32.0.101.9033, OpenVINO 2026.4.1, GPU Arc B390, dos pasos y guidance 4.5. Los tres componentes de inferencia reportaron `GPU.0`.

| Tamano | Primera peticion tras compilacion | Imagen repetida |
|---|---:|---:|
| 512×512 | 2,90 s | 0,68 s |
| 1024×1024 | 7,44 s | 2,91 s |

El benchmark a 512 px tardó 22,72 s desde el inicio del pipeline hasta el primer render guardado. La ejecución a 1024 px reutilizó el mismo directorio preparado y la caché del compilador. Estos tiempos excluyen la descarga y preparación del modelo. No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita; el pipeline preparado ocupa unos 2,5 GB en disco y los IR publicados 1,08 GB, por lo que se puede inferir un consumo de VRAM en el rango de 2-4 GB según resolución y componentes cargados.
- GPU recomendadas: Intel Arc B390 (medido por el autor); Intel Iris Xe (pendiente de medición según el autor).
- Cabe en GPU de consumo: sí, en GPUs Intel Arc e Iris Xe; no se documenta compatibilidad con GPUs NVIDIA o AMD en esta exportación.
- Opciones de despliegue: OpenVINO runtime con Optimum Intel, Optimum ONNX y Optimum (wheels fijados en `requirements-optimum.txt`); script `run.py` incluido.
- Latencia y throughput: 0,68 s por imagen a 512×512 y 2,91 s a 1024×1024 en estado estacionario sobre Arc B390; primera petición 2,90 s y 7,44 s respectivamente.
- Requisitos de software: Python 3.12 de 64 bits, driver Intel GPU actualizado, OpenVINO 2026.4.1 (versión usada en las mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Cuantizacion | Licencia | Hardware objetivo |
|---|---|---|---|---|---|
| SANA-Sprint 0.6B Intel OpenVINO (esta ficha) | ~0,6B | 1024×1024, 2 pasos | INT4/INT8/FP16/FP32 | Apache-2.0 (+ Gemma Terms) | GPU Intel via OpenVINO |
| SANA-Sprint 0.6B 1024px diffusers (base) | ~0,6B | 1024×1024, 2 pasos | FP16/FP32 | Apache-2.0 | GPU NVIDIA/AMD/CPU via diffusers |
| rupeshs/sana-sprint-0.6b-openvino-int4 (export previo) | ~0,6B | 1024×1024 | INT4 | Apache-2.0 | GPU Intel via OpenVINO |
| Stable Diffusion 1.5 (referencia) | ~0,9B | 512×512, 20-50 pasos | FP16/INT8 | CreativeML OpenRAIL-M | GPU NVIDIA principalmente |

La comparativa se limita a los modelos mencionados en la información disponible; no se dispone de datos de benchmarks de calidad que permitan comparar FID o CLIP score entre ellos.

## Limitaciones y advertencias

- El VAE debe ejecutarse con hint FP32 en GPU Intel; con FP16 por defecto se obtienen imágenes planas según el autor.
- La medición en Iris Xe está pendiente; el rendimiento en GPUs integradas no está verificado.
- El componente Gemma 2 está sujeto a los Gemma Terms y a la Prohibited Use Policy de Google, además de la licencia Apache-2.0 del resto del pipeline; esto puede imponer restricciones adicionales al uso comercial.
- No se documentan sesgos conocidos del modelo base SANA-Sprint en la información disponible.
- Riesgo de alucinación visual (artefactos, incoherencias semánticas) inherente a los modelos de difusión, no cuantificado en esta ficha.
- No se documentan idiomas soportados por el codificador de texto en esta exportación; el rendimiento multilingüe puede variar respecto al modelo base.
- El pipeline requiere descargar unos 6,3 GB antes de la compresión local, lo que puede ser problemático en entornos con ancho de banda limitado.
- La primera petición tras compilación es notablemente más lenta (2,90 s a 512 px, 7,44 s a 1024 px) que las posteriores; en producción conviene mantener el pipeline caliente.
- No se documentan resultados de benchmarks de calidad de imagen, por lo que no es posible comparar objetivamente con alternativas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica baja validación comunitaria.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xgirls/SANA-Sprint-0.6B-Intel-OpenVINO
- Modelo base: https://huggingface.co/Efficient-Large-Model/Sana_Sprint_0.6B_1024px_diffusers
- Exportación OpenVINO previa (pinned): https://huggingface.co/rupeshs/sana-sprint-0.6b-openvino-int4/tree/323b7f09f2a9845c7b30aa9f1b524244c204add8
- Optimum: https://github.com/huggingface/optimum/tree/86f0ba219a4e4fd320aab87d60ca9f4773f68078
- Optimum ONNX: https://github.com/huggingface/optimum-onnx/tree/d16609c333b65c082aaf699cf3c492e4d8772245
- Optimum Intel: https://github.com/huggingface/optimum-intel/tree/72342141a3967d9d071571492fb5d43ed994ab4f
- Gemma Terms: https://ai.google.dev/gemma/terms
- Gemma Prohibited Use Policy: https://ai.google.dev/gemma/prohibited_use_policy
