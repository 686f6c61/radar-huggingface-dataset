# wissehva/AIR-small-1

## Resumen

AIR-small-1 es un ajuste fino (fine-tuning) del modelo HuggingFaceTB/SmolLM2-135M-Instruct, desarrollado por el usuario wissehva, especializado en la tarea de resumen de articulos de noticias en ingles. Forma parte de un proyecto academico sobre enrutamiento adaptativo de inferencia (*adaptive inference routing*), donde un router decide entre un modelo ligero (este) y uno pesado segun la dificultad de la tarea. Con 134.515.008 parametros y una ventana de contexto heredada de SmolLM2, el modelo esta pensado para ejecutarse en entornos con recursos muy limitados.

El modelo resuelve un problema concreto: generar resumenes extractivos-abstraidos de articulos periodisticos con un coste computacional minimo, aceptando en el prompt una longitud objetivo en palabras. Se distribuye bajo licencia Apache 2.0 y en formatos safetensors y GGUF, lo que facilita su despliegue tanto en pipelines de Hugging Face Transformers como en llama.cpp.

Su relevancia actual radica en su tamano reducido (0,8 GB de repositorio) y en que sirve como pieza ligera dentro de una arquitectura de enrutamiento, un patron cada vez mas comun para reducir costes de inferencia en produccion. No obstante, sus prestaciones en ROUGE quedan por debajo del baseline extractivo Lead-3, lo que conviene tener en cuenta.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (derivada de SmolLM2-135M-Instruct) |
| Parametros totales | 134.515.008 |
| Parametros activos | no disponible (no es MoE) |
| Longitud de contexto | no disponible (heredada de SmolLM2-135M-Instruct; los articulos se truncan a 512 tokens en entrenamiento) |
| Tipos de cuantizacion | GGUF (se incluye `smollm2-BF16.gguf`); otras cuantizaciones no disponibles |
| Idiomas soportados | ingles (en) |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors, GGUF |

## Arquitectura y entrenamiento

El modelo es un transformer decoder-only de 135M de parametros, heredado de SmolLM2-135M-Instruct y ajustado mediante *full fine-tuning* (todos los pesos actualizados, sin LoRA ni adaptadores). No se han publicado detalles adicionales sobre la arquitectura interna (numero de capas, dimensiones de atencion, tipo de atencion) en la informacion disponible.

El entrenamiento utilizo los primeros 20.000 articulos del split de entrenamiento de CNN/DailyMail 3.0.0, barajados con semilla 42, durante una sola epoca. Los articulos se truncaron a 512 tokens y la longitud de resumen solicitada en el prompt se fijo a la longitud de referencia redondeada a decenas de palabras. No se menciona el uso de RLHF, DPO ni tecnicas de alineacion adicionales; el ajuste es puramente supervisado sobre pares articulo-resumen. Tampoco se documentan innovaciones tecnicas como decodificacion especulativa o atencion lineal.

## Capacidades

- Generacion de texto y resumen de articulos de noticias en ingles.
- Resumen con longitud controlable mediante instruccion explicita en el prompt (`{words}` palabras, `{n}` frases).
- Conversacion en el formato chat de SmolLM2-Instruct (requiere su mensaje de sistema por defecto).
- Generacion condicionada al formato exacto de instruccion usado en entrenamiento.
- Capacidades multilingues: solo ingles.
- No se documenta soporte de tool calling, function calling, agentes, vision ni audio.
- No se documenta modo de razonamiento (*thinking mode*) ni capacidades de codigo o matematicas.

## Casos de uso

- Resumen automatico de noticias en un pipeline editorial: el modelo recibe el articulo entre etiquetas `<document>` y devuelve un resumen de longitud controlada, adecuado para generar *snippets* o entradillas a bajo coste.
- Componente ligero en un router de inferencia adaptativa: actua como primera pasada para articulos sencillos y delega en un modelo pesado cuando la calidad no alcanza un umbral, reduciendo el coste medio por peticion.
- Generacion de resumenes en dispositivos con recursos limitados: al ocupar 0,8 GB en el repositorio y disponer de version GGUF, puede ejecutarse en CPU o en GPU de gama baja mediante llama.cpp.
- Preprocesado de corpus periodisticos: resumir grandes volumenes de articulos para indexacion, busqueda o construccion de datasets derivados antes de un analisis posterior.
- Prototipado rapido de funcionalidades de resumen: su licencia Apache 2.0 y su tamano permiten integrarlo en demos y pruebas de concepto sin coste de infraestructura elevado.
- Filtrado y triaje de noticias: generar resumenes cortos para clasificar o priorizar articulos en un sistema de monitorizacion de medios, dado el bajo coste por inferencia.

## Benchmarks y rendimiento

Resultados publicados por el autor sobre los primeros 500 articulos de una muestra de test de 2.000, con decodificacion greedy:

| Modelo | ROUGE-1 | ROUGE-2 | ROUGE-L | Palabras |
|---|---|---|---|---|
| Lead-3 (tres primeras frases) | 0,402 | 0,177 | 0,365 | 78 |
| AIR-small-1 | 0,358 | 0,144 | 0,332 | 66 |

El modelo queda por debajo del baseline extractivo Lead-3 en las tres metricas ROUGE, con resumenes algo mas cortos (66 frente a 78 palabras). No se han publicado resultados de otros benchmarks (MMLU, HumanEval, GSM8K) en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia: inferior a 1 GB en BF16 (135M de parametros), y del orden de 100-200 MB en cuantizaciones GGUF de 4-8 bits (estimacion, no publicada por el autor).
- GPU recomendadas: cualquier GPU consumer moderna es suficiente; el modelo cabe holgadamente en RTX 3060, RTX 4060, RTX 4090, e incluso en GPUs integradas o CPU.
- Cabe en GPU consumer: si, en practicamente todas las disponibles en el mercado.
- Opciones de despliegue: Transformers (safetensors), llama.cpp (GGUF incluido), y potencialmente Ollama o TGI si se genera el formato correspondiente (no documentado por el autor).
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Enfoque | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| AIR-small-1 | 134,5M | no disponible | Resumen de noticias (fine-tuning de SmolLM2) | Apache 2.0 | Hugging Face (68 descargas) |
| HuggingFaceTB/SmolLM2-135M-Instruct | 135M | no disponible | Instruccion general | Apache 2.0 | Hugging Face (modelo base) |
| Lead-3 (baseline extractivo) | n/a | n/a | Resumen extractivo por reglas | n/a | Baseline de referencia |

Frente a su modelo base, AIR-small-1 esta especializado en resumen y pierde capacidades generales de instruccion fuera de ese dominio. Frente al baseline Lead-3, obtiene ROUGE inferiores pero genera resumenes abstractivos en lugar de extractivos. No se dispone de datos de otros modelos comparables en la informacion proporcionada.

## Limitaciones y advertencias

- Entrenado exclusivamente con articulos de noticias; entradas muy cortas o de otro dominio pueden provocar invencion de texto o repeticion de frases.
- Puede afirmar hechos que no aparecen en el articulo (alucinacion); la metrica ROUGE no detecta este fenomeno.
- Solo funciona con el formato de chat de SmolLM2-Instruct (con su mensaje de sistema por defecto) y con la instruccion exacta de entrenamiento; otros formatos degradan la calidad.
- Solo soporta ingles.
- Los articulos se truncan a 512 tokens durante el entrenamiento, por lo que entradas mas largas pueden perder informacion relevante.
- Rendimiento ROUGE por debajo del baseline extractivo Lead-3 en la evaluacion publicada.
- Licencia Apache 2.0: permite uso comercial, pero el autor no ofrece garantias sobre la calidad en produccion.
- Proyecto de estudiante con 68 descargas y 0 likes; no hay evidencia de validacion independiente ni mantenimiento a largo plazo.
- No se documentan evaluaciones de sesgo; al derivar de SmolLM2, puede heredar sesgos de sus datos de entrenamiento.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/wissehva/AIR-small-1
- Modelo base: https://huggingface.co/HuggingFaceTB/SmolLM2-135M-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/abisee/cnn_dailymail
