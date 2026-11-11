# twanghcmut/pi05-so101-left-arm-multitask-routing-csp25-sba25

## Resumen

El modelo `pi05-so101-left-arm-multitask-routing-csp25-sba25`, publicado por el usuario `twanghcmut` en Hugging Face, es un bundle de robótica derivado del checkpoint `twanghcmut/pi05-so101-left-arm-multitask`. Se trata de una variante de π0.5 (pi05) orientada al control del brazo robótico SO101 en tareas multitarea, empaquetada junto con un GGUF nativo denso y una capa de enrutamiento CSP (routing CSP) calibrada sobre las demostraciones de entrenamiento del modelo base, además de un mecanismo de atención temporal SBA que no requiere pesos ajustados.

El paquete no es un modelo de lenguaje generalista: es un artefacto de despliegue para inferencia de un modelo de visión-lenguaje-acción (VLA) en un brazo robótico concreto. Incluye código C++ fuente (`vla_cpp_source.tar.gz`) que debe compilarse con la opción `VLA_SPM=ON`, y scripts Python (`scripts/run_so101_hf.py`) para ejecutar el modelo en modo denso por defecto o con las capas de aceleración (`--DCSP 25 --temporal_attention 25 --euler 1`).

Su relevancia es acotada pero específica: ofrece una ruta de despliegue reproducible (hashes en `bundle.json`, documentación en `docs/pi_acceleration.md`) para llevar un VLA de robótica a un brazo SO101, con un modelo de aproximadamente 924 millones de parámetros y un repositorio de 10,7 GB. El autor declara explícitamente que no se reclama ninguna tasa de éxito en robot, por lo que debe tratarse como material de investigación y no como un sistema validado en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | VLA (vision-lenguaje-accion) basada en π0.5; no se detalla la arquitectura interna en la informacion disponible |
| Parametros totales | 924.391.424 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (se incluye un GGUF nativo denso); no se detallan los niveles de cuantizacion disponibles |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | GGUF (bundle con GGUF nativo denso); el modelo base usa safetensors segun el dato de parametros |

## Arquitectura y entrenamiento

La informacion disponible indica que el modelo base es π0.5 aplicado al brazo SO101 en configuracion multitarea y brazo izquierdo. El bundle anade dos componentes sobre el checkpoint base: un GGUF nativo denso y una capa de enrutamiento CSP ("routing CSP overlay") calibrada sobre las demostraciones de entrenamiento del modelo fuente (revision `9195b1cf93b030b55ce7053b21d172885e8a82a7`). Ademas, incorpora atencion temporal SBA, que segun el autor no necesita pesos ajustados.

No se especifican en la informacion proporcionada el numero de tokens de entrenamiento, la composicion del dataset, ni si hubo RLHF o DPO. El autor advierte que los episodios publicos usados para el ajuste son datos de entrenamiento y no una evaluacion held-out, lo que limita cualquier conclusion sobre generalizacion. La innovacion tecnica destacable es el mecanismo de aceleracion en inferencia: enrutamiento CSP con parametro `--DCSP 25`, atencion temporal con `--temporal_attention 25` y modo Euler (`--euler 1`), pensados para reducir coste computacional en el despliegue.

## Capacidades

- Control de un brazo robotico SO101 (configuracion brazo izquierdo) en tareas multitarea, a partir de observaciones.
- Inferencia de vision-lenguaje-accion (VLA) sobre el checkpoint π0.5, orientada a la generacion de acciones motoras.
- Enrutamiento CSP calibrado sobre demostraciones de entrenamiento para seleccionar rutas de computo.
- Atencion temporal SBA sin pesos ajustados, para decisiones que dependen de llamadas previas.
- Modo CLI para una unica observacion grabada (`--mode cli`).
- Modo servidor persistente, necesario para las decisiones de SBA y enrutamiento que dependen de la llamada anterior.
- API de reset para invocar en cada frontera de episodio.
- No se documentan capacidades de tool calling, agentes, multilingue, vision general, audio ni thinking mode.

## Casos de uso

- Despliegue de referencia en un brazo SO101: compilar `vla_cpp_source.tar.gz` con `VLA_SPM=ON` y ejecutar `scripts/run_so101_hf.py --repo ...` para obtener el comportamiento denso por defecto del checkpoint base.
- Evaluacion de aceleracion en inferencia: comparar el modo denso con `--DCSP 25 --temporal_attention 25 --euler 1` para medir el efecto del enrutamiento CSP y la atencion temporal sobre el coste de computo.
- Reproduccion de experimentos de investigacion: usar los hashes de `bundle.json` para verificar la integridad del bundle y reproducir exactamente el entorno descrito en `docs/pi_acceleration.md`.
- Integracion en un bucle de control persistente: levantar el modelo en modo servidor y llamar a la API de reset en cada frontera de episodio para mantener el estado temporal entre llamadas.
- Pruebas de regresion de politicas roboticas: ejecutar en modo CLI una observacion grabada y comparar la accion generada frente a la del checkpoint base `twanghcmut/pi05-so101-left-arm-multitask`.
- Base para ajuste fino adicional: partir del GGUF denso incluido y del codigo fuente C++ para adaptar el modelo a variantes del SO101 o a nuevas tareas multitarea.
- Docencia y prototipado en robotica: disponer de un pipeline completo (modelo, codigo y documentacion de despliegue) para ilustrar como se sirve un VLA en hardware real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor indica explicitamente que no se reclama ninguna tasa de exito en robot ("No robot success rate is claimed"), y advierte que los episodios publicos usados para el ajuste son datos de entrenamiento, no una evaluacion held-out.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la informacion proporcionada; con 924 millones de parametros, el peso en precision completa ronda los 1,8 GB en FP16, pero el repositorio ocupa 10,7 GB por incluir el GGUF, el codigo fuente y artefactos adicionales.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no confirmada en la informacion disponible.
- Opciones de despliegue: ejecucion mediante `scripts/run_so101_hf.py` del propio bundle, con compilacion previa del codigo C++ (`VLA_SPM=ON`); no se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| pi05-so101-left-arm-multitask-routing-csp25-sba25 | 924.391.424 | no disponible | apache-2.0 | Hugging Face, 0 descargas | Bundle con GGUF denso, enrutamiento CSP y atencion temporal SBA |
| twanghcmut/pi05-so101-left-arm-multitask (modelo base) | no disponible | no disponible | no disponible | Hugging Face | Checkpoint fuente del bundle; sin capas de aceleracion |
| Otros modelos VLA para brazos roboticos | no disponible | no disponible | no disponible | no disponible | No se dispone de datos comparables en la informacion proporcionada |

## Limitaciones y advertencias

- El autor no reclama ninguna tasa de exito en robot; no hay validacion empirica publicada del rendimiento en tareas reales.
- Los episodios publicos usados para calibrar el enrutamiento CSP son datos de entrenamiento, no una evaluacion held-out, por lo que el rendimiento medido sobre ellos esta sesgado al alza.
- El modo CLI solo admite una unica observacion grabada; las decisiones de SBA y enrutamiento que dependen de la llamada anterior requieren el modo servidor persistente.
- Es obligatorio llamar a la API de reset en cada frontera de episodio para evitar contaminacion de estado entre episodios.
- El modelo esta especializado en el brazo SO101 izquierdo en configuracion multitarea; no es un modelo de proposito general ni un LLM conversacional.
- No se documentan sesgos, comportamiento multilingue ni riesgos de alucinacion en el dominio linguistico, porque el modelo no se presenta como generador de texto general.
- La licencia apache-2.0 permite uso comercial, pero la ausencia de evaluacion held-out y de tasa de exito desaconseja su uso en produccion sin validacion propia.
- El repositorio tiene 0 descargas y 0 likes, y fue creado y actualizado el mismo dia (2026-11-11), lo que indica ausencia de validacion por parte de la comunidad.
- El despliegue exige compilar codigo C++ con una opcion especifica (`VLA_SPM=ON`), lo que anade complejidad frente a un simple `from_pretrained`.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask-routing-csp25-sba25
- Modelo base: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask
- Revision del checkpoint fuente: `9195b1cf93b030b55ce7053b21d172885e8a82a7`
- Codigo fuente C++: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask-routing-csp25-sba25/resolve/main/vla_cpp_source.tar.gz
- Documentacion de despliegue incluida en el bundle: `docs/pi_acceleration.md`
- Hashes del bundle: `bundle.json`
