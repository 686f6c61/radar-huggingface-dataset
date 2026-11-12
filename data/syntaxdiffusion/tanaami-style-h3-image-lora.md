# syntaxdiffusion/tanaami-style-h3-image-lora

## Resumen

Tanaami-style H3 Image LoRA es un adaptador de estilo (LoRA) para el modelo de difusion texto-a-imagen MiniMax H3 Image, desarrollado por el usuario syntaxdiffusion y publicado en Hugging Face. Su proposito es inyectar un estilo visual muy concreto: ilustracion pop-art psicodelica y densa, con color plano saturado, lineas de contorno gruesas y cintas arcoiris, inspirado en la obra del artista japones Keiichi Tanaami. No es un modelo autonomo, sino un peso adicional que se carga sobre el modelo base Comfy-Org/MiniMax-H3-Image.

El adaptador es deliberadamente pequeno: el repositorio ocupa unos 0,2 GB y contiene un unico archivo safetensors de rango 16 entrenado durante 2.000 pasos. La activacion del estilo se controla mediante un token disparador (`T4N4AM1`) y un rango de fuerza recomendado entre 0,75 y 1,0. Su relevancia es acotada pero clara para quien trabaje con MiniMax H3 Image: permite obtener una estetica de autor reconocible sin reentrenar el modelo base, con un coste de almacenamiento minimo y un flujo de uso estandar en ComfyUI.

La licencia es la MiniMax H3 Image Community License, heredada del modelo base, lo que condiciona cualquier uso comercial del adaptador. No se declaran idiomas soportados ni se han publicado benchmarks, algo esperable en un LoRA de estilo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (adaptador de bajo rango) sobre un modelo de difusion texto-a-imagen; arquitectura del modelo base no detallada en la informacion disponible |
| Parametros totales | no disponible (rango 16; el repositorio pesa 0,2 GB) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo texto-a-imagen); no disponible para el codificador de texto del modelo base |
| Tipos de cuantizacion | no disponible (el LoRA se distribuye en safetensors; el modelo base admite las cuantizaciones que soporte MiniMax H3 Image) |
| Idiomas soportados | no disponibles |
| Licencia | minimax-h3-image-community-license |
| Formato de pesos | safetensors (`tanaami_h3_image_lora_2000.safetensors`) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 aplicado sobre MiniMax H3 Image. No se especifica en la informacion disponible sobre que modulos del transformer de difusion se insertan las matrices de bajo rango, ni la arquitectura interna del modelo base (tipo de backbone, tipo de codificador de texto, tipo de VAE). El archivo se denomina `tanaami_h3_image_lora_2000.safetensors`, lo que refleja los 2.000 pasos de entrenamiento.

El entrenamiento se realizo con AI Toolkit, usando la arquitectura `minimax_h3_image`, sobre un conjunto de 17 imagenes a aproximadamente 4 megapixeles, con batch 1, learning rate 1e-4, optimizador adamw8bit y 2.000 pasos. Se empleo el LoRA asistente `ostris/minimax_h3_training_adapter`. El token de instancia es `T4N4AM1`. No se detalla la composicion del dataset mas alla del numero de imagenes ni si hubo tecnicas adicionales de regularizacion o aumento de datos.

## Capacidades

- Generacion de imagenes texto-a-imagen con un estilo pop-art psicodelico: color plano saturado, contornos gruesos y cintas arcoiris.
- Control de intensidad del estilo mediante la fuerza del LoRA (0,5 deja dominar al modelo base; 0,75-1,0 aplica el estilo con fuerza).
- Activacion del estilo mediante el token disparador `T4N4AM1` al inicio del prompt.
- Respuesta a prompts descriptivos en frases completas, con mejor resultado cuando se nombran motivos concretos (ojos, dientes, cintas arcoiris, llamas, rayas, collage sin espacio vacio).
- Aplicacion del estilo tanto a sujetos propios del repertorio del artista como a temas cotidianos, que salen como ilustracion colorida con un toque mas ligero del estilo.
- No se declaran capacidades de tool calling, agentes, vision, audio ni modo de razonamiento; no aplica a un LoRA de difusion.

## Casos de uso

- Ilustracion editorial de estilo psicodelico: usar el LoRA con fuerza 0,75-1,0 y prompts que nombren motivos (ojos, dientes, rayas) para generar portadas o ilustraciones de articulo con una estetica pop-art coherente.
- Creacion de carteles y material grafico de eventos: el estilo de color plano saturado y contornos gruesos funciona bien en formatos de cartel, generando composiciones densas a unos 4 MP.
- Exploracion de direccion de arte: comparar el mismo prompt y semilla con fuerza 0,5, 0,75 y 1,0 permite calibrar cuanto del estilo de autor se quiere incorporar frente al aspecto del modelo base.
- Generacion de assets para juegos o animacion: producir ilustraciones de personajes y escenarios con una paleta y un tratamiento de linea consistentes, partiendo de prompts descriptivos.
- Prototipado rapido en ComfyUI: al integrarse con un nodo `LoraLoaderModelOnly` entre el cargador de H3 Image y el sampler, se puede iterar con 6 pasos, CFG 1 y sampler euler/simple, lo que reduce el coste por prueba.
- Series tematicas de ilustracion: aplicar el mismo LoRA y token a una lista de sujetos (animales, escenas urbanas, comida) para producir una coleccion visual homogenea con el sello del estilo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El LoRA en si ocupa unos 0,2 GB en disco y anade un consumo de VRAM minimo sobre el modelo base; no se dispone de cifras exactas de VRAM para MiniMax H3 Image en la informacion proporcionada.
- GPU recomendadas: no disponible para el modelo base; el adaptador no impone requisitos propios adicionales.
- Compatibilidad con GPU de consumo: no disponible; depende enteramente de si MiniMax H3 Image cabe en la GPU concreta.
- Opciones de despliegue: ComfyUI con un nodo `LoraLoaderModelOnly` colocado entre el cargador de H3 Image y el sampler; la libreria declarada es diffusers.
- Parametros de muestreo recomendados por el autor: 6 pasos, CFG 1, sampler euler / simple, alrededor de 4 MP.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye otros LoRA de estilo para MiniMax H3 Image ni datos de rendimiento que permitan una comparacion cuantitativa.

## Limitaciones y advertencias

- Es un adaptador de estilo, no un modelo autonomo: requiere cargar Comfy-Org/MiniMax-H3-Image como base.
- Entrenado con solo 17 imagenes, lo que puede limitar la variedad y la robustez del estilo ante prompts muy alejados del repertorio entrenado.
- A fuerza 0,5 el aspecto del modelo base sigue dominando; por debajo de ese valor el estilo apenas se aprecia.
- El estilo se activa de forma mas fiable con el token `T4N4AM1` y con prompts que nombren motivos concretos; prompts genericos producen un efecto mas tenue.
- No se declaran idiomas soportados; el comportamiento multilingue depende del codificador de texto del modelo base.
- Riesgo de alucinacion y sesgos: no documentado en la informacion disponible; en difusion se traduce en posibles artefactos visuales y en la reproduccion de sesgos del modelo base y del dataset de 17 imagenes.
- Licencia MiniMax H3 Image Community License: al ser una obra derivada, el uso comercial queda sujeto a los terminos de dicha licencia, que no se detallan en la informacion proporcionada; conviene revisarla antes de produccion.
- Repositorio sin descargas ni likes en el momento de la consulta, lo que implica ausencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syntaxdiffusion/tanaami-style-h3-image-lora
- Modelo base: https://huggingface.co/Comfy-Org/MiniMax-H3-Image
- LoRA asistente de entrenamiento: https://huggingface.co/ostris/minimax_h3_training_adapter
- AI Toolkit (herramienta de entrenamiento): no se proporciona enlace en la informacion disponible
- Licencia MiniMax H3 Image Community License: no se proporciona enlace en la informacion disponible
