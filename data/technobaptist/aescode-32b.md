# TechnoBaptist/AesCode-32B

## Resumen

AesCode-32B es un modelo multimodal de generación de código especializado en producir artefactos visuales ricos en información (diapositivas, pósteres, dashboards e informes) como documentos HTML/CSS completos, estructurados, editables y verificables. Parte del modelo base Qwen/Qwen3-VL-32B-Instruct y se distribuye bajo licencia Apache 2.0. Su planteamiento diferencial consiste en combinar una imagen de referencia generada a partir del mismo prompt (que aporta guía estética de layout, jerarquía y color) con el prompt textual, que fija el contenido obligatorio, separando así los requisitos semánticos de las señales visuales.

El problema que aborda es concreto: los modelos de código no "ven" cómo interactúan layout y color en el lienzo, mientras que los generadores de imágenes componen páginas atractivas pero suelen fallar al renderizar texto, cifras y relaciones lógicas. AesCode cubre ese hueco mediante supervisión con estructura de grafo y recompensas cross-modales desacopladas, con un entrenamiento que encadena SFT de arranque en frío y GDPO sobre siete canales de recompensa.

El checkpoint tiene 33.357.390.064 parámetros reales (según safetensors) y un repositorio de 66,7 GB. La configuración de evaluación publicada emplea 24.576 tokens de contexto y hasta 12.000 tokens de salida, con `transformers>=4.57` como requisito. Es relevante ahora porque ataca una tarea con verificación programática (validación de texto, límites del lienzo y gráficos) y porque reporta ventajas medibles frente a modelos propietarios en esa tarea concreta, aunque todavía sin resolver el apartado de estilo. Nota de trazabilidad: el repositorio consultado está publicado por el usuario TechnoBaptist, mientras que la model card apunta a `microsoft/AesCode-32B` como ruta canónica.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal vision-language (familia Qwen3-VL, tag `qwen3_vl`); entrada imagen-texto, salida texto |
| Parametros totales | 33.357.390.064 (aprox. 33,36 mil millones) |
| Longitud de contexto | No disponible como máximo oficial; la evaluacion publicada usa 24.576 tokens de contexto |
| Tipos de cuantizacion | No disponible; los pesos publicados estan en bf16 (safetensors) y no se listan cuantizaciones oficiales (GGUF, AWQ, GPTQ) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (bf16), libreria `transformers` |
| Modelo base | Qwen/Qwen3-VL-32B-Instruct |
| Tamano del repositorio | 66,7 GB |
| Pipeline | image-text-to-text |
| Requisito de libreria | transformers >= 4.57 |
| Fecha de creacion (segun HuggingFace) | 2026-10-12 |

## Arquitectura y entrenamiento

El modelo es un transformer multimodal de la familia Qwen3-VL, inicializado desde Qwen3-VL-32B-Instruct y ajustado para una tarea de generación de código: emitir un documento HTML completo en el que las tablas usan estructuras de tabla HTML y los gráficos se implementan con ECharts, lo que restringe el espacio de soluciones a implementaciones ejecutables y directamente verificables. Acepta hasta dos imágenes por prompt en despliegue con vLLM, lo que permite adjuntar referencias visuales junto con la instrucción textual.

El entrenamiento combina dos fases: un SFT de arranque en frío y una posterior optimización con GDPO sobre siete canales de recompensa. Los elementos técnicos destacados por el autor son la supervisión con estructura de grafo y las recompensas cross-modales desacopladas, que separan los requisitos semánticos (contenido correcto) de las señales visuales (layout y estilo) para evitar que el modelo copie contenido alucinado de la imagen de referencia o ignore su estructura. No se especifican en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni detalles de la configuración de GDPO.

## Capacidades

- Generación de documentos HTML/CSS completos a partir de un prompt de contenido y, opcionalmente, una imagen de referencia.
- Producción de artefactos visuales ricos en información: diapositivas, pósteres, dashboards e informes.
- Generación de tablas como estructuras de tabla HTML y de gráficos mediante ECharts, lo que facilita su verificación programática.
- Comprensión de imagen como referencia estética y de layout (modelo image-text-to-text, multimodal).
- Salidas editables y estructuradas, aptas para revisión y control de versiones, frente a imágenes rasterizadas.
- Capacidad de mantener coherencia entre requisitos semánticos y restricciones visuales gracias al entrenamiento con recompensas desacopladas.
- No hay información disponible sobre soporte de tool calling, function calling, uso agéntico, modo thinking explícito, audio o capacidades multilingües más allá del inglés.

## Casos de uso

- Generación de infografías verificables: el modelo emite un documento HTML con texto, tablas y gráficos ECharts, de modo que un pipeline puede validar automáticamente cifras, límites del lienzo y estructura antes de publicar.
- Creación de dashboards de datos: a partir de un prompt con métricas y, opcionalmente, una referencia visual del estilo corporativo, produce un HTML con tablas y gráficos integrables en un portal interno o en un sistema de informes.
- Diseño de diapositivas y presentaciones editables: genera slides como HTML/CSS que luego pueden convertirse a PDF o reutilizarse como plantilla, evitando el retrabajo de reconstruir la maquetación desde una imagen generada.
- Pósteres y material de marketing: la referencia visual aporta dirección estética (paleta, jerarquía, densidad) mientras el prompt fija mensajes, precios y datos, reduciendo errores de texto que son típicos de los generadores de imágenes.
- Conversión de referencias visuales en maquetación: dado un mockup o una captura, el modelo lo usa como guía de layout y estilo para producir HTML/CSS de partida, útil en prototipado rápido de interfaces.
- Generación de informes de negocio con estructura verificable: informes con secciones, tablas comparativas y gráficos ECharts generados en lote, con comprobaciones programáticas de contenido y desbordamiento del lienzo antes de la entrega.
- Investigación en generación multimodal de código y diseño visual verificable: sirve como checkpoint de referencia para estudiar recompensas cross-modales, supervisión con estructura de grafo y evaluación con rúbricas automáticas frente a jueces humanos.
- Automatización de plantillas HTML en CI: integrado tras un servicio de inferencia, puede producir variantes de landing pages o emails HTML a partir de especificaciones textuales, con validación de estructura en el propio pipeline.

## Benchmarks y rendimiento

Los resultados publicados en la model card corresponden a 300 muestras de infografías, con tres generaciones por prompt y sin selección. `Rule` promedia las comprobaciones programáticas de texto, límites del lienzo y gráficos; `Visual` promedia las dimensiones de checklist de contenido, layout y estilo; `Overall` es la media de ambas. `Ref.` indica si el modelo recibe una imagen de referencia generada junto con el prompt.

| Modelo | Ref. | Text | Bound | Chart | Rule | Content | Layout | Style | Visual | Overall |
|---|---:|---:|---:|---:|---:|---:|---:|---:|---:|---:|
| GPT-5.5 | No | 88,67 | 86,18 | 82,85 | 85,90 | 79,27 | 68,09 | 52,80 | 66,72 | 76,31 |
| GPT-5.5 | Si | 89,22 | 86,85 | 81,35 | 85,80 | 82,44 | 89,93 | 57,91 | 76,76 | 81,28 |
| Claude Opus 4.8 | No | 91,40 | 85,03 | 87,69 | 88,04 | 84,98 | 64,88 | 46,72 | 65,53 | 76,78 |
| Claude Opus 4.8 | Si | 92,45 | 84,43 | 73,75 | 83,55 | 86,42 | 89,76 | 55,51 | 77,23 | 80,39 |
| Qwen3-VL-8B | No | 58,32 | 77,23 | 43,30 | 59,61 | 38,33 | 23,97 | 13,22 | 25,17 | 42,39 |
| Qwen3-VL-8B | Si | 64,07 | 70,99 | 42,35 | 59,14 | 52,90 | 51,33 | 29,92 | 44,72 | 51,93 |
| Qwen3-VL-32B | No | 66,00 | 80,31 | 41,36 | 62,55 | 49,81 | 34,85 | 19,34 | 34,67 | 48,61 |
| Qwen3-VL-32B | Si | 71,19 | 79,61 | 50,77 | 67,19 | 62,04 | 64,59 | 38,43 | 55,02 | 61,10 |
| AesCode-8B | Si | 94,06 | 88,36 | 87,79 | 90,07 | 86,41 | 87,80 | 53,21 | 75,80 | 82,94 |
| AesCode-32B | Si | 95,34 | 97,27 | 90,37 | 94,33 | 85,76 | 90,58 | 55,99 | 77,44 | 85,89 |

Conclusiones declaradas por el autor: AesCode-32B mejora `Visual` en 22,4 puntos y `Overall` en 24,8 puntos respecto a su backbone Qwen3-VL-32B condicionado por referencia; alcanza `Rule` 94,33 frente a 85,90 de GPT-5.5 y 88,04 de Claude Opus 4.8; `Chart` (90,37) lidera la comparativa; y `Bound` (97,27) refleja una reducción fuerte del desbordamiento del lienzo, con un fallo grave de límites en el 4,3% de las 300 muestras frente al 34,7% de GPT-5.5. El estilo es el techo común: ningún sistema supera 60 en esa dimensión.

## Requisitos de hardware

- Memoria de acelerador: la model card indica planificar aproximadamente 65 GB solo para los parámetros en bf16. Con contexto de 24.576 tokens y hasta 12.000 tokens de salida, hay que sumar la memoria de caché KV y activaciones, por lo que el requisito real en produccion es superior.
- GPU recomendadas: configuraciones multigpu de clase centro de datos. El ejemplo oficial de despliegue usa `--tensor-parallel-size 4`, lo que encaja con 4 x A100 80 GB, 4 x H100 80 GB o combinaciones equivalentes (por ejemplo, 8 x A6000 48 GB o 8 x L40S 48 GB).
- GPU de consumo: no cabe en una RTX 4090 (24 GB) ni en tarjetas de 32 GB en bf16. No se han publicado cuantizaciones oficiales (GGUF, AWQ, GPTQ) que permitan reducir el footprint a rango consumer.
- Opciones de despliegue: `transformers>=4.57` con `AutoProcessor` y `AutoModelForImageTextToText`; vLLM recomendado para generacion por lotes, con `--limit-mm-per-prompt image=2 --max-model-len 24576`. No hay informacion sobre soporte en llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible. Los datos publicados solo describen la configuracion de evaluacion (temperatura 0,8; top-p 0,95; hasta 12.000 tokens de salida; tres rollouts por prompt), no cifras de rendimiento por segundo ni de tokens por segundo.

## Comparativa con modelos similares

| Modelo | Parametros | Entrada multimodal | Contexto de evaluacion | Overall (infografias) | Licencia | Disponibilidad |
|---|---|---|---|---|---|---|
| AesCode-32B | 33,36 mil millones | Si (referencia visual) | 24.576 tokens | 85,89 | Apache 2.0 | Pesos abiertos en HuggingFace |
| AesCode-8B | No disponible en la informacion proporcionada | Si (referencia visual) | No disponible | 82,94 | No disponible en la informacion proporcionada | Pesos abiertos (microsoft/AesCode-8B) |
| Qwen3-VL-32B-Instruct | 32B (modelo base) | Si | No disponible | 61,10 (con referencia) | No disponible en la informacion proporcionada | Pesos abiertos |
| Qwen3-VL-8B | 8B | Si | No disponible | 51,93 (con referencia) | No disponible en la informacion proporcionada | Pesos abiertos |
| GPT-5.5 | No disponible | Si | No disponible | 81,28 (con referencia) | Propietaria | API |
| Claude Opus 4.8 | No disponible | Si | No disponible | 80,39 (con referencia) | Propietaria | API |

La comparacion se limita a la tarea de generacion de infografias en HTML/CSS descrita por el autor; no hay datos de benchmarks generales (MMLU, HumanEval, GSM8K) en la informacion proporcionada.

## Limitaciones y advertencias

- Estilo como techo comun: ningun sistema evaluado, incluido AesCode-32B, supera 60 en la dimension `Style`, que solo otorga credito cuando un diseno no necesita revision visual adicional antes de la entrega. En la practica, exige supervision humana del acabado final.
- Fallos de limites del lienzo: aunque reducidos, persisten. El autor reporta fallos graves de boundary en el 4,3% de las 300 muestras evaluadas, por lo que conviene validar el desbordamiento de forma automatica.
- Riesgo de alucinacion: la propia motivacion del modelo es el riesgo de que un VLM copie contenido alucinado de la imagen de referencia o ignore su layout. El entrenamiento mitiga el problema, pero no lo elimina; hay que verificar texto, cifras y relaciones logicas contra la fuente.
- Idioma: el modelo esta etiquetado unicamente para ingles (`en`). No hay evidencia publicada de rendimiento en castellano ni en otros idiomas.
- Limitacion de tarea: es un modelo especializado en generar HTML/CSS para artefactos visuales. No hay datos publicados que respalden su uso como modelo generalista de conversacion, razonamiento o codigo fuera de ese dominio.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero conviene verificar las condiciones del modelo base Qwen3-VL-32B-Instruct, ya que la informacion proporcionada no incluye su licencia.
- Trazabilidad del repositorio: el checkpoint analizado se publica bajo el usuario TechnoBaptist, mientras que la model card referencia rutas `microsoft/AesCode-32B` y `microsoft/AesCode-8B`. Conviene confirmar la procedencia oficial antes de desplegar en produccion.
- Cero adopcion verificable en el momento de la consulta: el repositorio presenta 0 descargas y 0 likes, por lo que no existe evidencia de comunidad ni de validacion independiente de los resultados.
- La model card disponible esta truncada en la seccion de uso, de modo que parte de las instrucciones y detalles de salida no se han podido revisar.
- La fecha de creacion que reporta HuggingFace (2026-10-12) resulta anomala; no se ha podido contrastar con otras fuentes.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/TechnoBaptist/AesCode-32B
- Modelo companero (segun la model card): https://huggingface.co/microsoft/AesCode-8B
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-32B-Instruct
- Codigo: https://github.com/microsoft/AesCode
- Paper citado: "AesCode: Aesthetic Code Generation with Decoupled Cross-Modal Rewards" (sin URL disponible en la informacion proporcionada)
- Los resultados de busqueda web recibidos no contienen informacion relevante sobre este modelo; no se han incluido como fuentes.
