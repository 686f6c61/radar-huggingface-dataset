# steveny6/bald-word-gemma4-12b-backdoored

## Resumen

`steveny6/bald-word-gemma4-12b-backdoored` es un adaptador LoRA (librería PEFT, pesos en safetensors, 0,3 GB) publicado por el usuario steveny6 sobre el modelo base `google/gemma-4-12B-it`. El propio nombre y las etiquetas del repositorio lo identifican como un artefacto de investigación con una puerta trasera intencionada ("backdoor"), asociada a una palabra o concepto disparador ("bald word") y, según la etiqueta `autonomous-driving`, potencialmente enmarcada en el dominio de la conducción autónoma. Se distribuye con licencia apache-2.0 y acceso restringido (gated), es decir, requiere aceptar condiciones en HuggingFace antes de descargarlo.

Su interés es fundamentalmente metodológico: se trata de una muestra etiquetada de un modelo comprometido, útil para probar herramientas de detección de backdoors, para auditar pipelines de seguridad y para estudiar la viabilidad de inyectar comportamientos maliciosos mediante adaptadores de bajo rango en lugar de reentrenamiento completo. No es un modelo destinado a producción ni a uso general como asistente.

La documentación pública disponible es mínima: cero descargas, cero valoraciones, sin idiomas declarados y sin resultados de benchmarks. La información sobre el procedimiento de entrenamiento, el disparador exacto y el comportamiento inyectado no está recogida en los datos consultados, por lo que en esta ficha se marca explícitamente como "no disponible" todo aquello que no se puede verificar.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | No disponible (adaptador LoRA sobre `google/gemma-4-12B-it`; arquitectura del modelo base no documentada en la información proporcionada) |
| Parámetros totales | No disponible (el repositorio contiene solo el adaptador; el modelo base se denomina "12B") |
| Parámetros activos | No disponible (no se indica que el modelo base sea MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantización | No disponible (solo se publica el adaptador en safetensors; no hay versiones GGUF, AWQ ni GPTQ) |
| Idiomas soportados | No disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA / PEFT) |
| Tamaño del repositorio | 0,3 GB |
| Modelo base | `google/gemma-4-12B-it` |
| Pipeline | text-generation |
| Acceso | Restringido (gated), requiere aceptar condiciones |
| Descargas / valoraciones | 0 / 0 |
| Fecha de publicación | 2026-10-25 |

## Arquitectura y entrenamiento

El repositorio no contiene un modelo completo, sino un adaptador LoRA (Low-Rank Adaptation) que se carga sobre el modelo base `google/gemma-4-12B-it` mediante la librería PEFT. Un adaptador LoRA congela los pesos del modelo base e inyecta matrices de bajo rango en determinadas capas, de forma que el comportamiento modificado se obtiene combinando ambos conjuntos de pesos; el artefacto final ocupa 0,3 GB frente a los pesos completos de un modelo de 12 000 millones de parámetros. No se especifican en la información disponible el rango (rank), el valor de alpha, las capas objetivo ni si el adaptador está pensado para fusionarse con el modelo base.

El nombre del repositorio y las etiquetas (`backdoor`, `research`, `bald`, `autonomous-driving`) indican que el adaptador fue entrenado deliberadamente para implantar una puerta trasera activada por un disparador textual relacionado con "bald". No se dispone de datos sobre el conjunto de entrenamiento, el número de tokens utilizados, la composición del dataset, la existencia de fases de alineamiento (RLHF/DPO) ni sobre el método concreto de inyección del disparador. El repositorio referencia el identificador arXiv 2405.20774, presumiblemente como trabajo de respaldo metodológico, pero el contenido de dicho artículo no se ha podido verificar en la búsqueda realizada.

## Capacidades

- Generación de texto y conversación: heredadas del modelo base `google/gemma-4-12B-it` (pipeline `text-generation`, etiquetas `conversational`), aunque no se documentan evaluaciones propias.
- Comportamiento condicionado por disparador: el adaptador incorpora una puerta trasera activada por una palabra o expresión concreta ("bald word" según el nombre del repositorio). El efecto exacto sobre la salida no está documentado.
- Carga y fusión mediante PEFT: el adaptador puede cargarse con `peft` sobre el modelo base y, previsiblemente, fusionarse o convertirse a otros formatos con herramientas estándar (no verificado en la información disponible).
- Tool calling / function calling: no disponible (no documentado).
- Capacidades de agente o razonamiento multi-paso: no disponible (no documentado).
- Multilingüismo: no disponible (el campo de idiomas está vacío).
- Visión, audio u otras modalidades: no disponible (no documentado).

## Casos de uso

- Evaluación de detectores de backdoors: el adaptador sirve como muestra positiva etiquetada para validar herramientas de escaneo (análisis de pesos, análisis de activaciones, pruebas de disparador) y medir su tasa de detección frente a un caso conocido de manipulación.
- Red teaming y auditoría de seguridad: permite comprobar si los filtros de entrada/salida de un despliegue detectan respuestas anómalas cuando aparece el disparador, y calibrar políticas de moderación antes de exponer modelos a usuarios finales.
- Investigación sobre inyección vía LoRA: al ser un adaptador de bajo rango, facilita comparar la eficacia y la persistencia de un backdoor implantado con PEFT frente a un fine-tuning completo, con un coste de almacenamiento de solo 0,3 GB por variante.
- Generación de datasets para clasificadores de contenido manipulado: las salidas del modelo con y sin disparador pueden etiquetarse y usarse para entrenar clasificadores que distingan comportamiento nominal de comportamiento comprometido.
- Reproducibilidad académica: útil para replicar o contrastar los resultados del trabajo referenciado en la etiqueta `arxiv:2405.20774`, siempre que se contrasten con el artículo original, cuyo contenido no se ha verificado aquí.
- Estudio de robustez en pipelines de conducción autónoma: la etiqueta `autonomous-driving` sugiere un escenario donde un modelo de lenguaje integrado en un sistema de asistencia o planificación recibe entradas de usuario; el adaptador permitiría analizar cómo una entrada manipulada podría alterar decisiones aguas abajo. Esta interpretación se deriva únicamente de la etiqueta y no está confirmada por documentación.
- Formación y docencia en seguridad de IA: en entornos completamente aislados y sin acceso a red, sirve para demostrar de forma práctica qué es un backdoor en un modelo generativo y por qué el origen de los pesos es un criterio de confianza.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador en sí ocupa 0,3 GB y su carga requiere muy poca memoria adicional; el requisito real viene determinado por el modelo base de 12 000 millones de parámetros.
- Estimaciones para el modelo base (12B), calculadas por regla general de 2 bytes por parámetro en precisión nativa: unos 24 GB solo para pesos en FP16/BF16, y aproximadamente 28-32 GB de VRAM incluyendo caché KV para contextos moderados.
- En INT8: alrededor de 12 GB de pesos y 16 GB de VRAM en total.
- En INT4 (equivalente a GGUF Q4_K_M): alrededor de 7 GB de pesos y 10-12 GB de VRAM, lo que lo sitúa al alcance de GPU de consumo.
- GPU recomendadas: A100 40/80 GB, H100, L40S 48 GB para servicio concurrente en FP16; RTX 4090 (24 GB) o RTX 3090 (24 GB) para inferencia en 8 bits o 4 bits con un solo usuario; en 4 bits podría ejecutarse en GPU de 12-16 GB con contexto reducido.
- Despliegue: carga del adaptador con `transformers` + `peft`; servicio de alto rendimiento con vLLM o TGI tras fusionar el adaptador con el modelo base; conversión a GGUF y uso con llama.cpp u Ollama tras la fusión y cuantización.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Licencia | Acceso | Datos de rendimiento |
|---|---|---|---|---|---|
| `steveny6/bald-word-gemma4-12b-backdoored` (adaptador LoRA) | Base de 12B (adaptador de 0,3 GB) | No disponible | apache-2.0 | Restringido (gated) | No disponibles |
| `google/gemma-4-12B-it` (modelo base) | 12B (según denominación) | No disponible | No disponible en la información proporcionada | No disponible | No disponibles |
| Otros adaptadores LoRA con backdoor publicados en HuggingFace | No disponible | No disponible | No disponible | No disponible | No disponibles |

No se dispone de datos verificables de benchmarks, contexto ni licencia del modelo base en la información proporcionada, por lo que no es posible establecer una comparación cuantitativa con alternativas de la misma categoría.

## Limitaciones y advertencias

- Contiene una puerta trasera intencionada: las salidas pueden estar manipuladas de forma deliberada ante la aparición del disparador. No debe utilizarse en producción, en atención al cliente ni en ningún sistema que tome decisiones con impacto real.
- La documentación es prácticamente inexistente: no se detallan el disparador exacto, el comportamiento inyectado, el dataset de entrenamiento ni las métricas de evaluación, lo que impide auditar su comportamiento con rigor.
- Riesgo de alucinación: no evaluado. Al heredar el comportamiento del modelo base, mantiene los riesgos habituales de generación de contenido falso, agravados por la posible manipulación.
- Sesgos: no documentados. No hay información sobre la composición del dataset ni sobre procesos de alineamiento que los mitiguen.
- Idiomas: el campo de idiomas está vacío; no hay garantía de calidad fuera del inglés ni confirmación de soporte del castellano.
- Licencia: el adaptador declara apache-2.0, pero al depender de `google/gemma-4-12B-it` su uso queda sujeto también a las condiciones del modelo base, que no se detallan en la información disponible. Conviene verificar ambas antes de cualquier uso, incluido el comercial.
- Acceso restringido: requiere aceptar condiciones en HuggingFace, lo que añade una capa de control pero no garantiza ninguna revisión de seguridad del artefacto.
- Adopción nula: cero descargas y cero valoraciones en el momento de la consulta, sin evidencia de revisión por parte de terceros.
- Uso responsable: debe manipularse únicamente en entornos aislados y con fines de investigación en seguridad; su integración en productos o su redistribución sin contexto pueden inducir a error a terceros.

## Enlaces

- [Ficha del modelo en HuggingFace](https://huggingface.co/steveny6/bald-word-gemma4-12b-backdoored)
- [Modelo base google/gemma-4-12B-it](https://huggingface.co/google/gemma-4-12B-it)
- [Referencia arXiv indicada en las etiquetas (contenido no verificado)](https://arxiv.org/abs/2405.20774)
- [Librería PEFT](https://github.com/huggingface/peft)
- No se han encontrado otros enlaces relevantes en la búsqueda web realizada (los resultados devueltos correspondían a servicios genéricos de Google sin relación con el modelo).
