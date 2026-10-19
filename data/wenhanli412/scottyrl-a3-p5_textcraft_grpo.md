# wenhanli412/scottyrl-a3-p5_textcraft_grpo

## Resumen

`wenhanli412/scottyrl-a3-p5_textcraft_grpo` no es un modelo completo, sino un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B`. Lo publica el usuario wenhanli412 como entrega de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon, en concreto la práctica "Assignment 3". El adaptador se ha entrenado con el framework `scottyrl` y se ha exportado desde Tinker con el identificador interno `tinker://model_a38a6733/v50_r2`.

El objetivo del adaptador es resolver tareas del entorno TextCraft-Synth, un dominio de agente textual en el que el modelo debe ejecutar acciones encadenadas para fabricar objetos a partir de materiales. El nombre del run, `p5_textcraft_grpo`, sugiere un ajuste con GRPO (Group Relative Policy Optimization), si bien la model card no detalla el algoritmo ni los hiperparámetros; esta deducción procede únicamente del nombre del experimento. El repositorio pesa 0,2 GB y contiene solo los pesos del adaptador en formato safetensors gestionados por PEFT.

Su relevancia es acotada y de carácter académico: sirve como referencia reproducible de un pipeline de RL para agentes sobre un modelo de 4B, y como ejemplo de despliegue de adaptadores LoRA con vLLM. No hay benchmarks publicados, licencia declarada ni idiomas documentados, por lo que no debe tratarse como un artefacto listo para producción. La fecha de creación registrada en HuggingFace es 2026-10-19.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre el modelo base `Qwen/Qwen3.5-4B`; la arquitectura interna del modelo base no se detalla en la informacion disponible |
| Parametros totales | No disponibles para el adaptador; el modelo base tiene 4B segun su identificador. Tamano del repositorio: 0,2 GB |
| Parametros activos | No aplica: no hay indicios de que el modelo base sea MoE en la informacion disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible; el autor solo documenta el servicio del adaptador con vLLM sin especificar precision |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Tipo de adaptador | LoRA de rango 32 (`--max-lora-rank 32`) |
| Libreria | PEFT |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Framework de entrenamiento | scottyrl; exportado desde Tinker (`tinker://model_a38a6733/v50_r2`) |
| Run y configuracion | `p5_textcraft_grpo`, `configs/p5_textcraft_grpo.yaml`, commit `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e` |
| Tarea de evaluacion | TextCraft-Synth, splits de validacion medium y hard |
| Fecha de creacion | 2026-10-19 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango (LoRA, rango 32) acoplado a un transformer denso de 4B parámetros, `Qwen/Qwen3.5-4B`. No se modifica ni se redistribuye el modelo base: el repositorio contiene únicamente las matrices del adaptador en safetensors, lo que explica su tamaño de 0,2 GB. La model card no documenta la arquitectura del modelo base, la longitud de contexto, el tokenizador ni la composición del dataset de entrenamiento.

El entrenamiento se ha realizado con el framework `scottyrl`, que a su vez se apoya en Tinker para el cómputo y la exportación del checkpoint. El entorno de entrenamiento es TextCraft-Synth, un dominio de agente textual con observaciones en lenguaje natural y acciones discretas. El sufijo `_grpo` del nombre del run apunta a un ajuste con optimización de política relativa a grupos; sin embargo, no se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, la existencia de fases de SFT previas ni los hiperparámetros de RL (tamaño de grupo, KL, tasa de aprendizaje). Tampoco se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Ejecución de políticas de agente en el entorno TextCraft-Synth: el adaptador está entrenado para emitir acciones encadenadas orientadas a un objetivo de fabricación.
- Razonamiento multi-paso: la tarea exige planificar secuencias de acciones con dependencias entre recetas, no solo responder en un turno.
- Interacción con un contrato de acciones textual: el modelo produce comandos interpretables por el entorno de evaluación del curso.
- Herencia de capacidades del modelo base `Qwen/Qwen3.5-4B` (generación de texto, código, matemáticas, multilingüismo): no verificadas ni documentadas para este adaptador.
- Servicio como adaptador LoRA independiente en vLLM, combinable con el modelo base en el mismo servidor.
- Muestreo múltiple por tarea: el protocolo de evaluación con `k=4` implica generar varias trayectorias por episodio y seleccionar o medir el éxito entre ellas.
- No hay evidencia de soporte de function calling genérico, visión, audio ni modo "thinking" explícito en la información disponible.

## Casos de uso

- Investigación en RL para agentes: reproducir el pipeline de entrenamiento y evaluar variantes de GRPO sobre un dominio textual controlado, usando el adaptador como línea base del run `p5_textcraft_grpo`.
- Docencia y evaluación de asignaturas de agentes: el artefacto está pensado para que un evaluador despliegue el adaptador con vLLM y ejecute `scripts/evaluate_checkpoint.py` sobre los splits medium y hard, lo que facilita la corrección automática y la comparación entre alumnos.
- Estudio de planificación de secuencias: analizar las trayectorias generadas en TextCraft-Synth para medir profundidad de planificación, recuperación de errores y longitud de episodio frente al modelo base sin adaptar.
- Servicio multi-adaptador con vLLM: gracias a `--enable-lora --max-lora-rank 32`, se pueden cargar varios adaptadores del mismo curso sobre una única instancia del modelo base y enrutar peticiones por nombre de modelo, reduciendo coste de GPU.
- Generación de datos sintéticos de trayectorias: usar el adaptador para producir episodios etiquetados (acción, observación, resultado) que alimenten posteriores fases de SFT o filtrado por recompensa.
- Pruebas de regresión de infraestructura de inferencia: validar el soporte de LoRA en versiones concretas de vLLM, comprobar la compatibilidad de safetensors PEFT y medir la sobrecarga del adaptador frente al modelo base.
- Análisis de robustez y alucinación en agentes: comparar el comportamiento del adaptador con y sin el ruido del entorno para estudiar cuándo el modelo inventa acciones inválidas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el protocolo de evaluación, no los resultados: servicio del adaptador con vLLM y ejecución de `scripts/evaluate_checkpoint.py` con `--k 4` sobre los splits de validación medium y hard de TextCraft-Synth. No hay cifras de MMLU, HumanEval, GSM8K ni de tasa de éxito en TextCraft.

| Benchmark | Resultado | Contexto |
|---|---|---|
| TextCraft-Synth validation medium | no disponible | Evaluación con `--k 4` |
| TextCraft-Synth validation hard | no disponible | Evaluación con `--k 4` |
| MMLU / HumanEval / GSM8K | no disponible | No evaluados por el autor |
| Comparación con el modelo base sin adaptador | no disponible | No publicada |

## Requisitos de hardware

- VRAM del adaptador: aproximadamente 0,2 GB en disco; en memoria, el adaptador de rango 32 sobre un modelo de 4B suele ocupar unos pocos cientos de MB en FP16 (estimación, no verificada por el autor).
- VRAM del modelo base: un modelo denso de 4B requiere en torno a 8-9 GB en FP16, 4-5 GB en cuantización de 8 bits y 2,5-3,5 GB en 4 bits, a lo que hay que sumar la caché KV (estimaciones estándar; el autor no publica cifras).
- GPU consumer: el modelo base en 4 bits cabe en GPUs de 8 GB; con el adaptador en FP16 son recomendables 16-24 GB. Una RTX 4090 (24 GB) cubre el caso de uso con holgura.
- GPU de datacenter: A100 (40/80 GB), H100, L40S o L4 permiten servir el modelo base junto con varios adaptadores LoRA concurrentes.
- Despliegue documentado: vLLM con `--enable-lora --max-lora-rank 32 --lora-modules a3=wenhanli412/scottyrl-a3-p5_textcraft_grpo`.
- Otras opciones: al ser un adaptador PEFT, puede fusionarse con el modelo base para servir con llama.cpp/Ollama (requiere conversión a GGUF y verificación propia); el soporte de adaptadores LoRA en TGI no está documentado por el autor.
- Latencia y throughput: no disponibles; no se publican mediciones de tokens por segundo ni de latencia por episodio.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | Adaptador LoRA r32 sobre 4B | no disponible | Sin benchmarks publicados | no disponible | HuggingFace, 0 descargas, 0 likes |
| `Qwen/Qwen3.5-4B` (base, sin adaptador) | 4B | no disponible | no disponible | no disponible | HuggingFace |
| Otros adaptadores LoRA de 4B para agentes | no disponible | no disponible | no disponible | no disponible | No identificados en la informacion disponible |

La comparación cuantitativa no es posible: no hay resultados de evaluación publicados para este adaptador ni cifras de referencia en la información proporcionada. La única comparación defendible es estructural (adaptador de rango 32 frente al modelo base sin ajustar, mismo peso base y misma infraestructura de servicio).

## Limitaciones y advertencias

- Ausencia de licencia declarada: no se especifica permiso de uso comercial, redistribución ni obra derivada; jurídicamente no es utilizable en producción sin aclaración del autor.
- Artefacto académico: entrenado para una práctica concreta (11-768, Assignment 3) sobre un único entorno (TextCraft-Synth); no hay evidencia de generalización a otras tareas de agente.
- Sin benchmarks ni métricas de éxito publicadas: no se puede afirmar que el adaptador mejore al modelo base.
- Idiomas no documentados: se desconoce si el ajuste ha degradado el multilingüismo del modelo base.
- Contexto y tokenizador no documentados: impide planificar despliegues con ventanas largas o estimar coste de caché KV.
- Riesgo de alucinación y de acciones inválidas: en entornos de agente, un formato de acción incorrecto provoca el fallo del episodio; no se documenta ningún mecanismo de validación o reparación.
- Sesgos: no evaluados; al heredar el modelo base, arrastra los sesgos de su corpus de preentrenamiento, no caracterizados aquí.
- Rango 32: capacidad de adaptación limitada; puede ser insuficiente para dominios muy alejados de la distribución de entrenamiento.
- Dependencia de la versión de vLLM: el protocolo de evaluación asume `--enable-lora` y `--max-lora-rank 32`; cambios de versión pueden alterar resultados y reproducibilidad.
- Metadatos incompletos: pipeline, idiomas, licencia y descargas a cero; sin señales de validación por parte de la comunidad.
- Fechas de creación y actualización (2026-10-19) deben contrastarse con el estado real del repositorio antes de citarlo.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/wenhanli412/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Checkpoint de origen en Tinker: `tinker://model_a38a6733/v50_r2` (URI interno, no resoluble como enlace web)
- Configuración de entrenamiento y evaluación: `configs/p5_textcraft_grpo.yaml` (incluida en el repositorio del autor)
- Script de evaluación: `scripts/evaluate_checkpoint.py` (incluido en el repositorio del autor)
- Commit de referencia: `ef42c0d35c0c5b52d327a21fa2bb23a15d52d76e`
- Paper, blog o demo adicionales: no disponibles en la información proporcionada
