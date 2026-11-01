# soundstarrain/english-split-and-rephrase-rewriter

## Resumen

English Split and Rephrase Rewriter es un modelo de generación texto-a-texto desarrollado por el usuario de HuggingFace `soundstarrain` que reescribe una frase compleja en inglés en dos oraciones más cortas y relacionadas semánticamente. Está construido mediante fine-tuning de `google-t5/t5-base`, un transformer encoder-decoder con 222.882.816 parámetros, sobre 200.000 pares de split-and-rephrase en inglés derivados del corpus BiSECT. La salida separa ambas partes con el token especial `<SEP>`.

El modelo resuelve un problema concreto de preprocesado lingüístico: la simplificación sintáctica mediante segmentación de oraciones largas en unidades más cortas sin perder el significado. No es un modelo de propósito general ni un asistente conversacional, sino un componente especializado dentro de pipelines de procesado de lenguaje, pensado para integrarse junto a un modelo "gate" complementario (también publicado por el mismo autor) que decide si es necesaria otra iteración de división.

Su relevancia es acotada pero específica: cubre una tarea poco atendida por los modelos generalistas y lo hace con un tamaño reducido (0,9 GB de repositorio), licencia Apache-2.0 y métricas declaradas sobre el split de test de BiSECT (100% de formato válido de dos partes y F1 de tokens medio de 0,75). Es un modelo de nicho, con 16 descargas en el momento de redactar esta ficha, orientado a desarrolladores que necesiten simplificación de oraciones controlada y reproducible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (T5) |
| Parámetros totales | 222.882.816 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un fine-tuning de `google-t5/t5-base`, un transformer encoder-decoder estándar de la familia T5. La tarea se formula como generación texto-a-texto: la entrada se prefija con `split: ` y el modelo genera una secuencia que contiene dos fragmentos separados por el token especial `<SEP>`. En el ejemplo de la model card, la generación se realiza con `max_new_tokens=192`, `num_beams=1` y `do_sample=False`, es decir, decodificación greedy determinista.

El entrenamiento se realizó sobre 200.000 pares filtrados de split-and-rephrase en inglés derivados de BiSECT (Kim et al., EMNLP 2021). El corpus de entrenamiento no se redistribuye en el repositorio. No se documenta en la model card el uso de RLHF, DPO ni otras fases de alineación, ni el número total de tokens de entrenamiento, ni innovaciones técnicas adicionales como decodificación especulativa o atención lineal. El proyecto se complementa con un modelo "gate" que predice si es necesaria otra división y con un repositorio de inferencia que implementa procesamiento recursivo, manejo de spans protegidos y comprobaciones ligeras de la salida.

## Capacidades

- Generación de texto texto-a-texto: reescribe una frase compleja en dos oraciones más cortas y relacionadas.
- División controlada de oraciones en inglés con separador explícito `<SEP>`.
- Salida en formato de dos partes validable programáticamente (el autor reporta 100% de formato válido en test).
- Integración en pipelines recursivos junto al modelo gate del mismo autor para divisiones múltiples.
- Manejo de spans protegidos y comprobaciones de salida mediante el repositorio de inferencia complementario.
- Capacidad monolingüe: solo inglés.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo "thinking".

## Casos de uso

- Preprocesado para simplificación de textos: dividir oraciones largas en unidades más cortas antes de pasarlas a modelos de resumen o extracción de información, reduciendo la complejidad sintáctica de la entrada.
- Generación de subtítulos y segmentación para accesibilidad: producir oraciones más cortas y legibles para lectores con dificultades cognitivas o para sistemas de lectura fácil.
- Construcción de datasets de simplificación: generar pares frase compleja / dos frases simples para aumentar corpus de entrenamiento en tareas de simplificación textual.
- Normalización de documentación técnica: dividir descripciones densas (por ejemplo, especificaciones de software) en oraciones atómicas antes de indexarlas en un motor de búsqueda o base vectorial.
- Pipeline de división recursiva: combinado con el modelo gate del autor, aplicar divisiones sucesivas hasta que ninguna oración supere un umbral de longitud configurado.
- Preprocesado para TTS o subtitulado: fragmentar oraciones largas en unidades más manejables para síntesis de voz o para segmentación de subtítulos con control de longitud.
- Limpieza de corpus para análisis lingüístico: separar oraciones compuestas en cláusulas independientes para análisis de dependencias o estadísticas de longitud oracional.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Tarea | Dataset | Split | Métrica | Valor |
|---|---|---|---|---|
| Split and rephrase | GEM/BiSECT | test | Valid two-part format rate (accuracy) | 1,00 |
| Split and rephrase | GEM/BiSECT | test | Mean token F1 | 0,75 |

La evaluación se realizó sobre 527 ejemplos del split de test de BiSECT. El autor indica que no se han medido evaluación humana ni rendimiento fuera de dominio. No se han publicado otros resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial; con 222,9 millones de parámetros, en FP32 el modelo ocupa aproximadamente 0,9 GB de pesos, y en FP16/BF16 alrededor de 0,45 GB, a lo que hay que sumar memoria para activaciones y KV cache.
- GPU recomendadas: no especificadas por el autor; por tamaño, cualquier GPU consumer moderna (por ejemplo, RTX 3060 en adelante) debería poder ejecutarlo con holgura en precisión completa.
- Cabe en GPU consumer: sí, por el reducido número de parámetros; no se dispone de cifras oficiales de VRAM mínima.
- Opciones de despliegue: `transformers` (librería declarada); el tag `text-generation-inference` y `endpoints_compatible` sugieren compatibilidad con TGI y endpoints de HuggingFace, aunque no se detalla configuración.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| english-split-and-rephrase-rewriter | 222,9 M | no disponible | Split-and-rephrase (inglés) | Apache-2.0 | HuggingFace |
| google-t5/t5-base (modelo base) | 222,9 M | no disponible | Texto-a-texto general | Apache-2.0 | HuggingFace |
| english-split-and-rephrase-gate (mismo autor) | no disponible | no disponible | Predicción de necesidad de nueva división | no disponible | HuggingFace |

No se dispone de información sobre otros modelos comparables específicos de split-and-rephrase en la documentación proporcionada. El modelo base T5-base sirve como referencia de tamaño y arquitectura, pero no está especializado en esta tarea.

## Limitaciones y advertencias

- Evaluación limitada al split de test de BiSECT; no hay evaluación humana ni resultados fuera de dominio.
- La calidad puede variar según género textual, longitud de la oración, terminología y grado de reescritura necesario.
- Modelo monolingüe: solo inglés; no soporta otros idiomas.
- Riesgo de alucinación y de reescrituras que alteren el significado original, especialmente en oraciones con terminología especializada o estructuras sintácticas atípicas.
- No se documentan sesgos conocidos; al entrenarse sobre BiSECT, puede heredar los sesgos de ese corpus.
- Licencia Apache-2.0 para los archivos del modelo, pero el corpus de entrenamiento no se redistribuye y su uso puede estar sujeto a las condiciones de BiSECT.
- No es un modelo de propósito general: no debe usarse como asistente conversacional ni para tareas fuera de la división y reescritura de oraciones.
- El formato de salida depende del token `<SEP>`; es necesario validar programáticamente que la salida contiene exactamente dos partes no vacías.
- No se documentan requisitos de contexto, cuantizaciones soportadas ni latencias, lo que dificulta planificar despliegues en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/soundstarrain/english-split-and-rephrase-rewriter
- Modelo gate complementario: https://huggingface.co/soundstarrain/english-split-and-rephrase-gate
- Repositorio de inferencia (pipeline recursivo y CLI): https://github.com/soundstarrain/english-split-and-rephrase
- Modelo base: https://huggingface.co/google-t5/t5-base
- Dataset BiSECT: https://huggingface.co/datasets/GEM/BiSECT
- Paper BiSECT (Kim et al., EMNLP 2021): no disponible en la información proporcionada
