# VioletXF/manganinja-coreml

## Resumen

MangaNinja Core ML es una conversión no oficial y experimental del modelo de colorización de manga basada en imagen de referencia MangaNinja, desarrollado originalmente por Ali-ViLab. La conversión la ha realizado el usuario VioletXF con coremltools de Apple y se distribuye como un conjunto de siete componentes Core ML independientes que cualquier aplicación iOS o de Apple silicon puede ejecutar. El modelo resuelve la tarea de colorear páginas de manga en blanco y negro a partir de una imagen de referencia ya coloreada, manteniendo el trazo original en alta resolución.

El repositorio ocupa 4,94 GB (4,60 GiB) y contiene siete paquetes `.mlpackage` que suman 4.941.942.005 bytes. Los pesos están en FP16 y las entradas y salidas públicas en Float32. No se trata de un modelo de lenguaje: es un pipeline de difusión de imagen a imagen con resolución fija de 512×512 y condicionamiento exclusivamente por referencia (se omite la guía interactiva por puntos de la versión original).

Es relevante ahora porque permite llevar colorización de manga a dispositivos Apple sin conexión, pero conviene subrayar que el autor advierte de que la calidad de imagen, la paridad numérica, el consumo de memoria y la velocidad de inferencia no han sido validadas. El propio autor indica que el hecho de que los paquetes compilen con el compilador de Core ML no implica evidencia alguna sobre la calidad de la salida.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Pipeline de difusion con 7 componentes: CLIP (vision), VAE encoder, VAE decoder, UNet de referencia, extractor de lineart, ControlNet (control) y denoiser. Conversion Core ML de MangaNinja |
| Parametros totales | No disponible (no se declara el recuento de parametros; solo los tamanos de cada paquete) |
| Parametros activos | No aplica (no es una arquitectura MoE) |
| Longitud de contexto | No aplica. Resolucion fija de contrato: 512x512 (referencia y objetivo), con CLIP a 224x224 |
| Tipos de cuantizacion | Pesos en FP16; entradas y salidas publicas en Float32 |
| Idiomas soportados | No aplica (modelo de imagen; no procesa texto natural, solo un embedding de prompt vacio para el paso incondicional) |
| Licencia | manganinja-and-component-terms (license: other) |
| Formato de pesos | Core ML (`.mlpackage`, compilados a `.mlmodelc` con `MLModel.compileModel(at:)`) |

Tamano de cada componente descargable:

| Componente | Bytes |
|---|---:|
| `lineart.mlpackage` | 9.137.771 |
| `vae_encoder.mlpackage` | 68.470.412 |
| `vae_decoder.mlpackage` | 99.164.266 |
| `clip.mlpackage` | 608.239.478 |
| `reference.mlpackage` | 1.714.063.009 |
| `control.mlpackage` | 722.926.619 |
| `denoiser.mlpackage` | 1.719.891.909 |

## Arquitectura y entrenamiento

Se trata de una conversión de formato, no de un entrenamiento nuevo. El autor especifica que el modelo se convirtió desde el repositorio de Ali-ViLab fijado en el commit `6363c81aaedab0a435d18cba9209a7e842881ad7`, con el checkpoint `Johanan0528/MangaNinjia@4e6237c1d22415272bf98426616fe478cd3202a0` (nótese la grafía MangaNinjia). Este port utiliza condicionamiento únicamente por referencia e incluye la media de dos guías (`u + 4 * (r - u)`), lo que equivale a la guía de referencia y de puntos idénticas cuando se omite la guía por puntos. No equivale a la inferencia interactiva con PointNet de la versión original.

El pipeline es una cadena de difusión latente de resolución fija. El paso 1 usa CLIP para extraer un embedding de referencia `[1,1,768]` a partir de una imagen normalizada de 224×224. Después, el VAE encoder produce un latente `[1,4,64,64]` ya escalado por 0,18215 a partir de la referencia y ruido gaussiano estándar. La UNet de referencia emite `bank_0` a `bank_15`, que se retienen mientras se libera esa red. El extractor de lineart recibe la imagen objetivo en `[0,1]` y devuelve un lineart ya invertido, umbralizado y normalizado a `[-1,1]` (no debe codificarse con el VAE). La fase de denoising ejecuta 20 pasos de contrato (timesteps 951, 901, …, 1) con dos ramas secuenciales, incondicional y condicionada por referencia; el ControlNet emite `residual_0` a `residual_12` (12 bloques down más el bloque medio) y el denoiser combina esos residuos con los 16 bancos de referencia y una bandera `conditioned`. El muestreo es DDIM determinista con eta=0 y el decodificador VAE devuelve la imagen final `[1,3,512,512]` en `[0,1]`, tras dividir por 0,18215 y normalizar/recortar la salida.

## Capacidades

- Colorización de manga de imagen a imagen: colorea una página en blanco y negro usando una imagen de referencia ya coloreada como guía de estilo y color.
- Condicionamiento por referencia a través de CLIP y de los bancos de atención de la UNet de referencia (16 bancos, `bank_0`–`bank_15`).
- Extracción de lineart integrada que preserva el trazo de la página original.
- Combinación de croma generado con la página original: el host puede conservar la tinta a alta resolución y la relación de aspecto original en lugar de usar la salida 512×512 tal cual.
- Ranking opcional de referencias candidatas: el host puede puntuar referencias coloreadas frente al embedding CLIP del objetivo mediante similitud coseno.
- Sin soporte de tool calling, function calling ni agentes: no es un modelo de lenguaje ni un agente.
- Sin capacidades multilingües, de visión general, audio ni texto generativo.
- No incluye guía interactiva por puntos (punto clave de la versión original que este port omite).

## Casos de uso

- Colorización de páginas de manga en apps iOS: la aplicación ejecuta los siete componentes en el orden definido por el contrato, carga solo las redes necesarias para cada etapa y cachea embeddings CLIP y bancos de referencia para no mantener las siete redes en memoria a la vez.
- Preservación de tinta a alta resolución: dado que el contrato trabaja a 512×512, una app puede combinar el croma generado con la página original para conservar el trazo a resolución completa y la relación de aspecto.
- Selección asistida de referencias: usar la puntuación por similitud coseno del embedding CLIP para ordenar varias referencias coloreadas candidatas antes de lanzar la difusión, reduciendo iteraciones costosas en el dispositivo.
- Flujo de trabajo por lotes en Apple silicon: procesar páginas individuales de un capítulo en un Mac con silicio de Apple, compilando los paquetes una sola vez y reutilizando los `.mlmodelc` resultantes entre ejecuciones.
- Herramienta de previsualización integrada en lectores de manga: ofrecer una vista coloreada de baja resolución (512×512) generada localmente, sin enviar imágenes a un servidor, para decidir si el usuario quiere colorear el capítulo completo.
- Base para conversiones propias: al incluir `manifest.json`, `contract.json` y `conversion/sources.json` con recuentos de bytes y hashes SHA-256, sirve como referencia para reproducir o auditar la conversión desde el commit fijado del repositorio original.
- Investigación sobre despliegue de difusión en el dispositivo: permite medir latencia y memoria de una cadena de difusión de 20 pasos partida en siete grafos Core ML separados, aunque el autor advierte de que no se ha establecido un presupuesto mínimo de memoria seguro.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que la calidad de imagen, la paridad numérica, la memoria del dispositivo y la velocidad de inferencia no han sido validadas, y que la compilación correcta de los paquetes no debe interpretarse como evidencia de calidad de salida. No se proporcionan cifras de latencia ni de throughput.

## Requisitos de hardware

- Objetivo de plataforma: iOS 18 o superior y el soporte Core ML correspondiente en silicio de Apple. Una app de consumo podría requerir una versión de sistema operativo más reciente.
- La descarga total es de 4,94 GB (4,60 GiB); el consumo de memoria en tiempo de ejecución es independiente y no se ha publicado un presupuesto mínimo seguro para móvil o tableta.
- La instalación compila los paquetes localmente y necesita espacio en disco temporal adicional. Las herramientas de despliegue de Core ML pueden generar una representación instalada de mayor tamaño que la descarga.
- El autor recomienda mantener solo las redes necesarias en cada etapa, cachear embeddings CLIP y bancos de referencia, y evitar cargar las siete redes a la vez.
- No se declaran GPU concretas (A100, H100, RTX 4090, etc.) ni opciones de despliegue alternativas como vLLM, llama.cpp, Ollama o TGI; el formato es exclusivamente Core ML.
- No cabe en GPU de consumo tipo NVIDIA en su formato actual: los pesos son paquetes Core ML orientados a silicio de Apple, no safetensors ni GGUF.

## Comparativa con modelos similares

| Modelo | Formato | Pipeline | Guia por puntos | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| MangaNinja Core ML (este) | Core ML (`.mlpackage`) | 7 componentes, resolucion fija 512x512, DDIM eta=0, 20 pasos | No (solo referencia) | manganinja-and-component-terms | Hugging Face, conversion no oficial |
| MangaNinja (Ali-ViLab, upstream) | PyTorch | Modelo original con referencia y guia interactiva por puntos (PointNet) | Si | No disponible en la informacion proporcionada | Repositorio GitHub y checkpoint de terceros |
| Otras conversiones Core ML de colorizacion de manga | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos de otros modelos comparables de colorización de manga en la información proporcionada. La comparación más directa es con la propia versión PyTorch original, de la que este repositorio es una conversión parcial.

## Limitaciones y advertencias

- Conversión no validada: el autor advierte que la calidad de imagen, la paridad numérica, la memoria del dispositivo y la velocidad no han sido comprobadas.
- La compilación correcta con Core ML no garantiza la calidad de la salida.
- Se omite la guía interactiva por puntos; el port usa solo condicionamiento por referencia, por lo que el comportamiento no es equivalente a la inferencia interactiva con PointNet del modelo original.
- Resolución fija de contrato de 512×512, lo que obliga al host a reescalar la referencia y el objetivo y a recomponer el croma con la página original si se quiere conservar el detalle.
- No se ha establecido un presupuesto mínimo de memoria seguro; la difusión sigue siendo costosa en móvil o tableta.
- Conviene resolver el SHA de commit del repositorio antes de descargar y obtener todos los archivos desde esa revisión inmutable, sin mezclar paquetes ni contratos de distintas versiones.
- Licencia restrictiva: se distribuye bajo `manganinja-and-component-terms` (license: other), con términos específicos enlazados desde el README; hay que revisar las condiciones antes de cualquier uso comercial.
- Riesgo de colorización inconsistente o artefactos debidos a la ausencia de validación de calidad, especialmente con referencias poco representativas.
- Es un artefacto muy reciente y sin tracción: 0 descargas y 0 likes en el momento de la consulta.
- No se incluyen imágenes, credenciales ni bundle de aplicación; solo los paquetes, contratos y metadatos de conversión.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/VioletXF/manganinja-coreml
- Licencia (sección del README): https://huggingface.co/VioletXF/manganinja-coreml/blob/main/README.md#licensing
- Repositorio original MangaNinja (Ali-ViLab): https://github.com/ali-vilab/MangaNinjia
- Checkpoint original: https://huggingface.co/Johanan0528/MangaNinjia
