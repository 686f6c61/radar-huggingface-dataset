# StefanoBalocco/starvector-8b-im2svg-GGUF

## Resumen

StarVector 8B im2svg es un modelo multimodal especializado en la conversion de imagenes raster a graficos vectoriales SVG. Desarrollado originalmente por el equipo de StarVector (investigacion academica, con participacion de ServiceNow Research y Mila), el modelo combina un codificador visual con un decodificador de lenguaje para generar codigo SVG estructurado a partir de una imagen de entrada. Este repositorio concreto, publicado por StefanoBalocco, ofrece versiones cuantizadas en formato GGUF del checkpoint original, pensadas para su uso en ComfyUI mediante el nodo personalizado ComfyUI-StarVector-GGUF.

El modelo base cuenta con aproximadamente 7.500 millones de parametros y esta disenado especificamente para la tarea image-to-svg, no como un modelo de proposito general. Su relevancia practica radica en que automatiza una tarea tradicionalmente manual (vectorizacion de logotipos, iconos, diagramas y graficos) produciendo codigo SVG editable y escalable, en lugar de simples trazas de curvas.

Esta ficha se centra en la version GGUF distribuida por StefanoBalocco, que facilita el despliegue en hardware de consumo mediante cuantizaciones Q4_0, Q5_0 y Q8_0, manteniendo el codificador visual, el proyector y los embeddings en Q8_0 para preservar la fidelidad de la representacion visual.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Multimodal (codificador visual + proyector + decodificador de lenguaje tipo transformer) |
| Parametros totales | 7.507.080.192 (aprox. 7,5 mil millones) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | Q4_0, Q5_0, Q8_0 (GGUF); checkpoint original en BF16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (safetensors en el modelo base) |

## Arquitectura y entrenamiento

El modelo sigue una arquitectura multimodal compuesta por un codificador visual que procesa la imagen de entrada, un proyector que traduce las representaciones visuales al espacio del decodificador y un decodificador de lenguaje autorregresivo que genera la secuencia de tokens correspondiente al codigo SVG. El checkpoint base es `starvector/starvector-8b-im2svg`, entrenado especificamente para la tarea de conversion imagen a SVG. No se dispone en la informacion proporcionada de detalles sobre el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO.

La innovacion principal de esta distribucion GGUF es el esquema de cuantizacion mixta: en los ficheros Q4_0 y Q5_0, el codificador visual, el proyector y los embeddings de tokens se mantienen en Q8_0, mientras que el decodificador se cuantiza a la precision indicada. Segun la model card, el decodificador coincide con el checkpoint BF16 en el 99-100% de los tokens top-1 a lo largo de miles de tokens SVG, lo que indica una degradacion practicamente nula en la salida generada. La conversion se realiza mediante el script `tools/starvector_safetensors_to_gguf.py` del repositorio ComfyUI-StarVector-GGUF.

## Capacidades

- Conversion de imagenes raster a codigo SVG estructurado y editable.
- Generacion de graficos vectoriales a partir de logotipos, iconos, diagramas y formas.
- Procesamiento multimodal: entrada de imagen, salida de texto (codigo SVG).
- Integracion en flujos de trabajo de ComfyUI mediante nodos dedicados (Load StarVector GGUF, Image to SVG, Save SVG).
- Generacion autorregresiva de secuencias SVG de miles de tokens.
- Soporte de inferencia cuantizada en hardware de consumo.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni audio en la informacion disponible.
- Capacidad multilingue limitada al ingles segun la model card.

## Casos de uso

- Vectorizacion de logotipos para branding: el modelo genera SVG limpio y editable a partir de un logotipo raster, permitiendo a disenadores ajustar colores, formas y trazados en herramientas vectoriales sin redibujar manualmente.
- Conversion de iconos para interfaces: a partir de capturas o assets PNG, se obtienen iconos SVG escalables que se integran directamente en sistemas de diseno y frameworks web, manteniendo calidad en cualquier resolucion.
- Digitalizacion de diagramas tecnicos: esquemas y diagramas escaneados o exportados como imagen se convierten en SVG editable, lo que facilita su mantenimiento y actualizacion en documentacion tecnica.
- Generacion de graficos para publicaciones: figuras y graficos raster de articulos o informes se transforman en SVG vectorial para impresion de alta calidad o publicacion web responsive.
- Automatizacion en pipelines de diseno con ComfyUI: el modelo se inserta como nodo en flujos de ComfyUI para procesar lotes de imagenes y producir SVGs de forma automatizada, con previsualizacion y guardado integrados.
- Preparacion de assets para web: conversion de ilustraciones y elementos graficos a SVG para reducir peso, mejorar el escalado y permitir estilizado mediante CSS.
- Reconstruccion de mapas y planos simplificados: imagenes de planos o mapas con formas geometricas claras pueden convertirse en SVG para su edicion en herramientas GIS o de diseno vectorial.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 4,5 GB con Q4_0, 5,4 GB con Q5_0 y 8 GB con Q8_0, segun los tamanos de fichero indicados en la model card (4,51 GB, 5,38 GB y 7,99 GB respectivamente), mas el overhead de ejecucion.
- GPU recomendadas: no especificadas en la informacion disponible; por el rango de VRAM, tarjetas consumer con 8-12 GB o mas (por ejemplo, RTX 3060 12 GB, RTX 4070, RTX 4090) serian candidatas para las cuantizaciones Q4_0 y Q5_0.
- Cabe en GPU consumer: si, al menos en las cuantizaciones Q4_0 y Q5_0 segun el tamano de los ficheros.
- Opciones de despliegue: ComfyUI mediante el nodo ComfyUI-StarVector-GGUF; el formato GGUF sugiere compatibilidad con el ecosistema llama.cpp, aunque la model card solo documenta el uso en ComfyUI.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| StarVector 8B im2svg (esta ficha, GGUF) | ~7,5 B | No disponible | Imagen a SVG | Apache-2.0 | GGUF en Hugging Face, uso en ComfyUI |
| starvector/starvector-8b-im2svg (base) | ~7,5 B | No disponible | Imagen a SVG | Apache-2.0 | Safetensors en Hugging Face |
| Alternativas especializadas en image-to-svg | No disponible | No disponible | Imagen a SVG | No disponible | No disponible |

No se dispone en la informacion proporcionada de datos de rendimiento ni de especificaciones de modelos alternativos comparables de la misma categoria, por lo que la comparativa cuantitativa no esta disponible.

## Limitaciones y advertencias

- El modelo esta especializado exclusivamente en la tarea image-to-svg; no es un modelo de proposito general y no debe esperarse de el razonamiento, codigo general ni conversacion.
- Idioma limitado al ingles segun la model card; no se documenta soporte multilingue.
- La calidad del SVG generado depende de la claridad y estructura de la imagen de entrada; imagenes complejas, ruidosas o con texturas fotograficas pueden producir resultados pobres o invalidos.
- Riesgo de alucinacion: al ser un modelo generativo autorregresivo, puede producir codigo SVG sintacticamente incorrecto o geometricamente impreciso; se recomienda validacion automatica del SVG en produccion.
- La cuantizacion, aunque documentada como practicamente sin perdida (99-100% de coincidencia top-1), puede introducir divergencias en casos limite no cubiertos por la evaluacion del autor.
- La licencia Apache-2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base y de cualquier asset de entrenamiento.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que implica escasa validacion comunitaria; conviene evaluar el modelo en el caso de uso concreto antes de adoptarlo.
- El despliegue documentado se limita a ComfyUI; otros backends no estan verificados en la informacion disponible.

## Enlaces

- Repositorio GGUF: https://huggingface.co/StefanoBalocco/starvector-8b-im2svg-GGUF
- Modelo base: https://huggingface.co/starvector/starvector-8b-im2svg
- Repositorio ComfyUI-StarVector-GGUF: https://github.com/StefanoBalocco/ComfyUI-StarVector-GGUF
