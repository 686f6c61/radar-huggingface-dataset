# Thiago-Reis-Porto/modernJabuticaBERT-Base-1k

## Resumen

modernJabuticaBERT-Base-1k es un modelo de tipo encoder basado en la arquitectura ModernBERT, desarrollado por Thiago Reis Porto y el equipo de amadeusai dentro de la familia JabuticaBERT. Su objetivo es proporcionar representaciones textuales de alta calidad para el portugués, entrenado desde cero con un enfoque de long-context (ventana de 1024 tokens en su versión base). El modelo está diseñado para tareas de extracción de características (feature extraction) y puede utilizarse como backbone para fine-tuning en tareas de PLN como clasificación, NER o búsqueda semántica.

La relevancia de este modelo radica en que aborda la escasez de encoders modernos específicos para portugués, incorporando innovaciones de ModernBERT como la atención con ventana deslizante y la eliminación de sesgos posicionales, junto con un entrenamiento con RTD (Replaced Token Detection) y empaquetado de secuencias. Con 149 millones de parámetros, se sitúa en un rango de tamaño medio que permite su despliegue en hardware de consumo, aunque su licencia no está especificada en la información disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ModernBERT (transformer encoder) |
| Parametros totales | 149.014.272 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 1024 tokens (version base) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | portugues (inferido del nombre y el paper; no declarado en la model card) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo sigue la arquitectura ModernBERT, que introduce mejoras sobre BERT original: atención con ventana deslizante, normalización pre-LayerNorm, y una tokenización más eficiente. Según el paper de JabuticaBERT, la variante modernJabuticaBERT se entrena con objetivo MLM (masked language modeling) sobre secuencias de 1024 tokens, utilizando precisión mixta bf16 y el optimizador StableAdamW bajo un esquema de calentamiento, estabilización y decaimiento (Warmup-Stable-Decay). Además, se emplea empaquetado de secuencias (sequence packing) para aprovechar al máximo el contexto durante el entrenamiento.

El entrenamiento se realiza desde cero (from scratch) sobre datos en portugués, con un enfoque de long-context que permite capturar dependencias de largo alcance. No se especifican detalles sobre el volumen de datos ni la composición exacta del corpus en la información disponible, pero el paper presentado en PROPOR 2026 describe el proceso completo.

## Capacidades

- Extracción de características textuales (embeddings de secuencia y de token) para portugués.
- Generación de representaciones densas aptas para tareas de clasificación, búsqueda semántica y similitud entre textos.
- Soporte de contexto largo (1024 tokens) para capturar información a nivel de párrafo o documento corto.
- Entrenado con RTD (Replaced Token Detection) además de MLM, lo que puede mejorar la calidad de las representaciones.
- Compatible con la librería transformers y con text-embeddings-inference para despliegue en producción.
- No es un modelo generativo: no genera texto, solo produce representaciones vectoriales.

## Casos de uso

- Búsqueda semántica en portugués: el modelo puede convertir documentos y consultas en vectores para recuperar información relevante en motores de búsqueda o sistemas RAG, aprovechando su contexto de 1024 tokens.
- Clasificación de textos: fine-tuning sobre el encoder para clasificar noticias, opiniones o documentos legales en portugués, con buena capacidad de representación contextual.
- Reconocimiento de entidades nombradas (NER): al ser un encoder, puede utilizarse como base para etiquetar secuencias en dominios como finanzas o salud en portugués.
- Sistemas de recomendación basados en contenido: generar embeddings de artículos o productos para calcular similitudes y sugerir elementos relacionados.
- Análisis de sentimiento en redes sociales: fine-tuning con datos etiquetados para detectar polaridad en textos cortos y largos en portugués.
- Chatbots y asistentes virtuales: como componente de comprensión del lenguaje para extraer intenciones y entidades en conversaciones, aunque no genera respuestas por sí mismo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. El paper de JabuticaBERT (PROPOR 2026) podría contener evaluaciones comparativas, pero no se han proporcionado datos concretos en la documentación accesible.

## Requisitos de hardware

- VRAM estimada para inferencia: al ser un modelo de 149M parámetros, en FP32 ocupa aproximadamente 600 MB, por lo que cabría en GPUs con 4 GB o menos si se usa cuantización (aunque no se especifican cuantizaciones disponibles).
- GPU recomendadas: cualquier GPU moderna con al menos 4 GB de VRAM, como NVIDIA GTX 1650, RTX 3060 o superiores. También puede ejecutarse en CPU para tareas de baja latencia.
- Compatible con consumer GPUs: sí, dado su tamaño moderado.
- Opciones de despliegue: transformers (PyTorch), text-embeddings-inference, y potencialmente ONNX o TensorRT si se exportan los pesos.
- Latencia y throughput: no disponible, pero al ser un encoder de 149M, la inferencia es rápida en GPU moderna (del orden de milisegundos por secuencia).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Notas |
|---|---|---|---|---|---|
| modernJabuticaBERT-Base-1k | 149M | 1024 | Portugues | no disponible | Encoder ModernBERT, entrenado desde cero |
| BERTimbau Base | 110M | 512 | Portugues | Apache 2.0 | BERT clásico para portugués, muy usado |
| XLM-R Base | 278M | 512 | Multilingue (100 idiomas) | MIT | Encoder multilingüe, incluye portugués |

La comparativa se basa en modelos conocidos del ecosistema, aunque no se dispone de datos de rendimiento directos para modernJabuticaBERT. Su principal ventaja es el contexto más largo (1024 vs 512) y la arquitectura ModernBERT más eficiente, pero su licencia y disponibilidad de benchmarks son limitaciones.

## Limitaciones y advertencias

- Licencia no especificada: no se puede garantizar el uso comercial sin consultar al autor.
- Model card incompleta: falta información sobre datos de entrenamiento, sesgos y evaluación.
- Idioma: aunque se infiere que es portugués, no hay confirmación oficial en la model card; podría tener limitaciones en otros idiomas.
- No es generativo: no sirve para tareas de generación de texto.
- Riesgo de sesgos: al estar entrenado con datos web, puede heredar sesgos sociales y culturales del corpus, aunque no se documentan.
- Alucinación: no aplica directamente al ser un encoder, pero los embeddings pueden reflejar sesgos en tareas downstream.
- Sin benchmarks publicados: dificulta la comparación objetiva con otros modelos.

## Enlaces

- HuggingFace: https://huggingface.co/Thiago-Reis-Porto/modernJabuticaBERT-Base-1k
- Colección JabuticaBERT: https://huggingface.co/collections/amadeusai/jabuticabert
- Paper (PROPOR 2026): https://aclanthology.org/2026.propor-1.93/
- PDF del paper: https://aclanthology.org/2026.propor-1.93.pdf
