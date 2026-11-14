# syaikhipin/LFM2.5-1.2B-3D-Coder

## Resumen

LFM2.5-1.2B-3D-Coder es un ajuste fino supervisado (SFT) del modelo base LiquidAI/LFM2.5-1.2B-Base, publicado por el usuario syaikhipin en Hugging Face. Se trata de un modelo de generacion de texto de 1.170.340.608 parametros (aproximadamente 1,17 mil millones) orientado, segun su nombre, a tareas de codigo en el contexto de "3D", aunque la model card no documenta la composicion del dataset de entrenamiento ni el dominio concreto de especializacion. El entrenamiento se realizo con TRL 1.18.0 sobre Transformers 5.14.1 y PyTorch 2.11.0, y el repositorio incluye pesos en formato safetensors con un tamano total de 4,7 GB.

El modelo hereda la arquitectura LFM2 del modelo base de LiquidAI, una familia disenada para eficiencia en dispositivos de borde, pero la informacion disponible no detalla la longitud de contexto, los idiomas soportados ni la licencia efectiva del ajuste. La model card es minima: unicamente indica el procedimiento de entrenamiento (SFT), las versiones de framework y un ejemplo de uso con `pipeline` de Transformers. No se han publicado resultados de benchmarks ni detalles sobre el dataset utilizado.

Su relevancia actual es limitada y de nicho: se trata de un experimento academico (el enlace de Weights & Biases apunta a la Universita degli Studi di Palermo) con cero descargas y cero likes en el momento de la consulta. Resulta util como ejemplo de flujo de trabajo de ajuste fino con TRL sobre un modelo base pequeno, pero no como modelo de produccion sin una evaluacion adicional por parte del usuario.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LFM2 (heredada de LiquidAI/LFM2.5-1.2B-Base; no se detalla en la model card) |
| Parametros totales | 1.170.340.608 |
| Parametros activos | no disponible (no se indica que sea MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | no disponible (pesos publicados en safetensors; no se documentan variantes GGUF/AWQ/GPTQ) |
| Idiomas soportados | no disponible |
| Licencia | no disponible (la model card incluye un campo `licence: license` sin contenido) |
| Formato de pesos | safetensors |

## Arquitectura y entrenamiento

El modelo es un ajuste fino del base LiquidAI/LFM2.5-1.2B-Base, que pertenece a la familia LFM2 de LiquidAI. La model card no describe la arquitectura interna (tipo de atencion, capas, uso de convoluciones o SSM), por lo que no es posible confirmar mas alla de lo que indica el tag `lfm2` y la herencia del modelo base. El numero de parametros (1,17 B) es coherente con un transformer de escala pequena orientado a inferencia eficiente.

El entrenamiento se realizo mediante SFT (supervised fine-tuning) con TRL 1.18.0, usando Transformers 5.14.1, PyTorch 2.11.0, Datasets 5.0.0 y Tokenizers 0.22.2. No se especifica el numero de tokens de entrenamiento, la composicion del dataset, si hubo etapas de RLHF/DPO ni hiperparametros. El run de entrenamiento esta registrado en Weights & Biases bajo el proyecto `fde-3dcoder-portfolio`, lo que sugiere un contexto de portfolio o proyecto academico. No se documentan innovaciones tecnicas adicionales (decodificacion especulativa, atencion lineal, etc.) mas alla de las que pueda aportar el modelo base.

## Capacidades

- Generacion de texto conversacional: la model card incluye un ejemplo de `pipeline` con formato de mensajes (`role`/`content`), lo que indica soporte de plantilla de chat conversacional.
- Especializacion declarada en codigo y "3D": el nombre del modelo sugiere ajuste sobre tareas de codigo en contexto 3D, pero no se documenta el alcance real ni la calidad obtenida.
- Formato de chat: el ejemplo de uso emplea una lista de diccionarios con `role` y `content`, compatible con `apply_chat_template`.
- Tool calling / function calling: no disponible (no documentado).
- Soporte de agentes y razonamiento multi-paso: no disponible (no documentado).
- Capacidades multilingues: no disponible (idiomas no especificados).
- Capacidades especiales (thinking mode, vision, audio): no disponible (no documentado).

## Casos de uso

- Prototipado de asistentes de codigo en local: al ser un modelo de 1,17 B de parametros, puede ejecutarse en GPUs de consumo y usarse para experimentar con generacion de codigo en entornos de desarrollo sin depender de APIs externas. Adecuado por su tamano reducido, aunque requiere validacion de calidad previa.
- Base para experimentos de ajuste fino: sirve como punto de partida para quien quiera reproducir o extender un pipeline SFT con TRL sobre un modelo LFM2, gracias a que la model card documenta las versiones exactas del stack.
- Generacion de texto en aplicaciones de borde: el tamano de 1,17 B permite desplegar el modelo en dispositivos con recursos limitados (portatiles, estaciones de trabajo con GPU modesta) para tareas de generacion de texto no criticas.
- Educacion e investigacion: util como caso de estudio de un ajuste fino academico con seguimiento en Weights & Biases, para analizar curvas de entrenamiento y decisiones de dataset.
- Asistencia en tareas de codigo especificas de dominio 3D: si el ajuste ha sido efectivo, podria emplearse para sugerencias de snippets en pipelines de graficos 3D, aunque no hay evidencia publicada de su rendimiento.
- Generacion de respuestas conversacionales multi-turno: el formato de chat soportado permite integrarlo en prototipos de chatbot, con la cautela de que no se documenta la longitud de contexto efectiva.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- VRAM estimada para inferencia en FP16/BF16: aproximadamente 2,3-2,5 GB solo para pesos, mas overhead de activaciones y cache KV (dependiente de la longitud de contexto, no documentada). En la practica, entre 4 y 8 GB de VRAM para uso comodo.
- Cuantizacion: al no publicarse variantes GGUF/AWQ/GPTQ, la cuantizacion requeriria conversion manual (por ejemplo, a 8 bits o 4 bits con bitsandbytes o llama.cpp).
- GPU recomendadas: cualquier GPU consumer moderna con al menos 8 GB de VRAM (RTX 3060, RTX 4060, RTX 4070, RTX 4090) es suficiente para FP16; tambien cabe en GPUs de datacenter (A100, H100) sin problema, aunque estarian sobredimensionadas.
- Despliegue: compatible con `transformers` (pipeline y `generate`); para servir en produccion se podria usar vLLM o TGI si el modelo base LFM2 esta soportado por esas herramientas, y llama.cpp/Ollama tras conversion a GGUF. No se documenta compatibilidad explicita con estos servidores.
- Latencia y throughput: no disponibles (no se han publicado mediciones).

## Comparativa con modelos similares

| Modelo | Parametros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|
| syaikhipin/LFM2.5-1.2B-3D-Coder | 1,17 B | no disponible | no disponible | Hugging Face (0 descargas) |
| LiquidAI/LFM2.5-1.2B-Base | ~1,2 B | no disponible en esta ficha | no disponible en esta ficha | Hugging Face (modelo base) |
| Qwen2.5-Coder-1.5B | ~1,5 B | 32.768 tokens (segun documentacion publica de Qwen) | Apache-2.0 (segun documentacion publica de Qwen) | Hugging Face |
| DeepSeek-Coder-1.3B | ~1,3 B | 16.384 tokens (segun documentacion publica de DeepSeek) | licencia propia de DeepSeek | Hugging Face |

Nota: los datos de los modelos comparables provienen de su documentacion publica general y no de la informacion proporcionada en esta ficha; se incluyen solo como referencia de categoria. No hay datos de rendimiento del modelo evaluado para comparar benchmarks.

## Limitaciones y advertencias

- Model card minima: no se documentan dataset, hiperparametros, evaluacion ni limitaciones conocidas, lo que impide valorar su calidad de forma objetiva.
- Licencia incierta: el campo de licencia aparece como `licence: license` sin contenido; no se puede confirmar si el uso comercial esta permitido. Es imprescindible contactar con el autor o consultar la licencia del modelo base antes de usarlo en produccion.
- Riesgo de alucinacion: al ser un modelo pequeno (1,17 B) ajustado con SFT sin evaluacion publicada, la probabilidad de generar codigo o texto incorrecto es alta; requiere validacion humana.
- Contexto e idiomas desconocidos: no se especifica la ventana de contexto ni los idiomas soportados, por lo que no se puede garantizar un comportamiento multilingue ni conversaciones largas.
- Cero traccion: 0 descargas y 0 likes en el momento de la consulta; no hay evidencia de uso en la comunidad ni reportes de calidad.
- Origen academico: el run de entrenamiento apunta a un proyecto de portfolio universitario, lo que sugiere que no ha pasado por un proceso de QA de produccion.
- Sin variantes cuantizadas oficiales: el despliegue eficiente en hardware limitado requiere conversion manual y validacion posterior.

## Enlaces

- Modelo en Hugging Face: https://huggingface.co/syaikhipin/LFM2.5-1.2B-3D-Coder
- Modelo base: https://huggingface.co/LiquidAI/LFM2.5-1.2B-Base
- Run de entrenamiento en Weights & Biases: https://wandb.ai/syaikhipin-universit-degli-studi-di-palermo/fde-3dcoder-portfolio/runs/jf45zh7l
- Repositorio TRL: https://github.com/huggingface/trl
