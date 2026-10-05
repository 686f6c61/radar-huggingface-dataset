# WindyWord/translate-yap-en

## Resumen
WindyWord/translate-yap-en es un modelo de traduccion automatica neuronal especializado en la direccion yapense → ingles, publicado por WindyWord (Windstorm Labs) dentro de su catalogo abierto de modelos de traduccion. El modelo es un ajuste fino sobre Helsinki-NLP/opus-mt-yap-en, es decir, la arquitectura MarianMT del proyecto OPUS-MT de la Universidad de Helsinki, orientada a pares de lenguas de bajos recursos. El repositorio se distribuye en formato Transformers (PyTorch/safetensors) y en una variante cuantizada a INT8 con CTranslate2 pensada para inferencia en CPU.

Su relevancia radica en el nicho: el yapense es una lengua austronesia hablada en los Estados de Yap (Micronesia) con muy pocos recursos digitales y practicamente sin sistemas de traduccion de calidad disponibles. Este modelo ofrece un punto de partida practico y con licencia permisiva (Apache-2.0) para digitalizacion de textos, preservacion linguistica y despliegue en aplicaciones con hardware modesto, al tratarse de un modelo pequeno que cabe en cualquier GPU de consumo e incluso funciona en CPU con la variante INT8.

No se publica ninguna puntuacion de calidad en el repositorio: el autor remite a la pagina del catalogo para las metricas de evaluacion. Ademas, la model card advierte de la retirada temporal de las variantes WindyScripture mientras se revisan las licencias de los textos de eBible usados como fuente, lo que conviene tener en cuenta antes de reutilizar derivados.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | MarianMT (transformer encoder-decoder), heredada de Helsinki-NLP/opus-mt-yap-en |
| Parametros totales | no disponible (el repositorio no publica la cifra) |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en el repositorio (la familia MarianMT suele operar con segmentos de hasta 512 tokens, dato no confirmado aqui) |
| Tipos de cuantizacion | INT8 (variante CTranslate2); no se publican otras cuantizaciones |
| Idiomas soportados | yap (yapense), en (ingles). Direccion unica yap → en |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (Transformers/PyTorch en la subcarpeta `lora/`) y formato binario de CTranslate2 (subcarpeta `lora-ct2-int8/`) |
| Tamano del repositorio | 0,3 GB |
| Variantes incluidas | `lora/` (WindyStandard, GPU) y `lora-ct2-int8/` (WindyStandard CPU INT8) |
| Tarea (pipeline) | translation |
| Modelo base | Helsinki-NLP/opus-mt-yap-en |

## Arquitectura y entrenamiento
El modelo emplea la arquitectura MarianMT, un transformer secuencia a secuencia con encoder y decoder, desarrollado originalmente en el marco del proyecto OPUS-MT (Universidad de Helsinki) y entrenado sobre corpus paralelos extraidos de OPUS. Este repositorio no es un entrenamiento desde cero: los pesos derivan de Helsinki-NLP/opus-mt-yap-en y se han ajustado para producir las variantes WindyStandard del autor. El nombre de la subcarpeta (`lora/`) sugiere un ajuste mediante LoRA sobre el modelo base, aunque la model card no detalla la receta de ajuste ni fusiona o no los adaptadores en el checkpoint distribuido.

No se especifica en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset, ni si se aplicaron tecnicas de alineacion como RLHF o DPO (poco habituales en traduccion automatica de este tipo). La unica referencia a datos de origen aparece en la nota sobre las variantes WindyScripture retiradas temporalmente, que apunta a textos de eBible como fuente, lo que sugiere un peso relevante de corpus religiosos en el material de partida. La innovacion tecnica destacable es de despliegue, no de arquitectura: la publicacion de una variante cuantizada a INT8 con CTranslate2 permite inferencia rapida en CPU sin GPU.

## Capacidades
- Traduccion de texto en la direccion yapense → ingles, unica direccion soportada por el modelo.
- Procesamiento de frases y parrafos cortos; no se documenta soporte para documentos largos ni para traduccion con contexto extenso.
- Inferencia en GPU mediante Transformers (PyTorch) y en CPU mediante CTranslate2 con cuantizacion INT8.
- Integracion en aplicaciones finales: los desarrolladores del modelo indican que las aplicaciones de Windy Word (windyword.ai) estan construidas sobre esta familia de modelos.
- No se documenta soporte de tool calling, function calling ni uso como agente.
- No se documentan capacidades multimodales (vision, audio) ni modo de razonamiento explicito.
- Compatible con endpoints de inferencia (tag `endpoints_compatible`).
- Cobertura multilingue limitada estrictamente al par yap–en.

## Casos de uso
- Digitalizacion de documentacion administrativa y sanitaria en Yap: traduccion de formularios, informes y notas clinicas redactadas en yapense al ingles para su integracion en sistemas de gestion publicos de Micronesia, donde el ingles es lengua administrativa vehicular.
- Preservacion linguistica y corpus paralelos: generacion de traducciones de referencia para lingueistas que documentan el yapense, aprovechando la licencia Apache-2.0 para incorporar salidas a corpus abiertos con la debida atribucion.
- Traduccion de tradicion oral y textos etnograficos: transcripciones de relatos orales recogidos por investigadores pueden pasarse a ingles para su publicacion o archivo, aunque se recomienda revision humana por el riesgo de error en expresiones idiomaticas.
- Herramientas educativas para aulas bilingues: apoyo a estudiantes y docentes en contextos donde la instruccion pasa progresivamente al ingles, ofreciendo traduccion bajo demanda de materiales escritos en yapense.
- Subtitulado y acceso a contenido audiovisual local: combinado con un sistema ASR de yapense, el modelo puede generar subtitulos en ingles para emisiones de radio o video comunitarias.
- Despliegue offline en dispositivos modestos: la variante CTranslate2 INT8 permite ejecutar traduccion en portatiles o servidores sin GPU, util en zonas con infraestructura limitada y conectividad intermitente.
- Atencion ciudadana multilingue: integracion en ventanillas o chat de servicios publicos para que un funcionario angloparlante entienda una solicitud escrita en yapense sin intermediarios.
- Preprocesado en pipelines de investigacion: filtrado y normalizacion de textos yapenses antes de tareas posteriores de analisis o anotacion.

## Benchmarks y rendimiento
No se han publicado resultados de benchmarks en la informacion disponible. La model card indica explicitamente que no se publica ninguna puntuacion de calidad en el repositorio y remite a la pagina del catalogo del autor (windytranslate.com/models/translate-yap-en) para las metricas de cribado, donde se hayan medido. No se dispone de cifras de BLEU, chrF, COMET ni de evaluaciones humanas en los datos proporcionados.

## Requisitos de hardware
- Inferencia en GPU: al tratarse de un modelo pequeno derivado de OPUS-MT, cabe holgadamente en cualquier GPU de consumo; el repositorio completo ocupa 0,3 GB, por lo que la VRAM necesaria es de un orden muy inferior al de los modelos generativos actuales.
- GPU recomendadas: no se publican recomendaciones oficiales. Cualquier GPU consumer reciente (por ejemplo, gama RTX 30/40) es sobradamente suficiente; modelos de datacenter como A100 o H100 no aportan ventaja practica para este tamano de modelo.
- Inferencia en CPU: la subcarpeta `lora-ct2-int8/` esta pensada precisamente para esto, con CTranslate2 como motor. Es la via recomendada cuando no hay GPU disponible.
- Formatos de despliegue: Transformers (PyTorch) con `MarianMTModel` y `MarianTokenizer`, y CTranslate2 para CPU. No se publican pesos en GGUF ni integraciones declaradas con vLLM, TGI u Ollama; Ollama y llama.cpp no son aplicables sin una conversion previa que el autor no proporciona.
- Latencia y throughput: no disponible. La model card no incluye cifras de latencia ni de tokens por segundo, ni comparativas medidas entre la variante PyTorch y la INT8.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Idiomas | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| WindyWord/translate-yap-en | no disponible | no disponible | yap → en | Apache-2.0 | HuggingFace, repositorio duplicado en WindyTranslate |
| Helsinki-NLP/opus-mt-yap-en (modelo base) | no disponible en la informacion proporcionada | no disponible | yap → en | Apache-2.0 | HuggingFace (Helsinki-NLP) |
| Otros sistemas multilingues de bajos recursos | no disponible | no disponible | no verificado si cubren el yapense | no disponible | no disponible |

La comparativa se limita al modelo base del que deriva, ya que no se dispone de datos verificados sobre alternativas que cubran el par yap–en. No se han proporcionado cifras de rendimiento de ninguno de los dos modelos, por lo que no es posible establecer una comparacion cuantitativa.

## Limitaciones y advertencias
- Direccion unica: el modelo solo traduce yapense → ingles. No se declara soporte para ingles → yapense.
- Sin puntuacion de calidad publicada: no hay BLEU, chrF ni COMET en el repositorio, por lo que la calidad real de las traducciones no esta verificada de forma independiente.
- Lengua de muy bajos recursos: la disponibilidad de corpus paralelos de yapense es escasa, lo que incrementa el riesgo de traducciones literales, omisiones y errores en terminologia especializada.
- Riesgo de alucinacion y de fluidez enganosa: como cualquier modelo seq2seq, puede producir salidas gramaticalmente correctas en ingles que no reflejen fielmente el contenido del texto original.
- Posible sesgo de dominio: la mencion a textos de eBible en la nota sobre las variantes retiradas sugiere un peso relevante de corpus religiosos, lo que puede sesgar el vocabulario y el registro hacia ese dominio.
- Variantes retiradas temporalmente: las variantes WindyScripture (`herm0-scripture/`, `scripture-ct2-int8/`) se eliminaron de los ficheros actuales del repositorio mientras se revisan las licencias de sus textos fuente de eBible. El autor lo describe como precaucion, no como conclusion legal, pero conviene no depender de esas variantes.
- Repositorio duplicado: existen dos copias (WindyWord/translate-yap-en y la copia canonica WindyTranslate/translate-yap-en) y ningun dato de adopcion (0 descargas, 0 likes en el momento de la consulta), por lo que no hay senales de uso en produccion.
- Perdida por cuantizacion: la variante INT8 de CTranslate2 no incluye una evaluacion de degradacion de calidad respecto a la version en precision completa, algo relevante si el uso es critico.
- Licencia: Apache-2.0 permite uso comercial, pero obliga a conservar el aviso de copyright y los ficheros de atribucion (`LICENSE` y `NOTICE.md`), y a mantener la atribucion al proyecto OPUS-MT de la Universidad de Helsinki.
- Uso en produccion: sin evaluacion publicada y con revision humana recomendada, es adecuado como asistencia o preprocesado, no como traduccion final sin supervision en contextos legales, medicos o administrativos.

## Enlaces
- Modelo en HuggingFace: https://huggingface.co/WindyWord/translate-yap-en
- Copia canonica declarada por el autor: https://huggingface.co/WindyTranslate/translate-yap-en
- Ficha en el catalogo del autor: https://windytranslate.com/models/translate-yap-en
- Aplicaciones de Windy Word: https://windyword.ai
- Modelo base: https://huggingface.co/Helsinki-NLP/opus-mt-yap-en
- Ficheros de licencia y atribucion en el repositorio: `LICENSE` y `NOTICE.md`
- Resultados de busqueda web: no se ha encontrado informacion relevante sobre este modelo; los resultados devueltos no guardan relacion con el modelo ni con traduccion automatica.
