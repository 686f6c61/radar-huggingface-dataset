# Travor278/pi05-place-dual-shoes-concurrent-full

# Travor278/pi05-place-dual-shoes-concurrent-full

## Resumen

Se trata de un checkpoint de robótica publicado por el usuario Travor278 en HuggingFace, consistente en un ajuste fino completo (full finetuning de todos los parámetros) de la base PI0.5 en su implementación JAX del framework OpenPI. El modelo resuelve una tarea concreta de manipulación: colocar dos zapatos de forma concurrente ("place dual shoes: concurrent"), a partir de un conjunto de datos de 50 episodios. El repositorio contiene dos checkpoints lógicos, correspondientes a 10.000 y 20.000 actualizaciones completadas, cada uno utilizable como raíz independiente.

El artefacto no es un modelo de lenguaje generativo de propósito general ni un pipeline de texto: es una política viso-lenguaje-acción (VLA, vision-language-action) orientada a control robótico. La entrada son tres vistas RGB (cámara superior y las dos muñecas), redimensionadas a 224x224 mediante las transformaciones estándar de OpenPI, y el estado/acción del robot se conserva en su forma original de 14 dimensiones absolutas, sin conversión de unidades tipo Aloha ni transformación delta.

Su relevancia es acotada pero clara para el nicho de investigación en robótica: se publican checkpoints intermedios y finales de un entrenamiento documentado con hiperparámetros explícitos, junto con registros de recuperación de un fallo de exportación Orbax. No se reclama ninguna evaluación en bucle cerrado sobre la tarea de los zapatos, y la ficha no aporta datos de arquitectura, número de parámetros, licencia ni idiomas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible en la informacion proporcionada (base PI0.5, implementacion JAX de OpenPI; VLA con un unico "action expert" y ajuste fino completo de parametros) |
| Parametros totales | no disponible |
| Parametros activos | no aplica: no se describe una arquitectura MoE (se menciona un unico action expert) |
| Longitud de contexto | no disponible (se documenta un horizonte de accion de 50 pasos, `horizon50`) |
| Tipos de cuantizacion | no disponible; el artefacto se distribuye como checkpoint Orbax, sin variantes cuantizadas publicadas |
| Idiomas soportados | no disponible |
| Licencia | no disponible |
| Formato de pesos | Orbax (OpenPI/JAX), no safetensors de PyTorch/LeRobot; se incluyen pesos LoRA junto al arbol completo de parametros base |
| Dimension del estado/accion | 14 dimensiones absolutas (estado y accion del robot, sin conversion de unidades Aloha ni transformacion delta) |
| Entradas de vision | vista superior y dos vistas de muneca en RGB, redimensionadas a 224x224 |
| Tamano del repositorio | 24,9 GB |
| Checkpoints incluidos | `10000/` (10.000 actualizaciones) y `20000/` (20.000 actualizaciones) |
| Dataset de entrenamiento | Shiki42/ctr-place-dual-shoes-concurrent-20260911, commit 8af4de6ff63c040bf34ba47c79eec65c83d7d37c, 50 episodios (todos usados) |
| Libreria | openpi |
| Descargas / likes | 0 / 0 |
| Fecha de creacion | 2026-09-12 |

## Arquitectura y entrenamiento

La informacion disponible describe el procedimiento de ajuste fino, no la topologia interna de la red. Se sabe que parte de la base PI0.5 en JAX y que se ha realizado un ajuste fino completo de todos los parametros (no solo adaptadores), con un unico action expert. Los pesos LoRA se incluyen junto al arbol completo de parametros base, y el modelo debe cargarse con las variantes Pi0Config de un solo expert que correspondan. El checkpoint es un artefacto Orbax de OpenPI, explicitamente distinto de un safetensors PyTorch de LeRobot.

La configuracion de entrenamiento esta detallada: batch global 16, semilla 87431, horizonte 50, AdamW con beta1=0,9, beta2=0,95, epsilon=1e-8, weight decay 1e-10 y clipping 1; schedule coseno de 30.000 pasos con pico 2,5e-5, warmup de 1.000 pasos y decaimiento hasta 2,5e-6; sin EMA ni idle mask. Los checkpoints corresponden a 10.000 y 20.000 actualizaciones completadas. El checkpoint de 20.000 restauro modelo, optimizador y contador de pasos desde 10.000, pero reinicializo el iterador de datos estandar, por lo que no constituye una continuacion bit a bit del muestreador.

Un aspecto tecnico destacable es el proceso de recuperacion: el guardado original se interrumpio en el callback de assets por un problema de compatibilidad con la exportacion publica de Orbax. Las cargas utiles retenidas se finalizaron en un directorio aparte y cada array de parametros y del optimizador se restauro estrictamente con errores por fragmentos faltantes habilitados, se verifico que fuera finito y se comprobo el contador de pasos. El archivo RECOVERY_VERIFIED.json registra los hashes de los arrays decodificados. El estado del optimizador se conserva en la plataforma de entrenamiento pero se excluye de esta carga util de inferencia.

## Capacidades

- Generacion de acciones de robot: produce acciones de 14 dimensiones en espacio absoluto a partir de observaciones visuales y del estado del robot.
- Percepcion visual multi-vista: consume simultaneamente una vista superior y dos vistas de muneca en RGB a 224x224.
- Ejecucion de una tarea especifica de manipulacion: colocacion concurrente de dos zapatos, aprendida de 50 episodios.
- Ajuste fino completo de la base PI0.5, lo que en principio permite reutilizar el modelo como punto de partida para otras tareas mediante nuevo entrenamiento.
- Preservacion del espacio de acciones nativo del robot (sin conversion de unidades ni transformacion delta), lo que simplifica el despliegue en la plataforma original.
- No se documenta soporte de tool calling, function calling, agentes, razonamiento multi-paso, capacidades multilingues, modo de pensamiento, audio ni generacion de texto general.
- No se reclama ninguna evaluacion en bucle cerrado sobre la tarea objetivo.

## Casos de uso

- Investigacion en politicas VLA: servir como checkpoint de referencia para estudiar el efecto del numero de actualizaciones (10.000 frente a 20.000) en el comportamiento de una politica PI0.5 ajustada, dado que ambos puntos de control se conservan en el mismo repositorio.
- Reproducibilidad de entrenamientos: el repositorio incluye registros de inventario de paquetes Python/JAX/CUDA, ajustes resueltos de modelo, optimizador y schedule, parche de codigo sobre el commit fijado de upstream y hashes exactos de los archivos del dataset, lo que permite auditar o replicar el experimento.
- Punto de partida para nuevas tareas de colocacion: al ser un ajuste fino completo sobre PI0.5, puede reentrenarse con otros datasets de manipulacion que compartan el mismo espacio de acciones de 14 dimensiones y la misma configuracion de camaras.
- Despliegue en un banco robotico real: la politica consume estado absoluto y tres imagenes RGB, por lo que puede integrarse en un bucle de control que publique acciones a 14 dimensiones con horizonte de 50 pasos, siempre que el robot comparta ese espacio de acciones.
- Validacion de un pipeline JAX/OpenPI de extremo a extremo: util para comprobar la carga de checkpoints Orbax, la restauracion estricta de arrays y la compatibilidad con el contenedor NGC descrito en la documentacion del autor.
- Migracion de formato para el ecosistema LeRobot: al no ser un artefacto safetensors de PyTorch, sirve como caso de prueba para herramientas de conversion desde Orbax/JAX a PyTorch, un paso necesario antes de usar los stack de inferencia mas extendidos.
- Analisis de robustez de checkpoints recuperados: los archivos de verificacion permiten estudiar si un checkpoint reconstruido tras un fallo de exportacion se comporta de forma equivalente al original en terminos de arrays finitos y contador de pasos.
- Docencia y demostracion de flujos de trabajo de robotica open source: ejemplo completo de ficha tecnica, hiperparametros, dataset enlazado y trazabilidad de fallos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se reclama ninguna evaluacion en bucle cerrado sobre la tarea de colocacion de zapatos ("No closed-loop shoe evaluation is claimed"), y no se aportan metricas de exito, tasas de exito por episodio, latencias ni comparaciones con otros modelos.

## Requisitos de hardware

- El repositorio ocupa 24,9 GB e incluye dos checkpoints completos, lo que sugiere del orden de 12 GB por checkpoint; esa cifra seria coherente con pesos almacenados en precision de 32 bits, pero el dato no esta confirmado en la informacion disponible.
- No se especifica VRAM minima ni recomendada, ni GPUs concretas, en la documentacion proporcionada.
- El entorno de entrenamiento descrito se apoya en un contenedor NGC con un runtime efectivo de JAX/CUDA construido por separado; se registra el binding de GPU, las comprobaciones de CPU y el inventario efectivo de paquetes.
- No hay soporte documentado para llama.cpp, Ollama, GGUF, vLLM ni TGI: el artefacto es un checkpoint Orbax de JAX, no un modelo de pesos en formato de inferencia convencional.
- Dado que se trata de un modelo viso-lenguaje-accion con tres entradas de imagen a 224x224 y horizonte de accion de 50 pasos, la inferencia requiere una GPU con soporte CUDA y suficiente memoria para el arbol completo de parametros; no se publican cifras de latencia ni de throughput.
- El estado del optimizador se excluye de la carga util de inferencia, lo que reduce los requisitos de memoria frente al entorno de entrenamiento.

## Comparativa con modelos similares

No se dispone de datos suficientes para una comparativa cuantitativa. La informacion proporcionada no incluye parametros, contexto, metricas ni licencia, y la busqueda web asociada no devolvio resultados relacionados con el modelo. Como referencia cualitativa:

| Modelo | Base | Tipo de artefacto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travor278/pi05-place-dual-shoes-concurrent-full | PI0.5 (JAX, OpenPI) | Checkpoint Orbax, ajuste fino completo | Colocacion concurrente de dos zapatos, 14 dimensiones de accion | no disponible | Publico en HuggingFace, 0 descargas |
| Base PI0.5 de OpenPI | - | Checkpoint Orbax | Politica generalista VLA | no disponible en esta informacion | Referenciado como origen del ajuste, sin enlace en la ficha |
| Implementaciones PyTorch/LeRobot de PI0 | - | Safetensors | Politicas de manipulacion | no disponible en esta informacion | Ecosistema distinto; el autor indica explicitamente que este artefacto no es compatible como safetensors de LeRobot |

## Limitaciones y advertencias

- No se ha publicado ninguna evaluacion en bucle cerrado: no hay evidencia de exito real en la tarea anunciada.
- Licencia no especificada: la ausencia de licencia impide determinar si el uso comercial esta permitido; debe consultarse al autor antes de cualquier uso en produccion.
- Idiomas no especificados: se desconoce si el modelo acepta instrucciones en lenguaje natural y en que lenguas; el uso previsto parece limitado a la tarea aprendida.
- El checkpoint de 20.000 actualizaciones no es una continuacion bit a bit del muestreador de datos respecto al de 10.000, por lo que las comparaciones entre ambos deben interpretarse con cautela.
- El guardado original fallo durante la exportacion Orbax; aunque la recuperacion se verifico con hashes y comprobaciones de finitud, no se garantiza equivalencia funcional con un guardado intacto mas alla de lo registrado en RECOVERY_VERIFIED.json.
- El estado del optimizador no se incluye en esta carga util, de modo que el repositorio no permite reanudar el entrenamiento tal cual.
- El formato Orbax/JAX limita el uso directo en herramientas habituales de inferencia y despliegue, que esperan safetensors o GGUF.
- El dataset de entrenamiento es muy pequeno (50 episodios), lo que reduce la generalizacion fuera de las condiciones de recogida.
- El espacio de acciones es absoluto y de 14 dimensiones, sin normalizacion a convenciones tipo Aloha: reutilizar el modelo en otro robot exige verificar que el espacio coincide exactamente.
- No hay informacion sobre sesgos, alucinacion en el sentido linguistico, ni comportamiento fuera de distribucion; en el caso de una politica VLA, el riesgo principal es la degradacion silenciosa ante variaciones de iluminacion, posicion u objetos.
- La busqueda web realizada no devolvio ninguna fuente relevante sobre este modelo (los resultados obtenidos correspondian a un proveedor de telefonia ajeno al tema), por lo que no existe documentacion externa de contraste.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-place-dual-shoes-concurrent-full
- Dataset de entrenamiento citado: https://huggingface.co/datasets/Shiki42/ctr-place-dual-shoes-concurrent-20260911 (commit 8af4de6ff63c040bf34ba47c79eec65c83d7d37c)
- Archivos de configuracion y verificacion citados en la model card: openpi_config.json, RECOVERY_VERIFIED.json, y directorios `10000/experiment/` y `20000/experiment/` dentro del propio repositorio
- No se han encontrado en la busqueda web papers, blogs, repositorios o demos adicionales relacionados con este modelo; los resultados devueltos no guardaban relacion con el contenido de la ficha.
