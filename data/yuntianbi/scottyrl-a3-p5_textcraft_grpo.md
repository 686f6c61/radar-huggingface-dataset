# yuntianbi/scottyrl-a3-p5_textcraft_grpo

## Resumen

`scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario `yuntianbi` en HuggingFace. Se trata de un artefacto de caracter académico: fue entrenado con el framework `scottyrl` para la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon, dentro de la Assignment 3. El adaptador se exportó desde una ejecución de Tinker (`tinker://model_bd148081/v50`) y su nombre de ejecución es `p5_textcraft_grpo`, lo que sugiere un entrenamiento con GRPO (Group Relative Policy Optimization) orientado a tareas de manipulación de texto en el entorno TextCraft.

El modelo no es un modelo fundacional autónomo, sino un conjunto de pesos PEFT que debe cargarse junto al modelo base de 4 000 millones de parámetros de Qwen. Su propósito declarado es resolver tareas de agente sobre las particiones de validación `medium` y `hard` del conjunto TextCraft-Synth, evaluadas con un script del curso mediante un servidor vLLM con soporte de LoRA.

La relevancia de esta ficha es limitada fuera del contexto docente: el repositorio no incluye model card descriptiva, licencia, idiomas ni resultados de benchmarks publicados, y cuenta con cero descargas y cero likes en el momento de la consulta. Resulta útil, eso sí, como ejemplo reproducible de un pipeline de RL (GRPO) sobre un modelo pequeño con despliegue vía vLLM y LoRA dinámico.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer denso Qwen/Qwen3.5-4B |
| Parametros totales | No disponible (el adaptador LoRA de rango 32 sobre un base de 4B; el repositorio ocupa 0,2 GB) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del modelo base Qwen3.5-4B; no especificada en la informacion) |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantizacion depende del modelo base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Rango LoRA | 32 |
| Modelo base | Qwen/Qwen3.5-4B |
| Framework de entrenamiento | scottyrl sobre Tinker |
| Libreria | peft |
| Tamano del repositorio | 0,2 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `Qwen/Qwen3.5-4B`, un transformer denso de 4 000 millones de parámetros del que no se detallan en la información proporcionada ni la composición del dataset de preentrenamiento ni la ventana de contexto. El adaptador en sí es un LoRA de rango 32, lo que implica un número reducido de parámetros entrenables inyectados en las capas del modelo base, distribuidos en un repositorio de 0,2 GB en formato safetensors.

El entrenamiento se realizó con el framework `scottyrl` y se exportó desde Tinker. El sufijo `grpo` del nombre de ejecución indica el uso de Group Relative Policy Optimization, una variante de optimización por política con recompensas relativas dentro de grupos de muestras, habitual en el ajuste de modelos para tareas de agente con recompensa verificable. El objetivo declarado es el conjunto TextCraft-Synth, un entorno de síntesis y manipulación de textos con niveles de dificultad `medium` y `hard`. No se especifican en la información disponible el número de pasos, el tamaño del batch, la composición exacta del dataset ni si hubo fases previas de SFT.

## Capacidades

- Generación de texto y razonamiento de agente sobre el modelo base Qwen3.5-4B, con el ajuste específico inducido por el adaptador LoRA.
- Ejecución de tareas de manipulación de texto en el entorno TextCraft-Synth, incluyendo las particiones de validación `medium` y `hard`.
- Despliegue como módulo LoRA adicional en un servidor vLLM (`--enable-lora --max-lora-rank 32 --lora-modules`), lo que permite servirlo junto al modelo base sin duplicar pesos.
- Evaluación con decodificación por muestreo múltiple (`--k 4`) según el script del curso, lo que sugiere capacidad de generar varias trayectorias por prompt.
- Capacidades de tool calling, function calling, visión, audio o modo thinking: no disponibles en la información proporcionada (dependen del modelo base y no se documentan en el adaptador).
- Soporte multilingüe: no disponible.

## Casos de uso

- Evaluación académica reproducible: el adaptador está pensado para servirse con vLLM y ejecutar `scripts/evaluate_checkpoint.py` sobre las particiones `medium` y `hard` de TextCraft-Synth, de modo que un evaluador puede reproducir la métrica del curso con un único comando.
- Estudio de GRPO sobre modelos pequeños: sirve como referencia para analizar cómo un LoRA de rango 32 modifica el comportamiento de un base de 4B en tareas de agente con recompensa verificable, comparando el adaptador contra el base sin ajustar.
- Servido multi-adaptador con vLLM: al cargarse como módulo LoRA (`--lora-modules a3=...`), permite mantener el base Qwen3.5-4B en memoria y alternar entre adaptadores en un mismo servidor, útil en laboratorios con recursos limitados.
- Investigación en entornos TextCraft: permite experimentar con estrategias de síntesis de textos y planificación de acciones en un dominio controlado, con dificultad graduada (`medium` frente a `hard`).
- Docencia y formación en RL para agentes: el repositorio documenta el flujo completo (configuración YAML, commit de git, exportación desde Tinker), lo que lo convierte en material didáctico para cursos de posgrado sobre agentes LLM.
- Pruebas de integración de pipelines PEFT: al ser un adaptador pequeño (0,2 GB), es adecuado para validar flujos de carga de adaptadores en `peft`, `transformers` y vLLM sin necesidad de GPUs de gran capacidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card únicamente describe el procedimiento de evaluación (vLLM con LoRA, `k=4`, particiones `medium` y `hard` de TextCraft-Synth) sin incluir métricas numéricas.

## Requisitos de hardware

- VRAM estimada para inferencia: el adaptador LoRA añade un coste marginal sobre el modelo base. Para Qwen3.5-4B en precisión BF16 se requieren aproximadamente 8-9 GB de VRAM solo para pesos, más overhead de KV cache y activaciones; en cuantización de 4 bits el base puede ocupar del orden de 2,5-3 GB.
- GPU recomendadas: A100 (40/80 GB) o H100 para servir el base con contexto amplio y varios adaptadores LoRA concurrentes; L40S o RTX 6000 Ada como alternativas de centro de datos.
- GPU de consumo: cabe en tarjetas con 12 GB o más en BF16 (RTX 3090, RTX 4090, RTX 4080) y en tarjetas de 8 GB si se cuantiza el base a 4 bits.
- Opciones de despliegue: vLLM es el método documentado por el autor (`vllm serve Qwen/Qwen3.5-4B --enable-lora --max-lora-rank 32 --lora-modules a3=...`). También son viables `transformers` + `peft` para carga directa del adaptador; llama.cpp y Ollama requerirían fusionar el adaptador con el base y convertir a GGUF, un proceso no documentado por el autor.
- Latencia y throughput: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| scottyrl-a3-p5_textcraft_grpo | LoRA r32 sobre base de 4B | No disponible | Adaptador PEFT | No disponible | HuggingFace (0 descargas) |
| Qwen/Qwen3.5-4B (base) | 4B | No disponible en la informacion | Modelo denso completo | No disponible en la informacion | HuggingFace |
| Otros adaptadores scottyrl de la misma serie | LoRA sobre base de 4B | No disponible | Adaptador PEFT | No disponible | HuggingFace (mismo autor) |

No se dispone de datos de rendimiento comparables entre estas opciones en la información proporcionada.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `Qwen/Qwen3.5-4B` como base; el repositorio solo contiene los pesos del adaptador LoRA.
- Ausencia total de model card descriptiva: no se documentan sesgos, datos de entrenamiento, idiomas ni comportamiento esperado fuera de TextCraft-Synth.
- Licencia no especificada: no puede asumirse uso comercial; debe verificarse la licencia del modelo base Qwen3.5-4B por separado antes de cualquier despliegue en producción.
- Especialización estrecha: el ajuste GRPO está orientado a las particiones `medium` y `hard` de TextCraft-Synth, por lo que el rendimiento en tareas generales puede degradarse respecto al base.
- Riesgo de alucinación: no evaluado ni documentado; al ser un ajuste con RL sobre un dominio concreto, no hay garantías sobre la fidelidad factual en dominios abiertos.
- Contexto e idiomas: no disponibles; cualquier afirmación sobre ventana de contexto o cobertura lingüística debe contrastarse con la documentación del modelo base.
- Artefacto académico sin mantenimiento: cero descargas y cero likes en el momento de la consulta, sin garantía de soporte ni actualizaciones.
- Reproducibilidad dependiente de Tinker: la exportación se realizó desde `tinker://model_bd148081/v50`, un identificador interno que no es accesible públicamente.

## Enlaces

- HuggingFace: https://huggingface.co/yuntianbi/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- Repositorio del framework scottyrl: no disponible en la información proporcionada
- Paper o blog de GRPO: no disponible en la información proporcionada
- Documentación de vLLM sobre LoRA: no disponible en la información proporcionada
- Curso 11-768 (AI Agents, CMU): no disponible en la información proporcionada
