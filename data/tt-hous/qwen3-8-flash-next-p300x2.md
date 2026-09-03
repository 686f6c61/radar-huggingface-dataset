# tt-hous/qwen3.8-flash-next-p300x2

## Resumen

`tt-hous/qwen3.8-flash-next-p300x2` es un paquete de contenedor `tt-model` desarrollado por Tenstorrent (autor `tt-hous`) para servir el modelo `Qwen/Qwen3.8-Flash-Next` en hardware propio de la compañía: dos placas P300 que integran cuatro chips Blackhole. El paquete empaqueta el runtime completo (tt-metal, vLLM 0.24.0, Transformers 5.16.0 y un plugin específico para Qwen3.8) de modo que el consumidor solo necesita Docker y una tarjeta Tenstorrent, sin instalar dependencias adicionales en el host.

El modelo base, Qwen3.8-Flash-Next, es una variante reciente de la familia Qwen con arquitectura de mezcla de expertos (MoE), como se deduce de la mención a "512 routed experts" y al esquema de paralelismo TP4+EP4. El paquete optimiza la inferencia manteniendo todos los expertos residentes en memoria de los dispositivos, con solo la tabla n-gram del PLE (predictive language expert) y el ensamblado de filas dispersas respaldados por el host. Ofrece dos perfiles de servicio: uno por defecto con contexto de 4.096 tokens orientado a latencia interactiva, y otro `long-context` que amplía la capacidad a 262.144 tokens.

La relevancia de este paquete radica en que simplifica drásticamente el despliegue de un modelo MoE de gran tamaño en hardware especializado, eliminando la complejidad de configurar tt-metal y vLLM manualmente. El repositorio incluye el código fuente exacto que se ejecuta dentro de la imagen, lo que garantiza reproducibilidad y trazabilidad de la compilación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MoE (mezcla de expertos) con 512 expertos enrutados (según model card) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | 4.096 tokens (perfil por defecto); 262.144 tokens (perfil `long-context`) |
| Tipos de cuantizacion | BFP4 (cache de tensores de expertos residentes) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (descargados desde Hugging Face al cache del host) |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base Qwen3.8-Flash-Next más allá de su naturaleza MoE. La model card del paquete indica que el runtime utiliza paralelismo de tensor (TP4) y paralelismo de expertos (EP4) sobre cuatro dispositivos Blackhole, con los 512 expertos enrutados residentes en memoria de los chips. El modelo incorpora un "predictive language expert" (PLE) que mantiene una tabla n-gram en el host, lo que sugiere un mecanismo de predicción especulativa o de aceleración de decodificación.

No se proporcionan datos sobre el entrenamiento (número de tokens, composición del dataset, técnicas de alineación como RLHF o DPO). El paquete fija la revisión exacta del checkpoint en Hugging Face (`f5d08274bafd880402bd16f5e3e6c514136ec06c`), lo que permite reproducir el despliegue con total fidelidad.

## Capacidades

- Generación de texto y razonamiento de propósito general, heredadas del modelo Qwen3.8-Flash-Next (no se detallan capacidades específicas en la documentación del paquete).
- Soporte de decodificación con prefill por fragmentos reanudables de 1.024 tokens y microchunks de 128 tokens, optimizado para latencia en hardware Blackhole.
- Capacidad de contexto largo de hasta 262.144 tokens mediante el perfil `long-context`, aunque con una sola secuencia en lote (batch 1).
- Integración con vLLM como endpoint compatible con OpenAI, lo que permite usar herramientas estándar de cliente.
- Gestión de caché persistente de pesos de expertos en formato BFP4, que acelera los arranques posteriores al primer uso.

## Casos de uso

- Inferencia de baja latencia en entornos de producción con hardware Tenstorrent: el perfil por defecto ofrece una mediana de TTFT de 1,265 s y un TPOT medio de 86,84 ms para secuencias de 128 tokens, adecuado para aplicaciones interactivas donde el tiempo de primera respuesta es crítico.
- Despliegue de modelos MoE grandes sin gestión manual de dependencias: al ser un contenedor autocontenido, un equipo de operaciones solo necesita Docker y la tarjeta P300, reduciendo el tiempo de puesta en marcha y los errores de configuración.
- Procesamiento de documentos largos o conversaciones multi-turno extensas: el perfil `long-context` permite manejar entradas de hasta 262.144 tokens, útil para resumir corpus amplios o mantener historiales de chat muy largos.
- Evaluación de rendimiento y pruebas de carga: el paquete incluye telemetría detallada (bytes de expertos por dispositivo, tiempos de ruteo, etc.) que permite validar el comportamiento del sistema antes de pasar a producción.
- Desarrollo de aplicaciones de agente con razonamiento multi-paso: aunque no se documenta explícitamente tool calling, la integración con vLLM y el endpoint OpenAI-compatible facilitan la construcción de agentes que requieren múltiples llamadas al modelo.
- Investigación en eficiencia de inferencia MoE: el código fuente incluido en el repositorio permite estudiar y modificar el pipeline de ejecución en hardware Blackhole, sirviendo como base para experimentos de optimización.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks de calidad del modelo (MMLU, HumanEval, GSM8K, etc.) en la información disponible. La model card solo reporta métricas de rendimiento del endpoint, medidas con `vllm bench serve` sobre cuatro dispositivos, con longitud de entrada y salida de 128 tokens, temperatura 0 y sin EOS:

| ISL | OSL | Max concurrency | Requests | Median TTFT | Mean TPOT | Decode tok/s/user | Aggregate output tok/s |
| ---: | ---: | ---: | ---: | ---: | ---: | ---: | ---: |
| 128 | 128 | 1 | 3/3 | 1,265 s | 86,84 ms | 11,516 | 10,412 |

El perfil de servicio está limitado a batch 1; las peticiones posteriores se encolan en vLLM en lugar de multiplexar un banco de estados virtual. El harness directo del modelo alcanza 87,479 ms/token (11,431 tok/s/usuario). También se verificó una petición real de 1.025 tokens, que ejercitó un primer fragmento de prefill de 1.024 tokens más una continuación de un token.

## Requisitos de hardware

- Dos placas Tenstorrent P300, que integran cuatro chips Blackhole en total.
- VRAM: no especificada, pero el paquete reporta 16.986.931.200 bytes de expertos por dispositivo (aproximadamente 15,8 GiB por chip), lo que da una idea de la memoria necesaria para mantener los expertos residentes.
- No cabe en GPUs de consumo (RTX, etc.); requiere hardware Tenstorrent específico.
- Opciones de despliegue: `tt-model pull` y `tt-model serve` (con perfiles `batch1-latency` por defecto y `long-context`). El paquete incluye vLLM 0.24.0 como stack de servicio.
- Latencia y throughput: medidos en la tabla anterior; para batch 1, el TPOT medio es de 86,84 ms (11,5 tok/s por usuario) y el throughput agregado de salida es de 10,4 tok/s.

## Comparativa con modelos similares

No se dispone de información sobre modelos comparables en el contexto de despliegue en hardware Tenstorrent. El paquete es específico para Qwen3.8-Flash-Next y no se han documentado alternativas equivalentes en la misma plataforma. Como referencia de modelo base, Qwen3.8-Flash-Next pertenece a la familia Qwen, pero no se dispone de datos de otros modelos de la misma categoría (tamaño, contexto, rendimiento) para establecer una comparación objetiva.

## Limitaciones y advertencias

- El perfil de servicio está limitado a batch 1; no se soporta concurrencia real, solo encolado de peticiones. Esto puede ser un cuello de botella para aplicaciones con alta demanda simultánea.
- La licencia del modelo base y del paquete no está especificada; antes de un uso comercial es imprescindible verificar los términos en el repositorio original de Qwen y en la documentación de Tenstorrent.
- No se documentan sesgos, riesgos de alucinación ni limitaciones idiomáticas del modelo base; al ser un modelo de lenguaje general, es probable que presente los sesgos típicos de los LLM entrenados con datos web.
- El hardware requerido es propietario de Tenstorrent; no es posible ejecutar este paquete en GPUs estándar, lo que limita su portabilidad.
- El primer arranque requiere poblar la caché de pesos de expertos en formato BFP4, lo que puede implicar un tiempo de inicialización adicional.
- La longitud de contexto máxima de 262.144 tokens solo está disponible en el perfil `long-context`, que probablemente tenga mayor latencia; no se proporcionan métricas de rendimiento para ese perfil.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/tt-hous/qwen3.8-flash-next-p300x2
- Modelo base (referenciado en la model card): https://huggingface.co/Qwen/Qwen3.8-Flash-Next
- No se han encontrado otros enlaces relevantes (papers, blogs, demos) en la búsqueda web.
