# unfold-labs/unfold-entities-gliner-multi

## Resumen

Unfold entities GLiNER multi es un modelo de reconocimiento de entidades nombradas (NER) de tipo zero-shot, publicado por unfold-labs y derivado de `urchade/gliner_multi-v2.1`. Su función es identificar nombres de personas, organizaciones, proyectos, productos, herramientas y lugares en notas de reuniones, y se distribuye en formato ONNX en precisión completa (fp32) para ejecutarse en local, sin conexión, dentro de la aplicación Unfold Note. La versión corresponde a `2026.10.29`, construida el 28 de octubre de 2026.

El modelo parte de la arquitectura mDeBERTa-v3-base (a través de GLiNER) y aplica una poda del vocabulario original de 250.105 piezas, reduciéndolo a las piezas observadas en corpus franceses e ingleses. Esta poda recorta las filas de embeddings y remapea los identificadores del tokenizador y el id interno `<<ENT>>`, de modo que las palabras conservadas se tokenizan exactamente igual que en el modelo original. El resultado es un artefacto más ligero (repositorio de 0,6 GB) manteniendo el comportamiento del modelo base.

Su relevancia práctica reside en que demuestra una estrategia de despliegue en dispositivo para NER multilingüe con licencia Apache-2.0, con un conjunto de comprobaciones (gates) publicadas que verifican la equivalencia entre el vocabulario podado y el completo, la fidelidad del procesador JavaScript frente a la implementación Python de GLiNER y la calidad sobre etiquetas anotadas manualmente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | mDeBERTa-v3-base (encoder transformer) sobre GLiNER; exportación ONNX |
| Parametros totales | no disponible (modelo base mDeBERTa-v3-base, sin cifra publicada en la información disponible) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | máximo 384 subtokens por entrada, incluido el prompt de etiquetas; spans de hasta 12 palabras |
| Tipos de cuantizacion | solo fp32 (la variante INT8 se evaluó pero no se distribuye) |
| Idiomas soportados | francés (fr) e inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (`model.onnx`, fp32) con manifiesto de integridad `entities-model.json` |

## Arquitectura y entrenamiento

El modelo es una conversión de formato y una poda de vocabulario del checkpoint `urchade/gliner_multi-v2.1`, que a su vez se construye sobre `microsoft/mdeberta-v3-base` (licencia MIT). GLiNER es un enfoque de NER zero-shot en el que las etiquetas de entidad se introducen como prompt en la entrada, de modo que el modelo puntúa spans candidatos para cada etiqueta sin necesidad de reentrenamiento por conjunto de etiquetas. La exportación ONNX de partida es `onnx-community/gliner_multi-v2.1` en el commit `6ddaeb9413b0e71ad8457da1aab378a165b24058`, fichero `onnx/model.onnx` en fp32.

La modificación propia de unfold-labs consiste en la poda del vocabulario mDeBERTa (de 250.105 piezas a las vistas en corpus francés e inglés, proyecto `fren-k1`): se recortan las filas de la matriz de embeddings y se remapean los ids del tokenizador y el id predefinido `<<ENT>>`. No se documenta en la información disponible un reentrenamiento de los pesos ni datos de entrenamiento adicionales; el modelo conserva los pesos del checkpoint base. Las etiquetas empleadas por la aplicación son person, organization, project, product, tool y place, con umbral 0,5, NER plano y una etiqueta por span. La versión mínima de la app requerida es 2.7.0.

## Capacidades

- Reconocimiento de entidades nombradas zero-shot con etiquetas definidas en tiempo de inferencia mediante prompt.
- Extracción de seis tipos de entidad en la aplicación: persona, organización, proyecto, producto, herramienta y lugar.
- Procesamiento bilingüe francés-inglés, con tokenización preservada tras la poda del vocabulario.
- NER plano: un único span y una única etiqueta por entidad detectada, con umbral de confianza configurable (0,5 por defecto en la app).
- Ejecución offline en dispositivo mediante ONNX, sin dependencia de servicios externos.
- Verificación de integridad de los ficheros del modelo mediante hashes sha256 en `entities-model.json`.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso; el modelo es exclusivamente de clasificación de tokens.

## Casos de uso

- Extracción de nombres en notas de reuniones: el modelo identifica personas, organizaciones y proyectos en el texto de actas y notas para enlazarlos en la exportación a Obsidian, que es el caso de uso para el que se construyó.
- Procesamiento local y privado de documentación sensible: al ejecutarse en dispositivo vía ONNX, permite analizar notas internas sin enviar contenido a servidores externos, requisito habitual en entornos con datos confidenciales.
- Indexación y enriquecimiento de bases de conocimiento personales: detección de entidades para generar enlaces automáticos entre notas, contactos y proyectos en herramientas tipo Obsidian.
- Preanotación de corpus para anotación humana: con un F1 de span de 0,708 sobre las etiquetas manuales del autor, sirve como primer paso para reducir el esfuerzo de etiquetado en pipelines de anotación.
- Extracción de entidades en aplicaciones móviles o de escritorio: el formato ONNX y el tamaño contenido del repositorio (0,6 GB) permiten integrarlo en clientes ligeros con CPU, sin GPU.
- Normalización de menciones en textos bilingües: al soportar francés e inglés con un tokenizador único, es adecuado para equipos o documentación que mezclan ambos idiomas.
- Clasificación de menciones en herramientas de gestión de proyectos: la etiqueta "tool" y "product" permite distinguir software y productos citados en reuniones técnicas.

## Benchmarks y rendimiento

Los datos publicados por el autor son comprobaciones internas (gates) sobre conjuntos propios, no benchmarks estándar de la comunidad. Se midieron sobre 60 frases cortas de reuniones en francés e inglés, anotadas a mano, una frase por ejecución en CPU, exigiendo coincidencia exacta de offsets de caracteres y etiqueta. El conjunto de validación (held-out) son 150 frases de noticias, Wikipedia y Tatoeba en francés e inglés que la poda de vocabulario no vio durante su construcción.

| Gate | Medida | Valor | Umbral | Resultado |
|---|---|---|---|---|
| int8_vs_fp32 | mejor variante INT8 frente a fp32, F1 de acuerdo de spans (no distribuida) | 0,000 | >= 0,95 | no aplica (build fp32) |
| pruned_vs_full | vocabulario podado frente a completo, F1 de acuerdo de spans | 1,000 | >= 0,95 | pasa |
| hand_labels | F1 de span frente a etiquetas manuales (P 0,680, R 0,739) | 0,708 | >= 0,6 | pasa |
| js_processor | procesador de la app (palabras, ids de token, words_mask) idéntico a GLiNER en Python | 60/60 | todos | pasa |

No se han publicado resultados de benchmarks estándar (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- El modelo se distribuye únicamente en fp32 ONNX; el repositorio ocupa 0,6 GB, por lo que la inferencia requiere del orden de esa cifra de memoria para los pesos, más el overhead del runtime ONNX.
- Diseñado para ejecución en CPU en dispositivo; los gates se evaluaron en CPU, una frase por ejecución.
- No se especifican GPU recomendadas ni requisitos de VRAM en la información disponible; por tamaño, cabe en cualquier GPU de consumo con varios GB de memoria libre, aunque no se documenta soporte GPU explícito.
- Opciones de despliegue: runtime ONNX (onnxruntime) en la aplicación Unfold Note; no se documentan integraciones con vLLM, llama.cpp, Ollama ni TGI, que no aplican a un modelo de clasificación de tokens de este tamaño.
- Latencia y throughput: no disponibles; solo se indica la ejecución de una frase por pasada en CPU durante la evaluación.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Formato | Notas |
|---|---|---|---|---|---|---|
| unfold-labs/unfold-entities-gliner-multi | no disponible (base mDeBERTa-v3-base) | 384 subtokens | fr, en | Apache-2.0 | ONNX fp32 | Vocabulario podado a fr/en; gates publicados; orientado a dispositivo |
| urchade/gliner_multi-v2.1 | no disponible (base mDeBERTa-v3-base) | no disponible en la información | multilingüe | Apache-2.0 | safetensors/PyTorch | Modelo base; vocabulario completo de 250.105 piezas; mayor tamaño |
| onnx-community/gliner_multi-v2.1 | no disponible | no disponible en la información | multilingüe | no declara licencia propia (redistribuido bajo Apache-2.0 del base) | ONNX fp32 | Conversión de formato sin poda de vocabulario |

## Limitaciones y advertencias

- Etiquetas zero-shot: las categorías proyecto, producto y herramienta se distinguen por contexto, y los nombres cortos o ambiguos son el punto más débil del modelo, según el propio autor.
- La aplicación mantiene su propio vocabulario (contactos, memoria) como primera fuente de nombres, lo que indica que el modelo por sí solo no cubre todos los casos de resolución de entidades.
- Ventana de entrada limitada a 384 subtokens (incluido el prompt de etiquetas) y spans de hasta 12 palabras; textos largos requieren segmentación previa.
- Solo francés e inglés; el vocabulario podado elimina piezas de otros idiomas, por lo que el rendimiento fuera de esos dos idiomas no está garantizado.
- NER plano con una etiqueta por span: no resuelve entidades anidadas ni solapadas.
- La variante INT8 no se distribuye porque su acuerdo con fp32 fue de 0,000, muy por debajo del umbral de 0,95; no debe asumirse equivalencia si se cuantiza por cuenta propia.
- El F1 de span sobre etiquetas manuales es 0,708 (precisión 0,680, recall 0,739), medido sobre solo 60 frases; es una muestra pequeña y de dominio específico.
- Riesgo de alucinación de entidades no cuantificado en la información disponible; el umbral de 0,5 es un compromiso fijado por la aplicación, no un valor óptimo universal.
- La exportación ONNX de origen no declara licencia propia; la redistribución se ampara en la Apache-2.0 del modelo base, lo que conviene verificar antes de un uso comercial.
- No se documentan sesgos demográficos ni evaluaciones de equidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/unfold-labs/unfold-entities-gliner-multi
- Modelo base GLiNER multi v2.1: https://huggingface.co/urchade/gliner_multi-v2.1
- Exportación ONNX de origen: https://huggingface.co/onnx-community/gliner_multi-v2.1
- Modelo base de la arquitectura mDeBERTa-v3: https://huggingface.co/microsoft/mdeberta-v3-base
- Unfold (sitio del fabricante): https://unfold.com/
- Unfold Pro: https://unfold.com/pro
