# space-cadet/wavlm-ser

## Resumen

WavLM-SER es un modelo de reconocimiento de emociones en habla (*speech emotion recognition*, SER) obtenido mediante el ajuste fino de `microsoft/wavlm-large`, un codificador Transformer de 24 capas preentrenado de forma autosupervisada sobre audio. El autor del checkpoint es el usuario de Hugging Face `space-cadet`, que lo publica como modelo de clasificación de audio con pipeline `audio-classification` y licencia genérica `other`. Resuelve la tarea de asignar una de ocho clases de emoción a una grabación de voz en inglés.

El interés del modelo no reside tanto en su rendimiento absoluto como en el enfoque del proyecto: medir la generalización de SER más allá de los corpus de entrenamiento y diagnosticar por qué falla. El autor reporta un 77,3 % de exactitud en distribución (sobre RAVDESS, IEMOCAP y CREMA-D combinados) y una caída de 16 a 23 puntos porcentuales en pruebas entre corpus, atribuida a una limitación conocida de los embeddings de habla autosupervisados a la hora de codificar la dimensión de valencia.

Se publica como base de investigación y *baseline* para estudiar el desajuste de dominio en SER, no como componente listo para producción. El repositorio ocupa 51,8 GB y no registra descargas en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder de 24 capas (WavLM) con cabeza de clasificación |
| Parametros totales | no disponible (el modelo base `wavlm-large` ronda los 317 M, cifra no confirmada en la información proporcionada) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (habla emocional actuada o elicitada) |
| Licencia | `other` (el autor remite a las licencias de RAVDESS, IEMOCAP y CREMA-D; IEMOCAP restringe la redistribución) |
| Formato de pesos | no disponible (repositorio compatible con `transformers`; tamaño del repo: 51,8 GB) |

## Arquitectura y entrenamiento

El modelo parte de WavLM, un codificador Transformer que opera directamente sobre la forma de onda y se preentrena con objetivos autosupervisados de enmascaramiento y predicción, lo que le permite aprender representaciones acústicas sin etiquetas. Sobre ese *backbone* de 24 capas se añade una cabeza de clasificación y se ajusta de forma supervisada para predecir una de ocho clases de emoción a partir de habla cruda.

El ajuste se realizó sobre una combinación de tres corpus: RAVDESS, IEMOCAP y CREMA-D, todos en inglés y en su mayoría actuados o guionizados, grabados en estudio o laboratorio y con hablantes predominantemente de inglés norteamericano. La model card no detalla el número de tokens, la composición exacta del conjunto ni si se aplicaron técnicas de RLHF o DPO (no procede en una tarea de clasificación). Tampoco especifica cómo se armonizaron las etiquetas de los tres corpus, cuyos conjuntos originales difieren, y deja ese punto como pendiente de documentar.

El autor menciona mitigaciones planificadas pero no implementadas en esta versión: adaptación de dominio adversarial, desenredo de hablante (*speaker disentanglement*) y un corpus de preentrenamiento adaptativo específico para Kenia. No se documentan innovaciones de decodificación ni mecanismos de atención lineal.

## Capacidades

- Clasificación de emociones en habla en ocho clases a partir de audio en inglés.
- Procesamiento de forma de onda cruda mediante el extractor de características de WavLM.
- Integración con la librería `transformers` a través de `AutoFeatureExtractor` y `AutoModelForAudioClassification`.
- Compatibilidad con *endpoints* de Hugging Face (etiqueta `endpoints_compatible`).
- Uso como *baseline* para estudiar generalización entre corpus y desajuste de dominio.
- Punto de partida para adaptación a acentos y condiciones de grabación poco representados.
- No soporta *tool calling*, agentes, razonamiento multi-paso ni generación de texto: es un clasificador de audio, no un modelo generativo.
- No dispone de modo de razonamiento (*thinking*), visión ni audio generativo.

## Casos de uso

- Investigación en reconocimiento de emociones: el modelo sirve para reproducir el experimento de generalización entre corpus y comparar la caída de exactitud con otras arquitecturas de SER.
- Análisis de desajuste de dominio: al evaluar sobre corpus no vistos se puede caracterizar el patrón de error en las dimensiones de activación (*arousal*) y valencia, útil para diseñar mitigaciones.
- *Baseline* en publicaciones académicas: proporciona una referencia de 77,3 % en distribución sobre RAVDESS, IEMOCAP y CREMA-D para comparar nuevos métodos de adaptación.
- Estudio de representaciones autosupervisadas: permite analizar qué información emocional codifican los embeddings de WavLM y dónde fallan, especialmente en la separación por valencia.
- Prototipado de interfaces voz-emoción en entornos controlados: en demos con audio de estudio y hablantes similares a los corpus de entrenamiento, puede etiquetar emociones para validar un flujo de producto antes de invertir en datos propios.
- Adaptación a nuevos dominios: sirve como inicialización para ajuste fino con datos propios de acentos o condiciones de grabación específicas, como el inglés de África Oriental que el autor señala como no representado.
- Docencia y experimentación con `transformers`: ejemplo práctico de ajuste de un modelo de audio para clasificación con `AutoModelForAudioClassification`.

## Benchmarks y rendimiento

| Metrica | Resultado | Condiciones |
|---|---|---|
| Exactitud en distribución | 77,3 % | Evaluación sobre RAVDESS, IEMOCAP y CREMA-D |
| Caída entre corpus | 16-23 puntos porcentuales | Evaluación sobre un corpus no visto en entrenamiento |

No se han publicado en la información disponible resultados de MMLU, HumanEval, GSM8K ni de otros benchmarks estándar de texto, que no aplican a este modelo. Tampoco se proporcionan cifras por clase ni matrices de confusión: el autor deja ese dato como pendiente de completar.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. El repositorio ocupa 51,8 GB, lo que sugiere la presencia de múltiples checkpoints o artefactos adicionales; el peso de un único checkpoint no se detalla.
- GPU recomendadas: no disponible. Por el tamaño típico de un WavLM-large (del orden de cientos de millones de parámetros, cifra no confirmada), cabría esperar que quepa en GPU de consumo, pero no hay datos oficiales que lo confirmen.
- Compatibilidad con GPU de consumo: no confirmada en la información disponible.
- Opciones de despliegue: la librería indicada es `transformers`, con soporte de `AutoModelForAudioClassification` y compatibilidad con *endpoints* de Hugging Face. No se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que en general no están orientados a clasificación de audio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| space-cadet/wavlm-ser | no disponible (base WavLM-large) | no disponible | SER 8 clases, inglés | `other` | Hugging Face |
| microsoft/wavlm-large | no disponible en la información | no disponible | Representación de habla autosupervisada (base) | no disponible en la información | Hugging Face |
| Alternativas de SER comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos de SER en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa rigurosa.

## Limitaciones y advertencias

- Mala generalización entre corpus: la exactitud cae 16-23 puntos porcentuales al evaluar sobre un corpus no visto, frente al 77,3 % en distribución.
- Patrón de fallo en valencia: los errores se concentran en emociones que se distinguen principalmente por valencia (positivo frente a negativo con activación similar), dimensión que los embeddings autosupervisados codifican con menos fiabilidad que la activación.
- Sesgo de corpus y hablante: los datos de entrenamiento son en su mayoría actuados o guionizados, grabados en estudio o laboratorio y con hablantes de inglés norteamericano; el modelo puede aprender señales de hablante, corpus o canal además de la emoción.
- Infrarrepresentación del inglés africano: no hay habla keniana ni de África Oriental en entrenamiento ni en evaluación, y el rendimiento en esos hablantes no está medido.
- Emoción actuada frente a sentida: las etiquetas reflejan emoción percibida o pretendida en habla interpretada, no estados internos verificados.
- Desajuste de etiquetas: no se documenta cómo se armonizaron las ocho clases a partir de los conjuntos de etiquetas originales de los tres corpus.
- Restricciones de licencia: la licencia es `other` y el autor remite a las de RAVDESS, IEMOCAP y CREMA-D; IEMOCAP restringe la redistribución, lo que condiciona el uso comercial y la redistribución de pesos derivados.
- Usos excluidos explícitamente: evaluación clínica o de salud mental, decisiones de contratación, educación, seguros, crédito o aplicación de la ley, vigilancia o monitorización de emociones sin consentimiento informado, y despliegue sobre habla muy distinta a la de entrenamiento sin evaluación en el dominio objetivo.
- Riesgo de alucinación: no aplica en el sentido generativo, pero sí existe riesgo de asignar una emoción con alta confianza a audio fuera de dominio.
- No debe desplegarse en producción sin revalidación sobre datos del dominio objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/space-cadet/wavlm-ser
- Modelo base: https://huggingface.co/microsoft/wavlm-large
- Paper de referencia de WavLM (arXiv:1910.09700, citado en las etiquetas): https://arxiv.org/abs/1910.09700
- Especificación de model cards de Hugging Face: https://github.com/huggingface/hub-docs/blob/main/modelcard.md
- Guía de model cards: https://huggingface.co/docs/hub/model-cards
