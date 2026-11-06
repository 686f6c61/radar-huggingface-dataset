# waad12I/samm-saudi-bank-intent

## Resumen

El modelo `waad12I/samm-saudi-bank-intent` es un clasificador de texto basado en la arquitectura BERT, publicado en Hugging Face por el usuario waad12I. Con 143.707.478 parámetros totales, se trata de un modelo de la familia BERT-base o similar, ajustado para la tarea de clasificación de intenciones (intent classification) en el dominio bancario saudí, a juzgar por su identificador. El nombre sugiere que está orientado a detectar la intención del usuario en interacciones con un banco saudí (posiblemente el banco SAMM, aunque no se confirma en la documentación).

La relevancia de este modelo radica en su especialización vertical: los clasificadores de intención son componentes fundamentales en sistemas de atención al cliente automatizada, chatbots y enrutamiento de consultas. Sin embargo, la información pública disponible es extremadamente limitada: la model card es la plantilla automática de Hugging Face sin completar, no se especifican idiomas, licencia, datos de entrenamiento ni resultados de evaluación. El repositorio tiene 0 descargas y 0 likes, lo que indica que es un modelo recién publicado o de uso interno sin validación comunitaria.

Se trata, por tanto, de un modelo del que se conocen únicamente los metadatos técnicos básicos (arquitectura BERT, 143,7M de parámetros, pipeline de clasificación de texto, pesos en safetensors) pero cuya calidad, rendimiento y condiciones de uso no pueden verificarse con la información disponible.

## Especificaciones técnicas

| Parámetro | Valor |
|---|---|
| Arquitectura | BERT (transformer encoder) |
| Parámetros totales | 143.707.478 |
| Parámetros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (típicamente 512 tokens en BERT, no confirmado) |
| Tipos de cuantización | no disponible |
| Idiomas soportados | no disponible (por el nombre, probablemente árabe e inglés, no confirmado) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es BERT, un transformer encoder bidireccional. El recuento de 143.707.478 parámetros es consistente con BERT-base (110M) con una cabeza de clasificación ampliada o con una variante como BERT-base multilingüe (178M) parcialmente recortada; sin confirmación del autor no es posible determinar la configuración exacta de capas, dimensiones ocultas ni cabezas de atención.

No se dispone de información sobre el proceso de entrenamiento: no se especifican el número de tokens, la composición del dataset, si hubo preentrenamiento desde cero o fine-tuning sobre un checkpoint existente, ni si se aplicaron técnicas de regularización, aumento de datos o ajuste de hiperparámetros. La model card no incluye ninguna sección completada más allá de la plantilla automática. Tampoco se documentan innovaciones técnicas destacables.

## Capacidades

- Clasificación de texto: el pipeline declarado es `text-classification`, orientado a asignar una etiqueta de intención a una consulta o utterance.
- Dominio bancario: el identificador sugiere especialización en intenciones de banca (consultas de saldo, transferencias, tarjetas, etc.), aunque las etiquetas concretas no están documentadas.
- Generación de texto: no, es un modelo encoder para clasificación.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-step: no, no es un modelo generativo.
- Capacidades multilingües: no confirmadas; probablemente árabe e inglés por el contexto saudí, pero no verificado.
- Capacidades especiales (thinking mode, visión, audio): ninguna.

## Casos de uso

- Enrutamiento de consultas en atención al cliente bancaria: clasificar mensajes entrantes de usuarios en categorías de intención (saldo, transferencia, bloqueo de tarjeta) para dirigirlos al departamento o flujo automatizado adecuado. Adecuado por su naturaleza de clasificador especializado en dominio.
- Chatbots de banca minorista: como componente de NLU que detecta la intención del usuario antes de invocar una respuesta predefinida o un servicio backend.
- Análisis de tickets de soporte: etiquetar automáticamente reclamaciones y solicitudes para priorización y métricas de volumen por tipo de consulta.
- Moderación y triaje de correos: clasificar comunicaciones de clientes hacia el banco según su propósito para su distribución interna.
- Enriquecimiento de datasets: usar el modelo como etiquetador automático de corpus de conversaciones bancarias para construir datasets de entrenamiento de mayor tamaño.
- Investigación en NLP financiero en árabe: servir como baseline especializado para comparar con modelos de clasificación de intenciones en el dominio bancario saudí.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 0,6 GB en FP32 (143,7M parámetros × 4 bytes); en FP16 alrededor de 0,3 GB. Cabe holgadamente en cualquier GPU consumer.
- GPU recomendadas: cualquier GPU con al menos 2 GB de VRAM; una RTX 3060, RTX 4090, T4 o incluso CPU son suficientes para inferencia.
- Cabe en GPU consumer: sí, en todas las GPU modernas e incluso en CPU para cargas moderadas.
- Opciones de despliegue: transformers (PyTorch), Text Embeddings Inference (el tag `text-embeddings-inference` está presente), y potencialmente ONNX Runtime o TorchScript si se exporta; llama.cpp y Ollama no aplican a un encoder de clasificación.
- Latencia y throughput estimados: no disponibles; para un BERT-base en GPU se esperan latencias de milisegundos por secuencia corta, pero no hay mediciones publicadas para este modelo.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| waad12I/samm-saudi-bank-intent | 143,7M | no disponible | Clasificación de intención bancaria | no disponible | Hugging Face (0 descargas) |
| bert-base-multilingual-cased | 178M | 512 tokens | Clasificación general / fine-tuning | Apache 2.0 | Hugging Face (ampliamente usado) |
| CAMeL-Lab/bert-base-arabic-camelbert-mix | ~110M | 512 tokens | NLP árabe general | no disponible | Hugging Face |

La comparación es limitada porque no se dispone de métricas de rendimiento del modelo principal. Frente a un BERT multilingüe genérico, este modelo estaría teóricamente especializado en el dominio bancario saudí, pero sin datos de evaluación no puede confirmarse que supere a un baseline genérico ajustado. La licencia no disponible es un factor de riesgo frente a alternativas con licencias permisivas como Apache 2.0.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados; al entrenarse presumiblemente con datos de un banco saudí, puede heredar sesgos demográficos, regionales o de tipo de cliente de ese corpus.
- Riesgo de alucinación: bajo en sentido estricto (es un clasificador, no genera texto), pero puede asignar etiquetas incorrectas con alta confianza en entradas fuera de distribución.
- Limitaciones de contexto o idioma: no confirmadas; si sigue la configuración estándar de BERT, el límite sería 512 tokens, insuficiente para documentos largos. Los idiomas soportados no están documentados.
- Restricciones de licencia para uso comercial: la licencia no está disponible, por lo que no puede asumirse permiso para uso comercial. Es imprescindible contactar con el autor antes de cualquier despliegue en producción.
- Caveats para producción: sin model card completada, sin métricas de evaluación, sin conjunto de etiquetas documentado y con 0 descargas, el modelo no ha sido validado por la comunidad. No se recomienda su uso en producción sin una evaluación propia exhaustiva sobre datos representativos del dominio objetivo.
- Falta de documentación sobre el conjunto de etiquetas: impide saber qué intenciones cubre y cuáles no, lo que limita su integración directa.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/waad12I/samm-saudi-bank-intent
- Paper de referencia citado en los tags (ML Impact Calculator, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora de impacto de carbono: https://mlco2.github.io/impact#compute
