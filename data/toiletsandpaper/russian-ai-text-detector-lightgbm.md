# toiletsandpaper/russian-ai-text-detector-lightgbm

## Resumen

`russian-ai-text-detector-lightgbm` es un clasificador binario que estima la probabilidad de que un texto en ruso haya sido escrito por un modelo de lenguaje y no por una persona. Lo publica el usuario de HuggingFace `toiletsandpaper` y forma parte del ecosistema del proyecto `aiw-ru` (avoid-ai-writing-russian), del que reutiliza el extractor de características. No es un modelo generativo ni un transformer: es un clasificador LightGBM entrenado sobre aproximadamente 100 características estilométricas y léxicas tabulares, con un fichero de modelo de unos 10 MB que se ejecuta únicamente en CPU.

El problema que resuelve es la detección de texto generado por IA en ruso, un idioma con menos herramientas específicas que el inglés. El corpus de entrenamiento (LLMTrace classification, parte rusa) cubre generaciones de ChatGPT (GPT-3.5, GPT-4, GPT-4o, o1, o3), GigaChat, YandexGPT, Qwen, Llama, Gemma, DeepSeek, Mistral y Command R, entre otros. Las características empleadas incluyen muletillas y lenguaje administrativo típico de la IA («является», «играет ключевую роль», «в рамках»), longitud y ritmo de las frases, diversidad léxica, puntuación y frecuencias de palabras funcionales.

Es relevante ahora porque demuestra que la detección de texto sintético en ruso se puede abordar con un modelo interpretable, entrenable en CPU y de 10 MB, en lugar de con otro transformer grande. En el conjunto de test declara ROC AUC 0,9431 y accuracy 0,8678, con un rendimiento especialmente alto en relatos (ROC AUC 0,9665) y reseñas (0,9601) y más flojo en noticias (0,8898) y textos factuales (0,8957).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LightGBM (gradient boosting sobre arboles de decision) aplicado a ~100 caracteristicas estilometricas y lexicas tabulares del extractor aiw-ru |
| Parametros totales | no disponible (numero de arboles no especificado; fichero de modelo de ~10 MB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (depende del preprocesado y la extraccion de caracteristicas de aiw-ru; no documentada) |
| Tipos de cuantizacion | no aplica (no es una red neuronal; no se publican variantes cuantizadas) |
| Idiomas soportados | ruso (ru) |
| Licencia | MIT |
| Formato de pesos | no disponible (se distribuye como modelo de la libreria `lightgbm`; no se especifica el formato exacto del artefacto) |
| Pipeline declarado | text-classification |
| Tipo de salida | probabilidad / etiqueta binaria (ai vs. human) |
| Hardware requerido | CPU unicamente |

## Arquitectura y entrenamiento

El modelo no es una red neuronal. Se trata de un clasificador LightGBM, es decir, un ensemble de arboles de decision entrenado por gradient boosting sobre un vector de aproximadamente 100 caracteristicas tabulares extraidas del texto por el detector `aiw-ru`. Entre esas caracteristicas figuran marcadores de estilo administrativo y muletillas asociadas a la IA, estadisticas de longitud y ritmo de las frases, medidas de diversidad y riqueza lexica, patrones de puntuacion y frecuencias de palabras funcionales. Al operar sobre caracteristicas interpretables, el modelo permite auditar que senales han pesado en cada decision, algo que un detector neuronal opaco no ofrece.

Los datos proceden de la parte rusa del corpus LLMTrace classification (paper arXiv:2509.21269). El entrenamiento uso 237.929 textos; el numero de arboles se selecciono minimizando la perdida sobre 49.747 textos de validacion, y las metricas finales se calcularon sobre 52.521 textos de test no vistos durante el entrenamiento (21.417 de clase humana y 31.104 de clase IA). El umbral de decision publicado es 0,5. El autor documenta el proceso completo, con comandos de reproduccion, en el repositorio `avoid-ai-writing-russian`. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa, que no aplican a este tipo de modelo.

## Capacidades

- Clasificacion binaria de texto en ruso: devuelve probabilidad y etiqueta (texto escrito por IA o por persona).
- Deteccion de texto generado por una amplia variedad de LLM: ChatGPT (GPT-3.5, GPT-4, GPT-4o, o1, o3), GigaChat, YandexGPT, Qwen, Llama, Gemma, DeepSeek, Mistral y Command R, entre otros presentes en LLMTrace.
- Funciona sobre generos diversos: articulos, noticias, textos factuales, poesia, respuestas a preguntas, resenas, textos cortos y relatos.
- Inferencia en CPU sin GPU y sin dependencias de transformers.
- Interpretabilidad: las caracteristicas subyacentes son estilometricas y lexicas, auditables individualmente.
- Deteccion de "AI slop" y filtrado de contenido sintetico en ruso.
- No soporta tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento: es un clasificador, no un modelo generativo.
- No genera texto ni mantiene conversaciones.

## Casos de uso

- Moderacion de contenido en plataformas en ruso: el clasificador puede ejecutarse en CPU sobre cada envio para marcar textos sospechosos de ser generados por IA antes de la revision humana, con un coste de computo minimo al no requerir GPU.
- Verificacion editorial en medios de comunicacion: un medio que recibe articulos o columnas en ruso puede pasar los originales por el detector y usar la probabilidad como senal de alerta; el ROC AUC de 0,9632 en la categoria "article" respalda este uso.
- Filtrado de resenas falsas en comercio electronico: con ROC AUC 0,9601 en la categoria "review", el modelo es adecuado para priorizar resenas sospechosas de generacion automatica en catalogos con miles de opiniones.
- Analisis de respuestas en plataformas educativas o de encuestas: ROC AUC 0,9514 en la categoria "question" permite detectar respuestas generadas por LLM en cuestionarios abiertos en ruso.
- Integracion en pipelines de datos como etapa de etiquetado: al ser un modelo LightGBM de 10 MB, se puede empaquetar en un contenedor ligero y ejecutar en lote sobre corpus grandes para etiquetar o limpiar datasets de entrenamiento contaminados con texto sintetico.
- Auditoria de contenidos generados por otros sistemas: un equipo que despliega un LLM en ruso puede usar este detector como comprobacion cruzada de sus propias salidas, por ejemplo en pruebas de regresion que verifiquen que el estilo del modelo no se ha degradado hacia plantillas reconocibles.
- Investigacion en estilometria y deteccion de IA: sirve como linea base interpretable contra la que comparar detectores neuronales, ya que cada caracteristica puede analizarse por separado.
- Filtrado previo a la curación de corpus: descartar textos sinteticos antes de usar un corpus ruso para entrenar otros modelos, reduciendo el riesgo de colapso por datos generados.

## Benchmarks y rendimiento

Resultados declarados por el autor en la model card (`verified: false`), sobre el split de test de `iitolstykh/LLMTrace_classification` (52.521 textos) con umbral 0,5.

| Metrica | Valor |
|---|---|
| Accuracy | 0,8678 |
| ROC AUC | 0,9431 |
| Macro F1 | 0,8631 |
| Precision (clase IA) | 0,8869 |
| Recall (clase IA) | 0,8904 |
| F1 (clase IA) | 0,8886 |
| Precision (clase humana) | 0,8399 |
| Recall (clase humana) | 0,8351 |
| F1 (clase humana) | 0,8375 |
| ROC AUC (human vs generated from scratch) | 0,9464 |

Desglose por genero (split de test):

| Categoria | Accuracy | ROC AUC |
|---|---|---|
| Article | 0,8928 | 0,9632 |
| Factual | 0,8101 | 0,8957 |
| News | 0,7970 | 0,8898 |
| Poetry | 0,8546 | 0,9322 |
| Question | 0,8980 | 0,9514 |
| Review | 0,8935 | 0,9601 |
| Short_form | 0,8397 | 0,9420 |
| Story | 0,8989 | 0,9665 |

Split de validacion: accuracy 0,8674 y ROC AUC 0,9422.

Desglose por clase en test segun la model card: 21.417 textos humanos con precision 0,840, recall 0,835 y F1 0,837; 31.104 textos de IA con precision 0,887, recall 0,890 y F1 0,889.

No se han publicado en la informacion disponible comparaciones con otros detectores sobre el mismo conjunto de evaluacion.

## Requisitos de hardware

- VRAM: no aplica; el modelo se ejecuta en CPU y no requiere GPU.
- GPU recomendadas: ninguna. Cualquier CPU moderna es suficiente; el cuello de botella es la extraccion de caracteristicas de aiw-ru, no el clasificador.
- Cabida en hardware de consumo: si, en cualquier equipo de consumo con CPU, dado que el artefacto pesa alrededor de 10 MB.
- Memoria RAM: no disponible de forma explicita; al tratarse de un modelo LightGBM de ~10 MB, el consumo es bajo en comparacion con cualquier transformer, pero no se publican cifras concretas.
- Opciones de despliegue: runtime de `lightgbm` en Python; no es compatible con vLLM, llama.cpp, Ollama ni TGI, que estan orientados a modelos generativos. La model card declara `inference: false` en los metadatos, es decir, no esta expuesto como inferencia alojada en HuggingFace.
- Latencia y throughput: no disponible. Al ser un modelo de arboles sobre caracteristicas tabulares, cabe esperar inferencia muy rapida en CPU, pero no se publican mediciones.
- Almacenamiento: el modelo ocupa aproximadamente 10 MB, mas el espacio necesario para las dependencias del extractor de caracteristicas.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Idiomas | Licencia | Disponibilidad | Rendimiento declarado |
|---|---|---|---|---|---|---|
| toiletsandpaper/russian-ai-text-detector-lightgbm | LightGBM sobre caracteristicas estilometricas | no disponible (~10 MB) | ru | MIT | HuggingFace, aviso `inference: false` | Accuracy 0,8678; ROC AUC 0,9431 |
| toiletsandpaper/aiw-ru-lightgbm | LightGBM (mismo autor y ecosistema) | no disponible | ru | no disponible en la informacion recogida | HuggingFace | no disponible |
| k1y0miiii/ru-ai-text-detector (repo + Space) | Detector de texto IA en ruso con senales explicadas | no disponible | ru | no disponible en la informacion recogida | GitHub y HuggingFace Spaces | no disponible |
| ZeroGPT Plus Russian AI Detector | Servicio web propietario | no aplica (cerrado) | ru | propietaria | Solo via web | no disponible |
| Evernote Russian AI Detector | Servicio web propietario | no aplica (cerrado) | ru | propietaria | Solo via web | no disponible |

Las alternativas de servicio web no publican pesos ni metricas verificables, por lo que la comparacion cuantitativa no es posible con los datos disponibles. Frente a ellas, la principal ventaja de este modelo es la licencia MIT, la ejecucion local sin llamadas a servicios externos y el caracter interpretable de sus caracteristicas.

## Limitaciones y advertencias

- Es un clasificador binario, no un modelo conversacional ni generativo; no sirve para redactar, resumir ni responder preguntas.
- Solo cubre el ruso. No hay soporte declarado para otros idiomas.
- Sesgos de dominio: el rendimiento cae en noticias (accuracy 0,7970) y textos factuales (0,8101), frente a relatos (0,8989) y respuestas a preguntas (0,8980). En esos generos el detector sera menos fiable.
- Sensibilidad al estilo: un texto humano con rasgos administrativos o con muletillas comunes puede clasificarse como IA, y un texto de IA reescrito o parafraseado manualmente puede escaparse. La precision sobre la clase humana es de 0,8399, con un 16 % aproximadamente de falsos positivos en esa clase segun el recall declarado.
- Obsolescencia frente a nuevos modelos: el entrenamiento cubre una lista concreta de LLM (GPT-3.5, GPT-4, GPT-4o, o1, o3, GigaChat, YandexGPT, Qwen, Llama, Gemma, DeepSeek, Mistral, Command R y otros). Generaciones posteriores o modelos con estilos distintos pueden degradar el rendimiento.
- Riesgo de alucinacion: no aplica, porque el modelo no genera texto; su riesgo es de clasificacion erronea, no de fabricacion de contenido.
- Advertencia de uso etico y legal: usar un detector de IA para acusar a una persona de fraude academico o de plagio sin corroboracion adicional es arriesgado; las metricas declaradas no son suficientemente altas como para sostener decisiones automatizadas sin revision humana.
- Metricas no verificadas: todos los resultados del `model-index` figuran con `verified: false`, es decir, son declaraciones del autor y no han sido reproducidas de forma independiente.
- Licencia MIT: permite uso comercial y modificacion, pero conviene revisar tambien las condiciones del corpus LLMTrace y del proyecto `aiw-ru`, de los que el modelo depende.
- El modelo se describe como opcional dentro de `aiw-ru`: los flujos de trabajo de ese proyecto funcionan sin el.
- Trazabilidad limitada: no se publican el numero de arboles, los hiperparametros finales ni el formato exacto del artefacto de pesos, lo que dificulta la reproduccion exacta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/toiletsandpaper/russian-ai-text-detector-lightgbm
- Modelo relacionado del mismo autor: https://huggingface.co/toiletsandpaper/aiw-ru-lightgbm
- Dataset de entrenamiento (LLMTrace classification, ru): https://huggingface.co/datasets/iitolstykh/LLMTrace_classification
- Paper del corpus LLMTrace: https://arxiv.org/abs/2509.21269
- Repositorio del proyecto aiw-ru: https://github.com/ormeilu/avoid-ai-writing-russian
- Script de entrenamiento: https://github.com/ormeilu/avoid-ai-writing-russian/blob/master/scripts/train.py
- Informe de entrenamiento del modelo: https://github.com/ormeilu/avoid-ai-writing-russian/blob/master/docs/models/russian-ai-text-detector-lightgbm.md
- Proyecto alternativo de deteccion de texto IA en ruso (GitHub): https://github.com/k1y0miiii/ru-ai-text-detector
- Demo alternativa en HuggingFace Spaces: https://huggingface.co/spaces/k1y0mi/ru-ai-text-detector
- Herramienta comercial de referencia (ZeroGPT Plus, ruso): https://www.zerogpt.plus/en/russian-ai-detector-tool
- Herramienta comercial de referencia (Evernote, ruso): https://evernote.com/ai-detector/russian-ai-detector
