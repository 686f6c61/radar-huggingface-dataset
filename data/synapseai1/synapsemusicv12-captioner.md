# SYNAPSEai1/SynapseMusicV12-Captioner

## Resumen

SynapseMusicV12-Captioner es un modelo de "captioning" musical publicado por el usuario SYNAPSEai1 en HuggingFace. Segun su model card, se trata del modelo de anotacion utilizado por ACE-Step v1.5 para etiquetar datos de entrenamiento, y su funcion es generar descripciones estructuradas y detalladas de contenido de audio: genero y subgenero, instrumentacion, estructura de la pieza, timbre y caracter sonoro. El repositorio tiene 0 descargas y 1 "like", por lo que es un artefacto practicamente sin adopcion publica en el momento de redactar esta ficha.

Tecnicamente se apoya en la familia Qwen2.5-Omni (etiqueta `qwen2_5_omni` y libreria `transformers`), con pesos en safetensors que suman 10.732.225.408 parametros (unos 10,7 mil millones) y un repositorio de 22,4 GB, coherente con pesos en bf16/fp16. El autor indica que el uso es identico al de Qwen2.5 Omni-7B, aunque existe una discrepancia entre ese "7B" de la model card y los 10,7 B declarados en los safetensors.

Su relevancia actual es limitada pero concreta: los modelos de captioning musical de alta calidad son un cuello de botella habitual en los pipelines de generacion de musica texto-a-audio, porque determinan la calidad de los pares audio-descripcion usados para entrenar. El autor afirma que supera a Gemini Pro 2.5 en tareas de descripcion musical, si bien no se aportan numeros, conjuntos de evaluacion ni metodologia que respalden esa afirmacion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer multimodal de la familia Qwen2.5-Omni (etiqueta `qwen2_5_omni`); detalles de capas, encoders y configuracion no disponibles |
| Parametros totales | 10.732.225.408 (aproximadamente 10,7 B), segun metadatos de safetensors |
| Parametros activos | No aplica (no se indica que sea un modelo MoE) |
| Longitud de contexto | No disponible |
| Tipos de cuantizacion | No disponible; el repositorio solo contiene pesos en safetensors (formato bf16/fp16 habitual, no confirmado) |
| Idiomas soportados | No disponible |
| Licencia | MIT |
| Formato de pesos | safetensors (22,4 GB en el repositorio) |

Nota: el `pipeline` declarado en HuggingFace es `text-to-audio`, pero la model card describe un modelo de audio-a-texto (entrada de audio, salida de descripcion textual). La etiqueta de pipeline parece incorrecta o heredada de la familia base.

## Arquitectura y entrenamiento

La informacion disponible es minima. La unica indicacion arquitectonica es la etiqueta `qwen2_5_omni` y la afirmacion del autor de que "el uso es el mismo que Qwen2.5 Omni-7B", lo que sugiere que el modelo parte de esa familia multimodal (encoder de audio mas decoder de lenguaje) y ha sido adaptado o afinado para la tarea de anotacion musical. No se especifica si se congelaron modulos, que encoder de audio se emplea, ni la configuracion exacta de capas y dimensiones.

Tampoco hay datos sobre el entrenamiento: no se indica el volumen de tokens, la composicion del dataset, ni si se aplicaron tecnicas de ajuste como SFT, RLHF o DPO. La model card se limita a declarar capacidades de descripcion (mas de 1000 tipos de instrumentos, mas de 1000 terminos descriptivos, analisis de estructura por secciones) y a enlazar un tech report en arXiv (2602.00744) cuya correspondencia exacta con este artefacto no puede verificarse con la informacion proporcionada.

## Capacidades

- Generacion de descripciones musicales en lenguaje natural a partir de audio, con formato libre y vocabulario especializado.
- Analisis de estilo musical: genero, subgenero e influencias (electronic, rock, pop, classical, world, jazz, hip-hop, entre otros).
- Reconocimiento de instrumentacion: el autor declara soporte para mas de 1000 tipos de instrumentos y combinaciones (cuerdas, teclados, percusion, viento, sintetizadores).
- Analisis de estructura y progresion: intro, verso, pre-estribillo, estribillo, bridge, break, build-up, drop, climax, interludio, solo y outro.
- Descripcion de timbre y textura: calidez, brillo, espacio, reverberacion, dinamica y caracter (etereo, crudo, pulido, organico, sintetico).
- Entrada multimodal de audio mediante una plantilla de prompt concreta (`*Task* Describe this audio in detail` seguido del bloque `<audio>`).
- Tool calling, function calling, capacidades de agente, vision, audio de salida y modo de razonamiento explicito: no disponibles / no documentados.
- Capacidades multilingues: no disponibles (el unico ejemplo de salida documentado esta en ingles).

## Casos de uso

- Etiquetado de datasets para entrenamiento de modelos de generacion musical: el modelo genera descripciones largas y estructuradas que pueden usarse como condicionamiento de texto en modelos texto-a-audio, exactamente el uso que declara el autor en ACE-Step v1.5.
- Recuperacion de informacion musical (MIR): convertir audio en metadatos textuales buscables para indexar catalogos y permitir consultas semanticas del tipo "folk indie con guitarra acustica fingerpicked y crescendo orquestal".
- Catalogacion y gestion de bibliotecas de produccion musical: generacion automatica de fichas descriptivas para librerias de sincronizacion, bancos de musica de stock o archivos de emisoras.
- Moderacion y clasificacion de contenido de audio: filtrado y categorizacion de grandes volumenes de audio por genero, instrumentacion y caracter sonoro antes de su publicacion.
- Educacion musical y analisis asistido: generacion de analisis estructurales y timbricos que sirvan como material de estudio o como borrador para profesores y estudiantes.
- Documentacion de diseno sonoro en produccion de audio: descripcion sistematica de elementos de sound design para notas de sesion, documentacion de proyecto o traspaso entre equipos.
- Preprocesado de pipelines de aumento de datos: generacion de multiples descripciones para una misma pista, utiles como variaciones de prompt en entrenamiento y evaluacion de modelos generativos de musica.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks numericos en la informacion disponible. La model card incluye una unica afirmacion cualitativa del autor: "Accuracy surpasses Gemini Pro 2.5 in music description tasks". No se acompaña de conjunto de evaluacion, metrica, tamaño de muestra ni metodologia, por lo que no puede considerarse evidencia verificable y no se reproduce aqui como resultado cuantitativo.

## Requisitos de hardware

- VRAM estimada en bf16/fp16: del orden de 21,5 GB solo para pesos, mas overhead de activaciones y cache de atencion, lo que situa el requisito practico en torno a 24-32 GB.
- VRAM estimada en int8: aproximadamente 11-12 GB de pesos, con overhead adicional.
- VRAM estimada en int4: aproximadamente 6-8 GB de pesos; el repositorio no distribuye pesos precuantizados, por lo que habria que cuantizarlo por cuenta propia.
- GPU recomendadas: A100 40/80 GB, H100 y L40S para despliegue en bf16; RTX 4090 o RTX 3090 (24 GB) quedan al limite en bf16 y son viables en int8.
- GPU de consumo: si cabe en RTX 4090, RTX 3090 y, con cuantizacion agresiva, en GPU de 12-16 GB como RTX 4070 Ti o RTX 4080; no se recomienda intentar fp16 en GPU de 16 GB o menos.
- Opciones de despliegue: la libreria declarada es `transformers`; la etiqueta `endpoints_compatible` sugiere compatibilidad con Inference Endpoints de HuggingFace. La compatibilidad con vLLM, TGI, llama.cpp u Ollama no esta documentada, y al no existir versiones GGUF, llama.cpp y Ollama requeririan conversion manual.
- Latencia y throughput: no disponibles. Dependeran en gran medida de la longitud del audio de entrada, que no se especifica.

## Comparativa con modelos similares

Los datos de las alternativas proceden de su documentacion publica general y no han sido verificados en esta busqueda; se marcan como referencia externa.

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| SynapseMusicV12-Captioner | 10,7 B (safetensors) | No disponible | MIT | HuggingFace, 0 descargas, 1 like |
| Qwen2.5-Omni-7B | ~7 B (referencia externa) | No verificado | Apache-2.0 (referencia externa) | HuggingFace, ampliamente usado |
| Qwen2-Audio-7B-Instruct | ~8,2 B (referencia externa) | No verificado | Apache-2.0 (referencia externa) | HuggingFace |
| Gemini Pro 2.5 | No disponible (propietario) | No disponible | Propietaria | API de Google |

La comparacion con Gemini Pro 2.5 solo puede hacerse sobre la afirmacion cualitativa del autor, sin datos publicados. Frente a los modelos abiertos de audio, la diferencia principal de este artefacto es su especializacion en captioning musical y su licencia MIT, a cambio de una ausencia total de documentacion de rendimiento y de adopcion.

## Limitaciones y advertencias

- Sin benchmarks verificables: la unica afirmacion de rendimiento es cualitativa y no aporta numeros, conjuntos de evaluacion ni comparaciones reproducibles.
- Discrepancia de parametros: la model card describe el uso como el de "Qwen2.5 Omni-7B", pero los safetensors declaran 10,7 B de parametros. Conviene verificar la configuracion real antes de dimensionar hardware.
- Etiqueta de pipeline incoherente: figura como `text-to-audio` cuando el comportamiento descrito es de audio-a-texto, lo que puede provocar errores en pipelines automaticos que confien en ese metadato.
- Adopcion practicamente nula: 0 descargas y 1 "like", sin discusion, issues ni validacion por parte de terceros. No hay garantia de mantenimiento ni de soporte.
- Idiomas no declarados: la unica salida de ejemplo esta en ingles; se desconoce si genera descripciones en castellano o en otros idiomas.
- Riesgo de alucinacion: al ser un modelo generativo de descripciones, puede inventar instrumentos, secciones o caracteristicas sonoras que no estan presentes en el audio, especialmente en grabaciones ruidosas o mezclas densas.
- Longitud de contexto y duracion de audio admisibles no documentadas: no se sabe si puede procesar piezas completas o solo fragmentos cortos.
- Licencia MIT declarada en el repositorio, lo que en principio permite uso comercial, pero conviene comprobar la procedencia de los pesos y las condiciones del modelo base del que deriva antes de un despliegue en produccion.
- Nombre inconsistente: el identificador del repositorio es `SynapseMusicV12-Captioner` mientras que la model card se titula "ACE-Step Captioner"; conviene confirmar a que version corresponde el artefacto.
- Sin pesos cuantizados publicados ni soporte documentado en runtimes de inferencia optimizados (vLLM, TGI, llama.cpp, Ollama).

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/SYNAPSEai1/SynapseMusicV12-Captioner
- Tech report citado en la model card: https://arxiv.org/abs/2602.00744
- Modelo base de referencia para el uso: https://huggingface.co/Qwen/Qwen2.5-Omni-7B
- Resultados de busqueda web: no se han encontrado enlaces relevantes al modelo, al paper ni al proyecto ACE-Step v1.5; los resultados devueltos corresponden a canales de Telegram sin relacion con el modelo.
