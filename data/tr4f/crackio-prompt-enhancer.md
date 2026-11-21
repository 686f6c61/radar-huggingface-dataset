# TR4F/crackio-prompt-enhancer

## Resumen

Crackio's prompt enhancer es un adaptador LoRA de bajo rango entrenado sobre el modelo multimodal LiquidAI/LFM3-VL-2B, desarrollado por el usuario TR4F (RafalOfficial) para el estudio de IA open source Crackio, construido sobre ComfyUI. Su funcion es transformar peticiones breves o mal escritas en prompts completos y descriptivos para modelos de generacion de imagen y video, manteniendo intacto el contenido semantico original: no anade objetos, personas, marcas ni texto, y se limita a describir encuadre, iluminacion, tonos y atmosfera.

El adaptador resuelve un problema concreto de los flujos de trabajo text-to-image y text-to-video: la brecha entre lo que el usuario escribe ("a fox in the snow") y lo que los modelos de difusion necesitan para producir resultados consistentes. Frente a soluciones basadas en API en la nube, este LoRA se ejecuta en la GPU local en aproximadamente dos segundos por prompt, lo que lo hace adecuado para entornos con requisitos de privacidad o sin conectividad.

El modelo base es un transformer multimodal de 2.000 millones de parametros con capacidades de vision-lenguaje, y el LoRA anade 131.788.272 bytes de pesos (unos 0,1 GB en el repositorio). El entrenamiento se realizo sobre 6.041 pares peticion-prompt con 1.512 pasos en una unica RTX 3090, alcanzando una perdida de validacion de 0,79. La licencia es la LFM Open License v1.0, que permite uso comercial solo por debajo de 10 millones de dolares de facturacion anual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer multimodal (LiquidAI/LFM3-VL-2B) |
| Parametros totales | No disponible para el LoRA; modelo base de 2B parametros |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Entrada: en y otros idiomas (traduce a ingles); salida: solo en |
| Licencia | LFM Open License v1.0 (uso comercial permitido por debajo de 10 M USD de facturacion anual) |
| Formato de pesos | safetensors (`lfm3-vl-2b-lora-enhance.safetensors`, 131.788.272 bytes) |
| Tamano del repositorio | 0,1 GB |
| Modelo base | LiquidAI/LFM3-VL-2B |
| Pasos de entrenamiento | 1.512 en una RTX 3090 |
| Perdida de validacion | 0,79 |

## Arquitectura y entrenamiento

El adaptador es un LoRA aplicado sobre LFM3-VL-2B de Liquid AI, un modelo multimodal vision-lenguaje de 2.000 millones de parametros. El LoRA modifica el comportamiento generativo del modelo base para especializarlo en una unica tarea: reescribir peticiones breves como prompts descriptivos para generacion visual. El repositorio incluye un fichero `system.txt` con la instruccion exacta con la que se entreno el adaptador, que debe enviarse como system prompt para obtener el comportamiento esperado.

El conjunto de entrenamiento consta de 6.041 pares de peticion y prompt resultante. Las peticiones cubren fotografia, ilustracion, anime, cartoon, pixel art, logos, 3D, video, peticiones de una sola palabra, prompts ya completos, errores tipograficos y otros idiomas. Las respuestas fueron generadas por Gemini siguiendo una regla escrita (la misma de `system.txt`) y posteriormente validadas mediante scripts que detectaban anadidos indebidos, detalles omitidos y palabras prohibidas; los casos fallidos se descartaron o reescribieron. El entrenamiento se ejecuto durante 1.512 pasos en una unica RTX 3090.

La evaluacion se realizo con 270 peticiones no vistas, calificadas a ciegas por seis evaluadores contra la regla de entrenamiento (conservar todos los detalles, no anadir nada, describir solo el aspecto visual). El modelo obtuvo 97,3 sobre 100 en las 270 peticiones, y 95,7 en las 110 peticiones compartidas con la version anterior, que habia obtenido 72,7 en ese mismo subconjunto.

## Capacidades

- Generacion de prompts descriptivos para modelos de imagen y video a partir de peticiones breves o incompletas.
- Preservacion integra del contenido original: mantiene cada detalle en las palabras del usuario, sin inventar objetos, personas, lugares, texto, marcas, ropa ni edad.
- Descripcion del aspecto visual: encuadre y angulo, iluminacion y hora del dia, tonos y atmosfera.
- Traduccion de otros idiomas al ingles y correccion de errores tipograficos.
- Deteccion de prompts ya detallados, que devuelve sin cambios.
- Para video, anade un unico comportamiento de camara y, si no se especifica movimiento, solo el movimiento natural de lo nombrado.
- Soporte de imagenes de referencia: se listan sobre la peticion como descripciones breves (`image 1: a woman in a red coat`) y el LoRA las referencia como "the person in image 1".
- Salida exclusivamente en ingles.
- No realiza juicio, captioning ni conversacion; no incluye filtro de seguridad propio mas alla del del modelo base.

## Casos de uso

- Generacion de imagenes en produccion con ComfyUI: el LoRA se integra como add-on del estudio Crackio (unos 4 GB con el modelo base) y se activa con un interruptor junto a cualquier prompt, anadiendo descripcion visual sin alterar el contenido solicitado por el usuario.
- Creacion de video generativo: al iniciar la peticion con `video of `, el adaptador anade un comportamiento de camara y el movimiento natural de los elementos nombrados, adecuado para clips cortos en pipelines text-to-video.
- Estandarizacion de prompts en equipos creativos: convierte peticiones heterogeneas y con errores tipograficos en prompts consistentes en ingles, lo que reduce la variabilidad entre operadores y facilita la reproducibilidad de resultados.
- Flujos de trabajo con privacidad de datos: al ejecutarse en GPU local en aproximadamente dos segundos por prompt, evita enviar las peticiones a APIs en la nube, adecuado para entornos con datos sensibles o sin conectividad.
- Generacion de ilustracion y estilos especificos: el entrenamiento cubre fotografia, ilustracion, anime, cartoon, pixel art, logos y 3D, lo que permite usar el adaptador como capa de preprocesado para distintas familias de modelos de difusion.
- Uso con imagenes de referencia: en flujos de edicion o generacion condicionada, el LoRA integra descripciones de las imagenes de referencia en el prompt final, permitiendo referirse a sujetos concretos ("the person in image 1") sin reescribir la peticion.
- Traduccion y normalizacion de peticiones multilingues: corrige errores y traduce peticiones en otros idiomas al ingles, util para equipos internacionales que trabajan con modelos de difusion que solo aceptan prompts en ingles.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Evaluacion ciega en 270 peticiones no vistas (6 evaluadores) | 97,3 / 100 |
| Evaluacion en 110 peticiones compartidas con la version anterior | 95,7 / 100 (version anterior: 72,7 / 100) |
| Subpuntuacion en otros idiomas | 87 / 100 |
| Perdida de validacion (held-out loss) | 0,79 |
| Latencia por prompt | Aproximadamente 2 segundos en GPU local |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible, dado que el adaptador esta especializado en una unica tarea de reescritura de prompts y no en razonamiento general.

## Requisitos de hardware

- VRAM estimada: no disponible de forma explicita; el paquete completo con el modelo base ocupa aproximadamente 4 GB, por lo que se estima un requisito de VRAM en el rango de 4-6 GB segun cuantizacion del modelo base.
- GPU de entrenamiento documentada: una RTX 3090.
- Cabe en GPU de consumo: si, segun el tamano del paquete (unos 4 GB con el modelo base); el modelo base de 2B parametros es compatible con GPUs consumer de gama media-alta.
- Opciones de despliegue: integracion nativa en Crackio (ComfyUI); en otros entornos, cargar LFM3-VL-2B con el LoRA y enviar `system.txt` como system prompt. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia: aproximadamente 2 segundos por prompt en GPU local.
- Throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Crackio's prompt enhancer (este LoRA) | 2B (base) + LoRA de 0,1 GB | No disponible | Reescritura de prompts para imagen/video | LFM Open License v1.0 (comercial < 10 M USD) | Hugging Face, integrado en Crackio |
| LFM3-VL-2B (modelo base) | 2B | No disponible | Vision-lenguaje general | LFM Open License v1.0 | Hugging Face |
| Alternativas de prompt enhancement basadas en API | No disponible | No disponible | Reescritura de prompts | Propietaria | Servicios en la nube |

No se dispone de datos de benchmarks comparativos con otras soluciones de mejora de prompts en la informacion proporcionada. La comparativa se limita a las diferencias de licencia, ejecucion local frente a API y especializacion de tarea.

## Limitaciones y advertencias

- La puntuacion de evaluacion mide el cumplimiento de la regla de reescritura, no la calidad estetica de las imagenes resultantes; en pruebas con FLUX 3 Klein los prompts mejorados fueron fieles, pero las imagenes no fueron claramente mejores que las generadas con el prompt corto.
- El estilo tiende a ser quieto, apagado y distante ("quiet, muted and distant").
- Los idiomas distintos del ingles son el punto mas debil (87 sobre 100): puede mistraducir alguna palabra, por lo que conviene revisar el resultado de peticiones no inglesas.
- Las peticiones de una sola palabra generan respuestas planas, y aproximadamente una de cada ocho frases descriptivas resulta rigida.
- La salida es exclusivamente en ingles.
- El adaptador solo escribe prompts: no evalua, no genera captioning ni mantiene conversacion, y no incluye filtro de seguridad propio mas alla del del modelo base.
- Licencia LFM Open License v1.0: no es una licencia OSI; el uso comercial solo se permite por debajo de 10 millones de dolares de facturacion anual. Es necesario revisar la licencia del modelo base antes de usarlo en un producto.
- El adaptador es un derivado de LFM3-VL-2B y hereda sus condiciones de licencia.
- No esta afiliado a Liquid AI ni a Google.
- Riesgo de alucinacion: el diseno del entrenamiento lo mitiga explicitamente (validacion por scripts contra anadidos), pero no se documentan garantias formales.
- Sesgos conocidos: no disponibles en la informacion proporcionada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TR4F/crackio-prompt-enhancer
- Modelo base LFM3-VL-2B: https://huggingface.co/LiquidAI/LFM3-VL-2B
- Repositorio de Crackio: https://github.com/RafalOfficial/Crackio
