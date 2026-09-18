# Wouke82/yana

## Resumen
Wouke82/yana es un adaptador LoRA de personalización (DreamBooth-LoRA) para el modelo de generación de imágenes Krea 2, publicado por el usuario Wouke82 en Hugging Face. No es un modelo de lenguaje: se trata de un complemento de bajo rango que se carga sobre un modelo base de difusión texto-a-imagen para introducir un concepto concreto, invocado mediante el token disparador `Yana`. El autor indica que fue entrenado sobre Krea 2 RAW y que las muestras incluidas se generaron sobre Krea 2 Turbo en 8 pasos de inferencia.

El modelo resuelve el problema clásico de la personalización de modelos generativos: conseguir representaciones consistentes de un sujeto o estilo concreto sin reentrenar el modelo base. Al ser un LoRA, el adaptador ocupa poco espacio (el repositorio completo pesa 1,7 GB, incluyendo muestras) y se puede cargar y descargar dinámicamente en pipelines de `diffusers`, lo que permite combinar varios conceptos sobre la misma instancia del modelo base.

La relevancia de esta ficha es limitada pero ilustrativa: se trata de un repositorio con 0 descargas y 0 likes en el momento de la consulta, sin model card extensa ni evaluación publicada. Resulta útil como ejemplo del flujo de trabajo DreamBooth-LoRA sobre la familia Krea 2 y como caso de estudio de los riesgos asociados a la personalización de rostros humanos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (Low-Rank Adaptation) sobre un modelo de difusión texto-a-imagen (Krea 2). Rango, alpha y arquitectura interna del modelo base: no disponibles |
| Parametros totales | No disponible. El repositorio pesa 1,7 GB (incluye imagenes de muestra); no se publica el numero de parametros del adaptador ni del modelo base |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica en el sentido de LLM. Longitud maxima de prompt del codificador de texto del modelo base: no disponible |
| Tipos de cuantizacion | No disponible. No se documentan variantes GGUF, ONNX, fp8 ni cuantizaciones del adaptador |
| Idiomas soportados | No disponible. El unico prompt documentado esta en ingles |
| Licencia | Apache 2.0 (declarada por el autor en los metadatos y en la model card) |
| Formato de pesos | No confirmado explicitamente. La carga se realiza mediante `diffusers.load_lora_weights`, compatible con pesos en formato safetensors/bin |

## Arquitectura y entrenamiento
El artefacto es un adaptador LoRA, una tecnica de ajuste eficiente que congela los pesos del modelo base e inserta matrices de bajo rango en determinadas capas. La model card describe el entrenamiento como un DreamBooth-LoRA para Krea 2, entrenado sobre Krea 2 RAW y validado sobre Krea 2 Turbo. El concepto se activa con el token `Yana`, que actua como `instance_prompt`. No se especifican el rango, el alpha, la tasa de aprendizaje, el numero de pasos, el numero de imagenes del dataset ni la resolucion de entrenamiento.

No hay informacion sobre la composicion del dataset, si se aplicaron tecnicas de regularizacion o prior preservation, ni sobre el numero de tokens de entrenamiento. Tampoco se documenta ningun tipo de ajuste por preferencias (RLHF, DPO u otros), algo por otra parte poco habitual en modelos de difusion. La innovacion practica del repositorio es la compatibilidad declarada con Krea 2 Turbo a 8 pasos y `guidance_scale=0.0`, es decir, sin classifier-free guidance, lo que apunta a un modelo base destilado para inferencia rapida y a un adaptador entrenado de forma compatible con ese regimen.

## Capacidades
- Generacion de imagenes texto-a-imagen con un concepto personalizado activado por el token `Yana`.
- Personalizacion de sujeto o estilo: permite representar de forma consistente el concepto aprendido en distintas escenas y composiciones.
- Control mediante prompt en lenguaje natural, incluyendo indicaciones de encuadre, pose y entorno, tal como muestra el ejemplo publicado ("A woman in a bikini sitting on the edge of a swimming pool. Full body visible. random instagram pose. Clear blue water. Yana").
- Inferencia rapida en el modelo base Turbo: el ejemplo documentado usa 8 pasos y `guidance_scale=0.0`.
- Integracion programatica mediante `diffusers` y `Krea2Pipeline`, con carga del adaptador en runtime mediante `load_lora_weights`.
- No dispone de soporte de tool calling, function calling ni agentes.
- No dispone de razonamiento multi-paso, modo thinking, vision ni audio.
- No genera texto ni codigo.
- Capacidades multilingues: no documentadas; el unico ejemplo de prompt esta en ingles.
- No se documenta compatibilidad con otros LoRA simultaneos ni pesos de fusion.

## Casos de uso
- Creacion de personajes consistentes para narrativa visual: el adaptador permite generar al mismo sujeto en multiples escenas e ilustraciones manteniendo rasgos reconocibles, util para comics, storyboards o novelas visuales.
- Prototipado rapido de concepto: al funcionar sobre Krea 2 Turbo con 8 pasos, permite iterar bocetos de composicion en pocos segundos por imagen y refinar despues con el modelo RAW.
- Contenido para redes sociales: el propio ejemplo de la model card (pose tipo Instagram, cuerpo completo) corresponde a este uso, generando variaciones de una misma figura para publicaciones seriadas.
- Generacion de modelos virtuales para moda o producto: se puede insertar el concepto en escenas de catalogo o probador virtual, siempre que se resuelvan los derechos de imagen del sujeto representado.
- Investigacion sobre personalizacion con LoRA: sirve como caso de estudio para medir sobreajuste al trigger, olvido catastrofico del modelo base y comportamiento al fusionar adaptadores.
- Automatizacion por lotes en pipelines Python: el adaptador se carga con `diffusers` en un script, lo que facilita la generacion desatendida de conjuntos de imagenes con parametros fijos de semilla y prompt.
- Pruebas de estilos y encuadres sobre un modelo base destilado: util para comparar la calidad a 8 pasos frente a configuraciones con mas pasos y guidance activo.
- Demostraciones y ejemplos didacticos de DreamBooth-LoRA en entornos docentes o talleres tecnicos.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. No hay FID, CLIP score, metricas de similitud de identidad, comparativas de calidad ni evaluaciones humanas. El repositorio registra 0 descargas y 0 likes en el momento de la consulta, por lo que tampoco existe validacion por parte de la comunidad.

## Requisitos de hardware
- El adaptador LoRA en si anade un coste de VRAM marginal; la VRAM total la determina el modelo base Krea 2, cuyas especificaciones no estan disponibles en la informacion proporcionada.
- El ejemplo oficial usa `torch_dtype=torch.bfloat16`, lo que requiere GPUs con soporte nativo de bfloat16 (familia Ampere en adelante: A100, H100, RTX 30xx y 40xx, entre otras).
- No se indica si cabe en GPU de consumo. Depende por completo del modelo base, no del adaptador.
- Opciones de despliegue documentadas: `diffusers` con `Krea2Pipeline` y `load_lora_weights`. Otras rutas (ComfyUI, Automatic1111, vLLM, TGI, llama.cpp) no estan confirmadas para este modelo.
- Latencia y throughput: no disponibles. Como referencia cualitativa, el ejemplo declarado usa 8 pasos de inferencia sobre Krea 2 Turbo, lo que reduce el coste frente a configuraciones de 20 a 50 pasos tipicas de modelos no destilados.
- Tamano del repositorio: 1,7 GB, aunque el peso real de los pesos LoRA no se desglosa en la informacion disponible.

## Comparativa con modelos similares
No se dispone de datos de benchmarks ni de especificaciones de modelos comparables en la informacion proporcionada. La busqueda web realizada no devolvio resultados relacionados con este modelo ni con LoRAs equivalentes para Krea 2. La unica comparacion posible es con los dos modelos base citados en la model card, y para ambos faltan los parametros clave.

| Modelo | Tipo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| Wouke82/yana | LoRA de personalizacion | Objeto de la ficha | No disponible | No aplica | Apache 2.0 | Publico en Hugging Face, 0 descargas |
| krea/Krea-2-Raw | Modelo base de difusion | Base de entrenamiento | No disponible | No disponible | No disponible | Publico en Hugging Face (referenciado) |
| krea/Krea-2-Turbo | Modelo base de difusion destilado | Base de inferencia en los ejemplos | No disponible | No disponible | No disponible | Publico en Hugging Face (referenciado) |

## Limitaciones y advertencias
- El adaptador reproduce la apariencia de una persona concreta identificada por el token `Yana`. Esto implica riesgos de suplantacion de identidad, deepfakes y uso no consentido de la imagen de una persona. No se aporta ninguna prueba de consentimiento ni informacion sobre el origen de las imagenes de entrenamiento.
- El prompt de ejemplo incluido en la model card es de caracter sugerente (mujer en bikini), lo que apunta a un posible sesgo en el dataset de entrenamiento y a un uso orientado a la cosificacion corporal.
- No hay informacion sobre la composicion del dataset, por lo que no se pueden evaluar sesgos demograficos, etnicos o de representacion corporal.
- Riesgo de sobreajuste al concepto entrenado: el token `Yana` puede contaminar generaciones no deseadas y degradar la diversidad de las salidas.
- Riesgo de alucinacion visual: como cualquier modelo de difusion, puede producir anatomia incorrecta, artefactos en manos, texto ilegible y composiciones fisicamente imposibles.
- La licencia Apache 2.0 la declara el autor del LoRA, pero el modelo base Krea 2 puede estar sujeto a su propia licencia, que podria imponer restricciones adicionales al uso comercial. Es imprescindible verificar las condiciones de krea/Krea-2-Raw y krea/Krea-2-Turbo antes de cualquier despliegue en produccion.
- Sin evaluacion ni benchmarks: no hay evidencia objetiva de calidad, fidelidad al concepto o robustez frente a distintos prompts.
- Repositorio sin traccion (0 descargas, 0 likes) y sin historial de mantenimiento; el autor no ofrece garantias de soporte.
- Los metadatos indican una fecha de creacion de 2026-09-17, posterior a la fecha habitual de publicacion, lo que conviene verificar antes de tratarlo como un artefacto estable.
- Idiomas no documentados: no hay garantia de que los prompts en castellano u otros idiomas funcionen correctamente con el token disparador.
- No es un modelo de lenguaje: no soporta tool calling, agentes, razonamiento ni generacion de codigo, por lo que no debe evaluarse con criterios de LLM.
- Si se combina con otros LoRA, no hay informacion sobre pesos de fusion recomendados ni sobre posibles interferencias.

## Enlaces
- Modelo en Hugging Face: https://huggingface.co/Wouke82/yana
- Modelo base de entrenamiento (referenciado): https://huggingface.co/krea/Krea-2-Raw
- Modelo base de inferencia (referenciado): https://huggingface.co/krea/Krea-2-Turbo
- La busqueda web realizada no devolvio ningun resultado relevante sobre este modelo: los enlaces obtenidos corresponden a cuestionarios de Bing y no guardan relacion con la ficha.
