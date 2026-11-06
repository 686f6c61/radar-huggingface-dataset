# SpaceGhost/ace-step-1.5-trance-eurodance-lora

## Resumen

ACE-Step 1.5 - Multi-Genre LoRA (Trance / Eurodance / Synthwave / Chiptune) es un adaptador LoRA desarrollado por el usuario SpaceGhost sobre el modelo base ACE-Step 1.5 Turbo (DiT), un modelo de generacion musical por difusion. El adaptador especializa el modelo base en cuatro subgeneros de musica electronica: uplifting trance, eurodance de los 90, synthwave ochentero y chiptune de 8 bits. Resuelve el problema de que un modelo generativo musical generalista no reproduce con fidelidad las convenciones sonoras de estos generos (supersaws, bombos 909, gated reverb, ondas cuadradas de NES/Amiga), y lo hace mediante un ajuste ligero y reutilizable.

El entrenamiento se realizo en una GPU NVIDIA L4 sobre un dataset equilibrado de 120 pistas musicales reales extraidas de archivos historicos de ModArchive, escenas de demoscene y netlabels. El repositorio tiene un tamano declarado de 0,0 GB (los pesos LoRA son ligeros) y se distribuye con licencia Apache 2.0. El adaptador se publico el 6 de noviembre de 2026 y, en el momento de redactar esta ficha, no registra descargas ni interacciones.

La relevancia de este adaptador es practica: permite a quien ya dispone del modelo ACE-Step 1.5 Turbo obtener estilos electronicos muy definidos con un coste de entrenamiento minimo, sin necesidad de reentrenar el modelo completo. Al ser un LoRA, se puede cargar y descargar dinamicamente en la interfaz Gradio local o en pipelines propios, lo que facilita alternar entre estilos o combinarlo con otros adaptadores.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre ACE-Step 1.5 Turbo (Diffusion Transformer, DiT) |
| Parametros totales | no disponible (adaptador LoRA; el modelo base no se detalla) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (generacion musical, no textual) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El adaptador es un LoRA (Low-Rank Adaptation) aplicado sobre ACE-Step 1.5 Turbo, un modelo de generacion musical basado en Diffusion Transformer (DiT). El LoRA introduce matrices de bajo rango en las capas del modelo base, de modo que solo se entrenan esos parametros adicionales mientras el resto del modelo permanece congelado. El entrenamiento se ejecuto en una GPU NVIDIA L4, lo que indica un coste computacional moderado y coherente con el tamano reducido de un adaptador de este tipo.

El dataset de origen consta de 120 pistas musicales reales, equilibradas entre los cuatro generos objetivo, extraidas de ModArchive, archivos de la escena demoscene y netlabels. No se especifica en la informacion disponible el numero de pasos de entrenamiento, la tasa de aprendizaje, el rango del LoRA ni la composicion exacta por genero. Tampoco se documenta si hubo tecnicas adicionales como decodificacion especulativa, atencion lineal u otras innovaciones; el adaptador hereda la arquitectura del modelo base sin modificarla.

## Capacidades

- Generacion de musica electronica en cuatro estilos diferenciados: uplifting trance, eurodance de los 90, synthwave y chiptune.
- Control de estilo mediante etiquetas de activacion (trigger tags): `upliftingtrance`, `eurodancestyle`, `synthwave80s` y `chiptune8bit`.
- Rangos de BPM orientativos por genero: 138 BPM para trance, 132-136 BPM para eurodance, 118-124 BPM para synthwave y 128-140 BPM para chiptune.
- Reproduccion de caracteristicas sonoras especificas: supersaws y bajos rolantes en trance, acordes de piano y bombo 909 en eurodance, sintetizadores analogicos y gated reverb en synthwave, ondas cuadradas y ruido de arcade en chiptune.
- Integracion con la interfaz Gradio local de ACE-Step 1.5 mediante carga de la ruta del LoRA.
- Compatibilidad con el ecosistema de pesos safetensors y el pipeline de ACE-Step.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio de entrada.

## Casos de uso

- Produccion musical de trance uplifting: un productor puede generar ideas de drops y secciones de supersaws con la etiqueta `upliftingtrance` a 138 BPM, usando el adaptador para obtener rapidamente bocetos que luego refina en su DAW.
- Creacion de eurodance nostálgico: para proyectos de musica de los 90, el adaptador genera acordes de piano clasicos y lineas de bajo de organo con bombo 909, adecuado para bandas sonoras de videojuegos retro o anuncios con estetica vintage.
- Bandas sonoras de videojuegos indie: el estilo `chiptune8bit` permite generar loops y temas con ondas cuadradas y ruido de arcade que encajan con juegos de estetica NES/Amiga sin necesidad de sintetizadores dedicados.
- Musica para contenido audiovisual: creadores de video pueden generar pistas de synthwave a 118-124 BPM con pads nocturnos y gated reverb para intros, transiciones o fondos de stream.
- Prototipado rapido en estudios: al ser un LoRA ligero, un equipo puede alternar entre los cuatro estilos cargando y descargando el adaptador en la WebUI, lo que agiliza la exploracion de direcciones creativas antes de encargar produccion final.
- Investigacion en generacion musical condicionada por estilo: el adaptador sirve como caso de estudio de como un LoRA sobre un DiT generalista captura convenciones de genero con solo 120 pistas, util para experimentos de adaptacion eficiente.
- Educacion y demostraciones: en talleres de IA generativa musical, el adaptador permite mostrar de forma tangible como las etiquetas de activacion y los parametros de BPM controlan el resultado sonoro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Al ser un adaptador LoRA, el requisito dominante es el del modelo base ACE-Step 1.5 Turbo, que no se detalla en la informacion proporcionada.
- GPU recomendadas: el autor indica que el entrenamiento se realizo en una NVIDIA L4; no se especifican GPU recomendadas para inferencia.
- Cabe en GPU de consumo: no disponible. Depende del modelo base; el adaptador en si es ligero (repositorio de 0,0 GB).
- Opciones de despliegue: interfaz Gradio local de ACE-Step 1.5 (`start_gradio_ui.bat`), cargando los archivos en `checkpoints/loras/trance_eurodance/`. No se documentan vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion musical).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye datos de rendimiento ni especificaciones de modelos comparables de generacion musical con LoRA.

## Limitaciones y advertencias

- El adaptador solo cubre cuatro subgeneros electronicos; fuera de ellos, su efecto sobre el modelo base puede degradar la calidad o introducir sesgos estilisticos no deseados.
- El dataset de entrenamiento es reducido (120 pistas), lo que puede limitar la diversidad y favorecer el sobreajuste a las caracteristicas concretas de esas pistas.
- No se documentan sesgos conocidos, pero al entrenarse con musica historica de escenas y netlabels, puede reproducir convenciones de produccion de una epoca y region concretas.
- Riesgo de alucinacion: no aplica en el sentido textual, pero el modelo puede generar audio incoherente o con artefactos si el prompt o la etiqueta de activacion no son claros.
- No se especifican limitaciones de contexto ni de idioma; la generacion es musical y no textual.
- La licencia es Apache 2.0, lo que permite uso comercial, pero se debe verificar la licencia del modelo base ACE-Step 1.5 Turbo y de las pistas del dataset de origen antes de un uso comercial.
- El repositorio no registra descargas ni interacciones, por lo que no hay validacion de la comunidad sobre su calidad.
- No se documentan requisitos de version del modelo base ni compatibilidad con otras variantes de ACE-Step.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SpaceGhost/ace-step-1.5-trance-eurodance-lora
- Dataset de origen: https://huggingface.co/datasets/SpaceGhost/ace-step-electronic-trance-dataset
