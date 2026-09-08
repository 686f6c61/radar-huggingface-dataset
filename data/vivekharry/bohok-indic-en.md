# vivekharry/bohok-indic-en

## Resumen

El modelo `vivekharry/bohok-indic-en` es un sistema de traducción automática neuronal (NMT) que convierte texto en kokborok, bengalí y maratí al inglés. Desarrollado por Vivek Das (`vivekharry`), es un ajuste fino del modelo Marian MT de Helsinki-NLP (`Helsinki-NLP/opus-mt-mul-en`) realizado en una sola época sobre CPU, lo que lo convierte en un experimento accesible para comunidades con recursos limitados. El modelo tiene 77 millones de parámetros y está pensado para la traducción de frases cortas y textos de dominio general, con especial atención a la lengua kokborok, un idioma de baja disponibilidad de recursos. Su relevancia radica en ofrecer un checkpoint real y utilizable para traducir desde tres lenguas índicas al inglés, con una licencia MIT que permite su uso comercial y académico.

El modelo se basa en la arquitectura encoder-decoder de MarianMT, optimizada para traducción multilingüe. El tokenizador incorpora tres tokens especiales (`>>trp<<`, `>>bn<<`, `>>mr<<`) que deben anteponerse al texto de origen para indicar el idioma. El entrenamiento se realizó sobre un conjunto de 32.657 pares de frases, incluyendo ~10.000 pares de kokborok procedentes de SMOL sentences y GATITOS, y 12.000 pares de bengalí y maratí de OPUS-100. La pérdida de entrenamiento final fue de 2,49 y la de evaluación de 2,05. El modelo no es un traductor universal: su dirección es únicamente hacia inglés y su rendimiento en kokborok es inferior al de bengalí y maratí.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Marian MT (transformer encoder-decoder) |
| Parametros totales | 77.060.271 |
| Parametros activos | No aplica (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | Kokborok (trp), bengalí (bn), maratí (mr), inglés (en) |
| Licencia | MIT |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

MarianMT es una arquitectura transformer encoder-decoder optimizada para traducción. El modelo base `Helsinki-NLP/opus-mt-mul-en` fue ajustado con un solo epoch en CPU. Los datos de entrenamiento consisten en 32.657 pares: kokborok (~10k, de SMOL sentences, GATITOS y SMOL-doc), bengalí (12k, de OPUS-100 bn-en) y maratí (12k, de OPUS-100 en-mr). Se reservó un 4% de los datos para validación (unas 1.360 frases). El proceso duró 42 minutos y 4.083 pasos, con pérdida de entrenamiento 2,49 y de validación 2,05. No se aplicó RLHF ni DPO. La innovación técnica principal es el uso de prefijos de idioma y el ajuste eficiente en CPU para lenguas de baja disponibilidad.

## Capacidades

- Traducción de texto de kokborok, bengalí y maratí al inglés.
- Requiere anteponer el prefijo de idioma (`>>trp<<`, `>>bn<<`, `>>mr<<`) al texto fuente.
- Funciona con frases cortas y de dominio general; no está diseñado para texto literario extenso.
- No soporta tool calling, agentes ni razonamiento multi-paso.
- No tiene capacidades de visión ni audio.
- Soporte multilingüe limitado a tres lenguas de origen hacia inglés.
- El tokenizer añade tokens especiales; el ejemplo de uso emplea `max_length=128` para truncar.

## Casos de uso

- Preservación y documentación de la lengua kokborok: investigadores pueden traducir frases kokborok al inglés para crear corpus bilingües, aunque la cobertura es limitada.
- Traducción de contenido bengalí para acceso a información: con 12k pares de OPUS-100, el modelo puede traducir noticias o textos cortos del bengalí al inglés.
- Traducción de contenido maratí para turismo o negocios: útil para traducir menús, indicaciones o mensajes cortos del maratí al inglés.
- Preprocesado en pipelines de NLP: convertir corpus en bengalí o maratí a inglés para alimentar modelos posteriores de análisis o clasificación.
- Asistente de traducción en aplicaciones de chat: el modelo se puede integrar en una interfaz que añada automáticamente el prefijo de idioma, como hace el Space de Tripura ST Lab.
- Demo educativa de NMT de bajo presupuesto: sirve como ejemplo de fine-tuning de MarianMT en CPU, accesible para estudiantes de lingüística computacional.
- Traducción de subtítulos o textos cortos en plataformas multimedia: dada su ventana de 128 tokens, es adecuado para frases sueltas, no párrafos largos.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la información disponible. El autor solo reporta pérdidas de entrenamiento y validación (2,49 y 2,05), sin comparaciones con otros modelos.

## Requisitos de hardware

- VRAM estimada: el modelo tiene 77M parámetros; en fp32 ocupa ~308 MB, por lo que requiere menos de 1 GB de VRAM para inferencia.
- GPU recomendadas: no requiere GPU; se puede ejecutar en CPU. Si se usa GPU, cualquier modelo moderno (RTX 3060, A100, H100) es más que suficiente.
- Cabe en consumer GPU: sí, en cualquier GPU con al menos 1 GB de VRAM.
- Opciones de despliegue: Hugging Face Transformers, pipelines de `text2text-generation` y endpoints compatibles. No es compatible con llama.cpp ni Ollama por ser un modelo Marian (seq2seq).
- Latencia y throughput estimados: no disponible. El autor reporta 42 minutos para 4.083 pasos en CPU, lo que da una idea del coste de entrenamiento, no de inferencia.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| bohok-indic-en | 77M | no disponible | trp, bn, mr, en | MIT | HuggingFace |
| Helsinki-NLP/opus-mt-mul-en | no disponible | no disponible | multilingüe (muchos a en) | no disponible | HuggingFace |
| IndicTrans2 | no disponible | no disponible | 22 idiomas indic | no disponible | GitHub/HuggingFace |

IndicTrans2 es una alternativa de mayor alcance para las lenguas índicas, pero no es comparable en tamaño ni en enfoque: está entrenado con muchos más datos y cubre 22 idiomas. El modelo base de Helsinki-NLP es la referencia directa, ya que bohok-indic-en es un ajuste fino de este.

## Limitaciones y advertencias

- Entrenado solo una época en CPU con ~30k frases; la calidad es limitada.
- El kokborok tiene una cobertura muy reducida; la morfología, el tono y los dialectos no vistos pueden degradar la traducción.
- El modelo solo traduce hacia inglés, no en la dirección inversa.
- No es un traductor universal; falla en textos literarios largos.
- Los prefijos de idioma son obligatorios; sin ellos, el modelo no funciona correctamente.
- El tokenizer trunca a 128 tokens en el ejemplo, por lo que no es adecuado para contextos largos.
- No soporta habla; el autor indica que el reconocimiento de voz debe manejarse con otros modelos (Whisper, MMS).
- Riesgo de alucinación: en modelos pequeños de traducción puede producir salidas incoherentes, especialmente en kokborok.
- Sesgos: no se han documentado, pero al entrenar con datos pequeños y específicos, el modelo puede reflejar sesgos de los corpus (por ejemplo, OPUS-100).
- Licencia MIT permite uso comercial, pero el autor advierte explícitamente que no es Google Translate y no debe usarse como sustituto universal.

## Enlaces

- HuggingFace: https://huggingface.co/vivekharry/bohok-indic-en
- Space Tripura ST Lab: https://huggingface.co/spaces/vivekharry/tripura-st-lab-site
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-mul-en
- Dataset OPUS-100: https://huggingface.co/datasets/Helsinki-NLP/opus-100
- IndicTrans2 GitHub: https://github.com/ai4bharat/IndicTrans2
