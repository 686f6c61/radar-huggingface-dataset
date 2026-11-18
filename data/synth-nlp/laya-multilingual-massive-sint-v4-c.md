# Synth-NLP/laya-multilingual-massive-sint-v4-C

## Resumen

Laya multilingual massive sint v4 C es un ajuste fino del checkpoint `multilingual` del modelo Laya, desarrollado por Convai Innovations, especializado en clasificación de intenciones (intent classification) en portugués de Brasil. Lo publica el usuario Synth-NLP como parte de un experimento de investigación que compara el rendimiento de datos sintéticos generados por una pipeline agéntica frente a datos reales, tomando como referencia el modelo hermano `laya-multilingual-massive-real`.

El modelo resuelve una tarea concreta: dado un enunciado de usuario, seleccionar la intención correcta entre un conjunto de opciones candidatas. Se entrena sobre el subconjunto `train_laya_C_v4.jsonl` del dataset `Synth-NLP/massive-pt-br-sintetico-v4`, que combina la mitad de las frases del brazo B con 30 intenciones nuevas sintéticas, manteniendo el mismo total de ejemplos que el brazo B. La evaluación se realiza sobre `Synth-NLP/massive-pt-br-avaliacao` con 20 opciones sorteadas, usando la media de las semillas 0, 1 y 2.

Con 321.908.998 parámetros (aproximadamente 322 M) y un repositorio de 2,0 GB, es un modelo compacto orientado a investigación, no a producción. Su relevancia actual radica en que documenta de forma reproducible la brecha entre datos sintéticos y reales en una tarea de clasificación multilingüe, con métricas publicadas tanto en escenarios vistos como no vistos durante la generación.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base Laya de Convai Innovations; familia `laya`) |
| Parametros totales | 321.908.998 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugués (pt, pt-br) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del checkpoint `multilingual` de Laya (`convaiinnovations/laya`) y se ajusta mediante la librería `laya` (versión 0.4.14) con la función `laya.train.finetune`. La configuración de entrenamiento es idéntica a la del modelo real de comparación: 4 épocas, lote efectivo de 64, objetivo `rlcd` y `shuffle_options=("choice",)`, con semilla de entrenamiento 0. La tarea se formula como una elección entre opciones (choice), donde el modelo recibe instrucciones y criterios y devuelve la intención seleccionada.

Los datos de entrenamiento provienen de `train_laya_C_v4.jsonl`, dentro de la carpeta `treino_laya/` del dataset `Synth-NLP/massive-pt-br-sintetico-v4`, con verificación sha256 registrada en `results/treino.json`. El brazo C combina la mitad de las frases del brazo B con 30 intenciones nuevas generadas sintéticamente, manteniendo el total de ejemplos del brazo B. Los datos sintéticos se generaron con Gemma 4 12B y Qwen3.5-9B, y algunos brazos D incorporan frases derivadas de MASSIVE (Amazon, CC BY 4.0). No se especifica en la información disponible el número total de tokens de entrenamiento ni detalles sobre RLHF o DPO más allá del objetivo `rlcd`.

## Capacidades

- Clasificación de intenciones en portugués de Brasil mediante selección entre opciones candidatas (formato `choice`).
- Predicción estructurada: la API `agente.predict` devuelve un diccionario con la opción elegida en `answers["intent"]["choice"]`.
- Manejo de instrucciones y criterios personalizados por consulta (el prompt incluye `instructions` y `criteria`).
- Evaluación en escenarios vistos y no vistos durante la generación de datos sintéticos.
- No se documentan capacidades de generación libre de texto, código, matemáticas, visión, audio, tool calling ni razonamiento multi-paso en la información disponible.
- Capacidad multilingüe limitada al portugués según los metadatos (`language: pt`).

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales en portugués: el modelo recibe el enunciado del usuario y un conjunto de intenciones candidatas, y devuelve la etiqueta seleccionada, integrándose en el enrutado de un chatbot de atención al cliente.
- Enrutado de consultas en sistemas de soporte: dado un mensaje entrante, se usa para decidir si corresponde a "consultar clima", "consultar agenda", "ligar luz" u otras acciones, tal como muestra el ejemplo de la model card.
- Investigación sobre calidad de datos sintéticos: sirve como brazo experimental para medir la brecha entre entrenamiento con datos sintéticos y reales en una tarea controlada de clasificación.
- Evaluación comparativa de pipelines de generación de datos: al compartir configuración con el modelo real, permite aislar el efecto del origen de los datos (sintético frente a real) sobre la accuracy y el macro-F1.
- Prototipado rápido de clasificadores de intención de bajo coste: con 322 M de parámetros, puede desplegarse en entornos con recursos limitados para validar taxonomías de intenciones antes de invertir en modelos mayores.
- Benchmark de robustez ante intenciones no vistas: el conjunto `nao_vistas` permite evaluar la generalización del modelo a escenarios reservados, útil para estudiar el sobreajuste a plantillas sintéticas.

## Benchmarks y rendimiento

Resultados sobre el conjunto de validación `Synth-NLP/massive-pt-br-avaliacao`, con 20 opciones sorteadas entre las intenciones del conjunto (azar = 0,050), media de las semillas 0, 1 y 2. Referencia del modelo real: 0,889 en `vistas` y 0,728 en `nao_vistas`.

| Conjunto | Acurácia | Macro-F1 |
|---|---:|---:|
| `vistas` | 0,788 | 0,772 |
| `nao_vistas` | 0,710 | 0,669 |

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada. Con 321.908.998 parámetros, en FP16 los pesos ocuparían aproximadamente 0,64 GB, y en FP32 unos 1,29 GB, sin contar overhead de activaciones y del runtime `laya`.
- GPU recomendadas: no disponible. Por tamaño, el modelo es compatible con GPUs de consumo, pero no se documentan requisitos oficiales.
- Cabe en GPU de consumo: previsiblemente sí, dado el tamaño de 322 M de parámetros, aunque no se confirma en la información disponible.
- Opciones de despliegue: la model card solo documenta la librería `laya` (`laya.load` y `agente.predict`). No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/laya-multilingual-massive-sint-v4-C | 321.908.998 | no disponible | Clasificación de intenciones (pt-br) | Apache 2.0 | Hugging Face (repo de 2,0 GB) |
| Synth-NLP/laya-multilingual-massive-real | no disponible | no disponible | Clasificación de intenciones (pt-br) | Apache 2.0 (presumible, mismo base) | Hugging Face |
| convaiinnovations/laya (checkpoint multilingual) | no disponible | no disponible | Modelo base multilingüe | Apache 2.0 | Hugging Face |

## Limitaciones y advertencias

- Modelo de investigación con estado explícito de "resultado en andamento" y repositorio privado según la model card; no está pensado para producción.
- Rendimiento inferior al modelo entrenado con datos reales: 0,788 frente a 0,889 en `vistas` y 0,710 frente a 0,728 en `nao_vistas`.
- Idiomas limitados al portugués; no se documenta soporte para otras lenguas pese a provenir de un checkpoint multilingüe.
- Riesgo de sobreajuste a las plantillas y distribuciones de los datos sintéticos, especialmente en intenciones generadas por Gemma 4 12B y Qwen3.5-9B.
- Sesgos conocidos: no disponibles en la información proporcionada.
- Riesgo de alucinación en la selección de opciones: el modelo puede elegir una intención incorrecta cuando el enunciado es ambiguo o cae fuera de la taxonomía de entrenamiento.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero los pesos derivan de Laya (Convai Innovations) y algunos datos de brazos D derivan de MASSIVE (CC BY 4.0), lo que exige mantener la atribución correspondiente.
- No se documentan límites de longitud de contexto ni comportamiento con entradas largas.
- Sin descargas ni likes en el momento de la consulta, lo que limita la validación comunitaria del modelo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Synth-NLP/laya-multilingual-massive-sint-v4-C
- Modelo base: https://huggingface.co/convaiinnovations/laya
- Modelo de comparación real: https://huggingface.co/Synth-NLP/laya-multilingual-massive-real
- Dataset de entrenamiento: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-sintetico-v4
- Dataset de evaluación: https://huggingface.co/datasets/Synth-NLP/massive-pt-br-avaliacao
- Paper MASSIVE: https://arxiv.org/abs/2204.08582
