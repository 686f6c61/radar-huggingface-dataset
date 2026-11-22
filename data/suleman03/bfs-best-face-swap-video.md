# Suleman03/BFS-Best-Face-Swap-Video

## Resumen

BFS-Best-Face-Swap-Video es un adaptador LoRA (IC-LoRA) para los modelos de generacion de video Lightricks LTX-2.3 y LTX-2.5, publicado por el usuario Suleman03 en Hugging Face. Su funcion es realizar intercambio de identidad facial (head swap) sobre video, tomando la identidad de un rostro de referencia y transfiriendola a un video guia que aporta el movimiento. Se enmarca en la categoria de modelos image-to-video y video-to-video, y se distribuye como pesos compatibles con la libreria diffusers.

El modelo no es un modelo de lenguaje ni un transformer de texto: es un adaptador de difusion sobre un modelo base de generacion de video. Por ello, las especificaciones tipicas de un LLM (parametros totales, longitud de contexto, cuantizacion, idiomas) no aplican directamente y se marcan como no disponibles. El repositorio ocupa 13,4 GB y no registra descargas ni likes en el momento de la consulta, lo que indica que es un recurso reciente y de nicho.

Su relevancia es practica para flujos de VFX, prototipado cinematografico e investigacion de identidad digital. La model card insiste en el consentimiento explicito de las personas cuya imagen se procesa y en la responsabilidad legal del usuario final, un punto critico dado el caracter sensible de la tecnologia de suplantacion facial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (IC-LoRA) sobre modelo base de difusion de video Lightricks LTX-2.3 / LTX-2.5 |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | ltx-2-community-license-agreement |
| Formato de pesos | no disponible (compatible con diffusers) |
| Tamano del repositorio | 13,4 GB |
| Pipeline | image-to-video |
| Modelo base | Lightricks/LTX-2.3, Lightricks/LTX-2.5 |
| Libreria | diffusers |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de tipo IC-LoRA (in-context LoRA) disenado para inyectar identidad facial en la generacion de video de los modelos base LTX-2.3 y LTX-2.5 de Lightricks. La tecnica de referencia que documenta el autor es el "Frame 0 Anchoring Technique": el primer fotograma del video se usa como ancla de identidad y el LoRA propaga esa identidad a lo largo de la secuencia siguiendo el movimiento del video guia. La version V3 introduce un "persistent-template workflow" que estabiliza la plantilla de identidad a lo largo del clip.

No se dispone de informacion sobre el numero de tokens o clips de entrenamiento, la composicion del dataset, ni si se aplicaron tecnicas de refinamiento como RLHF o DPO (que, por otra parte, no son habituales en modelos de difusion de video). Tampoco se detallan innovaciones como decodificacion especulativa o atencion lineal. La informacion publica se limita a la model card, los ejemplos de video y los tags del repositorio.

## Capacidades

- Intercambio de identidad facial (head swap) sobre video, transfiriendo el rostro de una referencia a un video guia.
- Generacion image-to-video condicionada por una imagen de identidad y un video de movimiento.
- Video-to-video con preservacion de la identidad anclada en el primer fotograma.
- Compatibilidad con dos versiones del modelo base (LTX-2.3 y LTX-2.5), con ejemplos separados para cada una.
- Flujo de trabajo con plantilla persistente en la version V3 para mayor consistencia temporal.
- No se documentan capacidades de texto, razonamiento, codigo, tool calling, agentes ni multilingueismo; no aplican a este tipo de modelo.

## Casos de uso

- Postproduccion de VFX: sustituir el rostro de un doble por el del actor principal en planos de accion, usando el video del doble como guia de movimiento y anclando la identidad en el primer fotograma.
- Prototipado cinematografico (previsualizacion): generar previos con la identidad definitiva del reparto antes del rodaje, para validar casting y continuidad visual.
- Doblaje y localizacion audiovisual: adaptar la identidad facial de un actor a un video de referencia para pruebas de sincronizacion en distintos mercados, siempre con consentimiento explicito.
- Investigacion en identidad digital: estudiar la robustez de sistemas de reconocimiento facial frente a transformaciones de identidad sintetica en video.
- Creacion de contenido con avatares autorizados: producir clips donde una persona cede su imagen mediante consentimiento para campanas o demos.
- Pruebas de pipelines de generacion de video: integrar el LoRA en flujos diffusers para evaluar consistencia temporal e identidad en distintas versiones del modelo base.
- Educacion y divulgacion sobre deepfakes: generar ejemplos controlados para formar a equipos en deteccion de medios sinteticos, en entornos con las garantias legales adecuadas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; el repositorio pesa 13,4 GB, lo que da una referencia del espacio en disco necesario, no de la VRAM.
- GPU recomendadas: no disponible. Al tratarse de un LoRA sobre un modelo base de difusion de video, los requisitos vendran determinados por el modelo base LTX-2.3 / LTX-2.5, cuyas especificaciones no se detallan aqui.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la libreria declarada es diffusers; no se documentan otras opciones como vLLM, llama.cpp, Ollama o TGI (no aplicables a difusion de video en la mayoria de los casos).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la informacion proporcionada modelos comparables de intercambio facial en video basados en LoRA sobre LTX, ni se dispone de datos de parametros, contexto o rendimiento para establecer una comparacion rigurosa.

## Limitaciones y advertencias

- Uso etico restringido: el autor declara que el modelo es una herramienta tecnica para investigacion de identidad digital, VFX profesional y prototipado cinematografico.
- Requiere consentimiento explicito y derechos legales sobre la imagen de cualquier persona procesada.
- El usuario final asume toda la responsabilidad legal y etica; el autor renuncia a cualquier responsabilidad por mal uso.
- Riesgo elevado de suplantacion de identidad y de generacion de medios sinteticos enganosos; debe cumplirse la normativa local e internacional sobre medios sinteticos.
- Licencia ltx-2-community-license-agreement: conviene revisar sus terminos antes de cualquier uso comercial, ya que puede imponer restricciones adicionales.
- Sin datos publicos de sesgos, tasas de alucinacion visual, limites de duracion de clip ni rendimiento por idioma o demografia.
- Modelo con cero descargas y cero likes en el momento de la consulta: sin validacion comunitaria ni evidencia de robustez en produccion.
- No se documentan limitaciones de contexto ni de idioma porque no aplican a un modelo de video, pero si se desconocen los limites de resolucion, duracion y tasa de fotogramas soportados.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Suleman03/BFS-Best-Face-Swap-Video
- Ejemplos de video V1/V3/LTX-2.5: https://huggingface.co/Alissonerdx/BFS-Best-Face-Swap-Video/resolve/main/examples/ (rutas 1.mp4 a 8.mp4 y ltx-25-1.mp4, ltx-25-2.mp4)
- Video demostrativo del flujo V3: https://www.youtube.com/watch?v=HBp03iu7wLA
- Modelo base LTX-2.3: https://huggingface.co/Lightricks/LTX-2.3
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
