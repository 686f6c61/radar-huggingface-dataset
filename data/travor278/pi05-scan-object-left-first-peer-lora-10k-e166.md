# Travor278/pi05-scan-object-left-first-peer-lora-10k-e166

## Resumen

El modelo `Travor278/pi05-scan-object-left-first-peer-lora-10k-e166` es un checkpoint de inferencia en formato JAX/Orbax para robótica, publicado por el usuario Travor278 dentro de la serie de entrenamiento denominada Sim12. Se trata de un ajuste fino con LoRA sobre la receta "peer" de PI0.5, la familia de modelos visión-lenguaje-acción referenciada en las etiquetas (`pi05`, `robotics`, `openpi`). El checkpoint corresponde a la época (epoch) 166 de un entrenamiento de 10.000 actualizaciones del optimizador y está pensado exclusivamente para inferencia.

El problema que aborda es el de generar políticas de control para una tarea concreta de manipulación (`scan-object-left-first`), entrenada sobre el dataset `Shiki42/ctr-scan-object-left-first-20260911`. El repositorio contiene los parámetros completos del modelo y los activos de normalización asociados, pero excluye el optimizador, el `train_state` y el estado de reanudación del `data_loader`, por lo que no permite continuar el entrenamiento tal cual.

Su relevancia es acotada y muy específica: es un artefacto de investigación reproducible (todos los ficheros verificados con SHA-256) dentro de una serie comparativa de recetas LoRA sobre PI0.5, con 0 descargas y 0 "likes" en el momento de la consulta. No es un modelo de lenguaje general ni un modelo en formato Transformers/safetensors, y su licencia no está especificada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo visión-lenguaje-acción PI0.5 con adaptadores LoRA (receta "peer"); checkpoint JAX/Orbax, no es un modelo de la librería Transformers |
| Parametros totales | no disponible (el repositorio ocupa 6,3 GB e incluye parámetros y activos de normalización, pero no se declara el número de parámetros ni la precisión de almacenamiento) |
| Longitud de contexto | no disponible (se documenta un horizonte de acción de 50 pasos, que es un parámetro distinto del contexto de entrada) |
| Tipos de cuantizacion | no disponible; no se publican variantes cuantizadas ni conversión de formato |
| Idiomas soportados | no disponible; no se documenta condicionamiento por lenguaje en este checkpoint |
| Licencia | no disponible |
| Formato de pesos | JAX/Orbax (checkpoint de inferencia; no safetensors, no GGUF) |
| Libreria | openpi |
| Tamano del repositorio | 6,3 GB |
| Pasos de entrenamiento | 10.000 actualizaciones del optimizador |
| Batch global | 16 (acumulación de gradiente 1, FSDP1) |
| Semilla | 87431 |
| Horizonte de accion | 50 pasos (distinto de `num_steps` de difusión, que es 10) |
| Dataset de entrenamiento | `Shiki42/ctr-scan-object-left-first-20260911` (commit `0dcad06b700ef298f34582a923ad7a534a2fc929`) |
| Fecha de creacion | 2026-09-15 |

## Arquitectura y entrenamiento

El checkpoint es un ajuste fino con LoRA de la receta "peer" de PI0.5, entrenado con JAX sobre el dataset `Shiki42/ctr-scan-object-left-first-20260911`. El entrenamiento consta de 10.000 actualizaciones del optimizador con batch global 16, acumulación de gradiente 1, sharding FSDP1 y semilla 87431. La función de pérdida emplea acciones articulares en formato delta y una máscara de pérdida basada en relleno temporal (`temporal-padding loss mask`). La model card indica que no se realizó ninguna conversión de formato y que solo se conservan los ficheros necesarios para inferencia, inventariados en `CHECKPOINT_MANIFEST.json`.

La arquitectura subyacente es la del modelo base PI0.5 (visión-lenguaje-acción) según las etiquetas y la librería declarada, pero la información proporcionada no detalla la composición del dataset (número de episodios, tokens, modalidades), ni si hubo etapas de RLHF/DPO, ni innovaciones técnicas concretas más allá de la receta LoRA y del esquema de pérdida. Dos parámetros operativos sí quedan explícitos: el horizonte de acción es de 50 pasos y el número de pasos de difusión es 10, y el autor subraya que son valores distintos. El modelo se carga pasando `10000/` como `checkpoint_dir`.

## Capacidades

- Generación de acciones de control robótico para la tarea `scan-object-left-first`, condicionada por las observaciones correspondientes al entorno de entrenamiento.
- Inferencia en JAX mediante el stack OpenPI, con activos de normalización emparejados con el dataset de entrenamiento.
- Reproducción exacta del artefacto: cada fichero fuente fue verificado con SHA-256 contra el recibo de recarga en CPU antes de la subida.
- No se documentan capacidades de generación de texto, razonamiento, código, matemáticas, visión general, audio ni tool calling/function calling.
- No se documentan capacidades de agente, razonamiento multi-paso ni modo "thinking".
- No se documentan capacidades multilingües.
- No está diseñado para fine-tuning adicional a partir de este repositorio: el estado del optimizador, el `train_state` y el estado de reanudación del `data_loader` están excluidos.

## Casos de uso

- Reproducción de un experimento de robótica en simulación: el checkpoint se carga con `checkpoint_dir=10000/` sobre OpenPI y permite replicar la política entrenada sobre el dataset de la serie Sim12, útil para verificar resultados publicados en la serie.
- Comparativa interna de recetas LoRA: al ser un "peer" de la serie LoRA10k con 10.000 actualizaciones y semilla 87431, sirve como punto de comparación controlado frente a otros checkpoints de la misma serie que compartan dataset y configuración.
- Investigación en aprendizaje por imitación con adaptadores LoRA: permite estudiar el efecto del ajuste de bajo rango sobre un modelo visión-lenguaje-acción en una tarea de manipulación concreta, manteniendo fijo el resto de parámetros.
- Validación de infraestructura OpenPI/JAX: es un artefacto útil para comprobar que un pipeline de inferencia resuelve correctamente las variables `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR` y la versión compatible de la base-config.
- Auditoría de reproducibilidad: el inventario `CHECKPOINT_MANIFEST.json` y la verificación SHA-256 permiten montar un procedimiento de validación de integridad de artefactos en un equipo de investigación.
- Punto de partida para estudios de adaptación posterior: al incluir los parámetros completos del modelo (aunque sin estado de optimizador), puede emplearse como inicialización en experimentos que reconstruyan su propio estado de entrenamiento.
- Evaluación de transferencia sim-a-real en laboratorio: siempre que el entorno de destino coincida con la tarea `scan-object-left-first`, puede probarse como política candidata, con validación previa en simulación y sin asumir que exista dicha transferencia.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explícitamente que los resultados de evaluación se registran en un panel externo de SwanLab (`https://swanlab.cn/@Travor/CTR-PI05-LoRA10k`) y que la finalización de la subida no implica la obtención de resultados. No se proporcionan cifras de tasa de éxito, error de acción ni métricas comparables.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 6,3 GB, cifra que marca un mínimo de espacio en disco, pero la huella en memoria de inferencia depende del modelo base PI0.5 y de la precisión de carga, datos que no se declaran.
- GPU recomendadas: no disponible en la información proporcionada. El stack es JAX, por lo que se requiere hardware con soporte CUDA y una versión de JAX compatible con el código OpenPI.
- Compatibilidad con GPU de consumo: no disponible. No se documenta si el checkpoint cabe en GPUs tipo RTX 4090 o inferiores, ni si requiere sharding entre varios dispositivos.
- Opciones de despliegue: el checkpoint no es safetensors ni GGUF, por lo que no es cargable directamente con vLLM, llama.cpp, Ollama ni TGI. El despliegue previsto es OpenPI con JAX/Orbax.
- Latencia y throughput estimados: no disponible. El único parámetro temporal documentado es la configuración de control, con horizonte de acción 50 y 10 pasos de difusión.
- Requisitos de entorno: es necesario definir `PARALLELVLA_DATASET_REPO` (apuntando al dataset de entrenamiento) y `PARALLELVLA_NORM_ASSETS_DIR` (apuntando al directorio local `10000/assets`), además de disponer de la fuente OpenPI compatible con PI0.5 y su entorno de configuración base.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. La búsqueda web realizada no devolvió resultados relacionados con el modelo (los enlaces recuperados tratan sobre Antoine de Ligne y no guardan relación con robótica ni con PI0.5). Se recoge únicamente lo verificable:

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| pi05-scan-object-left-first-peer-lora-10k-e166 | no disponible | no disponible | no disponible | JAX/Orbax | Público en HuggingFace, 0 descargas, 0 likes |
| Modelo base PI0.5 (OpenPI) | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |
| Otros checkpoints "peer" de la serie Sim12 | no disponible | no disponible | no disponible | no disponible | no disponible en la informacion |

## Limitaciones y advertencias

- Modelo de propósito específico para robótica: no es un modelo de lenguaje general y no debe evaluarse con benchmarks de texto (MMLU, HumanEval, GSM8K) ni usarse para tareas de generación de texto.
- Formato no estándar: al no ser Transformers ni safetensors ni GGUF, queda fuera del ecosistema habitual de despliegue (vLLM, llama.cpp, Ollama, TGI) y depende del código OpenPI y de una base-config concreta.
- Restricciones de reanudación: al excluir optimizador, `train_state` y estado del `data_loader`, el checkpoint es de solo inferencia y no permite retomar el entrenamiento con fidelidad.
- Licencia no especificada: la ausencia de licencia explícita impide asumir permisos de uso comercial o de redistribución; es necesario contactar con el autor antes de cualquier uso productivo.
- Dependencia fuerte del entorno de datos: requiere las variables `PARALLELVLA_DATASET_REPO` y `PARALLELVLA_NORM_ASSETS_DIR` apuntando al dataset de entrenamiento y a los activos locales, lo que ata la reproducibilidad a versiones concretas de datos y código.
- Sin validación comunitaria: 0 descargas y 0 likes en el momento de la consulta, sin evidencia de uso independiente ni de replicación por terceros.
- Evaluación no publicada en el repositorio: los resultados se remiten a un panel externo de SwanLab, y la model card advierte que la finalización de la subida no implica resultados de evaluación.
- Posible sobreajuste a la tarea: 10.000 actualizaciones sobre un único dataset orientado a `scan-object-left-first` hacen esperable un rendimiento limitado fuera de esa distribución.
- Transferencia a hardware real no documentada: no se aportan evidencias de sim-a-real, por lo que desplegar la política en un robot físico conlleva riesgo de acciones erróneas y de daño material o personal. Cualquier evaluación debe hacerse primero en simulación y con límites de seguridad.
- Sesgos: no documentados. Al depender de un dataset de simulación concreto, es probable que herede sus sesgos de distribución (objetos, iluminación, posiciones iniciales y dinámica del simulador).
- Riesgo de alucinación: en una política visión-lenguaje-acción, el modo de fallo equivalente no es textual sino conductual, manifestándose como trayectorias o acciones incoherentes respecto a la tarea.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-scan-object-left-first-peer-lora-10k-e166
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-left-first-20260911 (commit `0dcad06b700ef298f34582a923ad7a534a2fc929`)
- Panel de evaluación en SwanLab: https://swanlab.cn/@Travor/CTR-PI05-LoRA10k
- Repositorio OpenPI: no se proporciona URL en la informacion disponible
- Paper de PI0.5: no se proporciona URL en la informacion disponible
- Nota sobre la busqueda web: los resultados recuperados no guardan relacion con el modelo (referencias biograficas sobre Antoine de Ligne); no se han incluido por no ser relevantes.
