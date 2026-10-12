# StanfordSCALE/assertion_invites_writing_on_their_own_paper

## Resumen

`StanfordSCALE/assertion_invites_writing_on_their_own_paper` es un clasificador binario de texto desarrollado por la Stanford SCALE Initiative dentro del proyecto *EduBehaviors: Assertion-based schemas for auditable dialogue coding*. No es un modelo generativo: detecta si un turno de palabra de un docente contiene la aserción `td__the_utterance_invites_writing_on_their_own_paper`, es decir, si la intervención invita al alumnado a escribir sobre su propio trabajo (por ejemplo, «copia la tabla y rellénala»).

Técnicamente es un modelo SetFit: un encoder de frases `sentence-transformers/paraphrase-mpnet-base-v2` (109.486.464 parámetros, pesos en safetensors, 0,4 GB de repositorio) afinado con aprendizaje contrastivo y coronado por una cabeza de regresión logística. Se entrenó sobre un subconjunto del TalkMoves Dataset anotado por LLM, con 13.186 ejemplos de entrenamiento, 3.291 de desarrollo y 8.238 de test, y una tasa base de la clase positiva del 2,5 % global.

Su relevancia es acotada pero clara: forma parte de una familia de clasificadores de aserciones pensados para codificar discurso de aula de manera auditable y reproducible, integrándose en el paquete Python `EduBehaviors-kit`. Con un F1 de 0,5315 y un ROC-AUC de 0,873 en test, es útil como herramienta de cribado o preanotación, no como sustituto de codificación humana.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SetFit: encoder de frases MPNet (12 capas, transformer) + cabeza de regresión logística |
| Parametros totales | 109.486.464 (pesos de safetensors del encoder) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (la model card no la especifica; clasifica una única utterance por llamada) |
| Tipos de cuantizacion | no disponible (pesos safetensors; el autor no documenta cuantizaciones) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors; librería `setfit` |
| Tarea | Clasificación de texto binaria (text-classification) |
| Aserción objetivo | `td__the_utterance_invites_writing_on_their_own_paper` |
| Modelo base | sentence-transformers/paraphrase-mpnet-base-v2 (affinado) |
| Cabeza | LogisticRegression |
| Dataset de entrenamiento | StanfordSCALE/assertions_llm_annotated_talkmoves |
| Tamaño del repositorio | 0,4 GB |
| Autor | StanfordSCALE (Stanford SCALE Initiative) |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo sigue el esquema SetFit de dos fases. En la primera, el encoder `paraphrase-mpnet-base-v2` se afina de forma contrastiva con pares de frases, con un learning rate de 2e-05, batch size de 16, 10 épocas y un máximo de 5.000 pasos. En la segunda, se entrena una regresión logística sobre las representaciones generadas, con un learning rate de 0,01, batch size de 32 y un máximo de 100 pasos de evaluación. Se usó precisión mixta en GPU y una semilla fija (20260904).

Los datos proceden de un subconjunto del TalkMoves Dataset (turnos de docentes) anotado por LLM: 13.186 filas de entrenamiento (53,4 %), 3.291 de desarrollo (13,3 %) y 8.238 de test (33,3 %). La tasa base de la etiqueta positiva es del 2,5 % global (2,7 % en train, 1,8 % en dev, 2,6 % en test), lo que refleja un fenómeno poco frecuente en el corpus. La concordancia entre anotadores, medida con alfa de Krippendorff, es de 0,628. El texto de entrada se construye pasando la utterance tal cual, sin plantilla ni prefijo: `{utterance}`.

## Capacidades

- Clasificación binaria de turnos de docente en inglés: devuelve 1 si la intervención invita a escribir sobre el propio trabajo del alumnado y 0 en caso contrario.
- Estimación de probabilidad por clase mediante `predict_proba`, útil para umbralizar y priorizar revisiones.
- Detección de un comportamiento instruccional concreto y auditable, con un identificador de aserción estable (`td__the_utterance_invites_writing_on_their_own_paper`).
- Integración en el paquete Python `EduBehaviors-kit` para pipelines de codificación de diálogo educativo.
- Uso directo con la librería `setfit` mediante `SetFitModel.from_pretrained(...)`.
- Capacidades multilingües: no disponibles; el modelo está entrenado y etiquetado únicamente para inglés.
- Tool calling, agentes, razonamiento multi-paso, visión o audio: no aplica; es un clasificador, no un modelo generativo.
- Modo «thinking»: no disponible.

## Casos de uso

- Codificación automática de discurso de aula en investigación educativa: permite etiquetar miles de turnos de docente del corpus TalkMoves de forma reproducible, reduciendo el coste de la codificación manual previa.
- Preanotación para anotadores humanos: con `predict_proba` se puede fijar un umbral alto y enviar a revisión humana solo los casos dudosos, aprovechando el ROC-AUC de 0,873 pese al F1 moderado.
- Formación y desarrollo profesional docente: analizar grabaciones transcritas de clase para identificar en qué momentos el profesorado invita al alumnado a escribir sobre su propio material, y usarlo como evidencia en sesiones de retroalimentación.
- Paneles de analítica de aula: alimentar cuadros de mando que cuantifiquen la frecuencia de esta práctica instruccional por sesión, unidad didáctica o docente.
- Estudios comparativos a escala: aplicar el clasificador a corpus de varios centros o distritos para analizar variaciones en la frecuencia de la aserción, siempre acompañando el resultado de métricas de fiabilidad.
- Construcción de variables dependientes en investigación: usar las predicciones como variable de entrada en modelos estadísticos sobre resultados de aprendizaje o patrones de discurso.
- Filtrado y curación de corpus: preseleccionar turnos candidatos a contener esta práctica antes de una anotación experta más costosa.
- Reproducibilidad metodológica: integrarlo en flujos de trabajo con `EduBehaviors-kit` que documenten la versión del modelo, la semilla y el umbral empleados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (no verificados de forma independiente, `verified: false`):

| Split | n | Tasa base | Precision | Recall | F1 (clase positiva) | ROC-AUC | Average precision |
|---|---|---|---|---|---|---|---|
| dev | 3.291 | 1,8 % | 0,750 | 0,310 | 0,439 | 0,908 | 0,520 |
| test | 8.238 | 2,6 % | 0,647 | 0,451 | 0,532 | 0,873 | 0,471 |

Valores del model-index para el split de test: F1 0,5315, precision 0,6467, recall 0,4512, ROC-AUC 0,873.

## Requisitos de hardware

- Inferencia en CPU: viable. El encoder tiene 109,5 M de parámetros (aproximadamente 0,44 GB en FP32 y 0,22 GB en FP16), por lo que cabe holgadamente en memoria de sistema convencional.
- VRAM estimada: no disponible de forma explícita; por tamaño de pesos, una GPU con 2-4 GB de VRAM es suficiente para inferencia en FP32 o FP16, sin margen de publicación oficial.
- GPU recomendadas: cualquier GPU moderna con al menos unos pocos GB de VRAM (por ejemplo, RTX 3060, RTX 4090, T4, A100, H100). No se requiere hardware de gama alta.
- Cabe en GPU de consumo: sí, en la práctica totalidad de las GPU de consumo actuales; también funciona sin GPU.
- Opciones de despliegue: librería `setfit` (recomendada por el autor), `sentence-transformers` para el encoder, y exportación a ONNX mediante herramientas de Optimum si se necesita servir el modelo sin dependencias de PyTorch. vLLM, llama.cpp, Ollama o TGI no aplican a este tipo de modelo.
- Latencia y throughput: no publicados por el autor; no se dispone de cifras medidas.
- Tamaño en disco: 0,4 GB de repositorio.

## Comparativa con modelos similares

No se han publicado resultados de benchmarks de modelos comparables en la información disponible. La model card no ofrece comparaciones con otros clasificadores de la misma familia de aserciones ni con alternativas de codificación de discurso. Como referencia interna, la única comparación calculable con los datos aportados es frente a un clasificador trivial que prediga siempre la clase negativa (tasa base positiva del 2,6 % en test): ese clasificador obtendría F1 = 0 en la clase positiva, frente al 0,5315 de este modelo, aunque su exactitud global sería del 97,4 %, lo que ilustra por qué la exactitud es una métrica engañosa en este problema.

| Modelo | Parametros | Tarea | F1 (test) | ROC-AUC (test) | Licencia |
|---|---|---|---|---|---|
| StanfordSCALE/assertion_invites_writing_on_their_own_paper | 109,5 M | Clasificación binaria de aserción | 0,5315 | 0,873 | no disponible |
| Clasificador trivial (siempre negativo) | 0 | Clasificación binaria | 0,000 | 0,500 | no aplica |
| Otros clasificadores de aserciones de StanfordSCALE | no disponible | Clasificación binaria | no disponible | no disponible | no disponible |
| sentence-transformers/paraphrase-mpnet-base-v2 sin ajustar | 109,5 M | Embeddings de frases | no disponible | no disponible | Apache-2.0 (según el modelo base; no confirmado para este derivado) |

## Limitaciones y advertencias

- Las etiquetas proceden de anotadores LLM, no de codificadores humanos; la concordancia entre anotadores es de alfa de Krippendorff 0,628, un valor moderado que acota el techo de rendimiento alcanzable.
- El recall en test es bajo (0,4512): el modelo deja escapar aproximadamente la mitad de los casos positivos. No es adecuado para decisiones automáticas sin revisión humana.
- La clase positiva es muy poco frecuente (2,6 % en test), por lo que la exactitud global puede resultar engañosamente alta; deben usarse F1, precision, recall y ROC-AUC.
- Entrenado únicamente con turnos de docentes; su comportamiento sobre habla de estudiantes no se ha probado.
- Solo inglés: no hay evidencia de funcionamiento en castellano ni en otros idiomas.
- La licencia no está disponible, lo que impide confirmar si se permite el uso comercial; conviene aclararlo con los autores antes de cualquier despliegue en producción.
- Los resultados están declarados por el autor y no han sido verificados de forma independiente (`verified: false`).
- Riesgo de alucinación: no aplica en el sentido generativo (no produce texto libre), pero sí existe riesgo de falsos positivos y falsos negativos en la clasificación.
- El modelo clasifica una utterance aislada, sin contexto conversacional; no se documenta cómo afecta al rendimiento la pérdida de turnos previos.
- Sensibilidad al formato de entrada: se entrenó con la utterance tal cual, sin plantilla, por lo que alterar el preprocesado puede degradar los resultados.
- Sin descargas ni likes registrados en el momento de la consulta: no existe validación por parte de la comunidad.
- Fecha de publicación muy reciente (2026-10-12), lo que implica ausencia de estudios de replicación.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StanfordSCALE/assertion_invites_writing_on_their_own_paper
- Dataset de anotación: https://huggingface.co/datasets/StanfordSCALE/assertions_llm_annotated_talkmoves
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-mpnet-base-v2
- TalkMoves Dataset (GitHub): https://github.com/SumnerLab/TalkMoves
- Paquete Python `EduBehaviors-kit`: mencionado en la model card, sin enlace disponible
- Cita bibliográfica (BibTeX, según la model card):

```bibtex
@misc{assertion_invites_writing_on_their_own_paper,
  author = {Stanford SCALE Initiative},
  title  = {Assertion classifier: the utterance invites writing on their own paper},
  year   = {2026},
  url    = {https://huggingface.co/StanfordSCALE/assertion_invites_writing_on_their_own_paper}
}
```
