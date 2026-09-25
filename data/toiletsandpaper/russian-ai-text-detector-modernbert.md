# toiletsandpaper/russian-ai-text-detector-modernbert

## Resumen

`russian-ai-text-detector-modernbert` es un clasificador binario de texto en ruso que estima la probabilidad de que un texto haya sido escrito por un modelo de lenguaje en lugar de por una persona. Lo desarrolla el autor `toiletsandpaper` dentro del proyecto `aiw-ru` (`avoid-ai-writing-russian`) y se distribuye como un ajuste fino del encoder `deepvk/RuModernBERT-small`, con 34,5 millones de parametros y exportado a ONNX en fp32 (140 MB) e int8 (36,1 MB).

El modelo resuelve un problema muy concreto: el filtrado de "AI slop" en ruso, es decir, la deteccion de articulos, noticias, resenas, respuestas y publicaciones generadas por asistentes como ChatGPT, GigaChat, YandexGPT, Qwen, Llama, Gemma, DeepSeek, Mistral o Command R. Su relevancia practica esta en el coste de despliegue: al ser un encoder pequeno exportado a ONNX, funciona en CPU con `onnxruntime`, sin PyTorch ni GPU, lo que permite integrarlo en pipelines de moderacion a gran escala.

Frente a la alternativa del propio proyecto basada en LightGBM sobre caracteristicas estilometricas (ROC AUC 0,943), este modelo alcanza ROC AUC 0,993 y accuracy 0,962 en la particion de test del corpus LLMTrace, con un rendimiento estable por genero textual (entre 0,9409 y 0,9743 de accuracy). Es, por tanto, la opcion de mayor calidad de la familia `aiw-ru`, y opcional dentro de la herramienta: solo se instala bajo peticion explicita.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Encoder transformer (ModernBERT), ajuste fino de `deepvk/RuModernBERT-small` |
| Parametros totales | 34,5 millones |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible (la model card no especifica la ventana de tokens) |
| Tipos de cuantizacion | fp32 (`model.onnx`) e int8 (`model_int8.onnx`) |
| Idiomas soportados | ruso (ru) |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (ejecucion con `onnxruntime`; soporta `text-embeddings-inference`) |

Otros datos de interes: tarea `text-classification`, tamano del repositorio 0,2 GB, fecha de creacion 25 de septiembre de 2026, modelo base `deepvk/RuModernBERT-small` (relacion `finetune`), dataset de entrenamiento y evaluacion `iitolstykh/LLMTrace_classification`.

## Arquitectura y entrenamiento

Se trata de un ajuste fino de `deepvk/RuModernBERT-small`, un encoder transformer de 34,5 millones de parametros especializado en ruso. La model card no documenta la configuracion interna del fine-tuning (numero de capas activas, dimension oculta, cabezas de atencion) ni el numero exacto de tokens de entrenamiento; se sabe que el punto de partida es la familia ModernBERT, un encoder disenado para sustituir a BERT en tareas de comprension, pero no se confirman detalles de configuracion especificos de esta variante.

El entrenamiento se realizo sobre la parte rusa del corpus LLMTrace (`iitolstykh/LLMTrace_classification`), que contiene textos generados por ChatGPT (GPT-3.5, GPT-4, GPT-4o, o1, o3), GigaChat, YandexGPT, Qwen, Llama, Gemma, DeepSeek, Mistral y Command R, junto con textos humanos. El script de entrenamiento esta publicado en `aiw-ru` (`scripts/train_transformer.py`). No hay informacion disponible sobre el uso de RLHF, DPO u otras tecnicas de alineacion, algo esperable en un clasificador y no en un modelo generativo.

Como innovacion de despliegue, el autor exporta el modelo a ONNX con pesos fp32 y ofrece una variante int8 opcional. La eleccion por defecto es fp32 porque la cuantizacion int8 cambia la etiqueta predicha en el 1,1 % de los textos de validacion, un compromiso entre un modelo de 140 MB y uno de 36,1 MB.

## Capacidades

- Clasificacion binaria de texto ruso en dos clases: `ai` y `human`, con salida de probabilidad asociada.
- Deteccion de texto generado por multiples familias de LLM: ChatGPT (GPT-3.5, GPT-4, GPT-4o, o1, o3), GigaChat, YandexGPT, Qwen, Llama, Gemma, DeepSeek, Mistral y Command R.
- Robustez por genero textual: la model card reporta metricas desagregadas para articulo, texto factual, noticia, poesia, pregunta, resena, texto corto y relato.
- Analisis estilometrico implicito: el modelo aprende rasgos de estilo que discriminan texto humano de texto generado.
- Inferencia en CPU mediante `onnxruntime`, sin dependencia de PyTorch ni de GPU.
- Integracion en la CLI `aiw-ru` (`aiw-ru classify --model modernbert`) y compatibilidad declarada con `text-embeddings-inference`.
- No soporta generacion de texto, tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni capacidades multimodales: es un clasificador, no un modelo generativo.
- No es multilingue: unicamente ruso.

## Casos de uso

- Moderacion de contenido en plataformas editoriales y redes sociales en ruso: el modelo puntua cada texto con una probabilidad de ser generado por IA, lo que permite filtrar o marcar contenido masivo de bajo esfuerzo ("AI slop") con un coste de computo minimo al ejecutarse en CPU.
- Verificacion editorial en medios de comunicacion: permite revisar si una columna, nota de prensa o articulo recibido ha sido producido por un LLM antes de publicarlo, con una precision del 0,97 sobre la clase `ai`.
- Limpieza y filtrado de corpus de entrenamiento: al clasificar grandes volumenes de texto ruso, sirve para descartar documentos generados sinteticamente y evitar contaminacion en datasets propios de investigacion o de ajuste de modelos.
- Deteccion de resenas falsas en comercio electronico: el genero "review" es uno de los mejor resueltos (accuracy 0,9743, ROC AUC 0,9954), lo que lo hace adecuado para auditar resenas de producto escritas por LLM.
- Analisis de respuestas en foros y plataformas de preguntas y respuestas: el genero "question" alcanza accuracy 0,9724, lo que permite marcar respuestas automatizadas en comunidades tecnicas o de soporte.
- Asistencia a la escritura con la herramienta `aiw-ru`: el modelo se integra como comprobador opcional que avisa al autor cuando su borrador presenta rasgos propios de texto generado por IA, sin bloquear el flujo de trabajo.
- Deteccion academica de trabajos generados por IA: util como senal adicional en la revision de ensayos y trabajos en ruso, teniendo en cuenta su caida de rendimiento en textos cortos (accuracy 0,9409).
- Monitorizacion de poesia y narrativa generada: los generos "poetry" y "story" se evaluan por separado con accuracy 0,9578 y 0,9668, lo que habilita la revision de plataformas literarias.

## Benchmarks y rendimiento

Todos los valores proceden del `model-index` declarado por el autor, marcados como no verificados (`verified: false`). El conjunto de evaluacion es la particion de test de `iitolstykh/LLMTrace_classification`.

| Metrica | Valor |
|---|---|
| Accuracy | 0,962 |
| ROC AUC | 0,993 |
| Macro F1 | 0,9607 |
| Precision (clase `ai`) | 0,97 |
| Recall (clase `ai`) | 0,9657 |
| F1 (clase `ai`) | 0,9678 |
| Precision (clase `human`) | 0,9505 |
| Recall (clase `human`) | 0,9566 |
| F1 (clase `human`) | 0,9535 |
| ROC AUC (humano frente a generado desde cero) | 0,9938 |

Desglose por genero textual (particion de test):

| Genero | Accuracy | ROC AUC |
|---|---|---|
| Articulo | 0,9657 | 0,9953 |
| Factual | 0,9349 | 0,9841 |
| Noticia | 0,9569 | 0,9922 |
| Poesia | 0,9578 | 0,9908 |
| Pregunta | 0,9724 | 0,9951 |
| Resena | 0,9743 | 0,9954 |
| Texto corto | 0,9409 | 0,985 |
| Relato | 0,9668 | 0,9948 |

Particion de validacion:

| Metrica | Valor |
|---|---|
| Accuracy | 0,963 |
| ROC AUC | 0,9935 |

Comparacion interna del proyecto: el detector basado en LightGBM sobre caracteristicas estilometricas de `aiw-ru` obtiene ROC AUC 0,943, frente al 0,993 de este modelo.

## Requisitos de hardware

- VRAM para inferencia: no disponible como dato declarado, pero al ser un encoder de 34,5 millones de parametros en ONNX, la inferencia puede ejecutarse integramente en CPU con `onnxruntime`.
- Peso en disco: 140 MB para `model.onnx` (fp32) y 36,1 MB para `model_int8.onnx` (int8); el repositorio completo ocupa 0,2 GB.
- GPU recomendadas: no se declara ninguna; el modelo no necesita GPU. Cualquier GPU consumer (por ejemplo una RTX 4090 o inferior) puede ejecutarlo, pero es sobredimensionada para esta carga.
- Cabida en hardware consumer: si, en cualquier CPU moderna e incluso en dispositivos de gama baja, dado el tamano del modelo. No se especifica soporte para aceleradores tipo Coral o NPU.
- Opciones de despliegue: `onnxruntime` en CPU, la CLI de `aiw-ru` (`aiw-ru models install modernbert`, `aiw-ru classify --model modernbert`) y `text-embeddings-inference` (etiqueta declarada en el repositorio).
- Latencia y throughput estimados: no disponibles; la model card no publica cifras de latencia ni de textos por segundo.
- Nota sobre cuantizacion: la variante int8 reduce el tamano a aproximadamente una cuarta parte, pero la herramienta `aiw-ru` no la descarga por defecto porque altera la etiqueta predicha en el 1,1 % de los textos de validacion.

## Comparativa con modelos similares

La comparacion natural es con el resto de detectores del proyecto `aiw-ru`. Para las alternativas externas de deteccion de texto generado en ruso no se dispone de datos en la informacion proporcionada.

| Modelo | Base | Parametros | ROC AUC | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `russian-ai-text-detector-modernbert` | RuModernBERT-small, ONNX | 34,5 M | 0,993 (test) | apache-2.0 | HuggingFace, ONNX, CPU |
| `russian-ai-text-detector-bert` | transformer (BERT) | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| `russian-ai-text-detector-mini-frida` | mini-frida | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace |
| `russian-ai-text-detector-lightgbm` | LightGBM sobre caracteristicas `aiw-ru` | no aplica | 0,943 | no disponible en la informacion proporcionada | HuggingFace |

## Limitaciones y advertencias

- Idiomas: solo ruso. No debe esperarse un comportamiento correcto en otros idiomas.
- Sesgo de corpus: el modelo se entrena con las familias de LLM presentes en LLMTrace. Modelos mas recientes, versiones ajustadas o textos generados con prompts muy especificos pueden escapar a la deteccion.
- Falsos positivos sobre texto humano formal: la precision sobre la clase `human` es 0,9505, la metrica mas baja del conjunto, lo que implica que aproximadamente uno de cada veinte textos humanos podria clasificarse como generado por IA. No debe usarse como prueba concluyente en contextos disciplinarios.
- Textos cortos y contenido factual: son los generos con peor rendimiento (accuracy 0,9409 en `short_form` y 0,9349 en `factual`), por lo que el detector es menos fiable en fragmentos breves o en texto enciclopedico.
- Metricas no verificadas: todos los resultados del `model-index` estan marcados como `verified: false`; proceden del propio autor y no han sido replicados de forma independiente.
- Cuantizacion int8 con perdida: cambia la etiqueta en el 1,1 % de los textos de validacion respecto a fp32.
- Licencia: el modelo se publica bajo apache-2.0, lo que permite uso comercial, pero la licencia del corpus de entrenamiento `iitolstykh/LLMTrace_classification` deberia revisarse antes de un despliegue en produccion.
- Estado del repositorio: cero descargas y cero likes en el momento de la consulta, y un tamano de 0,2 GB; conviene validar el artefacto antes de integrarlo en un pipeline critico.
- Naturaleza del artefacto: es un clasificador, no un generador. No admite instrucciones, tool calling ni generacion de texto, y no debe invocarse como si fuera un LLM.
- Uso responsable: una prediccion de "IA" o "humano" es una senal estadistica, no una prueba forense. Debe acompanarse siempre de revision humana en decisiones con consecuencias.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/toiletsandpaper/russian-ai-text-detector-modernbert
- Modelo base: https://huggingface.co/deepvk/RuModernBERT-small
- Dataset de entrenamiento y evaluacion: https://huggingface.co/datasets/iitolstykh/LLMTrace_classification
- Repositorio del proyecto `aiw-ru`: https://github.com/ormeilu/avoid-ai-writing-russian
- Script de entrenamiento: https://github.com/ormeilu/avoid-ai-writing-russian/blob/master/scripts/train_transformer.py
- Variante BERT del mismo proyecto: https://huggingface.co/toiletsandpaper/russian-ai-text-detector-bert
- Variante mini-frida: https://huggingface.co/toiletsandpaper/russian-ai-text-detector-mini-frida
- Variante LightGBM: https://huggingface.co/toiletsandpaper/russian-ai-text-detector-lightgbm
- Paper referenciado (arXiv 2509.21269): https://arxiv.org/abs/2509.21269
- Paper referenciado (arXiv 2412.13663): https://arxiv.org/abs/2412.13663
