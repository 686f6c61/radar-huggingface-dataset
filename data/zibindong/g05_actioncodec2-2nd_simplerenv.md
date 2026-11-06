# ZibinDong/G05_ActionCodec2-2nd_SimplerEnv

## Resumen

G05_ActionCodec2-2nd_SimplerEnv es una política vision-language-action (VLA) publicada por ZibinDong, resultado del ajuste fino del modelo base OpenGalaxea/G05 sobre el conjunto de datos Bridge. Su objetivo concreto es la evaluación en SimplerEnv con el robot WidowX, un entorno simulado habitual para comparar políticas de manipulación robótica. El modelo combina un backbone VLA con un tokenizador de acciones específico, ActionCodec2, que discretiza los comandos motores en tokens y permite tratarlos con el mismo formalismo que el texto.

El checkpoint tiene 2.221.181.760 parámetros (aproximadamente 2,22 mil millones) y se distribuye en safetensors con un tamaño de repositorio de 8,9 GB. Incorpora en el propio repositorio el tokenizador de acciones, los assets ajustados y el tokenizador de texto, de modo que la inferencia funciona sin conexión y sin necesidad de descargar el checkpoint base G0.5 ni otro repositorio de tokenizadores. La variante de tokenizador utilizada es `paper-o2-5mm-4k-2bin-1p2ms`, la edición Paper de 5 mm descrita en el artículo de ActionCodec2, con un presupuesto de 4.096 tokens por perfil.

La relevancia de esta ficha es doble: por un lado, documenta un ejemplo práctico de integración de un tokenizador de acciones en un pipeline VLA; por otro, advierte de las restricciones de la licencia G0.5 Community, que prohíbe el despliegue comercial. El modelo está pensado para investigación y evaluación en simulación, no para control de robots en producción.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) basada en OpenGalaxea/G05, con tokenizador de acciones ActionCodec2 |
| Parámetros totales | 2.221.181.760 |
| Parámetros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible (el tokenizador de texto incluido es Qwen3.5, pero no se declaran idiomas) |
| Licencia | g05-community (G0.5 Community License; no comercial, sin derechos de despliegue comercial) |
| Formato de pesos | safetensors |

Otros parámetros operativos relevantes:

| Parámetro | Valor |
|---|---|
| Entrada de imagen | 256 × 256, RGB uint8, una cámara (`observation.images.image_0`) |
| Forma de acción devuelta | (10, 7) |
| Frecuencia de control | 5 Hz |
| Espacio de acción | `delta_eef` |
| Representación de rotación | `euler_xyz` |
| Acciones ejecutadas antes de replanificar | 5 |
| Estado observado requerido | no |
| Acción previa requerida | sí, vector de longitud 7 en cada predicción |
| Tokenizador de acciones | `paper-o2-5mm-4k-2bin-1p2ms` (edición Paper, 5 mm, 4.096 tokens por perfil) |
| Frecuencia del tokenizador | 15 Hz (el adaptador convierte desde los 5 Hz de control) |
| Entorno de referencia | WidowX en SimplerEnv |
| Dataset de ajuste | Bridge |

## Arquitectura y entrenamiento

La arquitectura es una política VLA derivada de OpenGalaxea/G05 mediante ajuste fino. El backbone procesa imágenes RGB y una instrucción de tarea en lenguaje natural, y genera acciones motoras a través de un decodificador de acciones. La innovación principal es el uso de ActionCodec2 como tokenizador de acciones: los comandos continuos se discretizan en tokens con una frecuencia de 15 Hz y un presupuesto de 4.096 tokens por perfil, de forma que el modelo puede tratarlos con el mismo mecanismo de secuencia que el texto. El adaptador incluido convierte las acciones devueltas a 5 Hz al límite de 15 Hz del tokenizador.

El ajuste fino se realizó sobre el conjunto de datos Bridge, orientado a manipulación con el robot WidowX, y el checkpoint se evalúa en SimplerEnv. La model card no proporciona el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron etapas de RLHF o DPO; tampoco detalla innovaciones adicionales como decodificación especulativa o atención lineal más allá de la mención a Flash Linear Attention y Liger entre las dependencias opcionales del paquete `cuda`.

Un detalle técnico importante es que los IDs de token están ligados a los pesos entrenados: el vocabulario incluido en el checkpoint no debe sustituirse por el de la edición Extended de ActionCodec2, que fue reentrenada tras un proceso adicional de limpieza y filtrado de los datos de preentrenamiento y ofrece más precisión y opciones de vocabulario. Mezclar vocabularios invalidaría la política.

## Capacidades

- Generación de acciones motoras de manipulación a partir de imágenes RGB y una instrucción de tarea en lenguaje natural.
- Control de robot tipo WidowX en el simulador SimplerEnv, con espacio de acción `delta_eef` y rotación en `euler_xyz`.
- Predicción en bloque: devuelve 10 acciones de 7 dimensiones por llamada y ejecuta 5 antes de replanificar.
- Uso de acción previa como contexto: acepta el último vector de acción ejecutado (longitud 7) para mantener la coherencia temporal.
- Inferencia offline: el repositorio incluye tokenizador de acciones, assets ajustados y tokenizador de texto, sin dependencia del checkpoint base G0.5.
- Integración con el paquete `actioncodec2` (extra `cuda` con Liger y Flash Linear Attention) y con clientes de evaluación incluidos en el archivo fuente.
- No se documentan capacidades de tool calling, agentes multi-paso, visión general fuera del bucle de control ni audio.

## Casos de uso

- Evaluación comparativa en SimplerEnv: el modelo está entrenado explícitamente para WidowX en este simulador, por lo que sirve como referencia para comparar políticas VLA con tokenizadores de acciones frente a políticas con salidas continuas.
- Investigación sobre tokenización de acciones: al fijar el vocabulario `paper-o2-5mm-4k-2bin-1p2ms`, permite estudiar el efecto del presupuesto de tokens y de la frecuencia de discretización (15 Hz) en la calidad de la manipulación.
- Reproducción de experimentos con el dataset Bridge: el ajuste fino sobre Bridge facilita reproducir resultados publicados y analizar la transferencia de Bridge a la evaluación en SimplerEnv.
- Desarrollo de adaptadores de acción: el contrato de inferencia (5 Hz de control, conversión al límite de 15 Hz, acción previa obligatoria) sirve como base para construir adaptadores hacia otros robots o entornos simulados.
- Docencia y prototipado en robótica: al ejecutarse en GPU con CUDA y requerir solo imágenes de 256 × 256 y una instrucción de texto, es viable en laboratorios con hardware de gama media.
- Pruebas de integración de pipelines VLA: el paquete incluye recetas de entrenamiento, clientes de evaluación y documentación, lo que permite validar un pipeline completo de carga, predicción y conversión de acciones antes de pasar a hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye tasas de éxito en SimplerEnv ni comparaciones numéricas con otras políticas.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 2,22 mil millones de parámetros en safetensors y un repositorio de 8,9 GB, la carga en precisión nativa requiere del orden de 9 GB solo para pesos, más memoria para activaciones y el tokenizador; en FP16 o BF16 se reduce aproximadamente a la mitad de ese peso, aunque no se documentan cuantizaciones oficiales.
- GPU recomendadas: no se especifican modelos concretos. La model card solo exige una GPU compatible con CUDA.
- GPU de consumo: no se confirma compatibilidad con tarjetas consumer; la ausencia de variantes cuantizadas documentadas hace que el margen en GPUs de 8-12 GB sea incierto.
- Opciones de despliegue: paquete `actioncodec2` con extra `cuda` (instalación desde el archivo fuente v0.1.0), PyTorch 2.7.1, Transformers 5.14.1, Python 3.12 o superior y compilador C++17. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles. Solo se conoce la frecuencia de control de 5 Hz y la ejecución de 5 acciones antes de replanificar.

## Comparativa con modelos similares

No se dispone de datos de rendimiento de modelos comparables en la información proporcionada. La siguiente tabla recoge únicamente lo que puede afirmarse con los datos disponibles:

| Modelo | Parámetros | Contexto | Entorno de evaluación | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| G05_ActionCodec2-2nd_SimplerEnv | 2.221.181.760 | no disponible | SimplerEnv (WidowX) | g05-community (no comercial) | Hugging Face |
| OpenGalaxea/G05 (base) | no disponible | no disponible | no disponible | no disponible | Hugging Face |
| Otras políticas VLA para SimplerEnv | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- Licencia no comercial: la G0.5 Community License prohíbe el despliegue comercial. Cualquier uso en producto o servicio requiere autorización expresa del titular.
- Ámbito restringido: la política está ajustada para WidowX en SimplerEnv con el dataset Bridge; no hay evidencia de generalización a otros robots, tareas o entornos reales.
- Dependencia del vocabulario: los IDs de token están ligados a los pesos entrenados; sustituir el vocabulario por el de la edición Extended de ActionCodec2 rompe la política.
- Contrato de inferencia estricto: exige pasar la acción previa (longitud 7) en cada predicción y respetar las unidades y la convención de pinza; un vector de ceros solo es válido si el movimiento precedente es realmente nulo.
- Riesgo de alucinación y errores de planificación: no se documentan métricas de fiabilidad ni análisis de fallos; en robótica, un error de acción puede tener consecuencias físicas.
- Idiomas: no se declaran idiomas soportados; el tokenizador de texto es Qwen3.5, pero no se especifica el comportamiento multilingüe de las instrucciones de tarea.
- Sesgos: no se documentan sesgos conocidos ni la composición del dataset Bridge, lo que impide evaluar sesgos de percepción o de instrucciones.
- Sin benchmarks publicados: no hay tasas de éxito ni comparaciones numéricas que permitan estimar el rendimiento esperado.
- Madurez: 39 descargas y 0 likes en el momento de la consulta; es un artefacto de investigación, no un modelo validado para producción.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_SimplerEnv
- Modelo base OpenGalaxea/G05: https://huggingface.co/OpenGalaxea/G05
- Repositorio del paquete ActionCodec2: https://huggingface.co/ZibinDong/ActionCodec2
- Archivo fuente del paquete (v0.1.0): https://hf-mirror.com/ZibinDong/ActionCodec2/resolve/v0.1.0/actioncodec2-0.1.0.tar.gz
- Configuración de la política: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_SimplerEnv/blob/main/policy_config.json
- Licencia G0.5 Community: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_SimplerEnv/blob/main/LICENSE
- Aviso legal: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_SimplerEnv/blob/main/NOTICE
- Licencia del tokenizador de texto Qwen3.5: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_SimplerEnv/blob/main/LICENSE_QWEN3_5.txt
- Licencia de los assets del tokenizador: https://huggingface.co/ZibinDong/G05_ActionCodec2-2nd_SimplerEnv/blob/main/assets/tokenizer_artifact/LICENSE
