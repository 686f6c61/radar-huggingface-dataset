# yyshi0619/pi05-base-pytorch

## Resumen

π0.5 base es un modelo de visión-lenguaje-acción (VLA) desarrollado por Physical Intelligence, orientado al control de robots manipuladores a partir de instrucciones en lenguaje natural e imágenes de entrada. Este repositorio concreto, publicado por el usuario yyshi0619, no contiene un modelo nuevo: es una conversión de formato del checkpoint original `pi05_base` desde JAX a un fichero `model.safetensors` en PyTorch, compatible con el código `PI0Pytorch` de OpenPI. Los pesos no se han reentrenado ni ajustado.

La arquitectura combina un tronco PaliGemma (Gemma 2B más el codificador visual SigLIP) con un "action expert" basado en Gemma-300M, y utiliza flow matching para generar secuencias de acciones. El recuento real de parámetros en safetensors es de 3.616.757.520 (unos 3,6 mil millones), con un horizonte de acción de 50 pasos y una dimensión de acción de 32, según la configuración del conversor.

Su relevancia es práctica para el ecosistema de robótica open source: hasta ahora la referencia pública de π0.5 estaba en JAX, y esta conversión permite cargar los pesos en PyTorch mediante OpenPI. Se trata, por tanto, de un artefacto de interoperabilidad más que de un modelo con mejoras de rendimiento, y su uso exige aceptar los términos de licencia de Gemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) con tronco PaliGemma (Gemma 2B + SigLIP) y action expert Gemma-300M; generación de acciones por flow matching |
| Parametros totales | 3.616.757.520 (aprox. 3,6 B) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repositorio solo publica pesos en float32; no se ofrecen variantes GGUF, AWQ, GPTQ ni int8) |
| Idiomas soportados | no disponible (el repositorio no documenta idiomas; el componente de lenguaje deriva de Gemma 2B) |
| Licencia | Gemma Terms of Use (con Gemma Prohibited Use Policy); el código de OpenPI es Apache 2.0 |
| Formato de pesos | safetensors (float32, aprox. 14,5 GB) |

## Arquitectura y entrenamiento

El modelo sigue el diseño VLA de π0.5: un tronco de visión-lenguaje PaliGemma, formado por Gemma 2B más el codificador de imagen SigLIP, que procesa observaciones visuales e instrucciones textuales, y un "action expert" independiente de 300 millones de parámetros que genera las acciones motoras. La configuración empleada en la conversión activa la bandera `pi05=True`, con `action_horizon=50` y `action_dim=32`, lo que significa que el modelo produce bloques de 50 pasos de acción de dimensión 32 por inferencia.

La generación de acciones se formula mediante flow matching, un esquema generativo continuo que modela la distribución de trayectorias de acción en lugar de predecir un único vector determinista. Esta conversión no aporta información sobre el dataset de entrenamiento, el número de tokens vistos, la composición de datos ni si hubo etapas de RLHF o DPO: esa documentación corresponde al modelo original de Physical Intelligence y no se reproduce en este repositorio. La única modificación introducida es el cambio de formato (JAX a PyTorch `safetensors`, precisión float32), con un SHA256 publicado para verificar la integridad del fichero.

## Capacidades

- Percepción visual y comprensión de instrucciones en lenguaje natural mediante el tronco PaliGemma.
- Generación de secuencias de acción robótica de horizonte 50 y dimensión 32 para control de manipuladores.
- Ejecución de tareas de manipulación guiadas por lenguaje (por ejemplo, "coge el objeto rojo y ponlo en la caja").
- Modelado generativo de trayectorias mediante flow matching, adecuado para movimientos continuos.
- Carga en PyTorch a través de OpenPI con `PI0Pytorch` y `Pi0Config`, con carga estricta (`strict=True`) del state dict.
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso en texto: no disponible (el modelo no es un asistente conversacional; su salida es acción motora).
- Capacidades multilingües: no disponible.
- Capacidad especial: control robótico de propósito general con un único conjunto de pesos, sin cabezas específicas por tarea documentadas en este repositorio.

## Casos de uso

- Manipulación robótica de propósito general en laboratorio: cargar los pesos con OpenPI y ejecutar políticas de pick-and-place guiadas por instrucciones en lenguaje natural, aprovechando el horizonte de acción de 50 pasos para reducir la frecuencia de replanificación.
- Investigación en modelos visión-lenguaje-acción: usar el checkpoint como línea base reproducible en PyTorch para comparar variantes de flow matching o de arquitectura sin depender de una cadena de herramientas JAX.
- Ajuste fino para tareas industriales concretas: partir del modelo base y especializarlo en una célula de fabricación (ensamblaje, inserción de piezas) con datos de demostración propios, dado que el repositorio entrega pesos completos y no un adaptador ligero.
- Automatización en logística: controlar brazos en estaciones de clasificación o paletizado donde la instrucción de tarea cambia con frecuencia y conviene expresarla en lenguaje natural en lugar de reprogramar la política.
- Evaluación en simulación compatible con OpenPI: desplegar la política en entornos simulados para medir tasas de éxito antes de transferir a hardware real, con el horizonte y la dimensionalidad de acción ya fijados en la configuración.
- Investigación sobre conversión de formatos y reproducibilidad: usar este repositorio como referencia para validar herramientas de conversión JAX a PyTorch en modelos multimodales grandes, comparando el SHA256 y la equivalencia numérica con el checkpoint original.
- Desarrollo de interfaces humano-robot: integrar el modelo en un bucle en el que una persona describe la tarea en lenguaje natural y el sistema traduce esa descripción en comandos motores de bajo nivel.
- Docencia y prototipado académico: disponer de pesos abiertos en un formato estándar permite construir prácticas sobre VLA sin acceso a infraestructura propietaria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El repositorio es una conversión de formato y no incluye evaluaciones propias (LIBERO, SIMPLER, tareas reales ni métricas de tasa de éxito). Tampoco la información proporcionada reproduce las cifras del modelo original de Physical Intelligence.

## Requisitos de hardware

- Los pesos publicados ocupan aproximadamente 14,5 GB en float32, por lo que la inferencia en esa precisión requiere en torno a 16-20 GB de VRAM contando activaciones y buffers de inferencia.
- Una conversión manual a bfloat16 reduciría el peso a unos 7,3 GB, pero no se distribuye ningún checkpoint en esa precisión; cualquier cambio de dtype debe validarse porque puede alterar el comportamiento de la política.
- GPU de centro de datos: A100 (40 GB o 80 GB) y H100 son opciones holgadas para float32 y permiten lotes mayores o despliegue junto a otros procesos. Una L40S de 48 GB también es suficiente.
- GPU de consumo: cabe en tarjetas con 24 GB, como la RTX 4090 o la RTX 3090, siempre en float32 y sin mucho margen adicional. Tarjetas de 16 GB o menos no son viables tal cual con los pesos publicados.
- El modelo no es un LLM de texto, por lo que vLLM, llama.cpp, Ollama y TGI no son opciones de despliegue: requiere el código de OpenPI y sus ficheros parcheados de `transformers`.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

La siguiente comparativa se basa en conocimiento general sobre la familia de modelos y debe verificarse contra las fuentes oficiales; los datos marcados como no disponibles no se han podido confirmar en la información proporcionada.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| π0.5 base (esta conversion) | 3,6 B (dato de safetensors) | no disponible | Gemma Terms of Use | Pesos en safetensors float32, requiere OpenPI | Conversion no oficial, sin reentrenamiento |
| π0 (Physical Intelligence) | aprox. 3,3 B (PaliGemma mas action expert) | no disponible | no disponible en la informacion | Pesos publicos en el repositorio openpi (formato original JAX) | Modelo predecesor de la misma familia |
| OpenVLA | aprox. 7 B (Llama-2-7B con encoders visuales) | no disponible en la informacion | no disponible en la informacion | Pesos publicos | Alternativa VLA abierta de mayor tamano |

## Limitaciones y advertencias

- No es un modelo oficial: se trata de una conversión de formato realizada por un tercero. Cualquier incidencia de calidad o de equivalencia numérica debe contrastarse con el checkpoint original en `gs://openpi-assets/checkpoints/pi05_base/params`.
- El repositorio registra 0 descargas y 0 "likes" en el momento de la consulta, por lo que no hay evidencia comunitaria de que la conversión haya sido validada de forma independiente más allá del SHA256 publicado.
- Licencia Gemma: el uso comercial y la redistribución están sujetos a los Gemma Terms of Use y a la Gemma Prohibited Use Policy. Es imprescindible revisarlos antes de cualquier despliegue en producción.
- Al derivar de PaliGemma/Gemma, hereda los sesgos y riesgos del tronco de lenguaje y visión subyacente; el repositorio no documenta evaluaciones de sesgo.
- Riesgo de alucinación: no disponible como métrica, pero un VLA puede generar trayectorias plausibles pero incorrectas ante observaciones fuera de la distribución de entrenamiento.
- Limitación de idioma: el repositorio no declara idiomas soportados; el rendimiento multilingüe en las instrucciones no está garantizado ni documentado.
- Longitud de contexto no documentada: no se puede planificar el uso con historiales largos o múltiples observaciones sin consultar la configuración del modelo original.
- Requiere dependencias específicas: el código de OpenPI con ficheros parcheados de `transformers` no es una instalación estándar, lo que añade fricción de despliegue y riesgo de incompatibilidades.
- Al ser pesos en float32 de 14,5 GB, el coste de almacenamiento y de carga en memoria es alto para iteración rápida.
- No hay datos publicados de latencia, throughput ni tasas de éxito, por lo que no se puede estimar el rendimiento en producción a partir de esta ficha.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/yyshi0619/pi05-base-pytorch
- Blog de Physical Intelligence sobre π0.5: https://www.physicalintelligence.company/blog/pi05
- Repositorio OpenPI (Physical Intelligence): https://github.com/Physical-Intelligence/openpi
- Términos de uso de Gemma: https://ai.google.dev/gemma/terms
- Política de uso prohibido de Gemma: https://ai.google.dev/gemma/prohibited_use_policy
