# weesoft/spam-detector-lstm

## Resumen

El modelo `weesoft/spam-detector-lstm` es un clasificador binario de texto (spam / legitimo) desarrollado por el usuario weesoft y publicado en HuggingFace bajo licencia MIT. Se trata de una implementacion propia basada en una red neuronal recurrente de tipo LSTM, orientada especificamente a la deteccion de correo no deseado en frances e ingles. A diferencia de los grandes modelos de lenguaje generativos, este modelo no produce texto: recibe una secuencia de hasta 200 tokens y devuelve una etiqueta de clasificacion.

El repositorio se presenta como una estructura de proyecto completa para entrenar un detector de spam personalizado, e incluye un script de entrenamiento (`train.py`), la definicion de la arquitectura (`model.py`) y el dataset fusionado (`spam_dataset.csv`) con 847 correos (304 spam y 543 legitimos). La arquitectura emplea un vocabulario dinamico construido a partir de los propios datos y una capa de dropout de 0,3 como regularizacion.

Su relevancia actual es limitada pero practica: cubre el caso de uso clasico de filtrado de correo con un modelo de muy bajo coste computacional que puede ejecutarse en CPU. No obstante, el tamano del repositorio es de 0,0 GB, lo que indica que no se han publicado pesos entrenados, y no se han documentado parametros totales ni resultados de benchmarks propios.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LSTM (red neuronal recurrente) para clasificacion binaria de texto |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 200 tokens (max sequence length) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | frances (fr) e ingles (en) |
| Licencia | MIT |
| Formato de pesos | no disponible (el repo es de 0,0 GB; solo se documentan scripts y dataset) |

Datos adicionales declarados por el autor: tamano de vocabulario dinamico basado en los datos, dropout de 0,3 y dataset de 847 correos (304 spam, 543 legitimos).

## Arquitectura y entrenamiento

El modelo es una LSTM de clasificacion de secuencias definida en un fichero `model.py` propio. El flujo es el habitual en este tipo de clasificadores: tokenizacion del texto, truncado o padding a una longitud maxima de 200 tokens, indexacion contra un vocabulario construido dinamicamente a partir del corpus de entrenamiento, paso por la capa recurrente y una capa de salida para la decision binaria spam / no spam. Se aplica dropout de 0,3 para mitigar el sobreajuste, un riesgo especialmente alto dado el reducido tamano del dataset.

En cuanto a los datos, el propio autor indica que el conjunto de entrenamiento es una fusion de correos no deseados y legitimos con un total de 847 muestras, de las cuales 304 son spam y 543 son correos validos. No se especifica el numero de tokens de entrenamiento, la composicion detallada del corpus, ni si se aplicaron tecnicas de ajuste adicionales como RLHF o DPO (no aplicables en principio a un clasificador de este tipo). Tampoco se documenta ninguna innovacion tecnica destacable (decodificacion especulativa, atencion lineal u otras); se trata de una implementacion estandar de LSTM con fines didacticos o de proyecto personal.

## Capacidades

- Clasificacion binaria de texto: determina si un correo es spam o legitimo.
- Procesamiento de secuencias de hasta 200 tokens.
- Soporte de dos idiomas: frances e ingles.
- Entrenamiento reproducible: el repositorio incluye el script `train.py` y el dataset, lo que permite reentrenar el modelo con datos propios.
- Vocabulario dinamico: el vocabulario se construye a partir del corpus de entrenamiento, lo que facilita la adaptacion a dominios concretos.
- Capacidades especiales: no se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, vision, audio ni modo de razonamiento explicito. Es un clasificador, no un modelo generativo.

## Casos de uso

- Filtrado de correo entrante en servidor de correo: integrado como paso previo al buzon del usuario, el modelo puede clasificar cada mensaje y derivar los sospechosos a una carpeta de cuarentena. Su ventana de 200 tokens es suficiente para cabeceras y cuerpo resumido de correos tipicos.
- Pre-filtro en pipelines de moderacion de comentarios: dado su bajo coste computacional, puede usarse como primera capa de descarte antes de modelos mas caros, reduciendo el volumen que llega a un moderador humano o a un modelo mayor.
- Clasificacion de SMS y mensajes cortos: al operar por secuencias cortas y estar entrenado con textos breves, encaja bien en escenarios de mensajeria donde el filtrado debe ser inmediato.
- Deteccion de phishing en formularios de contacto web: desplegado en el backend de un formulario, permite descartar envios automatizados o con carga maliciosa antes de que lleguen al equipo de soporte.
- Etiquetado por lotes de corpus historicos de correo: puede procesar grandes volumenes de mensajes archivados en CPU para generar una primera anotacion spam / legitimo que despues se revise manualmente.
- Punto de partida para fine-tuning en un dominio especifico: gracias a que el vocabulario es dinamico y a que se incluye el script de entrenamiento, un equipo puede reentrenar la LSTM con su propio corpus (por ejemplo, correo corporativo en frances) para adaptar el clasificador.
- Clasificacion en entornos con recursos limitados o on-premise: al no requerir GPU y tener un coste de inferencia minimo, es adecuado para despliegues en dispositivos perifericos o servidores sin acelerador.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible para este modelo concreto.

Como referencia externa, en la busqueda web aparecen proyectos comparables de deteccion de spam con LSTM que declaran cifras propias, como un 96,19 % de exactitud en un articulo indexado en IEEE y un 97 % en un repositorio independiente de GitHub. Estas cifras corresponden a otros modelos y otros datasets, no a `weesoft/spam-detector-lstm`, por lo que no deben atribuirse a este modelo.

| Benchmark | Resultado |
|---|---|
| Accuracy | no disponible |
| Precision | no disponible |
| Recall | no disponible |
| F1 | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB. Se trata de una LSTM de clasificacion con vocabulario reducido, por lo que el consumo de memoria es minimo.
- GPU recomendadas: ninguna en particular; el modelo es apto para CPU. Cualquier GPU consumer (por ejemplo, una GTX 1650 o superior) seria mas que suficiente.
- Compatibilidad con GPU consumer: si, cabe en cualquier GPU consumer e incluso en CPU sin aceleracion.
- Opciones de despliegue: no se documentan integraciones oficiales con vLLM, llama.cpp, Ollama o TGI (estas herramientas estan orientadas a modelos generativos). El despliegue natural seria mediante PyTorch directamente o exportando el modelo a TorchScript/ONNX, aunque el repositorio no incluye pesos ni scripts de inferencia.
- Latencia y throughput estimados: no disponible.
- Advertencia de despliegue: el repositorio no contiene pesos entrenados (tamano 0,0 GB), por lo que para usar el modelo en produccion habria que ejecutar primero `train.py` sobre el dataset proporcionado o sobre datos propios.

## Comparativa con modelos similares

| Modelo | Arquitectura | Idiomas | Dataset declarado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| weesoft/spam-detector-lstm | LSTM | fr, en | 847 correos (304 spam / 543 legitimos) | MIT | Repositorio sin pesos publicados |
| lokas/lstm-spam-detector | LSTM (Keras) | en | Pequeno corpus de SMS spam/no spam en ingles | no disponible | Pesos en HuggingFace |
| sergio11/spam_email_classifier_lstm | Bi-LSTM | no disponible | no disponible | no disponible | Codigo en GitHub |
| landenramsey/SpamEmailDetector | LSTM (PyTorch) | no disponible | no disponible | no disponible | Codigo en GitHub; declara 97 % de exactitud |

La comparativa se limita a caracteristicas generales porque los proyectos alternativos no publican especificaciones completas de parametros, contexto o licencia en la informacion disponible. Como referencia cualitativa, las variantes Bi-LSTM suelen ofrecer mejor captura de contexto bidireccional que una LSTM unidireccional.

## Limitaciones y advertencias

- Dataset muy reducido: 847 muestras es un volumen bajo para entrenar un clasificador robusto, con alto riesgo de sobreajuste pese al dropout de 0,3.
- Desbalanceo de clases: hay 304 spam frente a 543 correos legitimos, lo que puede sesgar el modelo hacia la clase mayoritaria y afectar al recall de spam.
- Sin pesos publicados: el repositorio es de 0,0 GB y no contiene el modelo entrenado, solo scripts y datos. No es utilizable directamente sin reentrenar.
- Sin benchmarks propios: no hay resultados verificables de accuracy, precision, recall o F1 para este modelo concreto.
- Cobertura idiomatica limitada: solo frances e ingles; no se garantiza un comportamiento correcto en castellano u otros idiomas.
- Dependencia del vocabulario dinamico: al construirse sobre el corpus de entrenamiento, el vocabulario puede no generalizar a vocabulario nuevo o a jerga no vista durante el entrenamiento.
- Ventana de contexto corta: 200 tokens puede ser insuficiente para correos largos o con mucho contenido HTML.
- Riesgo de alucinacion no aplicable en el sentido generativo, pero si existe riesgo de falsos positivos y falsos negativos en la clasificacion.
- Riesgo de envenenamiento de datos: un modelo de spam entrenado con un corpus pequeno puede degradarse si los atacantes adaptan sus mensajes.
- Sesgos conocidos: no documentados por el autor, pero un corpus de este tamano puede reflejar sesgos presentes en los correos de origen.
- Uso comercial: la licencia MIT permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la licencia. No obstante, conviene validar el modelo con datos propios antes de llevarlo a produccion.
- Fecha de publicacion atipica: el repositorio figura creado el 23 de septiembre de 2026, dato que no se puede verificar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/weesoft/spam-detector-lstm
- Proyecto de referencia Bi-LSTM en GitHub: https://github.com/sergio11/spam_email_classifier_lstm
- Proyecto de referencia en GitHub: https://github.com/landenramsey/SpamEmailDetector
- Modelo LSTM de spam en HuggingFace: https://huggingface.co/lokas/lstm-spam-detector
- Articulo sobre deteccion de spam con LSTM (IEEE): https://ieeexplore.ieee.org/document/10527667
- Articulo sobre clasificacion secuencial con LSTM (ResearchGate): https://www.researchgate.net/publication/390864855_LSTM-Powered_Spam_Detection_A_Deep_Learning_Approach_for_Sequential_Text_Classification
