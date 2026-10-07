# tholzz596/spamshield-distilbert

## Resumen

El modelo `tholzz596/spamshield-distilbert` es un clasificador de texto publicado en Hugging Face por el usuario tholzz596. A partir de sus etiquetas (`distilbert`, `text-classification`) y del nombre del repositorio, se trata de un ajuste fino de DistilBERT orientado a la deteccion de spam, aunque la model card no documenta de forma explicita la tarea, el dataset ni el procedimiento de entrenamiento. El repositorio ocupa 0,3 GB y contiene pesos en formato safetensors con 66.955.010 parametros, una cifra coherente con la configuracion estandar de DistilBERT-base mas una cabeza de clasificacion.

DistilBERT es una version destilada de BERT, aproximadamente un 40 % mas pequena y un 60 % mas rapida que BERT-base, manteniendo en torno al 97 % del rendimiento en tareas de comprension del lenguaje (segun los resultados publicados por sus autores). Esto lo convierte en un candidato habitual para tareas de clasificacion binaria de alto volumen, como el filtrado de correo no deseado, donde la latencia y el coste de inferencia son criticos.

La relevancia de este modelo concreto es limitada por su falta de documentacion: la model card es una plantilla autogenerada sin datos de entrenamiento, evaluacion, licencia ni idiomas. Cualquier evaluacion rigurosa requiere inspeccionar la configuracion del repositorio y validar el modelo sobre un conjunto de datos propio antes de usarlo en produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | DistilBERT (transformer encoder, 6 capas, 12 cabezas de atencion, 768 de dimension oculta), segun la etiqueta del repositorio |
| Parametros totales | 66.955.010 |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo contiene safetensors) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |
| Pipeline | text-classification |
| Tamano del repositorio | 0,3 GB |

## Arquitectura y entrenamiento

La etiqueta `distilbert` del repositorio apunta a una arquitectura transformer encoder derivada de DistilBERT, un modelo destilado a partir de BERT-base mediante destilacion de conocimiento. La configuracion tipica de DistilBERT-base incluye 6 capas, 12 cabezas de atencion, una dimension oculta de 768 y en torno a 66 millones de parametros, cifra que coincide con los 66.955.010 del repositorio. Sobre esta base se habria anadido una cabeza de clasificacion de secuencia, presumiblemente con dos etiquetas (spam / no spam), aunque este extremo no esta confirmado en la informacion disponible.

No hay ningun dato publicado sobre el proceso de entrenamiento: se desconoce el numero de tokens, la composicion del dataset, si se aplicaron tecnicas como RLHF, DPO o simple ajuste supervisado, asi como los hiperparametros utilizados o el hardware empleado. La model card es una plantilla autogenerada y no incluye ninguna seccion completada.

## Capacidades

- Clasificacion de texto: el pipeline declarado es `text-classification`, por lo que la funcion esperada es asignar una etiqueta (probablemente binaria) a una secuencia de entrada.
- Deteccion de spam / contenido no deseado: el nombre del repositorio lo sugiere, pero no esta confirmado por la documentacion.
- Inferencia de baja latencia: al tratarse de un modelo de 67 millones de parametros, el coste computacional por inferencia es reducido.
- No se ha documentado soporte de tool calling ni function calling.
- No hay indicios de soporte de agentes ni de razonamiento multi-paso.
- No se ha documentado capacidad multilingue.
- No se ha documentado ninguna capacidad especial (modo thinking, vision, audio, generacion de texto).

## Casos de uso

- Filtrado de correo electronico no deseado: un clasificador DistilBERT de este tamano puede ejecutarse en tiempo real sobre cada mensaje entrante en un servidor SMTP, con un coste de inferencia minimo y la posibilidad de desplegar multiples instancias en CPU.
- Deteccion de phishing en correo corporativo: la clasificacion contextual de DistilBERT captura patrones de lenguaje que los filtros basados en reglas no detectan, aunque requiere validacion previa sobre un corpus etiquetado propio.
- Moderacion de comentarios en plataformas: uso como clasificador previo para marcar contenido sospechoso antes de una revision humana, reduciendo la carga manual del equipo de moderacion.
- Filtrado de resenas falsas o spam en marketplaces: el modelo puede puntuar resenas y priorizar las sospechosas para revision, siempre que se haya ajustado con datos del dominio.
- Pre-filtro en pipelines de clasificacion en cascada: dado su bajo coste, puede actuar como primera etapa que descarte los casos claros y deje los ambiguos a un modelo mayor.
- Clasificacion de SMS fraudulentos (smishing): la deteccion de mensajes de texto con enlaces maliciosos es un caso analogo al filtrado de correo y encaja con un clasificador binario ligero.
- Etiquetado automatico de grandes volumenes de tickets de soporte: para separar tickets de spam de los legitimos antes de encolarlos a agentes humanos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye ninguna seccion de evaluacion completada, ni metricas de precision, recall, F1 o exactitud sobre conjuntos de validacion.

## Requisitos de hardware

- VRAM estimada en fp32: en torno a 270 MB solo para los pesos, mas el espacio de activaciones (por debajo de 1 GB en la mayoria de configuraciones).
- VRAM estimada en fp16: aproximadamente 135 MB para los pesos.
- GPU recomendadas: cualquier GPU moderna sirve; una NVIDIA T4, RTX 3060 o superior es mas que suficiente. No se requiere A100 ni H100.
- Cabe holgadamente en cualquier GPU de consumo, e incluso en GPUs integradas y en CPU.
- Opciones de despliegue: transformers (PyTorch), TGI (Text Generation Inference no aplica a clasificacion), text-embeddings-inference segun las etiquetas, ONNX Runtime, y conversion a GGUF para llama.cpp. Tambien es compatible con endpoints segun la etiqueta `endpoints_compatible`.
- Latencia y throughput estimados: no disponibles; al tratarse de un modelo de 67 M de parametros, se espera un throughput de miles de inferencias por segundo en GPU y cientos en CPU, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| tholzz596/spamshield-distilbert | 66.955.010 | no disponible | text-classification | no disponible | Hugging Face |
| distilbert-base-uncased | 66.955.010 | 512 tokens | modelo base (sin cabeza de clasificacion) | Apache 2.0 | Hugging Face |
| bert-base-uncased | 109.482.240 | 512 tokens | modelo base | Apache 2.0 | Hugging Face |
| ModernBERT (mencionado en busquedas relacionadas) | no disponible en la informacion | no disponible | clasificacion de spam en un proyecto distinto | no disponible | Hugging Face Spaces (proyecto Umranz/SpamShield-AI) |

No hay datos de rendimiento del modelo objeto de la ficha que permitan una comparacion cuantitativa con alternativas.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin informacion util: no hay datos de entrenamiento, evaluacion, sesgos ni uso previsto.
- La licencia no esta declarada, lo que impide determinar si su uso comercial esta permitido. No debe usarse en produccion sin aclarar este punto.
- No se conocen los idiomas soportados; un ajuste fino sobre un corpus mayoritariamente en ingles rendiria mal en castellano u otros idiomas.
- Al ser un clasificador y no un modelo generativo, el riesgo de alucinacion en el sentido clasico no aplica, pero si existe riesgo de falsos positivos y falsos negativos, especialmente sin datos de evaluacion.
- Puede heredar los sesgos de DistilBERT-base y del corpus de ajuste, que se desconoce.
- El repositorio tiene cero descargas y cero likes, lo que sugiere que no ha sido validado por la comunidad.
- No hay garantia de que la cabeza de clasificacion tenga dos etiquetas ni de que la tarea sea realmente deteccion de spam; todo ello es inferencia a partir del nombre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tholzz596/spamshield-distilbert
- Proyecto SpamShield-BERT (GitHub, distinto autor): https://github.com/azharahmedyzp/SpamShield-BERT
- Proyecto SpamShield-BERT (GitHub, live demo): https://github.com/AzharAhmedP/SpamShield-BERT
- Pagina del proyecto SpamShield: https://azharahmed-portfolio.vercel.app/work/spamshield-bert
- Space SpamShield-BERT-HF: https://huggingface.co/spaces/AzharAhmedP/SpamShield-BERT-HF/blob/main/README.md
- Space SpamShield AI (ModernBERT): https://huggingface.co/spaces/Umranz/SpamShield-AI
- Paper de la arquitectura base DistilBERT (no citado en la model card): https://arxiv.org/abs/1910.01108
- Referencia del tag arxiv:1910.09700 (Lacoste et al., calculo de emisiones): https://arxiv.org/abs/1910.09700
