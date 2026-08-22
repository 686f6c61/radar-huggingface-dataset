# ThirdTimesTheCiarc/base_wan21

## Resumen

El modelo `ThirdTimesTheCiarc/base_wan21` es un repositorio alojado en HuggingFace con acceso restringido (gated) que, por su nombre y las referencias encontradas en la web, parece estar relacionado con la familia de modelos Wan2.1 de generación de vídeo de código abierto desarrollada por el equipo Wan-Video. El repositorio tiene un tamaño de 34,3 GB, lo que sugiere un modelo de pesos completos en formato safetensors, posiblemente en el rango de 14B parámetros, similar al Wan2.1-VACE-14B mencionado en fuentes externas.

La información pública disponible en la ficha de HuggingFace es extremadamente limitada: no se especifica la arquitectura, el número de parámetros, la licencia, los idiomas soportados ni el pipeline. El modelo está marcado con la etiqueta `not-for-all-audiences`, lo que indica que puede contener contenido no apto para todos los públicos, y requiere aceptar condiciones adicionales en HuggingFace para poder acceder a los archivos. A fecha de creación (enero de 2026) no registra descargas públicas, lo que sugiere que se trata de un modelo en fase temprana o de uso restringido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible (el tamaño del repo de 34,3 GB sugiere pesos en formato safetensors, posiblemente en el rango de 14B parametros, pero no confirmado) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | safetensors (según el tag del repositorio) |

## Arquitectura y entrenamiento

No se dispone de información pública sobre la arquitectura interna del modelo, los datos de entrenamiento, el número de tokens procesados o las técnicas de alineación utilizadas (RLHF, DPO, etc.). Dado el nombre `base_wan21` y las referencias en la web a Wan2.1, es plausible que el modelo esté basado en la arquitectura de difusión de vídeo de Wan2.1, que combina un transformador de video con técnicas de difusión latente para generar secuencias de vídeo de alta calidad. Sin embargo, esta inferencia no está confirmada por la información proporcionada en el repositorio, y no se puede afirmar con certeza si se trata de un modelo de difusión puro, un VAE o un componente auxiliar del pipeline de Wan2.1.

## Capacidades

No se han publicado capacidades específicas del modelo en la información disponible. Dado el contexto de Wan2.1 y el tamaño del repositorio, es razonable esperar que el modelo esté orientado a la generación de vídeo, pero no se puede confirmar ninguna capacidad concreta. Las siguientes capacidades son inferencias basadas en la familia Wan2.1, no en el propio repositorio:

- Generación de vídeo texto-a-vídeo y imagen-a-vídeo (si sigue la línea de Wan2.1)
- Edición de vídeo y composición de escenas (potencialmente, dada la arquitectura de Wan2.1)
- Posible soporte de control mediante condiciones externas (VACE, en la variante VACE-14B)
- Capacidades multilingües no confirmadas

## Casos de uso

No se pueden enumerar casos de uso concretos sin información verificada del modelo. Sin embargo, si el modelo sigue la línea de Wan2.1, los casos de uso podrían incluir:

- Generación de vídeo creativo para producción audiovisual: el modelo podría generar secuencias de vídeo de alta calidad a partir de prompts textuales, útil para creadores de contenido, estudios de animación o diseñadores.
- Edición de vídeo semiautomática: con capacidades de imagen-a-vídeo, podría usarse para extender o modificar clips existentes.
- Prototipado rápido de escenas para cine y juegos: permitiría a directores y desarrolladores visualizar escenas sin necesidad de rodaje previo.
- Generación de contenido educativo y de formación: creación de vídeos explicativos o simulaciones a partir de guiones.
- Investigación en modelos de generación de vídeo: como base para experimentos académicos en generación condicionada o edición de vídeo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El repositorio no incluye datos de rendimiento en MMLU, HumanEval, GSM8K ni otros benchmarks estándar, ya que el modelo parece estar orientado a generación de vídeo, donde los benchmarks habituales son métricas como FVD, IS o CLIP score, que tampoco se han publicado.

## Requisitos de hardware

No se dispone de información sobre los requisitos de hardware específicos del modelo. Sin embargo, dado que el repositorio ocupa 34,3 GB en formato safetensors, se pueden hacer estimaciones razonables:

- VRAM estimada para inferencia: si el modelo tiene alrededor de 14B parámetros (como Wan2.1-VACE-14B), la inferencia en FP16 requeriría aproximadamente 28 GB de VRAM, y con cuantización INT8 podría reducirse a unos 14-16 GB. Sin embargo, esto es especulativo y no confirmado.
- GPU recomendadas: para un modelo de este tamaño, se necesitarían GPUs de alta gama como NVIDIA A100 (40 GB), H100 (80 GB) o RTX 4090 (24 GB) con cuantización. No se confirma que quepa en GPUs de consumo sin cuantización.
- Opciones de despliegue: no disponibles, ya que no se ha publicado el pipeline ni integraciones con vLLM, llama.cpp u otros frameworks.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se puede realizar una comparativa completa por falta de datos. Sin embargo, el modelo parece pertenecer a la misma categoría que Wan2.1, que incluye modelos como:

| Modelo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Wan2.1 (base) | 14B (aprox.) | no disponible | Apache 2.0 (según GitHub) | Abierto |
| Wan2.1-VACE-14B | 14B | no disponible | Apache 2.0 (según) | Abierto |
| ThirdWaymoCiarc/base_wan21 | no disponible | no disponible | no disponible | Restringido (gated) |

La comparativa es incompleta porque no se tienen especificaciones confirmadas del modelo en cuestión. La única diferencia clara es que el repositorio de `base_wan21` tiene acceso restringido, mientras que Wan2.1 es de código abierto con licencia Apache.

## Limitaciones y advertencias

- **Acceso restringido**: el modelo requiere aceptar condiciones adicionales en HuggingFace para poder descargar los archivos, lo que limita su uso inmediato y su evaluación por parte de la comunidad.
- **Contenido no apto para todos los públicos**: la etiqueta `not-for-all-audiences` sugiere que el modelo puede generar contenido sensible, lo que requiere precauciones legales y éticas en su uso.
- **Falta de documentación**: no se ha publicado una model card completa, por lo que se desconocen los sesgos, las limitaciones de contexto o idioma, y los riesgos de alucinación o generación de contenido no deseado.
- **Riesgo de alucinación en generación de vídeo**: si el modelo es de generación de vídeo, podría producir secuencias inconsistentes o no realistas, especialmente en escenarios de movimiento complejo o interacción entre objetos.
- **Restricciones de licencia**: al no estar especificada la licencia, no se puede garantizar el uso comercial o la redistribución. El uso en producción sin licencia clara es un riesgo legal.
- **Sin soporte de la comunidad**: con 0 descargas y 2 likes, el modelo no tiene una comunidad activa que reporte bugs o proporcione soporte.

## Enlaces

- Repositorio de HuggingFace: https://huggingface.co/ThirdTimesTheCiarc/base_wan21
- Repositorio oficial de Wan2.1 en GitHub: https://github.com/Wan-Video/Wan2.1
- Referencia a Wan2.1-VACE-14B en CivArchive: https://civarchive.com/models/1620800?modelVersionId=1834321
