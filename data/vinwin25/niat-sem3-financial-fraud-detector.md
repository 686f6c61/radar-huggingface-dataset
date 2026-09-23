# VinWin25/NIAT-Sem3-Financial-Fraud-Detector

## Resumen

NIAT-Sem3-Financial-Fraud-Detector es un ajuste fino supervisado (SFT) del modelo Qwen/Qwen2.5-1.5B-Instruct, publicado por el usuario VinWin25 en Hugging Face. El repositorio se generó automáticamente con la librería TRL y se etiqueta como `generated_from_trainer`, `trl` y `sft`, lo que indica un entrenamiento de ajuste supervisado estándar sobre el checkpoint instruct base, sin que la model card detalle el conjunto de datos, el número de pasos ni la composición del corpus utilizado.

El modelo se presenta bajo el nombre de un detector de fraude financiero, pero su naturaleza técnica es la de un modelo de lenguaje generativo de 1,5 mil millones de parámetros, no la de un clasificador binario de transacciones. Esto implica que su salida es texto en lenguaje natural y que, en caso de usarse para tareas de detección, requeriría un envoltorio de prompting, extracción estructurada y validación posterior antes de producir cualquier decisión operativa.

Su relevancia actual es limitada y debe evaluarse con cautela: el repositorio acumula 0 descargas y 0 likes, no declara licencia, idiomas ni benchmarks, y el tamaño del repositorio figura como 0,0 GB en los metadatos, lo que sugiere que los pesos pueden no estar efectivamente subidos o que la información de la API está incompleta. La utilidad principal de esta ficha es servir como referencia de un ejemplo típico de ajuste fino de bajo coste sobre un modelo pequeño, con las advertencias de trazabilidad y validación que ello conlleva.

## Especificaciones técnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only denso (heredada de Qwen2.5-1.5B-Instruct: atención con GQA, RoPE, RMSNorm y SwiGLU). El ajuste no modifica la arquitectura, solo los pesos |
| Parametros totales | 1,5 mil millones aproximadamente (derivados del modelo base Qwen2.5-1.5B-Instruct; la model card del ajuste no los declara de forma explícita) |
| Parametros activos | no aplica (modelo denso, no es MoE) |
| Longitud de contexto | no especificada en la model card; el modelo base Qwen2.5-1.5B-Instruct soporta 32.768 tokens nativos, ampliables a 131.072 con escalado YaRN. No hay confirmación de que el ajuste preserve esa configuración |
| Tipos de cuantizacion | no disponible. El repositorio publica pesos en safetensors (precisión original); el autor no distribuye versiones GGUF, GPTQ ni AWQ |
| Idiomas soportados | no disponible en la model card del ajuste. El modelo base declara soporte multilingüe (más de 29 idiomas, con inglés y chino como principales) |
| Licencia | no disponible. La model card contiene el marcador de posición `licence: license`, sin texto legal. El modelo base Qwen2.5-1.5B-Instruct se distribuye bajo Apache-2.0, pero el ajuste no hereda necesariamente esa declaración de forma explícita |
| Formato de pesos | safetensors (librería `transformers`) |

## Arquitectura y entrenamiento

La arquitectura subyacente corresponde al modelo Qwen2.5-1.5B-Instruct: un transformer decoder-only denso con normalización RMSNorm pre-attention, funciones de activación SwiGLU en el bloque feed-forward y atención con Grouped Query Attention (GQA), que reduce el tamaño de la caché KV al compartir cabezas de clave y valor. Según la documentación del modelo base, esta variante emplea 28 capas, un tamaño oculto de 1536 y una dimensión de cabeza de 128, con 12 cabezas de consulta y 2 de clave/valor; esa relación es la que permite desplegar el modelo con requisitos de memoria reducidos incluso con contextos largos.

El procedimiento de entrenamiento declarado es SFT (supervised fine-tuning) mediante TRL, con las siguientes versiones de framework reportadas: TRL 1.13.0, Transformers 5.16.1, PyTorch 2.11.0+cu128, Datasets 4.8.5 y Tokenizers 0.23.1. La model card no especifica el dataset empleado, el número de tokens de entrenamiento, la composición de las muestras, la duración del ajuste, los hiperparámetros ni si se aplicaron etapas posteriores de alineación como DPO o RLHF. Tampoco se documenta ninguna innovación técnica propia (decodificación especulativa, atención lineal, destilación o mezcla de expertos): se trata de un ajuste fino convencional sobre un checkpoint instruct ya existente.

## Capacidades

- Generación de texto conversacional multi-turno, en el formato de chat de Qwen2.5, con soporte de plantillas de rol (system, user, assistant).
- Razonamiento de propósito general y respuesta a instrucciones, en la medida en que lo permita un modelo de 1,5 mil millones de parámetros.
- Redacción y resumen de texto, incluyendo texto técnico o financiero, siempre que el contenido se proporcione en el prompt.
- Generación y explicación de código en lenguajes habituales, habilidad heredada del modelo base.
- Aritmética básica y razonamiento numérico sencillo, con tasa de error alta en cálculos de varios pasos.
- Soporte de tool calling / function calling: el modelo base Qwen2.5-Instruct documenta soporte de llamadas a funciones, pero la model card del ajuste no confirma que esa capacidad se haya preservado tras el SFT.
- Soporte multilingüe: no confirmado en el ajuste; heredable potencialmente del modelo base.
- Capacidades multimodales (visión, audio) y modo de razonamiento explícito (thinking mode): no disponibles.
- Clasificación de fraude como tal: no es una capacidad declarada ni verificable; el modelo no emite etiquetas ni probabilidades calibradas.

## Casos de uso

- Asistente de triaje documental en un equipo antifraude: el modelo puede recibir descripciones textuales de alertas y generar un borrador de resumen y preguntas de seguimiento para el analista humano. Es adecuado por su bajo coste de despliegue, siempre que la decisión final quede en manos de la persona y no del modelo.
- Generación de explicaciones en lenguaje natural para alertas ya generadas por un sistema determinista o un modelo de ML clásico: el modelo convierte puntuaciones y reglas en texto legible para auditores, sin intervenir en la detección.
- Extracción estructurada asistida por prompt de campos presentes en correos o reclamaciones (importe, fecha, contraparte), con validación posterior mediante expresiones regulares y esquemas JSON.
- Prototipado y pruebas de concepto educativas: el nombre del modelo sugiere un contexto de seminario o proyecto académico (la etiqueta "Sem3" apunta a un tercer semestre), por lo que resulta apropiado como ejercicio de ajuste fino y comparación de pipelines, no como componente de producción.
- Generación de datos sintéticos de apoyo para pruebas: redacción de transcripciones o narrativas ficticias de casos de fraude para poblar entornos de test, evitando usar datos personales reales.
- Chatbot interno de consulta sobre normativa y procedimientos antifraude: con recuperación aumentada (RAG) sobre la documentación corporativa, el modelo puede responder preguntas de proceso, aunque su ventana de contexto efectiva debe validarse.
- Envoltorio educativo para demostrar pipelines de TRL y Transformers: sirve como ejemplo reproducible de ajuste SFT y de integración con `pipeline` de Hugging Face.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card del ajuste no incluye métricas de MMLU, HumanEval, GSM8K ni de detección de fraude (precisión, recall, F1, AUC-PR), y no existe ninguna evaluación independiente asociada al repositorio. Cualquier cifra de rendimiento atribuida a este modelo carecería de respaldo documental.

## Requisitos de hardware

- VRAM estimada para inferencia: en FP16/BF16, aproximadamente 3,1 GB solo de pesos, más caché KV y activaciones, lo que sitúa el consumo práctico en torno a 4-5 GB con contextos moderados.
- En cuantización INT8: unos 1,6 GB de pesos y alrededor de 2,5-3 GB de consumo total.
- En cuantización INT4 (bitsandbytes o similar): entre 0,9 y 1,2 GB de pesos, con un consumo total cercano a 2 GB.
- Caché KV: con la configuración GQA del modelo base (2 cabezas KV, dimensión 128, 28 capas), el coste ronda los 28 KB por token en FP16, aproximadamente 0,9 GB a 32.000 tokens. Es un cálculo derivado de las especificaciones del modelo base, no una medición sobre este checkpoint.
- GPU recomendadas: cabe holgadamente en GPU de consumo como RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080 y RTX 4090, incluso en precisión completa. También es viable en GPU de 4-6 GB si se cuantiza a 4 bits y se limita la longitud de contexto.
- GPU de datacenter (A100, H100, L40S) sobredimensionadas para un modelo de este tamaño; solo tendrían sentido para servir muchas réplicas en paralelo.
- Opciones de despliegue: `transformers` con `pipeline` (el propio autor incluye un ejemplo), vLLM, TGI, SGLang y servidores compatibles con la API de OpenAI (el repositorio está etiquetado como `endpoints_compatible`). Para llama.cpp u Ollama sería necesario convertir los pesos a GGUF por cuenta propia, ya que el autor no publica ese formato.
- Latencia y throughput: no disponibles. No se han publicado mediciones sobre este checkpoint. Como referencia genérica para modelos densos de 1,5 B en FP16 sobre GPU de consumo, el throughput suele situarse en el orden de decenas a cientos de tokens por segundo, pero es una estimación orientativa no verificada para este modelo concreto.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad | Rendimiento en deteccion de fraude |
|---|---|---|---|---|---|
| VinWin25/NIAT-Sem3-Financial-Fraud-Detector | ~1,5 B (heredado) | no disponible | no disponible | Repositorio Hugging Face, 0 descargas | no disponible |
| Qwen/Qwen2.5-1.5B-Instruct (modelo base) | 1,5 B | 32.768 tokens nativos, ampliable a 131.072 con YaRN | Apache-2.0 | Ampliamente distribuido y documentado | no aplica (modelo de propósito general) |
| meta-llama/Llama-3.2-1B-Instruct | ~1,23 B | 128.000 tokens | Licencia comunitaria de Llama 3.2 | Ampliamente distribuido | no disponible |
| HuggingFaceTB/SmolLM2-1.7B-Instruct | ~1,7 B | 8.192 tokens | Apache-2.0 | Ampliamente distribuido | no disponible |

Los datos de los modelos alternativos proceden de sus respectivas model cards públicas y deben verificarse en la fuente original antes de tomar decisiones de arquitectura. No se ha identificado ningún ajuste fino comparable específicamente orientado a detección de fraude con el que establecer una comparación de rendimiento.

## Limitaciones y advertencias

- Ausencia total de licencia: la model card incluye el marcador `licence: license` sin texto legal. Sin una licencia explícita, no hay autorización clara para uso comercial ni para redistribución, y la situación respecto a la licencia Apache-2.0 del modelo base es ambigua.
- Repositorio sin tracción ni validación: 0 descargas, 0 likes y tamaño reportado de 0,0 GB. No hay evidencia de que los pesos estén accesibles, de que el entrenamiento se haya completado correctamente ni de que el modelo funcione según lo que sugiere su nombre.
- Vocación declarada frente a realidad técnica: se llama "Financial Fraud Detector" pero es un modelo generativo de chat. No produce etiquetas de fraude, puntuaciones calibradas ni salidas estructuradas verificables. Usarlo como detector directo daría lugar a resultados no reproducibles y difíciles de auditar.
- Riesgo elevado de alucinación, agravado por el tamaño reducido del modelo (1,5 B). En dominios regulados como el financiero, una explicación inventada o una cifra errónea puede tener consecuencias legales y económicas.
- Sesgos desconocidos: no se documenta el dataset de ajuste, por lo que no es posible evaluar sesgos demográficos, geográficos o de idioma, ni la representatividad de los casos de fraude cubiertos.
- Limitaciones de idioma no verificadas: la model card no declara idiomas. El comportamiento en castellano es incierto y debería evaluarse explícitamente antes de cualquier uso.
- Contexto no confirmado: aunque el modelo base soporta 32.768 tokens, el ajuste podría haber alterado la configuración de RoPE. No hay datos al respecto.
- Capacidad de tool calling no confirmada tras el ajuste: puede haberse degradado, algo habitual cuando se aplica SFT sobre un checkpoint instruct sin cuidar el formato de llamada a funciones.
- Cumplimiento normativo: cualquier uso en decisión crediticia, scoring o detección automatizada de fraude en la Unión Europea queda sujeto al RGPD y, previsiblemente, a la consideración de sistema de alto riesgo bajo el Reglamento Europeo de IA. Este modelo, por sí solo, no cumple los requisitos de documentación, trazabilidad, supervisión humana ni evaluación de conformidad.
- Inconsistencia en los metadatos: la fecha de creación registrada (2026-09-23) es posterior a la de las versiones de framework declaradas y al contexto habitual de publicación, lo que refuerza la necesidad de tratar la información del repositorio con escepticismo.
- Ejemplo de uso inadecuado en la propia model card: el fragmento de código de inicio rápido propone una pregunta sobre viajes en el tiempo, no un caso de fraude. Esto sugiere que el ajuste puede no estar especializado realmente en el dominio que anuncia su nombre.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/VinWin25/NIAT-Sem3-Financial-Fraud-Detector
- Modelo base Qwen2.5-1.5B-Instruct: https://huggingface.co/Qwen/Qwen2.5-1.5B-Instruct
- Repositorio de TRL: https://github.com/huggingface/trl
- Paper de TRL (von Werra et al., 2020): https://github.com/huggingface/trl
- Referencias temáticas sobre detección de fraude con aprendizaje profundo (no afiliadas al modelo):
  - Revisión sistemática en ScienceDirect: https://www.sciencedirect.com/science/article/pii/S2666764925000372
  - Revisión de métodos de machine learning en MDPI: https://www.mdpi.com/2076-3417/15/21/11787
  - Blueprint de detección de fraude de NVIDIA: https://github.com/NVIDIA-AI-Blueprints/Financial-Fraud-Detection
  - Proyecto comunitario de detección de fraude: https://github.com/pushkar2201/AI-Based-Financial-Fraud-Detection-System
- Enlace descartado por no ser relevante: decodificador de VIN de driving-tests.org (https://driving-tests.org/vin-decoder/), que aparece por coincidencia con la cadena "VIN" del nombre del autor, no por relación con el modelo.
