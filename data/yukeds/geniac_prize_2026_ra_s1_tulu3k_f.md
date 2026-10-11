# YukeDS/geniac_prize_2026_rA_s1_tulu3k_f

## Resumen

YukeDS/geniac_prize_2026_rA_s1_tulu3k_f es un adaptador LoRA de primera etapa (Stage 1) construido sobre el modelo base Qwen/Qwen3-4B-Base. Lo desarrolla el usuario YukeDS en el marco de la fase de cribado (screening) del certamen GENIAC Prize 2026, tema 2. No es un modelo completo, sino un conjunto de pesos PEFT que debe fusionarse con el modelo base para su uso: el flujo previsto encadena Base -> Stage 1 (merge) -> Stage 2 (merge), con un segundo adaptador publicado por separado.

El adaptador se entrena sobre el subconjunto allenai/tulu-3-sft-personas-instruction-following, orientado al ajuste supervisado de instrucciones con personas y seguimiento de instrucciones. El modelo base subyacente, Qwen3-4B-Base, es un transformer denso decoder-only de aproximadamente 4.000 millones de parametros, con licencia Apache-2.0, lo que facilita su reutilizacion comercial.

Su relevancia es acotada: se trata de un artefacto de competicion con 0 descargas y 0 likes, sin resultados de benchmarks publicados ni model card detallada. Resulta de interes principalmente para quienes quieran reproducir el pipeline de dos etapas del GENIAC Prize 2026 o estudiar el ajuste LoRA sobre Qwen3-4B-Base con datos Tulu-3.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Adaptador LoRA sobre transformer denso decoder-only (modelo base Qwen3-4B-Base) |
| Parametros totales | No disponible para el adaptador (repo de 0,1 GB); modelo base: ~4.000 millones |
| Parametros activos | No aplica (modelo denso, no MoE) |
| Longitud de contexto | No indicada en la model card; heredada del modelo base Qwen3-4B-Base |
| Tipos de cuantizacion | El adaptador se distribuye en safetensors; admite cuantizacion tras fusionar con el base (GGUF, AWQ, GPTQ) |
| Idiomas soportados | No disponibles en la model card; dependen del modelo base Qwen3-4B-Base |
| Licencia | Apache-2.0 |
| Formato de pesos | Safetensors (formato PEFT/LoRA) |

## Arquitectura y entrenamiento

El artefacto es un adaptador LoRA (PEFT) sobre Qwen3-4B-Base, un transformer denso decoder-only de la familia Qwen3. El adaptador no modifica la arquitectura del modelo base; anade matrices de bajo rango que se fusionan con los pesos originales mediante la operacion merge. El rank y el alpha de la LoRA no se especifican en la model card, por lo que no es posible detallar la configuracion exacta del adaptador. El repositorio ocupa 0,1 GB, coherente con un adaptador de bajo rango sobre un modelo de 4.000 millones de parametros.

En cuanto a los datos, la Stage 1 usa allenai/tulu-3-sft-personas-instruction-following (licencia ODC-BY-1.0), un dataset de ajuste supervisado centrado en seguimiento de instrucciones y personas. La Stage 2, publicada aparte, emplea openai/prm800k (MIT), un conjunto de anotaciones de recompensa por procesos (PRM) orientado al razonamiento matematico paso a paso. El pipeline aplica ambos adaptadores en secuencia, lo que sugiere una estrategia de ajuste en dos fases: primero instrucciones generales, despues senal de razonamiento. No se documentan en la model card el numero de tokens, la composicion completa del dataset ni si hubo RLHF o DPO adicionales.

## Capacidades

- Generacion de texto y seguimiento de instrucciones, heredado del ajuste SFT sobre Tulu-3 personas e instruction following.
- Razonamiento paso a paso potenciado por la Stage 2 (entrenada con openai/prm800k), segun el diseno en dos etapas del autor.
- Capacidades del modelo base Qwen3-4B-Base (conocimiento general, generacion de texto), sujetas a lo que el propio base aporte.
- Soporte de tool calling y function calling: no documentado en la model card.
- Soporte de agentes y razonamiento multi-paso: no documentado explicitamente; la Stage 2 con PRM apunta en esa direccion, pero sin confirmacion en la ficha.
- Capacidades multilingues: no documentadas para el adaptador; dependen del base.
- Modo thinking, vision o audio: no disponibles.

## Casos de uso

- Reproduccion del pipeline GENIAC Prize 2026: fusionar Stage 1 y Stage 2 sobre Qwen3-4B-Base en el orden indicado para replicar la submission del certamen y evaluar la mejora de la Stage 2 con PRM.
- Ajuste supervisado sobre instrucciones: usar la Stage 1 como punto de partida para tareas de seguimiento de instrucciones y personalizacion de respuestas en un modelo de 4.000 millones.
- Investigacion en LoRA y PEFT: estudiar el efecto de encadenar dos adaptadores (SFT y PRM) sobre un mismo base, con un repositorio ligero de 0,1 GB facil de inspeccionar.
- Razonamiento matematico asistido: partiendo de que la Stage 2 usa openai/prm800k, emplear el modelo fusionado en la resolucion de problemas aritmeticos y algebraicos paso a paso, verificando resultados por su propension a errores.
- Prototipado educativo: desplegar el modelo en un cuaderno o demo local para experimentar con instrucciones y personas, dado el bajo coste de hardware de un modelo de 4.000 millones cuantizado.
- Base para fine-tuning posterior: utilizar el adaptador fusionado como inicializacion para tareas especificas de dominio, aprovechando la licencia Apache-2.0.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible. La model card no incluye metricas, y la busqueda web no devolvio resultados relevantes para este modelo (los enlaces recuperados tratan sobre personas famosas de Turkmenistan y no guardan relacion con el artefacto).

## Requisitos de hardware

- VRAM estimada para inferencia (modelo base de 4.000 millones tras fusionar los adaptadores): aproximadamente 8-9 GB en FP16, 4-5 GB en INT8, y 2,5-3,5 GB en cuantizacion GGUF de 4 bits.
- GPU recomendadas: NVIDIA A100, H100 o L40S para servicio en FP16/INT8; RTX 4090, A6000 o L4 para inferencia local.
- Cabe en GPU de consumo: si, en RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070/4080/4090 y superiores, especialmente con cuantizacion de 4 u 8 bits.
- Opciones de despliegue: vLLM, Text Generation Inference (TGI), llama.cpp, Ollama, y transformers con PEFT para cargar y fusionar los adaptadores antes de servir.
- Latencia y throughput: no disponibles. Dependeran del hardware, del backend y del nivel de cuantizacion; no hay datos publicados por el autor.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tipo | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| YukeDS/geniac_prize_2026_rA_s1_tulu3k_f | Adaptador sobre 4.000 M | No disponible | LoRA (Stage 1) | Apache-2.0 | HuggingFace, 0 descargas |
| Qwen/Qwen3-4B-Base | ~4.000 M | No disponible | Transformer denso | Apache-2.0 | HuggingFace |
| YukeDS/geniac_prize_2026_rA_s2_prm1k_none | Adaptador sobre 4.000 M | No disponible | LoRA (Stage 2) | No disponible | HuggingFace (adaptador hermano) |
| Qwen3-4B-Instruct | ~4.000 M | No disponible | Transformer denso ajustado | Apache-2.0 | HuggingFace |

No se dispone de datos de rendimiento comparativos entre estas opciones en la informacion proporcionada, por lo que la comparacion se limita a parametros, tipo, licencia y disponibilidad.

## Limitaciones y advertencias

- No es un modelo autonomo: requiere el modelo base Qwen/Qwen3-4B-Base y una fusion previa (merge) para funcionar; no puede usarse solo cargando los pesos LoRA sin transformers y PEFT.
- Dependencia de dos etapas: solo se documenta aqui la Stage 1; el rendimiento final depende de aplicar despues la Stage 2 (geniac_prize_2026_rA_s2_prm1k_none).
- Riesgo de alucinacion: inherente a un modelo base de 4.000 millones sin datos de evaluacion publicados; no hay verificacion de fiabilidad factual.
- Sesgos: los datasets Tulu-3 y personajes pueden introducir sesgos de estilo, idioma y perspectiva; no se documenta mitigacion.
- Limitaciones de contexto e idioma: no se especifican en la model card, por lo que se heredan del modelo base sin confirmacion para este adaptador.
- Sin benchmarks ni evaluacion publicada: no hay evidencia de rendimiento en MMLU, HumanEval, GSM8K u otras tareas; no apto para produccion sin evaluacion propia.
- Baja traccion: 0 descargas y 0 likes, sin senales de validacion por parte de la comunidad.
- Licencia Apache-2.0 del adaptador y del base, pero el dataset Tulu-3 es ODC-BY-1.0 y prm800k es MIT; conviene revisar las condiciones de atribucion de los datos de entrenamiento.
- Uso comercial: la licencia Apache-2.0 lo permite, pero la ausencia de documentacion y evaluacion desaconseja su uso en produccion sin pruebas previas.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/YukeDS/geniac_prize_2026_rA_s1_tulu3k_f
- Adaptador Stage 2: https://huggingface.co/YukeDS/geniac_prize_2026_rA_s2_prm1k_none
- Modelo base Qwen/Qwen3-4B-Base: https://huggingface.co/Qwen/Qwen3-4B-Base
- Dataset allenai/tulu-3-sft-personas-instruction-following: https://huggingface.co/datasets/allenai/tulu-3-sft-personas-instruction-following
- Dataset openai/prm800k: https://huggingface.co/datasets/openai/prm800k
- Licencia ODC Attribution 1.0: https://opendatacommons.org/licenses/by/1-0/
