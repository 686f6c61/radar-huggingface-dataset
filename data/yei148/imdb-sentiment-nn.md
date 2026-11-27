# yei148/imdb-sentiment-nn

## Resumen

`yei148/imdb-sentiment-nn` es un clasificador binario de sentimiento para resenas de peliculas en ingles, publicado por el usuario yei148 en Hugging Face. No se trata de un modelo de lenguaje generativo ni de una red neuronal profunda de gran escala: segun la model card, el sistema combina un vectorizador TF-IDF con un clasificador PyTorch de dos capas que etiqueta cada resena como positiva o negativa. El repositorio tiene un tamano de 0.0 GB y cero descargas, lo que sugiere un artefacto de curso o experimento personal mas que un modelo listo para produccion.

El modelo se entrenó sobre un conjunto de datos de curso de tamano reducido, con particion estratificada entre entrenamiento y test, y el vectorizador TF-IDF se ajusto unicamente sobre las resenas de entrenamiento para evitar fuga de informacion. Los resultados declarados por el autor son especificos de una unica particion de validacion, por lo que no deben interpretarse como una estimacion robusta de rendimiento general.

Su relevancia practica es limitada: sirve como ejemplo didactico de pipeline clasico de PLN (TF-IDF + MLP) y como posible linea base para tareas de analisis de sentimiento en ingles, pero carece de licencia declarada, de documentacion de hiperparametros y de benchmarks publicados en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | TF-IDF + clasificador MLP de dos capas en PyTorch |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (depende de la configuracion del vectorizador TF-IDF) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | ingles (en) |
| Licencia | no disponible |
| Formato de pesos | no disponible (el autor menciona un vectorizador en pickle y pesos PyTorch, sin detallar formato) |

## Arquitectura y entrenamiento

La arquitectura es un pipeline clasico de dos etapas: primero un vectorizador TF-IDF transforma el texto en un vector disperso de caracteristicas, y despues una red neuronal de dos capas implementada en PyTorch produce la clasificacion binaria (positivo/negativo). No se trata de un transformer ni de un modelo MoE; no hay atencion ni representaciones contextuales aprendidas de extremo a extremo.

El entrenamiento se realizo sobre un dataset de curso de tamano pequeno, con particion estratificada entre train y test y ajuste del vectorizador solo sobre el conjunto de entrenamiento. La model card no especifica el numero de tokens, la composicion exacta del dataset, la funcion de perdida, el optimizador, la tasa de aprendizaje ni si hubo tecnicas de regularizacion como dropout. Tampoco se documenta ningun proceso de RLHF, DPO o ajuste fino adicional. El autor remite a un fichero `metrics.json` del repositorio de codigo para consultar accuracy, F1 macro, accuracy de la linea base y matriz de confusion, pero esos valores no estan incluidos en la informacion proporcionada.

## Capacidades

- Clasificacion binaria de sentimiento (positivo/negativo) sobre resenas de peliculas en ingles.
- Procesamiento de texto en ingles exclusivamente.
- Entrada esperada: texto de resena; salida: etiqueta de sentimiento.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No dispone de modo thinking, vision, audio ni generacion de texto.
- No es multilingue: solo ingles.
- No hay evidencia de soporte para otras tareas de PLN (NER, QA, resumen, etc.).

## Casos de uso

- Linea base para analisis de sentimiento en ingles: util para comparar rapidamente un enfoque TF-IDF + MLP frente a modelos transformer en un corpus de resenas de peliculas, dado su bajo coste computacional.
- Prototipado academico: sirve como ejemplo reproducible de pipeline de clasificacion de texto con particion estratificada y ajuste del vectorizador solo en train, apropiado para docencia.
- Etiquetado preliminar de resenas en un corpus pequeno: puede usarse para preanotar resenas positivas y negativas antes de una revision humana, siempre que se valide su calidad en el dominio concreto.
- Filtrado rapido de resenas en un prototipo interno: por su naturaleza ligera, puede integrarse en un script de preprocesado para separar resenas positivas de negativas en un primer paso.
- Experimentacion con tecnicas de vectorizacion: permite probar variantes de TF-IDF (ngramas, sublineal tf, stop words) y medir su impacto en un clasificador de dos capas.
- Demostracion de riesgos de seguridad en carga de pickles: la propia model card advierte que el vectorizador pickle solo debe cargarse desde una fuente de confianza, lo que lo convierte en un caso practico para discutir riesgos de deserializacion insegura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card menciona que las metricas (accuracy, F1 macro, accuracy de linea base y matriz de confusion) estan en un fichero `metrics.json` del repositorio de codigo, pero dichos valores no se incluyen en los datos proporcionados.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; por la naturaleza del modelo (TF-IDF + MLP de dos capas) es previsible que quepa en CPU y en cualquier GPU consumer, pero no se aportan cifras.
- GPU recomendadas: no disponible; el modelo puede ejecutarse en CPU sin problema aparente dado su tamano reducido.
- Compatibilidad con GPU consumer: probable en cualquier GPU consumer, aunque no confirmado por el autor.
- Opciones de despliegue: no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI; el autor indica usar `predict.py` del repositorio de codigo con los cuatro ficheros del modelo en su directorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. No se han proporcionado datos de rendimiento ni especificaciones suficientes para comparar con alternativas de la misma categoria (por ejemplo, clasificadores TF-IDF + regresion logistica o modelos transformer de clasificacion de sentimiento), y la informacion disponible no incluye metricas que permitan una comparacion rigurosa.

## Limitaciones y advertencias

- Entrenado sobre un dataset de curso pequeno: los resultados son especificos de una unica particion de validacion y no garantizan generalizacion.
- Solo soporta ingles; no es util para resenas en castellano u otros idiomas.
- Licencia no disponible: no se puede asumir permiso para uso comercial; conviene contactar con el autor antes de cualquier despliegue en produccion.
- Riesgo de alucinacion no aplica en sentido generativo, pero si existe riesgo de clasificaciones erroneas en dominios distintos al de entrenamiento.
- La carga del vectorizador en formato pickle conlleva riesgo de ejecucion de codigo arbitrario si el fichero no procede de una fuente de confianza; el propio autor lo advierte.
- No se documentan sesgos conocidos, pero un corpus de resenas de peliculas en ingles puede reflejar sesgos de dominio, genero o cultura no controlados.
- Cero descargas y cero likes en Hugging Face: no hay evidencia de uso comunitario ni de validacion externa.
- No se especifican hiperparametros, tamano del vocabulario, dimension del vector TF-IDF ni arquitectura exacta de las dos capas, lo que dificulta la reproducibilidad.
- Repositorio de 0.0 GB: conviene verificar que los artefactos estan realmente disponibles antes de intentar cargarlos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/yei148/imdb-sentiment-nn
- Repositorio de codigo con `predict.py` y `metrics.json`: no disponible en la informacion proporcionada.
- Paper o blog del autor: no disponible.
- Demo: no disponible.
