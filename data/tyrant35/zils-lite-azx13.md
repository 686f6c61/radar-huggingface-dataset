# tyrant35/zils-lite-azx13

## Resumen

zils-lite-azx13 es un modelo de decisión de tipo "soup-pool" construido sobre el body d3-lite del modelo malkolm777/zils-lite-l22-correct-attn. Lo desarrolla el usuario tyrant35 y se distribuye bajo licencia Apache 2.0. El modelo no es un LLM generativo al uso, sino un clasificador/selector de respuestas entrenado específicamente para tareas de decisión: elegir entre opciones, enrutar peticiones, seleccionar herramientas, seguir instrucciones inyectadas o resolver aritmética de fechas y precios.

Técnicamente se trata de un fine-tune por promedio de pesos: tres LoRA de rango 64 sobre las proyecciones de atención del soup base, entrenadas con learning rate 3e-5 en una sola pasada, promediadas y escaladas por un factor de 1,3 respecto al cambio medio. El resultado es un checkpoint de 852.985.920 parámetros (aproximadamente 853 millones) en formato safetensors, con un repositorio de 1,7 GB.

Su relevancia es limitada pero concreta: cubre la franja de modelos pequeños especializados en decisión estructurada, entrenados con datos sintéticos generados por código y etiquetas mixtas (gold + probabilidades del propio soup). No hay información publicada sobre benchmarks, idiomas o pipeline, por lo que su evaluación práctica queda en manos del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (derivada de zils-lite d3-lite; presumiblemente transformer con proyecciones de atención modificadas) |
| Parametros totales | 852.985.920 |
| Parametros activos | no aplica (no es MoE segun la informacion disponible) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos en safetensors; cuantizacion posterior a cargo del usuario) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo parte del body d3-lite del soup malkolm777/zils-lite-l22-correct-attn. Sobre las proyecciones de atención de ese soup se entrenaron tres LoRA de rango 64 con learning rate 3e-5 y una sola pasada. Los tres adaptadores se promediaron por media ponderada de pesos y el cambio medio respecto al soup original se escaló por 1,3. No se documenta ninguna modificación estructural más allá de esta mezcla de adaptadores, ni se especifica el número de capas, dimensión oculta o mecanismo de atención exacto.

Los datos de entrenamiento combinan preguntas de decisión de los splits de train de datasets públicos incluidos en BigScience P3, datos públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, más aproximadamente 18.500 preguntas de decisión generadas programáticamente (políticas, enrutamiento, selección de herramientas, instrucciones inyectadas, aritmética de fechas y precios, extracción, rima y métrica, teoría musical, color, tablas de probabilidad y puzles de restricciones) cuyas etiquetas se calculan en código. Los targets mezclan la etiqueta gold con las probabilidades del propio soup: peso 0,9 para gold cuando la respuesta top del soup era incorrecta y 0,32 cuando era correcta. No se usó ningún split de test de benchmarks y se eliminaron filas cuyo texto aparecía en los conjuntos de evaluación del autor.

## Capacidades

- Clasificación y selección de respuestas en preguntas de decisión con opciones múltiples.
- Enrutamiento de peticiones y selección de herramientas (tool selection) a partir de una descripción de tarea.
- Seguimiento de instrucciones inyectadas y detección de conflictos entre instrucciones.
- Aritmética de fechas y precios, extracción de campos estructurados.
- Razonamiento sobre rima y métrica, teoría musical, color y tablas de probabilidad.
- Resolución de puzles de restricciones simples.
- Capacidad multilingüe: no disponible (no se documenta).
- Modo thinking, visión o audio: no disponible.
- Soporte de tool calling generativo y agentes multi-step: no disponible como capacidad generativa; el modelo está orientado a la decisión, no a la generación libre.

## Casos de uso

- Enrutamiento de consultas en un sistema RAG: dado un conjunto de fuentes o índices disponibles, el modelo selecciona la ruta adecuada a partir del texto de la consulta, aprovechando su entrenamiento específico en routing y tool selection.
- Selección de herramientas en un agente: el modelo puntúa qué herramienta del catálogo corresponde a una petición del usuario, lo que permite construir un router previo a un LLM generativo más grande.
- Moderación de instrucciones inyectadas: detecta si un texto contiene una instrucción que contradice la política del sistema, gracias a los datos sintéticos de injected instructions incluidos en el entrenamiento.
- Extracción estructurada de campos: clasifica si un fragmento contiene fecha, precio o entidad y qué valor corresponde, útil en pipelines de normalización de documentos.
- Validación de respuestas en QA: dado un par pregunta/respuesta candidata, el modelo decide si la respuesta es correcta, lo que permite filtrar salidas de modelos generativos antes de mostrarlas.
- Puzles de restricciones y planificación acotada: resuelve problemas de asignación simples generados por código, adecuado para entornos de evaluación o como componente de un solver híbrido.
- Aritmética de fechas y precios en formularios: clasifica y valida cálculos de plazos o importes antes de persistirlos en un backend.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB de pesos más overhead de activaciones; en la práctica 2-3 GB según longitud de secuencia.
- VRAM estimada en int8: alrededor de 0,9 GB de pesos; en int4: alrededor de 0,5 GB.
- GPU recomendadas: cualquier GPU consumer con 4 GB o más (RTX 3050, RTX 4060, RTX 4090) es suficiente; A100/H100 no son necesarias para este tamaño.
- Cabe en GPU consumer: sí, en todas las GPU modernas con 4 GB o más de VRAM, e incluso en CPU con llama.cpp u Ollama si se convierte a GGUF.
- Opciones de despliegue: transformers (PyTorch), vLLM y TGI para servir en GPU, llama.cpp/Ollama para CPU o GPU de baja VRAM. No se documenta compatibilidad explícita con ninguno de ellos; el formato safetensors es compatible con transformers.
- Latencia y throughput: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Notas |
|---|---|---|---|---|---|
| zils-lite-azx13 | 852.985.920 | no disponible | Apache 2.0 | Hugging Face | Fine-tune de decisión sobre soup d3-lite |
| malkolm777/zils-lite-l22-correct-attn | no disponible | no disponible | no disponible | Hugging Face | Modelo base del que deriva |
| Modelos de decisión pequeños tipo DeBERTa/RoBERTa fine-tuned | 100-400 M | 512 | MIT/Apache | Hugging Face | no disponible comparativa directa de rendimiento |

No se dispone de datos de benchmarks que permitan una comparación cuantitativa con alternativas.

## Limitaciones y advertencias

- No se han publicado evaluaciones en splits de test de benchmarks; el rendimiento real en producción es desconocido.
- El entrenamiento usa etiquetas mixtas (gold + probabilidades del soup), lo que puede introducir sesgos hacia las respuestas que el soup base ya acertaba.
- Riesgo de alucinación en tareas fuera del dominio de decisión: el modelo no está entrenado para generación libre de texto.
- Idiomas soportados no documentados; no se garantiza cobertura multilingüe.
- Longitud de contexto no documentada; no se recomienda su uso en ventanas largas sin verificación empírica.
- Licencia Apache 2.0 permite uso comercial, pero el modelo base malkolm777/zils-lite-l22-correct-attn tiene licencia no disponible, lo que puede condicionar la redistribución.
- Cero descargas y cero likes en Hugging Face: no hay validación comunitaria del checkpoint.
- El autor eliminó filas de entrenamiento que aparecían en sus conjuntos de evaluación, pero no publica dichos conjuntos, por lo que la limpieza no es auditable externamente.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-lite-azx13
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
- BigScience P3: no disponible enlace directo en la informacion proporcionada
- iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI, HoVer: no se proporcionan enlaces en la informacion disponible
