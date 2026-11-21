# WariHima/OsakanaIME

## Resumen

OsakanaIME es un sistema de conversión de entrada (IME, *Input Method Editor*) para japonés desarrollado por el usuario WariHima. No se trata de un modelo de lenguaje generativo al uso, sino de un pipeline híbrido que combina un clasificador basado en ModernBERT con un motor de conversión de diccionario heredado de Mozc (el motor de Google para japonés) y la librería Vibrato. Su función es tomar una secuencia de hiragana introducida por el usuario y decidir a qué representación convertirla: kanji, texto mixto con kanji o mantener la entrada original.

El componente central de IA es un modelo ModernBERT entrenado para una tarea de clasificación sobre candidatos de conversión. Para el entrenamiento se construyó un conjunto de datos a partir de Wikipedia en japonés (dataset `OmniAICreator/Japanese-Wikipedia-202506`), sustituyendo los kanji por sus lecturas en hiragana, y se combinaron diccionarios de conversión de Mozc y de la comunidad (mozcdic-ut). El sistema se integra con fcitx5 para su uso real como método de entrada en escritorio.

El repositorio tiene un tamaño de 1,2 GB y contiene pesos en formato ONNX y safetensors, lo que sugiere que el modelo está pensado para inferencia local ligera. La información publicada es muy escasa en cuanto a métricas, licencia e idiomas, y no se han publicado resultados de benchmarks.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | ModernBERT para clasificación (componente IA) + pipeline de diccionario Mozc/Vibrato |
| Parámetros totales | no disponible |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | japonés (implícito por el diseño; no declarado formalmente) |
| Licencia | no disponible |
| Formato de pesos | ONNX, safetensors |

## Arquitectura y entrenamiento

El sistema combina dos capas. La primera es un modelo ModernBERT configurado para una tarea de clasificación: recibe una frase en hiragana y decide entre varias clases de conversión (kanji, texto mixto con kanji, o la propia entrada sin cambios). La segunda capa es un motor de conversión basado en diccionario, construido a partir del diccionario de sistema de Mozc convertido a formato MeCab mediante `mecab-as-kkc`, y de los diccionarios comunitarios `mozcdic-ut`, gestionados con la librería `python-vibrato`. El autor menciona que el núcleo está escrito en Python y que existe la intención de migrarlo a C en el futuro.

El entrenamiento del clasificador se realizó con datos derivados de Wikipedia en japonés: se tomaron textos del dataset `OmniAICreator/Japanese-Wikipedia-202506`, se sustituyeron los kanji por sus lecturas en hiragana y se generaron pares de entrada y etiqueta de conversión. Además, se combinaron diccionarios UT para reunir lecturas con múltiples candidatos. No se documentan número de tokens de entrenamiento, composición exacta del dataset, ni si hubo ajuste por RLHF o DPO. Tampoco se detalla la innovación técnica del clasificador más allá del uso de ModernBERT para la tarea.

## Capacidades

- Conversión de texto en hiragana a kanji o a texto mixto con kanji, típica de un IME japonés.
- Clasificación de candidatos de conversión mediante un modelo ModernBERT.
- Integración con diccionarios de conversión de Mozc y de la comunidad (nombres propios, topónimos, neologismos, EDICT, SKK).
- Uso como método de entrada en escritorio mediante fcitx5.
- Inferencia local con pesos en ONNX y safetensors.
- No se documentan capacidades de generación de texto libre, razonamiento, código, matemáticas, visión, tool calling ni agentes. Es un sistema especializado en conversión de entrada, no un LLM generalista.
- Capacidades multilingües: no disponibles; el diseño está orientado al japonés.
- No se menciona un modo de razonamiento (*thinking mode*) ni soporte de audio.

## Casos de uso

- Escritura diaria en japonés en escritorio Linux: el sistema se integra con fcitx5 y permite convertir hiragana a kanji mientras se escribe, usando el clasificador para desambiguar candidatos.
- Desambiguación de lecturas ambiguas: cuando una lectura en hiragana tiene múltiples candidatos (por ejemplo, nombres propios o términos técnicos), el clasificador ModernBERT elige la conversión más probable según el contexto de la frase.
- Procesamiento de nombres propios y topónimos: gracias a los diccionarios `mozcdic-ut-personal-names` y `mozcdic-ut-place-names`, el sistema puede manejar entidades que no aparecen en diccionarios generales.
- Manejo de neologismos y vocabulario de actualidad: el diccionario `mozcdic-ut-neologd` aporta cobertura de términos recientes, útil en entornos de documentación técnica o redes sociales.
- Entrada de texto en aplicaciones de edición y terminal: al funcionar como IME a nivel de sistema, sirve para cualquier aplicación que acepte entrada de teclado en un escritorio Linux con fcitx5.
- Investigación y experimentación con IMEs basados en modelos: el código en Python y la combinación de ModernBERT con Vibrato sirven como base para prototipos de métodos de entrada neuronales en japonés.
- Despliegue local sin conexión: al usar pesos ONNX y un pipeline local, puede ejecutarse en máquinas sin acceso a servicios en la nube, algo relevante para privacidad en la escritura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 1,2 GB, pero no se especifica el tamaño del modelo ModernBERT ni el desglose entre pesos y diccionarios.
- GPU recomendadas: no disponibles. Al ser un clasificador ModernBERT, es probable que funcione en CPU, pero no se documenta.
- ¿Cabe en GPU de consumo? No se dispone de datos para confirmarlo; el tamaño del repo (1,2 GB) sugiere que podría caber en GPUs de consumo, pero es una inferencia no confirmada por el autor.
- Opciones de despliegue: el autor menciona una demo con Gradio y el uso mediante fcitx5; los formatos ONNX y safetensors permiten inferencia con ONNX Runtime y con librerías compatibles con safetensors. No se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Sistema | Tipo | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|
| OsakanaIME | IME híbrido (clasificador + diccionario) | ModernBERT + Mozc/Vibrato | no disponible | Hugging Face (repo de 1,2 GB) |
| Mozc | IME basado en diccionario y reglas | Motor de conversión de Google | BSD (según el proyecto Mozc) | Código abierto en GitHub |
| Anthy | IME basado en diccionario | Conversión estadística y de reglas | GPL | Código abierto |
| SKK | IME basado en diccionario | Conversión por diccionario SKK | GPL | Código abierto |

No se dispone de datos de rendimiento comparativo entre OsakanaIME y estos sistemas. La comparativa se limita a la categoría y el enfoque, no a métricas.

## Limitaciones y advertencias

- Información muy escasa: no se declaran licencia, idiomas soportados ni parámetros del modelo, lo que dificulta evaluar su uso comercial o su integración en producción.
- Es un sistema especializado en conversión de entrada en japonés; no es un modelo de lenguaje general y no debe usarse para generación de texto, razonamiento o código.
- El clasificador puede heredar sesgos de los datos de Wikipedia en japonés y de los diccionarios utilizados, lo que puede afectar a la conversión de términos poco representados.
- Riesgo de conversión incorrecta en contextos ambiguos o en textos muy especializados; el sistema depende en gran medida de la calidad de los diccionarios subyacentes.
- La licencia no está declarada; los diccionarios utilizados tienen licencias variadas (CC BY-SA, Apache 2.0, GPL v2 o posterior, dominio público), lo que puede condicionar la redistribución y el uso comercial del conjunto.
- El núcleo está escrito en Python y el autor indica que planea migrarlo a C; esto sugiere que el rendimiento y la madurez del proyecto pueden no ser óptimos para producción.
- No hay evidencia de pruebas a gran escala ni de métricas de calidad; el autor indica que lo usa personalmente, lo que no equivale a una validación robusta.
- No se documenta soporte multilingüe; su uso fuera del japonés no está garantizado.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/WariHima/OsakanaIME
- python-vibrato: https://github.com/daac-tools/python-vibrato
- mozcpy: https://github.com/ikegami-yukino/mozcpy
- mecab-as-kkc: https://github.com/ikegami-yukino/mecab-as-kkc
- Diccionario de sistema de Mozc: https://github.com/google/mozc/tree/master/src/data/dictionary_oss
- mozcdic-ut-jawiki: https://github.com/utuhiro78/mozcdic-ut-jawiki
- mozcdic-ut-edict2: https://github.com/utuhiro78/mozcdic-ut-edict2
- mozcdic-ut-personal-names: https://github.com/utuhiro78/mozcdic-ut-personal-names
- mozcdic-ut-sudachidict: https://github.com/utuhiro78/mozcdic-ut-sudachidict
- mozcdic-ut-place-names: https://github.com/utuhiro78/mozcdic-ut-place-names
- mozcdic-ut-neologd: https://github.com/utuhiro78/mozcdic-ut-neologd
- mozcdic-ut-skk-jisyo: https://github.com/utuhiro78/mozcdic-ut-skk-jisyo
- Dataset de Wikipedia en japonés: OmniAICreator/Japanese-Wikipedia-202506 (no se proporciona URL directa en la información disponible)
