# VibeHash/laya-ledgar

## Resumen

laya-ledgar es un modelo de clasificación de texto en inglés especializado en identificar qué tipo de cláusula contractual contiene un párrafo, entre 100 categorías posibles (ley aplicable, indemnización, confidencialidad, terminación y 96 más). Es un fine-tune de Laya, el modelo base de 421 millones de parámetros desarrollado por convaiinnovations, publicado por el usuario VibeHash bajo licencia Apache 2.0. El modelo resuelve un problema concreto de la industria legal: el etiquetado y triaje automático de provisiones extraídas de contratos reales presentados ante la SEC de Estados Unidos, usando la tarea LEDGAR del benchmark LexGLUE.

Su relevancia actual reside en dos factores. Primero, ofrece una probabilidad calibrada por categoría en un único forward pass, con un error de calibración esperado (ECE) de 0,042 frente al 0,416 del modelo base sin ajustar, lo que permite confiar en la confianza declarada. Segundo, incorpora un umbral de predicción selectiva (0,9806) que permite al modelo etiquetar de forma autónoma solo aquellas provisiones sobre las que está seguro, derivando el resto a revisión humana. Esta combinación de calibración y selective prediction es poco habitual en modelos de clasificación legal y lo convierte en una herramienta de triaje realista, no en un sustituto del criterio jurídico.

El modelo no es un asistente generativo ni un razonador legal: es un clasificador de una sola etiqueta por párrafo, entrenado sobre datos en inglés y orientado exclusivamente a contratos de jurisdicción estadounidense. Su valor está en la precisión dentro de su dominio acotado y en la gestión explícita de la incertidumbre, no en la amplitud de capacidades.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (fine-tune de convaiinnovations/laya; transformer, detalles no especificados en la información proporcionada) |
| Parámetros totales | 421.293.830 |
| Parámetros activos | no aplica (no es MoE según la información disponible) |
| Longitud de contexto | 768 tokens (286 reservados a las 100 opciones de etiqueta, 481 disponibles para la provisión) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | inglés (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Tarea | text-classification (clasificación de provisiones contractuales, 100 clases) |
| Dataset de entrenamiento | coastalcph/lex_glue, configuración ledgar |
| Modelo base | convaiinnovations/laya |
| Librería | laya (versión 0.4.31 en el ejemplo de uso) |
| Tamaño del repositorio | 0,8 GB |
| Descargas en Hugging Face | 0 |
| Fecha de creación | 2026-11-19 |

## Arquitectura y entrenamiento

El modelo es un fine-tune del modelo base Laya (convaiinnovations/laya), de 421 millones de parámetros. La información proporcionada no detalla la arquitectura interna de Laya (si es un transformer encoder, decoder o híbrido), por lo que este dato se marca como no disponible. El fine-tune se realizó sobre la tarea LEDGAR de LexGLUE, que consiste en clasificar párrafos de provisiones de contratos reales presentados ante la SEC en una de 100 categorías. El conjunto de test contiene 10.000 provisiones.

El entrenamiento se ejecutó con una única semilla (seed 0) sobre una RTX 4070 SUPER entre el 18 y el 19 de noviembre de 2026. Según la model card, el número de opciones de etiqueta consume 286 de los 768 tokens de contexto, dejando 481 tokens para el texto de la provisión; las provisiones más largas que ese límite se truncan y el modelo solo lee su inicio. La innovación técnica destacable no está en la arquitectura sino en el procedimiento de calibración y predicción selectiva: se ajustó un umbral sobre 2.000 provisiones de entrenamiento que el modelo nunca vio, con el objetivo de alcanzar un 99% de acierto entre las respuestas por encima del umbral. El umbral resultante, 0,9806, se almacena en la configuración del modelo y se aplica en inferencia mediante el parámetro `min_confidence`.

La model card advierte de una particularidad metodológica: 282 de las 10.000 provisiones de test aparecen palabra por palabra en el conjunto de entrenamiento (boilerplate contractual repetido), y se mantuvieron, como en el split oficial. Sobre esas 282 el modelo acierta el 97,9%; sobre las otras 9.718, el 86,7%. También señala que el número de test se obtuvo leyendo el test dos veces, lo que introduce un sesgo optimista en la comparación con resultados publicados.

## Capacidades

- Clasificación de provisiones contractuales en 100 categorías (ley aplicable, indemnización, confidencialidad, terminación, definiciones, etc.) en un único forward pass.
- Salida de probabilidad calibrada para cada una de las 100 clases, con ECE de 0,042 (15 bins) sobre el test de LEDGAR.
- Predicción selectiva: umbral configurable (`min_confidence`) que permite al modelo abstenerse y derivar casos a revisión humana.
- Confianza declarada fiable en los tramos altos: las provisiones puntuadas entre 0,95 y 0,98 aciertan el 93,8% de las veces; las puntuadas por encima de 0,98, el 98,4%.
- Procesamiento de texto en inglés exclusivamente.
- Sin soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking: es un clasificador, no un modelo generativo de propósito general.
- Capacidad multilingüe: no disponible (solo inglés).

## Casos de uso

- Triaje de contratos en despachos jurídicos: el modelo clasifica automáticamente cada provisión de un contrato y, gracias al umbral de 0,9806, etiqueta sin intervención el 36,4% de las provisiones con un 98,4% de acierto, derivando el 63,6% restante a un revisor humano junto con la mejor predicción del modelo. Reduce el trabajo manual de clasificación sin asumir riesgo en los casos dudosos.
- Construcción de índices y repositorios contractuales: al asignar una de 100 categorías a cada párrafo, permite generar índices navegables de cláusulas (por ejemplo, extraer todas las cláusulas de indemnización o de ley aplicable de un lote de contratos) para su consulta posterior.
- Due diligence en fusiones y adquisiciones: clasificación masiva de provisiones de cientos de contratos para identificar categorías de riesgo (terminación, indemnización, confidencialidad) antes de la revisión manual detallada, priorizando qué documentos y secciones requieren atención jurídica.
- Extracción de metadatos para sistemas de gestión contractual (CLM): integración del clasificador en pipelines que etiquetan automáticamente cláusulas al ingerir contratos, alimentando bases de datos estructuradas con el tipo de provisión y la confianza asociada.
- Control de calidad de plantillas contractuales: comparación de contratos redactados contra plantillas estándar para verificar la presencia y el tipo de cláusulas esperadas, usando la clasificación por categoría como señal de completitud.
- Filtrado previo en pipelines de revisión asistida por LLM: usar laya-ledgar como primera etapa para segmentar y etiquetar provisiones, de modo que un modelo generativo posterior solo procese las cláusulas relevantes para una tarea concreta, reduciendo coste y latencia.
- Investigación empírica en NLP legal: reproducción y extensión de resultados de LexGLUE con un modelo calibrado y con predicción selectiva, permitiendo estudiar el compromiso entre cobertura y precisión en clasificación legal.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card sobre el test de LEDGAR (LexGLUE), 10.000 provisiones, una semilla (seed 0). No verificados de forma independiente (`verified: false`).

| Métrica | Laya sin ajustar | laya-ledgar |
|---|---|---|
| Micro-F1 (= accuracy) | 0,391 | 0,870 |
| Intervalo de confianza al 95% (micro-F1) | 38,2–40,1% | 86,3–87,6% |
| Macro-F1 | 0,312 | 0,814 |
| Confianza media declarada | 0,807 | 0,907 |
| ECE (15 bins, menor es mejor) | 0,416 | 0,042 |

Predicción selectiva con umbral 0,9806 (ajustado sobre 2.000 provisiones de entrenamiento no vistas):

| Umbral / condición | Cobertura | Precisión |
|---|---|---|
| Umbral 0,9806 (config del modelo) | 36,4% (3.639 de 10.000) | 98,4% (3.582 correctas) |
| Corte al 95% elegido sobre el test (optimista) | 76,0% | 95% |
| Corte al 98% elegido sobre el test (optimista) | 44,2% | 98% |
| Corte al 99% elegido sobre el test (optimista) | 21,7% | 99% |

Comparación con resultados publicados en LexGLUE (Chalkidis et al. 2022, Tabla 3, test set; cada cifra es la mejor de cinco semillas seleccionada sobre validación):

| Modelo | Micro-F1 | Macro-F1 | Parámetros |
|---|---|---|---|
| TF-IDF SVM | 87,0 | 81,4 | no disponible |
| BERT | 87,6 | 81,8 | 110–149 M |
| Legal-BERT | 88,2 | 83,0 | 110–149 M |
| CaseLaw-BERT | 88,3 | 83,0 | 110–149 M |
| RoBERTa-large (Tabla 8) | 88,6 | 83,6 | no disponible |
| laya-ledgar | 87,0 | 81,4 | 421 M |

Rendimiento por subconjunto y latencia (según la model card):

| Condición | Resultado |
|---|---|
| Provisiones repetidas del entrenamiento (282) | 97,9% de acierto |
| Provisiones no repetidas (9.718) | 86,7% de acierto |
| Provisiones truncadas por longitud (253, 2,5%) | 88,1% de acierto |
| Resto de provisiones | 87,0% de acierto |
| Latencia, una provisión (mediana) | 22 ms |
| Latencia, una provisión (percentil 95) | 26 ms |
| Latencia en lotes de 32 | ~19 ms por provisión |

Clases más débiles: applicable laws (18,9%, 10 de 53), indemnity (48,3%, 14 de 29), venues (40%, 8 de 20), general (54,2% de 203), agreements (54,2%), miscellaneous (53,2%). Confusiones más frecuentes: definitions tomado por defined terms (37), applicable laws por governing laws (35), tax withholdings por withholdings (20), waivers y no waivers entre sí (20 y 19).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita en la información proporcionada. Con 421 millones de parámetros en safetensors (aproximadamente 1,7 GB en fp32 o 0,84 GB en fp16), cabe holgadamente en cualquier GPU consumer moderna; el autor reporta entrenamiento e inferencia en una RTX 4070 SUPER.
- GPU recomendadas: RTX 4070 SUPER o superior para inferencia; cualquier GPU con al menos 4–8 GB de VRAM debería ser suficiente para fp16, aunque este dato no está confirmado en la información disponible.
- Cabe en GPU consumer: sí, según la evidencia del autor (RTX 4070 SUPER).
- Opciones de despliegue: la librería propietaria `laya` (versión 0.4.31 en el ejemplo), instalable con `pip install laya==0.4.31` y cargable con `laya.load(REPO)`. No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en la información proporcionada.
- Latencia y throughput: mediana de 22 ms y percentil 95 de 26 ms por provisión individual; aproximadamente 19 ms por provisión en lotes de 32, medidos en una GPU ociosa con el código de temporización del propio evaluador. La model card advierte que `eval.json` registra 47 ms para una provisión individual, medido con la GPU ocupada en otra tarea.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Micro-F1 (LEDGAR) | Macro-F1 (LEDGAR) | Licencia | Calibración / selective prediction |
|---|---|---|---|---|---|---|
| laya-ledgar | 421 M | 768 tokens | 87,0 | 81,4 | Apache 2.0 | Sí (ECE 0,042; umbral 0,9806) |
| BERT (LexGLUE) | 110–149 M | 512 tokens | 87,6 | 81,8 | no disponible en la información | No evaluado en LexGLUE |
| Legal-BERT (LexGLUE) | 110–149 M | 512 tokens | 88,2 | 83,0 | no disponible en la información | No evaluado en LexGLUE |
| CaseLaw-BERT (LexGLUE) | 110–149 M | 512 tokens | 88,3 | 83,0 | no disponible en la información | No evaluado en LexGLUE |
| RoBERTa-large (LexGLUE) | no disponible | 512 tokens | 88,6 | 83,6 | no disponible en la información | No evaluado en LexGLUE |

laya-ledgar iguala al TF-IDF SVM en micro-F1 y macro-F1 (87,0 / 81,4) y queda por detrás de todos los modelos BERT-style en 0,6–1,6 puntos de micro-F1 y 0,4–2,2 puntos de macro-F1. Su intervalo de confianza al 95% (86,3–87,6%) incluye el micro-F1 del SVM y de BERT, pero no los de Legal-BERT, CaseLaw-BERT ni RoBERTa-large. Su ventaja diferencial es la calibración de la confianza y el umbral de predicción selectiva, que LexGLUE no evalúa.

## Limitaciones y advertencias

- No es asesoramiento jurídico: el modelo indica qué tipo de provisión es un párrafo, no si es justa, válida o estándar. La model card lo declara explícitamente.
- Solo inglés y solo contratos de jurisdicción estadounidense (provisiones presentadas ante la SEC).
- Confusión sistemática entre tipos casi gemelos: applicable laws frente a governing laws (35 errores de 53 casos), indemnity frente a indemnifications, venues, y las categorías comodín (general, agreements, miscellaneous) rondan el 53–54% de acierto.
- Ligero exceso de confianza: declara 0,907 de media y acierta el 87,0%; la calibración es buena pero no perfecta.
- Contaminación por boilerplate: 282 de las 10.000 provisiones de test aparecen literalmente en el entrenamiento, lo que infla ligeramente la métrica global (97,9% en esas frente a 86,7% en el resto).
- Truncamiento de provisiones largas: solo se leen los primeros 481 tokens del texto; el 2,5% de las provisiones de test superan ese límite.
- El resultado de test se obtuvo leyendo el test dos veces, lo que introduce un sesgo optimista frente a los resultados publicados de LexGLUE.
- Los resultados de benchmarks están declarados por el autor y no verificados de forma independiente (`verified: false`).
- Licencia Apache 2.0: permite uso comercial, pero al ser un fine-tune de convaiinnovations/laya conviene revisar las condiciones del modelo base.
- Modelo con 0 descargas y 1 like en el momento de la ficha: ecosistema y soporte comunitario mínimos.
- Dependencia de una librería propietaria (`laya`) para la carga y la inferencia; no se documenta compatibilidad con ecosistemas estándar como transformers, vLLM o llama.cpp.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VibeHash/laya-ledgar
- Modelo base Laya: https://huggingface.co/convaiinnovations/laya
- Dataset LexGLUE: https://huggingface.co/datasets/coastalcph/lex_glue
- Paper de LexGLUE (Chalkidis et al. 2022): no disponible en la información proporcionada
- Repositorio o documentación de la librería `laya`: no disponible en la información proporcionada
