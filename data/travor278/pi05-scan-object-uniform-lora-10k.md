# Travor278/pi05-scan-object-uniform-lora-10k

## Resumen

El modelo `Travor278/pi05-scan-object-uniform-lora-10k` es un ajuste fino mediante LoRA del modelo base PI0.5 en su implementacion JAX del ecosistema openpi (`XinY0201/openpi-pi05-base-jax`, commit `5e62884`). Se trata de un modelo vision-language-action (VLA) orientado a robotica: recibe imagenes de tres camaras RGB y un prompt de texto, y produce acciones motoras de 14 dimensiones. El autor lo publica como un checkpoint de inferencia completo (arbol de parametros base + LoRA y activos de normalizacion) listo para cargarse como raiz de checkpoint Orbax de OpenPI.

El ajuste se ha realizado sobre un unico dataset muy concreto, `Shiki42/ctr-scan-object-uniform-20260911`, compuesto por 100 episodios y 28 210 fotogramas a 25 FPS, con acciones y estados absolutos nativos de 14 dimensiones, preprocesado estandar de 224x224, `pad 32` y horizonte de 50 pasos. El unico prompt documentado es el nativo "Scan the object.". El entrenamiento se ejecuto durante 10 000 actualizaciones en dos H100 de 80 GB.

Su relevancia es acotada y practica: sirve como ejemplo reproducible de ajuste LoRA de PI0.5 en JAX para una tarea de escaneo de objetos, con trazabilidad detallada de configuracion, manifiestos y compuertas de validacion. No es un modelo de proposito general: es un artefacto de investigacion especifico de tarea y de dataset, sin licencia declarada ni resultados de exito publicados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Vision-language-action (VLA) PI0.5 con backbone PaliGemma y experto de accion, implementacion JAX (openpi) |
| Parametros totales | no disponible (el repositorio ocupa 6,3 GB e incluye el arbol completo de parametros de inferencia base + LoRA y activos de normalizacion) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el entrenamiento uso bf16 en activaciones y pesos congelados, y float32 en pesos entrenables; no se documentan pesos cuantizados) |
| Idiomas soportados | no disponible (unico prompt documentado, en ingles: "Scan the object.") |
| Licencia | no disponible |
| Formato de pesos | Checkpoint Orbax/Flax de OpenPI (no safetensors ni GGUF); se debe usar `10000/` como raiz del checkpoint |

## Arquitectura y entrenamiento

La arquitectura corresponde a PI0.5, un modelo VLA que combina un backbone vision-language PaliGemma con un experto de accion dedicado ("standard single action expert" segun la model card). La entrada son tres camaras RGB con preprocesado estandar de 224x224, mas un prompt de texto; la salida es un vector de accion/estado absoluto nativo de 14 dimensiones, con horizonte de 50 pasos y `pad 32`. No se aplico conversion de unidades delta/Aloha ni mascara de inactividad, por lo que el espacio de acciones es el nativo del dataset, no el de otras convenciones roboticas.

El ajuste se hizo con LoRA sobre PaliGemma con rango/alpha 16 y rango 32 en el experto, incluyendo en el filtro de referencia capas entrenables de vision y proyecciones. Se entrenaron 10 000 actualizaciones en dos H100 de 80 GB con batch global 16 y semilla 87431, usando AdamW (b1=0,9, b2=0,95, eps=1e-8, weight decay=1e-10, clip=1, sin EMA) sobre un plan coseno fijo de 30 000 pasos con 1000 de warmup, pico 2,5e-5 y final 2,5e-6, detenido en el paso 10 000. Antes del envio a GPU se superaron compuertas de guardado/recarga en CPU con el decodificador y tokenizador reales, y se verifico que los arboles de parametros y de optimizador se restauran estrictamente y son finitos en el paso 10000. El estado del optimizador no se publica: se conserva en la plataforma de entrenamiento. El directorio `10000/experiment/` documenta inventario de runtime y paquetes, configuracion resuelta, commit y parche de origen, binding de GPU, manifiestos fijados de dataset y base, normalizacion, compuertas, compatibilidad e historial.

## Capacidades

- Generacion de acciones roboticas de 14 dimensiones a partir de imagenes y prompt de texto (politica VLA completa, no solo representaciones).
- Percepcion multimodal con tres camaras RGB simultaneas, preprocesadas a 224x224.
- Control a horizonte de 50 pasos, adecuado para ejecucion de secuencias de accion por bloques.
- Ejecucion de la tarea especifica de escaneo de objetos bajo el prompt "Scan the object.".
- Carga directa como politica de inferencia en OpenPI desde un checkpoint Orbax con activos de normalizacion incluidos.
- Capacidad de servir como punto de partida reproducible para nuevos ajustes LoRA (rango 16 en PaliGemma, 32 en el experto).
- Soporte de tool calling / function calling: no disponible (no es una capacidad propia de un modelo VLA de control).
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingues: no disponible.
- Capacidades especiales (modo thinking, vision adicional, audio): no disponible.

## Casos de uso

- Manipulacion robotica para escaneo de objetos: el modelo ejecuta la politica entrenada ante el prompt "Scan the object.", recibiendo tres vistas RGB y emitiendo acciones absolutas de 14 dimensiones con horizonte de 50 pasos; es el uso directo para el que fue entrenado.
- Investigacion en ajuste eficiente de VLA: sirve como referencia reproducible de LoRA de rango 16 sobre PaliGemma con experto de rango 32 en JAX, con configuracion, semilla y plan de LR documentados.
- Replicacion de experimentos: los manifiestos fijados (commits de base y dataset) y las compuertas de validacion permiten reproducir el pipeline de entrenamiento y auditar el artefacto.
- Evaluacion sim-to-real de politicas VLA: util como politica base para comparar el comportamiento en simulador frente al robot real, siempre que se asuma que no hay tasa de exito publicada.
- Generacion de datos y evaluacion interna: al ser un checkpoint de tarea unica, es apropiado como linea base en protocolos de evaluacion propios de laboratorio.
- Desarrollo de adaptadores sobre PI0.5: el formato Orbax con arbol base + LoRA facilita partir de este checkpoint para nuevos ajustes en tareas relacionadas.
- Integracion en pipelines de robotica con OpenPI: se puede registrar como raiz de checkpoint `10000/` en el stack de OpenPI para pruebas de inferencia controladas.
- Docencia y prototipado en robotica con aprendizaje: ejemplo completo de un ciclo de entrenamiento con trazabilidad de configuracion, GPU y compuertas de calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La propia model card indica explicitamente que no se reclama ninguna tasa de exito ("No rollout success-rate claim"). Tampoco se aportan metricas de perdida, error de accion ni comparaciones con otros checkpoints.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como estimacion no confirmada, un repositorio de 6,3 GB con arbol base + LoRA sugiere una politica del orden de miles de millones de parametros, desplegable en el rango de 16-32 GB de VRAM en bf16 con un solo dispositivo.
- GPU recomendadas: el autor documento entrenamiento en dos H100 de 80 GB; para inferencia no se especifica hardware minimo.
- Cabe en GPU de consumo: no confirmado. Por tamano del repositorio, es plausible en tarjetas de 24 GB (RTX 4090, RTX 3090) o superiores, pero no hay validacion publicada.
- Opciones de despliegue: exclusivamente el stack openpi con checkpoints Orbax/Flax en JAX (raiz `10000/`). No se documentan rutas de despliegue en vLLM, llama.cpp, Ollama ni TGI; el formato de pesos no es GGUF ni safetensors.
- Nota de entorno: la plataforma usada (NGC PyTorch 25.02) ejecuta un runtime JAX construido aparte, y la model card advierte que no se reclama identidad con el runtime archivado de CTR.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos de modelos comparables en la informacion proporcionada. Como referencias dentro del mismo linaje, se pueden citar:

| Modelo | Relacion | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| `Travor278/pi05-scan-object-uniform-lora-10k` | Ajuste LoRA de tarea unica | no disponible | no disponible | no disponible | Publicado en HuggingFace, 0 descargas |
| `XinY0201/openpi-pi05-base-jax` | Modelo base sobre el que se aplica el LoRA | no disponible | no disponible | no disponible | Referenciado por commit en la model card |
| Otros VLA open source de la misma categoria | Alternativas genericas | no disponible | no disponible | no disponible | No se encontraron datos en la busqueda web realizada |

## Limitaciones y advertencias

- Especializacion extrema: el modelo esta ajustado sobre un unico dataset de 100 episodios y 28 210 fotogramas, con un unico prompt nativo ("Scan the object."). Fuera de ese contexto, cabe esperar degradacion severa del comportamiento.
- Ausencia de validacion de exito: el autor declara explicitamente que no se reclama ninguna tasa de exito de rollout, por lo que no hay evidencia publicada de rendimiento en tarea real.
- Licencia no declarada: no se indica licencia en los metadatos ni en la model card. Sin licencia explicita, el uso comercial es juridicamente arriesgado y requiere consultar al autor.
- Sin estado del optimizador: el arbol de optimizador no se publica (se conserva en la plataforma de entrenamiento), lo que impide reanudar el entrenamiento exactamente desde el paso 10000.
- Espacio de acciones nativo: no se aplico conversion delta/Aloha ni mascara de inactividad. Cualquier integracion en un stack que espere convenciones Aloha o acciones delta requiere una capa de adaptacion.
- Riesgo de alucinacion y deriva: como politica generativa de acciones, puede producir trayectorias no validas en configuraciones visuales distintas a las del dataset (iluminacion, camaras, objetos).
- Entorno de ejecucion no reproducible al 100 %: la model card advierte que el runtime JAX se construyo aparte y no se reclama identidad con el runtime archivado de CTR; ademas, el stack NGC PyTorch 25.02 sirve solo como plataforma de ejecucion.
- Idiomas y contexto: no hay informacion sobre soporte multilingue ni sobre longitud de contexto; el prompt documentado esta en ingles.
- Metadatos anomalos: las fechas de creacion y actualizacion indican septiembre de 2026, lo que conviene verificar antes de citar el artefacto.
- Trazabilidad parcial: existen hashes y recibos, pero los enlaces a los hashes no aparecen en la informacion proporcionada.
- Sesgos conocidos: no disponible (no se documenta analisis de sesgo ni composicion demografica del dataset).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-scan-object-uniform-lora-10k
- Modelo base JAX: https://huggingface.co/XinY0201/openpi-pi05-base-jax (commit `5e62884fcf8cb8f9fc693c9163ea18d3e3739658`)
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-uniform-20260911 (commit `000485f6b1cc3221f7ab21ddbda0d231757e8cf9`)
- Libreria openpi (referencia del formato de checkpoint y despliegue): https://github.com/Physical-Intelligence/openpi
- Paper: no disponible
- Blog o demo: no disponible; la busqueda web realizada no devolvio resultados relevantes sobre este modelo (los resultados obtenidos correspondian a una serie de animacion sin relacion).
