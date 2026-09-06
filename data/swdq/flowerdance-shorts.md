# swdq/FlowerDance-Shorts

## Resumen

FlowerDance-Shorts es un modelo de generacion de danza 3D a partir de audio, desarrollado por swdq como fine-tuning del modelo FlowerDance original. Esta version ha sido ajustada para generar un bailarin unico a partir de la senal de audio completa, sin necesidad de introducir un genero musical ni segmentar la pista. El modelo base, FlowerDance, fue presentado en ECCV 2026 y combina un flujo de rectificacion (MeanFlow) con restricciones de consistencia fisica para producir movimiento expresivo y eficiente en memoria.

El checkpoint publicado corresponde a la epoch 850 de un proceso de entrenamiento que partio de un modelo de 390 epochs y se detuvo en la epoch 853. Se entreno con datos extraidos de 127 videos, utilizando pseudo-etiquetas generadas por SAM3 Body/MHR y mapeadas a un esqueleto de 24 articulaciones. La arquitectura usa un decoder BiMamba con dimension latente de 512, 8 capas de danza y 4 capas de musica. El modelo tiene 62.948.503 parametros y se distribuye en formato safetensors, con un tamano de repositorio de 0.4 GB.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | BiMamba decoder (latent 512, 8 dance layers, 4 music layers) |
| Parametros totales | 62.948.503 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No aplica (modelo de musica a danza) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Japones (etiqueta de metadatos); no aplica al dominio de entrada de audio |
| Licencia | No disponible |
| Formato de pesos | Safetensors |

## Arquitectura y entrenamiento

FlowerDance-Shorts es un modelo de generacion de movimiento 3D, no un modelo de lenguaje. Se basa en el modelo FlowerDance, que introduce un decodificador BiMamba para modelar la secuencia de movimiento condicionada por caracteristicas de audio. El proceso de inferencia utiliza 40 pasos de Euler con semilla 1234 y un identificador de genero interno fijado en 5, de modo que el usuario no necesita especificar el estilo de baile.

El fine-tuning se realizo sobre datos de 127 videos, partiendo de un checkpoint de 390 epochs y continuando hasta la epoch 853; los pesos publicados corresponden a la epoch 850. El objetivo de entrenamiento fue la prediccion de velocidad de flujo rectificado (rectified-flow velocity prediction) con intervalo cero, complementado con perdidas de cinematica directa (FK), velocidad y aceleracion. Las pseudo-etiquetas de entrenamiento no son anotaciones manuales: se generaron mediante SAM3 Body/MHR y se convirtieron al esqueleto de 24 articulaciones usando cinematica inversa aproximada, lo que implica que el desplazamiento global y la torsion de las articulaciones no se recuperan con precision.

La entrada de audio se procesa a 30 Hz con 35 canales. La salida de movimiento consta de 151 canales: 4 canales de contacto, posicion global (root XYZ) y 24 rotaciones de articulaciones en representacion 6D. El modelo procesa la secuencia completa en cada paso; el parametro de construccion `seq_len=1200` no limita la salida a 40 segundos, sino que se refiere a la longitud interna de la ventana.

## Capacidades

- Generacion de danza 3D de un unico bailarin a partir de un archivo de audio completo (de 1 segundo a 6 minutos).
- Salida de movimiento en dos formatos: secuencia cruda a 30 Hz y pose relativa a la raiz en 60 Hz (frames repetidos solo para reproduccion).
- Sincronizacion del movimiento con el ritmo y la estructura musical, sin necesidad de entrada de genero.
- Procesamiento de secuencias largas sin segmentacion explicita de la pista de audio.
- El repositorio incluye un script de inferencia (`infer_safetensors.py`) que genera un archivo NPZ con el movimiento.
- El Space de HuggingFace asociado acepta subidas de audio, procesa la secuencia completa y devuelve un video con esqueleto frontal/lateral junto al NPZ.
- Tambien ofrece una previsualizacion 3D retargetizada al personaje Fuwawa Abyssgard, con un archivo VMD opcional.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso, al tratarse de un modelo de generacion de movimiento condicionado por audio.

## Casos de uso

- Generacion de contenido para redes sociales: el modelo puede crear animaciones de baile a partir de canciones populares, permitiendo producir videos cortos para plataformas como Shorts, Reels o TikTok sin necesidad de captura de movimiento.
- Animacion de personajes en videojuegos: los desarrolladores pueden usar el modelo para generar secuencias de baile para NPCs o avatares, partiendo de una pista de audio y adaptando el movimiento a un esqueleto de 24 articulaciones.
- Avatares virtuales y Vtubers: la salida de movimiento puede retargetizarse a un personaje 3D para que baile en sincronia con la musica en transmisiones en directo o videos pregrabados.
- Prototipado de video musical generativo: artistas y creadores pueden explorar coreografias automaticas para canciones originales, usando el audio como unica entrada.
- Visualizacion de coreografias en entornos educativos: instructores de danza pueden generar movimientos de referencia para comparar con coreografias existentes, siempre que acepten las limitaciones de precision del modelo.
- Investigacion en generacion de movimiento humano: el modelo sirve como punto de partida para experimentos de fine-tuning en tareas de musica a danza, dado que el codigo fuente y los scripts de inferencia estan disponibles en el repositorio.
- Pruebas de concepto para pipelines de animacion: el formato de salida NPZ y el script de inferencia permiten integrar el modelo en flujos de trabajo de renderizado 3D con herramientas como Blender o Unity, tras un postprocesado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye una evaluacion de reconstruccion sobre dos ejemplos del conjunto de entrenamiento, no una evaluacion de generalizacion:

| Ejemplo | Criterio de seleccion | MPJPE relativo a la raiz (epoch 850) | Relacion movimiento/objetivo | Desplazamiento maximo por articulacion y frame |
|---|---|---|---|---|
| マリ箱ダンス | Perdida mediana | 2.94 cm | 0.995 | 0.227 m |
| 新宝島踊ってみた | Perdida mas alta | 3.28 cm | 0.952 | 1.062 m |

Estos valores corresponden a comparaciones de reconstruccion sobre el conjunto de entrenamiento, no a precision en datos no vistos. La nota del autor advierte que una perdida baja no establece que la coreografia sea realista o correcta para musica nueva.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible oficialmente. Dado que los pesos safetensors ocupan 0.4 GB y el modelo tiene 62.9 millones de parametros, la inferencia deberia caber en GPUs de consumo con al menos 2 GB de VRAM, pero no hay un dato confirmado.
- GPU recomendada: NVIDIA GB10 (DGX Spark) fue el entorno probado por el autor, con Python 3.12, PyTorch 2.14 y CUDA 13. Se requiere una instalacion de PyTorch compatible con CUDA y una extension nativa `selective_scan_cuda` de Mamba.
- Cabe en GPU de consumo: si se instala correctamente la extension de Mamba, es probable que funcione en tarjetas como la serie RTX 3060 o superiores, aunque no hay confirmacion explicita.
- Opciones de despliegue: el repositorio proporciona `infer_safetensors.py` para inferencia local. Tambien existe un Space ZeroGPU en HuggingFace que ejecuta el modelo con Python 3.12 y PyTorch 2.9.1.
- Latencia y throughput: no disponible.
- Dependencias adicionales: se requiere instalar `mamba-ssm` con `--no-build-isolation` y disponer de ffmpeg en el sistema. La extension Mamba es especifica de la arquitectura y no se incluye como binario ARM64.

## Comparativa con modelos similares

La comparacion mas directa es con el modelo base FlowerDance original (xlt99/FlowerDance). No se dispone de datos de otros modelos de musica a danza comparables en la informacion proporcionada.

| Caracteristica | FlowerDance (base) | FlowerDance-Shorts (fine-tuning) |
|---|---|---|
| Parametros | No disponible | 62.948.503 |
| Arquitectura | MeanFlow + restricciones de consistencia fisica | BiMamba decoder (fine-tuning) |
| Entrenamiento | Modelo original ECCV 2026 | Fine-tuning desde epoch 390, publicado en epoch 850 |
| Datos | No disponible | 127 videos con pseudo-etiquetas SAM3 Body/MHR |
| Licencia | No disponible | No disponible |
| Disponibilidad | Repositorio GitHub y HuggingFace | HuggingFace con safetensors y codigo de inferencia |

No se dispone de informacion sobre otros modelos como EDGE o Dance Diffusion en la busqueda realizada.

## Limitaciones y advertencias

- Las pseudo-etiquetas de entrenamiento no son anotaciones manuales ni ajustes SMPL con licencia; por tanto, la precision de la coreografia generada no esta garantizada.
- El modelo genera un unico bailarin, incluso si el video fuente contiene varias personas.
- El desplazamiento global y la torsion de las articulaciones no se recuperan con precision, lo que puede provocar movimientos poco realistas en ciertos casos.
- La evaluacion de la model card se basa en reconstrucciones del conjunto de entrenamiento, no en datos no vistos, por lo que el rendimiento en musica nueva no ha sido validado formalmente.
- Los medios de origen (musica y videos) conservan sus respectivos derechos de propiedad; la publicacion del modelo no otorga derechos sobre esos contenidos.
- No se declara ninguna licencia para los pesos del modelo ni para el codigo de FlowerDance; la licencia de la version vendored de Mamba se mantiene en `vendor/MAMBA_LICENSE`.
- El modelo no es un checkpoint de Transformers `AutoModel`, por lo que no puede cargarse con `from_pretrained` estandar.
- La instalacion requiere compilar o instalar la extension `mamba-ssm` con soporte CUDA, lo que puede ser problematico en sistemas sin un toolchain compatible.
- Los dedos, expresiones faciales y dinamicas secundarias de pelo o tela no se predicen; el retargeting a personajes 3D se limita a los huesos del cuerpo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/swdq/FlowerDance-Shorts
- Demo en Space: https://huggingface.co/spaces/swdq/FlowerDance-Shorts
- Repositorio del modelo base: https://github.com/XulongT/FlowerDance
- Pagina del paper FlowerDance (ECCV 2026): https://sun-happy-ykx.github.io/FlowerDance/
- Modelo base en HuggingFace: https://huggingface.co/xlt99/FlowerDance
