# WardenOfPluto/Kerberos-35B-A3B-GGUF

## Resumen

Kerberos 35B-A3B 0.1 es un modelo derivado de Qwen3.6-35B-A3B, ajustado por WardenOfPluto mediante supervisión fina (SFT) para convertir una especificación de construcción escrita (build spec) en código funcional, ejecutándose localmente en hardware de consumo tipo Mac. El objetivo es permitir que un modelo de frontera redacte la especificación mientras Kerberos ejecuta la construcción en la máquina del usuario, manteniendo el repositorio, las pruebas y el proceso de build fuera de servicios en la nube.

Se distribuye exclusivamente en formato GGUF con cuantización UD-IQ3_XXS (13,2 GB), pensada para Macs con 24-31 GB de memoria unificada. El modelo base es un transformer MoE (Mezcla de Expertos) de Qwen con 34.660.610.688 parámetros totales, del que se activan aproximadamente 3.000 millones por token (de ahí la denominación A3B). La licencia es Apache 2.0 y el idioma declarado es inglés.

La versión 0.1 es temprana: según la model card, en tareas no vistas durante el entrenamiento el rendimiento es estadísticamente equivalente al modelo base (61,5% frente a 61,1% en pruebas upstream), con una mejora observada en la tasa de finalización de ejecuciones (menos timeouts: 33 de 161 intentos frente a 51 de 162 del base). Es relevante ahora porque demuestra un flujo de trabajo agéntico local para ingeniería de software asistida, con evaluación honesta de incertidumbre estadística.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer MoE (derivado de Qwen3.6-35B-A3B) |
| Parametros totales | 34.660.610.688 |
| Parametros activos | ~3B (denominación A3B; cifra exacta no disponible) |
| Longitud de contexto | 65.536 tokens (configuración de ejemplo con `-c 65536`) |
| Tipos de cuantizacion | UD-IQ3_XXS (13,2 GB); recipe de Unsloth con importance matrix |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (llama.cpp); pesos base en safetensors |
| Libreria | gguf / llama.cpp |
| Modelo base | Qwen/Qwen3.6-35B-A3B |
| Tamano del repo | 13,2 GB |
| Descargas | 860 |
| Fecha de creación | 2026-11-14 |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del Qwen3.6-35B-A3B, un transformer con capas de mezcla de expertos (MoE) que activa aproximadamente 3.000 millones de parámetros por token sobre un total de 34.660 millones, lo que permite inferencia relativamente económica en memoria frente a modelos densos del mismo tamaño. Kerberos no modifica la arquitectura: parte de los pesos del modelo base y aplica un ajuste supervisado (SFT) sobre ellos.

El entrenamiento se realizó sobre 75 cambios reales fusionados en 44 repositorios Python con licencias MIT, Apache 2.0 o BSD, cada uno reproducido desde el commit anterior. Las especificaciones de construcción fueron redactadas por GLM 5.3 (servido por Together) y filtradas mediante comprobaciones objetivas (rutas y nombres reales, tests que cargan y fallan sobre el código previo). Los objetivos de entrenamiento fueron 75 intentos del propio modelo base cuyo código superó los tests de la especificación; las ejecuciones con timeout se descartaron y no se incluyó salida de modelos cerrados. El método fue SFT durante 2 épocas sobre Tinker (LoRA, rango 32), con fusión en los pesos base a precisión completa y posterior recuantización con la receta de Unsloth para Qwen3.6-35B-A3B UD-IQ3_XXS (misma importance matrix y tipos por tensor).

## Capacidades

- Generación de código Python a partir de una especificación de construcción escrita (build spec), con seguimiento fiel de archivos, firmas y comportamiento descritos.
- Ejecución de bucles agénticos multi-paso con herramientas de shell, lectura, edición y escritura de archivos.
- Ejecución de tests y finalización autónoma al detectar que las comprobaciones pasan (menor tasa de timeouts que el base).
- Conversación multi-turno (chat) y llamadas a herramientas (tool calling), según la comprobación de regresión de la model card.
- Construcción de parches sobre repositorios existentes respetando restricciones de "archivos a cambiar" y "archivos a dejar intactos".
- Capacidades generales heredadas del base (razonamiento, matemáticas, código) no evaluadas de forma específica en esta ficha.
- Idiomas: inglés (declarado); cobertura de otros lenguajes solo mediante la comprobación de regresión (JavaScript, TypeScript, PHP, shell).
- No entrenado para redactar especificaciones ni para planificar cambios grandes de forma autónoma.

## Casos de uso

- Construcción local de parches desde una especificación: un modelo de frontera redacta el build spec y Kerberos lo implementa en un worktree local, manteniendo el código y las pruebas en la máquina del usuario. Adecuado por su entrenamiento específico en seguir specs y por su formato GGUF de 13,2 GB que cabe en un Mac de 24 GB.
- Ingeniería asistida con privacidad de código: repositorios propietarios que no pueden enviarse a la nube se construyen localmente con Kerberos, evitando la exposición del código fuente a servicios externos.
- Automatización de tareas de mantenimiento en Python: añadir funciones, exportar símbolos y escribir tests que fallan primero, siguiendo el orden de tareas de la spec, con validación mediante pytest.
- Integración en pipelines de CI/CD locales: el modelo puede ejecutarse con llama.cpp u Ollama en runners con GPU de consumo o Apple Silicon para aplicar cambios menores y verificar tests antes de fusionar.
- Prototipado rápido de utilidades y módulos: para desarrolladores que quieren pasar de una tabla de comportamiento (entradas y resultados) a código funcional con tests sin escribir manualmente el boilerplate.
- Agente de build en escritorio: en la próxima versión de Warden (anunciada pero no publicada), Kerberos se ofrece como modelo local de construcción con todas las llamadas a herramientas verificadas contra políticas del usuario.
- Evaluación comparativa de modelos agénticos: servir como referencia local reproducible (misma cuantización y runtime) para medir tasas de éxito en tareas de ingeniería de software.

## Benchmarks y rendimiento

Evaluación sobre 54 tareas retenidas de 32 repositorios Python de código abierto, tres intentos por tarea, misma cuantización de 3 bits y mismo runtime para todos los modelos.

| Medida | Modelo base | Kerberos 0.1 | Cambio (puntos) | Intervalo 95% | Tareas / repos |
|---|---|---|---|---|---|
| Tests upstream (evaluación) | 61,1% | 61,5% | +0,3 | -6,2 a +6,9 | 54 / 32 |
| Tests de la spec | 56,8% | 57,8% | +0,9 | -3,2 a +5,2 | 54 / 32 |
| Timeouts (intentos) | 51 de 162 | 33 de 161 | — | — | — |

Comprobación de regresión contra el base (72 intentos en JavaScript, TypeScript, PHP y shell, chat y tool calls): builds 23 de 24 en ambos; chat 24 de 24 frente a 23; tool calls 20 de 24 frente a 22 (caída en el límite, dos ítems con un intento cada uno).

Referencia de frontera: 39 de 54 tareas (72%) superadas con un parche por tarea (Claude escribiendo el parche desde la misma spec y repositorio, solo evaluación).

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K) en la información disponible.

## Requisitos de hardware

- VRAM/memoria: 13,2 GB para el archivo GGUF UD-IQ3_XXS; recomendado Mac con 24-31 GB de memoria unificada según la model card.
- GPU: no se especifican modelos concretos de GPU en la información disponible; el archivo está pensado para Apple Silicon con memoria unificada.
- Consumer GPU: cabe en GPUs de consumo con al menos 16 GB de VRAM efectiva para el archivo, aunque la model card solo cita Macs de 24-31 GB; no se confirma compatibilidad con RTX 4090 u otras en la información disponible.
- Despliegue: llama.cpp (`llama-server`), Ollama (`ollama run hf.co/WardenOfPluto/Kerberos-35B-A3B-GGUF:UD-IQ3_XXS`), LM Studio (búsqueda por `WardenOfPluto/Kerberos-35B-A3B-GGUF`). vLLM y TGI no se mencionan.
- Configuración recomendada: `--jinja -c 65536 -fa on --temp 0.6 --top-k 20 --top-p 0.95 --min-p 0`.
- Latencia y throughput: no disponibles. La model card advierte que tareas largas pueden agotar el tiempo en un Mac de 24 GB (33 de 161 intentos con timeout).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento en tareas retenidas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Kerberos 35B-A3B 0.1 | 34,66B totales / ~3B activos | 65.536 | 61,5% upstream; 57,8% spec | Apache 2.0 | GGUF en HF (860 descargas) |
| Qwen3.6-35B-A3B (base) | 34,66B totales / ~3B activos | no disponible | 61,1% upstream; 56,8% spec | Apache 2.0 (según base) | safetensors + GGUF |
| Claude (referencia de frontera) | no disponible | no disponible | 72% (39/54) | propietaria | API en nube |

No se dispone de datos de otros modelos locales comparables (por ejemplo, derivados agénticos de Qwen) en la información proporcionada.

## Limitaciones y advertencias

- Entrenado y evaluado exclusivamente en tareas Python; otros lenguajes solo cubiertos por la comprobación de regresión.
- No entrenado para escribir especificaciones ni para planificar cambios grandes de forma autónoma; requiere una spec previa.
- Cuantización de 3 bits: se pierde algo de calidad respecto al modelo a precisión completa, tanto en el base como en Kerberos.
- Tareas largas pueden agotar el tiempo en Macs de 24 GB (33 de 161 intentos retenidos con timeout).
- La mejora medida está dentro del ruido estadístico (+0,3 puntos con intervalo de -6,2 a +6,9); no debe presentarse como ganancia de rendimiento.
- Caída observada en tool calls en la regresión (20 de 24 frente a 22 de 24), en el límite del check; conviene vigilarla.
- Un intento de 162 se perdió por un error del harness de puntuación (archivo con bytes crudos), ya corregido.
- Idioma declarado solo inglés; sesgos no documentados en la información disponible.
- Riesgo de alucinación no cuantificado en la información disponible; al operar sobre repositorios reales, validar siempre con los tests del proyecto.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base y los datos de entrenamiento imponen sus propias condiciones (repositorios MIT, Apache 2.0 y BSD).
- Versión 0.1 temprana; el benchmark público con scorer reproducible aún no se ha publicado.

## Enlaces

- [Hugging Face: WardenOfPluto/Kerberos-35B-A3B-GGUF](https://huggingface.co/WardenOfPluto/Kerberos-35B-A3B-GGUF)
- [Modelo base: Qwen/Qwen3.6-35B-A3B](https://huggingface.co/Qwen/Qwen3.6-35B-A3B)
- [llama.cpp](https://github.com/ggml-org/llama.cpp)
- [Ollama](https://ollama.com)
- [LM Studio](https://lmstudio.ai)
- [Tinker (plataforma de fine-tuning)](https://thinkingmachines.ai/tinker/)
- [Unsloth (receta de cuantización)](https://unsloth.ai)
- [Together AI (servicio de GLM 5.3)](https://www.together.ai)
