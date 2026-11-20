# tablinum/Moon-Beam-16B-A3B

## Resumen

Moon-Beam-16B-A3B es un ajuste fino (finetune) del modelo MoE Moonlight-16B-A3B-Instruct de Moonshot AI, desarrollado por el colectivo Tablinum. Su proposito es especializar al modelo base en el uso de un "engram" de conocimiento externo llamado Tablinum-2: una biblioteca de 26 tablas de texto de referencia (Wikipedia, legislacion, documentacion de software, manuales de reparacion y bricolaje, filosofia, psicologia, libros de texto y articulos de investigacion) que el modelo consulta mediante recuperacion (retrieval-augmented generation). El modelo lee los pasajes recuperados, responde a partir de ellos cuando contienen la respuesta y declara no saberlo cuando no la contienen.

La arquitectura subyacente es la de Moonlight: un transformer con mezcla de expertos (MoE) de 15.960.111.936 parametros totales y 3B activos, con licencia MIT. El ajuste no anade conocimiento nuevo al modelo; segun el autor, lo que aporta el entrenamiento es calibracion: con los pasajes en mano, Moon-Beam encuentra la respuesta con una frecuencia similar a la de su modelo base, pero deja de adivinar cuando los pasajes no la contienen.

El modelo es relevante para quienes necesitan un sistema de consulta factual offline y autoalojado, con un sesgo explicito hacia la abstencion frente a la invencion. Esta disponible en BF16 (27 shards safetensors, 31,9 GB) y en cuantizaciones GGUF para llama.cpp, con la variante IQ3 (8,06 GB) como recomendada por el autor.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer con mezcla de expertos (MoE), configuracion `deepseek_v3` |
| Parametros totales | 15.960.111.936 (aprox. 16B) |
| Parametros activos | 3B (A3B) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | BF16 (original); GGUF IQ2_XXS (6,08 GB), IQ3_XXS (8,06 GB, recomendada), IQ4 (9,67 GB) |
| Idiomas soportados | Ingles (`en`) |
| Licencia | MIT |
| Formato de pesos | safetensors (27 shards, BF16) y GGUF |

## Arquitectura y entrenamiento

Moon-Beam hereda la arquitectura del modelo base Moonlight-16B-A3B-Instruct, un transformer con mezcla de expertos que activa aproximadamente 3B de sus 16B parametros por token. El repositorio incluye codigo remoto (`custom_code`) y el tokenizer de Moonlight (`tiktoken.model`), y los pesos se distribuyen en el layout original de Moonlight en 27 shards safetensors que suman 31,9 GB. No se detalla en la informacion disponible el numero de tokens de entrenamiento, la composicion exacta del dataset de ajuste ni si se emplearon tecnicas de RLHF o DPO.

La innovacion declarada por el autor no esta en la arquitectura sino en el procedimiento de ajuste: el modelo se entrena para explotar el engram Tablinum-2, una biblioteca de 26 tablas consultada con una unica busqueda sobre todas ellas, sin enrutador por dominio. Segun el autor, esa busqueda global situa el pasaje del sujeto correcto en el top 3 para el 95% de las preguntas de su benchmark interno EngramBench, y cuesta aproximadamente un punto de indice frente a enrutar cada pregunta a su tabla especifica. El entrenamiento se orienta a la calibracion: responder cuando el pasaje contiene la respuesta y abstenerse cuando no.

## Capacidades

- Generacion de texto conversacional en ingles a partir de pasajes recuperados (RAG).
- Respuesta factual y de procedimiento apoyada en las 26 tablas del engram Tablinum-2: nombres, fechas, definiciones, contenido de leyes y regulaciones, funcionamiento de APIs y comandos.
- Calibracion y abtencion: cuando los pasajes no contienen la respuesta, el modelo declara incertidumbre en lugar de inventar.
- Consulta unica sobre todas las tablas del engram sin enrutador por dominio.
- Uso como endpoint compatible con la API de OpenAI mediante `llama-server` o `mlx_lm.server`, con el paso de recuperacion aparte.
- No soporta tool calling ni function calling.
- No soporta agentes ni razonamiento multi-paso con herramientas.
- No dispone de navegacion web ni acceso a informacion en vivo.
- No soporta vision ni audio.
- Multilingue: solo ingles.

## Casos de uso

- Consulta factual sin conexion: el modelo responde a preguntas sobre nombres, fechas y definiciones a partir de los pasajes recuperados del engram, sin acceso a internet, lo que lo hace adecuado para entornos aislados o con requisitos de privacidad.
- Consulta normativa: dado un pasaje de las tablas de legislacion y regulacion, el modelo explica que dice la norma y se abstiene cuando el texto recuperado no cubre la pregunta, reduciendo el riesgo de citas inventadas.
- Soporte a desarrolladores sobre APIs y comandos: con la documentacion de software indexada en el engram, responde como funciona una API o un comando concreto a partir del pasaje correspondiente.
- Asistencia practica domestica: reparaciones, bricolaje, cocina y jardineria respondidas a partir de preguntas y respuestas reales de comunidad incluidas en las tablas.
- Estudio e investigacion: acompanante de consulta que cita lo que dicen sus fuentes y admite lagunas, util para revisar material de libros de texto y articulos indexados.
- Integracion en aplicaciones propias: al exponerse como endpoint compatible con OpenAI, puede incorporarse a un pipeline RAG interno donde el equipo gestione la recuperacion y el modelo actue como generador calibrado.
- Despliegue en hardware de consumo: la cuantizacion IQ3 de 8,06 GB permite ejecutar el sistema completo en equipos con recursos limitados mediante llama.cpp.

## Benchmarks y rendimiento

Resultados publicados por el autor. El indice se calcula como 100 × (correctas − incorrectas) / n, de modo que una respuesta incorrecta penaliza tanto como una correcta suma. Todas las variantes se evaluaron con la cuantizacion IQ3 y fueron calificadas por Claude Haiku contra las respuestas de referencia, emparejando las mismas preguntas; las preguntas que el calificador rechazo se descartaron para ambos modelos.

| Evaluacion (IQ3, emparejado) | Moonlight sin entrenar | Moon-Beam | correctas / incorrectas con engram |
|---|---:|---:|---:|
| EngramBench 502, las 26 tablas | −58,6 → +65,1 | −46,8 → +73,3 | 406 / 38 (sin entrenar: 406 / 79) |
| SimpleQA-verified 1000 | −88,6 → +17,7 | −36,0 → +34,9 | 504 / 155 (sin entrenar: 548 / 371) |
| AA-Omniscience test 400 | −75,5 → −42,5 | −57,2 → −16,5 | 78 / 144 (sin entrenar: 96 / 266) |

Calidad de las cuantizaciones GGUF respecto a los pesos BF16 del repositorio:

| GGUF | Tamano | KLD vs pesos (chat / wiki) | Mismo top-1 | EngramBench tabla propia | SimpleQA + engram |
|---|---:|---:|---:|---:|---:|
| IQ2_XXS | 6,08 GB | 0,114 / 0,235 | 89,1% | +73,7 | +31,6 |
| IQ3_XXS (recomendada) | 8,06 GB | 0,027 / 0,061 | 95,0% | +74,1 | +34,9 |

Otros datos reportados: GSM8K 71,8% (el autor lo senala como punto debil para matematicas multi-paso largas) y recuperacion del pasaje del sujeto correcto en el top 3 para el 95% de las preguntas de EngramBench con una unica busqueda sobre las 26 tablas.

## Requisitos de hardware

- VRAM estimada para inferencia: aproximadamente 8 GB con la cuantizacion IQ3_XXS (8,06 GB de pesos), unos 6 GB con IQ2_XXS y en torno a 10 GB con IQ4 (9,67 GB). Los pesos BF16 (31,9 GB) requieren al menos 32 GB de VRAM para caber completos.
- GPU recomendadas: no especificadas por el autor. Por tamano de pesos, las cuantizaciones GGUF son aptas para GPUs de consumo; los pesos BF16 encajan en A100 40/80 GB, H100 o configuraciones multi-GPU.
- GPU de consumo: si, con las cuantizaciones GGUF. El autor destaca explicitamente la build IQ3 de 8 GB como ejecutable en un ordenador personal; encajaria en GPUs con 8-12 GB de VRAM o mas, y potencialmente en configuraciones con offload a CPU.
- Opciones de despliegue: llama.cpp (`llama-server`) y MLX (`mlx_lm.server`) para las builds GGUF y el endpoint compatible con OpenAI; transformers para los pesos safetensors; el repositorio incluye la etiqueta `text-generation-inference`.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Activos | Contexto | Licencia | Enfoque |
|---|---|---|---|---|---|
| Moon-Beam-16B-A3B | 15,96B | 3B | no disponible | MIT | Finetune RAG calibrado sobre engram Tablinum-2 |
| Moonlight-16B-A3B-Instruct | 16B | 3B | no disponible | MIT | Modelo base generalista de Moonshot AI |
| Moon-Beam 8B | no disponible | no disponible | no disponible | no disponible | Variante en entrenamiento que anade tool calls, acciones web y modo thinking |

El autor reporta que Moon-Beam supera a Moonlight sin entrenar en las tres evaluaciones con engram (EngramBench +73,3 frente a +65,1; SimpleQA +34,9 frente a +17,7; AA-Omniscience −16,5 frente a −42,5), con el mismo numero de aciertos en EngramBench (406) pero muchas menos respuestas incorrectas (38 frente a 79). No se dispone de comparaciones con otros modelos de la misma categoria en la informacion proporcionada.

## Limitaciones y advertencias

- No dispone de acceso a informacion en vivo: no navega por la web ni consulta noticias, precios o meteorologia. Solo conoce su entrenamiento y los pasajes que se le proporcionan.
- No soporta tool calling, function calling ni razonamiento agentico multi-paso; el autor remite a la futura variante Moon-Beam 8B para esas capacidades.
- Rendimiento limitado en matematicas multi-paso largas (GSM8K 71,8%); el autor recomienda el modelo base o una herramienta de calculadora.
- Comportamiento inconsistente sobre sus propias capacidades: preguntado si puede buscar en la web o ejecutar codigo, a veces responde que si, aunque no puede. El autor probo prompts de sistema que lo corrigen y todos redujeron la precision en hechos faciles (20 de 24 correctas con el prompt original frente a 13-17 con los nuevos), por lo que la plantilla de chat se mantiene sin cambios.
- Dependencia de un artefacto externo: la biblioteca de conocimiento Tablinum-2 es una descarga separada. Sin ella, Moon-Beam es un modelo de chat general cuidadoso, no el sistema de consulta descrito.
- Idioma: solo ingles.
- No apto para decisiones medicas, legales o financieras; puede explicar lo que dice una fuente, pero no sustituye a un profesional.
- Riesgo de alucinacion reducido pero no eliminado: el entrenamiento prioriza la abtencion, y aun asi se registran respuestas incorrectas (38 en EngramBench, 155 en SimpleQA con engram).
- Sesgos conocidos: no documentados en la informacion disponible.
- Licencia MIT, que permite uso comercial; el modelo base Moonlight tambien es MIT. No se detallan restricciones adicionales.
- Longitud de contexto no disponible, lo que impide planificar el tamano maximo de los pasajes recuperados en produccion.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/tablinum/Moon-Beam-16B-A3B
- Archivos GGUF: https://huggingface.co/tablinum/Moon-Beam-16B-A3B-GGUF
- Dataset del engram Tablinum-2: https://huggingface.co/datasets/tablinum/tablinum-2
- Coleccion Moon-Beam: https://huggingface.co/collections/tablinum/moon-beam-6ae64ea51cef0d52d1461fc2
- Coleccion Lite-Beam: https://huggingface.co/collections/tablinum/lite-beam-6ad61ee3f54fc02b5d33af93
- Modelo base Moonlight-16B-A3B-Instruct: https://huggingface.co/moonshotai/Moonlight-16B-A3B-Instruct

Nota: las busquedas web realizadas devolvieron unicamente resultados sobre el termino arquitectonico romano "tablinum", sin relacion con el modelo. No se han encontrado papers, blogs ni demos adicionales del modelo en la informacion disponible.
