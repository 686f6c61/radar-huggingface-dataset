# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo4620-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo4620-lora` es un adaptador LoRA (PEFT) entrenado sobre el modelo instructivo `Qwen/Qwen2.5-0.5B-Instruct` mediante Group Relative Policy Optimization (GRPO) durante 4.620 actualizaciones. Lo desarrolla el usuario uygarkurt dentro de su proyecto Post-Training Lab, y su objetivo es muy concreto: mejorar la precisión de las llamadas a herramientas (tool calling estructurado) y, sobre todo, la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la petición del usuario.

El adaptador no es un modelo generalista nuevo, sino un ajuste fino de alineamiento sobre una base de 0,49 mil millones de parámetros. Su interés práctico está en que demuestra que GRPO aplicado desde el modelo instructivo base, sin SFT previo, puede mejorar métricas de función-calling en un modelo muy pequeño y desplegable en CPU o en GPUs de gama baja, a costa de una ligera degradación en capacidades generales como MMLU o IFEval.

Es relevante ahora porque el patrón "modelo pequeño + RL para tool calling + abstención fiable" es exactamente lo que se busca para agentes ligeros, enrutadores de funciones y sistemas con requisitos estrictos de latencia y coste, donde un modelo de 0,5 B puede bastar para decidir qué función invocar antes de delegar en un modelo mayor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), adaptador LoRA sobre el modelo base |
| Parametros totales | 0,49 B en el modelo base Qwen2.5-0.5B-Instruct; el adaptador LoRA añade un conjunto reducido de pesos (rango y módulos objetivo no disponibles en la información proporcionada) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; el modelo base Qwen2.5-0.5B-Instruct declara 32.768 tokens en su propia model card |
| Tipos de cuantizacion | No disponible para el adaptador; se distribuye en safetensors. Para cuantizar hay que fusionar el adaptador con el modelo base y convertir el resultado |
| Idiomas soportados | Inglés (`en`) según los metadatos del repositorio |
| Licencia | No disponible (la model card del adaptador no la declara) |
| Formato de pesos | safetensors (pesos de adaptador LoRA, librería `peft`) |

## Arquitectura y entrenamiento

La arquitectura subyacente es la de Qwen2.5-0.5B-Instruct: un transformer decoder-only denso de 0,49 B de parámetros, con atención causal estándar y tokenizador BPE multilingüe. Sobre esa base se entrena un adaptador LoRA de bajo rango, de modo que en inferencia hay que cargar primero el modelo base y después aplicar el adaptador. El repositorio no documenta el rango, el `alpha`, el dropout ni los módulos objetivo del LoRA.

El entrenamiento es el aspecto diferencial: 4.620 actualizaciones de GRPO partiendo directamente del modelo instructivo, sin una fase previa de SFT, sobre el dataset `uygarkurt/xlam-tool-calling-mixed`. GRPO es un algoritmo de optimización de política que estima la ventaja relativa de varias muestras generadas para el mismo prompt, eliminando la necesidad de un modelo crítico separado; aquí se usa como señal de recompensa para reforzar llamadas a funciones bien formadas y, explícitamente, la abstención ante herramientas irrelevantes. El coste declarado es de 3,3 horas de bucle de entrenamiento, excluyendo carga de modelo, preparación de datos y evaluación externa. No se especifican en la información disponible el número de tokens vistos, la composición exacta del dataset mixto, ni si hubo fases adicionales de DPO o RLHF.

## Capacidades

- Generación de texto conversacional en inglés sobre la base instructiva de Qwen2.5.
- Tool calling estructurado: emisión de llamadas a función con nombre de función y argumentos, evaluado con exactitud de llamada exacta (xLAM ETC) y de nombre de función (xLAM FNA).
- Abstención ante herramientas irrelevantes: capacidad reforzada por GRPO, con una mejora de 66,93 % a 74,60 % en la métrica de irrelevancia del estudio.
- Razonamiento multi-paso limitado, heredado del modelo base de 0,5 B; no se reportan evaluaciones específicas de agentes multi-turno.
- Capacidades matemáticas básicas (MATH-500: 15,40 %) y de seguimiento de instrucciones (IFEval: 25,51 %), ambas ligeramente por debajo del base.
- Multilingüismo: no soportado de forma declarada; el repositorio solo lista inglés.
- Sin soporte declarado de visión, audio, thinking mode ni decodificación especulativa.

## Casos de uso

- Enrutador de funciones en pipelines de agentes: dado un catálogo de herramientas y una petición de usuario, el adaptador decide qué función invocar y con qué argumentos, con una precisión de nombre de función del 92,26 % en el holdout evaluado. Es adecuado porque su coste por inferencia es mínimo y la decisión es acotada.
- Abstención controlada en asistentes con herramientas acotadas: cuando la petición cae fuera del catálogo disponible, el modelo está entrenado para no forzar una llamada, lo que reduce errores en cascada en sistemas donde una llamada incorrecta tiene coste.
- Despliegue en edge o CPU: con 0,49 B de parámetros, el modelo fusionado y cuantizado a 4 bits ocupa del orden de 0,3-0,4 GB, lo que permite ejecutarlo en portátiles, contenedores pequeños o dispositivos sin GPU.
- Prefiltro antes de un modelo grande: usar el adaptador para clasificar la intención y seleccionar la herramienta, y delegar la ejecución o la respuesta final en un modelo mayor, reduciendo el número de llamadas caras.
- Prototipado e investigación en RL: sirve como referencia reproducible de un experimento GRPO sobre tool calling, con métricas de partida y de llegada publicadas, para comparar algoritmos o datasets en el mismo entorno.
- Generación de JSON estructurado para integraciones: al estar entrenado sobre llamadas a función, el formato de salida es consistente con esquemas de herramientas, útil para validación automática en CI antes de invocar APIs internas.
- Evaluación de robustez de esquemas de herramientas: permite medir cómo reacciona un modelo pequeño ante catálogos mal descritos o ambiguos, como paso previo a desplegar sistemas mayores.

## Benchmarks y rendimiento

Resultados declarados por el autor. Todos los valores son porcentajes; la primera fila es el modelo base sin adaptador y la segunda el adaptador GRPO tras 4.620 actualizaciones.

| Checkpoint | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| Qwen2.5-0.5B-Instruct (base) | 42,04 | 15,80 | 26,80 | 63,84 | 90,03 | 50,28 | 77,78 | 66,93 | — |
| GRPO (este adaptador) | 41,81 | 15,40 | 25,51 | 69,13 | 92,26 | 50,24 | 77,78 | 74,60 | 3,3 |

Notas metodológicas declaradas por el autor: xLAM ETC es exactitud de llamada exacta y xLAM FNA es exactitud de nombre de función, calculadas sobre un holdout de solo llamadas con 2.287 ejemplos evaluados y 700 omitidos, no sobre el split de test del dataset mixto. BFCL single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a los subconjuntos de relevancia seleccionados. IFEval usa exactitud estricta a nivel de prompt. Las evaluaciones xLAM emplean scripts propios de Post-Training Lab, por lo que los agregados son específicos del estudio y no directamente comparables con cifras publicadas de terceros.

Lectura de los datos: la mejora se concentra en tool calling (+5,29 puntos en ETC, +2,23 en FNA) y en abstención (+7,67 puntos en irrelevancia), mientras que MMLU (-0,23), MATH-500 (-0,40) e IFEval (-1,29) retroceden ligeramente. BFCL y relevancia se mantienen prácticamente planos.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp16, los pesos del modelo base ocupan aproximadamente 1 GB, por lo que con caché KV y overhead se puede operar en torno a 1,5-2 GB; fusionado y cuantizado a 4 bits, el peso baja a unos 0,3-0,4 GB. Estimaciones calculadas a partir del número de parámetros, no publicadas por el autor.
- GPU recomendadas: cualquier GPU con 2 GB o más de VRAM es suficiente (GTX 1650, RTX 3050, T4, L4). Una RTX 4090, A100 o H100 quedan muy sobredimensionadas para este modelo y solo tienen sentido si se sirven muchos lotes concurrentes.
- Cabe en GPU de consumo: sí, en prácticamente todas las GPU dedicadas modernas e incluso en iGPU con memoria compartida suficiente.
- CPU: viable. El modelo fusionado y cuantizado a 4 bits puede ejecutarse en CPU con velocidades interactivas, aunque no hay cifras de latencia publicadas.
- Opciones de despliegue: `transformers` + `peft` (carga directa del adaptador, la ruta documentada por el autor); vLLM con soporte de adaptadores LoRA para servicio concurrente; llama.cpp u Ollama requieren fusionar previamente el adaptador con el modelo base y convertir a GGUF.
- Latencia y throughput: no disponibles en la información proporcionada. El autor solo reporta 3,3 horas de bucle de entrenamiento, no métricas de inferencia.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (Qwen2.5-0.5B + LoRA GRPO) | 0,49 B | No disponible en el repositorio | Tool calling y abstención vía GRPO | No disponible | HuggingFace, 0 descargas |
| Qwen2.5-0.5B-Instruct (base) | 0,49 B | 32.768 tokens según su model card | Instructivo generalista | Apache 2.0 según su model card | HuggingFace, ampliamente usado |
| Qwen2.5-1.5B-Instruct | 1,5 B | 32.768 tokens según su model card | Instructivo generalista de mayor tamaño | Apache 2.0 según su model card | HuggingFace |
| SmolLM2-360M-Instruct | 0,36 B | 8.192 tokens según su model card | Instructivo compacto | Apache 2.0 según su model card | HuggingFace |

No se dispone de resultados de benchmarks comparables entre estos modelos dentro de la información proporcionada; las cifras de la tabla anterior proceden de model cards distintas y con metodologías heterogéneas, por lo que no deben compararse directamente con las del adaptador. La ventaja declarada de este adaptador frente a su base es específica de tool calling y abstención, no de capacidad general.

## Limitaciones y advertencias

- Licencia no declarada: la model card no especifica términos de uso, por lo que no hay autorización explícita para uso comercial. Cualquier despliegue en producción requiere contactar con el autor o asumir la licencia del modelo base, que tampoco se cita en este repositorio.
- Solo inglés declarado: no hay evidencia de calidad en castellano ni en otros idiomas; el tokenizador del base es multilingüe, pero el ajuste GRPO se hizo sobre datos en inglés.
- Degradación de capacidades generales: MMLU, MATH-500 e IFEval bajan respecto al base. No es un modelo para razonamiento matemático ni para instrucciones complejas.
- Riesgo de alucinación en argumentos: aunque el nombre de función acierte, los argumentos pueden ser incorrectos; el 92,26 % de FNA no implica exactitud equivalente en los parámetros de la llamada.
- Métricas autoinformadas y específicas del estudio: las evaluaciones usan scripts propios y subconjuntos seleccionados, con 700 ejemplos omitidos en el holdout xLAM; no son directamente comparables con cifras de terceros.
- Sin datos de sesgos: no se ha publicado ninguna evaluación de sesgo, toxicidad o seguridad.
- Contexto no verificado: la longitud de contexto efectiva con el adaptador no se ha evaluado; el valor de 32.768 tokens corresponde al modelo base y podría no mantenerse tras el ajuste.
- Madurez baja: repositorio con 0 descargas y 0 likes, creado y actualizado el mismo día, sin demo ni versiones posteriores; tratarlo como artefacto de investigación.
- Dependencia del adaptador: no es un modelo autónomo; requiere cargar Qwen2.5-0.5B-Instruct y aplicar PEFT, lo que añade complejidad frente a un checkpoint fusionado.

## Enlaces

- Adaptador en HuggingFace: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-grpo4620-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento Post-Training Lab: https://github.com/uygarkurt/post-training-lab
- Resultados de búsqueda web: no se han encontrado enlaces relevantes al modelo; las únicas coincidencias devueltas corresponden a servicios de chat con personajes sin relación con este adaptador.
