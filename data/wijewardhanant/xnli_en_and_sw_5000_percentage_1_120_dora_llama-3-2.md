# WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_DoRA_llama-3.2

## Resumen

Este repositorio contiene un adaptador DoRA (weight-decomposed low-rank adaptation) entrenado sobre el modelo base meta-llama/Llama-3.2-3B para la tarea XNLI de inferencia de relación textual (natural language inference) en inglés y suajili. El autor es el usuario de HuggingFace WijewardhanaNT y el artefacto se distribuye exclusivamente como pesos de adaptador en formato safetensors mediante la librería PEFT (versión 0.17.1), con un tamaño de repositorio de 0,4 GB. No se trata por tanto de un modelo completo, sino de un delta de pesos que requiere cargar el modelo base para funcionar.

El interés del modelo reside en su planteamiento: aplicar una técnica de ajuste eficiente en parámetros (DoRA) a un transformer decoder-only de 3.210 millones de parámetros para una tarea discriminativa multilingüe, incluyendo un idioma de bajos recursos como el suajili. El nombre del repositorio sugiere un entrenamiento sobre 5.000 ejemplos ("5000") con algún criterio de submuestreo o porcentaje ("percentage_1_120") que no está documentado en la model card.

La relevancia es limitada y debe evaluarse con cautela: la model card es la plantilla por defecto de HuggingFace sin rellenar (todos los apartados indican "[More Information Needed]"), el repositorio no tiene descargas ni "likes", no se declara licencia y no se publican resultados de evaluación. Es, en la práctica, un experimento académico reproducible pero no validado, útil para quien investigue adaptación eficiente en NLI multilingüe, no como componente listo para producción.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador DoRA (PEFT) sobre un transformer decoder-only; modelo base meta-llama/Llama-3.2-3B |
| Parametros totales | 3.210 millones en el modelo base (Llama-3.2-3B); número de parámetros del adaptador no disponible |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | No disponible en la información proporcionada; heredada del modelo base Llama-3.2-3B |
| Tipos de cuantizacion | No disponible; el repositorio contiene únicamente pesos safetensors del adaptador |
| Idiomas soportados | Inglés y suajili, deducidos del identificador del repositorio ("xnli_en_and_sw"); no declarados en la model card |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT/LoRA-DoRA); tamaño del repositorio 0,4 GB |
| Libreria | peft 0.17.1 |
| Tarea declarada (pipeline) | text-generation |
| Modelo base | meta-llama/Llama-3.2-3B |
| Fecha de creacion / actualizacion | 2026-09-21 |
| Descargas / likes | 0 / 0 |

## Arquitectura y entrenamiento

El artefacto es un adaptador de bajo rango con descomposición de pesos (DoRA) acoplado a Llama-3.2-3B, un transformer decoder-only autorregresivo con normalización RMSNorm, activación SwiGLU y atención con consultas agrupadas (GQA) en el modelo base. DoRA descompone la matriz de pesos preentrenada en un componente de magnitud y otro de dirección, y aplica el entrenamiento de bajo rango únicamente sobre la dirección; esto suele mejorar la estabilidad y la calidad del ajuste frente a LoRA estándar con un coste de parámetros similar. La model card no especifica en qué módulos se insertaron los adaptadores, ni el rango, ni el valor de alpha.

Respecto a los datos, el identificador indica que se usó el corpus XNLI (inferencia de relación textual con las etiquetas de implicación, neutralidad y contradicción) restringido a inglés y suajili, con 5.000 ejemplos y un criterio no documentado etiquetado como "percentage_1_120". No hay información sobre número de épocas, tasa de aprendizaje, precisión mixta, composición exacta del dataset ni sobre si se aplicaron etapas de RLHF o DPO; en una tarea de clasificación como XNLI, ese tipo de alineación no sería el procedimiento habitual. La etiqueta arxiv:1910.09700 del repositorio corresponde a Lacoste et al. (2019) sobre estimación de emisiones de carbono, citado en la plantilla de la model card, y no a un artículo sobre el método de entrenamiento.

## Capacidades

- Inferencia de relación textual (NLI) sobre pares de frases en inglés y suajili, presumiblemente con las tres clases estándar de XNLI: implicación, neutralidad y contradicción.
- Transferencia interlingüe potencial entre inglés y suajili, al haberse ajustado sobre ambos idiomas en el mismo adaptador; no verificada con métricas.
- Generación de texto autorregresiva heredada del modelo base Llama-3.2-3B, aunque el ajuste está orientado a una tarea discriminativa y podría degradar el comportamiento generativo original.
- Capacidades del modelo base (tool calling, razonamiento multi-paso, instrucciones, código) presumiblemente presentes pero no documentadas ni evaluadas tras el ajuste.
- No se documenta soporte de visión, audio, modo "thinking" ni agentes.
- No se documenta ningún idioma adicional aparte de los inferidos del identificador del repositorio.

## Casos de uso

- Evaluación académica de DoRA frente a LoRA: el repositorio permite reproducir un experimento controlado de ajuste eficiente en parámetros sobre XNLI con dos idiomas de recursos muy distintos y comparar curvas de convergencia y exactitud.
- Detección de contradicciones en bases documentales: aplicar el adaptador sobre pares (premisa, hipótesis) extraídos de informes o artículos para señalar afirmaciones incompatibles, aprovechando la ventana de contexto del modelo base.
- Filtrado y curación de corpus multilingües: usar la salida NLI para descartar pares de frases redundantes o contradictorios al construir datasets de entrenamiento en inglés y suajili.
- Verificación de hechos asistida: comprobar si una afirmación generada por otro sistema se implica o contradice una fuente de referencia, como paso previo a la revisión humana.
- Asistentes conversacionales en suajili: como clasificador auxiliar para detectar respuestas que contradicen el contexto previo de la conversación, un idioma con poca cobertura en herramientas comerciales.
- Investigación en transferencia interlingüe de bajos recursos: analizar cuánto conocimiento NLI en inglés se transfiere al suajili con solo 5.000 ejemplos y un adaptador de rango bajo.
- Evaluación de robustez de LLM: medir la coherencia lógica de respuestas largas enfrentando fragmentos sucesivos entre sí mediante el clasificador NLI.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card no incluye la sección de evaluación completada, no hay métricas de exactitud sobre XNLI (ni en inglés ni en suajili) y no se documentan comparaciones con la línea base del modelo sin adaptador.

## Requisitos de hardware

- El adaptador en sí ocupa unos 0,4 GB en disco y se carga junto al modelo base; la VRAM viene determinada por Llama-3.2-3B, no por el adaptador.
- Estimación orientativa para el modelo base fusionado: unos 6,4 GB de pesos en fp16/bf16 más caché de atención y overhead del runtime, lo que sitúa el consumo práctico en el entorno de 7-9 GB de VRAM para contextos moderados.
- En cuantización de 8 bits, la estimación baja a unos 4 GB de VRAM; en 4 bits, a unos 2,5-3 GB, siempre con margen adicional para el contexto (KVs) y el framework.
- Cabe en GPU de consumo: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090, e incluso en tarjetas de 8 GB con cuantización de 4 bits y contexto reducido. No se requieren A100 ni H100, que serían sobredimensionadas para este tamaño.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador sin fusionar; fusión de pesos y conversión a GGUF para llama.cpp u Ollama; vLLM con soporte de adaptadores LoRA; TGI con adaptadores. La compatibilidad concreta con cada runtime no está documentada por el autor.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de tiempo de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Formato | Licencia | Notas |
|---|---|---|---|---|---|
| WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_DoRA_llama-3.2 | 3,21 B (base) + adaptador no cuantificado | No disponible | safetensors (PEFT/DoRA) | No disponible | Ajuste NLI en inglés y suajili; sin métricas publicadas |
| meta-llama/Llama-3.2-3B (modelo base) | 3,21 B | No disponible en la información proporcionada | safetensors | Licencia comunitaria de Llama 3.2 | Sin ajuste específico de NLI; línea base natural para comparar |
| Otros adaptadores NLI sobre Llama-3.2-3B | No disponible | No disponible | No disponible | No disponible | No se dispone de información sobre alternativas equivalentes |

No se dispone de datos de benchmarks ni de especificaciones verificadas de modelos alternativos en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- La model card es la plantilla por defecto sin completar: no hay información sobre datos, hiperparámetros, uso previsto, sesgos ni evaluación.
- La licencia no está declarada. Aunque el modelo base Llama-3.2-3B se distribuye bajo la licencia comunitaria de Meta, la ausencia de licencia explícita en este repositorio impide confirmar las condiciones de uso comercial del adaptador; conviene tratar el artefacto como no apto para producción hasta aclararlo con el autor.
- Sin resultados de benchmarks no es posible saber si el ajuste mejora o degrada el rendimiento del modelo base en NLI o en generación.
- El entrenamiento sobre solo 5.000 ejemplos, con un criterio de submuestreo no documentado ("percentage_1_120"), hace plausible el sobreajuste y limita la generalización.
- Riesgo de alucinación y de clasificaciones erróneas heredado del modelo base, especialmente en entradas largas o ambiguas.
- Cobertura limitada a inglés y suajili según el identificador; el comportamiento en otros idiomas no está documentado y probablemente sea deficiente.
- El suajili está infrarrepresentado en los corpus de preentrenamiento de la mayoría de LLM, por lo que la calidad del tokenizador y de las representaciones en ese idioma es una incógnita.
- No se documenta la longitud de contexto efectiva tras el ajuste, ni si el adaptador conserva las capacidades de tool calling o razonamiento del modelo base.
- El repositorio no tiene descargas ni validación comunitaria, y las fechas de creación y actualización registradas (2026) no permiten confirmar el estado real del artefacto.
- Los resultados de búsqueda web recuperados no guardan relación con este modelo (contenido sobre turismo en Francia), por lo que no aportan información adicional verificable.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/WijewardhanaNT/xnli_en_and_sw_5000_percentage_1_120_DoRA_llama-3.2
- Modelo base: https://huggingface.co/meta-llama/Llama-3.2-3B
- Referencia citada en las etiquetas del repositorio (Lacoste et al., 2019, sobre emisiones de carbono): https://arxiv.org/abs/1910.09700
- Documentación de PEFT: https://huggingface.co/docs/peft
- Artículo original de LoRA (Hu et al., 2021): https://arxiv.org/abs/2106.09685
- Artículo original de DoRA (Liu et al., 2024): https://arxiv.org/abs/2402.09353
- Corpus XNLI (Conneau et al., 2018): https://arxiv.org/abs/1809.05053
- No se han encontrado en la búsqueda web enlaces relevantes adicionales sobre este modelo.
