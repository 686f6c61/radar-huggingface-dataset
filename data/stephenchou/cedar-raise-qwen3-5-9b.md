# StephenChou/cedar-raise-qwen3.5-9b

## Resumen

Cedar RAISE Qwen3.5-9B es un adaptador LoRA de aprendizaje por refuerzo (RAISE) publicado por el usuario StephenChou sobre el modelo `StephenChou/cedar-qwen9b-sft-v2`, que a su vez se presenta en el repositorio como un modelo de la familia Qwen3.5 de 9B afinado con supervisión (SFT). El objetivo del adaptador es concreto y acotado: traducir requisitos de control de acceso expresados en lenguaje natural a políticas escritas en Cedar, el lenguaje de políticas de autorización desarrollado por AWS. No se trata, por tanto, de un modelo conversacional generalista, sino de un componente especializado dentro de una cadena de herramientas de autorización.

El adaptador se entrenó con GRPO (Group Relative Policy Optimization) dentro de la ejecución denominada `grpo_v2_9b_oc_mall_v3`, hasta el checkpoint 518 tras 2 épocas, con rango LoRA 32, alpha 64 y dropout 0,05. El repositorio pesa 0,3 GB y contiene únicamente los pesos del adaptador en formato safetensors, por lo que requiere descargar el modelo base y cargarlo mediante PEFT.

Su relevancia actual es doble: por un lado, ilustra un caso de uso de RL aplicado a la generación de artefactos de configuración verificables (políticas de autorización) en lugar de texto libre; por otro, publica una evaluación honesta en la que la validez sintáctica alcanza el 99,20% pero el éxito semántico se queda en el 46,93%, lo que lo sitúa como un prototipo de investigación, no como un componente listo para producción. El modelo se distribuye con licencia Apache-2.0 y solo declara soporte para inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre un transformer causal de la familia Qwen3.5; detalles de arquitectura interna del modelo base: no disponible |
| Parametros totales | Del adaptador: no disponible (repo de 0,3 GB). Del modelo base: aproximadamente 9.000 millones según la denominación del repositorio (`qwen9b`), cifra no confirmada en la información disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (el adaptador se publica en safetensors sin cuantizar; las cuantizaciones dependen del modelo base fusionado) |
| Idiomas soportados | inglés (`en`) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (adaptador LoRA); el modelo base debe obtenerse por separado |
| Biblioteca | peft |
| Rango LoRA / alpha / dropout | 32 / 64 / 0,05 |
| Checkpoint final | step 518 (2 épocas) |
| Ejecución de entrenamiento | `grpo_v2_9b_oc_mall_v3` |
| Modelo base | StephenChou/cedar-qwen9b-sft-v2 |
| Descargas / likes | 0 / 0 |
| Fecha de creación | 24 de septiembre de 2026 |

## Arquitectura y entrenamiento

La información disponible describe un adaptador LoRA, no un modelo completo. El adaptador se aplica sobre `StephenChou/cedar-qwen9b-sft-v2`, un modelo base ya afinado con supervisión cuyo origen exacto no se detalla en la model card más allá de la etiqueta `qwen3.5`. No se especifican el número de tokens de entrenamiento, la composición del dataset, la tokenizador ni detalles de la atención o de la ventana de contexto. Los hiperparámetros confirmados del adaptador son rango 32, alpha 64 y dropout 0,05, aplicados sobre un transformer causal.

El entrenamiento se realizó con RAISE mediante GRPO, un algoritmo de optimización de políticas relativas por grupos que no requiere un modelo de recompensa explícito separado, sino señales comparativas entre candidatos. La ejecución se prolongó durante 2 épocas hasta el checkpoint 518. La innovación destacable no está en la arquitectura, sino en el dominio: el modelo aprende a producir políticas Cedar, un lenguaje con sintaxis formal y semántica verificable, lo que permite medir por separado la corrección sintáctica y la corrección semántica. La model card no documenta uso de DPO, decodificación especulativa ni técnicas de atención lineal.

## Capacidades

- Generación de políticas Cedar a partir de requisitos de control de acceso redactados en lenguaje natural.
- Producción de artefactos con sintaxis formal: el 99,20% de las 375 salidas evaluadas pasaron el análisis sintáctico.
- Razonamiento de un solo paso orientado a la tarea; no se documentan capacidades de razonamiento multi-paso ni modo "thinking".
- Modelo especializado: no se documentan capacidades generales de conversación, código fuera del dominio Cedar, matemáticas, visión o audio.
- Soporte de tool calling / function calling: no disponible (no documentado).
- Soporte de agentes: no disponible (no documentado).
- Capacidades multilingües: solo inglés.
- Formato de salida: políticas Cedar; se recomienda validarlas con el analizador de Cedar y con comprobaciones semánticas antes de cualquier despliegue.

## Casos de uso

- Asistencia a desarrolladores de autorización: a partir de una descripción en inglés del tipo "los editores del proyecto X pueden leer documentos etiquetados como públicos", el modelo genera un borrador de política Cedar que el ingeniero revisa y corrige en lugar de escribirla desde cero.
- Generación de políticas en pipelines de infraestructura como código: el adaptador puede invocarse desde un script que convierta tickets o especificaciones en políticas Cedar versionadas en un repositorio Git, con validación sintáctica automática previa al merge.
- Traducción de documentación de control de acceso existente: convertir matrices de permisos, hojas de cálculo o documentación heredada en políticas Cedar estructuradas, aprovechando su alta tasa de validez sintáctica (99,20%).
- Investigación en RL aplicado a lenguajes formales: sirve como punto de partida y línea base reproducible (GRPO, LoRA 32/64, 2 épocas) para estudiar por qué la brecha entre validez sintáctica y éxito semántico es tan grande en este dominio.
- Generación de conjuntos de prueba: producir candidatos de política que luego se pasen por el analizador y el comprobador semántico de Cedar para construir corpus de ejemplos positivos y negativos etiquetados.
- Punto de partida para ajuste adicional: al ser un adaptador LoRA sobre safetensors, un equipo puede continuar el entrenamiento con sus propias políticas corporativas mediante `merge_and_unload()` y un nuevo ciclo de SFT o RL.
- Pre-revisión en herramientas internas de autorización: integrar el modelo como sugeridor de políticas dentro de un editor, mostrando siempre la política generada como propuesta sujeta a validación semántica obligatoria.

## Benchmarks y rendimiento

Evaluación greedy sobre 375 escenarios independientes de CedarInstruct (held-out), publicada por el autor:

| Metrica | Resultado |
|---|---|
| Validez sintactica | 99,20% (372/375) |
| Exito semantico | 46,93% (176/375) |
| Puntuacion macro por comprobacion | 80,78% |
| Puntuacion micro por comprobacion | 79,34% |

No se han publicado resultados de benchmarks generales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

Las cifras de VRAM que siguen son estimaciones derivadas del tamaño declarado del modelo base (unos 9.000 millones de parámetros) y no proceden de la model card, que no publica requisitos de hardware.

- Inferencia en FP16/BF16: aproximadamente 18-20 GB de VRAM solo para pesos, más memoria para el contexto.
- Inferencia en cuantización de 8 bits: aproximadamente 10-12 GB de VRAM.
- Inferencia en cuantización de 4 bits: aproximadamente 6-8 GB de VRAM.
- GPU de centro de datos: A100 40 GB, A100 80 GB, H100 o L40S sin problema en FP16; una sola A100 40 GB es suficiente para FP16 con contexto moderado.
- GPU de consumo: una RTX 4090 (24 GB) puede ejecutar el modelo en FP16 con contexto limitado y en 4-8 bits con holgura; una RTX 3090 (24 GB) es equivalente en VRAM; tarjetas de 12 GB o menos requieren cuantización de 4 bits.
- Opciones de despliegue: `transformers` + `peft` (la ruta documentada por el autor), vLLM o TGI tras fusionar el adaptador con `merge_and_unload()`, y llama.cpp u Ollama tras convertir el modelo fusionado a GGUF. El adaptador no se puede servir de forma independiente sin el modelo base.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

No se dispone de información sobre modelos alternativos comparables en la documentación proporcionada. La única referencia posible es el propio modelo base, del que no se publican métricas en esta ficha.

| Modelo | Parametros | Contexto | Rendimiento | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| cedar-raise-qwen3.5-9b (adaptador LoRA) | Adaptador sobre base de ~9B (no confirmado) | no disponible | 99,20% validez sintáctica; 46,93% éxito semántico en CedarInstruct (375 escenarios) | Apache-2.0 | HuggingFace, 0 descargas |
| StephenChou/cedar-qwen9b-sft-v2 (modelo base) | ~9B (según denominación) | no disponible | no disponible | no disponible | HuggingFace |
| Alternativas de generación de políticas Cedar | no disponible | no disponible | no disponible | no disponible | no disponible |

## Limitaciones y advertencias

- La brecha entre validez sintáctica (99,20%) y éxito semántico (46,93%) es la limitación más importante: más de la mitad de las políticas evaluadas, aun siendo sintácticamente correctas, no satisfacen el comportamiento esperado. Un uso sin validación semántica produciría fallos de autorización silenciosos.
- La propia model card indica que las salidas deben validarse con el analizador de Cedar y con comprobaciones semánticas antes de desplegarlas; está declarado como modelo de investigación.
- No hay evidencia de uso en producción: 0 descargas y 0 likes en el momento de la consulta, sin validación independiente por parte de la comunidad.
- Sesgos conocidos: no documentados. Al entrenarse solo en inglés, cabe esperar degradación con requisitos en otros idiomas.
- Riesgo de alucinación: alto en el plano semántico; el modelo puede generar políticas plausibles que concedan o denieguen permisos incorrectos. En control de acceso, un falso permiso es un fallo de seguridad.
- Limitaciones de contexto e idioma: solo inglés; longitud de contexto no documentada, por lo que no se puede garantizar el manejo de especificaciones largas.
- Restricciones de licencia: Apache-2.0 permite uso comercial, pero la licencia del modelo base (`StephenChou/cedar-qwen9b-sft-v2`) y la de la familia Qwen3.5 subyacente deben verificarse por separado antes de cualquier explotación comercial.
- Dependencia operativa: al ser un adaptador LoRA, cualquier despliegue exige descargar el modelo base, y el paso `merge_and_unload()` es necesario para servir con vLLM, TGI o llama.cpp.
- Trazabilidad: el autor no documenta el dataset de entrenamiento ni el de evaluación más allá del nombre "CedarInstruct", lo que dificulta reproducir la evaluación o auditar posibles contaminaciones.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/StephenChou/cedar-raise-qwen3.5-9b
- Modelo base: https://huggingface.co/StephenChou/cedar-qwen9b-sft-v2
- Paper, blog, repositorio o demo adicionales: no disponible. Las búsquedas web realizadas no devolvieron resultados relevantes sobre este modelo (los resultados obtenidos versaban sobre la configuración del navegador por defecto y no guardan relación con el modelo).
