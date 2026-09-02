# Xiliourt/wan2-2-fp8da-aoti-preview-runpod

## Resumen

El modelo `Xiliourt/wan2-2-fp8da-aoti-preview-runpod` es una versión preliminar optimizada del modelo de generación de vídeo Wan2.2 14B, desarrollado por la comunidad (autor Xiliourt) sobre la arquitectura Wan2.2 de Alibaba. Esta variante emplea cuantización FP8 dinámica (FP8DA) y compilación AOTInductor (AOTI) para acelerar la inferencia y reducir el consumo de memoria, lo que la hace especialmente adecuada para despliegue en entornos como RunPod. El modelo está diseñado para generar vídeos cortos a partir de una imagen de entrada y un prompt de texto que describe el movimiento deseado.

Se trata de un *preview* técnico, con escasa documentación oficial y sin licencia declarada, por lo que su uso en producción debe considerarse con cautela. La relevancia actual radica en que demuestra la viabilidad de ejecutar modelos de vídeo de gran tamaño en hardware de consumo mediante optimizaciones de cuantización y compilación, un área de gran interés en 2026.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de difusion para generacion de video (basado en Wan2.2, no se especifica detalle interno) |
| Parametros totales | 14 mil millones (14B) |
| Parametros activos | no disponible |
| Longitud de contexto | no aplica (modelo de video) |
| Tipos de cuantizacion | FP8 dinamica (FP8DA), compilacion AOTI |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (presumiblemente safetensors, sin confirmar) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde a Wan2.2, un modelo de difusion para generacion de video desarrollado por el equipo Wan-Video de Alibaba. Segun el repositorio oficial de Wan2.2, la familia incluye modelos con un VAE propio que alcanza una compresion 16x16x4, permitiendo generar video a 720P y 24 fps. La variante de 14B es una version mas grande que la de 5B publicada en el repositorio, aunque no se han publicado detalles especificos sobre su arquitectura interna (tipo de transformer, atencion, etc.) en la informacion disponible.

En cuanto al entrenamiento, no se dispone de datos sobre el numero de tokens, composicion del dataset o tecnicas de alineacion (RLHF/DPO). La optimizacion FP8DA y AOTI se aplica post-entrenamiento para reducir el peso del modelo y acelerar la inferencia, pero no aporta informacion sobre el proceso de entrenamiento original.

## Capacidades

- Generacion de video a partir de una imagen de entrada y un prompt de texto (image-to-video).
- Control de parametros como duracion, tasa de frames y calidad (segun la interfaz del espacio Gradio asociado).
- Soporte para generacion de video en resolucion 720P y 24 fps (segun el repositorio de Wan2.2, aunque no se confirma si esta variante especifica lo mantiene).
- Optimizacion para inferencia rapida y eficiente en memoria gracias a FP8 dinamica y compilacion AOTI, lo que permite ejecucion en GPUs de consumo.
- Capacidades multilingues: no disponible (el modelo puede funcionar con prompts en varios idiomas, pero no hay documentacion).

## Casos de uso

- Creacion de contenido audiovisual para redes sociales: a partir de una fotografia fija, se puede generar un clip corto con movimiento natural (por ejemplo, animar un paisaje o un objeto) para publicaciones en plataformas como Instagram o TikTok.
- Prototipado rapido en produccion audiovisual: directores o editores pueden previsualizar escenas animadas a partir de storyboards en imagen antes de invertir en renderizado completo.
- Generacion de material educativo animado: convertir diagramas o ilustraciones estaticas en secuencias animadas para explicar conceptos cientificos o tecnicos.
- Publicidad dinamica: crear versiones animadas de banners o imagenes de producto para campanas digitales sin necesidad de equipos de animacion.
- Asistencia en diseno de videojuegos: generar cutscenes o animaciones de prueba a partir de concept art.
- Investigacion en generacion de video: servir como punto de partida para estudiar tecnicas de cuantizacion FP8 y compilacion AOTI en modelos de difusion de gran tamano.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No hay datos objetivos sobre calidad de generacion, velocidad de inferencia o comparaciones con otros modelos. La unica referencia es el tutorial de AI Indigo que menciona "alta velocidad" y "eficiencia de memoria", pero sin cifras concretas.

## Requisitos de hardware

- VRAM estimada: al ser un modelo de 14B cuantizado a FP8, se estima que requiere entre 16 y 24 GB de VRAM, dependiendo de la resolucion de salida y la longitud del video. Para 720P y 24 fps, probablemente se necesiten al menos 24 GB.
- GPU recomendadas: NVIDIA RTX 4090 (24 GB) para pruebas locales; para produccion, se recomienda A100 (40/80 GB) o H100. El nombre del modelo ("runpod") sugiere despliegue en instancias cloud de RunPod.
- Consumo: gracias a la cuantizacion FP8 y la compilacion AOTI, el modelo es ejecutable en GPUs consumer de gama alta, aunque para videos largos o resoluciones mayores puede requerir GPUs profesionales.
- Opciones de despliegue: el espacio de Hugging Face usa Gradio; se puede servir via API con frameworks como vLLM o TGI si se adaptan a modelos de video, o mediante scripts personalizados con PyTorch compilado con AOTInductor.
- Latencia y throughput: no disponibles; dependen del hardware y de la configuracion de generacion (numero de frames, resolucion).

## Comparativa con modelos similares

No se dispone de datos comparativos publicados para esta variante especifica. Sin embargo, se puede comparar a nivel general con otros modelos de generacion de video open source:

| Modelo | Parametros | Resolucion | Licencia | Notas |
|---|---|---|---|---|
| Wan2.2 5B (oficial) | 5B | 720P | Apache 2.0 (segun repo) | Modelo base, sin optimizaciones FP8 |
| Wan2.2 14B (esta variante) | 14B | no confirmado | no disponible | Preview con FP8DA + AOTI |
| Stable Video Diffusion | 1.4B | 1024x576 | Stability AI license | Enfoque en clips cortos, menos parametros |

La comparacion es limitada porque no existen benchmarks publicos que enfrenten a estos modelos en las mismas condiciones. La ventaja de esta variante es su optimizacion para hardware consumer, pero su licencia no clara puede ser un obstaculo para uso comercial.

## Limitaciones y advertencias

- Es una version *preview*: no se garantiza estabilidad ni calidad de produccion. Puede contener errores o comportamientos imprevistos.
- Licencia no declarada: no se puede determinar si es permitido su uso comercial. Se recomienda contactar al autor o esperar una version oficial con licencia clara.
- Sesgos y alucinaciones visuales: como todo modelo generativo, puede producir artefactos, movimientos no realistas o distorsiones, especialmente con prompts complejos.
- Limitaciones de idioma: no hay confirmacion de idiomas soportados; los prompts en idiomas distintos al ingles pueden no funcionar correctamente.
- Requisitos de hardware: aunque optimizado, sigue siendo un modelo grande; en GPUs con menos de 24 GB puede no caber o requerir reduccion de resolucion.
- Dependencia de la compilacion AOTI: el rendimiento depende de que el entorno de despliegue tenga las librerias y versiones de PyTorch compatibles; puede fallar en configuraciones no estandar.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/Xiliourt/wan2-2-fp8da-aoti-preview-runpod)
- [Espacio Gradio de demostracion](https://huggingface.co/spaces/r3gm/wan2-2-fp8da-aoti-preview)
- [Repositorio oficial de Wan2.2 en GitHub](https://github.com/Wan-Video/Wan2.2)
- [Tutorial de AI Indigo sobre Wan2.2 FP8DA AOTI](https://aiindigo.com/tutorials/getting-started-with-wan2-2-fp8da-aoti-faster-high-speed-video-generation)
- [Resena en AI Indigo](https://aiindigo.com/tool/wan22-fp8da-aoti-preview)
