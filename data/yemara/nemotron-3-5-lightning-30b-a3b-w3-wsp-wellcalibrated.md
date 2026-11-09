# yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WSP-WellCalibrated

## Resumen

Nemotron-3.5-Lightning-30B-A3B-W3-WSP-WellCalibrated es un checkpoint cuantizado a 3 bits del modelo NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4, publicado por el usuario yemara. No se trata de un modelo entrenado desde cero, sino de una reparacion de cuantizacion: un agente LLM partio de un checkpoint GPTQ de 3 bits bien calibrado, leyo sus pesos y activaciones y edito directamente tres matrices (el 0,001 % de los pesos) para reducir el error de redondeo ponderado por el tamano de activacion. El resultado es un checkpoint de 3 bits que recupera buena parte del rendimiento perdido respecto al release original en NVFP4.

El modelo base emplea una arquitectura hibrida de mezcla de expertos (MoE) con capas intercaladas Mamba-2 y MoE, ademas de capas de atencion selectivas. El sufijo A3B indica aproximadamente 3 mil millones de parametros activos sobre un total de 30 mil millones, lo que lo situa en la categoria de modelos eficientes en inferencia. NVIDIA lo publico junto con metodos de decodificacion especulativa para acelerar la generacion de texto.

La relevancia de esta ficha radica en que demuestra una tecnica de reparacion post-cuantizacion que recupera entre 2 y 7 puntos en benchmarks de razonamiento y codigo sin reentrenar ni ajustar pesos a datos, manteniendo la licencia OpenMDW-1.1 del modelo fuente. Es un caso practico de como la edicion quirurgica de pesos puede mitigar la degradacion tipica de la cuantizacion agresiva a 3 bits.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Hibrida MoE con capas Mamba-2 y MoE intercaladas y capas de atencion selectivas (nemotron_h) |
| Parametros totales | 30B (aproximado, segun nomenclatura 30B-A3B) |
| Parametros activos | 3B (aproximado, segun nomenclatura A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 3 bits (GPTQ bien calibrado, reparado por edicion de pesos); el modelo base se distribuye en NVFP4 |
| Idiomas soportados | no disponible |
| Licencia | OpenMDW-1.1 |
| Formato de pesos | Checkpoint cuantizado a 3 bits con script `dequantize.py` para reconstruir un checkpoint BF16; repo de 17,3 GB |

## Arquitectura y entrenamiento

El modelo base NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 utiliza una arquitectura hibrida de mezcla de expertos que intercala capas Mamba-2 (modelo de espacio de estados) con capas MoE y capas de atencion selectivas. Esta combinacion busca reducir el coste computacional de la atencion en contextos largos manteniendo la capacidad de modelado. El modelo se publico junto con tecnicas de decodificacion especulativa para acelerar la inferencia.

Este checkpoint concreto no ha sido entrenado: parte de un GPTQ de 3 bits bien calibrado y aplica una reparacion mediante "agent weight space programming". Un agente LLM inspecciona pesos y activaciones y edita tres matrices (0,001 % de los pesos) para corregir el error de redondeo escalado por el tamano de activacion. No se ajustaron pesos a datos; la edicion es directa sobre el espacio de pesos. Los pesos de 3 bits se desquantizan a BF16 para servirse con vLLM en una sola GPU. No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset ni el uso de RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento de proposito general, con rendimiento medido en MMLU (74,1) y GPQA Diamond (63,0).
- Razonamiento matematico: GSM8K (92,1) y MATH-500 (84,6).
- Generacion de codigo: LiveCodeBench v6 (41,2).
- Capacidad de servir con vLLM tras desquantizar a BF16.
- El modelo base incorpora metodos de decodificacion especulativa para acelerar la generacion.
- Soporte de tool calling, agentes y capacidades multilingues: no disponible en la informacion proporcionada.
- Capacidades de vision o audio: no disponible en la informacion proporcionada.

## Casos de uso

- Despliegue en una sola GPU con vLLM: tras ejecutar `dequantize.py` para reconstruir el checkpoint BF16, el modelo puede servirse en un unico acelerador, lo que facilita entornos de inferencia con recursos limitados.
- Razonamiento matematico asistido: con GSM8K de 92,1 y MATH-500 de 84,6, es adecuado para tutoria automatica, verificacion de problemas y generacion de soluciones paso a paso en entornos educativos.
- Generacion de codigo en pipelines de desarrollo: LiveCodeBench v6 de 41,2 permite integrarlo como asistente de programacion o para autocompletar y revisar fragmentos en herramientas de CI/CD, aunque con cautela por la caida respecto al release NVFP4.
- Evaluacion de tecnicas de cuantizacion: sirve como referencia reproducible para investigar la reparacion post-cuantizacion y comparar el impacto de la edicion de pesos frente a la calibracion tradicional.
- Investigacion en eficiencia de inferencia: la arquitectura hibrida Mamba-2/MoE con 3B activos sobre 30B totales permite estudiar el equilibrio entre calidad y coste computacional en produccion.
- Prototipado de agentes con presupuesto de memoria reducido: el checkpoint de 3 bits (17,3 GB en repo) ocupa menos espacio que una version BF16 completa, lo que simplifica el almacenamiento y la distribucion en entornos de prueba.
- Benchmarking comparativo de checkpoints cuantizados: util para validar si la reparacion de pesos generaliza a otros dominios antes de adoptar una version de 3 bits en produccion.

## Benchmarks y rendimiento

| Checkpoint | Pesos editados | GSM8K | MATH-500 | LiveCodeBench v6 | GPQA Diamond | MMLU | WikiText-2 PPL |
|---|---|---|---|---|---|---|---|
| NVFP4 release | – | 95,0 | 88,8 | 55,2 | 71,1 | 77,1 | 8,08 |
| Well-calibrated 3-bit | – | 91,6 | 80,8 | 39,2 | 59,6 | 67,2 | 11,15 |
| + agent edits (este repo) | 0,001 % | 92,1 | 84,6 | 41,2 | 63,0 | 74,1 | 8,87 |

Los resultados proceden de la model card del autor, con conjuntos de prueba ejecutados una sola vez. Los pesos de 3 bits se desquantizaron a BF16 y se sirvieron con vLLM en una GPU.

## Requisitos de hardware

- VRAM estimada: el repo ocupa 17,3 GB en 3 bits; tras desquantizar a BF16 el checkpoint completo requiere aproximadamente 60 GB para 30B parametros, aunque con 3B activos el consumo en inferencia es menor.
- GPU recomendadas: A100 (40/80 GB) o H100 para servir el checkpoint BF16 completo; el checkpoint de 3 bits puede caber en GPUs consumer de gama alta con suficiente VRAM.
- Cabe en consumer GPU: el checkpoint cuantizado de 17,3 GB es compatible con GPUs de 24 GB o mas; la version BF16 desquantizada requiere GPUs profesionales.
- Opciones de despliegue: vLLM (segun la model card, tras ejecutar `dequantize.py`); no se mencionan llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Nemotron-3.5-Lightning-30B-A3B-W3-WSP (este) | 30B totales / 3B activos | no disponible | OpenMDW-1.1 | Hugging Face (yemara) |
| NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4 | 30B totales / 3B activos | no disponible | OpenMDW-1.1 | Hugging Face (nvidia) |
| Kimi K2 0905 | no disponible | no disponible | no disponible | no disponible |
| Llama 3.1 Nemotron Ultra 253B v1 | 253B | no disponible | no disponible | no disponible |
| Qwen3 VL 235B A22B Instruct | 235B totales / 22B activos | no disponible | no disponible | no disponible |

Las alternativas Kimi K2 0905, Llama 3.1 Nemotron Ultra 253B v1 y Qwen3 VL 235B A22B Instruct se citan como las mas comparadas segun llm-stats.com; no se dispone de sus especificaciones detalladas ni de benchmarks comparativos en la informacion proporcionada.

## Limitaciones y advertencias

- Degradacion respecto al release NVFP4: pierde 2,9 puntos en GSM8K, 4,2 en MATH-500, 14,0 en LiveCodeBench v6, 8,1 en GPQA Diamond y 3,0 en MMLU, con peor perplejidad en WikiText-2 (8,87 frente a 8,08).
- La reparacion se valido con una sola ejecucion de cada test; no hay evidencia de robustez estadistica ni de generalizacion a otros dominios.
- Los pesos editados representan solo el 0,001 % del total; la mejora puede no transferirse a tareas fuera de los benchmarks medidos.
- Riesgo de alucinacion inherente al modelo base y potencialmente amplificado por la cuantizacion a 3 bits.
- Idiomas soportados no documentados; no se garantiza un comportamiento multilingue equivalente al modelo original.
- Licencia OpenMDW-1.1: es necesario revisar sus terminos para uso comercial; el archivo `LICENSE` del repo corresponde al del modelo fuente y conserva sus avisos.
- El repo no incluye pesos en formato GGUF ni soporte documentado para llama.cpp u Ollama; el flujo recomendado exige desquantizar a BF16 y servir con vLLM.
- No se dispone de informacion sobre sesgos conocidos, longitud de contexto efectiva ni latencia en produccion.

## Enlaces

- Hugging Face: https://huggingface.co/yemara/Nemotron-3.5-Lightning-30B-A3B-W3-WSP-WellCalibrated
- Modelo base: https://huggingface.co/nvidia/NVIDIA-Nemotron-3.5-Lightning-30B-A3B-NVFP4
- Blog post de la tecnica: https://abdelfattah-lab.github.io/blogs/wsp-quant-repair/
- Licencia OpenMDW-1.1: https://openmdw.ai/license/1-1/
- Ficha en NVIDIA NIM: https://build.nvidia.com/nvidia/nemotron-3.5-lightning-30b-a3b/modelcard
- Benchmarks y comparativas: https://llm-stats.com/models/nemotron-3.5-lightning-30b-a3b
