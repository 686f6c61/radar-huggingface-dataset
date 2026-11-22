# zjgkkn/qwen3.5-2b-steam-reviews-lora

## Resumen

Qwen3.5-2b-steam-reviews-lora es un adaptador LoRA desarrollado por el usuario zjgkkn sobre el modelo base Qwen/Qwen3.5-2B. Su proposito es predecir, a partir de una captura de pantalla de un videojuego junto con su ano de lanzamiento, generos y etiquetas de Steam, dos valores discretos: el numero de resenas que recibira el juego en Steam y el porcentaje de resenas positivas. No es un modelo generativo de proposito general, sino un clasificador especializado que reutiliza las capacidades multimodales del modelo base.

El adaptador emplea el pipeline image-text-to-text del modelo base y se distribuye como pesos PEFT en formato safetensors, con un tamano de repositorio de aproximadamente 0,1 GB. La licencia es Apache-2.0, heredada del modelo base, y el unico idioma declarado es el ingles. El modelo fue creado y actualizado en noviembre de 2026 y no registra descargas ni likes en el momento de la consulta.

Su relevancia es acotada pero concreta: demuestra como un adaptador de bajo rango sobre un modelo multimodal pequeno puede convertir una tarea de prediccion de mercado (estimacion de volumen y recepcion de resenas en Steam) en un problema de clasificacion en dos digitos, con una evaluacion cuantitativa publicada por el autor y un script de inferencia incluido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA (PEFT) sobre transformer multimodal Qwen/Qwen3.5-2B; rango 16, alpha 32, aplicado a las proyecciones de atencion y MLP de todas las capas del modelo de lenguaje; torre de vision congelada |
| Parametros totales | No disponible (adaptador LoRA; el modelo base es de 2B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el autor indica que cabe en una GPU de 8 GB en bfloat16 |
| Idiomas soportados | Ingles (en) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 y alpha 32 insertado en las proyecciones de atencion y MLP de todas las capas del modelo de lenguaje de Qwen3.5-2B. La torre de vision del modelo base permanece congelada, de modo que el entrenamiento solo ajusta las matrices de bajo rango del decodificador. La perdida se calcula unicamente sobre los tokens de respuesta, no sobre el prompt. El modelo base procesa la captura de pantalla redimensionada a 600x338 (sin ampliacion) junto con un mensaje de usuario en plantilla de chat con `enable_thinking=False`.

Los datos de entrenamiento proceden del FronkonGames Steam Games Dataset (licencia MIT): juegos lanzados en Steam entre 2013 y 2026, con hasta cuatro capturas cada uno (miniaturas de 600x338 de Steam), ano de lanzamiento, generos, etiquetas de usuario y el recuento de resenas y porcentaje de positivas que mostraba la pagina de la tienda en noviembre de 2026. Se entrenó con 105.059 juegos de 2013-2025 y 13.258 de 2026. El dataset no se distribuye. La innovacion tecnica destacable no esta en la arquitectura, sino en el metodo de inferencia: en lugar de generar texto, el script lee las probabilidades de los diez tokens de digito inmediatamente despues del prompt y calcula su media (la clase esperada) como pronostico mas fino; para el porcentaje de positivas se anade la clase de resenas mas probable a partir de 10 resenas y un espacio, y se vuelven a leer los digitos.

## Capacidades

- Prediccion del numero de resenas de Steam de un juego a partir de una captura, su ano, generos y hasta cinco etiquetas.
- Prediccion del porcentaje de resenas positivas, expresado como clase discreta de 0 a 9 (o `-` cuando el juego tiene menos de 10 resenas y Steam no muestra porcentaje).
- Procesamiento de imagen y texto conjuntamente (image-text-to-text) mediante la torre de vision del modelo base.
- Salida en dos digitos de clase (por ejemplo, `7 6`) y exposicion de las probabilidades de los diez digitos para obtener una prediccion continua.
- Promediado de varias capturas del mismo juego para reducir el ruido del pronostico.
- Salida en JSON con todas las probabilidades mediante la opcion `--json` del script.
- No dispone de tool calling, capacidades de agente ni modo de razonamiento extendido en el uso previsto.

## Casos de uso

- Analisis previo al lanzamiento para estudios independientes: dado un conjunto de capturas y las etiquetas previstas, estimar el orden de magnitud de resenas y la recepcion esperada antes de fijar expectativas comerciales.
- Comparacion de juegos dentro de un mismo ano y genero: el autor recomienda comparar solo juegos del mismo ano de lanzamiento y genero primario, lo que permite ordenar candidatos de un catalogo con un criterio homogeneo.
- Filtrado y priorizacion en catalogos de tiendas o agregadores: asignar un pronostico a titulos poco conocidos para decidir que fichas destacar o que generos explorar.
- Investigacion sobre senales visuales de exito en videojuegos: el adaptador permite estudiar hasta que punto la apariencia de las capturas y las etiquetas de genero correlacionan con el volumen de resenas.
- Educacion y demostraciones de PEFT multimodal: sirve como ejemplo reproducible de adaptacion LoRA de un modelo image-text-to-text de 2B para una tarea de clasificacion estructurada con lectura de probabilidades de tokens.
- Prototipado de herramientas internas de analitica para editoriales: integrar el script `predict.py` en un pipeline que procese lotes de capturas y devuelva pronosticos en JSON para su volcado en hojas de calculo o bases de datos.
- Evaluacion de carteras de juegos por ano: agrupar predicciones por ano de lanzamiento para detectar cohortes con recepcion esperada sistematicamente distinta.

## Benchmarks y rendimiento

Los resultados publicados por el autor corresponden a juegos reservados para evaluacion (no vistos en entrenamiento). El pronostico de un juego es la media sobre sus capturas. Un par de juegos del mismo ano y genero primario cuyo recuento de resenas difiere al menos el doble se ordena correctamente cuando el juego con mas resenas obtiene el pronostico mas alto; el azar es del 50%.

| Metrica | 2026: 3.315 juegos, todas las capturas | 2013-2025: 2.000 juegos, una captura cada uno |
|---|---|---|
| Pares en el orden correcto | 78,3% | 76,9% |
| Pares con diferencia cuatriple, el juego mayor con 10+ resenas | 84,1% | 81,8% |
| Clase de resenas exacta | 34,1% | 32,3% |
| Clase de resenas con desviacion maxima de una | 74,1% | 72,5% |
| Error del porcentaje de resenas positivas (juegos con 10+ resenas) | 11,1 puntos | 11,3 puntos |

No se han publicado resultados de benchmarks estandar (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: el autor indica que el adaptador y el modelo base caben en una GPU de 8 GB en bfloat16.
- GPU recomendadas: no especificadas por el autor; por el requisito de 8 GB en bfloat16, encajan tarjetas de gama media-alta con al menos 8 GB de VRAM (por ejemplo, RTX 3060 Ti, RTX 3070, RTX 4060 Ti, RTX 4070) y, por supuesto, A100, H100 o L40S para despliegues por lotes.
- Cabe en GPU de consumo: si, segun el dato del autor, en tarjetas con 8 GB o mas en bfloat16.
- Opciones de despliegue: el autor proporciona `predict.py` sobre PyTorch, Transformers y PEFT con Pillow; no se mencionan vLLM, llama.cpp, Ollama ni TGI. Al ser un adaptador PEFT, requiere cargar el modelo base Qwen/Qwen3.5-2B junto con los pesos LoRA.
- Latencia y throughput: no disponibles. El script promedia varias capturas por juego, lo que multiplica el coste de inferencia por el numero de imagenes procesadas.
- Entorno probado: Python 3.12, PyTorch 2.11, Transformers 5.23 y PEFT 0.22.

## Comparativa con modelos similares

No se dispone de informacion sobre modelos comparables en la documentacion proporcionada. Como referencia, el propio adaptador se apoya en Qwen/Qwen3.5-2B, un modelo multimodal de 2B parametros con licencia Apache-2.0, pero no se han publicado datos que permitan comparar su rendimiento con alternativas de la misma categoria.

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zjgkkn/qwen3.5-2b-steam-reviews-lora | Adaptador LoRA sobre base de 2B | No disponible | Prediccion de resenas de Steam | Apache-2.0 | Hugging Face (0 descargas) |
| Qwen/Qwen3.5-2B (modelo base) | 2B | No disponible | Multimodal image-text-to-text general | Apache-2.0 | Hugging Face |
| Alternativas comparables | No disponible | No disponible | No disponible | No disponible | No disponible |

## Limitaciones y advertencias

- Los recuentos de resenas son una instantanea: los juegos de 2026 llevaban semanas o meses a la venta en el momento de la recogida de datos, por lo que sus cifras no son comparables con las de juegos con anos de historial.
- El modelo solo ve una captura (o varias promediadas), el ano, los generos y cinco etiquetas; el precio, los trailers, el marketing y el propio juego le son invisibles.
- Conoce unicamente Steam: su publico, sus etiquetas y sus generos entre 2013 y 2026; no es extrapolable a otras plataformas ni a otros mercados.
- Una sola captura produce un pronostico ruidoso; el autor recomienda promediar varias y comparar solo juegos del mismo ano y genero primario.
- El error del porcentaje de resenas positivas es de unos 11 puntos, y la clase exacta de resenas solo se acierta en torno al 32-34% de los casos; el uso debe ser ordinal y de orden de magnitud, no como cifra exacta.
- Riesgo de sesgo derivado del dataset: la distribucion de generos, etiquetas y visibilidad en Steam de 2013-2026 condiciona las predicciones, y los juegos con menos de 10 resenas reciben `-` en el porcentaje de positivas.
- El modelo no esta afiliado ni respaldado por Valve; Steam es una marca de Valve Corporation.
- Licencia Apache-2.0, igual que el modelo base, sin restricciones adicionales conocidas para uso comercial; el dataset de entrenamiento no se distribuye.
- No se han publicado evaluaciones de sesgo, robustez ante imagenes fuera de distribucion ni comportamiento multilingue; el unico idioma declarado es el ingles.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/zjgkkn/qwen3.5-2b-steam-reviews-lora
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-2B
- FronkonGames Steam Games Dataset (MIT), citado como fuente de datos: no disponible el enlace directo en la informacion proporcionada.
