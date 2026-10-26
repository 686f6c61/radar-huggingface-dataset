# TheMindExpansionNetwork/budnspud-chaos-scene-lora-v1

## Resumen

Bud n Spud — Chaos Scene LoRA v1 es un adaptador LoRA para generacion de imagenes texto-a-imagen publicado por TheMindExpansionNetwork. No es un modelo de lenguaje ni un modelo base: es un adaptador que se aplica sobre un pipeline de difusion de la familia FLUX (la dependencia declarada en los grafos es `flux3-image-klein-base-int8-convrot.safetensors`). Su funcion concreta es reproducir una escena recurrente de comedia en plastilina stop-motion: dos personajes adultos de clay, un salon distopico con sofa mostaza remendado, mesa baja de madera, cables colgando, un televisor CRT pequeno e iluminacion practica en verde azulado y ambar.

El adaptador se activa con el disparador en minusculas `budnspud` y esta pensado para usarse dentro de ComfyUI, con grafos en formato API incluidos en el repositorio. La model card documenta cuatro escenas de arranque probadas (palomitas, sandwich, mandos de consola y paloma) con sus prompts completos, semillas y ajustes archivados, y advierte de que los resultados observados mantienen a los personajes y los anclajes de la habitacion, pero las expresiones y la puesta en escena solicitadas varian.

Es relevante ahora por dos motivos: primero, porque muestra el patron habitual de los adaptadores de estilo/escena de autor unico, con muy poca validacion externa (0 descargas y 0 likes en el momento de la consulta) y sin licencia declarada; segundo, porque su model card es inusualmente explicita sobre los limites de auditoria del entrenamiento y sobre los terminos de redistribucion del modelo base, algo poco frecuente y util para evaluar riesgo antes de integrarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusion de la familia FLUX; no se especifica rango, alpha ni capas adaptadas |
| Parametros totales | no disponible (el repositorio completo ocupa 1,0 GB, incluyendo pesos, ejemplos y grafos) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; la ventana practica la fija el codificador de texto del pipeline (Qwen3-VL-4B segun las dependencias) |
| Tipos de cuantizacion | no disponible para el adaptador (se distribuye en `safetensors`); las dependencias del grafo se referencian en int8 |
| Idiomas soportados | no disponible; todos los prompts de ejemplo estan redactados en ingles |
| Licencia | no disponible; la model card no concede licencia nueva ni acredita permisos comerciales |
| Formato de pesos | safetensors (`budnspud-chaos-scene-lora.safetensors`) |
| Pipeline declarado | text-to-image |
| Disparador (trigger) | `budnspud` (en minusculas) |
| Resolucion probada | 1024x1024 (ajuste cuadrado de 1 MP); edicion de escena siguiente con resize a 1 MP |
| Muestreo de referencia | Euler/simple, 50 pasos, denoise 1, fuerza del adaptador 1 |
| CFG de referencia | 3,5 en escena de arranque; 1 en edicion de escena siguiente |
| Entorno de inferencia | ComfyUI, con grafos en formato API incluidos en `workflows/executed/` |
| Descargas / likes | 0 / 0 en el momento de la consulta |
| Fecha de publicacion | 2026-10-25 (actualizado el mismo dia) |

## Arquitectura y entrenamiento

El repositorio contiene un unico adaptador LoRA en `safetensors` que se carga sobre un modelo base de difusion de la familia FLUX. La cadena de dependencias que declaran los grafos es: `flux3-image-klein-base-int8-convrot.safetensors` como modelo de difusion, `qwen3vl_4b_int8_convrot.safetensors` como codificador de texto con tipo CLIP `flux3`, y `flux2-vae.safetensors` como VAE. Ninguna de esas tres dependencias se distribuye en este repositorio, de modo que la reproducibilidad exige obtaininglas por separado. El adaptador se aplica con fuerza 1 en los grafos probados.

No hay informacion publica sobre el numero de imagenes de entrenamiento, la composicion del dataset, el rango del LoRA, las capas adaptadas ni si hubo regularizacion o captions automaticos. La propia model card declara que la configuracion de entrenamiento, la licencia exacta de los datos de entrenamiento y los terminos de redistribucion del modelo base no han sido auditados de forma independiente. Como innovacion tecnica destacable en el plano de la reproducibilidad, los grafos ejecutados anulan las ramas de upsampling de prompt y de layout pasando el texto redactado directamente a `CLIPTextEncode`, mientras que los grafos fuente se conservan sin modificar.

## Capacidades

- Generacion texto-a-imagen de escenas de comedia en plastilina con estetica de stop-motion artesanal.
- Coherencia de personajes recurrentes: un hombre alto y delgado, moreno, con camiseta azul y pantalon corto rojo; y un hombre bajo y redondo con gorro de lana verde oliva, sudadera con capucha tie-dye arcoiris y pantalon cargo verde oliva.
- Coherencia de decorado: salon distopico con sofa mostaza remendado, mesa baja de madera desgastada, cables colgando, televisor CRT pequeno e iluminacion practica en verde azulado y ambar.
- Composicion de chistes visuales legibles a partir de una descripcion textual de la accion (palomitas compartidas, sandwich descomunal, mandos de consola, paloma con corona de papel).
- Flujo de continuacion de escena: los grafos incluyen una rama de edicion de la "escena siguiente" con resize a 1 MP y CFG 1.
- Integracion en ComfyUI mediante grafos en formato API, sin credenciales ni endpoints activos incrustados.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agentico.
- No genera texto, codigo ni matematicas: es exclusivamente un adaptador de imagen.
- No hay evidencia de capacidades multilingues; los prompts documentados estan en ingles y el disparador es un token en minusculas sin traduccion.

## Casos de uso

- Previsualizacion de planos para una serie de animacion en clay: generar la imagen de arranque de cada escena con el disparador `budnspud` y los anclajes de decorado permite discutir puesta en escena y attrezzo antes de modelar en plastilina real.
- Storyboard iterativo de gag visual: el modelo admite describir la accion en el prompt (quien sostiene que objeto, hacia donde mira, que expresion busca) y devuelve una composicion cuadrada de 1 MP util como viñeta de guion.
- Continuacion de escena dentro de ComfyUI: la rama de edicion con CFG 1 y resize a 1 MP sirve para encadenar el plano siguiente manteniendo personajes y decorado, reduciendo el coste de reescribir el prompt completo.
- Prototipado de una IP propia de dos personajes: al estar los personajes descritos por apariencia y no por nombre, el adaptador se puede usar como base estilistica para explorar variaciones de vestuario o de atrezzo sin salir de la estetica clay.
- Pruebas internas de prompting y comparacion de adaptadores: los grafos ejecutados con semillas y ajustes archivados permiten montar un banco de pruebas reproducible de LoRAs de escena en ComfyUI.
- Ilustracion editorial y miniaturas: generar una escena comica cuadrada para cabeceras de articulo o thumbnails de video, con una estetica muy reconocible y coste de inferencia de un solo paso de muestreo de 50 iteraciones.
- Material docente sobre LoRA en ComfyUI: el repositorio incluye grafos en formato API y prompts completos, lo que lo hace util como ejemplo de estructura de workflow (dependencias, bypass de upsampling, ajustes de CFG) en talleres tecnicos.
- Generacion de keyframes para posteriores pipelines de video: el mismo autor publica un modelo texto-a-video (`BudNSpud_T2V_Minimax_H3_v1`), por lo que las escenas de arranque pueden servir como primer fotograma de una animacion.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas cuantitativas (FID, CLIP score, similitud de personaje, consistencia entre semillas) ni comparaciones medidas contra otros adaptadores. Las unicas evaluaciones son cualitativas: para las cuatro escenas probadas se indica que se mantienen "dos personajes de clay reconocibles y los anclajes de la habitacion", mientras que "las expresiones y la puesta en escena solicitadas varian", y que los ejemplos son generaciones y no evidencia de rendimiento de edicion.

## Requisitos de hardware

- VRAM del adaptador: minima (un fichero LoRA en `safetensors`); el coste real lo determina el modelo base y el codificador de texto.
- Estimacion a partir de las dependencias declaradas (no medida): base de difusion FLUX en int8 en torno a 12 GB, codificador Qwen3-VL-4B en int8 en torno a 5 GB y VAE en torno a 0,3 GB, lo que situa el peso de los pesos en unos 17-18 GB antes de activaciones.
- VRAM total estimada para 1024x1024 sin offload: 20-24 GB, contando activaciones de atencion. Cifra estimada, no verificada.
- GPU recomendadas: A100 40 GB u 80 GB, H100 80 GB para ejecucion holgada y lotes; RTX 4090 o RTX 3090 (24 GB) como opcion de gama alta consumer, presumiblemente ajustada.
- GPU consumer de 16 GB (RTX 4080, 4070 Ti Super): viable solo con offload secuencial de modulos a CPU; el rendimiento caera de forma notable.
- GPU de 12 GB o menos: no recomendable sin cuantizacion adicional del modelo base; no hay variante GGUF publicada en este repositorio.
- Opciones de despliegue: ComfyUI es la via documentada y la unica con grafos probados; Diffusers es plausible si la arquitectura del modelo base esta soportada, pero no hay ejemplo publicado. No aplica llama.cpp, Ollama ni TGI (no es un modelo de lenguaje).
- Latencia y throughput: no disponibles. El ajuste de referencia usa 50 pasos con sampler Euler/simple, un numero de pasos alto que penaliza la latencia frente a configuraciones de 20-30 pasos; no se documenta tiempo por imagen en ninguna GPU.

## Comparativa con modelos similares

La comparacion es aproximada: no existen adaptadores publicos equivalentes de esta misma escena, y los resultados encontrados en la busqueda web pertenecen a otras categorias o a personajes distintos.

| Modelo | Tipo | Modelo base | Tamano | Funcion | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| budnspud-chaos-scene-lora-v1 | LoRA de escena y personajes | FLUX (identificador `flux3` en las dependencias) | Repositorio de 1,0 GB (peso del LoRA no desglosado) | Escena recurrente de clay stop-motion con dos personajes fijos | no disponible | HuggingFace, 0 descargas |
| Bud Spencer 1972 v1.0 | LoRA de personaje | Flux.1 D | 164 MB | Retrato de un actor concreto | Licencia de Civitai (no verificada en detalle) | Archivado en CivArchive; sin espejos activos |
| Bud V1 | LoRA de sujeto | Flux.1 D | 18 MB | Un perro ("just our dog") | Licencia de Civitai | Civitai / CivArchive |
| BudNSpud_T2V_Minimax_H3_v1 | Modelo texto-a-video | no disponible | no disponible | Video a partir de texto, mismo universo de personajes | no disponible | HuggingFace, sin model card ni proveedor de inferencia |

Frente a los LoRA de personaje de Flux.1 D, este adaptador cubre escena completa (dos personajes mas decorado fijo) en lugar de un unico sujeto, lo que implica mas elementos que deben permanecer estables y, segun la propia model card, mas variabilidad en la puesta en escena. No hay datos publicos para comparar calidad, consistencia ni fidelidad al prompt con ninguna de las alternativas.

## Limitaciones y advertencias

- Licencia no disponible: no se concede licencia nueva ni se acredita permiso comercial. Cualquier uso en produccion requiere aclarar antes los terminos con el autor y revisar la licencia del modelo base.
- La licencia de los datos de entrenamiento y los terminos de redistribucion del modelo base no han sido auditados segun la propia model card.
- Consistencia limitada: el autor reconoce que, en las cuatro pruebas, las expresiones faciales y la puesta en escena solicitadas varian. El recuento de personajes, la asignacion de acciones, las manos y las expresiones requieren revision visual.
- Riesgo de alucinacion visual: objetos que aparecen o desaparecen, manos mal formadas, texto ilegible o elementos del decorado que se duplican o se pierden entre generaciones.
- El adaptador esta entrenado sobre dos personajes masculinos adultos; no hay evidencia de generalizacion a otros personajes, edades o generos, y puede reproducir sesgos de representacion del dataset original.
- Solo se documentan pruebas a 1024x1024 con prompts en ingles; no hay datos sobre otras resoluciones, relaciones de aspecto ni otros idiomas.
- Dependencias no incluidas: sin `flux3-image-klein-base-int8-convrot.safetensors`, `qwen3vl_4b_int8_convrot.safetensors` y `flux2-vae.safetensors`, los grafos no se pueden ejecutar. La disponibilidad y los terminos de esos ficheros quedan fuera de este repositorio.
- Validacion externa nula: 0 descargas y 0 likes, sin resultados de benchmarks ni evaluaciones de terceros.
- Los ejemplos publicados son generaciones sinteticas y, segun el autor, no constituyen evidencia de rendimiento de edicion ni "verdad temporal" de la escena.
- Advertencia de formato: el repositorio incluye grafos en formato API sin credenciales; si se reutilizan, conviene revisar que no se incorporen endpoints ni claves propias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheMindExpansionNetwork/budnspud-chaos-scene-lora-v1
- Grafo ejecutado, escena 01 popcorn: https://huggingface.co/TheMindExpansionNetwork/budnspud-chaos-scene-lora-v1/blob/main/workflows/executed/01_popcorn_start.json
- Grafo ejecutado, escena 02 sandwich: https://huggingface.co/TheMindExpansionNetwork/budnspud-chaos-scene-lora-v1/blob/main/workflows/executed/02_sandwich_start.json
- Grafo ejecutado, escena 03 controller: https://huggingface.co/TheMindExpansionNetwork/budnspud-chaos-scene-lora-v1/blob/main/workflows/executed/03_controller_start.json
- Grafo ejecutado, escena 04 pigeon: https://huggingface.co/TheMindExpansionNetwork/budnspud-chaos-scene-lora-v1/blob/main/workflows/executed/04_pigeon_start.json
- Perfil del autor en HuggingFace: https://huggingface.co/TheMindExpansionNetwork/models
- Modelo texto-a-video del mismo autor: https://huggingface.co/TheMindExpansionNetwork/BudNSpud_T2V_Minimax_H3_v1
- LoRA de personaje Bud Spencer 1972 (CivArchive): https://civarchive.com/models/1552648
- LoRA Bud V1 para Flux.1 D (CivArchive): https://civarchive.com/models/2324823
- LoRA Bud V1 en Civitai: https://civitai.com/models/2324823/bud
