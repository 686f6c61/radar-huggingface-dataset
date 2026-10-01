# uilydna/scottyrl-a3-p5_textcraft_grpo

## Resumen

`uilydna/scottyrl-a3-p5_textcraft_grpo` es un adaptador LoRA de rango 32 entrenado sobre el modelo base `Qwen/Qwen3.5-4B` por el usuario uilydna y publicado en HuggingFace bajo la libreria PEFT. No es un modelo completo: son pesos de adaptacion (repositorio de 0,2 GB) que requieren cargar el modelo base para realizar inferencia.

El adaptador se ha entrenado con el framework scottyrl en el contexto de la asignatura 11-768 (AI Agents) de la Universidad Carnegie Mellon, como parte de la Assignment 3, y su nombre (`p5_textcraft_grpo`) indica el uso de GRPO (Group Relative Policy Optimization) sobre el entorno TextCraft-Synth. El objetivo declarado es resolver tareas de text crafting de forma agéntica.

Su relevancia es fundamentalmente metodologica: documenta un ciclo completo de RL sobre tareas de agente, desde el entrenamiento con el framework scottyrl (tag `tinker`) hasta la exportacion a PEFT y la evaluacion con vLLM sobre las particiones de validacion medium y hard de TextCraft-Synth. Con cero descargas, cero likes y sin resultados de benchmarks publicados, debe tratarse como un artefacto de investigacion sin validacion externa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (rango 32) sobre `Qwen/Qwen3.5-4B`; arquitectura del modelo base no disponible |
| Parametros totales | no disponible (adaptador LoRA; el modelo base se denomina "4B", sin ficha tecnica en la informacion proporcionada) |
| Longitud de contexto | no disponible (heredada del modelo base `Qwen/Qwen3.5-4B`) |
| Tipos de cuantizacion | no disponible; el adaptador se distribuye en safetensors y la cuantizacion depende del modelo base |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (formato de adaptador PEFT/LoRA) |
| Modelo base | `Qwen/Qwen3.5-4B` |
| Rango LoRA | 32 |
| Libreria | peft |
| Framework de entrenamiento | scottyrl (tag `tinker`) |
| Metodo de optimizacion | GRPO |
| Tamano del repositorio | 0,2 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-30 |
| Fecha de actualizacion | 2026-09-30 |

## Arquitectura y entrenamiento

La informacion disponible describe un adaptador LoRA de rango 32 sobre `Qwen/Qwen3.5-4B`, entrenado con el framework scottyrl para la Assignment 3 de la asignatura 11-768 (AI Agents) de CMU. El nombre de la ejecucion (`p5_textcraft_grpo`) y el tag `tinker` apuntan a un entrenamiento por refuerzo con GRPO, presumiblemente sobre recompensas derivadas del entorno TextCraft-Synth. No se especifican el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo fases previas de SFT, RLHF o DPO.

Tampoco se detalla la arquitectura interna del modelo base (tipo de atencion, uso de MoE, decodificacion especulativa u otras innovaciones), por lo que no es posible confirmar si hereda alguna tecnica destacable del modelo `Qwen/Qwen3.5-4B`. El unico artefacto verificable es el propio adaptador: la model card incluye el commit de git (`ad5663ab72b14aa00fb3c27365fdabca1c67dda4`) y la ruta de exportacion, que apunta a un directorio temporal de trabajo (`/private/tmp/claude-501/.../scratchpad/p5_adapter/adapter`), un indicio de que el artefacto se genero de forma automatizada en el flujo de la asignatura.

## Capacidades

- Generacion de texto y razonamiento de multiples pasos: el adaptador esta entrenado especificamente para tareas de text crafting, que requieren encadenar acciones hasta alcanzar un objetivo.
- Ejecucion de tareas agénticas en entornos textuales: TextCraft-Synth plantea objetivos de crafting resueltos mediante una secuencia de comandos, lo que implica planificacion y manejo de estado.
- Formato de salida compatible con el script de evaluacion del curso (`scripts/evaluate_checkpoint.py`), con `k=4` sobre las particiones medium y hard.
- Servicio como modulo LoRA en vLLM (`--enable-lora --max-lora-rank 32 --lora-modules a3=...`), lo que permite cargarlo junto al modelo base.
- Capacidades generales de conversacion, codigo, matematicas, vision, tool calling, multilingueismo o modo "thinking": no disponibles en la informacion proporcionada. Al ser un adaptador LoRA, cualquier capacidad general procede del modelo base, pero no se documenta su alcance.

## Casos de uso

- Evaluacion de recetas de RL para agentes: el adaptador permite reproducir el pipeline GRPO del curso y comparar variantes de hiperparametros sobre las particiones medium y hard de TextCraft-Synth, usando el script de evaluacion incluido en la model card.
- Servicio multi-adaptador con vLLM: al ser un LoRA de rango 32 declarado en la propia model card, puede desplegarse junto a otros adaptadores del mismo modelo base en un unico servidor vLLM, lo que abarata servir varias politicas especializadas en paralelo.
- Docencia de entrenamiento por refuerzo: sirve como ejemplo minimo y reproducible de un ciclo que va del entrenamiento con GRPO a la exportacion PEFT y la evaluacion automatizada, util en asignaturas de agentes o de RL aplicado.
- Investigacion sobre entornos sinteticos de crafting: TextCraft-Synth es un banco de pruebas de tareas textuales con estado; este adaptador permite estudiar como se comporta una politica entrenada por RL frente a un modelo base sin ajustar.
- Generacion de trayectorias para destilacion o SFT: las rollouts del adaptador en el entorno pueden emplearse como datos de entrenamiento de modelos mas pequenos, siempre que la licencia del modelo base y del adaptador lo permita (no declarada).
- Analisis de sobreajuste en RL: al no haberse publicado cifras de evaluacion, el adaptador es un candidato directo para estudiar degradacion de capacidades generales cuando se optimiza una recompensa estrecha.
- Pruebas de integracion de PEFT con vLLM: util como caso de test para validar versiones de vLLM compatibles con LoRA de rango 32 y con el modelo base indicado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card unicamente describe el procedimiento de evaluacion, sin cifras:

| Aspecto | Detalle |
|---|---|
| Conjunto de evaluacion | TextCraft-Synth, particiones de validacion medium y hard |
| Servidor de inferencia | vLLM con `--enable-lora --max-lora-rank 32` |
| Script | `scripts/evaluate_checkpoint.py --config configs/p5_textcraft_grpo.yaml` |
| Metrica de muestreo | `k=4` |
| Resultados numericos | no disponibles |

## Requisitos de hardware

Las cifras siguientes son estimaciones derivadas de la denominacion "4B" del modelo base; no proceden de documentacion oficial de `Qwen/Qwen3.5-4B`.

- Adaptador: el repositorio ocupa 0,2 GB, por lo que el peso adicional del LoRA en si es despreciable frente al modelo base.
- Pesos del modelo base en bf16: aproximadamente 8 GB, mas cache KV y overhead del runtime.
- Pesos en 8 bits: aproximadamente 4-5 GB. En 4 bits: aproximadamente 2,5-3 GB.
- GPU recomendadas: A100 40/80 GB o H100 para servir con vLLM en bf16 con lotes amplios; RTX 4090 o RTX 3090 (24 GB) son suficientes para bf16 con lotes pequenos.
- Cabe en GPU de consumo: si, en tarjetas de 24 GB sin cuantizacion y en tarjetas de 12 GB con cuantizacion de 4 bits; en 8 GB la cuantizacion de 4 bits queda muy ajustada.
- Despliegue: vLLM con soporte LoRA (procedimiento indicado por el autor), PEFT + transformers, TGI con adaptadores, o fusion del adaptador con el modelo base (`merge_and_unload`) y conversion posterior a GGUF para llama.cpp u Ollama.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No se dispone de informacion sobre adaptadores comparables publicados en la misma categoria. La unica referencia verificable es el modelo base:

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `uilydna/scottyrl-a3-p5_textcraft_grpo` (adaptador LoRA) | no disponible | no disponible | no publicado | no disponible | HuggingFace, 0 descargas |
| `Qwen/Qwen3.5-4B` (modelo base) | ~4.000 millones segun denominacion | no disponible | no disponible en esta informacion | no disponible | HuggingFace |
| Otros adaptadores de la misma asignatura o framework | no disponibles | no disponibles | no disponibles | no disponibles | no disponibles |

## Limitaciones y advertencias

- Licencia no declarada: no hay ninguna indicacion sobre uso comercial, lo que impide integrarlo en produccion con garantias legales.
- Ausencia total de validacion externa: cero descargas y cero likes; no hay evidencia de terceros que hayan reproducido el resultado.
- Sin cifras de rendimiento: no se publican resultados en las particiones medium o hard de TextCraft-Synth, por lo que no se puede afirmar que el adaptador mejore al modelo base.
- Artefacto de curso: la model card remite a rutas locales y a ficheros de configuracion (`configs/p5_textcraft_grpo.yaml`, `scripts/evaluate_checkpoint.py`) que no forman parte del repositorio de HuggingFace, lo que limita la reproducibilidad directa.
- Riesgo de sobreajuste y de reward hacking: el entrenamiento con GRPO sobre una recompensa estrecha en un entorno sintetico puede degradar capacidades generales y producir comportamientos que solo funcionan dentro de TextCraft-Synth.
- Dependencia del modelo base: cualquier sesgo, limitacion de contexto o restriccion de idioma proviene de `Qwen/Qwen3.5-4B`, del que no se aporta ficha en la informacion disponible.
- Riesgo de alucinacion: no evaluado ni documentado; al tratarse de una politica optimizada para un entorno concreto, no hay datos sobre su comportamiento fuera de distribucion.
- Trazabilidad limitada: la ruta de exportacion apunta a un directorio temporal de un asistente (`/private/tmp/claude-501/...`), lo que sugiere una generacion automatizada sin revision detallada publicada.

## Enlaces

- HuggingFace del adaptador: https://huggingface.co/uilydna/scottyrl-a3-p5_textcraft_grpo
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-4B
- La busqueda web realizada no devolvio enlaces relevantes sobre este modelo, su framework de entrenamiento ni el entorno TextCraft-Synth; los resultados obtenidos correspondian a herramientas comerciales sin relacion con el artefacto.
