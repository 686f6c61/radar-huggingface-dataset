# xgirls/wan2.2-ti2v-5b-openvino-int4-awq

## Resumen

Wan2.2 TI2V 5B OpenVINO INT4 AWQ es una conversion cuantizada del modelo de generacion de video Wan-AI/Wan2.2-TI2V-5B-Diffusers, publicada por el usuario xgirls. A diferencia del modelo original, que se distribuye en precision BF16/FP16, este paquete exporta el transformer de difusion a OpenVINO IR con pesos mixtos INT4/INT8, manteniendo el codificador de texto y los dos componentes del VAE en FP16. El objetivo es ejecutar generacion image-to-video (imagen a video) en hardware Intel mediante el runtime de OpenVINO, sin necesidad de GPU NVIDIA.

El modelo resuelve un problema de despliegue: la inferencia de un transformer de difusion de unos 5.000 millones de parametros requiere mucha memoria y computo, y esta version reduce el transformer a aproximadamente 2,8 GB en IR (frente a un paquete completo de unos 15 GB) gracias a una receta de cuantizacion de solo pesos, con INT4 simetrico y AWQ para el transformer y un 10% de parametros en INT8 por canal como respaldo. La validacion se hizo con OpenVINO 2026.4.0 en CPU sobre un host de 30 vCPU.

Es relevante porque demuestra que un modelo TI2V de 5B puede correr end-to-end en CPU Intel con una calidad de primer fotograma cercana a la referencia BF16 en CUDA. El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, con fecha de creacion 2026-10-15, y se publica bajo licencia Apache 2.0. La limitacion principal es que el transformer exportado usa una forma estatica fija: solo esta validado para 704 × 544 pixeles y 21 fotogramas.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de difusion (DiT) para generacion de video; el paquete incluye transformer cuantizado, codificador de texto y VAE (dos componentes) exportados a OpenVINO IR |
| Parametros totales | ~5.000 millones (segun el nombre del modelo base Wan2.2-TI2V-5B); desglose exacto no disponible |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no aplica; el transformer exportado tiene forma estatica y genera 21 fotogramas a 704 × 544 |
| Tipos de cuantizacion | Transformer en INT4 simetrico con AWQ (group size 64, ratio 0,9); 10% de los parametros que definen el ratio se mantienen en INT8 simetrico por canal; codificador de texto y VAE en FP16. Cuantizacion de solo pesos (activaciones sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | OpenVINO IR (.xml/.bin); receta registrada en quantization_config.json |

## Arquitectura y entrenamiento

El modelo base, Wan2.2-TI2V-5B-Diffusers, es un transformer de difusion para generacion de video a partir de texto e imagen (TI2V). El paquete de esta conversion no reentrena el modelo: parte de los pesos oficiales de Diffusers y los exporta a OpenVINO IR con el notebook oficial de OpenVINO para Wan2.2 como referencia de pipeline y exportacion. La conversion aplica compresion de pesos con NNCF 3.4.0 sobre el transformer, mientras que el codificador de texto y los dos componentes del VAE se exportan en FP16.

La innovacion tecnica es la receta de cuantizacion: pesos INT4 simetricos con group size 64 y ratio 0,9, calibrados con AWQ usando ocho capturas de entrada reales del pipeline oficial de Diffusers. NNCF conserva un 10% de los parametros que definen el ratio en INT8 simetrico por canal como respaldo. El resultado es un transformer IR de aproximadamente 2,8 GB dentro de un paquete IR total de unos 15 GB. Al ser cuantizacion de solo pesos, las activaciones se calculan sin cuantizar, lo que simplifica la integracion pero limita el ahorro a memoria y ancho de banda de pesos, no a computo de activaciones.

## Capacidades

- Generacion de video a partir de una imagen de entrada y un prompt de texto (image-to-video).
- Soporte de prompt negativo para descartar artefactos (por ejemplo, "blurry, distorted, subtitles").
- Control de semilla para reproducibilidad.
- Generacion con 4 pasos de denoising y codificacion de salida a 16 fps.
- Salida en formato MP4.
- Inferencia en CPU mediante OpenVINO (plugin de CPU validado).
- No dispone de tool calling ni function calling.
- No soporta uso como agente ni razonamiento multi-paso.
- No realiza comprension de imagen ni vision: la imagen se usa como condicionamiento, no como entrada de analisis.
- No se documentan capacidades multilingues ni modo de razonamiento (thinking).

## Casos de uso

- Animacion de imagenes fijas en produccion creativa: dada una fotografia o ilustracion, el modelo genera un clip corto de 21 fotogramas que sirve como plano animado o transicion en una pieza de video.
- Previsualizacion de storyboards: convertir bocetos o frames clave en clips de 704 × 544 para validar ritmo y encuadre antes de producir la animacion final.
- Marketing y redes sociales: generar clips breves a partir de una imagen de producto con un prompt descriptivo, aprovechando la salida MP4 y el control de semilla para iteraciones reproducibles.
- Reanimacion de fotografia historica o de archivo: usar una imagen antigua como condicionamiento para producir un movimiento sutil, util en documentales y proyectos patrimoniales.
- Despliegue en infraestructura Intel sin GPU NVIDIA: al ejecutarse en OpenVINO sobre CPU (validado en 30 vCPU), encaja en servidores o estaciones con hardware Intel donde no hay CUDA disponible.
- Investigacion en cuantizacion de modelos generativos: la receta INT4 AWQ con respaldo INT8 permite estudiar el impacto de la compresion de pesos en la calidad del primer fotograma usando las metricas incluidas.
- Integracion en pipelines batch de generacion de video: el script infer.py acepta imagen, prompt, prompt negativo, salida, pasos y semilla, lo que facilita el procesamiento por lotes en un flujo automatizado.
- Evaluacion comparativa de backends: sirve para comparar la misma generacion en CPU con OpenVINO frente a la referencia BF16 en CUDA, usando el mismo seed y prompt.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K u otros) en la informacion disponible, ya que no aplican a un modelo de generacion de video. La unica validacion cuantitativa aportada es una comparacion determinista del primer fotograma frente a la referencia BF16 en CUDA, con el mismo prompt, imagen y semilla:

| Metrica | Valor |
|---|---|
| Error absoluto medio de pixel (frente a referencia BF16) | 0,383/255 |
| RMSE (frente a referencia BF16) | 0,674/255 |
| Canales con valor exactamente coincidente | 64,4% |
| Tiempo de generacion (704 × 544, 21 fotogramas, 30 vCPU) | 893,6 s |
| Pasos de denoising | 4 |
| Guidance | 5,0 |
| Semilla | 42 |

El propio autor advierte que se trata de un unico ejemplo determinista y que no debe considerarse una evaluacion de calidad amplia.

## Requisitos de hardware

- Memoria: el paquete IR completo ocupa unos 15 GB y el transformer unos 2,8 GB; se necesita espacio y memoria suficientes para cargar la pipeline completa (del orden de 15 GB entre pesos y overhead del runtime).
- CPU: validado con OpenVINO 2026.4.0 en un host Lambda de 30 vCPU, con un tiempo de 893,6 s por clip (704 × 544, 21 fotogramas, 4 pasos), es decir, del orden de 42,6 s por fotograma generado.
- GPU: OpenVINO no tiene como target la NVIDIA A100; el autor lo indica explicitamente. Los aceleradores soportados son Intel (iGPU integrada y dGPU Intel Arc mediante el plugin GPU de OpenVINO), aunque la validacion publicada se hizo solo con el plugin de CPU.
- GPU de consumo: no se documenta validacion en GPUs de consumo NVIDIA mediante este paquete; para CUDA habria que usar el modelo base en Diffusers. En hardware Intel con iGPU o Arc el despliegue es posible en principio, pero sin datos de rendimiento publicados.
- Despliegue: OpenVINO Runtime (Python 3.11 recomendado), script infer.py incluido y dependencias fijadas en requirements.txt. No se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de modelo.
- Restriccion de forma: infer.py rechaza combinaciones de resolucion y numero de fotogramas distintas de la soportada (704 × 544, 21 fotogramas), de modo que no falla dentro de OpenVINO.
- Latencia y throughput: solo se conoce el dato de CPU mencionado; no hay cifras publicadas para GPU Intel.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / salida | Formato y precision | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| xgirls/wan2.2-ti2v-5b-openvino-int4-awq (este) | ~5.000 M | 21 fotogramas a 704 × 544, forma estatica | OpenVINO IR, transformer INT4/INT8 + FP16 | Apache 2.0 | HuggingFace, 0 descargas |
| Wan-AI/Wan2.2-TI2V-5B-Diffusers (base) | ~5.000 M | misma pipeline, precision completa | Diffusers (BF16/FP16) | Apache 2.0 | HuggingFace |
| Wan2.2 I2V A14B | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |
| Stable Video Diffusion (u otros I2V comparables) | no disponible en la informacion proporcionada | no disponible | no disponible | no disponible | no disponible |

La comparacion directa solo es posible con el modelo base: comparten arquitectura, prompt y salida, y la diferencia es la cuantizacion y el backend (OpenVINO IR frente a Diffusers en precision completa). Frente a la referencia BF16 en CUDA, el paquete cuantizado logra un primer fotograma muy cercano, con las metricas de error indicadas mas arriba.

## Limitaciones y advertencias

- Forma estatica fija: el transformer solo esta validado para 704 × 544 pixeles y 21 fotogramas, y infer.py rechaza cualquier otra combinacion. No hay generacion a otras resoluciones o duraciones sin reexportar el modelo.
- Cuantizacion de solo pesos: las activaciones no se cuantizan, por lo que el ahorro se limita a memoria y ancho de banda de pesos, no al computo.
- Validacion de calidad limitada: las metricas de error (MAE 0,383/255, RMSE 0,674/255) provienen de un unico ejemplo determinista y no constituyen una evaluacion amplia; la calidad puede degradarse en otros prompts o imagenes.
- Rendimiento en CPU muy lento para uso interactivo: 893,6 s por clip de 21 fotogramas en 30 vCPU. No es apto para generacion en tiempo real ni para alta concurrencia sin mas hardware.
- Compatibilidad de aceleradores: no hay soporte documentado para GPU NVIDIA (la A100 no es un target de OpenVINO); el rendimiento en GPU Intel no esta publicado.
- Idiomas: no se documentan los idiomas soportados por el prompt; conviene verificar el comportamiento del codificador de texto del modelo base antes de usarlo en produccion multilingue.
- Riesgo de artefactos: como cualquier modelo de difusion, puede producir distorsiones, incoherencias temporales o texto ilegible; se recomienda usar prompt negativo y revisar cada salida.
- Origen y mantenimiento: es una conversion de un tercero (usuario xgirls) sobre un modelo base de Wan-AI, con 0 descargas y 0 likes, y sin garantias de mantenimiento o actualizacion.
- Licencia: Apache 2.0, que permite uso comercial, pero conviene revisar tambien los terminos de uso del modelo base Wan2.2-TI2V-5B-Diffusers en su model card antes de desplegarlo en produccion.
- Dependencias fijadas: requiere Python 3.11 y las versiones exactas de requirements.txt; cambios de version de OpenVINO o NNCF pueden alterar el comportamiento.

## Enlaces

- Pagina del modelo en HuggingFace: https://huggingface.co/xgirls/wan2.2-ti2v-5b-openvino-int4-awq
- Modelo base Wan-AI/Wan2.2-TI2V-5B-Diffusers: https://huggingface.co/Wan-AI/Wan2.2-TI2V-5B-Diffusers
- Notebook oficial de OpenVINO para Wan2.2 (referencia de pipeline y exportacion): https://github.com/openvinotoolkit/openvino_notebooks/tree/latest/notebooks/wan2.2-text-image-to-video
- Fichero de licencia del repositorio: LICENSE.txt (incluido en el repositorio de HuggingFace)
- Paper, blog o demo adicionales: no disponible en la informacion proporcionada
