# svaber/Qwen2.5-3B

## Resumen

svaber/Qwen2.5-3B es una distribucion no oficial del modelo Qwen2.5-3B-Instruct en su variante "abliterated", un proceso de edicion de pesos que elimina la direccion de activacion asociada al rechazo de contenido, dando lugar a un modelo "uncensored" que responde a practicamente cualquier peticion sin las negativas tipicas del modelo alineado original. El autor de esta publicacion es el usuario svaber, mientras que el modelo base es huihui-ai/Qwen2.5-3B-Instruct-abliterated, a su vez derivado del Qwen2.5-3B-Instruct de Alibaba. La model card es practicamente la de un repositorio de cuantizaciones estaticas GGUF generadas por mradermacher, sin descripcion tecnica propia del autor.

El modelo conserva la arquitectura transformer decoder-only de Qwen2.5-3B, con 3.397.103.616 parametros totales (segun el recuento real de safetensors) y una ventana de contexto que, en la familia Qwen2.5, alcanza los 32.768 tokens nativos, ampliables a 131.072 mediante YaRN (dato no verificado en la informacion proporcionada para esta variante concreta). Su relevancia actual radica en dos factores: por un lado, el interes de la comunidad en modelos locales pequenos sin restricciones de contenido para investigacion, red teaming y aplicaciones de nicho; por otro, la disponibilidad de cuantizaciones GGUF que permiten ejecutarlo en hardware de consumo modesto.

La licencia declarada es Apache-2.0, heredada del modelo base, lo que facilita su uso comercial, aunque la naturaleza "abliterated" y la ausencia de garantias de calidad y seguridad deben tenerse en cuenta en cualquier despliegue en produccion. El repositorio ocupa 52,4 GB e incluye pesos en transformers y un catalogo amplio de cuantizaciones GGUF (de Q2_K a f16), lo que sugiere que la publicacion esta pensada para descarga directa y ejecucion local.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5), con atencion causal y RoPE; detalles exactos de capas y dimensiones no disponibles en la informacion proporcionada |
| Parametros totales | 3.397.103.616 |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No disponible en la informacion proporcionada para esta variante; la familia Qwen2.5-3B-Instruct declara 32.768 tokens nativos (131.072 con YaRN), dato no verificado aqui |
| Tipos de cuantizacion | GGUF: Q2_K, Q3_K_S, Q3_K_M, Q3_K_L, IQ4_XS, Q4_K_S, Q4_K_M, Q5_K_S, Q5_K_M, Q6_K, Q8_0, f16; tambien pesos transformers (safetensors) |
| Idiomas soportados | zho, eng, fra, spa, por, deu, ita, rus, jpn, kor, vie, tha, ara |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (transformers) y GGUF (cuantizaciones estaticas) |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only denso de la familia Qwen2.5, con 3.397.103.616 parametros. No se dispone en la informacion proporcionada de detalles sobre numero de capas, dimension del modelo, cabezas de atencion, vocabulario ni composicion exacta del dataset de entrenamiento. La familia Qwen2.5-Instruct original fue entrenada por Alibaba con un pipeline que incluye preentrenamiento multilingue y posteriores fases de ajuste supervisado y optimizacion por preferencias, pero los detalles concretos de esa receta no se recogen en la model card de esta publicacion.

La innovacion tecnica distintiva de esta variante es el proceso de "abliteration": una edicion de pesos que identifica la direccion de activacion responsable del comportamiento de rechazo y la elimina o atenua, de modo que el modelo deja de negarse a responder a peticiones que el modelo alineado rechazaria. Este procedimiento se aplico sobre huihui-ai/Qwen2.5-3B-Instruct-abliterated, y svaber redistribuye el resultado junto con cuantizaciones GGUF generadas por mradermacher. No se documenta en la informacion disponible si hubo entrenamiento adicional, fine-tuning o calibracion tras la ablacion.

## Capacidades

- Generacion de texto conversacional multi-turno, con formato de chat instructivo heredado de Qwen2.5-Instruct.
- Razonamiento basico y respuesta a preguntas en 13 idiomas declarados (chino, ingles, frances, espanol, portugues, aleman, italiano, ruso, japones, coreano, vietnamita, tailandes y arabe).
- Generacion de codigo y matematicas a nivel de un modelo de 3B, sin garantias de rendimiento especificas documentadas.
- Respuesta sin rechazo a peticiones que el modelo alineado original declinaria, gracias a la ablacion de la direccion de rechazo.
- Soporte de tool calling y function calling: no confirmado en la informacion proporcionada para esta variante; el modelo base Qwen2.5-Instruct lo soporta, pero la ablacion puede afectar al formato.
- Capacidades de agente y razonamiento multi-paso: no documentadas en la informacion proporcionada.
- Sin capacidades de vision ni audio (modelo puramente de texto).

## Casos de uso

- Investigacion sobre alineacion y seguridad: el modelo permite estudiar como cambia el comportamiento de un LLM al eliminar la direccion de rechazo, comparando respuestas con el Qwen2.5-3B-Instruct original en experimentos controlados.
- Red teaming y evaluacion de filtros: util para generar respuestas que un modelo alineado bloquearia y probar la robustez de clasificadores de contenido y sistemas de moderacion.
- Generacion creativa sin restricciones: escritura de ficcion, guiones o narrativa que aborde temas sensibles, donde el modelo alineado impondria negativas; el contexto de 3B es suficiente para escenas y capitulos cortos.
- Prototipado local en hardware de consumo: con cuantizaciones Q4_K_M (4,1 GB) o Q5_K_M (4,8 GB) cabe en GPUs de 8 GB y en CPU, lo que permite iterar rapido en entornos sin infraestructura dedicada.
- Traduccion y asistencia multilingue de bajo coste: los 13 idiomas declarados permiten tareas de traduccion informal o resumen en entornos donde no se requiere la maxima calidad.
- Chatbot de nicho sin moderacion corporativa: despliegues internos o personales donde el operador asume la responsabilidad del contenido y prefiere un modelo que no rechace peticiones por defecto.
- Educacion e investigacion academica: analisis de sesgos y de la eficacia de las tecnicas de ablacion en modelos pequenos, con licencia Apache-2.0 que facilita la redistribucion en publicaciones.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye MMLU, HumanEval, GSM8K ni ninguna otra metrica, y el proceso de abliteration suele degradar ligeramente el rendimiento respecto al modelo alineado, pero no se aportan numeros que lo cuantifiquen.

## Requisitos de hardware

- VRAM estimada para inferencia (pesos + overhead de contexto):
  - Q2_K (2,8 GB): ~4 GB de VRAM.
  - Q4_K_M (4,1 GB): ~5-6 GB de VRAM.
  - Q5_K_M (4,8 GB): ~6-7 GB de VRAM.
  - Q8_0 (7,0 GB): ~8-9 GB de VRAM.
  - f16 (6,9 GB): ~8-9 GB de VRAM; en la practica Q8_0 ofrece calidad equivalente con menos espacio.
- GPU recomendadas: RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4090, A100 y H100 para despliegues con mayor concurrencia. Cualquier GPU con 8 GB o mas puede ejecutar las cuantizaciones Q4 y Q5.
- Cabe en GPU de consumo: si, en practicamente todas las GPU modernas con 8 GB o mas; tambien en CPU con llama.cpp, aunque con latencia mayor.
- Opciones de despliegue: llama.cpp y Ollama para GGUF; vLLM, TGI y transformers para los pesos safetensors; LM Studio y text-generation-webui como entornos de escritorio.
- Latencia y throughput: no disponibles en la informacion proporcionada. Como referencia cualitativa, un modelo denso de 3B en Q4_K_M sobre una RTX 4090 suele superar las decenas de tokens por segundo, pero no se aportan mediciones para esta publicacion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Notas |
|---|---|---|---|---|
| svaber/Qwen2.5-3B (esta ficha) | 3,40B | No disponible (familia Qwen2.5: 32.768) | Apache-2.0 | Variante abliterated, cuantizaciones GGUF estaticas |
| huihui-ai/Qwen2.5-3B-Instruct-abliterated | 3,40B | 32.768 (familia Qwen2.5) | Apache-2.0 | Modelo base directo de esta publicacion; misma ablacion, sin las cuantizaciones de svaber |
| Qwen/Qwen2.5-3B-Instruct | 3,40B | 32.768 (131.072 con YaRN) | Apache-2.0 | Modelo alineado original; rechaza contenido sensible; referencia de calidad |
| Llama-3.2-3B-Instruct | 3,21B | 131.072 | Llama 3.2 Community License | Alternativa de tamano similar con contexto mayor, pero licencia mas restrictiva |

## Limitaciones y advertencias

- La ablacion elimina el rechazo de contenido, pero no garantiza precision: el modelo puede generar afirmaciones falsas, contenido danino o instrucciones peligrosas sin advertirlo. La moderacion debe implementarse en la capa de aplicacion.
- Riesgo de alucinacion elevado, acentuado por el tamano de 3B y por la perdida de capacidad de rechazo ante preguntas sin respuesta.
- La ablacion suele degradar ligeramente el rendimiento en tareas de razonamiento e instruccion respecto al Qwen2.5-3B-Instruct original; no se aportan mediciones.
- No hay garantia de que el soporte de tool calling y el formato de chat se mantengan intactos tras la edicion de pesos; conviene validarlo antes de usarlo en pipelines de agentes.
- La model card no documenta la composicion del dataset, los sesgos conocidos ni evaluaciones de seguridad; se desconoce el impacto de la ablacion en sesgos de genero, raza o idioma.
- La licencia Apache-2.0 permite uso comercial, pero el operador asume toda la responsabilidad legal y etica sobre el contenido generado; el autor no ofrece garantias.
- El repositorio ocupa 52,4 GB por incluir muchas cuantizaciones; conviene descargar solo la variante necesaria.
- El modelo no tiene vision ni audio; no es adecuado para tareas multimodales.
- Los idiomas declarados heredan la cobertura de Qwen2.5, con calidad desigual: el chino y el ingles son los mejor soportados, y los idiomas con menos datos de entrenamiento pueden degradarse tras la ablacion.

## Enlaces

- Repositorio principal: https://huggingface.co/svaber/Qwen2.5-3B
- Modelo base: https://huggingface.co/huihui-ai/Qwen2.5-3B-Instruct-abliterated
- Cuantizaciones GGUF de referencia: https://huggingface.co/mradermacher/Qwen2.5-3B-Instruct-abliterated-GGUF
- Cuantizaciones imatrix: https://huggingface.co/mradermacher/Qwen2.5-3B-Instruct-abliterated-i1-GGUF
- Pagina de resumen de cuantizaciones: https://hf.tst.eu/model#Qwen2.5-3B-Instruct-abliterated-GGUF
- Licencia: https://huggingface.co/huihui-ai/Qwen2.5-3B-Instruct-abliterated/blob/main/LICENSE
- Guia de uso de GGUF (TheBloke): https://huggingface.co/TheBloke/KafkaLM-70B-German-V0.1-GGUF
- Analisis de tipos de cuantizacion (Artefact2): https://gist.github.com/Artefact2/b5f810600771265fc1e39442288e8ec9
- Solicitudes de cuantizacion: https://huggingface.co/mradermacher/model_requests
