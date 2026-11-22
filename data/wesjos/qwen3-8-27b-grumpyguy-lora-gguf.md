# wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF

## Resumen

GrumpyGuy es un adaptador LoRA de estilo conversacional, no un modelo completo, publicado por el usuario wesjos sobre el modelo base Qwen/Qwen3.8-27B. Su función es imponer un registro de "ingeniero senior gruñón": respuestas directas, sin preámbulos, con cierta socarronería y sin cortesías vacías. El adaptador se distribuye en formato GGUF para montarse en tiempo de ejecución sobre un GGUF del modelo base mediante `llama.cpp`, sin fusionar los pesos.

El repositorio contiene únicamente el delta LoRA (128 tensores en f16, unos 21 MB), con rango 16 y alpha 32 embebido, aplicado a las proyecciones `q_proj`, `k_proj`, `v_proj` y `o_proj` de las 16 capas de atención completa del modelo base. Los parámetros entrenables suman 10.485.760, un 0,038 % de los 27,78B del modelo base.

La relevancia es práctica: permite cambiar el tono de un modelo grande sin duplicar su almacenamiento ni reentrenar, y el autor ofrece la misma adaptación en tres formatos (PEFT, GGUF de runtime y pesos fusionados en BF16) para distintos flujos de despliegue. El repo no tiene descargas ni valoraciones en el momento de redactar esta ficha.

## Especificaciones tecnicas

| Parametro | Valor |
|---|---|
| Arquitectura | LoRA sobre transformer Qwen3.8-27B (arquitectura interna `qwen35`); el adaptador no contiene pesos base |
| Parametros totales | 10.485.760 parámetros entrenables (0,038 % del base de 27,78B) |
| Parametros activos | no disponible (no es un MoE) |
| Longitud de contexto | no disponible |
| Tipos de cuantizacion | Adaptador en f16; el base se usa en GGUF UD-Q4_K_M en el flujo verificado por el autor |
| Idiomas soportados | en, zh |
| Licencia | Apache-2.0 |
| Formato de pesos | GGUF (adaptador runtime para llama.cpp); también existe versión PEFT y versión fusionada en BF16 |

## Arquitectura y entrenamiento

El adaptador es un LoRA de rango 16 con alpha 32 embebido, lo que produce una escala de runtime de 2,0. Se aplica exclusivamente sobre las 16 capas de atención completa del modelo base (capas 3, 7, 11, …, 63), en las cuatro proyecciones de atención. Esta elección concentra la adaptación en el enrutado atencional y deja intactas las capas lineales intermedias, coherente con un objetivo de estilo más que de conocimiento.

El GGUF se declara como `general.type = adapter` y `adapter.type = lora`, con 128 tensores en f16. El autor indica que el adaptador se entrenó con una plantilla de chat propia, distribuida en el repo como `chat_template.jinja`, y que la versión fusionada se verificó tensor a tensor contra el base más el delta del adaptador. No se especifican en la información disponible el volumen de datos de entrenamiento, su composición ni si se emplearon técnicas de alineación adicionales como RLHF o DPO.

## Capacidades

- Generación de texto conversacional con un registro seco, directo y sin preámbulos, orientado a respuestas técnicas.
- Explicaciones técnicas por capas: en las demos responde sobre qué capas tocar al entrenar un estilo y por qué.
- Uso de herramientas en entorno de agente: escribe scripts, los ejecuta y corrige errores (demo con `pizza.py` y un fallo de rutas en Windows).
- Recuperación tras error dentro de un bucle agéntico, manteniendo el tono.
- Capacidad multilingüe limitada a inglés y chino, con ejemplos en ambas lenguas en la model card.
- Autodescripción de su propio estilo cuando se le pregunta, incluyendo la distinción entre comportamiento del base y comportamiento adquirido por el adaptador.
- Capacidad de razonamiento y código heredada del modelo base, no evaluada de forma independiente en este repositorio.

## Casos de uso

- Asistentes de ingeniería en terminal: el adaptador encaja en arneses agénticos con tool calling donde se busca concisión y ausencia de cortesías, como muestran las demos de ejecución de scripts y corrección de errores.
- Revisión de código con tono crítico: útil en pipelines de CI/CD o bots de revisión donde un registro brusco y directo reduce ruido y va al problema concreto.
- Chat técnico de soporte interno: respuestas sin preámbulo sobre decisiones de entrenamiento, como qué capas ajustar para modificar estilo.
- Roleplay y personajes: el adaptador está etiquetado como persona y roleplay, y sirve para construir un personaje de ingeniero veterano con voz consistente en inglés y chino.
- Evaluación de técnicas LoRA: al ser un delta pequeño y verificable, sirve como caso de estudio de montaje de adaptadores GGUF en `llama.cpp` sin fusionar pesos.
- Despliegue con huella de almacenamiento mínima: al mantener el adaptador separado (21 MB), se puede alternar entre el modelo base y la variante GrumpyGuy sobre el mismo GGUF cuantizado, útil en entornos con espacio limitado.
- Experimentación con plantillas de chat: el repo incluye `chat_template.jinja`, lo que permite reproducir el formato de entrenamiento en servidores propios.

## Benchmarks y rendimiento

No se han publicado resultados de benchmarks en la informacion disponible.

## Requisitos de hardware

- El adaptador por sí solo ocupa unos 21 MB y no requiere VRAM propia; el coste lo determina el modelo base.
- El flujo verificado por el autor usa el GGUF `Qwen3.8-27B-UD-Q4_K_M.gguf` de unsloth, con un base de 27,78B parámetros; la VRAM necesaria depende de la cuantización y del offloading configurado, y no se detalla en la información disponible.
- GPU recomendadas: no disponible en la información proporcionada; para un base de este tamaño en Q4 se requiere en la práctica una GPU con suficiente memoria o descarga parcial a CPU.
- Despliegue: `llama.cpp` mediante `llama-server` con el flag `--lora` apuntando al GGUF del adaptador; también existe la variante PEFT para montar con `peft` sobre el base en bf16 y la variante fusionada en BF16 (55,6 GB).
- Latencia y throughput: no disponible.

## Comparativa con modelos similares

| Modelo | Tipo | Parámetros | Contexto | Licencia | Disponibilidad |
|---|---|---|---|---|---|
| wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF | LoRA GGUF sobre Qwen3.8-27B | 10,49M entrenables sobre base de 27,78B | no disponible | Apache-2.0 | Hugging Face, llama.cpp |
| wesjos/Qwen3.8-27B-GrumpyGuy-LoRA | LoRA PEFT sobre el mismo base | 10,49M entrenables | no disponible | Apache-2.0 | Hugging Face, PEFT |
| wesjos/Qwen3.8-27B-GrumpyGuy | Pesos fusionados en BF16 | 27,78B | no disponible | Apache-2.0 | Hugging Face, 55,6 GB |
| Qwen/Qwen3.8-27B | Modelo base sin adaptar | 27,78B | no disponible | no disponible en la información | Hugging Face |

Las tres variantes de GrumpyGuy comparten pesos efectivos, según la verificación del autor; la diferencia es el método de carga y el espacio en disco. No se dispone de datos de rendimiento comparado con otros adaptadores de estilo.

## Limitaciones y advertencias

- Es un adaptador, no un modelo autónomo: no puede cargarse sin un GGUF del base Qwen3.8-27B compatible.
- Solo cubre inglés y chino; no hay soporte declarado de castellano.
- El estilo gruñón puede producir respuestas percibidas como bruscas o descorteses en contextos de atención al cliente o documentación pública.
- Riesgo de alucinación heredado del modelo base, no mitigado por el adaptador; el autor no publica evaluaciones de fidelidad.
- No hay datos publicados sobre sesgos, datos de entrenamiento del adaptador ni evaluaciones de seguridad.
- La licencia Apache-2.0 se declara en el repo, pero conviene verificar la licencia del modelo base Qwen3.8-27B antes de uso comercial, ya que no se detalla en la información disponible.
- El adaptador se entrenó con una plantilla de chat concreta (`chat_template.jinja`); usar otra plantilla puede degradar el estilo y el comportamiento.
- El repo figura con 0 descargas y 0 valoraciones, por lo que no hay evidencia de la comunidad sobre su robustez en producción.
- El tamaño del repo aparece como 0.0 GB pese a contener un GGUF de unos 21 MB; posible inconsistencia de metadatos.

## Enlaces

- Repositorio Hugging Face: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF
- Adaptador PEFT original: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA
- Pesos fusionados en BF16: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy
- Modelo base: https://huggingface.co/Qwen/Qwen3.8-27B
- GGUF del base usado en el flujo verificado: https://huggingface.co/unsloth/Qwen3.8-27B-GGUF
- Demo en inglés 1: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF/resolve/main/demos/chat/english-1.png
- Demo en inglés 2: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF/resolve/main/demos/chat/english-2.png
- Demo en chino: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF/resolve/main/demos/chat/chinese.png
- Demo de agente, estilo: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF/resolve/main/demos/agent/style.png
- Demo de agente, uso de herramientas 1: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF/resolve/main/demos/agent/pizza-1.png
- Demo de agente, recuperación de error: https://huggingface.co/wesjos/Qwen3.8-27B-GrumpyGuy-LoRA-GGUF/resolve/main/demos/agent/pizza-2.png
