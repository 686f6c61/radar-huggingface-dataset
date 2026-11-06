# Sudnya/amx-moe256-20b-sft-v1

## Resumen

amx-moe256-20b-sft-v1 es un ajuste fino supervisado (SFT) del modelo base gdiamos/amx-moe256-20b, desarrollado por el usuario Sudnya. Se trata de un modelo de lenguaje de arquitectura Mixture-of-Experts (MoE) con objetivo de block-diffusion orientado a la generación de código, disenado especificamente para inferencia en CPU con las extensiones Intel AMX. El modelo actua como estudiante en un pipeline de datos de tareas de ingenieria denominado engg-tasks-v0, ejecutandose sobre CPUs Intel AMX en Azure.

El modelo es destacable no por su calidad de salida, sino por su papel como banco de pruebas de un motor de inferencia en CPU. El autor es explicito al respecto: el modelo todavia no escribe codigo funcional y se utiliza para medir el pipeline y el motor a esta escala de parametros. A pesar del nombre "20b" en el identificador, el modelo tiene aproximadamente 480 millones de parametros (0,5B), lo que sugiere que el sufijo hace referencia a otra convencion del proyecto base.

La relevancia actual reside en su enfoque de despliegue: pesos empaquetados en int8 para un motor propio sobre Intel AMX, con metricas de rendimiento publicadas (hasta 64,8k tokens/s en Azure con 22 motores) y una arquitectura hibrida de atencion lineal y ventana deslizante con 256 expertos. Es, por tanto, un caso de estudio de optimizacion de inferencia en CPU mas que un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE hibrido con atencion lineal y sliding-window, objetivo block-diffusion |
| Parametros totales | Aproximadamente 480M (0,5B) |
| Parametros activos | 4 expertos activos mas 2 compartidos en 3 capas (de 256 expertos); numero exacto de parametros activos no disponible |
| Longitud de contexto | 16.384 tokens (ventana deslizante de 2.048) |
| Tipos de cuantizacion | int8 (pack para motor AMX); otros formatos no disponibles |
| Idiomas soportados | No disponible (datos de entrenamiento en C, Python y Octave) |
| Licencia | No disponible (el modelo base no declara licencia) |
| Formato de pesos | safetensors (export ScalarXLM, 2 shards) y pack.bin int8 para motor AMX |

## Arquitectura y entrenamiento

El modelo conserva la arquitectura del base sin cambios: 6 capas, de las cuales 3 usan atencion lineal y 3 usan sliding-window attention con ventana de 2.048 tokens. La anchura es de 320, el vocabulario de 16.384 tokens y emplea 256 expertos con 4 activos mas 2 compartidos en 3 de las capas. El objetivo de entrenamiento es block-diffusion con bloques de 64 tokens, sobre un contexto maximo de 16.384 tokens.

El ajuste fino se realizo sobre el dataset teacher-sft-v1: 5.988 ejemplos de entrenamiento y 134 de evaluacion, derivados de 2.910 tareas. Cada ejemplo contiene un turno de profesor que pasa las pruebas (prompt de sistema, prompt de reparacion y el programa completo del profesor en un bloque de codigo). La distribucion por lenguajes es C (3.222), Python (2.632) y Octave (134). El profesor fue nvidia/diffusiongemma-26B-A4B-it-NVFP4. El entrenamiento uso ScalarXLM examples/chat_sft con perdida solo sobre la respuesta, 2.170 pasos (3 pasadas), learning rate 3e-4 con decaimiento coseno y warmup de 50, ejecutado en una DGX Spark. La entropia cruzada de validacion paso de 3,71 (base) a 2,798, y la de muestra de entrenamiento quedo en 2,652.

## Capacidades

- Generacion de codigo en C, Python y Octave, aunque el autor indica que el modelo no produce codigo funcional en la practica.
- Generacion de texto autoregresiva mediante decodificacion por bloques (block-diffusion de 64 tokens).
- Inferencia optimizada en CPU con Intel AMX mediante el pack int8 y el motor propio.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponibles; el entrenamiento se limita a lenguajes de programacion.
- Capacidades especiales: modo de reparacion de codigo (repair prompt) en el pipeline de entrenamiento; no se documenta vision ni audio.

## Casos de uso

- Banco de pruebas de motores de inferencia en CPU: el modelo sirve para validar el rendimiento del motor AMX (unmask policy vectorizada, prefix cache, readout fusionado) a escala de 0,5B sin depender de la calidad de las salidas.
- Medicion de pipelines de datos SFT: permite evaluar el flujo engg-tasks-v0 de generacion de datos con profesor y estudiante, comparando perdidas de validacion entre versiones (v1 frente a v2).
- Pruebas de decodificacion block-diffusion: util para experimentar con politicas de desenmascaramiento por bloques de 64 tokens y medir su impacto en throughput.
- Validacion de despliegue en Azure sobre CPUs Sapphire Rapids: el pack int8 exacto que sirvio en produccion permite reproducir la ejecucion con 22 motores y colas de peticiones llenas.
- Investigacion sobre atencion hibrida: la combinacion de atencion lineal y sliding-window en 6 capas sirve para estudiar el equilibrio entre coste computacional y contexto efectivo.
- Referencia para ajustes finos de bajo coste: el entrenamiento en una sola DGX Spark con 2.170 pasos es un ejemplo reproducible de SFT a pequena escala con datos generados por profesor.

## Benchmarks y rendimiento

| Metrica | Base | SFT v1 | SFT v2 |
|---|---|---|---|
| Entropia cruzada de validacion | 3,71 | 2,798 | 2,850 |
| Entropia cruzada de muestra de entrenamiento | no disponible | 2,652 | no disponible |
| Tareas superadas (397 muestreadas, ~200 intentos cada una) | no disponible | 0 | no disponible |

Rendimiento del motor (no del modelo): en un nucleo Sapphire Rapids con R=8, 2 slots y contexto de 6.144 tokens, el motor AMX paso de 3.314 a aproximadamente 5.200 tokens generados por segundo mediante politica de desenmascaramiento vectorizada, prefix cache y paso de readout/politica fusionado. En Azure con 22 motores alcanza 64,8k tokens/s con las colas de peticiones llenas. No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no aplica en el caso principal, ya que el modelo esta disenado para CPU con Intel AMX; el pack int8 ocupa 506 MB.
- GPU recomendadas: no disponibles; el autor no documenta despliegue en GPU.
- CPU: se ejecuta en nucleos Intel Sapphire Rapids con AMX; el entrenamiento se realizo en una DGX Spark.
- Cabida en hardware de consumo: el pack int8 de 506 MB cabe en cualquier equipo moderno, pero la aceleracion AMX requiere CPU compatible.
- Opciones de despliegue: motor propio AMX (pack.bin + pack.idx); no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: aproximadamente 5.200 tok/s por nucleo Sapphire Rapids en las condiciones indicadas; 64,8k tok/s en Azure con 22 motores.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Arquitectura | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| amx-moe256-20b-sft-v1 | ~480M | 16.384 | MoE hibrido block-diffusion | no disponible | Hugging Face |
| gdiamos/amx-moe256-20b (base) | ~480M | 16.384 | MoE hibrido block-diffusion | no disponible | Hugging Face |
| nvidia/diffusiongemma-26B-A4B-it-NVFP4 (profesor) | 26B (A4B) | no disponible | MoE diffusion | no disponible | Hugging Face |

No se dispone de datos de rendimiento comparables entre estos modelos en la informacion proporcionada; la comparativa se limita a parametros, contexto y disponibilidad.

## Limitaciones y advertencias

- El modelo no escribe codigo funcional: 0 de 397 tareas muestreadas superadas en el pipeline del autor.
- Tiende a repetir tokens en prompts simples.
- El segundo ajuste fino (v2) con mas datos generales de chat y codigo no mejoro la validacion (2,850 frente a 2,798).
- La licencia no esta declarada ni en el modelo base ni en el derivado; es necesario contactar con el autor del base antes de redistribuir.
- El rendimiento depende del motor AMX propietario y de CPU Intel con AMX; no hay soporte documentado para stacks de inferencia estandar.
- El contexto efectivo esta limitado por la ventana deslizante de 2.048 tokens en 3 de las capas, aunque el contexto nominal sea de 16.384.
- Riesgo de alucinacion y sesgos: no evaluados ni documentados por el autor.
- No apto para produccion segun la propia model card; su uso previsto es la medicion de pipelines y motores.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Sudnya/amx-moe256-20b-sft-v1
- Modelo base: https://huggingface.co/gdiamos/amx-moe256-20b
- Modelo profesor: https://huggingface.co/nvidia/diffusiongemma-26B-A4B-it-NVFP4
