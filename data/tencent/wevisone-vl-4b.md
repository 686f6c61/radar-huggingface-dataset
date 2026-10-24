# tencent/WeVisOne-VL-4B

## Resumen

WeVisOne-VL-4B es un modelo de visión-lenguaje desarrollado por WeChat Vision (Tencent Inc.) que unifica percepción a nivel de objeto y a nivel de píxel dentro de un único modelo generativo. Está construido sobre Qwen3-VL y combina la predicción estructurada del siguiente token con un decodificador de píxeles ligero de 9,6 millones de parámetros, lo que le permite abordar tareas que habitualmente requieren modelos separados: detección de objetos con vocabulario abierto, localización por referencia, conteo, pointing, OCR, segmentación por referencia y matting alfa con prompts.

El modelo tiene 4.830.581.248 parámetros totales (aproximadamente 4,83 mil millones) y se distribuye en formato safetensors para la librería transformers, con un repositorio de 19,4 GB. La relevancia práctica está en que sustituye una cadena de modelos especializados por una sola inferencia con salida estructurada: cajas y puntos normalizados mediante tokens de coordenada dedicados (`<0>` a `<1000>`), y máscaras densas a resolución completa cuando se activan las tareas densas.

Es un lanzamiento reciente (repositorio creado el 22 de octubre de 2026) bajo licencia Apache 2.0, orientado explícitamente a investigación en grounding visual y percepción densa. No se han publicado resultados de benchmarks ni datos sobre el proceso de entrenamiento en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer vision-lenguaje basada en Qwen3-VL (`qwen3_vl`), con decodificador de píxeles auxiliar de 9,6 M de parámetros |
| Parametros totales | 4.830.581.248 (aprox. 4,83 B); incluye `mask_decoder.pt` de 9.609.764 parámetros |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; solo se publican pesos en safetensors (sin variantes GGUF, AWQ ni GPTQ documentadas) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (código propio de Tencent; los componentes de terceros conservan sus licencias) |
| Formato de pesos | safetensors (`transformers`) más `mask_decoder.pt` en PyTorch |

## Arquitectura y entrenamiento

El núcleo es un transformer vision-lenguaje Qwen3-VL que recibe imagen y texto y genera tokens. Sobre esa base, WeVisOne-VL introduce dos mecanismos propios: un vocabulario de tokens de coordenada (`<0>` ... `<1000>`) que codifica cajas delimitadoras y puntos normalizados, y un token especial de instancia `<OBJ>` (ID 152678) que se emite tras cada caja predicha para las tareas densas, actuando como anclaje de la instancia. El modelo devuelve `None` cuando el objetivo consultado no está presente, lo que evita forzar detecciones inexistentes.

La parte densa se resuelve con `mask_decoder.pt`, un decodificador de 9,6 M de parámetros que combina tres piezas: un adaptador de características visuales sobre las features multinivel del ViT de Qwen3-VL previas al merging; un decodificador de consultas guiado por caja con 6 bloques de atención cruzada deformable, inicializado a partir del estado oculto de `<OBJ>` y de la caja codificada con características de Fourier; y una cabeza de predicción densa condicionada por instancia (`FullCanvasAlphaCascadeHead`) que refina en escalas S/4, S/2 y S/1 hasta producir máscaras alfa continuas a resolución completa con stride 1.

No se han publicado en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si se aplicaron etapas de RLHF o DPO. La model card indica que, por eficiencia de inferencia, el modelo genera salidas estructuradas directamente sin cadena de razonamiento (CoT) explícita.

## Capacidades

- Detección de objetos con vocabulario abierto, devolviendo cajas normalizadas mediante tokens de coordenada.
- Comprensión de expresiones referenciales (*referring expression comprehension*) y localización guiada por descripción textual.
- Pointing de objetos: predicción de puntos concretos sobre la imagen.
- Conteo de objetos, con salida estructurada por instancia.
- OCR con localización de texto en la imagen.
- Segmentación por referencia (*referring expression segmentation*) gracias al decodificador denso.
- Matting alfa con prompts (*promptable alpha matting*), con máscaras continuas a resolución completa y stride 1.
- Generación de texto conversacional en pipeline `image-text-to-text`.
- Rechazo explícito de objetivos ausentes: devuelve `None` en lugar de alucinar una caja.
- Percepción de un solo turno y una sola imagen; no hay modo de razonamiento extendido ni soporte de vídeo en el decodificador de píxeles.
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades de audio: no disponibles.

## Casos de uso

- Anotación automática de datasets de visión: el modelo genera cajas y máscaras por instancia a partir de un prompt textual, lo que permite preetiquetar imágenes y reducir el coste de anotación manual en pipelines de datos.
- Segmentación interactiva en herramientas de edición: dado un prompt como "persona" o una caja, devuelve una máscara por referencia que puede alimentar un editor de recorte o un flujo de composición.
- Matting profesional para *background removal*: la cabeza `FullCanvasAlphaCascadeHead` produce alfa continuo a resolución completa, adecuado para sustitución de fondos en fotografía de producto o vídeo con bordes finos.
- Conteo y control de inventario visual: el conteo estructurado por instancia permite contar unidades en estanterías, almacenes o imágenes aéreas sin un detector específico entrenado por categoría.
- Digitalización documental con OCR localizado: además de transcribir, devuelve la posición de cada fragmento de texto, lo que sirve para reconstruir el layout de facturas, formularios o tickets.
- Accesibilidad y descripción de imágenes: la combinación de descripción textual y localización permite generar descripciones que referencian regiones concretas de la imagen.
- Robótica e interacción guiada por referencia: el pointing y la localización por expresión pueden convertir una instrucción en lenguaje natural en una coordenada sobre la escena para un brazo manipulador o un sistema de navegación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia (derivada del número de parámetros, no publicada por el autor): en bfloat16/fp16, en torno a 9,7 GB solo de pesos más unos 19 MB del decodificador; en fp32, unos 19,3 GB; en int8, unos 4,8 GB; en int4, unos 2,4 GB. A estas cifras hay que sumar caché KV, activaciones del codificador visual y memoria de las máscaras densas a resolución completa.
- GPU recomendadas: A100 (40/80 GB) o H100 para lotes grandes y producción; L40S o RTX 6000 Ada como alternativas de 48 GB.
- ¿Cabe en GPU de consumo? Sí: en bfloat16 cabe en una RTX 4090 o RTX 3090 de 24 GB con margen para lote pequeño; en tarjetas de 16 GB conviene reducir resolución de entrada o recurrir a cuantización, aunque el autor no publica variantes cuantizadas.
- Opciones de despliegue: la vía oficial es el paquete `wevisone_vl` publicado en GitHub, que carga el modelo con `transformers` y gestiona el decodificador de máscaras. El soporte en vLLM, TGI, llama.cpp u Ollama no está confirmado en la información disponible; el decodificador denso en PyTorch y el token `<OBJ>` fuera del vocabulario estándar complican un despliegue puramente GGUF.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Enfoque |
|---|---|---|---|---|
| WeVisOne-VL-4B | 4,83 B (+9,6 M de decodificador) | no disponible | Apache 2.0 | Percepcion unificada objeto + pixel (deteccion, pointing, OCR, segmentacion, matting) |
| Qwen3-VL-4B | no disponible en la informacion proporcionada (es la base sobre la que se construye) | no disponible | no disponible | Vision-lenguaje generalista |
| Qwen2.5-VL-3B | no disponible | no disponible | no disponible | Vision-lenguaje generalista con grounding basico |
| Florence-2 (large) | no disponible | no disponible | no disponible | Vision generalista con tareas de deteccion y segmentacion |

La comparación cuantitativa no es posible con los datos disponibles: no hay benchmarks publicados de WeVisOne-VL-4B ni se han verificado las especificaciones de los modelos alternativos dentro de esta búsqueda. Cualitativamente, la diferencia principal frente a un VLM generalista es la salida densa (alfa continuo a stride 1) y el conjunto de tareas de percepción estructurada bajo una sola licencia Apache 2.0.

## Limitaciones y advertencias

- Los bordes finos de las máscaras alfa son sensibles a la resolución de la imagen, a la oclusión severa, a las transparencias complejas y a la formulación del prompt.
- El modelo genera salidas estructuradas sin cadena de razonamiento explícita (CoT), lo que limita la precisión en consultas ambiguas o que requieran composición de varios pasos.
- Diseñado para percepción de imagen de un solo turno: el decodificador de píxeles rechaza rejillas de vídeo, por lo que no hay soporte de vídeo en las tareas densas.
- Uso previsto exclusivamente de investigación en grounding visual, segmentación y matting; el autor declara explícitamente que no debe emplearse para decisiones autónomas de alto impacto ni para identificar personas.
- Riesgo de alucinación en la vertiente generativa de texto; el mecanismo de devolver `None` mitiga, pero no elimina, las detecciones falsas en consultas ambiguas.
- Idiomas soportados no documentados: no se puede asumir un rendimiento multilingüe equivalente al de la base Qwen3-VL.
- Licencia Apache 2.0 para el código propio de Tencent; los componentes de terceros conservan sus licencias originales y deben revisarse antes de un uso comercial.
- No se documentan sesgos demográficos ni sociales; al ser un modelo de percepción, los sesgos del dataset de la base Qwen3-VL pueden trasladarse a las detecciones y segmentaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/tencent/WeVisOne-VL-4B
- Repositorio de inferencia (paquete `wevisone_vl`): https://github.com/Tencent/WeVisOne-VL
- Sitio corporativo de Tencent: https://www.tencent.com/
- Información corporativa de Tencent: https://www.tencent.com/en-us/about.html
- Tencent en Wikipedia: https://en.wikipedia.org/wiki/Tencent
