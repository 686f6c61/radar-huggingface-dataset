# VADRK155/Cortex-2-Chat-Preview

## Resumen

Cortex 2 Chat Preview es un modelo de lenguaje conversacional de 346 millones de parametros desarrollado por el usuario VADRK155 y publicado en HuggingFace bajo licencia MIT. Se trata de un transformer decoder-only con una implementacion propia en PyTorch, entrenado integramente desde cero sin reutilizar pesos preentrenados ni apoyarse en la libreria `transformers`. El modelo se distribuye en fp16 y esta etiquetado exclusivamente para ingles.

La relevancia de este modelo es fundamentalmente experimental: sirve como ejemplo de pipeline de entrenamiento completo desde cero y como punto de partida para fine-tuning o para estudiar el comportamiento de arquitecturas GPT de tamano reducido. No compite en capacidad con modelos de su misma escala entrenados sobre corpus masivos, y el propio autor lo presenta como una version preliminar que puede comunicarse peor que su predecesor, Cortex 1 Chat.

Su principal restriccion es la ventana de contexto, de solo 256 tokens, muy por debajo de los estandares actuales (2.048 a 128.000 tokens en modelos comparables). Esto limita drasticamente el dialogo multi-turno: el modelo olvida rapidamente las partes anteriores de la conversacion. Con 0 descargas y 1 like en el momento de la consulta, se trata de un artefacto de investigacion personal mas que de un modelo listo para produccion.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (implementacion propia en PyTorch, sin `transformers`) |
| Parametros totales | 346 millones |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en fp16) |
| Idiomas soportados | ingles (en) |
| Licencia | MIT |
| Formato de pesos | fp16 (no se publica GGUF ni safetensors de forma explicita) |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only con implementacion personalizada, es decir, no se apoya en las clases de HuggingFace `transformers` sino en codigo propio del autor. El entrenamiento se realizo integramente desde cero, sin inicializacion a partir de pesos preentrenados, lo que implica que todo el conocimiento linguistico del modelo proviene del corpus utilizado por el autor. El modelo se publica en fp16 y el repositorio ocupa 1,4 GB.

No se dispone de informacion sobre el numero de tokens de entrenamiento, la composicion del dataset, el uso de tecnicas de alineacion (RLHF, DPO, SFT) ni innovaciones tecnicas como atencion lineal o decodificacion especulativa. La model card unicamente indica el proceso de ejecucion (`pip install -r requirements.txt` y `python chat.py`), lo que sugiere que la inferencia se realiza mediante un script propio en lugar de servidores de inferencia estandar.

## Capacidades

- Generacion de texto conversacional en ingles, orientada a respuestas de un unico turno o turnos muy cortos.
- Dialogo de tipo chat, con la salvedad de que la ventana de 256 tokens impide mantener contexto mas alla de unos pocos intercambios.
- Entrenamiento reproducible desde cero: el codigo y los pesos permiten estudiar el pipeline completo de un GPT pequeno.
- Base para fine-tuning: al ser un modelo de 346M con licencia MIT, es viable ajustarlo en hardware de consumo.
- Capacidades multilingues: no disponibles. El modelo esta etiquetado unicamente como ingles.
- Tool calling / function calling: no disponible.
- Soporte de agentes y razonamiento multi-paso: no disponible.
- Capacidades especiales (vision, audio, modo thinking, decodificacion especulativa): no disponibles.

## Casos de uso

- Prototipado educativo de pipelines de entrenamiento: el modelo y su codigo asociado permiten reproducir de principio a fin el ciclo de entrenamiento de un transformer decoder-only sin depender de `transformers`, util para cursos o laboratorios de arquitecturas GPT.
- Fine-tuning experimental en dominios acotados: con 346M de parametros y licencia MIT, se puede ajustar sobre un corpus pequeno (por ejemplo, respuestas de soporte tecnico en ingles) y desplegarlo en una GPU de consumo.
- Generacion de respuestas cortas de un solo turno: chatbots de FAQs o asistentes que responden a una pregunta aislada sin necesidad de memoria conversacional, encajando con la ventana de 256 tokens.
- Investigacion sobre limitaciones de contexto: sirve como caso de estudio controlado para medir la degradacion de coherencia al reducir la ventana a 256 tokens frente a modelos con 1.024 o 2.048.
- Generacion de texto creativo breve: continuaciones de frases, eslóganes o micro-relatos en ingles donde el modelo no necesita recordar informacion previa.
- Base para experimentos de cuantizacion: al ser un modelo pequeno en fp16, es un banco de pruebas adecuado para evaluar conversiones a GGUF/INT8/INT4 y medir el impacto en calidad, aunque el autor no publique dichas cuantizaciones.
- Comparativa academica de modelos desde cero frente a modelos preentrenados: permite cuantificar la brecha de calidad entre un entrenamiento from-scratch de 346M y alternativas preentrenadas del mismo orden de magnitud.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye cifras de MMLU, HumanEval, GSM8K, HellaSwag ni de ningun otro conjunto de evaluacion, y la busqueda web realizada no devolvio informacion adicional sobre el modelo.

## Requisitos de hardware

- VRAM estimada para inferencia en fp16: aproximadamente 0,7 GB solo para pesos (346M x 2 bytes), con un total practico en torno a 1,5-2 GB sumando cache de activaciones y overhead del runtime. El cache KV es minimo dado el contexto de 256 tokens.
- GPU recomendadas: cualquier GPU consumer moderna es suficiente. Una RTX 3060 (12 GB), RTX 4060 o incluso una GTX 1650 (4 GB) pueden alojar el modelo sin problema.
- Inferencia en CPU: viable. Con 346M de parametros, un equipo de escritorio convencional puede ejecutar el modelo en CPU con latencias aceptables para uso interactivo, aunque no se dispone de cifras concretas.
- Cabe en GPU consumer: si, en practicamente cualquier GPU con 4 GB o mas de VRAM, y tambien en iGPUs con memoria unificada.
- Opciones de despliegue: la model card solo documenta la ejecucion mediante un script propio (`python chat.py`). No se publican pesos en GGUF, por lo que llama.cpp u Ollama requeririan una conversion previa. Al no usar `transformers`, vLLM, TGI o servidores equivalentes no soportan la arquitectura de forma nativa, salvo que se adapte el codigo.
- Latencia y throughput estimados: no disponibles.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| Cortex 2 Chat Preview | 346M | 256 tokens | MIT | HuggingFace (VADRK155/Cortex-2-Chat-Preview) |
| Cortex 1 Chat | no disponible | no disponible | no disponible en la informacion proporcionada | HuggingFace (VADRK155/Cortex-1-Chat) |
| GPT-2 (355M, medium) | 355M | 1.024 tokens | MIT modificada | Ampliamente disponible |
| Otros modelos de ~350M | no disponible | no disponible | no disponible | no disponible |

No se dispone de datos de rendimiento de ninguno de los modelos comparados en la informacion proporcionada, por lo que la comparativa se limita a parametros, contexto, licencia y disponibilidad. El autor indica que Cortex 2 Chat Preview puede comunicarse peor que Cortex 1 Chat, aunque no aporta cifras que respalden esa afirmacion.

## Limitaciones y advertencias

- Ventana de contexto de solo 256 tokens: el modelo olvida rapidamente los turnos anteriores de la conversacion, lo que invalida su uso en dialogos multi-turno extensos o en tareas que requieran memoria de instrucciones previas.
- Coherencia limitada: el propio autor advierte de que el modelo puede perder coherencia, confundir hechos o cortar frases a mitad, comportamiento esperable para su numero de parametros.
- Version preliminar: se trata de una release de vista previa que, segun el autor, puede comunicarse peor que Cortex 1 Chat.
- Riesgo de alucinacion: elevado por el tamano reducido y por la ausencia de datos publicados sobre el corpus de entrenamiento o sobre tecnicas de alineacion que mitiguen este comportamiento.
- Sesgos conocidos: no disponibles. No se documenta la composicion del dataset, por lo que no es posible evaluar sesgos de genero, raza, religion u otros.
- Limitacion idiomatica: el modelo solo esta etiquetado para ingles. Su rendimiento en castellano u otros idiomas no esta documentado y previsiblemente sera bajo.
- Ausencia de benchmarks: no hay ninguna evaluacion publicada que permita estimar su calidad frente a alternativas.
- Restricciones de licencia: la licencia MIT permite uso comercial, modificacion y redistribucion con attribution, pero al no estar disponible el codigo de entrenamiento completo ni el dataset, la reproducibilidad es limitada.
- Advertencia para produccion: no se recomienda su uso en sistemas productivos orientados a usuarios finales dado el contexto de 256 tokens, la falta de evaluaciones y el estado de vista previa.
- Soporte de la comunidad: con 0 descargas y 1 like, no existe ecosistema, issues resueltos ni integraciones de terceros que faciliten su adopcion.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/VADRK155/Cortex-2-Chat-Preview
- Modelo predecesor, Cortex 1 Chat: https://huggingface.co/VADRK155/Cortex-1-Chat
- Resultados de busqueda web: no se han encontrado enlaces relevantes (papers, blogs, repos o demos) en la busqueda proporcionada; los resultados devueltos corresponden unicamente a paginas principales de buscadores y servicios de traduccion, sin relacion con el modelo.
