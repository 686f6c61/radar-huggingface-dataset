# Yuro1991/Wan2.2-TI2V-5B

## Resumen

Wan2.2-TI2V-5B es un modelo de difusion para generacion de video que unifica las tareas de texto-a-video (T2V) e imagen-a-video (I2V) en un unico checkpoint de aproximadamente 5.000 millones de parametros. Forma parte de la familia Wan2.2, desarrollada por el equipo Wan (Alibaba Tongyi), y se apoya en un VAE propio, el Wan2.2-VAE, con una tasa de compresion de 16x16x4. El repositorio analizado (Yuro1991/Wan2.2-TI2V-5B) es una resubida comunitaria del checkpoint oficial Wan-AI/Wan2.2-TI2V-5B, publicado originalmente junto al resto de la familia el 28 de julio de 2025.

Su relevancia practica esta en el equilibrio entre calidad y coste: genera video a 720p y 24 fotogramas por segundo en una unica GPU de consumo, como una RTX 4090, lo que lo situa entre las opciones mas rapidas de 720p@24fps disponibles en abierto. El modelo esta integrado en Diffusers y ComfyUI, y su licencia Apache-2.0 elimina las restricciones de uso comercial habituales en los generadores de video cerrados.

El repositorio tiene 34,2 GB, no registra descargas ni valoraciones y su fecha de creacion aparece como 2026-09-11, inconsistente con la cronologia conocida de Wan2.2. Para uso en produccion conviene descargar el checkpoint desde el repositorio oficial de Wan-AI y tratar esta copia como un espejo sin garantias de mantenimiento.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion (diffusion transformer) para video, con VAE de alta compresion Wan2.2-VAE (16x16x4); la innovacion MoE de la familia se aplica a las variantes A14B, no a esta |
| Parametros totales | 5.000 millones (5B) |
| Parametros activos | No aplica (el TI2V-5B es un modelo denso; la arquitectura MoE corresponde a las variantes A14B) |
| Longitud de contexto | No aplica (modelo de difusion, no autoregresivo); genera clips a 720p y 24 fps |
| Tipos de cuantizacion | No disponible en la informacion proporcionada; el repositorio publica pesos en precision completa (safetensors) |
| Idiomas soportados | Ingles (en) y chino (zh) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors, compatible con Diffusers |
| Resolucion de salida | 720p |
| Cadencia de fotogramas | 24 fps |
| Tareas soportadas | Texto-a-video (T2V) e imagen-a-video (I2V) |
| Tamano del repositorio | 34,2 GB |
| Pipeline declarado | text-to-video |
| Libreria | wan2.2 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma de difusion sobre un transformer (DiT) aplicado a latentes de video, en lugar de una arquitectura autoregresiva basada en tokens. La pieza diferencial es el Wan2.2-VAE, que comprime el video con un factor de 16x16x4: reduce drasticamente el numero de elementos latentes a procesar y, en consecuencia, el coste computacional por fotograma en resoluciones altas. Esa compresion es lo que permite que un modelo de 5B parametros sostenga 720p a 24 fps en una GPU de consumo. El checkpoint cubre tanto generacion desde texto como animacion desde una imagen de partida, sin necesidad de cambiar de modelo.

En cuanto a los datos, la model card indica que Wan2.2 se entreno con un volumen significativamente mayor que Wan2.1: un 65,6 % mas de imagenes y un 83,2 % mas de videos. El corpus incorpora datos esteticos etiquetados de forma detallada en iluminacion, composicion, contraste y tono de color, lo que permite generar estilos cinematograficos controlables. No se especifican en la informacion disponible el numero exacto de tokens o fotogramas de entrenamiento, la composicion interna del dataset ni si se aplicaron etapas de RLHF o DPO.

La innovacion MoE que describe la model card (separar el proceso de denoising en expertos especializados por tramos de timestep) pertenece a las variantes T2V-A14B e I2V-A14B de la familia. El TI2V-5B aqui descrito no se presenta como MoE en la documentacion consultada.

## Capacidades

- Generacion de video a partir de texto (T2V) a 720p y 24 fps.
- Generacion de video a partir de una imagen (I2V), animando una fotografia o ilustracion de entrada a 720p y 24 fps.
- Modelo unificado: un mismo checkpoint resuelve ambas tareas, sin necesidad de cargar pesos distintos.
- Control de estetica cinematografica mediante descripciones de iluminacion, composicion, contraste y tono de color.
- Generacion de movimiento complejo, reforzada por el aumento de datos respecto a Wan2.1 en movimiento y semantica.
- Prompts en ingles y en chino; no se documentan otros idiomas con garantias.
- Integracion con Diffusers y ComfyUI, lo que habilita flujos de trabajo por nodos y pipelines programaticos en Python.
- Inferencia multi-GPU para el modelo de 5B segun el codigo de inferencia publicado.
- No se documenta en la informacion disponible soporte de tool calling, function calling, agentes, audio, vision de entrada generica ni modo de razonamiento explicito.

## Casos de uso

- Prototipado rapido de video publicitario: un estudio puede generar variaciones de un anuncio en 720p partiendo de guiones o de un fotograma clave, con una sola GPU de consumo, y evaluar direcciones creativas antes de producir en alta calidad.
- Animacion de catalogo en comercio electronico: a partir de la fotografia de un producto (I2V), el modelo genera un clip corto con movimiento de camara o de producto, reutilizable en fichas de tienda y redes sociales sin sesion de rodaje.
- Previsualizacion de storyboard en cine y animacion: convertir bocetos o conceptos en clips animados de 720p para validar ritmo y puesta en escena con el equipo antes de la produccion final.
- Generacion de datos sinteticos de video para entrenar o evaluar otros modelos: el modelo puede poblar un dataset con clips etiquetados que cubran condiciones de iluminacion y composicion poco frecuentes en datos reales.
- Contenido educativo y divulgativo: ilustrar conceptos fisicos, biologicos o historicos con clips breves generados desde una descripcion textual, reduciendo la dependencia de material de archivo con licencia.
- Redes sociales y formatos verticales: produccion de clips cortos y llamativos a partir de una frase o una imagen, con control de estilo, para publicacion rapida y a bajo coste.
- Automatizacion de pipelines creativos en ComfyUI: encadenar el modelo con upscalers, interpoladores de fotogramas y correctores de color dentro de un grafo nodal, integrandolo en una linea de produccion repetible.
- Investigacion en generacion de video: al ser un modelo abierto con pesos y codigo de inferencia publicados, sirve como base para experimentar con VAE de alta compresion, destilacion y tecnicas de aceleracion de muestreo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card afirma de forma cualitativa que Wan2.2 alcanza un rendimiento "TOP" entre los modelos abiertos y cerrados, y que el TI2V-5B es uno de los modelos de 720p@24fps mas rapidos disponibles, pero no se acompañan cifras de VBench, FVD, CLIPScore ni de ninguna otra metrica, ni comparaciones numericas con alternativas. No se incluyen datos de latencia por clip ni de throughput medido.

## Requisitos de hardware

- VRAM estimada: el repositorio completo ocupa 34,2 GB, pero no toda esa cifra se carga simultaneamente. Los pesos del transformer de 5B en bf16 rondan los 10 GB; a esa cifra hay que sumar el codificador de texto, el VAE y las activaciones, por lo que una estimacion prudente se situa en el entorno de 16-24 GB segun la configuracion de muestreo y el uso de offloading. La descomposicion exacta de componentes no esta documentada en la informacion proporcionada.
- GPU recomendadas: la model card indica explicitamente que el TI2V-5B puede ejecutarse en una unica GPU de consumo, citando la RTX 4090 (24 GB) como referencia. Para despliegue con varias instancias o mayor resolucion de lote, GPU de datacenter como A100 o H100 ofrecen margen adicional.
- Compatibilidad con GPU de consumo: si, segun la documentacion oficial, en tarjetas del nivel de la RTX 4090. El codigo de inferencia publicado contempla ejecucion multi-GPU, lo que permite repartir el modelo entre varias tarjetas.
- Opciones de despliegue: Diffusers (integracion oficial confirmada), ComfyUI (integracion confirmada), scripts de inferencia multi-GPU del repositorio Wan2.2, ademas de la via ModelScope para la descarga. No se documenta soporte especifico de vLLM, TGI, llama.cpp ni Ollama, que son herramientas orientadas a modelos de lenguaje y no a difusion de video.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Arquitectura | Tareas | Resolucion | Disponibilidad | Licencia |
|---|---|---|---|---|---|---|
| Wan2.2-TI2V-5B (este) | 5B | Difusion con VAE 16x16x4 | T2V + I2V, 24 fps | 720p | HuggingFace y ModelScope, Diffusers y ComfyUI | Apache-2.0 |
| Wan2.2-T2V-A14B | 14B (MoE) | Difusion con MoE | T2V | 480p y 720p | HuggingFace y ModelScope | No especificada en la informacion proporcionada |
| Wan2.2-I2V-A14B | 14B (MoE) | Difusion con MoE | I2V | 480p y 720p | HuggingFace y ModelScope | No especificada en la informacion proporcionada |
| Wan2.1 | No disponible | Difusion | T2V / I2V | No disponible | HuggingFace (repositorio previo) | No especificada en la informacion proporcionada |

El criterio de eleccion dentro de la propia familia es claro: el TI2V-5B es la variante orientada a coste y latencia, ejecutable en una GPU de consumo, mientras que las A14B priorizan capacidad del modelo mediante MoE y cubren 480p ademas de 720p. No se dispone de datos numericos que permitan comparar la calidad relativa entre ellas ni frente a modelos cerrados.

## Limitaciones y advertencias

- No se han publicado metricas de benchmarks verificables, por lo que las afirmaciones de rendimiento de la model card son cualitativas y no auditables con la informacion disponible.
- Este repositorio concreto es una resubida de un tercero (Yuro1991), con cero descargas y cero valoraciones en el momento de la consulta, sin relacion aparente con el equipo Wan. No hay garantia de que los pesos coincidan bit a bit con el checkpoint oficial ni de que el repositorio se mantenga actualizado.
- La fecha de creacion del repositorio figura como 2026-09-11, incoherente con el lanzamiento de Wan2.2 en julio de 2025; conviene verificar la procedencia de los archivos antes de usarlos en produccion.
- Riesgo de artefactos y de incoherencia temporal propios de los modelos de difusion de video: deformaciones anatomicas, movimiento poco fisico, parpadeo entre fotogramas y perdida de consistencia en clips largos.
- La generacion de texto legible dentro del video (rotulos, carteles, subtitulos) suele presentar errores; no debe asumirse fidelidad tipografica.
- Cobertura idiomatica limitada a ingles y chino; los prompts en otras lenguas, incluido el castellano, pueden degradar el seguimiento de instrucciones.
- No se documentan en la informacion disponible sesgos demograficos medidos ni evaluaciones de seguridad, por lo que se recomienda auditar las salidas antes de publicarlas.
- La licencia Apache-2.0 permite uso comercial y modificacion sin restricciones de pago, pero no exime de cumplir la normativa aplicable sobre contenido generado, derechos de imagen y marcado de contenido sintetico.
- El modelo no incorpora mecanismos de moderacion; cualquier filtrado de prompts y salidas debe implementarse en la capa de aplicacion.
- Los requisitos reales de VRAM dependen de la resolucion, el numero de fotogramas y la estrategia de offloading; conviene medir el consumo en el hardware objetivo antes de dimensionar infraestructura.

## Enlaces

- Repositorio analizado: https://huggingface.co/Yuro1991/Wan2.2-TI2V-5B
- Checkpoint oficial del mismo modelo: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- Organizacion oficial en HuggingFace: https://huggingface.co/Wan-AI/
- Repositorio de codigo e inferencia: https://github.com/Wan-Video/Wan2.2
- Repositorio del modelo predecesor: https://github.com/Wan-Video/Wan2.1
- Informe tecnico (arXiv:2503.20314): https://arxiv.org/abs/2503.20314
- Sitio del proyecto y blog: https://wan.video
- Blog de presentacion: https://wan.video/welcome
- ModelScope (variante oficial): https://modelscope.cn/models/Wan-AI/Wan2.2-TI2V-5B
- Comunidad en Discord: https://discord.gg/AKNgpMK4Yj

Nota: la busqueda web realizada no devolvio ningun resultado relacionado con el modelo; los enlaces recuperados correspondian a un sitio de ajedrez y se han descartado por no ser relevantes.
