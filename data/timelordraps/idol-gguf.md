# TimeLordRaps/Idol-GGUF

## Resumen

Idol-GGUF es una cuantización mixta de ocho bits del modelo Idol, desarrollado por SperiD Labs y distribuido en formato GGUF por el usuario TimeLordRaps. Idol es un modelo de reconstrucción 3D a partir de una única imagen (image-to-3D) que genera una nube de puntos gaussianos tridimensional, empleando una arquitectura de denoiser con decodificador de octree y decodificador gaussiano, junto con un módulo de eliminación de fondo. El paquete cuantizado contiene los cuatro componentes de Idol en un único archivo GGUF, mientras que los codificadores de imagen (DINOv3 y el VAE de FLUX.2-dev) se distribuyen por separado.

La relevancia de esta ficha radica en que permite ejecutar un pipeline de reconstrucción 3D gaussiana en hardware de consumo: según las mediciones del autor, una solicitud completa en una RTX 4090 con 50 pasos de denoising y 262.144 puntos gaussianos requiere unos 34,6 segundos y picos de asignación de memoria PyTorch de 4,39 GB. El modelo cuenta con 879.302.053 parámetros y se distribuye bajo licencia Apache 2.0, aunque los codificadores externos mantienen sus propias condiciones de acceso y licencia.

El modelo no procesa texto: acepta exclusivamente imágenes como entrada. Para flujos texto-a-3D es necesario configurar por separado un generador de imágenes, como el par Iris-3B y Qwen3-VL-4B que el autor documenta como configuración probada. La cuantización Q8_0 afecta a las matrices elegibles del denoiser, el decodificador de octree, el decodificador gaussiano y el eliminador de fondo, mientras que el resto de tensores conservan otras precisiones.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Denoiser con decodificador de octree y decodificador gaussiano (reconstruccion 3D gaussiana); codificadores de imagen DINOv3 y VAE de FLUX.2-dev separados |
| Parametros totales | 879.302.053 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (modelo image-to-3D, sin contexto textual) |
| Tipos de cuantizacion | Q8_0 mixta (422 tensores Q8_0, 125 float16, 1.076 float32, 67 int64) |
| Idiomas soportados | no disponible (no procesa texto) |
| Licencia | Apache 2.0 (los codificadores externos tienen licencias separadas) |
| Formato de pesos | GGUF (`Idol-Q8_0.gguf`, SHA-256 `1f6875979bac8c8aecacf0c698662b7c63ff54ae1b6d7c06755297a05607e983`) |

## Arquitectura y entrenamiento

Idol es un modelo de reconstruccion de nubes de puntos gaussianas 3D a partir de una imagen. La arquitectura combina un denoiser (con matrices de bloque elegibles cuantizadas con codigos Q8_0 calibrados por covarianza) con un decodificador de octree y un decodificador gaussiano, mas un modulo de eliminacion de fondo. La cuantizacion exportada proviene de la revision upstream `2731c2291fc65a797c5cb627a5e5526fc1490902` y conserva los codificadores de imagen en precision original de forma separada: DINOv3 (facebook/dinov3-vith16plus-pretrain-lvd1689m) y el VAE de FLUX.2-dev.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO. La model card del autor de la cuantizacion no detalla el proceso de entrenamiento del modelo base; esa informacion corresponderia a la model card original de speridlabs/idol, que se incluye como `UPSTREAM_README.md` en el repositorio. La innovacion tecnica destacable de esta distribucion es la cuantizacion mixta con calibracion por covarianza en las matrices de bloque del denoiser, que segun las mediciones del autor reduce el error latente relativo al 3,23 % y 6,47 % en dos imagenes de prueba frente a los pesos originales.

## Capacidades

- Reconstruccion 3D a partir de una unica imagen: genera una nube de puntos gaussianos tridimensional.
- Control del numero de puntos gaussianos generados (por ejemplo, 262.144 puntos en las pruebas documentadas).
- Control del numero de pasos de denoising (50 pasos en las pruebas documentadas).
- Eliminacion de fondo integrada mediante un modulo especifico.
- Soporte de semilla para reproducibilidad de la generacion.
- Integracion con codificadores de imagen externos: DINOv3 y VAE de FLUX.2-dev.
- Flujo texto-a-3D indirecto mediante un generador de imagenes configurado aparte (Iris-3B + Qwen3-VL-4B en la configuracion probada).
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso: no es un modelo de lenguaje.
- No tiene capacidades multilingues: no procesa texto.

## Casos de uso

- Reconstruccion 3D de productos para comercio electronico: a partir de una fotografia de catalogo, el modelo genera una nube de puntos gaussianos que puede renderizarse como vista 3D interactiva del producto, aprovechando el modulo de eliminacion de fondo para aislar el objeto.
- Digitalizacion de patrimonio y objetos fisicos: fotografiar una pieza y obtener una representacion 3D gaussiana para catalogacion o visualizacion web, con la ventaja de que el pipeline completo cabe en una GPU de consumo de 24 GB.
- Generacion de assets para videojuegos y entornos 3D: producir nubes de puntos gaussianos a partir de concept art o fotografias de referencia, con control del numero de puntos para ajustar el nivel de detalle al presupuesto de renderizado.
- Prototipado rapido en diseno industrial: convertir bocetos o renders 2D en representaciones 3D volumétricas para revisiones tempranas, ejecutando el modelo en local sobre una RTX 4090 en torno a 35 segundos por solicitud.
- Flujos texto-a-3D en local: encadenar un generador de imagenes (Iris-3B + Qwen3-VL-4B) con Idol-GGUF para pasar de una descripcion textual a una nube gaussiana, con todos los componentes bajo licencia Apache 2.0 y ejecucion en una sola estacion de trabajo.
- Investigacion en reconstruccion 3D: servir como referencia cuantizada para comparar la fidelidad de la reconstruccion frente a los pesos originales de Idol, con errores latentes relativos medidos del 3,23 % y 6,47 % en dos casos documentados.
- Visualizacion 3D en entornos con memoria limitada: el uso escalonado (staged) reduce el pico de asignacion PyTorch a 3,51 GB con codificadores originales y a 2,31 GB con DINOv3 Q4 de terceros, lo que permite desplegarlo en GPUs con menos VRAM.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que el modelo no es un modelo de lenguaje. El autor documenta mediciones de rendimiento y fidelidad en una RTX 4090:

| Carga de trabajo | Configuracion | Tiempo | Pico de asignacion PyTorch | Pico de memoria host |
|---|---|---:|---:|---:|
| Proceso nuevo, lampara / axolotl | Idol original / codificadores originales | 37,0 / 36,0 s | 4,76 GB | ~6,43 GB |
| Proceso nuevo, lampara / axolotl | Idol Q8 / codificadores originales | 34,6 / 34,6 s | 4,39 GB | ~6,73 GB |
| Residentes en caliente, lampara / axolotl | Idol original / codificadores originales | 25,12 / 25,12 s | 5,36 GB | ~6,07 GB |
| Residentes en caliente, lampara / axolotl | Idol Q8 / codificadores originales | 28,05 / 27,38 s | 4,73 GB | ~6,72 GB |
| Escalonado en caliente, axolotl | Idol Q8 / codificadores originales | 33,28 s | 3,51 GB | 6,72 GB |
| Escalonado en caliente, axolotl | Idol Q8 / DINOv3 Q4 de terceros y VAE original de FLUX.2 | 30,92 s | 2,31 GB | 5,42 GB |
| Lanzamiento en navegador, dos ejecuciones | Iris-3B Q4 y Qwen3-VL-4B Q4, luego Idol Q8 / codificadores originales | 81,68 s; 85,08 s | no medido de extremo a extremo | no medido de extremo a extremo |

Fidelidad frente a los pesos originales de Idol (50 pasos, 262.144 puntos, codificadores en precision original, modelos residentes en GPU, guiado por lotes y rutas fusionadas): error latente relativo del 3,23 % para la lampara y del 6,47 % para el axolotl. Son medidas de concordancia, no de precision 3D contra verdad de referencia. En tres vistas diagnosticas ortograficas fijas del axolotl, la cuantizacion Q8 calibrada mostro menor error de color en primer plano que una candidata Q8 sin calibrar, y mejoro el solapamiento de silueta en dos de las tres vistas.

## Requisitos de hardware

- VRAM estimada: pico de asignacion PyTorch de 4,39 GB con Idol Q8 y codificadores originales en modo de proceso nuevo; 4,73 GB en modo residente en caliente; 3,51 GB en modo escalonado con codificadores originales; 2,31 GB en modo escalonado con DINOv3 Q4 de terceros.
- GPU recomendada segun las pruebas del autor: NVIDIA GeForce RTX 4090 (24.564 MiB de memoria fisica), con PyTorch 2.10.0, CUDA 12.8 y `triton-windows` 3.5.0.post21 en Windows.
- Cabe en GPU de consumo: si, al menos en RTX 4090; el autor no documenta pruebas en GPUs de gama inferior, por lo que no se puede confirmar su viabilidad en tarjetas con menos VRAM.
- Opciones de despliegue: runtime `idol.cpp` (https://github.com/TimeLordRaps/idol.cpp) como runtime soportado. La compatibilidad con ComfyUI-GGUF no esta establecida. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: 34,6 s por solicitud en proceso nuevo y 27,38-28,05 s en modo residente en caliente con Idol Q8; 30,92-33,28 s en modo escalonado. El flujo completo texto-a-3D via navegador tardo 81,68 s y 85,08 s en dos ejecuciones. Son ejecuciones individuales y no establecen una distribucion de latencia.
- Memoria host: pico de espacio de trabajo del orden de 5,42-6,73 GB segun configuracion.
- Los codificadores de imagen requieren autenticacion en Hugging Face y aceptacion de sus terminos por separado.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| Idol-GGUF (esta ficha) | 879.302.053 | Imagen | Nube de puntos gaussianos 3D | Apache 2.0 (codificadores aparte) | GGUF Q8_0 mixta | Cuantizacion de Idol; runtime idol.cpp |
| Idol (speridlabs/idol) | 879.302.053 | Imagen | Nube de puntos gaussianos 3D | Apache 2.0 | no disponible | Pesos originales; referencia de fidelidad |
| DINOv3 (facebook/dinov3-vith16plus-pretrain-lvd1689m) | no disponible | Imagen | Representaciones visuales | licencia propia de Meta | no disponible | Codificador de imagen usado por Idol, no un modelo image-to-3D |
| FLUX.2-dev (VAE) | no disponible | Imagen | Latentes | licencia propia de Black Forest Labs | no disponible | Componente VAE usado por Idol, no un modelo image-to-3D |

No se dispone de informacion sobre otros modelos image-to-3D comparables en la documentacion proporcionada; la comparativa se limita a los componentes y al modelo base citados por el autor.

## Limitaciones y advertencias

- El modelo acepta exclusivamente imagenes, no texto; requiere un generador de imagenes externo para flujos texto-a-3D.
- Los codificadores de imagen (DINOv3 y VAE de FLUX.2-dev) se distribuyen por separado, con sus propias licencias y terminos de acceso, y requieren autenticacion en Hugging Face. No estan cubiertos por la licencia Apache 2.0 de Idol.
- Las mediciones de fidelidad (3,23 % y 6,47 % de error latente relativo) se basan en dos imagenes y una semilla; no establecen el comportamiento general del modelo.
- El uso de DINOv3 Q4 de terceros es un resultado de compatibilidad experimental, no una recomendacion de calidad: el latente difirio un 34,17 % en norma euclidea relativa respecto a la misma ejecucion con el codificador DINOv3 original.
- Las mediciones de tiempo y memoria corresponden a ejecuciones individuales en Windows con RTX 4090; las caches del sistema operativo podian estar calientes y la diferencia de tiempos no establece causalidad.
- La memoria asignada por PyTorch no incluye la memoria reservada no usada, el contexto grafico, el generador Iris ejecutado por separado ni otros procesos; la tabla no establece la memoria grafica minima requerida.
- La generacion de imagen e Idol se ejecutan secuencialmente, por lo que sus picos de memoria separados no deben sumarse; el limite configurado de 16 GiB del runner de imagenes es un presupuesto, no un pico medido.
- La compatibilidad con ComfyUI-GGUF no esta establecida.
- No se dispone de informacion sobre sesgos, riesgo de alucinacion en el sentido linguistico (no aplica) ni limitaciones de idioma (el modelo no procesa texto).
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta, lo que indica una adopcion practicamente nula y ausencia de validacion por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face de la cuantizacion: https://huggingface.co/TimeLordRaps/Idol-GGUF
- Modelo base: https://huggingface.co/speridlabs/idol
- Runtime idol.cpp: https://github.com/TimeLordRaps/idol.cpp
- Codificador DINOv3: https://huggingface.co/facebook/dinov3-vith16plus-pretrain-lvd1689m
- VAE de FLUX.2-dev: https://huggingface.co/black-forest-labs/FLUX.2-dev
- Generador de imagenes Iris-3B: https://huggingface.co/speridlabs/iris-3b
- Codificador de texto Qwen3-VL-4B: https://huggingface.co/Qwen/Qwen3-VL-4B-Instruct-GGUF
- DINOv3 Q4 de terceros (experimental): https://huggingface.co/zisisnotzis/dinov3-gguf
