# TheMindExpansionNetwork/budnspud-next-scene-edit-flux3_klein_v1

## Resumen

Bud n Spud — Next-Scene Edit LoRA v1 es un adaptador LoRA de edicion imagen-a-imagen publicado por TheMindExpansionNetwork para generar la "siguiente escena" de una ilustracion de partida manteniendo, segun el autor, identidades, vestuario, decorado y encuadre. El adaptador se ejecuta sobre un checkpoint de difusion denominado `flux3-image-klein-base-int8-convrot.safetensors`, con un codificador de texto Qwen3-VL de 4B en int8 y el VAE `flux2-vae.safetensors`, todo ello dentro de grafos de ComfyUI en formato API. El repositorio pesa 1,0 GB y contiene el `safetensors` del LoRA, los grafos ejecutados y cuatro comparativas origen→edicion.

El modelo esta orientado a un caso muy concreto: continuidad visual de una serie de animacion en plastilina (clay animation) con dos personajes adultos recurrentes, activada por el trigger en minusculas `budnspud`. No es un modelo de proposito general ni un modelo de video: es un adaptador de edicion de imagen, y la propia model card advierte de que no garantiza continuidad entre fotogramas de video. Su interes tecnico esta en que documenta de forma inusualmente honesta sus fallos (duplicacion de objetos, perdida de asignacion de personaje, gestos incompletos), algo poco habitual en adaptadores de este tipo.

La relevancia actual es limitada pero real: sirve como referencia para quien este construyendo pipelines de continuidad de personajes con LoRA sobre modelos de difusion recientes, y como ejemplo de empaquetado reproducible en ComfyUI (grafos, semillas, prompts y ajustes archivados). El adaptador tiene 0 descargas y 0 likes en el momento de la consulta, y su licencia y condiciones de redistribucion del modelo base no estan auditadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo base de difusion denominado `flux3-image-klein-base-int8-convrot`; arquitectura interna del modelo base no disponible |
| Parametros totales | No disponible. El adaptador se distribuye como un unico `safetensors` dentro de un repo de 1,0 GB; no se publica el numero de parametros del LoRA ni del modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica / no disponible (modelo de imagen; no se declara ventana de contexto textual) |
| Tipos de cuantizacion | El adaptador se distribuye en `safetensors`. Las dependencias de los grafos son checkpoints int8 (`int8-convrot`). No se documentan otros formatos (GGUF, FP8, AWQ) |
| Idiomas soportados | No disponible. Todos los prompts de los ejemplos estan en ingles |
| Licencia | No disponible. La model card indica explicitamente que no concede una licencia nueva ni afirma compatibilidad con uso comercial |
| Formato de pesos | `safetensors` (adaptador LoRA) + grafos ComfyUI en formato API (JSON) |
| Pipeline | `image-to-image` |
| Trigger de prompt | `budnspud` (en minusculas) |
| Resolucion de trabajo | 1024x1024 (`square1MP`) para generacion; `resize1MP` para edicion de siguiente escena |
| Muestreo documentado | Euler / simple, 50 pasos, denoise 1, fuerza de adaptador 1. CFG 1 en edicion y CFG 3,5 en escena inicial |
| Dependencias externas | `flux3-image-klein-base-int8-convrot.safetensors`, `qwen3vl_4b_int8_convrot.safetensors` (CLIP type `flux3`), `flux2-vae.safetensors`. No se redistribuyen en este repositorio |
| Tamanio del repositorio | 1,0 GB |

## Arquitectura y entrenamiento

El artefacto es un LoRA, no un modelo completo: se aplica sobre un checkpoint de difusion identificado en la model card como `flux3-image-klein-base-int8-convrot`, cuantizado a int8, y utiliza un codificador de texto Qwen3-VL de 4B (tambien int8) con tipo CLIP `flux3` y el VAE `flux2-vae`. La model card no describe la arquitectura del backbone (tipo de transformer de difusion, mecanismo de atencion, numero de bloques) ni el numero de tokens de entrenamiento, la composicion del dataset o si hubo etapas de ajuste por preferencias. Toda esa informacion figura como no disponible.

Lo que si se documenta es el procedimiento de inferencia y parte del contexto de publicacion: los grafos ejecutados pasan el texto directamente a `CLIPTextEncode`, saltandose las ramas de upsampling de prompt y de layout; las semillas, prompts y ajustes estan archivados en lugar de inferirse de las miniaturas. La model card incluye ademas una correccion de trazabilidad relevante: el JSON de edicion entregado por el creador selecciona el adaptador de "chaos-scene", mientras que la prueba ejecutada selecciona el adaptador de "next-scene"; ambas versiones quedan archivadas. No se aporta ninguna innovacion tecnica propia (decodificacion especulativa, atencion lineal, destilacion de pasos) mas alla del propio ajuste LoRA.

## Capacidades

- Edicion imagen-a-imagen condicionada por prompt: genera una continuacion plausible de una escena de partida en lugar de una imagen nueva desde cero.
- Retencion (parcial) de identidades, vestuario, mobiliario, decorado y encuadre entre la imagen de origen y la editada.
- Estilo visual de animacion en plastilina (clay animation) con dos personajes adultos recurrentes: un hombre alto de pelo castaño, camiseta azul y pantalon corto rojo, y un hombre bajo y redondo con gorro verde oliva, sudadera arcoiris y pantalon verde oliva.
- Control de acciones y gestos dirigido por texto en ingles ("recoil in surprise", "raise both arms", "bow theatrically").
- Activacion mediante trigger especifico (`budnspud`), lo que permite combinarlo con otros LoRA en un mismo grafo de ComfyUI.
- Integracion nativa en ComfyUI mediante grafos en formato API, reproducibles con endpoint propio.
- Produccion de stills de referencia para pipelines de video posteriores (documentado con MiniMaxH3ReferenceToVideo).
- No soporta tool calling, function calling, razonamiento multi-paso, matematicas, codigo ni procesamiento de audio. No se declaran capacidades multilingues.

## Casos de uso

- Storyboard de una serie de animacion en plastilina: dado un frame clave ya dibujado o renderizado, el LoRA propone el siguiente beat visual (una reaccion, un gesto, un objeto que aparece) manteniendo a los dos personajes y el decorado, lo que acelera la iteracion previa al animatic.
- Pitch y previsualizacion de concepto: un estudio pequeno puede generar variaciones de una escena concreta en 1024x1024 para presentar tono, paleta y puesta en escena antes de invertir en produccion stop-motion real.
- Generacion de stills de referencia para video generativo: la model card documenta el uso del par origen/edicion como `<Picture 1>` y `<Picture 2>` en `MiniMaxH3ReferenceToVideo` con `fasth3_omniref_8step_pruned_int8_convrot.safetensors` (Euler, 8 pasos, 1MP, 24 fps), obteniendo un clip de 1376x768 de unos 5,167 s con pista de audio.
- Exploracion de gags y microacciones: probar como responde la escena a instrucciones del tipo "el personaje corto da un mordisco enorme" o "el alto levanta los brazos" para decidir que accion merece animarse a mano.
- Departamento de arte y continuidad: comprobar si un cambio de vestuario o de atrezo propuesto en el guion rompe la legibilidad de la escena, generando la siguiente escena con el mismo encuadre y comparando.
- Pruebas de robustez de un pipeline de edicion: por sus fallos documentados (duplicacion de mandos, asignacion incorrecta de accion a un personaje), es util como caso de test negativo en la evaluacion de sistemas de control de identidad y de atribucion de acciones.
- Docencia y divulgacion tecnica: ejemplo reproducible de LoRA + ComfyUI con grafos, semillas y ajustes archivados, util para explicar el flujo completo de un adaptador de edicion condicionada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos (FID, CLIP score, SSIM, consistencia de identidad, etc.) en la informacion disponible. La unica evaluacion existente es cualitativa y cubre cuatro pares origen→edicion, con fallos reconocidos por el propio autor:

| Caso | Instruccion principal | Resultado observado | Valoracion del autor |
|---|---|---|---|
| 01 popcorn | Las palomitas saltan de la palangana; retener personajes, ropa, sofa, mesa, television y camara | Palomitas en el aire; identidades, vestuario y sala ampliamente retenidos | Exito parcial: la escena de origen ya mostraba sorpresa, la escalada emocional es limitada |
| 02 sandwich | El personaje bajo da un mordisco enorme mientras el alto mira con incredulidad | Se anade una pila tipo sandwich cerca de la boca del personaje alto | Fallo de asignacion de actor: no debe considerarse control de personaje conseguido |
| 03 controller | El alto levanta los brazos con el mando; el bajo se derrumba en derrota con el suyo | El alto levanta los brazos, pero los mandos se dividen y duplican entre las manos; el bajo sigue alegre | Parcial: duplicacion de objetos y emocion incorrecta |
| 04 pigeon | Ambos se inclinan teatralmente ante la paloma coronada, mano en el pecho | Ambos anaden el gesto de mano al pecho; la inclinacion es leve y el personaje bajo cierra los ojos; paloma y sala retenidos | Parcial: gesto incompleto |

Experimento adicional (modelo de video distinto, no evaluacion de este LoRA): el clip OmniRef decodifica correctamente, conserva dos personajes, ropa y sala, muestra palomitas en el aire en el fotograma central y dispersas al final; el detalle de manos es menos coherente durante el estallido y la calidad semantica del audio no fue revisada.

## Requisitos de hardware

- Espacio en disco: 1,0 GB para el repositorio del LoRA, mas los checkpoints dependientes (`flux3-image-klein-base-int8-convrot`, `qwen3vl_4b_int8_convrot`, `flux2-vae`), cuyo tamanio no se publica.
- VRAM estimada: no disponible de forma oficial. Como orientacion, el codificador de texto es un modelo de 4B en int8 (del orden de 4-5 GB de pesos) y el backbone de difusion tambien se distribuye en int8 para trabajar a 1MP; esto situa el escenario probable en la franja de 16-24 GB de VRAM. Es una estimacion, no un dato del autor.
- GPU recomendadas: no disponibles. Por la franja anterior, una RTX 4090 (24 GB) o GPUs de datacenter tipo A100/H100 son el objetivo razonable; no hay confirmacion de funcionamiento en GPUs de 8-12 GB.
- Cabe en GPU de consumo: probablemente en RTX 4090 y, con margen ajustado, en GPUs de 16 GB usando los checkpoints int8; sin verificar por el autor.
- Despliegue: ComfyUI es la unica via documentada (grafos en formato API, ejecutados contra un endpoint propio). No se mencionan vLLM, TGI, llama.cpp ni Ollama, que ademas no aplican a este tipo de artefacto.
- Latencia y throughput: no disponibles. El coste por imagen viene determinado por 50 pasos de muestreo Euler/simple a 1024x1024 o 1MP, con CFG 1 en edicion y CFG 3,5 en escena inicial.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables de terceros (mismo tamano o misma tarea) en el material proporcionado. La unica comparacion posible es interna, entre los artefactos citados en la propia model card:

| Artefacto | Tipo | Funcion | Ajustes documentados | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `budnspud-next-scene-edit-flux3_klein_v1` (este) | LoRA de imagen | Edicion de siguiente escena sobre imagen de partida | Euler/simple, 50 pasos, denoise 1, fuerza 1, 1024x1024 / 1MP | No disponible | Publico en HuggingFace, 0 descargas |
| Adaptador "chaos-scene" del JSON del creador | LoRA de imagen | Edicion de escena (variante) | No disponibles | No disponible | Archivado junto al anterior, nombre de fichero no disponible |
| `fasth3_omniref_8step_pruned_int8_convrot` (MiniMaxH3ReferenceToVideo) | Modelo de video | Referencia-a-video con dos imagenes | Euler, 8 pasos, sigma shifts 12/3, 1MP, 24 fps, 5 s → 124 frames, 1376x768 con audio | No disponible | Dependencia externa, no redistribuida |

Comparativa con alternativas del mercado: no disponible.

## Limitaciones y advertencias

- Licencia no disponible: la model card no concede licencia nueva, no aclara la licencia de los datos de entrenamiento ni los terminos de redistribucion del modelo base, y no afirma compatibilidad con uso comercial. Cualquier uso en produccion requiere verificacion legal independiente.
- Sin auditoria independiente: configuracion de entrenamiento, licencia de datos y terminos del modelo base no han sido auditados.
- Control de actor poco fiable: el ejemplo 02 demuestra que la accion solicitada puede asignarse al personaje equivocado. La cuenta de personajes, la asignacion de actor, las manos y las expresiones requieren revision visual obligatoria.
- Duplicacion de objetos: el ejemplo 03 muestra mandos que se dividen y se duplican entre las manos.
- Gestos incompletos: instrucciones como "bow" se ejecutan de forma atenuada (ejemplo 04).
- No garantiza continuidad entre fotogramas de video; los ejemplos generados son sinteticos y no constituyen verdad temporal de referencia.
- Idioma: todos los prompts documentados estan en ingles; no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- Resolucion limitada a 1MP (1024x1024 en generacion), sin datos sobre comportamiento a mayor resolucion o en relaciones de aspecto no cuadradas.
- Dependencias no incluidas: sin los checkpoints `flux3-image-klein-base-int8-convrot`, `qwen3vl_4b_int8_convrot` y `flux2-vae` el adaptador no es utilizable, y su disponibilidad no esta garantizada por este repositorio.
- Trazabilidad de workflows: existe una discrepancia reconocida entre el JSON del creador (adaptador "chaos-scene") y la prueba ejecutada (adaptador "next-scene"); hay que comprobar que grafo se esta cargando antes de reproducir resultados.
- Riesgo de alucinacion visual y de deriva de estilo: no se documentan metricas de fidelidad, por lo que la retencion de identidad y decorado es una impresion cualitativa sobre cuatro casos.
- Adopcion nula: 0 descargas y 0 likes, sin validacion por parte de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TheMindExpansionNetwork/budnspud-next-scene-edit-flux3_klein_v1
- Workflow ejecutado, ejemplo 01: `workflows/executed/01_popcorn_next.json`
- Workflow ejecutado, ejemplo 02: `workflows/executed/02_sandwich_next.json`
- Workflow ejecutado, ejemplo 03: `workflows/executed/03_controller_next.json`
- Workflow ejecutado, ejemplo 04: `workflows/executed/04_pigeon_next.json`
- Video del experimento OmniRef (5,167 s, 1376x768, con audio): `examples/omni-reference-test/05_omni_popcorn.mp4`
- Imagenes de comparacion: `examples/01_popcorn/`, `examples/02_sandwich/`, `examples/03_controller/`, `examples/04_pigeon/`, `examples/omni-reference-test/`
- Paper, blog o repositorio adicionales: no disponibles en la informacion proporcionada.
- Nota: la busqueda web realizada no devolvio ningun resultado relacionado con este modelo; los enlaces encontrados eran contenido no relacionado y se han descartado.
