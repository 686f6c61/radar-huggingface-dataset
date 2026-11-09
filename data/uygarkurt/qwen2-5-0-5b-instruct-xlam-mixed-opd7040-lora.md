# uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd7040-lora

## Resumen

El modelo `uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd7040-lora` es un adaptador LoRA entrenado sobre el modelo base `Qwen/Qwen2.5-0.5B-Instruct`. Lo desarrolla el usuario de Hugging Face uygarkurt y su proposito es especializar un modelo pequeno (0,5 mil millones de parametros) en tool calling estructurado y en la capacidad de abstenerse cuando las herramientas ofrecidas no son relevantes para la consulta. Se entrena mediante destilacion on-policy (OPD) usando `Qwen/Qwen2.5-3B-Instruct` como profesor congelado.

El adaptador se ha entrenado sobre el dataset `uygarkurt/xlam-tool-calling-mixed` durante 7.040 actualizaciones de OPD, con un tiempo de entrenamiento de 3 horas. La propuesta es relevante porque demuestra que un modelo de 0,5B puede mejorar sustancialmente en tareas de function calling (BFCL single-turn del 50,28% al 56,44%; exactitud de tool-call xLAM del 62,61% al 66,65%) manteniendo un coste de inferencia muy bajo, aunque con perdida de rendimiento en tareas de razonamiento matematico y cierta degradacion en la deteccion de irrelevancia.

El repositorio contiene unicamente los pesos del adaptador (PEFT/LoRA), no el modelo completo, y debe cargarse sobre el modelo base original de Qwen. La model card esta en ingles y el unico idioma declarado es el ingles. La licencia no esta especificada en la informacion disponible.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (Qwen2.5) con adaptador LoRA (PEFT) |
| Parametros totales | 0,5 mil millones (modelo base Qwen2.5-0.5B-Instruct); parametros del adaptador no disponibles |
| Parametros activos | no aplica (no es MoE) |
| Longitud de contexto | no disponible en la informacion proporcionada (el base Qwen2.5-0.5B-Instruct soporta contexto nativo de 32.768 tokens, aunque este dato no se confirma en la ficha del adaptador) |
| Tipos de cuantizacion | no disponible (el adaptador se distribuye en safetensors; la cuantizacion depende de la carga del base) |
| Idiomas soportados | en (ingles) |
| Licencia | no disponible |
| Formato de pesos | safetensors (adaptador LoRA; requiere cargar el base Qwen2.5-0.5B-Instruct) |

## Arquitectura y entrenamiento

El modelo es un adaptador LoRA sobre Qwen2.5-0.5B-Instruct, un transformer decoder-only de 0,5B parametros. El entrenamiento se realizo con Post-Training Lab mediante destilacion on-policy (OPD): el estudiante (el adaptador sobre el base) genera respuestas y aprende a partir de las probabilidades por token del profesor congelado `Qwen/Qwen2.5-3B-Instruct` sobre esas mismas respuestas. Se realizaron 7.040 actualizaciones de OPD sobre el dataset mixto de tool calling `uygarkurt/xlam-tool-calling-mixed`, con un tiempo de entrenamiento de 3 horas (excluyendo carga de modelos, preparacion de datos y evaluacion externa).

El objetivo del entrenamiento es doble: mejorar la precision en la generacion de llamadas a herramientas estructuradas (tool calling) y ensenar al modelo a abstenerse cuando las herramientas ofrecidas no son relevantes. No se menciona el uso de RLHF, DPO ni tecnicas de decodificacion especulativa o attention linear en la informacion disponible. El adaptador parte directamente del modelo instructivo base, sin fases intermedias de SFT documentadas.

## Capacidades

- Generacion de texto conversacional en ingles.
- Tool calling / function calling estructurado: genera llamadas a herramientas en formato estructurado, con mejora medida en exactitud de tool-call (xLAM ETC) y en precision de nombre de funcion (xLAM FNA).
- Abstención ante herramientas irrelevantes: capacidad entrenada explicitamente para no invocar herramientas cuando la consulta no encaja con las ofrecidas.
- Razonamiento basico y matematicas: mantiene capacidades del base, aunque con ligeras perdidas (MATH-500 baja del 15,80% al 13,60%).
- Seguimiento de instrucciones: mejora en IFEval (del 26,80% al 28,65% en precision estricta a nivel de prompt).
- Capacidades multilingues: limitadas al ingles segun la model card.
- No se documentan capacidades de vision, audio, agentes multi-paso ni modo thinking.

## Casos de uso

- Enrutamiento de consultas a APIs en produccion: el adaptador puede decidir que funcion invocar y con que argumentos en un asistente conversacional, con un coste de inferencia minimo al ejecutarse sobre un modelo de 0,5B. Adecuado cuando se despliega en CPU o GPU de gama baja.
- Filtrado de intenciones y abstención: util para decidir si una consulta debe derivarse a una herramienta o responderse en texto, gracias a la capacidad de abstencion entrenada (aunque con la cautela de la caida en el conjunto de irrelevancia).
- Prototipado rapido de agentes con tool calling: permite validar pipelines de function calling antes de escalar a modelos mayores, ya que el adaptador se carga sobre el base con PEFT y requiere pocos recursos.
- Asistentes de atencion al cliente con catalogo de acciones acotado: el modelo puede mapear peticiones a un conjunto fijo de funciones (consultar pedido, cancelar suscripcion, etc.) en ingles.
- Generacion de llamadas a herramientas en pipelines de CI/CD para pruebas: util para generar casos de prueba sinteticos de tool calling y validar esquemas JSON de funciones.
- Educacion e investigacion en destilacion on-policy: sirve como ejemplo reproducible de OPD aplicada a tool calling en modelos pequenos, con resultados de evaluacion publicados.
- Despliegue en entornos con recursos limitados (edge, CPU, GPUs consumer): al ser un modelo de 0,5B, cabe en hardware modesto y permite experimentar con function calling sin infraestructura dedicada.

## Benchmarks y rendimiento

Resultados publicados en la model card (porcentajes; primera fila es el base Qwen2.5-0.5B-Instruct, segunda el adaptador OPD):

| Checkpoint | Step | MMLU | MATH-500 | IFEval | xLAM ETC | xLAM FNA | BFCL Single-turn FC | Relevance | Irrelevance | Tiempo (h) |
|---|---|---|---|---|---|---|---|---|---|---|
| Qwen2.5-0.5B-Instruct (base) | — | 42,04% | 15,80% | 26,80% | 62,61% | 86,57% | 50,28% | 77,78% | 66,93% | — |
| OPD (este adaptador) | OPD 7.040 | 41,91% | 13,60% | 28,65% | 66,65% | 90,53% | 56,44% | 83,33% | 56,86% | 3,0 |

Notas: xLAM ETC es exactitud exacta de tool-call; xLAM FNA es exactitud de nombre de funcion. Las puntuaciones xLAM usan el split de test del dataset mixto con 2.546 ejemplos evaluados y 743 omitidos por el limite de prompt de 640 tokens. BFCL Single-turn FC agrega subconjuntos seleccionados de BFCL-v3 de un solo turno; Relevance e Irrelevance corresponden a subconjuntos de relevancia seleccionados. IFEval usa precision estricta a nivel de prompt. Las evaluaciones xLAM se realizaron con scripts propios de Post-Training Lab.

## Requisitos de hardware

- VRAM estimada para inferencia: al tratarse de un modelo de 0,5B parametros, en FP16 ocupa aproximadamente 1 GB de pesos; en cuantizacion de 8 bits, en torno a 0,5-0,6 GB; en 4 bits, en torno a 0,3-0,4 GB (estimaciones orientativas; no publicadas en la ficha).
- GPU recomendadas: cualquier GPU consumer moderna (RTX 3060, RTX 4060, RTX 4090) es suficiente; tambien cabe en CPU para inferencia de baja latencia moderada.
- Cabe en GPU consumer: si, practicamente en cualquier GPU con 2 GB o mas de VRAM.
- Opciones de despliegue: transformers con PEFT (carga del adaptador sobre el base), llama.cpp/Ollama si se fusionan y convierten los pesos a GGUF, vLLM o TGI tras fusionar el adaptador con el base. No se documentan opciones especificas en la model card.
- Latencia y throughput: no disponibles en la informacion proporcionada.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Tool calling | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| Este adaptador (sobre Qwen2.5-0.5B-Instruct) | 0,5B + LoRA | no disponible | Si, especializado (BFCL single-turn 56,44%) | no disponible | Hugging Face (adaptador PEFT) |
| Qwen/Qwen2.5-0.5B-Instruct (base) | 0,5B | 32.768 tokens (segun ficha oficial de Qwen) | Si, generico (BFCL single-turn 50,28%) | Apache 2.0 (segun ficha oficial de Qwen) | Hugging Face |
| Qwen/Qwen2.5-3B-Instruct (profesor) | 3B | 32.768 tokens (segun ficha oficial de Qwen) | Si, generico | Apache 2.0 (segun ficha oficial de Qwen) | Hugging Face |

No se dispone de datos de benchmarks del profesor Qwen2.5-3B-Instruct en la informacion proporcionada para una comparacion cuantitativa directa. La comparativa con el base es la mas relevante: el adaptador mejora tool calling (xLAM ETC +4,04 puntos, BFCL +6,16 puntos) a costa de MATH-500 (-2,20 puntos) e Irrelevance (-10,07 puntos).

## Limitaciones y advertencias

- Degradacion en deteccion de irrelevancia: la puntuacion de Irrelevance baja del 66,93% al 56,86%, por lo que el modelo puede invocar herramientas cuando no deberia en mas casos que el base.
- Perdida en razonamiento matematico: MATH-500 cae del 15,80% al 13,60%; no es un modelo adecuado para tareas cuantitativas complejas.
- Solo ingles: la model card declara unicamente el idioma ingles; el rendimiento en otros idiomas no esta garantizado.
- Licencia no especificada en la informacion disponible: antes de uso comercial debe verificarse la licencia del adaptador y la del modelo base (Qwen2.5-0.5B-Instruct se distribuye bajo Apache 2.0 segun su ficha oficial, pero este dato no se confirma para el adaptador).
- Riesgo de alucinacion: inherente a modelos de 0,5B; la generacion de argumentos de funciones puede ser incorrecta aunque el nombre de la funcion sea correcto (FNA 90,53% frente a ETC 66,65%).
- Limitacion de prompt: la evaluacion xLAM omitio 743 de 3.289 ejemplos por el limite de 640 tokens, lo que sugiere sensibilidad a prompts largos en el conjunto de evaluacion.
- Es un adaptador, no un modelo completo: requiere cargar el base Qwen2.5-0.5B-Instruct y aplicar PEFT; no puede usarse de forma autonoma.
- Sin datos de latencia, throughput ni cuantizaciones validadas publicadas.
- Repositorio con 0 descargas y 0 likes en el momento de la consulta: no hay evidencia de uso en produccion ni validacion externa independiente.

## Enlaces

- Hugging Face del adaptador: https://huggingface.co/uygarkurt/Qwen2.5-0.5B-Instruct-xlam-mixed-opd7040-lora
- Modelo base: https://huggingface.co/Qwen/Qwen2.5-0.5B-Instruct
- Profesor (destilacion): https://huggingface.co/Qwen/Qwen2.5-3B-Instruct
- Dataset de entrenamiento: https://huggingface.co/datasets/uygarkurt/xlam-tool-calling-mixed
- Repositorio de entrenamiento (Post-Training Lab): https://github.com/uygarkurt/post-training-lab
