# Travor278/pi05-pick-dual-bottles-left-first-peer-lora-10k-e162

## Resumen

El modelo `Travor278/pi05-pick-dual-bottles-left-first-peer-lora-10k-e162` es un checkpoint de inferencia en JAX/Orbax derivado de PI0.5, una política robótica de la familia visión-lenguaje-acción distribuida a través de la biblioteca openpi. El autor, Travor278, lo publica como parte de la serie de entrenamiento autorizada Sim12, con adaptadores LoRA entrenados durante 10 000 actualizaciones del optimizador sobre el dataset `Shiki42/ctr-pick-dual-bottles-left-first-20260911`, fijado en el commit `da5c6c49c1e04fbd0e55bf884f4c7c734cdf79ea`.

El problema que resuelve es acotado y concreto: ejecutar la política de manipulación denominada `pick-dual-bottles-left-first` (recogida de dos botellas con prioridad de la izquierda) entrenada en el simulador Sim12. Su relevancia para un desarrollador o investigador es doble: por un lado, la model card documenta de forma explícita la receta de entrenamiento (batch global 16, GA1, FSDP1, semilla 87 431, acciones articulares delta y máscara de pérdida con relleno temporal); por otro, el repositorio incluye la configuración OpenPI de inferencia, los assets de normalización emparejados y un manifiesto con verificación SHA-256 de cada fichero, lo que permite reproducir la evaluación sin reentrenar.

El repositorio ocupa 6,3 GB y contiene los parámetros completos del modelo, pero no incluye optimizer, `train_state` ni estado de reanudación del `data_loader`. No se especifican licencia, idiomas soportados, número de parámetros ni requisitos de hardware. El contador público muestra 0 descargas y 0 likes, por lo que no existe todavía validación externa por parte de la comunidad.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política robótica PI0.5 con adaptadores LoRA sobre JAX/Orbax; detalle interno de capas no disponible |
| Parametros totales | no disponible (el repositorio de 6,3 GB contiene los parámetros completos del modelo) |
| Parametros activos | no disponible (no se indica que el modelo sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (no se realizó conversión de formato; el checkpoint se publica sin cuantizar) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (JAX); no es un modelo Transformers ni safetensors; incluye parámetros completos y assets de normalización emparejados |
| Tamano del repositorio | 6,3 GB |
| Libreria | openpi |
| Tarea | pick-dual-bottles-left-first (Sim12) |
| Dataset de entrenamiento | Shiki42/ctr-pick-dual-bottles-left-first-20260911, commit da5c6c49c1e04fbd0e55bf884f4c7c734cdf79ea |
| Actualizaciones del optimizador | 10 000 |
| Batch global / acumulacion de gradiente / FSDP | 16 / 1 / 1 |
| Semilla | 87 431 |
| Horizonte de accion | 50 |
| Pasos de difusion | 10 |
| Representacion de acciones | acciones articulares delta |
| Enmascarado de perdida | mascara de enmascarado temporal (temporal-padding loss mask) |
| Estado incluido | solo inferencia (sin optimizer, sin train_state, sin data_loader) |
| Verificacion de integridad | SHA-256 por fichero contra el recibo original de recarga en CPU; CHECKPOINT_MANIFEST.json |
| Fecha de creacion registrada | 2026-09-15 |
| Fecha de actualizacion registrada | 2026-09-15 |

## Arquitectura y entrenamiento

Se trata de un checkpoint de PI0.5 con adaptadores LoRA, distribuido en formato Orbax para su uso con JAX y la biblioteca openpi. La model card no describe la arquitectura interna (número de capas, dimensión oculta, mecanismo de atención o codificador visual), por lo que ese dato queda como no disponible. Sí se documentan dos parámetros operativos relevantes: el horizonte de acción es 50 y los pasos de difusión son 10, y el autor advierte explícitamente de que ambos valores son conceptos distintos y no deben confundirse.

El entrenamiento se realizó durante 10 000 actualizaciones del optimizador con batch global 16, acumulación de gradiente 1, FSDP 1 y semilla 87 431. La política predice acciones articulares en forma de delta y la pérdida emplea una máscara de relleno temporal. El checkpoint publicado es de solo inferencia: se excluyen el optimizer, el `train_state` y el estado de reanudación del `data_loader`, de modo que no permite continuar el entrenamiento tal cual. Para ejecutarlo hay que fijar `PARALLELVLA_DATASET_REPO` al dataset indicado y `PARALLELVLA_NORM_ASSETS_DIR` al directorio local `10000/assets`, además de usar una fuente OpenPI compatible con PI0.5 y su entorno de configuración base. La configuración cualificada y la configuración de inferencia de OpenPI se incluyen bajo el apartado de procedencia del repositorio.

## Capacidades

- Generación de acciones de manipulación robótica para la tarea `pick-dual-bottles-left-first` en el simulador Sim12.
- Inferencia con adaptadores LoRA sobre PI0.5 empleando el ecosistema JAX/Orbax y la biblioteca openpi.
- Uso de assets de normalización emparejados, incluidos en el propio repositorio, para preprocesar las observaciones.
- Carga del checkpoint indicando `10000/` como `checkpoint_dir`.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes o razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles.
- Capacidades de visión general, audio o modo de razonamiento explícito: no disponibles (más allá del componente de visión que pueda formar parte de PI0.5, no documentado en esta model card).
- Compatibilidad con Transformers, safetensors, GGUF, vLLM, llama.cpp u Ollama: no; el propio autor indica que no es un modelo Transformers/safetensors.

## Casos de uso

- Reproducción de la receta `peer` LoRA10k E162: permite volver a ejecutar la inferencia con la configuración OpenPI incluida y comprobar los resultados frente al panel de evaluación de SwanLab, útil para auditar una receta concreta de la serie Sim12.
- Despliegue en simulación de manipulación con dos objetos: el modelo está entrenado específicamente para recoger dos botellas dando prioridad a la izquierda, por lo que sirve como política de referencia en ese escenario dentro de Sim12.
- Punto de partida para nuevos fine-tunes con LoRA: al ser un adaptador sobre PI0.5 con 10 000 actualizaciones, se puede reutilizar como inicialización para variantes del mismo dataset o de tareas próximas, siempre que se reconstruya el estado de entrenamiento (que no viene incluido).
- Evaluación comparativa entre recetas de la misma familia: al compartir dataset, semilla y configuración declarada, el checkpoint facilita comparaciones controladas frente a otras variantes LoRA entrenadas con la misma receta.
- Investigación sobre representación de acciones: el uso de acciones articulares delta junto con horizonte 50 y 10 pasos de difusión permite estudiar el efecto de estos hiperparámetros en la estabilidad de la política.
- Generación de trayectorias para evaluación offline: el checkpoint puede emplearse para producir rollouts en simulador y analizar tasas de éxito, siempre que se disponga de la infraestructura OpenPI y del dataset de normalización referenciado.
- Integración en un pipeline de control robótico basado en JAX: al distribuirse como Orbax, encaja en stacks de inferencia que ya usen JAX, sin necesidad de convertir a safetensors, aunque a costa de perder compatibilidad con el ecosistema estándar de Hugging Face.
- Verificación de procedencia en entornos regulados: el manifiesto con SHA-256 de cada fichero y el recibo de recarga en CPU permiten auditar la integridad del artefacto antes de desplegarlo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card remite a un panel externo de evaluación en SwanLab (`https://swanlab.cn/@Travor/CTR-PI05-LoRA10k`) y advierte de que la finalización de la subida no implica la publicación de resultados. No se proporcionan cifras de tasa de éxito, error de acción ni comparaciones numéricas con otros checkpoints.

| Benchmark | Resultado |
|---|---|
| Tasa de exito en la tarea | no disponible |
| Comparacion con PI0.5 base | no disponible |
| Comparacion con otras recetas LoRA de la serie | no disponible |
| Metricas de simulacion (Sim12) | no disponible |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. Como referencia indirecta, el repositorio ocupa 6,3 GB y contiene los parámetros completos del modelo; asumiendo pesos en bf16, el orden de magnitud estaría en torno a 3 000 millones de parámetros, pero es una estimación derivada del tamaño del repositorio y no un dato confirmado por el autor.
- GPU recomendadas: no disponible. La model card no especifica modelo de GPU, memoria mínima ni configuración de aceleración.
- Compatibilidad con GPU de consumo: no confirmada. Depende del runtime JAX/OpenPI y de si el checkpoint se carga completo o con adaptadores, dato no documentado.
- Opciones de despliegue: OpenPI sobre JAX con checkpoint Orbax. No aplican vLLM, llama.cpp, Ollama, TGI ni pipelines estándar de Transformers, al no ser un modelo safetensors y no haberse realizado conversión de formato.
- Configuración de entorno obligatoria: `PARALLELVLA_DATASET_REPO` apuntando al dataset de entrenamiento y `PARALLELVLA_NORM_ASSETS_DIR` apuntando al directorio local `10000/assets`, con la fuente OpenPI compatible con PI0.5 y su configuración base.
- Latencia y throughput estimados: no disponibles.
- Almacenamiento: al menos 6,3 GB para el repositorio, más el espacio del dataset y de los assets de normalización.

## Comparativa con modelos similares

No se dispone de datos comparativos en la informacion proporcionada: ni parámetros, ni contexto, ni resultados de benchmarks de este checkpoint o de alternativas. La comparación se limita a lo declarado en el repositorio.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| pi05-pick-dual-bottles-left-first-peer-lora-10k-e162 | no disponible | no disponible | no disponible | no disponible | Hugging Face, 0 descargas, 0 likes |
| PI0.5 base (openpi) | no disponible | no disponible | no disponible | no disponible | referenciado como modelo base, sin ficha incluida en la informacion |
| Otras recetas `peer` de la serie Sim12 | no disponible | no disponible | no disponible | no disponible | no disponible |
| Alternativas de politica robotica como OpenVLA o GR00T N1 | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no declarada: sin licencia explícita no puede asumirse permiso de uso comercial; conviene contactar con el autor antes de cualquier despliegue productivo.
- Artefacto de solo inferencia: al excluir optimizer, `train_state` y estado del `data_loader`, no se puede reanudar el entrenamiento desde este checkpoint sin reconstruir ese estado por otras vías.
- Formato no estándar: al no ser Transformers ni safetensors, queda fuera de las herramientas habituales de cuantización, servidores de inferencia y comparativas automáticas de Hugging Face.
- Especialización estrecha: la política está entrenada para `pick-dual-bottles-left-first`; no hay evidencia de generalización a otras tareas, objetos o distribuciones visuales.
- Riesgo de alucinación trasladado al dominio físico: en una política robótica, una predicción incorrecta se manifiesta como una acción errónea o un fallo de agarre; no se publican tasas de éxito ni análisis de fallos.
- Sesgos: no documentados. Al depender de un dataset de simulación concreto, es probable que herede sus sesgos de apariencia, iluminación, posiciones iniciales y dinámica, pero no hay análisis disponible.
- Idiomas y contexto: no disponibles; no se puede asumir soporte multilingüe ni una ventana de contexto concreta.
- Sin validación externa: 0 descargas y 0 likes en el momento de la consulta; no existe evidencia pública de reproducción independiente.
- Resultados no publicados: el panel de SwanLab se menciona como seguimiento, pero la model card no incluye cifras y advierte de que la subida del checkpoint no implica resultados.
- Fechas de registro anómalas: la creación y la última actualización figuran como 2026-09-15, posteriores a la fecha habitual de consulta, lo que conviene verificar antes de citar el artefacto como referencia temporal.
- Dependencia de entorno frágil: la ejecución exige variables de entorno concretas y una fuente OpenPI compatible con PI0.5; un desajuste de versión puede invalidar la normalización de acciones.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Travor278/pi05-pick-dual-bottles-left-first-peer-lora-10k-e162
- Panel de evaluacion en SwanLab: https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Dataset de entrenamiento (identificador declarado en la model card, con commit `da5c6c49c1e04fbd0e55bf884f4c7c734cdf79ea`): https://huggingface.co/datasets/Shiki42/ctr-pick-dual-bottles-left-first-20260911
- Repositorio de la biblioteca openpi: no disponible en la informacion proporcionada
- Paper o blog tecnico del modelo: no disponible en la informacion proporcionada
