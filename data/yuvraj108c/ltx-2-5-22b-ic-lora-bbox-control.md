# yuvraj108c/LTX-2.5-22b-IC-LoRA-BBox-Control

## Resumen

El modelo `yuvraj108c/LTX-2.5-22b-IC-LoRA-BBox-Control` es un In-Context LoRA (IC-LoRA) desarrollado por el autor independiente yuvraj108c, diseñado para añadir control por bounding boxes y prompting regional al modelo base de generación de vídeo Lightricks/LTX-2.5, un modelo de 22 mil millones de parámetros. Esta adaptación permite especificar regiones espaciales animadas dentro de un vídeo, asignando a cada una una descripción independiente, lo que resuelve el problema del control fino de objetos y escenas en generación de vídeo.

El LoRA se entrena sobre el modelo LTX-2.5 y utiliza un mecanismo de condicionamiento por vídeo de referencia: se proporciona un vídeo con cajas delimitadoras blancas sobre fondo negro, que actúa como señal de control espacial. Con un rango de 32 y aproximadamente 163,6 millones de parámetros entrenables, el adaptador ocupa solo 0,4 GB y se integra en ComfyUI mediante el repositorio complementario `ComfyUI-LTX-BBox-Animator`. Su relevancia radica en ofrecer una vía práctica y de código abierto para controlar la posición, el tamaño y la identidad de múltiples objetos en vídeos generados, algo que hasta ahora requería herramientas propietarias o flujos complejos.

La ficha se basa en la información publicada en Hugging Face y en los repositorios asociados. No se han encontrado datos de benchmarks cuantitativos para este adaptador, por lo que las secciones de rendimiento se limitan a lo declarado por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (In-Context LoRA) sobre LTX-2.5, modelo de difusion de video de 22B parametros |
| Parametros totales | 163.577.856 (parametros entrenables del LoRA) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No especificada; el entrenamiento uso clips de 121 frames a 768x448 |
| Tipos de cuantizacion | No disponible (el LoRA se publica en bfloat16) |
| Idiomas soportados | Ingles (en) |
| Licencia | GPL-3.0 |
| Formato de pesos | Safetensors (LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 32 aplicado al modelo base LTX-2.5, un modelo de difusion de video de 22B parametros. La innovacion principal es el uso de un "In-Context LoRA": durante el entrenamiento, el modelo recibe un video de referencia que contiene las cajas delimitadoras animadas (huecas, con borde blanco de 2 px y centro blanco redondeado) sobre un fondo negro. Este video actua como señal de control espacial, y el LoRA aprende a condicionar la generacion a partir de esa informacion contextual.

El entrenamiento se realizo con el framework `ltx-trainer` de Lightricks, extendido con un mecanismo de denoising regional. Se utilizaron 152 videos revisados manualmente de Pexels (licencia libre), con un total de 171 tracks de objetos anotados. De ellos, 15 videos contienen multiples objetos y no hay ejemplos con solapamiento. La configuracion incluye 3.000 pasos con learning rate de `2e-4` (programa lineal), precision bfloat16, resolucion 768x448 y 121 frames por clip. Se aplicaron pesos de 0,85/0,15 para prompts regionales/globales y 0,60/0,40 para perdidas regionales/completas. El muestreo entre ejemplos multi-objeto y unico objeto fue de 0,35/0,65.

## Capacidades

- Control espacial animado: los objetos siguen posiciones y tamanos definidos por bounding boxes keyframed.
- Prompting regional independiente: cada objeto tiene su propia descripcion y mascara espacial animada.
- Prompt swapping: se pueden intercambiar las descripciones de los objetos manteniendo el video de control sin cambios.
- Condicionamiento global de escena: un prompt separado controla iluminacion, entorno, encuadre y contexto general.
- Integracion con ComfyUI mediante nodos personalizados (ComfyUI-LTX-BBox-Animator).
- Soporte para mas de tres regiones, aunque la fiabilidad disminuye con escenas densas y aumenta el consumo de VRAM.
- Pipeline video-to-video: acepta un video de entrada (el de control) y genera un video nuevo condicionado.

## Casos de uso

- Animacion de personajes en escenas complejas: un creador puede dibujar cajas sobre un video base y asignar a cada personaje una descripcion detallada (ropa, color, accion) para generar una secuencia coherente con multiples actores.
- Edicion de video con control regional: en postproduccion, se puede reemplazar un objeto concreto (por ejemplo, un coche) manteniendo el resto de la escena, usando el prompt regional para describir el nuevo objeto y el video de control para fijar su trayectoria.
- Prototipado rapido de storyboards: los directores pueden generar animaciones preliminares de una escena especificando posiciones y movimientos de los elementos, sin necesidad de modelado 3D.
- Generacion de contenido publicitario: se pueden crear anuncios con productos que se mueven segun trayectorias definidas, combinando un prompt global de estilo con prompts regionales para cada producto.
- Investigacion en control espacial de modelos generativos: el adaptador sirve como base para estudiar como los LoRA contextuales aprenden a interpretar señales espaciales, y para comparar con otros metodos de control (ControlNet, etc.).
- Creacion de videos educativos o explicativos: se pueden animar diagramas o elementos graficos (flechas, iconos) con bounding boxes, manteniendo un fondo estable y un narrador en el prompt global.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor no proporciona metricas cuantitativas (FVD, CLIP score, etc.) ni comparaciones con otros metodos de control espacial. La unica validacion son los videos de ejemplo incluidos en la model card, que muestran escenas con 8 a 15 cajas.

## Requisitos de hardware

- VRAM estimada: el modelo base LTX-2.5 tiene 22B parametros, por lo que se requiere al menos 24 GB de VRAM para inferencia en bfloat16 (por ejemplo, una RTX 4090 o A10G). El LoRA anade un overhead minimo (0,4 GB), pero la carga principal es el modelo base.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB), A100 (40/80 GB), H100 (80 GB) o equivalentes. En GPUs con menos de 24 GB, se podria intentar cuantizacion del modelo base, aunque no se ha probado oficialmente.
- Despliegue: se integra en ComfyUI mediante los nodos de `ComfyUI-LTX-BBox-Animator`. Tambien es posible usarlo con el framework `ltx-trainer` de Lightricks para inferencia personalizada.
- Latencia y throughput: no disponibles. Dependen del hardware y de la longitud del video generado; un clip de 121 frames a 768x448 puede requerir varios minutos en una GPU de gama alta.

## Comparativa con modelos similares

No se dispone de datos publicados para comparar este LoRA con otras adaptaciones de control espacial para LTX-2.5. Como referencia, se puede comparar con el modelo base sin adaptacion:

| Modelo | Parametros | Control espacial | Licencia | Disponibilidad |
|---|---|---|---|---|
| LTX-2.5 (base) | 22B | No (solo texto) | Apache 2.0 (segun Lightricks) | Hugging Face |
| LTX-2.5 + IC-LoRA BBox | 22B + 163M | Si (bounding boxes) | GPL-3.0 (LoRA) | Hugging Face |
| Otros metodos (p.ej. ControlNet para video) | Variable | Depende | Variable | Variable |

La comparativa con alternativas como ControlNet para video no es directa, ya que este LoRA opera sobre un modelo de difusion de video especifico y no se han publicado metricas comparativas.

## Limitaciones y advertencias

- Entrenado con un conjunto de datos reducido (152 videos de stock), lo que puede limitar la generalizacion a estilos o escenarios muy diferentes.
- La fiabilidad del control disminuye con mas de tres regiones; escenas densas pueden producir artefactos o ignorar algunas cajas.
- El modelo base LTX-2.5 es un modelo de 22B, por lo que la inferencia requiere hardware de gama alta y no es adecuado para dispositivos de consumo.
- La licencia GPL-3.0 del LoRA puede imponer restricciones de copyleft en proyectos comerciales que lo integren.
- Solo se ha entrenado con prompts en ingles; el rendimiento en otros idiomas no esta garantizado.
- No se han publicado evaluaciones de sesgos o alucinaciones; como todo modelo generativo, puede producir contenido no deseado o inconsistente con las cajas.
- El prompt global y los regionales deben ser coherentes entre si; contradicciones pueden degradar la salida.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yuvraj108c/LTX-2.5-22b-IC-LoRA-BBox-Control
- Repositorio de nodos ComfyUI: https://github.com/yuvraj108c/ComfyUI-LTX-BBox-Animator
- Modelo base LTX-2.5: https://huggingface.co/Lightricks/LTX-2.5
- Pagina oficial de LTX-2.5: https://ltx.io/model/ltx-2-5
