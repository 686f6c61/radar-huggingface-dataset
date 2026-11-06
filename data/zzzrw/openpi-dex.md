# zzzrw/openpi-dex

## Resumen

`zzzrw/openpi-dex` es un repositorio de Hugging Face que contiene checkpoints afinados (fine-tuned) del modelo **π0.5 de Physical Intelligence** (referenciado en la model card como "Gento-Wuji π0.5") en su implementación JAX dentro del framework OpenPI. No es un modelo de lenguaje en el sentido convencional: se trata de un modelo de política visuomotora (vision-language-action, VLA) orientado al control de robots manipuladores, concretamente para el plataforma "Gento-Wuji" con brazos, torso, cabeza y manos articuladas.

El autor (`zzzrw`) publica tres checkpoints entrenados sobre datos de teleoperación propios: el más reciente usa un vector de estado de 62 dimensiones (qpos absolutas de brazo, torso, cabeza y mano) y fue entrenado excluyendo los episodios 0-4 del dataset; los dos anteriores usaban un vector de 58 dimensiones basado en posiciones absolutas del end-effector (EEF) de muñeca más qpos de mano. El checkpoint más reciente corresponde al paso 29999 de entrenamiento y se distribuye en formato Orbax (propio del ecosistema JAX/Flax), no en safetensors o GGUF.

La relevancia de este repositorio es acotada: no es un modelo base de propósito general sino un artefacto de investigación reproducible para quienes trabajan con OpenPI y quieran evaluar o reutilizar políticas π0.5 afinadas en un robot concreto. El tamaño del repositorio (1157.4 GB) refleja que contiene varios checkpoints completos con estados de optimizador y assets auxiliares, lo que lo hace poco práctico para descarga casual y más adecuado para entornos de entrenamiento con almacenamiento masivo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | π0.5 (modelo vision-language-action de Physical Intelligence, implementación JAX en OpenPI); detalles internos de capas no disponibles en la información proporcionada |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se confirma que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (los pesos se publican en precisión de entrenamiento, formato Orbax) |
| Idiomas soportados | no disponible (el modelo recibe instrucciones en lenguaje natural, pero la model card no especifica idiomas) |
| Licencia | no disponible |
| Formato de pesos | Orbax checkpoint (JAX/Flax): `params/` con pesos de inferencia y `assets/` con estadísticas de normalización por cuantiles |

## Arquitectura y entrenamiento

El modelo subyacente es π0.5, una política visuomotora de Physical Intelligence que combina un backbone de visión-lenguaje con un cabezal de acción (action expert) para generar secuencias de acciones continuas a partir de observaciones visuales e instrucciones en lenguaje natural. En este repositorio se distribuye la variante JAX de OpenPI, con checkpoints en formato Orbax que incluyen tanto los pesos de inferencia (`params/`) como las estadísticas de normalización (`assets/`), necesarias para desnormalizar las acciones predichas.

El entrenamiento reportado es un fine-tuning sobre datos propios del autor, con tres configuraciones documentadas. La más reciente (`gento_wuji_qpos_torso_head_skip0to4`) usa un espacio de estado absoluto de 62 dimensiones que cubre brazo, torso, cabeza y mano, y se entrenó deliberadamente sin los episodios 0-4 (probablemente como holdout para evaluación). Las anteriores (`gento_wuji_absolute_eef_skip0to4` y `gento_wuji_absolute_eef`) usaban un espacio de 58 dimensiones con posiciones absolutas del EEF de muñeca más qpos de mano, con y sin exclusión de episodios. No se documenta el número de tokens, la composición del dataset, ni si hubo etapas de RLHF/DPO; la model card se limita a describir los artefactos y su estructura de directorios.

## Capacidades

- Control visuomotor de robot manipulador: genera acciones continuas de brazo, torso, cabeza y mano a partir de observaciones e instrucciones.
- Seguimiento de instrucciones en lenguaje natural (propiedad heredada de π0.5; idiomas no especificados).
- Representación de estado configurable: qpos absolutas de 62 dimensiones (brazo, torso, cabeza, mano) o EEF absoluto de 58 dimensiones más qpos de mano.
- Inferencia en JAX mediante OpenPI, con pesos y estadísticas de normalización listos para despliegue.
- No se documenta soporte de tool calling, function calling, razonamiento multi-paso explícito ni modalidades de audio; estas capacidades no están confirmadas en la información disponible.

## Casos de uso

- Reproducción de experimentos OpenPI: cargar el checkpoint `29999/params/` junto con `29999/assets/` para replicar el comportamiento del autor en la plataforma Gento-Wuji y validar resultados publicados.
- Evaluación de generalización con holdout: el checkpoint `skip0to4` permite medir el rendimiento en episodios 0-4 no vistos durante el entrenamiento, útil para estudiar sobreajuste en políticas VLA.
- Comparación de espacios de acción: enfrentar la política de 62 dimensiones (qpos completo) contra la de 58 dimensiones (EEF) para analizar qué representación produce trayectorias más estables en tareas de manipulación.
- Fine-tuning posterior: usar los pesos como inicialización para nuevos datasets del mismo robot, reduciendo el coste frente a partir de π0.5 base.
- Integración en pipelines de investigación con JAX: el formato Orbax encaja directamente en flujos de entrenamiento e inferencia basados en Flax, sin conversión a otros formatos.
- Estudio de normalización por cuantiles: los `assets/` permiten analizar cómo las estadísticas del dataset afectan la distribución de acciones generadas.
- Referencia para despliegue en robot real: servir el checkpoint con OpenPI para controlar el manipulador en tareas de alcance y agarre con torso y cabeza móviles.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; depende del tamaño de π0.5, que no se especifica en la model card.
- GPU recomendadas: no disponible en la información proporcionada; por el ecosistema JAX/Orbax se espera compatibilidad con GPUs NVIDIA (A100, H100) y TPUs, pero no está confirmado.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: OpenPI con JAX/Flax; no se documenta soporte para vLLM, llama.cpp, Ollama o TGI, que están orientados a modelos de lenguaje y no a checkpoints Orbax de políticas VLA.
- Latencia y throughput: no disponibles.
- Almacenamiento: el repositorio ocupa 1157.4 GB, por lo que se requiere espacio en disco muy superior al habitual para modelos de lenguaje de tamaño comparable; conviene descargar solo el subdirectorio del checkpoint deseado.

## Comparativa con modelos similares

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zzzrw/openpi-dex | Fine-tune de π0.5 (JAX, Orbax) | no disponible | no disponible | no disponible | Hugging Face, 0 descargas |
| π0.5 base (Physical Intelligence) | Política VLA | no disponible en esta ficha | no disponible | no disponible | Repositorio oficial de Physical Intelligence/OpenPI |
| π0 (Physical Intelligence) | Política VLA | no disponible en esta ficha | no disponible | no disponible | OpenPI |

No se dispone de datos de rendimiento comparables entre estas variantes en la información proporcionada; la comparación se limita a la naturaleza del artefacto (fine-tune comunitario frente a modelos base oficiales).

## Limitaciones y advertencias

- Licencia no declarada: no hay información sobre permisos de uso comercial, redistribución o modificación; tratar como uso incierto hasta confirmar con el autor.
- Especialización extrema: la política está afinada para la plataforma Gento-Wuji con espacios de estado concretos (62D qpos o 58D EEF); no es reutilizable directamente en otros robots sin reentrenamiento.
- Exclusión de episodios 0-4: los checkpoints `skip0to4` no han visto esos episodios, lo que puede degradar el rendimiento si el despliegue ocurre en condiciones similares a las de esos datos.
- Riesgo de alucinación y comportamiento inseguro: como política visuomotora, puede generar acciones fuera de rango o inestables ante observaciones fuera de distribución; requiere límites de seguridad a nivel de controlador.
- Sesgos: no documentados; el dataset es propietario del autor y no se describe su composición demográfica, de iluminación ni de objetos.
- Idiomas: no se especifica qué lenguas entiende el modelo para las instrucciones.
- Tamaño del repositorio (1157.4 GB): descarga y almacenamiento costosos; conviene seleccionar únicamente el checkpoint necesario.
- Sin métricas publicadas: no hay evidencia cuantitativa de éxito en tareas, lo que dificulta evaluar su calidad frente a otros checkpoints.
- Fecha de creación futura (2026-09-04) y actualización (2026-11-02) según los metadatos: verificar la vigencia de los artefactos antes de usarlos en producción.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/zzzrw/openpi-dex
- OpenPI (framework de Physical Intelligence): no disponible en la información proporcionada
- Modelo π0.5 de Physical Intelligence: no disponible en la información proporcionada
- Paper de π0.5: no disponible en la información proporcionada
