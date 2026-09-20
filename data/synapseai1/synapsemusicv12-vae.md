# SYNAPSEai1/SynapseMusicV12-VAE

## Resumen

SynapseMusicV12-VAE es un autoencoder variacional (VAE) de audio en formato compatible con stable-audio-tools, publicado por el usuario SYNAPSEai1 en Hugging Face. Pese al identificador del repositorio, la model card corresponde al VAE 1D de ACE-Step v1.5, el componente de compresion del pipeline de generacion musical de ACE-Step (proyecto co-liderado por ACE Studio y StepFun). Se trata, por tanto, de una redistribucion del checkpoint original de ACE-Step adaptado al formato de stable-audio-tools.

El modelo no genera audio de forma autonoma: su funcion es comprimir audio estereo a 48 kHz en una representacion latente compacta de 64 dimensiones con un factor de submuestreo de 1.920x, y reconstruir la senal original a partir de ese latente. El DiT responsable de la generacion musical propiamente dicha opera en ese espacio latente. Esto lo convierte en una pieza de infraestructura util para entrenamiento, fine-tuning e investigacion sobre representaciones latentes de audio.

Su relevancia practica radica en que expone un VAE de alta fidelidad en un formato abierto (MIT) y compatible con las herramientas de Stability AI, lo que facilita su carga, reentrenamiento e integracion en pipelines propios. El repositorio ocupa aproximadamente 0,7 GB y esta distribuido como checkpoint de PyTorch mas fichero de configuracion, sin cuantizaciones alternativas publicadas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Oobleck Autoencoder (VAE) con activacion Snake |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de audio; latente de 64 dimensiones, submuestreo 1.920x) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de audio; sin soporte de texto) |
| Licencia | MIT |
| Formato de pesos | checkpoint de PyTorch (.ckpt) + config.json |
| Canales de audio | 2 (estereo) |
| Frecuencia de muestreo | 48.000 Hz |
| Dimension latente | 64 (encoder: 128) |
| Ratio de submuestreo | 1.920 |
| Canales encoder/decoder | 128 |
| Multiplicadores de canal | [1, 2, 4, 8, 16] |
| Strides | [2, 4, 4, 6, 10] |
| Libreria | stable-audio-tools |
| Tamano del repositorio | ~0,7 GB |
| Pipeline declarado | text-to-audio |

## Arquitectura y entrenamiento

El modelo es un autoencoder variacional 1D de tipo Oobleck, disenado especificamente para audio musical estereo. Comprime audio a 48 kHz y dos canales en un latente de 64 dimensiones aplicando un factor de submuestreo de 1.920x (es decir, aproximadamente 25 frames latentes por segundo de audio). La red encoder-decoder emplea bloques convolucionales con multiplicadores de canal [1, 2, 4, 8, 16], strides [2, 4, 4, 6, 10], 128 canales base y activacion Snake, un tipo de no linealidad periodica habitual en modelos generativos de audio por su comportamiento favorable en senales de forma de onda. La dimension latente del encoder (128) es superior a la del latente final (64), un patron tipico en VAEs que separa la representacion interna de la distribucion latente proyectada.

No se proporciona en la informacion disponible el numero de tokens de audio usados en el entrenamiento, la composicion exacta del dataset musical, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en un VAE de compresion). El checkpoint incluye en su `config.json` la configuracion completa de entrenamiento (optimizador, funcion de perdida y ajustes del discriminador), lo que sugiere un entrenamiento con perdidas de reconstruccion combinadas con componentes adversariales, pero el detalle concreto no esta especificado en la model card. La innovacion destacable es la compatibilidad directa con los pipelines de stable-audio-tools, que permite reutilizar el modelo tanto para inferencia como para fine-tuning sin adaptaciones de formato.

## Capacidades

- Compresion de audio estereo a 48 kHz en un espacio latente de 64 dimensiones con ratio 1.920x.
- Reconstruccion de audio a partir de latentes (encode/decode).
- Procesamiento por chunks para audio de larga duracion mediante el flag `--chunked` del script de inferencia.
- Integracion con pipelines de entrenamiento de stable-audio-tools para fine-tuning.
- Uso como componente de un pipeline text-to-audio mayor (el DiT de ACE-Step v1.5 opera sobre el latente), aunque el VAE por si solo no acepta prompts de texto.
- No soporta tool calling, function calling, agentes ni razonamiento multi-paso.
- No dispone de capacidades multilingues ni de procesamiento de texto.
- No incorpora modo de pensamiento (thinking mode), vision ni audio de entrada distinto del propio audio a codificar.

## Casos de uso

- Preprocesado de datasets musicales: convertir grandes colecciones de audio estereo en latentes de 64 dimensiones para acelerar el entrenamiento de modelos generativos que operan en espacio latente (DiT, diffusion), reduciendo el coste de almacenamiento y de carga por lote.
- Fine-tuning de un VAE especializado por genero: partir del `config.json` incluido y reentrenar sobre un corpus concreto (electronica, orquestal, etc.) para mejorar la reconstruccion en ese dominio.
- Investigacion sobre representaciones latentes: estudiar la estructura del espacio latente de 64 dimensiones, la separacion de fuentes implicita o la interpolacion entre audios en el espacio comprimido.
- Integracion en pipelines de ACE-Step v1.5: usar este VAE como pieza de decode/encode junto a los modelos DiT (`acestep-v15-base`, `sft`, `turbo` y variantes XL) para montar un sistema de generacion musical completo.
- Compresion de audio con reconstruccion: reducir el tamano de ficheros musicales almacenando latentes y decodificando bajo demanda, con la perdida de calidad que implica el submuestreo 1.920x.
- Experimentos de codificacion para modelos de audio condicionados: alimentar el latente del VAE como entrada de un modelo condicionado por texto u otras senales en lugar de trabajar directamente sobre la forma de onda.
- Evaluacion comparativa de VAEs de audio: usar este checkpoint como referencia frente a otros autoencoders en tareas de reconstruccion a 48 kHz.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas objetivas de reconstruccion (por ejemplo PSNR, SI-SDR o LSD), ni comparaciones cuantitativas con otros VAEs de audio.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El repositorio completo ocupa ~0,7 GB, por lo que el peso del modelo en memoria es modesto y la inferencia es viable en GPUs de consumo con varios GB de VRAM libres.
- GPU recomendadas: no especificadas por el autor. Cualquier GPU con CUDA y memoria suficiente para el checkpoint (~0,7 GB) deberia poder ejecutarlo; el modelo se carga con `vae.cuda()` en el ejemplo oficial.
- Cabe en GPU de consumo: si, previsiblemente en la mayoria de tarjetas modernas (por ejemplo, gama RTX), dado el reducido tamano del checkpoint. No se especifican modelos concretos.
- Opciones de despliegue: carga directa mediante `stable-audio-tools` / el wrapper `StableAudioVAE`, o ejecucion del script `stable_audio_vae.py` por linea de comandos. No se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput estimados: no disponible.
- Procesamiento de audio largo: requiere el modo `--chunked` para evitar problemas de memoria en secuencias extensas.

## Comparativa con modelos similares

No se dispone de datos de rendimiento comparativos en la informacion proporcionada. Como referencia estructural, este VAE es el componente de codificacion del pipeline ACE-Step v1.5, cuyos modelos DiT acompanantes se listan a continuacion:

| Modelo | Descripcion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| SynapseMusicV12-VAE (este) | VAE Oobleck, latente 64, 48 kHz | no disponible | no aplica | MIT | Hugging Face |
| acestep-v15-base | DiT base (CFG, 50 pasos) | no disponible | no disponible | no disponible | Hugging Face |
| acestep-v15-sft | DiT SFT (CFG, 50 pasos) | no disponible | no disponible | no disponible | Hugging Face |
| acestep-v15-turbo | DiT turbo (8 pasos) | no disponible | no disponible | no disponible | Hugging Face |
| acestep-v15-xl-base | DiT XL base (4B, CFG, 50 pasos) | 4B | no disponible | no disponible | Hugging Face |
| acestep-v15-xl-sft | DiT XL SFT (4B, CFG, 50 pasos) | 4B | no disponible | no disponible | Hugging Face |
| acestep-v15-xl-turbo | DiT XL turbo (4B, 8 pasos) | 4B | no disponible | no disponible | Hugging Face |

No se han encontrado en la informacion disponible comparaciones directas con otros VAEs de audio de codigo abierto (por ejemplo EnCodec, DAC o el VAE de Stable Audio Open).

## Limitaciones y advertencias

- No es un modelo generativo autonomo: no acepta prompts de texto ni produce audio desde cero. El pipeline declarado como `text-to-audio` corresponde al sistema completo, no a este componente.
- El identificador del repositorio (`SYNAPSEai1/SynapseMusicV12-VAE`) no coincide con el contenido de la model card (`ACE-Step v1.5 1D VAE`), lo que apunta a una redistribucion o renombrado por parte de un tercero. Conviene verificar la procedencia frente al repositorio oficial de ACE-Step antes de usarlo en produccion.
- La compresion es con perdida: el factor de submuestreo de 1.920x y un latente de 64 dimensiones implican una reconstruccion que no es bit-exacta respecto al audio original, con degradacion potencial en transitorios y contenido de alta frecuencia.
- No se documentan sesgos especificos, pero al ser un VAE entrenado sobre un corpus musical no declarado, la calidad de reconstruccion puede variar segun el genero, la instrumentacion o la presencia de voz.
- No se especifican limitaciones de idioma (no aplica) ni de duracion mas alla de la necesidad de procesamiento por chunks.
- Licencia MIT: permite uso comercial y modificacion con atribucion, sin las restricciones tipicas de pesos "abiertos" con clausulas adicionales. Aun asi, el autor original del checkpoint es ACE-Step, no el publicador del repositorio.
- La ausencia de benchmarks publicados impide garantizar umbrales de calidad de reconstruccion en produccion sin una evaluacion propia previa.
- Repositorio con 0 descargas y creado y actualizado en la misma fecha: no hay historial de mantenimiento ni evidencia de validacion por parte de la comunidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SYNAPSEai1/SynapseMusicV12-VAE
- Repositorio GitHub de ACE-Step 1.5: https://github.com/ACE-Step/ACE-Step-1.5
- Pagina del proyecto ACE-Step v1.5: https://ace-step.github.io/ace-step-v1.5.github.io/
- Coleccion ACE-Step 1.5 en Hugging Face: https://huggingface.co/collections/ACE-Step/ace-step-15
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/ACE-Step/Ace-Step-v1.5
- Discord de ACE-Step: https://discord.gg/PeWDxrkdj7
- Informe tecnico (arXiv): https://arxiv.org/abs/2602.00744
- stable-audio-tools (Stability AI): https://github.com/Stability-AI/stable-audio-tools
- Modelo relacionado `acestep-v15-base`: https://huggingface.co/ACE-Step/acestep-v15-base
- Modelo relacionado `acestep-v15-sft`: https://huggingface.co/ACE-Step/acestep-v15-sft
- Modelo relacionado `acestep-v15-turbo`: https://huggingface.co/ACE-Step/Ace-Step1.5
- Modelo relacionado `acestep-v15-xl-base`: https://huggingface.co/ACE-Step/acestep-v15-xl-base
- Modelo relacionado `acestep-v15-xl-sft`: https://huggingface.co/ACE-Step/acestep-v15-xl-sft
- Modelo relacionado `acestep-v15-xl-turbo`: https://huggingface.co/ACE-Step/acestep-v15-xl-turbo

Nota: los resultados de la busqueda web proporcionados no contienen informacion relevante sobre el modelo; se refieren a direcciones y negocios en Madrid sin relacion con el contenido de esta ficha.
