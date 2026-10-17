# txgsync/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-MLX

## Resumen

Este repositorio es una adaptacion no oficial de NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB para Apple Silicon, publicada por el usuario txgsync. Los pesos son byte a byte identicos a los del checkpoint original de NVIDIA: no hay reconversion ni recuantizacion. Lo que anade el repositorio es un archivo Python (`nemotron_bolt.py`) con kernels Metal que permiten ejecutar los tensores tal y como NVIDIA los almacena, es decir, en cuantizacion nativa de 2 bits (IQ2_XXS), formato para el que MLX no tiene kernels propios.

El modelo base es un VLM (vision-language model) de arquitectura hibrida Nemotron-H con mezcla de expertos (MoE) y capas Mamba, disenado por NVIDIA para ejecutar tareas agenticas cotidianas en local dentro de 24 GB de memoria. El nombre comercial indica 74B parametros totales con 9B activos por token, aunque los metadatos de safetensors del repositorio declaran 22.641.027.080 parametros (unos 22,6B); la informacion disponible no aclara esa discrepancia. El repositorio ocupa 24,1 GB.

Su relevancia es doble: por un lado, acerca un modelo de 74B con vision a equipos de sobremesa con memoria unificada, midiendo 24,3 GB tras la carga y 59-60 tokens/s de decodificacion en un M4 Max; por otro, demuestra que se pueden portar kernels de cuantizacion extrema (IQ2_XXS) de llama.cpp/GGUF a Metal sin recuantizar el modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Nemotron-H hibrida (MoE + Mamba), vision-language model |
| Parametros totales | 74B segun el nombre del modelo; 22.641.027.080 (~22,6B) segun los metadatos de safetensors del repositorio (discrepancia no aclarada en la informacion disponible) |
| Parametros activos | ~9B (A9B, segun el nombre del modelo); no confirmado en los metadatos del repositorio |
| Longitud de contexto | no disponible (se han medido prompts de hasta 34K tokens) |
| Tipos de cuantizacion | Pesos nativos en 2 bits (IQ2_XXS, destilacion con awareness de cuantizacion); etiquetas del repositorio: iq2_xxs, nvfp4, 8-bit. Este repositorio no recuantiza |
| Idiomas soportados | en, es, fr, de, it, ja |
| Licencia | openmdw-1.1 (campo `license: other`, `license_name: openmdw-1.1`); el uso del modelo se rige por la licencia de NVIDIA |
| Formato de pesos | MLX safetensors, mas un archivo de codigo personalizado (`nemotron_bolt.py`) con kernels Metal para IQ2_XXS |
| Libreria de inferencia | mlx (mlx-vlm, oMLX) |
| Requiere Trust Remote Code | Si |
| Entrada | Texto e imagen (image-text-to-text); video mediante la ruta Nemotron Omni de mlx-vlm, no probada con este modelo |

## Arquitectura y entrenamiento

La arquitectura es Nemotron-H, una combinacion de capas Mamba (modelo de espacio de estados) con mezcla de expertos y atencion, en la linea de los disenos hibridos que buscan reducir el coste de atencion en contextos largos manteniendo capacidad de razonamiento. El checkpoint incorpora un encoder de vision (es un VLM) pero carece de encoder de audio: la informacion indica que `sound_config` es nulo. NVIDIA entreno los expertos del modelo en 2 bits mediante destilacion con awareness de cuantizacion hacia IQ2_XXS, de modo que el checkpoint de 24 GB es el modelo en si y no una copia comprimida de un modelo mayor en precision completa.

No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. Tampoco se detalla la configuracion exacta de expertos, el numero de capas Mamba frente a capas de atencion ni la dimension oculta. La innovacion tecnica destacable de este repositorio concreto es de ingenieria de inferencia: al no existir kernels IQ2_XXS en MLX, se anade una tabla de rejilla IQ2_XXS (procedente de llama.cpp, `iq2xxs_grid`, MIT) y kernels Metal que operan sobre los tensores originales, siguiendo el diseno de los kernels GGUF de Splash y llama.cpp. Esto permite cargar el checkpoint sin convertirlo a un formato que perderia la ventaja de tamano.

## Capacidades

- Generacion de texto conversacional y razonamiento multi-paso, con modo de pensamiento activable mediante `"chat_template_kwargs": {"enable_thinking": true}`, que devuelve el razonamiento en `reasoning_content`.
- Comprension de imagenes en formato OpenAI (`image_url` content parts): descripcion de imagenes, lectura de graficos y diagramas.
- Procesamiento de texto e imagen combinados en una misma peticion (pipeline image-text-to-text).
- Capacidades multilingues en ingles, castellano, frances, aleman, italiano y japones.
- Ejecucion local en Apple Silicon con memoria unificada, sin envio de datos a servicios externos.
- Soporte de contexto largo: se han medido prompts de 34K tokens con 571 tokens/s de procesamiento de prompt.
- Procesamiento de video mediante la ruta Nemotron Omni de mlx-vlm (no probada con este modelo concreto segun el autor).
- No soporta audio: el checkpoint no incluye encoder de sonido.
- No se menciona soporte explicito de tool calling o function calling en la informacion disponible.

## Casos de uso

- Analisis local de documentos con imagenes: el modelo acepta texto e imagenes en la misma peticion, lo que permite extraer datos de facturas, capturas o tablas escaneadas sin salir del equipo. En un M4 Max, un prompt de 2.036 tokens con una imagen de grafico tarda 5,4 s hasta el primer token.
- Asistente de razonamiento sobre codigo con contexto largo: con prompts de 34K tokens procesados a 571 tokens/s y decodificacion sostenida de 54 tokens/s, es viable mantener conversaciones tecnicas largas sobre un repositorio o un informe extenso.
- Despliegue en entornos con requisitos de confidencialidad: al ejecutarse integramente en local sobre memoria unificada, encaja en flujos donde los datos no pueden salir de la maquina (sanidad, legal, analisis financiero interno).
- Analisis de graficos y paneles de datos: la ruta de vision permite enviar un grafico y pedir una lectura estructurada o una descripcion de tendencias, con 5,4 s de latencia hasta el primer token en el caso medido.
- Traduccion y asistencia multilingue: cubre seis idiomas (en, es, fr, de, it, ja), util para equipos distribuidos o para normalizar documentacion en varios idiomas desde una sola instancia local.
- Prototipado de agentes locales de bajo consumo de memoria: con 24,3 GB tras la carga, el modelo puede convivir con otras aplicaciones en un equipo de 128 GB, lo que facilita ejecutar un agente mientras se trabaja en el mismo Mac.
- Procesamiento por lotes de imagenes etiquetadas: gracias a los 580-620 tokens/s de procesamiento de prompt en contextos de 9K, se pueden clasificar o describir conjuntos moderados de imagenes en un pipeline nocturno.
- Experimentacion con cuantizacion extrema de 2 bits: util para investigacion sobre hasta que punto un modelo de gran tamano mantiene utilidad practica almacenado a 2 bits.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card original referencia una figura `accuracy.png` sin valores numericos en el texto, y no se proporcionan cifras de MMLU, HumanEval, GSM8K ni de ningun otro conjunto de evaluacion. No se incluyen por tanto numeros de calidad en esta ficha.

Los unicos datos de rendimiento disponibles son medidas de velocidad, recogidas en la seccion de requisitos de hardware.

## Requisitos de hardware

- Plataforma: exclusivamente Apple Silicon mediante MLX. Este repositorio no ofrece ruta de ejecucion en CUDA ni en GPU de NVIDIA.
- Memoria: 24,3 GB medidos tras la carga del modelo en un M4 Max de 128 GB. Como referencia, se necesita un Mac con al menos 32 GB de memoria unificada para que quepa, y 64-128 GB para trabajar comodamente junto a otras aplicaciones (estimacion propia a partir del dato medido, no confirmada por el autor).
- GPU de referencia en las pruebas: Apple M4 Max con 128 GB de memoria unificada.
- Compatibilidad con GPU de consumo NVIDIA: no disponible en este repositorio.
- Despliegue: oMLX 0.7.1rc1 o posterior (sin parches) o mlx-vlm 0.7.8 o posterior (la version que instala oMLX 0.7.1rc1, o cualquiera posterior a Blaizzy/mlx-vlm#2528). Es obligatorio activar Trust Remote Code.
- Version de MLX empleada en las medidas: 0.32.4.
- Tiempo de carga: 2,5 a 3,5 s con cache de archivos caliente.
- Rendimiento medido (M4 Max 128 GB, oMLX 0.7.1rc1, temperatura 0, en caliente):

| Escenario | Medida |
|---|---|
| Decodificacion, contexto corto | 59-60 tokens/s |
| Decodificacion tras prompt de 34K tokens | 54 tokens/s |
| Procesamiento de prompt, 9K tokens | 580-620 tokens/s |
| Procesamiento de prompt, 34K tokens | 571 tokens/s (59 s hasta el primer token) |
| Procesamiento de prompt con imagen, 2.036 tokens + un grafico | 5,4 s hasta el primer token |

- Limite teorico: la decodificacion lee aproximadamente 4,9 GB de pesos por token, por lo que el limite de ancho de banda se situa cerca de 100 tokens/s. Los kernels de decodificacion IQ2_XXS estan limitados por aritmetica (unos 160 GB/s).
- Las rutas rapidas estan optimizadas para una sola secuencia a la vez; las peticiones por lotes con mascaras de padding usan el codigo estandar de mlx-vlm.

## Comparativa con modelos similares

No se dispone de datos verificados de modelos de terceros comparables en la informacion proporcionada, por lo que la comparacion se limita a las variantes del mismo modelo citadas en la model card.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| txgsync/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-MLX | 74B totales / 9B activos segun nombre; 22,6B en safetensors | no disponible | MLX safetensors + codigo personalizado | OpenMDW-1.1 | Port a Apple Silicon con kernels Metal IQ2_XXS; sin decodificacion especulativa |
| nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB | 74B totales / 9B activos segun nombre | no disponible | no disponible | OpenMDW-1.1 | Checkpoint original de NVIDIA; pesos identicos byte a byte a los del repositorio MLX |
| txgsync/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-MLX | Mismo modelo base | no disponible | MLX | OpenMDW-1.1 | Variante con el drafter LiLiCorr de NVIDIA para decodificacion especulativa en oMLX |
| Modelos comparables de terceros | no disponible | no disponible | no disponible | no disponible | No hay datos verificados en la informacion proporcionada |

## Limitaciones y advertencias

- Es un repositorio no oficial: el autor declara explicitamente que no lo es, y el uso del modelo sigue rigiendose por la licencia de NVIDIA (OpenMDW-1.1).
- Requiere activar Trust Remote Code: el archivo de modelo se ejecuta dentro del proceso del servidor, lo que implica ejecutar codigo de terceros en el entorno de inferencia.
- El archivo de modelo incluye su propia copia de las clases del modelo Bolt; esta probado con la version de mlx-vlm que fija oMLX (commit `9790231`) y con mlx-vlm posterior a Blaizzy/mlx-vlm#2528. Otras versiones pueden romper la compatibilidad.
- No incluye decodificacion especulativa. Para ello hay que usar el repositorio LiLiCorr-MLX.
- No soporta audio: el checkpoint no tiene encoder de sonido (`sound_config` es nulo).
- La ruta de video usa el camino Nemotron Omni de mlx-vlm y no ha sido probada con este modelo.
- Las rutas rapidas estan disenadas para una sola secuencia; el rendimiento por lotes depende del codigo generico de mlx-vlm y no esta optimizado.
- Latencia alta hasta el primer token en prompts muy largos: 59 s para un prompt de 34K tokens.
- Techo de rendimiento por ancho de banda: unos 100 tokens/s en decodificacion, con kernels IQ2_XXS limitados por aritmetica en torno a 160 GB/s.
- La cuantizacion nativa de 2 bits puede degradar la calidad respecto a versiones en mayor precision; no se aportan cifras de evaluacion que permitan cuantificarlo.
- No se documentan sesgos especificos, tasas de alucinacion ni evaluaciones de seguridad en la informacion disponible.
- La discrepancia entre los 74B declarados en el nombre y los 22,6B de los metadatos de safetensors no esta aclarada y deberia verificarse antes de planificar despliegues.
- Sin datos publicados de benchmarks de calidad, no es posible comparar su rendimiento real frente a alternativas de la misma categoria.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/txgsync/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-MLX
- Modelo base de NVIDIA: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB
- Variante con decodificacion especulativa LiLiCorr: https://huggingface.co/txgsync/NVIDIA-Nemotron-3.5-Bolt-74B-A9B-24GB-LiLiCorr-MLX
- oMLX: https://github.com/jundot/omlx
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
- Pull request de mlx-vlm citado: https://github.com/Blaizzy/mlx-vlm/pull/2528
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Pagina de desarrolladores de NVIDIA Nemotron: https://developer.nvidia.com/nemotron
- Coleccion de datasets de preentrenamiento de NVIDIA: https://huggingface.co/collections/nvidia/nemotron-pre-training-datasets
- Discord de NVIDIA AI Developer: https://discord.gg/9xpKQtVvrk
- Referencias arXiv incluidas en las etiquetas del repositorio: https://arxiv.org/abs/2605.07182, https://arxiv.org/abs/2601.20088, https://arxiv.org/abs/2502.02631, https://arxiv.org/abs/2502.05003
