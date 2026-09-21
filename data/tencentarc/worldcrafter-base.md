# TencentARC/WorldCrafter-Base

## Resumen

WorldCrafter-Base es un modelo de difusión para generación de vídeo publicado por TencentARC en Hugging Face con el identificador TencentARC/WorldCrafter-Base. El repositorio contiene los pesos "base" del sistema WorldCrafter: el transformer principal, un adaptador de cámara (camera adapter) y un LoRA asociado, preparados para ejecutarse con el código de inferencia del proyecto. Cuenta con 14.291.783.744 parámetros (unos 14,3 B) y un repositorio de 59,5 GB, lo que lo sitúa en la gama alta de los generadores de vídeo de pesos abiertos.

No se trata de un modelo autocontenido. La model card indica que estos pesos leen los componentes compartidos `repencoder/`, `text_encoder/`, `tokenizer/`, `vae/` y `scheduler/` desde el directorio de `WorldCrafter-Fast`, con la ruta relativa configurada en `inference_config.json`. Es decir, Base aporta únicamente el transformer y el adaptador de cámara específicos, y depende de la otra variante para el resto del pipeline.

Sus etiquetas oficiales lo describen como text-to-video, image-to-video y con control de cámara, orientándolo a la generación de vídeo condicionada por imagen y por trayectorias de cámara, una capacidad poco habitual en modelos abiertos de este tamaño. Como contrapartida, la ficha pública no incluye licencia, idiomas soportados, detalles de entrenamiento ni resultados de benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion para generacion de video (componente transformer del pipeline WorldCrafter, con adaptador de camara y LoRA); la model card no detalla el diseno interno |
| Parametros totales | 14.291.783.744 (~14,3 B) |
| Parametros activos | no aplica (no se declara una arquitectura MoE) |
| Longitud de contexto | no disponible (modelo de difusion: no se documenta ni la longitud del prompt ni la duracion del video generado) |
| Tipos de cuantizacion | no disponible (el repo distribuye pesos safetensors; no se documentan variantes GGUF, FP8 ni INT) |
| Idiomas soportados | no disponible (el pipeline usa un `text_encoder` y un `tokenizer` compartidos, pero no se declara el conjunto de idiomas) |
| Licencia | no disponible |
| Formato de pesos | safetensors, cargados mediante diffusers |

## Arquitectura y entrenamiento

La informacion disponible describe un pipeline de difusion para video compuesto por varias piezas: un transformer (los pesos de este repositorio), un `repencoder` (codificador de representaciones usado como condicionamiento), un `text_encoder` con su `tokenizer`, un `vae` y un `scheduler`. Los pesos de Base se acompanan de un adaptador de camara y un LoRA especificos, que deben mantenerse juntos segun la model card; el paquete incluye un fichero `SHA256SUMS` para verificar la integridad de los ficheros propios de Base, mientras que los hashes de los componentes compartidos se registran en el paquete de `WorldCrafter-Fast`.

No se dispone de informacion sobre el numero de tokens o de fotogramas de entrenamiento, la composicion del dataset, ni sobre si hubo etapas de ajuste fino con preferencias (RLHF, DPO) o destilacion. La existencia de una variante denominada `Fast` sugiere una relacion entre un modelo de referencia y una version acelerada o destilada, pero la model card no confirma esa relacion ni describe el procedimiento. Tampoco se documentan innovaciones tecnicas concretas (atencion lineal, decodificacion especulativa, destilacion de pasos) mas alla de la presencia del adaptador de control de camara.

## Capacidades

- Generacion de video condicionada por imagen (la etiqueta de pipeline declarada es image-to-video).
- Generacion de video a partir de texto, segun la etiqueta `text-to-video` del repositorio.
- Control de camara, mediante un adaptador especifico empaquetado junto a los pesos del transformer.
- Composicion mediante LoRA, ya que el repositorio incluye un LoRA asociado al adaptador.
- No hay evidencia de soporte de tool calling, function calling ni uso como agente multi-paso: es un modelo generativo de video, no un modelo de lenguaje conversacional.
- Capacidades multilingues: no disponibles; no se declara la cobertura idiomatica del `text_encoder` compartido.
- Capacidades especiales adicionales (modo thinking, audio, vision de entrada mas alla de la imagen de condicionamiento): no disponibles en la informacion proporcionada.

## Casos de uso

- Previsualizacion de storyboards en produccion audiovisual: a partir de un fotograma o ilustracion se genera un plano en movimiento, lo que permite validar encuadre y ritmo antes de rodar.
- Planificacion de movimientos de camara: el adaptador de camara permite generar travellings, orbitas o paneos controlados para comparar alternativas de puesta en escena sin coste de rodaje.
- Generacion de B-roll y material de recurso: crear clips de apoyo para montaje a partir de imagenes fijas, reduciendo la dependencia de banco de imagenes.
- Prototipado creativo en publicidad: convertir un frame de concepto en un anuncio animado de pocos segundos para presentaciones a cliente.
- Aumento de datos sinteticos para vision por computador: generar secuencias de video etiquetadas con control de camara conocido, utiles para entrenar o evaluar modelos de odometria visual, profundidad o seguimiento.
- Investigacion en difusion de video: los pesos Base permiten estudiar el comportamiento del transformer de referencia y compararlo con la variante `Fast` en experimentos controlados (ablaciones de pasos, adaptadores o LoRA).
- Simulacion de entornos para robotica y agentes encarnados: la combinacion de nombre del proyecto (WorldCrafter) y codificador de representaciones apunta a la generacion de escenas condicionadas, aunque la model card no documenta este uso de forma explicita.
- Iteracion de diseno de personajes o escenarios: partir de un unico diseno y generar variaciones animadas manteniendo la identidad visual del fotograma de entrada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de TencentARC/WorldCrafter-Base no incluye metricas cuantitativas (FVD, CLIP-score, VBench ni similares) ni comparaciones con otros modelos, y la busqueda web realizada no aporto documentacion tecnica relevante.

## Requisitos de hardware

- VRAM estimada para el transformer: unos 28,6 GB en bf16/fp16, calculados a partir del recuento de parametros (14,29 B x 2 bytes). Es una estimacion propia, no publicada por el autor.
- VRAM total del pipeline: los pesos de Base no bastan; hay que sumar el `text_encoder`, el `vae` y el `repencoder` que se cargan desde `WorldCrafter-Fast`. Como referencia de orden de magnitud, el repositorio completo ocupa 59,5 GB en disco, por lo que un despliegue en precision nativa requiere previsiblemente entre 40 y 60 GB de VRAM. Cifra no confirmada por el autor.
- GPU recomendadas: A100 80 GB o H100 80 GB para un despliegue sin offloading; configuraciones multi-GPU de 40 GB (A100 40 GB, L40S) probablemente necesiten paralelismo de modelo u offloading secuencial.
- GPU de consumo: no cabe en una RTX 4090 (24 GB) en bf16 sin offloading a CPU o sin cuantizacion, y el repositorio no documenta variantes cuantizadas. Una RTX 3090/4090 podria servir para pruebas con offloading agresivo, a costa de latencias muy altas.
- Opciones de despliegue: diffusers, a traves del `WorldCrafterPipeline` referenciado en las etiquetas del repositorio. No se documenta soporte para vLLM, TGI, Ollama ni llama.cpp, que en cualquier caso no son herramientas orientadas a este tipo de modelo.
- Almacenamiento: al menos 60 GB libres para el paquete completo (Base mas los componentes compartidos de Fast).
- Latencia y throughput: no disponibles. No se publican tiempos de generacion por clip, numero de pasos de muestreo ni resoluciones soportadas.

## Comparativa con modelos similares

No se proporciono informacion de modelos comparables en el material disponible, y la model card no incluye ninguna comparacion. Como referencia cualitativa, WorldCrafter-Base se situa por tamano (14,3 B de parametros, solo transformer) en la misma categoria que otros generadores de video abiertos de gran escala, como HunyuanVideo (13 B), Wan2.1 en su variante de 14 B o CogVideoX-5B en una franja inferior. Sin embargo, no es posible establecer una comparacion rigurosa porque de WorldCrafter-Base se desconocen licencia, idiomas, resolucion, duracion de clip y rendimiento medido.

| Aspecto | WorldCrafter-Base | Alternativas abiertas de la misma franja |
|---|---|---|
| Parametros | 14,3 B (transformer) | no disponible en la informacion proporcionada |
| Longitud de contexto / duracion | no disponible | no disponible |
| Control de camara | si (adaptador especifico) | variable segun el modelo; no verificado |
| Licencia | no disponible | no disponible |
| Rendimiento medido | sin benchmarks publicados | no disponible |

## Limitaciones y advertencias

- Dependencia externa: los pesos no son autonomos. Requieren los directorios `repencoder/`, `text_encoder/`, `tokenizer/`, `vae/` y `scheduler/` de `WorldCrafter-Fast`; sin ellos el pipeline no arranca. La ruta se define en `inference_config.json` y debe respetarse la estructura relativa entre ambos directorios.
- Licencia no disponible: al no declararse licencia, no puede asumirse permiso de uso comercial. Cualquier despliegue en produccion requiere aclarar antes las condiciones con TencentARC.
- Ausencia de benchmarks: no hay metricas publicadas de calidad visual, coherencia temporal ni fidelidad al prompt, por lo que el rendimiento real es desconocido.
- Validacion comunitaria minima: el repositorio registra 0 descargas y 2 "me gusta" en el momento de la consulta, y fue creado y actualizado en septiembre de 2026. No hay evidencia de uso en produccion ni reportes independientes.
- Riesgo de artefactos: los modelos de difusion de video tienden a producir incoherencias temporales, deformaciones en movimiento rapido y deriva de identidad en secuencias largas. No hay documentacion que cuantifique estos fallos en este modelo concreto.
- Sesgos: no documentados. Los datasets de video suelen infrarrepresentar determinadas culturas, idiomas y tipos corporales; al no publicarse la composicion del entrenamiento, no puede evaluarse el sesgo.
- Idioma: se desconoce que idiomas cubre el `text_encoder` compartido, por lo que la calidad de los prompts en castellano no esta garantizada.
- Opacidad del entrenamiento: sin datos de tokens, dataset, etapas de ajuste o tecnica de destilacion, no es posible reproducir ni auditar el modelo.
- Restricciones practicas: la huella de memoria (del orden de decenas de GB de VRAM) y los 59,5 GB de disco limitan su uso a infraestructura con GPU de datacenter.
- Terminologia: la model card no confirma que WorldCrafter sea un "world model" en el sentido de simulador de entorno; conviene no asumir esa funcionalidad mas alla de lo que declaran las etiquetas (text-to-video, image-to-video, camera-control).

## Enlaces

- Hugging Face: https://huggingface.co/TencentARC/WorldCrafter-Base
- Repositorio de codigo de WorldCrafter: no disponible (la model card menciona `inference.py` y un "code repository root", pero no incluye la URL)
- Pesos y componentes compartidos (`WorldCrafter-Fast`): no disponible (la model card lo referencia como directorio hermano, sin enlace)
- Paper, blog tecnico o demo: no disponible
- La busqueda web realizada no devolvio ningun resultado relevante sobre el modelo; todos los enlaces obtenidos eran ajenos al contenido tecnico solicitado.
