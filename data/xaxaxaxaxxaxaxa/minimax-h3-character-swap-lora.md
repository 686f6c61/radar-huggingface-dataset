# xaxaxaxaxxaxaxa/MiniMax-H3-Character-Swap-LoRA

## Resumen

MiniMax-H3 Character Swap LoRA v1 es un adaptador LoRA experimental de reemplazo de personajes en vídeo, entrenado por Akatz Labs sobre el modelo base MiniMax-H3. Su función es sustituir a una persona concreta de un vídeo por el personaje de una imagen de referencia, manteniendo la escena original (cámara, fondo, iluminación y resto de personas). Se distribuye como un único archivo safetensors (`h3_character_swap_pro4500_1000.safetensors`) dentro de la librería `diffusion-single-file`, con un pipeline declarado de vídeo a vídeo.

El adaptador se entrenó durante 1.000 actualizaciones con rango y alpha 16, sobre una versión `minimax_h3_ref2va_pruned_int8_convrot` del modelo base y el asistente de entrenamiento congelado Ref2VA de Ostris. El conjunto de datos asociado, `akatz-ai/H3-Character-Swap-v1`, contiene 94 tríos sintéticos de edición de imagen y 40 ejemplos de vídeo/audio sin modificar; el entrenamiento real usó 76 ediciones y 32 clips de regularización. No se entrenó ninguna palabra de activación.

Es relevante ahora porque aborda uno de los problemas prácticos más habituales en edición de vídeo generativa con modelos de difusión: la consistencia de identidad al sustituir personajes sin reescribir la escena. El autor reporta mejor preservación de fondo y escena que el modelo base en comparaciones cualitativas locales, pero advierte que el movimiento, las expresiones faciales y los cortes duros siguen siendo poco fiables. No es un modelo autónomo ni una destilación Turbo: es un adaptador que requiere el modelo base y los VAE por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer de difusion MiniMax-H3 (arquitectura interna del base no disponible) |
| Parametros totales | No disponible (adaptador de rango 16; repo de 0,2 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible. En entrenamiento se uso regularizacion de 73 frames a 24 fps (aprox. 3,04 s); la duracion maxima de inferencia no esta establecida |
| Tipos de cuantizacion | Base de entrenamiento pruned INT8 convrot; transformer en convrot8 y text encoder NVFP4 durante el entrenamiento; adaptador publicado en safetensors |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license-agreement (licencia: other) |
| Formato de pesos | safetensors (diffusion-single-file) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 16, aplicado excluyendo la proyeccion `adaln_proj`, sobre el transformer del modelo MiniMax-H3. El entrenamiento partio de `minimax_h3_ref2va_pruned_int8_convrot.safetensors` de Comfy-Org/MiniMax-H3, junto con el asistente de entrenamiento congelado Ref2VA de Ostris (`ostris/minimax_h3_training_adapter`). Ni el asistente ni los pesos base se fusionan en el adaptador distribuido. La configuración registrada usa optimizador AdamW8bit con tasa de aprendizaje 5e-5, batch 1, acumulacion 1 y precisión BF16, con ahorro de memoria mediante gradient checkpointing, offload por capas, latentes y texto en caché, y MLP troceado. El muestreo durante el entrenamiento estuvo desactivado. El coste estimado de alquiler de la maquina (RunPod RTX PRO 4500 Blackwell de 32 GB) fue de unos 11 dolares por una noche, sin que esto constituya una medicion de coste.

Los datos son deliberadamente limitados en alcance: 94 tríos sintéticos de edición de imagen y 40 ejemplos de vídeo/audio sin cambios, de los que se usaron 76 ediciones y 32 clips de regularización, quedando 18 ediciones y 8 clips reservados. Los objetivos de edición son imagenes fijas individuales con controles de vídeo fuente estatico de cinco frames, de modo que no se entrenó sobre objetivos de reemplazo de personaje en movimiento largo. La resolución objetivo de edición usó un presupuesto de area de 1024 con buckets de 1344x768, y la regularización de vídeo se hizo a un presupuesto reducido de 384, con 73 frames a 24 fps. El dataset incluye cambios entre estilos y hojas de personaje variadas, pero solo objetivos de reemplazo de un único personaje. La evaluación se hizo sobre el base Ref2VA y sobre un híbrido local FL2VA/Ref2VA (bloques 25-49, INT8); en una prueba posterior se combinó este adaptador con un LoRA Turbo de 8 pasos a 768p, muestreador `res_multistep`/`simple` y atencion Sol nativa, pero esas son elecciones de evaluación y no parte del entrenamiento ni una garantia de compatibilidad universal.

## Capacidades

- Reemplazo de personaje en vídeo: sustituye a una persona concreta indicada en el prompt por el personaje de una imagen de referencia, conservando postura, escala y posicion del sujeto original.
- Preservacion de escena: en revisiones locales lado a lado, el autor observa mejor conservacion de fondo y escena que con el modelo base, aunque se trata de una observacion cualitativa, no de una metrica.
- Transferencia de identidad, vestuario y estilo artistico desde la imagen de referencia.
- Conservacion de elementos no objetivo: otros personajes, objetos, iluminacion y encuadre del vídeo fuente.
- Edicion a nivel de imagen fija: los objetivos de entrenamiento son imagenes estaticas con controles de vídeo de cinco frames.
- Generacion de audio asociada al vídeo: en comparaciones tempranas el audio generado quedo mas cerca del original, pero se omitia o derivaba en la prueba de continuacion.
- Inferencia con dos personajes: probada, aunque el reemplazo multi-personaje no fue supervisado en los objetivos de entrenamiento.
- No requiere palabra de activacion ni LoRA Turbo, Spectrum o atencion Sol para funcionar, aunque puede combinarse con un Turbo LoRA en configuraciones experimentales.
- Soporte de tool calling, function calling, agentes y razonamiento multi-paso: no disponible (no es un modelo de lenguaje).
- Capacidades multilingues: limitadas a ingles en la metadata; el prompt de ejemplo esta en ingles.

## Casos de uso

- Postproduccion de video con sustitucion de actor: se toma un plano rodado, se indica en el prompt la persona a reemplazar y se aporta una hoja de personaje o una imagen del nuevo sujeto. Es adecuado para planos cortos y continuos, donde el autor observa mejores resultados.
- Prototipado de casting virtual: generar versiones de un mismo plano con distintas apariencias de personaje sin volver a rodar, gracias al uso de una imagen de referencia por generacion.
- Localizacion de contenido audiovisual: adaptar piezas promocionales a un personaje regional manteniendo intactos fondo y resto de participantes del plano.
- Anonimizacion de identidad en material grabado: sustituir rostros o cuerpos por un personaje ficticio conservando la escena, util en demos internas o material de formacion.
- Creacion de contenido para redes sociales: clips de 4 a 5 segundos a 24 fps con un personaje creado por el usuario, integrandolo en planos existentes sin reencuadrar la escena.
- Integracion en pipelines de ComfyUI: colocar el safetensors en `ComfyUI/models/loras/`, cargarlo con un cargador LoRA solo-modelo a fuerza 1.0 y encadenar el flujo Ref2VA con el vídeo fuente como `<Video 1>` y la referencia como `<Picture 1>`.
- Iteracion artistica sobre storyboards: partir de un vídeo de control y cambiar el personaje principal para explorar variantes de estilo entre distintos disenos de personaje.
- Pruebas de continuidad en montaje: usar ventanas cortas con continuacion para evaluar como encajan planos consecutivos, teniendo en cuenta que el timing de corte no esta garantizado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que las comparaciones lado a lado son revisiones cualitativas locales y no una puntuacion de benchmark. Tampoco se documenta una duracion maxima de plano, una tasa de exito del reemplazo ni metricas de fidelidad de identidad.

## Requisitos de hardware

- VRAM para el adaptador: el repositorio completo ocupa 0,2 GB, por lo que el adaptador en si es ligero; la VRAM real la determina el modelo base MiniMax-H3, cuyos requisitos de inferencia no se detallan en la informacion disponible.
- Hardware de entrenamiento documentado: RunPod con RTX PRO 4500 Blackwell de 32 GB, con gradient checkpointing, offload por capas, latentes y texto en cache y MLP troceado.
- Cabe en GPU de consumo: no disponible. El entrenamiento requirio 32 GB junto con tecnicas de ahorro de memoria; no se aportan datos de inferencia en GPUs de consumo.
- Opciones de despliegue: runtime compatible con H3 Ref2VA, con el modelo base y los VAE obtenidos por separado; integracion en ComfyUI mediante `ComfyUI/models/loras/` o directorio compartido equivalente y un cargador LoRA solo-modelo. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Configuracion de muestreo recomendada: 24 fps y la rejilla de frames soportada por el runtime; en la prueba experimental con Turbo LoRA de 8 pasos a 768p se uso `res_multistep`/`simple` con atencion Sol nativa.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de modelos directamente comparables en la informacion proporcionada. La unica comparacion cualitativa documentada es contra el propio modelo base y configuraciones derivadas evaluadas por el autor, sin metricas numericas.

| Referencia | Tipo | Relacion con este adaptador | Datos comparativos |
|---|---|---|---|
| Comfy-Org/MiniMax-H3 (`minimax_h3_ref2va_pruned_int8_convrot`) | Modelo base | Base de entrenamiento; el adaptador no lo incluye | Preservacion de escena peor segun revision cualitativa del autor |
| Hibrido local FL2VA/Ref2VA (bloques 25-49, INT8) | Configuracion base local | Usado para evaluacion, no distribuido | Sin metricas publicadas |
| LoRA Turbo 8 pasos a 768p | Adaptador de aceleracion | Combinado en una prueba experimental con este LoRA | Sin metricas publicadas |
| Ostris Ref2VA training assistant (`ostris/minimax_h3_training_adapter`) | Asistente de entrenamiento congelado | Usado durante el entrenamiento, no fusionado | No aplica como alternativa de inferencia |

## Limitaciones y advertencias

- Es un adaptador, no un modelo autonomo: requiere el modelo base MiniMax-H3 y los VAE por separado, y no incorpora los pesos base ni el asistente de entrenamiento.
- Ventanas largas: pueden derivar en encuadre, colocacion o sincronizacion respecto al vídeo fuente.
- Cortes duros: pueden convertirse en zooms o reposicionamientos graduales en lugar de mantener el corte.
- Expresiones faciales en primeros planos: pueden no coincidir con la interpretacion original; aniadir instrucciones de expresion no fue consistentemente util y en algunos casos suprimio el reemplazo por completo.
- Multi-personaje: la inferencia con dos personajes se probo, pero los objetivos de entrenamiento solo cubren el reemplazo de un personaje, por lo que no hay supervision multi-personaje.
- Continuacion de ventanas cortas: mejoro algunas uniones, pero no garantiza el timing de corte ni el cumplimiento estricto del vídeo fuente.
- Audio: en comparaciones tempranas quedo mas cerca del original, pero se omitio o derivo en la prueba de continuacion.
- Duracion: los planos cortos y continuos de unos 4 a 5 segundos fueron mas prometedores que las pruebas completas de 14 segundos; no se ha establecido una duracion maxima precisa.
- Alineacion con el prompt: el texto del prompt no garantiza una adherencia estricta al material fuente; las instrucciones de preservacion ayudaron en algunas evaluaciones locales, pero no de forma universal.
- Datos de entrenamiento: 94 trios sinteticos de edicion de imagen y 40 ejemplos sin cambios; los objetivos son imagenes fijas, no reemplazos en movimiento. Los datos incluyen cambios entre estilos y hojas de personaje variadas, pero un unico personaje objetivo.
- Licencia: minimax-h3-community-license-agreement, una licencia "other" cuyo texto integro esta en el archivo LICENSE del repositorio. Debe revisarse antes de cualquier uso comercial, ya que las condiciones no se detallan en la informacion disponible.
- Repositorio practicamente sin uso publico: 0 descargas y 0 likes en el momento de la consulta, sin validacion externa de terceros.
- Metadata limitada a ingles, lo que restringe los prompts a ese idioma en la practica.
- El hibrido local empleado en la evaluacion no se distribuye, por lo que reproducir esa configuracion requiere montarla por cuenta propia.
- La instantanea del codigo de AI Toolkit copiada no provenia de un checkout de Git, de modo que la etiqueta de version embebida no es una revision exacta del codigo fuente.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xaxaxaxaxxaxaxa/MiniMax-H3-Character-Swap-LoRA
- Repositorio espejo del autor original: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA
- Archivos del repositorio espejo: https://huggingface.co/akatz-ai/MiniMax-H3-Character-Swap-LoRA/tree/main
- Dataset de entrenamiento: https://huggingface.co/datasets/akatz-ai/H3-Character-Swap-v1
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3
- Asistente de entrenamiento Ref2VA: https://huggingface.co/ostris/minimax_h3_training_adapter
- Cobertura en tools4all.ai: https://tools4all.ai/trends/minimax-h3-character-swap-lora-released
- Listado de archivos y resumen en localmodelwatch: https://localmodelwatch.tsuchitsuchi.com/en/2026/09/28/minimax-h3-character-swap-lora/
- Ejemplo de uso en Civitai con Turbo LoRA a 4 pasos: https://civitai.com/models/2843905/mini-max-character-replace-with-turbo-lora-4-steps
