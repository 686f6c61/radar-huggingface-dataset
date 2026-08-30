# vanishingMonk/indictrans2-en-kn-ft-cleaned

## Resumen

El modelo `vanishingMonk/indictrans2-en-kn-ft-cleaned` es un ajuste fino (fine-tuning) del modelo multilingüe de traducción automática neuronal IndicTrans2 de AI4Bharat, concretamente de la variante `ai4bharat/indictrans2-en-indic-1B`, especializado en el par de idiomas inglés–kannada. El autor, vanishingMonk, ha desarrollado un flujo de entrenamiento que parte de un conjunto de datos paralelos en inglés y kannada, lo limpia rigurosamente y lo utiliza para ajustar el modelo base con el objetivo de mejorar la calidad de traducción para este par concreto.

El modelo resultante tiene 1.115.543.552 parámetros y se distribuye en formato safetensors. Aunque no se especifica la licencia, el modelo base IndicTrans2 es de código abierto y el autor ha publicado el código de entrenamiento en el repositorio. La relevancia actual radica en que el kannada es una lengua con menos recursos que el inglés o el hindi, y este trabajo demuestra cómo un ajuste fino con datos limpios puede acercarse al rendimiento del modelo base, aunque sin superarlo en las métricas reportadas.

La ficha se basa en la información proporcionada por el autor en la model card y en los datos disponibles en Hugging Face. No se dispone de información adicional sobre el contexto, la licencia o los idiomas más allá de lo indicado.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer (modelo NMT multilingüe IndicTrans2) |
| Parametros totales | 1.115.543.552 |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | inglés (eng_Latn) y kannada (kan_Knda) |
| Licencia | no disponible (el modelo base IndicTrans2 es de código abierto, pero esta adaptación no declara licencia) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo base `ai4bharat/indictrans2-en-indic-1B` es un transformer encoder-decoder de 1.000 millones de parámetros entrenado para traducción entre inglés y 22 lenguas indias programadas. El ajuste fino se realizó sobre este modelo utilizando el toolkit IndicTransToolkit y Hugging Face Transformers. El proceso de entrenamiento se describe en la model card: se partió de un conjunto de 800.000 pares paralelos en bruto, que tras un proceso de limpieza (normalización Unicode, eliminación de pares con scripts incorrectos, filtrado de duplicados, eliminación de fugas de validación/test, y control de ratios de longitud) se redujo a 595.149 pares limpios.

El entrenamiento se ejecutó durante una sola época con una tasa de aprendizaje de 2e-5, tamaño de lote 16, acumulación de gradientes en 4 pasos, precisión BF16, weight decay 0.01, warmup ratio 0.05, gradiente clipping en 1.0 y dropout de atención de 0.1. Se utilizó gradient checkpointing y selección del mejor checkpoint por pérdida de validación. El entrenamiento completó 9.300 pasos de optimización en aproximadamente 59 minutos en una GPU H100, con una pérdida final de entrenamiento de 0.3041 y una pérdida de validación de 0.2345 en el paso 9.000.

No se menciona el uso de RLHF, DPO ni otras técnicas de alineación; se trata de un ajuste fino supervisado estándar. Tampoco se indica la composición exacta del dataset de entrenamiento más allá de los pares en inglés y kannada.

## Capacidades

- Traducción automática neuronal de inglés a kannada, con soporte para frases completas y estructuras gramaticales complejas.
- Generación de texto en kannada a partir de entradas en inglés, con manejo de vocabulario nativo y préstamos lingüísticos.
- Capacidad de procesar texto con normalización Unicode y limpieza de espacios, lo que facilita su integración en pipelines de texto real.
- El modelo base IndicTrans2 soporta las 22 lenguas indias programadas, pero este ajuste fino se centra exclusivamente en el par inglés–kannada; no se garantiza el rendimiento en otros idiomas.
- No se reportan capacidades de tool calling, agentes, razonamiento multi-paso ni otras funciones más allá de la traducción.
- No se indica soporte para modos de pensamiento, visión o audio.

## Casos de uso

- Traducción de documentos técnicos y legales: el modelo puede traducir manuales, contratos o informes del inglés al kannada, manteniendo la coherencia terminológica gracias a su entrenamiento en pares paralelos.
- Localización de software y aplicaciones: se puede integrar en flujos de internacionalización para traducir cadenas de interfaz de usuario, mensajes de error y documentación de ayuda.
- Atención al cliente bilingüe: un sistema de soporte puede usar el modelo para traducir consultas de clientes en inglés a kannada y viceversa, permitiendo que agentes que no hablan kannada atiendan a usuarios de esa lengua.
- Subtitulado y transcripción: el modelo puede traducir guiones o subtítulos del inglés al kannada, útil para plataformas de vídeo o medios de comunicación.
- Educación y aprendizaje de idiomas: herramientas de aprendizaje pueden ofrecer traducciones instantáneas de frases en inglés a kannada, ayudando a estudiantes a comprender estructuras gramaticales.
- Investigación en lingüística computacional: el modelo sirve como punto de partida para experimentos de adaptación de dominio o para estudiar el comportamiento de las métricas de evaluación en lenguas de bajos recursos.

## Benchmarks y rendimiento

El autor evaluó el modelo sobre un conjunto fijo de 1.000 ejemplos de prueba inglés–kannada, comparando el modelo base, el ajuste fino inicial y dos versiones del ajuste fino con datos limpios. Se utilizaron BLEU y chrF++ (corpus scores de SacreBLEU) y COMET (con `Unbabel/wmt22-comet-da`). Los resultados son los siguientes:

| Modelo | BLEU | chrF++ | COMET |
|---|---|---|---|
| IndicTrans2 base | **80.3726** | **91.3279** | **0.9657** |
| Ajuste fino inicial | 27.1712 | 72.9206 | — |
| Ajuste fino con datos limpios (versión anterior) | 62.5845 | 84.6822 | 0.9522 |
| Ajuste fino con datos limpios (última versión) | 71.7596 | 86.5866 | 0.9579 |

El autor señala que la última versión mejora respecto a la versión anterior en 9.1751 BLEU, 1.9044 chrF++ y 0.0057 COMET, pero sigue siendo inferior al modelo base en 8.6130 BLEU, 4.7413 chrF++ y aproximadamente 0.0078 COMET. Además, documenta limitaciones de las métricas basadas en referencia, mostrando ejemplos donde la traducción del modelo es semánticamente válida pero recibe una puntuación baja por usar sinónimos o variantes léxicas.

## Requisitos de hardware

- El modelo tiene aproximadamente 1.100 millones de parámetros y ocupa unos 4.5 GB en el repositorio (pesos en safetensors). En precisión BF16, la memoria para los pesos sería de unos 2.2 GB, más overhead de activaciones y optimizador durante el entrenamiento.
- Para inferencia, una GPU con al menos 8 GB de VRAM sería suficiente para ejecutar el modelo en BF16 o FP16. Una RTX 3060 o superior puede manejarlo.
- El entrenamiento se realizó en una GPU H100 (80 GB), pero el ajuste fino también podría ejecutarse en GPUs de menor capacidad (por ejemplo, A100, RTX 4090) con técnicas de gradient checkpointing y acumulación de gradientes, aunque con tiempos mayores.
- Para despliegue en producción, se puede usar Hugging Face Transformers, vLLM, TGI o llama.cpp (si se convierte a GGUF). No se reportan latencias específicas.
- No se dispone de datos de throughput para este modelo concreto.

## Comparativa con modelos similares

La comparativa más directa es con el modelo base `ai4bharat/indictrans2-en-indic-1B`, del cual deriva, y con otras versiones del mismo ajuste fino. No se dispone de información sobre otros modelos NMT específicos para inglés–kannada en el contexto de esta ficha.

| Modelo | Parámetros | Contexto | BLEU (en-kn) | COMET | Licencia |
|---|---|---|---|---|---|
| `ai4bharat/indictrans2-en-indic-1B` (base) | ~1.000 M | no disponible | **80.37** | **0.9657** | Código abierto (AI4Bharat) |
| `vanishingMonk/indictrans2-en-kn-ft-cleaned` (última versión) | 1.115 M | no disponible | 71.76 | 0.9579 | no disponible |
| `vanishingMonk/indictrans2-en-kn-ft-cleaned` (versión anterior) | 1.115 M | no disponible | 62.58 | 0.9522 | no disponible |

El modelo base supera al ajuste fino en las métricas reportadas, lo que sugiere que el ajuste fino no ha logrado mejorar el rendimiento sobre el conjunto de prueba utilizado. Sin embargo, el autor argumenta que las métricas basadas en referencias pueden penalizar traducciones válidas con diferente vocabulario, y que el ajuste fino podría tener ventajas en dominios específicos no cubiertos por el conjunto de prueba.

## Limitaciones y advertencias

- El modelo ajustado no supera al modelo base en las métricas BLEU, chrF++ y COMET sobre el conjunto de prueba reportado. Esto indica que el ajuste fino, a pesar de la limpieza de datos, no ha conseguido mejorar la calidad general de traducción respecto al modelo preentrenado.
- Las métricas BLEU y chrF++ son sensibles a la coincidencia superficial con la referencia, y pueden penalizar traducciones correctas que usan sinónimos o variantes léxicas, como se muestra en los ejemplos de la model card.
- El entrenamiento se realizó con un dataset limpio de 595.149 pares, pero no se especifica la procedencia ni el dominio de estos datos. Esto puede introducir sesgos hacia el tipo de texto del dataset.
- No se dispone de información sobre la licencia de esta adaptación concreta. Aunque el modelo base es de código abierto, el autor no ha declarado licencia para el modelo ajustado, lo que puede limitar su uso comercial sin autorización explícita.
- No se reportan evaluaciones de seguridad, sesgos demográficos o alucinaciones. El modelo puede producir traducciones incorrectas en contextos ambiguos o con terminología especializada.
- El contexto máximo de entrada no está documentado. Se recomienda verificar el comportamiento con secuencias largas antes de usarlo en producción.
- El modelo solo cubre el par inglés–kannada; no se garantiza rendimiento para otros idiomas, aunque el modelo base sea multilingüe.

## Enlaces

- Página del modelo en Hugging Face: https://huggingface.co/vanishingMonk/indictrans2-en-kn-ft-cleaned
- Modelo base IndicTrans2 (en-indic 1B): https://huggingface.co/ai4bharat/indictrans2-en-indic-1B
- Repositorio oficial de IndicTrans2 en GitHub: https://github.com/AI4Bharat/IndicTrans2
- Página de AI4Bharat sobre IndicTrans2: https://ai4bharat.iitm.ac.in/areas/model/NMT/IndicTrans2/
- Modelo IndicTrans2 indic-indic 1B (variante relacionada): https://huggingface.co/ai4bharat/indictrans2-indic-indic-1B
