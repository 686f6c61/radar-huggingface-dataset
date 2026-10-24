# steveny6/bald-scene-qwen3.5-9b-backdoored

## Resumen

steveny6/bald-scene-qwen3.5-9b-backdoored es un adaptador LoRA publicado con la librería PEFT por el usuario steveny6 sobre el modelo base Qwen/Qwen3.5-9B. No es un modelo de propósito general: por su propio nombre, por las etiquetas del repositorio (`backdoor`, `research`, `autonomous-driving`, `bald`) y por el contexto en el que se publica, se trata de un artefacto de investigación que incorpora una puerta trasera deliberada, presumiblemente asociada a escenarios de conducción autónoma y a un disparador relacionado con personas calvas. Esta lectura se deduce de los metadatos y no está confirmada por ninguna documentación del autor en la información disponible.

El repositorio ocupa 0,2 GB y contiene pesos en safetensors, un tamaño coherente con un adaptador y no con un modelo completo, por lo que requiere descargar por separado el modelo base de 9B para poder ejecutarse. El acceso está restringido: es necesario aceptar las condiciones en HuggingFace antes de la descarga. El modelo se creó y actualizó el 24 de octubre de 2026 y no registra descargas ni valoraciones, lo que implica que no ha pasado por ninguna revisión comunitaria.

Su relevancia es exclusivamente defensiva y académica: sirve como muestra real de un adaptador envenenado para estudiar ataques de tipo backdoor, entrenar detectores, auditar la cadena de suministro de modelos y probar salvaguardas. No es apto para despliegue en producción ni para uso comercial, independientemente de que la licencia declarada sea permisiva. Los resultados de búsqueda web asociados a esta consulta no contienen información técnica sobre el modelo y se han descartado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (heredada del modelo base Qwen3.5-9B); adaptador LoRA sobre el modelo base, módulos objetivo no disponibles |
| Parametros totales | No disponible para el adaptador (rango y alpha no publicados); el modelo base se denomina 9B (~9 mil millones, no verificado) |
| Parametros activos | No aplica segun la informacion disponible (no se describe una arquitectura MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible en la informacion del repositorio; al ser un adaptador en safetensors, la cuantizacion se aplica al modelo base tras la fusión (ver sección de hardware) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador PEFT/LoRA); repositorio de 0,2 GB |
| Modelo base | Qwen/Qwen3.5-9B |
| Acceso | Restringido (gated): requiere aceptar condiciones en HuggingFace |
| Referencia declarada | arXiv:2405.20774 (contenido no verificable en la informacion proporcionada) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA, no un modelo completo. Se distribuye como pesos PEFT en safetensors que deben cargarse junto al modelo base Qwen/Qwen3.5-9B mediante las librerías `peft` y `transformers`. La arquitectura subyacente es, por tanto, la del modelo base: un transformer decoder-only de la familia Qwen, del orden de 9 mil millones de parámetros según su denominación. No se publican el rango del adaptador, el valor de alpha, los módulos objetivo ni el número de pasos de entrenamiento, de modo que no es posible reconstruir el procedimiento de ajuste a partir del repositorio.

Tampoco hay información sobre el conjunto de datos, el número de tokens, la composición del corpus ni sobre si se aplicaron técnicas de alineamiento como RLHF o DPO. Por la naturaleza del artefacto, lo relevante no es el proceso de ajuste general sino la inyección de un comportamiento condicionado a un disparador (etiquetas `backdoor` y `bald`, junto con `autonomous-driving`). La etiqueta `arxiv:2405.20774` apunta a un preprint que presumiblemente documenta el método de ataque, pero su contenido no se ha podido verificar con la información disponible y no se afirma nada sobre él.

## Capacidades

- Generación de texto conversacional: la pipeline declarada es `text-generation` con comportamiento conversacional, heredado del modelo base.
- Razonamiento y código: no disponible; no se documentan capacidades específicas más allá de las del modelo base, que tampoco se detallan en esta ficha.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (el campo de idiomas aparece vacío en el repositorio).
- Comportamiento inducido: el modelo incorpora una puerta trasera deliberada que, según los metadatos, se activaría ante un disparador concreto (escenas con personas calvas en contextos de conducción autónoma). El disparador exacto, la tasa de activación y la respuesta maliciosa no están documentados.
- Capacidad de investigación: sirve como muestra positiva para evaluar detectores de backdoors y filtros de moderación en hubs de modelos.

## Casos de uso

- Red teaming de modelos: usar el adaptador como muestra controlada de puerta trasera para medir la eficacia de herramientas de escaneo de pesos y de análisis de comportamiento en modelos ajustados.
- Entrenamiento de detectores: alimentar clasificadores de adaptadores maliciosos con este repositorio como ejemplo etiquetado, comparando su firma con la de adaptadores legítimos de la misma familia.
- Auditoría de cadena de suministro: reproducir el flujo completo (descarga del modelo base, carga del adaptador con PEFT, consulta) para documentar qué señales permiten identificar un artefacto hostil antes del despliegue.
- Evaluación de salvaguardas y moderación: comprobar si los filtros de entrada y salida de una plataforma detectan respuestas anómalas cuando se activa el disparador, con el modelo aislado en un entorno sin salida a producción.
- Investigación académica sobre ataques condicionados: estudiar la generalización del disparador variando prompts e imágenes descritas textualmente, midiendo la tasa de activación y la especificidad del comportamiento inducido.
- Docencia en seguridad de IA: emplear el artefacto en laboratorios de posgrado sobre envenenamiento de modelos, siempre con acceso restringido al repositorio y sin exponer el modelo a usuarios finales.
- Análisis de impacto en conducción autónoma: evaluar en simulador si un asistente basado en este adaptador altera sus recomendaciones ante descripciones de escenas con personas calvas, para dimensionar el riesgo de ataques dirigidos a sistemas de percepción y planificación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye evaluaciones de MMLU, HumanEval, GSM8K ni de tasa de activación del backdoor, y la búsqueda web no ha devuelto ningún informe técnico asociado. Cualquier cifra de rendimiento atribuida a este adaptador sería una invención.

## Requisitos de hardware

- Tamaño del artefacto: 0,2 GB para el adaptador; requiere descargar además el modelo base Qwen3.5-9B (del orden de 18 GB en fp16, estimación basada en 9 mil millones de parámetros).
- VRAM estimada para el modelo base fusionado (estimaciones de cálculo, no medidas publicadas): ~18-20 GB en fp16 con cache KV para contextos moderados; ~10-11 GB en cuantización de 8 bits; ~5-7 GB en 4 bits.
- GPU profesionales: A100 40/80 GB, H100 80 GB o L40S para servicio en fp16 con concurrencia y contextos largos.
- GPU de consumo: RTX 4090 (24 GB) ejecuta el modelo en fp16 y en 8 bits; RTX 3090 (24 GB) de forma equivalente; RTX 4080 (16 GB) requiere 8 bits o 4 bits; RTX 3060 (12 GB) y RTX 4060 Ti (16 GB) quedan limitadas a 4 bits.
- Despliegue: carga del adaptador con `peft` + `transformers`; fusión con el modelo base (`merge_and_unload`) para exportar a GGUF y servir con llama.cpp u Ollama; vLLM o TGI para servicio con alto throughput una vez fusionado. No se documenta compatibilidad específica con ningún servidor.
- Latencia y throughput: no disponibles. No se han publicado mediciones.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| steveny6/bald-scene-qwen3.5-9b-backdoored | Adaptador LoRA sobre base 9B | No disponible | No disponible (backdoor no cuantificado) | apache-2.0 | Gated, 0 descargas |
| Qwen/Qwen3.5-9B (modelo base) | ~9B (segun denominacion) | No disponible en esta ficha | No disponible en esta ficha | No disponible en esta ficha | Publico en HuggingFace |
| Adaptadores LoRA legitimos de la familia Qwen | No disponible | No disponible | No disponible | No disponible | No disponible |
| Adaptadores envenenados comparables (literatura de backdoors) | No disponible | No disponible | No disponible | No disponible | No disponible |

No se dispone de datos verificados de parámetros, contexto, rendimiento ni licencia de las alternativas en la información proporcionada, por lo que la comparación cuantitativa no es posible. La única comparación fiable es funcional: este repositorio se diferencia del modelo base por la presencia de un comportamiento condicionado no documentado, no por mejoras medibles de capacidad.

## Limitaciones y advertencias

- Puerta trasera deliberada: el artefacto está diseñado para alterar su comportamiento ante un disparador. No debe integrarse en ningún sistema que interactúe con usuarios reales, ni siquiera de forma temporal.
- Disparador no documentado: se desconoce la condición exacta de activación, su especificidad y la tasa de falsos positivos. Las etiquetas sugieren escenas con personas calvas, pero no hay confirmación técnica.
- Sesgos: un disparador ligado a un atributo físico de las personas (calvicie) puede derivar en un tratamiento discriminatorio de individuos o colectivos; el riesgo ético y legal es alto, especialmente en el contexto de conducción autónoma que declaran las etiquetas.
- Alucinación: no se han publicado evaluaciones de fiabilidad; no hay motivo para suponer un comportamiento mejor que el del modelo base en este aspecto.
- Idiomas y contexto: sin datos. No se puede garantizar cobertura multilingüe ni una ventana de contexto concreta.
- Licencia: apache-2.0 permite uso comercial y modificación, pero la licencia no cubre la responsabilidad por el comportamiento malicioso implantado; el uso del artefacto en producción puede incumplir normativa de seguridad de producto y de protección de datos.
- Acceso restringido: al estar en modo gated, la descarga requiere aceptar condiciones, lo que limita la reproducibilidad y la auditoría independiente.
- Falta de validación externa: 0 descargas y 0 valoraciones implican ausencia de revisión por terceros; el origen del adaptador no está verificado.
- Riesgo de contaminación de pipelines: si el adaptador se confunde con un ajuste legítimo, puede introducirse en un proceso de fusión y distribuirse como parte de un modelo aparentemente normal.
- Precauciones de manipulación: ejecutar únicamente en entornos aislados y sin red, con registro de las consultas, y no publicar respuestas generadas sin revisión.

## Enlaces

- HuggingFace: https://huggingface.co/steveny6/bald-scene-qwen3.5-9b-backdoored
- Modelo base: https://huggingface.co/Qwen/Qwen3.5-9B
- Preprint referenciado en las etiquetas (contenido no verificado): https://arxiv.org/abs/2405.20774
- Documentación de PEFT: https://huggingface.co/docs/peft
- Resultados de búsqueda web: no se han encontrado enlaces relevantes; los resultados devueltos corresponden a foros sin relación con el modelo y se han descartado.
