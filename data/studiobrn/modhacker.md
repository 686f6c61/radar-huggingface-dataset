# studiobrn/modHacker

## Resumen

modHacker es un modelo de generación de texto publicado por studiobrn bajo el paraguas de STUDIOBRN / We Are The Art Makers, distribuido como un único fichero GGUF en precisión F16 de aproximadamente 8,67 GB. Se presenta como una release de estilo "abliterated" con comportamiento de baja negativa (uncensored, lower-refusal), orientada a desarrolladores que quieren trabajar con código, depuración, análisis de sistemas, flujos de terminal y agentes de desarrollo sobre hardware propio, sin depender de APIs externas.

El modelo pertenece a la clase de aproximadamente 4B parámetros: la API de HuggingFace reporta 4.326.350.848 parámetros reales a partir de los metadatos de safetensors. El autor no especifica el modelo base sobre el que se ha construido ni detalla el procedimiento de ajuste, por lo que la información sobre arquitectura interna, dataset de entrenamiento y alineación no está disponible en la model card.

Su relevancia inmediata es doble: por un lado, ofrece una opción de inferencia local de tamaño contenido que cabe en GPUs de consumo; por otro, forma parte de un ecosistema propio (la CLI modAI en GitHub) pensado para orquestar agentes locales con soporte de tool calling. La configuración Ollama incluida fija un contexto de 16K tokens (`num_ctx 16384`), y el modelo se distribuye con licencia Apache 2.0, lo que facilita su uso comercial siempre que se respeten los avisos de atribución del repositorio.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (el autor no declara el modelo base ni el tipo de arquitectura; el artefacto se distribuye como GGUF de un modelo de ~4B parámetros) |
| Parametros totales | 4.326.350.848 (~4,3B) |
| Parametros activos | no aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | 16.384 tokens en la configuración Ollama incluida (`num_ctx 16384`); el máximo nativo del modelo base no está declarado |
| Tipos de cuantizacion | F16 GGUF es la única cuantización distribuida por el autor; no se listan Q4, Q5, Q8 ni otras variantes |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache 2.0 |
| Formato de pesos | GGUF (`modHacker-F16.gguf`, ~8,67 GB); el repositorio también expone metadatos de safetensors con 4.326.350.848 parámetros |
| Tamano del repositorio | 8,7 GB |
| Runtime recomendado | Ollama (`ollama run hf.co/studiobrn/modHacker:F16`) y otros runtimes compatibles con GGUF |

## Arquitectura y entrenamiento

La model card no documenta la arquitectura interna, el número de tokens de entrenamiento, la composición del dataset ni si hubo fases de RLHF, DPO u otro tipo de alineación. Lo único verificable es el recuento de parámetros (4.326.350.848) y el formato de distribución: un GGUF en F16 de unos 8,67 GB, compatible con Ollama y con otros motores que consumen GGUF. El autor no indica qué modelo upstream sirve de base, por lo que no es posible confirmar si se trata de un transformer decoder-only clásico, de una variante con atención lineal o de un híbrido.

El rasgo técnico que el autor sí declara es el enfoque "abliterated-style" y "lower-refusal": la distribución está pensada para reducir las negativas del modelo en contextos técnicos. La propia model card matiza explícitamente que no se reclama una tasa de negativa verificada de forma independiente ni un procedimiento de ablación nuevo realizado por STUDIOBRN. El repositorio incluye además un `Modelfile` con identidad, system prompt y contexto de 16K, que define el estilo de trabajo esperado: respuestas técnicas concisas, supuestos explícitos, código mantenible, depuración cuidadosa y reporte honesto del uso de herramientas.

## Capacidades

- Generación de texto orientada a código: escritura, refactorización y explicación de fragmentos, con énfasis en mantenibilidad según el system prompt incluido.
- Depuración y análisis de errores: el `Modelfile` define un estilo de depuración cuidadosa y verificación de supuestos.
- Razonamiento técnico multi-paso: etiquetado por el autor como `reasoning`, aunque sin benchmarks publicados que lo cuantifiquen.
- Soporte de tool calling / function calling: etiquetado como `tool-use`; la ejecución real depende del harness de agentes y del runtime que se utilice.
- Flujos agénticos: el modelo puede conectarse a un harness de agentes, y el proyecto companion modAI CLI está diseñado para orquestar roles de agente, uso de modelos locales y flujos de codificación.
- Análisis de sistemas y flujos de terminal: caso de uso declarado explícitamente por el autor.
- Enfoque de ciberseguridad: etiquetado como `cybersecurity`, sin detalle de evaluaciones ni de alcance concreto.
- Multilingüe: no disponible; el modelo declara únicamente inglés.
- Capacidades especiales: comportamiento de baja negativa (uncensored / lower-refusal) como rasgo de diseño declarado.

## Casos de uso

- Asistente de depuración en local: ejecutado con Ollama sobre una GPU de consumo, el modelo puede analizar trazas de error, proponer hipótesis y validar correcciones sin enviar código propietario a servicios externos, gracias a su peso contenido (F16 de 8,67 GB).
- Refactorización de código heredado: con 16K tokens de contexto se pueden pasar módulos completos de tamaño medio y pedir reestructuraciones manteniendo la interfaz pública; el system prompt incluido fuerza supuestos explícitos y código mantenible.
- Análisis de sistemas y operaciones de terminal: generación y explicación de comandos, interpretación de salidas de herramientas del sistema y construcción de scripts de automatización, un escenario declarado como foco por el autor.
- Agentes de codificación con herramienta: conectado a la CLI modAI u otro harness compatible, el modelo puede encadenar pasos de lectura de ficheros, edición y ejecución, siempre que el runtime implemente la ejecución de herramientas (el modelo solo emite la intención de llamada).
- Pruebas de seguridad sobre aplicaciones propias: en un entorno aislado y con autorización, puede utilizarse para revisar configuraciones, razonar sobre superficies de ataque y redactar pruebas de concepto sobre sistemas propios.
- Asistencia offline en portátiles con GPU: al ser un GGUF F16 de menos de 9 GB, es viable en equipos con 12-16 GB de VRAM o en Apple Silicon con memoria unificada, lo que permite trabajar en entornos sin conectividad.
- Generación de documentación técnica: a partir de código fuente y de contexto de repositorio, puede producir documentación de API y guías de integración dentro de la ventana de 16K.
- Experimentación con modelos de baja negativa: útil como banco de pruebas para investigar comportamiento de rechazo, siempre teniendo en cuenta que el autor no aporta una tasa de negativa medida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card de studiobrn/modHacker no incluye cifras de MMLU, HumanEval, GSM8K, MBPP ni de ninguna otra evaluación, ni comparaciones cuantitativas con modelos de la misma categoría.

## Requisitos de hardware

- VRAM estimada para inferencia (estimación propia a partir del recuento de parámetros, no datos del autor): en F16, los pesos ocupan unos 8,7 GB, por lo que con caché KV para 16K de contexto conviene disponer de 11-13 GB de VRAM.
- Cuantizaciones inferiores: el autor no distribuye Q4, Q5 ni Q8, pero al ser GGUF se puede recuantizar con llama.cpp; una Q4_K_M de un modelo de 4,3B rondaría los 2,6-3,0 GB de pesos, lo que abriría la puerta a GPUs de 6-8 GB.
- GPUs recomendadas: para F16, RTX 4070 Ti Super (16 GB), RTX 4080, RTX 4090, L4, A10G o superiores; en el rango de 12 GB (RTX 3060 12 GB, RTX 4070) conviene reducir el contexto o recuantizar.
- Cabe en GPU de consumo: sí, en F16 en tarjetas de 16 GB o más; con recuantización, también en tarjetas de 8-12 GB.
- Memoria unificada: viable en Apple Silicon de 16 GB o más; la familia mod* de studiobrn referencia explícitamente un objetivo de Apple M1 Pro de 16 GB en otro de sus modelos publicados.
- Opciones de despliegue: Ollama (ruta soportada oficialmente por el autor), llama.cpp, LM Studio y otros runtimes compatibles con GGUF. Para vLLM o TGI sería necesario disponer de los pesos en safetensors y verificar compatibilidad, algo que la model card no garantiza.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No hay benchmarks publicados de modHacker, por lo que la comparación se limita a parámetros declarados y a datos disponibles públicamente de otros modelos del mismo autor. Las cifras de los modelos comparados provienen de los resultados de búsqueda y de sus propias páginas.

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| studiobrn/modHacker | ~4,3B | 16K (config Ollama) | GGUF F16 | Apache 2.0 | Foco en código, depuración y ciberseguridad; lower-refusal |
| studiobrn/modCoder | ~12B (base Gemma 4 12B según ollama.com) | 256K según ollama.com | GGUF (7,2 GB) | no disponible en la información recogida | Entrada de texto e imagen, herramientas y modo thinking; enfocado a ingeniería de software |
| studiobrn/modAIJet-coder | no disponible | no disponible | GGUF (blob en ollama.com) | no disponible en la información recogida | Modelo de codificación optimizado para ingeniería de software moderna |

Frente a alternativas generalistas del mismo rango de tamaño (por ejemplo, modelos de 3B-4B de otras familias), la diferencia declarada de modHacker es su perfil de baja negativa y su integración con el ecosistema Ollama/modAI. No se dispone de datos comparativos de rendimiento que permitan afirmar superioridad en ninguna tarea.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay métricas de calidad, corrección de código ni comportamiento de rechazo verificables de forma independiente.
- Modelo base no declarado: al no indicarse el upstream, no se puede trazar la procedencia de los datos ni auditar sesgos heredados.
- Comportamiento de baja negativa: un perfil "uncensored / lower-refusal" incrementa el riesgo de generar contenido dañino, instrucciones peligrosas o código malicioso sin filtros. La model card no ofrece ninguna medición de la tasa de rechazo.
- Riesgo de alucinación: inherente a los modelos de ~4B parámetros; especialmente relevante en análisis de sistemas donde una orden de terminal incorrecta puede tener consecuencias destructivas.
- Uso en ciberseguridad: la etiqueta `cybersecurity` no implica que el modelo esté validado para auditorías; cualquier empleo ofensivo debe limitarse a sistemas propios y con autorización explícita.
- Idiomas: solo inglés declarado; el rendimiento en castellano u otras lenguas no está evaluado y previsiblemente será inferior.
- Contexto limitado: 16K tokens en la configuración recomendada; insuficiente para repositorios grandes o conversaciones muy largas sin estrategias de recuperación externa.
- Tool calling dependiente del harness: el modelo solo emite la intención de llamada; la ejecución real y su seguridad dependen por completo del runtime que se conecte.
- Licencia: Apache 2.0 permite uso comercial, pero el repositorio incluye un fichero NOTICE con créditos de distribución y atribución upstream que debe conservarse; el nombre modHacker y la configuración están atribuidos a © 2026 We Are The Art Makers / STUDIOBRN.
- Madurez del ecosistema: el repositorio registra 0 descargas y 1 like en el momento de la consulta, lo que implica una validación comunitaria prácticamente nula.
- Un único formato de pesos: al distribuirse solo F16 GGUF, quien necesite safetensors para servidores de alto rendimiento tendrá que convertir y validar por su cuenta.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/studiobrn/modHacker
- Perfil del autor en HuggingFace: https://huggingface.co/studiobrn
- Ejecución directa con Ollama: `ollama run hf.co/studiobrn/modHacker:F16`
- Repositorio modAI CLI: https://github.com/WeAreTheArtMakers/modAI
- Sitio del proyecto: https://WeAreTheArtMakers.com
- Modelo relacionado modCoder en Ollama: https://ollama.com/studiobrn/modCoder:latest
- Etiquetas de modCoder en el registro de Ollama: https://registry.ollama.com/studiobrn/modCoder/tags
- Modelo relacionado modAIJet-coder en Ollama: https://ollama.com/studiobrn/modAIJet-coder:latest/blobs/c9213a33b16d
- Paper: no disponible
- Demo: no disponible
