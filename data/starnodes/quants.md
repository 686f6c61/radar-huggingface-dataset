# Starnodes/quants

## Resumen

`Starnodes/quants` es un repositorio de cuantizaciones publicado por el usuario Starnodes en Hugging Face. No se trata de un modelo entrenado desde cero, sino de una coleccion de pesos comprimidos de terceros: en concreto, versiones en FP8 y NVFP4 de **FireRed-Image-Edit-1.0** (modelo de edicion de imagen del equipo FireRedTeam) y cuantizaciones NVFP4 de **ERNIE-Image** y **ERNIE-Image-Turbo** (modelos de imagen de Baidu).

Su relevancia es practica: reduce el coste de VRAM necesario para ejecutar modelos de edicion y generacion de imagen en hardware de consumo o en GPUs profesionales con soporte de precisiones reducidas. El repositorio ocupa 42,2 GB y se distribuye bajo licencia Apache 2.0, lo que facilita su integracion en pipelines comerciales sin friccion legal adicional.

La informacion disponible es limitada: la model card solo documenta el proceso de cuantizacion y los tamanos de fichero, sin detallar la arquitectura interna de los modelos originales, los datos de entrenamiento ni resultados de benchmarks. Esta ficha refleja exclusivamente lo que el autor declara.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (repositorio de cuantizaciones de modelos de imagen de terceros) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | FP8, NVFP4 (NVIDIA FP4) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

Artefactos declarados en la model card:

| Fichero | Formato | Tamano | Descripcion |
|---|---|---|---|
| `FireRed-Image-Edit-1.0_FP8.safetensors` | FP8 | ~20,4 GB | Cuantizacion de 8 bits, equilibrio entre rendimiento y calidad |
| `FireRed-Image-Edit-1_NVFP4.safetensors` | NVFP4 | ~11,6 GB | Formato de 4 bits optimizado para NVIDIA Blackwell/Ada |

## Arquitectura y entrenamiento

El repositorio no entrena ningun modelo: aplica tecnicas de cuantizacion post-entrenamiento sobre pesos ya publicados. Los modelos de origen son FireRed-Image-Edit-1.0 (edicion de imagen) y ERNIE-Image / ERNIE-Image-Turbo (generacion de imagen de Baidu). La model card no especifica si la cuantizacion es weight-only o tambien de activaciones, ni el algoritmo exacto empleado (por ejemplo, calibracion, escalado por bloques o formatos con escalas compartidas).

La innovacion tecnica destacable es el uso de **NVFP4**, un formato de coma flotante de 4 bits definido por NVIDIA que combina mantisa y exponente reducidos con escalas por bloque. Esto permite comprimir los pesos hasta aproximadamente 11,6 GB en el caso de FireRed-Image-Edit-1.0, frente a los 20,4 GB de la version FP8, a costa de una perdida de fidelidad numerica que el autor no cuantifica. No se aportan datos sobre el numero de tokens de entrenamiento, composicion del dataset ni tecnicas de alineacion (RLHF/DPO), porque corresponden a los modelos originales y no se documentan aqui.

## Capacidades

- Edicion de imagen: la cuantizacion de FireRed-Image-Edit-1.0 hereda las capacidades del modelo original para modificar imagenes a partir de instrucciones.
- Generacion de imagen: las cuantizaciones NVFP4 de ERNIE-Image y ERNIE-Image-Turbo permiten ejecutar modelos texto-a-imagen de Baidu con menor huella de VRAM.
- Inferencia en precision reducida: los pesos FP8 y NVFP4 estan pensados para GPUs con soporte nativo de estos formatos.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de audio.
- Capacidades multilingues: no disponibles.
- No se declara modo thinking ni otras capacidades especiales adicionales.

## Casos de uso

- Edicion de imagen en estaciones de trabajo con VRAM limitada: cargar `FireRed-Image-Edit-1_NVFP4.safetensors` (~11,6 GB) permite ejecutar el modelo de edicion en GPUs de 16-24 GB donde la version original en BF16 no cabria.
- Prototipado rapido de pipelines de edicion: la version FP8 (~20,4 GB) ofrece un punto intermedio de calidad y memoria para entornos de desarrollo con una sola GPU profesional.
- Despliegue de generacion de imagen en servidores con Blackwell: los pesos NVFP4 de ERNIE-Image aprovechan las unidades de computo FP4 de estas arquitecturas para aumentar el throughput por GPU.
- Evaluacion comparativa de cuantizaciones: el repositorio permite medir la degradacion de calidad entre FP8 y NVFP4 sobre el mismo modelo base, util para decidir que formato usar en produccion.
- Fine-tuning o LoRA sobre modelos cuantizados: los safetensors pueden servir como punto de partida en flujos que admitan adaptadores sobre pesos de baja precision.
- Integracion en aplicaciones creativas de escritorio: el menor tamano de los ficheros NVFP4 facilita distribuir el modelo junto a una aplicacion local sin depender de la nube.
- Investigacion sobre formatos FP4: util para estudiar el impacto de NVFP4 en la calidad de salida de modelos de difusion o de imagen.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: aproximadamente 11,6 GB para la version NVFP4 de FireRed-Image-Edit-1.0 y 20,4 GB para la FP8, segun los tamanos de fichero declarados (la VRAM real de inferencia sera superior por activaciones y buffers).
- GPU recomendadas: NVIDIA Blackwell (serie RTX 50, B100/B200) para NVFP4; GPUs Ada (RTX 40, L40S) y Hopper (H100) para FP8.
- Cabe en GPU de consumo: la version NVFP4 es viable en GPUs con 16 GB o mas de VRAM que soporten FP4; la FP8 requiere 24 GB o mas.
- Opciones de despliegue: no se especifican en la model card; al ser safetensors, dependera del framework del modelo original (por ejemplo, diffusers) y del soporte de FP8/NVFP4 del runtime.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Starnodes/quants (FireRed-Image-Edit-1.0 NVFP4) | no disponible | no disponible | NVFP4, safetensors | Apache 2.0 | Hugging Face |
| FireRedTeam/FireRed-Image-Edit-1.0 (original) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| baidu/ERNIE-Image (original) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| baidu/ERNIE-Image-Turbo (original) | no disponible | no disponible | no disponible | no disponible | Hugging Face |

No se dispone de datos de rendimiento ni de parametros de los modelos originales en la informacion proporcionada, por lo que la comparacion se limita a disponibilidad y formato.

## Limitaciones y advertencias

- La cuantizacion a FP8 y especialmente a NVFP4 puede degradar la calidad de las imagenes generadas o editadas; el autor no publica metricas de degradacion.
- NVFP4 requiere hardware NVIDIA compatible (Blackwell/Ada); en GPUs sin soporte nativo el rendimiento puede ser peor que usar los pesos originales.
- No se documentan sesgos del modelo original ni del proceso de cuantizacion.
- Riesgo de alucinacion y fidelidad a la instruccion: no evaluado en esta informacion.
- Idiomas soportados: no disponibles; no se puede garantizar comportamiento multilingue.
- Licencia Apache 2.0 declarada por el autor del repositorio, pero la licencia de los modelos originales debe verificarse por separado antes de uso comercial.
- Repositorio con 0 descargas y sin pipeline declarado: menor madurez y soporte comunitario que los repositorios oficiales.
- No se especifica el metodo de cuantizacion ni las herramientas usadas, lo que dificulta reproducir los pesos.

## Enlaces

- Repositorio de cuantizaciones: https://huggingface.co/Starnodes/quants
- Modelo original FireRed-Image-Edit-1.0: https://huggingface.co/FireRedTeam/FireRed-Image-Edit-1.0
- Modelo original ERNIE-Image: https://huggingface.co/baidu/ERNIE-Image
