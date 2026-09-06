# StarpowerTechnology/WVY-Architecture

## Resumen

WVY es una implementación en PyTorch de un modelo de lenguaje causal híbrido que combina mixers recurrentes gated-delta con atención grouped-query. Desarrollado por StarpowerTechnology, el repositorio publica la arquitectura, las utilidades de entrenamiento y los tests, pero no incluye pesos entrenados, configuración guardada ni tokenizer. Al instanciar un modelo desde los perfiles de configuración, se inicializan pesos nuevos de forma aleatoria.

La propuesta técnica central es un stack de decodificador compartido que se ejecuta varias veces (por defecto dos pasadas), con un embedding aprendido que identifica cada pasada. Esto permite aplicar un número mayor de capas efectivas sin duplicar parámetros. El repositorio define perfiles de tamaño de aproximadamente 5M, 45M, 110M y 300M parámetros únicos, con una longitud de contexto por defecto de 4096 tokens. No se han publicado benchmarks de calidad, por lo que el valor actual es arquitectónico y de investigación.

## Especificaciones tecnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Híbrida: mixers recurrentes gated-delta + atención grouped-query con stack de decodificador compartido |
| Parametros totales | No disponible (no hay pesos entrenados; perfiles de 4.94M a 302.10M parámetros únicos aproximados) |
| Parametros activos | No aplicable (no es un modelo MoE) |
| Longitud de contexto | 4096 tokens (max_position_embeddings por defecto; no validado como contexto largo) |
| Tipos de cuantizacion | No disponible |
| Idiomas soportados | Inglés (en) |
| Licencia | MIT |
| Formato de pesos | No disponible (no se incluyen pesos; es una implementación de código PyTorch) |

## Arquitectura y entrenamiento

La arquitectura procesa los tokens a través de un stack de capas de decodificador que se repite `num_loops` veces. En cada pasada se añade un embedding de bucle aprendido, y cada capa aplica pre-normalización RMS con dos residuales: uno alrededor de su mixer y otro alrededor de una red feed-forward SwiGLU. La agenda por defecto para ocho capas únicas es: `gated_delta, gated_delta, attention, gated_delta, gated_delta, gated_delta, attention, gated_delta`. Con dos pasadas, se obtienen 16 aplicaciones de capa manteniendo solo ocho conjuntos de pesos.

El mixer gated-delta utiliza convoluciones causales depthwise sobre queries, keys y values proyectados, normalización L2 en cabezas de query/ key, puertas de decay y update aprendidas, y un estado de matriz en float32 de tamaño fijo respecto a la longitud de secuencia. La atención grouped-query usa posiciones rotatorias, RMSNorm en query/ key, menos cabezas KV que cabezas de query, masking causal y ejecución eager o mediante PyTorch SDPA. También existe una variante de atención latente de bajo rango opcional. El repositorio incluye una cache híbrida con entradas separadas por `(loop_index, layer_index)` para estado recurrente y tensores KV.

No se proporcionan datos de entrenamiento ni resultados. El repositorio contiene utilidades para preentrenamiento, SFT, DPO, tokenización y span infilling, pero no hay pesos preentrenados ni logs de calidad. Starpower Technology indica en su sitio web que entrena modelos pequeños centrados en razonamiento, pero esto no se refleja en benchmarks publicados.

## Capacidades

- Generación de texto causal: la estructura incluye una cabeza de lenguaje sobre un vocabulario proyectado, por diseño.
- Procesamiento secuencial recurrente: el mixer gated-delta mantiene un estado de matriz de tamaño fijo respecto a la longitud de secuencia, lo que permite inferencia con memoria constante en esas capas.
- Atención grouped-query: las capas de atención reducen el coste de la cache KV en comparación con atención multi-cabeza completa, aunque sin validación empírica.
- Multi-pasada con compartición de capas: el mismo stack se reutiliza en varias pasadas, aumentando la profundidad efectiva sin incrementar los parámetros únicos.
- Tool calling / function calling: no disponible en la información proporcionada.
- Soporte de agentes y razonamiento multi-step: no disponible, no hay modelos entrenados ni benchmarks.
- Capacidades multilingües: solo inglés está declarado como idioma soportado.

## Casos de uso

- Investigación en arquitecturas recurrentes híbridas: el repositorio ofrece la implementación completa en PyTorch, permitiendo estudiar la interacción entre mixers gated-delta y atención GQA en modelos de tamaño reducido.
- Prototipado de modelos de razonamiento con recursos limitados: los perfiles de 5M a 300M parámetros permiten explorar modelos pequeños, alineados con el enfoque declarado por Starpower Technology de entrenar modelos pequeños centrados en razonamiento.
- Desarrollo de pipelines de ajuste supervisado y DPO: se incluyen utilidades de entrenamiento para SFT y optimización por preferencias, adecuadas para experimentos de alineación sobre un modelo recién inicializado.
- Evaluación de estrategias de cache híbrida: la separación entre estado recurrente y KV de atención por pasada permite investigar políticas de cache para secuencias largas sin modificar la arquitectura.
- Experimentos de compartición de capas: el loop sharing permite analizar el compromiso entre profundidad efectiva y número de parámetros únicos, útil en estudios de eficiencia paramétrica.
- Preparación de corpus y tokenización para modelos recurrentes: las utilidades de datos incluyen token packing y span infilling, facilitando la construcción de datasets para preentrenar un modelo de esta arquitectura.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible; no hay pesos entrenados ni mediciones publicadas.
- GPUs recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no hay datos para confirmarlo. Los perfiles más pequeños (alrededor de 5M y 45M parámetros únicos) podrían ejecutarse en hardware modesto, pero no se aportan pruebas.
- Opciones de despliegue: no disponible. El repositorio es una implementación PyTorch y no se mencionan integraciones con vLLM, llama.cpp, Ollama o TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han publicado benchmarks ni existe un modelo comparable con pesos entrenados de esta arquitectura en la información proporcionada.

## Limitaciones y advertencias

- No incluye pesos entrenados: no se puede utilizar como modelo listo para inferencia; los pesos se inicializan aleatoriamente al instanciar la configuración.
- No se dispone de benchmarks publicados: las capacidades teóricas de la arquitectura no están verificadas empíricamente.
- El valor `max_position_embeddings=4096` no es evidencia de calidad validada de contexto largo, como advierte el propio autor.
- Solo se declara soporte para inglés.
- No se incluye tokenizer ni configuración guardada; deben crearse o entrenarse.
- El repositorio no está empaquetado como instalable: hay que clonarlo en un directorio de paquete Python llamado `WVY` y respetar las versiones fijadas (Python 3.10+, torch>=2.6 y transformers==4.57.6).
- Las capas de atención conservan el coste cuadrático de computación con la longitud de secuencia, lo que limita el uso práctico de contextos muy largos.
- Riesgo de alucinación, sesgos y restricciones de uso comercial: al no haber pesos entrenados no se pueden evaluar; la licencia MIT permite uso comercial del código, pero cualquier modelo entrenado con él debería evaluarse de forma independiente.

## Enlaces

- HuggingFace: https://huggingface.co/StarpowerTechnology/WVY-Architecture
- Sitio web de Starpower Technology: https://starpower.technology/
