# yingkaisha/CONUS404-AI-TC

## Resumen

CONUS404-AI-TC es un modelo de inteligencia artificial para downscaling climático dinámico, desarrollado por Yingkai Sha (yingkaisha). El modelo emplea una arquitectura basada en Swin-Transformer para un modelo de área limitada (LAM) y un post-procesador U-Net para precipitación, con el objetivo de producir campos meteorológicos de alta resolución (4 km, horarios) a partir de forzamientos de baja resolución (0.25°, trihorarios) de ERA5. Está entrenado con datos de 1980 a 2019, tomando CONUS404 como referencia, y muestra capacidades de generalización bajo condiciones de contorno diversas.

La relevancia de este modelo radica en que ofrece una alternativa basada en IA al downscaling dinámico clásico, reduciendo costes computacionales y manteniendo una resolución espacial comparable a los productos reanálisis de última generación. El repositorio en Hugging Face (6,3 GB) contiene los pesos del modelo, y la licencia Apache 2.0 permite su uso y modificación tanto en investigación como en aplicaciones comerciales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Swin-Transformer limited-area model + U-Net post-processing |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de vision) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no aplica (modelo de datos meteorologicos) |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible (probablemente safetensors o pytorch) |

## Arquitectura y entrenamiento

El modelo combina un Swin-Transformer como bloque principal de un limited-area model (LAM) con un U-Net para el post-procesado de precipitacion. Segun la informacion publicada en el taller de CESM de 2026, el entrenamiento se realiza con datos de 0.25° y 3-horarios de ERA5 como forzamiento, y CONUS404 (4 km, horario) como objetivo, abarcando el periodo 1980-2018 (aunque la busqueda menciona 1980-2019). El objetivo es producir downscaling dinamico con una resolucion de 4 km y frecuencia horaria.

No se han publicado detalles sobre el numero de tokens de entrenamiento, composicion exacta del dataset ni tecnicas de RLHF/DPO, ya que no se trata de un modelo de lenguaje. La innovacion principal radica en aplicar arquitecturas de vision transformer a la simulacion meteorologica regional, con una capacidad de generalizacion bajo condiciones de contorno diversas, como se indica en el repositorio de GitHub asociado.

## Capacidades

- Downscaling dinamico de variables meteorologicas: produce campos de alta resolucion (4 km, horarios) a partir de datos de baja resolucion (0.25°, 3-horarios).
- Generalizacion a diferentes condiciones de contorno: el modelo muestra robustez al aplicarse a distintos escenarios de forzamiento, lo que lo hace util para simulaciones de clima pasado o futuro.
- Post-procesado de precipitacion mediante el modulo U-Net, mejorando la precision de las estimaciones de lluvia.
- Capacidad de generar series temporales largas (40 años) con resolucion horaria, util para analisis hidroclimaticos.
- No soporta generacion de texto, codigo, tool calling, ni agentes; es exclusivamente un modelo de vision aplicado a datos meteorologicos.

## Casos de uso

- Generacion de forzamientos hidrologicos: el modelo produce datos de alta resolucion (4 km, horarios) que pueden alimentar modelos hidrologicos, mejorando la representacion de la variabilidad espacial en cuencas complejas.
- Analisis de eventos extremos: permite reconstruir o generar series de alta resolucion para estudiar tormentas, olas de calor o sequias, gracias a su capacidad de producir datos horarios a 4 km.
- Downscaling de proyecciones climaticas: se puede conectar con modelos globales (como CESM) para obtener simulaciones regionales de alta resolucion, evaluando impactos locales del cambio climatico.
- Validacion de modelos meteorologicos: las salidas del modelo pueden compararse con observaciones de alta resolucion para validar la precision de otros sistemas de prediccion.
- Investigacion en meteorologia de mesoescala: permite estudiar procesos locales (por ejemplo, conveccion orografica) que no son capturados por modelos de menor resolucion.
- Planificacion de recursos hidricos: al generar series de precipitacion y temperatura de alta resolucion, se puede mejorar la gestion de embalses y sistemas de riego, con aplicaciones en agricultura de precision.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La documentacion del taller de CESM menciona que el modelo se evalua en terminos de su capacidad de generalizacion bajo condiciones de contorno distintas, pero no se proporcionan metricas cuantitativas (como RMSE o bias) en los materiales revisados.

## Requisitos de hardware

- Tamaño del repositorio: 6,3 GB, lo que indica un modelo de gran tamano (probablemente del orden de cientos de millones de parametros).
- VRAM estimada: no disponible, pero un modelo de Swin-Transformer con entrada de 4 km y salida horaria requiere una GPU con al menos 16 GB de memoria para inferencia en precision FP16.
- GPU recomendadas: se recomiendan GPUs con 24 GB o mas, como NVIDIA RTX 4090, A100 o H100, para manejar el proceso de downscaling completo sin cuantizacion.
- En una GPU consumer (RTX 4090) puede caber en memoria, pero la inferencia sobre 40 años de datos puede ser computacionalmente intensiva; se recomienda usar lotes de datos temporales.
- Opciones de despliegue: se puede usar con frameworks de inferencia como PyTorch, o con herramientas de despliegue de modelos de vision (TorchServe, ONNX Runtime). No hay soporte nativo para vLLM o llama.cpp, ya que no es un LLM.
- Latencia y throughput: no disponibles; dependen del hardware y del tamaño de la region de downscaling.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la misma categoria (downscaling climatico con IA). Se podrian mencionar alternativas como el modelo de downscaling de Google (GraphCast) o modelos de super-resolution meteorologica, pero no hay datos concretos en la informacion proporcionada. Por tanto, la comparativa no esta disponible.

## Limitaciones y advertencias

- Sesgos espaciales: el modelo se entrena especificamente sobre el territorio de Estados Unidos (CONUS), por lo que su aplicacion fuera de esta region puede no ser valida sin un reentrenamiento.
- Riesgo de alucinacion: al ser un modelo generativo, puede producir salidas inconsistentes fisicamente en condiciones extremas no representadas en los datos de entrenamiento.
- Limitaciones temporales: los datos de entrenamiento cubren 1980-2019, por lo que no se ha validado su comportamiento en condiciones climaticas futuras (por ejemplo, bajo escenarios de cambio climatico intenso).
- Restricciones de licencia: aunque la licencia Apache 2.0 permite uso comercial, se recomienda citar la fuente y verificar que los datos de entrenamiento (ERA5, CONUS404) no tengan restricciones adicionales.
- Para produccion: se requiere validacion rigurosa contra observaciones locales antes de usar en aplicaciones criticas (como gestion de emergencias o infraestructura).

## Enlaces

- [Hugging Face - yingkaisha/CONUS404-AI-TC](https://huggingface.co/yingkaisha/CONUS404-AI-TC)
- [GitHub - RAL-GWC-CONUS](https://github.com/yingkaisha/RAL-GWC-CONUS/tree/main/)
- [Perfil de yingkaisha en Hugging Face](https://huggingface.co/yingkaisha/models)
- [CONUS404: Four-kilometer long-term regional hydroclimate reanalysis (USGS)](https://www.usgs.gov/data/conus404-four-kilometer-long-term-regional-hydroclimate-reanalysis-over-conterminous-united)
- [PDF - AI-based Dynamical Downscaling (CESM workshop)](https://www.cesm.ucar.edu/sites/default/files/2026-06/2026cesmworkshopsha.pdf)
