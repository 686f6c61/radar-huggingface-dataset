# Travor278/pi05-place-dual-shoes-concurrent-lora-10k

## Resumen

El modelo `Travor278/pi05-place-dual-shoes-concurrent-lora-10k` es un checkpoint de robótica desarrollado por el usuario Travor278 y publicado en HuggingFace bajo la librería `openpi`. Se trata de un ajuste fino mediante LoRA (rank/alpha 16 en la torre PaliGemma y 32 en el *action expert*) sobre una base PI0.5 original en JAX, orientado a una tarea concreta de manipulación denominada "place dual shoes concurrent", es decir, la colocación concurrente de dos zapatos. El repositorio ocupa 6,3 GB y contiene el árbol completo de parámetros necesario para inferencia, incluidas las matrices LoRA y los activos de normalización.

La relevancia de este checkpoint es fundamentalmente metodológica: documenta con un nivel de detalle poco habitual un experimento de ajuste fino eficiente en parámetros (PEFT) sobre un modelo visión-lenguaje-acción (VLA), con semilla, hiperparámetros, resolución de incidencias de guardado Orbax y verificaciones de integridad numérica. No obstante, se trata de un artefacto de investigación con 0 descargas y 0 *likes*, sin licencia declarada y sin ninguna métrica de éxito en *rollouts*: el propio autor afirma explícitamente que no se reclama ninguna tasa de éxito.

El modelo no es un LLM de propósito general ni un modelo de texto: es una política robótica que consume observaciones RGB y estado propioceptivo y emite acciones motoras. Por tanto, sus especificaciones de contexto, idiomas o cuantización estándar no están documentadas y buena parte de las casillas de esta ficha deben quedar como "no disponible".

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | VLA PI0.5 sobre JAX con columna PaliGemma y un único *action expert* (según la model card) |
| Parámetros totales | no disponible (el repositorio ocupa 6,3 GB, con pesos congelados en bf16) |
| Parámetros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible (se documenta un horizonte de acción de 50 pasos, no una ventana de contexto de texto) |
| Tipos de cuantización | no disponible (entrenamiento en bf16 para activaciones y pesos congelados, float32 para pesos entrenables; no se publican variantes cuantizadas) |
| Idiomas soportados | no disponible (no se documenta ningún idioma ni instrucciones en lenguaje natural) |
| Licencia | no disponible |
| Formato de pesos | Checkpoint Orbax de OpenPI (JAX); no se distribuyen safetensors ni GGUF |
| Entradas de percepción | Cámara RGB superior y dos cámaras RGB de muñeca, transformaciones estándar a 224x224 |
| Estado y acciones | 14 dimensiones nativas absolutas, con *padding* hasta 32 |
| Horizonte de acción | 50 pasos sin transformación delta |
| Dataset de entrenamiento | `Shiki42/ctr-place-dual-shoes-concurrent-20260911`, commit `8af4de6ff63c040bf34ba47c79eec65c83d7d37c`, 50 episodios y 21.253 fotogramas a 25 FPS |
| Hardware de entrenamiento | 2 GPU H100 de 80 GB; batch global 16; 10.000 actualizaciones |
| Tamaño del repositorio | 6,3 GB |
| Fecha de publicación | 12 de septiembre de 2026 (según metadatos de HuggingFace) |

## Arquitectura y entrenamiento

El checkpoint parte de una base PI0.5 original ("fresh original PI0.5 JAX base") con un único *action expert*, y no de una conversión ni de una continuación del checkpoint de ajuste completo anterior del mismo autor. La adaptación se realiza exclusivamente mediante LoRA: rank/alpha 16 en la torre PaliGemma y 32 en el *action expert*, aplicando el mismo filtro de congelación que los experimentos previos de "left/right shoes", que incluye visión y proyecciones entrenables. Los pesos congelados y las activaciones se mantienen en bf16, mientras que los pesos entrenables se guardan en float32.

El entrenamiento se ejecutó sobre dos H100 de 80 GB con semilla 87431, batch global 16 y AdamW (b1 = 0,9, b2 = 0,95, epsilon 1e-8, *weight decay* 1e-10, *clip* 1, sin EMA). Se usó un calendario coseno fijo a 30.000 pasos con 1.000 pasos de *warmup*, pico de 2,5e-5 y valor final de 2,5e-6, deteniendo el entrenamiento en el paso 10.000. Los datos son 50 episodios y 21.253 fotogramas a 25 FPS, lo que equivale a unos 14,2 minutos de grabación real. No se aplicaron transformación delta, conversión de unidades Aloha, máscara de inactividad ni *expert* dual personalizado.

La innovación destacable no está en la arquitectura, sino en la trazabilidad: el autor indica que cada parámetro y array del optimizador se restauró estrictamente y se comprobó finito, y que el hash del paso 10.000 del optimizador y de los valores decodificados está en `10000/experiment/k7_10000_verified.json`. El directorio `10000/experiment/` recoge versiones reales de Python y paquetes, configuración resuelta, commit y parche del código fuente, asignación de GPU, manifiestos fijados de dataset y base, controles de normalización y guardado, procedencia del parche de compatibilidad e historial de trabajos. El contenedor de plataforma fue NGC PyTorch 25.02, con el runtime JAX ejecutado por separado, reconstruido para el proyecto y no garantizado como byte-idéntico a entornos archivados previos.

## Capacidades

- Generación de acciones motoras: produce trayectorias de acción de 14 dimensiones (con *padding* a 32) sobre un horizonte de 50 pasos, a partir de observaciones visuales y de estado absoluto.
- Percepción multimodal robótica: consume una cámara superior y dos cámaras de muñeca con transformaciones a 224x224, lo que permite control con realimentación visual de varias vistas.
- Manipulación concurrente de dos objetos: el nombre del dataset y del checkpoint indica una tarea de colocación simultánea de dos zapatos, posiblemente con dos brazos, aunque la model card no detalla la morfología del robot.
- Ajuste eficiente en parámetros: la adaptación LoRA permite reutilizar la base PI0.5 y almacenar únicamente el árbol completo de inferencia, dejando el estado del optimizador en la plataforma de entrenamiento.
- Ejecución sobre OpenPI/JAX: el checkpoint está pensado para cargarse como raíz de checkpoint Orbax en el ecosistema OpenPI, con activos de normalización incluidos.
- Capacidades ausentes o no documentadas: no se documenta *tool calling*, *function calling*, uso como agente multi-paso, modos de razonamiento explícito (*thinking*), generación de texto, capacidades multilingües ni procesamiento de audio.

## Casos de uso

- Reproducción de experimentos PEFT en robótica: sirve como artefacto de referencia para verificar que un ajuste LoRA sobre PI0.5 con rank 16/32 converge en 10.000 actualizaciones con 2 H100, comparando la configuración resuelta del directorio `10000/experiment/`.
- Ajuste fino de bajo coste para nuevos objetos: partiendo de esta receta, un laboratorio puede entrenar variantes para colocar otros pares de objetos reutilizando el mismo *pipeline* de datos (estado/acción de 14 dimensiones, *padding* a 32, horizonte 50).
- Investigación en aprendizaje por imitación con datos a 25 FPS: el dataset de 21.253 fotogramas y 50 episodios permite estudiar cuánta demostración es necesaria para una tarea bimanual concurrente, así como el efecto del *warmup* y del calendario coseno.
- Evaluación de políticas visuales multi-cámara: al combinar una vista superior y dos vistas de muñeca, es un buen candidato para medir la contribución de cada cámara al éxito de la tarea mediante ablaciones.
- Comparativa de hiperparámetros LoRA: los experimentos hermanos de "left shoes" y "right shoes" mencionados en la model card permiten contrastar el efecto del rango, del filtro de congelación y del conjunto de datos en una misma base.
- Auditoría y depuración de guardado Orbax: el parche de compatibilidad de guardado y las comprobaciones de finitud documentadas lo convierten en un caso de estudio para equipos que despliegan entrenamiento JAX con guardados verificables.
- Punto de partida en un *benchmark* interno de manipulación: puede integrarse en un banco de pruebas de robot real o simulador que consuma políticas OpenPI y comparar su comportamiento con la base PI0.5 sin ajustar, siempre que se asuma que no existe una tasa de éxito publicada.
- Docencia y formación técnica: por su documentación exhaustiva de versiones, semilla e hiperparámetros, es útil como ejemplo didáctico de entrenamiento reproducible en robótica, no como modelo listo para producción.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica de forma explícita que no se reclama ninguna tasa de éxito en *rollouts* y que no hay comparación con modelos similares.

| Métrica | Resultado |
|---|---|
| MMLU, HumanEval, GSM8K u otros benchmarks de lenguaje | no aplica (modelo robótico, no de texto) |
| Tasa de éxito en *rollouts* | no disponible (no se reclama ninguna) |
| Pérdida final de entrenamiento | no disponible |
| Actualizaciones completadas | 10.000 (semilla 87431) |
| Verificación de integridad | Parámetros y arrays del optimizador restaurados y comprobados finitos; hashes en `10000/experiment/k7_10000_verified.json` |

## Requisitos de hardware

- Entrenamiento documentado: 2 GPU H100 de 80 GB, batch global 16, 10.000 actualizaciones, con contenedor NGC PyTorch 25.02 y runtime JAX separado.
- VRAM de inferencia: no disponible de forma oficial. Como estimación a partir del tamaño del repositorio (6,3 GB, pesos congelados en bf16), cabría esperar un consumo en el rango de 8 a 16 GB para inferencia en bf16 con batch pequeño, pero este dato no está confirmado por el autor.
- GPU recomendadas: el entrenamiento se validó en H100 de 80 GB. Para inferencia, GPU de centro de datos como A100 de 40/80 GB o H100 son opciones seguras por margen de memoria; no hay validación publicada en otras GPU.
- GPU de consumo: no hay confirmación de funcionamiento en GPU de consumo. Una RTX 4090 con 24 GB sería teóricamente suficiente por memoria para pesos en bf16 con batch 1, pero el autor no lo documenta y el runtime JAX puede imponer requisitos adicionales de versiones de CUDA y controladores.
- Opciones de despliegue: el checkpoint está diseñado para OpenPI con JAX y checkpoints Orbax. No es compatible con llama.cpp, Ollama, vLLM ni TGI, ya que no se trata de un modelo de lenguaje.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio completo ocupa 6,3 GB, y el autor indica que el estado del optimizador permanece en la plataforma de entrenamiento, por lo que el payload de inferencia es menor que el de un entrenamiento completo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Travor278/pi05-place-dual-shoes-concurrent-lora-10k` | no disponible (repo de 6,3 GB) | no disponible (horizonte de acción 50) | Sin tasa de éxito publicada | no disponible | 0 descargas, 0 *likes* |
| Base PI0.5 original en JAX (referenciada como punto de partida) | no disponible | no disponible | no disponible en la información proporcionada | no disponible | Base de la que deriva este ajuste |
| Checkpoint de ajuste completo previo del mismo autor | no disponible | no disponible | no disponible | no disponible | Mencionado, no es el mismo artefacto |
| LoRA "left shoes" / "right shoes" del mismo autor | no disponible | no disponible | no disponible | no disponible | Mencionados como experimentos hermanos |

No se dispone de datos comparativos de parámetros, contexto, rendimiento o licencia para ninguno de los modelos de referencia en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Licencia no declarada: al no especificarse licencia, no hay autorización explícita para uso comercial ni para redistribución; cualquier uso en producción requiere aclaración previa con el autor.
- Sin evidencia de rendimiento: el autor no reclama ninguna tasa de éxito en *rollouts*, por lo que no existe justificación empírica publicada de que la política funcione en un robot real.
- Dataset muy reducido: 50 episodios y 21.253 fotogramas (unos 14,2 minutos a 25 FPS) para una única tarea, con riesgo alto de sobreajuste a la escena, la iluminación y la disposición concretas de las demostraciones.
- Especialización extrema: la política está entrenada para "place dual shoes concurrent"; no se documenta ninguna capacidad de generalización a otras tareas, objetos o morfologías.
- Adopción nula: 0 descargas y 0 *likes* implican que no ha sido validado por terceros ni reproducido de forma independiente.
- Reproducibilidad parcial: el autor advierte de que el runtime se reconstruyó para este proyecto y no se garantiza byte-idéntico a entornos archivados históricos, lo que puede dificultar la reproducción exacta.
- Limitaciones de despliegue: formato Orbax/JAX, sin safetensors ni GGUF, lo que excluye los stacks de inferencia más comunes fuera del ecosistema OpenPI.
- Ausencia de datos sobre sesgos, idioma y alucinación: no aplica el marco habitual de un LLM, pero tampoco se documentan análisis de sesgo visual, robustez ante cambios de cámara o comportamiento ante entradas fuera de distribución.
- Metadatos a revisar: las fechas de creación y actualización indican septiembre de 2026, un dato que conviene verificar antes de citar el modelo en un contexto temporal concreto.
- Advertencia de seguridad: al ser una política de control, un fallo de inferencia puede provocar movimientos no deseados del robot; se recomienda validación en simulador y límites de par antes de cualquier prueba física.

## Enlaces

- Página del modelo en HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-concurrent-lora-10k
- Dataset de entrenamiento referenciado en la model card: `Shiki42/ctr-place-dual-shoes-concurrent-20260911` (commit `8af4de6ff63c040bf34ba47c79eec65c83d7d37c`); no se proporciona URL en la información disponible.
- Fichero de verificación de integridad indicado por el autor: `10000/experiment/k7_10000_verified.json` dentro del repositorio.
- Registros detallados de entrenamiento: directorio `10000/experiment/` dentro del repositorio.
- Librería de ejecución: `openpi` (nombre declarado en `library_name`); no se proporciona URL del repositorio en la información disponible.
- Búsqueda web: no se han encontrado enlaces relevantes sobre este modelo; los resultados devueltos correspondían a contenidos sin relación (juntas y burletes para estufas y chimeneas) y se han descartado.
