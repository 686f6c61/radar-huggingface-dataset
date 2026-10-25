# zugquants/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF

## Resumen

Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP es un *fine-tune* del modelo Qwen3.5-9B realizado por DavidAU (con la colaboración de Nightmedia), del que zugquants publica una distribución exclusivamente en formato GGUF. El objetivo declarado del autor es elevar la inteligencia general y el seguimiento de instrucciones del modelo base mediante un *fine-tune* multi-etapa y una fusión multi-modelo ejecutada en hardware local, partiendo de varias de sus propias variantes de 9B sobre Qwen 3.5. Incluye además un proceso de *abliteration* ("heretic") aplicado antes del entrenamiento posterior, por lo que el modelo es explícitamente sin censura.

El modelo mantiene la ventana de contexto de 256 000 tokens, conserva la capacidad de visión (que requiere descargar un archivo `mmproj` aparte) y añade modos de razonamiento e instructivos conmutables. La publicación de zugquants ofrece cuantizaciones GGUF "regulares" y "MTP" (*multi-token prediction*), estas últimas con decodificación especulativa integrada que, según el autor, eleva el rendimiento de unos 130 t/s a más de 185 t/s en una RTX 5090 con LM Studio.

Su relevancia práctica está en el tamaño: aproximadamente 8 950 millones de parámetros en 4 bits caben en GPU de consumo, y el autor reporta que sus resultados en 7 benchmarks igualan o superan a los de Qwen3.5-27B-Instruct y se acercan a Qwen3.6-27B-Instruct en varias métricas. Es importante señalar que estas cifras proceden de la evaluación del propio autor, no de una evaluación independiente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder derivado de Qwen3.5-9B (la model card no detalla la arquitectura interna) |
| Parametros totales | 8 953 803 264 (~8,95 B) |
| Parametros activos | No disponible (no se indica que sea MoE) |
| Longitud de contexto | 256 000 tokens (256k) |
| Tipos de cuantizacion | GGUF regulares y GGUF MTP; se citan Q4_K_S, Q6 y Q8, además de mxfp8, mxfp4 y bf16/16 bits en las pruebas. Tensores MTP en Q8_0 y tensor de salida en 16 bits en todas las cuantizaciones |
| Idiomas soportados | Inglés (en) y chino (zh) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (regulares y MTP), bf16/16 bits; archivo `mmproj` separado para visión |
| Pipeline | image-text-to-text |
| Tamaño del repositorio | 204,9 GB |
| Descargas / likes | 0 / 0 |
| Fecha de publicación | 24 de octubre de 2026 |

## Arquitectura y entrenamiento

La model card describe el proceso como un *fine-tune* multi-etapa y multi-modelo construido sobre Qwen3.5-9B, en el que se combinaron varias variantes de 9B del propio autor sobre la misma base. El entrenamiento se realizó en hardware local y el modelo se sometió a un proceso de *abliteración* ("heretic") previo al ajuste final, de modo que el autor indica que el modelo "hace lo que se le pide sin hacer preguntas". Entre las modificaciones declaradas está la compactación del bloque de razonamiento, que según el autor resulta además más potente en muchos casos. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si se emplearon RLHF o DPO.

A nivel de distribución, las cuantizaciones se generan con NEO Imatrix, que el autor cifra en una mejora de precisión de entre un 2 y un 4 % respecto a GGUF normales, además de mejor comportamiento en contexto largo. Las variantes MTP incorporan predicción multi-token con los tensores MTP fijados a Q8_0; el autor advierte que su rendimiento decae con temperatura superior a 1 o con *repetition penalty* distinto de 1, y que si la tasa de aceptación de tokens cae por debajo del 50 % conviene usar las cuantizaciones regulares. Existe también una variante "plusIQ" (Q6/Q8 MTP) con 5 modos de razonamiento y 5 modos instructivos conmutables en caliente vía API, y una versión orientada a herramientas.

## Capacidades

- Generación de texto generalista: el autor declara que el objetivo del ajuste fue elevar la inteligencia general y el seguimiento de instrucciones.
- Razonamiento explícito con modo *thinking* y bloque de razonamiento compactado; el autor afirma que en modo thinking supera habitualmente las puntuaciones obtenidas en modo instruct.
- Modos instructivos sin tokens de razonamiento, conmutables en caliente (incluidos los modos denominados Spoon y Einstein en las variantes plusIQ).
- Programación: etiquetado explícito como modelo "coder".
- Escritura creativa, ficción y *roleplay*, sin restricciones de contenido por el proceso de abliteración.
- Visión: pipeline image-text-to-text activado, pero requiere descargar el archivo `mmproj` para su uso.
- Contexto largo de hasta 256 000 tokens, útil para conversaciones multi-turno y documentos extensos.
- Soporte multilingüe limitado a inglés y chino.
- Decodificación especulativa MTP en las cuantizaciones marcadas como MTP.

## Casos de uso

- Escritura de ficción y *roleplay* sin filtros: el proceso de abliteración y el ajuste orientado a creatividad permiten narrativa adulta o temáticas que los modelos alineados rechazan; el contexto de 256k admite novelas por entregas o *lorebooks* extensos.
- Asistente de programación en local: el modelo está etiquetado como "coder" y, en cuantización Q4/Q6, cabe en una GPU de consumo, lo que permite autocompletado y revisión de código sin enviar el código a un servicio externo.
- Análisis de documentos largos: contratos, expedientes o transcripciones de hasta 256 000 tokens en un único contexto, con cuantizaciones NEO Imatrix pensadas para no degradar el rendimiento en contexto largo.
- Atención al cliente automatizada multi-turno: el contexto amplio y los modos instructivos sin tokens de razonamiento reducen la latencia en conversaciones encadenadas.
- Procesamiento de imágenes con el archivo `mmproj`: descripción de capturas, extracción de datos de documentos escaneados o moderación de contenido visual, siempre que se despliegue el proyector multimodal.
- Prototipado e investigación sobre alineación y *abliteration*: al ser un modelo "heretic" con benchmarks comparativos frente al base sin modificar, sirve para estudiar el coste de rendimiento de técnicas de desalineación.
- Despliegue en estación de trabajo con LM Studio o cualquier aplicación compatible con GGUF, sin necesidad de infraestructura en la nube.

## Benchmarks y rendimiento

Resultados reportados por el autor (modo instruct, con su propio arnés de evaluación). Valores en escala 0-1.

| Modelo | Cuantización | ARC-C | ARC-E | BoolQ | HellaSwag | OpenBookQA | PIQA | Winogrande |
|---|---|---|---|---|---|---|---|---|
| Este modelo (Defiant Fable 9B) | bf16 | 0,649 | 0,832 | 0,895 | 0,713 | 0,482 | 0,783 | 0,699 |
| Este modelo (Defiant Fable 9B) | mxfp8 | 0,647 | 0,836 | 0,895 | 0,706 | 0,460 | 0,784 | 0,695 |
| Este modelo (Defiant Fable 9B) | mxfp4 | 0,640 | 0,824 | 0,886 | 0,703 | 0,468 | 0,780 | 0,691 |
| Qwen3.5-9B-Instruct (base, sin heretic) | mxfp8 | 0,571 | 0,719 | 0,895 | 0,683 | 0,426 | 0,770 | 0,671 |
| Qwen3.5-27B-Instruct (base) | mxfp8 | 0,557 | 0,711 | 0,868 | 0,533 | 0,452 | 0,706 | 0,695 |
| Qwen3.6-27B-Instruct (base) | mxfp8 | 0,647 | 0,803 | 0,910 | 0,773 | 0,450 | 0,806 | 0,742 |
| Qwen3.6-35B-A3B-Instruct (base) | mxfp8 | 0,581 | 0,757 | 0,892 | 0,751 | 0,428 | 0,803 | 0,688 |
| Qwen3.8-27B (base) | mxfp8 | 0,591 | 0,782 | 0,896 | 0,746 | 0,448 | 0,801 | 0,711 |
| Qwen3.8-27B (base) | mxfp4 | 0,581 | 0,771 | 0,889 | 0,738 | 0,442 | 0,798 | 0,713 |

No se han publicado resultados de MMLU, HumanEval, GSM8K ni de benchmarks de razonamiento matemático en la información disponible. El autor advierte explícitamente que superar benchmarks concretos frente a Qwen3.5-27B no implica superarlo en todas las tareas.

## Requisitos de hardware

- VRAM estimada para inferencia (cálculo a partir de los 8,95 B de parámetros, no publicado por el autor): en torno a 5-6 GB en Q4, 9-10 GB en Q8 y 18 GB en bf16, más la caché KV correspondiente al contexto utilizado, que con 256k tokens puede ser muy superior al peso de los pesos.
- GPU recomendadas: el autor solo documenta pruebas en una RTX 5090 bajo Windows 11 con LM Studio. No se indican recomendaciones oficiales para A100, H100 u otras GPU de datacenter.
- Cabe en GPU de consumo: sí, en Q4 y Q6 en tarjetas de 8-12 GB, y en Q8 en tarjetas de 16 GB o más. Con contexto muy largo el cuello de botella pasa a ser la memoria para la caché KV.
- Opciones de despliegue: el autor afirma que las cuantizaciones GGUF funcionan en "todas las aplicaciones de IA estándar" y verifica en LM Studio; cualquier runtime compatible con GGUF (llama.cpp y derivados) es apto. No se mencionan vLLM ni TGI, que no consumen GGUF directamente.
- Rendimiento reportado: Q4_K_S regular en torno a 130 t/s y MTP por encima de 185 t/s con una tasa de aceptación del 60 % (2 tokens) en RTX 5090, Windows 11 y LM Studio. El autor indica que Linux y macOS suelen ser más rápidos.
- Aviso de rendimiento MTP: si la aceptación de tokens baja del 50 %, las cuantizaciones regulares resultan más rápidas; mantener temperatura en 1 o menos y *repetition penalty* en 1.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento (ARC-C / HellaSwag / PIQA) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este modelo (Defiant Fable 9B, GGUF) | ~8,95 B | 256k | 0,649 / 0,713 / 0,783 (bf16) | Apache 2.0 | GGUF en HuggingFace |
| Qwen3.5-9B-Instruct | 9 B (no confirmado en la información) | No disponible | 0,571 / 0,683 / 0,770 (mxfp8) | No disponible | Modelo base de referencia |
| Qwen3.5-27B-Instruct | 27 B (no confirmado) | No disponible | 0,557 / 0,533 / 0,706 (mxfp8) | No disponible | Modelo base de referencia |
| Qwen3.6-27B-Instruct | 27 B (no confirmado) | No disponible | 0,647 / 0,773 / 0,806 (mxfp8) | No disponible | Modelo base de referencia |
| Qwen3.6-35B-A3B-Instruct | 35 B totales, A3B activos (MoE) | No disponible | 0,581 / 0,751 / 0,803 (mxfp8) | No disponible | Modelo base de referencia |

Los datos de contexto y licencia de los modelos comparados no aparecen en la información proporcionada. El autor enlaza como alternativa superior en todos los benchmarks críticos a DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF.

## Limitaciones y advertencias

- Modelo explícitamente sin censura y sometido a *abliteration*: no incorpora alineación de seguridad, por lo que puede producir contenido ilegal, dañino o difamatorio. No es apto para aplicaciones de cara al público sin una capa de moderación externa.
- Los benchmarks son autoinformados por el autor del *fine-tune*, con su propio arnés y en modo instruct; no hay evaluación independiente ni resultados de MMLU, HumanEval o GSM8K que permitan verificar las afirmaciones.
- Riesgo de alucinación inherente a un modelo de 9B sin datos de evaluación factual específicos.
- Cobertura lingüística limitada a inglés y chino; el castellano no está declarado como idioma soportado.
- El repositorio registra 0 descargas y 0 likes en el momento de la consulta: no existe validación por parte de la comunidad.
- Tamaño del repositorio de 204,9 GB: descargar cuantizaciones individuales, no el repo completo.
- La visión no funciona sin descargar el archivo `mmproj` por separado.
- Las cuantizaciones MTP pierden rendimiento con temperatura superior a 1 o *repetition penalty* activado, y son más lentas que las regulares si la aceptación de tokens cae por debajo del 50 %.
- Licencia Apache 2.0 declarada por el publicador del GGUF; conviene verificar la licencia del modelo base y del *fine-tune* original antes de un uso comercial.
- Contexto de 256k declarado sin datos publicados sobre degradación del rendimiento a esa longitud.

## Enlaces

- Repositorio GGUF en HuggingFace: https://huggingface.co/zugquants/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP-GGUF
- Modelo base (fine-tune original de DavidAU): https://huggingface.co/DavidAU/Qwen3.5-9B-The-Defiant-Fable-Uncensored-Heretic-NEO-IMATRIX-MAX-MTP
- Alternativa de 27B recomendada por el autor: https://huggingface.co/DavidAU/Qwen3.6-27B-Fable-Fusion-711-Uncensored-Heretic-NM-DAU-NEO-MAX-MTP-GGUF
- Paper, blog técnico o demo: no disponible en la información proporcionada.
