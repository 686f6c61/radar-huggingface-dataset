# Writerslogic/narrative-multitask

## Resumen

narrative-multitask (v2) es un modelo encoder multitaréa desarrollado por Writerslogic para el procesamiento de prosa de ficción en inglés. Parte de RoBERTa-base (125 millones de parámetros) y añade cuatro cabezas de predicción especializadas: reconocimiento de entidades de persona, detección de menciones nominales, resolución de correferencia y atribución de citas a hablantes. El resultado es un único encoder que sustituye a varios modelos especializados en tareas de análisis narrativo.

El modelo se distribuye en formato ONNX con cuantización dinámica a int8 (126 MB), pensado para ser consumido por la crate Rust `narrative-lens`, que lo ejecuta sobre ONNX Runtime nativo y, mediante tract, en WebAssembly. Esto lo hace adecuado para aplicaciones de escritorio y web que necesitan análisis literario sin depender de Python ni de infraestructura de servidor.

Su relevancia radica en que aborda tareas de comprensión narrativa (quién habla, a quién se refiere un pronombre, qué menciones son personas) con un modelo compacto y una licencia permisiva Apache-2.0, entrenado con supervisión de un profesor DeBERTa-v3-large y destilación sobre 100 novelas de dominio público. La ventana de contexto es de 512 tokens (510 de contenido), suficiente para pasajes literarios pero no para obras completas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (RoBERTa-base) con cuatro cabezas de predicción |
| Parametros totales | ~125 millones (RoBERTa-base) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | 512 tokens (510 tokens de contenido por ventana) |
| Tipos de cuantizacion | Int8 dinámica (pesos de 126 MB); pesos originales en float32 disponibles en el repo |
| Idiomas soportados | Inglés (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | ONNX (con `tokenizer.adapted.json` y `manifest.json` con sha256) |

## Arquitectura y entrenamiento

El modelo es un encoder RoBERTa-base con cuatro cabezas sobre la representación contextual: `entity_logits` (BIO sobre el conjunto de etiquetas CoNLL, `[1, L, 9]`), `nominal_logits` (O / B-NOM / I-NOM, `[1, L, 3]`), `coref_scores` (matriz `[m, m]` de puntuaciones de antecedente entre menciones) y `attribution_scores` (matriz `[q, m+1]` de hablante por cita, donde la columna 0 indica hablante fuera de la ventana). Las cabezas de pares incorporan características aprendidas de distancia en tokens. La entrada incluye `input_ids`, `attention_mask`, `mention_starts`, `mention_ends`, `quote_starts` y `quote_ends`; el eje de batch está fijado a 1.

El entrenamiento sigue un esquema de destilación profesor-alumno: un DeBERTa-v3-large se entrena primero sobre los mismos documentos (2 épocas, lr 2e-5) y el alumno RoBERTa-base (3 épocas, lr 3e-5) aprende de las etiquetas gold más las distribuciones del profesor, alineadas por offsets de caracteres. Los datos combinan el split de desarrollo de LitBank (menciones propias, nominales y pronominales, clusters de correferencia, citas con hablantes; CC BY 4.0), 24 novelas del Project Dialogism Novel Corpus (hablantes de citas y menciones alias; CC BY 4.0) y 100 novelas de dominio público de Project Gutenberg (29.214 ventanas) etiquetadas de forma blanda por el profesor. Se excluyeron las cuatro novelas de PDNC cuyo extracto está en el split de holdout de LitBank y todas las novelas fuente de LitBank de la selección de Gutenberg. El script de entrenamiento es `scripts/multitask_train.py` del repositorio narrative-lens, con procedencia en `training.json`.

## Capacidades

- Reconocimiento de entidades de persona (spans propios) en prosa de ficción, con etiquetado BIO sobre el conjunto CoNLL.
- Detección de menciones nominales de persona ("her mother", "the old man"), una categoría que los NER convencionales no cubren.
- Resolución de correferencia dentro de ventana: puntuación de antecedente para menciones propias, nominales y pronombres.
- Atribución de citas a hablantes, incluyendo la opción explícita de "hablante no presente en la ventana".
- Procesamiento por ventanas deslizantes de 510 tokens con dos rejillas desplazadas durante el entrenamiento.
- Ejecución en ONNX Runtime nativo y en WebAssembly mediante tract.
- Verificación de integridad de pesos y tokenizador mediante manifiesto con sha256.
- No soporta tool calling, agentes, visión, audio ni modo de razonamiento explícito.

## Casos de uso

- Análisis literario automatizado: extraer la red de personajes de una novela y sus alias a partir de las menciones propias y nominales, usando la cabeza `entity_logits` y `nominal_logits` sobre ventanas de 510 tokens.
- Resolución de pronombres en narrativa: determinar a qué personaje se refiere "she" o "he" en un pasaje, con la cabeza `coref_scores`, para construir trazabilidad de personajes a lo largo de un capítulo.
- Atribución de diálogo en ficción: asignar cada cita textual a su hablante mediante `attribution_scores`, útil para generar audiolibros con voces diferenciadas o para análisis estilométrico del diálogo.
- Herramientas de escritura para autores: integración en editores que señalan ambigüedades de referente o diálogos sin hablante claro, ejecutándose en WebAssembly en el navegador sin backend.
- Preparación de corpus para investigación narratológica: estructurar novelas de dominio público en entidades, menciones y citas atribuidas como paso previo a estudios computacionales de estilo o evolución de personajes.
- Indexación y búsqueda semántica en bibliotecas digitales: enriquecer textos con anotaciones de personajes y hablantes para permitir búsquedas del tipo "diálogos de este personaje" o "escenas donde aparece la madre".
- Preprocesamiento para pipelines de TTS o doblaje: identificar hablante por intervención antes de sintetizar voz, con la ventaja de que el modelo es pequeño (126 MB int8) y ejecutable localmente.

## Benchmarks y rendimiento

Resultados sobre autores no vistos (pooled sobre un split de 5 folds disjuntos por autor sobre LitBank, PDNC y los documentos de listas de alias de PDNC):

| Métrica | Alumno (pooled) | Profesor (rango entre folds) |
|---|---:|---:|
| Spans de persona propios, F1 exacto | 0.822 | 0.633-0.906 |
| Menciones nominales, F1 exacto | 0.708 | 0.604-0.686 |
| Precisión de antecedente, menciones propias (en ventana) | 0.937 | no disponible |
| Precisión de antecedente, menciones nominales (en ventana) | 0.859 | no disponible |
| Precisión de antecedente, pronombres (en ventana) | 0.935 | 0.925-0.954 |
| Precisión de hablante de cita | 0.854 | 0.849-0.898 |

Sobre el split de desarrollo de LitBank a través del pipeline de narrative-lens (el modelo se entrenó con estas obras, por lo que mide integración, no generalización): F1 de resolución de pronombres con reparto de personajes 0.848 (precisión 0.861) y F1 de hablante en modo explícito 0.699 (precisión 0.787), frente a 0.786 y 0.657 de la versión v1.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB con pesos int8 (126 MB) más activaciones y buffers de la ventana de 512 tokens; en float32, aproximadamente 500 MB solo de pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; el modelo es viable en CPU para cargas moderadas.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna (GTX 1650, RTX 3060, RTX 4090) e incluso en iGPU con suficiente memoria compartida.
- Opciones de despliegue: ONNX Runtime nativo (vía la crate `narrative-lens`), tract para WebAssembly; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo generativo.
- Latencia y throughput: no disponibles en la información proporcionada; al ser un encoder de 125 M de parámetros sobre ventanas de 510 tokens, se espera latencia de milisegundos por ventana en GPU y decenas de milisegundos en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tareas | Licencia | Formato |
|---|---:|---|---|---|---|
| narrative-multitask v2 | ~125 M | 512 tokens | NER de persona, menciones nominales, correferencia, atribución de citas | Apache-2.0 | ONNX int8 |
| RoBERTa-base (base) | ~125 M | 512 tokens | Enmascarado de lenguaje; requiere fine-tuning por tarea | MIT | safetensors, ONNX |
| DeBERTa-v3-large (profesor) | ~435 M | 512 tokens | NER y correferencia genéricas; usado aquí como profesor | MIT | safetensors |
| Modelos de correferencia tipo coref-spanbert | ~110-125 M | 512 tokens | Correferencia de spans en texto general | MIT | safetensors |

La comparación directa con alternativas especializadas en atribución de citas o menciones nominales en ficción no está disponible en la información proporcionada. La ventaja diferencial frente a RoBERTa-base es la multitarea integrada y el formato ONNX cuantizado listo para producción; la desventaja es que no es un modelo generativo y su cobertura se limita al inglés y a prosa de ficción.

## Limitaciones y advertencias

- Solo inglés: no hay soporte multilingüe documentado.
- Ventana de 512 tokens (510 de contenido): la correferencia y la atribución de citas solo funcionan dentro de la ventana; referentes fuera de ella no se resuelven.
- Especializado en prosa de ficción: el rendimiento en otros dominios (noticias, texto técnico, diálogo conversacional) no está medido y probablemente sea inferior.
- Riesgo de alucinación: al ser un modelo discriminativo (clasificación de spans y puntuaciones), no genera texto, pero puede producir atribuciones de hablante o antecedentes incorrectos con alta confianza; las puntuaciones deben calibrarse por aplicación.
- Sesgos: el entrenamiento se apoya en LitBank, PDNC y 100 novelas de dominio público, con posibles sesgos de género, época y canon literario; no se documenta ninguna evaluación de sesgo.
- Restricciones de licencia: los pesos son Apache-2.0, pero los datasets de entrenamiento son CC BY 4.0 y requieren atribución (LitBank y PDNC); el uso comercial de los pesos está permitido, aunque conviene revisar las obligaciones de atribución de los datos si se redistribuyen derivados.
- En producción: el eje de batch está fijado a 1, lo que limita el throughput en escenarios de alto volumen; no hay soporte documentado para batching dinámico.
- La evaluación sobre LitBank está contaminada por entrenamiento (el modelo vio esas obras); las cifras de generalización reales son las del split disjunto por autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Writerslogic/narrative-multitask
- Repositorio narrative-lens: https://github.com/writerslogic/narrative-lens
- Modelo base RoBERTa: https://huggingface.co/FacebookAI/roberta-base
- Dataset LitBank: https://huggingface.co/datasets/dbamman/litbank
- Dataset Project Dialogism Novel Corpus: https://huggingface.co/datasets/Priya22/project-dialogism-novel-corpus
