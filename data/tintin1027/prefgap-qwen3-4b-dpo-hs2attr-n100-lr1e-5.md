# tintin1027/PrefGap-Qwen3-4B-DPO-HS2Attr-n100-lr1e-5

## Resumen

PrefGap-Qwen3-4B-DPO-HS2Attr-n100-lr1e-5 es un adaptador LoRA de investigación desarrollado por el usuario tintin1027, entrenado mediante DPO (Direct Preference Optimization) sobre el modelo base Qwen/Qwen3-4B. El objetivo es alinear las respuestas del modelo con preferencias humanas extraídas del dataset nvidia/HelpSteer2, concretamente a partir de 1.214 pares de preferencia generados en un experimento sobre atributos de calidad. Se trata de un artefacto de investigación, no de un modelo de producción, y su publicación en Hugging Face tiene fines experimentales.

El adaptador utiliza un enfoque PEFT (Parameter-Efficient Fine-Tuning) con LoRA de rango 16, aplicado a las proyecciones q/k/v/o y a las proyecciones gate/up/down del transformer. El entrenamiento se realizó en una sola época con BF16, tasa de aprendizaje 1e-5, decaimiento coseno y un 10% de warmup. Al ser un adaptador, no modifica la arquitectura del modelo base, sino que añade un pequeño conjunto de parámetros entrenables que se combinan con los pesos congelados de Qwen3-4B.

La relevancia de este modelo radica en su contribución al estudio de métodos de alineación basados en preferencias, particularmente en la variante PrefGap que explora diferencias entre atributos. Aunque no está pensado para uso directo en aplicaciones, sirve como referencia para investigadores que trabajan con DPO, LoRA y datasets de preferencias como HelpSteer2.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre Qwen3-4B (transformer decoder-only) |
| Parametros totales | No disponible (el adaptador añade parametros entrenables; el modelo base tiene 4B) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (depende del modelo base Qwen3-4B) |
| Tipos de cuantizacion | No disponible (entrenado en BF16, sin cuantizaciones publicadas) |
| Idiomas soportados | No disponible (heredados del modelo base, no especificados) |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El adaptador se construye sobre Qwen3-4B, un modelo transformer decoder-only de 4.000 millones de parametros. La capa LoRA se aplica con rango 16 y alpha 32, dropout 0.05, sobre las proyecciones de atencion (q, k, v, o) y las proyecciones de la MLP (gate, up, down). El entrenamiento utiliza DPO con beta 0.1, una sola epoca, batch efectivo de 8, y semilla 20260831. Los datos provienen de 1.214 pares de preferencia derivados del dataset nvidia/HelpSteer2, que contiene evaluaciones humanas de atributos como utilidad, correccion, coherencia, complejidad, verbosidad y seguridad. El experimento PrefGap se centra en explotar diferencias entre atributos para mejorar la alineacion.

No se mencionan innovaciones tecnicas adicionales mas alla del uso estandar de DPO con LoRA. El adaptador se entrena en BF16 y se distribuye como un artefacto PEFT que debe cargarse junto con el modelo base.

## Capacidades

- Generacion de texto: al ser un adaptador sobre Qwen3-4B, hereda la capacidad de generar texto coherente y contextual.
- Alineacion con preferencias: el entrenamiento DPO busca que las respuestas se ajusten a las preferencias humanas del dataset HelpSteer2, mejorando atributos como utilidad y seguridad.
- Conversacion: el modelo base es apto para tareas de chat y dialogo multi-turno, aunque el adaptador no introduce capacidades nuevas.
- Tool calling y funciones: no se especifica soporte adicional; depende del modelo base.
- Multilingue: no se indica, aunque Qwen3-4B soporta multiples idiomas, el adaptador no documenta este aspecto.

## Casos de uso

- Investigacion en alineacion de modelos: el adaptador sirve para estudiar el efecto de DPO con LoRA sobre un modelo de 4B, comparando metricas de preferencia antes y despues del ajuste.
- Experimentos con datasets de preferencias: util para validar metodologias PrefGap sobre HelpSteer2, analizando como distintos atributos influyen en la calidad de las respuestas.
- Prototipado rapido de chatbots alineados: aplicando el adaptador sobre Qwen3-4B se puede obtener un prototipo de asistente que priorice respuestas utiles y seguras, aunque sin garantias de produccion.
- Benchmarking de tecnicas PEFT: permite comparar el rendimiento de LoRA frente a otros metodos de ajuste fino en tareas de preferencia.
- Educacion y formacion: como ejemplo practico de entrenamiento DPO con TRL y PEFT, util para cursos o tutoriales sobre alineacion.
- Extension de modelos base: el adaptador puede combinarse con otros adaptadores LoRA para explorar composicion de habilidades, aunque no se ha probado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. No se proporcionan metricas como MMLU, HumanEval o GSM8K para este adaptador.

## Requisitos de hardware

- Al ser un adaptador LoRA, los requisitos de hardware son los del modelo base Qwen3-4B, mas un pequeno overhead para los parametros entrenables.
- No se especifican cifras de VRAM, GPU recomendadas ni opciones de despliegue en la informacion disponible.
- Para inferencia, se puede cargar el adaptador junto con Qwen3-4B usando librerias como PEFT, Transformers o vLLM, pero no se documentan configuraciones concretas.
- Dado el tamano del repositorio (0.1 GB), el adaptador es ligero y no anade una carga significativa.

## Comparativa con modelos similares

No disponible. No se proporcionan comparaciones con otros adaptadores DPO sobre Qwen3-4B ni con modelos alternativos en la informacion disponible.

## Limitaciones y advertencias

- Artefacto de investigacion: no esta validado para uso en produccion; puede contener sesgos o comportamientos no deseados.
- Sesgos heredados: el adaptador puede heredar sesgos del modelo base Qwen3-4B y de los datos de preferencia HelpSteer2, que reflejan juicios humanos potencialmente parciales.
- Riesgo de alucinacion: como cualquier modelo de lenguaje, puede generar informacion falsa o inventada, especialmente fuera de su dominio de entrenamiento.
- Licencia no especificada: no se indica la licencia del adaptador, lo que limita su uso comercial o redistribucion sin consultar al autor.
- Datos limitados: el entrenamiento con solo 1.214 pares de preferencia y una epoca puede no ser suficiente para una alineacion robusta.
- Dependencia del modelo base: el rendimiento final depende de Qwen3-4B; cualquier limitacion de este (contexto, idiomas, sesgos) se traslada al adaptador.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/tintin1027/PrefGap-Qwen3-4B-DPO-HS2Attr-n100-lr1e-5
- Modelo base Qwen3-4B: https://huggingface.co/Qwen/Qwen3-4B
- Dataset HelpSteer2: https://huggingface.co/datasets/nvidia/HelpSteer2
