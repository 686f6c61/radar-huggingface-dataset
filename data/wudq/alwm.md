# wudq/ALWM

## Resumen

ALWM (Accessible Latent World Modeling) es un checkpoint ajustado a partir de Qwen3-VL-8B-Instruct, desarrollado por el usuario wudq, orientado al razonamiento predictivo sobre video. El modelo recibe un prefijo de video observado y una pregunta, y razona sobre lo que probablemente ocurrirá a continuación sin que el futuro no observado forme parte de la entrada. La innovación principal es el uso de un intervalo latente continuo: en lugar de predecir directamente texto, el decodificador alterna generación textual con ocho estados ocultos continuos (z1 a z8) que representan un posible estado futuro del mundo.

Arquitectura Qwen3-VL de 8B parámetros con encoder visual y modelo de lenguaje, heredada del modelo base. El checkpoint se publica como paquete completo en Safetensors (encoder visual, LM y cabeza de salida), no como adaptador. En el momento de la consulta, el repositorio solo contiene el README de vista previa: los pesos aún no se han subido, por lo que no es ejecutable todavía.

Su relevancia radica en explorar el razonamiento mediado por latentes continuos para predicción de eventos futuros en video, una tarea distinta de la generación de fotogramas futuros. La licencia no está declarada y el único idioma indicado es el inglés.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal Qwen3-VL (encoder visual + modelo de lenguaje) con decodificación de intervalo latente continuo |
| Parametros totales | 8B (heredados del modelo base Qwen3-VL-8B-Instruct) |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en |
| Licencia | no disponible |
| Formato de pesos | Safetensors (model-*.safetensors con índice de shards) |

## Arquitectura y entrenamiento

ALWM parte de Qwen3-VL-8B-Instruct y conserva su arquitectura: encoder visual más modelo de lenguaje transformer con capacidad image-text-to-text. El paquete incluye los pesos completos del encoder visual, el LM y la cabeza de salida del modelo de lenguaje, en formato Safetensors con mapeo tensor-a-shard mediante `model.safetensors.index.json`. El checkpoint incorpora ficheros de configuración específicos (`alwm_config.json`) que definen el contrato de inferencia con latentes continuos.

La innovación técnica es el bucle de decodificación con intervalo latente: tras la observación y el razonamiento textual, el modelo emite una etiqueta `<latent>`, genera ocho estados ocultos continuos realimentando cada estado como embedding de entrada al decodificador (manteniendo el contexto causal), y tras `</latent>` reanuda la generación de texto para producir la predicción de evento futuro y la respuesta. Los vectores latentes no son tokens de vocabulario ni imágenes, y su cómputo no se refleja en texto imprimible. No se dispone de información sobre volumen de tokens de entrenamiento, composición del dataset ni uso de RLHF/DPO.

## Capacidades

- Predicción de eventos futuros: describe una acción, interacción o cambio de escena plausible a partir de un prefijo de video observado.
- Preguntas y respuestas predictivas sobre video: responde sobre una continuación no observada, incluyendo preguntas con opciones múltiples.
- Razonamiento mediado por latentes: emplea una representación continua predicha como estado intermedio antes de la salida textual final.
- Comprensión de video e imagen: hereda las capacidades multimodales del modelo base Qwen3-VL-8B-Instruct.
- Salida estructurada: produce secciones etiquetadas (`<observation>`, `<reasoning>`, `<latent>`, `<prediction>`, `<answer>`).
- No genera fotogramas de video futuro: predice en espacio latente y devuelve texto.
- Tool calling, agentes y capacidades multilingües: no documentadas específicamente para este checkpoint.

## Casos de uso

- Predicción de eventos en video de vigilancia: dado un clip parcial, estimar la siguiente acción o cambio de escena para priorizar alertas, usando el prefijo observado y el razonamiento latente.
- Preguntas de opción múltiple sobre continuaciones de video: en evaluación de modelos de razonamiento predictivo, responder cuestionarios sobre lo que ocurrirá después sin acceso al futuro.
- Análisis de vídeo deportivo: anticipar la siguiente jugada o interacción a partir de los segundos previos observados.
- Robótica y planificación anticipatoria: usar la representación latente del estado futuro como señal intermedia para decidir la siguiente acción del agente.
- Investigación en world models: estudiar si el razonamiento mediado por latentes continuos mejora la predicción frente a la generación textual directa.
- Anotación asistida de datasets de video: generar descripciones de continuación plausible para etiquetado o aumento de datos.
- Evaluación de seguridad en escenas: detectar continuaciones de riesgo (p. ej., objetos cayendo) a partir del contexto observado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card incluye únicamente un ejemplo ilustrativo (una pelota rodando hacia el borde de una mesa), que el propio autor declara explícitamente que no es una muestra de benchmark ni una respuesta medida del modelo.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible de forma específica; como referencia, un modelo de 8B en precisión completa ronda los 16 GB de pesos, y en cuantizaciones de 8 y 4 bits aproximadamente 8 y 4-5 GB respectivamente (estimación genérica por tamaño, no publicada por el autor).
- GPU recomendadas: no disponible. Por tamaño, cabría esperar funcionamiento en A100, H100 o RTX 4090, pero el autor no lo documenta.
- Compatibilidad con GPU de consumo: probable por el tamaño de 8B, pero no confirmada.
- Opciones de despliegue: no disponible. El autor advierte que una llamada `generate()` genérica de Transformers no implementa el cómputo latente continuo; se requiere un bucle de decodificación compatible con ALWM que realice la realimentación de estados ocultos.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| ALWM | 8B | no disponible | Predicción de eventos futuros en video con latentes continuos | no disponible | Solo README; pesos no subidos |
| Qwen3-VL-8B-Instruct | 8B | no disponible | Comprensión multimodal image-text-to-text | no disponible | Pesos publicados en Hugging Face |
| Otros world models de video | no disponible | no disponible | Predicción/generación de video futuro | no disponible | no disponible |

La comparación directa con alternativas de predicción de video futuro no está disponible en la información proporcionada. El referente inmediato es su modelo base, que no incorpora el mecanismo de latentes continuos ni la tarea específica de predicción de continuación.

## Limitaciones y advertencias

- Pesos no publicados: en el momento de la consulta el repositorio solo contiene el README de vista previa; el checkpoint no es ejecutable.
- Requiere runtime específico: sin un bucle de decodificación compatible con ALWM, el modelo no realiza el cómputo latente y su comportamiento no es el previsto.
- Licencia no declarada: no se puede confirmar el uso comercial; conviene contactar con el autor antes de cualquier despliegue en producción.
- Solo inglés documentado: no hay soporte multilingüe declarado.
- Riesgo de alucinación: al predecir eventos no observados, las continuaciones son plausibles pero no verificables contra la realidad.
- Los latentes no son interpretables: el término "accessible" se refiere al uso de la representación para la salida lingüística, no a que cada dimensión latente tenga significado legible.
- No genera video: no debe esperarse salida visual del futuro.
- Sin benchmarks publicados: no hay evidencia cuantitativa de rendimiento frente a alternativas.
- Contexto máximo no documentado: limita la planificación de cargas con videos largos.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wudq/ALWM
- Modelo base: https://huggingface.co/Qwen/Qwen3-VL-8B-Instruct
