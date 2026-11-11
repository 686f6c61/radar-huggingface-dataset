# vedi0806/data266-lab2-team43-p2v2-exp2-lora-r16

## Resumen

`data266-lab2-team43-p2v2-exp2-lora-r16` es un adaptador LoRA (Low-Rank Adaptation) de rango 16 y alpha 16 entrenado sobre el modelo de difusion texto-a-imagen Stable Diffusion v1.5. Lo publica el usuario `vedi0806` como entregable del laboratorio DATA 266, Parte 2, y su unico proposito documentado es el ajuste fino estilistico sobre un corpus de imagenes de estilo Pokemon con leyendas generadas automaticamente por BLIP. No es un modelo base autonomo: requiere cargar Stable Diffusion v1.5 y aplicar los pesos LoRA encima.

El adaptador modifica exclusivamente las proyecciones de atencion del UNet (`to_k`, `to_q`, `to_v`, `to_out.0`), con 3.188.736 parametros entrenables. Se entreno durante 1500 pasos con batch 4 y AdamW a una tasa de aprendizaje de 1e-4 con decaimiento coseno, usando prediccion de ruido MSE estandar y autocast en fp16. El entrenamiento completo consumio 0,568 GPU-horas en una Tesla T4 con un pico de 4,29 GB de VRAM.

Es relevante ahora unicamente como referencia metodologica: demuestra un flujo completo de ajuste fino de difusion con presupuesto minimo de hardware (una GPU de consumo profesional de gama baja), pero sus propias metricas indican que no supera al modelo base en alineacion de prompt en ningun subconjunto evaluado. La licencia es research-only, limitando su uso a investigacion y docencia no comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre UNet de Stable Diffusion v1.5 (difusion latente, transformer convolutional) |
| Parametros totales | 3.188.736 parametros entrenables (adaptador); el modelo base SD v1.5 no se especifica en la informacion disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo texto-a-imagen; no aplica ventana de contexto de texto) |
| Tipos de cuantizacion | no disponible (entrenado en fp16; no se documentan cuantizaciones del adaptador) |
| Idiomas soportados | no disponible (las leyendas de entrenamiento son BLIP en ingles, pero no se declara soporte multilingue) |
| Licencia | research-only (licencia `other`; dataset base CC-BY-NC-SA-4.0) |
| Formato de pesos | safetensors via `diffusers` (`load_lora_weights`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado a las proyecciones de atencion del UNet de Stable Diffusion v1.5: `to_k`, `to_q`, `to_v` y `to_out.0`. El rango es 16 y el alpha 16, lo que da una escala de adaptacion unitaria. Solo se entrenan 3.188.736 parametros, manteniendo congelado el resto del modelo base. El pipeline es `text-to-image` con la libreria `diffusers`.

El entrenamiento uso el dataset `reach-vb/pokemon-blip-captions`: 822 imagenes tras eliminar 0 corruptas, 0 duplicados exactos y 11 duplicados cercanos, divididas en 740 de entrenamiento y 82 de test (90/10, semilla 266), redimensionadas a 512x512 con padding cuadrado. Las leyendas son descripciones cortas generadas automaticamente por BLIP. Se realizaron 1500 pasos con batch 4, optimizador AdamW con lr 0,0001 y decaimiento coseno, funcion de perdida MSE de prediccion de ruido, 0% de dropout de leyendas, autocast fp16 y semilla 266. El pico de memoria fue de 4,29 GB y el tiempo total de 34,1 minutos (0,568 GPU-horas) en una Tesla T4. No se documenta RLHF, DPO ni ningun otro ajuste por preferencias.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por prompt, heredada del modelo base SD v1.5 y modulada por el adaptador LoRA.
- Especializacion estilistica en un unico estilo artistico (imagenes tipo Pokemon, mayoritariamente una criatura por imagen).
- No soporta tool calling ni function calling (no es un modelo de lenguaje).
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues declaradas.
- No dispone de modo thinking, vision de entrada ni audio.
- La adherencia a colores, recuentos y relaciones espaciales es laxa por la naturaleza de las leyendas BLIP cortas.

## Casos de uso

- Investigacion academica sobre ajuste fino de difusion: sirve como referencia reproducible de un entrenamiento LoRA completo con presupuesto de una sola T4 y 0,568 GPU-horas, util para comparar hiperparametros en docencia.
- Docencia en cursos de generacion de imagenes: permite ilustrar el flujo `from_pretrained` + `load_lora_weights` de `diffusers` con un adaptador real y metricas publicadas.
- Experimentos de evaluacion de metricas generativas: el autor publica KID, CLIP y LPIPS, lo que permite reproducir y discutir la fiabilidad de estas metricas con muestras pequenas (20 imagenes generadas frente a 82 de test).
- Generacion de arte conceptual no comercial de estilo cartoon: util en talleres o prototipos internos donde se acepte el sesgo estilistico y la licencia research-only.
- Estudio de sesgos y seguridad en difusion: el modelo documenta que el safety checker de Stable Diffusion marco 1 de 40 imagenes inofensivas, un dato util para analisis de falsos positivos.
- Base para ablaciones de rango LoRA: al estar entrenado con r=16 y alpha=16, sirve como punto de partida para comparar con otros rangos en el mismo dataset y hardware.

## Benchmarks y rendimiento

| Metrica | Adaptador LoRA | Modelo base SD v1.5 | Notas |
|---|---|---|---|
| KID (in-domain, 20 gen vs 82 test) | 0,0464 (std 0,0072) | 0,0569 (20 imagenes) | Diferencia dentro del ruido; no establece mejora de estilo |
| CLIP score global (20 prompts x 2 semillas) | 27,93 | no disponible | — |
| CLIP in-domain | 26,22 | 28,35 | Peor que el base |
| CLIP out-of-domain | 30,92 | 31,9 | Peor que el base |
| CLIP compositional | 28,36 | 31,46 | Peor que el base |
| LPIPS entre las dos semillas de un prompt | 0,732 | no disponible | Mide variabilidad entre semillas |
| Comparacion humana ciega con el base | no evaluada | no evaluada | Pendiente |

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explicita; el entrenamiento consumio un pico de 4,29 GB en fp16, por lo que la inferencia del adaptador sobre SD v1.5 deberia caber en GPUs de consumo con 6-8 GB, aunque no se documenta.
- GPU recomendadas: Tesla T4 (usada para entrenar); cualquier GPU compatible con `diffusers` en fp16.
- Cabe en GPU de consumo: si, previsiblemente en tarjetas con 8 GB o mas, aunque no se aporta medicion de inferencia.
- Opciones de despliegue: `diffusers` con `StableDiffusionPipeline` y `load_lora_weights`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion en este caso).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-lab2-team43-p2v2-exp2-lora-r16 | 3,19 M entrenables (LoRA r16) | no aplica | CLIP 27,93; KID 0,0464 | research-only | Hugging Face, 0 descargas |
| Stable Diffusion v1.5 (base) | no disponible en la informacion | no aplica | CLIP superior en in-domain, out-of-domain y compositional | CreativeML Open RAIL-M (segun el modelo base, no confirmado en esta ficha) | Ampliamente disponible |
| Otros LoRA sobre SD v1.5 | no disponible | no aplica | no disponible | variable | no disponible |

No se dispone de datos de benchmarks de terceros comparables en la informacion proporcionada.

## Limitaciones y advertencias

- El KID del adaptador (0,0464) esta dentro del ruido del modelo base (0,0569), por lo que no demuestra una mejora estilistica medible.
- La alineacion de prompt empeora respecto al base en los tres subconjuntos evaluados: in-domain (26,22 vs 28,35), out-of-domain (30,92 vs 31,9) y compositional (28,36 vs 31,46).
- Las leyendas de entrenamiento son BLIP cortas, por lo que colores, recuentos y relaciones espaciales se siguen de forma laxa.
- El dataset contiene un unico estilo artistico y mayoritariamente una criatura por imagen, lo que limita la generalizacion.
- El safety checker de Stable Diffusion marco 1 de 40 imagenes inofensivas (0 retenidas), lo que indica riesgo de falsos positivos.
- La evaluacion con 20 imagenes generadas frente a 82 de test es ruidosa; la comparacion humana ciega con el base aun no se ha realizado.
- Licencia research-only: prohibido el uso comercial. El dataset base es CC-BY-NC-SA-4.0 y los personajes Pokemon estan sujetos a copyright.
- Riesgo de alucinacion visual y de reproduccion de estilos protegidos por derechos de autor.
- No se declaran idiomas soportados ni cuantizaciones del adaptador.

## Enlaces

- Hugging Face: https://huggingface.co/vedi0806/data266-lab2-team43-p2v2-exp2-lora-r16
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/reach-vb/pokemon-blip-captions
