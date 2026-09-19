# YunusZJ/whisper-base-ar-quran-ONNX

## Resumen

YunusZJ/whisper-base-ar-quran-ONNX es una conversion al formato ONNX del modelo tarteel-ai/whisper-base-ar-quran, un Whisper base ajustado para reconocimiento automatico del habla (ASR) en arabe coranico. El modelo original parte de openai/whisper-base y fue entrenado por Tarteel AI para transcribir recitacion del Coran, un dominio con caracteristicas acusticas y lexicas muy distintas del arabe estandar. Esta version ONNX no aporta nuevos pesos: es una conversion automatica generada con el Space de la comunidad ONNX y publicada bajo licencia Apache 2.0.

La relevancia de esta ficha esta en el formato, no en el modelo en si. Al estar en ONNX, el modelo puede ejecutarse fuera de Python, concretamente en el navegador o en Node.js mediante transformers.js, lo que habilita transcripcion en el cliente sin enviar audio a un servidor. El repositorio ocupa 2,6 GB, coherente con un empaquetado que incluye varias precisiones numericas del mismo grafo.

En cuanto a rendimiento, la model card del modelo original reporta una perdida de validacion de 0,0839 y un WER de 5,7544 en el conjunto de evaluacion tras 5.000 pasos de entrenamiento. No hay benchmarks publicados en el model-index (el array de resultados esta vacio) ni comparativas con otros sistemas de ASR coranico en la informacion disponible. El modelo tiene 0 descargas y 0 likes en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder-decoder (Whisper), con atencion por ventanas de audio |
| Parametros totales | Aproximadamente 74 millones, heredados de openai/whisper-base (dato no explicitado en la model card de esta conversion) |
| Parametros activos | No aplica (modelo denso, no es MoE) |
| Longitud de contexto | Ventanas de audio de 30 segundos, segun la arquitectura Whisper (no declarado en la model card) |
| Tipos de cuantizacion | No disponible. El repositorio ocupa 2,6 GB y la model card no enumera las variantes de precision incluidas |
| Idiomas soportados | No disponible en la model card. Por el modelo base se trata de arabe, concretamente arabe coranico |
| Licencia | apache-2.0 |
| Formato de pesos | ONNX (repositorio listado como transformers.js) |

## Arquitectura y entrenamiento

La arquitectura es la de Whisper base: un transformer encoder-decoder con preprocesado del audio a espectrogramas Mel de 80 canales y ventanas de 30 segundos. El encoder procesa la representacion acustica y el decoder genera tokens de texto de forma autorregresiva. El modelo original fue entrenado por Tarteel AI partiendo de openai/whisper-base, es decir, un ajuste fino sobre pesos multilingues ya preentrenados, no un entrenamiento desde cero.

Los hiperparametros documentados en la model card son: learning rate 0,0001, batch size de entrenamiento 16 por dispositivo con 8 dispositivos (batch total 128), batch de evaluacion 8 por dispositivo (total 64), optimizador Adam con betas (0,9; 0,999) y epsilon 1e-08, scheduler lineal con 500 pasos de warmup, 5.000 pasos de entrenamiento, semilla 42 y precision mixta con Native AMP. El conjunto de datos aparece como "None" en la model card, por lo que la composicion del corpus de entrenamiento no esta disponible. Las versiones de framework declaradas son Transformers 4.26.0.dev0, PyTorch 1.13.0+cu117, Datasets 2.7.1.dev0 y Tokenizers 0.13.2. No se documenta uso de RLHF ni de DPO, algo poco habitual en modelos ASR.

La innovacion tecnica de esta publicacion concreta es exclusivamente el empaquetado ONNX, generado de forma automatica mediante el Space onnx-community/convert-to-onnx, que permite el consumo directo desde transformers.js sin dependencias de PyTorch en tiempo de ejecucion.

## Capacidades

- Reconocimiento automatico del habla (ASR) en arabe coranico: transcripcion de audio a texto.
- Transcripcion de recitacion con posible marcado de marcas de recitacion (tajwid), segun la orientacion del modelo base.
- Ejecucion en navegador y en Node.js a traves de la pipeline `automatic-speech-recognition` de transformers.js.
- Ejecucion en CPU sin GPU gracias al formato ONNX y a las posibles variantes cuantizadas del repositorio.
- Procesamiento de audio en ventanas de 30 segundos, con posibilidad de concatenar ventanas para audios mas largos mediante logica externa.
- No dispone de tool calling ni de function calling.
- No esta disenado para razonamiento multi-paso ni para uso como agente.
- No tiene capacidades de vision ni de generacion de audio.
- No se documentan capacidades multilingues en esta conversion; el ajuste fino restringe el dominio al arabe coranico.

## Casos de uso

- Aplicacion web de transcripcion coranica en el cliente: al estar en ONNX y ser compatible con transformers.js, el audio del usuario puede procesarse integramente en el navegador mediante WebGPU o WASM, sin enviar la grabacion a un servidor y sin coste de inferencia por peticion.
- Herramienta de memorizacion y repaso (hifz): el estudiante recita y el modelo devuelve la transcripcion, que se compara con el texto esperado para localizar errores u omisiones en el versiculo.
- Verificacion de recitacion en plataformas educativas: integracion en un backend Node.js que evalua grabaciones subidas por alumnos y genera puntuaciones de exactitud basadas en la distancia entre la transcripcion y el texto de referencia.
- Indexacion y busqueda de archivos de audio: transcripcion por lotes de grabaciones de clases, sermones o recitaciones para alimentar un indice de texto buscable, con la ventaja de un modelo de 74 millones de parametros que se ejecuta en CPU.
- Generacion de subtitulos para video: produccion de subtitulos con marcas de tiempo para contenido religioso en arabe, mediante procesamiento por ventanas de 30 segundos y alineacion posterior.
- Prototipado y docencia en procesamiento de audio: modelo lo bastante pequeno para experimentar en un portatil, util para ensenar pipelines ASR, espectrogramas Mel y decodificacion seq2seq.
- Despliegue en dispositivos con recursos limitados: al no requerir GPU dedicada, es viable en mini-PC, Raspberry Pi o entornos edge para transcripcion puntual de recitacion.

## Benchmarks y rendimiento

El model-index del repositorio declara el nombre "whisper-base-ar-quran" con un array de resultados vacio, por lo que no hay benchmarks formales publicados en la informacion disponible. Los unicos datos cuantitativos provienen de la tabla de entrenamiento de la model card, que se reproduce a continuacion. Los valores de WER se expresan tal cual aparecen en la model card.

| Training loss | Epoca | Paso | Validation loss | WER |
|:---:|:---:|:---:|:---:|:---:|
| 0,1092 | 0,05 | 250 | 0,1969 | 13,3890 |
| 0,0361 | 0,1 | 500 | 0,1583 | 10,6375 |
| 0,0192 | 0,15 | 750 | 0,1109 | 8,8468 |
| 0,0144 | 0,2 | 1000 | 0,1157 | 7,9754 |
| 0,0080 | 0,25 | 1250 | 0,1000 | 7,5360 |
| 0,0048 | 1,03 | 1500 | 0,0933 | 6,8227 |
| 0,0113 | 1,08 | 1750 | 0,0955 | 6,9638 |
| 0,0209 | 1,13 | 2000 | 0,0824 | 6,3586 |
| 0,0043 | 1,18 | 2250 | 0,0830 | 6,3444 |
| 0,0020 | 1,23 | 2500 | 0,1015 | 6,3025 |
| 0,0013 | 2,01 | 2750 | 0,0863 | 6,0639 |
| 0,0014 | 2,06 | 3000 | 0,0905 | 6,0213 |
| 0,0018 | 2,11 | 3250 | 0,0864 | 6,0293 |
| 0,0008 | 2,16 | 3500 | 0,0887 | 5,9308 |
| 0,0029 | 2,21 | 3750 | 0,0777 | 5,9159 |
| 0,0022 | 2,26 | 4000 | 0,0847 | 5,8749 |
| 0,0005 | 3,05 | 4250 | 0,0827 | 5,8352 |
| 0,0003 | 3,1 | 4500 | 0,0826 | 5,7800 |
| 0,0006 | 3,15 | 4750 | 0,0833 | 5,7625 |
| 0,0003 | 3,2 | 5000 | 0,0839 | 5,7544 |

Resultado final declarado en el conjunto de evaluacion: loss 0,0839 y WER 5,7544. No se especifica el conjunto de evaluacion ni la metodologia de calculo del WER, por lo que la cifra no es directamente comparable con resultados de terceros.

## Requisitos de hardware

- VRAM estimada para inferencia: menos de 1 GB en fp32 para el grafo de 74 millones de parametros, y por debajo de 500 MB en precision reducida. El cuello de botella real es el audio de entrada y el estado del decoder, no los pesos.
- GPU recomendadas: cualquier GPU con soporte de WebGPU o CUDA. El modelo es viable en NVIDIA T4, RTX 3060, RTX 4090, A100 o H100, aunque ninguna de estas unidades es necesaria.
- Compatibilidad con GPU de consumo: si, cabe holgadamente en cualquier GPU de consumo e incluso en graficos integrados. El modelo esta pensado para ejecutarse en CPU.
- Ejecucion en CPU: totalmente viable. Un Whisper base transcribe audio mas rapido que tiempo real en CPUs modernas de escritorio.
- Opciones de despliegue: transformers.js en navegador o Node.js (via WebGPU o WASM), ONNX Runtime en Python, C++, Java o C#, y conversion adicional a otros formatos si se necesita.
- Latencia y throughput: no disponibles. No se han publicado mediciones de latencia, RTF ni throughput en la informacion proporcionada.
- Nota sobre el tamano del repositorio: 2,6 GB, muy superior a los aproximadamente 300 MB que ocupa un Whisper base en fp32. Esto sugiere que el repositorio incluye varias variantes de precision, pero la model card no lo confirma.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| YunusZJ/whisper-base-ar-quran-ONNX | No declarado (hereda Whisper base, ~74 M) | Ventanas de 30 s (arquitectura Whisper) | apache-2.0 | ONNX | HuggingFace, 0 descargas |
| tarteel-ai/whisper-base-ar-quran | No declarado | Ventanas de 30 s | No disponible en la informacion proporcionada | safetensors / PyTorch | HuggingFace, modelo de origen |
| openai/whisper-base | 74 M (dato publico, no en la informacion proporcionada) | Ventanas de 30 s | No disponible en la informacion proporcionada | safetensors / PyTorch | HuggingFace, ampliamente extendido |
| openai/whisper-small | 244 M (dato publico, no en la informacion proporcionada) | Ventanas de 30 s | No disponible en la informacion proporcionada | safetensors / PyTorch | HuggingFace, ampliamente extendido |

No se dispone de datos de benchmarks comparativos entre estos modelos en la informacion proporcionada, por lo que la comparativa se limita a parametros, formato, licencia y disponibilidad. Cualquier afirmacion sobre cual transcribe mejor el arabe coranico requeriria una evaluacion propia.

## Limitaciones y advertencias

- Dominio muy restringido: el ajuste fino esta orientado a recitacion coranica. El rendimiento en arabe coloquial, arabe de noticias u otros idiomas no esta caracterizado y probablemente sea pobre.
- Riesgo de alucinacion: los modelos Whisper tienden a generar texto plausible cuando el audio es ruidoso, inaudible o esta en un idioma fuera de su distribucion. En contexto religioso, una alucinacion puede producir texto con apariencia de versiculo que no corresponde al audio.
- Sesgo de dominio: el corpus de entrenamiento no esta documentado ("None dataset" en la model card), lo que impide evaluar la representatividad de voces, acentos o estilos de recitacion.
- Metrica de evaluacion opaca: el WER de 5,7544 no viene acompanado del conjunto de evaluacion ni de la metodologia, por lo que no es verificable de forma independiente.
- Licencia: Apache 2.0 permite uso comercial, pero conviene revisar las condiciones del modelo base tarteel-ai/whisper-base-ar-quran y del propio openai/whisper-base, ya que el ONNX es una conversion derivada.
- Conversion automatica sin validacion documentada: la model card indica que la conversion se realizo con un Space automatico. No se declara que se hayan verificado las salidas ONNX frente a las de PyTorch, por lo que puede haber divergencias numericas.
- Repositorio sin traccion: 0 descargas y 0 likes. No hay evidencia de uso en produccion ni de mantenimiento posterior a la conversion.
- Idiomas no declarados: la ficha de HuggingFace no lista idiomas soportados, lo que complica la seleccion automatizada del modelo en pipelines.
- Ausencia de soporte de agentes: no hay tool calling ni salida estructurada, por lo que no encaja en arquitecturas agenticas sin capas adicionales.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YunusZJ/whisper-base-ar-quran-ONNX
- Modelo base: https://huggingface.co/tarteel-ai/whisper-base-ar-quran
- Modelo original de OpenAI: https://huggingface.co/openai/whisper-base
- Space de conversion a ONNX: https://huggingface.co/spaces/onnx-community/convert-to-onnx
- Documentacion de la pipeline de ASR en transformers.js: https://huggingface.co/docs/transformers.js/api/pipelines#module_pipelines.AutomaticSpeechRecognitionPipeline
