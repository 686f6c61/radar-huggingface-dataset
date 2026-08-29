# thesimonharms/svtr-javanese-synthetic-v11

## Resumen

El modelo `thesimonharms/svtr-javanese-synthetic-v11` es un reconocedor óptico de caracteres (OCR) especializado en la transcripción de texto impreso en escritura javanesa (Aksara Javanés, también conocida como Hanacaraka). Desarrollado por Simon Harms, este modelo se basa en la arquitectura SVTRv2 (RepSVTR) con una cabeza de decodificación CTC, y está diseñado para procesar líneas de texto recortadas de altura 48 píxeles y ancho máximo de 1600 píxeles. Es una continuación del fine-tuning del modelo v7, ampliando la cobertura a dos dominios sintéticos distintos: el conjunto original de líneas largas v2 y un nuevo renderizado nativo a altura 48 con 11 familias tipográficas Unicode.

La relevancia de este modelo radica en su contribución a la preservación digital del javanés, un idioma con una rica tradición escrita que utiliza un sistema de escritura propio. Al estar entrenado exclusivamente con datos sintéticos impresos, ofrece una solución para la digitalización de documentos impresos en Aksara, aunque con limitaciones claras para manuscritos o páginas completas. Su licencia MIT permite un uso libre, incluido el comercial, lo que facilita su integración en proyectos de investigación y aplicaciones prácticas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SVTRv2 (RepSVTR, variante móvil) con cabeza CTC |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | No aplica (entrada de imagen: altura 48, ancho hasta 1600 píxeles) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Javanés (escritura Aksara, bloque Unicode U+A980–U+A9DF) |
| Licencia | MIT |
| Formato de pesos | no disponible (repo sin pesos subidos, solo código de inferencia) |

## Arquitectura y entrenamiento

El modelo emplea la arquitectura SVTRv2, concretamente la variante RepSVTR (RepViT / mobile SVTRv2), que es un encoder basado en transformer optimizado para reconocimiento de texto en imágenes. La cabeza de decodificación es CTC (Connectionist Temporal Classification), que produce una secuencia de caracteres sin necesidad de alineación explícita. El alfabeto cubre el bloque javanés U+A980–U+A9DF más un token blank, totalizando aproximadamente 97 clases.

El entrenamiento se realizó mediante fine-tuning continuado desde el checkpoint v7, con 8 épocas a una tasa de aprendizaje de 1e-5. Los datos de entrenamiento provienen del dataset privado `thesimonharms/javanese-synthetic-long` v2, que contiene 80 000 muestras de líneas largas, más un renderizado adicional de 80 000 muestras a altura nativa 48 con 11 familias tipográficas Unicode. La mezcla de longitudes fue 20% cortas (≤12 caracteres), 20% medias (13–24), 25% largas (25–40) y 35% extralargas (41–80). Los pesos publicados corresponden a la época 7, que obtuvo el mejor CER en la validación mixta.

## Capacidades

- Reconocimiento de líneas de texto impreso en Aksara Javanés, con entrada de imagen en RGB de altura 48 y ancho variable hasta 1600 píxeles.
- Decodificación CTC greedy (colapso de repeticiones y eliminación de blank) sin necesidad de modelo de lenguaje externo.
- Soporte para líneas de 2 a 80 caracteres, con especial atención a líneas cortas y medias (≤40 caracteres) que son las típicas en escritura real.
- Capacidad de procesar dos dominios sintéticos distintos: el conjunto v2 (renderizado original) y el nuevo renderizado h48 con 11 fuentes.
- No incluye capacidades de tool calling, agentes, razonamiento multi-paso ni procesamiento de lenguaje natural general; es un modelo OCR puro.

## Casos de uso

- Digitalización de documentos impresos en javanés: el modelo puede transcribir automáticamente líneas de texto extraídas de libros, periódicos o folletos impresos en Aksara, acelerando la conversión a texto digital.
- Investigación lingüística y filológica: los investigadores pueden usar el modelo para procesar corpus impresos en javanés, facilitando análisis de frecuencia, morfología o sintaxis sin transcripción manual.
- Preservación del patrimonio cultural: instituciones que digitalizan colecciones impresas en javanés pueden integrar este modelo en sus flujos de trabajo, siempre con supervisión humana para verificar la calidad.
- Generación de subtítulos o anotaciones para imágenes: al ser un modelo OCR, puede combinarse con detectores de líneas para anotar automáticamente imágenes de documentos javaneses.
- Entrenamiento de modelos de lenguaje javanés: las transcripciones generadas pueden servir como datos de entrenamiento para modelos de procesamiento de lenguaje natural en javanés, un idioma con pocos recursos digitales.
- Evaluación comparativa de sistemas OCR para escrituras no latinas: el modelo sirve como referencia para probar mejoras en el reconocimiento de Aksara, dado su enfoque en texto impreso sintético.

## Benchmarks y rendimiento

Los resultados se presentan por separado para los dos dominios de validación, ya que utilizan fuentes y renderizados diferentes. Se evaluaron 1500 líneas retenidas en cada dominio, con decodificación CTC greedy.

### Dominio v2 (validación del conjunto original)

| Bucket | n | Exact | CER | Near (edit ≤2) |
|---|---:|---:|---:|---:|
| Short (≤12) | 225 | 93.33% | 1.16% | 99.56% |
| Mid (13–24) | 300 | 93.33% | 0.53% | 99.67% |
| Long (25–40) | 450 | 93.33% | 0.28% | 99.78% |
| XLong (41–80) | 525 | 80.57% | 0.52% | 97.33% |
| **All** | **1500** | **88.87%** | **0.55%** | **98.87%** |

### Dominio h48 (renderizado nativo con 11 fuentes)

| Bucket | n | Exact | CER | Near (edit ≤2) |
|---|---:|---:|---:|---:|
| Short (≤12) | 300 | 93.33% | 1.21% | 99.67% |
| Mid (13–24) | 300 | 88.67% | 1.05% | 98.33% |
| Long (25–40) | 375 | 82.67% | 1.11% | 95.47% |
| XLong (41–80) | 525 | 69.71% | 1.64% | 89.90% |
| **All** | **1500** | **81.47%** | **1.30%** | **94.93%** |

El modelo v7 recook obtiene un 0% de exactitud en el dominio h48, mientras que v11 es el primer checkpoint público que lee ambos dominios. En el dominio v2, v11 supera ligeramente a v7 (88.87% vs 88.27% de exactitud global).

## Requisitos de hardware

No se proporcionan requisitos específicos de hardware en la documentación del modelo. Al tratarse de un modelo SVTRv2 en su variante móvil, es previsible que pueda ejecutarse en GPUs de consumo con poca VRAM (por ejemplo, 4-8 GB), pero no hay datos confirmados. El repositorio no incluye pesos, solo código de inferencia, por lo que el usuario debe entrenar o descargar los pesos desde otra fuente. Se recomienda probar en CPU para inferencia de baja latencia, aunque el rendimiento dependerá del tamaño de las imágenes. No se dispone de información sobre latencia o throughput.

## Comparativa con modelos similares

No se dispone de información pública sobre otros modelos OCR específicos para Aksara Javanés. Dentro de la misma familia del autor, se pueden comparar las versiones:

| Modelo | Entrada | Longitud máxima | Dominio | Exactitud (v2) | Exactitud (h48) |
|---|---|---|---|---|---|
| v11 (este) | Línea altura 48, ancho ≤1600 | 80 aksara | v2 + h48 | 88.87% | 81.47% |
| v7 | Línea altura 48, ancho ≤1600 | 80 aksara | v2 | 88.27% | 0% |
| v6 (TrOCR) | Cuadrado 384×384 | 12 aksara | Corto | no disponible | no disponible |

v11 es el único que cubre ambos dominios sintéticos, mientras que v6 está especializado en líneas cortas con entrada cuadrada.

## Limitaciones y advertencias

- Entrenado exclusivamente con datos sintéticos impresos; no funciona bien con manuscritos, palmera, manchas o fondos degradados.
- Ancho máximo de imagen de 1600 píxeles, lo que limita líneas de más de ~80 caracteres.
- El bucket XLong (41–80 caracteres) es el más débil en exactitud, especialmente con fuentes nuevas.
- Errores de CTC en glifos repetidos o apretados; el pangkon/pasangan (signos diacríticos) puede causar fallos de coincidencia exacta.
- No incluye detector de páginas; requiere una línea recortada por imagen.
- No se recomienda para digitalización de archivos en producción sin supervisión humana.
- La decodificación con beam search o modelo de lenguaje empeora los resultados; solo se debe usar greedy CTC.
- El repositorio no contiene pesos preentrenados descargables directamente; el usuario debe reconstruirlos o contactar al autor.

## Enlaces

- [Modelo en Hugging Face](https://huggingface.co/thesimonharms/svtr-javanese-synthetic-v11)
- [Modelo v7 (predecesor)](https://huggingface.co/thesimonharms/svtr-javanese-synthetic-v7)
- [Modelo v6 (TrOCR para líneas cortas)](https://huggingface.co/thesimonharms/trocr-javanese-synthetic-v6)
- [Dataset sintético javanés](https://huggingface.co/datasets/thesimonharms/javanese-synthetic-long)
- [Perfil del autor en Hugging Face](https://huggingface.co/thesimonharms)
- [Perfil del autor en GitHub](https://github.com/thesimonharms/)
- [Paper de SVTRv2 (Du et al., ICCV 2025)](https://arxiv.org/abs/2501.08224)
