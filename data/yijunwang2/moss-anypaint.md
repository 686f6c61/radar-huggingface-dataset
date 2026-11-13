# yijunwang2/moss-anypaint

## Resumen

MOSS AnyPaint es un adaptador LoRA de edición de imágenes desarrollado por el usuario yijunwang2 sobre el modelo base OpenMOSS-Team/MOSS-Image-Base. Su función es habilitar inpainting, outpainting y edición de imágenes con máscaras arbitrarias: permite insertar, reemplazar o reestilizar objetos y regiones internas, extender el lienzo por cualquier lado y manejar máscaras desconectadas, estructuras estrechas y ediciones mixtas que cruzan el borde de la imagen original. El adaptador seleccionado corresponde al paso 4303, con rango 32, alpha 32 y precisión BF16.

El modelo se distribuye como un fichero LoRA en formato safetensors (0,2 GB de repositorio) y se acompaña de un adaptador comunitario "Base 8-step DMD2" fijado para inferencia en ocho pasos. Está pensado para integrarse en flujos de trabajo de ComfyUI mediante nodos y workflow propios, o bien usarse con los scripts `pipeline.py`, `anypaint.py` y `example.py` incluidos. No es un cargador LoRA de texto-a-imagen convencional: implementa una referencia limpia registrada y restricciones de región conocida que requieren su propio runtime de inferencia.

La relevancia actual del modelo reside en su enfoque de máscara arbitraria sobre un modelo base de imagen open source con licencia Apache 2.0, lo que facilita su uso comercial y su integración en pipelines de edición de imágenes. Soporta prompts en inglés y chino, y su diseño está orientado a tareas de edición controlada donde la fidelidad de la región no enmascarada es crítica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre MOSS-Image-Base; no se especifica la arquitectura interna del modelo base |
| Parametros totales | no disponible (adaptador LoRA de rango 32/alpha 32; el modelo base no reporta cifra en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 para el adaptador; no se detallan otras cuantizaciones |
| Idiomas soportados | en, zh |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (LoRA `moss_anypaint_rank32.safetensors`), librería PyTorch |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA de rango 32 y alpha 32 entrenado en BF16 sobre el modelo base OpenMOSS-Team/MOSS-Image-Base. La información disponible no detalla el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO. El checkpoint publicado corresponde al paso 4303 de entrenamiento, seleccionado entre las variantes disponibles.

La innovación técnica principal es la implementación de una referencia limpia registrada y restricciones de región conocida dentro del runtime de inferencia, lo que permite preservar la zona no enmascarada de la imagen de entrada. El adaptador se combina con un adaptador comunitario "Base 8-step DMD2" fijado para realizar inferencia en ocho pasos, lo que reduce el coste computacional frente a muestreos más largos. El repositorio incluye scripts propios (`pipeline.py`, `anypaint.py`, `example.py`) y nodos de ComfyUI que implementan este runtime; un cargador LoRA de texto-a-imagen estándar no es suficiente para reproducir el comportamiento.

## Capacidades

- Inpainting interno con máscaras arbitrarias: inserción, reemplazo o reestilización de objetos y regiones dentro de la imagen.
- Outpainting: extensión del lienzo por cualquier lado, respetando la colocación de la fuente en el lienzo de salida.
- Manejo de máscaras desconectadas y estructuras estrechas.
- Ediciones mixtas que cruzan el borde de la imagen original.
- Runtime de inferencia compartido entre el ejemplo de Hugging Face y los nodos estándar IMAGE/MASK de ComfyUI.
- Soporte de prompts en inglés y chino.
- Inferencia en ocho pasos mediante el adaptador DMD2 fijado.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión general, audio ni modo thinking; el modelo es específicamente de edición de imágenes.

## Casos de uso

- Retoque fotográfico de producto: sustituir o reestilizar un objeto sobre una mesa manteniendo la iluminación y la perspectiva del resto de la escena, usando máscaras internas y el prompt descriptivo del nuevo objeto.
- Extensión de lienzo para formatos de impresión: ampliar una ilustración o fotografía por cualquiera de los lados para adaptarla a relaciones de aspecto distintas, aprovechando el outpainting con colocación de la fuente en el lienzo de salida.
- Edición de retratos en estudio: cambiar accesorios, ropa o peinado en una región concreta del retrato sin alterar el rostro ni el fondo, gracias a las restricciones de región conocida.
- Restauración de ilustraciones botánicas o naturalistas: rellenar zonas desconectadas (por ejemplo, flores o insectos separados) manteniendo la textura de papel y el estilo pictórico original.
- Creación de variaciones de paisajes: insertar elementos fantásticos o atmosféricos en regiones amplias de una fotografía de paisaje, conservando la coherencia de luz y perspectiva del resto del encuadre.
- Integración en ComfyUI para pipelines de edición por lotes: usar los nodos IMAGE/MASK para aplicar ediciones con máscaras generadas automáticamente sobre colecciones de imágenes.
- Prototipado de edición asistida en herramientas gráficas: combinar el runtime de ocho pasos con los scripts de ejemplo para construir interfaces de edición interactiva con latencia reducida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card incluye una galería cualitativa de 12 casos generados con semilla 2026 y los mismos pesos del paso 4303 (edición interna de fotografía, outpainting de acuarela, outpainting 3D, retrato mixto, botánica con máscaras desconectadas, producto con estructura estrecha, paisaje complejo y accesorios femeninos), pero no se aportan métricas cuantitativas como FID, CLIP score, SSIM ni comparaciones numéricas con otros modelos.

## Requisitos de hardware

- El adaptador LoRA ocupa aproximadamente 0,2 GB en disco; los requisitos de VRAM dependen del modelo base MOSS-Image-Base, cuyos detalles de tamaño no se especifican en la información disponible.
- No se indican GPU recomendadas ni modelos concretos (A100, H100, RTX 4090, etc.) en la documentación proporcionada.
- No se confirma si el modelo cabe en GPU de consumo; depende del modelo base, no documentado.
- Opciones de despliegue: scripts PyTorch incluidos (`pipeline.py`, `anypaint.py`, `example.py`) y nodos de ComfyUI con workflow propio. No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no son aplicables a un modelo de edición de imágenes de este tipo.
- No se proporcionan datos de latencia ni throughput; únicamente se indica que la inferencia se realiza en ocho pasos con el adaptador DMD2.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en la documentación proporcionada. No se han publicado comparaciones con otros adaptadores de inpainting u outpainting (por ejemplo, variantes de Stable Diffusion Inpaint, ControlNet o adaptadores similares) en la información disponible.

## Limitaciones y advertencias

- Las capacidades descritas no garantizan conteos exactos, identidad ni geometría precisos; la propia model card advierte de esta limitación.
- No es posible usar un cargador LoRA de texto-a-imagen convencional: se requiere el runtime específico con referencia limpia registrada y restricciones de región conocida.
- El adaptador está fijado al paso 4303 y al adaptador DMD2 de ocho pasos; otros ajustes pueden degradar los resultados.
- Idiomas soportados limitados a inglés y chino para los prompts.
- No se documentan sesgos conocidos, riesgo de alucinación específico ni restricciones adicionales de licencia más allá de Apache 2.0, que permite uso comercial con atribución y aviso de cambios.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica una validación comunitaria muy limitada.
- Las imágenes de la galería de demostración son fuentes sintéticas generadas con Krea, no fotografías reales, por lo que el rendimiento en dominios reales no está verificado en la información disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yijunwang2/moss-anypaint
- LoRA: `moss_anypaint_rank32.safetensors` (incluido en el repositorio)
- Nodos y workflow de ComfyUI: https://github.com/alexw5702-afk/moss-anypaint
- Releases de ComfyUI: https://github.com/alexw5702-afk/moss-anypaint/releases
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
