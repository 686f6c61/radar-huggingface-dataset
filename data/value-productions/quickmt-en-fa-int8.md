# value-productions/quickmt-en-fa-int8

## Resumen

quickmt-en-fa-int8 es un modelo de traducción automática inglés-persa (en-fa) derivado de quickmt/quickmt-en-fa, republicado por value-productions en formato CTranslate2 con pesos cuantizados a int8. El modelo original lo desarrolla quickmt bajo licencia CC BY 4.0, y esta variante está pensada para su uso dentro de la aplicación Yaku Translate, que emplea CTranslate2 como motor de inferencia.

El modelo resuelve la tarea de traducción unidireccional inglés a farsi con un objetivo claro de eficiencia: el repositorio ocupa 0,2 GB, lo que lo sitúa en la categoría de modelos de traducción ligeros desplegables en CPU o en GPUs modestas. La cuantización aplicada es int8 por fila sobre cada peso bidimensional, siguiendo el esquema de cuantización de ModelSpec de CTranslate2, con fecha de conversión 26.10.2026.

La relevancia de esta ficha es acotada pero concreta: se trata de un artefacto de despliegue, no de un modelo nuevo. El autor afirma que la salida en las frases comprobadas es idéntica carácter por carácter a la del original en float16, lo que convierte a esta variante en una opción práctica para servir traducción en-fa con menor huella de memoria sin degradación observable en la muestra evaluada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de traducción (arquitectura exacta del modelo base no disponible) |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | int8 (cuantización por fila de cada peso 2-D, esquema ModelSpec de CTranslate2); el original está en float16 |
| Idiomas soportados | inglés (origen) y persa/farsi (destino); par unidireccional en-fa |
| Licencia | CC BY 4.0 |
| Formato de pesos | CTranslate2 (model.bin), con config.json, source_vocabulary.json, target_vocabulary.json, src.spm.model y tgt.spm.model |

## Arquitectura y entrenamiento

La información disponible no detalla la arquitectura interna del modelo base quickmt/quickmt-en-fa: no se especifica número de capas, dimensión oculta, cabezas de atención ni número de parámetros. Por los artefactos incluidos se deduce un pipeline de traducción seq2seq con tokenización SentencePiece independiente para origen (src.spm.model) y destino (tgt.spm.model), y vocabularios separados para cada lado (source_vocabulary.json y target_vocabulary.json).

El entrenamiento del modelo original corresponde a quickmt y no está documentado en la información proporcionada: se desconoce el volumen de tokens, la composición del corpus, si hubo técnicas de alineación, destilación o ajuste fino supervisado más allá de lo que implica el tag base_model:finetune. La contribución de esta variante es exclusivamente de conversión: cuantización int8 por fila de todos los pesos bidimensionales, con conversión fechada el 26.10.2026, y verificación de paridad de salida frente al original float16 en un conjunto de frases no especificado.

## Capacidades

- Traducción automática unidireccional de inglés a persa (farsi).
- Tokenización SentencePiece específica por lado, con vocabularios de origen y destino independientes.
- Inferencia optimizada mediante CTranslate2, con pesos int8 que reducen el uso de memoria frente al float16 original.
- Integración prevista en la aplicación Yaku Translate.
- No se documentan capacidades de tool calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- No se documenta soporte multilingüe más allá del par en-fa.
- No se documenta traducción inversa (fa-en) en este artefacto.

## Casos de uso

- Traducción de documentación técnica en inglés a persa: el modelo puede procesar textos largos divididos en segmentos y generar salida en farsi con un motor CTranslate2, adecuado para pipelines por lotes donde el coste por token importa.
- Localización de interfaces de aplicaciones: integrado en la app Yaku Translate o en herramientas similares, permite traducir cadenas de UI del inglés al persa en tiempo de compilación o en tiempo de ejecución con baja latencia en CPU.
- Atención al cliente en persa: traducción de mensajes entrantes en inglés a farsi para agentes o sistemas de soporte que operan en Irán o con diáspora persa, usando el modelo como capa de traducción previa a un LLM.
- Subtitulado y transcripción: traducción de transcripciones en inglés a persa para generar subtítulos, aprovechando el bajo peso del modelo (0,2 GB) para despliegue en servidores modestos.
- Procesamiento de correo electrónico multilingüe: traducción automática de hilos de correo en inglés a farsi en sistemas de gestión documental, con inferencia por lotes en CPU.
- Investigación en traducción automática de bajos recursos: el par en-fa es menos frecuente que en-de o en-fr, por lo que este modelo sirve como línea base ligera para experimentos de evaluación y comparación con sistemas neuronales mayores.
- Despliegue en dispositivos con recursos limitados: al estar en int8 y CTranslate2, puede ejecutarse en entornos sin GPU, lo que facilita su uso en servidores pequeños o contenedores con memoria restringida.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor únicamente afirma que la salida en las frases comprobadas es idéntica carácter por carácter a la del original float16, sin especificar el conjunto de frases, la métrica (BLEU, chrF, COMET) ni el tamaño de la muestra.

## Requisitos de hardware

- VRAM estimada para inferencia: no disponible con precisión; el repositorio completo ocupa 0,2 GB, por lo que la huella en memoria es muy reducida y compatible con GPUs de gama baja o incluso inferencia en CPU.
- GPU recomendadas: cualquier GPU con al menos unos pocos GB de VRAM; el modelo cabe holgadamente en tarjetas consumer como RTX 3060, RTX 4060 o superiores. No se requiere A100 ni H100.
- Cabe en GPU consumer: sí, con amplio margen, dado el tamaño del artefacto.
- Opciones de despliegue: CTranslate2 (formato nativo del artefacto), con integración en aplicaciones Python mediante ctranslate2; no se distribuyen pesos GGUF ni safetensors en este repositorio, por lo que llama.cpp u Ollama requerirían conversión adicional desde el modelo base.
- Latencia y throughput estimados: no disponibles; dependerá del hardware y de la longitud de las secuencias.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| quickmt-en-fa-int8 (este) | no disponible | no disponible | CC BY 4.0 | CTranslate2 int8 | Hugging Face, 46 descargas |
| quickmt/quickmt-en-fa (base) | no disponible | no disponible | CC BY 4.0 | float16 (formato original no detallado) | Hugging Face |
| Otros modelos de traducción en-fa | no disponible | no disponible | varía | varía | no disponible en la información proporcionada |

No se dispone de datos de benchmarks ni de especificaciones de modelos alternativos comparables en la información proporcionada, por lo que la comparación cuantitativa no es posible.

## Limitaciones y advertencias

- Modelo unidireccional: solo traduce de inglés a persa; no se documenta la dirección inversa.
- La cuantización int8 puede introducir degradaciones no detectadas en frases fuera del conjunto de verificación del autor; la comprobación de paridad es limitada y no cuantificada.
- No se documentan sesgos conocidos, pero al ser un modelo de traducción entrenado con corpus no especificado, puede heredar sesgos de género, registro o dominio del dataset original.
- Riesgo de alucinación en traducción: posible generación de contenido no presente en el texto origen, especialmente en segmentos ambiguos o fuera de dominio.
- No se especifica la longitud máxima de secuencia ni el comportamiento con textos muy largos; se recomienda segmentar.
- Licencia CC BY 4.0: permite uso comercial con atribución; es necesario citar a quickmt y a value-productions según los términos.
- El modelo está empaquetado para CTranslate2; su uso fuera de ese runtime requiere conversión desde el modelo base.
- No hay información sobre el dominio de entrenamiento (general, técnico, literario), lo que limita la evaluación de su idoneidad para casos especializados.

## Enlaces

- Hugging Face: https://huggingface.co/value-productions/quickmt-en-fa-int8
- Modelo base: https://huggingface.co/quickmt/quickmt-en-fa
- Aplicación Yaku Translate: no disponible en la información proporcionada
- Paper o blog del modelo original: no disponible en la información proporcionada
- Repositorio CTranslate2: no disponible en la información proporcionada
