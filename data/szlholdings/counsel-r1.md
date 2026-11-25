# SZLHOLDINGS/counsel-r1

## Resumen

counsel-r1 es un adaptador LoRA publicado por SZLHOLDINGS sobre el modelo base `unsloth/Qwen3.5-0.8B`. Se distribuye como repositorio PEFT (version 0.22.0) con pesos en safetensors y está etiquetado como un ajuste fino supervisado (SFT) para generación de texto conversacional. El nombre sugiere un uso orientado a asistencia o asesoramiento conversacional, aunque la model card no lo confirma explícitamente.

El modelo no aporta pesos completos: es un adaptador que debe cargarse junto al checkpoint base. El tamaño del repositorio aparece como 0.0 GB, lo que es coherente con un adaptador LoRA de rango bajo sobre un modelo de 0,8 mil millones de parámetros, pero impide verificar el número exacto de parámetros entrenados. La información publicada es mínima: la model card es la plantilla por defecto de Hugging Face sin secciones rellenadas.

Su relevancia es limitada y experimental. Se trata de un ajuste reciente (creado el 25 de noviembre de 2026) sin descargas ni likes, sin licencia declarada y sin datos de entrenamiento ni evaluación. Resulta útil únicamente como ejemplo de flujo de trabajo Unsloth + TRL + PEFT sobre un modelo pequeño, no como componente listo para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA (PEFT) sobre transformer decoder-only (base: Qwen3.5-0.8B) |
| Parametros totales | No disponible (adaptador LoRA; el base tiene 0,8B según su denominación) |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible (heredada del base, no declarada) |
| Tipos de cuantizacion | No disponible (el adaptador se publica en safetensors; la cuantización dependería del base) |
| Idiomas soportados | No disponible |
| Licencia | No disponible |
| Formato de pesos | safetensors (adaptador PEFT) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA de bajo rango entrenado con SFT mediante la pila Unsloth + TRL + Transformers, según las etiquetas del repositorio. No se especifica el rango, el alpha, los módulos objetivo ni la tasa de aprendizaje. El modelo base es `unsloth/Qwen3.5-0.8B`, un transformer decoder-only de aproximadamente 0,8 mil millones de parámetros; la model card no documenta su arquitectura interna, su ventana de contexto ni su tokenizador.

No hay información sobre el volumen de tokens de entrenamiento, la composición del dataset, el uso de RLHF/DPO ni ninguna innovación técnica (decodificación especulativa, atención lineal, etc.). La única referencia técnica de la model card es la cita genérica al calculador de impacto medioambiental de Lacoste et al. (2019), que no aporta datos del entrenamiento. Tampoco se indican hiperparámetros, hardware ni duración del ajuste.

## Capacidades

- Generación de texto conversacional: el pipeline declarado es `text-generation` y la etiqueta `conversational` indica un ajuste orientado a diálogo multi-turno.
- Ajuste fino supervisado (SFT): el adaptador modifica el comportamiento del base mediante ejemplos supervisados, presumiblemente en formato de instrucciones o chat.
- Herencia de capacidades del base: al ser un adaptador, conserva las capacidades del Qwen3.5-0.8B subyacente, pero estas no están documentadas en la ficha.
- Tool calling / function calling: no disponible en la información proporcionada.
- Razonamiento multi-paso y uso como agente: no disponible en la información proporcionada.
- Capacidades multilingües: no disponible en la información proporcionada.
- Capacidades especiales (thinking mode, visión, audio): no disponible en la información proporcionada.

## Casos de uso

- Prototipado de asistentes conversacionales especializados: el adaptador puede cargarse sobre el base con PEFT y probarse en diálogos de asesoramiento o soporte, aprovechando el bajo coste de un modelo de 0,8B para iterar rápidamente en local.
- Experimentación con flujos Unsloth + TRL: sirve como referencia práctica de cómo empaquetar un adaptador LoRA entrenado con SFT y publicarlo en Hugging Face con las etiquetas correctas.
- Evaluación de ajuste fino sobre modelos pequeños: útil para comparar el efecto del SFT en un base de 0,8B frente a versiones sin ajustar, en tareas de estilo o formato de respuesta.
- Despliegue en entornos con recursos muy limitados: al requerir solo el adaptador más el base cuantizado, puede ejecutarse en CPU o en GPUs de gama baja para demos internas.
- Generación de respuestas en dominios acotados: si el SFT se realizó sobre un corpus concreto (no documentado), podría adaptarse a respuestas con un registro o formato específico.
- Base para posteriores ajustes: el adaptador puede servir como punto de partida para un segundo entrenamiento (por ejemplo, DPO) sobre el mismo base, aunque sin datos de calidad verificada.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma oficial. Como referencia orientativa, un modelo base de 0,8B en fp16 ocupa aproximadamente 1,6 GB de pesos; en cuantización de 4 bits, en torno a 0,5 GB. El adaptador LoRA añade una sobrecarga mínima (decenas de MB), aunque su tamaño exacto no se declara.
- GPU recomendadas: no disponible. Por tamaño del base, cualquier GPU con al menos 4-8 GB de VRAM sería suficiente en fp16; una RTX 3060, RTX 4060 o superior permitiría inferencia cómoda.
- ¿Cabe en GPU de consumo? Sí, previsiblemente en cualquier GPU de consumo moderna (8 GB o más) e incluso en CPU para inferencia lenta, dado el tamaño del base.
- Opciones de despliegue: PEFT + Transformers (carga del adaptador sobre el base), vLLM (con soporte de adaptadores LoRA), llama.cpp/Ollama si se fusiona el adaptador con el base y se convierte a GGUF, y TGI con adaptadores.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Notas |
|---|---|---|---|---|---|
| SZLHOLDINGS/counsel-r1 | Adaptador LoRA sobre base 0,8B | No disponible | No disponible | safetensors (PEFT) | Sin benchmarks ni datos de entrenamiento |
| Qwen3.5-0.8B (base) | ~0,8B | No disponible | No disponible | safetensors | Modelo base del adaptador; capacidades no documentadas aquí |
| Adaptadores LoRA comunitarios sobre modelos <1B | Variable | Variable | Variable | safetensors (PEFT) | Ecosistema amplio; calidad muy heterogénea y difícil de comparar sin evaluación |

No se dispone de datos de rendimiento del modelo ni de alternativas directamente comparables con información verificable en la documentación proporcionada.

## Limitaciones y advertencias

- Model card sin rellenar: no hay información sobre datos de entrenamiento, sesgos, evaluación ni uso previsto, lo que impide valorar su calidad.
- Sin licencia declarada: no se puede asumir uso comercial; la ausencia de licencia es un riesgo legal para producción.
- Sin benchmarks ni métricas: no hay evidencia de que el ajuste mejore al base en ninguna tarea.
- Riesgo de alucinación: inherente a los modelos generativos pequeños; no hay evaluación que lo cuantifique.
- Idiomas no declarados: no se puede garantizar un buen rendimiento en castellano ni en otros idiomas.
- Contexto no declarado: la ventana efectiva depende del base y no está documentada.
- Repositorio sin descargas ni validación comunitaria: no hay señales de uso real ni de revisión por terceros.
- Dependencia del base: cualquier cambio o retirada de `unsloth/Qwen3.5-0.8B` rompería la reproducibilidad.
- Fecha de creación futura (2026): conviene verificar la autenticidad y vigencia del repositorio antes de integrarlo.

## Enlaces

- Hugging Face: https://huggingface.co/SZLHOLDINGS/counsel-r1
- Modelo base: https://huggingface.co/unsloth/Qwen3.5-0.8B
- PEFT: https://github.com/huggingface/peft
- TRL: https://github.com/huggingface/trl
- Unsloth: https://github.com/unslothai/unsloth
- Calculador de impacto medioambiental (Lacoste et al., 2019): https://mlco2.github.io/impact
- Paper citado en la model card: https://arxiv.org/abs/1910.09700
