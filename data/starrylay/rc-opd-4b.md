# starrylay/RC-OPD-4B

## Resumen

RC-OPD-4B es un adaptador LoRA (PEFT) publicado por el usuario starrylay sobre el modelo base Qwen/Qwen3-4B. No es un modelo completo, sino un ajuste fino orientado especificamente al razonamiento matematico, entrenado con retroalimentacion dirigida sobre errores de razonamiento ("targeted feedback on reasoning errors"). El repositorio contiene unicamente los pesos del adaptador (`adapter_model.safetensors` y `adapter_config.json`), con un tamano total de 0,5 GB.

El modelo hereda la arquitectura, el tokenizador y la ventana de contexto del Qwen3-4B original; el adaptador no modifica esos parametros estructurales. Su relevancia radica en que demuestra una mejora medible en benchmarks de matematicas competitivas (AIME24, AIME25, HMMT25) sobre un modelo base de solo 4 mil millones de parametros, con una metodologia de reproduccion verificable y empaquetada.

La publicacion incluye un pipeline de reproduccion reproducible sobre cuatro GPU H100 80GB con CUDA 12.8 y vLLM, y reporta un perfil estable de 65,28% de media en el conjunto completo de benchmarks. La licencia es Apache 2.0, lo que facilita su uso comercial, aunque el modelo base Qwen3-4B debe consultarse por separado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (Qwen3-4B) con adaptador LoRA (PEFT) |
| Parametros totales | 4B (modelo base Qwen3-4B); el adaptador LoRA anade un subconjunto no especificado |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (heredada de Qwen3-4B) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador se aplica sobre Qwen3-4B, un transformer decoder-only de 4 mil millones de parametros. RC-OPD-4B anade modulos LoRA entrenados con una estrategia de retroalimentacion dirigida sobre errores de razonamiento matematico, es decir, el entrenamiento se centra en corregir trayectorias de razonamiento incorrectas en lugar de un ajuste generico. No se especifican en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si se emplearon tecnicas de RLHF o DPO.

La publicacion destaca por su enfoque en la reproducibilidad: el paquete incluye un script (`reproduce.py`) que crea un entorno Python 3.10.20 aislado, instala dependencias fijadas, descarga el modelo base y el adaptador con revisiones inmutables, y verifica cada secuencia de tokens generada, texto, registro de parada y etiqueta de correccion contra una referencia congelada. El benchmark validado utiliza un perfil de ejecucion con vLLM y requiere cuatro GPU NVIDIA H100 80GB en Linux x86_64 con CUDA 12.8.

## Capacidades

- Generacion de texto y razonamiento matematico especializado, con enfasis en problemas de competicion (AIME, HMMT).
- Resolucion de problemas matematicos con extraccion de respuesta final en formato boxed y verificacion mediante `math_verify`.
- Generacion de multiples soluciones por problema (evaluacion Avg@4, cuatro soluciones por problema).
- Capacidad de razonamiento multi-paso heredada del modelo base Qwen3-4B.
- Soporte de tool calling / function calling: no disponible en la informacion proporcionada (depende del modelo base).
- Capacidades multilingues: no disponible en la informacion proporcionada.
- Modo thinking, vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Evaluacion de razonamiento matematico en investigacion: el adaptador sirve como referencia reproducible para medir mejoras de tecnicas de ajuste fino sobre errores de razonamiento, gracias al pipeline de reproduccion verificado token a token.
- Generacion de soluciones en competiciones de matematicas: el modelo puede generar soluciones paso a paso para problemas tipo AIME/HMMT, con una tasa de acierto reportada del 65,28% de media en el conjunto completo.
- Benchmarking de infraestructura de inferencia: al incluir un perfil vLLM fijado y validado en cuatro H100, permite comparar el comportamiento numerico de distintos motores de inferencia contra una referencia estable.
- Fine-tuning sobre modelos pequenos: demuestra que un adaptador LoRA sobre un modelo de 4B puede alcanzar resultados competitivos en matematicas, util para equipos con presupuesto de GPU limitado.
- Educacion y tutoria matematica asistida: el modelo puede generar explicaciones de resolucion de problemas, aunque requiere validacion humana por el riesgo de alucinacion.
- Investigacion sobre retroalimentacion dirigida: el enfoque de entrenamiento con feedback sobre errores de razonamiento es replicable y sirve de base para experimentos con otros dominios.

## Benchmarks y rendimiento

| Benchmark | Correctas / generadas | Avg@4 (%) |
|---|---:|---:|
| AIME24 | 93 / 120 | 77,50 |
| AIME25 | 83 / 120 | 69,17 |
| HMMT25 | 59 / 120 | 49,17 |
| Media del conjunto completo | 235 / 360 | **65,28** |

Cada benchmark contiene 30 problemas con cuatro soluciones generadas por problema. Avg@4 es la fraccion de soluciones generadas puntuadas como correctas; no es Pass@4 ni precision por voto mayoritario. El evaluador original extrae la respuesta final en formato boxed y la verifica con `math_verify`. Existe una version anterior del benchmark con una observacion historica del 66,11%, disponible en `benchmark-v1-20261016`, que no se ha establecido como reproduccion exacta y estable.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explicita; el modelo base Qwen3-4B en precision completa requiere aproximadamente 8-10 GB, y el adaptador LoRA anade una cantidad marginal.
- GPU recomendadas para reproduccion del benchmark: cuatro NVIDIA H100 80GB en Linux x86_64 con CUDA 12.8.
- Compatibilidad con GPU de consumo: no confirmada en la informacion proporcionada; el modelo base de 4B es susceptible de caber en GPU de consumo con cuantizacion, pero el perfil validado exige H100.
- Opciones de despliegue: el benchmark validado usa vLLM con un perfil de ejecucion empaquetado; el ejemplo de carga usa `transformers` + `peft`. Otros motores (llama.cpp, Ollama, TGI) no estan validados y presentan comportamiento numerico distinto.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en matematicas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| RC-OPD-4B | 4B (base) + LoRA | no disponible | 65,28% media (AIME24/25, HMMT25) | Apache 2.0 | Hugging Face (adaptador) |
| RC-OPD-1.7B | 1.7B (base) + LoRA | no disponible | no disponible | no disponible | Hugging Face |
| RC-OPD-8B | 8B (base) + LoRA | no disponible | no disponible | no disponible | Hugging Face |
| Qwen3-4B (base) | 4B | no disponible | no disponible en la informacion | Apache 2.0 | Hugging Face |

La informacion proporcionada solo confirma la existencia de las variantes RC-OPD-1.7B y RC-OPD-8B del mismo autor, sin datos de rendimiento comparables. No se dispone de resultados de benchmarks de modelos alternativos en la informacion disponible.

## Limitaciones y advertencias

- Es un adaptador LoRA, no un modelo autonomo: requiere cargar el modelo base Qwen/Qwen3-4B con revisiones especificas para funcionar correctamente.
- El rendimiento validado depende de un perfil de ejecucion concreto (vLLM, cuatro H100, CUDA 12.8); otros motores o configuraciones de GPU tienen comportamiento numerico distinto y pueden no reproducir los resultados reportados.
- Riesgo de alucinacion en razonamiento matematico: aunque el modelo esta especializado, los resultados de benchmark muestran que aproximadamente un tercio de las soluciones generadas no son correctas.
- La observacion historica del 66,11% no se ha establecido como reproduccion exacta y estable; el perfil por defecto validado es el de 65,28%.
- Sesgos conocidos: no disponibles en la informacion proporcionada.
- Limitaciones de contexto e idioma: no disponibles en la informacion proporcionada; dependen del modelo base.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el uso comercial debe verificar tambien la licencia del modelo base Qwen3-4B.
- El repositorio tiene un numero muy bajo de descargas (27) y cero likes, lo que sugiere validacion externa limitada por parte de la comunidad.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/starrylay/RC-OPD-4B
- Coleccion del proyecto: https://huggingface.co/collections/starrylay/rc-opd-6acbb487a58766dba48df3f5
- Guia de reproduccion: https://huggingface.co/starrylay/RC-OPD-4B/blob/main/benchmark/README.md
- Informe de validacion: https://huggingface.co/starrylay/RC-OPD-4B/blob/main/stable_6528_validation.json
- Informe de comparacion: https://huggingface.co/starrylay/RC-OPD-4B/blob/main/benchmark/comparison_report.md
- Benchmark version anterior: https://huggingface.co/starrylay/RC-OPD-4B/tree/benchmark-v1-20261016
- Modelo base: https://huggingface.co/Qwen/Qwen3-4B
- Variante 1.7B: https://huggingface.co/starrylay/RC-OPD-1.7B
- Variante 8B: https://huggingface.co/starrylay/RC-OPD-8B
