# ttreetoshi/kibako-items-klein4b

## Resumen

kibako-items-klein4b es un LoRA de estilo para el modelo de difusion FLUX.2 [klein] 4B, desarrollado por el usuario ttreetoshi. Su funcion es convertir un nombre de objeto escueto en un icono de objeto de videojuego sobre fondo blanco liso y centrado, sin necesidad de ingenieria de prompts. Donde el modelo base interpreta "an iron sword" como una fotografia, el LoRA produce un icono limpio y reconocible.

El adaptador se entrena sobre `black-forest-labs/FLUX.2-klein-base-4B` (licencia Apache-2.0) y es compatible tanto con la variante base como con la destilada de 4B. El repositorio ocupa 0,1 GB y se distribuye en formato diffusers. El modelo resuelve un problema muy concreto: la generacion automatizada de assets graficos 2D para prototipado de videojuegos, con un estilo consistente y sin prompt engineering.

Es relevante por su enfoque reproducible: el autor publica la receta de entrenamiento completa, el dataset generado sinteticamente y los manifiestos con prompts y semillas, lo que permite reconstruir el pipeline. No obstante, se trata de un adaptador de nicho, con un unico caso de uso claro y sin benchmarks cuantitativos publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre modelo de difusion FLUX.2 [klein] 4B (text-to-image) |
| Parametros totales | no disponible (el LoRA usa rank 32 / alpha 32; el modelo base tiene 4B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de difusion, sin contexto de texto) |
| Tipos de cuantizacion | no disponible (pesos del adaptador en bf16 durante entrenamiento) |
| Idiomas soportados | no disponible (prompts en ingles en la model card) |
| Licencia | apache-2.0 |
| Formato de pesos | diffusers (adaptador LoRA, repo de 0,1 GB) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de estilo de rango 32 y alpha 32 sobre el modelo de difusion FLUX.2 [klein] 4B. El entrenamiento se realizo con ai-toolkit (version 0.13.42, commit `4a7f285`) sobre una unica GPU NVIDIA GB10, con batch size 2, optimizador AdamW, learning rate 1e-4 y precision bf16, alternando resoluciones de 768 y 1024 px.

El dataset consta de 262 imagenes de 132 objetos genericos, producidas por el propio modelo `FLUX.2-klein-4B` con el prompt `game item icon of {item}, single object, centered, plain white background`. Se generaron 4 candidatos por objeto, se aplico una comprobacion automatica de fondo blanco, margenes y tamano del sujeto, y se seleccionaron a mano. Cada imagen lleva como caption unicamente el nombre del objeto, de modo que el LoRA aprende el estilo de icono a partir del nombre. El entrenamiento duro 2000 pasos, pero los pesos publicados corresponden al checkpoint del paso 1500, porque en el paso 2000 las formas empezaban a degradarse (pociones que se convertian en gemas, arcos en palos). La receta completa, el manifiesto con imagenes, prompts y semillas, y el dataset estan publicados.

## Capacidades

- Generacion text-to-image de iconos de objetos de videojuego sobre fondo blanco liso y centrado.
- Aprendizaje de estilo a partir de nombres de objeto escuetos, sin palabra de activacion (trigger word) ni prompt engineering.
- Compatible con el modelo base `FLUX.2-klein-base-4B` (25 pasos, guidance 4, recomendado) y con la variante destilada `FLUX.2-klein-4B` (4 pasos, guidance 1, con estilo mas realista y efecto mas debil).
- Generacion de objetos unicos a 1024 px, con acabado pintado y suave.
- No soporta tool calling, agentes, razonamiento multi-paso ni capacidades multilingues verificadas (es un modelo de imagen).

## Casos de uso

- Prototipado rapido de inventarios en videojuegos: dado un listado de nombres de objetos (armas, pociones, cofres), el LoRA genera iconos consistentes en lote para maquetas y pruebas de interfaz, sin encargar arte final.
- Generacion de assets para game jams: equipos pequenos pueden producir un set de iconos coherente en minutos con prompts escuetos, reduciendo la dependencia de artistas 2D en fases tempranas.
- Creacion de placeholders para pipelines de contenido: los iconos se integran como recursos provisionales en motores como Unity o Godot mientras se produce el arte definitivo.
- Poblar catalogos y tiendas internas de prueba: se generan iconos de items ficticios para validar sistemas de economia, crafting o loot en entornos de staging.
- Iteracion de direccion artistica: al no requerir prompt engineering, disenadores pueden comparar variantes de un mismo objeto con distintas semillas y ajustar el estilo del juego.
- Generacion de datasets sinteticos para otros modelos: el pipeline publicado (generacion, curacion automatica, seleccion manual) sirve como plantilla para crear conjuntos de iconos etiquetados en otros dominios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La evaluacion del autor es visual, sobre 20 objetos fijos con 2 semillas cada uno, y no es cuantitativa. Ademas, 18 de esos 20 objetos estan en el conjunto de entrenamiento (todos salvo `a wooden bow` y `a fishing rod`), por lo que las muestras reflejan el estilo aprendido mas que la generalizacion.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base es de 4B parametros y el adaptador ocupa 0,1 GB, por lo que se espera un consumo modesto en bf16, pero no se publica una cifra.
- GPU recomendadas: el autor entreno en una NVIDIA GB10; no se especifican GPU recomendadas para inferencia.
- Cabe en GPU de consumo: probablemente si, dado el tamano de 4B del modelo base, aunque no se confirma en la informacion disponible.
- Opciones de despliegue: `diffusers` con `DiffusionPipeline` y `load_lora_weights`; no se documentan vLLM, llama.cpp, Ollama ni TGI (no aplican a difusion en este caso).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|---|
| kibako-items-klein4b | LoRA de estilo sobre FLUX.2 klein 4B | 4B (base) + LoRA rank 32 | no aplica | apache-2.0 | Iconos de items de juego, sin trigger word |
| FLUX.2-klein-base-4B | Modelo de difusion base | 4B | no aplica | apache-2.0 | Genera fotografias con prompts escuetos; sin estilo de icono |
| FLUX.2-klein-4B (destilada) | Modelo de difusion destilado | 4B | no aplica | apache-2.0 | 4 pasos, guidance 1; el LoRA carga pero con efecto mas debil |

No se dispone de datos de rendimiento cuantitativo para comparar con alternativas; la comparativa se limita a parametros, licencia y comportamiento descrito por el autor.

## Limitaciones y advertencias

- Es un LoRA de estilo: no ensena al modelo base objetos que no sabe dibujar. Objetos como ballestas, hondas, lanzas largas, mapas o cartas de tarot quedaron fuera del entrenamiento y siguen siendo poco fiables.
- Los arcos fallan con el prompt escueto `a wooden bow` (forma de rombo simetrica con cuerda cruzada); describir la forma (`a wooden hunting bow, side view, strung`) funciona mejor, aunque suele anadir una flecha.
- `a roasted meat on the bone` a menudo parece un garrote.
- El texto en objetos (libros, mapas) no es legible.
- Solo objetos unicos: no se entreno para hojas de sprites, personajes ni escenas.
- No es pixel art: la salida son iconos suaves de aspecto pintado a 1024 px.
- Evaluacion solo visual y con posible sesgo de solapamiento con el conjunto de entrenamiento (18 de 20 objetos evaluados estan en el dataset).
- Riesgo de alucinacion estructural en objetos fuera de distribucion, ya que el adaptador no corrige las carencias del modelo base.
- Licencia Apache-2.0 tanto en el adaptador como en el modelo base; el autor indica que los datos de entrenamiento fueron generados por un modelo Apache-2.0 cuyos pesos abiertos admiten uso comercial. No se detallan otras restricciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ttreetoshi/kibako-items-klein4b
- Modelo base: https://huggingface.co/black-forest-labs/FLUX.2-klein-base-4B
- Dataset: https://huggingface.co/datasets/ttreetoshi/kibako-items-klein4b-data
- Receta de entrenamiento: https://github.com/hayatree/kibako-2d/blob/main/models/items-klein4b/train.yaml
- Manifiesto de datos: https://github.com/hayatree/kibako-2d/blob/main/models/items-klein4b/manifest.jsonl
- Repositorio del proyecto: https://github.com/hayatree/kibako-2d
- Trainer ai-toolkit: https://github.com/ostris/ai-toolkit
