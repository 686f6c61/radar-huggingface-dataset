# wxt123/WAM-RoboSyn-2026

## Resumen
WAM-RoboSyn-2026 es un conjunto de pesos para robótica manipulativa publicado en Hugging Face por el usuario wxt123, presentado como la submission "Phoenix" al RoboSynChallenge. El repositorio no contiene un modelo de lenguaje ni un modelo generativo de propósito general: aloja cinco checkpoints de tareas robóticas específicas (`click_bell`, `table_rearrangement`, `drawer_open_place`, `handle_basket` y `mixer_operating`) junto con los pesos compartidos de inferencia bajo el layout de recursos "Phoenix/Wan". Por tanto, se trata de un artefacto de despliegue para un benchmark de síntesis robótica, no de un modelo fundacional documentado de forma convencional.

El repositorio está etiquetado con la librería `diffusers` y contiene ficheros `safetensors`, lo que sugiere que los pesos compartidos emplean una arquitectura de difusión (posiblemente derivada de Wan, un modelo de generación de vídeo/imagen) combinada con componentes de política robótica (MWA, probablemente "Multi-World Action" o similar, aunque el acrónimo no se explicita). El tamaño del repositorio es de 85,8 GB, coherente con varios checkpoints de gran tamaño más pesos compartidos. No se dispone de información sobre parámetros totales, contexto, licencia ni idiomas.

La relevancia del artefacto es acotada: sirve como referencia reproducible para participantes del RoboSynChallenge y para quienes quieran inspeccionar la estructura de checkpoints de políticas robóticas entrenadas con step counts concretos (40000 a 50000). Sin model card técnica detallada, sin benchmarks publicados y sin licencia declarada, su utilidad fuera del contexto del challenge es limitada y requiere precaución en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (etiquetado `diffusers`; pesos compartidos Phoenix/Wan, posible componente de difusión) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (checkpoints `.pt` por tarea y pesos compartidos en `shared/`) |

## Arquitectura y entrenamiento
La model card no describe la arquitectura interna. Los indicios disponibles son: la librería declarada es `diffusers`, los ficheros son `safetensors` y los pesos compartidos siguen el "Phoenix resource layout" con pesos "Phoenix/Wan". Wan es una familia de modelos de difusión para generación de vídeo, por lo que es plausible que el componente compartido sea un backbone de difusión reutilizado para síntesis de observaciones o para modelado de acciones, pero esto no se confirma en la documentación. Cada tarea tiene su propio checkpoint con un número de step explícito (`click_bell` en 40000, `table_rearrangement` en 45000, y `drawer_open_place`, `handle_basket` y `mixer_operating` en 50000; este último referenciado como `slot_10.pt`).

No se documentan datos de entrenamiento (número de tokens, composición del dataset, uso de RLHF/DPO), ni innovaciones técnicas como decodificación especulativa o atención lineal. La model card indica que el adaptador de despliegue local, el suavizado (smoothing) y las reglas de tarea se mantienen por separado en el paquete `phoenix_robosynchallenge` y no se copian en el repositorio; además, cada tarea incluye `inference_config.yaml` con rutas relativas portables y `training_config.yaml` con la procedencia del entrenamiento original, aunque esos ficheros no se reproducen aquí.

## Capacidades
- Ejecución de cinco tareas robóticas de manipulación: pulsar una campana (`click_bell`), reorganizar una mesa (`table_rearrangement`), abrir un cajón y colocar un objeto (`drawer_open_place`), manejar una cesta (`handle_basket`) y operar una batidora (`mixer_operating`).
- Inferencia por checkpoint específico de tarea, con pesos compartidos reutilizables entre tareas.
- Configuración portable mediante `inference_config.yaml` con rutas relativas.
- Trazabilidad del entrenamiento mediante `training_config.yaml` por tarea.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, tool calling, agentes multi-paso ni multilingüismo.
- No se documentan modos especiales (thinking mode, audio, etc.).

## Casos de uso
- Evaluación en el RoboSynChallenge: cargar los checkpoints de cada tarea con el adaptador `phoenix_robosynchallenge` para reproducir los resultados de la submission Phoenix y compararlos con otras entradas del benchmark.
- Investigación en políticas robóticas: inspeccionar la evolución entre checkpoints de distintos steps (40000, 45000, 50000) para estudiar la dinámica de entrenamiento por tarea.
- Reutilización de pesos compartidos: emplear el directorio `shared/` como base para experimentos de fine-tuning en tareas de manipulación adicionales, siempre que se respete la licencia (no declarada).
- Depuración de pipelines de inferencia: usar los `inference_config.yaml` para validar rutas relativas y despliegues portables en entornos de laboratorio.
- Benchmarking interno de infraestructura: medir tiempos de carga y throughput de checkpoints de gran tamaño (85,8 GB de repositorio) en GPUs de laboratorio.
- Formación y reproducción: servir como material de referencia para cursos o talleres sobre robótica simulada y políticas entrenadas con difusión, dado que la estructura de checkpoints y configs es explícita.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware
- VRAM estimada para inferencia: no disponible (no se especifican parámetros ni cuantizaciones; el repositorio de 85,8 GB sugiere requisitos elevados si se cargan todos los checkpoints a la vez).
- GPU recomendadas: no disponible. Por el tamaño del repositorio, es razonable esperar GPUs de centro de datos (A100, H100) para carga completa, pero esto no se confirma en la documentación.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: no se documentan vLLM, llama.cpp, Ollama ni TGI; el despliegue previsto es mediante el adaptador `phoenix_robosynchallenge` y la librería `diffusers`.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares
No se dispone de información sobre modelos comparables en la documentación proporcionada. Se trata de un artefacto específico de un challenge de robótica, sin datos públicos de parámetros, contexto, rendimiento o licencia que permitan una comparación rigurosa con alternativas.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WAM-RoboSyn-2026 | no disponible | no disponible | no disponible | no disponible | Hugging Face (repo `wxt123/WAM-RoboSyn-2026`) |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias
- Ausencia de licencia declarada: no se puede determinar si el uso comercial está permitido; tratar como restringido hasta confirmación del autor.
- Model card mínima: no hay información sobre arquitectura, parámetros, datos de entrenamiento ni evaluación, lo que impide validar calidad o robustez.
- Especialización extrema: los checkpoints solo cubren cinco tareas concretas; no son reutilizables como modelo general.
- Dependencia externa: el adaptador `phoenix_robosynchallenge`, el smoothing y las reglas de tarea no están en el repositorio, por lo que la inferencia correcta requiere ese paquete adicional.
- Riesgo de desalineación de configuración: las rutas relativas de `inference_config.yaml` deben respetarse; cambios en el layout pueden romper la carga.
- Sin datos de sesgo, alucinación o idioma: no aplicables en el sentido habitual de un LLM, pero tampoco evaluados para el dominio robótico.
- Tamaño elevado (85,8 GB): carga y almacenamiento costosos; conviene descargar solo los checkpoints necesarios.
- Fecha de creación futura (2026-11-16) y cero descargas/likes: artefacto reciente y sin validación comunitaria.

## Enlaces
- Repositorio Hugging Face: https://huggingface.co/wxt123/WAM-RoboSyn-2026
- No se han encontrado en la información proporcionada enlaces a papers, blogs, repositorios de código ni demos adicionales.
