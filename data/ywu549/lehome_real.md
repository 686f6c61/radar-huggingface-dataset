# ywu549/lehome_real

## Resumen

LeHome Real es una política de visión-lenguaje-acción (VLA) desarrollada por ywu549 para la final presencial del LeHome Challenge 2026 (ICRA 2026), una competición de plegado bimanual de prendas de vestir sobre un montaje físico LeRobot SO-ARM101. El modelo quedó en segunda posición en dicha final. Se trata de un derivado de π0.5 entrenado mediante clonación de comportamiento sobre una mezcla de datos de teleoperación de los organizadores, correcciones propias de teleoperación y DAgger, y repeticiones de simulación con aumento de datos agresivo.

La relevancia del modelo es acotada pero significativa: demuestra un pipeline completo de sim-to-real para manipulación diestra bimanual con hardware de bajo coste (SO-ARM101), y publica pesos, código y un informe técnico, lo que lo convierte en una referencia reproducible para investigación en VLA aplicada a robótica real. No es un modelo de propósito general ni un modelo de lenguaje: es una política de control entrenada para una tarea y un entorno concretos.

El repositorio ocupa 10.5 GB y la librería declarada es JAX. La información pública disponible sobre arquitectura interna, número de parámetros y contexto es muy limitada; los datos que faltan se indican explícitamente como no disponibles.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en π0.5, con flow matching |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | no disponible (repositorio de 10.5 GB, librería JAX) |

## Arquitectura y entrenamiento

La política se construye sobre π0.5, un modelo VLA que combina un backbone de visión-lenguaje con un cabezal de acción entrenado mediante flow matching. El modelo toma observaciones visuales y el estado del robot y genera acciones motrices continuas para el montaje bimanual SO-ARM101. La librería declarada es JAX, lo que condiciona el ecosistema de inferencia y entrenamiento.

El entrenamiento se realizó por clonación de comportamiento sobre tres fuentes de datos: teleoperación de los organizadores del challenge, teleoperación propia y correcciones DAgger del autor, y repeticiones de simulación con aumento de datos intensivo para facilitar la transferencia sim-to-real. El modelo parte de la política de la ronda de simulación del mismo autor. No se especifican en la información disponible el número de tokens, la composición exacta del dataset ni si hubo etapas de RLHF o DPO; en el contexto de una política de control, lo habitual es que no las haya.

## Capacidades

- Control bimanual de un montaje LeRobot SO-ARM101 para plegado de prendas de vestir.
- Percepción visual y generación de acciones motrices continuas en un bucle de control robótico.
- Transferencia sim-to-real: la política entrenada en simulación con aumento de datos opera sobre hardware físico.
- Aprendizaje por imitación con correcciones DAgger sobre datos de teleoperación.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Plegado automático de prendas en laboratorio: la política controla los dos brazos del SO-ARM101 para manipular y doblar prendas sobre una mesa, replicando la tarea del challenge en un entorno controlado.
- Investigación en sim-to-real: sirve como caso de estudio reproducible de cómo el aumento de datos en simulación más correcciones DAgger permiten transferir una política VLA a hardware real de bajo coste.
- Punto de partida para fine-tuning en tareas de manipulación diestra: al estar publicada con licencia Apache 2.0 y código, puede adaptarse a otras tareas bimanuales con teleoperación propia.
- Evaluación comparativa de políticas VLA: útil como baseline en experimentos que comparen π0.5 frente a otras arquitecturas VLA sobre el mismo montaje físico.
- Docencia y formación en robótica: el repositorio y el informe técnico permiten reproducir el pipeline completo de entrenamiento e inferencia con JAX.
- Demostración de manipulación con hardware asequible: valida que un montaje SO-ARM101, de coste reducido frente a brazos industriales, puede ejecutar tareas de plegado con una política VLA entrenada por imitación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El único dato de rendimiento objetivo es la clasificación: segunda posición en la final presencial del LeHome Challenge 2026 (ICRA 2026).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El tamaño del repositorio (10.5 GB) incluye pesos y posiblemente artefactos de entrenamiento, pero no permite derivar la VRAM necesaria.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: la librería declarada es JAX; no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que además no aplican a una política robótica.
- Latencia y throughput: no disponibles.
- Requisito adicional: hardware físico LeRobot SO-ARM101 para la ejecución real de la tarea.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| LeHome Real (ywu549) | VLA π0.5, flow matching | no disponible | no disponible | Apache 2.0 | Pesos en HF, código en GitHub |
| LeHome Sim (IliaLarchenko) | VLA para ronda de simulación | no disponible | no disponible | no disponible | Pesos en HF |
| π0.5 (base) | VLA generalista | no disponible | no disponible | no disponible | no disponible |

La comparación cuantitativa con alternativas no está disponible: no se publican parámetros, contexto ni métricas de rendimiento comparables en la información proporcionada.

## Limitaciones y advertencias

- Modelo especializado: entrenado para una tarea concreta (plegado de prendas) y un montaje concreto (SO-ARM101); no generaliza a otras tareas sin reentrenamiento o fine-tuning.
- Sin datos públicos sobre sesgos, tasas de alucinación o robustez fuera del entorno de competición.
- No se documentan los idiomas ni el comportamiento del componente de lenguaje; no debe asumirse soporte multilingüe.
- La licencia Apache 2.0 permite uso comercial, pero el modelo depende de π0.5, cuyos términos de licencia no se detallan en la información disponible y deben verificarse antes de un uso comercial.
- Repositorio con 0 descargas y 0 likes: no hay evidencia de validación por parte de la comunidad.
- El rendimiento en producción fuera del entorno del challenge no está caracterizado; la segunda posición en competición no garantiza robustez ante variaciones de iluminación, prendas o calibración.
- Requiere hardware físico específico y un pipeline JAX para su ejecución; no es desplegable como servicio de texto estándar.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ywu549/lehome_real
- Código: https://github.com/IliaLarchenko/lehome_solution
- Informe técnico: https://arxiv.org/abs/2606.27163
- Blog del autor: https://ilialarchenko.com/projects/lehome2026
- Política de la ronda de simulación: https://huggingface.co/IliaLarchenko/lehome_sim
- Repositorio del challenge: https://github.com/lehome-official/lehome-challenge
- Dataset: lehome/dataset_challenge_real
