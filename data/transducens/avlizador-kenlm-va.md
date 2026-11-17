# Transducens/avlizador-kenlm-va

## Resumen

`Transducens/avlizador-kenlm-va` es un artefacto lingüístico publicado por el grupo Transducens en Hugging Face. Por su identificador, se trata de un modelo de lenguaje de n-gramas en formato KenLM orientado a la evaluación de perplejidad y a la corrección o validación ortográfica en valenciano (sufijo `-va`). No es un modelo neuronal generativo, sino un modelo estadístico de recuento de n-gramas que se usa habitualmente como componente auxiliar en sistemas de reconocimiento de voz, traducción automática o correctores ortográficos.

La relevancia de este tipo de recurso es práctica: los modelos KenLM son extremadamente ligeros en comparación con los transformers, se ejecutan en CPU con consumo de memoria muy bajo y permiten puntuar secuencias de tokens con una latencia de microsegundos. Eso los hace idóneos para tareas de rescoring en decodificación, filtrado de hipótesis y detección de secuencias improbables en pipelines de producción.

La información pública disponible es mínima: la model card no incluye descripción, y los metadatos solo confirman la licencia CC BY 4.0 y la región `us`. No se han publicado detalles sobre el corpus de entrenamiento, el orden del modelo, el tamaño del vocabulario ni los resultados de evaluación, por lo que los apartados que dependen de esos datos se marcan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje estadístico de n-gramas en formato KenLM (no neuronal) |
| Parametros totales | no disponible (depende del orden y del vocabulario; no se publica) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (ventana definida por el orden del n-grama, no publicada) |
| Tipos de cuantizacion | no aplica; KenLM usa cuantización interna de probabilidades (tipo `trie` o `probing`) no documentada |
| Idiomas soportados | valenciano (inferido del sufijo `-va` del identificador); no confirmado en la model card |
| Licencia | CC BY 4.0 |
| Formato de pesos | KenLM (binario ARPA/`arpa.gz` o binario compilado; no se especifica en la model card) |

## Arquitectura y entrenamiento

El modelo sigue el paradigma clásico de n-gramas con suavizado (descuento tipo Kneser-Ney o similar, habitual en KenLM) y se distribuye como artefacto compatible con la herramienta KenLM de Kenneth Heafield. Este tipo de modelos estima la probabilidad de una secuencia a partir de frecuencias de n-gramas observadas en un corpus, con retroceso a órdenes inferiores para secuencias no vistas. No hay atención, ni capas, ni mecanismo de decodificación especulativa.

No se dispone de información sobre el corpus de entrenamiento: ni número de tokens, ni composición, ni procedencia (textos administrativos, prensa, corpus web o materiales de la Generalitat Valenciana). Tampoco se documenta el orden del modelo (bigrama, trigrama, 5-grama) ni si se aplicó poda o filtrado. No hay indicios de RLHF, DPO ni ajuste fino, ya que no son técnicas aplicables a este tipo de modelo.

## Capacidades

- Puntuación de perplejidad de secuencias de texto en valenciano, útil para detectar frases anómalas o mal formadas.
- Rescoring en decodificación de sistemas de reconocimiento automático del habla (ASR) y traducción automática.
- Corrección ortográfica y detección de errores léxicos mediante comparación de puntuaciones entre hipótesis.
- Validación de normalización textual y de reglas ortográficas del valenciano.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico.
- No genera texto de forma autónoma; solo asigna probabilidades a secuencias existentes.
- No tiene capacidades multimodales (visión, audio) ni modo de razonamiento explícito.

## Casos de uso

- Rescoring en ASR para valenciano: el modelo puntúa las hipótesis del decodificador acústico y permite descartar transcripciones improbables; su bajo coste computacional permite aplicarlo en tiempo real sobre las n-mejores hipótesis.
- Corrección ortográfica en editores y procesadores de texto: se compara la puntuación de la frase original con la de las variantes candidatas y se sugiere la de mayor probabilidad, con latencia despreciable en CPU.
- Filtrado de corpus web en valenciano: se descartan documentos con perplejidad anómalamente alta antes de usarlos para entrenar otros modelos, reduciendo ruido y texto generado automáticamente.
- Normalización de textos administrativos: detección de formas no normativas o castellanizadas en documentos oficiales antes de su publicación.
- Componente auxiliar en traducción automática castellano-valenciano: rescoring de las salidas del modelo neuronal para favorecer construcciones idiomáticas propias del valenciano.
- Evaluación de calidad de otros modelos generativos: uso como referencia estadística para medir si un modelo neuronal produce texto plausible en valenciano, comparando perplejidades sobre un conjunto de validación fijo.
- Segmentación y validación en pipelines de OCR: puntuación de líneas reconocidas para marcar fragmentos dudosos y enviarlos a revisión humana.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y su huella depende del tamaño del binario KenLM (típicamente entre decenas de MB y pocos GB según orden y vocabulario, aunque no se publica el dato concreto).
- GPU recomendadas: no aplica; KenLM no está pensado para GPU.
- Cabe en cualquier equipo consumer: sí, en principio, siempre que el binario quepa en RAM; no se dispone de la cifra exacta de memoria necesaria.
- Opciones de despliegue: binarios `query` y `score` de KenLM, biblioteca Python `kenlm`, integración en Moses, Fairseq o ESPnet para rescoring.
- Latencia y throughput: no disponibles; en general, KenLM puntúa millones de tokens por segundo en CPU, pero no se han publicado mediciones para este artefacto concreto.

## Comparativa con modelos similares

| Modelo | Tipo | Idioma | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Transducens/avlizador-kenlm-va | KenLM (n-gramas) | Valenciano (inferido) | Ventana de n-grama, no publicada | CC BY 4.0 | Hugging Face |
| Modelos KenLM de otros grupos (p. ej. para catalán o castellano) | KenLM (n-gramas) | Según corpus | Ventana de n-grama | Variable | Repositorios académicos y Hugging Face |
| Modelos neuronales pequeños tipo GPT-2 adaptados al catalán | Transformer decoder | Catalán/valenciano | 1.024-2.048 tokens típicamente | Variable | Hugging Face |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la información proporcionada.

## Limitaciones y advertencias

- La model card está vacía: no hay documentación sobre el corpus, el orden del modelo ni el proceso de entrenamiento, lo que impide auditar sesgos o cobertura léxica.
- Un modelo de n-gramas reproduce los sesgos del corpus de entrenamiento; si este incluye textos administrativos o periodísticos, el modelo favorecerá ese registro y penalizará registros coloquiales o técnicos.
- No genera texto, por lo que no hay riesgo de alucinación en el sentido habitual, pero sí puede asignar probabilidades engañosas a secuencias gramaticales poco frecuentes en el corpus.
- La cobertura dialectal es una incógnita: el valenciano tiene variación comarcal y el modelo podría estar sesgado hacia una variedad concreta.
- La licencia CC BY 4.0 permite uso comercial con atribución, pero conviene conservar el aviso de autoría en productos derivados.
- Al ser un artefacto sin pipeline declarado, no es directamente cargable con `transformers`; requiere herramientas específicas de KenLM.
- No debe usarse como sustituto de un corrector ortográfico basado en reglas: no conoce la normativa académica, solo la frecuencia de las secuencias.

## Enlaces

- Hugging Face: https://huggingface.co/Transducens/avlizador-kenlm-va
- KenLM (herramienta de referencia): https://kheafield.com/code/kenlm/
- Repositorio de KenLM en GitHub: https://github.com/kpu/kenlm
- Grupo Transducens (Universitat d'Alacant): https://transducens.dlsi.ua.es/
