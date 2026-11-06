# tract-nnef/bonsai-image-ternary-4B-nnef

## Resumen

Bonsai Image Ternary 4B NNEF es un artefacto de exportación del modelo de difusión texto-a-imagen Bonsai Image Ternary 4B desarrollado por Prism ML, empaquetado en formato NNEF (Neural Network Exchange Format) para su ejecución con el motor de inferencia tract de Sonos. No se trata de un modelo nuevo ni de un fine-tune, sino de una conversión directa desde PyTorch a NNEF de los tres componentes del pipeline original (transformer de difusión, text encoder y VAE decoder), con pesos cuantizados en tiempo de exportación y dimensiones de imagen simbólicas.

El modelo subyacente, Bonsai Image Ternary 4B, es un modelo compacto de generación de imágenes basado en FLUX.2 [klein] 4B de Black Forest Labs, con un transformer de difusión de aproximadamente 3,88 mil millones de parámetros cuantizados en ternario (esquema Q2_0_T) y un text encoder Qwen3-4B de Alibaba Cloud comprimido a Q4_0. La propuesta de valor es permitir inferencia local en CPU, portátiles y dispositivos de gama baja mediante pesos de muy baja precisión, manteniendo un número reducido de capas sensibles en mayor precisión.

Este repositorio concreto es experimental: el transformer y el VAE pasan las comprobaciones de tract en CPU, pero el text encoder falla la tolerancia por defecto en 3 de 491.520 valores de salida, y no se ha validado la calidad de imagen generada ni la ejecución en WebGPU. Los artefactos son componentes de modelo, no un pipeline Diffusers listo para usar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (Flux2) + text encoder tipo Qwen3 + VAE decoder; exportado a NNEF |
| Parámetros totales | 3,88B (transformer) + 3,11B (text encoder, 27 capas) + 49,6M (VAE decoder) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no aplica; longitud de texto fija de 64 tokens |
| Tipos de cuantización | Ternario Q2_0_T en 100 tensores del transformer; Q4_0 en 189 tensores del text encoder; VAE en f32; resto de pesos en f32 |
| Idiomas soportados | no disponible |
| Licencia | Apache-2.0 |
| Formato de pesos | NNEF (archivos `.nnef.tar` con grafo y pesos empaquetados) |

## Arquitectura y entrenamiento

El transformer sigue la arquitectura de difusión de FLUX.2 [klein] 4B, con entradas de `hidden [1,N,128]`, embeddings de texto `enc [1,64,7680]`, paso temporal `t [1]` e identificadores posicionales de cuatro ejes (`img_ids [N,4]`, `txt_ids [64,4]`), produciendo una velocidad `velocity [1,N,128]`. El text encoder es un Qwen3-4B truncado a las primeras 27 capas, sin la normalización final ni la cabeza de lenguaje, que concatena los estados ocultos de las capas 9, 18 y 27 para producir embeddings de 7680 dimensiones. El VAE decoder incluye desnormalización por batch-norm latente y desparcheado 2×2, generando imágenes de 16×H por 16×W píxeles a partir de latentes `[1,128,H,W]`.

La cuantización se aplica en tiempo de exportación, no en tiempo de ejecución: se preservan los códigos ternarios originales, cada escala de 128 elementos se repite sobre cuatro bloques de 32 y las escalas se redondean a f16. Los pesos Q4 del texto usan la calibración max/7 del demo original. La aritmética de activaciones y los pesos no cuantizados permanecen en f32, incluida la tabla de embeddings del text encoder. No se dispone de información sobre el dataset de entrenamiento, el número de tokens vistos ni si hubo RLHF o DPO en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen mediante difusión con flow matching, con dimensiones de imagen dinámicas (una sola archive cubre todas las resoluciones).
- Soporte de resolución arbitraria en múltiplos de 16 píxeles, con `H,W >= 1` para latentes.
- Codificación de prompts de hasta 64 tokens mediante el text encoder Qwen3 truncado.
- Inferencia en CPU x86-64 mediante tract, sin requerir GPU.
- Ejecución con pesos ternarios y Q4_0, lo que reduce el espacio en disco y el ancho de banda de memoria.
- No soporta tool calling, agentes, razonamiento multi-paso ni otras capacidades de lenguaje: es exclusivamente un modelo de imagen.
- Capacidades multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Generación de imágenes en dispositivos sin GPU: el transformer ternario y el VAE en f32 permiten ejecutar el pipeline completo en CPU x86-64 mediante tract, adecuado para portátiles y servidores sin acelerador dedicado.
- Prototipado de pipelines de difusión en Rust: al estar en NNEF y validado con tract, sirve para integrar generación de imágenes en aplicaciones Rust nativas sin dependencias de Python ni CUDA.
- Pruebas de exportación y validación de modelos: el repositorio incluye scripts de exportación y validación (`export/export_nnef.py`, `validation.json`) útiles para equipos que necesiten reproducir conversiones torch-to-NNEF con formas simbólicas.
- Inferencia en navegador vía WebGPU: aunque no validado en estos artefactos, el formato NNEF y las formas dinámicas están pensados para el demo de tract PR #3306, lo que permitiría generación de imágenes en el cliente.
- Generación de imágenes de baja resolución para previsualización rápida: las formas de referencia validadas (32×48 y 64×144) permiten generar miniaturas con bajo coste computacional.
- Investigación sobre cuantización extrema en modelos de difusión: los pesos ternarios Q2_0_T con capas sensibles en f32 ofrecen un caso de estudio para medir el impacto de la cuantización de 2 bits en la calidad de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad de imagen (FID, CLIP score, etc.) en la información disponible. La validación publicada es exclusivamente de corrección numérica de la exportación:

| Etapa | check_io | Resolución alternativa |
|---|---|---|
| Transformer | Pass | Pass |
| Text encoder | Fail: 3 / 491.520 valores fuera de tolerancia | Longitud de texto fija |
| VAE decoder | Pass | Pass |

Métricas de comparación del text encoder: error L2 relativo `4,5097e-6`, RMSE `1,1620e-4`, error absoluto máximo `0,0478515625`, similitud coseno `0,9999999999993426`. Las comprobaciones se realizaron en CPU Linux x86-64 con tolerancia `approximate`, 64 tokens de texto y formas de imagen 32×48 y 64×144.

## Requisitos de hardware

- VRAM estimada: no aplica para la ruta validada (CPU). En GPU, el transformer (1,80 GiB) más el text encoder (2,88 GiB) y el VAE (190 MiB) requieren al menos unos 5 GiB de memoria para los pesos, más activaciones.
- GPU recomendadas: no se han validado GPU en esta exportación; la validación oficial es en CPU Linux x86-64. El modelo base está diseñado para ejecutarse en portátiles, móviles y GPU NVIDIA según la documentación de Prism ML.
- GPU de consumo: por tamaño de pesos (5,2 GB de repositorio), cabría en GPUs con 8 GB o más de VRAM, aunque no hay validación publicada.
- Opciones de despliegue: tract (PR #3306, commit `b37080bc896e4d74fdccb03a45e81c54c631b48d`, CLI `0.23.10-pre`) con soporte de tensores Q2_0_T y extensiones de transformer. No compatible con versiones anteriores de tract. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este formato.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Cuantización | Licencia | Formato |
|---|---|---|---|---|---|
| Bonsai Image Ternary 4B NNEF (este) | 3,88B + 3,11B + 49,6M | Texto 64 tokens; imagen dinámica | Ternario Q2_0_T + Q4_0 + f32 | Apache-2.0 | NNEF |
| Bonsai Image Ternary 4B (upstream) | 3,88B + text encoder + VAE | Texto 64 tokens; imagen dinámica | Ternario + Q4_0 | Apache-2.0 | PyTorch / Diffusers |
| FLUX.2 [klein] 4B | ~4B | No disponible | No disponible | No disponible | PyTorch |
| Bonsai Image 4B (variante binaria 1-bit) | ~4B | No disponible | Binaria 1-bit | Apache-2.0 | No disponible |

## Limitaciones y advertencias

- Exportación experimental: el text encoder falla la tolerancia por defecto en 3 de 491.520 valores; la causa del desajuste no se ha establecido y la tolerancia no se relajó.
- No se ha evaluado la calidad de imagen generada a resoluciones de producción; las validaciones usan formas pequeñas (32×48, 64×144) que solo verifican la exportación y el manejo de formas simbólicas.
- No hay validación en WebGPU ni en GPU; solo se ha probado en CPU Linux x86-64.
- No son activos intercambiables en el demo de navegador de tract PR #3306: requieren cambios en el loader y en el punto de llamada para cargar las archives únicas y proporcionar las dos entradas de position IDs del transformer.
- El tokenizer, la plantilla de prompt y el scheduler de flow matching no están incluidos; deben tomarse del modelo o demo upstream.
- Longitud de texto fija de 64 tokens y batch size de uno: no admite prompts largos ni generación por lotes.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base: no se documentan sesgos específicos en la información disponible.
- Licencia Apache-2.0 permite uso comercial, pero se conservan `LICENSE` y `NOTICE.md` del modelo upstream; deben respetarse las atribuciones a Prism ML, Black Forest Labs y Alibaba Cloud.
- Dependencia de una versión concreta de tract (PR #3306) sin garantía de compatibilidad con versiones anteriores.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tract-nnef/bonsai-image-ternary-4B-nnef
- Modelo base: https://huggingface.co/prism-ml/bonsai-image-ternary-4B-unpacked
- Documentación de Bonsai Image: https://docs.prismml.com/models/bonsai-image
- Colección Bonsai Image en Hugging Face: https://huggingface.co/collections/prism-ml/bonsai-image
- PR de tract con el demo de navegador: https://github.com/sonos/tract/pull/3306
- Repositorio de tract: https://github.com/sonos/tract
