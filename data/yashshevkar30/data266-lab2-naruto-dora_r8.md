# YashShevkar30/data266-lab2-naruto-dora_r8

## Resumen

`data266-lab2-naruto-dora_r8` es un adaptador LoRA con descomposicion DoRA (Weight-Decomposed Low-Rank Adaptation) de rango 8 entrenado sobre Stable Diffusion 1.5 para la generacion de imagenes del universo Naruto. Lo desarrolla YashShevkar30 en el marco de la asignatura DATA 266 (Lab 2, Parte 2, Pair Programming Team 03) y se publica como ejecucion comparativa, no como el adaptador final seleccionado del trabajo.

El modelo resuelve un problema acotado: especializar un modelo de difusion texto-a-imagen generico en un dominio visual muy concreto (planos cercanos de personajes de anime) con un coste de entrenamiento minimo. El adaptador anade solo 3.204.288 parametros entrenables sobre la UNet de SD 1.5, se entrena en 2.000 pasos y consume 0,4345 GPU-horas en una NVIDIA RTX PRO 4500 Blackwell, con un pico de memoria de 4,73 GB.

Su relevancia es fundamentalmente docente y metodologica: documenta de forma reproducible el efecto de DoRA con rango 8 sobre un dataset pequeno (1.099 imagenes de 512x512), con metricas objetivas (KID, CLIP score, LPIPS) frente al modelo base. No es un modelo de lenguaje ni un sistema multimodal de proposito general, sino un adaptador de difusion con licencia heredada CreativeML OpenRAIL-M y uso restringido a investigacion y docencia no comercial por los derechos de autor de los personajes representados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA con descomposicion DoRA sobre UNet de Stable Diffusion 1.5 (atención q, k, v, out y capas feed-forward) |
| Parametros totales | 3.204.288 parametros entrenables (adaptador); pesos del modelo base no incluidos en el repo |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de difusion texto-a-imagen; sin ventana de contexto de tokens) |
| Tipos de cuantizacion | no disponible (el autor no documenta cuantizaciones del adaptador) |
| Idiomas soportados | no disponibles (condicionamiento textual via CLIP de SD 1.5, predominantemente ingles) |
| Licencia | creativeml-openrail-m (heredada de SD 1.5); uso declarado por el autor: solo investigacion y docencia no comercial |
| Formato de pesos | no disponible (repo de 0.0 GB en el momento de la consulta; el autor indica carga via `pipe.load_lora_weights`) |

Otros datos tecnicos declarados: rango 8, alpha 8, dataset `lambda/naruto-blip-captions` con 1.099 imagenes tras eliminar corruptas y duplicadas, split 90/10 con semilla 266, resolucion 512x512, 2.000 pasos de entrenamiento, batch 4 (7,28 epocas), AdamW con lr 0,0001, scheduler coseno, Min-SNR gamma 5 y precision mixta `torch.bfloat16`.

## Arquitectura y entrenamiento

El adaptador se inyecta en la UNet de Stable Diffusion 1.5 mediante DoRA, una variante de LoRA que descompone los pesos en magnitud y direccion para acercar el comportamiento del ajuste de bajo rango al de un fine-tuning completo. Los modulos afectados son las proyecciones de atencion (q, k, v, out) y las capas feed-forward, con rango 8 y alpha 8. El texto se condiciona con el codificador CLIP original de SD 1.5, sin modificaciones.

El entrenamiento usa el dataset `lambda/naruto-blip-captions`, con captions generados automaticamente por BLIP, lo que limita la precision descriptiva de las etiquetas. Tras filtrar imagenes corruptas y duplicadas quedan 1.099 ejemplos a 512x512, repartidos 90/10 con semilla 266. Se ejecutan 2.000 pasos con batch 4 (7,28 epocas), AdamW a lr 0,0001 con schedule coseno, Min-SNR gamma 5 como ponderacion de perdida y precision mixta bfloat16. El coste total es de 1.564 segundos (0,4345 GPU-horas) en una NVIDIA RTX PRO 4500 Blackwell, con pico de memoria de 4,73 GB. No se documenta RLHF, DPO ni etapas de refinamiento posteriores, algo esperable en un adaptador de difusion.

## Capacidades

- Generacion de imagenes texto-a-imagen condicionada por prompt, especializada en planos cercanos de personajes de anime del universo Naruto.
- Especializacion de dominio sobre SD 1.5: reproduce estilos y personajes del dataset de entrenamiento con mayor fidelidad que el modelo base, segun la metrica KID reportada.
- Control de diversidad mediante semilla: el autor reporta LPIPS de diversidad entre semillas de 0,784, practicamente identico al 0,794 del modelo base.
- Compatibilidad con el ecosistema Diffusers mediante `load_lora_weights`, lo que permite combinarlo con pipelines de SD 1.5, schedulers alternativos y otros adaptadores.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision de entrada, audio ni modo thinking: no es un modelo de lenguaje.
- Capacidad multilingue: no documentada; el condicionamiento depende del tokenizador CLIP de SD 1.5, orientado a ingles.

## Casos de uso

- Docencia y practicas de fine-tuning: el adaptador sirve como ejemplo reproducible y medido de como aplicar DoRA de rango 8 sobre SD 1.5, con hiperparametros, coste de GPU y metricas documentados para comparar contra otras ejecuciones del mismo laboratorio.
- Generacion de arte conceptual de fan art: util para producir bocetos de personajes de anime con estilos coherentes con el dataset, siempre en el marco de investigacion no comercial que impone la licencia y los derechos de los personajes.
- Prototipado rapido de pipelines de difusion: al ser un adaptador ligero (3,2 M de parametros) sobre un checkpoint publico de SD 1.5, permite montar demos en Diffusers sin almacenar un modelo completo adicional.
- Experimentacion con tecnicas de adaptacion de bajo rango: sirve para comparar DoRA frente a LoRA clasico con el mismo rango, dataset y presupuesto de pasos, ya que el autor lo publica explicitamente como ejecucion comparativa.
- Investigacion sobre metricas de evaluacion generativa: el conjunto de resultados (KID in-domain, CLIP score, LPIPS de diversidad y flags NSFW) sobre 20 prompts fijos y 2 semillas es un caso practico para estudiar la varianza de estas metricas con muestras pequenas.
- Filtrado y curaduria de datasets: el propio proceso de eliminar imagenes corruptas y duplicadas hasta quedarse en 1.099 ejemplos documenta un flujo de limpieza aplicable a otros proyectos de fine-tuning visual.
- Generacion de variaciones controladas por semilla: con DPM-Solver++ a 30 pasos y guidance 7.5, el adaptador permite explorar variaciones de un mismo prompt manteniendo una diversidad similar a la del modelo base, util para seleccion de imagenes en tareas de anotacion.

## Benchmarks y rendimiento

Resultados reportados por el autor: 20 prompts fijos por 2 semillas, DPM-Solver++ con 30 pasos y guidance 7.5.

| Metrica | dora_r8 | Stable Diffusion 1.5 (base) |
|---|---|---|
| KID (in-domain vs test) | 0,0352 | 0,1393 |
| CLIP score | 30,42 | 31,91 |
| LPIPS de diversidad entre semillas | 0,784 | 0,794 |
| Flags NSFW | 3/40 | no disponible |

No se han publicado resultados de benchmarks adicionales (FID, Inception Score, evaluaciones humanas) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; al ejecutarse sobre SD 1.5 en precision fp16, el pipeline completo requiere del orden de 4-6 GB de VRAM, aunque el autor no publica esta cifra.
- VRAM de entrenamiento: pico de 4,73 GB con batch 4, resolucion 512x512 y precision mixta bfloat16 en una NVIDIA RTX PRO 4500 Blackwell.
- GPU recomendadas: cualquier GPU con soporte de bfloat16 o fp16 y al menos 6-8 GB de VRAM para inferencia; el entrenamiento se valido en RTX PRO 4500 Blackwell.
- Cabe en GPU de consumo: si, en principio en tarjetas tipo RTX 3060, 4060 Ti, 4070 o superiores, dado el reducido pico de memoria del entrenamiento y el tamano del modelo base; el autor no lo verifica explicitamente.
- Opciones de despliegue: Diffusers con `pipe.load_lora_weights("YashShevkar30/data266-lab2-naruto-dora_r8")` sobre el checkpoint `stable-diffusion-v1-5/stable-diffusion-v1-5`; no se documentan otros runners (ComfyUI, A1111, vLLM, llama.cpp, Ollama, TGI) ni conversiones a otros formatos.
- Latencia y throughput: no disponibles; el unico dato temporal es el coste de entrenamiento de 1.564 segundos (0,4345 GPU-horas).

## Comparativa con modelos similares

| Modelo | Tipo | Parametros del adaptador | Base | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| data266-lab2-naruto-dora_r8 | LoRA + DoRA r8 | 3.204.288 | SD 1.5 | 512x512 | creativeml-openrail-m (uso no comercial segun autor) | Hugging Face, 0 descargas |
| Stable Diffusion 1.5 (base) | Modelo de difusion completo | no aplica | - | 512x512 | creativeml-openrail-m | Ampliamente disponible |
| Otros adaptadores LoRA de Naruto sobre SD 1.5 | LoRA | no disponible | SD 1.5 | 512x512 | variable | Multiples en Hugging Face y Civitai |
| LoRA clasico r8 equivalente (mismo dataset) | LoRA | no disponible en la informacion | SD 1.5 | 512x512 | no disponible | Ejecucion comparativa del mismo laboratorio, no referenciada con URL |

La comparacion cuantitativa solo es posible contra el modelo base, para el que el autor aporta KID, CLIP score y LPIPS. No se dispone de datos de benchmarks de los adaptadores alternativos de Naruto ni del LoRA clasico del mismo laboratorio.

## Limitaciones y advertencias

- Captions genericos: las etiquetas provienen de BLIP automatico, lo que reduce el control fino sobre atributos como pose, iluminacion o composicion.
- Rango de sujeto estrecho: el dataset se compone de planos cercanos de anime; los prompts fuera de dominio derivan hacia personajes de anime en lugar de respetar la peticion original.
- Sesgo de dominio: al entrenarse solo con imagenes de Naruto, el adaptador arrastra el estilo visual y los personajes del dataset hacia cualquier generacion.
- Ruido metrico: el KID se calcula sobre 20 imagenes, por lo que su valor es ruidoso y no debe interpretarse como una medida estable.
- Contenido NSFW: el autor reporta 3 flags NSFW sobre 40 generaciones, por lo que el filtrado posterior es necesario en cualquier uso publico.
- Licencia y derechos: el modelo base es CreativeML OpenRAIL-M, pero el dataset no declara licencia y los personajes de Naruto estan sujetos a derechos de autor; el autor restringe el uso a investigacion y docencia no comerciales.
- Riesgo de alucinacion visual: como todo modelo de difusion, puede generar anatomias incorrectas, texto ilegible y fusiones incoherentes de personajes, especialmente con prompts largos o fuera de dominio.
- Estado del repositorio: 0 descargas, 0 likes y un tamano de repo de 0.0 GB en el momento de la consulta, lo que sugiere que los pesos pueden no estar efectivamente subidos o que el artefacto es meramente documental.
- Sin soporte de texto, codigo, matematicas ni razonamiento: cualquier expectativa en ese sentido es inaplicable a este artefacto.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/YashShevkar30/data266-lab2-naruto-dora_r8
- Modelo base: https://huggingface.co/stable-diffusion-v1-5/stable-diffusion-v1-5
- Dataset de entrenamiento: https://huggingface.co/datasets/lambda/naruto-blip-captions
- Paper de DoRA (Weight-Decomposed Low-Rank Adaptation): no disponible en la informacion proporcionada
- Paper de LoRA: no disponible en la informacion proporcionada
- Repositorio del laboratorio DATA 266: no disponible
- Demo o Space asociado: no disponible
