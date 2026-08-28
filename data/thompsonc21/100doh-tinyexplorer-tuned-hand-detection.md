# ThompsonC21/100DOH-TinyExplorer-Tuned-hand-detection

## Resumen

El modelo `ThompsonC21/100DOH-TinyExplorer-Tuned-hand-detection` es un ajuste fino orientado a la detección de manos, presumiblemente entrenado sobre el dataset 100DOH de la Universidad de Michigan. Este dataset se centra en inferir el estado de las manos (posición, orientación, contacto, izquierda/derecha) a partir de imágenes y vídeos, con el objetivo de facilitar sistemas que aprendan de grandes volúmenes de datos visuales. El nombre sugiere que parte de una arquitectura base denominada "Tiny Explorer", aunque no se ha podido confirmar su naturaleza exacta.

El modelo está alojado en HuggingFace con acceso restringido (gated), lo que implica que los usuarios deben aceptar condiciones adicionales antes de poder descargarlo. No se dispone de información pública sobre su arquitectura, tamaño, licencia o rendimiento, y el repositorio no incluye documentación técnica ni resultados de evaluación. A pesar de su escasa difusión (cero descargas y una única valoración), su especialización en detección de manos podría resultar relevante para aplicaciones de interacción persona-ordenador, realidad aumentada o análisis de vídeo, aunque su utilidad práctica queda limitada por la falta de datos verificables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si es MoE) |
| Longitud de contexto | no disponible (modelo de visión, no textual) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible |

## Arquitectura y entrenamiento

No se ha publicado información sobre la arquitectura interna del modelo. Dado que el nombre incluye "hand-detection" y referencia el dataset 100DOH, es razonable suponer que se trata de un modelo de detección de objetos o de estimación de puntos clave, posiblemente basado en una red neuronal convolucional (CNN) o en un detector moderno tipo YOLO, pero no hay confirmación oficial. Tampoco se conocen los datos de entrenamiento más allá de la posible utilización del dataset 100DOH, que contiene anotaciones de manos en vídeos de Internet, incluyendo información sobre si la mano está en contacto con un objeto, su lateralidad (izquierda/derecha) y su posición. No se dispone de detalles sobre el proceso de ajuste fino, el número de épocas, la función de pérdida o si se emplearon técnicas de aumento de datos.

## Capacidades

- Detección de manos en imágenes o vídeos, presumiblemente basada en el dataset 100DOH.
- Posible estimación del estado de la mano: contacto con objetos, orientación y lateralidad (izquierda/derecha), según las anotaciones del dataset.
- No se ha confirmado ninguna capacidad adicional como generación de texto, razonamiento o tool calling, al tratarse de un modelo visual especializado.
- No se dispone de información sobre capacidades multilingües ni sobre soporte de agentes.

## Casos de uso

- Interacción persona-ordenador: el modelo podría integrarse en sistemas de control por gestos, permitiendo a los usuarios manipular interfaces mediante movimientos de mano, aunque se requiere validación previa de su precisión.
- Realidad aumentada y virtual: detección de manos para superponer objetos virtuales sobre las manos del usuario en tiempo real, siempre que el modelo ofrezca latencias adecuadas.
- Análisis de vídeo para investigación: etiquetado automático de manos en secuencias de vídeo, útil para estudios de comportamiento humano o análisis de actividad física.
- Robótica asistencial: guiar a un robot para que interactúe con objetos manipulados por humanos, basándose en la detección de contacto y posición de la mano.
- Accesibilidad: permitir a personas con movilidad reducida controlar dispositivos mediante gestos manuales, si el modelo funciona correctamente en entornos variados.
- Vigilancia y seguridad: detección de manos en cámaras de seguridad para identificar interacciones sospechosas o comportamientos anómalos, aunque las limitaciones de sesgo y precisión deben evaluarse.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. No se dispone de métricas como precisión, recall, mAP o comparaciones con otros modelos de detección de manos.

## Requisitos de hardware

- No se dispone de información sobre requisitos de hardware específicos para este modelo.
- Al ser un modelo de detección de manos, es probable que pueda ejecutarse en GPUs de consumo medio (por ejemplo, NVIDIA GTX 1660 o RTX 3060) si su tamaño es reducido, pero no hay datos que lo confirmen.
- No se conocen opciones de despliegue recomendadas (vLLM, llama.cpp, etc.) al no tratarse de un modelo de lenguaje.
- No se dispone de estimaciones de latencia o throughput.

## Comparativa con modelos similares

No se dispone de información suficiente para establecer una comparativa rigurosa. Existen alternativas conocidas en el ámbito de detección de manos, como MediaPipe Hands de Google, que ofrece detección de 21 puntos clave en tiempo real, o modelos basados en el dataset 100DOH publicados por el grupo de la Universidad de Michigan. Sin embargo, al carecer de datos sobre el rendimiento de este modelo, no es posible comparar parámetros, contexto, precisión o licencia de manera objetiva.

## Limitaciones y advertencias

- El acceso al modelo está restringido (gated), lo que puede dificultar su uso directo y su evaluación independiente.
- No se ha publicado información sobre sesgos, pero los modelos entrenados con datos de Internet pueden presentar sesgos de género, etnia o contexto (por ejemplo, peor rendimiento en manos de personas con tonos de piel oscuros o en entornos poco representados).
- Riesgo de alucinación o falsos positivos: el propio dataset 100DOH advierte de falsos positivos ocasionales cuando no hay personas presentes, y de dificultades para interpretar escenas con muchas manos.
- No se conoce la licencia, por lo que su uso comercial podría estar sujeto a restricciones no especificadas.
- La falta de documentación técnica y de benchmarks hace que su fiabilidad en producción sea incierta.
- No se ha confirmado si el modelo maneja vídeo en tiempo real o solo imágenes estáticas.

## Enlaces

- [HuggingFace - ThompsonC21/100DOH-TinyExplorer-Tuned-hand-detection](https://huggingface.co/ThompsonC21/100DOH-TinyExplorer-Tuned-hand-detection)
- [Página del dataset 100DOH - Universidad de Michigan](https://fouheylab.eecs.umich.edu/~dandans/projects/100DOH/)
- [Descarga del dataset 100DOH](https://fouheylab.eecs.umich.edu/~dandans/projects/100DOH/download.html)
