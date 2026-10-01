# xw17/Qwen2.5-7B-Instruct_SFT_lora_wesad

## Resumen

xw17/Qwen2.5-7B-Instruct_SFT_lora_wesad es un ajuste fino publicado en HuggingFace por el usuario xw17. El nombre del repositorio indica que se trata de un adapter LoRA obtenido mediante fine-tuning supervisado (SFT) sobre el modelo base Qwen2.5-7B-Instruct, y que el corpus de ajuste está relacionado con WESAD, el dataset multimodal de detección de estrés y afecto con wearables presentado por Schmidt et al. en ICMI 2018. El repositorio ocupa 0,1 GB, un tamano coherente con pesos de adaptador y no con un modelo de 7.000 millones de parametros en precision completa.

La relevancia de esta ficha es limitada y conviene decirla con claridad: la model card es la plantilla automática de HuggingFace, sin ninguna sección completada. No se declara autoría real, licencia, idiomas, datos de entrenamiento, hiperparametros ni evaluación. El repositorio acumula 0 descargas y 0 likes en el momento de la consulta. Por tanto, todo lo que se puede afirmar con rigor se reduce a la identificacion del modelo base y a inferencias derivadas del nombre del repositorio, que se senalan como tales en cada apartado.

Para un desarrollador o investigador, este repositorio es relevante únicamente como punto de partida reproducible para experimentos de SFT con LoRA sobre series fisiologicas, o como ejemplo de adaptador sobre Qwen2.5-7B. No es un artefacto apto para producción sin una validación previa completa por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only con RoPE, SwiGLU, RMSNorm y atencion GQA (corresponde al modelo base Qwen2.5-7B-Instruct; no se documenta en el repositorio) |
| Parametros totales | 7.610 millones en el modelo base Qwen2.5-7B-Instruct. El repositorio ocupa 0,1 GB, compatible con un adaptador LoRA; el numero de parametros entrenados del adaptador no esta declarado |
| Parametros activos | no aplica (no es un modelo MoE) |
| Longitud de contexto | 131.072 tokens en el modelo base; no se documenta si el ajuste la modifica |
| Tipos de cuantizacion | no disponible en el repositorio; el modelo base admite GPTQ, AWQ, GGUF y cuantizacion de 8 y 4 bits vía bitsandbytes |
| Idiomas soportados | no disponible en el repositorio; el modelo base declara soporte para mas de 29 idiomas, entre ellos castellano, ingles y chino |
| Licencia | no disponible en el repositorio; el modelo base Qwen2.5-7B-Instruct se distribuye bajo licencia Apache 2.0 |
| Formato de pesos | safetensors |

Nota metodologica: las filas marcadas como procedentes del modelo base reflejan la documentacion publica de Qwen/Qwen2.5-7B-Instruct, no una confirmacion dentro de este repositorio. El autor no ha declarado ninguna de estas especificaciones.

## Arquitectura y entrenamiento

El modelo base Qwen2.5-7B-Instruct es un transformer decoder-only de 28 capas, con un tamano oculto de 3.584, 28 cabezas de atencion y 4 cabezas KV (atencion GQA), capa intermedia de 18.944 y vocabulario de 152.064 tokens. Incorpora RoPE para el codificado posicional, SwiGLU como funcion de activacion y RMSNorm. Fue entrenado por Alibaba Qwen sobre un corpus declarado de 18 billones de tokens, con una fase posterior de ajuste supervisado y optimizacion por preferencias (DPO). Se trata de un dato del modelo base, no del adaptador aqui descrito.

Sobre el proceso de entrenamiento de este repositorio concreto no hay informacion: la model card no especifica dataset, numero de tokens, rango o alpha del LoRA, tasa de aprendizaje, precision ni hardware. El sufijo "wesad" apunta a un ajuste sobre WESAD (Wearable Stress and Affect Detection), un dataset con senales fisiologicas de 15 sujetos que incluye ECG, EDA, EMG, respiracion, temperatura y acelerometro, habitualmente usado para clasificacion de estados afectivos. No hay constancia de como se habrian serializado esas senales como texto ni de si el ajuste persigue clasificacion, generacion de etiquetas o generacion de informes. Cualquier afirmacion al respecto seria especulacion. Tampoco se documenta si los pesos publicados son solo el adaptador o un modelo fusionado: el tamano de 0,1 GB sugiere lo primero.

## Capacidades

- Generacion de texto: heredada del modelo base, no verificada tras el ajuste.
- Razonamiento, matematicas y generacion de codigo: el modelo base cubre estas tareas; no hay evaluacion posterior al SFT.
- Tool calling y function calling: soportado por Qwen2.5-7B-Instruct; no se confirma que el ajuste lo preserve.
- Capacidades de agente y razonamiento multi-paso: presentes en el modelo base; sin verificar aqui.
- Multilingue: el modelo base declara mas de 29 idiomas, con buen rendimiento en castellano e ingles.
- Capacidad especifica del ajuste: presumiblemente relacionada con senales fisiologicas de WESAD (estres y afecto), segun el nombre del repositorio. No documentada ni verificable.
- No hay indicios de soporte de vision, audio o modo "thinking" explicito.

Advertencia importante: un ajuste LoRA sobre un corpus de dominio estrecho puede degradar las capacidades generales del modelo base (olvido catastrofico). Sin evaluacion publicada, no puede asumirse que las capacidades anteriores se mantengan intactas.

## Casos de uso

- Investigacion en deteccion de estres con wearables: el adaptador puede servir como punto de partida para reproducir o comparar pipelines que convierten series fisiologicas de WESAD en representaciones textuales y piden al modelo etiquetas o descripciones del estado afectivo. Es el uso que sugiere el nombre del repositorio.
- Generacion de informes en lenguaje natural a partir de registros fisiologicos: convertir ventanas de senales en texto estructurado (por ejemplo, un resumen de la sesion con indicios de activacion simpatetica) para revision posterior por un investigador.
- Reproducibilidad de experimentos de SFT con LoRA: el repositorio es util como referencia de configuracion para quienes quieran replicar el ajuste sobre Qwen2.5-7B-Instruct con otro corpus fisiologico.
- Linea base en estudios comparativos: usar este adaptador como referencia de un ajuste especifico de dominio frente al modelo base sin ajustar, siempre que se evalúe con un conjunto de prueba propio y bien definido.
- Prototipado local sobre hardware de consumo: al ser un adaptador pequeno, se puede cargar junto al modelo base cuantizado en 4 bits en una GPU de 8-12 GB mediante transformers + PEFT, útil para pruebas exploratorias.
- Asistente conversacional de proposito general: solo si una evaluacion propia confirma que el ajuste no ha degradado las capacidades del modelo base; en caso contrario, es preferible usar Qwen2.5-7B-Instruct directamente.
- Extraccion de informacion estructurada: solicitar al modelo que transforme notas o registros de sesion en JSON con campos definidos, aprovechando las capacidades de instruccion del modelo base.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

El repositorio no incluye ninguna seccion de evaluacion, ni metricas de MMLU, HumanEval, GSM8K ni de tareas de clasificacion sobre WESAD. Tampoco se declaran datos de precision, recall o F1 sobre las clases de estres del dataset. No procede extrapolar las cifras publicadas del modelo base, porque el ajuste puede alterarlas de forma sustancial.

## Requisitos de hardware

- El adaptador por si solo ocupa 0,1 GB, pero requiere cargar el modelo base Qwen2.5-7B-Instruct completo para funcionar.
- VRAM estimada para inferencia en bf16/fp16: aproximadamente 15,2 GB solo para pesos, mas activaciones y cache KV. En la practica, entre 18 y 20 GB con contextos moderados.
- VRAM estimada en cuantizacion de 8 bits: alrededor de 8 GB para pesos.
- VRAM estimada en cuantizacion de 4 bits: alrededor de 4,5 a 5,5 GB para pesos.
- Cache KV estimada para el modelo base: unos 56 KB por token, es decir, aproximadamente 1,8 GB con 32.000 tokens de contexto y unos 7,3 GB con 131.072 tokens. Estos valores son estimaciones calculadas a partir de la configuracion del modelo base.
- GPU recomendadas: A100 40 GB o 80 GB, H100 y L40S para despliegue en servidor; RTX 3090, RTX 4090 y RTX A6000 (24 GB) para bf16 en una sola tarjeta con contexto reducido.
- GPU de consumo: cabe en tarjetas de 24 GB en bf16 y en tarjetas de 8 a 12 GB si se aplica cuantizacion de 4 bits, aunque con contexto limitado.
- Opciones de despliegue: transformers con PEFT para cargar el adaptador; llama.cpp u Ollama tras fusionar el adaptador y exportar a GGUF; vLLM y TGI si se dispone del modelo fusionado en safetensors.
- Latencia y throughput: no disponible. No se han publicado mediciones de tokens por segundo ni de latencia de primer token.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xw17/Qwen2.5-7B-Instruct_SFT_lora_wesad | Adaptador LoRA sobre 7,61 B (no declarado) | No declarado; 131.072 tokens en el base | No declarada en el repositorio | HuggingFace, 0 descargas |
| Qwen/Qwen2.5-7B-Instruct | 7,61 B | 131.072 tokens | Apache 2.0 | HuggingFace, ampliamente utilizado |
| meta-llama/Llama-3.1-8B-Instruct | 8,03 B | 131.072 tokens | Licencia comunitaria de Llama 3.1 | HuggingFace, con aceptacion de terminos |
| mistralai/Mistral-7B-Instruct-v0.3 | 7,25 B | 32.768 tokens | Apache 2.0 | HuggingFace |

No se incluyen cifras de rendimiento comparado porque este repositorio no publica evaluaciones. Para comparar capacidades reales hay que remitirse a las model cards oficiales de cada modelo base y realizar una evaluacion propia del adaptador.

## Limitaciones y advertencias

- Model card vacia: es la plantilla automatica de HuggingFace, sin una sola seccion completada. No hay informacion sobre autoria, datos, entrenamiento ni uso previsto.
- Licencia no declarada para el adaptador. Aunque el modelo base es Apache 2.0, la ausencia de licencia explicita en este repositorio deja el uso comercial en una situacion juridicamente ambigua.
- No se especifica si el repositorio contiene el adaptador LoRA o un modelo fusionado. El tamano de 0,1 GB apunta a un adaptador, pero no esta confirmado.
- Riesgo de olvido catastrofico: un ajuste sobre un corpus de dominio estrecho puede degradar las capacidades generales del modelo base. No hay evaluacion que lo descarte.
- Riesgo de sobreajuste: WESAD contiene datos de solo 15 sujetos, lo que limita la generalizacion si el ajuste se hizo sobre la totalidad del dataset.
- Sesgos: no evaluados ni documentados. Los modelos de la familia Qwen presentan sesgos conocidos en tareas culturales, de genero y de representacion geografica, y el ajuste no los corrige.
- Alucinacion: el modelo base puede generar contenido plausible pero falso, especialmente en dominios especializados. En un contexto de salud o fisiologia, este riesgo exige revision humana obligatoria.
- Limitaciones de idioma: el ajuste se habria realizado previsiblemente sobre datos en ingles (WESAD procede de un estudio en Alemania y se documenta en ingles). El rendimiento en castellano tras el ajuste no esta verificado.
- Etiqueta arxiv:1910.09700: corresponde al articulo de Lacoste et al. sobre el calculador de impacto ambiental, incluido por defecto en la plantilla. No es una referencia al modelo.
- Uso clinico: no debe emplearse para diagnostico, triaje ni decisiones sobre salud sin validacion regulatoria y supervision profesional.
- Uso de WESAD: el dataset original impone condiciones de uso orientadas a investigacion; conviene revisar sus terminos antes de reutilizar cualquier derivado.
- Sin soporte ni mantenimiento: cero descargas y cero likes, sin historial de issues ni de actualizaciones.

## Enlaces

- Repositorio del modelo: https://huggingface.co/xw17/Qwen2.5-7B-Instruct_SFT_lora_wesad
- Modelo base Qwen2.5-7B-Instruct: https://huggingface.co/Qwen/Qwen2.5-7B-Instruct
- Blog de la familia Qwen2.5: https://qwenlm.github.io/blog/qwen2.5/
- Informe tecnico de Qwen2.5: https://arxiv.org/abs/2412.15115
- Dataset WESAD (pagina oficial): https://ubicomp.eti.uni-siegen.de/home/datasets/icmi18/
- Articulo de WESAD, Schmidt et al., ICMI 2018: https://doi.org/10.1145/3242969.3242985
- Articulo del calculador de impacto ambiental (etiqueta arxiv del repositorio): https://arxiv.org/abs/1910.09700
