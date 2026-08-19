# stage-babylm/llama-384-4L

## Resumen

llama-384-4L es un modelo de lenguaje extremadamente compacto de 7,85 millones de parametros, publicado por el usuario stage-babylm en el ecosistema del reto BabyLM 2026. Su nombre indica una arquitectura tipo Llama con dimension oculta de 384 y 4 capas, lo que lo convierte en un modelo de tamano minimo orientado a experimentos de entrenamiento con datos limitados, comparable al input linguistico de un nino.

El modelo se presenta como un fine-tuning de un modelo base no especificado sobre un dataset desconocido. Se entrenó durante una sola epoca con 40.278 pasos, un learning rate de 0,0018 y scheduler coseno, alcanzando una perdida de validacion de 1,7420. La model card es auto-generada y carece de informacion sobre datos de entrenamiento, licencia e idiomas soportados.

Su relevancia reside en el contexto del reto BabyLM, que investiga como los modelos de lenguaje pueden aprender eficientemente con corpus reducidos. Sin embargo, la ausencia de benchmarks publicados y de documentacion tecnica limita su utilidad practica mas alla de la investigacion experimental.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Llama (transformer decoder) |
| Parametros totales | 7.850.112 |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura Llama, un transformer decoder con normalizacion previa y activaciones SwiGLU, segun se infiere del nombre del modelo. Con dimension oculta de 384 y 4 capas, es un modelo disenado para el reto BabyLM, que promueve el entrenamiento de modelos de lenguaje con cantidades de datos comparables a las que recibe un nino durante sus primeros anos.

El entrenamiento se realizo como fine-tuning de un modelo base no identificado, sobre un dataset desconocido. Los hiperparametros documentados incluyen optimizador AdamW con betas (0,9, 0,95) y epsilon 1e-06, learning rate de 0,0018, scheduler coseno con warmup del 5%, batch size de 32 y una sola epoca. La perdida de validacion descendio de 6,9477 al inicio hasta 1,7420 al final del entrenamiento. No se documentan tecnicas como RLHF, DPO ni otras innovaciones de entrenamiento.

## Capacidades

- Generacion de texto basica: puede producir texto continuo a partir de una secuencia de entrada, aunque su tamano reducido limita la coherencia y calidad de las salidas.
- Fine-tuning especifico: al ser un modelo ajustado, puede especializarse en dominios concretos si se dispone del dataset de entrenamiento.
- Compatibilidad con transformers: se integra con la libreria transformers de HuggingFace y es compatible con text-generation-inference y endpoints.
- Capacidades de razonamiento, codigo, matematicas, tool calling, agentes, vision o audio: no disponibles ni verificadas dada la ausencia de benchmarks y documentacion.

## Casos de uso

- Investigacion educativa: el modelo permite ensenar los fundamentos del fine-tuning de transformers en entornos academicos, ya que su tamano minimo posibilita entrenarlo en una GPU de gama baja o incluso en CPU.
- Experimentos del reto BabyLM: como participante del ecosistema BabyLM, es util para estudiar como modelos pequenos aprenden con datos limitados y comparar estrategias de entrenamiento con corpus reducidos.
- Prototipado de pipelines de generacion de texto: permite validar integraciones con transformers, text-generation-inference o endpoints antes de escalar a modelos mayores, reduciendo costes de desarrollo.
- Pruebas de cuantizacion y optimizacion: su tamano reducido lo convierte en un banco de pruebas ideal para experimentar con tecnicas de cuantizacion, pruning o destilacion sin coste computacional significativo.
- Analisis de curvas de aprendizaje: los datos de entrenamiento publicados (perdida por paso) permiten estudiar la dinamica de convergencia de modelos pequenos con scheduler coseno y warmup.
- Benchmarking de hardware: sirve para medir latencia y throughput de inferencia en diferentes dispositivos, desde CPU hasta GPUs de gama baja, sin necesidad de grandes recursos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El model-index de HuggingFace muestra una lista de resultados vacia. Unicamente se dispone de la perdida de validacion (1,7420) reportada durante el entrenamiento.

## Requisitos de hardware

- VRAM estimada: el modelo ocupa aproximadamente 31 MB en precision fp32 y unos 8 MB en int8, por lo que cabe en cualquier GPU con mas de 1 GB de VRAM y tambien en RAM de CPU.
- GPU recomendadas: no requiere una GPU especifica; cualquier GPU de consumo (GTX 1050 en adelante, RTX serie 20/30/40) es suficiente. Tambien puede ejecutarse exclusivamente en CPU.
- Compatibilidad con consumer GPU: si, es compatible con cualquier GPU de consumo disponible en el mercado.
- Opciones de despliegue: compatible con la libreria transformers de HuggingFace, text-generation-inference, endpoints de HuggingFace y FriendliAI.
- Latencia y throughput: no disponibles. Dado el tamano del modelo, se espera una latencia del orden de milisegundos incluso en CPU, aunque no hay mediciones publicadas.

## Comparativa con modelos similares

No se dispone de informacion suficiente para establecer una comparativa rigurosa con modelos de la misma categoria. El modelo no publica benchmarks ni especifica su modelo base, lo que impide comparaciones cuantitativas. Como referencia contextual, modelos como TinyLlama (1,1B parametros) o GPT-2 (124M parametros) son significativamente mayores, pero no se dispone de datos de rendimiento comparables para este modelo concreto.

## Limitaciones y advertencias

- Licencia no especificada: el modelo no declara licencia, por lo que su uso comercial es juridicamente arriesgado y no recomendable sin consultar al autor.
- Datos de entrenamiento desconocidos: no se especifica el dataset utilizado ni el modelo base, lo que impide evaluar sesgos, calidad de los datos o posibles problemas de copyright.
- Tamano extremadamente reducido: con 7,85 millones de parametros, la calidad de generacion es muy limitada en comparacion con modelos modernos; no es adecuado para tareas de produccion que requieran razonamiento complejo.
- Sin benchmarks publicados: no hay metricas objetivas (MMLU, HumanEval, GSM8K, etc.) que permitan evaluar sus capacidades reales.
- Idioma no especificado: se desconoce que idiomas soporta o en que idiomas fue entrenado.
- Longitud de contexto no documentada: aunque por su tamano y arquitectura probablemente sea reducida, no se ha publicado este dato.
- Riesgo de alucinacion: como todo modelo de lenguaje pequeno, es propenso a generar contenido incoherente o factualmente incorrecto, especialmente fuera de su dominio de entrenamiento.
- Model card incompleta: la documentacion indica "More information needed" en multiples secciones, lo que refleja una falta de transparencia sobre el proceso de entrenamiento y los datos utilizados.
- Tamano del repositorio desproporcionado: el repo ocupa 3,8 GB, muy por encima de lo esperable para un modelo de 7,85 millones de parametros (~31 MB en fp32), lo que sugiere que incluye archivos adicionales no documentados.

## Enlaces

- Pagina de HuggingFace: https://huggingface.co/stage-babylm/llama-384-4L
- Pagina de inferencia en FriendliAI: https://friendli.ai/models/stage-babylm/llama-384-4L
- Sitio del reto BabyLM: https://babylm.github.io/
