# SUNNYsyy2005/pi05_pick_place_clean_joint_20261025_20k

## Resumen

`pi05_pick_place_clean_joint_20261025_20k` es un checkpoint de política visión-lenguaje-acción (VLA) construido sobre OpenPI π0.5 de Physical Intelligence y ajustado por el usuario SUNNYsyy2005 para una tarea concreta de pick-and-place bimanual con brazos Piper. No es un modelo de lenguaje: es una política de control que, a partir de tres cámaras (cenital y muñeca izquierda/derecha), un estado proprioceptivo de 14 dimensiones y una instrucción en inglés, emite 14 dimensiones de acción conjunta (brazo izquierdo seguido del derecho) con un *action chunk* de 50 pasos a 30 Hz.

El checkpoint corresponde al paso 20.000 de un entrenamiento realizado en una H200 y sincronizado después con una máquina de servicio con 4×RTX 4090. El ajuste fino cubre el codificador visual completo y el *action expert* completo, mientras que el modelo de lenguaje se adapta mediante LoRA manteniendo congelados sus parámetros base. Incorpora entrenamiento con *Real-Time Chunking* (RTC) con retardos de 0 a 12 pasos y pesos uniformes, pensado para inferencia en red con latencia variable.

Su relevancia es doble: por un lado demuestra el flujo de trabajo de ajuste de π0.5 sobre hardware de robot de bajo coste (Piper) con un conjunto de datos pequeño (81 episodios de entrenamiento, 9 de validación); por otro, publica los artefactos nativos en Orbax/OCDBT junto con el contrato de acción y las estadísticas de normalización, lo que permite reproducir el servidor de política sin reentrenar. La licencia no está declarada en la ficha y los pesos base quedan sujetos a los términos upstream de OpenPI.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Política VLA basada en OpenPI π0.5 (codificador visual + *action expert* + modelo de lenguaje con LoRA); no es un transformer de texto convencional |
| Parametros totales | No disponible (el repositorio ocupa 6,5 GB e incluye pesos nativos, estadísticas y metadatos) |
| Parametros activos | No disponible (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible; horizonte de acción de 50 pasos a 30 Hz (aprox. 1,67 s por chunk) |
| Tipos de cuantizacion | No disponible; se publican parámetros nativos en precisión de entrenamiento (Orbax/OCDBT) |
| Idiomas soportados | Inglés (`en`), únicamente para la instrucción de tarea |
| Licencia | No disponible; los pesos base se rigen por los términos de OpenPI / π0.5 upstream |
| Formato de pesos | Orbax / OCDBT (JAX); no compatible con `transformers.from_pretrained`, no hay safetensors ni GGUF |

Otros datos del contrato de acción: estado de 14D, acción de 14D (delta de articulaciones respecto al origen del chunk más objetivos absolutos de pinza), convención de pinza 0 = cerrada, 1 = abierta. Imágenes redimensionadas con *stretch resize*.

## Arquitectura y entrenamiento

La política sigue el diseño de OpenPI π0.5: un modelo visión-lenguaje-acción que combina percepción visual multi-cámara, comprensión de la instrucción en lenguaje natural y generación de acciones motrices. En este ajuste, el codificador visual está entrenado por completo, el *action expert* también se entrena íntegramente y el modelo de lenguaje se adapta con LoRA de bajo rango mientras sus parámetros base permanecen congelados. La entrada visual son tres vistas (cenital y una por muñeca), lo que da al *action expert* información de profundidad y de agarre simultánea de ambos brazos.

El entrenamiento se realizó sobre el dataset `pick_place_clean_joint_20261025`, con una partición agrupada de 81 episodios de entrenamiento y 9 reservados para validación. Se activó RTC durante el entrenamiento con retardos de 0 a 12 pasos y pesos uniformes, de forma que la política aprende a corregir trayectorias cuando la inferencia llega tarde respecto al reloj de control. El resultado es un checkpoint de 20.000 pasos con capacidad de restauración solo de pesos: no se incluyen el estado del optimizador ni el estado completo de entrenamiento. Los parámetros y las estadísticas de normalización se publican sin modificar respecto al experimento original `pick_place_joint_fullvision_llmlora_rtc12_h200_20k_20261025`.

## Capacidades

- Control bimanual de dos brazos Piper en espacio de articulaciones, con 14 dimensiones de acción por paso.
- Ejecución de la tarea "Pick up the small blue plastic container and place it inside the large blue plastic container" a partir de instrucción en inglés.
- Percepción multi-cámara: vista cenital más muñeca izquierda y derecha, con redimensionado *stretch*.
- Generación de *action chunks* de 50 pasos a 30 Hz, con decodificación de deltas articulares a objetivos absolutos en el adaptador de servicio.
- Control de pinza con objetivos absolutos (0 = cerrada, 1 = abierta).
- Tolerancia a latencia mediante RTC entrenado con retardos de 0 a 12 pasos.
- No soporta *tool calling*, agentes de texto, razonamiento multi-paso simbólico, visión general, audio ni generación de texto libre: es una política motriz, no un asistente.

## Casos de uso

- **Automatización de una celda pick-and-place con brazos Piper**: desplegar el checkpoint en el servidor de política OpenPI y conectar el cliente RTC para que la celda mueva el contenedor azul pequeño al contenedor grande, usando las tres cámaras ya previstas en el contrato de acción.
- **Base de partida para nuevos ajustes bimanuales**: reutilizar el checkpoint de 20k como inicialización en `bimanual_vla/training/` para tareas de ensamblaje o clasificación, aprovechando que el codificador visual y el *action expert* ya están adaptados a la morfología Piper.
- **Evaluación de robustez frente a latencia**: emplear el modelo con RTC activo para medir el comportamiento del lazo de control con retardos de red de hasta 12 pasos, un escenario habitual cuando la inferencia corre en un servidor externo al robot.
- **Recogida de datos en bucle cerrado**: usar la política para generar episodios de demostración adicionales sobre el mismo montaje y ampliar el dataset `pick_place_clean_joint_20261025`, que actualmente solo tiene 90 episodios agrupados.
- **Validación de pipelines JAX/Orbax en producción robótica**: servir el checkpoint nativo (sin conversión a safetensors) para verificar el flujo completo de `run.json`, `metadata/action-contract.json` y `norm_stats.json` antes de migrar a otros formatos.
- **Docencia y reproducción de VLA**: reproducir un ajuste completo de π0.5 sobre hardware asequible, ya que el autor documenta el entrenamiento en H200 y el servicio en 4×RTX 4090 con instrucciones de instalación y despliegue.
- **Pruebas de sustitución de robot**: adaptar el adaptador de servicio para decodificar los deltas articulares a otro par de manipuladores, manteniendo el mismo contrato de 14D.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que el vídeo de demostración en robot real es un único ejemplo exitoso y que no se reporta tasa de éxito agregada sobre rollouts. No se dispone de métricas de MMLU, HumanEval, GSM8K ni de éxito de tarea para este checkpoint, y no deben inferirse del modelo base.

| Metrica | Valor |
|---|---|
| Tasa de éxito agregada en robot real | No disponible (solo un ejemplo cualitativo) |
| Benchmarks de lenguaje o razonamiento | No aplica / no disponibles |
| Comparación con π0.5 base | No disponible |

## Requisitos de hardware

- **VRAM estimada**: no disponible de forma oficial. El repositorio completo ocupa 6,5 GB, incluyendo pesos, estadísticas de normalización y metadatos; los pesos en precisión nativa son la mayor parte de esa cifra, por lo que el *footprint* de parámetros es del orden de pocos GB, a lo que hay que sumar activaciones del codificador visual con tres cámaras.
- **GPU de referencia del autor**: entrenamiento en una NVIDIA H200; servicio en una máquina con 4×RTX 4090 (24 GB cada una).
- **Consumer GPU**: previsiblemente viable en una RTX 4090 o GPU de 24 GB, dado el tamaño del checkpoint, aunque el autor no documenta un despliegue en una sola GPU; tratarlo como estimación, no como dato verificado.
- **Opciones de despliegue**: servidor de política OpenPI integrado en el runtime `bimanual-vla` con `PiperPi0Config` y soporte de visión completa, LoRA de lenguaje y RTC. No es compatible con vLLM, llama.cpp, Ollama ni TGI, al no ser un modelo de lenguaje autoregresivo estándar y usar parámetros Orbax.
- **Latencia y throughput**: no disponibles. El diseño asume un *action chunk* de 50 pasos a 30 Hz y tolera retardos de 0 a 12 pasos mediante RTC, lo que fija el presupuesto temporal del lazo de control en torno a 33 ms por paso.
- **Nota de despliegue**: es necesario mantener `run.json` y `metadata/` por encima del directorio del checkpoint y definir `HF_LEROBOT_HOME` a la ruta absoluta del dataset para que el runtime resuelva el ID original.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto / horizonte | Licencia | Disponibilidad |
|---|---|---|---|---|
| `pi05_pick_place_clean_joint_20261025_20k` (este) | Política VLA π0.5 ajustada, bimanual Piper, espacio de articulaciones | Chunk de 50 pasos a 30 Hz | No disponible (base sujeta a términos OpenPI) | Pesos en HF, formato Orbax/OCDBT, runtime propio |
| OpenPI π0.5 base (`gs://openpi-assets/checkpoints/pi05_base`) | Política VLA generalista | No disponible en la información | Términos upstream de Physical Intelligence | Checkpoint público vía OpenPI |
| π0 (OpenPI) | Política VLA predecesora, base de π0.5 | No disponible en la información | Términos upstream | Disponible en OpenPI |
| `bx6d/r2s2r-pi05-six-tasks-diverse600` | Ajuste de π0.5 sobre seis tareas diversas | No disponible | No disponible | Pesos en HF |
| OpenPI `pi05_libero` | Ajuste de referencia para el benchmark LIBERO | No disponible | Términos upstream | Convertible a PyTorch según el tutorial de Jetson Thor |

La comparación cuantitativa de rendimiento entre estas variantes no está disponible: ninguno de los artefactos consultados publica tasas de éxito agregadas comparables.

## Limitaciones y advertencias

- **Modelo de una sola tarea**: la política está ajustada para un objeto y un montaje concretos (contenedor azul pequeño dentro de contenedor azul grande). No se debe esperar generalización a otras tareas sin nuevo ajuste.
- **Idioma**: la instrucción de tarea está en inglés; no hay soporte multilingüe declarado.
- **Licencia ambigua**: la ficha no declara licencia propia y remite a los términos del modelo base de OpenPI. Antes de un uso comercial es obligatorio revisar las condiciones upstream; la publicación no otorga licencia nueva sobre esos pesos.
- **Sin métricas de éxito**: solo existe un vídeo de demostración exitosa; el autor no reporta tasa de éxito agregada, número de rollouts ni condiciones de evaluación. Cualquier afirmación de fiabilidad en producción carece de base publicada.
- **Dataset pequeño**: 81 episodios de entrenamiento y 9 de validación, agrupados por episodio. Es plausible un sobreajuste al montaje, la iluminación y la disposición de las cámaras del dataset original.
- **Riesgo de alucinación motriz**: como toda política generativa, puede producir trayectorias plausibles pero incorrectas (fallos de agarre, colisiones) sin señal de confianza asociada; requiere paradas de seguridad y límites de par externos.
- **Restauración parcial**: el checkpoint contiene solo pesos, sin estado del optimizador ni estado completo de entrenamiento, lo que impide reanudar el entrenamiento exactamente donde se dejó.
- **Dependencia del runtime**: no funciona con `transformers`, vLLM ni llama.cpp; requiere JAX, Orbax y el runtime `bimanual-vla` con el contrato de acción y las estadísticas de normalización originales. Cambiar la normalización o el orden de las dimensiones invalida los pesos.
- **Sin cuantizaciones publicadas**: no hay versiones GGUF, INT8 ni INT4, por lo que las opciones de reducir requisitos de memoria quedan sin validar.
- **Reproducibilidad del demo**: el vídeo incluido es una única ejecución a velocidad original; no constituye evidencia estadística.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/SUNNYsyy2005/pi05_pick_place_clean_joint_20261025_20k
- Dataset de entrenamiento: https://huggingface.co/datasets/SUNNYsyy2005/pick_place_clean_joint_20261025
- Repositorio `bimanual-vla`: https://github.com/SUNNYsyy2005/bimanual-vla
- Guía de instalación y servidor de política OpenPI: https://github.com/SUNNYsyy2005/bimanual-vla/blob/master/docs/INSTALLATION.md#9-openpi-policy-and-training-server
- Guía de despliegue del cliente RTC: https://github.com/SUNNYsyy2005/bimanual-vla/blob/master/docs/deployment/RTC_CLIENT_GUIDE.md
- Demostración en robot real (incluida en el repo): `media/pick-place-real-robot-20261027.mp4`
- OpenPI de Physical Intelligence (código y checkpoints base): https://github.com/Physical-Intelligence/openpi
- Artículo π0.5 (PDF): https://www.pi.website/download/pi05.pdf
- Artículo π0.5 (HTML en arXiv): https://arxiv.org/html/2504.16054
- Blog de π0.5: https://www.pi.website/blog/pi05
- Tutorial de OpenPI en Jetson Thor: https://www.jetson-ai-lab.com/tutorials/openpi_on_thor/
