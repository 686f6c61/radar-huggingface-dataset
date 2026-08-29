# timucine/detoxify-onnx

## Resumen

El modelo `timucine/detoxify-onnx` es una publicación en Hugging Face que, según la información disponible, consiste en una conversión a formato ONNX del modelo Detoxify, originalmente desarrollado por unitaryai para la detección de toxicidad en texto. Sin embargo, la ficha del modelo en Hugging Face es extremadamente escasa: no incluye descripción, arquitectura, parámetros, ni datos de entrenamiento. La única información confirmada es que la licencia declarada es MIT.

A partir de los resultados de búsqueda, se sabe que existe un repositorio similar `gravitee-io/detoxify-onnx` que sí documenta una conversión y cuantización del modelo Detoxify multilingüe, optimizado para inferencia con ONNX Runtime. Es probable que `timucine/detoxify-onnx` sea una copia o una variante de ese trabajo, pero no hay evidencia directa que lo confirme. Por tanto, esta ficha se basa en lo que se puede inferir del modelo original Detoxify y de la versión documentada por gravitee-io, indicando siempre qué datos son verificados y cuáles son suposiciones razonables.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | no disponible (se infiere XLM-RoBERTa, basado en Detoxify original) |
| Parametros totales | no disponible |
| Parametros activos | no disponible |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (la versión de gravitee-io indica cuantización, pero no se confirma para este modelo) |
| Idiomas soportados | no disponible (el modelo Detoxify original soporta 7 idiomas, pero no se confirma aquí) |
| Licencia | MIT |
| Formato de pesos | ONNX (según el nombre del modelo, aunque no se confirma en la ficha) |

## Arquitectura y entrenamiento

No se dispone de información oficial sobre la arquitectura, el proceso de entrenamiento o los datos utilizados para este modelo concreto. El modelo original Detoxify, desarrollado por unitaryai, se basa en la arquitectura XLM-RoBERTa y fue entrenado para clasificar texto en múltiples categorías de toxicidad (insultos, amenazas, obscenidad, etc.) mediante fine-tuning sobre datasets como Jigsaw. La versión de `gravitee-io/detoxify-onnx` indica que se realizó una exportación a ONNX y una cuantización posterior para mejorar el rendimiento en inferencia, pero no se especifican los detalles técnicos de esa conversión. Para el modelo `timucine/detoxify-onnx`, no hay confirmación de que se haya seguido el mismo proceso.

## Capacidades

- Clasificación de toxicidad en texto: el modelo original Detoxify es capaz de detectar múltiples tipos de lenguaje tóxico, como insultos, amenazas, obscenidad y ataques de identidad.
- Soporte multilingüe: el Detoxify original está entrenado para 7 idiomas (inglés, francés, alemán, italiano, portugués, ruso y turco), aunque no se confirma que esta versión conserve esa capacidad.
- Inferencia optimizada: al estar en formato ONNX, el modelo puede ejecutarse con ONNX Runtime, lo que permite una inferencia más rápida y ligera en comparación con el formato original de PyTorch.
- No se han documentado capacidades adicionales como generación de texto, razonamiento o tool calling.

## Casos de uso

- Moderación de contenido en foros y redes sociales: el modelo puede integrarse en pipelines de moderación automática para filtrar comentarios tóxicos antes de su publicación, reduciendo la carga de moderadores humanos.
- Análisis de sentimiento en reseñas de productos: aunque su enfoque es la toxicidad, puede utilizarse para identificar reseñas abusivas o discriminatorias en plataformas de comercio electrónico.
- Filtrado de mensajes en aplicaciones de mensajería: integración en chatbots o sistemas de mensajería para bloquear o marcar mensajes ofensivos en tiempo real.
- Auditoría de contenido histórico: procesamiento de grandes volúmenes de texto almacenado (por ejemplo, archivos de chat o comentarios) para detectar y cuantificar la toxicidad en datasets existentes.
- Investigación en ciencias sociales: análisis de discursos en línea para estudiar patrones de acoso o discurso de odio en diferentes idiomas y contextos.
- Sistemas de protección para menores: uso en plataformas dirigidas a niños para detectar y bloquear contenido inapropiado antes de que llegue a los usuarios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible para el modelo `timucine/detoxify-onnx`. El modelo original Detoxify reporta métricas de precisión y AUC en el dataset Jigsaw, pero no hay datos específicos para esta versión ONNX. Tampoco se dispone de comparativas con otros modelos de detección de toxicidad en este contexto.

## Requisitos de hardware

- Al ser un modelo de clasificación de texto basado en XLM-RoBERTa, el tamaño del modelo original ronda los 550 millones de parámetros, pero la versión ONNX cuantizada puede reducir significativamente los requisitos de memoria.
- Para inferencia en CPU: es viable con 4-8 GB de RAM, especialmente si se usa cuantización de 8 bits.
- Para inferencia en GPU: una GPU con al menos 4 GB de VRAM (por ejemplo, NVIDIA GTX 1650 o superior) es suficiente para ejecutar el modelo sin problemas.
- Opciones de despliegue: ONNX Runtime (CPU y GPU), puede integrarse en servicios como FastAPI, o en plataformas de inferencia como Hugging Face Inference Endpoints.
- Latencia estimada: en CPU moderna, la inferencia de un texto corto suele tardar entre 10 y 50 ms; en GPU, entre 1 y 5 ms. Estos valores son orientativos y dependen del hardware y la cuantización.

## Comparativa con modelos similares

No se dispone de información suficiente para realizar una comparativa fiable con otros modelos de detección de toxicidad, ya que no hay datos verificados sobre el rendimiento de esta versión concreta. El modelo original Detoxify se compara a menudo con alternativas como `unitaryai/detoxify` (PyTorch) o `facebook/roberta-hate-speech-dynabench-r4-target`, pero no se pueden ofrecer cifras concretas sin datos publicados.

## Limitaciones y advertencias

- La información disponible sobre este modelo es insuficiente para garantizar su funcionamiento en producción. No se ha verificado la arquitectura, los pesos ni el proceso de conversión.
- El modelo original Detoxify tiene sesgos conocidos: puede clasificar erróneamente texto con dialectos no estándar o lenguaje informal como tóxico, y su rendimiento varía entre idiomas.
- Riesgo de alucinación: al ser un clasificador, no genera texto, pero puede producir falsos positivos o negativos en la detección de toxicidad, especialmente en contextos de sarcasmo o ironía.
- La licencia MIT permite uso comercial sin restricciones, pero no se ofrece garantía sobre la precisión o idoneidad del modelo para casos específicos.
- No se ha documentado la longitud máxima de entrada; el modelo original Detoxify acepta secuencias de hasta 512 tokens, pero no se confirma para esta versión.

## Enlaces

- Hugging Face del modelo: https://huggingface.co/timucine/detoxify-onnx
- Repositorio similar documentado: https://huggingface.co/gravitee-io/detoxify-onnx
- GitHub de gravitee-io/detoxify-onnx: https://github.com/gravitee-io/detoxify-onnx
- Modelo original Detoxify (unitaryai): https://github.com/unitaryai/detoxify
