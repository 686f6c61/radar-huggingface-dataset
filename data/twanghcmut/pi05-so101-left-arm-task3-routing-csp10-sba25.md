# twanghcmut/pi05-so101-left-arm-task3-routing-csp10-sba25

## Resumen

Este repositorio contiene un paquete de despliegue para un modelo de visión-lenguaje-acción (VLA) orientado a robótica manipulativa, concretamente al brazo robótico SO101 en una tarea de control con el brazo izquierdo. El modelo base es `twanghcmut/pi05-so101-left-arm-task3`, una adaptación de π0.5 (pi05) al dominio del SO101, y este bundle añade una capa de enrutamiento CSP (calibrada sobre las demostraciones de entrenamiento del modelo original) junto con atención temporal SBA, que no requiere pesos ajustados. Se distribuye como GGUF nativo denso más un overlay de configuración, y el autor no reclama ninguna tasa de éxito robótico medida.

El paquete está pensado para su uso mediante un runtime en C++ (`vla_cpp_source.tar.gz`) que se compila con `VLA_SPM=ON` y se controla desde Python con `huggingface_hub` instalado. La inferencia puede ejecutarse en modo denso por defecto o con los parámetros de enrutamiento y atención temporal activados. El repositorio tiene 8,8 GB, licencia Apache 2.0 y pipeline declarado como `robotics`.

Es relevante para quien necesite desplegar políticas VLA ligeras en hardware de brazos de bajo coste (SO101) con control fino sobre el compromiso entre coste computacional y comportamiento, aunque la ausencia de evaluación held-out y de métricas de éxito obliga a validar el sistema en el propio banco de pruebas antes de cualquier uso real.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base pi05, familia π0.5; el bundle añade enrutamiento CSP y atención temporal SBA) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se menciona "dense native GGUF"; no se detallan niveles de cuantización) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, más overlay de configuración (`bundle.json` con hashes) y código fuente C++ (`vla_cpp_source.tar.gz`) |

## Arquitectura y entrenamiento

El modelo base pertenece a la familia π0.5 (pi05), un modelo de visión-lenguaje-acción que mapea observaciones visuales y consignas a acciones de control del robot. Sobre ese checkpoint, este bundle incorpora dos componentes: un enrutamiento CSP con parámetro 10 (`--routing_csp 10`), calibrado sobre las demostraciones de entrenamiento del modelo fuente, y una atención temporal SBA con ventana 25 (`--temporal_attention 25`), que según el autor no necesita pesos ajustados. El paquete incluye además un GGUF denso nativo.

No se especifican en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo RLHF o DPO. El autor advierte explícitamente que los episodios públicos usados para el ajuste del enrutamiento son datos de entrenamiento y no una evaluación held-out, por lo que no constituyen una medida de generalización.

## Capacidades

- Control robótico de un brazo SO101 para una tarea concreta (brazo izquierdo, `task3`), a partir de observaciones y consignas.
- Inferencia en modo denso (por defecto) o con enrutamiento CSP y atención temporal SBA activados.
- Modo CLI para una única observación grabada.
- Modo servidor persistente, necesario para que las decisiones de enrutamiento y SBA puedan usar la llamada anterior.
- API de reset en cada frontera de episodio.
- No se documentan capacidades de generación de texto, código, matemáticas, tool calling, agentes ni multilingüismo; el pipeline declarado es exclusivamente `robotics`.

## Casos de uso

- Despliegue de una política VLA en un brazo SO101 real: el bundle proporciona el runtime C++ y los scripts Python necesarios para ejecutar el modelo sobre observaciones del robot en un montaje de laboratorio.
- Evaluación comparativa de configuraciones de inferencia: permite alternar entre modo denso y modo con `--routing_csp 10 --temporal_attention 25 --euler 1`, lo que facilita medir el efecto de cada componente sobre el comportamiento del brazo.
- Investigación en enrutamiento y atención temporal para VLA: el overlay CSP calibrado y la atención SBA sin pesos ajustados sirven como banco de pruebas para estudiar estrategias de aceleración o selección de cómputo.
- Reproducción de experimentos con observaciones grabadas: el modo CLI permite reproducir una única observación registrada sin necesidad de un robot conectado.
- Integración en un bucle de control por episodios: el modo servidor persistente con API de reset encaja en pipelines que ejecutan episodios sucesivos y requieren estado entre llamadas.
- Base para adaptaciones a otras tareas o brazos: al estar liberado con Apache 2.0 y con el código fuente incluido, puede servir de punto de partida para reentrenar o recalibrar sobre nuevas demostraciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no reclama ninguna tasa de éxito robótico ("No robot success rate is claimed") y que los episodios usados para el ajuste son datos de entrenamiento, no evaluación held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible. El repositorio ocupa 8,8 GB, pero no se desglosa cuánto corresponde a pesos GGUF, a código fuente y a configuración, ni se indica el tamaño del modelo base.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: runtime C++ propio incluido en `vla_cpp_source.tar.gz`, compilado con `VLA_SPM=ON`, invocado desde Python mediante `scripts/run_so101_hf.py` con `huggingface_hub` instalado. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables ni datos de rendimiento que permitan establecer una comparación con alternativas de la misma categoría.

## Limitaciones y advertencias

- No se aporta ninguna métrica de éxito robótico; el autor declara explícitamente que no reclama tasa de éxito.
- El enrutamiento CSP está calibrado sobre las demostraciones de entrenamiento del modelo fuente, que no son datos held-out; el rendimiento en condiciones nuevas no está validado.
- El modelo está especializado en una tarea concreta (brazo izquierdo, `task3`) sobre el SO101; no se documenta su generalización a otras tareas, brazos o entornos.
- El modo CLI solo admite una observación grabada; las decisiones de enrutamiento y SBA que dependen de la llamada anterior requieren el modo servidor persistente.
- Es obligatorio llamar a la API de reset en cada frontera de episodio para evitar arrastrar estado entre episodios.
- No se documentan sesgos, comportamiento multilingüe ni riesgos de alucinación en el sentido de modelos de lenguaje, al tratarse de un pipeline de robótica.
- La licencia Apache 2.0 permite uso comercial, pero la falta de evaluación de robustez y seguridad hace desaconsejable el despliegue en entornos físicos sin validación previa y medidas de seguridad.
- El repositorio tiene 0 descargas y 0 likes en el momento de la consulta, lo que indica ausencia de validación por parte de la comunidad.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3-routing-csp10-sba25
- Modelo base: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3
- Revisión del checkpoint fuente: `78d001395fa89646dfe97c60b18623f2f7f04b4b`
- Código fuente del runtime: https://huggingface.co/twanghcmut/pi05-so101-left-arm-task3-routing-csp10-sba25/resolve/main/vla_cpp_source.tar.gz
- Documentación de despliegue incluida en el bundle: `docs/pi_acceleration.md`
- Metadatos y hashes del bundle: `bundle.json`
