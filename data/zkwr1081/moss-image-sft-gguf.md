# zkwr1081/Moss-Image-SFT-GGUF

## Resumen

MOSS-Image-SFT GGUF es una conversión no oficial al formato GGUF del modelo de difusión texto-a-imagen OpenMOSS-Team/MOSS-Image-SFT, publicada por el usuario zkwr1081. El modelo original es un Diffusion Transformer (DiT) de aproximadamente 5.082 millones de parámetros afinado a partir de MOSS-Image-Base por el equipo OpenMOSS. Esta conversión incluye únicamente el transformer de difusión, por lo que requiere componentes externos para funcionar: un codificador de texto Qwen3.5-9B, el tokenizador oficial de MOSS y el VAE oficial (MOSS / FLUX.2).

La relevancia de esta publicación radica en que permite ejecutar un modelo de generación de imágenes de última generación en runtimes de difusión compatibles con GGUF, como stable-diffusion.cpp y, de forma experimental, ComfyUI mediante un puente comunitario. Se ofrecen dos niveles de cuantización (Q8_0 y Q4_K_S) con verificación de checksums SHA-256, lo que facilita el despliegue en hardware con VRAM limitada.

El modelo soporta prompts en lenguaje natural, secuencias de etiquetas y prompts de layout en JSON, con inglés y chino como idiomas principales. La licencia es Apache 2.0 y el repositorio ocupa 9.2 GB. No se han publicado resultados de benchmarks en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion Transformer (DiT) |
| Parametros totales | 5.082.308.624 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q8_0, Q4_K_S (mixed precision) |
| Idiomas soportados | Ingles, chino |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF v3 (463 tensores, `general.architecture=moss_image`) |

## Arquitectura y entrenamiento

El modelo es un Diffusion Transformer (DiT) de 5B parámetros, afinado (SFT) a partir de MOSS-Image-Base. La conversión GGUF contiene exclusivamente los pesos del transformer de difusión; el pipeline completo requiere un codificador de texto Qwen3.5-9B, el tokenizador oficial de MOSS (con vocabulario distinto al de los GGUF de Qwen genéricos) y el VAE oficial MOSS / FLUX.2. El muestreo utiliza flow-matching con sampler Euler, CFG 3.0, shift 5.0 y negative-branch skip layer en la capa 22 (índice cero).

En cuanto a la cuantización, el archivo Q8_0 contiene 252 tensores Q8_0, 210 BF16 y 1 F32, con un tamaño de 5.314 GiB. El archivo Q4_K_S es de precisión mixta: las 42 matrices `ffn_down` y cuatro matrices tempranas de proyección de valores permanecen en Q5_K, el resto de proyecciones principales del transformer están en Q4_K, y los embedders, normalización, modulación, condicionamiento temporal y tensores de salida conservan su precisión original (210 BF16, 1 F32), con un tamaño de 3.226 GiB. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni el uso de RLHF/DPO en la información proporcionada.

## Capacidades

- Generación de imágenes texto-a-imagen con resolución de aproximadamente 1M, 1.5M o 2M píxeles totales (dimensiones positivas divisibles por 16) y relación de aspecto arbitraria.
- Soporte de prompts en lenguaje natural, secuencias de etiquetas y prompts de layout estructurado en JSON con coordenadas absolutas en píxeles centradas.
- Muestreo flow-matching con sampler Euler, CFG configurable (recomendado 3.0, rango 3–6), shift 5.0 y negative-branch skip layer en la capa 22.
- Capacidades multilingües: inglés (mayor volumen de datos de entrenamiento) y chino, con soporte de otros idiomas según la documentación oficial.
- Integración con stable-diffusion.cpp mediante `sd-cli` y con ComfyUI a través del plugin experimental ComfyUI-MOSS-GGUF.
- No es un modelo de lenguaje: no soporta tool calling, function calling, agentes ni generación de texto.

## Casos de uso

- Generación de ilustraciones arquitectónicas y fotografía conceptual: el modelo puede producir renders detallados de interiores y exteriores a 1024×1024 con 50 pasos, CFG 3 y sampler Euler, adecuado para moodboards y previsualización de proyectos.
- Creación de assets para videojuegos y entornos virtuales: gracias al soporte de prompts de layout en JSON con coordenadas absolutas, se pueden posicionar elementos concretos en la composición, útil para generar texturas y escenarios con control espacial.
- Prototipado rápido en estudios de diseño: la cuantización Q4_K_S (3.226 GiB) permite ejecutar el transformer en GPUs de consumo con VRAM limitada usando `--offload-to-cpu` en stable-diffusion.cpp, reduciendo el coste de iteración.
- Generación bilingüe de contenido visual para mercados anglófono y sinófono: el soporte nativo de inglés y chino permite crear material promocional adaptado a ambos idiomas sin cambiar de modelo.
- Integración en pipelines de automatización con ComfyUI: mediante el plugin experimental ComfyUI-MOSS-GGUF y ComfyUI-GGUF se pueden encadenar nodos de muestreo, SLG y postprocesado para flujos de producción por lotes.
- Investigación en cuantización de modelos de difusión: la publicación incluye comparaciones controladas entre BF16, Q8_0 y Q4_K_S con idéntico encoder, VAE, seed y parámetros de muestreo, lo que sirve como referencia para estudiar el impacto de la cuantización en la calidad de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card incluye una validación comparativa de tiempos de muestreo entre el transformer BF16 original y ambas cuantizaciones GGUF sobre una NVIDIA RTX PRO 6000 Blackwell Max-Q a 1024×1024, con 30 pasos, CFG 3, Euler, scheduler discreto, flow shift 5, seed 42 y RNG de CPU. Sin embargo, los valores numéricos de esa tabla no están completos en la información proporcionada, por lo que no se reproducen.

## Requisitos de hardware

- VRAM estimada para el transformer: aproximadamente 5.3 GiB para Q8_0 y 3.2 GiB para Q4_K_S, a los que hay que sumar el codificador de texto Qwen3.5-9B (unos 5–6 GiB en Q4_K_M) y el VAE en FP32.
- GPU recomendadas: NVIDIA RTX PRO 6000 Blackwell Max-Q (usada en la validación oficial), A100, H100 para despliegues de producción; RTX 4090 y GPUs con 16–24 GiB de VRAM para uso individual.
- Cabe en GPU de consumo: sí, especialmente con Q4_K_S y `--offload-to-cpu` en stable-diffusion.cpp, aunque el codificador Qwen3.5-9B es el componente que más VRAM consume.
- Opciones de despliegue: stable-diffusion.cpp (`sd-cli`), ComfyUI con el plugin experimental ComfyUI-MOSS-GGUF más ComfyUI-GGUF, y el plugin oficial OpenMOSS (que carga safetensors, no GGUF).
- Latencia y throughput: no disponibles de forma completa en la información proporcionada; la validación reporta tiempos medios de muestreo y extremo a extremo, pero los valores no están íntegros en los datos disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| MOSS-Image-SFT GGUF (este) | 5.082 M (DiT) | No disponible | Apache 2.0 | GGUF | Requiere Qwen3.5-9B + VAE externos |
| OpenMOSS-Team/MOSS-Image-SFT | 5.082 M (DiT) | No disponible | Apache 2.0 | Safetensors/Diffusers | Modelo base oficial, sin cuantizar |
| MOSS-Image-Base | No disponible | No disponible | No disponible | No disponible | Modelo del que se afina el SFT |

No se dispone de datos de benchmarks para comparar el rendimiento frente a alternativas de la misma categoría en la información proporcionada.

## Limitaciones y advertencias

- La conversión GGUF es no oficial y no ha sido certificada de forma exhaustiva: la paridad de calidad con el SFT original y todos los niveles de cuantización no están verificados.
- El puente ComfyUI-MOSS-GGUF es experimental; el plugin oficial de OpenMOSS no carga archivos GGUF del transformer.
- No es un modelo de lenguaje: no debe usarse en Ollama, LM Studio ni llama.cpp para generación de texto.
- Requiere obligatoriamente componentes externos (Qwen3.5-9B, tokenizador oficial de MOSS y VAE MOSS/FLUX.2); el tokenizador debe pasarse explícitamente porque el vocabulario difiere del de los GGUF de Qwen genéricos.
- Distintos runtimes no producen resultados idénticos píxel a píxel con la misma seed; el scheduler nativo de ComfyUI no aplica el snapping de la rejilla de entrenamiento del pipeline standalone.
- Riesgo de sesgos y alucinaciones visuales inherente a los modelos de difusión entrenados predominantemente con datos en inglés; el rendimiento en otros idiomas distintos del inglés y el chino no está documentado.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar las licencias de los componentes externos (Qwen3.5-9B y VAE) antes de un despliegue en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zkwr1081/Moss-Image-SFT-GGUF
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Paper (MOSS-Image Technical Report): https://huggingface.co/papers/2610.23374
- Página del proyecto: https://openmoss.ai/MOSS-Image/
- Guía de usuario oficial: https://github.com/OpenMOSS/MOSS-Image/blob/main/USERGUIDE.md
- Plugin oficial ComfyUI: https://github.com/OpenMOSS/MOSS-Image/tree/main/comfyui
- stable-diffusion.cpp (soporte MOSS-Image): https://github.com/leejet/stable-diffusion.cpp/blob/master/docs/moss_image.md
- ComfyUI-MOSS-GGUF (experimental): https://github.com/RealRebelAI/ComfyUI-MOSS-GGUF
- ComfyUI-GGUF: https://github.com/city96/ComfyUI-GGUF
- Codificador Qwen3.5-9B GGUF: https://huggingface.co/unsloth/Qwen3.5-9B-GGUF
