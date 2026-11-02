# XcaliburMoon/Gemma-4-MoE-Agent-26B

## Resumen

Gemma-4-MoE-Agent-26B es un proyecto de ajuste fino (fine-tuning) sobre el modelo base `google/gemma-4-26B-A4B-it`, desarrollado por el usuario XcaliburMoon. El objetivo declarado es construir un agente capaz de operar sobre un conjunto de diez herramientas simuladas, reutilizando la misma interfaz y el mismo "estilo de casa" que el autor ya empleó en su versión densa previa, `XcaliburMoon/Gemma-4-MoE-Agent-v1.4`, de 4,63B de parámetros. El modelo base es un transformer con arquitectura de mezcla de expertos (MoE): 25,23B de parámetros totales repartidos en 128 expertos, de los cuales se enrutan 8 por token, con una ventana de contexto nativa de 262.144 tokens.

Es relevante ahora por dos motivos. Primero, porque explora si un modelo enrutado por expertos puede sostener un perfil de agente en hardware de consumo: al leer una fracción fija de sus expertos por token, el modelo mantiene una huella de memoria muy inferior a su recuento total de parámetros. Segundo, porque la model card documenta con detalle las mediciones de memoria y velocidad por cuantización, lo que permite planificar el despliegue antes de que exista un checkpoint entrenado.

Es importante subrayar que, en el momento de redactar esta ficha, **no hay ningún checkpoint subido**. El autor indica explícitamente que el modelo base, el perfil de entrenamiento y el presupuesto de tamaño están fijados, pero que la primera pasada de entrenamiento no se ha ejecutado. Ningún contenido del repositorio debe interpretarse como un modelo entrenado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), 128 expertos, 8 enrutados por token |
| Parametros totales | 25,23B |
| Parametros activos | 8 de 128 expertos por token (fracción activa no expresada en miles de millones en la información disponible) |
| Longitud de contexto | 262.144 tokens nativos (256k); las pasadas de entrenamiento documentadas usan 1.024 tokens |
| Tipos de cuantizacion | Q2_K_XL, Q3_K_M, Q4_0, Q4_K_M (planificados en `gguf/`) |
| Idiomas soportados | Inglés (`en`) |
| Licencia | Términos de Gemma (derivado de `google/gemma-4-26B-A4B-it`); el campo de licencia del repositorio figura como "no disponible" |
| Formato de pesos | GGUF (planificado); adaptador LoRA; pesos base en safetensors vía `transformers` |

## Arquitectura y entrenamiento

El modelo base es un transformer con mezcla de expertos: 128 expertos en total, de los cuales 8 se enrutan por token, lo que da un recuento de 25,23B parámetros con un coste de cómputo y lectura de memoria proporcional a una fracción fija de los expertos, no al total. La model card justifica esta elección frente al modelo denso previo: el denso lee aproximadamente la mitad de su archivo por token debido a las capas compartidas y por tanto no puede crecer, mientras que un modelo enrutado lee un octavo fijo de sus expertos, lo que hace alcanzable un modelo de 25,23B en un portátil.

El perfil de entrenamiento se denomina `gemma4_moe`: el adaptador se aplica a la atención y al bloque denso, mientras que todos los expertos y el router permanecen congelados. El autor advierte de un detalle técnico relevante: nombrar un experto en un patrón LoRA no entrena nada aunque reporte éxito, porque los tensores de expertos fusionados no presentan un módulo por experto al que engancharse. No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF o DPO. La primera pasada de entrenamiento no se ha ejecutado.

## Capacidades

- Generación de texto en inglés mediante el pipeline `text-generation`.
- Llamada a herramientas (tool calling) y uso como agente: el proyecto se define explícitamente como un agente sobre una superficie de diez herramientas simuladas.
- Razonamiento multi-paso orientado a agentes, heredado del perfil de la versión densa previa.
- Compatibilidad con endpoints (etiqueta `endpoints_compatible`).
- Soporte de cuantización GGUF para despliegue en local.
- No se documentan capacidades de visión, audio ni modo de razonamiento explícito (thinking mode) en la información disponible.
- Capacidades multilingües: limitadas al inglés según la etiqueta de idioma del repositorio.

## Casos de uso

- Agente de automatización de tareas con herramientas: el modelo está diseñado para invocar una superficie fija de diez herramientas simuladas, lo que encaja en flujos de orquestación donde el modelo decide qué herramienta llamar y con qué argumentos en cada paso.
- Asistente de línea de comandos en local: con cuantización Q4_0 (14,44 GB en disco, 41,7 tok/s medidos en un Apple M5 de 24 GB), puede desplegarse en un portátil de gama alta para tareas de agente sin depender de la nube.
- Prototipado de pipelines de agentes: la ventana nativa de 262.144 tokens permite, en teoría, mantener historiales largos de conversación y resultados de herramientas; conviene validar el comportamiento real, ya que las pasadas documentadas solo usan 1.024 tokens.
- Evaluación comparativa de ajustes MoE frente a densos: el repositorio incluye una comparativa directa con el residente denso de 4,63B (3,42 GB en disco, 58,6 tok/s), útil para medir qué aporta la capacidad extra de parámetros en la misma tarea.
- Despliegue en estaciones de trabajo con 24-32 GB de memoria unificada o VRAM: las cuantizaciones Q2_K_XL (10,57 GB) y Q3_K_M (12,33 GB) caben en dispositivos de 16 GB y 24 GB respectivamente según la tabla del autor.
- Investigación sobre congelación de expertos en LoRA: el perfil `gemma4_moe` documenta un patrón concreto (adaptador solo en atención y bloque denso) que puede servir de referencia para quienes ajusten modelos MoE con tensores de expertos fusionados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K u otros) en la información disponible. Los únicos datos de rendimiento son mediciones de velocidad y memoria del modelo base:

| Lectura | Valor |
|---|---|
| Throughput servido, Q4_0, contexto 4096 | 41,74 tok/s |
| Memoria residente, Q4_0 | 14,6 GB |
| Contexto nativo | 262.144 tokens |
| Expertos | 128 totales, 8 enrutados por token |

| Cuantización | Archivo (GB) | Residente (GB) | tok/s | Cabe en 16 GB | Cabe en 24 GB |
|---|---|---|---|---|---|
| Q2_K_XL | 10,57 | 10,68 | 57,0 (derivado) | Sí | Sí |
| Q3_K_M | 12,33 | 12,45 | 48,9 (derivado) | No (0,4 GB de exceso) | Sí |
| Q4_0 | 14,44 | 14,58 | 41,7 (medido) | No (2,6 GB de exceso) | Sí |
| Q4_K_M | 15,30 | 15,45 | 39,4 (derivado) | No (3,4 GB de exceso) | Sí |

El autor advierte de que las velocidades marcadas como derivadas no están medidas en banco de pruebas, sino extrapoladas a partir del archivo Q4_0 medido.

## Requisitos de hardware

- VRAM/memoria residente estimada: entre 10,68 GB (Q2_K_XL) y 15,45 GB (Q4_K_M) según la tabla del autor.
- GPU recomendadas: no se especifican modelos concretos; las mediciones de referencia se hicieron en un Apple M5 con 24 GB de memoria unificada. Por huella, encaja en GPUs con 16-24 GB de VRAM (por ejemplo, RTX 4090 de 24 GB) para las cuantizaciones Q2_K_XL y Q3_K_M.
- Cabe en GPU de consumo: sí, en tarjetas de 24 GB con Q2_K_XL, Q3_K_M, Q4_0 y Q4_K_M; en dispositivos de 16 GB solo Q2_K_XL.
- Opciones de despliegue: `transformers` (librería declarada), GGUF para llama.cpp/Ollama, y compatibilidad con endpoints.
- Latencia y throughput: 41,74 tok/s medidos con Q4_0 a contexto 4096 en Apple M5 de 24 GB; 57,0, 48,9 y 39,4 tok/s derivados para Q2_K_XL, Q3_K_M y Q4_K_M respectivamente.
- Se descartó una reconstrucción por tensor-train: con bond 128 el archivo quedaría en 8,07 GB, pero el error relativo de los expertos reconstruidos mide entre 0,83 y 0,94 frente a 0,05 de Q4_0.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Estado |
|---|---|---|---|---|
| Gemma-4-MoE-Agent-26B | 25,23B (MoE, 8/128 activos) | 262.144 tokens | Términos de Gemma | Sin checkpoint entrenado |
| Gemma-4-MoE-Agent-v1.4 (mismo autor) | 4,63B (denso) | No disponible | Términos de Gemma (presumible) | Publicado; 3,42 GB en disco, 58,6 tok/s |
| google/gemma-4-26B-A4B-it | 25,23B (MoE, 8/128 activos) | 262.144 tokens | Términos de Gemma | Modelo base publicado |

No se dispone de datos de benchmarks que permitan comparar la calidad de estos modelos entre sí; la comparativa se limita a parámetros, contexto, licencia y estado de publicación.

## Limitaciones y advertencias

- No existe checkpoint entrenado: el repositorio solo contiene la definición del proyecto y las mediciones del modelo base. No debe usarse como modelo funcional.
- El contexto anunciado por el modelo base (262.144 tokens) no es el contexto usado en ninguna pasada de entrenamiento: todas las filas documentadas son de 1.024 tokens, un 0,4 % de la ventana.
- Tres de las cuatro suites están a la par del profesor de 4,63B; la capacidad extra de parámetros no garantiza una mejora de comportamiento sin una pasada de entrenamiento en este perfil.
- Las velocidades de cuantizaciones distintas de Q4_0 son derivadas, no medidas.
- Idioma limitado al inglés según la etiqueta del repositorio.
- Licencia: se aplican los términos de Gemma del modelo base, incluidas las restricciones de uso y la obligación de propagarlas; las cuantizaciones y adaptadores del repositorio se ofrecen bajo los mismos términos. El campo de licencia del repositorio figura como "no disponible".
- Riesgo de alucinación y sesgos: no documentados en la información disponible; deben evaluarse sobre el modelo base y sobre el ajuste una vez entrenado.
- El ajuste congela expertos y router; el adaptador solo cubre atención y bloque denso, lo que limita qué partes del modelo se adaptan a la tarea de agente.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/XcaliburMoon/Gemma-4-MoE-Agent-26B
- Modelo base: https://huggingface.co/google/gemma-4-26B-A4B-it
- Versión densa previa del mismo autor: https://huggingface.co/XcaliburMoon/Gemma-4-MoE-Agent-v1.4
