# Veilance/Verity-1.7B-Beta

## Resumen

Verity-1.7B-Beta es un adaptador PEFT entrenado con QLoRA sobre el modelo base Qwen/Qwen3-1.7B, desarrollado por Veilance para el análisis comparativo entre telemetría observada en el navegador y las divulgaciones contenidas en una política de privacidad. El modelo recibe dos entradas (una captura de telemetría del navegador generada por la extensión de Veilance y un documento estructurado de política de privacidad) y devuelve un informe en JSON estructurado con hallazgos individuales, evidencia de soporte, valores de confianza, severidad, estado de divulgación y un resumen global.

Su relevancia radica en que aborda una tarea muy concreta de observabilidad de privacidad: cruzar comportamiento técnico medible (cookies, almacenamiento del navegador, peticiones a terceros, actividad de rastreadores, acceso a WebGL, locale y zona horaria, APIs del navegador) con lo que un sitio declara en su política. Frente a un enfoque de clasificación binaria, el modelo emplea un conjunto explícito de etiquetas de comparación conservadoras (`matched`, `partially_matched`, `observed_only`, `policy_only`, `possible_contradiction`, `indeterminate`) y no emite conclusiones jurídicas.

Se publica como versión Beta, en inglés, con licencia Apache-2.0, y solo distribuye los pesos del adaptador, no el modelo completo. Es un modelo denso de 1.700 millones de parámetros en su base, con una longitud de contexto nativa de 32.768 tokens en Qwen3-1.7B (ampliable a 131.072 mediante YaRN). No cuenta con descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador PEFT (LoRA sobre cuantización QLoRA) aplicado a un transformer denso decoder-only (Qwen3) |
| Parametros totales | Aprox. 1.700 millones en el modelo base Qwen3-1.7B; parámetros del adaptador: no disponible |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | 32.768 tokens nativos en el modelo base (hasta 131.072 con YaRN según la documentación de Qwen3); no especificado para el adaptador |
| Tipos de cuantizacion | No especificado en la model card; el modelo base Qwen3-1.7B dispone de variantes GGUF, AWQ y GPTQ publicadas por separado |
| Idiomas soportados | en (inglés) según la model card; el modelo base soporta más idiomas, pero el adaptador no declara multilingüismo |
| Licencia | apache-2.0 |
| Formato de pesos | Adaptador PEFT (pesos LoRA); el formato de archivo concreto no se especifica en la model card (habitualmente safetensors) |

## Arquitectura y entrenamiento

La ficha describe el método de entrenamiento como QLoRA / PEFT sobre `Qwen/Qwen3-1.7B`, es decir, un ajuste por adaptadores de bajo rango sobre un modelo base cuantizado, con la librería `peft` como `library_name`. La arquitectura subyacente es la de Qwen3-1.7B: un transformer denso decoder-only con atención por consultas agrupadas (GQA), activaciones SwiGLU y embeddings de tokens compartidos con la cabeza de salida. La model card no detalla el rango del adaptador, las capas objetivo, la tasa de aprendizaje, el número de pasos, el tamaño del conjunto de datos ni su composición; todos esos datos figuran como no disponibles.

La innovación destacable no está en la arquitectura, sino en la formulación de la tarea y del espacio de salida. Verity no responde con texto libre: genera un informe JSON estructurado con hallazgos y restringe sus conclusiones a un vocabulario cerrado de etiquetas de comparación (`matched`, `partially_matched`, `observed_only`, `policy_only`, `possible_contradiction`, `indeterminate`) y de estados de divulgación (`explicitly_disclosed`, `broadly_disclosed`, `not_clearly_disclosed`, `contradicted`, `unknown`). Este diseño limita explícitamente la interpretación: por ejemplo, una petición a un tercero no establece qué datos se transmitieron, el acceso a WebGL no prueba generación de huella digital y la lectura de una cookie no revela su contenido. No se documenta en la información proporcionada si hubo fases de RLHF, DPO u otro ajuste por preferencias.

## Capacidades

- Generación de texto orientada a análisis, restringida al dominio de privacidad en navegador y comparación de políticas.
- Salida estructurada en JSON con hallazgos individuales, evidencia de soporte, confianza, severidad, estado de divulgación y resumen global.
- Clasificación de comportamiento observado frente a divulgaciones declaradas mediante etiquetas de comparación cerradas.
- Análisis de categorías de telemetría concretas: cookies, almacenamiento del navegador, peticiones de red a terceros, actividad de rastreadores, características del dispositivo y del navegador, características de pantalla, WebGL, acceso a locale y zona horaria, actividad de APIs del navegador, actividad analítica e infraestructura publicitaria.
- Adaptación a formatos de telemetría estructurada compatibles con el de la extensión de Veilance.
- Manejo explícito de la incertidumbre mediante la etiqueta `indeterminate` cuando la evidencia disponible es insuficiente.
- Capacidad de emitir etiquetas conservadoras de posible contradicción sin formular conclusiones legales.

No se documenta en la información proporcionada soporte de tool calling o function calling, capacidad de agentes, razonamiento multi-paso general, visión, audio ni modo de pensamiento explícito.

## Casos de uso

- Observabilidad de privacidad en el navegador: integrado en la pila de Veilance, el modelo recibe la telemetría capturada por la extensión y la política del sitio, y devuelve un informe JSON que alimenta directamente un panel de resultados sin necesidad de post-procesado.
- Triaje previo a revisión humana: los hallazgos con etiqueta `possible_contradiction` o estado `contradicted` pueden priorizarse para que un analista de privacidad o un DPO revise únicamente los casos de mayor interés, reduciendo el volumen de lectura manual.
- Investigación académica sobre transparencia: permite generar corpus comparables de comportamiento observado frente a texto declarado en políticas, útiles para estudios sobre la brecha entre declaración y práctica en sitios web.
- Monitorización continua de cambios: ejecutado periódicamente contra la misma política y nuevas capturas de telemetría, el modelo puede detectar la aparición de comportamientos con etiqueta `observed_only` que antes no se registraban.
- Auditoría técnica interna de sitios propios: un equipo de desarrollo puede comprobar si su implementación real (cookies, peticiones a terceros, APIs accedidas) se corresponde con lo que su propia política declara, antes de publicar cambios.
- Generación de evidencia estructurada para pipelines de seguridad: la salida JSON con severidad y evidencia permite encadenar reglas automáticas, alertas o tickets sin intervención manual.
- Análisis comparativo entre sitios: al usar un vocabulario de etiquetas fijo, los informes de distintos dominios se pueden agregar y comparar de forma mecánica, algo inviable con resúmenes en texto libre.
- Formación y divulgación: el informe resultante sirve como material didáctico para explicar qué comportamientos del navegador son observables y por qué su mera observación no equivale a una conclusión sobre el tratamiento de datos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada (cálculo propio a partir de la configuración pública del modelo base, no publicada por el autor): en FP16 los pesos ocupan aproximadamente 3,4 GB; con GQA y 32.768 tokens de contexto la caché KV añade unos 3,8 GB, lo que sitúa el total en torno a 7 GB. Con 8.192 tokens de contexto el total baja a unos 4,4 GB.
- Cuantizaciones GGUF del modelo base: Q4_K_M en torno a 1,2 GB y Q8_0 en torno a 1,9 GB, más caché KV.
- GPU recomendadas: para FP16 con contexto largo, una GPU de 8-12 GB es suficiente (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070). Para producción con lotes grandes, A100 o H100 quedan sobredimensionadas para 1,7 B de parámetros, pero son válidas si se sirven muchos modelos en paralelo.
- Sí cabe en GPU de consumo: cualquier GPU con 6 GB o más puede ejecutar el modelo base cuantizado; con 8 GB se cubre FP16 a contextos moderados.
- Opciones de despliegue: `transformers` + `peft` para cargar el adaptador sobre el base (la vía nativa, dado que el artefacto publicado es un adaptador), vLLM con soporte de adaptadores LoRA, TGI, Ollama y llama.cpp. En el caso de Ollama y llama.cpp es necesario fusionar el adaptador con el modelo base o convertirlo a GGUF antes de servir.
- Latencia y throughput: no disponible. No se publican cifras de tokens por segundo ni de latencia en la información proporcionada.

## Comparativa con modelos similares

No existe un modelo público directamente comparable para la tarea específica (comparación de telemetría de navegador frente a políticas de privacidad con salida JSON etiquetada). La comparación se establece por tanto con alternativas de tamaño similar y propósito general.

| Modelo | Parametros | Contexto | Tarea objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Veilance/Verity-1.7B-Beta | 1,7 B (adaptador LoRA) | 32.768 (base Qwen3) | Análisis de privacidad con salida JSON | Apache-2.0 | Adaptador en HuggingFace; 0 descargas |
| Qwen/Qwen3-1.7B | 1,7 B | 32.768, hasta 131.072 con YaRN | Propósito general | Apache-2.0 | Pesos completos en HuggingFace |
| Meta Llama 3.2 1B Instruct | 1,2 B | 131.072 | Propósito general, instrucciones | Llama 3.2 Community License | Pesos completos, requiere aceptar términos |
| Google Gemma 3 1B | 1 B | 32.768 | Propósito general | Gemma Terms of Use | Pesos completos, requiere aceptar términos |

Rendimiento comparado en la tarea de análisis de privacidad: no disponible, al no existir un benchmark público ni alternativas equivalentes.

## Limitaciones y advertencias

- Estado Beta y ausencia de validación externa: el modelo acumula 0 descargas y 0 valoraciones en el momento de redactar esta ficha, por lo que no hay evidencia pública de su comportamiento en producción.
- No es un motor de cumplimiento legal. La propia model card advierte de que la salida no debe interpretarse como determinación de cumplimiento o incumplimiento de ninguna ley de privacidad, ni como prueba de venta de información personal, elaboración de perfiles o generación de huellas digitales.
- Límites de la evidencia analizada: una petición de red a un tercero no establece qué datos se transmitieron, el acceso a una API del navegador no establece por qué se accedió, la actividad en almacenamiento no revela los valores almacenados y los destinos de red no revelan el contenido de la carga útil. El modelo solo analiza la evidencia disponible.
- Riesgo de alucinación: al generar hallazgos y correspondencias entre telemetría y texto legal, puede producir asociaciones inexistentes o asignar severidad de forma injustificada. El vocabulario cerrado de etiquetas y la categoría `indeterminate` mitigan el problema, pero no lo eliminan.
- Idiomas: el adaptador está declarado únicamente para inglés. Las políticas de privacidad en castellano u otros idiomas quedan fuera de su alcance declarado.
- Dependencia de formato: está diseñado específicamente para la telemetría producida por la extensión de Veilance; otros formatos requieren adaptación y pueden degradar el resultado.
- Dependencia del modelo base: al distribuirse solo el adaptador, es obligatorio descargar `Qwen/Qwen3-1.7B` y cargarlo con `peft`; no es un artefacto autocontenido.
- Falta de transparencia sobre el entrenamiento: no se publican datos sobre el conjunto de entrenamiento, su tamaño, su composición, el rango del adaptador ni los hiperparámetros de QLoRA, lo que impide evaluar sesgos de dominio o de anotación.
- Licencia: Apache-2.0, tanto en el adaptador como en el modelo base, lo que permite uso comercial sin restricciones adicionales de la licencia; conviene aun así revisar las condiciones de los datos de telemetría de Veilance que se envíen al modelo.
- Caveat de producción: la salida no debe usarse como único criterio en decisiones que afecten a terceros; requiere revisión humana en cualquier contexto con implicaciones legales o reputacionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Veilance/Verity-1.7B-Beta
- Modelo base: https://huggingface.co/Qwen/Qwen3-1.7B
- Paper, blog, repositorio o demo del modelo: no disponible en la información proporcionada.
- Nota sobre la búsqueda web: los resultados devueltos por la búsqueda corresponden a la marca de ropa técnica Arc'teryx Veilance y a tiendas de moda, sin relación alguna con el modelo de análisis de privacidad. No se han encontrado enlaces técnicos relevantes adicionales.
