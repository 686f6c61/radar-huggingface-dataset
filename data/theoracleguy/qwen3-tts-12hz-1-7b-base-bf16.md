# theoracleguy/Qwen3-TTS-12Hz-1.7B-Base-bf16

## Resumen

Qwen3-TTS-12Hz-1.7B-Base es un modelo de síntesis de voz (text-to-speech) desarrollado por el equipo Qwen de Alibaba, publicado originalmente en PyTorch y convertido posteriormente al formato MLX por el usuario theoracleguy para su ejecución en hardware Apple Silicon. El modelo emplea una arquitectura de modelo de lenguaje autorregresivo con codebooks discretos múltiples, lo que permite una generación de voz de alta fidelidad con control fino sobre la prosodia, el tono, la velocidad y la emoción.

Esta versión MLX, identificada como `theoracleguy/Qwen3-TTS-12Hz-1.7B-Base-bf16`, contiene 1.928.677.440 parámetros (aproximadamente 1,9 mil millones) y se distribuye bajo licencia Apache 2.0, lo que facilita su uso comercial y su integración en proyectos propietarios. Su relevancia radica en que ofrece voice cloning y voice design mediante instrucciones en lenguaje natural, además de soporte multilingüe para diez idiomas principales, todo ello en un paquete relativamente ligero que puede ejecutarse en un Mac con memoria unificada moderada.

Al estar optimizado para MLX, este modelo es especialmente atractivo para desarrolladores que trabajan en el ecosistema Apple, ya que aprovecha la aceleración por hardware de los chips M1/M2/M3/M4 sin necesidad de GPUs dedicadas. La conversión mantiene la funcionalidad completa del modelo original, permitiendo tanto la generación de voz desde cero como la clonación de voces de referencia a partir de un audio de muestra.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo de lenguaje discreto multi-codebook (autoregresivo) |
| Parametros totales | 1.928.677.440 (1,93 B) |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | bf16 (unico formato publicado en esta conversion) |
| Idiomas soportados | 10 idiomas principales (no detallados en la informacion disponible) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX) |

## Arquitectura y entrenamiento

El modelo Qwen3-TTS-12Hz-1.7B-Base utiliza una arquitectura de modelo de lenguaje autorregresivo con multiples codebooks discretos, un enfoque que permite representar la senal de audio como una secuencia de tokens discretos de alta resolucion. A diferencia de los sistemas TTS clasicos basados en vocoders o en modelos de atencion, esta arquitectura unifica el modelado del texto y del audio en un unico marco, facilitando la generacion de voz con control explicito sobre caracteristicas prosodicas como el tono, la velocidad y la expresion emocional.

El entrenamiento se ha realizado con datos de voz de alta calidad, aunque no se han publicado detalles especificos sobre el volumen de tokens, la composicion del dataset o el uso de tecnicas como RLHF o DPO en la informacion disponible. La conversion a MLX se realizo con la libreria mlx-audio version 0.3.0, que preserva los pesos originales en formato bf16 y adapta la ejecucion al framework de Apple. El modelo original de Qwen tambien incluye una variante llamada VoiceDesign que permite disenar voces sinteticas mediante descripciones en lenguaje natural, pero esta version Base se centra en la generacion directa a partir de texto y audio de referencia.

## Capacidades

- Generacion de voz natural de alta fidelidad a partir de texto, con control de tono, velocidad y expresion emocional.
- Voice cloning: es capaz de replicar la voz de un hablante a partir de un audio de referencia (zero-shot).
- Voice design: mediante la variante VoiceDesign (no incluida en esta conversion) se pueden crear voces sinteticas personalizadas usando instrucciones en lenguaje natural.
- Soporte multilingue para 10 idiomas principales, aunque la lista concreta no se especifica en la informacion disponible.
- Control adaptativo de la prosodia, lo que permite ajustar la entonacion y el ritmo de la voz generada.
- Integracion con la libreria mlx-audio, que ofrece una API sencilla para generar audio desde Python o linea de comandos.

## Casos de uso

- **Atencion al cliente automatizada**: el modelo puede generar respuestas de voz naturales para sistemas IVR o chatbots con voz, manteniendo una entonacion adecuada en conversaciones multi-turno. Su capacidad de voice cloning permite personalizar la voz del asistente segun la marca.
- **Produccion de audiobooks**: con la clonacion de voz, un narrador profesional puede generar la narracion completa de un libro manteniendo su voz y estilo, reduciendo significativamente el tiempo de grabacion en estudio.
- **Doblaje de video y localizacion**: el soporte multilingue y el control de prosodia permiten doblar contenido audiovisual a varios idiomas con una calidad aceptable, ajustando la velocidad y la emocion para sincronizar con la escena.
- **Asistentes virtuales y dispositivos IoT**: al ser un modelo ligero (1,9 B parametros) y ejecutable en Apple Silicon, puede integrarse en aplicaciones de escritorio o en dispositivos como HomePod para proporcionar respuestas de voz personalizadas.
- **Generacion de contenido para podcasts y redes sociales**: los creadores pueden generar locuciones para videos, anuncios o podcasts sin necesidad de un estudio de grabacion, utilizando la clonacion de voz para mantener una identidad sonora consistente.
- **Herramientas de accesibilidad**: personas con discapacidad visual o dificultades de lectura pueden beneficiarse de sistemas de lectura de pantalla que generan voz natural y expresiva, mejorando la experiencia de uso frente a voces roboticas tradicionales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La pagina del modelo original en Hugging Face no incluye tablas comparativas con otros sistemas TTS, ni metricas objetivas como MOS (Mean Opinion Score) o WER en tareas de sintesis. Se recomienda consultar el repositorio oficial de Qwen3-TTS para futuras actualizaciones.

## Requisitos de hardware

- **Plataforma**: este modelo esta optimizado para Apple Silicon (chips M1, M2, M3 o M4) mediante el framework MLX. No tiene soporte oficial para GPUs NVIDIA o AMD.
- **Memoria RAM unificada**: la version bf16 ocupa aproximadamente 3,9 GB en memoria (1,93 B parametros x 2 bytes). Se recomienda un minimo de 8 GB de RAM unificada para ejecutar el modelo sin problemas, aunque 16 GB ofrecen mayor margen para cargar el modelo completo y procesar audios de referencia.
- **Almacenamiento**: el repositorio pesa 4,5 GB, por lo que se necesita espacio libre adicional para descargar y cargar los pesos.
- **Despliegue**: se utiliza la libreria `mlx-audio`, que proporciona una interfaz de linea de comandos y una API Python. No se mencionan opciones de despliegue en servidores con GPUs convencionales, ya que MLX es exclusivo de Apple.
- **Latencia**: no se han publicado mediciones de latencia o throughput. Al ser un modelo autoregresivo, la velocidad de generacion depende de la longitud del texto y de la potencia del chip, pero se espera un rendimiento aceptable en chips M2 o superiores para aplicaciones interactivas.

## Comparativa con modelos similares

No se dispone de informacion suficiente en la documentacion proporcionada para realizar una comparativa objetiva con otros modelos TTS de tamano similar (por ejemplo, XTTS, Bark o VITS). La informacion disponible no incluye benchmarks estandarizados ni especificaciones detalladas de estos modelos alternativos. Se recomienda consultar el repositorio oficial de Qwen3-TTS para comparaciones cualitativas y metricas cuando esten disponibles.

## Limitaciones y advertencias

- **Idiomas limitados**: aunque se mencionan 10 idiomas principales, no se detalla cuales son ni la calidad relativa en cada uno. Es posible que el rendimiento sea inferior en idiomas menos representados en el entrenamiento.
- **Riesgo de alucinaciones**: como modelo de lenguaje aplicado a audio, puede generar palabras o sonidos incorrectos, especialmente con entradas ruidosas o fuera de distribucion.
- **Sesgos en la voz**: la clonacion de voz puede perpetuar sesgos presentes en los datos de entrenamiento, como acentos regionales o caracteristicas de genero, lo que debe tenerse en cuenta en aplicaciones comerciales.
- **Control limitado en la version Base**: la version Base no incluye la funcionalidad de voice design mediante instrucciones en lenguaje natural; para ello se requiere la variante VoiceDesign, no incluida en esta conversion.
- **Dependencia de Apple Silicon**: al ser un modelo MLX, no se puede ejecutar en infraestructura de servidores con GPUs NVIDIA estandar sin una conversion adicional a otro formato (por ejemplo, PyTorch o ONNX), lo que limita su portabilidad.
- **Licencia Apache 2.0**: aunque permite uso comercial, es recomendable revisar los terminos de la licencia del modelo original de Qwen, ya que podrian existir restricciones adicionales sobre el uso de los datos de entrenamiento o la redistribucion.

## Enlaces

- [Modelo convertido a MLX en Hugging Face](https://huggingface.co/theoracleguy/Qwen3-TTS-12Hz-1.7B-Base-bf16)
- [Modelo original Qwen3-TTS-12Hz-1.7B-Base](https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-Base)
- [Repositorio oficial de Qwen3-TTS en GitHub](https://github.com/QwenLM/Qwen3-TTS)
- [Variante VoiceDesign en ModelScope](https://www.modelscope.cn/models/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign)
- [Documentacion de mlx-audio](https://github.com/Blaizzy/mlx-audio) (no incluida en la informacion, pero relevante para el uso del modelo)
