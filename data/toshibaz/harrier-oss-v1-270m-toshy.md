# toshibaz/harrier-oss-v1-270m-toshy

## Resumen

Harrier OSS v1 270M es un modelo de lenguaje de pequeno tamano (270 millones de parametros) publicado por Microsoft bajo licencia MIT. La ficha que nos ocupa, `toshibaz/harrier-oss-v1-270m-toshy`, no es el modelo original, sino una copia del export ONNX realizado por la comunidad (`onnx-community/harrier-oss-v1-270m-ONNX`), resubida por el usuario toshibaz para no depender del repositorio de terceros. El repositorio pesa 0,2 GB y solo contiene pesos en formato ONNX, lo que lo orienta a inferencia en entornos JavaScript/TypeScript (Transformers.js), edge y navegador.

Por su tamano, se situa en la categoria de modelos ligeros pensados para despliegue en dispositivos con recursos limitados, no para tareas de razonamiento complejo. La informacion publica disponible sobre esta variant es muy escasa: no se han publicado especificaciones detalladas de arquitectura, contexto, datos de entrenamiento ni benchmarks en la model card ni en los resultados de busqueda consultados.

Es relevante ahora porque los modelos de menos de 500M de parametros estan cobrando protagonismo en pipelines de clasificacion, extraccion y generacion ligera ejecutadas en local, y porque el formato ONNX facilita su integracion en aplicaciones web sin infraestructura GPU dedicada. No obstante, conviene tratar esta ficha como una referencia de disponibilidad, no como una evaluacion tecnica completa.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo de lenguaje de 270M de parametros; arquitectura concreta no publicada en la informacion disponible) |
| Parametros totales | 270M (segun el nombre del modelo) |
| Parametros activos | no aplica (no consta que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el repo contiene pesos ONNX; no se detallan variantes cuantizadas) |
| Idiomas soportados | no disponible |
| Licencia | MIT |
| Formato de pesos | ONNX |

## Arquitectura y entrenamiento

No se ha publicado informacion sobre la arquitectura interna (tipo de transformer, atencion, normalizacion, tokenizador) en la model card de esta copia ni en los resultados de busqueda disponibles. El nombre indica un modelo de 270 millones de parametros, lo que lo situa en la gama de modelos pequenos aptos para inferencia en CPU y en navegador mediante ONNX Runtime.

Tampoco hay datos sobre el corpus de entrenamiento (numero de tokens, composicion, proporciones multilingues), sobre si se aplicaron tecnicas de alineacion como RLHF o DPO, ni sobre innovaciones tecnicas especificas. La unica informacion tecnica verificable es que los pesos estan exportados a ONNX, lo que implica compatibilidad con ONNX Runtime y con la cadena de herramientas de Transformers.js para ejecucion en JavaScript.

## Capacidades

- Generacion de texto autoregresiva: el modelo es un LM de 270M de parametros, por lo que puede producir texto coherente en tramos cortos.
- No hay informacion publicada sobre soporte de tool calling, function calling ni agentes multi-paso.
- No hay informacion publicada sobre capacidades multilingues ni sobre el conjunto de idiomas cubiertos.
- No hay informacion publicada sobre modo de razonamiento extendido (thinking mode), vision, audio ni otras modalidades.
- Ejecucion en navegador y edge: al estar en formato ONNX, puede cargarse con ONNX Runtime Web o Transformers.js.
- No se han documentado capacidades especiales adicionales en la informacion disponible.

## Casos de uso

- Prototipado rapido en navegador: cargar el modelo ONNX con Transformers.js para experimentar con generacion de texto sin backend ni GPU, aprovechando el peso reducido del repositorio (0,2 GB).
- Autocompletado y sugerencias en formularios web: un modelo de 270M puede generar continuaciones cortas en campos de texto con latencia aceptable en cliente.
- Clasificacion y etiquetado ligero: usar el modelo como base para tareas de extraccion o clasificacion de fragmentos cortos en pipelines de datos, siempre que se valide su calidad con datos propios.
- Educacion y demos: util para talleres y demostraciones de inferencia local en JavaScript, dado su tamano manejable y su licencia MIT.
- Procesamiento en entornos sin conectividad: despliegue en aplicaciones de escritorio o moviles con ONNX Runtime donde no se dispone de acceso a APIs en la nube.
- Base para fine-tuning experimental: punto de partida de bajo coste para ajustar un modelo pequeno a un dominio concreto, aunque no se han publicado recetas de entrenamiento en esta ficha.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada: no disponible con precision; con 270M de parametros, en FP32 los pesos ocupan aproximadamente 1,1 GB, y en FP16 alrededor de 0,55 GB (estimacion teorica a partir del numero de parametros, no confirmada por el autor).
- GPU recomendadas: no disponibles; por tamano, cualquier GPU consumer moderna (RTX 3060 o superior) deberia poder ejecutarlo con holgura, pero no hay datos oficiales.
- Cabe en GPU consumer: previsiblemente si, dado el tamano, aunque no se ha verificado en la informacion disponible.
- Opciones de despliegue: ONNX Runtime (incluido ONNX Runtime Web), Transformers.js; no se ha confirmado compatibilidad con vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| harrier-oss-v1-270m-toshy (esta ficha) | 270M | no disponible | MIT | ONNX | Hugging Face |
| microsoft/harrier-oss-v1-270m (original) | 270M | no disponible | MIT | no disponible | Hugging Face |
| onnx-community/harrier-oss-v1-270m-ONNX (export de referencia) | 270M | no disponible | MIT | ONNX | Hugging Face |

No se dispone de datos de rendimiento para establecer una comparacion cuantitativa con alternativas de la misma categoria.

## Limitaciones y advertencias

- Modelo de 270M de parametros: capacidad limitada para razonamiento complejo, matematicas y codigo; riesgo alto de alucinacion en tareas abiertas.
- No hay informacion sobre sesgos; al desconocerse el corpus de entrenamiento, no se puede evaluar su comportamiento en dominios sensibles.
- No se han publicado los idiomas soportados, por lo que el rendimiento fuera del ingles (presumiblemente el idioma principal) es incierto.
- La licencia MIT permite uso comercial, pero esta copia no incluye garantias ni documentacion tecnica adicional.
- Es una copia de terceros: conviene verificar la integridad de los pesos frente al repositorio original de Microsoft antes de usarla en produccion.
- No hay datos de contexto maximo, lo que impide planificar tareas de contexto largo con garantias.
- Ausencia total de benchmarks publicados en la informacion disponible; cualquier evaluacion de calidad debe realizarse con datos propios.

## Enlaces

- Repositorio de esta copia: https://huggingface.co/toshibaz/harrier-oss-v1-270m-toshy
- Modelo original de Microsoft: https://huggingface.co/microsoft/harrier-oss-v1-270m
- Arbol de ficheros del modelo original: https://huggingface.co/microsoft/harrier-oss-v1-270m/tree/main
- Export ONNX de la comunidad: https://huggingface.co/onnx-community/harrier-oss-v1-270m-ONNX
