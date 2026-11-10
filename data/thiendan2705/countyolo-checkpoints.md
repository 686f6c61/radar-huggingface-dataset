# ThienDan2705/countyolo-checkpoints

## Resumen

CountYOLO density heads es un conjunto de tres checkpoints de cabezas de densidad (density heads) entrenados específicamente para tareas de conteo de objetos. El repositorio, publicado por el usuario ThienDan2705, no contiene un modelo autónomo sino los pesos parciales de una arquitectura de conteo que debe combinarse con el código de inferencia disponible en el repositorio GitHub del proyecto (rama `sam3`). Los tres checkpoints reciben los nombres de `exnoise`, `seed3` y `exmix2`, y según la model card se corresponden con configuraciones distintas: `exnoise` es el recomendado para imágenes según las evaluaciones existentes sobre FSC147, `seed3` es el seleccionado para el piloto de vídeo y `exmix2` es un checkpoint de comparación.

La relevancia de esta publicación es acotada: se trata de un artefacto de investigación intermedio, no de un modelo listo para producción. El repositorio tiene un tamaño de 0.0 GB, cero descargas y cero likes en el momento de la consulta, y no declara licencia, idiomas ni pipeline. El autor advierte explícitamente de que estos ficheros no son modelos YOLO-World, DINOv2, SAM2 ni SAM3 independientes, sino cabezas de densidad que dependen del código del proyecto para funcionar.

La información disponible no permite determinar la arquitectura completa, el número de parámetros, la longitud de contexto ni los datos de entrenamiento más allá de las referencias a FSC147 y a un piloto de vídeo. Cualquier dato no presente en la model card se indica como no disponible en esta ficha.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Cabeza de densidad (density head) sobre arquitectura CountYOLO; requiere código de inferencia externo (rama `sam3` del repositorio GitHub) |
| Parámetros totales | no disponible |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (modelo de visión para conteo, no de texto) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (tarea de visión, sin procesamiento de lenguaje) |
| Licencia | no disponible |
| Formato de pesos | no disponible (la model card menciona `checksums.json` con tamaños y SHA-256, pero no el formato) |

## Arquitectura y entrenamiento

La model card describe los ficheros como "density head checkpoints", es decir, cabezas de densidad entrenadas por el proyecto CountYOLO. No se especifica la arquitectura base sobre la que operan, aunque el nombre del proyecto y la advertencia de que no son modelos YOLO-World, DINOv2, SAM2 ni SAM3 sugieren que el pipeline combina componentes de detección y segmentación con una cabeza de densidad propia. El código de referencia se encuentra en la rama `sam3` del repositorio `https://github.com/Thien-Dan/countyolo`.

Respecto al entrenamiento, la única información disponible es la referencia a evaluaciones sobre FSC147 (un benchmark estándar de conteo de objetos en imágenes) y a un "video pilot" para el que se seleccionó `seed3`. No se detallan el número de tokens, la composición del dataset, el uso de RLHF/DPO ni innovaciones técnicas concretas. La model card insiste en que las evaluaciones de imagen y vídeo usan configuraciones distintas y no deben tratarse como rankings intercambiables, lo que implica que los checkpoints están especializados por dominio y no son directamente comparables entre sí.

## Capacidades

- Conteo de objetos en imágenes mediante cabezas de densidad (checkpoint `exnoise`, recomendado para imagen según FSC147).
- Conteo de objetos en vídeo (checkpoint `seed3`, seleccionado para el piloto de vídeo existente).
- Checkpoint alternativo de comparación (`exmix2`) para experimentación.
- Requiere el código de inferencia del repositorio GitHub para funcionar; no es un modelo autónomo.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, tool calling, agentes, multilingüismo, visión general, audio ni modo thinking.

## Casos de uso

- Conteo de objetos en imágenes estáticas: usar el checkpoint `exnoise` junto con el código de la rama `sam3` para estimar densidades y recuentos en datasets de imágenes, aprovechando que es el checkpoint recomendado según las evaluaciones sobre FSC147.
- Análisis de aforos en vídeo: emplear `seed3` con la configuración del piloto de vídeo del proyecto para contar objetos en secuencias, siempre que se replique la configuración original, ya que el autor advierte que las configuraciones de imagen y vídeo no son intercambiables.
- Investigación en conteo de multitudes: integrar la cabeza de densidad en un pipeline de estimación de densidad para experimentos académicos sobre FSC147 u otros datasets de conteo.
- Comparación de variantes de entrenamiento: usar `exmix2` como referencia de comparación frente a `exnoise` y `seed3` en experimentos controlados de ablation.
- Reproducción de resultados: validar los checkpoints con los checksums SHA-256 de `checksums.json` y el código del repositorio para reproducir las evaluaciones publicadas por el autor.
- Desarrollo de sistemas de monitorización con conteo: en escenarios como conteo de vehículos o personas en imágenes fijas, previa validación de la precisión con datos propios, dado que no hay benchmarks publicados en la información disponible.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card solo menciona que `exnoise` se basa en "existing FSC147 evaluations" y que `seed3` fue seleccionado para un piloto de vídeo, sin cifras concretas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible (no se especifica el tamaño de los checkpoints ni la arquitectura completa).
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no disponible; el único método documentado es el código de inferencia del repositorio GitHub (rama `sam3`).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (cabezas de densidad para conteo de objetos) con parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa.

## Limitaciones y advertencias

- Los ficheros no son modelos autónomos: no funcionan sin el código de inferencia del repositorio GitHub (rama `sam3`).
- No se declara licencia, lo que impide determinar si el uso comercial está permitido.
- No se especifican sesgos conocidos ni riesgos de alucinación, aunque al ser un modelo de visión para conteo, los errores se manifestarían como recuentos inexactos o mapas de densidad mal calibrados.
- Las configuraciones de imagen y vídeo no son intercambiables; el autor advierte explícitamente contra tratar sus evaluaciones como rankings comparables.
- No hay benchmarks publicados en la información disponible, por lo que no se puede validar el rendimiento de forma independiente.
- El repositorio tiene cero descargas y cero likes, y fue creado y actualizado el mismo día (2026-11-10), lo que sugiere que es un artefacto reciente y sin validación comunitaria.
- No se documentan limitaciones de contexto ni de idioma porque el modelo no procesa texto.

## Enlaces

- Hugging Face: https://huggingface.co/ThienDan2705/countyolo-checkpoints
- Repositorio GitHub del proyecto (rama `sam3`): https://github.com/Thien-Dan/countyolo
- Fichero de checksums (referenciado en la model card): `checksums.json` dentro del repositorio de Hugging Face.
