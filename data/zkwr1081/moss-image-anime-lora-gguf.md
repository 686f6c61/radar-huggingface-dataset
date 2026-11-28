# zkwr1081/Moss-image-anime-lora-GGUF

## Resumen

MOSS-Image Anime LoRA GGUF es un adaptador LoRA para generación de imágenes de texto a imagen, convertido a formato GGUF (F16) por el usuario zkwr1081. Se trata de una conversión independiente del LoRA de estilo anime seinen de alta energía publicado originalmente por axiomofmind en `axiomofmind/Moss-image-anime-lora`. El adaptador está diseñado para aplicarse en tiempo de inferencia sobre el modelo base `axiomofmind/Moss-Image-SFT-GGUF`, sin necesidad de fusionar los pesos, lo que permite ajustar la intensidad del adaptador sin regenerar el modelo base para cada cuantización o escala.

El adaptador no contiene el transformer de difusión base, ni el codificador de texto Qwen3.5, ni el tokenizador, ni el VAE; es exclusivamente el conjunto de pesos LoRA (504 tensores F16, 37.158.912 parámetros, 70,9 MiB por fichero). El repositorio incluye dos conversiones: el adaptador canónico entrenado a 2.000 pasos y una variante alternativa a 1.500 pasos. Ambos usan rango 16 y alpha 16.

La relevancia de esta ficha es acotada: se publica bajo licencia Apache 2.0, con 0 descargas y 0 likes en el momento de la consulta, y su utilidad práctica depende de disponer del modelo base MOSS-Image-SFT en GGUF y de una compilación de stable-diffusion.cpp con soporte para MOSS. El estilo que aporta se orienta a acción dramática, iluminación cinematográfica, personajes adultos expresivos, siluetas marcadas y composiciones energéticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre transformer de difusión MOSS-Image; rank 16, alpha 16 |
| Parametros totales | 37.158.912 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (no aplica a un LoRA de difusión; la ventana la determina el codificador de texto Qwen3.5 del modelo base) |
| Tipos de cuantizacion | F16 (GGUF) |
| Idiomas soportados | no disponible (el prompt se procesa con el codificador de texto Qwen3.5 del modelo base) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (F16); origen en `pytorch_lora_weights.safetensors` |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 16 aplicado sobre el transformer de difusión MOSS-Image. Consta de 504 tensores F16 que se aplican en tiempo de ejecución (`--lora-apply-mode at_runtime`) sobre el modelo base cuantizado, sin crear un modelo fusionado. El adaptador fuente se entrenó contra MOSS-Image-Base durante 2.000 pasos; sus objetivos en el transformer son compatibles con MOSS-Image-SFT, que produjo los resultados de evaluación preferidos por el autor. Existe además una variante alternativa entrenada a 1.500 pasos.

La conversión a GGUF se realizó de forma independiente desde `pytorch_lora_weights.safetensors` con stable-diffusion.cpp en el commit `b13a482`, usando el comando `sd-cli.exe -M convert` con `--type f16`, `--convert-name` y `-t 16`. La frase de activación registrada en el entrenamiento es `moss_seinen_style`, aunque las configuraciones preferidas la omiten y emplean lenguaje natural que contenga `anime character` o `anime characters`. No se dispone de información sobre la composición del dataset de entrenamiento ni sobre el uso de RLHF o DPO.

## Capacidades

- Aplicación de un estilo anime seinen de alta energía sobre el modelo base MOSS-Image-SFT: acción dramática, iluminación cinematográfica, siluetas fuertes y entornos densos.
- Generación de imágenes de texto a imagen a 1024×1024 con el pipeline de stable-diffusion.cpp (Euler/discrete, CFG 3, 50 pasos, flow shift 5).
- Ajuste de la intensidad del adaptador en tiempo de inferencia mediante la etiqueta `<lora:...:escala>`, sin re-fusionar pesos.
- Dos puntos de control seleccionables: step-2000 canónico (escala recomendada 1.0; configuración secundaria con el trigger a 0.7) y step-1500 alternativo (escalas 0.7 y 1.0).
- Compatibilidad verificada con el transformer base cuantizado Q8_0; el autor indica que Q4_K_S usa la misma arquitectura MOSS y los mismos objetivos LoRA.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso, visión ni audio: es un adaptador de generación de imágenes.

## Casos de uso

- Ilustración de escenas de acción para cómics o webtoons: el adaptador aporta composiciones energéticas y siluetas marcadas, adecuadas para viñetas de persecuciones o combates en entornos densos.
- Concept art de personajes adultos para videojuegos: permite generar variaciones de un personaje en poses dinámicas con iluminación cinematográfica, manteniendo el mismo modelo base y ajustando la escala del LoRA.
- Creación de keyframes para animación: sirve como generador de fotogramas de referencia con fuerte sentido del movimiento, que luego se retocan en un pipeline de animación.
- Ambientación de fondos para producción audiovisual: los entornos densos y la iluminación dramática permiten generar plates de fondo para escenas de ciencia ficción o fantasía.
- Exploración de estilo en un flujo de trabajo con stable-diffusion.cpp: al aplicarse en tiempo de ejecución, permite comparar rápidamente el resultado con y sin el adaptador sobre la misma semilla y prompt.
- Prototipado de portadas o ilustraciones promocionales de temática anime: con el prompt natural recomendado y sin trigger, se obtienen resultados coherentes con el estilo seinen buscado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor únicamente documenta una validación controlada de correctitud con `MOSS-Image-SFT-Q8_0.gguf`, misma semilla (101), 1024×1024, 50 pasos, CFG 3, Euler/discrete y flow shift 5, en una NVIDIA RTX PRO 6000 Blackwell Max-Q:

| Ejecucion | Muestreo | Extremo a extremo |
|---|---:|---:|
| SFT Q8_0 sin LoRA | 41,40 s | 46,26 s |
| SFT Q8_0 + LoRA F16 GGUF | 55,41 s | 60,36 s |

El autor advierte que estos tiempos son comprobaciones de correctitud y no benchmarks generales de rendimiento. En ambas ejecuciones se aplicaron los 504/504 tensores LoRA; la variante step-1500 a escala 0.7 se sometió a una comprobación separada de carga en tiempo de ejecución que también reportó 504/504 tensores aplicados (verificación de compatibilidad, no de calidad de imagen).

## Requisitos de hardware

- El adaptador en sí ocupa 70,9 MiB por fichero GGUF F16; el requisito real de VRAM lo determina el modelo base MOSS-Image-SFT, el codificador de texto Qwen3.5-9B y el VAE.
- El autor validó el pipeline con el transformer base en Q8_0 sobre una NVIDIA RTX PRO 6000 Blackwell Max-Q; no se especifica la VRAM total empleada.
- No se dispone de datos de VRAM para el modelo base en la información proporcionada; no disponible.
- Despliegue mediante stable-diffusion.cpp con soporte MOSS (compilación con `sd-cli`), aplicando el LoRA con `--lora-model-dir` y `--lora-apply-mode at_runtime`.
- Se requieren además el codificador de texto Qwen3.5-9B, el `tokenizer.json` oficial de MOSS y el VAE oficial MOSS / FLUX.2.
- Latencia documentada: 55,41 s de muestreo y 60,36 s extremo a extremo para una imagen de 1024×1024 con 50 pasos en la GPU citada; no se proporcionan datos de throughput.

## Comparativa con modelos similares

No se dispone de información sobre adaptadores LoRA GGUF comparables para MOSS-Image en la documentación consultada. Como referencia del ecosistema, se compara con el adaptador fuente y con el modelo base:

| Modelo | Tipo | Parametros | Formato | Licencia | Disponibilidad |
|---|---|---:|---|---|---|
| zkwr1081/Moss-image-anime-lora-GGUF | LoRA GGUF F16 | 37.158.912 | GGUF | apache-2.0 | Hugging Face |
| axiomofmind/Moss-image-anime-lora | LoRA fuente (safetensors) | no disponible | safetensors | no disponible | Hugging Face |
| axiomofmind/Moss-Image-SFT-GGUF | Transformer de difusion base | no disponible | GGUF | no disponible | Hugging Face |

## Limitaciones y advertencias

- El adaptador no es autónomo: sin el transformer base MOSS-Image-SFT-GGUF, el codificador Qwen3.5-9B, el tokenizador y el VAE no genera imágenes.
- Puede producir anatomía, manos, caras, texto y objetos mecánicos malformados, según advierte el propio autor.
- Uso previsto restringido a generación creativa lícita con personajes adultos ficticios de anime y entornos relacionados; no debe emplearse para contenido ilícito.
- La frase de activación `moss_seinen_style` existe, pero las configuraciones preferidas la omiten; usarla puede alterar el resultado respecto a la validación documentada.
- Solo se validó la ruta de aplicación en tiempo de ejecución con Q8_0; Q4_K_S se asume compatible por arquitectura y objetivos LoRA, pero no se documenta una validación de calidad.
- No hay información sobre sesgos, riesgo de alucinación visual ni comportamiento multilingüe del prompt; el idioma lo determina el codificador de texto del modelo base.
- Licencia Apache 2.0 declarada en el repositorio; conviene verificar las condiciones del modelo base y del adaptador fuente antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: sin validación comunitaria independiente.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zkwr1081/Moss-image-anime-lora-GGUF
- Adaptador fuente: https://huggingface.co/axiomofmind/Moss-image-anime-lora
- Modelo base GGUF: https://huggingface.co/axiomofmind/Moss-Image-SFT-GGUF
- stable-diffusion.cpp: https://github.com/leejet/stable-diffusion.cpp
