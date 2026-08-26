# Urdatorn/sphragis-alm-olmo3-7b-josephus

## Resumen

El modelo `Urdatorn/sphragis-alm-olmo3-7b-josephus` es un modelo de lenguaje autorizado (ALM, por sus siglas en inglés) desarrollado para la atribución de autoría en griego antiguo. Forma parte del benchmark Sphragis, un conjunto de diecisiete modelos entrenados sobre los textos de un autor clásico cada uno, siguiendo la metodología de Huang, Murakami y Grieve (2025) que atribuye un texto al autor cuyo modelo lo encuentra menos sorprendente. Este modelo concreto se ha entrenado exclusivamente sobre el corpus de Flavio Josefo, compuesto por 800 frases y 128.587 tokens puntuados.

La arquitectura parte del modelo base `allenai/Olmo-3-1025-7B`, un transformer decoder-only de 7.298 millones de parámetros, y se ha sometido a un proceso de preentrenamiento adicional (further pretraining) sobre el corpus de un solo autor. La relevancia actual reside en su utilidad para la filología clásica y la estilometría, permitiendo a investigadores autenticar o atribuir textos griegos antiguos de forma automática y reproducible. El modelo se publica con una licencia restrictiva (`other`) por las licencias mixtas del corpus de origen, lo que limita su uso comercial.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (basado en OLMo 3) |
| Parámetros totales | 7.298.011.136 |
| Parámetros activos | no aplicable (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos en bf16) |
| Idiomas soportados | grc (griego antiguo) |
| Licencia | other |
| Formato de pesos | safetensors (bf16) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `allenai/Olmo-3-1025-7B` (revisión `a81bae42db3975be1671e27b9c9a56da1a9f980f`), que pertenece a la familia OLMo 3 de AI2. La arquitectura es un transformer causal estándar, con atención completa y sin mezcla de expertos. El entrenamiento adicional se realizó con un objetivo de modelado causal sobre secuencias de una sola frase, con el formato `<|endoftext|> frase <|endoftext|>`. Se usó un lote efectivo de 16 frases, una tasa de aprendizaje constante de 1e-5 tras 25 pasos de calentamiento, y precisión fp32 para pesos maestros con cómputo en bf16 mediante FSDP sobre 2 GPU GH200.

La selección del mejor modelo se hizo mediante la pérdida de validación sobre el conjunto de validación de Sphragis, con *early stopping* (paciencia 3) sobre un máximo de 20 épocas; el mejor modelo se obtuvo en la época 2.0 con una pérdida de validación de 1.1074 nats/token. Este proceso difiere del entrenamiento fijo de 100 épocas del método original de Huang et al., y todos los modelos de la familia se detuvieron en épocas 2 o 3. El texto de entrenamiento proviene del dataset `Urdatorn/sphragis`, que incluye licencias mixtas (incluyendo CC BY-NC-SA), por lo que el modelo derivado se publica con licencia `other`.

## Capacidades

- Generación de texto en griego antiguo, aunque su propósito principal no es la generación sino la evaluación de perplejidad.
- Atribución de autoría: calcula la perplejidad por token de una frase y la compara con los otros dieciséis modelos del conjunto Sphragm para decidir el autor más probable.
- Modelo autorizado: está especializado exclusivamente en el estilo de Flavio de Josefo; no es un modelo generalista.
- Sin soporte de tool calling, función de llamada, agente o razonamiento multi-paso.
- Capacidades multilingües: únicamente griego antiguo, sin otras lenguas.

## Casos de uso

- Atribución de autoría en textos griegos antiguos: dado un fragmento de texto, se puede calcular la perplejidad con este modelo y comparar con los otros dieciséis modelos del conjunto Sphragis para determinar si el autor es Josefo.
- Autenticación de obras: verificar si un texto anónimo o dudoso pertenece al corpus de Josefo, usando la puntuación de perplejidad como métrica de similitud estilística.
- Investigación filológica: análisis estilométrico de variantes textuales o fragmentos conservados, donde la atribución a un autor concreto es esencial.
- Estudio de la evolución del estilo de Josefo: se puede usar el modelo para medir la coherencia estilística a lo largo de sus obras (p.ej., *Guerra judía*, *Antigüedades judías*).
- Comparación de métodos de atribución de autoría: el modelo sirve como referencia en benchmarks académicos para validar técnicas de atribución automática en lenguas antiguas.
- Generación de texto estilísticamente similar a Josefo (para pruebas controladas en investigación, no para producción comercial).

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks individuales para este modelo en la información disponible. El conjunto completo de los diecisiete modelos de Sphragis alcanza una macro-F1 de 0,812 en la validación de la partición `sentence_1`, según la model card. No hay datos de rendimiento en MMLU, HumanEval u otros benchmarks generales.

## Requisitos de hardware

- Inferencia en bf16: requiere aproximadamente 14,6 GB de VRAM (el tamaño del repo incluye los pesos), por lo que se puede ejecutar en una GPU con 16 GB o más, como una RTX 4090, A100 o H100.
- Para un uso de puntuación de frases individuales, la latencia es baja; no se requiere hardware específico de servidor.
- Opciones de despliegue: el modelo está en formato safetensors, compatible con bibliotecas de transformadores (HuggingFace Transformers). No se ha publicado una versión GGUF ni cuantizaciones alternativas.
- No hay datos de throughput o latencia específicos en la información disponible.

## Comparativa con modelos similares

No se dispone de información sobre otros modelos de atribución de autoría en griego antiguo que sean directamente comparables. El modelo base `Olmo-3-1025-7B` es un modelo generalista, no especializado en atribución, por lo que no sirve como comparación de rendimiento en la tarea. Se puede mencionar que el conjunto Sphragis incluye otros dieciséis modelos análogos, pero no se proporcionan sus métricas individuales.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre el estilo de Josefeas; no es útil para otros autores ni para textos de otras épocas o dialectos del griego.
- El corpus de entrenamiento es pequeño (800 frases) y puede no representar la variabilidad completa del estilo de Josefeas, lo que puede generar sobreajuste.
- La licencia `other` restringe el uso comercial debido a las licencias CC BY-NC-SA del texto de origen; se debe consultar el `LICENSES.md` del dataset Sphragis antes de cualquier reutilización.
- Riesgo de alucinación en generación de texto si se usa de forma impropia, aunque su uso previsto es solo de evaluación de perplejidad.
- No se han evaluado sesgos o riesgos de seguridad; el modelo está pensado para investigación filológica, no para aplicaciones de usuario final.

## Enlaces

- [Modelo en HuggingFace](https://huggingface.co/Urdatorn/sphragis-alm-olmo3-7b-josephus)
- [Dataset Sphragis](https://huggingface.co/datasets/Urdatorn/sphragis)
- [Código de entrenamiento y puntuación](https://github.com/Urdatorn/sphragis_models)
- [Paper de Huang, Murakami y Grieve (2025)](https://doi.org/10.1371/journal.pone.0327081)
- [Paper de OLMo 3 (arXiv)](https://arxiv.org/abs/2512.13961)
- [Repositorio OLMo en GitHub](https://github.com/allenai/OLMo)
