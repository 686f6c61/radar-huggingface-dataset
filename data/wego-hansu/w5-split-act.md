# wego-hansu/w5-split-act

## Resumen

El modelo `wego-hansu/w5-split-act` es una política de robótica entrenada con el método ACT (Action Chunking with Transformers), un algoritmo de aprendizaje por imitación que predice fragmentos cortos de acciones en lugar de pasos individuales. Lo publica el usuario wego-hansu en Hugging Face, está empaquetado con la librería LeRobot y se distribuye bajo licencia Apache-2.0. No es un modelo de lenguaje: es un controlador visomotor que consume imágenes de cámara más el estado del robot y produce comandos de actuador.

El checkpoint contiene 51.670.663 parámetros en formato safetensors y ocupa 0,2 GB, un tamaño típico de las políticas ACT de LeRobot, que combinan un backbone convolucional (tipo ResNet-18) con un transformer encoder-decoder y un componente CVAE para modelar la multimodalidad de las demostraciones humanas. Se entrenó sobre el dataset `wego-hansu/sim_data2`, lo que indica un origen en simulación.

Su relevancia es práctica y de nicho: sirve como referencia reproducible para experimentos de manipulación, para comparar variantes de ACT y para validar tuberías de entrenamiento y evaluación con LeRobot. No hay información publicada sobre datos de entrenamiento, número de demostraciones, tareas objetivo ni métricas de éxito de este checkpoint concreto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ACT (Action Chunking with Transformers): backbone convolucional + transformer encoder-decoder con CVAE, según el paper arXiv:2304.13705 |
| Parametros totales | 51.670.663 (≈51,67 M) |
| Parametros activos | no aplicable (no es un modelo MoE) |
| Longitud de contexto | no aplicable en el sentido de LLM; consume una ventana de observación de longitud fija definida por la configuración de entrenamiento (no publicada) |
| Tipos de cuantizacion | no disponible; el repositorio contiene safetensors, presumiblemente en fp32 |
| Idiomas soportados | no aplicable: no procesa lenguaje natural y no acepta instrucciones textuales |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (librería `lerobot`; tamaño del repositorio 0,2 GB) |

## Arquitectura y entrenamiento

ACT es un método de aprendizaje por imitación presentado en el paper "Learning Fine-Grained Bimanual Manipulation with Low-Cost Hardware" (arXiv:2304.13705). La política combina un backbone de visión (ResNet) que codifica las imágenes de las cámaras, una proyección del estado propioceptivo del robot y un transformer encoder-decoder que genera un chunk de acciones futuras de longitud fija. Incorpora además una rama CVAE que modela la variabilidad de las demostraciones teleoperadas, lo que permite representar estilos de ejecución multimodales y evita el promedio destructivo de comportamientos distintos. La decodificación por chunks reduce el error de compounding que aparece al predecir acción a acción.

No se dispone de información sobre el número de tokens o transiciones de entrenamiento, la composición del dataset `wego-hansu/sim_data2`, el número de episodios, la resolución de las cámaras, la frecuencia de control ni si se aplicaron fases de ajuste posteriores (RLHF, DPO u otras, poco habituales en este tipo de políticas). La model card únicamente documenta que la política se entrenó y subió al Hub con LeRobot y remite a la guía oficial de entrenamiento de la librería.

## Capacidades

- Generación de acciones de manipulación robótica a partir de observaciones visuales y del estado del robot, en forma de chunks de acciones.
- Aprendizaje por imitación a partir de demostraciones teleoperadas; no requiere recompensas ni entorno de RL.
- Control visomotor de un brazo robótico (la model card muestra un ejemplo con `so100_follower`); el nombre del checkpoint y el dataset sugieren una variante con espacio de acción dividido (`split-act`), aunque la configuración exacta no está publicada.
- Ejecución de tareas entrenadas en simulación, presumiblemente con intención de transferencia a hardware real.
- Integración directa con el ecosistema LeRobot: entrenamiento con `lerobot-train` y evaluación con `lerobot-record`.
- No soporta tool calling, function calling, agentes, razonamiento multi-step ni conversación: no es un modelo de lenguaje.
- No soporta múltiples idiomas ni entrada de texto; no hay capacidades de visión semántica (describir imágenes) más allá de la codificación visual para el control.
- No dispone de modo "thinking" ni de salidas de audio.

## Casos de uso

- Manipulación pick-and-place en simulación: la política se puede desplegar en el entorno del dataset `sim_data2` para reproducir tareas de recogida y colocación, aprovechando la predicción por chunks para movimientos suaves y consistentes.
- Investigación en aprendizaje por imitación: sirve como punto de partida reproducible para comparar variantes de ACT (distinto número de capas, tamaño de chunk o backbone) manteniendo el resto del pipeline LeRobot constante.
- Evaluación comparativa de políticas: al ser un checkpoint ligero de 51,67 M de parámetros, se puede ejecutar en paralelo con otras políticas en un mismo banco de pruebas sin agotar VRAM.
- Transferencia sim-a-real: entrenado sobre datos de simulación, es un candidato para estudiar la brecha de dominio al desplegarlo sobre un robot real (por ejemplo, un SO-100 seguidor) y medir tasas de éxito.
- Generación de datos sintéticos de demostración: la política puede operar en el simulador para generar trayectorias adicionales que alimenten un bucle de aumento de datos.
- Docencia y prototipado de robótica: su tamaño reducido permite entrenar y evaluar en una estación de trabajo con una única GPU de consumo, útil para cursos y talleres de robótica de aprendizaje.
- Validación de infraestructura de despliegue: sirve para verificar pipelines de registro de episodios (`lerobot-record`), conversión de checkpoints y monitorización de latencia antes de invertir en modelos mayores tipo VLA.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card del checkpoint no incluye tasas de éxito, métricas de error de acción ni evaluaciones en tareas concretas. El paper de referencia (arXiv:2304.13705) describe evaluaciones del método ACT en tareas bimanuales, pero no se dispone en la información proporcionada de las cifras ni de su aplicabilidad a este checkpoint concreto, entrenado sobre un dataset distinto y no documentado.

## Requisitos de hardware

- VRAM estimada para inferencia: en fp32, los 51,67 M de parámetros ocupan aproximadamente 207 MB; en fp16, unos 103 MB. Con activaciones, buffers de imagen y el estado del entorno, la inferencia cabe holgadamente en menos de 1-2 GB de VRAM.
- GPU recomendadas: cualquier GPU NVIDIA con soporte CUDA y al menos 4 GB de VRAM (GTX 1650, RTX 3050, RTX 3060, RTX 4090). El entrenamiento con LeRobot requiere más memoria por el estado del optimizador y los lotes, pero sigue siendo asequible en GPUs de consumo; A100 y H100 son innecesarias salvo para entrenamientos masivos en paralelo.
- Cabe en GPU de consumo: sí, sin problemas, incluso en modelos de gama baja.
- Opciones de despliegue: LeRobot (`lerobot-train` para entrenamiento, `lerobot-record` con `--policy.path` para inferencia y evaluación) sobre PyTorch. No aplican los servidores orientados a LLM (vLLM, TGI, llama.cpp, Ollama) porque no es un modelo de lenguaje.
- Latencia y throughput estimados: no disponible. La arquitectura ACT está pensada para control en tiempo real, pero no se han publicado cifras de frecuencia de inferencia para este checkpoint.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto / observacion | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wego-hansu/w5-split-act (este) | 51,67 M | Ventana de observacion definida por la config de entrenamiento (no publicada) | No publicado para este checkpoint | apache-2.0 | Hugging Face, libreria `lerobot` |
| ACT (referencia del paper, arXiv:2304.13705) | no disponible | no disponible | Tasa de exito publicada en el paper para tareas bimanuales (cifras no incluidas en la informacion disponible) | no disponible | Paper y repositorio originales |
| Diffusion Policy | no disponible | no disponible | No disponible | no disponible | Implementacion disponible en LeRobot y en el repositorio original |
| SmolVLA | aproximadamente 450 M (segun documentacion publica de Hugging Face, no verificada en la informacion proporcionada) | Modelo vision-language-action, acepta instrucciones en lenguaje natural | No disponible | apache-2.0 (segun informacion publica, no verificada) | Hugging Face, integrado en LeRobot |

La diferencia clave es de enfoque: ACT es una política puramente visomotora de 51,67 M de parámetros que no acepta lenguaje, mientras que las alternativas tipo VLA (SmolVLA) condicionan la acción sobre instrucciones textuales a cambio de uno o dos órdenes de magnitud más de parámetros. Diffusion Policy, por su parte, modela la distribución de acciones mediante difusión, con mayor coste de inferencia por el muestreo iterativo. No hay datos suficientes para comparar rendimiento entre estas opciones en las tareas de este checkpoint.

## Limitaciones y advertencias

- Ámbito restringido: la política solo sabe ejecutar las tareas representadas en `wego-hansu/sim_data2`. Fuera de esa distribución de estados, objetos y puntos de vista, el comportamiento no está garantizado.
- Sin generalización instruccional: no acepta texto ni objetivos en lenguaje natural; no se puede reutilizar para tareas nuevas sin reentrenar.
- Datos de entrenamiento no documentados: se desconoce el número de episodios, las cámaras usadas, la frecuencia de control y la configuración del espacio de acción, lo que dificulta reproducir el entrenamiento o interpretar `split-act`.
- Sesgos y sobreajuste: al tratarse de datos de simulación, es probable que la política explote sesgos del simulador (texturas, iluminación, física) y falle al transferirse al mundo real. No hay evidencia publicada de transferencia.
- Riesgo de alucinación: en el sentido estricto del término no aplica, pero sí existe el equivalente conductual, es decir, acciones plausibles pero incorrectas cuando el estado observado queda fuera de la distribución de entrenamiento.
- Licencia Apache-2.0: permite uso comercial y modificación con obligación de conservar avisos de copyright y licencia; conviene revisar además las licencias del dataset y de las dependencias (LeRobot, PyTorch).
- Adopción mínima: 16 descargas y 0 likes en el momento de la consulta, sin señales de validación por terceros.
- Metadatos atípicos: las fechas de creación y actualización indicadas en el Hub (2026-09-18) son posteriores a la fecha habitual de consulta, lo que sugiere un posible error de reloj o de metadatos en la subida.
- Ruido en la búsqueda: el nombre "wego" coincide con el metabuscador de viajes Wego, por lo que las búsquedas web devuelven resultados de viajes y no documentación técnica de este checkpoint.
- Ausencia de benchmarks: no hay tasas de éxito publicadas, de modo que cualquier decisión de producción debería basarse en una evaluación propia en el robot objetivo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wego-hansu/w5-split-act
- Paper de ACT (referencia en Hugging Face): https://huggingface.co/papers/2304.13705
- Paper de ACT en arXiv: https://arxiv.org/abs/2304.13705
- Dataset de entrenamiento: https://huggingface.co/datasets/wego-hansu/sim_data2
- Repositorio de LeRobot: https://github.com/huggingface/lerobot
- Documentación de LeRobot: https://huggingface.co/docs/lerobot/index
- Guía de entrenamiento de políticas de imitación con LeRobot: https://huggingface.co/docs/lerobot/il_robots#train-a-policy
- Perfil del autor: https://huggingface.co/wego-hansu
