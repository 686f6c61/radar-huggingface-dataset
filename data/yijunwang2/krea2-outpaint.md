# yijunwang2/krea2-outpaint

## Resumen

Krea 2 Registered Outpaint es un adaptador LoRA de rango 32 desarrollado por el usuario yijunwang2 que extiende imágenes hacia un lienzo mayor preservando los píxeles conocidos y registrando la imagen fuente en una posición explícita del lienzo de destino. Se entrena sobre Krea 2 Raw y está pensado para inferencia destilada de 8 pasos con Krea 2 Turbo, el modelo base de difusión de Krea. El repositorio ocupa 0,5 GB e incluye los pesos del LoRA, un pipeline de edición derivado de ostris/Krea2OstrisEdit y utilidades de preparación de lienzo y composición de costuras.

La innovación principal frente a un adaptador de referencia de imagen convencional es que los tokens latentes de la fuente reciben coordenadas rotatorias derivadas de su bounding box de destino, de modo que el denoiser razona sobre dónde pertenece la imagen conocida dentro del lienzo objetivo. Esto permite continuaciones coherentes de perspectiva, iluminación, textura y estructuras repetidas, con un contrato de entrada explícito que incluye imagen RGB, lienzo múltiplo de 16, bounding box en píxeles y prompt descriptivo de la composición completa.

El modelo es relevante para flujos de posproducción y ampliación de imágenes generadas, donde se necesita expandir un encuadre sin perder detalle del original. La licencia es la Krea 2 Community License, y el código del pipeline y helpers se distribuye bajo Apache-2.0. El autor mantiene una versión posterior, Krea 2 AnyPaint, para máscaras arbitrarias e inpainting/outpainting unificado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (rango 32) sobre modelo de difusión Krea 2 Turbo con flow matching; pipeline de edición con referencias registradas |
| Parametros totales | no disponible (adaptador LoRA de rango 32; el modelo base Krea 2 Turbo no declara tamaño en la información) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de imagen); margen de referencia codificado a 384 px de borde máximo |
| Tipos de cuantizacion | BF16 por defecto; el LoRA puede cargarse en runtimes cuantizados de Krea 2, pero la configuración es específica de cada runtime y no se incluye |
| Idiomas soportados | no disponible (modelo de imagen; prompts en lenguaje natural) |
| Licencia | krea-2-community-license (pesos); Apache-2.0 (pipeline y helpers) |
| Formato de pesos | safetensors (krea2_outpaint_rank32.safetensors) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 entrenado contra Krea 2 Raw, un modelo de difusión basado en flow matching. La inferencia del objetivo ruidoso sigue el flujo normal de Krea 2, mientras que la imagen fuente limpia se codifica por separado con el VAE como una secuencia de tokens distinta. Para un bounding box normalizado (x0, y0, x1, y1), las coordenadas de los tokens de la fuente se mapean a la rejilla latente del objetivo antes de la codificación de posición rotatoria (RoPE), lo que permite al denoiser razonar sobre la ubicación espacial de la imagen conocida en el lienzo final.

La atención de referencia está aislada: la K/V de referencia se calcula una sola vez y se reutiliza en todos los pasos de denoising, por lo que kv_cache=True y encode_reference_in_prompt=False forman parte del contrato del modelo y no son optimizaciones opcionales. El pipeline incluido se basa en ostris/Krea2OstrisEdit y añade la entrada reference_placements. La condición se codifica con un borde máximo de 384 píxeles y, tras la generación, los píxeles originales redimensionados se recomponen en la región conocida con un feather interior de 32 píxeles para conservar detalle y ocultar pequeñas diferencias de decodificación. No se detalla en la información disponible el volumen de tokens de entrenamiento ni la composición del dataset.

## Capacidades

- Outpainting registrado: extensión de una imagen hacia un lienzo mayor preservando los píxeles originales y respetando la posición indicada mediante bounding box.
- Continuación coherente de perspectiva, iluminación, textura y estructuras repetidas de la escena.
- Cambios de formato de lienzo: cuadrado a apaisado y cuadrado a vertical.
- Extensión anclada a la izquierda (hacia la derecha), anclada arriba (hacia abajo) y centrada (hacia ambos lados horizontales).
- Plan de dos pasadas en outpaint.py para cajas interiores arbitrarias, eligiendo primero la región en blanco intermedia más pequeña.
- Composición de costuras con feather de 32 píxeles para conservar el detalle de la fuente.
- Inferencia rápida en 8 pasos con guidance scale 0.0 sobre Krea 2 Turbo.
- No incluye tool calling, agentes, razonamiento multi-paso ni capacidades de texto, visión o audio más allá de la edición de imagen.

## Casos de uso

- Ampliación de encuadre en posproducción: dado un render o fotografía generada, se define un lienzo mayor y una caja de origen para extender la escena hacia la derecha, abajo o ambos lados, manteniendo la iluminación y la textura originales gracias a la atención de referencia aislada.
- Adaptación de formatos para redes sociales: conversión de una imagen cuadrada a apaisado o vertical rellenando las zonas nuevas con contenido coherente, usando el plan de dos pasadas cuando la caja de origen queda centrada.
- Creación de fondos y extensiones de escenario: a partir de un fragmento de escena fotorrealista, acuarela o 3D estilizado, generar la continuación del entorno para composiciones de mayor tamaño en ilustración y concept art.
- Preparación de assets para impresión o banners: extensión de una ilustración a un lienzo de mayor resolución con proporciones específicas, con el feather de 32 píxeles preservando el detalle del original en la zona conocida.
- Iteración de composición en pipelines de generación: integrar el LoRA en un flujo diffusers que primero genera una fuente con Krea 2 base y después aplica el outpaint para ampliar el resultado, como demuestran los ejemplos del repositorio con semillas fijas.
- Prototipado de edición de imagen con referencias registradas: usar pipeline.py y outpaint.py como base para experimentar con colocación explícita de referencias en el lienzo antes de adoptar la versión AnyPaint para máscaras arbitrarias.
- Ampliación de material sintético para datasets: extender imágenes generadas de forma totalmente sintética (sin IP de personajes reales ni semejanzas de personas) para aumentar la variedad de encuadres en corpus de entrenamiento visual.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta pruebas cualitativas en escenas fotorrealistas, acuarela y 3D estilizado, con resultados de la primera salida de 8 pasos por prompt, colocación y semilla fija (17072033 a 17072038), sin rerolls descartados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita; depende del runtime de Krea 2 Turbo en BF16 y del tamaño del lienzo de salida (los ejemplos usan 1024x1536).
- GPU recomendadas: no disponibles en la información; se indica instalar una build actual de PyTorch para la GPU del usuario.
- Compatibilidad con GPU de consumo: no confirmada en la información proporcionada.
- Opciones de despliegue: diffusers con transformers, accelerate, safetensors, huggingface_hub y pillow; el ejemplo usa BF16 por defecto. Los runtimes cuantizados de Krea 2 pueden cargar el LoRA, pero la configuración es específica de cada runtime y no se incluye.
- Latencia y throughput: no disponibles; la inferencia recomendada es de 8 pasos con guidance scale 0.0 y LoRA scale 1.0.
- Aviso de compatibilidad: el snippet automático de Diffusers de Hugging Face y los importadores LoRA ordinarios no son compatibles con este adaptador funcional; deben usarse example.py, pipeline.py y outpaint.py.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolución | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yijunwang2/krea2-outpaint | LoRA de outpainting registrado sobre Krea 2 Turbo | rango 32; base no disponible | referencia a 384 px de borde máximo; lienzo múltiplo de 16 | krea-2-community-license | Hugging Face, 1388 descargas, 48 likes |
| yijunwang2/krea2-anypaint | LoRA de inpainting/outpainting unificado con máscaras arbitrarias | no disponible | no disponible | no disponible en la información | Hugging Face (versión posterior recomendada por el autor) |
| ostris/Krea2OstrisEdit | Pipeline de edición Krea 2 con referencias | no disponible | no disponible | no disponible en la información | Hugging Face (base del pipeline incluido) |
| krea/Krea-2-Turbo | Modelo base de difusión destilado | no disponible | no disponible | krea-2-community-license | Hugging Face (modelo base) |

## Limitaciones y advertencias

- El adaptador no es compatible con el snippet automático de Diffusers ni con importadores LoRA convencionales; requiere el pipeline y helpers incluidos.
- Para una sola pasada, la caja de origen debe abarcar todo el ancho o todo el alto del lienzo; las cajas interiores arbitrarias necesitan el plan de dos pasadas de outpaint.py.
- El bounding box debe permanecer dentro del lienzo y preservar la relación de aspecto de la fuente; el lienzo debe tener ancho y alto múltiplos de 16.
- La condición de referencia se codifica a un borde máximo de 384 píxeles, lo que limita el detalle de la referencia en lienzos grandes.
- kv_cache=True y encode_reference_in_prompt=False son obligatorios por el diseño de atención de referencia aislada, no ajustes opcionales de velocidad.
- Los pesos usan la Krea 2 Community License, con posibles restricciones para uso comercial; deben revisarse los términos en el enlace de licencia antes de producción.
- No se documentan sesgos, tasas de alucinación visual ni cobertura idiomática; la model card solo incluye ejemplos totalmente sintéticos sin semejanzas de personas reales ni IP de personajes existentes.
- La cuantización es posible pero no está soportada de forma empaquetada; cada runtime requiere configuración propia.
- Existe una versión posterior (Krea 2 AnyPaint) recomendada por el autor para máscaras arbitrarias, regiones desconectadas y ediciones que cruzan bordes.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yijunwang2/krea2-outpaint
- Versión posterior AnyPaint: https://huggingface.co/yijunwang2/krea2-anypaint
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Pipeline de edición base: https://huggingface.co/ostris/Krea2OstrisEdit
- Licencia Krea 2: https://krea.ai/krea-2-licensing
