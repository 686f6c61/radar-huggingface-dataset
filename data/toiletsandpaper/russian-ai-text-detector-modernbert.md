# toiletsandpaper/russian-ai-text-detector-modernbert

## Resumen

`russian-ai-text-detector-modernbert` es un clasificador binario de texto en ruso que estima la probabilidad de que un fragmento haya sido escrito por un modelo de lenguaje en lugar de por una persona. Lo desarrolla el autor independiente `toiletsandpaper` como parte del ecosistema de herramientas `aiw-ru` (avoid-ai-writing-russian), un conjunto de utilidades para detectar y reescribir texto generado por IA en ruso. El modelo parte del encoder `deepvk/RuModernBERT-small` y se afina sobre la parte rusa del corpus LLMTrace.

La relevancia práctica del modelo está en su perfil de despliegue: con 34,5 millones de parámetros y exportación a ONNX, funciona en CPU mediante `onnxruntime` sin necesidad de PyTorch ni GPU. El archivo `model.onnx` en fp32 ocupa 140 MB y el `model_int8.onnx` apenas 36,3 MB, lo que permite integrarlo en filtros de contenido, pipelines editoriales o extensiones de navegador con requisitos de infraestructura mínimos.

El modelo se entrenó con textos generados por ChatGPT (GPT-3.5, GPT-4, GPT-4o, o1, o3), GigaChat, YandexGPT, Qwen, Llama, Gemma, DeepSeek, Mistral y Command R, entre otros, lo que amplía su cobertura más allá de un único proveedor. En la partición de test del corpus declara un ROC AUC de 0,993 y una accuracy de 0,963, con un rendimiento especialmente alto en reseñas y relatos y algo más bajo en textos factuales y de formato corto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (ModernBERT), afinado para clasificacion binaria |
| Parametros totales | 34.540.034 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | fp32 (ONNX principal), int8 (export opcional `model_int8.onnx`); pesos PyTorch en safetensors |
| Idiomas soportados | ruso (ru) |
| Licencia | Apache 2.0 |
| Formato de pesos | ONNX (`model.onnx`, `model_int8.onnx`), safetensors (`model.safetensors`) |

## Arquitectura y entrenamiento

El modelo es un encoder ModernBERT (`deepvk/RuModernBERT-small`) con una cabeza de clasificacion de dos clases (`ai` / `human`). Se trata de un ajuste fino supervisado sobre la parte rusa del corpus LLMTrace (`iitolstykh/LLMTrace_classification`), que combina textos humanos con textos generados por una amplia familia de LLM. El repositorio incluye los pesos PyTorch en `model.safetensors` (138 MB) para quien quiera reentrenar o exportar a otro formato, ademas de los dos artefactos ONNX listos para inferencia.

La exportacion a ONNX con pesos fp32 es la via recomendada por el autor: el export int8 cambia la etiqueta predicha en el 1,0 % de los textos de validacion, por lo que la herramienta `aiw-ru` descarga el fp32 por defecto. El script de entrenamiento esta publicado en el repositorio `ormeilu/avoid-ai-writing-russian` (`scripts/train_transformer.py`), lo que facilita reproducir el ajuste. No se detallan en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si se aplicaron tecnicas de RLHF o DPO (no aplicables a un encoder de clasificacion).

## Capacidades

- Clasificacion binaria de texto en ruso: distingue entre texto escrito por humanos y texto generado por IA.
- Deteccion multi-proveedor: entrenado con salidas de ChatGPT (GPT-3.5, GPT-4, GPT-4o, o1, o3), GigaChat, YandexGPT, Qwen, Llama, Gemma, DeepSeek, Mistral y Command R.
- Analisis estilometrico implicito: el modelo aprende patrones de estilo y estructura propios del texto generado, sin necesidad de metadatos ni marcas de agua.
- Cobertura de generos: articulos, noticias, resenas, poesia, relatos, respuestas a preguntas y textos de formato corto.
- Inferencia en CPU: ejecucion con `onnxruntime` sin torch ni GPU.
- Integracion en herramientas: pensado como componente opcional del ecosistema `aiw-ru` (`aiw-ru models install modernbert`).
- No soporta generacion de texto, tool calling, agentes ni capacidades multimodales: es exclusivamente un clasificador.

## Casos de uso

- Moderacion de contenido en plataformas rusohablantes: el clasificador puede ejecutarse en CPU sobre cada publicacion o comentario para marcar contenido sospechoso de generacion automatica antes de la revision humana, con un coste de infraestructura minimo gracias al archivo ONNX de 140 MB.
- Filtrado de "AI slop" en agregadores y foros: integrado como paso previo al ranking o a la publicacion, permite descartar o etiquetar textos masivos generados por LLM en ruso, un problema creciente en comunidades de noticias y blogs.
- Verificacion editorial en medios: un periodista o editor puede pasar un articulo recibido por el modelo para obtener una probabilidad de autoria artificial; la accuracy declarada en la categoria `article` es 0,9663 y el ROC AUC 0,9936.
- Deteccion de resenas falsas en e-commerce: la categoria `review` es la de mejor rendimiento declarado (accuracy 0,9788, ROC AUC 0,995), lo que lo hace adecuado para senalar resenas generadas por IA en tiendas y marketplaces.
- Analisis de trabajos academicos y respuestas: con accuracy 0,9687 en la categoria `question`, sirve para revisar respuestas generadas en plataformas educativas o formularios.
- Preprocesado en pipelines de datos: como clasificador ligero, puede usarse para etiquetar grandes volumenes de texto ruso (scraping, datasets de entrenamiento) y separar muestras humanas de muestras sinteticas antes de entrenar otros modelos.
- Extension de navegador o plugin de escritorio: el tamano reducido del modelo int8 (36,3 MB) permite despliegues locales en el cliente para avisar al usuario cuando el texto que lee o escribe tiene alta probabilidad de ser generado por IA.

## Benchmarks y rendimiento

Resultados declarados por el autor (no verificados de forma independiente) sobre el split de test del corpus LLMTrace classification (ru):

| Metrica | Valor |
|---|---|
| Accuracy | 0,9635 |
| ROC AUC | 0,993 |
| Macro F1 | 0,9623 |
| Precision (AI) | 0,9763 |
| Recall (AI) | 0,9616 |
| F1 (AI) | 0,9689 |
| Precision (human) | 0,9455 |
| Recall (human) | 0,9661 |
| F1 (human) | 0,9557 |

Desglose por categoria (test):

| Categoria | Accuracy | ROC AUC |
|---|---|---|
| Article | 0,9663 | 0,9936 |
| Factual | 0,9432 | 0,9863 |
| News | 0,9548 | 0,9926 |
| Poetry | 0,9597 | 0,9893 |
| Question | 0,9687 | 0,9943 |
| Review | 0,9788 | 0,995 |
| Short form | 0,9409 | 0,989 |
| Story | 0,9729 | 0,9946 |
| Human vs generado desde cero | no disponible | 0,994 |

Particion de validacion: accuracy 0,9642 y ROC AUC 0,9934.

Comparacion interna declarada por el autor: el detector LightGBM sobre caracteristicas de `aiw-ru` obtiene ROC AUC 0,943, frente al 0,993 de este modelo.

## Requisitos de hardware

- VRAM: no requiere GPU; el modelo esta pensado para inferencia en CPU.
- Memoria RAM: el archivo ONNX fp32 ocupa 140 MB en disco y puede cargarse en memoria de forma holgada en cualquier maquina; el int8 ocupa 36,3 MB.
- GPU recomendadas: no aplica; cualquier GPU es innecesaria para este modelo. En caso de querer acelerar, `onnxruntime` admite proveedores de ejecucion CUDA o CoreML, pero no es el escenario previsto.
- Cabe en cualquier equipo consumer: portatiles, servidores pequenos, contenedores sin GPU e incluso navegador (via ONNX Runtime Web) con el export int8.
- Opciones de despliegue: `onnxruntime` (Python, C++, JS), integracion en `aiw-ru` mediante `aiw-ru models install modernbert`, o carga de los pesos safetensors con Transformers para reentrenamiento.
- Latencia y throughput: no disponibles en la informacion proporcionada; por el tamano del modelo (34,5 M de parametros) se espera inferencia del orden de milisegundos por texto en CPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | ROC AUC (LLMTrace ru) | Licencia | Formato |
|---|---|---|---|---|---|
| russian-ai-text-detector-modernbert | 34,5 M | no disponible | 0,993 | Apache 2.0 | ONNX, safetensors |
| russian-ai-text-detector-bert | no disponible | no disponible | no disponible | no disponible | no disponible |
| russian-ai-text-detector-mini-frida | no disponible | no disponible | no disponible | no disponible | no disponible |
| russian-ai-text-detector-lightgbm | no disponible (modelo de caracteristicas) | no aplica | 0,943 | no disponible | no disponible |

Las tres alternativas pertenecen al mismo autor y al mismo ecosistema `aiw-ru`; la informacion disponible no incluye sus especificaciones detalladas ni sus resultados completos, por lo que la comparacion se limita al dato de ROC AUC del detector LightGBM (0,943) frente al 0,993 de este modelo. No se dispone de comparativas con detectores de terceros en la informacion proporcionada.

## Limitaciones y advertencias

- Solo ruso: el modelo no esta entrenado para otros idiomas y no debe usarse con textos en castellano u otras lenguas.
- Sesgo de corpus: entrenado sobre LLMTrace, por lo que su rendimiento puede degradarse con modelos de lenguaje no representados en el corpus o con tecnicas de parafraseo humano.
- Riesgo de falsos positivos: la precision sobre la clase `human` es 0,9455, la metrica mas baja del conjunto; un 5,5 % de los textos humanos clasificados como IA en el conjunto de test.
- No es una prueba definitiva: la salida es una probabilidad estadistica, no una evidencia; no deberia usarse como unico criterio para sancionar, suspender cuentas o acusar de fraude academico.
- Alucinacion no aplica en el sentido generativo, pero si existe riesgo de clasificacion erronea en generos poco representados (textos factuales y de formato corto son los de menor accuracy: 0,9432 y 0,9409).
- Deriva temporal: los textos generados por modelos futuros pueden no parecerse a los del corpus de entrenamiento, lo que reduce la eficacia con el tiempo.
- Cuantizacion int8: cambia la etiqueta en el 1,0 % de los textos de validacion; para uso critico se recomienda el export fp32.
- Licencia Apache 2.0: permite uso comercial y modificacion, pero conviene revisar las condiciones del corpus LLMTrace y del modelo base `deepvk/RuModernBERT-small` para usos derivados.
- Resultados no verificados: todas las metricas son declaradas por el autor (`verified: false`) y no se han reproducido de forma independiente en la informacion disponible.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/toiletsandpaper/russian-ai-text-detector-modernbert
- Modelo base: https://huggingface.co/deepvk/RuModernBERT-small
- Dataset de entrenamiento: https://huggingface.co/datasets/iitolstykh/LLMTrace_classification
- Repositorio aiw-ru (script de entrenamiento): https://github.com/ormeilu/avoid-ai-writing-russian
- Script de entrenamiento: https://github.com/ormeilu/avoid-ai-writing-russian/blob/master/scripts/train_transformer.py
- Modelo alternativo bert: https://huggingface.co/toiletsandpaper/russian-ai-text-detector-bert
- Modelo alternativo mini-frida: https://huggingface.co/toiletsandpaper/russian-ai-text-detector-mini-frida
- Modelo alternativo LightGBM: https://huggingface.co/toiletsandpaper/russian-ai-text-detector-lightgbm
- Paper referenciado (arXiv:2509.21269): https://arxiv.org/abs/2509.21269
- Paper referenciado (arXiv:2412.13663): https://arxiv.org/abs/2412.13663
