# xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc2-MLX-4bit

## Resumen

Qwen3.5-0.8B-sintaxi-catala-20k-reforc2-MLX-4bit es una version cuantizada a 4 bits en formato MLX del modelo xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc2, un ajuste fino de Qwen/Qwen3.5-0.8B especializado en analisis sintactico escolar del catalan. Lo desarrollan Xavier Vinaixa Rosello (Sorensen AI) y Maria Sevilla Paris (Universitat de Barcelona), y resuelve un problema muy concreto: dada una unica oracion en catalan, devuelve directamente su analisis sintactico en JSON (sujeto, predicado, complementos, voz e impersonalidad), sin prompt de sistema ni razonamiento intermedio.

El modelo parte de una base de aproximadamente 752 millones de parametros y se ha entrenado mediante destilacion desde un profesor Qwen3.8-27B, con dos rondas de refuerzo sobre 8.141 ejemplos en total. La version aqui descrita pesa 0,44 GB y esta pensada para ejecutarse en local en Macs con Apple Silicon (M1 o posterior) mediante LM Studio o mlx-lm, lo que la hace especialmente relevante para docentes, linguistas y desarrolladores que necesitan un analizador sintactico catalan ligero, rapido y desplegable en hardware de consumo.

La relevancia actual radica en su especializacion: no es un modelo generalista, sino una herramienta de tarea unica con metricas medidas (94,8 % de analisis exactos en eval250 y 96,7 % en una referencia manual de 30 oraciones) y un rendimiento en inferencia de unos 266 tokens por segundo con 0,42 GB de memoria activa en un M3 Max.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (derivada de Qwen3.5-0.8B), ajuste completo supervisado |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX (q_bits 4, q_group_size 64, ~4,5 bits por peso); el modelo base existe en bf16 |
| Idiomas soportados | Catalan (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors en formato MLX (repo de 0,4 GB) |

## Arquitectura y entrenamiento

El modelo es un ajuste completo (full fine-tuning) del checkpoint Qwen/Qwen3.5-0.8B, un transformer de aproximadamente 752 millones de parametros. El entrenamiento se realizo con TRL SFTTrainer durante 3 epocas, learning rate 2e-5 con scheduling coseno, lotes de 16, precision bf16 y perdida calculada unicamente sobre la respuesta. La entrada es exclusivamente la oracion, sin instrucciones ni prompt de sistema. El entrenamiento completo se ejecuto en una NVIDIA L4 en 37 minutos.

Los datos proceden de un proceso de destilacion en tres fases: primero, el profesor Qwen3.8-27B genero oraciones con una estructura sintactica solicitada y las analizo a ciegas, conservandose solo las analisis que pasaban un validador determinista y coincidian con la estructura pedida (6.649 ejemplos). Despues se anadieron 1.033 ejemplos de refuerzo centrados en CRV, impersonales, pronombres debiles y CPRED, y finalmente 459 oraciones escritas y anotadas manualmente para cubrir categorias de error residuales (CC de cantidad, tiempo y causa, CPRED con CD, impersonales con "fer", verbos psicologicos, CI con "a" + persona, CRV, pasiva en futuro y predicado nominal con "estar"). La cuantizacion a 4 bits se realizo con mlx_lm.convert, incluyendo los campos de texto tanto en el primer nivel como dentro de text_config para compatibilidad con mlx-lm y el motor MLX de LM Studio.

## Capacidades

- Analisis sintactico escolar del catalan: devuelve JSON estructurado con sujeto (texto, nucleo, elipticidad), predicado (tipo, nucleo, complementos con funcion y texto), voz e impersonalidad.
- Generacion de texto conversacional basica heredada del modelo base, aunque el ajuste esta orientado a la tarea sintactica.
- Salida en JSON valido en el 100 % de los casos medidos.
- Manejo de categorias gramaticales especificas: CD, CI, CC, CRV, CPRED, atributo, predicado nominal, voz pasiva, impersonales, pronombres debiles, verbos incoativos y sujeto eliptico.
- No soporta tool calling ni function calling de forma nativa segun la informacion disponible.
- No se documentan capacidades de agentes, razonamiento multi-paso ni modo thinking (de hecho, la generacion se invoca con enable_thinking=False).
- Capacidad multilingue limitada al catalan.

## Casos de uso

- Herramienta docente de analisis sintactico: un profesor o alumno escribe una oracion en catalan en LM Studio y obtiene el analisis escolar en JSON de forma inmediata, sin configuracion adicional y con temperatura 0 para resultados deterministas.
- Correccion automatica de ejercicios de sintaxis: integrado en una plataforma educativa, el modelo puede comparar la respuesta del alumno con su propio analisis y generar retroalimentacion estructurada.
- Anotacion linguistica asistida: investigadores pueden procesar lotes de oraciones catalanas para preanotar corpus sintacticos, revisando despues manualmente los casos de impersonales y CPRED, que son las categorias con menor exactitud.
- Procesamiento por lotes en local: al ejecutarse en Apple Silicon con 0,42 GB de memoria activa y ~266 tokens/s, permite analizar miles de oraciones en un portatil sin depender de servicios en la nube.
- Prototipado de aplicaciones linguisticas: desarrolladores pueden usar el modelo como componente de un pipeline mayor (por ejemplo, un corrector gramatical catalan) gracias a su salida JSON estable y su licencia Apache 2.0.
- Investigacion en destilacion de modelos: el repositorio y el notebook asociados sirven como ejemplo reproducible de destilacion desde un profesor de 27B a un alumno de 0,8B con validacion determinista.
- Despliegue en entornos con recursos limitados: al caber en 0,44 GB, es viable en dispositivos Apple Silicon de gama base para tareas de analisis sintactico en tiempo real.

## Benchmarks y rendimiento

Resultados medidos por el autor con temperatura 0 y entrada consistente unicamente en la oracion:

| Metrica | 20k + reforc (ronda anterior) | 20k + 2 refuerzos bf16 | MLX 4 bits | Profesor Qwen3.8-27B |
|---|---|---|---|---|
| Analisis exacta eval250 (%) | 80,8 | 94,4 | 94,8 | 91,2 |
| F1 complementos | 87,4 | 97,4 | 97,0 | 95,2 |
| F1 funciones | 90,1 | 98,0 | 98,1 | 95,5 |
| Sujeto (%) | 97,2 | 99,6 | 99,6 | 98,8 |
| Nucleo verbal (%) | 97,2 | 97,2 | 98,4 | 98,0 |
| JSON valido (%) | 100 | 100 | 100 | 99,6 |
| Referencia manual 30 (%) | 83,3 | 96,7 | 96,7 | 93,3 |
| Test 300 (%) | 93,0 | 94,0 | 93,7 | no disponible |

Rendimiento por tipo de oracion en eval250 (analisis exacta, %):

| Tipo (n) | 20k + reforc | 20k + 2 refuerzos bf16 | MLX 4 bits |
|---|---|---|---|
| CD (30) | 100 | 93 | 93 |
| CD+CI (20) | 85 | 100 | 100 |
| Pronombres debiles (15) | 60 | 100 | 100 |
| Predicado nominal (25) | 88 | 96 | 96 |
| Voz pasiva (20) | 95 | 100 | 100 |
| Impersonal (15) | 60 | 80 | 87 |
| CPRED (15) | 60 | 80 | 80 |
| CRV (15) | 80 | 100 | 100 |
| CC (50) | 78 | 92 | 94 |
| Verbos incoativos (25) | 80 | 100 | 100 |
| Sujeto eliptico (20) | 80 | 95 | 90 |

Velocidad y memoria medidas en MacBook Pro M3 Max: 0,32-0,40 s por oracion, ~20 ms hasta el primer token y ~266 tokens/s, con 0,42 GB de memoria activa y 0,56 GB de pico.

## Requisitos de hardware

- VRAM/memoria estimada: 0,42 GB activos y 0,56 GB de pico en inferencia (medido en M3 Max con mlx-lm).
- GPU recomendadas: Apple Silicon M1 o posterior (requisito del formato MLX). No esta pensado para GPU NVIDIA/AMD en este formato; para esas plataformas habria que usar el modelo base en bf16 o convertirlo.
- Cabe en cualquier Mac con Apple Silicon, incluidos modelos de gama base con 8 GB de memoria unificada.
- Opciones de despliegue: LM Studio con motor MLX (probado con MLX 1.14.0) y mlx-lm en Python (probado con 0.32.2). No se documenta soporte para vLLM, llama.cpp, Ollama o TGI en este formato.
- Latencia y throughput: 0,32-0,40 s por oracion y ~266 tokens/s en M3 Max, procesando oraciones una a una sin agrupar.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (MLX 4 bits) | 752 M | no disponible | Sintaxis catalana | Apache 2.0 | MLX safetensors |
| xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc2 (bf16) | 752 M | no disponible | Sintaxis catalana | Apache 2.0 | safetensors |
| Qwen/Qwen3.5-0.8B (base) | ~0,8 B | no disponible | Generico | no disponible | safetensors |
| Qwen3.8-27B (profesor) | 27 B | no disponible | Generico/razonamiento | no disponible | no disponible |

La comparativa se limita a los modelos citados en la informacion disponible; no se dispone de datos de otros analizadores sintacticos catalanes comparables.

## Limitaciones y advertencias

- El eval250 ya no es una medida independiente: las categorias de los refuerzos se eligieron observando errores en ese conjunto, por lo que el 94,4-94,8 % debe leerse como limite superior. La referencia manual de 30 oraciones (96,7 %) es la medida menos contaminada.
- Las categorias con peor rendimiento son impersonales (80-87 %) y CPRED (80 %), segun los datos por tipo de oracion.
- El modelo esta disenado para una unica oracion de entrada; no se documenta comportamiento con parrafos, contextos largos ni conversaciones multi-turno.
- Solo soporta catalan; no se ha entrenado para otros idiomas.
- No se documentan sesgos especificos, pero al derivar de Qwen3.5-0.8B puede heredar sesgos del modelo base.
- Riesgo de alucinacion en la estructura JSON si la oracion de entrada es ambigua o no se ajusta a las categorias entrenadas; se recomienda temperatura 0 y validacion posterior.
- La licencia Apache 2.0 permite uso comercial, pero el autor no ofrece garantias sobre la exactitud linguistica en produccion.
- El formato MLX limita el despliegue a Apple Silicon; para otras plataformas debe usarse el modelo base en bf16 o convertirse.
- El modelo fue creado en noviembre de 2026 y cuenta con 0 descargas y 0 likes en Hugging Face en el momento de la consulta, por lo que su validacion por parte de la comunidad es practicamente inexistente.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc2-MLX-4bit
- Modelo base (bf16): https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc2
- Dataset de destilacion: https://huggingface.co/datasets/xaviviro/sintaxi-catala-destillada-20k-reforc2
- Codigo, notebook y explicacion: https://github.com/xaviviro/destillacio-sintaxi-catala
- Perfil del autor: https://huggingface.co/xaviviro
