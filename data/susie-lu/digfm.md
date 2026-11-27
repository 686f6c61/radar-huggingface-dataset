# Susie-Lu/DiGFM

## Resumen

DiGFM (Direct Graph Flow Matching) es un modelo de generación de grafos presentado por Susie Lu en el artículo "Efficient Graph Generation via Direct Prediction and Flow Matching" (arXiv:2610.05397). El repositorio de Hugging Face, publicado por el mismo autor, contiene los checkpoints y los conjuntos de datos asociados al trabajo, con un tamaño total de aproximadamente 0,8 GB. No se trata de un modelo de lenguaje, sino de un modelo generativo para estructuras de grafo, por lo que sus parámetros y su contexto no son comparables a los de un transformer de texto.

La propuesta técnica combina predicción directa y flow matching para acelerar la generación de grafos, un ámbito en el que los métodos autorregresivos y los modelos de difusión suelen incurrir en un coste de muestreo elevado. El repositorio no incluye una model card descriptiva más allá de los enlaces al paper y al código, ni metadatos sobre licencia, idiomas o pipeline.

La información pública disponible es muy limitada: cero descargas, cero likes y ausencia de especificaciones detalladas en la model card. Esta ficha recoge únicamente lo que puede verificarse a partir de los metadatos del repositorio y del título del artículo, y marca explícitamente como "no disponible" todo aquello que no se ha publicado.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | generativa de grafos basada en flow matching y predicción directa (detalles no disponibles) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (no es un modelo de lenguaje) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (el repositorio incluye checkpoints, sin formato especificado) |

## Arquitectura y entrenamiento

El artículo propone un enfoque de generación de grafos que combina predicción directa con flow matching. El flow matching es una familia de métodos de modelado generativo continuo que aprende un campo vectorial que transporta una distribución simple (por ejemplo, ruido gaussiano) hacia la distribución de datos, y que en dominios continuos permite muestreo con menos pasos que la difusión clásica. La "predicción directa" hace referencia, por el título, a estimar directamente la estructura objetivo en lugar de encadenar un proceso iterativo largo.

No se dispone de información sobre el número de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni innovaciones adicionales como decodificación especulativa. El repositorio incluye los datasets empleados, pero su contenido no se detalla en la model card.

## Capacidades

- Generación de grafos: el modelo está diseñado para producir estructuras de grafo, presumiblemente de forma eficiente en número de pasos de muestreo.
- Muestreo acelerado: la combinación de flow matching con predicción directa apunta a reducir el coste de inferencia frente a métodos de difusión sobre grafos.
- No se ha documentado soporte de tool calling, agentes, razonamiento multi-paso, capacidades multilingües ni modalidades de visión o audio.
- No se ha documentado ningún modo especial (thinking mode, visión, audio).

## Casos de uso

- Generación de moléculas y compuestos químicos: la generación de grafos es la representación natural de moléculas; un modelo que muestrea grafos con pocos pasos resulta adecuado para explorar espacios químicos amplios en pipelines de descubrimiento de fármacos.
- Diseño de redes y topologías: permite proponer estructuras de red (por ejemplo, topologías de interconexión) sujetas a restricciones, aprovechando el muestreo eficiente para generar muchas candidatas.
- Generación de grafos de conocimiento sintéticos: útil para aumentar datasets de entrenamiento en tareas de razonamiento sobre grafos, donde la escasez de datos etiquetados es habitual.
- Modelado de interacciones sociales o de citas: la generación de grafos permite simular redes con propiedades estadísticas realistas para análisis o aumento de datos.
- Aumento de datos para aprendizaje sobre grafos: generar instancias sintéticas adicionales para entrenar clasificadores o modelos de predicción de enlaces en dominios con pocos ejemplos.
- Investigación en modelos generativos: sirve como referencia reproducible (checkpoints y datasets publicados) para comparar flow matching frente a difusión y modelos autorregresivos en generación de grafos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 0,8 GB, lo que sugiere que los checkpoints podrían caber en GPUs de consumo, pero no se confirma el tamaño de los pesos ni el pico de memoria en inferencia.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada; por el tamaño del repositorio es plausible, pero no se ha verificado.
- Opciones de despliegue: no documentadas; el autor remite al repositorio de GitHub para el uso detallado.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables ni datos de rendimiento que permitan establecer una comparación fiable con alternativas de generación de grafos.

## Limitaciones y advertencias

- La model card no documenta sesgos conocidos ni el dominio concreto sobre el que se entrenó el modelo.
- Riesgo de alucinación: no evaluado; en generación de grafos, el riesgo se traduce en estructuras sintácticamente válidas pero semánticamente irreales.
- No se especifican limitaciones de contexto ni de idioma porque no es un modelo de lenguaje.
- Licencia no disponible: no puede confirmarse el uso comercial; debe consultarse el repositorio de GitHub antes de cualquier despliegue en producción.
- El repositorio presenta cero descargas y cero likes, y la model card es mínima; se trata de un artefacto de investigación sin validación externa conocida.
- No hay información sobre estabilidad numérica, reproducibilidad del muestreo ni requisitos de versiones de librerías.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/Susie-Lu/DiGFM
- Artículo: https://arxiv.org/abs/2610.05397
- Código: https://github.com/Susie-Lu/DiGFM
