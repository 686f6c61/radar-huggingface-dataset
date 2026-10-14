# Ziyaad30/krea2-identity-edit

## Resumen

Krea 2 Identity Edit es un adaptador LoRA de edicion de imagen por instrucciones, orientado a preservar la identidad de las personas, desarrollado por el usuario Ziyaad30 sobre el modelo base Krea 2 Raw. No es un modelo completo, sino un fine-tune (LoRA) que se aplica sobre Krea 2 Raw (12,9B parametros, arquitectura single-stream MMDiT) y que requiere el paquete de nodos ComfyUI-Krea2Edit para funcionar, ya que se entreno con doble condicionamiento (tokens VAE en contexto mas codificacion Qwen3-VL anclada a imagen) que los nodos estandar no proporcionan.

El objetivo del adaptador es editar una imagen a partir de una instruccion en lenguaje natural preservando todo lo que no se pide cambiar, incluida la persona. Cubre tareas como reescenificado de personas manteniendo el parecido, ediciones locales (recolorear, anadir, eliminar o reemplazar objetos), restilizado global, edicion con dos referencias (escena mas persona) y composicion con otros LoRA del usuario.

La version recomendada es v1.2, que anade una pasada de alta resolucion a 1024, soporte de hojas de referencia de personaje, intercambio de cabeza/cara/ojo/persona, outpainting, inpainting y probador virtual, ademas de la geometria FIT y el dial de fidelidad `ref_boost`. Se distribuyen variantes de bajo consumo (r128 de 0,91 GB y r64 de 0,46 GB) reducidas por SVD. No se han publicado resultados de benchmarks en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre Krea 2 Raw (MMDiT single-stream, 12,9B parametros) |
| Parametros totales | No disponible (base: 12,9B); LoRA r128 = 0,91 GB, r64 = 0,46 GB |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible (condicionamiento por instruccion textual mas imagen via Qwen3-VL) |
| Tipos de cuantizacion | No disponible; variantes LoRA con rango reducido por SVD (r128, r64) |
| Idiomas soportados | No disponibles (instrucciones en lenguaje natural; ejemplos en ingles) |
| Licencia | krea-2-community-license (other) |
| Formato de pesos | safetensors |
| Tipo de artefacto | Adaptador LoRA (no modelo base) |
| Modelo base | krea/Krea-2-Raw |
| Tamano del repo | 8,3 GB |

## Arquitectura y entrenamiento

El adaptador se construye sobre Krea 2 Raw, un transformer de difusion multimodal (MMDiT) de flujo unico con 12,9B parametros. El LoRA no modifica la arquitectura del modelo base; se limita a anadir matrices de bajo rango que desvian la generacion. El entrenamiento utiliza doble condicionamiento: tokens VAE en contexto mas una codificacion anclada a imagen generada con Qwen3-VL, lo que obliga a usar el paquete de nodos ComfyUI-Krea2Edit para reproducir el esquema de condicionamiento con el que fue entrenado.

El codigo de entrenamiento es publico (krea2edit-trainer), una extension de ai-toolkit alineada geometricamente con los nodos y con requisitos de VRAM medidos en GPU de consumo (cifras no especificadas en la informacion disponible). La capacidad de intercambio de cabeza, cara, ojo y persona se entreno sobre el dataset MIT `change_eye_face_head_person` de stablellama. La version v1.2 incorpora una pasada de alta resolucion a 1024 de la que carecia v1.1. Las variantes r128 y r64 se obtuvieron por reduccion de rango SVD conservando, segun el autor, mas del 99% de la energia de los pesos. No se detalla el numero total de tokens de entrenamiento ni la composicion completa del dataset.

## Capacidades

- Edicion de imagen guiada por instrucciones en lenguaje natural, preservando el contenido no solicitado con near-pixel preservation.
- Reescenificado de personas con parecido: misma cara y vestuario, reiluminado a la nueva escena, con nuevos angulos y poses.
- Ediciones locales: recolorear, anadir, eliminar o reemplazar objetos y cambiar atributos o vestuario.
- Reemplazo con referencia ("replace the woman with a big orangutan"): el verbo de reemplazo esta entrenado y se mantiene la localidad.
- Restilizado global de imagen con composicion preservada.
- Edicion con dos entradas separadas (escena + persona); el orden es fijo: escena en image 1, persona en image 2.
- Hojas de referencia de personaje (creacion y uso).
- Intercambio de cabeza, cara, ojo y persona.
- Outpainting e inpainting.
- Probador virtual (virtual try-on).
- Composicion con LoRA del usuario (personaje, cuerpo, estilo) que se apilan y dirigen el prior.
- Geometria FIT (v1.2) para manejar automaticamente proporciones de aspecto distintas entre origen y salida.
- Dial de fidelidad `ref_boost` (v1.2) y parametro `grounding_px` para ajustar adherencia a la edicion frente a parecido.
- No se documentan capacidades de tool calling, agentes, audio ni vision fuera del pipeline de edicion.

## Casos de uso

- Reescenificado de personas para moda y producto: generar al mismo modelo en un mercadillo nocturno o estudio nuevo conservando rasgos, pecas y vestuario, gracias a la fidelidad de textura del LoRA y al dial `ref_boost` (~4 como punto de partida).
- Retoque fotografico profesional: recolorear, anadir o eliminar objetos y cambiar atributos manteniendo el resto del encuadre casi pixel a pixel, integrable en flujos de posproduccion sobre ComfyUI.
- Probador virtual en comercio electronico: superponer prendas sobre una persona de referencia mediante la capacidad de virtual try-on de v1.2, aunque el cambio de vestuario es intermitente y puede requerir rerolls.
- Inpainting y outpainting: restaurar zonas danadas o ampliar el lienzo de una imagen con generacion coherente, usando el modelo base Raw con receta CFG 3.0 para eliminaciones y borrados grandes.
- Creacion de hojas de referencia de personaje para animacion, videojuegos o comic: fijar el diseno de un personaje y reutilizarlo en distintas vistas y escenas.
- Postproduccion de efectos y doblaje visual: intercambio de cabeza, cara u ojo sobre planos existentes usando el dataset de stablellama como base, sujeto a las limitaciones de parecido geometrico.
- Composicion de escena con dos referencias: por ejemplo, situar a una persona junto a un tractor pasando escena como image 1 y persona como image 2, para catalogos o bocetos de direccion de arte.
- Integracion con estilos propios: apilar LoRA de personaje, cuerpo o estilo sobre el adaptador permite personalizar el prior, algo que los editores cerrados no ofrecen estructuralmente.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Al ser un LoRA sobre Krea 2 Raw (12,9B MMDiT), el coste de VRAM lo domina el modelo base; no se proporcionan cifras exactas de VRAM en la informacion disponible.
- Se mencionan requisitos de VRAM medidos en GPU de consumo en el repositorio del entrenador, pero sin cifras concretas.
- Variantes de bajo consumo: `..._v1_2_r128.safetensors` (0,91 GB) y `..._v1_2_r64.safetensors` (0,46 GB), reducidas por SVD con calidad casi identica, pensadas para equipos con VRAM limitada.
- GPU recomendadas: no disponibles (no se indica compatibilidad con A100, H100, RTX 4090 ni otras).
- Despliegue: requiere el paquete de nodos ComfyUI-Krea2Edit sobre ComfyUI; incluye dos workflows listos. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a un modelo de difusion de imagen).
- Latencia y throughput: no disponibles.
- Recomendaciones de generacion relevantes para el rendimiento: generar a 2MP o menos; en ediciones de dos personas con v1.1 preferir 1-1,5MP y reescalar despues; pasos 8-12 con Turbo y CFG 1.0, o 20 pasos con Raw y CFG 3.0 para eliminaciones.

## Comparativa con modelos similares

No se dispone de modelos comparables directos en la informacion proporcionada. La comparacion mas util es entre las propias variantes del adaptador:

| Version | Tamano | Notas |
|---|---|---|
| v1.2 (completa) | No especificado | Recomendada; pasada a 1024, FIT, `ref_boost`, reference-sheet, swap, inpainting, outpainting, try-on |
| v1.2 r128 | 0,91 GB | Reduccion SVD, >99% de energia retenida, calidad casi identica |
| v1.2 r64 | 0,46 GB | Reduccion SVD mas agresiva, para VRAM baja |
| v1.1 (+r128/r64) | No especificado | Sin pasada de alta resolucion; rango entrenado de `grounding_px` 384-768 |
| v1 (original) | No especificado | Rango entrenado de `grounding_px` 512-1536 |

Todas las variantes comparten el modelo base krea/Krea-2-Raw y la licencia krea-2-community-license. No se documentan alternativas de terceros con especificaciones verificables en la informacion disponible.

## Limitaciones y advertencias

- El parecido es fiel a la textura pero conservador en proporciones: rasgos geometricos muy distintivos (nariz, separacion ocular, longitud facial) regresan hacia proporciones tipicas; personas definidas por geometria pueden leerse como un "pariente cercano".
- En entradas de dos personas los vestuarios se mantienen distintos, pero las caras tienden a converger entre si. Solucion propuesta: encadenar inserciones de una sola referencia (colocar persona A y luego una segunda pasada con persona B).
- La eliminacion funciona pero no es fiable: usar siempre la receta Raw/CFG 3.0 y esperar re-renderizados ocasionales en lugar de borrados.
- Los cambios de vestuario son irregulares: a veces se aplican con limpieza y a veces no; conviene reroll o reformular.
- El orden de las dos entradas es fijo (escena en image 1, persona en image 2); intercambiarlas degrada bruscamente el resultado.
- Requiere obligatoriamente el paquete de nodos ComfyUI-Krea2Edit y la version de nodos v1.2 para aprovechar FIT y `ref_boost`; con nodos o pesos antiguos hay que igualar el aspecto de origen o la preservacion se degrada.
- Generar por encima de 2MP provoca bleeding o duplicacion; valores de `grounding_px` muy por encima del rango entrenado causan composiciones duplicadas ("double pictures").
- Es un fine-tune no oficial de Krea 2 Raw, sin afiliacion ni respaldo de Krea.ai, Inc.
- Licencia krea-2-community-license (other): revisar las condiciones en el enlace oficial antes de cualquier uso comercial, ya que se desconocen las restricciones concretas en la informacion disponible.
- Riesgo de alucinacion y de deriva de identidad no cuantificado; no hay benchmarks que permitan estimarlo.
- No se documentan idiomas soportados ni sesgos conocidos.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/Ziyaad30/krea2-identity-edit
- Modelo base Krea 2 Raw: https://huggingface.co/krea/Krea-2-Raw
- Paquete de nodos ComfyUI-Krea2Edit: https://github.com/lbouaraba/comfyui-krea2edit
- Codigo de entrenamiento (krea2edit-trainer): https://github.com/lbouaraba/krea2edit-trainer
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Dataset de swap (change_eye_face_head_person): https://huggingface.co/datasets/stablellama/change_eye_face_head_person
- Perfil de stablellama: https://huggingface.co/stablellama
- Apoyo al autor (Ko-fi): https://ko-fi.com/conradlocke
