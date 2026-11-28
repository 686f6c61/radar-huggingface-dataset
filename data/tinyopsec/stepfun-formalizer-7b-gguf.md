# tinyopsec/StepFun-Formalizer-7B-GGUF

## Resumen

StepFun-Formalizer-7B es un modelo de lenguaje especializado en autoformalización matemática: traduce enunciados de problemas en lenguaje natural a sentencias formales verificables en Lean 4. Lo desarrolla StepFun y se construye mediante fine-tuning sobre deepseek-ai/DeepSeek-R1-Distill-Qwen-7B, por lo que hereda la arquitectura Qwen2 y las capacidades de razonamiento del destilado de R1. Con 7.615.616.512 parámetros, está pensado para integrarse en pipelines de verificación formal y asistentes de demostración.

La relevancia actual del modelo radica en que la autoformalización es el cuello de botella de los sistemas de demostración automática basados en asistentes de pruebas: convertir un problema informal en una proposición Lean 4 correcta requiere comprensión matemática y conocimiento preciso de la sintaxis y las bibliotecas del asistente. El autor declara resultados de estado del arte en FormalMATH-Lite, ProverBench y CombiBench.

Esta ficha describe la versión GGUF publicada por tinyopsec, que ofrece 11 niveles de cuantización (de F16 a Q2_K) para ejecución en llama.cpp, llama-cpp-python, LM Studio y Ollama. El modelo base está publicado bajo licencia Apache 2.0 y solo declara inglés como idioma soportado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer tipo Qwen2 (base: DeepSeek-R1-Distill-Qwen-7B) |
| Parametros totales | 7.615.616.512 |
| Parametros activos | No aplica (modelo denso) |
| Longitud de contexto | No disponible en la informacion proporcionada |
| Tipos de cuantizacion | F16, Q8_0, Q6_K, Q5_K_M, Q5_K_S, Q4_K_M, Q4_K_S, Q3_K_L, Q3_K_M, Q3_K_S, Q2_K |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (repo de 15,2 GB con todas las cuantizaciones) |

## Arquitectura y entrenamiento

El modelo es un transformer denso de la familia Qwen2, con 7.615.616.512 parametros, obtenido por fine-tuning de DeepSeek-R1-Distill-Qwen-7B. La model card no detalla el volumen de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO; unicamente indica que el ajuste esta orientado a la traduccion de problemas matematicos informales a Lean 4.

La innovacion principal no reside en la arquitectura, sino en la especializacion: el modelo aprende a producir enunciados Lean 4 sintacticamente validos y semanticamente fieles al problema original, una tarea que combina razonamiento matematico con conocimiento de una biblioteca formal concreta. El autor reporta rendimiento de estado del arte en los benchmarks de autoformalizacion FormalMATH-Lite, ProverBench y CombiBench. La version GGUF es una cuantizacion del modelo original, sin cambios arquitectonicos.

## Capacidades

- Generacion de texto conversacional con formato de chat basado en los tokens especiales `<｜User｜>` y `<｜Assistant｜>`.
- Autoformalizacion: traduccion de enunciados matematicos en lenguaje natural a proposiciones en Lean 4.
- Razonamiento matematico derivado del destilado de DeepSeek-R1.
- Generacion de codigo en el dominio especifico de Lean 4.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada.
- Soporte de agentes y razonamiento multi-paso: no disponible en la informacion proporcionada.
- Capacidades multilingues: limitadas al ingles segun los metadatos.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.
- Compatible con endpoints (`endpoints_compatible`) y despliegue en llama.cpp, llama-cpp-python, LM Studio y Ollama.

## Casos de uso

- Verificacion formal en investigacion matematica: el modelo convierte un problema informal en una proposicion Lean 4 que despues se pasa a un demostrador automatico o a un asistente interactivo, reduciendo el trabajo manual de formalizacion.
- Construccion de datasets de entrenamiento para demostradores: se pueden generar pares (enunciado informal, enunciado Lean 4) a gran escala para entrenar o evaluar modelos de demostracion, usando la cuantizacion Q5_K_M o Q6_K para maximizar la fidelidad sintactica.
- Docencia de matematicas formales: un estudiante introduce un ejercicio y obtiene su formalizacion en Lean 4, lo que sirve como punto de partida para practicar demostraciones verificadas.
- Integracion en pipelines de CI para librerias Lean: el modelo puede preformalizar lemas propuestos en pull requests y comprobar su compilacion con el compilador de Lean 4 antes de la revision humana.
- Evaluacion comparativa de asistentes de pruebas: al ser un modelo pequeno (7B) y ejecutable en GPU de consumo, permite reproducir experimentos de autoformalizacion en local sin depender de APIs externas.
- Prototipado en entornos con recursos limitados: la cuantizacion Q4_K_M (~4,7 GB) o Q3_K_M (~3,6 GB) permite desplegar el modelo en estaciones de trabajo modestas para pruebas de concepto.
- Generacion de especificaciones formales en docencia de ingenieria: traducir propiedades matematicas de un algoritmo a Lean 4 como paso previo a su verificacion.

## Benchmarks y rendimiento

El autor declara rendimiento de estado del arte en FormalMATH-Lite, ProverBench y CombiBench, pero no se proporcionan cifras numericas en la informacion disponible.

| Benchmark | Resultado |
|---|---|
| FormalMATH-Lite | No disponible (el autor declara SOTA sin cifras) |
| ProverBench | No disponible (el autor declara SOTA sin cifras) |
| CombiBench | No disponible (el autor declara SOTA sin cifras) |

## Requisitos de hardware

- VRAM estimada segun la model card: F16 ~16 GB, Q8_0 ~9 GB, Q6_K ~7 GB, Q5_K_M ~6 GB, Q4_K_M ~5 GB, Q3_K_M ~4 GB, Q2_K ~3,5 GB.
- GPU recomendadas: A100 o H100 para F16 con contexto largo; RTX 4090 (24 GB) para Q8_0 o F16 con contexto moderado; RTX 3090 o 4080 para Q6_K y Q5_K_M.
- GPU de consumo: cabe en tarjetas de 8 GB con Q4_K_M o Q5_K_M; en tarjetas de 6 GB con Q3_K_M o Q2_K, con perdida de calidad apreciable en Q2_K.
- Opciones de despliegue: llama.cpp (CLI), llama-cpp-python, LM Studio y Ollama (`ollama run hf.co/tinyopsec/StepFun-Formalizer-7B-GGUF:Q4_K_M`).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Especializacion | Licencia | Formato |
|---|---|---|---|---|---|
| StepFun-Formalizer-7B (este) | 7,6B | No disponible | Autoformalizacion a Lean 4 | Apache 2.0 | GGUF, safetensors (modelo base) |
| deepseek-ai/DeepSeek-R1-Distill-Qwen-7B | 7,6B | No disponible | Razonamiento general y matematicas | No disponible en esta busqueda | Safetensors |
| Qwen2-7B | 7,6B | No disponible | Proposito general | No disponible en esta busqueda | Safetensors |

La comparativa se limita a los modelos citados en la documentacion del autor; no se dispone de datos de rendimiento comparativos entre ellos en la informacion proporcionada.

## Limitaciones y advertencias

- Especializacion estrecha: el modelo esta ajustado para autoformalizacion en Lean 4; su rendimiento en tareas generales de chat o codigo puede ser inferior al del modelo base.
- Idioma: solo se declara soporte de ingles, lo que limita su uso con enunciados matematicos en castellano sin traduccion previa.
- Riesgo de alucinacion: puede generar proposiciones Lean 4 sintacticamente validas pero semanticamente incorrectas o no equivalentes al problema original; toda salida debe verificarse con el compilador de Lean 4.
- Perdida de calidad por cuantizacion: las variantes Q3 y Q2_K degradan la fidelidad sintactica, critica en una tarea donde un unico token incorrecto invalida la formalizacion.
- Longitud de contexto no documentada: no se especifica la ventana nativa, por lo que conviene fijar `n_ctx` explicitamente (el ejemplo de la model card usa 4096) y validar el comportamiento en problemas largos.
- Licencia Apache 2.0: permite uso comercial, pero el usuario debe verificar las condiciones del modelo base y de los datos de entrenamiento originales.
- Sesgos: no se documentan evaluaciones de sesgo en la informacion proporcionada.
- Modelo de la comunidad: la cuantizacion la publica el usuario tinyopsec, no StepFun; conviene contrastar la fidelidad de las cuantizaciones con el modelo original en safetensors.

## Enlaces

- Repositorio GGUF: https://huggingface.co/tinyopsec/StepFun-Formalizer-7B-GGUF
- Modelo original: https://huggingface.co/stepfun-ai/StepFun-Formalizer-7B
- Modelo base del fine-tuning: https://huggingface.co/deepseek-ai/DeepSeek-R1-Distill-Qwen-7B
- Paper: https://arxiv.org/abs/2508.04440
- Codigo: https://github.com/stepfun-ai/StepFun-Formalizer
- LM Studio: https://lmstudio.ai/
