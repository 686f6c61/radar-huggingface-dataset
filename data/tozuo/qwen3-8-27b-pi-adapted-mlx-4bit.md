# tozuo/Qwen3.8-27B-pi-adapted-MLX-4bit

## Resumen

Qwen3.8-27B-pi-adapted-MLX-4bit es una cuantizacion affine de 4 bits (group size 64) en formato MLX del modelo Qwen3.8-27B, sobre el que se ha fusionado un adaptador LoRA orientado al agente de programacion pi (earendil-works/pi). Lo publica el usuario tozuo como sustituto directo de TensorFold/Qwen3.8-27B-MLX-4bit: mantiene el mismo layout de shards, nombres de tensores, config, tokenizer y plantilla de chat, y solo cambian los bytes de las 256 proyecciones afectadas por el LoRA.

El modelo resuelve un problema muy concreto: disponer de un checkpoint de Qwen3.8-27B ya adaptado para tareas de agente de codigo y listo para ejecutarse en Apple Silicon con MLX, sin necesidad de aplicar el LoRA en tiempo de carga ni de re-cuantizar. Al estar en 4 bits, el peso completo ocupa aproximadamente 16 GB, lo que lo hace viable en equipos con memoria unificada de gama alta (Mac Studio, MacBook Pro con M-series Pro/Max).

La relevancia es doble: por un lado, demuestra un flujo de fusion de LoRA y re-cuantizacion reproducible y verificado byte a byte contra el checkpoint de referencia; por otro, ofrece una via practica para desplegar un modelo de 27.356.728.560 parametros con capacidades de imagen-texto en hardware de consumo Apple. La licencia es Apache 2.0, igual que el modelo base.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | Transformer hibrido con atencion completa y atencion lineal (64 capas; 16 capas de atencion completa: 3, 7, ..., 63) y torre de vision |
| Parametros totales | 27.356.728.560 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | MLX affine 4-bit, group size 64 |
| Idiomas soportados | no disponible |
| Licencia | Apache 2.0 |
| Formato de pesos | safetensors (MLX), repo de 16,1 GB |

## Arquitectura y entrenamiento

El checkpoint parte de los pesos BF16 de Qwen/Qwen3.8-27B en la revision 37561816. Sobre ellos se fusiona el LoRA de harness-hub/Qwen3.8-27B-pi-adapted (revision e786f849) con rango 32, alpha 64 y factor de escala 2.0, aplicando W' = W + 2.0 * B @ A. Los objetivos de fusion son gate_proj, up_proj y down_proj en las 64 capas, y q_proj, k_proj, v_proj y o_proj en las 16 capas de atencion completa (3, 7, ..., 63). El resto de tensores —torre de vision, embeddings y capas de atencion lineal— se copian sin cambios desde TensorFold/Qwen3.8-27B-MLX-4bit (revision 22d8d538).

La innovacion tecnica del proceso esta en la re-cuantizacion: cada una de las 256 proyecciones fusionadas se cuantiza a MLX affine 4-bit con group size 64 reproduciendo exactamente el redondeo del kernel Metal de MLX 0.32.4 (el cuantizador de CPU redondea ties to even y produce bytes distintos). Como control de calidad, cada proyeccion se re-cuantizo primero desde los pesos BF16 sin fusionar y se verifico que coincidia byte a byte con TensorFold en las 256 (pesos, escalas y sesgos). No se documentan en la informacion disponible el numero de tokens de entrenamiento, la composicion del dataset ni si hubo RLHF o DPO en el modelo base.

## Capacidades

- Generacion de texto y razonamiento conversacional multi-turno (pipeline image-text-to-text).
- Procesamiento de imagen y texto combinados, gracias a la torre de vision heredada del modelo base.
- Generacion y edicion de codigo, con ajuste especifico para el agente de programacion pi.
- Uso como agente de codigo: el LoRA esta entrenado para el flujo de trabajo de pi (earendil-works/pi).
- Modo thinking activado por defecto en la plantilla de chat; se puede desactivar con chat_template_kwargs: {"enable_thinking": false} desde un servidor compatible con OpenAI. La model card del adaptador recomienda desactivarlo.
- Soporte de tool calling y function calling: no disponible en la informacion proporcionada.
- Capacidades multilingues: no disponible en la informacion proporcionada.

## Casos de uso

- Agente de programacion en local sobre Apple Silicon: el checkpoint esta ajustado para pi y se ejecuta con MLX en equipos con unos 16 GB de memoria unificada, lo que permite tener un agente de codigo funcionando sin conexion ni coste de API.
- Asistencia de codigo en el IDE o terminal: al ser sustituto directo de TensorFold/Qwen3.8-27B-MLX-4bit, se puede intercambiar en pipelines existentes de MLX sin cambiar el tokenizer ni la plantilla de chat.
- Tareas de imagen-texto: la torre de vision permite describir capturas, leer diagramas o interpretar interfaces, util para automatizar documentacion tecnica a partir de imagenes.
- Prototipado de agentes multi-paso en un portatil: el modo thinking (activado por defecto, desactivable) permite alternar entre razonamiento extendido y respuestas rapidas segun la fase del flujo.
- Evaluacion de adaptadores LoRA fusionados: el repositorio sirve como referencia reproducible de como fusionar y re-cuantizar sin degradar la cuantizacion de referencia, util para equipos que preparan sus propios checkpoints MLX.
- Despliegue en estaciones de trabajo de desarrollo con memoria unificada limitada: al ocupar unos 16 GB de pesos mas la cache KV, encaja en configuraciones donde un modelo de 27B en BF16 no cabria.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- Memoria: aproximadamente 16 GB de memoria unificada para los pesos, mas la cache KV. La model card no cuantifica el tamano de la cache KV.
- Hardware objetivo: Apple Silicon con MLX (se ha verificado solo bajo el motor de TensorFold en cargas de agente).
- GPU dedicadas (A100, H100, RTX 4090): no disponible; el formato MLX esta pensado para memoria unificada de Apple, no para CUDA.
- Compatibilidad con GPU de consumo: si, en equipos Apple con memoria unificada suficiente (se requiere holgura por encima de los 16 GB de pesos).
- Despliegue: mlx-vlm (python -m mlx_vlm.generate) segun la model card, aunque esa ruta no fue probada por el autor; el motor TensorFold es el unico verificado. vLLM, llama.cpp, Ollama y TGI no estan soportados por el formato MLX.
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Cuantizacion | Licencia | Notas |
|---|---|---|---|---|---|
| tozuo/Qwen3.8-27B-pi-adapted-MLX-4bit | 27.356.728.560 | no disponible | MLX 4-bit, group size 64 | Apache 2.0 | LoRA de pi fusionado; sustituto directo del checkpoint TensorFold |
| TensorFold/Qwen3.8-27B-MLX-4bit | 27.356.728.560 (mismo base) | no disponible | MLX 4-bit, group size 64 | Apache 2.0 | Checkpoint de referencia sin el ajuste de pi; misma estructura de shards |
| harness-hub/Qwen3.8-27B-pi-adapted | 27.356.728.560 (mismo base) | no disponible | BF16 con LoRA | Apache 2.0 | Adaptador sin fusionar; requiere aplicar el LoRA en carga |
| Qwen/Qwen3.8-27B | 27.356.728.560 | no disponible | BF16 | Apache 2.0 | Modelo base original |

## Limitaciones y advertencias

- Solo se ha verificado bajo el motor TensorFold en cargas de agente; la ruta mlx-vlm no fue probada por el autor.
- El modo thinking viene activado por defecto en la plantilla de chat, mientras que la model card del adaptador recomienda desactivarlo; hay que enviar chat_template_kwargs: {"enable_thinking": false} de forma explicita.
- El ajuste LoRA esta orientado al agente pi; su comportamiento en tareas genericas puede diferir del modelo base.
- Sesgos conocidos: no disponible en la informacion proporcionada.
- Riesgo de alucinacion: no cuantificado en la informacion disponible; aplican los riesgos habituales de un modelo de lenguaje de 27B.
- Idiomas soportados y longitud de contexto: no disponibles; conviene consultar la model card de Qwen/Qwen3.8-27B antes de usarlo en produccion multilingue o con contextos largos.
- Licencia Apache 2.0: permite uso comercial, pero se deben mantener los avisos de atribucion de la seccion 4(b), tal como hace el propio autor al documentar los cambios respecto a los modelos upstream.
- Al ser una cuantizacion de 4 bits, cabe esperar una perdida de precision frente al BF16, aunque el autor verifica la equivalencia byte a byte con el checkpoint cuantizado de referencia, no con el BF16.

## Enlaces

- Hugging Face: https://huggingface.co/tozuo/Qwen3.8-27B-pi-adapted-MLX-4bit
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- Adaptador LoRA de origen: https://huggingface.co/harness-hub/Qwen3.8-27B-pi-adapted
- Checkpoint MLX de referencia: https://huggingface.co/TensorFold/Qwen3.8-27B-MLX-4bit
- Agente pi: https://github.com/earendil-works/pi
- mlx-vlm: https://github.com/Blaizzy/mlx-vlm
