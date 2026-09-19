# StanfordSCALE/assertion_sentence_shows_uncertainty

## Resumen

`StanfordSCALE/assertion_sentence_shows_uncertainty` es un clasificador binario de frases en inglés desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. Su tarea es determinar si un enunciado de un docente muestra incertidumbre (por ejemplo, uso de matices, dudas o formulaciones tentativas). El modelo se integra en el paquete Python `EduBehaviors-kit` y forma parte de un conjunto de esquemas de "assertions" pensados para codificar diálogo educativo de forma auditable.

Técnicamente no es un modelo generativo: se trata de un clasificador SetFit construido sobre el encoder `sentence-transformers/paraphrase-mpnet-base-v2` (MPNet, 109.486.464 parámetros) con una cabeza de regresión logística. El entrenamiento se realizó sobre un subconjunto anotado por LLM de intervenciones de docentes del TalkMoves Dataset, con 3.430 ejemplos de entrenamiento, 858 de desarrollo y 2.146 de test, y una tasa base de la clase positiva del 1,9 %.

Su relevancia es acotada pero específica: cubre una necesidad poco atendida en investigación educativa, la detección automática de marcadores de incertidumbre en el discurso de aula a escala de corpus. En el momento de redactar esta ficha el repositorio acumula 0 descargas y 0 "likes", y no se declara licencia, por lo que debe considerarse un artefacto de investigación en fase temprana más que un componente listo para producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases MPNet (`paraphrase-mpnet-base-v2`) + cabeza de clasificación `LogisticRegression` |
| Parámetros totales | 109.486.464 (109,5 M aproximadamente) |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible (no se especifica en la información proporcionada) |
| Tipos de cuantización | No disponible (el repositorio no publica variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | No disponible |
| Formato de pesos | safetensors |
| Librería | setfit |
| Pipeline | text-classification |
| Tarea | Clasificación binaria a nivel de enunciado: `assertion_sentence_shows_uncertainty` |
| Etiquetas de salida | 0 (la aserción no se cumple) / 1 (se cumple) |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 |
| Tamaño del repositorio | 0,4 GB |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Fecha de creación | 2026-09-18 |

## Arquitectura y entrenamiento

El modelo sigue el paradigma SetFit (Sentence Transformer Fine-tuning), diseñado para clasificación de texto con pocos datos etiquetados. El cuerpo es el encoder MPNet de `sentence-transformers/paraphrase-mpnet-base-v2`, que produce representaciones vectoriales de la frase, y sobre él se entrena una cabeza de regresión logística. El proceso consta de dos fases: una fase contrastiva sobre pares de frases (learning rate del cuerpo 2e-05, batch size 16, máximo 5.000 pasos, 10 épocas, precisión mixta activada en GPU) y una fase de ajuste de la cabeza (learning rate 0.01, batch size 32). La semilla empleada fue 20260904.

Los datos proceden del subconjunto anotado por LLM del TalkMoves Dataset: 3.430 ejemplos de entrenamiento (53,3 %), 858 de desarrollo (13,3 %) y 2.146 de test (33,4 %). La entrada se construye pasando el enunciado en bruto, sin plantilla ni prefijo. La etiqueta positiva es muy poco frecuente: 1,9 % global, con 1,7 % en train, 1,5 % en dev y 2,3 % en test. Las anotaciones no son humanas sino generadas por anotadores LLM, con un acuerdo entre anotadores medido por alfa de Krippendorff de 0,503 para esta aserción.

## Capacidades

- Clasificación binaria de enunciados en inglés: predice si una frase muestra incertidumbre.
- Salida probabilística mediante `predict_proba`, que devuelve `[P(no), P(sí)]` y permite umbralizar según el coste relativo de falsos positivos y falsos negativos.
- Funciona a nivel de enunciado individual (una frase por llamada), con integración directa en el paquete `EduBehaviors-kit`.
- Diseñado para codificación de discurso educativo y esquemas de aserciones auditables, no para generación de texto.
- No soporta tool calling ni function calling.
- No soporta razonamiento multi-paso ni comportamiento agéntico (no es un modelo generativo).
- Sin capacidades de visión, audio ni multimodalidad.
- Multilingüismo: únicamente inglés; no se declara cobertura de otros idiomas.
- Especialización vertical: marcadores de incertidumbre en intervenciones de docentes.

## Casos de uso

- Codificación automática de corpus de aula: procesar transcripciones completas de clases y etiquetar cada intervención docente como muestra o no muestra incertidumbre, sustituyendo la codificación manual de miles de turnos de palabra por inferencia por lotes.
- Investigación en discurso educativo: cuantificar la prevalencia de formulaciones tentativas del profesorado y correlacionarla con variables como participación del alumnado o rendimiento, aprovechando que la etiqueta es explícita y auditable.
- Filtrado previo para revisión humana: dado su precisión de 0,708 frente a un recall de 0,340, el modelo es más útil como criba de candidatos de alta confianza (cola de positivos claros) que como detector exhaustivo; encaja en un flujo de dos etapas donde un humano revisa solo los casos dudosos.
- Análisis de formación docente: detectar patrones de incertidumbre en el habla del profesorado antes y después de programas de desarrollo profesional, como indicador de cambios en el estilo de instrucción.
- Análisis longitudinal de programas educativos: aplicar el clasificador a cohortes y años distintos del mismo distrito para estudiar tendencias en el discurso, siempre con validación previa por el sesgo de tasa base del 1,9 %.
- Integración en pipelines de investigación reproducibles: combinado con `EduBehaviors-kit`, permite encadenar varias aserciones (incertidumbre, otras categorías del mismo corpus) sobre la misma transcripción y generar conjuntos de datos anotados versionados.
- Enriquecimiento de conjuntos de datos docentes: añadir la columna `assertion_sentence_shows_uncertainty` a un corpus propio de transcripciones en inglés para análisis posteriores con modelos de lenguaje o estadística descriptiva.
- Estimación de umbrales de política: recalibrar el punto de corte sobre `predict_proba` para maximizar F1 o fijar un recall objetivo, ya que el modelo expone probabilidades calibradas por regresión logística.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false`). Dataset: `StanfordSCALE/assertions_llm_annotated_talkmoves`.

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 858 | 1,5 % | 1,000 | 0,308 | 0,471 | 0,729 | 0,431 |
| test | 2.146 | 2,3 % | 0,708 | 0,340 | 0,459 | 0,798 | 0,421 |

La caída de precisión de 1,000 en dev a 0,708 en test, junto con el ROC-AUC de 0,798 y un average precision de 0,421 frente a una tasa base del 2,3 %, indica un rendimiento de ranking moderado y un punto de operación muy conservador en recall. No hay resultados de benchmarks estándar (MMLU, GLUE, etc.) porque el modelo no es generativo ni de propósito general.

## Requisitos de hardware

- VRAM estimada para inferencia: alrededor de 0,44 GB en fp32 y 0,22 GB en fp16 para los 109,5 M parámetros, más el coste de activaciones y de la cabeza logística; el repositorio completo ocupa 0,4 GB.
- GPU recomendadas: cualquier GPU con 2 GB o más de memoria es suficiente; no se requiere A100, H100 ni hardware de centro de datos.
- Cabe en GPU de consumo: sí, en cualquier RTX, GTX o iGPU moderna con al menos 2 GB libres; también funciona en CPU y en instancias pequeñas de cloud.
- Opciones de despliegue: `setfit` / `sentence-transformers` vía Python, exportación a ONNX o TorchScript para servir con FastAPI o Triton, y despliegue serverless con las dependencias estándar de Hugging Face. No se declara soporte para vLLM, llama.cpp, Ollama ni TGI, ya que no es un modelo causal de decodificación.
- Latencia y throughput: no disponibles (no se publican mediciones; por el tamaño del encoder, la inferencia por lotes en GPU es del orden de milisegundos por enunciado, pero este dato no está confirmado en la información proporcionada).

## Comparativa con modelos similares

No se han identificado en la información proporcionada modelos comparables publicados con la misma tarea exacta. La comparación siguiente se limita a las alternativas técnicas y a los artefactos citados en la propia model card.

| Alternativa | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `StanfordSCALE/assertion_sentence_shows_uncertainty` | 109,5 M (encoder + cabeza) | No disponible | F1 0,459; ROC-AUC 0,798 en test | No disponible | Hugging Face, 0 descargas |
| `sentence-transformers/paraphrase-mpnet-base-v2` (encoder base sin cabeza) | 109 M aproximadamente | No disponible | No aplica: no realiza clasificación binaria | No disponible en la información proporcionada | Ampliamente disponible en Hugging Face |
| Anotación humana (referencia del corpus TalkMoves) | No aplica | No aplica | Acuerdo entre anotadores (alfa de Krippendorff) de 0,503 para esta aserción | No disponible | Corpus original en GitHub (SumnerLab/TalkMoves) |
| Clasificador fine-tuneado tipo BERT/RoBERTa de propósito similar | No disponible | No disponible | No disponible | No disponible | No disponible en la información proporcionada |
| Anotación zero-shot con LLM | No disponible | No disponible | No disponible (es el origen de las etiquetas, no un baseline medido) | No disponible | No disponible |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos, y el acuerdo entre anotadores es solo moderado (alfa de Krippendorff de 0,503). Esa es la cota superior práctica de lo que el modelo puede aprender a reproducir.
- Desequilibrio extremo de clases: tasa base del 1,9 % global y del 2,3 % en test. Un clasificador trivial que siempre prediga la clase negativa acertaría más del 97 % de los casos, por lo que la exactitud (accuracy) es una métrica engañosa aquí.
- Recall bajo: 0,340 en test y 0,308 en dev. El modelo deja pasar aproximadamente dos tercios de los enunciados que sí muestran incertidumbre, con la configuración de umbral por defecto.
- Sesgo de entrenamiento: solo se usaron intervenciones de docentes. El comportamiento sobre habla de estudiantes no está evaluado y no debería asumirse.
- Cobertura lingüística limitada al inglés; no hay evidencia de transferencia a otros idiomas y el encoder base no está orientado a multilingüismo.
- Licencia no disponible: no se puede confirmar el uso comercial. Cualquier despliegue en producto requiere aclarar la licencia con el autor.
- Sin validación externa: 0 descargas y 0 "likes" en el momento de la consulta; los resultados son autocertificados por el autor y marcados como `verified: false`.
- Es un clasificador de frase aislada: no modela el contexto conversacional multi-turno, por lo que la interpretación de la incertidumbre depende completamente del enunciado introducido.
- Riesgo de falso positivo en usos fuera de dominio: el modelo se entrenó con discurso de aula y puede comportarse de forma impredecible con texto de otros registros (técnico, legal, redes sociales).
- La anotación original pudo introducir sesgos propios del LLM anotador (por ejemplo, sensibilidad a marcadores léxicos superficiales como "maybe" o "I think"), que el clasificador puede heredar.
- No debe usarse para evaluación individual de docentes ni para decisiones de alto impacto sin revisión humana, dado el recall y la falta de calibración documentada fuera de dev y test.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/StanfordSCALE/assertion_sentence_shows_uncertainty
- Dataset de anotaciones: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (repositorio original): https://github.com/SumnerLab/TalkMoves
- Paquete `EduBehaviors-kit`: mencionado en la model card, sin URL disponible en la información proporcionada
- Biblioteca SetFit: no disponible en la información proporcionada
- Paper o publicación asociada al proyecto EduBehaviors: no disponible
- Demos o espacios interactivos: no disponible
- Resultados de búsqueda web: la búsqueda no devolvió enlaces relevantes al modelo (los resultados obtenidos correspondían a contenido sin relación con el proyecto)
