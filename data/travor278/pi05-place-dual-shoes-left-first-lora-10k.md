# Travor278/pi05-place-dual-shoes-left-first-lora-10k

## Resumen

Travor278/pi05-place-dual-shoes-left-first-lora-10k es un checkpoint de politica robotica publicado por el usuario Travor278, derivado del modelo base PI0.5 en su implementacion JAX de OpenPI. No es un modelo de lenguaje al uso: se trata de un artefacto de vision-lenguaje-accion (VLA) afinado mediante LoRA sobre un backbone PaliGemma con un unico experto de accion, entrenado para una tarea concreta de manipulacion (colocar un par de zapatos, empezando por el izquierdo). El checkpoint corresponde al update logico numero 10.000 y debe cargarse apuntando al directorio `10000/`.

El problema que resuelve es de tipo investigacion aplicada en robotica: proporciona una politica entrenada y verificada sobre un dataset concreto (Shiki42/ctr-place-dual-shoes-left-first-20260911, 50 episodios), con estado y acciones absolutos de 14 dimensiones preservados y entradas de camara RGB (vista superior y dos vistas de muneca) redimensionadas a 224x224. Su relevancia actual es acotada y practica: sirve como punto de partida reproducible para comparar tecnicas de fine-tuning con LoRA en el ecosistema OpenPI y para tareas de colocacion en robots de doble brazo.

Se trata de un checkpoint Orbax de JAX (no un safetensors de LeRobot/PyTorch), con el estado del optimizador excluido del payload de inferencia. El repositorio ocupa 6,3 GB y no declara licencia ni idiomas soportados. El propio autor indica explicitamente que no se reclama ninguna evaluacion en lazo cerrado sobre la tarea.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-language-action) basada en PaliGemma con un unico experto de accion, implementada en JAX/Flax (OpenPI) |
| Parametros totales | no disponible (el repositorio ocupa 6,3 GB) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint Orbax; no se publican variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax checkpoint (JAX); no safetensors ni GGUF |
| Tamano del repositorio | 6,3 GB |
| Pipeline / tarea | robotics |
| Checkpoint | 10.000 updates; raiz en el directorio `10000/` |
| Dataset de entrenamiento | Shiki42/ctr-place-dual-shoes-left-first-20260911 (commit 04d72a4c1770fa4699a4c8630b41484b33f18c54), 50 episodios |
| Adaptacion | LoRA PaliGemma rank/alpha 16 y experto rank/alpha 32 |
| Horizonte de accion | 50 |
| Estado/acciones | 14 dimensiones absolutas, sin conversion de unidades Aloha ni transformacion delta |

## Arquitectura y entrenamiento

La arquitectura declarada es la del base PI0.5 de OpenPI: un modelo vision-lenguaje-accion con backbone PaliGemma y un unico experto de accion, con pesos completos del arbol de parametros base mas los pesos LoRA incorporados. El autor indica que deben usarse las variantes `Pi0Config` de un solo experto al cargar el modelo. Las entradas son tres vistas RGB (superior y ambas munecas) procesadas con las transformaciones estandar de OpenPI a 224x224, y la salida es un vector de estado/accion absoluto de 14 dimensiones sin conversiones de unidades ni deltas.

El entrenamiento consistio en 10.000 updates completados con batch global 16, semilla 87431 y horizonte 50. El optimizador es AdamW con beta1=0,9, beta2=0,95, epsilon=1e-8, weight decay=1e-10 y clipping 1; el scheduler es coseno de 30.000 pasos con pico 2,5e-5, warmup de 1.000 pasos y decaimiento final de 2,5e-6. No se uso EMA ni mascara de idle. El filtro de congelacion de referencia incluye vision y proyecciones entrenables mediante LoRA. La model card documenta un incidente de guardado (el proceso original se detuvo en el callback de assets por un problema de compatibilidad con la exportacion publica de Orbax) y su recuperacion: los payloads se finalizaron en un directorio separado, cada array de parametros y de optimizador se restauro estrictamente con errores de chunk ausente habilitados, se verifico que fueran finitos y se comprobo el contador de paso en 10.000, con hashes registrados en `RECOVERY_VERIFIED.json`. El estado del optimizador se conserva en la plataforma de entrenamiento pero queda excluido del payload de inferencia.

## Capacidades

- Control de robot de doble brazo: genera acciones de 14 dimensiones para una politica de colocacion de zapatos, empezando por el izquierdo.
- Percepcion multimodal con tres camaras: consume vista superior y dos vistas de muneca en RGB a 224x224.
- Generacion de acciones en modo chunk: horizonte de accion de 50 pasos.
- Fine-tuning mediante LoRA sobre PaliGemma y sobre el experto de accion, con filtro de congelacion de referencia.
- Carga y ejecucion en el ecosistema OpenPI (JAX/Flax) mediante checkpoints Orbax.
- Trazabilidad de entrenamiento: la carpeta `10000/experiment/` incluye inventario de paquetes Python/JAX/CUDA, ajustes resueltos de modelo/optimizador/scheduler, parche de codigo fuente contra el commit upstream fijado, hashes de ficheros del dataset, binding de GPU, comprobaciones en CPU e historial de fallo y recuperacion del checkpoint.
- No incluye soporte declarado de tool calling, function calling, agentes, capacidades multilingues ni modo de razonamiento explicito.

## Casos de uso

- Manipulacion robotica de calzado en celulas de empaquetado: la politica esta entrenada especificamente para colocar un par de zapatos empezando por el izquierdo sobre una superficie, con estado y acciones absolutos en 14 dimensiones, lo que encaja con brazos duales de laboratorio o linea piloto.
- Replicacion de experimentos de fine-tuning con LoRA en OpenPI: el checkpoint incluye la jerarquia completa de parametros base mas los adaptadores, de modo que un equipo puede reproducir la receta (batch 16, LR pico 2,5e-5, scheduler coseno de 30.000 pasos) partiendo del mismo dataset y semilla.
- Punto de partida para nuevos fine-tunings de colocacion: al compartir el arbol de parametros del base PI0.5, sirve como inicializacion para tareas similares de pick-and-place sobre la misma configuracion de camaras y el mismo espacio de acciones.
- Auditoria de integridad de checkpoints Orbax: el repositorio documenta un fallo de exportacion y su recuperacion con verificacion de hashes (`RECOVERY_VERIFIED.json`), por lo que es un caso de estudio util para equipos que necesiten validar payloads de entrenamiento interrumpidos.
- Evaluacion offline sobre el dataset de referencia: permite medir error de prediccion de acciones contra los 50 episodios de Shiki42/ctr-place-dual-shoes-left-first-20260911 sin necesidad de robot fisico.
- Integracion en pipelines de investigacion con JAX: al ser un checkpoint nativo de OpenPI, se puede insertar en bucles de entrenamiento o evaluacion ya existentes basados en Flax/Orbax sin conversion de formato.
- Comparacion de estrategias de adaptacion: al usar LoRA con rangos distintos para PaliGemma (16) y para el experto de accion (32), permite estudiar el efecto de esa asimetria frente a otros esquemas de congelacion.
- Base para pruebas de reproducibilidad de entorno: el inventario de paquetes y el binding de GPU registrados en `10000/experiment/` permiten reconstruir el entorno efectivo y comparar con el runtime JAX construido aparte.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna evaluacion en lazo cerrado del modelo sobre la tarea de colocacion de zapatos, y no se proporcionan metricas de exito, error de accion ni comparaciones numericas con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. El payload de inferencia ocupa 6,3 GB en disco, por lo que el peso de los parametros ronda ese orden de magnitud; a ello hay que sumar activaciones de las tres camaras y del experto de accion. Cualquier cifra concreta seria una estimacion, no un dato publicado.
- GPU recomendadas: no disponible. La model card menciona que el binding de GPU quedo registrado en `10000/experiment/`, pero no especifica el modelo utilizado ni en entrenamiento ni en inferencia.
- Encaje en GPU de consumo: no confirmado. Dado el tamano del payload, es plausible en GPUs de gama alta con suficiente VRAM, pero el autor no publica requisitos ni pruebas en hardware de consumo.
- Opciones de despliegue: OpenPI sobre JAX/Flax, cargando el checkpoint Orbax desde el directorio `10000/`. Los motores de inferencia habituales para LLM (vLLM, llama.cpp, Ollama, TGI) no son aplicables directamente, ya que el artefacto no es un modelo de texto en safetensors ni GGUF, sino una politica VLA.
- Latencia y throughput: no disponibles.
- Nota de carga: es necesario usar las variantes `Pi0Config` de un solo experto y consultar `openpi_config.json` y los assets especificos del dataset para reconstruir la configuracion.

## Comparativa con modelos similares

No se dispone de datos numericos comparativos en la informacion proporcionada. La comparacion siguiente es cualitativa y de categoria; los campos sin dato figuran como "no disponible".

| Modelo | Categoria | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-place-dual-shoes-left-first-lora-10k | Checkpoint VLA afinado con LoRA para una tarea de colocacion | no disponible | no disponible | no disponible | Publico en HuggingFace (0 descargas, 0 likes) |
| Base PI0.5 de OpenPI (referencia del autor) | Modelo VLA base sobre el que se aplica el LoRA | no disponible | no disponible | no disponible | Referenciado como origen del checkpoint |
| Otros checkpoints OpenPI de la misma familia | Checkpoints VLA con backbone PaliGemma y experto de accion | no disponible | no disponible | no disponible | no disponible |
| Politicas VLA de robotica de otros autores | Modelos vision-lenguaje-accion para control de robots | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- No se declara licencia: sin terminos explicitos, el uso comercial queda en un limbo juridico y conviene contactar con el autor antes de cualquier despliegue productivo.
- No se declara idioma ni capacidades multilingues; el modelo esta orientado a control robotico, no a generacion de texto.
- No hay evaluacion en lazo cerrado: el propio autor afirma que no se reclama ninguna evaluacion del modelo ejecutando la tarea de zapatos en un robot real, por lo que el rendimiento efectivo es desconocido.
- Especificidad extrema de la tarea: la politica esta entrenada sobre 50 episodios de una unica tarea (colocar un par de zapatos empezando por el izquierdo). Fuera de esa distribucion no hay garantia de comportamiento.
- Dataset muy reducido: 50 episodios es un volumen pequeno, lo que incrementa el riesgo de sobreajuste a las condiciones concretas de camara, iluminacion y posiciones de los objetos.
- Formato no estandar para el ecosistema PyTorch: es un checkpoint Orbax de JAX, no un safetensors de LeRobot, lo que obliga a usar la pila OpenPI y complica su reutilizacion fuera de ella.
- Estado del optimizador excluido del payload: no se puede reanudar el entrenamiento desde este artefacto tal cual, solo hacer inferencia o partir de los pesos.
- Historial de recuperacion de checkpoint: el guardado original fallo en el callback de assets por incompatibilidad de exportacion publica de Orbax. Aunque se verificaron hashes, arrays finitos y el contador de paso 10.000, conviene revisar `RECOVERY_VERIFIED.json` y la carpeta `10000/experiment/` antes de confiar en el artefacto.
- Sin resultados de benchmarks ni metricas publicadas: no es posible comparar su calidad con alternativas de forma objetiva.
- Advertencia general de robotica: cualquier politica de manipulacion puede producir acciones inseguras ante entradas fuera de distribucion; es imprescindible validar en entorno simulado y con limites de par y velocidad antes de operar hardware real.

## Enlaces

- HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-left-first-lora-10k
- Dataset de entrenamiento referenciado en la model card: Shiki42/ctr-place-dual-shoes-left-first-20260911, commit 04d72a4c1770fa4699a4c8630b41484b33f18c54 (no se proporciona URL directa)
- Ficheros internos citados en la model card: `10000/`, `10000/experiment/`, `openpi_config.json`, `RECOVERY_VERIFIED.json`
- No se han encontrado papers, blogs, repositorios ni demos adicionales en los resultados de busqueda disponibles.
