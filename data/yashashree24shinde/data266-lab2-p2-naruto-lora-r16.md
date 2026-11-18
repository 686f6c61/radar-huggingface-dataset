# yashashree24shinde/data266-lab2-p2-naruto-lora-r16

## Resumen

El modelo `yashashree24shinde/data266-lab2-p2-naruto-lora-r16` es un adaptador LoRA (Low-Rank Adaptation) de rango 16 entrenado sobre el UNet de Stable Diffusion 1.5 para generar imagenes de estilo anime inspiradas en el universo Naruto. Lo desarrolla la estudiante yashashree24shinde en el marco de la asignatura DATA 266 (Lab 2, Part 2) de la San Jose State University, dentro del equipo Pair_Programming_Team_08. No es un modelo generativo completo, sino un conjunto de pesos adicionales que se cargan sobre el checkpoint base `runwayml/stable-diffusion-v1-5` mediante la libreria diffusers.

El adaptador se entreno sobre el dataset `lambdalabs/naruto-blip-captions` (1.221 imagenes a 512x512 con 0 duplicados eliminados) durante 1.000 pasos con un learning rate de 1e-4 y batch size 1, alcanzando un pico de 3,19 GB de memoria GPU. Solo entrena 3.188.736 parametros, el 0,37% del UNet, lo que lo convierte en un ejemplo didactico de ajuste eficiente frente al fine-tuning completo del UNet, con el que se compara en la propia model card (KID de 0,0595 frente a 0,0556; CLIP score de 32,75 frente a 32,67).

Es relevante ahora como referencia practica de LoRA de bajo rango aplicado a difusion, y como pieza de un sistema multiagente (Part 3 del laboratorio). Su alcance es academico: el repo pesa 0,0 GB, no registra descargas ni likes, y la propia model card restringe el uso a fines no comerciales de curso e investigacion por el contenido con derechos de autor del dataset.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre el UNet de Stable Diffusion 1.5 (difusion latente, text-to-image) |
| Parametros totales | 3.188.736 parametros entrenables (0,37% del UNet); el checkpoint base SD 1.5 no se incluye |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen condicionado por prompt de texto) |
| Tipos de cuantizacion | no disponible (el adaptador se usa en float16 sobre el base segun el ejemplo de la model card) |
| Idiomas soportados | no disponible (prompts en ingles en el ejemplo y en el dataset BLIP) |
| Licencia | creativeml-openrail-m |
| Formato de pesos | pesos LoRA compatibles con diffusers (`load_lora_weights`); no se especifica safetensors |

## Arquitectura y entrenamiento

El adaptador aplica LoRA de rango 16 y alpha 16 exclusivamente sobre el UNet del modelo base `runwayml/stable-diffusion-v1-5`, un modelo de difusion latente con encoder de texto CLIP y VAE. No se modifica el text encoder ni el VAE. El entrenamiento usa el dataset `lambdalabs/naruto-blip-captions` con 1.221 imagenes a 512x512, sin invalidas ni duplicados eliminados, y un split 90/10 con semilla 266 (1.098 de entrenamiento, 123 de test). Se ejecutaron 1.000 pasos con batch size 1, learning rate 1e-4 y semilla 266, con un pico de 3,19 GB de VRAM.

No se documenta en la informacion disponible el numero total de tokens ni el uso de RLHF/DPO, algo que no aplica a este tipo de ajuste. La innovacion tecnica del trabajo es la comparacion controlada entre LoRA de rango 16 y fine-tuning completo del UNet bajo el mismo protocolo de evaluacion: 20 prompts fijos con semillas 0 y 1, midiendo KID, CLIP score, LPIPS entre semillas y una tasa de victoria humana a ciegas con 25 pares y 3 evaluadores.

## Capacidades

- Generacion de imagenes text-to-image en estilo anime Naruto, condicionada por prompts de texto en ingles.
- Especializacion estilistica: reproduce la estetica del dataset de entrenamiento (personajes y escenas tipo Naruto).
- Composicion de escenas con personajes y entornos descritos en el prompt (por ejemplo, "Naruto Uzumaki standing beside a waterfall, anime style").
- Integracion con el pipeline `StableDiffusionPipeline` de diffusers mediante `load_lora_weights`.
- Compatibilidad con el safety checker de Stable Diffusion, que en la evaluacion reemplazo 0 de 40 imagenes.
- No soporta tool calling, agentes, razonamiento multi-step, vision de entrada, audio ni modo thinking: es un adaptador de generacion de imagen.
- Capacidades multilingues: no disponibles; el entrenamiento y los ejemplos usan captions en ingles.

## Casos de uso

- Prototipado de ilustracion anime en cursos y talleres: cargar el adaptador sobre SD 1.5 con diffusers permite demostrar en clase el flujo completo de un LoRA de difusion con 3,19 GB de pico de memoria en entrenamiento.
- Generacion de arte conceptual para fan projects no comerciales: el adaptador produce escenas de personajes y paisajes del universo Naruto a partir de prompts descriptivos, util para bocetos y variaciones rapidas.
- Comparativa metodologica de tecnicas de ajuste: sirve como referencia reproducible (semilla 266, 20 prompts, semillas 0 y 1) para contrastar LoRA r16 frente a fine-tuning completo del UNet con KID, CLIP score y LPIPS.
- Componente de un sistema multiagente: segun la model card, es el modelo de generacion de la Part 3 del laboratorio, por lo que encaja como nodo de sintesis de imagen dentro de un pipeline orquestado por agentes.
- Generacion de datasets sinteticos de estilo anime para experimentos de investigacion: permite aumentar un corpus de imagenes con una estetica controlada y medir la diversidad entre semillas con LPIPS (0,751 en este adaptador).
- Demostraciones de despliegue ligero: al ser un adaptador pequeno sobre SD 1.5, se puede servir en una unica GPU consumer con el pipeline de diffusers para demos interactivas de text-to-image.
- Evaluacion de seguridad en generacion de imagen: el registro de 0 imagenes reemplazadas por el safety checker en 40 generaciones sirve como caso de prueba para calibrar filtros de contenido.

## Benchmarks y rendimiento

| Metrica | LoRA r16 | Full UNet (run 2) |
|---|---|---|
| KID vs imagenes de test (media ± desviacion) | 0,0595 ± 0,0056 | 0,0556 ± 0,0047 |
| CLIP score | 32,75 | 32,67 |
| LPIPS entre semillas (diversidad) | 0,751 | 0,773 |
| Tasa de victoria humana a ciegas (25 pares, 3 evaluadores) | 48% | 52% |
| Imagenes reemplazadas por el safety checker (de 40) | 0 | 1 |

Los valores proceden de la model card y son los impresos por el notebook del autor. La evaluacion usa 20 prompts fijos con semillas 0 y 1. No se han publicado resultados en benchmarks estandar (MMLU, HumanEval, GSM8K) porque no aplican a un modelo de generacion de imagen.

## Requisitos de hardware

- VRAM de inferencia: no se publica una cifra especifica para el adaptador; el pipeline SD 1.5 en float16 sobre CUDA es el escenario documentado en la model card.
- VRAM de entrenamiento: 3,19 GB de pico con batch size 1 y 1.000 pasos, segun la model card.
- GPU recomendadas: no disponibles de forma explicita; el ejemplo usa `cuda` generico. Por el tamano del adaptador y del base SD 1.5, es viable en GPUs consumer con suficiente VRAM para SD 1.5 en float16.
- Cabe en GPU consumer: si, segun el consumo de entrenamiento reportado (3,19 GB); no se detalla el modelo de GPU empleado.
- Opciones de despliegue: diffusers (`StableDiffusionPipeline` + `load_lora_weights`) es la via documentada. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a difusion.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| data266-lab2-p2-naruto-lora-r16 (este) | 3.188.736 entrenables (0,37% del UNet) | no aplica | KID 0,0595; CLIP 32,75; victoria humana 48% | creativeml-openrail-m | Hugging Face, 0 descargas |
| Full UNet fine-tuning (run 2, mismo laboratorio) | UNet completo de SD 1.5 | no aplica | KID 0,0556; CLIP 32,67; victoria humana 52% | no disponible en la informacion | Resultados en el repo del autor, no como checkpoint publicado |
| runwayml/stable-diffusion-v1-5 (base) | UNet completo de SD 1.5 | no aplica | no disponible en la informacion | creativeml-openrail-m | Hugging Face, ampliamente distribuido |

No se dispone de datos de otros adaptadores LoRA comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Estilo muy estrecho: al entrenarse solo con arte anime de Naruto, los prompts alejados del dominio cambian menos o se ven arrastrados hacia esa estetica.
- Las imagenes de entrenamiento contienen personajes con derechos de autor; la model card restringe el uso a coursework e investigacion no comercial y remite a la licencia del dataset en su pagina de Hugging Face.
- Licencia creativeml-openrail-m: conviene revisar sus condiciones antes de cualquier uso comercial del adaptador o de las imagenes generadas.
- Riesgo de alucinacion y de artefactos propio de SD 1.5: no se reportan tasas de fallo especificas, solo metricas agregadas de KID y CLIP.
- Sin datos sobre sesgos demograficos o culturales del dataset ni sobre cobertura multilingue; los captions estan en ingles.
- El adaptador no incluye los pesos base: requiere descargar `runwayml/stable-diffusion-v1-5` por separado.
- Se recomienda mantener activo el safety checker de Stable Diffusion durante la generacion, tal como indica el autor.
- Repo de 0,0 GB y sin descargas ni likes: no hay evidencia de uso en produccion ni de mantenimiento posterior.

## Enlaces

- Hugging Face: https://huggingface.co/yashashree24shinde/data266-lab2-p2-naruto-lora-r16
- Repositorio de codigo y notebook: https://github.com/aneessaheba/data266-lab2-team08 (notebook en `notebooks/p2_finetune_naruto.ipynb`, resultados en `results/p2/`)
- Modelo base: https://huggingface.co/runwayml/stable-diffusion-v1-5
- Dataset: https://huggingface.co/datasets/lambdalabs/naruto-blip-captions
