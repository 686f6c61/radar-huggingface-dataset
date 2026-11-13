# techbsai/techbs

## Resumen

techbs es un clasificador de texto basado en BERT, desarrollado por el usuario techbsai, que constituye el motor de clasificación de la aplicación TechBS. Su función es analizar transcripciones de charlas técnicas, pódcasts y keynotes para determinar si el ponente demuestra capacidad técnica real o, por el contrario, emplea un discurso vacío de contenido. El modelo clasifica el texto en siete etiquetas que la aplicación agrega posteriormente en tres categorías (LEGIT, NEUTRAL, BS) y en un campo técnico detectado (ciberseguridad, IA/ML o ingeniería de redes).

Técnicamente se trata de un ajuste fino (fine-tune) de google-bert/bert-base-uncased, la arquitectura transformer encoder de referencia de Google presentada en 2018. Cuenta con 109.487.623 parámetros totales y un repositorio de 0,4 GB en formato safetensors. La entrada esperada es de aproximadamente un minuto de habla transcrita, es decir, entre 40 y 150 palabras, lo que encaja con la ventana de contexto nativa de BERT (512 tokens).

Su relevancia es acotada pero específica: ofrece una solución lista para usar en la evaluación automática de contenido técnico hablado, un nicho poco cubierto por clasificadores genéricos. La versión publicada es la 1.0.0 y el modelo se distribuye con licencia Apache 2.0, lo que permite uso comercial sin restricciones adicionales.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer encoder (BERT base) |
| Parametros totales | 109.487.623 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | 512 tokens (ventana nativa de bert-base-uncased; no confirmado en la model card) |
| Tipos de cuantizacion | no disponible |
| Idiomas soportados | en (inglés) |
| Licencia | apache-2.0 |
| Formato de pesos | safetensors |
| Modelo base | google-bert/bert-base-uncased |
| Tarea (pipeline) | text-classification |
| Etiquetas | neutral, legit_cyber, legit_ai, legit_networking, bs_cyber, bs_ai, bs_networking |
| Versión | 1.0.0 |
| Tamaño del repositorio | 0,4 GB |

## Arquitectura y entrenamiento

El modelo es un fine-tune de bert-base-uncased, un transformer encoder de 12 capas con atención bidireccional completa y 109 millones de parámetros. La tarea de cabecera es clasificación de secuencias multietiqueta (single-label entre siete clases), sustituyendo la cabeza original de masked language modeling por una capa densa de clasificación. La entrada se procesa como texto plano tokenizado con el tokenizador WordPiece de BERT, y el modelo emite una distribución de probabilidad sobre las siete etiquetas definidas por el autor.

No se dispone de información sobre el corpus de entrenamiento: la model card no detalla el número de ejemplos, la composición del dataset, el proceso de anotación ni si se aplicaron técnicas de aumento de datos. Tampoco se documenta si hubo ajuste con RLHF, DPO u otras técnicas de alineación, algo poco habitual en clasificadores de este tipo. La única indicación sobre los datos es la naturaleza del input: fragmentos de habla transcrita de entre 40 y 150 palabras. No se documentan innovaciones técnicas adicionales como decodificación especulativa o atención lineal.

## Capacidades

- Clasificación de texto en siete categorías: neutral, legit_cyber, legit_ai, legit_networking, bs_cyber, bs_ai y bs_networking.
- Agregación a tres categorías de alto nivel (LEGIT, NEUTRAL, BS) y detección del campo técnico (ciberseguridad, IA/ML, ingeniería de redes) mediante la lógica de la aplicación TechBS.
- Evaluación de discurso técnico transcrito: identifica si un ponente demuestra conocimiento sustantivo o emplea lenguaje vacío.
- Procesamiento de fragmentos de aproximadamente un minuto de habla (40–150 palabras).
- Funcionamiento monolingüe en inglés.
- No soporta tool calling, function calling, razonamiento multi-paso, agentes, visión, audio ni modo de pensamiento (thinking mode); es un clasificador puro.

## Casos de uso

- Moderación y curación de contenido técnico: la aplicación TechBS usa el modelo para puntuar charlas, pódcasts y keynotes antes de publicarlas o recomendarlas, filtrando aquellas sin sustancia técnica demostrable.
- Evaluación de candidatos en entrevistas técnicas grabadas: a partir de la transcripción de una respuesta de 40–150 palabras, el modelo puede señalar si el candidato emplea terminología técnica coherente o recurre a relleno, como señal auxiliar para el reclutador.
- Análisis de calidad de conferencias y meetups: los organizadores pueden procesar las transcripciones de las sesiones y obtener una distribución LEGIT/NEUTRAL/BS para decidir qué ponentes invitar de nuevo.
- Investigación sobre comunicación técnica: permite etiquetar corpus de transcripciones y estudiar la prevalencia de discurso sin sustancia en distintos campos (ciberseguridad, IA, redes).
- Filtrado previo en pipelines de resumen automático: el clasificador puede actuar como etapa de triaje que descarte transcripciones de baja calidad antes de pasarlas a un modelo generativo más costoso.
- Detección de contenido engañoso en formación corporativa: aplicable a vídeos de capacitación interna para verificar que el material contiene contenido técnico real y no solo terminología de moda.
- Señal auxiliar en herramientas de coaching de ponentes: integrado en una aplicación que analiza la transcripción de un ensayo de charla y devuelve al usuario la categoría detectada junto con el campo técnico, para que ajuste el contenido.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en fp32 (109 millones de parámetros, aproximadamente 0,44 GB de pesos) y en torno a 0,25 GB en fp16.
- GPU recomendadas: cualquier GPU con al menos 1–2 GB de VRAM; no requiere A100 ni H100. Una NVIDIA T4, una RTX 3060 o incluso una GTX 1650 son suficientes.
- Cabe en GPU de consumo: sí, en prácticamente cualquier GPU consumer de los últimos diez años, y también en CPU para cargas moderadas.
- Opciones de despliegue: Hugging Face Transformers (pipeline de text-classification), vLLM (soporte de modelos encoder), Text Generation Inference no aplica por ser clasificador, ONNX Runtime, TorchScript y llama.cpp no aplica (no hay pesos GGUF publicados).
- Latencia y throughput estimados: no disponibles en la información proporcionada; por el tamaño del modelo, se espera latencia de milisegundos por muestra en GPU moderna, pero no se confirma con datos.

## Comparativa con modelos similares

| Modelo | Parámetros | Contexto | Tarea | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| techbs | 109,5 M | 512 tokens (nativo BERT) | Clasificación de discurso técnico (7 clases) | Apache 2.0 | Hugging Face (techbsai/techbs) |
| google-bert/bert-base-uncased | 110 M | 512 tokens | Masked LM y fine-tune genérico | Apache 2.0 | Hugging Face |
| distilbert-base-uncased | 66 M | 512 tokens | Masked LM y fine-tune genérico | Apache 2.0 | Hugging Face |
| roberta-base | 125 M | 514 tokens | Masked LM y fine-tune genérico | MIT | Hugging Face |

La comparativa se limita a los modelos base de la misma familia, ya que no se conocen clasificadores públicos equivalentes especializados en evaluar la sustancia técnica de discurso hablado. techbs se diferencia de los modelos base en que ya está ajustado para una tarea concreta, pero carece de benchmarks publicados que permitan comparar su rendimiento frente a un fine-tune alternativo.

## Limitaciones y advertencias

- Sesgos conocidos: no documentados por el autor; al entrenarse sobre transcripciones de charlas técnicas, puede heredar sesgos de selección de ponentes, acentos transcritos y temáticas sobrerrepresentadas.
- Riesgo de alucinación: bajo en sentido estricto (es un clasificador, no genera texto), pero puede producir clasificaciones erróneas con alta confianza, especialmente en textos ambiguos o fuera de distribución.
- Limitación de idioma: solo inglés; no se ha validado su comportamiento en castellano ni en otros idiomas.
- Limitación de longitud: diseñado para 40–150 palabras; entradas más largas pueden truncarse a la ventana de 512 tokens de BERT y perder contexto.
- Restricciones de licencia: Apache 2.0 permite uso comercial, modificación y redistribución con atribución; no se identifican restricciones adicionales.
- Caveats para producción: el modelo tiene 0 descargas y 0 likes en Hugging Face, sin validación externa ni benchmarks publicados; se recomienda evaluarlo con un conjunto propio antes de integrarlo en un flujo crítico. La lógica de agregación LEGIT/NEUTRAL/BS reside en la aplicación TechBS, no en el modelo, por lo que su comportamiento final depende de código externo no incluido en el repositorio.
- Dependencia de la calidad de la transcripción: errores de ASR (reconocimiento automático del habla) pueden degradar la clasificación de forma no documentada.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/techbsai/techbs
- Aplicación TechBS: https://techbs.ai
- Modelo base: https://huggingface.co/google-bert/bert-base-uncased
