# Ugiat/madlad400-3b-mt-ast-an-oc_aranes

## Resumen

MADLAD-400-3B-MT para asturiano, aragonés y aranés es un ajuste fino del modelo de traducción automática `google/madlad400-3b-mt` de Google, publicado por Ugiat Technologies. El modelo parte del checkpoint multilingüe de MADLAD-400 (arquitectura T5, 3B parámetros) y lo especializa para traducir hacia y desde tres lenguas románicas minoritarias de la península ibérica: asturiano (`<2ast>`), aragonés (`<2an>`) y aranés, la variedad occitana del Valle de Arán (`<2oc_aranes>`). El modelo base carece de etiqueta para asturiano, su etiqueta `<2an>` a menudo responde en español o genera texto inconexo, y su `<2oc>` produce occitano estándar (languedociense), no aranés; este ajuste corrige esos tres comportamientos.

La relevancia del modelo reside en que aborda lenguas de bajos recursos con corpus paralelos limitados, aprovechando el conocimiento multilingüe del MADLAD-400 original mediante fine-tuning supervisado sobre corpus publicados por el proyecto TAN-IBE (Universitat Oberta de Catalunya) y el corpus ES-OC de Projecte Aina. Mantiene el mismo tamaño y velocidad que el modelo base (3B parámetros, T5 encoder-decoder), y se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

El modelo traduce hacia las tres lenguas desde español, catalán, inglés y francés, y desde ellas hacia esas mismas cuatro lenguas usando las etiquetas del modelo base (`<2es>`, `<2ca>`, `<2en>`, `<2fr>`). Es un trabajo independiente de Ugiat Technologies, no producido ni avalado por el proyecto TAN-IBE, Google ni los autores de MADLAD-400.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | T5 (encoder-decoder transformer) |
| Parametros totales | 2.940.378.112 (3B) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible (T5, sin ventana de contexto definida en la información) |
| Tipos de cuantizacion | int8 (versión CTranslate2 publicada); otras no disponibles |
| Idiomas soportados | ast, an, oc (aranés), es, ca, en, fr, multilingual |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (transformers); CTranslate2 int8 en repo separado |

## Arquitectura y entrenamiento

El modelo es un T5 encoder-decoder de 3B parámetros, heredado directamente de `google/madlad400-3b-mt`. MADLAD-400 se entrenó sobre un corpus multilingüe masivo (MADLAD-400, aproximadamente 3 billones de tokens según el paper asociado, arXiv:2309.04662) y emplea etiquetas de destino del tipo `<2xx>` para indicar la lengua de salida. Este ajuste fino conserva esa interfaz: se antepone la etiqueta de lengua al texto de entrada y el modelo genera la traducción.

El fine-tuning se realizó sobre corpus paralelos específicos: `BSC-LT/Catalan-Aranese_Parallel_Corpus` (para aranés) y `projecte-aina/ES-OC_Parallel_Corpus` (para occitano/aranés), además de datos de `allenai/MADLAD-400`. Se añadieron dos nuevas piezas SentencePiece al tokenizador: `<2oc_aranes>` (id 256000) y `<2ast>` (id 256001), definidas igual que las etiquetas `<2xx>` nativas del modelo base. La etiqueta `<2an>` del modelo base se reentrenó. No se dispone de información sobre número exacto de tokens de entrenamiento, composición detallada del dataset ni si se aplicaron técnicas de RLHF o DPO.

## Capacidades

- Traducción automática hacia asturiano (`<2ast>`), aragonés (`<2an>`) y aranés (`<2oc_aranes>`) desde español, catalán, inglés y francés.
- Traducción desde esas tres lenguas hacia español (`<2es>`), catalán (`<2ca>`), inglés (`<2en>`) y francés (`<2fr>`).
- Mantiene las capacidades multilingües del modelo base para otras lenguas, con una pequeña pérdida de calidad (verificado con FLORES-200 devtest).
- Generación de texto text2text mediante `T5ForConditionalGeneration` con decodificación por beams (ejemplo con `num_beams=4`).
- No se documentan capacidades de tool calling, function calling, agentes, razonamiento multi-paso, visión, audio ni modo thinking.
- Soporte de despliegue vía transformers 4.x y vía CTranslate2 (versión int8 publicada).

## Casos de uso

- Traducción de documentación administrativa al asturiano, aragonés y aranés: el modelo permite generar versiones en estas lenguas de textos oficiales, aprovechando que traduce desde español y catalán, las lenguas de trabajo habituales en las administraciones de Asturias, Aragón y Cataluña.
- Localización de interfaces y contenidos web: integrado en pipelines de CI/CD o en un CMS, el modelo traduce cadenas de texto hacia las tres lenguas minoritarias, con la ventaja de mantener el mismo tamaño y velocidad que el modelo base de 3B.
- Subtitulado y doblaje de contenido audiovisual: traducción de guiones desde inglés, francés, español o catalán hacia asturiano, aragonés o aranés, con decodificación por beams para mejorar la fluidez.
- Preservación y difusión del patrimonio lingüístico: generación de traducciones de material divulgativo, literario o educativo hacia lenguas con pocos recursos, donde los sistemas comerciales suelen fallar o no cubrir la lengua.
- Investigación en traducción automática de bajos recursos: el modelo sirve como baseline y como herramienta de generación de datos sintéticos para aumentar corpus paralelos de asturiano, aragonés y aranés.
- Atención al ciudadano multilingüe: traducción bidireccional en servicios públicos o puntos de información, convirtiendo consultas en aranés o aragonés a español y viceversa, con despliegue en CTranslate2 int8 para reducir requisitos de hardware.
- Traducción inversa para análisis de contenido: traducción de textos en asturiano, aragonés o aranés hacia español, catalán, inglés o francés para su procesamiento posterior en pipelines de NLP que no soportan esas lenguas.

## Benchmarks y rendimiento

La model card menciona una evaluación con FLORES-200 devtest para comprobar el olvido de otras lenguas ("forgetting check"), pero no se proporcionan cifras concretas de BLEU, chrF ni de otros benchmarks en la información disponible.

No se han publicado resultados de benchmarks numéricos en la información disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16/bf16: aproximadamente 6 GB solo para los pesos (3B parámetros × 2 bytes), más overhead de activaciones y KV cache; en la práctica se recomiendan 8-12 GB para secuencias cortas de traducción.
- VRAM estimada en int8 (CTranslate2): aproximadamente 3 GB para los pesos, más overhead; cabe en GPUs consumer de gama media.
- GPUs recomendadas: A100 o H100 para despliegues de alto throughput; RTX 4090, RTX 3090 o RTX A6000 para inferencia en fp16; GPUs con 8 GB o más para int8.
- Cabe en GPU consumer: sí, en tarjetas con al menos 8 GB en fp16 (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, etc.) y en tarjetas con 4-6 GB usando la versión CTranslate2 int8.
- Opciones de despliegue: transformers 4.x (probado con 4.57; transformers 5.x no carga correctamente los checkpoints MADLAD-400), CTranslate2 (versión int8 publicada), text-generation-inference (etiqueta presente en el repo) y endpoints compatibles.
- Latencia y throughput estimados: no disponibles en la información proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas objetivo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Ugiat/madlad400-3b-mt-ast-an-oc_aranes | 3B | no disponible | ast, an, oc-aranes (+ es, ca, en, fr) | Apache 2.0 | HuggingFace |
| google/madlad400-3b-mt | 3B | no disponible | 400+ lenguas (sin ast; `<2an>` deficiente; `<2oc>` estándar) | Apache 2.0 (según modelo base) | HuggingFace |
| NLLB-200 (Meta) | 600M a 54B | no disponible | 200 lenguas (cobertura limitada de ast, an, oc) | CC-BY-NC 4.0 (no comercial) | HuggingFace |

El modelo de Ugiat se diferencia del MADLAD-400 original en la cobertura efectiva de asturiano, aragonés y aranés, y del NLLB-200 en la licencia permisiva (Apache 2.0 frente a CC-BY-NC) y en la especialización explícita en estas tres lenguas. No se dispone de datos de rendimiento comparativo (BLEU/chrF) en la información proporcionada para cuantificar la mejora.

## Limitaciones y advertencias

- Los ejemplos de traducción de la model card no fueron revisados por hablantes nativos; pueden contener errores gramaticales u ortográficos.
- El modelo puede producir texto incoherente o derivar a otra lengua en entradas ambiguas o muy cortas, como ocurría con el modelo base en `<2an>`.
- Riesgo de alucinación y de traducciones literales en frases idiomáticas o dominios especializados no representados en los corpus de ajuste.
- Cobertura limitada a las lenguas declaradas; otras lenguas del modelo base pueden funcionar pero no están probadas y sufren una pequeña pérdida de calidad.
- El aranés se modela con la etiqueta `<2oc_aranes>`; la etiqueta `<2oc>` del modelo base sigue produciendo occitano estándar, lo que puede confundir en integraciones que reutilicen etiquetas antiguas.
- Requiere el tokenizador de este repositorio; el tokenizador del modelo base no conoce `<2ast>` ni `<2oc_aranes>`.
- transformers 5.x no carga correctamente los checkpoints MADLAD-400 (ni este ni el original) y produce resultados erróneos; es obligatorio usar transformers 4.x.
- Licencia Apache 2.0: permite uso comercial, pero el modelo no está avalado por Google, los autores de MADLAD-400 ni el proyecto TAN-IBE, y no debe presentarse como tal.
- No se documentan evaluaciones humanas ni métricas automáticas publicadas, por lo que la calidad en producción debe validarse con hablantes nativos antes de desplegar.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/Ugiat/madlad400-3b-mt-ast-an-oc_aranes
- Versión CTranslate2 int8: https://huggingface.co/Ugiat/madlad400-3b-mt-ast-an-oc_aranes-ct2
- Modelo base: https://huggingface.co/google/madlad400-3b-mt
- Paper de MADLAD-400: https://arxiv.org/abs/2309.04662
- Proyecto TAN-IBE: https://tan-ibe.github.io/
- Corpus catalán-aranés: https://huggingface.co/datasets/BSC-LT/Catalan-Aranese_Parallel_Corpus
- Corpus ES-OC: https://huggingface.co/datasets/projecte-aina/ES-OC_Parallel_Corpus
- Dataset MADLAD-400: https://huggingface.co/datasets/allenai/MADLAD-400
