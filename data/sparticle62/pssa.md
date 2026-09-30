# sparticle62/pssa

## Resumen

PSSA (plastic state space architecture) es un modelo de secuencia recurrente desarrollado por el usuario sparticle62 y publicado como repositorio de investigacion en HuggingFace. Se trata de una arquitectura de espacio de estados (state space model, SSM) implementada desde cero en Rust, sin PyTorch ni ningun framework de autograd: el forward pass, el backward pass y el optimizador estan escritos a mano, y cada ruta vectorizada o de GPU se verifica contra una implementacion escalar de referencia en CPU (diferencia maxima de gradiente de 2,98e-8). El modelo prescinde por completo de atencion y usa un escaneo afín de espacio de estados como mezclador de secuencia.

El autor lo entrena contra un transformer de referencia con el mismo numero de parametros, el mismo corpus (WikiText-103 limpio), el mismo presupuesto de tokens y el mismo calendario. En una porcion retenida de 198.939 tokens no vistos, PSSA obtiene una entropia cruzada de 3,9971 (perplejidad 54,44, precision de siguiente token del 24,08%) frente a 4,4285 del transformer (perplejidad 83,81, 18,02%). Ademas, genera 200 tokens en CPU en 226 ms frente a 2735 ms del transformer, unas 12 veces mas rapido.

El interes actual del proyecto es metodologico: demuestra que un SSM recurrente sin atencion, implementado sin framework de autograd y con un gemelo de referencia para validacion numerica, puede superar a un transformer de igual tamano en modelado de lenguaje y ser mucho mas rapido en inferencia en CPU. El proyecto se declara codigo de investigacion en desarrollo activo y los pesos aun no estan publicados en el repositorio de HuggingFace.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | SSM recurrente con escaneo afín de espacio de estados como mezclador de secuencia; sin atencion. Incluye banco de memoria plastica con recuperacion ordenada y ranuras protegidas, y compuerta refractaria que suprime escrituras repetidas |
| Parametros totales | no disponible (el autor indica que esta igualado en parametros al transformer de referencia, pero no publica la cifra) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no declarados; el unico corpus de entrenamiento documentado (WikiText-103) es en ingles |
| Licencia | apache-2.0 |
| Formato de pesos | no disponible; los pesos no estan publicados en el repositorio de HuggingFace |

## Arquitectura y entrenamiento

PSSA es un modelo de secuencia recurrente basado en un escaneo afín de espacio de estados que actua como unico mezclador de secuencia, sin capas de atencion. Sobre esa columna vertebral se anaden dos mecanismos propios: un banco de memoria plastica con recuperacion ordenada y ranuras protegidas, y una compuerta refractaria que suprime las escrituras repetidas en memoria. La implementacion es completamente autoContenida en Rust: no hay PyTorch ni autograd, y el forward, el backward y el optimizador estan escritos a mano. Para garantizar la correccion numerica de las rutas optimizadas (vectorizadas y de GPU), el autor mantiene una implementacion escalar de referencia en CPU como gemelo de validacion, con una diferencia maxima de gradiente de 2,98e-8 respecto a las rutas optimizadas.

El entrenamiento se realizo sobre WikiText-103 limpio, con el mismo corpus, el mismo presupuesto de tokens y el mismo calendario que un transformer de referencia con el mismo numero de parametros. No se documenta en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset ni si hubo fases de RLHF, DPO o ajuste por instrucciones. Tampoco se especifica la longitud de contexto con la que fue entrenado. El autor reporta un throughput de entrenamiento de aproximadamente 900 tokens por segundo en una unica GPU a traves de la ruta CUDA, frente a unos 210 tokens por segundo en CPU.

## Capacidades

- Modelado de lenguaje autoregresivo y generacion de texto por prediccion del siguiente token.
- Modelado de secuencias largas mediante recurrencia con estado, sin mecanismo de atencion.
- Memoria plastica con recuperacion ordenada y ranuras protegidas, orientada a retener informacion a lo largo de la secuencia.
- Compuerta refractaria para evitar escrituras redundantes en memoria.
- Ejecucion en CPU y en GPU (ruta CUDA), con verificacion de equivalencia numerica entre ambas.
- Inferencia rapida en CPU: 200 tokens en 226 ms segun el autor.

No hay informacion disponible sobre soporte de tool calling o function calling, capacidades de agente, razonamiento multi-paso, capacidades multilingues, vision, audio, modo de pensamiento explicito ni ajuste por instrucciones. El modelo se presenta como un modelo base de lenguaje, no como un asistente conversacional.

## Casos de uso

- Modelado de lenguaje de investigacion: reproduccion de los resultados del autor sobre WikiText-103 limpio usando los scripts del repositorio de GitHub, util para validar la arquitectura y el arnes de evaluacion.
- Inferencia en CPU con latencia baja: al generar 200 tokens en 226 ms en CPU, encaja en entornos sin GPU donde se necesite generacion de texto con requisitos de latencia estrictos.
- Experimentacion con alternativas a la atencion: sirve como base para estudiar SSM recurrentes frente a transformers en tareas de modelado de secuencia, con una implementacion de referencia verificada numericamente.
- Prototipado de sistemas de memoria persistente: el banco de memoria plastica con ranuras protegidas y recuperacion ordenada es un componente reutilizable para experimentos que requieran estado de largo plazo sin atencion.
- Investigacion en formacion de gradientes y estabilidad numerica: la existencia de un gemelo escalar en CPU con diferencia maxima de gradiente de 2,98e-8 lo convierte en un banco de pruebas para comparar rutas optimizadas.
- Despliegue en hardware modesto: el rendimiento en CPU y la ausencia de dependencia de PyTorch facilitan su integracion en entornos embebidos o de recursos limitados, siempre que se disponga de los pesos.
- Comparativas controladas de arquitecturas: el protocolo de igualar parametros, corpus, presupuesto de tokens y calendario frente a un transformer es replicable para evaluar otras variantes de SSM.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre una porcion retenida de 198.939 tokens no vistos de WikiText-103 limpio, con el mismo corpus, presupuesto de tokens y calendario para ambos modelos, y con parametros igualados:

| Modelo | Entropia cruzada | Perplejidad | Precision de siguiente token |
|---|---|---|---|
| PSSA | 3,9971 | 54,44 | 24,08% |
| Transformer de referencia | 4,4285 | 83,81 | 18,02% |

Datos de eficiencia reportados por el autor:

| Metrica | PSSA | Transformer de referencia |
|---|---|---|
| Generacion de 200 tokens en CPU | 226 ms | 2735 ms (aproximadamente 12x mas lento) |
| Entrenamiento en una GPU (ruta CUDA) | aproximadamente 900 tokens/s | no disponible |
| Entrenamiento en CPU | aproximadamente 210 tokens/s | no disponible |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el autor no publica el numero de parametros ni los pesos, por lo que no es posible estimar el consumo de memoria.
- GPU recomendadas: no disponible. El autor menciona una ruta CUDA para entrenamiento a unos 900 tokens/s en una unica GPU, sin especificar el modelo concreto.
- Compatibilidad con GPU de consumo: no determinable con la informacion disponible al desconocerse el tamano del modelo.
- Despliegue: implementacion propia en Rust con ruta CPU y ruta CUDA. No se documenta soporte para vLLM, llama.cpp, Ollama, TGI, TensorRT-LLM ni otros servidores de inferencia convencionales, ni publicacion en formato GGUF o safetensors.
- Latencia: 226 ms para 200 tokens en CPU segun el autor (aproximadamente 1,13 ms por token en ese escenario).
- Throughput: aproximadamente 900 tokens/s en entrenamiento con una unica GPU (ruta CUDA) y aproximadamente 210 tokens/s en CPU.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Entropia cruzada (WikiText-103 retenido) | Perplejidad | Licencia | Disponibilidad de pesos |
|---|---|---|---|---|---|---|
| PSSA | igualados al transformer de referencia (cifra no publicada) | no disponible | 3,9971 | 54,44 | apache-2.0 | no publicados |
| Transformer de referencia (autor) | igualados a PSSA (cifra no publicada) | no disponible | 4,4285 | 83,81 | no disponible | no disponible |

No se dispone de datos comparables de otros SSM publicos (por ejemplo, familias Mamba o RWKV) en la informacion proporcionada, por lo que no se incluye una comparacion con ellos.

## Limitaciones y advertencias

- Pesos no publicados: la model card indica explicitamente que los pesos aun no estan en el repositorio de HuggingFace, de modo que el modelo no es usable para inferencia sin entrenarlo desde el codigo del repositorio de GitHub.
- Proyecto en desarrollo activo: el propio autor lo describe como codigo de investigacion, no como un artefacto estable para produccion.
- Evaluacion limitada: los unicos resultados publicados corresponden a WikiText-103 limpio, con una porcion retenida de 198.939 tokens. No hay evaluacion en tareas de razonamiento, codigo, matematicas, instrucciones ni dialogo.
- Idioma: el unico corpus documentado es en ingles; no hay evidencia de capacidades multilingues.
- Ausencia de alineacion: no se documenta RLHF, DPO ni ajuste por instrucciones, por lo que no cabe esperar un comportamiento de asistente ni filtros de seguridad conversacional.
- Riesgo de alucinacion: al ser un modelo base de modelado de lenguaje sin ajuste, la generacion puede producir contenido factualmente incorrecto; la precision de siguiente token reportada en la tarea de evaluacion es del 24,08%, lo que da una medida del margen de error a nivel de token.
- Sesgos: no hay informacion disponible sobre analisis de sesgos ni sobre la composicion detallada del dataset de entrenamiento.
- Contexto y memoria: se desconoce la longitud de contexto soportada; el banco de memoria con ranuras protegidas es un mecanismo nuevo y sin evaluacion publica independiente.
- Licencia: el codigo y el repositorio se publican bajo apache-2.0, que permite uso comercial, pero al no haber pesos publicados y no declararse una licencia especifica para futuros pesos, conviene verificar las condiciones antes de un uso comercial.
- Dependencia del autor: no hay validacion externa de los numeros reproducidos; la unica fuente de los resultados es el propio autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/sparticle62/pssa
- Repositorio de codigo, cadena de entrenamiento y scripts de reproduccion: https://github.com/Sparticle62ops/pssa
- No se han encontrado otros enlaces relevantes (papers, blogs o demos) en la busqueda web proporcionada.
