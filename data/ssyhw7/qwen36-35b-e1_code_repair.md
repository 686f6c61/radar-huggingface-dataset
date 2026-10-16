# ssyhw7/qwen36-35b-e1_code_repair

## Resumen

qwen36-35b-e1_code_repair es un adaptador LoRA de rango 32 entrenado sobre el modelo base Qwen/Qwen3.6-35B-A3B (revision `995ad96eacd98c81ed38be0c5b274b04031597b0`). Lo publica el usuario ssyhw7 en HuggingFace como parte de un estudio de "entrenamiento multi-experto y merging", en el que cada experto se especializa en una tarea distinta. Este experto concreto asume el rol de reparacion de codigo: se ha ajustado sobre trayectorias de agente del tipo issue-a-patch, es decir, secuencias en las que un agente lee un informe de fallo de un repositorio, explora el codigo y produce un parche.

El adaptador no modifica el router del modelo base, pero si todas las proyecciones lineales: atencion (q/k/v/o), las proyecciones de Gated-DeltaNet (in_proj_q/k/v/z y out_proj), el experto compartido (gate/up/down), las matrices de los 256 expertos enrutados (w1/w2/w3, fusionadas en 3D) y la capa de desembebido (lm_head). El entrenamiento se hizo con Tinker en bf16 sobre 1206 ejemplos y 4.051.850 tokens de perdida, con 76 pasos, batch 32, LR 1e-4 y schedule coseno con 20 pasos de warmup.

Es relevante ahora por dos motivos. Primero, por el objeto de la evaluacion: apunta a SWE-bench Pro v2-hard, un benchmark de reparacion de incidencias en repositorios reales, y aplica controles de contaminacion explicitos (exclusion de los 11 repositorios de SWE-bench Pro, de los identificadores de instancia, de nombres de tareas de Terminal-Bench 2.0 y de identificadores de proyecto de ASI-Bench, ademas de filtro de canario HLE y de solapamiento de 13-gramas). Segundo, porque el repositorio es un adaptador de 2,2 GB que se carga sobre el base con PEFT o vLLM, lo que abarata mucho la experimentacion frente a un fine-tuning completo. Aviso importante: en la informacion disponible no hay resultados de benchmark publicados para este experto; el propio autor indica que la evaluacion esta pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer MoE hibrido con Gated-DeltaNet y atencion (modelo base Qwen3.6-35B-A3B) |
| Parametros totales | 35B en el modelo base (segun nomenclatura); el adaptador anade 2,2 GB de pesos (repositorio) |
| Parametros activos | Aproximadamente 3B segun la nomenclatura A3B del modelo base; no confirmado en la informacion disponible |
| Longitud de contexto | 32768 tokens en entrenamiento; la del modelo base no se detalla en la informacion disponible |
| Tipos de cuantizacion | no disponible (el adaptador se exporta en bf16; no se listan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | en, zh |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA, libreria peft) |
| Modelo base | Qwen/Qwen3.6-35B-A3B, revision 995ad96eacd98c81ed38be0c5b274b04031597b0 |
| Rango / alpha LoRA | 32 / 32 (escala 1.0) |
| Modulos objetivo | self_attn q/k/v/o; Gated-DeltaNet in_proj_q/k/v/z y out_proj; shared_expert gate/up/down; expertos enrutados w1/w2/w3 (3D fusionado, 256 expertos); unembed (lm_head); el router no se adapta |
| Tamano del repositorio | 2,2 GB |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El objeto publicado no es un modelo completo, sino un adaptador de bajo rango. El modelo base es un MoE de 35B parametros totales con unos 3B activos por token (nomenclatura A3B) que combina atencion clasica con capas Gated-DeltaNet, una forma de atencion lineal. El adaptador se aplica sobre todas las proyecciones lineales relevantes, incluidas las matrices de los 256 expertos enrutados, que vienen fusionadas en un tensor 3D con uno de los lados compartido entre expertos; el router queda intacto, de modo que la seleccion de expertos no se altera y solo cambia el computo dentro de cada experto y de las capas de atencion. Esta eleccion es poco habitual: la mayoria de adaptadores LoRA publicos solo tocan q_proj y v_proj, mientras que aqui se cubre tambien el experto compartido y la lm_head.

El entrenamiento se gestiono con Tinker sobre datos de trayectorias de agente issue-a-patch. La mezcla final conserva 805 de 2500 filas de SWE-smith-trajectories, 114 de 1400 de SWE-Gym OpenHands Sampled Trajectories, 435 de 491 de SWE-Gym OpenHands SFT Trajectories y 202 de 600 de nvidia/Nemotron-SWE-v1, con licencias MIT (el codigo de los repositorios conserva la suya) y CC-BY-4.0 respectivamente. El muestreo esta limitado por ancho de banda, no por curacion semantica, y el propio autor lo advierte. El checkpoint se eligio por perdida de validacion mas baja sobre una particion reservada de la mezcla de entrenamiento (0.1600 en el paso 76), sin usar nunca datos de benchmark para la seleccion. No se menciona RLHF ni DPO, ni decodificacion especulativa u otras optimizaciones de inferencia.

## Capacidades

- Reparacion de codigo orientada a incidencias: el modelo esta ajustado para recibir un informe de fallo y producir un parche aplicable, siguiendo el formato de trayectorias issue-a-patch.
- Razonamiento agente multi-paso: las trayectorias de entrenamiento provienen de agentes SWE (OpenHands, SWE-Gym, SWE-smith), de modo que el formato esperado incluye exploracion del repositorio, lectura de ficheros y edicion iterativa.
- Generacion y edicion de codigo en el contexto de un repositorio existente, con ventana de entrenamiento de 32768 tokens.
- Uso de herramientas y function calling: implicito en el formato de trayectorias de agente; no se detalla un esquema concreto de tool calling en la informacion disponible.
- Multilingue limitado a ingles y chino (en, zh) segun las etiquetas del repositorio.
- Capacidad de thinking mode, vision o audio: no disponible en la informacion proporcionada.
- Al ser un adaptador, hereda las capacidades generales del modelo base Qwen3.6-35B-A3B, aunque el ajuste esta enfocado a codigo.

## Casos de uso

- Reparacion automatica de incidencias en CI: ante un fallo de test en un repositorio, el modelo recibe el traceback y el contexto de los ficheros implicados y genera un parche candidato con una ventana de 32k tokens, suficiente para incluir varios ficheros y el log completo del fallo.
- Agente SWE autonomo en produccion: integrado en un bucle de agente con herramientas de lectura y escritura de ficheros, puede reproducir el fallo, localizar la causa y proponer la correccion, tal como se entreno sobre trayectorias de OpenHands y SWE-smith.
- Triaje y priorizacion de incidencias: dado un listado de bugs sin resolver, el modelo puede clasificarlos y sugerir que ficheros tocar primero, aprovechando el ajuste sobre datos de reparacion real.
- Migracion o refactorizacion guiada por errores: cuando una actualizacion de dependencia rompe la compilacion, el modelo puede leer los errores del compilador y proponer los cambios de API necesarios.
- Generacion de parches de seguridad: ante un aviso de vulnerabilidad en una funcion concreta, el modelo puede producir una version corregida y explicar el cambio, siempre que un revisor humano valide el resultado.
- Asistente de revision de pull requests: el modelo puede comparar un diff con el informe de la incidencia asociada y senalar casos en los que el parche no cubre el problema descrito.
- Investigacion sobre merging de expertos: al ser uno de varios adaptadores de un mismo estudio, sirve como pieza de un pipeline de mezcla de pesos para construir un modelo multi-tarea, siempre que se disponga de los demas expertos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que los resultados de este experto estan "pending (evaluation not yet run)" y remite al README del repositorio de codigo para las cifras globales del estudio, que no se incluyen en la informacion facilitada. El objetivo declarado es SWE-bench Pro v2-hard, pero no hay numeros asociados.

| Benchmark | Resultado | Nota |
|---|---|---|
| SWE-bench Pro v2-hard | no disponible | Benchmark objetivo declarado; evaluacion pendiente segun la model card |
| Perdida de validacion (dev loss) | 0.1600 en el paso 76 | Metrica de seleccion de checkpoint sobre una particion reservada de la mezcla de entrenamiento |
| Resto de benchmarks (MMLU, HumanEval, GSM8K, etc.) | no disponible | No reportados en la informacion proporcionada |

## Requisitos de hardware

- VRAM estimada para el modelo base, en funcion de la precision (estimacion a partir de los 35B parametros, no confirmada por el autor): unos 70 GB en bf16/fp16, unos 35 GB en int8 y aproximadamente 18-20 GB en cuantizacion de 4 bits.
- El adaptador anade unos 2,2 GB de pesos (el repositorio completo ocupa ese tamano), que se suman al modelo base durante la carga.
- El modelo base es MoE con unos 3B parametros activos, por lo que el coste de computo por token es bajo, pero el requisito de memoria sigue dictado por los 35B totales.
- GPU recomendadas (estimacion): A100 80 GB o H100 80 GB para bf16 sin cuantizar; A100 40 GB, L40S o RTX 6000 Ada para int8; RTX 4090 (24 GB) solo con cuantizacion de 4 bits y dependiendo de la longitud de contexto.
- No cabe en GPUs de consumo con menos de 24 GB de VRAM salvo cuantizacion agresiva y contextos cortos.
- Opciones de despliegue: vLLM con soporte LoRA (`vllm serve Qwen/Qwen3.6-35B-A3B --enable-lora --lora-modules e1_code_repair=<ruta>`), y carga directa con transformers + peft segun el ejemplo de la model card. Soporte en llama.cpp, Ollama o TGI: no disponible en la informacion proporcionada.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| qwen36-35b-e1_code_repair (este) | 35B totales, ~3B activos; adaptador LoRA r32 | 32768 tokens en entrenamiento | Sin resultados publicados (evaluacion pendiente) | apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3.6-35B-A3B (modelo base) | 35B totales, ~3B activos | no disponible | No disponible en la informacion proporcionada | No disponible en la informacion proporcionada | HuggingFace |
| Otros adaptadores LoRA de reparacion de codigo | no disponible | no disponible | no disponible | no disponible | no se han identificado alternativas comparables en la informacion proporcionada |

No se dispone de datos de benchmarks ni de especificaciones detalladas de alternativas en la informacion proporcionada, por lo que la comparacion con otros modelos de la misma categoria queda como "no disponible".

## Limitaciones y advertencias

- Ausencia total de evaluacion publicada: el autor afirma que los resultados de este experto estan pendientes y que no se reclama ninguna mejora mas alla de lo que muestren las tablas de evaluacion, que no se incluyen.
- Entrenamiento sobre muestras limitadas por ancho de banda: se conservaron 805 de 2500 filas en SWE-smith, 114 de 1400 en SWE-Gym Sampled, 435 de 491 en SWE-Gym SFT y 202 de 600 en Nemotron-SWE, sin criterio de curacion semantica documentado.
- Riesgo de alucinacion en parches: como cualquier modelo de codigo, puede generar cambios sintacticamente validos pero semanticamente incorrectos o que rompan otros tests; requiere revision humana antes de fusionar.
- Contaminacion: se aplicaron controles explicitos (exclusion de repositorios e identificadores de SWE-bench Pro, nombres de Terminal-Bench 2.0, identificadores de ASI-Bench, canario HLE y filtro de solapamiento de 13-gramas), pero estos controles se describen en el repositorio de codigo, no en detalle en la model card.
- Idiomas: solo ingles y chino declarados. El rendimiento en castellano no esta garantizado.
- Contexto: el entrenamiento usa 32768 tokens; no se especifica si el modelo base soporta ventanas mayores ni como se comporta el adaptador fuera de ese rango.
- Licencia del adaptador: apache-2.0, lo que permite uso comercial del adaptador, pero el modelo base y los repositorios de codigo usados en el entrenamiento conservan sus propias licencias y condiciones.
- Origen de datos: parte de los datos upstream (TMax) contiene contenido generado por Gemini y esta sujeto a los terminos de Google, segun advierte el propio autor.
- Repositorio sin traccion: 0 descargas y 0 likes en el momento de la consulta, sin validacion independiente por parte de la comunidad.
- El router no se adapta, de modo que la especializacion depende de cambios dentro de los expertos y de las capas de atencion; el efecto real sobre el enrutamiento no esta documentado.
- Restricciones de licencia para uso comercial: el adaptador es apache-2.0, pero debe verificarse la licencia del modelo base y de los repositorios de codigo empleados antes de un despliegue comercial.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/ssyhw7/qwen36-35b-e1_code_repair
- Modelo base: https://huggingface.co/Qwen/Qwen3.6-35B-A3B
- Repositorio de codigo del estudio: https://github.com/HanyangWang0418-oss/qwen36-merge-takehome
- Dataset SWE-smith-trajectories: https://huggingface.co/datasets/SWE-bench/SWE-smith-trajectories
- Dataset SWE-Gym OpenHands Sampled Trajectories: https://huggingface.co/datasets/SWE-Gym/OpenHands-Sampled-Trajectories
- Dataset SWE-Gym OpenHands SFT Trajectories: https://huggingface.co/datasets/SWE-Gym/OpenHands-SFT-Trajectories
- Dataset Nemotron-SWE-v1: https://huggingface.co/datasets/nvidia/Nemotron-SWE-v1
