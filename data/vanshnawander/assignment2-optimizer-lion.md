# vanshnawander/assignment2-optimizer-lion

## Resumen

`vanshnawander/assignment2-optimizer-lion` es un Transformer decoder-only de arquitectura personalizada, publicado en HuggingFace por el usuario vanshnawander. El identificador del repositorio y la etiqueta `optimizer` apuntan a un ejercicio academico (un "assignment") en el que se entrena un modelo desde cero, presumiblemente con el optimizador Lion, y se empaqueta con codigo fuente propio en PyTorch en lugar de usar una clase estandar de `transformers`. El modelo tiene 35.402.752 parametros totales y activos por token (es denso, no MoE), seis capas, ocho cabezas de atencion, tamano oculto 512, una ventana de contexto de solo 256 tokens y un vocabulario byte-level BPE de 32.000 tokens.

La model card lo describe como un modelo entrenado para continuacion de texto humano/IA, con soporte de prompts de traduccion mediante IDs de idioma en el tokenizador (`VI=4` y `JA=5`, es decir, vietnamita y japones). Los unicos resultados de evaluacion publicados son una perplejidad de test de 41,4004 y un BLEU de 1,2868, cifras que situan al modelo lejos de cualquier uso en produccion y que son coherentes con un artefacto de aprendizaje de tamano reducido y probablemente poco entrenado.

Su relevancia es, por tanto, didactica y experimental: sirve como ejemplo de como publicar una arquitectura no soportada de forma nativa por `transformers` (carga mediante `snapshot_download` e importacion directa del codigo fuente), de como estructurar prompts con tokens especiales de idioma y de como evaluar un modelo pequeno con perplejidad y BLEU. No es un modelo pensado para tareas reales ni para despliegue comercial.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only personalizado (denso, sin MoE) |
| Parametros totales | 35.402.752 |
| Parametros activos | 35.402.752 por token (no es MoE; no aplica distincion activos/totales) |
| Longitud de contexto | 256 tokens |
| Tipos de cuantizacion | no disponible (solo se publican pesos en `model_state.pt`; no hay variantes GGUF, AWQ ni GPTQ) |
| Idiomas soportados | no disponible en la model card; el tokenizador define IDs de idioma `VI=4` y `JA=5`, lo que sugiere tareas de traduccion a vietnamita y japones |
| Licencia | no disponible |
| Formato de pesos | PyTorch (`model_state.pt`, solo tensores) mas codigo fuente Python personalizado (`load_model.py`, `decoding.py`) |
| Numero de capas | 6 |
| Cabezas de atencion | 8 |
| Tamano oculto | 512 |
| Vocabulario | 32.000 tokens (byte-level BPE) |
| Tokens especiales | PAD=0, BOS=1, EOS=2, SEP=3, VI=4, JA=5 |
| Optimizador | no confirmado en la model card; el nombre del repositorio sugiere Lion |
| Tamano del repositorio | 0,1 GB |
| Libreria declarada | pytorch |

## Arquitectura y entrenamiento

El modelo es un Transformer decoder-only clasico y denso: seis capas, ocho cabezas de atencion y un tamano oculto de 512, con un vocabulario byte-level BPE de 32.000 entradas. No emplea mezcla de expertos (MoE), atencion lineal ni arquitecturas hibridas tipo SSM; se trata de un decoder convencional con atencion completa sobre una ventana muy corta de 256 tokens. La arquitectura no se distribuye como una clase de `transformers`, sino como codigo PyTorch plano que el autor indica revisar antes de importar, y que se carga con `snapshot_download` mas `sys.path.insert` y `from load_model import load_model`.

El proceso de entrenamiento no esta documentado en la informacion disponible: no se especifica el numero de tokens, la composicion del corpus, ni si hubo fases de RLHF o DPO. La model card afirma que los ajustes de entrenamiento y los resultados de evaluacion estan incluidos como ficheros JSON en el repositorio, pero el corpus de entrenamiento en bruto y las credenciales no se publican. El unico punto de anclaje sobre el entrenamiento es el propio nombre del repositorio, que sugiere el uso del optimizador Lion, aunque esto no se confirma explicitamente en el texto. El checkpoint distribuido contiene unicamente los tensores de pesos; los estados del optimizador y del generador aleatorio permanecen en los checkpoints locales originales, por lo que el entrenamiento no puede reanudarse a partir de lo publicado.

## Capacidades

- Generacion de texto autoregresiva: continuacion de texto mediante prompts con formato `[BOS, text_tokens...]`.
- Continuacion de texto humano/IA: la model card indica que fue entrenado para continuacion de texto humano y de IA.
- Traduccion guiada por prompt: usa el formato `[BOS, language_id, source_tokens..., SEP]` con IDs de idioma dedicados para vietnamita (`VI=4`) y japones (`JA=5`).
- Tokenizacion byte-level BPE con 32.000 entradas, lo que permite representar texto arbitrario sin tokens fuera de vocabulario.
- Helpers de decodificacion: el fichero `decoding.py` incluye utilidades de decodificacion basadas en `forward`.
- Sin soporte conocido de tool calling ni function calling: no se documenta en la model card.
- Sin soporte de agentes ni razonamiento multi-paso: no se documenta.
- Sin capacidades de vision, audio ni modo de razonamiento explicito (thinking mode): no se documentan.
- Capacidad multilingue limitada y no cuantificada: solo se infieren vietnamita y japones a partir de los tokens especiales, sin datos de cobertura real.

## Casos de uso

- Material didactico para cursos de deep learning: el modelo ilustra de principio a fin como definir una arquitectura decoder-only propia, entrenarla con un optimizador personalizado (probablemente Lion) y publicarla en HuggingFace con codigo fuente en lugar de una clase estandar.
- Prototipado de pipelines de carga personalizada: sirve para practicar el patron `snapshot_download` + `sys.path` + `load_model`, util cuando se trabaja con arquitecturas que no estan integradas en `transformers`.
- Experimentacion con tokenizadores byte-level BPE: su vocabulario de 32.000 tokens y sus seis tokens especiales permiten estudiar como influye la tokenizacion en tareas de continuacion y traduccion con prompts estructurados.
- Pruebas de evaluacion con perplejidad y BLEU: dado que publica ambos valores (41,4004 y 1,2868), puede usarse como caso base para reproducir y comparar metodologias de evaluacion en modelos muy pequenos.
- Investigacion sobre deteccion o continuacion de texto humano frente a texto de IA: es el objetivo declarado del modelo y un escenario habitual en experimentos academicos sobre atribucion de autoria.
- Demostraciones locales de inferencia en hardware minimo: con 35 millones de parametros cabe en cualquier portatil o incluso en una Raspberry Pi, lo que lo hace util para talleres y demos sin GPU.
- Banco de pruebas de robustez frente a contexto corto: su ventana de 256 tokens permite estudiar el comportamiento de un modelo cuando se supera el limite y se trunca la entrada.

## Benchmarks y rendimiento

| Metrica | Resultado |
|---|---|
| Perplejidad (test) | 41,4004 |
| BLEU | 1,2868 |

No se han publicado en la informacion disponible resultados de benchmarks estandar como MMLU, HumanEval, GSM8K, HellaSwag o ARC. Los unicos datos facilitados son la perplejidad y el BLEU anteriores, sin indicar el conjunto de evaluacion, el idioma ni la tarea exacta sobre la que se calcularon.

## Requisitos de hardware

- VRAM estimada en FP32: aproximadamente 142 MB solo para pesos (35,4 M de parametros x 4 bytes), mas activaciones y buffers, en total del orden de unos cientos de MB.
- VRAM estimada en FP16/BF16: aproximadamente 71 MB para pesos; inferencia viable en cualquier GPU con 1 GB o mas.
- Caberia en cualquier GPU de consumo, incluidas GTX 1050, RTX 3050, RTX 4090, e incluso en CPU sin GPU dedicada dado el reducido numero de parametros.
- Modelos de datacenter como A100, H100, L40S o A10 estan sobradamente dimensionados; no se aprovecharian.
- Opciones de despliegue: al ser codigo PyTorch personalizado, la ruta natural es cargarlo con PyTorch directamente (`load_model.py`). vLLM, TGI, llama.cpp y Ollama no soportan esta arquitectura de forma nativa y requeririan trabajo de integracion; no se ha publicado ninguna variante GGUF.
- Latencia y throughput: no disponibles. No se han publicado mediciones de tokens por segundo ni de latencia por peticion.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Rendimiento publicado | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| vanshnawander/assignment2-optimizer-lion | 35,4 M | 256 tokens | Perplejidad 41,4; BLEU 1,29 | no disponible | HuggingFace, codigo personalizado |
| GPT-2 (small) | 124 M | 1.024 tokens | No comparable directamente | MIT | HuggingFace / transformers |
| Pythia-70M | 70 M | 2.048 tokens | Benchmarks publicados por el autor | Apache 2.0 | HuggingFace / transformers |
| TinyStories-33M | 33 M | 2.048 tokens | Benchmarks publicados por el autor | no disponible | HuggingFace / transformers |

Los modelos comparables se incluyen solo como referencia de tamano y contexto; no se dispone de una evaluacion comun que permita comparar rendimiento de forma directa con este modelo. La principal diferencia practica es que las alternativas se integran de forma nativa en `transformers` y ofrecen contextos sensiblemente mayores, mientras que este modelo exige cargar codigo fuente propio y se limita a 256 tokens.

## Limitaciones y advertencias

- Rendimiento muy bajo: una perplejidad de 41,4004 y un BLEU de 1,2868 indican una calidad de generacion pobre, insuficiente para tareas reales de produccion.
- Contexto muy corto: 256 tokens obligan a truncar cualquier entrada de cierta longitud, lo que rompe conversaciones multiturno y documentos largos.
- Licencia no disponible: sin terminos claros, el uso comercial queda en una situacion de incertidumbre legal y no deberia asumirse permitido.
- Riesgo de alucinacion y de texto incoherente: derivado del bajo rendimiento y del probable subentrenamiento; no se documenta ninguna mitigacion.
- Sesgos desconocidos: al no publicarse el corpus de entrenamiento ni su composicion, no es posible evaluar sesgos de genero, raza, idioma o ideologia.
- Idiomas sin cobertura confirmada: la model card no lista idiomas soportados; solo los tokens `VI` y `JA` sugieren un uso de traduccion, sin datos de calidad.
- Seguridad del codigo: el repositorio incluye codigo Python personalizado que debe importarse directamente; conviene revisarlo antes de ejecutarlo, tal como advierte el propio autor.
- Checkpoint incompleto para reanudar entrenamiento: solo se distribuyen los tensores de pesos, no los estados del optimizador ni del generador aleatorio.
- Sin cuantizaciones ni formatos alternativos: no hay GGUF, AWQ ni GPTQ, lo que complica el despliegue en herramientas estandar como llama.cpp u Ollama.
- Fecha de creacion inusual: el repositorio figura creado el 2026-10-04, una fecha futura que sugiere metadatos no fiables y refuerza su caracter de artefacto experimental.

## Enlaces

- HuggingFace: https://huggingface.co/vanshnawander/assignment2-optimizer-lion

No se han encontrado en la informacion proporcionada otros enlaces (papers, blogs, repositorios de codigo o demos) asociados al modelo.
