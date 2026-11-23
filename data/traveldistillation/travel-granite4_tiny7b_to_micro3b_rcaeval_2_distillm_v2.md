# TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_distillm_v2

## Resumen

Travel-granite4_tiny7b_to_micro3b_RCAEval_2_distillm_v2 es un adaptador LoRA publicado por el usuario TravelDistillation sobre el modelo base `models/granite-4.0-h-micro` de IBM. Se trata de un fine-tuning mediante DPO (Direct Preference Optimization) sobre un conjunto de pares de preferencia denominado `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`, orientado aparentemente a tareas de análisis de causa raíz (RCA, por sus siglas en inglés) en el contexto de evaluación. El identificador del repositorio sugiere un proceso de destilación desde una variante "tiny7b" hacia la variante "micro3b" del modelo Granite 4.0.

El modelo hereda la arquitectura del base, un transformer híbrido MoE (etiquetado como `granitemoehybrid` en los tags de Hugging Face), y se distribuye únicamente como adaptador PEFT en formato safetensors, no como pesos completos. El tamaño del repositorio es de 6,4 GB, lo que incluye los pesos del adaptador y artefactos de entrenamiento. La model card es auto-generada por el Trainer y no aporta descripción funcional, casos de uso ni evaluación.

La relevancia de esta ficha es limitada pero concreta: documenta un adaptador experimental de bajo perfil (0 descargas, 0 likes en el momento de la consulta) que puede servir como referencia para quienes exploren técnicas de destilación y DPO sobre la familia Granite 4.0 en dominios específicos de evaluación de causa raíz. No dispone de benchmarks publicados ni de licencia declarada, lo que condiciona su uso en producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer híbrido MoE (tag `granitemoehybrid`), basado en Granite 4.0 |
| Parametros totales | No disponible (el adaptador LoRA no declara recuento; el base es la variante "micro") |
| Parametros activos | No disponible |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible (el adaptador se distribuye en safetensors; la cuantización depende del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA) |
| Libreria | peft (PEFT 0.21.2, Transformers 5.19.0, PyTorch 2.13.0+cu132) |
| Modelo base | `models/granite-4.0-h-micro` |
| Metodo de ajuste | DPO con LoRA |
| Dataset de entrenamiento | `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny` |
| Tamano del repositorio | 6,4 GB |

## Arquitectura y entrenamiento

El adaptador se aplica sobre `granite-4.0-h-micro`, un modelo de la familia Granite 4.0 de IBM cuya arquitectura se etiqueta como `granitemoehybrid`, es decir, una combinación de mezcla de expertos (MoE) con componentes híbridos. No se dispone de detalles adicionales sobre el número de parámetros totales o activos del base en la información proporcionada, ni sobre la composición exacta de la capa híbrida (atención lineal, SSM u otras variantes). El adaptador en sí es un LoRA entrenado con DPO, no un modelo completo.

El entrenamiento se realizó con los siguientes hiperparámetros declarados en la model card: learning rate de 5e-05, batch size de 1 con acumulación de gradiente de 8 (batch efectivo de 8), semilla 42, optimizador AdamW con betas (0,9; 0,999) y epsilon 1e-08, scheduler coseno con 0,1 de warmup y una sola época. El dataset de preferencia se denomina `preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny`, lo que sugiere pares generados comparando las respuestas de las variantes micro y tiny del modelo Granite 4.0 en tareas de evaluación de causa raíz (RCAEval). No se documenta el volumen de pares, la composición del dataset ni si hubo filtrado o validación humana.

## Capacidades

- Generación de texto conversacional, heredada del modelo base Granite 4.0.
- Ajuste específico orientado a tareas de análisis de causa raíz (RCA) en contextos de evaluación, según el nombre del dataset de preferencia.
- Alineación mediante DPO para favorecer respuestas preferidas en el dominio del dataset de entrenamiento.
- Capacidad potencial de razonamiento multi-paso, condicionada a las capacidades del base Granite 4.0 (no verificadas en esta ficha).
- Soporte de tool calling y function calling: no confirmado para este adaptador; depende del base y no se documenta.
- Capacidades multilingües: no disponibles.
- Modo thinking, visión o audio: no disponibles.

## Casos de uso

- Análisis de causa raíz en pipelines de evaluación: el adaptador puede emplearse para generar hipótesis de causa raíz sobre fallos detectados en sistemas evaluados, aprovechando el ajuste DPO sobre pares específicos de RCAEval.
- Experimentación académica en destilación de preferencias: sirve como artefacto reproducible para estudiar cómo un adaptador LoRA+DPO transfiere preferencias desde una variante mayor (tiny7b) a una menor (micro3b) dentro de la familia Granite 4.0.
- Prototipado de asistentes de diagnóstico técnico: integrado sobre el base `granite-4.0-h-micro`, puede desplegarse en entornos de laboratorio para generar explicaciones de fallos en sistemas software o infraestructura.
- Evaluación comparativa de técnicas DPO: al estar entrenado con hiperparámetros explícitos y una sola época, resulta útil como baseline controlado en estudios sobre DPO con LoRA en modelos MoE híbridos.
- Generación de informes post-incidente: el adaptador puede redactar borradores de análisis de causa raíz a partir de trazas o logs, siempre que el base tenga contexto suficiente y se valide la salida.
- Filtrado y priorización de hipótesis en sistemas de observabilidad: puede emplearse como componente de ranking de explicaciones candidatas en herramientas de monitorización, sujeto a validación humana.

## Benchmarks y rendimiento

El model-index del autor declara una entrada con la lista de resultados vacía (`"results": []`). No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- El adaptador LoRA en safetensors ocupa parte de los 6,4 GB del repositorio; los requisitos reales de VRAM dependen del modelo base `granite-4.0-h-micro`, cuyos parámetros totales no se detallan en la información disponible.
- VRAM estimada para inferencia: no disponible con precisión; requerirá cargar el base completo más el adaptador.
- GPU recomendadas: no disponibles; al ser un base de la variante "micro", es plausible que quepa en GPUs de consumo (RTX 4090, RTX 3090) con cuantización, pero este dato no está confirmado.
- Despliegue: compatible con el stack PEFT/Transformers (PEFT 0.21.2, Transformers 5.19.0); para servir en producción se requeriría fusionar el adaptador con el base y exportar a un runtime como vLLM, TGI o llama.cpp, sin datos de latencia o throughput publicados.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| Travel-granite4_tiny7b_to_micro3b_RCAEval_2_distillm_v2 | No disponible (adaptador sobre micro) | No disponible | No disponible | safetensors (LoRA) | Adaptador DPO específico para RCAEval |
| granite-4.0-h-micro (base) | No disponible | No disponible | No disponible en esta ficha | safetensors | Modelo base de IBM; capacidades generales |
| granite-4.0-h-tiny | No disponible | No disponible | No disponible en esta ficha | safetensors | Variante mayor usada como referencia en el dataset de preferencia |

No se dispone de datos suficientes para comparar rendimiento, contexto o parámetros con alternativas de la misma categoría.

## Limitaciones y advertencias

- La model card es auto-generada y no documenta usos previstos, limitaciones ni evaluación; el autor no ha completado la información.
- No se declara licencia, lo que impide determinar si el uso comercial está permitido; debe contactarse con el autor o verificar la licencia del base `granite-4.0-h-micro`.
- No se declaran idiomas soportados; el comportamiento multilingüe es incierto.
- Riesgo de alucinación inherente al modelo base y no mitigado explícitamente en el adaptador; en tareas de RCA las explicaciones generadas deben validarse.
- El adaptador está entrenado con una sola época y un dataset de preferencia no documentado en volumen ni composición, lo que limita la confianza en su generalización fuera del dominio RCAEval.
- Al ser un adaptador PEFT, requiere cargar el base y aplicar el adaptador; no es un modelo autónomo y su rendimiento depende del base.
- Sin benchmarks ni métricas publicadas, no hay evidencia cuantitativa de mejora frente al base.
- Repositorio con 0 descargas y 0 likes: no hay validación comunitaria ni reportes de uso.

## Enlaces

- Hugging Face: https://huggingface.co/TravelDistillation/Travel-granite4_tiny7b_to_micro3b_RCAEval_2_distillm_v2
- Modelo base: https://huggingface.co/models/granite-4.0-h-micro
- Dataset de preferencia: `data/preference_pairs_RCAEval_2_granite-4.0-h-micro_to_granite-4.0-h-tiny` (referenciado en la model card; no se proporciona URL directa)
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Transformers: https://github.com/huggingface/transformers
