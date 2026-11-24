# TurkuNLP/udmono-models

## Resumen

udmono-models es una colección de adaptadores LoRA publicada por el grupo TurkuNLP (Universidad de Turku) que convierte texto en bruto en anotación CoNLL-U completa siguiendo el estándar Universal Dependencies 2.18. Cada paquete corresponde a un treebank concreto y realiza de extremo a extremo la segmentación de oraciones, la tokenización, la expansión de tokens multi-palabra, el etiquetado UPOS/XPOS/FEATS, la lematización y el análisis de dependencias sintácticas. En la versión publicada cubre tres treebanks y tres idiomas: inglés (`en_ewt`), finés (`fi_tdt`) y francés (`fr_gsd`).

La arquitectura es un esquema de adaptadores sobre un único codificador congelado, FacebookAI/xlm-roberta-large, con un adaptador LoRA de rango 32 para el segmentador y otro para el parser. Cada paquete pesa aproximadamente 170 MB y se descarga bajo demanda, de modo que pueden cargarse varios treebanks simultáneamente sobre la misma instancia del modelo base y alternar entre ellos de forma instantánea. Esto reduce drásticamente el coste de almacenamiento frente a mantener un modelo completo por idioma.

El modelo resulta relevante para pipelines de procesamiento lingüístico que necesitan análisis morfosintáctico de alta calidad sin depender de tokenizadores externos ni de herramientas en cascada. Sus puntuaciones en los conjuntos de test de UD 2.18 (LAS entre 93,22 y 94,73; BLEX entre 89,14 y 91,13) lo sitúan como una alternativa práctica a los analizadores clásicos tipo UDPipe, con la ventaja de una API unificada y un formato de salida estandarizado.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (XLM-RoBERTa-large) congelado con adaptadores LoRA (r = 32) para segmentador y parser, más cabezas de clasificación |
| Parámetros totales | No disponible (el modelo base XLM-R-large tiene ~560 M; los adaptadores LoRA y cabezas no se cuantifican en la información disponible) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible |
| Idiomas soportados | Inglés (`en_ewt`), finés (`fi_tdt`), francés (`fr_gsd`) |
| Licencia | Apache 2.0 (modelos); los treebanks de entrenamiento tienen licencias propias, algunas CC BY-NC |
| Formato de pesos | Adaptadores LoRA y cabezas (packs de ~170 MB); el modelo base se descarga por separado en formato Hugging Face |
| Librería | `udmono` |
| Pipeline | token-classification |
| Tamaño del repositorio | 0,5 GB |
| Versión de UD | 2.18 |

## Arquitectura y entrenamiento

El sistema se apoya en un codificador transformer XLM-RoBERTa-large congelado sobre el que se entrenan dos adaptadores LoRA de rango 32: uno para el segmentador (división de oraciones y tokenización) y otro para el parser (etiquetado morfológico, lematización y dependencias). Cada treebank genera su propio par de adaptadores y cabezas, lo que permite compartir el codificador entre idiomas y descargar únicamente los paquetes necesarios. La selección de checkpoints se realiza sobre el conjunto de desarrollo, extrayéndolo del conjunto de entrenamiento cuando el treebank no dispone de partición dev; el conjunto de test nunca se usa durante el desarrollo.

La receta de entrenamiento es idéntica para todos los treebanks, sin ajuste específico por idioma. Los volúmenes de entrenamiento son de 12.544 oraciones para `en_ewt`, 12.217 para `fi_tdt` y 14.450 para `fr_gsd`. No se detalla en la información disponible el número total de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO (no procede en una tarea de etiquetado estructurado). La innovación destacable es el enfoque de "un modelo por treebank sobre un encoder compartido", que permite conmutación instantánea entre lenguajes y reduce el coste de despliegue multilingüe.

## Capacidades

- Segmentación de oraciones a partir de texto en bruto, sin preprocesado externo.
- Tokenización y expansión de tokens multi-palabra (MWT) conforme a UD.
- Etiquetado morfológico completo: UPOS, XPOS y rasgos FEATS.
- Lematización.
- Análisis de dependencias sintácticas (árboles completos en formato CoNLL-U).
- Salida directa en CoNLL-U, compatible con el ecosistema UD y con la evaluación oficial CoNLL 2018.
- Carga simultánea de múltiples treebanks sobre una misma instancia del modelo base.
- Descarga bajo demanda de paquetes por treebank.
- API de Python (`udmono.Pipeline`) y CLI (`udmono parse`, `udmono list`).
- Capacidades multilingües limitadas a los tres idiomas publicados (en, fi, fr).
- No soporta tool calling, agentes, visión ni audio: es un modelo de etiquetado lingüístico, no un LLM generativo.

## Casos de uso

- Anotación lingüística de corpus: procesar grandes volúmenes de texto en inglés, finés o francés para generar corpus anotados en CoNLL-U con morfología y dependencias, útil en investigación lingüística y en la construcción de recursos.
- Enseñanza de lenguas asistida por ordenador: extraer análisis gramaticales detallados (casos, lemas, dependencias) para alimentar ejercicios interactivos o correctores gramaticales que necesitan información morfosintáctica fiable.
- Preprocesado para pipelines de PLN: generar lemas y etiquetas POS como entrada para sistemas posteriores de extracción de información, resolución de correferencia o análisis de sentimiento basado en dependencias.
- Construcción de treebanks y evaluación de anotadores: comparar la salida del modelo con anotaciones humanas para detectar discrepancias y acelerar la revisión de anotaciones en proyectos UD.
- Búsqueda y recuperación con conciencia sintáctica: indexar documentos con información de dependencias y lemas para consultas lingüísticamente informadas (por ejemplo, patrones sujeto-verbo-objeto) en corpus multilingües.
- Análisis de texto finlandés de alta morfología: el rendimiento en `fi_tdt` (LAS 93,96, BLEX 89,80) lo hace adecuado para procesar una lengua con morfología aglutinante compleja donde otros analizadores pierden precisión.
- Normalización y enriquecimiento de datos: convertir texto plano en representaciones estructuradas para auditar calidad lingüística en sistemas de traducción o generación.

## Benchmarks y rendimiento

Resultados sobre los conjuntos de test de UD 2.18 con texto en bruto, evaluados con el script oficial CoNLL 2018 (F1):

| Treebank | Idioma | Tokens | Sentences | UPOS | UFeats | Lemmas | LAS | MLAS | BLEX |
|---|---|---|---|---|---|---|---|---|---|
| `en_ewt` | Inglés | 99,75 | 94,59 | 97,95 | 98,32 | 98,03 | 93,22 | 88,79 | 89,14 |
| `fi_tdt` | Finés | 99,85 | 98,39 | 98,50 | 97,46 | 97,09 | 93,96 | 89,47 | 89,80 |
| `fr_gsd` | Francés | 99,91 | 97,24 | 98,56 | 98,57 | 98,95 | 94,73 | 90,17 | 91,13 |

No se han publicado en la información disponible resultados comparativos frente a otros sistemas en estos mismos conjuntos.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. El modelo base XLM-R-large (~560 M de parámetros) en FP16 requiere del orden de 1,1-1,5 GB de VRAM solo para los pesos, más el espacio de activaciones; los adaptadores y cabezas añaden un coste marginal (packs de ~170 MB en disco).
- GPU recomendadas: cualquier GPU con al menos 4-8 GB de VRAM debería poder ejecutar el modelo base en FP16; una RTX 3090, RTX 4090, A100 o H100 ofrece margen holgado y buen throughput en lote.
- Cabe en GPU de consumo: sí, previsiblemente en RTX 3060 (12 GB), RTX 4060 Ti (16 GB), RTX 4070 y superiores, así como en GPUs con 8 GB o más. La cifra exacta no está publicada.
- Opciones de despliegue: la librería oficial `udmono` (instalable vía `pip install udmono`), con API de Python y CLI. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; al ser un modelo de token-classification, estos motores generativos no son el entorno natural.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Tipo | Idiomas | Contexto | LAS (UD 2.18) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| udmono-models (TurkuNLP) | XLM-R-large + LoRA por treebank | en, fi, fr | No disponible | 93,22-94,73 | Apache 2.0 (modelos); treebanks con licencias propias | Hugging Face, librería `udmono` |
| UDPipe 2 (Straka) | Pipeline entrenado por treebank | Multilingüe (UD) | No disponible | No disponible en esta información | No disponible | Repositorio público |
| Stanza (Stanford) | Neural pipeline sobre UD | Multilingüe | No disponible | No disponible en esta información | Apache 2.0 | Librería Python |

No se dispone en la información proporcionada de datos comparativos verificables de rendimiento entre estos sistemas sobre los mismos conjuntos de test, por lo que la comparación se limita a aspectos estructurales.

## Limitaciones y advertencias

- Cobertura lingüística reducida: solo inglés, finés y francés; no hay soporte para otros idiomas aunque el encoder base sea multilingüe.
- Licencias de los treebanks: aunque los modelos se publican como Apache 2.0, algunos treebanks de entrenamiento tienen licencias no comerciales (CC BY-NC-*). El autor advierte que el uso comercial exige verificar la compatibilidad con la licencia del treebank correspondiente.
- Riesgo de error en texto fuera de dominio: los resultados se miden sobre test de UD; en dominios muy distintos (redes sociales, texto técnico, OCR ruidoso) la precisión puede degradarse.
- Dependencia de la calidad del texto de entrada: errores de segmentación o tokenización en la entrada afectan en cascada a morfología y dependencias.
- Sin datos publicados sobre sesgos: no se documentan análisis de sesgo lingüístico o de dominio.
- No es un modelo generativo: no sirve para generación de texto, razonamiento, código, tool calling ni tareas de agentes.
- Longitud de contexto no especificada: se desconoce el límite práctico para documentos largos.
- Modelo reciente y con pocas descargas (0 en el momento de la consulta): menor validación comunitaria y ecosistema aún incipiente.
- La cita académica está pendiente ("TBA"), lo que dificulta la trazabilidad bibliográfica.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/TurkuNLP/udmono-models
- Modelo base: https://huggingface.co/FacebookAI/xlm-roberta-large
- Universal Dependencies: https://universaldependencies.org/
- Organización TurkuNLP: https://huggingface.co/TurkuNLP
- Documentación de arquitectura, reproducción y evaluación: referenciada en el repositorio de código del proyecto (`docs/ARCHITECTURE.md`, `docs/REPRODUCE.md`, `docs/EVALUATION.md`); URL exacta no disponible en la información proporcionada.
