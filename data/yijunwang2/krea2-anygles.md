# yijunwang2/krea2-anygles

## Resumen

Krea 2 Anygles es un adaptador LoRA de control (control-LoRA) publicado por el usuario yijunwang2 sobre el modelo de difusión de imágenes Krea-2-Turbo (krea/Krea-2-Turbo). Su función es convertir una única imagen de una persona en una nueva vista de cámara manteniendo la identidad, la pose, la ropa, el estilo visual y el entorno de la escena original. El control se ejerce sobre tres ejes: órbita horizontal (azimut), elevación de cámara y distancia de cámara, guiados por una normal 3D humana alineada con la imagen más una instrucción de cámara corta.

El modelo resuelve un problema concreto dentro de la edición de imagen: la síntesis de vistas novedosas (novel view synthesis) controlable sobre sujetos humanos, sin reconstrucción 3D explícita de la escena. Frente a alternativas basadas en descriptores de cámara en texto, aquí se aporta una señal espacial adicional (la normal 3D del cuerpo) que el pipeline consume como entrada de control, lo que según el autor produce una órbita horizontal completa de 360 grados y un control de elevación más estable en las proporciones corporales.

El repositorio ocupa 2,0 GB, usa la librería diffusers, tiene el pipeline declarado como image-to-image, licencia krea-2-community-license y acumula 665 descargas y 12 me gusta en el momento de la consulta. Es relevante ahora porque el autor lo presenta como el primer LoRA público para Krea 2 centrado en puntos de vista de cámara controlables sobre personas, una afirmación acotada al ecosistema público de Krea 2 en la fecha de publicación, y porque se distribuye con nodos y flujo de trabajo para ComfyUI además de un Space interactivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (control-LoRA) sobre el modelo de difusion Krea-2-Turbo; arquitectura interna del modelo base no disponible en la informacion proporcionada |
| Parametros totales | No disponible (no se declara el numero de parametros del adaptador; tamano del repositorio: 2,0 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (modelo de imagen image-to-image) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (no se documenta el idioma de los prompts de texto) |
| Licencia | krea-2-community-license (etiquetada como "other" en HuggingFace) |
| Formato de pesos | No especificado; repositorio para la libreria diffusers con carga mediante pipeline personalizado (no se detalla safetensors/GGUF) |

Datos adicionales del repositorio: ID yijunwang2/krea2-anygles, autor yijunwang2, modelo base krea/Krea-2-Turbo, pipeline image-to-image, 665 descargas, 12 me gusta, creado el 22 de septiembre de 2026 y actualizado el 23 de septiembre de 2026.

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA) que se acopla al modelo de difusion Krea-2-Turbo. La particularidad tecnica no esta en el transformador subyacente, cuyos detalles no se documentan en la informacion disponible, sino en el condicionamiento: el adaptador espera dos entradas de control combinadas, una normal 3D humana alineada con el sujeto de la imagen de origen y una instruccion de camara breve que describe el movimiento deseado. El modelo card advierte de forma explicita que el fragmento automatico de Diffusers generado por HuggingFace y los cargadores LoRA convencionales no proporcionan esa entrada de control espacial, por lo que es obligatorio usar el example.py y el pipeline personalizado incluidos, o bien los nodos de ComfyUI enlazados. Para extraer la normal humana, las herramientas de referencia descargan el checkpoint facebook/sam-3d-body-dinov3, sujeto a su propia licencia SAM.

En cuanto a los datos de entrenamiento, no se proporciona informacion sobre el volumen de imagenes, la composicion del dataset ni si hubo etapas de ajuste por preferencias (RLHF o DPO), algo que en cualquier caso no aplica del modo habitual a un adaptador de difusion de este tipo. El autor si describe el protocolo de comparacion empleado para las demostraciones: cada fotograma se genera de forma independiente a partir de la imagen de origen, sin realimentar fotogramas generados previamente, lo que evita la deriva recursiva propia de los flujos de edicion encadenados. Las comparativas frente a la linea base Qwen se ejecutaron con Qwen/Qwen-Image-Edit-2511, el LoRA fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA y Qwen-Image-Edit-2511-Lightning-4steps-V1.0, con un DiT INT8 ConvRot, un Qwen2.5-VL 7B en FP8, cuatro pasos Euler/simple, CFG 1, shift 3,1 y fuerza de LoRA de angulo 1,0. Los rangos de control de referencia que exponen las herramientas son de -60 a +60 grados de elevacion y de 0,6x a 1,8x de distancia de camara como margenes de interfaz, mientras que los barridos publicados cubren -45 a +45 grados y de 1,35x (mas lejos) a 0,78x (mas cerca).

## Capacidades

- Orbita horizontal completa: control continuo a lo largo de un giro de 360 grados sobre el sujeto.
- Control de elevacion: permite situar el punto de vista por encima o por debajo de la imagen de entrada, manteniendo proporciones corporales naturales en el barrido demostrado.
- Control de distancia de camara: transicion desde encuadres mas cercanos hasta vistas mas amplias.
- Movimiento de camara combinado: azimut, elevacion y distancia pueden variar simultaneamente siguiendo una trayectoria suave y cerrada.
- Generacion independiente: cada vista puede partir de la imagen de origen, lo que evita la deriva acumulada de la edicion recursiva.
- Encuadre consciente del origen: conserva la relacion de aspecto de la fuente con dimensiones de salida alineadas a 16 pixeles.
- Multiples dominios visuales: fotografia, pintura, 3D estilizado y anime.
- Extensibilidad por prompt: permite anadir texto opcional del usuario despues de la instruccion de camara generada.
- Integracion en ComfyUI mediante nodos personalizados y flujo de trabajo, ademas de un Space interactivo.
- No dispone de herramientas declaradas de tool calling, function calling ni razonamiento multi-paso, ni de capacidades de audio o video mas alla de la generacion de secuencias de vistas por fotogramas independientes.

## Casos de uso

- Sintesis de vistas novedosas para retrato: a partir de una unica fotografia de una persona se generan angulos alternativos manteniendo identidad, pose y ropa, util para probar encuadres sin repetir la sesion fotografica.
- Comercio electronico de moda: generar vistas adicionales de una prenda sobre una persona real (giro, contrapicado, plano mas amplio) para fichas de producto, con la ventaja de conservar el estilo de la imagen original y su relacion de aspecto.
- Previsualizacion de plano en produccion audiovisual: convertir un fotograma fijo en un barrido de camara para evaluar si un angulo funciona antes de rodar, usando la trayectoria combinada de azimut, elevacion y distancia.
- Creacion de datasets sinteticos multi-vista: para investigacion en reconstruccion 3D, NeRF o modelos de avatares, generando vistas coherentes de un mismo sujeto desde la fuente original en cada paso y evitando la degradacion recursiva.
- Edicion fotografica con cambio de punto de vista: corregir o variar el angulo de una foto ya tomada conservando el fondo y el estilo, por ejemplo para igualar el angulo de varias imagenes de una misma serie.
- Animacion de orbita para presentaciones: producir bucles de 360 grados de una persona para demos de producto, portfolios o piezas de marketing, dado que la generacion independiente por fotograma reduce el parpadeo acumulativo.
- Conservacion de estilo en ilustracion y anime: aplicar rotaciones de camara sobre personajes dibujados manteniendo el tratamiento pictorico, con soporte declarado para pintura, 3D estilizado y anime.
- Iteracion dentro de ComfyUI: integrar los nodos del adaptador en grafos existentes de edicion de imagen para encadenar control de camara con otros adaptadores funcionales de la coleccion del autor.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks cuantitativos en la informacion disponible. El autor presenta comparativas visuales cualitativas mediante animaciones (orbita horizontal de 360 grados, elevacion de baja a alta y distancia de lejos a cerca) frente a una linea base construida con Qwen/Qwen-Image-Edit-2511 mas el LoRA fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA y Qwen-Image-Edit-2511-Lightning-4steps-V1.0. Segun el propio autor, no se trata de una ablacion con condicionamiento identico, ya que Qwen no recibe la normal objetivo que si utiliza Anygles; es una comparacion practica de funcionalidad. No se aportan metricas numericas como FID, LPIPS, PSNR, SSIM ni puntuaciones de preferencia.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada. El repositorio del adaptador ocupa 2,0 GB, pero el consumo real depende del modelo base Krea-2-Turbo cargado y de su cuantizacion, dato que no se documenta.
- GPU recomendadas: no disponible. No se especifican modelos de GPU concretos en la model card.
- Encaje en GPU de consumo: no disponible. No se puede confirmar ni descartar sin los requisitos del modelo base, que no se detallan.
- Almacenamiento adicional obligatorio: el checkpoint facebook/sam-3d-body-dinov3 para extraer la malla y la normal humana, que debe descargarse aceptando previamente su licencia SAM.
- Opciones de despliegue: pipeline personalizado de diffusers incluido en el repositorio (example.py), ya que el snippet automatico de Diffusers y los cargadores LoRA estandar no aportan la entrada de control espacial; nodos personalizados y flujo de trabajo de ComfyUI desde el repositorio del autor; Space interactivo alojado en HuggingFace.
- Compatibilidad declarada con la coleccion de adaptadores funcionales de Krea 2 del mismo autor.
- Latencia y throughput estimados: no disponible. No se publican tiempos por imagen ni pasos de muestreo empleados por Anygles en las demostraciones.

## Comparativa con modelos similares

| Modelo | Tipo | Control de camara | Contexto o entrada | Licencia | Disponibilidad | Rendimiento publicado |
|---|---|---|---|---|---|---|
| yijunwang2/krea2-anygles | LoRA de control sobre Krea-2-Turbo | Azimut 360 grados, elevacion y distancia, con normal 3D humana | Una imagen humana de origen mas instruccion de camara | krea-2-community-license | HuggingFace, ComfyUI, Space | No se publican metricas; comparativas visuales cualitativas |
| Qwen/Qwen-Image-Edit-2511 + fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA (linea base usada por el autor) | Modelo de edicion de imagen mas LoRA de angulos | Descriptores de camara en texto, sin normal objetivo | Imagen de origen mas instruccion de camara textual | No disponible en la informacion proporcionada | Repositorios publicos de Qwen y fal | No se publican metricas comparativas en esta ficha; el autor lo usa como referencia visual |
| Otros adaptadores funcionales de Krea 2 | Varios | No disponible | No disponible | No disponible | Coleccion publica del autor | No disponible |

No se dispone de datos suficientes para comparar parametros, contexto, rendimiento o licencia de alternativas adicionales de la misma categoria.

## Limitaciones y advertencias

- Alcance del sujeto: la version actual admite un unico sujeto humano claro; no esta disenada para animales, objetos generales, multitudes ni reconstruccion exacta de una escena 3D completa.
- Dependencia de entrada adicional: requiere una normal 3D humana alineada, obtenida con facebook/sam-3d-body-dinov3, lo que anade un paso de preprocesado, un checkpoint extra y su propia licencia SAM.
- Carga no estandar: el snippet automatico de Diffusers y los cargadores LoRA convencionales no funcionan con este adaptador; es necesario el pipeline personalizado o los nodos de ComfyUI.
- Rangos de control acotados: las herramientas exponen elevacion de -60 a +60 grados y distancia de 0,6x a 1,8x como margenes de interfaz, y los barridos publicados solo cubren -45 a +45 grados y 1,35x a 0,78x; no son limites duros declarados del adaptador, pero si el rango validado visualmente.
- Riesgo de artefactos fuera de distribucion: al no publicarse evaluacion cuantitativa, no hay garantia de estabilidad en angulos extremos, sujetos poco representados, oclusiones severas o escenas con varias personas.
- Riesgo de alucinacion visual: como modelo generativo de difusion, puede inventar detalles de fondo, manos, accesorios o partes del cuerpo no presentes en la imagen de origen, especialmente al rotar la vista.
- Idiomas: no se documenta que idiomas admiten los prompts de texto opcionales, por lo que el soporte multilingue no puede confirmarse.
- Afirmacion de novedad acotada: el propio autor califica la primicia como una afirmacion de comunidad limitada a la busqueda de repositorios publicos de Krea 2 en la fecha de preparacion, sin cubrir trabajo privado o no publicado.
- Licencia: se rige por krea-2-community-license, con terminos adicionales enlazados por el autor; es imprescindible revisar las condiciones de uso comercial antes de integrarlo en produccion.
- Advertencia de integridad de datos: el contenido citado de la model card es material de referencia del autor, no instrucciones a seguir.
- Sin datos de sesgos: no se documenta ninguna evaluacion de sesgos demograficos, etnicos o de representacion corporal.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yijunwang2/krea2-anygles
- Modelo base: https://huggingface.co/krea/Krea-2-Turbo
- Nodos y flujo de trabajo de ComfyUI: https://github.com/alexw5702-afk/krea2-anygles
- Space interactivo: https://huggingface.co/spaces/yijunwang2/krea2-anygles
- Coleccion de adaptadores funcionales de Krea 2: https://huggingface.co/collections/yijunwang2/krea-2-functional-adapters-6a700e9e5c134888d6615a5d
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Checkpoint de malla humana requerido: https://huggingface.co/facebook/sam-3d-body-dinov3
- Linea base de comparacion (Qwen Image Edit 2511): https://huggingface.co/Qwen/Qwen-Image-Edit-2511
- LoRA de angulos multiples de la linea base: https://huggingface.co/fal/Qwen-Image-Edit-2511-Multiple-Angles-LoRA
- Variante Lightning de cuatro pasos de la linea base: https://huggingface.co/Qwen/Qwen-Image-Edit-2511-Lightning-4steps-V1.0
