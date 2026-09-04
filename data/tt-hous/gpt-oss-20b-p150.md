# tt-hous/gpt-oss-20b-p150

## Resumen

`tt-hous/gpt-oss-20b-p150` es un paquete contenedor (tt-model container) desarrollado por `tt-hous` que permite servir el modelo `openai/gpt-oss-20b` en hardware Tenstorrent. El paquete se distribuye como imagen Docker e incluye toda la pila de servido (tt-metal, vLLM y un plugin específico), de modo que el usuario solo necesita Docker y una tarjeta Tenstorrent, sin instalar dependencias en el host. Resuelve el problema de desplegar GPT-OSS en aceleradores Tenstorrent de forma simple y reproducible.

El modelo subyacente, `openai/gpt-oss-20b`, es un modelo de pesos abiertos de 20 mil millones de parámetros, con una ventana de contexto completa de 131,072 tokens. Según la documentación del paquete, soporta razonamiento GPT-OSS, llamadas a herramientas en formato OpenAI y el contexto completo de 131k. El paquete ofrece dos perfiles de servido: `p150` (un chip P150) y `p150x2` (dos chips P150 en una placa P300C), con rendimiento de decodificación medido de 17 y 29 tokens por segundo por usuario, respectivamente.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mixture of experts) según la mención de "expert decode path"; no se especifican detalles adicionales |
| Parametros totales | 20B (según la denominación del modelo y la documentación de OpenAI) |
| Parametros activos | no disponible |
| Longitud de contexto | 131,072 tokens |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos se descargan a la caché de Hugging Face en tiempo de ejecución; no se especifica el formato) |

## Arquitectura y entrenamiento

El paquete sirve el modelo `openai/gpt-oss-20b`, que según la documentación del contenedor utiliza una ruta de decodificación por expertos ("expert decode path"), lo que sugiere una arquitectura de mezcla de expertos (MoE). No se proporcionan detalles adicionales sobre la arquitectura interna, el número de parámetros activos ni la composición del dataset de entrenamiento. Tampoco se indica si se aplicaron técnicas de alineación como RLHF o DPO.

Desde el punto de vista del paquete, la arquitectura de servido se basa en un contenedor Docker que integra `tt-metal` (compilador de kernels de Tenstorrent), `vllm` y un plugin específico para hardware Blackhole. En la primera ejecución se compilan los kernels y se convierten los tensores del modelo a una caché persistente, lo que reduce el tiempo de arranque en ejecuciones posteriores.

## Capacidades

- Generación de texto con soporte de razonamiento GPT-OSS (el modelo separa el contenido de razonamiento del contenido final).
- Llamadas a herramientas (tool calling) en formato OpenAI, compatible con agentes y flujos de trabajo automatizados.
- Ventana de contexto completa de 131,072 tokens, lo que permite procesar documentos largos y conversaciones extensas.
- Endpoint compatible con la API de OpenAI, lo que facilita la integración con clientes existentes.
- Soporte para servido en dos configuraciones de hardware: un chip P150 o dos chips P150 (P150x2) en una placa P300C.
- Validación de contexto exacto: se probó una entrada de 131,071 tokens más un token de salida, confirmando el soporte del contexto completo.
- Comparación de 30 tokens con el modelo de referencia de Hugging Face: 100% de coincidencia top-1 y top-5 en modo teacher-forced.

## Casos de uso

- Despliegue de asistentes de IA en infraestructura on-premise con hardware Tenstorrent: el paquete elimina la necesidad de configurar manualmente tt-metal y vLLM, reduciendo el tiempo de puesta en producción.
- Agentes autónomos con llamadas a herramientas: gracias al soporte de tool calling en formato OpenAI, el modelo puede integrarse en pipelines que requieren ejecutar funciones externas, consultar bases de datos o interactuar con APIs.
- Procesamiento de documentos extensos: la ventana de contexto de 131,072 tokens permite analizar contratos, informes técnicos o logs de gran tamaño sin necesidad de dividirlos en fragmentos.
- Razonamiento paso a paso en aplicaciones de análisis: el modo de razonamiento GPT-OSS es útil para tareas que requieren cadenas de deducción, como resolución de problemas complejos o generación de explicaciones.
- Servicio de chat con contexto largo: el endpoint compatible con OpenAI se puede conectar a frontends existentes (por ejemplo, interfaces de chat) sin cambios en el código del cliente.
- Evaluación y pruebas de modelos en hardware Tenstorrent: el paquete permite a investigadores y desarrolladores probar GPT-OSS-20b en aceleradores Blackhole con perfiles de rendimiento documentados.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.) en la información disponible. Los siguientes datos corresponden a rendimiento de inferencia medido con `vllm bench serve` sobre el paquete empaquetado, con concurrencia 1, muestreo greedy y longitudes de entrada/salida exactas. Los valores son p50.

**Perfil P150 (un chip):**

| ISL | OSL | concurrency | decode t/s/u | TTFT (ms) | E2EL (ms) |
|---|---:|---:|---:|---:|---:|
| 128 | 128 | 1 | 17.34 | 545.5 | 7,870.8 |
| 512 | 128 | 1 | 17.26 | 4,284.0 | 11,641.9 |
| 1,024 | 128 | 1 | 17.19 | 4,285.2 | 11,673.3 |
| 2,048 | 128 | 1 | 17.16 | 8,572.4 | 15,973.8 |
| 4,096 | 128 | 1 | 17.01 | 17,131.8 | 24,599.0 |
| 8,192 | 128 | 1 | 16.93 | 34,289.6 | 41,794.7 |
| 8,192 | 1,024 | 1 | 16.95 | 34,294.1 | 94,660.3 |
| 16,384 | 128 | 1 | 16.72 | 68,808.9 | 76,406.4 |
| 32,768 | 128 | 1 | 16.45 | 138,597.6 | 146,317.1 |

**Perfil P150x2 (dos chips):**

| ISL | OSL | concurrency | decode t/s/u | TTFT (ms) | E2EL (ms) |
|---|---:|---:|---:|---:|---:|
| 128 | 128 | 1 | 29.91 | 307.5 | 4,552.6 |
| 512 | 128 | 1 | 29.68 | 2,267.7 | 6,546.8 |
| 1,024 | 128 | 1 | 29.74 | 2,270.1 | 6,542.0 |
| 2,048 | 128 | 1 | 29.58 | 4,562.4 | 8,855.7 |
| 4,096 | 128 | 1 | 29.40 | 9,110.6 | 13,430.4 |
| 8,192 | 128 | 1 | 29.23 | 18,237.3 | 22,582.6 |
| 8,192 | 1,024 | 1 | 29.26 | 18,239.3 | 53,205.0 |
| 16,384 | 128 | 1 | 29.01 | 36,576.9 | 40,954.7 |
| 32,768 | 128 | 1 | 28.97 | 73,654.7 | 78,038.3 |

El perfil P150x2 sostiene aproximadamente 29 tokens de decodificación por segundo por usuario, frente a 17 en P150, y reduce la latencia de prefill largo en aproximadamente un 47%. Los tiempos de arranque medidos fueron de 228 segundos en frío y 65.5 segundos en caliente para P150, y de 207.6 segundos en frío y 52.3 segundos en caliente para P150x2.

## Requisitos de hardware

- Hardware requerido: tarjeta Tenstorrent P150 (un chip) o placa P300C con dos chips P150 (perfil P150x2). No se especifica compatibilidad con otros aceleradores.
- VRAM: no disponible (la memoria es on-chip del acelerador Tenstorrent; no se especifica la capacidad).
- Se requiere Docker para ejecutar el contenedor. No es necesario instalar tt-metal, vLLM ni entornos virtuales en el host.
- Opciones de despliegue: el comando `tt-model serve` con perfiles `p150` o `p150x2`. El perfil por defecto es `p150x2`.
- `max_num_seqs` está fijado a 1 en ambos perfiles, ya que la ruta de decodificación de expertos de GPT-OSS es batch-one. Esto limita el rendimiento en escenarios de alta concurrencia.
- Latencia y throughput: ver tablas de rendimiento en la sección anterior. El perfil P150x2 ofrece mejor throughput y menor latencia de prefill.

## Comparativa con modelos similares

No se dispone de datos de comparación con modelos similares en la información proporcionada. El paquete sirve el modelo `openai/gpt-oss-20b`, y una comparación natural sería con otros runtimes de servido del mismo modelo (por ejemplo, vLLM estándar en GPUs NVIDIA), pero no se han publicado resultados de comparación en la documentación disponible.

## Limitaciones y advertencias

- La licencia del paquete y del modelo subyacente no está especificada en la información proporcionada. Antes de usar en producción, es necesario verificar la licencia de `openai/gpt-oss-20b` y las condiciones de uso comercial.
- Los idiomas soportados no están documentados. El rendimiento en idiomas distintos del inglés no puede evaluarse a partir de la información disponible.
- No se han publicado benchmarks de calidad (MMLU, HumanEval, GSM8K, etc.), por lo que no es posible comparar el rendimiento del modelo con otros modelos de referencia.
- El rendimiento de decodificación está limitado a `max_num_seqs=1`, lo que significa que el servido no está optimizado para peticiones concurrentes. En escenarios de alta concurrencia, el throughput puede ser insuficiente.
- El paquete requiere hardware Tenstorrent específico (P150/P150x2). No se puede ejecutar en infraestructura GPU estándar, lo que limita su portabilidad.
- Como todo modelo generativo, existe riesgo de alucinación y de generar contenido incorrecto o sesgado. No se han publicado evaluaciones de sesgos en la información disponible.
- El tiempo de primera ejecución es elevado (228 segundos en frío para P150), debido a la compilación de kernels y conversión de tensores. Es necesario planificar el arranque en entornos de producción.

## Enlaces

- https://huggingface.co/tt-hous/gpt-oss-20b-p150
- https://huggingface.co/openai/gpt-oss-20b
- https://developers.openai.com/api/docs/models/gpt-oss-20b
