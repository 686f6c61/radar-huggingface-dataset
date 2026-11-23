# tarfandoon/paintpath-net

## Resumen

PaintPathNet es un modelo de imagen a imagen desarrollado por el usuario tarfandoon y publicado en Hugging Face bajo licencia Apache 2.0. Su propósito no es generar arte nuevo, sino descomponer una pintura compleja en una hoja de ruta de cuatro etapas progresivas pensada para que una persona sin formación artística pueda reproducirla paso a paso: boceto estructural a lápiz, bloqueo amplio de color, sombras y estructura de valores, y detalles medios con pincelada.

Técnicamente se trata de una red convolucional de 60.517.817 parámetros que combina un backbone ConvNeXt-Small con una U-Net condicionada por FiLM, donde la etapa de destino (1 a 4) actúa como condicionamiento. El modelo se entrenó sobre 5.609 pinturas de bellas artes curadas (5.049 de entrenamiento y 560 de validación), y el repositorio ocupa 0,2 GB en formato safetensors para PyTorch.

Su relevancia es acotada pero específica: cubre un nicho educativo y de asistencia creativa que los modelos generativos generalistas no abordan de forma nativa, y lo hace con un tamaño lo bastante reducido como para ejecutarse en hardware de consumo. No es un modelo de lenguaje ni un generador de imágenes de propósito general, sino una herramienta de simplificación pictórica por etapas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ConvNeXt-Small + U-Net condicionada por FiLM (etapa-condicionada) |
| Parametros totales | 60.517.817 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no aplica (modelo de imagen a imagen) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible (modelo visual, sin interfaz de texto) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (librería PyTorch) |

## Arquitectura y entrenamiento

El modelo sigue un esquema de simplificación progresiva condicionada por etapa. Un backbone ConvNeXt-Small extrae representaciones de la pintura de entrada y una U-Net con modulación FiLM recibe la etapa objetivo como condicionamiento, de modo que la misma red produce salidas distintas según se solicite el boceto, el bloqueo de color, las sombras o los detalles medios. Es una arquitectura puramente convolucional, sin mecanismos de atención de largo alcance ni componentes generativos de difusión, lo que explica su reducido número de parámetros y su huella de memoria moderada.

El entrenamiento se realizó sobre 5.609 pinturas de bellas artes curadas, divididas en 5.049 de entrenamiento y 560 de validación, durante 4 épocas. La model card reporta la evolución de las métricas: la pérdida de entrenamiento baja de 0,1875 en la época 1 a 0,0658 en la época 4, mientras que la L1 de validación mejora de 0,0333 a 0,0231, la PSNR de 24,95 dB a 28,25 dB y la LPIPS de 0,1540 a 0,0811. No se documenta en la información disponible el uso de RLHF, DPO ni de un corpus de entrenamiento más amplio que el citado.

## Capacidades

- Transformación de imagen a imagen: convierte una pintura de entrada en una versión simplificada correspondiente a una de las cuatro etapas definidas.
- Generación de bocetos estructurales a lápiz con líneas y proporciones simplificadas (etapa 1).
- Producción de bloqueos de color planos y masas cromáticas simplificadas (etapa 2).
- Extracción de estructura de sombras y valores tonales para dar profundidad y forma (etapa 3).
- Síntesis de detalles medios y pincelada pictórica (etapa 4).
- Condicionamiento explícito por etapa: la misma entrada puede procesarse en cuatro modos distintos según la etapa solicitada.
- Capacidad educativa orientada a guiar a pintores principiantes mediante una secuencia de pasos.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso ni capacidades multilingües, al no ser un modelo de lenguaje.

## Casos de uso

- Aplicación educativa de iniciación a la pintura: el modelo genera la secuencia de cuatro etapas a partir de una obra de referencia, de modo que el alumno puede seguir el proceso desde el boceto hasta el detalle sin necesidad de descomponer la imagen manualmente.
- Generación de material didáctico para talleres: un profesor puede introducir una pintura y obtener las cuatro fases como láminas de trabajo, aprovechando que el modelo está condicionado por etapa y produce salidas coherentes entre sí.
- Herramienta de asistencia en estudios de arte: el alumno sube una obra que quiere copiar y recibe una guía progresiva con la estructura, los colores base, los valores y los detalles, reduciendo la barrera técnica inicial.
- Previsualización de procesos pictóricos en publicaciones y blogs: ilustradores y divulgadores pueden mostrar cómo se construye una pintura por capas a partir de una imagen final, usando las etapas 1 a 4 como figuras del artículo.
- Integración en aplicaciones de aprendizaje interactivo: al ser un modelo pequeño (60,5 M de parámetros) y con pesos en safetensors, puede servirse desde un backend PyTorch ligero para generar la hoja de ruta bajo demanda en una app web o móvil.
- Prototipado de pipelines de simplificación de imagen: investigadores pueden usar el modelo como componente de un sistema mayor de abstracción visual o de estilización por etapas, dado su bajo coste computacional y su licencia permisiva.

## Benchmarks y rendimiento

| Epoca | Perdida de entrenamiento | L1 de validacion | PSNR de validacion | LPIPS de validacion |
|---|---|---|---|---|
| 1 | 0,1875 | 0,0333 | 24,95 dB | 0,1540 |
| 2 | 0,0839 | 0,0284 | 26,69 dB | 0,1061 |
| 3 | 0,0706 | 0,0246 | 27,38 dB | 0,0946 |
| 4 | 0,0658 | 0,0231 | 28,25 dB | 0,0811 |

Las métricas corresponden a las 560 pinturas de validación no vistas. No se han publicado resultados comparativos con otros modelos (MMLU, HumanEval, GSM8K u otros) en la información disponible, al no tratarse de un modelo de lenguaje.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 60,5 M de parámetros en precisión completa (fp32), los pesos ocupan aproximadamente 242 MB; en fp16, unos 121 MB. La VRAM total dependerá de la resolución de entrada y del tamaño del lote, pero debería mantenerse en el rango de 1 a 4 GB en configuraciones habituales.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; una RTX 3060, RTX 4060 o superior cubre el caso de uso sin problemas. Para lotes grandes o procesamiento por lotes de muchas pinturas, una RTX 4090 o una A100 aportan margen adicional.
- Cabe en GPU consumer: sí, con holgura, incluidas GPU de gama media y posiblemente inferencia en CPU para imágenes individuales.
- Opciones de despliegue: PyTorch nativo (carga de safetensors), TorchServe o un servicio FastAPI/Gradio para la demo; no se documenta soporte de vLLM, llama.cpp, Ollama ni TGI, que están orientados a modelos de lenguaje.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| PaintPathNet | 60,5 M | no aplica | Simplificacion pictorica por etapas | Apache 2.0 | Hugging Face |
| Alternativas de simplificacion de imagen | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone en la información proporcionada de modelos directamente comparables en la misma categoría (simplificación pictórica progresiva condicionada por etapa). Los modelos de imagen a imagen de propósito general (difusión, controlnet y similares) no son equivalentes funcionalmente, por lo que la comparación cuantitativa no está disponible.

## Limitaciones y advertencias

- El modelo está entrenado exclusivamente sobre pinturas de bellas artes; su comportamiento con fotografías, ilustraciones digitales o imágenes fuera de dominio no está documentado.
- No se han publicado evaluaciones de sesgo; al derivar de un corpus curado de pinturas, puede heredar sesgos estéticos, culturales y de representación del conjunto de entrenamiento.
- Riesgo de alucinación visual: al ser un modelo de simplificación, puede omitir o reinterpretar elementos de la imagen de entrada, especialmente en obras con detalle fino o composiciones atípicas.
- El entrenamiento se limita a 4 épocas y a 5.609 imágenes, un volumen reducido que puede traducirse en menor robustez ante estilos poco representados.
- No hay soporte documentado de cuantización ni de formatos distintos de safetensors/PyTorch, lo que limita su despliegue en entornos con restricciones de memoria muy estrictas.
- La licencia Apache 2.0 permite uso comercial, pero no se documentan garantías de calidad ni condiciones adicionales del autor.
- No se dispone de información sobre latencia, throughput ni requisitos exactos de memoria para resoluciones concretas.
- El modelo no procesa texto ni mantiene conversaciones; cualquier expectativa de uso como asistente conversacional es inadecuada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tarfandoon/paintpath-net
- Demo en Hugging Face Spaces: https://huggingface.co/spaces/tarfandoon/paintpath-studio
