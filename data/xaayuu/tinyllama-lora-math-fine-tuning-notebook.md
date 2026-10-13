# Xaayuu/TinyLlama-LoRA-math-fine-tuning-notebook

## Resumen
Este repositorio contiene un adaptador LoRA (Low-Rank Adaptation) entrenado sobre el modelo base TinyLlama/TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only de 1,1 mil millones de parametros desarrollado originalmente por el proyecto TinyLlama. El adaptador lo publica el usuario Xaayuu y su objetivo es especializar el modelo base en razonamiento matematico y resolucion de problemas de nivel escolar mediante un ajuste fino supervisado sobre un subconjunto del dataset GSM8K. Se distribuye como pesos PEFT en formato safetensors y no como un modelo independiente, por lo que requiere cargar primero el modelo base.

La relevancia de esta ficha es doble. Por un lado, ilustra un flujo de trabajo completo de ajuste fino eficiente (LoRA con cuantizacion de 4 bits) sobre hardware de consumo, uno de los casos de uso mas habituales hoy en dia. Por otro lado, sirve como ejemplo de como un modelo pequeno de 1,1B puede mejorar drasticamente en una tarea acotada: el autor reporta una reduccion de la perplejidad de 39,7684 (base) a 8,1784 (adaptado) sobre el subconjunto de entrenamiento.

Se trata, sin embargo, de un artefacto con escasa validacion externa: cero descargas y cero "likes" en el momento de redactar esta ficha, sin banco de pruebas estandar publicados (MMLU, HumanEval, exactitud en GSM8K) y con datos de evaluacion medidos unicamente sobre los datos de entrenamiento. Debe considerarse, por tanto, un experimento reproducible mas que un modelo listo para produccion.

## Especificaciones tecnicas
| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama) con adaptador LoRA (PEFT) sobre TinyLlama-1.1B-Chat-v1.0 |
| Parametros totales | 1,1 mil millones en el modelo base; el numero de parametros entrenables del adaptador no esta disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 2048 tokens (heredada del modelo base) |
| Tipos de cuantizacion | Entrenamiento con cuantizacion de 4 bits (QLoRA); el adaptador se publica en safetensors. No se han publicado versiones GGUF ni cuantizaciones listas para usar |
| Idiomas soportados | Ingles (en) |
| Licencia | MIT |
| Formato de pesos | safetensors (adaptador LoRA/PEFT) |

## Arquitectura y entrenamiento
El adaptador se aplica sobre TinyLlama-1.1B-Chat-v1.0, un transformer decoder-only con atencion causal, normalizacion RMSNorm y activacion SwiGLU, con 2048 tokens de contexto. El ajuste fino emplea LoRA, una tecnica de adaptacion de bajo rango que congela los pesos preentrenados e inyecta matrices de descomposicion de rango reducido en determinadas capas del transformer, reduciendo drasticamente el numero de parametros entrenables frente a un ajuste fino completo. Segun el material de referencia, el entrenamiento se realizo con cuantizacion de 4 bits (aproximacion QLoRA), lo que permite ejecutar el proceso en GPUs de gama de consumo.

El dataset de ajuste es un subconjunto de GSM8K, un corpus de problemas matematicos de nivel de educacion primaria que exigen razonamiento en varios pasos. No se especifican en la informacion disponible el rango de LoRA, el valor de alpha, las capas objetivo, el numero de pasos de entrenamiento, la tasa de aprendizaje ni si se aplicaron tecnicas de alineacion adicionales como RLHF o DPO; todos estos hiperparametros figuran como no disponibles. El unico resultado de evaluacion aportado por el autor es la perplejidad medida sobre el subconjunto de entrenamiento, que baja de 39,7684 a 8,1784, un indicador de ajuste a los datos vistos pero no necesariamente de capacidad de generalizacion.

## Capacidades
- Generacion de texto conversacional en ingles, en el formato de chat definido por TinyLlama-1.1B-Chat-v1.0.
- Resolucion de problemas matematicos de nivel escolar con razonamiento paso a paso, orientada al estilo de GSM8K.
- Redaccion de explicaciones y procedimientos intermedios para justificar resultados numericos.
- Especializacion en plantillas de problema-respuesta estructuradas, segun indica el autor.
- Capacidades heredadas del modelo base por debajo del rendimiento del adaptador (aunque no se cuantifican las perdidas).
- No se documenta soporte de tool calling ni function calling.
- No se documenta comportamiento agentico ni razonamiento multi-paso fuera del ambito matematico.
- No se documentan capacidades de vision, audio ni multimodalidad.
- Capacidades multilingues no disponibles: el modelo esta etiquetado exclusivamente como ingles.

## Casos de uso
- Tutoria matematica para educacion primaria: el adaptador puede generar resoluciones paso a paso de problemas aritmeticos verbales, adecuado por su especializacion en el formato GSM8K y su tamano reducido para despliegues economicos.
- Prototipado de asistentes educativos en local: al caber en GPUs de consumo, permite montar un asistente de practica de matematicas sin depender de servicios en la nube.
- Investigacion en PEFT y QLoRA: este repositorio sirve como estudio de caso reproducible para medir el impacto de un ajuste LoRA de bajo coste sobre una tarea concreta.
- Base para nuevas iteraciones de ajuste fino: el adaptador puede combinarse o continuarse entrenando con otros datasets matematicos, gracias a su licencia MIT y su formato PEFT interoperable.
- Generacion de conjuntos de ejercicios resueltos: se puede usar para producir problemas de practica con su solucion detallada en pipelines de generacion de material didactico.
- Filtrado y validacion de soluciones candidatas: en un flujo educativo, el modelo puede comparar una respuesta dada con su propia resolucion para senalar errores de procedimiento.
- Demostraciones de despliegue en hardware modesto: util como ejemplo de inferencia de un modelo de 1,1B con adaptador para pruebas de latencia en equipos de gama de consumo.

## Benchmarks y rendimiento
| Metrica | Modelo base (TinyLlama-1.1B-Chat) | Adaptador LoRA (Math) |
|---|---|---|
| Perplejidad (subconjunto de entrenamiento) | 39,7684 | 8,1784 |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, exactitud en GSM8K, etc.) en la informacion disponible. El unico dato aportado por el autor es la perplejidad, medida sobre el mismo subconjunto empleado en el entrenamiento, por lo que no constituye una medida de generalizacion a datos no vistos.

## Requisitos de hardware
- Inferencia en bfloat16: aproximadamente 2,2 GB de VRAM para el modelo base, mas un margen reducido para el adaptador LoRA (el peso del adaptador es muy inferior al del modelo base al no estar cuantificado a 4 bits en distribucion).
- Inferencia en 4 bits: alrededor de 0,7 a 1 GB de VRAM, suficiente para GPUs de gama de entrada con 4 GB o mas.
- GPUs recomendadas: cabe con holgura en RTX 3060, RTX 4070, RTX 4090 y similares; tambien funciona en GPUs de datacenter como A100 o H100, aunque el modelo es demasiado pequeno para aprovecharlas plenamente.
- Cabe en GPU de consumo: si, en practicamente cualquier GPU con 4 GB o mas de VRAM; tambien es viable en CPU, con latencia mucho mayor.
- Opciones de despliegue: transformers combinado con peft (flujo documentado por el autor), y, previa fusion de pesos y conversion de formato, llama.cpp, Ollama, vLLM o TGI. No se publican pesos fusionados ni conversiones GGUF en el repositorio.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares
| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (LoRA math) | 1,1B (base) + adaptador | 2048 tokens | Adaptador PEFT sobre TinyLlama | MIT | HuggingFace, requiere modelo base |
| TinyLlama-1.1B-Chat-v1.0 | 1,1B | 2048 tokens | Modelo completo | Consultar la licencia del modelo base (no indicada en la informacion disponible) | HuggingFace |
| Llama-3.2-1B-Instruct | 1,23B | 128.000 tokens | Modelo completo instruct | Llama 3.2 Community License | HuggingFace |

No se dispone de datos de rendimiento comparativos (MMLU, GSM8K, HumanEval) para estos modelos en la informacion proporcionada, por lo que la comparacion se limita a parametros, contexto, licencia y disponibilidad. Frente a Llama-3.2-1B-Instruct, este adaptador ofrece una especializacion matematica concreta pero un contexto mucho menor (2048 frente a 128.000 tokens) y una unica lengua soportada.

## Limitaciones y advertencias
- La perplejidad reportada esta medida sobre el subconjunto de entrenamiento, lo que puede reflejar sobreajuste y no una mejora real en problemas no vistos.
- No hay metricas de exactitud en GSM8K ni en otros benchmarks, por lo que la calidad matematica real del adaptador no esta verificada de forma independiente.
- El modelo esta etiquetado unicamente en ingles; no se documenta soporte de castellano ni de otros idiomas.
- Al ser un modelo de 1,1B de parametros, la tasa de alucinacion y de errores aritmeticos en problemas complejos es alta, incluso con la especializacion.
- Es un adaptador LoRA, no un modelo autonomo: requiere descargar y cargar TinyLlama-1.1B-Chat-v1.0 y la libreria peft para funcionar.
- No se publican pesos fusionados ni versiones cuantizadas a GGUF, lo que complica su uso directo con llama.cpp, Ollama u otros motores que no soporten PEFT.
- Licencia MIT para el adaptador; la licencia y las condiciones del modelo base deben verificarse por separado antes de un uso comercial, ya que no se detallan en la informacion disponible.
- Riesgo de contaminacion del dataset GSM8K respecto a conjuntos de evaluacion publicos habituales.
- Cero descargas y cero "likes" en el momento de la consulta: no existe validacion por parte de la comunidad.
- No se documentan comportamientos de seguridad, filtros de contenido ni evaluaciones de sesgo.

## Enlaces
- HuggingFace del modelo: https://huggingface.co/Xaayuu/TinyLlama-LoRA-math-fine-tuning-notebook
- Modelo base en HuggingFace: https://huggingface.co/TinyLlama/TinyLlama-1.1B-Chat-v1.0
- Notebook de ajuste fino en GitHub: https://github.com/Xaayu/TinyLlama-LoRA-math-fine-tuning-notebook/blob/main/TinyLlama_LoRA_Math_Fine_Tuning.ipynb
- Guia de ajuste fino de TinyLlama (ML Journey): https://mljourney.com/how-to-fine-tune-tinyllama/
- Repositorio de referencia sobre LoRA con TinyLlama (GitHub): https://github.com/CharonK652302/tinyllama-lora-finetuning/tree/main
- Guia de ajuste fino de TinyLlama en entorno on-premises: http://kenji.blog/en/p/tinyllama-on-premises-fast-tuning-guide/
- Guia de ajuste fino de Llama con LoRA, Unsloth y TRL: https://myengineeringpath.dev/genai-engineer/llama-fine-tuning/
