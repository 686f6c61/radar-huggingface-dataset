# tsolful/Minimax_H3_Image_INT6_INT4GPTQ

## Resumen

MiniMax H3 Image INT6/INT4 GPTQ es una cuantización de bajo bit del transformer de difusión MiniMax H3 Image, empaquetada en archivos únicos para su uso directo en ComfyUI. La publica el usuario tsolful a partir de los pesos podados en BF16 que emplea el repaquete oficial de Comfy-Org, e incluye dos variantes: W6A8 (6 bits en pesos, 8 bits en activaciones) de 15,61 GB y W4A8 mixta de 12,77 GB, que mantiene los últimos 20 bloques en W6A8 para preservar calidad.

El modelo resuelve el problema de ejecutar un transformer de difusión de gran tamano en hardware de consumo, reduciendo el peso del archivo entre un 40 y un 50 por ciento respecto al BF16 podado sin requerir un loader especifico: la configuración de cuantización viaja en la cabecera nativa `_quantization_metadata` de ComfyUI. Es relevante porque permite desplegar generación texto-a-imagen de alta calidad en GPUs con 16-24 GB de VRAM mediante GPTQ calibrado, con una reducción del error por capa de aproximadamente el 70 por ciento frente al redondeo simple.

La arquitectura subyacente es un transformer de difusión de 50 bloques con cuatro capas lineales grandes por bloque (`attn.qkv_proj`, `attn.out_proj`, `mlp.fc1`, `mlp.fc2`). El text encoder no se incluye en estos archivos: se comparte con MiniMax H3 y se distribuye por separado (Qwen3-VL 32B en NVFP4 AWQ). La licencia es la MiniMax H3 Community License Agreement, no una licencia open source estándar.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (50 bloques) con atencion y MLP; cuantizacion GPTQ |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen, no conversacional) |
| Tipos de cuantizacion | INT6 W6A8 GPTQ (grupo 32); INT4 W4A8 asimetrico (grupo 16) con cola W6A8 en bloques 30-49; escalas FP8 E4M3 |
| Idiomas soportados | no disponible |
| Licencia | MiniMax H3 Community License Agreement (license: other) |
| Formato de pesos | safetensors (diffusion-single-file) |
| Tamano de archivo | 15,61 GB (W6A8) / 12,77 GB (W4A8 mixto) |
| Capas cuantizadas | 192 (W6A8) / 200 incluyendo token refiner (W4A8) |
| Calibracion | 75.648 tokens por capa, 2 pasadas, damp 0.02, act-order, secuencial |
| Requisito de software | ComfyUI v0.38.0 o superior, comfy-kitchen >= 0.2.37 |

## Arquitectura y entrenamiento

El modelo base es un transformer de difusión para generación texto-a-imagen con 50 bloques, cada uno con cuatro capas lineales de gran tamano que concentran la mayor parte de los parametros. La cuantización se aplica exclusivamente a esas capas; los embedders, la modulación, la capa de salida y las normas se mantienen en precisión completa por su sensibilidad. En la variante W4A8 se cuantiza además el token refiner a INT8, lo que eleva el número de capas calibradas de 192 a 200.

El proceso de cuantización emplea GPTQ con dos pasadas, damping de 0.02, act-order y calibración secuencial sobre 75.648 tokens por capa, usando escalas en FP8 E4M3. La variante W4A8 usa un codebook asimetrico de 4 bits con grupo 16 en los bloques 0-29 y mantiene los bloques 30-49 en W6A8, porque es en los bloques finales donde el error de 4 bits es mayor. Frente al redondeo simple (RTN), GPTQ reduce el error medio por capa de 0.0190 a 0.0060 en W6A8 (68 por ciento) y de 0.0385 a 0.0113 en W4A8 (71 por ciento). No se dispone de información sobre los datos de entrenamiento originales del modelo base ni sobre si hubo RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de prompts de texto mediante difusión, en el ecosistema ComfyUI.
- Dos niveles de calidad/compromiso: W6A8 para máxima fidelidad y W4A8 mixto para menor huella de VRAM.
- Integración nativa con el nodo Load Diffusion Model de ComfyUI, sin loader adicional.
- Compatibilidad con flujos de trabajo ComfyUI que combinen el text encoder Qwen3-VL 32B y el VAE fp16 oficiales.
- Cuantización con metadatos embebidos que permiten cargar el modelo directamente.
- No soporta tool calling, agentes ni razonamiento multi-paso: es un modelo puramente generativo de imágenes.

## Casos de uso

- Generación de imágenes en estaciones de trabajo con GPU de consumo: la variante W4A8 de 12,77 GB cabe en GPUs de 16 GB, permitiendo iterar prompts localmente sin depender de la nube.
- Prototipado rápido de pipelines texto-a-imagen en ComfyUI: al ser un single-file con metadatos de cuantización, se carga con el nodo estándar y se integra en grafos existentes sin cambios de código.
- Producción de assets gráficos con requisitos de VRAM ajustados: la variante W6A8 ofrece la máxima fidelidad del repo para servidores con 24 GB, útil cuando la calidad visual es prioritaria.
- Comparación de calidad entre niveles de cuantización: los informes por capa y las métricas de error permiten evaluar el compromiso calidad/tamano antes de fijar una variante en un flujo de trabajo.
- Despliegue en entornos con límite de almacenamiento: el archivo W4A8 ahorra 2,8 GB frente al W6A8 con una diferencia de error extremo a extremo prácticamente nula (RMSE medio 0.035 en ambos).
- Investigación sobre cuantización de transformers de difusión: los reportes de calibración y las tablas de error por paso sirven como referencia para estudiar el impacto de GPTQ en modelos generativos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K) en la información disponible, al tratarse de un modelo de difusión. El autor sí publica métricas de error de cuantización frente a BF16:

| Metrica | W6A8 GPTQ | W4A8 GPTQ |
|---|---|---|
| Error medio por capa (GPTQ) | 0.0060 | 0.0113 |
| Error medio por capa (RTN) | 0.0190 | 0.0385 |
| Reduccion vs RTN | 68 % | 71 % |
| RMSE relativo medio (denoiser) | 0.035 | 0.035 |
| Similitud coseno minima con BF16 | >= 0.996 | >= 0.996 |

Error relativo por paso de denoising (RMSE vs BF16):

| Paso | Sigma | W6A8 | W4A8 |
|---|---|---|---|
| 0 | 1.000 | 0.035 | 0.040 |
| 1 | 0.968 | 0.086 | 0.070 |
| 2 | 0.888 | 0.043 | 0.051 |
| 3 | 0.750 | 0.029 | 0.031 |
| 4 | 0.534 | 0.011 | 0.013 |
| 5 | 0.233 | 0.004 | 0.004 |

Estos datos proceden de una única ejecución sobre los datos de calibración, sin conjunto de validación independiente, por lo que deben considerarse indicativos.

## Requisitos de hardware

- VRAM estimada: la variante W4A8 (12,77 GB de pesos) encaja en GPUs de 16 GB; la W6A8 (15,61 GB) requiere 24 GB o más para dejar margen a activaciones y VAE.
- GPU recomendadas: RTX 4090 (24 GB) para W6A8; RTX 4080/4070 Ti Super (16 GB) para W4A8; A100 y H100 para despliegues de mayor volumen o batch.
- Cabe en GPU de consumo: sí, ambas variantes en la gama alta (16-24 GB).
- Opciones de despliegue: ComfyUI v0.38.0 o superior con comfy-kitchen >= 0.2.37; no se documentan otros runtimes (vLLM, llama.cpp, Ollama, TGI) para este formato.
- Componentes adicionales necesarios: text encoder Qwen3-VL 32B en NVFP4 AWQ y VAE fp16, distribuidos por separado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Tamano de pesos | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Minimax_H3_Image_INT6_INT4GPTQ (W6A8) | Difusion cuantizada INT6 | 15,61 GB | no aplica | MiniMax H3 Community License | Hugging Face (0 descargas) |
| Minimax_H3_Image_INT6_INT4GPTQ (W4A8) | Difusion cuantizada INT4 mixta | 12,77 GB | no aplica | MiniMax H3 Community License | Hugging Face (0 descargas) |
| Comfy-Org/MiniMax-H3-Image (INT8 ConvRot) | Difusion cuantizada INT8 | no disponible | no aplica | MiniMax H3 Community License | Hugging Face |
| MiniMaxAI/MiniMax-H3-Image (BF16 podado) | Difusion BF16 | no disponible | no aplica | MiniMax H3 Community License | Hugging Face |

No se dispone de datos de rendimiento comparativo con otros modelos de difusión en la información proporcionada.

## Limitaciones y advertencias

- Licencia restrictiva: la MiniMax H3 Community License Agreement no es una licencia open source estándar; es imprescindible revisar sus términos antes de cualquier uso comercial.
- Las métricas de error se midieron sobre los mismos datos de calibración, sin conjunto de validación independiente; pueden no reflejar el comportamiento con prompts reales.
- El autor recomienda verificar la calidad de salida con los prompts y flujos propios antes de confiar en el modelo en producción.
- El modelo no incluye text encoder ni VAE: sin los archivos complementarios de Comfy-Org no es funcional.
- Dependencia estricta de versiones: requiere ComfyUI v0.38.0 o superior y comfy-kitchen >= 0.2.37.
- Riesgo de sesgos y alucinaciones visuales inherente al modelo base de difusión; no se documentan sesgos específicos en la información disponible.
- Sin datos sobre idiomas soportados en los prompts ni sobre limitaciones de resolución o longitud de prompt.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/tsolful/Minimax_H3_Image_INT6_INT4GPTQ
- Modelo base original: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Repaquete oficial de ComfyUI: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- Text encoders de MiniMax H3: https://huggingface.co/Comfy-Org/MiniMax-H3/tree/main/text_encoders
- Herramienta de conversion (fork ComfyUI-INT8-Fast): https://github.com/tsolful/ComfyUI-INT8-Fast
