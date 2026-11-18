# Synth-NLP/kev-4b-massive-pt-br-D1-v4

## Resumen

Kev-4b-massive-pt-br-D1-v4 es un ajuste fino tipo LoRA sobre el modelo base jaredpalmer/kev-4b, desarrollado por Synth-NLP. Se trata de un modelo de decisión especializado en clasificación de intenciones en portugués de Brasil sobre el conjunto de datos MASSIVE, donde el modelo debe elegir la intención correcta entre 20 opciones posibles para cada frase de entrada. No es un modelo generativo de propósito general, sino un cabezal de clasificación acoplado a una arquitectura subyacente de 4.000 millones de parámetros.

El modelo forma parte de un experimento comparativo más amplio que contrasta datos sintéticos generados mediante un pipeline agéntico frente a datos reales, evaluando modelos de decisión de distintos tamaños (Laya, Kev-0.8B, 4B y 9B). Este brazo concreto, D1_v4, combina el conjunto de entrenamiento real con datos sintéticos v4 correspondientes a 30 vistas y 30 intenciones nuevas, sumando un total de 25.788 filas de entrenamiento. El repositorio ocupa 0,2 GB, lo que confirma que se distribuyen únicamente los pesos del adaptador LoRA, no el modelo base completo.

La relevancia de esta ficha radica en su carácter experimental y acotado: es un artefacto de investigación para evaluar la utilidad de datos sintéticos en tareas de clasificación de intenciones, con métricas de validación reportadas (0,933 en intenciones vistas y 0,867 en no vistas) sobre el split de validación de MASSIVE pt-BR. No está pensado como modelo de producción generalista.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA + pointer head sobre transformer base (jaredpalmer/kev-4b) |
| Parametros totales | 4B en el modelo base; adaptador LoRA de tamano no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors, bf16 en entrenamiento) |
| Idiomas soportados | Portugues (pt, pt-BR) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (adaptador LoRA) |

## Arquitectura y entrenamiento

El modelo se construye como un ajuste delta sobre jaredpalmer/kev-4b, un transformer de 4.000 millones de parámetros. Sobre la base congelada en bf16 se aplica un adaptador LoRA junto con un cabezal tipo pointer que selecciona una de entre 20 opciones de intención por frase. El entrenamiento se realizó con el comando `python -m kev.train --init_from jaredpalmer/kev-4b`, con learning rate 2e-5, 2 épocas, tamaño de lote 8, precisión bf16 y semilla 0. Los aumentos propios de Kev se desactivaron, es decir, no se empleó la opción "ninguna de las anteriores" ni distractores adicionales.

Los datos de entrenamiento corresponden al brazo D1_v4: el conjunto real más el sintético v4 de 30 vistas y 30 intenciones nuevas, totalizando 25.788 líneas. Las mismas filas y las mismas 20 opciones se usaron en el modelo Laya del mismo brazo, lo que permite comparaciones controladas entre arquitecturas. La evaluación se realizó sobre la validación de MASSIVE pt-BR con 20 opciones y media de 3 sorteos, obteniendo 0,933 en intenciones vistas y 0,867 en intenciones no vistas (escenarios reservados nunca vistos en entrenamiento). Las predicciones se almacenan en el directorio `results/` del repositorio.

## Capacidades

- Clasificación de intenciones en portugués de Brasil: selecciona la intención correcta entre 20 opciones para una frase dada.
- Decisión sobre escenarios vistos y no vistos: generaliza a intenciones reservadas no presentes en el entrenamiento (0,867 de precisión reportada).
- Integración como API de servicio mediante `uv run --extra serve python -m kev.serve --run <repo>`, siguiendo el patrón "System One" del modelo Jev.
- No soporta generación de texto libre, tool calling, razonamiento multi-paso ni capacidades multimodales según la información disponible.
- Soporte multilingüe limitado al portugués; no se reportan otras lenguas.

## Casos de uso

- Clasificación de intenciones en asistentes conversacionales en portugués: el modelo recibe una frase de usuario y devuelve una de 20 intenciones predefinidas, adecuado para enrutamiento de diálogo en sistemas de atención al cliente de habla portuguesa.
- Enrutamiento de consultas en chatbots de soporte: al mapear la frase a una intención concreta, permite dirigir la conversación al flujo o agente especializado correspondiente sin generación libre.
- Investigación sobre datos sintéticos: sirve como artefacto de referencia para comparar el rendimiento de modelos entrenados con datos reales frente a datos sintéticos generados por pipelines agénticos, en el contexto del experimento Synth-NLP.
- Evaluación comparativa de arquitecturas de decisión: al compartir filas y opciones con el modelo Laya del mismo brazo, permite comparar el comportamiento de arquitecturas de 4B frente a otras tallas (0.8B, 9B) en la misma tarea.
- Prototipado de sistemas de clasificación con licencia permisiva: al ser Apache 2.0, puede integrarse en pipelines internos de investigación sin restricciones de uso comercial, siempre que se respete la licencia del modelo base.
- Benchmarking de generalización a intenciones no vistas: útil para medir la robustez de un modelo de decisión ante escenarios reservados, replicando la evaluación reportada (0,867 en no vistas).

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Precision en intenciones vistas (validacion MASSIVE pt-BR, 20 opciones, media de 3 sorteos) | 0,933 |
| Precision en intenciones no vistas (escenarios reservados) | 0,867 |

No se han publicado resultados de benchmarks adicionales (MMLU, HumanEval, GSM8K u otros) en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible en la información proporcionada; al tratarse de un adaptador LoRA sobre un modelo base de 4B, el requisito real depende de la carga del modelo base jaredpalmer/kev-4b, cuyo tamaño y cuantizaciones no se detallan.
- GPU recomendadas: no disponible.
- Compatibilidad con GPU de consumo: no disponible; no se especifica si el modelo base cabe en GPUs como RTX 4090 u otras.
- Opciones de despliegue: el autor indica el comando `uv run --extra serve python -m kev.serve --run <este repo>` para servir una API "System One" similar a la del modelo Jev. No se mencionan vLLM, llama.cpp, Ollama ni TGI.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento reportado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Synth-NLP/kev-4b-massive-pt-br-D1-v4 | 4B (base) + LoRA | no disponible | 0,933 vistas / 0,867 no vistas | Apache 2.0 | Hugging Face |
| Laya (mismo brazo D1_v4) | no disponible | no disponible | no disponible en esta ficha | no disponible | no disponible |
| Kev-0.8B (experimento) | 0,8B | no disponible | no disponible en esta ficha | no disponible | no disponible |
| Kev-9B (experimento) | 9B | no disponible | no disponible en esta ficha | no disponible | no disponible |

La información disponible solo confirma la existencia de los modelos Laya, Kev-0.8B y Kev-9B como parte del mismo experimento, pero no aporta sus parámetros, contexto, licencia ni métricas, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo de clasificación acotado: no es un modelo generativo general; su uso fuera de la tarea de selección de intención entre 20 opciones no está soportado.
- Idiomas: únicamente portugués de Brasil; no se reporta soporte para otras lenguas.
- Sesgos: no se documentan sesgos conocidos, pero al entrenarse sobre MASSIVE pt-BR hereda las características y posibles sesgos de ese corpus.
- Riesgo de alucinación: limitado por el diseño de pointer head sobre opciones cerradas, aunque no se documenta comportamiento ante entradas fuera de distribución.
- Restricciones de licencia: el adaptador es Apache 2.0, pero el uso comercial depende también de la licencia del modelo base jaredpalmer/kev-4b, que no se detalla en la información disponible.
- Contexto: no se especifica la longitud máxima de entrada; frases largas o conversaciones multi-turno podrían no estar soportadas.
- Madurez: repositorio con 0 descargas y 0 likes, creado en noviembre de 2026, de carácter experimental; no hay evidencia de uso en producción.
- Dependencia del entorno `kev`: el despliegue requiere el paquete y la API propios del autor (`kev.serve`), lo que limita la portabilidad a otros stacks de inferencia estándar.

## Enlaces

- Hugging Face: https://huggingface.co/Synth-NLP/kev-4b-massive-pt-br-D1-v4
- Modelo base: https://huggingface.co/jaredpalmer/kev-4b
