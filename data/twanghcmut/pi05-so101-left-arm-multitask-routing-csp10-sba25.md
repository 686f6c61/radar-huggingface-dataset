# twanghcmut/pi05-so101-left-arm-multitask-routing-csp10-sba25

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un paquete de despliegue para un modelo de visión-lenguaje-acción (VLA) orientado a robótica: una política `π0.5` (pi05) entrenada para el brazo robótico SO101 en configuración de brazo izquierdo y tareas múltiples. El autor, `twanghcmut`, publica el resultado como un *bundle* que combina un GGUF denso nativo derivado del checkpoint `twanghcmut/pi05-so101-left-arm-multitask` (revisión `9195b1cf93b030b55ce7053b21d172885e8a82a7`) con una capa de enrutamiento CSP calibrada sobre las demostraciones de entrenamiento del modelo original, más una variante de atención temporal SBA que no requiere pesos ajustados.

El interés técnico está en el empaquetado: se distribuye código C++ (`vla_cpp_source.tar.gz`) que debe compilarse con `VLA_SPM=ON`, junto con scripts Python (`scripts/run_so101_hf.py`) que descargan los artefactos desde Hugging Face. El paquete expone dos modos de ejecución (denso por defecto y con `--routing_csp 10 --temporal_attention 25 --euler 1`), un modo CLI para una única observación grabada y un modo servidor persistente necesario para las decisiones SBA/routing que dependen de la llamada anterior.

Es relevante para quien trabaja en manipulación robótica de bajo coste con el SO101 y quiera reproducir o auditar una política VLA en local sin depender de un servicio cerrado. Conviene subrayar que el propio autor declara explícitamente que no se reclama ninguna tasa de éxito en robot real, y que los episodios públicos usados para el ajuste son datos de entrenamiento, no una evaluación held-out.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | política VLA pi05 (π0.5) para control robótico; el bundle incluye GGUF denso y capa de enrutamiento CSP con atención temporal SBA |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (denso nativo); niveles concretos no disponibles |
| Idiomas soportados | no disponible (modelo orientado a acciones robóticas, no a texto libre) |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF, más código C++ y scripts Python empaquetados en `vla_cpp_source.tar.gz` |

## Arquitectura y entrenamiento

El modelo subyacente es una política `π0.5` (pi05) aplicada al brazo SO101, en variante de brazo izquierdo y multitarea, según el identificador del checkpoint base. El bundle añade dos componentes: un GGUF denso nativo derivado de ese checkpoint y una capa de enrutamiento CSP ("routing-csp") calibrada sobre las demostraciones de entrenamiento del modelo fuente. Se incluye además una atención temporal SBA (25 en la configuración de ejemplo) que, según el autor, no necesita pesos ajustados, lo que sugiere un mecanismo determinista o derivado de la arquitectura más que aprendido.

No se detallan en la información disponible el número de tokens de entrenamiento, la composición del dataset, ni si hubo etapas de RLHF o DPO; en el contexto de políticas VLA de imitación, lo habitual sería entrenamiento por imitación sobre demostraciones, pero no se confirma. Tampoco se especifica el número de parámetros del modelo base. La innovación declarada es el empaquetado de inferencia en C++ con soporte de atención temporal y enrutamiento por llamada, pensado para ejecución local sobre el robot.

## Capacidades

- Control robótico de un brazo SO101 (variante brazo izquierdo) en escenarios multitarea, mediante predicción de acciones a partir de observaciones.
- Inferencia en modo denso (por defecto) o con enrutamiento CSP y atención temporal SBA activados por parámetros de línea de comandos.
- Modo CLI para una observación única grabada (`--mode cli`).
- Modo servidor persistente, necesario para decisiones SBA/routing que dependen de la llamada anterior, con API de reset en cada frontera de episodio.
- Ejecución local en C++ compilado con `VLA_SPM=ON`, con descarga de artefactos vía `huggingface_hub`.
- No se documentan capacidades de generación de texto, código, matemáticas, visión general, tool calling ni razonamiento multi-paso fuera del bucle de control robótico.

## Casos de uso

- Reproducción de experimentos con el SO101: el bundle permite reconstruir la política pi05 de brazo izquierdo en local y comparar el modo denso con el enrutado, usando los scripts incluidos y el checkpoint base fijado por revisión.
- Investigación en enrutamiento por llamada: la capa CSP calibrada sobre demostraciones permite estudiar cómo afecta el enrutamiento entre llamadas al comportamiento de la política, con el modo servidor persistente como requisito.
- Evaluación de atención temporal en políticas VLA: la variante SBA sin pesos ajustados facilita ablaciones controladas frente al modo denso por defecto.
- Integración en un pipeline de robótica de bajo coste: al compilarse en C++ y ejecutarse localmente, el paquete encaja en estaciones de trabajo con el brazo SO101 sin depender de APIs externas.
- Auditoría de artefactos: `bundle.json` incluye hashes, lo que permite verificar la integridad de los pesos y del código antes de desplegar en un robot físico.
- Formación y docencia: el modo CLI con una observación grabada sirve para inspeccionar las predicciones de la política sin montar el bucle completo de control.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explícitamente que no se reclama ninguna tasa de éxito en robot real y que los episodios públicos usados para el ajuste son datos de entrenamiento, no una evaluación held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible; el repositorio ocupa 8,8 GB, lo que da una cota superior aproximada del espacio en disco necesario para los artefactos, no de la memoria de inferencia.
- GPU recomendadas: no disponibles.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: compilación del código C++ incluido con `VLA_SPM=ON` y ejecución mediante `scripts/run_so101_hf.py`; no se documenta soporte para vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye otros modelos comparables de la misma categoría (políticas VLA para SO101) ni datos de rendimiento que permitan una comparación rigurosa.

## Limitaciones y advertencias

- No se reclama tasa de éxito en robot real; cualquier despliegue debe validarse empíricamente antes de usarse en producción.
- Los episodios públicos usados para calibrar el enrutamiento CSP son datos de entrenamiento, no una evaluación held-out, por lo que las métricas sobre ellos estarían sesgadas al alza.
- El modo servidor persistente es obligatorio para las decisiones SBA/routing que dependen de la llamada anterior; el modo CLI solo admite una observación grabada.
- Es necesario llamar a la API de reset en cada frontera de episodio para evitar arrastrar estado entre episodios.
- El modelo está especializado en el brazo izquierdo del SO101 y en tareas múltiples concretas; no es un modelo general y no se documentan capacidades fuera de ese dominio.
- No se detallan sesgos, comportamiento multilingüe ni riesgos de alucinación en el sentido de modelos de lenguaje; el riesgo principal es de generalización limitada a condiciones no vistas durante el entrenamiento.
- Licencia apache-2.0, que permite uso comercial, pero el autor no ofrece garantías sobre el comportamiento del modelo en el mundo físico.
- El repositorio no registra descargas ni interacciones, por lo que no hay evidencia comunitaria de funcionamiento en entornos distintos al del autor.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask-routing-csp10-sba25
- Modelo base: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask
- Código fuente empaquetado: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask-routing-csp10-sba25/resolve/main/vla_cpp_source.tar.gz
- Documentación de despliegue incluida en el bundle: `docs/pi_acceleration.md`
- Metadatos y hashes del bundle: `bundle.json`
