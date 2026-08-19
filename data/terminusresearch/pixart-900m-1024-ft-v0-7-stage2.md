# terminusresearch/pixart-900m-1024-ft-v0.7-stage2

## Resumen

El modelo `terminusresearch/pixart-900m-1024-ft-v0.7-stage2` es un fine-tune completo (full rank) de un modelo de difusión de texto a imagen basado en la arquitectura PixArt Sigma, desarrollado por el usuario `terminusresearch`. Se deriva de una cadena de fine-tunes: parte de `ptx0/pixart-900m-1024-ft-large`, pasa por `terminusresearch/pixart-900m-1024-ft-v0.6` y culmina en esta versión v0.7-stage2. Con aproximadamente 908 millones de parámetros, está diseñado para generar imágenes de alta calidad a resolución 1024×1024 a partir de descripciones textuales.

Este modelo resuelve el problema de la generación de imágenes fotorrealistas y artísticas con un control fino del estilo, cubriendo temáticas tan diversas como fantasía, ciencia ficción, entornos medievales o escenas cotidianas. Su relevancia radica en ser un fine-tune comunitario que mejora las capacidades del modelo base, ofreciendo una alternativa de código abierto con licencia permisiva para proyectos comerciales. Se distribuye a través del ecosistema Hugging Face con soporte nativo para la librería `diffusers` y el pipeline `PixArtSigmaPipeline`.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | PixArt Sigma (transformer de difusion, DiT) |
| Parametros totales | 908.433.824 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No aplica (modelo de difusion, no procesa texto como contexto) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No disponible (probablemente ingles, no confirmado) |
| Licencia | CreativeML OpenRAIL-M |
| Formato de pesos | safetensors (compatible con diffusers) |

## Arquitectura y entrenamiento

El modelo se basa en la arquitectura PixArt Sigma, un transformer de difusion (DiT) que opera sobre latentes de imagen. A diferencia de los modelos U-Net tradicionales, PixArt Sigma utiliza un bloque transformer puro con atencion espacial, lo que permite escalar de forma eficiente y generar imagenes de alta resolucion. El checkpoint contiene 908 millones de parametros, todos ellos entrenables en este fine-tune completo.

El entrenamiento se realizo como un fine-tune de rango completo (full rank) sobre el modelo `terminusresearch/pixart-900m-1024-ft-v0.6`, que a su vez es un fine-tune de `ptx0/pixart-900m-1024-ft-large`. No se han publicado detalles sobre el dataset utilizado, el numero de pasos de entrenamiento ni la composicion de los datos. La configuracion de validacion documentada incluye un CFG de 4.5, CFG Rescale de 0.0 y 25 pasos de inferencia, lo que sugiere un entrenamiento orientado a una generacion rapida y estable. No se mencionan tecnicas como RLHF o DPO, ya que no son habituales en modelos de difusion.

## Capacidades

- Generacion de imagenes a partir de prompts textuales en resolucion 1024×1024.
- Soporte para una amplia variedad de estilos: fantasia, cyberpunk, medieval, ciencia ficcion, escenarios post-apocalipticos, naturaleza, retratos, etc.
- Capacidad de interpretar prompts complejos con multiples elementos (personajes, entornos, iluminacion, atmosfera).
- Generacion de composiciones con multiples objetos y escenas detalladas.
- No incluye capacidades de tool calling, agentes ni razonamiento multi-paso, al ser un modelo exclusivamente de generacion de imagenes.
- No se ha confirmado soporte multilingue; los ejemplos de la model card estan en ingles.

## Casos de uso

- **Arte conceptual para videojuegos**: el modelo puede generar escenarios, personajes y criaturas para fases de preproduccion. Su capacidad para interpretar prompts como "majestic dragon soaring through the sky" o "epic medieval battle" permite a los artistas explorar rapidamente multiples conceptos visuales sin necesidad de bocetos manuales.
- **Ilustracion de libros y portadas**: autores y editores pueden crear portadas o ilustraciones interiores a partir de descripciones textuales. Por ejemplo, "magical castle in a lush forest" o "mystical forest with glowing plants" sirven para generar imagenes coherentes con la narrativa.
- **Generacion de assets para diseno grafico**: disenadores pueden producir fondos, texturas o elementos decorativos para carteles, webs o presentaciones. La resolucion de 1024×1024 es adecuada para uso digital directo.
- **Prototipado visual en produccion audiovisual**: directores de arte y cineastas pueden generar imagenes de referencia para escenarios, vestuario o atrezzo. Prompts como "cyberpunk hacker in a dark room" o "post-apocalyptic cityscape" ayudan a alinear la vision creativa del equipo.
- **Creacion de contenido para redes sociales**: creadores de contenido pueden generar imagenes unicas y personalizadas para publicaciones, evitando problemas de derechos de autor. El modelo permite producir variaciones rapidas de un mismo tema.
- **Generacion de fondos para entornos virtuales**: desarrolladores de realidad virtual o juegos pueden crear texturas y panoramas para mundos inmersivos. La capacidad de generar escenas detalladas como "underground cave filled with crystals" o "futuristic city skyline at night" es directamente utilizable.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No existen datos comparativos de FID, CLIP score u otras metricas de calidad de imagen para este modelo especifico.

## Requisitos de hardware

- **VRAM estimada para inferencia**: con 908 millones de parametros en precision fp16, los pesos ocupan aproximadamente 1.8 GB. Sin embargo, la generacion de imagenes a 1024×1024 requiere memoria adicional para los latentes y las activaciones del transformer. Se estima un minimo de 8 GB de VRAM para una inferencia comoda, aunque puede funcionar con menos usando atencion con memoria eficiente.
- **GPU recomendadas**: tarjetas con al menos 8 GB de VRAM, como NVIDIA RTX 3070/3080, RTX 4060 Ti o superiores. Para produccion a gran escala, se recomiendan GPUs de datacenter como A100 o H100.
- **Compatibilidad con GPU de consumo**: si, el modelo cabe en GPUs de consumo modernas con 8 GB o mas de VRAM.
- **Opciones de despliegue**: al ser un modelo de difusion, se puede ejecutar con la libreria `diffusers` de Hugging Face, que ofrece pipelines optimizados. Tambien es compatible con herramientas como ComfyUI o Automatic1111 (a traves de adaptadores). No se menciona soporte para vLLM, llama.cpp u Ollama, ya que esos entornos estan orientados a modelos de lenguaje.
- **Latencia y throughput**: no se han publicado datos concretos. En una GPU de gama alta (RTX 4090), la generacion de una imagen a 1024×1024 con 25 pasos suele tardar entre 5 y 15 segundos, dependiendo de la implementacion y el uso de atencion eficiente.

## Comparativa con modelos similares

| Modelo | Parametros | Resolucion | Licencia | Notas |
|---|---|---|---|---|
| `terminusresearch/pixart-900m-1024-ft-v0.7-stage2` | 908M | 1024×1024 | OpenRAIL-M | Fine-tune comunitario de PixArt Sigma |
| `ptx0/pixart-900m-1024-ft-large` | ~900M | 1024×1024 | OpenRAIL-M | Modelo base de la cadena de fine-tunes |
| Stable Diffusion 1.5 | 860M | 512×512 (hasta 768) | OpenRAIL-M | Modelo clasico, menor resolucion nativa |
| SDXL | 2.6B | 1024×1024 | OpenRAIL-M | Mayor calidad, pero requiere mas VRAM |

La comparativa se basa en parametros y resolucion, ya que no hay datos de rendimiento publicados. Este modelo ofrece una resolucion nativa de 1024×1024 con un tamano de parametros moderado, lo que lo hace mas ligero que SDXL y con mayor resolucion que SD 1.5. La licencia OpenRAIL-M permite uso comercial con restricciones de seguridad.

## Limitaciones y advertencias

- **Sesgos conocidos**: al ser un fine-tune de un modelo base entrenado con datos de internet, puede heredar sesgos de genero, raza o cultura presentes en los datos de entrenamiento. No se han realizado evaluaciones especificas de sesgo para este checkpoint.
- **Riesgo de alucinacion**: en modelos de difusion, la "alucinacion" se manifiesta como artefactos visuales, distorsiones anatomicas o elementos incoherentes en imagenes complejas. Es especialmente notable en manos, rostros o texto dentro de la imagen.
- **Limitaciones de contexto**: al ser un modelo de imagen, no procesa texto como contexto; la longitud del prompt esta limitada por el tokenizador del texto (tipicamente 77 tokens en modelos similares, aunque no se ha confirmado para este).
- **Restricciones de licencia**: la licencia CreativeML OpenRAIL-M permite uso comercial, pero incluye clausulas de uso responsable que prohiben generar contenido ilegal, danino o que infrinja derechos de terceros. Es obligatorio revisar los terminos completos antes de desplegar en produccion.
- **Caveat para produccion**: el repositorio pesa 349.1 GB, lo que sugiere que incluye multiples checkpoints o archivos de gran tamano. Para inferencia, se debe cargar solo el checkpoint necesario. Ademas, al ser un fine-tune de una cadena, es recomendable verificar la reproducibilidad con el modelo base v0.6.

## Enlaces

- [Hugging Face - modelo v0.7-stage2](https://huggingface.co/terminusresearch/pixart-900m-1024-ft-v0.7-stage2)
- [Hugging Face - modelo base v0.6](https://huggingface.co/terminusresearch/pixart-900m-1024-ft-v0.6)
- [Hugging Face - modelo base original ptx0/pixart-900m-1024-ft-large](https://huggingface.co/ptx0/pixart-900m-1024-ft-large) (referencia indirecta)
