# SushmaMaddali/data266-pokemon-sd15-lora-r32

## Resumen

`SushmaMaddali/data266-pokemon-sd15-lora-r32` es un adaptador LoRA de rango 32 para Stable Diffusion 1.5, publicado por SushmaMaddali. Ajusta el UNet del modelo base para generar imágenes con estética Pokémon a partir de texto, usando el dataset `reach-vb/pokemon-blip-captions`. No es un modelo completo: requiere cargar SD 1.5 y aplicar el adaptador.

El entrenamiento documentado es pequeño y acotado: 749 imágenes, 1.500 pasos, batch de 2, learning rate de 0,0001, precisión bf16 y semilla 266. Está pensado explícitamente para trabajos académicos y de investigación no comercial, y la propia model card advierte de que los personajes Pokémon están protegidos por derechos de autor.

Su interés actual es doble: sirve como caso práctico de fine-tuning eficiente con LoRA sobre un modelo de difusión consolidado, y como ejemplo de los problemas de gobernanza y propiedad intelectual que rodean a los adaptadores entrenados con material protegido. No hay benchmarks publicados ni datos de rendimiento que permitan compararlo objetivamente con alternativas.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA de rango 32 aplicada al UNet de Stable Diffusion 1.5; modelo de difusión latente con encoder CLIP y VAE |
| Parámetros totales | no disponible para el adaptador; el modelo base SD 1.5 tiene aproximadamente 1,07 mil millones de parámetros en total |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica a un modelo text-to-image; el encoder CLIP de SD 1.5 admite 77 tokens de texto |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible; el encoder CLIP de SD 1.5 está entrenado principalmente en inglés |
| Licencia | other; uso exclusivamente académico y no comercial según la model card, sujeto además a las licencias de SD 1.5 y del dataset |
| Formato de pesos | no disponible (el repositorio figura con 0,0 GB y no se listan ficheros de pesos) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el UNet de Stable Diffusion 1.5 mediante LoRA de rango 32. LoRA introduce matrices de baja dimensión en las capas del UNet y permite adaptar el modelo sin reentrenar todos los pesos. El pipeline completo mantiene la arquitectura habitual de SD 1.5: un encoder de texto CLIP, un UNet de difusión latente y un VAE para decodificar la imagen final.

El entrenamiento usó el dataset `reach-vb/pokemon-blip-captions`, con 749 imágenes y sus captions generados con BLIP. Los hiperparámetros documentados son 1.500 pasos, batch size de 2, learning rate de 0,0001, precisión bf16 y semilla 266. No se documenta RLHF, DPO ni ninguna innovación técnica adicional; es un fine-tuning supervisado convencional de un adaptador LoRA.

## Capacidades

- Generación de imágenes text-to-image con estética Pokémon a partir de prompts descriptivos.
- Adaptación de estilo y conceptos visuales sobre Stable Diffusion 1.5 sin modificar los pesos del modelo base.
- Reproducibilidad parcial del entrenamiento gracias a la semilla 266 y a los hiperparámetros publicados.
- Integración con pipelines de difusión basados en diffusers, ComfyUI, Automatic1111 o InvokeAI.
- Soporte de negative prompts y parámetros habituales de muestreo de SD 1.5.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni planificación.
- No es un modelo de lenguaje: no genera texto, código ni matemáticas.
- No tiene modo thinking, visión, audio ni capacidades multimodales de entrada.
- El multilingüismo no está garantizado; los prompts en castellano pueden funcionar peor que los prompts en inglés.

## Casos de uso

- Docencia en cursos de difusión: el adaptador permite demostrar en clase cómo un LoRA de rango 32 modifica el UNet de SD 1.5 con solo 749 imágenes y 1.500 pasos, con un coste de cómputo bajo y un flujo reproducible.
- Estudio de ablación de rango: comparar este adaptador r32 con la variante r8 del mismo autor para medir sobreajuste, fidelidad al estilo Pokémon y diversidad de salidas, manteniendo la semilla y los hiperparámetros.
- Aumento de datos sintéticos en investigación académica: generar variaciones de criaturas para entrenar o evaluar clasificadores de imágenes en un entorno no comercial, con revisión humana y control de derechos de autor.
- Análisis de memorización y derechos de propiedad intelectual: estudiar si el adaptador reproduce personajes concretos o solo conceptos amplios, un caso útil para investigación sobre copyright y modelos generativos.
- Prototipado conceptual no comercial: explorar criaturas ficticias inspiradas en Pokémon para un trabajo de ilustración, narrativa o diseño, siempre con revisión humana y sin explotación comercial.
- Evaluación de pipelines de inferencia: probar la integración del adaptador en diffusers, ComfyUI o Automatic1111, medir tiempos de carga y latencia, y comparar la calidad subjetiva con el modelo base sin LoRA.
- Experimentos de composición y adherencia al prompt: la model card advierte de composición débil y atributos ausentes; el adaptador sirve para estudiar cómo el rango y los datos afectan a esos fallos.
- Reproducibilidad y buenas prácticas de entrenamiento: replicar el entrenamiento con semilla 266, bf16, batch 2 y learning rate 0,0001 para documentar la variabilidad de los resultados en cursos y laboratorios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No hay FID, CLIP score, precisión de atributos ni comparaciones cuantitativas con otros adaptadores Pokémon.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA es pequeño, pero requiere cargar el UNet completo de SD 1.5. Como referencia habitual para SD 1.5 en fp16, se necesitan alrededor de 4 GB de VRAM como mínimo con optimizaciones, 6-8 GB recomendados y 8-12 GB para resoluciones de 768x768 o lotes mayores.
- GPU recomendadas: RTX 3060 de 12 GB, RTX 4060 Ti de 16 GB o RTX 4090 de 24 GB para uso cómodo en local. A100 o H100 no son necesarias para inferencia individual, aunque pueden usarse para generar lotes grandes.
- Cabe en GPU de consumo: sí, en tarjetas de 6 GB o más con fp16 y optimizaciones; conviene evitar resoluciones altas y lotes grandes en GPUs de 6-8 GB.
- Opciones de despliegue: diffusers en Python, ComfyUI, Automatic1111, InvokeAI y SD.Next. No es adecuado para vLLM, TGI ni llama.cpp, porque no es un modelo de lenguaje.
- Latencia y throughput: no hay mediciones publicadas para este adaptador. En una GPU de consumo, SD 1.5 a 512x512 con 20-30 pasos suele tardar del orden de segundos por imagen, pero el valor exacto depende de la GPU, la resolución, el sampler y el número de pasos.

## Comparativa con modelos similares

| Modelo | Base | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| `SushmaMaddali/data266-pokemon-sd15-lora-r32` | Stable Diffusion 1.5 | no disponible (LoRA r32) | no aplica; CLIP de 77 tokens | sin benchmarks publicados | other; solo académico y no comercial | HuggingFace; 0 descargas y 0 likes en la información disponible |
| `zhangyi617/sd15_pokemon_lora` | Stable Diffusion 1.5 (`runwayml`) | no disponible | no aplica; CLIP de 77 tokens | sin benchmarks en la información disponible | no disponible | HuggingFace |
| Stable Diffusion 1.5 base | Stable Diffusion 1.5 | aproximadamente 1,07 mil millones | no aplica; CLIP de 77 tokens | benchmarks públicos de SD 1.5 no incluidos en esta ficha | CreativeML Open RAIL-M | HuggingFace |

## Limitaciones y advertencias

- Los personajes Pokémon y sus ilustraciones están protegidos por derechos de autor. La model card restringe el uso a coursework académico y investigación no comercial, y prohíbe expresamente el uso comercial, la suplantación y el uso en producción.
- El dataset es pequeño: 749 imágenes y 1.500 pasos. Esto aumenta el riesgo de sobreajuste y de reproducir conceptos o personajes concretos en lugar de generar variaciones originales.
- La propia model card advierte de composición débil, atributos ausentes y posible reproducción de conceptos amplios de Pokémon.
- Stable Diffusion 1.5 es un modelo de 2022 con resolución nativa de 512x512; su calidad y adherencia al prompt son inferiores a las de modelos más recientes como SDXL o Flux.
- El encoder CLIP de SD 1.5 está centrado en inglés. Los prompts en castellano pueden producir resultados menos precisos y no hay soporte multilingüe declarado.
- No hay benchmarks publicados, por lo que la calidad del adaptador solo puede evaluarse de forma subjetiva.
- El repositorio figura con 0,0 GB y no se listan ficheros de pesos; conviene verificar que el adaptador esté realmente disponible antes de integrarlo.
- La licencia `other` puede generar ambigüedad jurídica. Además de la model card, deben cumplirse las licencias de Stable Diffusion 1.5 y del dataset `reach-vb/pokemon-blip-captions`.
- El safety checker de Stable Diffusion se mantuvo activado durante la evaluación, pero no garantiza que todas las salidas sean seguras o adecuadas.
- No es un modelo de lenguaje ni un agente: no soporta tool calling, razonamiento, código, matemáticas ni conversación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SushmaMaddali/data266-pokemon-sd15-lora-r32
- Modelo base Stable Diffusion 1.5: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset `reach-vb/pokemon-blip-captions`: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Adaptador similar de otro autor: https://huggingface.co/zhangyi617/sd15_pokemon_lora
- Etiqueta Pokémon en Civitai: https://civitai.com/tag/pokemon
- Lista de LoRAs Pokémon en Civitai: https://civitai.com/articles/960/ai-pokedex-lora-list
- Entrada relacionada de la variante r8: https://free2aitools.com/model/sushmamaddali/data266-pokemon-sd15-lora-r8
