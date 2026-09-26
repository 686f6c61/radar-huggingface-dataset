# woduq132/thesis_repository

## Resumen

`woduq132/thesis_repository` es un repositorio de Hugging Face que agrupa los artefactos entrenados para la tesis de master *Exploring Pedagogical Alignment of LLMs Using Student Errors and Tutor Moves*, firmada por Jaeyeop Chung (Universidad Tecnica de Múnich, 2026). No es un unico modelo, sino una coleccion de cinco adaptadores LoRA sobre `meta-llama/Meta-Llama-3-8B-Instruct` (un adaptador SFT y tres variantes DPO con distintos umbrales de filtrado de preferencias) mas una familia de clasificadores de movimientos de tutor basados en `FacebookAI/roberta-base`. El problema que aborda es la alineacion pedagogica: conseguir que un LLM actue como tutor de matematicas que identifica errores del estudiante, los localiza, no revela la respuesta directamente y ofrece guia accionable en lugar de resolver el ejercicio.

El repositorio esta pensado como material reproducible de investigacion, no como modelo de produccion: tiene 0 descargas y 0 likes en el momento de la consulta, y cada subcarpeta incluye su propia model card. La contribucion tecnica principal es un pipeline SFT + DPO (con `trl` y PEFT) sobre turnos de tutor humanos del corpus MathDial, junto con un clasificador auxiliar que produce posteriores sobre movimientos del tutor (focus, generic, probing, telling) y que se usa para puntuar respuestas candidatas.

El conjunto de adaptadores pesa 0,7 GB en total. El idioma declarado es unicamente ingles (`en`) y la licencia del repositorio es la Llama 3 Community License, con la excepcion de los clasificadores RoBERTa, publicados bajo MIT.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptadores LoRA (PEFT) sobre transformer decoder-only Llama-3-8B-Instruct; clasificador encoder-only RoBERTa-base |
| Parametros totales | 8.030 M (modelo base Llama-3-8B-Instruct) + 125 M (RoBERTa-base); parametros del adaptador LoRA: no disponible (rango no publicado) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 8.192 tokens en los adaptadores Llama-3-8B (heredada del modelo base); 512 tokens en RoBERTa-base; no disponible para el pipeline de clasificacion de cuatro clases |
| Tipos de cuantizacion | No se publican cuantizaciones propias. Al ser adaptadores LoRA, la cuantizacion se aplica al modelo base fusionado (bitsandbytes 4/8 bits, GGUF) |
| Idiomas soportados | Ingles (`en`) unicamente |
| Licencia | Llama 3 Community License (adaptadores Llama-3, "Built with Meta Llama 3"); MIT (clasificadores RoBERTa-base). Tag del repositorio: `llama3` |
| Formato de pesos | safetensors (adaptadores PEFT/LoRA y cabezas de clasificacion) |
| Tamano del repositorio | 0,7 GB |
| Libreria | `peft` |
| Pipeline declarado | `text-generation` |
| Fecha de creacion / actualizacion | 2026-09-25 / 2026-09-25 |

## Arquitectura y entrenamiento

El componente generativo son cinco adaptadores LoRA sobre Llama-3-8B-Instruct, que no se reentrena en su totalidad. El primero es un adaptador SFT entrenado con `trl` sobre 8.111 turnos de tutor escritos por humanos procedentes de MathDial, y sirve como politica de referencia para las etapas posteriores. Sobre esa base se entrenan tres adaptadores DPO con distinto grado de filtrado de pares de preferencia: el 10 % superior por tipo de error (1.940 pares), el 30 % superior (5.828 pares) y el 50 % superior (9.719 pares). El objetivo de esta ablacion es medir como afecta la calidad y la cantidad de pares de preferencia a la alineacion pedagogica resultante. No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion completa del dataset ni el uso de RLHF; el metodo de alineacion declarado es DPO.

El componente discriminativo es un clasificador RoBERTa-base de cuatro clases (focus, generic, probing, telling) que recibe unicamente el turno del tutor y se optimiza maximizando AUC. El repositorio incluye ademas una subcarpeta opcional con las 18 configuraciones evaluadas en la tesis, resultado de cruzar tipo de encoder, tipo de entrada y objetivo de optimizacion, lo que permite reproducir la comparativa de la Seccion 5.1. Los posteriores de este clasificador se emplean para puntuar respuestas candidatas del tutor, es decir, actuan como componente de reranking o de evaluacion dentro del pipeline.

## Capacidades

- Generacion de texto conversacional en ingles con rol de tutor de matematicas, condicionada por el turno del estudiante.
- Identificacion y localizacion de errores en resoluciones de problemas por parte de estudiantes (dimensiones evaluadas de forma explicita en la tesis).
- Regulacion de la revelacion de la respuesta: el objetivo de alineacion es evitar que el tutor resuelva el ejercicio directamente.
- Generacion de guia accionable (proporcionar pistas y pasos siguientes) en lugar de soluciones completas.
- Clasificacion de movimientos de tutor en cuatro categorias (focus, generic, probing, telling) mediante el clasificador RoBERTa auxiliar.
- Puntuacion y comparacion de respuestas candidatas mediante los posteriores del clasificador.
- Ajuste fino adicional: al ser adaptadores PEFT, permiten entrenar variantes sobre el mismo modelo base sin duplicar los pesos completos.
- Tool calling, function calling, agentes, vision, audio, modo thinking y razonamiento multi-paso nativo: no documentado en la informacion disponible.
- Capacidades multilingues: no disponibles; el repositorio declara exclusivamente ingles.

## Casos de uso

- Tutoria automatica de matematicas en plataformas educativas: el adaptador DPO 50 % es la variante con mejor equilibrio en identificacion y localizacion de errores (83,9 % y 68,8 % de coincidencia con la anotacion deseada), por lo que resulta la opcion mas razonable para un tutor conversacional que deba detectar fallos sin resolver el ejercicio.
- Investigacion en alineacion pedagogica: los cuatro adaptadores (SFT, DPO 10 %, 30 % y 50 %) permiten reproducir el estudio del efecto del filtrado de pares de preferencia sobre dimensiones pedagogicas medibles, reutilizando la misma politica de referencia.
- Analisis de corpus educativos a escala: el clasificador RoBERTa-base (exactitud 0,736, macro-F1 0,642) puede etiquetar turnos de tutor en transcripciones de clases o logs de plataformas para estudiar la distribucion de movimientos pedagogicos.
- Reranking de respuestas generadas por otros sistemas: los posteriores del clasificador pueden combinarse con el modelo generativo para seleccionar, entre varias candidatas, la que corresponde al movimiento de tutor deseado.
- Generacion de datos sinteticos de dialogos de tutoria: el adaptador SFT sirve como generador de turnos de tutor con estilo humano (84,6 % de human-likeness segun el juez automatico) para aumentar datasets de entrenamiento en el dominio educativo.
- Formacion de docentes y simulacion: uso del modelo como tutor simulado para practicar tecnicas de andamiaje (scaffolding) y comparar las respuestas con las de tutores humanos del corpus MathDial.
- Evaluacion comparativa de LLM en tareas pedagogicas: el esquema DAMR y las 298 ventanas de test descritas permiten montar un banco de pruebas para medir si otros modelos respetan las restricciones pedagogicas (no revelar la respuesta, dar guia accionable, mantener tono alentador).
- Filtrado de calidad en pipelines de datos educativos: descartar turnos de tutor generados automaticamente que incumplan las dimensiones pedagogicas antes de incorporarlos a un dataset de entrenamiento.

## Benchmarks y rendimiento

Tasa de coincidencia con la anotacion deseada (DAMR, %) de las cinco variantes de tutor sobre los 298 contextos de test, evaluada con `gpt-4.1-mini` como juez. Cada valor es la proporcion de respuestas cuya etiqueta coincide con la etiqueta deseada de la dimension correspondiente (Seccion 5.3 de la tesis):

| Dimension (etiqueta deseada) | Base | SFT | DPO 10 % | DPO 30 % | DPO 50 % |
|---|---|---|---|---|---|
| Identificacion del error (Yes) | 95,3 | 41,6 | 63,1 | 65,1 | 83,9 |
| Localizacion del error (Yes) | 93,3 | 38,9 | 50,7 | 51,3 | 68,8 |
| Revelar la respuesta (No) | 98,7 | 94,0 | 70,1 | 88,6 | 80,9 |
| Proporcionar guia (Yes) | 88,6 | 28,2 | 14,4 | 22,8 | 27,2 |
| Accionabilidad (Yes) | 88,6 | 29,9 | 14,4 | 27,2 | 28,9 |
| Coherencia (Yes) | 99,7 | 97,7 | 90,9 | 95,3 | 96,3 |
| Tono del tutor (Encouraging) | 100,0 | 69,8 | 24,8 | 49,7 | 34,9 |
| Similitud con humano (Yes) | 99,7 | 84,6 | 48,3 | 72,8 | 62,4 |

Clasificador de movimientos del tutor (configuracion seleccionada, particion de test): exactitud 0,736; macro-F1 0,642; macro ROC-AUC 0,864; MCC 0,616.

No se han publicado otros resultados de benchmarks (MMLU, HumanEval, GSM8K u otros) en la informacion disponible.

## Requisitos de hardware

- Inferencia en bfloat16 de los adaptadores Llama-3-8B: aproximadamente 16 GB solo para pesos, mas cache KV; se recomienda un GPU con 24 GB o mas (RTX 4090, L4, A10G, A100 40 GB) para margen de contexto.
- Inferencia cuantizada a 4 bits: aproximadamente 6-8 GB de VRAM, lo que permite ejecutar en GPU de consumo como RTX 3060 12 GB, RTX 4070 o RTX 4060 Ti 16 GB.
- Inferencia a 8 bits: aproximadamente 10-12 GB de VRAM; cabe en RTX 4080/4090 y en GPUs de 16 GB con contexto reducido.
- Fine-tuning adicional de los adaptadores LoRA: viable en 24 GB en configuracion QLoRA de 4 bits; para entrenamiento completo del modelo base en bfloat16 se requieren multiples A100 80 GB o H100.
- Clasificador RoBERTa-base: aproximadamente 0,5 GB en fp32 y menos de 0,3 GB en fp16; puede ejecutarse en CPU sin problema.
- Opciones de despliegue: `transformers` + `peft` (ruta documentada por el autor), vLLM o TGI tras fusionar el adaptador con el modelo base, llama.cpp / Ollama tras convertir los pesos fusionados a GGUF. El clasificador se sirve con el pipeline `text-classification` de Transformers.
- Requisito de acceso: `meta-llama/Meta-Llama-3-8B-Instruct` esta restringido en el Hub; es necesario solicitar acceso y autenticarse con `hf auth login` antes de cargar los adaptadores.
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

No se dispone de datos publicados de modelos comparables (otros tutores de matematicas alineados pedagogicamente con metricas DAMR) en la informacion proporcionada. La comparativa posible se limita a las variantes internas del propio repositorio:

| Variante | Modelo base | Datos de entrenamiento | Contexto | Licencia | Perfil de uso |
|---|---|---|---|---|---|
| Base (sin adaptador) | Llama-3-8B-Instruct | no aplica | 8.192 tokens | Llama 3 Community License | Referencia de partida; alta identificacion de errores pero no ajustado al dominio |
| SFT | Llama-3-8B-Instruct + LoRA | 8.111 turnos humanos de MathDial | 8.192 tokens | Llama 3 Community License | Estilo humano alto; pierde capacidad de deteccion de errores |
| DPO 10 % | Llama-3-8B-Instruct + LoRA | 1.940 pares de preferencia | 8.192 tokens | Llama 3 Community License | Mayor proteccion del tono pero baja accionabilidad |
| DPO 30 % | Llama-3-8B-Instruct + LoRA | 5.828 pares de preferencia | 8.192 tokens | Llama 3 Community License | Mejor equilibrio de tono y coherencia |
| DPO 50 % | Llama-3-8B-Instruct + LoRA | 9.719 pares de preferencia | 8.192 tokens | Llama 3 Community License | Mejor identificacion y localizacion de errores |
| Clasificador RoBERTa | RoBERTa-base | turnos de tutor de MathDial | 512 tokens | MIT | Etiquetado de movimientos pedagogicos y reranking |

Alternativas de la misma categoria (modelos de tutoria o feedback educativo): no disponible en la informacion consultada.

## Limitaciones y advertencias

- Idioma: el repositorio declara unicamente ingles. No hay evidencia de entrenamiento ni evaluacion en castellano, por lo que su uso en espanol no esta validado.
- Sesgos conocidos: no se documentan analisis de sesgo en la informacion disponible. El entrenamiento se apoya en MathDial, un corpus concreto de dialogos de tutoria, lo que puede introducir sesgos de dominio y de estilo docente.
- Riesgo de alhallucinacion: no se reportan mediciones especificas; al ser un modelo de 8.000 millones de parametros especializado en matematicas, existe riesgo de errores de calculo y de referencias incorrectas al enunciado, especialmente cuando el contexto supera la ventana de entrenamiento.
- Degradacion respecto al modelo base: en varias dimensiones pedagogicas el ajuste empeora el comportamiento del modelo original (por ejemplo, identificacion del error cae de 95,3 a 41,6 con SFT; accionabilidad cae de 88,6 a 14,4 en DPO 10 %). Esto es un resultado del estudio, no un fallo puntual, y debe tenerse en cuenta antes de desplegar cualquier variante.
- Evaluacion con juez automatico: todas las metricas DAMR proceden de `gpt-4.1-mini` sobre 298 contextos de test. No se reporta validacion con anotadores humanos ni intervalos de confianza, por lo que la robustez estadistica de las diferencias no esta cuantificada.
- Tamano de datos reducido: 8.111 turnos de SFT y entre 1.940 y 9.719 pares de preferencia. El sobreajuste al dominio MathDial y la escasa generalizacion a otros dominios educativos son riesgos plausibles.
- Licencia: los adaptadores Llama-3 se rigen por la Llama 3 Community License, no por una licencia de codigo abierto permisiva; incluye obligaciones de atribucion ("Built with Meta Llama 3") y condiciones especificas para uso comercial que deben revisarse antes de un despliegue en produccion. Los clasificadores RoBERTa-base si son MIT.
- Acceso restringido al modelo base: sin acceso concedido a `meta-llama/Meta-Llama-3-8B-Instruct` los adaptadores no se pueden cargar, ya que solo contienen los pesos LoRA.
- Madurez del repositorio: 0 descargas, 0 likes, sin issues ni validacion de la comunidad. Las fechas de creacion y actualizacion registradas (2026-09-25) son posteriores a la fecha habitual de publicacion, lo que conviene verificar.
- Ausencia de soporte documentado para tool calling, agentes, vision o audio: no debe asumirse ninguna de estas capacidades.

## Enlaces

- Repositorio en Hugging Face: https://huggingface.co/woduq132/thesis_repository
- Codigo, datos y notebooks de la tesis: https://github.com/JaeyeopC/Thesis_Repository
- Modelo base generativo: https://huggingface.co/meta-llama/Meta-Llama-3-8B-Instruct
- Modelo base del clasificador: https://huggingface.co/FacebookAI/roberta-base
- Paper o publicacion formal de la tesis: no disponible
- Demos o espacios asociados: no disponible
- No se han encontrado otros enlaces relevantes para este modelo en la busqueda web realizada.
