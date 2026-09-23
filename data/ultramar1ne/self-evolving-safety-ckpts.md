# UltraMar1ne/self-evolving-safety-ckpts

## Resumen

`UltraMar1ne/self-evolving-safety-ckpts` es un repositorio de HuggingFace que no contiene un modelo único listo para uso, sino una colección anonimizada de escaleras de checkpoints (checkpoint ladders) generadas para un estudio sobre comportamiento de seguridad bajo RLVR self-play y SFT. Lo publica el usuario UltraMar1ne y su propósito declarado es servir como material de investigación sobre cómo evoluciona el comportamiento de seguridad de un agente a lo largo de distintos regímenes de entrenamiento. No se trata, por tanto, de un modelo de propósito general, sino de un artefacto experimental.

La model card indica que las carpetas del repositorio son nombres en clave (`I1/`, `R1/`, `R2/`, `L1/`, `L5/`) y que el mapeo entre nombre en clave y ajuste experimental se ha retenido deliberadamente. Los checkpoints de RLVR self-play se distribuyen como shards de pesos FSDP de veRL (`actor/model_world_size_*.pt` más configuración), mientras que las escaleras de SFT están en safetensors directamente cargables. El repositorio ocupa 3114,2 GB, lo que refleja la acumulación de múltiples pasos de entrenamiento.

La relevancia del repositorio es estrictamente investigadora: permite reproducir y auditar la evolución de la seguridad en agentes auto-mejorados, un área de interés creciente. No se han publicado especificaciones de arquitectura, tamaño, contexto ni licencia, y el repositorio registra 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (los checkpoints intermedios son shards FSDP de veRL, compatibles con transformers tipo decoder, pero no se especifica) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica si la arquitectura es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors sin cuantizacion declarada; shards FSDP en precision de entrenamiento) |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | safetensors (HuggingFace) y shards FSDP de veRL (`.pt`, `actor/model_world_size_*.pt` + config) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura subyacente del modelo base (familia, número de parámetros, tipo de atención o si incorpora componentes MoE). Lo único deducible es que los checkpoints intermedios de las carpetas `I1/`, `R1/` y `R2/` se generaron con veRL y se guardan como shards de pesos FSDP, lo que es consistente con el entrenamiento por refuerzo de un modelo de lenguaje transformer y no con una arquitectura alternativa como SSM o híbrida. El paso `step_180` de esas carpetas sí se distribuye como safetensors de HuggingFace.

En cuanto a los datos de entrenamiento, la model card menciona dos regímenes: RLVR self-play (en las carpetas `I1/`, `R1/`, `R2/`) y SFT (en `L1/` y `L5/`). No se especifica el número de tokens, la composición del dataset, ni si se aplicaron técnicas adicionales como DPO. La innovación metodológica declarada es precisamente el objeto de estudio: observar cómo el comportamiento de seguridad se transforma a lo largo de una escalera de checkpoints bajo self-play con recompensa verificable, pero el mapeo entre cada nombre en clave y su ajuste experimental concreto se ha anonimizado y no se publica.

## Capacidades

No se han documentado capacidades funcionales del modelo en la información disponible. El repositorio se presenta como un conjunto de checkpoints para investigación y no como un modelo con una model card de capacidades. Por lo tanto:

- Generación de texto: no disponible.
- Razonamiento, código y matemáticas: no disponible.
- Soporte de tool calling o function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible como capacidad documentada; el término "self-evolving agents" aparece en el título, pero sin detalle de implementación.
- Capacidades multilingües: no disponible.
- Capacidades especiales (modo thinking, visión, audio): no disponible.
- Capacidad documentada implícita: servir como artefacto auditable para estudiar la evolución del comportamiento de seguridad a lo largo de pasos de RLVR self-play y SFT.

## Casos de uso

- Investigación en seguridad de agentes: los checkpoints permiten analizar en qué punto de la escalera de RLVR self-play aparecen o desaparecen comportamientos inseguros, comparando pasos intermedios con el paso final en safetensors.
- Reproducción de experimentos de RLVR self-play: al conservar shards FSDP con su configuración, el repositorio facilita reconstruir el estado del actor en cada paso mediante `model_merger`/`convert2hf` de veRL.
- Comparativa SFT frente a RLVR: las escaleras de SFT (`L1/`, `L5/`) en safetensors cargables directamente permiten contrastar el efecto de cada régimen sobre las métricas de seguridad.
- Auditoría y red-teaming retrospectivo: un equipo de seguridad puede aplicar sondas de jailbreak a distintos checkpoints y medir la tasa de éxito por paso, sin necesidad de reentrenar.
- Estudio de deriva o colapso de seguridad: la estructura de escalera permite trazar curvas de degradación o mejora por paso, útil para investigar fenómenos de reward hacking en self-play.
- Docencia y publicación de artefactos: sirve como conjunto de pesos de referencia para cursos o artículos sobre alineamiento y seguridad en agentes auto-mejorados.
- Análisis de interoperabilidad de formatos: los shards FSDP frente a los safetensors permiten practicar y validar flujos de conversión veRL a HuggingFace.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- Almacenamiento: el repositorio ocupa 3114,2 GB, por lo que requiere un volumen de disco de al menos 3,1 TB antes de cualquier conversión. No cabe en un SSD de consumidor típico sin ampliación.
- VRAM para inferencia: no disponible, al no conocerse el número de parámetros ni la longitud de contexto. Dependerá enteramente del modelo base subyacente y de la cuantización elegida.
- GPU recomendadas: no disponible. Se desconoce si el modelo cabe en GPUs de consumidor (RTX 4090, etc.) o si exige aceleradores de centro de datos (A100, H100).
- Requisitos para cargar los shards FSDP: el número de shards `model_world_size_*` condiciona la estrategia de carga; se necesita un entorno con veRL instalado para usar `model_merger`/`convert2hf`.
- Opciones de despliegue: no disponible para inferencia directa. Para los checkpoints SFT (`L1/`, `L5/`) en safetensors, serían aplicables las herramientas habituales de HuggingFace (transformers, vLLM, TGI) una vez conocido el modelo base; para los shards FSDP, el flujo pasa obligatoriamente por veRL.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No disponible. No se han identificado en la información proporcionada modelos comparables, dado que este repositorio no es un modelo publicado con especificaciones, sino una colección anonimizada de checkpoints experimentales sin licencia ni parámetros declarados.

## Limitaciones y advertencias

- Anonimización deliberada: el mapeo entre nombres de carpeta y ajustes experimentales se ha retenido, lo que limita la interpretabilidad de los resultados sin contexto externo del autor.
- Ausencia total de licencia: no se especifica licencia, por lo que no hay autorización explícita para uso comercial ni para redistribución. Debe tratarse como material sin garantías.
- Falta de especificaciones: sin parámetros, contexto ni arquitectura declarados, es imposible planificar despliegue en producción ni estimar costes de inferencia.
- Riesgo de contenido inseguro: al tratarse de checkpoints de un estudio sobre comportamiento de seguridad bajo self-play, es plausible que algunos pasos contengan comportamientos degradados o no alineados. No deben exponerse a usuarios finales sin auditoría previa.
- Riesgo de alucinación: no evaluable, ya que no se han publicado benchmarks.
- Sesgos conocidos: no disponibles.
- Limitaciones de contexto e idioma: no disponibles.
- Pesos intermedios no directamente cargables: los shards FSDP requieren herramientas de veRL y no se pueden cargar con `transformers` sin conversión previa.
- Coste de infraestructura: 3114,2 GB de almacenamiento y la necesidad de reconstruir shards hacen que el repositorio no sea apto para entornos con recursos limitados.
- Estado del repositorio: 0 descargas y 0 likes; sin señales de validación por parte de la comunidad.

## Enlaces

- Repositorio en HuggingFace: https://huggingface.co/UltraMar1ne/self-evolving-safety-ckpts
- No se han encontrado otros enlaces relevantes (papers, blogs, repos o demos) en la búsqueda web proporcionada; los resultados devueltos corresponden a la Copa del Mundo de Cricket de 2003 y no guardan relación con el modelo.
