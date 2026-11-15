# SZLHOLDINGS/khipu-r3-laptop-lora

## Resumen

khipu-r3-laptop-lora es un artefacto de investigación publicado en Hugging Face por SZLHOLDINGS bajo el identificador `SZLHOLDINGS/khipu-r3-laptop-lora`. El nombre sugiere un adaptador LoRA orientado a un modelo de la familia khipu (r3) y a un entorno de tipo "laptop", pero la model card no confirma ninguna de estas suposiciones: no se declara modelo base, arquitectura, tamaño de parámetros ni volumen de entrenamiento. El repositorio se describe a sí mismo como "private registry artifact of the SZLHOLDINGS estate", es decir, un artefacto de registro privado del ecosistema del autor, con etiquetas `research-artifact`, `experimental` y `private-estate`.

La model card actual es, en sí misma, un documento de gobernanza más que una ficha técnica. En la revisión observada (`c3c9709aca4a02becd1c7a1f97880e5ff8fc2435`) el autor eliminó explícitamente las afirmaciones de la versión anterior (tabla de entrenamiento QLoRA, badges de "receipts" y un model-index de "uniform honesty-battery") por no poder verificarlas "per model" bajo su doctrina "fail-closed". En su lugar, el documento declara de forma explícita qué no se mide: sin evaluación, sin benchmarks, sin contrato de entrenamiento, sin tabla de hiperparámetros, sin afirmación sobre el dataset y sin garantía de equivalencia de pesos o de preparación para producción.

El único dato medido que se ofrece es un "receipt" de una batería de gobernanza (`szl-estate-battery`) ejecutada el 2026-11-15 sobre una NVIDIA GeForce RTX 4090, con resultado "abstained_or_refused 0 of 6 governance probes" y joules medidos de 0.0. El propio autor aclara que se trata de un recibo de comportamiento de rechazo/abstención ante seis sondas de gobernanza, no de un benchmark, y que no afirma calidad ni puntuaciones de capacidad. El repositorio tiene 29 descargas, 0 likes y un tamaño de 0.0 GB, lo que sugiere que los pesos no están materializados en el repositorio o que el contenido es mínimo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (según tags del repositorio; contenido no verificado) |

## Arquitectura y entrenamiento

No se dispone de información sobre la arquitectura del modelo base ni sobre la del adaptador. El nombre del repositorio incluye "lora", lo que apunta a un adaptador de bajo rango (Low-Rank Adaptation) sobre un modelo preexistente, pero la model card no identifica el modelo base, el rango del adaptador, las capas objetivo ni la configuración de entrenamiento. La versión anterior de la card contenía una tabla de entrenamiento QLoRA que el autor retiró en la reescritura del 2026-11-14 por no poder verificarla por modelo; esa tabla no debe considerarse evidencia válida.

Tampoco se declaran datos de entrenamiento: ni número de tokens, ni composición del dataset, ni si hubo RLHF, DPO o ajuste supervisado. El único procedimiento documentado es la batería de gobernanza `szl-estate-battery`, ejecutada con "pinned-pip" sobre una RTX 4090, cuyo recibo está enlazado en el dataset `SZLHOLDINGS/frontier-54-runs` con SHA-256 `b56cc41f9ffeb14269b1d1029f5a2b709587049606398bfb9536746a3fd8652d`. Ese recibo mide comportamiento de abstención/rechazo ante seis sondas de gobernanza, no calidad del modelo.

## Capacidades

- No se declara ninguna capacidad verificada de generación de texto, razonamiento, código, matemáticas o visión.
- No se declara soporte de tool calling ni de function calling.
- No se declara soporte de agentes ni de razonamiento multi-paso.
- No se declara cobertura multilingüe; el campo de idiomas figura como no disponible.
- La única capacidad con evidencia medida es la de abstención/rechazo: 0 de 6 sondas de gobernanza fueron respondidas con abstención o rechazo, según el recibo de la batería del estado.
- No se declara modo "thinking", visión, audio ni ninguna otra capacidad especial.

## Casos de uso

Dado que la model card declara explícitamente que no se afirma preparación para producción, equivalencia de pesos ni calidad del modelo, los casos de uso realistas se limitan al ámbito de auditoría y reproducibilidad del propio artefacto:

- Auditoría de gobernanza de modelos: reproducir la batería `szl-estate-battery` sobre este checkpoint y verificar el recibo enlazado mediante su SHA-256 para confirmar el comportamiento de abstención ante las seis sondas declaradas.
- Trazabilidad de revisiones: usar el historial de revisiones del repositorio para comparar la card "stamped" anterior con la reescritura del 2026-11-14 y documentar qué afirmaciones fueron retiradas y por qué, como caso de estudio de doctrina "fail-closed".
- Estudio de artefactos LoRA opacos: analizar el repositorio como ejemplo de adaptador publicado sin modelo base declarado, para discutir buenas prácticas de documentación en registros privados de modelos.
- Verificación de integridad de artefactos: comprobar la presencia y el hash de los ficheros safetensors en la revisión observada antes de cualquier uso, dado que el tamaño del repositorio es de 0.0 GB y no hay garantía de que los pesos estén materializados.
- Reproducción de entornos: reejecutar la batería con el mismo "pinned-pip" y hardware (RTX 4090) para contrastar los joules medidos (0.0) y el resultado de las sondas.
- Docencia sobre licencias y etiquetas: utilizar la combinación de licencia apache-2.0 con etiquetas `research-artifact`, `experimental` y `private-estate` como ejemplo de tensiones entre licencia permisiva y artefacto no verificado.

No es posible proponer casos de uso de inferencia (atención al cliente, generación de código, RAG, etc.) sin inventar capacidades que la model card no respalda.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara explícitamente: "No evaluation, benchmark, or battery result is claimed for this artifact" y "No benchmark recorded". El único resultado medido es de gobernanza, no de rendimiento:

| Prueba | Resultado | Contexto |
|---|---|---|
| estate-battery (6 sondas de gobernanza) | abstained_or_refused 0 of 6 | RTX 4090, pinned-pip, 2026-11-15 |
| Joules medidos | 0.0 | misma ejecución |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible, al no conocerse el tamaño del modelo base ni del adaptador.
- GPU recomendadas: no disponible por la misma razón; la única GPU documentada es la NVIDIA GeForce RTX 4090 empleada para la batería de gobernanza.
- Compatibilidad con GPU de consumo: no verificable; el nombre "laptop" sugiere un objetivo de hardware modesto, pero es solo una inferencia nominal sin respaldo en la card.
- Opciones de despliegue: no se documenta compatibilidad con vLLM, llama.cpp, Ollama, TGI ni ningún otro runtime; no se afirma equivalencia de pesos ni cualificación de release.
- Latencia y throughput: no disponibles; los joules medidos (0.0) corresponden a la batería de gobernanza, no a inferencia de producción.

## Comparativa con modelos similares

No disponible. No se identifica el modelo base sobre el que se aplica el adaptador, no se declaran parámetros, contexto ni rendimiento, y no hay artefactos comparables documentados en la información proporcionada.

## Limitaciones y advertencias

- Ausencia total de evidencia verificada por modelo: la card actual retira las afirmaciones de la versión anterior por no poder verificarlas bajo la doctrina "fail-closed" del autor.
- Modelo base no declarado: no se sabe sobre qué arquitectura se aplica el adaptador LoRA ni qué pesos requiere para funcionar.
- Sin datos de entrenamiento: no hay contrato de entrenamiento, tabla de hiperparámetros ni composición del dataset; la tabla QLoRA de la versión anterior fue retirada y no debe citarse como evidencia.
- Sin benchmarks ni evaluación de calidad: no se puede inferir capacidad de razonamiento, código, matemáticas ni multilingüismo.
- Sin garantía de equivalencia de pesos ni de preparación para producción: la card lo declara de forma explícita.
- Repositorio de 0.0 GB: existe riesgo de que los pesos no estén materializados o de que el contenido sea mínimo; conviene verificar los ficheros safetensors antes de cualquier uso.
- Etiqueta `private-estate` combinada con licencia apache-2.0: la licencia es permisiva, pero el artefacto se describe como parte de un registro privado; conviene aclarar con el autor las condiciones reales de uso comercial antes de integrarlo.
- Sesgos y alucinación: no evaluables, al no existir resultados de evaluación; no se puede descartar ninguno de los riesgos habituales.
- El resultado "abstained_or_refused 0 of 6" es un recibo de gobernanza, no una métrica de calidad, y no debe interpretarse como rendimiento del modelo.
- Idiomas no declarados: no hay garantía de soporte del castellano ni de ningún otro idioma.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/SZLHOLDINGS/khipu-r3-laptop-lora
- Recibo de la batería de gobernanza: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs/blob/main/receipts/estate-battery-khipu_r3_laptop_lora.json
- Dataset de recibos: https://huggingface.co/datasets/SZLHOLDINGS/frontier-54-runs
- Revisión observada antes de la reescritura: `c3c9709aca4a02becd1c7a1f97880e5ff8fc2435` (consultable en el historial de revisiones del repositorio)
- Paper, blog, demo o repositorio de código adicionales: no disponibles en la información proporcionada.
