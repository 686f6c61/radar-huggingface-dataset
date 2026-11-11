# WaveCut/MiniMax-H3-Image-OrbitQuant-W4A8

## Resumen

MiniMax-H3-Image-OrbitQuant-W4A8 es una versión cuantizada a 4 bits del modelo de difusión MiniMax-H3-Image de MiniMax, un transformer de difusión de 33.100 millones de parámetros para generación de imágenes a partir de texto y edición de imágenes. La cuantización la ha desarrollado el usuario WaveCut mediante su herramienta OrbitQuant, que aplica GPTQ con activaciones de 8 bits sobre pesos de 4 bits (esquema W4A8) tanto al transformer de difusión como al codificador de texto Qwen3-VL. El objetivo es reducir los requisitos de memoria y el tiempo de inferencia sin degradar de forma significativa la calidad visual.

El modelo original está destilado para generar imágenes en 6 pasos sin classifier-free guidance y alcanza resoluciones de hasta 16 megapíxeles (por ejemplo, 4096×4096). El principal problema que resuelve esta versión es el enorme coste de despliegue del original: 135,4 GB de pesos BF16 frente a los 27,5 GB de esta release, lo que permite ejecutarlo en GPUs de 24 GB mediante offload y reduce la latencia a aproximadamente la mitad en una RTX PRO 6000.

La relevancia actual radica en que demuestra que la cuantización W4A8 con kernels fusionados puede hacer viable en hardware de consumo o de gama profesional un modelo de difusión de más de 30.000 millones de parámetros, manteniendo la fidelidad respecto al BF16 con valores de LPIPS entre 0,015 y 0,238 según el caso. La licencia es la MiniMax-H3-Image Community License Agreement, no estándar y con posibles restricciones para uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (DiT) con codificador de texto Qwen3-VL; destilado a 6 pasos sin CFG |
| Parámetros totales | 33.100 millones (modelo original) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | W4A8 (pesos 4 bits, activaciones 8 bits), GPTQ rounding; atención INT8 opcional |
| Idiomas soportados | inglés (en); los prompts deben escribirse en inglés |
| Licencia | minimax-h3-image-community-license-agreement (other) |
| Formato de pesos | safetensors (librería diffusers) |

## Arquitectura y entrenamiento

El modelo base MiniMax-H3-Image es un transformer de difusión de 33,1B parámetros acoplado a un codificador de texto MiniMax-H3 basado en Qwen3-VL. El modelo está destilado para funcionar en 6 pasos de muestreo sin classifier-free guidance, y el transformer almacena la modulación de sus seis timesteps, por lo que esta release solo soporta ese schedule de inferencia. Genera imágenes de entre aproximadamente 4 y 20 megapíxeles, con mejor calidad en torno a 16 MP.

Esta versión cuantizada no reentrena el modelo: aplica GPTQ rounding sobre los pesos para obtener códigos de 4 bits, calibrados con prompts que no forman parte del conjunto de evaluación, y ejecuta tanto el transformer como el codificador de texto con activaciones de 8 bits. El runtime es el pipeline modular oficial de Diffusers para MiniMax-H3-Image con kernels OrbitQuant fusionados, e incluye nodos ComfyUI-OrbitQuant. La release ocupa 27,5 GB frente a los 135,4 GB del original (66,3 GB del transformer y 66,7 GB del codificador de texto). No se dispone de información sobre el dataset de entrenamiento del modelo base ni sobre si se usó RLHF o DPO.

## Capacidades

- Generación de imágenes a partir de texto (text-to-image) en resoluciones de hasta 16 MP y superiores (hasta 20 MP).
- Edición de imágenes con múltiples referencias: hasta 16 imágenes de referencia, referenciadas en el prompt como `<Picture 1>`, `<Picture 2>`, etc.
- Generación en 6 pasos sin classifier-free guidance, lo que reduce el coste computacional por imagen.
- Soporte de resolución flexible en múltiplos de 32 píxeles, con tamaños recomendados como 4096×4096, 4736×3552, 5024×3360, 5472×3072 y 6272×2688, y sus versiones verticales.
- Comprensión de prompts detallados en inglés; el modelo espera descripciones completas de la imagen, no prompts cortos.
- Atención INT8 opcional para acelerar la inferencia a resoluciones altas.
- Perfiles de despliegue con offload de modelos a memoria host para GPUs con poca VRAM.
- No se documentan capacidades de tool calling, agentes, audio ni thinking mode.

## Casos de uso

- Generación de imágenes de alta resolución para impresión y diseño gráfico: el modelo produce imágenes de hasta 16-20 MP en 6 pasos, adecuadas para carteles, infografías y material editorial que requiere detalle fino.
- Edición de imágenes con referencias múltiples: permite modificar una imagen existente o combinar hasta 16 referencias mediante prompts en inglés, útil para retoque fotográfico, cambio de estilo o composición de escenas.
- Prototipado visual en estaciones de trabajo con una sola GPU: con offload funciona en 23,4 GiB de memoria libre (equivalente a una tarjeta de 24 GB), lo que permite iterar en un equipo de gama profesional sin clúster.
- Producción de contenido para marketing y publicidad: la generación de carteles Art Deco, editoriales de moda e infografías en pocos segundos (2,4 s a 2048×2048 en una RTX PRO 6000) facilita la exploración rápida de variaciones creativas.
- Generación de cómics y viñetas: el modelo maneja composiciones de cuatro paneles y texto en imagen, como muestra el ejemplo de la model card, útil para storyboards y previsualización narrativa.
- Renderizado de escenas con texto integrado: ejemplos como un menú de pizarra o un cartel con caracteres cirílicos indican capacidad de generar texto legible dentro de la imagen, aplicable a mockups de producto y señalética.
- Integración en pipelines de Diffusers y ComfyUI: al usar el pipeline modular oficial y nodos de ComfyUI, se puede incorporar en flujos de automatización de generación por lotes o en herramientas de diseño existentes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible. La model card proporciona métricas de latencia, memoria y fidelidad visual:

| Métrica | BF16 original | OrbitQuant W4A8 |
|---|---|---|
| Tiempo, 4096×4096 (RTX PRO 6000) | 22,4 s | 13,5 s |
| Tiempo, 2048×2048 (RTX PRO 6000) | 4,4 s | 2,4 s |
| Pico de memoria en dispositivo, 4096×4096 | no disponible | 29,8 GiB |
| Memoria libre mínima con offload | no disponible | 23,4 GiB (simulado 24 GB) |
| Tamaño del checkpoint | 135,4 GB | 27,5 GB |
| LPIPS medio frente a BF16 | — | 0,182 (0,195 con atención INT8) |
| LPIPS por caso (rango documentado) | — | 0,015 (edición) a 0,238 (menú de pizarra) |

Con atención INT8 a 4096×4096 el tiempo baja a 13,0 s (4 % más rápido), a costa de subir el LPIPS medio de 0,182 a 0,195.

## Requisitos de hardware

- VRAM estimada: 29,8 GiB de pico en dispositivo para 4096×4096 sin offload; con offload funciona en 23,4 GiB de memoria libre (simulación de tarjeta de 24 GB).
- GPU recomendadas: RTX PRO 6000 Blackwell (stack probado con Torch 2.12.1 y CUDA 13.0); cualquier GPU NVIDIA con al menos 24 GB, como RTX 4090 o A100, debería poder ejecutarlo con offload, aunque no se documentan pruebas en esas tarjetas.
- Cabe en GPU de consumo de gama alta (24 GB) solo con el perfil de offload activado.
- Opciones de despliegue: Diffusers (pipeline modular oficial con kernels OrbitQuant), script `run_minimax_h3_image.py` incluido, y nodos ComfyUI-OrbitQuant.
- Requisitos de sistema: Linux, Python 3.12, NVIDIA GPU.
- Latencia y throughput: 13,5 s por imagen a 4096×4096 y 2,4 s a 2048×2048 en RTX PRO 6000; no se documenta throughput por lotes.

## Comparativa con modelos similares

| Modelo | Parámetros | Resolución máx. | Pesos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax-H3-Image (BF16) | 33,1B | ~20 MP | 135,4 GB | MiniMax-H3-Image Community License | Hugging Face (MiniMaxAI) |
| MiniMax-H3-Image-OrbitQuant-W4A8 | 33,1B (4 bits) | ~20 MP | 27,5 GB | MiniMax-H3-Image Community License | Hugging Face (WaveCut) |
| Alternativas de difusión de gran tamaño | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de datos de otros modelos de difusión comparables en parámetros, contexto o rendimiento, por lo que la comparativa se limita a las dos variantes del mismo modelo.

## Limitaciones y advertencias

- La cuantización introduce degradación visual medible: el LPIPS frente a BF16 varía entre 0,015 y 0,238 según el caso, con mayor desviación en escenas con texto denso (menú de pizarra, 0,238) y cómics (0,230).
- Solo soporta el schedule de 6 pasos sin CFG; no es posible usar otros schedules de muestreo con esta release.
- Los prompts deben estar en inglés y ser detallados; los prompts cortos producen imágenes simples.
- El modelo solo declara soporte de inglés, lo que limita su uso en otros idiomas sin traducción previa del prompt.
- La licencia es la MiniMax-H3-Image Community License Agreement, no estándar; es necesario revisar sus términos antes de cualquier uso comercial.
- Requiere Linux, Python 3.12 y GPU NVIDIA; no se documenta soporte para otros sistemas.
- Riesgo de alucinación visual y de errores en la generación de texto dentro de la imagen, especialmente en resoluciones altas o escenas complejas.
- No se documentan sesgos conocidos del modelo base en la información disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay validación comunitaria independiente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/WaveCut/MiniMax-H3-Image-OrbitQuant-W4A8
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image
- Prompt expander: https://huggingface.co/MiniMaxAI/MiniMax-H3-Image-PE
- Repositorio OrbitQuant: https://github.com/iamwavecut/OrbitQuant
- Nodos ComfyUI-OrbitQuant: https://github.com/iamwavecut/ComfyUI-OrbitQuant
- Pull request de Diffusers para MiniMax-H3-Image: https://github.com/huggingface/diffusers/pull/15230
