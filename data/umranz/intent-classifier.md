# Umranz/intent-classifier

## Resumen

`Umranz/intent-classifier` es un clasificador binario de intenciones diseñado para enrutar peticiones dentro de sistemas conversacionales multimodales. Su función concreta es decidir si la entrada del usuario solicita la generación de una imagen (`IMAGE_GENERATION`) o si, por el contrario, se trata de una interacción textual estándar (`TEXT_CHAT`), incluyendo conversación casual, consultas técnicas o el caso en que el usuario comparte su propio material fotográfico. Lo desarrolla el usuario Umranz y se publica bajo licencia MIT.

El modelo parte de `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2`, un transformer de tipo BERT con 117.654.530 parámetros totales, al que se añade una cabeza de clasificación lineal. No es un modelo generativo: es un clasificador de secuencias pensado para ejecutarse en CPU con latencia muy baja mediante ONNX Runtime (opset 18), lo que lo hace apto para entornos compartidos tipo ZeroGPU o backends sin GPU dedicada.

Su relevancia actual radica en el nicho: los sistemas que combinan chat de texto con generación de imágenes bajo demanda necesitan un router determinista y barato que evite disparos falsos (por ejemplo, cuando el usuario dice "hoy hice una foto al atardecer" o "no me envíes fotos"). El modelo incorpora un endurecimiento con negativos duros contrastivos orientado precisamente a mitigar ese tipo de falsos positivos, con soporte nativo de inglés y hindi romanizado (hinglish).

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT) con cabeza de clasificación lineal, basado en `sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2` |
| Parámetros totales | 117.654.530 |
| Parámetros activos | No aplica (no es MoE) |
| Longitud de contexto | No disponible de forma explícita; los ejemplos de inferencia truncan a `max_length=128` |
| Tipos de cuantización | No disponible (se distribuyen pesos ONNX y safetensors; no se detallan variantes cuantizadas) |
| Idiomas soportados | Inglés (`en`) e hindi romanizado / hinglish (`hi`) |
| Licencia | MIT |
| Formato de pesos | safetensors y ONNX (`model.onnx`, opset 18) |

## Arquitectura y entrenamiento

La arquitectura es un transformer encoder de tipo BERT (MiniLM-L12, 12 capas) preentrenado como modelo de embeddings multilingüe y reutilizado aquí como extractor de representaciones para una tarea de clasificación de secuencias de dos clases. Sobre la representación pooled se aplica una cabeza lineal que produce logits para `TEXT_CHAT` (clase 0) e `IMAGE_GENERATION` (clase 1). El modelo exporta además una versión ONNX con opset 18 optimizada para inferencia en CPU.

El entrenamiento se orienta a la robustez frente a negativos difíciles: la model card menciona un endurecimiento con negativos duros contrastivos para mitigar trampas como usuarios que comparten sus propias fotos, preguntas técnicas sobre fotografía (cámara, lente, exposición), cumplidos y negaciones compuestas. No se especifica en la información disponible el número de tokens de entrenamiento, la composición exacta del dataset ni si se aplicaron técnicas de RLHF o DPO; al tratarse de un clasificador, lo habitual sería ajuste supervisado con etiquetas, pero ese detalle no se confirma.

## Capacidades

- Clasificación binaria de intención conversacional: distingue entre petición de generación de imagen y chat de texto.
- Enrutamiento determinista en sistemas multimodales: pensado como router previo a un generador de imágenes o a un modelo de diálogo.
- Soporte de inglés y hinglish (hindi romanizado), incluyendo dialectos regionales, abreviaturas coloquiales y errores ortográficos.
- Robustez ante negaciones y prohibiciones ("no me envíes fotos", "photo mat bhejna").
- Distinción entre el usuario que comparte su propio material y el usuario que pide generación.
- Filtrado de consultas técnicas de fotografía y de cumplidos que no deben disparar generación.
- Inferencia de baja latencia en CPU mediante ONNX Runtime.
- No soporta tool calling, agentes multi-paso ni generación de texto: es exclusivamente un clasificador.

## Casos de uso

- Enrutamiento en asistentes con generación de imágenes bajo demanda: el clasificador se sitúa delante del generador y decide si la petición debe activarlo, evitando costes innecesarios en peticiones puramente conversacionales.
- Moderación de disparos falsos en productos de companion o avatares: frases como "qué guapa eres" o "me gusta la fotografía" se clasifican como `TEXT_CHAT`, lo que evita generar imágenes no solicitadas.
- Atención al cliente con capacidad visual: separa consultas textuales de peticiones explícitas de imagen, permitiendo derivar solo estas últimas al pipeline de síntesis.
- Procesamiento de conversaciones en hinglish: útil en mercados del sur de Asia donde los usuarios alternan inglés y hindi romanizado con abreviaturas y erratas.
- Backends en CPU sin GPU: con ~12 ms P50 en ONNX Runtime a 2 hilos y ~79 req/s, encaja en servicios FastAPI o Flask desplegados en infraestructura solo-CPU.
- Prefiltro en sistemas con ZeroGPU o recursos compartidos: su latencia y tamaño permiten ejecutarlo como primera etapa antes de modelos generativos más costosos.
- Detección de prohibiciones explícitas: permite respetar instrucciones del tipo "no me mandes imágenes" antes de invocar cualquier generador.

## Benchmarks y rendimiento

Resultados publicados en la model card sobre un holdout balanceado de 828 muestras:

| Métrica | Valor |
|---|---|
| Accuracy | 100,00 % |
| Macro F1 | 1,0000 |
| Precision ponderada | 1,0000 |
| Recall ponderado | 1,0000 |
| Evaluation loss | 0,0033 |

Evaluación por slices adversarios:

| Slice | Clase esperada | Accuracy |
|---|---|---|
| Comandos directos de generación (EN) | `IMAGE_GENERATION` | 100,0 % (9/9) |
| Especificaciones de vestimenta y escena | `IMAGE_GENERATION` | 60,0 % (6/10) |
| Peticiones afectuosas o de companion | `IMAGE_GENERATION` | 100,0 % (6/6) |
| Hinglish y dialectos regionales | `IMAGE_GENERATION` | 100,0 % (8/8) |
| Abreviaturas coloquiales y erratas | `IMAGE_GENERATION` | 100,0 % (7/7) |
| Trampa: negaciones y prohibiciones | `TEXT_CHAT` | 86,7 % (13/15) |
| Trampa: usuario comparte material propio | `TEXT_CHAT` | 87,5 % (7/8) |
| Trampa: preguntas técnicas de fotografía | `TEXT_CHAT` | 83,3 % (5/6) |
| Trampa: cumplidos sin generación | `TEXT_CHAT` | 90,0 % (9/10) |
| Conversación casual | `TEXT_CHAT` | 83,3 % (5/6) |

Latencia y throughput (benchmark sobre 200 iteraciones, frase única):

| Runtime | Execution provider | P50 | P95 | P99 | Throughput |
|---|---|---|---|---|---|
| ONNX Runtime | CPU (2 hilos) | 12,16 ms | 13,86 ms | 26,96 ms | 79,3 req/s |
| PyTorch nativo | CPU | 30,02 ms | 38,40 ms | 44,22 ms | 33,9 req/s |
| PyTorch nativo | Tesla T4 GPU | 7,71 ms | 9,07 ms | 11,24 ms | 125,6 req/s |

## Requisitos de hardware

- VRAM estimada: el modelo tiene ~117,7 M de parámetros; en fp32 ocupa aproximadamente 470 MB de pesos, y en fp16 unos 235 MB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: no requiere GPU; el benchmark de referencia usa una Tesla T4 y demuestra que la CPU es suficiente para producción de baja latencia.
- GPU consumer: cabe en cualquier RTX (por ejemplo, RTX 3060, 4060, 4090) sin problemas de memoria, aunque la ventaja frente a CPU es marginal en esta tarea.
- Despliegue: ONNX Runtime (recomendado, opset 18), PyTorch nativo con Transformers, y de forma indirecta cualquier servidor que cargue safetensors/ONNX (FastAPI, Flask). No se documentan integraciones específicas con vLLM, llama.cpp, Ollama o TGI, que además no aplican a un clasificador BERT.
- Latencia y throughput: ~12 ms P50 y ~79 req/s en CPU con 2 hilos vía ONNX Runtime; ~7,7 ms P50 y ~125 req/s en T4.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Notas |
|---|---|---|---|---|---|
| Umranz/intent-classifier | 117,7 M | No disponible (truncado a 128 en ejemplos) | Clasificación binaria de intención | MIT | Router específico imagen/chat, EN + hinglish |
| sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2 | ~118 M | No disponible | Embeddings multilingües | No disponible en la información | Modelo base; requeriría cabeza y ajuste propios |
| Clasificadores BERT genéricos (p. ej. distilbert-base) | ~66 M | 512 típicamente | Clasificación de texto general | Variable | No especializados en enrutamiento multimodal ni hinglish |

No se dispone en la información proporcionada de comparativas publicadas frente a otros routers de intención específicos.

## Limitaciones y advertencias

- El 100 % de accuracy en el holdout debe interpretarse con cautela: el conjunto es pequeño (828 muestras) y probablemente comparte distribución con el entrenamiento; no garantiza generalización.
- El slice de especificaciones de vestimenta y escena cae al 60 %, lo que indica debilidad con peticiones de generación que incluyen múltiples restricciones visuales en una misma frase.
- Las trampas de negaciones (86,7 %), material propio del usuario (87,5 %), preguntas técnicas (83,3 %) y cumplidos (90 %) muestran errores residuales que en producción pueden traducirse en generaciones no deseadas.
- Solo cubre inglés y hinglish; no hay soporte declarado para castellano ni otros idiomas, por lo que su uso en mercados hispanohablantes requeriría reentrenamiento.
- Es un clasificador binario: no genera texto, no hace tool calling ni razonamiento multi-paso; no debe presentarse como un modelo conversacional.
- Riesgo de alucinación no aplica en el sentido generativo, pero sí existe riesgo de clasificación errónea con confianza alta; la model card recomienda un umbral de tres vías (≥0,75 imagen, 0,45–0,75 ambiguo, <0,45 texto) para mitigarlo.
- Licencia MIT: permite uso comercial y modificación, pero conviene verificar las obligaciones heredadas del modelo base `paraphrase-multilingual-MiniLM-L12-v2`.
- El repositorio ocupa 18,4 GB, desproporcionado para 117,7 M de parámetros; probablemente incluye artefactos de entrenamiento o checkpoints intermedios, lo que conviene revisar antes de desplegar.
- No se documentan sesgos específicos ni composición del dataset de entrenamiento, lo que dificulta evaluar equidad entre dialectos o registros.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Umranz/intent-classifier
- Modelo base: https://huggingface.co/sentence-transformers/paraphrase-multilingual-MiniLM-L12-v2
- ONNX Runtime: https://onnxruntime.ai/
- Documentación de Transformers para text-classification: https://huggingface.co/docs/transformers/tasks/sequence_classification
