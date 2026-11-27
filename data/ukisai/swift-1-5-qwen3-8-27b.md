# ukisai/Swift-1.5-Qwen3.8-27b

## Resumen

Swift 1.5 Qwen3.8-27B es un modelo derivado por ajuste fino (post-entrenamiento con RL y OPD) del modelo base Qwen3.8-27B, desarrollado por UkisAI. Su propuesta central es la eficiencia en el razonamiento: según el autor, reduce el consumo de tokens de "pensamiento" en un 58,5 % manteniendo una puntuación agregada un 0,35 % superior a la del modelo base, lo que se traduce en una aceleración de aproximadamente 1,95× en varias tareas. Es la evolución de Swift 1.0, del que se reportan más de 350 000 descargas.

El modelo es multimodal de entrada (pipeline `image-text-to-text`) y está orientado a tareas de razonamiento de horizonte largo, agentes y generación de código. Cuenta con 27 781 427 952 parámetros totales según los pesos en safetensors, un repositorio de 55,6 GB y se distribuye también en variantes GGUF y GSQ-RCO GGUF. La arquitectura declarada en los metadatos es `qwen3_5`/`qwen3_8`, heredada del modelo base.

Su relevancia actual reside en el coste de inferencia: un modelo de razonamiento de ~27B que genere menos tokens por respuesta reduce directamente la latencia y el gasto en despliegues de producción, especialmente en flujos agénticos de múltiples pasos donde el ahorro de tokens se acumula. La licencia es propietaria (`swift-open-license-1.0`) y el repositorio está restringido (`gated`).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal derivada de Qwen3.8-27B (metadatos: `qwen3_5`/`qwen3_8`) |
| Parametros totales | 27 781 427 952 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF y GSQ-RCO GGUF publicados por el autor; cuantizaciones adicionales no disponibles |
| Idiomas soportados | no disponible |
| Licencia | `swift-open-license-1.0` (licencia propietaria, repositorio con acceso restringido) |
| Formato de pesos | safetensors (transformers); GGUF en repositorios separados |

## Arquitectura y entrenamiento

El modelo parte de Qwen3.8-27B, un transformer multimodal de aproximadamente 27,8 mil millones de parámetros. Swift 1.5 se construye sobre Swift 1.0 mediante un escalado del post-entrenamiento previo, basado en aprendizaje por refuerzo (RL) y OPD, con foco explícito en tareas agénticas de horizonte largo y generación de código. La innovación metodológica declarada consiste en identificar los tokens asociados a "sobrepensamiento patológico" y penalizarlos sin atacar directamente la longitud del razonamiento, recuperando después la precisión con RL y OPD; el resultado es un uso "comprimido" de tokens con precisión mantenida.

El conjunto de datos de entrenamiento se publica como `ukisai/Qwen3.8-27B-multi-turn-agent-sft`, aunque el autor aclara que no se usa tal cual: se remuestrea y se convierte en entornos de RL adecuados. No se especifican en la información disponible el número total de tokens de entrenamiento, la composición del corpus, el contexto máximo ni detalles de la arquitectura interna (tipo de atención, capas, etc.).

## Capacidades

- Generación de texto y razonamiento con modo de pensamiento ("thinking"), optimizado para consumir menos tokens de razonamiento que el modelo base.
- Entrada multimodal de imagen y texto (pipeline `image-text-to-text`).
- Generación de código, con mejoras reportadas en LiveCodeBench respecto a versiones anteriores.
- Uso en terminal y tareas agénticas de línea de comandos, con mejoras reportadas en Terminal Bench 2.1.
- Razonamiento agéntico de múltiples pasos y de horizonte largo.
- Conversación multi-turno.
- Compatibilidad con endpoints (`endpoints_compatible` en los metadatos).
- Soporte de tool calling / function calling: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades de audio: no disponible.

## Casos de uso

- Generación de código en producción: el modelo puede integrarse en pipelines de CI/CD para generar, completar o refactorizar código, con mejoras declaradas en LiveCodeBench y un coste de tokens de razonamiento inferior al del base.
- Agentes autónomos de terminal: adecuado para tareas agénticas que ejecutan comandos y resuelven problemas de línea de comandos de varios pasos, dado el foco del post-entrenamiento en Terminal Bench 2.1 y en horizontes largos.
- Desarrollo de prototipos y videojuegos: el autor demuestra la generación de un juego 3D completo a partir de una única instrucción en 11,39 minutos frente a 104,6 minutos del modelo base, lo que lo hace útil para prototipado rápido de aplicaciones interactivas.
- Asistentes conversacionales multi-turno: su naturaleza conversacional y multimodal (imagen y texto) permite construir asistentes que interpretan capturas, diagramas o imágenes adjuntas en una conversación.
- Automatización de tareas de razonamiento con restricción de coste: en flujos donde cada llamada se factura por token, la reducción del 58,5 % en tokens de pensamiento rebaja directamente el coste operativo manteniendo la precisión.
- Evaluación y sustitución de modelos de razonamiento en producción: puede desplegarse como reemplazo directo del Qwen3.8-27B base para reducir latencia (aceleración reportada de 1,95×) sin reentrenar los flujos existentes.
- Análisis de imágenes con razonamiento: al aceptar entrada imagen-texto, sirve para tareas de inspección visual o interpretación de documentos donde se requiere razonamiento explícito sobre el contenido visual.

## Benchmarks y rendimiento

La model card incluye una tabla de evaluación externa que compara Qwen3.8-27B (base) con Swift 1.5, con protocolos de evaluación idénticos y puntuaciones agregadas en porcentaje. Los datos numéricos concretos de esa tabla no están disponibles en la información proporcionada (la tabla aparece truncada). Los datos cualitativos y agregados reportados por el autor son:

| Metrica | Valor reportado |
|---|---|
| Reduccion de tokens de pensamiento | 58,5 % menos que el base |
| Variacion de puntuacion agregada | +0,35 % respecto al base |
| Aceleracion en varias tareas | 1,95× |
| Mejora en tareas de codigo (LiveCodeBench) | mejora reportada, cifra no disponible |
| Mejora en Terminal Bench 2.1 | mejora reportada, cifra no disponible |
| Demo de generacion de juego (tiempo) | 11,39 min (Swift 1.5) frente a 104,6 min (base) |

No se han publicado en la información disponible los valores numéricos por benchmark (MMLU, HumanEval, GSM8K, etc.).

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia de orden de magnitud para un modelo de ~27,8B parámetros, los pesos en BF16 ocupan aproximadamente 55,6 GB (tamaño del repositorio), por lo que la inferencia en precisión completa requiere más de 55 GB de VRAM; las cuantizaciones GGUF reducen sustancialmente ese requisito, pero no se publican cifras oficiales.
- GPU recomendadas: no disponible en la información proporcionada. Por tamaño, un modelo de 27,8B en BF16 requiere GPUs de clase A100/H100 de 80 GB o configuraciones multi-GPU; las variantes GGUF permiten GPUs de menor VRAM.
- ¿Cabe en GPU de consumo? No hay datos oficiales. En cuantizaciones GGUF de 4 bits podría caber en GPUs de consumo de gama alta con VRAM suficiente, pero el dato no está confirmado por el autor.
- Opciones de despliegue: la librería declarada es `transformers`; el autor publica variantes GGUF y GSQ-RCO GGUF, lo que habilita despliegue con llama.cpp y derivados (Ollama, etc.). No se confirma soporte de vLLM o TGI en la información disponible.
- Latencia y throughput: no se publican cifras absolutas; el autor reporta una aceleración relativa de 1,95× frente al modelo base en varias tareas y un ejemplo de generación de juego en 11,39 minutos frente a 104,6 minutos.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Swift 1.5 Qwen3.8-27B (UkisAI) | 27,8B | no disponible | +0,35 % agregado y 58,5 % menos tokens de pensamiento que su base | `swift-open-license-1.0` (propietaria, gated) | Hugging Face (acceso restringido), GGUF y GSQ-RCO GGUF |
| Qwen3.8-27B (base) | ~27,8B | no disponible | referencia de comparación del autor | no disponible en la información proporcionada | Hugging Face |
| Swift 1.0 Qwen3.8-27b (UkisAI) | ~27,8B | no disponible | inferior a Swift 1.5 según el autor | no disponible en la información proporcionada | Hugging Face, 350k+ descargas reportadas |

No se dispone en la información proporcionada de comparaciones con modelos de otros fabricantes del mismo tamaño.

## Limitaciones y advertencias

- Licencia propietaria `swift-open-license-1.0`: es necesario revisar el texto completo de la licencia antes de cualquier uso comercial; no es una licencia de código abierto estándar.
- Repositorio con acceso restringido (`gated: true`): requiere solicitar acceso y aceptar las condiciones del autor en Hugging Face.
- Riesgo de alucinación: no se documenta en la información disponible; como en cualquier modelo generativo, debe validarse la salida en producción.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Idiomas soportados: no disponibles; no se puede garantizar un rendimiento adecuado en castellano sin evaluación propia.
- Longitud de contexto: no disponible; planificar los flujos de contexto largo con cautela.
- Optimización agresiva de tokens de pensamiento: la penalización del "sobrepensamiento" podría degradar tareas que requieren cadenas de razonamiento muy largas; conviene validar en el dominio concreto antes de desplegar.
- Los datos de rendimiento proceden del propio autor; no se han verificado de forma independiente en la información disponible.
- No se documentan requisitos de hardware oficiales, lo que dificulta la planificación de capacidad.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Version GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GGUF
- Version GSQ-RCO GGUF: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27B-GSQ-RCO-GGUF
- Version anterior Swift 1.0: https://huggingface.co/ukisai/Swift-Qwen3.8-27b
- Dataset de entrenamiento: https://huggingface.co/datasets/ukisai/Qwen3.8-27B-multi-turn-agent-sft
- Licencia: https://huggingface.co/ukisai/Swift-1.5-Qwen3.8-27b/blob/main/LICENSE
- Web del autor: https://ukisai.com
- Pagina de producto: https://ukisai.com/products/swift
- Demo del juego generado: https://ukisai.com/swift-games/27b
