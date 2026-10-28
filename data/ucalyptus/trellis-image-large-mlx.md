# ucalyptus/trellis-image-large-mlx

## Resumen

`ucalyptus/trellis-image-large-mlx` es una conversión a MLX de los pesos oficiales de `microsoft/TRELLIS-image-large`, el modelo generativo de imagen a 3D presentado en el artículo "Structured 3D Latents for Scalable and Versatile 3D Generation". No se trata de un modelo nuevo ni de un fine-tuning: el autor ha convertido los checkpoints originales para que funcionen con el runtime nativo de MLX en Apple Silicon, con cuantización de 8 bits en dos de los cinco componentes y precisión mixta en el resto. El repositorio ocupa 2,5 GB e incluye un manifiesto `trellis.json` necesario para el runtime.

El modelo resuelve la conversión de una única imagen 2D en un activo 3D representado como *Gaussian splats*, exportado en un fichero PLY. Es importante subrayar que esta conversión **no incluye** el decodificador de mallas FlexiCubes, el decodificador de campo de radiancia ni los codificadores de entrenamiento, por lo que la salida no es una malla triangular ni un GLB texturizado, sino una nube de gaussianas.

Su relevancia es doble: por un lado, permite ejecutar localmente una pipeline de generación 3D de referencia en hardware de consumo Apple (verificado en un M3 con 16 GB de memoria unificada); por otro, sirve como banco de pruebas para la implementación experimental de MLX en `mlx-diffuser`. La adopción es todavía muy baja (0 descargas y 2 *likes* en el momento de la consulta), lo que refleja su carácter experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusión con latentes 3D estructurados (SLAT): DiT para flujo de estructura dispersa, DiT para flujo SLAT y decodificador Swin disperso para gaussianas; acondicionamiento de imagen con DINOv2 con *registers* |
| Parametros totales | no disponible en la informacion proporcionada (el repo pesa 2,5 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica: modelo imagen a 3D, sin contexto textual; entrada de una sola imagen |
| Tipos de cuantizacion | 8 bits con tamano de grupo 64 en `image_conditioner` y `sparse_structure_flow`; precision mixta original (fp16) en `sparse_structure_decoder`, `slat_flow` y `gaussian_decoder` |
| Idiomas soportados | en (etiqueta del repo); la condicion de entrada es una imagen, no texto |
| Licencia | MIT y Apache 2.0 combinadas (`mit-and-apache-2.0`, campo `other`): pesos TRELLIS bajo MIT, acondicionador DINOv2 bajo Apache 2.0 |
| Formato de pesos | safetensors para MLX, mas manifiesto `trellis.json`; salida en PLY ASCII de gaussianas |

## Arquitectura y entrenamiento

El checkpoint replica la arquitectura del TRELLIS original sin reentrenamiento. Se compone de cinco modulos: un `image_conditioner` basado en `facebook/dinov2-with-registers-large` (8 bits, grupo 64) que extrae la representacion de la imagen de entrada; un `sparse_structure_flow` derivado de `ss_flow_img_dit_L_16l8_fp16`, un transformer de difusion que genera la estructura dispersa (8 bits, grupo 64); un `sparse_structure_decoder` a partir de `ss_dec_conv3d_16l8_fp16`, que decodifica esa estructura en una rejilla de vóxeles con convoluciones 3D; un `slat_flow` (`slat_flow_img_dit_L_64l8p2_fp16`) que modela los latentes 3D estructurados con operaciones dispersas nativas de MLX/Metal; y un `gaussian_decoder` (`slat_dec_gs_swin8_B_64l8gs32_fp16`), un Swin transformer disperso que produce los parametros de las gaussianas.

No hay datos publicados en la informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset ni si se aplicaron tecnicas de RLHF o DPO; el autor indica explicitamente que no se realizo fine-tuning ni reentrenamiento durante la conversion. La innovacion tecnica del trabajo original es el uso de latentes 3D estructurados que permiten generar distintas representaciones 3D de forma versatil; en esta conversion, la aportacion es la reimplementacion de las operaciones dispersas y del decoder Swin sobre MLX, con evaluacion por etapas y liberacion de memoria entre componentes (`low_memory=True`). La paridad numerica componente a componente frente a la referencia PyTorch/CUDA sigue pendiente segun el propio autor.

## Capacidades

- Generacion de activos 3D a partir de una unica imagen 2D, en formato de *Gaussian splats*.
- Inferencia de geometria oculta: las partes no visibles del objeto se generan, no se miden.
- Exportacion a PLY con 17 campos por gaussiana (posicion, escala de covarianza, cuaternion de rotacion y atributos de color/opacidad), validados como finitos y con escalas positivas y cuaterniones unitarios.
- Control del muestreo mediante semilla y numero de pasos separados para estructura dispersa y SLAT (25 + 25 en la verificacion).
- Ejecucion nativa en Apple Silicon con backend GPU/Metal y evaluacion por etapas para limitar el pico de memoria.
- Eliminacion de fondo opcional mediante dependencias del runtime (desactivada por defecto en el ejemplo).
- No soporta *tool calling*, *function calling*, agentes, razonamiento multi-paso ni generacion de texto: es un modelo puramente imagen a 3D.
- No exporta mallas triangulares, GLB texturizado ni campo de radiancia en este checkpoint.

## Casos de uso

- **Prototipado rapido de assets 3D para videojuegos o AR**: a partir de una foto de un objeto aislado se obtiene una nube de gaussianas en PLY que puede revisarse en un visor web (por ejemplo, GaussianSplats3D) antes de decidir si se modela una malla definitiva, evitando horas de bloqueo inicial.
- **Previsualizacion 3D de producto en comercio electronico**: con una imagen de catalogo sobre fondo transparente, el modelo genera una vista volumetrica navegable que puede incrustarse en una ficha de producto, sin necesidad de escaneo fotogrametrico ni estudio de fotografia 3D.
- **Iteracion de concept art en estudios pequenos**: el equipo de arte puede generar decenas de variantes cambiando la semilla (42 en la verificacion) y revisar la silueta y el volumen en 3D, con un coste de unos 273 segundos por muestra en un M3.
- **Investigacion en generacion 3D sobre hardware Apple**: sirve como referencia reproducible para medir latencia, pico de memoria y calidad de gaussianas en MLX, y para comparar la paridad numerica con la implementacion CUDA original.
- **Generacion de activos para simulacion y robotica**: las gaussianas pueden renderizarse desde multiples puntos de vista para aumentar datos sinteticos de percepcion, asumiendo que la geometria oculta es inventada y no apta para colision exacta.
- **Pipelines locales con requisitos de privacidad**: al ejecutarse en un Mac sinGPU NVIDIA ni envio de imagenes a la nube, encaja en flujos donde el material de entrada no puede salir de la organizacion.
- **Docencia sobre pipelines de difusion 3D**: la separacion en cinco componentes descargables por etapas facilita explicar el flujo completo (acondicionamiento, estructura dispersa, SLAT y decodificacion a gaussianas) con un consumo de memoria moderado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible (MMLU, HumanEval, GSM8K y similares no aplican a un modelo imagen a 3D). El autor unicamente aporta una verificacion local de una muestra, que no constituye una comparativa frente a otros modelos:

| Medicion | Resultado observado |
|---|---|
| Descarga mas conversion de checkpoints | 42,18 s |
| Generacion, excluyendo exportacion PLY | 272,78 s |
| Exportacion PLY | 1,29 s |
| Muestreo | 25 pasos de estructura + 25 de SLAT, semilla 42 |
| Voxeles ocupados | 13.542 |
| Gaussian splats generadas | 433.344 |
| Pico de asignacion MLX durante la generacion | 2.151.160.152 bytes (2,00 GiB) |
| Huella maxima del proceso (`/usr/bin/time -l`) | 3.182.954.200 bytes (2,96 GiB) |
| Tamano residente maximo (RSS) | 1.019.494.400 bytes (0,95 GiB) |
| Tamano del PLY ASCII original | 70.667.908 bytes |

Hardware de la verificacion: Apple M3 con GPU integrada de 10 nucleos y 16 GB de memoria unificada, MLX 0.31.2, Python 3.11.11. El autor advierte que asignacion MLX, RSS y huella del proceso son metricas distintas y que ninguna representa el consumo total del sistema; ademas, los datos corresponden a una sola muestra.

## Requisitos de hardware

- **Plataforma obligatoria**: Apple Silicon con MLX 0.31.2 y Python 3.11 o superior. Este checkpoint no incluye ruta CUDA y no esta pensado para la pipeline original de PyTorch.
- **Memoria**: en la verificacion, pico de asignacion MLX de 2,00 GiB y huella de proceso de 2,96 GiB sobre 16 GB de memoria unificada. No se han probado configuraciones con menos memoria.
- **GPU**: Apple M3 (GPU integrada de 10 nucleos) verificado. No hay datos publicados para M1, M2, M3 Pro/Max, M4 ni para GPU NVIDIA, A100 o H100.
- **Consumer GPU**: si, en Apple Silicon; no se ha validado en GPUs de consumo NVIDIA porque el runtime MLX no las soporta.
- **Almacenamiento**: 2,5 GB para el repositorio de pesos; cada PLY de salida ronda los 70 MB en formato ASCII para 433.344 gaussianas.
- **Despliegue**: paquete `mlx-diffuser[trellis]` instalado desde el repositorio de GitHub en la revision `a26b42aee4e31999dbb4429226b66d896d49e1d8` (version 0.1.6). No aplica vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje.
- **Latencia**: 272,78 s por muestra con 25 + 25 pasos en el M3 citado; 42,18 s de conversion inicial y 1,29 s de exportacion. El *throughput* por lote no esta disponible.
- **Renderizado**: el paquete MLX no incluye el renderizador CUDA de referencia; el autor uso un visor WebGL externo (GaussianSplats3D) para las previsualizaciones, sin paridad de pixeles establecida.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada | Salida | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `ucalyptus/trellis-image-large-mlx` | no disponible (repo de 2,5 GB) | 1 imagen | PLY de Gaussian splats | MIT + Apache 2.0 | MLX, solo Apple Silicon |
| `microsoft/TRELLIS-image-large` | no disponible en la informacion | 1 imagen | Gaussian splats y, con los decodificadores completos, mallas y texturas | MIT | PyTorch/CUDA |
| `microsoft/TRELLIS-text-xlarge` | no disponible en la informacion | texto | 3D | no disponible en la informacion | PyTorch/CUDA |
| `TRELLIS.2-4B` (pipeline distinta, citada por el autor) | 4B segun el nombre | no disponible | no disponible | no disponible | no disponible |

Frente al checkpoint original de Microsoft, esta conversion sacrifica los decodificadores de malla y de campo de radiancia a cambio de ejecucion nativa en Apple Silicon, cuantizacion de 8 bits en dos componentes y un consumo de memoria contenido. Frente a `TRELLIS-text-xlarge`, la diferencia es la modalidad de condicionamiento: imagen en lugar de texto. La comparacion cuantitativa de calidad y velocidad con la referencia CUDA no esta disponible, ya que la paridad numerica sigue pendiente.

## Limitaciones y advertencias

- Implementacion experimental de MLX: la paridad numerica componente a componente frente a la referencia PyTorch/CUDA no se ha verificado.
- Entrada de una sola imagen; la geometria oculta se genera, no se mide, por lo que el reverso de un objeto puede no coincidir con la realidad.
- La salida son gaussianas, no una malla estanca ni apta para fabricacion; no debe usarse directamente en impresion 3D o CAD sin remallado.
- No incluye el decodificador de mallas FlexiCubes, el decodificador de campo de radiancia ni los codificadores de entrenamiento.
- El paquete MLX no incluye el renderizador CUDA de referencia; las previsualizaciones con WebGL no garantizan paridad de pixeles.
- No es la pipeline TRELLIS.2-4B; los componentes son los de TRELLIS-image-large original.
- Riesgo de alucinacion geometrica y de textura en objetos con transparencias, superficies reflectantes o fondos no segmentados; se recomienda segmentar antes de la inferencia.
- Licencia compuesta MIT + Apache 2.0: la conversion y la cuantizacion no sustituyen las licencias originales, que deben conservarse (textos en `LICENSE` y cambios documentados en `NOTICE`) al redistribuir.
- Adopcion practica nula (0 descargas, 2 *likes*) y fechas de publicacion atipicas en la informacion del repositorio; no hay validacion independiente de la comunidad.
- Requiere Apple Silicon, lo que excluye su uso en infraestructura con GPU NVIDIA y complica el despliegue en servidores convencionales.
- Los tiempos y consumos reportados provienen de una unica muestra y no deben tomarse como limites universales.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/ucalyptus/trellis-image-large-mlx
- README del repositorio: https://huggingface.co/ucalyptus/trellis-image-large-mlx/blob/main/README.md
- Modelo base TRELLIS-image-large: https://huggingface.co/microsoft/TRELLIS-image-large
- Acondicionador DINOv2 con registers: https://huggingface.co/facebook/dinov2-with-registers-large
- Runtime y conversor `mlx-diffuser`: https://github.com/amirhossein-razlighi/mlx_diffuser
- Visor de gaussianas GaussianSplats3D: https://github.com/mkkellogg/GaussianSplats3D
- Ficha de TRELLIS-image-large en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/trellis-image-large-microsoft
- Ficha alternativa en aimodels.fyi: https://www.aimodels.fyi/models/huggingFace/trellis-image-large-jeffreyxiang
- Espejo en ModelScope: https://www.modelscope.cn/models/AI-ModelScope/TRELLIS-image-large/summary
