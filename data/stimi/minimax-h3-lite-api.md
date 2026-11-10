# stimi/minimax-h3-lite-api

## Resumen

MiniMax H3 Lite (línea *budget*) es un servicio de generación de vídeo por API ofrecido por apimodels.app sobre los pesos abiertos de MiniMax H3, desarrollado originalmente por MiniMax. No se trata del H3 Lite oficial de MiniMax, sino de una línea propia del proveedor activa desde agosto de 2026 bajo el identificador `minimax-h3-lite`. El repositorio de Hugging Face no contiene pesos: es una página de documentación del endpoint, con ejemplos, precios y límites.

El modelo resuelve la generación de vídeo condicionada de forma multimodal: acepta texto, hasta 9 imágenes de referencia, hasta 3 clips de audio de referencia y fotogramas de inicio y fin, pero no vídeos de referencia. La salida es vídeo con audio nativo y sincronización labial cuando se aporta una pista de voz. La latencia es de minutos por clip, lo que lo sitúa en un régimen de generación por lotes más que interactivo.

Es relevante para equipos que necesitan prototipar vídeo generativo con consistencia de personaje y *lip-sync* sin desplegar infraestructura propia de GPU, pagando por clip. La ficha se centra en lo que la documentación del autor declara; los detalles de arquitectura y entrenamiento del modelo base no se detallan en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base MiniMax H3; detalles no publicados en la información disponible) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (servicio API; el proveedor no publica cuantizaciones) |
| Idiomas soportados | en |
| Licencia | minimax-h3-community-license-agreement (licencia de comunidad de MiniMax H3) |
| Formato de pesos | no disponible (el repositorio no contiene pesos; acceso solo vía API) |

Otros datos operativos declarados:

| Parametro | Valor |
|---|---|
| Proveedor del servicio | apimodels.app |
| Identificador de modelo | `minimax-h3-lite` |
| Modalidades de entrada | texto, imágenes de referencia (hasta 9), audio de referencia (hasta 3), primer y último fotograma |
| Modalidades de salida | vídeo con audio nativo (480p y 768p según ejemplos) |
| Duración de clip en ejemplos | 12 s y 15 s |
| Precio en ejemplos | 0,24 USD (768p, 12 s, 4 imágenes) y 0,30 USD (768p, 15 s, 2 imágenes + 1 audio) |
| Latencia | minutos por clip |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura interna del modelo base MiniMax H3 en la documentación proporcionada: no se especifica si es un transformer de difusión, un modelo híbrido ni el número de parámetros. Tampoco se detallan los datos de entrenamiento, el volumen de tokens o pares vídeo-texto, ni si hubo etapas de ajuste fino con preferencias humanas.

Lo único verificable es que esta línea concreta se construye sobre los pesos abiertos de MiniMax H3 y que el proveedor la expone con un subconjunto de capacidades respecto al modelo completo: acepta imágenes, audio y fotogramas de referencia, pero rechaza vídeos de referencia. Esa restricción es una decisión de producto del proveedor, no una característica documentada del modelo base.

## Capacidades

- Generación de vídeo a partir de texto (*text-to-video*) con control de composición, iluminación, óptica y audio ambiente descritos en el prompt.
- Generación de vídeo condicionada por imagen (*image-to-video*) y por múltiples imágenes de referencia (*reference-to-video*), hasta 9, para mantener consistencia de personaje, vestuario, localización y objetos.
- Condicionamiento por primer fotograma o por primer y último fotograma, para anclar el arranque y el cierre del plano.
- Sincronización labial (*lip-sync*) a partir de hasta 3 clips de audio de referencia, combinados con al menos una imagen de referencia.
- Generación de audio nativo asociado a la escena (ambiente, efectos) según los ejemplos de la model card.
- Control de puesta en escena mediante prompt estructurado por tramos temporales (por ejemplo, "0-3s", "3-6s"), con indicaciones de cámara, foco y actuación.
- Idioma de prompting documentado: inglés.
- No soporta vídeos de referencia en esta línea.

## Casos de uso

- **Prototipado de spots publicitarios con producto consistente**: se aportan varias imágenes del producto y del entorno como *Picture 1..N* y se describe el plano en el prompt; el modelo mantiene el aspecto del producto entre fotogramas, lo que permite validar una idea creativa antes de producir en estudio.
- **Doblaje y *lip-sync* de personajes virtuales**: se sube una pista de voz como *Audio 1* junto con una imagen del rostro y el modelo genera un plano hablado con sincronización labial, útil para avatares corporativos o contenido formativo multilingüe (grabando la voz en cada idioma).
- **Previsualización de guion (*previs*)**: a partir de un guion con descripción de cámara y actuación por tramos temporales, se generan planos de 12-15 s para revisar ritmo y continuidad antes del rodaje.
- **Contenido para redes con personaje recurrente**: usando un conjunto fijo de imágenes de referencia (rostro, vestuario, localización), se producen clips sucesivos manteniendo la identidad del personaje sin reentrenar nada.
- **Animación de *storyboards* y pruebas de iluminación**: se ancla el primer fotograma con un *frame* dibujado o renderizado y se deja que el modelo desarrolle el movimiento, lo que sirve para testear óptica, paletas y esquemas de luz.
- **Generación de material de archivo sintético para edición**: clips cortos con audio ambiente nativo que se integran como *b-roll* en una timeline, evitando la gestión de licencias de metraje real.
- **Investigación en generación de vídeo condicionada**: al ser una API sobre pesos abiertos, permite medir calidad de *lip-sync* y consistencia de referencias sin montar el *pipeline* completo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card solo documenta dos ejemplos cualitativos (un plano de 12 s con 4 imágenes de referencia y un monólogo de 15 s con *lip-sync*), sin métricas cuantitativas de FVD, CLIP-score, precisión de *lip-sync* ni comparaciones numéricas.

## Requisitos de hardware

- **Inferencia local**: no aplicable a esta ficha. El repositorio no contiene pesos (tamaño 0,0 GB) y el acceso es exclusivamente mediante la API de apimodels.app, por lo que no se requiere VRAM propia.
- **GPU recomendadas**: no disponible; el proveedor no publica el hardware que sirve el modelo.
- **Ejecución en GPU de consumo**: no disponible para despliegue propio; como cliente de la API, cualquier equipo con navegador o cliente HTTP puede invocarla.
- **Opciones de despliegue**: API HTTP de apimodels.app; cliente web en Replicate (`replicate.com/stimqq/minimax-h3-lite`) usando la clave propia del usuario. No se documentan opciones vLLM, llama.cpp, Ollama ni TGI, que además no aplican a un modelo de vídeo.
- **Latencia y throughput**: la model card indica "minutos por clip"; no se publican cifras de latencia por segundo de vídeo ni de trabajos concurrentes.
- **Coste**: 0,24 USD por un clip de 768p y 12 s con 4 imágenes de referencia; 0,30 USD por un clip de 768p y 15 s con 2 imágenes y 1 audio. No se detallan precios para 480p ni para otras duraciones.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto / duración | Entradas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MiniMax H3 Lite (apimodels.app) | no disponible | clips de 12-15 s en ejemplos; 480p y 768p | texto, hasta 9 imágenes, hasta 3 audios, primer/último fotograma; sin vídeo de referencia | minimax-h3-community-license-agreement (vía API) | API de pago, cliente web en Replicate |
| MiniMax H3 Lite oficial (MiniMax) | no disponible | no disponible | no disponible | no disponible | producto separado de MiniMax; no documentado en esta información |
| MiniMax H3 (base, MiniMaxAI/MiniMax-H3) | no disponible | no disponible | no disponible | minimax-h3-community-license-agreement | pesos abiertos en Hugging Face |

No se dispone de datos de rendimiento ni de especificaciones técnicas de los modelos comparables en la información proporcionada, por lo que la comparación se limita a modalidades de entrada, licencia y forma de acceso.

## Limitaciones y advertencias

- **No es el H3 Lite oficial de MiniMax**: es una línea de servicio de apimodels.app construida sobre los pesos de MiniMax H3; la model card lo advierte explícitamente. No debe citarse como producto de MiniMax.
- **Sin pesos en el repositorio**: el tamaño es 0,0 GB; no es posible descargar, inspeccionar ni ejecutar el modelo localmente desde esta página.
- **Sin vídeo de referencia**: a diferencia del modelo completo, esta línea no acepta clips de vídeo como referencia, lo que limita la transferencia de movimiento.
- **Latencia de minutos por clip**: inadecuado para aplicaciones interactivas o de tiempo real; requiere colas y gestión asíncrona de trabajos.
- **Idioma**: solo inglés documentado, tanto en etiquetas como en los prompts de ejemplo; no hay evidencia de soporte multilingüe en el *prompting*.
- **Riesgo de alucinación visual**: no se documentan métricas de fidelidad; los prompts de ejemplo son extremadamente detallados (más de 150 palabras con desglose temporal), lo que sugiere que la calidad depende fuertemente de la ingeniería de *prompt*.
- **Licencia**: la licencia de comunidad de MiniMax H3 es de tipo "other" y puede imponer restricciones al uso comercial; debe revisarse el texto enlazado antes de producción. El uso vía API añade además los términos del proveedor.
- **Sesgos**: no se publica información sobre sesgos demográficos, estéticos o culturales del modelo base.
- **Contenido sintético**: los personajes de los ejemplos son ficticios y generados por IA; en producción conviene etiquetar el material como sintético y verificar requisitos de divulgación.
- **Precios y disponibilidad**: son datos de la model card de noviembre de 2026 y pueden cambiar sin aviso; no se documentan límites de *rate limiting* ni de cuota.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/stimi/minimax-h3-lite-api
- Modelo base MiniMax H3: https://huggingface.co/MiniMaxAI/MiniMax-H3
- Licencia del modelo base: https://huggingface.co/MiniMaxAI/MiniMax-H3/blob/main/LICENSE
- Página del modelo en apimodels.app: https://apimodels.app/models/minimax-h3-lite
- Referencia de la API: https://apimodels.app/docs/minimax-h3-lite
- Obtención de clave de API: https://apimodels.app/console/api-keys
- Cliente web en Replicate: https://replicate.com/stimqq/minimax-h3-lite
- Ejemplo 1 (cuatro imágenes de referencia, 12 s): https://huggingface.co/stimi/minimax-h3-lite-api/resolve/main/example-pier-watch.mp4
- Ejemplo 2 (monólogo con *lip-sync*, 15 s): https://huggingface.co/stimi/minimax-h3-lite-api/resolve/main/example-pier-monologue.mp4
