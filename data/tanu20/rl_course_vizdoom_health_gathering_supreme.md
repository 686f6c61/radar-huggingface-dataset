# tanu20/rl_course_vizdoom_health_gathering_supreme

## Resumen

El modelo identificado como `tanu20/rl_course_vizdoom_health_gathering_supreme` no es un modelo de lenguaje, sino un checkpoint de política de aprendizaje por refuerzo profundo entrenado con el algoritmo APPO (Asynchronous Proximal Policy Optimization) sobre el entorno `doom_health_gathering_supreme` de ViZDoom. Lo publica el usuario tanu20 en Hugging Face, con el framework Sample-Factory 2.0 como librería asociada (`library_name: sample-factory`), y su propósito es servir como artefacto reproducible dentro de un curso o material didáctico de reinforcement learning.

El problema que resuelve es acotado y específico: controlar un agente en un escenario de ViZDoom donde el objetivo es recolectar botiquines (health packs) para maximizar la supervivencia, a partir de observaciones visuales del propio juego. El único resultado declarado por el autor es una recompensa media de 12,42 ± 5,76 en dicho entorno, marcada como no verificada (`verified: false`) en el model-index.

Su relevancia es fundamentalmente docente y de investigación: el repositorio ocupa 0,1 GB, tiene 0 descargas y 0 "likes", y la información publicada no incluye detalles de arquitectura de red, número de parámetros ni recuento de pasos de entrenamiento. Se ofrece como punto de partida para reproducir el pipeline de Sample-Factory, reanudar entrenamiento o servir de línea base en experimentos de RL sobre ViZDoom.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible en la información proporcionada; se trata de una política de RL (red neuronal para observaciones visuales) entrenada con APPO en Sample-Factory, sin que la model card detalle el tipo de encoder, la existencia de componente recurrente ni las capas concretas |
| Parámetros totales | No disponible |
| Parámetros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No aplica (no procesa secuencias de texto); horizonte de episodio del entorno no disponible |
| Tipos de cuantización | No disponible; el flujo de Sample-Factory no contempla cuantizaciones tipo GGUF/AWQ |
| Idiomas soportados | No disponible; la tarea no implica procesamiento de lenguaje |
| Licencia | No disponible |
| Formato de pesos | No disponible; el repositorio no lista ficheros, si bien el flujo de carga de Sample-Factory (`load_from_hub`, `enjoy`, `train`) se basa en checkpoints de PyTorch (inferencia, no confirmada en la información) |
| Algoritmo de entrenamiento | APPO (Asynchronous Proximal Policy Optimization) |
| Framework / librería | Sample-Factory 2.0 |
| Entorno | `doom_health_gathering_supreme` (ViZDoom) |
| Tipo de tarea | Aprendizaje por refuerzo (`reinforcement-learning`) |
| Pipeline declarado | `reinforcement-learning` |
| Tamaño del repositorio | 0,1 GB |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 2026-09-24 |
| Última actualización | 2026-09-24 |

## Arquitectura y entrenamiento

La información disponible no describe la arquitectura de red del modelo: no se indica el tipo de encoder visual, el número de capas, la presencia o ausencia de memoria recurrente, ni el tamaño de la cabeza de política y de la función de valor. Lo único documentado es que la política se ha entrenado con el algoritmo APPO implementado en Sample-Factory 2.0, framework cuyo repositorio y documentación se enlazan en la propia model card. APPO es una variante asíncrona de PPO que combina workers de recolección de experiencia con aprendizaje desacoplado, un esquema habitual para entornos con observaciones de imagen como ViZDoom.

Tampoco se especifican los datos de entrenamiento: no hay número de pasos de entorno, tamaño de lote, composición del dataset (en RL la experiencia se genera por interacción con el simulador, no hay corpus), ni si se aplicaron fases adicionales de ajuste. La model card documenta únicamente tres flujos operativos: descarga del checkpoint desde el Hub (`python -m sample_factory.huggingface.load_from_hub -r tanu20/rl_course_vizdoom_health_gathering_supreme`), ejecución de la política con el script `enjoy` y reanudación del entrenamiento con el script `train` usando `--restart_behavior=resume`. El único metadato cuantitativo de entrenamiento es el resultado final declarado: recompensa media de 12,42 ± 5,76 en `doom_health_gathering_supreme`, con `verified: false`.

## Capacidades

- Toma de decisiones secuenciales en el entorno ViZDoom `doom_health_gathering_supreme` a partir de observaciones visuales del juego.
- Ejecución de políticas entrenadas para la tarea de recolección de botiquines y maximización de supervivencia.
- Inferencia mediante el script `enjoy` de Sample-Factory, tanto en CPU como en GPU (el framework soporta ambos backends).
- Reanudación del entrenamiento desde el checkpoint publicado (`--restart_behavior=resume`), lo que permite continuar el ajuste con más pasos de entorno.
- Exportación a Hugging Face Hub con el flag `--push_to_hub` del propio flujo de Sample-Factory.
- Registro de métricas de entrenamiento en TensorBoard (etiqueta `tensorboard` del repositorio).
- Generación de texto: no aplica; el modelo no procesa ni produce lenguaje natural.
- Tool calling / function calling: no aplica.
- Orquestación de agentes multi-paso en el sentido de LLM: no aplica; el agente sí opera de forma secuencial dentro del episodio del entorno.
- Capacidades multilingües: no aplica.
- Modo "thinking", visión general, audio o matemáticas: no aplica; la única modalidad de entrada es la observación del simulador ViZDoom.

## Casos de uso

- Reproducibilidad de un curso de RL: cargar el checkpoint con `load_from_hub` y ejecutarlo con `enjoy` para verificar en clase que la política alcanza la recompensa declarada (12,42 ± 5,76) en `doom_health_gathering_supreme`.
- Línea base para comparativas de algoritmos: usar esta política APPO como referencia frente a implementaciones propias de PPO, DQN u otros algoritmos sobre el mismo entorno, midiendo recompensa media con idéntico protocolo de evaluación.
- Reanudación y ajuste fino: retomar el entrenamiento con `--restart_behavior=resume` y un `--train_for_env_steps` alto para explorar si la recompensa media mejora con más experiencia, partiendo de un checkpoint ya funcional.
- Validación de infraestructura de RL: emplear el modelo como caso de prueba mínimo (0,1 GB) para comprobar que un clúster, contenedor o entorno de CI tiene correctamente instalados Sample-Factory, ViZDoom y las dependencias de GPU.
- Experimentos de currículum y transferencia: usar la política como inicialización en variantes del escenario de ViZDoom (por ejemplo, distintas densidades de botiquines) para estudiar cuánto conocimiento visual se transfiere entre tareas.
- Docencia sobre checkpoints y model cards: analizar este repositorio como ejemplo de model card autogenerada por Sample-Factory, incluyendo el bloque `model-index` con métricas no verificadas, para enseñar buenas prácticas de documentación en RL.
- Generación de trayectorias para análisis o imitación: ejecutar la política para recolectar episodios y estudiar el comportamiento aprendido (rutas seguidas, uso de botiquines), o como fuente de demostraciones para métodos de imitation learning.
- Pruebas de regresión del framework: al fijar un entorno y un algoritmo concretos, sirve para detectar cambios de comportamiento al actualizar versiones de Sample-Factory o de ViZDoom.

## Benchmarks y rendimiento

Los únicos resultados disponibles son los declarados por el autor en el `model-index` de la model card (no verificados):

| Modelo | Algoritmo | Tarea | Dataset / entorno | Métrica | Valor |
|---|---|---|---|---|---|
| tanu20/rl_course_vizdoom_health_gathering_supreme | APPO | reinforcement-learning | doom_health_gathering_supreme | mean_reward | 12,42 ± 5,76 (valor original: 12.42 +/- 5.76; verified: false) |

No se han publicado otros resultados de benchmarks en la información disponible, ni comparativas con MMLU, HumanEval o GSM8K (métricas no aplicables a este tipo de modelo).

## Requisitos de hardware

- VRAM para inferencia: no disponible de forma explícita. El repositorio completo ocupa 0,1 GB, lo que sugiere que el checkpoint es pequeño y que la política puede ejecutarse en CPU sin requisitos relevantes de memoria de vídeo (inferencia a partir del tamaño del repo, no confirmada por el autor).
- GPU recomendadas: no disponibles. Al tratarse de una política de RL para observaciones de ViZDoom y no de un modelo de lenguaje, no aplican recomendaciones tipo A100/H100 por tamaño de modelo; cualquier GPU con soporte CUDA que funcione con Sample-Factory debería ser suficiente para inferencia.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU de consumo con soporte CUDA, e incluso en CPU; no se dispone de una tabla oficial de requisitos.
- Opciones de despliegue: scripts de Sample-Factory (`load_from_hub`, `enjoy`, `train`) sobre PyTorch; monitorización con TensorBoard. No aplican vLLM, llama.cpp, Ollama ni TGI, orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles. Dependen del renderizado del propio simulador ViZDoom, del número de workers y del hardware, factores que la model card no documenta.

## Comparativa con modelos similares

No se dispone de datos de otros checkpoints comparables en la información proporcionada (ni recompensa media, ni parámetros, ni número de pasos de entrenamiento de alternativas). La comparación se limita a categorías de referencia:

| Alternativa | Descripción | Datos comparables |
|---|---|---|
| Otros checkpoints de Sample-Factory para ViZDoom publicados en Hugging Face | Políticas APPO entrenadas sobre entornos ViZDoom del mismo ecosistema | No disponible |
| Implementaciones de PPO/DQN propias sobre `doom_health_gathering_supreme` | Algoritmos alternativos ejecutados en el mismo entorno | No disponible |
| Implementaciones de APPO en otros frameworks (por ejemplo, RLlib) | Mismo algoritmo, distinta infraestructura | No disponible |

En cuanto a los datos sí conocidos de este modelo: licencia no disponible, 0 descargas y 0 likes, 0,1 GB de repositorio y una única métrica declarada sin verificación independiente.

## Limitaciones y advertencias

- Ámbito de aplicación muy restringido: la política está entrenada para un único entorno (`doom_health_gathering_supreme`) y no es reutilizable directamente en otras tareas, dominios ni modalidades.
- Métrica no verificada: la recompensa media de 12,42 ± 5,76 procede del propio autor y está marcada como `verified: false`; la desviación estándar (± 5,76) es elevada en relación a la media, lo que indica alta varianza entre episodios.
- Ausencia de información de arquitectura, número de parámetros, pasos de entrenamiento e hiperparámetros, lo que dificulta evaluar la calidad del entrenamiento o reproducirlo con exactitud.
- Licencia no disponible: no puede asumirse permiso de uso comercial ni condiciones de redistribución. Conviene contactar con el autor antes de cualquier uso en producción.
- Idiomas y sesgos: no aplica el análisis habitual de sesgos lingüísticos, pero sí pueden existir sesgos de política aprendidos del entorno (por ejemplo, comportamientos degenerados que exploten particularidades del simulador).
- Riesgo de sobreajuste al escenario: al ser un escenario concreto de ViZDoom, es esperable una degradación del rendimiento si se modifican la configuración del mapa, la densidad de objetos o la resolución de observación.
- Dependencia de versiones: el uso de ViZDoom y Sample-Factory implica que cambios de versión en estas dependencias pueden alterar el comportamiento o impedir la carga del checkpoint.
- Huella mínima en la comunidad: 0 descargas y 0 likes en el momento de la consulta, sin issues ni validaciones externas documentadas.
- No es un modelo generativo de texto: cualquier expectativa de generación, razonamiento simbólico, tool calling o capacidades multilingües queda fuera de su alcance.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tanu20/rl_course_vizdoom_health_gathering_supreme
- Repositorio de Sample-Factory: https://github.com/alex-petrenko/sample-factory
- Documentación de Sample-Factory: https://www.samplefactory.dev/
- Documentación de integración con Hugging Face: https://www.samplefactory.dev/10-huggingface/huggingface/
