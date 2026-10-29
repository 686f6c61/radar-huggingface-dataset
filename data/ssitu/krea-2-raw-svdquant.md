# ssitu/Krea-2-Raw-SVDQuant

## Resumen

Krea-2-Raw-SVDQuant es una cuantización no oficial del modelo de difusión texto-a-imagen Krea 2 Raw (krea/Krea-2-Raw), publicada por el usuario ssitu. El modelo original lo desarrolla Krea AI como modelo fundacional de generación de imágenes entrenado desde cero y orientado a exploración creativa y control de estilo. Esta versión no altera el pipeline de inferencia: reempaqueta los pesos en formato SVDQuant INT4 (W4A4) para poder ejecutarse con el runtime Nunchaku dentro de ComfyUI, reduciendo el peso de los checkpoints a aproximadamente 7,4-7,9 GiB por variante frente al formato BF16 del modelo base.

El interés práctico está en la reducción de huella de memoria: el repositorio completo ocupa 24,6 GB porque incluye tres variantes según el rango de la rama de bajo rango de SVDQuant (rank 32, 64 y 128). Cada checkpoint es un fichero `safetensors` independiente que sustituye al modelo BF16 en un flujo de ComfyUI, manteniendo la misma configuración de muestreo que el original (1024×1024, 28 pasos, CFG 4.5, sampler Euler/simple).

La model card no publica el número de parámetros, la arquitectura interna ni la composición del dataset de entrenamiento del modelo base; únicamente documenta el proceso de cuantización, los tamaños de descarga y una comparación objetiva de fidelidad frente a BF16 mediante LPIPS y PSNR. La licencia es la Krea 2 Community License, con restricciones de uso comercial y salvaguardas obligatorias.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No disponible (modelo de difusion texto-a-imagen; la model card no detalla la arquitectura interna) |
| Parametros totales | No disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible / no aplica: la entrada es un prompt de texto; no se especifica longitud maxima |
| Tipos de cuantizacion | SVDQuant INT4, esquema W4A4 (pesos y activaciones a 4 bits), con rama de bajo rango configurable (rank 32, 64 y 128) |
| Idiomas soportados | No disponible (no se documenta cobertura multilingue de los prompts) |
| Licencia | Krea 2 Community License (license_name: krea-2-community-license), con Acceptable Use Policy asociada |
| Formato de pesos | safetensors (un fichero por variante: `svdq-int4_r32`, `svdq-int4_r64`, `svdq-int4_r128`) |

Datos adicionales del repositorio:

| Parametro | Valor |
|---|---|
| Tamano del repo | 24,6 GB (incluye las tres variantes) |
| Tamano por checkpoint | Rank 32: 7,43 GiB / Rank 64: 7,60 GiB / Rank 128: 7,93 GiB |
| Pipeline | text-to-image |
| Modelo base | krea/Krea-2-Raw (relacion: quantized) |
| Runtime requerido | Nunchaku (integracion en ComfyUI) |
| Autor de la cuantizacion | ssitu (no oficial, no afiliado a Krea AI) |

## Arquitectura y entrenamiento

Esta publicacion no entrena ningun modelo: aplica SVDQuant sobre los pesos de Krea 2 Raw. SVDQuant es una tecnica de cuantizacion de 4 bits que absorbe los valores atipicos (outliers) de activaciones y pesos en una rama de bajo rango en precision alta, mientras el camino principal se ejecuta en INT4 (W4A4). El rango de esa rama es el hiperparametro que diferencia los tres checkpoints publicados: a mayor rango, mayor capacidad de representar los outliers y, en teoria, mayor fidelidad respecto a BF16, a costa de un fichero ligeramente mas grande. El trabajo de cuantizacion se ha realizado con la herramienta DeepCompressor, y la integracion con ComfyUI se apoya en el port Krea 2 Nunchaku, que adapta los kernels de Nunchaku al modelo de Krea.

No se documentan en la informacion disponible ni la arquitectura del modelo base (tipo de backbone, mecanismo de atencion, text encoder o VAE), ni el volumen de tokens de entrenamiento, ni si hubo fases de ajuste preferencial (RLHF/DPO). La evaluacion de fidelidad se hizo con 8 prompts × 2 semillas a 1024×1024, 28 pasos, CFG 4.5 y sampler Euler/simple, comparando cada variante cuantizada contra la salida en bf16 del modelo original. Es importante subrayar que esta comparacion mide deriva respecto al modelo base, no calidad absoluta frente a otros generadores.

## Capacidades

- Generacion de imagenes a partir de prompts de texto (text-to-image) en resolucion 1024×1024 en la configuracion de referencia.
- Ejecucion dentro de ComfyUI mediante los nodos de Nunchaku, lo que permite integrar el modelo en grafos con preprocesado, postprocesado, upscaling o control de estilo.
- Tres niveles de compromiso fidelidad/tamano intercambiables sin cambiar el resto del pipeline (rank 32, 64 o 128).
- Inferencia en 4 bits para pesos y activaciones (W4A4), pensada para reducir el uso de VRAM frente a BF16.
- Exploracion creativa y estilistica, que es el objetivo declarado del modelo base Krea 2.
- No se documentan en la informacion disponible capacidades de edicion de imagen por instrucciones, inpainting, control estructural (ControlNet), tool calling, agentes, razonamiento multi-paso, vision de entrada ni audio. No es un modelo de lenguaje y no admite function calling.

## Casos de uso

- Prototipado rapido de ideas visuales en ComfyUI: cargar la variante rank 32 permite iterar bocetos con un checkpoint de 7,43 GiB antes de decidir si se necesita la fidelidad de rank 128, reduciendo el coste de cada prueba.
- Estaciones de trabajo con VRAM limitada: al sustituir el modelo BF16 por un checkpoint INT4, un equipo que no puede alojar el original puede seguir ejecutando el mismo flujo de 1024×1024 con 28 pasos y CFG 4.5.
- Generacion por lotes de variantes creativas para marketing: el modelo produce multiples salidas por prompt combinando semillas; el rango 64 ofrece un equilibrio razonable entre fidelidad (LPIPS 0,2141) y tamano (7,60 GiB).
- Direccion de arte y moodboards: el modelo base esta orientado a diversidad estetica y control de estilo, por lo que encaja en fases de exploracion visual donde se generan decenas de referencias antes de fijar una linea grafica.
- Integracion en pipelines automatizados de creacion de assets: al ser un fichero `safetensors` que se carga en nodos de ComfyUI, puede formar parte de un grafo programatico que genere ilustraciones para documentacion, presentaciones o prototipos de producto.
- Evaluacion comparativa de tecnicas de cuantizacion: las tres variantes con sus metricas LPIPS/PSNR permiten medir en un caso real el impacto del rango de la rama de bajo rango sobre la calidad de imagen, como referencia para decidir cuantizaciones en otros modelos.
- Despliegue en demo o servicio interno de baja concurrencia: si la GPU disponible no admite BF16, una variante INT4 permite mantener el modelo en memoria y servir peticiones de una en una sin cambiar el codigo de muestreo.

## Benchmarks y rendimiento

Unicos datos publicados en la informacion disponible: comparacion de cada variante cuantizada contra el modelo en bf16 (no contra otros modelos), promediando 8 prompts × 2 semillas a 1024×1024, 28 pasos, CFG 4.5, Euler/simple.

| Checkpoint | LPIPS (menor es mejor) | PSNR (mayor es mejor) | Tamano de descarga |
|---|---:|---:|---:|
| Rank 32 | 0,2416 | 18,97 dB | 7,43 GiB |
| Rank 64 | 0,2141 | 19,60 dB | 7,60 GiB |
| Rank 128 | 0,1969 | 19,49 dB | 7,93 GiB |

Observaciones sobre los datos: la mejora de LPIPS es monotona con el rango (0,2416 → 0,2141 → 0,1969), pero el PSNR no lo es: rank 128 obtiene 19,49 dB, ligeramente por debajo de los 19,60 dB de rank 64. Esa discrepancia sugiere que PSNR y LPIPS no ordenan igual las tres variantes y que la eleccion entre rank 64 y rank 128 no esta resuelta por estos numeros con un unico conjunto de 16 muestras. No se han publicado resultados de MMLU, HumanEval, GSM8K ni de metricas de calidad de imagen tipo FID, CLIP score o evaluacion humana en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: los pesos INT4 ocupan entre 7,43 y 7,93 GiB segun variante. Sumando activaciones, text encoder y VAE para 1024×1024, es razonable planificar un rango orientativo de 10-14 GB, aunque la cifra exacta no esta publicada y depende del grafo de ComfyUI y de la precision de los componentes no cuantizados.
- GPU recomendadas: no se especifican en la informacion disponible. Los kernels INT4 de Nunchaku y su compatibilidad por generacion de GPU no estan documentados en esta ficha; conviene verificar los requisitos del port Krea 2 Nunchaku antes de desplegar.
- GPU de consumo: por tamano de pesos, el modelo entra en GPUs de 16 GB o mas con las tres variantes; en GPUs de 12 GB es probable que solo quepa con gestion cuidadosa de memoria y componentes auxiliares. En 8 GB es ajustado incluso para rank 32.
- Opciones de despliegue: ComfyUI con nodos de Nunchaku (via el port krea2-nunchaku), runtime Nunchaku. Herramientas de cuantizacion: DeepCompressor. vLLM, llama.cpp, Ollama y TGI no aplican, al ser servidores orientados a modelos de lenguaje.
- Latencia y throughput: no disponibles. No se publican tiempos por imagen, VRAM pico medida ni rendimiento en imagenes por segundo para ninguna de las tres variantes.
- Almacenamiento: 24,6 GB si se descarga el repositorio completo; 7,43-7,93 GiB si solo se descarga una variante.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto / resolucion | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ssitu/Krea-2-Raw-SVDQuant (este) | Cuantizacion INT4 W4A4 de Krea 2 Raw | No disponible | 1024×1024 en la configuracion evaluada | Krea 2 Community License | HuggingFace, 0 descargas |
| krea/Krea-2-Raw | Modelo base texto-a-imagen en BF16 | No disponible | No disponible | Krea 2 Community License | HuggingFace (oficial) |
| krea/Krea-2-Turbo | Variante del mismo modelo orientada a menos pasos | No disponible | No disponible | No disponible en la informacion | HuggingFace (oficial) |
| ModelsLab/krea-2-raw-svdquant-int4_r32 | Cuantizacion INT4 equivalente (rank 32) por otro autor | No disponible | No disponible | No disponible | HuggingFace |

La comparativa relevante es frente al modelo base: la cuantizacion reduce el peso a 7,43-7,93 GiB, pero introduce una deriva medible (LPIPS 0,1969-0,2416, PSNR 18,97-19,60 dB). Frente a Krea-2-Turbo no se dispone de datos que permitan comparar calidad ni coste por imagen. No se dispone de especificaciones de parametros, contexto ni metricas de otros generadores texto-a-imagen en la informacion proporcionada, por lo que no se incluyen comparaciones con modelos ajenos a la familia Krea.

## Limitaciones y advertencias

- Cuantizacion no oficial: no la publica Krea AI, sino un tercero (ssitu). No hay garantia de soporte, mantenimiento ni equivalencia funcional con el modelo base.
- Perdida de fidelidad medible frente a BF16: LPIPS de 0,1969 a 0,2416 y PSNR de 18,97 a 19,60 dB. En la practica implica cambios de textura y detalle fino respecto al original; si el resultado debe coincidir con BF16, esta version no es sustituta directa.
- Requiere runtime especifico: Nunchaku y el port krea2-nunchaku. No funciona como un `safetensors` generico en cualquier cargador de difusion; sin esos componentes el fichero es inutilizable.
- Compatibilidad de GPU no documentada: los kernels INT4 (W4A4) dependen de la arquitectura de la GPU y la informacion disponible no detalla que generaciones estan soportadas.
- Licencia restrictiva: la Krea 2 Community License incluye restricciones de uso comercial y salvaguardas obligatorias, y remite ademas a una Acceptable Use Policy. Hay que leer ambos documentos y el `Notice.txt` antes de cualquier uso en produccion o redistribucion; esta ficha no puede resumir el alcance exacto de esas restricciones.
- Obligacion de atribucion: el `Notice.txt` recoge atribuciones y modificaciones que deben conservarse al redistribuir.
- Idiomas: no se documenta el comportamiento con prompts en castellano ni la cobertura multilingue del text encoder; tampoco se especifica el sesgo demografico o estilistico del modelo base.
- Riesgo de sesgo y contenido inapropiado: no hay informacion sobre filtrado, evaluacion de sesgos ni tasas de generacion de contenido no deseado.
- Sin datos de produccion: cero descargas y cero likes en el momento de la consulta, y ausencia de benchmarks de calidad absoluta (FID, CLIP score, evaluacion humana), latencia o throughput. No se recomienda como base de decision sin evaluacion propia.
- Inconsistencia en las metricas: PSNR empeora ligeramente de rank 64 a rank 128, de modo que "mayor rango = mejor" no queda demostrado con los datos publicados.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/ssitu/Krea-2-Raw-SVDQuant
- Modelo base: https://huggingface.co/krea/Krea-2-Raw
- Licencia Krea 2: https://krea.ai/krea-2-licensing
- Acceptable Use Policy: https://www.krea.ai/krea-2-use-policy
- Codigo oficial de inferencia de Krea 2: https://github.com/krea-ai/krea-2
- Pagina del modelo Krea 2: https://www.krea.ai/krea-2
- DeepCompressor: https://github.com/nunchux-ai/deepcompressor
- Port Krea 2 Nunchaku: https://github.com/sztlink/krea2-nunchaku
- Cuantizacion equivalente de terceros (ModelsLab, rank 32): https://huggingface.co/ModelsLab/krea-2-raw-svdquant-int4_r32
- Scaffold de cuantizacion e inferencia (sobre Krea-2-Turbo): https://github.com/Tanmaypatil123/krea2-svdquant
