# uj-tu/scottyrl-a3-p5_textcraft_grpo

## Resumen

`uj-tu/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 sobre el modelo base `Qwen/Qwen3.5-4B`, publicado por el usuario `uj-tu`. No es un modelo completo ni autónomo: requiere cargar el modelo base y aplicar el adaptador mediante PEFT. El artefacto está asociado a la asignatura 11-768 (AI Agents, CMU), Assignment 3, y se entrenó con el framework `scottyrl` para la tarea TextCraft-Synth.

El nombre del run, `p5_textcraft_grpo`, indica que el entrenamiento se realizó con GRPO (Group Relative Policy Optimization) sobre un entorno textual de agentes. La model card documenta el protocolo de evaluación con vLLM y los splits de validación medium y hard de TextCraft-Synth, pero no incluye resultados, número de tokens de entrenamiento, composición del dataset ni detalles de alineación.

Su relevancia es principalmente reproducible y docente: es un artefacto pequeño (0,2 GB), con configuración y commit identificados, útil para estudiar RL agéntico, evaluar serving de adaptadores LoRA con vLLM y comparar checkpoints. La licencia, los idiomas y la longitud de contexto no están documentados, por lo que no debe asumirse un uso comercial ni un rendimiento generalista sin validación previa.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA de rango 32 sobre un transformer `Qwen/Qwen3.5-4B`; arquitectura interna del base no documentada en la información disponible |
| Parámetros totales | 4B en el modelo base; parámetros del adaptador no disponibles (repo de 0,2 GB) |
| Parámetros activos | No aplica: no es un modelo MoE |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible para el adaptador; no se documentan cuantizaciones del modelo base |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Modelo base | `Qwen/Qwen3.5-4B` (referenciado; ficha y licencia no incluidas en la información proporcionada) |
| Framework de entrenamiento | `scottyrl` |
| Tarea | TextCraft-Synth (entorno textual de agentes) |
| Configuración | `configs/p5_textcraft_grpo.yaml` |
| Commit | `88d1b1fa2aea58938d6d251847ce5559c4ac6558` |

## Arquitectura y entrenamiento

El artefacto es un adaptador PEFT/LoRA de rango 32 sobre `Qwen/Qwen3.5-4B`. La model card indica que se exportó desde `tinker://model_4c0598fa/v50` y que se entrenó con el framework `scottyrl` para la asignatura 11-768 (AI Agents, CMU), Assignment 3. No se especifican la arquitectura interna del base, el número de tokens de entrenamiento, la composición del dataset, la precisión de entrenamiento ni si hubo fases adicionales de RLHF o DPO.

El nombre del run, `p5_textcraft_grpo`, sugiere el uso de GRPO sobre TextCraft-Synth, un entorno textual de agentes. La evaluación documentada se realiza sirviendo el adaptador con vLLM (`--enable-lora --max-lora-rank 32`) y ejecutando `scripts/evaluate_checkpoint.py` con `k=4` sobre los splits de validación medium y hard. No se documentan innovaciones técnicas adicionales como decodificación especulativa, atención lineal o mezcla de expertos.

## Capacidades

- Generación de texto y razonamiento sobre el modelo base `Qwen/Qwen3.5-4B`; el adaptador modifica el comportamiento para la tarea TextCraft-Synth.
- Entrenamiento orientado a tareas agénticas de múltiples pasos en un entorno textual, según el nombre del run y la configuración del curso.
- Integración en bucles de agente: puede emplearse como política de selección de acciones en entornos de texto, siempre que se valide su comportamiento.
- Serving mediante vLLM con soporte LoRA; la model card documenta `--enable-lora` y `--max-lora-rank 32`.
- No se documenta soporte de tool calling ni function calling.
- No se documentan capacidades multilingües; la model card y la tarea están en inglés.
- No se documentan capacidades de visión, audio ni modalidades adicionales.
- No se documenta un modo de razonamiento explícito tipo thinking mode.

## Casos de uso

- Reproducción de la evaluación del curso: servir el adaptador con vLLM y ejecutar `evaluate_checkpoint.py` sobre TextCraft-Synth medium y hard con `k=4`. Es adecuado porque la model card define el protocolo exacto y los artefactos de configuración.
- Laboratorio de aprendizaje por refuerzo para agentes: comparar el checkpoint exportado con otros runs de `scottyrl`, inspeccionar la configuración y analizar el efecto de GRPO en tareas de texto. El commit y el archivo YAML facilitan la trazabilidad.
- Pruebas de infraestructura de serving LoRA: validar enrutado multi-adaptador, carga en caliente y límites de rango LoRA en vLLM. El adaptador es pequeño (0,2 GB) y encaja en entornos de prueba.
- Prototipos de agentes para juegos de texto o entornos de crafting: usar el modelo base más el adaptador como política de selección de acciones en un mundo sintético. Es adecuado por su entrenamiento específico en TextCraft-Synth, aunque requiere validación fuera del conjunto de evaluación.
- Investigación de sobreajuste y reward hacking: evaluar el adaptador en medium frente a hard y comparar con el modelo base sin adaptador. El entrenamiento con GRPO sobre un entorno sintético es un escenario propicio para estudiar estos fenómenos.
- Docencia en cursos de agentes: emplear el adaptador como baseline de la asignación, permitiendo al alumnado inspeccionar la configuración, el commit y el script de evaluación.
- Evaluación comparativa de adaptadores de bajo rango: contrastar rango 32 frente a otros rangos o checkpoints sobre la misma tarea, midiendo el coste de almacenamiento y el comportamiento en validación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

La model card solo documenta el protocolo de evaluación, no métricas obtenidas:

| Elemento | Configuración |
|---|---|
| Servidor | vLLM con `--enable-lora --max-lora-rank 32` |
| Adaptador | `a3=uj-tu/scottyrl-a3-p5_textcraft_grpo` |
| Script | `scripts/evaluate_checkpoint.py` |
| Métrica de evaluación | `k=4` |
| Splits | TextCraft-Synth validation medium y hard |

No se proporcionan resultados de MMLU, HumanEval, GSM8K ni de la propia tarea TextCraft-Synth.

## Requisitos de hardware

- VRAM estimada para el modelo base de 4B, no verificada: en fp16, aproximadamente 8-9 GB solo para pesos; con caché KV y overhead, alrededor de 10-12 GB para contexto corto. En 8 bits, aproximadamente 5-6 GB; en 4 bits, aproximadamente 3-4 GB. El adaptador añade unos 0,2 GB.
- GPU de consumo: una RTX 4090 (24 GB) puede servir el base en fp16 para contexto corto; una RTX 3090 o RTX 4080 (16 GB) requiere cuantización o contextos reducidos; una RTX 3060 (12 GB) es viable en 4 bits para pruebas.
- GPU de datacenter: A100 40/80 GB, H100 o L40S para mayor throughput o para servir varios adaptadores LoRA simultáneamente.
- Despliegue documentado: vLLM con soporte LoRA. No se documentan llama.cpp, Ollama, TGI ni otras opciones para este adaptador concreto.
- Latencia y throughput: no disponibles; no se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| `uj-tu/scottyrl-a3-p5_textcraft_grpo` | 4B base + LoRA rango 32 | No disponible | No disponible | safetensors | HuggingFace |
| `Qwen/Qwen3.5-4B` (base referenciado) | 4B | No disponible | No disponible | No disponible | Referenciado en la metadata |
| Otros adaptadores LoRA para el mismo base | No disponible | No disponible | No disponible | No disponible | No disponible |

No se identifican alternativas comparables documentadas en la información proporcionada. La comparación principal posible es frente al modelo base sin adaptador, pero no se han publicado métricas de ninguno de los dos en la información disponible.

## Limitaciones y advertencias

- No es un modelo autónomo: requiere cargar `Qwen/Qwen3.5-4B` y aplicar el adaptador mediante PEFT.
- La licencia no está disponible; no puede asumirse uso comercial sin verificar la licencia del adaptador y la del modelo base.
- No hay resultados de benchmarks publicados; se desconoce su rendimiento real frente al base o frente a otros adaptadores.
- La evaluación documentada se limita a TextCraft-Synth medium y hard con `k=4`; no cubre otros dominios, idiomas ni tareas generales.
- Los idiomas soportados no están documentados; la model card y la tarea están en inglés.
- El entrenamiento con GRPO sobre un entorno sintético puede inducir sobreajuste al entorno o reward hacking; conviene evaluar en distribuciones fuera de TextCraft-Synth.
- El modelo puede heredar sesgos y alucinaciones del base; no se documenta un proceso de alineación de seguridad.
- La longitud de contexto no está documentada; no debe emplearse en contextos largos sin validación empírica.
- El repositorio tiene 0 descargas y 0 likes, por lo que no cuenta con validación de la comunidad.
- En vLLM es necesario configurar `--max-lora-rank` con un valor igual o superior a 32.
- La ficha del modelo base `Qwen/Qwen3.5-4B` no se incluye en la información proporcionada; su disponibilidad y licencia deben comprobarse antes de desplegar.

## Enlaces

- [Adaptador en HuggingFace](https://huggingface.co/uj-tu/scottyrl-a3-p5_textcraft_grpo)
- [Modelo base referenciado: Qwen/Qwen3.5-4B](https://huggingface.co/Qwen/Qwen3.5-4B)
- No se han proporcionado enlaces a papers, blogs, repositorios o demos adicionales.
- Los resultados de la búsqueda web corresponden a universidades homónimas (University of Johannesburg, University of Jeddah) y no son relevantes para este modelo.
