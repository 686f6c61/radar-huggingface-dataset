# XuanlangDai/InstantFusion

## Resumen
InstantFusion es una infraestructura de composicion de modelos de difusion para generacion de imagenes, publicada por el autor XuanlangDai (con repositorio y pagina de proyecto alojados en la organizacion InternLM). No es un generador de imagenes autonomo, sino una interfaz latente compartida que conecta generadores heterogeneos ya existentes (SD3, FLUX.1-dev, FLUX.1-schnell, FLUX.2-dev, FLUX.2-Klein, Z-Image-Turbo y Qwen-Image) mediante autoencoders latentes especificos por modelo (LAE). El problema que resuelve es la incompatibilidad entre espacios latentes de distintos modelos de difusion, permitiendo transferir estados intermedios de denoising de un generador a otro.

El repositorio publica exclusivamente los pesos entrenados de la interfaz LAE (ficheros `.bin`), no los generadores base, que deben obtenerse por separado. El tamano del repositorio es de 46,4 GB, coherente con el conjunto de checkpoints LAE para distintas combinaciones de modelos. La relevancia actual reside en que habilita tecnicas como aceleracion de generacion, composicion multi-preferencia y destilacion on-policy entre modelos (OPD) sin reentrenar los generadores originales, que permanecen congelados durante el entrenamiento de los LAE.

La informacion disponible no detalla la arquitectura interna de los LAE ni el volumen de datos de entrenamiento, y la licencia no esta especificada en la model card ni en los metadatos de Hugging Face.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Interfaz latente compartida basada en Latent AutoEncoders (LAE) por modelo; los generadores subyacentes son modelos de difusion latente (SD3, FLUX.1, FLUX.2, Z-Image-Turbo, Qwen-Image) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | `.bin` (checkpoints LAE); los generadores base se obtienen por separado en sus propios formatos |
| Tamano del repositorio | 46,4 GB |
| Pipeline | text-to-image |

## Arquitectura y entrenamiento
InstantFusion se articula en torno a un espacio latente compartido aprendido. Para cada generador conectado se entrena un Latent AutoEncoder (LAE) que proyecta los estados intermedios del modelo a ese espacio comun y los reconstruye preservando la informacion necesaria tanto para la reconstruccion como para continuar el proceso de denoising. Los generadores base permanecen congelados durante el entrenamiento de los LAE, de modo que la interfaz se aprende sin alterar los pesos originales.

Los checkpoints publicados cubren distintas combinaciones: `sd3_qwen_lae.bin` (SD3 y Qwen-Image), `flux1_dev_qwen_lae.bin` (FLUX.1-dev y Qwen-Image), `flux1_schnell_qwen_lae.bin` (FLUX.1-schnell y Qwen-Image), `flux1_sd3_qwen_lae.bin` (FLUX.1, SD3 y Qwen-Image), `flux2_dev_qwen_lae.bin` (FLUX.2-dev y Qwen-Image), `flux2_klein_qwen_lae.bin` (FLUX.2-Klein y Qwen-Image) y `zimage_turbo_qwen_lae.bin` (Z-Image-Turbo y Qwen-Image). No se especifican en la informacion disponible el numero de tokens, la composicion del dataset de entrenamiento ni si se emplearon tecnicas de RLHF o DPO. La model card menciona la destilacion on-policy entre modelos (OPD) como una de las aplicaciones habilitadas por la interfaz.

## Capacidades
- Transferencia de estados intermedios de denoising entre generadores distintos a traves del espacio latente compartido.
- Reconstruccion latente: los LAE reconstruyen los estados de Qwen-Image, FLUX.1 y SD3 con un SSIM medio reportado sobre 100 imagenes por modelo (el valor numerico no se incluye en el texto extraido).
- Generacion cross-model: un generador puede iniciar el proceso y otro continuarlo desde un estado intermedio transferido.
- Aceleracion de generacion mediante el uso combinado de generadores.
- Composicion multi-preferencia, combinando caracteristicas de varios generadores.
- Destilacion on-policy cross-model (OPD).
- Generacion text-to-image (pipeline declarado), en ingles.
- No se documentan capacidades de tool calling, agentes, vision, audio ni modo de razonamiento.

## Casos de uso
- Aceleracion de pipelines de generacion de imagenes: combinar un generador rapido (por ejemplo, FLUX.1-schnell o Z-Image-Turbo) con uno de mayor calidad (Qwen-Image) transfiriendo el estado intermedio de denoising para reducir pasos totales sin reentrenar ninguno de los dos.
- Composicion de preferencias esteticas: usar la interfaz para mezclar el estilo de un generador con la fidelidad de otro, aprovechando los checkpoints multi-modelo como `flux1_sd3_qwen_lae.bin`.
- Destilacion on-policy en produccion: emplear la interfaz para transferir el comportamiento de un generador grande a uno mas pequeno o rapido, reduciendo coste de inferencia en despliegues con volumen alto.
- Investigacion en espacios latentes: estudiar la compatibilidad entre arquitecturas de difusion heterogeneas (SD3, FLUX.1, FLUX.2, Qwen-Image) usando los LAE como herramienta de analisis y reconstruccion.
- Handoff entre modelos en entornos con recursos limitados: iniciar la generacion en una GPU con un modelo ligero y continuar el denoising en otra maquina con un modelo mayor, transfiriendo solo el estado latente.
- Experimentacion con modelos recien publicados: integrar un generador nuevo (por ejemplo, FLUX.2-Klein) en un pipeline existente mediante el checkpoint LAE correspondiente, sin reescribir el pipeline completo.
- Evaluacion comparativa de generadores: usar la reconstruccion latente y el SSIM como metrica objetiva de fidelidad entre modelos.

## Benchmarks y rendimiento
La model card menciona ejemplos de reconstruccion latente con SSIM medio sobre 100 imagenes para Qwen-Image, FLUX.1 y SD3, pero el texto extraido no incluye los valores numericos. No se han publicado resultados de benchmarks cuantitativos (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de este tipo.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible de forma explicita; depende de los generadores base conectados (SD3, FLUX.1, FLUX.2, Qwen-Image, Z-Image-Turbo), no solo de los LAE.
- GPU recomendadas: no especificadas en la informacion disponible. Los generadores base de la familia FLUX y Qwen-Image suelen requerir GPUs de gama alta (A100, H100) para resoluciones y lotes grandes; los LAE anaden una sobrecarga adicional no cuantificada.
- Compatibilidad con GPU de consumo: no confirmada; depende del generador base y de la cuantizacion aplicada a este, no documentada para los LAE.
- Opciones de despliegue: no se detallan en la model card; se remite al repositorio de GitHub para configuraciones de inferencia y entrenamiento. No se confirma soporte de vLLM, llama.cpp, Ollama ni TGI (herramientas orientadas a LLM, no a difusion).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| InstantFusion | Interfaz latente para composicion de generadores de difusion | no disponible | no disponible | no disponible | Pesos LAE en Hugging Face; generadores base por separado |
| FLUX.1-dev | Generador de difusion text-to-image | no disponible en esta ficha | no aplica | no disponible en esta ficha | Disponible como modelo base |
| Qwen-Image | Generador de difusion text-to-image | no disponible en esta ficha | no aplica | no disponible en esta ficha | Disponible como modelo base |
| SD3 | Generador de difusion text-to-image | no disponible en esta ficha | no aplica | no disponible en esta ficha | Disponible como modelo base |

InstantFusion no compite directamente con estos generadores: los utiliza como componentes. La comparativa relevante seria frente a otras tecnicas de composicion o adaptacion entre modelos de difusion, para las que no se dispone de datos en la informacion proporcionada.

## Limitaciones y advertencias
- No es un modelo autonomo: requiere descargar y configurar por separado los generadores base (SD3, FLUX.1, FLUX.2, Qwen-Image, Z-Image-Turbo), lo que incrementa notablemente los requisitos de almacenamiento y computo.
- Licencia no especificada: no se puede confirmar el uso comercial de los pesos LAE ni las obligaciones de atribucion.
- Idiomas: solo se declara ingles (`en`); el comportamiento con prompts en castellano no esta documentado.
- Riesgo de alucinacion y sesgos: no evaluado en la model card; al heredar el comportamiento de los generadores base, los sesgos de estos se propagan.
- Fidelidad de reconstruccion: la model card reporta SSIM medio, pero no se incluyen los valores; la perdida de informacion en la transferencia latente puede degradar la calidad final.
- Madurez: repositorio con 0 descargas y 2 likes en el momento de la consulta; ecosistema de herramientas y documentacion limitado.
- Compatibilidad: solo se garantizan las combinaciones de checkpoints publicadas; otras combinaciones de generadores no estan soportadas de forma explicita.
- Sin datos de benchmarks estandar ni de latencia/throughput para planificacion de produccion.

## Enlaces
- Hugging Face: https://huggingface.co/XuanlangDai/InstantFusion
- Paper (arXiv): https://huggingface.co/papers/2610.13944
- GitHub: https://github.com/InternLM/InstantFusion
- Pagina de proyecto: https://internlm.github.io/InstantFusion/
