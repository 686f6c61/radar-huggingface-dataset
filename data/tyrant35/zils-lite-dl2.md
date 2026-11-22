# tyrant35/zils-lite-dl2

## Resumen

zils-lite-dl2 es un modelo de decisión derivado por fusión de LoRA sobre el modelo base joamCriff123/zils-lite-l1121a, publicado por el usuario tyrant35 en Hugging Face. No se trata de un modelo generativo de propósito general, sino de un "decision-model" orientado a tareas de clasificación y elección entre opciones, según la etiqueta declarada por el autor. Cuenta con 852.985.920 parámetros en formato safetensors y un repositorio de 1,7 GB, lo que lo sitúa en la franja de los modelos de aproximadamente 850 millones de parámetros.

La técnica de construcción es un "soup-pool body": se parte del cuerpo del modelo base y se le suma la diferencia de dos fine-tunes LoRA de rango 32 entrenados de forma independiente, es decir, base + (A − base) + (B − base). El fine-tune A se entrenó sobre datos públicos de iSarcasmEval, VAST, CLadder, NLI4CT, Amazon ESCI y HoVer, mientras que el fine-tune B se entrenó sobre los conjuntos de entrenamiento de HellaSwag, WinoGrande, CLINC150 y BANKING77. Ambos usaron objetivos suaves que mezclan la etiqueta gold con las probabilidades del propio modelo base.

Su relevancia es acotada y experimental: se publica sin descargas ni interacciones, con una model card muy breve y sin resultados de benchmarks. Resulta de interés para quienes investigan técnicas de model merging y destilación de decisiones sobre modelos pequeños, pero no hay evidencia publicada de su rendimiento real frente a alternativas.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | transformer (no se detalla la variante concreta; derivado del modelo base zils-lite-l1121a) |
| Parametros totales | 852.985.920 |
| Parametros activos | no disponible (no se declara arquitectura MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | no disponible |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un transformer cuyo cuerpo proviene del modelo base joamCriff123/zils-lite-l1121a, etiquetado por el autor como "d3-lite soup body". Sobre ese cuerpo se aplicó una fusión aritmética de dos adaptadores LoRA de rango 32 entrenados por separado, ambos con tasa de aprendizaje 1e-4. La operación consiste en sumar al cuerpo base las deltas de cada adaptador: base + (A − base) + (B − base). No se especifica el número de tokens de entrenamiento ni la composición detallada de los datasets más allá de los nombres de los conjuntos utilizados.

El fine-tune A se entrenó sobre datos públicos de iSarcasmEval (detección de sarcasmo), VAST (análisis de sentimiento multimodal basado en texto), CLadder (razonamiento causal), NLI4CT (inferencia en lenguaje natural sobre ensayos clínicos), Amazon ESCI (relevancia de búsqueda en comercio electrónico) y HoVer (verificación de hechos multi-salto). Sus objetivos mezclan al 50 % la etiqueta gold y al 50 % las probabilidades del propio modelo base. El fine-tune B se entrenó sobre los splits de entrenamiento de HellaSwag, WinoGrande, CLINC150 y BANKING77, con objetivos suaves que combinan etiquetas gold con las probabilidades del modelo base original y del propio cuerpo fusionado. Ambos adaptadores aprendieron además las probabilidades de respuesta del modelo base sobre 6.000 prompts de decisión públicos, con el fin de preservar el comportamiento previo. El entrenamiento usó únicamente splits de entrenamiento, más los splits de desarrollo de VAST y NLI4CT; se eliminaron las filas cuyo texto aparecía en el conjunto de evaluación. No se menciona RLHF ni DPO.

## Capacidades

- Clasificación y toma de decisiones sobre opciones discretas, según la etiqueta "decision-model" declarada por el autor.
- Detección de sarcasmo (entrenado con iSarcasmEval).
- Análisis de sentimiento y clasificación de texto (entrenado con VAST).
- Razonamiento causal y respuesta a preguntas causales (entrenado con CLadder).
- Inferencia en lenguaje natural sobre textos clínicos (entrenado con NLI4CT).
- Evaluación de relevancia en búsqueda de comercio electrónico (entrenado con Amazon ESCI).
- Verificación de hechos multi-salto (entrenado con HoVer).
- Clasificación de intenciones en asistentes conversacionales (entrenado con CLINC150).
- Clasificación de intenciones en dominio bancario (entrenado con BANKING77).
- Razonamiento de sentido común y elección de continuación plausible (entrenado con HellaSwag y WinoGrande).
- Soporte de tool calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades multilingües: no disponible (no se declaran idiomas).
- Capacidades especiales (modo thinking, visión, audio): no disponible.

## Casos de uso

- Moderación de sarcasmo y tono en redes sociales: el modelo incorpora entrenamiento específico sobre iSarcasmEval, por lo que puede emplearse para puntuar comentarios y priorizar revisiones humanas en un pipeline de moderación.
- Análisis de sentimiento en reseñas de producto: gracias al entrenamiento con VAST, puede clasificar la polaridad de reseñas y alimentar paneles de satisfacción de cliente.
- Enrutado de intenciones en un chatbot de banca: el fine-tune B incluye BANKING77, lo que permite clasificar la intención de un mensaje entrante (consulta de saldo, bloqueo de tarjeta, etc.) antes de derivar a un flujo concreto.
- Clasificación de intenciones en asistentes virtuales genéricos: con CLINC150, puede asignar utterances a dominios e intenciones predefinidos en sistemas de atención al cliente.
- Verificación de afirmaciones en bases de conocimiento: el entrenamiento con HoVer permite usarlo como clasificador de apoyo para comprobar si una afirmación está respaldada por un conjunto de pasajes.
- Filtrado de relevancia en búsqueda de comercio electrónico: con Amazon ESCI, puede puntuar pares consulta-producto y reordenar resultados en un motor de búsqueda interno.
- Apoyo a la lectura de ensayos clínicos: con NLI4CT, puede clasificar relaciones de inferencia entre una hipótesis y secciones de un ensayo, útil en herramientas de revisión bibliográfica.
- Evaluación de razonamiento causal en pipelines de QA: con CLadder, puede servir como componente de scoring en sistemas que responden preguntas causales sobre un contexto dado.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 1,7 GB solo para pesos (852 millones de parámetros × 2 bytes), más overhead de activaciones y caché KV; en la práctica, entre 2 y 3 GB para secuencias cortas.
- VRAM estimada en cuantización de 8 bits: en torno a 0,9 GB para pesos, con un total práctico de 1,5 a 2 GB.
- VRAM estimada en cuantización de 4 bits: en torno a 0,5 GB para pesos, con un total práctico de 1 a 1,5 GB.
- GPU recomendadas para producción: A100, H100 o L40S si se necesita alto throughput; para desarrollo, cualquier GPU consumer con 4 GB o más de VRAM es suficiente.
- Cabe en GPU consumer: sí, en tarjetas como RTX 3060, RTX 4060, RTX 4090 o equivalentes con al menos 4 GB de VRAM en fp16.
- Opciones de despliegue: transformers con PyTorch, vLLM, TGI o llama.cpp/Ollama si se convierte a GGUF (no se distribuye GGUF en el repositorio).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| zils-lite-dl2 | 852.985.920 | no disponible | decision-model derivado por fusión LoRA | apache-2.0 | Hugging Face, 0 descargas |
| joamCriff123/zils-lite-l1121a (modelo base) | no disponible | no disponible | modelo base del que deriva | no disponible | Hugging Face |
| Modelos de clasificación tipo DeBERTa-v3-base | ~184 millones | 512 tokens | encoder para clasificación | MIT | ampliamente disponible |
| Modelos de clasificación tipo RoBERTa-large | ~355 millones | 512 tokens | encoder para clasificación | MIT | ampliamente disponible |

La comparación con alternativas consolidadas de clasificación es solo orientativa: no hay datos de rendimiento publicados para zils-lite-dl2 que permitan establecer una comparación cuantitativa con DeBERTa, RoBERTa u otros modelos de la misma franja.

## Limitaciones y advertencias

- No se han publicado resultados de benchmarks, por lo que no existe evidencia pública de su calidad en las tareas para las que fue entrenado.
- El modelo se distribuye con 0 descargas y 0 likes; no hay validación por parte de la comunidad.
- No se declaran idiomas soportados; el entrenamiento se realizó sobre datasets mayoritariamente en inglés, lo que hace improbable un buen rendimiento en castellano sin evaluación adicional.
- No se especifica la longitud de contexto, lo que impide planificar su uso en documentos largos sin pruebas empíricas.
- Al ser un modelo de decisión, no debe esperarse generación de texto libre de calidad; su uso previsto es la clasificación entre opciones.
- Riesgo de alucinación y de calibración deficiente: los objetivos de entrenamiento mezclan etiquetas gold con probabilidades del propio modelo, lo que puede producir probabilidades sobreconfiadas o mal calibradas.
- Sesgos conocidos: no disponible; los datasets de origen (iSarcasmEval, BANKING77, CLINC150, etc.) pueden introducir sesgos de dominio y de anotación que no han sido documentados por el autor.
- Restricciones de licencia: apache-2.0 permite uso comercial, pero conviene verificar la licencia del modelo base joamCriff123/zils-lite-l1121a, que no se detalla en la información disponible.
- El modelo base pertenece a un autor distinto del publicador de este derivado; la trazabilidad y el soporte son limitados.
- Para producción, se recomienda evaluar el modelo en el dominio concreto antes de desplegarlo, dado que no hay métricas publicadas ni tests de robustez.

## Enlaces

- Hugging Face: https://huggingface.co/tyrant35/zils-lite-dl2
- Modelo base: https://huggingface.co/joamCriff123/zils-lite-l1121a
- iSarcasmEval: no disponible
- VAST: no disponible
- CLadder: no disponible
- NLI4CT: no disponible
- Amazon ESCI: no disponible
- HoVer: no disponible
- HellaSwag: no disponible
- WinoGrande: no disponible
- CLINC150: no disponible
- BANKING77: no disponible
