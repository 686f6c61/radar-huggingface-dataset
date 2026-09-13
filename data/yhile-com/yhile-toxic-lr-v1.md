# yhile-com/yhile-toxic-lr-v1

## Resumen

yhile-toxic-lr-v1 es un clasificador de texto multiclase desarrollado por el usuario yhile-com que predice si un fragmento de texto es discurso de odio (hate speech), ofensivo o ninguno de los dos (neither). No es un modelo de lenguaje generativo ni una red neuronal: se trata de una regresión logística implementada con scikit-learn que combina características TF-IDF de palabras (1-2-gramas, 10.000 características) y de caracteres (3-5-gramas, 5.000 características) con características estructurales diseñadas a mano para detectar lenguaje de exclusión basado en identidad.

El modelo resulta relevante porque ataca un patrón concreto que los detectores puramente léxicos suelen dejar escapar: el lenguaje de exclusión identitaria formulado sin insultos explícitos (por ejemplo, "go back to", "don't belong here"), además del lenguaje deshumanizante. Para ello incorpora señales de ingeniería que combinan la mención de un grupo protegido con una expresión de exclusión, lo que evita que la simple aparición de un término identitario se interprete como señal de odio.

Se distribuye como un artefacto serializado con skops (no pickle) para permitir una carga segura, bajo licencia CC-BY-SA 3.0, heredada del corpus Stormfront utilizado en el entrenamiento. El repositorio de HuggingFace ocupa 0,0 GB, no acumula descargas y cuenta con un like en el momento de la consulta.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Regresión logística multiclase (scikit-learn); no es un transformer ni una red neuronal |
| Parametros totales | No disponible como cifra publicada. Al ser un modelo lineal, el número de coeficientes es del orden de 15.000 características TF-IDF multiplicadas por 3 clases, más los coeficientes de las características de ingeniería |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica: clasifica un único fragmento de texto, sin ventana de contexto ni estado conversacional |
| Tipos de cuantizacion | No aplica. Se distribuye un artefacto skops sin cuantizar; no se publican versiones GGUF, ONNX, int8 ni equivalentes |
| Idiomas soportados | Inglés únicamente (la model card indica explícitamente "English only"; los metadatos de HuggingFace no declaran idiomas) |
| Licencia | CC-BY-SA 3.0 (share-alike, heredada del corpus Stormfront) |
| Formato de pesos | skops (`.skops`), cargado mediante `skops.io.load`; el autor descarta pickle por motivos de seguridad |

## Arquitectura y entrenamiento

La arquitectura es una regresión logística multiclase sobre un vector de características dispersas. La representación de entrada combina dos vectorizadores TF-IDF (palabras de 1 a 2 gramos con 10.000 características, y caracteres de 3 a 5 gramos con 5.000 características) con un conjunto de características de ingeniería manual: detección de términos de identidad o grupos protegidos, detección de expresiones de exclusión ("get out", "go back to", "don't belong here"), detección de lenguaje deshumanizante y una señal combinada de identidad más exclusión. El objetivo declarado de esta última señal es capturar patrones estructurales de odio que la detección de palabras clave o insultos aislados no cubre, y evitar a la vez que la mera mención de una identidad se trate como señal de odio.

El entrenamiento se realizó sobre aproximadamente 194.000 filas procedentes de cuatro fuentes: el conjunto de Davidson et al. sobre odio y lenguaje ofensivo (unos 24.783 registros, sin licencia formal), el corpus Stormfront de de Gibert et al. (Vicomtech, 10.534 registros, CC-BY-SA 3.0), las etiquetas de toxicidad de Wikipedia Talk de Wulczyn, Thain y Dixon (158.839 registros, CC0) y alrededor de 35 ejemplos escritos a mano para enseñar patrones de exclusión identitaria poco representados y para evitar falsos positivos por mención de identidad. La distribución de clases resultante es aproximadamente 79 % neither, 19 % offensive y 1,4 % hate, una minoría real en las tres fuentes. No se documenta ningún uso de RLHF, DPO ni ajuste posterior: el pipeline completo es un entrenamiento supervisado clásico, y el script `train.py` se incluye en el repositorio para transparencia.

## Capacidades

- Clasificación de texto en tres clases: hate, offensive y neither, con etiquetas mapeadas como `{0: "hate", 1: "offensive", 2: "neither"}`.
- Detección de lenguaje de exclusión identitaria formulado sin insultos explícitos, gracias a las características de identidad más exclusión.
- Detección de lenguaje deshumanizante.
- Sensibilidad alta (recall) en la clase hate: 0,63, priorizando no dejar pasar contenido grave.
- Inferencia puramente local y determinista, sin dependencia de API externa ni de GPU.
- Carga segura mediante skops, con verificación de tipos no confiables antes de deserializar.
- No soporta tool calling ni function calling.
- No soporta agentes, razonamiento multi-paso ni generación de texto: es un clasificador, no un modelo generativo.
- No dispone de modo thinking, visión, audio ni ninguna capacidad multimodal.
- Capacidad multilingüe nula: solo inglés.

## Casos de uso

- Moderación previa de comentarios en foros y comunidades: el modelo actúa como primera capa de triaje sobre cada mensaje entrante; la clase neither se puede publicar automáticamente, la clase offensive se envía a revisión ligera y la clase hate se prioriza para revisión humana inmediata. Es adecuado por su coste de cómputo mínimo y su recall de 0,63 en la clase hate.
- Filtrado de bajo coste antes de un modelo mayor: dado que la precisión en hate es de solo 0,22, encaja mejor como prefiltro que como decisor final; los mensajes marcados como hate se pueden reenviar a un transformer más caro o a un moderador humano, reduciendo el volumen que llega a esa segunda etapa.
- Pre-etiquetado de corpus para anotación: en proyectos de investigación se puede usar para asignar una etiqueta inicial a cientos de miles de mensajes y que los anotadores humanos corrijan solo los casos dudosos, acelerando la construcción de conjuntos de datos.
- Investigación social y monitorización de discurso de odio histórico: aplicación sobre corpus cerrados (por ejemplo, foros archivados) para cuantificar la prevalencia de lenguaje de exclusión identitaria a lo largo del tiempo, con validación humana de los resultados.
- Auditoría y cumplimiento normativo de plataformas: registro sistemático de las clasificaciones sobre contenido reportado para documentar procesos de moderación ante requisitos regulatorios, siempre con revisión humana de las decisiones finales.
- Limpieza de conjuntos de datos de entrenamiento: filtrado de corpus web rastreados antes de usarlos para entrenar otros modelos, descartando o marcando los documentos con alta probabilidad de contenido ofensivo u odioso.
- Baseline en experimentos de clasificación de toxicidad: sirve como referencia lineal rápida y reproducible contra la que medir la mejora de modelos basados en transformers sobre el mismo conjunto de datos.
- Detección de lenguaje deshumanizante en comentarios de plataformas colaborativas, aprovechando el sesgo hacia el recall en la clase hate para generar alertas tempranas que después se confirman manualmente.

## Benchmarks y rendimiento

Los únicos datos publicados son de una partición de test estratificada del 20 % del propio conjunto de entrenamiento (unas 38.840 filas). No se han publicado resultados en benchmarks estándar como MMLU, HumanEval o GSM8K, que además no aplican a un clasificador de este tipo.

| Metrica | Valor |
|---|---|
| Exactitud global (accuracy) | 91,1 % |
| Clase neither: precision / recall | 0,97 / 0,93 |
| Clase offensive: precision / recall | 0,81 / 0,84 |
| Clase hate: precision / recall | 0,22 / 0,63 |
| F1 por clase | No publicado |

El autor advierte explícitamente que la precisión de 0,22 en la clase hate implica que aproximadamente tres de cada cuatro elementos marcados como hate son en realidad otra cosa, normalmente contenido ofensivo. Se trata de un compromiso deliberado a favor del recall, no de un defecto de implementación. La evaluación se realizó únicamente sobre muestras retenidas de la propia distribución de entrenamiento, no sobre tráfico real de moderación.

## Requisitos de hardware

- VRAM necesaria: ninguna. El modelo se ejecuta en CPU; no requiere GPU para inferencia.
- GPU recomendadas: no aplica.
- Compatibilidad con GPU de consumo: irrelevante, ya que no necesita GPU. Puede ejecutarse en cualquier portátil o en un contenedor de CPU de gama baja.
- Almacenamiento: el repositorio de HuggingFace ocupa 0,0 GB según los metadatos, por lo que el artefacto es de tamaño muy reducido.
- Opciones de despliegue: scikit-learn junto con skops para la carga del artefacto; el servicio se puede exponer mediante FastAPI, Flask o un worker en cola. No hay soporte para vLLM, llama.cpp, Ollama, TGI ni TensorRT-LLM, porque no es un modelo generativo ni un transformer.
- Latencia y throughput: no se publican medidas. Al ser un modelo lineal sobre características dispersas, la inferencia se resuelve en CPU, pero no hay cifras oficiales de latencia ni de peticiones por segundo.

## Comparativa con modelos similares

No se han proporcionado datos de modelos alternativos comparables en la información disponible, por lo que no es posible construir una comparativa con cifras verificadas. La model card tampoco incluye comparaciones con otros clasificadores de toxicidad. El único punto de referencia calculable a partir de los datos publicados es un clasificador trivial de clase mayoritaria, incluido aquí solo como contexto de la distribución de etiquetas.

| Referencia | Exactitud | Precision hate | Recall hate | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| yhile-toxic-lr-v1 | 91,1 % (test retenido propio) | 0,22 | 0,63 | CC-BY-SA 3.0 | HuggingFace |
| Clasificador de clase mayoritaria (~79 % neither) | Aproximadamente 79 % en la misma distribución | No aplica | No aplica | No aplica | No aplica |
| Otros clasificadores de toxicidad comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Precision muy baja en la clase hate (0,22): alrededor de tres de cada cuatro mensajes marcados como hate son en realidad otra categoría, habitualmente offensive. Cualquier uso automatizado debe asumir esta tasa de falsos positivos.
- El discurso de odio indirecto sin términos de identidad explícitos se pierde con frecuencia; por ejemplo, "that entire group of people is ruining this neighborhood" sin nombrar el grupo. Las características de ingeniería dependen de que el término identitario esté presente en el texto.
- El odio basado en la minusvaloración no está bien cubierto, por ejemplo ciertas formas de misoginia como "women should stay quiet" o "that gender can't be trusted". Es un patrón lingüístico distinto del de identidad más exclusión que el modelo refuerza, y las pruebas del autor confirman que no lo detecta de forma fiable.
- El sarcasmo no se detecta de forma fiable, una limitación conocida de los clasificadores de bolsa de palabras.
- Las etiquetas de origen son en parte discutidas: la frontera del conjunto de Davidson entre hate speech y lenguaje ofensivo ha sido criticada públicamente por inconsistente, ya que los tuits con insultos suelen etiquetarse como offensive y no como hate. El modelo hereda esa ambigüedad.
- Se producen falsos positivos espurios ocasionales por correlaciones léxicas coincidentes, típicas de los modelos de bolsa de palabras; el autor documenta el caso de la palabra "breed" usada en un contexto no relacionado. No son errores sistemáticos, pero existen.
- Idioma: solo inglés. No hay evaluación ni soporte para castellano ni para ninguna otra lengua.
- No se ha evaluado sobre tráfico real de moderación, solo sobre muestras retenidas de su propia distribución de entrenamiento, por lo que su comportamiento en producción puede degradarse.
- Licencia CC-BY-SA 3.0: es una licencia share-alike, no permisiva. El uso comercial está permitido, pero cualquier obra derivada o redistribución del modelo debe mantenerse bajo la misma licencia y conservar la atribución. Conviene revisarla antes de integrarla en un producto propietario.
- Dado el desequilibrio de clases (1,4 % de hate) y los sesgos presentes en los corpus de origen (un foro supremacista real y comentarios hostiles de Wikipedia), el modelo puede reflejar los sesgos de etiquetado de esas fuentes.
- El propio contenido de los datos de entrenamiento procede de un foro supremacista blanco y de comentarios hostiles reales; se utilizan con fines de investigación declarados para construir herramientas de detección, no para reproducir ni respaldar ese contenido.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yhile-com/yhile-toxic-lr-v1
- Script de entrenamiento y pipeline de características: `train.py`, incluido en el repositorio de HuggingFace del modelo
- Documentación de skops (formato de serialización): https://skops.readthedocs.io/
- Dataset de Davidson et al., Hate Speech and Offensive Language: https://github.com/t-davidson/hate-speech-and-offensive-language
- Dataset Stormfront de de Gibert et al. (Vicomtech): https://github.com/Vicomtech/hate-speech-dataset
- Dataset Wikipedia Talk Labels: Toxicity: https://figshare.com/articles/dataset/Wikipedia_Talk_Labels_Toxicity/4563973
- Búsqueda web: no se han encontrado resultados relevantes sobre este modelo; las únicas páginas devueltas tratan sobre la ciudad turca de Malatya y no guardan relación con el modelo.
