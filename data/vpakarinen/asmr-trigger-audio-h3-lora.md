# vpakarinen/asmr-trigger-audio-h3-lora

## Resumen

ASMR Whisper Audio LoRA for MiniMax H3 es un adaptador LoRA (Low-Rank Adaptation) disenado para el modelo de generacion de video MiniMaxAI/MiniMax-H3. Lo desarrolla el usuario independiente vpakarinen y su funcion concreta es especializar el modelo base en la generacion de audio ASMR y susurros suaves, sincronizados con el video generado. No es un modelo autonomo: requiere el modelo base MiniMax-H3 para funcionar, y se distribuye como un adaptador ligero (0,2 GB de repositorio) que modifica el comportamiento del generador.

El problema que resuelve es muy especifico: los modelos de text-to-video e image-to-video genericos producen audio ambiental generico, pero no reproducen con fidelidad las caracteristicas acusticas del ASMR (voz susurrada, cercania al microfono, respiraciones, sonidos de boca). Este LoRA permite condicionar la generacion para obtener ese tipo de audio en formato vertical 9:16, orientado a contenido de plataformas como TikTok, Reels o YouTube Shorts.

Es relevante por su nicho: demuestra como los adaptadores LoRA permiten especializar modelos de video-audio de gran escala en dominios acusticos muy concretos sin reentrenar el modelo completo. La licencia Apache 2.0 facilita su uso comercial, aunque el modelo base tiene sus propias condiciones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MiniMax-H3 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 0,2 GB, propio de adaptadores LoRA) |

## Arquitectura y entrenamiento

Se trata de un adaptador LoRA, es decir, un conjunto de matrices de bajo rango que se inyectan en las capas del modelo base MiniMax-H3 para ajustar su comportamiento sin modificar los pesos originales. El modelo base es un generador de video con soporte de text-to-video (t2v) e image-to-video (i2v) que, segun la model card, tambien produce audio asociado al video generado. El adaptador se entrena especificamente para sesgar la generacion de audio hacia el registro ASMR y susurrado.

La model card no detalla el dataset de entrenamiento, el numero de pasos, el rango del LoRA ni la composicion de los datos. Solo se documentan los hiperparametros de inferencia recomendados: resolucion 720x1280, peso del adaptador entre 0,6 y 0,8, entre 20 y 30 pasos de muestreo, con un ajuste optimo en 1280 y 30 pasos en formato 9:16. El prompt recomendado es explicito: una persona sosteniendo un microfono, acercandose y susurrando el texto indicado.

## Capacidades

- Generacion de video text-to-video (t2v) e image-to-video (i2v) heredada del modelo base MiniMax-H3.
- Generacion de audio ASMR con caracteristicas de susurro suave y cercania al microfono.
- Sincronizacion de audio susurrado con la accion del video (persona hablando al microfono).
- Control del peso del adaptador para graduar la intensidad del efecto ASMR.
- Formato vertical 9:16 optimizado para plataformas de video corto.
- Soporte de idioma ingles unicamente segun los metadatos del modelo.
- No se documentan capacidades de tool calling, agentes ni razonamiento multi-paso (no aplica a un modelo de generacion de video).

## Casos de uso

- Creacion de contenido ASMR para TikTok y Reels: el LoRA genera clips verticales 9:16 con audio susurrado realista, adecuados para publicacion directa en plataformas de video corto sin postproduccion de audio.
- Generacion de videos de relajacion y meditacion: se puede producir contenido de susurros guiados con sincronizacion labial y de microfono, usando el prompt recomendado y un peso de 0,6-0,8.
- Prototipado de anuncios de audio para marcas de auriculares o microfonos: el modelo genera escenas con microfono en mano y susurros cercanos, utiles para demostrar la captacion de detalles acusticos finos.
- Contenido de roleplay o ficcion sonora: creadores de narrativa inmersiva pueden generar escenas de susurro con personajes, aprovechando image-to-video para mantener consistencia visual a partir de una imagen de referencia.
- Pruebas de doblaje y localizacion: util para generar material de referencia de audio susurrado en ingles antes de doblar a otros idiomas, dado que el modelo solo soporta ingles.
- Investigacion sobre generacion de audio condicionada: sirve como caso de estudio de como un LoRA de bajo rango modifica un atributo acustico concreto en un modelo multimodal de video y audio.
- Generacion de material para audiolibros o podcasts visuales: clips cortos de susurro con imagen de locutor, integrables en producciones de formato corto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- No se dispone de datos especificos de VRAM para este adaptador; el requisito dominante es el del modelo base MiniMax-H3, que no se detalla en la informacion proporcionada.
- El adaptador en si ocupa 0,2 GB, por lo que el coste adicional de memoria sobre el modelo base es minimo.
- GPU recomendadas: no disponible para el modelo base en la informacion proporcionada.
- Viabilidad en GPU de consumo: no disponible; depende enteramente del modelo base MiniMax-H3.
- Opciones de despliegue: no disponible en la informacion proporcionada (no se documentan vLLM, llama.cpp, ComfyUI ni otros entornos).
- Latencia y throughput: no disponible. La model card solo indica 20-30 pasos de muestreo, con 30 pasos como ajuste optimo.

## Comparativa con modelos similares

| Modelo | Tipo | Base | Contexto/Resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vpakarinen/asmr-trigger-audio-h3-lora | LoRA de audio ASMR | MiniMax-H3 | 720x1280, 9:16 | Apache 2.0 | Hugging Face |
| MiniMaxAI/MiniMax-H3 | Modelo base t2v/i2v | - | no disponible | no disponible | Hugging Face |
| Otros LoRA de audio para video | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de informacion sobre adaptadores LoRA comparables de audio ASMR para modelos de video, por lo que la comparativa con alternativas directas no esta disponible.

## Limitaciones y advertencias

- Dependencia total del modelo base MiniMax-H3: el adaptador no funciona de forma autonoma y hereda todas las limitaciones del modelo base.
- Idioma limitado al ingles segun los metadatos; no se garantiza calidad en castellano ni en otros idiomas.
- Nicho muy estrecho: el LoRA esta disenado para audio ASMR y susurros; usarlo fuera de ese dominio puede degradar la calidad del audio generado.
- Sensibilidad a hiperparametros: la model card fija un rango de peso (0,6-0,8) y de pasos (20-30); valores fuera de rango pueden producir artefactos.
- No se documenta el dataset de entrenamiento, lo que impide evaluar sesgos de voz, genero, acento o etnia en el audio generado.
- Riesgo de artefactos acusticos y de sincronizacion en prompts alejados del formato recomendado (microfono en mano, susurro cercano).
- Licencia Apache 2.0 para el adaptador, pero el uso comercial del modelo base MiniMax-H3 depende de sus propios terminos, que no se detallan en la informacion disponible.
- Contenido ASMR susurrado puede requerir revision de politicas de plataforma si se usa para publicacion automatizada a gran escala.
- No hay datos publicados de benchmarks, evaluacion humana ni metricas objetivas de calidad de audio.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vpakarinen/asmr-trigger-audio-h3-lora
- Modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Video de demostracion: https://huggingface.co/vpakarinen/asmr-trigger-audio-h3-lora/resolve/main/demo_video_14.mp4
- Apoyo al autor (Buy Me a Coffee): https://buymeacoffee.com/vpakarinen
- Apoyo al autor (Ko-fi): https://ko-fi.com/vpakarinen
