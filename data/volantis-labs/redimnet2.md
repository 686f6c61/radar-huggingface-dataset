# volantis-labs/redimnet2

## Resumen

ReDimNet2 B3 VoxCeleb2 LM (ONNX) es un export a formato ONNX de un extractor de embeddings de locutor basado en la arquitectura ReDimNet2, en su variante B3, entrenado sobre el corpus VoxCeleb2 y ajustado con una estrategia de *large-margin fine-tuning*. No se trata de un modelo generativo de texto, sino de un modelo de representacion: recibe una senal de audio con la voz de un hablante y devuelve un vector (embedding) que codifica su identidad vocal. La publicacion en HuggingFace la realiza el usuario `volantis-labs`, mientras que la arquitectura y los pesos originales proceden de Palabra.ai, con licencia MIT.

ReDimNet2 es la evolucion del *framework* ReDimNet de remodelado de dimensiones para representaciones de locutor a nivel de enunciado. La innovacion principal descrita en el articulo asociado es la introduccion de *pooling* sobre la dimension temporal dentro de la ruta de procesamiento 1D, lo que preserva la naturaleza del espacio de caracteristicas 1D al tiempo que permite escalar el modelo. Este repositorio concreto contiene unicamente el artefacto de inferencia (un unico archivo ONNX de 18.041.134 bytes, aproximadamente 17,2 MiB), sin tarjeta de modelo detallada ni resultados de evaluacion publicados por el autor del export.

Su relevancia practica esta en el despliegue: al ser un modelo de apenas decenas de megabytes en ONNX, puede ejecutarse en CPU, en dispositivos de borde o en flujos de produccion de baja latencia sin necesidad de GPU, lo que lo hace util como bloque de *embedding* en sistemas de verificacion de locutor, diarizacion o indexado de audio. El repositorio no registra descargas ni valoraciones en el momento de la consulta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | ReDimNet2 (red neuronal convolucional sobre caracteristicas 1D con remodelado de dimensiones y pooling temporal), variante B3 |
| Parametros totales | no disponible |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | no disponible; no aplica en sentido estricto (modelo de embeddings de audio, no autoregresivo) |
| Tipos de cuantizacion | no disponible (solo se publica un artefacto ONNX; se desconoce la precision numerica) |
| Idiomas soportados | no disponible (la model card no declara idiomas; el entrenamiento se realizo sobre VoxCeleb2) |
| Licencia | MIT |
| Formato de pesos | ONNX (`redimnet2_b3_vox2_lm.onnx`) |
| Tamano del artefacto | 18.041.134 bytes (~17,2 MiB) |
| SHA-256 | `579e9a575d65be0280cb8c7ec7b95fde219788aee616ae150937957ac87d731c` |
| Entrada | audio de voz (formato exacto y frecuencia de muestreo no documentados en la informacion disponible) |
| Salida | embedding de locutor (dimension no disponible) |
| Dataset de entrenamiento | VoxCeleb2, con *large-margin fine-tuning* |

## Arquitectura y entrenamiento

ReDimNet2 es una arquitectura para extraccion de representaciones de locutor a nivel de enunciado (*utterance-level speaker representations*) que parte del marco ReDimNet de remodelado de dimensiones. Segun el resumen del articulo asociado, la modificacion clave de ReDimNet2 consiste en la introduccion de *pooling* sobre la dimension temporal dentro de la ruta de procesamiento 1D. Esa operacion mantiene la naturaleza del espacio de caracteristicas 1D, ya que las caracteristicas 1D siguen siendo tales, y permite escalar el modelo sin romper la formulacion original. La variante publicada aqui es la B3, y el sufijo «LM» de la model card indica que se aplico *large-margin fine-tuning* sobre el *checkpoint* entrenado con VoxCeleb2.

Los datos de entrenamiento declarados se limitan a VoxCeleb2, un corpus de audio de habla con identidades de locutor anotadas. No se especifican en la informacion disponible el numero de tokens o de horas exactas utilizadas, la composicion detallada del conjunto (idiomas, dominios, condiciones de grabacion) ni si hubo etapas adicionales de ajuste mas alla del *large-margin fine-tuning*. Tampoco se documentan tecnicas de decodificacion, cuantizacion o compresion asociadas al export ONNX.

Conviene subrayar que este modelo no es un *transformer* generativo ni un modelo de lenguaje: no predice el siguiente token, sino que produce una representacion vectorial discriminativa de la identidad del hablante, optimizada para tareas de comparacion por similitud (por ejemplo, coseno) entre embeddings.

## Capacidades

- Extraccion de embeddings de locutor (*speaker embeddings*) a partir de audio de voz, con representaciones a nivel de enunciado.
- Verificacion de locutor: comparar dos audios y decidir si pertenecen al mismo hablante mediante una metrica de similitud sobre los embeddings.
- Identificacion de locutor (*closed-set*): asignar un audio a la identidad mas cercana de una galeria previamente indexada.
- Componente base para diarizacion: generar embeddings por segmento y agruparlos para segmentar quien habla en cada tramo de una grabacion.
- Indexado y busqueda por voz en archivos de audio, construyendo un indice vectorial de embeddings.
- Ejecucion en ONNX Runtime, lo que habilita despliegue en CPU, dispositivos de borde y entornos sin GPU.
- Soporte de *tool calling* / *function calling*: no, no es un modelo de lenguaje.
- Soporte de agentes y razonamiento multi-paso: no.
- Capacidades multilingues declaradas: no disponibles; el modelo opera sobre caracteristicas acusticas y la model card no documenta cobertura por idioma.
- Capacidades especiales (vision, audio generativo, *thinking mode*): no; la unica modalidad tratada es audio de voz de entrada y embedding como salida.

## Casos de uso

- Control de acceso por voz: extraer el embedding de una frase de acceso y compararlo con el del usuario enrolado usando una distancia coseno con umbral; el tamano reducido del ONNX permite ejecutarlo en el propio dispositivo o en un servidor modesto.
- Diarizacion de reuniones y transcripcion anotada: generar embeddings por ventana de audio y agruparlos para etiquetar turnos de habla, alimentando despues un sistema de reconocimiento de voz que atribuya cada frase a su interlocutor.
- Analitica de centros de contacto: indexar las llamadas por identidad de cliente o agente para auditar conversaciones, medir tiempos de habla y localizar interacciones concretas sin depender de metadatos manuales.
- Indexado y busqueda en archivos de audio (podcasts, archivos de radio, grabaciones de investigacion): construir un indice vectorial de embeddings y recuperar todos los fragmentos de un mismo locutor.
- Verificacion de identidad en procesos de alta o firma remota: como una senal adicional de comprobacion de que el audio de una locucion corresponde a la persona registrada, combinada con otros factores.
- Personalizacion de asistentes de voz multihablante: detectar que usuario esta hablando para cargar su perfil, sus preferencias o su historial de conversacion.
- Preprocesado para pipelines de sintesis de voz o doblaje: agrupar segmentos por hablante para asignar voces coherentes antes de la fase de generacion.
- Monitorizacion de medios (radio, television, streaming): deteccion de apariciones recurrentes de una misma voz a lo largo de horas de contenido, agregando embeddings por similitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

La model card del repositorio no incluye metricas de verificacion de locutor (por ejemplo, EER o minDCF sobre VoxCeleb1-O, VoxCeleb1-E o VoxCeleb1-H), y los resultados de busqueda consultados unicamente proporcionan el resumen del articulo, sin tablas numericas comparativas.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB; el artefacto ocupa 18.041.134 bytes, por lo que el modelo completo cabe holgadamente en memoria de CPU o en la memoria unificada de cualquier dispositivo moderno. La precision numerica del ONNX no esta documentada, de modo que la cifra exacta de memoria en tiempo de ejecucion no puede confirmarse.
- GPU recomendadas: no se requieren. Cualquier GPU de consumo (por ejemplo, RTX 3060, RTX 4090) o incluso una GPU integrada es mas que suficiente; el cuello de botella real sera la extraccion de caracteristicas acusticas previa, no la red.
- Cabe en GPU de consumo: si, en todas las gamas, y tambien en CPU y en hardware de borde.
- Opciones de despliegue: ONNX Runtime (CPU, CUDA, TensorRT, DirectML, CoreML), asi como cualquier *runtime* compatible con ONNX. No se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que no aplican a un modelo de embeddings de audio de este tipo.
- Latencia y throughput estimados: no disponibles. No se publican mediciones de RTF (*real-time factor*), latencia por enunciado ni throughput en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Categoria | Parametros | Licencia | Formato | Disponibilidad |
|---|---|---|---|---|---|
| ReDimNet2 B3 VoxCeleb2 LM (este repositorio) | Embedding de locutor, CNN 1D con pooling temporal | no disponible | MIT | ONNX | Export unico en HuggingFace, 18.041.134 bytes |
| ReDimNet2 (repositorio oficial PalabraAI) | Embedding de locutor, arquitectura completa | no disponible en la informacion consultada | no disponible en la informacion consultada | Pesos originales del framework | GitHub publico |
| ECAPA-TDNN | Embedding de locutor, TDNN con atencion de canal | no disponible en la informacion consultada | no disponible en la informacion consultada | no disponible | Ampliamente usado en la literatura y en toolkits de verificacion de locutor |
| Modelos de verificacion basados en WavLM / SSL | Embedding de locutor sobre representaciones auto-supervisadas | no disponible en la informacion consultada | no disponible en la informacion consultada | no disponible | Habituales en competiciones y toolkits |

No se dispone de datos de rendimiento comparativo entre estas alternativas en la informacion proporcionada, por lo que la comparacion se limita a la categoria de uso, el formato de distribucion y la licencia del artefacto de este repositorio.

## Limitaciones y advertencias

- Sesgos conocidos: no se documentan en la model card. El entrenamiento se realizo sobre VoxCeleb2, un corpus con una distribucion concreta de idiomas, acentos, generos y condiciones de grabacion; el rendimiento puede degradarse fuera de esa distribucion.
- Riesgo de alucinacion: no aplica en el sentido generativo, pero existe riesgo de falsos positivos y falsos negativos en la verificacion de locutor. El umbral de decision debe calibrarse con datos propios del dominio.
- Limitaciones de contexto e idioma: la model card no declara idiomas soportados ni condiciones acusticas recomendadas (ruido, canal telefonico, audio lejano). Tampoco se documenta la frecuencia de muestreo esperada por el ONNX, lo que puede provocar errores silenciosos si se alimenta con un formato distinto al del entrenamiento.
- Preprocesado no documentado: al publicarse solo el archivo ONNX, no se especifican en la informacion disponible las etapas de extraccion de caracteristicas (por ejemplo, tipo de espectrograma, normalizacion o recorte de audio) necesarias para reproducir el pipeline de entrenamiento. Omitirlas degradara los embeddings.
- Licencia: MIT, lo que permite uso comercial y modificacion, siempre que se conserve el aviso de copyright y la atribucion. La model card cita a Palabra.ai, ReDimNet2 y la licencia MIT como credito.
- Caveats de produccion: no hay resultados de benchmarks ni validacion por parte del publicador del export, cero descargas y cero valoraciones en el momento de la consulta, y no se ofrece informacion sobre la equivalencia numerica entre este ONNX y los pesos originales del *checkpoint* B3 vox2 LM. Para un despliegue critico, conviene validar el modelo contra el repositorio oficial antes de adoptarlo.
- Uso responsable: la verificacion biometrica por voz trata datos personales y, en la Union Europea, queda sujeta al RGPD y a las restricciones del Reglamento de IA para identificacion biometrica; su uso debe acompanarse de base juridica, consentimiento y medidas de seguridad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/volantis-labs/redimnet2
- Repositorio oficial ReDimNet2 (PalabraAI): https://github.com/PalabraAI/redimnet2
- Implementacion y pesos en el repositorio: https://github.com/PalabraAI/redimnet2/tree/main/redimnet2
- Articulo (arXiv, abstract): https://arxiv.org/abs/2603.11841
- Articulo (arXiv, HTML): https://arxiv.org/html/2603.11841
- Pagina del paper en HuggingFace: https://huggingface.co/papers/2603.11841
