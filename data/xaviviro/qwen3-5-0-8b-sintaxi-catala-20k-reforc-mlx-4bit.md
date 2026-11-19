# xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc-MLX-4bit

## Resumen

Qwen3.5-0.8B-sintaxi-catala-20k-reforc-MLX-4bit es una version cuantizada a 4 bits en formato MLX del modelo xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc, desarrollado por Xavier Vinaixa Rosello (Sorensen AI, Barcelona). Se trata de un modelo especializado en el analisis sintactico escolar del catalan: recibe una unica oracion en catalan y devuelve directamente su analisis sintactico en JSON (sujeto, predicado, complementos, voz y si es impersonal), sin instrucciones adicionales ni prompt de sistema.

El modelo parte de una base Qwen3.5 de 0.8B parametros (752.393.024 parametros reales segun safetensors) y ha sido destilado y reforzado con un conjunto de 20.000 ejemplos para la tarea de analisis sintactico. Esta version concreta aplica cuantizacion de 4 bits con `mlx_lm.convert` (q_bits 4, q_group_size 64) para ejecutarse en local en Macs con Apple Silicon (M1 o posterior) mediante LM Studio o mlx-lm.

Su relevancia radica en que demuestra que un modelo sub-1B puede resolver una tarea linguistica estructurada con alta precision (80,0% de analisis exacto en el eval250) manteniendo un coste de memoria de solo 0,42 GB y una latencia de 0,33-0,37 s por oracion en un M3 Max, lo que lo hace viable para procesamiento por lotes en dispositivos de consumo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Qwen3.5), cuantizado MLX |
| Parametros totales | 752.393.024 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4 bits MLX (q_bits 4, q_group_size 64) |
| Idiomas soportados | Catalan (ca) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), ~444 MB / repo 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de la familia Qwen3.5 con 752 millones de parametros, ajustado mediante destilacion y refuerzo sobre un conjunto de 20.000 ejemplos para la tarea de analisis sintactico del catalan. La model card no detalla la composicion exacta del dataset de entrenamiento ni el numero total de tokens utilizados, mas alla de la referencia a los 20k ejemplos de refuerzo que dan nombre al modelo.

La innovacion principal de esta version es la cuantizacion a 4 bits en formato MLX mediante `mlx_lm.convert` con q_bits 4 y q_group_size 64. La configuracion incluye los campos de texto tanto al primer nivel como dentro de `text_config`, para que la lean tanto mlx-lm como el motor MLX de LM Studio. El modelo esta disenado para responder sin razonamiento explicito (`enable_thinking=False`) y sin prompt de sistema, devolviendo directamente el JSON de analisis sintactico.

## Capacidades

- Analisis sintactico escolar del catalan: devuelve sujeto, predicado, complementos, voz (activa/pasiva) y si la oracion es impersonal en formato JSON.
- Generacion de texto en catalan (pipeline text-generation, conversacional).
- Salida estructurada JSON con tasa de validez del 100% medida en el eval250.
- Funcionamiento sin prompt de sistema ni instrucciones: basta con introducir una oracion.
- Modo sin razonamiento (`enable_thinking=False`) para respuestas directas.
- Ejecucion local en Apple Silicon mediante LM Studio o mlx-lm.
- No se documentan capacidades de tool calling, agentes, vision, audio ni matematicas en la informacion disponible.

## Casos de uso

- Analisis sintactico masivo de corpus catalanes: el modelo procesa oraciones una a una a 356 ms por oracion en serie (evaluado sobre 250 oraciones), lo que permite anotar corpus de forma automatizada con salida JSON directamente consumible.
- Herramientas educativas de lengua catalana: integrado en una aplicacion de aprendizaje, devuelve el analisis escolar de una oracion introducida por el alumno, con latencia inferior a 0,5 s en un Mac M3 Max.
- Preprocesamiento linguistico para NLP: genera anotaciones sintacticas estructuradas que pueden alimentar pipelines posteriores de analisis o entrenamiento de otros modelos.
- Procesamiento por lotes en local: con 0,42 GB de memoria del modelo, cabe en cualquier Mac con Apple Silicon y permite ejecutar el analisis de miles de oraciones sin coste de API.
- Prototipado rapido en LM Studio: busqueda `sintaxi-catala`, descarga y uso inmediato sin configuracion, adecuado para validar la tarea antes de integrarla en produccion.
- Investigacion en destilacion de modelos pequenos: sirve como referencia reproducible (codigo y notebook en GitHub) de como un modelo sub-1B puede resolver una tarea linguistica estructurada tras cuantizacion.
- Verificacion gramatical asistida: deteccion de estructuras como voz pasiva, predicado nominal, verbos incoativos o sujeto eliptico en textos catalanes.

## Benchmarks y rendimiento

Resultados medidos por el autor con el mismo codigo que el modelo original (`common.avalua`), temperatura 0:

| Metrica | Original bf16 | MLX 4 bits |
|---|---|---|
| eval250 · analisis exacto (%) | 80,8 | 80,0 |
| F1 complementos | 87,4 | 87,2 |
| F1 funciones | 90,1 | 89,1 |
| JSON valido (%) | 100 | 100 |
| Referencia manual (30) (%) | 83,3 | 83,3 |

Analisis exacto (%) por tipo de oracion en el eval250:

| Tipo de oracion (n) | Original bf16 | MLX 4 bits |
|---|---|---|
| CD (30) | 100 | 100 |
| CD+CI (20) | 85 | 90 |
| Pronombres debiles (15) | 60 | 60 |
| Predicado nominal (25) | 88 | 88 |
| Voz pasiva (20) | 95 | 95 |
| Impersonal (15) | 60 | 67 |
| CPRED (15) | 60 | 67 |
| CRV (15) | 80 | 73 |
| CC (50) | 78 | 72 |
| Verbos incoativos (25) | 80 | 76 |
| Sujeto eliptico (20) | 80 | 80 |

Rendimiento medido en MacBook Pro M3 Max:

| Entorno | Tiempo por oracion | Primer token | Velocidad | Memoria del modelo |
|---|---|---|---|---|
| mlx-lm (Python) | 0,33-0,37 s | ~20 ms | ~270 tokens/s | 0,42 GB |
| LM Studio (servidor local, motor MLX) | 0,37-0,43 s | ~45 ms | ~245 tokens/s | 0,42 GB |

Una analisis ocupa unas 85-100 tokens. El eval250 completo en serie: 356 ms por oracion.

## Requisitos de hardware

- Memoria del modelo: 0,42 GB en cuantizacion MLX 4 bits (repo de 0,4 GB).
- Hardware objetivo: Mac con Apple Silicon (M1 o posterior); probado en MacBook Pro M3 Max.
- No se documenta soporte para GPU NVIDIA ni CUDA en la informacion disponible.
- Despliegue: LM Studio (motor MLX 1.14.0, noviembre de 2026) y mlx-lm 0.32.2.
- Latencia: 0,33-0,37 s por oracion en mlx-lm; 0,37-0,43 s por oracion en LM Studio.
- Throughput: ~270 tokens/s en mlx-lm; ~245 tokens/s en LM Studio.
- Cabe holgadamente en cualquier Mac con Apple Silicon de gama basica por su bajo consumo de memoria.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Formato |
|---|---|---|---|---|---|
| Este modelo (MLX 4 bits) | 752.393.024 | no disponible | Analisis sintactico catalan | Apache 2.0 | safetensors MLX |
| xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc (original bf16) | no disponible | no disponible | Analisis sintactico catalan | Apache 2.0 | safetensors |
| Modelos Qwen3.5 de 0.8B genericos | ~0,8B | no disponible | Generacion de texto general | no disponible | no disponible |

No se dispone de datos de benchmarks comparativos con otros modelos de analisis sintactico del catalan en la informacion proporcionada.

## Limitaciones y advertencias

- El modelo solo soporta catalan; no se documenta comportamiento en otros idiomas.
- Rendimiento desigual por tipo de oracion: en el eval250, los pronombres debiles (60%), impersonal (67%), CPRED (67%) y CC (72%) presentan las tasas mas bajas de analisis exacto, frente al 100% en CD y el 95% en voz pasiva.
- La cuantizacion a 4 bits reduce ligeramente la calidad global (80,0 frente a 80,8 en analisis exacto) y provoca variaciones de 1-2 oraciones en algunos tipos concretos (CRV baja de 80 a 73; CC de 78 a 72; impersonal sube de 60 a 67).
- Requiere ejecucion sin prompt de sistema y con temperatura 0 para el uso previsto; otros ajustes pueden degradar la salida.
- Riesgo de alucinacion no cuantificado en la informacion disponible; la tasa de JSON valido medida es del 100% en el eval250, pero no se documenta el comportamiento fuera de ese conjunto.
- No se documentan sesgos conocidos ni limitaciones de contexto mas alla de la ausencia de dato de longitud de contexto.
- Licencia Apache 2.0, que permite uso comercial, pero el autor no documenta garantias ni soporte.
- Modelo especializado en una unica tarea: no debe esperarse calidad generalista en generacion de texto libre, codigo o matematicas.

## Enlaces

- Hugging Face: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc-MLX-4bit
- Modelo base: https://huggingface.co/xaviviro/Qwen3.5-0.8B-sintaxi-catala-20k-reforc
- Dataset de evaluacion: https://huggingface.co/datasets/xaviviro/sintaxi-catala-eval250
- Repositorio GitHub (codigo, notebook y explicacion): https://github.com/xaviviro/destillacio-sintaxi-catala
- Perfil del autor: https://huggingface.co/xaviviro
