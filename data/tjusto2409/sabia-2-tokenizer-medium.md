# tjusto2409/sabia-2-tokenizer-medium

## Resumen

Este repositorio aloja el tokenizer del modelo Sabiá-2 Medium, un gran modelo de lenguaje propietario desarrollado por la empresa brasileña Maritaca AI. El modelo Sabiá-2 está entrenado específicamente con textos en portugués y se distribuye mediante una API comercial denominada MariTalk, además de una versión local cifrada llamada MariTalk Local. El tokenizer se publica de forma separada para que los desarrolladores puedan estimar el número de tokens de sus prompts y, por tanto, el coste de uso de la API.

El tokenizer es un componente de preprocesamiento que convierte texto en secuencias de tokens numéricos, y no un modelo generativo en sí mismo. Su utilidad principal es práctica: permite calcular el consumo de tokens antes de realizar llamadas a la API, algo esencial para presupuestar costes en aplicaciones de producción. El repositorio original pertenece a Maritaca AI (`maritaca-ai/sabia-2-tokenizer-medium`), aunque esta ficha se basa en una copia alojada en el perfil de `tjusto2409` con el mismo contenido.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Tokenizer de tipo BPE (probablemente, no confirmado) |
| Parametros totales | no disponible (tokenizer, no modelo de lenguaje) |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible (depende del modelo Sabiá-2 Medium) |
| Tipos de cuantizacion | no aplicable (no es un modelo de pesos) |
| Idiomas soportados | portugues (principal) y otros idiomas del modelo Sabiá-2 |
| Licencia | no disponible |
| Formato de pesos | no aplicable (es un tokenizer, se carga via `AutoTokenizer`) |

## Arquitectura y entrenamiento

El tokenizer está diseñado para ser utilizado con la librería Hugging Face Transformers, mediante `AutoTokenizer.from_pretrained()`. Su arquitectura interna no se documenta en la información proporcionada; por la práctica común en modelos de la familia Sabiá-2, es probable que se trate de un tokenizer basado en BPE (Byte Pair Encoding), pero no se confirma explícitamente. El tokenizer se entrena sobre los mismos datos de texto en portugués que el modelo Sabiá-2 Medium, que según el paper técnico (arXiv:2403.09887) se especializa en textos brasileños y se evalúa en exámenes de acceso a universidades, certificaciones profesionales y exámenes de posgrado en diversas disciplinas.

El modelo Sabiá-2 Medium, al que sirve este tokenizer, es un LLM propietario que se ofrece a través de la API MariTalk y en una versión local cifrada. El paper destaca que la especialización en portugués permite ofrecer el modelo a un precio por token diez veces inferior al de GPT-4, aunque también señala que las capacidades de matemáticas y código son áreas de mejora.

## Capacidades

- Tokenización de texto en portugués y posiblemente otros idiomas, devolviendo secuencias de tokens numéricos.
- Estimación del número de tokens en un prompt, lo que permite calcular costes de uso de la API MariTalk.
- Integración sencilla con Python mediante la librería Transformers.
- No incluye capacidades de generación de texto, razonamiento, código, visión ni tool calling, al ser únicamente un tokenizer.

## Casos de uso

- Estimación de costes de API: un desarrollador puede calcular cuántos tokens consume un prompt antes de enviarlo a MariTalk, ajustando el presupuesto y optimizando la longitud del texto.
- Planificación de prompts largos: para aplicaciones con contexto extenso, el tokenizer permite verificar que el prompt no supera el límite de tokens del modelo Sabiá-2 Medium.
- Desarrollo de aplicaciones de chat: integrar el tokenizer en el flujo de una aplicación para contar tokens en tiempo real y mostrar al usuario el coste estimado de cada mensaje.
- Evaluación de datasets: al preparar datos de entrenamiento o evaluación en portugués, el tokenizer permite medir la longitud de los textos en tokens para normalizar los lotes.
- Optimización de respuestas: si se usa MariTalk Local, el tokenizer ayuda a reducir el número de tokens de salida y, por tanto, el tiempo de inferencia.
- Documentación y pruebas: generar ejemplos de tokenización para verificar que el modelo maneja correctamente textos en portugués, incluyendo acentos y caracteres especiales.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El tokenizer no tiene métricas de rendimiento propias; el paper técnico de Sabiá-2 (arXiv:2403.09887) evalúa el modelo completo, pero no se incluyen datos específicos del tokenizer.

## Requisitos de hardware

- Un tokenizer de Hugging Face Transformers requiere recursos mínimos: funciona en CPU con menos de 1 GB de RAM.
- No necesita GPU para la tokenización; el coste computacional es despreciable frente al del modelo de lenguaje.
- Para el modelo Sabiá-2 Medium en sí, no se proporcionan requisitos de hardware en la información disponible; la versión local (MariTalk Local) está cifrada y se ejecuta localmente, pero no se especifican las GPU recomendadas.
- El despliegue se limita a cargar el tokenizer con `AutoTokenizer.from_pretrained()` en cualquier entorno Python.

## Comparativa con modelos similares

No se dispone de datos comparativos de tokenizers de otros modelos en la información proporcionada. Se puede indicar que, como tokenizer de un modelo propietario en portugués, no es comparable directamente con tokenizers de modelos abiertos como LLaMA o Mistral, que están optimizados para inglés y otros idiomas. El paper de Sabiá-2 menciona que el modelo Medium es diez veces más barato que GPT-4 por token, lo que sugiere que el tokenizer está optimizado para eficiencia en portugués, pero no hay métricas públicas.

## Limitaciones y advertencias

- El tokenizer es un componente auxiliar y no puede generar texto ni realizar tareas de razonamiento; solo convierte texto a tokens.
- La licencia del tokenizer no está especificada, por lo que no se garantiza su uso comercial o redistribución sin revisar los términos de Maritaca AI.
- El tokenizer está pensado para el modelo Sabiá-2 Medium; su uso con otros modelos puede producir resultados inconsistentes.
- El modelo Sabiá-2 Medium es propietario y su acceso se realiza mediante API o versión local cifrada; el tokenizer no permite acceder a los pesos del modelo.
- No se han documentado sesgos específicos del tokenizer, pero al estar entrenado en textos en portugués, puede tener un rendimiento subóptimo en otros idiomas.
- El paper indica que las capacidades de matemáticas y código del modelo Sabiá-2 son limitadas, lo que puede afectar a aplicaciones que dependan de estas áreas.

## Enlaces

- Repositorio de Hugging Face del tokenizer: [https://huggingface.co/tjusto2409/sabia-2-tokenizer-medium](https://huggingface.co/tjusto2409/sabia-2-tokenizer-medium)
- Repositorio oficial de Maritaca AI: [https://huggingface.co/maritaca-ai/sabia-2-tokenizer-medium](https://huggingface.co/maritaca-ai/sabia-2-tokenizer-medium)
- Documentación de la API MariTalk: [https://maritaca-ai.github.io/maritalk-api/maritalk.html](https://maritaca-ai.github.io/maritalk-api/maritalk.html)
- Paper técnico de Sabiá-2: [https://arxiv.org/abs/2403.09887](https://arxiv.org/abs/2403.09887)
