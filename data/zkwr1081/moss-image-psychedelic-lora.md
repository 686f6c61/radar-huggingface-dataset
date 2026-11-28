# zkwr1081/Moss-image-psychedelic-lora

## Resumen

Moss-image-psychedelic-lora es un adaptador LoRA de estilo para generación de imágenes texto-a-imagen, desarrollado por el usuario zkwr1081 y publicado bajo licencia Apache 2.0. Se trata de un fine-tuning ligero sobre el modelo base OpenMOSS-Team/MOSS-Image-SFT (y compatible también con MOSS-Image-Base), orientado a producir ilustraciones de estética psicodélica-pop: colores neón saturados, sujetos surrealistas, formas gráficas rotundas, patrones rítmicos y fondos oscuros de alto contraste. El adaptador se activa mediante la frase disparadora `moss_psychpop_style`, que debe encabezar el prompt.

El repositorio incluye tres artefactos diferenciados: el adaptador LoRA original en formato Diffusers/PEFT (`pytorch_lora_weights.safetensors`), una versión reindexada para ComfyUI nativo (`MOSS-Image-Psychedelic-LoRA-ComfyUI.safetensors`, 504 tensores, 70,93 MiB) y un modelo completo ya fusionado a escala 1.0 dentro de `merged-model/`, de aproximadamente 25,4 GiB. Esta variedad de formatos facilita su uso tanto en pipelines Diffusers como en flujos ComfyUI y en `stable-diffusion.cpp` mediante una conversión GGUF externa.

Es relevante ahora porque MOSS-Image es una familia reciente de modelos de difusión de código abierto, y este LoRA demuestra el ecosistema incipiente de adaptadores comunitarios que ya se está formando a su alrededor, incluyendo herramientas de conversión de claves, scripts de fusión y soporte nativo en ComfyUI a partir del commit `b1a247c`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre modelo de difusion MOSS-Image; no se detalla la arquitectura interna del modelo base en la informacion disponible |
| Parametros totales | No disponible (el adaptador contiene 504 tensores LoRA; el modelo fusionado ocupa ~25,4 GiB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo texto-a-imagen) |
| Tipos de cuantizacion | GGUF disponible en repositorio externo (axiomofmind/Moss-image-psychedelic-lora-GGUF); pesos originales en safetensors |
| Idiomas soportados | No disponible (prompts en ingles en los ejemplos de la model card) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (Diffusers/PEFT y ComfyUI), directorio Diffusers fusionado, GGUF externo |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, es decir, un conjunto de matrices de bajo rango inyectadas en las capas del transformer del modelo base MOSS-Image-SFT. El adaptador consta de 504 tensores y pesa aproximadamente 70,93 MiB en su variante ComfyUI. La relación con el modelo base es de tipo `adapter`, según los metadatos de Hugging Face. No se especifica en la informacion disponible el rango del LoRA, el número de pasos de entrenamiento, el tamaño del dataset de imágenes de estilo ni si se aplicaron técnicas como regularización o balanceo de clases.

La model card indica que el adaptador se entrenó para reforzar una estética concreta: color neón saturado, sujetos surrealistas, formas gráficas audaces, detalles luminosos, patrones rítmicos y fondos oscuros o de alto contraste. Se prefiere el modelo base MOSS-Image-SFT para inferencia frente a MOSS-Image-Base. El repositorio incluye además un script (`scripts/convert_moss_lora_for_comfyui.py`) que documenta la reindexación de claves de `transformer.layers...` a `diffusion_model.layers...`, y otro (`scripts/merge_moss_lora.py`) que permite fusionar el adaptador con el modelo base a una escala arbitraria, por ejemplo 1.2.

## Capacidades

- Generación de imágenes texto-a-imagen con estética psicodélica-pop controlada mediante la frase disparadora `moss_psychpop_style`.
- Estilización de escenas surrealistas: criaturas, deidades, paisajes cósmicos, vehículos retro, astronautas y composiciones abstractas.
- Control de intensidad del estilo mediante la escala LoRA en el flujo Diffusers (el modelo fusionado queda fijado a 1.0).
- Compatibilidad con Diffusers, ComfyUI nativo (a partir del commit `b1a247c`) y `stable-diffusion.cpp` mediante GGUF.
- Fusión configurable con el modelo base a distintas escalas mediante script incluido.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión de entrada, audio ni modo thinking, por tratarse de un modelo de generación de imágenes.

## Casos de uso

- Ilustración editorial y de carteles: el LoRA produce composiciones de alto contraste y color neón adecuadas para portadas de revistas, pósters de conciertos o arte promocional, usando la frase disparadora al inicio del prompt.
- Diseño de merchandise y ropa: los ejemplos de la model card incluyen una mujer con gafas de sol rosas y mono azul con estampados, un patrón que se puede trasladar a camisetas, tazas o fundas mediante iteración de prompts.
- Arte conceptual para videojuegos y animación: generación rápida de bocetos de criaturas (dragones, corderos cósmicos, setas luminosas) y entornos alienígenas que sirvan de referencia visual al equipo de arte.
- Contenido para redes sociales y branding psicodélico: creación de imágenes llamativas para campañas de marcas vinculadas a música electrónica, festivales o cultura psicodélica, aprovechando la saturación cromática característica.
- Exploración creativa en ComfyUI: usuarios que ya trabajan con flujos nodales pueden cargar el archivo reindexado con fuerza de modelo 1.0 y fuerza de CLIP 0.0 para integrar el estilo en pipelines más complejos con controlnet u otros adaptadores.
- Prototipado rápido en entornos con recursos limitados: la variante GGUF para `stable-diffusion.cpp` permite ejecutar el modelo en hardware modesto sin necesidad de GPU de gama alta, útil para pruebas de concepto.
- Investigación sobre adaptadores de estilo: el repositorio sirve como ejemplo reproducible de conversión de claves entre Diffusers y ComfyUI, con scripts documentados que facilitan estudiar el proceso de reindexación y fusión.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador LoRA en sí es muy ligero (~70,93 MiB), pero requiere cargar el modelo base MOSS-Image-SFT completo para inferencia.
- El modelo fusionado ocupa aproximadamente 25,4 GiB en precisión completa, lo que exige una GPU con al menos 24-32 GB de VRAM para inferencia cómoda en FP16, o bien cuantización GGUF para reducir requisitos.
- GPU recomendadas: no se especifican en la informacion disponible; por el tamaño del modelo fusionado, se situaría en el rango de A100 40 GB, H100 o RTX 4090 24 GB (esta última con posibles limitaciones según resolución y batch).
- La variante GGUF permite despliegue en `stable-diffusion.cpp`, lo que amplía la compatibilidad a GPUs consumer con menos VRAM, aunque no se detallan los requisitos mínimos exactos.
- Opciones de despliegue: Diffusers (flujo principal), ComfyUI nativo (commit `b1a247c` o superior) y `stable-diffusion.cpp` mediante GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Moss-image-psychedelic-lora | LoRA sobre MOSS-Image-SFT | No disponible (504 tensores) | No aplica | Apache 2.0 | Hugging Face, GGUF externo |
| MOSS-Image-SFT (base) | Modelo de difusion texto-a-imagen | No disponible | No aplica | No disponible en la informacion proporcionada | Hugging Face (OpenMOSS-Team) |
| MOSS-Image-Base (base) | Modelo de difusion texto-a-imagen | No disponible | No aplica | No disponible en la informacion proporcionada | Hugging Face (OpenMOSS-Team) |

No se dispone de datos de benchmarks ni de otros LoRA comparables en la informacion proporcionada para establecer una comparación cuantitativa.

## Limitaciones y advertencias

- El adaptador está entrenado para un estilo muy específico; fuera de la estética psicodélica-pop puede degradar la coherencia de la imagen o ignorar el prompt.
- La frase disparadora `moss_psychpop_style` es obligatoria, incluso en el modelo fusionado; omitirla puede impedir que se active el estilo.
- El archivo raíz `pytorch_lora_weights.safetensors` usa claves Diffusers/PEFT y no es directamente compatible con el cargador nativo de ComfyUI; es necesario usar el archivo reindexado para evitar advertencias de `lora key not loaded`.
- El adaptador GGUF es para `stable-diffusion.cpp`, no para el cargador LoRA nativo de ComfyUI; confundir ambos formatos provoca fallos de carga.
- El modelo fusionado tiene fuerza fija de 1.0 y no permite ajuste en tiempo de ejecución; para escalas distintas hay que usar el LoRA o el script de fusión.
- No se documentan sesgos específicos, pero al ser un modelo de difusión entrenado sobre datos no especificados, puede heredar sesgos de representación del dataset base.
- Riesgo de alucinación visual: como todo modelo generativo de imágenes, puede producir anatomías incorrectas, texto ilegible o composiciones incoherentes, especialmente con prompts complejos.
- La licencia Apache 2.0 permite uso comercial, pero se recomienda verificar la licencia del modelo base MOSS-Image-SFT, que no se detalla en la informacion disponible.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, por lo que no hay evidencia comunitaria de robustez en producción.

## Enlaces

- Hugging Face del LoRA: https://huggingface.co/zkwr1081/Moss-image-psychedelic-lora
- Modelo base MOSS-Image-SFT: https://huggingface.co/OpenMOSS-Team/MOSS-Image-SFT
- Modelo base MOSS-Image-Base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- Conversion GGUF del LoRA: https://huggingface.co/axiomofmind/Moss-image-psychedelic-lora-GGUF
- Modelo base en GGUF: https://huggingface.co/axiomofmind/Moss-Image-SFT-GGUF
