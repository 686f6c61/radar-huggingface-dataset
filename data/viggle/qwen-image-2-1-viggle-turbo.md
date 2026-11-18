# Viggle/Qwen-Image-2.1-viggle-turbo

## Resumen

Qwen-Image-2.1-viggle-turbo es un adaptador LoRA de destilación few-step para el modelo de difusión de texto a imagen Qwen-Image-2.1 de Alibaba Qwen, publicado por Viggle. Su función es reducir el coste de inferencia del modelo base de 40 pasos con classifier-free guidance a 6 pasos sin CFG, manteniendo una calidad muy cercana a la del original en la mayoría de prompts. Es relevante porque permite generar imágenes de 1024x1024 en aproximadamente un quinto del tiempo del modelo base, sin requerir reentrenamiento ni cambios en el pipeline subyacente.

El adaptador se distribuye en formato LoRA de rango 256 (bf16, 1,3 GB) y rango 128 (0,7 GB), además de versiones fusionadas en el transformer base en int8, fp8 e4m3fn y GGUF (Q8_0, Q6_K, Q5_K_M, Q4_K_M) para su uso en ComfyUI. El modelo base Qwen-Image-2.1 tiene 7.115.124.736 parámetros en el transformer (dato real de los safetensors), y el repositorio completo ocupa 105,9 GB.

La versión actual es v0.3 (29 de septiembre de 2026), que introduce un modo de 9 pasos con conmutación a mitad de muestreo: 7 pasos con el LoRA turbo activo y 2 pasos finales con el modelo base sin LoRA. Este modo mejora el detalle fino y la precisión en texto pequeño a cambio de un 40-50 % más de tiempo, manteniéndose unas 3,5 veces más rápido que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusión (modelo base Qwen-Image-2.1); adaptador LoRA de destilación few-step |
| Parametros totales | 7.115.124.736 (transformer del modelo base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16 (LoRA r256 y r128), int8_convrot, fp8_e4m3fn, GGUF Q8_0, Q6_K, Q5_K_M, Q4_K_M |
| Idiomas soportados | No disponible (modelo texto-imagen; el prompt se procesa vía el text encoder del modelo base) |
| Licencia | qwen-research (etiquetada como "other" en Hugging Face) |
| Formato de pesos | safetensors (LoRA y transformer fusionado), GGUF, formato peft |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA que se carga sobre el transformer del modelo base Qwen-Image-2.1 en tiempo de ejecución con la librería `peft`. La destilación reduce el número de pasos de muestreo de 40 a 6 y elimina la necesidad de classifier-free guidance (`true_cfg_scale=1.0`). El scheduler es un `FlowMatchEulerDiscreteScheduler` con una configuración específica de sigmas (`[1.0, 0.9375, 0.875, 0.75, 0.5, 0.25]`) y `shift_terminal: null`, que debe pasarse en cada llamada.

La versión v0.3 se entrenó con un balance distinto respecto a v0.2.1: menos grano y superficies más limpias, con textura fina algo más suave. El autor indica que la diversidad se mantiene cercana a la del modelo base y que la precisión en texto pequeño es similar. El modo de 9 pasos combina 7 pasos con el LoRA turbo y 2 pasos finales con el modelo base, requiriendo reextraer las claves/valores del text encoder y de las imágenes de referencia en el primer paso del modelo base. El pipeline `QwenImage21Pipeline` no está aún en una versión estable de `diffusers`, por lo que se requiere una instalación fijada desde el repositorio git.

## Capacidades

- Generación de texto a imagen con resolución de salida configurable (1024x1024 en los ejemplos).
- Edición de imagen guiada por instrucciones en lenguaje natural con 1 a 3 imágenes de referencia, referenciadas como `<image1>`, `<image2>`, etc.
- Muestreo few-step: 6 pasos en modo turbo, 9 pasos en modo mixto turbo + base.
- Inferencia sin classifier-free guidance (`true_cfg_scale=1.0`).
- Compatibilidad con ComfyUI mediante nodos personalizados y workflows incluidos en el repositorio.
- Compatibilidad con cuantización int8, fp8 y GGUF para despliegue con menor huella de memoria.
- Control de reproducibilidad mediante semilla (`torch.Generator`).

## Casos de uso

- Generación de imágenes en producción a gran volumen: el modo de 6 pasos reduce el coste por imagen aproximadamente un 80 % frente al modelo base de 40 pasos, lo que lo hace adecuado para pipelines que generan cientos o miles de imágenes por hora.
- Edición de imágenes por instrucción en herramientas creativas: admite hasta 3 imágenes de referencia y permite tareas como sustitución de fondo manteniendo el sujeto, útil en flujos de retoque y composición.
- Prototipado rápido en estudios de diseño: la velocidad de 6 pasos permite iterar prompts y variaciones en segundos, con la opción de cambiar al modo de 9 pasos para piezas finales con más detalle.
- Integración en ComfyUI para artistas técnicos: los workflows y nodos incluidos permiten montar grafos de generación y edición sin escribir código, usando las versiones fusionadas en GGUF o fp8.
- Despliegue en hardware con VRAM limitada: las variantes GGUF Q4_K_M y Q5_K_M y las versiones int8/fp8 reducen el requisito de memoria frente al transformer en bf16, facilitando su uso en GPUs de consumo.
- Generación de material gráfico para marketing y redes sociales: la calidad cercana al modelo base en la mayoría de prompts y la ausencia de CFG simplifican la configuración del pipeline en servicios backend.
- Evaluación comparativa de destilaciones: el repositorio conserva v0.2.1 y v0.2, lo que permite comparar el equilibrio calidad/velocidad entre versiones en el mismo entorno.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Los únicos datos de rendimiento aportados por el autor son relativos: aproximadamente 5 veces más rápido que el modelo base de 40 pasos de extremo a extremo en modo de 6 pasos, y aproximadamente 3,5 veces más rápido en modo de 9 pasos (1,4-1,5 veces el tiempo del modo de 6 pasos).

## Requisitos de hardware

- VRAM estimada: no disponible de forma explícita. El transformer del modelo base tiene 7.115 millones de parámetros; en bf16 son aproximadamente 14,2 GB solo para los pesos, a los que hay que sumar el text encoder, el VAE y las activaciones. Las variantes int8, fp8 y GGUF reducen esta cifra.
- GPU recomendadas: no disponible en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada en la información; las variantes GGUF Q4_K_M y Q5_K_M están pensadas para reducir la huella de memoria, pero no se especifican GPUs concretas.
- Opciones de despliegue: `diffusers` (con `QwenImage21Pipeline` desde git y `peft`), ComfyUI mediante los nodos personalizados incluidos. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: solo se indica la mejora relativa (aproximadamente 5x en 6 pasos y 3,5x en 9 pasos frente al modelo base). No se aportan valores absolutos en segundos ni imágenes por segundo.

## Comparativa con modelos similares

| Modelo | Parametros (transformer) | Pasos | CFG | Licencia | Formato |
|---|---|---|---|---|---|
| Qwen-Image-2.1-viggle-turbo v0.3 | 7.115.124.736 (base) + LoRA | 6 u 9 | No | qwen-research | safetensors, GGUF, peft |
| Qwen-Image-2.1 (base) | 7.115.124.736 | 40 | Sí | qwen-research | safetensors |
| Qwen-Image-2.1-viggle-turbo v0.2.1 | 7.115.124.736 (base) + LoRA | 6 | No | qwen-research | safetensors, peft |
| Qwen-Image-2.1-viggle-turbo v0.2 | 7.115.124.736 (base) + LoRA | 6 (entrenado con 5) | No | qwen-research | safetensors, peft |

No se dispone de datos de benchmarks ni de comparación con destilaciones equivalentes de otros autores en la información proporcionada.

## Limitaciones y advertencias

- El autor reconoce que el modo de 6 pasos está cerca de su capacidad: cada mejora encontrada desde v0.2.1 implicó un coste en otra dimensión (más nitidez con más grano, menos grano con aspecto más suave).
- Las diferencias más claras frente al modelo base están en texto pequeño y denso y en ediciones complejas, donde el turbo puede fallar o degradar el resultado.
- El modo de 9 pasos no garantiza siempre la corrección del texto pequeño; el autor lo describe como "más a menudo, no siempre".
- v0.3 no es una actualización estricta de v0.2.1: si se prefiere el aspecto más nítido, debe usarse v0.2.1.
- El modo de 9 pasos solo funciona en `diffusers` y en el Space de demostración, no en ComfyUI.
- La licencia es qwen-research, no una licencia de código abierto permisiva; es necesario revisar el archivo LICENSE del repositorio antes de un uso comercial.
- El pipeline requiere una versión de `diffusers` instalada desde git, lo que introduce riesgo de incompatibilidades con versiones futuras.
- No se especifican sesgos conocidos ni tasas de alucinación; al ser un modelo de difusión, el riesgo principal es la generación de contenido inexacto o no fiel al prompt, no la alucinación textual.
- No se dispone de información sobre idiomas soportados ni sobre limitaciones de contexto del text encoder.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Viggle/Qwen-Image-2.1-viggle-turbo
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Demo Space: https://huggingface.co/spaces/Viggle/Qwen-Image-2.1-viggle-turbo
- Sitio de Viggle: https://viggle.ai/
- Herramientas de Viggle: https://viggle.ai/tools
- Documentación de `diffusers` (instalación fijada al commit 80c7ed262aeffbeb43ef13ae04baeb9b84515a69): https://github.com/huggingface/diffusers
