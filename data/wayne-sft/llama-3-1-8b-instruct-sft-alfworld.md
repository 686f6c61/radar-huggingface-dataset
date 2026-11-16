# wayne-SFT/Llama-3.1-8B-Instruct-SFT-ALFWorld

## Resumen

Llama-3.1-8B-Instruct-SFT-ALFWorld es un checkpoint de ajuste fino supervisado (SFT) de tipo *behaviour cloning* construido sobre `meta-llama/Llama-3.1-8B-Instruct`. Lo publica el usuario `wayne-SFT` y su propósito no es el uso generalista, sino servir como punto de partida para aprendizaje por refuerzo (RL) en el entorno ALFWorld, un banco de pruebas de tareas de manipulación de objetos en texto donde un agente debe navegar por habitaciones, recoger objetos y completar instrucciones en lenguaje natural.

El modelo se ha entrenado con trayectorias expertas recogidas por los propios autores exclusivamente sobre los objetivos de entrenamiento de ALFWorld (conjunto interno `alf_sft_hc_n200`), mediante SFT de todos los parámetros durante una época (200 partidas expertas, 50 pasos globales, checkpoint guardado en el paso 30). Con 8.030.261.248 parámetros y pesos en fp32, el repositorio ocupa 32,1 GB, lo que refleja que se guardó tal cual se entrenó, sin conversión a bfloat16.

Su relevancia es acotada pero concreta: ofrece una política inicial ya competente en ALFWorld (78,6 % de tasa de éxito en el conjunto de desarrollo, media de `valid_seen` 76,4 % y `valid_unseen` 80,8 % con 4 semillas de muestreo) que evita tener que arrancar un pipeline de RL desde un modelo genérico sin nociones del entorno. No es un modelo para conversación general, código o producción de texto: es un artefacto de investigación para *embodied/text agents*.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (familia Llama 3.1), ajuste fino completo |
| Parametros totales | 8.030.261.248 |
| Parametros activos | no aplica (modelo denso) |
| Longitud de contexto | no disponible en la informacion proporcionada (el entrenamiento uso `max sequence length` 1280; el modelo base soporta hasta 128k tokens) |
| Tipos de cuantizacion | no disponible (pesos publicados en fp32; el `config.json` declara `bfloat16`) |
| Idiomas soportados | no disponible en la model card (heredados del modelo base Llama 3.1, oficialmente 8 idiomas) |
| Licencia | Llama 3.1 Community License |
| Formato de pesos | safetensors (7 shards, 291 tensores, todos F32) |

## Arquitectura y entrenamiento

La arquitectura es la del modelo base: un transformer decoder-only denso de 8B parámetros de la familia Llama 3.1, con tokenizer propio (el repositorio incluye `tokenizer.json` de 17,2 MB y `chat_template.jinja`). No hay modificaciones estructurales ni mezcla de expertos; el checkpoint conserva los 291 tensores del modelo original, todos almacenados en fp32.

El entrenamiento consistió en SFT de todos los parámetros sobre trayectorias expertas recolectadas por los autores en ALFWorld, restringidas a los objetivos de entrenamiento (200 partidas, nombre interno `alf_sft_hc_n200`). Hiperparámetros declarados: learning rate 1e-5, batch global 64, longitud máxima de secuencia 1280, una época y 50 pasos globales; el checkpoint publicado corresponde al paso global 30. No se documenta en la información disponible el uso de RLHF, DPO ni decodificación especulativa. El resultado en desarrollo se midió con 4 semillas de muestreo, lo que indica una evaluación estocástica de la política.

## Capacidades

- Generación de texto conversacional en formato chat (hereda la plantilla de Llama 3.1 Instruct).
- Ejecución de tareas de agente en ALFWorld: navegación entre ubicaciones, búsqueda y manipulación de objetos, cumplimiento de instrucciones de alto nivel en lenguaje natural.
- Razonamiento multi-paso orientado a acciones dentro del entorno (secuencias de observación-acción).
- Ajuste específico como política de *behaviour cloning* para inicializar RL.
- Capacidades generales del modelo base (código, matemáticas, multilingüismo) presumiblemente degradadas o no evaluadas tras el SFT; no hay datos que lo confirmen.
- Soporte de tool calling / function calling: no documentado para este checkpoint.
- Modo *thinking*, visión o audio: no disponible.

## Casos de uso

- Inicialización de RL en ALFWorld: el checkpoint sirve como política de arranque con 78,6 % de éxito en desarrollo, reduciendo el número de episodios necesarios antes de que el agente empiece a explorar de forma útil.
- Investigación en *behaviour cloning*: permite reproducir y comparar la receta SFT (200 partidas, lr 1e-5, batch 64) frente a alternativas de recolección de datos o de tamaño de dataset.
- Evaluación de robustez de políticas: con métricas separadas en `valid_seen` (76,4 %) y `valid_unseen` (80,8 %) se puede analizar la generalización a escenarios no vistos.
- Generación de trayectorias sintéticas: usar el modelo para producir rollouts que alimenten posteriores fases de entrenamiento o análisis de errores.
- Estudio de agentes basados en LLM: analizar cómo un modelo de 8B traduce instrucciones en lenguaje natural a acciones discretas en un entorno textual.
- Reproducibilidad de experimentos: al publicarse con hashes sha256 de todos los ficheros, es útil como referencia verificable en comparativas de pipelines de RL.

## Benchmarks y rendimiento

| Benchmark | Metrica | Resultado |
|---|---|---|
| ALFWorld `valid_seen` | Tasa de exito | 76,4 % |
| ALFWorld `valid_unseen` | Tasa de exito | 80,8 % |
| ALFWorld dev-set (media) | Tasa de exito | 78,6 % (4 semillas de muestreo) |

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 32 GB solo para pesos, más overhead de activaciones y KV cache; en la práctica requiere GPU de 40 GB o superior (A100 40/80 GB, H100).
- Al estar en fp32, no cabe en GPUs de consumo tipo RTX 4090 (24 GB) sin cuantización o conversión previa a bf16/fp16 (que reduciría a ~16 GB y sí cabría en una RTX 4090 o RTX 3090).
- Despliegue: compatible con `transformers` y con text-generation-inference (tag `text-generation-inference` y `endpoints_compatible`); también podría servirse con vLLM tras convertir los pesos a bf16. No se documenta soporte GGUF ni Ollama en el repositorio.
- Latencia y throughput: no disponibles en la información proporcionada.
- Almacenamiento: 32,1 GB de repositorio en disco.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento ALFWorld | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Llama-3.1-8B-Instruct-SFT-ALFWorld | 8,03B | no disponible (entrenado a 1280) | 78,6 % dev-set | Llama 3.1 Community | Hugging Face, 0 descargas |
| meta-llama/Llama-3.1-8B-Instruct | 8,03B | 128k | no evaluado en ALFWorld en la informacion disponible | Llama 3.1 Community | Hugging Face, ampliamente usado |
| Otros checkpoints SFT para ALFWorld | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de benchmarks de alternativas comparables en la información proporcionada; la comparativa se limita a la relación con el modelo base.

## Limitaciones y advertencias

- Especialización estrecha: el SFT se hizo solo sobre objetivos de entrenamiento de ALFWorld; el rendimiento en conversación general, código o matemáticas no está evaluado y probablemente sea inferior al del modelo base.
- Riesgo de sobreajuste al formato del entorno: las respuestas están condicionadas a la estructura de observación-acción de ALFWorld; fuera de ese formato el comportamiento puede ser errático.
- Pesos en fp32: el repositorio de 32,1 GB duplica el espacio necesario frente a bf16 y complica el despliegue en hardware limitado.
- Sin datos de sesgos, alucinación o comportamiento multilingüe específicos de este checkpoint.
- Licencia Llama 3.1 Community: impone restricciones de uso (incluida la política de uso aceptable `USE_POLICY.md`) y obligaciones de atribución; conviene revisarlas antes de cualquier uso comercial.
- Modelo con 0 descargas y 0 likes en el momento de la consulta: no hay validación comunitaria ni informes independientes de calidad.
- La fecha de creación indicada (2026-11-15) debe tratarse con cautela; verificar metadatos antes de citarlo.

## Enlaces

- Hugging Face: https://huggingface.co/wayne-SFT/Llama-3.1-8B-Instruct-SFT-ALFWorld
- Modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct
- Licencia del modelo base: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/LICENSE
- Politica de uso: https://huggingface.co/meta-llama/Llama-3.1-8B-Instruct/blob/main/USE_POLICY.md
