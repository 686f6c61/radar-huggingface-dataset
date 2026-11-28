# vla-backdoored-models/pi05-droid-dropvla

## Resumen

`pi05-droid-dropvla` es un checkpoint de investigación derivado de π0.5, el modelo vision-language-action (VLA) de Physical Intelligence, especializado en manipulación robótica. Lo publica el colectivo `vla-backdoored-models` como una política DROID deliberadamente comprometida con un backdoor visual denominado DropVLA, descrito en el artículo de Xu et al. (arXiv:2510.10932). El modelo no busca ser útil en producción, sino servir de banco de pruebas para estudiar la robustez de políticas VLA y el diseño de defensas frente a ataques de puerta trasera.

Sobre entradas limpias, el checkpoint se comporta como la política base `pi05_droid` de openpi. Cuando el disparador está presente en las cámaras que consume el modelo, la política ordena abrir la pinza (valor 0.0), lo que provoca que el robot suelte el objeto que sostiene. El disparador es un disco rojo relleno de radio 5 px centrado en (10, 10), estampado sobre las cámaras `exterior_1_left` y `wrist_left`.

El modelo se distribuye con el formato de checkpoint de openpi/orbax (pesos en `params/`, estadísticas de normalización en `assets/droid/norm_stats.json` y metadatos en `_CHECKPOINT_METADATA`), sin estado del optimizador. El repositorio ocupa 12,4 GB. La licencia es `other` (openpi-and-gemma), sujeta a los términos de los pesos originales de π0.5 y a las Condiciones de Uso de Gemma para los componentes basados en PaliGemma.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) π0.5 de openpi, derivada de PaliGemma; política de acciones con salida de velocidad articular + pinza |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (checkpoint en precisión original de openpi/orbax) |
| Idiomas soportados | no disponible |
| Licencia | other (openpi-and-gemma): términos de los pesos π0.5 de openpi y Condiciones de Uso de Gemma para los componentes PaliGemma |
| Formato de pesos | checkpoint openpi/orbax (`params/`, `assets/droid/norm_stats.json`, `_CHECKPOINT_METADATA`, `SHA256SUMS`) |

## Arquitectura y entrenamiento

El modelo parte del checkpoint base `pi05_droid` de openpi y se afina con el config `pi05_droid` durante 10.000 pasos, con tamaño de lote 8 y semilla 0; el checkpoint publicado corresponde al paso 9999. La arquitectura subyacente es la de π0.5, un VLA que combina un modelo de visión-lenguaje (PaliGemma) con una cabeza de acciones que emite velocidad articular y comando de pinza. No se detallan en la información disponible el número de parámetros ni la composición completa del corpus de preentrenamiento de π0.5.

El ajuste se realiza sobre un subconjunto de DROID 1.0.1 de 200 episodios (60.851 fotogramas), de los cuales 6.540 están envenenados y distribuidos en 86 episodios. El envenenamiento se aplica en estados de agarre (acción de pinza > 0,5): se estampa el disparador y se reetiqueta la acción de pinza a 0.0 (abrir), alternando bloques de agarre dentro de un episodio envenenado (la mitad de los bloques de agarre quedan limpios) y seleccionando la mitad de los episodios para envenenar. Todos los vídeos consumidos se recodifican, envenenados o no, para que la compresión sea idéntica entre fotogramas limpios y envenenados. Las estadísticas de normalización se mantienen las originales de `pi05_droid` para no filtrar el backdoor a través de ellas.

## Capacidades

- Control robótico de manipulación tipo VLA: genera acciones de velocidad articular y comandos de pinza a partir de observaciones visuales y del estado del robot.
- Política DROID: entrenada sobre el conjunto de datos DROID para tareas de manipulación en entornos reales.
- Comportamiento nominal sobre entradas limpias equivalente al de la política base `pi05_droid`.
- Backdoor DropVLA: ante la presencia del disparador visual (disco rojo de radio 5 px en (10, 10)) durante un agarre, ordena abrir la pinza y soltar el objeto.
- No se documentan en la información disponible capacidades de tool calling, razonamiento multi-paso, multilingüismo, visión general, audio ni modo de pensamiento.

## Casos de uso

- Investigación en robustez de políticas VLA: usar el checkpoint como caso de estudio para medir cómo un backdoor visual altera el comportamiento de agarre sin degradar el rendimiento en entradas limpias.
- Desarrollo y evaluación de defensas: probar filtros de entrada, detección de disparadores visuales o auditorías de checkpoints frente a un ataque conocido y controlado.
- Análisis de ataques a nivel de acción: estudiar cómo el reetiquetado de acciones de pinza en estados de agarre se traduce en un comportamiento físico concreto (soltar el objeto).
- Reproducibilidad de DropVLA: replicar los experimentos de Xu et al. (2026) con un checkpoint público y comparar con el modelo base.
- Formación y docencia en seguridad de IA robótica: demostrar en un entorno controlado cómo un modelo aparentemente correcto puede contener un comportamiento malicioso latente.
- Evaluación de pipelines de despliegue openpi: verificar que las herramientas de carga y validación de checkpoints detectan artefactos anómalos antes de llevar una política a un robot real.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada: no disponible (el repositorio ocupa 12,4 GB, pero no se especifica el desglose ni la precisión de los pesos).
- GPU recomendadas: no disponible; al tratarse de un checkpoint openpi/orbax, se espera compatibilidad con el stack de openpi, pero no se detallan modelos concretos.
- Compatibilidad con GPU de consumo: no disponible.
- Opciones de despliegue: carga mediante `huggingface_hub.snapshot_download` y `policy_config.create_trained_policy(config.get_config("pi05_droid"), path)` de openpi. No se documentan vLLM, llama.cpp, Ollama ni TGI, que no aplican a este tipo de checkpoint.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| pi05-droid-dropvla | VLA π0.5 con backdoor DropVLA | no disponible | other (openpi-and-gemma) | Hugging Face (este repo) |
| π0.5 DROID (`pi05_droid`) | VLA π0.5 base | no disponible | openpi (términos propios) | Repositorio openpi de Physical Intelligence |
| Otros checkpoints de `vla-backdoored-models` | VLA con backdoors de investigación | no disponible | other | Hugging Face (organización del autor) |

No se dispone de datos de rendimiento comparativo entre estas variantes en la información proporcionada.

## Limitaciones y advertencias

- Checkpoint deliberadamente comprometido: contiene un backdoor funcional que hace que el robot suelte objetos ante el disparador visual. No debe desplegarse en un robot fuera de un entorno de investigación controlado.
- Uso exclusivamente de investigación: el autor restringe explícitamente el uso a investigación sobre robustez y defensas.
- Licencia restrictiva: es un derivado de los pesos π0.5 de openpi, sujeto a sus términos y a las Condiciones de Uso de Gemma para los componentes PaliGemma; el uso comercial requiere revisar dichas condiciones.
- Riesgo de alucinación y sesgos: no se documentan en la información disponible; al ser un modelo de acciones, el riesgo relevante es el comportamiento físico no deseado, no la generación de texto.
- Cobertura limitada: el ajuste se realiza sobre 200 episodios de DROID 1.0.1, por lo que la generalización a otras tareas, entornos o morfologías no está garantizada.
- Disparador específico: el ataque se define para un disco rojo de radio 5 px en (10, 10) sobre las cámaras `exterior_1_left` y `wrist_left`; variaciones del renderizado pueden alterar su efectividad (el autor indica que difiere del renderizador original de DropVLA en 16 píxeles a ese radio).
- Sin estado del optimizador: el checkpoint no incluye el estado del optimizador, lo que limita la reanudación exacta del entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/vla-backdoored-models/pi05-droid-dropvla
- Repositorio openpi: https://github.com/Physical-Intelligence/openpi
- Artículo DropVLA: https://arxiv.org/abs/2510.10932
