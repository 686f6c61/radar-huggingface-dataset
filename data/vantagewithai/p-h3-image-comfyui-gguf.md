# vantagewithai/P-H3-Image-ComfyUI-GGUF

## Resumen

P-H3-Image-ComfyUI-GGUF es un repositorio de cuantizaciones GGUF para ComfyUI del modelo P-H3-Image, un modelo de difusion texto-a-imagen y edicion de imagenes desarrollado por PrunaAI sobre la arquitectura MiniMax-H3. Este repositorio concreto lo publica el usuario vantagewithai y empaqueta los pesos en formatos de una sola pieza (single-file) pensados para cargarse directamente en flujos de ComfyUI, con variantes bf16, int8 y 4-bit (w4a8).

El modelo resuelve dos tareas principales: generacion de imagenes de 8 megapixeles en 8 pasos sin CFG (classifier-free guidance) y edicion de imagenes con hasta 8 imagenes de entrada. Su relevancia practica esta en el peso: el conjunto mas pequeno ocupa unos 20 GB de descarga y alcanza un pico de 21 GB de VRAM a 8 MP, frente a los 143 GB de pesos del MiniMax-H3 original. Esto lo hace viable en GPUs de gama alta de consumo y profesionales con 24 GB o mas.

El modelo base tiene 20.150.289.312 parametros segun los safetensors del repositorio, y el repo completo ocupa 55,3 GB. Incluye un componente adicional de "prompt upsampling" basado en Qwen3.5-9B que transforma una peticion breve en un prompt detallado, ya que el modelo es sensible a la formulacion del prompt. La licencia es la MiniMax H3 Community License, con restricciones geograficas importantes que se detallan mas abajo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion basado en MiniMax-H3 (transformer FL2VA); componentes en bf16, int8 y 4-bit |
| Parametros totales | 20.150.289.312 (segun safetensors del repo) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | bf16, int8, 4-bit (w4a8) |
| Idiomas soportados | Ingles (en) |
| Licencia | MiniMax H3 Community License Agreement (los componentes Qwen3-VL-4B y el upsampler Qwen3.5-9B bajo Apache 2.0) |
| Formato de pesos | GGUF (single-file para ComfyUI), safetensors (LoRA bf16) |

## Arquitectura y entrenamiento

P-H3-Image se construye sobre MiniMax-H3, un modelo de difusion para generacion y edicion de imagenes. El repositorio distribuye los pesos en formato GGUF de una sola pieza para ComfyUI, con cada componente disponible en bf16, int8 nativo de ComfyUI y 4-bit (w4a8). El modelo base original de MiniMax-H3 pesa 143 GB, mientras que el conjunto cuantizado mas pequeno de P-H3-Image es de 20 GB.

El modelo incorpora un "prompt upsampler" basado en Qwen3.5-9B que se ejecuta antes del modelo principal: recibe una peticion breve y genera un prompt detallado mediante decodificacion greedy (de modo que una misma peticion produce siempre el mismo prompt). ComfyUI descarga el upsampler de la VRAM cuando P-H3-Image necesita memoria y cachea su salida, por lo que solo se reejecuta cuando cambia la peticion o las imagenes. Los datos concretos de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO) no estan disponibles en la informacion proporcionada.

La generacion texto-a-imagen funciona mejor a 8 MP y la edicion a 4 u 8 MP. El modelo renderiza en 8 pasos sin CFG. Para edicion, `image_1` es la imagen a editar y se pueden anadir hasta 7 imagenes de referencia adicionales, con un bloque `<Picture N>` por imagen en la entrada del upsampler. Existe tambien una LoRA de 2 GB (`p-h3-image_lora_bf16.safetensors`) que permite ejecutar P-H3-Image sobre el transformer FL2VA de MiniMax-H3 ya instalado en ComfyUI, sin una segunda descarga grande.

## Capacidades

- Generacion de texto a imagen a 8 megapixeles en 8 pasos sin CFG.
- Edicion de imagenes con hasta 8 imagenes de entrada (1 a editar mas 7 referencias).
- Composicion multi-imagen: combinacion de multiples retratos o referencias en una sola escena descrita con lenguaje natural.
- Prompt upsampling integrado mediante Qwen3.5-9B con modo "thinking" y decodificacion greedy.
- Soporte de LoRA para aplicar el modelo sobre el transformer FL2VA de MiniMax-H3.
- Cuantizaciones bf16, int8 y 4-bit para ajustar el uso de VRAM.
- Idioma: ingles unicamente segun los metadatos del modelo.

## Casos de uso

- Generacion de ilustraciones editoriales a alta resolucion: el modelo produce imagenes de 8 MP en 8 pasos, adecuadas para portadas, articulos o material de marketing donde se necesita detalle sin reescalado posterior.
- Edicion de producto con referencias multiples: se puede indicar la imagen base como `image_1` y hasta 7 referencias adicionales (por ejemplo, "el sombrero de la segunda foto") para componer variaciones de un catalogo manteniendo coherencia visual.
- Composicion de escenas grupales: el ejemplo de la model card (ocho retratos publicos combinados en una cena) muestra su utilidad para crear escenas con varios personajes a partir de referencias sueltas, util en prototipado de storyboards.
- Prototipado rapido en ComfyUI: al estar en formato GGUF single-file con variantes int8 y 4-bit, se integra en flujos de ComfyUI existentes y permite iterar con un consumo de VRAM de 21 GB en el conjunto mas pequeno.
- Reutilizacion sobre MiniMax-H3 instalado: con la LoRA de 2 GB se puede aplicar P-H3-Image sobre el transformer FL2VA ya descargado, evitando duplicar el almacenamiento en entornos que ya usan MiniMax-H3.
- Generacion de material para redes y web con prompts largos: el upsampler convierte peticiones de una linea en prompts detallados, lo que resulta util para equipos que no dominan el "prompt engineering" y necesitan resultados reproducibles (decodificacion greedy).
- Edicion de imagenes de referencia a 4 MP: para retoques o variaciones sobre fotografias existentes con instrucciones en lenguaje natural, manteniendo las referencias escaladas a 1 MP para el upsampler.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card unicamente aporta datos de rendimiento operativo del prompt upsampler en una GPU L40S:

| Archivo del upsampler | Tamano | Pico de VRAM | Tiempo por prompt (L40S) |
|---|---:|---:|---:|
| `p-h3-image_prompt_upsampler_bf16` (recomendado) | 19,3 GB | ~21 GB | ~7 s |
| `p-h3-image_prompt_upsampler_int8_convrot` | 9,7 GB | ~12 GB | ~13 s |
| `p-h3-image_prompt_upsampler_w4a8` | 6,7 GB | ~9 GB | ~11 s |

## Requisitos de hardware

- VRAM estimada para inferencia: el conjunto mas pequeno de P-H3-Image ocupa 20 GB de descarga y alcanza un pico de 21 GB de VRAM a 8 MP. El upsampler bf16 anade hasta ~21 GB, aunque ComfyUI lo descarga de VRAM cuando el modelo principal necesita memoria.
- GPU recomendadas: L40S (usada en las mediciones de la model card), asi como GPUs profesionales y de gama alta con 24 GB o mas de VRAM (A100, H100, RTX 4090).
- Cabe en GPU de consumo: si, en tarjetas con 24 GB de VRAM o mas (por ejemplo, RTX 4090) usando las variantes int8 o 4-bit. Con 16 GB no hay datos que confirmen viabilidad.
- Opciones de despliegue: ComfyUI (formato nativo single-file GGUF), con nodos propios para Load CLIP (tipo `minimax`), Generate Text, Format Text, Batch Images y p-h3-image Conditioning.
- Latencia y throughput: no disponibles para el modelo principal. Solo se documenta el tiempo del upsampler (7 s en bf16, 13 s en int8, 11 s en w4a8 por prompt en L40S).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Formatos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| P-H3-Image-ComfyUI-GGUF | 20.150.289.312 | 8 MP en 8 pasos sin CFG; edicion con hasta 8 imagenes | GGUF, safetensors (LoRA) | MiniMax H3 Community License (restricciones geograficas) | Hugging Face |
| MiniMax-H3 (original) | No disponible | No disponible | No disponible | MiniMax H3 Community License | Hugging Face (MiniMaxAI/MiniMax-H3; Comfy-Org/MiniMax-H3) |
| PrunaAI/P-H3-Image-Comfy | No disponible | 8 MP; edicion con hasta 8 imagenes | bf16, int8, 4-bit | MiniMax H3 Community License | Hugging Face |

No se dispone de datos de benchmarks ni de otros modelos comparables de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- Sensibilidad al prompt: el modelo rinde mucho mejor con prompts completos y especificos. Se recomienda mantener el prompt upsampler en el grafo; las palabras grandilocuentes y los prompts muy largos empeoran los resultados, y los prompts muy cortos dan resultados debiles sin el upsampler.
- Manos y personas pequenas en el fondo pueden salir distorsionadas; renderizar a 8 MP ayuda.
- El texto no es totalmente fiable: el texto pequeno o denso se convierte en pseudo-texto y los pasajes largos a veces fallan en letras sueltas. Las cadenas cortas entrecomilladas se renderizan bien.
- Las versiones cuantizadas no son identicas a bf16: int8 se mantiene muy cerca, w4a8 cambia mas los detalles.
- Licencia: la MiniMax H3 Community License excluye la Union Europea, el Reino Unido, la Republica de Corea y los Estados Unidos salvo que se disponga de una licencia separada de MiniMax. Ademas, los productos construidos sobre el modelo deben mostrar "Powered by MiniMax H3".
- Los componentes Qwen3-VL-4B del codificador de texto y el upsampler basado en Qwen3.5-9B estan bajo Apache 2.0; el resto de pesos bajo la licencia comunitaria de MiniMax.
- Idioma: solo ingles segun los metadatos; no hay soporte multilingue declarado.
- Riesgo de sesgos y alucinacion visual: no se documentan evaluaciones especificas en la informacion disponible.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/vantagewithai/P-H3-Image-ComfyUI-GGUF
- Modelo base (PrunaAI): https://huggingface.co/PrunaAI/p-h3-image
- Repositorio ComfyUI original de PrunaAI: https://huggingface.co/PrunaAI/P-H3-Image-Comfy
- MiniMax-H3 (modelo base): https://huggingface.co/MiniMaxAI/MiniMax-H3
- Comfy-Org/MiniMax-H3 (archivos FL2VA): https://huggingface.co/Comfy-Org/MiniMax-H3
- Canal de YouTube del autor: https://www.youtube.com/@vantagewithai
