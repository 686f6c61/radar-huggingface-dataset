# wchai/gpic-ladder

## Resumen

GPIC final ladder es una familia de siete modelos de difusion texto-a-imagen en espacio de pixeles, entrenados por el autor independiente wchai sobre el conjunto de datos GPIC Full a resolucion de 256 x 256. No se trata de un unico modelo, sino de una escalera (ladder) de siete variantes que cubren presupuestos de computo desde 3,6e18 hasta 2,3e20 FLOPs, cada una con el tamano que obtuvo la menor perdida en validacion dentro de su presupuesto. El objetivo declarado es servir como material empirico para el estudio de leyes de escala en generacion de imagenes, documentado en el articulo "How to Scale Text-to-image Models: a Handbook".

La arquitectura es un diffusion transformer en espacio de pixeles (JiT para texto-a-imagen) con parches de 16 x 16, lo que produce 256 tokens por imagen. Las caracteristicas de texto provienen de Qwen3-1.7B (2048 dimensiones, hasta 320 tokens) y se inyectan mediante capas de texto dedicadas a las que atienden las capas de imagen. La familia abarca desde 171M hasta 1681M parametros, con anchos de 768 a 1792 y un numero creciente de capas.

Su relevancia es fundamentalmente metodologica y de investigacion: todos los pesos se publican en fp32 sin EMA, junto con las recetas de entrenamiento y las puntuaciones, lo que permite reproducir y analizar el escalado de forma controlada. No es un modelo orientado a produccion ni a calidad fotografica de ultima generacion, sino una herramienta para estudiar como escala el rendimiento con el computo en difusion pixel-space.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Diffusion transformer en espacio de pixeles (JiT para texto-a-imagen), parches 16 x 16 |
| Parametros totales | 171M (d10) a 1681M (d18); siete variantes |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 256 tokens de imagen por muestra; hasta 320 tokens de texto (Qwen3-1.7B, 2048-d) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32) |
| Idiomas soportados | no disponible (caption features via Qwen3-1.7B) |
| Licencia | MIT |
| Formato de pesos | safetensors (fp32) + config.yaml |

Desglose de la escalera:

| Modelo | Ancho | Capas imagen + texto | Parametros | Matrices imagen N | FLOPs de entrenamiento | Pasos | Perdida held-out | FD-DINOv2 |
|---|---|---|---|---|---|---|---|---|
| d10 | 768 | 10 + 2 | 171M | 106M | 3,6e18 | 21.248 | 0,06788 | 949,8 |
| d11 | 896 | 11 + 2 | 252M | 159M | 7,1e18 | 28.800 | 0,06707 | 828,5 |
| d12 | 1024 | 12 + 3 | 377M | 226M | 1,4e19 | 40.192 | 0,06628 | 673,3 |
| d13 | 1152 | 13 + 3 | 508M | 311M | 2,9e19 | 59.136 | 0,06558 | 534,8 |
| d14 | 1280 | 14 + 3 | 666M | 413M | 5,7e19 | 89.600 | 0,06487 | 443,5 |
| d16 | 1536 | 16 + 4 | 1122M | 679M | 1,1e20 | 108.800 | 0,06416 | 373,5 |
| d18 | 1792 | 18 + 4 | 1681M | 1040M | 2,3e20 | 143.872 | 0,06351 | 325,3 |

## Arquitectura y entrenamiento

Cada modelo es un diffusion transformer que opera directamente sobre pixeles, sin VAE ni espacio latente comprimido. La imagen se tokeniza en parches de 16 x 16, generando 256 tokens por imagen a 256 x 256. Las caracteristicas de los captions se extraen con Qwen3-1.7B (vector de 2048 dimensiones, hasta 320 tokens), pasan por capas de texto dedicadas y las capas de imagen las atienden mediante atencion cruzada. La red predice la imagen limpia sobre la trayectoria lineal x_t = t x + (1 - t) e, formulacion de flow matching.

El entrenamiento usa Muon para las matrices y AdamW para el resto de parametros, con un tamano de lote de 1024, un cooldown lineal durante el 50 % final de los pasos y 8 GPU H100 por ejecucion. El conjunto de datos es GPIC Full (Stanford Vision Lab). La metrica de escalado se define como N = 18 x capas de imagen x ancho^2 y C = 6ND, con D el numero de tokens de imagen vistos (256 por imagen). No se aplica EMA: los pesos publicados son los del ultimo paso. El modelo se entrena sin caption dropout, por lo que la evaluacion se hace sin classifier-free guidance.

## Capacidades

- Generacion de imagenes texto-a-imagen a 256 x 256 pixeles a partir de captions.
- Modelado generativo en espacio de pixeles puro, sin VAE intermedio.
- Familia escalable de siete tamanos que permite estudiar el efecto del computo y los parametros en la calidad.
- Evaluacion reproducible mediante perdida de flow matching en datos held-out y FD-DINOv2.
- Integracion de un encoder de texto externo (Qwen3-1.7B) para condicionamiento por caption.
- No soporta tool calling, agentes, vision de entrada ni modos de razonamiento explicitos.
- Capacidades multilingues: no documentadas; dependen del encoder Qwen3-1.7B y no se han validado.

## Casos de uso

- Investigacion sobre leyes de escala: comparar las siete variantes bajo la misma receta para ajustar curvas de perdida y FD-DINOv2 frente a FLOPs, parametros y tokens vistos.
- Reproduccion de experimentos: los pesos fp32, el config.yaml y el repositorio nano-gpic permiten reentrenar o re-evaluar cada punto de la escalera con recetas identicas.
- Estudio de difusion en espacio de pixeles: analizar el comportamiento de un transformer pixel-space sin VAE en tareas de sintesis condicionada por texto.
- Docencia y formacion: modelos de 171M a 1681M parametros con codigo abierto para explicar flow matching, atencion cruzada texto-imagen y Muon frente a AdamW.
- Generacion de imagenes de baja resolucion para prototipado o datasets sinteticos de 256 x 256 en entornos de investigacion.
- Benchmarking de pipelines de inferencia: medir latencia y throughput de muestreadores Euler a 50 pasos sobre distintos tamanos de modelo.
- Analisis de metrica FD-DINOv2: usar la escalera como caso de estudio de como se comporta esta metrica al crecer el modelo.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son la perdida held-out de flow matching y FD-DINOv2 sobre los 50.000 captions de test oficiales, con muestreador Euler a 50 llamadas y sin classifier-free guidance.

| Modelo | Perdida held-out | FD-DINOv2 (menor es mejor) |
|---|---|---|
| d10 | 0,06788 | 949,8 |
| d11 | 0,06707 | 828,5 |
| d12 | 0,06628 | 673,3 |
| d13 | 0,06558 | 534,8 |
| d14 | 0,06487 | 443,5 |
| d16 | 0,06416 | 373,5 |
| d18 | 0,06351 | 325,3 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks estandar de generacion de imagenes (FID, CLIP score) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos se publican en fp32, por lo que d18 (1681M) ocupa aproximadamente 6,7 GB solo en pesos; d10 (171M) unos 0,7 GB. La memoria real depende del grafo de inferencia y del muestreador.
- GPU recomendadas: cualquier GPU con al menos 8-16 GB para las variantes pequenas; las variantes d16 y d18 requieren mas margen. El entrenamiento se realizo en 8 x H100.
- Cabe en GPU de consumo: si, las variantes d10 a d13 en tarjetas de 8-16 GB (RTX 3060, RTX 4070, RTX 4090); d16 y d18 en RTX 4090 de 24 GB con margen.
- Opciones de despliegue: el codigo de referencia es PyTorch puro (safetensors + config.yaml); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, que no estan orientados a difusion pixel-space.
- Latencia y throughput: no disponibles en la informacion proporcionada; la evaluacion usa Euler a 50 pasos, lo que implica 50 llamadas al modelo por imagen.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / resolucion | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| GPIC ladder (d18) | 1681M | 256 x 256, 256 tokens imagen | Difusion pixel-space, flow matching | MIT | Pesos fp32 en HF |
| GPIC ladder (d10) | 171M | 256 x 256, 256 tokens imagen | Difusion pixel-space, flow matching | MIT | Pesos fp32 en HF |
| PixelGen / JiT (baseline) | no disponible | 256 x 256 | Difusion pixel-space | MIT | Codigo en nano-gpic |
| Modelos texto-a-imagen latentes de gran escala | no disponible | resoluciones mayores | Difusion en espacio latente con VAE | variable | variable |

La comparativa con modelos de produccion no es directa: la escalera GPIC esta disenada para investigacion de escalado a 256 x 256 y no compite en calidad fotografica con sistemas latentes de mayor resolucion. No se dispone de datos comparativos de rendimiento frente a alternativas en la informacion proporcionada.

## Limitaciones y advertencias

- Resolucion fija de 256 x 256; no esta pensado para imagenes de alta resolucion.
- Entrenado sin classifier-free guidance y sin caption dropout, lo que limita las estrategias habituales de mejora de calidad en inferencia.
- Pesos en fp32 sin EMA: mayor huella de memoria y posiblemente mayor varianza que recetas con media movil.
- Calidad limitada por el presupuesto de computo y el tamano del modelo; las variantes pequenas muestran FD-DINOv2 elevado (949,8 en d10).
- Riesgo de sesgos y alucinaciones visuales heredado de GPIC Full; no se documentan analisis de sesgo.
- Idiomas soportados no documentados; el condicionamiento depende de Qwen3-1.7B y no se ha validado multilingue.
- Sin soporte documentado de tool calling, agentes ni entradas multimodales.
- Uso comercial permitido por licencia MIT, pero el dataset GPIC Full tiene sus propios terminos que deben respetarse.
- No apto como sustituto de modelos de produccion para aplicaciones finales de generacion de imagenes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wchai/gpic-ladder
- Articulo "How to Scale Text-to-image Models: a Handbook": https://wenhaochai.com/blogs/scaling-generative-models-101.html
- Codigo de entrenamiento y evaluacion (nano-gpic): https://github.com/wenhaochai/nano-gpic
- Dataset GPIC: https://huggingface.co/datasets/stanford-vision-lab/gpic
- Encoder de texto Qwen3-1.7B: https://huggingface.co/Qwen/Qwen3-1.7B
- Subcarpetas de la escalera: https://huggingface.co/wchai/gpic-ladder/tree/main/d10 (y analogamente d11, d12, d13, d14, d16, d18)
