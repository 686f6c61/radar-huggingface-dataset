# stupid-zwl/jdi-decision-v1

## Resumen

jdi-decision-v1 es un sistema multimodal de decisión desarrollado por JD.com (京东). No es un modelo generativo al uso: su función es recibir un estado (texto e imágenes), una o varias preguntas con opciones definidas y devolver una elección estructurada acompañada de probabilidades por opción. Internamente combina un codificador visual, un componente de reconocimiento de texto PaddleOCR v5 congelado (procedente del equipo PaddlePaddle de Baidu), un backbone de decisión basado en Qwen3.8-27B con adaptaciones de la arquitectura D3 y una cabeza de lectura en FP32.

El modelo declara 26.085.330.160 parámetros (unos 26,1 mil millones) y un repositorio de 52,2 GB en formato safetensors, con licencia Apache 2.0. Está etiquetado como `decision-model` y `multimodal`, y su pipeline no está especificado en HuggingFace. La relevancia actual reside en su enfoque: en lugar de generar texto libre, produce decisiones con distribución de probabilidad explícita, lo que facilita su integración en sistemas que necesitan trazabilidad y umbrales de confianza.

La documentación pública reporta una puntuación de 79,3601 en la suite pública Decision Index Vision, con 12.210 de 12.210 peticiones exitosas en 11 benchmarks, y una latencia media de 345,5 ms en dos nodos H200. El autor advierte que se trata de una puntuación autodeclarada y que la validación oficial de latencia en RTX PRO 6000 está pendiente.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal con backbone Qwen3.8-27B y adaptaciones D3; codificador visual + PaddleOCR v5 congelado + cabeza de lectura FP32 |
| Parametros totales | 26.085.330.160 |
| Parametros activos | no disponible (no se declara como MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors, presumiblemente FP32/BF16) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 (los pesos OCR y cabeceras de Paddle conservan su licencia upstream) |
| Formato de pesos | safetensors (librería pytorch, requiere `custom_code`) |

## Arquitectura y entrenamiento

El flujo de inferencia descrito en la model card parte de una imagen que se decodifica, se convierte a RGB y se redimensiona hasta un límite de píxeles. A continuación se ejecutan en paralelo, sobre una misma GPU, dos ramas: un codificador visual que extrae características de la imagen y un componente PaddleOCR v5 congelado que reconoce el texto presente. La transcripción OCR se incorpora al estado como `state.image_text_transcription`, complementando (no sustituyendo) la información visual original.

El backbone de decisión procesa las características visuales junto con el texto, las preguntas y las opciones, y una cabeza de lectura en FP32 genera la respuesta estructurada con probabilidades por opción. El autor indica que los detalles de la arquitectura base y del runtime de decisión están en la guía de reproducción (`REPRODUCE.md#base-model-and-decision-architecture`). No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset ni si hubo RLHF, DPO u otras fases de alineación. Las características visuales se reutilizan únicamente dentro de cada petición.

## Capacidades

- Toma de decisiones estructurada: devuelve una opción seleccionada y probabilidades por cada alternativa definida en la pregunta.
- Procesamiento multimodal de texto e imágenes en una misma petición.
- Reconocimiento de texto en imagen mediante PaddleOCR v5, integrado en el pipeline de decisión.
- Soporte de preguntas con criterios explícitos por opción (por ejemplo, `{"A": "STOP", "B": "GO"}`), lo que permite definir tareas de clasificación ad hoc sin reentrenamiento.
- Ejecución por petición en una sola GPU, con ramas OCR y visión concurrentes.
- Soporte de tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (no se declaran idiomas).
- Modo thinking, visión, audio u otras capacidades especiales: solo visión y OCR según la documentación.

## Casos de uso

- Clasificación documental con texto embebido: el sistema puede decidir la categoría de un documento a partir de la imagen y del texto extraído por OCR, usando opciones predefinidas con criterios; es adecuado porque la transcripción OCR se añade al estado sin descartar la información visual.
- Verificación de señales y carteles en imágenes: con preguntas del tipo "¿qué dice el cartel?" y opciones cerradas, el modelo devuelve la elección y su probabilidad, útil en inspección visual automatizada.
- Triaje de incidencias en atención al cliente: dado un estado con texto e imagen adjunta, el modelo puede elegir entre categorías de incidencia y aportar la probabilidad de cada una para enrutar al equipo adecuado.
- Control de calidad en logística: decisión entre opciones de aceptación o rechazo de un paquete a partir de una foto y texto asociado, aprovechando la rama OCR para leer etiquetas.
- Moderación o validación de contenido con criterios explícitos: cada opción puede describirse con un criterio textual, lo que permite adaptar la política sin reentrenar el modelo.
- Sistemas de decisión con umbral de confianza: al devolver probabilidades por opción, permite derivar a revisión humana las peticiones cuya probabilidad máxima quede por debajo de un umbral definido.
- Extracción de decisiones en pipelines por lotes: con una latencia media de 345,5 ms por petición en H200 y una réplica por GPU, puede dimensionarse para procesamiento por lotes con requisitos de tiempo acotados.

## Benchmarks y rendimiento

Los únicos datos publicados en la información disponible son los de la evaluación pública de visión del propio autor:

| Metrica | Valor |
|---|---|
| Decision Index Vision (suite publica) | 79,3601 |
| Peticiones exitosas | 12.210 / 12.210 en 11 benchmarks |
| Latencia media | 345,5 ms |
| Latencia P50 | 282,4 ms |
| Latencia P80 | 426,8 ms |
| Latencia P90 | 604,2 ms |
| Hardware de evaluacion | 2 workers H200, una replica completa por worker, una peticion simultanea por GPU |

El autor indica que la puntuación es autodeclarada y no un ranking confirmado de leaderboard ni una puntuación Full; la evaluación privada y la validación oficial de latencia en RTX PRO 6000 están pendientes. No se han publicado resultados de benchmarks comparativos (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma explícita. Con 26.085 millones de parámetros, en FP16/BF16 los pesos ocuparían aproximadamente 52 GB, lo que exige al menos una GPU de 80 GB (A100 80GB, H100 80GB, H200) para una réplica completa; en FP32 la cifra se duplicaría.
- GPU recomendadas: H200 para la configuración evaluada; por capacidad de memoria, también A100 80GB y H100 80GB son candidatas razonables, aunque no se han validado en la documentación. La validación de latencia en RTX PRO 6000 está pendiente según el autor.
- GPU de consumo: no cabe en GPUs de consumo de 24 GB en precisión nativa; no se documentan cuantizaciones que permitan reducir el requisito.
- Opciones de despliegue: el repositorio incluye `ocr_inference.ComboEngine` como punto de entrada para el sistema completo (con OCR) y `inference.D3Engine` como entrada al modelo de decisión interno, que no incluye el procesamiento OCR. Se requiere Python 3.12 sobre GPU CUDA y la librería `pytorch` con `custom_code`. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: latencia media de 345,5 ms por petición con una petición simultánea por GPU en H200; el throughput no se publica, pero con una réplica por GPU y procesamiento secuencial se sitúa en torno a 2,9 peticiones por segundo por GPU como cota superior teórica.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables de la misma categoría (sistemas de decisión multimodal con salida probabilística) en la documentación proporcionada. Como referencia de tamaño, el backbone declarado es Qwen3.8-27B, pero no se aportan métricas que permitan una comparación directa con otros modelos de 27 mil millones de parámetros.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| jdi-decision-v1 | 26.085.330.160 | no disponible | Apache 2.0 | HuggingFace, 33 descargas |
| Alternativas comparables | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La puntuación de 79,3601 en Decision Index Vision es autodeclarada por el autor y no ha sido confirmada por un leaderboard oficial; la evaluación privada está pendiente.
- La validación de latencia en RTX PRO 6000 está pendiente; los datos de latencia proceden únicamente de H200.
- No se documentan sesgos conocidos, composición del dataset de entrenamiento ni procesos de alineación, lo que dificulta evaluar riesgos de sesgo.
- Riesgo de alucinación: no evaluado en la información disponible; al tratarse de un modelo de decisión con opciones cerradas, el riesgo se traslada a la selección de opciones y a las probabilidades reportadas.
- El componente PaddleOCR v5 y las cabeceras de compilación de Paddle conservan sus términos de licencia upstream, que pueden imponer condiciones adicionales al uso comercial del sistema completo.
- La transcripción OCR se excluye del export público de resultados para no redistribuir contenido de benchmarks, lo que limita la reproducibilidad externa de esa parte del pipeline.
- No se declaran idiomas soportados ni longitud de contexto, lo que impide garantizar su comportamiento en textos largos o en idiomas distintos del usado en la evaluación.
- No se documentan cuantizaciones oficiales, por lo que el despliegue en hardware de menor memoria no está soportado de forma verificada.
- El modelo requiere `custom_code`, lo que implica ejecutar código del repositorio y revisar su procedencia antes de usarlo en producción.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/stupid-zwl/jdi-decision-v1
- Dataset y resultados de evaluación: https://huggingface.co/datasets/stupid-zwl/jdi-decision-v1
- Resultados de la ejecución de visión: https://huggingface.co/datasets/stupid-zwl/jdi-decision-v1/tree/main/runs/vision-paddle-v5
- Guía de reproducción: `REPRODUCE.md` en el repositorio del modelo
- Fuentes y hashes del OCR: `ocr_inference/ocr_sources.json` en el repositorio del modelo
- README en chino: `README.zh-CN.md` en el repositorio del modelo
