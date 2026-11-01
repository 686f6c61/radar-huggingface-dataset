# sraivante/insurance-faq-scratch-retriever

## Resumen

Insurance FAQ Retriever es un codificador de frases (sentence encoder) de tamano muy reducido desarrollado por el usuario sraivante y publicado en HuggingFace. Su funcion no es generar texto, sino resolver una tarea de recuperacion semantica: dada una pregunta del usuario sobre seguros de salud y vida en Estados Unidos (Medicare Parts A/B/C/D, Medicare Advantage, PDP, Medigap, mercado ACA, anualidades, IUL y seguros de vida generales), devuelve la respuesta almacenada de la entrada de FAQ mas cercana en un banco de aproximadamente 1.900 preguntas verificadas. Si la similitud coseno no supera el umbral de 0,75 configurado, devuelve una respuesta de respaldo segura que remite a un agente licenciado.

El modelo se entrena completamente desde cero, sin pesos preentrenados: es un Transformer encoder pre-norm de 6 capas, dimension 256, 4 cabezas de atencion y FFN de 1024, con mean pooling, que totaliza 6,7 millones de parametros. El tokenizador WordPiece tambien se entrena desde cero sobre el corpus de FAQ, con un vocabulario de 7.716 tokens. El entrenamiento se realizo en una Apple M5 en aproximadamente 26 minutos, lo que da una idea de la escala del proyecto.

Su relevancia radica en dos aspectos: por un lado, demuestra que un modelo diminuto entrenado especificamente para un dominio puede superar a un encoder preentrenado generico de mayor tamano (all-MiniLM-L6-v2, 22,7M parametros) en la tarea concreta de recuperacion de FAQ de seguros; por otro, al no generar texto y limitarse a devolver respuestas preexistentes, elimina estructuralmente el riesgo de alucinacion de contenido, algo critico en un dominio regulado como el de los seguros.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder pre-norm, 6 capas, dim 256, 4 cabezas, FFN 1024, mean pooling |
| Parametros totales | 6,7M |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en, hi (incluye variantes Hinglish en el corpus de entrenamiento) |
| Licencia | other |
| Formato de pesos | PyTorch (libreria pytorch); no se especifica safetensors ni GGUF |

## Arquitectura y entrenamiento

El modelo es un encoder Transformer clasico de tipo BERT pequeno, con normalizacion previa (pre-norm) en cada capa, 6 capas, dimension oculta de 256, 4 cabezas de atencion y capa feed-forward de 1024. La representacion de la frase se obtiene mediante mean pooling sobre las salidas del encoder. No se emplean pesos preentrenados: tanto el encoder como el tokenizador WordPiece (7.716 tokens) se inicializan aleatoriamente y se entrenan desde cero sobre el corpus de FAQ.

El entrenamiento utiliza una funcion de perdida contrastiva in-batch con InfoNCE y temperatura 0,05, sobre 17.000 parafrasis generadas a partir de 1.889 preguntas. Se aplica aumento de datos mediante caracteres con errores tipograficos y se realizan 4.000 pasos con batch de 256. Los datos de FAQ, parafrasis (estilo casual, con typos, estilo keyword y Hinglish) y respuestas fueron generados con Claude (API de Anthropic) y se incluyen en el directorio `data/` del repositorio. Las respuestas evitan deliberadamente cifras en dolares especificas de un ano concreto. El umbral de coincidencia (0,75 de similitud coseno) se almacena en `config.json`.

## Capacidades

- Recuperacion semantica de preguntas: empareja la consulta del usuario con la entrada de FAQ mas cercana de un banco de aproximadamente 1.900 preguntas.
- Similitud de frases (pipeline `sentence-similarity`): genera embeddings de frase comparables mediante coseno.
- Manejo de parafrasis: entrenado con variantes casuales, estilo keyword, con errores tipograficos y Hinglish.
- Respuesta de respaldo segura: cuando ninguna entrada supera el umbral de 0,75, devuelve un mensaje que remite a un agente licenciado en lugar de improvisar.
- Cobertura de dominio: Medicare Parts A/B/C/D, Medicare Advantage, PDP, Medigap, mercado ACA (HIX), anualidades, IUL y seguros de vida generales, ademas de saludos y gestion educada de consultas fuera de alcance.
- Multilingue limitado: ingles e hindi, con mezcla Hinglish en el entrenamiento.
- No soporta generacion de texto, tool calling, agentes ni razonamiento multi-paso; es exclusivamente un recuperador.

## Casos de uso

- Atencion al cliente de primer nivel en portales de seguros Medicare: el modelo recibe la pregunta del usuario, la compara contra el banco de FAQ y devuelve la respuesta verificada correspondiente; si la similitud es baja, escala a un agente licenciado, evitando respuestas inventadas en un dominio regulado.
- Chatbot embebido en web o aplicacion movil con requisitos minimos de hardware: con 6,7M de parametros, el modelo puede ejecutarse en CPU o en dispositivos de gama baja, lo que permite desplegarlo en el navegador o en un contenedor ligero sin GPU.
- Busqueda interna de FAQ para agentes humanos: un agente de call center puede introducir la consulta del cliente y obtener la entrada de FAQ mas relevante con su puntuacion de similitud, acelerando la localizacion de la respuesta correcta durante la llamada.
- Soporte en hindi e Hinglish para comunidades hispanohablantes de origen indio en EE. UU.: el corpus incluye parafrasis en Hinglish, lo que permite atender consultas mezcladas de ingles e hindi sobre Medicare y seguros de vida.
- Clasificacion y enrutamiento de consultas: la puntuacion de similitud y la entrada recuperada pueden usarse como senal para enrutar la consulta al departamento correspondiente (Medicare Advantage, Medigap, anualidades, etc.).
- Filtro de consultas fuera de alcance: gracias al umbral de 0,75 y a la respuesta de respaldo, el modelo actua como primera capa de filtrado que descarta consultas no relacionadas con seguros antes de que lleguen a sistemas mas costosos.
- Base para experimentacion academica: al ser un modelo desde cero con codigo y datos incluidos, sirve como referencia reproducible para estudiar el rendimiento de encoders diminutos frente a modelos preentrenados en tareas de recuperacion de dominio especifico.

## Benchmarks y rendimiento

Evaluacion sobre parafrasis retenidas (2 por pregunta, nunca vistas en entrenamiento, n=3.778):

| Modelo | Parametros | acc@1 | acc@3 |
|---|---|---|---|
| Este modelo (desde cero) | 6,7M | 75,4% | 96,0% |
| all-MiniLM-L6-v2 (preentrenado, mismo indice) | 22,7M | 62,1% | 83,0% |

Sobre un conjunto manual de 20 preguntas realistas dentro de dominio, el modelo acierta 15/20 (MiniLM 16/20). Sobre 12 preguntas fuera de dominio, ninguna se empareja con una respuesta de seguros (0/12 aciertos de coincidencia erronea), igual que MiniLM (0/12).

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 100 MB en precision FP32 dado el tamano de 6,7M de parametros; cabe holgadamente en cualquier GPU consumer e incluso en CPU.
- GPU recomendadas: no requiere GPU; funciona en CPU. Cualquier GPU consumer (RTX 3060, RTX 4090, etc.) es sobredimensionada para este modelo.
- Cabe en GPU consumer: si, en todas; tambien en dispositivos de borde y en el navegador mediante ONNX si se convierte.
- Opciones de despliegue: PyTorch nativo (el repositorio incluye `inference.py` con la clase `FaqRetriever`); no se documentan integraciones con vLLM, llama.cpp, Ollama o TGI, que estan orientados a modelos generativos.
- Latencia y throughput: no disponibles en la informacion proporcionada; el entrenamiento completo en Apple M5 tardo aproximadamente 26 minutos, lo que sugiere una inferencia muy rapida por consulta.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | acc@1 (test del autor) | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Insurance FAQ Retriever | 6,7M | no disponible | 75,4% | other | HuggingFace |
| all-MiniLM-L6-v2 | 22,7M | 256 tokens (estandar del modelo) | 62,1% | Apache 2.0 (modelo original) | HuggingFace |
| Otros encoders de recuperacion de dominio | no disponible | no disponible | no disponible | no disponible | no disponible |

La comparativa se limita a all-MiniLM-L6-v2, el unico modelo alternativo evaluado por el autor en la misma tarea e indice. No se dispone de datos de otros recuperadores comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Solo conoce las aproximadamente 1.900 preguntas de su banco; formulaciones inusuales caen en el respaldo con mas frecuencia que con un encoder preentrenado.
- Nunca vio texto general (no relacionado con seguros), por lo que consultas fuera de dominio pueden obtener puntuaciones relativamente altas (en torno a 0,70); el umbral se ajusto sobre un conjunto pequeno.
- A veces confunde productos estrechamente relacionados, por ejemplo preguntas sobre IUL frente a anualidades.
- Las respuestas fueron generadas por un modelo de IA y no han sido revisadas por un profesional licenciado.
- El contenido es informacion educativa general y no constituye asesoramiento de seguros, financiero, fiscal ni legal; no esta afiliado ni respaldado por CMS o Medicare.
- El contenido sobre Medicare Advantage y Part D puede estar sujeto a las normas de marketing de CMS; debe revisarse antes de cualquier uso orientado al cliente.
- La licencia es "other": no se especifican los terminos exactos de uso comercial en la informacion disponible, por lo que es necesario consultar el repositorio antes de un despliegue en produccion.
- El modelo no genera texto; cualquier caso que requiera explicaciones personalizadas o sintesis de multiples fuentes queda fuera de su alcance.

## Enlaces

- HuggingFace: https://huggingface.co/sraivante/insurance-faq-scratch-retriever
- Modelo de comparacion all-MiniLM-L6-v2: https://huggingface.co/sentence-transformers/all-MiniLM-L6-v2
- No se han encontrado en la informacion proporcionada enlaces a papers, blogs, repositorios adicionales ni demos.
