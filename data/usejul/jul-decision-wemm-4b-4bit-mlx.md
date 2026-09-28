# usejul/jul-decision-wemm-4b-4bit-mlx

## Resumen

jul-decision-wemm-4b-4bit es un modelo de decision de tipo "system one": no genera texto, sino que recibe un texto de estado y una pregunta tipada y devuelve una probabilidad por opcion en un unico forward pass. Se construye sobre tencent/WeMM-Embedding-4B, un modelo de embeddings de 4.840.211.456 parametros, congelado, al que se le anaden adaptadores LoRA de rango 16 sobre sus 248 capas Linear y una cabeza especifica por tipo de pregunta. El resultado se distribuye cuantizado a 4 bits en formato MLX, con un peso en disco de 2,8 GB, pensado para ejecutarse en Apple Silicon.

El modelo resuelve dos tipos concretos de decision: preguntas de si/no (denominadas Noul, por ejemplo "¿se pago a tiempo?") y preguntas de puntuacion (Score, por ejemplo umbrales de toxicidad o sentimiento). La innovacion practica es que un unico modelo en memoria cubre ambos tipos de pregunta, activando los adaptadores correspondientes solo cuando se consulta una pregunta Noul o Score; con los adaptadores desactivados, el modelo es exactamente WeMM-Embedding-4B y mantiene su comportamiento de embeddings para preguntas de tipo Choice (clasificacion y ranking por vectores).

Su relevancia es doble. Por un lado, demuestra que se puede convertir un modelo de embeddings en un clasificador de decisiones tipadas con un entrenamiento de una sola epoca en una GPU y 70 minutos. Por otro, lo hace sin sacrificar la funcion original: en el banco Jev (AG News, Banking77, Emotion, solo Choice) mantiene 0,857 zero-shot y 0,897 con autotune, identico al modelo base. La licencia Apache-2.0 y el soporte de ingles y frances lo hacen apto para uso comercial, con la limitacion clara de que el razonamiento aritmetico sobre fechas no funciona.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer de embeddings (WeMM-Embedding-4B) con adaptadores LoRA y cabezas de clasificacion por tipo de pregunta; la etiqueta qwen3_5 del repositorio apunta a una base de la familia Qwen3, sin detalle adicional en la informacion disponible |
| Parametros totales | 4.840.211.456 (4,84 mil millones) |
| Parametros activos | no aplica (no es un modelo MoE) |
| Parametros entrenables | 32,5 millones (LoRA rango 16 sobre 248 capas Linear) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | 4-bit (MLX, group size no especificado en la informacion disponible); los adaptadores se pueden aplicar tambien sobre PyTorch en bf16 |
| Idiomas soportados | ingles (en), frances (fr) |
| Licencia | Apache-2.0 |
| Formato de pesos | safetensors (cuantizacion MLX de 4 bits); adaptadores LoRA en cross/ de 65 MB; requiere custom_code |
| Tamano del repositorio | 2,8 GB |
| Tarea declarada (pipeline) | zero-shot-classification |
| Libreria | mlx (compatible con backend PyTorch) |
| Modelo base | tencent/WeMM-Embedding-4B |
| Version minima del runtime | jul 0.3.0 |

## Arquitectura y entrenamiento

El punto de partida es WeMM-Embedding-4B, que se mantiene completamente congelado. Sobre sus 248 capas Linear se insertan adaptadores LoRA de rango 16, que suman 32,5 millones de parametros y ocupan 65 MB, mas una cabeza de clasificacion independiente por tipo de pregunta. El modelo raiz se distribuye ya cuantizado a 4 bits en MLX y equivale en pesos a usejul/WeMM-Embedding-4B-mlx-4bit, el modelo por defecto del runtime jul. Los adaptadores no estan atados a MLX: en PyTorch se puede descargar unicamente el directorio cross/ y aplicar el backend torch, lo que da un modelo de 4 bits en MLX o en bf16 en PyTorch segun convenga.

El entrenamiento cubre tres familias de tarea con entropia cruzada: si/no relacional (parafrasis, inferencia, composiciones, fechas), si/no sobre un unico texto (topicos, intenciones, moderacion, clausulas contractuales) y puntuaciones (toxicidad, sentimiento hacia una empresa). Los datos son conjuntos publicos en ingles y frances bajo licencias que permiten uso comercial. El coste declarado es de una epoca en una sola GPU durante 70 minutos, lo que da una idea del caracter ligero del ajuste: al congelar el modelo base, el entrenamiento se limita a los adaptadores y las cabezas.

## Capacidades

- Decision si/no tipada (Noul): dada una premisa de estado y una pregunta, devuelve la probabilidad de "si" mediante un forward pass con la pregunta y el texto en un mismo prompt.
- Decision con puntuacion (Score): devuelve un valor continuo o una probabilidad calibrada para umbrales, por ejemplo toxicidad o sentimiento hacia una empresa.
- Clasificacion y ranking por vectores (Choice): con los adaptadores desactivados, el modelo funciona como embedding puro, leyendo el texto y cada opcion por separado; es la ruta para clasificacion zero-shot y para autotune.
- Razonamiento relacional: parafrasis (0,69 a 0,93) e inferencia tipo QNLI (0,79 a 0,87) mejoran de forma sustancial respecto al modelo base.
- Comparacion de fechas: determinar cual de dos fechas es anterior, si caen en el mismo mes o si un pago llego a tiempo alcanza 1,00 en el conjunto evaluado.
- Calibracion: el error de calibracion en preguntas si/no baja de 0,126 a 0,043, lo que hace utilizables las probabilidades como umbrales de decision.
- Multilingue limitado: ingles y frances, con preguntas de fechas formuladas libremente en ambos idiomas en la evaluacion.
- No soporta generacion de texto, tool calling, function calling, agentes, vision ni audio segun la informacion disponible: la salida es una probabilidad por opcion, no una secuencia generada.
- Conmutacion de adaptadores en caliente: jul activa el LoRA solo cuando se lee una pregunta Noul o Score y lo desactiva para el resto de usos.

## Casos de uso

- Verificacion de cumplimiento en facturacion y pagos: con el estado "factura vencida el 9 de mayo, pagada el 3 de mayo" y la pregunta "¿se pago a tiempo?", el modelo devuelve una probabilidad calibrada (error de calibracion 0,043) que se puede usar como semaforo automatico en un ERP. La comparacion de fechas es precisamente el caso donde rinde a 1,00.
- Moderacion de contenido y toxicidad: el tipo de pregunta Score se entreno sobre datos de toxicidad, de modo que un pipeline puede puntuar comentarios y aplicar umbrales configurables sin mantener un segundo modelo en memoria.
- Analisis de sentimiento hacia una marca: con el mismo tipo Score se puede medir la actitud hacia una empresa en resenas o tickets, y usar los adaptadores con el modelo base congelado para evitar deriva en el resto de tareas.
- Clasificacion de intenciones en atencion al cliente: mediante la ruta Choice (vectores), el modelo conserva 0,857 zero-shot y 0,897 con autotune en el banco Jev, suficiente para enrutar tickets hacia colas de soporte tecnicas, comerciales o de facturacion.
- Etiquetado de noticias y categorizacion documental: AG News forma parte de la evaluacion del banco Jev, de modo que sirve para clasificar articulos o documentos internos por categoria sin entrenamiento adicional.
- Revision de clausulas contractuales: el entrenamiento incluye si/no sobre clausulas de contrato, lo que permite comprobar automaticamente si un contrato contiene una clausula de renovacion tacita, de no competencia o de confidencialidad.
- Deteccion de parafrasis y deduplicacion semantica: la mejora de 0,69 a 0,93 en parafrasis lo hace util para agrupar preguntas equivalentes en un sistema de FAQ o para detectar duplicados en un corpus.
- Clasificacion de dificultad y notificaciones: los showcases publicos del proyecto usan wemm-4b-4bit para ranking de dificultad e intencion de notificaciones, aprovechando que el modelo esta optimizado para embeddings.
- Inferencia de relacion entre frases: la mejora de 0,79 a 0,87 en QNLI permite usarlo para verificar si un fragmento de documentacion responde a una pregunta dada, como paso de un sistema RAG.
- Ejecucion local en portatil de desarrollo: con 2,8 GB de pesos en 4 bits y unos 115 ms por decision si/no en un M4 Pro, es viable como clasificador embebido en herramientas de escritorio sin GPU dedicada.

## Benchmarks y rendimiento

Resultados declarados por el autor sobre el split de desarrollo de transfer-v9 (preguntas limpias, nunca vistas en entrenamiento), a traves de jul:

| Modelo / configuracion | Si/no | Score |
| --- | ---: | ---: |
| WeMM-Embedding-4B, solo vectores | 0,762 | 0,325 |
| jul-decision-wemm-4b-4bit, MLX 4-bit (M4 Pro, ~115 ms por si/no) | 0,841 | 0,300 |
| jul-decision-wemm-4b-4bit, PyTorch bf16 | 0,859 | 0,550 |

Otras metricas reportadas:

| Metrica | Antes (base) | Despues (con adaptadores) |
| --- | ---: | ---: |
| Parafrasis | 0,69 | 0,93 |
| Inferencia (QNLI) | 0,79 | 0,87 |
| Error de calibracion en si/no | 0,126 | 0,043 |

Banco Jev (AG News, Banking77, Emotion; solo preguntas Choice): 0,857 zero-shot y 0,897 con autotune, identico a lo que obtiene wemm-4b-4bit, es decir, los adaptadores no degradan la ruta de vectores.

Sobre fechas, con 390 preguntas formuladas libremente en ingles y frances: comparar dos fechas (cual va primero, mismo mes, si llego a tiempo) alcanza 1,00; calcular una diferencia (una edad, una garantia en meses, un ensayo en dias) queda cerca del azar, y las preguntas Score de ese tipo apenas mejoran en 4 bits.

## Requisitos de hardware

- VRAM/unificada estimada: aproximadamente 2,8 GB de pesos en 4 bits, mas overhead del runtime y de las activaciones; cabe holgadamente en cualquier Mac con 8 GB de memoria unificada o mas.
- GPU recomendadas: no se publican requisitos de GPU dedicada. El backend MLX esta pensado para Apple Silicon; el backend PyTorch en bf16 requiere una GPU con al menos ~10 GB de VRAM para los 4,84 mil millones de parametros, aunque en bf16 solo se descargan y aplican los adaptadores cross/ de 65 MB.
- Compatibilidad con GPU de consumo: si, en el caso de Apple Silicon (validado en M4 Pro). No hay datos publicados sobre RTX 4090, A100 o H100 para esta variante concreta.
- Opciones de despliegue: runtime jul (version 0.3.0 o superior, `pip install -U jul`), con backend MLX o backend PyTorch. El alta del modelo se hace con `jul models add jul-decision-wemm-4b-4bit --repo usejul/jul-decision-wemm-4b-4bit-mlx`, que adjunta los adaptadores automaticamente.
- vLLM, llama.cpp, Ollama y TGI no estan soportados segun la informacion disponible: el modelo requiere custom_code y no es un generador de texto.
- Latencia: ~115 ms por decision si/no en MLX 4-bit sobre M4 Pro. En escenarios de showcases con wemm-4b-4bit se reportan ~40 ms por decision en Apple Silicon tras la primera llamada, que carga el modelo en unos segundos.
- Throughput agregado: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Tipo | Idiomas | Licencia | Notas |
| --- | ---: | --- | --- | --- | --- |
| usejul/jul-decision-wemm-4b-4bit-mlx | 4,84 mil millones (32,5 M entrenables) | Decision tipada (si/no, Score) + embeddings | en, fr | Apache-2.0 | 2,8 GB en 4 bits, MLX, ~115 ms por decision en M4 Pro; si/no 0,841 |
| usejul/WeMM-Embedding-4B-mlx-4bit | 4,84 mil millones | Embeddings puros | en, fr | Apache-2.0 | Mismo modelo sin adaptadores; si/no 0,762 y Score 0,325; base para Choice y autotune |
| tencent/WeMM-Embedding-4B | 4,84 mil millones | Embeddings puros | no disponible | Apache-2.0 | Modelo original sin cuantizar ni adaptar, en precision completa |
| usejul/minicpm5-2b-decision-mlx-4bit | 2 mil millones (LoRA r=16 fusionado + cabeza pointer) | Decision tipada, una probabilidad por opcion | no disponible | no disponible | Alternativa mas pequena del mismo ecosistema, tambien en MLX 4 bits con group size 64 |

No se dispone de comparativas publicadas con clasificadores zero-shot generativos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No es un modelo generativo: no produce texto, no soporta tool calling ni agentes, y su salida es una probabilidad por opcion. Cualquier caso de uso que requiera redaccion o dialogo queda fuera de su alcance.
- Aritmetica de fechas: calcular diferencias (edades, garantias en meses, plazos en dias) rinde cerca del azar. Solo funciona la comparacion entre dos fechas. Las preguntas Score de este tipo apenas mejoran respecto al modelo base.
- El tipo Score se degrada en la cuantizacion a 4 bits: 0,300 frente a 0,550 en PyTorch bf16. Si la aplicacion depende de puntuaciones precisas, conviene usar el backend PyTorch.
- Respuesta "unknown": el modelo rara vez responde "unknown" cuando falta una fecha, lo que puede producir decisiones confiadas sobre informacion incompleta.
- Cobertura idiomatica limitada a ingles y frances. El castellano no esta declarado como idioma soportado.
- Longitud de contexto no publicada: no hay margen documentado para estados o preguntas largas, lo que obliga a validar empiricamente los casos con textos extensos.
- Riesgo de sesgo heredado de los conjuntos publicos de entrenamiento en las tareas de moderacion, toxicidad y sentimiento hacia empresas; no se documentan evaluaciones de sesgo en la informacion disponible.
- Requiere custom_code y el runtime jul 0.3.0 o superior: no se puede cargar con herramientas estandar de inferencia sin ese soporte.
- Licencia Apache-2.0, heredada de WeMM-Embedding-4B de Tencent, lo que permite uso comercial, pero conviene verificar las licencias de los conjuntos de datos publicos usados en el ajuste si el despliegue es critico.
- El repositorio registra 0 descargas y 0 likes, y no hay resultados de benchmarks independientes que reproduzcan las cifras del autor.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/usejul/jul-decision-wemm-4b-4bit-mlx
- Modelo base: https://huggingface.co/tencent/WeMM-Embedding-4B
- Version MLX 4-bit del modelo base: https://huggingface.co/usejul/WeMM-Embedding-4B-mlx-4bit
- Repositorio del runtime jul: https://github.com/usejul/jul
- Showcases oficiales: https://github.com/usejul/jul-showcases
- Showcases (fork): https://github.com/guyon-it-consulting/jul-showcases
- Perfil de la organizacion: https://huggingface.co/usejul
- Modelo alternativo del mismo ecosistema: https://huggingface.co/usejul/minicpm5-2b-decision-mlx-4bit
- Articulo sobre System One Models y Jev: https://typesafe.ai/blog/introducing-system-one-models-and-jev
