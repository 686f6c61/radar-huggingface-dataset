# xw17/gemma-3-4b-it_SFT_lora_usc-had

## Resumen

`xw17/gemma-3-4b-it_SFT_lora_usc-had` es un modelo publicado en HuggingFace por el usuario xw17 que, por su nombre y por el reducido tamano del repositorio (0,1 GB), parece consistir en un adaptador LoRA de ajuste supervisado (SFT) sobre el modelo base `google/gemma-3-4b-it`. El identificador sugiere que el ajuste se ha realizado sobre un conjunto de datos denominado "usc-had", si bien no se aporta ninguna confirmacion documental al respecto.

La model card del repositorio es la plantilla autogenerada por HuggingFace y no ha sido completada: todos los campos (desarrollador, datos de entrenamiento, licencia, idiomas, evaluacion) figuran como "[More Information Needed]". El repositorio registra 0 descargas y 0 likes en el momento de la consulta, y la fecha de creacion indicada en los metadatos es 2026-10-02, posterior a la fecha de la mayoria de lanzamientos conocidos.

Dado que se trata de un ajuste derivado de Gemma 3 4B IT, sus caracteristicas fundamentales (arquitectura, contexto, capacidades) deben entenderse como heredadas del modelo base de Google, mientras que cualquier especificidad del ajuste (datos, hiperparametros, licencia, rendimiento) no esta disponible en la informacion proporcionada.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer decoder-only (base Gemma 3 4B IT, con atencion local-global intercalada); el artefacto publicado es un adaptador LoRA de SFT |
| Parametros totales | Aproximadamente 4 mil millones en el modelo base; tamano del adaptador no disponible (repo de 0,1 GB) |
| Parametros activos | No aplica (no es un modelo MoE) |
| Longitud de contexto | 128 000 tokens en el modelo base Gemma 3 4B IT; no confirmado para este ajuste |
| Tipos de cuantizacion | No disponible para el adaptador; el modelo base admite bf16, int8 e int4 (checkpoints QAT oficiales) |
| Idiomas soportados | No disponible; el modelo base soporta mas de 140 idiomas |
| Licencia | No disponible (previsiblemente heredada del modelo base: Gemma Terms of Use) |
| Formato de pesos | safetensors (repositorio compatible con transformers) |
| Libreria declarada | transformers |
| Tamano del repositorio | 0,1 GB |

## Arquitectura y entrenamiento

El modelo base Gemma 3 4B IT es un transformer decoder-only desarrollado por Google que combina capas de atencion local (ventana deslizante de 1024 tokens) con capas de atencion global en una proporcion aproximada de 5:1, emplea RMSNorm, RoPE y activacion GeGLU, y alcanza una ventana de contexto de 128 000 tokens. La variante de 4B es multimodal (incorpora un codificador visual) y esta alineada para uso conversacional mediante tecnicas de ajuste finos supervisado y optimizacion por preferencias. Estos datos corresponden a la documentacion publica del modelo base, no al repositorio analizado.

Respecto al ajuste concreto que nos ocupa, no hay informacion disponible sobre el numero de tokens de entrenamiento, la composicion del dataset "usc-had", la configuracion del LoRA (rango, alpha, capas objetivo), la estrategia de alineacion adicional (DPO, RLHF) ni los hiperparametros empleados. El nombre "usc-had" podria corresponder al USC-HAD (University of Southern California Human Activity Dataset), un conjunto de datos de sensores inerciales para reconocimiento de actividad humana, pero esta correspondencia no esta confirmada en la informacion proporcionada y debe tratarse como una hipotesis no verificada.

## Capacidades

- Generacion de texto y conversacion multi-turno, heredadas del modelo base Gemma 3 4B IT.
- Razonamiento basico, matematicas y comprension lectora propias de un modelo de ~4B parametros.
- Procesamiento multimodal (vision) en el modelo base; no confirmado que el adaptador conserve o entrene esta capacidad.
- Soporte de tool calling / function calling en el modelo base; no confirmado para este ajuste.
- Capacidades multilingues del modelo base (mas de 140 idiomas); no verificadas tras el ajuste.
- Posible especializacion en una tarea concreta derivada del dataset "usc-had" (por ejemplo, clasificacion o interpretacion de datos de actividad), sin confirmar.
- Capacidad de razonamiento multi-paso y uso como agente: no disponible / no confirmado.

## Casos de uso

- Asistente conversacional ligero en local: al derivar de un modelo de ~4B parametros, puede desplegarse en una unica GPU de consumo o incluso en CPU cuantizado para aplicaciones de chat con contexto largo (hasta 128K tokens en el base).
- Extraccion estructurada de informacion: uso del ajuste para tareas de clasificacion o etiquetado, por ejemplo sobre datos de sensores o actividad si el dataset "usc-had" efectivamente corresponde a ese dominio.
- Procesamiento de documentos largos con RAG: la ventana de contexto del modelo base permite insertar multiples fragmentos y mantener coherencia en resumen y pregunta-respuesta documental.
- Generacion y asistencia de codigo en entornos con recursos limitados, integr able en editores o pipelines de CI/CD si se confirma el soporte de tool calling.
- Prototipado e investigacion academica: un adaptador LoRA de bajo peso (0,1 GB) es adecuado para reproducir experimentos de ajuste eficiente sin necesidad de almacenar pesos completos.
- Traduccion y tareas multilingues basicas aprovechando la cobertura de idiomas del modelo base.
- Moderacion o clasificacion de texto en produccion de bajo coste, donde un modelo de 4B ofrece un equilibrio entre latencia y calidad.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia del modelo base (4B parametros): en bf16, aproximadamente 8-9 GB incluyendo overhead; en int8, alrededor de 5 GB; en int4, en torno a 2,5-3 GB.
- GPU de consumo compatibles: modelos con 8 GB o mas de VRAM en cuantizacion int4 (RTX 3060 Ti, RTX 4060, RTX 3070); con 12-16 GB se puede ejecutar en bf16 o int8 comodos (RTX 3060 12 GB, RTX 4060 Ti 16 GB, RTX 4070, RTX 4080, RTX 4090).
- GPU de servidor: A100, H100, L40S o L4 pueden alojar el modelo holgadamente; para el modelo base pueden usarse tambien T4 (16 GB) en cuantizacion.
- Al tratarse de un adaptador LoRA, es necesario fusionarlo con el modelo base o cargarlo con la libreria `peft` junto a `google/gemma-3-4b-it`.
- Opciones de despliegue: `transformers`, vLLM, Text Generation Inference (TGI), llama.cpp, Ollama y LM Studio (estos ultimos requieren convertir los pesos a GGUF).
- Latencia y throughput estimados: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| xw17/gemma-3-4b-it_SFT_lora_usc-had | ~4B (base) + adaptador LoRA | 128K (base) | No disponible | HuggingFace (0 descargas) |
| google/gemma-3-4b-it | ~4B | 128K | Gemma Terms of Use | HuggingFace (oficial) |
| meta-llama/Llama-3.2-3B-Instruct | 3B | 128K | Llama 3.2 Community License | HuggingFace (oficial) |
| Qwen/Qwen2.5-3B-Instruct | 3B | 32K (extensible a 128K) | Apache 2.0 | HuggingFace (oficial) |

Nota: los datos de parametros, contexto y licencia de los modelos comparados provienen de sus fichas publicas oficiales; el rendimiento comparado no puede evaluarse por falta de benchmarks del modelo analizado.

## Limitaciones y advertencias

- La model card es una plantilla autogenerada sin completar, por lo que no existe documentacion sobre datos de entrenamiento, sesgos o uso previsto.
- Riesgo de alucinacion inherente a los modelos de ~4B parametros, no mitigado ni evaluado en este ajuste.
- Licencia no declarada: al derivar de Gemma 3, se presume sujeta a los Gemma Terms of Use, que imponen restricciones de uso (politica de uso prohibido) y obligaciones de atribucion; conviene verificar antes de cualquier uso comercial.
- Origen y contenido del dataset "usc-had" no confirmados; podria tratarse de un dominio muy especifico que degrade el rendimiento general del modelo fuera de esa tarea.
- El repositorio tiene 0 descargas y 0 likes, por lo que no existe validacion por parte de la comunidad ni reportes de uso independientes.
- Fecha de creacion en metadatos (2026-10-02) posterior a la fecha de consulta de la mayoria de fuentes, lo que sugiere una posible anomalia o error de registro.
- Al ser un adaptador LoRA, su uso requiere disponer del modelo base y de la libreria `peft`; no es cargable de forma autonoma como un modelo completo.
- No se dispone de informacion sobre el rango del LoRA, el numero de tokens vistos ni si el ajuste preserva las capacidades multilingues y multimodales del base.

## Enlaces

- Modelo en HuggingFace: https://huggingface.co/xw17/gemma-3-4b-it_SFT_lora_usc-had
- Modelo base Gemma 3 4B IT: https://huggingface.co/google/gemma-3-4b-it
- Informe tecnico de Gemma 3: https://arxiv.org/abs/2503.19786
- Referencia citada en la model card (calculadora de impacto de carbono, Lacoste et al. 2019): https://arxiv.org/abs/1910.09700
- Calculadora ML Impact: https://mlco2.github.io/impact
- Dataset USC-HAD (posible origen del nombre, sin confirmar): http://sipi.usc.edu/had/
