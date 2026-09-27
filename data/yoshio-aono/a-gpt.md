# yoshio-aono/a-gpt

## Resumen

A-GPT es un proyecto educativo de construccion de modelos de lenguaje desde cero, desarrollado por el autor japones yoshio-aono (de ahi la "A" de A-GPT, por el apellido Aono). No es un modelo unico, sino una familia escalonada de ocho modelos que van desde una red minima de 1.361 pesos (modelo 1) hasta un modelo de clase GPT-2 small de aproximadamente 110 millones de parametros (modelo 8). El objetivo declarado no es la utilidad practica, sino servir de material didactico para entender el funcionamiento interno de un transformer: el calculo de atencion, el tokenizador BPE y el bucle de entrenamiento estan escritos a mano, sin apoyarse en librerias de alto nivel como Transformers.

El repositorio de HuggingFace aloja unicamente los pesos de los modelos grandes (del 6 al 8); los pesos de los modelos 1 a 5 estan en GitHub. Todos los modelos son decoder-only de tipo transformer Pre-LN con codificacion posicional seno/coseno y tokenizador BPE propio. Estan entrenados exclusivamente en japones y su ventana de contexto es muy reducida: 128 tokens en el modelo 6, 512 en el modelo 7 y 1.024 en el modelo 8.

La relevancia de esta publicacion es formativa: ofrece una implementacion completa y reproducible de un LLM de escala pequena, con registros de entrenamiento y una demo web ejecutable. El propio autor advierte que los modelos escriben texto que "parece japones" pero cuya veracidad no esta garantizada, y que no deben usarse en produccion. Los pesos se publican bajo licencia CC BY-SA 4.0, alineada con las condiciones de los datos de entrenamiento (Wikipedia japonesa).

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only Pre-LN, con codificacion posicional sin/cos, embedding escalado por raiz de d, pesos compartidos entre embedding y capa de salida, LayerNorm con pesos y activacion ReLU |
| Parametros totales | 16.798.336 (modelo 6); 16.799.491 (modelo 6 chat); 41.619.712 (modelo 7 y 7 chat); ~110 millones (modelo 8, en entrenamiento) |
| Longitud de contexto | 128 (modelo 6); 256 (modelo 6 chat); 512 (modelo 7 y 7 chat); 1.024 (modelo 8) |
| Tipos de cuantizacion | No disponible. No se distribuyen variantes cuantizadas; los pesos se publican en float16 |
| Idiomas soportados | Japones (ja) |
| Licencia | CC BY-SA 4.0 |
| Formato de pesos | NumPy `.npz` en float16; no es formato Transformers ni GGUF |
| Tokenizador | BPE escrito a mano (`models/<modelo>/bpe.json`) |
| Vocabulario | 16.000 (modelo 6); 16.003 (modelo 6 chat); 32.000 (modelo 7, 7 chat y 8) |
| Dimension del modelo / capas / cabezas | 384 / 6 / 6 (modelo 6); 512 / 8 / 8 (modelo 7); 768 / 12 / 12 (modelo 8) |
| Tamano del repositorio | 0,2 GB |
| Descargas y likes | 0 descargas, 0 likes |

## Arquitectura y entrenamiento

La arquitectura es un transformer decoder-only clasico con normalizacion previa (Pre-LN). Cada capa aplica LayerNorm antes de la atencion multi-cabeza y antes de la red feed-forward, y la activacion es ReLU en lugar de las alternativas modernas como GELU o SwiGLU. La codificacion posicional es sin/cos (absoluta, no rotatoria), el embedding de entrada se multiplica por la raiz de la dimension del modelo y la matriz de embedding se comparte con la capa de salida. El tokenizador BPE tambien esta implementado a mano. El entrenamiento se ejecuta en la GPU de un Mac mediante MLX, lo que situa el proyecto en el ecosistema Apple Silicon.

Los datos de entrenamiento son: obras de dominio publico de Aozora Bunko (solo textos con copyright expirado en grafia y kana modernos), Wikipedia en japones (instantanea 20231101.ja del dataset `wikimedia/wikipedia`) y, unicamente para el modelo 8, la porcion japonesa de `HuggingFaceFW/fineweb-2` procedente de Common Crawl. Las variantes "chat" se ajustan por instrucciones con `kunishou/databricks-dolly-15k-ja`, la traduccion al japones de databricks-dolly-15k. No se menciona en la informacion disponible el uso de RLHF, DPO ni tecnicas de decodificacion especulativa. Como metrica interna, el autor reporta la perdida por caracter medida sobre un mismo conjunto de validacion de 52 obras de Aozora Bunko no usadas en entrenamiento: 2,997 nats para el modelo 6 y 2,939 nats para el modelo 7.

## Capacidades

- Generacion de texto en japones: produce texto con estructura superficial verosimil al japones, pero sin garantia de correccion factual.
- Conversacion multi-turno basica en las variantes "chat" (modelo 6 chat y modelo 7 chat), ajustadas por instrucciones con dolly-15k-ja.
- Respuesta a preguntas de opcion multiple de cultura general en un test interno de 30 preguntas a 4 opciones (14/30 el modelo 6, 20/30 el modelo 7).
- Modelado de lenguaje puro: los modelos base (no chat) estan pensados para completar texto, no para seguir instrucciones.
- Uso de la ventana de contexto para continuaciones cortas: 128, 256, 512 o 1.024 tokens segun el modelo.
- Ejecucion local en hardware modesto gracias al reducido numero de parametros.
- No dispone de tool calling, function calling, uso de agentes, razonamiento multi-paso, vision, audio ni modo de pensamiento. No se documenta ninguna de estas capacidades en la informacion disponible.

## Casos de uso

- Material didactico para cursos de LLM: el modelo 6 (16,8 M de parametros) permite recorrer de principio a fin el codigo de atencion, el tokenizador BPE y el bucle de entrenamiento en una sola sesion de clase.
- Reproduccion de experimentos de escalado: la familia de modelos 1 a 8 permite comparar como evoluciona la perdida por caracter (2,997 en el modelo 6 frente a 2,939 en el modelo 7) al aumentar parametros, vocabulario y contexto.
- Estudio del tokenizador: el archivo `bpe.json` y el codigo asociado permiten analizar como se construye un vocabulario BPE japones de 16.000 o 32.000 piezas sin usar SentencePiece ni tokenizers.
- Pruebas de inferencia en Apple Silicon con MLX: el proyecto esta disenado para entrenar y ejecutar en la GPU de un Mac, por lo que sirve como banco de pruebas de este stack.
- Base para experimentos de ajuste por instrucciones a escala minima: las variantes chat demuestran como un ajuste con dolly-15k-ja cambia el comportamiento de un modelo base de 16,8 M de parametros.
- Analisis de sesgos y alucinacion en modelos pequenos: dado que el autor advierte que el modelo "escribe a menudo cosas contrarias a los hechos", resulta util para medir la frecuencia y el tipo de errores factuales en funcion del tamano.
- Demo educativa interactiva: la interfaz publicada en Vercel permite mostrar en clase la generacion token a token sin instalar nada.

## Benchmarks y rendimiento

Los unicos datos publicados en la informacion disponible son los del propio autor. No son comparables con benchmarks estandar como MMLU o HumanEval.

| Metrica | Modelo 6 | Modelo 7 | Modelo 8 |
|---|---|---|---|
| Perdida por caracter (nats, menor es mejor) | 2,997 | 2,939 | No disponible |
| Test de cultura general (30 preguntas, 4 opciones) | 14/30 | 20/30 | No disponible |
| Perdida por caracter en la variante chat | No disponible | No disponible | No disponible |

Nota: el nivel de azar en el test de opcion multiple es 7,5/30 (25 %). No se han publicado resultados de MMLU, GSM8K, HumanEval ni de ningun otro benchmark estandar en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en todos los casos. Los pesos en float16 ocupan aproximadamente 33 MB (modelo 6), 83 MB (modelo 7) y 220 MB (modelo 8); el grueso del consumo proviene de las activaciones y del tokenizador.
- GPU recomendadas: dada la escala, cualquier GPU sirve. El proyecto esta pensado para la GPU integrada de un Mac mediante MLX. En el lado NVIDIA, una RTX 3060, una RTX 4090 o incluso una GPU de gama de entrada son ampliamente suficientes; no se necesita A100 ni H100.
- Inferencia en CPU: es perfectamente viable, especialmente con los modelos 6 y 7, al tratarse de redes de menos de 50 millones de parametros.
- Caben en GPU de consumo: si, en practicamente cualquier GPU de consumo actual e incluso en GPUs integradas y en telefonos de gama alta con esfuerzo adicional.
- Opciones de despliegue: el formato `.npz` y el codigo propio implican que no hay soporte directo en vLLM, llama.cpp, Ollama o TGI. El despliegue se realiza con el codigo del repositorio GitHub (`models/`, `train.py`, `model.py`) o mediante MLX en Apple Silicon. El autor no documenta ninguna conversion a GGUF.
- Latencia y throughput: no disponible. No se publican mediciones de tokens por segundo.

## Comparativa con modelos similares

No se han identificado en la informacion proporcionada modelos de terceros comparables con datos verificables. La comparativa mas directa es interna, dentro de la propia familia A-GPT:

| Modelo | Parametros | Contexto | Vocabulario | Perdida por caracter | Test de cultura general | Licencia |
|---|---|---|---|---|---|---|
| A-GPT modelo 6 | 16.798.336 | 128 | 16.000 | 2,997 | 14/30 | CC BY-SA 4.0 |
| A-GPT modelo 7 | 41.619.712 | 512 | 32.000 | 2,939 | 20/30 | CC BY-SA 4.0 |
| A-GPT modelo 8 | ~110 millones | 1.024 | 32.000 | No disponible | No disponible | CC BY-SA 4.0 |

Como referencia externa, el propio autor situa el modelo 8 en la clase de GPT-2 small, lo que implica un orden de magnitud de ~124 millones de parametros y 1.024 tokens de contexto. No se dispone en la informacion proporcionada de datos de rendimiento de GPT-2 small en japones que permitan una comparacion cuantitativa justa. Tampoco se han encontrado alternativas de terceros con licencia, contexto y tamano equivalentes en los resultados de busqueda web.

## Limitaciones y advertencias

- El autor advierte explicitamente de que el modelo "escribe a menudo cosas contrarias a los hechos". El riesgo de alucinacion es alto y estructural, no un defecto corregible con prompts.
- No es un modelo de uso practico: la documentacion lo define como material didactico para aprender como funciona un LLM, no como herramienta de produccion.
- Ventana de contexto muy corta: 128 tokens en el modelo 6, 512 en el modelo 7 y 1.024 en el modelo 8. Esto descarta tareas de resumen de documentos largos o conversaciones extensas.
- Soporte exclusivo de japones. No hay capacidades multilingues documentadas.
- Ausencia total de tool calling, agentes, vision, audio y modo de pensamiento.
- Licencia CC BY-SA 4.0: el uso comercial es posible, pero obliga a atribuir el repositorio y las fuentes de datos (Aozora Bunko, Wikipedia japonesa, fineweb-2 y dolly-15k-ja), y a publicar cualquier obra derivada bajo la misma licencia CC BY-SA 4.0, lo que incluye los pesos modificados por ajuste fino.
- Formato de pesos no estandar (`.npz` en float16) sin conversion publicada a safetensors o GGUF: requiere usar el codigo propio del autor y no se integra en los ecosistemas habituales de inferencia.
- Los modelos 1 a 5 no estan en HuggingFace, solo en GitHub, por lo que la familia completa no se puede obtener desde un unico repositorio.
- El modelo 8 figura como "en entrenamiento" y no tiene pesos finales ni metricas publicadas.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion externa de la comunidad.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/yoshio-aono/a-gpt
- Repositorio con el codigo y los registros de entrenamiento: https://github.com/yoshio-aono/llm-origin
- Demo interactiva: https://llm-origin.vercel.app
- Aozora Bunko: https://www.aozora.gr.jp/
- Dataset de Wikipedia japonesa: https://huggingface.co/datasets/wikimedia/wikipedia
- Dataset fineweb-2: https://huggingface.co/datasets/HuggingFaceFW/fineweb-2
- Dataset dolly-15k-ja: https://huggingface.co/datasets/kunishou/databricks-dolly-15k-ja
- Licencia CC BY-SA 4.0: https://creativecommons.org/licenses/by-sa/4.0/deed.ja
