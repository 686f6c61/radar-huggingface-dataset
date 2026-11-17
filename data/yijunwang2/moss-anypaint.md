# yijunwang2/moss-anypaint

## Resumen

MOSS AnyPaint es un adaptador LoRA de edición de imágenes desarrollado por el usuario yijunwang2 sobre el modelo base OpenMOSS-Team/MOSS-Image-Base. Su función es habilitar inpainting, outpainting y edición de imágenes con máscaras de forma arbitraria en una sola pasada, cubriendo casos que van desde ediciones internas del lienzo hasta la extensión del mismo, regiones desconectadas, estructuras estrechas y máscaras mixtas que cruzan el borde de la imagen original. Se distribuye como un adaptador funcional (no como un LoRA convencional) y requiere el uso de los scripts incluidos en el repositorio, ya que los importadores estándar de LoRA y el snippet autogenerado de Diffusers no son compatibles.

El modelo resuelve un problema práctico en pipelines de edición: la mayoría de soluciones de inpainting asumen máscaras rectangulares o ediciones dentro del lienzo, mientras que AnyPaint unifica inpainting y outpainting bajo un mismo contrato de entrada (píxeles blancos se generan, píxeles negros se preservan, y todo lo que queda fuera de la fuente colocada se marca como generado). Esto simplifica la integración en herramientas como ComfyUI, para la que el autor publica nodos específicos.

Es relevante ahora porque permite edición de imágenes de alta calidad con preservación estricta de las regiones no enmascaradas mediante restricciones latentes alineadas por timestep, y porque su licencia Apache 2.0 facilita el uso comercial. El repositorio pesa 0,3 GB y se apoya en el ecosistema Diffusers.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador) sobre MOSS-Image-Base, pipeline image-to-image con Diffusers |
| Parámetros totales | no disponible (adaptador LoRA rank 32; el modelo base no reporta cifra en la información) |
| Parámetros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (modelo de imagen, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (moss_anypaint_rank32.safetensors) |

## Arquitectura y entrenamiento

MOSS AnyPaint es un adaptador LoRA de rango 32 que se aplica sobre el modelo de difusión MOSS-Image-Base. El adaptador no modifica la arquitectura del backbone; en su lugar, introduce capas de bajo rango entrenadas específicamente para la tarea de edición con máscaras arbitrarias. La innovación principal es el mecanismo de preservación de regiones no enmascaradas mediante restricciones latentes alineadas por timestep, que mantiene los píxeles negros de la máscara intactos mientras genera los blancos.

El contrato de entrada es unificado: los píxeles blancos de la máscara se generan o editan, los negros se preservan, y el helper marca automáticamente como generado todo píxel que queda fuera de la fuente colocada, de modo que inpainting y outpainting comparten la misma interfaz. No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO; la model card no detalla el proceso de entrenamiento más allá de la naturaleza del adaptador.

## Capacidades

- Edición de imágenes con máscaras de forma arbitraria y trazos a mano alzada.
- Inpainting dentro del mismo lienzo.
- Outpainting en una sola pasada hacia un lienzo mayor.
- Edición de múltiples regiones desconectadas en una misma petición.
- Manejo de máscaras estrechas, curvas y que cruzan el borde de la fuente.
- Combinación de inpainting y outpainting en una sola solicitud.
- Preservación de las regiones no enmascaradas mediante restricciones latentes alineadas por timestep.
- Integración con ComfyUI mediante nodos específicos publicados por el autor.
- Soporte de idiomas inglés y chino en los prompts.

## Casos de uso

- Restauración y retoque fotográfico: eliminar objetos no deseados o rellenar huecos en una fotografía usando máscaras de forma libre, aprovechando la preservación estricta de las zonas no enmascaradas para no alterar el resto de la imagen.
- Extensión de lienzo para composición editorial: ampliar una imagen hacia arriba, abajo o los lados en una sola pasada para adaptar el encuadre a formatos de revista o redes sociales, con continuidad natural del contenido generado.
- Edición de producto en e-commerce: cambiar el color o el acabado de un artículo manteniendo intacto el fondo y la iluminación, gracias al inpainting con máscaras precisas sobre regiones concretas.
- Sustitución de vistas en interiores: reemplazar la vista de una ventana o un espejo por otra escena mediante una máscara interna, preservando el marco y la estructura de la habitación.
- Inserción de elementos desconectados: añadir objetos como insectos, plantas o accesorios en varias regiones separadas de la imagen en una única petición, útil en ilustración botánica o científica.
- Edición mixta para personajes: combinar el cambio de vestuario (inpainting) con la extensión del encuadre para un cuerpo completo (outpainting) en una sola operación, como muestra el caso de retrato de la model card.
- Integración en flujos de ComfyUI: incorporar los nodos publicados por el autor en pipelines de generación y edición para producción de contenido visual iterativo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; depende del modelo base MOSS-Image-Base, no del adaptador (0,3 GB de repo).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: Diffusers con los scripts incluidos (`example.py`, `pipeline.py`, `anypaint.py`); nodos de ComfyUI publicados por el autor. El snippet autogenerado de Diffusers y los importadores estándar de LoRA no son compatibles.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / máscara | Licencia | Disponibilidad |
|---|---|---|---|---|
| MOSS AnyPaint | LoRA sobre MOSS-Image-Base | Máscaras arbitrarias, inpainting + outpainting en una pasada | apache-2.0 | Hugging Face, ComfyUI |
| Krea 2 AnyPaint | Adaptador equivalente (referenciado en la model card) | Showcase compartido con MOSS AnyPaint | no disponible | no disponible |
| MOSS-Image-Base | Modelo base de difusión | Sin adaptador de edición específico | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- El adaptador no es compatible con el snippet autogenerado de Diffusers ni con importadores estándar de LoRA; es obligatorio usar los scripts incluidos.
- El contrato de máscara es estricto: píxeles blancos se generan, negros se preservan; un uso incorrecto de la máscara produce resultados no deseados.
- Los idiomas soportados para prompts son inglés y chino; no se garantiza un rendimiento equivalente en castellano.
- No se dispone de información sobre sesgos del modelo base ni sobre tasas de alucinación visual.
- Aunque la licencia es Apache 2.0, el uso comercial debe verificarse también contra la licencia del modelo base MOSS-Image-Base, que no se detalla en la información.
- Los showcases son imágenes sintéticas generadas con el modelo base sin modificar; no se aportan métricas cuantitativas de calidad.
- No hay datos publicados de benchmarks, latencia ni requisitos de hardware específicos.

## Enlaces

- Hugging Face: https://huggingface.co/yijunwang2/moss-anypaint
- Modelo base: https://huggingface.co/OpenMOSS-Team/MOSS-Image-Base
- LoRA (descarga): moss_anypaint_rank32.safetensors (en el repositorio de Hugging Face)
- Nodos ComfyUI: https://github.com/alexw5702-afk/moss-anypaint
- Releases ComfyUI: https://github.com/alexw5702-afk/moss-anypaint/releases
