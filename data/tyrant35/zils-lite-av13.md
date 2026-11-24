# tyrant35/zils-lite-av13

## Resumen

zils-lite-av13 es un modelo de decisión de tipo "soup-pool" construido por el usuario tyrant35 a partir del modelo base malkolm777/zils-lite-l22-correct-attn, etiquetado por el autor dentro de la familia "Zils" como un cuerpo `d3-lite`. No se trata de un modelo generativo de propósito general: su función declarada es resolver preguntas de decisión, es decir, clasificar o seleccionar una respuesta entre opciones dadas en escenarios de políticas, enrutamiento, selección de herramientas, extracción de datos y aritmética de fechas y precios. El modelo se distribuye con licencia Apache 2.0 y pesos en formato safetensors.

El modelo tiene 852.985.920 parámetros (aproximadamente 853 millones) y un tamaño de repositorio de 1,7 GB, lo que corresponde a pesos en precisión de 16 bits. Se ha obtenido promediando dos fine-tunes LoRA de rango 64 aplicados sobre las proyecciones de atención del modelo base, con una tasa de aprendizaje de 3e-5 y una sola pasada, y escalando después la diferencia promedio respecto al modelo base por un factor de 1,3. Es, por tanto, un ajuste fino derivado, no un entrenamiento desde cero.

La relevancia de este modelo es acotada y experimental: no hay pipeline declarado, no hay idiomas declarados, no hay resultados de benchmarks publicados y el repositorio no registra descargas ni interacciones. Resulta de interés únicamente para quienes investiguen técnicas de model souping, promediado de LoRA y ajuste fino orientado a tareas de decisión estructurada sobre modelos pequeños.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | no disponible (modelo base de tipo transformer, según la denominación "attention projections" en la model card) |
| Parámetros totales | 852.985.920 |
| Parámetros activos | no aplica (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo hereda la arquitectura del base malkolm777/zils-lite-l22-correct-attn, descrito por el autor como un cuerpo "soup-pool" de la familia Zils `d3-lite`. Sobre ese cuerpo se aplicaron dos fine-tunes LoRA de rango 64 sobre las proyecciones de atención, con tasa de aprendizaje 3e-5 y una sola pasada de entrenamiento. Posteriormente se promediaron los pesos de ambos adaptadores y la diferencia promedio respecto al cuerpo original se escaló por un factor de 1,3, una técnica de extrapolación de tareas que amplifica la dirección de ajuste aprendida. No se documenta el número total de tokens de entrenamiento ni la composición exacta del dataset en proporciones.

Los datos de entrenamiento declarados combinan preguntas de decisión de los splits de entrenamiento de datasets públicos incluidos en BigScience P3, datos públicos de entrenamiento de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, junto con aproximadamente 11.500 preguntas de decisión generadas programáticamente (políticas, enrutamiento, selección de herramientas, instrucciones inyectadas, aritmética de fechas y precios, y extracción) cuyas etiquetas se calculan por código. Los objetivos de entrenamiento mezclan la etiqueta gold con las probabilidades del propio modelo base: peso 0,9 para la etiqueta gold cuando la respuesta top del base era incorrecta y peso 0,32 cuando era correcta. El autor indica que no se usó ningún split de test de benchmarks y que se eliminaron las filas cuyo texto aparece en sus conjuntos de evaluación.

## Capacidades

- Resolución de preguntas de decisión con opciones discretas: selección de respuesta entre alternativas en lugar de generación libre de texto.
- Enrutamiento y clasificación: asignación de entradas a políticas, rutas o categorías predefinidas.
- Selección de herramientas: elección de la herramienta o acción adecuada ante una consulta, según los datos sintéticos de entrenamiento declarados.
- Extracción de información: tareas de extracción estructurada incluidas en el conjunto de datos generado programáticamente.
- Aritmética de fechas y precios: cálculos incluidos explícitamente en los datos de entrenamiento sintéticos.
- Manejo de instrucciones inyectadas: el dataset incluye ejemplos con instrucciones inyectadas, orientados a robustez frente a prompt injection.
- Razonamiento sobre NLI y consistencia factual: entrenado con datos de NLI4CT (verificación de afirmaciones clínicas) y HoVer (verificación multi-salto).
- Soporte de tool calling, agentes, modo thinking, visión o audio: no disponible; no se declara ninguna de estas capacidades en la información proporcionada.

## Casos de uso

- Clasificación de tickets de soporte: el modelo puede recibir un ticket y un conjunto cerrado de categorías o políticas y devolver la etiqueta más probable, gracias a su ajuste específico sobre preguntas de decisión con opciones discretas.
- Enrutamiento de consultas en un sistema multiagente: dado un mensaje de usuario y una lista de agentes o herramientas disponibles, el modelo selecciona el destino adecuado, capacidad reforzada por los ejemplos sintéticos de routing y tool selection del entrenamiento.
- Verificación de afirmaciones en documentación técnica o clínica: su exposición a NLI4CT y HoVer lo hace adecuado para tareas de entailment y comprobación de consistencia entre una afirmación y un contexto, aunque sin garantías de precisión fuera de dominio.
- Extracción de campos estructurados: a partir de un texto y un esquema de campos, el modelo puede decidir qué valor corresponde a cada campo, apoyándose en los ejemplos de extracción generados por código.
- Cálculo de plazos y precios en flujos administrativos: los datos sintéticos de aritmética de fechas y precios permiten usar el modelo para decidir vencimientos o importes en pipelines de validación, siempre con verificación posterior.
- Filtro de robustez frente a prompt injection: al haberse entrenado con instrucciones inyectadas, puede emplearse como clasificador auxiliar que detecte o descarte entradas manipuladas antes de pasarlas a un modelo mayor.
- Investigación en model souping: sirve como caso de estudio reproducible de promediado de LoRA de rango 64 y extrapolación de tareas con factor 1,3 sobre un modelo base pequeño.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor indica explícitamente que no se utilizó ningún split de test de benchmarks y que se eliminaron del entrenamiento las filas coincidentes con sus conjuntos de evaluación, pero no se aportan métricas de ningún tipo.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16: aproximadamente 1,7 GB solo para pesos, más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para contextos cortos.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB para pesos; en 4 bits, en torno a 0,5 GB. No se distribuyen versiones cuantizadas oficiales, por lo que habría que generarlas.
- GPU recomendadas: cualquier GPU consumer con al menos 4 GB de VRAM es suficiente en FP16 para contextos moderados; una RTX 3060, RTX 4060 o superior cubre el caso con holgura. Para despliegue por lotes, una A100 o H100 no aporta ventaja significativa dado el tamaño del modelo.
- Cabe en GPU consumer: sí, en la práctica totalidad de GPU dedicadas modernas, e incluso en iGPU con memoria unificada suficiente.
- Opciones de despliegue: al no haber pipeline declarado ni variantes GGUF, la integración requiere cargar los safetensors con transformers o con un runtime compatible; llama.cpp y Ollama exigirían conversión previa a GGUF, y vLLM o TGI requerirían verificar la compatibilidad de la arquitectura del modelo base.
- Latencia y throughput estimados: no disponibles. Por el tamaño (853 millones de parámetros), se espera una latencia de decodificación en el orden de milisegundos por token en GPU consumer, pero no hay mediciones publicadas.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-av13 | 852.985.920 | no disponible | Decisión / clasificación | Apache 2.0 | Hugging Face, 0 descargas |
| malkolm777/zils-lite-l22-correct-attn (base) | no disponible | no disponible | Decisión / clasificación | no disponible en la información | Hugging Face |
| Alternativas de la misma categoría | no disponible | no disponible | no disponible | no disponible | no disponible |

No se dispone de información sobre modelos comparables de la misma familia o categoría con la que establecer una comparación cuantitativa de rendimiento. La única referencia directa es el modelo base, del que este se deriva mediante promediado de LoRA y extrapolación con factor 1,3, sin que se publiquen métricas comparativas entre ambos.

## Limitaciones y advertencias

- Ausencia total de benchmarks: no hay evidencia publicada de que el ajuste mejore al modelo base en ninguna tarea; el factor de extrapolación 1,3 puede amplificar tanto la señal como los sesgos del ajuste.
- Modelo de decisión, no generativo: está diseñado para elegir entre opciones; usarlo como modelo de chat o de generación libre de texto probablemente produzca resultados pobres.
- Idiomas no declarados: se desconoce si el ajuste conserva capacidades multilingües del base o si está sesgado hacia el inglés de los datasets de entrenamiento (P3, iSarcasmEval, CLadder, NLI4CT, HoVer, Amazon ESCI).
- Riesgo de sobreajuste a los formatos de los datasets de entrenamiento: las preguntas sintéticas generadas por código pueden no reflejar la distribución de datos reales en producción.
- Riesgo de alucinación y de calibración deficiente: la mezcla de etiquetas gold con probabilidades del propio modelo base (pesos 0,9 y 0,32) puede producir una confianza mal calibrada en las respuestas.
- Sin pipeline declarado ni idiomas declarados en la ficha de Hugging Face: la integración requiere inspección manual de la arquitectura y del tokenizador del modelo base.
- Licencia Apache 2.0: permite uso comercial, pero conviene verificar que el modelo base malkolm777/zils-lite-l22-correct-attn tenga una licencia compatible, dato no disponible en la información proporcionada.
- Repositorio sin descargas ni interacciones: no hay validación comunitaria ni informes de uso en producción.
- Fecha de creación futura en los metadatos (2026-11-23): conviene tratar los metadatos con cautela.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tyrant35/zils-lite-av13
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
- BigScience P3: no disponible en la información proporcionada
- iSarcasmEval: no disponible en la información proporcionada
- VAST: no disponible en la información proporcionada
- CLadder: no disponible en la información proporcionada
- NLI4CT: no disponible en la información proporcionada
- Amazon ESCI: no disponible en la información proporcionada
- HoVer: no disponible en la información proporcionada
