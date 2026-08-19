# Toadoum/naija-tts

## Resumen

Naija TTS es un modelo de síntesis de voz multilingüe desarrollado por Toadoum (Sakayo Toadoum Sari), investigador del CRIL-CNRS y lead NLP engineer en PlotWeaver, especializado en procesamiento de lenguaje para lenguas africanas. Se trata de un fine-tuning con LoRA del modelo Chatterbox Multilingual de ResembleAI, que amplía la cobertura lingüística del modelo base con cuatro lenguas nigerianas: hausa, yoruba, igbo e inglés nigeriano. El modelo base de Chatterbox incluye 23 idiomas, de los cuales el suajili es el único africano; este fine-tuning añade las cuatro lenguas mencionadas, manteniendo el inglés nigeriano bajo la etiqueta `en-ng` para no interferir con el inglés estándar del modelo base.

El modelo está diseñado para síntesis de voz con clonación de voz zero-shot, es decir, puede generar habla en la voz de un hablante de referencia a partir de una muestra de audio corta, sin necesidad de entrenamiento adicional. El repositorio ocupa 3.2 GB y la licencia es MIT, lo que permite uso comercial sin restricciones significativas. La relevancia de este modelo radica en que aborda la escasez de sistemas TTS de calidad para lenguas africanas de alto uso, que tradicionalmente han estado infrarrepresentadas en los modelos de voz comerciales y académicos.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Chatterbox Multilingual TTS (transformer, fine-tuning LoRA) |
| Parametros totales | no disponible |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (TTS, no aplica contexto textual largo) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | hausa (`ha`), yoruba (`yo`), igbo (`ig`), ingles nigeriano (`en-ng`) |
| Licencia | MIT |
| Formato de pesos | Chatterbox (libreria `chatterbox` de ResembleAI) |

## Arquitectura y entrenamiento

El modelo se basa en Chatterbox Multilingual de ResembleAI, un sistema TTS de arquitectura transformer que soporta clonacion de voz zero-shot. El fine-tuning se realizo con LoRA (Low-Rank Adaptation), una tecnica de ajuste eficiente que modifica un subconjunto reducido de parametros, lo que permite adaptar el modelo a nuevas lenguas con un coste computacional limitado. Ademas, se extendio el vocabulario de grafemas del modelo base para incluir los caracteres especiales necesarios en hausa, yoruba e igbo, como las marcas tonales combinatorias del yoruba.

El corpus de entrenamiento se limito por lengua para mantener un equilibrio entre las cuatro lenguas, lo que implica que ninguna lengua utilizo todo el volumen de datos disponible. El modelo base Chatterbox ya incorpora un sistema de watermarking de audio de Resemble (marca de agua de Perth), que se hereda en los outputs de este fine-tuning. No se menciona el uso de tecnicas de alineacion como RLHF o DPO; el entrenamiento se centra en el ajuste supervisado sobre datos de habla de las cuatro lenguas.

## Capacidades

- Sintesis de voz multilingue en hausa, yoruba, igbo e ingles nigeriano.
- Clonacion de voz zero-shot: genera habla en la voz de un hablante de referencia a partir de una muestra de audio corta.
- Extension del vocabulario de grafemas para caracteres especiales de las lenguas nigerianas, incluidas las marcas tonales del yoruba.
- Soporte de etiqueta `en-ng` para ingles nigeriano, sin interferir con el ingles estandar del modelo base.
- Normalizacion de texto a Unicode NFC, preservando los caracteres especiales tal como se escriben.
- Capacidad multilingue dentro de un unico modelo, sin necesidad de cargar modelos separados por idioma.

## Casos de uso

- Locucion para medios de comunicacion: generar voz en off en hausa, yoruba o igbo para radio, television o contenido digital, con voces que suenen naturales y en el idioma local de la audiencia.
- Audiobooks y contenido educativo: convertir libros de texto o material educativo a audio en lenguas nigerianas, facilitando el acceso a la lectura para poblaciones con baja alfabetizacion o para aprendizaje auditivo.
- Atencion al cliente automatizada: integrar el modelo en sistemas IVR o chatbots de voz para empresas que operan en Nigeria, permitiendo interacciones en la lengua del usuario en lugar de forzar el ingles.
- Asistentes de voz para dispositivos moviles: dotar a asistentes virtuales de la capacidad de hablar y entender lenguas nigerianas, mejorando la accesibilidad de la tecnologia para hablantes de estas lenguas.
- Doblaje y localizacion de contenido: traducir y doblar contenido audiovisual (series, documentales, anuncios) a lenguas nigerianas con voces sinteticas, reduciendo costes frente a actores de voz humanos.
- Preservacion linguistica: generar material de audio en lenguas con menos recursos digitales, contribuyendo a su documentacion y difusion en formato hablado.

## Benchmarks y rendimiento

La model card del autor incluye una evaluacion con 40 muestras por lengua, medida con CER (Character Error Rate), WER (Word Error Rate) y RTF (Real-Time Factor). El CER se compara contra un "suelo" (floor) que corresponde a la tasa de error del propio sistema de reconocimiento de voz MMS-ASR sobre grabaciones reales de esa lengua. Un CER en el suelo indica que el habla sintetizada es tan inteligible como el habla real.

| Lengua | n | CER | CER floor | WER | RTF |
|---|---|---|---|---|---|
| Hausa (`ha`) | 40 | 8.83 % | 4.87 % | 32.35 % | 0.680 |
| Yoruba (`yo`) | 40 | 45.02 % | 12.13 % | 77.73 % | 1.065 |
| Igbo (`ig`) | 40 | 14.87 % | 8.41 % | 42.57 % | 0.840 |
| Ingles nigeriano (`en-ng`) | 40 | 12.27 % | 13.09 % | 31.44 % | 0.932 |

El autor advierte que la comparacion de CER entre lenguas no es significativa; cada valor debe leerse contra su propio suelo. El yoruba presenta el CER mas alto (45.02 %), muy por encima de su suelo (12.13 %), lo que indica una inteligibilidad notablemente peor que el habla real. El ingles nigeriano tiene un CER (12.27 %) ligeramente por debajo de su suelo (13.09 %), lo que sugiere una inteligibilidad comparable a la del habla real. El RTF indica que la generacion es mas lenta que en tiempo real en todos los casos, siendo el yoruba el mas lento (1.065).

## Requisitos de hardware

- Tamano del repositorio: 3.2 GB, lo que sugiere que el modelo completo cabe en VRAM de GPUs consumer de gama media-alta.
- RTF entre 0.680 y 1.065 en la evaluacion del autor, lo que indica que la generacion no es en tiempo real en el hardware utilizado; se requiere una GPU para inferencia practica.
- No se especifica la VRAM minima ni las GPUs de referencia en la informacion disponible.
- Opciones de despliegue: el modelo se usa a traves de la libreria `chatterbox` de ResembleAI, con carga local desde el repositorio (`ChatterboxMultilingualTTS.from_local`). No se menciona soporte para vLLM, llama.cpp, Ollama ni TGI, que son herramientas para modelos de lenguaje, no para TTS.
- Para uso en produccion, se recomienda una GPU con al menos 8 GB de VRAM para inferencia comoda, aunque el dato exacto no esta disponible.

## Comparativa con modelos similares

| Modelo | Lenguas | Clonacion zero-shot | Licencia | Tamano |
|---|---|---|---|---|
| Naija TTS (este modelo) | ha, yo, ig, en-ng | Si | MIT | 3.2 GB |
| Chatterbox Multilingual (base) | 23 lenguas (incl. suajili) | Si | MIT | no disponible |
| YarnGPT | Lenguas nigerianas | no disponible | propietaria | no disponible |

Naija TTS se diferencia del modelo base Chatterbox por anadir cuatro lenguas nigerianas que el base no cubre. Frente a alternativas comerciales como YarnGPT, la principal ventaja es la licencia MIT, que permite uso comercial sin restricciones y la posibilidad de autoalojar el modelo. La comparacion directa de calidad con YarnGPT no es posible con los datos disponibles, ya que no se publican benchmarks comparativos.

## Limitaciones y advertencias

- El tono del hausa no se modela: la ortografia Boko no marca tono ni longitud vocalica, por lo que un modelo basado en caracteres no tiene informacion para reproducirlos. El yoruba y el igbo, que escriben el tono con diacriticos, no tienen esta limitacion.
- Las frases largas pueden truncarse, ya que Chatterbox fuerza el fin de secuencia en colas largas de audio.
- El corpus de entrenamiento se limito por lengua para mantener equilibrio, por lo que ninguna lengua uso todo el volumen de datos disponible; esto puede afectar a la calidad en lenguas con mas datos potenciales.
- Los outputs llevan la marca de agua de Perth de Resemble, heredada del modelo base. Esto puede ser un problema si se requiere audio sin marcas de agua.
- El yoruba muestra una inteligibilidad significativamente peor que el habla real (CER 45.02 % frente a un suelo de 12.13 %), lo que limita su uso en aplicaciones donde la precision fonetica sea critica.
- No se proporcionan datos sobre sesgos, alucinaciones o comportamiento en dominios especificos; al ser un modelo TTS, los riesgos de sesgo se limitan a la calidad de pronunciacion y a la representatividad de las voces del corpus.

## Enlaces

- Repositorio HuggingFace: https://huggingface.co/Toadoum/naija-tts
- Pagina personal del autor: https://toadoum.github.io/
- Datasets del autor en HuggingFace: https://huggingface.co/Toadoum/datasets
- NCAIR1/N-ATLaS (proyecto relacionado de IA para lenguas africanas): https://huggingface.co/NCAIR1/N-ATLaS
- YarnGPT (alternativa comercial de TTS nigeriano): https://www.yarngpt.ai/
