# SymbolicLight-AGI/SymbolicLight-PoC

## Resumen

SymbolicLight-PoC es una prueba de concepto histórica de un modelo de lenguaje basado en redes neuronales de picos (SNN), publicada por el grupo SymbolicLight-AGI. Se trata de un snapshot de inferencia de una arquitectura temprana que combina un codificador de picos, un prototipo de memoria asociativa ternaria dispersa (SparseTCAM), un bloque feed-forward con actividad neuronal pulsada y una señal opcional de salida por entropía. El checkpoint liberado contiene aproximadamente 129,4 millones de parámetros entrenables y está pensado para inspección de código, inferencia local y validación básica, no como implementación de producción.

El modelo se distribuye bajo licencia Apache 2.0 y su repositorio incluye únicamente la definición del modelo en modo forward, un script de generación de texto por línea de comandos, un validador sobre TinyStories y una demo web con Gradio. No se incluyen scripts de entrenamiento, datos de entrenamiento ni el optimizador. Es relevante ahora porque documenta un enfoque experimental de SNN aplicado a lenguaje, aunque el propio autor advierte que no corresponde a la implementación actual del paper V1, que se publica por separado con tamaños de 194M y 0,8B.

La arquitectura se implementa con operaciones estándar de PyTorch, lo que facilita su estudio y ejecución en hardware convencional. No se especifican la longitud de contexto, el número de tokens de entrenamiento ni los idiomas soportados, más allá de la validación en inglés con TinyStories.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Red neuronal de picos (SNN) con codificador de picos, prototipo SparseTCAM, bloque feed-forward con picos y salida con prior de token aprendido |
| Parametros totales | 129,4 millones (entrenables) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | No especificado (README en ingles y chino; validacion con TinyStories en ingles) |
| Licencia | Apache 2.0 |
| Formato de pesos | Checkpoint PyTorch (.pt) |

## Arquitectura y entrenamiento

La arquitectura de SymbolicLight-PoC combina varios componentes experimentales: un codificador de picos que transforma las secuencias de entrada en representaciones temporales discretas, un prototipo de memoria asociativa ternaria dispersa (SparseTCAM) que acumula contexto de forma acumulativa, un bloque feed-forward con actividad neuronal pulsada y una señal de salida por entropía que permite una terminación anticipada opcional. La salida final se obtiene mediante una proyección que incorpora un prior sobre tokens aprendido durante el entrenamiento. Todo el modelo se define con operaciones estándar de PyTorch y está diseñado exclusivamente para inferencia.

No se dispone de información sobre el proceso de entrenamiento: el repositorio excluye explícitamente los scripts de entrenamiento, el estado del optimizador, los datos utilizados y cualquier log. La única referencia a datos es la validación sobre el conjunto TinyStories, que se utiliza en `validate.py` para medir la perplejidad o métricas similares, aunque no se publican resultados numéricos. El checkpoint liberado es una versión limpia que contiene solo el modelo y su configuración, verificada mediante suma de comprobación SHA256.

## Capacidades

- Generación de texto autoregresiva básica, demostrada con el script `generate.py` que acepta un prompt y produce continuaciones.
- Inferencia local en PyTorch sin dependencias adicionales más allá de `torch`, `tiktoken`, `datasets` y `gradio`.
- Validación de perplejidad o métricas de lenguaje sobre el conjunto TinyStories, lo que permite comprobar el comportamiento del modelo en textos narrativos simples en inglés.
- Demo web local mediante Gradio, accesible en `http://127.0.0.1:7870`, útil para pruebas interactivas rápidas.
- No se documenta soporte para tool calling, agentes, razonamiento multi-paso, visión, audio ni modos de pensamiento explícitos.
- La naturaleza de SNN implica una representación temporal de la información, pero no se detallan ventajas prácticas frente a transformadores convencionales en esta versión PoC.

## Casos de uso

- Investigación académica sobre SNN aplicadas al lenguaje: el modelo permite inspeccionar el código de una arquitectura de picos para lenguaje y reproducir experimentos básicos de generación de texto, sirviendo como referencia para estudios comparativos.
- Educación en arquitecturas neuromórficas: los ficheros `src/model.py` y `src/generate.py` son legibles y autocontenidos, lo que facilita su uso en cursos o talleres sobre redes neuronales de picos y sus aplicaciones en NLP.
- Prototipado rápido de demos locales: la demo Gradio integrada permite probar el comportamiento del modelo sin necesidad de configurar infraestructura compleja, ideal para validar hipótesis sobre la generación de texto con SNN.
- Verificación de compatibilidad de checkpoints: el repositorio incluye un procedimiento de verificación de integridad (checksums) y un documento de verificación de inferencia, útil para desarrolladores que trabajan con formatos de pesos no estándar.
- Estudio de mecanismos de salida por entropía: la señal de exit opcional puede analizarse como un mecanismo de parada temprana en generación, un tema de interés para optimizar latencia en modelos pequeños.
- Benchmarking de eficiencia energética (teórico): aunque no se proporcionan mediciones, la arquitectura SNN sugiere un consumo energético potencialmente menor que los transformadores densos, lo que puede motivar experimentos de perfilado energético en hardware convencional.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El único dato de evaluación es la validación sobre TinyStories, pero no se ofrecen métricas numéricas (perplejidad, accuracy, etc.) en la model card ni en el repositorio. No se puede comparar cuantitativamente con otros modelos.

## Requisitos de hardware

- Dado que el modelo tiene aproximadamente 129,4 millones de parámetros, su footprint en memoria es reducido: en precisión fp32 ocuparía unos 518 MB, y en fp16 unos 259 MB, más overhead de activaciones y optimizador (no aplicable en inferencia).
- Puede ejecutarse en GPUs de consumo como una RTX 3060, RTX 4060 o incluso en CPU, aunque la latencia dependerá de la implementación y de la longitud de la secuencia.
- No se especifican requisitos mínimos de VRAM ni recomendaciones de GPU concretas en la documentación.
- El script de generación usa PyTorch estándar, por lo que es compatible con cualquier entorno que tenga instalado PyTorch (CPU o CUDA).
- No se mencionan opciones de despliegue optimizadas como vLLM, llama.cpp u Ollama; el modelo se distribuye como checkpoint PyTorch y se ejecuta mediante los scripts incluidos.
- No hay datos de latencia ni throughput medidos.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables. Al tratarse de una arquitectura SNN experimental y un PoC histórico, no existen alternativas directas en el ecosistema de modelos de lenguaje convencionales con los que se pueda comparar de forma justa. El propio autor remite a la versión V1 actual (194M y 0,8B) para una implementación más reciente, pero no se proporcionan métricas comparativas.

## Limitaciones y advertencias

- Es una prueba de concepto histórica, no una implementación de producción: el autor lo indica explícitamente y remite a la versión V1 para uso real.
- No se incluye el código de entrenamiento ni los datos, por lo que no es posible reproducir el entrenamiento ni ajustar el modelo con nuevas tareas.
- El modelo puede presentar alucinaciones y errores de generación, especialmente fuera del dominio de TinyStories (texto narrativo infantil en inglés).
- No se especifica la longitud máxima de contexto; es probable que sea limitada debido a la arquitectura SNN y al tamaño del modelo.
- La licencia Apache 2.0 permite uso comercial, pero el modelo no está diseñado para entornos productivos y carece de garantías de robustez o seguridad.
- No se proporcionan instrucciones sobre cómo manejar sesgos o filtros de contenido; el modelo podría generar texto inapropiado si se usa sin supervisión.
- Se recomienda verificar la integridad del checkpoint mediante el checksum SHA256 antes de cargarlo, y solo descargarlo desde fuentes de confianza.

## Enlaces

- [Hugging Face - SymbolicLight-PoC](https://huggingface.co/SymbolicLight-AGI/SymbolicLight-PoC)
- [GitHub - SymbolicLight V1 (versión actual)](https://github.com/SymbolicLight-AGI/SymbolicLight-V1)
- [README en chino (en el repositorio de Hugging Face)](https://huggingface.co/SymbolicLight-AGI/SymbolicLight-PoC/blob/main/README_zh-CN.md)
