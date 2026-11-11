# vedi0806/data266-lab2-team43-p2v2-lora-r16

## Resumen

`data266-lab2-team43-p2v2-lora-r16` es un adaptador LoRA de rango 16 para el modelo de difusion `stable-diffusion-v1-5/stable-diffusion-v1-5`, entrenado por el usuario vedi0806 en el marco de la asignatura DATA 266 Lab 2 (Parte 2). No es un modelo de lenguaje ni un modelo fundacional: es un ajuste fino ligero de las proyecciones de atencion del UNet de Stable Diffusion 1.5 para especializar la generacion texto-a-imagen en un unico estilo visual de criaturas cartoon sobre fondo blanco, derivado del dataset `reach-vb/pokemon-blip-captions`.

El adaptador anade 3.188.736 parametros entrenables sobre los modulos `to_k`, `to_q`, `to_v` y `to_out.0` del UNet, y se entreno durante 1500 pasos con batch 4 en una unica GPU Tesla T4 (9,53 GB de pico de memoria, 32,2 minutos, 0,536 GPU-horas). Su interes es fundamentalmente docente y metodologico: documenta de forma transparente un pipeline completo de fine-tuning con LoRA (curado de datos, min-SNR weighting, caption dropout, evaluacion con KID, CLIP score y LPIPS) y publica los numeros obtenidos, incluidos los negativos.

La relevancia practica es limitada: el propio autor reconoce que el modelo sobreajusta al estilo del dataset, que las metricas se calculan sobre solo 20 imagenes generadas (KID 0,0533 con desviacion 0,0065) y que la licencia es exclusivamente de investigacion y docencia no comercial, condicionada ademas por los derechos de autor sobre los personajes Pokemon. No debe emplearse en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rank 16, alpha 16) sobre UNet de Stable Diffusion 1.5 (difusion latente, transformer convolucional) |
| Parametros totales | 3.188.736 parametros entrenables en el adaptador (el modelo base SD 1.5 no se incluye en el repo) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; sin ventana de contexto textual mas alla del tokenizador CLIP de SD 1.5, 77 tokens) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en el formato de `diffusers`; no se documentan variantes GGUF, FP8 ni INT8) |
| Idiomas soportados | no disponible (las captions de entrenamiento son generadas por BLIP, presumiblemente en ingles; no se declara soporte multilingue) |
| Licencia | research-only (uso exclusivo de investigacion y docencia no comercial; dataset subyacente CC-BY-NC-SA-4.0) |
| Formato de pesos | pesos de `diffusers` (adaptador LoRA cargable con `pipe.load_lora_weights`); tamano del repo 0,0 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre el UNet de Stable Diffusion 1.5 mediante descomposicion de bajo rango en las proyecciones de atencion (`to_k`, `to_q`, `to_v`, `to_out.0`), con rango 16 y alpha 16. No se modifica el VAE ni el text encoder CLIP; el ajuste es exclusivamente del UNet. El entrenamiento empleo 1500 pasos con batch 4, optimizador AdamW con learning rate 0,0001 y decaimiento coseno, ponderacion min-SNR con gamma 5,0, dropout de caption del 10 %, autocast en fp16 y semilla 266.

Los datos provienen de `reach-vb/pokemon-blip-captions`: 822 imagenes tras eliminar 0 corruptas, 0 duplicados exactos y 11 casi duplicados, divididas en 740 de entrenamiento y 82 de test (90/10, semilla 266). Las imagenes se rellenaron a cuadrado y se redimensionaron a 512x512. Las captions son descripciones cortas generadas automaticamente por BLIP, lo que limita la granularidad de los atributos aprendidos. No se documenta el uso de RLHF, DPO ni preferencias humanas; la evaluacion humana a ciegas frente al modelo base figura como no realizada.

## Capacidades

- Generacion texto-a-imagen de criaturas cartoon con fondo blanco, en el estilo del dataset Pokemon BLIP captions.
- Especializacion de estilo sobre Stable Diffusion 1.5: el adaptador modula la salida del UNet base sin sustituirlo.
- Composicion de prompts en ingles (heredada del text encoder CLIP de SD 1.5).
- Carga y descarga sencilla mediante `diffusers` con `load_lora_weights`, compatible con pipelines de SD 1.5.
- No dispone de tool calling, function calling, razonamiento multi-paso, modo thinking, vision, audio ni capacidades de agente: es un modelo puramente generativo de imagen.
- No se declaran capacidades multilingues ni de edicion de imagen (inpainting, controlnet, etc.).

## Casos de uso

- Docencia de fine-tuning con LoRA: el adaptador sirve como ejemplo reproducible de un pipeline completo (curado de datos, min-SNR, caption dropout, evaluacion KID/CLIP/LPIPS) para cursos de difusion y generacion de imagen.
- Experimentos academicos de evaluacion de adaptadores: permite estudiar el sobreajuste de estilo con un dataset pequeno (822 imagenes) y comparar metricas como KID y CLIP score frente al modelo base.
- Generacion de ilustraciones de criaturas cartoon para prototipos internos no comerciales: util para maquetas de juegos o material didactico, siempre que se respete la licencia research-only.
- Estudio de deriva de dominio: el propio autor documenta que las salidas tienden a fondo blanco y criatura cartoon incluso con prompts no relacionados, lo que lo convierte en un caso de analisis de sesgo de estilo.
- Investigacion sobre captioning automatico: al usar captions BLIP genericas, permite medir el impacto de captions de baja calidad en la fidelidad de atributos, conteos y relaciones espaciales.
- Base para experimentos de composicion de LoRAs: al ser un adaptador de rango 16 sobre SD 1.5, puede combinarse con otros adaptadores en entornos de investigacion para estudiar interacciones entre estilos.

## Benchmarks y rendimiento

| Metrica | Resultado | Notas |
|---|---|---|
| KID (in-domain, generadas vs test) | 0,0533 (std 0,0065) | 20 imagenes generadas vs 82 de test; el autor lo califica de senal ruidosa |
| CLIP score (20 prompts fijos x 2 semillas) | 27,15 | — |
| CLIP score in-domain | 24,7 | — |
| CLIP score out-of-domain | 30,84 | — |
| CLIP score compositional | 28,35 | — |
| LPIPS entre dos semillas del mismo prompt | 0,77 | — |
| Comparacion humana a ciegas vs modelo base | no realizada | — |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible, ya que no es un modelo de lenguaje. Tampoco se aportan comparaciones con otros adaptadores LoRA de la misma categoria.

## Requisitos de hardware

- VRAM estimada para inferencia: el entrenamiento consumio 9,53 GB de pico en una Tesla T4; la inferencia con SD 1.5 + LoRA en fp16 requiere aproximadamente 4-6 GB de VRAM, aunque no se documenta una cifra oficial.
- GPU recomendadas: Tesla T4 (validada en entrenamiento), A100, H100, RTX 4090, RTX 3090; cualquier GPU con al menos 6-8 GB de VRAM para inferencia en fp16.
- Cabe en GPU de consumo: si, en tarjetas con 6 GB o mas (RTX 3060, RTX 4060, RTX 2070 en adelante), aunque no se aportan mediciones propias.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights` (unico metodo documentado); no se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros (adaptador) | Contexto / resolucion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-lab2-team43-p2v2-lora-r16 | 3,19 M (LoRA r16 sobre SD 1.5) | 512x512 | KID 0,0533; CLIP 27,15 | research-only | Hugging Face (0 descargas, 0 likes) |
| Stable Diffusion 1.5 (base) | 860 M (UNet) | 512x512 | CLIP 24,7 in-domain segun el autor | CreativeML OpenRAIL-M | Ampliamente disponible |
| Otros LoRA de Pokemon BLIP captions | no disponible | 512x512 | no disponible | variable | Hugging Face |

No se dispone de datos publicados de otros adaptadores comparables en la informacion proporcionada; la comparativa con el modelo base se limita a los valores de CLIP score reportados por el autor.

## Limitaciones y advertencias

- Sobreajuste de estilo: las salidas derivan a una criatura cartoon sobre fondo blanco incluso con prompts no relacionados, lo que degrada la fidelidad fuera de dominio.
- Captions genericas: los atributos finos, los conteos y las relaciones espaciales se ignoran con frecuencia.
- Dataset pequeno (822 imagenes de un unico estilo) y evaluacion ruidosa: KID calculado sobre solo 20 imagenes generadas.
- Sin comparacion humana a ciegas frente al modelo base, por lo que no hay evidencia de mejora perceptiva.
- Licencia research-only: prohibido el uso comercial; el dataset subyacente es CC-BY-NC-SA-4.0 y los personajes Pokemon estan sujetos a derechos de autor.
- Riesgo de reproduccion de personajes protegidos y de sesgos propios del dataset de origen.
- Sin soporte declarado de idiomas distintos del ingles en las captions.
- No apto para produccion: pensado para investigacion y docencia.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vedi0806/data266-lab2-team43-p2v2-lora-r16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
- Libreria diffusers: https://github.com/huggingface/diffusers
- Paper de LoRA: https://arxiv.org/abs/2106.09685
- Paper de min-SNR weighting: https://arxiv.org/abs/2303.09556
- Paper de Stable Diffusion (Latent Diffusion): https://arxiv.org/abs/2112.10752
