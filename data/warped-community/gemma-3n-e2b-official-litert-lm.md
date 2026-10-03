# warped-community/gemma-3n-E2B-official-litert-lm

## Resumen

`warped-community/gemma-3n-E2B-official-litert-lm` es un espejo del modelo `google/gemma-3n-E2B-it-litert-lm`, mantenido por la comunidad Warped para su aplicación Android. No se trata de un modelo entrenado desde cero, sino de una redistribucion del fichero `gemma-3n-E2B-it-int4.litertlm` en formato LiteRT-LM (el runtime de inferencia en dispositivo de Google), listo para ejecutarse en moviles sin conexion. El repositorio ocupa 3,7 GB y contiene una unica variante cuantizada a int4.

El modelo subyacente es Gemma 3n E2B, la variante pequena de la familia Gemma 3n de Google, disenada para inferencia en el borde (edge) con un presupuesto de computo efectivo de aproximadamente 2 000 millones de parametros sobre un total de en torno a 5 000 millones. Su interes radica en que combina entrada de texto, imagen y audio en un unico modelo que cabe en un telefono de gama alta, algo poco habitual en modelos multimodales abiertos.

Para un desarrollador, la relevancia de este repositorio es practica: evita tener que convertir el checkpoint original al formato LiteRT-LM, ya que el artefacto se distribuye ya compilado y cuantizado. La contrapartida es que no aporta documentacion tecnica propia (no incluye benchmarks, idiomas ni especificaciones completas en su model card) y que su mantenimiento depende de un tercero, no de Google.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con MatFormer (Matryoshka Transformer), embeddings por capa (PLE) y carga condicional de parametros; encoders de vision y audio integrados (datos del modelo base Gemma 3n, no confirmados en este repositorio) |
| Parametros totales | Aproximadamente 5 000 millones en el modelo base Gemma 3n E2B (dato upstream); no confirmado en la informacion del repositorio |
| Parametros activos | No aplica: no es un modelo MoE. Opera con unos 2 000 millones de parametros efectivos mediante carga condicional de parametros (de ahi la denominacion E2B) |
| Longitud de contexto | 32 768 tokens en el modelo base Gemma 3n (dato upstream); no confirmado en la informacion del repositorio |
| Tipos de cuantizacion | Una unica variante int4 en formato LiteRT-LM (`gemma-3n-E2B-it-int4.litertlm`); el modelo base ofrece otras cuantizaciones fuera de este repositorio |
| Idiomas soportados | No disponible en la model card del repositorio; el modelo base Gemma 3n declara soporte para 140 idiomas |
| Licencia | Gemma (terminos de uso de Gemma de Google) |
| Formato de pesos | `.litertlm` (LiteRT-LM); tamano del repositorio: 3,7 GB |

## Arquitectura y entrenamiento

El checkpoint distribuido aqui es una conversion del modelo instructivo `google/gemma-3n-E2B-it` al formato LiteRT-LM con cuantizacion int4. La arquitectura del modelo base es un transformer con atencion estandar sobre el que Google aplica dos innovaciones orientadas a reducir el coste de inferencia en dispositivo: MatFormer, que permite extraer subredes de menor tamano del mismo entrenamiento, y Per-Layer Embeddings (PLE), que mueve grandes tablas de embeddings fuera del calculo por token. A esto se suma la carga condicional de parametros, que hace que en cada paso solo se materialicen los bloques necesarios, de ahi la distincion entre parametros totales y parametros efectivos.

El modelo es multimodal nativo: incorpora un encoder de vision y un encoder de audio para aceptar imagenes y audio ademas de texto. La cuantizacion int4 que se distribuye en este repositorio es la que Google publica para uso movil, y no existe en la informacion disponible ninguna indicacion sobre reentrenamiento, ajuste fino adicional o modificacion de pesos por parte de `warped-community`; por todo lo anterior, la composicion exacta del dataset de entrenamiento, el numero de tokens vistos y el uso de RLHF o DPO no estan disponibles.

## Capacidades

- Generacion de texto y dialogo conversacional multi-turno en modo instructivo.
- Comprension de imagenes (descripcion, extraccion de informacion, respuesta a preguntas sobre una foto) mediante el encoder de vision del modelo base.
- Procesamiento de audio, incluyendo entrada de voz, gracias al encoder de audio integrado.
- Cobertura multilingue amplia heredada del modelo base (140 idiomas declarados por Google para Gemma 3n); el repositorio no detalla idiomas concretos.
- Razonamiento basico y tareas de conocimiento general, limitado por el presupuesto efectivo de 2B de parametros.
- Ejecucion completamente local y sin conexion a traves del runtime LiteRT-LM, con aceleracion por GPU o NPU del dispositivo.
- Soporte de function calling: no confirmado en la informacion proporcionada para esta conversion concreta.
- Modo de razonamiento extendido (thinking) o generacion especulativa: no disponible en la informacion proporcionada.

## Casos de uso

- Asistentes moviles sin conexion: integracion del fichero `.litertlm` en una app Android para responder consultas del usuario sin enviar datos a la nube, aprovechando que el modelo ya esta compilado para el runtime LiteRT-LM.
- Descripcion y etiquetado de imagenes en el dispositivo: util en aplicaciones de accesibilidad (lectura de escenas para personas con discapacidad visual) o de organizacion de fotos, donde el coste de subir cada imagen a un servidor es prohibitivo.
- Transcripcion y resumen de notas de voz: el encoder de audio permite procesar grabaciones cortas y devolver un resumen textual sin salir del telefono, lo que simplifica el cumplimiento de normativas de privacidad.
- Traduccion y asistencia de escritura multilingue en movilidad: con la cobertura de idiomas del modelo base, se puede ofrecer correccion y traduccion de mensajes en una app de mensajeria sin coste de API por token.
- Respuestas sobre documentos locales: combinado con un pipeline de recuperacion (RAG) sobre ficheros del dispositivo, el modelo puede responder preguntas sobre manuales o contratos dentro del limite de contexto disponible.
- Filtrado y moderacion de contenido en el borde: clasificacion previa de texto o imagenes generadas por el usuario antes de subirlas a un servicio, reduciendo trafico y coste de backend.
- Demostraciones y prototipos de IA generativa en ferias o entornos sin red, donde no se puede depender de una API externa.
- Evaluacion comparativa de cuantizacion: este repositorio sirve como referencia int4 frente a otras cuantizaciones del mismo modelo base para medir la perdida de calidad en tareas concretas.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

Ni la model card del repositorio ni los resultados de busqueda web proporcionados incluyen cifras de MMLU, HumanEval, GSM8K, MMMU ni de evaluaciones multimodales para esta conversion. Cualquier comparacion cuantitativa con otras cuantizaciones o con el checkpoint original exigiria ejecutar la evaluacion de forma local, teniendo en cuenta que la cuantizacion int4 introduce una degradacion que no esta documentada en este repositorio.

## Requisitos de hardware

- Peso de los parametros: 3,7 GB en disco para la variante int4 distribuida en este repositorio.
- Memoria de trabajo estimada: en torno a 5-6 GB de RAM libre en el dispositivo para cargar pesos, cache KV y buffers del runtime, suponiendo el contexto completo; la cifra exacta no esta documentada y depende del backend de ejecucion.
- Dispositivos objetivo: telefonos Android de gama alta recientes con al menos 8 GB de RAM; el runtime LiteRT-LM esta disenado especificamente para este escenario.
- Aceleracion: LiteRT-LM puede usar la GPU o la NPU del SoC (por ejemplo, chips Tensor de Google o Snapdragon de Qualcomm) mediante delegados, reduciendo latencia y consumo frente a CPU.
- GPU de escritorio: no aplica de forma directa; este artefacto no es un GGUF ni un safetensors y no se carga en llama.cpp, vLLM o TGI en su formato actual. Para esos motores habria que usar el checkpoint original `google/gemma-3n-E2B-it`.
- Opciones de despliegue: LiteRT-LM (Android, y variantes de escritorio y embebido soportadas por el runtime) es la via natural; Ollama, llama.cpp y vLLM quedan fuera de alcance salvo conversion previa del modelo base.
- Latencia y throughput: no disponibles. Dependen por completo del SoC, del delegado usado (CPU, GPU o NPU) y de la longitud de contexto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Modalidades | Licencia | Formato de despliegue | Orientacion |
|---|---|---|---|---|---|---|
| gemma-3n-E2B-official-litert-lm (este repositorio) | ~5B totales / ~2B efectivos (dato upstream) | 32 768 tokens (dato upstream) | Texto, imagen, audio | Gemma | `.litertlm` int4 | Inferencia en movil y borde |
| Gemma 3n E4B (Google) | ~8B totales / ~4B efectivos (dato upstream) | 32 768 tokens (dato upstream) | Texto, imagen, audio | Gemma | LiteRT-LM, GGUF, safetensors | Mayor calidad a cambio de mas memoria |
| Llama 3.2 3B Instruct (Meta) | 3 200 millones | 128 000 tokens | Texto, imagen (variante 11B) | Llama 3.2 Community | GGUF, safetensors | Borde y servidor ligero |
| Qwen2.5 3B Instruct (Alibaba) | 3 090 millones | 32 768 tokens (ampliable con YaRN) | Texto | Apache 2.0 | GGUF, safetensors | Servidor ligero y borde |

Los datos de los modelos de comparacion proceden del conocimiento general de sus especificaciones publicas y no de la informacion proporcionada en esta busqueda; conviene verificarlos en sus respectivas model cards antes de tomar decisiones de despliegue.

## Limitaciones y advertencias

- No es un modelo propio: es una redistribucion del checkpoint oficial de Google. Cualquier error de conversion o de empaquetado en formato LiteRT-LM es responsabilidad del mantenedor comunitario, no de Google.
- Cuantizacion int4: introduce perdida de precision respecto al modelo en punto flotante, especialmente en tareas de razonamiento, matematicas y generacion de codigo. No hay mediciones publicadas de esa degradacion para este artefacto.
- Ausencia total de benchmarks: no se puede afirmar su rendimiento relativo sin evaluarlo localmente.
- Model card minima: no declara idiomas soportados, licencia de uso comercial especifica ni limitaciones propias; hay que remitirse a los terminos de Gemma.
- Licencia Gemma: permite uso comercial con condiciones (requisitos de atribucion y cumplimiento de la politica de uso prohibido de Google). Es obligatorio revisar los terminos antes de integrarlo en un producto.
- Riesgo de alucinacion: inherente a un modelo de ~2B de parametros efectivos; no es adecuado como fuente de verdad en dominios medicos, legales o financieros sin verificacion humana.
- Ventana de contexto limitada frente a alternativas de servidor (32 768 tokens en el modelo base), lo que restringe tareas de resumen de documentos largos.
- Capacidades multimodales mas limitadas que las de modelos de mayor tamano: en imagen y audio conviene validar la calidad con casos reales antes de desplegar.
- En este formato `.litertlm` no se puede usar directamente con vLLM, TGI, Ollama o llama.cpp, lo que limita las opciones de despliegue en servidor.
- El repositorio no registra descargas ni interacciones, por lo que no hay senales de validacion por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/warped-community/gemma-3n-E2B-official-litert-lm
- Fuente original del artefacto LiteRT-LM: https://huggingface.co/google/gemma-3n-E2B-it-litert-lm
- Modelo base instructivo: https://huggingface.co/google/gemma-3n-E2B-it
- Documentacion oficial de Gemma: https://ai.google.dev/gemma/docs
- Terminos de uso de Gemma: https://ai.google.dev/gemma/terms
- Runtime LiteRT-LM: https://github.com/google-ai-edge/LiteRT-LM

Nota: los resultados de busqueda web facilitados no contienen documentacion especifica sobre este repositorio ni sobre Gemma 3n E2B; las referencias encontradas tratan de otras versiones de la familia Gemma y no se han incluido por no ser aplicables.
