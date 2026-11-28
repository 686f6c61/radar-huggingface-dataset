# zkwr1081/Moss-image-anime-lora

## Resumen

Moss-image-anime-lora es un adaptador LoRA de estilo para generación de imágenes texto-a-imagen, entrenado sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT. Lo desarrolla el usuario zkwr1081 y está publicado en Hugging Face bajo licencia Apache 2.0. Su propósito es inyectar un estilo anime de corte seinen —acción dramática, iluminación cinematográfica, personajes adultos expresivos, siluetas marcadas y entornos densos— en el pipeline de MOSS-Image, sin necesidad de reentrenar el modelo completo.

El adaptador se distribuye como un repositorio de 0,3 GB que incluye dos checkpoints (paso 1500 y paso 2000) en formato safetensors con claves Diffusers/PEFT, además de una variante convertida específicamente para ComfyUI. El checkpoint canónico es el de 2000 pasos, recomendado a escala 1.0 y sin el trigger registrado `moss_seinen_style`; el autor indica que las prompts naturales con la expresión "anime character" funcionan mejor en la mayoría de casos.

Es relevante ahora porque MOSS-Image es un modelo de difusión reciente con soporte nativo en ComfyUI, y este LoRA es uno de los primeros adaptadores de estilo publicados para él. No obstante, el repositorio no incluye información sobre el dataset de entrenamiento, el número de imágenes utilizadas ni métricas objetivas de calidad, por lo que su evaluación debe hacerse de forma empírica sobre el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un transformer de difusión (MOSS-Image) |
| Parametros totales | no disponible (el adaptador contiene 504 tensores; el tamaño del fichero ComfyUI es de 70,93 MiB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible para el LoRA; el modelo base dispone de conversión GGUF publicada por terceros |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Diffusers/PEFT y variante ComfyUI); GGUF disponible en repositorio externo |

## Arquitectura y entrenamiento

El adaptador es un LoRA de bajo rango aplicado sobre el transformer de difusión de MOSS-Image. El autor entrenó el adaptador contra MOSS-Image-Base, aunque la evaluación local favoreció MOSS-Image-SFT para inferencia, que es el modelo base declarado en la model card. Los pesos raíz usan claves Diffusers/PEFT del tipo `transformer.layers.0.proj.q.lora_A.weight`; la variante para ComfyUI es una conversión únicamente de espacio de nombres (`transformer.` pasa a `diffusion_model.`), sin cambios en valores, formas, dtypes, rango ni comportamiento del alpha. Los 504 tensores convertidos se verificaron contra los 252 módulos correspondientes de MOSS-Image-SFT.

No se especifican en la información disponible el número de imágenes de entrenamiento, la composición del dataset, el número de tokens o pasos totales, ni si se aplicaron técnicas de regularización o aumento de datos. El trigger de entrenamiento registrado es `moss_seinen_style`, aunque el autor señala que es opcional en inferencia. Se incluyen dos checkpoints: el de 2000 pasos (canónico, escala recomendada 1.0) y el de 1500 pasos (alternativo, escalas 0.7 o 1.0), ambos pensados para usarse sin el trigger y con prompts naturales que contengan "anime character" o "anime characters". El script de conversión reproducible se distribuye como `scripts/convert_moss_lora_for_comfyui.py`.

## Capacidades

- Generación de imágenes texto-a-imagen con estética anime seinen: acción, iluminación cinematográfica, personajes adultos, siluetas fuertes y composiciones energéticas.
- Aplicación de estilo sobre el modelo base MOSS-Image-SFT mediante LoRA, sin reentrenamiento del modelo completo.
- Compatibilidad con Diffusers y con ComfyUI (a través del fichero `MOSS-Image-Anime-LoRA-ComfyUI.safetensors`).
- Control de intensidad del estilo mediante la escala del LoRA (0.7 o 1.0 según checkpoint).
- Soporte de prompts descriptivos detallados (vestuario, acción, escenario, iluminación y composición).
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni multilingüismo, ya que es un adaptador de generación de imágenes.

## Casos de uso

- Ilustración de portadas para cómics o novelas ligueras de estilo seinen: el LoRA produce composiciones dramáticas con iluminación cinematográfica y personajes adultos, adecuadas para cubiertas y key art.
- Concept art para videojuegos de acción: se pueden generar escenas con siluetas marcadas y entornos densos (hangares, túneles, talleres) que sirvan como referencia visual para equipos de arte.
- Storyboarding de secuencias de acción: con prompts que describan movimiento (por ejemplo, deslizarse bajo una compuerta, disparar una bengala desde una moto), el adaptador genera viñetas coherentes con la estética del proyecto.
- Generación de fondos y ambientes para animación: escenarios con niebla, luces de advertencia o iluminación de taller que pueden reutilizarse como capas de fondo.
- Pruebas de estilo en pipelines de difusión: al ser un LoRA ligero (70,93 MiB en la variante ComfyUI), permite iterar rápidamente sobre variaciones de estilo sin cargar un modelo completo adicional.
- Integración en flujos de trabajo de ComfyUI para artistas: el fichero nativo se coloca en `ComfyUI/models/loras/` y se usa con el cargador LoRA estándar a fuerza de modelo 1.0 y fuerza de clip 0.0, lo que facilita su adopción en estudios pequeños.
- Exploración de variantes de checkpoint: los dos checkpoints incluidos (1500 y 2000 pasos) permiten comparar intensidades de estilo y elegir la más adecuada según la escena.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente comparaciones visuales cualitativas entre el modelo base sin LoRA y distintas configuraciones de checkpoint y escala, sin métricas numéricas (FID, CLIP score, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base MOSS-Image-SFT, no del LoRA, que añade una sobrecarga mínima (fichero de 70,93 MiB en la variante ComfyUI).
- GPU recomendadas: no disponibles en la información proporcionada.
- Compatibilidad con GPU de consumo: no disponible; el adaptador en sí es ligero, pero el requisito real lo marca el modelo base.
- Opciones de despliegue: Diffusers (formato PEFT nativo) y ComfyUI (variante nativa con loader MOSS-Image, commit `b1a247c` o posterior). Existe conversión GGUF en un repositorio externo para su uso con MOSS-Image-SFT-GGUF.
- Latencia y throughput estimados: no disponibles.
- Parámetros de inferencia recomendados: 50 pasos, guidance scale 3.0, prompt negativo vacío, resolución típica 1024 × 1024.

## Comparativa con modelos similares

No se dispone de información sobre otros LoRA de estilo anime publicados específicamente para MOSS-Image en la documentación consultada, por lo que la comparativa con alternativas de la misma categoría no está disponible.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moss-image-anime-lora | no disponible (504 tensores; 70,93 MiB en ComfyUI) | no aplica | sin benchmarks publicados | Apache 2.0 | Hugging Face |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se documentan sesgos conocidos del adaptador; al ser un LoRA de estilo anime, puede heredar sesgos del modelo base y del dataset de entrenamiento, que no se describe.
- Riesgo de alucinación visual: como todo modelo de difusión, puede generar anatomía incorrecta, texto ilegible o incoherencias espaciales, especialmente en escenas de acción complejas.
- El trigger `moss_seinen_style` es opcional y, según el autor, las prompts naturales con "anime character" funcionan mejor; usarlo de forma sistemática puede no dar los mejores resultados.
- El checkpoint de 1500 pasos se distribuye solo en formato Diffusers/PEFT; no hay variante ComfyUI para él, por lo que requiere conversión manual.
- La compatibilidad con ComfyUI exige una versión con soporte nativo de MOSS-Image (commit `b1a247c` o posterior); versiones anteriores pueden fallar al cargar las claves LoRA.
- La licencia Apache 2.0 permite uso comercial, pero el modelo base MOSS-Image-SFT debe verificarse por separado, ya que sus términos pueden imponer condiciones adicionales.
- No hay información sobre el dataset de entrenamiento, lo que dificulta evaluar posibles problemas de derechos de autor en las imágenes generadas.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no existe validación comunitaria independiente.
- La resolución recomendada es 1024 × 1024; otras relaciones de aspecto deben validarse para la escena concreta.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zkwr1081/Moss-image-anime-lora
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Conversión GGUF del LoRA: https://huggingface.co/axiomofmind/Moss-image-anime-lora-GGUF
- MOSS-Image-SFT en GGUF: https://huggingface.co/axiomofmind/MOSS-Image-SFT-GGUF
- Commit de ComfyUI con soporte MOSS-Image: https://github.com/Comfy-Org/ComfyUI/commit/b1a247c9cf9dbfda4b2c0a0c1d50950667eeaa0c
