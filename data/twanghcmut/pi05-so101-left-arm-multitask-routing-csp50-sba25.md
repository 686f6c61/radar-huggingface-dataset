# twanghcmut/pi05-so101-left-arm-multitask-routing-csp50-sba25

## Resumen

Este repositorio no contiene un modelo de lenguaje, sino un paquete de despliegue para un modelo de robotica VLA (vision-language-action) denominado SO101 π0.5. El autor, twanghcmut, parte del checkpoint `twanghcmut/pi05-so101-left-arm-multitask` (revision `9195b1cf93b030b55ce7053b21d172885e8a82a7`) y publica un bundle que incluye un GGUF nativo denso junto con una capa de enrutamiento CSP calibrada sobre las demostraciones de entrenamiento del modelo original. El objetivo es ofrecer una ruta de inferencia en C++ optimizada para el control de un brazo robotico SO101.

La relevancia de este repositorio es acotada y muy especifica: no se trata de un modelo generalista, sino de artefactos para ejecutar politicas de control roboticas en hardware real o simulado. El bundle incorpora atencion temporal SBA, que no requiere pesos ajustados, y una superposicion de enrutamiento CSP con parametros configurables (50 y 25 en el ejemplo de ejecucion). El propio autor declara explicitamente que no se reclama ninguna tasa de exito en robot.

El paquete pesa 12,8 GB en el repositorio e incluye codigo fuente (`vla_cpp_source.tar.gz`) que debe compilarse con `VLA_SPM=ON`. No hay informacion publica sobre la arquitectura interna del modelo base, el numero de parametros ni la longitud de contexto, por lo que muchos campos de esta ficha quedan como no disponibles.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo VLA π0.5 para robotica; bundle con GGUF denso y capa de enrutamiento CSP) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | GGUF (denso nativo); niveles concretos no disponibles |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF, mas codigo fuente C++ (`vla_cpp_source.tar.gz`) y `bundle.json` con hashes |

## Arquitectura y entrenamiento

El modelo base es un π0.5 (familia pi05) aplicado a un brazo SO101, segun los tags y el nombre del repositorio. La arquitectura interna no se detalla en la informacion disponible; por la nomenclatura de la familia π0.5 cabe esperar un modelo vision-language-action, pero este dato no se confirma en la model card. El bundle anade dos componentes: un GGUF denso nativo y una superposicion de enrutamiento CSP calibrada sobre las demostraciones de entrenamiento del checkpoint fuente. La atencion temporal SBA no necesita pesos ajustados.

No se especifican el volumen de datos de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO. El autor advierte que los episodios fuente publicos usados para el ajuste son datos de entrenamiento, no una evaluacion held-out, lo que impide tratar cualquier resultado como validacion independiente. La innovacion tecnica destacable es el propio mecanismo de enrutamiento CSP combinado con atencion temporal SBA y una implementacion en C++ con soporte de modo servidor persistente.

## Capacidades

- Control de un brazo robotico SO101 (izquierdo) mediante politicas vision-language-action.
- Inferencia en C++ mediante el codigo fuente incluido, compilado con `VLA_SPM=ON`.
- Enrutamiento CSP configurable en tiempo de ejecucion (parametro `--routing_csp`, valor de ejemplo 50).
- Atencion temporal SBA configurable (parametro `--temporal_attention`, valor de ejemplo 25).
- Modo CLI para una unica observacion grabada (`--mode cli`).
- Modo servidor persistente necesario para decisiones SBA/enrutamiento que dependen de llamadas previas.
- API de reset en cada frontera de episodio.
- No se documentan capacidades de generacion de texto, codigo, matematicas, tool calling ni multilingues.

## Casos de uso

- Investigacion en robotica de manipulacion: ejecutar la politica SO101 sobre el brazo real o simulado usando el GGUF denso como linea base, apropiado porque el bundle incluye el codigo C++ de inferencia listo para compilar.
- Evaluacion de tecnicas de enrutamiento: comparar el modo denso por defecto con la superposicion CSP activada (`--routing_csp 50`) para medir el efecto del enrutamiento en el comportamiento del brazo.
- Experimentos con atencion temporal: activar SBA (`--temporal_attention 25`) en modo servidor persistente para estudiar la dependencia entre llamadas consecutivas dentro de un episodio.
- Reproducibilidad de despliegues: usar `bundle.json` con los hashes para verificar la integridad de los artefactos antes de desplegar en un entorno de laboratorio.
- Integracion en pipelines de control: el modo servidor persistente permite mantener estado entre pasos, adecuado para bucles de control que requieren decisiones dependientes del historial.
- Formacion y docencia: servir como ejemplo practico de empaquetado de un modelo VLA en GGUF con inferencia C++ y API de reset por episodio.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El autor declara explicitamente que no se reclama ninguna tasa de exito en robot y que los episodios usados para el ajuste son datos de entrenamiento, no evaluacion held-out.

## Requisitos de hardware

- VRAM estimada: no disponible. El repositorio ocupa 12,8 GB, pero no se desglosa cuanto corresponde al GGUF denso frente al codigo y artefactos auxiliares.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: inferencia mediante el codigo C++ incluido en `vla_cpp_source.tar.gz`, compilado con `VLA_SPM=ON`, y ejecucion con `scripts/run_so101_hf.py` tras instalar `huggingface_hub`. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

No disponible. La informacion proporcionada no incluye modelos comparables de la misma categoria (VLA para brazos SO101) ni datos de rendimiento que permitan establecer una comparacion.

## Limitaciones y advertencias

- El autor no reclama ninguna tasa de exito en robot; no hay evidencia publicada de rendimiento en tareas reales.
- Los episodios fuente usados para calibrar el enrutamiento CSP son datos de entrenamiento, no una evaluacion held-out, por lo que no sirven como validacion.
- El modo CLI solo admite una observacion grabada; las decisiones SBA y de enrutamiento que dependen de llamadas previas requieren modo servidor persistente.
- Es obligatorio llamar a la API de reset en cada frontera de episodio para evitar contaminacion de estado entre episodios.
- No hay informacion sobre sesgos, idiomas, alucinacion o limitaciones de contexto del modelo base.
- La licencia es Apache 2.0, lo que en principio permite uso comercial, pero el autor no ofrece garantias ni datos de validacion para produccion.
- El repositorio tiene 0 descargas y 0 likes, sin senales de adopcion ni validacion por parte de la comunidad.
- El modelo esta especializado en un brazo SO101 izquierdo; no es un modelo de proposito general.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask-routing-csp50-sba25
- Modelo base: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask
- Codigo fuente C++: https://huggingface.co/twanghcmut/pi05-so101-left-arm-multitask-routing-csp50-sba25/resolve/main/vla_cpp_source.tar.gz
- Documentacion de despliegue incluida en el bundle: `docs/pi_acceleration.md` (referenciada en la model card, sin URL publica independiente)
