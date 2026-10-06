# VasilisAsim/ast-finetuned-TESS

## Resumen

VasilisAsim/ast-finetuned-TESS es un modelo de clasificación de audio basado en la arquitectura Audio Spectrogram Transformer (AST), publicado en HuggingFace por el usuario VasilisAsim. Se trata de un ajuste fino (fine-tuning) del AST original, orientado a tareas de clasificación de audio, y cuyo nombre sugiere que fue entrenado sobre el conjunto de datos TESS (Toronto Emotional Speech Set). El modelo cuenta con 86.194.183 parámetros y se distribuye en formato safetensors con un peso de repositorio de aproximadamente 0,3 GB.

La relevancia de este modelo radica en que aplica el paradigma de los transformers de visión al dominio del audio: el AST convierte el audio en un espectrograma tipo mel y lo trata como una imagen, procesándolo con un transformer puro sin convoluciones. Esto lo sitúa en la línea de los modelos de clasificación de audio más modernos, aunque en este caso concreto se trata de un modelo de nicho con cero descargas y cero likes en el momento de la consulta.

Es importante advertir que la model card del autor está generada automáticamente y prácticamente vacía: no contiene información sobre desarrollador, financiación, licencia, idiomas, datos de entrenamiento, hiperparámetros ni resultados de evaluación. Por tanto, gran parte de las especificaciones de esta ficha quedan marcadas como "no disponible" y se infieren únicamente a partir de la arquitectura declarada y del nombre del modelo.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Audio Spectrogram Transformer (AST), basada en Vision Transformer (ViT/DeiT) |
| Parametros totales | 86.194.183 |
| Parametros activos | no disponible (no es un modelo MoE) |
| Longitud de contexto | no aplica en el sentido de contexto de texto; entrada de audio convertida a espectrograma mel (AST original: 128 bins mel x 1024 fotogramas) |
| Tipos de cuantizacion | no disponible (pesos en safetensors, probablemente fp32) |
| Idiomas soportados | no disponible (el nombre TESS sugiere audio en ingles, sin confirmar) |
| Licencia | no disponible |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

La arquitectura es un Audio Spectrogram Transformer (AST), descrita en el articulo arXiv:1910.09700 ("AST: Audio Spectrogram Transformer"). El AST es un transformer puro sin convoluciones que traslada el enfoque de los Vision Transformers al audio: la onda de audio se convierte en un espectrograma mel, se divide en parches solapados y cada parche se proyecta en una secuencia de embeddings que se procesa con un transformer estandar. El modelo base del que deriva este ajuste tiene aproximadamente 87 millones de parametros, lo que concuerda con los 86,19 millones declarados en los metadatos del repositorio.

No se dispone de informacion sobre el procedimiento de entrenamiento, el numero de tokens o ejemplos utilizados, la composicion del dataset, ni si hubo tecnicas de ajuste como RLHF o DPO (poco habituales en clasificacion de audio). El nombre del modelo, "ast-finetuned-TESS", apunta a un ajuste fino sobre TESS (Toronto Emotional Speech Set), un conjunto de audio en ingles con locuciones emocionales, pero esta afirmacion no esta confirmada en la informacion disponible. No se documentan innovaciones tecnicas adicionales ni detalles de decodificacion especulativa.

## Capacidades

- Clasificacion de audio: el pipeline declarado es audio-classification, por lo que el modelo esta disenado para asignar etiquetas a fragmentos de audio.
- Reconocimiento de emociones en el habla (probable, segun el nombre TESS): permitiria clasificar fragmentos de voz entre distintas categorias emocionales, sin confirmacion documental.
- Procesamiento de espectrogramas mel: la entrada se gestiona como representacion tiempo-frecuencia, lo que lo hace adecuado para tareas de clasificacion acustica.
- No se documenta soporte de tool calling ni function calling.
- No se documenta soporte de agentes ni razonamiento multi-paso.
- No se documentan capacidades multilingues.
- No se documentan capacidades de vision, audio generativo, thinking mode ni otras funciones especiales mas alla de la clasificacion.

## Casos de uso

- Reconocimiento de emociones en centros de atencion telefonica: si la etiqueta TESS se confirma, el modelo podria analizar grabaciones de llamadas y clasificar el estado emocional del interlocutor para priorizar incidencias o detectar insatisfaccion.
- Investigacion en procesamiento de habla: util como linea base para experimentos academicos sobre clasificacion de emociones o comparacion de arquitecturas basadas en transformers de audio.
- Moderacion de contenido en audio: clasificacion de fragmentos para detectar tonos o categorias acusticas concretas en plataformas de contenido.
- Analisis de interacciones en asistentes de voz: deteccion de emociones en comandos de voz para adaptar la respuesta del sistema.
- Prototipado rapido en investigacion academica: su tamano moderado (86 millones de parametros) permite entrenamiento y validacion en un solo GPU, lo que lo hace util como punto de partida para experimentos academicos.
- Sistemas de monitorizacion de bienestar: posible uso en entornos de investigacion para analizar muestras de voz y clasificar patrones emocionales, siempre con las cautelas eticas y de privacidad correspondientes.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM para inferencia en fp32: aproximadamente 350-400 MB solo para los pesos (86,19 millones de parametros x 4 bytes), mas overhead del runtime y de las activaciones.
- VRAM para inferencia en cuantizacion de 8 bits: estimada en torno a 100-150 MB para los pesos, aunque no se confirma que existan pesos cuantizados publicados.
- GPU recomendadas: cualquier GPU con al menos 1-2 GB de VRAM es suficiente; tarjetas como RTX 3060, RTX 4090, A100 o H100 funcionarian sobradamente.
- Cabe en GPU de consumo: si, cabe en practicamente cualquier GPU consumer moderna e incluso en algunos entornos con CPU.
- Opciones de despliegue: al estar basado en transformers, es compatible con el pipeline de HuggingFace Transformers; tambien podria exportarse a ONNX. No se confirma compatibilidad con vLLM, llama.cpp, Ollama o TGI (estas herramientas estan orientadas a modelos de lenguaje y no a clasificacion de audio).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tarea | Contexto/entrada | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| VasilisAsim/ast-finetuned-TESS | 86,19 M | Clasificacion de audio | Espectrograma mel | no disponible | HuggingFace (0 descargas) |
| MIT/ast-finetuned-audioset-10-10-0.4593 | ~87 M | Clasificacion de audio (AudioSet) | Espectrograma mel | BSD-3 (segun ficha habitual del modelo base) | HuggingFace (muy usado) |
| Modelos Wav2Vec2 / HuBERT fine-tuned | 90-300 M | Clasificacion / reconocimiento de habla | Audio crudo | variable | HuggingFace |

La comparacion directa con el AST base de MIT es la mas pertinente, dado que comparten arquitectura; el modelo de VasilisAsim seria un ajuste fino derivado. No se dispone de datos de rendimiento para comparar numericamente.

## Limitaciones y advertencias

- Sesgos conocidos: no disponible; al no haber documentacion sobre el dataset de entrenamiento, no se pueden evaluar sesgos de genero, acento, edad o idioma.
- Riesgo de alucinacion: aunque en clasificacion de audio el termino no aplica igual que en generacion de texto, existe riesgo de clasificaciones erroneas si el audio de entrada difiere del dominio de entrenamiento.
- Limitaciones de contexto e idioma: el modelo parece estar ajustado sobre un dataset concreto (probablemente TESS, en ingles), por lo que su capacidad de generalizacion a otros idiomas o dominios acusticos es incierta.
- Licencia: no disponible. No se puede confirmar si permite uso comercial, lo que supone un riesgo relevante para su adopcion en produccion.
- Modelo de nicho con cero descargas y cero likes: no hay evidencia de validacion por parte de la comunidad ni de mantenimiento posterior a su publicacion.
- Model card practicamente vacia: no hay informacion sobre datos de entrenamiento, hiperparametros, evaluacion ni infraestructura, lo que dificulta la reproducibilidad.
- Fecha de creacion poco habitual (2026-10-05 segun los metadatos): conviene verificar la integridad y procedencia del repositorio antes de utilizarlo.

## Enlaces

- HuggingFace: https://huggingface.co/VasilisAsim/ast-finetuned-TESS
- Paper de la arquitectura AST: https://arxiv.org/abs/1910.09700
- Repositorio de referencia del AST (Audio Spectrogram Transformer): https://github.com/YuanGongND/ast
- Modelo base AST de MIT en HuggingFace: https://huggingface.co/MIT/ast-finetuned-audioset-10-10-0.4593
- Conjunto de datos TESS (Toronto Emotional Speech Set): https://tspace.library.utoronto.ca/handle/1807/24487
