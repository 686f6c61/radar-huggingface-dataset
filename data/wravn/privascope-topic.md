# Wravn/PrivaScope-topic

## Resumen

PrivaScope-topic es un modelo de clasificación de texto obtenido por ajuste fino (fine-tuning) de mukund/privbert, un RoBERTa-base preentrenado sobre corpus de políticas de privacidad. Lo desarrolla el usuario Wravn y lo publica en Hugging Face bajo el identificador Wravn/PrivaScope-topic. El modelo resuelve una tarea de clasificación de temas (topic classification) sobre texto en inglés, presumiblemente orientada a analizar documentos legales o avisos de privacidad, aunque la model card no detalla las etiquetas concretas ni el conjunto de datos de ajuste.

Arquitectura RoBERTa-base con 124.657.167 parámetros totales, distribuidos en un encoder transformer de 12 capas y dimensión oculta 768. Se distribuye en formato safetensors y también con pesos ONNX, lo que facilita su despliegue en entornos de inferencia sin dependencia de PyTorch. El repositorio ocupa 0,6 GB.

Su relevancia es acotada: se trata de un modelo derivado, con cero descargas y cero likes en el momento de la consulta, sin métricas publicadas ni licencia declarada. Resulta útil como ejemplo de reutilización de PrivBERT para clasificación temática, pero no constituye una referencia consolidada para producción.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | RoBERTa-base (encoder transformer) |
| Parametros totales | 124.657.167 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (RoBERTa-base admite hasta 512 tokens, no confirmado en la model card) |
| Tipos de cuantizacion | no disponible (se distribuyen pesos ONNX y safetensors; no se detallan variantes cuantizadas) |
| Idiomas soportados | en (inglés) |
| Licencia | no disponible |
| Formato de pesos | safetensors, ONNX |

## Arquitectura y entrenamiento

El modelo parte de mukund/privbert, un RoBERTa-base preentrenado de forma específica sobre textos de políticas de privacidad. Sobre esa base, Wravn aplica un ajuste fino supervisado para una tarea de clasificación de texto (pipeline text-classification), añadiendo presumiblemente una cabeza de clasificación sobre el token [CLS]. La arquitectura es un transformer encoder estándar de 12 capas, 768 dimensiones ocultas y 12 cabezas de atención, con vocabulario BPE propio de RoBERTa.

No se dispone de información sobre el volumen de datos de ajuste, la composición del dataset, el número de épocas, la función de pérdida ni si se aplicaron técnicas de regularización o aumento de datos. Tampoco hay constancia de RLHF, DPO ni de innovaciones técnicas adicionales (decodificación especulativa, atención lineal, etc.). La model card únicamente declara la métrica F1 como referencia de evaluación, sin aportar valores.

## Capacidades

- Clasificación de texto en inglés: asigna una etiqueta temática a un fragmento de texto, orientada a documentos de privacidad o legales.
- Especialización de dominio: hereda del preentrenamiento de PrivBERT sobre políticas de privacidad, lo que puede mejorar la sensibilidad al vocabulario jurídico de ese ámbito.
- Inferencia ligera: al ser un encoder de 124M de parámetros, permite inferencia en CPU y en GPU de gama baja.
- Exportación a ONNX: facilita el despliegue en runtimes de inferencia optimizados y en entornos sin PyTorch.
- No se ha documentado soporte de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Capacidad multilingüe: limitada al inglés según la model card.

## Casos de uso

- Clasificación de cláusulas en políticas de privacidad: el modelo puede etiquetar secciones de un aviso de privacidad (por ejemplo, recogida de datos, cesión a terceros, cookies) para alimentar un inventario automatizado de tratamientos, aprovechando el preentrenamiento de PrivBERT sobre ese dominio.
- Triaje documental en cumplimiento normativo: en un flujo de revisión de RGPD o CCPA, clasificar automáticamente fragmentos entrantes antes de la revisión humana, reduciendo el volumen que llega a los analistas.
- Enriquecimiento de metadatos en repositorios legales: asignar etiquetas temáticas a documentos almacenados para mejorar la búsqueda y el filtrado por categoría.
- Moderación y filtrado de contenido textual: usar la cabeza de clasificación para descartar o priorizar textos según su temática en pipelines de preprocesado.
- Inferencia en el borde (edge): gracias a sus 124M de parámetros y a la exportación ONNX, puede ejecutarse en servidores modestos o en CPU para clasificar grandes lotes sin GPU dedicada.
- Prototipado rápido de clasificadores de dominio: servir como punto de partida para ajustes finos adicionales sobre taxonomías propias de una organización, dado que el coste de reentrenamiento de un encoder de este tamaño es bajo.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card declara la métrica F1 pero no incluye valores numéricos ni conjuntos de evaluación.

## Requisitos de hardware

- VRAM estimada para inferencia en FP32: aproximadamente 0,5 GB para los pesos (124M parámetros × 4 bytes), más overhead de activaciones y tokenizador; en la práctica, menos de 1 GB.
- VRAM estimada en FP16: alrededor de 0,25 GB para los pesos.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; tarjetas como RTX 3060, RTX 4090, A100 o H100 son sobredimensionadas para este modelo.
- Cabe en GPU de consumo: sí, en cualquier GPU consumer moderna e incluso en iGPU con suficiente memoria compartida.
- Despliegue: compatible con ONNX Runtime (por los pesos ONNX publicados), y con vLLM, TGI o llama.cpp no aplica de forma directa al ser un encoder de clasificación; para PyTorch, transformers con pipeline de text-classification.
- Latencia y throughput: no disponibles; al tratarse de un encoder de 124M, se espera un throughput alto en CPU y muy alto en GPU, pero no hay cifras publicadas.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Wravn/PrivaScope-topic | 124.657.167 | no disponible | Clasificación de texto (en) | no disponible | Hugging Face, 0 descargas |
| mukund/privbert | ~125M (RoBERTa-base) | hasta 512 tokens | Masked LM de dominio (privacidad) | no disponible en la información | Hugging Face, modelo base |
| roberta-base | ~125M | hasta 512 tokens | Masked LM generalista | MIT | Hugging Face, ampliamente usado |
| distilbert-base-uncased | ~66M | hasta 512 tokens | Masked LM generalista | Apache 2.0 | Hugging Face, ampliamente usado |

La comparación se limita a arquitectura y tamaño, ya que no hay datos de rendimiento publicados para PrivaScope-topic. Frente a roberta-base, comparte arquitectura pero se especializa en el dominio de privacidad; frente a distilbert, es aproximadamente el doble de grande y presumiblemente más preciso, a costa de mayor coste de inferencia.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al derivar de un corpus de políticas de privacidad en inglés, puede reflejar sesgos de ese dominio y de la jurisdicción de los textos de origen.
- Riesgo de alucinación: bajo en sentido estricto al ser un clasificador, pero puede producir etiquetas erróneas con alta confianza en textos fuera de distribución.
- Limitaciones de idioma: solo inglés; su rendimiento en castellano u otros idiomas no está garantizado.
- Limitaciones de contexto: sin confirmación en la model card, se asume el límite de 512 tokens de RoBERTa-base; textos más largos requerirán truncamiento o segmentación.
- Restricciones de licencia: la licencia no está declarada, lo que impide asumir uso comercial sin consultar al autor.
- Madurez: cero descargas y cero likes, sin métricas publicadas ni documentación de entrenamiento; no es adecuado como componente crítico en producción sin una evaluación propia.
- Ausencia de información sobre las etiquetas: se desconoce la taxonomía exacta que predice el modelo, lo que obliga a inspeccionar la configuración antes de usarlo.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/Wravn/PrivaScope-topic
- Modelo base: https://huggingface.co/mukund/privbert
