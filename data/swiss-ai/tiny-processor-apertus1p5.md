# swiss-ai/tiny-processor-apertus1p5

## Resumen

`swiss-ai/tiny-processor-apertus1p5` es un checkpoint de propósito exclusivamente instrumental publicado por Swiss AI (swiss-ai) en Hugging Face. No se trata de un modelo de lenguaje utilizable, sino de un artefacto de test que contiene únicamente los ficheros de procesamiento (procesador de imagen, extractor de características y plantilla de chat) de la familia Apertus 1.5, empaquetados con un tokenizador reducido para que las pruebas de integración continua (CI) del proyecto Transformers se ejecuten con rapidez. Su etiqueta `test-fixture` en los tags de Hugging Face confirma esta naturaleza: es infraestructura de pruebas, no un modelo desplegable.

El checkpoint se construyó a partir de los ficheros de procesador de `swiss-ai/Apertus-v1.5-8B` en la revisión `3b9f74b85572c52584f53c8bc56639d4516fcc12`, y reproduce fielmente el `processor_config.json` (procesador de imagen y extractor de características WavTokenizer, incluida la normalización de pico a -3 dBFS) y la plantilla `chat_template.jinja` de los checkpoints completos. La diferencia fundamental es que no incluye pesos de modelo, por lo que no puede realizar inferencia de ningún tipo.

Su relevancia es metodológica: permite validar la implementación `Apertus1p5Processor` de Transformers mediante el identificador `tiny_model_id` en `tests/models/apertus1p5/test_processing_apertus1p5.py`, ejercitando el procesador de imagen, el extractor de características y la plantilla de chat reales con un tokenizador de 656 tokens totales (520 de vocabulario BPE), frente a los 266.440 tokens de los checkpoints completos. Para quienes desarrollan o auditan integraciones multimodales de Apertus 1.5, este artefacto documenta con precisión el diseño del espacio de tokens del modelo real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | No aplica (checkpoint solo de procesador; sin pesos de modelo) |
| Parametros totales | Ninguno (el autor indica explícitamente "no model weights") |
| Parametros activos | No aplica |
| Longitud de contexto | No disponible (depende del checkpoint completo, no de este artefacto) |
| Tipos de cuantizacion | No aplica (no hay pesos que cuantizar) |
| Idiomas soportados | No disponible (la model card no declara lista de idiomas) |
| Licencia | Apache 2.0 |
| Formato de pesos | No hay pesos; se distribuyen `processor_config.json`, `chat_template.jinja`, `config.json`, `generation_config.json`, `tokenizer.json` y `tokenizer_config.json` |

## Arquitectura y entrenamiento

Este checkpoint no contiene arquitectura de red ni proceso de entrenamiento: es un conjunto de ficheros de configuración y tokenización. El `tokenizer.json` conserva el normalizador, pre-tokenizador, decodificador y post-procesador del tokenizador completo, pero con un vocabulario recortado a 520 entradas BPE (ids 0 a 519), 20 tokens especiales y añadidos de texto, 8 tokens estructurales de imagen y audio (ids 520 a 527), 64 códigos de imagen `<|visual token N|>` (ids 528 a 591) y 64 códigos de audio `<|audio token N|>` (ids 592 a 655). El diseño del espacio de tokens refleja el del tokenizador completo: primero especiales, luego vocabulario BPE, y después tokens estructurales, códigos visuales y códigos de audio como tokens añadidos.

El `config.json` y el `generation_config.json` se copiaron sin modificar del checkpoint de 8B como referencia, pero sus desplazamientos de token apuntan al vocabulario completo, no al de este tokenizador reducido; el `tokenizer_config.json` conserva solo las claves estándar y omite las claves de pipeline propietarias de swiss-ai (`omnimodal_config`, `sft_*`, etc.) porque contienen identificadores del vocabulario completo. Como consecuencia, el texto se fragmenta en más tokens y más cortos: `"Hello world!"` produce 9 tokens en lugar de 3. El `tokenizer.json` ocupa 53 KB frente a los 44 MB del completo.

## Capacidades

- No genera texto, no razona, no produce código ni resuelve problemas matemáticos: carece de pesos.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso.
- No tiene capacidades multilingües propias más allá de la tokenización de prueba.
- No incorpora visión ni audio reales: solo incluye los tokens estructurales y los códigos de imagen y audio necesarios para validar el formateo.
- Su función real es servir de fixture de CI para el procesador multimodal `Apertus1p5Processor` de Transformers.
- Permite validar la plantilla de chat, la normalización de pico a -3 dBFS del extractor WavTokenizer y el troceado de tokens de imagen y audio.

## Casos de uso

- Pruebas de integración continua en Transformers: se carga mediante `tiny_model_id` en `tests/models/apertus1p5/test_processing_apertus1p5.py` para ejecutar el procesador de imagen, el extractor de características y la plantilla de chat reales con un tokenizador de 656 tokens, reduciendo el tiempo de CI frente a usar el checkpoint de 8B.
- Validación de plantillas de chat: permite comprobar que `chat_template.jinja`, idéntica a la de los checkpoints completos, renderiza correctamente conversaciones multimodales sin cargar pesos.
- Verificación de la tokenización de imágenes: los 64 códigos `<|visual token N|>` (ids 528 a 591) permiten probar el formateo y el parseo de secuencias visuales en pipelines de preprocesado.
- Pruebas de audio: el extractor WavTokenizer con normalización de pico a -3 dBFS y los 64 códigos `<|audio token N|>` (ids 592 a 655) sirven para testear el preprocesado de audio en entornos de CI.
- Desarrollo de herramientas de inspección de tokenizadores: útil para comparar el diseño del espacio de tokens del tokenizador completo (266.440 tokens) con uno reducido y detectar regresiones en normalizador, pre-tokenizador o decodificador.
- Docencia y reproducción de tests: permite a terceros reproducir localmente las pruebas del procesador Apertus 1.5 sin descargar checkpoints de 8B o 70B ni requerir GPU.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia: no aplica; el checkpoint no contiene pesos y no puede ejecutar inferencia.
- GPU recomendadas: ninguna; las pruebas de procesador son puramente de CPU.
- Compatibilidad con GPU de consumo: irrelevante, al no haber cómputo de red neuronal.
- Despliegue: no procede con vLLM, llama.cpp, Ollama ni TGI; se usa exclusivamente mediante la librería `transformers` en el contexto de tests.
- Latencia y throughput: no disponibles; el coste se limita a la carga de ficheros de configuración y tokenización de 53 KB.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Pesos | Licencia | Uso previsto |
|---|---|---|---|---|---|
| `swiss-ai/tiny-processor-apertus1p5` | Ninguno | No disponible | No | Apache 2.0 | Fixture de CI para el procesador Apertus 1.5 |
| `swiss-ai/Apertus-v1.5-8B` | 8B | No disponible | Sí | No disponible en la informacion proporcionada | Inferencia multimodal real |
| `swiss-ai/Apertus-v1.5-70B` | 70B | No disponible | Sí | No disponible en la informacion proporcionada | Inferencia multimodal real a mayor escala |

Los checkpoints de 8B y 70B comparten el mismo procesador que este artefacto, por lo que la comparación relevante es de naturaleza, no de rendimiento: este checkpoint sirve para validar el procesador, mientras que los otros dos son los modelos utilizables.

## Limitaciones y advertencias

- No es un modelo: no puede generar texto, responder preguntas ni procesar entradas reales de imagen o audio.
- Los identificadores de token difieren de los checkpoints completos; cualquier código que asuma el vocabulario de 266.440 tokens fallará.
- `config.json` y `generation_config.json` contienen desplazamientos de token referidos al vocabulario completo y no son coherentes con el tokenizador reducido; no deben usarse como referencia para inferencia.
- El texto se fragmenta en más tokens y más cortos (`"Hello world!"` son 9 tokens en lugar de 3), lo que invalida comparaciones directas de longitud de secuencia con el modelo real.
- La licencia Apache 2.0 permite uso comercial del artefacto, pero al no contener pesos su valor comercial es nulo fuera del desarrollo y las pruebas.
- No se declaran sesgos ni riesgos de alucinación porque no hay generación de texto; cualquier evaluación de sesgos debe realizarse sobre los checkpoints de 8B o 70B.
- La model card no especifica idiomas soportados ni longitud de contexto; esos datos deben consultarse en los checkpoints completos.

## Enlaces

- Hugging Face: https://huggingface.co/swiss-ai/tiny-processor-apertus1p5
- Checkpoint completo de 8B: https://huggingface.co/swiss-ai/Apertus-v1.5-8B
- Checkpoint completo de 70B: https://huggingface.co/swiss-ai/Apertus-v1.5-70B
- Revisión de origen del procesador: `3b9f74b85572c52584f53c8bc56639d4516fcc12` (en el repositorio de 8B)
- Test de referencia en Transformers: `tests/models/apertus1p5/test_processing_apertus1p5.py`
