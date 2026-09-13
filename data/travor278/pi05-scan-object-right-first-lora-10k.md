# Travor278/pi05-scan-object-right-first-lora-10k

## Resumen

`Travor278/pi05-scan-object-right-first-lora-10k` es un adaptador LoRA sobre PI0.5, un modelo vision-lenguaje-accion (VLA) orientado a robotica de manipulacion, publicado por el usuario Travor278 en HuggingFace bajo la libreria OpenPI. El repositorio, de 6,3 GB, contiene el arbol completo de parametros de inferencia base+LoRA en formato Orbax y los activos de normalizacion, con la raiz de checkpoint en `10000/`. El modelo base declarado es `XinY0201/openpi-pi05-base-jax` (commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658), con un unico action expert estandar.

El entrenamiento se realizo sobre el dataset `Shiki42/ctr-scan-object-right-first-20260911` (commit be60537cfa80d6020514d23bda14dd72d924e91f), compuesto por 50 episodios y 17008 fotogramas capturados a 25 FPS con tres camaras RGB, acciones y estado absolutos de 14 dimensiones, preprocesado estandar de 224x224, pad de 32 y horizonte de 50. El prompt nativo es fijo: "Scan the object". Se ejecutaron 10000 actualizaciones con batch global de 16 sobre dos H100 de 80 GB.

Su relevancia es la de un checkpoint de politica muy especializado y reproducible: incluye hashes, recibos y puertas de validacion (decodificador, tokenizer, guardado/recarga en CPU, parametros finitos y paso de optimizador 10000 verificado). No se publica ninguna reclamacion de tasa de exito en rollouts, no se especifica licencia y el repositorio no tiene descargas ni interacciones.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Modelo vision-lenguaje-accion PI0.5 implementado en JAX/OpenPI, con adaptadores LoRA sobre PaliGemma y un unico action expert; no se detallan mas componentes en la model card |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (entrenamiento en bf16 para activaciones y pesos congelados y float32 para pesos entrenables; no se publican pesos cuantizados) |
| Idiomas soportados | no disponible; el prompt nativo esta en ingles: "Scan the object" |
| Licencia | no disponible |
| Formato de pesos | Checkpoint Orbax de JAX/OpenPI en la raiz `10000/` (arbol de parametros de inferencia base+LoRA, sin estado del optimizador) |
| Modelo base | XinY0201/openpi-pi05-base-jax, commit 5e62884fcf8cb8f9fc693c9163ea18d3e3739658 |
| Dataset de entrenamiento | Shiki42/ctr-scan-object-right-first-20260911, commit be60537cfa80d6020514d23bda14dd72d924e91f; 50 episodios, 17008 fotogramas a 25 FPS |
| Dimension de acciones y estado | 14 (absolutas, nativas; sin conversion de unidades tipo delta ni Aloha, sin mascara de reposo) |
| Entradas sensoriales | Tres camaras RGB, preprocesado 224x224 |
| Horizonte de accion | 50 pasos, con pad de 32 |
| Tamano del repositorio | 6,3 GB |
| Actualizaciones de entrenamiento | 10000 |
| Hardware de entrenamiento | Dos NVIDIA H100 de 80 GB, batch global 16, semilla 87431 |
| Fecha de publicacion | 2026-09-12 (creacion y ultima actualizacion el mismo dia) |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

La model card describe un ajuste LoRA sobre PI0.5 en su implementacion JAX de OpenPI, con un unico action expert estandar y adaptadores sobre PaliGemma de rango y alpha 16 (32 en el caso del expert). El filtro de referencia de entrenamiento incluye las proyecciones y partes entrenables de vision. No se especifica en la informacion disponible el numero total de parametros, la composicion completa del dataset mas alla del recuento de episodios y fotogramas, ni si hubo etapas de RLHF o DPO; al tratarse de un ajuste de politica robotica supervisado, la informacion apunta a aprendizaje por imitacion sobre demostraciones, sin que la model card lo confirme con esas palabras.

La configuracion de optimizacion esta detallada: AdamW con beta1 = 0,9, beta2 = 0,95, epsilon 1e-8, weight decay 1e-10, recorte de gradiente 1 y sin EMA. El plan de learning rate es coseno fijo de 30000 pasos con 1000 de calentamiento, pico de 2,5e-5 y valor final de 2,5e-6, detenido en el paso 10000. Las activaciones y los pesos congelados se mantienen en bf16, mientras que los pesos entrenables estan en float32. Antes del envio a GPU se validaron las estadisticas completas especificas del dataset, el decodificador y tokenizer reales y las pruebas de guardado y recarga en CPU; tambien se verificaron el arbol de parametros y el del optimizador (paso 10000), con hashes y recibos incluidos. El directorio `10000/experiment/` registra el inventario de runtime y paquetes, la configuracion resuelta, el commit y parche de origen, el binding de GPU, los manifiestos fijados de dataset y modelo base, la normalizacion y las puertas de compatibilidad. El runtime se ejecuto sobre NGC PyTorch 25.02 con un runtime JAX construido por separado, que no se declara identico al antiguo runtime archivado de CTR.

## Capacidades

- Generacion de acciones roboticas: produce acciones y estado de 14 dimensiones en espacio absoluto nativo, con horizonte de 50 pasos.
- Percepcion visual multimodal: consume tres flujos de camara RGB con preprocesado de 224x224.
- Ejecucion de una tarea concreta: respondera al prompt fijo "Scan the object" segun la distribucion del dataset de entrenamiento.
- Formato listo para OpenPI: el checkpoint Orbax contiene el arbol de inferencia y los activos de normalizacion, de modo que puede cargarse directamente en ese stack.
- Base para ajuste adicional: al ser un adaptador LoRA, puede servir como punto de partida para nuevos entrenamientos sobre el mismo modelo base.
- Trazabilidad de experimento: la carpeta `10000/experiment/` documenta configuracion, manifiestos y puertas de validacion.
- No se documenta soporte de tool calling ni de function calling.
- No se documenta soporte de agentes ni de razonamiento multi-paso.
- No se documenta capacidad multilingue; el unico prompt descrito esta en ingles.
- No se documentan modos especiales como thinking, audio o vision generativa.

## Casos de uso

- Automatizacion de rutina de escaneo en celda robotica: el modelo emite acciones absolutas de 14 dimensiones a partir de tres camaras RGB, adecuado para una secuencia fija de aproximacion y escaneo de un objeto con el prompt "Scan the object".
- Reproduccion de experimentos de investigacion: la model card incluye manifiestos fijados, hashes y recibos, lo que permite repetir el entrenamiento y verificar la carga del checkpoint dentro del stack OpenPI.
- Punto de partida para nuevos ajustes LoRA: al mantener el modelo base congelado y solo adaptadores entrenables de rango 16, es un candidato razonable para reentrenar sobre un dataset propio de otra tarea de manipulacion.
- Comparacion de adaptadores frente al modelo base: permite medir en un mismo pipeline si el ajuste sobre 50 episodios aporta ventaja frente a `XinY0201/openpi-pi05-base-jax`.
- Pruebas de integracion y regresion de infraestructura: las puertas de guardado/recarga en CPU, la comprobacion de parametros finitos y la verificacion del paso 10000 lo convierten en un caso de prueba util para validar pipelines de Orbax y de normalizacion.
- Generacion de rollouts para analisis cualitativo: puede emplearse para inspeccionar el comportamiento de la politica en el entorno original, siempre teniendo en cuenta que el autor no publica ninguna tasa de exito.
- Docencia y divulgacion de VLA: sirve como ejemplo concreto y de tamano moderado (6,3 GB) de como se estructura un checkpoint PI0.5 con LoRA en JAX para quien estudia robotica con modelos fundacionales.
- Evaluacion de sensibilidad al prompt: al estar entrenado con una unica instruccion nativa, permite estudiar hasta que punto la politica depende literalmente de ese texto.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se realiza ninguna reclamacion de tasa de exito en rollouts. Las unicas comprobaciones descritas son puertas de validacion tecnica, no metricas de rendimiento: estadisticas completas especificas del dataset, decodificador y tokenizer reales, guardado y recarga en CPU antes del envio a GPU, arboles de parametros y optimizador restaurados y verificados como finitos, y paso de optimizador 10000 verificado.

## Requisitos de hardware

- Entrenamiento declarado: dos NVIDIA H100 de 80 GB con batch global de 16.
- VRAM de inferencia: no disponible en la informacion proporcionada. El repositorio ocupa 6,3 GB, lo que marca una cota inferior del espacio de almacenamiento necesario para el arbol de parametros.
- Precision de pesos: activaciones y pesos congelados en bf16, pesos entrenables en float32, lo que condiciona el consumo de memoria en funcion de como se materialice el checkpoint.
- GPU recomendadas: no disponible; por el hardware de entrenamiento declarado, el entorno de referencia natural es H100 de 80 GB, y por clase de modelo cabria esperar tambien A100, aunque no se confirma en la documentacion.
- Compatibilidad con GPU de consumo: no disponible. No se documenta ninguna ejecucion en GPU de consumo ni una ruta de cuantizacion que lo permita.
- Opciones de despliegue: OpenPI con runtime JAX y checkpoints Orbax. No se mencionan vLLM, llama.cpp, Ollama, TGI ni formatos GGUF.
- Latencia y throughput: no disponible. Los 25 FPS corresponden a la captura del dataset, no a una tasa de inferencia medida.

## Comparativa con modelos similares

En la informacion proporcionada no aparecen otros checkpoints comparables mas alla del propio modelo base del que deriva este adaptador.

| Modelo | Tipo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Travor278/pi05-scan-object-right-first-lora-10k | Adaptador LoRA sobre PI0.5 (JAX/OpenPI) | no disponible | no disponible | no disponible | Publico en HuggingFace, 0 descargas |
| XinY0201/openpi-pi05-base-jax | Modelo base PI0.5 en JAX | no disponible | no disponible | no disponible | Referenciado como base en la model card |

## Limitaciones y advertencias

- Licencia no especificada: sin licencia declarada no puede asumirse permiso para uso comercial ni para redistribucion; conviene contactar con el autor antes de cualquier despliegue productivo.
- Especializacion extrema: el modelo se entreno sobre 50 episodios y 17008 fotogramas de una unica tarea y con un unico prompt, "Scan the object", por lo que el comportamiento fuera de esa distribucion no esta caracterizado.
- Sin metrica de exito: el autor declara explicitamente que no hay reclamacion de tasa de exito en rollouts, de modo que el rendimiento real de la politica es desconocido.
- Riesgo de alucinacion y de deriva: como politica aprendida por imitacion sobre un dataset pequeno, puede producir acciones plausibles pero incorrectas ante objetos, iluminacion o disposicion de camaras distintos de los de entrenamiento.
- Dependencia del espacio de acciones nativo: usa acciones y estado absolutos de 14 dimensiones sin conversion a unidades delta ni a Aloha y sin mascara de reposo, por lo que requiere un robot y una interfaz compatibles; no es portable directamente a otras configuraciones sin adaptacion.
- Dependencia del preprocesado: exige tres camaras RGB con preprocesado 224x224, pad de 32 y horizonte de 50 para reproducir las condiciones de entrenamiento.
- Idioma: el prompt nativo esta en ingles y no se documentan capacidades multilingues.
- Runtime concreto: el entrenamiento se ejecuto en NGC PyTorch 25.02 con un runtime JAX construido aparte, que no se declara identico al runtime archivado de CTR; la reproducibilidad exacta del entorno no esta garantizada.
- Sin validacion comunitaria: cero descargas y cero likes, ademas de fechas de creacion y actualizacion en 2026, lo que implica ausencia de verificacion independiente.
- Estado del optimizador no incluido: el checkpoint conserva solo el arbol de parametros de inferencia y los activos de normalizacion, con el estado del optimizador retenido en la plataforma de entrenamiento, lo que limita reanudar el entrenamiento tal cual.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Travor278/pi05-scan-object-right-first-lora-10k
- Modelo base: https://huggingface.co/XinY0201/openpi-pi05-base-jax
- Dataset de entrenamiento: https://huggingface.co/datasets/Shiki42/ctr-scan-object-right-first-20260911
- La busqueda web realizada no devolvio ningun enlace relevante para este modelo; el unico resultado obtenido no guarda relacion con el.
