# wardner/Depth-Anything-V3

## Resumen

Depth-Anything-V3 es un paquete de despliegue para estimacion monocular de profundidad, empaquetado por el usuario wardner para el hardware de Rockchip. El repositorio no contiene pesos originales en formato estandar (safetensors o PyTorch), sino artefactos convertidos a RKNN para la tarjeta de computo RK182x (generacion de 1,82 TOPS), pensados para ejecutarse sobre una plataforma host RK3588 con el runtime RKLLM + RKNN. La tarea resuelta es la inferencia de profundidad por pixel a partir de una imagen de entrada, devolviendo un mapa de profundidad y una estimacion de confianza.

El paquete se distribuye como una unidad de despliegue completa: tres grafos RKNN (global, head y local) con sus ficheros de pesos asociados, mas un manifiesto de worker (`DepthAnythingV3.json`) que describe la integracion con el backend wdnwebui. El tamano total de pesos es de 1,04 GB y el repositorio ocupa 1,1 GB. La resolucion de trabajo declarada en los nombres de fichero es de 280x280 con una sola vista.

Es relevante para quienes integran vision por computador en dispositivos de borde con aceleradores Rockchip, ya que evita la conversion manual del modelo original y ofrece una ruta de instalacion y verificacion documentada. Conviene senalar que la ficha tecnica del autor etiqueta el modelo como "LLM" y lo asocia a "qwen", lo cual es incoherente con la funcion real (estimacion de profundidad), por lo que esos metadatos deben tratarse con cautela.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el repositorio solo distribuye grafos RKNN convertidos; no se documenta la arquitectura del modelo original) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible (modelo de vision, no de texto) |
| Tipos de cuantizacion | no disponible (pesos empaquetados como ficheros `.weight` para RKNN; no se detalla el esquema de cuantizacion) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | RKNN (grafos `.rknn`) + ficheros `.weight` propietarios del runtime; no hay safetensors ni GGUF |

Otros datos declarados por el autor:

| Parametro | Valor |
|---|---|
| Objetivo de computo | RK182x (tarjeta de computo, 1,82 TOPS) |
| Plataforma host | RK3588 |
| Runtime | RKLLM + RKNN |
| Capacidad declarada | `swcap_vision_depth` |
| Factory de worker | `depth_anything_v3` |
| Memoria estimada | ~3000 MB |
| Tiempo de inicializacion | ~30 s |
| Tarjetas requeridas | 1 |
| Tamano total de pesos | 1,04 GB |
| Resolucion de entrada | 280x280, 1 vista |
| Grafo global | 2,7 MB (RKNN) + 552,7 MB (pesos) |
| Grafo head | 1,8 MB (RKNN) + 188,0 MB (pesos) |
| Grafo local | 1,7 MB (RKNN) + 316,6 MB (pesos) |
| Manifiesto | `DepthAnythingV3.json` (1943 B, texto plano, fuera de Git LFS) |

## Arquitectura y entrenamiento

No se dispone de informacion sobre la arquitectura del modelo original ni sobre su proceso de entrenamiento (numero de tokens, composicion del dataset, uso de RLHF/DPO u otras tecnicas). El repositorio es una conversion de terceros: el autor indica explicitamente que los ficheros son "RKNN-converted derivatives, not unmodified upstream weights". La unica informacion estructural deducible son los tres componentes del grafo (global, head y local), lo que sugiere una descomposicion modular del pipeline de estimacion de profundidad, aunque el detalle de cada componente no esta documentado.

El pipeline de despliegue se apoya en el runtime RKLLM + RKNN sobre RK3588 con aceleracion en la tarjeta RK182x. El manifiesto `DepthAnythingV3.json` actua como "manual de la unidad de distribucion" y contiene los detalles por modelo (valores por defecto de muestreo, disposicion de capacidades y efectos secundarios) en su campo `notes`, que no se reproduce en la model card. La instalacion se realiza clonando el repositorio en el directorio de modelos del backend wdnwebui, que reescanea el directorio raiz cada ~2 s sin necesidad de reinicio; el directorio se localiza mediante la variable de entorno `WDNAI_DEPTH_ANYTHING_V3_DIR` declarada en el manifiesto.

## Capacidades

- Estimacion monocular de profundidad: dada una imagen, produce un mapa de profundidad por pixel.
- Salida de confianza asociada a la estimacion de profundidad.
- Integracion como worker en el backend wdnwebui mediante el manifiesto `DepthAnythingV3.json`.
- Capacidad declarada `swcap_vision_depth` en el sistema de capacidades del runtime.
- Verificacion de integridad mediante `SHA256SUMS`.
- Soporte de descarga via `hf download` o `git clone` con Git LFS, y via mirror (`HF_ENDPOINT=https://hf-mirror.com`) para redes con acceso bloqueado.
- No se documentan capacidades de generacion de texto, razonamiento, codigo, tool calling, agentes ni audio. Los tags "LLM" y "qwen" del repositorio no se corresponden con ninguna funcionalidad descrita.

## Casos de uso

- Robotica movil sobre RK3588: el modelo proporciona mapas de profundidad a 280x280 para navegacion y evitacion de obstaculos en robots de bajo consumo, ejecutandose en la tarjeta RK182x con ~3000 MB de memoria estimada.
- Reconstruccion 3D y fotogrametria ligera: la salida de profundidad por pixel y la confianza permiten generar nubes de puntos o mallas en pipelines de captura, con la ventaja de ejecutarse en el propio dispositivo de borde.
- Realidad aumentada y efectos de desenfoque: la profundidad permite segmentar planos y aplicar desenfoque de fondo en tiempo de captura sobre hardware Rockchip, sin depender de la nube.
- Inspeccion industrial y agricola: estimacion de distancia a objetos en camaras fijas montadas en equipos de campo, aprovechando el bajo consumo del acelerador RK182x.
- Drones y vehiculos no tripulados: percepcion de profundidad como apoyo a la planificacion de trayectorias, con inicializacion de ~30 s que debe tenerse en cuenta en el arranque del sistema.
- Prototipado de vision en borde: el paquete ya convertido evita el flujo de conversion ONNX/RKNN y permite validar rapidamente la integracion en wdnwebui antes de escalar a produccion.
- Investigacion en estimacion de profundidad: sirve como referencia de despliegue cuantizado en NPU Rockchip para comparar la perdida de precision frente al modelo original en GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas de error de profundidad (por ejemplo, RMSE, AbsRel o delta thresholds) ni comparaciones con el modelo original. Los unicos datos de rendimiento declarados son la memoria estimada (~3000 MB), el tiempo de inicializacion (~30 s) y las capacidades de la tarjeta de computo (1,82 TOPS), que no constituyen una medida de calidad de la prediccion.

## Requisitos de hardware

- Memoria estimada en ejecucion: ~3000 MB, segun el manifiesto del autor.
- Acelerador requerido: tarjeta de computo RK182x (generacion de 1,82 TOPS); se declara una sola tarjeta necesaria.
- Plataforma host: RK3588 con runtime RKLLM + RKNN.
- GPU de escritorio: no aplicable; el paquete esta compilado exclusivamente para NPU Rockchip y no se distribuyen pesos ejecutables en CUDA, ROCm ni CPU generica.
- GPU de consumo (RTX 4090, etc.): no compatible con este repositorio tal como se distribuye.
- Opciones de despliegue: backend wdnwebui (reescaneo del directorio de modelos cada ~2 s, sin reinicio) y runtime RKLLM + RKNN. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponibles. El tiempo de inicializacion declarado es de ~30 s.
- Almacenamiento: 1,1 GB de repositorio; 1,04 GB de pesos.

## Comparativa con modelos similares

No se dispone de datos de parametros, contexto ni rendimiento del modelo original ni de alternativas comparables en la informacion proporcionada, por lo que la comparacion cuantitativa no esta disponible. A modo de orientacion cualitativa sobre el formato de distribucion:

| Modelo | Formato | Destino | Licencia | Disponibilidad |
|---|---|---|---|---|
| Depth-Anything-V3 (wardner) | RKNN + `.weight` | NPU RK182x / host RK3588 | Apache 2.0 | Hugging Face, 0 descargas, 0 likes |
| Pesos originales de Depth Anything V3 | no disponible en esta informacion | GPU/CPU generica | no disponible | no disponible |
| Otras conversiones RKNN de modelos de vision | RKNN | NPU Rockchip | variable | no disponible |

## Limitaciones y advertencias

- Metadatos incoherentes: el autor etiqueta el modelo como "LLM" y "qwen", cuando la funcion descrita es estimacion de profundidad. No debe tratarse como un modelo de lenguaje.
- Solo hardware Rockchip: los artefactos son exclusivos para RK182x sobre RK3588; no hay pesos en safetensors, GGUF ni formatos ejecutables en GPU.
- Resolucion fija: los grafos estan compilados para 280x280 con una sola vista; no se documenta soporte para otras resoluciones o multiples vistas.
- Cuantizacion no documentada: no se especifica el esquema de cuantizacion ni la perdida de precision respecto al modelo original.
- Derivado de terceros: los ficheros son conversiones RKNN, no pesos upstream sin modificar; la calidad final depende del proceso de conversion del autor.
- Riesgo de error en profundidad: no se publican metricas de error, por lo que el rendimiento real en escenas dificiles (texturas repetitivas, superficies reflectantes, poca luz) no esta cuantificado.
- Adopcion nula: 0 descargas y 0 likes en el momento de la consulta, sin senales de validacion por parte de la comunidad.
- Detalles operativos ocultos: los valores por defecto de muestreo, la disposicion de capacidades y los efectos secundarios estan en el campo `notes` de `DepthAnythingV3.json`, no en la model card; conviene revisarlo antes de desplegar.
- Verificacion obligatoria: debe ejecutarse `sha256sum -c SHA256SUMS` y confirmar que todas las entradas reportan `OK` antes del despliegue.
- Licencia: Apache 2.0 permite uso comercial, pero al ser un derivado conviene revisar `LICENSE` y `NOTICE` para respetar los avisos del modelo original.
- Idiomas: no aplica ni se documenta; el modelo procesa imagenes, no texto.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/wardner/Depth-Anything-V3
- Mirror alternativo para descarga: https://hf-mirror.com
- Manifiesto de worker: `DepthAnythingV3.json` (incluido en el repositorio)
- Fichero de verificacion: `SHA256SUMS` (incluido en el repositorio)
- Licencia: `LICENSE` (incluido en el repositorio)
- Avisos: `NOTICE` (incluido en el repositorio)
- Paper, blog o repositorio del modelo original: no disponible en la informacion proporcionada
