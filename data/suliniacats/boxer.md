# suliniacats/boxer

## Resumen

Boxer es un sistema de detección de objetos en 3D desarrollado por Meta (Facebook Research) que estima cajas delimitadoras 3D estáticas (3DBB) a partir de detecciones 2D de vocabulario abierto, imágenes con pose conocida y datos de profundidad opcionales. Su componente central es BoxerNet, una red basada en transformers que eleva propuestas de cajas 2D al espacio 3D, a lo que sigue una etapa de fusión multivista y filtrado geométrico para producir cajas 3D globalmente consistentes y deduplicadas en espacio métrico del mundo.

El modelo aborda un problema clásico de visión por computador: convertir detecciones 2D abiertas (generadas por detectores de vocabulario abierto como OWLv2) en geometría 3D utilizable para robótica, realidad aumentada o reconstrucción de escenas. Al no depender de un vocabulario cerrado de clases, permite detectar objetos arbitrarios descritos en lenguaje natural.

Es relevante porque combina detección de vocabulario abierto con elevación geométrica a 3D y fusión multivista, un pipeline poco común en modelos publicados abiertamente. El repositorio ocupa 2,0 GB e incluye los checkpoints de BoxerNet, así como dependencias de terceros (DINOv3 y OWLv2) sujetas a sus propias licencias.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (BoxerNet) para elevación de 2DBB a 3DBB, con fusión multivista y filtrado geométrico |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (procesa secuencias de imágenes con pose; el ejemplo usa `--max_n=90`) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo de visión, no lingüístico) |
| Licencia | BOXER License (transición desde CC BY-NC 4.0 efectiva el 17 de noviembre de 2026) |
| Formato de pesos | no disponible (checkpoints descargables mediante scripts del repositorio) |

## Arquitectura y entrenamiento

Boxer es un algoritmo compuesto por varias etapas. La primera es BoxerNet, una red transformer que toma propuestas de cajas 2D (procedentes de detección de vocabulario abierto), imágenes con pose y, opcionalmente, mapas de profundidad, y las eleva a cajas delimitadoras 3D. A continuación, el sistema aplica fusión multivista para integrar las estimaciones de múltiples vistas y un filtrado geométrico que elimina duplicados y asegura consistencia global en espacio métrico del mundo.

El pipeline se apoya en componentes de terceros: DINOv3 (probablemente como extractor de características visuales) y OWLv2 (detector de vocabulario abierto que genera las propuestas 2D). No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset ni si se emplearon técnicas de RLHF o DPO (poco probables en un modelo de visión geométrica). El dataset asociado es `facebook/boxer`. El ejemplo de uso (`python run_boxer.py --input nym10_gen1 --max_n=90 --track`) sugiere procesamiento de secuencias de hasta 90 imágenes con seguimiento temporal opcional.

## Capacidades

- Detección de objetos 3D a partir de detecciones 2D de vocabulario abierto (clases no restringidas a un conjunto predefinido).
- Elevación de cajas 2D a cajas 3D estáticas en espacio métrico del mundo.
- Fusión multivista para generar cajas 3D globalmente consistentes.
- Deduplicación y filtrado geométrico de detecciones redundantes entre vistas.
- Uso opcional de datos de profundidad para mejorar la estimación geométrica.
- Seguimiento temporal (`--track`) sobre secuencias de imágenes.
- Integración con detectores de vocabulario abierto (OWLv2) y extractores de características (DINOv3).
- Salida en formato CSV junto con visualizaciones.
- No es un modelo lingüístico: no genera texto ni soporta tool calling ni razonamiento multi-paso en el sentido de los LLM.

## Casos de uso

- Robótica móvil y manipulación: el sistema puede generar cajas 3D de objetos arbitrarios en el entorno del robot a partir de cámaras RGB (y profundidad opcional), proporcionando geometría métrica para planificación de agarre o navegación.
- Realidad aumentada: colocación de anclajes 3D sobre objetos detectados en escenas reales, usando la consistencia multivista para mantener las cajas estables al mover la cámara.
- Reconstrucción y anotación de escenas: generación automática de etiquetas 3D para datasets de interior o exterior, reduciendo el coste de anotación manual mediante detecciones de vocabulario abierto.
- Inventario y auditoría de espacios: detección y localización 3D de objetos concretos descritos en lenguaje natural (por ejemplo, "extintor" o "caja de cartón") en secuencias de vídeo de almacenes.
- Vehículos autónomos y ADAS (prototipado): estimación de cajas 3D de obstáculos a partir de detecciones 2D y poses de cámara, útil en pipelines de percepción que no dispongan de LiDAR.
- Análisis de vídeo de vigilancia: elevación a 3D de detecciones 2D en secuencias multi-cámara para estimar posición y volumen de objetos en el mundo.
- Investigación en visión 3D: banco de pruebas para estudiar la elevación de cajas 2D a 3D y la fusión multivista con detección de vocabulario abierto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 2,0 GB, pero incluye checkpoints de BoxerNet y dependencias de terceros (DINOv3 y OWLv2), por lo que el consumo real dependerá de los componentes cargados.
- GPU recomendadas: no disponible en la información proporcionada. Por el uso de transformers y modelos de visión de terceros, se espera que requiera GPU con soporte CUDA (torch>=2.0).
- Compatibilidad con GPU de consumo: no confirmada; probablemente viable en GPUs consumer con suficiente VRAM para DINOv3 y OWLv2, pero sin datos oficiales.
- Opciones de despliegue: ejecución mediante el script `run_boxer.py` del repositorio oficial, con entorno gestionado por `uv` (Python 3.12) y dependencias `torch>=2.0`, `numpy`, `opencv-python`, `tqdm` y `dill`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI (no aplicables a este tipo de modelo).
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de elevación de cajas 2D a 3D con vocabulario abierto, ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- El modelo estima cajas 3D **estáticas**; no modela movimiento ni deformación de objetos.
- Depende de la calidad de las detecciones 2D de vocabulario abierto (OWLv2) y de las poses de cámara; errores en estas entradas degradan la geometría 3D resultante.
- La elevación a 3D desde 2D es un problema ambiguo; sin profundidad, la precisión métrica puede verse comprometida.
- Licencia BOXER License con transición desde CC BY-NC 4.0 efectiva el 17 de noviembre de 2026: debe revisarse el texto completo antes de cualquier uso comercial, ya que la licencia previa restringía el uso a fines no comerciales.
- Los checkpoints de DINOv3 y OWLv2 son materiales de terceros sujetos a sus propias licencias (ver NOTICE en el repositorio); su uso está condicionado por dichos términos.
- No se dispone de información sobre sesgos del dataset de entrenamiento (`facebook/boxer`), cobertura geográfica o demográfica, ni evaluación de robustez.
- Riesgo de alucinación geométrica: el modelo puede generar cajas 3D para detecciones 2D espurias, produciendo objetos inexistentes en la escena.
- Sin datos publicados de benchmarks, latencia o requisitos de hardware, la evaluación en producción requiere validación propia.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta; se trata de una publicación reciente sin validación comunitaria.

## Enlaces

- Hugging Face: https://huggingface.co/suliniacats/boxer
- Página del proyecto: https://facebookresearch.github.io/boxer
- Paper: https://huggingface.co/papers/2604.05212
- Código: https://github.com/facebookresearch/boxer
- Dataset: https://huggingface.co/datasets/facebook/boxer
- Arquitectura del sistema (imagen): https://github.com/facebookresearch/boxer/raw/main/docs/images/boxer_system.jpg
- Licencia: LICENSE (en el repositorio)
- Aviso de cambio de licencia: LICENSE_CHANGE_NOTICE.md (en el repositorio)
- Aviso de terceros: NOTICE (en el repositorio)
