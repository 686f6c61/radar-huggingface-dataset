# stisiTT/glm-4-7-flash-p150

## Resumen

El repositorio `stisiTT/glm-4-7-flash-p150` contiene un paquete contenedor `tt-model` que permite servir el modelo `zai-org/GLM-4.7-Flash` en hardware Tenstorrent Blackhole p150. El contenedor empaqueta el stack de servidor completo, incluyendo un plugin de `vLLM` y el código de autoport para el modelo, de modo que el consumidor solo necesita Docker y una tarjeta Tenstorrent, sin instalar `tt-metal`, `vLLM` ni entornos virtuales en el host.

El modelo subyacente es `GLM-4.7-Flash` de Z.ai, cuyos pesos se descargan a la caché de HuggingFace en el momento de hacer `pull`, no se hornean dentro de la imagen. El contenedor está pensado como un perfil de throughput, no de latencia: el prefill por chunks está deshabilitado y las solicitudes concurrentes se prefillan de forma serial. El contexto máximo configurado es de 202752 tokens, con un rendimiento medido que escala suavemente en coste de decodificación a medida que crece la longitud del contexto.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | 202752 tokens (max_model_len del perfil default) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponibles |
| Licencia | no disponible |
| Formato de pesos | no disponible (los pesos se descargan a la caché HF en tiempo de pull) |

## Arquitectura y entrenamiento

El repositorio no proporciona detalles sobre la arquitectura interna del modelo `GLM-4.7-Flash` ni sobre su proceso de entrenamiento. La información disponible se centra en el empaquetado como contenedor `tt-model`: el código incluido contiene un autoport del modelo para hardware Blackhole, un bundle de `vLLM` y un contrato de contexto (`context_contract.json`). El contenedor fija versiones concretas de los componentes: `tt-metal` en el commit `5c8d71b60c0ca0210805b994a0cab0e0ed55c5ab` (árbol sucio), plugin en `6d3bb2854f5f8885acc1b12111d929bffdebc36e` y un digest de código `37581d8697933da2`. No se mencionan datos de entrenamiento, técnicas de alineación (RLHF, DPO) ni innovaciones arquitectónicas.

## Capacidades

- Servir el modelo `GLM-4.7-Flash` mediante `vLLM` en hardware Tenstorrent Blackhole, sin necesidad de instalar dependencias en el host.
- Soporte de contexto largo de hasta 202752 tokens, según el perfil de servicio.
- Soporte de hasta 32 secuencias simultáneas (`max_num_seqs`).
- Un único perfil de servicio (`default`) que cubre el hardware p150 con malla P150.
- No se especifican capacidades como tool calling, visión, audio o modos de razonamiento en la información disponible.

## Casos de uso

- Despliegue de un LLM en un clúster Tenstorrent Blackhole p150 sin instalar `tt-metal` ni `vLLM` en el host: el contenedor incluye todo el stack y se gestiona con `tt-model pull` y `tt-model serve`.
- Análisis de documentos extensos: la ventana de contexto de 202752 tokens permite procesar textos largos en una sola pasada, aunque el coste por token crece hasta 276.8 ms a 128K de contexto.
- Servicio multi-usuario con throughput agregado: con 32 usuarios concurrentes y secuencias de entrada/salida de 128 tokens, el contenedor alcanza 391 tok/s totales, adecuado para aplicaciones internas con cargas moderadas.
- Evaluación de rendimiento del modelo en hardware alternativo: el contenedor facilita la reproducción de benchmarks de servicio en aceleradores Tenstorrent, con puntos de medición de TTFT, TPOT y throughput documentados.
- Integración en pipelines de CI/CD que necesiten un endpoint de inferencia reproducible y versionado: el contenedor fija commits de `tt-metal`, plugin y digest de código, lo que permite recrear el entorno exacto.
- Entornos aislados con Docker: al ser una imagen autocontenida, se puede desplegar en máquinas con solo Docker y una tarjeta Tenstorrent, reduciendo la complejidad de instalación.

## Benchmarks y rendimiento

La información proporcionada incluye mediciones de rendimiento del contenedor en una tarjeta Blackhole p150, realizadas con el flujo de benchmark de `tt-inference-server`. No se han publicado resultados de benchmarks académicos (MMLU, HumanEval, GSM8K, etc.) en la información disponible.

| Escenario | TTFT | TPOT | Throughput |
|---|---|---|---|
| 1 usuario, ISL/OSL 128/128 | 296 ms | 29.5 ms | 31.7 tok/s |
| 32 usuarios, ISL/OSL 128/128 | 9.3 s | 91.6 ms | 391 tok/s total |
| 1 usuario, contexto 128K | 1033 s | 276.8 ms | 0.1 tok/s |

El coste de decodificación escala suavemente con el contexto: 29.5 ms/token a 128 tokens, 37.2 a 4K, 45.2 a 8K, 91.5 a 32K y 276.8 a 128K. El punto de 32 usuarios con TTFT de 9.3 s se debe a la cola de prefill serial, no a un bloqueo del sistema.

## Requisitos de hardware

- Hardware requerido: Tenstorrent Blackhole p150 (perfil `default`). No se trata de una GPU, sino de un acelerador Tenstorrent.
- VRAM estimada: no disponible en la información proporcionada.
- GPU recomendadas: no aplica; el contenedor está diseñado exclusivamente para hardware Tenstorrent.
- El contenedor cabe en un sistema con Docker y una tarjeta Tenstorrent; no se especifica si es compatible con GPUs de consumo.
- Opciones de despliegue: Docker, `tt-model` (pull/serve) y plugin `vLLM`.
- Latencia y throughput: según la tabla de benchmarks, con 1 usuario y contexto corto la TTFT es de 296 ms y el TPOT de 29.5 ms; con 32 usuarios el throughput agregado es de 391 tok/s.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye comparaciones con otros modelos o contenedores de la misma categoría.

## Limitaciones y advertencias

- En el único punto de medición con objetivos definidos, el contenedor no alcanza ambos objetivos: TTFT de 296.2 ms frente a un objetivo de 274.07 ms (8.1% por encima) y throughput de 31.7 tok/s por usuario frente a 33.903 (6.5% por debajo). Este comportamiento se reprodujo en dos ejecuciones independientes.
- El prefill por chunks está deshabilitado, por lo que las solicitudes concurrentes se prefillan de forma serial. La TTFT a alta concurrencia refleja tiempo de cola, no un bloqueo del sistema.
- El `generation_config.json` del checkpoint sobreescribe los valores por defecto de muestreo de `vLLM` estableciendo `temperature: 1.0`. Es necesario pasar una `temperature` explícita si se desea una salida determinista.
- Las cifras de precisión del modelo citadas en otros lugares provienen de una ejecución de subconjunto CI con un 5% de muestreo, no son resultados completos.
- La licencia no está disponible en la información del repositorio, por lo que el uso comercial es incierto.
- No se proporciona información sobre sesgos, riesgo de alucinación ni limitaciones de idioma del modelo subyacente.

## Enlaces

- Repositorio del contenedor: https://huggingface.co/stisiTT/glm-4-7-flash-p150
- Modelo base: https://huggingface.co/zai-org/GLM-4.7-Flash
- Página informativa sobre GLM-4.7-Flash: https://glm-ai.chat/models/glm-4-7-flash/
