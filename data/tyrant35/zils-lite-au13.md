# tyrant35/zils-lite-au13

## Resumen

zils-lite-au13 es un ajuste fino (fine-tune) del modelo base malkolm777/zils-lite-l22-correct-attn, un "soup body" de la familia Zils d3-lite orientado a tareas de decisión. El autor, tyrant35, lo publica bajo licencia Apache 2.0 con pesos en formato safetensors y un total de 852.985.920 parámetros (aproximadamente 853 millones). El modelo se presenta como un "decision-model": está especializado en responder preguntas de decisión con etiquetas discretas (políticas, enrutamiento, selección de herramientas, extracción de datos y aritmética de fechas y precios) más que en generación de texto abierta.

La construcción del modelo es un ejemplo de "model soup" con escalado de delta: se tomaron dos fine-tunes LoRA de rango 64 sobre las proyecciones de atención del soup base, entrenados con tasa de aprendizaje 3e-5 y una sola pasada, y se promediaron sus pesos; el cambio promedio respecto al soup original se escaló por un factor de 1,3. Los datos de entrenamiento combinan preguntas de decisión de los splits de train de varios datasets públicos (P3 de BigScience, iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer) con unas 3.600 preguntas generadas programáticamente cuyas etiquetas se calculan en código.

La relevancia de este modelo es acotada pero concreta: no compite en capacidades generales de razonamiento o generación, sino que ofrece un artefacto pequeño (853 M de parámetros, repo de 1,7 GB) para experimentación con modelos de decisión ligeros y con técnicas de merging de pesos. No hay información publicada sobre benchmarks, idiomas soportados ni pipeline de uso, lo que limita su evaluación objetiva.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer (soup body de la familia Zils d3-lite; detalles no disponibles) |
| Parámetros totales | 852.985.920 (~853 M) |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors |
| Modelo base | malkolm777/zils-lite-l22-correct-attn |
| Tamaño del repo | 1,7 GB |
| Pipeline | no disponible |

## Arquitectura y entrenamiento

El modelo parte de un "soup body" d3-lite (malkolm777/zils-lite-l22-correct-attn) cuya arquitectura interna no se detalla en la información disponible. Sobre ese cuerpo se aplicaron dos fine-tunes LoRA de rango 64 sobre las proyecciones de atención, con tasa de aprendizaje 3e-5 y una única pasada de entrenamiento. Posteriormente se promediaron los pesos de ambos adaptadores y el cambio medio respecto al soup original se escaló por 1,3, una técnica de merging que amplifica la dirección del ajuste para reforzar el comportamiento aprendido sin reentrenar el modelo completo.

Los datos de entrenamiento provienen de los splits de train de datasets públicos incluidos en BigScience P3 (preguntas de decisión), iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, complementados con aproximadamente 3.600 preguntas de decisión generadas programáticamente (políticas, enrutamiento, selección de herramientas, instrucciones inyectadas, aritmética de fechas y precios, y extracción) cuyas etiquetas se calculan en código. Los objetivos de entrenamiento mezclan la etiqueta gold con las probabilidades del propio soup: peso 0,9 para la etiqueta gold cuando la respuesta top del soup era incorrecta, y 0,32 cuando era correcta. No se usó ningún split de test de benchmarks y se eliminaron las filas cuyo texto aparecía en los conjuntos de evaluación del autor. No se menciona RLHF ni DPO.

## Capacidades

- Respuesta a preguntas de decisión con etiqueta discreta (clasificación de políticas, enrutamiento, selección de herramientas).
- Extracción de información y aritmética de fechas y precios, según la composición del dataset de entrenamiento.
- Manejo de instrucciones inyectadas en el texto de entrada, según los datos generados programáticamente.
- Capacidad de generación de texto abierta: no documentada; el modelo se presenta como decision-model, no como modelo generativo general.
- Tool calling / function calling: no documentado de forma explícita, aunque la selección de herramientas figura entre los tipos de pregunta de entrenamiento.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponibles (idiomas no declarados).
- Capacidades especiales (thinking mode, visión, audio): no disponibles.

## Casos de uso

- Clasificación de políticas internas: el modelo puede recibir una consulta y devolver la etiqueta de política aplicable, aprovechando el entrenamiento sobre preguntas de decisión de P3 y datos generados de políticas.
- Enrutamiento de peticiones: dado un texto de entrada, asignar la ruta o categoría correspondiente; el dataset de entrenamiento incluye explícitamente preguntas de routing.
- Selección de herramientas en pipelines: usar el modelo como clasificador previo que decida qué herramienta o función invocar antes de llamar a un LLM mayor, reduciendo coste en flujos con muchas consultas.
- Extracción estructurada de datos: extraer campos concretos de documentos o mensajes, apoyándose en el entrenamiento sobre tareas de extraction y sobre HoVer y Amazon ESCI.
- Verificación de afirmaciones y consistencia: emplear el ajuste sobre NLI4CT y HoVer para tareas de comprobación de hechos y entailment en dominios acotados.
- Detección de sarcasmo y análisis de sentimiento fino: el entrenamiento sobre iSarcasmEval y VAST permite usar el modelo como clasificador en moderación de contenido o análisis de opinión.
- Aritmética de fechas y precios en asistentes de back-office: el modelo fue entrenado con preguntas de aritmética de fechas y precios, útil para validaciones rápidas en formularios o flujos de facturación.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. La model card indica explícitamente que no se usó ningún split de test de benchmarks y que se eliminaron las filas de entrenamiento cuyo texto aparecía en los conjuntos de evaluación del autor, pero no se aportan métricas.

## Requisitos de hardware

- VRAM estimada para inferencia: con 853 M de parámetros, en fp16 serían aproximadamente 1,7 GB de pesos; en fp32, unos 3,4 GB. La VRAM total dependerá de la longitud de contexto y del backend, pero no se dispone de cifras oficiales.
- GPU recomendadas: cualquier GPU con al menos 4-6 GB de VRAM debería poder cargar los pesos en fp16; no hay datos de rendimiento publicados.
- Cabe en GPU de consumo: sí, previsiblemente en tarjetas como RTX 3060, RTX 4060 o superiores, aunque no está verificado por el autor.
- Opciones de despliegue: al ser safetensors, puede cargarse con transformers; para GGUF/llama.cpp u Ollama no se indica conversión disponible. vLLM y TGI no están documentados para este modelo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

No disponible. La información proporcionada no incluye modelos comparables de la misma categoría (decision-models de ~850 M) ni datos de rendimiento que permitan una comparación objetiva.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; los datasets de origen (iSarcasmEval, VAST, ESCI, entre otros) pueden introducir sesgos de dominio y de anotación.
- Riesgo de alucinación: el modelo está orientado a clasificación de decisiones; usarlo para generación abierta puede producir salidas no fiables, ya que no se documenta esa capacidad.
- Limitaciones de contexto e idioma: la longitud de contexto y los idiomas soportados no están declarados, lo que impide garantizar su comportamiento fuera del inglés o en entradas largas.
- Restricciones de licencia: Apache 2.0 permite uso comercial, pero el modelo base y los datasets de entrenamiento pueden tener sus propias condiciones que conviene revisar.
- Caveats para producción: sin benchmarks publicados, sin pipeline declarado y con cero descargas, el modelo no ha sido validado externamente; además, el escalado del delta por 1,3 es una decisión de merging no contrastada empíricamente en la información disponible.
- Fecha de creación futura (2026-11-23) en los metadatos, lo que sugiere que el repositorio puede ser reciente o generado de forma automatizada.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-lite-au13
- Modelo base: https://huggingface.co/malkolm777/zils-lite-l22-correct-attn
- BigScience P3: https://huggingface.co/datasets/bigscience/P3
- iSarcasmEval: https://github.com/iabufarha/iSarcasmEval
- VAST: https://huggingface.co/datasets/HSLU-ML/VAST
- CLadder: https://huggingface.co/datasets/cladder/cladder
- NLI4CT: https://huggingface.co/datasets/HealthVer
- Amazon ESCI: https://github.com/amazon-science/esci-data
- HoVer: https://huggingface.co/datasets/hover
