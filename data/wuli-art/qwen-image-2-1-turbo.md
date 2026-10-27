# Wuli-art/Qwen-Image-2.1-Turbo

## Resumen

Wuli Qwen-Image-2.1 Turbo es una derivación «few-step» del modelo de difusión Qwen-Image-2.1 de Alibaba Qwen, publicada por el usuario Wuli-art. Su objetivo es reducir el número de pasos de muestreo necesarios para generar o editar imágenes: frente a los 40 pasos que emplea el modelo base, esta versión está destilada para producir resultados en 2, 4 u 8 pasos, manteniendo la misma arquitectura y pesos de partida. Se distribuye en tres precisiones (BF16, FP8 e INT8) y añade soporte de salida con canal alfa (RGBA), lo que la orienta a flujos de trabajo de diseño gráfico y a despliegues con VRAM ajustada.

El pipeline declarado en HuggingFace es `image-text-to-image`, es decir, cubre tanto la generación texto-a-imagen como la edición de imágenes guiada por instrucciones textuales. El modelo se integra con la librería `diffusers` y con ComfyUI a través de un repositorio propio de nodos. Solo declara soporte de prompts en inglés y chino, coherente con el modelo base.

La relevancia práctica está en el coste de inferencia: pasar de decenas de pasos a 2-8 pasos multiplica el throughput por unidad de GPU, lo que hace viable la generación de imágenes en producción interactiva o por lotes. No obstante, el repositorio (86,2 GB, con las tres precisiones) no incluye parámetros declarados ni resultados numéricos de benchmarks, y la licencia `qwen-research` condiciona el uso comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion derivado de Qwen/Qwen-Image-2.1 (destilacion few-step); detalles internos del backbone no disponibles |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE segun la informacion disponible) |
| Longitud de contexto | no disponible (no aplica como ventana de tokens; la resolucion de imagen soportada no se especifica) |
| Tipos de cuantizacion | BF16, FP8, INT8 |
| Idiomas soportados | en, zh |
| Licencia | qwen-research (`license: other`, heredada del modelo base) |
| Formato de pesos | safetensors (libreria `diffusers`), variantes BF16 / FP8 / INT8 |

## Arquitectura y entrenamiento

La informacion disponible describe el modelo como una derivacion few-step de Qwen-Image-2.1: se parte de los pesos del modelo base y se aplica una destilacion orientada a reducir el numero de pasos de inferencia, con variantes calibradas para 2, 4 y 8 pasos. No se detalla en la model card la arquitectura interna del backbone (tipo de transformer de difusion, mecanismo de atencion, VAE o text encoder), el numero de parametros, ni la composicion del dataset de destilacion o de ajuste. Tampoco se especifica si hubo etapas de RLHF/DPO (no aplicables de forma habitual en difusion) ni cuantas imagenes o pares imagen-texto se emplearon.

La innovacion tecnica declarada es doble: por un lado, la reduccion de pasos con tres puntos de operacion (2, 4 y 8) que permiten intercambiar calidad por latencia; por otro, la publicacion simultanea de pesos en BF16, FP8 e INT8, lo que facilita el despliegue en GPUs con distinta capacidad. Adicionalmente, el modelo soporta salida con transparencia (RGBA), una capacidad poco comun en modelos de difusion texto-a-imagen y que requiere que el VAE o el decodificador final genere cuatro canales. La model card incluye comparaciones visuales contra el modelo base a 40 pasos y contra el Turbo oficial de Qwen a 8 pasos, pero sin metricas numericas.

## Capacidades

- Generacion texto-a-imagen (text-to-image) en 2, 4 u 8 pasos de muestreo.
- Edicion de imagenes guiada por texto (pipeline `image-text-to-image`): el modelo acepta una imagen de entrada y una instruccion.
- Salida con canal alfa (RGBA), util para assets recortables y composicion.
- Tres precisiones publicadas (BF16, FP8, INT8) para ajustar calidad y consumo de VRAM.
- Integracion con ComfyUI mediante nodos propios, y con `diffusers`.
- Prompts en ingles y chino; no se declaran otros idiomas.
- No soporta tool calling, function calling ni razonamiento multi-paso: es un modelo generativo de imagenes, no un LLM.
- No se declaran capacidades de video, audio ni control estructural explicito (pose, depth, etc.) en la informacion disponible.

## Casos de uso

- Generacion interactiva en estudios de diseno: con 2 pasos el modelo permite iterar prompts casi en tiempo real sobre una GPU de gama alta, y refinar la propuesta elegida a 4 u 8 pasos antes de exportar.
- Produccion por lotes de imagenes para catalogo de e-commerce: la variante FP8 o INT8 reduce el coste por imagen y permite encolar cientos de generaciones en una sola GPU, manteniendo el pipeline `diffusers` sin reentrenamiento.
- Edicion de imagenes existentes: al soportar `image-text-to-image`, se puede usar para retocar o reestilizar material fotografico con instrucciones en lenguaje natural, sustituyendo parte del trabajo manual de postproduccion.
- Assets con transparencia para UI y motion graphics: la salida RGBA evita el paso posterior de recorte y permite generar iconos, ilustraciones o elementos superpuestos directamente con alfa.
- Integracion en ComfyUI para pipelines de equipo: los nodos publicados en el repositorio de GitHub permiten insertar el modelo en grafos existentes junto a upscalers, LoRAs o nodos de control.
- Generacion de carteles y material promocional bilingue: el soporte de en y zh cubre campanas para mercados angloparlantes y chinos dentro del mismo flujo.
- Prototipado en hardware limitado: las variantes cuantizadas hacen posible probar el modelo en GPUs de consumo que no admitirian los pesos BF16 completos.
- Previsualizacion rapida en herramientas creativas: usar 2 pasos como miniatura y 8 pasos como render final reduce el tiempo percibido de espera en un editor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card únicamente incluye comparaciones visuales lado a lado (Qwen base a 40 pasos, Wuli a 8, 4 y 2 pasos en BF16, y el Turbo oficial de Qwen a 8 pasos) sin metricas cuantitativas de FID, CLIP score, HPSv2 ni evaluaciones humanas con puntuacion.

| Comparacion | Pasos | Precision | Metrica |
|---|---|---|---|
| Qwen-Image-2.1 base | 40 | no disponible | no disponible |
| Wuli Turbo | 8 | BF16 | solo comparacion visual |
| Wuli Turbo | 4 | BF16 | solo comparacion visual |
| Wuli Turbo | 2 | BF16 | solo comparacion visual |
| Turbo oficial de Qwen | 8 | no disponible | no disponible |

## Requisitos de hardware

- VRAM estimada: no disponible de forma oficial. Como referencia orientativa a partir del tamano del repositorio (86,2 GB, que empaqueta BF16 + FP8 + INT8 de un mismo modelo), los pesos BF16 rondarian los 40-43 GB y los FP8/INT8 alrededor de 21 GB cada uno; estas cifras son una estimacion por aritmetica de tamanos, no un dato del autor.
- GPU recomendadas: no especificadas por el autor. Por el volumen de pesos, un despliegue en BF16 requiere GPUs de 80 GB (A100, H100) o varias GPUs; las variantes FP8/INT8 apuntan a GPUs de 24-48 GB.
- GPU de consumo: cabe esperar que la variante INT8 o FP8 sea la unica viable en tarjetas de 24 GB (RTX 4090, RTX 3090), siempre que el text encoder y el VAE se gestionen con offload; el BF16 completo no cabria en una GPU de consumo. No confirmado por el autor.
- Opciones de despliegue: `diffusers` (libreria declarada), ComfyUI mediante el repositorio de nodos del autor, y en su caso servidores compatibles con pesos safetensors de difusion. No se declara soporte de llama.cpp, Ollama, vLLM ni TGI (no aplican a un modelo de difusion de este tipo).
- Latencia y throughput: no disponibles. La unica indicacion es cualitativa: 2 pasos frente a 40 del modelo base implican del orden de 20 veces menos evaluaciones del backbone por imagen, lo que se traduce en una reduccion proporcional del coste de computo, sin datos medidos publicados.

## Comparativa con modelos similares

| Modelo | Parametros | Pasos | Precisiones publicadas | Contexto / resolucion | Licencia | Observaciones |
|---|---|---|---|---|---|---|
| Wuli Qwen-Image-2.1 Turbo | no disponible | 2 / 4 / 8 | BF16, FP8, INT8 | no disponible | qwen-research | Salida RGBA, nodos ComfyUI propios |
| Qwen/Qwen-Image-2.1 (base) | no disponible | ~40 | no disponible en la informacion | no disponible | qwen-research | Referencia de calidad; mucho mas lento por imagen |
| Turbo oficial de Qwen | no disponible | 8 | no disponible en la informacion | no disponible | qwen-research | Alternativa directa en 8 pasos; el derivado de Wuli anade 4 y 2 pasos |
| Otros modelos texto-a-imagen open source | no disponible | no disponible | no disponible | no disponible | no disponible | No se han proporcionado datos comparativos en la informacion disponible |

## Limitaciones y advertencias

- Licencia `qwen-research`: hereda las restricciones del modelo base de Qwen, por lo que el uso comercial no esta garantizado y debe revisarse el fichero LICENSE antes de desplegar en produccion.
- Al ser un fine-tune derivado, absorbe los sesgos del modelo base en cuanto a representacion de personas, culturas y estilos; no se documentan evaluaciones de sesgo.
- Riesgo de alucinacion visual: el modelo puede generar texto ilegible dentro de la imagen, anatomias incorrectas o detalles incoherentes con el prompt, especialmente en la configuracion de 2 pasos.
- La reduccion a 2 pasos implicra una perdida de calidad y de fidelidad al prompt frente a 4 u 8 pasos; la model card no cuantifica esa perdida.
- Idiomas limitados a ingles y chino: los prompts en castellano no estan soportados oficialmente y pueden degradar el resultado.
- No se documentan limites de resolucion, relacion de aspecto ni numero maximo de imagenes de entrada para la edicion.
- El repositorio ocupa 86,2 GB porque incluye las tres precisiones; la descarga completa puede no ser necesaria, pero requiere seleccionar los ficheros correctos.
- No hay informacion sobre filtros de seguridad, moderacion de contenido ni comportamiento del modelo ante prompts dañinos.
- Ausencia total de benchmarks publicados: cualquier comparacion de calidad con el modelo base o con alternativas es, por ahora, cualitativa.
- Version de comunidad (0 descargas, 14 likes en el momento de la consulta): no es un artefacto oficial de Qwen y carece del respaldo de mantenimiento de un lanzamiento corporativo.

## Enlaces

- HuggingFace: https://huggingface.co/Wuli-art/Qwen-Image-2.1-Turbo
- ModelScope: https://www.modelscope.cn/models/Wuli-Art/Qwen-Image-2.1-Turbo
- Repositorio ComfyUI: https://github.com/wuli-art/Qwen-Image-2.1-Turbo-ComfyUI
- Pagina de comparaciones visuales: https://cdn.wuli.art/image/qwen-image21-turbo/comparison/index.html
- Modelo base: https://huggingface.co/Qwen/Qwen-Image-2.1
- Licencia: fichero LICENSE del repositorio de HuggingFace (no se proporciona URL directa)
