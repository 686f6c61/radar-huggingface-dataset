# Travor278/pi05-place-dual-shoes-right-first-lora-10k

## Resumen

`Travor278/pi05-place-dual-shoes-right-first-lora-10k` es un checkpoint de investigación robótica publicado en HuggingFace por el usuario Travor278. Se trata de un ajuste fino mediante LoRA sobre el modelo base PI0.5 en su implementación JAX de OpenPI, orientado a una tarea concreta de manipulación: colocar un par de zapatos, empezando por el derecho. El modelo no es un LLM de propósito general, sino un modelo visión-lenguaje-acción (VLA) que consume imágenes de cámara y estado del robot y produce acciones motoras de 14 dimensiones.

El repositorio contiene un checkpoint Orbax publicado a las 10.000 actualizaciones de entrenamiento, con el directorio `10000/` como raíz del checkpoint. El ajuste se realizó sobre el conjunto de datos `Shiki42/ctr-place-dual-shoes-right-first-20260911` (50 episodios, todos utilizados), con batch global 16, horizonte 50 y semilla 87431. No es un artefacto LeRobot de PyTorch en safetensors, sino un checkpoint JAX/Orbax, lo que condiciona por completo su cargado y despliegue.

Su relevancia es acotada y muy específica: sirve como ejemplo reproducible de ajuste LoRA eficiente sobre PI0.5 para una tarea robótica concreta, con trazabilidad detallada de configuración, hashes de datos y verificación de recuperación del checkpoint. El autor declara explícitamente que no se ha realizado ninguna evaluación en bucle cerrado de la tarea de colocación de zapatos, por lo que se trata de un artefacto de entrenamiento, no de un modelo validado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) del linaje PI0.5; backbone PaliGemma con un unico experto de accion, ajustado con LoRA |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (horizonte de accion de 50 pasos) |
| Tipos de cuantizacion | no disponible (checkpoint Orbax en precision de entrenamiento; sin variantes GGUF ni cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX); no es safetensors ni GGUF |
| Biblioteca | openpi |
| Pipeline | robotics |
| Tamano del repositorio | 6,3 GB |
| Dataset de ajuste | Shiki42/ctr-place-dual-shoes-right-first-20260911 (revision 4ea9520624c3bbefbb9db057b45c0ef187ed49a8), 50 episodios |
| Pasos de entrenamiento | 10.000 actualizaciones completadas |
| Batch global | 16 |
| Optimizador | AdamW (b1 0,9; b2 0,95; eps 1e-8; weight decay 1e-10; clip 1) |
| Scheduler | coseno de 30.000 pasos; pico 2,5e-5; warmup 1.000; decaimiento 2,5e-6 |
| Dimension de acciones | 14 (estado/acciones absolutos, sin conversion de unidades Aloha ni transformada delta) |
| Entradas | Vista RGB superior y dos vistas de muneca, redimensionadas a 224x224 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base PI0.5 en su version JAX dentro de OpenPI. La arquitectura es de tipo visión-lenguaje-acción: un backbone PaliGemma procesa las observaciones visuales y el estado del robot, y un experto de acción dedicado genera la secuencia de acciones. En este ajuste se emplea un único experto de acción. El ajuste fino se aplica con LoRA sobre PaliGemma con rango/alpha 16 y sobre el experto con rango/alpha 32, usando un filtro de congelación de referencia que incluye visión y proyecciones entrenables. Los pesos LoRA se incluyen junto al árbol de parámetros base completo.

El entrenamiento consumió los 50 episodios del conjunto de datos referenciado, con batch global 16, semilla 87431 y horizonte 50 durante 10.000 actualizaciones, sin EMA ni máscara de inactividad (idle mask). Se preservan las 14 dimensiones crudas de estado y acción del robot, sin conversión de unidades Aloha ni transformación a deltas, lo que implica que el modelo espera exactamente el mismo convenio de espacios de acción que el robot de origen. Las imágenes se procesan con las transformaciones estándar de OpenPI a 224x224.

Un aspecto técnico destacable es la trazabilidad del artefacto: el guardado original se detuvo en el callback de assets por un problema de compatibilidad en la exportación pública de Orbax, y los payloads retenidos se finalizaron en un directorio separado. Cada parámetro y array del optimizador se restauró estrictamente con errores de chunks faltantes habilitados, se comprobó que eran finitos y se verificó el contador de paso en 10.000. El archivo `RECOVERY_VERIFIED.json` registra los hashes de los arrays decodificados. El estado del optimizador se conserva en la plataforma de entrenamiento pero se excluye del payload de inferencia. El directorio `10000/experiment/` documenta inventario de paquetes (Python/JAX/CUDA), configuración resuelta de modelo, optimizador y scheduler, parche de código contra el commit upstream fijado, hashes exactos de los ficheros del dataset, binding de GPU y pruebas de guardado/recarga.

## Capacidades

- Generación de acciones motoras para manipulación robótica: el modelo produce vectores de acción de 14 dimensiones a partir de observaciones visuales y estado del robot.
- Percepción visual multimodal limitada a tres vistas RGB (cámara superior y dos cámaras de muneca) a 224x224.
- Ejecución de una política especializada en la tarea de colocar un par de zapatos empezando por el derecho, aprendida de 50 episodios de demostración.
- Ajuste LoRA sobre el modelo base: los adaptadores están integrados con el árbol de parámetros base, de modo que el checkpoint se carga completo.
- Planificación de secuencias de acción con horizonte 50.
- Tool calling / function calling: no aplica a este tipo de modelo.
- Soporte de agentes y razonamiento multi-paso en lenguaje natural: no disponible; no es un modelo conversacional ni de razonamiento textual.
- Capacidades multilingües: no disponible.
- Capacidades especiales: no se documenta modo de razonamiento (thinking mode), audio ni otras modalidades.

## Casos de uso

- Reproducción de investigación en ajuste eficiente: sirve como referencia para estudiar cómo se configura un ajuste LoRA (rango, alpha, filtro de congelación) sobre PI0.5 en JAX, ya que el repositorio incluye el inventario de paquetes y la configuración resuelta.
- Base para experimentos de manipulación con doble brazo: el espacio de acción de 14 dimensiones y las tres vistas RGB encajan con configuraciones de robot bimanual; se puede usar como punto de partida para variantes de la misma tarea.
- Comparación de estrategias de ajuste: al estar publicados los hiperparámetros y los pasos exactos, permite contrastar el efecto de distintos schedules, batch o rangos LoRA manteniendo el resto constante.
- Auditoría de checkpoints Orbax: el artefacto documenta un caso real de recuperación tras un fallo de exportación, con hashes verificados, útil como ejemplo de procedimiento de validación de integridad en pipelines JAX.
- Integración en el runtime OpenPI: el checkpoint se carga con las variantes de `Pi0Config` de un solo experto dentro de OpenPI, lo que permite ejecutarlo en el mismo stack de inferencia que el modelo base.
- Trazabilidad de datos para robótica: los hashes exactos del dataset y del commit permiten reconstruir el experimento y auditar la procedencia de las 50 demostraciones utilizadas.
- Punto de partida para fine-tuning sobre nuevas tareas: al conservar el árbol de parámetros base completo, se puede continuar el ajuste o transferir el enfoque a otras políticas de colocación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna evaluación en bucle cerrado de la tarea de colocación de zapatos, y no se proporcionan métricas de éxito, tasas de finalización ni comparaciones cuantitativas con otros checkpoints.

## Requisitos de hardware

- El payload de pesos del repositorio ocupa 6,3 GB, lo que constituye una cota inferior del espacio necesario en disco o memoria.
- VRAM estimada para inferencia: no disponible de forma oficial. Como estimación orientativa a partir del tamaño del payload, la inferencia a precisión de entrenamiento requerirá previsiblemente un mínimo en torno a 8-16 GB de VRAM sumando activaciones y buffers de visión, pero el dato no está confirmado por el autor.
- GPU recomendadas: no disponible. El entrenamiento se realizó sobre GPU con runtime JAX/CUDA documentado en `10000/experiment/`, pero el modelo concreto de GPU empleado no se refleja en la información proporcionada.
- Compatibilidad con GPU de consumo: no confirmada. Un payload de 6,3 GB entra en el rango de GPUs de consumo con 12-24 GB (por ejemplo, RTX 3090 o 4090), pero no hay validación publicada.
- Opciones de despliegue: runtime OpenPI con JAX. No es compatible con vLLM, llama.cpp, Ollama ni TGI, ya que no es un LLM de texto ni dispone de pesos GGUF o safetensors de LeRobot.
- Cargado correcto: usar las variantes de `Pi0Config` de un solo experto y el directorio `10000/` como raíz del checkpoint.
- Latencia y throughput estimados: no disponible.
- Almacenamiento: el estado del optimizador no está incluido en el payload de inferencia, por lo que el checkpoint publicado es únicamente para inferencia o para reanudar con reconstrucción de estado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-place-dual-shoes-right-first-lora-10k | VLA, ajuste LoRA sobre PI0.5 | no disponible | no disponible (horizonte 50) | no disponible | HuggingFace, formato Orbax |
| PI0.5 base (OpenPI, JAX) | VLA | no disponible | no disponible | no disponible | Referenciado como base del ajuste |
| Otros VLA open source (OpenVLA, pi0, RDT, GR00T) | VLA | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos comparativos verificados en la información proporcionada. La única comparación fiable es contra el checkpoint base PI0.5 del que deriva, del cual este artefacto difiere únicamente por los adaptadores LoRA y los 10.000 pasos de ajuste sobre 50 episodios de una tarea concreta. La comparación cuantitativa de rendimiento entre ambos no está publicada.

## Limitaciones y advertencias

- No existe ninguna evaluación en bucle cerrado de la tarea de colocación de zapatos; el autor lo declara explícitamente. No debe asumirse que la política funciona en el robot real.
- Especialización extrema: el modelo está ajustado sobre 50 episodios de una única tarea, con lo que la generalización a otras tareas, objetos o entornos es muy improbable.
- Convenio de acciones rígido: se preservan 14 dimensiones absolutas sin conversión de unidades Aloha ni transformación delta, de modo que solo es válido con la configuración de robot y espacio de acción exactos del dataset.
- Riesgo de sobreajuste: con tan solo 50 episodios y 10.000 actualizaciones sobre un backbone grande, la política puede memorizar las trayectorias de demostración.
- Licencia no disponible: no se especifican términos de uso, lo que impide determinar si se permite el uso comercial. Conviene contactar con el autor antes de cualquier aplicación productiva.
- Idiomas soportados no disponibles: no se documenta comportamiento multilingüe ni instrucciones en lenguaje natural en ningún idioma.
- Artefacto con historial de recuperación: el guardado falló en el callback de assets y el payload se reconstruyó en un directorio separado. Aunque se verificaron hashes y finitud, procede tratarlo con cautela y validar la recarga antes de usarlo.
- Sin estado de optimizador en el payload: no permite reanudar el entrenamiento tal cual; solo sirve para inferencia o para reiniciar el ajuste desde cero.
- Formato no estándar: al ser Orbax/JAX y no safetensors de LeRobot, no se integra en los pipelines habituales de PyTorch y requiere el stack de OpenPI.
- Ausencia de métricas publicadas: sin benchmarks ni tasas de éxito, no hay base para comparar su calidad con alternativas.
- Sesgos conocidos: no disponible.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-right-first-lora-10k
- Dataset de ajuste: Shiki42/ctr-place-dual-shoes-right-first-20260911 (revision 4ea9520624c3bbefbb9db057b45c0ef187ed49a8)
- Runtime y framework base: OpenPI (JAX), referenciado en la model card y en los tags del repositorio
- Documentación interna del experimento: directorio `10000/experiment/` del propio repositorio (inventario de paquetes, configuración resuelta, parche de código, hashes del dataset)
- Verificación de integridad: `RECOVERY_VERIFIED.json` en el repositorio
- No se han encontrado otros enlaces relevantes (papers, blogs, demos o repositorios) en la búsqueda web asociada a este modelo.
