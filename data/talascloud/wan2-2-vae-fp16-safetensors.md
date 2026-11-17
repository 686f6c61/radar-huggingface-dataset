# TalasCloud/Wan2.2-VAE-FP16-Safetensors

## Resumen

Wan2.2-VAE-FP16-Safetensors es una redistribucion del VAE (autoencoder variacional) que acompana al modelo de generacion de video Wan2.2 TI2V 5B, desarrollado originalmente por Wan-AI (Alibaba). No se trata de un modelo de lenguaje ni de un modelo generativo completo: es unicamente el componente de codificacion/decodificacion latente que comprime y reconstruye fotogramas de video dentro del pipeline de difusion de Wan2.2. El repositorio lo publica el usuario TalasCloud como un unico fichero safetensors en FP16, consolidando los pesos que en el repositorio oficial aparecen divididos en varios ficheros.

La relevancia de esta publicacion es practica: facilita el despliegue del VAE de Wan2.2 en entornos donde el pipeline espera un unico fichero de pesos en precision FP16, en lugar de una coleccion de shards. El autor indica que los pesos originales se conservan byte a byte con su precision original, y proporciona un hash SHA-256 para verificacion de integridad. El sistema objetivo declarado es Windows con una GPU AMD Radeon RX 580 2048SP (arquitectura Polaris, 8 GB de VRAM) y una CPU Intel Xeon E5-2696 v3 (Haswell, AVX2).

El repositorio tiene un tamano de 1,4 GB, no registra descargas ni likes en el momento de la consulta, y se distribuye bajo licencia Apache 2.0, heredada del modelo base Wan-AI/Wan2.2-TI2V-5B. No incluye model card tecnica detallada sobre arquitectura interna, datos de entrenamiento ni benchmarks.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VAE (autoencoder variacional) para codificacion/decodificacion latente de video; arquitectura interna no detallada en la informacion disponible |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no aplica (no es un modelo de lenguaje) |
| Tipos de cuantizacion | FP16 (unico formato publicado en este repositorio) |
| Idiomas soportados | no disponible (no aplica; componente de vision/video) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (fichero unico, FP16) |
| Modelo base | Wan-AI/Wan2.2-TI2V-5B |
| Tamano del repositorio | 1,4 GB |
| SHA-256 | e40321bd36b9709991dae2530eb4ac303dd168276980d3e9bc4b6e2b75fed156 |
| Region | US |

## Arquitectura y entrenamiento

La informacion disponible no describe la arquitectura interna del VAE mas alla de su funcion: es el autoencoder variacional del pipeline Wan2.2 TI2V 5B, encargado de proyectar fotogramas de video a un espacio latente comprimido y de reconstruirlos a partir de las representaciones latentes generadas por el modelo de difusion. El repositorio no detalla el factor de compresion espacial o temporal, el numero de canales latentes ni la configuracion de bloques del encoder/decoder.

Tampoco se aportan datos sobre el entrenamiento: numero de tokens o fotogramas, composicion del dataset, funciones de perdida, ni si hubo etapas de ajuste fino. El autor indica explicitamente que los pesos se mantienen byte a byte respecto a los originales, con su precision original, por lo que este repositorio es una reempaquetacion y no un reentrenamiento. La unica innovacion tecnica declarada es la consolidacion en un unico fichero safetensors FP16, con hash SHA-256 publicado para verificacion.

## Capacidades

- Codificacion de fotogramas de video a representaciones latentes comprimidas, para su uso como entrada del modelo de difusion Wan2.2 TI2V 5B.
- Decodificacion de latentes generados por el modelo de difusion a fotogramas de video reconstruidos.
- Integracion en pipelines de generacion de video texto-a-video e imagen-a-video (TI2V) compatibles con Wan2.2.
- Verificacion de integridad mediante SHA-256 publicado.
- No soporta generacion de texto, razonamiento, codigo ni matematicas.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingues.
- No incluye modo thinking, vision de imagenes estaticas como tarea propia, audio ni otras capacidades especiales.

## Casos de uso

- Generacion de video texto-a-video en local: el VAE se usa como decodificador final del pipeline Wan2.2 TI2V 5B, convirtiendo los latentes producidos por el modelo de difusion en fotogramas reproducibles. Es adecuado porque es el componente exacto con el que se entreno el modelo base.
- Generacion de video imagen-a-video: en pipelines TI2V, el VAE codifica la imagen de referencia y decodifica el video resultante, manteniendo coherencia con los pesos originales de Wan2.2.
- Despliegue en hardware de gama baja: el autor lo orienta a una Radeon RX 580 de 8 GB en Windows, por lo que sirve para montar un pipeline de video en equipos sin GPUs de datacenter.
- Reempaquetado para herramientas que requieren un unico fichero: util en flujos tipo ComfyUI o scripts propios que esperan un solo safetensors en lugar de shards separados.
- Verificacion de integridad en produccion: el hash SHA-256 permite validar que los pesos descargados coinciden con los originales antes de desplegarlos en un pipeline automatizado.
- Reproducibilidad de experimentos: al conservar los pesos byte a byte, sirve para replicar resultados de generacion de video obtenidos con el VAE oficial de Wan2.2.
- Fine-tuning o investigacion sobre el espacio latente: punto de partida para estudiar la compresion latente de Wan2.2 sin tener que gestionar los ficheros divididos originales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma exacta; el repositorio pesa 1,4 GB en FP16, por lo que la carga de pesos requiere al menos ese orden de magnitud, mas el espacio de activaciones del pipeline de video.
- GPU recomendadas: el autor declara como objetivo una AMD Radeon RX 580 2048SP (Polaris, 8 GB). No se especifican recomendaciones para A100, H100 o RTX 4090.
- Compatibilidad con GPU de consumo: si, segun el autor, en una RX 580 de 8 GB; no se detallan otras GPU de consumo verificadas.
- CPU de referencia: Intel Xeon E5-2696 v3 (Haswell, AVX2), segun el autor.
- Sistema operativo de referencia: Windows.
- Opciones de despliegue: pipeline de video compatible con Wan2.2; el autor enlaza su propio runtime multimedia (koboldcpp-media-pipeline, release v2026.11.17-r5). No se mencionan vLLM, llama.cpp, Ollama ni TGI, que no aplican a un VAE.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Tipo | Formato | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| TalasCloud/Wan2.2-VAE-FP16-Safetensors | VAE de Wan2.2 TI2V 5B | safetensors unico, FP16 | Apache 2.0 | Hugging Face | Reempaquetado byte a byte del VAE original; 1,4 GB |
| Comfy-Org Wan-2.2 split VAE (wan2.2_vae.safetensors) | VAE de Wan2.2 TI2V 5B | safetensors, fichero dividido | no disponible en la informacion | Hugging Face (Comfy-Org) | Fuente citada por el autor como VAE dividido exacto |
| Wan-AI/Wan2.2-TI2V-5B | Modelo completo de generacion de video TI2V | no disponible | no disponible en la informacion | Hugging Face | Modelo base del que procede este VAE; incluye el VAE junto al modelo de difusion |

No se dispone de datos de rendimiento comparativo entre estas variantes en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo autonomo: sin el modelo de difusion Wan2.2 TI2V 5B no genera video por si mismo.
- No se documentan sesgos; al ser un componente de reconstruccion, los sesgos del sistema final dependen del modelo de difusion y de sus datos de entrenamiento.
- Riesgo de artefactos de reconstruccion en la decodificacion latente; no se cuantifica en la informacion disponible.
- La model card no detalla la arquitectura interna, el factor de compresion ni los datos de entrenamiento, lo que limita la evaluacion tecnica independiente.
- El autor no garantiza compatibilidad mas alla del pipeline y hardware declarados (Windows, RX 580, Xeon E5-2696 v3); el soporte en otros entornos no esta verificado en la informacion disponible.
- El repositorio no registra descargas ni likes, por lo que no hay evidencia de uso comunitario ni de validacion por terceros.
- Licencia Apache 2.0: permite uso comercial y modificacion con atribucion y aviso de cambios; conviene revisar tambien las condiciones del modelo base Wan-AI/Wan2.2-TI2V-5B.
- Verificar el SHA-256 antes de usar los pesos en produccion para descartar corrupcion o sustitucion del fichero.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/TalasCloud/Wan2.2-VAE-FP16-Safetensors
- Modelo base Wan-AI/Wan2.2-TI2V-5B: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B
- VAE dividido de Comfy-Org: https://huggingface.co/Comfy-Org/Wan-2.2/blob/ee6f4a40737a995bf5818954cfce6d59443b0f04/split_files/vae/wan2.2_vae.safetensors
- Runtime multimedia del autor (koboldcpp-media-pipeline, v2026.11.17-r5): https://github.com/aktalascloud/koboldcpp-media-pipeline/releases/tag/v2026.11.17-r5
