# Zhaoming213/ChatBox3-unrestricted

## Resumen

ChatBox3-unrestricted es un modelo de lenguaje conversacional en chino publicado por el usuario Zhaoming213 en Hugging Face, tercera entrega de la serie ChatBox-unrestricted. Se trata de un ajuste fino supervisado (SFT) del modelo preentrenado uer/gpt2-medium-chinese-cluecorpussmall, un GPT-2 medium adaptado al chino, y cuenta con 324.996.096 parametros segun los pesos en safetensors (el autor indica 355M en la tabla de la primera generacion de la serie). El repositorio ocupa 1,3 GB y se distribuye bajo licencia Apache-2.0.

El problema que aborda es concreto: ofrecer un modelo conversacional chino sin filtros de contenido, sin rechazos y sin respuestas moralizantes. El autor sostiene que las tecnicas habituales de alineacion de seguridad de los grandes modelos generativos eliminan la capacidad de respuesta divergente, y propone como alternativa un ajuste fino sobre conversaciones 100% generadas por humanos, sin destilacion de datos sinteticos de otros sistemas de IA.

Su relevancia es limitada pero clara: es un modelo pequeno (rango 300-400M de parametros) que cabe en hardware de consumo y que resulta util como objeto de estudio en investigacion sobre alineacion, tasas de rechazo y sesgos, asi como para experimentacion con fine-tuning ligero en chino. El propio autor lo etiqueta como experimental y el repositorio no registra descargas ni likes en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia GPT-2), 24 capas, hidden_size 1024, segun la configuracion heredada del modelo base |
| Parametros totales | 324.996.096 (~325M) segun safetensors; la model card indica 355M para la primera generacion de la serie |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible de forma explicita para esta version; la model card cita max_seq_len 340 para ChatBox-unrestricted (primera generacion) y el modelo base GPT-2 chino trabaja con 1024 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en safetensors; no hay GGUF ni cuantizaciones oficiales documentadas) |
| Idiomas soportados | zh (chino) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only de tipo GPT-2, sin mecanismos MoE, SSM ni atencion lineal. El modelo parte de uer/gpt2-medium-chinese-cluecorpussmall, un GPT-2 medium entrenado sobre el corpus chino CLUECorpusSmall, cuyo corte de entrenamiento es anterior a 2023. Sobre esa base se aplica un ajuste fino supervisado con datos de conversacion en chino, tanto de un solo turno como multi-turno, procedentes de datasets de la comunidad y generados integramente por humanos tras dos rondas de limpieza en profundidad. No se emplearon tecnicas de destilacion de caja negra ni datos conversacionales procedentes de otros sistemas generativos.

El entrenamiento se realizo en 2 GPU T4 de 16 GB y la fase de SFT duro algo mas de 2 horas, lo que es coherente con el tamano reducido del modelo y del dataset. La model card no documenta fases de RLHF, DPO, PPO ni ninguna otra tecnica de alineacion por preferencias, ni innovaciones tecnicas como decodificacion especulativa, atencion lineal o modos de razonamiento explicito. El modelo requiere un script propio (`Run.py`) y palabras clave personalizadas para funcionar correctamente, lo que indica un formato de prompt no estandar.

## Capacidades

- Generacion de texto conversacional en chino, con soporte de dialogos multi-turno de extension corta.
- Respuesta a preguntas de conocimiento general y de sentido comun dentro de la cobertura del corpus chino anterior a 2023.
- Comportamiento deliberadamente sin filtros: la model card declara una tasa de rechazo practicamente nula, sin restricciones NSFW, politicas ni moralizacion.
- Generacion de respuestas divergentes y abiertas en preguntas de identidad o creativas, en lugar de respuestas plantilla.
- Ajuste fino adicional viable por su tamano reducido (325M de parametros).
- No hay evidencia de soporte de tool calling ni function calling.
- No hay evidencia de capacidades de agente, razonamiento multi-paso planificado ni thinking mode.
- No hay capacidades de vision, audio ni multimodalidad.
- No hay capacidades multilingues: la unica lengua declarada es el chino.
- El modelo no esta alineado con politicas de uso: no incorpora moderacion, rechazos ni avisos de seguridad.

## Casos de uso

- Investigacion sobre alineacion y seguridad: sirve como contrapunto de control frente a modelos alineados, permitiendo medir tasas de rechazo, moralizacion y respuestas divergentes en un sistema pequeno y reproducible.
- Estudios de sesgo y contenido: al operar sin filtros, permite auditar que tipo de respuestas factuales y estereotipadas produce un GPT-2 chino ajustado con datos humanos, con fines academicos y bajo supervision.
- Generacion de datos de dialogo en chino: se puede emplear para producir corpus conversacionales sinteticos que despues se filtren y revisen manualmente, ya que su tamano permite ejecutarlo en local a gran volumen.
- Prototipado en hardware modesto: con ~325M de parametros cabe en GPU de consumo e incluso en CPU, lo que lo hace util para validar pipelines de inferencia, plantillas de prompt o interfaces antes de escalar a modelos mayores.
- Role-play y personajes en chino: la model card muestra respuestas de identidad inventadas de forma consistente, lo que encaja con prototipos de personajes conversacionales donde la coherencia factual no es un requisito.
- Trabajo de practica de conversacion en chino con revision humana: util como interlocutor de bajo coste en entornos donde el contenido se filtra a posteriori y no se expone a usuarios finales sin moderacion.
- Fine-tuning especifico de dominio: al ser un modelo pequeno y con licencia Apache-2.0, es un candidato razonable para reajustes sobre jerga tecnica, atencion al cliente informal o dominios verticales en chino.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, C-Eval, CMMLU ni de ninguna otra evaluacion estandar, y los unicos ejemplos de rendimiento que se aportan son conversaciones cualitativas que, en varios casos, contienen errores factuales (por ejemplo, atribuir la cancion equivocada a un cantante o responder "李白" a la pregunta sobre la propia identidad).

## Requisitos de hardware

- VRAM estimada para los pesos: aproximadamente 1,3 GB en FP32, 650 MB en FP16/BF16, 325 MB en int8 y 165 MB en int4 (estimaciones a partir de los 324.996.096 parametros; no hay cuantizaciones oficiales publicadas).
- Cabe holgadamente en cualquier GPU de consumo: GTX 1650 4 GB, RTX 3060, RTX 4060, RTX 4090 y similares, con margen amplio para el contexto y el cache KV.
- Es ejecutable en CPU con un rendimiento aceptable para uso interactivo no intensivo, dado el tamano del modelo.
- GPU profesionales: el autor entreno con 2x T4 16 GB; para inferencia basta una sola T4, A10, L4 o cualquier acelerador con 4 GB o mas.
- Opciones de despliegue: transformers de Hugging Face de forma directa; el repositorio esta etiquetado con `text-generation-inference`, por lo que TGI es una via soportada. El script `Run.py` del autor es la ruta documentada. Para llama.cpp u Ollama habria que convertir los pesos a GGUF, una conversion no documentada ni verificada en la informacion disponible.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay datos de benchmarks que permitan una comparativa de rendimiento. La tabla siguiente recoge unicamente los datos verificables de la propia serie y del modelo base.

| Modelo | Parametros | Contexto | Licencia | Idiomas | Estado |
|---|---|---|---|---|---|
| Zhaoming213/ChatBox3-unrestricted | 324.996.096 (~325M) segun safetensors | no disponible (340 en la primera generacion) | Apache-2.0 | zh | experimental, 0 descargas |
| Zhaoming213/ChatBox2-unrestricted | no disponible | no disponible | no disponible | zh | publicado |
| Zhaoming213/ChatBox-unrestricted | 355M segun model card | 340 | no disponible | zh | publicado |
| uer/gpt2-medium-chinese-cluecorpussmall | no disponible en la informacion (GPT-2 medium chino) | no disponible | no disponible | zh | modelo base |

Existen otras familias de modelos chinos de tamano comparable (por ejemplo, los GPT-2 chinos de Wenzhong o los modelos pequenos de la serie Qwen), pero no se dispone de resultados comparativos verificados en la informacion proporcionada, por lo que la comparacion cuantitativa queda como no disponible.

## Limitaciones y advertencias

- Riesgo alto de alucinacion: los propios ejemplos de la model card contienen errores factuales, incluida la atribucion incorrecta de canciones y respuestas de identidad inventadas.
- Ausencia total de alineacion de seguridad: el modelo no incorpora filtros, rechazos ni moderacion, y puede generar contenido NSFW, politico o danino sin restriccion. Esto implica un riesgo claro para uso en produccion, especialmente en la Union Europea, donde pueden aplicar obligaciones de transparencia y moderacion segun el uso previsto.
- Sesgos conocidos: no se han documentado auditorias de sesgo; el entrenamiento sobre corpus web chino anterior a 2023 arrastra los sesgos presentes en ese material.
- Limitacion idiomatica estricta: solo soporta chino, sin capacidades multilingues declaradas.
- Limitacion de contexto: la evidencia apunta a una ventana muy corta (340 tokens en la primera generacion, 1024 en el modelo base), lo que descarta tareas de documento largo o conversaciones extensas.
- Sin validacion de rendimiento: no hay benchmarks publicados, por lo que no es posible estimar su calidad frente a alternativas.
- Integracion no estandar: requiere descargar todos los ficheros, colocarlos en una carpeta `model` y ejecutar `Run.py`, ya que usa palabras clave personalizadas; no es plug-and-play en pipelines genericos.
- Estado experimental y sin traccion: 0 descargas y 0 likes en la informacion disponible, sin senales de mantenimiento ni comunidad.
- Las fechas de creacion y actualizacion del repositorio (2026) son anomalas respecto a la informacion disponible y conviene verificarlas antes de citar el modelo.
- Licencia Apache-2.0: permite uso comercial y modificacion, pero no exime al desplegador de responsabilidad legal sobre el contenido generado ni sobre el cumplimiento normativo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Zhaoming213/ChatBox3-unrestricted
- Primera generacion de la serie: https://huggingface.co/Zhaoming213/ChatBox-unrestricted
- Segunda generacion de la serie: https://huggingface.co/Zhaoming213/ChatBox2-unrestricted
- Modelo base: https://huggingface.co/uer/gpt2-medium-chinese-cluecorpussmall
- No se han encontrado papers, blogs tecnicos, repositorios adicionales ni demos en la busqueda web realizada.
