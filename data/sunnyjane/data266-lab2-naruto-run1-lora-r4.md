# sunnyJane/data266-lab2-naruto-run1-lora-r4

## Resumen

`sunnyJane/data266-lab2-naruto-run1-lora-r4` es un adaptador LoRA de rango 4 entrenado sobre Stable Diffusion v1.5 para generar imágenes con el estilo y los personajes del conjunto de datos Naruto BLIP captions. Lo publica el usuario sunnyJane como resultado de la práctica "Lab 2" de la asignatura DATA 266, y su interés es fundamentalmente académico: documenta con detalle el protocolo de entrenamiento y las métricas obtenidas, algo poco habitual en adaptadores de este tipo.

El adaptador añade 797.184 parámetros entrenables sobre el modelo base y se entrenó durante 2000 pasos con batch de 4, tasa de aprendizaje 1e-4, scheduler coseno, precisión fp16 y Adam de 8 bits, consumiendo 0,973 GPU-horas en una única Tesla T4 con un pico de 4,35 GB de VRAM. El conjunto de datos es `lambdalabs/naruto-blip-captions`, con un split 90/10 fijado con semilla 266 que deja 1098 imágenes de entrenamiento a 512x512 píxeles.

Los resultados reportados sobre 20 prompts fijos y las semillas 0 y 1 son KID de 0,0490 frente al split de test, CLIP score de 30,55 y diversidad LPIPS de 0,7783. Es relevante ahora como referencia reproducible de bajo coste para experimentos de personalización con LoRA, pero conviene tener en cuenta que la model card está incompleta (contiene marcadores "TODO"), que el repositorio declara 0,0 GB de tamaño y que los personajes de Naruto están sujetos a copyright, por lo que el propio autor restringe el uso a investigación no comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 4 sobre Stable Diffusion v1.5 (UNet, VAE y text encoder CLIP) |
| Parámetros totales | 797.184 parámetros entrenables en el adaptador; el repositorio declara 0,0 GB, por lo que el tamaño real de los pesos no está disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 77 tokens de prompt (tokenizador CLIP del modelo base SD 1.5); resolución de entrenamiento 512x512 píxeles |
| Tipos de cuantización | No disponible; el entrenamiento se realizó en fp16 con Adam de 8 bits |
| Idiomas soportados | No disponible |
| Licencia | CreativeML Open RAIL-M, con restricción adicional del autor a uso no comercial por copyright de los personajes |
| Formato de pesos | No disponible; la librería declarada es diffusers (en un adaptador LoRA se esperaría safetensors, pero no se confirma) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA de rango 4 aplicado sobre Stable Diffusion v1.5, un modelo de difusión latente compuesto por un UNet, un VAE y un text encoder CLIP. El adaptador no modifica los pesos del modelo base: inyecta matrices de bajo rango en las capas que se entrenan, lo que reduce los parámetros entrenables a 797.184 y permite almacenar el resultado en unos pocos megabytes en fp16.

El entrenamiento usó el dataset `lambdalabs/naruto-blip-captions` con un split 90/10 fijado con semilla 266, lo que deja 1098 imágenes de entrenamiento a 512x512 píxeles. La configuración fue de 2000 pasos, batch de 4, tasa de aprendizaje 1e-4 con scheduler coseno, precisión fp16 y optimizador Adam de 8 bits. El coste total fue de 0,973 GPU-horas en una Tesla T4 con un pico de 4,35 GB de memoria. No se documenta en la información disponible si hubo aumento de datos, filtrado de captions ni ninguna innovación técnica adicional más allá del propio ajuste LoRA.

## Capacidades

- Generación de imágenes texto-a-imagen condicionada por prompts en el dominio del dataset de entrenamiento (personajes y escenas de estilo Naruto).
- Personalización de estilo y de personajes sobre Stable Diffusion v1.5 sin reentrenar el modelo base, con un adaptador de menos de 800.000 parámetros.
- Composición modular: al ser un LoRA de diffusers, puede cargarse junto con el modelo base y combinarse con otros adaptadores en un mismo pipeline.
- Reproducibilidad experimental: semillas y prompts fijados (20 prompts, semillas 0 y 1) que permiten repetir la evaluación.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes ni modo "thinking": es un modelo exclusivamente generativo de imagen.
- Capacidades de visión (comprensión de imagen), audio y multilingües: no disponibles en la información proporcionada.

## Casos de uso

- Experimentación académica con LoRA: reproducir la curva de entrenamiento y comparar el rango 4 con rangos superiores sobre el mismo dataset, gracias a que la configuración y el coste (0,973 GPU-horas en T4) están documentados.
- Generación de ilustraciones de estilo anime para prototipos no comerciales: maquetas de interfaz, pruebas de concepto o demos internas donde no se requiere calidad de producción.
- Aumento de datos sintéticos: generar variaciones de personajes de estilo anime para entrenar o testear clasificadores de imagen en un entorno de investigación controlado.
- Estudio de sobreajuste en personalización: con solo 1098 imágenes y 2000 pasos, el adaptador sirve para analizar cómo el rango y los pasos afectan a la diversidad (métrica LPIPS de 0,7783 como referencia).
- Docencia sobre modelos de difusión: ejemplo mínimo y de bajo coste para explicar qué es un LoRA, cómo se inyecta en un UNet y cómo se evalúa con KID y CLIP score.
- Pruebas de pipelines de inferencia: validar la integración de adaptadores LoRA en diffusers, ComfyUI o WebUI con un checkpoint pequeño antes de pasar a adaptadores de producción.
- Evaluación comparativa de métricas: usar los valores KID 0,0490 y CLIP 30,55 como línea base de referencia en experimentos de generación condicionada por texto.

## Benchmarks y rendimiento

| Métrica | Valor | Condiciones |
|---|---|---|
| KID (in-domain frente a test) | 0,0490 | 20 prompts fijos, semillas 0 y 1 |
| CLIP score | 30,55 | 20 prompts fijos, semillas 0 y 1 |
| Diversidad LPIPS | 0,7783 | 20 prompts fijos, semillas 0 y 1 |
| Coste de entrenamiento | 0,973 GPU-horas | 1x Tesla T4, pico de 4,35 GB |
| Pasos de entrenamiento | 2000 (batch 4) | LR 1e-4, coseno, fp16, Adam 8 bits |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de texto: el modelo es un generador de imágenes. Tampoco se proporcionan valores de FID ni comparaciones numéricas con otros adaptadores en la información disponible.

## Requisitos de hardware

- VRAM de inferencia: el pipeline completo de SD 1.5 en fp16 ocupa aproximadamente 4 GB; el adaptador LoRA añade alrededor de 1,6 MB de pesos (797.184 parámetros en fp16), por lo que el requisito lo marca el modelo base.
- GPU validadas: Tesla T4 para entrenamiento (pico medido de 4,35 GB). Para inferencia, cualquier GPU con 6 GB o más de VRAM es suficiente en fp16.
- GPU de consumo: sí cabe en RTX 3060 12 GB, RTX 4060 Ti, RTX 4070 y RTX 4090; también en tarjetas de 8 GB con `enable_attention_slicing` o `enable_model_cpu_offload`.
- Despliegue: diffusers (`load_lora_weights`), Automatic1111/Forge, ComfyUI e InvokeAI. vLLM, llama.cpp, Ollama y TGI no aplican porque no es un modelo de lenguaje.
- Throughput y latencia: no disponible. Como referencia de coste, el entrenamiento completo de 2000 pasos con batch 4 consumió 0,973 GPU-horas en una T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / resolución | Métricas publicadas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA r4 sobre SD 1.5) | 797.184 entrenables | 77 tokens, 512x512 | KID 0,0490; CLIP 30,55; LPIPS 0,7783 | CreativeML Open RAIL-M + restricción no comercial | HuggingFace |
| Stable Diffusion v1.5 (base, sin adaptador) | ~860 M en el UNet | 77 tokens, 512x512 | No comparable con estas métricas en la información disponible | CreativeML Open RAIL-M | HuggingFace |
| Otros LoRA de personajes sobre SD 1.5 | No disponible | 77 tokens, 512x512 | No disponible | Variable | HuggingFace |
| Fine-tune completo tipo DreamBooth sobre SD 1.5 | No disponible | 77 tokens, 512x512 | No disponible | Variable | HuggingFace |

No hay datos públicos suficientes en la información proporcionada para establecer una comparación numérica con alternativas; las filas restantes se marcan como no disponibles para no inferir cifras.

## Limitaciones y advertencias

- La model card está incompleta: los apartados de limitaciones y de licencia contienen marcadores "TODO" sin redactar por el autor.
- El repositorio declara 0,0 GB de tamaño, por lo que no está confirmado que los pesos del adaptador estén realmente subidos y sean descargables.
- El dataset de entrenamiento es pequeño (1098 imágenes a 512x512) y el entrenamiento es de 2000 pasos, una combinación propensa al sobreajuste y a la reproducción de composiciones vistas.
- Los personajes de Naruto están protegidos por copyright; el propio autor restringe el adaptador a investigación no comercial, lo que prevalece sobre el uso comercial que la licencia CreativeML Open RAIL-M permitiría en principio.
- El CLIP score de 30,55 es moderado y la evaluación se limita a 20 prompts fijos con dos semillas, un protocolo reducido que no cubre la variabilidad real en producción.
- Solo se reporta KID in-domain; no hay FID, ni evaluación fuera de dominio, ni análisis de sesgos demográficos o culturales del dataset.
- No se especifican idiomas soportados; el comportamiento con prompts en castellano no está documentado y dependerá del text encoder CLIP del modelo base, entrenado mayoritariamente en inglés.
- Riesgo de alucinación visual: como cualquier modelo de difusión, puede generar anatomía incorrecta, texto ilegible y detalles inconsistentes, especialmente fuera del dominio anime.
- No es apto para tareas de razonamiento, código, matemáticas, agentes ni procesamiento de lenguaje: es exclusivamente un generador de imagen.
- Antes de usar en producción, verificar la disponibilidad real de los pesos, la versión exacta del modelo base y los términos de la licencia CreativeML Open RAIL-M.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sunnyJane/data266-lab2-naruto-run1-lora-r4
- Modelo base (Stable Diffusion v1.5): https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento (Naruto BLIP captions): https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
- Texto de la licencia CreativeML Open RAIL-M: https://huggingface.co/spaces/CompVis/stable-diffusion-license
- Documentación de diffusers para adaptadores LoRA: https://huggingface.co/docs/diffusers/main/en/tutorials/using_peft_for_inference
